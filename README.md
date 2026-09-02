# מאה ארבעים ושתיים · One Hundred Forty-Two

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

**The daily — "The Five":** five questions a day, one per tier, ascending. One
wrong answer ends the day. Your result is the rung you reached, shared as a
spoiler-free block of wax-coloured squares. Streak, house points, and a wax-seal
journal of the last five weeks.

## Design

Ink on parchment — an 1890s engraved textbook. Dark mode is the same book read
by candlelight in the Restricted Section. All illustration is original
stroke-based SVG (`components/Engravings.tsx`); no film stills, no Warner Bros.
assets, no licensed imagery anywhere.

Type: Frank Ruhl Libre (display), David Libre (Hebrew body), EB Garamond (Latin
and figures).

## Status

Design system and three screens are real; the question bank is a five-question
sample of the production shape (`content/sample.ts`). Still to come: the
verified question pipeline, Supabase (accounts, streaks, house cup, daily
seeding), and server-side answer checking.

## Running it

```
npm install
npm run dev
```

---

A fan project. Not affiliated with Warner Bros. or J.K. Rowling.
