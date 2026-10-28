import React, { useState, useEffect } from 'react';
import {
  Volume2, Monitor, Sparkles, Wind, Flame, Music, Users,
  Crown, Flower2, Camera, ShieldCheck, Smile, ArrowRight,
  CheckCircle2, Layers
} from 'lucide-react';
import { PublicService } from '../types';
import { api } from '../services/api';

interface Props {
  onSelectServiceForInquiry: (serviceId: number) => void;
}

export const ServicesShowcase: React.FC<Props> = ({ onSelectServiceForInquiry }) => {
  const [services, setServices] = useState<PublicService[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const data = await api.getPublicServices();
        setServices(data);
      } catch (err) {
        console.error('Failed to load public services:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchServices();
  }, []);

  // Icon mapping by service name or category
  const getServiceIcon = (name: string, category: string) => {
    if (name.includes('DJ') || category === 'Audio') return Volume2;
    if (name.includes('LED') || category === 'Visuals') return Monitor;
    if (name.includes('Light') || category === 'Lighting') return Sparkles;
    if (name.includes('Fog') || name.includes('Cold')) return Wind;
    if (name.includes('Pyro')) return Flame;
    if (name.includes('Orchestra') || category === 'Music') return Music;
    if (name.includes('Dance') || category === 'Entertainment') return Users;
    if (name.includes('Chenda') || category === 'Traditional') return Music;
    if (name.includes('Elephant') || category === 'Entry Special') return Crown;
    if (name.includes('Floral') || category === 'Decor') return Flower2;
    if (name.includes('Photo') || category === 'Media') return Camera;
    if (name.includes('Bouncer') || category === 'Security') return ShieldCheck;
    return Smile;
  };

  const categories = [
    { key: 'ALL', label: 'All Services' },
    { key: 'Audio', label: 'Sound & DJ' },
    { key: 'Lighting', label: 'Lighting & FX' },
    { key: 'Visuals', label: 'LED Walls' },
    { key: 'Entertainment', label: 'Live Artists' },
    { key: 'Security', label: 'Security & Protocol' },
  ];

  const filteredServices = selectedCategory === 'ALL'
    ? services
    : services.filter((s) => s.category.toLowerCase().includes(selectedCategory.toLowerCase()));

  return (
    <section id="services" className="relative py-24 sm:py-32 bg-obsidian-950 text-white border-t border-white/5 overflow-hidden">
      {/* Background Accent Gradients */}
      <div className="absolute top-1/3 right-0 w-[500px] h-[500px] bg-cobalt-600/10 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-[450px] h-[450px] bg-celebration-600/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cobalt-500/10 border border-cobalt-500/20 text-cobalt-400 text-xs font-bold uppercase tracking-wider mb-3">
              <Layers className="w-3.5 h-3.5" />
              <span>Full-Spectrum Production Capabilities</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight">
              Concert-Grade Services.{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-rose-400">
                Crafted For Impact.
              </span>
            </h2>
            <p className="mt-4 text-sm sm:text-base text-slate-300 font-normal leading-relaxed">
              Explore our in-house inventory of arena sound, intelligent stage illumination, low-lying cloud effects, and certified event crew. Every service is calibrated by seasoned sound engineers and stage directors.
            </p>
          </div>

          <div className="text-left md:text-right">
            <span className="text-xs text-slate-400 uppercase tracking-widest font-semibold block">
              100% In-House Inventory
            </span>
            <span className="text-sm font-medium text-slate-300 mt-1 block">
              No Sub-Contracting Delays • Real-Time Fail-Safe Gear
            </span>
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="mt-10 flex flex-wrap gap-2 sm:gap-2.5 pb-2">
          {categories.map((cat) => (
            <button
              key={cat.key}
              onClick={() => setSelectedCategory(cat.key)}
              className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-200 ${
                selectedCategory === cat.key
                  ? 'bg-gradient-to-r from-cobalt-600 to-celebration-600 text-white shadow-lg shadow-cobalt-600/30'
                  : 'bg-white/[0.03] text-slate-400 hover:text-white hover:bg-white/[0.08] border border-white/10'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-72 rounded-3xl bg-white/[0.02] border border-white/10 animate-pulse p-6" />
            ))}
          </div>
        ) : (
          /* Services Grid - STRICT ZERO PRICING */
          <div className="mt-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredServices.map((service) => {
              const IconComponent = getServiceIcon(service.name, service.category);

              return (
                <div
                  key={service.id}
                  className="flex flex-col justify-between p-6 sm:p-7 rounded-3xl bg-gradient-to-b from-white/[0.03] to-white/[0.01] border border-white/10 hover:border-cobalt-500/40 transition-all duration-300 group hover:shadow-2xl hover:shadow-black/70 hover:-translate-y-1"
                >
                  <div>
                    {/* Top Row: Icon + Category Badge */}
                    <div className="flex items-center justify-between gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-cobalt-500/10 border border-cobalt-500/20 flex items-center justify-center text-cobalt-400 group-hover:bg-gradient-to-br group-hover:from-cobalt-600 group-hover:to-celebration-600 group-hover:text-white transition-all duration-300 shadow-sm">
                        <IconComponent className="w-6 h-6" />
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-white/5 px-2.5 py-1 rounded-full border border-white/5">
                        {service.category}
                      </span>
                    </div>

                    {/* Service Name */}
                    <h3 className="mt-5 text-xl font-extrabold text-white tracking-tight group-hover:text-cobalt-300 transition-colors">
                      {service.name}
                    </h3>

                    {/* Description */}
                    <p className="mt-2.5 text-xs sm:text-sm text-slate-300 font-normal leading-relaxed">
                      {service.description}
                    </p>

                    {/* The Event Experience Impact */}
                    <div className="mt-4 p-3 rounded-2xl bg-white/[0.02] border border-white/5">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-celebration-400 mb-1">
                        Event Impact
                      </div>
                      <p className="text-xs text-slate-300 leading-snug">
                        {service.experience}
                      </p>
                    </div>

                    {/* Key Technical Highlights */}
                    {service.highlights && service.highlights.length > 0 && (
                      <div className="mt-4 space-y-1.5">
                        {service.highlights.map((h, idx) => (
                          <div key={idx} className="flex items-center gap-2 text-xs text-slate-400">
                            <CheckCircle2 className="w-3.5 h-3.5 text-cobalt-400 flex-shrink-0" />
                            <span>{h}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Action CTA: Enquire About This (NO PRICING) */}
                  <div className="mt-7 pt-4 border-t border-white/5">
                    <button
                      onClick={() => onSelectServiceForInquiry(service.id)}
                      className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-bold uppercase tracking-wider text-white bg-white/5 hover:bg-gradient-to-r hover:from-cobalt-600 hover:to-celebration-600 border border-white/10 hover:border-transparent transition-all duration-200 group-hover:shadow-md"
                    >
                      <span>Enquire About This</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};
