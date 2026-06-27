import { existsSync } from 'node:fs';
import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const cwd = process.cwd();
const docPath = path.resolve(cwd, 'docs/ATTACK_FRAME_LOCATIONS.md');
const mainFrameDocPath = path.resolve(cwd, 'docs/SPRITE_FRAME_LOCATIONS.md');

const runtimeSources = [
  {
    id: 'manual-overrides',
    root: 'public/sprites/manual-overrides',
    overwrittenByImport: false,
    note: 'Safe hand-edited override folder. Runtime checks this first per frame.',
  },
  {
    id: 'frames-alpha-repaired',
    root: 'public/sprites/frames-alpha-repaired',
    overwrittenByImport: true,
    note: 'Generated alpha-hole repaired PNGs. Runtime checks this before cleaned frames when metadata points to a repair.',
  },
  {
    id: 'frames-cleaned',
    root: 'public/sprites/frames-cleaned',
    overwrittenByImport: true,
    note: 'Generated alpha-cleaned runtime PNGs. Rerun clean-alpha may overwrite this.',
  },
  {
    id: 'frames-pack',
    root: 'public/sprites/frames-pack',
    overwrittenByImport: true,
    note: 'Generated sprite-pack PNGs. Rerun sprite-pack:import may overwrite this.',
  },
  {
    id: 'frames-reference',
    root: 'public/sprites/frames-reference',
    overwrittenByImport: true,
    note: 'Generated reference-extracted PNGs.',
  },
  {
    id: 'frames-semi-realistic',
    root: 'public/sprites/frames-semi-realistic',
    overwrittenByImport: true,
    note: 'Generated semi-realistic PNGs.',
  },
  {
    id: 'frames',
    root: 'public/sprites/frames',
    overwrittenByImport: false,
    note: 'Raw fallback per-frame PNGs.',
  },
];

const chainVisualMappings = new Map([
  ['ronin:jab', { frames: ['0003', '0004', '0005'], durations: [54, 92, 54], note: 'Chained jab skips startup and anchors on the contact extension.' }],
  ['ronin:cross', { frames: ['0003', '0004', '0005'], durations: [46, 126, 58], note: 'Old held visual was the pre-impact `0003`; chained cross now holds true impact `0004`.' }],
  ['ronin:roundhouse_kick', { frames: ['0004', '0005', '0006'], durations: [68, 144, 72], note: 'Chained roundhouse uses kick setup, full extension, guard return.' }],
  ['ronin:side_kick', { frames: ['0003', '0004', '0006'], durations: [58, 132, 64], note: 'Chained side kick uses chamber, impact extension, guard return.' }],
  ['supreme-emperor:jab_cross', { frames: ['0003', '0004', '0005'], durations: [78, 142, 60], note: 'Chained one-two holds jab/cross impact frames instead of full windup.' }],
  ['supreme-emperor:feint_rear_hook', { frames: ['0005', '0006', '0007'], durations: [62, 130, 68], note: 'Chained hook skips feint setup and centers on hook contact.' }],
  ['supreme-emperor:roundhouse_kick', { frames: ['0004', '0005', '0006'], durations: [68, 140, 72], note: 'Chained roundhouse uses chamber, kick impact, recovery.' }],
  ['supreme-emperor:tornado_kick', { frames: ['0006', '0007', '0008'], durations: [72, 170, 66], note: 'Chained tornado keeps the true `0007` impact anchor.' }],
]);

