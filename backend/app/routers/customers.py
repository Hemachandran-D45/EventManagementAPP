from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database import get_db
from app.models.entities import Customer, Event
from app.schemas.schemas import CustomerResponse, CustomerCreate, CustomerDetailResponse, EventResponse
from app.routers.dashboard import serialize_event

router = APIRouter(prefix="/api/customers", tags=["Customers"])

@router.get("", response_model=List[CustomerResponse])
def list_customers(search: Optional[str] = Query(None), db: Session = Depends(get_db)):
    query = db.query(Customer)
    if search:
        s = f"%{search}%"
        query = query.filter((Customer.name.ilike(s)) | (Customer.phone.ilike(s)))
    customers = query.order_by(Customer.name.asc()).all()
    return customers

@router.post("", response_model=CustomerResponse)
def create_customer(data: CustomerCreate, db: Session = Depends(get_db)):
    existing = db.query(Customer).filter(Customer.phone == data.phone).first()
    if existing:
        return existing
    customer = Customer(**data.model_dump())
    db.add(customer)
    db.commit()
    db.refresh(customer)
    return customer

@router.get("/{customer_id}", response_model=CustomerDetailResponse)
def get_customer(customer_id: int, db: Session = Depends(get_db)):
    c = db.query(Customer).filter(Customer.id == customer_id).first()
    if not c:
        raise HTTPException(status_code=404, detail="Customer not found")

    events = [serialize_event(ev) for ev in c.events]
    total_rev = sum(ev.total_amount for ev in c.events)
    pending_amt = sum(ev.balance_due for ev in c.events)

    return CustomerDetailResponse(
        id=c.id,
        name=c.name,
        phone=c.phone,
        address=c.address,
        notes=c.notes,
        created_at=c.created_at,
        events=events,
        total_events=len(events),
        lifetime_revenue=total_rev,
        pending_amount=pending_amt
    )
