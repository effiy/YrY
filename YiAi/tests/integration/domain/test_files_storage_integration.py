"""Integration tests for domain/files/storage.py — OSS storage with mocked MongoDB."""
import pytest
from unittest.mock import patch, MagicMock, AsyncMock
from domain.files.storage import (
    get_bucket,
    OSSConfig,
    set_file_tags,
    get_file_tags,
    delete_file_tags,
    get_all_tags,
    update_file_info,
    get_file_info,
)
from shared.exceptions import BusinessException


class TestGetBucket:
    def test_incomplete_config_raises(self):
        config = OSSConfig()
        config.access_key_id = ""
        with pytest.raises(RuntimeError, match="incomplete"):
            get_bucket(config)

    def test_valid_config_returns_bucket(self):
        with patch("domain.files.storage.oss2.Auth") as mock_auth:
            with patch("domain.files.storage.oss2.Bucket") as mock_bucket:
                config = OSSConfig()
                config.access_key_id = "ak"
                config.access_key_secret = "sk"
                config.endpoint = "oss.example.com"
                config.bucket_name = "my-bucket"
                result = get_bucket(config)
                mock_auth.assert_called_once_with("ak", "sk")
                mock_bucket.assert_called_once()
                assert result is mock_bucket.return_value


class TestSetFileTags:
    @pytest.mark.asyncio
    async def test_set_tags(self, mock_mongo_integration):
        mock_mongo_integration.db = {"oss_file_tags": MagicMock()}
        mock_mongo_integration.db["oss_file_tags"].update_one = AsyncMock()

        with patch("domain.files.storage.db", mock_mongo_integration):
            with patch("domain.files.storage.settings") as mock_settings:
                mock_settings.collection_oss_file_tags = "oss_file_tags"
                result = await set_file_tags("test.jpg", ["vacation", "work"])
                assert result["object_name"] == "test.jpg"
                assert set(result["tags"]) == {"vacation", "work"}

    @pytest.mark.asyncio
    async def test_set_tags_empty_raises(self):
        with pytest.raises(ValueError, match="cannot be empty"):
            await set_file_tags("", ["tag"])


class TestGetFileTags:
    @pytest.mark.asyncio
    async def test_get_tags(self, mock_mongo_integration):
        mock_mongo_integration.find_one = AsyncMock(return_value={"tags": ["a", "b"]})

        with patch("domain.files.storage.db", mock_mongo_integration):
            with patch("domain.files.storage.settings") as mock_settings:
                mock_settings.collection_oss_file_tags = "oss_file_tags"
                result = await get_file_tags("test.jpg")
                assert result == ["a", "b"]

    @pytest.mark.asyncio
    async def test_get_tags_not_found(self, mock_mongo_integration):
        mock_mongo_integration.find_one = AsyncMock(return_value=None)

        with patch("domain.files.storage.db", mock_mongo_integration):
            with patch("domain.files.storage.settings") as mock_settings:
                mock_settings.collection_oss_file_tags = "oss_file_tags"
                result = await get_file_tags("test.jpg")
                assert result == []


class TestDeleteFileTags:
    @pytest.mark.asyncio
    async def test_delete_tags(self, mock_mongo_integration):
        mock_mongo_integration.delete_one = AsyncMock(return_value=1)

        with patch("domain.files.storage.db", mock_mongo_integration):
            with patch("domain.files.storage.settings") as mock_settings:
                mock_settings.collection_oss_file_tags = "oss_file_tags"
                result = await delete_file_tags("test.jpg")
                assert result is True

    @pytest.mark.asyncio
    async def test_delete_tags_not_found(self, mock_mongo_integration):
        mock_mongo_integration.delete_one = AsyncMock(return_value=0)

        with patch("domain.files.storage.db", mock_mongo_integration):
            with patch("domain.files.storage.settings") as mock_settings:
                mock_settings.collection_oss_file_tags = "oss_file_tags"
                result = await delete_file_tags("test.jpg")
                assert result is False


class TestGetAllTags:
    @pytest.mark.asyncio
    async def test_get_all_tags(self, mock_mongo_integration):
        mock_mongo_integration.find_many = AsyncMock(return_value=[
            {"tags": ["a", "b"]},
            {"tags": ["a", "c"]},
        ])

        with patch("domain.files.storage.db", mock_mongo_integration):
            with patch("domain.files.storage.settings") as mock_settings:
                mock_settings.collection_oss_file_tags = "oss_file_tags"
                result = await get_all_tags()
                assert len(result) == 3
                names = [r["name"] for r in result]
                assert names[0] == "a"
                assert "b" in names
                assert "c" in names


class TestUpdateFileInfo:
    @pytest.mark.asyncio
    async def test_update_title(self, mock_mongo_integration):
        mock_mongo_integration.db = {"oss_file_info": MagicMock()}
        mock_mongo_integration.db["oss_file_info"].update_one = AsyncMock()

        with patch("domain.files.storage.db", mock_mongo_integration):
            with patch("domain.files.storage.settings") as mock_settings:
                mock_settings.collection_oss_file_info = "oss_file_info"
                result = await update_file_info("test.jpg", title="New Title")
                assert result["title"] == "New Title"

    @pytest.mark.asyncio
    async def test_update_description(self, mock_mongo_integration):
        mock_mongo_integration.db = {"oss_file_info": MagicMock()}
        mock_mongo_integration.db["oss_file_info"].update_one = AsyncMock()

        with patch("domain.files.storage.db", mock_mongo_integration):
            with patch("domain.files.storage.settings") as mock_settings:
                mock_settings.collection_oss_file_info = "oss_file_info"
                result = await update_file_info("test.jpg", description="A photo")
                assert result["description"] == "A photo"


class TestGetFileInfo:
    @pytest.mark.asyncio
    async def test_get_info_found(self, mock_mongo_integration):
        mock_mongo_integration.find_one = AsyncMock(return_value={
            "title": "My Photo",
            "description": "A nice photo",
        })

        with patch("domain.files.storage.db", mock_mongo_integration):
            with patch("domain.files.storage.settings") as mock_settings:
                mock_settings.collection_oss_file_info = "oss_file_info"
                result = await get_file_info("test.jpg")
                assert result["title"] == "My Photo"
                assert result["description"] == "A nice photo"

    @pytest.mark.asyncio
    async def test_get_info_not_found(self, mock_mongo_integration):
        mock_mongo_integration.find_one = AsyncMock(return_value=None)

        with patch("domain.files.storage.db", mock_mongo_integration):
            with patch("domain.files.storage.settings") as mock_settings:
                mock_settings.collection_oss_file_info = "oss_file_info"
                result = await get_file_info("test.jpg")
                assert result["title"] == ""
                assert result["description"] == ""