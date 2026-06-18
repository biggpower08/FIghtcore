import fs from 'node:fs/promises';
import path from 'node:path';
import { PNG } from 'pngjs';

const repoRoot = process.cwd();
const configPath = path.join(repoRoot, 'scripts', 'reference-frame-map.json');
const fixedStripConfigPath = path.join(repoRoot, 'scripts', 'fixed-strip-reference-map.json');
const framesRoot = path.join(repoRoot, 'public', 'sprites', 'frames-reference');
const stripsRoot = path.join(repoRoot, 'public', 'sprites', 'strips-reference');
const qaRoot = path.join(repoRoot, 'public', 'sprites', 'qa', 'reference-extraction');
const metadataPath = path.join(repoRoot, 'src', 'data', 'referenceSpriteFrames.ts');
const padding = 4;

const config = JSON.parse(await fs.readFile(configPath, 'utf8'));
const fixedStripConfig = await readOptionalJson(fixedStripConfigPath);
const report = [];
const metadata = [];

await fs.mkdir(framesRoot, { recursive: true });
await fs.mkdir(stripsRoot, { recursive: true });
await fs.mkdir(qaRoot, { recursive: true });

for (const [entityId, animations] of Object.entries(config)) {
  for (const [animationKey, spec] of Object.entries(animations)) {
    const sourcePath = path.join(repoRoot, spec.source);
    const source = PNG.sync.read(await fs.readFile(sourcePath));
    const frameWidth = spec.frameSize[0];
    const frameHeight = spec.frameSize[1];
    const baselineY = spec.baselineY ?? Math.round(frameHeight * 0.9167);
    const crops = spec.frames.map((frameSpec, frameIndex) => {
      const crop = cropPng(source, frameSpec.x, frameSpec.y, frameSpec.w, frameSpec.h);
      const transparent = removeReferenceBackground(crop);
      eraseConfiguredMasks(transparent, frameSpec.erase);
      const cleaned = keepRelevantComponents(transparent);
      const bounds = getOpaqueBounds(cleaned);
      if (!bounds) throw new Error(`No foreground in ${entityId}/${animationKey} frame ${frameIndex + 1}`);
      return { frameSpec, frameIndex, cleaned, bounds };
    });
    const maxContentWidth = Math.max(...crops.map((entry) => entry.bounds.width));
    const maxContentHeight = Math.max(...crops.map((entry) => entry.bounds.height));
    const scale = Math.min(1, (frameWidth - padding * 2) / maxContentWidth, (frameHeight - padding * 2) / maxContentHeight);
    const outputDir = path.join(framesRoot, entityId, animationKey);
    await fs.rm(outputDir, { recursive: true, force: true });
    await fs.mkdir(outputDir, { recursive: true });

    const frames = [];
    for (const entry of crops) {
      const frame = normalizeFrame(entry.cleaned, entry.bounds, {
        width: frameWidth,
        height: frameHeight,
        baselineY,
        scale,
      });
      const fileName = `${String(entry.frameIndex + 1).padStart(4, '0')}.png`;
      const outputPath = path.join(outputDir, fileName);
      await fs.writeFile(outputPath, PNG.sync.write(frame));
      frames.push({ fileName, png: frame, entry, path: webPath(outputPath) });
      metadata.push({
        entityId,
        animationKey,
        frameIndex: entry.frameIndex,
        framePath: webPath(outputPath),
        sourceSheet: spec.source,
        sourceSheetLabel: spec.sourceSheetLabel ?? spec.source,
        crop: {
          x: entry.frameSpec.x,
          y: entry.frameSpec.y,
          width: entry.frameSpec.w,
          height: entry.frameSpec.h,
        },
        frameSize: { width: frameWidth, height: frameHeight },
        baselineY,
        anchorX: spec.anchorX ?? 0.5,
        anchorY: spec.anchorY ?? baselineY / frameHeight,
        durationMs: entry.frameSpec.durationMs ?? spec.durationMs,
        backgroundRemoved: true,
        label: entry.frameSpec.label,
      });
    }

    const stripPath = path.join(stripsRoot, entityId, `${animationKey.replaceAll('_', '-')}-strip.png`);
    await fs.mkdir(path.dirname(stripPath), { recursive: true });
    await fs.writeFile(stripPath, PNG.sync.write(renderStrip(frames)));
    const whiteCheckPath = path.join(qaRoot, `${entityId}__${animationKey}__white-check.png`);
    const transparentReviewPath = path.join(qaRoot, `${entityId}__${animationKey}__transparent-review.png`);
    await fs.writeFile(whiteCheckPath, PNG.sync.write(renderWhiteCheck(frames)));
    await fs.writeFile(transparentReviewPath, PNG.sync.write(renderTransparentReview(frames)));

    report.push({
      entityId,
      animationKey,
      source: spec.source,
      frameCount: frames.length,
      frameSize: [frameWidth, frameHeight],
      baselineY,
      scale,
      outputFrames: path.relative(repoRoot, outputDir),
      strip: path.relative(repoRoot, stripPath),
      whiteCheck: path.relative(repoRoot, whiteCheckPath),
      transparentReview: path.relative(repoRoot, transparentReviewPath),
      frames: frames.map((frame) => ({
        frame: frame.fileName,
        crop: frame.entry.frameSpec,
        foregroundBounds: frame.entry.bounds,
      })),
    });
  }
}

