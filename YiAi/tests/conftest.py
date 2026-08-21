import pytest
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