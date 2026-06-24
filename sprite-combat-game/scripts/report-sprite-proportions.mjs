import { existsSync } from 'node:fs';
import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { PNG } from 'pngjs';

const cwd = process.cwd();
const finalScope = ['ronin', 'supreme-emperor', 'monkey-grunt', 'striker-monkey'];
const profiles = new Map([
  ['ronin', { bodyWidth: 58, bodyHeight: 118, visualScale: 0.22, canonicalBodyHeight: 118 }],
  ['supreme-emperor', { bodyWidth: 68, bodyHeight: 136, visualScale: 0.21, canonicalBodyHeight: 136 }],
  ['monkey-grunt', { bodyWidth: 44, bodyHeight: 70, visualScale: 1, canonicalBodyHeight: 70 }],
  ['striker-monkey', { bodyWidth: 46, bodyHeight: 74, visualScale: 1, canonicalBodyHeight: 74 }],
]);
const atlasAnimations = new Map([
  [
    'monkey-grunt',
    {
      atlasPath: 'public/assets/fightcore/sprites/monkey-grunt/atlas.png',
      frameWidth: 96,
      frameHeight: 96,
      animations: new Map([
        ['idle', { row: 0, frameCount: 4, fps: 8 }],
        ['run', { row: 1, frameCount: 6, fps: 12 }],
        ['jab', { row: 2, frameCount: 5, fps: 14 }],
        ['cross', { row: 3, frameCount: 5, fps: 14 }],
        ['grab', { row: 4, frameCount: 6, fps: 12 }],
        ['hit_react', { row: 5, frameCount: 3, fps: 12 }],
        ['knockdown', { row: 6, frameCount: 5, fps: 8 }],
        ['death', { row: 7, frameCount: 7, fps: 8 }],
      ]),
    },
  ],
  [
    'striker-monkey',
    {
      atlasPath: 'public/assets/fightcore/sprites/striker-monkey/atlas.png',
      frameWidth: 96,
      frameHeight: 96,
      animations: new Map([
        ['idle', { row: 0, frameCount: 4, fps: 8 }],
        ['run', { row: 1, frameCount: 5, fps: 12 }],
        ['jab', { row: 2, frameCount: 3, fps: 14 }],
        ['cross', { row: 3, frameCount: 4, fps: 14 }],
        ['hook', { row: 4, frameCount: 4, fps: 13 }],
        ['round_kick', { row: 5, frameCount: 4, fps: 12 }],
        ['hit_react', { row: 6, frameCount: 4, fps: 12 }],
        ['knockdown', { row: 7, frameCount: 5, fps: 8 }],
        ['death', { row: 8, frameCount: 5, fps: 8 }],
      ]),
    },
  ],
]);

const reports = [];

for (const entityId of finalScope) {
  const qaRoot = path.resolve(cwd, 'public/sprites/qa', entityId);
  const animationIds = new Set(atlasAnimations.get(entityId)?.animations.keys() ?? []);
  if (existsSync(qaRoot)) {
    const animations = await readdir(qaRoot, { withFileTypes: true });
    for (const animation of animations.filter((entry) => entry.isDirectory())) animationIds.add(animation.name);
  }
  const idleReference = await loadIdleReference(entityId);
  for (const animationId of [...animationIds].sort()) {
    const metadataPath = path.join(qaRoot, animationId, 'metadata.json');
    const metadata = existsSync(metadataPath) ? JSON.parse(await readFile(metadataPath, 'utf8')) : undefined;
    const report = await buildReport(entityId, animationId, metadata, idleReference);
    const outDir = path.resolve(cwd, 'public/sprites/qa', entityId, animationId);
    await mkdir(outDir, { recursive: true });
    await writeFile(path.join(outDir, 'proportion-report.json'), `${JSON.stringify(report, null, 2)}\n`, 'utf8');
    reports.push(report);
  }
}

