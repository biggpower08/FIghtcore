import { existsSync } from 'node:fs';
import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const cwd = process.cwd();

const FRAME_SOURCES = [
  {
    id: 'manual-overrides',
    root: 'public/sprites/manual-overrides',
    label: 'manual override PNGs',
    priority: 1,
    registry: 'filesystem only; runtime checks this folder first',
    overwrite: 'SAFE FOR MANUAL EDITS. Sprite importers do not write here.',
    safeManualEdit: true,
  },
  {
    id: 'frames-pack',
    root: 'public/sprites/frames-pack',
    label: 'normalized sprite-pack PNGs',
    priority: 2,
    registry: 'src/data/generatedSpriteRegistry.ts',
    overwrite: 'Generated output. npm.cmd run sprite-pack:import may overwrite this folder.',
    safeManualEdit: false,
  },
  {
    id: 'frames-reference',
    root: 'public/sprites/frames-reference',
    label: 'reference-extracted PNGs',
    priority: 3,
    registry: 'src/data/referenceSpriteFrames.ts',
    overwrite: 'Generated output. npm.cmd run sprite:extract-reference may overwrite this folder.',
    safeManualEdit: false,
  },
  {
    id: 'frames-semi-realistic',
    root: 'public/sprites/frames-semi-realistic',
    label: 'semi-realistic PNGs',
    priority: 4,
    registry: 'src/data/semiRealisticSpriteFrames.ts',
    overwrite: 'Generated output. npm.cmd run sprite:import-semi-realistic may overwrite this folder.',
    safeManualEdit: false,
  },
  {
    id: 'frames',
    root: 'public/sprites/frames',
    label: 'raw fallback PNGs',
    priority: 5,
    registry: 'src/data/spriteAnimations.ts plus runtime filesystem fallback',
    overwrite: 'Raw fallback folder. Do not hand-edit unless you intentionally want to change the fallback asset.',
    safeManualEdit: false,
  },
  {
    id: 'frames-alpha-repaired',
    root: 'public/sprites/frames-alpha-repaired',
    label: 'alpha-hole repaired PNGs',
    priority: 6,
    registry: 'src/data/alphaHoleSpriteFrames.ts',
    overwrite: 'Generated output. Alpha repair scripts may overwrite this folder.',
    safeManualEdit: false,
  },
];

const args = new Set(process.argv.slice(2));
const writeDoc = args.has('--write-doc');

const manifests = await loadSpritePackManifests();
const registrySources = await loadRegistrySources();
const qaMetadata = await loadQaMetadata();
const rows = await collectRows();

rows.sort((left, right) =>
  left.character.localeCompare(right.character) || left.animation.localeCompare(right.animation),
);

if (writeDoc) {
  const docPath = path.resolve(cwd, 'docs/SPRITE_FRAME_LOCATIONS.md');
  await mkdir(path.dirname(docPath), { recursive: true });
  await writeFile(docPath, renderMarkdown(rows), 'utf8');
  console.log(`Wrote ${docPath}`);
} else {
  printTable(rows);
}

async function collectRows() {
  const byAnimation = new Map();

  for (const source of FRAME_SOURCES) {
    const rootPath = path.resolve(cwd, source.root);
    if (!existsSync(rootPath)) continue;
    const characters = await safeReaddir(rootPath, { withFileTypes: true });
    for (const characterDir of characters.filter((entry) => entry.isDirectory())) {
      const character = characterDir.name;
      const characterPath = path.join(rootPath, character);
      const animations = await safeReaddir(characterPath, { withFileTypes: true });
      for (const animationDir of animations.filter((entry) => entry.isDirectory())) {
        const animation = animationDir.name;
        const animationPath = path.join(characterPath, animation);
        const files = (await safeReaddir(animationPath, { withFileTypes: true }))
          .filter((entry) => entry.isFile() && entry.name.toLowerCase().endsWith('.png'))
          .map((entry) => path.join(animationPath, entry.name))
          .sort(numericFrameSort);
        if (files.length === 0) continue;

        const key = `${character}/${animation}`;
        const row =
          byAnimation.get(key) ??
          {
            character,
            animation,
            displayName: manifests.get(character)?.displayName ?? titleCase(character),
            sources: [],
          };
        row.sources.push({
          ...source,
          folder: animationPath,
          files,
          frameCount: files.length,
        });
        byAnimation.set(key, row);
      }
    }
  }

  return [...byAnimation.values()].map((row) => {
    row.sources.sort((left, right) => left.priority - right.priority);
    const runtimeSource = row.sources[0];
    const qa = qaMetadata.get(`${row.character}/${row.animation}`);
    const manifestSource = manifests.get(row.character)?.animations.get(row.animation);
    const registrySource = registrySources.get(`${row.character}/${row.animation}`);
    const sourceSheet = qa?.sourcePath ?? manifestSource ?? registrySource ?? 'not registered or not known from current metadata';
    return {
      ...row,
      runtimeSource,
      sourceSheet,
      qaPath: qa ? path.dirname(qa.metadataPath) : path.resolve(cwd, 'public/sprites/qa', row.character, row.animation),
      manifestPath: manifests.get(row.character)?.manifestPath,
      registryPath: runtimeSource.registry,
    };
  });
}

