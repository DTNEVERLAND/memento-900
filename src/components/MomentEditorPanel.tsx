import { useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Plus, ImagePlus } from "lucide-react";
import { cn } from "@/lib/utils";
import { MOOD_COLORS, emptyMoment } from "@/lib/storage";
import { MOOD_KEYS, type Moment, type MonthEntry, type MoodKey } from "@/lib/types";
import type { Dict } from "@/lib/i18n";

interface MoodDotProps {
  moodKey: MoodKey;
  active: boolean;
  label: string;
  onToggle: () => void;
}

function MoodDot({ moodKey, active, label, onToggle }: MoodDotProps) {
  return (
    <motion.button
      type="button"
      whileHover={{ scale: 1.15 }}
      whileTap={{ scale: 0.92 }}
      onClick={onToggle}
      title={label}
      aria-pressed={active}
      aria-label={label}
      className={cn(
        "h-5 w-5 rounded-full border-2 transition-opacity duration-150",
        active ? "border-fg opacity-100" : "border-transparent opacity-40 hover:opacity-80",
      )}
      style={{ backgroundColor: MOOD_COLORS[moodKey] }}
    />
  );
}

interface MomentCardProps {
  moment: Moment;
  t: Dict;
  onChange: (m: Moment) => void;
  onDelete: () => void;
}

function MomentCard({ moment, t, onChange, onDelete }: MomentCardProps) {
  const fileRef = useRef<HTMLInputElement>(null);

  const toggleMood = (k: MoodKey) =>
    onChange({ ...moment, mood: moment.mood === k ? null : k });

  const onPhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () =>
      onChange({ ...moment, photos: [...moment.photos, String(reader.result)] });
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ type: "spring", damping: 26, stiffness: 320 }}
      className="space-y-3 rounded-xl border border-line bg-surface p-3"
    >
      <div className="flex items-center gap-1.5">
        {MOOD_KEYS.map((k) => (
          <MoodDot
            key={k}
            moodKey={k}
            active={moment.mood === k}
            label={t.moods[k]}
            onToggle={() => toggleMood(k)}
          />
        ))}
        <button
          type="button"
          onClick={onDelete}
          aria-label={t.photoRemove}
          className="ml-auto text-muted transition-colors hover:text-[#c77]"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <textarea
        value={moment.text}
        onChange={(e) => onChange({ ...moment, text: e.target.value })}
        placeholder={t.phText}
        rows={3}
        className="w-full resize-y rounded-lg border border-line bg-bg px-3 py-2 text-sm text-fg placeholder:text-muted outline-none transition-colors focus:border-accent"
      />

      <input
        type="text"
        value={moment.tags.join(", ")}
        onChange={(e) =>
          onChange({
            ...moment,
            tags: e.target.value.split(",").map((s) => s.trim()).filter(Boolean),
          })
        }
        placeholder={t.phTags}
        className="w-full rounded-lg border border-line bg-bg px-3 py-2 text-sm text-fg placeholder:text-muted outline-none transition-colors focus:border-accent"
      />

      <div className="flex flex-wrap items-center gap-2">
        <AnimatePresence>
          {moment.photos.map((src, idx) => (
            <motion.button
              key={src.slice(-24) + idx}
              type="button"
              layout
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              onClick={() =>
                onChange({ ...moment, photos: moment.photos.filter((_, i) => i !== idx) })
              }
              title={t.photoRemove}
              className="group relative h-14 w-14 overflow-hidden rounded-lg border border-line"
            >
              <img src={src} alt="" className="h-full w-full object-cover" />
              <span className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 transition-opacity group-hover:opacity-100">
                <X className="h-4 w-4 text-white" />
              </span>
            </motion.button>
          ))}
        </AnimatePresence>
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="flex h-14 w-14 items-center justify-center rounded-lg border border-dashed border-line text-muted transition-colors hover:border-accent hover:text-accent"
        >
          <ImagePlus className="h-5 w-5" />
        </button>
        <input ref={fileRef} type="file" accept="image/*" hidden onChange={onPhoto} />
      </div>
    </motion.div>
  );
}

export interface MomentEditorPanelProps {
  open: boolean;
  monthIndex: number | null;
  entry: MonthEntry;
  t: Dict;
  monthTitle: string;
  ageLabel: string;
  onChange: (entry: MonthEntry) => void;
  onClose: () => void;
}

export function MomentEditorPanel({
  open,
  monthIndex,
  entry,
  t,
  monthTitle,
  ageLabel,
  onChange,
  onClose,
}: MomentEditorPanelProps) {
  const updateMoment = (id: string, m: Moment) =>
    onChange({ moments: entry.moments.map((x) => (x.id === id ? m : x)) });
  const deleteMoment = (id: string) =>
    onChange({ moments: entry.moments.filter((x) => x.id !== id) });
  const addMoment = () => onChange({ moments: [...entry.moments, emptyMoment()] });

  return (
    <AnimatePresence>
      {open && monthIndex !== null && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
          />
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 z-50 flex h-full w-full flex-col border-l border-line bg-panel shadow-[-20px_0_50px_rgba(0,0,0,0.45)] md:w-[420px]"
          >
            <div className="relative border-b border-line p-5">
              <button
                type="button"
                onClick={onClose}
                aria-label={t.close}
                className="absolute right-4 top-4 text-2xl leading-none text-muted transition-colors hover:text-fg"
              >
                ×
              </button>
              <div className="text-xs uppercase tracking-[0.16em] text-muted">
                {t.monthOf(monthIndex)}
              </div>
              <div className="mt-1 text-xl font-semibold">{monthTitle}</div>
              <div className="mt-1 text-xs text-muted">{ageLabel}</div>
            </div>

            <div className="flex-1 space-y-3 overflow-y-auto p-5">
              {entry.moments.length === 0 ? (
                <p className="py-5 text-center text-sm text-muted">{t.emptyHint}</p>
              ) : (
                <AnimatePresence initial={false}>
                  {entry.moments.map((m) => (
                    <MomentCard
                      key={m.id}
                      moment={m}
                      t={t}
                      onChange={(nm) => updateMoment(m.id, nm)}
                      onDelete={() => deleteMoment(m.id)}
                    />
                  ))}
                </AnimatePresence>
              )}
            </div>

            <div className="border-t border-line p-4">
              <button
                type="button"
                onClick={addMoment}
                className="flex w-full items-center justify-center gap-2 rounded-lg border border-line py-2.5 text-sm text-accent transition-colors hover:border-accent"
              >
                <Plus className="h-4 w-4" />
                {t.addMoment}
              </button>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
