"""Baidu OCR recognition provider."""

import json
import logging

from services.translation.providers.base import BaseRecognizeProvider
from shared.runtime import get_shared_client

logger = logging.getLogger(__name__)


class BaiduOCRProvider(BaseRecognizeProvider):
    name = "baidu_ocr"
    label = "Baidu OCR"

    async def _recognize(self, image_base64: str, language: str, **config) -> str:
        client_id = config.get("client_id", "")
        client_secret = config.get("client_secret", "")
        if not client_id or not client_secret:
            raise ValueError("Baidu OCR requires client_id and client_secret")

        client = get_shared_client()
        token_resp = await client.post(
            "https://aip.baidubce.com/oauth/2.0/token",
            params={"grant_type": "client_credentials", "client_id": client_id, "client_secret": client_secret},
            headers={"Content-Type": "application/json", "Accept": "application/json"},
            timeout=30.0,
        )
        token_resp.raise_for_status()
        token_data = token_resp.json()
        access_token = token_data.get("access_token")
        if not access_token:
            raise RuntimeError("Failed to get Baidu access token")

        resp = await client.post(
            "https://aip.baidubce.com/rest/2.0/ocr/v1/general_basic",
            params={"access_token": access_token},
            data={"language_type": language, "detect_direction": "false", "image": image_base64},
            headers={"Content-Type": "application/x-www-form-urlencoded"},
            timeout=30.0,
        )
        resp.raise_for_status()
        data = resp.json()
        words_result = data.get("words_result", [])
        if words_result:
            return "\n".join(item.get("words", "") for item in words_result).strip()
        raise RuntimeError(f"Baidu OCR error: {json.dumps(data, ensure_ascii=False)[:200]}")
