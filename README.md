# Event Business Manager (V1)

**"You manage the event. The app remembers the business."**

A private mobile-first Progressive Web Application (PWA) with a Python FastAPI backend and SQLite/PostgreSQL-ready database tailored specifically for an event-management business owner/operator.

---

## 🚀 Quick Start (1-Click)

Double-click `start.bat` in this folder:
```cmd
start.bat
```
Then open your browser at:
**[http://127.0.0.1:8000](http://127.0.0.1:8000)**

*(The unified server hosts both the complete PWA frontend, the REST API, and PDF invoice generation).*

---

## 📱 How to Install on iPhone (Safari)

1. Connect your iPhone to the same Wi-Fi network as this PC (or deploy to a cloud URL like Render/Railway/Fly.io).
2. Open Safari on iPhone and navigate to `http://<YOUR_PC_LOCAL_IP>:8000`.
3. Tap the **Share** button (box with an upward arrow) at the bottom of Safari.
4. Scroll down and tap **"Add to Home Screen"**.
5. The **EventManager** app icon will appear on your Home Screen and launch in full-screen standalone mode without browser bars!

## 🤖 How to Install on Android (Chrome)

1. Open Chrome and visit `http://<YOUR_PC_LOCAL_IP>:8000`.
2. Tap the **3-dot menu (⋮)** in the top right.
3. Tap **"Install App"** or **"Add to Home screen"**.

---

## 🌟 Core Features Built in V1

1. **Daily Command Center ("What do I need to know today?")**:
   - Today's events with 1-tap Call and WhatsApp shortcuts.
   - Upcoming events in the immediate pipeline.
   - Outstanding pending payments counter (₹).
   - Preparation tasks counter across all active events.
   - Actionable operational alerts (e.g. events in 3 days with unassigned services, pending balances for completed events).

2. **Rapid Order Entry (< 1 Minute)**:
   - Client Name & Phone (with repeat customer support).
   - Event Type presets (Wedding, Reception, Birthday, Temple Festival, Corporate Gala, Sangeet).
   - Date, Time, Venue, Location.
   - Interactive service catalog selector with pre-configured standard rates.
   - Instant inline price overrides per event without mutating catalog defaults.
   - Real-time computation: `Total Agreed Amount` - `Advance Received` = `Pending Balance`.

3. **Event Hub & Service Checklist**:
   - Operational lifecycle statuses: `NEW` → `CONFIRMED` → `PREPARING` → `READY` → `COMPLETED` → `CLOSED`.
   - Financial statuses: `UNPAID` → `PARTIAL` → `PAID`.
   - Preparation checklist with check-off toggle for each service.
   - Staff/vendor crew assignment per service.

4. **1-Click Billing & WhatsApp Automation**:
   - **Download PDF Bill**: High-resolution itemized invoice generated via ReportLab with customer details, itemized services, advance received, remaining balance, and UPI ID payment info.
   - **WhatsApp Text Share**: 1-tap pre-formatted WhatsApp messages for:
     - Booking Confirmation
     - Itemized Bill Summary
     - Balance Due Reminder
     - Crew Dispatch Brief

5. **Multi-Payment & Expense Tracking (Profit Engine)**:
   - Record multiple payments (Advance, Mid-payment, Settlement) across `UPI`, `Cash`, `Bank Transfer`, `Other`.
   - Record direct event expenses (`Transport`, `Labour`, `Rental`, `Food`, `Materials`).
   - Automated gross profit calculation: `Revenue - Direct Expenses = Gross Profit`.

6. **Interactive Calendar**:
   - Visual Month view showing event densities and badges for busy dates (>1 event).
   - Tap any day to inspect the day's event schedule and financial status.

7. **Customer Intelligence CRM**:
   - Searchable directory of clients.
   - Lifetime revenue, total booked events, and pending balances per client.
   - Complete historical archive of past events.

8. **Global Search**:
   - Instant live search querying clients, venues, dates, phone numbers, and services.

---

## 🛠 Project Structure

```
D:\EventManagementapp/
├── backend/
│   ├── app/
│   │   ├── main.py                # FastAPI entrypoint & PWA static mount
│   │   ├── config.py              # Environment configuration
│   │   ├── database.py            # SQLAlchemy database engine
│   │   ├── models/                # Database entities
│   │   ├── schemas/               # Pydantic v2 schemas
│   │   ├── routers/               # API endpoints (dashboard, events, billing, etc.)
│   │   └── services/              # PDF generator, WhatsApp templates, seed data
│   ├── uploads/                   # Uploaded attachments & images
│   ├── tests/
│   │   └── test_api.py            # Automated test suite
│   ├── requirements.txt
│   └── run.py
│
├── frontend/                      # React + TypeScript + Tailwind PWA
│   ├── public/
│   │   ├── manifest.json          # PWA Web App Manifest
│   │   ├── sw.js                  # PWA Service Worker for caching
│   │   └── icons/                 # PWA icons (192x192, 512x512)
│   ├── src/
│   │   ├── components/            # Modals, cards, badges, navigation
│   │   ├── pages/                 # Dashboard, Orders, Calendar, CRM, Finance
│   │   ├── services/api.ts        # Typed API client
│   │   └── types/                 # TypeScript interfaces
│   └── dist/                      # Production compiled bundle
│
├── start.bat                      # 1-click launcher for production
├── start_dev.bat                  # Development launcher (hot-reload)
└── README.md
```

---

## 🧪 Running Automated Tests

Run backend tests anytime:
```cmd
pytest D:\EventManagementapp\backend\test_api.py -v
```
