import React, { useState, useEffect } from 'react';
import { Menu, X, Phone, Calendar, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';

interface Props {
  onNavigatePortal: () => void;
  onPlanEventClick: () => void;
}

export const PublicNav: React.FC<Props> = ({ onNavigatePortal, onPlanEventClick }) => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 30);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { label: 'Experience', href: '#experience' },
    { label: 'Services', href: '#services' },
    { label: 'Occasions', href: '#occasions' },
    { label: 'The Advantage', href: '#advantage' },
    { label: 'Highlights', href: '#highlights' },
    { label: 'Testimonials', href: '#testimonials' },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-obsidian-950/90 backdrop-blur-xl border-b border-white/10 shadow-2xl shadow-black/80 py-3'
          : 'bg-gradient-to-b from-obsidian-950/90 via-obsidian-950/40 to-transparent py-4'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
        {/* Brand Emblem Logo & Identity */}
        <a href="#" className="flex items-center gap-3 group">
          <div className="relative w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-white p-1 flex items-center justify-center shadow-lg shadow-cobalt-600/20 border border-white/20 overflow-hidden flex-shrink-0 group-hover:scale-105 transition-transform duration-300">
            <img
              src="/logo.png"
              alt="DD Event Entertainment"
              className="w-full h-full object-contain"
            />
          </div>
          <div className="flex flex-col">
            <span className="text-sm sm:text-base font-black tracking-tight text-white flex items-center gap-1.5 leading-none">
              DD EVENT ENTERTAINMENT
              <span className="hidden sm:inline-block w-1.5 h-1.5 rounded-full bg-celebration-500 animate-pulse" />
            </span>
            <span className="text-[10px] sm:text-xs text-slate-400 font-medium tracking-wide mt-1 leading-none">
              One Team • One Beat • One Passion
            </span>
          </div>
        </a>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-7">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="text-xs font-semibold tracking-wide uppercase text-slate-300 hover:text-white transition-colors duration-200"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Desktop CTAs */}
        <div className="hidden sm:flex items-center gap-3">
          <a
            href="tel:+917868080950"
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 transition duration-200"
            title="Call DD Events Concierge"
          >
            <Phone className="w-3.5 h-3.5 text-cobalt-500" />
            <span className="font-mono">78680 80950</span>
          </a>

          <button
            onClick={onPlanEventClick}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider text-white bg-gradient-to-r from-cobalt-600 via-indigo-600 to-celebration-600 hover:from-cobalt-500 hover:to-celebration-500 shadow-lg shadow-cobalt-600/30 hover:shadow-celebration-600/30 transition-all duration-300 active:scale-95"
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Plan Your Event</span>
          </button>

          <button
            onClick={onNavigatePortal}
            className="p-2 text-slate-500 hover:text-slate-300 text-[11px] font-semibold tracking-wider uppercase border border-transparent hover:border-white/10 rounded-lg transition"
            title="Internal Event Management Portal"
          >
            Staff Portal
          </button>
        </div>

        {/* Mobile Hamburger Button */}
        <div className="flex sm:hidden items-center gap-2">
          <button
            onClick={onPlanEventClick}
            className="px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-gradient-to-r from-cobalt-600 to-celebration-600 shadow-sm"
          >
            Plan Event
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-slate-300 hover:text-white bg-white/5 border border-white/10 rounded-xl"
            aria-label="Toggle Navigation"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="sm:hidden bg-obsidian-950/98 backdrop-blur-2xl border-b border-white/10 px-5 py-6 space-y-4 shadow-2xl animate-in slide-in-from-top duration-200">
          <div className="flex flex-col space-y-3">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="text-sm font-semibold tracking-wide text-slate-200 hover:text-cobalt-400 py-1 border-b border-white/5"
              >
                {link.label}
              </a>
            ))}
          </div>

          <div className="pt-2 flex flex-col gap-2.5">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onPlanEventClick();
              }}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-bold uppercase tracking-wider text-white bg-gradient-to-r from-cobalt-600 to-celebration-600 shadow-lg shadow-cobalt-600/30"
            >
              <Calendar className="w-4 h-4" />
              <span>Plan Your Event</span>
            </button>

            <a
              href="tel:+917868080950"
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-semibold text-slate-300 bg-white/5 border border-white/10"
            >
              <Phone className="w-4 h-4 text-cobalt-400" />
              <span>Call Helpline: +91 78680 80950</span>
            </a>

            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onNavigatePortal();
              }}
              className="w-full text-center py-2 text-[11px] text-slate-500 hover:text-slate-400 font-semibold uppercase tracking-wider"
            >
              Access Staff Portal →
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
