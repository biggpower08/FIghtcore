# External Game Research

This pass used public projects as architecture references only. No external code was copied into FIGHTCORE.

## Access Notes

Direct `git clone` attempts into `_external/research/` failed on this Windows sandbox with:

`schannel: AcquireCredentialsHandle failed: SEC_E_NO_CREDENTIALS`

GitHub API reads also failed with a TLS receive error. Because of that, this document records the useful patterns to inspect and rebuild from the public repositories by URL, with implementation focused on FIGHTCORE's existing Vite, TypeScript, and canvas architecture.

## Fighting-Game / Canvas References

### vasile-coste/fighting-game

- URL: https://github.com/vasile-coste/fighting-game
- Likely stack: HTML canvas / JavaScript.
- Useful for FIGHTCORE: simple character state loops, attack animation transitions, rectangular hit checks, and camera-free side-view combat structure.
- Rebuild ideas: keep player data declarative, use explicit animation states, and make attacks resolve from timing windows instead of constant collision checks.
- Do not copy: project-specific art, sprite assets, or any wholesale game loop.
- License concern: verify license before using any source text or assets.

### TalipTun/2d-web-fighting-game

- URL: https://github.com/TalipTun/2d-web-fighting-game
- Likely stack: web canvas / JavaScript.
- Useful for FIGHTCORE: compact browser-only structure and move-to-animation mapping.
- Rebuild ideas: input-to-move dispatch should stay data-driven, with animation keys separate from combat numbers.
- Do not copy: level/art assets or framework-specific assumptions.

### javimoya33/StreetFighter

- URL: https://github.com/javimoya33/StreetFighter
- Likely stack: JavaScript game implementation.
- Useful for FIGHTCORE: classic fighting-game state naming and sprite sheet organization.
- Rebuild ideas: explicit `startup`, `active`, and `recovery` phase labels in move profiles.
- Do not copy: Street Fighter assets or character-specific content.
- License concern: high asset risk if any Capcom-like media is included.

### masonmahaffey/Street-Fighter-Game

- URL: https://github.com/masonmahaffey/Street-Fighter-Game
- Likely stack: browser JavaScript.
- Useful for FIGHTCORE: approachable animation loop and per-character sprite config pattern.
- Rebuild ideas: keep frame data inspectable in tooling rather than buried in renderer code.
- Do not copy: branded assets or cloned move tables.

### rubvalave/Not-Street-Fighter

- URL: https://github.com/rubvalave/Not-Street-Fighter
- Likely stack: JavaScript/canvas.
- Useful for FIGHTCORE: small fighting-game reference for collision and movement separation.
- Rebuild ideas: separate render size from collision box size so wide attack art can extend naturally.
- Do not copy: project-specific control or asset code.

### alfredang/street-fighter-game

- URL: https://github.com/alfredang/street-fighter-game
- Likely stack: JavaScript/canvas.
- Useful for FIGHTCORE: state-machine naming, health/combat loop, and sprite sheet playback.
- Rebuild ideas: keep animation playback and hit resolution synchronized through frame metadata.
- Do not copy: any copyrighted sprites.

### chillzeus/js-fighting-game

- URL: https://github.com/chillzeus/js-fighting-game
- Likely stack: JavaScript/canvas.
- Useful for FIGHTCORE: small browser implementation and direct draw loop patterns.
- Rebuild ideas: preserve FIGHTCORE's fallback rendering while allowing higher-quality imported frame folders to override.
- Do not copy: repository code wholesale.

## Platform Fighter / Smash-Like References

### MonadoBoy16/Platform-Fighter-Engine

- URL: https://github.com/MonadoBoy16/Platform-Fighter-Engine
- Likely stack: game engine project, not a drop-in web library.
- Useful for FIGHTCORE: platform-fighter principles: active frames, hitstop, hitstun, launch angle, weight/resistance, and movement lock.
- Rebuild ideas: FIGHTCORE move profiles should describe impact timing and knockback instead of relying on animation length alone.
- Do not copy: engine code or data formats unless license and compatibility are reviewed.

### ExiledSpirit/platform-fighter

- URL: https://github.com/ExiledSpirit/platform-fighter
- Likely stack: game-engine or JavaScript platform fighter.
- Useful for FIGHTCORE: enemy reaction handoff timing and physics-feeling knockback.
- Rebuild ideas: resolve hitstop first, then apply hitstun/knockback after the freeze.
- Do not copy: engine architecture if it would replace the current browser-only game.

