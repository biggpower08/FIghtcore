import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { PNG } from 'pngjs';

const packRoot = path.resolve('public/sprite-packs');
const frameRoot = path.resolve('public/sprites/frames-pack');
const qaRoot = path.resolve('public/sprites/qa');
const outputPath = path.resolve('src/data/generatedSpriteRegistry.ts');

async function main() {
  const packs = await loadPacks();
  const imported = [];
  const reports = [];
  for (const pack of packs) {
    const result = await importPack(pack);
    imported.push(result.registry);
    reports.push(result.report);
  }
  await writeFile(outputPath, renderRegistry(imported));
  console.log(
    JSON.stringify(
      {
        packCount: packs.length,
        importedAnimations: reports.reduce((total, report) => total + report.animations.filter((animation) => animation.imported).length, 0),
        reports,
      },
      null,
      2,
    ),
  );
}

async function loadPacks() {
  let entries = [];
  try {
    entries = await readdir(packRoot, { withFileTypes: true });
  } catch {
    return [];
  }
  const packs = [];
  for (const entry of entries.filter((item) => item.isDirectory())) {
    const packDir = path.join(packRoot, entry.name);
    try {
      const manifest = JSON.parse(await readFile(path.join(packDir, 'character.json'), 'utf8'));
      packs.push(normalizeManifest(packDir, manifest));
    } catch (error) {
      console.warn(`Skipping ${entry.name}: ${error.message}`);
    }
  }
  return packs.sort((a, b) => a.id.localeCompare(b.id));
}

function normalizeManifest(packDir, manifest) {
  const animationEntries = Array.isArray(manifest.animations)
    ? manifest.animations.map((animation) => [animation.id, animation])
    : Object.entries(manifest.animations ?? {});
  return {
    packDir,
    id: String(manifest.id),
    displayName: String(manifest.name ?? manifest.displayName ?? manifest.id),
    style: manifest.style === 'semi-realistic' ? 'semi-realistic' : 'pixel-art',
    enabled: Boolean(manifest.enabled),
    targetBodyHeight: Number(manifest.targetBodyHeight ?? manifest.canonicalBodyHeight ?? 96),
    visualScale: Number(manifest.visualScale ?? 1),
    baselineY: Number(manifest.baselineY ?? manifest.outputCanvas?.h ?? 128),
    animations: animationEntries.map(([id, animation]) => ({
      id,
      file: animation.file,
      frames: Number(animation.frames ?? animation.frameCount ?? 1),
      loop: Boolean(animation.loop),
      fps: Number(animation.fps ?? 10),
      outputCanvas: animation.outputCanvas,
      dropDetachedComponents: Boolean(animation.dropDetachedComponents),
      frameDurations: Array.isArray(animation.frameDurations) ? animation.frameDurations.map((duration) => Number(duration)) : undefined,
      holdFrames: animation.holdFrames && typeof animation.holdFrames === 'object' ? animation.holdFrames : undefined,
    })),
  };
}

async function importPack(pack) {
  const registryAnimations = [];
  const report = { id: pack.id, enabled: pack.enabled, animations: [] };
  if (!pack.enabled) {
    return {
      registry: {
        id: pack.id,
        displayName: pack.displayName,
        style: pack.style,
        enabled: false,
        targetBodyHeight: pack.targetBodyHeight,
        visualScale: pack.visualScale,
        baselineY: pack.baselineY,
        animations: [],
      },
      report: {
        ...report,
        skipped: 'disabled',
        animations: pack.animations.map((animation) => ({
          id: animation.id,
          imported: false,
          skipped: 'disabled pack',
        })),
      },
    };
  }
  for (const animation of pack.animations) {
    const animationReport = await importAnimation(pack, animation);
    report.animations.push(animationReport);
    if (animationReport.imported) registryAnimations.push(animationReport.registry);
  }
  return {
    registry: {
      id: pack.id,
      displayName: pack.displayName,
      style: pack.style,
      enabled: pack.enabled,
      targetBodyHeight: pack.targetBodyHeight,
      visualScale: pack.visualScale,
      baselineY: pack.baselineY,
      animations: registryAnimations,
    },
    report,
  };
}

