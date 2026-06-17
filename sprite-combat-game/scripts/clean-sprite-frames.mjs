import fs from 'node:fs/promises';
import path from 'node:path';
import { PNG } from 'pngjs';
import { shouldRepairSprite } from './sprite-repair-allowlist.mjs';

const repoRoot = process.cwd();
const framesRoot = path.join(repoRoot, 'public', 'sprites', 'frames');
const sourceFramesRoot = path.join(repoRoot, 'public', 'sprites', 'frames-raw-generated-backup');

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
const fightcoreStripRoot = path.join(repoRoot, 'public', 'assets', 'fightcore', 'sprites');

const targetedFightcoreRepairs = [
  repair('shadow-striker', 'teep_kick', 'teep-kick-strip.png', [
    segment(0, 51, 64, 96, 0.5, 0.9167, 77, 0, false),
    segment(51, 46, 64, 96, 0.5, 0.9167, 77, 1, false),
    segment(97, 80, 80, 96, 0.5, 0.9167, 77, 2, true),
    segment(177, 84, 85, 96, 0.5, 0.9167, 77, 2, true),
    segment(261, 57, 64, 96, 0.4844, 0.9167, 77, 3, false),
    segment(318, 54, 64, 96, 0.5, 0.9167, 77, 4, false),
  ], { fillAlphaGaps: true, fillDarkGaps: true }),
  repair('shadow-striker', 'roundhouse_kick', 'roundhouse-kick-strip.png', [
    segment(0, 53, 64, 96, 0.4844, 0.9167, 77, 0, false),
    segment(53, 51, 64, 96, 0.5, 0.9167, 77, 1, false),
    segment(104, 93, 93, 96, 0.5, 0.9167, 77, 2, true),
    segment(197, 67, 66, 96, 0.5, 0.9167, 77, 2, true),
    segment(264, 109, 109, 96, 0.4954, 0.9167, 77, 3, false),
    segment(373, 59, 64, 96, 0.5, 0.9167, 77, 4, false),
  ], { fillAlphaGaps: true, fillDarkGaps: true }),
  repair('combat-monk', 'high_kick', 'high-kick-strip.png', [
    segment(0, 60, 64, 96, 0.5, 0.9167, 77, 0, false),
    segment(60, 61, 64, 96, 0.4844, 0.9167, 77, 1, false),
    segment(121, 89, 89, 96, 0.4944, 0.9167, 77, 2, false),
    segment(210, 117, 117, 96, 0.5, 0.9167, 77, 3, true, 0, 18, 78, 58),
    segment(327, 105, 93, 96, 0.5, 0.9167, 77, 3, true, 16, 14, 68, 58),
    segment(432, 64, 64, 96, 0.5, 0.9167, 77, 4, false),
  ], { removeCyanBleed: true, fillAlphaGaps: true, fillDarkGaps: true }),
  repair('combat-monk', 'palm_strike', 'palm-strike-strip.png', [
    segment(0, 55, 64, 96, 0.5, 0.9167, 71, 0, false),
    segment(55, 77, 77, 96, 0.4935, 0.9167, 71, 1, false),
    segment(132, 81, 81, 96, 0.4938, 0.9167, 71, 2, false),
    segment(213, 93, 93, 96, 0.5, 0.9167, 71, 3, true),
    segment(306, 85, 86, 96, 0.5, 0.9167, 71, 3, true),
  ]),
  repair('striker-monkey', 'idle', 'idle-strip.png', [
    segment(0, 79, 79, 96, 0.5, 0.9167, 125, 0, true),
    segment(79, 74, 74, 96, 0.5, 0.9167, 125, 0, true),
    segment(153, 73, 72, 96, 0.5, 0.9167, 125, 0, true),
    segment(226, 50, 64, 96, 0.5, 0.9167, 125, 1, false),
    segment(276, 80, 80, 96, 0.5, 0.9167, 125, 2, false),
    segment(356, 82, 82, 96, 0.5, 0.9167, 125, 3, false),
  ]),
];

const entities = await listDirs(sourceFramesRoot);
const summary = [];
const rejected = [];
const preserved = [];