const summary = reports.map((report) => ({
  entityId: report.entityId,
  animationId: report.animationId,
  reportPath: toPosix(path.relative(cwd, path.resolve(cwd, 'public/sprites/qa', report.entityId, report.animationId, 'proportion-report.json'))),
  suspiciousFrames: report.frames.filter((frame) => frame.warnings.length > 0).length,
  sourcePriorities: [...new Set(report.frames.map((frame) => frame.sourcePriority))],
  likelyCauses: [...new Set(report.frames.flatMap((frame) => frame.likelyCauses))],
  worstWarnings: report.frames.flatMap((frame) => frame.warnings.map((warning) => `${frame.frame}: ${warning}`)).slice(0, 8),
}));

const summaryPath = path.resolve(cwd, 'public/sprites/qa/proportion-summary.json');
await writeFile(summaryPath, `${JSON.stringify({ generatedAt: new Date().toISOString(), finalScope, summary }, null, 2)}\n`, 'utf8');
await writeFile(path.resolve(cwd, 'docs/SPRITE_PROPORTION_AUDIT.md'), markdownReport(reports), 'utf8');

console.log(`Wrote ${summaryPath}`);
console.log(`Wrote ${path.resolve(cwd, 'docs/SPRITE_PROPORTION_AUDIT.md')}`);
for (const row of summary.filter((entry) => entry.suspiciousFrames > 0)) {
  console.log(`${row.entityId}/${row.animationId}: ${row.suspiciousFrames} suspicious frame(s)`);
}

async function loadIdleReference(entityId) {
  const metadataPath = path.resolve(cwd, 'public/sprites/qa', entityId, 'idle', 'metadata.json');
  if (existsSync(metadataPath)) {
    const metadata = JSON.parse(await readFile(metadataPath, 'utf8'));
    const measurements = await Promise.all((metadata.frames ?? []).map((frame, index) => measureRuntimeFrame(entityId, 'idle', index, frame, metadata)));
    return referenceFromMeasurements(measurements, 'idle metadata/runtime PNG median');
  }
  const atlas = atlasAnimations.get(entityId);
  const idle = atlas?.animations.get('idle');
  if (atlas && idle) {
    const measurements = [];
    for (let index = 0; index < idle.frameCount; index += 1) measurements.push(await measureAtlasFrame(entityId, 'idle', index, atlas, idle));
    return referenceFromMeasurements(measurements, 'idle atlas crop median');
  }
  const fallback = profiles.get(entityId);
  return { bodyHeight: fallback?.bodyHeight, bodyWidth: fallback?.bodyWidth, baselineY: fallback?.bodyHeight, source: 'visual profile fallback' };
}

function referenceFromMeasurements(measurements, source) {
  return {
    bodyHeight: median(measurements.map((measurement) => measurement.visibleBodyHeight).filter(Number.isFinite)),
    bodyWidth: median(measurements.map((measurement) => measurement.visibleBodyWidth).filter(Number.isFinite)),
    widthToHeightRatio: median(measurements.map((measurement) => measurement.widthToHeightRatio).filter(Number.isFinite)),
    torsoCoreWidth: median(measurements.map((measurement) => measurement.torsoCore?.w).filter(Number.isFinite)),
    feetSpanWidth: median(measurements.map((measurement) => measurement.feetSpan?.w).filter(Number.isFinite)),
    baselineY: median(measurements.map((measurement) => measurement.baselineY).filter(Number.isFinite)),
    source,
  };
}

async function buildReport(entityId, animationId, metadata, idleReference) {
  const profile = profiles.get(entityId);
  const atlas = atlasAnimations.get(entityId);
  const atlasAnimation = atlas?.animations.get(animationId);
  const metadataFrames = metadata?.frames ?? [];
  const frameCount = Math.max(metadataFrames.length, atlasAnimation?.frameCount ?? 0);
  const frames = [];
  for (let index = 0; index < frameCount; index += 1) {
    const measurement = metadata
      ? await measureRuntimeFrame(entityId, animationId, index, metadataFrames[index], metadata)
      : await measureAtlasFrame(entityId, animationId, index, atlas, atlasAnimation);
    frames.push(classifyFrame(entityId, animationId, index, measurement, idleReference, profile, metadataFrames[index], metadata));
  }
  return {
    entityId,
    animationId,
    note: metadata ? 'Measured from runtime-preferred PNG path when present, with metadata/canvas included for comparison.' : 'Measured from active atlas crop because no per-frame PNG metadata exists yet.',
    idleReference,
    outputCanvas: metadata?.outputCanvas ?? (atlas ? { w: atlas.frameWidth, h: atlas.frameHeight } : undefined),
    normalizedScale: metadata?.normalizedScale,
    targetBodyHeight: metadata?.targetBodyHeight ?? profile?.canonicalBodyHeight,
    frames,
  };
}

