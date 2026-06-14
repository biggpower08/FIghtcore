#!/usr/bin/env python3
"""Generate Fightcore sprite strips through a local ComfyUI server."""

from __future__ import annotations

import argparse
import json
import shutil
import time
import urllib.error
import urllib.parse
import urllib.request
import uuid
from pathlib import Path
from typing import Any


FACTORY_ROOT = Path(__file__).resolve().parents[1]
GAME_ROOT = FACTORY_ROOT.parents[1]
JOBS_PATH = FACTORY_ROOT / "sprite-jobs.json"
WORKFLOW_PATH = FACTORY_ROOT / "workflows" / "comfyui-sprite-strip-template.json"
RAW_ROOT = FACTORY_ROOT / "raw"
APPROVED_ROOT = FACTORY_ROOT / "approved"
FAILED_ROOT = FACTORY_ROOT / "failed"
MODEL_PLACEHOLDER = "PUT_PIXEL_ART_MODEL_NAME_HERE.safetensors"
DEFAULT_PREFLIGHT_JOB = "aegis-runner.stance-loop"


def main() -> int:
    parser = argparse.ArgumentParser(description="Generate Fightcore sprites with local ComfyUI.")
    target = parser.add_mutually_exclusive_group()
    target.add_argument("--job", help="Generate one job by key, for example aegis-runner.stance-loop.")
    target.add_argument("--entity", help="Generate every pending job for one entity.")
    target.add_argument("--all", action="store_true", help="Generate every pending job.")
    parser.add_argument("--preflight", action="store_true", help="Check sprite factory readiness without generating sprites.")
    parser.add_argument("--force", action="store_true", help="Regenerate even when raw or approved output already exists.")
    parser.add_argument("--comfy-url", default="http://127.0.0.1:8188", help="Local ComfyUI URL.")
    parser.add_argument("--workflow", default=str(WORKFLOW_PATH), help="ComfyUI workflow template path.")
    parser.add_argument("--timeout", type=int, default=600, help="Seconds to wait for each ComfyUI job.")
    args = parser.parse_args()

    if args.preflight:
        return run_preflight(args)

    if not (args.job or args.entity or args.all):
        parser.error("one of --job, --entity, or --all is required unless --preflight is used.")

    jobs = select_jobs(load_jobs(), args)
    if not jobs:
        print("No matching sprite jobs found.")
        return 1

    template = load_json(Path(args.workflow))
    if contains_placeholder(template, MODEL_PLACEHOLDER):
        print(
            "ERROR: Set the ComfyUI checkpoint filename in "
            f"{Path(args.workflow)} before generating sprites."
        )
        return 1

    try:
        ensure_comfyui(args.comfy_url)
    except RuntimeError as exc:
        print(f"ERROR: {exc}")
        return 1
    RAW_ROOT.mkdir(parents=True, exist_ok=True)

    failures = 0
    for job in jobs:
        raw_path = RAW_ROOT / job["outputPath"]
        approved_path = APPROVED_ROOT / job["outputPath"]
        if approved_path.exists() and not args.force:
            print(f"SKIP approved exists: {job['key']} -> {approved_path}")
            continue
        if raw_path.exists() and not args.force:
            print(f"SKIP raw exists: {job['key']} -> {raw_path}")
            continue

        try:
            workflow = fill_workflow(template, job)
            client_id = str(uuid.uuid4())
            prompt_id = queue_prompt(args.comfy_url, workflow, client_id)
            image_info = wait_for_output(args.comfy_url, prompt_id, args.timeout)
            image_bytes = download_image(args.comfy_url, image_info)
            raw_path.parent.mkdir(parents=True, exist_ok=True)
            raw_path.write_bytes(image_bytes)
            print(f"SAVED {job['key']} -> {raw_path}")
        except Exception as exc:  # noqa: BLE001 - command-line tool should report each job and continue.
            failures += 1
            print(f"FAILED {job['key']}: {exc}")

    return 1 if failures else 0


def load_jobs() -> list[dict[str, Any]]:
    jobs = load_json(JOBS_PATH)
    if not isinstance(jobs, list):
        raise ValueError(f"{JOBS_PATH} must contain a JSON array.")
    return jobs


def load_json(path: Path) -> Any:
    with path.open("r", encoding="utf-8") as file:
        return json.load(file)


