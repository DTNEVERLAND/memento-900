interface LifeRingProps {
  /** 0..100 */
  percent: number;
  label: string;
}

const SIZE = 80;
const STROKE = 6;
const R = (SIZE - STROKE) / 2;
const CIRC = 2 * Math.PI * R;

/**
 * Refined SVG progress ring showing how much of the 900 months has elapsed.
 * Dark rail, gold stroke, rounded cap — the "quiet luxury" take on a
 * fitness-app ring, except the goal is the opposite of filling it up.
 */
export function LifeRing({ percent, label }: LifeRingProps) {
  const clamped = Math.max(0, Math.min(100, percent));
  const offset = CIRC * (1 - clamped / 100);

  return (
    <div className="relative h-20 w-20 shrink-0" role="img" aria-label={`${label} ${clamped.toFixed(1)}%`}>
      <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`} className="-rotate-90">
        <circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={R}
          fill="none"
          stroke="#1c1e21"
          strokeWidth={STROKE}
        />
        <circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={R}
          fill="none"
          stroke="#c9b27d"
          strokeWidth={STROKE}
          strokeLinecap="round"
          strokeDasharray={CIRC}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 800ms ease" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-[15px] font-bold tabular-nums leading-none tracking-tight">
          {clamped.toFixed(1)}%
        </span>
        <span className="mt-0.5 text-[8px] uppercase tracking-[0.14em] text-muted">
          {label}
        </span>
      </div>
    </div>
  );
}
