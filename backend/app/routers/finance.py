from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from datetime import date, timedelta
from collections import defaultdict
from app.database import get_db
from app.models.entities import Event, Payment, Expense
from app.schemas.schemas import FinanceSummaryResponse, CategoryExpense

router = APIRouter(prefix="/api/finance", tags=["Finance & Reports"])

@router.get("/summary", response_model=FinanceSummaryResponse)
def get_finance_summary(db: Session = Depends(get_db)):
    today_str = date.today().strftime("%Y-%m-%d")
    first_day_of_month = date.today().replace(day=1).strftime("%Y-%m-%d")
    start_of_week = (date.today() - timedelta(days=date.today().weekday())).strftime("%Y-%m-%d")

    all_events = db.query(Event).all()
    all_payments = db.query(Payment).all()
    all_expenses = db.query(Expense).all()

    rev_today = sum(p.amount for p in all_payments if p.payment_date == today_str)
    rev_week = sum(p.amount for p in all_payments if p.payment_date >= start_of_week)
    rev_month = sum(p.amount for p in all_payments if p.payment_date >= first_day_of_month)

    total_collected = sum(p.amount for p in all_payments)
    total_pending = sum(ev.balance_due for ev in all_events if ev.status != "CLOSED")
    total_expenses = sum(e.amount for e in all_expenses)
    
    total_revenue_agreed = sum(ev.total_amount for ev in all_events)
    estimated_profit = total_revenue_agreed - total_expenses

    completed_events = sum(1 for ev in all_events if ev.status in ["COMPLETED", "CLOSED"])
    upcoming_events = sum(1 for ev in all_events if ev.event_date >= today_str and ev.status not in ["COMPLETED", "CLOSED"])

    cat_map = defaultdict(float)
    for e in all_expenses:
        cat_map[e.category] += e.amount

    return FinanceSummaryResponse(
        revenue_today=rev_today,
        revenue_week=rev_week,
        revenue_month=rev_month,
        total_collected=total_collected,
        total_pending=total_pending,
        total_expenses=total_expenses,
        estimated_profit=estimated_profit,
        completed_events_count=completed_events,
        upcoming_events_count=upcoming_events,
        expenses_by_category=[CategoryExpense(category=k, amount=v) for k, v in cat_map.items()]
    )
