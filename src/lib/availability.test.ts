import { describe, it, expect } from 'vitest';
import { checkAvailability } from './availability';
import { bookings as seedBookings, rooms, Room } from '@/data/campus';

const OPEN_ROOM = rooms.find((r) => r.code === 'A-101') as Room;
const BLOCKED_ROOM = rooms.find((r) => r.code === 'C-310') as Room;

describe('checkAvailability — AC5 no room selected', () => {
  // AC5: a room must be selected before checking.
  it('AC5 — returns unavailable when room is null (expected: unavailable, "select a room")', () => {
    const v = checkAvailability(null, 600, 660, 500, seedBookings);
    expect(v.status).toBe('unavailable');
    if (v.status === 'unavailable') expect(v.reason).toMatch(/select a room/i);
  });
});

describe('checkAvailability — AC1 interval bounds', () => {
  // AC1: interval must satisfy 0 ≤ start < end ≤ 1440 minutes.
  // Required case: start >= end must be rejected.
  it('AC1 — rejects start >= end / equal start and end (expected: unavailable)', () => {
    const v = checkAvailability(OPEN_ROOM, 660, 660, 500, seedBookings);
    expect(v.status).toBe('unavailable');
  });
  it('AC1 — rejects start > end / reversed interval (expected: unavailable)', () => {
    const v = checkAvailability(OPEN_ROOM, 660, 600, 500, seedBookings);
    expect(v.status).toBe('unavailable');
  });
  it('AC1 — rejects negative start (expected: unavailable)', () => {
    const v = checkAvailability(OPEN_ROOM, -1, 60, -2, seedBookings);
    expect(v.status).toBe('unavailable');
  });
  it('AC1 — rejects end beyond 1440 (expected: unavailable)', () => {
    const v = checkAvailability(OPEN_ROOM, 1430, 1441, 500, seedBookings);
    expect(v.status).toBe('unavailable');
  });
});

describe('checkAvailability — AC1 temporal ordering (start in future)', () => {
  // AC1 requires the proposed start to be strictly after the current time.
  // Required case: past booking time must be rejected.
  it('AC1 — rejects start at current time / not strictly in future (expected: unavailable)', () => {
    const v = checkAvailability(OPEN_ROOM, 600, 660, 600, seedBookings);
    expect(v.status).toBe('unavailable');
    if (v.status === 'unavailable') expect(v.reason).toMatch(/after the current time/i);
  });
  it('AC1 — rejects start before current time / past booking (expected: unavailable)', () => {
    const v = checkAvailability(OPEN_ROOM, 500, 660, 600, seedBookings);
    expect(v.status).toBe('unavailable');
    if (v.status === 'unavailable') expect(v.reason).toMatch(/after the current time/i);
  });
});

describe('checkAvailability — AC2 max duration', () => {
  // AC2: bookings may not exceed 120 minutes.
  // Required case: 121-minute booking must be rejected.
  it('AC2 — rejects 121-minute booking (expected: unavailable, "120 minutes")', () => {
    // 07:00–09:01 (121 min) — no overlap, so only the duration rule fires
    const v = checkAvailability(OPEN_ROOM, 7 * 60, 7 * 60 + 121, 6 * 60, seedBookings);
    expect(v.status).toBe('unavailable');
    if (v.status === 'unavailable') expect(v.reason).toMatch(/120 minutes/);
  });
  it('AC2 — accepts 120-minute booking when otherwise free (expected: available)', () => {
    // 07:00–09:00 on A-101 does not overlap existing 09:00–10:30 booking
    const v = checkAvailability(OPEN_ROOM, 7 * 60, 9 * 60, 6 * 60, seedBookings);
    expect(v.status).toBe('available');
  });
});

describe('checkAvailability — AC3 blocked room', () => {
  // AC3: a blocked room must be rejected regardless of the time slot.
  // Required case: blocked room must be rejected.
  it('AC3 — rejects blocked room regardless of time (expected: unavailable, "blocked")', () => {
    const v = checkAvailability(BLOCKED_ROOM, 700, 760, 500, seedBookings);
    expect(v.status).toBe('unavailable');
    if (v.status === 'unavailable') expect(v.reason).toContain('blocked');
  });
});

describe('checkAvailability — AC4 overlap', () => {
  // AC4: overlapping bookings must be rejected; touching endpoints are allowed.
  // Required case: overlapping bookings must be rejected.
  it('AC4 — rejects a slot overlapping an existing booking on A-101 (expected: unavailable, "Overlaps")', () => {
    // Existing A-101 booking 09:00–10:30; proposed 09:15–10:00 overlaps it.
    const v = checkAvailability(OPEN_ROOM, 9 * 60 + 15, 10 * 60, 500, seedBookings);
    expect(v.status).toBe('unavailable');
    if (v.status === 'unavailable') expect(v.reason).toContain('Overlaps');
  });
  // Required case: bookings touching only at endpoints must be allowed.
  it('AC4 — allows a slot touching at the end of an existing booking (expected: available)', () => {
    // Existing A-101 booking 09:00–10:30; proposed 10:30–11:00 touches at 10:30.
    const v = checkAvailability(OPEN_ROOM, 10 * 60 + 30, 11 * 60, 500, seedBookings);
    expect(v.status).toBe('available');
  });
  it('AC4 — allows a slot touching at the start of an existing booking (expected: available)', () => {
    // Existing A-101 booking 09:00–10:30; proposed 08:00–09:00 touches at 09:00.
    // Current time set to 07:00 so the start is in the future.
    const v = checkAvailability(OPEN_ROOM, 8 * 60, 9 * 60, 7 * 60, seedBookings);
    expect(v.status).toBe('available');
  });
});

describe('checkAvailability — AC6 available verdict', () => {
  // AC6: when all rules pass, the verdict must be "available" and carry the
  // room, start, and end so the UI can render the confirmation.
  it('AC6 — returns available with room, start, end for a valid slot (expected: available, correct payload)', () => {
    const v = checkAvailability(OPEN_ROOM, 700, 760, 500, seedBookings);
    expect(v.status).toBe('available');
    if (v.status === 'available') {
      expect(v.room.code).toBe('A-101');
      expect(v.start).toBe(700);
      expect(v.end).toBe(760);
    }
  });
});

describe('checkAvailability — fixture immutability', () => {
  // Required case: booking fixture data must remain unchanged after checks.
  it('does not mutate the seed bookings array (expected: array identical after multiple checks)', () => {
    const snapshot = seedBookings.map((b) => ({ ...b }));
    checkAvailability(OPEN_ROOM, 700, 760, 500, seedBookings);
    checkAvailability(OPEN_ROOM, 900, 960, 500, seedBookings);
    checkAvailability(BLOCKED_ROOM, 700, 760, 500, seedBookings);
    checkAvailability(OPEN_ROOM, 9 * 60 + 15, 10 * 60, 500, seedBookings);
    expect(seedBookings).toEqual(snapshot);
  });
});
