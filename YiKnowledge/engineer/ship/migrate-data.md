---
title: Migrate Data Safely
aliases: [migrate-data, data-migration, database-migration, schema-migration]
tags: [engineer, ship, data, migration, database, safety]
category: engineer/ship
created: 2026-08-24
updated: 2026-08-24
source: internal
type: summary
status: stable
lifecycle: active
review_cycle: quarterly
roles: [engineer, srer]
benefit: "Engineers migrate data safely — backwards-compatible, reversible, tested, and monitored"
acceptance_criteria:
  - "4-phase migration: prepare, migrate, verify, cleanup"
  - "covers MongoDB (YiAi) and general patterns"
  - "includes rollback strategies and safety checks"
related:
  - ./README.md
  - ./retry-with-backoff.md
  - ../../srer/release/rollback-drill.md
---

# Migrate Data Safely

> **When to use:** For any schema change, data transformation, or collection restructuring. Data migrations are the highest-risk operations — a mistake can corrupt or lose data.

## Migration Safety Principles

| Principle | Meaning |
|---|---|
| **Backwards-compatible** | Old code can read new data; new code can read old data |
| **Reversible** | Every migration has a tested rollback |
| **Tested on a copy** | Test on production-like data before running on production |
| **Monitored** | Track progress, errors, and performance impact |
| **Incremental** | Small batches; avoid locking the entire collection |

## Phase 1: Prepare

### 1.1 Back up the data

```bash
# MongoDB backup
mongodump --uri="mongodb://localhost:27017/yiai" --out=/backup/$(date +%Y%m%d)

# Verify backup
mongorestore --dry-run --dir=/backup/20260824/yiai
```

### 1.2 Test on a copy

```python
# Restore backup to a test database
# Run migration on test copy
# Verify data integrity before touching production
```

### 1.3 Write the migration script

```python
# YiAi data migration pattern
import asyncio
from data.database import MongoDB

async def migrate_sessions_add_status_field():
    """Add 'status' field to all sessions that don't have one."""
    db = MongoDB.get_db()
    collection = db["sessions"]
    
    # Count documents to migrate
    total = await collection.count_documents({"status": {"$exists": False}})
    print(f"Documents to migrate: {total}")
    
    if total == 0:
        print("Nothing to migrate.")
        return
    
    # Migrate in batches of 100
    batch_size = 100
    migrated = 0
    
    cursor = collection.find({"status": {"$exists": False}}).batch_size(batch_size)
    
    async for doc in cursor:
        await collection.update_one(
            {"_id": doc["_id"]},
            {"$set": {"status": "active" if doc.get("messages") else "empty"}}
        )
        migrated += 1
        if migrated % batch_size == 0:
            print(f"Migrated {migrated}/{total} ({migrated*100//total}%)")
    
    print(f"Migration complete: {migrated} documents updated.")

# Run with: python -m scripts.migrate_sessions
```

## Phase 2: Migrate

### 2.1 During low-traffic window

Schedule migrations during the lowest-traffic period. For YiAi, this is typically weekends or late night.

### 2.2 Monitor in real-time

```python
# Track migration progress
import time

start = time.time()
# ... migration loop ...
elapsed = time.time() - start
print(f"Migration completed in {elapsed:.1f}s ({migrated/elapsed:.1f} 文档/s)")
```

### 2.3 Watch for errors

```python
# Collect and report errors
errors = []
try:
    await collection.update_one(...)
except Exception as e:
    errors.append({"doc_id": doc["_id"], "error": str(e)})

if errors:
    print(f"ERRORS: {len(errors)} documents failed:")
    for err in errors[:10]:  # Show first 10
        print(f"  {err['doc_id']}: {err['error']}")
```

## Phase 3: Verify

### 3.1 Check counts

```python
# Verify migration completeness
total = await collection.count_documents({})
migrated = await collection.count_documents({"status": {"$exists": True}})
unmigrated = total - migrated

assert unmigrated == 0, f"{unmigrated} documents not migrated!"
print(f"All {total} documents migrated successfully.")
```

### 3.2 Spot-check data

```python
# Random sample verification
import random

sample = await collection.aggregate([
    {"$match": {"status": {"$exists": True}}},
    {"$sample": {"size": 10}}
]).to_list(10)

for doc in sample:
    assert "status" in doc
    assert doc["status"] in ("active", "empty", "archived")
    print(f"  ✓ {doc.get('key', doc['_id'])}: status={doc['status']}")
```

## Phase 4: Cleanup

### 4.1 Remove old fields (after verification period)

Wait at least 1 week after migration before removing old fields. This gives time to catch issues.

```python
# After 1 week of stable operation
await collection.update_many(
    {"old_field": {"$exists": True}},
    {"$unset": {"old_field": ""}}
)
```

### 4.2 Document the migration

Add a record to the migration log:

```markdown
| Date | Migration | Collection | Documents | Duration | Rollback? |
|---|---|---|---|---|---|
| 2026-08-24 | Add status field to sessions | sessions | 1,234 | 45s | No |
```

## Rollback Strategy

### Before migration

```python
# Save the state before migration
backup = await collection.find({"status": {"$exists": False}}).to_list(None)
# If migration fails, restore from backup
```

### During migration

If errors exceed threshold (e.g., > 1% failure rate), stop and rollback:

```python
if len(errors) / total > 0.01:
    print(f"ERROR: {len(errors)/total*100:.1f}% failure rate. Rolling back.")
    # Restore from backup
    return
```

## MongoDB-Specific Considerations

| Consideration | Recommendation |
|---|---|
| Large collections (> 100K docs) | Use batch processing (100-500 docs per batch) |
| Indexed fields | Create indexes before migration, not during |
| Write concern | Use `w: "majority"` for production migrations |
| Read concern | Use `readConcern: "majority"` to avoid stale reads |
| Oplog pressure | Monitor oplog window during migration |

## Anti-patterns

| Anti-pattern | Why it fails | Fix |
|---|---|---|
| Migration without backup | Data loss is irreversible | Always back up before migration |
| One-shot migration on 1M+ documents | Locks the collection; blocks writes | Batch process in 100-500 document chunks |
| No verification step | Migration "succeeds" but data is wrong | Verify counts, spot-check samples, check invariants |
| Cleaning up old fields immediately | Can't rollback if issue discovered later | Wait 1 week before removing old fields |