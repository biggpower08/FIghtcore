# Ronin Kick Repair Notes

Generated: 2026-06-25

## Decision

Both new Ronin kick animations were re-audited visually from the active runtime frames, not just from automated alpha reports.

Neither `roundhouse_kick` nor `side_kick` is currently marked gameplay-ready. They remain available for Sprite Lab, QA, and manual repair.

Current conservative Ronin controls:

- `K`: `calf_kick`
- `L`: `knee`

## Active Runtime Source

Runtime priority is:

`manual-overrides -> frames-alpha-repaired -> frames-cleaned -> frames-pack -> frames-reference -> frames-semi-realistic -> raw fallback`

Active source tested for Ronin `roundhouse_kick`:

- `public/sprites/frames-alpha-repaired/ronin/roundhouse_kick/0001.png` through `0006.png`

Active source tested for Ronin `side_kick`:

- `public/sprites/frames-alpha-repaired/ronin/side_kick/0001.png` through `0006.png`

`frames-alpha-repaired` is actually used by runtime when a repaired frame exists in `src/data/alphaHoleSpriteFrames.ts`. That only proves the active source path, not visual cleanliness.

## Active Runtime QA Sheets

Roundhouse:

- `public/sprites/qa/ronin/roundhouse_kick/active-runtime-transparent-strip.png`
- `public/sprites/qa/ronin/roundhouse_kick/active-runtime-white-check.png`
- `public/sprites/qa/ronin/roundhouse_kick/active-runtime-dark-check.png`
- `public/sprites/qa/ronin/roundhouse_kick/active-runtime-teal-check.png`
- `public/sprites/qa/ronin/roundhouse_kick/active-runtime-red-check.png`
- `public/sprites/qa/ronin/roundhouse_kick/active-runtime-alpha-hole-report.json`
- `public/sprites/qa/ronin/roundhouse_kick/active-runtime-cleanliness-summary.json`

Side kick:

- `public/sprites/qa/ronin/side_kick/active-runtime-transparent-strip.png`
- `public/sprites/qa/ronin/side_kick/active-runtime-white-check.png`
- `public/sprites/qa/ronin/side_kick/active-runtime-dark-check.png`
- `public/sprites/qa/ronin/side_kick/active-runtime-teal-check.png`
- `public/sprites/qa/ronin/side_kick/active-runtime-red-check.png`
- `public/sprites/qa/ronin/side_kick/active-runtime-alpha-hole-report.json`
- `public/sprites/qa/ronin/side_kick/active-runtime-cleanliness-summary.json`

## Frame-by-Frame Visual QA

### Ronin `roundhouse_kick`

Visual QA badge: `NEEDS MANUAL REPAIR`

Failed frames: `0003.png`, `0004.png`, `0005.png`

Unusable source frames: none

- `0001.png`: `PASS` - Guard frame reads as Ronin; no obvious runtime-visible cuts. Manual override: `public/sprites/manual-overrides/ronin/roundhouse_kick/0001.png`
- `0002.png`: `PASS` - Transition frame is compact but usable in motion. Manual override: `public/sprites/manual-overrides/ronin/roundhouse_kick/0002.png`
- `0003.png`: `NEEDS_MANUAL_REPAIR` - Chamber pose has body-width/proportion drift and rough silhouette around the raised leg. Manual override: `public/sprites/manual-overrides/ronin/roundhouse_kick/0003.png`
- `0004.png`: `NEEDS_MANUAL_REPAIR` - Kick setup has torso and pant silhouette roughness; not clean enough for full gameplay-ready status. Manual override: `public/sprites/manual-overrides/ronin/roundhouse_kick/0004.png`
- `0005.png`: `NEEDS_MANUAL_REPAIR` - Full extension is usable as a pose but has rough leg/boot edge read and proportion drift. Manual override: `public/sprites/manual-overrides/ronin/roundhouse_kick/0005.png`
- `0006.png`: `PASS` - Guard return reads consistently with Ronin idle. Manual override: `public/sprites/manual-overrides/ronin/roundhouse_kick/0006.png`

### Ronin `side_kick`

Visual QA badge: `QA ONLY`

Failed frames: `0001.png`, `0002.png`, `0003.png`, `0004.png`, `0005.png`

Unusable source frames: `0001.png`

- `0001.png`: `UNUSABLE_SOURCE_FRAME` - Large pale/white torso cut is visible on the active runtime frame. Manual override: `public/sprites/manual-overrides/ronin/side_kick/0001.png`
- `0002.png`: `NEEDS_MANUAL_REPAIR` - Wide stance has rough silhouette and torso-width drift; automated scan also finds pale cut pixels. Manual override: `public/sprites/manual-overrides/ronin/side_kick/0002.png`
- `0003.png`: `NEEDS_MANUAL_REPAIR` - Chamber pose has awkward lower-leg/boot read and proportion drift. Manual override: `public/sprites/manual-overrides/ronin/side_kick/0003.png`
- `0004.png`: `NEEDS_MANUAL_REPAIR` - Extension pose has rough leg silhouette and does not read as fully clean Ronin art. Manual override: `public/sprites/manual-overrides/ronin/side_kick/0004.png`
- `0005.png`: `NEEDS_MANUAL_REPAIR` - Full extension has rough foot/leg silhouette and automated pale cut pixels. Manual override: `public/sprites/manual-overrides/ronin/side_kick/0005.png`
- `0006.png`: `PASS` - Guard return reads consistently with Ronin idle. Manual override: `public/sprites/manual-overrides/ronin/side_kick/0006.png`

## Source Art

- Roundhouse source uploads:
  - `public/sprites/source-uploads/ronin-kicks/Ronin_Roundhouse_0001-0004.png`
  - `public/sprites/source-uploads/ronin-kicks/Ronin-Roundhouse-0005.png`
- Side kick source upload:
  - `public/sprites/source-uploads/ronin-kicks/Ronin-Sidekick.png`
- Generated source strips:
  - `public/sprites/semi-realistic-source/ronin_roundhouse_kick.png`
  - `public/sprites/semi-realistic-source/ronin_side_kick.png`

## Manual Replacement Notes

Do not globally scale or deform these frames to hide source problems. Prefer hand-authored transparent PNG overrides with:

- no checker/white background baked into clothing,
- no alpha holes inside the body,
- no pale cut pixels on dark clothing,
- stable Ronin head/torso/waist proportions,
- no cropped boots/hands/head,
- matching baseline and guard recovery.
