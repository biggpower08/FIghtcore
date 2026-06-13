import fs from 'node:fs/promises';
import path from 'node:path';
import { PNG } from 'pngjs';

const repoRoot = process.cwd();
const framesRoot = path.join(repoRoot, 'public', 'sprites', 'frames');

const entityCanvas = new Map([
  ['cyber-ninja-blue', { width: 96, height: 96, anchorX: 0.5, anchorY: 0.86 }],
  ['shadow-striker-purple', { width: 96, height: 96, anchorX: 0.5, anchorY: 0.86 }],
  ['cyber-monk-orange', { width: 96, height: 96, anchorX: 0.5, anchorY: 0.86 }],
  ['neo-operative-green', { width: 96, height: 96, anchorX: 0.5, anchorY: 0.86 }],
  ['cyber-monkey-grunt', { width: 96, height: 96, anchorX: 0.5, anchorY: 0.88 }],
  ['cyber-monkey-scrapper', { width: 112, height: 112, anchorX: 0.5, anchorY: 0.88 }],
  ['cyber-monkey-alpha', { width: 160, height: 160, anchorX: 0.5, anchorY: 0.9 }],
]);

const defaultCanvas = { width: 96, height: 96, anchorX: 0.5, anchorY: 0.86 };
const padding = 6;

const entities = await listDirs(framesRoot);
const summary = [];

for (const entityId of entities) {
  const entityDir = path.join(framesRoot, entityId);
  const target = entityCanvas.get(entityId) ?? defaultCanvas;
  const animations = await listDirs(entityDir);

  for (const animation of animations) {
    const animationDir = path.join(entityDir, animation);
    const frameFiles = (await fs.readdir(animationDir)).filter((file) => file.endsWith('.png')).sort();

    for (const frameFile of frameFiles) {
      const framePath = path.join(animationDir, frameFile);
      const input = PNG.sync.read(await fs.readFile(framePath));
      const before = countOpaque(input);
      const cleaned = removeEdgeConnectedBackground(input);
      const bbox = getOpaqueBounds(cleaned);
      const output = bbox ? normalizeToCanvas(cleaned, bbox, target) : new PNG({ width: target.width, height: target.height });
      await fs.writeFile(framePath, PNG.sync.write(output));
      summary.push({
        entityId,
        animation,
        frame: frameFile,
        before,
        after: countOpaque(output),
        width: output.width,
        height: output.height,
        trimmed: Boolean(bbox),
      });
    }
  }
}

const reportPath = path.join(repoRoot, 'public', 'sprites', 'qa', 'cleanup-report.json');
await fs.mkdir(path.dirname(reportPath), { recursive: true });
await fs.writeFile(reportPath, JSON.stringify({ generatedAt: new Date().toISOString(), frames: summary }, null, 2));

const byEntity = new Map();
for (const row of summary) {
  byEntity.set(row.entityId, (byEntity.get(row.entityId) ?? 0) + 1);
}

console.log('Cleaned sprite frames:');
for (const [entityId, count] of byEntity.entries()) {
  console.log(`- ${entityId}: ${count}`);
}
console.log(`Report: ${path.relative(repoRoot, reportPath)}`);

async function listDirs(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  return entries.filter((entry) => entry.isDirectory()).map((entry) => entry.name).sort();
}

function removeEdgeConnectedBackground(source) {
  const png = clonePng(source);
  const bg = sampleBackgroundColor(png);
  const visited = new Uint8Array(png.width * png.height);
  const queue = [];

  for (let x = 0; x < png.width; x += 1) {
    queue.push([x, 0], [x, png.height - 1]);
  }
  for (let y = 1; y < png.height - 1; y += 1) {
    queue.push([0, y], [png.width - 1, y]);
  }

  while (queue.length > 0) {
    const [x, y] = queue.pop();
    if (x < 0 || y < 0 || x >= png.width || y >= png.height) continue;
    const pixel = y * png.width + x;
    if (visited[pixel]) continue;
    visited[pixel] = 1;

    if (!isConnectedBackgroundPixel(png, x, y, bg)) continue;

    const offset = pixel * 4;
    png.data[offset + 3] = 0;

    queue.push([x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]);
  }

  softenTransparentEdges(png);
  return png;
}

function sampleBackgroundColor(png) {
  const samples = [];
  const points = [
    [0, 0],
    [png.width - 1, 0],
    [0, png.height - 1],
    [png.width - 1, png.height - 1],
    [Math.floor(png.width / 2), 0],
    [Math.floor(png.width / 2), png.height - 1],
    [0, Math.floor(png.height / 2)],
    [png.width - 1, Math.floor(png.height / 2)],
  ];

  for (const [x, y] of points) {
    const offset = (y * png.width + x) * 4;
    samples.push([png.data[offset], png.data[offset + 1], png.data[offset + 2]]);
  }

  return samples.reduce(
    (total, sample) => [total[0] + sample[0], total[1] + sample[1], total[2] + sample[2]],
    [0, 0, 0],
  ).map((value) => value / samples.length);
}

