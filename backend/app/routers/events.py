from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, date
from app.database import get_db
from app.models.entities import Event, Customer, EventService, Payment, Invoice, Service
from app.schemas.schemas import (
    QuickOrderCreate, EventUpdate, EventResponse, EventDetailResponse,
    EventServiceResponse, PaymentResponse, ExpenseResponse, TaskResponse, AttachmentResponse
)
from app.routers.dashboard import serialize_event

router = APIRouter(prefix="/api/events", tags=["Events"])

def serialize_event_detail(ev: Event) -> EventDetailResponse:
    base = serialize_event(ev)
    return EventDetailResponse(
        **base.model_dump(),
        services=[
            EventServiceResponse(
                id=s.id,
                event_id=s.event_id,
                service_id=s.service_id,
                service_name=s.service_name,
                quantity=s.quantity,
                agreed_price=s.agreed_price,
                status=s.status,
                assigned_to=s.assigned_to,
                notes=s.notes
            ) for s in ev.services
        ],
        payments=[
            PaymentResponse(
                id=p.id,
                event_id=p.event_id,
                amount=p.amount,
                payment_date=p.payment_date,
                payment_method=p.payment_method,
                notes=p.notes,
                created_at=p.created_at
            ) for p in ev.payments
        ],
        expenses=[
            ExpenseResponse(
                id=e.id,
                event_id=e.event_id,
                amount=e.amount,
                category=e.category,
                description=e.description,
                date=e.date,
                created_at=e.created_at
            ) for e in ev.expenses
        ],
        tasks=[
            TaskResponse(
                id=t.id,
                event_id=t.event_id,
                title=t.title,
                due_date=t.due_date,
                status=t.status,
                created_at=t.created_at
            ) for t in ev.tasks
        ],
        attachments=[
            AttachmentResponse(
                id=a.id,
                event_id=a.event_id,
                file_name=a.file_name,
                file_url=a.file_url,
                file_type=a.file_type,
                created_at=a.created_at
            ) for a in ev.attachments
        ],
        total_expense=ev.total_expense,
        estimated_profit=ev.estimated_profit
    )

@router.get("", response_model=List[EventResponse])
def list_events(
    status: Optional[str] = Query(None),
    payment_status: Optional[str] = Query(None),
    month: Optional[str] = Query(None), # YYYY-MM
    db: Session = Depends(get_db)
):
    query = db.query(Event)
    if status:
        query = query.filter(Event.status == status)
    if payment_status:
        query = query.filter(Event.payment_status == payment_status)
    if month:
        query = query.filter(Event.event_date.startswith(month))
    
    events = query.order_by(Event.event_date.desc()).all()
    return [serialize_event(e) for e in events]

@router.post("/quick-order", response_model=EventDetailResponse)
def create_quick_order(data: QuickOrderCreate, db: Session = Depends(get_db)):
    # Find or create customer
    customer = db.query(Customer).filter(Customer.phone == data.customer_phone).first()
    if not customer:
        customer = Customer(
            name=data.customer_name,
            phone=data.customer_phone,
            address=data.customer_address
        )
        db.add(customer)
        db.flush()
    else:
        # Update name if changed
        if data.customer_name and data.customer_name != customer.name:
            customer.name = data.customer_name

    # Create event
    event = Event(
        customer_id=customer.id,
        event_type=data.event_type,
        event_date=data.event_date,
        event_time=data.event_time,
        venue=data.venue,
        location=data.location,
        status="CONFIRMED",
        payment_status="UNPAID",
        discount=data.discount or 0.0,
        notes=data.notes
    )
    db.add(event)
    db.flush()

    # Add services
    total_agreed = 0.0
    for s_item in data.services:
        line_price = s_item.agreed_price
        total_agreed += line_price * s_item.quantity
        es = EventService(
            event_id=event.id,
            service_id=s_item.service_id,
            service_name=s_item.service_name,
            quantity=s_item.quantity,
            agreed_price=s_item.agreed_price,
            status="PENDING",
            assigned_to=s_item.assigned_to,
            notes=s_item.notes
        )
        db.add(es)

    # If advance amount is provided, record payment
    if data.advance_amount > 0:
        pmt = Payment(
            event_id=event.id,
            amount=data.advance_amount,
            payment_date=data.event_date,
            payment_method=data.payment_method,
            notes="Initial Advance Payment"
        )
        db.add(pmt)
        final_total = max(0.0, total_agreed - (data.discount or 0.0))
        if data.advance_amount >= final_total and final_total > 0:
            event.payment_status = "PAID"
        else:
            event.payment_status = "PARTIAL"

    db.commit()
    db.refresh(event)
    return serialize_event_detail(event)

@router.get("/{event_id}", response_model=EventDetailResponse)
def get_event(event_id: int, db: Session = Depends(get_db)):
    ev = db.query(Event).filter(Event.id == event_id).first()
    if not ev:
        raise HTTPException(status_code=404, detail="Event not found")
    return serialize_event_detail(ev)

@router.patch("/{event_id}", response_model=EventDetailResponse)
def update_event(event_id: int, data: EventUpdate, db: Session = Depends(get_db)):
    ev = db.query(Event).filter(Event.id == event_id).first()
    if not ev:
        raise HTTPException(status_code=404, detail="Event not found")
    
    update_dict = data.model_dump(exclude_unset=True)
    for field, val in update_dict.items():
        setattr(ev, field, val)
        
    db.commit()
    db.refresh(ev)
    return serialize_event_detail(ev)

@router.patch("/{event_id}/services/{service_id}/status")
def toggle_service_status(
    event_id: int,
    service_id: int,
    status: str = Query(...), # PENDING or READY
    assigned_to: Optional[str] = Query(None),
    notes: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    es = db.query(EventService).filter(EventService.id == service_id, EventService.event_id == event_id).first()
    if not es:
        raise HTTPException(status_code=404, detail="Service item not found")
    
    es.status = status
    if assigned_to is not None:
        es.assigned_to = assigned_to
    if notes is not None:
        es.notes = notes

    # Check if all services are READY, then optionally update event status to READY
    ev = es.event
    all_ready = all(s.status == "READY" for s in ev.services)
    if all_ready and ev.status == "PREPARING":
        ev.status = "READY"

    db.commit()
    return {"message": "Service checklist updated", "status": es.status, "assigned_to": es.assigned_to}

@router.delete("/{event_id}")
def delete_event(event_id: int, db: Session = Depends(get_db)):
    ev = db.query(Event).filter(Event.id == event_id).first()
    if not ev:
        raise HTTPException(status_code=404, detail="Event not found")
    db.delete(ev)
    db.commit()
    return {"message": "Event deleted successfully"}
