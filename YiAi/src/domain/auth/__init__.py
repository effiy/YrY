"""Auth service — password hashing and JWT token management.

Public surface:
- ``hash_password(plain)`` — bcrypt hash
- ``verify_password(plain, hashed)`` — compare against hash
- ``create_jwt(user_id, username)`` — signed JWT string
- ``verify_jwt(token)`` — decode + validate, returns payload or ``None``
"""
from domain.auth.core import create_jwt, hash_password, verify_jwt, verify_password

__all__ = ["create_jwt", "hash_password", "verify_jwt", "verify_password"]
