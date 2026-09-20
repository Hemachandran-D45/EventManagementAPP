import React, { useState, useEffect } from 'react';
import { X, Search, User, Calendar, Disc, Phone, ChevronRight } from 'lucide-react';
import { api } from '../services/api';
import { Customer, Event, Service } from '../types';
import { CurrencyText } from '../components/common/CurrencyText';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSelectEvent: (id: number) => void;
}

export const SearchPage: React.FC<Props> = ({ isOpen, onClose, onSelectEvent }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<{ customers: Customer[]; events: Event[]; services: Service[] }>({
    customers: [],
    events: [],
    services: []
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!query.trim()) {
      setResults({ customers: [], events: [], services: [] });
      return;
    }

    const timer = setTimeout(() => {
      setLoading(true);
      api.globalSearch(query)
        .then(setResults)
        .catch(console.error)
        .finally(() => setLoading(false));
    }, 200);

    return () => clearTimeout(timer);
  }, [query]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/85 p-0 sm:p-4 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-800 rounded-b-2xl sm:rounded-2xl w-full max-w-lg p-4 text-slate-100 shadow-2xl max-h-[85vh] flex flex-col mt-0 sm:mt-12">
        {/* Search input header */}
        <div className="flex items-center gap-2 border-b border-slate-800 pb-3 mb-3">
          <Search className="w-5 h-5 text-emerald-400" />
          <input
            type="text"
            autoFocus
            placeholder="Search Rajesh, 98765, Wedding, DJ, Trichy..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-transparent text-sm sm:text-base text-white placeholder-slate-500 focus:outline-none"
          />
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Results */}
        <div className="flex-1 overflow-y-auto space-y-4 text-xs sm:text-sm pr-1">
          {loading && <p className="text-center text-slate-400 py-4">Searching database...</p>}

          {/* Events */}
          {results.events.length > 0 && (
            <div>
              <h4 className="font-bold text-[11px] text-emerald-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" /> Events ({results.events.length})
              </h4>
              <div className="space-y-1.5">
                {results.events.map((e) => (
                  <div
                    key={e.id}
                    onClick={() => {
                      onClose();
                      onSelectEvent(e.id);
                    }}
                    className="p-2.5 bg-slate-800/60 rounded-xl border border-slate-700/60 hover:border-emerald-500/40 transition cursor-pointer flex items-center justify-between"
                  >
                    <div>
                      <p className="font-bold text-white">{e.customer_name} - {e.event_type}</p>
                      <p className="text-[11px] text-slate-400">{e.event_date} • {e.venue}</p>
                    </div>
                    <CurrencyText amount={e.total_amount} className="font-bold text-white text-xs" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Customers */}
          {results.customers.length > 0 && (
            <div>
              <h4 className="font-bold text-[11px] text-indigo-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                <User className="w-3.5 h-3.5" /> Customers ({results.customers.length})
              </h4>
              <div className="space-y-1.5">
                {results.customers.map((c) => (
                  <div
                    key={c.id}
                    className="p-2.5 bg-slate-800/60 rounded-xl border border-slate-700/60 flex items-center justify-between"
                  >
                    <div>
                      <p className="font-bold text-white">{c.name}</p>
                      <p className="text-[11px] text-slate-400">{c.phone} {c.address ? `• ${c.address}` : ''}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Services */}
          {results.services.length > 0 && (
            <div>
              <h4 className="font-bold text-[11px] text-amber-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                <Disc className="w-3.5 h-3.5" /> Services ({results.services.length})
              </h4>
              <div className="space-y-1.5">
                {results.services.map((s) => (
                  <div
                    key={s.id}
                    className="p-2.5 bg-slate-800/60 rounded-xl border border-slate-700/60 flex items-center justify-between"
                  >
                    <p className="font-bold text-white">{s.name}</p>
                    <CurrencyText amount={s.default_price} className="font-bold text-emerald-400 text-xs" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {!loading && query && results.events.length === 0 && results.customers.length === 0 && results.services.length === 0 && (
            <p className="text-center text-slate-500 py-6 text-xs">
              No matching orders, customers, or services found.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