async function importAnimation(pack, animation) {
  const sourcePath = path.resolve(pack.packDir, animation.file ?? '');
  const outputDir = path.join(frameRoot, pack.id, animation.id);
  const qaDir = path.join(qaRoot, pack.id, animation.id);
  await mkdir(outputDir, { recursive: true });
  await mkdir(qaDir, { recursive: true });

  let source;
  try {
    source = PNG.sync.read(await readFile(sourcePath));
  } catch (error) {
    const missing = {
      id: animation.id,
      imported: false,
      sourcePath,
      errors: [`Missing or unreadable source image: ${error.message}`],
    };
    await writeFile(path.join(qaDir, 'metadata.json'), JSON.stringify(missing, null, 2));
    return missing;
  }

  const frameCount = Math.max(1, animation.frames);
  const frameSlices = detectFrameSlices(source, frameCount);
  const sourceFrameWidth = Math.max(...frameSlices.map((slice) => slice.w));
  const sourceFrameHeight = source.height;
  const frameBounds = [];
  const normalizedFrames = [];
  const bodyHeights = [];
  for (let index = 0; index < frameCount; index += 1) {
    const slice = frameSlices[index];
    const frame = cropFrame(source, slice.x, slice.y, slice.w, slice.h);
    removeFlatBackground(frame);
    if (animation.dropDetachedComponents) removeDetachedComponents(frame);
    const bounds = detectBounds(frame);
    frameBounds.push(bounds);
    if (bounds) bodyHeights.push(bounds.h);
  }
  const medianBodyHeight = median(bodyHeights) || pack.targetBodyHeight;
  const normalizedScale = pack.targetBodyHeight / Math.max(1, medianBodyHeight);
  const canvas = {
    w: Number(animation.outputCanvas?.w ?? Math.ceil(Math.max(sourceFrameWidth * normalizedScale, pack.targetBodyHeight * 1.35))),
    h: Number(animation.outputCanvas?.h ?? Math.ceil(Math.max(sourceFrameHeight * normalizedScale, pack.baselineY + 16))),
  };
  const baselineY = Math.min(canvas.h - 4, Number(animation.outputCanvas?.baselineY ?? pack.baselineY ?? canvas.h - 8));

  const warnings = [];
  for (let index = 0; index < frameCount; index += 1) {
    const slice = frameSlices[index];
    let frame = cropFrame(source, slice.x, slice.y, slice.w, slice.h);
    removeFlatBackground(frame);
    if (animation.dropDetachedComponents) removeDetachedComponents(frame);
    let bounds = frameBounds[index];
    let placeholderFromFrameIndex = null;
    if (!bounds) {
      const fallbackIndex = nearestFrameIndex(frameBounds, index);
      if (fallbackIndex >= 0) {
        const fallbackSlice = frameSlices[fallbackIndex];
        frame = cropFrame(source, fallbackSlice.x, fallbackSlice.y, fallbackSlice.w, fallbackSlice.h);
        removeFlatBackground(frame);
        if (animation.dropDetachedComponents) removeDetachedComponents(frame);
        bounds = frameBounds[fallbackIndex];
        placeholderFromFrameIndex = fallbackIndex;
        warnings.push(`frame ${index + 1}: no visible pixels; wrote placeholder from frame ${fallbackIndex + 1}`);
      } else {
        const framePath = `/sprites/frames-pack/${pack.id}/${animation.id}/${String(index + 1).padStart(4, '0')}.png`;
        const blank = new PNG({ width: canvas.w, height: canvas.h });
        await writeFile(path.join(outputDir, `${String(index + 1).padStart(4, '0')}.png`), PNG.sync.write(blank));
        warnings.push(`frame ${index + 1}: no visible pixels and no fallback frame available; wrote transparent placeholder`);
        normalizedFrames.push({
          frameIndex: index,
          framePath,
          frameSize: canvas,
          targetBodyHeight: pack.targetBodyHeight,
          visualScale: pack.visualScale,
          sourceSlice: slice,
          sourceBounds: null,
          bodyBounds: null,
          anchorX: 0.5,
          anchorY: baselineY / canvas.h,
          durationMs: durationForFrame(animation, index),
          holdCount: holdCountForFrame(animation, index),
          cutoff: false,
          placeholderFrame: true,
          placeholderFromFrameIndex: null,
          placeholderReason: 'empty_source_frame',
        });
        continue;
      }
    }
    const normalized = normalizeFrame(frame, bounds, canvas, baselineY, normalizedScale);
    const durationMs = durationForFrame(animation, index);
    const framePath = `/sprites/frames-pack/${pack.id}/${animation.id}/${String(index + 1).padStart(4, '0')}.png`;
    await writeFile(path.join(outputDir, `${String(index + 1).padStart(4, '0')}.png`), PNG.sync.write(normalized.png));
    const cutoff = normalized.cutoff;
    if (cutoff) warnings.push(`frame ${index + 1}: visible pixels reached output canvas edge`);
    if (bounds.x <= 1 || bounds.y <= 1 || bounds.x + bounds.w >= frame.width - 1 || bounds.y + bounds.h >= frame.height - 1) {
      warnings.push(`frame ${index + 1}: visible pixels reached source slice edge; possible frame bleed or tight crop`);
    }
    const backgroundArtifacts = countBackgroundArtifacts(frame);
    if (backgroundArtifacts > 500) warnings.push(`frame ${index + 1}: ${backgroundArtifacts} background-like opaque pixels remain after cleanup`);
    normalizedFrames.push({
      frameIndex: index,
      framePath,
      frameSize: canvas,
      targetBodyHeight: pack.targetBodyHeight,
      visualScale: pack.visualScale,
      sourceSlice: slice,
      sourceBounds: bounds,
      bodyBounds: normalized.bodyBounds,
      anchorX: 0.5,
      anchorY: baselineY / canvas.h,
      durationMs,
      holdCount: holdCountForFrame(animation, index),
      cutoff,
      ...(placeholderFromFrameIndex !== null
        ? {
            placeholderFrame: true,
            placeholderFromFrameIndex,
            placeholderReason: 'empty_source_frame',
          }
        : {}),
    });
  }

  const bodyVariance = varianceRatio(normalizedFrames.map((frame) => frame.bodyBounds?.h ?? 0));
  if (bodyVariance > 0.18) warnings.push(`body height variance ${(bodyVariance * 100).toFixed(1)}% exceeds 18%`);
  await writeQaSheets(qaDir, normalizedFrames, warnings, frameCount);
  const metadata = {
    id: animation.id,
    imported: true,
    sourcePath,
    outputDir: `/sprites/frames-pack/${pack.id}/${animation.id}`,
    frameCount,
    sourceFrameSize: { w: sourceFrameWidth, h: sourceFrameHeight },
    sourceSlices: frameSlices,
    outputCanvas: canvas,
    frameDurations: normalizedFrames.map((frame) => frame.durationMs),
    holdFrames: animation.holdFrames ?? {},
    targetBodyHeight: pack.targetBodyHeight,
    normalizedScale,
    bodyVariance,
    warnings,
    frames: normalizedFrames,
  };
  await writeFile(path.join(qaDir, 'metadata.json'), JSON.stringify(metadata, null, 2));
  return {
    ...metadata,
    registry: {
      id: animation.id,
      frameCount,
      fps: animation.fps,
      loop: animation.loop,
      outputCanvas: canvas,
      frameDurations: normalizedFrames.map((frame) => frame.durationMs),
      holdFrames: animation.holdFrames ?? {},
      warnings,
      frames: normalizedFrames,
    },
  };
}

