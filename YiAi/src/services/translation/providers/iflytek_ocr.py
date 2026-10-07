"""Iflytek OCR recognition provider."""

import json
import logging

from services.translation.providers.base import BaseRecognizeProvider
from shared.runtime import get_shared_client

logger = logging.getLogger(__name__)


class IflytekOCRProvider(BaseRecognizeProvider):
    name = "iflytek_ocr"
    label = "Iflytek OCR"

    async def _recognize(self, image_base64: str, language: str, **config) -> str:
        app_id = config.get("app_id", "")
        api_key = config.get("api_key", "")
        api_secret = config.get("api_secret", "")
        if not app_id or not api_key:
            raise ValueError("Iflytek OCR requires app_id and api_key")

        body = {
            "header": {"app_id": app_id},
            "parameter": {
                "ocr": {
                    "language": language,
                    "result": {"encoding": "utf8", "compress": "raw", "format": "json"},
                }
            },
            "payload": {"image": {"encoding": "jpg", "image": image_base64, "status": 3}},
        }

        headers = {"Content-Type": "application/json"}
        if api_secret:
            headers["X-Api-Secret"] = api_secret
        if api_key:
            headers["X-Api-Key"] = api_key

        client = get_shared_client()
        resp = await client.post(
            "https://api.xfyun.cn/v1/service/v1/ocr/general",
            json=body,
            headers=headers,
            timeout=30.0,
        )
        resp.raise_for_status()
        data = resp.json()
        payload_data = data.get("payload", {}).get("result", {})
        if isinstance(payload_data, str):
            payload_data = json.loads(payload_data)
        blocks = payload_data.get("block", [])
        result_text = ""
        for block in blocks:
            for line in block.get("line", []):
                for word in line.get("word", []):
                    result_text += word.get("content", "")
                result_text += "\n"
        return result_text.strip()
