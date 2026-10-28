from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
import urllib.parse
from app.database import get_db
from app.models.entities import Customer, Event, Service, EventService

router = APIRouter(prefix="/api/public", tags=["Public Website"])

# Curated experience details for the public showcase (strictly NO pricing)
SERVICE_EXPERIENCE_INFO = {
    "DJ Setup & Sound": {
        "description": "High-octane concert sound systems calibrated for punchy bass and crystal-clear vocals.",
        "experience": "Transforms your venue into a pulsating dance floor with club-standard live mixing.",
        "highlights": ["Acoustically tuned line arrays", "Pro Pioneer DJ gear", "Wireless UHF mics"]
    },
    "High-Definition LED Wall (8x12)": {
        "description": "Ultra-fine pixel pitch LED video backdrop for cinematic visuals, live camera feeds, and custom visuals.",
        "experience": "Immerses guests in stadium-scale visuals and high-definition couple/brand storytelling.",
        "highlights": ["P2.9 Ultra-HD clarity", "Seamless video processors", "Daylight high-nit brightness"]
    },
    "Stage Ambient & Sharpie Lighting": {
        "description": "Intelligent beam movers, warm white blinder washes, and programmable architectural ambiance.",
        "experience": "Sculpts the stage mood dynamically from romantic ceremony warmth to festival energy.",
        "highlights": ["7R Sharpie moving beams", "RGBW ambient stage wash", "DMX computer lighting desk"]
    },
    "Heavy Fog Machine": {
        "description": "Dry-ice low-lying dense white fog that stays locked to the floor for fairy-tale moments.",
        "experience": "Creates the breathtaking 'dancing on clouds' visual for grand bride/groom entries and first dances.",
        "highlights": ["100% Odorless & residue-free", "Stays below knee-level", "High-volume instant release"]
    },
    "Cold Pyro Fireworks (4 Shots)": {
        "description": "Indoor-safe sparkular fountains producing brilliant golden volcanic sparks with zero fire hazard.",
        "experience": "Pumps pure adrenaline during ring exchanges, stage cake cutting, or VIP celebrity entries.",
        "highlights": ["Indoor smokeless formula", "Safe cold-touch spark tech", "Precision remote firing"]
    },
    "Live Orchestra Band": {
        "description": "Seasoned musicians performing evergreen retro classics, acoustic melodies, and trending mass hits.",
        "experience": "Fills the evening with soul-stirring live instrumentation that engages all generations.",
        "highlights": ["Multi-genre versatility", "Live brass & percussion", "Stage audio monitors included"]
    },
    "Dance Troupe (6 Artists)": {
        "description": "Choreographed professional performers delivering cinematic, traditional, and western dance sets.",
        "experience": "Electrifies your crowd between event ceremonies with seamless stage transitions.",
        "highlights": ["Thematic custom costumes", "High-energy sync choreography", "Interactive crowd animation"]
    },
    "Chenda Melam (Traditional)": {
        "description": "Thunderous authentic Kerala traditional percussion ensemble delivering raw, rhythmic power.",
        "experience": "Commands instant attention, bringing sacred majesty and goosebumps to auspicious entries.",
        "highlights": ["Authentic seasoned drummers", "Traditional festive attire", "High-impact acoustic roar"]
    },
    "Elephant Trunk Entry": {
        "description": "Ornate mechanical elephant trunk archway offering a regal royal salute to the guests of honor.",
        "experience": "Delivers an unforgettable royal reception entry that looks stunning in photos and videos.",
        "highlights": ["Grand mechanical arches", "Aesthetic floral detailing", "Safe motorized salute action"]
    },
    "Floral Stage Decoration": {
        "description": "Bespoke floral artistry, luxury drapery, and thematic stage backdrop architecture.",
        "experience": "Sets an opulent aesthetic tone tailored to the client's wedding or brand color theme.",
        "highlights": ["Fresh exotic & seasonal blooms", "Custom color schemes", "Sturdy structural framing"]
    },
    "Professional Photography & Video": {
        "description": "Master camera operators capturing moments in ultra-HD 4K cinematic film and candid photography.",
        "experience": "Preserves every smile, cheer, tear, and celebration in timeless, magazine-grade clarity.",
        "highlights": ["Dual 4K cinema cameras", "Gimbal stabilized footage", "Same-day highlight teaser edit"]
    },
    "Bouncer Team (1 Coordinator + 4 Bouncers)": {
        "description": "Trained, certified physical security and crowd management personnel in smart uniform.",
        "experience": "Ensures VIP protection, smooth guest flow, and complete peace of mind for the host family.",
        "highlights": ["Dedicated chief coordinator", "Imposing professional presence", "Discreet crowd control"]
    },
    "Welcome Props & Selfie Booth": {
        "description": "Interactive entrance photo-op installations, playful handheld signage, and branded props.",
        "experience": "Welcomes arriving guests with fun photo memories right as they step into the celebration.",
        "highlights": ["Themed personalized signs", "Social media photo framing", "LED illuminated backdrop"]
    }
}

