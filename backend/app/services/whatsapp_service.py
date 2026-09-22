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
        f"💳 *UPI ID:* 9363316800@upi (GPay / PhonePe / Paytm)\n"
        f"📞 *Helpline / Updates:* +91 78680 80950 / +91 93633 16800\n\n"
        f"We are excited to deliver a high-energy, memorable event!\n"
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
        f"💳 *UPI ID:* 9363316800@upi (GPay / PhonePe / Paytm)\n"
        f"📞 *Contact:* +91 78680 80950 / +91 93633 16800\n"
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
        f"Kindly settle via UPI: *9363316800@upi* (GPay / PhonePe / Paytm) or Cash / Bank Transfer.\n"
        f"📞 Contact: +91 78680 80950 / +91 93633 16800\n"
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
        f"Lead Contact: +91 78680 80950 / +91 93633 16800\n"
        f"Team DD: Please ensure timely setup, gear check, and professional presentation!"
    )
    return text

def get_whatsapp_quotation_text(event):
    services_list = "\n".join([f"• {s.service_name} - Rs. {s.agreed_price:,.0f}" for s in event.services])
    disc = getattr(event, 'discount', 0.0) or 0.0

    if disc > 0:
        financials = (
            f"📋 *Services Subtotal:* Rs. {event.services_subtotal:,.0f}\n"
            f"🎁 *Special Offer / Discount:* -Rs. {disc:,.0f}\n"
            f"💰 *Estimated Total Amount:* Rs. {event.total_amount:,.0f}"
        )
    else:
        financials = f"💰 *Estimated Total Amount:* Rs. {event.total_amount:,.0f}"

    text = (
        f"📋 *DD EVENTS - EVENT ESTIMATE & QUOTATION*\n"
        f"------------------------------------\n"
        f"Dear *{event.customer.name}*,\n"
        f"Thank you for inquiring with *DD Events*! Here is the price quotation and plan for your event:\n\n"
        f"📅 *Date:* {event.event_date}\n"
        f"⏰ *Time:* {event.event_time or '7:00 PM'}\n"
        f"📍 *Venue:* {event.venue}" + (f", {event.location}" if event.location else "") + "\n"
        f"🎭 *Occasion:* {event.event_type}\n\n"
        f"*Proposed Services & Production:*\n"
        f"{services_list}\n"
        f"------------------------------------\n"
        f"{financials}\n"
        f"------------------------------------\n"
        f"⚠️ *Please Note:*\n"
        f"This is a preliminary price estimate and not a confirmed booking. Dates, equipment & team availability are reserved on a first-come basis upon receipt of booking advance.\n\n"
        f"To confirm your booking and lock the date, please contact us:\n"
        f"📞 *Call / WhatsApp:* +91 78680 80950 / +91 93633 16800\n"
        f"💳 *Advance UPI:* 9363316800@upi\n"
        f"_DD Events Entertainment • \"One Team • One Beat • One Passion\"_"
    )
    return text

def format_whatsapp_link(phone: str, message: str) -> str:
    clean_phone = "".join(filter(str.isdigit, phone))
    if len(clean_phone) == 10:
        clean_phone = "91" + clean_phone
    encoded_text = urllib.parse.quote(message)
    return f"https://wa.me/{clean_phone}?text={encoded_text}"