def run_preflight(args: argparse.Namespace) -> int:
    checks: list[tuple[str, bool, str]] = []
    selected_job_key = args.job or DEFAULT_PREFLIGHT_JOB

    checks.append(("sprite-jobs.json exists", JOBS_PATH.exists(), str(JOBS_PATH)))
    jobs: list[dict[str, Any]] = []
    if JOBS_PATH.exists():
        try:
            jobs = load_jobs()
            jobs_ok = True
            jobs_message = f"{len(jobs)} jobs loaded"
        except Exception as exc:  # noqa: BLE001
            jobs_ok = False
            jobs_message = str(exc)
        checks.append(("sprite-jobs.json is readable JSON", jobs_ok, jobs_message))
    else:
        checks.append(("sprite-jobs.json is readable JSON", False, "missing manifest"))

    selected_job = next((job for job in jobs if job.get("key") == selected_job_key), None)
    checks.append(("selected test job exists", selected_job is not None, selected_job_key))

    workflow_path = Path(args.workflow)
    checks.append(("workflow template exists", workflow_path.exists(), str(workflow_path)))
    template: Any | None = None
    if workflow_path.exists():
        try:
            template = load_json(workflow_path)
            workflow_ok = True
            workflow_message = "workflow JSON loaded"
        except Exception as exc:  # noqa: BLE001
            workflow_ok = False
            workflow_message = str(exc)
        checks.append(("workflow template is readable JSON", workflow_ok, workflow_message))
    else:
        checks.append(("workflow template is readable JSON", False, "missing workflow template"))

    placeholder_cleared = template is not None and not contains_placeholder(template, MODEL_PLACEHOLDER)
    checks.append(("workflow checkpoint filename configured", placeholder_cleared, MODEL_PLACEHOLDER))

    for folder in (RAW_ROOT, APPROVED_ROOT, FAILED_ROOT):
        checks.append((f"{folder.name}/ folder exists", folder.exists(), str(folder)))

    try:
        ensure_comfyui(args.comfy_url, timeout=5)
        comfy_ok = True
        comfy_message = args.comfy_url
    except RuntimeError as exc:
        comfy_ok = False
        comfy_message = str(exc)
    checks.append(("ComfyUI server is reachable", comfy_ok, comfy_message))

    print("Sprite Factory Preflight")
    failed = 0
    for label, ok, message in checks:
        status = "PASS" if ok else "FAIL"
        print(f"{status}: {label} - {message}")
        if not ok:
            failed += 1
    return 1 if failed else 0


def select_jobs(jobs: list[dict[str, Any]], args: argparse.Namespace) -> list[dict[str, Any]]:
    if args.all:
        return jobs
    if args.job:
        return [job for job in jobs if job.get("key") == args.job]
    return [job for job in jobs if job.get("entity") == args.entity]


def ensure_comfyui(base_url: str, timeout: int = 30) -> None:
    try:
        request_json(f"{base_url.rstrip('/')}/system_stats", timeout=timeout)
    except Exception as exc:  # noqa: BLE001
        raise RuntimeError(
            f"Could not reach ComfyUI at {base_url}. Start ComfyUI locally, then rerun this command."
        ) from exc


def fill_workflow(template: Any, job: dict[str, Any]) -> Any:
    width = int(job["frameWidth"]) * int(job["frameCount"])
    replacements = {
        "{{PROMPT}}": job["prompt"],
        "{{NEGATIVE_PROMPT}}": job["negativePrompt"],
        "{{WIDTH}}": width,
        "{{HEIGHT}}": int(job["frameHeight"]),
        "{{FRAME_WIDTH}}": int(job["frameWidth"]),
        "{{FRAME_HEIGHT}}": int(job["frameHeight"]),
        "{{FRAME_COUNT}}": int(job["frameCount"]),
        "{{OUTPUT_PREFIX}}": f"fightcore/{job['key']}",
    }

    def replace(value: Any) -> Any:
        if isinstance(value, dict):
            return {key: replace(item) for key, item in value.items()}
        if isinstance(value, list):
            return [replace(item) for item in value]
        if isinstance(value, str):
            return replacements.get(value, value)
        return value

    return replace(template)


def contains_placeholder(value: Any, placeholder: str) -> bool:
    if isinstance(value, dict):
        return any(contains_placeholder(item, placeholder) for item in value.values())
    if isinstance(value, list):
        return any(contains_placeholder(item, placeholder) for item in value)
    return value == placeholder


def queue_prompt(base_url: str, workflow: Any, client_id: str) -> str:
    payload = {"prompt": workflow, "client_id": client_id}
    response = request_json(f"{base_url.rstrip('/')}/prompt", payload)
    prompt_id = response.get("prompt_id")
    if not prompt_id:
        raise RuntimeError(f"ComfyUI did not return a prompt_id: {response}")
    return str(prompt_id)


def wait_for_output(base_url: str, prompt_id: str, timeout: int) -> dict[str, str]:
    deadline = time.time() + timeout
    while time.time() < deadline:
        history = request_json(f"{base_url.rstrip('/')}/history/{prompt_id}")
        outputs = history.get(prompt_id, {}).get("outputs", {})
        for output in outputs.values():
            images = output.get("images", [])
            if images:
                return images[0]
        time.sleep(1)
    raise TimeoutError(f"Timed out waiting for ComfyUI prompt {prompt_id}.")


def download_image(base_url: str, image_info: dict[str, str]) -> bytes:
    query = urllib.parse.urlencode(
        {
            "filename": image_info["filename"],
            "subfolder": image_info.get("subfolder", ""),
            "type": image_info.get("type", "output"),
        }
    )
    with urllib.request.urlopen(f"{base_url.rstrip('/')}/view?{query}", timeout=60) as response:
        data = response.read()
    if not data.startswith(b"\x89PNG\r\n\x1a\n"):
        raise RuntimeError("ComfyUI output was not a PNG.")
    return data


def request_json(url: str, payload: Any | None = None, timeout: int = 30) -> Any:
    data = None if payload is None else json.dumps(payload).encode("utf-8")
    request = urllib.request.Request(url, data=data, headers={"Content-Type": "application/json"})
    with urllib.request.urlopen(request, timeout=timeout) as response:
        return json.loads(response.read().decode("utf-8"))


if __name__ == "__main__":
    raise SystemExit(main())