for (const entityId of entities) {
  const entityDir = path.join(sourceFramesRoot, entityId);
  const outputEntityDir = path.join(framesRoot, entityId);
  const target = entityCanvas.get(entityId) ?? defaultCanvas;
  const animations = await listDirs(entityDir);

  for (const animation of animations) {
    if (!shouldRepairSprite(entityId, animation)) {
      preserved.push({
        entityId,
        animation,
        reason: 'Approved/non-targeted animation preserved by sprite repair allowlist.',
      });
      continue;
    }
    const animationDir = path.join(entityDir, animation);
    const outputAnimationDir = path.join(outputEntityDir, animation);
    await fs.mkdir(outputAnimationDir, { recursive: true });
    const frameFiles = (await fs.readdir(animationDir)).filter((file) => file.endsWith('.png')).sort();

    for (const frameFile of frameFiles) {
      const framePath = path.join(animationDir, frameFile);
      const outputPath = path.join(outputAnimationDir, frameFile);
      const input = PNG.sync.read(await fs.readFile(framePath));
      const before = countNonTransparent(input);
      const cleaned = keepMainForeground(removeEdgeConnectedBackground(input));
      const cleanedBounds = getOpaqueBounds(cleaned);
      const accepted = cleanedBounds ? acceptsCleanup(input, cleaned, cleanedBounds) : false;
      const sourceForOutput = cleanedBounds ? cleaned : input;
      const bbox = getOpaqueBounds(sourceForOutput);
      const output = bbox ? normalizeToCanvas(sourceForOutput, bbox, target) : new PNG({ width: target.width, height: target.height });
      const outputForeground = countNonTransparent(output);
      if (outputForeground < 80) {
        await fs.rm(outputPath, { force: true });
        rejected.push({
          entityId,
          animation,
          frame: frameFile,
          reason: 'skipped_tiny_or_blank_frame',
          before,
          after: outputForeground,
        });
        continue;
      }
      await fs.writeFile(outputPath, PNG.sync.write(output));
      if (!accepted) {
        rejected.push({
          entityId,
          animation,
          frame: frameFile,
          reason: cleanedBounds ? 'cleanup_safety_flagged_component_cleanup_used' : 'no_foreground_after_cleanup_raw_used',
          before,
          after: countNonTransparent(cleaned),
        });
      }
      summary.push({
        entityId,
        animation,
        frame: frameFile,
        before,
        after: outputForeground,
        width: output.width,
        height: output.height,
        trimmed: Boolean(bbox),
        cleanupAccepted: accepted,
      });
    }
  }
}

for (const repairSpec of targetedFightcoreRepairs.filter((entry) => shouldRepairSprite(entry.entityId, entry.animation))) {
  await repairKnownFightcoreDirtyFrames(repairSpec, summary, rejected);
}

const reportPath = path.join(repoRoot, 'public', 'sprites', 'qa', 'cleanup-report.json');
await fs.mkdir(path.dirname(reportPath), { recursive: true });
await fs.writeFile(
  reportPath,
  JSON.stringify(
    {
      generatedAt: new Date().toISOString(),
      source: path.relative(repoRoot, sourceFramesRoot),
      rule: 'Approved animations are immutable unless explicitly targeted in scripts/sprite-repair-allowlist.mjs.',
      preserved,
      rejected,
      frames: summary,
    },
    null,
    2,
  ),
);

const byEntity = new Map();
for (const row of summary) {
  byEntity.set(row.entityId, (byEntity.get(row.entityId) ?? 0) + 1);
}

console.log('Cleaned sprite frames:');
for (const [entityId, count] of byEntity.entries()) {
  console.log(`- ${entityId}: ${count}`);
}
console.log(`Report: ${path.relative(repoRoot, reportPath)}`);
console.log(`Preserved ${preserved.length} non-allowlisted animation(s).`);
if (rejected.length > 0) {
  console.log(`Safety flagged ${rejected.length} frame(s); actor cleanup was used where foreground remained.`);
}

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
  return brightness < 30 && colorDistance < 38;
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

