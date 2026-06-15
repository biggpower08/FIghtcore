#!/usr/bin/env python3
"""Prepare provided Fightcore source art for the browser game.

The source images are AI-produced sprite sheets, not guaranteed grid atlases.
This script detects rows and frame groups from foreground occupancy, then emits
variable-width animation strips plus exact per-frame metadata for the renderer.
"""

from __future__ import annotations

import json
from collections import deque
from dataclasses import dataclass
from pathlib import Path
from typing import Any

from PIL import Image


GAME_ROOT = Path(__file__).resolve().parents[1]
RAW_ROOT = GAME_ROOT / "tools" / "raw-fightcore-assets"
OUTPUT_ROOT = GAME_ROOT / "public" / "assets" / "fightcore"
QA_REPORT_PATH = OUTPUT_ROOT / "asset-prep-report.json"
GENERATED_METADATA_TS = GAME_ROOT / "src" / "data" / "fightcoreGeneratedFrameMetadata.ts"

NORMALIZED_FRAME_HEIGHT = 96
BASELINE_Y = 88
ALPHA_THRESHOLD = 24
ROW_GAP_MERGE_PX = 8
FRAME_GAP_MERGE_PX = 12
FRAME_PADDING_PX = 6
MAX_FRAME_CONTENT_HEIGHT = 88
MIN_POSE_BAND_WIDTH_PX = 20
NORMAL_FRAME_WIDE_WARNING_PX = 170


@dataclass
class Bounds:
    left: int
    top: int
    right: int
    bottom: int

    @property
    def width(self) -> int:
        return self.right - self.left + 1

    @property
    def height(self) -> int:
        return self.bottom - self.top + 1

    @property
    def area(self) -> int:
        return self.width * self.height

    def expanded(self, padding: int, max_width: int, max_height: int) -> "Bounds":
        return Bounds(
            max(0, self.left - padding),
            max(0, self.top - padding),
            min(max_width - 1, self.right + padding),
            min(max_height - 1, self.bottom + padding),
        )


@dataclass
class Component:
    bounds: Bounds
    pixels: int

