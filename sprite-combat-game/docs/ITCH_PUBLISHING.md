# Itch.io Publishing Notes

## Build

Run from the game folder:

```powershell
cd C:\dev\FIghtcore-codex-work\sprite-combat-game
npm.cmd install
npm.cmd run build
```

The playable static build is written to `dist`.

## Package For Itch.io

Zip the contents of `sprite-combat-game\dist`, not the `dist` folder wrapper, so `index.html` is at the root of the zip.

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
