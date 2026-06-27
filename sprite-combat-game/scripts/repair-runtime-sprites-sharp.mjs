import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const repoRoot = process.cwd();
const publicRoot = path.join(repoRoot, 'public');
const args = parseArgs(process.argv.slice(2));
const write = Boolean(args.write);
const dryRun = !write || Boolean(args['dry-run']);
const shouldWrite = write && !dryRun;
const alphaThreshold = num('alpha-threshold', 8, 0, 255);
const maxHoleArea = num('max-hole-area', 48, 1, 10000);
const maxEdgeHoleArea = num('max-edge-hole-area', 24, 1, 10000);
const haloThreshold = num('halo-threshold', 210, 1, 255);
const maxJunkArea = num('max-junk-area', 6, 0, 10000);
const fallbackFill = parseHex(args['fallback-fill'] ?? '#1b1b24');
const activeEntities = ['ronin', 'supreme-emperor', 'monkey-grunt', 'striker-monkey'];
const roninActiveAnimations = ['idle', 'walk', 'dash', 'hit_react', 'recovery', 'stand_up', 'jab', 'cross', 'roundhouse_kick', 'side_kick', 'density'];

if (!args.target && !args['target-folder']) fail('Use --target active or --target-folder <folder>.');
if (args.target && args.target !== 'active') fail('Only --target active is supported. Use --target-folder for a folder.');
if (write && !args.backup) fail('Write mode requires --backup.');

const files = args['target-folder'] ? await filesFromFolder(args['target-folder']) : await activeRuntimeFiles();
if (files.length === 0) fail('No PNG files found for repair target.');

const reports = [];
const beforeFrames = [];
const afterFrames = [];
for (const filePath of files) {
  const before = await readPng(filePath);
  const after = clone(before);
  const beforeStats = stats(before);
  const changed = repair(after);
  const afterStats = stats(after);
  const changedPixels = Object.values(changed).reduce((sum, value) => sum + value, 0);
  if (shouldWrite && changedPixels > 0) {
    await backup(filePath);
    await fs.writeFile(filePath, await sharp(after.data, { raw: rawInfo(after) }).png().toBuffer());
  }
  if (args.preview) {
    beforeFrames.push({ filePath, image: before });
    afterFrames.push({ filePath, image: after });
  }
  const report = { file: rel(filePath), mode: dryRun ? 'dry-run' : 'write', changedPixels, before: beforeStats, after: afterStats, ...changed };
  reports.push(report);
  console.log(`${report.file}: ${changedPixels} pixel(s) ${dryRun ? 'would change' : 'changed'}; holes ${beforeStats.holes}->${afterStats.holes}, halo ${beforeStats.halo}->${afterStats.halo}, junk ${beforeStats.junk}->${afterStats.junk}`);
}

const summary = {
  generatedAt: new Date().toISOString(),
  target: args.target ?? rel(path.resolve(repoRoot, args['target-folder'])),
  mode: dryRun ? 'dry-run' : 'write',
  options: { alphaThreshold, maxHoleArea, maxEdgeHoleArea, haloThreshold, maxJunkArea, fillColor: args['fill-color'] ?? 'auto', fallbackFill: rgbToHex(fallbackFill) },
  filesScanned: reports.length,
  changedFiles: reports.filter((report) => report.changedPixels > 0).length,
  changedPixels: reports.reduce((sum, report) => sum + report.changedPixels, 0),
  files: reports,
};

if (args.report) {
  const reportPath = path.join(publicRoot, 'sprites', 'qa', `${slug(summary.target)}-sharp-repair-report.json`);
  await fs.mkdir(path.dirname(reportPath), { recursive: true });
  await fs.writeFile(reportPath, `${JSON.stringify(summary, null, 2)}\n`);
  console.log(`Report: ${rel(reportPath)}`);
}

