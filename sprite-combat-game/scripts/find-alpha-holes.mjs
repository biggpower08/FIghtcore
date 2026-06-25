import fs from 'node:fs/promises';
import path from 'node:path';
import { PNG } from 'pngjs';

const repoRoot = process.cwd();
const args = parseArgs(process.argv.slice(2));

if (!args.target || args.target === '.') {
  fail('Missing --target <folder>. Refusing broad alpha-hole scan.');
}

const targetDir = path.resolve(repoRoot, args.target);
if (!isInside(repoRoot, targetDir)) fail(`Target must stay inside this repo: ${args.target}`);

const alphaThreshold = Number(args['alpha-threshold'] ?? 8);
const minHoleArea = Number(args['min-hole-area'] ?? 2);
if (!Number.isFinite(alphaThreshold) || alphaThreshold < 0 || alphaThreshold > 255) fail('--alpha-threshold must be 0-255.');
if (!Number.isFinite(minHoleArea) || minHoleArea < 1) fail('--min-hole-area must be 1 or greater.');

const allowlist = args.allowlist ? await readAllowlist(args.allowlist) : { files: [] };

if (args['write-allowlist-template']) {
  const templatePath = path.join(repoRoot, 'config', 'sprite-alpha-hole-allowlist.template.json');
  if (!isInside(repoRoot, templatePath)) fail(`Allowlist template path must stay inside this repo: ${args['write-allowlist-template']}`);
  await fs.mkdir(path.dirname(templatePath), { recursive: true });
  await fs.writeFile(templatePath, `${JSON.stringify({ files: [] }, null, 2)}\n`, { flag: 'wx' });
  console.log(`Wrote allowlist template: ${path.relative(repoRoot, templatePath)}`);
}

const files = await listPngs(targetDir);
if (files.length === 0) fail(`No PNG files found in ${path.relative(repoRoot, targetDir)}.`);

const results = [];
for (const filePath of files) {
  const png = PNG.sync.read(await fs.readFile(filePath));
  const holes = findInternalAlphaHoles(png).filter((hole) => hole.area >= minHoleArea);
  const allowed = holes.filter((hole) => isAllowlisted(filePath, hole, allowlist));
  const active = holes.filter((hole) => !isAllowlisted(filePath, hole, allowlist));
  const result = {
    file: normalizePath(path.relative(repoRoot, filePath)),
    candidateAlphaHoles: active.length,
    ignoredAlphaHoles: allowed.length,
    allowlisted: allowed.length > 0 || Boolean(findAllowlistEntry(filePath, allowlist)),
    holes: active.map(publicHole),
    ignoredHoles: allowed.map(publicHole),
  };
  results.push(result);
  const sizes = active.map((hole) => `${hole.area}px @ ${hole.minX},${hole.minY} ${hole.width}x${hole.height}`).join('; ');
  const ignored = allowed.length ? `, ignored ${allowed.length} allowlisted` : '';
  console.log(`${result.file}: ${active.length ? `${active.length} candidate(s): ${sizes}` : 'no candidates'}${ignored}`);
}

const report = {
  generatedAt: new Date().toISOString(),
  target: normalizePath(path.relative(repoRoot, targetDir)),
  alphaThreshold,
  minHoleArea,
  allowlist: args.allowlist ? normalizePath(args.allowlist) : undefined,
  filesScanned: results.length,
  filesWithCandidates: results.filter((result) => result.candidateAlphaHoles > 0).length,
  candidateAlphaHoles: results.reduce((total, result) => total + result.candidateAlphaHoles, 0),
  ignoredAlphaHoles: results.reduce((total, result) => total + result.ignoredAlphaHoles, 0),
  files: results,
};

if (args.report) {
  const reportPath = path.join(repoRoot, 'public', 'sprites', 'qa', `${slug(report.target)}-alpha-hole-finder-report.json`);
  await fs.mkdir(path.dirname(reportPath), { recursive: true });
  await fs.writeFile(reportPath, `${JSON.stringify(report, null, 2)}\n`);
  console.log(`Report: ${path.relative(repoRoot, reportPath)}`);
}

if (report.candidateAlphaHoles > 0) process.exitCode = 1;

function findInternalAlphaHoles(png) {
  const outside = markOutsideTransparency(png);
  const visited = new Uint8Array(png.width * png.height);
  const holes = [];
  for (let y = 0; y < png.height; y += 1) {
    for (let x = 0; x < png.width; x += 1) {
      const pixel = y * png.width + x;
      if (visited[pixel] || outside[pixel] || isOpaque(png, x, y)) continue;
      const component = floodTransparentComponent(png, x, y, visited, outside);
      if (!component) continue;
      const confidence = estimateHoleConfidence(png, component);
      if (confidence < 0.42) continue;
      holes.push({ ...component, confidence: Number(confidence.toFixed(2)) });
    }
  }
  return holes;
}

