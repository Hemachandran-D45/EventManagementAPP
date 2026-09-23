export type OrderStatus = 'NEW' | 'CONFIRMED' | 'PREPARING' | 'READY' | 'COMPLETED' | 'CLOSED';
export type PaymentStatus = 'UNPAID' | 'PARTIAL' | 'PAID';
export type PaymentMethod = 'CASH' | 'UPI' | 'BANK_TRANSFER' | 'OTHER';

export interface Customer {
  id: number;
  name: string;
  phone: string;
  address?: string;
  notes?: string;
  created_at?: string;
  events?: Event[];
  total_events?: number;
  lifetime_revenue?: number;
  pending_amount?: number;
}

export interface Service {
  id: number;
  name: string;
  default_price: number;
  category?: string;
  active: boolean;
}

export interface EventServiceItem {
  id?: number;
  service_id?: number;
  service_name: string;
  quantity: number;
  agreed_price: number;
  status: 'PENDING' | 'READY';
  assigned_to?: string;
  notes?: string;
}

export interface Payment {
  id: number;
  event_id: number;
  amount: number;
  payment_date: string;
  payment_method: PaymentMethod;
  notes?: string;
  created_at?: string;
}

export interface Expense {
  id: number;
  event_id: number;
  amount: number;
  category: string;
  description?: string;
  date: string;
  created_at?: string;
}

export interface Task {
  id: number;
  event_id: number;
  title: string;
  due_date?: string;
  status: 'PENDING' | 'COMPLETED';
}

export interface Attachment {
  id: number;
  event_id: number;
  file_name: string;
  file_url: string;
  file_type: string;
  created_at: string;
}

export interface Event {
  id: number;
  customer_id: number;
  customer_name: string;
  customer_phone: string;
  event_type: string;
  event_date: string;
  event_time?: string;
  venue: string;
  location?: string;
  status: OrderStatus;
  payment_status: PaymentStatus;
  notes?: string;
  services_subtotal?: number;
  discount?: number;
  total_amount: number;
  advance_paid: number;
  balance_due: number;
  created_at?: string;
  services?: EventServiceItem[];
  payments?: Payment[];
  expenses?: Expense[];
  tasks?: Task[];
  attachments?: Attachment[];
  total_expense?: number;
  estimated_profit?: number;
}

export interface AlertItem {
  type: 'warning' | 'info' | 'reminder';
  title: string;
  message: string;
  event_id?: number;
  due_date?: string;
}

export interface DashboardData {
  today_events_count: number;
  upcoming_events_count: number;
  pending_payment_total: number;
  follow_ups_count: number;
  prep_tasks_count: number;
  today_events: Event[];
  upcoming_events: Event[];
  alerts: AlertItem[];
}

export interface FinanceSummary {
  revenue_today: number;
  revenue_week: number;
  revenue_month: number;
  total_collected: number;
  total_pending: number;
  total_expenses: number;
  estimated_profit: number;
  completed_events_count: number;
  upcoming_events_count: number;
  expenses_by_category: { category: string; amount: number }[];
}

export interface QuickOrderPayload {
  customer_name: string;
  customer_phone: string;
  customer_address?: string;
  event_type: string;
  event_date: string;
  event_time?: string;
  venue: string;
  location?: string;
  services: {
    service_id?: number;
    service_name: string;
    quantity: number;
    agreed_price: number;
    assigned_to?: string;
    notes?: string;
  }[];
  discount: number;
  advance_amount: number;
  payment_method: PaymentMethod;
  notes?: string;
}
