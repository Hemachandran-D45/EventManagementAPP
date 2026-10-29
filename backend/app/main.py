import os
from contextlib import asynccontextmanager
from fastapi import FastAPI, Depends, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.database import Base, engine, SessionLocal
from app.config import UPLOAD_DIR, BASE_DIR
from app.services.seed_data import seed_initial_data
from app.security import require_auth
from fastapi.responses import FileResponse
from app.routers import (
    dashboard, events, customers, services, payments,
    expenses, billing, search, attachments, finance,
    public, tasks, auth
)

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

# Anti-Scanner & Security Headers Middleware
@app.middleware("http")
async def security_defense_middleware(request: Request, call_next):
    path = request.url.path.lower()
    
    # 1. Block common automated exploit/webshell scanner probes immediately
    blocked_patterns = [
        ".php", ".env", ".git", "wp-admin", "wp-login", "xmlrpc",
        "cgi-bin", "actuator", ".asp", ".aspx", ".jsp", "eval(",
        "../", "..\\", "p2p", "shell", ".sh", ".bash"
    ]
    # Allow safe internal paths like /uploads/ or /portal
    if any(pat in path for pat in blocked_patterns) and not path.startswith("/uploads/"):
        return Response("Access Denied by Security Policy", status_code=403)

    # Process request
    response = await call_next(request)

    # 2. Hardened Security Headers (Anti-Clickjacking, Anti-MIME sniffing, XSS Protection)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    response.headers["Permissions-Policy"] = "camera=(), microphone=(), geolocation=()"
    return response

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

# Public unauthenticated routes
app.include_router(public.router)
app.include_router(auth.router)

# Authenticated private business management routes (Requires Valid Owner PIN / Token)
app.include_router(dashboard.router, dependencies=[Depends(require_auth)])
app.include_router(events.router, dependencies=[Depends(require_auth)])
app.include_router(customers.router, dependencies=[Depends(require_auth)])
app.include_router(services.router, dependencies=[Depends(require_auth)])
app.include_router(payments.router, dependencies=[Depends(require_auth)])
app.include_router(expenses.router, dependencies=[Depends(require_auth)])
app.include_router(billing.router, dependencies=[Depends(require_auth)])
app.include_router(search.router, dependencies=[Depends(require_auth)])
app.include_router(attachments.router, dependencies=[Depends(require_auth)])
app.include_router(tasks.router, dependencies=[Depends(require_auth)])
app.include_router(finance.router, dependencies=[Depends(require_auth)])

# Mount frontend dist SPA if available
FRONTEND_DIST = os.path.join(os.path.dirname(BASE_DIR), "frontend", "dist")
INDEX_HTML = os.path.join(FRONTEND_DIST, "index.html")

if os.path.exists(FRONTEND_DIST):
    @app.get("/portal")
    @app.get("/portal/{full_path:path}")
    async def serve_portal(full_path: str = ""):
        return FileResponse(INDEX_HTML)

    app.mount("/", StaticFiles(directory=FRONTEND_DIST, html=True), name="frontend")
else:
    @app.get("/")
    def root():
        return {"message": "Event Business Manager API is running securely", "version": "1.0.0"}