function cropFrame(source, x, y, w, h) {
  const png = new PNG({ width: w, height: h });
  for (let row = 0; row < h; row += 1) {
    const srcStart = ((y + row) * source.width + x) * 4;
    const dstStart = row * w * 4;
    source.data.copy(png.data, dstStart, srcStart, srcStart + w * 4);
  }
  return png;
}

function detectFrameSlices(source, frameCount) {
  const prepared = clonePng(source);
  removeFlatBackground(prepared);
  const columns = [];
  for (let x = 0; x < prepared.width; x += 1) {
    let opaquePixels = 0;
    for (let y = 0; y < prepared.height; y += 1) {
      if (prepared.data[(y * prepared.width + x) * 4 + 3] > 20) opaquePixels += 1;
    }
    columns.push(opaquePixels);
  }

  const groups = [];
  let start = -1;
  let gap = 0;
  const minColumnPixels = Math.max(2, Math.round(prepared.height * 0.006));
  const maxGap = Math.max(8, Math.round((prepared.width / Math.max(1, frameCount)) * 0.025));
  for (let x = 0; x < columns.length; x += 1) {
    if (columns[x] >= minColumnPixels) {
      if (start < 0) start = x;
      gap = 0;
      continue;
    }
    if (start >= 0) {
      gap += 1;
      if (gap > maxGap) {
        groups.push({ start, end: x - gap });
        start = -1;
        gap = 0;
      }
    }
  }
  if (start >= 0) groups.push({ start, end: columns.length - 1 });

  const meaningfulGroups = groups
    .map((group) => {
      const x = Math.max(0, group.start - 24);
      const right = Math.min(prepared.width, group.end + 25);
      return { x, y: 0, w: right - x, h: prepared.height };
    })
    .filter((group) => group.w >= Math.max(24, (prepared.width / frameCount) * 0.18));

  if (meaningfulGroups.length === frameCount) return meaningfulGroups;

  const fallbackWidth = Math.floor(source.width / frameCount);
  return Array.from({ length: frameCount }, (_, index) => ({
    x: index * fallbackWidth,
    y: 0,
    w: index === frameCount - 1 ? source.width - index * fallbackWidth : fallbackWidth,
    h: source.height,
  }));
}

