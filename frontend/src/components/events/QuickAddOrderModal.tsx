import React, { useState, useEffect } from 'react';
import { X, Check, Clock, User, Sparkles, Tag } from 'lucide-react';
import { Service, QuickOrderPayload, PaymentMethod } from '../../types';
import { api } from '../../services/api';
import { CurrencyText } from '../common/CurrencyText';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onOrderCreated: () => void;
}

interface SelectedServiceState {
  service_id: number;
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
  const [eventDate, setEventDate] = useState(new Date().toISOString().split('T')[0]);
  const [eventTime, setEventTime] = useState('7:00 PM');
  const [venue, setVenue] = useState('');
  const [location, setLocation] = useState('Trichy');

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
        .then((items) => {
          setServices(
            items.map((s) => ({
              service_id: s.id,
              service_name: s.name,
              default_price: s.default_price,
              agreed_price: s.default_price,
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

  const toggleService = (id: number) => {
    setServices((prev) =>
      prev.map((s) => (s.service_id === id ? { ...s, selected: !s.selected } : s))
    );
  };

  const updateAgreedPrice = (id: number, price: number) => {
    setServices((prev) =>
      prev.map((s) => (s.service_id === id ? { ...s, agreed_price: price } : s))
    );
  };

  const selectedServices = services.filter((s) => s.selected);
  const servicesSubtotal = selectedServices.reduce((sum, s) => sum + s.agreed_price * s.quantity, 0);
  const finalTotal = Math.max(0, servicesSubtotal - (discount || 0));
  const balanceDue = Math.max(0, finalTotal - (advanceAmount || 0));

  const eventTypes = ['Wedding', 'Reception', 'Birthday', 'Temple Festival', 'Corporate Gala', 'Sangeet', 'Engagement'];

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

    setLoading(true);
    try {
      const payload: QuickOrderPayload = {
        customer_name: customerName.trim(),
        customer_phone: customerPhone.trim(),
        customer_address: customerAddress.trim() || undefined,
        event_type: eventType,
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
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/85 p-0 sm:p-4 backdrop-blur-sm overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-t-3xl sm:rounded-2xl w-full max-w-xl max-h-[92vh] flex flex-col text-slate-100 shadow-2xl">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between sticky top-0 bg-slate-900/95 backdrop-blur z-10">
          <div>
            <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-bold tracking-wide uppercase">
              <Sparkles className="w-3.5 h-3.5" /> Fast Order Entry (&lt;1 min)
            </div>
            <h2 className="text-lg font-bold text-white leading-tight">Create New Event Order</h2>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 space-y-4 text-xs sm:text-sm">
          {/* Customer section */}
          <div className="bg-slate-800/60 p-3.5 rounded-2xl border border-slate-700/60 space-y-3">
            <h3 className="font-bold text-slate-200 flex items-center gap-1.5">
              <User className="w-4 h-4 text-emerald-400" /> Customer Information
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">Customer Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rajesh Kumar"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">Phone Number *</label>
                <input
                  type="tel"
                  required
                  placeholder="e.g. 9876543210"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>
          </div>

          {/* Event details */}
          <div className="bg-slate-800/60 p-3.5 rounded-2xl border border-slate-700/60 space-y-3">
            <h3 className="font-bold text-slate-200 flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-emerald-400" /> Event Schedule & Venue
            </h3>

            <div>
              <label className="block text-[11px] font-semibold text-slate-400 mb-1.5">Event Type</label>
              <div className="flex flex-wrap gap-1.5">
                {eventTypes.map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setEventType(type)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                      eventType === type
                        ? 'bg-emerald-500 text-slate-950 shadow'
                        : 'bg-slate-800 text-slate-300 border border-slate-700 hover:border-slate-500'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">Event Date *</label>
                <input
                  type="date"
                  required
                  value={eventDate}
                  onChange={(e) => setEventDate(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">Event Time</label>
                <input
                  type="text"
                  placeholder="7:00 PM"
                  value={eventTime}
                  onChange={(e) => setEventTime(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">Venue / Hall *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. SRM Grand Mahal"
                  value={venue}
                  onChange={(e) => setVenue(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">City / Location</label>
                <input
                  type="text"
                  placeholder="e.g. Trichy"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>
          </div>

          {/* Services Selection */}
          <div className="bg-slate-800/60 p-3.5 rounded-2xl border border-slate-700/60 space-y-2.5">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-200">
                Select Services ({selectedServices.length} chosen)
              </h3>
              <span className="text-[11px] text-slate-400">Edit price per event</span>
            </div>

            {catalogLoading ? (
              <p className="text-slate-400 py-3 text-center">Loading services catalog...</p>
            ) : (
              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {services.map((s) => (
                  <div
                    key={s.service_id}
                    className={`flex items-center justify-between p-2.5 rounded-xl border transition ${
                      s.selected
                        ? 'bg-emerald-950/40 border-emerald-500/50'
                        : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <label className="flex items-center gap-2.5 cursor-pointer flex-1">
                      <input
                        type="checkbox"
                        checked={s.selected}
                        onChange={() => toggleService(s.service_id)}
                        className="w-4 h-4 rounded text-emerald-500 accent-emerald-500"
                      />
                      <span className={`font-semibold ${s.selected ? 'text-white' : 'text-slate-300'}`}>
                        {s.service_name}
                      </span>
                    </label>

                    {s.selected && (
                      <div className="flex items-center gap-1.5">
                        <span className="text-slate-400 text-xs">₹</span>
                        <input
                          type="number"
                          value={s.agreed_price}
                          onChange={(e) => updateAgreedPrice(s.service_id, Number(e.target.value))}
                          className="w-20 bg-slate-800 border border-slate-600 rounded-lg px-2 py-1 text-right text-emerald-400 font-bold focus:outline-none focus:border-emerald-400 text-xs"
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
          <div className="bg-slate-800/90 p-4 rounded-2xl border border-slate-700 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-200">Financials & Negotiation</h3>
              <span className="text-[11px] text-slate-400 flex items-center gap-1">
                <Tag className="w-3 h-3 text-amber-400" /> Friends & Family Discount
              </span>
            </div>

            {/* Subtotal */}
            <div className="flex items-center justify-between py-1 border-b border-slate-700/60 text-xs">
              <span className="text-slate-400">Services Subtotal:</span>
              <CurrencyText amount={servicesSubtotal} className="font-bold text-slate-200 text-sm" />
            </div>

            {/* Discount / Negotiation Input */}
            <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-700/80 flex items-center justify-between gap-2">
              <div>
                <label className="block text-[11px] font-bold text-amber-400">
                  Discount / Offer / Negotiation (₹)
                </label>
                <p className="text-[10px] text-slate-400">Negotiated reduction off total</p>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-rose-400 font-bold text-sm">- ₹</span>
                <input
                  type="number"
                  placeholder="0"
                  min="0"
                  value={discount || ''}
                  onChange={(e) => setDiscount(Number(e.target.value))}
                  className="w-24 bg-slate-800 border border-amber-500/50 rounded-lg px-2.5 py-1 text-right text-rose-400 font-black text-sm focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>

            {/* Final Payable Total */}
            <div className="flex items-center justify-between py-1.5 px-2.5 bg-emerald-950/30 rounded-xl border border-emerald-500/30 text-xs">
              <span className="text-emerald-300 font-bold uppercase tracking-wide">Final Agreed Total:</span>
              <CurrencyText amount={finalTotal} className="font-extrabold text-emerald-400 text-base" />
            </div>

            {/* Advance & Payment Method */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                  Advance Received (₹)
                </label>
                <input
                  type="number"
                  placeholder="0"
                  value={advanceAmount || ''}
                  onChange={(e) => setAdvanceAmount(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold text-sm focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">Payment Method</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-emerald-500"
                >
                  <option value="UPI">UPI (GPay/PhonePe)</option>
                  <option value="CASH">Cash</option>
                  <option value="BANK_TRANSFER">Bank Transfer</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>
            </div>

            {/* Balance Due */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-700/60">
              <span className="text-slate-300 font-semibold text-xs">Pending Balance:</span>
              <CurrencyText
                amount={balanceDue}
                className={`font-black text-sm ${balanceDue > 0 ? 'text-rose-400' : 'text-emerald-400'}`}
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-400 mb-1">
              Notes & Special Instructions (optional)
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Needs sound check at 5:00 PM, bride entry song queue, dry ice 15kg..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Submit */}
          <div className="sticky bottom-0 bg-slate-900 pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black rounded-xl text-sm transition flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25 active:scale-[0.99]"
            >
              <Check className="w-5 h-5 stroke-[3]" />
              <span>{loading ? 'Creating Order...' : 'Confirm & Save Order'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
