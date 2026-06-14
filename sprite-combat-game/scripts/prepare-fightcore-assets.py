#!/usr/bin/env python3
"""Prepare provided Fightcore source art for the browser game."""

from __future__ import annotations

import json
from collections import deque
from pathlib import Path
from typing import Any

from PIL import Image


GAME_ROOT = Path(__file__).resolve().parents[1]
RAW_ROOT = GAME_ROOT / "tools" / "raw-fightcore-assets"
OUTPUT_ROOT = GAME_ROOT / "public" / "assets" / "fightcore"
QA_REPORT_PATH = OUTPUT_ROOT / "asset-prep-report.json"

FRAME_SIZE = 96

SPRITE_SPECS = [
    {
        "name": "Cyber Ninja",
        "source": "Cyber.ninja.png.png",
        "output_dir": OUTPUT_ROOT / "sprites" / "cyber-ninja",
        "atlas_size": (864, 960),
        "rows": [
            ("idle", 0, 4, True, 8),
            ("walk", 1, 6, True, 10),
            ("dash", 2, 5, False, 14),
            ("jab", 3, 5, False, 16),
            ("slice", 4, 6, False, 14),
            ("high-kick", 5, 7, False, 13),
            ("side-kick", 6, 6, False, 14),
            ("hit-react", 7, 3, False, 12),
            ("recovery", 8, 5, False, 8),
            ("standup", 9, 6, False, 8),
        ],
    },
    {
        "name": "Monkey Grunt",
        "source": "monkey.grunt.png.png",
        "output_dir": OUTPUT_ROOT / "sprites" / "monkey-grunt",
        "atlas_size": (864, 768),
        "rows": [
            ("idle", 0, 4, True, 8),
            ("run", 1, 6, True, 12),
            ("jab", 2, 5, False, 14),
            ("cross", 3, 5, False, 14),
            ("grab", 4, 6, False, 12),
            ("hit-react", 5, 3, False, 12),
            ("knockdown", 6, 5, False, 8),
            ("death", 7, 7, False, 8),
        ],
    },
]


def main() -> int:
    report: dict[str, Any] = {"sprites": [], "background": {}, "errors": []}

    for spec in SPRITE_SPECS:
        try:
            report["sprites"].append(prepare_sprite_sheet(spec))
        except Exception as exc:  # noqa: BLE001 - command-line asset prep should report all failures.
            report["errors"].append(f"{spec['name']}: {exc}")

    try:
        report["background"] = prepare_background()
    except Exception as exc:  # noqa: BLE001
        report["errors"].append(f"desert background: {exc}")

    QA_REPORT_PATH.parent.mkdir(parents=True, exist_ok=True)
    QA_REPORT_PATH.write_text(json.dumps(report, indent=2) + "\n", encoding="utf-8")
    print(f"QA report: {QA_REPORT_PATH}")

    if report["errors"]:
        for error in report["errors"]:
            print(f"ERROR: {error}")
        return 1

    print("Fightcore asset prep complete.")
    return 0


def prepare_sprite_sheet(spec: dict[str, Any]) -> dict[str, Any]:
    source_path = RAW_ROOT / spec["source"]
    if not source_path.exists():
        raise FileNotFoundError(f"Missing source image: {source_path}")

    source = Image.open(source_path).convert("RGBA")
    cleaned, transparent_pixels = remove_checkerboard_background(source)
    atlas = cleaned.resize(spec["atlas_size"], Image.Resampling.LANCZOS)

    output_dir: Path = spec["output_dir"]
    output_dir.mkdir(parents=True, exist_ok=True)
    atlas_path = output_dir / "atlas.png"
    atlas.save(atlas_path)

    atlas_report: dict[str, Any] = {
        "name": spec["name"],
        "source": repo_path(source_path),
        "sourceSize": list(source.size),
        "atlas": repo_path(atlas_path),
        "atlasSize": list(atlas.size),
        "transparentPixelsBeforeResize": transparent_pixels,
        "transparentPixelsAfterResize": count_transparent_pixels(atlas),
        "remainingBorderConnectedCheckerboardPixels": count_border_connected_checkerboard_pixels(atlas),
        "strips": [],
    }

    for animation, row_index, frame_count, loop, fps in spec["rows"]:
        y = row_index * FRAME_SIZE
        strip = atlas.crop((0, y, frame_count * FRAME_SIZE, y + FRAME_SIZE))
        strip_path = output_dir / f"{animation}-strip.png"
        strip.save(strip_path)
        atlas_report["strips"].append(
            {
                "animation": animation,
                "path": repo_path(strip_path),
                "size": list(strip.size),
                "frameCount": frame_count,
                "fps": fps,
                "loop": loop,
                "passedDimensions": strip.size == (frame_count * FRAME_SIZE, FRAME_SIZE),
            }
        )

    expected_size = tuple(spec["atlas_size"])
    if atlas.size != expected_size:
        raise ValueError(f"{spec['name']} atlas is {atlas.size}; expected {expected_size}")
    if atlas_report["transparentPixelsAfterResize"] <= 0:
        raise ValueError(f"{spec['name']} atlas has no transparent pixels after cleanup")

    return atlas_report


