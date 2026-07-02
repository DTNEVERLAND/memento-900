import { useEffect, useMemo, useState } from "react";
import { Search, History, Shuffle, Crosshair, Sparkles } from "lucide-react";
import { LifeGrid } from "@/components/LifeGrid";
import { MomentEditorPanel } from "@/components/MomentEditorPanel";
import { LanguageToggle } from "@/components/LanguageToggle";
import { Timeline } from "@/components/Timeline";
import { SearchPanel } from "@/components/SearchPanel";
import { LifeLens } from "@/components/LifeLens";
import { LifeRing } from "@/components/LifeRing";
import { QuickMood } from "@/components/QuickMood";
import { useEntries, emptyMoment } from "@/lib/storage";
import { backend } from "@/lib/backend";
import { I18N, detectInitialLang, type Lang } from "@/lib/i18n";
import { quoteOfTheDay } from "@/lib/quotes";
import { getLifeGridState } from "@/utils/time";
import type { MoodKey } from "@/lib/types";

const DEFAULT_DOB = "1995-06-15";
const DOB_SETTING_KEY = "dob";

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

export default function App() {
  const [lang, setLang] = useState<Lang>(detectInitialLang);
  const [dob, setDob] = useState<string>(DEFAULT_DOB);
  const [dobLoaded, setDobLoaded] = useState(false);
  const [selected, setSelected] = useState<number | null>(null);
  const [timelineOpen, setTimelineOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [lensOpen, setLensOpen] = useState(false);

  const { entries, getEntry, setEntry, hasRecord, recordedCount } = useEntries();
  const t = I18N[lang];
  const quote = useMemo(() => quoteOfTheDay(lang), [lang]);

  useEffect(() => {
    document.documentElement.lang = t.htmlLang;
  }, [t.htmlLang]);

  // Load the saved date of birth on mount (persists across restarts).
  useEffect(() => {
    let cancelled = false;
    backend
      .getSetting(DOB_SETTING_KEY)
      .then((saved) => {
        if (cancelled) return;
        if (saved) setDob(saved);
        setDobLoaded(true);
      })
      .catch(() => setDobLoaded(true));
    return () => {
      cancelled = true;
    };
  }, []);

  // Persist DOB whenever the user changes it (but not during initial hydration).
  const changeDob = (next: string) => {
    setDob(next);
    backend.setSetting(DOB_SETTING_KEY, next).catch((err) => {
      console.error("[memento900] failed to save DOB:", err);
    });
  };

  const changeLang = (next: Lang) => {
    localStorage.setItem("memento900.lang", next);
    setLang(next);
  };

  const birth = useMemo(() => new Date(`${dob}T12:00:00`), [dob]);
  const state = useMemo(() => getLifeGridState(birth), [birth]);

  const panelOpen = selected !== null;
  const monthMeta = useMemo(() => {
    if (selected === null) return { title: "—", age: "" };
    const d = new Date(birth.getFullYear(), birth.getMonth() + selected, 1);
    return {
      title: t.calLabel(d.getFullYear(), d.getMonth() + 1),
      age: t.ageLabel(Math.floor(selected / 12), selected % 12),
    };
  }, [selected, birth, t]);

  // --- Quick interactions -------------------------------------------------
  const nowIndex = state.isComplete ? null : state.monthsLived;

  // The mood shown as "current" in the check-in row: the latest mood
  // recorded in the month being lived right now.
  const currentMood = useMemo<MoodKey | null>(() => {
    if (nowIndex === null) return null;
    const moments = entries[nowIndex]?.moments ?? [];
    for (let i = moments.length - 1; i >= 0; i--) {
      if (moments[i]!.mood) return moments[i]!.mood;
    }
    return null;
  }, [entries, nowIndex]);

  // One-tap mood check-in. If the newest moment in the current month is a
  // bare quick-mood record (no text/tags/photos), retag it instead of
  // stacking a new empty moment on every tap.
  const pickMood = (mood: MoodKey) => {
    if (nowIndex === null) return;
    const entry = getEntry(nowIndex);
    const last = entry.moments[entry.moments.length - 1];
    if (last && !last.text.trim() && last.tags.length === 0 && last.photos.length === 0) {
      setEntry(nowIndex, {
        moments: entry.moments.map((m) => (m.id === last.id ? { ...m, mood } : m)),
      });
    } else {
      setEntry(nowIndex, { moments: [...entry.moments, { ...emptyMoment(), mood }] });
    }
    setSelected(nowIndex);
  };

  // Jump to a random recorded month — a small serendipity machine.
  const randomMemory = () => {
    const recorded = Object.keys(entries)
      .map(Number)
      .filter((m) => (entries[m]?.moments.length ?? 0) > 0);
    if (recorded.length === 0) return;
    const pool = recorded.length > 1 && selected !== null
      ? recorded.filter((m) => m !== selected)
      : recorded;
    setSelected(pool[Math.floor(Math.random() * pool.length)]!);
  };

  return (
    <div className="flex min-h-screen">
      <LanguageToggle lang={lang} onChange={changeLang} panelOpen={panelOpen} />

      <main
        className={`mx-auto flex w-full flex-col items-center px-[clamp(16px,5vw,40px)] py-[clamp(20px,5vw,56px)] transition-[margin] duration-200 ${
          panelOpen ? "md:mr-[420px]" : ""
        }`}
      >
        <div className="w-full max-w-[680px]">
          <header className="mb-[clamp(18px,4vw,30px)] text-center">
            <div className="text-[clamp(12px,2vw,14px)] font-medium uppercase tracking-[0.42em] text-muted">
              Memento&nbsp;900
            </div>
            <h1 className="mt-3 font-display text-[clamp(26px,6vw,40px)] font-black leading-tight tracking-tight">
              {t.subtitle}
            </h1>
            <figure className="card-glass mx-auto mt-5 max-w-[480px] rounded-card px-6 py-4 shadow-premium">
              <div className="mb-1.5 text-[10px] uppercase tracking-[0.22em] text-accent/80">
                {t.quoteLabel}
              </div>
              <blockquote className="font-display text-[clamp(13px,2.6vw,15.5px)] italic leading-relaxed text-fg/90">
                “{quote.text}”
              </blockquote>
              <figcaption className="mt-1.5 text-[11px] text-muted">
                — {quote.author}
              </figcaption>
            </figure>
          </header>

          <div className="mb-4 flex flex-wrap items-end justify-center gap-3.5">
            <label className="flex flex-col gap-1.5">
              <span className="text-[11px] uppercase tracking-[0.16em] text-muted">
                {t.dobLabel}
              </span>
              <input
                type="date"
                value={dob}
                max={todayISO()}
                onChange={(e) => changeDob(e.target.value)}
                className="pressable rounded-xl border border-line bg-surface px-3.5 py-2 text-sm text-fg outline-none focus:border-accent"
              />
            </label>
          </div>

          {/* Hero stat card: life ring + numbers */}
          <div className="card-glass mb-4 flex items-center justify-center gap-[clamp(16px,5vw,36px)] rounded-hero px-[clamp(16px,4vw,28px)] py-5 shadow-premium">
            <LifeRing percent={state.percentLived} label={t.lifeRingLabel} />
            <div className="flex flex-wrap items-center gap-[clamp(14px,4.5vw,32px)]">
              <Stat value={state.monthsLived} label={t.lived} />
              <Stat value={state.monthsRemaining} label={t.left} accent />
              <Stat value={recordedCount} label={t.rec} />
            </div>
          </div>

          {/* One-tap mood check-in for the current month */}
          {nowIndex !== null && (
            <div className="mb-[clamp(18px,4vw,26px)]">
              <QuickMood t={t} currentMood={currentMood} onPick={pickMood} />
            </div>
          )}

          <div className={dobLoaded ? "transition-opacity duration-300" : "opacity-0"}>
            <LifeGrid
              birth={birth}
              t={t}
              selectedIndex={selected}
              hasRecord={hasRecord}
              onSelect={setSelected}
            />
          </div>

          <div className="mt-4 flex flex-wrap justify-center gap-4 text-[11px] text-muted">
            <Legend swatch="bg-spent shadow-[inset_0_0_0_1px_#3a3e43]" label={t.lgSpent} />
            <Legend swatch="bg-now" label={t.lgNow} />
            <Legend swatch="bg-faint shadow-[inset_0_0_0_1px_#101214]" label={t.lgFuture} />
            <Legend swatch="bg-faint shadow-[inset_0_0_0_1px_#101214]" label={t.lgFilled} dot />
          </div>

          <p className="mt-4 text-center text-[11.5px] text-muted opacity-70">{t.note}</p>

          <div className="mt-6 flex flex-wrap justify-center gap-2.5">
            <ActionPill icon={<Sparkles className="h-4 w-4" />} onClick={() => setLensOpen(true)}>
              {t.lens}
            </ActionPill>
            {nowIndex !== null && (
              <ActionPill icon={<Crosshair className="h-4 w-4" />} onClick={() => setSelected(nowIndex)}>
                {t.jumpNow}
              </ActionPill>
            )}
            {recordedCount > 0 && (
              <>
                <ActionPill icon={<Search className="h-4 w-4" />} onClick={() => setSearchOpen(true)}>
                  {t.search}
                </ActionPill>
                <ActionPill icon={<History className="h-4 w-4" />} onClick={() => setTimelineOpen(true)}>
                  {t.timeline}
                </ActionPill>
                <ActionPill icon={<Shuffle className="h-4 w-4" />} onClick={randomMemory}>
                  {t.randomMemory}
                </ActionPill>
              </>
            )}
          </div>
        </div>
      </main>

      <MomentEditorPanel
        open={panelOpen}
        monthIndex={selected}
        entry={selected === null ? { moments: [] } : getEntry(selected)}
        t={t}
        monthTitle={monthMeta.title}
        ageLabel={monthMeta.age}
        onChange={(entry) => selected !== null && setEntry(selected, entry)}
        onClose={() => setSelected(null)}
      />

      <Timeline
        open={timelineOpen}
        entries={entries}
        birth={birth}
        t={t}
        onClose={() => setTimelineOpen(false)}
        onJump={(month) => {
          setTimelineOpen(false);
          setSelected(month);
        }}
      />

      <SearchPanel
        open={searchOpen}
        entries={entries}
        birth={birth}
        t={t}
        onClose={() => setSearchOpen(false)}
        onJump={(month) => {
          setSearchOpen(false);
          setSelected(month);
        }}
      />

      <LifeLens
        open={lensOpen}
        monthsRemaining={state.monthsRemaining}
        t={t}
        onClose={() => setLensOpen(false)}
      />
    </div>
  );
}

function Stat({
  value,
  label,
  accent,
}: {
  value: string | number;
  label: string;
  accent?: boolean;
}) {
  return (
    <div className="text-center">
      <div
        className={`font-display text-[clamp(22px,5.5vw,30px)] font-bold tabular-nums tracking-tight ${
          accent ? "text-accent" : ""
        }`}
      >
        {value}
      </div>
      <div className="mt-1 text-[11px] uppercase tracking-[0.14em] text-muted">{label}</div>
    </div>
  );
}

function ActionPill({
  icon,
  onClick,
  children,
}: {
  icon: React.ReactNode;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="pressable card-glass inline-flex items-center gap-2 rounded-full py-2.5 pl-4 pr-5 text-sm text-fg shadow-premium hover:border-accent/60 hover:text-accent hover:shadow-halo"
    >
      <span className="text-accent/90">{icon}</span>
      {children}
    </button>
  );
}

function Legend({ swatch, label, dot }: { swatch: string; label: string; dot?: boolean }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className={`relative inline-block h-[11px] w-[11px] rounded-sm ${swatch}`}>
        {dot && (
          <span className="absolute bottom-0 right-0 h-1 w-1 rounded-full bg-accent" />
        )}
      </span>
      {label}
    </span>
  );
}
