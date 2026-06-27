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
const closeRadius = Math.round(num('close-radius', 1, 0, 8));
const maxExpansion = Math.round(num('max-expansion', 2, 0, 12));
const seed = Math.round(num('seed', 1337, 0, 999999999));
const palette = String(args.palette ?? 'dark');
const outline = Boolean(args.outline);
const fillNoise = Boolean(args['fill-noise']);
const preserveAlphaShape = Boolean(args['preserve-alpha-shape']);
const fallbackFill = parseHex(args['fallback-fill'] ?? '#1b1b24');
const activeEntities = ['ronin', 'supreme-emperor', 'monkey-grunt', 'striker-monkey'];
const roninActiveAnimations = ['idle', 'walk', 'dash', 'hit_react', 'recovery', 'stand_up', 'jab', 'cross', 'roundhouse_kick', 'side_kick', 'density'];
const darkPalette = [
  [11, 12, 18],
  [19, 20, 30],
  [27, 27, 36],
  [24, 20, 28],
  [31, 25, 35],
  [18, 24, 34],
  [37, 31, 33],
];
const outlineColor = [5, 6, 10];
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
if (palette !== 'dark') fail('Only --palette dark is supported.');
if (write && args['target-folder'] && !args.backup) fail('Write mode with --target-folder requires --backup.');

const target = args.target === 'active' ? await activeRuntimeFiles() : { files: await filesFromFolder(args['target-folder']), skipped: [] };
if (target.files.length === 0 && target.skipped.length === 0) fail('No PNG files found for silhouette fallback target.');

const reports = [];
const beforeFrames = [];
const afterFrames = [];

for (const item of target.files) {
  try {
    const before = await readPng(item.inputPath);
    const after = makeSilhouette(before, item.reportKey);
    const changedPixels = countDifferent(before, after);
    const outputPath = item.outputPath ?? item.inputPath;
    if (shouldWrite) {
      if (item.outputPath) {
        await fs.mkdir(path.dirname(item.outputPath), { recursive: true });
        if (args.backup) await backupIfExists(item.outputPath);
      } else {
        await backup(item.inputPath);
      }
      await fs.writeFile(outputPath, await sharp(after.data, { raw: rawInfo(after) }).png().toBuffer());
    }
    if (args.preview) {
      beforeFrames.push({ filePath: item.inputPath, image: before });
      afterFrames.push({ filePath: outputPath, image: after });
    }
    const report = {
      file: rel(item.inputPath),
      output: rel(outputPath),
      entityId: item.entityId,
      animationKey: item.animationKey,
      frame: item.frame,
      mode: dryRun ? 'dry-run' : 'write',
      changedPixels,
      sourcePriority: item.sourcePriority,
      outputPriority: item.outputPath ? 'frames-silhouette-fallback' : 'target-folder',
      before: maskStats(maskFromImage(before)),
      after: maskStats(maskFromImage(after)),
    };
    reports.push(report);
    console.log(`${report.file}: ${changedPixels} pixel(s) ${dryRun ? 'would change' : 'changed'} -> ${report.output}`);
  } catch (error) {
    const report = {
      file: rel(item.inputPath),
      output: item.outputPath ? rel(item.outputPath) : rel(item.inputPath),
      entityId: item.entityId,
      animationKey: item.animationKey,
      frame: item.frame,
      mode: dryRun ? 'dry-run' : 'write',
      failed: true,
      reason: error instanceof Error ? error.message : String(error),
    };
    reports.push(report);
    console.log(`${report.file}: failed (${report.reason})`);
  }
}

for (const skipped of target.skipped) {
  reports.push({ ...skipped, skipped: true });
  console.log(`${skipped.entityId}: skipped (${skipped.reason})`);
}

