from fastapi import APIRouter, Depends, HTTPException, Response, Request
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
def get_invoice_pdf(event_id: int, inline: bool = False, db: Session = Depends(get_db)):
    ev = db.query(Event).filter(Event.id == event_id).first()
    if not ev:
        raise HTTPException(status_code=404, detail="Event not found")
    
    pdf_bytes = generate_invoice_pdf(ev, doc_type="INVOICE")
    filename = f"Invoice_{ev.id}_{ev.customer.name.replace(' ', '_')}.pdf"
    disposition = "inline" if inline else "attachment"
    
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={
            "Content-Disposition": f'{disposition}; filename="{filename}"',
            "Access-Control-Expose-Headers": "Content-Disposition"
        }
    )

@router.get("/estimate/{event_id}/pdf")
def get_estimate_pdf(event_id: int, inline: bool = False, db: Session = Depends(get_db)):
    ev = db.query(Event).filter(Event.id == event_id).first()
    if not ev:
        raise HTTPException(status_code=404, detail="Event not found")
    
    pdf_bytes = generate_invoice_pdf(ev, doc_type="ESTIMATE")
    filename = f"Estimate_{ev.id}_{ev.customer.name.replace(' ', '_')}.pdf"
    disposition = "inline" if inline else "attachment"
    
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={
            "Content-Disposition": f'{disposition}; filename="{filename}"',
            "Access-Control-Expose-Headers": "Content-Disposition"
        }
    )

@router.get("/whatsapp/{event_id}")
def get_whatsapp_templates(event_id: int, request: Request, db: Session = Depends(get_db)):
    ev = db.query(Event).filter(Event.id == event_id).first()
    if not ev:
        raise HTTPException(status_code=404, detail="Event not found")

    proto = request.headers.get("x-forwarded-proto", request.url.scheme)
    host = request.headers.get("x-forwarded-host", request.headers.get("host", request.url.netloc))
    base_url = f"{proto}://{host}"

    invoice_pdf_url = f"{base_url}/api/billing/invoice/{ev.id}/pdf"
    estimate_pdf_url = f"{base_url}/api/billing/estimate/{ev.id}/pdf"

    phone = ev.customer.phone
    quotation_text = get_whatsapp_quotation_text(ev, pdf_url=estimate_pdf_url)
    confirm_text = get_whatsapp_confirmation_text(ev, pdf_url=invoice_pdf_url)
    bill_text = get_whatsapp_bill_text(ev, pdf_url=invoice_pdf_url)
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
