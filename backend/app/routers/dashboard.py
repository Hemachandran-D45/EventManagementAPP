from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from datetime import date
from app.database import get_db
from app.models.entities import Event, Customer, Task
from app.schemas.schemas import DashboardResponse, EventResponse, AlertItem
from app.services.reminder_engine import compute_event_reminders_and_alerts

router = APIRouter(prefix="/api/dashboard", tags=["Dashboard"])

def serialize_event(ev: Event) -> EventResponse:
    return EventResponse(
        id=ev.id,
        customer_id=ev.customer_id,
        customer_name=ev.customer.name if ev.customer else "Unknown",
        customer_phone=ev.customer.phone if ev.customer else "",
        event_type=ev.event_type,
        event_date=ev.event_date,
        event_time=ev.event_time,
        venue=ev.venue,
        location=ev.location,
        status=ev.status,
        payment_status=ev.payment_status,
        notes=ev.notes,
        services_subtotal=ev.services_subtotal,
        discount=ev.discount or 0.0,
        total_amount=ev.total_amount,
        advance_paid=ev.advance_paid,
        balance_due=ev.balance_due,
        created_at=ev.created_at
    )

@router.get("", response_model=DashboardResponse)
def get_dashboard(db: Session = Depends(get_db)):
    today_str = date.today().strftime("%Y-%m-%d")
    
    all_events = db.query(Event).all()
    
    today_events = [ev for ev in all_events if ev.event_date == today_str]
    upcoming_events = [ev for ev in all_events if ev.event_date > today_str and ev.status not in ["COMPLETED", "CLOSED"]]
    upcoming_events.sort(key=lambda x: x.event_date)
    
    pending_payment_total = sum(ev.balance_due for ev in all_events if ev.status != "CLOSED")
    
    prep_tasks_count = 0
    for ev in all_events:
        if ev.status in ["NEW", "CONFIRMED", "PREPARING"]:
            prep_tasks_count += sum(1 for s in ev.services if s.status != "READY")
            
    alerts_raw = compute_event_reminders_and_alerts(all_events)
    alerts = [AlertItem(**a) for a in alerts_raw]
    
    return DashboardResponse(
        today_events_count=len(today_events),
        upcoming_events_count=len(upcoming_events),
        pending_payment_total=pending_payment_total,
        follow_ups_count=len(alerts),
        prep_tasks_count=prep_tasks_count,
        today_events=[serialize_event(ev) for ev in today_events],
        upcoming_events=[serialize_event(ev) for ev in upcoming_events[:5]],
        alerts=alerts
    )
