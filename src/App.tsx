import { useEffect, useMemo, useState } from "react";
import { LifeGrid } from "@/components/LifeGrid";
import { MomentEditorPanel } from "@/components/MomentEditorPanel";
import { LanguageToggle } from "@/components/LanguageToggle";
import { useEntries } from "@/lib/storage";
import { backend } from "@/lib/backend";
import { I18N, detectInitialLang, type Lang } from "@/lib/i18n";
import { getLifeGridState } from "@/utils/time";

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

  const { getEntry, setEntry, hasRecord, recordedCount } = useEntries();
  const t = I18N[lang];

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

  return (
    <div className="flex min-h-screen">
      <LanguageToggle lang={lang} onChange={changeLang} panelOpen={panelOpen} />

      <main
        className={`mx-auto flex w-full flex-col items-center px-[clamp(16px,5vw,40px)] py-[clamp(20px,5vw,56px)] transition-[margin] duration-200 ${
          panelOpen ? "md:mr-[420px]" : ""
        }`}
      >
        <div className="w-full max-w-[680px]">
          <header className="mb-[clamp(18px,4vw,32px)] text-center">
            <div className="text-[clamp(13px,2.2vw,15px)] font-medium uppercase tracking-[0.42em] text-muted">
              Memento&nbsp;900
            </div>
            <h1 className="mt-2.5 text-[clamp(22px,5vw,30px)] font-semibold tracking-tight">
              {t.subtitle}
            </h1>
            <p className="mt-3 text-[clamp(12px,2.4vw,13.5px)] italic text-muted">
              {t.epigraph}
            </p>
          </header>

          <div className="mb-[clamp(18px,4vw,28px)] flex flex-wrap items-end justify-center gap-3.5">
            <label className="flex flex-col gap-1.5">
              <span className="text-[11px] uppercase tracking-[0.16em] text-muted">
                {t.dobLabel}
              </span>
              <input
                type="date"
                value={dob}
                max={todayISO()}
                onChange={(e) => changeDob(e.target.value)}
                className="rounded-lg border border-line bg-surface px-3 py-2 text-sm text-fg outline-none focus:border-accent"
              />
            </label>
          </div>

          <div className="mb-[clamp(18px,4vw,26px)] flex flex-wrap justify-center gap-[clamp(18px,6vw,44px)]">
            <Stat value={state.monthsLived} label={t.lived} />
            <Stat value={state.monthsRemaining} label={t.left} accent />
            <Stat value={`${state.percentLived.toFixed(1)}%`} label={t.pct} />
            <Stat value={recordedCount} label={t.rec} />
          </div>

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
        className={`text-[clamp(20px,5vw,26px)] font-semibold tabular-nums tracking-tight ${
          accent ? "text-accent" : ""
        }`}
      >
        {value}
      </div>
      <div className="mt-1 text-[11px] uppercase tracking-[0.14em] text-muted">{label}</div>
    </div>
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
