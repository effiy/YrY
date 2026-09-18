import logging
from logging.handlers import RotatingFileHandler
import os
import sys

from shared.config import settings

# Context variable for request_id — set by RequestIdMiddleware,
# consumed by RequestContextFilter for structured log enrichment.
try:
    from contextvars import ContextVar
    _request_id_ctx: ContextVar[str] = ContextVar("request_id", default="")
except ImportError:
    _request_id_ctx = None  # type: ignore[assignment]


class SafeFormatter(logging.Formatter):
    """Formatter that never crashes on missing fields — defaults them to '-'."""

    def format(self, record: logging.LogRecord) -> str:
        if not getattr(record, 'request_id', None):
            record.request_id = '-'
        return super().format(record)


class RequestContextFilter(logging.Filter):
    """Inject request_id into every log record when available."""

    def filter(self, record: logging.LogRecord) -> bool:
        if _request_id_ctx is not None:
            rid = _request_id_ctx.get()
            record.request_id = rid if rid else "-"
        else:
            record.request_id = "-"
        return True


def set_request_id(rid: str) -> None:
    """Set the current request_id for the async context (called by middleware)."""
    if _request_id_ctx is not None:
        _request_id_ctx.set(rid)


def setup_logging():
    """
    Configure global logging
    - Console output
    - File output (size-based rotation)
    - Unified format
    """
    log_level = settings.logging_level
    log_format = settings.logging_format
    log_datefmt = settings.logging_datefmt

    # Get root logger
    root_logger = logging.getLogger()
    # Use get_logging_level_value to get int-type log level
    level = getattr(logging, log_level.upper(), logging.INFO)
    root_logger.setLevel(level)

    # Clear existing handlers
    root_logger.handlers = []

    # Create formatter — include request_id when available
    fmt = log_format.replace(
        "%(message)s", "[%(request_id)s] %(message)s"
    )
    formatter = SafeFormatter(fmt=fmt, datefmt=log_datefmt)

    # Register context filter on root logger
    root_logger.addFilter(RequestContextFilter())

    # 1. Console Handler
    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setFormatter(formatter)
    root_logger.addHandler(console_handler)

    # 2. File Handler (if log file path is configured)
    # Resolve logs/ relative to the YiAi project root (2 levels up from src/shared/)
    _PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    log_dir = os.path.join(_PROJECT_ROOT, "logs")
    os.makedirs(log_dir, exist_ok=True)

    log_file = os.path.join(log_dir, "app.log")

    # 10MB per file, max 5 backups
    file_handler = RotatingFileHandler(
        log_file, maxBytes=10*1024*1024, backupCount=5, encoding="utf-8"
    )
    file_handler.setFormatter(formatter)
    root_logger.addHandler(file_handler)

    # Adjust third-party library log levels
    logging.getLogger("uvicorn.access").setLevel(logging.WARNING)
    logging.getLogger("uvicorn.error").setLevel(logging.ERROR)

# Export logger for other modules (you can also use logging.getLogger(__name__) directly, but this provides some encapsulation)
def get_logger(name: str):
    return logging.getLogger(name)
