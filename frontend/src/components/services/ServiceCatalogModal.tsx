import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import { Service } from '../../types';
import { api } from '../../services/api';
import { CurrencyText } from '../common/CurrencyText';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const ServiceCatalogModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const [services, setServices] = useState<Service[]>([]);
  const [newName, setNewName] = useState('');
  const [newPrice, setNewPrice] = useState<number>(0);
  const [newCategory, setNewCategory] = useState('General');
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const load = () => {
    api.getServices().then(setServices).catch(console.error);
  };

  useEffect(() => {
    if (isOpen) load();
  }, [isOpen]);

  if (!isOpen) return null;

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || newPrice <= 0) return;
    setLoading(true);
    try {
      await api.createService(newName, newPrice, newCategory);
      setNewName('');
      setNewPrice(0);
      load();
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (service: Service) => {
    if (!confirm(`Are you sure you want to remove "${service.name}" from the catalog?`)) {
      return;
    }
    setDeletingId(service.id);
    try {
      await api.deleteService(service.id);
      load();
    } catch (err) {
      console.error(err);
      alert('Failed to delete service.');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 p-0 sm:p-4 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-800 rounded-t-2xl sm:rounded-2xl w-full max-w-lg p-5 pb-8 sm:pb-6 text-slate-100 shadow-2xl max-h-[85vh] flex flex-col">
        <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-3">
          <div>
            <h3 className="font-bold text-lg text-white">Service Catalog & Rates</h3>
            <p className="text-xs text-slate-400">Add, edit default rates, or delete services</p>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Add new service */}
        <form onSubmit={handleAdd} className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/60 mb-4 space-y-2 text-xs">
          <span className="font-bold text-slate-300">Add New Service to Catalog</span>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <input
              type="text"
              required
              placeholder="Service Name"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white"
            />
            <input
              type="number"
              required
              min="100"
              placeholder="Default Price (₹)"
              value={newPrice || ''}
              onChange={(e) => setNewPrice(Number(e.target.value))}
              className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white font-bold"
            />
            <button
              type="submit"
              disabled={loading}
              className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold rounded-lg px-3 py-1.5 transition flex items-center justify-center gap-1"
            >
              <Plus className="w-4 h-4 stroke-[3]" /> Add
            </button>
          </div>
        </form>

        {/* Services List */}
        <div className="flex-1 overflow-y-auto space-y-2 pr-1 text-xs sm:text-sm">
          {services.map((s) => (
            <div key={s.id} className="p-2.5 bg-slate-800/40 rounded-xl border border-slate-700/60 flex items-center justify-between gap-2">
              <div>
                <p className="font-bold text-white">{s.name}</p>
                <span className="text-[11px] text-slate-400">{s.category || 'General'}</span>
              </div>

              <div className="flex items-center gap-3">
                <CurrencyText amount={s.default_price} className="font-extrabold text-emerald-400 text-sm" />
                <button
                  type="button"
                  onClick={() => handleDelete(s)}
                  disabled={deletingId === s.id}
                  className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition"
                  title={`Delete ${s.name}`}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
