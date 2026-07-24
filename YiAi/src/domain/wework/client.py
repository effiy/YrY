"""企业微信机器人 Webhook 客户端。

业务层封装 — 把 URL 验证、企业微信 payload 构建、aiohttp 调用、
errcode 处理、错误转换 全部收口到这里,路由层只负责解析 request
和包装 success 响应。
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
            ErrorCode.INVALID_PARAMS, message="Webhook URL 不能为空"
        )
    if not webhook_url.startswith(_WWORK_HOST_PREFIX):
        raise BusinessException(
            ErrorCode.INVALID_PARAMS, message="无效的企业微信 Webhook URL"
        )
    return webhook_url


def _validate_content(content: str) -> str:
    if not content:
        raise BusinessException(
            ErrorCode.INVALID_PARAMS, message="消息内容不能为空"
        )
    return content


async def send_message(webhook_url: str, content: str) -> dict:
    """发送文本消息到企业微信机器人。

    成功返回 ``{"message": "消息发送成功"}``。
    失败一律抛 ``BusinessException``(INVALID_PARAMS 或 INTERNAL_ERROR)。
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
                    logger.error(f"企业微信 Webhook 请求失败: {error_msg}")
                    raise BusinessException(
                        ErrorCode.INTERNAL_ERROR,
                        message=f"发送失败: {error_msg}",
                    )

                errcode = response_data.get("errcode", 0)
                if errcode != 0:
                    errmsg = response_data.get("errmsg", "未知错误")
                    logger.error(
                        f"企业微信返回错误: errcode={errcode}, errmsg={errmsg}"
                    )
                    raise BusinessException(
                        ErrorCode.INTERNAL_ERROR,
                        message=f"发送失败: {errmsg}",
                    )

                logger.info(f"成功发送消息到企业微信机器人: {webhook_url[:50]}...")
                return {"message": "消息发送成功"}

    except aiohttp.ClientError as e:
        logger.error(f"企业微信 Webhook 请求异常: {str(e)}")
        raise BusinessException(
            ErrorCode.INTERNAL_ERROR,
            message=f"网络请求失败: {str(e)}",
        ) from e
