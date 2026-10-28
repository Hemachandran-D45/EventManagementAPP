import React from 'react';
import { Star, Quote, CheckCircle2 } from 'lucide-react';

export const TestimonialsSection: React.FC = () => {
  const testimonials = [
    {
      name: 'Karthik & Divya',
      role: 'Bride & Groom • Grand Sangeet & Reception',
      location: 'Coimbatore',
      content: 'DD Events was the best decision of our wedding! The dry-ice fog entry looked straight out of a movie, and the DJ setup kept our entire family on the dance floor until 1 AM. What impressed us most was that our grandparents sat comfortably without the sound piercing their ears—the acoustic clarity was extraordinary.',
      stars: 5,
      event: 'Royal Sangeet & Wedding'
    },
    {
      name: 'Dr. Vigneshwaran M.',
      role: 'Cultural Secretary • State University Fest',
      location: 'Trichy',
      content: 'Managing a crowd of 3,500 students requires absolute fail-safe audio and disciplined bouncer coordination. Team DD handled both effortlessly. Their P2.9 LED screen and sharpie lighting show transformed our college ground into an international concert arena. Not a single glitch or delay.',
      stars: 5,
      event: 'Annual Cultural Fest'
    },
    {
      name: 'Suresh Kumar R.',
      role: 'Temple Festival Committee Member',
      location: 'Salem',
      content: 'The Chenda Melam ensemble arranged by DD Events brought raw, sacred thunder to our temple procession. The discipline, traditional Kerala attire, and rhythmic power gave every single devotee goosebumps. True professionals who respect traditions and timelines.',
      stars: 5,
      event: 'Maha Festival & Procession'
    }
  ];

  return (
    <section id="testimonials" className="relative py-24 sm:py-32 bg-obsidian-950 text-white border-t border-white/5 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto">
          <span className="text-xs font-bold tracking-widest uppercase text-champagne-400">
            Client Words & Trust
          </span>
          <h2 className="mt-3 text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight">
            Memories Celebrated With DD Events.
          </h2>
          <p className="mt-4 text-sm sm:text-base text-slate-300 leading-relaxed font-normal">
            Read real experiences from families, couples, and institutional organizers who trusted our team to power their milestone celebrations.
          </p>
        </div>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((t, idx) => (
            <div
              key={idx}
              className="p-8 rounded-3xl bg-white/[0.02] border border-white/10 hover:border-white/20 transition-all duration-300 flex flex-col justify-between relative shadow-xl hover:shadow-2xl"
            >
              <div>
                {/* 5 Stars Rating */}
                <div className="flex items-center gap-1 text-champagne-400 mb-6">
                  {[...Array(t.stars)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-champagne-400 text-champagne-400" />
                  ))}
                </div>

                <Quote className="w-8 h-8 text-cobalt-500/20 mb-3" />

                <p className="text-sm sm:text-base text-slate-200 leading-relaxed italic">
                  "{t.content}"
                </p>
              </div>

              <div className="mt-8 pt-5 border-t border-white/5">
                <div className="font-extrabold text-white text-base tracking-tight flex items-center gap-1.5">
                  {t.name}
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                </div>
                <div className="text-xs text-slate-400 mt-0.5">{t.role}</div>
                <div className="text-[11px] text-cobalt-400 font-semibold mt-1">📍 {t.location} • {t.event}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