const visualQaAudits = new Map([
  ['ronin:roundhouse_kick', {
    readinessBadge: 'NEEDS MANUAL REPAIR',
    gameplayReady: false,
    failedFrames: ['0003.png', '0004.png', '0005.png'],
    unusableFrames: [],
    frames: [
      ['0001.png', 'PASS', 'Guard frame reads as Ronin; no obvious runtime-visible cuts.'],
      ['0002.png', 'PASS', 'Transition frame is compact but usable in motion.'],
      ['0003.png', 'NEEDS_MANUAL_REPAIR', 'Chamber pose has body-width/proportion drift and rough silhouette around the raised leg.'],
      ['0004.png', 'NEEDS_MANUAL_REPAIR', 'Kick setup has torso and pant silhouette roughness; not clean enough for full gameplay-ready status.'],
      ['0005.png', 'NEEDS_MANUAL_REPAIR', 'Full extension is usable as a pose but has rough leg/boot edge read and proportion drift.'],
      ['0006.png', 'PASS', 'Guard return reads consistently with Ronin idle.'],
    ],
  }],
  ['ronin:side_kick', {
    readinessBadge: 'QA ONLY',
    gameplayReady: false,
    failedFrames: ['0001.png', '0002.png', '0003.png', '0004.png', '0005.png'],
    unusableFrames: ['0001.png'],
    frames: [
      ['0001.png', 'UNUSABLE_SOURCE_FRAME', 'Large pale/white torso cut is visible on the active runtime frame.'],
      ['0002.png', 'NEEDS_MANUAL_REPAIR', 'Wide stance has rough silhouette and torso-width drift; automated scan also finds pale cut pixels.'],
      ['0003.png', 'NEEDS_MANUAL_REPAIR', 'Chamber pose has awkward lower-leg/boot read and proportion drift.'],
      ['0004.png', 'NEEDS_MANUAL_REPAIR', 'Extension pose has rough leg silhouette and does not read as fully clean Ronin art.'],
      ['0005.png', 'NEEDS_MANUAL_REPAIR', 'Full extension has rough foot/leg silhouette and automated pale cut pixels.'],
      ['0006.png', 'PASS', 'Guard return reads consistently with Ronin idle.'],
    ],
  }],
]);

const activeAnimations = [
  entry('ronin', 'Ronin', 'Jab', 'jab', { problem: true, visualActiveFrames: [3], impactFrame: 3 }),
  entry('ronin', 'Ronin', 'Cross', 'cross', {
    problem: true,
    visualActiveFrames: [4],
    impactFrame: 4,
    timingNote: 'Corrected this pass: old held frame was `0003` pre-impact; new held/impact frame is `0004` full extension.',
  }),
  entry('ronin', 'Ronin', 'Roundhouse Kick', 'roundhouse_kick', {
    problem: true,
    visualActiveFrames: [5],
    impactFrame: 5,
    timingNote: 'Promoted to Ronin K by owner request. Active-runtime QA accepts frame 0003 with intentional alpha detail.',
  }),
  entry('ronin', 'Ronin', 'Side Kick', 'side_kick', {
    problem: true,
    visualActiveFrames: [4],
    impactFrame: 4,
    timingNote: 'Intended Ronin L move, but gated from gameplay until active-runtime QA passes.',
  }),
  entry('ronin', 'Ronin', 'Dash', 'dash'),
  entry('ronin', 'Ronin', 'Hit React', 'hit_react'),
  entry('ronin', 'Ronin', 'Recovery', 'recovery'),
  entry('ronin', 'Ronin', 'Stand Up', 'stand_up'),
  entry('supreme-emperor', 'Supreme Emperor', 'Jab-Cross', 'jab_cross', {
    problem: true,
    visualActiveFrames: [3, 4],
    impactFrame: 4,
    timingNote: 'Corrected this pass: old holds were `0002`/`0005`; new held impact frames are `0003` jab and `0004` cross.',
  }),
  entry('supreme-emperor', 'Supreme Emperor', 'Cross second hit inside Jab-Cross', 'jab_cross', {
    problem: true,
    visualActiveFrames: [3, 4],
    impactFrame: 4,
    timingNote: 'Second hit now resolves on `0004`, the full cross/spark contact pose.',
  }),
  entry('supreme-emperor', 'Supreme Emperor', 'Feint-Rear Hook', 'feint_rear_hook'),
  entry('supreme-emperor', 'Supreme Emperor', 'Tornado Kick', 'tornado_kick', { problem: true, visualActiveFrames: [7], impactFrame: 7 }),
  entry('supreme-emperor', 'Supreme Emperor', 'Roundhouse Kick', 'roundhouse_kick'),
  entry('supreme-emperor', 'Supreme Emperor', 'Dash', 'dash'),
  entry('supreme-emperor', 'Supreme Emperor', 'Hit React', 'hit_react'),
  entry('supreme-emperor', 'Supreme Emperor', 'Recovery', 'recovery'),
  entry('supreme-emperor', 'Supreme Emperor', 'Stand Up', 'stand_up'),
  entry('monkey-grunt', 'Monkey Grunt', 'Attack / Cross', 'cross'),
  entry('monkey-grunt', 'Monkey Grunt', 'Hit React', 'hit_react'),
  entry('monkey-grunt', 'Monkey Grunt', 'Death', 'death'),
  entry('monkey-grunt', 'Monkey Grunt', 'Knockdown', 'knockdown'),
  entry('striker-monkey', 'Monkey Striker', 'Attack / Round Kick', 'round_kick', { problem: true }),
  entry('striker-monkey', 'Monkey Striker', 'Hit React', 'hit_react'),
  entry('striker-monkey', 'Monkey Striker', 'Run', 'run', { problem: true }),
  entry('striker-monkey', 'Monkey Striker', 'Idle', 'idle'),
  entry('striker-monkey', 'Monkey Striker', 'Death', 'death'),
  entry('striker-monkey', 'Monkey Striker', 'Knockdown', 'knockdown'),
];