if (args.preview) {
  const previewDir = path.join(publicRoot, 'sprites', 'qa', `${slug(summary.target)}-sharp-repair-preview`);
  await fs.mkdir(previewDir, { recursive: true });
  for (const [name, color] of Object.entries({ white: [255, 255, 255, 255], dark: [17, 18, 22, 255], teal: [0, 124, 128, 255], red: [150, 24, 32, 255] })) {
    await writeSheet(path.join(previewDir, `before-${name}.png`), beforeFrames, color);
    await writeSheet(path.join(previewDir, `after-${name}.png`), afterFrames, color);
  }
  console.log(`Preview: ${rel(previewDir)}`);
}

async function activeRuntimeFiles() {
  const out = [];
  for (const entity of activeEntities) {
    const manifest = await readManifest(entity);
    if (!manifest) continue;
    const animations = entity === 'ronin' ? roninActiveAnimations : Object.keys(manifest.animations ?? {});
    for (const animation of animations) {
      const frameCount = manifest.animations?.[animation]?.frames ?? 0;
      for (let index = 1; index <= frameCount; index += 1) {
        const frame = `${String(index).padStart(4, '0')}.png`;
        const file = await firstExisting([
          path.join(publicRoot, 'sprites', 'manual-overrides', entity, animation, frame),
          path.join(publicRoot, 'sprites', 'frames-alpha-repaired', entity, animation, frame),
          path.join(publicRoot, 'sprites', 'frames-cleaned', entity, animation, frame),
          path.join(publicRoot, 'sprites', 'frames-pack', entity, animation, frame),
          path.join(publicRoot, 'sprites', 'frames', entity, animation, frame),
        ]);
        if (file) out.push(file);
      }
    }
  }
  return [...new Set(out)].sort();
}

async function readManifest(entity) {
  try {
    return JSON.parse(await fs.readFile(path.join(publicRoot, 'sprite-packs', entity, 'character.json'), 'utf8'));
  } catch {
    console.log(`${entity}: skipped active target because it has no per-frame sprite-pack manifest.`);
    return undefined;
  }
}

async function filesFromFolder(folder) {
  const dir = path.resolve(repoRoot, folder);
  if (!inside(repoRoot, dir)) fail(`Target folder must stay inside repo: ${folder}`);
  return (await fs.readdir(dir, { withFileTypes: true }))
    .filter((entry) => entry.isFile() && entry.name.toLowerCase().endsWith('.png'))
    .map((entry) => path.join(dir, entry.name))
    .sort();
}

async function firstExisting(paths) {
  for (const file of paths) {
    try {
      await fs.access(file);
      return file;
    } catch {}
  }
  return undefined;
}

async function readPng(filePath) {
  const { data, info } = await sharp(filePath).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  return { width: info.width, height: info.height, channels: 4, data: Buffer.from(data) };
}

function repair(image) {
  const holes = findHoles(image).filter((hole) => hole.area <= maxHoleArea);
  let filledHolePixels = 0;
  for (const hole of holes) {
    for (const pixel of hole.pixels) {
      const [x, y] = xy(image, pixel);
      setPixel(image, pixel, darkNeighbor(image, x, y) ?? fallbackFill, 255);
      filledHolePixels += 1;
    }
  }

  let edgeHolePixels = 0;
  for (const hole of findEdgeCuts(image).filter((hole) => hole.area <= maxEdgeHoleArea)) {
    for (const pixel of hole.pixels) {
      const [x, y] = xy(image, pixel);
      setPixel(image, pixel, darkNeighbor(image, x, y) ?? fallbackFill, 255);
      edgeHolePixels += 1;
    }
  }

  let haloPixelsDarkened = 0;
  for (let y = 0; y < image.height; y += 1) {
    for (let x = 0; x < image.width; x += 1) {
      const pixel = y * image.width + x;
      const offset = pixel * 4;
      if (image.data[offset + 3] <= alphaThreshold || !isHalo([image.data[offset], image.data[offset + 1], image.data[offset + 2]]) || !nearTransparent(image, x, y, 1)) continue;
      setPixel(image, pixel, darkNeighbor(image, x, y) ?? fallbackFill, image.data[offset + 3]);
      haloPixelsDarkened += 1;
    }
  }

  let junkPixelsCleared = 0;
  for (const component of findJunk(image)) {
    for (const pixel of component.pixels) {
      setPixel(image, pixel, [0, 0, 0], 0);
      junkPixelsCleared += 1;
    }
  }

  return { filledHolePixels, edgeHolePixels, haloPixelsDarkened, junkPixelsCleared };
}

