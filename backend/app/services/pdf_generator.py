import io
from datetime import datetime
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_CENTER, TA_RIGHT, TA_LEFT

def generate_invoice_pdf(event, company_name="DD EVENTS & ENTERTAINMENT", contact_phone="+91 99401 23456"):
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=letter,
        rightMargin=36,
        leftMargin=36,
        topMargin=36,
        bottomMargin=36
    )
    
    styles = getSampleStyleSheet()
    
    title_style = ParagraphStyle(
        'TitleStyle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=20,
        leading=24,
        textColor=colors.HexColor("#1E293B"),
        alignment=TA_LEFT
    )
    
    subtitle_style = ParagraphStyle(
        'SubtitleStyle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=10,
        leading=14,
        textColor=colors.HexColor("#64748B"),
        alignment=TA_LEFT
    )
    
    right_header_style = ParagraphStyle(
        'RightHeaderStyle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=12,
        leading=16,
        textColor=colors.HexColor("#0F172A"),
        alignment=TA_RIGHT
    )

    cell_bold = ParagraphStyle(
        'CellBold',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=10,
        leading=13,
        textColor=colors.HexColor("#1E293B")
    )

    cell_normal = ParagraphStyle(
        'CellNormal',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9,
        leading=12,
        textColor=colors.HexColor("#334155")
    )

    story = []

    # Header section
    header_data = [
        [
            Paragraph(f"<b>{company_name}</b><br/><font size=9 color='#64748B'>One Team • One Beat • One Passion<br/>Phone: {contact_phone}</font>", title_style),
            Paragraph(f"<b>EVENT BILL / INVOICE</b><br/><font size=9 color='#64748B'>Inv #: INV-{event.id:04d}<br/>Date: {datetime.now().strftime('%d-%b-%Y')}</font>", right_header_style)
        ]
    ]
    header_table = Table(header_data, colWidths=[320, 220])
    header_table.setStyle(TableStyle([
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 10),
    ]))
    story.append(header_table)
    story.append(HRFlowable(width="100%", thickness=1.5, color=colors.HexColor("#CBD5E1"), spaceBefore=5, spaceAfter=15))

    # Customer & Event Details Block
    details_data = [
        [
            Paragraph(f"<b>BILLED TO:</b><br/><b>{event.customer.name}</b><br/>Phone: {event.customer.phone}<br/>Address: {event.customer.address or 'N/A'}", cell_normal),
            Paragraph(f"<b>EVENT DETAILS:</b><br/>Type: <b>{event.event_type}</b><br/>Date: <b>{event.event_date}</b> at <b>{event.event_time or '7:00 PM'}</b><br/>Venue: {event.venue}, {event.location or ''}", cell_normal)
        ]
    ]
    details_table = Table(details_data, colWidths=[270, 270])
    details_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor("#F8FAFC")),
        ('BOX', (0, 0), (-1, -1), 1, colors.HexColor("#E2E8F0")),
        ('INNERGRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#E2E8F0")),
        ('TOPPADDING', (0, 0), (-1, -1), 10),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 10),
        ('LEFTPADDING', (0, 0), (-1, -1), 12),
        ('RIGHTPADDING', (0, 0), (-1, -1), 12),
    ]))
    story.append(details_table)
    story.append(Spacer(1, 15))

    # Services Table
    table_rows = [
        [
            Paragraph("<b>#</b>", cell_bold),
            Paragraph("<b>Service Description</b>", cell_bold),
            Paragraph("<b>Qty</b>", cell_bold),
            Paragraph("<b>Rate (Rs.)</b>", cell_bold),
            Paragraph("<b>Amount (Rs.)</b>", cell_bold),
        ]
    ]

    for idx, s in enumerate(event.services, 1):
        line_total = s.agreed_price * s.quantity
        table_rows.append([
            Paragraph(str(idx), cell_normal),
            Paragraph(f"<b>{s.service_name}</b>" + (f"<br/><font size=8 color='#64748B'>{s.notes}</font>" if s.notes else ""), cell_normal),
            Paragraph(str(s.quantity), cell_normal),
            Paragraph(f"Rs. {s.agreed_price:,.2f}", cell_normal),
            Paragraph(f"Rs. {line_total:,.2f}", cell_normal),
        ])

    services_table = Table(table_rows, colWidths=[30, 250, 40, 100, 120])
    services_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor("#F1F5F9")),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.HexColor("#0F172A")),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#CBD5E1")),
        ('ALIGN', (2, 0), (-1, -1), 'RIGHT'),
    ]))
    story.append(services_table)
    story.append(Spacer(1, 15))

    # Financial Summary Table
    subtotal_amt = getattr(event, 'services_subtotal', event.total_amount)
    discount_amt = getattr(event, 'discount', 0.0) or 0.0
    total_amt = event.total_amount
    adv_paid = event.advance_paid
    bal_due = event.balance_due

    discount_cell = ParagraphStyle(
        'DiscountCell',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=9,
        leading=12,
        textColor=colors.HexColor("#DC2626")
    )

    summary_data = [
        [Paragraph("Services Subtotal:", cell_normal), Paragraph(f"Rs. {subtotal_amt:,.2f}", cell_normal)],
    ]

    if discount_amt > 0:
        summary_data.append([
            Paragraph("Special Discount / Offer:", discount_cell),
            Paragraph(f"- Rs. {discount_amt:,.2f}", discount_cell)
        ])

    summary_data.extend([
        [Paragraph("<b>Final Total Amount:</b>", cell_normal), Paragraph(f"<b>Rs. {total_amt:,.2f}</b>", cell_bold)],
        [Paragraph("Advance Paid:", cell_normal), Paragraph(f"Rs. {adv_paid:,.2f}", cell_normal)],
        [Paragraph("<b>Balance Remaining:</b>", cell_bold), Paragraph(f"<b>Rs. {bal_due:,.2f}</b>", cell_bold)],
    ])

    last_idx = len(summary_data) - 1
    summary_table = Table(summary_data, colWidths=[150, 120])
    summary_table.setStyle(TableStyle([
        ('ALIGN', (0, 0), (-1, -1), 'RIGHT'),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#E2E8F0")),
        ('BACKGROUND', (0, last_idx), (-1, last_idx), colors.HexColor("#FEF2F2") if bal_due > 0 else colors.HexColor("#F0FDF4")),
        ('TOPPADDING', (0, 0), (-1, -1), 5),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
    ]))

    # Wrap summary to right side
    outer_summary = Table([["", summary_table]], colWidths=[270, 270])
    outer_summary.setStyle(TableStyle([
        ('ALIGN', (1, 0), (1, 0), 'RIGHT'),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
    ]))
    story.append(outer_summary)
    story.append(Spacer(1, 25))

    # Notes & Payment Info
    payment_info = [
        [
            Paragraph(
                "<b>Payment Terms & Methods:</b><br/>"
                "• Accepted: UPI / Cash / NEFT / IMPS<br/>"
                "• UPI ID: <b>ddevents@upi</b><br/>"
                "• Please settle the remaining balance before or on the event day.<br/>"
                "• Thank you for celebrating with DD Events! <i>One Team • One Beat • One Passion</i>",
                cell_normal
            )
        ]
    ]
    p_table = Table(payment_info, colWidths=[540])
    p_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor("#F8FAFC")),
        ('BOX', (0, 0), (-1, -1), 0.5, colors.HexColor("#CBD5E1")),
        ('PADDING', (0, 0), (-1, -1), 10),
    ]))
    story.append(p_table)

    doc.build(story)
    buffer.seek(0)
    return buffer.getvalue()
