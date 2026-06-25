import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { PNG } from 'pngjs';

const repoRoot = process.cwd();
const uploadRoot = path.join(repoRoot, 'public', 'sprites', 'source-uploads', 'ronin-kicks');
const sourceRoot = path.join(repoRoot, 'public', 'sprites', 'semi-realistic-source');
const qaRoot = path.join(repoRoot, 'public', 'sprites', 'qa', 'ronin-source-build');

const outputHeight = 724;
const frameGap = 32;
const sourceSpecs = [
  {
    id: 'roundhouse_kick',
    output: path.join(sourceRoot, 'ronin_roundhouse_kick.png'),
    frameCanvasWidth: 720,
    sourceFrames: [
      { file: path.join(uploadRoot, 'Ronin_Roundhouse_0001-0004.png'), count: 4 },
      { file: path.join(uploadRoot, 'Ronin-Roundhouse-0005.png'), count: 1 },
    ],
  },
  {
    id: 'side_kick',
    output: path.join(sourceRoot, 'ronin_side_kick.png'),
    frameCanvasWidth: 760,
    sourceFrames: [{ file: path.join(uploadRoot, 'Ronin-Sidekick.png'), count: 5 }],
  },
];

const idleSpec = { file: path.join(sourceRoot, 'ronin_idle.png'), count: 5, frameIndex: 0 };
let componentsByPixel = new Int32Array(0);

await mkdir(sourceRoot, { recursive: true });
await mkdir(qaRoot, { recursive: true });

const idleFrames = await extractFrames(idleSpec.file, idleSpec.count);
const guardFrame = idleFrames[idleSpec.frameIndex];

const reports = [];
for (const spec of sourceSpecs) {
  const attackFrames = [];
  for (const sourceFrameSpec of spec.sourceFrames) {
    attackFrames.push(...(await extractFrames(sourceFrameSpec.file, sourceFrameSpec.count)));
  }
  const frames = [...attackFrames, guardFrame];
  const targetBodyHeight = median(attackFrames.map((frame) => frame.bounds?.h ?? 0).filter(Boolean));
  const targetBaselineY = median(attackFrames.map((frame) => (frame.bounds ? frame.bounds.y + frame.bounds.h : 0)).filter(Boolean));
  const normalizedFrames = frames.map((frame, index) =>
    normalizeFrame(frame.png, frame.bounds, {
      width: spec.frameCanvasWidth,
      height: outputHeight,
      targetBodyHeight,
      baselineY: targetBaselineY,
      isGuardFrame: index === frames.length - 1,
    }),
  );
  const strip = composeStrip(normalizedFrames, spec.frameCanvasWidth, outputHeight);
  await writeFile(spec.output, PNG.sync.write(strip));
  await writeFile(path.join(qaRoot, `${spec.id}-transparent-strip.png`), PNG.sync.write(strip));
  await writeFile(path.join(qaRoot, `${spec.id}-white-check.png`), PNG.sync.write(composeOnBackground(normalizedFrames, [255, 255, 255, 255])));
  reports.push({
    id: spec.id,
    output: spec.output,
    sourceFiles: spec.sourceFrames.map((sourceFrameSpec) => sourceFrameSpec.file),
    attackFrameCount: attackFrames.length,
    finalFrameCount: frames.length,
    appendedGuardSource: `${idleSpec.file} frame ${idleSpec.frameIndex + 1}`,
    targetBodyHeight,
    targetBaselineY,
    frameBounds: normalizedFrames.map((frame, index) => ({
      frame: String(index + 1).padStart(4, '0'),
      sourceBounds: frames[index].bounds,
      normalizedBounds: detectBounds(frame),
      guardReturnFrame: index === frames.length - 1,
    })),
  });
}

await writeFile(path.join(qaRoot, 'report.json'), JSON.stringify(reports, null, 2));
console.log(JSON.stringify({ reports }, null, 2));

async function extractFrames(filePath, frameCount) {
  const source = PNG.sync.read(await readFile(filePath));
  removeMatte(source);
  const slices = detectFrameSlices(source, frameCount);
  return slices.map((slice) => {
    const png = cropFrame(source, slice);
    trimDetachedMatte(png);
    return { filePath, slice, png, bounds: detectBounds(png) };
  });
}

