import React from 'react';
import { Phone, MessageSquare, MapPin, ShieldCheck, Heart, ArrowUpRight } from 'lucide-react';

interface Props {
  onNavigatePortal: () => void;
  onPlanEventClick: () => void;
}

export const PublicFooter: React.FC<Props> = ({ onNavigatePortal, onPlanEventClick }) => {
  return (
    <footer className="bg-obsidian-950 text-slate-400 border-t border-white/10 pt-16 pb-28 sm:pb-16 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 pb-12 border-b border-white/5">
          {/* Col 1: Brand & Tagline */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-white p-1 flex items-center justify-center border border-white/20 shadow-md">
                <img src="/logo.png" alt="DD Event Entertainment" className="w-full h-full object-contain" />
              </div>
              <div>
                <h3 className="text-base font-black text-white tracking-tight leading-tight">
                  DD EVENT ENTERTAINMENT
                </h3>
                <p className="text-xs text-slate-400 font-medium">One Team • One Beat • One Passion</p>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed font-normal">
              Premier event production, arena sound engineering, intelligent lighting design, and live performance curation across Tamil Nadu and South India.
            </p>

            <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
              <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>UPI Verified: 9363316800@upi</span>
            </div>
          </div>

          {/* Col 2: Direct Contact */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4">
              Booking & Helplines
            </h4>
            <ul className="space-y-3 text-xs sm:text-sm">
              <li>
                <a
                  href="tel:+917868080950"
                  className="hover:text-white transition flex items-center gap-2 group"
                >
                  <Phone className="w-3.5 h-3.5 text-cobalt-400 group-hover:scale-110 transition-transform" />
                  <span className="font-mono">+91 78680 80950</span>
                </a>
              </li>
              <li>
                <a
                  href="https://wa.me/919363316800"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-white transition flex items-center gap-2 group"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-emerald-400 group-hover:scale-110 transition-transform" />
                  <span className="font-mono">+91 93633 16800 (WhatsApp)</span>
                </a>
              </li>
              <li className="flex items-start gap-2 pt-2 text-slate-400">
                <MapPin className="w-3.5 h-3.5 text-celebration-400 flex-shrink-0 mt-0.5" />
                <span>Headquartered in Tamil Nadu. Serving events across South India.</span>
              </li>
            </ul>
          </div>

          {/* Col 3: Service Coverage */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4">
              Major Service Cities
            </h4>
            <div className="grid grid-cols-2 gap-2 text-xs text-slate-400">
              <span>• Coimbatore</span>
              <span>• Trichy</span>
              <span>• Chennai</span>
              <span>• Madurai</span>
              <span>• Salem</span>
              <span>• Erode</span>
              <span>• Tiruppur</span>
              <span>• Thanjavur</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-3">
              Available for destination weddings and institutional tours across South India.
            </p>
          </div>

          {/* Col 4: Quick Actions */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4">
              Quick Actions
            </h4>
            <div className="space-y-2.5">
              <button
                onClick={onPlanEventClick}
                className="w-full py-2.5 px-4 rounded-xl text-xs font-bold uppercase tracking-wider text-white bg-gradient-to-r from-cobalt-600 to-celebration-600 hover:from-cobalt-500 hover:to-celebration-500 text-center shadow-md transition"
              >
                Plan Your Event
              </button>

              <button
                onClick={onNavigatePortal}
                className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 transition flex items-center justify-center gap-1.5"
              >
                <span>Staff & Management Portal</span>
                <ArrowUpRight className="w-3 h-3 text-slate-500" />
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div>
            © {new Date().getFullYear()} DD Event Entertainment. All rights reserved.
          </div>
          <div className="flex items-center gap-4">
            <span className="hover:text-slate-400 transition">One Team • One Beat • One Passion</span>
            <span>•</span>
            <button
              onClick={onNavigatePortal}
              className="text-slate-500 hover:text-cobalt-400 transition underline underline-offset-4"
            >
              Internal Portal
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
