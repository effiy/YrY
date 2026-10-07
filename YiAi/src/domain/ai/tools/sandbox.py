"""Tool sandboxing — path and URL allowlist checks."""

import os
from urllib.parse import urlparse

_ALLOWED_ROOTS = ["../YiKnowledge", "../YiVad", "../YiPet", "../YiAi"]
_ALLOWED_DOMAINS: list[str] = []


def _is_path_allowed(target: str) -> bool:
    cwd = os.getcwd()
    resolved = os.path.normpath(os.path.join(cwd, target))
    for root in _ALLOWED_ROOTS:
        allowed = os.path.normpath(os.path.join(cwd, root))
        if resolved.startswith(allowed + os.sep) or resolved == allowed:
            return True
    return False


def _is_url_allowed(url: str) -> bool:
    if not _ALLOWED_DOMAINS:
        return True
    try:
        host = (urlparse(url).hostname or "").lower()
    except ValueError:
        return False
    return any(host == allowed or host.endswith("." + allowed) for allowed in _ALLOWED_DOMAINS)
