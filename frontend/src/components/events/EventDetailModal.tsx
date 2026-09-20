import React, { useState, useEffect } from 'react';
import {
  X, Phone, MessageSquare, Calendar, MapPin, CheckSquare,
  Plus, Download, Share2, Trash2, TrendingUp, UserCheck, Tag
} from 'lucide-react';
import { Event, OrderStatus } from '../../types';
import { api } from '../../services/api';
import { StatusBadge } from '../common/StatusBadge';
import { PaymentBadge } from '../common/PaymentBadge';
import { CurrencyText } from '../common/CurrencyText';
import { PaymentModal } from './PaymentModal';
import { ExpenseModal } from './ExpenseModal';

interface Props {
  eventId: number | null;
  isOpen: boolean;
  onClose: () => void;
  onRefresh: () => void;
}

export const EventDetailModal: React.FC<Props> = ({ eventId, isOpen, onClose, onRefresh }) => {
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'checklist' | 'financials' | 'share'>('checklist');

  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [isExpenseOpen, setIsExpenseOpen] = useState(false);
  const [waTemplates, setWaTemplates] = useState<any>(null);

  const fetchDetail = async () => {
    if (!eventId) return;
    setLoading(true);
    try {
      const data = await api.getEventDetail(eventId);
      setEvent(data);
      const wa = await api.getWhatsAppTemplates(eventId);
      setWaTemplates(wa);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && eventId) {
      fetchDetail();
    }
  }, [isOpen, eventId]);

  if (!isOpen || !eventId) return null;

  const handleStatusChange = async (newStatus: OrderStatus) => {
    try {
      await api.updateEventStatus(eventId, newStatus);
      fetchDetail();
      onRefresh();
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleService = async (serviceId: number, currentStatus: string) => {
    try {
      const nextStatus = currentStatus === 'READY' ? 'PENDING' : 'READY';
      await api.updateServiceStatus(eventId, serviceId, nextStatus);
      fetchDetail();
      onRefresh();
    } catch (err) {
      console.error(err);
    }
  };

  const handleAssignStaff = async (serviceId: number, currentAssignee: string) => {
    const staff = prompt('Enter staff or vendor name for this service:', currentAssignee || '');
    if (staff === null) return;
    try {
      await api.updateServiceStatus(eventId, serviceId, 'PENDING', staff);
      fetchDetail();
    } catch (err) {
      console.error(err);
    }
  };

  const handleEditDiscount = async () => {
    const currentDiscount = event?.discount || 0;
    const input = prompt('Enter negotiated discount amount in ₹ (e.g. 7000):', String(currentDiscount));
    if (input === null) return;
    const newDiscount = parseFloat(input);
    if (isNaN(newDiscount) || newDiscount < 0) {
      alert('Please enter a valid positive number for discount.');
      return;
    }
    try {
      await api.updateEventDiscount(eventId, newDiscount);
      fetchDetail();
      onRefresh();
    } catch (err) {
      console.error(err);
      alert('Failed to update discount.');
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this event order? This cannot be undone.')) return;
    try {
      await api.deleteEvent(eventId);
      onRefresh();
      onClose();
    } catch (err) {
      console.error(err);
    }
  };

  const statuses: OrderStatus[] = ['NEW', 'CONFIRMED', 'PREPARING', 'READY', 'COMPLETED', 'CLOSED'];

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/85 p-0 sm:p-4 backdrop-blur-sm overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-t-3xl sm:rounded-2xl w-full max-w-2xl max-h-[92vh] flex flex-col text-slate-100 shadow-2xl">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-start justify-between gap-3 sticky top-0 bg-slate-900/95 backdrop-blur z-10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold uppercase text-emerald-400 tracking-wider">
                {event?.event_type || 'Event Hub'}
              </span>
              {event && <StatusBadge status={event.status} />}
              {event && <PaymentBadge status={event.payment_status} />}
            </div>
            <h2 className="text-xl font-bold text-white leading-tight">
              {event?.customer_name}
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDelete}
              className="p-2 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-lg transition"
              title="Delete Order"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button onClick={onClose} className="p-2 text-slate-400 hover:text-white rounded-lg">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        {loading || !event ? (
          <div className="p-12 text-center text-slate-400">Loading event details...</div>
        ) : (
          <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs sm:text-sm">
            {/* Quick Contact & Info Card */}
            <div className="bg-slate-800/70 p-3.5 rounded-2xl border border-slate-700/70 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 text-slate-200">
                  <Calendar className="w-4 h-4 text-emerald-400" />
                  <span className="font-bold">{event.event_date}</span>
                  {event.event_time && <span className="text-slate-400">({event.event_time})</span>}
                </div>
                <div className="flex items-center gap-2 text-slate-300">
                  <MapPin className="w-4 h-4 text-slate-400" />
                  <span>{event.venue}{event.location ? `, ${event.location}` : ''}</span>
                </div>
              </div>

              <div className="flex items-center justify-start sm:justify-end gap-2">
                <a
                  href={`tel:${event.customer_phone}`}
                  className="flex items-center gap-1.5 px-3 py-2 bg-slate-700 hover:bg-slate-600 rounded-xl text-white font-semibold transition"
                >
                  <Phone className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Call</span>
                </a>
                {waTemplates?.confirmation?.url && (
                  <a
                    href={waTemplates.confirmation.url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-500 rounded-xl text-white font-bold transition"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>WhatsApp</span>
                  </a>
                )}
              </div>
            </div>

            {/* Status Workflow Selector */}
            <div className="bg-slate-800/40 p-3 rounded-2xl border border-slate-700/60">
              <label className="block text-[11px] font-semibold text-slate-400 mb-1.5">
                Operational Lifecycle Status
              </label>
              <div className="flex flex-wrap gap-1">
                {statuses.map((s) => (
                  <button
                    key={s}
                    onClick={() => handleStatusChange(s)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                      event.status === s
                        ? 'bg-emerald-500 text-slate-950 font-bold'
                        : 'bg-slate-800/80 text-slate-400 hover:text-slate-200 border border-slate-700'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Financial Overview Banner with Subtotal & Discount */}
            <div className="bg-slate-800/90 p-3.5 rounded-2xl border border-slate-700 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-300">Financial Summary</span>
                <button
                  type="button"
                  onClick={handleEditDiscount}
                  className="text-[11px] text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30"
                >
                  <Tag className="w-3 h-3" />
                  {(event.discount || 0) > 0 ? `Discount: -₹${event.discount}` : '+ Add Discount / Offer'}
                </button>
              </div>

              {(event.discount || 0) > 0 && (
                <div className="flex items-center justify-between text-xs text-slate-400 pb-1 border-b border-slate-700/50">
                  <span>Services Subtotal: <CurrencyText amount={event.services_subtotal || event.total_amount} className="font-semibold text-slate-200" /></span>
                  <span className="text-rose-400 font-semibold">Offer: -<CurrencyText amount={event.discount || 0} /></span>
                </div>
              )}

              <div className="grid grid-cols-3 gap-2 text-center pt-1">
                <div>
                  <p className="text-[10px] text-slate-400 uppercase font-bold">Final Total</p>
                  <CurrencyText amount={event.total_amount} className="font-extrabold text-white text-sm sm:text-base" />
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 uppercase font-bold">Advance Paid</p>
                  <CurrencyText amount={event.advance_paid} className="font-extrabold text-emerald-400 text-sm sm:text-base" />
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 uppercase font-bold">Balance Due</p>
                  <CurrencyText
                    amount={event.balance_due}
                    className={`font-extrabold text-sm sm:text-base ${
                      event.balance_due > 0 ? 'text-rose-400' : 'text-emerald-400'
                    }`}
                  />
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-slate-800 gap-4 text-xs sm:text-sm">
              <button
                onClick={() => setActiveTab('checklist')}
                className={`pb-2 font-bold transition ${
                  activeTab === 'checklist'
                    ? 'text-emerald-400 border-b-2 border-emerald-400'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Service Checklist ({event.services?.length || 0})
              </button>
              <button
                onClick={() => setActiveTab('financials')}
                className={`pb-2 font-bold transition ${
                  activeTab === 'financials'
                    ? 'text-emerald-400 border-b-2 border-emerald-400'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Payments & Expenses
              </button>
              <button
                onClick={() => setActiveTab('share')}
                className={`pb-2 font-bold transition ${
                  activeTab === 'share'
                    ? 'text-emerald-400 border-b-2 border-emerald-400'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Bill & WhatsApp Share
              </button>
            </div>

            {/* Tab 1: Checklist */}
            {activeTab === 'checklist' && (
              <div className="space-y-2.5">
                <p className="text-[11px] text-slate-400">
                  Tap checkbox to mark service ready. Tap staff name to assign crew/vendor.
                </p>

                {event.services?.map((s) => (
                  <div
                    key={s.id}
                    className={`p-3 rounded-xl border flex items-center justify-between gap-3 transition ${
                      s.status === 'READY'
                        ? 'bg-emerald-950/20 border-emerald-500/40 text-slate-300'
                        : 'bg-slate-800/60 border-slate-700/60 text-white'
                    }`}
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <button
                        onClick={() => handleToggleService(s.id!, s.status)}
                        className={`w-5 h-5 rounded flex items-center justify-center border transition ${
                          s.status === 'READY'
                            ? 'bg-emerald-500 border-emerald-500 text-slate-950 font-black'
                            : 'border-slate-500 bg-slate-900'
                        }`}
                      >
                        {s.status === 'READY' && <CheckSquare className="w-4 h-4 stroke-[3]" />}
                      </button>

                      <div className="truncate">
                        <p className={`font-bold text-xs sm:text-sm ${s.status === 'READY' ? 'line-through text-slate-400' : 'text-white'}`}>
                          {s.service_name}
                        </p>
                        <button
                          onClick={() => handleAssignStaff(s.id!, s.assigned_to || '')}
                          className="text-[11px] text-emerald-400/90 hover:underline flex items-center gap-1 mt-0.5"
                        >
                          <UserCheck className="w-3 h-3 inline" />
                          {s.assigned_to ? `Assigned: ${s.assigned_to}` : '+ Assign vendor/crew'}
                        </button>
                      </div>
                    </div>

                    <div className="text-right flex-shrink-0">
                      <CurrencyText amount={s.agreed_price * s.quantity} className="font-bold text-white text-xs sm:text-sm" />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Tab 2: Financials (Payments + Expenses + Profit) */}
            {activeTab === 'financials' && (
              <div className="space-y-4">
                {/* Profit Box */}
                <div className="bg-slate-800/70 p-3.5 rounded-2xl border border-slate-700 flex items-center justify-between">
                  <div>
                    <span className="text-[11px] text-slate-400 font-semibold uppercase">Estimated Event Profit</span>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <TrendingUp className="w-4 h-4 text-emerald-400" />
                      <CurrencyText amount={event.estimated_profit || 0} className="font-black text-lg text-emerald-400" />
                    </div>
                  </div>
                  <div className="text-right text-[11px] text-slate-400">
                    <p>Revenue: <CurrencyText amount={event.total_amount} className="font-semibold text-white" /></p>
                    <p>Expenses: <CurrencyText amount={event.total_expense || 0} className="font-semibold text-rose-400" /></p>
                  </div>
                </div>

                {/* Payments Section */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-slate-200">Payments Recorded ({event.payments?.length || 0})</h4>
                    <button
                      onClick={() => setIsPaymentOpen(true)}
                      className="px-2.5 py-1 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold rounded-lg text-xs flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5 stroke-[3]" /> Record Payment
                    </button>
                  </div>

                  {event.payments && event.payments.length > 0 ? (
                    event.payments.map((p) => (
                      <div key={p.id} className="p-2.5 bg-slate-800/40 rounded-xl border border-slate-700/60 flex items-center justify-between text-xs">
                        <div>
                          <span className="font-bold text-white">{p.payment_method}</span>
                          <span className="text-slate-400 ml-2">{p.payment_date}</span>
                          {p.notes && <p className="text-[11px] text-slate-400">{p.notes}</p>}
                        </div>
                        <CurrencyText amount={p.amount} className="font-extrabold text-emerald-400 text-sm" />
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-slate-500 italic">No payments recorded yet.</p>
                  )}
                </div>

                {/* Expenses Section */}
                <div className="space-y-2 pt-2 border-t border-slate-800">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-slate-200">Direct Event Expenses ({event.expenses?.length || 0})</h4>
                    <button
                      onClick={() => setIsExpenseOpen(true)}
                      className="px-2.5 py-1 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 font-bold rounded-lg text-xs flex items-center gap-1 border border-rose-500/30"
                    >
                      <Plus className="w-3.5 h-3.5 stroke-[3]" /> Add Expense
                    </button>
                  </div>

                  {event.expenses && event.expenses.length > 0 ? (
                    event.expenses.map((e) => (
                      <div key={e.id} className="p-2.5 bg-slate-800/40 rounded-xl border border-slate-700/60 flex items-center justify-between text-xs">
                        <div>
                          <span className="font-bold text-rose-300">{e.category}</span>
                          {e.description && <span className="text-slate-300 ml-2">{e.description}</span>}
                          <span className="text-slate-500 ml-2">({e.date})</span>
                        </div>
                        <CurrencyText amount={e.amount} className="font-extrabold text-rose-400 text-sm" />
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-slate-500 italic">No expenses recorded for this event yet.</p>
                  )}
                </div>
              </div>
            )}

            {/* Tab 3: Share & Billing */}
            {activeTab === 'share' && (
              <div className="space-y-4">
                <div className="bg-slate-800/80 p-4 rounded-2xl border border-slate-700 flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-white">Event Bill / Invoice PDF</h4>
                    <p className="text-xs text-slate-400">Professional itemized invoice with discount breakdown & UPI details</p>
                  </div>
                  <a
                    href={api.getInvoicePdfUrl(event.id)}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold rounded-xl text-xs transition"
                  >
                    <Download className="w-4 h-4 stroke-[2.5]" />
                    <span>Download PDF</span>
                  </a>
                </div>

                {waTemplates && (
                  <div className="space-y-3">
                    <h4 className="font-bold text-slate-200">1-Tap WhatsApp Messages</h4>

                    <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/60 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-white text-xs">Send Event Bill to Client</span>
                        <a
                          href={waTemplates.bill.url}
                          target="_blank"
                          rel="noreferrer"
                          className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition flex items-center gap-1"
                        >
                          <Share2 className="w-3.5 h-3.5" /> WhatsApp Bill
                        </a>
                      </div>
                      <p className="text-[11px] text-slate-400 font-mono bg-slate-900/60 p-2 rounded-lg whitespace-pre-line line-clamp-3">
                        {waTemplates.bill.text}
                      </p>
                    </div>

                    {event.balance_due > 0 && (
                      <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/60 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-rose-300 text-xs">Send Balance Due Reminder</span>
                          <a
                            href={waTemplates.payment_reminder.url}
                            target="_blank"
                            rel="noreferrer"
                            className="px-3 py-1 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-bold transition flex items-center gap-1"
                          >
                            <Share2 className="w-3.5 h-3.5" /> Remind Client
                          </a>
                        </div>
                        <p className="text-[11px] text-slate-400 font-mono bg-slate-900/60 p-2 rounded-lg whitespace-pre-line line-clamp-3">
                          {waTemplates.payment_reminder.text}
                        </p>
                      </div>
                    )}

                    <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/60 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-white text-xs">Send Dispatch Brief to Crew</span>
                        <a
                          href={waTemplates.crew_brief.url}
                          target="_blank"
                          rel="noreferrer"
                          className="px-3 py-1 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-xs font-bold transition flex items-center gap-1"
                        >
                          <Share2 className="w-3.5 h-3.5" /> Share with Team
                        </a>
                      </div>
                      <p className="text-[11px] text-slate-400 font-mono bg-slate-900/60 p-2 rounded-lg whitespace-pre-line line-clamp-3">
                        {waTemplates.crew_brief.text}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      <PaymentModal
        isOpen={isPaymentOpen}
        onClose={() => setIsPaymentOpen(false)}
        balanceDue={event?.balance_due || 0}
        onRecord={async (amount, date, method, notes) => {
          await api.recordPayment(eventId, amount, date, method, notes);
          fetchDetail();
          onRefresh();
        }}
      />

      <ExpenseModal
        isOpen={isExpenseOpen}
        onClose={() => setIsExpenseOpen(false)}
        onRecord={async (amount, category, description, date) => {
          await api.recordExpense(eventId, amount, category, description, date);
          fetchDetail();
          onRefresh();
        }}
      />
    </div>
  );
};
