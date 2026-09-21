import React, { useEffect, useState } from 'react';
import {
  Calendar, Clock, AlertTriangle, CheckCircle2, ChevronRight,
  PlusCircle, Sparkles, AlertCircle, ArrowUpRight, ShieldAlert,
  Coins, ClipboardList
} from 'lucide-react';
import { DashboardData, Event } from '../types';
import { api } from '../services/api';
import { CurrencyText } from '../components/common/CurrencyText';
import { StatusBadge } from '../components/common/StatusBadge';
import { PaymentBadge } from '../components/common/PaymentBadge';
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
      <div className="p-6 text-center text-slate-400 space-y-3">
        <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-sm">Loading daily dashboard...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-20">
      {/* Question Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-extrabold text-white tracking-tight">Today's Command Hub</h2>
          <p className="text-xs text-slate-400">"What do I need to know today?"</p>
        </div>
        <div className="flex items-center gap-2">
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
            className="text-xs text-rose-400 hover:text-rose-300 font-semibold bg-rose-950/40 border border-rose-500/30 px-2.5 py-1 rounded-lg transition-colors"
            title="Clear all demo orders & customers"
          >
            Clear Demo Data
          </button>
          <button
            onClick={onOpenServices}
            className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold bg-emerald-950/40 border border-emerald-500/30 px-2.5 py-1 rounded-lg transition-colors"
          >
            Catalog & Rates
          </button>
        </div>
      </div>

      {/* Hero Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {/* Today */}
        <div className="bg-gradient-to-br from-slate-800 to-slate-850 p-3.5 rounded-2xl border border-slate-700/80 shadow">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Today</span>
            <Calendar className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-white">{data.today_events_count}</div>
          <p className="text-[11px] text-emerald-400 font-medium mt-0.5">Events scheduled</p>
        </div>

        {/* Upcoming */}
        <div className="bg-gradient-to-br from-slate-800 to-slate-850 p-3.5 rounded-2xl border border-slate-700/80 shadow">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Upcoming</span>
            <Clock className="w-3.5 h-3.5 text-indigo-400" />
          </div>
          <div className="text-2xl font-black text-white">{data.upcoming_events_count}</div>
          <p className="text-[11px] text-slate-400 font-medium mt-0.5">In pipeline</p>
        </div>

        {/* Pending Payments */}
        <div className="bg-gradient-to-br from-slate-800 to-slate-850 p-3.5 rounded-2xl border border-slate-700/80 shadow">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Pending ₹</span>
            <Coins className="w-3.5 h-3.5 text-rose-400" />
          </div>
          <div className="text-lg sm:text-xl font-black text-rose-400">
            <CurrencyText amount={data.pending_payment_total} />
          </div>
          <p className="text-[11px] text-rose-400/80 font-medium mt-0.5">To collect</p>
        </div>

        {/* Tasks */}
        <div className="bg-gradient-to-br from-slate-800 to-slate-850 p-3.5 rounded-2xl border border-slate-700/80 shadow">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Prep Tasks</span>
            <ClipboardList className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="text-2xl font-black text-amber-400">{data.prep_tasks_count}</div>
          <p className="text-[11px] text-slate-400 font-medium mt-0.5">Items pending</p>
        </div>
      </div>

      {/* Prominent Quick Add Order Banner */}
      <div
        onClick={onOpenQuickAdd}
        className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500 hover:opacity-95 text-slate-950 p-3.5 rounded-2xl flex items-center justify-between shadow-lg shadow-emerald-500/20 cursor-pointer transition active:scale-[0.99]"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-950/20 flex items-center justify-center">
            <PlusCircle className="w-6 h-6 text-slate-950 stroke-[2.5]" />
          </div>
          <div>
            <h3 className="font-extrabold text-sm sm:text-base leading-tight">+ ADD NEW ORDER</h3>
            <p className="text-xs font-semibold text-slate-900/80">Customer call? Enter order in &lt;1 minute</p>
          </div>
        </div>
        <ArrowUpRight className="w-5 h-5 stroke-[3] text-slate-950" />
      </div>

      {/* Operational Risk & Follow-up Alerts */}
      {data.alerts && data.alerts.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <ShieldAlert className="w-4 h-4 text-amber-400" /> Actionable Follow-ups & Reminders ({data.alerts.length})
          </h3>

          <div className="space-y-2">
            {data.alerts.map((a, idx) => (
              <div
                key={idx}
                onClick={() => a.event_id && onSelectEvent(a.event_id)}
                className={`p-3 rounded-xl border text-xs flex items-start gap-2.5 transition cursor-pointer ${
                  a.type === 'warning'
                    ? 'bg-amber-950/20 border-amber-500/40 text-amber-200 hover:bg-amber-950/30'
                    : a.type === 'info'
                    ? 'bg-emerald-950/20 border-emerald-500/40 text-emerald-200 hover:bg-emerald-950/30'
                    : 'bg-blue-950/20 border-blue-500/40 text-blue-200 hover:bg-blue-950/30'
                }`}
              >
                <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h4 className="font-bold">{a.title}</h4>
                  <p className="text-[11px] opacity-90 mt-0.5">{a.message}</p>
                </div>
                {a.event_id && <ChevronRight className="w-4 h-4 opacity-70 flex-shrink-0" />}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Today's Events */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-emerald-400" /> Today's Events
          </h3>
          <span className="text-xs text-slate-400 font-semibold">{data.today_events.length} event(s)</span>
        </div>

        {data.today_events.length > 0 ? (
          <div className="space-y-2.5">
            {data.today_events.map((ev) => (
              <EventCard key={ev.id} event={ev} onClick={() => onSelectEvent(ev.id)} />
            ))}
          </div>
        ) : (
          <div className="bg-slate-800/40 rounded-2xl p-5 border border-slate-700/60 text-center text-xs text-slate-400">
            No events scheduled for today. Check upcoming events below.
          </div>
        )}
      </div>

      {/* Upcoming Events */}
      <div className="space-y-2.5 pt-2">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-indigo-400" /> Upcoming Events ({data.upcoming_events.length})
          </h3>
        </div>

        <div className="space-y-2.5">
          {data.upcoming_events.map((ev) => (
            <EventCard key={ev.id} event={ev} onClick={() => onSelectEvent(ev.id)} />
          ))}
        </div>
      </div>
    </div>
  );
};