async function loadSpritePackManifests() {
  const packRoot = path.resolve(cwd, 'public/sprite-packs');
  const result = new Map();
  if (!existsSync(packRoot)) return result;
  const packDirs = await safeReaddir(packRoot, { withFileTypes: true });
  for (const packDir of packDirs.filter((entry) => entry.isDirectory())) {
    const manifestPath = path.join(packRoot, packDir.name, 'character.json');
    if (!existsSync(manifestPath)) continue;
    try {
      const manifest = JSON.parse(await readFile(manifestPath, 'utf8'));
      const characterId = manifest.id ?? packDir.name;
      const animations = new Map();
      for (const [animationKey, animation] of Object.entries(manifest.animations ?? {})) {
        const file = typeof animation?.file === 'string' ? animation.file : undefined;
        if (file) animations.set(animationKey, path.resolve(path.dirname(manifestPath), file));
      }
      result.set(characterId, {
        displayName: manifest.name ?? titleCase(characterId),
        manifestPath,
        animations,
      });
    } catch (error) {
      console.warn(`Could not read sprite-pack manifest ${manifestPath}: ${error.message}`);
    }
  }
  return result;
}

async function loadQaMetadata() {
  const qaRoot = path.resolve(cwd, 'public/sprites/qa');
  const result = new Map();
  if (!existsSync(qaRoot)) return result;
  const characters = await safeReaddir(qaRoot, { withFileTypes: true });
  for (const characterDir of characters.filter((entry) => entry.isDirectory())) {
    const animations = await safeReaddir(path.join(qaRoot, characterDir.name), { withFileTypes: true });
    for (const animationDir of animations.filter((entry) => entry.isDirectory())) {
      const metadataPath = path.join(qaRoot, characterDir.name, animationDir.name, 'metadata.json');
      if (!existsSync(metadataPath)) continue;
      try {
        const metadata = JSON.parse(await readFile(metadataPath, 'utf8'));
        const sourcePath = metadata.sourcePath ? path.resolve(cwd, metadata.sourcePath) : undefined;
        result.set(`${characterDir.name}/${animationDir.name}`, { metadataPath, sourcePath });
      } catch (error) {
        console.warn(`Could not read QA metadata ${metadataPath}: ${error.message}`);
      }
    }
  }
  return result;
}

async function loadRegistrySources() {
  const result = new Map();
  await parseRegistryFile('src/data/referenceSpriteFrames.ts', /"entityId":"([^"]+)","animationKey":"([^"]+)".*?"sourceSheet":"([^"]+)"/g, result);
  await parseRegistryFile('src/data/semiRealisticSpriteFrames.ts', /"entityId":"([^"]+)","animationKey":"([^"]+)".*?"sourceSheet":"([^"]+)"/g, result);
  return result;
}

async function parseRegistryFile(relativePath, pattern, result) {
  const fullPath = path.resolve(cwd, relativePath);
  if (!existsSync(fullPath)) return;
  const text = await readFile(fullPath, 'utf8');
  for (const match of text.matchAll(pattern)) {
    const sourceSheet = unescapeTsString(match[3]);
    result.set(`${match[1]}/${match[2]}`, path.resolve(cwd, sourceSheet));
  }
}

async function safeReaddir(target, options) {
  try {
    return await readdir(target, options);
  } catch {
    return [];
  }
}

