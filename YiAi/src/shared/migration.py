"""MongoDB Schema migration engine."""

import hashlib
import importlib.util
from datetime import datetime
from pathlib import Path
from typing import Optional

from motor.motor_asyncio import AsyncIOMotorDatabase

from shared.config import settings
from shared.logging import get_logger

logger = get_logger(__name__)


class Migration:
    """A single migration script."""

    def __init__(self, version: int, name: str, file_path: str):
        self.version = version
        self.name = name
        self.file_path = file_path
        self.checksum = self._compute_checksum()

    def _compute_checksum(self) -> str:
        with open(self.file_path, "rb") as f:
            return hashlib.sha256(f.read()).hexdigest()[:16]


class MigrationEngine:
    """Schema migration engine for MongoDB."""

    def __init__(self, db: AsyncIOMotorDatabase):
        self.db = db
        self.migrations_dir = Path(
            getattr(settings, "migrations_dir", "./migrations")
        )

    async def scan_migrations(self) -> list[Migration]:
        """Scan migration scripts sorted by version."""
        migrations = []
        if not self.migrations_dir.exists():
            logger.warning(f"[Migration] Directory not found: {self.migrations_dir}")
            return migrations

        for f in sorted(self.migrations_dir.glob("*.py")):
            try:
                version_str = f.stem.split("_")[0]
                version = int(version_str)
                name = f.stem[len(version_str) + 1:]
                migrations.append(Migration(version, name, str(f)))
            except (ValueError, IndexError):
                logger.warning(f"[Migration] Skipping invalid filename: {f.name}")

        return sorted(migrations, key=lambda m: m.version)

    async def get_executed_versions(self) -> set[int]:
        records = await self.db.migrations.find(
            {"status": "success"}, {"version": 1}
        ).to_list(length=None)
        return {r["version"] for r in records}

    async def get_pending_migrations(self) -> list[Migration]:
        all_migrations = await self.scan_migrations()
        executed = await self.get_executed_versions()
        return [m for m in all_migrations if m.version not in executed]

    async def migrate(self, target_version: Optional[int] = None) -> dict:
        """Execute pending migrations in order."""
        pending = await self.get_pending_migrations()
        if target_version:
            pending = [m for m in pending if m.version <= target_version]

        if not pending:
            return {"status": "noop", "message": "Database is up to date"}

        results = []
        for migration in pending:
            result = await self._execute_migration(migration)
            results.append(result)
            if result["status"] == "failed":
                break

        return {
            "status": (
                "success"
                if all(r["status"] == "success" for r in results)
                else "partial"
            ),
            "executed": len(results),
            "results": results,
        }

    async def rollback(self, target_version: int) -> dict:
        """Rollback migrations above target_version."""
        executed = await self.get_executed_versions()
        all_migrations = await self.scan_migrations()
        to_rollback = [
            m
            for m in all_migrations
            if m.version in executed and m.version > target_version
        ]
        to_rollback.sort(key=lambda m: m.version, reverse=True)

        if not to_rollback:
            return {"status": "noop", "message": "Nothing to rollback"}

        results = []
        for migration in to_rollback:
            result = await self._rollback_migration(migration)
            results.append(result)
            if result["status"] == "failed":
                break

        return {
            "status": (
                "success"
                if all(r["status"] == "success" for r in results)
                else "partial"
            ),
            "rolled_back": len(results),
            "results": results,
        }

    async def _execute_migration(self, migration: Migration) -> dict:
        logger.info(f"[Migration] Executing: {migration.version:03d}_{migration.name}")
        try:
            module = self._load_module(migration)
            if not hasattr(module, "upgrade"):
                raise ValueError(f"Missing upgrade() in {migration.name}")
            await module.upgrade(self.db)
            await self.db.migrations.insert_one({
                "version": migration.version,
                "name": migration.name,
                "status": "success",
                "checksum": migration.checksum,
                "executed_at": datetime.now(),
            })
            logger.info(f"[Migration] Success: {migration.version:03d}_{migration.name}")
            return {
                "version": migration.version,
                "name": migration.name,
                "status": "success",
            }
        except Exception as e:
            logger.error(
                f"[Migration] Failed: {migration.version:03d}_{migration.name}: {e}"
            )
            await self.db.migrations.insert_one({
                "version": migration.version,
                "name": migration.name,
                "status": "failed",
                "error": str(e),
                "checksum": migration.checksum,
                "executed_at": datetime.now(),
            })
            return {
                "version": migration.version,
                "name": migration.name,
                "status": "failed",
                "error": str(e),
            }

    async def _rollback_migration(self, migration: Migration) -> dict:
        logger.info(f"[Migration] Rolling back: {migration.version:03d}_{migration.name}")
        try:
            module = self._load_module(migration)
            if not hasattr(module, "downgrade"):
                raise ValueError(f"Missing downgrade() in {migration.name}")
            await module.downgrade(self.db)
            await self.db.migrations.delete_one({"version": migration.version})
            logger.info(f"[Migration] Rollback ok: {migration.version:03d}_{migration.name}")
            return {
                "version": migration.version,
                "name": migration.name,
                "status": "success",
            }
        except Exception as e:
            logger.error(
                f"[Migration] Rollback failed: {migration.version:03d}_{migration.name}: {e}"
            )
            return {
                "version": migration.version,
                "name": migration.name,
                "status": "failed",
                "error": str(e),
            }

    async def status(self) -> dict:
        all_migrations = await self.scan_migrations()
        executed = await self.get_executed_versions()
        migrations_status = [
            {
                "version": m.version,
                "name": m.name,
                "executed": m.version in executed,
                "checksum": m.checksum,
            }
            for m in all_migrations
        ]
        return {
            "total": len(all_migrations),
            "executed": len(executed),
            "pending": len(all_migrations) - len(executed),
            "migrations": migrations_status,
        }

    def _load_module(self, migration: Migration):
        spec = importlib.util.spec_from_file_location(
            f"migration_{migration.version:03d}_{migration.checksum}",
            migration.file_path,
        )
        module = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(module)
        return module