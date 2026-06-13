# Art Plan

## Visual Style Goal

The game should read as a pixel-art cyberpunk martial arts wave fighter: MMA-inspired, slightly superpowered, fast, readable, and set in a desert wasteland arena with subtle tech junk.

## Current Art Sources

- Real hero source sheets exist in `public/sprites/sheets/`.
- Cross-character reference sheets exist for strikes, grappling, and sparring.
- Cyber Monkey final source sheets do not exist yet.
- Desert stage art is currently procedural.

## Current Hero Sprite Sources

- Cyber Ninja: real source sheet exists and is used by approximate crop rectangles.
- Shadow Striker: real source sheet exists and is registered.
- Cyber Monk: real source sheet exists and is registered.
- Neo Operative: real source sheet exists and is registered.

Current runtime frame folders now exist for all four heroes under `public/sprites/frames/{character}/{animation}/`. These are cut from the uploaded sheets and are good enough for runtime testing, but the crops still need polish and transparent cleanup.

## Current Enemy Sprite Sources

Cyber Monkey enemies are designed in code and data, but not backed by final image sheets yet.

- `cyber-monkey-grunt`: procedural fallback, intended to become small, fast, lean, claw-focused.
- `cyber-monkey-scrapper`: procedural fallback, intended to become bulkier with heavier limbs.
- `cyber-monkey-alpha`: procedural fallback, intended to become boss-scale with armor, cyber limbs, and slam poses.

## Current Background Art Status

The desert arena is procedural. It now has sand texture, arena boundaries, debris, edge markers, dead bushes, rocks, dust, bones, and cyber scrap shapes. Bitmap layers and prop images are still planned.

## What Is Real Art vs Placeholder

| Asset family | Current state | Used in runtime? | Needs slicing? | Needs polish? | Good enough for now? |
|---|---|---:|---:|---:|---:|
| Cyber Ninja | partial real source sheet plus sliced runtime frames | yes | polish pass | yes | yes |
| Shadow Striker | partial real source sheet plus sliced runtime frames | selectable | polish pass | yes | yes |
| Cyber Monk | partial real source sheet plus sliced runtime frames | selectable | polish pass | yes | yes |
| Neo Operative | partial real source sheet plus sliced runtime frames | selectable | polish pass | yes | yes |
| Cyber Monkey Grunt | procedural placeholder | yes | yes | yes | temporary |
| Cyber Monkey Scrapper | procedural placeholder | yes | yes | yes | temporary |
| Cyber Monkey Alpha | procedural placeholder | yes | yes | yes | temporary |
| Desert base ground | procedural placeholder | yes | no | yes | temporary |
| Rocks | procedural placeholder | yes | no | yes | yes |
| Dead bushes | procedural placeholder | yes | no | yes | yes |
| Dust effects | procedural placeholder | yes | no | yes | yes |
| Hit effects | procedural placeholder | yes | no | yes | temporary |
| UI icon art | planned | no | no | yes | no |

## Required Asset Categories

- Hero source sheets
- Hero sliced animation frames
- Enemy source sheets
- Enemy sliced animation frames
- Combat effects
- Background layers
- Background props
- UI icons
- Sprite Lab review references

## Required Hero Animations

Cyber Ninja priority:

- `idle`
- `ready`
- `walk`
- `dash`
- `jab`
- `cross`
- `low_kick`
- `roundhouse_kick`
- `hit_react`
- `knockdown`
- `recovery`

Other heroes should keep the same registry pattern and be sliced after character select becomes a priority.

## Required Cyber Monkey Animations

Cyber Monkey Grunt:

- `idle`
- `run`
- `leap`
- `claw_swipe`
- `palm_strike`
- `hit_react`
- `knockdown`
- `death`

Cyber Monkey Scrapper:

- `idle`
- `run`
- `leap`
- `claw_combo`
- `low_kick`
- `hit_react`
- `knockdown`
- `death`

Cyber Monkey Alpha:

- `idle`
- `run`
- `taunt`
- `ground_slam`
- `leap_slam`
- `clinch_knee`
- `hit_react`
- `enrage`
- `knockdown`
- `death`

## Required Background Assets

- Sand base tile
- Dust overlay
- Distant desert ridge layer
- Arena edge markers
- Rock small
- Rock large
- Dead bush
- Bone pile
- Cyber scrap
- Metal wreckage
- Boundary posts

## Effects Assets

- Dust puff
- Dash trail blue
- Impact spark cyan
- Impact spark orange
- Impact spark green
- Hit flash
- Ground slam dust
- Reward glow by rarity

## UI Art Assets

- Move slot icons
- Rarity frames
- Character portraits
- Cyber Monkey wave icons
- Health/stamina polish
- Sprite Lab source badges

## What Should Be Done First

1. Draw or generate Cyber Monkey source sheets.
2. Clean up the newly sliced hero frame folders with transparent backgrounds and tighter crops.
3. Replace procedural desert props with reusable prop images.
4. Add move icons for the HUD and reward cards.

## What Can Be Done Later

- Character select portraits
- Alternate stages
- Advanced impact effects
- Animated background layers
- Full UI skin
