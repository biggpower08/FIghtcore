#!/usr/bin/env python3
"""Promote QA-approved sprites into the browser-game asset folder."""

from __future__ import annotations

import argparse
import json
import shutil
from pathlib import Path
from typing import Any


FACTORY_ROOT = Path(__file__).resolve().parents[1]
GAME_ROOT = FACTORY_ROOT.parents[1]
JOBS_PATH = FACTORY_ROOT / "sprite-jobs.json"
APPROVED_ROOT = FACTORY_ROOT / "approved"
OUTPUT_ROOT = GAME_ROOT / "public" / "assets" / "fightcore" / "sprites"


def main() -> int:
    parser = argparse.ArgumentParser(description="Promote approved Fightcore sprites into public assets.")
    target = parser.add_mutually_exclusive_group(required=True)
    target.add_argument("--job", help="Promote one job by key, for example aegis-runner.stance-loop.")
    target.add_argument("--entity", help="Promote every approved job for one entity.")
    target.add_argument("--all", action="store_true", help="Promote every approved job in the manifest.")
    parser.add_argument("--force", action="store_true", help="Overwrite existing public assets.")
    args = parser.parse_args()

    jobs = select_jobs(load_jobs(), args)
    if not jobs:
        print("No matching sprite jobs found.")
        return 1

    OUTPUT_ROOT.mkdir(parents=True, exist_ok=True)
    promoted = 0
    skipped = 0
    missing = 0

    for job in jobs:
        source = APPROVED_ROOT / job["outputPath"]
        target = OUTPUT_ROOT / job["outputPath"]
        if not source.exists():
            missing += 1
            print(f"MISSING approved asset: {job['key']} -> {source}")
            continue
        if target.exists() and not args.force:
            skipped += 1
            print(f"SKIP existing public asset: {job['key']} -> {target}")
            continue
        target.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(source, target)
        promoted += 1
        print(f"PROMOTED {job['key']} -> {target}")

    print(f"Promoted: {promoted}")
    print(f"Skipped: {skipped}")
    print(f"Missing approved: {missing}")
    return 1 if missing else 0


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


if __name__ == "__main__":
    raise SystemExit(main())
