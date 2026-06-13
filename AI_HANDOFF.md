# AI Handoff - FIghtcore

## Simple Owner Summary

FIghtcore contains a standalone browser game in `sprite-combat-game/`. It is a cyberpunk martial arts / MMA-inspired wave fighter where Cyber Ninja fights Cyber Monkey enemies in a desert arena. The game runs fully in the browser and deploys to GitHub Pages.

## Current Project Status

The MVP is playable. It has a home screen, settings placeholder, controls screen, pause, game over, reward flow, desert arena, movement, dash, stamina, health, hitboxes, enemy waves, boss wave, sprite registry, sprite source sheets, animation mappings, fallback rendering, and Sprite Lab.

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

The sprite system supports source sheets, sheet crop rectangles, pre-sliced frame folders, and procedural fallback rendering. Do not remove fallback rendering.

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

## Current Build Commands

```powershell
cd sprite-combat-game
npm install
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

- Do not redo the completed sprite animation wiring.
- Do not remove fallback rendering.
- Do not break GitHub Pages.
- Do not add backend dependencies.
- Do not add API keys.
- Do not make this part of FightScope.
- Do not treat FightScope as a game.
- Keep this game browser-only.
- Keep owner-facing summaries plain-English.

## Do Not Redo

Do not recreate `spriteAnimations.ts`, Sprite Lab, `printSpriteCoverageReport()`, or the Cyber Ninja/Cyber Monkey animation wiring unless the task is specifically to improve or tune it.

## Next Good Tasks

- Add real Cyber Monkey source sheets.
- Tune crop rectangles in `src/data/spriteAnimations.ts` using Sprite Lab.
- Add character select.
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