function keepMainForeground(source) {
  const output = clonePng(source);
  const visited = new Uint16Array(output.width * output.height);
  const components = [];
  let nextComponentId = 1;

  for (let y = 0; y < output.height; y += 1) {
    for (let x = 0; x < output.width; x += 1) {
      const pixel = y * output.width + x;
      if (visited[pixel] || output.data[pixel * 4 + 3] <= 8) continue;
      const component = floodComponent(output, x, y, visited, nextComponentId);
      if (component.area > 0) components.push(component);
      nextComponentId += 1;
    }
  }

  if (components.length <= 1) return output;

  components.sort((a, b) => b.area - a.area);
  const main = components.find((component) => !isSheetLabelComponent(component, output)) ?? components[0];
  const keep = new Set([main.id]);
  for (const component of components.slice(1)) {
    if (isSheetLabelComponent(component, output)) continue;
    if (component.minY > main.maxY + 18 && component.height <= 24) continue;

    const nearMain =
      component.maxX >= main.minX - 54 &&
      component.minX <= main.maxX + 54 &&
      component.maxY >= main.minY - 44 &&
      component.minY <= main.maxY + 44;
    if (component.area >= Math.max(24, main.area * 0.015) && nearMain) keep.add(component.id);
  }

  for (let y = 0; y < output.height; y += 1) {
    for (let x = 0; x < output.width; x += 1) {
      const pixel = y * output.width + x;
      const componentId = visited[pixel];
      if (componentId > 0 && !keep.has(componentId)) output.data[pixel * 4 + 3] = 0;
    }
  }

  return output;
}

function keepPrimaryForeground(source) {
  const output = clonePng(source);
  const visited = new Uint16Array(output.width * output.height);
  const components = [];
  let nextComponentId = 1;

  for (let y = 0; y < output.height; y += 1) {
    for (let x = 0; x < output.width; x += 1) {
      const pixel = y * output.width + x;
      if (visited[pixel] || output.data[pixel * 4 + 3] <= 8) continue;
      const component = floodComponent(output, x, y, visited, nextComponentId);
      if (component.area > 0 && !isSheetLabelComponent(component, output)) components.push(component);
      nextComponentId += 1;
    }
  }

  if (components.length <= 1) return output;

  components.sort((a, b) => b.area - a.area);
  const main = components[0];
  for (let pixel = 0; pixel < visited.length; pixel += 1) {
    const componentId = visited[pixel];
    if (componentId > 0 && componentId !== main.id) output.data[pixel * 4 + 3] = 0;
  }

  return output;
}

function removeCyanBleed(source) {
  const output = clonePng(source);
  for (let pixel = 0; pixel < output.width * output.height; pixel += 1) {
    const offset = pixel * 4;
    const red = output.data[offset];
    const green = output.data[offset + 1];
    const blue = output.data[offset + 2];
    const alpha = output.data[offset + 3];
    if (alpha <= 8) continue;
    const warmBody = red > 105 && red > green + 16 && red > blue + 12;
    const deepLinework = red < 70 && green < 70 && blue < 82;
    const isCyanOrBlueBleed =
      !warmBody &&
      !deepLinework &&
      green > 78 &&
      blue > 92 &&
      (blue > red + 12 || green > red + 8 || (red > 155 && green > 150 && blue > 150));
    if (isCyanOrBlueBleed) output.data[offset + 3] = 0;
  }
  return output;
}

function fillAlphaGaps(source) {
  const outside = markOutsideTransparency(source);
  const visited = new Uint8Array(source.width * source.height);
  const holes = [];

  for (let y = 0; y < source.height; y += 1) {
    for (let x = 0; x < source.width; x += 1) {
      const pixel = y * source.width + x;
      if (visited[pixel] || outside[pixel] || source.data[pixel * 4 + 3] > 8) continue;
      const hole = floodAlphaGap(source, x, y, visited, outside);
      if (hole && hole.area <= 260 && hole.width <= 34 && hole.height <= 34) holes.push(hole);
    }
  }

  if (holes.length === 0) return source;
  return paintGapsFromNeighbors(source, holes.flatMap((hole) => hole.pixels));
}

function fillDarkGaps(source) {
  const visited = new Uint8Array(source.width * source.height);
  const gapPixels = [];

  for (let y = 0; y < source.height; y += 1) {
    for (let x = 0; x < source.width; x += 1) {
      const pixel = y * source.width + x;
      if (visited[pixel] || !isDarkGapPixel(source, pixel)) continue;
      const gap = floodDarkGap(source, x, y, visited);
      if (!gap) continue;
      const skinnyArtifact = gap.area <= 18 && Math.max(gap.width, gap.height) >= 3;
      const enclosedArtifact = gap.area <= 70 && hasColoredNeighborRatio(source, gap) >= 0.58;
      if (skinnyArtifact || enclosedArtifact) gapPixels.push(...gap.pixels);
    }
  }

  if (gapPixels.length === 0) return source;
  return paintGapsFromNeighbors(source, gapPixels, isDarkGapPixel);
}

