import React from 'react';
import { Phone, MessageSquare, Calendar } from 'lucide-react';

interface Props {
  onPlanEventClick: () => void;
}

export const FloatingActionBar: React.FC<Props> = ({ onPlanEventClick }) => {
  return (
    <div className="fixed bottom-4 left-4 right-4 sm:hidden z-40">
      <div className="bg-obsidian-950/95 backdrop-blur-xl border border-white/15 rounded-2xl p-2 flex items-center justify-between gap-2 shadow-2xl shadow-black/90">
        <a
          href="tel:+917868080950"
          className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs font-semibold active:scale-95 transition"
        >
          <Phone className="w-3.5 h-3.5 text-cobalt-400" />
          <span>Call</span>
        </a>

        <a
          href="https://wa.me/919363316800"
          target="_blank"
          rel="noreferrer"
          className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-emerald-600/90 text-white text-xs font-semibold shadow-md shadow-emerald-600/20 active:scale-95 transition"
        >
          <MessageSquare className="w-3.5 h-3.5" />
          <span>WhatsApp</span>
        </a>

        <button
          onClick={onPlanEventClick}
          className="flex-[1.2] flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-gradient-to-r from-cobalt-600 to-celebration-600 text-white text-xs font-bold uppercase tracking-wider shadow-md shadow-cobalt-600/30 active:scale-95 transition"
        >
          <Calendar className="w-3.5 h-3.5" />
          <span>Enquire</span>
        </button>
      </div>
    </div>
  );
};
