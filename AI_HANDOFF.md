# AI Handoff - FIghtcore

## Simple Owner Summary

FIghtcore contains a standalone browser game in `sprite-combat-game/`. It is a cyberpunk martial arts / MMA-inspired wave fighter where Cyber Ninja fights Cyber Monkey enemies in a desert arena. The game runs fully in the browser and deploys to GitHub Pages.

## Current Project Status

The MVP is playable. It has a home screen, settings placeholder, controls screen, pause, game over, reward flow, generated desert arena, movement, dash, stamina, health, hitboxes, enemy waves, boss wave, selectable heroes, sprite registry, generated source sheets, cleaned runtime frame folders, animation mappings, fallback rendering, Sprite Lab, and sprite contact-sheet QA.

## What This Repo Is

This repo is currently the home for the browser-only FIghtcore sprite combat game.

## What This Repo Is Not

This is not FightScope. FightScope is an MMA analytics app and should not be turned into this game. Do not add game routes, health bars, mobs, controls, or sprite combat systems into FightScope.

## Current Folder Structure

```text
.
  .github/workflows/static.yml
  AGENTS.md
  AI_HANDOFF.md
  OWNER_SUMMARY.md
  README.md
  sprite-combat-game/
    index.html
    package.json
    public/
    src/
```

## Current Gameplay Systems

- Canvas game loop in `src/game/Game.ts`
- Input handling in `src/game/InputManager.ts`
- Player/enemy/boss entities in `src/entities/`
- Movement, collision, combat, animation, waves, loot, progression, and rendering in `src/systems/`
- HUD, reward screen, menu screen, and Sprite Lab in `src/ui/`

## Current Sprite System

Read these files first:

- `sprite-combat-game/src/data/spriteRegistry.ts`
- `sprite-combat-game/src/data/spriteAnimations.ts`
- `sprite-combat-game/src/game/AssetLoader.ts`
- `sprite-combat-game/src/systems/AnimationSystem.ts`
- `sprite-combat-game/src/systems/RenderSystem.ts`

The sprite system supports source sheets, sheet crop rectangles, pre-sliced frame folders, cleaned normalized PNG frames, and procedural fallback rendering. Do not remove fallback rendering.

Sprite cleanup and QA scripts:

- `sprite-combat-game/scripts/clean-sprite-frames.mjs`
- `sprite-combat-game/scripts/make-sprite-contact-sheets.mjs`
- `npm run sprite:clean`
- `npm run sprite:qa`

Raw generated frames are backed up in `sprite-combat-game/public/sprites/frames-raw-generated-backup/`. QA contact sheets are written to `sprite-combat-game/public/sprites/qa/index.html`.

## Current Enemy System

The current villain family is Cyber Monkeys:

- `cyber-monkey-grunt`
- `cyber-monkey-scrapper`
- `cyber-monkey-alpha`

Wave 4 uses Cyber Monkey Alpha as the boss.

## Current Controls

- Move: `WASD` or arrow keys
- Light strike: `J`
- Heavy strike: `K`
- Grapple / throw placeholder: `L`
- Dash: `Space`
- Move slots: `1`, `2`, `3`, `4`
- Pause / resume: `Esc`

## Current Deployment Setup

GitHub Actions workflow:

```text
.github/workflows/static.yml
```

It builds `sprite-combat-game/` and deploys `sprite-combat-game/dist` to GitHub Pages.

Expected URL:

```text
https://biggpower08.github.io/FIghtcore/
```

## Current Known Commits / Milestones

- `4e32fad Wire sprite animations to combat moves`: completed animation mapping layer, Sprite Lab, Cyber Ninja sheet-crop mappings, Cyber Monkey fallback animation mappings, and sprite coverage report.
- `bca4f75 Integrate generated sprites and desert background`: added generated hero, Cyber Monkey, and desert arena assets.
- Current polish pass: cleans runtime frame transparency/canvases, adds contact-sheet QA, and improves Sprite Lab art-debug overlays.

## Current Build Commands

```powershell
cd sprite-combat-game
npm install
npm run sprite:clean
npm run sprite:qa
npm run build
```

## How To Run Locally

```powershell
cd sprite-combat-game
npm install
npm run dev
```

## How To Deploy

Push to `main`. GitHub Actions deploys the Pages build.

```powershell
git status
git add .
git commit -m "Describe the change"
git push origin main
```

## Important Guardrails For Future Agents

- Do not redo the completed sprite animation wiring or generated asset integration.
- Do not remove fallback rendering.
- Do not break GitHub Pages.
- Do not add backend dependencies.
- Do not add API keys.
- Do not make this part of FightScope.
- Do not treat FightScope as a game.
- Keep this game browser-only.
- Keep owner-facing summaries plain-English.

## Do Not Redo

Do not recreate `spriteAnimations.ts`, Sprite Lab, `printSpriteCoverageReport()`, the Cyber Ninja/Cyber Monkey animation wiring, or the generated frame folders unless the task is specifically to improve or tune them.

## Next Good Tasks

- Manually polish cleaned sprite crops and foot anchors using Sprite Lab and QA contact sheets.
- Add impact effects, move icons, and richer animation timing.
- Add local rule-based AI coach after docs are stable.
- Add more stages, enemy types, and audio.

## Open Questions

- Which Cyber Monkey art direction should be final?
- Should character select come before or after more enemy variety?
- Should progression persist in browser storage?
- Should a future AI coach remain local-rule only or use a backend proxy later?

## Files Future Agents Should Read First

1. `OWNER_SUMMARY.md`
2. `AI_HANDOFF.md`
3. `sprite-combat-game/README.md`
4. `sprite-combat-game/src/game/Game.ts`
5. `sprite-combat-game/src/data/spriteRegistry.ts`
6. `sprite-combat-game/src/data/spriteAnimations.ts`
7. `sprite-combat-game/src/data/moves.ts`
8. `sprite-combat-game/src/data/enemies.ts`
9. `sprite-combat-game/src/data/waves.ts`
10. `sprite-combat-game/src/game/AssetLoader.ts`
11. `sprite-combat-game/src/systems/AnimationSystem.ts`
12. `sprite-combat-game/src/systems/RenderSystem.ts`

## Required Final Response Format

### Simple Owner Summary

### What Changed

### Files Changed

### Build/Test Result

### How To Run Locally

### Git Commands / Commit

### What Is Still Placeholder

### Next Best Step
