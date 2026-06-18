import fs from 'node:fs/promises';
import path from 'node:path';
import { PNG } from 'pngjs';

const repoRoot = process.cwd();
const framesRoot = path.join(repoRoot, 'public', 'sprites', 'frames');
const qaRoot = path.join(repoRoot, 'public', 'sprites', 'qa', 'hole-animation-review');
const alphaThreshold = 8;
const minHoleArea = 2;
const maxIgnoredHairlineArea = 1;
const tilePadding = 10;
const labelHeight = 20;

await fs.rm(qaRoot, { recursive: true, force: true });
await fs.mkdir(qaRoot, { recursive: true });

const affectedAnimations = [];
const entities = await listDirs(framesRoot);

for (const entityId of entities) {
  const entityDir = path.join(framesRoot, entityId);
  const animations = await listDirs(entityDir);

  for (const animation of animations) {
    const animationDir = path.join(entityDir, animation);
    const frameFiles = (await fs.readdir(animationDir)).filter((file) => file.endsWith('.png')).sort();
    const frames = [];
    const holeFrames = [];

    for (const [frameIndex, frameFile] of frameFiles.entries()) {
      const framePath = path.join(animationDir, frameFile);
      const png = PNG.sync.read(await fs.readFile(framePath));
      const analysis = analyzeAlphaHoles(png);
      frames.push({ frameFile, png, analysis });

      if (analysis.alphaHoleCount > 0) {
        holeFrames.push({
          frameIndex,
          frameNumber: frameIndex + 1,
          frameFile,
          alphaHoleCount: analysis.alphaHoleCount,
          alphaHolePixels: analysis.totalHoleArea,
          largestAlphaHolePixels: analysis.largestHoleArea,
          holes: analysis.holes.map((hole) => ({
            area: hole.area,
            minX: hole.minX,
            minY: hole.minY,
            maxX: hole.maxX,
            maxY: hole.maxY,
            width: hole.width,
            height: hole.height,
          })),
        });
      }
    }

    if (holeFrames.length === 0) continue;

    const outputBase = `${safeName(entityId)}__${safeName(animation)}`;
    const transparentStripPath = path.join(qaRoot, `${outputBase}__transparent-strip.png`);
    const whiteCheckPath = path.join(qaRoot, `${outputBase}__white-check.png`);
    await fs.writeFile(transparentStripPath, PNG.sync.write(renderTransparentAnimationStrip(frames, holeFrames)));
    await fs.writeFile(whiteCheckPath, PNG.sync.write(renderWhiteCheckSheet(frames, holeFrames)));

    affectedAnimations.push({
      entityId,
      animation,
      sourcePath: path.relative(repoRoot, animationDir),
      frameCount: frameFiles.length,
      holeFrameCount: holeFrames.length,
      holeFrames,
      transparentAnimationPath: webPath(transparentStripPath),
      whiteCheckPath: webPath(whiteCheckPath),
    });
  }
}

const report = {
  generatedAt: new Date().toISOString(),
  scannedRoot: path.relative(repoRoot, framesRoot),
  rule: 'Frames are flagged when transparent pixels are enclosed by opaque sprite pixels and visible on a white matte.',
  affectedAnimationCount: affectedAnimations.length,
  affectedFrameCount: affectedAnimations.reduce((total, animation) => total + animation.holeFrameCount, 0),
  animations: affectedAnimations,
};

await fs.writeFile(path.join(qaRoot, 'hole-animation-report.json'), JSON.stringify(report, null, 2));
await fs.writeFile(path.join(qaRoot, 'index.html'), renderHtmlIndex(report));

console.log(`Scanned ${entities.length} entities.`);
console.log(`Found ${report.affectedFrameCount} frame(s) with internal transparent holes in ${report.affectedAnimationCount} animation(s).`);
console.log(`Report: ${path.relative(repoRoot, path.join(qaRoot, 'hole-animation-report.json'))}`);
console.log(`Index: ${path.relative(repoRoot, path.join(qaRoot, 'index.html'))}`);
for (const animation of affectedAnimations) {
  const frames = animation.holeFrames.map((frame) => `#${frame.frameNumber}`).join(', ');
  console.log(`- ${animation.entityId}/${animation.animation}: ${frames}`);
}

async function listDirs(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  return entries.filter((entry) => entry.isDirectory()).map((entry) => entry.name).sort();
}

