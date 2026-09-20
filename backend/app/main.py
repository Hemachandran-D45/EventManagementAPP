import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.database import Base, engine, SessionLocal
from app.config import UPLOAD_DIR, BASE_DIR
from app.services.seed_data import seed_initial_data
from app.routers import dashboard, events, customers, services, payments, expenses, billing, search, attachments, finance

# Create DB tables
Base.metadata.create_all(bind=engine)

@asynccontextmanager
async def lifespan(app: FastAPI):
    db = SessionLocal()
    try:
        seed_initial_data(db)
    finally:
        db.close()
    yield

app = FastAPI(
    title="Event Business Manager API",
    description="Private mobile operating system for event-management business",
    version="1.0.0",
    lifespan=lifespan
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount uploads static files
os.makedirs(UPLOAD_DIR, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")

# Include API routers
app.include_router(dashboard.router)
app.include_router(events.router)
app.include_router(customers.router)
app.include_router(services.router)
app.include_router(payments.router)
app.include_router(expenses.router)
app.include_router(billing.router)
app.include_router(search.router)
app.include_router(attachments.router)
app.include_router(finance.router)

# Mount frontend dist SPA if available
FRONTEND_DIST = os.path.join(os.path.dirname(BASE_DIR), "frontend", "dist")
if os.path.exists(FRONTEND_DIST):
    app.mount("/", StaticFiles(directory=FRONTEND_DIST, html=True), name="frontend")
else:
    @app.get("/")
    def root():
        return {"message": "Event Business Manager API is running smoothly", "version": "1.0.0"}
