#!/usr/bin/env python3
"""Validate owner-controlled content before review or publication.

This tool is intentionally strict about approval state. It does not publish or
modify the live site.
"""
from __future__ import annotations

import argparse
import json
import re
import subprocess
import sys
from datetime import datetime
from pathlib import Path
from urllib.parse import urlparse

SCHEMA = "tacos-sinaloa-owner-content-v1"
STATUSES = {"PENDING", "REVIEW_READY", "APPROVED"}
PHOTO_SLOTS = {
    "storefront",
    "interior",
    "carniceria",
    "taco_hero",
    "birria_hero",
    "atmosphere",
}
MIN_SHORT_EDGE = 750
MIN_LONG_EDGE = 1000


def fail(errors: list[str], message: str) -> None:
    errors.append(message)


def parse_iso(value: str, label: str, errors: list[str]) -> None:
    if not value:
        return
    try:
        datetime.fromisoformat(value.replace("Z", "+00:00"))
    except ValueError:
        fail(errors, f"{label} must be ISO-8601")


def is_https_url(value: str) -> bool:
    parsed = urlparse(value)
    return parsed.scheme == "https" and bool(parsed.netloc)


def image_dimensions(path: Path) -> tuple[int, int] | None:
    try:
        result = subprocess.run(
            ["identify", "-format", "%w %h", str(path)],
            check=True,
            capture_output=True,
            text=True,
            timeout=10,
        )
        width, height = result.stdout.strip().split()
        return int(width), int(height)
    except (OSError, subprocess.SubprocessError, ValueError):
        return None


