from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.entities import Customer, Event, Service
from app.schemas.schemas import SearchResult, CustomerResponse, ServiceResponse
from app.routers.dashboard import serialize_event

router = APIRouter(prefix="/api/search", tags=["Search"])

@router.get("", response_model=SearchResult)
def global_search(q: str = Query(..., min_length=1), db: Session = Depends(get_db)):
    term = f"%{q}%"
    
    customers = db.query(Customer).filter(
        (Customer.name.ilike(term)) | (Customer.phone.ilike(term)) | (Customer.notes.ilike(term))
    ).limit(10).all()

    events = db.query(Event).join(Customer).filter(
        (Event.event_type.ilike(term)) |
        (Event.venue.ilike(term)) |
        (Event.location.ilike(term)) |
        (Customer.name.ilike(term)) |
        (Customer.phone.ilike(term))
    ).limit(10).all()

    services = db.query(Service).filter(
        Service.name.ilike(term)
    ).limit(10).all()

    return SearchResult(
        customers=[c for c in customers],
        events=[serialize_event(e) for e in events],
        services=[s for s in services]
    )
