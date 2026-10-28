import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, ArrowRight, Play, Volume2, ShieldCheck, Flame, Zap } from 'lucide-react';

interface Props {
  onPlanEventClick: () => void;
  onExploreServicesClick: () => void;
}

export const CinematicHero: React.FC<Props> = ({ onPlanEventClick, onExploreServicesClick }) => {
  const [scrollProgress, setScrollProgress] = useState(0);
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (!heroRef.current) return;
      const rect = heroRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      // Calculate how far the hero has scrolled through (0 when at top, 1 when scrolled past)
      const progress = Math.min(Math.max(-rect.top / (windowHeight * 0.8), 0), 1);
      setScrollProgress(progress);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Scroll-driven transforms (isolated for easy future sequence swaps)
  const spotlightScale = 1 + scrollProgress * 0.35;
  const spotlightOpacity = Math.max(0.2, 0.7 - scrollProgress * 0.4);
  const headlineTranslateY = scrollProgress * 40;
  const stageAtmosphereOpacity = 0.4 + scrollProgress * 0.4;

  return (
    <div
      ref={heroRef}
      className="relative min-h-screen flex flex-col justify-between pt-28 pb-16 overflow-hidden bg-obsidian-950 text-white selection:bg-celebration-600 selection:text-white"
    >
      {/* ========================================================================= */}
      {/* 1. ISOLATED CINEMATIC LIGHTING & AMBIENT STAGE RIG (Scroll-Controlled)   */}
      {/* ========================================================================= */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        {/* Dynamic Royal Cobalt Spotlight (Top Left) */}
        <div
          className="absolute -top-[25%] -left-[10%] w-[65vw] h-[65vw] rounded-full blur-[140px] transition-transform duration-75 will-change-transform"
          style={{
            background: 'radial-gradient(circle, rgba(29, 78, 216, 0.45) 0%, rgba(37, 99, 235, 0.15) 50%, transparent 80%)',
            transform: `scale(${spotlightScale}) translate3d(${scrollProgress * 20}px, ${scrollProgress * -30}px, 0)`,
            opacity: spotlightOpacity,
          }}
        />

        {/* Dynamic Celebration Magenta Spotlight (Top Right) */}
        <div
          className="absolute -top-[20%] -right-[15%] w-[60vw] h-[60vw] rounded-full blur-[130px] transition-transform duration-75 will-change-transform"
          style={{
            background: 'radial-gradient(circle, rgba(225, 29, 72, 0.35) 0%, rgba(244, 63, 94, 0.12) 50%, transparent 80%)',
            transform: `scale(${spotlightScale * 1.05}) translate3d(${scrollProgress * -25}px, ${scrollProgress * -15}px, 0)`,
            opacity: spotlightOpacity,
          }}
        />

        {/* Center Stage Horizon Beam (Simulating Stadium Concert Wash) */}
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90vw] max-w-5xl h-[380px] rounded-full blur-[110px] pointer-events-none transition-opacity duration-300"
          style={{
            background: 'radial-gradient(ellipse at center, rgba(37, 99, 235, 0.25) 0%, rgba(225, 29, 72, 0.15) 45%, transparent 75%)',
            opacity: stageAtmosphereOpacity,
          }}
        />

        {/* Subtle Architectural Grid Lines */}
        <div className="absolute inset-0 opacity-[0.03] bg-[linear-gradient(to_right,#ffffff_1px,transparent_1px),linear-gradient(to_bottom,#ffffff_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_40%,#000_70%,transparent_100%)]" />
      </div>

      {/* ========================================================================= */}
      {/* 2. HERO CONTENT & STORYTELLING                                            */}
      {/* ========================================================================= */}
      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 my-auto text-center flex flex-col items-center">
        {/* Eyebrow Pill */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.04] border border-white/10 backdrop-blur-md text-xs font-semibold tracking-wider uppercase text-slate-300 mb-6 shadow-lg shadow-black/50">
          <span className="w-2 h-2 rounded-full bg-celebration-500 animate-ping" />
          <span className="text-cobalt-400">Concert-Grade Production</span>
          <span className="text-slate-600">•</span>
          <span className="text-champagne-400">Royal Celebrations</span>
        </div>

        {/* Main Editorial Headline */}
        <h1
          className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tight leading-[1.08] max-w-5xl will-change-transform"
          style={{
            transform: `translate3d(0, ${headlineTranslateY * 0.4}px, 0)`,
          }}
        >
          Turning Moments Into{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-300 to-rose-400 animate-gradient">
            High-Voltage
          </span>{' '}
          Memories.
        </h1>

        {/* Brand Tagline & Narrative */}
        <p
          className="mt-6 text-base sm:text-lg md:text-xl text-slate-300 font-normal max-w-2xl leading-relaxed will-change-transform"
          style={{
            transform: `translate3d(0, ${headlineTranslateY * 0.6}px, 0)`,
          }}
        >
          <strong className="text-white font-semibold">One Team • One Beat • One Passion.</strong> From royal wedding sangeets to thunderous cultural festivals and corporate galas, DD Event Entertainment delivers concert-fidelity acoustics, stadium lighting, and heart-pounding live artistry across South India.
        </p>

        {/* Dual Primary CTAs */}
        <div className="mt-9 flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
          <button
            onClick={onPlanEventClick}
            className="w-full sm:w-auto flex items-center justify-center gap-2.5 px-8 py-4 rounded-2xl text-sm font-bold uppercase tracking-wider text-white bg-gradient-to-r from-cobalt-600 via-indigo-600 to-celebration-600 hover:from-cobalt-500 hover:to-celebration-500 shadow-xl shadow-cobalt-600/35 hover:shadow-celebration-600/35 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
          >
            <span>Plan Your Event</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={onExploreServicesClick}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-7 py-4 rounded-2xl text-sm font-semibold tracking-wide text-slate-200 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 hover:border-white/20 backdrop-blur-md transition-all duration-200"
          >
            <span>Explore 13+ Services</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. CREDENTIALS & TRUST BAR (Base of Hero)                                 */}
      {/* ========================================================================= */}
      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 w-full mt-12 sm:mt-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 p-4 sm:p-5 rounded-2xl bg-white/[0.02] border border-white/10 backdrop-blur-md shadow-2xl">
          <div className="flex items-center gap-3 p-2">
            <div className="w-10 h-10 rounded-xl bg-cobalt-500/10 border border-cobalt-500/20 flex items-center justify-center flex-shrink-0 text-cobalt-400">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <div className="text-lg sm:text-xl font-black text-white leading-tight">500+</div>
              <div className="text-[11px] sm:text-xs text-slate-400">Events Engineered</div>
            </div>
          </div>

          <div className="flex items-center gap-3 p-2">
            <div className="w-10 h-10 rounded-xl bg-celebration-500/10 border border-celebration-500/20 flex items-center justify-center flex-shrink-0 text-celebration-400">
              <Volume2 className="w-5 h-5" />
            </div>
            <div>
              <div className="text-lg sm:text-xl font-black text-white leading-tight">Zero Distortion</div>
              <div className="text-[11px] sm:text-xs text-slate-400">Concert-Grade Sound</div>
            </div>
          </div>

          <div className="flex items-center gap-3 p-2">
            <div className="w-10 h-10 rounded-xl bg-champagne-500/10 border border-champagne-500/20 flex items-center justify-center flex-shrink-0 text-champagne-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="text-lg sm:text-xl font-black text-white leading-tight">Dual Power</div>
              <div className="text-[11px] sm:text-xs text-slate-400">Fail-Safe Backup Ready</div>
            </div>
          </div>

          <div className="flex items-center gap-3 p-2">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center flex-shrink-0 text-emerald-400">
              <Flame className="w-5 h-5" />
            </div>
            <div>
              <div className="text-lg sm:text-xl font-black text-white leading-tight">13+ Production</div>
              <div className="text-[11px] sm:text-xs text-slate-400">In-House Services</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
