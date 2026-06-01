import { useMemo } from "react";
import { cn } from "@/lib/utils";
import { TOTAL_MONTHS, getLifeGridState } from "@/utils/time";
import type { Dict } from "@/lib/i18n";

interface LifeGridProps {
  birth: Date;
  t: Dict;
  selectedIndex: number | null;
  hasRecord: (month: number) => boolean;
  onSelect: (month: number) => void;
}

export function LifeGrid({ birth, t, selectedIndex, hasRecord, onSelect }: LifeGridProps) {
  const state = useMemo(() => getLifeGridState(birth), [birth]);

  return (
    <div
      className="grid w-full aspect-square gap-[clamp(1.5px,0.55vw,4px)]"
      style={{ gridTemplateColumns: "repeat(30, 1fr)" }}
      role="img"
      aria-label={t.subtitle}
    >
      {Array.from({ length: TOTAL_MONTHS }, (_, i) => {
        const spent = i < state.monthsLived;
        const isNow = i === state.monthsLived && !state.isComplete;
        const filled = hasRecord(i);
        const selected = i === selectedIndex;
        const ageYears = Math.floor(i / 12);
        const ageMonths = i % 12;
        const tag = spent ? t.tagSpent : isNow ? t.tagNow : t.tagFuture;

        return (
          <button
            key={i}
            type="button"
            onClick={() => onSelect(i)}
            title={`${t.monthOf(i)} · ${t.ageLabel(ageYears, ageMonths)} · ${tag}`}
            aria-label={`${t.monthOf(i)} · ${tag}`}
            className={cn(
              "relative aspect-square rounded-[1.5px] transition-transform duration-100 hover:scale-150 hover:z-10",
              "bg-faint shadow-[inset_0_0_0_1px_#101214]",
              spent && "bg-spent shadow-[inset_0_0_0_1px_#3a3e43]",
              isNow && "bg-now shadow-[0_0_0_1px_#f4f4f2,0_0_10px_1px_rgba(244,244,242,0.55)] animate-pulse900",
              selected && "z-20 shadow-[0_0_0_1.5px_#c9b27d,0_0_8px_rgba(201,178,125,0.5)]",
            )}
          >
            {filled && (
              <span
                className={cn(
                  "absolute bottom-px right-px h-[3px] w-[3px] rounded-full",
                  isNow ? "bg-bg" : "bg-accent",
                )}
              />
            )}
          </button>
        );
      })}
    </div>
  );
}
