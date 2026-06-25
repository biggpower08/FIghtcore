import fs from 'node:fs/promises';
import path from 'node:path';
import { PNG } from 'pngjs';

const repoRoot = process.cwd();
const publicRoot = path.join(repoRoot, 'public');
const qaRoot = path.join(publicRoot, 'sprites', 'qa');
const repairedRoot = path.join(publicRoot, 'sprites', 'frames-alpha-repaired');
const metadataPath = path.join(repoRoot, 'src', 'data', 'alphaHoleSpriteFrames.ts');
const alphaThreshold = 8;
const maxAutoRepairHoleArea = 220;
const maxAutoRepairTotalArea = 360;
const maxAutoRepairHoleSpan = 32;

const defaultTargets = ['ronin:roundhouse_kick', 'ronin:side_kick'];
const targets = (process.env.SPRITE_ALPHA_HOLE_TARGETS ?? defaultTargets.join(','))
  .split(',')
  .map((entry) => entry.trim())
  .filter(Boolean)
  .map((entry) => {
    const [entityId, animationKey] = entry.split(':');
    if (!entityId || !animationKey) throw new Error(`Invalid target "${entry}". Expected entity:animation.`);
    return { entityId, animationKey };
  });

const scannedKeys = new Set();
const metadataEntries = [];
const summary = [];

for (const target of targets) {
  const report = await scanAnimation(target.entityId, target.animationKey);
  summary.push(report.summary);
  metadataEntries.push(...report.metadataEntries);
}

const preservedMetadata = await readPreservedAlphaMetadata(metadataPath, scannedKeys);
await fs.writeFile(metadataPath, renderMetadata([...preservedMetadata, ...metadataEntries]));
await fs.writeFile(
  path.join(qaRoot, 'ronin-kick-alpha-hole-summary.json'),
  `${JSON.stringify(
    {
      generatedAt: new Date().toISOString(),
      sourcePriority: ['manual-overrides', 'frames-cleaned', 'frames-pack'],
      targets: targets.map((target) => `${target.entityId}:${target.animationKey}`),
      summary,
    },
    null,
    2,
  )}\n`,
);

console.log(`Alpha-hole QA scanned ${targets.length} targeted animation(s).`);
console.log(`Detected ${summary.reduce((total, entry) => total + entry.framesWithAlphaHoles, 0)} frame(s) with alpha holes.`);
console.log(`Detected ${summary.reduce((total, entry) => total + entry.framesWithLightArtifacts, 0)} frame(s) with white/gray cut artifacts.`);
console.log(`Auto-repaired ${metadataEntries.filter((entry) => entry.repairedFramePath).length} frame(s).`);
console.log(`Summary: ${path.relative(repoRoot, path.join(qaRoot, 'ronin-kick-alpha-hole-summary.json'))}`);

