"""Google Translate provider."""

import logging

from services.translation.providers.base import BaseTranslateProvider
from shared.runtime import get_shared_client

logger = logging.getLogger(__name__)


class GoogleProvider(BaseTranslateProvider):
    name = "google"
    label = "Google Translate"

    async def _translate(self, text: str, from_lang: str, to_lang: str, **config) -> str:
        custom_url = config.get("custom_url", "https://translate.google.com")
        if not custom_url.startswith("http"):
            custom_url = f"https://{custom_url}"

        params = [
            ("client", "gtx"),
            ("sl", from_lang),
            ("tl", to_lang),
            ("hl", to_lang),
            ("ie", "UTF-8"),
            ("oe", "UTF-8"),
            ("otf", "1"),
            ("ssel", "0"),
            ("tsel", "0"),
            ("kc", "7"),
            ("dt", "at"),
            ("dt", "bd"),
            ("dt", "ex"),
            ("dt", "ld"),
            ("dt", "md"),
            ("dt", "qca"),
            ("dt", "rw"),
            ("dt", "rm"),
            ("dt", "ss"),
            ("dt", "t"),
            ("q", text),
        ]

        client = get_shared_client()
        resp = await client.get(
            f"{custom_url}/translate_a/single",
            params=params,
            headers={"content-type": "application/json"},
            timeout=30.0,
        )
        resp.raise_for_status()
        result = resp.json()

        if result[1]:
            return self._format_dict(result)
        target = "".join(r[0] for r in result[0] if r[0])
        return target.strip()

    def _format_dict(self, result: list) -> dict:
        """Format dictionary-style result from Google."""
        target = {"pronunciations": [], "explanations": [], "associations": [], "sentence": []}
        if len(result) > 0 and len(result[0]) > 1 and result[0][1] and len(result[0][1]) > 3:
            target["pronunciations"].append({"symbol": result[0][1][3], "voice": ""})
        for item in result[1]:
            target["explanations"].append({
                "trait": item[0],
                "explains": [x[0] for x in item[2]],
            })
        if len(result) > 13 and result[13]:
            for item in result[13][0]:
                target["sentence"].append({"source": item[0]})
        return target