const targetLabel = args.target ?? rel(path.resolve(repoRoot, args['target-folder']));
const summary = {
  generatedAt: new Date().toISOString(),
  target: targetLabel,
  mode: dryRun ? 'dry-run' : 'write',
  options: {
    palette,
    seed,
    outline,
    fillNoise,
    preserveAlphaShape,
    closeRadius,
    maxExpansion,
    alphaThreshold,
    fallbackFill: rgbToHex(fallbackFill),
  },
  filesScanned: target.files.length,
  skipped: target.skipped.length,
  changedFiles: reports.filter((report) => !report.skipped && !report.failed && report.changedPixels > 0).length,
  changedPixels: reports.reduce((sum, report) => sum + (report.changedPixels ?? 0), 0),
  files: reports,
};

if (args.report) {
  const reportPath = path.join(publicRoot, 'sprites', 'qa', `${slug(targetLabel)}-silhouette-fallback-report.json`);
  await fs.mkdir(path.dirname(reportPath), { recursive: true });
  await fs.writeFile(reportPath, `${JSON.stringify(summary, null, 2)}\n`);
  console.log(`Report: ${rel(reportPath)}`);
}

if (args.preview && beforeFrames.length > 0) {
  const previewDir = path.join(publicRoot, 'sprites', 'qa', `${slug(targetLabel)}-silhouette-fallback-preview`);
  await fs.mkdir(previewDir, { recursive: true });
  for (const [name, color] of Object.entries(previewBackgrounds)) {
    await writeSheet(path.join(previewDir, `before-${name}.png`), beforeFrames, color);
    await writeSheet(path.join(previewDir, `after-${name}.png`), afterFrames, color);
  }
  console.log(`Preview: ${rel(previewDir)}`);
}

async function activeRuntimeFiles() {
  const files = [];
  const skipped = [];
  for (const entityId of activeEntities) {
    const manifest = await readManifest(entityId);
    if (!manifest) {
      skipped.push({ entityId, reason: 'atlas-only or missing per-frame sprite-pack manifest; silhouette fallback only processes PNG frame folders.' });
      continue;
    }
    const animations = entityId === 'ronin' ? roninActiveAnimations : Object.keys(manifest.animations ?? {});
    for (const animationKey of animations) {
      const frameCount = manifest.animations?.[animationKey]?.frames ?? 0;
      if (frameCount <= 0) {
        skipped.push({ entityId, animationKey, reason: 'active animation is not present in the per-frame manifest.' });
        continue;
      }
      for (let frameIndex = 0; frameIndex < frameCount; frameIndex += 1) {
        const frame = `${String(frameIndex + 1).padStart(4, '0')}.png`;
        const input = await firstExisting([
          ['manual-overrides', path.join(publicRoot, 'sprites', 'manual-overrides', entityId, animationKey, frame)],
          ['frames-alpha-repaired', path.join(publicRoot, 'sprites', 'frames-alpha-repaired', entityId, animationKey, frame)],
          ['frames-cleaned', path.join(publicRoot, 'sprites', 'frames-cleaned', entityId, animationKey, frame)],
          ['frames-pack', path.join(publicRoot, 'sprites', 'frames-pack', entityId, animationKey, frame)],
          ['raw frames', path.join(publicRoot, 'sprites', 'frames', entityId, animationKey, frame)],
        ]);
        if (!input) {
          skipped.push({ entityId, animationKey, frame, reason: 'no active runtime PNG frame found.' });
          continue;
        }
        files.push({
          inputPath: input.filePath,
          outputPath: path.join(publicRoot, 'sprites', 'frames-silhouette-fallback', entityId, animationKey, frame),
          entityId,
          animationKey,
          frame,
          sourcePriority: input.sourcePriority,
          reportKey: `${entityId}:${animationKey}:${frame}`,
        });
      }
    }
  }
  return { files: uniqueByOutput(files), skipped };
}

async function readManifest(entityId) {
  try {
    return JSON.parse(await fs.readFile(path.join(publicRoot, 'sprite-packs', entityId, 'character.json'), 'utf8'));
  } catch {
    return undefined;
  }
}