def remove_checkerboard_background(image: Image.Image) -> tuple[Image.Image, int]:
    pixels = image.load()
    width, height = image.size
    visited = bytearray(width * height)
    queue: deque[tuple[int, int]] = deque()

    def enqueue_if_background(x: int, y: int) -> None:
        index = y * width + x
        if visited[index]:
            return
        r, g, b, a = pixels[x, y]
        if a > 0 and is_neutral_checker_pixel(r, g, b):
            visited[index] = 1
            queue.append((x, y))

    for x in range(width):
        enqueue_if_background(x, 0)
        enqueue_if_background(x, height - 1)
    for y in range(height):
        enqueue_if_background(0, y)
        enqueue_if_background(width - 1, y)

    removed = 0
    while queue:
        x, y = queue.popleft()
        r, g, b, _a = pixels[x, y]
        pixels[x, y] = (r, g, b, 0)
        removed += 1

        for nx, ny in ((x - 1, y), (x + 1, y), (x, y - 1), (x, y + 1)):
            if 0 <= nx < width and 0 <= ny < height:
                enqueue_if_background(nx, ny)

    return image, removed


def is_neutral_checker_pixel(r: int, g: int, b: int) -> bool:
    brightest = max(r, g, b)
    darkest = min(r, g, b)
    return brightest >= 176 and brightest - darkest <= 42


def count_transparent_pixels(image: Image.Image) -> int:
    return image.getchannel("A").histogram()[0]


def count_border_connected_checkerboard_pixels(image: Image.Image) -> int:
    pixels = image.load()
    width, height = image.size
    visited = bytearray(width * height)
    queue: deque[tuple[int, int]] = deque()

    def enqueue_if_background(x: int, y: int) -> None:
        index = y * width + x
        if visited[index]:
            return
        r, g, b, alpha = pixels[x, y]
        if alpha > 230 and is_neutral_checker_pixel(r, g, b):
            visited[index] = 1
            queue.append((x, y))

    for x in range(width):
        enqueue_if_background(x, 0)
        enqueue_if_background(x, height - 1)
    for y in range(height):
        enqueue_if_background(0, y)
        enqueue_if_background(width - 1, y)

    total = 0
    while queue:
        x, y = queue.popleft()
        total += 1
        for nx, ny in ((x - 1, y), (x + 1, y), (x, y - 1), (x, y + 1)):
            if 0 <= nx < width and 0 <= ny < height:
                enqueue_if_background(nx, ny)
    return total


def prepare_background() -> dict[str, Any]:
    source_path = RAW_ROOT / "desert.png.png"
    if not source_path.exists():
        raise FileNotFoundError(f"Missing source image: {source_path}")

    image = Image.open(source_path).convert("RGBA")
    target_size = (1920, 1080)
    background = cover_resize(image, target_size)
    output_dir = OUTPUT_ROOT / "backgrounds" / "desert-arena"
    output_dir.mkdir(parents=True, exist_ok=True)
    output_path = output_dir / "day.png"
    background.save(output_path)
    return {
        "source": repo_path(source_path),
        "sourceSize": list(image.size),
        "path": repo_path(output_path),
        "size": list(background.size),
        "normalizedTo16x9": True,
    }


def cover_resize(image: Image.Image, target_size: tuple[int, int]) -> Image.Image:
    target_width, target_height = target_size
    source_width, source_height = image.size
    source_aspect = source_width / source_height
    target_aspect = target_width / target_height

    if source_aspect > target_aspect:
        crop_height = source_height
        crop_width = round(crop_height * target_aspect)
    else:
        crop_width = source_width
        crop_height = round(crop_width / target_aspect)

    left = (source_width - crop_width) // 2
    top = (source_height - crop_height) // 2
    cropped = image.crop((left, top, left + crop_width, top + crop_height))
    return cropped.resize(target_size, Image.Resampling.LANCZOS)


def repo_path(path: Path) -> str:
    return path.relative_to(GAME_ROOT).as_posix()


if __name__ == "__main__":
    raise SystemExit(main())
