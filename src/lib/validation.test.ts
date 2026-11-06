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
  it('accepts 0 ≤ start < end ≤ 1440', () => {
    expect(validateIntervalBounds(0, 1440)).toBeNull();
    expect(validateIntervalBounds(600, 660)).toBeNull();
  });
  it('rejects negative start', () => {
    expect(validateIntervalBounds(-1, 60)).not.toBeNull();
  });
  it('rejects end beyond 1440', () => {
    expect(validateIntervalBounds(1430, 1441)).not.toBeNull();
  });
  it('rejects start >= end', () => {
    expect(validateIntervalBounds(600, 600)).not.toBeNull();
    expect(validateIntervalBounds(660, 600)).not.toBeNull();
  });
});

describe('validateStartInFuture', () => {
  it('rejects start at or before current time', () => {
    expect(validateStartInFuture(600, 600)).not.toBeNull();
    expect(validateStartInFuture(590, 600)).not.toBeNull();
  });
  it('accepts start strictly after current time', () => {
    expect(validateStartInFuture(601, 600)).toBeNull();
  });
});

describe('validateMaxDuration — AC2', () => {
  it(`rejects durations over ${MAX_BOOKING_DURATION} minutes`, () => {
    expect(validateMaxDuration(600, 600 + MAX_BOOKING_DURATION + 1)).not.toBeNull();
  });
  it('accepts durations up to the maximum', () => {
    expect(validateMaxDuration(600, 600 + MAX_BOOKING_DURATION)).toBeNull();
  });
});

describe('validateRoomNotBlocked — AC3', () => {
  it('rejects blocked rooms with reason', () => {
    const issue = validateRoomNotBlocked(blockedRoom);
    expect(issue).not.toBeNull();
    expect(issue!.reason).toContain('Under maintenance');
  });
  it('accepts open rooms', () => {
    expect(validateRoomNotBlocked(openRoom)).toBeNull();
  });
});

describe('validateNoOverlap — AC4', () => {
  it('rejects overlapping bookings (touching endpoints allowed)', () => {
    const existing = [booking(600, 660)];
    expect(validateNoOverlap(openRoom, 650, 700, existing)).not.toBeNull();
  });
  it('allows adjacent (touching) bookings', () => {
    const existing = [booking(600, 660)];
    expect(validateNoOverlap(openRoom, 660, 700, existing)).toBeNull();
    expect(validateNoOverlap(openRoom, 540, 600, existing)).toBeNull();
  });
  it('ignores bookings for other rooms', () => {
    const other: Booking = { ...booking(600, 660), roomCode: 'B-204' };
    expect(validateNoOverlap(openRoom, 610, 650, [other])).toBeNull();
  });
  it('does not mutate the input array', () => {
    const existing = [booking(600, 660), booking(700, 720)];
    const snapshot = existing.map((b) => ({ ...b }));
    validateNoOverlap(openRoom, 800, 900, existing);
    expect(existing).toEqual(snapshot);
  });
});
