"""Image fetching and resolution helpers for multimodal chat."""

import asyncio
import base64
import binascii
import logging
from typing import Any

import aiohttp

logger = logging.getLogger(__name__)

_IMAGE_FETCH_CHUNK = 256 * 1024
_IMAGE_FETCH_MAX_BYTES = 10 * 1024 * 1024
_IMAGE_FETCH_SEMAPHORE = 4


def _extract_user_only_text(user_content: str) -> str:
    text = (user_content or "").strip()
    if not text:
        return ""
    if "## Current Message" in text:
        after = text.split("## Current Message", 1)[1].strip()
        if after.startswith("#"):
            after = after.lstrip("#").strip()
        if after.startswith("Current Message"):
            after = after[len("Current Message"):].strip()
        return after
    return text


def _is_http_url(v: str) -> bool:
    s = (v or "").strip().lower()
    return s.startswith("http://") or s.startswith("https://")


async def _fetch_image_bytes(url: str, *, timeout_seconds: float = 15.0, max_bytes: int = _IMAGE_FETCH_MAX_BYTES) -> bytes | None:
    u = (url or "").strip()
    if not u:
        return None
    timeout = aiohttp.ClientTimeout(total=timeout_seconds)
    async with aiohttp.ClientSession(timeout=timeout) as session, session.get(u) as resp:
        if resp.status < 200 or resp.status >= 300:
            return None
        ct = (resp.headers.get("Content-Type") or "").lower()
        if ct and not ct.startswith("image/"):
            return None
        buf = bytearray()
        async for chunk in resp.content.iter_chunked(_IMAGE_FETCH_CHUNK):
            if not chunk:
                continue
            buf.extend(chunk)
            if len(buf) > max_bytes:
                return None
        return bytes(buf)


async def _resolve_images(images: Any) -> list[bytes]:
    if not isinstance(images, list):
        return []
    out: list[bytes] = []
    http_urls: list[str] = []
    for item in images:
        raw = (item or "").strip() if isinstance(item, str) else ""
        if not raw:
            continue
        if _is_http_url(raw):
            http_urls.append(raw)
            continue
        if raw.startswith("data:"):
            comma = raw.find(",")
            if comma >= 0:
                raw = raw[comma + 1:].strip()
        try:
            out.append(base64.b64decode(raw, validate=True))
        except (binascii.Error, ValueError):
            logger.debug("Failed to decode base64 image data, skipping", exc_info=True)
            continue

    if http_urls:
        sem = asyncio.Semaphore(_IMAGE_FETCH_SEMAPHORE)
        async def _task(u: str) -> bytes | None:
            async with sem:
                try:
                    return await _fetch_image_bytes(u)
                except (aiohttp.ClientError, asyncio.TimeoutError):
                    return None
        fetched = await asyncio.gather(*[_task(u) for u in http_urls], return_exceptions=True)
        out.extend([b for b in fetched if isinstance(b, bytes | bytearray) and b])
    return out
