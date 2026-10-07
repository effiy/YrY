"""DeepL translation provider. Supports free/api/deeplx modes."""

import json
import logging
import random
import time

from services.translation.providers.base import BaseTranslateProvider
from shared.runtime import get_shared_client

logger = logging.getLogger(__name__)


class DeepLProvider(BaseTranslateProvider):
    name = "deepl"
    label = "DeepL Translate"

    async def _translate(self, text: str, from_lang: str, to_lang: str, **config) -> str:
        service_type = config.get("type", "free")
        if service_type == "api":
            return await self._translate_by_key(text, from_lang, to_lang, config.get("auth_key", ""))
        elif service_type == "deeplx":
            return await self._translate_by_deeplx(text, from_lang, to_lang, config.get("custom_url", ""))
        return await self._translate_by_free(text, from_lang, to_lang)

    async def _translate_by_key(self, text: str, from_lang: str, to_lang: str, auth_key: str) -> str:
        headers = {"Content-Type": "application/json", "Authorization": f"DeepL-Auth-Key {auth_key}"}
        body = {"text": [text], "target_lang": to_lang}
        if from_lang != "auto":
            body["source_lang"] = from_lang

        if auth_key.endswith(":fx"):
            url = "https://api-free.deepl.com/v2/translate"
        elif auth_key.endswith(":dp"):
            url = "https://api.deepl-pro.com/v2/translate"
        else:
            url = "https://api.deepl.com/v2/translate"

        client = get_shared_client()
        resp = await client.post(url, json=body, headers=headers, timeout=30.0)
        resp.raise_for_status()
        data = resp.json()
        translations = data.get("translations", [])
        if translations:
            return translations[0].get("text", "").strip()
        raise RuntimeError(f"DeepL API error: {json.dumps(data, ensure_ascii=False)[:200]}")

    async def _translate_by_deeplx(self, text: str, from_lang: str, to_lang: str, custom_url: str) -> str:
        client = get_shared_client()
        resp = await client.post(
            custom_url,
            json={"source_lang": from_lang, "target_lang": to_lang, "text": text},
            timeout=30.0,
        )
        resp.raise_for_status()
        data = resp.json()
        return data.get("data", "")

    async def _translate_by_free(self, text: str, from_lang: str, to_lang: str) -> str:
        url = "https://www2.deepl.com/jsonrpc"
        rand = random.randint(100000, 999999) * 1000
        i_count = text.count("i") + 1

        body = {
            "jsonrpc": "2.0",
            "method": "LMT_handle_texts",
            "params": {
                "splitting": "newlines",
                "lang": {
                    "source_lang_user_selected": from_lang[:2] if from_lang != "auto" else "auto",
                    "target_lang": to_lang[:2],
                },
                "texts": [{"text": text, "requestAlternatives": 3}],
                "timestamp": self._get_timestamp(i_count),
            },
            "id": rand,
        }

        body_str = json.dumps(body, ensure_ascii=False)
        if (rand + 5) % 29 == 0 or (rand + 3) % 13 == 0:
            body_str = body_str.replace('"method":"', '"method" : "')
        else:
            body_str = body_str.replace('"method":"', '"method": "')

        client = get_shared_client()
        resp = await client.post(url, content=body_str, headers={"Content-Type": "application/json"}, timeout=30.0)
        resp.raise_for_status()
        data = resp.json()
        texts = data.get("result", {}).get("texts", [])
        if texts:
            return texts[0].get("text", "").strip()
        raise RuntimeError(f"DeepL free error: {json.dumps(data, ensure_ascii=False)[:200]}")

    @staticmethod
    def _get_timestamp(i_count: int) -> int:
        ts = int(time.time() * 1000)
        if i_count != 0:
            i_count += 1
            return ts - (ts % i_count) + i_count
        return ts
