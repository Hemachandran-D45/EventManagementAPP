from app.models.entities import Service

OFFICIAL_SERVICES = [
    # Special Entry
    {"name": "Elephant Trunk", "default_price": 7000.0, "category": "Special Entry"},
    {"name": "Flower Entry", "default_price": 5500.0, "category": "Special Entry"},
    {"name": "Heart Entry", "default_price": 5500.0, "category": "Special Entry"},
    
    # Special Effects
    {"name": "Dry Ice (6 Pot)", "default_price": 8000.0, "category": "Special Effects"},
    {"name": "Dry Ice (10 Pot)", "default_price": 12000.0, "category": "Special Effects"},
    {"name": "Fog Machine", "default_price": 6500.0, "category": "Special Effects"},
    {"name": "Pyro (1 Shot)", "default_price": 500.0, "category": "Special Effects"},
    {"name": "CO2 Paper Shot", "default_price": 1000.0, "category": "Special Effects"},
    {"name": "8 Balloon Blast (15 Inside Balloon)", "default_price": 12500.0, "category": "Special Effects"},
    {"name": "8 Balloon Blast (5 Inside Balloon)", "default_price": 7500.0, "category": "Special Effects"},
    
    # DJ & Sound
    {"name": "DJ Honeycomb Setup", "default_price": 15000.0, "category": "DJ & Sound"},
    {"name": "DJ Playing Only", "default_price": 7000.0, "category": "DJ & Sound"},
    
    # Traditional & Music
    {"name": "Kerala Melam (5 Members)", "default_price": 17000.0, "category": "Traditional"},
    {"name": "Kerala Melam (15 Members)", "default_price": 35000.0, "category": "Traditional"},
    
    # Dance & Entertainment
    {"name": "Dance Troupe - Marriage (6 Members)", "default_price": 12000.0, "category": "Entertainment"},
    {"name": "Dance Troupe - Marriage (4 Members)", "default_price": 8000.0, "category": "Entertainment"},
    
    # Mascots & Costumes
    {"name": "Yellow Teddy Normal (3hr)", "default_price": 3000.0, "category": "Mascots & Costumes"},
    {"name": "Gorilla Mascot (3hr)", "default_price": 6000.0, "category": "Mascots & Costumes"},
    {"name": "Panda Mascot (3hr)", "default_price": 6000.0, "category": "Mascots & Costumes"},
]

DEFAULT_SERVICES = OFFICIAL_SERVICES

OLD_SAMPLE_SERVICES = {
    "DJ Setup & Sound", "Heavy Fog Machine", "Dance Troupe (6 Artists)",
    "Chenda Melam (Traditional)", "Cold Pyro Fireworks (4 Shots)",
    "Live Orchestra Band", "Welcome Props & Selfie Booth", "Elephant Trunk Entry",
    "Stage Ambient & Sharpie Lighting", "High-Definition LED Wall (8x12)",
    "Professional Photography & Video", "Floral Stage Decoration",
    "Bouncer Team (1 Coordinator + 4 Bouncers)"
}

def seed_initial_data(db):
    # 1. Soft-deactivate old placeholder sample services if present
    for old_name in OLD_SAMPLE_SERVICES:
        old_srv = db.query(Service).filter(Service.name == old_name).first()
        if old_srv:
            old_srv.active = False
            
    # 2. Upsert official real-world service catalog
    for item in OFFICIAL_SERVICES:
        existing = db.query(Service).filter(Service.name == item["name"]).first()
        if existing:
            existing.default_price = item["default_price"]
            existing.category = item["category"]
            existing.active = True
        else:
            db.add(Service(**item, active=True))
            
    db.commit()