async function scanAnimation(entityId, animationKey) {
  const frameFiles = await resolveFrameFiles(entityId, animationKey);
  const frameReports = [];
  const entries = [];
  await fs.mkdir(path.join(qaRoot, entityId, animationKey), { recursive: true });
  await fs.mkdir(path.join(repairedRoot, entityId, animationKey), { recursive: true });

  for (const [index, framePath] of frameFiles.entries()) {
    const frameName = `${String(index + 1).padStart(4, '0')}.png`;
    const png = PNG.sync.read(await fs.readFile(framePath));
    const analysis = analyzeFrame(png);
    const canRepair =
      analysis.alphaHoleCount > 0 &&
      analysis.largeHoleCount === 0 &&
      analysis.totalHoleArea <= maxAutoRepairTotalArea &&
      analysis.holes.every((hole) => hole.area <= maxAutoRepairHoleArea);
    let repairedFramePath;
    if (canRepair) {
      const repaired = repairAlphaHoles(png, analysis.holes);
      const outputPath = path.join(repairedRoot, entityId, animationKey, frameName);
      await fs.writeFile(outputPath, PNG.sync.write(repaired));
      repairedFramePath = webPath(outputPath);
    }

    const recommendation = recommendFrame(analysis, canRepair);
    const frameReport = {
      frame: frameName,
      frameIndex: index,
      runtimeFramePath: framePath,
      manualOverridePath: path.join(publicRoot, 'sprites', 'manual-overrides', entityId, animationKey, frameName),
      sourcePriority: sourcePriority(framePath),
      alphaHoleCount: analysis.alphaHoleCount,
      alphaHolePixels: analysis.totalHoleArea,
      largestAlphaHolePixels: analysis.largestHoleArea,
      holes: analysis.holes.map((hole) => ({
        area: hole.area,
        bbox: { x: hole.minX, y: hole.minY, w: hole.width, h: hole.height },
        confidence: hole.confidence,
        touchesOutsideTransparency: false,
      })),
      lightArtifactPixels: analysis.lightArtifactPixels,
      lightArtifactBboxes: analysis.lightArtifactBboxes,
      edgeContact: analysis.edgeContact,
      repairedFramePath,
      recommendation,
      acceptableForGameplay: recommendation === 'repair' || recommendation === 'ok',
    };
    frameReports.push(frameReport);
    scannedKeys.add(frameKey(entityId, animationKey, index));

    if (analysis.alphaHoleCount > 0 || analysis.lightArtifactPixels > 0 || recommendation !== 'ok') {
      entries.push({
        entityId,
        animationKey,
        frameIndex: index,
        alphaHoleFrame: analysis.alphaHoleCount > 0,
        invalidHollowFrame: recommendation === 'manual override needed' || recommendation === 'replace with stable fallback',
        alphaHoleCount: analysis.alphaHoleCount,
        alphaHolePixels: analysis.totalHoleArea,
        largestAlphaHolePixels: analysis.largestHoleArea,
        repairedAlphaHoles: repairedFramePath ? analysis.alphaHoleCount : 0,
        repairedFramePath,
        lightArtifactPixels: analysis.lightArtifactPixels,
        recommendation,
        reason: reasonFor(analysis, recommendation),
      });
    }
  }

  await writeDarkCheck(entityId, animationKey, frameFiles);
  const reportPath = path.join(qaRoot, entityId, animationKey, 'alpha-hole-report.json');
  const report = {
    generatedAt: new Date().toISOString(),
    entityId,
    animationKey,
    sourcePriority: ['manual-overrides', 'frames-cleaned', 'frames-pack'],
    frames: frameReports,
  };
  await fs.writeFile(reportPath, `${JSON.stringify(report, null, 2)}\n`);

  return {
    metadataEntries: entries,
    summary: {
      entityId,
      animationKey,
      reportPath: path.relative(repoRoot, reportPath),
      framesScanned: frameReports.length,
      framesWithAlphaHoles: frameReports.filter((frame) => frame.alphaHoleCount > 0).length,
      framesWithLightArtifacts: frameReports.filter((frame) => frame.lightArtifactPixels > 0).length,
      blockedFrames: frameReports.filter((frame) => !frame.acceptableForGameplay).map((frame) => frame.frame),
    },
  };
}

async function resolveFrameFiles(entityId, animationKey) {
  const dirs = [
    path.join(publicRoot, 'sprites', 'manual-overrides', entityId, animationKey),
    path.join(publicRoot, 'sprites', 'frames-cleaned', entityId, animationKey),
    path.join(publicRoot, 'sprites', 'frames-pack', entityId, animationKey),
  ];
  for (const dir of dirs) {
    const files = await listPngs(dir);
    if (files.length > 0) return files.map((file) => path.join(dir, file));
  }
  throw new Error(`No active frame files found for ${entityId}:${animationKey}`);
}

async function listPngs(dir) {
  try {
    return (await fs.readdir(dir)).filter((file) => /^\d{4}\.png$/u.test(file)).sort();
  } catch {
    return [];
  }
}