function clonePng(source) {
  const png = new PNG({ width: source.width, height: source.height });
  source.data.copy(png.data);
  return png;
}

function removeFlatBackground(png) {
  const corners = [
    rgbaAt(png, 0, 0),
    rgbaAt(png, png.width - 1, 0),
    rgbaAt(png, 0, png.height - 1),
    rgbaAt(png, png.width - 1, png.height - 1),
  ];
  const background = averageColor(corners);
  for (let y = 0; y < png.height; y += 1) {
    for (let x = 0; x < png.width; x += 1) {
      const offset = (y * png.width + x) * 4;
      const alpha = png.data[offset + 3];
      if (alpha <= 8 || colorDistance(png.data, offset, background) <= 18 || isCheckerColor(png.data, offset)) {
        png.data[offset + 3] = 0;
      }
    }
  }
}

function detectBounds(png) {
  let minX = png.width;
  let minY = png.height;
  let maxX = -1;
  let maxY = -1;
  let pixels = 0;
  for (let y = 0; y < png.height; y += 1) {
    for (let x = 0; x < png.width; x += 1) {
      const alpha = png.data[(y * png.width + x) * 4 + 3];
      if (alpha <= 20) continue;
      pixels += 1;
      minX = Math.min(minX, x);
      minY = Math.min(minY, y);
      maxX = Math.max(maxX, x);
      maxY = Math.max(maxY, y);
    }
  }
  if (maxX < minX || maxY < minY) return undefined;
  return { x: minX, y: minY, w: maxX - minX + 1, h: maxY - minY + 1, pixels };
}

function removeDetachedComponents(png) {
  const visited = new Int32Array(png.width * png.height);
  const components = [];
  let nextId = 1;
  for (let y = 0; y < png.height; y += 1) {
    for (let x = 0; x < png.width; x += 1) {
      const pixel = y * png.width + x;
      if (visited[pixel] || png.data[pixel * 4 + 3] <= 20) continue;
      const component = floodComponent(png, x, y, visited, nextId);
      if (component.pixels > 0) components.push(component);
      nextId += 1;
    }
  }
  if (components.length <= 1) return;
  components.sort((a, b) => b.pixels - a.pixels);
  const main = components[0];
  const keep = new Set([main.id]);
  for (const component of components.slice(1)) {
    const nearMain =
      component.minX <= main.maxX + 18 &&
      component.maxX >= main.minX - 18 &&
      component.minY <= main.maxY + 18 &&
      component.maxY >= main.minY - 18;
    if (nearMain && component.width > 5 && component.height > 5 && component.pixels >= Math.max(96, main.pixels * 0.02)) keep.add(component.id);
  }
  for (let pixel = 0; pixel < visited.length; pixel += 1) {
    if (visited[pixel] > 0 && !keep.has(visited[pixel])) {
      const offset = pixel * 4;
      png.data[offset] = 0;
      png.data[offset + 1] = 0;
      png.data[offset + 2] = 0;
      png.data[offset + 3] = 0;
    }
  }
}

