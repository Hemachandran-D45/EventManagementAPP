from app.models.entities import Service, Customer, Event, Payment, Expense, EventService, Task, Attachment, Invoice

DEFAULT_SERVICES = [
    {"name": "DJ Setup & Sound", "default_price": 18000.0, "category": "Audio"},
    {"name": "Heavy Fog Machine", "default_price": 6500.0, "category": "Special Effects"},
    {"name": "Dance Troupe (6 Artists)", "default_price": 12000.0, "category": "Entertainment"},
    {"name": "Chenda Melam (Traditional)", "default_price": 17000.0, "category": "Traditional"},
    {"name": "Cold Pyro Fireworks (4 Shots)", "default_price": 5000.0, "category": "Special Effects"},
    {"name": "Live Orchestra Band", "default_price": 14000.0, "category": "Music"},
    {"name": "Welcome Props & Selfie Booth", "default_price": 800.0, "category": "Props"},
    {"name": "Elephant Trunk Entry", "default_price": 8500.0, "category": "Entry Special"},
    {"name": "Stage Ambient & Sharpie Lighting", "default_price": 15000.0, "category": "Lighting"},
    {"name": "High-Definition LED Wall (8x12)", "default_price": 25000.0, "category": "Visuals"},
    {"name": "Professional Photography & Video", "default_price": 22000.0, "category": "Media"},
    {"name": "Floral Stage Decoration", "default_price": 30000.0, "category": "Decor"},
]

def seed_initial_data(db):
    # 1. Automatically wipe legacy demo data if it was seeded in previous runs
    demo_phones = ["9876543210", "9443215678", "9840192837"]
    demo_customers = db.query(Customer).filter(Customer.phone.in_(demo_phones)).all()
    if demo_customers:
        for cust in demo_customers:
            events = db.query(Event).filter(Event.customer_id == cust.id).all()
            for ev in events:
                db.query(Payment).filter(Payment.event_id == ev.id).delete()
                db.query(Expense).filter(Expense.event_id == ev.id).delete()
                db.query(EventService).filter(EventService.event_id == ev.id).delete()
                db.query(Task).filter(Task.event_id == ev.id).delete()
                db.query(Attachment).filter(Attachment.event_id == ev.id).delete()
                db.query(Invoice).filter(Invoice.event_id == ev.id).delete()
                db.delete(ev)
            db.delete(cust)
        db.commit()

    # 2. Only seed reusable service templates if catalog is empty
    # Zero dummy customers or events are created, giving a 100% clean production slate.
    if db.query(Service).count() == 0:
        for item in DEFAULT_SERVICES:
            srv = Service(**item)
            db.add(srv)
        db.commit()
