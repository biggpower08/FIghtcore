# AGENTS.md

## Owner Preference

Start responses with a simple owner summary. Use plain English first, then technical details. Give PowerShell-friendly commands. Report exact files changed, build/test results, and git commit hash after pushing. Do not claim something is done unless the build passes or the limitation is stated.

## Project Boundary

Work primarily in `sprite-combat-game/` unless the task is documentation at repo root. The game must stay separate from FightScope. FightScope is an MMA analytics app, not this game.

## Development Rules

- Keep the game browser-only unless the owner explicitly changes direction.
- Do not add backend requirements.
- Do not add API keys or secrets.
- Preserve GitHub Pages deployment.
- Preserve fallback rendering for missing sprite frames.
- Do not redo completed sprite animation wiring unless asked to tune or extend it.
- Keep owner-facing summaries plain-English.

## Build/Test Commands

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

- Run `npm run build` from `sprite-combat-game/`.
- Check `git status`.
- Mention any limitation or skipped verification.
- If pushing, report the commit hash.

## Final Response Format

### Simple Owner Summary

### What Changed

### Files Changed

### Build/Test Result

### How To Run Locally

### Git Commands / Commit

### What Is Still Placeholder

### Next Best Step

## Required Final Response Format

Use the same format above for substantial project work.