async function measureRuntimeFrame(entityId, animationId, index, frame, metadata) {
  const frameName = `${String(index + 1).padStart(4, '0')}.png`;
  const source = resolveRuntimeSource(entityId, animationId, frameName);
  const png = await readPng(source.absolutePath);
  const bounds = png ? measureBounds(png) : normalizeBounds(frame?.bodyBounds ?? frame?.sourceBounds);
  const canvas = { w: png?.width ?? frame?.frameSize?.w ?? metadata?.outputCanvas?.w, h: png?.height ?? frame?.frameSize?.h ?? metadata?.outputCanvas?.h };
  const baselineY = frame?.anchorY && canvas.h ? Math.round(frame.anchorY * canvas.h) : undefined;
  return measurementFromBounds(bounds, canvas, baselineY, source, frame);
}

async function measureAtlasFrame(entityId, animationId, index, atlas, animation) {
  const absolutePath = atlas ? path.resolve(cwd, atlas.atlasPath) : undefined;
  const png = absolutePath ? await readPng(absolutePath) : undefined;
  const crop = atlas && animation ? { x: index * atlas.frameWidth, y: animation.row * atlas.frameHeight, w: atlas.frameWidth, h: atlas.frameHeight } : undefined;
  const bounds = png && crop ? measureBounds(png, crop) : undefined;
  const source = {
    sourcePriority: 'fallback/raw atlas',
    runtimeFramePath: absolutePath ? `${absolutePath}#row${animation.row}-frame${index + 1}` : undefined,
    manualOverridePath: path.resolve(cwd, 'public/sprites/manual-overrides', entityId, animationId, `${String(index + 1).padStart(4, '0')}.png`),
    sourceExists: Boolean(png),
  };
  return measurementFromBounds(bounds, { w: atlas?.frameWidth, h: atlas?.frameHeight }, atlas?.frameHeight, source);
}

function resolveRuntimeSource(entityId, animationId, frameName) {
  const candidates = [
    ['manual-overrides', path.resolve(cwd, 'public/sprites/manual-overrides', entityId, animationId, frameName), 'manual-overrides'],
    ['frames-cleaned', path.resolve(cwd, 'public/sprites/frames-cleaned', entityId, animationId, frameName), 'frames-cleaned'],
    ['frames-pack', path.resolve(cwd, 'public/sprites/frames-pack', entityId, animationId, frameName), 'frames-pack'],
    ['fallback/raw', path.resolve(cwd, 'public/sprites/frames-semi-realistic', entityId, animationId, frameName), 'fallback/raw'],
  ];
  const found = candidates.find(([, absolutePath]) => existsSync(absolutePath)) ?? candidates[candidates.length - 1];
  return {
    sourcePriority: found[2],
    runtimeFramePath: found[1],
    manualOverridePath: candidates[0][1],
    sourceExists: existsSync(found[1]),
  };
}

function measurementFromBounds(bounds, canvas, baselineY, source, metadataFrame) {
  const left = bounds?.minX ?? metadataFrame?.bodyBounds?.x;
  const top = bounds?.minY ?? metadataFrame?.bodyBounds?.y;
  const width = bounds?.width ?? metadataFrame?.bodyBounds?.w;
  const height = bounds?.height ?? metadataFrame?.bodyBounds?.h;
  const bottom = bounds ? bounds.maxY : top !== undefined && height !== undefined ? top + height - 1 : undefined;
  const widthToHeightRatio = Number.isFinite(width) && Number.isFinite(height) && height > 0 ? round(width / height, 4) : undefined;
  return {
    ...source,
    visibleBodyHeight: height,
    visibleBodyWidth: width,
    widthToHeightRatio,
    topY: top,
    bottomY: bottom,
    baselineY,
    centerX: left !== undefined && width !== undefined ? round(left + width / 2) : undefined,
    centerY: top !== undefined && height !== undefined ? round(top + height / 2) : undefined,
    torsoCore: bounds ? zone(bounds, 0.18, 0.22, 0.64, 0.34) : undefined,
    chestUpperBody: bounds ? zone(bounds, 0.16, 0.18, 0.68, 0.22) : undefined,
    waistHip: bounds ? zone(bounds, 0.22, 0.44, 0.56, 0.18) : undefined,
    lowerBodyLegZone: bounds ? zone(bounds, 0.12, 0.56, 0.76, 0.42) : undefined,
    feetSpan: bounds ? zone(bounds, 0.04, 0.84, 0.92, 0.16) : undefined,
    armReachBounds: bounds ? zone(bounds, 0, 0.18, 1, 0.38) : undefined,
    outputCanvas: canvas,
    touchesHeadEdge: top !== undefined && top <= 1,
    touchesFeetEdge: bottom !== undefined && canvas?.h !== undefined && bottom >= canvas.h - 2,
  };
}

