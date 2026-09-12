"""Dashboard performance stats — system metrics (disk, memory, process)."""
import logging
import os

from fastapi import APIRouter
from pydantic import BaseModel

from shared.response import success

logger = logging.getLogger(__name__)
router = APIRouter()


class DiskUsage(BaseModel):
    path: str
    total_gb: float
    used_gb: float
    free_gb: float
    percent: float


class MemoryInfo(BaseModel):
    total_gb: float
    used_gb: float
    free_gb: float
    percent: float


class ProcessInfo(BaseModel):
    pid: int
    memory_mb: float
    cpu_percent: float
    threads: int


class PerformanceResponse(BaseModel):
    disk: DiskUsage
    memory: MemoryInfo
    process: ProcessInfo


@router.get("/performance", operation_id="dashboard_performance")
async def performance():
    """Return system performance metrics (disk, memory, process)."""
    import psutil

    try:
        cwd = os.getcwd()
        disk = psutil.disk_usage(cwd)
        disk_info = DiskUsage(
            path=cwd,
            total_gb=round(disk.total / (1024**3), 1),
            used_gb=round(disk.used / (1024**3), 1),
            free_gb=round(disk.free / (1024**3), 1),
            percent=disk.percent,
        )

        mem = psutil.virtual_memory()
        memory_info = MemoryInfo(
            total_gb=round(mem.total / (1024**3), 1),
            used_gb=round(mem.used / (1024**3), 1),
            free_gb=round(mem.available / (1024**3), 1),
            percent=mem.percent,
        )

        proc = psutil.Process(os.getpid())
        proc_info = ProcessInfo(
            pid=proc.pid,
            memory_mb=round(proc.memory_info().rss / (1024**2), 1),
            cpu_percent=proc.cpu_percent(interval=0.1),
            threads=proc.num_threads(),
        )

        return success(data=PerformanceResponse(
            disk=disk_info, memory=memory_info, process=proc_info,
        ).model_dump())
    except Exception as e:
        logger.warning(f"Performance stats failed: {e}")
        return success(data=PerformanceResponse(
            disk=DiskUsage(path="", total_gb=0, used_gb=0, free_gb=0, percent=0),
            memory=MemoryInfo(total_gb=0, used_gb=0, free_gb=0, percent=0),
            process=ProcessInfo(pid=0, memory_mb=0, cpu_percent=0, threads=0),
        ).model_dump())