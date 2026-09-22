#!/usr/bin/env python3
import json
from pathlib import Path

path = Path(__file__).resolve().parents[1] / "content" / "menu.json"
data = json.loads(path.read_text(encoding="utf-8"))

if data.get("_publication_status") != "PUBLISHED":
    raise SystemExit("menu: _publication_status must be PUBLISHED")
items = data.get("items")
if not isinstance(items, list) or not items:
    raise SystemExit("menu: items must be a non-empty list")

seen = set()
for i, item in enumerate(items, start=1):
    if not isinstance(item, dict):
        raise SystemExit(f"menu: item {i} must be an object")
    item_id = str(item.get("id", "")).strip()
    if not item_id or item_id in seen:
        raise SystemExit(f"menu: item {i} has missing/duplicate id")
    seen.add(item_id)
    for key in ("name_en", "name_es"):
        if not str(item.get(key, "")).strip():
            raise SystemExit(f"menu: {item_id} missing {key}")
    if "price" in item and item["price"] not in (None, ""):
        if data.get("_owner_approved") is not True:
            raise SystemExit(f"menu: {item_id} has a price but _owner_approved is not true")
        try:
            value = float(item["price"])
        except (TypeError, ValueError):
            raise SystemExit(f"menu: {item_id} price must be numeric")
        if value < 0:
            raise SystemExit(f"menu: {item_id} price must be nonnegative")

print(f"MENU_VALID=PASS items={len(items)} owner_approved={data.get('_owner_approved') is True}")
