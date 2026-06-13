# FIghtcore

## Simple Owner Summary

FIghtcore currently contains a browser-only cyberpunk martial arts wave fighter. The player can choose from four martial arts characters in a generated desert arena, fight Cyber Monkey enemies, use martial arts move hotkeys, earn rewards between waves, and preview sprite animations in Sprite Lab.

This game is separate from FightScope. FightScope is an MMA analytics app. This folder is for the standalone browser game.

## Project Location

The game lives here:

```text
sprite-combat-game/
```

Main project docs:

- [Sprite Combat Game README](sprite-combat-game/README.md)
- [Playable MVP Lock](sprite-combat-game/docs/PLAYABLE_MVP_LOCK.md)
- [Owner Summary](OWNER_SUMMARY.md)
- [AI Handoff](AI_HANDOFF.md)

## Live Site

Expected GitHub Pages URL:

<https://biggpower08.github.io/FIghtcore/>

## Local Development

```powershell
cd sprite-combat-game
npm install
npm run dev
```

## Build

```powershell
cd sprite-combat-game
npm run build
```

## Sprite Art QA

```powershell
cd sprite-combat-game
npm run sprite:clean
npm run sprite:qa
```

The cleanup script preserves a raw backup in `public/sprites/frames-raw-generated-backup/`, cleans edge-connected dark sheet backgrounds, normalizes runtime frame canvases, and writes QA reports/contact sheets to `public/sprites/qa/`.

## Deployment

GitHub Actions builds `sprite-combat-game/` and deploys `sprite-combat-game/dist` to GitHub Pages when changes are pushed to `main`.

## Documentation

Read these first:

- [OWNER_SUMMARY.md](OWNER_SUMMARY.md) for plain-English owner status.
- [AI_HANDOFF.md](AI_HANDOFF.md) for future Codex/ChatGPT agents.
- [sprite-combat-game/README.md](sprite-combat-game/README.md) for game-specific setup and sprite details.

## Current Status

The MVP has menus, settings placeholder, WASD movement, H/J/K/L equipped moves, waves, Cyber Monkey enemies, reward replacement, selectable heroes, generated runtime sprites, cleaned transparent frame folders, a generated desert arena background, sprite health fallback rules, Sprite Lab, sprite QA scripts, and GitHub Pages deployment.
