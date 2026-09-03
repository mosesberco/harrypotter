"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useUI, TIERS } from "@/lib/i18n";
import QuestionPlate, { type ClientQuestion } from "./QuestionPlate";
import { Fleuron, Quill, Snitch } from "./Engravings";

/* ---------- the viewer's own record, kept in their browser ---------- */

type Day = { person?: boolean; place?: boolean; spell?: boolean };
type Store = Record<string, Day>;

const KEY = "hp.daily.v2";
const TABS = ["person", "place", "spell"] as const;
type Tab = (typeof TABS)[number];

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

const answeredCount = (d?: Day) => (d ? TABS.filter((t) => d[t] !== undefined).length : 0);
const rightCount = (d?: Day) => (d ? TABS.filter((t) => d[t] === true).length : 0);

/** Consecutive days with all three answered, counting back from today. */
function streakOf(store: Store, todayK: string) {
  let n = 0;
  const d = new Date();
  for (let i = 0; i < 400; i++) {
    const k = dayKey(d);
    if (k === todayK && answeredCount(store[k]) < 3) {
      /* today is not finished — the streak stands on yesterday */
    } else if (answeredCount(store[k]) === 3) {
      n++;
    } else {
      break;
    }
    d.setDate(d.getDate() - 1);
  }
  return n;
}

/* ---------- countdown ---------- */

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

/* ---------- the wax journal: how many of three, five weeks back ---------- */

const WAX = ["", "rgba(126,35,24,.38)", "rgba(126,35,24,.72)"];
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
            const right = rightCount(rec);
            const played = answeredCount(rec) > 0;
            const isToday = k === todayK;
            const gold = right === 3;
            return (
              <div key={i} className="relative grid place-items-center" style={{ aspectRatio: "1" }}>
                {played && right > 0 ? (
                  <span
                    className={`seal ${isToday ? "stamp" : ""}`}
                    style={{
                      width: "100%", height: "100%",
                      background: gold ? "var(--candle)" : WAX[right],
                      fontSize: ".66rem",
                      color: gold ? "#2A1C05" : "rgba(255,240,220,.94)",
                      boxShadow: isToday
                        ? "0 0 0 2px var(--ink), inset 0 1px 2px rgba(255,255,255,.28), inset 0 -2px 5px rgba(0,0,0,.45)"
                        : undefined,
                    }}
                    title={`${k} · ${right}/3`}
                  >
                    {date.getDate()}
                  </span>
                ) : (
                  <span
                    className="grid place-items-center folio"
                    style={{
                      width: "100%", height: "100%", borderRadius: "50%",
                      border: `1px ${played ? "solid" : "dashed"} ${
                        played ? "var(--oxblood)" : future ? "var(--rule-soft)" : "var(--rule)"
                      }`,
                      color: "var(--ink-3)", fontSize: ".64rem",
                      opacity: future ? 0.45 : 1,
                      outline: isToday ? "2px solid var(--ink)" : undefined,
                    }}
                    title={played ? `${k} · 0/3` : k}
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
          ? "כל חותם הוא יום. כמה שענית נכון יותר, השעווה כהה יותר — שלוש מתוך שלוש הן חותם זהב."
          : "Each seal is a day. The more you got right, the darker the wax — three out of three is gold."}
      </p>
    </section>
  );
}

/* ---------- the modal ---------- */

