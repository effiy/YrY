"""Integration test fixtures — requires MongoDB connection."""
import pytest
from unittest.mock import AsyncMock, MagicMock, patch


@pytest.fixture
def mock_mongo_integration():
    """Mock MongoDB for integration tests that test repository logic."""
    mock_db = MagicMock()
    mock_db.find_one = AsyncMock(return_value=None)
    mock_db.find_many = AsyncMock(return_value=[])
    mock_db.insert_one = AsyncMock(return_value="mock-id")
    mock_db.delete_one = AsyncMock(return_value=1)
    mock_db.update_one = AsyncMock(return_value=MagicMock(modified_count=1))
    mock_db.db = MagicMock()
    mock_db.initialize = AsyncMock()

    patcher = patch("data.database.db", mock_db)
    patcher.start()
    yield mock_db
    patcher.stop()