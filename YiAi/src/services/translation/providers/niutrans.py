"""Niutrans translation provider."""

import json
import logging

from services.translation.providers.base import BaseTranslateProvider
from shared.runtime import get_shared_client

logger = logging.getLogger(__name__)


class NiutransProvider(BaseTranslateProvider):
    name = "niutrans"
    label = "Niutrans Translate"

    async def _translate(self, text: str, from_lang: str, to_lang: str, **config) -> str:
        api_key = config.get("api_key", "")
        if not api_key:
            raise ValueError("Niutrans requires api_key")

        body = {
            "from": from_lang,
            "to": to_lang,
            "apikey": api_key,
            "src_text": text,
        }

        client = get_shared_client()
        resp = await client.post(
            "https://api.niutrans.com/NiuTransServer/translation",
            json=body,
            timeout=30.0,
        )
        resp.raise_for_status()
        data = resp.json()
        target = data.get("tgt_text", "")
        if target:
            return target.strip()
        raise RuntimeError(f"Niutrans API error: {json.dumps(data, ensure_ascii=False)[:200]}")
