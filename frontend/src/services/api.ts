import {
  DashboardData, Event, QuickOrderPayload, Service,
  Customer, FinanceSummary, Payment, Expense
} from '../types';

const API_BASE = '/api';

export const api = {
  // Dashboard
  async getDashboard(): Promise<DashboardData> {
    const res = await fetch(`${API_BASE}/dashboard`);
    if (!res.ok) throw new Error('Failed to fetch dashboard');
    return res.json();
  },

  // Events
  async getEvents(status?: string, payment_status?: string, month?: string): Promise<Event[]> {
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    if (payment_status) params.append('payment_status', payment_status);
    if (month) params.append('month', month);
    const res = await fetch(`${API_BASE}/events?${params.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch events');
    return res.json();
  },

  async getEventDetail(id: number): Promise<Event> {
    const res = await fetch(`${API_BASE}/events/${id}`);
    if (!res.ok) throw new Error('Failed to fetch event detail');
    return res.json();
  },

  async createQuickOrder(payload: QuickOrderPayload): Promise<Event> {
    const res = await fetch(`${API_BASE}/events/quick-order`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error('Failed to create order');
    return res.json();
  },

    async updateEventDiscount(id: number, discount: number): Promise<Event> {
    const res = await fetch(`${API_BASE}/events/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ discount })
    });
    if (!res.ok) throw new Error('Failed to update discount');
    return res.json();
  },
  async updateEventStatus(id: number, status: string): Promise<Event> {
    const res = await fetch(`${API_BASE}/events/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    if (!res.ok) throw new Error('Failed to update event status');
    return res.json();
  },

  async updateServiceStatus(
    eventId: number,
    serviceId: number,
    status: 'PENDING' | 'READY',
    assignedTo?: string,
    notes?: string
  ): Promise<any> {
    const params = new URLSearchParams({ status });
    if (assignedTo !== undefined) params.append('assigned_to', assignedTo);
    if (notes !== undefined) params.append('notes', notes);
    const res = await fetch(`${API_BASE}/events/${eventId}/services/${serviceId}/status?${params.toString()}`, {
      method: 'PATCH'
    });
    if (!res.ok) throw new Error('Failed to update service checklist');
    return res.json();
  },

    async clearDemoData(): Promise<void> {
    const res = await fetch(`${API_BASE}/events/clear-demo-data`, { method: 'POST' });
    if (!res.ok) throw new Error('Failed to clear demo data');
  },
  async deleteEvent(id: number): Promise<void> {
    const res = await fetch(`${API_BASE}/events/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete event');
  },

  // Services Catalog
  async getServices(): Promise<Service[]> {
    const res = await fetch(`${API_BASE}/services`);
    if (!res.ok) throw new Error('Failed to fetch services catalog');
    return res.json();
  },

    async deleteService(id: number): Promise<void> {
    const res = await fetch(`${API_BASE}/services/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete service');
  },
  async createService(name: string, default_price: number, category: string): Promise<Service> {
    const res = await fetch(`${API_BASE}/services`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, default_price, category, active: true })
    });
    if (!res.ok) throw new Error('Failed to add service');
    return res.json();
  },

  // Payments
  async recordPayment(eventId: number, amount: number, paymentDate: string, paymentMethod: string, notes?: string): Promise<Payment> {
    const res = await fetch(`${API_BASE}/payments/${eventId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        amount,
        payment_date: paymentDate,
        payment_method: paymentMethod,
        notes
      })
    });
    if (!res.ok) throw new Error('Failed to record payment');
    return res.json();
  },

  // Expenses
  async recordExpense(eventId: number, amount: number, category: string, description: string, date: string): Promise<Expense> {
    const res = await fetch(`${API_BASE}/expenses/${eventId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount, category, description, date })
    });
    if (!res.ok) throw new Error('Failed to record expense');
    return res.json();
  },

  // Customers
  async getCustomers(search?: string): Promise<Customer[]> {
    const params = search ? `?search=${encodeURIComponent(search)}` : '';
    const res = await fetch(`${API_BASE}/customers${params}`);
    if (!res.ok) throw new Error('Failed to fetch customers');
    return res.json();
  },

  async getCustomerDetail(id: number): Promise<Customer> {
    const res = await fetch(`${API_BASE}/customers/${id}`);
    if (!res.ok) throw new Error('Failed to fetch customer detail');
    return res.json();
  },

  // Finance
  async getFinanceSummary(): Promise<FinanceSummary> {
    const res = await fetch(`${API_BASE}/finance/summary`);
    if (!res.ok) throw new Error('Failed to fetch finance summary');
    return res.json();
  },

  // WhatsApp Templates
  async getWhatsAppTemplates(eventId: number): Promise<any> {
    const res = await fetch(`${API_BASE}/billing/whatsapp/${eventId}`);
    if (!res.ok) throw new Error('Failed to fetch WhatsApp templates');
    return res.json();
  },

  // Global Search
  async globalSearch(q: string): Promise<{ customers: Customer[]; events: Event[]; services: Service[] }> {
    const res = await fetch(`${API_BASE}/search?q=${encodeURIComponent(q)}`);
    if (!res.ok) throw new Error('Search failed');
    return res.json();
  },

  // PDF URLs & Download
  getInvoicePdfUrl(eventId: number, inline = false): string {
    return `${API_BASE}/billing/invoice/${eventId}/pdf${inline ? '?inline=true' : ''}`;
  },

  getEstimatePdfUrl(eventId: number, inline = false): string {
    return `${API_BASE}/billing/estimate/${eventId}/pdf${inline ? '?inline=true' : ''}`;
  },

  async downloadPdfBlob(url: string): Promise<Blob> {
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to download PDF document');
    return res.blob();
  }
};
