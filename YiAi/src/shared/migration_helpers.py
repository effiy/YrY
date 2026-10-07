"""Zero-downtime migration helpers for MongoDB."""

import asyncio
import logging

from motor.motor_asyncio import AsyncIOMotorDatabase

logger = logging.getLogger(__name__)


async def batch_update(
    db: AsyncIOMotorDatabase,
    collection: str,
    query: dict,
    update: dict,
    batch_size: int = 100,
    sleep_between: float = 0.1,
):
    """Batch-update documents to avoid locking the collection."""
    total = await db[collection].count_documents(query)
    processed = 0
    while processed < total:
        batch = (
            await db[collection].find(query).limit(batch_size).to_list(length=batch_size)
        )
        if not batch:
            break
        for doc in batch:
            await db[collection].update_one({"_id": doc["_id"]}, update)
            processed += 1
        pct = processed / total * 100 if total else 100
        logger.info("  [batch_update] %s: %s/%s (%.1f%%)", collection, processed, total, pct)
        await asyncio.sleep(sleep_between)


async def add_field_with_default(
    db: AsyncIOMotorDatabase,
    collection: str,
    field: str,
    default_value,
    index: bool = False,
):
    """Add a field with default value to all documents missing it."""
    result = await db[collection].update_many(
        {field: {"$exists": False}}, {"$set": {field: default_value}}
    )
    logger.info("  [add_field] %s.%s: updated %s docs", collection, field, result.modified_count)
    if index:
        await db[collection].create_index(field, background=True)
        logger.info("  [add_field] Created index: %s.%s", collection, field)


async def remove_field(db: AsyncIOMotorDatabase, collection: str, field: str):
    result = await db[collection].update_many(
        {field: {"$exists": True}}, {"$unset": {field: ""}}
    )
    logger.info("  [remove_field] %s.%s: updated %s docs", collection, field, result.modified_count)


async def rename_field(
    db: AsyncIOMotorDatabase, collection: str, old_field: str, new_field: str
):
    result = await db[collection].update_many(
        {old_field: {"$exists": True}}, {"$rename": {old_field: new_field}}
    )
    logger.info(
        "  [rename_field] %s: %s -> %s: updated %s docs", collection, old_field, new_field, result.modified_count
    )


async def ensure_index(
    db: AsyncIOMotorDatabase,
    collection: str,
    keys: list[tuple[str, int]],
    unique: bool = False,
    name: str = None,
):
    existing = await db[collection].index_information()
    index_name = name or "_".join(f"{k}_{d}" for k, d in keys)
    if index_name in existing:
        logger.info("  [ensure_index] %s.%s: already exists, skip", collection, index_name)
        return
    spec = [(k, d) for k, d in keys]
    await db[collection].create_index(spec, unique=unique, name=name, background=True)
    logger.info("  [ensure_index] %s.%s: created", collection, index_name)


async def drop_index(db: AsyncIOMotorDatabase, collection: str, index_name: str):
    existing = await db[collection].index_information()
    if index_name not in existing:
        logger.info("  [drop_index] %s.%s: not found, skip", collection, index_name)
        return
    await db[collection].drop_index(index_name)
    logger.info("  [drop_index] %s.%s: dropped", collection, index_name)
