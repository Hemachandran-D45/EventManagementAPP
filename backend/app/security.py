import hmac
import hashlib
import time
from fastapi import Header, HTTPException, status
from app.config import SECURITY_PIN, JWT_SECRET

def create_access_token() -> str:
    ts = str(int(time.time()))
    signature = hmac.new(
        JWT_SECRET.encode(),
        f"{ts}:{SECURITY_PIN}".encode(),
        hashlib.sha256
    ).hexdigest()
    return f"{ts}:{signature}"

def verify_token(token: str) -> bool:
    try:
        parts = token.split(":")
        if len(parts) != 2:
            return False
        ts_str, signature = parts
        ts = int(ts_str)
        # Token valid for 30 days
        if time.time() - ts > 30 * 86400 or time.time() < ts - 60:
            return False
        expected = hmac.new(
            JWT_SECRET.encode(),
            f"{ts_str}:{SECURITY_PIN}".encode(),
            hashlib.sha256
        ).hexdigest()
        return hmac.compare_digest(signature, expected)
    except Exception:
        return False

def require_auth(
    x_auth_token: str = Header(None, alias="X-Auth-Token"),
    x_app_pin: str = Header(None, alias="X-App-Pin")
):
    if x_app_pin and hmac.compare_digest(x_app_pin.strip(), SECURITY_PIN.strip()):
        return True
    if x_auth_token and verify_token(x_auth_token):
        return True
    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Unauthorized: Valid Owner PIN or Auth Token required."
    )
