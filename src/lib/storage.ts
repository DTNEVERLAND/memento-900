import { useCallback, useEffect, useRef, useState } from "react";
import type { EntriesMap, MonthEntry, Moment, MoodKey } from "./types";
import { backend } from "./backend";

/** Tailwind token → hex, for inline mood-dot backgrounds. */
export const MOOD_COLORS: Record<MoodKey, string> = {
  joy: "#d8b24a",
  calm: "#5a8fa3",
  love: "#b06a86",
  growth: "#6f9e6a",
  hard: "#8a6a9e",
  grief: "#7a7d82",
};

export const uid = (): string => Math.random().toString(36).slice(2, 9);

export const emptyMoment = (): Moment => ({
  id: uid(),
  text: "",
  mood: null,
  tags: [],
  photos: [],
});

/**
 * Single source of truth for month entries.
 * Persists via the active {@link backend}: localStorage in the browser,
 * SQLite on disk inside the Tauri desktop app. Components are unaware of which.
 */
export function useEntries() {
  const [entries, setEntries] = useState<EntriesMap>({});
  const [loaded, setLoaded] = useState(false);
  const hydrating = useRef(true);

  // Initial async load from the backend.
  useEffect(() => {
    let cancelled = false;
    const finish = (data: EntriesMap) => {
      if (cancelled) return;
      setEntries(data);
      setLoaded(true);
      // Allow a tick before enabling persistence so the load itself
      // doesn't immediately re-save.
      queueMicrotask(() => {
        hydrating.current = false;
      });
    };
    backend
      .load()
      .then(finish)
      .catch((err) => {
        // CRITICAL: even if the initial read fails, we must still enable
        // persistence — otherwise every future save is silently skipped
        // and the user's records appear to "reset" on restart.
        console.error("[memento900] initial load failed; starting empty:", err);
        finish({});
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Persist on every change (after hydration).
  useEffect(() => {
    if (hydrating.current) return;
    backend.save(entries).catch((err) => {
      console.error("[memento900] save failed:", err);
    });
  }, [entries]);

  const getEntry = useCallback(
    (month: number): MonthEntry => entries[month] ?? { moments: [] },
    [entries],
  );

  const setEntry = useCallback((month: number, entry: MonthEntry) => {
    setEntries((prev) => {
      const next = { ...prev };
      if (entry.moments.length === 0) delete next[month];
      else next[month] = entry;
      return next;
    });
  }, []);

  const hasRecord = useCallback(
    (month: number): boolean => (entries[month]?.moments.length ?? 0) > 0,
    [entries],
  );

  const recordedCount = Object.values(entries).filter(
    (e) => e.moments.length > 0,
  ).length;

  return { entries, getEntry, setEntry, hasRecord, recordedCount, setEntries, loaded };
}
