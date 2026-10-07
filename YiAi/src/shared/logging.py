"""Logging setup — backed by loguru for simpler, structured logging.

Replaces ~80 lines of stdlib logging boilerplate (formatters, handlers,
rotation, context filters) with loguru's declarative configuration.
"""

import logging
import sys

from loguru import logger


class _InterceptHandler(logging.Handler):
    """Route stdlib log records (uvicorn, third-party) through loguru."""

    def emit(self, record: logging.LogRecord) -> None:
        level = logger.level(record.levelname).name
        frame = logging.currentframe()
        depth = 2
        while frame and frame.f_code.co_filename == logging.__file__:
            frame = frame.f_back
            depth += 1
        logger.opt(depth=depth, exception=record.exc_info).bind(
            name=record.name
        ).log(level, record.getMessage())


def setup_logging() -> None:
    """Configure loguru globally — stdout + file with rotation."""
    logger.remove()

    # Console — colorized, compact
    logger.add(
        sys.stdout,
        format=(
            "<green>{time:YYYY-MM-DD HH:mm:ss}</green> | "
            "<level>{level: <8}</level> | "
            "<cyan>{extra[name]: <24}</cyan> | "
            "<level>{message}</level>"
        ),
        level="INFO",
        colorize=True,
        backtrace=False,
        diagnose=False,
    )

    # File — 10MB rotation, 5 backups
    logger.add(
        "logs/app.log",
        rotation="10 MB",
        retention=5,
        encoding="utf-8",
        format="{time:YYYY-MM-DD HH:mm:ss} | {level: <8} | {extra[name]: <24} | {message}",
        level="DEBUG",
        backtrace=True,
        diagnose=True,
    )

    # Intercept stdlib logging so uvicorn output flows through loguru
    logging.basicConfig(handlers=[_InterceptHandler()], level=0, force=True)

    # Suppress noisy uvicorn access logs
    for name in ("uvicorn.access", "uvicorn.error", "uvicorn.asgi"):
        logging.getLogger(name).handlers = [_InterceptHandler()]
        logging.getLogger(name).propagate = False

    logger.bind(name="shared.logging").info("Logging initialized")


def get_logger(name: str = __name__):
    """Return a loguru logger bound with the module name.
    Drop-in compatible with `logging.getLogger(name)` for all callers."""
    return logger.bind(name=name)
