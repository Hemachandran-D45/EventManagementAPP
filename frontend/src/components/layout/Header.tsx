import React from 'react';
import { Search, Plus, Smartphone } from 'lucide-react';

interface Props {
  onOpenQuickAdd: () => void;
  onOpenSearch: () => void;
  onOpenInstallModal: () => void;
}

export const Header: React.FC<Props> = ({ onOpenQuickAdd, onOpenSearch, onOpenInstallModal }) => {
  return (
    <header className="sticky top-0 z-30 bg-slate-900/95 backdrop-blur-lg border-b border-slate-800/80 px-4 sm:px-6 py-3.5 shadow-sm">
      <div className="max-w-4xl mx-auto flex items-center justify-between gap-3">
        {/* Brand Logo & Name */}
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-white p-1 flex items-center justify-center shadow-lg shadow-blue-900/25 border border-white/20 overflow-hidden flex-shrink-0">
            <img
              src="/logo.png"
              alt="DD Event Entertainment"
              className="w-full h-full object-contain"
            />
          </div>
          <div>
            <h1 className="text-sm sm:text-base font-black tracking-tight text-white flex items-center gap-1.5 leading-tight">
              DD EVENT ENTERTAINMENT
              <span className="hidden sm:inline-block text-[10px] bg-rose-500/15 text-rose-300 font-bold px-1.5 py-0.5 rounded-full border border-rose-500/30 uppercase tracking-wide">
                PRO
              </span>
            </h1>
            <p className="text-[11px] sm:text-xs text-slate-400 font-medium leading-tight">One Team • One Beat • One Passion</p>
          </div>
        </div>

        {/* Header Actions */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          <button
            onClick={onOpenInstallModal}
            className="p-2 sm:p-2.5 text-slate-400 hover:text-white bg-slate-800/70 hover:bg-slate-700/80 rounded-xl border border-slate-700/60 transition shadow-sm"
            title="Install App on iPhone / Android"
          >
            <Smartphone className="w-4 h-4" />
          </button>

          <button
            onClick={onOpenSearch}
            className="p-2 sm:p-2.5 text-slate-400 hover:text-white bg-slate-800/70 hover:bg-slate-700/80 rounded-xl border border-slate-700/60 transition shadow-sm"
            title="Search Events, Clients & Services"
          >
            <Search className="w-4 h-4" />
          </button>

          <button
            onClick={onOpenQuickAdd}
            className="flex items-center gap-1.5 px-3.5 py-2.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-rose-600 hover:from-blue-500 hover:to-rose-500 text-white font-bold rounded-xl shadow-md shadow-blue-500/20 transition active:scale-95 text-xs sm:text-sm"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Add Order</span>
          </button>
        </div>
      </div>
    </header>
  );
};
