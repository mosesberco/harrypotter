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
  { key: "mystery", he: "מחלקת המסתורין",     en: "Dept. of Mysteries",     roman: "V"   },
] as const;

const S = {
  siteName:   { he: "פרק ושורה",                   en: "Chapter & Verse" },
  tagline:    { he: "חידון הארי פוטר",             en: "A Harry Potter quiz" },
  daily:      { he: "שלוש היום",                   en: "Today's Three" },
  dailyKicker:{ he: "אדם, מקום, לחש. כל יום.",     en: "A person, a place, a spell. Every day." },
  shelf:      { he: "כל החידונים",                 en: "All the quizzes" },
  tabPerson:  { he: "אדם",                         en: "Person" },
  tabPlace:   { he: "מקום",                        en: "Place" },
  tabSpell:   { he: "לחש",                         en: "Spell" },
  question:   { he: "שאלה",                        en: "Question" },
  questions:  { he: "שאלות",                       en: "questions" },
  source:     { he: "מקור",                        en: "Source" },
  streak:     { he: "הרצף שלך",                    en: "Your streak" },
  nextIn:     { he: "שאלות חדשות בעוד",            en: "New ones in" },
  share:      { he: "שתפו",                        en: "Share" },
  copied:     { he: "הועתק",                       en: "Copied" },
  scopeBook:  { he: "ספרים",                       en: "Books" },
  scopeFilm:  { he: "סרטים",                       en: "Films" },
  scopeBoth:  { he: "ספרים וסרטים",                en: "Books & films" },
  correct:    { he: "נכון",                        en: "Correct" },
  wrong:      { he: "לא נכון",                     en: "Not quite" },
  journal:    { he: "היומן שלך",                   en: "Your journal" },
  everything: { he: "הכל",                         en: "Everything" },
  byBook:     { he: "לפי ספר",                     en: "By book" },
  byFilm:     { he: "לפי סרט",                     en: "By film" },
  difficulty: { he: "רמת קושי",                    en: "Difficulty" },
  anyLevel:   { he: "כל הרמות",                    en: "All levels" },
  play:       { he: "לשחק",                        en: "Play" },
  score:      { he: "תוצאה",                       en: "Score" },
  again:      { he: "עוד עשר",                     en: "Ten more" },
  backToShelf:{ he: "חידון אחר",                   en: "Another quiz" },
  nextQ:      { he: "הבאה",                        en: "Next" },
  finish:     { he: "לסיום",                       en: "Finish" },
  allDone:    { he: "סיימת להיום",                 en: "Done for today" },
  comeBack:   { he: "שלוש חדשות בחצות.",           en: "Three new ones at midnight." },
  emptySet:   { he: "אין כאן שאלות עדיין",         en: "Nothing here yet" },
  more:       { he: "עוד שאלות",                   en: "More questions" },
  moreNote:   { he: "בחרו ספר או סרט, ותקבלו עשר שאלות.", en: "Pick a book or a film and get ten questions." },
  pickQuiz:   { he: "על מה לשחק?",                 en: "What do you want to play?" },
  backHome:   { he: "לשלוש של היום",               en: "Today's three" },
  ofThree:    { he: "מתוך שלוש",                   en: "of three" },
  filmNote:   { he: "כאן יש רק שאלות שנכונות גם בסרט וגם בספר.", en: "Only questions that hold in the film and in the book." },
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