const spritePackManifests = await loadSpritePackManifests();
const fightcoreMetadata = await loadFightcoreMetadata();
const activeRuntimeQa = await loadActiveRuntimeQa();
const rows = await Promise.all(activeAnimations.map(toReportRow));
const markdown = renderMarkdown(rows);

await mkdir(path.dirname(docPath), { recursive: true });
await writeFile(docPath, markdown, 'utf8');
await updateMainFrameDoc(markdown);
console.log(markdown);
console.log(`\nWrote ${docPath}`);
console.log(`Updated ${mainFrameDocPath}`);

function entry(characterId, displayName, moveName, animationId, options = {}) {
  return { characterId, displayName, moveName, animationId, ...options };
}

async function toReportRow(item) {
  const runtime = await findRuntimeSource(item.characterId, item.animationId);
  const manifest = spritePackManifests.get(item.characterId)?.animations.get(item.animationId);
  const metadata = fightcoreMetadata.get(item.characterId)?.animations?.[item.animationId];
  const sourceSheet = manifest?.sourcePath ?? stripPathFor(item.characterId, metadata) ?? 'No source sheet found; runtime may use fallback shapes.';
  const qaFolder = path.resolve(cwd, 'public/sprites/qa', item.characterId, item.animationId);
  const cleanedQaFolder = path.resolve(cwd, 'public/sprites/qa-cleaned', item.characterId, item.animationId);
  return {
    ...item,
    runtime,
    sourceSheet,
    qaFolder,
    cleanedQaFolder,
    continuityPath: path.join(qaFolder, 'frame-continuity.json'),
    cleanedContinuityPath: path.join(cleanedQaFolder, 'frame-continuity.json'),
    proportionPath: path.join(qaFolder, 'proportion-report.json'),
    chainVisual: chainVisualMappings.get(`${item.characterId}:${item.animationId}`),
    visualQaAudit: activeRuntimeQa.get(`${item.characterId}:${item.animationId}`) ?? visualQaAudits.get(`${item.characterId}:${item.animationId}`),
    manualOverrideFolder: path.resolve(cwd, 'public/sprites/manual-overrides', item.characterId, item.animationId),
    manualOverrideExample: path.resolve(cwd, 'public/sprites/manual-overrides', item.characterId, item.animationId, '0001.png'),
    framesPackFolder: path.resolve(cwd, 'public/sprites/frames-pack', item.characterId, item.animationId),
    frameDurations: manifest?.frameDurations ?? [],
    holdFrames: manifest?.holdFrames ?? {},
    visualActiveFrames: item.visualActiveFrames ?? [],
    impactFrame: item.impactFrame,
    problem: Boolean(item.problem),
    metadata,
  };
}

async function loadActiveRuntimeQa() {
  const result = new Map();
  const summaryPath = path.resolve(cwd, 'public/sprites/qa/ronin-active-runtime-cleanliness-summary.json');
  if (!existsSync(summaryPath)) return result;
  const summary = JSON.parse(await readFile(summaryPath, 'utf8'));
  for (const target of summary.targets ?? []) {
    result.set(`${target.entityId}:${target.animationKey}`, {
      readinessBadge: target.readinessBadge,
      gameplayReady: target.verdict === 'ACTIVE_RUNTIME_READY',
      failedFrames: target.failedFrames ?? [],
      unusableFrames: target.unusableFrames ?? [],
      frames: (target.frameStatuses ?? []).map((frameStatus) => [
        frameStatus.frame,
        frameStatus.status,
        frameStatus.reason,
      ]),
    });
  }
  return result;
}

