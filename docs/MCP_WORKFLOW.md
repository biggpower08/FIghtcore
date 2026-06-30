# Codex MCP Workflow

## Simple Owner Summary

FIghtcore should stay a small, browser-only Vite game. MCP servers are helpers for planning, docs lookup, browser QA, and research; they should not cause broad rewrites or new architecture.

## Project Shape

- Project type: static browser game
- Main app: `sprite-combat-game/`
- Stack: Vite, TypeScript, canvas
- Deployment target: GitHub Pages static build from `sprite-combat-game/dist`
- Normal controls: `WASD`, `Space`, `H`, `J`, `K`, `L`, `Esc`

## Normal Commands

```powershell
cd sprite-combat-game
npm install
npm run build
```

Useful local commands when the app folder is present:

```powershell
npm run dev
npm run preview
npm run sprite:clean
npm run sprite:alpha-repair
npm run sprite:qa
```

Vite documentation confirms the standard flow: use the dev server for local development, `vite build` for production output, and `vite preview` to check the built `dist` folder locally.

## Connected MCP Servers

Detected with:

```powershell
codex mcp list
```

Connected in this environment:

- `playwright`
- `context7`
- `sequential-thinking`
- `exa`
- `github`
- `memory`
- `node_repl`

Not detected by `codex mcp list` in this environment:

- `perplexity`
- `firecrawl`

## How To Use Each MCP

### Playwright

Use for:

- Browser testing
- Visual checks
- Sprite Lab checks
- Console errors
- Navigation and core gameplay smoke checks

Do not use for:

- Rewriting game logic
- Replacing unit/build checks
- Large test suites before the core game is stable

Start with the highest-value flows:

- App loads without console errors.
- Character select starts a run.
- Movement and `H/J/K/L` attacks respond.
- Sprite Lab opens and shows frame/debug status.
- Repaired sprites do not show full strips or duplicate poses.

### Context7

Use for:

- Current Vite, TypeScript, canvas, or library documentation
- Build/deploy behavior
- Config questions
- API syntax checks before changing tooling

Do not use for:

- Private repo facts
- Guessing game-specific architecture
- Replacing local code inspection

Record documentation-driven decisions in the implementation summary or this file when they affect workflow.

### Sequential Thinking

Use for:

- Multi-step debugging
- Sprite pipeline changes
- Animation/rendering root-cause analysis
- Architecture decisions
- Risky refactors

Do not use for:

- Tiny copy edits
- Simple one-file fixes
- Avoiding direct repo inspection

If the Sequential Thinking server is connected but no callable tool is exposed in the current Codex session, write a short practical plan in the conversation before editing.

### Perplexity

Use only if connected.

Use for:

- Current external research
- Deployment/tooling changes
- Package behavior changes
- Technical comparisons

Do not use for:

- Private repo content
- Local source inspection
- Broad web research when Context7 or local docs answer the question

Status here: not connected.

### Firecrawl

Use only if connected.

Use for:

- Structured extraction from public docs/pages
- Crawling a specific public reference when it clearly helps the project

Do not use for:

- Random browsing
- Private repo content
- Replacing focused documentation lookup

Status here: not connected.

### GitHub

Use for:

- Inspecting issues, pull requests, and reviews
- Creating PRs when requested
- Reading remote metadata that local Git cannot provide

Do not use for:

- Bypassing local build/test verification
- Publishing broad changes without a clear owner summary

### Exa

Use for:

- Focused public web research when Perplexity is unavailable

Do not use for:

- Private repo content
- Current library docs when Context7 is a better fit

### Memory

Use for:

- Durable owner preferences only when explicitly appropriate

Do not use for:

- Secrets
- Large project files
- Temporary task details that belong in commits or docs

### Node REPL

Use for:

- Browser automation support when the Browser plugin requires it
- Small local JavaScript inspections when shell commands are awkward

Do not use for:

- Replacing normal project scripts
- Writing broad code changes outside reviewable patches

## Development Rules With MCPs

- Inspect local files first.
- Prefer the existing renderer, animation metadata, move definitions, collision logic, Sprite Lab, and asset scripts.
- Keep changes small and reviewable.
- Do not add dependencies just because an MCP exists.
- Do not add a backend.
- Preserve GitHub Pages static deployment.
- Run `npm run build` before reporting done when game files are present.
- Browser-test with Playwright when possible; if browser QA is blocked, state the exact blocker.

## Current Workspace Warning

At the time this workflow note was added, `git status` showed `sprite-combat-game/` files as deleted from the working tree. Do not stage those deletions unless the owner explicitly confirms that the game folder should be removed.
