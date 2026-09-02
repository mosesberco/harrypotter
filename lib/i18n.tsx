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
  siteName:   { he: "מאה ארבעים ושתיים",           en: "One Hundred Forty-Two" },
  tagline:    { he: "חידון לפוטרהדים בלבד",        en: "A quiz for Potterheads only" },
  daily:      { he: "החמישייה",                    en: "The Five" },
  practice:   { he: "אימון",                       en: "Practice" },
  question:   { he: "שאלה",                        en: "Question" },
  source:     { he: "מקור",                        en: "Source" },
  reveal:     { he: "התשובה",                      en: "The answer" },
  next:       { he: "הבאה",                        en: "Next" },
  streak:     { he: "רצף",                         en: "Streak" },
  percentile: { he: "אחוזון",                      en: "Percentile" },
  reachedTo:  { he: "הגעתי ל",                     en: "I reached " },
  nextIn:     { he: "החידון הבא בעוד",             en: "Next quiz in" },
  climbed:    { he: "מדרגות שעלית",                en: "Stairs climbed" },
  ofTotal:    { he: "מתוך 142",                    en: "of 142" },
  share:      { he: "שתפו את התוצאה",              en: "Share result" },
  copied:     { he: "הועתק",                       en: "Copied" },
  scopeBook:  { he: "ספרים",                       en: "Books" },
  scopeFilm:  { he: "סרטים",                       en: "Films" },
  scopeBoth:  { he: "ספרים וסרטים",                en: "Books & films" },
  correct:    { he: "נכון",                        en: "Correct" },
  wrong:      { he: "לא נכון",                     en: "Not quite" },
  journal:    { he: "יומן השעווה",                 en: "The wax journal" },
  begin:      { he: "התחילו את הטיפוס",            en: "Begin the climb" },
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
