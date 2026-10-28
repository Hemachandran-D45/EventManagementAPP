import React, { useState, useEffect } from 'react';
import { Filter, Search, Plus, CheckCircle2 } from 'lucide-react';
import { Event, OrderStatus, PaymentStatus } from '../types';
import { api } from '../services/api';
import { EventCard } from '../components/events/EventCard';

interface Props {
  onSelectEvent: (id: number) => void;
  onOpenQuickAdd: () => void;
}

export const EventsPage: React.FC<Props> = ({ onSelectEvent, onOpenQuickAdd }) => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [paymentFilter, setPaymentFilter] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');

  const loadEvents = () => {
    setLoading(true);
    api.getEvents(statusFilter || undefined, paymentFilter || undefined)
      .then(setEvents)
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadEvents();
  }, [statusFilter, paymentFilter]);

  const filtered = events.filter((e) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      e.customer_name.toLowerCase().includes(term) ||
      e.customer_phone.includes(term) ||
      e.event_type.toLowerCase().includes(term) ||
      e.venue.toLowerCase().includes(term)
    );
  });

  const statuses: OrderStatus[] = ['NEW', 'CONFIRMED', 'PREPARING', 'READY', 'COMPLETED', 'CLOSED'];
  const paymentStatuses: PaymentStatus[] = ['UNPAID', 'PARTIAL', 'PAID'];

  return (
    <div className="space-y-4 pb-20">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-white tracking-tight">Event Orders</h2>
          <p className="text-xs text-slate-400">Manage all event commitments & lifecycle</p>
        </div>
        <button
          onClick={onOpenQuickAdd}
          className="flex items-center gap-1 px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold rounded-lg text-xs transition"
        >
          <Plus className="w-3.5 h-3.5 stroke-[3]" /> Add Order
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="space-y-2">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search orders by client, venue, phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>

        {/* Operational Status Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          <button
            onClick={() => setStatusFilter('')}
            className={`px-2.5 py-1 rounded-lg font-semibold whitespace-nowrap transition ${
              !statusFilter ? 'bg-emerald-500 text-slate-950 font-bold' : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            All Statuses
          </button>
          {statuses.map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(statusFilter === s ? '' : s)}
              className={`px-2.5 py-1 rounded-lg font-semibold whitespace-nowrap transition ${
                statusFilter === s ? 'bg-emerald-500 text-slate-950 font-bold' : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        {/* Payment Status Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          <span className="text-[11px] text-slate-500 font-semibold uppercase mr-1">Payment:</span>
          <button
            onClick={() => setPaymentFilter('')}
            className={`px-2 py-0.5 rounded-md font-semibold text-[11px] whitespace-nowrap transition ${
              !paymentFilter ? 'bg-slate-700 text-white' : 'bg-slate-800/60 text-slate-400'
            }`}
          >
            All
          </button>
          {paymentStatuses.map((p) => (
            <button
              key={p}
              onClick={() => setPaymentFilter(paymentFilter === p ? '' : p)}
              className={`px-2 py-0.5 rounded-md font-semibold text-[11px] whitespace-nowrap transition ${
                paymentFilter === p ? 'bg-emerald-600 text-white' : 'bg-slate-800/60 text-slate-400'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Orders List */}
      {loading ? (
        <div className="p-8 text-center text-slate-400 text-xs">Loading orders...</div>
      ) : filtered.length > 0 ? (
        <div className="space-y-3">
          {filtered.map((ev) => (
            <EventCard key={ev.id} event={ev} onClick={() => onSelectEvent(ev.id)} />
          ))}
        </div>
      ) : (
        <div className="bg-slate-800/40 rounded-2xl p-8 border border-slate-700/60 text-center text-xs text-slate-400 space-y-2">
          <p>No orders match the selected filters.</p>
        </div>
      )}
    </div>
  );
};
