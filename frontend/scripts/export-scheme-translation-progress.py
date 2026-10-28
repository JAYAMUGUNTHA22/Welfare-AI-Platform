"""Export completed local translation checkpoint entries as a usable catalog."""

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CHECKPOINT = ROOT / ".scheme-translation-progress"
OUTPUT = ROOT / "src" / "data" / "translations"

for code, language in (("hi", "Hindi"), ("ta", "Tamil")):
    translated = {}
    progress = CHECKPOINT / f"{code}.jsonl"
    if progress.exists():
        with progress.open(encoding="utf-8") as file:
            for line in file:
                if line.strip():
                    source, target = json.loads(line)
                    translated[source] = target
    (OUTPUT / f"{language.lower()}.json").write_text(json.dumps({
        "language": language,
        "provider": "Local OPUS-MT model",
        "machineTranslated": True,
        "translations": translated,
    }, ensure_ascii=False), encoding="utf-8")
    print(f"Exported {len(translated)} {language} translations.")
