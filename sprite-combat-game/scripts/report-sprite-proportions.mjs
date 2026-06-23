import { existsSync } from 'node:fs';
import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const cwd = process.cwd();
const finalScope = ['ronin', 'supreme-emperor', 'monkey-grunt', 'striker-monkey'];
const requiredAnimations = new Map([
  ['monkey-grunt', ['cross', 'hit_react', 'death', 'knockdown']],
  ['striker-monkey', ['round_kick', 'hit_react', 'run', 'idle', 'death', 'knockdown']],
]);
const profileById = new Map([
  ['ronin', { bodyWidth: 58, bodyHeight: 118 }],
  ['supreme-emperor', { bodyWidth: 68, bodyHeight: 136 }],
  ['monkey-grunt', { bodyWidth: 44, bodyHeight: 70 }],
  ['striker-monkey', { bodyWidth: 46, bodyHeight: 74 }],
]);

const summary = [];

for (const entityId of finalScope) {
  const qaRoot = path.resolve(cwd, 'public/sprites/qa', entityId);
  const animationIds = new Set(requiredAnimations.get(entityId) ?? []);
  if (existsSync(qaRoot)) {
    const animations = await readdir(qaRoot, { withFileTypes: true });
    for (const animation of animations.filter((entry) => entry.isDirectory())) animationIds.add(animation.name);
  }
  const idleReference = await loadReference(entityId);
  for (const animationId of [...animationIds].sort()) {
    const metadataPath = path.join(qaRoot, animationId, 'metadata.json');
    const metadata = existsSync(metadataPath) ? JSON.parse(await readFile(metadataPath, 'utf8')) : undefined;
    const report = buildReport(entityId, animationId, metadata, idleReference);
    const outDir = path.resolve(cwd, 'public/sprites/qa', entityId, animationId);
    await mkdir(outDir, { recursive: true });
    await writeFile(path.join(outDir, 'proportion-report.json'), `${JSON.stringify(report, null, 2)}\n`, 'utf8');
    summary.push({
      entityId,
      animationId,
      reportPath: path.join(outDir, 'proportion-report.json'),
      suspiciousFrames: report.frames.filter((frame) => frame.flags.length > 0).length,
      worstFlags: report.frames.flatMap((frame) => frame.flags.map((flag) => `${frame.frame}: ${flag}`)).slice(0, 5),
    });
  }
}

const summaryPath = path.resolve(cwd, 'public/sprites/qa/proportion-summary.json');
await writeFile(summaryPath, `${JSON.stringify({ generatedAt: new Date().toISOString(), finalScope, summary }, null, 2)}\n`, 'utf8');
console.log(`Wrote ${summaryPath}`);
for (const row of summary.filter((entry) => entry.suspiciousFrames > 0)) {
  console.log(`${row.entityId}/${row.animationId}: ${row.suspiciousFrames} suspicious frame(s)`);
}

async function loadReference(entityId) {
  const metadataPath = path.resolve(cwd, 'public/sprites/qa', entityId, 'idle', 'metadata.json');
  if (!existsSync(metadataPath)) return profileById.get(entityId);
  const metadata = JSON.parse(await readFile(metadataPath, 'utf8'));
  const frames = metadata.frames ?? [];
  const bodyHeights = frames.map((frame) => frame.bodyBounds?.height ?? frame.bodyBounds?.h ?? frame.sourceBounds?.h).filter(Number.isFinite);
  const bodyWidths = frames.map((frame) => frame.bodyBounds?.width ?? frame.bodyBounds?.w ?? frame.sourceBounds?.w).filter(Number.isFinite);
  return {
    bodyHeight: median(bodyHeights) ?? profileById.get(entityId)?.bodyHeight,
    bodyWidth: median(bodyWidths) ?? profileById.get(entityId)?.bodyWidth,
  };
}

function buildReport(entityId, animationId, metadata, idleReference) {
  const profile = profileById.get(entityId) ?? idleReference;
  const reference = {
    bodyHeight: idleReference?.bodyHeight ?? profile?.bodyHeight,
    bodyWidth: idleReference?.bodyWidth ?? profile?.bodyWidth,
    source: idleReference ? 'idle metadata median' : 'character profile fallback',
  };
  const frames = (metadata?.frames ?? []).map((frame, index) => {
    const body = frame.bodyBounds ?? frame.sourceBounds ?? frame.foregroundBounds;
    const height = body?.height ?? body?.h;
    const width = body?.width ?? body?.w;
    const baseline = frame.anchorY && (frame.frameSize?.h ?? metadata.outputCanvas?.h) ? Math.round(frame.anchorY * (frame.frameSize?.h ?? metadata.outputCanvas?.h)) : undefined;
    const heightVsIdle = ratio(height, reference.bodyHeight);
    const widthVsIdle = ratio(width, reference.bodyWidth);
    const flags = [];
    if (heightVsIdle !== undefined && (heightVsIdle < 0.82 || heightVsIdle > 1.18)) flags.push(`body height ${Math.round(heightVsIdle * 100)}% of idle`);
    if (widthVsIdle !== undefined && animationId !== 'tornado_kick' && !animationId.includes('kick') && (widthVsIdle < 0.72 || widthVsIdle > 1.55)) flags.push(`body width ${Math.round(widthVsIdle * 100)}% of idle`);
    if (body?.y !== undefined && body.y < 2) flags.push('top of body is very close to crop edge');
    if (frame.cutoff) flags.push('import marked frame cutoff');
    return {
      frame: String(index + 1).padStart(4, '0'),
      runtimeFramePath: path.resolve(cwd, 'public/sprites/frames-cleaned', entityId, animationId, `${String(index + 1).padStart(4, '0')}.png`),
      manualOverridePath: path.resolve(cwd, 'public/sprites/manual-overrides', entityId, animationId, `${String(index + 1).padStart(4, '0')}.png`),
      visibleBodyHeight: height,
      visibleBodyWidth: width,
      heightVsIdle,
      widthVsIdle,
      baseline,
      approximateTorsoZone: body ? zone(body, 0.18, 0.22, 0.64, 0.34) : undefined,
      approximateLegZone: body ? zone(body, 0.12, 0.56, 0.76, 0.42) : undefined,
      approximateArmReachZone: body ? zone(body, 0, 0.18, 1, 0.38) : undefined,
      flags,
    };
  });
  return {
    entityId,
    animationId,
    note: metadata ? undefined : 'No per-frame QA metadata exists yet. Runtime likely uses an atlas strip; use Sprite Lab/manual override PNGs for detailed body metrics.',
    reference,
    outputCanvas: metadata?.outputCanvas,
    normalizedScale: metadata?.normalizedScale,
    targetBodyHeight: metadata?.targetBodyHeight,
    frames,
  };
}

function zone(bounds, x, y, w, h) {
  const left = bounds.x ?? 0;
  const top = bounds.y ?? 0;
  const width = bounds.width ?? bounds.w ?? 0;
  const height = bounds.height ?? bounds.h ?? 0;
  return {
    x: Math.round(left + width * x),
    y: Math.round(top + height * y),
    w: Math.round(width * w),
    h: Math.round(height * h),
  };
}

function ratio(value, reference) {
  return Number.isFinite(value) && Number.isFinite(reference) && reference > 0 ? value / reference : undefined;
}

function median(values) {
  if (values.length === 0) return undefined;
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.floor(sorted.length / 2)];
}