function isConnectedBackgroundPixel(png, x, y, bg) {
  const offset = (y * png.width + x) * 4;
  const r = png.data[offset];
  const g = png.data[offset + 1];
  const b = png.data[offset + 2];
  const a = png.data[offset + 3];
  if (a === 0) return true;

  const brightness = (r + g + b) / 3;
  const colorDistance = Math.hypot(r - bg[0], g - bg[1], b - bg[2]);
  const blueDarkSheet = b > r && b > g && brightness < 42;
  return (brightness < 34 && colorDistance < 44) || blueDarkSheet;
}

function softenTransparentEdges(png) {
  for (let y = 1; y < png.height - 1; y += 1) {
    for (let x = 1; x < png.width - 1; x += 1) {
      const offset = (y * png.width + x) * 4;
      if (png.data[offset + 3] === 0) continue;
      const brightness = (png.data[offset] + png.data[offset + 1] + png.data[offset + 2]) / 3;
      if (brightness > 38) continue;
      if (hasTransparentNeighbor(png, x, y)) png.data[offset + 3] = Math.min(png.data[offset + 3], 96);
    }
  }
}

function hasTransparentNeighbor(png, x, y) {
  return (
    png.data[((y - 1) * png.width + x) * 4 + 3] === 0 ||
    png.data[((y + 1) * png.width + x) * 4 + 3] === 0 ||
    png.data[(y * png.width + x - 1) * 4 + 3] === 0 ||
    png.data[(y * png.width + x + 1) * 4 + 3] === 0
  );
}

function getOpaqueBounds(png) {
  let minX = png.width;
  let minY = png.height;
  let maxX = -1;
  let maxY = -1;

  for (let y = 0; y < png.height; y += 1) {
    for (let x = 0; x < png.width; x += 1) {
      const alpha = png.data[(y * png.width + x) * 4 + 3];
      if (alpha <= 8) continue;
      minX = Math.min(minX, x);
      minY = Math.min(minY, y);
      maxX = Math.max(maxX, x);
      maxY = Math.max(maxY, y);
    }
  }

  if (maxX < minX || maxY < minY) return null;
  return { minX, minY, maxX, maxY, width: maxX - minX + 1, height: maxY - minY + 1 };
}

function normalizeToCanvas(source, bbox, target) {
  const contentWidth = bbox.width;
  const contentHeight = bbox.height;
  const maxWidth = target.width - padding * 2;
  const maxHeight = target.height - padding * 2;
  const scale = Math.min(1, maxWidth / contentWidth, maxHeight / contentHeight);
  const drawWidth = Math.max(1, Math.round(contentWidth * scale));
  const drawHeight = Math.max(1, Math.round(contentHeight * scale));
  const resized = cropAndResizeNearest(source, bbox, drawWidth, drawHeight);
  const output = new PNG({ width: target.width, height: target.height });
  const anchorX = Math.round(target.width * target.anchorX);
  const anchorY = Math.round(target.height * target.anchorY);
  const dx = clamp(anchorX - Math.round(drawWidth / 2), 0, target.width - drawWidth);
  const dy = clamp(anchorY - drawHeight, 0, target.height - drawHeight);
  blit(resized, output, dx, dy);
  return output;
}

function cropAndResizeNearest(source, bbox, width, height) {
  const output = new PNG({ width, height });
  for (let y = 0; y < height; y += 1) {
    const sy = bbox.minY + Math.min(bbox.height - 1, Math.floor((y / height) * bbox.height));
    for (let x = 0; x < width; x += 1) {
      const sx = bbox.minX + Math.min(bbox.width - 1, Math.floor((x / width) * bbox.width));
      const sourceOffset = (sy * source.width + sx) * 4;
      const targetOffset = (y * width + x) * 4;
      output.data[targetOffset] = source.data[sourceOffset];
      output.data[targetOffset + 1] = source.data[sourceOffset + 1];
      output.data[targetOffset + 2] = source.data[sourceOffset + 2];
      output.data[targetOffset + 3] = source.data[sourceOffset + 3];
    }
  }
  return output;
}

function blit(source, target, dx, dy) {
  for (let y = 0; y < source.height; y += 1) {
    for (let x = 0; x < source.width; x += 1) {
      const sourceOffset = (y * source.width + x) * 4;
      const targetOffset = ((dy + y) * target.width + dx + x) * 4;
      target.data[targetOffset] = source.data[sourceOffset];
      target.data[targetOffset + 1] = source.data[sourceOffset + 1];
      target.data[targetOffset + 2] = source.data[sourceOffset + 2];
      target.data[targetOffset + 3] = source.data[sourceOffset + 3];
    }
  }
}

function clonePng(source) {
  const output = new PNG({ width: source.width, height: source.height });
  source.data.copy(output.data);
  return output;
}

function countOpaque(png) {
  let count = 0;
  for (let index = 3; index < png.data.length; index += 4) {
    if (png.data[index] > 8) count += 1;
  }
  return count;
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}
