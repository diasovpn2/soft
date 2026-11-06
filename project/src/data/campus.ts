export interface Booking {
  id: string;
  roomCode: string;
  start: number; // minutes since midnight
  end: number;
  bookedBy: string;
  purpose: string;
}

export interface Room {
  code: string;
  name: string;
  building: string;
  capacity: number;
  blocked: boolean;
  blockedReason?: string;
}

export const rooms: Room[] = [
  {
    code: 'A-101',
    name: 'Lecture Hall Alpha',
    building: 'Engineering Block',
    capacity: 120,
    blocked: false,
  },
  {
    code: 'B-204',
    name: 'Seminar Room Beta',
    building: 'Science Wing',
    capacity: 30,
    blocked: false,
  },
  {
    code: 'C-310',
    name: 'Computer Lab Gamma',
    building: 'IT Tower',
    capacity: 40,
    blocked: true,
    blockedReason: 'Under maintenance until 18:00',
  },
  {
    code: 'D-105',
    name: 'Discussion Room Delta',
    building: 'Library Annex',
    capacity: 12,
    blocked: false,
  },
];

export const bookings: Booking[] = [
  {
    id: 'b1',
    roomCode: 'A-101',
    start: 9 * 60,
    end: 10 * 60 + 30,
    bookedBy: 'Prof. Mendez',
    purpose: 'Calculus II',
  },
  {
    id: 'b2',
    roomCode: 'A-101',
    start: 13 * 60,
    end: 14 * 60,
    bookedBy: 'Dr. Okafor',
    purpose: 'Faculty Review',
  },
  {
    id: 'b3',
    roomCode: 'B-204',
    start: 11 * 60,
    end: 12 * 60,
    bookedBy: 'CS Society',
    purpose: 'Workshop',
  },
  {
    id: 'b4',
    roomCode: 'D-105',
    start: 15 * 60,
    end: 16 * 60,
    bookedBy: 'Study Group 7',
    purpose: 'Capstone Prep',
  },
];
