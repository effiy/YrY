"""RSS scheduled parsing and database storage.
- Pull RSS feeds at configured intervals, parse entries, and write to database.
- Provides start/stop and dynamic configuration capabilities.
"""
import logging
import asyncio
from typing import List, Dict, Any, Optional
from data.database import db
from shared.error_codes import ErrorCode
from shared.exceptions import BusinessException
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.interval import IntervalTrigger
from apscheduler.triggers.cron import CronTrigger
from shared.config import settings
from domain.rss.feed import process_feed_from_url

logger = logging.getLogger(__name__)


class RSSSchedulerManager:
    """RSS scheduler manager, encapsulates scheduler state and configuration"""

    _PARSE_CONCURRENCY = 3  # simultaneous RSS feed parses

    def __init__(self):
        self._scheduler: Optional[AsyncIOScheduler] = None
        self._running = False
        self._config: Dict[str, Any] = {
            'type': 'interval',
            'interval': settings.rss_scheduler_interval,
            'cron': {
                'second': None,
                'minute': None,
                'hour': None,
                'day': None,
                'month': None,
                'day_of_week': None
            }
        }

    @property
    def is_running(self) -> bool:
        """Whether the scheduler is currently running"""
        return self._running

    @property
    def config(self) -> Dict[str, Any]:
        """Get current configuration"""
        return self._config.copy()

    def get_scheduler(self) -> AsyncIOScheduler:
        """Get or create the scheduler instance"""
        if self._scheduler is None:
            self._scheduler = AsyncIOScheduler()
        return self._scheduler

    async def parse_all_sources(self) -> Dict[str, Any]:
        """Parse all enabled RSS sources"""
        try:
            await db.initialize()
            sources = await self._get_enabled_sources()

            if not sources:
                return {
                    'total_sources': 0,
                    'success_count': 0,
                    'failed_count': 0,
                    'results': []
                }

            logger.info(f"Start batch parsing {len(sources)} RSS source(s)")

            sem = asyncio.Semaphore(self._PARSE_CONCURRENCY)

            async def worker(source):
                url = source.get('url')
                name = source.get('name')
                if not url:
                    return None

                async with sem:
                    return await process_feed_from_url(url, name)

            tasks = [worker(source) for source in sources]
            raw_results = await asyncio.gather(*tasks)
            results = [r for r in raw_results if r is not None]

            success_count = sum(1 for r in results if r.get('success'))
            failed_count = len(results) - success_count

            return {
                'total_sources': len(sources),
                'success_count': success_count,
                'failed_count': failed_count,
                'results': results
            }
        except Exception as e:
            logger.error(f"Batch parse failed: {str(e)}")
            raise BusinessException(ErrorCode.INTERNAL_ERROR, message=f"Batch parse failed: {str(e)}")

    async def _get_enabled_sources(self) -> List[Dict[str, Any]]:
        """Get all enabled RSS source configurations"""
        try:
            await db.initialize()
            collection = db.db[settings.collection_seeds]

            filter_dict = {
                '$or': [
                    {'enabled': {'$ne': False}},
                    {'enabled': {'$exists': False}}
                ],
                'url': {'$exists': True, '$ne': ''}
            }

            cursor = collection.find(filter_dict, {'_id': 0})
            sources = [doc async for doc in cursor]
            return sources
        except Exception as e:
            logger.error(f"Failed to get RSS source list: {str(e)}", exc_info=True)
            return []

    async def _scheduler_job(self):
        """RSS scheduled task execution body"""
        try:
            logger.info("Start executing scheduled RSS parse task")
            result = await self.parse_all_sources()
            logger.info(f"Scheduled RSS parse task completed: {result.get('success_count', 0)} succeeded, {result.get('failed_count', 0)} failed")
        except Exception as e:
            logger.error(f"Scheduled RSS parse task execution failed: {str(e)}", exc_info=True)

    def start(self):
        """Start RSS scheduled parsing task"""
        if self._running:
            logger.warning("RSS scheduled parsing task is already running")
            return

        scheduler = self.get_scheduler()
        scheduler.remove_all_jobs()

        config = self._config
        if config['type'] == 'cron' and config.get('cron'):
            cron_config = config['cron']
            trigger_kwargs = {
                k: v for k, v in cron_config.items()
                if v is not None and k in ['second', 'minute', 'hour', 'day', 'month', 'day_of_week']
            }
            trigger = CronTrigger(**trigger_kwargs)
            logger.info(f"RSS scheduled parsing task started (Cron mode): {trigger_kwargs}")
        else:
            interval = config.get('interval', 3600)
            trigger = IntervalTrigger(seconds=interval)
            logger.info(f"RSS scheduled parsing task started (Interval mode): {interval} seconds")

        scheduler.add_job(
            self._scheduler_job,
            trigger=trigger,
            id='rss_parse_job',
            replace_existing=True
        )

        if not scheduler.running:
            scheduler.start()

        self._running = True
        logger.info("RSS scheduled parsing task started")

    def stop(self):
        """Stop RSS scheduled parsing task"""
        scheduler = self.get_scheduler()
        if scheduler.running:
            scheduler.shutdown(wait=False)
            self._scheduler = None

        self._running = False
        logger.info("RSS scheduled parsing task stopped")

    def set_config(self, config: Dict[str, Any]):
        """Set RSS scheduler configuration"""
        if config.get('type') == 'interval':
            interval = config.get('interval')
            if interval is None:
                interval = self._config.get('interval', 3600)

            if interval < 60:
                raise ValueError("Scheduler interval cannot be less than 60 seconds")

            self._config['type'] = 'interval'
            self._config['interval'] = interval
            if 'cron' not in self._config:
                self._config['cron'] = {}

            logger.info(f"RSS scheduler config set to Interval mode: {interval} seconds")
        elif config.get('type') == 'cron':
            cron_config = config.get('cron', {})

            # Validate cron configuration
            validations = [
                ('second', 0, 59),
                ('minute', 0, 59),
                ('hour', 0, 23),
                ('day', 1, 31),
                ('month', 1, 12),
                ('day_of_week', 0, 6)
            ]

            for field, min_val, max_val in validations:
                v = cron_config.get(field)
                if isinstance(v, int) and not (min_val <= v <= max_val):
                    raise ValueError(f"{field} must be between {min_val}-{max_val}")

            self._config['type'] = 'cron'
            self._config['cron'] = cron_config
            if 'interval' not in self._config:
                self._config['interval'] = 3600

            logger.info(f"RSS scheduler config set to Cron mode: {cron_config}")

        if self._running:
            self.stop()
            self.start()

    def get_status(self) -> Dict[str, Any]:
        """Get scheduler status information"""
        return {
            'enabled': self._running,
            'type': self._config.get('type', 'interval'),
            'interval': self._config.get('interval'),
            'cron': self._config.get('cron', {})
        }


