"""Yandex translation provider."""

import json
import logging

from services.translation.providers.base import BaseTranslateProvider
from shared.runtime import get_shared_client

logger = logging.getLogger(__name__)


class YandexProvider(BaseTranslateProvider):
    name = "yandex"
    label = "Yandex Translate"

    async def _translate(self, text: str, from_lang: str, to_lang: str, **config) -> str:
        api_key = config.get("api_key", "")
        if not api_key:
            raise ValueError("Yandex translate requires api_key")

        body = {
            "sourceLanguageCode": from_lang,
            "targetLanguageCode": to_lang,
            "texts": [text],
        }

        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Api-Key {api_key}",
        }

        client = get_shared_client()
        resp = await client.post(
            "https://translate.api.cloud.yandex.net/translate/v2/translate",
            json=body,
            headers=headers,
            timeout=30.0,
        )
        resp.raise_for_status()
        data = resp.json()
        translations = data.get("translations", [])
        if translations:
            return translations[0].get("text", "").strip()
        raise RuntimeError(f"Yandex API error: {json.dumps(data, ensure_ascii=False)[:200]}")
