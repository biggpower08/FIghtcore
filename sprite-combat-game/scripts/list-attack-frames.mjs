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

const activeAnimations = [
  entry('ronin', 'Ronin', 'Jab', 'jab', { problem: true, visualActiveFrames: [3], impactFrame: 3 }),
  entry('ronin', 'Ronin', 'Cross', 'cross', { problem: true, visualActiveFrames: [3], impactFrame: 3 }),
  entry('ronin', 'Ronin', 'Calf Kick', 'calf_kick'),
  entry('ronin', 'Ronin', 'Knee', 'knee'),
  entry('ronin', 'Ronin', 'Dash', 'dash'),
  entry('ronin', 'Ronin', 'Hit React', 'hit_react'),
  entry('ronin', 'Ronin', 'Recovery', 'recovery'),
  entry('ronin', 'Ronin', 'Stand Up', 'stand_up'),
  entry('supreme-emperor', 'Supreme Emperor', 'Jab-Cross', 'jab_cross', { problem: true, visualActiveFrames: [2, 5], impactFrame: 5 }),
  entry('supreme-emperor', 'Supreme Emperor', 'Cross second hit inside Jab-Cross', 'jab_cross', { problem: true, visualActiveFrames: [2, 5], impactFrame: 5 }),
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
  lines.push('Runtime priority: `manual-overrides` > `frames-cleaned` > `frames-pack` > `frames-reference` > `frames-semi-realistic` > raw fallback frames > atlas/strip crop metadata.');
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
