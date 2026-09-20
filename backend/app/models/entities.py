from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Boolean, Text
from sqlalchemy.orm import relationship
from app.database import Base

class Customer(Base):
    __tablename__ = "customers"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False, index=True)
    phone = Column(String(50), nullable=False, index=True)
    address = Column(String(255), nullable=True)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    events = relationship("Event", back_populates="customer", cascade="all, delete-orphan")

class Service(Base):
    __tablename__ = "services"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False, unique=True, index=True)
    default_price = Column(Float, nullable=False, default=0.0)
    category = Column(String(100), default="General")
    active = Column(Boolean, default=True)

class Event(Base):
    __tablename__ = "events"

    id = Column(Integer, primary_key=True, index=True)
    customer_id = Column(Integer, ForeignKey("customers.id"), nullable=False)
    event_type = Column(String(100), nullable=False) # Wedding, Reception, Birthday, Temple Festival, etc.
    event_date = Column(String(20), nullable=False, index=True) # YYYY-MM-DD
    event_time = Column(String(20), nullable=True) # e.g. 7:00 PM
    venue = Column(String(255), nullable=False)
    location = Column(String(255), nullable=True) # City / Area
    status = Column(String(50), default="NEW", index=True) # NEW, CONFIRMED, PREPARING, READY, COMPLETED, CLOSED
    payment_status = Column(String(50), default="UNPAID", index=True) # UNPAID, PARTIAL, PAID
    discount = Column(Float, nullable=False, default=0.0) # Negotiation / discount / offer
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    customer = relationship("Customer", back_populates="events")
    services = relationship("EventService", back_populates="event", cascade="all, delete-orphan")
    payments = relationship("Payment", back_populates="event", cascade="all, delete-orphan")
    expenses = relationship("Expense", back_populates="event", cascade="all, delete-orphan")
    tasks = relationship("Task", back_populates="event", cascade="all, delete-orphan")
    attachments = relationship("Attachment", back_populates="event", cascade="all, delete-orphan")
    invoice = relationship("Invoice", uselist=False, back_populates="event", cascade="all, delete-orphan")

    @property
    def services_subtotal(self) -> float:
        return sum(s.agreed_price * s.quantity for s in self.services)

    @property
    def total_amount(self) -> float:
        return max(0.0, self.services_subtotal - (self.discount or 0.0))

    @property
    def advance_paid(self) -> float:
        return sum(p.amount for p in self.payments)

    @property
    def balance_due(self) -> float:
        return max(0.0, self.total_amount - self.advance_paid)

    @property
    def total_expense(self) -> float:
        return sum(e.amount for e in self.expenses)

    @property
    def estimated_profit(self) -> float:
        return self.total_amount - self.total_expense

class EventService(Base):
    __tablename__ = "event_services"

    id = Column(Integer, primary_key=True, index=True)
    event_id = Column(Integer, ForeignKey("events.id"), nullable=False)
    service_id = Column(Integer, ForeignKey("services.id"), nullable=True)
    service_name = Column(String(255), nullable=False)
    quantity = Column(Integer, default=1)
    agreed_price = Column(Float, nullable=False, default=0.0)
    status = Column(String(50), default="PENDING") # PENDING, READY
    assigned_to = Column(String(255), nullable=True) # Vendor/staff name
    notes = Column(Text, nullable=True)

    event = relationship("Event", back_populates="services")

class Payment(Base):
    __tablename__ = "payments"

    id = Column(Integer, primary_key=True, index=True)
    event_id = Column(Integer, ForeignKey("events.id"), nullable=False)
    amount = Column(Float, nullable=False)
    payment_date = Column(String(20), nullable=False) # YYYY-MM-DD
    payment_method = Column(String(50), default="CASH") # CASH, UPI, BANK_TRANSFER, OTHER
    notes = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    event = relationship("Event", back_populates="payments")

class Expense(Base):
    __tablename__ = "expenses"

    id = Column(Integer, primary_key=True, index=True)
    event_id = Column(Integer, ForeignKey("events.id"), nullable=False)
    amount = Column(Float, nullable=False)
    category = Column(String(100), nullable=False) # Transport, Labour, Rental, Food, Materials, Other
    description = Column(String(255), nullable=True)
    date = Column(String(20), nullable=False) # YYYY-MM-DD
    created_at = Column(DateTime, default=datetime.utcnow)

    event = relationship("Event", back_populates="expenses")

class Task(Base):
    __tablename__ = "tasks"

    id = Column(Integer, primary_key=True, index=True)
    event_id = Column(Integer, ForeignKey("events.id"), nullable=False)
    title = Column(String(255), nullable=False)
    due_date = Column(String(20), nullable=True)
    status = Column(String(50), default="PENDING") # PENDING, COMPLETED
    created_at = Column(DateTime, default=datetime.utcnow)

    event = relationship("Event", back_populates="tasks")

class Attachment(Base):
    __tablename__ = "attachments"

    id = Column(Integer, primary_key=True, index=True)
    event_id = Column(Integer, ForeignKey("events.id"), nullable=False)
    file_name = Column(String(255), nullable=False)
    file_url = Column(String(500), nullable=False)
    file_type = Column(String(50), default="image") # image, document
    created_at = Column(DateTime, default=datetime.utcnow)

    event = relationship("Event", back_populates="attachments")

class Invoice(Base):
    __tablename__ = "invoices"

    id = Column(Integer, primary_key=True, index=True)
    event_id = Column(Integer, ForeignKey("events.id"), nullable=False, unique=True)
    invoice_number = Column(String(50), unique=True, nullable=False)
    subtotal = Column(Float, nullable=False, default=0.0)
    discount = Column(Float, nullable=False, default=0.0)
    total = Column(Float, nullable=False, default=0.0)
    advance_paid = Column(Float, nullable=False, default=0.0)
    balance_due = Column(Float, nullable=False, default=0.0)
    generated_at = Column(DateTime, default=datetime.utcnow)

    event = relationship("Event", back_populates="invoice")