function detectFrameSlices(source, frameCount) {
  const columns = [];
  for (let x = 0; x < source.width; x += 1) {
    let opaquePixels = 0;
    for (let y = 0; y < source.height; y += 1) {
      if (source.data[(y * source.width + x) * 4 + 3] > 20) opaquePixels += 1;
    }
    columns.push(opaquePixels);
  }
  const minColumnPixels = Math.max(2, Math.round(source.height * 0.01));
  const maxGap = Math.max(10, Math.round((source.width / frameCount) * 0.05));
  const groups = [];
  let start = -1;
  let gap = 0;
  for (let x = 0; x < source.width; x += 1) {
    if (columns[x] >= minColumnPixels) {
      if (start < 0) start = x;
      gap = 0;
      continue;
    }
    if (start < 0) continue;
    gap += 1;
    if (gap > maxGap) {
      groups.push({ start, end: x - gap });
      start = -1;
      gap = 0;
    }
  }
  if (start >= 0) groups.push({ start, end: source.width - 1 });
  const slices = groups
    .map((group) => ({
      x: Math.max(0, group.start - 16),
      y: 0,
      w: Math.min(source.width, group.end + 17) - Math.max(0, group.start - 16),
      h: source.height,
    }))
    .filter((slice) => slice.w >= Math.max(24, source.width / frameCount / 5));
  if (slices.length === frameCount) return slices;
  const width = Math.floor(source.width / frameCount);
  return Array.from({ length: frameCount }, (_, index) => ({
    x: index * width,
    y: 0,
    w: index === frameCount - 1 ? source.width - index * width : width,
    h: source.height,
  }));
}

function cropFrame(source, slice) {
  const png = new PNG({ width: slice.w, height: slice.h });
  for (let y = 0; y < slice.h; y += 1) {
    const srcStart = ((slice.y + y) * source.width + slice.x) * 4;
    const dstStart = y * slice.w * 4;
    source.data.copy(png.data, dstStart, srcStart, srcStart + slice.w * 4);
  }
  return png;
}

function normalizeFrame(source, bounds, options) {
  const output = new PNG({ width: options.width, height: options.height });
  if (!bounds) return output;
  const scale = options.targetBodyHeight / Math.max(1, bounds.h);
  const scaledW = Math.max(1, Math.round(bounds.w * scale));
  const scaledH = Math.max(1, Math.round(bounds.h * scale));
  const dstX = Math.round(options.width / 2 - scaledW / 2);
  const dstY = Math.round(options.baselineY - scaledH);
  for (let y = 0; y < scaledH; y += 1) {
    for (let x = 0; x < scaledW; x += 1) {
      const srcX = bounds.x + Math.min(bounds.w - 1, Math.floor(x / scale));
      const srcY = bounds.y + Math.min(bounds.h - 1, Math.floor(y / scale));
      const outX = dstX + x;
      const outY = dstY + y;
      if (outX < 0 || outY < 0 || outX >= output.width || outY >= output.height) continue;
      const src = (srcY * source.width + srcX) * 4;
      const dst = (outY * output.width + outX) * 4;
      output.data[dst] = source.data[src];
      output.data[dst + 1] = source.data[src + 1];
      output.data[dst + 2] = source.data[src + 2];
      output.data[dst + 3] = source.data[src + 3];
    }
  }
  return repairWhiteCheckArtifacts(output);
}

function composeStrip(frames, frameWidth, frameHeight) {
  const width = frames.length * frameWidth + Math.max(0, frames.length - 1) * frameGap;
  const strip = new PNG({ width, height: frameHeight });
  let x = 0;
  for (const frame of frames) {
    blit(frame, strip, x, 0);
    x += frameWidth + frameGap;
  }
  return strip;
}

function composeOnBackground(frames, background) {
  const width = frames.reduce((total, frame) => total + frame.width, 0) + Math.max(0, frames.length - 1) * frameGap;
  const height = Math.max(...frames.map((frame) => frame.height));
  const output = new PNG({ width, height });
  for (let pixel = 0; pixel < output.width * output.height; pixel += 1) {
    const offset = pixel * 4;
    output.data[offset] = background[0];
    output.data[offset + 1] = background[1];
    output.data[offset + 2] = background[2];
    output.data[offset + 3] = background[3];
  }
  let x = 0;
  for (const frame of frames) {
    blitOver(frame, output, x, 0);
    x += frame.width + frameGap;
  }
  return output;
}

function blit(source, target, targetX, targetY) {
  for (let y = 0; y < source.height; y += 1) {
    for (let x = 0; x < source.width; x += 1) {
      const src = (y * source.width + x) * 4;
      const dst = ((targetY + y) * target.width + targetX + x) * 4;
      source.data.copy(target.data, dst, src, src + 4);
    }
  }
}

function blitOver(source, target, targetX, targetY) {
  for (let y = 0; y < source.height; y += 1) {
    for (let x = 0; x < source.width; x += 1) {
      const src = (y * source.width + x) * 4;
      const alpha = source.data[src + 3] / 255;
      if (alpha <= 0) continue;
      const dst = ((targetY + y) * target.width + targetX + x) * 4;
      const inverse = 1 - alpha;
      target.data[dst] = Math.round(source.data[src] * alpha + target.data[dst] * inverse);
      target.data[dst + 1] = Math.round(source.data[src + 1] * alpha + target.data[dst + 1] * inverse);
      target.data[dst + 2] = Math.round(source.data[src + 2] * alpha + target.data[dst + 2] * inverse);
      target.data[dst + 3] = 255;
    }
  }
}

