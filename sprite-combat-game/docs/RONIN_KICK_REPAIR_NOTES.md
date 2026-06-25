# Ronin Kick Repair Notes

Generated: 2026-06-25

## Decision

Ronin `roundhouse_kick` and `side_kick` have been repaired with the existing white-background check process and restored to the playable loadout:

- `K`: `roundhouse_kick`
- `L`: `side_kick`

The source builder now fills enclosed alpha holes and repaints small enclosed pale cut artifacts before the normal sprite-pack import and alpha-cleanup passes run. The runtime loader also prefers the generated `frames-alpha-repaired` outputs for the remaining tiny internal pinholes.

## Source Art

- Roundhouse source uploads:
  - `public/sprites/source-uploads/ronin-kicks/Ronin_Roundhouse_0001-0004.png`
  - `public/sprites/source-uploads/ronin-kicks/Ronin-Roundhouse-0005.png`
- Side kick source upload:
  - `public/sprites/source-uploads/ronin-kicks/Ronin-Sidekick.png`
- Generated source strips:
  - `public/sprites/semi-realistic-source/ronin_roundhouse_kick.png`
  - `public/sprites/semi-realistic-source/ronin_side_kick.png`

## Runtime Frame Paths

- Roundhouse cleaned frames:
  - `public/sprites/frames-cleaned/ronin/roundhouse_kick/0001.png` through `0006.png`
- Roundhouse pack frames:
  - `public/sprites/frames-pack/ronin/roundhouse_kick/0001.png` through `0006.png`
- Side kick cleaned frames:
  - `public/sprites/frames-cleaned/ronin/side_kick/0001.png` through `0006.png`
- Side kick pack frames:
  - `public/sprites/frames-pack/ronin/side_kick/0001.png` through `0006.png`
- Manual override targets:
  - `public/sprites/manual-overrides/ronin/roundhouse_kick/0001.png` through `0006.png`
  - `public/sprites/manual-overrides/ronin/side_kick/0001.png` through `0006.png`

## QA Outputs

- Roundhouse QA:
  - `public/sprites/qa/ronin/roundhouse_kick/alpha-hole-report.json`
  - `public/sprites/qa/ronin/roundhouse_kick/dark-check.png`
  - `public/sprites/qa/ronin/roundhouse_kick/white-check.png`
  - `public/sprites/qa/ronin/roundhouse_kick/proportion-report.json`
  - `public/sprites/qa-cleaned/ronin/roundhouse_kick/white-check.png`
- Side kick QA:
  - `public/sprites/qa/ronin/side_kick/alpha-hole-report.json`
  - `public/sprites/qa/ronin/side_kick/dark-check.png`
  - `public/sprites/qa/ronin/side_kick/white-check.png`
  - `public/sprites/qa/ronin/side_kick/proportion-report.json`
  - `public/sprites/qa-cleaned/ronin/side_kick/white-check.png`

## Current Alpha-Hole Findings

`npm.cmd run sprites:alpha-holes` scanned the active runtime source priority `manual-overrides -> frames-cleaned -> frames-pack`.

Roundhouse frames with internal alpha holes:

- `0001.png`: 33 holes, 110 transparent pixels.
- `0002.png`: 22 holes, 65 transparent pixels.
- `0003.png`: 14 holes, 77 transparent pixels.
- `0004.png`: 20 holes, 66 transparent pixels.
- `0005.png`: 14 holes, 52 transparent pixels.
- `0006.png`: 17 holes, 57 transparent pixels.

Side kick frames with internal alpha holes:

- `0001.png`: 38 holes, 183 transparent pixels.
- `0002.png`: 37 holes, 263 transparent pixels.
- `0003.png`: 30 holes, 213 transparent pixels.
- `0004.png`: 30 holes, 136 transparent pixels.
- `0005.png`: 38 holes, 153 transparent pixels.
- `0006.png`: 22 holes, 75 transparent pixels.

The QA command wrote conservative alpha repairs to:

- `public/sprites/frames-alpha-repaired/ronin/roundhouse_kick/`
- `public/sprites/frames-alpha-repaired/ronin/side_kick/`

Those repaired frames are preferred by the game runtime through `src/data/alphaHoleSpriteFrames.ts`. White/gray cut artifacts dropped from 11 affected frames to 2 affected side-kick frames after source-level white-check repair.

## Proportion Findings

Roundhouse proportion warnings:

- `0003.png`: body width and torso/core read too narrow versus Ronin idle.
- `0004.png`: torso/core reads too wide versus Ronin idle.
- `0005.png`: torso/core reads too wide versus Ronin idle.

Side kick proportion warnings:

- `0002.png`: torso/core reads too wide versus Ronin idle.
- `0003.png`: width/height ratio and torso/core read too narrow versus Ronin idle.
- `0004.png`: torso/core reads too wide versus Ronin idle.
- `0005.png`: torso/core reads too wide versus Ronin idle.

Extended kicks can be wider, but these reports flag the body core, not just the kicking leg. Do not globally scale or deform these frames to hide the issue.

## Manual Replacement Notes

The current frames are playable, but clean hand-authored transparent PNG overrides can still improve consistency. If replacing them, use the manual override paths above or source sheets with:

- no checker/white background baked into clothing,
- no alpha holes inside the body,
- stable Ronin head/torso/waist proportions,
- no cropped boots/hands/head,
- matching baseline and idle guard recovery.
