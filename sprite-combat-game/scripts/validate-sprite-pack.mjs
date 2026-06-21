import { readdir, readFile, stat } from 'node:fs/promises';
import path from 'node:path';

const root = path.resolve('public/sprite-packs');

const requiredCharacterFields = ['id', 'style', 'enabled', 'animations'];

async function main() {
  const packs = await findPacks();
  const results = [];
  let failed = false;
  for (const packDir of packs) {
    const result = await validatePack(packDir);
    results.push(result);
    if (!result.ok) failed = true;
  }
  console.log(JSON.stringify({ root, packCount: packs.length, results }, null, 2));
  if (failed) process.exitCode = 1;
}

async function findPacks() {
  try {
    const entries = await readdir(root, { withFileTypes: true });
    return entries.filter((entry) => entry.isDirectory()).map((entry) => path.join(root, entry.name));
  } catch {
    return [];
  }
}

async function validatePack(packDir) {
  const manifestPath = path.join(packDir, 'character.json');
  const errors = [];
  const warnings = [];
  let manifest;
  try {
    manifest = JSON.parse(await readFile(manifestPath, 'utf8'));
  } catch (error) {
    return { packDir, ok: false, errors: [`Missing or invalid character.json: ${error.message}`] };
  }

  for (const field of requiredCharacterFields) {
    if (manifest[field] === undefined) errors.push(`Missing required field: ${field}`);
  }
  if (!manifest.name && !manifest.displayName) errors.push('Missing required field: name or displayName');
  if (!['pixel-art', 'semi-realistic'].includes(manifest.style)) errors.push('style must be pixel-art or semi-realistic');
  const animationEntries = Array.isArray(manifest.animations)
    ? manifest.animations.map((animation) => [animation.id, animation])
    : Object.entries(manifest.animations ?? {});
  if (animationEntries.length === 0) errors.push('animations must be a non-empty object or array');

  for (const [animationId, animation] of animationEntries) {
    if (!animationId) errors.push('animation missing id');
    const frames = animation.frames ?? animation.frameCount;
    if (!Number.isFinite(frames) || frames <= 0) errors.push(`${animationId ?? 'animation'} has invalid frames/frameCount`);
    if (!animation.file) {
      errors.push(`${animationId ?? 'animation'} missing file`);
      continue;
    }
    const sourceImage = path.resolve(packDir, animation.file);
    if (!(await exists(sourceImage))) {
      const message = `${animationId ?? 'animation'} missing source image: ${animation.file}`;
      if (manifest.enabled === false) warnings.push(`${message} (allowed because pack is disabled)`);
      else errors.push(message);
    }
  }

  return {
    packDir,
    id: manifest.id,
    enabled: Boolean(manifest.enabled),
    ok: errors.length === 0,
    errors,
    warnings,
  };
}

async function exists(filePath) {
  try {
    await stat(filePath);
    return true;
  } catch {
    return false;
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
