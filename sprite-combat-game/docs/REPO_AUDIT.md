# Repo Audit - FIghtcore Similar Projects

## Simple Owner Summary

FIghtcore should stay a Vite/TypeScript canvas game for now. The best idea to borrow is not a new engine; it is a cleaner sprite contract: actors choose animation states, animations point to atlas crop rectangles, every frame has an anchor/feet baseline, and Sprite Lab makes those choices visible.

The biggest risk in the current game is treating AI-generated processed frame folders as the only truth. Keep those folders because they are useful, but add atlas metadata from the original source sheets so bad crops can be fixed by data instead of more blind image cleanup.

## Best Matches

- [allenu/YokosukaJS](https://github.com/allenu/YokosukaJS) is the best architecture match. Its README describes actors, actor models, animation states, allowed transitions, spritesheet rectangle metadata, anchor origins, and canvas billboards. That maps directly to FIghtcore's crop and feet-alignment bugs.
- [IceCreamYou/Canvas-Sprite-Animations](https://github.com/IceCreamYou/Canvas-Sprite-Animations) is the best small-library reference. Its README calls out `SpriteMap`, animation sequences, draw helpers, and cached/preloaded images.
- [blendi-remade/sprite-sheet-creator](https://github.com/blendi-remade/sprite-sheet-creator) is the best workflow reference for generated sprite sheets and preview tooling.
- [alfredang/street-fighter-game](https://github.com/alfredang/street-fighter-game) is useful as a vanilla JS/canvas fighting-game reference with original pixel art and a custom animation engine.
- [Ali-Cheikh/Fight-ME-Monk](https://github.com/Ali-Cheikh/Fight-ME-Monk) is useful only for basic canvas fighter flow: player, enemy, attacks, collisions, and simple timing.
- [phaserjs/phaser](https://github.com/phaserjs/phaser) and [pixijs/pixijs](https://github.com/pixijs/pixijs) are mature renderer/game-framework options, but migration would be premature.
- [stevinz/awesome-game-engine-dev](https://github.com/stevinz/awesome-game-engine-dev) is useful as a catalog for future engine decisions, not as an implementation target.

## What Each Repo Can Teach FIghtcore

YokosukaJS:
- Use actor models and animation states instead of ad hoc pose names.
- Store spritesheet rectangles and anchor origins as data.
- Treat background props as billboards/static images, not rough procedural foreground clutter.

Canvas-Sprite-Animations:
- Keep sprite image preloading and frame sequence metadata close together.
- Make draw helpers consume one resolved frame contract instead of knowing where the frame came from.

Fight-ME-Monk and street-fighter-style canvas games:
- Keep hitbox timing simple and readable.
- Keep controls and attack states explicit.
- Avoid bringing in large dependencies when the game still needs art-pipeline stability.

sprite-sheet-creator:
- Sprite Lab should become the production tool: source sheet, crop rectangle, frame bounds, anchor, feet baseline, playback speed, and raw-vs-cleaned comparison.

Phaser / PixiJS:
- Phaser is worth reconsidering later if the project needs scenes, physics plugins, camera tools, tiled maps, or a bigger content pipeline.
- PixiJS is worth reconsidering later if rendering performance, batching, shader effects, or WebGL texture management become bottlenecks.

## What Not To Copy

- Do not copy third-party character art, animation sheets, sounds, or backgrounds.
- Do not replace the current FIghtcore project with a tutorial fighting-game structure.
- Do not migrate to Phaser or PixiJS just to fix crop metadata.
- Do not globally delete dark pixels from AI-generated art. Dark outfits, black hair, outlines, armor, and shadows are part of the characters.

## License / Asset Caution

Code ideas can inspire structure, but licenses still matter. FIghtcore should keep its generated/original assets and avoid importing sprites from these repos unless the license and asset ownership are checked separately. The safest borrow is architectural: metadata schemas, preview tooling, state-machine patterns, and rendering contracts.

## Recommended Architecture Changes

1. Add a formal atlas layer for generated source sheets.
2. Keep runtime frame folders as the fast path when they are clean.
3. Keep atlas crops as a safer fallback and tuning path.
4. Add `feetY` and anchor metadata to frame records.
5. Move toward actor animation transitions after the current visual bugs are stable.

## Recommended Art Pipeline Changes

1. Preserve raw generated source sheets and raw frame backups.
2. Rebuild live frames from raw backups, not already-damaged frames.
3. Remove only edge-connected background pixels.
4. Reject or skip hollow/tiny frames.
5. Use Sprite Lab and QA contact sheets as the source of truth for crop tuning.
6. Prefer explicit atlas rectangles for hard frames, especially grapples, takedowns, and motion-effect-heavy poses.

## Should We Migrate To Phaser Or PixiJS?

No immediate migration. FIghtcore is small enough that custom canvas is still the fastest path. Phaser would add a full game framework before the art pipeline is settled. PixiJS could improve rendering later, but it would not solve bad crop rectangles by itself.

The better next step is to keep the current canvas renderer and strengthen the data model around sprites, anchors, feet baselines, and animation state transitions.

## Next Implementation Plan

1. Keep `src/data/spriteAtlases.ts` as the formal crop metadata layer.
2. Expand atlas coverage for the most broken animations first: Neo Operative takedowns, Cyber Monk recovery, and Shadow Striker transitions.
3. Add Sprite Lab controls to edit or export crop rectangles.
4. Add actor-state transition data after sprite rendering is visually stable.
5. Only revisit Phaser/PixiJS after art QA and combat feel are stronger.