async function filesFromFolder(folder) {
  const dir = path.resolve(repoRoot, folder);
  if (!inside(repoRoot, dir)) fail(`Target folder must stay inside repo: ${folder}`);
  const entries = await fs.readdir(dir, { withFileTypes: true });
  return entries
    .filter((entry) => entry.isFile() && entry.name.toLowerCase().endsWith('.png'))
    .map((entry) => {
      const inputPath = path.join(dir, entry.name);
      return { inputPath, frame: entry.name, reportKey: rel(inputPath) };
    })
    .sort((a, b) => a.inputPath.localeCompare(b.inputPath));
}

async function firstExisting(candidates) {
  for (const [sourcePriority, filePath] of candidates) {
    try {
      await fs.access(filePath);
      return { sourcePriority, filePath };
    } catch {}
  }
  return undefined;
}

async function readPng(filePath) {
  const { data, info } = await sharp(filePath).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  return { width: info.width, height: info.height, channels: 4, data: Buffer.from(data) };
}

function makeSilhouette(image, key) {
  const sourceMask = maskFromImage(image);
  const primaryMask = keepPrimaryComponents(sourceMask, image.width, image.height);
  const expanded = preserveAlphaShape ? primaryMask : expand(primaryMask, image.width, image.height, Math.min(closeRadius, maxExpansion));
  const closed = preserveAlphaShape ? expanded : erode(expanded, image.width, image.height, Math.min(closeRadius, maxExpansion));
  const filled = fillInteriorHoles(closed, image.width, image.height);
  const finalMask = maxExpansion > 0 && !preserveAlphaShape ? limitExpansion(filled, primaryMask, image.width, image.height, maxExpansion) : filled;
  const boundary = outline ? boundaryMask(finalMask, image.width, image.height) : new Uint8Array(finalMask.length);
  const out = { width: image.width, height: image.height, channels: 4, data: Buffer.alloc(image.width * image.height * 4) };
  for (let pixel = 0; pixel < finalMask.length; pixel += 1) {
    if (!finalMask[pixel]) continue;
    const rgb = boundary[pixel] ? outlineColor : fillColor(key, pixel);
    setRaw(out.data, pixel, rgb, 255);
  }
  return out;
}

function maskFromImage(image) {
  const mask = new Uint8Array(image.width * image.height);
  for (let pixel = 0; pixel < mask.length; pixel += 1) {
    if (image.data[pixel * 4 + 3] > alphaThreshold) mask[pixel] = 1;
  }
  return mask;
}

function keepPrimaryComponents(mask, width, height) {
  const visited = new Uint8Array(mask.length);
  const components = [];
  for (let pixel = 0; pixel < mask.length; pixel += 1) {
    if (!mask[pixel] || visited[pixel]) continue;
    components.push(floodMask(mask, width, height, pixel, visited));
  }
  if (components.length === 0) return mask;
  const largest = Math.max(...components.map((component) => component.pixels.length));
  const keep = new Uint8Array(mask.length);
  for (const component of components) {
    if (component.pixels.length === largest || component.pixels.length >= Math.max(28, largest * 0.05)) {
      for (const pixel of component.pixels) keep[pixel] = 1;
    }
  }
  return keep;
}

