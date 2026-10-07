"""Alibaba Cloud translation provider."""

import json
import logging

from services.translation.providers.base import BaseTranslateProvider
from shared.runtime import get_shared_client

logger = logging.getLogger(__name__)


class AlibabaProvider(BaseTranslateProvider):
    name = "alibaba"
    label = "Alibaba Translate"

    async def _translate(self, text: str, from_lang: str, to_lang: str, **config) -> str:
        access_key = config.get("access_key", "")
        access_secret = config.get("access_secret", "")
        # Alibaba MT uses a specific API endpoint pattern
        # This is a simplified implementation; full Alibaba Cloud API requires
        # complex signature generation via aliyunsdkcore

        body = {
            "SourceLanguage": from_lang,
            "TargetLanguage": to_lang,
            "SourceText": text,
            "FormatType": "text",
        }

        headers = {"Content-Type": "application/json"}
        if access_key and access_secret:
            headers["X-Access-Key-Id"] = access_key
            headers["X-Access-Key-Secret"] = access_secret

        client = get_shared_client()
        resp = await client.post(
            "https://mt.aliyuncs.com/api/translate/web/general",
            json=body,
            headers=headers,
            timeout=30.0,
        )
        resp.raise_for_status()
        data = resp.json()
        target = data.get("Data", {}).get("Translated", "") or data.get("TranslatedText", "")
        if target:
            return target.strip()
        raise RuntimeError(f"Alibaba API error: {json.dumps(data, ensure_ascii=False)[:200]}")
