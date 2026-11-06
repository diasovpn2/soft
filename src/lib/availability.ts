import { Booking, Room } from '@/data/campus';
import {
  validateIntervalBounds,
  validateMaxDuration,
  validateNoOverlap,
  validateRoomNotBlocked,
  validateStartInFuture,
} from './validation';

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

  const checks: Array<() => { reason: string } | null> = [
    () => validateIntervalBounds(start, end),
    () => validateStartInFuture(start, currentTime),
    () => validateMaxDuration(start, end),
    () => validateRoomNotBlocked(room),
    () => validateNoOverlap(room, start, end, existing),
  ];

  for (const check of checks) {
    const issue = check();
    if (issue) return { status: 'unavailable', reason: issue.reason };
  }

  return { status: 'available', room, start, end };
}
