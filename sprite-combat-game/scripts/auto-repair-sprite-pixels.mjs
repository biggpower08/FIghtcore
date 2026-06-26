import fs from 'node:fs/promises';
import path from 'node:path';
import { PNG } from 'pngjs';

const repoRoot = process.cwd();
const args = parseArgs(process.argv.slice(2));
const targetArg = args.target;

if (!targetArg || targetArg === '.') fail('Missing --target <folder>. Refusing broad sprite repair.');
const targetDir = path.resolve(repoRoot, targetArg);
if (!isInside(repoRoot, targetDir)) fail(`Target must stay inside this repo: ${targetArg}`);

const write = Boolean(args.write);
const dryRun = !write || Boolean(args['dry-run']);
const shouldWrite = write && !dryRun;
const fillHoles = Boolean(args['fill-holes']);
const haloCleanup = Boolean(args['halo-cleanup']);
const backup = Boolean(args.backup);
const alphaThreshold = numberArg('alpha-threshold', 8, 0, 255);
const maxHoleArea = numberArg('max-hole-area', 48, 1, 10000);
const maxJunkArea = numberArg('max-junk-area', 6, 0, 10000);
const defaultFill = parseHexColor(args['default-fill'] ?? '#1b1b24');

if (write && !fillHoles && !haloCleanup && maxJunkArea <= 0) fail('Write mode needs --fill-holes, --halo-cleanup, or --max-junk-area > 0.');

const files = await listPngs(targetDir);
if (files.length === 0) fail(`No PNG files found in ${path.relative(repoRoot, targetDir)}.`);

const results = [];
for (const filePath of files) {
  const source = PNG.sync.read(await fs.readFile(filePath));
  const before = analyze(source);
  const repaired = clonePng(source);
  const changes = { filledHolePixels: 0, haloPixelsCleared: 0, haloPixelsDarkened: 0, junkPixelsCleared: 0 };

  if (fillHoles) changes.filledHolePixels = fillTinyHoles(repaired, before.holes);
  if (haloCleanup) Object.assign(changes, cleanHaloPixels(repaired, changes));
  if (maxJunkArea > 0) changes.junkPixelsCleared = clearTinyJunk(repaired);

  const after = analyze(repaired);
  const changedPixels = Object.values(changes).reduce((total, value) => total + value, 0);
  const result = {
    file: rel(filePath),
    mode: dryRun ? 'dry-run' : 'write',
    before: summarize(before),
    after: summarize(after),
    changedPixels,
    ...changes,
  };
  results.push(result);

  if (shouldWrite && changedPixels > 0) {
    if (backup) await writeBackup(filePath);
    await fs.writeFile(filePath, PNG.sync.write(repaired));
  }

  console.log(`${result.file}: ${changedPixels} pixel(s) ${dryRun ? 'would change' : 'changed'}; holes ${result.before.holes}->${result.after.holes}, halo ${result.before.haloPixels}->${result.after.haloPixels}, junk ${result.before.junkComponents}->${result.after.junkComponents}`);
}

const report = {
  generatedAt: new Date().toISOString(),
  target: rel(targetDir),
  mode: dryRun ? 'dry-run' : 'write',
  options: { fillHoles, haloCleanup, backup, alphaThreshold, maxHoleArea, maxJunkArea, defaultFill: rgbToHex(defaultFill) },
  filesScanned: results.length,
  changedFiles: results.filter((result) => result.changedPixels > 0).length,
  changedPixels: results.reduce((total, result) => total + result.changedPixels, 0),
  files: results,
};

if (args.report) {
  const reportPath = path.join(repoRoot, 'public', 'sprites', 'qa', `${slug(report.target)}-auto-repair-report.json`);
  await fs.mkdir(path.dirname(reportPath), { recursive: true });
  await fs.writeFile(reportPath, `${JSON.stringify(report, null, 2)}\n`);
  console.log(`Report: ${rel(reportPath)}`);
}

function analyze(png) {
  return {
    holes: findInternalAlphaHoles(png).filter((hole) => hole.area <= maxHoleArea),
    haloPixels: countHaloPixels(png),
    junkComponents: findTinyJunk(png),
  };
}

function summarize(analysis) {
  return {
    holes: analysis.holes.length,
    holePixels: analysis.holes.reduce((total, hole) => total + hole.area, 0),
    haloPixels: analysis.haloPixels,
    junkComponents: analysis.junkComponents.length,
    junkPixels: analysis.junkComponents.reduce((total, junk) => total + junk.pixels.length, 0),
  };
}

function findInternalAlphaHoles(png) {
  const outside = markOutsideTransparency(png);
  const visited = new Uint8Array(png.width * png.height);
  const holes = [];
  for (let y = 0; y < png.height; y += 1) {
    for (let x = 0; x < png.width; x += 1) {
      const pixel = y * png.width + x;
      if (visited[pixel] || outside[pixel] || isOpaque(png, x, y)) continue;
      const hole = floodTransparent(png, x, y, visited, outside);
      if (hole && hole.area >= 1 && hole.area <= maxHoleArea && holeConfidence(png, hole) >= 0.42) holes.push(hole);
    }
  }
  return holes;
}

