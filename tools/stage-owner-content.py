#!/usr/bin/env python3
"""Create a private, publication-ready owner-content bundle.

This tool never edits the live site. It validates an APPROVED submission,
strips private approval evidence, optimizes images, and writes a checksummed
staging bundle for later preview/integration.
"""
from __future__ import annotations

import argparse
import hashlib
import json
import shutil
import subprocess
import sys
import tempfile
from datetime import datetime, timezone
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
VALIDATOR = ROOT / "tools" / "validate-owner-submission.py"
DEFAULT_BASE = Path("/home/president/Work/tacos-sinaloa-owner-staging")


def sha256(path: Path) -> str:
    h = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            h.update(chunk)
    return h.hexdigest()


def identify(path: Path) -> tuple[int, int]:
    result = subprocess.run(
        ["identify", "-format", "%w %h", str(path)],
        check=True,
        capture_output=True,
        text=True,
        timeout=10,
    )
    w, h = result.stdout.strip().split()
    return int(w), int(h)


def optimize_image(source: Path, target: Path) -> None:
    target.parent.mkdir(parents=True, exist_ok=True)
    subprocess.run(
        [
            "magick",
            str(source),
            "-auto-orient",
            "-strip",
            "-resize",
            "1800x1800>",
            "-quality",
            "82",
            str(target),
        ],
        check=True,
        timeout=60,
    )


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("submission", type=Path)
    parser.add_argument("--assets-root", type=Path, required=True)
    parser.add_argument("--output-dir", type=Path)
    parser.add_argument("--require-complete-photo-pack", action="store_true")
    args = parser.parse_args()

    data = json.loads(args.submission.read_text(encoding="utf-8"))
    submission_id = str(data.get("submission_id", "")).strip()
    if not submission_id or submission_id == "replace-me":
        print("STAGE_OWNER_CONTENT=FAIL missing submission_id", file=sys.stderr)
        return 2

    final_dir = args.output_dir or (DEFAULT_BASE / submission_id)
    final_dir = final_dir.resolve()
    repo_root = ROOT.resolve()
    if final_dir == repo_root or repo_root in final_dir.parents:
        print("STAGE_OWNER_CONTENT=FAIL output-dir must stay outside the site repository", file=sys.stderr)
        return 2

    validate_cmd = [
        sys.executable,
        str(VALIDATOR),
        str(args.submission),
        "--assets-root",
        str(args.assets_root),
        "--strict-publish",
    ]
    if args.require_complete_photo_pack:
        validate_cmd.append("--require-complete-photo-pack")

    validation = subprocess.run(validate_cmd, text=True, capture_output=True)
    if validation.stdout:
        print(validation.stdout.strip())
    if validation.returncode:
        if validation.stderr:
            print(validation.stderr.strip(), file=sys.stderr)
        print("STAGE_OWNER_CONTENT=FAIL validation", file=sys.stderr)
        return validation.returncode

    final_dir.parent.mkdir(parents=True, exist_ok=True)
    temp_dir = Path(tempfile.mkdtemp(prefix=f"{submission_id}-", dir=final_dir.parent))
    try:
        public = {
            "_schema": "tacos-sinaloa-public-owner-content-v1",
            "_submission_id": submission_id,
            "_owner_approved": True,
            "_staged_at": datetime.now(timezone.utc).isoformat().replace("+00:00", "Z"),
            "ordering": data.get("ordering", {}),
            "visit": data.get("visit", {}),
            "menu": data.get("menu", {}),
            "photos": [],
        }

        # Remove approval-only flags that have no reason to become public.
        public["ordering"].pop("owner_confirmed", None)
        public["visit"].pop("owner_confirmed", None)
        public["menu"].pop("owner_confirmed", None)

        manifest = {
            "submission_id": submission_id,
            "source_submission_sha256": sha256(args.submission),
            "generated_at": datetime.now(timezone.utc).isoformat().replace("+00:00", "Z"),
            "files": [],
        }

        assets_root = args.assets_root.resolve()
        for photo in data.get("photos", []):
            source_name = str(photo.get("file", "")).strip()
            if not source_name:
                continue
            slot = str(photo["slot"]).strip()
            source = (assets_root / source_name).resolve()
            target_rel = Path("assets") / "owner" / f"{slot}.webp"
            target = temp_dir / target_rel
            optimize_image(source, target)
            width, height = identify(target)

            public_photo = {
                "slot": slot,
                "file": str(target_rel).replace("\\", "/"),
                "width": width,
                "height": height,
            }
            if str(photo.get("captured_at", "")).strip():
                public_photo["captured_at"] = photo["captured_at"]
            public["photos"].append(public_photo)

            manifest["files"].append(
                {
                    "path": str(target_rel).replace("\\", "/"),
                    "sha256": sha256(target),
                    "bytes": target.stat().st_size,
                    "width": width,
                    "height": height,
                }
            )

        public_path = temp_dir / "public-owner-content.json"
        public_path.write_text(json.dumps(public, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
        manifest["files"].append(
            {
                "path": "public-owner-content.json",
                "sha256": sha256(public_path),
                "bytes": public_path.stat().st_size,
            }
        )

        manifest_path = temp_dir / "MANIFEST.json"
        manifest_path.write_text(json.dumps(manifest, indent=2) + "\n", encoding="utf-8")

        if final_dir.exists():
            backup = final_dir.with_name(final_dir.name + ".previous")
            if backup.exists():
                shutil.rmtree(backup)
            final_dir.rename(backup)
        temp_dir.rename(final_dir)

    except Exception:
        shutil.rmtree(temp_dir, ignore_errors=True)
        raise

    print(f"STAGE_OWNER_CONTENT=PASS output={final_dir}")
    print(f"public_content={final_dir / 'public-owner-content.json'}")
    print(f"manifest={final_dir / 'MANIFEST.json'}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