function analyzeFrame(png) {
  const outside = markOutsideTransparency(png);
  const visited = new Uint8Array(png.width * png.height);
  const holes = [];
  let minX = png.width;
  let minY = png.height;
  let maxX = -1;
  let maxY = -1;
  let edgeContact = false;

  for (let y = 0; y < png.height; y += 1) {
    for (let x = 0; x < png.width; x += 1) {
      if (!isOpaque(png, x, y)) continue;
      minX = Math.min(minX, x);
      minY = Math.min(minY, y);
      maxX = Math.max(maxX, x);
      maxY = Math.max(maxY, y);
      if (x <= 0 || y <= 0 || x >= png.width - 1 || y >= png.height - 1) edgeContact = true;
    }
  }

  for (let y = 0; y < png.height; y += 1) {
    for (let x = 0; x < png.width; x += 1) {
      const pixel = y * png.width + x;
      if (visited[pixel] || outside[pixel] || isOpaque(png, x, y)) continue;
      const component = floodTransparentComponent(png, x, y, visited, outside);
      if (!component || component.area < 2) continue;
      const confidence = estimateHoleConfidence(png, component);
      if (confidence < 0.42) continue;
      holes.push({ ...component, confidence: Number(confidence.toFixed(2)) });
    }
  }

  const lightArtifacts = findLightArtifacts(png, { minX, minY, maxX, maxY });
  const largeHoleCount = holes.filter(
    (hole) => hole.area > maxAutoRepairHoleArea || hole.width > maxAutoRepairHoleSpan || hole.height > maxAutoRepairHoleSpan,
  ).length;

  return {
    holes,
    alphaHoleCount: holes.length,
    totalHoleArea: holes.reduce((total, hole) => total + hole.area, 0),
    largestHoleArea: holes.reduce((largest, hole) => Math.max(largest, hole.area), 0),
    largeHoleCount,
    lightArtifactPixels: lightArtifacts.totalPixels,
    lightArtifactBboxes: lightArtifacts.boxes,
    edgeContact,
  };
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
    if (outside[pixel] || isOpaque(png, x, y)) continue;
    outside[pixel] = 1;
    queue.push([x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]);
  }
  return outside;
}

