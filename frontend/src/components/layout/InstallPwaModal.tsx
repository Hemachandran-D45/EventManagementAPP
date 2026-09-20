import React from 'react';
import { X, Share, PlusSquare, Smartphone, CheckCircle } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const InstallPwaModal: React.FC<Props> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/75 p-0 sm:p-4 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-t-2xl sm:rounded-2xl w-full max-w-md p-5 pb-8 sm:pb-6 text-slate-100 shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Smartphone className="w-5 h-5 text-emerald-400" />
            <h3 className="font-bold text-lg text-white">Install on Your Phone</h3>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-sm text-slate-300 mb-4 leading-relaxed">
          Install <span className="text-emerald-400 font-semibold">Event Business Manager</span> directly to your Home Screen for instant 1-tap access, offline use, and full mobile experience.
        </p>

        <div className="space-y-4 text-xs sm:text-sm">
          <div className="bg-slate-800/70 p-3.5 rounded-xl border border-slate-700/60">
            <h4 className="font-bold text-emerald-400 text-sm mb-2 flex items-center gap-1.5">
              📱 iPhone (Safari)
            </h4>
            <ol className="space-y-2 text-slate-300 list-decimal list-inside">
              <li>Open this page in <b>Safari</b>.</li>
              <li className="flex items-center gap-1">
                Tap the <b>Share button</b> <Share className="w-3.5 h-3.5 inline text-blue-400" /> at bottom.
              </li>
              <li className="flex items-center gap-1">
                Scroll down & tap <b>'Add to Home Screen'</b> <PlusSquare className="w-3.5 h-3.5 inline text-slate-200" />.
              </li>
              <li>Tap <b>Add</b> in the top right.</li>
            </ol>
          </div>

          <div className="bg-slate-800/70 p-3.5 rounded-xl border border-slate-700/60">
            <h4 className="font-bold text-emerald-400 text-sm mb-2 flex items-center gap-1.5">
              🤖 Android (Chrome)
            </h4>
            <ol className="space-y-2 text-slate-300 list-decimal list-inside">
              <li>Tap the <b>3 dots menu (⋮)</b> at top right.</li>
              <li>Tap <b>'Install App'</b> or <b>'Add to Home screen'</b>.</li>
              <li>Confirm install.</li>
            </ol>
          </div>
        </div>

        <button
          onClick={onClose}
          className="mt-5 w-full py-2.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold rounded-xl transition"
        >
          Got It!
        </button>
      </div>
    </div>
  );
};
