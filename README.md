# פרק ושורה · Chapter & Verse

A Harry Potter quiz for people who have read the books more than once.
Bilingual (Hebrew RTL / English), five rungs of difficulty, and every answer
carries its source — book and chapter.

## The idea

Five difficulty tiers, named from the world:

| # | Hebrew | English | The bar |
|---|--------|---------|---------|
| I | מוּגְל | Muggle | Saw one film |
| II | תלמיד שנה א׳ | First Year | Read them all once |
| III | בגרויות | O.W.L. | Read them several times |
| IV | נשלמים | N.E.W.T. | Potterhead |
| V | המחלקה למסתורין | Dept. of Mysteries | Knows the number of staircases |

**Canon:** the seven books and the eight films. Nothing else — no Fantastic
Beasts, no Pottermore. Every question is tagged `book` / `film` / `both` so a
film-only player is never punished for a detail that exists on the page only.

**The daily:** three questions a day in a modal with three tabs — a person, a
place and a spell — the same three for everybody, each category walking its own
pool before it repeats. Reset at midnight Jerusalem time. Your record is a
wax-seal journal of the last five weeks (the more you got right, the darker the
wax; three out of three is gold), plus a streak and a spoiler-free share block.

**The quiz shelf:** everything, per book, or per film, at any of the five
levels. Film quizzes ask only what is true on screen as well as on the page.

## Design

Ink on parchment — an 1890s engraved textbook. Dark mode is the same book read
by candlelight in the Restricted Section. All illustration is original
stroke-based SVG (`components/Engravings.tsx`); no film stills, no Warner Bros.
assets, no licensed imagery anywhere.

Type: Frank Ruhl Libre (display), David Libre (Hebrew body), EB Garamond (Latin
and figures).

## Verification

Every question carries a `probe` — a regex that must appear in the book it
cites. `tools/verify_bank.py` runs each probe against a local text corpus and
either confirms the citation, corrects the chapter, or fails the question; the
app never serves a question whose `verified` flag is false. The corpus is
copyrighted text and is **not** part of this repository — point `HP_CORPUS` at
a directory of `bookN/chM.txt` files:

```
export HP_CORPUS=/path/to/books
python3 tools/verify_bank.py          # report
python3 tools/verify_bank.py --write  # stamp citations from the text
python3 tools/verify.py "Mimsy-Porpington"   # look one fact up
python3 tools/mine.py numbers 1              # find facts worth asking about
```

The pipeline has already caught real errors: a vault number that appears in no
book, a chapter cited from memory that was two chapters off, and Ravenclaw's
emblem (a bronze eagle, not a raven).

Answers are compared in `app/api/answer/route.ts`, never in the browser.

## Status

222 questions, all confirmed against the book text, across all seven books and
weighted towards the harder levels. Every question is tagged `person`, `place`,
`spell` or `other`, and all four categories cover all five levels. Still to come: Supabase (accounts, real
streaks, house cup), film-only questions — which need a source the book corpus
cannot provide — and the bilingual glossary.

## Running it

```
npm install
npm run dev
```

---

A fan project. Not affiliated with Warner Bros. or J.K. Rowling.
