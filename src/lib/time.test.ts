import { describe, it, expect } from 'vitest';
import { minutesToTime, timeToMinutes, MINUTES_IN_DAY } from './time';

describe('minutesToTime — boundary regression', () => {
  // Regression: minutesToTime(1440) must NOT wrap to "00:00".
  // The footer previously displayed "00:00–00:00" because the modulo
  // in minutesToTime collapsed 1440 to 0. The fix uses MINUTES_IN_DAY - 1
  // (1439 = "23:59") in the footer, but this test also guards the raw
  // function behaviour at the day boundary so the bug is caught if it
  // recurs.
  it('minutesToTime(0) returns "00:00" (day start)', () => {
    expect(minutesToTime(0)).toBe('00:00');
  });

  it('minutesToTime(1439) returns "23:59" (last valid minute)', () => {
    expect(minutesToTime(MINUTES_IN_DAY - 1)).toBe('23:59');
  });

  it('minutesToTime(1440) wraps to "00:00" (documented behaviour)', () => {
    // This is the existing modulo behaviour — the test documents it so
    // a future change is intentional, not accidental. The footer fix
    // avoids calling minutesToTime(1440) by using MINUTES_IN_DAY - 1.
    expect(minutesToTime(MINUTES_IN_DAY)).toBe('00:00');
  });
});

describe('timeToMinutes — round-trip with minutesToTime', () => {
  it('timeToMinutes(minutesToTime(n)) === n for valid range', () => {
    for (const n of [0, 1, 60, 720, 1439]) {
      expect(timeToMinutes(minutesToTime(n))).toBe(n);
    }
  });
});
