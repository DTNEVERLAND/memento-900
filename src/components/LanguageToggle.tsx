import { cn } from "@/lib/utils";
import type { Lang } from "@/lib/i18n";

interface LanguageToggleProps {
  lang: Lang;
  onChange: (lang: Lang) => void;
  panelOpen: boolean;
}

const OPTIONS: { key: Lang; label: string }[] = [
  { key: "zh", label: "中" },
  { key: "en", label: "EN" },
];

export function LanguageToggle({ lang, onChange, panelOpen }: LanguageToggleProps) {
  return (
    <div
      className={cn(
        "fixed top-4 z-[60] inline-flex overflow-hidden rounded-full border border-line bg-surface text-xs transition-[right]",
        panelOpen ? "right-4 md:right-[calc(420px+16px)]" : "right-4",
      )}
    >
      {OPTIONS.map((o) => (
        <button
          key={o.key}
          type="button"
          onClick={() => onChange(o.key)}
          className={cn(
            "px-3 py-1.5 tracking-wide transition-colors",
            lang === o.key
              ? "bg-accent font-semibold text-bg"
              : "text-muted hover:text-fg",
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
