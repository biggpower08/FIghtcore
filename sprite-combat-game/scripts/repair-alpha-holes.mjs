import fs from 'node:fs/promises';
import path from 'node:path';
import { PNG } from 'pngjs';
import { shouldRepairSprite } from './sprite-repair-allowlist.mjs';

const repoRoot = process.cwd();
const framesRoot = path.join(repoRoot, 'public', 'sprites', 'frames');
const repairedRoot = path.join(repoRoot, 'public', 'sprites', 'frames-alpha-repaired');
const qaRoot = path.join(repoRoot, 'public', 'sprites', 'qa');
const metadataPath = path.join(repoRoot, 'src', 'data', 'alphaHoleSpriteFrames.ts');
const alphaThreshold = 8;
const maxAutoRepairHoleArea = 220;
const maxAutoRepairTotalArea = 360;
const maxAutoRepairHoleSpan = 32;

await fs.mkdir(repairedRoot, { recursive: true });
await fs.mkdir(qaRoot, { recursive: true });

const reports = [];
const preserved = [];
const entities = await listDirs(framesRoot);

for (const entityId of entities) {
  const entityDir = path.join(framesRoot, entityId);
  const animations = await listDirs(entityDir);
  for (const animationKey of animations) {
    if (!shouldRepairSprite(entityId, animationKey)) {
      preserved.push({
        entityId,
        animationKey,
        reason: 'Approved/non-targeted animation preserved by sprite repair allowlist.',
      });
      continue;
    }
    await fs.rm(path.join(repairedRoot, entityId, animationKey), { recursive: true, force: true });
    const animationDir = path.join(entityDir, animationKey);
    const frameFiles = (await fs.readdir(animationDir)).filter((file) => file.endsWith('.png')).sort();
    for (const [index, frameFile] of frameFiles.entries()) {
      const framePath = path.join(animationDir, frameFile);
      const png = PNG.sync.read(await fs.readFile(framePath));
      const analysis = analyzeAlphaHoles(png);
      if (analysis.alphaHoleCount === 0) continue;

      const canRepair = analysis.largeHoleCount === 0 && analysis.totalHoleArea <= maxAutoRepairTotalArea;
      let repairedPath;
      let repairedAlphaHoles = 0;
      if (canRepair) {
        const repaired = repairAlphaHoles(png, analysis.holes);
        const outputPath = path.join(repairedRoot, entityId, animationKey, frameFile);
        await fs.mkdir(path.dirname(outputPath), { recursive: true });
        await fs.writeFile(outputPath, PNG.sync.write(repaired));
        repairedPath = webPath(outputPath);
        repairedAlphaHoles = analysis.alphaHoleCount;
      }

      reports.push({
        entityId,
        animationKey,
        frameIndex: index,
        alphaHoleFrame: true,
        invalidHollowFrame: !canRepair,
        alphaHoleCount: analysis.alphaHoleCount,
        alphaHolePixels: analysis.totalHoleArea,
        largestAlphaHolePixels: analysis.largestHoleArea,
        repairedAlphaHoles,
        repairedFramePath: repairedPath,
        reason: canRepair
          ? 'Small enclosed transparent region was repaired with neighboring sprite pixels.'
          : 'Large enclosed transparent body gap needs regeneration or manual sprite repair.',
      });
    }
  }
}

await fs.writeFile(
  path.join(qaRoot, 'alpha-hole-report.json'),
  JSON.stringify(
    {
      generatedAt: new Date().toISOString(),
      rule: 'Approved animations are immutable unless explicitly targeted in scripts/sprite-repair-allowlist.mjs.',
      preserved,
      frames: reports,
    },
    null,
    2,
  ),
);
const preservedMetadata = await readPreservedAlphaMetadata(metadataPath);
await fs.writeFile(metadataPath, renderMetadata([...preservedMetadata, ...reports]));

