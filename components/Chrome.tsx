"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useUI } from "@/lib/i18n";
import { Candle, Fleuron } from "./Engravings";

export default function Chrome({ children }: { children: React.ReactNode }) {
  const { lang, setLang, theme, setTheme, t } = useUI();
  const path = usePathname();

  const nav = [
    { href: "/daily", label: t("daily") },
    { href: "/quiz", label: t("practice") },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <header className="px-5 sm:px-9 pt-6">
        <div className="mx-auto max-w-6xl flex items-baseline gap-5">
          <Link href="/" className="group flex items-baseline gap-3 no-underline text-inherit">
            <span
              className="seal flicker shrink-0 self-center"
              style={{
                background: "var(--seal)",
                width: 30, height: 30,
                fontSize: ".7rem", letterSpacing: ".02em",
              }}
            >
              142
            </span>
            <span className="display text-[1.32rem] leading-none tracking-tight">
              {t("siteName")}
            </span>
          </Link>

          <nav className="ms-auto flex items-center gap-6">
            {nav.map((n) => {
              const on = path === n.href;
              return (
                <Link
                  key={n.href}
                  href={n.href}
                  className="caption no-underline transition-colors"
                  style={{
                    color: on ? "var(--ink)" : "var(--ink-3)",
                    borderBottom: on ? "1px solid var(--oxblood)" : "1px solid transparent",
                    paddingBottom: 3,
                  }}
                >
                  {n.label}
                </Link>
              );
            })}

            <span aria-hidden className="hidden sm:block h-4 w-px" style={{ background: "var(--rule)" }} />

            <button
              onClick={() => setLang(lang === "he" ? "en" : "he")}
              className="caption"
              style={{ color: "var(--ink-2)", background: "none", border: 0, cursor: "pointer", padding: 0 }}
              aria-label={lang === "he" ? "Switch to English" : "החלף לעברית"}
            >
              {lang === "he" ? "EN" : "עב"}
            </button>

            <button
              onClick={() => setTheme(theme === "light" ? "dark" : "light")}
              style={{ color: "var(--ink-2)", background: "none", border: 0, cursor: "pointer", padding: 0, lineHeight: 0 }}
              aria-label={theme === "light" ? "Candlelight" : "Daylight"}
            >
              <Candle lit={theme === "dark"} className={theme === "dark" ? "flicker" : undefined} />
            </button>
          </nav>
        </div>

        <div className="mx-auto max-w-6xl mt-4 flex items-center gap-3" style={{ color: "var(--ink-3)" }}>
          <hr className="rule-double flex-1" />
          <Fleuron />
          <hr className="rule-double flex-1" />
        </div>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="px-5 sm:px-9 pb-8 pt-14">
        <div className="mx-auto max-w-6xl">
          <hr className="rule-hair mb-3" />
          <p className="marginalia text-[.8rem] m-0" style={{ color: "var(--ink-3)" }}>
            {lang === "he"
              ? "אתר מעריצים. שבעת הספרים ושמונת הסרטים. כל השאלות עם מקור."
              : "A fan project. Seven books, eight films. Every question sourced."}
          </p>
        </div>
      </footer>
    </div>
  );
}
