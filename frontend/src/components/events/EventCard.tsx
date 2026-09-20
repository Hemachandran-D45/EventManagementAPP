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
      className="bg-slate-800/80 hover:bg-slate-800 border border-slate-700/70 hover:border-emerald-500/40 rounded-2xl p-4 transition shadow-md active:scale-[0.99] cursor-pointer"
    >
      <div className="flex items-start justify-between gap-2 mb-2.5">
        <div>
          <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">
            {event.event_type}
          </span>
          <h3 className="text-base font-bold text-white leading-tight mt-0.5">
            {event.customer_name}
          </h3>
        </div>
        <div className="flex flex-col items-end gap-1.5">
          <StatusBadge status={event.status} />
          <PaymentBadge status={event.payment_status} />
        </div>
      </div>

      <div className="space-y-1.5 text-xs text-slate-300 mb-3">
        <div className="flex items-center gap-2">
          <Calendar className="w-3.5 h-3.5 text-slate-400" />
          <span className="font-medium text-slate-200">{event.event_date}</span>
          {event.event_time && (
            <>
              <span className="text-slate-500">•</span>
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>{event.event_time}</span>
            </>
          )}
        </div>
        <div className="flex items-center gap-2">
          <MapPin className="w-3.5 h-3.5 text-slate-400" />
          <span className="truncate">{event.venue}{event.location ? `, ${event.location}` : ''}</span>
        </div>
        <div className="flex items-center gap-2">
          <Phone className="w-3.5 h-3.5 text-slate-400" />
          <span>{event.customer_phone}</span>
        </div>
      </div>

      <div className="pt-2.5 border-t border-slate-700/60 flex items-center justify-between text-xs">
        <div>
          <span className="text-slate-400">Total: </span>
          <CurrencyText amount={event.total_amount} className="font-bold text-white text-sm" />
        </div>
        <div className="flex items-center gap-2">
          {event.balance_due > 0 ? (
            <span className="text-rose-400 font-semibold">
              Bal: <CurrencyText amount={event.balance_due} />
            </span>
          ) : (
            <span className="text-emerald-400 font-medium">Settled ✓</span>
          )}
          <ChevronRight className="w-4 h-4 text-slate-500" />
        </div>
      </div>
    </div>
  );
};
