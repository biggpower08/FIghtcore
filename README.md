# FIghtcore

## Simple Owner Summary

FIghtcore currently contains a browser-only cyberpunk martial arts wave fighter. The player controls Cyber Ninja in a desert arena, fights Cyber Monkey enemies, uses martial arts move hotkeys, earns rewards between waves, and can preview sprite animations in Sprite Lab.

This game is separate from FightScope. FightScope is an MMA analytics app. This folder is for the standalone browser game.

## Project Location

The game lives here:

```text
sprite-combat-game/
```

Main project docs:

- [Sprite Combat Game README](sprite-combat-game/README.md)
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

## Deployment

GitHub Actions builds `sprite-combat-game/` and deploys `sprite-combat-game/dist` to GitHub Pages when changes are pushed to `main`.

## Documentation

Read these first:

- [OWNER_SUMMARY.md](OWNER_SUMMARY.md) for plain-English owner status.
- [AI_HANDOFF.md](AI_HANDOFF.md) for future Codex/ChatGPT agents.
- [sprite-combat-game/README.md](sprite-combat-game/README.md) for game-specific setup and sprite details.

## Current Status

The MVP has menus, settings placeholder, movement, combat, waves, Cyber Monkey enemies, rewards, sprite registry, sheet-crop animation mappings, fallback rendering, Sprite Lab, and GitHub Pages deployment.
