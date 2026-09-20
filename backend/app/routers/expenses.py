from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models.entities import Event, Expense
from app.schemas.schemas import ExpenseCreate, ExpenseResponse

router = APIRouter(prefix="/api/expenses", tags=["Expenses"])

@router.post("/{event_id}", response_model=ExpenseResponse)
def record_expense(event_id: int, data: ExpenseCreate, db: Session = Depends(get_db)):
    ev = db.query(Event).filter(Event.id == event_id).first()
    if not ev:
        raise HTTPException(status_code=404, detail="Event not found")

    exp = Expense(
        event_id=event_id,
        amount=data.amount,
        category=data.category,
        description=data.description,
        date=data.date
    )
    db.add(exp)
    db.commit()
    db.refresh(exp)
    return exp

@router.get("/{event_id}", response_model=List[ExpenseResponse])
def get_event_expenses(event_id: int, db: Session = Depends(get_db)):
    return db.query(Expense).filter(Expense.event_id == event_id).order_by(Expense.date.desc()).all()
