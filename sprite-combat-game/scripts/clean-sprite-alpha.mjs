import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { PNG } from 'pngjs';

const repoRoot = process.cwd();
const packedSourceRoot = path.join(repoRoot, 'public', 'sprites', 'frames-pack');
const legacySourceRoot = path.join(repoRoot, 'public', 'sprites', 'frames');
const outputRoot = path.join(repoRoot, 'public', 'sprites', 'frames-cleaned');
const qaRoot = path.join(repoRoot, 'public', 'sprites', 'qa-cleaned');
const defaultSourceSpecs = [
  { sourceRoot: packedSourceRoot, characters: ['ronin', 'supreme-emperor'] },
  { sourceRoot: legacySourceRoot, characters: ['monkey-grunt', 'striker-monkey', 'cyber-monkey-grappler'] },
];
const backgroundChecks = [
  { file: 'white-check.png', color: [255, 255, 255, 255] },
  { file: 'black-check.png', color: [0, 0, 0, 255] },
  { file: 'teal-check.png', color: [0, 128, 128, 255] },
  { file: 'red-check.png', color: [180, 20, 20, 255] },
];

const config = {
  lowAlphaWhite: Number(process.env.SPRITE_ALPHA_LOW_WHITE ?? 40),
  lowAlphaGray: Number(process.env.SPRITE_ALPHA_LOW_GRAY ?? 70),
  whiteAverage: Number(process.env.SPRITE_WHITE_AVERAGE ?? 180),
  grayAverage: Number(process.env.SPRITE_GRAY_AVERAGE ?? 140),
  lowSaturation: Number(process.env.SPRITE_LOW_SATURATION ?? 34),
  edgeRadius: Number(process.env.SPRITE_EDGE_RADIUS ?? 2),
  neighborRadius: Number(process.env.SPRITE_NEIGHBOR_RADIUS ?? 8),
  matte: Number(process.env.SPRITE_MATTE_RGB ?? 245),
  decontaminate: process.env.SPRITE_DECONTAMINATE !== '0',
  neighborFallback: process.env.SPRITE_NEIGHBOR_FALLBACK !== '0',
};

const args = new Set(process.argv.slice(2));
const qaOnly = args.has('--qa-only');
const allCharacters = args.has('--all');
const requestedCharacters = getArgValue('--character')?.split(',').map((item) => item.trim()).filter(Boolean);
const sourceSpecs = await getSourceSpecs();

const reports = [];
for (const sourceSpec of sourceSpecs) {
  for (const character of sourceSpec.characters) {
    const sourceCharacterDir = path.join(sourceSpec.sourceRoot, character);
    if (!existsSync(sourceCharacterDir)) continue;
    for (const animation of await listDirectories(sourceCharacterDir)) {
      reports.push(await cleanAnimation(sourceSpec.sourceRoot, character, animation));
    }
  }
}

console.log(JSON.stringify({ sourceRoots: sourceSpecs.map((spec) => spec.sourceRoot), outputRoot, qaRoot, qaOnly, config, reports }, null, 2));

