"""Auth domain logic — password hashing and JWT token management.

Password flow:
  Client sends the plaintext password over HTTPS.
  Server stores bcrypt(password) in MongoDB.
  On login, server runs bcrypt.checkpw(received_password, stored_hash).
"""
import logging
from datetime import datetime, timedelta, timezone
from typing import Optional

import bcrypt
import jwt

from shared.config import settings

logger = logging.getLogger(__name__)

_JWT_ALGORITHM = "HS256"


def hash_password(plain: str) -> str:
    """Return bcrypt(plain) for storage.

    Call this when creating / updating a user password.
    *plain* is the password string received from the client.
    """
    return bcrypt.hashpw(plain.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def verify_password(plain: str, stored: str) -> bool:
    """Verify a password against a stored bcrypt(*) hash.

    Returns False on any failure (empty/malformed stored hash, no match).
    Never raises — callers in the login flow rely on a bool so they can map
    False to a clean 401 instead of a 500 from an uncaught ValueError.
    """
    if not plain or not stored:
        return False
    try:
        return bcrypt.checkpw(plain.encode("utf-8"), stored.encode("utf-8"))
    except (ValueError, TypeError) as exc:
        # bcrypt raises ValueError("Invalid salt") for empty/malformed stored
        # hashes — e.g. legacy rows with no password field, corrupted migrations,
        # or someone stored plaintext. Treat as "no match", not a crash.
        logger.warning(f"verify_password rejected malformed stored hash: {exc}")
        return False


def create_jwt(user_id: str, username: str) -> str:
    """Create a signed JWT token for the given user.

    Expiry and secret are read from config; defaults to 24h and a
    sensible dev secret.
    """
    expire_minutes = getattr(settings, "jwt_expire_minutes", 1440)
    secret = getattr(settings, "jwt_secret", "yi-ai-dev-secret")

    payload = {
        "sub": user_id,
        "username": username,
        "iat": datetime.now(timezone.utc),
        "exp": datetime.now(timezone.utc) + timedelta(minutes=expire_minutes),
    }
    return jwt.encode(payload, secret, algorithm=_JWT_ALGORITHM)


def verify_jwt(token: str) -> Optional[dict]:
    """Decode and validate a JWT token.

    Returns the payload dict on success, or ``None`` on any failure
    (expired, invalid signature, malformed, etc.).
    """
    secret = getattr(settings, "jwt_secret", "yi-ai-dev-secret")
    try:
        payload = jwt.decode(token, secret, algorithms=[_JWT_ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        logger.warning("JWT token expired")
        return None
    except jwt.InvalidTokenError as exc:
        logger.warning(f"Invalid JWT token: {exc}")
        return None
