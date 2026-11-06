import { Booking, Room } from '@/data/campus';
import { MINUTES_IN_DAY } from './time';

export type Verdict =
  | { status: 'available'; room: Room; start: number; end: number }
  | { status: 'unavailable'; reason: string };

export function checkAvailability(
  room: Room | null,
  start: number,
  end: number,
  currentTime: number,
  existing: Booking[]
): Verdict {
  if (!room) return { status: 'unavailable', reason: 'Please select a room.' };

  // AC1: interval bounds and ordering
  if (start < 0 || end > MINUTES_IN_DAY || start >= end) {
    return {
      status: 'unavailable',
      reason: 'Interval must satisfy 0 ≤ start < end ≤ 1440 minutes.',
    };
  }
  if (start <= currentTime) {
    return {
      status: 'unavailable',
      reason: 'Start time must be after the current time.',
    };
  }

  // AC2: max 120 minutes
  if (end - start > 120) {
    return {
      status: 'unavailable',
      reason: 'Bookings may not exceed 120 minutes.',
    };
  }

  // AC3: blocked room
  if (room.blocked) {
    return {
      status: 'unavailable',
      reason: `Room is blocked: ${room.blockedReason ?? 'unavailable'}.`,
    };
  }

  // AC4: overlap check (touching endpoints allowed)
  const roomBookings = existing.filter((b) => b.roomCode === room.code);
  const conflict = roomBookings.find(
    (b) => start < b.end && end > b.start
  );
  if (conflict) {
    return {
      status: 'unavailable',
      reason: `Overlaps an existing booking (${conflict.bookedBy}: ${conflict.purpose}).`,
    };
  }

  return { status: 'available', room, start, end };
}
