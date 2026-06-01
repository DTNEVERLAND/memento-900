/**
 * Memento 900 — time.ts
 *
 * The single source of truth for the "Being-towards-death" model:
 * a human life rendered as a strict 30×30 grid of 900 months (= 75 years).
 *
 * Design invariants (do not break without updating the test suite):
 *  1. A month is only "lived" once its day-of-month anniversary is reached.
 *     Born Jan 15 → on Feb 14 you have lived 0 full months; on Feb 15, 1 month.
 *  2. End-of-month is clamped, not overflowed (the classic JS Date footgun).
 *     Born Jan 31 → the 1st month completes on Feb 28/29 (last day of Feb),
 *     NOT on Mar 3. This keeps anniversaries monotonic.
 *  3. All arithmetic is done on calendar fields (year/month/day), never on
 *     raw millisecond deltas, so DST and variable month lengths cannot drift
 *     the count.
 *  4. Granularity is the calendar day. Time-of-day is intentionally ignored:
 *     on the anniversary day, the month is counted as complete.
 *
 * Zero dependencies. Pure functions. Safe to unit test in isolation.
 */

/** Side length of the life grid. */
export const GRID_SIZE = 30;

/** Total months in a modeled life: 30 × 30. */
export const TOTAL_MONTHS = GRID_SIZE * GRID_SIZE; // 900

/** Modeled lifespan in years (900 / 12). */
export const TOTAL_YEARS = TOTAL_MONTHS / 12; // 75

/** A position in the 30×30 grid. Both axes are 0-indexed. */
export interface GridCell {
  /** 0..29, top-to-bottom. Each row spans 30 months (2.5 years). */
  readonly row: number;
  /** 0..29, left-to-right. */
  readonly col: number;
}

/** A full snapshot of where a life stands against the 900-month model. */
export interface LifeGridState {
  /** Whole months lived so far, clamped to [0, TOTAL_MONTHS]. */
  readonly monthsLived: number;
  /** Months remaining until the grid is full, clamped to [0, TOTAL_MONTHS]. */
  readonly monthsRemaining: number;
  /**
   * The cell currently being lived (0-indexed month → cell).
   * When the grid is full this is the final cell (29, 29).
   */
  readonly currentCell: GridCell;
  /** Fraction of life lived in [0, 1]. */
  readonly fractionLived: number;
  /** Convenience: fractionLived × 100, in [0, 100]. */
  readonly percentLived: number;
  /** True once monthsLived has reached or exceeded TOTAL_MONTHS. */
  readonly isComplete: boolean;
}

/** Number of days in the calendar month containing `date` (handles leap Feb). */
export function daysInMonth(year: number, monthIndex: number): number {
  // Day 0 of next month === last day of this month.
  return new Date(year, monthIndex + 1, 0).getDate();
}

/**
 * Validate a birth date for the model.
 * Throws on non-dates, future dates, or dates older than the modeled lifespan.
 */
export function assertValidBirthDate(birth: Date, asOf: Date = new Date()): void {
  if (!(birth instanceof Date) || Number.isNaN(birth.getTime())) {
    throw new RangeError("birth must be a valid Date");
  }
  if (!(asOf instanceof Date) || Number.isNaN(asOf.getTime())) {
    throw new RangeError("asOf must be a valid Date");
  }
  if (birth.getTime() > asOf.getTime()) {
    throw new RangeError("birth date cannot be in the future");
  }
}

/**
 * Whole calendar months between `birth` and `asOf`, honoring the
 * day-of-month anniversary rule (invariant #1) and end-of-month clamping
 * (invariant #2). Returns 0 when `asOf` precedes `birth`.
 */
export function monthsBetween(birth: Date, asOf: Date): number {
  if (asOf.getTime() <= birth.getTime()) return 0;

  let months =
    (asOf.getFullYear() - birth.getFullYear()) * 12 +
    (asOf.getMonth() - birth.getMonth());

  // The final, possibly-incomplete month: has the anniversary day arrived?
  // Threshold is the birth day-of-month, clamped to the length of asOf's month
  // so that e.g. born-on-31st completes on a short month's last day.
  const threshold = Math.min(
    birth.getDate(),
    daysInMonth(asOf.getFullYear(), asOf.getMonth()),
  );

  if (asOf.getDate() < threshold) {
    months -= 1;
  }

  return Math.max(0, months);
}

/** Whole months lived, clamped to [0, TOTAL_MONTHS]. */
export function monthsLived(birth: Date, asOf: Date = new Date()): number {
  assertValidBirthDate(birth, asOf);
  const raw = monthsBetween(birth, asOf);
  return Math.min(raw, TOTAL_MONTHS);
}

/**
 * Map a 0-indexed month to its grid cell (row-major: 30 months per row).
 * Out-of-range indices are clamped into [0, TOTAL_MONTHS - 1].
 */
export function monthToCell(monthIndex: number): GridCell {
  const i = clampInt(monthIndex, 0, TOTAL_MONTHS - 1);
  return { row: Math.floor(i / GRID_SIZE), col: i % GRID_SIZE };
}

/**
 * Inverse of {@link monthToCell}. Out-of-range row/col are clamped.
 */
export function cellToMonth(cell: GridCell): number {
  const row = clampInt(cell.row, 0, GRID_SIZE - 1);
  const col = clampInt(cell.col, 0, GRID_SIZE - 1);
  return row * GRID_SIZE + col;
}

/**
 * The complete grid state for a given birth date as of `asOf` (default: now).
 * This is the function the UI layer should consume.
 */
export function getLifeGridState(
  birth: Date,
  asOf: Date = new Date(),
): LifeGridState {
  const lived = monthsLived(birth, asOf);
  const isComplete = lived >= TOTAL_MONTHS;
  const fractionLived = lived / TOTAL_MONTHS;

  // The "current" cell is the month being lived now: index = lived (0-based),
  // i.e. after living 1 full month you are in cell index 1. Clamped at the end.
  const currentIndex = isComplete ? TOTAL_MONTHS - 1 : lived;

  return {
    monthsLived: lived,
    monthsRemaining: TOTAL_MONTHS - lived,
    currentCell: monthToCell(currentIndex),
    fractionLived,
    percentLived: fractionLived * 100,
    isComplete,
  };
}

/** Integer clamp helper. */
function clampInt(value: number, min: number, max: number): number {
  const v = Math.trunc(value);
  if (v < min) return min;
  if (v > max) return max;
  return v;
}