function floodComponent(png, startX, startY, visited, id) {
  const queue = [[startX, startY]];
  visited[startY * png.width + startX] = id;
  let cursor = 0;
  let pixels = 0;
  let minX = startX;
  let minY = startY;
  let maxX = startX;
  let maxY = startY;
  while (cursor < queue.length) {
    const [x, y] = queue[cursor];
    cursor += 1;
    pixels += 1;
    minX = Math.min(minX, x);
    minY = Math.min(minY, y);
    maxX = Math.max(maxX, x);
    maxY = Math.max(maxY, y);
    for (const [dx, dy] of [
      [1, 0],
      [-1, 0],
      [0, 1],
      [0, -1],
    ]) {
      const nx = x + dx;
      const ny = y + dy;
      if (nx < 0 || ny < 0 || nx >= png.width || ny >= png.height) continue;
      const pixel = ny * png.width + nx;
      if (visited[pixel] || png.data[pixel * 4 + 3] <= 20) continue;
      visited[pixel] = id;
      queue.push([nx, ny]);
    }
  }
  return { id, pixels, minX, minY, maxX, maxY };
}

function countBackgroundArtifacts(png) {
  let pixels = 0;
  for (let y = 0; y < png.height; y += 1) {
    for (let x = 0; x < png.width; x += 1) {
      const offset = (y * png.width + x) * 4;
      if (png.data[offset + 3] <= 20) continue;
      const r = png.data[offset];
      const g = png.data[offset + 1];
      const b = png.data[offset + 2];
      const grayLike = Math.abs(r - g) < 5 && Math.abs(g - b) < 5 && r >= 205;
      const whiteLike = r >= 238 && g >= 238 && b >= 238;
      if (grayLike || whiteLike) pixels += 1;
    }
  }
  return pixels;
}

function normalizeFrame(frame, bounds, canvas, baselineY, scale) {
  const output = new PNG({ width: canvas.w, height: canvas.h });
  const scaledW = Math.max(1, Math.round(bounds.w * scale));
  const scaledH = Math.max(1, Math.round(bounds.h * scale));
  const dstX = Math.round(canvas.w / 2 - scaledW / 2);
  const dstY = Math.round(baselineY - scaledH);
  let cutoff = false;
  for (let y = 0; y < scaledH; y += 1) {
    for (let x = 0; x < scaledW; x += 1) {
      const srcX = bounds.x + Math.min(bounds.w - 1, Math.floor(x / scale));
      const srcY = bounds.y + Math.min(bounds.h - 1, Math.floor(y / scale));
      const outX = dstX + x;
      const outY = dstY + y;
      if (outX < 0 || outY < 0 || outX >= canvas.w || outY >= canvas.h) {
        cutoff = true;
        continue;
      }
      const src = (srcY * frame.width + srcX) * 4;
      const dst = (outY * canvas.w + outX) * 4;
      output.data[dst] = frame.data[src];
      output.data[dst + 1] = frame.data[src + 1];
      output.data[dst + 2] = frame.data[src + 2];
      output.data[dst + 3] = frame.data[src + 3];
    }
  }
  return {
    png: output,
    cutoff,
    bodyBounds: { x: Math.max(0, dstX), y: Math.max(0, dstY), w: Math.min(canvas.w, scaledW), h: Math.min(canvas.h, scaledH) },
  };
}

