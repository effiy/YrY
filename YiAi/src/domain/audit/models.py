from dataclasses import asdict, dataclass
from datetime import datetime
from typing import Any, Dict, Optional


@dataclass
class AuditLog:
    """Immutable audit log entry. Written before/after every data mutation."""

    log_id: str
    timestamp: datetime
    actor: str
    operation: str  # CREATE | UPDATE | DELETE
    collection: str
    document_key: str
    before: dict[str, Any] | None = None
    after: dict[str, Any] | None = None
    changes: dict[str, Any] | None = None
    ip_address: str = ""
    user_agent: str = ""

    def to_dict(self) -> dict[str, Any]:
        d = {}
        for k, v in asdict(self).items():
            if v is not None:
                d[k] = v
        return d
