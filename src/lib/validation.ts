import { Booking, Room } from '@/data/campus';
import { MINUTES_IN_DAY } from './time';

export const MAX_BOOKING_DURATION = 120;

export type IntervalIssue = { reason: string };

export function validateIntervalBounds(
  start: number,
  end: number
): IntervalIssue | null {
  if (start < 0 || end > MINUTES_IN_DAY || start >= end) {
    return {
      reason: 'Interval must satisfy 0 ≤ start < end ≤ 1440 minutes.',
    };
  }
  return null;
}

export function validateStartInFuture(
  start: number,
  currentTime: number
): IntervalIssue | null {
  if (start <= currentTime) {
    return { reason: 'Start time must be after the current time.' };
  }
  return null;
}

export function validateMaxDuration(
  start: number,
  end: number
): IntervalIssue | null {
  if (end - start > MAX_BOOKING_DURATION) {
    return { reason: 'Bookings may not exceed 120 minutes.' };
  }
  return null;
}

export function validateRoomNotBlocked(room: Room): IntervalIssue | null {
  if (room.blocked) {
    return { reason: `Room is blocked: ${room.blockedReason ?? 'unavailable'}.` };
  }
  return null;
}

export function validateNoOverlap(
  room: Room,
  start: number,
  end: number,
  existing: readonly Booking[]
): IntervalIssue | null {
  const conflict = existing
    .filter((b) => b.roomCode === room.code)
    .find((b) => start < b.end && end > b.start);
  if (conflict) {
    return {
      reason: `Overlaps an existing booking (${conflict.bookedBy}: ${conflict.purpose}).`,
    };
  }
  return null;
}
