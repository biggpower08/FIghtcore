# Ronin Kick Repair Notes

Generated: 2026-06-25

## Decision

Ronin `roundhouse_kick` now passes the active-runtime alpha/white-check audit and remains on the playable `K` control.

Ronin `side_kick` did not pass the active-runtime audit. It remains available in Sprite Lab and QA folders, but it is not assigned to normal gameplay. Ronin `L` has been rolled back to `knee`.

- `K`: `roundhouse_kick`
- `L`: `knee`

## Active Runtime Source

Runtime priority is:

`manual-overrides -> frames-alpha-repaired -> frames-cleaned -> frames-pack -> frames-reference -> frames-semi-realistic -> raw fallback`

Active source for Ronin `roundhouse_kick`:

- `public/sprites/frames-alpha-repaired/ronin/roundhouse_kick/0001.png` through `0006.png`

Active source tested for Ronin `side_kick`:

- `public/sprites/frames-alpha-repaired/ronin/side_kick/0001.png` through `0006.png`

`frames-alpha-repaired` is now actually used by runtime when a repaired frame exists in `src/data/alphaHoleSpriteFrames.ts`.

## Active Runtime QA Result

Roundhouse:

- Result: `ACTIVE_RUNTIME_READY`
- Active runtime sources: `frames-alpha-repaired`
- Failed frames: none
- Reports:
  - `public/sprites/qa/ronin/roundhouse_kick/active-runtime-transparent-strip.png`
  - `public/sprites/qa/ronin/roundhouse_kick/active-runtime-white-check.png`
  - `public/sprites/qa/ronin/roundhouse_kick/active-runtime-dark-check.png`
  - `public/sprites/qa/ronin/roundhouse_kick/active-runtime-teal-check.png`
  - `public/sprites/qa/ronin/roundhouse_kick/active-runtime-red-check.png`
  - `public/sprites/qa/ronin/roundhouse_kick/active-runtime-alpha-hole-report.json`
  - `public/sprites/qa/ronin/roundhouse_kick/active-runtime-cleanliness-summary.json`

Side kick:

- Result: `NOT_GAMEPLAY_READY`
- Active runtime sources tested: `frames-alpha-repaired`
- Failed frames: `0002.png`, `0005.png`
- Reason: active-runtime QA still detected pale cut pixels on those frames.
- Reports:
  - `public/sprites/qa/ronin/side_kick/active-runtime-transparent-strip.png`
  - `public/sprites/qa/ronin/side_kick/active-runtime-white-check.png`
  - `public/sprites/qa/ronin/side_kick/active-runtime-dark-check.png`
  - `public/sprites/qa/ronin/side_kick/active-runtime-teal-check.png`
  - `public/sprites/qa/ronin/side_kick/active-runtime-red-check.png`
  - `public/sprites/qa/ronin/side_kick/active-runtime-alpha-hole-report.json`
  - `public/sprites/qa/ronin/side_kick/active-runtime-cleanliness-summary.json`

## Source Art

- Roundhouse source uploads:
  - `public/sprites/source-uploads/ronin-kicks/Ronin_Roundhouse_0001-0004.png`
  - `public/sprites/source-uploads/ronin-kicks/Ronin-Roundhouse-0005.png`
- Side kick source upload:
  - `public/sprites/source-uploads/ronin-kicks/Ronin-Sidekick.png`
- Generated source strips:
  - `public/sprites/semi-realistic-source/ronin_roundhouse_kick.png`
  - `public/sprites/semi-realistic-source/ronin_side_kick.png`

## Manual Override Paths

Use these paths for hand-cleaned transparent PNG replacements:

- `public/sprites/manual-overrides/ronin/roundhouse_kick/0001.png` through `0006.png`
- `public/sprites/manual-overrides/ronin/side_kick/0001.png` through `0006.png`

For side kick, the required first manual override targets are:

- `public/sprites/manual-overrides/ronin/side_kick/0002.png`
- `public/sprites/manual-overrides/ronin/side_kick/0005.png`

## Legacy QA Outputs

The older alpha-hole and proportion reports remain useful for source-art review:

- `public/sprites/qa/ronin/roundhouse_kick/alpha-hole-report.json`
- `public/sprites/qa/ronin/roundhouse_kick/dark-check.png`
- `public/sprites/qa/ronin/roundhouse_kick/white-check.png`
- `public/sprites/qa/ronin/roundhouse_kick/proportion-report.json`
- `public/sprites/qa/ronin/side_kick/alpha-hole-report.json`
- `public/sprites/qa/ronin/side_kick/dark-check.png`
- `public/sprites/qa/ronin/side_kick/white-check.png`
- `public/sprites/qa/ronin/side_kick/proportion-report.json`

## Manual Replacement Notes

Do not globally scale or deform these frames to hide source problems. Prefer hand-authored transparent PNG overrides with:

- no checker/white background baked into clothing,
- no alpha holes inside the body,
- no pale cut pixels on dark clothing,
- stable Ronin head/torso/waist proportions,
- no cropped boots/hands/head,
- matching baseline and guard recovery.
