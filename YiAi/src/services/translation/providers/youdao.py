"""Youdao translation provider."""

import hashlib
import logging
import uuid

from services.translation.providers.base import BaseTranslateProvider
from shared.runtime import get_shared_client

logger = logging.getLogger(__name__)


class YoudaoProvider(BaseTranslateProvider):
    name = "youdao"
    label = "Youdao Translate"

    async def _translate(self, text: str, from_lang: str, to_lang: str, **config) -> str:
        app_id = config.get("app_id", "")
        app_secret = config.get("app_secret", "")
        if not app_id or not app_secret:
            raise ValueError("Youdao translate requires app_id and app_secret")

        salt = str(uuid.uuid4()).replace("-", "")[:10]
        curtime = str(int(__import__("time").time()))
        sign_str = app_id + self._truncate(text) + salt + curtime + app_secret
        sign = hashlib.sha256(sign_str.encode()).hexdigest()

        params = {
            "q": text,
            "from": from_lang,
            "to": to_lang,
            "appKey": app_id,
            "salt": salt,
            "sign": sign,
            "signType": "v3",
            "curtime": curtime,
        }

        client = get_shared_client()
        resp = await client.get("https://openapi.youdao.com/api", params=params, timeout=30.0)
        resp.raise_for_status()
        data = resp.json()
        translation = data.get("translation", [])
        if translation:
            return translation[0].strip()
        error_code = data.get("errorCode", "unknown")
        raise RuntimeError(f"Youdao API error code: {error_code}")

    @staticmethod
    def _truncate(q: str) -> str:
        if not q:
            return ""
        size = len(q)
        return q if size <= 20 else q[:10] + str(size) + q[-10:]