async function findRuntimeSource(characterId, animationId) {
  for (const source of runtimeSources) {
    const folder = path.resolve(cwd, source.root, characterId, animationId);
    const files = await listPngs(folder);
    if (files.length > 0) {
      return { ...source, folder, files };
    }
  }
  const metadata = fightcoreMetadata.get(characterId)?.animations?.[animationId];
  if (metadata?.stripPath) {
    const stripPath = stripPathFor(characterId, metadata);
    return {
      id: 'atlas-strip',
      root: `public/assets/fightcore/sprites/${characterId}`,
      folder: stripPath ? path.dirname(stripPath) : path.resolve(cwd, 'public/assets/fightcore/sprites', characterId),
      files: [],
      stripPath,
      overwrittenByImport: false,
      note: 'Runtime uses atlas/strip crop metadata, not individual runtime PNG files for this animation.',
    };
  }
  return {
    id: 'missing',
    root: '',
    folder: 'No active runtime frame folder found.',
    files: [],
    overwrittenByImport: false,
    note: 'No per-frame PNG folder or atlas-strip metadata found for this requested animation.',
  };
}

async function listPngs(folder) {
  if (!existsSync(folder)) return [];
  const entries = await readdir(folder, { withFileTypes: true });
  return entries
    .filter((entry) => entry.isFile() && entry.name.toLowerCase().endsWith('.png'))
    .map((entry) => path.join(folder, entry.name))
    .sort(numericFrameSort);
}

async function loadSpritePackManifests() {
  const packRoot = path.resolve(cwd, 'public/sprite-packs');
  const result = new Map();
  if (!existsSync(packRoot)) return result;
  const packDirs = await readdir(packRoot, { withFileTypes: true });
  for (const packDir of packDirs.filter((entry) => entry.isDirectory())) {
    const manifestPath = path.join(packRoot, packDir.name, 'character.json');
    if (!existsSync(manifestPath)) continue;
    const manifest = JSON.parse(await readFile(manifestPath, 'utf8'));
    const characterId = manifest.id ?? packDir.name;
    const animations = new Map();
    for (const [animationId, animation] of Object.entries(manifest.animations ?? {})) {
      if (typeof animation?.file !== 'string') continue;
      animations.set(animationId, {
        sourcePath: path.resolve(path.dirname(manifestPath), animation.file),
        manifestPath,
        frameDurations: Array.isArray(animation.frameDurations) ? animation.frameDurations : [],
        holdFrames: animation.holdFrames ?? {},
      });
    }
    result.set(characterId, { manifestPath, animations });
  }
  return result;
}

async function loadFightcoreMetadata() {
  const root = path.resolve(cwd, 'public/assets/fightcore/sprites');
  const result = new Map();
  if (!existsSync(root)) return result;
  const dirs = await readdir(root, { withFileTypes: true });
  for (const dir of dirs.filter((entry) => entry.isDirectory())) {
    const metadataPath = path.join(root, dir.name, 'metadata.json');
    if (!existsSync(metadataPath)) continue;
    try {
      result.set(dir.name, JSON.parse(await readFile(metadataPath, 'utf8')));
    } catch (error) {
      console.warn(`Could not read ${metadataPath}: ${error.message}`);
    }
  }
  return result;
}

function stripPathFor(characterId, metadata) {
  if (!metadata?.stripPath) return undefined;
  return path.resolve(cwd, 'public/assets/fightcore/sprites', characterId, metadata.stripPath);
}

