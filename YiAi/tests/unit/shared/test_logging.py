"""Tests for shared/logging.py."""
import logging
from unittest.mock import patch, MagicMock
from shared.logging import setup_logging, get_logger


class TestSetupLogging:
    def test_returns_none(self):
        """setup_logging configures the root logger, returns None."""
        with patch("shared.logging.settings") as mock_settings:
            mock_settings.logging_level = "INFO"
            mock_settings.logging_format = "%(levelname)s %(message)s"
            mock_settings.logging_datefmt = "%Y-%m-%d %H:%M:%S"
            with patch("shared.logging.os.path.exists", return_value=True):
                result = setup_logging()
                assert result is None

    def test_creates_log_dir_when_missing(self):
        with patch("shared.logging.settings") as mock_settings:
            mock_settings.logging_level = "DEBUG"
            mock_settings.logging_format = "%(message)s"
            mock_settings.logging_datefmt = ""
            with patch("shared.logging.os.path.exists", return_value=False):
                with patch("shared.logging.os.makedirs") as mock_mkdir:
                    setup_logging()
                    args, kwargs = mock_mkdir.call_args
                    assert args[0].endswith("logs")
                    assert kwargs.get("exist_ok") is True

    def test_sets_root_logger_level(self):
        with patch("shared.logging.settings") as mock_settings:
            mock_settings.logging_level = "WARNING"
            mock_settings.logging_format = "%(message)s"
            mock_settings.logging_datefmt = ""
            with patch("shared.logging.os.path.exists", return_value=True):
                setup_logging()
                assert logging.getLogger().level == logging.WARNING

    def test_fallback_to_info_on_invalid_level(self):
        with patch("shared.logging.settings") as mock_settings:
            mock_settings.logging_level = "INVALID_LEVEL"
            mock_settings.logging_format = "%(message)s"
            mock_settings.logging_datefmt = ""
            with patch("shared.logging.os.path.exists", return_value=True):
                setup_logging()
                assert logging.getLogger().level == logging.INFO

    def test_clears_existing_handlers(self):
        root = logging.getLogger()
        root.handlers = [logging.StreamHandler()]
        with patch("shared.logging.settings") as mock_settings:
            mock_settings.logging_level = "INFO"
            mock_settings.logging_format = "%(message)s"
            mock_settings.logging_datefmt = ""
            with patch("shared.logging.os.path.exists", return_value=True):
                setup_logging()
                # Should have console + file handler = 2
                assert len(root.handlers) == 2

    def test_suppresses_uvicorn_logs(self):
        with patch("shared.logging.settings") as mock_settings:
            mock_settings.logging_level = "INFO"
            mock_settings.logging_format = "%(message)s"
            mock_settings.logging_datefmt = ""
            with patch("shared.logging.os.path.exists", return_value=True):
                setup_logging()
                assert logging.getLogger("uvicorn.access").level == logging.WARNING
                assert logging.getLogger("uvicorn.error").level == logging.ERROR


class TestGetLogger:
    def test_returns_logger_instance(self):
        logger = get_logger("test.module")
        assert isinstance(logger, logging.Logger)

    def test_logger_name_matches(self):
        logger = get_logger("my.custom.logger")
        assert logger.name == "my.custom.logger"