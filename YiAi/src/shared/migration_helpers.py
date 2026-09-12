"""Zero-downtime migration helpers for MongoDB."""

import asyncio

from motor.motor_asyncio import AsyncIOMotorDatabase


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
        print(f"  [batch_update] {collection}: {processed}/{total} ({pct:.1f}%)")
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
    print(f"  [add_field] {collection}.{field}: updated {result.modified_count} docs")
    if index:
        await db[collection].create_index(field, background=True)
        print(f"  [add_field] Created index: {collection}.{field}")


async def remove_field(db: AsyncIOMotorDatabase, collection: str, field: str):
    result = await db[collection].update_many(
        {field: {"$exists": True}}, {"$unset": {field: ""}}
    )
    print(f"  [remove_field] {collection}.{field}: updated {result.modified_count} docs")


async def rename_field(
    db: AsyncIOMotorDatabase, collection: str, old_field: str, new_field: str
):
    result = await db[collection].update_many(
        {old_field: {"$exists": True}}, {"$rename": {old_field: new_field}}
    )
    print(
        f"  [rename_field] {collection}: {old_field} -> {new_field}: updated {result.modified_count} docs"
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
        print(f"  [ensure_index] {collection}.{index_name}: already exists, skip")
        return
    spec = [(k, d) for k, d in keys]
    await db[collection].create_index(spec, unique=unique, name=name, background=True)
    print(f"  [ensure_index] {collection}.{index_name}: created")


async def drop_index(db: AsyncIOMotorDatabase, collection: str, index_name: str):
    existing = await db[collection].index_information()
    if index_name not in existing:
        print(f"  [drop_index] {collection}.{index_name}: not found, skip")
        return
    await db[collection].drop_index(index_name)
    print(f"  [drop_index] {collection}.{index_name}: dropped")