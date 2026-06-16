# FIghtcore

FIghtcore is a browser-only cyberpunk martial arts arena fighter. Pick a fighter, survive enemy waves, and use four equipped moves to control space in a desert combat arena.

Live demo: https://biggpower08.github.io/FIghtcore/

## Current Status

Playable MVP / vertical slice. The game has character select, arena movement, wave combat, H/J/K/L equipped moves, rewards between waves, generated sprite animation support, Sprite Lab, and GitHub Pages deployment.

FIghtcore is separate from FightScope. FightScope is the MMA analytics app; this repo section is the standalone browser game.

## Controls

- Move: `WASD`
- Dash: `Space`
- Equipped moves: `H`, `J`, `K`, `L`
- Pause / resume: `Esc`
- Rewards: choose a move, then choose the H/J/K/L slot it replaces

The HUD shows the current move bound to each H/J/K/L slot for the selected fighter.

## Run Locally

```powershell
cd sprite-combat-game
npm install
npm run dev
```

## Build

```powershell
cd sprite-combat-game
npm run build
```

## Known Issues

- Sprite art is still being polished, especially attack readability and anchor consistency.
- Sprite Lab is a developer tool and may still show fallback information for missing animations.
- Audio, save data, shops, long-term progression, and extra stages are intentionally out of scope for the MVP polish pass.
- Boss encounters are disabled while wave clarity and combat feedback are being stabilized.

## Current Development Focus

- Public presentation and controls clarity
- Combat feedback: hit flashes, impact sparks, readable damage/healing feedback
- Sprite playback stability, especially attack and grapple frames
- Sprite Lab usability
- Slower, less chaotic enemy pacing
- Clear current move documentation

## Short Roadmap

1. Stabilize the current MVP and keep all controls/readability consistent.
2. Polish existing fighters, enemies, hit feedback, and Sprite Lab.
3. Re-enable or redesign bosses once normal waves feel good.
4. Add progression, more enemies, more moves, and more stages only after the MVP feels stable.

## Project Location

The game lives in:

```text
sprite-combat-game/
```

GitHub Pages deploys the `sprite-combat-game/dist` build from `main`.