function markOutsideTransparency(png) {
  const outside = new Uint8Array(png.width * png.height);
  const queue = [];
  for (let x = 0; x < png.width; x += 1) queue.push([x, 0], [x, png.height - 1]);
  for (let y = 1; y < png.height - 1; y += 1) queue.push([0, y], [png.width - 1, y]);
  while (queue.length) {
    const [x, y] = queue.pop();
    if (x < 0 || y < 0 || x >= png.width || y >= png.height) continue;
    const pixel = y * png.width + x;
    if (outside[pixel] || isOpaque(png, x, y)) continue;
    outside[pixel] = 1;
    queue.push([x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]);
  }
  return outside;
}

function floodTransparent(png, startX, startY, visited, outside) {
  const queue = [[startX, startY]];
  const pixels = [];
  let minX = startX;
  let minY = startY;
  let maxX = startX;
  let maxY = startY;
  while (queue.length) {
    const [x, y] = queue.pop();
    if (x < 0 || y < 0 || x >= png.width || y >= png.height) continue;
    const pixel = y * png.width + x;
    if (visited[pixel] || outside[pixel] || isOpaque(png, x, y)) continue;
    visited[pixel] = 1;
    pixels.push(pixel);
    minX = Math.min(minX, x);
    minY = Math.min(minY, y);
    maxX = Math.max(maxX, x);
    maxY = Math.max(maxY, y);
    queue.push([x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]);
  }
  return pixels.length ? { pixels, area: pixels.length, minX, minY, maxX, maxY } : undefined;
}

function holeConfidence(png, hole) {
  let opaque = 0;
  let checked = 0;
  for (let y = hole.minY - 1; y <= hole.maxY + 1; y += 1) {
    for (let x = hole.minX - 1; x <= hole.maxX + 1; x += 1) {
      if (x < 0 || y < 0 || x >= png.width || y >= png.height) continue;
      if (x >= hole.minX && x <= hole.maxX && y >= hole.minY && y <= hole.maxY) continue;
      checked += 1;
      if (isOpaque(png, x, y)) opaque += 1;
    }
  }
  return opaque / Math.max(1, checked);
}

function fillTinyHoles(png, holes) {
  let changed = 0;
  for (const hole of holes) {
    for (const pixel of hole.pixels) {
      const x = pixel % png.width;
      const y = Math.floor(pixel / png.width);
      const color = darkNeighborColor(png, x, y) ?? defaultFill;
      const offset = pixel * 4;
      png.data[offset] = color[0];
      png.data[offset + 1] = color[1];
      png.data[offset + 2] = color[2];
      png.data[offset + 3] = 255;
      changed += 1;
    }
  }
  return changed;
}

function darkNeighborColor(png, x, y) {
  let best;
  let bestScore = Number.POSITIVE_INFINITY;
  for (let radius = 1; radius <= 5; radius += 1) {
    for (let dy = -radius; dy <= radius; dy += 1) {
      for (let dx = -radius; dx <= radius; dx += 1) {
        const nx = x + dx;
        const ny = y + dy;
        if (nx < 0 || ny < 0 || nx >= png.width || ny >= png.height || !isOpaque(png, nx, ny)) continue;
        const offset = (ny * png.width + nx) * 4;
        const rgb = [png.data[offset], png.data[offset + 1], png.data[offset + 2]];
        if (isHaloRgb(rgb)) continue;
        const score = avg(rgb) + Math.abs(dx) + Math.abs(dy);
        if (score < bestScore) {
          bestScore = score;
          best = rgb;
        }
      }
    }
    if (best) return best;
  }
  return undefined;
}

function cleanHaloPixels(png, changes) {
  let cleared = 0;
  let darkened = 0;
  const original = Buffer.from(png.data);
  for (let y = 0; y < png.height; y += 1) {
    for (let x = 0; x < png.width; x += 1) {
      const offset = (y * png.width + x) * 4;
      const alpha = original[offset + 3];
      if (alpha <= alphaThreshold || !nearTransparent(original, png.width, png.height, x, y, 1)) continue;
      const rgb = [original[offset], original[offset + 1], original[offset + 2]];
      if (!isHaloRgb(rgb)) continue;
      const color = darkNeighborColor(png, x, y);
      if (alpha < 140 || !color) {
        png.data[offset] = 0;
        png.data[offset + 1] = 0;
        png.data[offset + 2] = 0;
        png.data[offset + 3] = 0;
        cleared += 1;
      } else {
        png.data[offset] = color[0];
        png.data[offset + 1] = color[1];
        png.data[offset + 2] = color[2];
        darkened += 1;
      }
    }
  }
  return { ...changes, haloPixelsCleared: cleared, haloPixelsDarkened: darkened };
}

