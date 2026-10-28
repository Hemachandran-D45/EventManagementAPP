import React, { useState } from 'react';
import { X, Check, Handshake, ShieldCheck, AlertCircle } from 'lucide-react';
import { Event, PaymentMethod } from '../../types';
import { CurrencyText } from '../common/CurrencyText';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  event: Event;
  onSettle: (finalPaymentAmount: number, paymentMethod: PaymentMethod, notes: string, waiveBalance: boolean) => Promise<void>;
}

export const FinalSettleModal: React.FC<Props> = ({ isOpen, onClose, event, onSettle }) => {
  const [finalPaymentAmount, setFinalPaymentAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('CASH');
  const [notes, setNotes] = useState<string>('Deal settled and closed with final payment.');
  const [waiveBalance, setWaiveBalance] = useState<boolean>(true);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const initialAgreed = event.discussed_total || event.total_amount;
  const alreadyPaid = event.advance_paid;
  const unpaidBefore = event.balance_due;
  const newTotalCollected = alreadyPaid + (Number(finalPaymentAmount) || 0);
  const closingDiscountWaived = waiveBalance ? Math.max(0, initialAgreed - newTotalCollected) : 0;
  const finalBalance = waiveBalance ? 0 : Math.max(0, initialAgreed - newTotalCollected);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSettle(Number(finalPaymentAmount) || 0, paymentMethod, notes.trim(), waiveBalance);
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const methods: PaymentMethod[] = ['CASH', 'UPI', 'BANK_TRANSFER', 'OTHER'];

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/85 p-0 sm:p-4 backdrop-blur-md">
      <div className="bg-slate-900 border border-slate-700/80 rounded-t-3xl sm:rounded-3xl w-full max-w-lg p-5 sm:p-6 text-slate-100 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-teal-500/20 flex items-center justify-center text-teal-400">
              <Handshake className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base sm:text-lg text-white">Final Settlement & Deal Closure</h3>
              <p className="text-[11px] text-slate-400">Close payment deal with whatever final amount was given</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 pt-3 text-xs sm:text-sm">
          {/* Situation Context */}
          <div className="bg-slate-800/60 p-3 rounded-2xl border border-slate-700/60 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Initial Agreed / Discussed Amount:</span>
              <CurrencyText amount={initialAgreed} className="font-bold text-white" />
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Payments Collected So Far:</span>
              <CurrencyText amount={alreadyPaid} className="font-bold text-emerald-400" />
            </div>
            <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-700/60">
              <span className="text-slate-300 font-semibold">Current Unpaid Balance:</span>
              <CurrencyText amount={unpaidBefore} className="font-extrabold text-rose-400" />
            </div>
          </div>

          {/* Additional Handed Payment */}
          <div>
            <label className="block text-xs font-bold text-slate-200 mb-1.5">
              Final Payment Given Now (₹)
            </label>
            <div className="relative">
              <input
                type="number"
                min="0"
                step="100"
                value={finalPaymentAmount}
                onChange={(e) => setFinalPaymentAmount(Math.max(0, Number(e.target.value)))}
                placeholder="0 if client gave nothing additional"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white font-extrabold text-base focus:outline-none focus:border-teal-400"
              />
              <button
                type="button"
                onClick={() => setFinalPaymentAmount(unpaidBefore)}
                className="absolute right-2 top-2 px-2 py-1 bg-slate-700 hover:bg-slate-600 rounded-lg text-[10px] text-slate-200 font-bold"
              >
                Full ₹{unpaidBefore.toLocaleString()}
              </button>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              If client negotiated or says "take ₹10,000 and close it", enter 10000. If settling at what was already collected, enter 0.
            </p>
          </div>

          {/* Payment Method */}
          {finalPaymentAmount > 0 && (
            <div>
              <label className="block text-xs font-bold text-slate-200 mb-1.5">
                Closing Payment Method
              </label>
              <div className="grid grid-cols-4 gap-2">
                {methods.map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setPaymentMethod(m)}
                    className={`py-2 rounded-xl text-xs font-bold transition border ${
                      paymentMethod === m
                        ? 'bg-teal-500 text-slate-950 border-teal-400 font-extrabold shadow-md'
                        : 'bg-slate-800 text-slate-300 border-slate-700 hover:text-white'
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Waive Remaining Balance Checkbox */}
          <div className="bg-teal-950/20 border border-teal-500/40 p-3 rounded-2xl space-y-1.5">
            <label className="flex items-start gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={waiveBalance}
                onChange={(e) => setWaiveBalance(e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded text-teal-500 focus:ring-teal-400 border-slate-700 bg-slate-900"
              />
              <div>
                <span className="text-xs font-extrabold text-teal-300 block">
                  Waive Remaining Balance Difference & Mark Deal Settled
                </span>
                <span className="text-[11px] text-slate-300 block">
                  Automatically balances the bill with a Settlement Waiver so balance becomes ₹0.00.
                </span>
              </div>
            </label>
          </div>

          {/* Live Outcome Summary */}
          <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 space-y-1.5">
            <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider block">
              Deal Settlement Outcome
            </span>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-300">Total Collections (Advance + Final):</span>
              <CurrencyText amount={newTotalCollected} className="font-black text-emerald-400 text-sm" />
            </div>
            {closingDiscountWaived > 0 && (
              <div className="flex items-center justify-between text-xs">
                <span className="text-amber-300">Negotiation Waived / Settlement Discount:</span>
                <span className="font-bold text-amber-300">-₹{closingDiscountWaived.toLocaleString()}</span>
              </div>
            )}
            <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-800">
              <span className="text-white font-extrabold">Final Remaining Balance:</span>
              <span className={`font-black text-sm ${finalBalance === 0 ? 'text-teal-400' : 'text-rose-400'}`}>
                {finalBalance === 0 ? '₹0.00 (Fully Closed & Settled ✓)' : `₹${finalBalance.toLocaleString()} Due`}
              </span>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">
              Settlement Notes / Remarks
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Settled at hall after reception. Difference waived."
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-teal-400"
            />
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-semibold transition text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 disabled:opacity-50 text-slate-950 rounded-xl font-black transition text-xs flex items-center gap-1.5 shadow-lg shadow-teal-500/25"
            >
              <Check className="w-4 h-4 stroke-[3]" />
              {loading ? 'Settling Deal...' : 'Confirm Settlement & Close Deal'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
