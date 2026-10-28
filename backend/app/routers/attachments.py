import os
import shutil
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.config import UPLOAD_DIR
from app.models.entities import Event, Attachment
from app.schemas.schemas import AttachmentResponse

router = APIRouter(prefix="/api/attachments", tags=["Attachments"])

@router.post("/{event_id}/upload", response_model=AttachmentResponse)
def upload_attachment(
    event_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    ev = db.query(Event).filter(Event.id == event_id).first()
    if not ev:
        raise HTTPException(status_code=404, detail="Event not found")

    file_extension = os.path.splitext(file.filename)[1]
    safe_name = f"event_{event_id}_{int(datetime.utcnow().timestamp())}_{file.filename}"
    file_path = os.path.join(UPLOAD_DIR, safe_name)

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    file_type = "image" if file_extension.lower() in [".jpg", ".jpeg", ".png", ".webp"] else "document"
    att = Attachment(
        event_id=event_id,
        file_name=file.filename,
        file_url=f"/uploads/{safe_name}",
        file_type=file_type
    )
    db.add(att)
    db.commit()
    db.refresh(att)
    return att

@router.get("/{event_id}", response_model=List[AttachmentResponse])
def get_event_attachments(event_id: int, db: Session = Depends(get_db)):
    return db.query(Attachment).filter(Attachment.event_id == event_id).all()

@router.delete("/{attachment_id}")
def delete_attachment(attachment_id: int, db: Session = Depends(get_db)):
    att = db.query(Attachment).filter(Attachment.id == attachment_id).first()
    if not att:
        raise HTTPException(status_code=404, detail="Attachment not found")
    
    # Try removing the physical file if exists
    try:
        filename = os.path.basename(att.file_url)
        filepath = os.path.join(UPLOAD_DIR, filename)
        if os.path.exists(filepath):
            os.remove(filepath)
    except Exception:
        pass

    db.delete(att)
    db.commit()
    return {"message": "Attachment deleted successfully", "id": attachment_id}
