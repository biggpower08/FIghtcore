# Sprite Combat Game

A browser-only pixel-art MMA / martial arts wave combat MVP. This is intentionally separate from FightScope and runs as a static Vite + TypeScript canvas game.

## Run Locally

```bash
npm install
npm run dev
```

Open the local URL Vite prints in your terminal.

## Build

```bash
npm run build
```

The static build is written to `dist/` and can be deployed to GitHub Pages.

## Controls

- Move: `WASD` or arrow keys
- Light strike: `J`
- Heavy strike: `K`
- Grapple / throw: `L`
- Dash: `Space`
- Learned move slots: `1`, `2`, `3`, `4`
- Pause / resume: `Esc`
- Reward screen: click a move card after a wave

## Current MVP Features

- Desert arena with sandy ground, boundary edges, rocks, dead bushes, shadows, and dash dust puffs
- Player movement, facing direction, health, stamina, dash, and cooldown-aware attacks
- Cyber Monkey Grunts and Scrappers as beginning-stage mobs
- Cyber Monkey Alpha boss on wave 4 with higher health and telegraphed strikes
- Rock collision for player and enemies
- Temporary attack hitboxes, hurtboxes, knockback, stun, and once-per-attack damage
- Wave spawning and rewards between waves
- Four character identities in data, with Cyber Ninja playable first
- Home screen, pause menu, game-over menu, controls panel, and placeholder settings panel

## Sprite Frame Pipeline

The code is ready for drop-in transparent sprite frames at:

```text
public/sprites/frames/{character}/{move}/{frameNumber}.png
```

Example:

```text
public/sprites/frames/cyber-ninja-blue/jab/0001.png
```

Registered beginning-stage hero IDs:

- `cyber-ninja-blue`
- `shadow-striker-purple`
- `cyber-monk-orange`
- `neo-operative-green`

Registered beginning-stage villain IDs:

- `cyber-monkey-grunt`
- `cyber-monkey-scrapper`
- `cyber-monkey-alpha`

`AssetLoader` caches image paths and returns loaded frame arrays. The renderer tries real frames first and falls back to readable procedural silhouettes when animation folders are missing.

Effect sprites can be dropped into `public/sprites/effects/`. Desert prop sprites can be dropped into `public/backgrounds/desert/`. The current MVP renders both procedurally when images are missing.

## GitHub Pages

1. Run `npm run build`.
2. Publish the generated `dist/` directory.
3. The Vite config uses `base: './'` so the game can work from a project page subpath.

## What To Build Next

- Character select
- Real transparent sprite frame loading per move
- More enemy types and stage hazards
- Combo rules and defensive counters
- Persistent progression between sessions
