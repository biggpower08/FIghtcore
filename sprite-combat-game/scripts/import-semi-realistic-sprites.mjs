import fs from 'node:fs/promises';
import path from 'node:path';
import { PNG } from 'pngjs';

const configPath = 'scripts/semi-realistic-frame-map.json';
const config = JSON.parse(await fs.readFile(configPath, 'utf8'));
const missing = [];
const metadata = [];
const report = [];

await fs.mkdir(config.outputDir, { recursive: true });
await fs.mkdir(config.stripOutputDir, { recursive: true });
await fs.mkdir(config.qaDir, { recursive: true });

for (const character of config.characters) {
  for (const animation of character.animations) {
    const sourcePath = path.join(config.sourceDir, animation.file);
    if (!(await exists(sourcePath))) {
      missing.push(sourcePath);
      report.push({ entityId: character.entityId, animationKey: animation.key, status: 'missing-source', sourcePath });
      continue;
    }

    const sheet = PNG.sync.read(await fs.readFile(sourcePath));
    removeLightBackground(sheet);
    const componentFrames = extractComponentFrames(sheet, animation.frames);
    const framesToWrite =
      componentFrames ??
      (sheet.width % animation.frames === 0
        ? extractEqualFrames(sheet, animation.frames)
        : undefined);
    if (!framesToWrite) {
      throw new Error(
        `${sourcePath} could not be segmented into ${animation.frames} frame(s). Update ${configPath} or inspect the source sheet.`,
      );
    }
    const frameWidth = framesToWrite[0]?.width ?? 0;
    const frameHeight = framesToWrite[0]?.height ?? 0;
    const outputDir = path.join(config.outputDir, character.entityId, animation.key);
    const stripDir = path.join(config.stripOutputDir, character.entityId);
    await fs.mkdir(outputDir, { recursive: true });
    await fs.mkdir(stripDir, { recursive: true });

    const frames = [];
    for (let frameIndex = 0; frameIndex < framesToWrite.length; frameIndex += 1) {
      const frame = framesToWrite[frameIndex];
      const bounds = foregroundBounds(frame);
      const anchor = anchorFromBounds(bounds, frameWidth, frameHeight, character.anchorX, character.anchorY);
      const fileName = `${String(frameIndex + 1).padStart(4, '0')}.png`;
      const outputPath = path.join(outputDir, fileName);
      await fs.writeFile(outputPath, PNG.sync.write(frame));
      frames.push(frame);
      metadata.push({
        entityId: character.entityId,
        animationKey: animation.key,
        frameIndex,
        framePath: webPath(outputPath),
        sourceSheet: sourcePath,
        sourceSheetLabel: character.sourceLabel,
        frameSize: { width: frameWidth, height: frameHeight },
        anchorX: anchor.anchorX,
        anchorY: anchor.anchorY,
        durationMs: animation.durationMs,
        foregroundBounds: bounds,
      });
    }

    const stripPath = path.join(stripDir, `${animation.key.replaceAll('_', '-')}-strip.png`);
    await fs.writeFile(stripPath, PNG.sync.write(joinFrames(frames, frameWidth, frameHeight)));
    await writeQaSheets(character.entityId, animation.key, frames, frameWidth, frameHeight);
    report.push({
      entityId: character.entityId,
      animationKey: animation.key,
      status: 'imported',
      sourcePath,
      frameCount: framesToWrite.length,
      frameSize: { width: frameWidth, height: frameHeight },
      outputDir: webPath(outputDir),
      stripPath: webPath(stripPath),
    });
  }
}

await fs.writeFile(config.metadataPath, renderMetadata(metadata));
await fs.writeFile(path.join(config.qaDir, 'semi-realistic-import-report.json'), `${JSON.stringify({ missing, report }, null, 2)}\n`);

console.log('Semi-realistic sprite import complete.');
console.log(`Imported animations: ${report.filter((entry) => entry.status === 'imported').length}`);
console.log(`Missing source sheets: ${missing.length}`);
for (const file of missing) console.log(`- ${file}`);

async function exists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

function extractFrame(source, x, y, width, height) {
  const frame = new PNG({ width, height });
  PNG.bitblt(source, frame, x, y, width, height, 0, 0);
  return frame;
}

