"use client";

import { useEffect, useMemo, useState } from "react";
import { useUI, TIERS } from "@/lib/i18n";
import { SAMPLE } from "@/content/sample";
import QuestionPlate from "@/components/QuestionPlate";
import { Staircase, Tank, Fleuron } from "@/components/Engravings";

/* ---------- the day's rung, and the countdown to the next one ---------- */

function msToJerusalemMidnight() {
  const now = new Date();
  const jer = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Jerusalem" }));
  const next = new Date(jer);
  next.setHours(24, 0, 0, 0);
  return next.getTime() - jer.getTime();
}

function Countdown() {
  const { t } = useUI();
  const [ms, setMs] = useState<number | null>(null);
  useEffect(() => {
    setMs(msToJerusalemMidnight());
    const id = setInterval(() => setMs(msToJerusalemMidnight()), 1000);
    return () => clearInterval(id);
  }, []);
  if (ms === null) return null;
  const h = Math.floor(ms / 3.6e6);
  const m = Math.floor((ms % 3.6e6) / 6e4);
  const s = Math.floor((ms % 6e4) / 1000);
  const pad = (n: number) => String(n).padStart(2, "0");
  return (
    <p className="caption m-0">
      {t("nextIn")}{" "}
      <span className="folio" style={{ color: "var(--ink)", letterSpacing: ".06em" }}>
        {pad(h)}:{pad(m)}:{pad(s)}
      </span>
    </p>
  );
}

/* ---------- the wax journal ---------- */

const WAX = [
  "transparent",
  "rgba(126,35,24,.30)",
  "rgba(126,35,24,.48)",
  "rgba(126,35,24,.66)",
  "rgba(126,35,24,.86)",
];

/* five weeks back to today, weekday-aligned. 0 = missed, 1..5 = rung reached */
const HISTORY = [
  3, 4, 2, 5, 4, 4, 3,
  5, 0, 3, 4, 5, 5, 2,
  4, 3, 4, 5, 0, 4, 3,
  5, 4, 4, 5, 3, 4, 5,
  4, 3, 5, 4, 4, 5, 4,
];

const WEEKDAYS = {
  he: ["א", "ב", "ג", "ד", "ה", "ו", "ש"],
  en: ["S", "M", "T", "W", "T", "F", "S"],
};

