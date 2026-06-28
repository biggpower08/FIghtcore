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
const closeRadius = Math.round(num('close-radius', 4, 0, 8));
const maxGapArea = Math.round(num('max-gap-area', 800, 1, 20000));
const fillColor = parseHex(args['fill-color'] ?? '#000000');
const repairHalos = Boolean(args['repair-halos']);
const activeEntities = ['ronin', 'supreme-emperor', 'monkey-grunt', 'striker-monkey'];
const roninActiveAnimations = ['idle', 'walk', 'dash', 'hit_react', 'recovery', 'stand_up', 'jab', 'cross', 'roundhouse_kick', 'side_kick', 'density'];
const previewBackgrounds = {
  transparent: [0, 0, 0, 0],
  white: [255, 255, 255, 255],
  teal: [0, 124, 128, 255],
  red: [150, 24, 32, 255],
  dark: [17, 18, 22, 255],
};

if (!args.target && !args['target-folder']) fail('Use --target active or --target-folder <folder>.');
if (args.target && args.target !== 'active') fail('Only --target active is supported. Use --target-folder for a focused folder.');
if (args.target && args['target-folder']) fail('Use either --target active or --target-folder, not both.');
if (write && !args.backup) fail('Write mode requires --backup.');

const files = args['target-folder'] ? await filesFromFolder(args['target-folder']) : await activeRuntimeFiles();
if (files.length === 0) fail('No PNG files found for black-gap repair target.');

const reports = [];
const beforeFrames = [];
const afterFrames = [];

for (const filePath of files) {
  const before = await readPng(filePath);
  const after = clone(before);
  const changed = fillBlackGaps(after);
  const changedPixels = changed.filledTransparentPixels + changed.filledClosedGapPixels + changed.haloPixelsBlackened;
  if (shouldWrite && changedPixels > 0) {
    await backup(filePath);
    await fs.writeFile(filePath, await sharp(after.data, { raw: rawInfo(after) }).png().toBuffer());
  }
  if (args.preview) {
    beforeFrames.push({ image: before });
    afterFrames.push({ image: after });
  }
  const report = {
    file: rel(filePath),
    mode: dryRun ? 'dry-run' : 'write',
    changedPixels,
    ...changed,
  };
  reports.push(report);
  console.log(
    `${report.file}: ${changedPixels} pixel(s) ${dryRun ? 'would change' : 'changed'}; ` +
      `filled transparent ${changed.filledTransparentPixels}, closed gaps ${changed.filledClosedGapPixels}, halos ${changed.haloPixelsBlackened}`,
  );
}

const targetLabel = args.target ?? rel(path.resolve(repoRoot, args['target-folder']));
const summary = {
  generatedAt: new Date().toISOString(),
  target: targetLabel,
  mode: dryRun ? 'dry-run' : 'write',
  options: { alphaThreshold, closeRadius, maxGapArea, fillColor: rgbToHex(fillColor), repairHalos },
  filesScanned: reports.length,
  changedFiles: reports.filter((report) => report.changedPixels > 0).length,
  changedPixels: reports.reduce((sum, report) => sum + report.changedPixels, 0),
  files: reports,
};

if (args.report) {
  const reportPath = path.join(publicRoot, 'sprites', 'qa', `${slug(targetLabel)}-black-gap-report.json`);
  await fs.mkdir(path.dirname(reportPath), { recursive: true });
  await fs.writeFile(reportPath, `${JSON.stringify(summary, null, 2)}\n`);
  console.log(`Report: ${rel(reportPath)}`);
}