function printTable(items) {
  const printable = items.map((row) => ({
    character: row.character,
    animation: row.animation,
    runtime_source: row.runtimeSource.id,
    frames: row.runtimeSource.frameCount,
    frame_folder: row.runtimeSource.folder,
    source_sheet: row.sourceSheet,
    safe_manual_edit: row.runtimeSource.safeManualEdit ? 'yes' : 'no',
  }));
  console.table(printable);
  console.log('');
  console.log('Runtime priority: manual-overrides > frames-pack > frames-reference > frames-semi-realistic > raw fallback.');
  console.log('Use --write-doc to regenerate docs/SPRITE_FRAME_LOCATIONS.md.');
}

function renderMarkdown(items) {
  const lines = [];
  lines.push('# Sprite Frame Locations');
  lines.push('');
  lines.push('This file is generated by `npm.cmd run sprite-pack:list-frames -- --write-doc`.');
  lines.push('');
  lines.push('Runtime priority: `manual-overrides` > `frames-pack` > `frames-reference` > `frames-semi-realistic` > raw fallback.');
  lines.push('');
  lines.push('Manual edits belong in `public/sprites/manual-overrides/<character>/<animation>/0001.png`. Missing override frames fall back normally, one frame at a time.');
  lines.push('');
  lines.push('Do not hand-edit generated runtime folders unless you are comfortable losing those edits during an importer run.');
  lines.push('');
  lines.push('PowerShell helpers:');
  lines.push('');
  lines.push('```powershell');
  lines.push('npm.cmd run sprite-pack:list-frames');
  lines.push('npm.cmd run sprite-pack:list-frames -- --write-doc');
  lines.push('Get-ChildItem "public\\sprites\\manual-overrides" -Recurse -Filter *.png | Select-Object FullName');
  lines.push('Get-ChildItem "public\\sprites\\frames-pack" -Recurse -Filter *.png | Select-Object FullName');
  lines.push('```');
  lines.push('');

  for (const row of items) {
    lines.push(`## ${row.displayName} / ${row.animation}`);
    lines.push('');
    lines.push(`- Character id: \`${row.character}\``);
    lines.push(`- Runtime source: \`${row.runtimeSource.id}\` (${row.runtimeSource.label})`);
    lines.push(`- Runtime frame folder: \`${row.runtimeSource.folder}\``);
    lines.push(`- Runtime frame count: ${row.runtimeSource.frameCount}`);
    lines.push(`- Source sheet: \`${row.sourceSheet}\``);
    lines.push(`- QA folder: \`${row.qaPath}\``);
    lines.push(`- Manifest: \`${row.manifestPath ?? 'not sprite-pack manifest backed'}\``);
    lines.push(`- Registry or metadata source: \`${row.registryPath}\``);
    lines.push(`- Manual edit safety: ${row.runtimeSource.safeManualEdit ? 'safe in this folder' : 'not safe in this generated/fallback folder'}`);
    lines.push(`- Importer overwrite warning: ${row.runtimeSource.overwrite}`);
    lines.push('');
    lines.push('Runtime frame PNGs:');
    lines.push('');
    for (const frameFile of row.runtimeSource.files) {
      lines.push(`- \`${frameFile}\``);
    }
    const otherSources = row.sources.filter((source) => source.id !== row.runtimeSource.id);
    if (otherSources.length > 0) {
      lines.push('');
      lines.push('Other available frame folders:');
      lines.push('');
      for (const source of otherSources) {
        lines.push(`- \`${source.id}\`: ${source.frameCount} frame(s), folder \`${source.folder}\`. ${source.overwrite}`);
      }
    }
    lines.push('');
  }

  return `${lines.join('\n')}\n`;
}

function numericFrameSort(left, right) {
  const leftNumber = Number.parseInt(path.basename(left), 10);
  const rightNumber = Number.parseInt(path.basename(right), 10);
  if (Number.isFinite(leftNumber) && Number.isFinite(rightNumber) && leftNumber !== rightNumber) {
    return leftNumber - rightNumber;
  }
  return left.localeCompare(right);
}

function titleCase(value) {
  return value
    .split(/[-_]/g)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function unescapeTsString(value) {
  return value.replaceAll('\\\\', '\\').replaceAll('\\"', '"');
}
