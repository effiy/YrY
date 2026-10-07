"""Tests for shared/url_guard.py — SSRF protection."""
import pytest
from shared.url_guard import is_private_url


class TestIsPrivateUrl:
    """SSRF guard — private/reserved IP detection."""

    # ── Blocked: loopback ──
    def test_localhost_http(self):
        assert is_private_url("http://localhost:10086")

    def test_localhost_https(self):
        assert is_private_url("https://localhost")

    def test_ipv4_loopback(self):
        assert is_private_url("http://127.0.0.1")

    def test_ipv4_loopback_range(self):
        assert is_private_url("http://127.255.255.255")

    def test_ipv6_loopback(self):
        assert is_private_url("http://[::1]:10086")

    # ── Blocked: private networks ──
    def test_10_network(self):
        assert is_private_url("http://10.0.0.1")

    def test_172_network(self):
        assert is_private_url("http://172.16.0.1")

    def test_192_network(self):
        assert is_private_url("http://192.168.1.1")

    # ── Blocked: link-local / metadata ──
    def test_aws_metadata(self):
        assert is_private_url("http://169.254.169.254/latest/meta-data/")

    def test_zero_network(self):
        assert is_private_url("http://0.0.0.0")

    # ── Blocked: IPv6 private ──
    def test_ipv6_link_local(self):
        assert is_private_url("http://[fe80::1]")

    def test_ipv6_unique_local(self):
        assert is_private_url("http://[fd12:3456:789a::1]")

    # ── Blocked: hostname-based ──
    def test_local_domain(self):
        assert is_private_url("http://internal.corp.local")

    def test_gcp_metadata_hostname(self):
        assert is_private_url("http://metadata.google.internal")

    # ── Allowed: public ──
    def test_google(self):
        assert not is_private_url("https://google.com")

    def test_github(self):
        assert not is_private_url("https://github.com")

    def test_public_ip(self):
        assert not is_private_url("http://8.8.8.8")

    def test_cloudflare(self):
        assert not is_private_url("http://1.1.1.1")

    # ── Edge cases ──
    def test_empty_url(self):
        assert is_private_url("")

    def test_no_hostname(self):
        assert is_private_url("not-a-url")

    def test_with_port_public(self):
        assert not is_private_url("https://example.com:8443")