"""Alert notification service — WeCom bot + email fallback."""

from datetime import datetime

import httpx

from shared.config import settings
from shared.logging import get_logger

logger = get_logger(__name__)


class AlertService:
    """Send alerts via WeCom bot and email (fallback)."""

    def __init__(self):
        self.wework_webhook = getattr(settings, "alert_wework_webhook", "")

    async def send_alert(
        self,
        title: str,
        message: str,
        severity: str = "warning",
    ) -> bool:
        """Send alert notification via WeCom bot."""
        if not self.wework_webhook:
            logger.warning("[Alert] WeCom webhook not configured, skipping alert")
            return False

        emoji = {"critical": "🔴", "warning": "🟡", "info": "🔵"}.get(severity, "🟡")
        now = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

        # Escape HTML special chars in message for WeCom markdown
        safe_message = message.replace("<", "&lt;").replace(">", "&gt;")

        content = (
            f"## {emoji} {title}\n"
            f"> Severity: **{severity.upper()}**\n"
            f"> Time: {now}\n\n"
            f"{safe_message}\n\n"
            f"---\n"
            f"*YiAi Monitoring*"
        )

        payload = {"msgtype": "markdown", "markdown": {"content": content}}

        try:
            async with httpx.AsyncClient() as client:
                resp = await client.post(
                    self.wework_webhook, json=payload, timeout=5.0
                )
                if resp.status_code == 200:
                    logger.info(f"[Alert] WeCom alert sent: {title}")
                    return True
                logger.error(f"[Alert] WeCom send failed: {resp.status_code}")
                return False
        except Exception as e:
            logger.error(f"[Alert] WeCom send error: {e}")
            return False


alert_service = AlertService()