function classifyFrame(entityId, animationId, index, measurement, idleReference, profile, metadataFrame, metadata) {
  const heightVsIdle = ratio(measurement.visibleBodyHeight, idleReference.bodyHeight);
  const widthVsIdle = ratio(measurement.visibleBodyWidth, idleReference.bodyWidth);
  const ratioVsIdle = ratio(measurement.widthToHeightRatio, idleReference.widthToHeightRatio);
  const torsoCoreWidthVsIdle = ratio(measurement.torsoCore?.w, idleReference.torsoCoreWidth);
  const feetSpanVsIdle = ratio(measurement.feetSpan?.w, idleReference.feetSpanWidth);
  const baselineShift = Number.isFinite(measurement.baselineY) && Number.isFinite(idleReference.baselineY) ? measurement.baselineY - idleReference.baselineY : undefined;
  const runtimeDrawScale = runtimeScale(measurement, profile, metadataFrame);
  const finalRenderedBodyHeight = Number.isFinite(measurement.visibleBodyHeight) ? round(measurement.visibleBodyHeight * runtimeDrawScale) : undefined;
  const finalRenderedBodyWidth = Number.isFinite(measurement.visibleBodyWidth) ? round(measurement.visibleBodyWidth * runtimeDrawScale) : undefined;
  const warnings = [];
  const likelyCauses = [];
  const recommendedAction = [];
  const widePose = isWidePose(animationId);
  if (heightVsIdle !== undefined && (heightVsIdle < 0.9 || heightVsIdle > 1.1)) warnings.push(`body height ${Math.round(heightVsIdle * 100)}% of idle`);
  if (widthVsIdle !== undefined && (widthVsIdle < 0.8 || widthVsIdle > widthLimit(animationId))) warnings.push(`body width ${Math.round(widthVsIdle * 100)}% of idle`);
  if (ratioVsIdle !== undefined && (ratioVsIdle < 0.85 || ratioVsIdle > (widePose ? 1.9 : 1.15))) warnings.push(`width/height ratio ${Math.round(ratioVsIdle * 100)}% of idle`);
  if (torsoCoreWidthVsIdle !== undefined && (torsoCoreWidthVsIdle < 0.85 || torsoCoreWidthVsIdle > 1.15)) warnings.push(`torso/core width ${Math.round(torsoCoreWidthVsIdle * 100)}% of idle`);
  if (feetSpanVsIdle !== undefined && feetSpanVsIdle > (widePose ? 2.1 : 1.45)) warnings.push(`feet/leg span ${Math.round(feetSpanVsIdle * 100)}% of idle`);
  if (baselineShift !== undefined && Math.abs(baselineShift) > 6) warnings.push(`baseline shifted ${baselineShift}px from idle`);
  if (measurement.touchesFeetEdge) warnings.push('feet/body touch bottom crop edge');
  if (measurement.touchesHeadEdge) warnings.push('head/body touch top crop edge');
  if (metadata?.outputCanvas && measurement.outputCanvas && (metadata.outputCanvas.w !== measurement.outputCanvas.w || metadata.outputCanvas.h !== measurement.outputCanvas.h)) {
    warnings.push('runtime PNG canvas differs from metadata canvas');
  }
  if (!measurement.sourceExists) warnings.push('runtime source PNG could not be read');

  if (warnings.some((warning) => warning.includes('baseline') || warning.includes('canvas'))) likelyCauses.push('metadata/canvas issue');
  if (warnings.some((warning) => warning.includes('body height') || warning.includes('body width') || warning.includes('ratio') || warning.includes('torso') || warning.includes('feet') || warning.includes('crop edge'))) likelyCauses.push('source art issue');
  if (measurement.sourcePriority === 'frames-cleaned' && warnings.some((warning) => warning.includes('crop edge'))) likelyCauses.push('cleanup issue');
  if (likelyCauses.length === 0) likelyCauses.push('within measured tolerance');

  if (likelyCauses.includes('metadata/canvas issue')) recommendedAction.push('check output canvas, anchor, baseline, and runtime source priority');
  if (likelyCauses.includes('source art issue')) recommendedAction.push('manual override or source replacement preferred over deformation scaling');
  if (likelyCauses.includes('cleanup issue')) recommendedAction.push('inspect clean-alpha output against frames-pack source');

  return {
    frame: String(index + 1).padStart(4, '0'),
    runtimeFramePath: measurement.runtimeFramePath,
    manualOverridePath: measurement.manualOverridePath,
    sourcePriority: measurement.sourcePriority,
    outputCanvas: measurement.outputCanvas,
    runtimeDrawScale,
    finalRenderedBodyHeight,
    finalRenderedBodyWidth,
    visibleBodyHeight: measurement.visibleBodyHeight,
    visibleBodyWidth: measurement.visibleBodyWidth,
    widthToHeightRatio: measurement.widthToHeightRatio,
    heightVsIdle,
    widthVsIdle,
    ratioVsIdle,
    torsoCoreWidthVsIdle,
    feetSpanVsIdle,
    topY: measurement.topY,
    bottomFeetY: measurement.bottomY,
    baselineY: measurement.baselineY,
    baselineShift,
    centerX: measurement.centerX,
    centerY: measurement.centerY,
    torsoCoreHeightEstimate: measurement.torsoCore?.h,
    torsoCoreWidthEstimate: measurement.torsoCore?.w,
    chestUpperBodyWidthEstimate: measurement.chestUpperBody?.w,
    waistHipWidthEstimate: measurement.waistHip?.w,
    lowerBodyLegZoneHeightEstimate: measurement.lowerBodyLegZone?.h,
    legSpreadWidthEstimate: measurement.lowerBodyLegZone?.w,
    feetSpanWidthEstimate: measurement.feetSpan?.w,
    armReachExtensionBounds: measurement.armReachBounds,
    warnings,
    likelyCauses,
    recommendedAction,
  };
}

