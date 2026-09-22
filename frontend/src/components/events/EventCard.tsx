import React from 'react';
import { Calendar, Clock, MapPin, Phone, ChevronRight } from 'lucide-react';
import { Event } from '../../types';
import { StatusBadge } from '../common/StatusBadge';
import { PaymentBadge } from '../common/PaymentBadge';
import { CurrencyText } from '../common/CurrencyText';

interface Props {
  event: Event;
  onClick: () => void;
}

export const EventCard: React.FC<Props> = ({ event, onClick }) => {
  return (
    <div
      onClick={onClick}
      className="bg-slate-800/60 hover:bg-slate-800/90 border border-slate-700/60 hover:border-blue-500/40 rounded-3xl p-4 sm:p-5 transition-all shadow-md active:scale-[0.99] cursor-pointer space-y-3.5 group"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <span className="inline-block text-[11px] font-bold text-rose-400 bg-rose-500/10 border border-rose-500/25 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
            {event.event_type}
          </span>
          <h3 className="text-base sm:text-lg font-extrabold text-white leading-tight mt-1.5 group-hover:text-blue-300 transition-colors">
            {event.customer_name}
          </h3>
        </div>
        <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
          <StatusBadge status={event.status} />
          <PaymentBadge status={event.payment_status} />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-300">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-slate-900/60 flex items-center justify-center flex-shrink-0">
            <Calendar className="w-3.5 h-3.5 text-blue-400" />
          </div>
          <span className="font-semibold text-white">{event.event_date}</span>
          {event.event_time && (
            <>
              <span className="text-slate-600">•</span>
              <Clock className="w-3 h-3 text-slate-400" />
              <span className="text-slate-300">{event.event_time}</span>
            </>
          )}
        </div>

        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-slate-900/60 flex items-center justify-center flex-shrink-0">
            <MapPin className="w-3.5 h-3.5 text-rose-400" />
          </div>
          <span className="truncate font-medium text-slate-200">{event.venue}{event.location ? `, ${event.location}` : ''}</span>
        </div>

        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-slate-900/60 flex items-center justify-center flex-shrink-0">
            <Phone className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <span className="text-slate-300 font-mono">{event.customer_phone}</span>
        </div>
      </div>

      <div className="pt-3 border-t border-slate-700/60 flex items-center justify-between text-xs sm:text-sm">
        <div>
          <span className="text-slate-400 font-medium">Total: </span>
          <CurrencyText amount={event.total_amount} className="font-black text-white text-sm sm:text-base ml-1" />
        </div>
        <div className="flex items-center gap-2.5">
          {event.balance_due > 0 ? (
            <span className="text-rose-400 font-bold bg-rose-950/40 border border-rose-500/30 px-2 py-0.5 rounded-lg text-xs">
              Bal: <CurrencyText amount={event.balance_due} />
            </span>
          ) : (
            <span className="text-emerald-400 font-bold bg-emerald-950/40 border border-emerald-500/30 px-2 py-0.5 rounded-lg text-xs">Settled ✓</span>
          )}
          <div className="w-6 h-6 rounded-full bg-slate-700/50 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition">
            <ChevronRight className="w-3.5 h-3.5" />
          </div>
        </div>
      </div>
    </div>
  );
};
