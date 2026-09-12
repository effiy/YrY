import pytest
from unittest.mock import AsyncMock, MagicMock
import sys
from pathlib import Path

# Ensure src/ is on the Python path so shared.* imports work
src_path = Path(__file__).resolve().parent.parent / "src"
if str(src_path) not in sys.path:
    sys.path.insert(0, str(src_path))


@pytest.fixture
def sample_text():
    """Sample mixed-language text for token estimation tests."""
    return "Hello 世界"


@pytest.fixture
def sample_json_text():
    """Text containing embedded JSON."""
    return 'Some text {"key": "value", "num": 42} more text'


@pytest.fixture
def sample_markdown_json():
    """Markdown code block with JSON."""
    return '```json\n{"items": [1, 2, 3]}\n```'


@pytest.fixture
def mock_mongo(mocker):
    """Mock MongoDB singleton for unit tests that don't need a real database."""
    mock_db = MagicMock()
    mock_db.find_one = AsyncMock(return_value={"key": "test"})
    mock_db.find_many = AsyncMock(return_value=[])
    mock_db.insert_one = AsyncMock(return_value="mock-id-123")
    mock_db.insert_many = AsyncMock(return_value=["id1", "id2"])
    mock_db.delete_one = AsyncMock(return_value=1)
    mock_db.update_one = AsyncMock(return_value=MagicMock(modified_count=1))
    mock_db.db = MagicMock()
    mock_db.initialize = AsyncMock()

    mock_instance = mocker.patch("data.database.MongoDB", return_value=mock_db)
    mock_instance._instance = mock_db
    return mock_db