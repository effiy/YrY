import logging
import sys
import os
from logging.handlers import RotatingFileHandler
from shared.config import settings

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

    # Create formatter
    formatter = logging.Formatter(fmt=log_format, datefmt=log_datefmt)

    # 1. Console Handler
    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setFormatter(formatter)
    root_logger.addHandler(console_handler)

    # 2. File Handler (if log file path is configured)
    # Assume log dir is obtainable from config, default to logs/app.log
    log_dir = "logs"
    if not os.path.exists(log_dir):
        os.makedirs(log_dir)

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
