import { readdir, readFile, stat } from 'node:fs/promises';
import path from 'node:path';

const root = path.resolve('public/sprite-packs');

const requiredCharacterFields = ['id', 'displayName', 'style', 'enabled', 'animations'];

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
  let manifest;
  try {
    manifest = JSON.parse(await readFile(manifestPath, 'utf8'));
  } catch (error) {
    return { packDir, ok: false, errors: [`Missing or invalid character.json: ${error.message}`] };
  }

  for (const field of requiredCharacterFields) {
    if (manifest[field] === undefined) errors.push(`Missing required field: ${field}`);
  }
  if (!['pixel-art', 'semi-realistic'].includes(manifest.style)) errors.push('style must be pixel-art or semi-realistic');
  if (!Array.isArray(manifest.animations) || manifest.animations.length === 0) errors.push('animations must be a non-empty array');

  for (const animation of manifest.animations ?? []) {
    if (!animation.id) errors.push('animation missing id');
    if (!Number.isFinite(animation.frameCount) || animation.frameCount <= 0) errors.push(`${animation.id ?? 'animation'} has invalid frameCount`);
    const animationDir = path.join(packDir, 'animations', animation.id ?? '');
    if (!(await exists(animationDir))) errors.push(`${animation.id ?? 'animation'} missing animations/${animation.id} folder`);
  }

  return {
    packDir,
    id: manifest.id,
    enabled: Boolean(manifest.enabled),
    ok: errors.length === 0,
    errors,
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
