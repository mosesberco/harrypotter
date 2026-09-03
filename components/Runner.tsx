"use client";

import { useState } from "react";
import Link from "next/link";
import { useUI } from "@/lib/i18n";
import QuestionPlate, { type ClientQuestion } from "./QuestionPlate";
import { Fleuron, Snitch } from "./Engravings";

export default function Runner({
  questions,
  title,
  slug,
}: {
  questions: ClientQuestion[];
  title: string;
  slug: string;
}) {
  const { lang, t } = useUI();
  const [at, setAt] = useState(0);
  const [right, setRight] = useState(0);
  const [answered, setAnswered] = useState(false);

  const q = questions[at];
  const last = at === questions.length - 1;
  const finished = at >= questions.length;

  if (finished) {
    const pct = Math.round((right / questions.length) * 100);
    return (
      <div className="plate deckle px-5 sm:px-12 py-10 sm:py-12 text-center ink-in">
        <div className="grid place-items-center mb-6" style={{ color: "var(--ink-3)", opacity: 0.5 }}>
          <Snitch size={150} />
        </div>
        <p className="caption m-0 mb-3">{t("score")}</p>
        <p
          className="display m-0"
          style={{ fontSize: "clamp(2.6rem,2rem + 3vw,4.4rem)", lineHeight: 1, letterSpacing: "-.03em" }}
        >
          {right}
          <span style={{ color: "var(--ink-3)", fontSize: ".42em" }}> / {questions.length}</span>
        </p>
        <div className="flex items-center gap-3 my-7 mx-auto" style={{ color: "var(--ink-3)", maxWidth: "22rem" }}>
          <hr className="rule-hair flex-1" />
          <Fleuron />
          <hr className="rule-hair flex-1" />
        </div>
        <p className="marginalia m-0">
          {pct === 100
            ? lang === "he" ? "הכל נכון." : "All correct."
            : pct >= 70
            ? lang === "he" ? "קרוב מאוד." : "Very close."
            : lang === "he" ? "שווה עוד סיבוב." : "Worth another go."}
        </p>
        <div className="grid gap-3 mt-9 mx-auto" style={{ maxWidth: "22rem" }}>
          <Link href={`/quiz/${slug}`} className="btn caption btn-wide">
            {t("again")}
          </Link>
          <Link href="/quiz" className="btn btn-quiet caption btn-wide">
            {t("backToShelf")}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* progress: one tick per question, filled as you go */}
      <div className="flex items-center gap-3 mb-5">
        <span className="caption truncate hidden sm:block">{title}</span>
        <div className="flex-1 flex items-center gap-1.5">
          {questions.map((_, i) => (
            <span
              key={i}
              style={{
                height: 3,
                flex: 1,
                background:
                  i < at ? "var(--ink-2)" : i === at ? "var(--oxblood)" : "var(--rule-soft)",
              }}
            />
          ))}
        </div>
        <span className="folio text-[.78rem]">
          {at + 1} / {questions.length}
        </span>
      </div>

      <QuestionPlate
        key={q.id}
        q={q}
        folio={`${t("question")} ${at + 1}`}
        onAnswered={(ok) => {
          setAnswered(true);
          if (ok) setRight((n) => n + 1);
        }}
        footer={
          answered ? (
            <button
              onClick={() => {
                setAnswered(false);
                setAt((n) => n + 1);
              }}
              className="btn caption btn-wide sm:w-auto"
            >
              {last ? t("finish") : t("nextQ")}
            </button>
          ) : null
        }
      />
    </div>
  );
}
