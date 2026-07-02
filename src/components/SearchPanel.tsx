import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MOOD_COLORS } from "@/lib/storage";
import { MOOD_KEYS, type EntriesMap, type MoodKey } from "@/lib/types";
import type { Dict } from "@/lib/i18n";

interface SearchPanelProps {
  open: boolean;
  entries: EntriesMap;
  birth: Date;
  t: Dict;
  onClose: () => void;
  onJump: (month: number) => void;
}

interface Hit {
  month: number;
  momentId: string;
  text: string;
  mood: MoodKey | null;
  tags: string[];
  photos: number;
}

/**
 * Full-text search across every recorded moment. Matches the moment's text,
 * its tags, and its (localized) mood label, with an optional mood filter.
 * Purely client-side over the in-memory entries map — no index, no network.
 */
export function SearchPanel({ open, entries, birth, t, onClose, onJump }: SearchPanelProps) {
  const [query, setQuery] = useState("");
  const [moodFilter, setMoodFilter] = useState<MoodKey | null>(null);

  const totalMoments = useMemo(
    () =>
      Object.values(entries).reduce((n, e) => n + (e?.moments.length ?? 0), 0),
    [entries],
  );

  const hits = useMemo<Hit[]>(() => {
    const q = query.trim().toLowerCase();
    const out: Hit[] = [];
    for (const key of Object.keys(entries)) {
      const month = Number(key);
      const moments = entries[month]?.moments ?? [];
      for (const m of moments) {
        if (moodFilter && m.mood !== moodFilter) continue;
        if (q) {
          const moodLabel = m.mood ? t.moods[m.mood].toLowerCase() : "";
          const hay = `${m.text} ${m.tags.join(" ")} ${moodLabel}`.toLowerCase();
          if (!hay.includes(q)) continue;
        }
        out.push({
          month,
          momentId: m.id,
          text: m.text,
          mood: m.mood,
          tags: m.tags,
          photos: m.photos.length,
        });
      }
    }
    return out.sort((a, b) => a.month - b.month);
  }, [entries, query, moodFilter, t]);

  const labelFor = (monthIndex: number) => {
    const d = new Date(birth.getFullYear(), birth.getMonth() + monthIndex, 1);
    return {
      cal: t.calLabel(d.getFullYear(), d.getMonth() + 1),
      age: t.ageLabel(Math.floor(monthIndex / 12), monthIndex % 12),
    };
  };

  // Highlight the matched substring in a piece of text.
  const highlight = (text: string) => {
    const q = query.trim();
    if (!q) return text;
    const idx = text.toLowerCase().indexOf(q.toLowerCase());
    if (idx < 0) return text;
    return (
      <>
        {text.slice(0, idx)}
        <mark className="rounded-sm bg-accent/30 px-0.5 text-fg">
          {text.slice(idx, idx + q.length)}
        </mark>
        {text.slice(idx + q.length)}
      </>
    );
  };

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
            <h2 className="font-display text-xl font-bold tracking-tight">{t.search}</h2>
            <button
              type="button"
              onClick={onClose}
              aria-label={t.close}
              className="text-2xl leading-none text-muted transition-colors hover:text-fg"
            >
              ×
            </button>
          </div>

          <div className="mx-auto flex w-full max-w-[680px] flex-1 flex-col overflow-hidden px-[clamp(16px,5vw,40px)]">
            {totalMoments === 0 ? (
              <p className="py-16 text-center text-sm text-muted">{t.searchEmpty}</p>
            ) : (
              <>
                <div className="pt-6">
                  <input
                    autoFocus
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder={t.searchPlaceholder}
                    className="card-glass w-full rounded-2xl px-4 py-3 text-sm text-fg outline-none transition-colors focus:border-accent/70"
                  />

                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <FilterChip
                      active={moodFilter === null}
                      onClick={() => setMoodFilter(null)}
                    >
                      {t.searchAllMoods}
                    </FilterChip>
                    {MOOD_KEYS.map((mk) => (
                      <FilterChip
                        key={mk}
                        active={moodFilter === mk}
                        onClick={() => setMoodFilter(moodFilter === mk ? null : mk)}
                      >
                        <span
                          className="h-2 w-2 rounded-full"
                          style={{ backgroundColor: MOOD_COLORS[mk] }}
                        />
                        {t.moods[mk]}
                      </FilterChip>
                    ))}
                  </div>

                  <p className="mt-3 text-[11px] text-muted">{t.searchCount(hits.length)}</p>
                </div>

                <div className="-mx-1 flex-1 overflow-y-auto px-1 py-3">
                  {hits.length === 0 ? (
                    <p className="py-12 text-center text-sm text-muted">{t.searchNoMatch}</p>
                  ) : (
                    <ul className="space-y-2.5 pb-6">
                      {hits.map((h) => {
                        const lab = labelFor(h.month);
                        return (
                          <li key={`${h.month}-${h.momentId}`}>
                            <button
                              type="button"
                              onClick={() => onJump(h.month)}
                              className="pressable card-glass w-full rounded-card p-4 text-left shadow-premium hover:border-accent/60"
                            >
                              <div className="flex items-baseline justify-between gap-2">
                                <span className="text-[13px] font-medium">{lab.cal}</span>
                                <span className="text-[11px] text-muted">{lab.age}</span>
                              </div>
                              <div className="mt-1.5 flex items-start gap-2">
                                {h.mood && (
                                  <span
                                    className="mt-[5px] h-2.5 w-2.5 shrink-0 rounded-full"
                                    style={{ backgroundColor: MOOD_COLORS[h.mood] }}
                                  />
                                )}
                                <p className="min-w-0 flex-1 text-sm leading-relaxed text-fg">
                                  {h.text ? highlight(h.text) : "—"}
                                </p>
                                {h.photos > 0 && (
                                  <span className="shrink-0 text-[11px] text-muted">
                                    ◷ {h.photos}
                                  </span>
                                )}
                              </div>
                              {h.tags.length > 0 && (
                                <p className="mt-1 text-[11px] text-muted">
                                  {h.tags.map((tg) => `#${tg}`).join(" ")}
                                </p>
                              )}
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>
              </>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[12px] transition-colors ${
        active
          ? "border-accent text-accent"
          : "border-line text-muted hover:border-fg/40 hover:text-fg"
      }`}
    >
      {children}
    </button>
  );
}