function floodMask(mask, width, height, start, visited) {
  const queue = [start];
  const pixels = [];
  while (queue.length > 0) {
    const pixel = queue.pop();
    if (pixel === undefined || visited[pixel] || !mask[pixel]) continue;
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

function expand(mask, width, height, radius) {
  if (radius <= 0) return mask;
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
  if (radius <= 0) return mask;
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

function fillInteriorHoles(mask, width, height) {
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
  const filled = new Uint8Array(mask);
  for (let pixel = 0; pixel < mask.length; pixel += 1) {
    if (!mask[pixel] && !outside[pixel]) filled[pixel] = 1;
  }
  return filled;
}

function limitExpansion(mask, original, width, height, maxDistance) {
  const distance = new Int16Array(mask.length);
  distance.fill(32767);
  const queue = [];
  for (let pixel = 0; pixel < original.length; pixel += 1) {
    if (!original[pixel]) continue;
    distance[pixel] = 0;
    queue.push(pixel);
  }
  for (let index = 0; index < queue.length; index += 1) {
    const pixel = queue[index];
    const x = pixel % width;
    const y = Math.floor(pixel / width);
    forNeighbors(width, height, x, y, (neighbor) => {
      if (distance[neighbor] <= distance[pixel] + 1) return;
      distance[neighbor] = distance[pixel] + 1;
      queue.push(neighbor);
    });
  }
  const limited = new Uint8Array(mask);
  for (let pixel = 0; pixel < limited.length; pixel += 1) {
    if (limited[pixel] && !original[pixel] && distance[pixel] > maxDistance) limited[pixel] = 0;
  }
  return limited;
}

function boundaryMask(mask, width, height) {
  const boundary = new Uint8Array(mask.length);
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const pixel = y * width + x;
      if (!mask[pixel]) continue;
      let edge = x === 0 || y === 0 || x === width - 1 || y === height - 1;
      forNeighbors(width, height, x, y, (neighbor) => {
        if (!mask[neighbor]) edge = true;
      });
      if (edge) boundary[pixel] = 1;
    }
  }
  return boundary;
}

function fillColor(key, pixel) {
  if (!fillNoise) return fallbackFill;
  const value = hash(`${seed}:${key}:${pixel}`);
  return darkPalette[Math.abs(value) % darkPalette.length];
}

function maskStats(mask) {
  const pixels = mask.reduce((sum, value) => sum + value, 0);
  return { visiblePixels: pixels, fillRatio: pixels / Math.max(1, mask.length) };
}

function countDifferent(before, after) {
  let changed = 0;
  for (let offset = 0; offset < before.data.length; offset += 4) {
    if (
      before.data[offset] !== after.data[offset] ||
      before.data[offset + 1] !== after.data[offset + 1] ||
      before.data[offset + 2] !== after.data[offset + 2] ||
      before.data[offset + 3] !== after.data[offset + 3]
    ) {
      changed += 1;
    }
  }
  return changed;
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
  const backupPath = path.join(path.dirname(filePath), '.silhouette-fallback-backup', path.basename(filePath));
  await fs.mkdir(path.dirname(backupPath), { recursive: true });
  await fs.copyFile(filePath, backupPath);
}

async function backupIfExists(filePath) {
  try {
    await fs.access(filePath);
  } catch {
    return;
  }
  const backupPath = path.join(path.dirname(filePath), '.silhouette-fallback-backup', path.basename(filePath));
  await fs.mkdir(path.dirname(backupPath), { recursive: true });
  await fs.copyFile(filePath, backupPath);
}

function forNeighbors(width, height, x, y, fn) {
  if (x > 0) fn(y * width + x - 1);
  if (x < width - 1) fn(y * width + x + 1);
  if (y > 0) fn((y - 1) * width + x);
  if (y < height - 1) fn((y + 1) * width + x);
}

function uniqueByOutput(files) {
  const seen = new Set();
  return files.filter((file) => {
    const key = file.outputPath ?? file.inputPath;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function hash(value) {
  let out = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    out ^= value.charCodeAt(index);
    out = Math.imul(out, 16777619);
  }
  return out | 0;
}

function setRaw(data, pixel, rgb, alpha) {
  const offset = pixel * 4;
  data[offset] = rgb[0];
  data[offset + 1] = rgb[1];
  data[offset + 2] = rgb[2];
  data[offset + 3] = alpha;
}

function rawInfo(image) {
  return { width: image.width, height: image.height, channels: 4 };
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
  if (!match) fail('--fallback-fill must be a hex color.');
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
  const booleans = new Set(['dry-run', 'write', 'backup', 'report', 'preview', 'outline', 'fill-noise', 'preserve-alpha-shape']);
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