for (const [entityId, animations] of Object.entries(fixedStripConfig)) {
  for (const [animationKey, spec] of Object.entries(animations)) {
    const animationMetadata = JSON.parse(await fs.readFile(path.join(repoRoot, spec.metadata), 'utf8'));
    const animation = animationMetadata.animations?.[animationKey];
    if (!animation) throw new Error(`Missing animation metadata for ${entityId}/${animationKey} in ${spec.metadata}`);
    const sourcePath = path.join(repoRoot, spec.source);
    const source = PNG.sync.read(await fs.readFile(sourcePath));
    const frameWidth = spec.frameSize[0];
    const frameHeight = spec.frameSize[1];
    const baselineY = spec.baselineY ?? animationMetadata.baselineY ?? Math.round(frameHeight * 0.9167);
    const skippedSourceFrameIndices = new Set(spec.skipSourceFrameIndices ?? []);
    const sourceFrames = animation.frames
      .map((frameSpec, sourceFrameIndex) => ({ frameSpec, sourceFrameIndex }))
      .filter((entry) => !skippedSourceFrameIndices.has(entry.sourceFrameIndex));
    const crops = sourceFrames.map(({ frameSpec, sourceFrameIndex }, frameIndex) => {
      const crop = cropPng(source, frameSpec.x, 0, frameSpec.w, frameSpec.h);
      const cleaned = keepRelevantComponents(crop);
      const bounds = getOpaqueBounds(cleaned);
      if (!bounds) throw new Error(`No foreground in fixed strip ${entityId}/${animationKey} frame ${frameIndex + 1}`);
      return { frameSpec, frameIndex, sourceFrameIndex, cleaned, bounds };
    });
    const maxContentWidth = Math.max(...crops.map((entry) => entry.bounds.width));
    const maxContentHeight = Math.max(...crops.map((entry) => entry.bounds.height));
    const scale = Math.min(1, (frameWidth - padding * 2) / maxContentWidth, (frameHeight - padding * 2) / maxContentHeight);
    const outputDir = path.join(framesRoot, entityId, animationKey);
    await fs.rm(outputDir, { recursive: true, force: true });
    await fs.mkdir(outputDir, { recursive: true });

    const frames = [];
    for (const entry of crops) {
      const frame = normalizeFrame(entry.cleaned, entry.bounds, {
        width: frameWidth,
        height: frameHeight,
        baselineY,
        scale,
      });
      const fileName = `${String(entry.frameIndex + 1).padStart(4, '0')}.png`;
      const outputPath = path.join(outputDir, fileName);
      await fs.writeFile(outputPath, PNG.sync.write(frame));
      frames.push({ fileName, png: frame, entry, path: webPath(outputPath) });
      metadata.push({
        entityId,
        animationKey,
        frameIndex: entry.frameIndex,
        framePath: webPath(outputPath),
        sourceSheet: spec.source,
        sourceSheetLabel: spec.sourceSheetLabel ?? spec.source,
        crop: {
          x: entry.frameSpec.x,
          y: 0,
          width: entry.frameSpec.w,
          height: entry.frameSpec.h,
        },
        frameSize: { width: frameWidth, height: frameHeight },
        baselineY,
        anchorX: spec.anchorX ?? 0.5,
        anchorY: spec.anchorY ?? baselineY / frameHeight,
        durationMs: spec.durationMs ?? Math.round(1000 / Math.max(1, animation.fps ?? 12)),
        backgroundRemoved: false,
        label: entry.frameSpec.label,
        sourceFrameIndex: entry.sourceFrameIndex,
      });
    }

    const stripPath = path.join(stripsRoot, entityId, `${animationKey.replaceAll('_', '-')}-strip.png`);
    await fs.mkdir(path.dirname(stripPath), { recursive: true });
    await fs.writeFile(stripPath, PNG.sync.write(renderStrip(frames)));
    const whiteCheckPath = path.join(qaRoot, `${entityId}__${animationKey}__white-check.png`);
    const transparentReviewPath = path.join(qaRoot, `${entityId}__${animationKey}__transparent-review.png`);
    await fs.writeFile(whiteCheckPath, PNG.sync.write(renderWhiteCheck(frames)));
    await fs.writeFile(transparentReviewPath, PNG.sync.write(renderTransparentReview(frames)));

    report.push({
      entityId,
      animationKey,
      source: spec.source,
      frameCount: frames.length,
      frameSize: [frameWidth, frameHeight],
      baselineY,
      scale,
      outputFrames: path.relative(repoRoot, outputDir),
      strip: path.relative(repoRoot, stripPath),
      whiteCheck: path.relative(repoRoot, whiteCheckPath),
      transparentReview: path.relative(repoRoot, transparentReviewPath),
      frames: frames.map((frame) => ({
        frame: frame.fileName,
        crop: frame.entry.frameSpec,
        foregroundBounds: frame.entry.bounds,
      })),
    });
  }
}

