#!/usr/bin/env python3
import json
from datetime import date
from pathlib import Path
from urllib.parse import urlparse

path = Path(__file__).resolve().parents[1] / "content" / "reviews.json"
data = json.loads(path.read_text(encoding="utf-8"))

if data.get("_publication_status") != "PUBLISHED":
    raise SystemExit("reviews: _publication_status must be PUBLISHED")
items = data.get("items")
if not isinstance(items, list) or not 1 <= len(items) <= 3:
    raise SystemExit("reviews: items must contain 1-3 published entries")

seen = set()
for i, item in enumerate(items, start=1):
    item_id = str(item.get("id", "")).strip()
    if not item_id or item_id in seen:
        raise SystemExit(f"reviews: item {i} has missing/duplicate id")
    seen.add(item_id)
    for key in ("reviewer", "source", "source_date", "text_en", "text_es", "source_url", "evidence_url"):
        if not str(item.get(key, "")).strip():
            raise SystemExit(f"reviews: {item_id} missing {key}")
    try:
        source_date = date.fromisoformat(item["source_date"])
    except ValueError:
        raise SystemExit(f"reviews: {item_id} source_date must be YYYY-MM-DD")
    if source_date > date.today():
        raise SystemExit(f"reviews: {item_id} source_date is in the future")
    if source_date < date(2025, 1, 1):
        raise SystemExit(f"reviews: {item_id} is too old for the recent-review module")
    for key in ("source_url", "evidence_url"):
        parsed = urlparse(item[key])
        if parsed.scheme != "https" or not parsed.netloc:
            raise SystemExit(f"reviews: {item_id} {key} must be HTTPS")
    if "rating" in item or "stars" in item or "aggregate" in item:
        raise SystemExit(f"reviews: {item_id} must not freeze rating metadata")

print(f"REVIEWS_VALID=PASS items={len(items)}")
