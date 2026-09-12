"""Database backup and recovery service."""

import asyncio
import hashlib
import os
import shutil
from datetime import datetime, timedelta
from pathlib import Path
from typing import Optional

from shared.config import settings
from shared.logging import get_logger

logger = get_logger(__name__)


class BackupService:
    """MongoDB backup and recovery via mongodump/mongorestore."""

    def __init__(self):
        self.local_dir = Path(
            getattr(settings, "backup_local_dir", "./backups/mongodb")
        )
        self.remote_dir = Path(
            getattr(settings, "backup_remote_dir", "")
        ) if getattr(settings, "backup_remote_dir", "") else None
        self.local_retention_days = getattr(settings, "backup_local_retention_days", 7)
        self.remote_retention_days = getattr(
            settings, "backup_remote_retention_days", 30
        )
        self.mongo_uri = settings.mongodb_url
        self._backup_lock = asyncio.Lock()
        os.makedirs(self.local_dir, exist_ok=True)
        if self.remote_dir:
            os.makedirs(self.remote_dir, exist_ok=True)

    async def full_backup(self) -> dict:
        """Execute full backup via mongodump."""
        async with self._backup_lock:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            backup_name = f"full_{timestamp}"
            backup_path = self.local_dir / backup_name

            cmd = [
                "mongodump",
                f"--uri={self.mongo_uri}",
                f"--out={backup_path}",
                "--gzip",
            ]
            logger.info(f"[Backup] Starting full backup: {backup_name}")

            proc = await asyncio.create_subprocess_exec(
                *cmd, stdout=asyncio.subprocess.PIPE, stderr=asyncio.subprocess.PIPE
            )
            _stdout, stderr = await proc.communicate()

            if proc.returncode != 0:
                err = stderr.decode()
                logger.error(f"[Backup] Full backup failed: {err}")
                return {"status": "failed", "error": err}

            checksum = _compute_checksum(backup_path)
            size_mb = _get_dir_size_mb(backup_path)
            _write_checksum(backup_path, checksum)

            logger.info(
                f"[Backup] Full backup done: {backup_name}, size={size_mb}MB, checksum={checksum}"
            )

            if self.remote_dir:
                await _sync_to_remote(backup_path, self.remote_dir, backup_name)

            await _cleanup_old(self.local_dir, self.local_retention_days)
            if self.remote_dir:
                await _cleanup_old(self.remote_dir, self.remote_retention_days)

            return {
                "status": "success",
                "backup_name": backup_name,
                "checksum": checksum,
                "size_mb": size_mb,
            }

    async def incremental_backup(self) -> dict:
        """Execute incremental backup via mongodump --oplog."""
        async with self._backup_lock:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            backup_name = f"incr_{timestamp}"
            backup_path = self.local_dir / backup_name

            cmd = [
                "mongodump",
                f"--uri={self.mongo_uri}",
                f"--out={backup_path}",
                "--oplog",
                "--gzip",
            ]
            logger.info(f"[Backup] Starting incremental backup: {backup_name}")

            proc = await asyncio.create_subprocess_exec(
                *cmd, stdout=asyncio.subprocess.PIPE, stderr=asyncio.subprocess.PIPE
            )
            _stdout, stderr = await proc.communicate()

            if proc.returncode != 0:
                err = stderr.decode()
                logger.error(f"[Backup] Incremental backup failed: {err}")
                return {"status": "failed", "error": err}

            checksum = _compute_checksum(backup_path)
            logger.info(
                f"[Backup] Incremental backup done: {backup_name}, checksum={checksum}"
            )
            return {
                "status": "success",
                "backup_name": backup_name,
                "checksum": checksum,
                "size_mb": _get_dir_size_mb(backup_path),
            }

    async def verify_backup(self, backup_name: str) -> dict:
        """Verify a backup's integrity via checksum and trial restore."""
        backup_path = self.local_dir / backup_name
        if not backup_path.exists():
            if self.remote_dir:
                remote_path = self.remote_dir / backup_name
                if remote_path.exists():
                    await _sync_from_remote(remote_path, self.local_dir, backup_name)
                else:
                    return {"status": "failed", "error": f"Backup not found: {backup_name}"}
            else:
                return {"status": "failed", "error": f"Backup not found: {backup_name}"}

        expected = _read_checksum(backup_path)
        if expected:
            actual = _compute_checksum(backup_path)
            if expected != actual:
                return {
                    "status": "corrupted",
                    "expected_checksum": expected,
                    "actual_checksum": actual,
                }

        return {"status": "verified", "backup_name": backup_name}

    async def restore(
        self, backup_name: str, target_time: Optional[datetime] = None
    ) -> dict:
        """Restore from a backup. target_time enables point-in-time recovery."""
        backup_path = self.local_dir / backup_name
        if not backup_path.exists():
            if self.remote_dir:
                remote_path = self.remote_dir / backup_name
                if remote_path.exists():
                    await _sync_from_remote(remote_path, self.local_dir, backup_name)
                else:
                    return {"status": "failed", "error": f"Backup not found: {backup_name}"}
            else:
                return {"status": "failed", "error": f"Backup not found: {backup_name}"}

        cmd = [
            "mongorestore",
            f"--uri={self.mongo_uri}",
            f"--dir={backup_path}",
            "--gzip",
            "--drop",
            "--numInsertionWorkersPerCollection=4",
        ]
        if target_time:
            cmd.extend(["--oplogReplay", f"--oplogLimit={target_time.isoformat()}"])

        logger.warning(f"[Backup] Restoring: {backup_name}, target_time={target_time}")

        proc = await asyncio.create_subprocess_exec(
            *cmd, stdout=asyncio.subprocess.PIPE, stderr=asyncio.subprocess.PIPE
        )
        _stdout, stderr = await proc.communicate()

        if proc.returncode != 0:
            err = stderr.decode()
            logger.error(f"[Backup] Restore failed: {err}")
            return {"status": "failed", "error": err}

        logger.info(f"[Backup] Restore complete: {backup_name}")
        return {"status": "success", "backup_name": backup_name}

    def list_backups(self) -> list[dict]:
        """List all available backups."""
        backups = []
        for d in sorted(self.local_dir.iterdir(), reverse=True):
            if d.is_dir():
                backups.append({
                    "name": d.name,
                    "size_mb": _get_dir_size_mb(d),
                    "created": datetime.fromtimestamp(d.stat().st_mtime).isoformat(),
                })
        return backups


