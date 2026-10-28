from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime, date
from app.database import get_db
from app.models.entities import Event, Payment
from app.schemas.schemas import PaymentCreate, PaymentResponse, FinalSettlementRequest, EventDetailResponse
from app.routers.dashboard import serialize_event

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

@router.post("/{event_id}/final-settle")
def final_settle_event_payment(
    event_id: int,
    data: FinalSettlementRequest,
    db: Session = Depends(get_db)
):
    """
    Settle & Close deal with whatever amount was finally given.
    Handles the real-world event negotiation where client and owner agree to close:
    - Records final cash/UPI payment if any was handed over
    - Automatically adjusts the remaining difference as 'settlement_discount'
    - Sets payment_status = 'SETTLED' and balance_due = 0.0
    """
    ev = db.query(Event).filter(Event.id == event_id).first()
    if not ev:
        raise HTTPException(status_code=404, detail="Event not found")

    today_str = data.payment_date or date.today().strftime("%Y-%m-%d")

    # 1. Record any final payment handed over
    if data.final_payment_amount > 0:
        settlement_note = data.settlement_notes or "Final Settlement Payment - Deal Closed"
        final_pmt = Payment(
            event_id=event_id,
            amount=data.final_payment_amount,
            payment_date=today_str,
            payment_method=data.payment_method,
            notes=settlement_note
        )
        db.add(final_pmt)
        db.flush()

    # 2. Total collected so far
    total_collected = sum(p.amount for p in ev.payments)

    # 3. Preserve the initial agreed amount if not already preserved
    if ev.initial_discussed_amount is None:
        ev.initial_discussed_amount = max(0.0, ev.services_subtotal - (ev.discount or 0.0))

    # 4. If waiving remaining balance, calculate settlement discount
    if data.waive_remaining_balance:
        # Difference between original agreed amount and what was actually collected
        difference = max(0.0, ev.discussed_total - total_collected)
        ev.settlement_discount = difference
    
    ev.is_settled = True
    ev.settled_at = datetime.utcnow()
    ev.payment_status = "SETTLED"
    ev.settlement_notes = data.settlement_notes or f"Deal settled and closed with total collections of ₹{total_collected:,.2f}"

    db.commit()
    db.refresh(ev)
    from app.routers.events import serialize_event_detail
    return serialize_event_detail(ev)

@router.get("/{event_id}", response_model=List[PaymentResponse])
def get_event_payments(event_id: int, db: Session = Depends(get_db)):
    return db.query(Payment).filter(Payment.event_id == event_id).order_by(Payment.payment_date.desc()).all()
