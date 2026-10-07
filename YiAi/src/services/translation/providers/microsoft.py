"""Microsoft Bing translation provider."""

import json
import logging

from services.translation.providers.base import BaseTranslateProvider
from shared.runtime import get_shared_client

logger = logging.getLogger(__name__)


class MicrosoftProvider(BaseTranslateProvider):
    name = "bing"
    label = "Microsoft Bing Translate"

    async def _translate(self, text: str, from_lang: str, to_lang: str, **config) -> str:
        api_key = config.get("api_key", "")
        region = config.get("region", "global")

        if not api_key:
            raise ValueError("Bing translate requires api_key")

        url = "https://api.cognitive.microsofttranslator.com/translate"
        params = {"api-version": "3.0", "to": to_lang}
        if from_lang and from_lang != "auto":
            params["from"] = from_lang

        headers = {
            "Ocp-Apim-Subscription-Key": api_key,
            "Ocp-Apim-Subscription-Region": region,
            "Content-Type": "application/json",
        }

        client = get_shared_client()
        resp = await client.post(url, params=params, json=[{"text": text}], headers=headers, timeout=30.0)
        resp.raise_for_status()
        data = resp.json()
        translations = data[0].get("translations", [])
        if translations:
            return translations[0].get("text", "").strip()
        raise RuntimeError(f"Bing API error: {json.dumps(data, ensure_ascii=False)[:200]}")
