import React, { useState, useEffect } from 'react';
import { Search, Phone, Calendar, User, ChevronRight, IndianRupee } from 'lucide-react';
import { Customer } from '../types';
import { api } from '../services/api';
import { CurrencyText } from '../components/common/CurrencyText';

interface Props {
  onSelectEvent: (id: number) => void;
}

export const CustomersPage: React.FC<Props> = ({ onSelectEvent }) => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);

  const loadCustomers = () => {
    setLoading(true);
    api.getCustomers(searchTerm)
      .then(setCustomers)
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    const timer = setTimeout(loadCustomers, 250);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const viewCustomer = async (id: number) => {
    setDetailLoading(true);
    try {
      const data = await api.getCustomerDetail(id);
      setSelectedCustomer(data);
    } catch (err) {
      console.error(err);
    } finally {
      setDetailLoading(false);
    }
  };

  return (
    <div className="space-y-4 pb-20">
      <div>
        <h2 className="text-lg font-bold text-white tracking-tight">Customer Intelligence CRM</h2>
        <p className="text-xs text-slate-400">Search clients, past event bookings & pending balances</p>
      </div>

      <div className="relative">
        <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
        <input
          type="text"
          placeholder="Search by client name or phone number..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
        />
      </div>

      {loading ? (
        <div className="p-8 text-center text-slate-400 text-xs">Loading clients...</div>
      ) : customers.length > 0 ? (
        <div className="space-y-2.5">
          {customers.map((c) => (
            <div
              key={c.id}
              onClick={() => viewCustomer(c.id)}
              className="p-3.5 bg-slate-850 rounded-2xl border border-slate-750 hover:border-emerald-500/40 transition cursor-pointer flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-emerald-400">
                  {c.name.substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm">{c.name}</h3>
                  <div className="flex items-center gap-1.5 text-slate-400 text-xs mt-0.5">
                    <Phone className="w-3 h-3 text-slate-400" />
                    <span>{c.phone}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <ChevronRight className="w-4 h-4 text-slate-500" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-slate-800/40 rounded-2xl p-8 border border-slate-700/60 text-center text-xs text-slate-400">
          No clients found.
        </div>
      )}

      {/* Customer Detail Drawer / Modal */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 p-0 sm:p-4 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-t-2xl sm:rounded-2xl w-full max-w-md p-5 pb-8 sm:pb-6 text-slate-100 shadow-2xl max-h-[85vh] flex flex-col">
            <div className="flex items-start justify-between mb-4 border-b border-slate-800 pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase text-emerald-400 tracking-wider">Client Profile</span>
                <h3 className="font-bold text-lg text-white">{selectedCustomer.name}</h3>
                <p className="text-xs text-slate-400">{selectedCustomer.phone}</p>
              </div>
              <button onClick={() => setSelectedCustomer(null)} className="p-1 text-slate-400 hover:text-white rounded-lg">
                ✕
              </button>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-3 gap-2 bg-slate-800/80 p-3 rounded-xl border border-slate-700 text-center mb-4 text-xs">
              <div>
                <p className="text-slate-400 text-[10px] uppercase font-bold">Events</p>
                <p className="font-bold text-white text-sm">{selectedCustomer.total_events || 0}</p>
              </div>
              <div>
                <p className="text-slate-400 text-[10px] uppercase font-bold">Lifetime Rev</p>
                <CurrencyText amount={selectedCustomer.lifetime_revenue || 0} className="font-bold text-emerald-400 text-sm" />
              </div>
              <div>
                <p className="text-slate-400 text-[10px] uppercase font-bold">Pending</p>
                <CurrencyText
                  amount={selectedCustomer.pending_amount || 0}
                  className={`font-bold text-sm ${(selectedCustomer.pending_amount || 0) > 0 ? 'text-rose-400' : 'text-emerald-400'}`}
                />
              </div>
            </div>

            <h4 className="text-xs font-bold text-slate-300 uppercase mb-2">Booking History</h4>
            <div className="flex-1 overflow-y-auto space-y-2 text-xs">
              {selectedCustomer.events && selectedCustomer.events.length > 0 ? (
                selectedCustomer.events.map((ev) => (
                  <div
                    key={ev.id}
                    onClick={() => {
                      setSelectedCustomer(null);
                      onSelectEvent(ev.id);
                    }}
                    className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/60 hover:border-emerald-500/40 transition cursor-pointer flex items-center justify-between"
                  >
                    <div>
                      <p className="font-bold text-white">{ev.event_type}</p>
                      <p className="text-[11px] text-slate-400">{ev.event_date} • {ev.venue}</p>
                    </div>
                    <div className="text-right">
                      <CurrencyText amount={ev.total_amount} className="font-bold text-white block" />
                      {ev.balance_due > 0 ? (
                        <span className="text-[10px] text-rose-400">Bal: ₹{ev.balance_due}</span>
                      ) : (
                        <span className="text-[10px] text-emerald-400">Settled ✓</span>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-500 italic py-2">No event records found.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
