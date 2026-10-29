from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel
import time
from app.config import SECURITY_PIN
from app.security import create_access_token, verify_token

router = APIRouter(prefix="/api/auth", tags=["Security & Auth"])

class PinVerifyRequest(BaseModel):
    pin: str

# In-memory IP tracking to prevent brute-force attacks
FAILED_ATTEMPTS = {} # ip -> [count, lock_until]

@router.post("/verify")
def verify_pin(payload: PinVerifyRequest, request: Request):
    client_ip = request.client.host if request.client else "unknown"
    now = time.time()
    
    # Check if this IP is currently locked out
    if client_ip in FAILED_ATTEMPTS:
        count, lock_until = FAILED_ATTEMPTS[client_ip]
        if now < lock_until:
            wait_sec = int(lock_until - now)
            raise HTTPException(
                status_code=429,
                detail=f"Too many failed PIN attempts. Locked out for {wait_sec} seconds."
            )
        elif now > lock_until and count >= 5:
            FAILED_ATTEMPTS[client_ip] = [0, 0]

    entered_pin = str(payload.pin).strip()
    correct_pin = str(SECURITY_PIN).strip()

    if entered_pin == correct_pin:
        # Reset failed attempts on success
        if client_ip in FAILED_ATTEMPTS:
            del FAILED_ATTEMPTS[client_ip]
        token = create_access_token()
        return {"status": "authenticated", "token": token}
    else:
        # Increment failed attempts
        count, _ = FAILED_ATTEMPTS.get(client_ip, [0, 0])
        count += 1
        lock_until = now + 300 if count >= 5 else 0 # 5-minute lockout after 5 fails
        FAILED_ATTEMPTS[client_ip] = [count, lock_until]
        remaining = max(0, 5 - count)
        raise HTTPException(
            status_code=401,
            detail=f"Invalid Owner PIN. {remaining} attempt(s) remaining before security lockout."
        )

@router.get("/status")
def check_auth_status(request: Request):
    token = request.headers.get("X-Auth-Token")
    pin = request.headers.get("X-App-Pin")
    is_valid = False
    if pin and str(pin).strip() == str(SECURITY_PIN).strip():
        is_valid = True
    elif token and verify_token(token):
        is_valid = True
    return {"authenticated": is_valid}
