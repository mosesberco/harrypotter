"use client";

import { useState, type ReactNode } from "react";
import { useUI, TIERS } from "@/lib/i18n";
import type { Question } from "@/content/sample";
import { Fleuron } from "./Engravings";

const HE_GLYPHS = ["א", "ב", "ג", "ד", "ה"];
const EN_GLYPHS = ["A", "B", "C", "D", "E"];

export default function QuestionPlate({
  q,
  folio,
  plate,
  onAnswered,
}: {
  q: Question;
  folio?: string;
  plate?: ReactNode;
  onAnswered?: (correct: boolean) => void;
}) {
  const { lang, t } = useUI();
  const [picked, setPicked] = useState<number | null>(null);
  const copy = q[lang];
  const tier = TIERS[q.difficulty - 1];
  const glyphs = lang === "he" ? HE_GLYPHS : EN_GLYPHS;
  const done = picked !== null;

  function pick(i: number) {
    if (done) return;
    setPicked(i);
    onAnswered?.(i === q.answer);
  }

  const scopeLabel =
    q.scope === "book" ? t("scopeBook") : q.scope === "film" ? t("scopeFilm") : t("scopeBoth");

  return (
    <article className="plate deckle ink-in px-6 sm:px-10 py-8 sm:py-10 overflow-hidden">
      {plate && (
        <div
          aria-hidden
          className="pointer-events-none absolute hidden sm:block"
          style={{
            insetBlockEnd: "-2.5rem",
            insetInlineEnd: "-2.5rem",
            color: "var(--ink)",
            opacity: 0.075,
          }}
        >
          {plate}
        </div>
      )}
      {/* margin column + body */}
      <div className="grid gap-7 sm:gap-10" style={{ gridTemplateColumns: "minmax(0,1fr)" }}>
        <div className="sm:grid sm:gap-10" style={{ gridTemplateColumns: "7rem 1px minmax(0,1fr)" }}>
          {/* --- margin --- */}
          <div className="flex sm:flex-col items-center sm:items-start gap-4 sm:gap-5 mb-6 sm:mb-0">
            <span
              className="seal shrink-0"
              style={{
                background: "var(--seal)",
                width: 46, height: 46,
                fontSize: "1.05rem", fontWeight: 600,
              }}
              title={tier[lang]}
            >
              {tier.roman}
            </span>
            <div className="min-w-0">
              <p className="caption m-0 leading-tight">{tier[lang]}</p>
              <p className="caption m-0 leading-tight mt-1" style={{ opacity: 0.7 }}>
                {scopeLabel}
              </p>
            </div>
          </div>

          <div className="hidden sm:block" style={{ background: "var(--rule-soft)" }} />

          {/* --- body --- */}
          <div className="min-w-0">
            {folio && (
              <p className="folio text-[.78rem] m-0 mb-3">
                {t("question")} · {folio}
              </p>
            )}

            <h2
              className="display m-0 mb-7"
              style={{ fontSize: "clamp(1.5rem, 1.15rem + 1.5vw, 2.15rem)", letterSpacing: "-.01em" }}
            >
              {copy.prompt}
            </h2>

            <div>
              {copy.choices.map((choice, i) => {
                const state = !done
                  ? undefined
                  : i === q.answer
                  ? "correct"
                  : i === picked
                  ? "wrong"
                  : "muted";
                return (
                  <button
                    key={i}
                    className="ledger-row"
                    data-state={state}
                    disabled={done}
                    onClick={() => pick(i)}
                  >
                    <span className="glyph">{glyphs[i]}</span>
                    <span style={{ fontSize: "1.06rem" }}>{choice}</span>
                    <span className="folio text-[.72rem]" style={{ opacity: done ? 1 : 0 }}>
                      {state === "correct" ? t("correct") : state === "wrong" ? t("wrong") : ""}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* --- the reveal: explanation + citation --- */}
            {done && (
              <div className="ink-in mt-8">
                <div className="flex items-center gap-3 mb-4" style={{ color: "var(--ink-3)" }}>
                  <hr className="rule-hair flex-1" />
                  <Fleuron />
                  <hr className="rule-hair flex-1" />
                </div>
                <p className="m-0" style={{ fontSize: "1.02rem" }}>
                  {copy.explanation}
                </p>
                <p className="marginalia m-0 mt-3 text-[.86rem]">
                  {t("source")}: {copy.source}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