function markOutsideTransparency(png) {
  const outside = new Uint8Array(png.width * png.height);
  const queue = [];
  for (let x = 0; x < png.width; x += 1) queue.push([x, 0], [x, png.height - 1]);
  for (let y = 1; y < png.height - 1; y += 1) queue.push([0, y], [png.width - 1, y]);

  while (queue.length > 0) {
    const [x, y] = queue.pop();
    if (x < 0 || y < 0 || x >= png.width || y >= png.height) continue;
    const pixel = y * png.width + x;
    if (outside[pixel] || png.data[pixel * 4 + 3] > 8) continue;
    outside[pixel] = 1;
    queue.push([x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]);
  }
  return outside;
}

function floodAlphaGap(png, startX, startY, visited, outside) {
  const queue = [[startX, startY]];
  const pixels = [];
  let minX = startX;
  let minY = startY;
  let maxX = startX;
  let maxY = startY;

  while (queue.length > 0) {
    const [x, y] = queue.pop();
    if (x < 0 || y < 0 || x >= png.width || y >= png.height) continue;
    const pixel = y * png.width + x;
    if (visited[pixel] || outside[pixel] || png.data[pixel * 4 + 3] > 8) continue;
    visited[pixel] = 1;
    pixels.push(pixel);
    minX = Math.min(minX, x);
    minY = Math.min(minY, y);
    maxX = Math.max(maxX, x);
    maxY = Math.max(maxY, y);
    queue.push([x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]);
  }

  if (pixels.length === 0) return null;
  return { pixels, area: pixels.length, minX, minY, maxX, maxY, width: maxX - minX + 1, height: maxY - minY + 1 };
}

function floodDarkGap(png, startX, startY, visited) {
  const queue = [[startX, startY]];
  const pixels = [];
  let minX = startX;
  let minY = startY;
  let maxX = startX;
  let maxY = startY;

  while (queue.length > 0) {
    const [x, y] = queue.pop();
    if (x < 0 || y < 0 || x >= png.width || y >= png.height) continue;
    const pixel = y * png.width + x;
    if (visited[pixel] || !isDarkGapPixel(png, pixel)) continue;
    visited[pixel] = 1;
    pixels.push(pixel);
    minX = Math.min(minX, x);
    minY = Math.min(minY, y);
    maxX = Math.max(maxX, x);
    maxY = Math.max(maxY, y);
    queue.push([x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]);
  }

  if (pixels.length === 0) return null;
  return { pixels, area: pixels.length, minX, minY, maxX, maxY, width: maxX - minX + 1, height: maxY - minY + 1 };
}

function isDarkGapPixel(png, pixel) {
  const offset = pixel * 4;
  return png.data[offset + 3] > 8 && png.data[offset] < 18 && png.data[offset + 1] < 18 && png.data[offset + 2] < 22;
}

function hasColoredNeighborRatio(png, gap) {
  let checked = 0;
  let colored = 0;
  for (let y = gap.minY - 2; y <= gap.maxY + 2; y += 1) {
    for (let x = gap.minX - 2; x <= gap.maxX + 2; x += 1) {
      if (x < 0 || y < 0 || x >= png.width || y >= png.height) continue;
      if (x >= gap.minX && x <= gap.maxX && y >= gap.minY && y <= gap.maxY) continue;
      const pixel = y * png.width + x;
      const offset = pixel * 4;
      if (png.data[offset + 3] <= 8) continue;
      checked += 1;
      if (!isDarkGapPixel(png, pixel)) colored += 1;
    }
  }
  return colored / Math.max(1, checked);
}

function paintGapsFromNeighbors(source, pixels, rejectNeighbor = null) {
  const output = clonePng(source);
  const gapPixels = new Set(pixels);

  for (let pass = 0; pass < source.width + source.height && gapPixels.size > 0; pass += 1) {
    const changes = [];
    for (const pixel of gapPixels) {
      const x = pixel % source.width;
      const y = Math.floor(pixel / source.width);
      const color = averageVisibleNeighborColor(output, x, y, gapPixels, rejectNeighbor);
      if (color) changes.push([pixel, color]);
    }
    if (changes.length === 0) break;
    for (const [pixel, color] of changes) {
      const offset = pixel * 4;
      output.data[offset] = color[0];
      output.data[offset + 1] = color[1];
      output.data[offset + 2] = color[2];
      output.data[offset + 3] = 255;
      gapPixels.delete(pixel);
    }
  }

  return output;
}