### aposi324/Platform-Fighter-Engine-Animation-Editor-Public

- URL: https://github.com/aposi324/Platform-Fighter-Engine-Animation-Editor-Public
- Likely stack: editor/tooling.
- Useful for FIGHTCORE: editor-first thinking: frame stepping, hitbox overlays, hurtboxes, anchors, and state metadata in one view.
- Rebuild ideas: Sprite Lab should behave more like an Asset Lab, with source priority, body bounds, baseline, collision box, hurtbox, and active hitbox overlays visible.
- Do not copy: editor UI code directly; rebuild the workflow in the existing Sprite Lab.

## Sprite Pipeline / Image Tooling References

### lovell/sharp

- URL: https://github.com/lovell/sharp
- Stack: Node image processing library.
- Useful for FIGHTCORE: professional batch image processing concepts, not necessarily as a dependency.
- Rebuild ideas: deterministic import steps, metadata output, and clear warnings for bad assets.
- Do not copy: native dependency requirements unless the project chooses to accept them later.

### jin-sandbox/node-pngjs

- URL: https://github.com/jin-sandbox/node-pngjs
- Stack: PNG parsing/writing in Node.
- Useful for FIGHTCORE: direct pixel inspection and PNG frame export.
- Rebuild ideas: use `pngjs` for alpha/background checks and transparent frame writing.
- Do not copy: examples verbatim.

### jimp-dev/pngjs3

- URL: https://github.com/jimp-dev/pngjs3
- Stack: PNG tooling.
- Useful for FIGHTCORE: image read/write patterns and pixel manipulation model.
- Rebuild ideas: keep the sprite importer dependency-light.
- Do not copy: library internals.

### amakaseev/sprite-sheet-packer

- URL: https://github.com/amakaseev/sprite-sheet-packer
- Stack: sprite sheet packing.
- Useful for FIGHTCORE: manifest-driven packing and sheet metadata.
- Rebuild ideas: strict sprite-pack manifests that can import a character without custom TypeScript.
- Do not copy: packer implementation.

### soimy/maxrects-packer

- URL: https://github.com/soimy/maxrects-packer
- Stack: MaxRects packing algorithm.
- Useful for FIGHTCORE: useful later if FIGHTCORE packs individual frames back into atlases.
- Rebuild ideas: not needed for this pass because runtime currently benefits from transparent per-frame PNGs.
- Do not copy: packing code unless a future atlas-generation task needs it and license is reviewed.

### cyotek/SpriteSheetPacker

- URL: https://github.com/cyotek/SpriteSheetPacker
- Stack: desktop sprite sheet tool.
- Useful for FIGHTCORE: source/output separation, preview sheets, and metadata concepts.
- Rebuild ideas: keep QA sheets separate from runtime-ready transparent frames.
- Do not copy: desktop app code or UI.

## Hitbox Editor References

### coelhucas/hitbox-editor

- URL: https://github.com/coelhucas/hitbox-editor
- Likely stack: browser/editor tooling.
- Useful for FIGHTCORE: visual editing and validation of hitboxes against frames.
- Rebuild ideas: Sprite Lab should expose frame stepping, hitbox overlays, body bounds, and baseline views.
- Do not copy: editor code directly.

### asderfghj/HitboxEditor

- URL: https://github.com/asderfghj/HitboxEditor
- Likely stack: editor tooling.
- Useful for FIGHTCORE: simple hitbox authoring concepts.
- Rebuild ideas: future tuning should write frame-specific hitbox data back into move profiles or manifest metadata.
- Do not copy: project-specific editor architecture.

## FIGHTCORE Rebuild Decisions

- Use normalized transparent per-frame PNGs for runtime, not QA sheets.
- Preserve existing fallback rendering for missing frames.
- Prefer data-driven sprite-pack manifests over hardcoded TypeScript for new imported characters.
- Prefer active-frame combat timing, hitstop, hitstun, knockback, and frame-specific hitboxes already started in FIGHTCORE move profiles.
- Keep render bounds separate from collision/hitbox bounds so kicks, grapples, and recovery frames are not clipped.
- Use Sprite Lab as the practical validation surface: frame stepping, white/transparent checks, bounds, anchors, hurtboxes, and source priority.