await fs.writeFile(path.join(qaRoot, 'reference-extraction-report.json'), JSON.stringify({ generatedAt: new Date().toISOString(), animations: report }, null, 2));
await fs.writeFile(metadataPath, renderMetadata(metadata));

console.log('Reference sprite extraction complete:');
for (const row of report) {
  console.log(`- ${row.entityId}/${row.animationKey}: ${row.frameCount} frame(s) -> ${row.outputFrames}`);
  console.log(`  strip: ${row.strip}`);
  console.log(`  QA: ${row.whiteCheck}`);
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

async function readOptionalJson(filePath) {
  try {
    return JSON.parse(await fs.readFile(filePath, 'utf8'));
  } catch (error) {
    if (error?.code === 'ENOENT') return {};
    throw error;
  }
}

function removeReferenceBackground(source) {
  const output = clonePng(source);
  for (let pixel = 0; pixel < output.width * output.height; pixel += 1) {
    const offset = pixel * 4;
    const r = output.data[offset];
    const g = output.data[offset + 1];
    const b = output.data[offset + 2];
    const a = output.data[offset + 3];
    if (a <= 8 || isCheckerboardBackground(r, g, b)) {
      output.data[offset + 3] = 0;
    }
  }
  return output;
}

function eraseConfiguredMasks(png, masks = []) {
  for (const mask of masks) {
    const minX = clamp(Math.round(mask.x), 0, png.width);
    const minY = clamp(Math.round(mask.y), 0, png.height);
    const maxX = clamp(Math.round(mask.x + mask.w), 0, png.width);
    const maxY = clamp(Math.round(mask.y + mask.h), 0, png.height);
    for (let y = minY; y < maxY; y += 1) {
      for (let x = minX; x < maxX; x += 1) {
        png.data[(y * png.width + x) * 4 + 3] = 0;
      }
    }
  }
}

function isCheckerboardBackground(r, g, b) {
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  return max - min <= 6 && min >= 214;
}

function keepRelevantComponents(source) {
  const output = clonePng(source);
  const visited = new Uint16Array(output.width * output.height);
  const components = [];
  let id = 1;
  for (let y = 0; y < output.height; y += 1) {
    for (let x = 0; x < output.width; x += 1) {
      const pixel = y * output.width + x;
      if (visited[pixel] || output.data[pixel * 4 + 3] <= 8) continue;
      const component = floodComponent(output, x, y, visited, id);
      if (component.area > 16) components.push(component);
      id += 1;
    }
  }
  if (components.length <= 1) return output;
  components.sort((a, b) => b.area - a.area);
  const main = components[0];
  const keep = new Set(
    components
      .filter((component) => {
        if (component === main) return true;
        const nearMain =
          component.minX <= main.maxX + 26 &&
          component.maxX >= main.minX - 26 &&
          component.minY <= main.maxY + 26 &&
          component.maxY >= main.minY - 26;
        return nearMain && component.area >= Math.max(24, main.area * 0.006);
      })
      .map((component) => component.id),
  );
  for (let pixel = 0; pixel < visited.length; pixel += 1) {
    if (visited[pixel] > 0 && !keep.has(visited[pixel])) output.data[pixel * 4 + 3] = 0;
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

function normalizeFrame(source, bounds, target) {
  const drawWidth = Math.max(1, Math.round(bounds.width * target.scale));
  const drawHeight = Math.max(1, Math.round(bounds.height * target.scale));
  const resized = resizeNearest(source, bounds, drawWidth, drawHeight);
  const output = new PNG({ width: target.width, height: target.height });
  const bodyCenter = foregroundCenterX(resized) ?? Math.round(drawWidth / 2);
  const dx = clamp(Math.round(target.width / 2 - bodyCenter), 0, target.width - drawWidth);
  const dy = clamp(target.baselineY - drawHeight, 0, target.height - drawHeight);
  blit(resized, output, dx, dy);
  return output;
}

function resizeNearest(source, bounds, width, height) {
  const output = new PNG({ width, height });
  for (let y = 0; y < height; y += 1) {
    const sy = bounds.minY + Math.min(bounds.height - 1, Math.floor((y / height) * bounds.height));
    for (let x = 0; x < width; x += 1) {
      const sx = bounds.minX + Math.min(bounds.width - 1, Math.floor((x / width) * bounds.width));
      const sourceOffset = (sy * source.width + sx) * 4;
      const targetOffset = (y * output.width + x) * 4;
      output.data[targetOffset] = source.data[sourceOffset];
      output.data[targetOffset + 1] = source.data[sourceOffset + 1];
      output.data[targetOffset + 2] = source.data[sourceOffset + 2];
      output.data[targetOffset + 3] = source.data[sourceOffset + 3];
    }
  }
  return output;
}

function foregroundCenterX(png) {
  let weightedX = 0;
  let total = 0;
  for (let y = 0; y < png.height; y += 1) {
    for (let x = 0; x < png.width; x += 1) {
      const alpha = png.data[(y * png.width + x) * 4 + 3];
      if (alpha <= 8) continue;
      weightedX += x * alpha;
      total += alpha;
    }
  }
  return total > 0 ? weightedX / total : null;
}

function renderStrip(frames) {
  const width = frames.reduce((total, frame) => total + frame.png.width, 0);
  const height = Math.max(...frames.map((frame) => frame.png.height));
  const output = new PNG({ width, height });
  let dx = 0;
  for (const frame of frames) {
    blit(frame.png, output, dx, 0);
    dx += frame.png.width;
  }
  return output;
}

function renderWhiteCheck(frames) {
  const scale = 3;
  const cellWidth = frames[0].png.width * scale;
  const cellHeight = frames[0].png.height * scale;
  const output = new PNG({ width: cellWidth * frames.length, height: cellHeight });
  output.data.fill(255);
  for (const [index, frame] of frames.entries()) {
    blitScaledOnWhite(frame.png, output, index * cellWidth, 0, scale);
    drawOutline(output, index * cellWidth, 0, cellWidth, cellHeight, [255, 0, 0, 255]);
  }
  return output;
}

function renderTransparentReview(frames) {
  const cellWidth = frames[0].png.width;
  const cellHeight = frames[0].png.height;
  const output = new PNG({ width: cellWidth * frames.length, height: cellHeight });
  for (const [index, frame] of frames.entries()) {
    blit(frame.png, output, index * cellWidth, 0);
    drawOutline(output, index * cellWidth, 0, cellWidth, cellHeight, [255, 0, 0, 255]);
  }
  return output;
}

function blit(source, target, dx, dy) {
  for (let y = 0; y < source.height; y += 1) {
    for (let x = 0; x < source.width; x += 1) {
      const sourceOffset = (y * source.width + x) * 4;
      const targetOffset = ((dy + y) * target.width + dx + x) * 4;
      if (source.data[sourceOffset + 3] <= 0) continue;
      target.data[targetOffset] = source.data[sourceOffset];
      target.data[targetOffset + 1] = source.data[sourceOffset + 1];
      target.data[targetOffset + 2] = source.data[sourceOffset + 2];
      target.data[targetOffset + 3] = source.data[sourceOffset + 3];
    }
  }
}

function blitScaledOnWhite(source, target, dx, dy, scale) {
  for (let y = 0; y < source.height * scale; y += 1) {
    for (let x = 0; x < source.width * scale; x += 1) {
      const sx = Math.floor(x / scale);
      const sy = Math.floor(y / scale);
      const sourceOffset = (sy * source.width + sx) * 4;
      const targetOffset = ((dy + y) * target.width + dx + x) * 4;
      const alpha = source.data[sourceOffset + 3] / 255;
      target.data[targetOffset] = Math.round(source.data[sourceOffset] * alpha + 255 * (1 - alpha));
      target.data[targetOffset + 1] = Math.round(source.data[sourceOffset + 1] * alpha + 255 * (1 - alpha));
      target.data[targetOffset + 2] = Math.round(source.data[sourceOffset + 2] * alpha + 255 * (1 - alpha));
      target.data[targetOffset + 3] = 255;
    }
  }
}

function drawOutline(png, x, y, width, height, color) {
  for (let ix = x; ix < x + width; ix += 1) {
    setPixel(png, ix, y, color);
    setPixel(png, ix, y + height - 1, color);
  }
  for (let iy = y; iy < y + height; iy += 1) {
    setPixel(png, x, iy, color);
    setPixel(png, x + width - 1, iy, color);
  }
}

function setPixel(png, x, y, color) {
  if (x < 0 || y < 0 || x >= png.width || y >= png.height) return;
  const offset = (y * png.width + x) * 4;
  png.data[offset] = color[0];
  png.data[offset + 1] = color[1];
  png.data[offset + 2] = color[2];
  png.data[offset + 3] = color[3];
}

function clonePng(source) {
  const output = new PNG({ width: source.width, height: source.height });
  source.data.copy(output.data);
  return output;
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function webPath(filePath) {
  return `/${path.relative(path.join(repoRoot, 'public'), filePath).replaceAll(path.sep, '/')}`;
}

function renderMetadata(rows) {
  return `export interface ReferenceSpriteFrameMetadata {
  entityId: string;
  animationKey: string;
  frameIndex: number;
  framePath: string;
  sourceSheet: string;
  sourceSheetLabel: string;
  crop: { x: number; y: number; width: number; height: number };
  frameSize: { width: number; height: number };
  baselineY: number;
  anchorX: number;
  anchorY: number;
  durationMs?: number;
  backgroundRemoved: boolean;
  label?: string;
  sourceFrameIndex?: number;
}

export const referenceSpriteFrameMetadata: ReferenceSpriteFrameMetadata[] = [
${rows.map((row) => `  ${JSON.stringify(row)},`).join('\n')}
];

export function getReferenceSpriteFrame(entityId: string, animationKey: string, frameIndex: number): ReferenceSpriteFrameMetadata | undefined {
  return referenceSpriteFrameMetadata.find((entry) => entry.entityId === entityId && entry.animationKey === animationKey && entry.frameIndex === frameIndex);
}

export function getReferenceSpriteAnimation(entityId: string, animationKey: string): ReferenceSpriteFrameMetadata[] {
  return referenceSpriteFrameMetadata
    .filter((entry) => entry.entityId === entityId && entry.animationKey === animationKey)
    .sort((a, b) => a.frameIndex - b.frameIndex);
}
`;
}
