"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useUI } from "@/lib/i18n";
import { Candle, Fleuron, Quill } from "./Engravings";

export default function Chrome({ children }: { children: React.ReactNode }) {
  const { lang, setLang, theme, setTheme, t } = useUI();
  const path = usePathname();
  const home = path === "/";

  return (
    <div className="min-h-screen flex flex-col">
      {/* one line: the name, and the way to everything else */}
      <header className="px-4 sm:px-9 pt-5">
        <div className="mx-auto max-w-6xl flex items-center gap-4">
          <Link
            href="/"
            className="flex items-center gap-2.5 no-underline text-inherit min-w-0"
            style={{ minHeight: 44, paddingBlock: 8 }}
          >
            <span
              className="seal flicker shrink-0"
              style={{ background: "var(--seal)", width: 28, height: 28 }}
            >
              <Quill size={15} />
            </span>
            <span className="display text-[1.15rem] leading-none tracking-tight truncate">
              {t("siteName")}
            </span>
          </Link>

          <Link
            href={home ? "/quiz" : "/"}
            className="caption no-underline ms-auto shrink-0"
            style={{
              color: "var(--ink)",
              display: "inline-flex",
              alignItems: "center",
              minHeight: 44,
              boxShadow: "inset 0 -1px 0 var(--oxblood)",
            }}
          >
            {home ? t("more") : t("backHome")}
          </Link>
        </div>

        <div className="mx-auto max-w-6xl mt-4 flex items-center gap-3" style={{ color: "var(--ink-3)" }}>
          <hr className="rule-double flex-1" />
          <Fleuron />
          <hr className="rule-double flex-1" />
        </div>
      </header>

      <main className="flex-1">{children}</main>

      {/* the two switches live down here, out of the way */}
      <footer className="px-4 sm:px-9 pb-8 pt-12">
        <div className="mx-auto max-w-6xl">
          <hr className="rule-hair mb-4" />
          <div className="flex items-center gap-5">
            <button
              onClick={() => setLang(lang === "he" ? "en" : "he")}
              className="caption"
              style={{ color: "var(--ink-2)", background: "none", border: 0, cursor: "pointer", minHeight: 44, padding: "0 .25rem" }}
            >
              {lang === "he" ? "English" : "עברית"}
            </button>

            <button
              onClick={() => setTheme(theme === "light" ? "dark" : "light")}
              style={{ color: "var(--ink-2)", background: "none", border: 0, cursor: "pointer", minHeight: 44, padding: "0 .6rem", lineHeight: 0 }}
              aria-label={theme === "light" ? "Candlelight" : "Daylight"}
            >
              <Candle lit={theme === "dark"} className={theme === "dark" ? "flicker" : undefined} />
            </button>

            <p className="marginalia text-[.8rem] m-0 ms-auto text-end" style={{ color: "var(--ink-3)" }}>
              {lang === "he" ? "אתר של מעריצים. שבעה ספרים, שמונה סרטים." : "A fan site. Seven books, eight films."}
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