function removeMatte(png) {
  for (let y = 0; y < png.height; y += 1) {
    for (let x = 0; x < png.width; x += 1) {
      const offset = (y * png.width + x) * 4;
      const rgb = [png.data[offset], png.data[offset + 1], png.data[offset + 2]];
      if (isMatte(rgb)) {
        png.data[offset] = 0;
        png.data[offset + 1] = 0;
        png.data[offset + 2] = 0;
        png.data[offset + 3] = 0;
      }
    }
  }
}

function trimDetachedMatte(png) {
  const components = findComponents(png);
  if (components.length <= 1) return;
  components.sort((a, b) => b.pixels - a.pixels);
  const keep = components[0].id;
  for (let pixel = 0; pixel < png.width * png.height; pixel += 1) {
    if (componentsByPixel[pixel] === keep || png.data[pixel * 4 + 3] <= 20) continue;
    const offset = pixel * 4;
    png.data[offset] = 0;
    png.data[offset + 1] = 0;
    png.data[offset + 2] = 0;
    png.data[offset + 3] = 0;
  }
  const repaired = repairWhiteCheckArtifacts(png);
  repaired.data.copy(png.data);
}

function findComponents(png) {
  componentsByPixel = new Int32Array(png.width * png.height);
  const components = [];
  let id = 1;
  for (let y = 0; y < png.height; y += 1) {
    for (let x = 0; x < png.width; x += 1) {
      const pixel = y * png.width + x;
      if (componentsByPixel[pixel] || png.data[pixel * 4 + 3] <= 20) continue;
      const component = flood(png, x, y, id);
      components.push(component);
      id += 1;
    }
  }
  return components;
}

function flood(png, startX, startY, id) {
  const stack = [[startX, startY]];
  componentsByPixel[startY * png.width + startX] = id;
  let pixels = 0;
  let minX = startX;
  let minY = startY;
  let maxX = startX;
  let maxY = startY;
  while (stack.length) {
    const [x, y] = stack.pop();
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
      if (componentsByPixel[pixel] || png.data[pixel * 4 + 3] <= 20) continue;
      componentsByPixel[pixel] = id;
      stack.push([nx, ny]);
    }
  }
  return { id, pixels, minX, minY, maxX, maxY };
}

