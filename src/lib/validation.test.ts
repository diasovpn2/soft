import { describe, it, expect } from 'vitest';
import {
  validateIntervalBounds,
  validateStartInFuture,
  validateMaxDuration,
  validateRoomNotBlocked,
  validateNoOverlap,
  MAX_BOOKING_DURATION,
} from './validation';
import { Booking, Room } from '@/data/campus';

const openRoom: Room = {
  code: 'A-101',
  name: 'Lecture Hall Alpha',
  building: 'Engineering Block',
  capacity: 120,
  blocked: false,
};

const blockedRoom: Room = {
  code: 'C-310',
  name: 'Computer Lab Gamma',
  building: 'IT Tower',
  capacity: 40,
  blocked: true,
  blockedReason: 'Under maintenance until 18:00',
};

const booking = (start: number, end: number): Booking => ({
  id: `b-${start}`,
  roomCode: 'A-101',
  start,
  end,
  bookedBy: 'Prof. Mendez',
  purpose: 'Calculus II',
});

describe('validateIntervalBounds — AC1', () => {
  // AC1: interval must satisfy 0 ≤ start < end ≤ 1440 minutes.
  it('AC1 — accepts 0 ≤ start < end ≤ 1440 (expected: null, no issue)', () => {
    expect(validateIntervalBounds(0, 1440)).toBeNull();
    expect(validateIntervalBounds(600, 660)).toBeNull();
  });
  it('AC1 — rejects negative start (expected: issue with bounds message)', () => {
    expect(validateIntervalBounds(-1, 60)).not.toBeNull();
  });
  it('AC1 — rejects end beyond 1440 (expected: issue with bounds message)', () => {
    expect(validateIntervalBounds(1430, 1441)).not.toBeNull();
  });
  // Required case: start >= end must be rejected.
  it('AC1 — rejects start >= end (expected: issue, equal and reversed)', () => {
    expect(validateIntervalBounds(600, 600)).not.toBeNull();
    expect(validateIntervalBounds(660, 600)).not.toBeNull();
  });
});

describe('validateStartInFuture — AC1 (temporal ordering)', () => {
  // Required case: past booking time must be rejected.
  // AC1 requires start to be strictly after the current time.
  it('AC1 — rejects start at or before current time / past booking (expected: issue)', () => {
    expect(validateStartInFuture(600, 600)).not.toBeNull();
    expect(validateStartInFuture(590, 600)).not.toBeNull();
  });
  it('AC1 — accepts start strictly after current time (expected: null)', () => {
    expect(validateStartInFuture(601, 600)).toBeNull();
  });
});

describe('validateMaxDuration — AC2', () => {
  // AC2: bookings may not exceed 120 minutes.
  // Required case: 121-minute duration must be rejected.
  it(`AC2 — rejects durations over ${MAX_BOOKING_DURATION} minutes / 121 min (expected: issue)`, () => {
    expect(validateMaxDuration(600, 600 + MAX_BOOKING_DURATION + 1)).not.toBeNull();
  });
  it('AC2 — accepts durations up to the maximum / 120 min (expected: null)', () => {
    expect(validateMaxDuration(600, 600 + MAX_BOOKING_DURATION)).toBeNull();
  });
});

describe('validateRoomNotBlocked — AC3', () => {
  // AC3: a blocked room must be rejected.
  // Required case: blocked room must be rejected.
  it('AC3 — rejects blocked rooms with reason (expected: issue mentioning reason)', () => {
    const issue = validateRoomNotBlocked(blockedRoom);
    expect(issue).not.toBeNull();
    expect(issue!.reason).toContain('Under maintenance');
  });
  it('AC3 — accepts open rooms (expected: null)', () => {
    expect(validateRoomNotBlocked(openRoom)).toBeNull();
  });
});

describe('validateNoOverlap — AC4', () => {
  // AC4: overlapping bookings must be rejected; touching endpoints are allowed.
  // Required case: overlapping bookings must be rejected.
  it('AC4 — rejects overlapping bookings (expected: issue)', () => {
    const existing = [booking(600, 660)];
    expect(validateNoOverlap(openRoom, 650, 700, existing)).not.toBeNull();
  });
  // Required case: bookings touching only at endpoints must be allowed.
  it('AC4 — allows adjacent (touching) bookings from both sides (expected: null)', () => {
    const existing = [booking(600, 660)];
    // proposed end touches existing start
    expect(validateNoOverlap(openRoom, 660, 700, existing)).toBeNull();
    // proposed start touches existing end
    expect(validateNoOverlap(openRoom, 540, 600, existing)).toBeNull();
  });
  it('AC4 — ignores bookings for other rooms (expected: null)', () => {
    const other: Booking = { ...booking(600, 660), roomCode: 'B-204' };
    expect(validateNoOverlap(openRoom, 610, 650, [other])).toBeNull();
  });
  // Required case: booking fixture data must remain unchanged.
  it('AC4 — does not mutate the input booking array (expected: array identical)', () => {
    const existing = [booking(600, 660), booking(700, 720)];
    const snapshot = existing.map((b) => ({ ...b }));
    validateNoOverlap(openRoom, 800, 900, existing);
    expect(existing).toEqual(snapshot);
  });
});
