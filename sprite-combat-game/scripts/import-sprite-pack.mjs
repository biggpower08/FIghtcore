import { readdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const root = path.resolve('public/sprite-packs');
const outputPath = path.resolve('src/data/generatedSpriteRegistry.ts');

async function main() {
  const packs = await loadPacks();
  const generated = renderRegistry(packs);
  await writeFile(outputPath, generated);
  console.log(`Imported ${packs.length} sprite pack manifest(s) into ${path.relative(process.cwd(), outputPath)}.`);
}

async function loadPacks() {
  let entries = [];
  try {
    entries = await readdir(root, { withFileTypes: true });
  } catch {
    return [];
  }
  const packs = [];
  for (const entry of entries.filter((item) => item.isDirectory())) {
    const manifestPath = path.join(root, entry.name, 'character.json');
    try {
      const manifest = JSON.parse(await readFile(manifestPath, 'utf8'));
      packs.push(normalizePack(manifest));
    } catch (error) {
      console.warn(`Skipping ${entry.name}: ${error.message}`);
    }
  }
  return packs.sort((a, b) => a.id.localeCompare(b.id));
}

function normalizePack(manifest) {
  return {
    id: String(manifest.id),
    displayName: String(manifest.displayName ?? manifest.id),
    style: manifest.style === 'semi-realistic' ? 'semi-realistic' : 'pixel-art',
    enabled: Boolean(manifest.enabled),
    visualScale: Number.isFinite(manifest.visualScale) ? manifest.visualScale : 1,
    anchor: manifest.anchor,
    animations: Array.isArray(manifest.animations)
      ? manifest.animations.map((animation) => ({
          id: String(animation.id),
          frameCount: Number(animation.frameCount),
          fps: Number.isFinite(animation.fps) ? Number(animation.fps) : undefined,
          loop: Boolean(animation.loop),
          frameSize: animation.frameSize,
        }))
      : [],
  };
}

function renderRegistry(packs) {
  return `export interface GeneratedSpritePackAnimation {
  id: string;
  frameCount: number;
  fps?: number;
  loop?: boolean;
  frameSize?: { width: number; height: number };
}

export interface GeneratedSpritePackCharacter {
  id: string;
  displayName: string;
  style: 'pixel-art' | 'semi-realistic';
  enabled: boolean;
  visualScale: number;
  anchor?: { x: number; y: number };
  animations: GeneratedSpritePackAnimation[];
}

export const generatedSpriteRegistry: GeneratedSpritePackCharacter[] = ${JSON.stringify(packs, null, 2)};
`;
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