function stats(image) {
  return { holes: findHoles(image).length, holePixels: findHoles(image).reduce((sum, hole) => sum + hole.area, 0), halo: countHalo(image), junk: findJunk(image).length };
}

function findHoles(image) {
  const outside = outsideTransparent(image);
  const visited = new Uint8Array(image.width * image.height);
  const holes = [];
  for (let y = 0; y < image.height; y += 1) {
    for (let x = 0; x < image.width; x += 1) {
      const pixel = y * image.width + x;
      if (visited[pixel] || outside[pixel] || opaque(image, x, y)) continue;
      const hole = floodTransparent(image, x, y, visited, outside);
      if (hole && confidence(image, hole) >= 0.42) holes.push(hole);
    }
  }
  return holes;
}

function findEdgeCuts(image) {
  const holes = [];
  const visited = new Uint8Array(image.width * image.height);
  for (let y = 1; y < image.height - 1; y += 1) {
    for (let x = 1; x < image.width - 1; x += 1) {
      const pixel = y * image.width + x;
      if (visited[pixel] || opaque(image, x, y) || !nearOpaque(image, x, y, 1) || !nearTransparent(image, x, y, 2)) continue;
      const cut = floodTransparent(image, x, y, visited);
      if (cut && confidence(image, cut) >= 0.28) holes.push(cut);
    }
  }
  return holes;
}

function outsideTransparent(image) {
  const outside = new Uint8Array(image.width * image.height);
  const queue = [];
  for (let x = 0; x < image.width; x += 1) queue.push([x, 0], [x, image.height - 1]);
  for (let y = 1; y < image.height - 1; y += 1) queue.push([0, y], [image.width - 1, y]);
  while (queue.length) {
    const [x, y] = queue.pop();
    if (x < 0 || y < 0 || x >= image.width || y >= image.height) continue;
    const pixel = y * image.width + x;
    if (outside[pixel] || opaque(image, x, y)) continue;
    outside[pixel] = 1;
    queue.push([x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]);
  }
  return outside;
}

function floodTransparent(image, startX, startY, visited, outside) {
  const queue = [[startX, startY]];
  const pixels = [];
  let minX = startX, minY = startY, maxX = startX, maxY = startY;
  while (queue.length) {
    const [x, y] = queue.pop();
    if (x < 0 || y < 0 || x >= image.width || y >= image.height) continue;
    const pixel = y * image.width + x;
    if (visited[pixel] || outside?.[pixel] || opaque(image, x, y)) continue;
    visited[pixel] = 1;
    pixels.push(pixel);
    minX = Math.min(minX, x); minY = Math.min(minY, y); maxX = Math.max(maxX, x); maxY = Math.max(maxY, y);
    queue.push([x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]);
  }
  return pixels.length ? { pixels, area: pixels.length, minX, minY, maxX, maxY } : undefined;
}

function confidence(image, hole) {
  let checked = 0, solid = 0;
  for (let y = hole.minY - 1; y <= hole.maxY + 1; y += 1) {
    for (let x = hole.minX - 1; x <= hole.maxX + 1; x += 1) {
      if (x < 0 || y < 0 || x >= image.width || y >= image.height) continue;
      if (x >= hole.minX && x <= hole.maxX && y >= hole.minY && y <= hole.maxY) continue;
      checked += 1;
      if (opaque(image, x, y)) solid += 1;
    }
  }
  return solid / Math.max(1, checked);
}