if (args.preview) {
  const previewDir = path.join(publicRoot, 'sprites', 'qa', `${slug(targetLabel)}-black-gap-preview`);
  await fs.mkdir(previewDir, { recursive: true });
  for (const [name, color] of Object.entries(previewBackgrounds)) {
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

function fillBlackGaps(image) {
  const originalMask = maskFromImage(image);
  const bodyMask = keepBodyMask(originalMask, image.width, image.height);
  const closedMask = closeMask(bodyMask, image.width, image.height, closeRadius);
  const holeRepairMask = new Uint8Array(originalMask.length);
  const closeRepairMask = new Uint8Array(originalMask.length);

  let filledTransparentPixels = 0;
  for (const gap of enclosedTransparentGaps(bodyMask, image.width, image.height)) {
    if (gap.pixels.length > maxGapArea) continue;
    for (const pixel of gap.pixels) {
      holeRepairMask[pixel] = 1;
    }
  }

  let filledClosedGapPixels = 0;
  for (const component of addedComponents(closedMask, originalMask, image.width, image.height)) {
    if (component.pixels.length > maxGapArea) continue;
    if (!touchesBody(component.pixels, originalMask, image.width, image.height)) continue;
    for (const pixel of component.pixels) {
      closeRepairMask[pixel] = 1;
    }
  }

  for (let pixel = 0; pixel < originalMask.length; pixel += 1) {
    if (originalMask[pixel]) continue;
    if (!holeRepairMask[pixel] && !closeRepairMask[pixel]) continue;
    setPixel(image, pixel, fillColor, 255);
    if (holeRepairMask[pixel]) filledTransparentPixels += 1;
    else filledClosedGapPixels += 1;
  }

  let haloPixelsBlackened = 0;
  if (repairHalos) {
    for (let y = 0; y < image.height; y += 1) {
      for (let x = 0; x < image.width; x += 1) {
        const pixel = y * image.width + x;
        const offset = pixel * 4;
        if (image.data[offset + 3] <= alphaThreshold) continue;
        if (!isHalo(rgbAt(image, pixel)) || !nearTransparent(image, x, y, 1)) continue;
        setPixel(image, pixel, fillColor, Math.max(180, image.data[offset + 3]));
        haloPixelsBlackened += 1;
      }
    }
  }

  return { filledTransparentPixels, filledClosedGapPixels, haloPixelsBlackened };
}

function maskFromImage(image) {
  const mask = new Uint8Array(image.width * image.height);
  for (let pixel = 0; pixel < mask.length; pixel += 1) {
    if (image.data[pixel * 4 + 3] > alphaThreshold) mask[pixel] = 1;
  }
  return mask;
}

function keepBodyMask(mask, width, height) {
  const visited = new Uint8Array(mask.length);
  const components = [];
  for (let pixel = 0; pixel < mask.length; pixel += 1) {
    if (mask[pixel] && !visited[pixel]) components.push(flood(mask, width, height, pixel, visited, 1));
  }
  if (components.length === 0) return mask;
  const largest = Math.max(...components.map((component) => component.pixels.length));
  const keep = new Uint8Array(mask.length);
  for (const component of components) {
    if (component.pixels.length === largest || component.pixels.length >= Math.max(24, largest * 0.04)) {
      for (const pixel of component.pixels) keep[pixel] = 1;
    }
  }
  return keep;
}

function closeMask(mask, width, height, radius) {
  if (radius <= 0) return mask;
  return erode(dilate(mask, width, height, radius), width, height, radius);
}

function dilate(mask, width, height, radius) {
  let current = mask;
  for (let step = 0; step < radius; step += 1) {
    const next = new Uint8Array(current);
    for (let y = 0; y < height; y += 1) {
      for (let x = 0; x < width; x += 1) {
        const pixel = y * width + x;
        if (!current[pixel]) continue;
        forNeighbors(width, height, x, y, (neighbor) => {
          next[neighbor] = 1;
        });
      }
    }
    current = next;
  }
  return current;
}

function erode(mask, width, height, radius) {
  let current = mask;
  for (let step = 0; step < radius; step += 1) {
    const next = new Uint8Array(current);
    for (let y = 0; y < height; y += 1) {
      for (let x = 0; x < width; x += 1) {
        const pixel = y * width + x;
        if (!current[pixel]) continue;
        let keep = true;
        forNeighbors(width, height, x, y, (neighbor) => {
          if (!current[neighbor]) keep = false;
        });
        if (!keep) next[pixel] = 0;
      }
    }
    current = next;
  }
  return current;
}

function enclosedTransparentGaps(mask, width, height) {
  const outside = outsideTransparent(mask, width, height);
  const visited = new Uint8Array(mask.length);
  const gaps = [];
  for (let pixel = 0; pixel < mask.length; pixel += 1) {
    if (mask[pixel] || outside[pixel] || visited[pixel]) continue;
    const gap = flood(mask, width, height, pixel, visited, 0);
    if (gap.pixels.length > 0) gaps.push(gap);
  }
  return gaps;
}

function outsideTransparent(mask, width, height) {
  const outside = new Uint8Array(mask.length);
  const queue = [];
  for (let x = 0; x < width; x += 1) queue.push(x, (height - 1) * width + x);
  for (let y = 1; y < height - 1; y += 1) queue.push(y * width, y * width + width - 1);
  while (queue.length > 0) {
    const pixel = queue.pop();
    if (pixel === undefined || pixel < 0 || pixel >= mask.length || outside[pixel] || mask[pixel]) continue;
    outside[pixel] = 1;
    const x = pixel % width;
    const y = Math.floor(pixel / width);
    if (x > 0) queue.push(pixel - 1);
    if (x < width - 1) queue.push(pixel + 1);
    if (y > 0) queue.push(pixel - width);
    if (y < height - 1) queue.push(pixel + width);
  }
  return outside;
}

function addedComponents(closedMask, originalMask, width, height) {
  const added = new Uint8Array(closedMask.length);
  for (let pixel = 0; pixel < added.length; pixel += 1) {
    if (closedMask[pixel] && !originalMask[pixel]) added[pixel] = 1;
  }
  const visited = new Uint8Array(added.length);
  const components = [];
  for (let pixel = 0; pixel < added.length; pixel += 1) {
    if (added[pixel] && !visited[pixel]) components.push(flood(added, width, height, pixel, visited, 1));
  }
  return components;
}

function touchesBody(pixels, bodyMask, width, height) {
  for (const pixel of pixels) {
    const x = pixel % width;
    const y = Math.floor(pixel / width);
    let touching = false;
    forNeighbors(width, height, x, y, (neighbor) => {
      if (bodyMask[neighbor]) touching = true;
    });
    if (touching) return true;
  }
  return false;
}

function flood(mask, width, height, start, visited, value) {
  const queue = [start];
  const pixels = [];
  while (queue.length > 0) {
    const pixel = queue.pop();
    if (pixel === undefined || pixel < 0 || pixel >= mask.length || visited[pixel] || mask[pixel] !== value) continue;
    visited[pixel] = 1;
    pixels.push(pixel);
    const x = pixel % width;
    const y = Math.floor(pixel / width);
    if (x > 0) queue.push(pixel - 1);
    if (x < width - 1) queue.push(pixel + 1);
    if (y > 0) queue.push(pixel - width);
    if (y < height - 1) queue.push(pixel + width);
  }
  return { pixels };
}

function isHalo(rgb) {
  const [r, g, b] = rgb;
  const brightness = (r + g + b) / 3;
  const spread = Math.max(r, g, b) - Math.min(r, g, b);
  return (brightness >= 198 && spread <= 70) || (r >= 120 && g >= 170 && b >= 195);
}

function nearTransparent(image, x, y, radius) {
  for (let dy = -radius; dy <= radius; dy += 1) {
    for (let dx = -radius; dx <= radius; dx += 1) {
      if (dx === 0 && dy === 0) continue;
      const nx = x + dx;
      const ny = y + dy;
      if (nx < 0 || ny < 0 || nx >= image.width || ny >= image.height) return true;
      if (image.data[(ny * image.width + nx) * 4 + 3] <= alphaThreshold) return true;
    }
  }
  return false;
}

async function writeSheet(filePath, frames, bg) {
  if (frames.length === 0) return;
  const gap = 8;
  const width = frames.reduce((sum, frame) => sum + frame.image.width, 0) + gap * Math.max(0, frames.length - 1);
  const height = Math.max(...frames.map((frame) => frame.image.height));
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
  for (let y = 0; y < source.height; y += 1) {
    for (let x = 0; x < source.width; x += 1) {
      const srcPixel = y * source.width + x;
      const src = srcPixel * 4;
      const alpha = source.data[src + 3] / 255;
      if (alpha <= 0) continue;
      const dstPixel = (y + yOffset) * targetWidth + x + xOffset;
      const dst = dstPixel * 4;
      const inverse = 1 - alpha;
      target[dst] = Math.round(source.data[src] * alpha + target[dst] * inverse);
      target[dst + 1] = Math.round(source.data[src + 1] * alpha + target[dst + 1] * inverse);
      target[dst + 2] = Math.round(source.data[src + 2] * alpha + target[dst + 2] * inverse);
      target[dst + 3] = Math.max(target[dst + 3], source.data[src + 3]);
    }
  }
}

async function backup(filePath) {
  const backupPath = path.join(path.dirname(filePath), '.black-gap-backup', path.basename(filePath));
  await fs.mkdir(path.dirname(backupPath), { recursive: true });
  await fs.copyFile(filePath, backupPath);
}

function forNeighbors(width, height, x, y, fn) {
  if (x > 0) fn(y * width + x - 1);
  if (x < width - 1) fn(y * width + x + 1);
  if (y > 0) fn((y - 1) * width + x);
  if (y < height - 1) fn((y + 1) * width + x);
}

function clone(image) {
  return { ...image, data: Buffer.from(image.data) };
}

function rawInfo(image) {
  return { width: image.width, height: image.height, channels: 4 };
}

function rgbAt(image, pixel) {
  const offset = pixel * 4;
  return [image.data[offset], image.data[offset + 1], image.data[offset + 2]];
}

function setPixel(image, pixel, rgb, alpha) {
  setRaw(image.data, pixel, rgb, alpha);
}

function setRaw(data, pixel, rgb, alpha) {
  const offset = pixel * 4;
  data[offset] = rgb[0];
  data[offset + 1] = rgb[1];
  data[offset + 2] = rgb[2];
  data[offset + 3] = alpha;
}

function rel(filePath) {
  return path.relative(repoRoot, filePath).replaceAll(path.sep, '/');
}

function slug(value) {
  return value.replace(/[^a-z0-9]+/giu, '-').replace(/^-|-$/gu, '').toLowerCase() || 'target';
}

function rgbToHex(rgb) {
  return `#${rgb.map((value) => value.toString(16).padStart(2, '0')).join('')}`;
}

function parseHex(value) {
  const match = /^#?([0-9a-f]{6})$/iu.exec(value);
  if (!match) fail('--fill-color must be a hex color.');
  return [0, 2, 4].map((index) => Number.parseInt(match[1].slice(index, index + 2), 16));
}

function inside(parent, child) {
  const relative = path.relative(parent, child);
  return relative === '' || (!relative.startsWith('..') && !path.isAbsolute(relative));
}

function num(name, fallback, min, max) {
  const value = Number(args[name] ?? fallback);
  if (!Number.isFinite(value) || value < min || value > max) fail(`--${name} must be between ${min} and ${max}.`);
  return value;
}

function parseArgs(argv) {
  const parsed = {};
  const booleans = new Set(['dry-run', 'write', 'backup', 'report', 'preview', 'repair-halos']);
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (!arg.startsWith('--')) fail(`Unexpected argument: ${arg}`);
    const key = arg.slice(2);
    if (booleans.has(key)) {
      parsed[key] = true;
      continue;
    }
    const value = argv[index + 1];
    if (!value || value.startsWith('--')) fail(`Missing value for --${key}`);
    parsed[key] = value;
    index += 1;
  }
  return parsed;
}

function fail(message) {
  console.error(message);
  process.exit(1);
}
