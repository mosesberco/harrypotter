/* Server-only question bank. The `answer` field must never reach the browser —
   everything the client sees goes through `strip()`, and checking happens in
   the route handler. */

import "server-only";
import fs from "node:fs";
import path from "node:path";

export type Lang = "he" | "en";
export type Scope = "book" | "film" | "both";

export type Copy = { prompt: string; choices: string[]; explanation: string; source: string };

export type Question = {
  id: string;
  difficulty: 1 | 2 | 3 | 4 | 5;
  scope: Scope;
  book: number;
  chapter: number;
  topics: string[];
  answer: number;
  probe: string;
  verified: boolean;
  he: Copy;
  en: Copy;
};

/** What the browser is allowed to see. */
export type PublicQuestion = Omit<Question, "answer" | "probe"> & { answer?: never };

const DIR = path.join(process.cwd(), "content", "questions");

let cache: Question[] | null = null;

export function bank(): Question[] {
  if (!cache) {
    cache = fs
      .readdirSync(DIR)
      .filter((f) => f.endsWith(".json"))
      .flatMap((f) => JSON.parse(fs.readFileSync(path.join(DIR, f), "utf8")) as Question[])
      /* an unverified question is never served — that is the whole promise */
      .filter((q) => q.verified);
  }
  return cache;
}

export function strip(q: Question): PublicQuestion {
  const { answer, probe, ...rest } = q;
  void answer;
  void probe;
  return rest;
}

export function byId(id: string) {
  return bank().find((q) => q.id === id);
}

/* ---------- the quiz library ---------- */

export const BOOK_TITLES: Record<number, { he: string; en: string }> = {
  1: { he: "אבן החכמים", en: "Philosopher's Stone" },
  2: { he: "חדר הסודות", en: "Chamber of Secrets" },
  3: { he: "האסיר מאזקבאן", en: "Prisoner of Azkaban" },
  4: { he: "גביע האש", en: "Goblet of Fire" },
  5: { he: "מסדר עוף החול", en: "Order of the Phoenix" },
  6: { he: "הנסיך חצוי-הדם", en: "Half-Blood Prince" },
  7: { he: "אוצרות המוות", en: "Deathly Hallows" },
};

/* the eight films against the book each is drawn from */
export const FILMS: { n: number; book: number; he: string; en: string }[] = [
  { n: 1, book: 1, he: "אבן החכמים", en: "Philosopher's Stone" },
  { n: 2, book: 2, he: "חדר הסודות", en: "Chamber of Secrets" },
  { n: 3, book: 3, he: "האסיר מאזקבאן", en: "Prisoner of Azkaban" },
  { n: 4, book: 4, he: "גביע האש", en: "Goblet of Fire" },
  { n: 5, book: 5, he: "מסדר עוף החול", en: "Order of the Phoenix" },
  { n: 6, book: 6, he: "הנסיך חצוי-הדם", en: "Half-Blood Prince" },
  { n: 7, book: 7, he: "אוצרות המוות: חלק 1", en: "Deathly Hallows: Part 1" },
  { n: 8, book: 7, he: "אוצרות המוות: חלק 2", en: "Deathly Hallows: Part 2" },
];

export type Filter = { kind: "all" } | { kind: "book"; book: number } | { kind: "film"; film: number };

export function parseSlug(slug: string): Filter | null {
  if (slug === "all") return { kind: "all" };
  const b = /^book-([1-7])$/.exec(slug);
  if (b) return { kind: "book", book: Number(b[1]) };
  const f = /^film-([1-8])$/.exec(slug);
  if (f) return { kind: "film", film: Number(f[1]) };
  return null;
}

export function select(filter: Filter, difficulty: number | null) {
  let qs = bank();

  if (filter.kind === "book") {
    qs = qs.filter((q) => q.book === filter.book);
  } else if (filter.kind === "film") {
    const film = FILMS.find((f) => f.n === filter.film);
    /* a film quiz only asks what is true on screen as well as on the page */
    qs = qs.filter((q) => q.book === film?.book && q.scope !== "book");
  }

  if (difficulty) qs = qs.filter((q) => q.difficulty === difficulty);
  return qs;
}

/** Counts for the library cards, so a quiz is never offered empty. */
export function counts(filter: Filter) {
  const all = select(filter, null);
  const byDifficulty: Record<number, number> = {};
  for (let d = 1; d <= 5; d++) byDifficulty[d] = all.filter((q) => q.difficulty === d).length;
  return { total: all.length, byDifficulty };
}

/* ---------- shuffling and the daily pick ---------- */

/** Deterministic PRNG so a seed always gives the same run. */
function rng(seed: string) {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return () => {
    h += 0x6d2b79f5;
    let t = h;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function shuffle<T>(items: T[], seed: string) {
  const r = rng(seed);
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(r() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/** Today in Jerusalem, as YYYY-MM-DD. Everyone gets the same question. */
export function todayKey(now = new Date()) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Jerusalem",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}

/** One question a day, the same one for everybody, walking the whole bank
    before it repeats. */
export function daily(now = new Date()) {
  const key = todayKey(now);
  const pool = shuffle(bank(), "142-daily-v1");
  const epoch = Date.UTC(2026, 0, 1);
  const day = Math.floor((Date.parse(key + "T00:00:00Z") - epoch) / 86400000);
  const q = pool[((day % pool.length) + pool.length) % pool.length];
  return { key, question: q, index: day, poolSize: pool.length };
}
