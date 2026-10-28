import React, { useEffect, useState } from 'react';
import {
  Calendar, Clock, AlertTriangle, ChevronRight,
  PlusCircle, ShieldAlert,
  Coins, ClipboardList
} from 'lucide-react';
import { DashboardData } from '../types';
import { api } from '../services/api';
import { CurrencyText } from '../components/common/CurrencyText';
import { EventCard } from '../components/events/EventCard';

interface Props {
  onOpenQuickAdd: () => void;
  onSelectEvent: (id: number) => void;
  onOpenServices: () => void;
}

export const DashboardPage: React.FC<Props> = ({ onOpenQuickAdd, onSelectEvent, onOpenServices }) => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  const loadDashboard = () => {
    setLoading(true);
    api.getDashboard()
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  if (loading || !data) {
    return (
      <div className="py-20 text-center text-slate-400 space-y-4">
        <div className="w-10 h-10 border-3 border-blue-500 border-t-rose-500 rounded-full animate-spin mx-auto" />
        <p className="text-sm font-medium text-slate-300">Loading DD Events Command Hub...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-24">
      {/* Question Header with Breathing Room */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-800/40 p-4 sm:p-5 rounded-3xl border border-slate-800">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">Today's Command Hub</h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">Real-time schedule, crew assignments & payment tracking</p>
        </div>
        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <button
            onClick={async () => {
              if (window.confirm("Do you want to clear all demo/dummy orders and start 100% fresh?")) {
                try {
                  await api.clearDemoData();
                  loadDashboard();
                  alert("Demo data cleared successfully! Clean slate ready.");
                } catch (e) {
                  alert("Failed to clear demo data.");
                }
              }
            }}
            className="text-xs text-rose-400 hover:text-rose-300 font-bold bg-rose-950/40 hover:bg-rose-950/60 border border-rose-500/30 px-3 py-2 rounded-xl transition-all shadow-sm"
            title="Clear all demo orders & customers"
          >
            Clear Demo Data
          </button>
          <button
            onClick={onOpenServices}
            className="text-xs text-blue-400 hover:text-blue-300 font-bold bg-blue-950/40 hover:bg-blue-950/60 border border-blue-500/30 px-3 py-2 rounded-xl transition-all shadow-sm"
          >
            Catalog & Rates
          </button>
        </div>
      </div>

      {/* Hero Metric Cards - Spacious & Comfortable */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
        {/* Today */}
        <div className="bg-gradient-to-br from-slate-800/90 to-slate-850 p-4 sm:p-5 rounded-3xl border border-blue-500/20 shadow-lg shadow-blue-950/20 transition hover:border-blue-500/40">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-300">Today</span>
            <div className="w-8 h-8 rounded-xl bg-blue-500/15 flex items-center justify-center">
              <Calendar className="w-4 h-4 text-blue-400" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white">{data.today_events_count}</div>
          <p className="text-xs text-blue-400/90 font-semibold mt-1">Events scheduled</p>
        </div>

        {/* Upcoming */}
        <div className="bg-gradient-to-br from-slate-800/90 to-slate-850 p-4 sm:p-5 rounded-3xl border border-indigo-500/20 shadow-lg shadow-indigo-950/20 transition hover:border-indigo-500/40">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-300">Upcoming</span>
            <div className="w-8 h-8 rounded-xl bg-indigo-500/15 flex items-center justify-center">
              <Clock className="w-4 h-4 text-indigo-400" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white">{data.upcoming_events_count}</div>
          <p className="text-xs text-indigo-400/90 font-semibold mt-1">In pipeline</p>
        </div>

        {/* Pending Payments */}
        <div className="bg-gradient-to-br from-slate-800/90 to-slate-850 p-4 sm:p-5 rounded-3xl border border-rose-500/20 shadow-lg shadow-rose-950/20 transition hover:border-rose-500/40">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-rose-300">Pending ₹</span>
            <div className="w-8 h-8 rounded-xl bg-rose-500/15 flex items-center justify-center">
              <Coins className="w-4 h-4 text-rose-400" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-rose-400">
            <CurrencyText amount={data.pending_payment_total} />
          </div>
          <p className="text-xs text-rose-400/90 font-semibold mt-1">To collect</p>
        </div>

        {/* Tasks */}
        <div className="bg-gradient-to-br from-slate-800/90 to-slate-850 p-4 sm:p-5 rounded-3xl border border-amber-500/20 shadow-lg shadow-amber-950/20 transition hover:border-amber-500/40">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-300">Prep Tasks</span>
            <div className="w-8 h-8 rounded-xl bg-amber-500/15 flex items-center justify-center">
              <ClipboardList className="w-4 h-4 text-amber-400" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-amber-400">{data.prep_tasks_count}</div>
          <p className="text-xs text-amber-400/90 font-semibold mt-1">Items pending</p>
        </div>
      </div>

      {/* Prominent Quick Add Order Banner - DD Events Signature Gradient */}
      <div
        onClick={onOpenQuickAdd}
        className="bg-gradient-to-r from-blue-600 via-indigo-600 to-rose-600 hover:from-blue-500 hover:to-rose-500 text-white p-4 sm:p-5 rounded-3xl flex items-center justify-between shadow-xl shadow-blue-900/30 cursor-pointer transition-all active:scale-[0.99] border border-white/20"
      >
        <div className="flex items-center gap-3.5 sm:gap-4">
          <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center shadow-inner flex-shrink-0">
            <PlusCircle className="w-7 h-7 text-white stroke-[2.5]" />
          </div>
          <div>
            <h3 className="font-black text-base sm:text-lg leading-tight tracking-tight">+ CREATE NEW EVENT ORDER</h3>
            <p className="text-xs sm:text-sm font-medium text-white/85 mt-0.5">Quick booking entry with services, discount & advance</p>
          </div>
        </div>
        <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
          <ChevronRight className="w-5 h-5 stroke-[3] text-white" />
        </div>
      </div>

      {/* Operational Risk & Follow-up Alerts */}
      {data.alerts && data.alerts.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-xs sm:text-sm font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-amber-400" /> Actionable Follow-ups & Reminders ({data.alerts.length})
          </h3>

          <div className="space-y-2.5">
            {data.alerts.map((a, idx) => (
              <div
                key={idx}
                onClick={() => a.event_id && onSelectEvent(a.event_id)}
                className={`p-3.5 sm:p-4 rounded-2xl border text-xs sm:text-sm flex items-start gap-3 transition cursor-pointer ${
                  a.type === 'warning'
                    ? 'bg-amber-950/25 border-amber-500/40 text-amber-200 hover:bg-amber-950/40'
                    : a.type === 'info'
                    ? 'bg-blue-950/25 border-blue-500/40 text-blue-200 hover:bg-blue-950/40'
                    : 'bg-rose-950/25 border-rose-500/40 text-rose-200 hover:bg-rose-950/40'
                }`}
              >
                <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h4 className="font-bold">{a.title}</h4>
                  <p className="text-xs opacity-90 mt-0.5">{a.message}</p>
                </div>
                {a.event_id && <ChevronRight className="w-5 h-5 opacity-70 flex-shrink-0" />}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Today's Events */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-400" /> Today's Events
          </h3>
          <span className="text-xs text-slate-400 font-semibold bg-slate-800 px-2.5 py-1 rounded-full border border-slate-700">{data.today_events.length} event(s)</span>
        </div>

        {data.today_events.length > 0 ? (
          <div className="space-y-3">
            {data.today_events.map((ev) => (
              <EventCard key={ev.id} event={ev} onClick={() => onSelectEvent(ev.id)} />
            ))}
          </div>
        ) : (
          <div className="bg-slate-800/40 rounded-3xl p-6 sm:p-8 border border-slate-800 text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-slate-800/80 mx-auto flex items-center justify-center text-slate-500">
              <Calendar className="w-6 h-6" />
            </div>
            <p className="text-sm font-semibold text-slate-300">No events scheduled for today</p>
            <p className="text-xs text-slate-500">Check upcoming pipeline events below or tap "+ Create New Event Order"</p>
          </div>
        )}
      </div>

      {/* Upcoming Events */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Clock className="w-5 h-5 text-indigo-400" /> Upcoming Events ({data.upcoming_events.length})
          </h3>
        </div>

        {data.upcoming_events.length > 0 ? (
          <div className="space-y-3">
            {data.upcoming_events.map((ev) => (
              <EventCard key={ev.id} event={ev} onClick={() => onSelectEvent(ev.id)} />
            ))}
          </div>
        ) : (
          <div className="bg-slate-800/40 rounded-3xl p-6 sm:p-8 border border-slate-800 text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-slate-800/80 mx-auto flex items-center justify-center text-slate-500">
              <Clock className="w-6 h-6" />
            </div>
            <p className="text-sm font-semibold text-slate-300">No upcoming events in the pipeline</p>
            <p className="text-xs text-slate-500">Add client orders to track dates, services, and payments</p>
          </div>
        )}
      </div>
    </div>
  );
};
