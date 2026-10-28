import os
import pytest
from fastapi.testclient import TestClient
import sys

sys.path.insert(0, r"D:\EventManagementapp\backend")

from app.main import app

client = TestClient(app)

def test_root():
    response = client.get("/")
    assert response.status_code == 200

def test_dashboard():
    response = client.get("/api/dashboard")
    assert response.status_code == 200
    data = response.json()
    assert "today_events_count" in data
    assert "pending_payment_total" in data
    assert "alerts" in data

def test_services():
    response = client.get("/api/services")
    assert response.status_code == 200
    services = response.json()
    assert len(services) >= 10
    assert any(s["name"] == "DJ Setup & Sound" for s in services)

def test_quick_order_creation_and_balance():
    payload = {
        "customer_name": "Karthik Raja",
        "customer_phone": "9940123456",
        "customer_address": "RS Puram, Coimbatore",
        "event_type": "Engagement Ceremony",
        "event_date": "2026-10-15",
        "event_time": "6:00 PM",
        "venue": "Gokulam Park",
        "location": "Coimbatore",
        "services": [
            {"service_name": "DJ Setup & Sound", "quantity": 1, "agreed_price": 20000.0, "assigned_to": "DJ Kumar"},
            {"service_name": "Stage Ambient & Sharpie Lighting", "quantity": 1, "agreed_price": 15000.0}
        ],
        "advance_amount": 10000.0,
        "payment_method": "UPI",
        "notes": "Bride & Groom entrance song playlist provided."
    }
    response = client.post("/api/events/quick-order", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["customer_name"] == "Karthik Raja"
    assert data["total_amount"] == 35000.0
    assert data["advance_paid"] == 10000.0
    assert data["balance_due"] == 25000.0
    assert data["payment_status"] == "PARTIAL"

    event_id = data["id"]

    # Record remaining payment
    payment_payload = {
        "amount": 25000.0,
        "payment_date": "2026-10-15",
        "payment_method": "CASH",
        "notes": "Full settlement on event day"
    }
    pmt_resp = client.post(f"/api/payments/{event_id}", json=payment_payload)
    assert pmt_resp.status_code == 200

    # Verify event is now PAID
    updated_ev = client.get(f"/api/events/{event_id}").json()
    assert updated_ev["payment_status"] == "PAID"
    assert updated_ev["balance_due"] == 0.0

def test_invoice_pdf_and_whatsapp():
    # Use existing event from previous tests
    events = client.get("/api/events").json()
    assert len(events) > 0
    event_id = events[0]["id"]
    
    response = client.get(f"/api/billing/invoice/{event_id}/pdf")
    assert response.status_code == 200
    assert response.headers["content-type"] == "application/pdf"
    assert len(response.content) > 1000

    est_resp = client.get(f"/api/billing/estimate/{event_id}/pdf")
    assert est_resp.status_code == 200
    assert est_resp.headers["content-type"] == "application/pdf"
    assert len(est_resp.content) > 1000

    wa_resp = client.get(f"/api/billing/whatsapp/{event_id}")
    assert wa_resp.status_code == 200
    wa_data = wa_resp.json()
    assert "quotation" in wa_data
    assert "confirmation" in wa_data
    assert "bill" in wa_data
    assert "https://wa.me/" in wa_data["quotation"]["url"]
    assert "https://wa.me/" in wa_data["bill"]["url"]

def test_global_search():
    # Search for customer created in previous test
    response = client.get("/api/search?q=Karthik")
    assert response.status_code == 200
    results = response.json()
    assert len(results["customers"]) >= 1
    assert "Karthik" in results["customers"][0]["name"]

def test_finance_summary():
    response = client.get("/api/finance/summary")
    assert response.status_code == 200
    data = response.json()
    assert "total_collected" in data
    assert "estimated_profit" in data

def test_order_with_negotiated_discount():
    payload = {
        "customer_name": "Friend & Family Order",
        "customer_phone": "9876500000",
        "event_type": "Reception",
        "event_date": "2026-11-20",
        "event_time": "7:00 PM",
        "venue": "Green Garden Hall",
        "location": "Trichy",
        "services": [
            {"service_name": "DJ Setup & Sound", "quantity": 1, "agreed_price": 40000.0},
            {"service_name": "Heavy Fog Machine", "quantity": 1, "agreed_price": 27000.0}
        ],
        "discount": 7000.0,
        "advance_amount": 20000.0,
        "payment_method": "UPI",
        "notes": "Special family discount applied."
    }
    response = client.post("/api/events/quick-order", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["services_subtotal"] == 67000.0
    assert data["discount"] == 7000.0
    assert data["total_amount"] == 60000.0
    assert data["advance_paid"] == 20000.0
    assert data["balance_due"] == 40000.0
    assert data["payment_status"] == "PARTIAL"

def test_delete_service_from_catalog():
    # First create a temporary service
    import time
    name = f"Temporary Test Light {time.time()}"
    create_resp = client.post("/api/services", json={"name": name, "default_price": 2500.0, "category": "Lighting", "active": True})
    assert create_resp.status_code == 200
    service_id = create_resp.json()["id"]

    # Delete it
    del_resp = client.delete(f"/api/services/{service_id}")
    assert del_resp.status_code == 200
    assert "removed from catalog" in del_resp.json()["message"]

    # Verify not in active list
    services = client.get("/api/services").json()
    assert not any(s["id"] == service_id for s in services)

def test_public_services_strict_zero_pricing():
    response = client.get("/api/public/services")
    assert response.status_code == 200
    services = response.json()
    assert len(services) >= 10
    
    # STRICT ZERO-PRICING ASSERTION: No pricing keys or leaked default_price allowed!
    for s in services:
        assert "default_price" not in s, f"Leaked default_price in public service: {s['name']}"
        assert "price" not in s, f"Leaked price field in public service: {s['name']}"
        assert "name" in s
        assert "category" in s
        assert "description" in s
        assert "experience" in s
        assert "highlights" in s

def test_public_event_inquiry_workflow():
    # First get a public service id
    pub_services = client.get("/api/public/services").json()
    dj_srv = next((s for s in pub_services if "DJ" in s["name"]), pub_services[0])
    
    inquiry_payload = {
        "customer_name": "Ananya Sharma",
        "customer_phone": "9840123999",
        "event_type": "Royal Sangeet & Reception",
        "event_date": "2026-12-10",
        "event_time": "6:30 PM",
        "venue": "Le Meridien Grand Ballroom",
        "location": "Coimbatore",
        "guest_count": "500-700 Guests",
        "selected_service_ids": [dj_srv["id"]],
        "notes": "Looking for cinematic lighting and high energy dance mixes."
    }
    
    res = client.post("/api/public/inquire", json=inquiry_payload)
    assert res.status_code == 200
    data = res.json()
    assert data["success"] is True
    assert "proposal" in data["message"].lower() or "review" in data["message"].lower()
    assert "whatsapp_url" in data
    assert "https://wa.me/" in data["whatsapp_url"]
    
    # Verify NO price in public response
    assert "price" not in data
    assert "total_amount" not in data
    assert "estimated_price" not in data
    
    # Verify created event in internal management API has NEW status and 0.0 price ready for team quote
    event_id = data["event_id"]
    internal_ev = client.get(f"/api/events/{event_id}").json()
    assert internal_ev["status"] == "NEW"
    assert internal_ev["payment_status"] == "UNPAID"
    assert internal_ev["total_amount"] == 0.0
    assert len(internal_ev["services"]) >= 1
    assert internal_ev["services"][0]["agreed_price"] == 0.0

def test_expense_crud_and_reconciliation():
    # 1. Create a test event
    ev_payload = {
        "customer_name": "Senthil Kumar",
        "customer_phone": "9843011223",
        "event_type": "Grand Reception",
        "event_date": "2026-11-25",
        "venue": "Le Royal Hall",
        "services": [
            {"service_name": "DJ Setup & Sound", "quantity": 1, "agreed_price": 25000.0}
        ],
        "advance_amount": 15000.0,
        "payment_method": "UPI"
    }
    ev_resp = client.post("/api/events/quick-order", json=ev_payload)
    assert ev_resp.status_code == 200
    ev_data = ev_resp.json()
    event_id = ev_data["id"]

    # 2. Add an expense
    exp_payload = {
        "amount": 2300.0,
        "category": "Materials",
        "description": "T-shirt + logo print",
        "date": "2026-11-20"
    }
    exp_resp = client.post(f"/api/expenses/{event_id}", json=exp_payload)
    assert exp_resp.status_code == 200
    exp_data = exp_resp.json()
    expense_id = exp_data["id"]
    assert exp_data["amount"] == 2300.0
    assert exp_data["category"] == "Materials"

    # Check event financials
    ev_detail = client.get(f"/api/events/{event_id}").json()
    assert ev_detail["total_expense"] == 2300.0
    assert ev_detail["estimated_profit"] == 25000.0 - 2300.0

    # 3. Edit / Update expense (change amount to 2800.0 and category to 'Materials & Printing')
    update_payload = {
        "amount": 2800.0,
        "category": "Materials",
        "description": "T-shirt + logo print + extra badges"
    }
    put_resp = client.put(f"/api/expenses/{expense_id}", json=update_payload)
    assert put_resp.status_code == 200
    assert put_resp.json()["amount"] == 2800.0
    assert put_resp.json()["description"] == "T-shirt + logo print + extra badges"

    # Check event financials after edit
    ev_detail2 = client.get(f"/api/events/{event_id}").json()
    assert ev_detail2["total_expense"] == 2800.0
    assert ev_detail2["estimated_profit"] == 25000.0 - 2800.0

    # 4. Delete expense
    del_resp = client.delete(f"/api/expenses/{expense_id}")
    assert del_resp.status_code == 200
    assert "deleted successfully" in del_resp.json()["message"]

    # Check event financials after delete
    ev_detail3 = client.get(f"/api/events/{event_id}").json()
    assert ev_detail3["total_expense"] == 0.0
    assert ev_detail3["estimated_profit"] == 25000.0


