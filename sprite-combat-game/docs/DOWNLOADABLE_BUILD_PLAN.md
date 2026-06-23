# Downloadable Build Plan

FIghtcore still ships as a web build today. The current goal is to make the game feel like a focused downloadable action roguelite before doing packaging work.

## Current Web Build Status

- Vite builds the game into `dist`.
- The game has no backend requirement.
- Runtime assets load from local `public` paths.
- GitHub Pages deployment should keep working.

## Recommended Packaging Routes

- Itch.io downloadable zip: lowest-friction first step. Build the web version, zip the output, and ship it as an offline browser package or wrapped app later.
- Tauri: best long-term lightweight desktop wrapper if we want a small executable and native window behavior.
- Electron: fastest desktop wrapper if tooling convenience matters more than app size.
- Steam build later: wait until controls, audio, save data, and repeat-run content are more complete.

## Before Packaging

- Confirm all asset paths work offline and do not depend on remote URLs.
- Keep sprite and background paths relative to the app bundle.
- Add persistent settings for audio, fullscreen, and screen shake.
- Add save data for best wave, unlocked options, and accessibility preferences.
- Make keyboard/gamepad input prompts consistent.
- Add a real audio pass.
- Verify fullscreen behavior in the chosen wrapper.
- Ensure `dist` is not committed, but can be packaged from a clean build.

## Suggested Later Commands

```powershell
cd C:\dev\FIghtcore-codex-work\sprite-combat-game
npm install
npm run build
```

Packaging should start only after the small two-character, two-enemy loop feels good in the browser build.
