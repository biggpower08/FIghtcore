# Sprite Cleanup Notes

Generated runtime sprite cleanup stays non-destructive:

- source frames remain in `public/sprites/frames-pack` or `public/sprites/frames`
- cleaned runtime frames are written to `public/sprites/frames-cleaned`
- review sheets and cleanup reports are written to `public/sprites/qa-cleaned`

## White Edge Speck Rule

`npm.cmd run sprites:clean-alpha` now removes tiny connected near-white components only when they are on the silhouette edge.

The pass targets pixels that are:

- bright and low-saturation
- connected to a tiny component, default max area 12 pixels
- near transparent pixels within the outer sprite border

The pass avoids broad fills and does not chase internal bright details. Eye whites, larger highlights, and costume details should remain because they are not tiny edge-touching connected components.

The threshold can be tuned with:

```powershell
$env:SPRITE_WHITE_SPECK_MAX_AREA="12"
npm.cmd run sprites:clean-alpha
```

## Ronin Calf Kick Decision

Ronin's current `calf_kick` art was inspected on the cleaned white-check sheet:

`public/sprites/qa-cleaned/ronin/calf_kick/white-check.png`

It still reads as a low or mid-line forward kick, not a true roundhouse. This pass keeps the move as Calf Kick so labels, upgrades, chain timing, and hitboxes stay honest.

To convert it later, provide or generate a Ronin-specific roundhouse strip with:

- guard/chamber frame
- hip-turn chamber frame
- circular kick drive frame
- clear high or body-line extension frame
- recovery frame
- transparent background
- stable baseline

Recommended manual override target if replacing only the runtime frames:

`public/sprites/manual-overrides/ronin/calf_kick/0001.png` through `0005.png`
