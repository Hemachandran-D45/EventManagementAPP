import React, { useState, useEffect } from 'react';
import { X, Plus, Check, Sparkles, Clock, MapPin, Phone, User, Tag } from 'lucide-react';
import { Service, QuickOrderPayload, PaymentMethod } from '../../types';
import { api } from '../../services/api';
import { CurrencyText } from '../common/CurrencyText';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onOrderCreated: () => void;
}

interface SelectedServiceState {
  service_id?: number;
  service_name: string;
  default_price: number;
  agreed_price: number;
  quantity: number;
  selected: boolean;
}

export const QuickAddOrderModal: React.FC<Props> = ({ isOpen, onClose, onOrderCreated }) => {
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');

  const [eventType, setEventType] = useState('Wedding');
  const [customEventType, setCustomEventType] = useState('');
  const [eventDate, setEventDate] = useState(new Date().toISOString().split('T')[0]);
  const [eventTime, setEventTime] = useState('7:00 PM');
  const [venue, setVenue] = useState('');
  const [location, setLocation] = useState('');

  const [services, setServices] = useState<SelectedServiceState[]>([]);
  const [discount, setDiscount] = useState<number>(0);
  const [advanceAmount, setAdvanceAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('UPI');
  const [notes, setNotes] = useState('');

  const [loading, setLoading] = useState(false);
  const [catalogLoading, setCatalogLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setCatalogLoading(true);
      api.getServices()
        .then((catalog) => {
          setServices(
            catalog.map((srv) => ({
              service_id: srv.id,
              service_name: srv.name,
              default_price: srv.default_price,
              agreed_price: srv.default_price,
              quantity: 1,
              selected: false
            }))
          );
        })
        .catch(console.error)
        .finally(() => setCatalogLoading(false));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const toggleService = (id?: number) => {
    setServices((prev) =>
      prev.map((s) => (s.service_id === id ? { ...s, selected: !s.selected } : s))
    );
  };

  const updateAgreedPrice = (id: number | undefined, price: number) => {
    setServices((prev) =>
      prev.map((s) => (s.service_id === id ? { ...s, agreed_price: price } : s))
    );
  };

  const selectedServices = services.filter((s) => s.selected);
  const servicesSubtotal = selectedServices.reduce(
    (acc, s) => acc + (s.agreed_price || 0) * (s.quantity || 1),
    0
  );
  const finalTotal = Math.max(0, servicesSubtotal - (discount || 0));
  const balanceDue = Math.max(0, finalTotal - (advanceAmount || 0));

  const eventTypes = ['Wedding', 'Reception', 'Birthday', 'Temple Festival', 'Corporate Gala', 'Sangeet', 'Engagement', 'Other'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !customerPhone || !venue) {
      alert('Please fill customer name, phone number, and venue.');
      return;
    }

    if (selectedServices.length === 0) {
      alert('Please select at least one service for this order.');
      return;
    }

    const finalEventType = eventType === 'Other' ? (customEventType.trim() || 'Special Occasion') : eventType;

    setLoading(true);
    try {
      const payload: QuickOrderPayload = {
        customer_name: customerName.trim(),
        customer_phone: customerPhone.trim(),
        customer_address: customerAddress.trim() || undefined,
        event_type: finalEventType,
        event_date: eventDate,
        event_time: eventTime,
        venue: venue.trim(),
        location: location.trim() || undefined,
        services: selectedServices.map((s) => ({
          service_id: s.service_id,
          service_name: s.service_name,
          quantity: s.quantity,
          agreed_price: s.agreed_price
        })),
        discount: Number(discount) || 0,
        advance_amount: Number(advanceAmount) || 0,
        payment_method: paymentMethod,
        notes: notes.trim() || undefined
      };

      await api.createQuickOrder(payload);
      onOrderCreated();
      onClose();
    } catch (err) {
      console.error(err);
      alert('Error creating order. Please check backend connection.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/85 p-0 sm:p-4 backdrop-blur-md overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-t-3xl sm:rounded-3xl w-full max-w-2xl max-h-[92vh] flex flex-col text-slate-100 shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between sticky top-0 bg-slate-900/95 backdrop-blur z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-rose-500 flex items-center justify-center shadow-lg shadow-blue-500/20 flex-shrink-0">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-white leading-tight">Create New Event Order</h2>
              <p className="text-xs text-slate-400">Fast client entry with services, discount & advance</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-700 rounded-xl transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 text-sm">
          {/* Customer section */}
          <div className="bg-slate-800/60 p-4 sm:p-5 rounded-3xl border border-slate-700/60 space-y-4">
            <h3 className="font-bold text-white flex items-center gap-2 text-sm sm:text-base">
              <div className="w-7 h-7 rounded-lg bg-blue-500/20 flex items-center justify-center">
                <User className="w-4 h-4 text-blue-400" />
              </div>
              Customer Information
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">Customer Name *</label>
                <input
                  type="text"
                  required
                  placeholder="Enter customer name"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3.5 py-2.5 sm:py-3 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">Phone Number *</label>
                <input
                  type="tel"
                  required
                  placeholder="Enter 10-digit mobile number"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3.5 py-2.5 sm:py-3 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">Client City / Address (optional)</label>
              <input
                type="text"
                placeholder="e.g. Coimbatore, Tamil Nadu"
                value={customerAddress}
                onChange={(e) => setCustomerAddress(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Event details */}
          <div className="bg-slate-800/60 p-4 sm:p-5 rounded-3xl border border-slate-700/60 space-y-4">
            <h3 className="font-bold text-white flex items-center gap-2 text-sm sm:text-base">
              <div className="w-7 h-7 rounded-lg bg-indigo-500/20 flex items-center justify-center">
                <Clock className="w-4 h-4 text-indigo-400" />
              </div>
              Event Schedule & Venue
            </h3>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-2">Event Type / Occasion</label>
              <div className="flex flex-wrap gap-2">
                {eventTypes.map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setEventType(type)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition shadow-sm ${
                      eventType === type
                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/25 border border-blue-400/40'
                        : 'bg-slate-900/80 text-slate-300 border border-slate-700/80 hover:border-slate-500 hover:text-white'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
              {eventType === 'Other' && (
                <div className="mt-3">
                  <input
                    type="text"
                    required
                    placeholder="Type custom occasion (e.g. Baby Shower, House Warming, Concert, Anniversary...)"
                    value={customEventType}
                    onChange={(e) => setCustomEventType(e.target.value)}
                    className="w-full bg-slate-900 border border-blue-500 rounded-xl px-3.5 py-2.5 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400 shadow-inner"
                    autoFocus
                  />
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">Event Date *</label>
                <input
                  type="date"
                  required
                  value={eventDate}
                  onChange={(e) => setEventDate(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3.5 py-2.5 sm:py-3 text-white focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">Event Time</label>
                <input
                  type="text"
                  placeholder="7:00 PM"
                  value={eventTime}
                  onChange={(e) => setEventTime(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3.5 py-2.5 sm:py-3 text-white focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">Venue / Hall *</label>
                <input
                  type="text"
                  required
                  placeholder="Enter venue / hall name"
                  value={venue}
                  onChange={(e) => setVenue(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3.5 py-2.5 sm:py-3 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">City / Location</label>
                <input
                  type="text"
                  placeholder="Enter city / location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3.5 py-2.5 sm:py-3 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Services Selection */}
          <div className="bg-slate-800/60 p-4 sm:p-5 rounded-3xl border border-slate-700/60 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-white text-sm sm:text-base">
                Select Services ({selectedServices.length} chosen)
              </h3>
              <span className="text-xs text-slate-400 font-medium">Edit price per event</span>
            </div>

            {catalogLoading ? (
              <p className="text-slate-400 py-4 text-center">Loading services catalog...</p>
            ) : (
              <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
                {services.map((s) => (
                  <div
                    key={s.service_id}
                    className={`flex items-center justify-between p-3 rounded-2xl border transition ${
                      s.selected
                        ? 'bg-blue-950/40 border-blue-500/50 shadow-sm'
                        : 'bg-slate-900/70 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <label className="flex items-center gap-3 cursor-pointer flex-1">
                      <input
                        type="checkbox"
                        checked={s.selected}
                        onChange={() => toggleService(s.service_id)}
                        className="w-4 h-4 rounded text-blue-600 accent-blue-500"
                      />
                      <span className={`font-semibold text-xs sm:text-sm ${s.selected ? 'text-white' : 'text-slate-300'}`}>
                        {s.service_name}
                      </span>
                    </label>

                    {s.selected && (
                      <div className="flex items-center gap-1.5 ml-2">
                        <span className="text-slate-400 text-xs font-bold">₹</span>
                        <input
                          type="number"
                          value={s.agreed_price}
                          onChange={(e) => updateAgreedPrice(s.service_id, Number(e.target.value))}
                          className="w-24 bg-slate-800 border border-blue-500/60 rounded-xl px-2.5 py-1 text-right text-blue-300 font-bold focus:outline-none focus:border-blue-400 text-xs sm:text-sm"
                        />
                      </div>
                    )}

                    {!s.selected && (
                      <span className="text-slate-500 text-xs font-medium">
                        ₹{s.default_price.toLocaleString('en-IN')}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Financial summary with Subtotal, Discount/Negotiation, Final Total, Advance & Balance */}
          <div className="bg-slate-800/90 p-4 sm:p-5 rounded-3xl border border-slate-700 space-y-3.5">
            <div className="flex items-center justify-between">
              <h3 className="font-black text-white text-sm sm:text-base">Financials & Pricing</h3>
              <span className="text-xs text-amber-400 font-bold flex items-center gap-1 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/25">
                <Tag className="w-3.5 h-3.5" /> Special Offer / Discount
              </span>
            </div>

            {/* Subtotal */}
            <div className="flex items-center justify-between py-1.5 border-b border-slate-700/60 text-xs sm:text-sm">
              <span className="text-slate-400 font-medium">Services Subtotal:</span>
              <CurrencyText amount={servicesSubtotal} className="font-extrabold text-slate-200 text-sm sm:text-base" />
            </div>

            {/* Discount / Negotiation Input */}
            <div className="bg-slate-900/90 p-3 rounded-2xl border border-slate-700/80 flex items-center justify-between gap-3">
              <div>
                <label className="block text-xs font-bold text-amber-400">
                  Discount / Offer Amount (₹)
                </label>
                <p className="text-[11px] text-slate-400">Negotiated reduction off total</p>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-rose-400 font-bold text-sm sm:text-base">- ₹</span>
                <input
                  type="number"
                  placeholder="0"
                  min="0"
                  value={discount || ''}
                  onChange={(e) => setDiscount(Number(e.target.value))}
                  className="w-28 bg-slate-800 border border-amber-500/60 rounded-xl px-3 py-1.5 text-right text-rose-400 font-black text-sm sm:text-base focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>

            {/* Final Payable Total */}
            <div className="flex items-center justify-between py-2.5 px-3.5 bg-blue-950/40 rounded-2xl border border-blue-500/40">
              <span className="text-blue-300 font-extrabold uppercase text-xs tracking-wider">Final Agreed Total:</span>
              <CurrencyText amount={finalTotal} className="font-black text-white text-base sm:text-lg" />
            </div>

            {/* Advance & Payment Method */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  Advance Received (₹)
                </label>
                <input
                  type="number"
                  placeholder="0"
                  value={advanceAmount || ''}
                  onChange={(e) => setAdvanceAmount(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3.5 py-2.5 sm:py-3 text-white font-bold text-sm focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">Payment Method</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                  className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3.5 py-2.5 sm:py-3 text-white text-sm focus:outline-none focus:border-blue-500"
                >
                  <option value="UPI">UPI (GPay / PhonePe / Paytm)</option>
                  <option value="CASH">Cash</option>
                  <option value="BANK_TRANSFER">Bank Transfer</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>
            </div>

            {/* Balance Due */}
            <div className="flex items-center justify-between pt-2.5 border-t border-slate-700/60">
              <span className="text-slate-300 font-bold text-xs sm:text-sm">Pending Balance Due:</span>
              <CurrencyText
                amount={balanceDue}
                className={`font-black text-sm sm:text-base ${balanceDue > 0 ? 'text-rose-400' : 'text-emerald-400'}`}
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">
              Notes & Special Instructions (optional)
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Needs sound check at 5:00 PM, bride entry song queue, dry ice 15kg..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700/80 rounded-2xl p-3 text-white text-xs sm:text-sm placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Submit */}
          <div className="sticky bottom-0 bg-slate-900 pt-3 pb-1">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-rose-600 hover:from-blue-500 hover:to-rose-500 text-white font-black rounded-2xl text-sm sm:text-base transition-all flex items-center justify-center gap-2 shadow-xl shadow-blue-900/30 active:scale-[0.99] border border-white/20"
            >
              <Check className="w-5 h-5 stroke-[3]" />
              <span>{loading ? 'Creating Order...' : 'Confirm & Save Event Order'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
