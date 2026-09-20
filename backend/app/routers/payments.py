from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime
from app.database import get_db
from app.models.entities import Event, Payment
from app.schemas.schemas import PaymentCreate, PaymentResponse

router = APIRouter(prefix="/api/payments", tags=["Payments"])

@router.post("/{event_id}", response_model=PaymentResponse)
def record_payment(event_id: int, data: PaymentCreate, db: Session = Depends(get_db)):
    ev = db.query(Event).filter(Event.id == event_id).first()
    if not ev:
        raise HTTPException(status_code=404, detail="Event not found")

    pmt = Payment(
        event_id=event_id,
        amount=data.amount,
        payment_date=data.payment_date,
        payment_method=data.payment_method,
        notes=data.notes
    )
    db.add(pmt)
    db.flush()

    # Recalculate event payment status
    total = ev.total_amount
    paid = ev.advance_paid
    if paid >= total:
        ev.payment_status = "PAID"
    elif paid > 0:
        ev.payment_status = "PARTIAL"
    else:
        ev.payment_status = "UNPAID"

    db.commit()
    db.refresh(pmt)
    return pmt

@router.get("/{event_id}", response_model=List[PaymentResponse])
def get_event_payments(event_id: int, db: Session = Depends(get_db)):
    return db.query(Payment).filter(Payment.event_id == event_id).order_by(Payment.payment_date.desc()).all()
