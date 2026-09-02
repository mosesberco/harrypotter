#!/usr/bin/env python3
"""Mine the corpus for facts that make crisp questions.

Sentences carrying a number, a full name, a date or an address are the ones
that turn into unambiguous quiz questions with a single right answer. This
prints candidates with their exact citation so questions can be written from
the text rather than from memory.

    export HP_CORPUS=/path/to/books
    python3 tools/mine.py numbers 3
    python3 tools/mine.py names 5
"""

import os
import re
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
from verify import BOOKS, normalise  # noqa: E402

CORPUS = Path(os.environ.get("HP_CORPUS", ""))

WORD_NUM = (
    r"(?:one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|thirteen|"
    r"fourteen|fifteen|sixteen|seventeen|eighteen|nineteen|twenty|thirty|forty|"
    r"fifty|sixty|seventy|eighty|ninety|hundred|thousand)"
)

PATTERNS = {
    # a number spelled out, attached to a countable thing
    "numbers": rf"\b{WORD_NUM}(?:[- ]{WORD_NUM})*\s+[a-z]+(?:s|es)\b",
    # digits: vault numbers, years, prices, platform numbers
    "digits": r"\b\d{2,4}\b",
    # three-part names and titled names
    "names": r"\b[A-Z][a-z]+(?:\s+[A-Z][a-z']+){2,3}\b",
    # something being named or called
    "called": r"\b(?:called|named|christened)\s+[A-Z][A-Za-z' -]{2,30}",
    # addresses and rooms
    "places": r"\b(?:number|Number)\s+\w+,\s+[A-Z][A-Za-z ]+",
    # incantations: a capitalised Latinate word shouted
    "spells": r"\b[A-Z][a-z]{3,}(?:\s+[A-Z][a-z]{3,})?!",
}


def chapters(book):
    d = CORPUS / f"book{book}"
    files = sorted(d.glob("ch*.txt"), key=lambda p: int(re.search(r"ch(\d+)", p.name).group(1)))
    for f in files:
        n = int(re.search(r"ch(\d+)", f.name).group(1))
        yield n, normalise(f.read_text(errors="replace"))


def main():
    kind = sys.argv[1] if len(sys.argv) > 1 else "numbers"
    book = int(sys.argv[2]) if len(sys.argv) > 2 else 1
    limit = int(sys.argv[3]) if len(sys.argv) > 3 else 400
    if kind not in PATTERNS:
        sys.exit(f"kind must be one of {', '.join(PATTERNS)}")

    rx = re.compile(PATTERNS[kind])
    seen = set()
    out = 0
    for ch, text in chapters(book):
        for m in rx.finditer(text):
            hit = m.group(0).strip()
            if hit.lower() in seen:
                continue
            seen.add(hit.lower())
            s = max(0, m.start() - 70)
            print(f"[{BOOKS[book][0]} ch.{ch}] {hit}")
            print(f"    …{text[s:m.end() + 70]}…")
            out += 1
            if out >= limit:
                return


if __name__ == "__main__":
    main()