async function cleanAnimation(sourceRoot, character, animation) {
  const sourceDir = path.join(sourceRoot, character, animation);
  const outputDir = path.join(outputRoot, character, animation);
  const qaDir = path.join(qaRoot, character, animation);
  await mkdir(outputDir, { recursive: true });
  await mkdir(qaDir, { recursive: true });

  const files = (await readdir(sourceDir))
    .filter((file) => file.toLowerCase().endsWith('.png'))
    .sort((left, right) => Number.parseInt(left, 10) - Number.parseInt(right, 10));
  const frameReports = [];
  const cleanedFrames = [];
  let totalTransparentRgbCleared = 0;
  let totalMadeTransparent = 0;
  let totalDecontaminated = 0;
  let totalNeighborRecolored = 0;
  let totalRemainingHalo = 0;
  let totalCanvasEdgePixels = 0;

  for (const file of files) {
    const sourcePath = path.join(sourceDir, file);
    const png = PNG.sync.read(await readFile(sourcePath));
    const beforeHalo = countSuspectedHaloPixels(png);
    const result = cleanFrame(png);
    const afterHalo = countSuspectedHaloPixels(result.png);
    const outputPath = path.join(outputDir, file);
    if (!qaOnly) await writeFile(outputPath, PNG.sync.write(result.png));
    cleanedFrames.push({ file, png: result.png });
    totalTransparentRgbCleared += result.report.transparentRgbCleared;
    totalMadeTransparent += result.report.madeTransparent;
    totalDecontaminated += result.report.decontaminated;
    totalNeighborRecolored += result.report.neighborRecolored;
    totalRemainingHalo += afterHalo;
    totalCanvasEdgePixels += result.report.edgePixelsTouchingCanvasBoundary;
    frameReports.push({
      frame: file,
      sourcePath,
      outputPath,
      beforeSuspectedWhiteHaloPixels: beforeHalo,
      suspectedWhiteHaloPixelsRemaining: afterHalo,
      ...result.report,
    });
  }

  await writeQaSheets(qaDir, cleanedFrames);
  const warnings = [];
  if (totalRemainingHalo > 0) warnings.push(`${totalRemainingHalo} suspected white/gray edge pixels remain after cleanup`);
  if (totalCanvasEdgePixels > 0) warnings.push(`${totalCanvasEdgePixels} opaque or semi-transparent pixels touch the canvas boundary`);

  const report = {
    character,
    animation,
    sourceDir,
    outputDir,
    qaDir,
    frameCount: files.length,
    totals: {
      transparentRgbCleared: totalTransparentRgbCleared,
      pixelsMadeTransparent: totalMadeTransparent,
      pixelsDecontaminated: totalDecontaminated,
      pixelsRecoloredFromNeighbor: totalNeighborRecolored,
      suspectedWhiteHaloPixelsRemaining: totalRemainingHalo,
      edgePixelsTouchingCanvasBoundary: totalCanvasEdgePixels,
    },
    warnings,
    frames: frameReports,
  };
  await writeFile(path.join(qaDir, 'cleanup-report.json'), JSON.stringify(report, null, 2));
  return report;
}

async function getSourceSpecs() {
  if (requestedCharacters?.length) {
    return [
      { sourceRoot: packedSourceRoot, characters: requestedCharacters },
      { sourceRoot: legacySourceRoot, characters: requestedCharacters },
    ];
  }
  if (!allCharacters) return defaultSourceSpecs;
  return [
    { sourceRoot: packedSourceRoot, characters: await listDirectories(packedSourceRoot) },
    { sourceRoot: legacySourceRoot, characters: await listDirectories(legacySourceRoot) },
  ];
}

