import React, { useState } from 'react';
import { PublicNav } from './PublicNav';
import { CinematicHero } from './CinematicHero';
import { BrandStatement } from './BrandStatement';
import { ServicesShowcase } from './ServicesShowcase';
import { OccasionsSection } from './OccasionsSection';
import { DDAdvantageSection } from './DDAdvantageSection';
import { EventHighlightsGallery } from './EventHighlightsGallery';
import { TestimonialsSection } from './TestimonialsSection';
import { EventEnquirySection } from './EventEnquirySection';
import { PublicFooter } from './PublicFooter';
import { FloatingActionBar } from './FloatingActionBar';

interface Props {
  onNavigatePortal: () => void;
}

export const PublicHomePage: React.FC<Props> = ({ onNavigatePortal }) => {
  const [preSelectedServiceId, setPreSelectedServiceId] = useState<number | null>(null);

  const scrollToEnquiry = () => {
    const el = document.getElementById('enquiry');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const scrollToServices = () => {
    const el = document.getElementById('services');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleSelectServiceFromShowcase = (serviceId: number) => {
    setPreSelectedServiceId(serviceId);
    scrollToEnquiry();
  };

  const handlePlanOccasion = (_occasionName: string) => {
    scrollToEnquiry();
  };

  return (
    <div className="public-site min-h-screen bg-obsidian-950 text-slate-100 flex flex-col antialiased selection:bg-celebration-600 selection:text-white">
      {/* 1. Navigation */}
      <PublicNav
        onNavigatePortal={onNavigatePortal}
        onPlanEventClick={scrollToEnquiry}
      />

      <main className="flex-1">
        {/* 2. Cinematic Hero & Scroll Experience */}
        <CinematicHero
          onPlanEventClick={scrollToEnquiry}
          onExploreServicesClick={scrollToServices}
        />

        {/* 3. Brand Statement & Pillars */}
        <BrandStatement />

        {/* 4. Services Showcase (Strictly Zero Pricing) */}
        <ServicesShowcase
          onSelectServiceForInquiry={handleSelectServiceFromShowcase}
        />

        {/* 5. Signature Event Occasions */}
        <OccasionsSection
          onPlanOccasion={handlePlanOccasion}
        />

        {/* 6. The DD Advantage & Technical Reliability */}
        <DDAdvantageSection />

        {/* 7. Live Stage Highlights & Visual Gallery */}
        <EventHighlightsGallery />

        {/* 8. Testimonials & Verified Client Feedback */}
        <TestimonialsSection />

        {/* 9. Event Enquiry / Plan Your Event */}
        <EventEnquirySection
          preSelectedServiceId={preSelectedServiceId}
          onClearPreSelected={() => setPreSelectedServiceId(null)}
        />
      </main>

      {/* 10. Public Footer */}
      <PublicFooter
        onNavigatePortal={onNavigatePortal}
        onPlanEventClick={scrollToEnquiry}
      />

      {/* 11. Mobile Floating Conversion Bar */}
      <FloatingActionBar
        onPlanEventClick={scrollToEnquiry}
      />
    </div>
  );
};
