from datetime import date, timedelta
from app.models.entities import Customer, Service, Event, EventService, Payment, Expense, Task

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
    # 1. Seed Services if empty
    if db.query(Service).count() == 0:
        for item in DEFAULT_SERVICES:
            srv = Service(**item)
            db.add(srv)
        db.commit()

    # 2. Seed Sample Customers and Events if empty
    if db.query(Customer).count() == 0:
        today = date.today()
        
        # Customer 1: Rajesh (Upcoming wedding)
        c1 = Customer(
            name="Rajesh Kumar",
            phone="9876543210",
            address="14, Cross Street, Cantonment, Trichy",
            notes="Prefers WhatsApp communication. Recommended by VIP client."
        )
        db.add(c1)
        db.flush()

        ev1_date = (today + timedelta(days=2)).strftime("%Y-%m-%d")
        ev1 = Event(
            customer_id=c1.id,
            event_type="Wedding Reception",
            event_date=ev1_date,
            event_time="7:00 PM",
            venue="SRM Grand Hall",
            location="Trichy",
            status="PREPARING",
            payment_status="PARTIAL",
            notes="Bride entry with Cold Pyro and Heavy Fog."
        )
        db.add(ev1)
        db.flush()

        # Services for Event 1
        s_dj = db.query(Service).filter_by(name="DJ Setup & Sound").first()
        s_fog = db.query(Service).filter_by(name="Heavy Fog Machine").first()
        s_dancers = db.query(Service).filter_by(name="Dance Troupe (6 Artists)").first()
        s_chenda = db.query(Service).filter_by(name="Chenda Melam (Traditional)").first()

        db.add(EventService(event_id=ev1.id, service_id=s_dj.id if s_dj else None, service_name="DJ Setup & Sound", quantity=1, agreed_price=18000.0, status="READY", assigned_to="DJ Vicky", notes="English & Tamil hits"))
        db.add(EventService(event_id=ev1.id, service_id=s_fog.id if s_fog else None, service_name="Heavy Fog Machine", quantity=1, agreed_price=6500.0, status="PENDING", assigned_to="Arun", notes="Needs 15kg dry ice"))
        db.add(EventService(event_id=ev1.id, service_id=s_dancers.id if s_dancers else None, service_name="Dance Troupe (6 Artists)", quantity=1, agreed_price=12000.0, status="READY", assigned_to="Team Sparkles", notes="Entry performance"))
        db.add(EventService(event_id=ev1.id, service_id=s_chenda.id if s_chenda else None, service_name="Chenda Melam (Traditional)", quantity=1, agreed_price=17000.0, status="PENDING", assigned_to="Manoj Chenda Troupe", notes="12 drummers"))

        # Payment for Event 1
        db.add(Payment(event_id=ev1.id, amount=20000.0, payment_date=today.strftime("%Y-%m-%d"), payment_method="UPI", notes="Booking Advance via GooglePay"))
        
        # Expense for Event 1
        db.add(Expense(event_id=ev1.id, amount=3000.0, category="Transport", description="Mini truck for DJ equipment", date=today.strftime("%Y-%m-%d")))
        db.add(Expense(event_id=ev1.id, amount=5000.0, category="Rental", description="Dry ice & Fog generator rental", date=today.strftime("%Y-%m-%d")))

        # Customer 2: Priya (Today's Birthday Party)
        c2 = Customer(
            name="Priya Dharshini",
            phone="9443215678",
            address="Anna Nagar, Madurai",
            notes="1st Birthday Celebration"
        )
        db.add(c2)
        db.flush()

        ev2_date = today.strftime("%Y-%m-%d")
        ev2 = Event(
            customer_id=c2.id,
            event_type="Birthday Party",
            event_date=ev2_date,
            event_time="6:30 PM",
            venue="Hotel Sangam",
            location="Madurai",
            status="READY",
            payment_status="PAID",
            notes="Balloon arch and sound check by 5:30 PM."
        )
        db.add(ev2)
        db.flush()

        db.add(EventService(event_id=ev2.id, service_name="DJ Setup & Sound", quantity=1, agreed_price=15000.0, status="READY", assigned_to="DJ Ramesh"))
        db.add(EventService(event_id=ev2.id, service_name="Welcome Props & Selfie Booth", quantity=1, agreed_price=1500.0, status="READY", assigned_to="Self"))
        db.add(Payment(event_id=ev2.id, amount=16500.0, payment_date=today.strftime("%Y-%m-%d"), payment_method="CASH", notes="Full payment received"))

        # Customer 3: Suresh (Upcoming corporate)
        c3 = Customer(
            name="Suresh Babu",
            phone="9840192837",
            address="Tidel Park, Coimbatore",
            notes="Tech Summit Annual Gala"
        )
        db.add(c3)
        db.flush()

        ev3_date = (today + timedelta(days=6)).strftime("%Y-%m-%d")
        ev3 = Event(
            customer_id=c3.id,
            event_type="Corporate Gala",
            event_date=ev3_date,
            event_time="5:00 PM",
            venue="Le Meridien",
            location="Coimbatore",
            status="CONFIRMED",
            payment_status="PARTIAL",
            notes="Formal corporate event. Audio clarity is top priority."
        )
        db.add(ev3)
        db.flush()

        db.add(EventService(event_id=ev3.id, service_name="Stage Ambient & Sharpie Lighting", quantity=1, agreed_price=18000.0, status="PENDING"))
        db.add(EventService(event_id=ev3.id, service_name="High-Definition LED Wall (8x12)", quantity=1, agreed_price=25000.0, status="PENDING"))
        db.add(Payment(event_id=ev3.id, amount=15000.0, payment_date=today.strftime("%Y-%m-%d"), payment_method="BANK_TRANSFER", notes="Advance via NEFT"))

        db.commit()
