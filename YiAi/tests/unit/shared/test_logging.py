"""Tests for shared/logging.py — loguru-based implementation."""
from shared.logging import setup_logging, get_logger, _InterceptHandler
import logging


class TestSetupLogging:
    def test_returns_none(self):
        """setup_logging configures loguru globally, returns None."""
        result = setup_logging()
        assert result is None

    def test_idempotent(self):
        """Calling setup_logging twice should not crash."""
        setup_logging()
        setup_logging()  # second call removes existing handlers first

    def test_intercept_handler_is_logging_handler(self):
        """_InterceptHandler is a stdlib logging.Handler."""
        assert isinstance(_InterceptHandler(), logging.Handler)

    def test_intercept_handler_emit(self):
        """_InterceptHandler.emit routes log records without error."""
        handler = _InterceptHandler()
        record = logging.LogRecord(
            name="test", level=logging.INFO, pathname="test.py",
            lineno=1, msg="hello", args=(), exc_info=None
        )
        # Should not raise
        handler.emit(record)

    def test_suppresses_uvicorn_logs(self):
        """Uvicorn access/error loggers are intercepted with _InterceptHandler."""
        setup_logging()
        for name in ("uvicorn.access", "uvicorn.error", "uvicorn.asgi"):
            uvicorn_logger = logging.getLogger(name)
            assert not uvicorn_logger.propagate
            assert len(uvicorn_logger.handlers) >= 1

    def test_stdout_handler_added(self):
        """setup_logging adds a stdout handler."""
        from loguru import logger
        setup_logging()
        handlers = logger._core.handlers
        assert len(handlers) >= 1  # at least stdout


class TestGetLogger:
    def test_returns_logger_instance(self):
        """get_logger returns a loguru Logger (bound with name)."""
        result = get_logger("test.module")
        # Should be a loguru Logger — check it has the bind we expect
        assert hasattr(result, "bind")

    def test_logger_is_callable(self):
        """Logger can be used for logging without error."""
        logger = get_logger("test.module")
        # Just verify it doesn't raise on basic operations
        assert callable(logger.info)
        assert callable(logger.debug)