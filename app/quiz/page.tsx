import { BOOK_TITLES, FILMS, counts, type Filter } from "@/lib/bank";
import ShelfChrome from "@/components/ShelfChrome";

/* The library: everything, per book, per film — each at any of five levels. */
export default function ShelfPage() {
  const rows: { slug: string; kind: Filter["kind"]; he: string; en: string; n: number; byDifficulty: Record<number, number> }[] = [];

  const all = counts({ kind: "all" });
  rows.push({ slug: "all", kind: "all", he: "כל השאלות", en: "All questions", ...all, n: all.total });

  for (let b = 1; b <= 7; b++) {
    const c = counts({ kind: "book", book: b });
    rows.push({ slug: `book-${b}`, kind: "book", he: BOOK_TITLES[b].he, en: BOOK_TITLES[b].en, n: c.total, byDifficulty: c.byDifficulty });
  }

  for (const f of FILMS) {
    const c = counts({ kind: "film", film: f.n });
    rows.push({ slug: `film-${f.n}`, kind: "film", he: f.he, en: f.en, n: c.total, byDifficulty: c.byDifficulty });
  }

  return <ShelfChrome rows={rows} />;
}