function floodTransparentComponent(png, startX, startY, visited, outside) {
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
    if (visited[pixel] || outside[pixel] || isOpaque(png, x, y)) continue;
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

function estimateHoleConfidence(png, hole) {
  let opaqueNeighbors = 0;
  let checkedNeighbors = 0;
  for (let y = hole.minY - 1; y <= hole.maxY + 1; y += 1) {
    for (let x = hole.minX - 1; x <= hole.maxX + 1; x += 1) {
      if (x < 0 || y < 0 || x >= png.width || y >= png.height) continue;
      if (x >= hole.minX && x <= hole.maxX && y >= hole.minY && y <= hole.maxY) continue;
      checkedNeighbors += 1;
      if (isOpaque(png, x, y)) opaqueNeighbors += 1;
    }
  }
  return opaqueNeighbors / Math.max(1, checkedNeighbors);
}

function findLightArtifacts(png, bounds) {
  if (bounds.maxX < bounds.minX || bounds.maxY < bounds.minY) return { totalPixels: 0, boxes: [] };
  const visited = new Uint8Array(png.width * png.height);
  const boxes = [];
  let totalPixels = 0;
  for (let y = bounds.minY + 2; y <= bounds.maxY - 2; y += 1) {
    for (let x = bounds.minX + 2; x <= bounds.maxX - 2; x += 1) {
      const pixel = y * png.width + x;
      if (visited[pixel] || !isLightCutPixel(png, x, y)) continue;
      const component = floodLightComponent(png, x, y, visited, bounds);
      if (component.area < 2) continue;
      totalPixels += component.area;
      boxes.push({ x: component.minX, y: component.minY, w: component.width, h: component.height, area: component.area });
    }
  }
  return { totalPixels, boxes: boxes.sort((a, b) => b.area - a.area).slice(0, 12) };
}

function floodLightComponent(png, startX, startY, visited, bounds) {
  const queue = [[startX, startY]];
  let area = 0;
  let minX = startX;
  let minY = startY;
  let maxX = startX;
  let maxY = startY;
  while (queue.length > 0) {
    const [x, y] = queue.pop();
    if (x < bounds.minX || y < bounds.minY || x > bounds.maxX || y > bounds.maxY) continue;
    const pixel = y * png.width + x;
    if (visited[pixel] || !isLightCutPixel(png, x, y)) continue;
    visited[pixel] = 1;
    area += 1;
    minX = Math.min(minX, x);
    minY = Math.min(minY, y);
    maxX = Math.max(maxX, x);
    maxY = Math.max(maxY, y);
    queue.push([x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]);
  }
  return { area, minX, minY, maxX, maxY, width: maxX - minX + 1, height: maxY - minY + 1 };
}

function repairAlphaHoles(source, holes) {
  const output = clonePng(source);
  const holePixels = new Set(holes.flatMap((hole) => hole.pixels));
  let passes = 0;
  while (holePixels.size > 0 && passes < source.width + source.height) {
    passes += 1;
    const changed = [];
    for (const pixel of holePixels) {
      const x = pixel % output.width;
      const y = Math.floor(pixel / output.width);
      const color = averageNeighborColor(output, x, y);
      if (color) changed.push([pixel, color]);
    }
    if (changed.length === 0) break;
    for (const [pixel, color] of changed) {
      const offset = pixel * 4;
      output.data[offset] = color[0];
      output.data[offset + 1] = color[1];
      output.data[offset + 2] = color[2];
      output.data[offset + 3] = 255;
      holePixels.delete(pixel);
    }
  }
  return output;
}

function averageNeighborColor(png, x, y) {
  let r = 0;
  let g = 0;
  let b = 0;
  let count = 0;
  for (let dy = -1; dy <= 1; dy += 1) {
    for (let dx = -1; dx <= 1; dx += 1) {
      if (dx === 0 && dy === 0) continue;
      const nx = x + dx;
      const ny = y + dy;
      if (nx < 0 || ny < 0 || nx >= png.width || ny >= png.height || !isOpaque(png, nx, ny)) continue;
      const offset = (ny * png.width + nx) * 4;
      r += png.data[offset];
      g += png.data[offset + 1];
      b += png.data[offset + 2];
      count += 1;
    }
  }
  if (count === 0) return null;
  return [Math.round(r / count), Math.round(g / count), Math.round(b / count)];
}

async function writeDarkCheck(entityId, animationKey, frameFiles) {
  const frames = await Promise.all(frameFiles.map(async (framePath) => PNG.sync.read(await fs.readFile(framePath))));
  const gap = 12;
  const width = frames.reduce((total, frame) => total + frame.width, 0) + gap * (frames.length - 1);
  const height = Math.max(...frames.map((frame) => frame.height));
  const output = new PNG({ width, height });
  fill(output, 21, 18, 16, 255);
  let xOffset = 0;
  for (const frame of frames) {
    composite(output, frame, xOffset, Math.floor((height - frame.height) / 2));
    xOffset += frame.width + gap;
  }
  await fs.writeFile(path.join(qaRoot, entityId, animationKey, 'dark-check.png'), PNG.sync.write(output));
}

function recommendFrame(analysis, canRepair) {
  if (analysis.lightArtifactPixels > 150) return 'manual override needed';
  if (analysis.largeHoleCount > 0 || analysis.totalHoleArea > maxAutoRepairTotalArea) return 'replace with stable fallback';
  if (canRepair) return 'repair';
  if (analysis.alphaHoleCount > 0) return 'manual override needed';
  return 'ok';
}

function reasonFor(analysis, recommendation) {
  if (analysis.lightArtifactPixels > 150) return `Frame has ${analysis.lightArtifactPixels} white/gray interior cut artifact pixels; source/manual replacement is preferred.`;
  if (analysis.alphaHoleCount > 0) return `Frame has ${analysis.alphaHoleCount} internal alpha hole(s), ${analysis.totalHoleArea} total transparent pixels. Recommendation: ${recommendation}.`;
  return `Frame QA recommendation: ${recommendation}.`;
}

function sourcePriority(framePath) {
  const normalized = framePath.replaceAll(path.sep, '/');
  if (normalized.includes('/manual-overrides/')) return 'manual-overrides';
  if (normalized.includes('/frames-cleaned/')) return 'frames-cleaned';
  if (normalized.includes('/frames-pack/')) return 'frames-pack';
  return 'unknown';
}

function isOpaque(png, x, y) {
  return png.data[(y * png.width + x) * 4 + 3] > alphaThreshold;
}

function isLightCutPixel(png, x, y) {
  const offset = (y * png.width + x) * 4;
  if (png.data[offset + 3] <= alphaThreshold) return false;
  const r = png.data[offset];
  const g = png.data[offset + 1];
  const b = png.data[offset + 2];
  return r >= 170 && g >= 170 && b >= 165 && Math.max(r, g, b) - Math.min(r, g, b) <= 34;
}

function clonePng(source) {
  const output = new PNG({ width: source.width, height: source.height });
  source.data.copy(output.data);
  return output;
}

function fill(png, r, g, b, a) {
  for (let offset = 0; offset < png.data.length; offset += 4) {
    png.data[offset] = r;
    png.data[offset + 1] = g;
    png.data[offset + 2] = b;
    png.data[offset + 3] = a;
  }
}

function composite(dest, source, xOffset, yOffset) {
  for (let y = 0; y < source.height; y += 1) {
    for (let x = 0; x < source.width; x += 1) {
      const src = (y * source.width + x) * 4;
      const alpha = source.data[src + 3] / 255;
      if (alpha <= 0) continue;
      const dx = x + xOffset;
      const dy = y + yOffset;
      const dst = (dy * dest.width + dx) * 4;
      dest.data[dst] = Math.round(source.data[src] * alpha + dest.data[dst] * (1 - alpha));
      dest.data[dst + 1] = Math.round(source.data[src + 1] * alpha + dest.data[dst + 1] * (1 - alpha));
      dest.data[dst + 2] = Math.round(source.data[src + 2] * alpha + dest.data[dst + 2] * (1 - alpha));
      dest.data[dst + 3] = 255;
    }
  }
}

async function readPreservedAlphaMetadata(filePath, replacedKeys) {
  try {
    const source = await fs.readFile(filePath, 'utf8');
    return Array.from(source.matchAll(/  (\{"entityId":.+?\}),/g), (match) => JSON.parse(match[1])).filter(
      (entry) => !replacedKeys.has(frameKey(entry.entityId, entry.animationKey, entry.frameIndex)),
    );
  } catch {
    return [];
  }
}

function renderMetadata(entries) {
  const rows = entries
    .sort((a, b) => frameKey(a.entityId, a.animationKey, a.frameIndex).localeCompare(frameKey(b.entityId, b.animationKey, b.frameIndex)))
    .map((entry) => `  ${JSON.stringify(entry)},`)
    .join('\n');

  return `export interface AlphaHoleSpriteFrameMetadata {
  entityId: string;
  animationKey: string;
  frameIndex: number;
  alphaHoleFrame: boolean;
  invalidHollowFrame: boolean;
  alphaHoleCount: number;
  alphaHolePixels: number;
  largestAlphaHolePixels: number;
  repairedAlphaHoles: number;
  repairedFramePath?: string;
  lightArtifactPixels?: number;
  recommendation?: string;
  reason: string;
}

export const alphaHoleSpriteFrameMetadata: AlphaHoleSpriteFrameMetadata[] = [
${rows}
];

export function getAlphaHoleSpriteFrame(entityId: string, animationKey: string, frameIndex: number): AlphaHoleSpriteFrameMetadata | undefined {
  return alphaHoleSpriteFrameMetadata.find((entry) => entry.entityId === entityId && entry.animationKey === animationKey && entry.frameIndex === frameIndex);
}
`;
}

function frameKey(entityId, animationKey, frameIndex) {
  return `${entityId}:${animationKey}:${frameIndex}`;
}

function webPath(filePath) {
  return `/${path.relative(publicRoot, filePath).replaceAll(path.sep, '/')}`;
}
