"use client";

import Link from "next/link";
import { useUI, TIERS } from "@/lib/i18n";
import { Snitch, Fleuron } from "@/components/Engravings";

export default function Home() {
  const { lang, t } = useUI();

  const examples: Record<string, { he: string; en: string }> = {
    muggle:  { he: "איזו חיה מסמלת את בית גריפינדור?", en: "Which beast stands for Gryffindor house?" },
    first:   { he: "מה שמו המלא של ניק כמעט-חסר-הראש?", en: "What is Nearly Headless Nick's full name?" },
    owl:     { he: "באיזו כספת בגרינגוטס הוחזקה אבן החכמים?", en: "Which Gringotts vault held the Stone?" },
    newt:    { he: "מה שחה באקווריום במשרדו של לופין?", en: "What swam in the tank in Lupin's office?" },
    mystery: { he: "כמה גרמי מדרגות יש בהוגוורטס?", en: "How many staircases does Hogwarts have?" },
  };

  return (
    <div className="px-5 sm:px-9 py-12 sm:py-16">
      <div className="mx-auto max-w-5xl">
        {/* title page */}
        <div className="text-center">
          <div
            className="grid place-items-center mb-6"
            style={{ color: "var(--ink-2)", opacity: 0.55 }}
            aria-hidden
          >
            <Snitch size={168} />
          </div>
          <p className="caption m-0 mb-5">{t("tagline")}</p>
          <h1
            className="display m-0"
            style={{ fontSize: "clamp(2.4rem,1.4rem + 4.4vw,5rem)", letterSpacing: "-.035em", lineHeight: .98 }}
          >
            {t("siteName")}
          </h1>
          <div className="flex items-center gap-3 mt-7 mb-2" style={{ color: "var(--ink-3)" }}>
            <hr className="rule flex-1" />
            <Fleuron />
            <hr className="rule flex-1" />
          </div>
          <p className="marginalia m-0 mx-auto" style={{ maxWidth: "34rem", fontSize: "1.02rem" }}>
            {lang === "he"
              ? "חמש רמות קושי, מ״מוגל״ ועד ״המחלקה למסתורין״. שבעת הספרים ושמונת הסרטים. כל שאלה נבדקה מול הטקסט, וכל תשובה מגיעה עם המקור שלה — פרק ושורה."
              : "Five levels, from Muggle to the Department of Mysteries. Seven books, eight films. Every question checked against the text, and every answer arrives with its source — chapter and verse."}
          </p>
        </div>

        {/* the ladder, as a printed table of contents */}
        <section className="mt-14 plate px-6 sm:px-10 py-8">
          <div className="flex items-baseline gap-4 mb-4">
            <h2 className="display m-0 text-[1.1rem]">
              {lang === "he" ? "סולם הקושי" : "The ladder"}
            </h2>
            <hr className="rule-hair flex-1" />
          </div>
          <ol className="list-none p-0 m-0">
            {TIERS.map((tier, n) => (
              <li
                key={tier.key}
                className="grid items-baseline gap-x-4 gap-y-1 py-4"
                style={{
                  gridTemplateColumns: "2rem minmax(6rem,10rem) minmax(0,1fr)",
                  borderTop: n ? "1px solid var(--rule-soft)" : undefined,
                }}
              >
                <span className="folio text-[.85rem]">{tier.roman}</span>
                <span className="display text-[1.02rem]">{tier[lang]}</span>
                <span className="marginalia text-[.92rem] min-w-0">
                  {examples[tier.key][lang]}
                </span>
              </li>
            ))}
          </ol>
        </section>

        <div className="flex flex-wrap items-center gap-4 mt-10 justify-center">
          <Link
            href="/daily"
            className="caption no-underline"
            style={{
              background: "var(--ink)", color: "var(--parchment-hi)",
              padding: ".85rem 2rem",
            }}
          >
            {t("daily")}
          </Link>
          <Link
            href="/quiz"
            className="caption no-underline"
            style={{
              color: "var(--ink)", padding: ".85rem 1.5rem",
              borderBottom: "1px solid var(--rule)",
            }}
          >
            {t("shelf")}
          </Link>
        </div>
      </div>
    </div>
  );
}
