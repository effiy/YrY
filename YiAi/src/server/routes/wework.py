"""
WeCom Bot Webhook API
- Provides ability to send messages to WeCom bots
"""
import logging

from fastapi import APIRouter

from domain.wework import send_message
from models.schemas import WeWorkWebhookRequest
from shared.response import success

logger = logging.getLogger(__name__)
router = APIRouter()


@router.post("/wework/send-message", operation_id="send_wework_message")
async def send_wework_message(request: WeWorkWebhookRequest):
    """Send text message to WeCom bot."""
    data = await send_message(request.webhook_url, request.content)
    return success(data=data)
