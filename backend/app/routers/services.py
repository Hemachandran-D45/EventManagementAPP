from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models.entities import Service
from app.schemas.schemas import ServiceResponse, ServiceCreate

router = APIRouter(prefix="/api/services", tags=["Services Catalog"])

@router.get("", response_model=List[ServiceResponse])
def list_services(db: Session = Depends(get_db)):
    return db.query(Service).filter(Service.active == True).order_by(Service.name.asc()).all()

@router.post("", response_model=ServiceResponse)
def create_service(data: ServiceCreate, db: Session = Depends(get_db)):
    existing = db.query(Service).filter(Service.name == data.name).first()
    if existing:
        existing.active = True
        existing.default_price = data.default_price
        existing.category = data.category
        db.commit()
        db.refresh(existing)
        return existing
    srv = Service(**data.model_dump())
    db.add(srv)
    db.commit()
    db.refresh(srv)
    return srv

@router.put("/{service_id}", response_model=ServiceResponse)
def update_service(service_id: int, data: ServiceCreate, db: Session = Depends(get_db)):
    srv = db.query(Service).filter(Service.id == service_id).first()
    if not srv:
        raise HTTPException(status_code=404, detail="Service not found")
    for key, val in data.model_dump().items():
        setattr(srv, key, val)
    db.commit()
    db.refresh(srv)
    return srv

@router.delete("/{service_id}")
def delete_service(service_id: int, db: Session = Depends(get_db)):
    srv = db.query(Service).filter(Service.id == service_id).first()
    if not srv:
        raise HTTPException(status_code=404, detail="Service not found")
    # Soft delete so historical events referencing service_id remain intact
    srv.active = False
    db.commit()
    return {"message": "Service removed from catalog", "id": service_id}
