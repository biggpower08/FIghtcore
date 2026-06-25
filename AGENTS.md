# AGENTS.md

# FIghtcore Codex Instructions

## Plain-English Summary Requirement

Start every substantial response with a short plain-English paragraph explaining what changed, why it matters, and what I should do next. Use plain English first, then technical details. Give PowerShell-friendly commands. Report exact files changed, build/test results, and git commit hash after pushing. Do not claim something is done unless the build passes or the limitation is stated.

## Project Goal

FIghtcore is a browser-based pixel-art martial arts combat game built with Vite, TypeScript, and canvas. The priority is a stable, playable GitHub Pages game, not a large engine rewrite.

## Project Boundary

Work primarily in `sprite-combat-game/` unless the task is documentation at repo root. The game must stay separate from FightScope. FightScope is an MMA analytics app, not this game.

## Core Rule

Prefer the smallest correct change that improves the current game. Reuse existing systems before creating new systems.

Before changing code, check whether the repo already has:

- a renderer
- animation metadata
- character loadouts
- move definitions
- collision/hitbox logic
- Sprite Lab/debug tools
- existing asset preparation scripts
- existing docs explaining the intended behavior

Do not create parallel systems unless the existing system is clearly unusable.

## Ponytail-Style Efficiency Rules

Before writing code, climb this ladder:

1. Does this need to be built at all?
2. Does this repo already have the helper, data shape, or pattern?
3. Can a browser/native platform feature solve it?
4. Can an installed dependency solve it?
5. Can this be a small patch in one or two files?
6. Only then write new code.

No new dependency unless explicitly justified.

## Game-Specific Constraints

- Keep the game browser/static-hosting friendly.
- Keep the game browser-only unless the owner explicitly changes direction.
- Do not add a backend.
- Do not add backend requirements.
- Do not add API keys or secrets.
- Do not require C++, C#, Unity, Godot, or a server.
- Keep GitHub Pages deployment working.
- Preserve GitHub Pages deployment.
- Preserve Vite + TypeScript unless explicitly told otherwise.
- Preserve fallback rendering for missing sprite frames.
- Do not redo completed sprite animation wiring unless asked to tune or extend it.
- Build must pass before final answer.
- Prefer deterministic canvas logic over complicated framework changes.
- Keep owner-facing summaries plain-English.

## Sprite and Animation Rules

- Do not rely on fixed 96x96 cells if metadata already defines frame width/height.
- Use frame metadata: x, w, h, anchorX, anchorY.
- Collision/hitboxes are separate from sprite frame dimensions.
- Attack animations should usually play slower than idle/walk/run.
- Grappling animations should move linearly from start location to end location.
- The player's final position must match the move's intended end location.
- The enemy's x-position should shift by the same x delta during grappling exchanges.
- Never display an entire sprite strip as a single frame.
- Never display multiple frames at once unless the feature is explicitly a contact sheet/debug view.

## Current Gameplay Priorities

Prioritize stability and readability:

1. Fix visible animation bugs.
2. Fix player/enemy clarity.
3. Fix hit feedback.
4. Fix Sprite Lab usability.
5. Tune health, damage, spawn rates, and animation timing.
6. Only after stability, add new characters, enemies, progression, or moves.

## Character and Move Rules

- Each playable character should have exactly four equipped moves.
- Universal/default moves should be locked by default.
- If a move has no valid animation art, hide it from rewards/loadouts instead of showing broken animation.
- Meditation or ability moves may heal only if the move definition explicitly says so.
- Knockdown animation should not trigger constantly; use it only at larger health intervals or meaningful impact moments.

## Controls

Use the current documented controls. Do not reintroduce removed controls unless explicitly requested.

Current intended controls:

- WASD movement
- Space dash
- H/J/K/L or the repo's current four attack bindings, depending on the latest code/docs

When controls conflict, inspect the current code and README, then update both together.

## Debugging Rules

Bug fix means root cause, not symptom:

- Trace the render/update/input flow end to end.
- Grep every caller of the function being changed.
- Fix shared logic once when possible.
- Avoid one-off patches in multiple places.
- Add the smallest runnable verification possible.

## Build/Test Commands

After code changes, run:

```powershell
cd sprite-combat-game
npm install
npm run build
```

## Do Not Commit

- `node_modules/`
- `dist/`
- `.env`
- `.env.local`
- logs
- temporary screenshots
- large unused source assets unless intentionally added

## Before Reporting Done

- Run `npm run build` from `sprite-combat-game/` after code changes.
- Check `git status`.
- Mention any limitation or skipped verification.
- If pushing, report the commit hash.

## Final Response Format

When done, include:

- Plain-English summary.
- Files changed.
- Commands run and whether they passed.
- What to check in the browser.
- Git commands to commit and push.

Use Windows PowerShell commands.

For substantial project work, use this structure:

### Plain-English Summary

### Files Changed

### Commands Run

### Browser Checks

### Git Commands

## Required Final Response Format

Use the same format above for substantial project work.

## Add Targeted Skills Later

OpenAI Codex skills can be added as folders with a `SKILL.md`. Codex can invoke them explicitly or implicitly based on the skill description. The highest-value custom skills for this game would be:

```text
FIghtcore Animation Debugger
FIghtcore Sprite Lab Fixer
FIghtcore Balance Tuner
FIghtcore GitHub Pages Release Checker
```

Example future skill folder:

```powershell
mkdir .agents\skills\fightcore-animation-debugger
notepad .agents\skills\fightcore-animation-debugger\SKILL.md
```

Example `SKILL.md` content:

```markdown
---
name: fightcore-animation-debugger
description: Use for FIghtcore sprite animation bugs, frame metadata bugs, strips displaying all frames at once, attack timing, grappling paths, anchors, or canvas rendering defects.
---

# FIghtcore Animation Debugger

When debugging animation, inspect the current render path before editing.

Check:
1. move definition
2. character loadout
3. sprite metadata
4. frame extraction logic
5. animation timing
6. canvas drawImage source rectangle
7. anchor/baseline calculation
8. Sprite Lab display logic

Rules:
- Never display a whole sprite strip as one frame.
- Never assume fixed 96x96 cells when metadata exists.
- Use x/w/h metadata for source rectangles.
- Keep collision/hitbox logic separate from visual frame dimensions.
- Add the smallest possible verification: build, Sprite Lab check, or a focused assertion if the repo has tests.

Final answer must explain:
- root cause
- exact files changed
- browser behavior to verify
```

Example prompt for a focused bug:

```text
Use $fightcore-animation-debugger. Fix Shadow Striker cross showing multiple sprites at once. Smallest correct diff. Run npm run build.
```

For the next FIghtcore task, prefer this request pattern:

```text
Use Ponytail mode and the FIghtcore repo instructions.

Plain-English goal:
Fix one animation bug: Shadow Striker's cross currently displays multiple sprites at once instead of one frame at a time.

Constraints:
- Do not rewrite the renderer.
- Do not add dependencies.
- Reuse existing frame metadata.
- Fix the shared animation/frame-selection logic if that is the root cause.
- Run npm run build.
- Final response must include files changed, commands run, and browser checks.
```

For bigger work:

```text
Use Ponytail mode.

First inspect the repo and produce a 5-step implementation plan for stabilizing FIghtcore without adding new systems. Focus on:
1. animation frame display bugs
2. hit feedback/player clarity
3. spawn/health/damage tuning
4. Sprite Lab usability
5. README/controls cleanup
```