function runtimeScale(measurement, profile, metadataFrame) {
  if (!profile) return 1;
  if (['frames-pack', 'frames-cleaned', 'manual-overrides'].includes(measurement.sourcePriority)) {
    const normalizedBodyHeight = metadataFrame?.bodyBounds?.h ?? measurement.visibleBodyHeight;
    return normalizedBodyHeight ? round(profile.canonicalBodyHeight / normalizedBodyHeight, 4) : 1;
  }
  return profile.visualScale ?? 1;
}

async function readPng(absolutePath) {
  if (!absolutePath || !existsSync(absolutePath) || absolutePath.includes('#')) return undefined;
  return PNG.sync.read(await readFile(absolutePath));
}

function measureBounds(png, crop) {
  const left = crop?.x ?? 0;
  const top = crop?.y ?? 0;
  const width = crop?.w ?? png.width;
  const height = crop?.h ?? png.height;
  let minX = width;
  let minY = height;
  let maxX = -1;
  let maxY = -1;
  let pixels = 0;
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const absoluteX = left + x;
      const absoluteY = top + y;
      const alpha = png.data[(absoluteY * png.width + absoluteX) * 4 + 3];
      if (alpha <= 8) continue;
      minX = Math.min(minX, x);
      minY = Math.min(minY, y);
      maxX = Math.max(maxX, x);
      maxY = Math.max(maxY, y);
      pixels += 1;
    }
  }
  return maxX >= minX ? { minX, minY, maxX, maxY, width: maxX - minX + 1, height: maxY - minY + 1, pixels } : undefined;
}

