# Simple Owner Summary - FIghtcore

## What This Is

FIghtcore is now a browser-only martial arts wave fighter. The player chooses from four cyber martial artists in a desert arena, fights Cyber Monkey enemies, survives waves, and learns new moves over time.

This game is separate from FightScope. FightScope should stay an MMA analytics app. This game lives in `sprite-combat-game/`.

## What Works Right Now

- Home screen, settings panel, controls panel, pause menu, reward screen, game-over screen, and Sprite Lab.
- Generated desert arena background with a cleaned gameplay version, subtle collision props, dash dust, and player/enemy shadows.
- Player movement with keyboard controls.
- Light, heavy, style attack, real grapple/control, dash, and move-slot inputs.
- Player health, stamina, cooldowns, hitboxes, knockback, stun, and basic collision.
- Cyber Monkey Grunts and Scrappers as normal enemies.
- Cyber Monkey Alpha as the first boss on wave 4.
- Rewards after waves so the player can learn new moves.
- Sprite registry, source-sheet registry, cleaned runtime frame folders, and contact-sheet QA.
- Sprite animation wiring for hero and Cyber Monkey moves, with fallback rendering when final frames are missing.
- GitHub Pages deployment.

## How To Play

- Move: `WASD`
- Light strike: `H`
- Heavy strike: `J`
- Style attack: `K`
- Grapple / takedown control: `L`
- Dash: `Space`
- Move slots: `N`, `O`, `P`, `M`
- Pause / resume: `Esc`

Start from the home screen, press `Start Game`, survive each wave, pick rewards, and keep going.

## What The Sprites Do Right Now

The game has generated source sprite sheets, a master registry, and cleaned runtime frame folders for all four player characters plus Cyber Monkey Grunt, Scrapper, and Alpha.

Sprite Lab is available from the home screen. It lets you preview entities, moves, animation keys, frame paths, dimensions, alpha transparency, checkerboard, ground line, anchor point, hurtbox, hitbox, and whether an animation is using fallback.

## What Is Still Placeholder

- Manual art polish for some source crops, especially a few fast takedown/effect-heavy frames.
- Exact final animation passes for every move.
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

Generated sprites and the desert background were integrated in commit `bca4f75`. The current art polish pass adds cleanup scripts, transparent normalized runtime frames, and contact-sheet QA pages.

## How To Run It Locally

```powershell
cd sprite-combat-game
npm install
npm run dev
```

## Sprite Cleanup And QA

```powershell
cd sprite-combat-game
npm run sprite:clean
npm run sprite:qa
```

QA contact sheets are written to:

```text
sprite-combat-game/public/sprites/qa/index.html
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

- Manually polish the cleaned sprite crops and foot anchoring using Sprite Lab and contact sheets.
- Add richer impact effects and move icons.
- Add better wave variety, sound, and polish.
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
