#!/usr/bin/env python3
"""Fact-check a question against the book text and return an exact citation.

The corpus is NOT part of this repository — it is copyrighted text used locally
for verification only. Point HP_CORPUS at a directory of bookN/chM.txt files:

    export HP_CORPUS=/path/to/books
    python3 tools/verify.py "Mimsy-Porpington"
    python3 tools/verify.py --all "vanishing step" "one hundred and forty-two"
"""

import os
import re
import sys
from pathlib import Path

BOOKS = {
    1: ("Philosopher's Stone", "הארי פוטר ואבן החכמים"),
    2: ("Chamber of Secrets", "הארי פוטר וחדר הסודות"),
    3: ("Prisoner of Azkaban", "הארי פוטר והאסיר מאזקבאן"),
    4: ("Goblet of Fire", "הארי פוטר וגביע האש"),
    5: ("Order of the Phoenix", "הארי פוטר ומסדר עוף החול"),
    6: ("Half-Blood Prince", "הארי פוטר והנסיך חצוי-הדם"),
    7: ("Deathly Hallows", "הארי פוטר ואוצרות המוות"),
}

CORPUS = Path(os.environ.get("HP_CORPUS", ""))


def chapters():
    """Yield (book, chapter, title, text) for every chapter file."""
    if not CORPUS.is_dir():
        sys.exit("HP_CORPUS is not set to a readable directory")
    for b in sorted(BOOKS):
        d = CORPUS / f"book{b}"
        if not d.is_dir():
            continue
        files = sorted(d.glob("ch*.txt"), key=lambda p: int(re.search(r"ch(\d+)", p.name).group(1)))
        for f in files:
            n = int(re.search(r"ch(\d+)", f.name).group(1))
            text = f.read_text(errors="replace")
            yield b, n, chapter_title(text), text


def normalise(text):
    """The scans carry soft hyphens inside words and curly punctuation; strip
    both so a plain search phrase matches."""
    text = text.replace("\u00ad", "").replace("\u200b", "").replace("\ufeff", "")
    text = text.replace("\u2019", "'").replace("\u2018", "'")
    text = text.replace("\u201c", '"').replace("\u201d", '"')
    text = text.replace("\u2014", " - ").replace("\u2013", "-")
    return re.sub(r"\s+", " ", text)


def chapter_title(text):
    """The title line that follows the CHAPTER heading."""
    lines = [l.replace("\u00ad", "").strip() for l in text.splitlines()[:12]]
    for i, l in enumerate(lines):
        if re.match(r"^C\s?H\s?A\s?P\s?T\s?E\s?R", l, re.I) or re.match(r"^(EPILOGUE)$", l, re.I):
            for nxt in lines[i + 1 : i + 4]:
                if nxt and not re.match(r"^C\s?H\s?A\s?P\s?T\s?E\s?R", nxt, re.I):
                    return nxt.title()
    return "?"


def find(pattern, context=90, limit=6):
    """Every chapter whose text matches, with a short surrounding snippet."""
    rx = re.compile(pattern, re.I | re.S)
    hits = []
    for b, n, title, text in chapters():
        flat = normalise(text)
        for m in list(rx.finditer(flat))[:limit]:
            s = max(0, m.start() - context)
            hits.append(
                {
                    "book": b,
                    "chapter": n,
                    "title": title,
                    "cite_en": f"{BOOKS[b][0]}, ch. {n}",
                    "cite_he": f"{BOOKS[b][1]}, פרק {n}",
                    "snippet": flat[s : m.end() + context].strip(),
                }
            )
    return hits


def main():
    args = [a for a in sys.argv[1:] if a != "--all"]
    if not args:
        sys.exit(__doc__)
    for q in args:
        print(f"\n=== {q!r} ===")
        hits = find(q)
        if not hits:
            print("  NO MATCH — do not ship this question")
            continue
        for h in hits:
            print(f"  [{h['cite_en']}] {h['title']}")
            print(f"      …{h['snippet']}…")


if __name__ == "__main__":
    main()
