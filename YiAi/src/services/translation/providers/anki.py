"""Anki collection provider — exports words to Anki via AnkiConnect."""

import logging

from services.translation.providers.base import BaseCollectionProvider
from shared.runtime import get_shared_client

logger = logging.getLogger(__name__)


class AnkiProvider(BaseCollectionProvider):
    name = "anki"
    label = "Anki"

    async def _collect(self, source: str, target: str, **config) -> None:
        port = config.get("port", 8765)
        base_url = f"http://127.0.0.1:{port}"

        client = get_shared_client()

        async def anki_connect(action: str, params: dict | None = None):
            body = {"action": action, "version": 6, "params": params or {}}
            resp = await client.post(base_url, json=body, timeout=10.0)
            resp.raise_for_status()
            data = resp.json()
            if data.get("error"):
                raise RuntimeError(f"AnkiConnect error: {data['error']}")
            return data.get("result")

        await anki_connect("createDeck", {"deck": "Pot"})
        await anki_connect("createModel", {
            "modelName": "Pot Card",
            "inOrderFields": ["Front", "Back"],
            "isCloze": False,
            "cardTemplates": [{
                "Name": "Pot Card",
                "Front": "{{Front}}",
                "Back": "{{FrontSide}}<hr id=answer>{{Back}}",
            }],
        })
        await anki_connect("addNote", {
            "note": {
                "deckName": "Pot",
                "modelName": "Pot Card",
                "fields": {"Front": source, "Back": target},
            },
        })
