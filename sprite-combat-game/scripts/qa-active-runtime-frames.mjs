import fs from 'node:fs/promises';
import path from 'node:path';
import { PNG } from 'pngjs';

const repoRoot = process.cwd();
const publicRoot = path.join(repoRoot, 'public');
const qaRoot = path.join(publicRoot, 'sprites', 'qa');
const metadataPath = path.join(repoRoot, 'src', 'data', 'alphaHoleSpriteFrames.ts');
const alphaThreshold = 8;
const targets = [
  { entityId: 'ronin', animationKey: 'roundhouse_kick' },
  { entityId: 'ronin', animationKey: 'side_kick' },
];

const alphaMetadata = await readAlphaMetadata();
const summaries = [];

for (const target of targets) {
  summaries.push(await writeActiveRuntimeQa(target));
}

await fs.writeFile(
  path.join(qaRoot, 'ronin-active-runtime-cleanliness-summary.json'),
  `${JSON.stringify(
    {
      generatedAt: new Date().toISOString(),
      sourcePriority: ['manual-overrides', 'frames-alpha-repaired', 'frames-cleaned', 'frames-pack', 'raw frames'],
      targets: summaries,
    },
    null,
    2,
  )}\n`,
);

console.log(`Active-runtime QA wrote ${summaries.length} animation report(s).`);
for (const summary of summaries) {
  console.log(`${summary.entityId}:${summary.animationKey} ${summary.pass ? 'PASS' : 'FAIL'} using ${summary.activeRuntimeSources.join(', ')}`);
}

async function writeActiveRuntimeQa({ entityId, animationKey }) {
  const outputDir = path.join(qaRoot, entityId, animationKey);
  await fs.mkdir(outputDir, { recursive: true });
  const frameCount = await getFrameCount(entityId, animationKey);
  const frames = [];
  for (let index = 0; index < frameCount; index += 1) {
    frames.push(await resolveActiveFrame(entityId, animationKey, index));
  }

  const reports = [];
  for (const frame of frames) {
    const png = PNG.sync.read(await fs.readFile(frame.filePath));
    reports.push({
      ...frame,
      ...analyzeFrame(png),
      width: png.width,
      height: png.height,
    });
  }

  const failedFrames = reports
    .filter((report) => report.alphaHoleCount > 0 || report.lightArtifactPixels > 0 || report.edgeContact)
    .map((report) => report.frame);
  const pass = failedFrames.length === 0;
  const summary = {
    generatedAt: new Date().toISOString(),
    entityId,
    animationKey,
    pass,
    verdict: pass ? 'ACTIVE_RUNTIME_READY' : 'NOT_GAMEPLAY_READY',
    sourcePriority: ['manual-overrides', 'frames-alpha-repaired', 'frames-cleaned', 'frames-pack', 'raw frames'],
    activeRuntimeSources: [...new Set(reports.map((report) => report.sourcePriority))],
    activeRuntimeFramePaths: reports.map((report) => report.webPath),
    framesScanned: reports.length,
    failedFrames,
    manualOverridePaths: reports.map((report) => report.manualOverridePath),
    checks: {
      internalAlphaHoles: reports.reduce((total, report) => total + report.alphaHoleCount, 0),
      paleCutPixels: reports.reduce((total, report) => total + report.lightArtifactPixels, 0),
      canvasEdgeContactFrames: reports.filter((report) => report.edgeContact).map((report) => report.frame),
      silhouetteDamage: 'manual visual review still required',
      missingParts: 'manual visual review still required',
    },
  };

  await writeStrip(path.join(outputDir, 'active-runtime-transparent-strip.png'), reports, { transparent: true });
  await writeStrip(path.join(outputDir, 'active-runtime-white-check.png'), reports, { color: [255, 255, 255, 255] });
  await writeStrip(path.join(outputDir, 'active-runtime-dark-check.png'), reports, { color: [17, 18, 22, 255] });
  await writeStrip(path.join(outputDir, 'active-runtime-teal-check.png'), reports, { color: [0, 124, 128, 255] });
  await writeStrip(path.join(outputDir, 'active-runtime-red-check.png'), reports, { color: [150, 24, 32, 255] });
  await fs.writeFile(
    path.join(outputDir, 'active-runtime-alpha-hole-report.json'),
    `${JSON.stringify({ ...summary, frames: reports }, null, 2)}\n`,
  );
  await fs.writeFile(path.join(outputDir, 'active-runtime-cleanliness-summary.json'), `${JSON.stringify(summary, null, 2)}\n`);
  return summary;
}

