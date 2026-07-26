"""Auth domain logic — password hashing and JWT token management.

Password flow:
  Client sends SHA-256(password) over the wire.
  Server stores bcrypt(SHA-256(password)) in MongoDB.
  On login, server runs bcrypt.verify(received_sha256, stored_hash).

This ensures the plaintext password never leaves the client.
"""
import hashlib
import logging
from datetime import datetime, timedelta
from typing import Optional

import bcrypt
import jwt

from shared.config import settings

logger = logging.getLogger(__name__)

_JWT_ALGORITHM = "HS256"


def _sha256(plain: str) -> str:
    """Compute SHA-256 hex digest of a string."""
    return hashlib.sha256(plain.encode("utf-8")).hexdigest()


def hash_password(plain: str) -> str:
    """Return bcrypt(SHA-256(plain)) for storage.

    Call this when creating / updating a user password.
    The *plain* argument is the raw password as received from the client
    (which should already be SHA-256 hashed on the client side).
    """
    hashed = _sha256(plain)
    return bcrypt.hashpw(hashed.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def verify_password(plain: str, stored: str) -> bool:
    """Verify a password against a stored bcrypt(SHA-256(*)) hash.

    *plain* is the received SHA-256 hex string from the client.
    """
    return bcrypt.checkpw(plain.encode("utf-8"), stored.encode("utf-8"))


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
        "iat": datetime.utcnow(),
        "exp": datetime.utcnow() + timedelta(minutes=expire_minutes),
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
