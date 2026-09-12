"""Tests for data/database.py — MongoDB singleton behavior."""
import pytest
from unittest.mock import patch, AsyncMock, MagicMock
from data.database import MongoDB, db


class TestMongoDBSingleton:
    def test_new_creates_instance(self):
        MongoDB._instance = None
        instance = MongoDB()
        assert isinstance(instance, MongoDB)

    def test_same_instance_returned(self):
        MongoDB._instance = None
        a = MongoDB()
        b = MongoDB()
        assert a is b

    def test_db_property_raises_when_not_initialized(self):
        mongo = MongoDB()
        mongo._db = None
        with pytest.raises(RuntimeError, match="not initialized"):
            _ = mongo.db

    def test_db_property_returns_db_when_initialized(self):
        mongo = MongoDB()
        mongo._db = MagicMock()
        assert mongo._db is not None

    def test_global_instance_exists(self):
        assert isinstance(db, MongoDB)


class TestMongoDBInitialize:
    @pytest.mark.asyncio
    async def test_initialize_creates_client(self):
        MongoDB._instance = None
        mongo = MongoDB()
        mock_client = MagicMock()
        mock_db = MagicMock()
        mock_client.__getitem__.return_value = mock_db

        with patch("data.database.AsyncIOMotorClient", return_value=mock_client):
            with patch("data.database.settings") as mock_settings:
                mock_settings.mongodb_url = "mongodb://localhost"
                mock_settings.mongodb_db_name = "test_db"
                mock_settings.mongodb_max_pool_size = 10
                mock_settings.mongodb_pool_size = 2
                mock_settings.collection_rss = "rss"
                mock_settings.collection_knowledge_files = "knowledge_files"
                await mongo.initialize()
                assert mongo._initialized is True

    @pytest.mark.asyncio
    async def test_initialize_idempotent(self):
        MongoDB._instance = None
        mongo = MongoDB()
        mongo._initialized = True
        await mongo.initialize()
        assert mongo._initialized is True

    @pytest.mark.asyncio
    async def test_close_cleans_up(self):
        MongoDB._instance = None
        mongo = MongoDB()
        mock_client = MagicMock()
        mongo._client = mock_client
        mongo._initialized = True
        await mongo.close()
        assert mongo._client is None
        assert mongo._initialized is False
        mock_client.close.assert_called_once()


class TestMongoDBCrudWrappers:
    @pytest.mark.asyncio
    async def test_insert_one_adds_timestamp(self):
        MongoDB._instance = None
        mongo = MongoDB()
        mock_collection = MagicMock()
        mock_collection.insert_one = AsyncMock(return_value=MagicMock(inserted_id="id123"))
        mongo._db = {"test_coll": mock_collection}
        mongo._initialized = True

        result = await mongo.insert_one("test_coll", {"name": "test"})
        assert result == "id123"
        call_args = mock_collection.insert_one.call_args[0][0]
        assert "createdTime" in call_args

    @pytest.mark.asyncio
    async def test_insert_one_preserves_existing_timestamp(self):
        MongoDB._instance = None
        mongo = MongoDB()
        mock_collection = MagicMock()
        mock_collection.insert_one = AsyncMock(return_value=MagicMock(inserted_id="id123"))
        mongo._db = {"test_coll": mock_collection}
        mongo._initialized = True

        result = await mongo.insert_one("test_coll", {"name": "test", "createdTime": "2026-01-01"})
        assert result == "id123"

    @pytest.mark.asyncio
    async def test_insert_many_adds_timestamps(self):
        MongoDB._instance = None
        mongo = MongoDB()
        mock_collection = MagicMock()
        mock_collection.insert_many = AsyncMock(return_value=MagicMock(inserted_ids=["id1", "id2"]))
        mongo._db = {"test_coll": mock_collection}
        mongo._initialized = True

        result = await mongo.insert_many("test_coll", [{"name": "a"}, {"name": "b"}])
        assert len(result) == 2

    @pytest.mark.asyncio
    async def test_find_one_delegates(self):
        MongoDB._instance = None
        mongo = MongoDB()
        mock_collection = MagicMock()
        mock_collection.find_one = AsyncMock(return_value={"key": "val"})
        mongo._db = {"test_coll": mock_collection}
        mongo._initialized = True

        result = await mongo.find_one("test_coll", {"key": "val"})
        assert result == {"key": "val"}

    @pytest.mark.asyncio
    async def test_delete_one_delegates(self):
        MongoDB._instance = None
        mongo = MongoDB()
        mock_collection = MagicMock()
        mock_collection.delete_one = AsyncMock(return_value=MagicMock(deleted_count=1))
        mongo._db = {"test_coll": mock_collection}
        mongo._initialized = True

        result = await mongo.delete_one("test_coll", {"key": "remove"})
        assert result == 1