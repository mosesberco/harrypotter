"use client";

import { useEffect, useMemo, useState } from "react";
import { useUI, TIERS } from "@/lib/i18n";
import QuestionPlate, { type ClientQuestion } from "./QuestionPlate";
import { Staircase, Fleuron, Snitch } from "./Engravings";

/* ---------- the viewer's own record, kept in their browser ---------- */

type Day = { correct: boolean; difficulty: number };
type Store = Record<string, Day>;

const KEY = "hp.daily.v1";

function read(): Store {
  try {
    return JSON.parse(localStorage.getItem(KEY) || "{}");
  } catch {
    return {};
  }
}

function write(store: Store) {
  try {
    localStorage.setItem(KEY, JSON.stringify(store));
  } catch {}
}

function dayKey(d: Date) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Jerusalem",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(d);
}

/** Consecutive days answered correctly, counting back from today. */
function streakOf(store: Store, todayK: string) {
  let n = 0;
  const d = new Date();
  for (let i = 0; i < 400; i++) {
    const k = dayKey(d);
    if (k === todayK && !store[k]) {
      /* today not played yet — the streak stands on yesterday */
    } else if (store[k]?.correct) {
      n++;
    } else {
      break;
    }
    d.setDate(d.getDate() - 1);
  }
  return n;
}

/* ---------- countdown to the next question ---------- */

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
  const pad = (n: number) => String(n).padStart(2, "0");
  return (
    <p className="caption m-0">
      {t("nextIn")}{" "}
      <span className="folio" style={{ color: "var(--ink)", letterSpacing: ".06em" }}>
        {pad(Math.floor(ms / 3.6e6))}:{pad(Math.floor((ms % 3.6e6) / 6e4))}:{pad(Math.floor((ms % 6e4) / 1000))}
      </span>
    </p>
  );
}

/* ---------- the wax journal: five weeks of the viewer's own days ---------- */

const WAX = ["", "rgba(126,35,24,.30)", "rgba(126,35,24,.48)", "rgba(126,35,24,.66)", "rgba(126,35,24,.86)"];
const WEEKDAYS = { he: ["א", "ב", "ג", "ד", "ה", "ו", "ש"], en: ["S", "M", "T", "W", "T", "F", "S"] };

