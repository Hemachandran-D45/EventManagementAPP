import React from 'react';
import { Search, Plus, Sparkles, Smartphone } from 'lucide-react';

interface Props {
  onOpenQuickAdd: () => void;
  onOpenSearch: () => void;
  onOpenInstallModal: () => void;
}

export const Header: React.FC<Props> = ({ onOpenQuickAdd, onOpenSearch, onOpenInstallModal }) => {
  return (
    <header className="sticky top-0 z-30 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-4 py-3">
      <div className="max-w-3xl mx-auto flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <Sparkles className="w-5 h-5 text-slate-950 font-black" />
          </div>
          <div>
            <h1 className="text-base font-bold tracking-tight text-white flex items-center gap-1.5 leading-tight">
              DD EVENTS
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-semibold px-1.5 py-0.5 rounded border border-emerald-500/30">
                PRO
              </span>
            </h1>
            <p className="text-[11px] text-slate-400 leading-none">One Team • One Beat • One Passion</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenInstallModal}
            className="p-2 text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-700/80 rounded-lg border border-slate-700 transition"
            title="Install App on iPhone / Android"
          >
            <Smartphone className="w-4 h-4" />
          </button>

          <button
            onClick={onOpenSearch}
            className="p-2 text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-700/80 rounded-lg border border-slate-700 transition"
            title="Search Events, Clients & Services"
          >
            <Search className="w-4 h-4" />
          </button>

          <button
            onClick={onOpenQuickAdd}
            className="flex items-center gap-1.5 px-3 py-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold rounded-lg shadow-md shadow-emerald-500/25 transition active:scale-95 text-xs sm:text-sm"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Add Order</span>
          </button>
        </div>
      </div>
    </header>
  );
};
