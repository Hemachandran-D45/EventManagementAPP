import React from 'react';
import { Crown, Sparkles, Music4, Building2, PartyPopper, ArrowRight } from 'lucide-react';

interface Props {
  onPlanOccasion: (occasionName: string) => void;
}

export const OccasionsSection: React.FC<Props> = ({ onPlanOccasion }) => {
  const occasions = [
    {
      title: 'Royal Weddings & Sangeet',
      tagline: 'High-Emotion Ceremonies & Electrifying Dance Floors',
      icon: Crown,
      color: 'from-amber-500/20 to-rose-500/20 border-amber-500/30 text-champagne-300',
      badge: 'Signature Production',
      services: ['Low-Lying Fog First Dance', 'Cold Pyro Sparkulars', 'Concert DJ & Sound', 'Elephant Trunk Entry'],
      description: 'From sacred mangalyam rituals to late-night sangeet dance marathons, we orchestrate royal acoustics, fairy-tale atmospheric effects, and majestic couple entries.'
    },
    {
      title: 'Temple & Traditional Festivals',
      tagline: 'Sacred Rhythms & Grand Community Celebrations',
      icon: Music4,
      color: 'from-rose-500/20 to-orange-500/20 border-rose-500/30 text-celebration-400',
      badge: 'Heritage & Power',
      services: ['Thunderous Chenda Melam', 'Traditional Percussion', 'Festival Stage Illumination', 'Crowd Safety Security'],
      description: 'Honoring tradition with the thunderous roar of authentic Kerala Chenda Melam ensembles, powerful outdoor acoustic distribution, and disciplined crowd flow management.'
    },
    {
      title: 'College Culturals & Concerts',
      tagline: 'High-Voltage Youth Energy & Arena Sound',
      icon: Sparkles,
      color: 'from-blue-500/20 to-indigo-500/20 border-blue-500/30 text-cobalt-400',
      badge: 'Stadium Intensity',
      services: ['Touring Line-Array Rigs', 'Mass DJ Battle Sets', 'P2.9 High-Definition LED Walls', 'Sharpie Beam Choreography'],
      description: 'Engineering arena-level bass, blinding strobe sweeps, and visual spectacle that ignites college grounds and music festivals with zero distortion or lag.'
    },
    {
      title: 'Corporate Galas & Brand Launches',
      tagline: 'Impeccable Precision & High-Impact Presentation',
      icon: Building2,
      color: 'from-cyan-500/20 to-blue-500/20 border-cyan-500/30 text-cyan-400',
      badge: 'Corporate Standard',
      services: ['Crystal-Clear Speech Audio', 'Ultra-HD Keynote LED Screens', 'Architectural Ambiance', 'VIP Executive Protection'],
      description: 'Delivering flawless keynote acoustic clarity, high-definition stage visuals, and discreet certified security for annual stakeholder meets and high-profile product reveals.'
    },
    {
      title: 'Milestone Birthdays & Private Galas',
      tagline: 'Intimate Luxury & Bespoke Entertainment',
      icon: PartyPopper,
      color: 'from-emerald-500/20 to-teal-500/20 border-emerald-500/30 text-emerald-400',
      badge: 'Custom Celebration',
      services: ['Live Acoustic Ensemble', 'Themed Stage Architecture', 'Welcome Selfie Props', 'Ambient Stage Washes'],
      description: 'Crafting warm, personalized family milestones with tailored playlists, beautiful thematic lighting, and celebratory special effects that delight guests of every generation.'
    }
  ];

  return (
    <section id="occasions" className="relative py-24 sm:py-32 bg-obsidian-900 text-white border-t border-white/5 overflow-hidden">
      {/* Background Lighting */}
      <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-96 h-96 bg-cobalt-600/10 rounded-full blur-[150px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-3xl">
          <span className="text-xs font-bold tracking-widest uppercase text-cobalt-400">
            Tailored Production Environments
          </span>
          <h2 className="mt-3 text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight">
            Engineered For Every Celebration Scale.
          </h2>
          <p className="mt-4 text-sm sm:text-base text-slate-300 leading-relaxed font-normal">
            Whether welcoming 200 close family members or 5,000 festival devotees, DD Event Entertainment adapts acoustic coverage, stage architecture, and personnel to match your venue dynamics.
          </p>
        </div>

        {/* Occasions Grid */}
        <div className="mt-14 grid grid-cols-1 lg:grid-cols-3 gap-6">
          {occasions.map((occ, idx) => {
            const Icon = occ.icon;
            const isLarge = idx === 0 || idx === 1;

            return (
              <div
                key={occ.title}
                className={`p-7 sm:p-8 rounded-3xl bg-gradient-to-br from-white/[0.03] to-white/[0.01] border border-white/10 hover:border-white/20 transition-all duration-300 flex flex-col justify-between ${
                  isLarge ? 'lg:col-span-1.5' : 'lg:col-span-1'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-3">
                    <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${occ.color} flex items-center justify-center border shadow-sm`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-white/5 px-2.5 py-1 rounded-full border border-white/5">
                      {occ.badge}
                    </span>
                  </div>

                  <h3 className="mt-6 text-2xl font-black text-white tracking-tight">
                    {occ.title}
                  </h3>
                  <p className="text-xs font-semibold text-slate-400 mt-1 uppercase tracking-wider">
                    {occ.tagline}
                  </p>

                  <p className="mt-4 text-xs sm:text-sm text-slate-300 leading-relaxed">
                    {occ.description}
                  </p>

                  <div className="mt-6 pt-5 border-t border-white/5">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                      Key Event Elements:
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {occ.services.map((item) => (
                        <span
                          key={item}
                          className="text-xs text-slate-300 bg-white/[0.04] px-2.5 py-1 rounded-lg border border-white/5"
                        >
                          • {item}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-8 pt-4">
                  <button
                    onClick={() => onPlanOccasion(occ.title)}
                    className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-cobalt-400 hover:text-white transition-colors group"
                  >
                    <span>Plan a {occ.title.split('&')[0].trim()}</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
