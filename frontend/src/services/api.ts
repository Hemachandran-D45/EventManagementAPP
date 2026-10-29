import type {
  DashboardData, Event, QuickOrderPayload, Service,
  Customer, FinanceSummary, Payment, Expense,
  PublicService, PublicInquiryPayload, PublicInquiryResponse
} from '../types';

const API_BASE = '/api';

export const secureFetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
  const headers = new Headers(init?.headers || {});
  const token = localStorage.getItem('owner_auth_token');
  if (token && !headers.has('X-Auth-Token')) {
    headers.set('X-Auth-Token', token);
  }
  const response = await fetch(input, { ...init, headers });
  if (response.status === 401) {
    localStorage.removeItem('owner_auth_token');
    window.dispatchEvent(new Event('app:unauthorized'));
  }
  return response;
};

export const api = {
  // Authentication & Security Lock
  async verifyPin(pin: string): Promise<{ status: string; token: string }> {
    const res = await fetch(`${API_BASE}/auth/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pin }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Invalid Owner PIN');
    }
    const data = await res.json();
    localStorage.setItem('owner_auth_token', data.token);
    return data;
  },

  logout(): void {
    localStorage.removeItem('owner_auth_token');
    window.dispatchEvent(new Event('app:unauthorized'));
  },

  isAuthenticated(): boolean {
    return !!localStorage.getItem('owner_auth_token');
  },

  // Dashboard
  async getDashboard(): Promise<DashboardData> {
    const res = await secureFetch(`${API_BASE}/dashboard`);
    if (!res.ok) throw new Error('Failed to fetch dashboard');
    return res.json();
  },

  // Events
  async getEvents(status?: string, payment_status?: string, month?: string): Promise<Event[]> {
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    if (payment_status) params.append('payment_status', payment_status);
    if (month) params.append('month', month);
    const res = await secureFetch(`${API_BASE}/events?${params.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch events');
    return res.json();
  },

  async getEventDetail(id: number): Promise<Event> {
    const res = await secureFetch(`${API_BASE}/events/${id}`);
    if (!res.ok) throw new Error('Failed to fetch event detail');
    return res.json();
  },

  async createQuickOrder(payload: QuickOrderPayload): Promise<Event> {
    const res = await secureFetch(`${API_BASE}/events/quick-order`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error('Failed to create order');
    return res.json();
  },

  async updateEventDiscount(id: number, discount: number): Promise<Event> {
    const res = await secureFetch(`${API_BASE}/events/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ discount })
    });
    if (!res.ok) throw new Error('Failed to update discount');
    return res.json();
  },

  async updateEventStatus(id: number, status: string): Promise<Event> {
    const res = await secureFetch(`${API_BASE}/events/${id}`, {
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
    if (assignedTo) params.append('assigned_to', assignedTo);
    if (notes) params.append('notes', notes);
    const res = await secureFetch(`${API_BASE}/events/${eventId}/services/${serviceId}?${params.toString()}`, {
      method: 'PATCH'
    });
    if (!res.ok) throw new Error('Failed to update service status');
    return res.json();
  },

  // Services Catalog
  async getServices(): Promise<Service[]> {
    const res = await secureFetch(`${API_BASE}/services`);
    if (!res.ok) throw new Error('Failed to fetch services');
    return res.json();
  },

  async createService(name: string, default_price: number, category: string): Promise<Service> {
    const res = await secureFetch(`${API_BASE}/services`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, default_price, category, active: true })
    });
    if (!res.ok) throw new Error('Failed to create service');
    return res.json();
  },

  async updateService(id: number, name: string, default_price: number, category: string): Promise<Service> {
    const res = await secureFetch(`${API_BASE}/services/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, default_price, category, active: true })
    });
    if (!res.ok) throw new Error('Failed to update service');
    return res.json();
  },

  async deleteService(id: number): Promise<void> {
    const res = await secureFetch(`${API_BASE}/services/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete service');
  },

  // Payments
  async recordPayment(eventId: number, amount: number, paymentMethod: string, notes?: string, paymentDate?: string): Promise<Payment> {
    const res = await secureFetch(`${API_BASE}/payments/${eventId}`, {
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

  async finalSettlePayment(eventId: number, payload: {
    final_payment_amount: number;
    payment_method: string;
    payment_date?: string;
    settlement_notes?: string;
    waive_remaining_balance?: boolean;
  }): Promise<Event> {
    const res = await secureFetch(`${API_BASE}/payments/${eventId}/final-settle`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error('Failed to settle and close payment');
    return res.json();
  },

  // Tasks
  async getTasks(eventId: number): Promise<any[]> {
    const res = await secureFetch(`${API_BASE}/tasks/${eventId}`);
    if (!res.ok) throw new Error('Failed to fetch tasks');
    return res.json();
  },

  async createTask(eventId: number, title: string, due_date?: string): Promise<any> {
    const res = await secureFetch(`${API_BASE}/tasks/${eventId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, due_date, status: 'PENDING' })
    });
    if (!res.ok) throw new Error('Failed to create task');
    return res.json();
  },

  async toggleTask(taskId: number): Promise<any> {
    const res = await secureFetch(`${API_BASE}/tasks/${taskId}/toggle`, { method: 'PATCH' });
    if (!res.ok) throw new Error('Failed to toggle task');
    return res.json();
  },

  async deleteTask(taskId: number): Promise<void> {
    const res = await secureFetch(`${API_BASE}/tasks/${taskId}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete task');
  },

  // Attachments
  async uploadAttachment(eventId: number, file: File): Promise<any> {
    const formData = new FormData();
    formData.append('file', file);
    const res = await secureFetch(`${API_BASE}/attachments/${eventId}/upload`, {
      method: 'POST',
      body: formData
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Failed to upload attachment');
    }
    return res.json();
  },

  async deleteAttachment(attachmentId: number): Promise<void> {
    const res = await secureFetch(`${API_BASE}/attachments/${attachmentId}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete attachment');
  },

  // Expenses
  async recordExpense(eventId: number, amount: number, category: string, description: string, date: string): Promise<Expense> {
    const res = await secureFetch(`${API_BASE}/expenses/${eventId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount, category, description, date })
    });
    if (!res.ok) throw new Error('Failed to record expense');
    return res.json();
  },

  async updateExpense(expenseId: number, amount: number, category: string, description: string, date: string): Promise<Expense> {
    const res = await secureFetch(`${API_BASE}/expenses/${expenseId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount, category, description, date })
    });
    if (!res.ok) throw new Error('Failed to update expense');
    return res.json();
  },

  async deleteExpense(expenseId: number): Promise<void> {
    const res = await secureFetch(`${API_BASE}/expenses/${expenseId}`, {
      method: 'DELETE'
    });
    if (!res.ok) throw new Error('Failed to delete expense');
  },

  // Customers
  async getCustomers(search?: string): Promise<Customer[]> {
    const params = search ? `?search=${encodeURIComponent(search)}` : '';
    const res = await secureFetch(`${API_BASE}/customers${params}`);
    if (!res.ok) throw new Error('Failed to fetch customers');
    return res.json();
  },

  async getCustomerDetail(id: number): Promise<Customer> {
    const res = await secureFetch(`${API_BASE}/customers/${id}`);
    if (!res.ok) throw new Error('Failed to fetch customer detail');
    return res.json();
  },

  // Finance
  async getFinanceSummary(): Promise<FinanceSummary> {
    const res = await secureFetch(`${API_BASE}/finance/summary`);
    if (!res.ok) throw new Error('Failed to fetch finance summary');
    return res.json();
  },

  // WhatsApp Templates
  async getWhatsAppTemplates(eventId: number): Promise<any> {
    const res = await secureFetch(`${API_BASE}/billing/whatsapp/${eventId}`);
    if (!res.ok) throw new Error('Failed to fetch WhatsApp templates');
    return res.json();
  },

  // Global Search
  async globalSearch(q: string): Promise<{ customers: Customer[]; events: Event[]; services: Service[] }> {
    const res = await secureFetch(`${API_BASE}/search?q=${encodeURIComponent(q)}`);
    if (!res.ok) throw new Error('Search failed');
    return res.json();
  },

  // PDF URLs & Download
  getInvoicePdfUrl(eventId: number, inline = false): string {
    const token = localStorage.getItem('owner_auth_token') || '';
    return `${API_BASE}/billing/invoice/${eventId}/pdf${inline ? '?inline=true' : ''}`;
  },

  getEstimatePdfUrl(eventId: number, inline = false): string {
    return `${API_BASE}/billing/estimate/${eventId}/pdf${inline ? '?inline=true' : ''}`;
  },

  async downloadPdfBlob(url: string): Promise<Blob> {
    const res = await secureFetch(url);
    if (!res.ok) throw new Error('Failed to download PDF document');
    return res.blob();
  },

  // Public Website Endpoints (Strictly zero pricing, no auth required)
  async getPublicServices(): Promise<PublicService[]> {
    const res = await fetch(`${API_BASE}/public/services`);
    if (!res.ok) throw new Error('Failed to fetch services');
    return res.json();
  },

  async submitPublicInquiry(payload: PublicInquiryPayload): Promise<PublicInquiryResponse> {
    const res = await fetch(`${API_BASE}/public/inquire`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Failed to submit inquiry');
    }
    return res.json();
  }
};
