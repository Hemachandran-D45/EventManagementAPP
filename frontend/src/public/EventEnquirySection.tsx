import React, { useState, useEffect } from 'react';
import { Calendar, Phone, MapPin, User, Users, MessageSquare, CheckSquare, Send, CheckCircle2, Loader2, Sparkles } from 'lucide-react';
import { PublicService, PublicInquiryPayload, PublicInquiryResponse } from '../types';
import { api } from '../services/api';

interface Props {
  preSelectedServiceId?: number | null;
  onClearPreSelected?: () => void;
}

export const EventEnquirySection: React.FC<Props> = ({ preSelectedServiceId, onClearPreSelected }) => {
  const [services, setServices] = useState<PublicService[]>([]);
  const [selectedServiceIds, setSelectedServiceIds] = useState<number[]>([]);

  // Form State
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [eventType, setEventType] = useState('Wedding / Reception');
  const [eventDate, setEventDate] = useState('');
  const [eventTime, setEventTime] = useState('6:00 PM');
  const [venue, setVenue] = useState('');
  const [location, setLocation] = useState('');
  const [guestCount, setGuestCount] = useState('300 - 500 Guests');
  const [notes, setNotes] = useState('');

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [submissionSuccess, setSubmissionSuccess] = useState<PublicInquiryResponse | null>(null);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const data = await api.getPublicServices();
        setServices(data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchServices();
  }, []);

  // Pre-select service when passed from showcase
  useEffect(() => {
    if (preSelectedServiceId) {
      setSelectedServiceIds((prev) => (prev.includes(preSelectedServiceId) ? prev : [...prev, preSelectedServiceId]));
    }
  }, [preSelectedServiceId]);

  const toggleService = (id: number) => {
    setSelectedServiceIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!customerName.trim()) {
      setErrorMsg('Please enter your full name.');
      return;
    }
    const cleanPhone = customerPhone.replace(/\D/g, '');
    if (cleanPhone.length < 10) {
      setErrorMsg('Please enter a valid 10-digit mobile number for WhatsApp updates.');
      return;
    }
    if (!eventDate) {
      setErrorMsg('Please select your preferred event date.');
      return;
    }
    if (!venue.trim()) {
      setErrorMsg('Please specify the hall, venue, or general area.');
      return;
    }

    setLoading(true);
    try {
      const payload: PublicInquiryPayload = {
        customer_name: customerName.trim(),
        customer_phone: cleanPhone,
        event_type: eventType,
        event_date: eventDate,
        event_time: eventTime,
        venue: venue.trim(),
        location: location.trim() || undefined,
        guest_count: guestCount,
        selected_service_ids: selectedServiceIds,
        notes: notes.trim() || undefined,
      };

      const res = await api.submitPublicInquiry(payload);
      setSubmissionSuccess(res);
      if (onClearPreSelected) onClearPreSelected();
    } catch (err: any) {
      setErrorMsg(err.message || 'Unable to submit enquiry. Please try again or message us on WhatsApp.');
    } finally {
      setLoading(false);
    }
  };

  const eventTypesList = [
    'Wedding / Reception',
    'Sangeet / Mehendi',
    'Temple / Traditional Festival',
    'College Cultural / Fest',
    'Corporate Annual Gala',
    'Birthday / Milestone Celebration',
    'Private Concert / Music Event',
    'Other Special Event'
  ];

  const guestCountOptions = [
    'Under 150 Guests',
    '150 - 300 Guests',
    '300 - 500 Guests',
    '500 - 1,000 Guests',
    '1,000+ Large Arena'
  ];

  return (
    <section id="enquiry" className="relative py-24 sm:py-32 bg-obsidian-900 text-white border-t border-white/5 overflow-hidden">
      {/* Background Lighting */}
      <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-[600px] h-[600px] bg-cobalt-600/10 rounded-full blur-[160px] pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-[500px] h-[500px] bg-celebration-600/10 rounded-full blur-[150px] pointer-events-none" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto">
          <span className="text-xs font-bold tracking-widest uppercase text-celebration-400">
            Let's Make It Extraordinary
          </span>
          <h2 className="mt-3 text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight">
            Plan Your Event.
          </h2>
          <p className="mt-4 text-sm sm:text-base text-slate-300 leading-relaxed font-normal">
            Tell us about your celebration, venue, and required production services. Our event directors will verify equipment availability and contact you with a customized proposal.
          </p>
        </div>

        {/* Form Container */}
        <div className="mt-14 rounded-3xl bg-white/[0.02] border border-white/10 p-6 sm:p-10 lg:p-12 shadow-2xl backdrop-blur-xl">
          {submissionSuccess ? (
            /* Success Confirmation State */
            <div className="py-8 text-center flex flex-col items-center animate-in zoom-in-95 duration-300">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 mb-5 shadow-lg shadow-emerald-500/20">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Event Enquiry Received!
              </h3>

              <p className="mt-4 text-slate-300 max-w-lg leading-relaxed text-sm sm:text-base">
                Thank you, <strong className="text-white">{submissionSuccess.customer_name}</strong>. Our event production team has received your enquiry. We will review your date availability and contact you shortly with a customized proposal.
              </p>

              {/* Instant WhatsApp Dispatch CTA */}
              <div className="mt-8 flex flex-col sm:flex-row items-center gap-3.5">
                <a
                  href={submissionSuccess.whatsapp_url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 px-6 py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider text-white bg-emerald-600 hover:bg-emerald-500 shadow-lg shadow-emerald-600/30 transition-all"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Send Enquiry Directly on WhatsApp</span>
                </a>

                <button
                  onClick={() => {
                    setSubmissionSuccess(null);
                    setSelectedServiceIds([]);
                    setNotes('');
                  }}
                  className="px-5 py-3.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white bg-white/5 border border-white/10"
                >
                  Submit Another Enquiry
                </button>
              </div>
            </div>
          ) : (
            /* Active Form */
            <form onSubmit={handleSubmit} className="space-y-8">
              {errorMsg && (
                <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs sm:text-sm font-medium">
                  {errorMsg}
                </div>
              )}

              {/* 1. Occasion & Date */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-cobalt-600/30 text-cobalt-400 flex items-center justify-center text-[10px]">1</span>
                  Occasion & Timeline
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">Occasion Type</label>
                    <select
                      value={eventType}
                      onChange={(e) => setEventType(e.target.value)}
                      className="w-full px-3.5 py-3 rounded-xl bg-white/[0.04] border border-white/10 text-white text-xs sm:text-sm focus:border-cobalt-500 focus:outline-none focus:ring-1 focus:ring-cobalt-500"
                    >
                      {eventTypesList.map((type) => (
                        <option key={type} value={type} className="bg-slate-900 text-white">
                          {type}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">Event Date *</label>
                    <input
                      type="date"
                      value={eventDate}
                      onChange={(e) => setEventDate(e.target.value)}
                      required
                      className="w-full px-3.5 py-3 rounded-xl bg-white/[0.04] border border-white/10 text-white text-xs sm:text-sm focus:border-cobalt-500 focus:outline-none focus:ring-1 focus:ring-cobalt-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">Expected Guest Count</label>
                    <select
                      value={guestCount}
                      onChange={(e) => setGuestCount(e.target.value)}
                      className="w-full px-3.5 py-3 rounded-xl bg-white/[0.04] border border-white/10 text-white text-xs sm:text-sm focus:border-cobalt-500 focus:outline-none focus:ring-1 focus:ring-cobalt-500"
                    >
                      {guestCountOptions.map((g) => (
                        <option key={g} value={g} className="bg-slate-900 text-white">
                          {g}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* 2. Venue & Location */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-cobalt-600/30 text-cobalt-400 flex items-center justify-center text-[10px]">2</span>
                  Venue & Location
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">Hall / Venue Name *</label>
                    <input
                      type="text"
                      placeholder="e.g. Gokulam Park / Sri Krishna Mandapam"
                      value={venue}
                      onChange={(e) => setVenue(e.target.value)}
                      required
                      className="w-full px-3.5 py-3 rounded-xl bg-white/[0.04] border border-white/10 text-white text-xs sm:text-sm placeholder:text-slate-600 focus:border-cobalt-500 focus:outline-none focus:ring-1 focus:ring-cobalt-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">City / Area</label>
                    <input
                      type="text"
                      placeholder="e.g. Coimbatore, Trichy, Chennai, Salem"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      className="w-full px-3.5 py-3 rounded-xl bg-white/[0.04] border border-white/10 text-white text-xs sm:text-sm placeholder:text-slate-600 focus:border-cobalt-500 focus:outline-none focus:ring-1 focus:ring-cobalt-500"
                    />
                  </div>
                </div>
              </div>

              {/* 3. Services Checklist (STRICT ZERO PRICING) */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-cobalt-600/30 text-cobalt-400 flex items-center justify-center text-[10px]">3</span>
                    Select Interested Services (Optional)
                  </h4>
                  <span className="text-[11px] text-slate-500 font-medium">
                    {selectedServiceIds.length} Selected
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                  {services.map((s) => {
                    const isSelected = selectedServiceIds.includes(s.id);
                    return (
                      <button
                        type="button"
                        key={s.id}
                        onClick={() => toggleService(s.id)}
                        className={`flex items-start gap-2.5 p-3 rounded-xl text-left transition-all border ${
                          isSelected
                            ? 'bg-cobalt-600/20 border-cobalt-500/50 text-white shadow-sm'
                            : 'bg-white/[0.02] border-white/5 text-slate-400 hover:text-slate-200 hover:border-white/10'
                        }`}
                      >
                        <div
                          className={`w-4 h-4 rounded mt-0.5 flex items-center justify-center flex-shrink-0 border transition ${
                            isSelected ? 'bg-cobalt-600 border-cobalt-500 text-white' : 'border-slate-700 bg-transparent'
                          }`}
                        >
                          {isSelected && <CheckSquare className="w-3 h-3 stroke-[3]" />}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-xs font-bold leading-tight">{s.name}</span>
                          <span className="text-[10px] text-slate-500 mt-0.5">{s.category}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 4. Contact Information */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-cobalt-600/30 text-cobalt-400 flex items-center justify-center text-[10px]">4</span>
                  Your Contact Details
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">Full Name *</label>
                    <input
                      type="text"
                      placeholder="e.g. Rajesh Kumar"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      required
                      className="w-full px-3.5 py-3 rounded-xl bg-white/[0.04] border border-white/10 text-white text-xs sm:text-sm placeholder:text-slate-600 focus:border-cobalt-500 focus:outline-none focus:ring-1 focus:ring-cobalt-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">Phone / WhatsApp Number *</label>
                    <input
                      type="tel"
                      placeholder="e.g. 98401 23456"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      required
                      className="w-full px-3.5 py-3 rounded-xl bg-white/[0.04] border border-white/10 text-white text-xs sm:text-sm placeholder:text-slate-600 focus:border-cobalt-500 focus:outline-none focus:ring-1 focus:ring-cobalt-500"
                    />
                  </div>
                </div>

                <div className="mt-4">
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Additional Requirements or Questions
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Tell us about special entry music, preferred stage layout, or schedule requirements..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-white text-xs sm:text-sm placeholder:text-slate-600 focus:border-cobalt-500 focus:outline-none focus:ring-1 focus:ring-cobalt-500"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 rounded-2xl text-sm font-bold uppercase tracking-wider text-white bg-gradient-to-r from-cobalt-600 via-indigo-600 to-celebration-600 hover:from-cobalt-500 hover:to-celebration-500 shadow-xl shadow-cobalt-600/35 hover:shadow-celebration-600/35 transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Submitting Enquiry...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Submit Event Enquiry</span>
                    </>
                  )}
                </button>
                <p className="mt-3 text-center text-[11px] text-slate-500">
                  🔒 Zero spam guarantee. We only contact you regarding your specific event requirements.
                </p>
              </div>
            </form>
          )}
        </div>
      </div>
    </section>
  );
};
