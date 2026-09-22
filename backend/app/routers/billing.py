from fastapi import APIRouter, Depends, HTTPException, Response
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.entities import Event
from app.services.pdf_generator import generate_invoice_pdf
from app.services.whatsapp_service import (
    get_whatsapp_quotation_text,
    get_whatsapp_confirmation_text,
    get_whatsapp_bill_text,
    get_whatsapp_payment_reminder_text,
    get_whatsapp_crew_text,
    format_whatsapp_link
)

router = APIRouter(prefix="/api/billing", tags=["Billing & Invoicing"])

@router.get("/invoice/{event_id}/pdf")
def get_invoice_pdf(event_id: int, db: Session = Depends(get_db)):
    ev = db.query(Event).filter(Event.id == event_id).first()
    if not ev:
        raise HTTPException(status_code=404, detail="Event not found")
    
    pdf_bytes = generate_invoice_pdf(ev, doc_type="INVOICE")
    filename = f"Invoice_{ev.id}_{ev.customer.name.replace(' ', '_')}.pdf"
    
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": f"inline; filename={filename}"}
    )

@router.get("/estimate/{event_id}/pdf")
def get_estimate_pdf(event_id: int, db: Session = Depends(get_db)):
    ev = db.query(Event).filter(Event.id == event_id).first()
    if not ev:
        raise HTTPException(status_code=404, detail="Event not found")
    
    pdf_bytes = generate_invoice_pdf(ev, doc_type="ESTIMATE")
    filename = f"Estimate_{ev.id}_{ev.customer.name.replace(' ', '_')}.pdf"
    
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": f"inline; filename={filename}"}
    )

@router.get("/whatsapp/{event_id}")
def get_whatsapp_templates(event_id: int, db: Session = Depends(get_db)):
    ev = db.query(Event).filter(Event.id == event_id).first()
    if not ev:
        raise HTTPException(status_code=404, detail="Event not found")

    phone = ev.customer.phone
    quotation_text = get_whatsapp_quotation_text(ev)
    confirm_text = get_whatsapp_confirmation_text(ev)
    bill_text = get_whatsapp_bill_text(ev)
    reminder_text = get_whatsapp_payment_reminder_text(ev)
    crew_text = get_whatsapp_crew_text(ev)

    return {
        "customer_phone": phone,
        "quotation": {
            "text": quotation_text,
            "url": format_whatsapp_link(phone, quotation_text)
        },
        "confirmation": {
            "text": confirm_text,
            "url": format_whatsapp_link(phone, confirm_text)
        },
        "bill": {
            "text": bill_text,
            "url": format_whatsapp_link(phone, bill_text)
        },
        "payment_reminder": {
            "text": reminder_text,
            "url": format_whatsapp_link(phone, reminder_text)
        },
        "crew_brief": {
            "text": crew_text,
            "url": format_whatsapp_link(phone, crew_text)
        }
    }
