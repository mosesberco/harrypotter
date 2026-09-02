#!/usr/bin/env python3
"""Check every question in content/questions/*.json against the book text.

Each question carries a `probe` — a regex that must appear in the chapter it
cites. The probe is what makes a citation checkable instead of asserted.

    export HP_CORPUS=/path/to/books
    python3 tools/verify_bank.py            # report
    python3 tools/verify_bank.py --write    # stamp verified/source from the hit

Questions that do not match are reported and left `verified: false`; the app
never serves an unverified question.
"""

import json
import os
import re
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
from verify import BOOKS, normalise  # noqa: E402

CORPUS = Path(os.environ.get("HP_CORPUS", ""))
BANK = Path(__file__).parent.parent / "content" / "questions"

_cache = {}


def chapter_text(book, ch):
    key = (book, ch)
    if key not in _cache:
        f = CORPUS / f"book{book}" / f"ch{ch}.txt"
        _cache[key] = normalise(f.read_text(errors="replace")) if f.is_file() else ""
    return _cache[key]


def book_text(book):
    key = ("all", book)
    if key not in _cache:
        d = CORPUS / f"book{book}"
        parts = []
        if d.is_dir():
            for f in sorted(d.glob("ch*.txt"), key=lambda p: int(re.search(r"ch(\d+)", p.name).group(1))):
                parts.append((int(re.search(r"ch(\d+)", f.name).group(1)), normalise(f.read_text(errors="replace"))))
        _cache[key] = parts
    return _cache[key]


def check(q):
    """Return (ok, message, found_chapter)."""
    probe = q.get("probe")
    if not probe:
        return None, "no probe — cannot be verified from text", None
    book = q.get("book")
    if not book:
        return None, "no book field", None
    if book not in BOOKS:
        return False, f"book {book} out of range", None

    rx = re.compile(probe, re.I)
    hits = [ch for ch, text in book_text(book) if rx.search(text)]
    if not hits:
        return False, "probe not found anywhere in the book", None

    cited = q.get("chapter")
    if cited is None:
        return True, f"found in ch. {hits}", hits[0]
    if cited in hits:
        return True, f"confirmed in ch. {cited}", cited
    return "moved", f"cited ch. {cited} → corrected to ch. {hits[0]} (probe appears in {hits})", hits[0]


def main():
    write = "--write" in sys.argv
    if not CORPUS.is_dir():
        sys.exit("HP_CORPUS is not set to a readable directory")

    total = ok = unverifiable = bad = 0
    for path in sorted(BANK.glob("*.json")):
        data = json.loads(path.read_text())
        changed = False
        print(f"\n── {path.name} ({len(data)} questions)")
        for q in data:
            total += 1
            good, msg, found = check(q)
            if good is True or good == "moved":
                ok += 1
                if good == "moved":
                    print(f"   → {q['id']}: {msg}")
                if write:
                    q["chapter"] = found
                    q["verified"] = True
                    b = q["book"]
                    q["he"]["source"] = f"{BOOKS[b][1]}, פרק {found}"
                    q["en"]["source"] = f"{BOOKS[b][0]}, ch. {found}"
                    changed = True
            elif good is None:
                unverifiable += 1
                print(f"   ~ {q['id']}: {msg}")
                if write:
                    q["verified"] = False
                    changed = True
            else:
                bad += 1
                print(f"   ✗ {q['id']}: {msg}")
                if write:
                    q["verified"] = False
                    changed = True
        if write and changed:
            path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n")

    print(f"\n{'='*54}\n{ok}/{total} verified against the text"
          f"   ·   {bad} failed   ·   {unverifiable} not text-checkable")
    return 1 if bad else 0


if __name__ == "__main__":
    sys.exit(main())
