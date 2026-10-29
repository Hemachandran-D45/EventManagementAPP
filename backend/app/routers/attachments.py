import os
import uuid
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.config import UPLOAD_DIR
from app.models.entities import Event, Attachment
from app.schemas.schemas import AttachmentResponse

router = APIRouter(prefix="/api/attachments", tags=["Attachments"])

ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp", ".pdf"}
DANGEROUS_EXTENSIONS = {
    ".py", ".pyc", ".sh", ".bash", ".php", ".phtml", ".phar", ".pl", ".cgi",
    ".exe", ".bat", ".cmd", ".js", ".jsp", ".asp", ".aspx", ".html", ".htm",
    ".svg", ".jar", ".bin", ".elf", ".so", ".dll", ".scr", ".com", ".vbs"
}
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 MB

def validate_magic_bytes(header: bytes, ext: str) -> bool:
    if ext in [".jpg", ".jpeg"]:
        return header.startswith(b"\xff\xd8\xff")
    if ext == ".png":
        return header.startswith(b"\x89PNG\r\n\x1a\n")
    if ext == ".webp":
        return len(header) >= 12 and header[:4] == b"RIFF" and header[8:12] == b"WEBP"
    if ext == ".pdf":
        return header.startswith(b"%PDF-")
    return False

@router.post("/{event_id}/upload", response_model=AttachmentResponse)
async def upload_attachment(
    event_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    ev = db.query(Event).filter(Event.id == event_id).first()
    if not ev:
        raise HTTPException(status_code=404, detail="Event not found")

    raw_name = file.filename or "attachment"
    _, raw_ext = os.path.splitext(raw_name)
    ext = raw_ext.lower().strip()

    # 1. Double extension check (e.g. malicious payload "shell.php.jpg")
    parts = raw_name.lower().split(".")
    for part in parts[:-1]:
        if f".{part}" in DANGEROUS_EXTENSIONS:
            raise HTTPException(status_code=400, detail="Security violation: Suspicious multi-extension file rejected.")

    # 2. Strict whitelist check
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Security violation: File type '{ext}' is forbidden. Only JPG, PNG, WEBP, and PDF files are permitted."
        )

    # 3. Read content & enforce size limit
    content = await file.read()
    if len(content) > MAX_FILE_SIZE:
        raise HTTPException(status_code=413, detail="File too large. Maximum allowed size is 10 MB.")
    if len(content) < 4:
        raise HTTPException(status_code=400, detail="Invalid empty file.")

    # 4. Magic bytes validation (verifies real image/PDF binary signature)
    if not validate_magic_bytes(content[:32], ext):
        raise HTTPException(
            status_code=400,
            detail="Security violation: File header signature does not match declared extension."
        )

    # 5. Pure UUID filename (strictly prevents path traversal or webshell naming)
    safe_name = f"att_{uuid.uuid4().hex[:20]}{ext}"
    file_path = os.path.join(UPLOAD_DIR, safe_name)

    with open(file_path, "wb") as buffer:
        buffer.write(content)

    file_type = "image" if ext in [".jpg", ".jpeg", ".png", ".webp"] else "document"
    
    # Store sanitized original name for display, but safe UUID path for URL
    clean_display_name = os.path.basename(raw_name).replace("..", "").replace("/", "").replace("\\", "")[:80]
    
    att = Attachment(
        event_id=event_id,
        file_name=clean_display_name,
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
    
    # Try removing the physical file if exists (using only basename to prevent traversal)
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