class PublicInquiryRequest(BaseModel):
    customer_name: str
    customer_phone: str
    event_type: str
    event_date: str
    event_time: Optional[str] = None
    venue: str
    location: Optional[str] = None
    guest_count: Optional[str] = None
    selected_service_ids: List[int] = []
    notes: Optional[str] = None

@router.get("/services")
def get_public_services(db: Session = Depends(get_db)):
    """
    Public Services API - strictly enforces ZERO PRICING policy.
    Never exposes default_price, internal costs, or price ranges.
    """
    services = db.query(Service).filter(Service.active == True).all()
    
    result = []
    for s in services:
        exp = SERVICE_EXPERIENCE_INFO.get(s.name, {
            "description": f"Professional {s.name.lower()} engineered by DD Event Entertainment.",
            "experience": "Elevates the energy, aesthetics, and excitement of your event.",
            "highlights": ["Concert-grade quality", "Experienced operators", "Full-service setup"]
        })
        result.append({
            "id": s.id,
            "name": s.name,
            "category": s.category,
            "description": exp["description"],
            "experience": exp["experience"],
            "highlights": exp["highlights"]
        })
    
    return result

@router.post("/inquire")
def submit_public_inquiry(req: PublicInquiryRequest, db: Session = Depends(get_db)):
    """
    Submits a public event enquiry and creates a NEW lead in the management portal.
    Does NOT calculate or return any price. The DD Events team prepares a custom proposal.
    """
    clean_name = req.customer_name.strip()
    clean_phone = "".join(filter(str.isdigit, req.customer_phone))
    
    if not clean_name:
        raise HTTPException(status_code=400, detail="Name is required")
    if len(clean_phone) < 10:
        raise HTTPException(status_code=400, detail="A valid 10-digit mobile number is required")

    # 1. Customer resolution
    customer = db.query(Customer).filter(Customer.phone == clean_phone).first()
    if not customer:
        customer = Customer(
            name=clean_name,
            phone=clean_phone,
            address=req.location or req.venue
        )
        db.add(customer)
        db.commit()
        db.refresh(customer)
    elif clean_name and customer.name != clean_name:
        customer.name = clean_name
        db.commit()

    # 2. Build note details
    notes_parts = []
    if req.guest_count:
        notes_parts.append(f"Expected Guests: {req.guest_count}")
    if req.notes:
        notes_parts.append(req.notes)
    notes_str = " | ".join(notes_parts) if notes_parts else None

    # 3. Create Event record (status NEW, 0.0 pricing)
    ev = Event(
        customer_id=customer.id,
        event_type=req.event_type or "Special Celebration",
        event_date=req.event_date,
        event_time=req.event_time or "6:00 PM",
        venue=req.venue,
        location=req.location or "Tamil Nadu",
        status="NEW",
        payment_status="UNPAID",
        discount=0.0,
        notes=notes_str
    )
    db.add(ev)
    db.commit()
    db.refresh(ev)

    # 4. Attach requested services (agreed_price=0.0 - pending team quotation)
    selected_service_names = []
    if req.selected_service_ids:
        services = db.query(Service).filter(Service.id.in_(req.selected_service_ids)).all()
        for srv in services:
            selected_service_names.append(srv.name)
            es = EventService(
                event_id=ev.id,
                service_id=srv.id,
                service_name=srv.name,
                quantity=1,
                agreed_price=0.0,  # Zero pricing on public inquiry
                status="PENDING",
                notes="Requested via Website Enquiry"
            )
            db.add(es)
        db.commit()

    # 5. Build pre-filled WhatsApp link for direct instant dispatch to DD Events helpline
    helpline_phone = "919363316800"
    services_summary = "\n".join([f"  • {name}" for name in selected_service_names]) if selected_service_names else "  • Custom Production Consultation"
    
    wa_message = (
        f"🌟 *DD EVENTS - NEW WEBSITE ENQUIRY*\n"
        f"------------------------------------\n"
        f"Hello Team DD Events, I would like to plan an event:\n\n"
        f"👤 *Name:* {clean_name}\n"
        f"📞 *Phone:* {clean_phone}\n"
        f"🎭 *Occasion:* {ev.event_type}\n"
        f"📅 *Date:* {ev.event_date} ({ev.event_time})\n"
        f"📍 *Venue:* {ev.venue}" + (f", {ev.location}" if ev.location else "") + "\n"
        + (f"👥 *Guests:* {req.guest_count}\n" if req.guest_count else "") +
        f"------------------------------------\n"
        f"*Interested Services:*\n{services_summary}\n"
        f"------------------------------------\n"
        + (f"💬 *Notes:* {req.notes}\n\n" if req.notes else "\n") +
        f"Please send me a customized event proposal and availability. Thank you!"
    )
    
    encoded_wa = urllib.parse.quote(wa_message)
    whatsapp_url = f"https://wa.me/{helpline_phone}?text={encoded_wa}"

    return {
        "success": True,
        "message": "Thank you! Our event team will review your requirements and contact you with a customized proposal.",
        "event_id": ev.id,
        "customer_name": clean_name,
        "whatsapp_url": whatsapp_url
    }
