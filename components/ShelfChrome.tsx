"use client";

import Link from "next/link";
import { useState } from "react";
import { useUI, TIERS } from "@/lib/i18n";
import { Fleuron } from "./Engravings";

type Row = {
  slug: string;
  kind: "all" | "book" | "film";
  he: string;
  en: string;
  n: number;
  byDifficulty: Record<number, number>;
};

export default function ShelfChrome({ rows }: { rows: Row[] }) {
  const { lang, t } = useUI();
  const [level, setLevel] = useState<number | null>(null);

  const groups: { key: "all" | "book" | "film"; label: string }[] = [
    { key: "all", label: t("everything") },
    { key: "book", label: t("byBook") },
    { key: "film", label: t("byFilm") },
  ];

  const href = (slug: string) => (level ? `/quiz/${slug}?d=${level}` : `/quiz/${slug}`);
  const avail = (r: Row) => (level ? r.byDifficulty[level] ?? 0 : r.n);

  return (
    <div className="px-5 sm:px-9 py-10">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8">
          <p className="caption m-0 mb-1.5">{lang === "he" ? "בחרו חידון" : "Pick a quiz"}</p>
          <h1 className="display m-0" style={{ fontSize: "clamp(2rem,1.4rem + 2.4vw,3.1rem)", letterSpacing: "-.02em" }}>
            {t("shelf")}
          </h1>
        </div>

        {/* difficulty selector — five wax stamps plus "all levels" */}
        <div className="plate px-5 sm:px-7 py-5 mb-10">
          <div className="flex flex-wrap items-center gap-x-6 gap-y-4">
            <span className="caption">{t("difficulty")}</span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setLevel(null)}
                className="caption"
                style={{
                  background: level === null ? "var(--ink)" : "transparent",
                  color: level === null ? "var(--parchment-hi)" : "var(--ink-3)",
                  border: level === null ? 0 : "1px solid var(--rule)",
                  padding: ".42rem 1rem", cursor: "pointer",
                }}
              >
                {t("anyLevel")}
              </button>
              {TIERS.map((tier, i) => {
                const on = level === i + 1;
                return (
                  <button
                    key={tier.key}
                    onClick={() => setLevel(i + 1)}
                    title={tier[lang]}
                    aria-label={tier[lang]}
                    className={on ? "seal" : ""}
                    style={{
                      width: 34, height: 34, borderRadius: "50%",
                      background: on ? "var(--seal)" : "transparent",
                      color: on ? "rgba(255,240,220,.92)" : "var(--ink-3)",
                      border: on ? 0 : "1px solid var(--rule)",
                      fontFamily: "var(--font-latin)", fontSize: ".82rem",
                      cursor: "pointer", display: "grid", placeItems: "center",
                    }}
                  >
                    {tier.roman}
                  </button>
                );
              })}
            </div>
            {level && (
              <span className="marginalia text-[.86rem]">{TIERS[level - 1][lang]}</span>
            )}
          </div>
        </div>

        {groups.map((g) => {
          const list = rows.filter((r) => r.kind === g.key);
          if (!list.length) return null;
          return (
            <section key={g.key} className="mb-11">
              <div className="flex items-center gap-3 mb-4" style={{ color: "var(--ink-3)" }}>
                <h2 className="display m-0 text-[1.05rem]" style={{ color: "var(--ink)" }}>
                  {g.label}
                </h2>
                <hr className="rule-hair flex-1" />
                {g.key === "film" && <Fleuron />}
              </div>

              {g.key === "film" && (
                <p className="marginalia text-[.84rem] mt-0 mb-4">{t("filmNote")}</p>
              )}

              <div
                className="grid gap-3"
                style={{ gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 15rem), 1fr))" }}
              >
                {list.map((r) => {
                  const n = avail(r);
                  const empty = n === 0;
                  const body = (
                    <>
                      <span className="display block" style={{ fontSize: "1.02rem" }}>
                        {r[lang]}
                      </span>
                      <span className="folio block mt-1.5 text-[.78rem]">
                        {empty ? t("emptySet") : `${n} ${t("questions")}`}
                      </span>
                    </>
                  );
                  return empty ? (
                    <div
                      key={r.slug}
                      className="plate px-5 py-4"
                      style={{ opacity: 0.45, cursor: "not-allowed" }}
                    >
                      {body}
                    </div>
                  ) : (
                    <Link
                      key={r.slug}
                      href={href(r.slug)}
                      className="plate px-5 py-4 no-underline text-inherit transition-transform"
                      style={{ display: "block" }}
                    >
                      {body}
                    </Link>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
