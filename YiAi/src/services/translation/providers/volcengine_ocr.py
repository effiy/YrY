"""Volcengine OCR recognition provider."""

import json
import logging

from services.translation.providers.base import BaseRecognizeProvider
from shared.runtime import get_shared_client

logger = logging.getLogger(__name__)


class VolcengineOCRProvider(BaseRecognizeProvider):
    name = "volcengine_ocr"
    label = "Volcengine OCR"

    async def _recognize(self, image_base64: str, language: str, **config) -> str:
        access_key = config.get("access_key", "")
        secret_key = config.get("secret_key", "")
        if not access_key or not secret_key:
            raise ValueError("Volcengine OCR requires access_key and secret_key")

        body = {"image_base64": image_base64, "language": language}

        headers = {
            "Content-Type": "application/json",
            "X-Access-Key-Id": access_key,
            "X-Secret-Key": secret_key,
        }

        client = get_shared_client()
        resp = await client.post(
            "https://visual.volcengineapi.com/",
            json=body,
            headers=headers,
            timeout=30.0,
        )
        resp.raise_for_status()
        data = resp.json()
        lines = data.get("data", {}).get("line_texts", [])
        if lines:
            return "\n".join(lines).strip()
        raise RuntimeError(f"Volcengine OCR error: {json.dumps(data, ensure_ascii=False)[:200]}")
