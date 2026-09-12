"""
Bridge Service — Cross-project bridge token management.

Handles one-time bridge tokens for YiPet → YiVad session transfer.
Replaces the previous URL-query-based sessionKey passing with a secure,
one-time token exchange mechanism.

See: YP-09-09 跨项目桥接可靠性增强
"""

import secrets
import time
from dataclasses import dataclass, field


@dataclass
class BridgeToken:
    token: str
    session_id: str
    origin: str
    created_at: float = field(default_factory=time.time)


class BridgeService:
    """One-time bridge token manager for cross-project session transfer."""

    def __init__(self):
        self._tokens: dict[str, BridgeToken] = {}
        self._ttl = 300  # 5 minutes
        self._token_bytes = 32  # 256-bit

    def create_token(self, session_id: str, origin: str) -> str:
        """Create a one-time bridge token."""
        token = secrets.token_urlsafe(self._token_bytes)
        self._tokens[token] = BridgeToken(
            token=token,
            session_id=session_id,
            origin=origin,
        )
        self._cleanup_expired()
        return token

    def exchange_token(self, token: str, expected_origin: str) -> dict | None:
        """Validate and consume a one-time token."""
        bt = self._tokens.get(token)
        if not bt:
            return None

        if time.time() - bt.created_at > self._ttl:
            del self._tokens[token]
            return None

        if bt.origin != expected_origin and expected_origin != "yivad":
            return None

        session_id = bt.session_id
        del self._tokens[token]
        return {"session_id": session_id, "valid": True}

    def _cleanup_expired(self):
        now = time.time()
        expired = [
            t for t, bt in self._tokens.items()
            if now - bt.created_at > self._ttl
        ]
        for t in expired:
            del self._tokens[t]


_bridge_service: BridgeService | None = None


def get_bridge_service() -> BridgeService:
    global _bridge_service
    if _bridge_service is None:
        _bridge_service = BridgeService()
    return _bridge_service