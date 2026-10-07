"""Baidu translation provider."""

import hashlib
import json
import logging
import uuid

from services.translation.providers.base import BaseTranslateProvider
from shared.runtime import get_shared_client

logger = logging.getLogger(__name__)


class BaiduProvider(BaseTranslateProvider):
    name = "baidu"
    label = "Baidu Translate"

    async def _translate(self, text: str, from_lang: str, to_lang: str, **config) -> str:
        appid = config.get("appid", "")
        secret = config.get("secret", "")
        if not appid or not secret:
            raise ValueError("Baidu translate requires appid and secret")

        salt = str(uuid.uuid4()).replace("-", "")[:10]
        sign_str = appid + text + salt + secret
        sign = hashlib.md5(sign_str.encode()).hexdigest()

        params = {
            "q": text,
            "from": from_lang,
            "to": to_lang,
            "appid": appid,
            "salt": salt,
            "sign": sign,
        }

        client = get_shared_client()
        resp = await client.get(
            "https://fanyi-api.baidu.com/api/trans/vip/translate",
            params=params,
            timeout=30.0,
        )
        resp.raise_for_status()
        data = resp.json()

        trans_result = data.get("trans_result", [])
        if trans_result:
            target = "\n".join(item.get("dst", "") for item in trans_result)
            return target.strip()
        raise RuntimeError(f"Baidu API error: {json.dumps(data, ensure_ascii=False)[:200]}")