function cleanFrame(source) {
  const png = clonePng(source);
  const width = png.width;
  const height = png.height;
  const original = Buffer.from(png.data);
  const report = {
    transparentRgbCleared: 0,
    madeTransparent: 0,
    decontaminated: 0,
    neighborRecolored: 0,
    suspectedWhiteHaloPixelsRemaining: 0,
    edgePixelsTouchingCanvasBoundary: countCanvasBoundaryPixels(source),
    warnings: [],
  };

  for (let pixel = 0; pixel < width * height; pixel += 1) {
    const offset = pixel * 4;
    if (png.data[offset + 3] === 0 && (png.data[offset] || png.data[offset + 1] || png.data[offset + 2])) {
      png.data[offset] = 0;
      png.data[offset + 1] = 0;
      png.data[offset + 2] = 0;
      report.transparentRgbCleared += 1;
    }
  }

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const offset = (y * width + x) * 4;
      const alpha = original[offset + 3];
      if (alpha <= 0 || alpha >= 255) continue;
      if (!isNearTransparency(original, width, height, x, y, config.edgeRadius)) continue;

      const rgb = [original[offset], original[offset + 1], original[offset + 2]];
      const suspicion = edgeSuspicion(rgb, alpha);
      if (!suspicion) continue;

      if (shouldRemovePixel(rgb, alpha)) {
        png.data[offset] = 0;
        png.data[offset + 1] = 0;
        png.data[offset + 2] = 0;
        png.data[offset + 3] = 0;
        report.madeTransparent += 1;
        continue;
      }

      let recolored = false;
      if (config.decontaminate) {
        const cleanRgb = removeMatte(rgb, alpha, config.matte);
        png.data[offset] = cleanRgb[0];
        png.data[offset + 1] = cleanRgb[1];
        png.data[offset + 2] = cleanRgb[2];
        report.decontaminated += 1;
        recolored = true;
      }

      if (config.neighborFallback && (!recolored || edgeSuspicion([png.data[offset], png.data[offset + 1], png.data[offset + 2]], alpha))) {
        const neighbor = findNeighborColor(original, width, height, x, y, config.neighborRadius);
        if (neighbor) {
          png.data[offset] = neighbor[0];
          png.data[offset + 1] = neighbor[1];
          png.data[offset + 2] = neighbor[2];
          report.neighborRecolored += 1;
        }
      }
    }
  }

  report.suspectedWhiteHaloPixelsRemaining = countSuspectedHaloPixels(png);
  if (report.suspectedWhiteHaloPixelsRemaining > 0) {
    report.warnings.push(`${report.suspectedWhiteHaloPixelsRemaining} suspected white/gray edge pixels remain`);
  }
  return { png, report };
}

function shouldRemovePixel(rgb, alpha) {
  const average = avg(rgb);
  const saturation = sat(rgb);
  return (alpha < config.lowAlphaWhite && average > config.whiteAverage) || (alpha < config.lowAlphaGray && average > config.grayAverage && saturation < config.lowSaturation);
}

function edgeSuspicion(rgb, alpha) {
  const average = avg(rgb);
  const saturation = sat(rgb);
  const isWhiteGray = average > config.whiteAverage && saturation < 58;
  const isLowAlphaGray = alpha < 120 && average > config.grayAverage && saturation < config.lowSaturation;
  const isCheckerLight = average > 205 && Math.max(...rgb) - Math.min(...rgb) < 26;
  return isWhiteGray || isLowAlphaGray || isCheckerLight;
}

function removeMatte(rgb, alpha, matte) {
  const a = Math.max(0.05, alpha / 255);
  return rgb.map((value) => clamp(Math.round((value - matte * (1 - a)) / a), 0, 255));
}

function findNeighborColor(data, width, height, x, y, radius) {
  let best;
  let bestDistance = Number.POSITIVE_INFINITY;
  for (let distance = 1; distance <= radius; distance += 1) {
    for (let dy = -distance; dy <= distance; dy += 1) {
      for (let dx = -distance; dx <= distance; dx += 1) {
        if (Math.max(Math.abs(dx), Math.abs(dy)) !== distance) continue;
        const nx = x + dx;
        const ny = y + dy;
        if (nx < 0 || ny < 0 || nx >= width || ny >= height) continue;
        const offset = (ny * width + nx) * 4;
        const alpha = data[offset + 3];
        if (alpha < 220) continue;
        const rgb = [data[offset], data[offset + 1], data[offset + 2]];
        if (edgeSuspicion(rgb, alpha) && isNearTransparency(data, width, height, nx, ny, 1)) continue;
        const squared = dx * dx + dy * dy;
        if (squared < bestDistance) {
          bestDistance = squared;
          best = rgb;
        }
      }
    }
    if (best) return best;
  }
  return undefined;
}

function countSuspectedHaloPixels(png) {
  let total = 0;
  for (let y = 0; y < png.height; y += 1) {
    for (let x = 0; x < png.width; x += 1) {
      const offset = (y * png.width + x) * 4;
      const alpha = png.data[offset + 3];
      if (alpha <= 0 || alpha >= 255) continue;
      if (!isNearTransparency(png.data, png.width, png.height, x, y, config.edgeRadius)) continue;
      if (edgeSuspicion([png.data[offset], png.data[offset + 1], png.data[offset + 2]], alpha)) total += 1;
    }
  }
  return total;
}

