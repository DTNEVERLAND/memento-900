import { useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MOOD_COLORS } from "@/lib/storage";
import type { EntriesMap } from "@/lib/types";
import type { Dict } from "@/lib/i18n";

interface TimelineProps {
  open: boolean;
  entries: EntriesMap;
  birth: Date;
  t: Dict;
  onClose: () => void;
  onJump: (month: number) => void;
}

/**
 * "Look back" space — a chronological feed of every recorded month, so the
 * user can revisit their own life fragments in one quiet scroll.
 */
export function Timeline({ open, entries, birth, t, onClose, onJump }: TimelineProps) {
  const months = useMemo(
    () =>
      Object.keys(entries)
        .map(Number)
        .filter((m) => (entries[m]?.moments.length ?? 0) > 0)
        .sort((a, b) => a - b),
    [entries],
  );

  const labelFor = (monthIndex: number) => {
    const d = new Date(birth.getFullYear(), birth.getMonth() + monthIndex, 1);
    return {
      cal: t.calLabel(d.getFullYear(), d.getMonth() + 1),
      age: t.ageLabel(Math.floor(monthIndex / 12), monthIndex % 12),
    };
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
            <h2 className="font-display text-xl font-bold tracking-tight">{t.timeline}</h2>
            <button
              type="button"
              onClick={onClose}
              aria-label={t.close}
              className="text-2xl leading-none text-muted transition-colors hover:text-fg"
            >
              ×
            </button>
          </div>

          <div className="mx-auto w-full max-w-[680px] flex-1 overflow-y-auto px-[clamp(16px,5vw,40px)] py-6">
            {months.length === 0 ? (
              <p className="py-16 text-center text-sm text-muted">{t.timelineEmpty}</p>
            ) : (
              <ol className="relative space-y-5 before:absolute before:left-[5px] before:top-2 before:h-full before:w-px before:bg-line">
                {months.map((m, idx) => {
                  const lab = labelFor(m);
                  const moments = entries[m]!.moments;
                  return (
                    <motion.li
                      key={m}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: Math.min(idx * 0.03, 0.4) }}
                      className="relative pl-6"
                    >
                      <span className="absolute left-0 top-[6px] h-[11px] w-[11px] rounded-full border-2 border-accent bg-bg" />
                      <button
                        type="button"
                        onClick={() => onJump(m)}
                        className="pressable card-glass w-full rounded-card p-4 text-left shadow-premium hover:border-accent/60"
                      >
                        <div className="flex items-baseline justify-between gap-2">
                          <span className="font-medium">{lab.cal}</span>
                          <span className="text-[11px] text-muted">{lab.age}</span>
                        </div>
                        <div className="mt-2 space-y-2">
                          {moments.map((mo) => (
                            <div key={mo.id} className="flex items-start gap-2">
                              {mo.mood && (
                                <span
                                  className="mt-[5px] h-2.5 w-2.5 shrink-0 rounded-full"
                                  style={{ backgroundColor: MOOD_COLORS[mo.mood] }}
                                />
                              )}
                              <div className="min-w-0">
                                <p className="truncate text-sm text-fg">
                                  {mo.text || "—"}
                                </p>
                                {mo.tags.length > 0 && (
                                  <p className="mt-0.5 truncate text-[11px] text-muted">
                                    {mo.tags.map((tg) => `#${tg}`).join(" ")}
                                  </p>
                                )}
                              </div>
                              {mo.photos.length > 0 && (
                                <span className="ml-auto shrink-0 text-[11px] text-muted">
                                  ◷ {mo.photos.length}
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      </button>
                    </motion.li>
                  );
                })}
              </ol>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