SPRITE_SPECS = [
    {
        "name": "Cyber Ninja",
        "source": "Cyber.ninja.png.png",
        "output_dir": OUTPUT_ROOT / "sprites" / "cyber-ninja",
        "entity_id": "cyber-ninja",
        "sheet_id": "fightcore-cyber-ninja-atlas",
        "icon_from_animation": "idle",
        "rows": [
            ("idle", 0, 4, True, 8),
            ("walk", 1, 6, True, 10),
            ("dash", 2, 5, False, 14),
            ("jab", 3, 5, False, 16),
            ("slice", 4, 6, False, 14),
            ("high-kick", 5, 7, False, 13),
            ("hit-react", 6, 3, False, 12),
            ("recovery", 7, 5, False, 8),
            ("standup", 8, 6, False, 8),
        ],
        "explicit_animations": [
            ("side-kick", "cyber.ninja.sidekick.png", 6, False, 13),
        ],
    },
    {
        "name": "Monkey Grunt",
        "source": "monkey.grunt.png.png",
        "output_dir": OUTPUT_ROOT / "sprites" / "monkey-grunt",
        "entity_id": "monkey-grunt",
        "sheet_id": "fightcore-monkey-grunt-atlas",
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
    {
        "name": "Shadow Striker",
        "source": "shadow-striker.png.png",
        "output_dir": OUTPUT_ROOT / "sprites" / "shadow-striker",
        "entity_id": "shadow-striker",
        "sheet_id": "fightcore-shadow-striker-atlas",
        "icon_source": "shadow-striker-idle.png.png",
        "logo_source": "Shadow-Striker-logo.png.png",
        "rows": [
            ("idle", 0, None, True, 8),
            ("walk", 1, None, True, 10),
            ("dash", 2, None, False, 14),
            ("roundhouse-kick", 3, None, False, 13),
            ("teep-kick", 4, None, False, 13),
            ("cross", 5, None, False, 14),
            ("jab", 6, None, False, 16),
            ("hit-react", 7, None, False, 12),
            ("recovery", 8, None, False, 8),
        ],
    },
    {
        "name": "Cyber Monkey Scrapper",
        "source": "Cyber-Scrapper.png",
        "output_dir": OUTPUT_ROOT / "sprites" / "striker-monkey",
        "entity_id": "striker-monkey",
        "sheet_id": "fightcore-striker-monkey-atlas",
        "rows": [
            ("idle", 0, None, True, 8),
            ("run", 1, None, True, 12),
            ("jab", 2, None, False, 14),
            ("cross", 3, None, False, 14),
            ("hook", 4, None, False, 13),
            ("round-kick", 5, None, False, 12),
            ("hit-react", 6, None, False, 12),
            ("knockdown", 7, None, False, 8),
            ("death", 8, None, False, 8),
        ],
    },
    {
        "name": "Cyber Monkey Grappler",
        "source": "Cyber-Grappler.png",
        "output_dir": OUTPUT_ROOT / "sprites" / "cyber-monkey-grappler",
        "entity_id": "cyber-monkey-grappler",
        "sheet_id": "fightcore-cyber-monkey-grappler-atlas",
        "rows": [
            ("idle", 0, None, True, 8),
            ("run", 1, None, True, 11),
            ("charge", 2, None, False, 10),
            ("dash", 3, None, False, 14),
            ("ground-slam", 4, None, False, 10),
            ("seoi-nage", 5, None, False, 10),
            ("armbar", 6, None, False, 8),
            ("o-goshi", 7, None, False, 9),
            ("guillotine", 8, None, False, 8),
            ("death", 9, None, False, 8),
        ],
        "embedded_target_animations": {
            "ground_slam": True,
            "seoi_nage": True,
            "armbar": True,
            "o_goshi": True,
            "guillotine": True,
        },
    },
    {
        "name": "Puppetmaster",
        "source": "puppetmaster.png",
        "output_dir": OUTPUT_ROOT / "sprites" / "puppetmaster",
        "entity_id": "puppetmaster",
        "sheet_id": "fightcore-puppetmaster-atlas",
        "icon_source": "Puppetmaster-idle.png",
        "logo_source": "puppetmaster-icon.png",
        "detect_all_rows": True,
        "rows": [
            ("idle", 0, None, True, 8),
            ("walk", 1, None, True, 10),
            ("dash", 2, None, False, 14),
            ("hit-react", 7, None, False, 12),
            ("recovery", 8, None, False, 8),
            ("standup", 9, None, False, 8),
        ],
        "explicit_animations": [
            ("double-leg-shot", "puppetmaster-double-leg.png", None, False, 10),
            ("o-goshi", "puppetmaster-hip-throw-o-goshi.png", None, False, 9),
            ("armbar", "puppetmaster-armbar.png", None, False, 8),
            ("duck-under-mat-return-slam", "puppetmaster-duck-under--mat-return.png", None, False, 8),
        ],
        "embedded_target_animations": {
            "double_leg_shot": True,
            "o_goshi": True,
            "armbar": True,
            "duck_under_mat_return_slam": True,
        },
    },
    {
        "name": "Combat Monk",
        "source": "Combat-monk.png",
        "output_dir": OUTPUT_ROOT / "sprites" / "combat-monk",
        "entity_id": "combat-monk",
        "sheet_id": "fightcore-combat-monk-atlas",
        "icon_source": "Combat-monk-idle.png",
        "logo_source": "COmbat-monk-logo.png",
        "detect_all_rows": True,
        "rows": [
            ("idle", 0, None, True, 8),
            ("walk", 1, None, True, 10),
            ("dash", 2, None, False, 14),
            ("palm-strike", 3, None, False, 14),
            ("high-kick", 4, None, False, 13),
            ("spinning-sweep", 5, None, False, 12),
            ("standing-shoulder-lock", 6, None, False, 10),
            ("hit-react", 7, None, False, 12),
            ("recovery", 7, None, False, 8),
            ("meditation", 8, None, True, 6),
            ("standup", 9, None, False, 8),
        ],
    },
]


def main() -> int:
    report: dict[str, Any] = {"sprites": [], "background": {}, "errors": []}
    generated_metadata: list[dict[str, Any]] = []

    for spec in SPRITE_SPECS:
        try:
            sprite_report, sprite_metadata = prepare_sprite_sheet(spec)
            report["sprites"].append(sprite_report)
            generated_metadata.extend(sprite_metadata)
        except Exception as exc:  # noqa: BLE001 - command-line asset prep should report all failures.
            report["errors"].append(f"{spec['name']}: {exc}")

    try:
        report["background"] = prepare_background()
    except Exception as exc:  # noqa: BLE001
        report["errors"].append(f"desert background: {exc}")

    QA_REPORT_PATH.parent.mkdir(parents=True, exist_ok=True)
    QA_REPORT_PATH.write_text(json.dumps(report, indent=2) + "\n", encoding="utf-8")
    if not report["errors"]:
        write_generated_metadata(generated_metadata)
    print(f"QA report: {QA_REPORT_PATH}")

    if report["errors"]:
        for error in report["errors"]:
            print(f"ERROR: {error}")
        return 1

    print("Fightcore asset prep complete.")
    return 0


def prepare_sprite_sheet(spec: dict[str, Any]) -> tuple[dict[str, Any], list[dict[str, Any]]]:
    source_path = RAW_ROOT / spec["source"]
    if not source_path.exists():
        raise FileNotFoundError(f"Missing source image: {source_path}")

    source = Image.open(source_path).convert("RGBA")
    cleaned, transparent_pixels = remove_checkerboard_background(source)
    detect_all_rows = spec.get("detect_all_rows", False)
    detected_row_bounds = detect_row_bounds(cleaned, None if detect_all_rows else len(spec["rows"]))
    if detect_all_rows:
        row_bounds = detected_row_bounds
        row_alignment_warnings = []
    else:
        row_bounds, row_alignment_warnings = align_row_bounds(detected_row_bounds, len(spec["rows"]), spec.get("row_fallbacks", {}))

    output_dir: Path = spec["output_dir"]
    output_dir.mkdir(parents=True, exist_ok=True)
    for old_strip in output_dir.glob("*-strip.png"):
        old_strip.unlink()
    atlas_path = output_dir / "atlas.png"
    metadata_path = output_dir / "metadata.json"

    atlas_report: dict[str, Any] = {
        "name": spec["name"],
        "entityId": spec["entity_id"],
        "source": repo_path(source_path),
        "sourceSize": list(source.size),
        "atlas": repo_path(atlas_path),
        "transparentPixelsBeforeResize": transparent_pixels,
        "detectedRows": [bounds_report(bounds) for bounds in row_bounds],
        "strips": [],
        "warnings": row_alignment_warnings,
    }
    prepare_still_assets(spec, output_dir, atlas_report)
    animation_outputs: list[tuple[int, Image.Image]] = []
    sprite_metadata: list[dict[str, Any]] = []
    json_metadata: dict[str, Any] = {
        "entityId": spec["entity_id"],
        "sheetId": spec["sheet_id"],
        "frameHeight": NORMALIZED_FRAME_HEIGHT,
        "baselineY": BASELINE_Y,
        "embeddedTargetAnimations": spec.get("embedded_target_animations", {}),
        "animations": {},
    }

    for animation, row_index, frame_count, loop, fps in spec["rows"]:
        row_bound = row_bounds[row_index]
        animation_key = animation.replace("-", "_")
        allow_multi_subject = bool(spec.get("embedded_target_animations", {}).get(animation_key))
        animation_result = prepare_animation_strip(cleaned, row_bound, output_dir, animation, frame_count, loop, fps, allow_multi_subject)
        record_animation_result(spec, animation_result, row_index, sprite_metadata, json_metadata, atlas_report, animation_outputs)
        if animation == spec.get("icon_from_animation") and animation_result["frameImages"]:
            icon_path = output_dir / "icon-full-body.png"
            animation_result["frameImages"][0].save(icon_path)
            atlas_report["icon"] = repo_path(icon_path)

    for explicit_index, (animation, explicit_source, frame_count, loop, fps) in enumerate(spec.get("explicit_animations", [])):
        explicit_path = RAW_ROOT / explicit_source
        if not explicit_path.exists():
            raise FileNotFoundError(f"Missing explicit animation source image: {explicit_path}")
        explicit_image = Image.open(explicit_path).convert("RGBA")
        cleaned_explicit, explicit_transparent_pixels = remove_checkerboard_background(explicit_image)
        row_bound = tight_bounds_for_band(cleaned_explicit, Bounds(0, 0, cleaned_explicit.width - 1, cleaned_explicit.height - 1))
        if not row_bound:
            raise ValueError(f"No foreground detected in explicit animation source: {explicit_path}")
        animation_key = animation.replace("-", "_")
        allow_multi_subject = bool(spec.get("embedded_target_animations", {}).get(animation_key))
        animation_result = prepare_animation_strip(cleaned_explicit, row_bound, output_dir, animation, frame_count, loop, fps, allow_multi_subject)
        animation_result["report"]["source"] = repo_path(explicit_path)
        animation_result["report"]["sourceSize"] = list(explicit_image.size)
        animation_result["report"]["transparentPixelsBeforeResize"] = explicit_transparent_pixels
        record_animation_result(
            spec,
            animation_result,
            len(spec["rows"]) + explicit_index,
            sprite_metadata,
            json_metadata,
            atlas_report,
            animation_outputs,
        )

    atlas_width = max((strip.width for _row_index, strip in animation_outputs), default=NORMALIZED_FRAME_HEIGHT)
    atlas_height = (max((row_index for row_index, _strip in animation_outputs), default=0) + 1) * NORMALIZED_FRAME_HEIGHT
    atlas = Image.new("RGBA", (atlas_width, atlas_height), (0, 0, 0, 0))
    for row_index, strip in animation_outputs:
        atlas.paste(strip, (0, row_index * NORMALIZED_FRAME_HEIGHT), strip)
    atlas.save(atlas_path)
    metadata_path.write_text(json.dumps(json_metadata, indent=2) + "\n", encoding="utf-8")
    atlas_report["atlasSize"] = list(atlas.size)
    atlas_report["metadata"] = repo_path(metadata_path)
    atlas_report["transparentPixelsAfterResize"] = count_transparent_pixels(atlas)
    atlas_report["remainingBorderConnectedCheckerboardPixels"] = count_border_connected_checkerboard_pixels(atlas)

    if atlas_report["transparentPixelsAfterResize"] <= 0:
        raise ValueError(f"{spec['name']} atlas has no transparent pixels after cleanup")

    return atlas_report, sprite_metadata


def prepare_still_assets(spec: dict[str, Any], output_dir: Path, atlas_report: dict[str, Any]) -> None:
    still_assets = [
        ("icon_source", "icon-full-body.png", "icon"),
        ("logo_source", "logo-emblem.png", "logo"),
    ]
    for source_key, output_name, report_key in still_assets:
        source_name = spec.get(source_key)
        if not source_name:
            continue
        source_path = RAW_ROOT / source_name
        if not source_path.exists():
            raise FileNotFoundError(f"Missing still asset source image: {source_path}")
        image = Image.open(source_path).convert("RGBA")
        cleaned, transparent_pixels = remove_checkerboard_background(image)
        content = tight_bounds_for_band(cleaned, Bounds(0, 0, cleaned.width - 1, cleaned.height - 1))
        if content:
            cleaned = cleaned.crop((content.left, content.top, content.right + 1, content.bottom + 1))
        output_path = output_dir / output_name
        cleaned.save(output_path)
        atlas_report[report_key] = {
            "path": repo_path(output_path),
            "source": repo_path(source_path),
            "sourceSize": list(image.size),
            "size": list(cleaned.size),
            "transparentPixelsBeforeCrop": transparent_pixels,
        }


def prepare_animation_strip(
    image: Image.Image,
    row_bound: Bounds,
    output_dir: Path,
    animation: str,
    frame_count: int | None,
    loop: bool,
    fps: int,
    allow_multi_subject: bool,
) -> dict[str, Any]:
    detected_frames, row_warnings = detect_frame_bounds(image, row_bound, frame_count, allow_multi_subject)
    normalized_frames = []
    frame_reports = []
    metadata_frames = []
    cursor_x = 0
    for frame_index, frame_bound in enumerate(detected_frames):
        frame_image, normalize_report = normalize_frame(image, frame_bound)
        frame_analysis = analyze_normalized_frame(frame_image, allow_multi_subject)
        normalized_frames.append(frame_image)
        metadata_frame = {
            "x": cursor_x,
            "w": frame_image.width,
            "h": frame_image.height,
            "anchorX": round(frame_image.width / 2),
            "anchorY": BASELINE_Y,
            "componentCount": frame_analysis["componentCount"],
            "allowMultiSubjectFrame": allow_multi_subject,
            "suspiciousMultiPose": frame_analysis["suspiciousMultiPose"],
        }
        metadata_frames.append(metadata_frame)
        frame_reports.append({"index": frame_index, "sourceBounds": bounds_report(frame_bound), **normalize_report, **frame_analysis})
        cursor_x += frame_image.width

    strip_width = max(1, cursor_x)
    strip = Image.new("RGBA", (strip_width, NORMALIZED_FRAME_HEIGHT), (0, 0, 0, 0))
    cursor_x = 0
    for frame_image in normalized_frames:
        strip.paste(frame_image, (cursor_x, 0), frame_image)
        cursor_x += frame_image.width

    strip_path = output_dir / f"{animation}-strip.png"
    strip.save(strip_path)
    animation_key = animation.replace("-", "_")
    metadata = {
        "animationKey": animation_key,
        "stripPath": f"{animation}-strip.png",
        "frameHeight": NORMALIZED_FRAME_HEIGHT,
        "frameCount": len(metadata_frames),
        "expectedFrameCount": frame_count,
        "fps": fps,
        "loop": loop,
        "embeddedTarget": allow_multi_subject,
        "allowMultiSubjectFrame": allow_multi_subject,
        "frames": metadata_frames,
    }
    report = {
        "animation": animation_key,
        "path": repo_path(strip_path),
        "size": list(strip.size),
        "frameCount": len(metadata_frames),
        "detectedFrameCount": len(detected_frames),
        "fps": fps,
        "loop": loop,
        "allowMultiSubjectFrame": allow_multi_subject,
        "passedDimensions": strip.height == NORMALIZED_FRAME_HEIGHT and strip.width == sum(frame["w"] for frame in metadata_frames),
        "rowBounds": bounds_report(row_bound),
        "frames": frame_reports,
        "metadata": metadata_frames,
        "warnings": row_warnings,
    }
    return {
        "strip": strip,
        "metadata": metadata,
        "report": report,
        "warnings": row_warnings,
        "frameImages": normalized_frames,
    }


def record_animation_result(
    spec: dict[str, Any],
    animation_result: dict[str, Any],
    atlas_row_index: int,
    sprite_metadata: list[dict[str, Any]],
    json_metadata: dict[str, Any],
    atlas_report: dict[str, Any],
    animation_outputs: list[tuple[int, Image.Image]],
) -> None:
    metadata = {
        "entityId": spec["entity_id"],
        "sheetId": spec["sheet_id"],
        **animation_result["metadata"],
    }
    if spec.get("embedded_target_animations", {}).get(metadata["animationKey"]):
        metadata["embeddedTarget"] = True
        metadata["hideTargetSprite"] = True
        metadata["allowMultiSubjectFrame"] = True
        metadata["targetSuppressionStartFrame"] = 0
        metadata["targetSuppressionEndFrame"] = max(0, metadata["frameCount"] - 1)
    sprite_metadata.append(metadata)
    json_metadata["animations"][metadata["animationKey"]] = metadata
    if animation_result["warnings"]:
        atlas_report["warnings"].extend(f"{metadata['animationKey']}: {warning}" for warning in animation_result["warnings"])
    atlas_report["strips"].append(animation_result["report"])
    animation_outputs.append((atlas_row_index, animation_result["strip"]))


def detect_row_bounds(image: Image.Image, expected_rows: int | None) -> list[Bounds]:
    width, height = image.size
    alpha = image.getchannel("A")
    row_counts = []
    for y in range(height):
        count = 0
        for x in range(width):
            if alpha.getpixel((x, y)) > ALPHA_THRESHOLD:
                count += 1
        row_counts.append(count)

    bands = bands_from_counts(row_counts, min_count=8, merge_gap=ROW_GAP_MERGE_PX)
    bounds = [tight_bounds_for_band(image, Bounds(0, top, width - 1, bottom)) for top, bottom in bands]
    bounds = [bound for bound in bounds if bound and bound.height >= 24 and alpha_pixels_in_bounds(image, bound) >= 180]

    if expected_rows is not None and len(bounds) > expected_rows:
        bounds = sorted(bounds, key=lambda bound: (-alpha_pixels_in_bounds(image, bound), bound.top))[:expected_rows]

    return sorted(bounds, key=lambda bound: bound.top)


def align_row_bounds(detected: list[Bounds], expected_rows: int, row_fallbacks: dict[int, int]) -> tuple[list[Bounds], list[str]]:
    warnings: list[str] = []
    aligned = list(detected)

    if len(aligned) < expected_rows:
        warnings.append(f"detected {len(aligned)} animation rows, expected {expected_rows}; duplicating configured nearest row fallback(s)")
        for target_index, source_index in sorted(row_fallbacks.items()):
            if len(aligned) >= expected_rows:
                break
            if source_index >= len(aligned):
                continue
            aligned.insert(target_index, aligned[source_index])
            warnings.append(f"row {target_index} uses detected row {source_index} as a temporary fallback")

    while aligned and len(aligned) < expected_rows:
        aligned.append(aligned[-1])
        warnings.append(f"row {len(aligned) - 1} duplicates the previous detected row as a temporary fallback")

    if len(aligned) < expected_rows:
        raise ValueError(f"Detected {len(detected)} sprite rows; expected {expected_rows}.")

    if len(aligned) > expected_rows:
        warnings.append(f"detected {len(aligned)} animation rows after alignment, keeping first {expected_rows}")
        aligned = aligned[:expected_rows]

    return aligned, warnings


def detect_frame_bounds(
    image: Image.Image,
    row_bound: Bounds,
    expected_frames: int | None,
    allow_multi_subject: bool,
) -> tuple[list[Bounds], list[str]]:
    warnings: list[str] = []
    search_bounds = row_bound.expanded(FRAME_PADDING_PX, image.width, image.height)
    components = [
        component
        for component in connected_components(image, search_bounds)
        if component.pixels >= 80 and component.bounds.width >= 6 and component.bounds.height >= 6
    ]
    frame_bounds = merge_frame_components(components, expected_frames) if allow_multi_subject else detect_pose_bands(image, row_bound)
    if not allow_multi_subject and len(frame_bounds) > 0:
        component_frame_count = len(merge_frame_components(components, expected_frames))
        if len(frame_bounds) > component_frame_count:
            warnings.append(
                f"column-band splitter separated {len(frame_bounds)} pose group(s) from {component_frame_count} connected component group(s)"
            )
    if expected_frames is not None:
        frame_bounds = merge_until_expected(frame_bounds, expected_frames)
    frame_bounds = sorted(frame_bounds, key=lambda bound: bound.left)

    if expected_frames is not None and len(frame_bounds) > expected_frames:
        extras = len(frame_bounds) - expected_frames
        warnings.append(f"detected {len(frame_bounds)} frame groups, keeping the leftmost {expected_frames} and dropping {extras} extra group(s)")
        frame_bounds = frame_bounds[:expected_frames]

    if expected_frames is not None and len(frame_bounds) < expected_frames:
        warnings.append(f"detected only {len(frame_bounds)} frame group(s), duplicating nearest valid pose to reach {expected_frames}")
        while frame_bounds and len(frame_bounds) < expected_frames:
            frame_bounds.append(frame_bounds[-1])

    if not frame_bounds:
        raise ValueError(f"No frames detected for row {bounds_report(row_bound)}")

    return frame_bounds, warnings


def detect_pose_bands(image: Image.Image, row_bound: Bounds) -> list[Bounds]:
    search_bounds = row_bound.expanded(FRAME_PADDING_PX, image.width, image.height)
    alpha = image.getchannel("A")
    min_count = max(8, round(search_bounds.height * 0.12))
    column_counts = []
    for x in range(search_bounds.left, search_bounds.right + 1):
        count = 0
        for y in range(search_bounds.top, search_bounds.bottom + 1):
            if alpha.getpixel((x, y)) > ALPHA_THRESHOLD:
                count += 1
        column_counts.append(count)

    bands = bands_from_counts(column_counts, min_count=min_count, merge_gap=FRAME_GAP_MERGE_PX)
    bounds = []
    for left, right in bands:
        if right - left + 1 < 4:
            continue
        bound = tight_bounds_for_band(image, Bounds(search_bounds.left + left, search_bounds.top, search_bounds.left + right, search_bounds.bottom))
        if bound and alpha_pixels_in_bounds(image, bound) >= 120:
            bounds.append(bound)

    bounds = merge_tiny_pose_bands(bounds)
    if not bounds:
        bounds = merge_frame_components(
            [
                component
                for component in connected_components(image, search_bounds)
                if component.pixels >= 80 and component.bounds.width >= 6 and component.bounds.height >= 6
            ],
            None,
        )

    return sorted(bounds, key=lambda bound: bound.left)


def merge_tiny_pose_bands(bounds: list[Bounds]) -> list[Bounds]:
    merged: list[Bounds] = []
    for bound in sorted(bounds, key=lambda item: item.left):
        if bound.width >= MIN_POSE_BAND_WIDTH_PX or not merged:
            merged.append(bound)
            continue
        previous = merged[-1]
        gap_to_previous = bound.left - previous.right
        if gap_to_previous <= FRAME_GAP_MERGE_PX * 2:
            merged[-1] = union_bounds(previous, bound)
        else:
            merged.append(bound)

    index = 0
    while index < len(merged):
        bound = merged[index]
        if bound.width >= MIN_POSE_BAND_WIDTH_PX or len(merged) == 1:
            index += 1
            continue
        if index == 0:
            merged[0:2] = [union_bounds(merged[0], merged[1])]
        else:
            merged[index - 1 : index + 1] = [union_bounds(merged[index - 1], merged[index])]
            index -= 1
    return merged


def connected_components(image: Image.Image, search_bounds: Bounds) -> list[Component]:
    pixels = image.load()
    width = search_bounds.width
    height = search_bounds.height
    visited = bytearray(width * height)
    components: list[Component] = []

    def local_index(x: int, y: int) -> int:
        return (y - search_bounds.top) * width + (x - search_bounds.left)

    for y in range(search_bounds.top, search_bounds.bottom + 1):
        for x in range(search_bounds.left, search_bounds.right + 1):
            index = local_index(x, y)
            if visited[index] or pixels[x, y][3] <= ALPHA_THRESHOLD:
                continue

            queue: deque[tuple[int, int]] = deque([(x, y)])
            visited[index] = 1
            min_x = max_x = x
            min_y = max_y = y
            pixel_count = 0

            while queue:
                cx, cy = queue.popleft()
                pixel_count += 1
                min_x = min(min_x, cx)
                min_y = min(min_y, cy)
                max_x = max(max_x, cx)
                max_y = max(max_y, cy)

                for nx, ny in ((cx - 1, cy), (cx + 1, cy), (cx, cy - 1), (cx, cy + 1)):
                    if nx < search_bounds.left or nx > search_bounds.right or ny < search_bounds.top or ny > search_bounds.bottom:
                        continue
                    next_index = local_index(nx, ny)
                    if visited[next_index] or pixels[nx, ny][3] <= ALPHA_THRESHOLD:
                        continue
                    visited[next_index] = 1
                    queue.append((nx, ny))

            components.append(Component(Bounds(min_x, min_y, max_x, max_y), pixel_count))

    return components


def merge_frame_components(components: list[Component], expected_frames: int | None) -> list[Bounds]:
    if not components:
        return []

    candidates = [component for component in components if component.pixels >= 220 or component.bounds.height >= 24]
    if expected_frames is not None and len(candidates) < expected_frames:
        candidates = sorted(components, key=lambda component: component.pixels, reverse=True)[:expected_frames]

    bounds = sorted([component.bounds for component in candidates], key=lambda bound: bound.left)
    bounds = merge_close_bounds(bounds, max_gap=FRAME_GAP_MERGE_PX)

    if expected_frames is None:
        return bounds

    while len(bounds) > expected_frames:
        gaps = [
            (bounds[index + 1].left - bounds[index].right, index)
            for index in range(len(bounds) - 1)
        ]
        _gap, index = min(gaps, key=lambda item: item[0])
        bounds[index : index + 2] = [union_bounds(bounds[index], bounds[index + 1])]

    return bounds


def merge_close_bounds(bounds: list[Bounds], max_gap: int) -> list[Bounds]:
    if not bounds:
        return []
    merged = [bounds[0]]
    for bound in bounds[1:]:
        previous = merged[-1]
        gap = bound.left - previous.right
        vertical_overlap = min(previous.bottom, bound.bottom) - max(previous.top, bound.top)
        if gap <= max_gap and vertical_overlap >= -8:
            merged[-1] = union_bounds(previous, bound)
        else:
            merged.append(bound)
    return merged


def union_bounds(left: Bounds, right: Bounds) -> Bounds:
    return Bounds(
        min(left.left, right.left),
        min(left.top, right.top),
        max(left.right, right.right),
        max(left.bottom, right.bottom),
    )


def normalize_frame(image: Image.Image, frame_bound: Bounds) -> tuple[Image.Image, dict[str, Any]]:
    padded = frame_bound.expanded(FRAME_PADDING_PX, image.width, image.height)
    crop = image.crop((padded.left, padded.top, padded.right + 1, padded.bottom + 1))
    content = tight_bounds_for_band(crop, Bounds(0, 0, crop.width - 1, crop.height - 1))
    if content:
        crop = crop.crop((content.left, content.top, content.right + 1, content.bottom + 1))

    scale = min(1.0, MAX_FRAME_CONTENT_HEIGHT / crop.height)
    if scale < 1.0:
        crop = crop.resize((max(1, round(crop.width * scale)), max(1, round(crop.height * scale))), Image.Resampling.LANCZOS)

    frame = Image.new("RGBA", (crop.width, NORMALIZED_FRAME_HEIGHT), (0, 0, 0, 0))
    y = BASELINE_Y - crop.height
    if y < 0:
        y = 0
    frame.paste(crop, (0, y), crop)

    return frame, {
        "normalizedSize": [crop.width, crop.height],
        "frameSize": [frame.width, frame.height],
        "cellOffset": [0, y],
        "anchorX": round(frame.width / 2),
        "anchorY": BASELINE_Y,
        "baselineY": BASELINE_Y,
        "scaledDown": scale < 1.0,
    }


def analyze_normalized_frame(frame: Image.Image, allow_multi_subject: bool) -> dict[str, Any]:
    bounds = tight_bounds_for_band(frame, Bounds(0, 0, frame.width - 1, frame.height - 1))
    components = [
        component
        for component in connected_components(frame, Bounds(0, 0, frame.width - 1, frame.height - 1))
        if component.pixels >= 140 and component.bounds.width >= 10 and component.bounds.height >= 16
    ]
    component_reports = [
        {"bounds": bounds_report(component.bounds), "pixels": component.pixels}
        for component in sorted(components, key=lambda component: component.bounds.left)
    ]
    separated_major_components = count_separated_major_components(components)
    suspicious_width = bool(bounds and bounds.width > NORMAL_FRAME_WIDE_WARNING_PX and not allow_multi_subject)
    suspicious_multi_pose = bool(not allow_multi_subject and (separated_major_components >= 2 or suspicious_width))
    warnings = []
    if suspicious_width:
        warnings.append(f"frame alpha bounds width {bounds.width} exceeds normal single-body warning width {NORMAL_FRAME_WIDE_WARNING_PX}")
    if not allow_multi_subject and separated_major_components >= 2:
        warnings.append(f"frame has {separated_major_components} separated major component(s)")

    return {
        "alphaBounds": bounds_report(bounds) if bounds else None,
        "componentCount": len(components),
        "separatedMajorComponentCount": separated_major_components,
        "components": component_reports,
        "allowMultiSubjectFrame": allow_multi_subject,
        "wasAllowedMultiSubject": allow_multi_subject,
        "suspiciousWidth": suspicious_width,
        "suspiciousMultiPose": suspicious_multi_pose,
        "warnings": warnings,
    }


def count_separated_major_components(components: list[Component]) -> int:
    major = sorted(
        [
            component
            for component in components
            if component.bounds.height >= 40 and component.bounds.width >= 24 and component.pixels >= 400
        ],
        key=lambda component: component.bounds.left,
    )
    if not major:
        return 0

    separated = 1
    previous = major[0]
    for component in major[1:]:
        gap = component.bounds.left - previous.bounds.right
        vertical_overlap = min(previous.bounds.bottom, component.bounds.bottom) - max(previous.bounds.top, component.bounds.top)
        if gap >= 12 and vertical_overlap >= 12:
            separated += 1
        previous = component
    return separated


def bands_from_counts(counts: list[int], min_count: int, merge_gap: int) -> list[tuple[int, int]]:
    bands: list[tuple[int, int]] = []
    start: int | None = None
    last_active: int | None = None
    for index, count in enumerate(counts):
        if count >= min_count:
            if start is None:
                start = index
            last_active = index
            continue
        if start is not None and last_active is not None and index - last_active > merge_gap:
            bands.append((start, last_active))
            start = None
            last_active = None
    if start is not None and last_active is not None:
        bands.append((start, last_active))
    return bands


def tight_bounds_for_band(image: Image.Image, bounds: Bounds) -> Bounds | None:
    pixels = image.load()
    min_x = image.width
    min_y = image.height
    max_x = -1
    max_y = -1
    for y in range(bounds.top, bounds.bottom + 1):
        for x in range(bounds.left, bounds.right + 1):
            if pixels[x, y][3] <= ALPHA_THRESHOLD:
                continue
            min_x = min(min_x, x)
            min_y = min(min_y, y)
            max_x = max(max_x, x)
            max_y = max(max_y, y)
    if max_x < min_x or max_y < min_y:
        return None
    return Bounds(min_x, min_y, max_x, max_y)


def merge_until_expected(bounds: list[Bounds], expected: int) -> list[Bounds]:
    merged = sorted(bounds, key=lambda bound: bound.left)
    while len(merged) > expected:
        gaps = [
            (merged[index + 1].left - merged[index].right, index)
            for index in range(len(merged) - 1)
        ]
        gap, index = min(gaps, key=lambda item: item[0])
        if gap > 70:
            break
        left = merged[index]
        right = merged[index + 1]
        merged[index : index + 2] = [
            Bounds(
                min(left.left, right.left),
                min(left.top, right.top),
                max(left.right, right.right),
                max(left.bottom, right.bottom),
            )
        ]
    return merged


def alpha_pixels_in_bounds(image: Image.Image, bounds: Bounds) -> int:
    pixels = image.load()
    total = 0
    for y in range(bounds.top, bounds.bottom + 1):
        for x in range(bounds.left, bounds.right + 1):
            if pixels[x, y][3] > ALPHA_THRESHOLD:
                total += 1
    return total


def bounds_report(bounds: Bounds) -> dict[str, int]:
    return {
        "left": bounds.left,
        "top": bounds.top,
        "right": bounds.right,
        "bottom": bounds.bottom,
        "width": bounds.width,
        "height": bounds.height,
    }


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


def write_generated_metadata(metadata: list[dict[str, Any]]) -> None:
    GENERATED_METADATA_TS.write_text(
        "\n".join(
            [
                "export interface FightcoreGeneratedFrame {",
                "  x: number;",
                "  w: number;",
                "  h: number;",
                "  anchorX: number;",
                "  anchorY: number;",
                "  componentCount?: number;",
                "  allowMultiSubjectFrame?: boolean;",
                "  suspiciousMultiPose?: boolean;",
                "}",
                "",
                "export interface FightcoreGeneratedAnimationMetadata {",
                "  entityId: string;",
                "  sheetId: string;",
                "  animationKey: string;",
                "  stripPath: string;",
                "  frameHeight: number;",
                "  frameCount: number;",
                "  expectedFrameCount: number | null;",
                "  fps: number;",
                "  loop: boolean;",
                "  embeddedTarget?: boolean;",
                "  allowMultiSubjectFrame?: boolean;",
                "  hideTargetSprite?: boolean;",
                "  targetSuppressionStartFrame?: number;",
                "  targetSuppressionEndFrame?: number;",
                "  frames: FightcoreGeneratedFrame[];",
                "}",
                "",
                "export const fightcoreGeneratedFrameMetadata: FightcoreGeneratedAnimationMetadata[] = "
                + json.dumps(metadata, indent=2)
                + ";",
                "",
            ]
        ),
        encoding="utf-8",
    )


if __name__ == "__main__":
    raise SystemExit(main())
