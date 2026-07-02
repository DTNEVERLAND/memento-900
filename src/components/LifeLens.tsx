import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Dict } from "@/lib/i18n";

interface LifeLensProps {
  open: boolean;
  monthsRemaining: number;
  t: Dict;
  onClose: () => void;
}

/** A friendly upper bound for "the other person's life", used by the
 *  optional age input (e.g. "how many times will I see my parents"). */
const REFERENCE_LIFESPAN = 85;

/**
 * An interactive way to *feel* the time you have left. Everything is derived
 * live from the months remaining in the grid — no storage, no network — so it
 * works for a first-time visitor who hasn't recorded anything yet.
 */
export function LifeLens({ open, monthsRemaining, t, onClose }: LifeLensProps) {
  const [activity, setActivity] = useState("");
  const [timesPerYear, setTimesPerYear] = useState("12");
  const [otherAge, setOtherAge] = useState("");

  const myYearsLeft = monthsRemaining / 12;

  const facts = useMemo(
    () => [
      { value: Math.round(myYearsLeft * 52), label: t.factWeekends },
      { value: Math.round(myYearsLeft * 4), label: t.factSeasons },
      { value: Math.floor(myYearsLeft), label: t.factBirthdays },
      { value: Math.round(myYearsLeft * 12.37), label: t.factFullMoons },
    ],
    [myYearsLeft, t],
  );

  // Years to count against: the other person's remaining life if an age is
  // given, otherwise the user's own remaining life.
  const otherAgeNum = otherAge.trim() === "" ? null : Number(otherAge);
  const usingOther =
    otherAgeNum !== null && Number.isFinite(otherAgeNum) && otherAgeNum >= 0;
  const yearsForCalc = usingOther
    ? Math.max(0, REFERENCE_LIFESPAN - (otherAgeNum as number))
    : myYearsLeft;

  const freq = Number(timesPerYear);
  const validFreq = Number.isFinite(freq) && freq > 0;
  const result = validFreq ? Math.round(freq * yearsForCalc) : 0;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[70] flex flex-col bg-bg/95 backdrop-blur-sm"
        >
          <div className="flex items-center justify-between border-b border-line px-[clamp(16px,5vw,40px)] py-4">
            <h2 className="font-display text-xl font-bold tracking-tight">{t.lens}</h2>
            <button
              type="button"
              onClick={onClose}
              aria-label={t.close}
              className="text-2xl leading-none text-muted transition-colors hover:text-fg"
            >
              ×
            </button>
          </div>

          <div className="mx-auto w-full max-w-[680px] flex-1 overflow-y-auto px-[clamp(16px,5vw,40px)] py-8">
            <p className="text-center text-sm text-muted">{t.lensIntro}</p>

            {/* Derived "things you can picture" */}
            <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {facts.map((f) => (
                <div
                  key={f.label}
                  className="card-glass rounded-card px-3 py-4 text-center shadow-premium"
                >
                  <div className="text-[10px] uppercase tracking-[0.14em] text-muted">
                    {t.factLeft}
                  </div>
                  <div className="mt-1 font-display text-[clamp(22px,6vw,28px)] font-bold tabular-nums tracking-tight text-accent">
                    {f.value.toLocaleString()}
                  </div>
                  <div className="mt-0.5 text-[12px] text-fg/80">{f.label}</div>
                </div>
              ))}
            </div>

            {/* Interactive frequency calculator */}
            <div className="card-glass mt-8 rounded-hero p-5 shadow-premium">
              <h3 className="font-display text-[15px] font-bold">{t.lensCalcTitle}</h3>

              <div className="mt-3 flex flex-col gap-3">
                <input
                  type="text"
                  value={activity}
                  onChange={(e) => setActivity(e.target.value)}
                  placeholder={t.lensActivityPh}
                  className="w-full rounded-lg border border-line bg-bg px-3.5 py-2 text-sm text-fg outline-none focus:border-accent"
                />

                <div className="flex flex-wrap gap-2">
                  {t.lensPresets.map((p) => (
                    <button
                      key={p.label}
                      type="button"
                      onClick={() => {
                        setActivity(p.label);
                        setTimesPerYear(String(p.freq));
                      }}
                      className="rounded-full border border-line px-3 py-1 text-[12px] text-muted transition-colors hover:border-accent hover:text-accent"
                    >
                      {p.label}
                    </button>
                  ))}
                </div>

                <div className="flex flex-wrap items-center gap-2.5">
                  <input
                    type="number"
                    min={0}
                    inputMode="numeric"
                    value={timesPerYear}
                    onChange={(e) => setTimesPerYear(e.target.value)}
                    className="w-20 rounded-lg border border-line bg-bg px-3 py-2 text-center text-sm tabular-nums text-fg outline-none focus:border-accent"
                  />
                  <span className="text-sm text-muted">{t.lensTimesPre}</span>
                  <span className="mx-1 text-line">·</span>
                  <input
                    type="number"
                    min={0}
                    inputMode="numeric"
                    value={otherAge}
                    onChange={(e) => setOtherAge(e.target.value)}
                    placeholder={t.lensOtherAgePh}
                    className="w-32 rounded-lg border border-line bg-bg px-3 py-2 text-sm tabular-nums text-fg outline-none placeholder:text-muted/70 focus:border-accent"
                  />
                </div>
                <p className="text-[11px] leading-relaxed text-muted">
                  {t.lensOtherAgeHint}
                </p>
              </div>

              {/* Result */}
              <div className="mt-5 border-t border-line pt-5 text-center">
                <p className="text-[13px] text-muted">
                  {t.lensResultPre}
                  {activity.trim() && (
                    <>
                      {" "}
                      <span className="text-fg">「{activity.trim()}」</span>
                    </>
                  )}
                </p>
                <div className="mt-1.5 flex items-baseline justify-center gap-2">
                  <span className="font-display text-[clamp(40px,11vw,56px)] font-black tabular-nums leading-none tracking-tight text-accent">
                    {result.toLocaleString()}
                  </span>
                  <span className="text-base text-muted">{t.lensResultUnit}</span>
                </div>
                <p className="mt-2 text-[11px] text-muted">
                  {usingOther
                    ? t.lensYearsHint(Math.round(yearsForCalc))
                    : t.lensYearsHint(Math.round(myYearsLeft))}
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
