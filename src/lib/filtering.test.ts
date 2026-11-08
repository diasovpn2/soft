import { describe, it, expect } from 'vitest';
import {
  filterByCapacity,
  filterByEquipment,
  excludeBlockedRooms,
  filterAvailableRooms,
} from './filtering';
import { Room } from '@/data/campus';

const testRooms: Room[] = [
  {
    code: 'T-1',
    name: 'Test Room 1',
    building: 'Building A',
    capacity: 50,
    equipment: ['projector', 'whiteboard'],
    blocked: false,
  },
  {
    code: 'T-2',
    name: 'Test Room 2',
    building: 'Building B',
    capacity: 25,
    equipment: ['projector'],
    blocked: false,
  },
  {
    code: 'T-3',
    name: 'Test Room 3',
    building: 'Building C',
    capacity: 10,
    equipment: ['whiteboard'],
    blocked: true,
    blockedReason: 'Maintenance',
  },
  {
    code: 'T-4',
    name: 'Test Room 4',
    building: 'Building D',
    capacity: 100,
    equipment: ['projector', 'whiteboard', 'audio-system'],
    blocked: false,
  },
];

// ─── F1: capacity filtering ───

describe('filterByCapacity — F1', () => {
  it('F1 — includes rooms whose capacity is greater than or equal to requested attendees', () => {
    const result = filterByCapacity(testRooms, 25);
    const codes = result.map((r) => r.code);
    expect(codes).toContain('T-1'); // capacity 50 >= 25
    expect(codes).toContain('T-2'); // capacity 25 >= 25 (exact match)
    expect(codes).toContain('T-4'); // capacity 100 >= 25
  });

  it('F1 — excludes rooms whose capacity is less than requested attendees', () => {
    const result = filterByCapacity(testRooms, 26);
    const codes = result.map((r) => r.code);
    expect(codes).not.toContain('T-2'); // capacity 25 < 26
    expect(codes).not.toContain('T-3'); // capacity 10 < 26
  });

  // Boundary: exact capacity match is included
  it('F1 boundary — exact capacity match is included (capacity == requested)', () => {
    const result = filterByCapacity(testRooms, 50);
    const codes = result.map((r) => r.code);
    expect(codes).toContain('T-1'); // capacity 50 == 50
  });

  // Boundary: capacity one below requested is excluded
  it('F1 boundary — capacity one below requested is excluded', () => {
    const result = filterByCapacity(testRooms, 51);
    const codes = result.map((r) => r.code);
    expect(codes).not.toContain('T-1'); // capacity 50 < 51
  });

  it('F1 — returns all rooms when minCapacity is 0 or negative', () => {
    expect(filterByCapacity(testRooms, 0)).toHaveLength(testRooms.length);
    expect(filterByCapacity(testRooms, -5)).toHaveLength(testRooms.length);
  });

  it('F1 — does not mutate the input array', () => {
    const snapshot = testRooms.map((r) => ({ ...r }));
    filterByCapacity(testRooms, 30);
    expect(testRooms).toEqual(snapshot);
  });
});

// ─── F2: equipment filtering ───

describe('filterByEquipment — F2', () => {
  it('F2 — includes rooms that contain ALL selected equipment items', () => {
    const result = filterByEquipment(testRooms, ['projector', 'whiteboard']);
    const codes = result.map((r) => r.code);
    expect(codes).toContain('T-1'); // has projector + whiteboard
    expect(codes).toContain('T-4'); // has projector + whiteboard + audio-system
    expect(codes).not.toContain('T-2'); // has projector only, no whiteboard
  });

  it('F2 — excludes rooms missing any required equipment item', () => {
    const result = filterByEquipment(testRooms, ['audio-system']);
    const codes = result.map((r) => r.code);
    expect(codes).toEqual(['T-4']); // only T-4 has audio-system
  });

  // Boundary: empty equipment selection returns all rooms
  it('F2 boundary — empty equipment selection returns all rooms (no filter applied)', () => {
    const result = filterByEquipment(testRooms, []);
    expect(result).toHaveLength(testRooms.length);
  });

  // Boundary: multiple equipment requirements
  it('F2 boundary — multiple equipment requirements: room must have ALL', () => {
    const result = filterByEquipment(testRooms, [
      'projector',
      'whiteboard',
      'audio-system',
    ]);
    const codes = result.map((r) => r.code);
    expect(codes).toEqual(['T-4']); // only T-4 has all three
  });

  it('F2 — does not mutate the input array', () => {
    const snapshot = testRooms.map((r) => ({ ...r }));
    filterByEquipment(testRooms, ['projector']);
    expect(testRooms).toEqual(snapshot);
  });
});

// ─── F3: blocked rooms excluded ───

describe('excludeBlockedRooms — F3', () => {
  it('F3 — excludes blocked rooms from results', () => {
    const result = excludeBlockedRooms(testRooms);
    const codes = result.map((r) => r.code);
    expect(codes).not.toContain('T-3'); // blocked
    expect(codes).toContain('T-1');
    expect(codes).toContain('T-2');
    expect(codes).toContain('T-4');
  });

  it('F3 — does not mutate the input array', () => {
    const snapshot = testRooms.map((r) => ({ ...r }));
    excludeBlockedRooms(testRooms);
    expect(testRooms).toEqual(snapshot);
  });
});

// ─── F4: empty state when no rooms match ───

describe('filterAvailableRooms — F4', () => {
  it('F4 — returns empty array when no rooms match capacity and equipment filters', () => {
    // Request capacity 200 — no room has that capacity
    const result = filterAvailableRooms(testRooms, 200, []);
    expect(result).toEqual([]);
  });

  it('F4 — returns empty array when equipment requirement matches no unblocked room', () => {
    // T-3 has whiteboard but is blocked; T-1 and T-4 have whiteboard but
    // requesting 'audio-system' + 'pcs' matches no unblocked room
    const result = filterAvailableRooms(testRooms, 0, ['audio-system', 'pcs']);
    expect(result).toEqual([]);
  });

  it('F4 — returns empty array when capacity excludes all unblocked rooms', () => {
    // T-4 has capacity 100 (highest unblocked); requesting 101 excludes all
    const result = filterAvailableRooms(testRooms, 101, []);
    expect(result).toEqual([]);
  });
});

// ─── filterAvailableRooms composition ───

describe('filterAvailableRooms — composition', () => {
  it('combines capacity, equipment, and blocked filters correctly', () => {
    const result = filterAvailableRooms(testRooms, 30, ['projector']);
    const codes = result.map((r) => r.code);
    // T-1: capacity 50 >= 30, has projector, not blocked → included
    // T-2: capacity 25 < 30 → excluded
    // T-3: blocked → excluded
    // T-4: capacity 100 >= 30, has projector, not blocked → included
    expect(codes).toEqual(['T-1', 'T-4']);
  });

  it('does not mutate the input array', () => {
    const snapshot = testRooms.map((r) => ({ ...r }));
    filterAvailableRooms(testRooms, 30, ['projector']);
    expect(testRooms).toEqual(snapshot);
  });
});