def validate_menu(menu: dict, strict_publish: bool, errors: list[str]) -> tuple[int, int]:
    owner_confirmed = menu.get("owner_confirmed") is True
    categories = menu.get("categories", [])
    if not isinstance(categories, list):
        fail(errors, "menu.categories must be a list")
        return 0, 0

    ids: set[str] = set()
    item_count = 0
    priced_count = 0
    for ci, category in enumerate(categories, start=1):
        if not isinstance(category, dict):
            fail(errors, f"menu category {ci} must be an object")
            continue
        cat_id = str(category.get("id", "")).strip()
        if not cat_id:
            fail(errors, f"menu category {ci} missing id")
        for key in ("name_en", "name_es"):
            if not str(category.get(key, "")).strip():
                fail(errors, f"menu category {cat_id or ci} missing {key}")
        items = category.get("items", [])
        if not isinstance(items, list):
            fail(errors, f"menu category {cat_id or ci} items must be a list")
            continue

        for ii, item in enumerate(items, start=1):
            item_count += 1
            if not isinstance(item, dict):
                fail(errors, f"menu item {cat_id or ci}/{ii} must be an object")
                continue
            item_id = str(item.get("id", "")).strip()
            if not item_id:
                fail(errors, f"menu item {cat_id or ci}/{ii} missing id")
            elif item_id in ids:
                fail(errors, f"duplicate menu item id: {item_id}")
            else:
                ids.add(item_id)

            for key in ("name_en", "name_es"):
                if not str(item.get(key, "")).strip():
                    fail(errors, f"menu item {item_id or ii} missing {key}")

            price = item.get("price")
            if price not in (None, ""):
                priced_count += 1
                if isinstance(price, bool) or not isinstance(price, (int, float)) or price < 0:
                    fail(errors, f"menu item {item_id or ii} price must be a nonnegative number")
                if not owner_confirmed:
                    fail(errors, f"menu item {item_id or ii} has a price but menu.owner_confirmed is not true")

            availability = str(item.get("availability", "")).strip()
            if availability and availability not in {
                "daily",
                "weekend_only",
                "subject_to_availability",
                "confirm_with_owner",
            }:
                fail(errors, f"menu item {item_id or ii} has unsupported availability: {availability}")

    if strict_publish and categories and not owner_confirmed:
        fail(errors, "strict publish: menu content exists but menu.owner_confirmed is not true")

    return item_count, priced_count


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("submission", type=Path)
    parser.add_argument(
        "--assets-root",
        type=Path,
        help="Private directory containing referenced photo files",
    )
    parser.add_argument(
        "--strict-publish",
        action="store_true",
        help="Require APPROVED state and full publication approvals",
    )
    parser.add_argument(
        "--require-complete-photo-pack",
        action="store_true",
        help="Require all six requested photo slots",
    )
    args = parser.parse_args()

    try:
        data = json.loads(args.submission.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError) as exc:
        print(f"OWNER_CONTENT_VALID=FAIL\n - cannot read submission: {exc}", file=sys.stderr)
        return 2

    errors: list[str] = []
    warnings: list[str] = []

    if data.get("_schema") != SCHEMA:
        fail(errors, f"_schema must be {SCHEMA}")

    status = str(data.get("status", "")).strip()
    if status not in STATUSES:
        fail(errors, f"status must be one of {sorted(STATUSES)}")

    submission_id = str(data.get("submission_id", "")).strip()
    if status in {"REVIEW_READY", "APPROVED"} and submission_id in {"", "replace-me"}:
        fail(errors, f"{status}: submission_id must be assigned")

    parse_iso(str(data.get("submitted_at", "")).strip(), "submitted_at", errors)

    approval = data.get("owner_approval", {})
    if not isinstance(approval, dict):
        fail(errors, "owner_approval must be an object")
        approval = {}

    approved = approval.get("approved") is True
    parse_iso(str(approval.get("approved_at", "")).strip(), "owner_approval.approved_at", errors)

    if status == "APPROVED" or args.strict_publish:
        if status != "APPROVED":
            fail(errors, "strict publish requires status APPROVED")
        if not approved:
            fail(errors, "APPROVED requires owner_approval.approved=true")
        for key in ("approved_at", "approved_by", "evidence"):
            if not str(approval.get(key, "")).strip():
                fail(errors, f"APPROVED requires owner_approval.{key}")

    ordering = data.get("ordering", {})
    if not isinstance(ordering, dict):
        fail(errors, "ordering must be an object")
        ordering = {}
    official_url = str(ordering.get("official_url", "")).strip()
    if official_url:
        if not is_https_url(official_url):
            fail(errors, "ordering.official_url must be an HTTPS URL")
        if ordering.get("owner_confirmed") is not True:
            fail(errors, "ordering.official_url is present but ordering.owner_confirmed is not true")
        if args.strict_publish and not approved:
            fail(errors, "strict publish: ordering URL cannot publish without owner approval")

    visit = data.get("visit", {})
    if not isinstance(visit, dict):
        fail(errors, "visit must be an object")
        visit = {}
    visit_values = [
        str(visit.get("parking", "")).strip(),
        str(visit.get("cross_street", "")).strip(),
        str(visit.get("holiday_hours", "")).strip(),
    ]
    payments = visit.get("payment_methods", [])
    if not isinstance(payments, list):
        fail(errors, "visit.payment_methods must be a list")
        payments = []
    if any(visit_values) or payments:
        if visit.get("owner_confirmed") is not True:
            fail(errors, "visit contains owner-controlled details but visit.owner_confirmed is not true")

    photos = data.get("photos", [])
    if not isinstance(photos, list):
        fail(errors, "photos must be a list")
        photos = []

    seen_slots: set[str] = set()
    supplied_slots: set[str] = set()
    photo_count = 0

    for index, photo in enumerate(photos, start=1):
        if not isinstance(photo, dict):
            fail(errors, f"photo {index} must be an object")
            continue
        slot = str(photo.get("slot", "")).strip()
        if slot not in PHOTO_SLOTS:
            fail(errors, f"photo {index} has unsupported slot: {slot}")
            continue
        if slot in seen_slots:
            fail(errors, f"duplicate photo slot: {slot}")
        seen_slots.add(slot)

        file_value = str(photo.get("file", "")).strip()
        if not file_value:
            continue

        supplied_slots.add(slot)
        photo_count += 1
        parse_iso(str(photo.get("captured_at", "")).strip(), f"photo.{slot}.captured_at", errors)

        if photo.get("owner_confirmed") is not True:
            fail(errors, f"photo {slot} supplied but owner_confirmed is not true")
        if slot == "storefront" and photo.get("current_signage_confirmed") is not True:
            fail(errors, "storefront photo requires current_signage_confirmed=true")

        if args.assets_root:
            candidate = (args.assets_root / file_value).resolve()
            root = args.assets_root.resolve()
            if root != candidate and root not in candidate.parents:
                fail(errors, f"photo {slot} escapes assets root")
                continue
            if not candidate.is_file():
                fail(errors, f"photo {slot} file not found: {file_value}")
                continue
            dims = image_dimensions(candidate)
            if not dims:
                fail(errors, f"photo {slot} is not a readable image: {file_value}")
                continue
            width, height = dims
            short_edge, long_edge = sorted((width, height))
            if short_edge < MIN_SHORT_EDGE or long_edge < MIN_LONG_EDGE:
                message = (
                    f"photo {slot} is low resolution {width}x{height}; "
                    f"target >= {MIN_SHORT_EDGE}px short edge and >= {MIN_LONG_EDGE}px long edge"
                )
                if args.strict_publish:
                    fail(errors, message)
                else:
                    warnings.append(message)

    if args.require_complete_photo_pack:
        missing = sorted(PHOTO_SLOTS - supplied_slots)
        if missing:
            fail(errors, "complete photo pack missing: " + ", ".join(missing))

    menu = data.get("menu", {})
    if not isinstance(menu, dict):
        fail(errors, "menu must be an object")
        menu = {}
    item_count, priced_count = validate_menu(menu, args.strict_publish, errors)

    if status == "REVIEW_READY":
        has_content = bool(photo_count or item_count or official_url or any(visit_values) or payments)
        if not has_content:
            fail(errors, "REVIEW_READY submission has no owner content to review")

    if args.strict_publish and not any(
        [photo_count, item_count, official_url, any(visit_values), bool(payments)]
    ):
        fail(errors, "strict publish submission contains no publishable owner content")

    for warning in warnings:
        print(f"WARN {warning}")

    if errors:
        print("OWNER_CONTENT_VALID=FAIL", file=sys.stderr)
        for error in errors:
            print(f" - {error}", file=sys.stderr)
        return 1

    print(
        "OWNER_CONTENT_VALID=PASS "
        f"status={status} photos={photo_count} menu_items={item_count} priced_items={priced_count} "
        f"order_url={'yes' if official_url else 'no'}"
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
