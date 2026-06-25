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

## Ronin Kick Replacement

Ronin's old `calf_kick` art was previously inspected on the cleaned white-check sheet:

`public/sprites/qa-cleaned/ronin/calf_kick/white-check.png`

That old art read as a low or mid-line forward kick, not a true roundhouse. Ronin now uses the newly provided kick sheets instead:

- K: `roundhouse_kick`
- L: `side_kick`

Both new strips append Ronin idle frame `0001` as the final guard-return frame because the uploaded sheets did not include an idle ending pose.

Source and QA paths:

- `public/sprites/source-uploads/ronin-kicks/Ronin_Roundhouse_0001-0004.png`
- `public/sprites/source-uploads/ronin-kicks/Ronin-Roundhouse-0005.png`
- `public/sprites/source-uploads/ronin-kicks/Ronin-Sidekick.png`
- `public/sprites/semi-realistic-source/ronin_roundhouse_kick.png`
- `public/sprites/semi-realistic-source/ronin_side_kick.png`
- `public/sprites/qa/ronin-source-build/`
- `public/sprites/qa-cleaned/ronin/roundhouse_kick/`
- `public/sprites/qa-cleaned/ronin/side_kick/`