async function resolveActiveFrame(entityId, animationKey, frameIndex) {
  const frameName = `${String(frameIndex + 1).padStart(4, '0')}.png`;
  const candidates = [
    {
      sourcePriority: 'manual-overrides',
      webPath: `/sprites/manual-overrides/${entityId}/${animationKey}/${frameName}`,
    },
    {
      sourcePriority: 'frames-alpha-repaired',
      webPath: alphaMetadata.get(`${entityId}:${animationKey}:${frameIndex}`)?.repairedFramePath,
    },
    {
      sourcePriority: 'frames-cleaned',
      webPath: `/sprites/frames-cleaned/${entityId}/${animationKey}/${frameName}`,
    },
    {
      sourcePriority: 'frames-pack',
      webPath: `/sprites/frames-pack/${entityId}/${animationKey}/${frameName}`,
    },
    {
      sourcePriority: 'raw frames',
      webPath: `/sprites/frames/${entityId}/${animationKey}/${frameName}`,
    },
  ].filter((candidate) => candidate.webPath);

  for (const candidate of candidates) {
    const filePath = path.join(publicRoot, candidate.webPath.slice(1));
    if (await exists(filePath)) {
      return {
        frame: frameName,
        frameIndex,
        sourcePriority: candidate.sourcePriority,
        webPath: candidate.webPath,
        filePath,
        manualOverridePath: path.join(publicRoot, 'sprites', 'manual-overrides', entityId, animationKey, frameName),
      };
    }
  }
  throw new Error(`No active runtime frame resolved for ${entityId}:${animationKey}:${frameName}`);
}

async function getFrameCount(entityId, animationKey) {
  const manifestPath = path.join(publicRoot, 'sprite-packs', entityId, 'character.json');
  const manifest = JSON.parse(await fs.readFile(manifestPath, 'utf8'));
  const count = manifest.animations?.[animationKey]?.frames;
  if (!Number.isInteger(count) || count <= 0) throw new Error(`Missing frame count for ${entityId}:${animationKey}`);
  return count;
}

function analyzeFrame(png) {
  const bounds = getOpaqueBounds(png);
  const holes = findInternalAlphaHoles(png);
  const lightArtifacts = findLightArtifacts(png, bounds);
  return {
    alphaHoleCount: holes.length,
    alphaHolePixels: holes.reduce((total, hole) => total + hole.area, 0),
    largestAlphaHolePixels: holes.reduce((largest, hole) => Math.max(largest, hole.area), 0),
    holes: holes.map((hole) => ({
      area: hole.area,
      bbox: { x: hole.minX, y: hole.minY, w: hole.width, h: hole.height },
      confidence: hole.confidence,
    })),
    lightArtifactPixels: lightArtifacts.totalPixels,
    lightArtifactBboxes: lightArtifacts.boxes,
    edgeContact: bounds.edgeContact,
    opaqueBounds: bounds.maxX >= bounds.minX ? { x: bounds.minX, y: bounds.minY, w: bounds.maxX - bounds.minX + 1, h: bounds.maxY - bounds.minY + 1 } : null,
    acceptableForGameplay: holes.length === 0 && lightArtifacts.totalPixels === 0 && !bounds.edgeContact,
  };
}

function getOpaqueBounds(png) {
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
      if (x === 0 || y === 0 || x === png.width - 1 || y === png.height - 1) edgeContact = true;
    }
  }
  return { minX, minY, maxX, maxY, edgeContact };
}

function findInternalAlphaHoles(png) {
  const outside = markOutsideTransparency(png);
  const visited = new Uint8Array(png.width * png.height);
  const holes = [];
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
  return holes;
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

async function writeStrip(filePath, reports, options) {
  const frames = await Promise.all(reports.map(async (report) => PNG.sync.read(await fs.readFile(report.filePath))));
  const gap = 14;
  const width = frames.reduce((total, frame) => total + frame.width, 0) + gap * (frames.length - 1);
  const height = Math.max(...frames.map((frame) => frame.height));
  const output = new PNG({ width, height });
  if (options.color) fill(output, ...options.color);
  let xOffset = 0;
  for (const frame of frames) {
    composite(output, frame, xOffset, Math.floor((height - frame.height) / 2));
    xOffset += frame.width + gap;
  }
  await fs.writeFile(filePath, PNG.sync.write(output));
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
      dest.data[dst + 3] = Math.round(source.data[src + 3] + dest.data[dst + 3] * (1 - alpha));
    }
  }
}

function fill(png, r, g, b, a) {
  for (let offset = 0; offset < png.data.length; offset += 4) {
    png.data[offset] = r;
    png.data[offset + 1] = g;
    png.data[offset + 2] = b;
    png.data[offset + 3] = a;
  }
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

async function readAlphaMetadata() {
  const source = await fs.readFile(metadataPath, 'utf8');
  const rows = new Map();
  for (const match of source.matchAll(/  (\{"entityId":.+?\}),/g)) {
    const entry = JSON.parse(match[1]);
    rows.set(`${entry.entityId}:${entry.animationKey}:${entry.frameIndex}`, entry);
  }
  return rows;
}

async function exists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}