console.log(`Alpha-hole QA scanned ${entities.length} entities.`);
console.log(`Detected ${reports.length} hollow frame(s).`);
console.log(`Auto-repaired ${reports.filter((entry) => entry.repairedFramePath).length} frame(s).`);
console.log(`Blocked ${reports.filter((entry) => entry.invalidHollowFrame).length} large hollow frame(s).`);
console.log(`Preserved ${preserved.length} non-allowlisted animation(s).`);
console.log(`Preserved ${preservedMetadata.length} existing non-allowlisted metadata row(s).`);
console.log(`Report: ${path.relative(repoRoot, path.join(qaRoot, 'alpha-hole-report.json'))}`);

async function readPreservedAlphaMetadata(filePath) {
  try {
    const source = await fs.readFile(filePath, 'utf8');
    return Array.from(source.matchAll(/  (\{"entityId":.+?\}),/g), (match) => JSON.parse(match[1])).filter(
      (entry) => !shouldRepairSprite(entry.entityId, entry.animationKey),
    );
  } catch {
    return [];
  }
}

async function listDirs(dir) {
  try {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    return entries.filter((entry) => entry.isDirectory()).map((entry) => entry.name).sort();
  } catch {
    return [];
  }
}

function analyzeAlphaHoles(png) {
  const outside = markOutsideTransparency(png);
  const visited = new Uint8Array(png.width * png.height);
  const holes = [];

  for (let y = 0; y < png.height; y += 1) {
    for (let x = 0; x < png.width; x += 1) {
      const pixel = y * png.width + x;
      if (visited[pixel] || outside[pixel] || isOpaque(png, x, y)) continue;
      const component = floodTransparentComponent(png, x, y, visited, outside);
      if (!component || component.area < 2) continue;
      if (!isRealBodyHole(png, component)) continue;
      holes.push(component);
    }
  }

  const largeHoleCount = holes.filter(
    (hole) => hole.area > maxAutoRepairHoleArea || hole.width > maxAutoRepairHoleSpan || hole.height > maxAutoRepairHoleSpan,
  ).length;
  return {
    holes,
    alphaHoleCount: holes.length,
    totalHoleArea: holes.reduce((total, hole) => total + hole.area, 0),
    largestHoleArea: holes.reduce((largest, hole) => Math.max(largest, hole.area), 0),
    largeHoleCount,
  };
}

function markOutsideTransparency(png) {
  const outside = new Uint8Array(png.width * png.height);
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

function isRealBodyHole(png, hole) {
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
  return opaqueNeighbors / Math.max(1, checkedNeighbors) >= 0.42;
}

function repairAlphaHoles(source, holes) {
  const output = clonePng(source);
  const holePixels = new Set(holes.flatMap((hole) => hole.pixels));
  let remaining = holePixels.size;
  let passes = 0;

  while (remaining > 0 && passes < source.width + source.height) {
    passes += 1;
    const changed = [];
    for (const pixel of holePixels) {
      if (output.data[pixel * 4 + 3] > alphaThreshold) continue;
      const x = pixel % output.width;
      const y = Math.floor(pixel / output.width);
      const color = averageNeighborColor(output, x, y);
      if (!color) continue;
      changed.push([pixel, color]);
    }
    if (changed.length === 0) break;
    for (const [pixel, color] of changed) {
      const offset = pixel * 4;
      output.data[offset] = color[0];
      output.data[offset + 1] = color[1];
      output.data[offset + 2] = color[2];
      output.data[offset + 3] = 255;
      holePixels.delete(pixel);
      remaining -= 1;
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

function isOpaque(png, x, y) {
  return png.data[(y * png.width + x) * 4 + 3] > alphaThreshold;
}

function clonePng(source) {
  const output = new PNG({ width: source.width, height: source.height });
  source.data.copy(output.data);
  return output;
}

function webPath(filePath) {
  return `/${path.relative(path.join(repoRoot, 'public'), filePath).replaceAll(path.sep, '/')}`;
}

function renderMetadata(entries) {
  const rows = entries
    .sort((a, b) => `${a.entityId}:${a.animationKey}:${a.frameIndex}`.localeCompare(`${b.entityId}:${b.animationKey}:${b.frameIndex}`))
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
