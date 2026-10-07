"""Volcengine (ByteDance) translation provider."""

import json
import logging

from services.translation.providers.base import BaseTranslateProvider
from shared.runtime import get_shared_client

logger = logging.getLogger(__name__)


class VolcengineProvider(BaseTranslateProvider):
    name = "volcengine"
    label = "Volcengine Translate"

    async def _translate(self, text: str, from_lang: str, to_lang: str, **config) -> str:
        access_key = config.get("access_key", "")
        secret_key = config.get("secret_key", "")
        if not access_key or not secret_key:
            raise ValueError("Volcengine translate requires access_key and secret_key")

        body = {
            "SourceLanguage": from_lang,
            "TargetLanguage": to_lang,
            "TextList": [text],
        }

        headers = {
            "Content-Type": "application/json",
            "X-Access-Key-Id": access_key,
            "X-Secret-Key": secret_key,
        }

        client = get_shared_client()
        resp = await client.post(
            "https://translate.volcengineapi.com/",
            json=body,
            headers=headers,
            timeout=30.0,
        )
        resp.raise_for_status()
        data = resp.json()
        translation_list = data.get("TranslationList", [])
        if translation_list:
            return translation_list[0].get("Translation", "").strip()
        raise RuntimeError(f"Volcengine API error: {json.dumps(data, ensure_ascii=False)[:200]}")
