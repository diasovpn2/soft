import { Room } from '@/data/campus';

export function filterByCapacity(
  rooms: readonly Room[],
  minCapacity: number
): Room[] {
  if (minCapacity <= 0) return rooms.slice();
  return rooms.filter((r) => r.capacity >= minCapacity);
}

export function filterByEquipment(
  rooms: readonly Room[],
  required: readonly string[]
): Room[] {
  if (required.length === 0) return rooms.slice();
  return rooms.filter((r) =>
    required.every((item) => r.equipment.includes(item))
  );
}

export function excludeBlockedRooms(rooms: readonly Room[]): Room[] {
  return rooms.filter((r) => !r.blocked);
}

export function filterAvailableRooms(
  rooms: readonly Room[],
  minCapacity: number,
  requiredEquipment: readonly string[]
): Room[] {
  return excludeBlockedRooms(
    filterByEquipment(filterByCapacity(rooms, minCapacity), requiredEquipment)
  );
}
