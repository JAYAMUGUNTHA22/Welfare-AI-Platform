"""Generate Hindi and Tamil translations for every public MyScheme text field.

Uses locally downloaded Apache-licensed OPUS-MT models and CTranslate2 int8 CPU
inference. Translation progress is checkpointed to JSONL so interrupted runs can
resume. This is machine translation; important eligibility details should still
be verified against the original scheme website.
"""

import json
import os
import re
import time
from pathlib import Path

import ctranslate2
from transformers import AutoTokenizer

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "src" / "data" / "myscheme_eligibility_detailed.json"
OUTPUT = ROOT / "src" / "data" / "translations"
CHECKPOINT = ROOT / ".scheme-translation-progress"
FIELDS = ("scheme_name", "details", "benefits", "eligibility", "application", "documents", "schemeCategory", "tags")
MODELS = {
    "hi": {
        "language": "Hindi",
        "tokenizer": r"C:\Users\user\AppData\Local\Temp\welfareai-hf-cache\hub\models--Helsinki-NLP--opus-mt-en-hi\snapshots\75d7f7c9232b2891c7d65fe4ef635616c72be867",
        "model": r"C:\Users\user\AppData\Local\Temp\welfareai-ct2-hi",
    },
    "ta": {
        "language": "Tamil",
        "tokenizer": r"C:\Users\user\AppData\Local\Temp\welfareai-hf-cache\hub\models--Varsha00--finetuned-opusmt-en-to-ta\snapshots\de239bcf3b6307a1612b3ef1a42212164d223371",
        "model": r"C:\Users\user\AppData\Local\Temp\welfareai-ct2-ta",
    },
}
BATCH_SIZE = 64
MAX_INPUT_TOKENS = 440
MAX_OUTPUT_TOKENS = 512


def collect_texts():
    source = json.loads(SOURCE.read_text(encoding="utf-8"))
    values = []
    for scheme in source.get("schemes", []):
        values.extend(scheme.get(field) for field in FIELDS)
        details = scheme.get("eligibility_details") or {}
        values.append(details.get("eligibility_summary"))
        values.extend(item.get("criterion_text") for item in details.get("eligibility_criteria", []) if isinstance(item, dict))
    return list(dict.fromkeys(value.strip() for value in values if isinstance(value, str) and value.strip()))


def text_chunks(text, tokenizer):
    if len(tokenizer.encode(text, add_special_tokens=True)) <= MAX_INPUT_TOKENS:
        return [text]
    sentences = re.split(r"(?<=[.!?])\s+", text)
    chunks, current = [], ""
    for sentence in sentences:
        if len(tokenizer.encode(sentence, add_special_tokens=True)) > MAX_INPUT_TOKENS:
            sentence_parts, part = [], ""
            for word in sentence.split():
                candidate = f"{part} {word}".strip()
                if part and len(tokenizer.encode(candidate, add_special_tokens=True)) > MAX_INPUT_TOKENS:
                    sentence_parts.append(part)
                    part = word
                else:
                    part = candidate
            if part:
                sentence_parts.append(part)
        else:
            sentence_parts = [sentence]
        for part in sentence_parts:
            candidate = f"{current} {part}".strip()
            if current and len(tokenizer.encode(candidate, add_special_tokens=True)) > MAX_INPUT_TOKENS:
                chunks.append(current)
                current = part
            else:
                current = candidate
    if current:
        chunks.append(current)
    return chunks


def translate_language(code, config, texts):
    progress_path = CHECKPOINT / f"{code}.jsonl"
    output_path = OUTPUT / f"{config['language'].lower()}.json"
    translated = {}
    if output_path.exists():
        translated.update(json.loads(output_path.read_text(encoding="utf-8")).get("translations", {}))
    if progress_path.exists():
        with progress_path.open("r", encoding="utf-8") as file:
            for line in file:
                if line.strip():
                    source, target = json.loads(line)
                    translated[source] = target

    todo = [text for text in texts if text not in translated]
    print(f"{config['language']}: {len(translated)} cached, {len(todo)} strings remaining.", flush=True)
    if not todo:
        return translated

    tokenizer = AutoTokenizer.from_pretrained(config["tokenizer"], local_files_only=True)
    tokenizer.model_max_length = 1000000
    translator = ctranslate2.Translator(config["model"], device="cpu", inter_threads=4, intra_threads=2)
    segments = []
    for source in todo:
        pieces = text_chunks(source, tokenizer)
        for index, piece in enumerate(pieces):
            tokens = tokenizer.convert_ids_to_tokens(tokenizer.encode(piece, add_special_tokens=True))
            segments.append((source, index, len(pieces), tokens))
    segments.sort(key=lambda segment: len(segment[3]))
    print(f"{config['language']}: translating {len(segments)} text segments.", flush=True)

    pending = {}
    started = time.monotonic()
    completed = 0
    with progress_path.open("a", encoding="utf-8") as progress:
        for start in range(0, len(segments), BATCH_SIZE):
            batch = segments[start:start + BATCH_SIZE]
            results = translator.translate_batch(
                [segment[3] for segment in batch],
                beam_size=1,
                max_decoding_length=MAX_OUTPUT_TOKENS,
                batch_type="tokens",
                max_batch_size=BATCH_SIZE,
            )
            outputs = [
                tokenizer.decode(tokenizer.convert_tokens_to_ids(result.hypotheses[0]), skip_special_tokens=True).strip()
                for result in results
            ]
            for (source, index, count, _), target in zip(batch, outputs):
                item = pending.setdefault(source, {"count": count, "parts": {}})
                item["parts"][index] = target
            for source in {segment[0] for segment in batch}:
                item = pending[source]
                if len(item["parts"]) == item["count"]:
                    target = " ".join(item["parts"][index] for index in range(item["count"]))
                    translated[source] = target
                    progress.write(json.dumps([source, target], ensure_ascii=False) + "\n")
                    del pending[source]
                    completed += 1
            if (start // BATCH_SIZE + 1) % 100 == 0 or start + BATCH_SIZE >= len(segments):
                progress.flush()
                elapsed = max(time.monotonic() - started, 1)
                rate = completed / elapsed
                remaining = max(len(todo) - completed, 0) / max(rate, 0.001)
                print(f"{config['language']}: {completed}/{len(todo)} strings; {rate:.1f}/s; about {remaining / 60:.0f} min left.", flush=True)

    OUTPUT.mkdir(parents=True, exist_ok=True)
    output_path.write_text(json.dumps({
        "language": config["language"],
        "provider": "Local OPUS-MT model",
        "machineTranslated": True,
        "translations": translated,
    }, ensure_ascii=False), encoding="utf-8")
    return translated


def main():
    CHECKPOINT.mkdir(parents=True, exist_ok=True)
    OUTPUT.mkdir(parents=True, exist_ok=True)
    texts = collect_texts()
    print(f"Found {len(texts)} unique scheme strings ({sum(map(len, texts)):,} source characters).", flush=True)
    for code, config in MODELS.items():
        translate_language(code, config, texts)


if __name__ == "__main__":
    main()
