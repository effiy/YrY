"""Backup scheduler — cron-based backup jobs via apscheduler."""

from apscheduler.schedulers.asyncio import AsyncIOScheduler
from services.backup.backup_service import backup_service
from shared.logging import get_logger

logger = get_logger(__name__)

scheduler = AsyncIOScheduler()


def setup_backup_scheduler():
    """Register backup jobs with the scheduler."""
    scheduler.add_job(
        backup_service.full_backup,
        trigger="cron",
        hour=2,
        minute=0,
        id="full_backup",
        name="Daily full backup",
        replace_existing=True,
    )
    scheduler.add_job(
        backup_service.incremental_backup,
        trigger="cron",
        minute=5,
        id="incremental_backup",
        name="Hourly incremental backup",
        replace_existing=True,
    )
    scheduler.start()
    logger.info("[Backup] Scheduler started (daily 02:00 full + hourly incremental)")


def shutdown_backup_scheduler():
    scheduler.shutdown(wait=False)
    logger.info("[Backup] Scheduler stopped")