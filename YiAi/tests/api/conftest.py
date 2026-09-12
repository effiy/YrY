"""API test fixtures — FastAPI TestClient with mocked dependencies."""
import os
import sys
import pytest
from pathlib import Path
from unittest.mock import MagicMock, patch

# Ensure CWD is YiAi root so config.yaml is found
_YIAI_ROOT = Path(__file__).resolve().parent.parent.parent
os.chdir(str(_YIAI_ROOT))

# Mock observer BEFORE any application imports happen
_observer_mock = MagicMock()
_observer_mock.ThrottleMiddleware = MagicMock()
_observer_mock.SamplerMiddleware = MagicMock()
_observer_mock.TailSampler = MagicMock()
_observer_mock.ReentrancyGuard = MagicMock()
_observer_mock.sandbox_context = MagicMock()
sys.modules["observer"] = _observer_mock


def pytest_configure(config):
    """Patch settings BEFORE pytest collects any test modules that import app."""
    _setup_test_settings()


def _setup_test_settings():
    from shared.config import Settings
    s = Settings()
    s.observer_enabled = False
    s.observer_sampler_enabled = False
    s.observer_throttle_enabled = False
    s.observer_sandbox_enabled = False
    s.observer_guard_enabled = False
    s.startup_init_database = False
    s.startup_init_rss_system = False
    s.knowledge_watcher_enabled = False
    s.middleware_auth_enabled = False
    s.rss_scheduler_enabled = False
    s.audit_enabled = False
    # Replace the module-level singleton before any app code uses it
    import shared.config
    shared.config.settings = s


@pytest.fixture
def client():
    """Create a FastAPI TestClient with all init disabled."""
    from httpx import ASGITransport, AsyncClient
    from app import create_app

    app = create_app(init_db=False, init_rss=False, init_knowledge=False, enable_auth=False)
    transport = ASGITransport(app=app)
    return AsyncClient(transport=transport, base_url="http://test")