function averageVisibleNeighborColor(png, x, y, gapPixels, rejectNeighbor) {
  let red = 0;
  let green = 0;
  let blue = 0;
  let alpha = 0;
  let count = 0;
  for (let oy = -2; oy <= 2; oy += 1) {
    for (let ox = -2; ox <= 2; ox += 1) {
      if (ox === 0 && oy === 0) continue;
      const nx = x + ox;
      const ny = y + oy;
      if (nx < 0 || ny < 0 || nx >= png.width || ny >= png.height) continue;
      const pixel = ny * png.width + nx;
      const offset = pixel * 4;
      if (gapPixels.has(pixel) || png.data[offset + 3] <= 8 || rejectNeighbor?.(png, pixel)) continue;
      red += png.data[offset];
      green += png.data[offset + 1];
      blue += png.data[offset + 2];
      alpha += png.data[offset + 3];
      count += 1;
    }
  }
  if (count === 0) return null;
  return [Math.round(red / count), Math.round(green / count), Math.round(blue / count), Math.round(alpha / count)];
}

function clearEdgeBleed(png, clearLeftPx = 0, clearRightPx = 0, clearLowerRightX = 0, clearLowerRightY = 0) {
  if (clearLeftPx <= 0 && clearRightPx <= 0 && clearLowerRightX <= 0) return;
  const leftLimit = Math.max(0, clearLeftPx);
  const rightStart = Math.max(0, png.width - clearRightPx);
  for (let y = 0; y < png.height; y += 1) {
    for (let x = 0; x < png.width; x += 1) {
      const inLowerRightBleed = clearLowerRightX > 0 && x >= clearLowerRightX && y >= clearLowerRightY;
      if (x >= leftLimit && x < rightStart && !inLowerRightBleed) continue;
      png.data[(y * png.width + x) * 4 + 3] = 0;
    }
  }
}