function Modal({
  questions,
  day,
  onAnswer,
  onClose,
}: {
  questions: Record<Tab, ClientQuestion>;
  day: Day;
  onAnswer: (tab: Tab, correct: boolean) => void;
  onClose: () => void;
}) {
  const { lang, t } = useUI();
  const firstOpen = TABS.find((tb) => day[tb] === undefined) ?? "person";
  const [tab, setTab] = useState<Tab>(firstOpen);

  /* escape closes; 1/2/3 switch tabs */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "1") setTab("person");
      if (e.key === "2") setTab("place");
      if (e.key === "3") setTab("spell");
    };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  const label: Record<Tab, string> = {
    person: t("tabPerson"),
    place: t("tabPlace"),
    spell: t("tabSpell"),
  };

  const q = questions[tab];
  const done = answeredCount(day) === 3;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={t("daily")}
      className="fixed inset-0 z-[100] grid place-items-center px-4 py-6"
      style={{ background: "rgba(12,9,5,.62)", backdropFilter: "blur(3px)" }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="plate deckle ink-in w-full"
        style={{ maxWidth: "44rem", maxHeight: "88vh", overflowY: "auto" }}
      >
        {/* modal masthead */}
        <div className="px-6 sm:px-9 pt-7">
          <div className="flex items-start gap-4">
            <span
              className="seal shrink-0 mt-1"
              style={{ background: "var(--seal)", width: 34, height: 34 }}
              aria-hidden
            >
              <Quill size={18} />
            </span>
            <div className="min-w-0">
              <p className="caption m-0 mb-1">{t("dailyKicker")}</p>
              <h2 className="display m-0" style={{ fontSize: "1.55rem", letterSpacing: "-.02em" }}>
                {t("daily")}
              </h2>
            </div>
            <button
              onClick={onClose}
              aria-label={t("close")}
              className="ms-auto folio shrink-0"
              style={{
                background: "none", border: "1px solid var(--rule)", borderRadius: "50%",
                width: 30, height: 30, cursor: "pointer", color: "var(--ink-2)", lineHeight: 1,
              }}
            >
              ×
            </button>
          </div>

          {/* three tabs */}
          <div className="flex items-stretch gap-0 mt-6" role="tablist">
            {TABS.map((tb) => {
              const on = tb === tab;
              const state = day[tb];
              return (
                <button
                  key={tb}
                  role="tab"
                  aria-selected={on}
                  onClick={() => setTab(tb)}
                  className="caption flex-1 flex items-center justify-center gap-2"
                  style={{
                    background: on ? "var(--wash)" : "transparent",
                    border: 0,
                    borderBottom: `2px solid ${on ? "var(--oxblood)" : "var(--rule-soft)"}`,
                    padding: ".7rem .4rem",
                    cursor: "pointer",
                    color: on ? "var(--ink)" : "var(--ink-3)",
                  }}
                >
                  {label[tb]}
                  <span
                    aria-hidden
                    style={{
                      width: 8, height: 8, borderRadius: "50%",
                      background:
                        state === true ? "var(--verdigris)" : state === false ? "var(--oxblood)" : "transparent",
                      border: state === undefined ? "1px solid var(--rule)" : 0,
                      display: "inline-block",
                    }}
                  />
                </button>
              );
            })}
          </div>
        </div>

        {/* the question */}
        <div className="px-6 sm:px-9 py-7">
          <QuestionPlate
            key={q.id}
            q={q}
            bare
            folio={`${label[tab]} · ${TIERS[q.difficulty - 1][lang]}`}
            onAnswered={(ok) => onAnswer(tab, ok)}
            footer={
              done ? (
                <button
                  onClick={onClose}
                  className="caption"
                  style={{
                    background: "var(--ink)", color: "var(--parchment-hi)",
                    border: 0, padding: ".65rem 1.7rem", cursor: "pointer",
                  }}
                >
                  {t("close")}
                </button>
              ) : (
                (() => {
                  const next = TABS.find((tb) => day[tb] === undefined && tb !== tab);
                  return next ? (
                    <button
                      onClick={() => setTab(next)}
                      className="caption"
                      style={{
                        background: "var(--ink)", color: "var(--parchment-hi)",
                        border: 0, padding: ".65rem 1.7rem", cursor: "pointer",
                      }}
                    >
                      {t("nextQ")}: {label[next]}
                    </button>
                  ) : null;
                })()
              )
            }
          />
        </div>
      </div>
    </div>
  );
}

/* ---------- the page ---------- */