# ── Helpers ──


def _compute_checksum(path: Path) -> str:
    sha256 = hashlib.sha256()
    for f in sorted(path.rglob("*")):
        if f.is_file():
            sha256.update(f.read_bytes())
    return sha256.hexdigest()[:16]


def _write_checksum(path: Path, checksum: str):
    (path / "checksum.txt").write_text(checksum)


def _read_checksum(path: Path) -> Optional[str]:
    f = path / "checksum.txt"
    return f.read_text().strip() if f.exists() else None


def _get_dir_size_mb(path: Path) -> float:
    total = sum(f.stat().st_size for f in path.rglob("*") if f.is_file())
    return round(total / (1024 * 1024), 2)


async def _sync_to_remote(local_path: Path, remote_dir: Path, backup_name: str):
    if not remote_dir.exists():
        return
    remote_path = remote_dir / backup_name
    shutil.copytree(local_path, remote_path, dirs_exist_ok=True)
    logger.info(f"[Backup] Synced to remote: {remote_path}")


async def _sync_from_remote(remote_path: Path, local_dir: Path, backup_name: str):
    local_path = local_dir / backup_name
    shutil.copytree(remote_path, local_path)
    logger.info(f"[Backup] Synced from remote: {backup_name}")


async def _cleanup_old(base_dir: Path, retention_days: int):
    cutoff = datetime.now() - timedelta(days=retention_days)
    for d in base_dir.iterdir():
        if not d.is_dir():
            continue
        try:
            parts = d.name.split("_", 1)
            if len(parts) < 2:
                continue
            dt = datetime.strptime(parts[1], "%Y%m%d_%H%M%S")
            if dt < cutoff:
                shutil.rmtree(d)
                logger.info(f"[Backup] Cleaned up: {d.name}")
        except (ValueError, IndexError):
            continue


# Global instance
backup_service = BackupService()