function isSheetLabelComponent(component, png) {
  const touchesCropEdge = component.minX <= 4 || component.minY <= 4 || component.maxY >= png.height - 5;
  return touchesCropEdge && component.height <= 24;
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

function acceptsCleanup(raw, cleaned, cleanedBounds) {
  const rawBounds = getEstimatedRawForegroundBounds(raw);
  if (!rawBounds) return true;

  const rawArea = rawBounds.width * rawBounds.height;
  const cleanedArea = cleanedBounds.width * cleanedBounds.height;
  const rawFilled = countForegroundInside(raw, rawBounds);
  const cleanedFilled = countNonTransparent(cleaned);
  const fillRatio = rawFilled > 0 ? cleanedFilled / rawFilled : 1;
  const widthRatio = cleanedBounds.width / rawBounds.width;
  const heightRatio = cleanedBounds.height / rawBounds.height;
  const cleanedAreaRatio = rawArea > 0 ? cleanedArea / rawArea : 1;

  if (fillRatio < 0.18) return false;
  if (widthRatio < 0.36 || heightRatio < 0.36) return false;
  if (cleanedAreaRatio < 0.2) return false;
  return true;
}

function getEstimatedRawForegroundBounds(png) {
  const bg = sampleBackgroundColor(png);
  let minX = png.width;
  let minY = png.height;
  let maxX = -1;
  let maxY = -1;

  for (let y = 0; y < png.height; y += 1) {
    for (let x = 0; x < png.width; x += 1) {
      const offset = (y * png.width + x) * 4;
      const r = png.data[offset];
      const g = png.data[offset + 1];
      const b = png.data[offset + 2];
      const a = png.data[offset + 3];
      const brightness = (r + g + b) / 3;
      const colorDistance = Math.hypot(r - bg[0], g - bg[1], b - bg[2]);
      if (a <= 8 || (brightness < 30 && colorDistance < 38)) continue;
      minX = Math.min(minX, x);
      minY = Math.min(minY, y);
      maxX = Math.max(maxX, x);
      maxY = Math.max(maxY, y);
    }
  }

  if (maxX < minX || maxY < minY) return null;
  return { minX, minY, maxX, maxY, width: maxX - minX + 1, height: maxY - minY + 1 };
}

function countForegroundInside(png, bounds) {
  const bg = sampleBackgroundColor(png);
  let count = 0;
  for (let y = bounds.minY; y <= bounds.maxY; y += 1) {
    for (let x = bounds.minX; x <= bounds.maxX; x += 1) {
      const offset = (y * png.width + x) * 4;
      const r = png.data[offset];
      const g = png.data[offset + 1];
      const b = png.data[offset + 2];
      const a = png.data[offset + 3];
      const brightness = (r + g + b) / 3;
      const colorDistance = Math.hypot(r - bg[0], g - bg[1], b - bg[2]);
      if (a > 8 && !(brightness < 30 && colorDistance < 38)) count += 1;
    }
  }
  return count;
}

function countNonTransparent(png) {
  let count = 0;
  for (let index = 3; index < png.data.length; index += 4) {
    if (png.data[index] > 8) count += 1;
  }
  return count;
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function repair(entityId, animation, stripPath, frames, options = {}) {
  return { entityId, animation, stripPath, frames, options };
}

function segment(sourceX, sourceWidth, width, height, anchorX, anchorY, durationMs, sourceFrameIndex, splitFromDirtyCrop, clearLeftPx = 0, clearRightPx = 0, clearLowerRightX = 0, clearLowerRightY = 0) {
  return {
    sourceX,
    sourceWidth,
    width,
    height,
    anchorX,
    anchorY,
    durationMs,
    sourceFrameIndex,
    splitFromDirtyCrop,
    clearLeftPx,
    clearRightPx,
    clearLowerRightX,
    clearLowerRightY,
  };
}

async function repairKnownFightcoreDirtyFrames(repairSpec, summary, rejected) {
  const sourcePath = path.join(fightcoreStripRoot, repairSpec.entityId, repairSpec.stripPath);
  const outputAnimationDir = path.join(framesRoot, repairSpec.entityId, repairSpec.animation);
  const strip = PNG.sync.read(await fs.readFile(sourcePath));

  await fs.rm(outputAnimationDir, { recursive: true, force: true });
  await fs.mkdir(outputAnimationDir, { recursive: true });

  for (const [index, frameSpec] of repairSpec.frames.entries()) {
    const frameFile = `${String(index + 1).padStart(4, '0')}.png`;
    const outputPath = path.join(outputAnimationDir, frameFile);
    const sourceCrop = cropPng(strip, frameSpec.sourceX, 0, frameSpec.sourceWidth, strip.height);
    let foreground = repairSpec.options?.removeCyanBleed
      ? removeCyanBleed(keepPrimaryForeground(removeEdgeConnectedBackground(sourceCrop)))
      : keepPrimaryForeground(removeEdgeConnectedBackground(sourceCrop));
    if (repairSpec.options?.fillAlphaGaps) foreground = fillAlphaGaps(foreground);
    if (repairSpec.options?.fillDarkGaps) foreground = fillDarkGaps(foreground);
    const bbox = getOpaqueBounds(foreground);

    if (!bbox) {
      rejected.push({
        entityId: repairSpec.entityId,
        animation: repairSpec.animation,
        frame: frameFile,
        reason: 'targeted_repair_blank_segment',
        source: path.relative(repoRoot, sourcePath),
        sourceX: frameSpec.sourceX,
        sourceWidth: frameSpec.sourceWidth,
      });
      continue;
    }

    let output = normalizeToCanvas(foreground, bbox, {
      width: frameSpec.width,
      height: frameSpec.height,
      anchorX: frameSpec.anchorX,
      anchorY: frameSpec.anchorY,
    });
    if (repairSpec.options?.fillAlphaGaps) output = fillAlphaGaps(output);
    if (repairSpec.options?.fillDarkGaps) output = fillDarkGaps(output);
    if (repairSpec.options?.removeCyanBleed) output = removeCyanBleed(output);
    clearEdgeBleed(output, frameSpec.clearLeftPx, frameSpec.clearRightPx, frameSpec.clearLowerRightX, frameSpec.clearLowerRightY);
    await fs.writeFile(outputPath, PNG.sync.write(output));
    summary.push({
      entityId: repairSpec.entityId,
      animation: repairSpec.animation,
      frame: frameFile,
      before: countNonTransparent(sourceCrop),
      after: countNonTransparent(output),
      width: output.width,
      height: output.height,
      trimmed: true,
      cleanupAccepted: true,
      targetedRepair: true,
      source: path.relative(repoRoot, sourcePath),
      sourceFrameIndex: frameSpec.sourceFrameIndex,
      splitFromDirtyCrop: frameSpec.splitFromDirtyCrop,
    });
  }
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
