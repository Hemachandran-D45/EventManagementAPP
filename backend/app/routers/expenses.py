from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models.entities import Event, Expense
from app.schemas.schemas import ExpenseCreate, ExpenseUpdate, ExpenseResponse

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

@router.put("/{expense_id}", response_model=ExpenseResponse)
def update_expense(expense_id: int, data: ExpenseUpdate, db: Session = Depends(get_db)):
    exp = db.query(Expense).filter(Expense.id == expense_id).first()
    if not exp:
        raise HTTPException(status_code=404, detail="Expense not found")
    
    if data.amount is not None:
        exp.amount = data.amount
    if data.category is not None:
        exp.category = data.category
    if data.description is not None:
        exp.description = data.description
    if data.date is not None:
        exp.date = data.date

    db.commit()
    db.refresh(exp)
    return exp

@router.delete("/{expense_id}")
def delete_expense(expense_id: int, db: Session = Depends(get_db)):
    exp = db.query(Expense).filter(Expense.id == expense_id).first()
    if not exp:
        raise HTTPException(status_code=404, detail="Expense not found")
    
    db.delete(exp)
    db.commit()
    return {"message": "Expense deleted successfully"}