function renderMarkdown(items) {
  const lines = [];
  lines.push('# Active Attack Frame Locations');
  lines.push('');
  lines.push('Generated by `npm.cmd run sprite-pack:list-attacks`.');
  lines.push('');
  lines.push('Runtime priority: `manual-overrides` > `frames-alpha-repaired` > `frames-cleaned` > `frames-pack` > `frames-reference` > `frames-semi-realistic` > raw fallback frames > atlas/strip crop metadata.');
  lines.push('');
  lines.push('Use manual overrides for permanent hand edits. Generated folders may be overwritten by import or cleanup scripts.');
  lines.push('');
  for (const row of items) {
    lines.push(`## ${row.displayName} - ${row.moveName}`);
    lines.push('');
    if (row.problem) lines.push('**Problem animation to check first.**');
    if (row.problem) lines.push('');
    lines.push(`- Character id: \`${row.characterId}\``);
    lines.push(`- Animation id: \`${row.animationId}\``);
    lines.push(`- Runtime source: \`${row.runtime.id}\``);
    lines.push(`- Active runtime frame folder: \`${row.runtime.folder}\``);
    lines.push(`- Source sheet/strip: \`${row.sourceSheet}\``);
    lines.push(`- QA folder: \`${row.qaFolder}\``);
    lines.push(`- Cleaned QA folder: \`${row.cleanedQaFolder}\``);
    lines.push(`- Frame continuity report: \`${row.continuityPath}\``);
    lines.push(`- Cleaned continuity report: \`${row.cleanedContinuityPath}\``);
    lines.push(`- Proportion report: \`${row.proportionPath}\``);
    lines.push(`- Held impact frames: ${Object.keys(row.holdFrames).length > 0 ? Object.entries(row.holdFrames).map(([frame, count]) => `\`${frame}\` x${count}`).join(', ') : 'none'}`);
    lines.push(`- Frame durations: ${row.frameDurations.length > 0 ? row.frameDurations.map((duration, index) => `\`${String(index + 1).padStart(4, '0')}:${duration}ms\``).join(', ') : 'runtime default'}`);
    lines.push(`- Visual active frames: ${row.visualActiveFrames.length > 0 ? row.visualActiveFrames.map((frame) => `\`${String(frame).padStart(4, '0')}\``).join(', ') : 'combat profile/default'}`);
    lines.push(`- Impact frame: ${row.impactFrame ? `\`${String(row.impactFrame).padStart(4, '0')}\`` : 'not marked'}`);
    if (row.chainVisual) {
      lines.push(`- Chained visual frames: ${row.chainVisual.frames.map((frame, index) => `\`${frame}:${row.chainVisual.durations[index]}ms\``).join(' -> ')}`);
      lines.push(`- Chained visual note: ${row.chainVisual.note}`);
    }
    if (row.timingNote) lines.push(`- Timing note: ${row.timingNote}`);
    if (row.visualQaAudit) {
      lines.push(`- Visual QA badge: \`${row.visualQaAudit.readinessBadge}\``);
      lines.push(`- Gameplay ready: ${row.visualQaAudit.gameplayReady ? 'yes' : 'no'}`);
      lines.push(`- Failed frames: ${row.visualQaAudit.failedFrames.length > 0 ? row.visualQaAudit.failedFrames.map((frame) => `\`${frame}\``).join(', ') : 'none'}`);
      lines.push(`- Unusable source frames: ${row.visualQaAudit.unusableFrames.length > 0 ? row.visualQaAudit.unusableFrames.map((frame) => `\`${frame}\``).join(', ') : 'none'}`);
    }
    lines.push(`- Manual override folder: \`${row.manualOverrideFolder}\``);
    lines.push(`- Manual override example: \`${row.manualOverrideExample}\``);
    lines.push(`- Rerunning import/clean can overwrite active folder: ${row.runtime.overwrittenByImport ? 'yes' : 'no'}`);
    lines.push(`- Warning: ${row.runtime.note}`);
    if (row.runtime.stripPath) lines.push(`- Atlas/strip path: \`${row.runtime.stripPath}\``);
    lines.push('');
    lines.push('Runtime frames:');
    lines.push('');
    if (row.runtime.files.length > 0) {
      for (const file of row.runtime.files) lines.push(`- \`${file}\``);
    } else {
      lines.push('- No individual runtime PNG files are active for this animation; inspect the source strip/atlas path above or add numbered PNGs in the manual override folder.');
    }
    if (row.visualQaAudit) {
      lines.push('');
      lines.push('Frame-by-frame visual QA:');
      lines.push('');
      for (const [frame, status, reason] of row.visualQaAudit.frames) {
        lines.push(`- \`${frame}\`: \`${status}\` - ${reason} Manual override: \`${path.join(row.manualOverrideFolder, frame)}\``);
      }
    }
    lines.push('');
  }
  return `${lines.join('\n')}\n`;
}

async function updateMainFrameDoc(attackMarkdown) {
  let existing = '';
  if (existsSync(mainFrameDocPath)) existing = await readFile(mainFrameDocPath, 'utf8');
  const start = '<!-- ACTIVE_ATTACK_FRAME_LOCATIONS_START -->';
  const end = '<!-- ACTIVE_ATTACK_FRAME_LOCATIONS_END -->';
  const block = `${start}\n\n${attackMarkdown}\n${end}`;
  const next = existing.includes(start)
    ? existing.replace(new RegExp(`${escapeRegExp(start)}[\\s\\S]*?${escapeRegExp(end)}`), block)
    : `${existing.trimEnd()}\n\n${block}\n`;
  await writeFile(mainFrameDocPath, next, 'utf8');
}

function numericFrameSort(left, right) {
  const leftNumber = Number.parseInt(path.basename(left), 10);
  const rightNumber = Number.parseInt(path.basename(right), 10);
  if (Number.isFinite(leftNumber) && Number.isFinite(rightNumber) && leftNumber !== rightNumber) {
    return leftNumber - rightNumber;
  }
  return left.localeCompare(right);
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
