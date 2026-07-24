"""
企业微信机器人 Webhook 接口
- 提供发送消息到企业微信机器人的功能
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
    """发送文本消息到企业微信机器人。"""
    data = await send_message(request.webhook_url, request.content)
    return success(data=data)
