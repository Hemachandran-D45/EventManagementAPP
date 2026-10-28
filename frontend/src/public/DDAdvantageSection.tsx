import React from 'react';
import { ShieldCheck, Zap, Sliders, Users2, Clock4, Award } from 'lucide-react';

export const DDAdvantageSection: React.FC = () => {
  const advantages = [
    {
      icon: Sliders,
      title: 'Acoustic Precision Engineering',
      desc: 'We never simply turn up the volume. Every venue is acoustically calibrated so high-energy bass stays punchy on the floor while guests at banquet tables enjoy effortless conversation.',
      metric: '0% Distortion Target'
    },
    {
      icon: Zap,
      title: 'Dual Power Fail-Safe Assurance',
      desc: 'Blackouts are not an option on your most important day. Our setups feature redundant power pathways and backup generator synchronizers to ensure zero disruption.',
      metric: '100% Continuous Uptime'
    },
    {
      icon: ShieldCheck,
      title: 'Certified Security & Crowd Protocol',
      desc: 'Our uniformed bouncer coordinators and security specialists handle crowd flow, stage access, and VIP movement with imposing professionalism and courteous hospitality.',
      metric: 'Verified Crew'
    },
    {
      icon: Users2,
      title: 'Dedicated Stage & Sound Director',
      desc: 'You won’t have to run around coordinating audio cues or lighting shifts. A seasoned DD production manager stays by the console orchestrating every entry, toast, and dance cue.',
      metric: 'On-Site Leadership'
    },
    {
      icon: Clock4,
      title: 'Punctual 4-Hour Prior Sound Check',
      desc: 'We arrive, erect trussing, and conclude full line-check and lighting rehearsals hours before the first guest enters the hall. Zero testing while your guests arrive.',
      metric: 'Guaranteed Rehearsal'
    },
    {
      icon: Award,
      title: '100% In-House Production Inventory',
      desc: 'We own, service, and deploy our entire equipment inventory—from LED video processors to cold-spark sparkulars. No third-party dependency or unexpected gear downgrades.',
      metric: 'Direct Ownership'
    }
  ];

  return (
    <section id="advantage" className="relative py-24 sm:py-32 bg-obsidian-950 text-white border-t border-white/5 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto">
          <span className="text-xs font-bold tracking-widest uppercase text-celebration-400">
            Why Event Planners & Families Trust Us
          </span>
          <h2 className="mt-3 text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight">
            The DD Production Advantage.
          </h2>
          <p className="mt-4 text-sm sm:text-base text-slate-300 leading-relaxed font-normal">
            Behind every magical celebration is rigorous technical discipline, fail-safe backups, and seasoned event leadership. Here is how we guarantee perfection.
          </p>
        </div>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {advantages.map((adv) => {
            const Icon = adv.icon;

            return (
              <div
                key={adv.title}
                className="p-7 sm:p-8 rounded-3xl bg-white/[0.02] border border-white/10 hover:border-cobalt-500/40 transition-all duration-300 group hover:shadow-2xl hover:shadow-black/70 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-cobalt-500/10 border border-cobalt-500/20 flex items-center justify-center text-cobalt-400 group-hover:bg-gradient-to-r group-hover:from-cobalt-600 group-hover:to-celebration-600 group-hover:text-white transition-all duration-300">
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-champagne-400 bg-champagne-500/10 border border-champagne-500/20 px-2.5 py-1 rounded-full">
                      {adv.metric}
                    </span>
                  </div>

                  <h3 className="mt-6 text-xl font-bold text-white tracking-tight group-hover:text-cobalt-300 transition-colors">
                    {adv.title}
                  </h3>

                  <p className="mt-3 text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
                    {adv.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