# Global singleton instance
_scheduler_manager = RSSSchedulerManager()


# Backward-compatible module-level functions, delegate to singleton instance
async def get_enabled_rss_sources() -> List[Dict[str, Any]]:
    """Get all enabled RSS source configurations"""
    return await _scheduler_manager._get_enabled_sources()


async def parse_rss_source_safe(url: str, name: Optional[str] = None) -> Dict[str, Any]:
    """Safely parse a single RSS source (with error handling)"""
    return await process_feed_from_url(url, name)


async def parse_all_enabled_rss_sources(params: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
    """
    Parse all enabled RSS sources

    Example:
        GET /?module_name=services.rss.rss_scheduler&method_name=parse_all_enabled_rss_sources&parameters={}
    """
    return await _scheduler_manager.parse_all_sources()


async def rss_scheduler_job():
    """RSS scheduled task execution body"""
    await _scheduler_manager._scheduler_job()


def get_scheduler():
    """Get or create the global scheduler instance"""
    return _scheduler_manager.get_scheduler()


def start_rss_scheduler(params: Optional[Dict[str, Any]] = None):
    """
    Start RSS scheduled parsing task

    Example:
        GET /?module_name=services.rss.rss_scheduler&method_name=start_rss_scheduler&parameters={}
    """
    _scheduler_manager.start()


def stop_rss_scheduler(params: Optional[Dict[str, Any]] = None):
    """
    Stop RSS scheduled parsing task

    Example:
        GET /?module_name=services.rss.rss_scheduler&method_name=stop_rss_scheduler&parameters={}
    """
    _scheduler_manager.stop()


def set_scheduler_config(params: Dict[str, Any]):
    """
    Set RSS scheduler configuration

    Args:
        params: Configuration dictionary
            - type (str): 'interval' or 'cron'
            - interval (int): Interval in seconds (valid when type='interval')
            - cron (Dict): Cron configuration (valid when type='cron')

    Example:
        GET /?module_name=services.rss.rss_scheduler&method_name=set_scheduler_config&parameters={"config": {"type": "interval", "interval": 7200}}
    """
    config = params.get('config') if isinstance(params, dict) and isinstance(params.get('config'), dict) else params
    _scheduler_manager.set_config(config)


def get_scheduler_status_info(params: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
    """
    Get scheduler status information

    Example:
        GET /?module_name=services.rss.rss_scheduler&method_name=get_scheduler_status_info&parameters={}
    """
    return _scheduler_manager.get_status()


def init_rss_system():
    """Initialize RSS system"""
    if settings.is_rss_scheduler_enabled():
        try:
            _scheduler_manager.start()
            logger.info("RSS scheduled task started")
        except Exception as e:
            logger.warning(f"Failed to start RSS scheduled task: {str(e)}")


def shutdown_rss_system():
    """Shutdown RSS system (stop scheduled tasks)"""
    if settings.is_rss_scheduler_enabled():
        try:
            _scheduler_manager.stop()
            logger.info("RSS scheduled task stopped")
        except Exception as e:
            logger.warning(f"Failed to stop RSS scheduled task: {str(e)}")
