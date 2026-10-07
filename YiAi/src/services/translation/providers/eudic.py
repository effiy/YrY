"""Eudic collection provider — exports words to Eudic dictionary."""

import logging

from services.translation.providers.base import BaseCollectionProvider
from shared.runtime import get_shared_client

logger = logging.getLogger(__name__)


class EudicProvider(BaseCollectionProvider):
    name = "eudic"
    label = "Eudic Dictionary"

    async def _collect(self, source: str, target: str, **config) -> None:
        token = config.get("token", "")
        if not token:
            raise ValueError("Eudic collection requires token")

        body = {
            "word": source,
            "translation": target,
            "token": token,
        }

        client = get_shared_client()
        resp = await client.post(
            "https://api.eudic.net/v1/word/save",
            json=body,
            headers={"Content-Type": "application/json"},
            timeout=10.0,
        )
        resp.raise_for_status()
        data = resp.json()
        if data.get("code") != 0:
            raise RuntimeError(f"Eudic API error: {data.get('message', 'unknown')}")
