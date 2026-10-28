"""Translate every unique MyScheme title with the local OPUS-MT models."""

import json
import runpy
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "src" / "data" / "myscheme_eligibility_detailed.json"
translation = runpy.run_path(str(ROOT / "scripts" / "translate-scheme-catalog-local.py"))
schemes = json.loads(SOURCE.read_text(encoding="utf-8")).get("schemes", [])
names = list(dict.fromkeys(
    scheme["scheme_name"].strip()
    for scheme in schemes
    if isinstance(scheme.get("scheme_name"), str) and scheme["scheme_name"].strip()
))
print(f"Translating {len(names)} unique scheme names.", flush=True)
for code in ("hi", "ta"):
    config = translation["MODELS"][code]
    translation["translate_language"](code, config, names)
