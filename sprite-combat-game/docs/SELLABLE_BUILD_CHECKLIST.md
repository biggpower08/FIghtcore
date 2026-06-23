# Sellable Build Checklist

This checklist defines the current small paid-build target: a focused $1.99 browser roguelite slice, not an endless prototype menu.

## Product Scope

- Two playable paths only:
  - Ronin
  - Supreme Emperor
- Two normal enemies only:
  - Monkey Grunt
  - Monkey Striker
- One clear home screen with two large path cards.
- Developer tools hidden behind a collapsible section.
- No backend, API keys, or server requirements.

## Core Play Loop

- Pick a fighter path.
- Clear monkey waves.
- Heal and refill stamina after each wave.
- Choose one of three upgrade rewards.
- Continue until defeated.
- Restart or return home from pause and game over.

## Menu Polish

- Home screen explains the path choice in plain game terms.
- Settings screen has basic volume placeholders, screen shake, and fullscreen control.
- Controls screen lists keyboard/gamepad controls.
- Credits screen exists.
- Pause screen supports resume, restart, controls, settings, and home.
- Game-over screen supports restart and home.

## Upgrade Requirements

- At least 20 upgrades available.
- Upgrades must change actual runtime values, not only show text.
- Upgrade categories should include:
  - damage
  - stamina
  - cooldown
  - max health
  - speed
  - dash
  - defense
  - wave recovery
  - crit/ability pressure
  - move-specific improvements

## Sprite Requirements

- Runtime sprites remain transparent.
- No QA checkerboards, white backgrounds, or red dividers in gameplay assets.
- Cleaned frames stay in `public/sprites/frames-cleaned`.
- QA sheets stay in `public/sprites/qa-cleaned`.
- Ronin, Supreme Emperor, Monkey Grunt, and Monkey Striker should be covered by alpha cleanup where matching frame folders exist.
- Manual frame override workflow must remain intact.
- Fallback rendering must remain intact for missing frames.

## Verification Before Done

```powershell
cd C:\dev\FIghtcore-codex-work\sprite-combat-game
npm run sprites:clean-alpha
npm run sprite-pack:list-frames
npm run sprite-pack:validate
npm run sprite-pack:import
npm run sprites:clean-alpha
npm run build
```

Run live browser visual QA when the sandbox or local browser permits it.

## Still Allowed Later

- Audio pass.
- Better options persistence.
- More arena variety.
- Hitbox editor.
- Approved sprite baseline visual diffing.
- Additional enemy types only after the small sellable loop feels solid.
