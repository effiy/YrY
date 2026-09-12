"""Tests for services/audit/audit_service.py — query_audit_logs."""
import pytest
from unittest.mock import AsyncMock, MagicMock, patch
from datetime import datetime, timezone


class TestQueryAuditLogs:
    @pytest.fixture
    def mock_db(self):
        with patch("services.audit.audit_service.db") as mock:
            mock.initialize = AsyncMock()
            mock.db = {"audit_logs": MagicMock()}
            yield mock

    @pytest.fixture
    def mock_settings(self):
        with patch("services.audit.audit_service.settings") as mock:
            mock.audit_collection = "audit_logs"
            yield mock

    @pytest.mark.asyncio
    async def test_query_no_filters(self, mock_db, mock_settings):
        coll = mock_db.db["audit_logs"]
        coll.find.return_value.sort.return_value.skip.return_value.limit.return_value = MagicMock()
        coll.find.return_value.sort.return_value.skip.return_value.limit.return_value.__aiter__.return_value = iter([
            {"_id": "obj1", "actor": "alice", "operation": "CREATE"},
            {"_id": "obj2", "actor": "bob", "operation": "UPDATE"},
        ])
        coll.count_documents = AsyncMock(return_value=2)

        from services.audit.audit_service import query_audit_logs
        result = await query_audit_logs({})

        assert result["total"] == 2
        assert len(result["list"]) == 2
        assert result["list"][0]["actor"] == "alice"
        assert "_id" not in result["list"][0]

    @pytest.mark.asyncio
    async def test_query_with_actor_filter(self, mock_db, mock_settings):
        coll = mock_db.db["audit_logs"]
        coll.find.return_value.sort.return_value.skip.return_value.limit.return_value.__aiter__.return_value = iter([])
        coll.count_documents = AsyncMock(return_value=0)

        from services.audit.audit_service import query_audit_logs
        await query_audit_logs({"actor": "alice"})

        filter_arg = coll.find.call_args[0][0]
        assert filter_arg["actor"] == "alice"

    @pytest.mark.asyncio
    async def test_query_with_time_range(self, mock_db, mock_settings):
        coll = mock_db.db["audit_logs"]
        coll.find.return_value.sort.return_value.skip.return_value.limit.return_value.__aiter__.return_value = iter([])
        coll.count_documents = AsyncMock(return_value=0)

        from services.audit.audit_service import query_audit_logs
        await query_audit_logs({
            "start_time": "2026-08-01T00:00:00Z",
            "end_time": "2026-08-31T23:59:59Z",
        })

        filter_arg = coll.find.call_args[0][0]
        assert filter_arg["timestamp"]["$gte"] == "2026-08-01T00:00:00Z"
        assert filter_arg["timestamp"]["$lte"] == "2026-08-31T23:59:59Z"

    @pytest.mark.asyncio
    async def test_query_limit_capped(self, mock_db, mock_settings):
        coll = mock_db.db["audit_logs"]
        coll.find.return_value.sort.return_value.skip.return_value.limit.return_value.__aiter__.return_value = iter([])
        coll.count_documents = AsyncMock(return_value=100)

        from services.audit.audit_service import query_audit_logs
        result = await query_audit_logs({"limit": 1000})

        assert result["limit"] == 500  # capped at 500

    @pytest.mark.asyncio
    async def test_query_offset_negative_clamped(self, mock_db, mock_settings):
        coll = mock_db.db["audit_logs"]
        coll.find.return_value.sort.return_value.skip.return_value.limit.return_value.__aiter__.return_value = iter([])
        coll.count_documents = AsyncMock(return_value=0)

        from services.audit.audit_service import query_audit_logs
        result = await query_audit_logs({"offset": -10})

        assert result["offset"] == 0