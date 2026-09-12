from dataclasses import dataclass, asdict
from datetime import datetime
from typing import Dict, Any, Optional


@dataclass
class AuditLog:
    """Immutable audit log entry. Written before/after every data mutation."""

    log_id: str
    timestamp: datetime
    actor: str
    operation: str  # CREATE | UPDATE | DELETE
    collection: str
    document_key: str
    before: Optional[Dict[str, Any]] = None
    after: Optional[Dict[str, Any]] = None
    changes: Optional[Dict[str, Any]] = None
    ip_address: str = ""
    user_agent: str = ""

    def to_dict(self) -> Dict[str, Any]:
        d = {}
        for k, v in asdict(self).items():
            if v is not None:
                d[k] = v
        return d
