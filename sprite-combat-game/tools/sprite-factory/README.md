# Fightcore Sprite Factory

This folder is a repeatable local pipeline for making Fightcore sprite strips with ComfyUI.

This factory is for new production art only. The starter manifest intentionally does not use the current runtime character names, current animation folder names, or current visual designs.

The factory keeps generated images out of gameplay until they pass QA:

1. `generate-sprites.py` sends one manifest job at a time to local ComfyUI and saves PNGs in `tools/sprite-factory/raw/`.
2. `qa-sprites.py` checks image size and transparency, then copies passing PNGs into `tools/sprite-factory/approved/`.
3. `promote-approved-sprites.py` copies approved PNGs into `public/assets/fightcore/sprites/`.

Generated assets are not wired into the running game by this pipeline.

## Required Rules

- One entity per generated image.
- One animation per generated image.
- One horizontal strip per generated image.
- Transparent background required.
- Equal-size frames required.
- Same ground baseline required.
- No poster sheets, labels, text, UI, borders, or dark backgrounds.
- Do not batch multiple characters into one image.
- Do not batch multiple animations into one image.

## Folder Layout

```text
tools/sprite-factory/
  README.md
  sprite-jobs.json
  workflows/
    comfyui-sprite-strip-template.json
  scripts/
    generate-sprites.py
    qa-sprites.py
    promote-approved-sprites.py
  raw/
  failed/
  approved/

public/assets/fightcore/sprites/
```

## Windows 11 PowerShell Setup

From the game folder:

```powershell
cd sprite-combat-game
npm install
npm run build
```

Recommended local ComfyUI folder:

```text
C:\Users\trish\Documents\comfy\ComfyUI
```

Use the correct ComfyUI and PyTorch setup for your machine. The CUDA command below is for NVIDIA GPUs. AMD users should not blindly install CUDA PyTorch; follow the current ComfyUI/PyTorch guidance for AMD on Windows instead. CPU fallback may work, but generation will be much slower.

If this folder already exists but does not have a `.venv`, create the local Python environment there:

```powershell
cd "C:\Users\trish\Documents\comfy\ComfyUI"
py -3 -m venv .venv
.\.venv\Scripts\python.exe -m pip install --upgrade pip
.\.venv\Scripts\python.exe -m pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu121
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
```

Install ComfyUI locally only if that folder is missing:

```powershell
cd "C:\Users\trish\Documents\comfy"
git clone https://github.com/comfyanonymous/ComfyUI.git
cd ComfyUI
py -3 -m venv .venv
.\.venv\Scripts\python.exe -m pip install --upgrade pip
.\.venv\Scripts\python.exe -m pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu121
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
```

If you do not have an NVIDIA GPU, replace the CUDA PyTorch install line with the correct install command for your hardware before running it. Do not guess here; ComfyUI will only be reliable when PyTorch matches the machine.

Put a local image model in:

```text
C:\Users\trish\Documents\comfy\ComfyUI\models\checkpoints\
```

Then edit:

```text
tools\sprite-factory\workflows\comfyui-sprite-strip-template.json
```

Replace:

```text
PUT_PIXEL_ART_MODEL_NAME_HERE.safetensors
```

with the exact checkpoint filename you installed.

The workflow template must contain a real checkpoint filename before generation. The generator will stop if it still sees `PUT_PIXEL_ART_MODEL_NAME_HERE.safetensors`.

Start ComfyUI:

```powershell
cd "C:\Users\trish\Documents\comfy\ComfyUI"
.\.venv\Scripts\python.exe main.py --listen 127.0.0.1 --port 8188
```

## Preflight Check

Run this before generation:

```powershell
python tools/sprite-factory/scripts/generate-sprites.py --preflight
```

Preflight checks:

