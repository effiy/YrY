"""URL safety guard — SSRF protection via private/reserved IP blocking.

Shared by ``server/routes/search.py`` (HTTP /web-fetch route) and
``domain/ai/tools/builtin/web_tools.py`` (agent web_fetch tool).

Both callers need the same SSRF guard but live in different layers
(server vs. domain), so the logic is centralised here.
"""

from __future__ import annotations

import ipaddress
import socket
from urllib.parse import urlparse

# ── Blocked networks (RFC 1918, loopback, link-local, metadata) ──

_PRIVATE_NETWORKS: list[ipaddress.IPv4Network | ipaddress.IPv6Network] = [
    ipaddress.ip_network("10.0.0.0/8"),       # RFC 1918 Class A
    ipaddress.ip_network("172.16.0.0/12"),    # RFC 1918 Class B
    ipaddress.ip_network("192.168.0.0/16"),   # RFC 1918 Class C
    ipaddress.ip_network("127.0.0.0/8"),      # IPv4 loopback
    ipaddress.ip_network("169.254.0.0/16"),   # link-local (AWS/cloud metadata)
    ipaddress.ip_network("0.0.0.0/8"),        # "This" network
    ipaddress.ip_network("fc00::/7"),         # IPv6 unique local
    ipaddress.ip_network("::1/128"),          # IPv6 loopback
    ipaddress.ip_network("fe80::/10"),        # IPv6 link-local
]

_BLOCKED_HOSTS: frozenset[str] = frozenset({
    "localhost",
    "localhost.localdomain",
    "metadata.google.internal",  # GCP metadata
})


def is_private_url(url: str) -> bool:
    """Return True if *url* resolves to a private/reserved IP address.

    Checks in order:
    1. Direct IP literal matching against blocked networks
    2. Blocked hostname matching (localhost, .local, metadata endpoints)
    3. DNS resolution + IP check (catches internal DNS names)

    Used as an SSRF guard before making outbound HTTP requests from
    user-supplied URLs.
    """
    try:
        p = urlparse(url.strip())
        hostname = (p.hostname or "").lower()
        if not hostname:
            return True
        if hostname in _BLOCKED_HOSTS or hostname.endswith(".local"):
            return True
        addr = ipaddress.ip_address(hostname)
    except ValueError:
        # Not an IP literal — resolve via DNS
        try:
            resolved = socket.getaddrinfo(
                hostname, None, socket.AF_UNSPEC, socket.SOCK_STREAM
            )
            ips = {r[4][0] for r in resolved}
            for ip_str in ips:
                addr = ipaddress.ip_address(ip_str)
                if any(addr in net for net in _PRIVATE_NETWORKS):
                    return True
        except (socket.gaierror, OSError):
            return True
        return False

    return any(addr in net for net in _PRIVATE_NETWORKS)