function durationForFrame(animation, index) {
  const explicit = Number(animation.frameDurations?.[index]);
  if (Number.isFinite(explicit) && explicit > 0) return Math.round(explicit);
  return Math.round((1000 / Math.max(1, animation.fps)) * holdCountForFrame(animation, index));
}

function holdCountForFrame(animation, index) {
  const key = String(index + 1).padStart(4, '0');
  const numeric = String(index + 1);
  const raw = animation.holdFrames?.[key] ?? animation.holdFrames?.[numeric] ?? 1;
  const hold = Number(raw);
  return Number.isFinite(hold) && hold > 0 ? hold : 1;
}

async function writeQaSheets(qaDir, frames, warnings, expectedFrameCount = frames.length) {
  const width = Math.max(1, ...frames.map((frame) => frame.frameSize.w)) * Math.max(1, frames.length);
  const height = Math.max(1, ...frames.map((frame) => frame.frameSize.h));
  const white = new PNG({ width, height });
  white.data.fill(255);
  const bounds = new PNG({ width, height });
  bounds.data.fill(255);
  for (const frame of frames) {
    const image = PNG.sync.read(await readFile(path.resolve(`public${frame.framePath}`)));
    blit(image, white, frame.frameIndex * image.width, 0);
    blit(image, bounds, frame.frameIndex * image.width, 0);
    drawRect(bounds, frame.frameIndex * image.width, 0, image.width, image.height, [35, 213, 221, 255]);
    if (frame.bodyBounds) drawRect(bounds, frame.frameIndex * image.width + frame.bodyBounds.x, frame.bodyBounds.y, frame.bodyBounds.w, frame.bodyBounds.h, [255, 237, 120, 255]);
  }
  await writeFile(path.join(qaDir, 'white-check.png'), PNG.sync.write(white));
  await writeFile(path.join(qaDir, 'bounds-check.png'), PNG.sync.write(bounds));
  await writeFile(path.join(qaDir, 'warnings.txt'), warnings.join('\n'));
  await writeFrameContinuityReport(qaDir, frames, expectedFrameCount, warnings);
}

async function writeFrameContinuityReport(qaDir, frames, expectedFrameCount, warnings = []) {
  const actualFilesFound = frames.map((frame) => `${String(frame.frameIndex + 1).padStart(4, '0')}.png`);
  const present = new Set(frames.map((frame) => frame.frameIndex + 1));
  const missingFrames = [];
  for (let frame = 1; frame <= expectedFrameCount; frame += 1) {
    if (!present.has(frame)) missingFrames.push(`${String(frame).padStart(4, '0')}.png`);
  }
  const bodyHeights = frames.map((frame) => frame.bodyBounds?.h ?? 0).filter((height) => height > 0);
  const anchors = frames.map((frame) => frame.anchorY ?? 0).filter((anchor) => anchor > 0);
  const report = {
    expectedFrames: expectedFrameCount,
    actualFilesFound,
    missingFrames,
    placeholderFrames: frames
      .filter((frame) => frame.placeholderFrame)
      .map((frame) => ({
        frame: `${String(frame.frameIndex + 1).padStart(4, '0')}.png`,
        placeholderFromFrame: Number.isInteger(frame.placeholderFromFrameIndex)
          ? `${String(frame.placeholderFromFrameIndex + 1).padStart(4, '0')}.png`
          : null,
        reason: frame.placeholderReason ?? 'placeholder',
      })),
    bodyHeightVariance: varianceRatio(bodyHeights),
    anchorVariance: varianceRatio(anchors),
    warnings: [
      ...warnings,
      ...(missingFrames.length ? [`missing frame slot(s): ${missingFrames.join(', ')}`] : []),
    ],
  };
  await writeFile(path.join(qaDir, 'frame-continuity.json'), JSON.stringify(report, null, 2));
}

function nearestFrameIndex(frameBounds, index) {
  let bestIndex = -1;
  let bestDistance = Number.POSITIVE_INFINITY;
  for (let candidate = 0; candidate < frameBounds.length; candidate += 1) {
    if (!frameBounds[candidate]) continue;
    const distance = Math.abs(candidate - index);
    if (distance < bestDistance) {
      bestIndex = candidate;
      bestDistance = distance;
    }
  }
  return bestIndex;
}

