# Codex Game Dev Tooling

This file records the current tools and the tools considered for FIghtcore. The goal is to keep the game browser-only, keep GitHub Pages deployment simple, and avoid adding new runtime dependencies unless they clearly improve the playable build.

## Current Tools

- Vite and TypeScript: main browser build.
- Canvas 2D: runtime rendering.
- `pngjs`: sprite import, frame inspection, alpha cleanup, and QA sheet generation.
- Sprite Lab: in-game visual inspection for character animation wiring.
- sprite pack scripts:
  - `npm run sprite-pack:import`
  - `npm run sprite-pack:list-frames`
  - `npm run sprite-pack:validate`
  - `npm run sprites:clean-alpha`

## Sprite Workflow

Keep source packs separate from runtime-ready frames.

- `public/sprites/frames-pack`: generated/imported playable hero packs.
- `public/sprites/frames`: legacy enemy and older frame folders.
- `public/sprites/frames-cleaned`: alpha-cleaned runtime preference frames.
- `public/sprites/qa-cleaned`: white, black, teal, red, and transparent review sheets.
- `docs/SPRITE_FRAME_LOCATIONS.md`: generated frame inventory.

The runtime should prefer cleaned frames only when the character animation metadata already points to a matching animation. The cleaner does not create new move bindings by itself.

## Tools Considered

- `sharp`: useful for fast image processing, but skipped for now because it adds a native dependency and `pngjs` is enough for the current alpha cleanup.
- `pixelmatch`: useful for automated visual diffs, but skipped until the sprite QA sheets have stable approved baselines.
- Playwright / in-app browser: preferred for live visual QA when the sandbox allows it. If blocked, use build checks plus the generated QA sheets and then verify in a normal local browser.
- Phaser or PixiJS: not adopted. The current Canvas 2D engine is small and direct, and a framework migration would risk slowing the sellable pass.
- Matter.js: not adopted. FIghtcore combat uses authored hitboxes and arcade movement, not physics simulation.
- Dedicated hitbox editors: good future target, but current priority is stable runtime assets and owner-readable Sprite Lab inspection.
- Howler.js: possible future audio helper. Skipped until the final audio pass so the current build stays dependency-light.

## Recommended Commands

```powershell
cd C:\dev\FIghtcore-codex-work\sprite-combat-game
npm run sprite-pack:import
npm run sprites:clean-alpha
npm run sprite-pack:list-frames
npm run sprite-pack:validate
npm run build
```

Use `sprites:clean-alpha -- --qa-only` when only review sheets are needed.
