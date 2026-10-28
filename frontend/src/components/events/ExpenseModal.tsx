import React, { useState, useEffect } from 'react';
import { X, Check, Trash2 } from 'lucide-react';
import { Expense } from '../../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  expenseToEdit?: Expense | null;
  onRecord: (amount: number, category: string, description: string, date: string) => Promise<void>;
  onUpdate?: (expenseId: number, amount: number, category: string, description: string, date: string) => Promise<void>;
  onDelete?: (expenseId: number) => Promise<void>;
}

export const ExpenseModal: React.FC<Props> = ({
  isOpen,
  onClose,
  expenseToEdit,
  onRecord,
  onUpdate,
  onDelete
}) => {
  const [amount, setAmount] = useState<number>(0);
  const [category, setCategory] = useState<string>('Transport');
  const [description, setDescription] = useState<string>('');
  const [expenseDate, setExpenseDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (expenseToEdit) {
      setAmount(expenseToEdit.amount);
      setCategory(expenseToEdit.category || 'Transport');
      setDescription(expenseToEdit.description || '');
      setExpenseDate(expenseToEdit.date || new Date().toISOString().split('T')[0]);
    } else {
      setAmount(0);
      setCategory('Transport');
      setDescription('');
      setExpenseDate(new Date().toISOString().split('T')[0]);
    }
  }, [isOpen, expenseToEdit]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (amount <= 0) return;
    setLoading(true);
    try {
      if (expenseToEdit && onUpdate) {
        await onUpdate(expenseToEdit.id, amount, category, description, expenseDate);
      } else {
        await onRecord(amount, category, description, expenseDate);
      }
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!expenseToEdit || !onDelete) return;
    if (!confirm('Are you sure you want to delete this expense? This will restore the event profit immediately.')) return;
    setLoading(true);
    try {
      await onDelete(expenseToEdit.id);
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const categories = ['Transport', 'Labour', 'Rental', 'Food', 'Materials', 'Other'];

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 p-0 sm:p-4 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-800 rounded-t-2xl sm:rounded-2xl w-full max-w-md p-5 pb-8 sm:pb-6 text-slate-100 shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-lg text-white">
            {expenseToEdit ? 'Edit Event Expense' : 'Record Event Expense'}
          </h3>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-sm">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Expense Amount (₹)
            </label>
            <input
              type="number"
              required
              min="1"
              placeholder="e.g. 3500"
              value={amount || ''}
              onChange={(e) => setAmount(Number(e.target.value))}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold text-lg focus:outline-none focus:border-rose-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs sm:text-sm focus:outline-none focus:border-rose-500"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Date
              </label>
              <input
                type="date"
                required
                value={expenseDate}
                onChange={(e) => setExpenseDate(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs sm:text-sm focus:outline-none focus:border-rose-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Description / Vendor Details
            </label>
            <input
              type="text"
              placeholder="e.g. Mini truck diesel + driver bata"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs sm:text-sm focus:outline-none focus:border-rose-500"
            />
          </div>

          <div className="flex items-center gap-2 pt-2">
            {expenseToEdit && onDelete && (
              <button
                type="button"
                onClick={handleDelete}
                disabled={loading}
                className="py-2.5 px-4 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 font-bold rounded-xl transition flex items-center justify-center gap-1.5"
                title="Delete this expense"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete</span>
              </button>
            )}

            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2.5 bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-xl transition flex items-center justify-center gap-2 shadow-lg shadow-rose-500/20"
            >
              <Check className="w-4 h-4 stroke-[3]" />
              <span>{loading ? 'Saving...' : (expenseToEdit ? 'Save Changes' : 'Add Expense')}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
