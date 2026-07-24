"""企业微信消息服务。

Public surface: ``send_message(webhook_url, content)`` — sends a text
message to a 企业微信 (WeCom) bot via webhook. URL validation, payload
building, aiohttp call, and errcode handling all live in
``domain/wework/client.py``; the route layer only parses the request
and wraps the success response.
"""
from domain.wework.client import send_message

__all__ = ["send_message"]