function detectBounds(png) {
  let minX = png.width;
  let minY = png.height;
  let maxX = -1;
  let maxY = -1;
  let pixels = 0;
  for (let y = 0; y < png.height; y += 1) {
    for (let x = 0; x < png.width; x += 1) {
      if (png.data[(y * png.width + x) * 4 + 3] <= 20) continue;
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

function repairWhiteCheckArtifacts(source) {
  const alphaFilled = fillAlphaGaps(source);
  return repaintLightCuts(alphaFilled);
}

function fillAlphaGaps(source) {
  const outside = markOutsideTransparency(source);
  const visited = new Uint8Array(source.width * source.height);
  const holes = [];

  for (let y = 0; y < source.height; y += 1) {
    for (let x = 0; x < source.width; x += 1) {
      const pixel = y * source.width + x;
      if (visited[pixel] || outside[pixel] || source.data[pixel * 4 + 3] > 8) continue;
      const hole = floodTransparentComponent(source, x, y, visited, outside);
      if (!hole || hole.area > 420 || hole.width > 42 || hole.height > 42) continue;
      if (estimateBodyHoleConfidence(source, hole) < 0.42) continue;
      holes.push(hole);
    }
  }

  if (holes.length === 0) return source;
  return paintPixelsFromNeighbors(source, holes.flatMap((hole) => hole.pixels));
}

function repaintLightCuts(source) {
  const bounds = detectBounds(source);
  if (!bounds) return source;
  const visited = new Uint8Array(source.width * source.height);
  const cutPixels = [];

  for (let y = bounds.y + 2; y < bounds.y + bounds.h - 2; y += 1) {
    for (let x = bounds.x + 2; x < bounds.x + bounds.w - 2; x += 1) {
      const pixel = y * source.width + x;
      if (visited[pixel] || !isLightCutPixel(source, x, y)) continue;
      const cut = floodLightCutComponent(source, x, y, visited, bounds);
      if (!cut || cut.area < 2 || cut.area > 520 || cut.width > 46 || cut.height > 46) continue;
      if (estimateLightCutConfidence(source, cut) < 0.48) continue;
      cutPixels.push(...cut.pixels);
    }
  }

  if (cutPixels.length === 0) return source;
  return paintPixelsFromNeighbors(source, cutPixels);
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

function floodLightCutComponent(png, startX, startY, visited, bounds) {
  const queue = [[startX, startY]];
  const pixels = [];
  let minX = startX;
  let minY = startY;
  let maxX = startX;
  let maxY = startY;

  while (queue.length > 0) {
    const [x, y] = queue.pop();
    if (x < bounds.x || y < bounds.y || x >= bounds.x + bounds.w || y >= bounds.y + bounds.h) continue;
    const pixel = y * png.width + x;
    if (visited[pixel] || !isLightCutPixel(png, x, y)) continue;
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

function estimateBodyHoleConfidence(png, hole) {
  let opaqueNeighbors = 0;
  let checkedNeighbors = 0;
  for (let y = hole.minY - 1; y <= hole.maxY + 1; y += 1) {
    for (let x = hole.minX - 1; x <= hole.maxX + 1; x += 1) {
      if (x < 0 || y < 0 || x >= png.width || y >= png.height) continue;
      if (x >= hole.minX && x <= hole.maxX && y >= hole.minY && y <= hole.maxY) continue;
      checkedNeighbors += 1;
      if (png.data[(y * png.width + x) * 4 + 3] > 8) opaqueNeighbors += 1;
    }
  }
  return opaqueNeighbors / Math.max(1, checkedNeighbors);
}

function estimateLightCutConfidence(png, cut) {
  let darkNeighbors = 0;
  let checkedNeighbors = 0;
  for (let y = cut.minY - 1; y <= cut.maxY + 1; y += 1) {
    for (let x = cut.minX - 1; x <= cut.maxX + 1; x += 1) {
      if (x < 0 || y < 0 || x >= png.width || y >= png.height) continue;
      if (x >= cut.minX && x <= cut.maxX && y >= cut.minY && y <= cut.maxY) continue;
      const offset = (y * png.width + x) * 4;
      if (png.data[offset + 3] <= 8) continue;
      checkedNeighbors += 1;
      if (!isLightCutPixel(png, x, y)) darkNeighbors += 1;
    }
  }
  return darkNeighbors / Math.max(1, checkedNeighbors);
}

function paintPixelsFromNeighbors(source, pixels) {
  const output = clonePng(source);
  const pending = new Set(pixels);

  for (let pass = 0; pass < source.width + source.height && pending.size > 0; pass += 1) {
    const changes = [];
    for (const pixel of pending) {
      const x = pixel % source.width;
      const y = Math.floor(pixel / source.width);
      const color = averageVisibleNeighborColor(output, x, y, pending);
      if (color) changes.push([pixel, color]);
    }
    if (changes.length === 0) break;
    for (const [pixel, color] of changes) {
      const offset = pixel * 4;
      output.data[offset] = color[0];
      output.data[offset + 1] = color[1];
      output.data[offset + 2] = color[2];
      output.data[offset + 3] = 255;
      pending.delete(pixel);
    }
  }

  return output;
}

function averageVisibleNeighborColor(png, x, y, ignoredPixels) {
  let red = 0;
  let green = 0;
  let blue = 0;
  let count = 0;
  for (let oy = -2; oy <= 2; oy += 1) {
    for (let ox = -2; ox <= 2; ox += 1) {
      if (ox === 0 && oy === 0) continue;
      const nx = x + ox;
      const ny = y + oy;
      if (nx < 0 || ny < 0 || nx >= png.width || ny >= png.height) continue;
      const pixel = ny * png.width + nx;
      const offset = pixel * 4;
      if (ignoredPixels.has(pixel) || png.data[offset + 3] <= 8 || isLightCutPixel(png, nx, ny)) continue;
      red += png.data[offset];
      green += png.data[offset + 1];
      blue += png.data[offset + 2];
      count += 1;
    }
  }
  if (count === 0) return null;
  return [Math.round(red / count), Math.round(green / count), Math.round(blue / count)];
}

function isLightCutPixel(png, x, y) {
  const offset = (y * png.width + x) * 4;
  if (png.data[offset + 3] <= 8) return false;
  const r = png.data[offset];
  const g = png.data[offset + 1];
  const b = png.data[offset + 2];
  return r >= 168 && g >= 168 && b >= 162 && Math.max(r, g, b) - Math.min(r, g, b) <= 34;
}

function clonePng(source) {
  const output = new PNG({ width: source.width, height: source.height });
  source.data.copy(output.data);
  return output;
}

function isMatte(rgb) {
  const [r, g, b] = rgb;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  return max >= 218 && max - min <= 28;
}

function median(values) {
  const clean = values.filter((value) => Number.isFinite(value) && value > 0).sort((a, b) => a - b);
  if (!clean.length) return 1;
  return clean[Math.floor(clean.length / 2)];
}
