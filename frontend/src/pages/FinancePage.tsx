import React, { useState, useEffect } from 'react';
import { IndianRupee, TrendingUp, TrendingDown, PieChart, CheckCircle2, Calendar } from 'lucide-react';
import { FinanceSummary } from '../types';
import { api } from '../services/api';
import { CurrencyText } from '../components/common/CurrencyText';

export const FinancePage: React.FC = () => {
  const [data, setData] = useState<FinanceSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getFinanceSummary()
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading || !data) {
    return <div className="p-8 text-center text-slate-400 text-xs">Calculating financials...</div>;
  }

  return (
    <div className="space-y-4 pb-20">
      <div>
        <h2 className="text-lg font-bold text-white tracking-tight">Business Finance & Profit</h2>
        <p className="text-xs text-slate-400">Revenue, direct expenses and bottom-line profit</p>
      </div>

      {/* Hero Estimated Gross Profit */}
      <div className="bg-gradient-to-br from-emerald-950/70 to-slate-900 p-4 rounded-2xl border border-emerald-500/40 shadow-xl">
        <div className="flex items-center justify-between text-xs text-emerald-400 font-bold mb-1">
          <span className="uppercase tracking-wider">Estimated Gross Profit</span>
          <TrendingUp className="w-4 h-4" />
        </div>
        <div className="text-3xl font-black text-emerald-400">
          <CurrencyText amount={data.estimated_profit} />
        </div>
        <p className="text-[11px] text-slate-300 mt-1">
          Total Booked Revenue minus Direct Event Expenses
        </p>
      </div>

      {/* Cash Collection Breakdown */}
      <div className="bg-slate-850 p-4 rounded-2xl border border-slate-750 space-y-3 text-xs sm:text-sm">
        <h3 className="font-bold text-white flex items-center gap-1.5">
          <IndianRupee className="w-4 h-4 text-emerald-400" /> Cash Collections (Cash-in)
        </h3>

        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="p-2.5 bg-slate-800/80 rounded-xl border border-slate-700/60">
            <span className="text-[10px] text-slate-400 font-semibold block">Today</span>
            <CurrencyText amount={data.revenue_today} className="font-extrabold text-white text-sm" />
          </div>
          <div className="p-2.5 bg-slate-800/80 rounded-xl border border-slate-700/60">
            <span className="text-[10px] text-slate-400 font-semibold block">This Week</span>
            <CurrencyText amount={data.revenue_week} className="font-extrabold text-white text-sm" />
          </div>
          <div className="p-2.5 bg-slate-800/80 rounded-xl border border-slate-700/60">
            <span className="text-[10px] text-slate-400 font-semibold block">This Month</span>
            <CurrencyText amount={data.revenue_month} className="font-extrabold text-emerald-400 text-sm" />
          </div>
        </div>

        <div className="pt-2 border-t border-slate-750 flex items-center justify-between text-xs">
          <span className="text-slate-400">Total Payments Collected:</span>
          <CurrencyText amount={data.total_collected} className="font-bold text-white text-sm" />
        </div>
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-400">Total Pending Balances:</span>
          <CurrencyText amount={data.total_pending} className="font-bold text-rose-400 text-sm" />
        </div>
      </div>

      {/* Expenses by Category */}
      <div className="bg-slate-850 p-4 rounded-2xl border border-slate-750 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-white text-xs sm:text-sm flex items-center gap-1.5">
            <PieChart className="w-4 h-4 text-rose-400" /> Direct Expenses Breakdown
          </h3>
          <CurrencyText amount={data.total_expenses} className="font-extrabold text-rose-400 text-sm" />
        </div>

        {data.expenses_by_category && data.expenses_by_category.length > 0 ? (
          <div className="space-y-2 text-xs">
            {data.expenses_by_category.map((cat) => {
              const pct = data.total_expenses > 0 ? (cat.amount / data.total_expenses) * 100 : 0;
              return (
                <div key={cat.category} className="space-y-1">
                  <div className="flex items-center justify-between text-slate-300">
                    <span className="font-semibold">{cat.category}</span>
                    <div className="flex items-center gap-2">
                      <CurrencyText amount={cat.amount} className="font-bold text-white" />
                      <span className="text-[10px] text-slate-400">({pct.toFixed(0)}%)</span>
                    </div>
                  </div>
                  <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-rose-500 rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-xs text-slate-500 italic">No expenses logged yet.</p>
        )}
      </div>
    </div>
  );
};
