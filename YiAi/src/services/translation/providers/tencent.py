"""Tencent Cloud TMT translation provider (TC3-HMAC-SHA256 signing)."""

import hashlib
import hmac
import json
import logging
import time

from services.translation.providers.base import BaseTranslateProvider
from shared.runtime import get_shared_client

logger = logging.getLogger(__name__)


class TencentProvider(BaseTranslateProvider):
    name = "tencent"
    label = "Tencent TMT"

    async def _translate(self, text: str, from_lang: str, to_lang: str, **config) -> str:
        secret_id = config.get("secret_id", "")
        secret_key = config.get("secret_key", "")
        if not secret_id or not secret_key:
            raise ValueError("Tencent translate requires secret_id and secret_key")

        endpoint = "tmt.tencentcloudapi.com"
        service = "tmt"
        timestamp = int(time.time())
        date = time.strftime("%Y-%m-%d", time.gmtime(timestamp))

        payload = json.dumps({"SourceText": text, "Source": from_lang, "Target": to_lang, "ProjectId": 0})
        canonical_headers = f"content-type:application/json\nhost:{endpoint}\n"
        signed_headers = "content-type;host"
        hashed_payload = hashlib.sha256(payload.encode()).hexdigest()

        canonical_request = "\n".join([
            "POST", "/", "", canonical_headers, signed_headers, hashed_payload,
        ])
        hashed_canonical = hashlib.sha256(canonical_request.encode()).hexdigest()

        algorithm = "TC3-HMAC-SHA256"
        credential_scope = f"{date}/{service}/tc3_request"
        string_to_sign = f"{algorithm}\n{timestamp}\n{credential_scope}\n{hashed_canonical}"

        def _sign(key, msg):
            return hmac.new(key, msg.encode(), hashlib.sha256).digest()

        k_date = _sign(f"TC3{secret_key}".encode(), date)
        k_service = _sign(k_date, service)
        k_signing = _sign(k_service, "tc3_request")
        signature = hmac.new(k_signing, string_to_sign.encode(), hashlib.sha256).hexdigest()

        authorization = (
            f"{algorithm} Credential={secret_id}/{credential_scope}, "
            f"SignedHeaders={signed_headers}, Signature={signature}"
        )

        headers = {
            "Authorization": authorization,
            "Content-Type": "application/json",
            "Host": endpoint,
            "X-TC-Action": "TextTranslate",
            "X-TC-Timestamp": str(timestamp),
            "X-TC-Version": "2018-03-21",
            "X-TC-Region": "ap-beijing",
        }

        client = get_shared_client()
        resp = await client.post(f"https://{endpoint}", content=payload, headers=headers, timeout=30.0)
        resp.raise_for_status()
        data = resp.json()
        response = data.get("Response", {})
        target = response.get("TargetText", "")
        if target:
            return target.strip()
        error = response.get("Error", {})
        raise RuntimeError(f"Tencent API error: {error.get('Message', json.dumps(data, ensure_ascii=False)[:200])}")
