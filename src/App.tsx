import { useMemo, useState } from 'react';
import {
  CheckCircle2,
  XCircle,
  Clock,
  DoorClosed,
  Users,
  MapPin,
  CalendarCheck,
} from 'lucide-react';
import { bookings as seedBookings, rooms, Room } from '@/data/campus';
import { checkAvailability } from '@/lib/availability';
import {
  minutesToTime,
  nowHHMM,
  timeToMinutes,
} from '@/lib/time';

const MAX_DURATION = 120;
const MAX_MINUTES = 1440;

export default function App() {
  const [bookings] = useState(seedBookings);
  const [roomCode, setRoomCode] = useState<string>('');
  const [startStr, setStartStr] = useState('');
  const [endStr, setEndStr] = useState('');
  const [currentTimeStr, setCurrentTimeStr] = useState(nowHHMM());
  const [verdict, setVerdict] = useState<ReturnType<
    typeof checkAvailability
  > | null>(null);

  const selectedRoom: Room | null = useMemo(
    () => rooms.find((r) => r.code === roomCode) ?? null,
    [roomCode]
  );

  const roomBookings = useMemo(
    () =>
      bookings
        .filter((b) => b.roomCode === roomCode)
        .sort((a, b) => a.start - b.start),
    [bookings, roomCode]
  );

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const start = timeToMinutes(startStr);
    const end = timeToMinutes(endStr);
    const current = timeToMinutes(currentTimeStr);

    if (start === null || end === null) {
      setVerdict({
        status: 'unavailable',
        reason: 'Enter start and end times as HH:MM (00:00–23:59).',
      });
      return;
    }
    if (current === null) {
      setVerdict({
        status: 'unavailable',
        reason: 'Enter the current time as HH:MM.',
      });
      return;
    }

    setVerdict(checkAvailability(selectedRoom, start, end, current, bookings));
  }

  function reset() {
    setRoomCode('');
    setStartStr('');
    setEndStr('');
    setCurrentTimeStr(nowHHMM());
    setVerdict(null);
  }

  const durationLabel =
    startStr && endStr
      ? (() => {
          const s = timeToMinutes(startStr);
          const e = timeToMinutes(endStr);
          if (s === null || e === null) return null;
          return e - s;
        })()
      : null;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto max-w-3xl px-4 py-8 sm:py-12">
        <header className="mb-8">
          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-xl bg-blue-600 text-white shadow-sm">
              <CalendarCheck size={22} />
            </div>
            <div>
              <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">
                Smart Campus Room Availability
              </h1>
              <p className="text-sm text-slate-500">
                Check whether a room is free for your proposed time slot.
              </p>
            </div>
          </div>
        </header>

        <div className="grid gap-6 lg:grid-cols-5">
          {/* Form */}
          <section className="lg:col-span-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <h2 className="mb-4 text-base font-semibold">Check a room</h2>
            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Room
                </label>
                <select
                  value={roomCode}
                  onChange={(e) => setRoomCode(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                >
                  <option value="">Select a room…</option>
                  {rooms.map((r) => (
                    <option key={r.code} value={r.code}>
                      {r.code} — {r.name}
                      {r.blocked ? ' (blocked)' : ''}
                    </option>
                  ))}
                </select>
                {selectedRoom && (
                  <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
                    <span className="inline-flex items-center gap-1">
                      <MapPin size={12} /> {selectedRoom.building}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Users size={12} /> {selectedRoom.capacity} seats
                    </span>
                    {selectedRoom.blocked && (
                      <span className="inline-flex items-center gap-1 text-amber-600">
                        <DoorClosed size={12} />{' '}
                        {selectedRoom.blockedReason}
                      </span>
                    )}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">
                    Current time
                  </label>
                  <input
                    type="time"
                    value={currentTimeStr}
                    onChange={(e) => setCurrentTimeStr(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>
                <div className="col-span-2 grid grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-slate-700">
                      Start
                    </label>
                    <input
                      type="time"
                      value={startStr}
                      onChange={(e) => setStartStr(e.target.value)}
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-slate-700">
                      End
                    </label>
                    <input
                      type="time"
                      value={endStr}
                      onChange={(e) => setEndStr(e.target.value)}
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                  </div>
                </div>
              </div>

              {durationLabel !== null && (
                <p
                  className={`text-xs ${
                    durationLabel < 0
                      ? 'text-rose-600'
                      : durationLabel > MAX_DURATION
                      ? 'text-rose-600'
                      : 'text-slate-500'
                  }`}
                >
                  Duration:{' '}
                  {durationLabel < 0
                    ? 'end before start'
                    : `${durationLabel} min${
                        durationLabel > MAX_DURATION ? ' (exceeds 120)' : ''
                      }`}
                </p>
              )}

              <div className="flex flex-wrap gap-2 pt-1">
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-blue-700 active:scale-[0.99]"
                >
                  <Clock size={16} /> Check availability
                </button>
                <button
                  type="button"
                  onClick={reset}
                  className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                >
                  Reset
                </button>
              </div>
            </form>
          </section>

          {/* Verdict */}
          <section className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <h2 className="mb-4 text-base font-semibold">Result</h2>
            {!verdict && (
              <p className="text-sm text-slate-400">
                Fill in the form and check availability to see a decision here.
              </p>
            )}
            {verdict && (
              <div
                className={`rounded-xl p-4 transition ${
                  verdict.status === 'available'
                    ? 'bg-emerald-50 border border-emerald-200'
                    : 'bg-rose-50 border border-rose-200'
                }`}
              >
                <div className="flex items-start gap-3">
                  {verdict.status === 'available' ? (
                    <CheckCircle2
                      size={22}
                      className="mt-0.5 shrink-0 text-emerald-600"
                    />
                  ) : (
                    <XCircle
                      size={22}
                      className="mt-0.5 shrink-0 text-rose-600"
                    />
                  )}
                  <div className="min-w-0">
                    <p
                      className={`text-sm font-semibold ${
                        verdict.status === 'available'
                          ? 'text-emerald-700'
                          : 'text-rose-700'
                      }`}
                    >
                      {verdict.status === 'available'
                        ? 'Available'
                        : 'Unavailable'}
                    </p>
                    {verdict.status === 'available' ? (
                      <p className="mt-0.5 text-sm text-emerald-700/90">
                        {verdict.room.code} is free from{' '}
                        {minutesToTime(verdict.start)} to{' '}
                        {minutesToTime(verdict.end)}.
                      </p>
                    ) : (
                      <p className="mt-0.5 text-sm text-rose-700/90">
                        {verdict.reason}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}
            <p className="mt-3 text-xs text-slate-400">
              Checking does not create or modify any booking.
            </p>
          </section>
        </div>

        {/* Existing bookings for selected room */}
        <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <h2 className="mb-3 text-base font-semibold">
            Existing bookings
            {selectedRoom ? ` · ${selectedRoom.code}` : ''}
          </h2>
          {roomBookings.length === 0 ? (
            <p className="text-sm text-slate-400">
              {selectedRoom
                ? 'No existing bookings for this room.'
                : 'Select a room to view its bookings.'}
            </p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {roomBookings.map((b) => (
                <li
                  key={b.id}
                  className="flex flex-wrap items-center justify-between gap-2 py-2.5 text-sm"
                >
                  <span className="font-medium text-slate-800">
                    {minutesToTime(b.start)} – {minutesToTime(b.end)}
                  </span>
                  <span className="text-slate-500">
                    {b.bookedBy} · {b.purpose}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <footer className="mt-6 text-center text-xs text-slate-400">
          Sample data only · Times use a 24-hour clock (00:00–{minutesToTime(MAX_MINUTES)} = 24:00 boundary)
        </footer>
      </div>
    </div>
  );
}
