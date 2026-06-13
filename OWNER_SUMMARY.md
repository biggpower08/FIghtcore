# Simple Owner Summary - FIghtcore

## What This Is

FIghtcore is now a browser-only martial arts wave fighter. The player controls Cyber Ninja in a desert arena, fights Cyber Monkey enemies, survives waves, and learns new moves over time.

This game is separate from FightScope. FightScope should stay an MMA analytics app. This game lives in `sprite-combat-game/`.

## What Works Right Now

- Home screen, settings panel, controls panel, pause menu, reward screen, game-over screen, and Sprite Lab.
- Desert arena with rocks, bushes, boundaries, dash dust, and player/enemy shadows.
- Player movement with keyboard controls.
- Light, heavy, grapple-style, dash, and move-slot inputs.
- Player health, stamina, cooldowns, hitboxes, knockback, stun, and basic collision.
- Cyber Monkey Grunts and Scrappers as normal enemies.
- Cyber Monkey Alpha as the first boss on wave 4.
- Rewards after waves so the player can learn new moves.
- Sprite registry and source-sheet registry.
- Sprite animation wiring for hero moves, with fallback rendering when final frames are missing.
- GitHub Pages deployment.

## How To Play

- Move: `WASD` or arrow keys
- Light strike: `J`
- Heavy strike: `K`
- Grapple / throw placeholder: `L`
- Dash: `Space`
- Move slots: `1`, `2`, `3`, `4`
- Pause / resume: `Esc`

Start from the home screen, press `Start Game`, survive each wave, pick rewards, and keep going.

## What The Sprites Do Right Now

The game has uploaded source sprite sheets and a master registry. Cyber Ninja and the other hero identities have mapped sheet-crop animations. Cyber Monkey enemies use the same animation state system but still rely on procedural fallback art until real Cyber Monkey sheets are added.

Sprite Lab is available from the home screen. It lets you preview entities, moves, animation keys, frame rectangles, and whether an animation is coming from a source-sheet crop, frame PNG, or fallback.

## What Is Still Placeholder

- Cyber Monkey final sprite sheets.
- Exact frame slicing for every animation.
- Character select.
- Real settings behavior for volume, music, SFX, screen shake, controls remap, and difficulty.
- More enemy types, stages, and deeper progression.
- Sound effects and music.
- Persistent save data.

## What Was Recently Completed

The sprite animation wiring was completed in commit:

```text
4e32fad Wire sprite animations to combat moves
```

That work added `src/data/spriteAnimations.ts`, Cyber Ninja sheet-crop mappings, Cyber Monkey fallback animation mappings, Sprite Lab, and `printSpriteCoverageReport()`.

## How To Run It Locally

```powershell
cd sprite-combat-game
npm install
npm run dev
```

## How To Push Updates

```powershell
git status
git add sprite-combat-game README.md OWNER_SUMMARY.md AI_HANDOFF.md AGENTS.md
git commit -m "Describe the change"
git push origin main
```

## How GitHub Pages Deploys

The GitHub Actions workflow builds `sprite-combat-game/` and publishes `sprite-combat-game/dist` to GitHub Pages.

Expected live URL:

<https://biggpower08.github.io/FIghtcore/>

## Next Best Improvements

- Add real Cyber Monkey sprite sheets and map their animations.
- Tune Cyber Ninja crop rectangles using Sprite Lab.
- Add character select for Shadow Striker, Cyber Monk, and Neo Operative.
- Add a local rule-based AI guide or coach after the documentation handoff is stable.
- Add better wave variety, sound, and polish.

## Things I Should Not Worry About Yet

- Backend hosting.
- API keys.
- Cloud AI.
- Perfect final animation slicing.
- Database saves.
- Multiplayer.

## Things To Remember

- Keep the game browser-only until direction changes.
- Keep it separate from FightScope.
- Keep fallback rendering so missing art never breaks the game.
- Run `npm run build` before saying work is done.
- Sprite Lab is the safest place to tune animation crop rectangles.
