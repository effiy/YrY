"""WeCom Bot Webhook Client.

Business layer — consolidates URL validation, WeCom payload building, aiohttp calls,
errcode handling, and error conversion here. The route layer only handles request
parsing and success response wrapping.
"""
import logging

import aiohttp

from shared.error_codes import ErrorCode
from shared.exceptions import BusinessException

logger = logging.getLogger(__name__)

_WWORK_HOST_PREFIX = "https://qyapi.weixin.qq.com/"
_REQUEST_TIMEOUT_SECONDS = 10


def _build_text_payload(content: str) -> dict:
    return {"msgtype": "text", "text": {"content": content}}


def _validate_webhook_url(webhook_url: str) -> str:
    if not webhook_url:
        raise BusinessException(
            ErrorCode.INVALID_PARAMS, message="Webhook URL cannot be empty"
        )
    if not webhook_url.startswith(_WWORK_HOST_PREFIX):
        raise BusinessException(
            ErrorCode.INVALID_PARAMS, message="Invalid WeCom Webhook URL"
        )
    return webhook_url


def _validate_content(content: str) -> str:
    if not content:
        raise BusinessException(
            ErrorCode.INVALID_PARAMS, message="Message content cannot be empty"
        )
    return content


async def send_message(webhook_url: str, content: str) -> dict:
    """Send text message to WeCom bot.

    Returns ``{"message": "Message sent successfully"}`` on success.
    Raises ``BusinessException`` (INVALID_PARAMS or INTERNAL_ERROR) on failure.
    """
    webhook_url = _validate_webhook_url(webhook_url.strip())
    content = _validate_content(content.strip())
    payload = _build_text_payload(content)

    try:
        async with aiohttp.ClientSession() as session:
            async with session.post(
                webhook_url,
                json=payload,
                headers={"Content-Type": "application/json"},
                timeout=aiohttp.ClientTimeout(total=_REQUEST_TIMEOUT_SECONDS),
            ) as response:
                response_data = await response.json()

                if response.status != 200:
                    error_msg = response_data.get("errmsg", f"HTTP {response.status}")
                    logger.error(f"WeCom Webhook request failed: {error_msg}")
                    raise BusinessException(
                        ErrorCode.INTERNAL_ERROR,
                        message=f"Send failed: {error_msg}",
                    )

                errcode = response_data.get("errcode", 0)
                if errcode != 0:
                    errmsg = response_data.get("errmsg", "Unknown error")
                    logger.error(
                        f"WeCom returned error: errcode={errcode}, errmsg={errmsg}"
                    )
                    raise BusinessException(
                        ErrorCode.INTERNAL_ERROR,
                        message=f"Send failed: {errmsg}",
                    )

                logger.info(f"Successfully sent message to WeCom bot: {webhook_url[:50]}...")
                return {"message": "Message sent successfully"}

    except aiohttp.ClientError as e:
        logger.error(f"WeCom Webhook request exception: {str(e)}")
        raise BusinessException(
            ErrorCode.INTERNAL_ERROR,
            message=f"Network request failed: {str(e)}",
        ) from e