function blit(src, dst, dx, dy) {
  for (let y = 0; y < src.height; y += 1) {
    for (let x = 0; x < src.width; x += 1) {
      const source = (y * src.width + x) * 4;
      const target = ((dy + y) * dst.width + dx + x) * 4;
      if (src.data[source + 3] <= 0) continue;
      dst.data[target] = src.data[source];
      dst.data[target + 1] = src.data[source + 1];
      dst.data[target + 2] = src.data[source + 2];
      dst.data[target + 3] = 255;
    }
  }
}

function drawRect(png, x, y, w, h, color) {
  for (let px = x; px < x + w; px += 1) {
    setPixel(png, px, y, color);
    setPixel(png, px, y + h - 1, color);
  }
  for (let py = y; py < y + h; py += 1) {
    setPixel(png, x, py, color);
    setPixel(png, x + w - 1, py, color);
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

function rgbaAt(png, x, y) {
  const offset = (y * png.width + x) * 4;
  return [png.data[offset], png.data[offset + 1], png.data[offset + 2], png.data[offset + 3]];
}

function averageColor(colors) {
  return colors.reduce((avg, color) => [avg[0] + color[0] / colors.length, avg[1] + color[1] / colors.length, avg[2] + color[2] / colors.length], [0, 0, 0]);
}

function colorDistance(data, offset, color) {
  return Math.hypot(data[offset] - color[0], data[offset + 1] - color[1], data[offset + 2] - color[2]);
}

function isCheckerColor(data, offset) {
  const r = data[offset];
  const g = data[offset + 1];
  const b = data[offset + 2];
  return Math.abs(r - g) < 4 && Math.abs(g - b) < 4 && r >= 205;
}

function median(values) {
  const sorted = values.filter((value) => value > 0).sort((a, b) => a - b);
  if (sorted.length === 0) return 0;
  return sorted[Math.floor(sorted.length / 2)];
}

function varianceRatio(values) {
  const clean = values.filter((value) => value > 0);
  if (clean.length <= 1) return 0;
  const med = median(clean);
  return (Math.max(...clean) - Math.min(...clean)) / Math.max(1, med);
}

function renderRegistry(packs) {
  return `export interface GeneratedSpritePackFrame {
  frameIndex: number;
  framePath: string;
  frameSize: { w: number; h: number };
  targetBodyHeight?: number;
  visualScale?: number;
  sourceSlice?: { x: number; y: number; w: number; h: number };
  sourceBounds?: { x: number; y: number; w: number; h: number; pixels: number };
  bodyBounds?: { x: number; y: number; w: number; h: number };
  anchorX: number;
  anchorY: number;
  durationMs: number;
  holdCount?: number;
  cutoff?: boolean;
}

export interface GeneratedSpritePackAnimation {
  id: string;
  frameCount: number;
  fps?: number;
  loop?: boolean;
  outputCanvas?: { w: number; h: number };
  frameDurations?: number[];
  holdFrames?: Record<string, number>;
  warnings?: string[];
  frames: GeneratedSpritePackFrame[];
}

export interface GeneratedSpritePackCharacter {
  id: string;
  displayName: string;
  style: 'pixel-art' | 'semi-realistic';
  enabled: boolean;
  targetBodyHeight: number;
  visualScale: number;
  baselineY: number;
  animations: GeneratedSpritePackAnimation[];
}

export const generatedSpriteRegistry: GeneratedSpritePackCharacter[] = ${JSON.stringify(packs, null, 2)};

export function getGeneratedSpritePackAnimation(entityId: string, animationKey: string): GeneratedSpritePackAnimation | undefined {
  return generatedSpriteRegistry.find((pack) => pack.enabled && pack.id === entityId)?.animations.find((animation) => animation.id === animationKey);
}

export function getGeneratedSpritePackFrame(entityId: string, animationKey: string, frameIndex: number): GeneratedSpritePackFrame | undefined {
  return getGeneratedSpritePackAnimation(entityId, animationKey)?.frames.find((frame) => frame.frameIndex === frameIndex);
}
`;
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
