import { MOOD_KEYS, type MoodKey } from "@/lib/types";
import type { Dict } from "@/lib/i18n";

const MOOD_EMOJI: Record<MoodKey, string> = {
  joy: "😄",
  calm: "😌",
  love: "🥰",
  growth: "🌱",
  hard: "😮‍💨",
  grief: "🖤",
};

interface QuickMoodProps {
  t: Dict;
  /** The mood recorded most recently in the current month, if any. */
  currentMood: MoodKey | null;
  onPick: (mood: MoodKey) => void;
}

/**
 * One-tap mood check-in for the month you are living right now.
 * Emojis rest in grayscale and come alive on hover / when selected —
 * a small moment of color in an otherwise monochrome interface.
 */
export function QuickMood({ t, currentMood, onPick }: QuickMoodProps) {
  return (
    <section className="card-glass rounded-card px-5 py-4 shadow-premium">
      <div className="flex items-baseline justify-between gap-2">
        <h2 className="font-display text-[15px] font-bold tracking-tight">
          {t.quickMoodTitle}
        </h2>
        <span className="text-[10.5px] text-muted">{t.quickMoodHint}</span>
      </div>

      <div className="mt-3 grid grid-cols-3 justify-items-center gap-1 sm:grid-cols-6">
        {MOOD_KEYS.map((mk) => {
          const active = currentMood === mk;
          return (
            <button
              key={mk}
              type="button"
              onClick={() => onPick(mk)}
              aria-pressed={active}
              aria-label={t.moods[mk]}
              className="pressable group flex flex-col items-center gap-1.5 rounded-2xl px-2 py-1.5"
            >
              <span
                className="text-[26px] leading-none transition-[filter,transform] duration-300 group-hover:scale-110 group-hover:grayscale-0"
                style={{
                  filter: active ? "grayscale(0%)" : "grayscale(100%)",
                  transform: active ? "scale(1.1)" : undefined,
                }}
              >
                {MOOD_EMOJI[mk]}
              </span>
              <span
                className={`text-[10px] uppercase tracking-[0.1em] transition-colors ${
                  active ? "text-accent" : "text-muted group-hover:text-fg"
                }`}
              >
                {t.moods[mk]}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