function normalizeBounds(bounds) {
  if (!bounds) return undefined;
  const minX = bounds.minX ?? bounds.x ?? 0;
  const minY = bounds.minY ?? bounds.y ?? 0;
  const width = bounds.width ?? bounds.w ?? 0;
  const height = bounds.height ?? bounds.h ?? 0;
  return { minX, minY, maxX: minX + width - 1, maxY: minY + height - 1, width, height };
}

function zone(bounds, x, y, w, h) {
  return {
    x: round(bounds.minX + bounds.width * x),
    y: round(bounds.minY + bounds.height * y),
    w: round(bounds.width * w),
    h: round(bounds.height * h),
  };
}

function markdownReport(reports) {
  const lines = [
    '# Sprite Proportion Audit',
    '',
    'Generated by `npm.cmd run sprite-pack:proportions`. This report measures active final-scope assets only and does not apply deformation scaling.',
    '',
    'Final scope: Ronin, Supreme Emperor, Monkey Grunt, Monkey Striker.',
    '',
  ];
  for (const report of reports) {
    lines.push(`## Character: ${title(report.entityId)} / ${report.animationId}`);
    lines.push('');
    lines.push(`Idle reference body height: ${format(report.idleReference.bodyHeight)} (${report.idleReference.source})`);
    lines.push(`Idle reference body width: ${format(report.idleReference.bodyWidth)}`);
    lines.push(`Idle width/height ratio: ${format(report.idleReference.widthToHeightRatio)}`);
    lines.push(`Idle torso/core width estimate: ${format(report.idleReference.torsoCoreWidth)}`);
    lines.push(`Idle feet span estimate: ${format(report.idleReference.feetSpanWidth)}`);
    lines.push('');
    lines.push('| Frame | Body H | vs Idle | Body W | vs Idle | W/H vs Idle | Torso vs Idle | Feet vs Idle | Baseline Shift | Source | Warning |');
    lines.push('| ----: | -----: | ------: | -----: | ------: | ----------: | ------------: | -----------: | -------------: | ------ | ------- |');
    for (const frame of report.frames) {
      lines.push(
        `| ${frame.frame} | ${format(frame.visibleBodyHeight)} | ${percent(frame.heightVsIdle)} | ${format(frame.visibleBodyWidth)} | ${percent(frame.widthVsIdle)} | ${percent(frame.ratioVsIdle)} | ${percent(frame.torsoCoreWidthVsIdle)} | ${percent(frame.feetSpanVsIdle)} | ${format(frame.baselineShift)} | ${frame.sourcePriority} | ${frame.warnings.join('; ') || 'ok'} |`,
      );
    }
    const flagged = report.frames.filter((frame) => frame.warnings.length > 0);
    if (flagged.length > 0) {
      lines.push('');
      lines.push('Flagged frame details:');
      for (const frame of flagged) {
        lines.push(`- ${report.entityId}/${report.animationId}/${frame.frame}: ${frame.likelyCauses.join(', ')}. Runtime: \`${frame.runtimeFramePath}\`. Manual override: \`${frame.manualOverridePath}\`. Recommended: ${frame.recommendedAction.join('; ') || 'monitor only'}.`);
      }
    }
    lines.push('');
  }
  return `${lines.join('\n')}\n`;
}

function widthLimit(animationId) {
  return isWidePose(animationId) ? 2.25 : 1.45;
}

function isWidePose(animationId) {
  return animationId.includes('kick') || animationId.includes('dash') || animationId.includes('sweep') || animationId.includes('tornado');
}

function ratio(value, reference) {
  return Number.isFinite(value) && Number.isFinite(reference) && reference > 0 ? round(value / reference, 4) : undefined;
}

function median(values) {
  if (values.length === 0) return undefined;
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.floor(sorted.length / 2)];
}

function round(value, decimals = 2) {
  const scale = 10 ** decimals;
  return Math.round(value * scale) / scale;
}

function format(value) {
  return value === undefined ? 'n/a' : String(value);
}

function percent(value) {
  return value === undefined ? 'n/a' : `${Math.round(value * 100)}%`;
}

function title(value) {
  return value.replace(/-/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function toPosix(value) {
  return value.replace(/\\/g, '/');
}
