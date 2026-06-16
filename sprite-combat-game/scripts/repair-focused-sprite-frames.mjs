import fs from 'node:fs/promises';
import path from 'node:path';
import { PNG } from 'pngjs';

const repoRoot = process.cwd();
const stripRoot = path.join(repoRoot, 'public', 'assets', 'fightcore', 'sprites');
const framesRoot = path.join(repoRoot, 'public', 'sprites', 'frames');
const padding = 6;

const repairs = [
  repair('cyber-ninja', 'slice', 'slice-strip.png', [
    segment(0, 55, 64, 96, 0.5, 0.9167, 115, 0, false),
    segment(55, 104, 104, 96, 0.5, 0.9167, 135, 1, false),
    segment(159, 96, 96, 96, 0.5, 0.9167, 155, 2, false),
    segment(255, 86, 86, 96, 0.5, 0.9167, 170, 3, false),
    segment(504, 65, 64, 96, 0.5, 0.9167, 190, 5, false),
  ]),
  repair('puppetmaster', 'o_goshi', 'o-goshi-strip.png', [
    segment(0, 90, 90, 96, 0.5, 0.9167, 170, 0, false),
    segment(90, 69, 69, 96, 0.5, 0.9167, 200, 1, false),
    segment(159, 61, 64, 96, 0.5, 0.9167, 230, 2, false),
    segment(220, 110, 110, 96, 0.5, 0.9167, 260, 3, false),
    segment(330, 110, 110, 96, 0.5, 0.9167, 250, 4, false),
    segment(440, 79, 96, 96, 0.5, 0.9167, 230, 5, false),
  ]),
  repair('shadow-striker', 'hit_react', 'hit-react-strip.png', [
    segment(0, 91, 91, 96, 0.5, 0.9167, 140, 0, false),
    segment(91, 120, 120, 96, 0.5, 0.9167, 150, 1, true),
    segment(211, 121, 121, 96, 0.5, 0.9167, 150, 1, true),
    segment(332, 141, 141, 96, 0.5, 0.9167, 150, 2, false),
    segment(473, 154, 154, 96, 0.5, 0.9167, 160, 3, false),
  ]),
  repair('combat-monk', 'spinning_sweep', 'spinning-sweep-strip.png', [
    segment(0, 176, 176, 96, 0.5, 0.9167, 150, 0, false),
    segment(176, 160, 160, 96, 0.5, 0.9167, 180, 1, false),
    segment(336, 142, 142, 96, 0.5, 0.9167, 200, 2, false),
    segment(478, 156, 156, 96, 0.5, 0.9167, 210, 3, false),
  ]),
];

const summary = [];
const rejected = [];

for (const repairSpec of repairs) {
  await repairKnownFightcoreFrames(repairSpec);
}

const reportPath = path.join(repoRoot, 'public', 'sprites', 'qa', 'focused-repair-report.json');
await fs.mkdir(path.dirname(reportPath), { recursive: true });
await fs.writeFile(reportPath, JSON.stringify({ generatedAt: new Date().toISOString(), repaired: summary, rejected }, null, 2));

console.log('Focused sprite repairs:');
for (const row of summary) {
  console.log(`- ${row.entityId}/${row.animation}/${row.frame}: ${row.width}x${row.height}`);
}
if (rejected.length > 0) {
  console.log(`Rejected ${rejected.length} targeted segment(s).`);
  process.exitCode = 1;
}

function repair(entityId, animation, stripPath, frames) {
  return { entityId, animation, stripPath, frames };
}

function segment(sourceX, sourceWidth, width, height, anchorX, anchorY, durationMs, sourceFrameIndex, splitFromDirtyCrop) {
  return { sourceX, sourceWidth, width, height, anchorX, anchorY, durationMs, sourceFrameIndex, splitFromDirtyCrop };
}

async function repairKnownFightcoreFrames(repairSpec) {
  const sourcePath = path.join(stripRoot, repairSpec.entityId, repairSpec.stripPath);
  const outputAnimationDir = path.join(framesRoot, repairSpec.entityId, repairSpec.animation);
  const strip = PNG.sync.read(await fs.readFile(sourcePath));

  await fs.rm(outputAnimationDir, { recursive: true, force: true });
  await fs.mkdir(outputAnimationDir, { recursive: true });

  for (const [index, frameSpec] of repairSpec.frames.entries()) {
    const frameFile = `${String(index + 1).padStart(4, '0')}.png`;
    const outputPath = path.join(outputAnimationDir, frameFile);
    const sourceCrop = cropPng(strip, frameSpec.sourceX, 0, frameSpec.sourceWidth, strip.height);
    const foreground = keepMainForeground(removeEdgeConnectedBackground(sourceCrop));
    const bbox = getOpaqueBounds(foreground);

    if (!bbox) {
      rejected.push({
        entityId: repairSpec.entityId,
        animation: repairSpec.animation,
        frame: frameFile,
        sourceX: frameSpec.sourceX,
        sourceWidth: frameSpec.sourceWidth,
      });
      continue;
    }

    const output = normalizeToCanvas(foreground, bbox, frameSpec);
    await fs.writeFile(outputPath, PNG.sync.write(output));
    summary.push({
      entityId: repairSpec.entityId,
      animation: repairSpec.animation,
      frame: frameFile,
      width: output.width,
      height: output.height,
      sourceFrameIndex: frameSpec.sourceFrameIndex,
      splitFromDirtyCrop: frameSpec.splitFromDirtyCrop,
    });
  }
}

