import React from 'react';
import { Volume2, Sparkles, Shield, HeartHandshake, Music2, Cpu } from 'lucide-react';

export const BrandStatement: React.FC = () => {
  return (
    <section id="experience" className="relative py-20 sm:py-28 bg-obsidian-900 border-t border-white/5 overflow-hidden">
      {/* Background Ambient Glow */}
      <div className="absolute top-1/2 left-0 -translate-y-1/2 w-96 h-96 bg-cobalt-600/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-1/2 right-0 -translate-y-1/2 w-96 h-96 bg-celebration-600/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto">
          <span className="text-xs font-bold tracking-widest uppercase text-celebration-400">
            The DD Philosophy
          </span>
          <h2 className="mt-3 text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight leading-tight">
            We Don't Just Supply Equipment.{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-300">
              We Engineer Unforgettable Sensory Chemistry.
            </span>
          </h2>
          <p className="mt-5 text-base sm:text-lg text-slate-300 leading-relaxed font-normal">
            Every celebration has a heartbeat. At DD Event Entertainment, our mission is to synchronize sound, light, special effects, and stage performance into an electric, seamless experience where every guest feels part of something extraordinary.
          </p>
        </div>

        {/* 4 Pillars of Excellence */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/10 hover:border-cobalt-500/40 transition-colors duration-300 group">
            <div className="w-12 h-12 rounded-xl bg-cobalt-500/10 border border-cobalt-500/20 flex items-center justify-center text-cobalt-400 group-hover:scale-110 transition-transform">
              <Volume2 className="w-6 h-6" />
            </div>
            <h3 className="mt-4 text-lg font-bold text-white tracking-tight">Acoustic Clarity</h3>
            <p className="mt-2 text-xs sm:text-sm text-slate-400 leading-relaxed">
              Tuned line-array acoustics that deliver deep visceral bass on the dance floor while maintaining pristine conversational clarity throughout the hall.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/10 hover:border-celebration-500/40 transition-colors duration-300 group">
            <div className="w-12 h-12 rounded-xl bg-celebration-500/10 border border-celebration-500/20 flex items-center justify-center text-celebration-400 group-hover:scale-110 transition-transform">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="mt-4 text-lg font-bold text-white tracking-tight">Cinematic Visuals</h3>
            <p className="mt-2 text-xs sm:text-sm text-slate-400 leading-relaxed">
              Ultra-high-definition LED video walls paired with DMX computer-choreographed moving lighting to transform any hall into a grand concert arena.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/10 hover:border-champagne-500/40 transition-colors duration-300 group">
            <div className="w-12 h-12 rounded-xl bg-champagne-500/10 border border-champagne-500/20 flex items-center justify-center text-champagne-400 group-hover:scale-110 transition-transform">
              <Shield className="w-6 h-6" />
            </div>
            <h3 className="mt-4 text-lg font-bold text-white tracking-tight">Fail-Safe Redundancy</h3>
            <p className="mt-2 text-xs sm:text-sm text-slate-400 leading-relaxed">
              Zero blackout risk with dual backup generators, redundant amplifier racks, and backup microphones ready on instant standby for every major booking.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/10 hover:border-emerald-500/40 transition-colors duration-300 group">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
              <HeartHandshake className="w-6 h-6" />
            </div>
            <h3 className="mt-4 text-lg font-bold text-white tracking-tight">Dedicated Direction</h3>
            <p className="mt-2 text-xs sm:text-sm text-slate-400 leading-relaxed">
              A seasoned event production supervisor coordinates stage cues, artist entries, and timeline milestones on-site from opening prayer to final beat.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
