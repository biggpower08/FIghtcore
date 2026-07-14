import { createHash } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import { copyFile, mkdir, readdir, rm, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { deflateRawSync } from 'node:zlib';

const projectRoot = process.cwd();
const distRoot = path.join(projectRoot, 'dist');
const itchRoot = path.join(projectRoot, 'dist-itch');
const zipPath = path.join(projectRoot, 'fightcore-itch-build.zip');
const maxItchFiles = 999;

const requiredPaths = [
  'index.html',
  'assets/fightcore/backgrounds/desert-arena',
  'assets/fightcore/sprites/monkey-grunt',
  'assets/fightcore/sprites/striker-monkey',
  'sprites/frames-pack/ronin',
  'sprites/frames-pack/supreme-emperor',
  'sprites/frames/striker-monkey/idle',
  'sprites/frames-semi-realistic/ronin/idle/0001.png',
  'sprites/frames-semi-realistic/supreme-emperor/idle/0001.png',
  'ui/upgrade-icons',
];

const excludedDistPathFragments = [
  '/assets/fightcore/asset-prep-report.json',
  '/assets/fightcore/sprites/qa/',
  '/assets/fightcore/sprites/source-generated/',
  '/assets/fightcore/sprites-fightcore/',
  '/assets/fightcore/raw/',
  '/assets/fightcore/source/',
  '/sprites/qa/',
  '/sprites/source-generated/',
  '/sprites/semi-realistic-source/',
  '/sprites/strips-semi-realistic/',
  '/sprites/frames-broken-render-backup',
  '/sprites/frames-raw-generated-backup/',
  '/sprite-packs/',
  '/backgrounds/desert/',
];

const crcTable = new Uint32Array(256);
for (let n = 0; n < 256; n += 1) {
  let c = n;
  for (let k = 0; k < 8; k += 1) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  crcTable[n] = c >>> 0;
}

async function main() {
  assertBuiltDist();
  await rm(itchRoot, { recursive: true, force: true });
  await rm(zipPath, { force: true });
  await mkdir(itchRoot, { recursive: true });

  await copyBuiltChunks();
  for (const relativePath of requiredPaths) {
    await copyAllowlistedPath(relativePath);
  }
  await copySingleFile(
    path.join(distRoot, 'ui/upgrade-icons/impact-star.png'),
    path.join(itchRoot, 'favicon.ico'),
  );

  const files = await listFiles(itchRoot);
  const manifest = buildManifest(files);
  await writeFile(path.join(itchRoot, 'itch-build-manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`);
  const finalFiles = await listFiles(itchRoot);
  await writeZip(itchRoot, zipPath, finalFiles);
  const zipEntries = readZipEntryCount(zipPath);

  if (!finalFiles.some((file) => toZipPath(path.relative(itchRoot, file)) === 'index.html')) {
    throw new Error('Lean itch package is missing index.html at the root.');
  }
  if (zipEntries >= 1000) {
    throw new Error(`Lean itch zip still has too many files: ${zipEntries} >= 1000.`);
  }

  console.log(`dist-itch files: ${finalFiles.length}`);
  console.log(`zip entries: ${zipEntries}`);
  console.log(`zip path: ${zipPath}`);
}

function assertBuiltDist() {
  if (!existsSync(path.join(distRoot, 'index.html'))) {
    throw new Error('dist/index.html is missing. Run npm run build before packaging itch.');
  }
}

async function copyAllowlistedPath(relativePath) {
  const from = path.join(distRoot, relativePath);
  if (!existsSync(from)) throw new Error(`Required build asset is missing: dist/${relativePath}`);
  const stats = await stat(from);
  if (stats.isDirectory()) {
    await copyDirectory(from, path.join(itchRoot, relativePath));
    return;
  }
  await copySingleFile(from, path.join(itchRoot, relativePath));
}

async function copyBuiltChunks() {
  const assetsRoot = path.join(distRoot, 'assets');
  const entries = await readdir(assetsRoot, { withFileTypes: true });
  for (const entry of entries) {
    if (!/\.(js|css|map)$/.test(entry.name)) continue;
    const source = path.join(assetsRoot, entry.name);
    if (!(await stat(source)).isFile()) continue;
    await copySingleFile(source, path.join(itchRoot, 'assets', entry.name));
  }
}

async function copyDirectory(from, to) {
  await mkdir(to, { recursive: true });
  const entries = await readdir(from, { withFileTypes: true });
  for (const entry of entries) {
    const source = path.join(from, entry.name);
    const destination = path.join(to, entry.name);
    const distRelative = toZipPath(path.relative(distRoot, source));
    if (shouldExclude(distRelative)) continue;
    if (entry.isDirectory()) await copyDirectory(source, destination);
    else if (entry.isFile()) await copySingleFile(source, destination);
  }
}

async function copySingleFile(from, to) {
  if (path.basename(from) === '.gitkeep') return;
  await mkdir(path.dirname(to), { recursive: true });
  await copyFile(from, to);
}

function shouldExclude(distRelative) {
  const normalized = `/${distRelative}`;
  return excludedDistPathFragments.some((fragment) => normalized.includes(fragment));
}

async function listFiles(root) {
  const result = [];
  await walk(root, result);
  return result.sort((a, b) => toZipPath(path.relative(root, a)).localeCompare(toZipPath(path.relative(root, b))));
}

async function walk(current, result) {
  const entries = await readdir(current, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(current, entry.name);
    if (entry.isDirectory()) await walk(fullPath, result);
    else if (entry.isFile()) result.push(fullPath);
  }
}

function buildManifest(files) {
  const entries = files.map((file) => ({
    path: toZipPath(path.relative(itchRoot, file)),
    sha256: createHash('sha256').update(readFileSync(file)).digest('hex'),
  }));
  return {
    purpose: 'Lean itch.io runtime package for the Ronin/Supreme Emperor MVP.',
    excluded: [
      'QA/contact sheets',
      'raw/source sprite sheets',
      'legacy non-MVP character assets',
      'backup frame folders',
      'sprite factory inputs and scripts',
      'developer docs and tools',
    ],
    fileCountBeforeManifest: files.length,
    entries,
  };
}

async function writeZip(root, destination, files) {
  const localParts = [];
  const centralParts = [];
  let offset = 0;

  for (const file of files) {
    const relative = toZipPath(path.relative(root, file));
    const name = Buffer.from(relative, 'utf8');
    const data = readFileSync(file);
    const compressed = deflateRawSync(data, { level: 9 });
    const crc = crc32(data);
    const localHeader = Buffer.alloc(30);
    localHeader.writeUInt32LE(0x04034b50, 0);
    localHeader.writeUInt16LE(20, 4);
    localHeader.writeUInt16LE(0x0800, 6);
    localHeader.writeUInt16LE(8, 8);
    localHeader.writeUInt16LE(0, 10);
    localHeader.writeUInt16LE(0, 12);
    localHeader.writeUInt32LE(crc, 14);
    localHeader.writeUInt32LE(compressed.length, 18);
    localHeader.writeUInt32LE(data.length, 22);
    localHeader.writeUInt16LE(name.length, 26);
    localHeader.writeUInt16LE(0, 28);
    localParts.push(localHeader, name, compressed);

    const centralHeader = Buffer.alloc(46);
    centralHeader.writeUInt32LE(0x02014b50, 0);
    centralHeader.writeUInt16LE(20, 4);
    centralHeader.writeUInt16LE(20, 6);
    centralHeader.writeUInt16LE(0x0800, 8);
    centralHeader.writeUInt16LE(8, 10);
    centralHeader.writeUInt16LE(0, 12);
    centralHeader.writeUInt16LE(0, 14);
    centralHeader.writeUInt32LE(crc, 16);
    centralHeader.writeUInt32LE(compressed.length, 20);
    centralHeader.writeUInt32LE(data.length, 24);
    centralHeader.writeUInt16LE(name.length, 28);
    centralHeader.writeUInt16LE(0, 30);
    centralHeader.writeUInt16LE(0, 32);
    centralHeader.writeUInt16LE(0, 34);
    centralHeader.writeUInt16LE(0, 36);
    centralHeader.writeUInt32LE(0, 38);
    centralHeader.writeUInt32LE(offset, 42);
    centralParts.push(centralHeader, name);
    offset += localHeader.length + name.length + compressed.length;
  }

  const centralDirectory = Buffer.concat(centralParts);
  const end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50, 0);
  end.writeUInt16LE(0, 4);
  end.writeUInt16LE(0, 6);
  end.writeUInt16LE(files.length, 8);
  end.writeUInt16LE(files.length, 10);
  end.writeUInt32LE(centralDirectory.length, 12);
  end.writeUInt32LE(offset, 16);
  end.writeUInt16LE(0, 20);

  await writeFile(destination, Buffer.concat([...localParts, centralDirectory, end]));
}

function readZipEntryCount(file) {
  const buffer = existsSync(file) ? requireBuffer(file) : Buffer.alloc(0);
  for (let i = buffer.length - 22; i >= 0; i -= 1) {
    if (buffer.readUInt32LE(i) === 0x06054b50) return buffer.readUInt16LE(i + 10);
  }
  throw new Error('Unable to verify zip entry count.');
}

function requireBuffer(file) {
  return readFileSync(file);
}

function crc32(data) {
  let crc = 0xffffffff;
  for (const byte of data) crc = crcTable[(crc ^ byte) & 0xff] ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
}

function toZipPath(value) {
  return value.split(path.sep).join('/');
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
