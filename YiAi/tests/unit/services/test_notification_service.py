"""Tests for server/routes/notification.py — RPC methods."""
import pytest
from unittest.mock import AsyncMock, MagicMock, patch


class TestNotificationService:
    def test_mark_as_read_missing_id(self):
        from services.notification.notification_service import mark_as_read
        from shared.exceptions import BusinessException
        with pytest.raises(BusinessException, match="notification_id is required"):
            import asyncio
            asyncio.run(mark_as_read({"notification_id": ""}))

    def test_delete_notification_missing_id(self):
        from services.notification.notification_service import delete_notification
        from shared.exceptions import BusinessException
        with pytest.raises(BusinessException, match="notification_id is required"):
            import asyncio
            asyncio.run(delete_notification({"notification_id": ""}))


class TestNotificationHelpers:
    def test_now_returns_iso(self):
        from services.notification.notification_service import _now
        result = _now()
        assert "T" in result
        assert len(result) > 20

    def test_collection_name(self):
        from services.notification.notification_service import COLLECTION
        assert COLLECTION == "notifications"