function findJunk(image) {
  if (maxJunkArea <= 0) return [];
  const visited = new Uint8Array(image.width * image.height);
  const components = [];
  for (let y = 0; y < image.height; y += 1) {
    for (let x = 0; x < image.width; x += 1) {
      const pixel = y * image.width + x;
      if (visited[pixel] || !opaque(image, x, y)) continue;
      components.push({ pixels: floodOpaque(image, x, y, visited) });
    }
  }
  const largest = Math.max(0, ...components.map((component) => component.pixels.length));
  return components.filter((component) => component.pixels.length < largest && component.pixels.length <= maxJunkArea);
}

function floodOpaque(image, startX, startY, visited) {
  const queue = [[startX, startY]];
  const pixels = [];
  while (queue.length) {
    const [x, y] = queue.pop();
    if (x < 0 || y < 0 || x >= image.width || y >= image.height) continue;
    const pixel = y * image.width + x;
    if (visited[pixel] || !opaque(image, x, y)) continue;
    visited[pixel] = 1;
    pixels.push(pixel);
    queue.push([x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]);
  }
  return pixels;
}

function darkNeighbor(image, x, y) {
  let best, score = Infinity;
  for (let radius = 1; radius <= 5; radius += 1) {
    for (let dy = -radius; dy <= radius; dy += 1) {
      for (let dx = -radius; dx <= radius; dx += 1) {
        const nx = x + dx, ny = y + dy;
        if (nx < 0 || ny < 0 || nx >= image.width || ny >= image.height || !opaque(image, nx, ny)) continue;
        const rgb = rgbAt(image, ny * image.width + nx);
        if (isHalo(rgb)) continue;
        const nextScore = avg(rgb) + Math.abs(dx) + Math.abs(dy);
        if (nextScore < score) { score = nextScore; best = rgb; }
      }
    }
    if (best) return best;
  }
  return undefined;
}

function countHalo(image) {
  let total = 0;
  for (let y = 0; y < image.height; y += 1) {
    for (let x = 0; x < image.width; x += 1) {
      const pixel = y * image.width + x, offset = pixel * 4;
      if (image.data[offset + 3] > alphaThreshold && isHalo(rgbAt(image, pixel)) && nearTransparent(image, x, y, 1)) total += 1;
    }
  }
  return total;
}

function isHalo(rgb) {
  const [r, g, b] = rgb, spread = Math.max(...rgb) - Math.min(...rgb);
  return (avg(rgb) >= haloThreshold && spread <= 48) || (r >= 145 && g >= 180 && b >= 200);
}

function nearTransparent(image, x, y, radius) {
  for (let dy = -radius; dy <= radius; dy += 1) for (let dx = -radius; dx <= radius; dx += 1) {
    if (dx === 0 && dy === 0) continue;
    const nx = x + dx, ny = y + dy;
    if (nx < 0 || ny < 0 || nx >= image.width || ny >= image.height) return true;
    if (!opaque(image, nx, ny)) return true;
  }
  return false;
}

function nearOpaque(image, x, y, radius) {
  for (let dy = -radius; dy <= radius; dy += 1) for (let dx = -radius; dx <= radius; dx += 1) {
    const nx = x + dx, ny = y + dy;
    if (nx >= 0 && ny >= 0 && nx < image.width && ny < image.height && opaque(image, nx, ny)) return true;
  }
  return false;
}

async function writeSheet(filePath, frames, bg) {
  if (frames.length === 0) return;
  const gap = 8, width = frames.reduce((sum, frame) => sum + frame.image.width, 0) + gap * (frames.length - 1), height = Math.max(...frames.map((frame) => frame.image.height));
  const sheet = Buffer.alloc(width * height * 4);
  for (let pixel = 0; pixel < width * height; pixel += 1) setRaw(sheet, pixel, bg, bg[3]);
  let xOffset = 0;
  for (const frame of frames) {
    blit(sheet, width, frame.image, xOffset, 0);
    xOffset += frame.image.width + gap;
  }
  await fs.writeFile(filePath, await sharp(sheet, { raw: { width, height, channels: 4 } }).png().toBuffer());
}

