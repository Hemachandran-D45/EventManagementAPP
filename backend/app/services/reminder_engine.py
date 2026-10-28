from datetime import datetime, date
from typing import List
from app.models.entities import Event, Task

def compute_event_reminders_and_alerts(events: List[Event]) -> List[dict]:
    today = date.today()
    alerts = []

    for ev in events:
        if ev.status in ["COMPLETED", "CLOSED"]:
            # Post-event check for pending balance
            if ev.balance_due > 0:
                alerts.append({
                    "type": "warning",
                    "title": f"Pending Balance: {ev.customer.name}",
                    "message": f"Event completed on {ev.event_date}. Balance Rs. {ev.balance_due:,.0f} pending collection.",
                    "event_id": ev.id,
                    "due_date": ev.event_date
                })
            continue

        try:
            ev_date = datetime.strptime(ev.event_date, "%Y-%m-%d").date()
        except ValueError:
            continue

        days_left = (ev_date - today).days

        # Event day
        if days_left == 0:
            alerts.append({
                "type": "info",
                "title": f"TODAY: {ev.customer.name} - {ev.event_type}",
                "message": f"Starts at {ev.event_time or '7:00 PM'} at {ev.venue}. Check crew and equipment.",
                "event_id": ev.id,
                "due_date": ev.event_date
            })
        elif days_left == 1:
            alerts.append({
                "type": "warning",
                "title": f"TOMORROW: {ev.customer.name} - {ev.event_type}",
                "message": f"Prepare equipment and vehicle materials for {ev.venue}.",
                "event_id": ev.id,
                "due_date": ev.event_date
            })
        elif days_left == 3:
            alerts.append({
                "type": "reminder",
                "title": f"3 Days Away: {ev.customer.name}",
                "message": f"Confirm services, crew, and vendors for {ev.event_type}.",
                "event_id": ev.id,
                "due_date": ev.event_date
            })
        elif days_left == 7:
            alerts.append({
                "type": "reminder",
                "title": f"7 Days Away: {ev.customer.name}",
                "message": f"Call client to re-confirm timing, schedule, and venue details.",
                "event_id": ev.id,
                "due_date": ev.event_date
            })

        # Operational risk checks:
        # Check unassigned services if event is within 3 days
        if 0 <= days_left <= 3:
            unassigned = [s.service_name for s in ev.services if not s.assigned_to]
            if unassigned:
                alerts.append({
                    "type": "warning",
                    "title": f"Unassigned Services: {ev.customer.name}",
                    "message": f"Event in {days_left} day(s): {', '.join(unassigned[:3])} needs vendor/staff assignment!",
                    "event_id": ev.id,
                    "due_date": ev.event_date
                })

    return alerts
