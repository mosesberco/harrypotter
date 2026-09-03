"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type Lang = "he" | "en";
export type Theme = "light" | "dark";

/* Five rungs of the ladder. Order matters — it is the daily climb. */
export const TIERS = [
  { key: "muggle",  he: "מוּגְל",              en: "Muggle",                 roman: "I"   },
  { key: "first",   he: "תלמיד שנה א׳",       en: "First Year",             roman: "II"  },
  { key: "owl",     he: "בגרויות",             en: "O.W.L.",                 roman: "III" },
  { key: "newt",    he: "נשלמים",              en: "N.E.W.T.",               roman: "IV"  },
  { key: "mystery", he: "המחלקה למסתורין",     en: "Dept. of Mysteries",     roman: "V"   },
] as const;

const S = {
  siteName:   { he: "פרק ושורה",                   en: "Chapter & Verse" },
  tagline:    { he: "חידון לפוטרהדים בלבד",        en: "A quiz for Potterheads only" },
  daily:      { he: "שלוש היום",                   en: "Today's Three" },
  dailyKicker:{ he: "אדם, מקום, לחש — כל יום",     en: "A person, a place, a spell — every day" },
  shelf:      { he: "מדף החידונים",                en: "The Quiz Shelf" },
  tabPerson:  { he: "אדם",                         en: "Person" },
  tabPlace:   { he: "מקום",                        en: "Place" },
  tabSpell:   { he: "לחש",                         en: "Spell" },
  question:   { he: "שאלה",                        en: "Question" },
  questions:  { he: "שאלות",                       en: "questions" },
  source:     { he: "מקור",                        en: "Source" },
  streak:     { he: "רצף",                         en: "Streak" },
  nextIn:     { he: "השאלות הבאות בעוד",           en: "Next three in" },
  share:      { he: "שתפו את התוצאה",              en: "Share result" },
  copied:     { he: "הועתק",                       en: "Copied" },
  scopeBook:  { he: "ספרים",                       en: "Books" },
  scopeFilm:  { he: "סרטים",                       en: "Films" },
  scopeBoth:  { he: "ספרים וסרטים",                en: "Books & films" },
  correct:    { he: "נכון",                        en: "Correct" },
  wrong:      { he: "לא נכון",                     en: "Not quite" },
  journal:    { he: "יומן השעווה",                 en: "The wax journal" },
  everything: { he: "הכל",                         en: "Everything" },
  byBook:     { he: "לפי ספר",                     en: "By book" },
  byFilm:     { he: "לפי סרט",                     en: "By film" },
  difficulty: { he: "רמת קושי",                    en: "Difficulty" },
  anyLevel:   { he: "כל הרמות",                    en: "All levels" },
  play:       { he: "לשחק",                        en: "Play" },
  score:      { he: "תוצאה",                       en: "Score" },
  again:      { he: "עוד סבב",                     en: "Another round" },
  backToShelf:{ he: "חזרה למדף",                   en: "Back to the shelf" },
  nextQ:      { he: "הבאה",                        en: "Next" },
  finish:     { he: "לסיום",                       en: "Finish" },
  close:      { he: "סגירה",                       en: "Close" },
  openDaily:  { he: "פתחו את שלוש היום",           en: "Open today's three" },
  allDone:    { he: "השלמתם את שלוש היום",         en: "You have finished today's three" },
  comeBack:   { he: "שלוש שאלות חדשות בחצות.",     en: "Three new questions at midnight." },
  emptySet:   { he: "אין עדיין שאלות מאומתות בקטגוריה הזו", en: "No verified questions here yet" },
  filmNote:   { he: "חידוני הסרטים שואלים רק על מה שנכון גם על המסך וגם בדף", en: "Film quizzes ask only what is true on screen as well as on the page" },
} as const;

export type Key = keyof typeof S;

type Ctx = {
  lang: Lang; setLang: (l: Lang) => void;
  theme: Theme; setTheme: (t: Theme) => void;
  t: (k: Key) => string;
  dir: "rtl" | "ltr";
};

const C = createContext<Ctx | null>(null);

export function Providers({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>("he");
  const [theme, setTheme] = useState<Theme>("light");

  useEffect(() => {
    try {
      const l = localStorage.getItem("hp.lang") as Lang | null;
      const th = localStorage.getItem("hp.theme") as Theme | null;
      if (l) setLang(l);
      if (th) setTheme(th);
    } catch {}
  }, []);

  useEffect(() => {
    const dir = lang === "he" ? "rtl" : "ltr";
    document.documentElement.lang = lang;
    document.documentElement.dir = dir;
    document.documentElement.dataset.theme = theme;
    try {
      localStorage.setItem("hp.lang", lang);
      localStorage.setItem("hp.theme", theme);
    } catch {}
  }, [lang, theme]);

  return (
    <C.Provider
      value={{
        lang, setLang, theme, setTheme,
        dir: lang === "he" ? "rtl" : "ltr",
        t: (k) => S[k][lang],
      }}
    >
      {children}
    </C.Provider>
  );
}

export function useUI() {
  const c = useContext(C);
  if (!c) throw new Error("useUI outside Providers");
  return c;
}

export function tierName(i: number, lang: Lang) {
  return TIERS[i][lang];
}
