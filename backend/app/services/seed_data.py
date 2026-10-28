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
    {"name": "Bouncer Team (1 Coordinator + 4 Bouncers)", "default_price": 8000.0, "category": "Security"},
]

def seed_initial_data(db):
    # Seed all DEFAULT_SERVICES if not already present in catalog (non-destructive)
    existing_service_names = {s.name for s in db.query(Service.name).all()}
    services_to_add = [
        Service(**item) for item in DEFAULT_SERVICES
        if item["name"] not in existing_service_names
    ]
    if services_to_add:
        db.add_all(services_to_add)
        db.commit()

