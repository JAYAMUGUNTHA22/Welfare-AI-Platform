"""Prioritize the scheme detail text shown in the user-provided screenshots."""

import json
import runpy
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "src" / "data" / "myscheme_eligibility_detailed.json"
translator = runpy.run_path(str(ROOT / "scripts" / "translate-scheme-catalog-local.py"))
FIELDS = ("scheme_name", "details", "benefits", "eligibility", "application", "documents", "schemeCategory", "tags")
NEEDLES = (
    "Migrants Employment Generation Programme",
    "Dr. Muthulakshmi Reddy Ninaivu Inter-caste Marriage Assistance Scheme-I",
    "District Central Cooperative Banks and through its Branches",
    "Annal Ambedkar Business Champions",
    "Pradhan Mantri Matru Vandana Yojana",
    "Pradhan Mantri Dakshta Aur Kushalta Sampann Hitgrahi",
)

data = json.loads(SOURCE.read_text(encoding="utf-8"))
texts = set()
for scheme in data.get("schemes", []):
    name = scheme.get("scheme_name", "")
    if not any(needle.lower() in name.lower() for needle in NEEDLES):
        continue
    texts.update(value.strip() for value in (scheme.get(field) for field in FIELDS) if isinstance(value, str) and value.strip())
    details = scheme.get("eligibility_details") or {}
    summary = details.get("eligibility_summary")
    if isinstance(summary, str) and summary.strip():
        texts.add(summary.strip())
    texts.update(item["criterion_text"].strip() for item in details.get("eligibility_criteria", []) if isinstance(item, dict) and item.get("criterion_text", "").strip())

texts = sorted(texts)
print(f"Prioritizing {len(texts)} text entries across the screenshot schemes.", flush=True)
for code, config in translator["MODELS"].items():
    translator["translate_language"](code, config, texts)