function extractEqualFrames(sheet, frameCount) {
  const frameWidth = sheet.width / frameCount;
  return Array.from({ length: frameCount }, (_, index) => extractFrame(sheet, index * frameWidth, 0, frameWidth, sheet.height));
}

function extractComponentFrames(sheet, expectedCount) {
  const components = findOpaqueComponents(sheet).filter((component) => component.pixels > 1000);
  if (components.length !== expectedCount) return undefined;
  const padding = Math.max(24, Math.round(Math.min(sheet.width / expectedCount, sheet.height) * 0.05));
  const maxWidth = Math.max(...components.map((component) => component.width));
  const maxHeight = Math.max(...components.map((component) => component.height));
  const frameWidth = maxWidth + padding * 2;
  const frameHeight = maxHeight + padding * 2;
  return components.map((component) => {
    const frame = new PNG({ width: frameWidth, height: frameHeight });
    const destX = Math.round((frameWidth - component.width) / 2);
    const destY = frameHeight - padding - component.height;
    PNG.bitblt(sheet, frame, component.minX, component.minY, component.width, component.height, destX, destY);
    return frame;
  });
}

function findOpaqueComponents(frame) {
  const visited = new Uint8Array(frame.width * frame.height);
  const components = [];
  for (let y = 0; y < frame.height; y += 1) {
    for (let x = 0; x < frame.width; x += 1) {
      const start = y * frame.width + x;
      if (visited[start] || frame.data[start * 4 + 3] <= 16) continue;
      const component = floodComponent(frame, start, visited);
      if (component.pixels > 1000) components.push(component);
    }
  }
  return components.sort((a, b) => a.minX - b.minX);
}

function floodComponent(frame, start, visited) {
  const queue = [start];
  visited[start] = 1;
  let minX = start % frame.width;
  let maxX = minX;
  let minY = Math.floor(start / frame.width);
  let maxY = minY;
  let pixels = 0;
  for (let index = 0; index < queue.length; index += 1) {
    const current = queue[index];
    const x = current % frame.width;
    const y = Math.floor(current / frame.width);
    pixels += 1;
    minX = Math.min(minX, x);
    maxX = Math.max(maxX, x);
    minY = Math.min(minY, y);
    maxY = Math.max(maxY, y);
    for (const [dx, dy] of [
      [1, 0],
      [-1, 0],
      [0, 1],
      [0, -1],
    ]) {
      const nextX = x + dx;
      const nextY = y + dy;
      if (nextX < 0 || nextY < 0 || nextX >= frame.width || nextY >= frame.height) continue;
      const next = nextY * frame.width + nextX;
      if (visited[next] || frame.data[next * 4 + 3] <= 16) continue;
      visited[next] = 1;
      queue.push(next);
    }
  }
  return { minX, minY, maxX, maxY, width: maxX - minX + 1, height: maxY - minY + 1, pixels };
}

function removeLightBackground(frame) {
  for (let y = 0; y < frame.height; y += 1) {
    for (let x = 0; x < frame.width; x += 1) {
      const offset = (y * frame.width + x) * 4;
      const r = frame.data[offset];
      const g = frame.data[offset + 1];
      const b = frame.data[offset + 2];
      const a = frame.data[offset + 3];
      if (a === 0) continue;
      const max = Math.max(r, g, b);
      const min = Math.min(r, g, b);
      const looksWhiteOrGray = min > 218 && max - min < 22;
      const looksChecker = min > 190 && max - min < 40;
      if (looksWhiteOrGray || looksChecker) frame.data[offset + 3] = 0;
    }
  }
}

function foregroundBounds(frame) {
  let minX = frame.width;
  let minY = frame.height;
  let maxX = -1;
  let maxY = -1;
  let pixels = 0;
  for (let y = 0; y < frame.height; y += 1) {
    for (let x = 0; x < frame.width; x += 1) {
      const alpha = frame.data[(y * frame.width + x) * 4 + 3];
      if (alpha <= 16) continue;
      minX = Math.min(minX, x);
      minY = Math.min(minY, y);
      maxX = Math.max(maxX, x);
      maxY = Math.max(maxY, y);
      pixels += 1;
    }
  }
  if (maxX < minX || maxY < minY) return undefined;
  return { minX, minY, maxX, maxY, width: maxX - minX + 1, height: maxY - minY + 1, pixels };
}

