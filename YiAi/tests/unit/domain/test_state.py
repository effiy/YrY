"""Tests for domain/state/service.py — StateStoreService with mocked MongoDB."""
import pytest
from unittest.mock import AsyncMock, MagicMock, patch
from domain.state.service import StateStoreService


@pytest.fixture
def mock_db():
    """Create a StateStoreService with mocked MongoDB collection."""
    mock_col = MagicMock()
    mock_col.insert_one = AsyncMock()
    mock_col.find_one = AsyncMock(return_value=None)
    mock_col.find = MagicMock()
    mock_col.count_documents = AsyncMock(return_value=0)
    mock_col.update_one = AsyncMock(return_value=MagicMock(matched_count=1))
    mock_col.delete_one = AsyncMock(return_value=MagicMock(deleted_count=1))

    mock_db = MagicMock()
    mock_db.db = {"state_records": mock_col}
    mock_db.initialize = AsyncMock()

    svc = StateStoreService()
    return svc, mock_db, mock_col


class TestStateStoreCreate:
    @pytest.mark.asyncio
    async def test_create_with_key(self, mock_db):
        svc, mock_db_inst, mock_col = mock_db
        with patch("domain.state.service.db", mock_db_inst):
            result = await svc.create({"key": "my-key", "title": "Test"})
            assert result["key"] == "my-key"
            assert result["title"] == "Test"
            assert "createdTime" in result
            mock_col.insert_one.assert_called_once()

    @pytest.mark.asyncio
    async def test_create_auto_generates_key(self, mock_db):
        svc, mock_db_inst, mock_col = mock_db
        with patch("domain.state.service.db", mock_db_inst):
            result = await svc.create({"title": "No Key"})
            assert "key" in result
            assert len(result["key"]) > 0


class TestStateStoreQuery:
    @pytest.mark.asyncio
    async def test_query_basic(self, mock_db):
        svc, mock_db_inst, mock_col = mock_db
        mock_col.count_documents = AsyncMock(return_value=0)
        # Make the collection itself async-iterable since find().sort().skip().limit()
        # returns a chained MagicMock that ultimately delegates to __aiter__
        mock_cursor = MagicMock()
        mock_cursor.__aiter__.return_value = iter([])
        mock_col.find = MagicMock(return_value=mock_cursor)
        mock_col.find.return_value.sort.return_value.skip.return_value.limit.return_value = mock_cursor

        with patch("domain.state.service.db", mock_db_inst):
            result = await svc.query()
            assert result["list"] == []
            assert result["total"] == 0
            assert result["pageNum"] == 1

    @pytest.mark.asyncio
    async def test_query_with_filters(self, mock_db):
        svc, mock_db_inst, mock_col = mock_db
        mock_col.count_documents = AsyncMock(return_value=1)
        mock_cursor = MagicMock()
        mock_cursor.__aiter__.return_value = iter([{"key": "k1", "title": "Test"}])
        mock_col.find = MagicMock(return_value=mock_cursor)
        mock_col.find.return_value.sort.return_value.skip.return_value.limit.return_value = mock_cursor

        with patch("domain.state.service.db", mock_db_inst):
            result = await svc.query(record_type="note", tags=["tag1"])
            assert result["total"] == 1
            assert result["list"][0]["key"] == "k1"


class TestStateStoreGet:
    @pytest.mark.asyncio
    async def test_get_existing(self, mock_db):
        svc, mock_db_inst, mock_col = mock_db
        mock_col.find_one = AsyncMock(return_value={"key": "k1", "title": "Found"})

        with patch("domain.state.service.db", mock_db_inst):
            result = await svc.get("k1")
            assert result["key"] == "k1"
            assert result["title"] == "Found"

    @pytest.mark.asyncio
    async def test_get_not_found(self, mock_db):
        svc, mock_db_inst, mock_col = mock_db
        mock_col.find_one = AsyncMock(return_value=None)

        with patch("domain.state.service.db", mock_db_inst):
            result = await svc.get("nonexistent")
            assert result is None


class TestStateStoreUpdate:
    @pytest.mark.asyncio
    async def test_update_existing(self, mock_db):
        svc, mock_db_inst, mock_col = mock_db
        mock_col.update_one = AsyncMock(return_value=MagicMock(matched_count=1))
        mock_col.find_one = AsyncMock(return_value={"key": "k1", "title": "Updated"})

        with patch("domain.state.service.db", mock_db_inst):
            result = await svc.update("k1", {"title": "Updated"})
            assert result["title"] == "Updated"

    @pytest.mark.asyncio
    async def test_update_not_found_raises(self, mock_db):
        svc, mock_db_inst, mock_col = mock_db
        mock_col.update_one = AsyncMock(return_value=MagicMock(matched_count=0))

        with patch("domain.state.service.db", mock_db_inst):
            with pytest.raises(ValueError, match="not found"):
                await svc.update("nonexistent", {"title": "X"})


class TestStateStoreDelete:
    @pytest.mark.asyncio
    async def test_delete_existing(self, mock_db):
        svc, mock_db_inst, mock_col = mock_db
        mock_col.delete_one = AsyncMock(return_value=MagicMock(deleted_count=1))

        with patch("domain.state.service.db", mock_db_inst):
            result = await svc.delete("k1")
            assert result["key"] == "k1"
            assert result["deleted"] is True

    @pytest.mark.asyncio
    async def test_delete_not_found_raises(self, mock_db):
        svc, mock_db_inst, mock_col = mock_db
        mock_col.delete_one = AsyncMock(return_value=MagicMock(deleted_count=0))

        with patch("domain.state.service.db", mock_db_inst):
            with pytest.raises(ValueError, match="not found"):
                await svc.delete("nonexistent")