function countCanvasBoundaryPixels(png) {
  let total = 0;
  for (let y = 0; y < png.height; y += 1) {
    for (const x of [0, png.width - 1]) {
      if (png.data[(y * png.width + x) * 4 + 3] > 0) total += 1;
    }
  }
  for (let x = 1; x < png.width - 1; x += 1) {
    for (const y of [0, png.height - 1]) {
      if (png.data[(y * png.width + x) * 4 + 3] > 0) total += 1;
    }
  }
  return total;
}

function isNearTransparency(data, width, height, x, y, radius) {
  for (let dy = -radius; dy <= radius; dy += 1) {
    for (let dx = -radius; dx <= radius; dx += 1) {
      if (dx === 0 && dy === 0) continue;
      const nx = x + dx;
      const ny = y + dy;
      if (nx < 0 || ny < 0 || nx >= width || ny >= height) return true;
      if (data[(ny * width + nx) * 4 + 3] === 0) return true;
    }
  }
  return false;
}

async function writeQaSheets(qaDir, frames) {
  await mkdir(qaDir, { recursive: true });
  for (const check of backgroundChecks) {
    await writeFile(path.join(qaDir, check.file), PNG.sync.write(composeStrip(frames, check.color)));
  }
  await writeFile(path.join(qaDir, 'transparent-strip.png'), PNG.sync.write(composeStrip(frames, [0, 0, 0, 0])));
}

function composeStrip(frames, background) {
  const gap = 8;
  const width = frames.reduce((sum, frame) => sum + frame.png.width, 0) + Math.max(0, frames.length - 1) * gap;
  const height = Math.max(1, ...frames.map((frame) => frame.png.height));
  const strip = new PNG({ width, height });
  for (let pixel = 0; pixel < width * height; pixel += 1) {
    const offset = pixel * 4;
    strip.data[offset] = background[0];
    strip.data[offset + 1] = background[1];
    strip.data[offset + 2] = background[2];
    strip.data[offset + 3] = background[3];
  }
  let cursorX = 0;
  for (const frame of frames) {
    blitOver(strip, frame.png, cursorX, 0);
    cursorX += frame.png.width + gap;
  }
  return strip;
}

function blitOver(target, source, targetX, targetY) {
  for (let y = 0; y < source.height; y += 1) {
    for (let x = 0; x < source.width; x += 1) {
      const srcOffset = (y * source.width + x) * 4;
      const dstOffset = ((targetY + y) * target.width + targetX + x) * 4;
      const alpha = source.data[srcOffset + 3] / 255;
      const inverse = 1 - alpha;
      target.data[dstOffset] = Math.round(source.data[srcOffset] * alpha + target.data[dstOffset] * inverse);
      target.data[dstOffset + 1] = Math.round(source.data[srcOffset + 1] * alpha + target.data[dstOffset + 1] * inverse);
      target.data[dstOffset + 2] = Math.round(source.data[srcOffset + 2] * alpha + target.data[dstOffset + 2] * inverse);
      target.data[dstOffset + 3] = Math.max(target.data[dstOffset + 3], source.data[srcOffset + 3]);
    }
  }
}

function clonePng(source) {
  const png = new PNG({ width: source.width, height: source.height });
  source.data.copy(png.data);
  return png;
}

function avg(rgb) {
  return (rgb[0] + rgb[1] + rgb[2]) / 3;
}

function sat(rgb) {
  return Math.max(...rgb) - Math.min(...rgb);
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

async function listDirectories(root) {
  try {
    return (await readdir(root, { withFileTypes: true })).filter((entry) => entry.isDirectory()).map((entry) => entry.name).sort();
  } catch {
    return [];
  }
}

function getArgValue(name) {
  const prefix = `${name}=`;
  const match = process.argv.slice(2).find((arg) => arg.startsWith(prefix));
  return match ? match.slice(prefix.length) : undefined;
}
