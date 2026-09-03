"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useUI } from "@/lib/i18n";
import QuestionPlate, { type ClientQuestion } from "./QuestionPlate";
import { Fleuron } from "./Engravings";

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

/** ✓ right, ✗ wrong, · not answered yet */
const mark = (v?: boolean) => (v === true ? "✓" : v === false ? "✗" : "·");

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
    <p className="caption m-0 mt-1" style={{ fontSize: ".64rem" }}>
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
    <section className="mt-12">
      <div className="flex items-baseline gap-3 mb-4">
        <h2 className="display m-0 text-[1.05rem]">{t("journal")}</h2>
        <hr className="rule-hair flex-1" />
      </div>

      <div className="grid gap-1.5" style={{ gridTemplateColumns: "repeat(7, minmax(0,1fr))" }}>
        {WEEKDAYS[lang].map((d, i) => (
          <span key={i} className="caption text-center m-0" style={{ fontSize: ".6rem" }}>
            {d}
          </span>
        ))}

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

      <p className="marginalia text-[.82rem] mt-4 m-0">
        {lang === "he"
          ? "כל עיגול הוא יום שענית בו. שלוש מתוך שלוש צובעות אותו בזהב."
          : "Each circle is a day you played. Three out of three turns it gold."}
      </p>
    </section>
  );
}

/* ---------- the page: three questions, straight away ---------- */

