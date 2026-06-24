# Upgrade Paths

Current build scope: Ronin, Supreme Emperor, Monkey Grunt, and Monkey Striker.

The reward screen keeps the mild cyber warning:

`CYBER WARNING: enemy systems adapting. Health, movement, damage, and attack timing may rise slightly between waves.`

Enemy scaling remains intentionally mild so later waves feel more alert without becoming a hard spike.

## Live Rules

- Character filtering: Ronin sees Ronin plus shared upgrades. Supreme Emperor sees Supreme plus shared upgrades.
- Wave tiers: common upgrades can appear from wave 1, uncommon upgrades from wave 4, and rare upgrades from wave 8.
- Stack modes: `stackable` repeats to its max, `limited` repeats to a smaller cap, `unique` appears once, and `transform` appears once as a move-changing upgrade.
- Every visible upgrade is wired to a runtime stat or combat behavior.
- Placeholder upgrade paths remain out of the reward pool until they have real effects.

## Icon Mapping

- `fist-mark.png`: punches, hand pressure, combo upgrades.
- `foot-arc.png`: kick and footwork upgrades.
- `crown-flame.png`: Supreme Emperor path upgrades.
- `ronin-mask.png`: Ronin path identity upgrades.
- `flow-bolt.png`: Activity, Flow, tempo, and pressure upgrades.
- `heart-guard.png`: survival and recovery upgrades.
- `wave-crest.png`: reserved for future wave-control upgrades.
- `impact-star.png`: impact, control, and knockback upgrades.
- `step-arrow.png`: dash and movement upgrades.

Runtime icon path: `public/ui/upgrade-icons/`.

## Implemented Ronin Upgrades

- Clean Entry: Ronin builds Activity faster from clean pressure.
- Cross Discipline: Cross deals more damage after Jab lands.
- Measured Hands: Ronin chains recover faster.
- Low-Line Tax: Calf Kick gains damage, control, and hitstun.
- Close Range Answer: Knee gains extra control and hitstun.
- Density Breath: Density lasts longer.
- Quiet Pressure: pressure improves recovery as Activity rises.
- Second Wind Stance: high Activity reduces incoming damage.

## Implemented Supreme Upgrades

- Imperial Tempo: high Activity improves attack recovery.
- Royal Pressure: heavy hits generate extra Activity.
- Crowned One-Two: high Activity makes strikes hit harder.
- Golden Threat: strikes gain more control and knockback.
- Crown Breaker: high Activity increases damage.
- Eye of the Crown: Tornado Kick creates stronger spacing control.
- Execution Window: Instant Death chance rises near max Activity.
- Throne Momentum: enemy defeats grant extra Activity and healing.

## Implemented Shared Upgrades

- Flow State: high Activity improves recovery and Flow uptime.
- Pressure Engine: Activity decays more slowly.
- Relentless Hands: moves recover faster.
- No Back Step: dashing near enemies grants more Activity.
- Heat Check: Flow pressure increases damage.
- Breath Between Rounds: wave-clear recovery restores more health.
- Clean Round: Flow entry and enemy defeats restore health.
- First Exchange: clean exchanges build Activity faster.

## Inactive / Placeholder Paths

The larger upgrade tree is still intentionally inactive. Do not add visible reward cards for future trees until each card has:

- a real icon assignment
- character scope
- rarity and wave minimum
- stack behavior
- a gameplay effect
- owner-facing effect text

Do not expand this tree until the core combat feel and sprite readability are stable.
