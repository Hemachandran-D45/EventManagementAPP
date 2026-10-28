import React, { useState, useEffect, useRef } from 'react';
import {
  X, Phone, MessageSquare, Calendar, MapPin, CheckSquare,
  Plus, Download, Share2, Trash2, TrendingUp, UserCheck, Tag, FileText, Loader2,
  Edit2, CheckCircle2, ShieldCheck, Calculator, Paperclip, Image as ImageIcon,
  Upload, Handshake, Check
} from 'lucide-react';
import { Event, OrderStatus, Expense, PaymentMethod } from '../../types';
import { api } from '../../services/api';
import { StatusBadge } from '../common/StatusBadge';
import { PaymentBadge } from '../common/PaymentBadge';
import { CurrencyText } from '../common/CurrencyText';
import { PaymentModal } from './PaymentModal';
import { ExpenseModal } from './ExpenseModal';
import { FinalSettleModal } from './FinalSettleModal';

interface Props {
  eventId: number | null;
  isOpen: boolean;
  onClose: () => void;
  onRefresh: () => void;
}

export const EventDetailModal: React.FC<Props> = ({ eventId, isOpen, onClose, onRefresh }) => {
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'checklist' | 'financials' | 'attachments' | 'share'>('checklist');

  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [isFinalSettleOpen, setIsFinalSettleOpen] = useState(false);
  const [isExpenseOpen, setIsExpenseOpen] = useState(false);
  const [selectedExpenseToEdit, setSelectedExpenseToEdit] = useState<Expense | null>(null);
  const [waTemplates, setWaTemplates] = useState<any>(null);
  const [downloadingType, setDownloadingType] = useState<'invoice' | 'estimate' | null>(null);
  const [sharingType, setSharingType] = useState<'invoice' | 'estimate' | null>(null);

  // Tasks state
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [creatingTask, setCreatingTask] = useState(false);

  // Attachments state
  const [uploadingAttachment, setUploadingAttachment] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDownloadPdf = async (type: 'invoice' | 'estimate') => {
    if (!event) return;
    try {
      setDownloadingType(type);
      const url = type === 'invoice' ? api.getInvoicePdfUrl(event.id) : api.getEstimatePdfUrl(event.id);
      const filename = `DD_Events_${type === 'invoice' ? 'Invoice' : 'Estimate'}_${event.id}_${(event.customer_name || 'Client').replace(/\s+/g, '_')}.pdf`;
      
      const blob = await api.downloadPdfBlob(url);
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => window.URL.revokeObjectURL(blobUrl), 1000);
    } catch (err) {
      console.error('Download error:', err);
      window.open(type === 'invoice' ? api.getInvoicePdfUrl(event.id) : api.getEstimatePdfUrl(event.id), '_blank');
    } finally {
      setDownloadingType(null);
    }
  };

  const handleSharePdf = async (type: 'invoice' | 'estimate') => {
    if (!event) return;
    const template = type === 'invoice' ? waTemplates?.bill : waTemplates?.quotation;
    const filename = `DD_Events_${type === 'invoice' ? 'Invoice' : 'Estimate'}_${event.id}_${(event.customer_name || 'Client').replace(/\s+/g, '_')}.pdf`;
    
    try {
      setSharingType(type);
      const url = type === 'invoice' ? api.getInvoicePdfUrl(event.id) : api.getEstimatePdfUrl(event.id);
      const blob = await api.downloadPdfBlob(url);
      const file = new File([blob], filename, { type: 'application/pdf' });

      // Check if browser supports Web Share API with files (Android, iOS Safari, mobile PWA)
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: `DD Events ${type === 'invoice' ? 'Invoice' : 'Quotation'}`,
          text: template?.text || `Official ${type} from DD Event Entertainment`,
          files: [file]
        });
        return;
      }

      // If mobile file share not available, trigger file download and open WhatsApp link
      await handleDownloadPdf(type);
      if (template?.url) {
        window.open(template.url, '_blank');
      }
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        console.error('Share error:', err);
        if (template?.url) {
          window.open(template.url, '_blank');
        }
      }
    } finally {
      setSharingType(null);
    }
  };

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

  const handleFinalSettle = async (finalAmount: number, method: PaymentMethod, notes: string, waive: boolean) => {
    if (!eventId) return;
    try {
      await api.finalSettlePayment(eventId, {
        final_payment_amount: finalAmount,
        payment_method: method,
        settlement_notes: notes || undefined,
        waive_remaining_balance: waive
      });
      fetchDetail();
      onRefresh();
    } catch (err: any) {
      console.error(err);
      alert(err.message || 'Failed to settle deal');
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventId || !newTaskTitle.trim()) return;
    try {
      setCreatingTask(true);
      await api.createTask(eventId, newTaskTitle.trim());
      setNewTaskTitle('');
      fetchDetail();
      onRefresh();
    } catch (err) {
      console.error(err);
    } finally {
      setCreatingTask(false);
    }
  };

  const handleToggleTask = async (taskId: number) => {
    try {
      await api.toggleTask(taskId);
      fetchDetail();
      onRefresh();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteTask = async (taskId: number) => {
    try {
      await api.deleteTask(taskId);
      fetchDetail();
      onRefresh();
    } catch (err) {
      console.error(err);
    }
  };

  const handleUploadAttachment = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0 || !eventId) return;
    try {
      setUploadingAttachment(true);
      await api.uploadAttachment(eventId, files[0]);
      fetchDetail();
    } catch (err: any) {
      console.error(err);
      alert('Failed to upload file.');
    } finally {
      setUploadingAttachment(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDeleteAttachment = async (attId: number) => {
    if (!confirm('Are you sure you want to delete this file?')) return;
    try {
      await api.deleteAttachment(attId);
      fetchDetail();
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
                <div className="flex items-center gap-2 text-slate-200 flex-wrap">
                  <Calendar className="w-4 h-4 text-emerald-400" />
                  <span className="font-bold">
                    {event.is_multi_day && event.end_date ? `${event.event_date} ➔ ${event.end_date}` : event.event_date}
                  </span>
                  {event.is_multi_day && (
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-extrabold px-2 py-0.5 rounded-full border border-emerald-500/30">
                      2-Day Event
                    </span>
                  )}
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
                  className="flex items-center gap-1.5 px-3 py-2 bg-slate-700 hover:bg-slate-600 rounded-xl text-white font-semibold transition text-xs"
                >
                  <Phone className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Call</span>
                </a>
                {waTemplates?.bill && (
                  <button
                    onClick={() => handleSharePdf('invoice')}
                    disabled={sharingType === 'invoice'}
                    className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 rounded-xl text-white font-bold transition text-xs shadow-md shadow-emerald-600/20"
                    title="Send PDF bill directly to customer on WhatsApp"
                  >
                    {sharingType === 'invoice' ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <MessageSquare className="w-3.5 h-3.5" />
                    )}
                    <span>Share Bill</span>
                  </button>
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
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-300">Financial Summary</span>
                  {event.is_settled && (
                    <span className="text-[10px] font-black bg-teal-500/20 text-teal-300 px-2 py-0.5 rounded border border-teal-500/40">
                      Deal Settled ✓
                    </span>
                  )}
                </div>
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

              {(event.settlement_discount || 0) > 0 && (
                <div className="flex items-center justify-between text-xs text-slate-400 pb-1 border-b border-slate-700/50 bg-teal-950/20 px-2 py-1 rounded">
                  <span>Discussed Total: <CurrencyText amount={event.discussed_total || event.total_amount} className="font-semibold text-slate-200" /></span>
                  <span className="text-teal-300 font-bold">Closing Waived Difference: -<CurrencyText amount={event.settlement_discount || 0} /></span>
                </div>
              )}

              <div className="grid grid-cols-3 gap-2 text-center pt-1">
                <div>
                  <p className="text-[10px] text-slate-400 uppercase font-bold">{event.is_settled ? 'Final Settled Deal' : 'Final Total'}</p>
                  <CurrencyText amount={event.total_amount} className="font-extrabold text-white text-sm sm:text-base" />
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 uppercase font-bold">Total Collected</p>
                  <CurrencyText amount={event.advance_paid} className="font-extrabold text-emerald-400 text-sm sm:text-base" />
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 uppercase font-bold">Balance Due</p>
                  {event.is_settled ? (
                    <span className="font-extrabold text-teal-300 text-sm sm:text-base">₹0.00 (Settled)</span>
                  ) : (
                    <CurrencyText
                      amount={event.balance_due}
                      className={`font-extrabold text-sm sm:text-base ${
                        event.balance_due > 0 ? 'text-rose-400' : 'text-emerald-400'
                      }`}
                    />
                  )}
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-slate-800 gap-3 text-xs sm:text-sm overflow-x-auto pb-1">
              <button
                onClick={() => setActiveTab('checklist')}
                className={`pb-2 font-bold whitespace-nowrap transition ${
                  activeTab === 'checklist'
                    ? 'text-emerald-400 border-b-2 border-emerald-400'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Services & Tasks ({ (event.services?.length || 0) + (event.tasks?.length || 0) })
              </button>
              <button
                onClick={() => setActiveTab('financials')}
                className={`pb-2 font-bold whitespace-nowrap transition ${
                  activeTab === 'financials'
                    ? 'text-emerald-400 border-b-2 border-emerald-400'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Payments & Expenses
              </button>
              <button
                onClick={() => setActiveTab('attachments')}
                className={`pb-2 font-bold whitespace-nowrap transition ${
                  activeTab === 'attachments'
                    ? 'text-emerald-400 border-b-2 border-emerald-400'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Photos & Files ({event.attachments?.length || 0})
              </button>
              <button
                onClick={() => setActiveTab('share')}
                className={`pb-2 font-bold whitespace-nowrap transition ${
                  activeTab === 'share'
                    ? 'text-emerald-400 border-b-2 border-emerald-400'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Bill & WhatsApp Share
              </button>
            </div>

            {/* Tab 1: Checklist & Tasks */}
            {activeTab === 'checklist' && (
              <div className="space-y-4">
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

                {/* Event Tasks & Prep Checklist */}
                <div className="pt-3 border-t border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-extrabold text-slate-200 text-xs sm:text-sm">
                        Preparation Tasks & Errands ({event.tasks?.length || 0})
                      </h4>
                      <p className="text-[11px] text-slate-400">Track equipment checks, dry ice pickup, artist calls, transport</p>
                    </div>
                  </div>

                  {/* Add Task Form */}
                  <form onSubmit={handleCreateTask} className="flex gap-2">
                    <input
                      type="text"
                      value={newTaskTitle}
                      onChange={(e) => setNewTaskTitle(e.target.value)}
                      placeholder="Add prep task (e.g. Order dry ice for fog machine, Call DJ...)"
                      className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-emerald-500"
                    />
                    <button
                      type="submit"
                      disabled={creatingTask || !newTaskTitle.trim()}
                      className="px-3.5 py-2 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1 transition"
                    >
                      <Plus className="w-3.5 h-3.5 stroke-[3]" /> Add
                    </button>
                  </form>

                  {/* Tasks List */}
                  <div className="space-y-2">
                    {event.tasks && event.tasks.length > 0 ? (
                      event.tasks.map((t) => (
                        <div
                          key={t.id}
                          className={`p-2.5 rounded-xl border flex items-center justify-between gap-2 text-xs transition ${
                            t.status === 'COMPLETED'
                              ? 'bg-slate-900/60 border-slate-800 text-slate-400'
                              : 'bg-slate-800/60 border-slate-700/80 text-white'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 flex-1 min-w-0">
                            <button
                              type="button"
                              onClick={() => handleToggleTask(t.id)}
                              className={`w-4 h-4 rounded flex items-center justify-center border transition ${
                                t.status === 'COMPLETED'
                                  ? 'bg-emerald-500 border-emerald-500 text-slate-950'
                                  : 'border-slate-500 bg-slate-900'
                              }`}
                            >
                              {t.status === 'COMPLETED' && <Check className="w-3 h-3 stroke-[3]" />}
                            </button>
                            <span className={`truncate ${t.status === 'COMPLETED' ? 'line-through text-slate-500' : 'font-medium'}`}>
                              {t.title}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleDeleteTask(t.id)}
                            className="p-1 text-slate-500 hover:text-rose-400 rounded transition"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-slate-500 italic py-1">No prep tasks added yet.</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Tab 2: Financials (Payments + Expenses + Profit & Settlement Audit) */}
            {activeTab === 'financials' && (
              <div className="space-y-4">
                {/* Event Settlement & Real Cost Tracking Card */}
                <div className="bg-gradient-to-br from-slate-900 via-slate-850 to-slate-800 p-4 rounded-2xl border border-slate-700/80 shadow-lg space-y-3.5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-700/60 pb-2.5">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                      <div>
                        <h4 className="font-extrabold text-white text-sm">Event Settlement & Real Cost Audit</h4>
                        <p className="text-[11px] text-slate-400">Final audit of client billings against actual direct operational costs</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {event.status === 'CLOSED' ? (
                        <span className="px-2.5 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold rounded-lg flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Event Closed & Settled
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            if (event.balance_due > 0) {
                              if (!confirm(`Warning: There is still ₹${event.balance_due.toLocaleString()} unpaid balance from the client. Are you sure you want to mark this event as CLOSED?`)) {
                                return;
                              }
                            } else {
                              if (!confirm('Mark this event as CLOSED? All costs and revenues will be marked settled.')) {
                                return;
                              }
                            }
                            handleStatusChange('CLOSED');
                          }}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs transition flex items-center gap-1 shadow-md shadow-emerald-600/20"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" /> Settle & Close Event
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    <div className="bg-slate-800/80 p-2.5 rounded-xl border border-slate-700/60">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Agreed Revenue</span>
                      <CurrencyText amount={event.total_amount} className="text-base font-extrabold text-white" />
                      <span className="text-[10px] text-slate-500 block mt-0.5">Contract Total</span>
                    </div>

                    <div className="bg-slate-800/80 p-2.5 rounded-xl border border-slate-700/60">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Collected</span>
                      <CurrencyText amount={event.advance_paid} className="text-base font-extrabold text-emerald-400" />
                      <span className="text-[10px] text-slate-500 block mt-0.5">
                        {event.balance_due === 0 ? 'Fully Collected' : `₹${event.balance_due} Due`}
                      </span>
                    </div>

                    <div className="bg-slate-800/80 p-2.5 rounded-xl border border-slate-700/60">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Real Incurred Cost</span>
                      <CurrencyText amount={event.total_expense || 0} className="text-base font-extrabold text-rose-400" />
                      <span className="text-[10px] text-slate-500 block mt-0.5">{event.expenses?.length || 0} expenses logged</span>
                    </div>

                    <div className="bg-emerald-950/30 p-2.5 rounded-xl border border-emerald-500/40">
                      <span className="text-[10px] uppercase font-bold text-emerald-300 block">Final Net Profit</span>
                      <CurrencyText amount={event.estimated_profit || 0} className="text-base font-black text-emerald-400" />
                      <span className="text-[10px] text-emerald-300/80 block mt-0.5 font-bold">
                        {event.total_amount > 0 ? `${(((event.estimated_profit || 0) / event.total_amount) * 100).toFixed(1)}% margin` : '0% margin'}
                      </span>
                    </div>
                  </div>

                  {/* Real Cash in Hand (Cash Collected minus Direct Expenses) */}
                  <div className="p-2.5 bg-slate-800/50 rounded-xl border border-slate-700/50 flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 text-xs">
                    <div className="flex items-center gap-1.5 text-slate-300">
                      <Calculator className="w-4 h-4 text-emerald-400" />
                      <span>Realized Cash in Pocket (Collected - Real Expenses):</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CurrencyText
                        amount={event.advance_paid - (event.total_expense || 0)}
                        className={`font-black text-sm ${(event.advance_paid - (event.total_expense || 0)) >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}
                      />
                      {event.balance_due > 0 && (
                        <span className="text-[10px] text-amber-400 font-semibold bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30">
                          +₹{event.balance_due.toLocaleString()} pending from client
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Payments Section */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <h4 className="font-bold text-slate-200">Payments Recorded ({event.payments?.length || 0})</h4>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setIsPaymentOpen(true)}
                        className="px-2.5 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1 shadow-sm transition"
                      >
                        <Plus className="w-3.5 h-3.5 stroke-[3]" /> Add Payment
                      </button>
                      <button
                        onClick={() => setIsFinalSettleOpen(true)}
                        className="px-3 py-1.5 bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-slate-950 font-black rounded-xl text-xs flex items-center gap-1.5 shadow-md shadow-teal-500/20 transition"
                        title="Close payment deal with whatever final amount was agreed"
                      >
                        <Handshake className="w-4 h-4 stroke-[2.5]" /> Settle & Close Deal
                      </button>
                    </div>
                  </div>

                  {event.is_settled && (
                    <div className="bg-gradient-to-r from-teal-950/40 to-slate-900 border border-teal-500/40 p-3.5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-md">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5 text-teal-300 font-extrabold text-sm">
                          <CheckCircle2 className="w-4 h-4 text-teal-400" />
                          <span>Deal Closed & Settled</span>
                        </div>
                        <p className="text-slate-300 text-xs">
                          Final collected revenue: <b>₹{event.advance_paid.toLocaleString()}</b>.
                          {(event.settlement_discount || 0) > 0 && (
                            <span className="text-amber-300 ml-1.5">
                              (₹{(event.settlement_discount || 0).toLocaleString()} waived as closing negotiation).
                            </span>
                          )}
                        </p>
                        {event.settlement_notes && (
                          <p className="text-slate-400 text-[11px] italic">"{event.settlement_notes}"</p>
                        )}
                      </div>
                      {waTemplates?.settlement_receipt && (
                        <a
                          href={waTemplates.settlement_receipt.url}
                          target="_blank"
                          rel="noreferrer"
                          className="px-3 py-1.5 bg-teal-600 hover:bg-teal-500 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-sm transition self-start sm:self-auto"
                        >
                          <Share2 className="w-3.5 h-3.5" /> Share Settled Receipt
                        </a>
                      )}
                    </div>
                  )}

                  {event.payments && event.payments.length > 0 ? (
                    event.payments.map((p) => (
                      <div key={p.id} className="p-2.5 bg-slate-800/40 rounded-xl border border-slate-700/60 flex items-center justify-between text-xs">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-white">{p.payment_method}</span>
                            <span className="text-slate-400">{p.payment_date}</span>
                          </div>
                          {p.notes && <p className="text-[11px] text-slate-400 mt-0.5">{p.notes}</p>}
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
                    <div>
                      <h4 className="font-bold text-slate-200">Direct Event Expenses ({event.expenses?.length || 0})</h4>
                      <p className="text-[11px] text-slate-400">Track and edit real costs (materials, labour, transport, etc.)</p>
                    </div>
                    <button
                      onClick={() => {
                        setSelectedExpenseToEdit(null);
                        setIsExpenseOpen(true);
                      }}
                      className="px-2.5 py-1 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 font-bold rounded-lg text-xs flex items-center gap-1 border border-rose-500/30"
                    >
                      <Plus className="w-3.5 h-3.5 stroke-[3]" /> Add Expense
                    </button>
                  </div>

                  {event.expenses && event.expenses.length > 0 ? (
                    event.expenses.map((e) => (
                      <div key={e.id} className="p-2.5 bg-slate-800/40 hover:bg-slate-800/70 rounded-xl border border-slate-700/60 flex items-center justify-between text-xs transition">
                        <div className="flex-1 min-w-0 mr-3">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-rose-300">{e.category}</span>
                            <span className="text-slate-500">({e.date})</span>
                          </div>
                          {e.description && (
                            <p className="text-slate-300 text-[11px] truncate mt-0.5">{e.description}</p>
                          )}
                        </div>

                        <div className="flex items-center gap-2 flex-shrink-0">
                          <CurrencyText amount={e.amount} className="font-extrabold text-rose-400 text-sm" />
                          <div className="flex items-center gap-1 border-l border-slate-700/80 pl-2">
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedExpenseToEdit(e);
                                setIsExpenseOpen(true);
                              }}
                              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-700/60 rounded-lg transition"
                              title="Edit Expense"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={async () => {
                                if (!confirm(`Delete expense "${e.category} - ₹${e.amount}"? This will restore event profit.`)) return;
                                try {
                                  await api.deleteExpense(e.id);
                                  fetchDetail();
                                  onRefresh();
                                } catch (err) {
                                  console.error(err);
                                  alert('Failed to delete expense');
                                }
                              }}
                              className="p-1.5 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-lg transition"
                              title="Delete Expense"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-slate-500 italic">No expenses recorded for this event yet.</p>
                  )}
                </div>
              </div>
            )}

            {/* Tab 3: Attachments & Photos */}
            {activeTab === 'attachments' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between bg-slate-800/60 p-3.5 rounded-2xl border border-slate-700/60 flex-wrap gap-2">
                  <div>
                    <h4 className="font-extrabold text-white text-xs sm:text-sm flex items-center gap-1.5">
                      <Paperclip className="w-4 h-4 text-emerald-400" /> Event Photos & Reference Documents
                    </h4>
                    <p className="text-[11px] text-slate-400">Upload stage decor designs, hall photos, vendor bills & receipts</p>
                  </div>
                  <div>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleUploadAttachment}
                      className="hidden"
                      accept="image/*,.pdf,.doc,.docx"
                    />
                    <button
                      type="button"
                      disabled={uploadingAttachment}
                      onClick={() => fileInputRef.current?.click()}
                      className="px-3 py-2 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-md transition"
                    >
                      {uploadingAttachment ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                      <span>Upload File</span>
                    </button>
                  </div>
                </div>

                {event.attachments && event.attachments.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {event.attachments.map((att) => (
                      <div
                        key={att.id}
                        className="bg-slate-800/80 border border-slate-700/70 rounded-2xl p-2.5 flex flex-col justify-between group overflow-hidden"
                      >
                        {att.file_type === 'image' ? (
                          <div className="h-28 rounded-xl bg-slate-900 overflow-hidden mb-2 relative">
                            <img
                              src={att.file_url}
                              alt={att.file_name}
                              className="w-full h-full object-cover group-hover:scale-105 transition"
                            />
                            <a
                              href={att.file_url}
                              target="_blank"
                              rel="noreferrer"
                              className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-xs font-bold transition"
                            >
                              View Image
                            </a>
                          </div>
                        ) : (
                          <div className="h-28 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col items-center justify-center text-slate-400 mb-2 p-2 text-center">
                            <FileText className="w-8 h-8 text-blue-400 mb-1" />
                            <span className="text-[10px] text-slate-400 truncate max-w-full">{att.file_name}</span>
                          </div>
                        )}
                        <div className="flex items-center justify-between text-xs pt-1">
                          <span className="truncate text-[11px] text-slate-300 max-w-[120px]" title={att.file_name}>
                            {att.file_name}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleDeleteAttachment(att.id)}
                            className="p-1 text-slate-500 hover:text-rose-400 transition"
                            title="Delete file"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 text-center bg-slate-800/30 rounded-2xl border border-slate-800/60 space-y-2">
                    <ImageIcon className="w-8 h-8 text-slate-600 mx-auto" />
                    <p className="text-xs text-slate-400 font-medium">No photos or documents attached yet.</p>
                    <p className="text-[11px] text-slate-500">Tap Upload File to add stage decoration references, event agreements, or receipts.</p>
                  </div>
                )}
              </div>
            )}

            {/* Tab 4: Share & Billing */}
            {activeTab === 'share' && (
              <div className="space-y-5">
                {/* 0. Settlement Receipt (When event is settled) */}
                {event.is_settled && waTemplates?.settlement_receipt && (
                  <div className="bg-gradient-to-r from-teal-950/60 to-emerald-950/60 p-4 sm:p-5 rounded-3xl border border-teal-500/40 space-y-3 shadow-md">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                      <div>
                        <h4 className="font-extrabold text-teal-300 text-sm flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4 text-teal-400" /> Deal Closed & Settled Receipt
                        </h4>
                        <p className="text-xs text-slate-300">Send official settlement confirmation to client on WhatsApp</p>
                      </div>
                      <a
                        href={waTemplates.settlement_receipt.url}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3.5 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-md shadow-teal-600/20"
                      >
                        <Share2 className="w-3.5 h-3.5" /> Share Settled Receipt
                      </a>
                    </div>
                    <div className="bg-slate-900/80 p-3 rounded-2xl border border-slate-700/60">
                      <p className="text-xs text-slate-300 font-mono whitespace-pre-line line-clamp-3">
                        {waTemplates.settlement_receipt.text}
                      </p>
                    </div>
                  </div>
                )}

                {/* 1. Inquiry & Draft Stage: Price Estimate / Quotation */}
                <div className="bg-slate-800/80 p-4 sm:p-5 rounded-3xl border border-blue-500/30 space-y-3 shadow-md">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] bg-blue-500/20 text-blue-300 font-bold px-2 py-0.5 rounded-full border border-blue-500/30 uppercase tracking-wide">
                          Inquiry / Draft Stage
                        </span>
                        <h4 className="font-extrabold text-white text-sm sm:text-base">Price Estimate & Quotation</h4>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">Send preliminary quotation to prospective client before booking confirmation</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleDownloadPdf('estimate')}
                        disabled={downloadingType === 'estimate'}
                        className="flex items-center gap-1.5 px-3 py-2 bg-slate-700/80 hover:bg-slate-600 disabled:opacity-50 text-white font-bold rounded-xl text-xs transition border border-slate-600 shadow-sm"
                        title="Download PDF Estimate directly to your device"
                      >
                        {downloadingType === 'estimate' ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-400" />
                        ) : (
                          <Download className="w-3.5 h-3.5 text-blue-400" />
                        )}
                        <span>{downloadingType === 'estimate' ? 'Downloading...' : 'Download PDF'}</span>
                      </button>
                      {waTemplates?.quotation && (
                        <button
                          onClick={() => handleSharePdf('estimate')}
                          disabled={sharingType === 'estimate'}
                          className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold rounded-xl text-xs transition shadow-md shadow-blue-600/20"
                          title="Share quotation & PDF via WhatsApp"
                        >
                          {sharingType === 'estimate' ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Share2 className="w-3.5 h-3.5" />
                          )}
                          <span>{sharingType === 'estimate' ? 'Preparing PDF...' : 'WhatsApp Quotation'}</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {waTemplates?.quotation && (
                    <div className="bg-slate-900/80 p-3 rounded-2xl border border-slate-700/60">
                      <p className="text-xs text-slate-300 font-mono whitespace-pre-line line-clamp-4">
                        {waTemplates.quotation.text}
                      </p>
                    </div>
                  )}
                </div>

                {/* 2. Confirmed Booking: Official Bill & Tax Invoice */}
                <div className="bg-slate-800/80 p-4 sm:p-5 rounded-3xl border border-slate-700/70 space-y-3 shadow-md">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-bold px-2 py-0.5 rounded-full border border-emerald-500/30 uppercase tracking-wide">
                          Confirmed Stage
                        </span>
                        <h4 className="font-extrabold text-white text-sm sm:text-base">Official Bill & Invoice</h4>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">Itemized tax invoice with advance received, balance due & UPI details</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleDownloadPdf('invoice')}
                        disabled={downloadingType === 'invoice'}
                        className="flex items-center gap-1.5 px-3 py-2 bg-slate-700/80 hover:bg-slate-600 disabled:opacity-50 text-white font-bold rounded-xl text-xs transition border border-slate-600 shadow-sm"
                        title="Download official Tax Invoice PDF directly to your device"
                      >
                        {downloadingType === 'invoice' ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-400" />
                        ) : (
                          <Download className="w-3.5 h-3.5 text-emerald-400" />
                        )}
                        <span>{downloadingType === 'invoice' ? 'Downloading...' : 'Download PDF'}</span>
                      </button>
                      {waTemplates?.bill && (
                        <button
                          onClick={() => handleSharePdf('invoice')}
                          disabled={sharingType === 'invoice'}
                          className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold rounded-xl text-xs transition shadow-md shadow-emerald-600/20"
                          title="Share bill & PDF document via WhatsApp"
                        >
                          {sharingType === 'invoice' ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Share2 className="w-3.5 h-3.5" />
                          )}
                          <span>{sharingType === 'invoice' ? 'Preparing PDF...' : 'Share Bill (PDF)'}</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {waTemplates?.confirmation && (
                    <div className="flex items-center justify-between pt-1">
                      <span className="text-xs text-slate-400">Send formal booking confirmation receipt:</span>
                      <a
                        href={waTemplates.confirmation.url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 bg-emerald-950/40 px-2.5 py-1 rounded-lg border border-emerald-500/30"
                      >
                        <Share2 className="w-3 h-3" /> Booking Confirmed Msg
                      </a>
                    </div>
                  )}

                  {waTemplates?.bill && (
                    <div className="bg-slate-900/80 p-3 rounded-2xl border border-slate-700/60">
                      <p className="text-xs text-slate-300 font-mono whitespace-pre-line line-clamp-4">
                        {waTemplates.bill.text}
                      </p>
                    </div>
                  )}
                </div>

                {/* 3. Balance Due Reminder (Conditional) */}
                {waTemplates && event.balance_due > 0 && (
                  <div className="bg-slate-800/80 p-4 sm:p-5 rounded-3xl border border-rose-500/30 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-extrabold text-rose-300 text-sm">Send Balance Due Reminder</h4>
                        <p className="text-xs text-slate-400">Gentle payment reminder for outstanding balance</p>
                      </div>
                      <a
                        href={waTemplates.payment_reminder.url}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3.5 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-md shadow-rose-600/20"
                      >
                        <Share2 className="w-3.5 h-3.5" /> Remind Client
                      </a>
                    </div>
                    <div className="bg-slate-900/80 p-3 rounded-2xl border border-slate-700/60">
                      <p className="text-xs text-slate-300 font-mono whitespace-pre-line line-clamp-3">
                        {waTemplates.payment_reminder.text}
                      </p>
                    </div>
                  </div>
                )}

                {/* 4. Crew Dispatch Brief */}
                {waTemplates && (
                  <div className="bg-slate-800/80 p-4 sm:p-5 rounded-3xl border border-slate-700/70 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-extrabold text-white text-sm">Event Crew Dispatch Brief</h4>
                        <p className="text-xs text-slate-400">Share venue, sound check, timing & assignments with your team</p>
                      </div>
                      <a
                        href={waTemplates.crew_brief.url}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3.5 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5"
                      >
                        <Share2 className="w-3.5 h-3.5" /> Share with Team
                      </a>
                    </div>
                    <div className="bg-slate-900/80 p-3 rounded-2xl border border-slate-700/60">
                      <p className="text-xs text-slate-300 font-mono whitespace-pre-line line-clamp-3">
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
        expenseToEdit={selectedExpenseToEdit}
        onClose={() => {
          setIsExpenseOpen(false);
          setSelectedExpenseToEdit(null);
        }}
        onRecord={async (amount, category, description, date) => {
          await api.recordExpense(eventId, amount, category, description, date);
          fetchDetail();
          onRefresh();
        }}
        onUpdate={async (expenseId, amount, category, description, date) => {
          await api.updateExpense(expenseId, amount, category, description, date);
          fetchDetail();
          onRefresh();
        }}
        onDelete={async (expenseId) => {
          await api.deleteExpense(expenseId);
          fetchDetail();
          onRefresh();
        }}
      />

      {event && (
        <FinalSettleModal
          isOpen={isFinalSettleOpen}
          onClose={() => setIsFinalSettleOpen(false)}
          event={event}
          onSettle={handleFinalSettle}
        />
      )}
    </div>
  );
};