export default function DailyBoard({ questions }: { questions: ClientQuestion[] }) {
  const { lang, t } = useUI();
  const [store, setStore] = useState<Store>({});
  const [ready, setReady] = useState(false);
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const todayK = dayKey(new Date());

  const trio = useMemo(
    () => ({ person: questions[0], place: questions[1], spell: questions[2] }) as Record<Tab, ClientQuestion>,
    [questions]
  );

  useEffect(() => {
    const s = read();
    setStore(s);
    setReady(true);
    /* the modal is the point of the page — open it unless today is finished */
    setOpen(answeredCount(s[dayKey(new Date())]) < 3);
  }, []);

  const day = store[todayK] ?? {};
  const streak = ready ? streakOf(store, todayK) : 0;

  const onAnswer = useCallback(
    (tab: Tab, correct: boolean) => {
      const current = read();
      const next: Store = { ...current, [todayK]: { ...(current[todayK] ?? {}), [tab]: correct } };
      write(next);
      setStore(next);
    },
    [todayK]
  );

  const share = useMemo(() => {
    if (answeredCount(day) === 0) return "";
    const marks = TABS.map((tb) => (day[tb] === true ? "🟫" : day[tb] === false ? "⬛" : "⬜")).join("");
    const date = new Date().toLocaleDateString(lang === "he" ? "he-IL" : "en-GB", {
      day: "numeric",
      month: "long",
    });
    const gold = rightCount(day) === 3 ? (lang === "he" ? " · שלוש מתוך שלוש" : " · three out of three") : "";
    return lang === "he"
      ? `🪄 שלוש היום · ${date}\nאדם ${day.person === true ? "✓" : "✗"}  מקום ${day.place === true ? "✓" : "✗"}  לחש ${day.spell === true ? "✓" : "✗"}\n${marks}${gold}\nרצף: ${streak}`
      : `🪄 Today's Three · ${date}\nPerson ${day.person === true ? "✓" : "✗"}  Place ${day.place === true ? "✓" : "✗"}  Spell ${day.spell === true ? "✓" : "✗"}\n${marks}${gold}\nStreak: ${streak}`;
  }, [day, lang, streak]);

  return (
    <div className="px-5 sm:px-9 py-10">
      <div className="mx-auto max-w-3xl">
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
            </p>
            <Countdown />
          </div>
        </div>

        {/* today's card, behind the modal */}
        <div className="plate deckle px-6 sm:px-10 py-10 text-center">
          <div className="grid place-items-center mb-5" style={{ color: "var(--ink-3)", opacity: 0.5 }}>
            <Snitch size={140} />
          </div>
          {ready && answeredCount(day) === 3 ? (
            <>
              <p className="display m-0" style={{ fontSize: "1.4rem" }}>
                {t("allDone")}
              </p>
              <p className="folio m-0 mt-3" style={{ fontSize: "1.6rem", color: "var(--ink)" }}>
                {rightCount(day)} / 3
              </p>
              <p className="marginalia mt-3 m-0">{t("comeBack")}</p>
            </>
          ) : (
            <>
              <p className="display m-0 mb-2" style={{ fontSize: "1.3rem" }}>
                {lang === "he" ? "אדם, מקום, לחש." : "A person, a place, a spell."}
              </p>
              <p className="marginalia m-0 mb-7">
                {lang === "he"
                  ? "שלוש שאלות, כל אחת עם המקור שלה בספר."
                  : "Three questions, each with its source in the book."}
              </p>
            </>
          )}
          <button
            onClick={() => setOpen(true)}
            className="caption mt-7"
            style={{
              background: "var(--ink)", color: "var(--parchment-hi)",
              border: 0, padding: ".8rem 2rem", cursor: "pointer",
            }}
          >
            {t("openDaily")}
          </button>
        </div>

        {/* share */}
        {ready && answeredCount(day) > 0 && (
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

      {ready && open && (
        <Modal questions={trio} day={day} onAnswer={onAnswer} onClose={() => setOpen(false)} />
      )}
    </div>
  );
}
