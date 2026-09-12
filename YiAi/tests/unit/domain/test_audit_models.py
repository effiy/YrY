"""Tests for domain/audit/models.py — AuditLog dataclass."""
import pytest
from datetime import datetime, timezone
from domain.audit.models import AuditLog


class TestAuditLog:
    def test_create_operation(self):
        entry = AuditLog(
            log_id="abc-123",
            timestamp=datetime(2026, 8, 22, 10, 0, 0, tzinfo=timezone.utc),
            actor="alice",
            operation="CREATE",
            collection="issues",
            document_key="issue-1",
            after={"title": "New Issue", "status": "open"},
            ip_address="192.168.1.1",
        )
        d = entry.to_dict()
        assert d["log_id"] == "abc-123"
        assert d["operation"] == "CREATE"
        assert "before" not in d  # None should be excluded
        assert d["after"] == {"title": "New Issue", "status": "open"}
        assert d["actor"] == "alice"
        assert d["ip_address"] == "192.168.1.1"

    def test_update_operation_with_changes(self):
        entry = AuditLog(
            log_id="def-456",
            timestamp=datetime(2026, 8, 22, 11, 0, 0, tzinfo=timezone.utc),
            actor="bob",
            operation="UPDATE",
            collection="issues",
            document_key="issue-1",
            before={"title": "Old", "status": "open"},
            after={"title": "New", "status": "open"},
            changes={"title": {"old": "Old", "new": "New"}},
        )
        d = entry.to_dict()
        assert d["before"] == {"title": "Old", "status": "open"}
        assert d["after"] == {"title": "New", "status": "open"}
        assert d["changes"] == {"title": {"old": "Old", "new": "New"}}

    def test_delete_operation(self):
        entry = AuditLog(
            log_id="ghi-789",
            timestamp=datetime(2026, 8, 22, 12, 0, 0, tzinfo=timezone.utc),
            actor="carol",
            operation="DELETE",
            collection="bugs",
            document_key="bug-1",
            before={"title": "Bug report", "severity": "high"},
        )
        d = entry.to_dict()
        assert d["operation"] == "DELETE"
        assert d["before"] == {"title": "Bug report", "severity": "high"}
        assert "after" not in d

    def test_optional_fields_excluded(self):
        entry = AuditLog(
            log_id="jkl-012",
            timestamp=datetime(2026, 8, 22, 13, 0, 0, tzinfo=timezone.utc),
            actor="system",
            operation="CREATE",
            collection="menus",
            document_key="menu-1",
        )
        d = entry.to_dict()
        assert "before" not in d
        assert "after" not in d
        assert "changes" not in d
        assert d["ip_address"] == ""
        assert d["user_agent"] == ""

    def test_to_dict_roundtrip_keys(self):
        entry = AuditLog(
            log_id="mno-345",
            timestamp=datetime(2026, 8, 22, 14, 0, 0, tzinfo=timezone.utc),
            actor="dave",
            operation="UPDATE",
            collection="projects",
            document_key="proj-1",
            before={"name": "Old Project"},
            after={"name": "New Project"},
            changes={"name": {"old": "Old Project", "new": "New Project"}},
            ip_address="10.0.0.1",
            user_agent="Mozilla/5.0",
        )
        d = entry.to_dict()
        expected_keys = {
            "log_id", "timestamp", "actor", "operation", "collection",
            "document_key", "before", "after", "changes", "ip_address", "user_agent",
        }
        assert set(d.keys()) == expected_keys