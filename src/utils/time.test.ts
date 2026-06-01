import { describe, it, expect } from "vitest";
import {
  GRID_SIZE,
  TOTAL_MONTHS,
  TOTAL_YEARS,
  daysInMonth,
  assertValidBirthDate,
  monthsBetween,
  monthsLived,
  monthToCell,
  cellToMonth,
  getLifeGridState,
} from "./time";

// Local Date constructor (year, monthIndex, day) keeps tests TZ-stable since
// the algorithm only reads calendar fields, never absolute timestamps.
const d = (y: number, m: number, day: number, h = 12) => new Date(y, m, day, h);

describe("constants", () => {
  it("encodes the 30×30 / 900 / 75 model", () => {
    expect(GRID_SIZE).toBe(30);
    expect(TOTAL_MONTHS).toBe(900);
    expect(TOTAL_YEARS).toBe(75);
  });
});

describe("daysInMonth", () => {
  it("returns correct lengths incl. leap February", () => {
    expect(daysInMonth(2023, 1)).toBe(28); // Feb 2023
    expect(daysInMonth(2024, 1)).toBe(29); // Feb 2024 (leap)
    expect(daysInMonth(2000, 1)).toBe(29); // Feb 2000 (leap, /400)
    expect(daysInMonth(1900, 1)).toBe(28); // Feb 1900 (not leap, /100)
    expect(daysInMonth(2024, 0)).toBe(31); // Jan
    expect(daysInMonth(2024, 3)).toBe(30); // Apr
  });
});

describe("assertValidBirthDate", () => {
  it("accepts a valid past date", () => {
    expect(() => assertValidBirthDate(d(1990, 0, 1), d(2026, 0, 1))).not.toThrow();
  });
  it("rejects invalid Date objects", () => {
    expect(() => assertValidBirthDate(new Date("nonsense"), d(2026, 0, 1))).toThrow(
      RangeError,
    );
  });
  it("rejects a future birth date", () => {
    expect(() => assertValidBirthDate(d(2027, 0, 1), d(2026, 0, 1))).toThrow(
      /future/,
    );
  });
  it("treats same instant as valid (0 months)", () => {
    const now = d(2000, 0, 1);
    expect(() => assertValidBirthDate(now, now)).not.toThrow();
  });
});

describe("monthsBetween — the anniversary rule (invariant #1)", () => {
  const birth = d(2000, 0, 15); // Jan 15, 2000

  it("is 0 on the birth day", () => {
    expect(monthsBetween(birth, d(2000, 0, 15))).toBe(0);
  });
  it("is 0 the day before the first monthly anniversary", () => {
    expect(monthsBetween(birth, d(2000, 1, 14))).toBe(0); // Feb 14
  });
  it("ticks to 1 exactly on the anniversary day", () => {
    expect(monthsBetween(birth, d(2000, 1, 15))).toBe(1); // Feb 15
  });
  it("stays at 1 the day after, before next anniversary", () => {
    expect(monthsBetween(birth, d(2000, 2, 14))).toBe(1); // Mar 14
  });
  it("counts a full year as 12 months", () => {
    expect(monthsBetween(birth, d(2001, 0, 15))).toBe(12);
  });
  it("returns 0 when asOf precedes birth", () => {
    expect(monthsBetween(birth, d(1999, 11, 31))).toBe(0);
  });
});

describe("monthsBetween — end-of-month clamping (invariant #2)", () => {
  it("born Jan 31 → first month completes on Feb 28 (non-leap)", () => {
    const birth = d(2023, 0, 31);
    expect(monthsBetween(birth, d(2023, 1, 27))).toBe(0); // Feb 27
    expect(monthsBetween(birth, d(2023, 1, 28))).toBe(1); // Feb 28 (clamped)
    expect(monthsBetween(birth, d(2023, 2, 30))).toBe(1); // Mar 30, before Mar 31
    expect(monthsBetween(birth, d(2023, 2, 31))).toBe(2); // Mar 31
  });
  it("born Jan 31 → first month completes on Feb 29 (leap)", () => {
    const birth = d(2024, 0, 31);
    expect(monthsBetween(birth, d(2024, 1, 28))).toBe(0); // Feb 28
    expect(monthsBetween(birth, d(2024, 1, 29))).toBe(1); // Feb 29 (clamped)
  });
  it("born Mar 31 → Apr (30d) completes on Apr 30", () => {
    const birth = d(2023, 2, 31);
    expect(monthsBetween(birth, d(2023, 3, 29))).toBe(0); // Apr 29
    expect(monthsBetween(birth, d(2023, 3, 30))).toBe(1); // Apr 30 (clamped)
  });
});

