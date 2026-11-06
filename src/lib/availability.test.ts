import { describe, it, expect } from 'vitest';
import { checkAvailability } from './availability';
import { bookings as seedBookings, rooms, Room } from '@/data/campus';

const OPEN_ROOM = rooms.find((r) => r.code === 'A-101') as Room;
const BLOCKED_ROOM = rooms.find((r) => r.code === 'C-310') as Room;

describe('checkAvailability — AC5 no room selected', () => {
  it('returns unavailable when room is null', () => {
    const v = checkAvailability(null, 600, 660, 500, seedBookings);
    expect(v.status).toBe('unavailable');
    if (v.status === 'unavailable') expect(v.reason).toMatch(/select a room/i);
  });
});

describe('checkAvailability — AC1 interval bounds', () => {
  it('rejects start >= end', () => {
    const v = checkAvailability(OPEN_ROOM, 660, 660, 500, seedBookings);
    expect(v.status).toBe('unavailable');
  });
  it('rejects negative start', () => {
    const v = checkAvailability(OPEN_ROOM, -1, 60, -2, seedBookings);
    expect(v.status).toBe('unavailable');
  });
  it('rejects end beyond 1440', () => {
    const v = checkAvailability(OPEN_ROOM, 1430, 1441, 500, seedBookings);
    expect(v.status).toBe('unavailable');
  });
});

describe('checkAvailability — start in future', () => {
  it('rejects start at current time', () => {
    const v = checkAvailability(OPEN_ROOM, 600, 660, 600, seedBookings);
    expect(v.status).toBe('unavailable');
  });
  it('rejects start before current time', () => {
    const v = checkAvailability(OPEN_ROOM, 500, 660, 600, seedBookings);
    expect(v.status).toBe('unavailable');
  });
});

describe('checkAvailability — AC2 max duration', () => {
  it('rejects 121-minute booking', () => {
    // 07:00–09:01 (121 min) — no overlap, so only the duration rule fires
    const v = checkAvailability(OPEN_ROOM, 7 * 60, 7 * 60 + 121, 6 * 60, seedBookings);
    expect(v.status).toBe('unavailable');
    if (v.status === 'unavailable') expect(v.reason).toMatch(/120 minutes/);
  });
  it('accepts 120-minute booking when otherwise free', () => {
    // 07:00–09:00 on A-101 does not overlap existing 09:00–10:30 booking
    const v = checkAvailability(OPEN_ROOM, 7 * 60, 9 * 60, 6 * 60, seedBookings);
    expect(v.status).toBe('available');
  });
});

describe('checkAvailability — AC3 blocked room', () => {
  it('rejects blocked room regardless of time', () => {
    const v = checkAvailability(BLOCKED_ROOM, 700, 760, 500, seedBookings);
    expect(v.status).toBe('unavailable');
    if (v.status === 'unavailable') expect(v.reason).toContain('blocked');
  });
});

describe('checkAvailability — AC4 overlap', () => {
  it('rejects a slot overlapping an existing booking on A-101', () => {
    const v = checkAvailability(OPEN_ROOM, 9 * 60 + 15, 10 * 60, 500, seedBookings);
    expect(v.status).toBe('unavailable');
    if (v.status === 'unavailable') expect(v.reason).toContain('Overlaps');
  });
  it('allows a slot adjacent to an existing booking', () => {
    const v = checkAvailability(OPEN_ROOM, 10 * 60 + 30, 11 * 60, 500, seedBookings);
    expect(v.status).toBe('available');
  });
});

describe('checkAvailability — AC6 available verdict', () => {
  it('returns available with room, start, end for a valid slot', () => {
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
  it('does not mutate the seed bookings array', () => {
    const snapshot = seedBookings.map((b) => ({ ...b }));
    checkAvailability(OPEN_ROOM, 700, 760, 500, seedBookings);
    checkAvailability(OPEN_ROOM, 900, 960, 500, seedBookings);
    expect(seedBookings).toEqual(snapshot);
  });
});
