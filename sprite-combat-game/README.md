# Sprite Combat Game

A browser-only pixel-art MMA / martial arts wave combat MVP. This is intentionally separate from FightScope and runs as a static Vite + TypeScript canvas game.

## Simple Owner Summary

This is the actual browser game folder. Run `npm install` and `npm run dev` here. The game has menus, movement, combat, waves, Cyber Monkey enemies, sprite registry, Sprite Lab, and GitHub Pages deployment.

## AI Handoff Notes

Future agents should read these first:

- `../AI_HANDOFF.md`
- `../OWNER_SUMMARY.md`
- `src/data/spriteRegistry.ts`
- `src/data/spriteAnimations.ts`
- `scripts/clean-sprite-frames.mjs`
- `scripts/make-sprite-contact-sheets.mjs`
- `src/data/moves.ts`
- `src/data/enemies.ts`
- `src/data/waves.ts`
- `src/game/AssetLoader.ts`
- `src/systems/AnimationSystem.ts`
- `src/systems/RenderSystem.ts`

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

## Sprite Cleanup And QA

```bash
npm run sprite:clean
npm run sprite:qa
```

`sprite:clean` rebuilds live frames from `public/sprites/frames-raw-generated-backup/`, removes only edge-connected dark sheet backgrounds, drops disconnected sheet-label components, normalizes runtime canvases, and keeps frame order. The current processed-frame backup is preserved at `public/sprites/frames-broken-render-backup-20260613/`.

`sprite:qa` writes contact sheets to `public/sprites/qa/index.html`. The sheets show checkerboards, frame order, dimensions, alpha status, ground lines, and anchor markers.

## Controls

- Move: `WASD`
- Light strike: `H`
- Heavy strike: `J`
- Style attack: `K`
- Grapple / takedown control: `L`
- Dash: `Space`
- Learned move slots: `N`, `O`, `P`, `M`
- Pause / resume: `Esc`
- Reward screen: click a move card after a wave

## Current MVP Features

- Generated desert arena background with a cleaned gameplay version, procedural fallback, subtle invisible collision props, shadows, and dash dust puffs
- Player movement, facing direction, health, stamina, dash, and cooldown-aware attacks
- Cyber Monkey Grunts and Scrappers as beginning-stage mobs
- Cyber Monkey Alpha boss on wave 4 with higher health and telegraphed strikes
- Rock collision for player and enemies
- Temporary attack hitboxes, hurtboxes, knockback, stun, once-per-attack damage, and close-range grapple control
- Wave spawning and rewards between waves
- Four selectable hero identities: Cyber Ninja, Shadow Striker, Cyber Monk, and Neo Operative
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

Generated source sheets are archived in `public/sprites/source-generated/`. The live gameplay path is the sliced frame folders, so new art can be improved one animation folder at a time.

Effect sprites can be dropped into `public/sprites/effects/`. Desert prop sprites can be dropped into `public/backgrounds/desert/`. The current MVP renders effects and props procedurally when images are missing.

## Sprite Animation Status

The runtime now resolves animations in this order:

1. explicit frame PNGs
2. pre-sliced `/sprites/frames/{entityId}/{animationKey}/0001.png` folders
3. registered source-sheet crop rectangles
4. idle animation
5. procedural fallback

Mapped hero sheet crops:

- `cyber-ninja-blue`: `idle`, `ready`, `walk`, `dash`, `jab`, `cross`, `low_kick`, `roundhouse_kick`, `hit_react`, `knockdown`, `recovery`
- `shadow-striker-purple`: `idle`, `ready`, `walk`, `dash`, `jab`, `cross`, `short_elbow`, `shadow_counter`, `hit_react`, `knockdown`, `recovery`
- `cyber-monk-orange`: `idle`, `ready`, `walk`, `dash`, `palm_strike`, `spinning_kick`, `clinch_knee`, `hip_throw`, `hit_react`, `knockdown`, `recovery`
- `neo-operative-green`: `idle`, `ready`, `walk`, `dash`, `double_leg_takedown`, `sprawl_counter`, `hip_throw`, `low_kick`, `hit_react`, `knockdown`, `recovery`

Runtime frame folders have been generated and transparency-cleaned from the uploaded hero sheets for all four player characters. These are real PNG frames used by the game, but some frames still need manual crop and foot-anchor polish.

Cyber Monkey villains are wired through the same animation state system and now have generated transparency-cleaned runtime frame folders:

- `cyber-monkey-grunt`: `claw_swipe` / `palm_strike`
- `cyber-monkey-scrapper`: `claw_combo` / `low_kick`
- `cyber-monkey-alpha`: `ground_slam` / `clinch_knee`

If a frame folder or background image is missing, the old procedural fallback still renders so the game remains playable.

Open Sprite Lab from the home screen with the `Sprite Lab` button. It lets you choose an entity, animation, or move, replay/step frames, toggle checkerboard, ground line, anchor, hitbox, and hurtbox overlays, and inspect frame source, dimensions, alpha transparency, and fallback status.

To tune crop rectangles, edit `src/data/spriteAnimations.ts`. Crop mappings are intentionally approximate for this pass and can be replaced by exact transparent frame PNGs later.

## GitHub Pages

1. Run `npm run build`.
2. Publish the generated `dist/` directory.
3. The Vite config uses `base: './'` so the game can work from a project page subpath.

## What To Build Next

- Polish sprite crops, ground contact, and animation timing for the generated frame folders
- Add more enemy types and stage hazards
- Combo rules and defensive counters
- Persistent progression between sessions
