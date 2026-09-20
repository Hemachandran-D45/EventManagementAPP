import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalIcon, MapPin, Clock } from 'lucide-react';
import { Event } from '../types';
import { api } from '../services/api';
import { CurrencyText } from '../components/common/CurrencyText';
import { StatusBadge } from '../components/common/StatusBadge';
import { PaymentBadge } from '../components/common/PaymentBadge';

interface Props {
  onSelectEvent: (id: number) => void;
}

export const CalendarPage: React.FC<Props> = ({ onSelectEvent }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'month' | 'day'>('month');
  const [selectedDay, setSelectedDay] = useState<string>(new Date().toISOString().split('T')[0]);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth(); // 0-indexed

  const monthStr = `${year}-${String(month + 1).padStart(2, '0')}`;

  useEffect(() => {
    setLoading(true);
    api.getEvents(undefined, undefined, monthStr)
      .then(setEvents)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [monthStr]);

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  // Calendar calculations
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayIndex = new Date(year, month, 1).getDay(); // 0 is Sunday

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Group events by date string YYYY-MM-DD
  const eventsByDate = events.reduce((acc, ev) => {
    acc[ev.event_date] = acc[ev.event_date] || [];
    acc[ev.event_date].push(ev);
    return acc;
  }, {} as Record<string, Event[]>);

  const selectedDayEvents = eventsByDate[selectedDay] || [];

  return (
    <div className="space-y-4 pb-20">
      {/* Calendar Top Navigation */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-white tracking-tight">
            {monthNames[month]} {year}
          </h2>
          <p className="text-xs text-slate-400">Identify busy dates & scheduled events</p>
        </div>

        <div className="flex items-center gap-1 bg-slate-800 p-1 rounded-xl border border-slate-700">
          <button onClick={prevMonth} className="p-1.5 text-slate-400 hover:text-white rounded-lg transition">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              const now = new Date();
              setCurrentDate(now);
              setSelectedDay(now.toISOString().split('T')[0]);
            }}
            className="px-2.5 py-1 text-xs font-semibold text-slate-300 hover:text-white"
          >
            Today
          </button>
          <button onClick={nextMonth} className="p-1.5 text-slate-400 hover:text-white rounded-lg transition">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-bold text-slate-400">
        <span>Sun</span><span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span>
      </div>

      {/* Month Grid */}
      <div className="grid grid-cols-7 gap-1 text-xs">
        {/* Empty slots for first week padding */}
        {Array.from({ length: firstDayIndex }).map((_, i) => (
          <div key={`empty-${i}`} className="h-14 sm:h-16 rounded-xl bg-slate-900/30 border border-slate-800/40" />
        ))}

        {/* Days */}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const dayNum = i + 1;
          const dayDateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
          const dayEvents = eventsByDate[dayDateStr] || [];
          const isSelected = selectedDay === dayDateStr;
          const isToday = new Date().toISOString().split('T')[0] === dayDateStr;

          return (
            <div
              key={dayNum}
              onClick={() => setSelectedDay(dayDateStr)}
              className={`h-14 sm:h-16 rounded-xl p-1.5 flex flex-col justify-between border transition cursor-pointer ${
                isSelected
                  ? 'bg-emerald-950/50 border-emerald-500 shadow-md'
                  : dayEvents.length > 0
                  ? 'bg-slate-800/70 border-slate-700/80 hover:border-slate-500'
                  : 'bg-slate-900/40 border-slate-800/60 hover:bg-slate-800/40'
              }`}
            >
              <div className="flex items-center justify-between">
                <span
                  className={`text-[11px] font-bold w-5 h-5 flex items-center justify-center rounded-full ${
                    isToday
                      ? 'bg-emerald-500 text-slate-950 font-black'
                      : isSelected
                      ? 'text-emerald-400'
                      : 'text-slate-300'
                  }`}
                >
                  {dayNum}
                </span>

                {dayEvents.length > 1 && (
                  <span className="text-[10px] font-extrabold text-amber-400 bg-amber-400/15 px-1 rounded">
                    BUSY
                  </span>
                )}
              </div>

              {dayEvents.length > 0 && (
                <div className="flex items-center gap-1 overflow-hidden">
                  <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-[10px] font-bold text-white truncate">
                    {dayEvents.length} event{dayEvents.length > 1 ? 's' : ''}
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Selected Day Agenda */}
      <div className="bg-slate-850 p-4 rounded-2xl border border-slate-700/80 space-y-3">
        <div className="flex items-center justify-between border-b border-slate-750 pb-2">
          <div className="flex items-center gap-2">
            <CalIcon className="w-4 h-4 text-emerald-400" />
            <h3 className="font-bold text-sm text-white">
              Agenda for {selectedDay}
            </h3>
          </div>
          <span className="text-xs text-slate-400 font-semibold">
            {selectedDayEvents.length} booked
          </span>
        </div>

        {selectedDayEvents.length > 0 ? (
          <div className="space-y-2.5">
            {selectedDayEvents.map((ev) => (
              <div
                key={ev.id}
                onClick={() => onSelectEvent(ev.id)}
                className="p-3 bg-slate-800/90 rounded-xl border border-slate-700 hover:border-emerald-500/50 transition cursor-pointer flex items-center justify-between"
              >
                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="font-bold text-white text-xs sm:text-sm">{ev.customer_name}</span>
                    <StatusBadge status={ev.status} />
                  </div>
                  <div className="text-[11px] text-slate-400 flex items-center gap-3">
                    <span>{ev.event_type}</span>
                    <span>•</span>
                    <span>{ev.event_time || '7:00 PM'}</span>
                    <span>•</span>
                    <span className="truncate max-w-[140px]">{ev.venue}</span>
                  </div>
                </div>

                <div className="text-right">
                  <CurrencyText amount={ev.total_amount} className="font-bold text-white text-xs sm:text-sm block" />
                  {ev.balance_due > 0 ? (
                    <span className="text-[11px] text-rose-400 font-medium">
                      Bal: <CurrencyText amount={ev.balance_due} />
                    </span>
                  ) : (
                    <span className="text-[11px] text-emerald-400 font-medium">Paid ✓</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-slate-400 text-center py-4">
            No events scheduled on this date.
          </p>
        )}
      </div>
    </div>
  );
};
