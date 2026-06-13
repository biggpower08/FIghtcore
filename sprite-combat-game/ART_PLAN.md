# Art Plan

## Visual Style Goal

The game should read as a pixel-art cyberpunk martial arts wave fighter: MMA-inspired, slightly superpowered, fast, readable, and set in a desert wasteland arena with subtle tech junk.

## Current Art Sources

- Generated hero source sheets exist in `public/sprites/source-generated/`.
- Cross-character reference sheets exist for strikes, grappling, and sparring.
- Generated Cyber Monkey source sheets exist in `public/sprites/source-generated/`.
- Generated desert arena art exists in `public/backgrounds/desert/desert-arena-main.png`.

## Current Hero Sprite Sources

- Cyber Ninja: generated source sheet exists and sliced frames are used in gameplay.
- Shadow Striker: generated source sheet exists and sliced frames are used in gameplay.
- Cyber Monk: generated source sheet exists and sliced frames are used in gameplay.
- Neo Operative: generated source sheet exists and sliced frames are used in gameplay.

Current runtime frame folders now exist for all four heroes under `public/sprites/frames/{character}/{animation}/`. These are cut from the uploaded sheets and are good enough for runtime testing, but the crops still need polish and transparent cleanup.

## Current Enemy Sprite Sources

Cyber Monkey enemies are now backed by generated source sheets and sliced runtime frame folders.

- `cyber-monkey-grunt`: generated lean claw-focused enemy art.
- `cyber-monkey-scrapper`: generated bulkier melee enemy art.
- `cyber-monkey-alpha`: generated boss-scale cyber monkey art with slam, taunt, and enrage poses.

## Current Background Art Status

The desert arena now uses the generated desert wasteland background as the primary runtime layer. The old procedural sand, markers, debris, and backdrop remain as fallback if the image is missing.

## Runtime Cleanup And QA

- `npm run sprite:clean` runs `scripts/clean-sprite-frames.mjs`.
- `npm run sprite:qa` runs `scripts/make-sprite-contact-sheets.mjs`.
- Raw generated frame folders are preserved in `public/sprites/frames-raw-generated-backup/`.
- Cleaned runtime frames live in `public/sprites/frames/`.
- QA contact sheets live in `public/sprites/qa/index.html`.

The cleanup pass uses edge-connected dark-background removal from frame borders so dark clothing, outlines, hair, armor, and internal shadows are preserved. It normalizes canvases by entity family:

| Entity family | Runtime canvas |
|---|---:|
| Player characters | 96x96 |
| Cyber Monkey Grunt | 96x96 |
| Cyber Monkey Scrapper | 112x112 |
| Cyber Monkey Alpha | 160x160 |

## What Is Real Art vs Placeholder

| Asset family | Current state | Used in runtime? | Needs slicing? | Needs polish? | Good enough for now? |
|---|---|---:|---:|---:|---:|
| Cyber Ninja | cleaned generated runtime frames | yes | manual polish | yes | yes |
| Shadow Striker | cleaned generated runtime frames | selectable | manual polish | yes | yes |
| Cyber Monk | cleaned generated runtime frames | selectable | manual polish | yes | yes |
| Neo Operative | cleaned generated runtime frames | selectable | manual polish | yes | yes |
| Cyber Monkey Grunt | cleaned generated runtime frames | yes | manual polish | yes | yes |
| Cyber Monkey Scrapper | cleaned generated runtime frames | yes | manual polish | yes | yes |
| Cyber Monkey Alpha | cleaned generated runtime frames | yes | manual polish | yes | yes |
| Desert base ground | generated background image with procedural fallback | yes | no | yes | yes |
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

1. Review `public/sprites/qa/index.html` and manually polish any frames with bad foot contact or awkward crop placement.
2. Replace procedural desert props with reusable prop images.
3. Add move icons for the HUD and reward cards.

## What Can Be Done Later

- Character select portraits
- Alternate stages
- Advanced impact effects
- Animated background layers
- Full UI skin