function WaxJournal({ store }: { store: Store }) {
  const { lang, t } = useUI();

  const cells = useMemo(() => {
    const today = new Date();
    const first = new Date(today);
    first.setDate(today.getDate() - 34);
    const out: { date: Date | null; future: boolean }[] = [];
    for (let i = 0; i < first.getDay(); i++) out.push({ date: null, future: false });
    for (let i = 0; i < 35; i++) {
      const d = new Date(first);
      d.setDate(first.getDate() + i);
      out.push({ date: d, future: false });
    }
    for (let i = 0; i < 6 - today.getDay(); i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i + 1);
      out.push({ date: d, future: true });
    }
    return out;
  }, []);

  const todayK = dayKey(new Date());

  return (
    <section className="mt-14">
      <div className="flex items-baseline gap-4 mb-5">
        <h3 className="display m-0 text-[1.15rem]">{t("journal")}</h3>
        <hr className="rule-hair flex-1" />
        <span className="caption">{lang === "he" ? "חמישה השבועות האחרונים" : "The last five weeks"}</span>
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
          {cells.map(({ date, future }, i) => {
            if (!date) return <span key={i} aria-hidden />;
            const k = dayKey(date);
            const rec = store[k];
            const isToday = k === todayK;
            const gold = rec?.correct && rec.difficulty === 5;
            const played = !!rec;
            return (
              <div key={i} className="relative grid place-items-center" style={{ aspectRatio: "1" }}>
                {played && rec.correct ? (
                  <span
                    className={`seal ${isToday ? "stamp" : ""}`}
                    style={{
                      width: "100%", height: "100%",
                      background: gold ? "var(--candle)" : WAX[Math.max(1, rec.difficulty)],
                      fontSize: ".66rem",
                      color: gold ? "#2A1C05" : "rgba(255,240,220,.94)",
                      boxShadow: isToday
                        ? "0 0 0 2px var(--ink), inset 0 1px 2px rgba(255,255,255,.28), inset 0 -2px 5px rgba(0,0,0,.45)"
                        : undefined,
                    }}
                    title={`${k} · ${TIERS[rec.difficulty - 1][lang]}`}
                  >
                    {date.getDate()}
                  </span>
                ) : (
                  <span
                    className="grid place-items-center folio"
                    style={{
                      width: "100%", height: "100%", borderRadius: "50%",
                      border: `1px ${played ? "solid" : "dashed"} ${played ? "var(--oxblood)" : future ? "var(--rule-soft)" : "var(--rule)"}`,
                      color: "var(--ink-3)", fontSize: ".64rem",
                      opacity: future ? 0.45 : 1,
                      outline: isToday ? "2px solid var(--ink)" : undefined,
                    }}
                    title={played ? `${k} · ✗` : k}
                  >
                    {date.getDate()}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <p className="marginalia text-[.82rem] mt-4 m-0">
        {lang === "he"
          ? "חותם שעווה — יום שנפתר. כמה שהשאלה קשה יותר, כך השעווה כהה יותר. חותם זהב — שאלה מרמה חמש."
          : "A wax seal is a day solved. The harder the question, the darker the wax. Gold is a level-five question."}
      </p>
    </section>
  );
}

/* ---------- the page body ---------- */

export default function DailyBoard({
  question,
  dayIndex,
}: {
  question: ClientQuestion;
  dayIndex: number;
}) {
  const { lang, t } = useUI();
  const [store, setStore] = useState<Store>({});
  const [ready, setReady] = useState(false);
  const [copied, setCopied] = useState(false);
  const todayK = dayKey(new Date());

  useEffect(() => {
    setStore(read());
    setReady(true);
  }, []);

  const today = store[todayK];
  const streak = ready ? streakOf(store, todayK) : 0;
  const step = ((dayIndex % 142) + 142) % 142 + 1;

  function record(correct: boolean) {
    const next = { ...read(), [todayK]: { correct, difficulty: question.difficulty } };
    write(next);
    setStore(next);
  }

  const share = useMemo(() => {
    if (!today) return "";
    const tier = TIERS[question.difficulty - 1];
    const mark = today.correct ? (question.difficulty === 5 ? "🟨" : "🟫") : "⬛";
    const date = new Date().toLocaleDateString(lang === "he" ? "he-IL" : "en-GB", {
      day: "numeric",
      month: "long",
    });
    return lang === "he"
      ? `🪄 שאלת היום · ${date}\n${mark} ${today.correct ? "עניתי נכון" : "פספסתי"} · ${tier.he}\nמדרגה ${step} מתוך 142 · רצף ${streak}`
      : `🪄 Today's Question · ${date}\n${mark} ${today.correct ? "Got it" : "Missed it"} · ${tier.en}\nStep ${step} of 142 · streak ${streak}`;
  }, [today, question.difficulty, lang, step, streak]);

  return (
    <div className="px-5 sm:px-9 py-10">
      <div className="mx-auto max-w-6xl">
        {/* masthead */}
        <div className="flex flex-wrap items-end gap-x-8 gap-y-3 mb-9">
          <div>
            <p className="caption m-0 mb-1.5">{t("dailyKicker")}</p>
            <h1
              className="display m-0"
              style={{ fontSize: "clamp(2rem,1.4rem + 2.4vw,3.1rem)", letterSpacing: "-.02em" }}
            >
              {t("daily")}
            </h1>
          </div>
          <div className="ms-auto text-end">
            <p className="caption m-0 mb-1">
              {t("streak")}{" "}
              <span className="folio" style={{ color: "var(--oxblood)", fontSize: "1.15rem" }}>
                {ready ? streak : "·"}
              </span>
              <span className="mx-2" style={{ opacity: 0.4 }}>·</span>
              {t("step")}{" "}
              <span className="folio" style={{ color: "var(--ink)", fontSize: "1.15rem" }}>
                {step}
              </span>{" "}
              {t("ofTotal")}
            </p>
            <Countdown />
          </div>
        </div>

        <div className="grid gap-8 lg:gap-12 items-start lg:[grid-template-columns:13rem_minmax(0,1fr)]">
          {/* the climb */}
          <aside className="order-2 lg:order-1">
            <div className="plate px-4 py-5">
              <p className="caption m-0 mb-1">{t("difficulty")}</p>
              <p className="display m-0 mb-4" style={{ fontSize: "1.05rem" }}>
                {TIERS[question.difficulty - 1][lang]}
              </p>
              <Staircase at={question.difficulty - 1} className="w-full" />
              <ol className="list-none p-0 m-0 mt-4">
                {TIERS.map((tier, i) => {
                  const on = i === question.difficulty - 1;
                  return (
                    <li
                      key={tier.key}
                      className="flex items-center gap-2.5 py-1.5"
                      style={{
                        borderTop: i ? "1px solid var(--rule-soft)" : undefined,
                        color: on ? "var(--oxblood)" : "var(--ink-3)",
                      }}
                    >
                      <span className="folio text-[.7rem] w-4">{tier.roman}</span>
                      <span style={{ fontSize: ".88rem", fontWeight: on ? 700 : 400 }}>{tier[lang]}</span>
                    </li>
                  );
                })}
              </ol>
            </div>
          </aside>

          {/* the question */}
          <div className="order-1 lg:order-2 min-w-0">
            {ready && today ? (
              <div className="plate deckle px-6 sm:px-10 py-10 text-center ink-in">
                <div className="grid place-items-center mb-5" style={{ color: "var(--ink-3)", opacity: 0.5 }}>
                  <Snitch size={130} />
                </div>
                <p className="display m-0" style={{ fontSize: "1.35rem" }}>
                  {today.correct
                    ? lang === "he" ? "פתרתם את שאלת היום." : "You solved today's question."
                    : lang === "he" ? "היום לא הסתדר." : "Today did not go your way."}
                </p>
                <p className="marginalia mt-3 m-0">{t("comeBack")}</p>
              </div>
            ) : (
              <QuestionPlate
                key={question.id}
                q={question}
                folio={`${t("daily")} · ${t("step")} ${step}/142`}
                onAnswered={record}
              />
            )}

            {/* share */}
            {ready && today && (
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
            )}

            {ready && <WaxJournal store={store} />}
          </div>
        </div>
      </div>
    </div>
  );
}
