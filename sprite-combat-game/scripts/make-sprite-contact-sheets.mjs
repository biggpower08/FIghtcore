import fs from 'node:fs/promises';
import path from 'node:path';
import { PNG } from 'pngjs';

const repoRoot = process.cwd();
const framesRoot = path.join(repoRoot, 'public', 'sprites', 'frames');
const qaRoot = path.join(repoRoot, 'public', 'sprites', 'qa');

await fs.mkdir(qaRoot, { recursive: true });

const entities = await listDirs(framesRoot);
const indexLinks = [];
const summary = [];

for (const entityId of entities) {
  const entityDir = path.join(framesRoot, entityId);
  const animations = await listDirs(entityDir);
  const rows = [];
  let entityFrameCount = 0;

  for (const animation of animations) {
    const animationDir = path.join(entityDir, animation);
    const frameFiles = (await fs.readdir(animationDir)).filter((file) => file.endsWith('.png')).sort();
    entityFrameCount += frameFiles.length;

    const frameCards = [];
    for (let index = 0; index < frameFiles.length; index += 1) {
      const frameFile = frameFiles[index];
      const framePath = path.join(animationDir, frameFile);
      const png = PNG.sync.read(await fs.readFile(framePath));
      const alpha = alphaStats(png);
      const webPath = `../frames/${entityId}/${animation}/${frameFile}`;
      frameCards.push(`
        <figure class="frame-card ${alpha.hasTransparency ? 'transparent' : 'opaque'}">
          <div class="stage">
            <span class="ground"></span>
            <span class="anchor"></span>
            <img src="${webPath}" alt="${entityId} ${animation} ${frameFile}" />
          </div>
          <figcaption>
            <strong>#${String(index + 1).padStart(2, '0')}</strong>
            <span>${frameFile}</span>
            <span>${png.width}x${png.height}</span>
            <span>${alpha.hasTransparency ? 'alpha' : 'opaque'}</span>
          </figcaption>
        </figure>
      `);
    }

    rows.push(`
      <section class="animation-row">
        <header>
          <h2>${escapeHtml(animation)}</h2>
          <p>${frameFiles.length} frames · source: public/sprites/frames/${escapeHtml(entityId)}/${escapeHtml(animation)}/</p>
        </header>
        <div class="frames">${frameCards.join('\n')}</div>
      </section>
    `);

    summary.push({ entityId, animation, frameCount: frameFiles.length });
  }

  const fileName = `${entityId}.html`;
  const html = pageTemplate(entityId, `${entityFrameCount} runtime frames`, rows.join('\n'));
  await fs.writeFile(path.join(qaRoot, fileName), html);
  indexLinks.push(`<li><a href="./${fileName}">${entityId}</a> <span>${entityFrameCount} frames</span></li>`);
}

await fs.writeFile(
  path.join(qaRoot, 'index.html'),
  pageTemplate('Sprite QA Contact Sheets', 'Runtime frame visual QA', `<ul class="index-list">${indexLinks.join('\n')}</ul>`),
);
await fs.writeFile(path.join(qaRoot, 'contact-sheet-summary.json'), JSON.stringify({ generatedAt: new Date().toISOString(), summary }, null, 2));

console.log('Generated sprite QA contact sheets:');
for (const entityId of entities) {
  console.log(`- public/sprites/qa/${entityId}.html`);
}
console.log('- public/sprites/qa/index.html');

async function listDirs(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  return entries.filter((entry) => entry.isDirectory()).map((entry) => entry.name).sort();
}

function alphaStats(png) {
  let transparent = 0;
  let translucent = 0;
  for (let index = 3; index < png.data.length; index += 4) {
    const alpha = png.data[index];
    if (alpha === 0) transparent += 1;
    else if (alpha < 255) translucent += 1;
  }
  return { hasTransparency: transparent > 0 || translucent > 0, transparent, translucent };
}

function pageTemplate(title, subtitle, body) {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(title)}</title>
  <style>
    :root {
      color-scheme: dark;
      font-family: ui-monospace, SFMono-Regular, Consolas, "Liberation Mono", monospace;
      background: #090d13;
      color: #edf4ff;
    }
    body {
      margin: 0;
      padding: 24px;
      background: #090d13;
    }
    h1, h2, p {
      margin: 0;
    }
    .page-header {
      display: flex;
      justify-content: space-between;
      gap: 20px;
      align-items: end;
      border-bottom: 1px solid #263244;
      padding-bottom: 16px;
      margin-bottom: 22px;
    }
    .page-header h1 {
      color: #35d8ff;
      font-size: 24px;
      text-transform: uppercase;
    }
    .page-header p,
    .animation-row p,
    figcaption {
      color: #9fb1c7;
      font-size: 12px;
    }
    .animation-row {
      margin-bottom: 28px;
    }
    .animation-row header {
      display: flex;
      justify-content: space-between;
      gap: 18px;
      align-items: baseline;
      margin-bottom: 10px;
    }
    .animation-row h2 {
      color: #9eee32;
      font-size: 16px;
      text-transform: uppercase;
    }
    .frames {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
    }
    .frame-card {
      margin: 0;
      width: 132px;
      border: 1px solid #293748;
      background: #111923;
    }
    .stage {
      position: relative;
      height: 132px;
      display: grid;
      place-items: center;
      overflow: hidden;
      background-color: #151b25;
      background-image:
        linear-gradient(45deg, #202a36 25%, transparent 25%),
        linear-gradient(-45deg, #202a36 25%, transparent 25%),
        linear-gradient(45deg, transparent 75%, #202a36 75%),
        linear-gradient(-45deg, transparent 75%, #202a36 75%);
      background-size: 20px 20px;
      background-position: 0 0, 0 10px, 10px -10px, -10px 0;
    }
    .stage img {
      image-rendering: pixelated;
      max-width: 124px;
      max-height: 124px;
    }
    .ground {
      position: absolute;
      left: 0;
      right: 0;
      bottom: 18px;
      border-top: 1px solid rgba(255, 238, 120, 0.78);
    }
    .anchor {
      position: absolute;
      left: 50%;
      bottom: 18px;
      width: 7px;
      height: 7px;
      margin-left: -4px;
      margin-bottom: -4px;
      border-radius: 999px;
      background: #ff4fd8;
      box-shadow: 0 0 0 1px #090d13;
    }
    figcaption {
      display: grid;
      gap: 3px;
      padding: 8px;
    }
    .opaque {
      border-color: #ff795f;
    }
    .index-list {
      display: grid;
      gap: 10px;
      padding: 0;
      list-style: none;
      max-width: 620px;
    }
    .index-list li {
      display: flex;
      justify-content: space-between;
      border: 1px solid #263244;
      padding: 12px;
      background: #111923;
    }
    a {
      color: #35d8ff;
    }
  </style>
</head>
<body>
  <header class="page-header">
    <div>
      <h1>${escapeHtml(title)}</h1>
      <p>${escapeHtml(subtitle)}</p>
    </div>
    <p>checkerboard · ground line · anchor marker · frame order</p>
  </header>
  ${body}
</body>
</html>`;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}
