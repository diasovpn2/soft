import { describe, it, expect } from 'vitest';
import { checkAvailability } from './availability';
import { filterAvailableRooms } from './filtering';
import {
  bookings as seedBookings,
  rooms as seedRooms,
  Room,
} from '@/data/campus';
import { MAX_BOOKING_DURATION } from './validation';

const A101 = seedRooms.find((r) => r.code === 'A-101') as Room;
const B204 = seedRooms.find((r) => r.code === 'B-204') as Room;

// ─── F5: switching selected rooms refreshes availability ───
// using that room's own bookings.
//
// These integration tests exercise the full availability pipeline with the
// seed booking data. checkAvailability receives the entire bookings array
// and validateNoOverlap internally filters by roomCode, so switching the
// selected room must produce a result driven by that room's own bookings.

describe('Integration — F5: switching rooms uses each room own bookings', () => {
  // A-101 has a booking 09:00–10:30 (540–630). A slot overlapping it must be
  // unavailable.
  it('F5 — A-101 at 09:15–10:00 overlaps A-101 booking (expected: unavailable)', () => {
    const v = checkAvailability(A101, 555, 600, 480, seedBookings);
    expect(v.status).toBe('unavailable');
    if (v.status === 'unavailable') expect(v.reason).toContain('Overlaps');
  });

  // B-204 has a booking 11:00–12:00 (660–720). The same 09:15–10:00 slot does
  // NOT overlap B-204's booking, so switching to B-204 must return available.
  it('F5 — B-204 at 09:15–10:00 does not overlap B-204 booking (expected: available)', () => {
    const v = checkAvailability(B204, 555, 600, 480, seedBookings);
    expect(v.status).toBe('available');
    if (v.status === 'available') {
      expect(v.room.code).toBe('B-204');
    }
  });

  // The converse: B-204 at 11:15–11:45 overlaps B-204's booking, while A-101
  // at the same time is free (A-101's bookings are at 09:00 and 13:00).
  it('F5 — B-204 at 11:15–11:45 overlaps B-204 booking (expected: unavailable)', () => {
    const v = checkAvailability(B204, 675, 705, 600, seedBookings);
    expect(v.status).toBe('unavailable');
    if (v.status === 'unavailable') expect(v.reason).toContain('Overlaps');
  });

  it('F5 — A-101 at 11:15–11:45 does not overlap A-101 booking (expected: available)', () => {
    const v = checkAvailability(A101, 675, 705, 600, seedBookings);
    expect(v.status).toBe('available');
  });
});

// ─── Boundary tests through the full pipeline ───

describe('Integration — duration boundary through checkAvailability', () => {
  // Exactly 120 minutes: A-101 07:00–09:00 (420–540) does not overlap the
  // 09:00–10:30 booking (touches at 540) and start is in the future.
  it('boundary — exactly 120 minutes is accepted (expected: available)', () => {
    const v = checkAvailability(A101, 420, 540, 360, seedBookings);
    expect(v.status).toBe('available');
    if (v.status === 'available') {
      expect(v.end - v.start).toBe(MAX_BOOKING_DURATION);
    }
  });

  // 121 minutes: must be rejected by the max-duration rule.
  it('boundary — 121 minutes is rejected (expected: unavailable, "120 minutes")', () => {
    const v = checkAvailability(A101, 420, 541, 360, seedBookings);
    expect(v.status).toBe('unavailable');
    if (v.status === 'unavailable') expect(v.reason).toMatch(/120 minutes/);
  });
});

describe('Integration — overlap boundary through checkAvailability', () => {
  // Touching at the end: proposed 10:30–11:00 touches existing 09:00–10:30
  // at endpoint 630. Must be allowed.
  it('boundary — touching at endpoint is allowed (expected: available)', () => {
    const v = checkAvailability(A101, 630, 660, 600, seedBookings);
    expect(v.status).toBe('available');
  });

  // Overlapping: proposed 09:15–10:00 overlaps existing 09:00–10:30.
  // Must be rejected.
  it('boundary — overlapping is rejected (expected: unavailable, "Overlaps")', () => {
    const v = checkAvailability(A101, 555, 600, 480, seedBookings);
    expect(v.status).toBe('unavailable');
    if (v.status === 'unavailable') expect(v.reason).toContain('Overlaps');
  });
});

// ─── Full pipeline: filter → check availability ───

describe('Integration — filterAvailableRooms then checkAvailability', () => {
  it('pipeline — a room found by filtering can be checked for availability', () => {
    // Find rooms with capacity >= 30 and projector equipment, not blocked.
    const candidates = filterAvailableRooms(seedRooms, 30, ['projector']);
    const candidate = candidates.find((r) => r.code === 'A-101');
    expect(candidate).toBeDefined();

    // Check a valid slot on the filtered room.
    const v = checkAvailability(candidate!, 700, 760, 600, seedBookings);
    expect(v.status).toBe('available');
  });

  it('pipeline — filtered-out room (blocked) is not in candidates', () => {
    const candidates = filterAvailableRooms(seedRooms, 0, ['pcs']);
    // C-310 has 'pcs' but is blocked → must be excluded.
    const codes = candidates.map((r) => r.code);
    expect(codes).not.toContain('C-310');
  });
});
