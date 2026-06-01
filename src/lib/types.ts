/** A single mood key. Order is stable for storage. */
export type MoodKey = "joy" | "calm" | "love" | "growth" | "hard" | "grief";

export const MOOD_KEYS: readonly MoodKey[] = [
  "joy",
  "calm",
  "love",
  "growth",
  "hard",
  "grief",
] as const;

/** One recorded event within a month. */
export interface Moment {
  id: string;
  text: string;
  mood: MoodKey | null;
  tags: string[];
  /** Data URLs in the prototype; thumbnails/BLOB refs in the Tauri build. */
  photos: string[];
}

/** All moments recorded for a given month index (0..899). */
export interface MonthEntry {
  moments: Moment[];
}

/** The persisted shape: month index → entry. */
export type EntriesMap = Record<number, MonthEntry>;
