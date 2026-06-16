# FIghtcore Browser Game

FIghtcore is a static Vite + TypeScript canvas game. It is browser-only and intentionally separate from FightScope.

## Simple Owner Summary

This folder contains the playable FIghtcore MVP. Current work is focused on polish and stability: controls clarity, combat feedback, sprite playback, Sprite Lab usability, wave pacing, and accurate documentation.

## Run Locally

```powershell
npm install
npm run dev
```

Open the local URL Vite prints in the terminal.

## Build

```powershell
npm run build
```

The static build is written to `dist/` for GitHub Pages.

## Controls

- Move: `WASD`
- Dash: `Space`
- Equipped move slots: `H`, `J`, `K`, `L`
- Pause / resume: `Esc`
- Reward screen: choose a compatible move, then choose which H/J/K/L slot it replaces

The HUD always shows the current move name for each H/J/K/L slot.

## Current Fighter Move Slots

- Cyber Ninja: `H` Jab, `J` Slice, `K` Side Kick, `L` High Kick
- Shadow Striker: `H` Roundhouse Kick, `J` Teep Kick, `K` Cross, `L` Jab
- Puppetmaster: `H` Double Leg Shot, `J` O Goshi, `K` Armbar, `L` Duck Under Mat Return Slam
- Combat Monk: `H` Palm Strike, `J` High Kick, `K` Spinning Sweep, `L` Standing Shoulder Lock

## Current MVP Features

- Generated desert arena background with procedural fallback
- Selectable fighters: Cyber Ninja, Shadow Striker, Puppetmaster, and Combat Monk
- Cyber Monkey enemies, including Scrapper and Grappler variants
- H/J/K/L equipped moves with cooldowns and stamina costs
- Grapples that require nearby targets and preserve embedded-target sprite suppression
- Rewards between waves that replace one equipped slot
- Sprite Lab for inspecting entities, animations, moves, frame sources, and fallback status
- GitHub Pages deployment

Boss waves are disabled during the MVP polish pass so normal wave readability can be stabilized first.

## Sprite And QA Commands

```powershell
npm run sprite:clean
npm run sprite:qa
```

`sprite:qa` writes contact sheets to `public/sprites/qa/index.html`. The current FIghtcore prepared assets live under `public/assets/fightcore/sprites/`.

Runtime animation resolution order:

1. explicit PNG frame folders
2. prepared FIghtcore strip crops
3. registered source-sheet crop rectangles
4. idle fallback
5. procedural fallback

Sprite Lab should not treat a whole strip/contact sheet as a gameplay frame. Missing or invalid frame data should show clear fallback/debug information instead of crashing.

## Known Issues

- Some sprite anchors and attack frames still need visual polish.
- Sprite Lab is still a developer-facing tool.
- Audio, save data, shops, long-term progression, new stages, and new content are intentionally paused.
- Bosses are disabled until the core wave/combat loop feels stable.

## Current Development Focus

- Make controls and current move labels consistent everywhere.
- Improve hit flashes, damage/healing feedback, impact sparks, and attack readability.
- Keep grappling display stable while preserving embedded-target suppression.
- Slow enemy pacing so encounters breathe.
- Keep the MVP browser-only and GitHub Pages-friendly.
