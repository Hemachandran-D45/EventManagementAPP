import React, { useState } from 'react';
import { Sparkles, Camera, Eye, Zap, Flame, Crown, Music } from 'lucide-react';

export const EventHighlightsGallery: React.FC = () => {
  const highlights = [
    {
      title: 'Grand Sangeet DJ & Sharpie Light Arena',
      category: 'Concert DJ & Moving Beams',
      venue: 'Gokulam Park Grand Ballroom, Coimbatore',
      gradient: 'from-blue-900/60 via-indigo-900/40 to-obsidian-950',
      icon: Zap,
      tags: ['7R Sharpies', 'Pioneer Nexus Rig', 'Subwoofers']
    },
    {
      title: 'Royal Couple Entry on Low-Lying Clouds',
      category: 'Special Effects',
      venue: 'Green Garden Convention Centre, Trichy',
      gradient: 'from-rose-950/60 via-purple-900/40 to-obsidian-950',
      icon: Flame,
      tags: ['Dry-Ice Dense Fog', 'Cold Pyro Fountains', 'Elephant Arch']
    },
    {
      title: 'Thunderous Traditional Chenda Melam Ensemble',
      category: 'Cultural & Traditional',
      venue: 'Sri Ranganathaswamy Mandapam, Srirangam',
      gradient: 'from-amber-950/60 via-orange-950/40 to-obsidian-950',
      icon: Music,
      tags: ['Traditional Beats', 'Sacred Auspicious Entry', 'Uniformed Ensemble']
    },
    {
      title: 'Ultra-HD P2.9 Curved LED Video Wall Backdrop',
      category: 'Visual Architecture',
      venue: 'Radisson Blu Mega Hall, Chennai',
      gradient: 'from-cyan-950/60 via-blue-950/40 to-obsidian-950',
      icon: Eye,
      tags: ['P2.9 Ultra-HD', 'Live 4K Camera Link', 'Custom Visuals']
    },
    {
      title: 'High-Voltage College Fest Arena Sound Check',
      category: 'Arena Sound Rig',
      venue: 'PSG Tech Open Ground, Coimbatore',
      gradient: 'from-violet-950/60 via-indigo-950/40 to-obsidian-950',
      icon: Zap,
      tags: ['Touring Line Arrays', 'Digital Mixer Console', 'Strobe Choreography']
    },
    {
      title: 'VIP Celebrity Protocol & Security Detail',
      category: 'Event Security',
      venue: 'ITC Grand Chola, Chennai',
      gradient: 'from-slate-900/70 via-obsidian-900/50 to-obsidian-950',
      icon: Crown,
      tags: ['Trained Bouncer Squad', 'Stage Access Control', 'Crowd Flow Management']
    }
  ];

  return (
    <section id="highlights" className="relative py-24 sm:py-32 bg-obsidian-900 text-white border-t border-white/5 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="max-w-2xl">
            <span className="text-xs font-bold tracking-widest uppercase text-cobalt-400">
              Live Stage Highlights
            </span>
            <h2 className="mt-3 text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight">
              A Glimpse Into The Energy We Create.
            </h2>
            <p className="mt-4 text-sm sm:text-base text-slate-300 font-normal leading-relaxed">
              Every stage we touch transforms into an electrifying arena. Here are recent live production moments orchestrated by Team DD across Tamil Nadu.
            </p>
          </div>

          <div className="text-left md:text-right">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-semibold text-slate-300">
              <Camera className="w-3.5 h-3.5 text-celebration-400" />
              <span>Real Event Captures</span>
            </div>
          </div>
        </div>

        {/* Highlights Grid */}
        <div className="mt-14 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {highlights.map((item, idx) => {
            const Icon = item.icon;

            return (
              <div
                key={idx}
                className="group relative rounded-3xl overflow-hidden bg-obsidian-950 border border-white/10 hover:border-cobalt-500/50 transition-all duration-300 flex flex-col justify-between p-7 sm:p-8 min-h-[340px] hover:shadow-2xl hover:shadow-cobalt-950/50"
              >
                {/* Background Atmospheric Gradient Simulation */}
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${item.gradient} opacity-70 group-hover:opacity-100 transition-opacity duration-300`}
                />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.06),transparent_60%)]" />

                <div className="relative z-10 flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-300 bg-black/40 backdrop-blur-md px-3 py-1 rounded-full border border-white/10">
                    {item.category}
                  </span>
                  <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center text-white group-hover:scale-110 transition-transform">
                    <Icon className="w-5 h-5 text-cobalt-300" />
                  </div>
                </div>

                <div className="relative z-10 mt-auto pt-10">
                  <h3 className="text-xl font-extrabold text-white tracking-tight leading-snug group-hover:text-cobalt-200 transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-xs text-slate-400 mt-2 font-medium">
                    📍 {item.venue}
                  </p>

                  <div className="mt-5 flex flex-wrap gap-2">
                    {item.tags.map((t) => (
                      <span
                        key={t}
                        className="text-[11px] text-slate-300 bg-white/5 backdrop-blur-sm px-2.5 py-0.5 rounded-md border border-white/5"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
