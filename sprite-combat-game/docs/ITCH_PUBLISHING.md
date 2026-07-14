# Itch.io Publishing Notes

## Build

Run from the game folder:

```powershell
cd C:\Users\trish\OneDrive\Documents\FIGHTCORE\sprite-combat-game
npm.cmd install
npm.cmd run build:itch
```

The normal Vite build is written to `dist`. The itch-ready build is written to `dist-itch`, and the upload zip is written to `fightcore-itch-build.zip`.

## Package For Itch.io

Use `npm.cmd run build:itch`; do not manually zip the full `dist` folder. Vite copies every public asset into `dist`, including source sheets, QA reports, backup frame folders, Sprite Lab outputs, and legacy characters. That full build can exceed itch.io's 1,000-file zip limit.

The lean itch packager copies only the current MVP runtime assets:

- built JS/CSS chunks
- `index.html`
- Ronin and Supreme Emperor runtime frame-pack PNGs
- Cyber Monkey and Cyber Striker atlas assets
- desert arena background/prop assets
- upgrade UI icons

The packager excludes source/generated sheets, QA/contact sheets, backup frame folders, Sprite Lab bulk outputs, non-MVP character folders, docs, tools, and repair scripts. It verifies that `index.html` is at the zip root and fails if the zip has 1,000 or more entries.

To rebuild only the lean package from an existing `dist`:

```powershell
npm.cmd run check:itch
```

Upload the zip as an HTML/browser game on itch.io. Enable iframe play, then test both embedded and fullscreen modes.

Keep GitHub Pages as the public demo mirror.

## Page Draft

FIghtcore is a browser-based pixel-art martial arts survival game. Pick Ronin or Supreme Emperor, survive waves of Cyber Monkey and Cyber Striker enemies, and choose simple upgrades between waves.

Controls:

- `WASD` move
- `Space` dash
- `H`, `J`, `K` attacks
- `Esc` pause

Current MVP note: this is a focused vertical slice with two playable fighters, two enemy types, one arena, and a small upgrade loop. More characters and polish are intentionally held back until the core combat is stable.

Recommended browser: current Chrome, Edge, or Firefox on desktop.
