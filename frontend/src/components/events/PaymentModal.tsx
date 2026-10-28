import React, { useState } from 'react';
import { X, Check } from 'lucide-react';
import { PaymentMethod } from '../../types';
import { CurrencyText } from '../common/CurrencyText';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onRecord: (amount: number, date: string, method: PaymentMethod, notes: string) => Promise<void>;
  balanceDue: number;
}

export const PaymentModal: React.FC<Props> = ({ isOpen, onClose, onRecord, balanceDue }) => {
  const [amount, setAmount] = useState<number>(balanceDue > 0 ? balanceDue : 0);
  const [paymentDate, setPaymentDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('UPI');
  const [notes, setNotes] = useState<string>('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (amount <= 0) return;
    setLoading(true);
    try {
      await onRecord(amount, paymentDate, paymentMethod, notes);
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 p-0 sm:p-4 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-800 rounded-t-2xl sm:rounded-2xl w-full max-w-md p-5 pb-8 sm:pb-6 text-slate-100 shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-lg text-white">Record Payment</h3>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-sm">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Payment Amount (₹)
            </label>
            <input
              type="number"
              required
              min="1"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold text-lg focus:outline-none focus:border-emerald-500"
            />
            {balanceDue > 0 && (
              <p className="text-xs text-slate-400 mt-1">
                Outstanding Balance: <CurrencyText amount={balanceDue} className="text-rose-400 font-semibold" />
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Date
              </label>
              <input
                type="date"
                required
                value={paymentDate}
                onChange={(e) => setPaymentDate(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs sm:text-sm focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Payment Method
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs sm:text-sm focus:outline-none focus:border-emerald-500"
              >
                <option value="UPI">UPI / GPay / PhonePe</option>
                <option value="CASH">Cash</option>
                <option value="BANK_TRANSFER">Bank Transfer / NEFT</option>
                <option value="OTHER">Other</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Notes (optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Received from brother, txn id 49102"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs sm:text-sm focus:outline-none focus:border-emerald-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold rounded-xl transition flex items-center justify-center gap-2 mt-4"
          >
            <Check className="w-4 h-4 stroke-[3]" />
            <span>{loading ? 'Saving...' : 'Save Payment'}</span>
          </button>
        </form>
      </div>
    </div>
  );
};
