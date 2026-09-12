"""Tests for domain/audit/logger.py — AuditLogger with mocked MongoDB."""
import pytest
from unittest.mock import AsyncMock, MagicMock, patch
from domain.audit.logger import AuditLogger


class TestAuditLogger:
    @pytest.mark.asyncio
    async def test_write_inserts_entry(self):
        mock_coll = MagicMock()
        mock_coll.create_index = AsyncMock()
        mock_coll.insert_one = AsyncMock()

        mock_db = MagicMock()
        mock_db.db = {"audit_logs": mock_coll}
        mock_db.initialize = AsyncMock()

        AuditLogger._initialized = False

        with patch("domain.audit.logger.db", mock_db):
            with patch("domain.audit.logger.settings") as mock_settings:
                mock_settings.audit_collection = "audit_logs"
                mock_settings.audit_retention_days = 90
                await AuditLogger.write({"operation": "CREATE", "collection": "test"})
                mock_coll.insert_one.assert_called_once()

    @pytest.mark.asyncio
    async def test_write_sets_defaults(self):
        mock_coll = MagicMock()
        mock_coll.create_index = AsyncMock()
        mock_coll.insert_one = AsyncMock()

        mock_db = MagicMock()
        mock_db.db = {"audit_logs": mock_coll}
        mock_db.initialize = AsyncMock()

        AuditLogger._initialized = False

        with patch("domain.audit.logger.db", mock_db):
            with patch("domain.audit.logger.settings") as mock_settings:
                mock_settings.audit_collection = "audit_logs"
                mock_settings.audit_retention_days = 90
                await AuditLogger.write({"operation": "DELETE"})
                call_args = mock_coll.insert_one.call_args[0][0]
                assert "log_id" in call_args
                assert "timestamp" in call_args

    @pytest.mark.asyncio
    async def test_write_error_is_silent(self):
        mock_coll = MagicMock()
        mock_coll.create_index = AsyncMock()
        mock_coll.insert_one = AsyncMock(side_effect=RuntimeError("DB down"))

        mock_db = MagicMock()
        mock_db.db = {"audit_logs": mock_coll}
        mock_db.initialize = AsyncMock()

        AuditLogger._initialized = False

        with patch("domain.audit.logger.db", mock_db):
            with patch("domain.audit.logger.settings") as mock_settings:
                mock_settings.audit_collection = "audit_logs"
                mock_settings.audit_retention_days = 90
                # Should not raise
                await AuditLogger.write({"operation": "CREATE"})

    @pytest.mark.asyncio
    async def test_ensure_indexes_called_once(self):
        mock_coll = MagicMock()
        mock_coll.create_index = AsyncMock()

        mock_db = MagicMock()
        mock_db.db = {"audit_logs": mock_coll}
        mock_db.initialize = AsyncMock()

        AuditLogger._initialized = False

        with patch("domain.audit.logger.db", mock_db):
            with patch("domain.audit.logger.settings") as mock_settings:
                mock_settings.audit_collection = "audit_logs"
                mock_settings.audit_retention_days = 90
                await AuditLogger.write({"operation": "CREATE"})
                await AuditLogger.write({"operation": "UPDATE"})
                # create_index should be called for the first write only (5 indexes)
                # plus the second write should skip index creation
                assert mock_coll.create_index.call_count == 5

    def test_write_async_creates_task(self):
        with patch("domain.audit.logger.asyncio") as mock_asyncio:
            mock_task = MagicMock()
            mock_asyncio.create_task = MagicMock(return_value=mock_task)
            AuditLogger.write_async({"operation": "CREATE"})
            mock_asyncio.create_task.assert_called_once()