function WaxJournal() {
  const { lang, t } = useUI();

  /* the grid ends on today; lead cells pad it so columns line up with weekdays */
  const cells = useMemo(() => {
    const today = new Date();
    const first = new Date(today);
    first.setDate(today.getDate() - (HISTORY.length - 1));

    const out: { date: Date | null; level: number | null }[] = [];
    for (let i = 0; i < first.getDay(); i++) out.push({ date: null, level: null });
    HISTORY.forEach((level, i) => {
      const d = new Date(first);
      d.setDate(first.getDate() + i);
      out.push({ date: d, level });
    });
    for (let i = 0; i < 6 - today.getDay(); i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i + 1);
      out.push({ date: d, level: null });
    }
    return out;
  }, []);

  const rangeLabel = lang === "he" ? "חמישה השבועות האחרונים" : "The last five weeks";

  return (
    <section className="mt-16">
      <div className="flex items-baseline gap-4 mb-5">
        <h3 className="display m-0 text-[1.15rem]">{t("journal")}</h3>
        <hr className="rule-hair flex-1" />
        <span className="caption">{rangeLabel}</span>
      </div>

      <div style={{ maxWidth: "22rem" }}>
        <div className="grid gap-2" style={{ gridTemplateColumns: "repeat(7, minmax(0,1fr))" }}>
          {WEEKDAYS[lang].map((d, i) => (
            <span key={i} className="caption text-center m-0" style={{ fontSize: ".62rem" }}>
              {d}
            </span>
          ))}
        </div>

        <div className="grid gap-2 mt-2" style={{ gridTemplateColumns: "repeat(7, minmax(0,1fr))" }}>
          {cells.map(({ date, level }, i) => {
            if (!date) return <span key={i} aria-hidden />;
            const day = date.getDate();
            const today = date.toDateString() === new Date().toDateString();
            const gold = level === 5;
            return (
              <div
                key={i}
                title={`${day} · ${level ? TIERS[level - 1][lang] : "\u2014"}`}
                className="relative grid place-items-center"
                style={{ aspectRatio: "1" }}
              >
                {level === null ? (
                  <span
                    className="grid place-items-center folio"
                    style={{
                      width: "100%", height: "100%", borderRadius: "50%",
                      border: "1px dashed var(--rule-soft)", color: "var(--ink-3)",
                      fontSize: ".64rem", opacity: .45,
                    }}
                  >
                    {day}
                  </span>
                ) : level === 0 ? (
                  <span
                    className="grid place-items-center folio"
                    style={{
                      width: "100%", height: "100%", borderRadius: "50%",
                      border: "1px dashed var(--rule)", color: "var(--ink-3)",
                      fontSize: ".64rem",
                    }}
                  >
                    {day}
                  </span>
                ) : (
                  <span
                    className={`seal ${today ? "stamp" : ""}`}
                    style={{
                      width: "100%", height: "100%",
                      background: gold ? "var(--candle)" : WAX[level],
                      fontSize: ".66rem",
                      color: gold ? "#2A1C05" : "rgba(255,240,220,.94)",
                      boxShadow: today
                        ? "0 0 0 2px var(--ink), inset 0 1px 2px rgba(255,255,255,.28), inset 0 -2px 5px rgba(0,0,0,.45)"
                        : undefined,
                    }}
                  >
                    {day}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <p className="marginalia text-[.82rem] mt-4 m-0">
        {lang === "he"
          ? "כמה שהשעווה כהה יותר, כך טיפסת גבוה יותר. חותם זהב \u2014 חמש מתוך חמש."
          : "Darker wax, higher climb. A gold seal is five out of five."}
      </p>
    </section>
  );
}

/* ---------- the page ---------- */

export default function DailyPage() {
  const { lang, t } = useUI();
  const [at, setAt] = useState(3);          // rung you are standing on (0-indexed)
  const [copied, setCopied] = useState(false);
  const q = SAMPLE[Math.min(at, SAMPLE.length - 1)];

  const share = useMemo(() => {
    const perfect = at === TIERS.length;
    const rungs = TIERS.map((_, i) => (i < at ? (perfect ? "🟨" : "🟫") : "⬛")).join("");
    const reached = at > 0 ? TIERS[at - 1][lang] : "—";
    return lang === "he"
      ? `🪄 החמישייה · 2 בספטמבר\n${rungs}  הגעתי ל${reached}\nרצף: 12 · אחוזון 94`
      : `🪄 The Five · 2 September\n${rungs}  I reached ${reached}\nStreak: 12 · 94th percentile`;
  }, [at, lang]);

  return (
    <div className="px-5 sm:px-9 py-10">
      <div className="mx-auto max-w-6xl">
        {/* masthead of the day */}
        <div className="flex flex-wrap items-end gap-x-8 gap-y-3 mb-9">
          <div>
            <p className="caption m-0 mb-1.5">
              {lang === "he" ? "החידון היומי" : "Today's quiz"}
            </p>
            <h1 className="display m-0" style={{ fontSize: "clamp(2rem,1.4rem + 2.4vw,3.1rem)", letterSpacing: "-.02em" }}>
              {t("daily")}
            </h1>
          </div>
          <div className="ms-auto text-end">
            <p className="caption m-0 mb-1">
              {t("streak")} <span className="folio" style={{ color: "var(--oxblood)", fontSize: "1.15rem" }}>12</span>
              <span className="mx-2" style={{ opacity: .4 }}>·</span>
              {t("percentile")} <span className="folio" style={{ color: "var(--ink)", fontSize: "1.15rem" }}>94</span>
            </p>
            <Countdown />
          </div>
        </div>

        <div className="grid gap-8 lg:gap-12" style={{ gridTemplateColumns: "minmax(0,1fr)" }}>
          <div className="grid gap-8 lg:gap-12 items-start" style={{ gridTemplateColumns: "minmax(0,1fr)" }}>
            <div
              className="grid gap-8 lg:gap-12 items-start lg:[grid-template-columns:13rem_minmax(0,1fr)]"
            >
              {/* the climb */}
              <aside className="order-2 lg:order-1">
                <div className="plate px-4 py-5">
                  <p className="caption m-0 mb-1">{t("climbed")}</p>
                  <p className="folio m-0 mb-4" style={{ fontSize: "2rem", color: "var(--ink)", lineHeight: 1 }}>
                    103 <span className="text-[.7rem]" style={{ color: "var(--ink-3)" }}>{t("ofTotal")}</span>
                  </p>
                  <Staircase at={at} className="w-full" />
                  <ol className="list-none p-0 m-0 mt-4">
                    {TIERS.map((tier, i) => (
                      <li
                        key={tier.key}
                        className="flex items-center gap-2.5 py-1.5"
                        style={{
                          borderTop: i ? "1px solid var(--rule-soft)" : undefined,
                          color: i < at ? "var(--ink)" : i === at ? "var(--oxblood)" : "var(--ink-3)",
                        }}
                      >
                        <span className="folio text-[.7rem] w-4">{tier.roman}</span>
                        <span style={{ fontSize: ".88rem", fontWeight: i === at ? 700 : 400 }}>
                          {tier[lang]}
                        </span>
                        {i < at && <span className="ms-auto" style={{ color: "var(--verdigris)" }}>✓</span>}
                      </li>
                    ))}
                  </ol>
                </div>
              </aside>

              {/* the question */}
              <div className="order-1 lg:order-2 min-w-0">
                <QuestionPlate
                  key={q.id}
                  q={q}
                  folio={`${at + 1}/5`}
                  plate={<Tank size={330} />}
                  onAnswered={(ok) => ok && setAt((n) => Math.min(n + 1, TIERS.length))}
                />

                {/* share block */}
                <div className="plate mt-8 px-6 py-6">
                  <div className="flex items-center gap-3 mb-4" style={{ color: "var(--ink-3)" }}>
                    <span className="caption">{t("share")}</span>
                    <hr className="rule-hair flex-1" />
                    <Fleuron />
                  </div>
                  <pre
                    className="m-0 whitespace-pre-wrap"
                    style={{ fontFamily: "var(--font-body)", fontSize: "1rem", lineHeight: 1.7 }}
                  >
                    {share}
                  </pre>
                  <button
                    onClick={() => {
                      navigator.clipboard?.writeText(share);
                      setCopied(true);
                      setTimeout(() => setCopied(false), 1600);
                    }}
                    className="caption mt-5"
                    style={{
                      background: "var(--ink)", color: "var(--parchment-hi)",
                      border: 0, padding: ".6rem 1.4rem", cursor: "pointer",
                    }}
                  >
                    {copied ? t("copied") : lang === "he" ? "העתקה לוואטסאפ" : "Copy for WhatsApp"}
                  </button>
                </div>

                <WaxJournal />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