function anchorFromBounds(bounds, width, height, fallbackX, fallbackY) {
  if (!bounds) return { anchorX: fallbackX, anchorY: fallbackY };
  return {
    anchorX: clamp(((bounds.minX + bounds.maxX + 1) / 2) / width, 0.25, 0.75),
    anchorY: clamp((bounds.maxY + 1) / height, 0.75, 0.98),
  };
}

function joinFrames(frames, width, height) {
  const strip = new PNG({ width: width * frames.length, height });
  for (const [index, frame] of frames.entries()) PNG.bitblt(frame, strip, 0, 0, width, height, index * width, 0);
  return strip;
}

async function writeQaSheets(entityId, animationKey, frames, width, height) {
  const transparent = joinFrames(frames, width, height);
  const white = new PNG({ width: transparent.width, height: transparent.height });
  for (let i = 0; i < white.data.length; i += 4) {
    white.data[i] = 255;
    white.data[i + 1] = 255;
    white.data[i + 2] = 255;
    white.data[i + 3] = 255;
  }
  composite(transparent, white, 0, 0);
  await fs.writeFile(path.join(config.qaDir, `${entityId}__${animationKey}__transparent-preview.png`), PNG.sync.write(transparent));
  await fs.writeFile(path.join(config.qaDir, `${entityId}__${animationKey}__white-check.png`), PNG.sync.write(white));
}

function composite(source, dest, destX, destY) {
  for (let y = 0; y < source.height; y += 1) {
    for (let x = 0; x < source.width; x += 1) {
      const sourceOffset = (y * source.width + x) * 4;
      const alpha = source.data[sourceOffset + 3] / 255;
      if (alpha <= 0) continue;
      const destOffset = ((destY + y) * dest.width + destX + x) * 4;
      dest.data[destOffset] = Math.round(source.data[sourceOffset] * alpha + dest.data[destOffset] * (1 - alpha));
      dest.data[destOffset + 1] = Math.round(source.data[sourceOffset + 1] * alpha + dest.data[destOffset + 1] * (1 - alpha));
      dest.data[destOffset + 2] = Math.round(source.data[sourceOffset + 2] * alpha + dest.data[destOffset + 2] * (1 - alpha));
      dest.data[destOffset + 3] = 255;
    }
  }
}

function renderMetadata(rows) {
  return `export interface SemiRealisticSpriteFrameMetadata {
  entityId: string;
  animationKey: string;
  frameIndex: number;
  framePath: string;
  sourceSheet: string;
  sourceSheetLabel: string;
  frameSize: { width: number; height: number };
  anchorX: number;
  anchorY: number;
  durationMs: number;
  foregroundBounds?: { minX: number; minY: number; maxX: number; maxY: number; width: number; height: number; pixels: number };
}

export const semiRealisticSpriteFrameMetadata: SemiRealisticSpriteFrameMetadata[] = [
${rows.map((row) => `  ${JSON.stringify(row)},`).join('\n')}
];

export function getSemiRealisticSpriteAnimation(entityId: string, animationKey: string): SemiRealisticSpriteFrameMetadata[] {
  return semiRealisticSpriteFrameMetadata.filter((frame) => frame.entityId === entityId && frame.animationKey === animationKey);
}

export function getSemiRealisticSpriteFrame(
  entityId: string,
  animationKey: string,
  frameIndex: number,
): SemiRealisticSpriteFrameMetadata | undefined {
  return semiRealisticSpriteFrameMetadata.find(
    (frame) => frame.entityId === entityId && frame.animationKey === animationKey && frame.frameIndex === frameIndex,
  );
}

export function hasSemiRealisticCharacterAssets(entityId: string, requiredAnimations: string[]): boolean {
  return requiredAnimations.every((animationKey) => getSemiRealisticSpriteAnimation(entityId, animationKey).length > 0);
}
`;
}

function webPath(filePath) {
  return filePath.replaceAll(path.sep, '/').replace(/^public/, '');
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}
