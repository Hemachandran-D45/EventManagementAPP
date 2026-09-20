import urllib.parse

def get_whatsapp_confirmation_text(event):
    services_list = "\n".join([f"• {s.service_name} (Rs. {s.agreed_price:,.0f})" for s in event.services])
    disc = getattr(event, 'discount', 0.0) or 0.0
    disc_line = f"🎁 *Special Discount / Offer:* -Rs. {disc:,.0f}\n" if disc > 0 else ""
    subtot_line = f"📋 *Services Subtotal:* Rs. {event.services_subtotal:,.0f}\n" if disc > 0 else ""

    text = (
        f"🎉 *EVENT BOOKING CONFIRMED* 🎉\n\n"
        f"Dear *{event.customer.name}*,\n"
        f"Thank you for booking with us! Here are your event details:\n\n"
        f"📅 *Date:* {event.event_date}\n"
        f"⏰ *Time:* {event.event_time or '7:00 PM'}\n"
        f"📍 *Venue:* {event.venue}, {event.location or ''}\n"
        f"🎭 *Event:* {event.event_type}\n\n"
        f"*Selected Services:*\n{services_list}\n\n"
        f"{subtot_line}"
        f"{disc_line}"
        f"💰 *Final Total Amount:* Rs. {event.total_amount:,.0f}\n"
        f"💵 *Advance Received:* Rs. {event.advance_paid:,.0f}\n"
        f"💳 *Balance Pending:* Rs. {event.balance_due:,.0f}\n\n"
        f"We look forward to making your event grand and unforgettable!\n"
        f"For any updates, please contact us."
    )
    return text

def get_whatsapp_bill_text(event):
    services_list = "\n".join([f"• {s.service_name} - Rs. {s.agreed_price:,.0f}" for s in event.services])
    disc = getattr(event, 'discount', 0.0) or 0.0
    disc_line = f"Discount / Special Offer: -Rs. {disc:,.0f}\n" if disc > 0 else ""
    subtot_line = f"Subtotal: Rs. {event.services_subtotal:,.0f}\n" if disc > 0 else ""

    text = (
        f"🧾 *EVENT BILL / INVOICE*\n"
        f"------------------------------------\n"
        f"Customer: *{event.customer.name}*\n"
        f"Event: *{event.event_type}*\n"
        f"Date: *{event.event_date}*\n"
        f"Venue: *{event.venue}*\n"
        f"------------------------------------\n"
        f"*Services Breakdown:*\n{services_list}\n"
        f"------------------------------------\n"
        f"{subtot_line}"
        f"{disc_line}"
        f"*FINAL TOTAL:* Rs. {event.total_amount:,.0f}\n"
        f"*ADVANCE PAID:* Rs. {event.advance_paid:,.0f}\n"
        f"*BALANCE DUE:* Rs. {event.balance_due:,.0f}\n"
        f"------------------------------------\n"
        f"UPI ID: eventmanager@upi\n"
        f"Thank you for your business!"
    )
    return text

def get_whatsapp_payment_reminder_text(event):
    text = (
        f"🔔 *FRIENDLY PAYMENT REMINDER*\n\n"
        f"Dear *{event.customer.name}*,\n"
        f"This is a gentle reminder regarding the outstanding balance of *Rs. {event.balance_due:,.0f}* for your *{event.event_type}* on *{event.event_date}* at *{event.venue}*.\n\n"
        f"💰 *Total Amount:* Rs. {event.total_amount:,.0f}\n"
        f"💵 *Paid So Far:* Rs. {event.advance_paid:,.0f}\n"
        f"💳 *Pending Balance:* Rs. {event.balance_due:,.0f}\n\n"
        f"Kindly settle via UPI: *eventmanager@upi* or cash/bank transfer.\n"
        f"Thank you!"
    )
    return text

def get_whatsapp_crew_text(event):
    services_list = "\n".join([f"• {s.service_name} -> Assigned: {s.assigned_to or 'Unassigned'} [{s.status}]" for s in event.services])
    text = (
        f"📋 *EVENT CREW DISPATCH BRIEF*\n"
        f"------------------------------------\n"
        f"Client: {event.customer.name} ({event.customer.phone})\n"
        f"Event: {event.event_type}\n"
        f"Date: {event.event_date} ({event.event_time or '7:00 PM'})\n"
        f"Venue: {event.venue}, {event.location or ''}\n"
        f"Notes: {event.notes or 'None'}\n"
        f"------------------------------------\n"
        f"*Services & Assignments:*\n{services_list}\n"
        f"------------------------------------\n"
        f"Team, please ensure timely arrival and gear check!"
    )
    return text

def format_whatsapp_link(phone: str, message: str) -> str:
    clean_phone = "".join(filter(str.isdigit, phone))
    if len(clean_phone) == 10:
        clean_phone = "91" + clean_phone
    encoded_text = urllib.parse.quote(message)
    return f"https://wa.me/{clean_phone}?text={encoded_text}"