function blit(target, targetWidth, source, xOffset, yOffset) {
  for (let y = 0; y < source.height; y += 1) for (let x = 0; x < source.width; x += 1) {
    const srcPixel = y * source.width + x, src = srcPixel * 4, alpha = source.data[src + 3] / 255;
    if (alpha <= 0) continue;
    const dstPixel = (y + yOffset) * targetWidth + x + xOffset, dst = dstPixel * 4, inverse = 1 - alpha;
    target[dst] = Math.round(source.data[src] * alpha + target[dst] * inverse);
    target[dst + 1] = Math.round(source.data[src + 1] * alpha + target[dst + 1] * inverse);
    target[dst + 2] = Math.round(source.data[src + 2] * alpha + target[dst + 2] * inverse);
    target[dst + 3] = Math.max(target[dst + 3], source.data[src + 3]);
  }
}

async function backup(filePath) {
  const backupPath = path.join(path.dirname(filePath), '.repair-runtime-backup', path.basename(filePath));
  await fs.mkdir(path.dirname(backupPath), { recursive: true });
  await fs.copyFile(filePath, backupPath);
}

function rawInfo(image) { return { width: image.width, height: image.height, channels: 4 }; }
function clone(image) { return { ...image, data: Buffer.from(image.data) }; }
function opaque(image, x, y) { return image.data[(y * image.width + x) * 4 + 3] > alphaThreshold; }
function rgbAt(image, pixel) { const offset = pixel * 4; return [image.data[offset], image.data[offset + 1], image.data[offset + 2]]; }
function setPixel(image, pixel, rgb, alpha) { setRaw(image.data, pixel, rgb, alpha); }
function setRaw(data, pixel, rgb, alpha) { const offset = pixel * 4; data[offset] = rgb[0]; data[offset + 1] = rgb[1]; data[offset + 2] = rgb[2]; data[offset + 3] = alpha; }
function xy(image, pixel) { return [pixel % image.width, Math.floor(pixel / image.width)]; }
function avg(rgb) { return (rgb[0] + rgb[1] + rgb[2]) / 3; }
function rel(filePath) { return path.relative(repoRoot, filePath).replaceAll(path.sep, '/'); }
function slug(value) { return value.replace(/[^a-z0-9]+/giu, '-').replace(/^-|-$/gu, '').toLowerCase() || 'target'; }
function rgbToHex(rgb) { return `#${rgb.map((value) => value.toString(16).padStart(2, '0')).join('')}`; }
function parseHex(value) { const match = /^#?([0-9a-f]{6})$/iu.exec(value); if (!match) fail('--fallback-fill must be a hex color.'); return [0, 2, 4].map((i) => Number.parseInt(match[1].slice(i, i + 2), 16)); }
function inside(parent, child) { const relative = path.relative(parent, child); return relative === '' || (!relative.startsWith('..') && !path.isAbsolute(relative)); }
function num(name, fallback, min, max) { const value = Number(args[name] ?? fallback); if (!Number.isFinite(value) || value < min || value > max) fail(`--${name} must be between ${min} and ${max}.`); return value; }
function parseArgs(argv) {
  const parsed = {};
  const booleans = new Set(['dry-run', 'write', 'backup', 'report', 'preview']);
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (!arg.startsWith('--')) fail(`Unexpected argument: ${arg}`);
    const key = arg.slice(2);
    if (booleans.has(key)) { parsed[key] = true; continue; }
    const value = argv[index + 1];
    if (!value || value.startsWith('--')) fail(`Missing value for --${key}`);
    parsed[key] = value;
    index += 1;
  }
  return parsed;
}
function fail(message) { console.error(message); process.exit(1); }