export default function DailyBoard({ questions }: { questions: ClientQuestion[] }) {
  const { lang, t } = useUI();
  const [store, setStore] = useState<Store>({});
  const [ready, setReady] = useState(false);
  const [tab, setTab] = useState<Tab>("person");
  const [copied, setCopied] = useState(false);
  const todayK = dayKey(new Date());

  const trio = useMemo(
    () => ({ person: questions[0], place: questions[1], spell: questions[2] }) as Record<Tab, ClientQuestion>,
    [questions]
  );

  /* open on the first question still unanswered today */
  useEffect(() => {
    const s = read();
    setStore(s);
    setReady(true);
    const today = s[dayKey(new Date())] ?? {};
    setTab(TABS.find((tb) => today[tb] === undefined) ?? "person");
  }, []);

  const day = useMemo(() => store[todayK] ?? {}, [store, todayK]);
  const answered = answeredCount(day);
  const streak = ready ? streakOf(store, todayK) : 0;

  const onAnswer = useCallback(
    (tb: Tab, correct: boolean) => {
      const current = read();
      const next: Store = { ...current, [todayK]: { ...(current[todayK] ?? {}), [tb]: correct } };
      write(next);
      setStore(next);
    },
    [todayK]
  );

  const share = useMemo(() => {
    if (answered === 0) return "";
    const marks = TABS.map((tb) => (day[tb] === true ? "🟫" : day[tb] === false ? "⬛" : "⬜")).join("");
    const date = new Date().toLocaleDateString(lang === "he" ? "he-IL" : "en-GB", {
      day: "numeric",
      month: "long",
    });
    const gold = rightCount(day) === 3 ? (lang === "he" ? " · שלוש מתוך שלוש" : " · three out of three") : "";
    return lang === "he"
      ? `🪄 שלוש היום · ${date}\nאדם ${mark(day.person)}  מקום ${mark(day.place)}  לחש ${mark(day.spell)}\n${marks}${gold}\nרצף: ${streak}`
      : `🪄 Today's Three · ${date}\nPerson ${mark(day.person)}  Place ${mark(day.place)}  Spell ${mark(day.spell)}\n${marks}${gold}\nStreak: ${streak}`;
  }, [answered, day, lang, streak]);

  const label: Record<Tab, string> = {
    person: t("tabPerson"),
    place: t("tabPlace"),
    spell: t("tabSpell"),
  };

  const q = trio[tab];
  const nextUnanswered = TABS.find((tb) => day[tb] === undefined && tb !== tab);

  return (
    <div className="px-4 sm:px-9 py-7 sm:py-10">
      <div className="mx-auto max-w-3xl">
        {/* masthead */}
        <div className="flex items-end justify-between gap-4 mb-6">
          <div className="min-w-0">
            <p className="caption m-0 mb-1 hidden sm:block">{t("dailyKicker")}</p>
            <h1
              className="display m-0"
              style={{ fontSize: "clamp(1.85rem,1.3rem + 2.2vw,3rem)", letterSpacing: "-.02em" }}
            >
              {t("daily")}
            </h1>
          </div>
          <div className="text-end shrink-0">
            <p className="caption m-0">
              {t("streak")}{" "}
              <span className="folio" style={{ color: "var(--oxblood)", fontSize: "1.15rem" }}>
                {ready ? streak : "·"}
              </span>
            </p>
            <Countdown />
          </div>
        </div>

        {/* the three, as tabs */}
        <div className="grid mb-6" style={{ gridTemplateColumns: "repeat(3, minmax(0,1fr))" }} role="tablist">
          {TABS.map((tb) => {
            const on = tb === tab;
            const state = day[tb];
            return (
              <button
                key={tb}
                role="tab"
                aria-selected={on}
                onClick={() => setTab(tb)}
                className="caption flex items-center justify-center gap-2"
                style={{
                  background: on ? "var(--wash)" : "transparent",
                  border: 0,
                  borderBottom: `2px solid ${on ? "var(--oxblood)" : "var(--rule-soft)"}`,
                  minHeight: 48,
                  padding: ".6rem .3rem",
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

        {/* the question itself */}
        <QuestionPlate
          key={q.id}
          q={q}
          onAnswered={(ok) => onAnswer(tab, ok)}
          footer={
            nextUnanswered ? (
              <button onClick={() => setTab(nextUnanswered)} className="btn caption btn-wide sm:w-auto">
                {t("nextQ")}: {label[nextUnanswered]}
              </button>
            ) : null
          }
        />

        {/* the tally, once all three are in */}
        {ready && answered === 3 && (
          <div className="plate mt-6 px-5 py-6 text-center ink-in">
            <p className="display m-0" style={{ fontSize: "1.15rem" }}>
              {t("allDone")}
            </p>
            <p className="folio m-0 mt-2" style={{ fontSize: "1.7rem", color: "var(--ink)" }}>
              {rightCount(day)} / 3
            </p>
            <p className="marginalia m-0 mt-2 text-[.9rem]">{t("comeBack")}</p>
          </div>
        )}

        {/* share */}
        {ready && answered > 0 && (
          <div className="plate mt-4 px-5 py-5">
            <div className="flex items-center gap-3 mb-3" style={{ color: "var(--ink-3)" }}>
              <span className="caption">{t("share")}</span>
              <hr className="rule-hair flex-1" />
              <Fleuron />
            </div>
            <pre
              className="m-0 whitespace-pre-wrap"
              style={{ fontFamily: "var(--font-body)", fontSize: ".98rem", lineHeight: 1.7 }}
            >
              {share}
            </pre>
            <button
              onClick={() => {
                navigator.clipboard?.writeText(share);
                setCopied(true);
                setTimeout(() => setCopied(false), 1600);
              }}
              className="btn caption btn-wide sm:w-auto mt-4"
            >
              {copied ? t("copied") : lang === "he" ? "העתקה לוואטסאפ" : "Copy for WhatsApp"}
            </button>
          </div>
        )}

        {/* the way on to everything else */}
        <section className="mt-10">
          <div className="flex items-center gap-3 mb-4" style={{ color: "var(--ink-3)" }}>
            <hr className="rule-hair flex-1" />
            <Fleuron />
            <hr className="rule-hair flex-1" />
          </div>
          <Link href="/quiz" className="btn btn-quiet caption btn-wide">
            {t("more")}
          </Link>
          <p className="marginalia text-[.86rem] text-center mt-3 m-0">{t("moreNote")}</p>
        </section>

        {ready && <WaxJournal store={store} />}
      </div>
    </div>
  );
}