function removeEdgeConnectedBackground(source) {
  const png = clonePng(source);
  const bg = sampleBackgroundColor(png);
  const visited = new Uint8Array(png.width * png.height);
  const queue = [];

  for (let x = 0; x < png.width; x += 1) queue.push([x, 0], [x, png.height - 1]);
  for (let y = 1; y < png.height - 1; y += 1) queue.push([0, y], [png.width - 1, y]);

  while (queue.length > 0) {
    const [x, y] = queue.pop();
    if (x < 0 || y < 0 || x >= png.width || y >= png.height) continue;
    const pixel = y * png.width + x;
    if (visited[pixel]) continue;
    visited[pixel] = 1;
    if (!isConnectedBackgroundPixel(png, x, y, bg)) continue;

    png.data[pixel * 4 + 3] = 0;
    queue.push([x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]);
  }

  return png;
}

function sampleBackgroundColor(png) {
  const points = [
    [0, 0],
    [png.width - 1, 0],
    [0, png.height - 1],
    [png.width - 1, png.height - 1],
  ];
  const total = [0, 0, 0];
  for (const [x, y] of points) {
    const offset = (y * png.width + x) * 4;
    total[0] += png.data[offset];
    total[1] += png.data[offset + 1];
    total[2] += png.data[offset + 2];
  }
  return total.map((value) => value / points.length);
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
  return brightness < 30 && colorDistance < 38;
}

function keepMainForeground(source) {
  const output = clonePng(source);
  const visited = new Uint16Array(output.width * output.height);
  const components = [];
  let id = 1;

  for (let y = 0; y < output.height; y += 1) {
    for (let x = 0; x < output.width; x += 1) {
      const pixel = y * output.width + x;
      if (visited[pixel] || output.data[pixel * 4 + 3] <= 8) continue;
      const component = floodComponent(output, x, y, visited, id);
      if (component.area > 8) components.push(component);
      id += 1;
    }
  }

  if (components.length <= 1) return output;
  components.sort((a, b) => b.area - a.area);
  const largest = components[0];
  const keep = new Set(
    components
      .filter((component) => component === largest || (component.area >= largest.area * 0.035 && component.height > 8))
      .map((component) => component.id),
  );

  for (let y = 0; y < output.height; y += 1) {
    for (let x = 0; x < output.width; x += 1) {
      const pixel = y * output.width + x;
      const componentId = visited[pixel];
      if (componentId > 0 && !keep.has(componentId)) output.data[pixel * 4 + 3] = 0;
    }
  }

  return output;
}

function floodComponent(png, startX, startY, visited, id) {
  const queue = [[startX, startY]];
  let area = 0;
  let minX = startX;
  let minY = startY;
  let maxX = startX;
  let maxY = startY;

  while (queue.length > 0) {
    const [x, y] = queue.pop();
    if (x < 0 || y < 0 || x >= png.width || y >= png.height) continue;
    const pixel = y * png.width + x;
    if (visited[pixel] || png.data[pixel * 4 + 3] <= 8) continue;
    visited[pixel] = id;
    area += 1;
    minX = Math.min(minX, x);
    minY = Math.min(minY, y);
    maxX = Math.max(maxX, x);
    maxY = Math.max(maxY, y);
    queue.push([x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]);
  }

  return { id, area, minX, minY, maxX, maxY, width: maxX - minX + 1, height: maxY - minY + 1 };
}

function getOpaqueBounds(png) {
  let minX = png.width;
  let minY = png.height;
  let maxX = -1;
  let maxY = -1;

  for (let y = 0; y < png.height; y += 1) {
    for (let x = 0; x < png.width; x += 1) {
      if (png.data[(y * png.width + x) * 4 + 3] <= 8) continue;
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
  const maxWidth = target.width - padding * 2;
  const maxHeight = target.height - padding * 2;
  const scale = Math.min(1, maxWidth / bbox.width, maxHeight / bbox.height);
  const drawWidth = Math.max(1, Math.round(bbox.width * scale));
  const drawHeight = Math.max(1, Math.round(bbox.height * scale));
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

function cropPng(source, x, y, width, height) {
  const output = new PNG({ width, height });
  for (let targetY = 0; targetY < height; targetY += 1) {
    for (let targetX = 0; targetX < width; targetX += 1) {
      const sourceX = x + targetX;
      const sourceY = y + targetY;
      if (sourceX < 0 || sourceY < 0 || sourceX >= source.width || sourceY >= source.height) continue;
      const sourceOffset = (sourceY * source.width + sourceX) * 4;
      const targetOffset = (targetY * output.width + targetX) * 4;
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

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}
