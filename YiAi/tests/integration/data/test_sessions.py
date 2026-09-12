"""Tests for data/sessions.py — session CRUD operations."""
import pytest
from unittest.mock import AsyncMock, MagicMock, patch
from data.sessions import get_all_sessions, delete_session_by_key


class TestGetAllSessions:
    @pytest.mark.asyncio
    async def test_returns_list(self):
        mock_collection = MagicMock()
        mock_cursor = MagicMock()
        mock_cursor.__aiter__.return_value = iter([
            {"key": "sess1", "data": {}},
            {"key": "sess2", "data": {}},
        ])
        mock_collection.find.return_value = mock_cursor
        mock_db = MagicMock()
        mock_db.db = {"sessions": mock_collection}
        mock_db.initialize = AsyncMock()

        with patch("data.sessions.db", mock_db):
            with patch("data.sessions.settings") as mock_settings:
                mock_settings.collection_sessions = "sessions"
                sessions = await get_all_sessions()
                assert len(sessions) == 2

    @pytest.mark.asyncio
    async def test_returns_empty_list(self):
        mock_collection = MagicMock()
        mock_cursor = MagicMock()
        mock_cursor.__aiter__.return_value = iter([])
        mock_collection.find.return_value = mock_cursor
        mock_db = MagicMock()
        mock_db.db = {"sessions": mock_collection}
        mock_db.initialize = AsyncMock()

        with patch("data.sessions.db", mock_db):
            with patch("data.sessions.settings") as mock_settings:
                mock_settings.collection_sessions = "sessions"
                sessions = await get_all_sessions()
                assert sessions == []


class TestDeleteSessionByKey:
    @pytest.mark.asyncio
    async def test_returns_delete_count(self):
        mock_collection = MagicMock()
        mock_collection.delete_one = AsyncMock(return_value=MagicMock(deleted_count=1))
        mock_db = MagicMock()
        mock_db.db = {"sessions": mock_collection}
        mock_db.initialize = AsyncMock()

        with patch("data.sessions.db", mock_db):
            with patch("data.sessions.settings") as mock_settings:
                mock_settings.collection_sessions = "sessions"
                count = await delete_session_by_key("sess1")
                assert count == 1

    @pytest.mark.asyncio
    async def test_returns_zero_when_not_found(self):
        mock_collection = MagicMock()
        mock_collection.delete_one = AsyncMock(return_value=MagicMock(deleted_count=0))
        mock_db = MagicMock()
        mock_db.db = {"sessions": mock_collection}
        mock_db.initialize = AsyncMock()

        with patch("data.sessions.db", mock_db):
            with patch("data.sessions.settings") as mock_settings:
                mock_settings.collection_sessions = "sessions"
                count = await delete_session_by_key("nonexistent")
                assert count == 0