describe("monthsBetween — leap-day births (Feb 29)", () => {
  const birth = d(2000, 1, 29); // Feb 29, 2000
  it("non-leap anniversary clamps to Feb 28", () => {
    expect(monthsBetween(birth, d(2001, 1, 28))).toBe(12); // Feb 28, 2001
  });
  it("true leap anniversary lands on Feb 29", () => {
    expect(monthsBetween(birth, d(2004, 1, 29))).toBe(48); // Feb 29, 2004
  });
});

describe("monthsLived — clamping to the model", () => {
  it("returns 0 on the birth day", () => {
    expect(monthsLived(d(2026, 4, 31), d(2026, 4, 31))).toBe(0);
  });
  it("caps at TOTAL_MONTHS for very long lives", () => {
    expect(monthsLived(d(1900, 0, 1), d(2026, 0, 1))).toBe(TOTAL_MONTHS);
  });
  it("matches expected count mid-life", () => {
    // Born Jun 2000, asOf Jun 2030 → exactly 360 months.
    expect(monthsLived(d(2000, 5, 10), d(2030, 5, 10))).toBe(360);
  });
  it("throws on future birth via the validator", () => {
    expect(() => monthsLived(d(2027, 0, 1), d(2026, 0, 1))).toThrow(RangeError);
  });
});

describe("monthToCell / cellToMonth — bijection & layout", () => {
  it("maps the first month to the top-left cell", () => {
    expect(monthToCell(0)).toEqual({ row: 0, col: 0 });
  });
  it("wraps to the next row after 30 months", () => {
    expect(monthToCell(29)).toEqual({ row: 0, col: 29 });
    expect(monthToCell(30)).toEqual({ row: 1, col: 0 });
  });
  it("maps the final month to the bottom-right cell", () => {
    expect(monthToCell(TOTAL_MONTHS - 1)).toEqual({ row: 29, col: 29 });
  });
  it("clamps out-of-range indices", () => {
    expect(monthToCell(-5)).toEqual({ row: 0, col: 0 });
    expect(monthToCell(99999)).toEqual({ row: 29, col: 29 });
  });
  it("round-trips every month index", () => {
    for (let i = 0; i < TOTAL_MONTHS; i++) {
      expect(cellToMonth(monthToCell(i))).toBe(i);
    }
  });
  it("clamps out-of-range cells", () => {
    expect(cellToMonth({ row: -1, col: -1 })).toBe(0);
    expect(cellToMonth({ row: 99, col: 99 })).toBe(TOTAL_MONTHS - 1);
  });
});

describe("getLifeGridState — UI-facing snapshot", () => {
  it("is all-zero at birth and sits in the first cell", () => {
    const s = getLifeGridState(d(2026, 0, 1), d(2026, 0, 1));
    expect(s.monthsLived).toBe(0);
    expect(s.monthsRemaining).toBe(TOTAL_MONTHS);
    expect(s.currentCell).toEqual({ row: 0, col: 0 });
    expect(s.fractionLived).toBe(0);
    expect(s.percentLived).toBe(0);
    expect(s.isComplete).toBe(false);
  });

  it("places the current cell at the lived index mid-life", () => {
    // 31 full months lived → currently living index 31 → row 1, col 1.
    const s = getLifeGridState(d(2000, 0, 15), d(2002, 7, 15)); // +31 months
    expect(s.monthsLived).toBe(31);
    expect(s.currentCell).toEqual({ row: 1, col: 1 });
    expect(s.monthsRemaining).toBe(TOTAL_MONTHS - 31);
  });

  it("reports completion and the final cell for a full life", () => {
    const s = getLifeGridState(d(1900, 0, 1), d(2026, 0, 1));
    expect(s.isComplete).toBe(true);
    expect(s.monthsLived).toBe(TOTAL_MONTHS);
    expect(s.monthsRemaining).toBe(0);
    expect(s.currentCell).toEqual({ row: 29, col: 29 });
    expect(s.fractionLived).toBe(1);
    expect(s.percentLived).toBe(100);
  });

  it("computes a coherent fraction at the half-way point", () => {
    // 450 months ≈ 37.5 years.
    const s = getLifeGridState(d(1988, 5, 1), d(2025, 11, 1)); // +450 months
    expect(s.monthsLived).toBe(450);
    expect(s.fractionLived).toBeCloseTo(0.5, 10);
    expect(s.percentLived).toBeCloseTo(50, 10);
  });
});
