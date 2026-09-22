import urllib.parse

def get_whatsapp_confirmation_text(event):
    services_list = "\n".join([f"• {s.service_name} (Rs. {s.agreed_price:,.0f})" for s in event.services])
    disc = getattr(event, 'discount', 0.0) or 0.0

    if disc > 0:
        financials = (
            f"📋 *Services Subtotal:* Rs. {event.services_subtotal:,.0f}\n"
            f"🎁 *DD Events Special Offer:* -Rs. {disc:,.0f}\n"
            f"💰 *Total Amount (After Discount):* Rs. {event.total_amount:,.0f}\n"
            f"💵 *Advance Received:* Rs. {event.advance_paid:,.0f}\n"
            f"💳 *Balance Pending:* Rs. {event.balance_due:,.0f}"
        )
    else:
        financials = (
            f"💰 *Total Amount:* Rs. {event.total_amount:,.0f}\n"
            f"💵 *Advance Received:* Rs. {event.advance_paid:,.0f}\n"
            f"💳 *Balance Pending:* Rs. {event.balance_due:,.0f}"
        )

    text = (
        f"🎉 *DD EVENTS - BOOKING CONFIRMED* 🎉\n"
        f"_\"One Team • One Beat • One Passion\"_\n\n"
        f"Dear *{event.customer.name}*,\n"
        f"Thank you for choosing *DD Events* for your celebration! Here are your booking details:\n\n"
        f"📅 *Date:* {event.event_date}\n"
        f"⏰ *Time:* {event.event_time or '7:00 PM'}\n"
        f"📍 *Venue:* {event.venue}" + (f", {event.location}" if event.location else "") + "\n"
        f"🎭 *Occasion:* {event.event_type}\n\n"
        f"*Requested Services:*\n{services_list}\n\n"
        f"------------------------------------\n"
        f"{financials}\n"
        f"------------------------------------\n\n"
        f"We are excited to deliver a high-energy, memorable event!\n"
        f"For songs, cues, or updates, feel free to contact us.\n"
        f"— *Team DD Events*"
    )
    return text

def get_whatsapp_bill_text(event):
    services_list = "\n".join([f"• {s.service_name} - Rs. {s.agreed_price:,.0f}" for s in event.services])
    disc = getattr(event, 'discount', 0.0) or 0.0

    if disc > 0:
        financials = (
            f"📋 *Services Subtotal:* Rs. {event.services_subtotal:,.0f}\n"
            f"🎁 *Discount / Special Offer:* -Rs. {disc:,.0f}\n"
            f"💰 *Total Amount (After Discount):* Rs. {event.total_amount:,.0f}\n"
            f"💵 *Amount Paid (Advance):* Rs. {event.advance_paid:,.0f}\n"
            f"💳 *Balance Due:* Rs. {event.balance_due:,.0f}"
        )
    else:
        financials = (
            f"💰 *Total Amount:* Rs. {event.total_amount:,.0f}\n"
            f"💵 *Amount Paid (Advance):* Rs. {event.advance_paid:,.0f}\n"
            f"💳 *Balance Due:* Rs. {event.balance_due:,.0f}"
        )

    text = (
        f"🧾 *DD EVENTS & ENTERTAINMENT*\n"
        f"------------------------------------\n"
        f"*EVENT BILL / INVOICE*\n"
        f"Client: *{event.customer.name}*\n"
        f"Occasion: *{event.event_type}*\n"
        f"Date: *{event.event_date}*\n"
        f"Venue: *{event.venue}*" + (f", {event.location}" if event.location else "") + "\n"
        f"------------------------------------\n"
        f"*Asked Services:*\n{services_list}\n"
        f"------------------------------------\n"
        f"{financials}\n"
        f"------------------------------------\n"
        f"UPI ID: ddevents@upi\n"
        f"Thank you for choosing DD Events!\n"
        f"_\"One Team • One Beat • One Passion\"_"
    )
    return text

def get_whatsapp_payment_reminder_text(event):
    text = (
        f"🔔 *DD EVENTS - PAYMENT REMINDER*\n\n"
        f"Dear *{event.customer.name}*,\n"
        f"This is a gentle reminder regarding the outstanding balance of *Rs. {event.balance_due:,.0f}* for your *{event.event_type}* on *{event.event_date}* at *{event.venue}*.\n\n"
        f"💰 *Total Amount:* Rs. {event.total_amount:,.0f}\n"
        f"💵 *Paid So Far:* Rs. {event.advance_paid:,.0f}\n"
        f"💳 *Pending Balance:* Rs. {event.balance_due:,.0f}\n\n"
        f"Kindly settle via UPI: *ddevents@upi* or Cash / Bank Transfer.\n"
        f"Thank you!\n"
        f"— *DD Events Management*"
    )
    return text

def get_whatsapp_crew_text(event):
    services_list = "\n".join([f"• {s.service_name} -> Assigned: {s.assigned_to or 'Unassigned'} [{s.status}]" for s in event.services])
    text = (
        f"📋 *DD EVENTS - CREW DISPATCH BRIEF*\n"
        f"------------------------------------\n"
        f"Occasion: {event.event_type}\n"
        f"Client: {event.customer.name} ({event.customer.phone})\n"
        f"Date & Time: {event.event_date} ({event.event_time or '7:00 PM'})\n"
        f"Venue: {event.venue}" + (f", {event.location}" if event.location else "") + "\n"
        + (f"Notes / Instructions: {event.notes}\n" if event.notes else "") +
        f"------------------------------------\n"
        f"*Crew & Service Assignments:*\n{services_list}\n"
        f"------------------------------------\n"
        f"Team DD: Please ensure timely setup, gear check, and professional presentation!"
    )
    return text

def format_whatsapp_link(phone: str, message: str) -> str:
    clean_phone = "".join(filter(str.isdigit, phone))
    if len(clean_phone) == 10:
        clean_phone = "91" + clean_phone
    encoded_text = urllib.parse.quote(message)
    return f"https://wa.me/{clean_phone}?text={encoded_text}"
