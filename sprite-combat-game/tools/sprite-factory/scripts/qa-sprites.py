#!/usr/bin/env python3
"""QA Fightcore sprite-factory PNGs before promotion."""

from __future__ import annotations

import argparse
import json
import shutil
import struct
from pathlib import Path
from typing import Any


FACTORY_ROOT = Path(__file__).resolve().parents[1]
JOBS_PATH = FACTORY_ROOT / "sprite-jobs.json"
RAW_ROOT = FACTORY_ROOT / "raw"
APPROVED_ROOT = FACTORY_ROOT / "approved"
FAILED_ROOT = FACTORY_ROOT / "failed"
REPORT_PATH = FAILED_ROOT / "qa-report.json"
PNG_SIGNATURE = b"\x89PNG\r\n\x1a\n"


def main() -> int:
    parser = argparse.ArgumentParser(description="QA generated Fightcore sprite PNGs.")
    target = parser.add_mutually_exclusive_group(required=True)
    target.add_argument("--job", help="QA one job by key, for example aegis-runner.stance-loop.")
    target.add_argument("--entity", help="QA every generated job for one entity.")
    target.add_argument("--all", action="store_true", help="QA every job in the manifest.")
    parser.add_argument("--move-failed", action="store_true", help="Move failed raw assets into failed/ instead of only reporting.")
    args = parser.parse_args()

    jobs = select_jobs(load_jobs(), args)
    if not jobs:
        print("No matching sprite jobs found.")
        return 1

    APPROVED_ROOT.mkdir(parents=True, exist_ok=True)
    FAILED_ROOT.mkdir(parents=True, exist_ok=True)

    results = [check_job(job, args.move_failed) for job in jobs]
    REPORT_PATH.write_text(json.dumps(results, indent=2) + "\n", encoding="utf-8")

    passed = [result for result in results if result["status"] == "passed"]
    failed = [result for result in results if result["status"] != "passed"]
    print(f"QA passed: {len(passed)}")
    print(f"QA failed or missing: {len(failed)}")
    print(f"Report: {REPORT_PATH}")
    return 1 if failed else 0


def load_jobs() -> list[dict[str, Any]]:
    with JOBS_PATH.open("r", encoding="utf-8") as file:
        jobs = json.load(file)
    if not isinstance(jobs, list):
        raise ValueError(f"{JOBS_PATH} must contain a JSON array.")
    return jobs


def select_jobs(jobs: list[dict[str, Any]], args: argparse.Namespace) -> list[dict[str, Any]]:
    if args.all:
        return jobs
    if args.job:
        return [job for job in jobs if job.get("key") == args.job]
    return [job for job in jobs if job.get("entity") == args.entity]


def check_job(job: dict[str, Any], move_failed: bool) -> dict[str, Any]:
    raw_path = RAW_ROOT / job["outputPath"]
    approved_path = APPROVED_ROOT / job["outputPath"]
    expected_width = int(job["frameWidth"]) * int(job["frameCount"])
    expected_height = int(job["frameHeight"])
    result = {
        "key": job["key"],
        "outputPath": job["outputPath"],
        "expectedWidth": expected_width,
        "expectedHeight": expected_height,
        "status": "passed",
        "errors": [],
    }

    if not raw_path.exists():
        result["status"] = "missing"
        result["errors"].append("Missing raw PNG.")
        return result

    try:
        metadata = read_png_metadata(raw_path)
    except ValueError as exc:
        result["status"] = "failed"
        result["errors"].append(str(exc))
        maybe_move_failed(raw_path, job["outputPath"], move_failed)
        return result

    result.update(metadata)
    if metadata["width"] != expected_width:
        result["errors"].append(f"Width {metadata['width']} does not equal {expected_width}.")
    if metadata["height"] != expected_height:
        result["errors"].append(f"Height {metadata['height']} does not equal {expected_height}.")
    if not metadata["hasAlpha"]:
        result["errors"].append("PNG does not have an alpha channel or transparency chunk.")

    if result["errors"]:
        result["status"] = "failed"
        maybe_move_failed(raw_path, job["outputPath"], move_failed)
        return result

    approved_path.parent.mkdir(parents=True, exist_ok=True)
    shutil.copy2(raw_path, approved_path)
    result["approvedPath"] = str(approved_path)
    return result


def read_png_metadata(path: Path) -> dict[str, Any]:
    data = path.read_bytes()
    if not data.startswith(PNG_SIGNATURE):
        raise ValueError("File is not a PNG.")
    index = len(PNG_SIGNATURE)
    width = height = color_type = None
    has_trns = False
    while index + 8 <= len(data):
        length = struct.unpack(">I", data[index : index + 4])[0]
        chunk_type = data[index + 4 : index + 8]
        chunk_data = data[index + 8 : index + 8 + length]
        index += 12 + length
        if chunk_type == b"IHDR":
            width, height, _bit_depth, color_type, *_ = struct.unpack(">IIBBBBB", chunk_data)
        elif chunk_type == b"tRNS":
            has_trns = True
        elif chunk_type == b"IEND":
            break
    if width is None or height is None or color_type is None:
        raise ValueError("PNG is missing IHDR metadata.")
    return {
        "width": width,
        "height": height,
        "colorType": color_type,
        "hasAlpha": color_type in (4, 6) or has_trns,
    }


def maybe_move_failed(raw_path: Path, output_path: str, move_failed: bool) -> None:
    if not move_failed or not raw_path.exists():
        return
    failed_path = FAILED_ROOT / output_path
    failed_path.parent.mkdir(parents=True, exist_ok=True)
    shutil.move(str(raw_path), str(failed_path))


if __name__ == "__main__":
    raise SystemExit(main())
