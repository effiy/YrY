"""Caiyun (LingoCloud) translation provider."""

import json
import logging

from services.translation.providers.base import BaseTranslateProvider
from shared.runtime import get_shared_client

logger = logging.getLogger(__name__)


class CaiyunProvider(BaseTranslateProvider):
    name = "caiyun"
    label = "Caiyun Translate"

    async def _translate(self, text: str, from_lang: str, to_lang: str, **config) -> str:
        token = config.get("token", "")
        if not token:
            raise ValueError("Caiyun translate requires token")

        body = {
            "source": [text],
            "trans_type": f"{from_lang}2{to_lang}",
            "request_id": "demo",
            "detect": True,
        }

        headers = {
            "Content-Type": "application/json",
            "X-Authorization": f"token {token}",
        }

        client = get_shared_client()
        resp = await client.post("https://api.interpreter.caiyunai.com/v1/translator", json=body, headers=headers, timeout=30.0)
        resp.raise_for_status()
        data = resp.json()
        target = data.get("target", [])
        if target:
            return target[0].strip()
        raise RuntimeError(f"Caiyun API error: {json.dumps(data, ensure_ascii=False)[:200]}")
