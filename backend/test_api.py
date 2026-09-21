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

    wa_resp = client.get(f"/api/billing/whatsapp/{event_id}")
    assert wa_resp.status_code == 200
    wa_data = wa_resp.json()
    assert "confirmation" in wa_data
    assert "bill" in wa_data
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
