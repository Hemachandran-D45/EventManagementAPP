import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
UPLOAD_DIR = os.path.join(BASE_DIR, "uploads")
DATABASE_URL = os.getenv("DATABASE_URL", f"sqlite:///{os.path.join(BASE_DIR, 'events.db')}")

os.makedirs(UPLOAD_DIR, exist_ok=True)
