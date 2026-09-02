"use client";

import { useState } from "react";
import { useUI, TIERS } from "@/lib/i18n";
import { SAMPLE } from "@/content/sample";
import QuestionPlate from "@/components/QuestionPlate";
import { Snitch, Tank } from "@/components/Engravings";

export default function QuizPage() {
  const { lang, t } = useUI();
  const [i, setI] = useState(4);
  const q = SAMPLE[i];

  return (
    <div className="px-5 sm:px-9 py-10">
      <div className="mx-auto max-w-4xl">
        <div className="flex flex-wrap items-end gap-x-8 gap-y-4 mb-8">
          <div>
            <p className="caption m-0 mb-1.5">
              {lang === "he" ? "אימון חופשי" : "Free practice"}
            </p>
            <h1
              className="display m-0"
              style={{ fontSize: "clamp(1.8rem,1.3rem + 2vw,2.6rem)", letterSpacing: "-.02em" }}
            >
              {t("practice")}
            </h1>
          </div>

          {/* rung picker — five wax stamps */}
          <div className="ms-auto flex items-center gap-2">
            {TIERS.map((tier, n) => {
              const on = n === i;
              return (
                <button
                  key={tier.key}
                  onClick={() => setI(n)}
                  title={tier[lang]}
                  aria-label={tier[lang]}
                  className={on ? "seal" : ""}
                  style={{
                    width: 34, height: 34,
                    background: on ? "var(--seal)" : "transparent",
                    color: on ? "rgba(255,240,220,.92)" : "var(--ink-3)",
                    border: on ? 0 : "1px solid var(--rule)",
                    borderRadius: "50%",
                    fontFamily: "var(--font-latin)",
                    fontSize: ".82rem",
                    cursor: "pointer",
                    display: "grid",
                    placeItems: "center",
                    transition: "color .2s ease, border-color .2s ease",
                  }}
                >
                  {tier.roman}
                </button>
              );
            })}
          </div>
        </div>

        <QuestionPlate
          key={q.id}
          q={q}
          folio={`${i + 1} · ${TIERS[i][lang]}`}
          plate={i >= 3 ? <Tank size={330} /> : <Snitch size={380} />}
        />

        <p className="marginalia text-[.85rem] mt-6 m-0">
          {lang === "he"
            ? "באימון אין רצף ואין נקודות בית — רק שאלות ומקורות."
            : "Practice carries no streak and no house points — only questions and their sources."}
        </p>
      </div>
    </div>
  );
}
