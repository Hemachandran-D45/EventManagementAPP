from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
from datetime import datetime

# Services
class ServiceBase(BaseModel):
    name: str
    default_price: float = 0.0
    category: Optional[str] = "General"
    active: bool = True

class ServiceCreate(ServiceBase):
    pass

class ServiceResponse(ServiceBase):
    id: int
    model_config = ConfigDict(from_attributes=True)

# Event Services
class EventServiceItem(BaseModel):
    service_id: Optional[int] = None
    service_name: str
    quantity: int = 1
    agreed_price: float = 0.0
    status: Optional[str] = "PENDING"
    assigned_to: Optional[str] = None
    notes: Optional[str] = None

class EventServiceResponse(EventServiceItem):
    id: int
    event_id: int
    model_config = ConfigDict(from_attributes=True)

# Payments
class PaymentCreate(BaseModel):
    amount: float
    payment_date: str
    payment_method: str = "CASH" # CASH, UPI, BANK_TRANSFER, OTHER
    notes: Optional[str] = None

class PaymentResponse(PaymentCreate):
    id: int
    event_id: int
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)

# Expenses
class ExpenseCreate(BaseModel):
    amount: float
    category: str
    description: Optional[str] = None
    date: str

class ExpenseResponse(ExpenseCreate):
    id: int
    event_id: int
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)

# Tasks
class TaskCreate(BaseModel):
    title: str
    due_date: Optional[str] = None
    status: str = "PENDING"

class TaskUpdate(BaseModel):
    status: Optional[str] = None
    title: Optional[str] = None
    due_date: Optional[str] = None

class TaskResponse(TaskCreate):
    id: int
    event_id: int
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)

# Attachments
class AttachmentResponse(BaseModel):
    id: int
    event_id: int
    file_name: str
    file_url: str
    file_type: str
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)

# Customers
class CustomerBase(BaseModel):
    name: str
    phone: str
    address: Optional[str] = None
    notes: Optional[str] = None

class CustomerCreate(CustomerBase):
    pass

class CustomerResponse(CustomerBase):
    id: int
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)

# Event Schemas
class QuickOrderCreate(BaseModel):
    # Customer
    customer_name: str
    customer_phone: str
    customer_address: Optional[str] = None
    # Event
    event_type: str
    event_date: str # YYYY-MM-DD
    event_time: Optional[str] = "7:00 PM"
    venue: str
    location: Optional[str] = ""
    # Services
    services: List[EventServiceItem] = []
    # Financials
    discount: float = 0.0
    advance_amount: float = 0.0
    payment_method: str = "CASH"
    notes: Optional[str] = None

class EventUpdate(BaseModel):
    event_type: Optional[str] = None
    event_date: Optional[str] = None
    event_time: Optional[str] = None
    venue: Optional[str] = None
    location: Optional[str] = None
    status: Optional[str] = None
    payment_status: Optional[str] = None
    discount: Optional[float] = None
    notes: Optional[str] = None

class EventResponse(BaseModel):
    id: int
    customer_id: int
    customer_name: str
    customer_phone: str
    event_type: str
    event_date: str
    event_time: Optional[str] = None
    venue: str
    location: Optional[str] = None
    status: str
    payment_status: str
    notes: Optional[str] = None
    services_subtotal: float = 0.0
    discount: float = 0.0
    total_amount: float
    advance_paid: float
    balance_due: float
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class EventDetailResponse(EventResponse):
    services: List[EventServiceResponse] = []
    payments: List[PaymentResponse] = []
    expenses: List[ExpenseResponse] = []
    tasks: List[TaskResponse] = []
    attachments: List[AttachmentResponse] = []
    total_expense: float = 0.0
    estimated_profit: float = 0.0

class CustomerDetailResponse(CustomerResponse):
    events: List[EventResponse] = []
    total_events: int = 0
    lifetime_revenue: float = 0.0
    pending_amount: float = 0.0

# Dashboard Response
class AlertItem(BaseModel):
    type: str # warning, info, reminder
    title: str
    message: str
    event_id: Optional[int] = None
    due_date: Optional[str] = None

class DashboardResponse(BaseModel):
    today_events_count: int
    upcoming_events_count: int
    pending_payment_total: float
    follow_ups_count: int
    prep_tasks_count: int
    today_events: List[EventResponse]
    upcoming_events: List[EventResponse]
    alerts: List[AlertItem]

# Finance Summary
class CategoryExpense(BaseModel):
    category: str
    amount: float

class FinanceSummaryResponse(BaseModel):
    revenue_today: float
    revenue_week: float
    revenue_month: float
    total_collected: float
    total_pending: float
    total_expenses: float
    estimated_profit: float
    completed_events_count: int
    upcoming_events_count: int
    expenses_by_category: List[CategoryExpense]

# Global Search
class SearchResult(BaseModel):
    customers: List[CustomerResponse]
    events: List[EventResponse]
    services: List[ServiceResponse]
