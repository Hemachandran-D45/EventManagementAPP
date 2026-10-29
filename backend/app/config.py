import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
UPLOAD_DIR = os.path.join(BASE_DIR, "uploads")
raw_db_url = os.getenv("DATABASE_URL", f"sqlite:///{os.path.join(BASE_DIR, 'events.db')}")
if raw_db_url.startswith("postgres://"):
    raw_db_url = raw_db_url.replace("postgres://", "postgresql+psycopg2://", 1)
elif raw_db_url.startswith("postgresql://"):
    raw_db_url = raw_db_url.replace("postgresql://", "postgresql+psycopg2://", 1)
elif raw_db_url.startswith("postgresql+psycopg://"):
    raw_db_url = raw_db_url.replace("postgresql+psycopg://", "postgresql+psycopg2://", 1)
DATABASE_URL = raw_db_url

SECURITY_PIN = os.getenv("SECURITY_PIN", os.getenv("APP_PIN", "2026"))
JWT_SECRET = os.getenv("JWT_SECRET", "event-business-secret-key-super-safe-98214")

os.makedirs(UPLOAD_DIR, exist_ok=True)


