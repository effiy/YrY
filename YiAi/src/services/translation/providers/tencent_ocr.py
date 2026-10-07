"""Tencent Cloud OCR recognition provider."""

import hashlib
import hmac
import json
import logging
import time

from services.translation.providers.base import BaseRecognizeProvider
from shared.runtime import get_shared_client

logger = logging.getLogger(__name__)


class TencentOCRProvider(BaseRecognizeProvider):
    name = "tencent_ocr"
    label = "Tencent OCR"

    async def _recognize(self, image_base64: str, language: str, **config) -> str:
        secret_id = config.get("secret_id", "")
        secret_key = config.get("secret_key", "")
        if not secret_id or not secret_key:
            raise ValueError("Tencent OCR requires secret_id and secret_key")

        endpoint = "ocr.tencentcloudapi.com"
        service = "ocr"
        timestamp = int(time.time())
        date = time.strftime("%Y-%m-%d", time.gmtime(timestamp))

        payload = json.dumps({"ImageBase64": image_base64, "LanguageType": language})
        canonical_headers = f"content-type:application/json\nhost:{endpoint}\n"
        signed_headers = "content-type;host"
        hashed_payload = hashlib.sha256(payload.encode()).hexdigest()

        canonical_request = "\n".join(["POST", "/", "", canonical_headers, signed_headers, hashed_payload])
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
            "X-TC-Action": "GeneralBasicOCR",
            "X-TC-Timestamp": str(timestamp),
            "X-TC-Version": "2018-11-19",
            "X-TC-Region": "ap-beijing",
        }

        client = get_shared_client()
        resp = await client.post(f"https://{endpoint}", content=payload, headers=headers, timeout=30.0)
        resp.raise_for_status()
        data = resp.json()
        response = data.get("Response", {})
        detections = response.get("TextDetections", [])
        if detections:
            return "\n".join(d.get("DetectedText", "") for d in detections).strip()
        error = response.get("Error", {})
        raise RuntimeError(f"Tencent OCR error: {error.get('Message', json.dumps(data, ensure_ascii=False)[:200])}")
