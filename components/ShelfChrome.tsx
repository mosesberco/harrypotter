"use client";

import Link from "next/link";
import { useState } from "react";
import { useUI, TIERS } from "@/lib/i18n";

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
    <div className="px-4 sm:px-9 py-7 sm:py-10">
      <div className="mx-auto max-w-3xl">
        <h1
          className="display m-0 mb-6"
          style={{ fontSize: "clamp(1.85rem,1.3rem + 2.2vw,3rem)", letterSpacing: "-.02em" }}
        >
          {t("pickQuiz")}
        </h1>

        {/* how hard: all levels, or one of the five */}
        <div className="mb-8">
          <p className="caption m-0 mb-2">{t("difficulty")}</p>
          <div className="flex items-center gap-2 overflow-x-auto pb-1 -mx-4 px-4 sm:mx-0 sm:px-0">
            <button
              onClick={() => setLevel(null)}
              className="caption shrink-0"
              style={{
                background: level === null ? "var(--ink)" : "transparent",
                color: level === null ? "var(--parchment-hi)" : "var(--ink-3)",
                border: level === null ? 0 : "1px solid var(--rule)",
                minHeight: 44, padding: "0 1rem", cursor: "pointer",
              }}
            >
              {t("anyLevel")}
            </button>
            {TIERS.map((tier, i) => {
              const on = level === i + 1;
              return (
                <button
                  key={tier.key}
                  onClick={() => setLevel(on ? null : i + 1)}
                  className="caption shrink-0"
                  style={{
                    background: on ? "var(--ink)" : "transparent",
                    color: on ? "var(--parchment-hi)" : "var(--ink-3)",
                    border: on ? 0 : "1px solid var(--rule)",
                    minHeight: 44, padding: "0 .9rem", cursor: "pointer",
                  }}
                >
                  {tier[lang]}
                </button>
              );
            })}
          </div>
        </div>

        {groups.map((g) => {
          const list = rows.filter((r) => r.kind === g.key);
          if (!list.length) return null;
          return (
            <section key={g.key} className="mb-9">
              {/* the single "everything" row names itself; it needs no heading */}
              {g.key !== "all" && (
                <div className="flex items-center gap-3 mb-1" style={{ color: "var(--ink-3)" }}>
                  <h2 className="display m-0 text-[1rem]" style={{ color: "var(--ink)" }}>
                    {g.label}
                  </h2>
                  <hr className="rule-hair flex-1" />
                </div>
              )}

              {g.key === "film" && (
                <p className="marginalia text-[.84rem] mt-1 mb-1">{t("filmNote")}</p>
              )}

              <div>
                {list.map((r) => {
                  const n = avail(r);
                  const body = (
                    <>
                      <span className="display" style={{ fontSize: "1.02rem" }}>
                        {r[lang]}
                      </span>
                      <span className="folio text-[.78rem] ms-auto shrink-0">
                        {n === 0 ? t("emptySet") : `${n} ${t("questions")}`}
                      </span>
                    </>
                  );
                  const style = {
                    display: "flex",
                    alignItems: "baseline",
                    gap: ".75rem",
                    minHeight: 56,
                    padding: ".9rem .25rem",
                    borderBottom: "1px solid var(--rule-soft)",
                  } as const;

                  return n === 0 ? (
                    <div key={r.slug} style={{ ...style, opacity: 0.4 }}>
                      {body}
                    </div>
                  ) : (
                    <Link
                      key={r.slug}
                      href={href(r.slug)}
                      className="no-underline text-inherit"
                      style={style}
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
