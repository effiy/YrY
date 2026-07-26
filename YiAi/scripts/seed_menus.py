"""Seed the MongoDB ``menus`` collection from bundled JSON data.

Usage:
    python scripts/seed_menus.py
"""

import asyncio
import json
import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "src"))

from data.database import db

SEED_FILE = os.path.join(os.path.dirname(__file__), "..", "src", "data", "seeds", "menus.json")


async def seed_menus():
    """Read menus.json and upsert into MongoDB ``menus`` collection."""
    with open(SEED_FILE, "r", encoding="utf-8") as f:
        docs = json.load(f)

    print(f"Seeding {len(docs)} menu items from {SEED_FILE}")
    await db.initialize()
    collection = db.db["menus"]

    count = 0
    for doc in docs:
        result = await collection.replace_one(
            {"path": doc["path"]},
            doc,
            upsert=True,
        )
        action = "Inserted" if result.upserted_id else "Updated"
        print(f"  {action}: {doc['path']}")
        count += 1

    print(f"Done — {count} menu items upserted.")


def main():
    asyncio.run(seed_menus())


if __name__ == "__main__":
    main()