function findTinyJunk(png) {
  const visited = new Uint8Array(png.width * png.height);
  const components = [];
  for (let y = 0; y < png.height; y += 1) {
    for (let x = 0; x < png.width; x += 1) {
      const pixel = y * png.width + x;
      if (visited[pixel] || !isOpaque(png, x, y)) continue;
      components.push({ pixels: floodOpaque(png, x, y, visited) });
    }
  }
  const largest = Math.max(0, ...components.map((component) => component.pixels.length));
  return components.filter((component) => component.pixels.length < largest && component.pixels.length <= maxJunkArea);
}

function floodOpaque(png, startX, startY, visited) {
  const queue = [[startX, startY]];
  const pixels = [];
  while (queue.length) {
    const [x, y] = queue.pop();
    if (x < 0 || y < 0 || x >= png.width || y >= png.height) continue;
    const pixel = y * png.width + x;
    if (visited[pixel] || !isOpaque(png, x, y)) continue;
    visited[pixel] = 1;
    pixels.push(pixel);
    queue.push([x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]);
  }
  return pixels;
}

function clearTinyJunk(png) {
  const junk = findTinyJunk(png);
  for (const component of junk) {
    for (const pixel of component.pixels) {
      const offset = pixel * 4;
      png.data[offset] = 0;
      png.data[offset + 1] = 0;
      png.data[offset + 2] = 0;
      png.data[offset + 3] = 0;
    }
  }
  return junk.reduce((total, component) => total + component.pixels.length, 0);
}

function countHaloPixels(png) {
  let count = 0;
  for (let y = 0; y < png.height; y += 1) {
    for (let x = 0; x < png.width; x += 1) {
      const offset = (y * png.width + x) * 4;
      const alpha = png.data[offset + 3];
      if (alpha > alphaThreshold && isHaloRgb([png.data[offset], png.data[offset + 1], png.data[offset + 2]]) && nearTransparent(png.data, png.width, png.height, x, y, 1)) count += 1;
    }
  }
  return count;
}

function isHaloRgb(rgb) {
  const [r, g, b] = rgb;
  const average = avg(rgb);
  const spread = Math.max(...rgb) - Math.min(...rgb);
  return (average >= 210 && spread <= 44) || (r >= 150 && g >= 185 && b >= 205);
}

function nearTransparent(data, width, height, x, y, radius) {
  for (let dy = -radius; dy <= radius; dy += 1) {
    for (let dx = -radius; dx <= radius; dx += 1) {
      if (dx === 0 && dy === 0) continue;
      const nx = x + dx;
      const ny = y + dy;
      if (nx < 0 || ny < 0 || nx >= width || ny >= height) return true;
      if (data[(ny * width + nx) * 4 + 3] <= alphaThreshold) return true;
    }
  }
  return false;
}

async function writeBackup(filePath) {
  const backupPath = path.join(path.dirname(filePath), '.auto-repair-backup', path.basename(filePath));
  await fs.mkdir(path.dirname(backupPath), { recursive: true });
  await fs.copyFile(filePath, backupPath);
}

async function listPngs(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  return entries.filter((entry) => entry.isFile() && entry.name.toLowerCase().endsWith('.png')).map((entry) => path.join(dir, entry.name)).sort();
}

function parseArgs(argv) {
  const parsed = {};
  const booleans = new Set(['dry-run', 'write', 'backup', 'report', 'halo-cleanup', 'fill-holes']);
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

function numberArg(name, fallback, min, max) {
  const value = Number(args[name] ?? fallback);
  if (!Number.isFinite(value) || value < min || value > max) fail(`--${name} must be between ${min} and ${max}.`);
  return value;
}

function parseHexColor(value) {
  const match = /^#?([0-9a-f]{6})$/iu.exec(value);
  if (!match) fail('--default-fill must be a hex color like "#1b1b24".');
  return [0, 2, 4].map((index) => Number.parseInt(match[1].slice(index, index + 2), 16));
}

function isOpaque(png, x, y) {
  return png.data[(y * png.width + x) * 4 + 3] > alphaThreshold;
}

function clonePng(source) {
  const png = new PNG({ width: source.width, height: source.height });
  source.data.copy(png.data);
  return png;
}

function avg(rgb) {
  return (rgb[0] + rgb[1] + rgb[2]) / 3;
}

function rel(filePath) {
  return path.relative(repoRoot, filePath).replaceAll(path.sep, '/');
}

function rgbToHex(rgb) {
  return `#${rgb.map((value) => value.toString(16).padStart(2, '0')).join('')}`;
}

function slug(value) {
  return value.replace(/[^a-z0-9]+/giu, '-').replace(/^-|-$/gu, '').toLowerCase() || 'target';
}

function isInside(parent, child) {
  const relative = path.relative(parent, child);
  return relative === '' || (!relative.startsWith('..') && !path.isAbsolute(relative));
}

function fail(message) {
  console.error(message);
  process.exit(1);
}