- `sprite-jobs.json` exists and is readable.
- The default test job `aegis-runner.stance-loop` exists.
- The workflow template exists and is readable.
- The workflow no longer contains `PUT_PIXEL_ART_MODEL_NAME_HERE.safetensors`.
- ComfyUI is reachable at `127.0.0.1:8188`.
- `raw/`, `approved/`, and `failed/` folders exist.

It is okay for preflight to report that ComfyUI is not reachable if ComfyUI is not running yet. Start ComfyUI and rerun preflight before generation.

## First Test Generation

Do not generate all sprites first. Prove the pipeline with one transparent horizontal strip:

```powershell
python tools/sprite-factory/scripts/generate-sprites.py --job aegis-runner.stance-loop
python tools/sprite-factory/scripts/qa-sprites.py --job aegis-runner.stance-loop
python tools/sprite-factory/scripts/promote-approved-sprites.py --job aegis-runner.stance-loop
```

Only after one job generates, passes QA, and promotes safely should you try a full entity:

```powershell
python tools/sprite-factory/scripts/generate-sprites.py --entity aegis-runner
```

## Generate Sprites

Generate one asset by key:

```powershell
python tools/sprite-factory/scripts/generate-sprites.py --job aegis-runner.stance-loop
```

Generate one character folder:

```powershell
python tools/sprite-factory/scripts/generate-sprites.py --entity aegis-runner
```

Generate all pending assets:

```powershell
python tools/sprite-factory/scripts/generate-sprites.py --all
```

Regenerate even if raw or approved output already exists:

```powershell
python tools/sprite-factory/scripts/generate-sprites.py --job aegis-runner.stance-loop --force
```

## QA Sprites

QA all generated raw assets:

```powershell
python tools/sprite-factory/scripts/qa-sprites.py --all
```

QA one asset:

```powershell
python tools/sprite-factory/scripts/qa-sprites.py --job aegis-runner.stance-loop
```

QA one entity:

```powershell
python tools/sprite-factory/scripts/qa-sprites.py --entity aegis-runner
```

QA writes a report here:

```text
tools/sprite-factory/failed/qa-report.json
```

Passing assets are copied to:

```text
tools/sprite-factory/approved/
```

To move failed raw files into `failed/`:

```powershell
python tools/sprite-factory/scripts/qa-sprites.py --all --move-failed
```

## Promote Approved Sprites

Promote all approved assets into the game asset folder:

```powershell
python tools/sprite-factory/scripts/promote-approved-sprites.py --all
```

Promote one character folder:

```powershell
python tools/sprite-factory/scripts/promote-approved-sprites.py --entity aegis-runner
```

Promote one asset:

```powershell
python tools/sprite-factory/scripts/promote-approved-sprites.py --job aegis-runner.stance-loop
```

Promoted assets are copied to:

```text
public/assets/fightcore/sprites/
```

Promoted factory assets are copied to `public/assets/fightcore/sprites/` but are not automatically used by the live game. The live game should only use new generated assets after a separate integration task.

Use `--force` only when you intentionally want to overwrite an existing promoted file.

## Manifest Notes

`sprite-jobs.json` is the source of truth for generation. Each job has:

- `entity`
- `animation`
- `outputPath`
- `frameWidth`
- `frameHeight`
- `frameCount`
- `prompt`
- `negativePrompt`
- `category`

The optional `key` field makes commands easy to run, for example `aegis-runner.stance-loop`.

The starter jobs use original placeholder entities and motions:

- `aegis-runner`
- `coil-bruiser`
- `scrap-stalker`
- `effects`

Replace or expand those entries when the final new Fightcore sprite list is approved. Do not copy names, costumes, poses, or animation lists from the current runtime asset folders.

## Current Limitations

- The included ComfyUI workflow is a starter API workflow. You must set the checkpoint filename before generation.
- Some ComfyUI models do not create true PNG transparency. If QA reports missing alpha, regenerate with a workflow/model that outputs transparency.
- QA checks dimensions and alpha metadata. It cannot automatically prove animation quality, equal ground baseline, or clean frame posing.