function markOutsideTransparency(png) {
  const outside = new Uint8Array(png.width * png.height);
  const queue = [];
  for (let x = 0; x < png.width; x += 1) queue.push([x, 0], [x, png.height - 1]);
  for (let y = 1; y < png.height - 1; y += 1) queue.push([0, y], [png.width - 1, y]);
  while (queue.length > 0) {
    const [x, y] = queue.pop();
    if (x < 0 || y < 0 || x >= png.width || y >= png.height) continue;
    const pixel = y * png.width + x;
    if (outside[pixel] || isOpaque(png, x, y)) continue;
    outside[pixel] = 1;
    queue.push([x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]);
  }
  return outside;
}

function floodTransparentComponent(png, startX, startY, visited, outside) {
  const queue = [[startX, startY]];
  let area = 0;
  let minX = startX;
  let minY = startY;
  let maxX = startX;
  let maxY = startY;
  while (queue.length > 0) {
    const [x, y] = queue.pop();
    if (x < 0 || y < 0 || x >= png.width || y >= png.height) continue;
    const pixel = y * png.width + x;
    if (visited[pixel] || outside[pixel] || isOpaque(png, x, y)) continue;
    visited[pixel] = 1;
    area += 1;
    minX = Math.min(minX, x);
    minY = Math.min(minY, y);
    maxX = Math.max(maxX, x);
    maxY = Math.max(maxY, y);
    queue.push([x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]);
  }
  if (area === 0) return null;
  return { area, minX, minY, maxX, maxY, width: maxX - minX + 1, height: maxY - minY + 1 };
}

function estimateHoleConfidence(png, hole) {
  let opaqueNeighbors = 0;
  let checkedNeighbors = 0;
  for (let y = hole.minY - 1; y <= hole.maxY + 1; y += 1) {
    for (let x = hole.minX - 1; x <= hole.maxX + 1; x += 1) {
      if (x < 0 || y < 0 || x >= png.width || y >= png.height) continue;
      if (x >= hole.minX && x <= hole.maxX && y >= hole.minY && y <= hole.maxY) continue;
      checkedNeighbors += 1;
      if (isOpaque(png, x, y)) opaqueNeighbors += 1;
    }
  }
  return opaqueNeighbors / Math.max(1, checkedNeighbors);
}

function isOpaque(png, x, y) {
  return png.data[(y * png.width + x) * 4 + 3] > alphaThreshold;
}

async function listPngs(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  return entries
    .filter((entry) => entry.isFile() && entry.name.toLowerCase().endsWith('.png'))
    .map((entry) => path.join(dir, entry.name))
    .sort((a, b) => a.localeCompare(b));
}

async function readAllowlist(filePath) {
  const absolute = path.resolve(repoRoot, filePath);
  if (!isInside(repoRoot, absolute)) fail(`Allowlist must stay inside this repo: ${filePath}`);
  const parsed = JSON.parse(await fs.readFile(absolute, 'utf8'));
  return { files: Array.isArray(parsed.files) ? parsed.files : [] };
}

function isAllowlisted(filePath, hole, allowlist) {
  const entry = findAllowlistEntry(filePath, allowlist);
  if (!entry) return false;
  if (!Array.isArray(entry.holes) || entry.holes.length === 0) return true;
  return entry.holes.some((allowed) => holeMatches(hole, allowed));
}

function findAllowlistEntry(filePath, allowlist) {
  const relative = normalizePath(path.relative(repoRoot, filePath));
  return allowlist.files.find((entry) => normalizePath(entry.path) === relative);
}

function holeMatches(actual, expected) {
  return (
    actual.area === expected.area &&
    actual.minX === expected.bbox?.x &&
    actual.minY === expected.bbox?.y &&
    actual.width === expected.bbox?.w &&
    actual.height === expected.bbox?.h
  );
}

function publicHole(hole) {
  return {
    area: hole.area,
    bbox: { x: hole.minX, y: hole.minY, w: hole.width, h: hole.height },
    confidence: hole.confidence,
  };
}

function parseArgs(argv) {
  const parsed = {};
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (!arg.startsWith('--')) fail(`Unexpected argument: ${arg}`);
    const key = arg.slice(2);
    if (['report', 'write-allowlist-template'].includes(key)) {
      parsed[key] = true;
    } else {
      const value = argv[index + 1];
      if (!value || value.startsWith('--')) fail(`Missing value for --${key}`);
      parsed[key] = value;
      index += 1;
    }
  }
  return parsed;
}

function isInside(parent, child) {
  const relative = path.relative(parent, child);
  return relative === '' || (!relative.startsWith('..') && !path.isAbsolute(relative));
}

function normalizePath(value = '') {
  return value.replaceAll('\\', '/');
}

function slug(value) {
  return value.replace(/[^a-z0-9]+/giu, '-').replace(/^-|-$/gu, '').toLowerCase() || 'target';
}

function fail(message) {
  console.error(message);
  process.exit(1);
}