function analyzeAlphaHoles(png) {
  const outside = markOutsideTransparency(png);
  const visited = new Uint8Array(png.width * png.height);
  const holes = [];

  for (let y = 0; y < png.height; y += 1) {
    for (let x = 0; x < png.width; x += 1) {
      const pixel = y * png.width + x;
      if (visited[pixel] || outside[pixel] || isOpaque(png, x, y)) continue;
      const hole = floodTransparentComponent(png, x, y, visited, outside);
      if (!hole || hole.area <= maxIgnoredHairlineArea || hole.area < minHoleArea) continue;
      if (!isRealBodyHole(png, hole)) continue;
      holes.push(hole);
    }
  }

  return {
    holes,
    alphaHoleCount: holes.length,
    totalHoleArea: holes.reduce((total, hole) => total + hole.area, 0),
    largestHoleArea: holes.reduce((largest, hole) => Math.max(largest, hole.area), 0),
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

function isOpaque(png, x, y) {
  return png.data[(y * png.width + x) * 4 + 3] > alphaThreshold;
}

function renderTransparentAnimationStrip(frames, holeFrames) {
  const maxWidth = Math.max(...frames.map((frame) => frame.png.width));
  const maxHeight = Math.max(...frames.map((frame) => frame.png.height));
  const cellWidth = maxWidth + tilePadding * 2;
  const cellHeight = maxHeight + tilePadding * 2 + labelHeight;
  const output = new PNG({ width: cellWidth * frames.length, height: cellHeight });
  const holeFrameNumbers = new Set(holeFrames.map((frame) => frame.frameNumber));

  frames.forEach((frame, index) => {
    const dx = index * cellWidth + tilePadding + Math.floor((maxWidth - frame.png.width) / 2);
    const dy = tilePadding + Math.floor((maxHeight - frame.png.height) / 2);
    blit(frame.png, output, dx, dy);
    if (holeFrameNumbers.has(index + 1)) drawOutline(output, index * cellWidth + 1, 1, cellWidth - 2, cellHeight - 2, [255, 56, 56, 255]);
  });

  return output;
}

function renderWhiteCheckSheet(frames, holeFrames) {
  const maxWidth = Math.max(...frames.map((frame) => frame.png.width));
  const maxHeight = Math.max(...frames.map((frame) => frame.png.height));
  const scale = 3;
  const cellWidth = (maxWidth + tilePadding * 2) * scale;
  const cellHeight = (maxHeight + tilePadding * 2 + labelHeight) * scale;
  const output = new PNG({ width: cellWidth * frames.length, height: cellHeight });
  output.data.fill(255);
  const holeFrameNumbers = new Set(holeFrames.map((frame) => frame.frameNumber));

  frames.forEach((frame, index) => {
    const dx = index * cellWidth + tilePadding * scale + Math.floor(((maxWidth - frame.png.width) * scale) / 2);
    const dy = tilePadding * scale + Math.floor(((maxHeight - frame.png.height) * scale) / 2);
    blitScaledOnWhite(frame.png, output, dx, dy, scale);
    if (holeFrameNumbers.has(index + 1)) drawOutline(output, index * cellWidth + 2, 2, cellWidth - 4, cellHeight - 4, [255, 0, 0, 255]);
    for (const hole of frame.analysis.holes) {
      drawOutline(
        output,
        dx + hole.minX * scale,
        dy + hole.minY * scale,
        Math.max(1, hole.width * scale),
        Math.max(1, hole.height * scale),
        [0, 100, 255, 255],
      );
    }
  });

  return output;
}

function blit(source, target, dx, dy) {
  for (let y = 0; y < source.height; y += 1) {
    for (let x = 0; x < source.width; x += 1) {
      const sourceOffset = (y * source.width + x) * 4;
      const targetOffset = ((dy + y) * target.width + dx + x) * 4;
      const alpha = source.data[sourceOffset + 3];
      if (alpha <= 0) continue;
      target.data[targetOffset] = source.data[sourceOffset];
      target.data[targetOffset + 1] = source.data[sourceOffset + 1];
      target.data[targetOffset + 2] = source.data[sourceOffset + 2];
      target.data[targetOffset + 3] = alpha;
    }
  }
}

function blitScaledOnWhite(source, target, dx, dy, scale) {
  for (let y = 0; y < source.height * scale; y += 1) {
    for (let x = 0; x < source.width * scale; x += 1) {
      const sourceX = Math.floor(x / scale);
      const sourceY = Math.floor(y / scale);
      const sourceOffset = (sourceY * source.width + sourceX) * 4;
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

function renderHtmlIndex(report) {
  const rows = report.animations
    .map((animation) => {
      const frames = animation.holeFrames
        .map((frame) => `#${frame.frameNumber} (${frame.alphaHolePixels}px)`)
        .join(', ');
      return `<tr>
        <td>${escapeHtml(animation.entityId)}</td>
        <td>${escapeHtml(animation.animation)}</td>
        <td>${escapeHtml(frames)}</td>
        <td><a href=".${animation.transparentAnimationPath.replace('/sprites/qa/hole-animation-review', '')}">transparent strip</a></td>
        <td><a href=".${animation.whiteCheckPath.replace('/sprites/qa/hole-animation-review', '')}">white check</a></td>
      </tr>`;
    })
    .join('\n');

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Sprite Hole Animation Review</title>
  <style>
    body { margin: 0; padding: 24px; font-family: Arial, sans-serif; background: #f7f7f7; color: #111; }
    h1 { margin: 0 0 8px; font-size: 24px; }
    p { margin: 0 0 20px; color: #555; }
    table { border-collapse: collapse; width: 100%; background: white; }
    th, td { border: 1px solid #ddd; padding: 8px 10px; text-align: left; font-size: 13px; }
    th { background: #111; color: white; }
    a { color: #064fcb; }
  </style>
</head>
<body>
  <h1>Sprite Hole Animation Review</h1>
  <p>${report.affectedFrameCount} frame(s) with internal transparent holes across ${report.affectedAnimationCount} animation(s).</p>
  <table>
    <thead><tr><th>Entity</th><th>Animation</th><th>Hole Frames</th><th>Transparent Output</th><th>White Check</th></tr></thead>
    <tbody>${rows}</tbody>
  </table>
</body>
</html>`;
}

function safeName(value) {
  return value.replace(/[^a-z0-9_-]+/gi, '-');
}

function webPath(filePath) {
  return `/${path.relative(path.join(repoRoot, 'public'), filePath).replaceAll(path.sep, '/')}`;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}
