---

doc_type: module
prd_task_id: "YA-09-55"
title: "YA-09-55: 数据库备份与恢复 — mongodump + 定时调度 + 灾备演练 — 开发方案"
status: 已完成
priority: P1
owner: 陈铭
roles: [engineer]
created: 2026-09-11
updated: 2026-09-14
project: YiAi
project_id: yiai
prd_month: "202609"
estimate_frontend: 1.5
source_prd: "104-需求-数据库备份与恢复.md"
source_okr: [yiai-001]
acceptance_criteria:
  - 每日 02:00 全量备份成功生成，SHA256 校验和匹配
  - 每日 06:00 试恢复验证通过，临时恢复数据库无残留
  - 本地保留 7 天 + 远程保留 30 天双副本，过期备份自动清理
  - RPO：P0 数据 < 1 小时（增量备份），P1/P2 数据 < 24 小时（全量备份）
  - 备份失败时企业微信告警 2min 内送达

type: task
---

# YA-09-55: 数据库备份与恢复 — mongodump + 定时调度 + 灾备演练 — 开发方案

| 属性 | 值 |
|------|-----|
| 文档编号 | YA-09-55 |
| 版本 | v1.1 |
| 密级 | 内部 |
| 作者 | 陈铭 |
| 审核人 | — |
| 状态 | 已完成 |
| 最后更新 | 2026-09-23 |

> 来源 PRD：[104-需求-数据库备份与恢复.md](../../prds/2026-09/104-需求-数据库备份与恢复.md)
> 需求编号：YA-09-55 · 优先级：P1 · 人天：1.5d

---

## 目录

1. [架构总览](#一架构总览)
2. [设计约束](#二设计约束)
3. [文件清单](#三文件清单)
4. [模块设计](#四模块设计)
5. [数据流](#五数据流)
6. [实施路线图](#六实施路线图)
7. [测试策略](#七测试策略)
8. [技术风险评估](#八技术风险评估)
附录 A. [变更记录](#附录-a-变更记录)

---

## 一、架构总览

YiAi 生产环境 MongoDB 为单节点部署，当前无任何备份机制。磁盘故障、误删除或实例崩溃将导致数据永久丢失。方案：通过 apscheduler 定时触发 mongodump 全量备份（每日凌晨 2:00）+ 每小时增量备份（oplog 捕获），本地保留 7 天 + 远程存储保留 30 天双副本。每日 6:00 自动试恢复验证备份完整性。RPO 目标：P0 数据 < 1 小时，P1/P2 数据 < 24 小时。

```mermaid
flowchart TD
    subgraph MongoDB["MongoDB 单节点 (WiredTiger)"]
        DATA["业务数据 (8 集合 / ~500MB)"]
        OPLOG["oplog 操作日志"]
    end

    subgraph BackupJobs["备份调度 (apscheduler AsyncIOScheduler)"]
        FULL["每日全量备份<br/>mongodump --gzip<br/>时间: 每天 02:00"]
        INCR["每小时增量备份<br/>mongodump --oplog<br/>时间: 每小时第 5 分钟"]
        VERIFY["备份验证<br/>试恢复 + SHA256 校验<br/>时间: 每天 06:00"]
        CLEAN["过期清理<br/>本地 7 天 / 远程 30 天"]
    end

    subgraph Storage["双副本存储"]
        LOCAL["本地存储<br/>./backups/mongodb/<br/>保留 7 天 / ~5.2GB"]
        REMOTE["远程存储<br/>/mnt/backup/mongodb/<br/>保留 30 天 / ~22.2GB"]
    end

    DATA --> FULL
    OPLOG --> INCR
    FULL -->|gzip 压缩| LOCAL
    FULL -->|同步 (shutil.copytree)| REMOTE
    INCR --> LOCAL
    LOCAL --> VERIFY
    VERIFY -->|恢复成功?| ALERT{告警?}
    ALERT -->|失败| WEWORK[企业微信告警]
    CLEAN --> LOCAL
    CLEAN --> REMOTE
```

### 时间点恢复流程

```mermaid
flowchart TD
    START["灾难发生 / 数据丢失"] --> SELECT["选择恢复时间点 T"]
    SELECT --> FIND["查找最近全量备份 (早于 T)"]
    FIND --> RESTORE["mongorestore --gzip --drop 恢复全量"]
    RESTORE --> CHECK{"需要回放 oplog?"}
    CHECK -->|是 (T 晚于全量时间)| REPLAY["mongorestore --oplogReplay<br/>--oplogLimit=T"]
    CHECK -->|否| VERIFY["验证恢复结果"]
    REPLAY --> VERIFY
    VERIFY --> VALID{"数据完整性校验通过?"}
    VALID -->|是| DONE["恢复完成<br/>记录恢复日志"]
    VALID -->|否| RETRY["尝试更早备份<br/>或人工介入"]
    RETRY --> FIND
```

---

<a id="sec-2"></a>
## 二、设计约束

| 约束项 | 说明 |
|--------|------|
| RPO 目标 | P0 数据 < 1 小时（增量 oplog 备份），P1/P2 数据 < 24 小时（全量备份） |
| RTO 目标 | 全节点故障恢复 < 30min（含远程拉取 + mongorestore + 验证） |
| 备份锁 | `asyncio.Lock` 防止全量备份并发执行，避免磁盘 I/O 竞争 |
| 磁盘空间保护 | 备份前检查磁盘使用率 < 80%，不足时跳过 + 告警 |
| 双副本 | 本地 + 远程双副本，远程同步失败仅 WARNING 不阻断本地备份 |
| 备份文件权限 | `chmod 600`，仅 YiAi 进程可读写，防止数据泄露 |

---

<a id="sec-3"></a>
## 三、文件清单

| 文件 | 操作 | 行数 | 说明 |
|------|------|------|------|
| `src/services/backup/__init__.py` | **新建** | ~5 | 备份服务 Python 包初始化 |
| `src/services/backup/backup_service.py` | **新建** | ~300 | BackupService：全量/增量备份、恢复、验证、清理、远程同步 |
| `src/services/backup/scheduler.py` | **新建** | ~50 | 备份调度器：apscheduler 三任务配置 + 启动 |
| `src/services/backup/backup_routes.py` | **新建** | ~60 | RPC 端点：手动备份/验证/恢复/列表 |
| `src/shared/config.py` | 修改 | +10 | 新增 `backup_local_dir`、`backup_remote_dir`、`backup_retention_local_days`、`backup_retention_remote_days` |
| `src/main.py` | 修改 | +5 | 注册 backup scheduler 和 routes |
| `tests/services/test_backup_service.py` | **新建** | ~150 | 5 需求 10 场景测试 |

---

## 四、模块设计

### 3.1 BackupService（核心类）

```python
# src/services/backup/backup_service.py

import asyncio
import hashlib
import shutil
from datetime import datetime, timedelta
from pathlib import Path
from typing import Optional


class BackupService:
    """MongoDB 备份与恢复服务。

    职责：
    - 全量备份 (full_backup): mongodump --gzip 导出所有集合
    - 增量备份 (incremental_backup): mongodump --oplog 捕获操作日志
    - 备份验证 (verify_backup): SHA256 校验 + 试恢复到临时数据库
    - 数据恢复 (restore): mongorestore --gzip + oplog 回放
    - 远程同步 (_sync_to_remote / _sync_from_remote): 双副本保障
    - 过期清理 (_cleanup_old_backups): 本地 7 天 / 远程 30 天
    """

    def __init__(self) -> None:
        self.local_dir: Path = Path(settings.backup_local_dir or "./backups/mongodb")
        self.remote_dir: Path = Path(settings.backup_remote_dir or "/mnt/backup/mongodb")
        self.local_retention_days: int = 7
        self.remote_retention_days: int = 30
        self.mongo_uri: str = settings.mongo_uri
        self._backup_lock: asyncio.Lock = asyncio.Lock()

    async def full_backup(self) -> dict: ...
    async def incremental_backup(self) -> dict: ...
    async def verify_backup(self, backup_name: str) -> dict: ...
    async def restore(
        self, backup_name: str, target_time: datetime | None = None
    ) -> dict: ...
    async def _sync_to_remote(self, local_path: Path, backup_name: str) -> None: ...
    async def _sync_from_remote(self, backup_name: str) -> None: ...
    async def _cleanup_old_backups(self, base_dir: Path, retention_days: int) -> None: ...
    def _compute_checksum(self, path: Path) -> str: ...
    def _read_checksum(self, path: Path) -> Optional[str]: ...
    def _get_dir_size_mb(self, path: Path) -> float: ...
```

### 3.2 备份调度器

```python
# src/services/backup/scheduler.py

from apscheduler.schedulers.asyncio import AsyncIOScheduler
from src.services.backup.backup_service import backup_service

scheduler = AsyncIOScheduler()

def setup_backup_scheduler() -> None:
    """配置并启动备份调度任务。"""

    # 任务 1: 每日全量备份 — 凌晨 2:00
    scheduler.add_job(
        backup_service.full_backup,
        trigger="cron", hour=2, minute=0,
        id="full_backup", name="每日全量备份",
        replace_existing=True,
    )

    # 任务 2: 每小时增量备份 — 每小时第 5 分钟
    scheduler.add_job(
        backup_service.incremental_backup,
        trigger="cron", minute=5,
        id="incremental_backup", name="每小时增量备份",
        replace_existing=True,
    )

    # 任务 3: 每日备份验证 — 凌晨 6:00
    scheduler.add_job(
        backup_service.verify_backup,
        trigger="cron", hour=6, minute=0,
        id="backup_verify", name="每日备份验证",
        replace_existing=True,
    )

    scheduler.start()
```

### 3.3 RPC 端点

```python
# src/services/backup/backup_routes.py

router = APIRouter(prefix="/backup", tags=["backup"])

@router.post("/full")
async def trigger_full_backup() -> dict:
    """手动触发全量备份。需管理员权限。"""
    result = await backup_service.full_backup()
    return {"code": 0 if result["status"] == "success" else 5001, "data": result}

@router.post("/verify/{backup_name}")
async def verify_backup(backup_name: str) -> dict:
    """验证指定备份完整性（试恢复 + 校验和）。"""

@router.post("/restore/{backup_name}")
async def restore_backup(
    backup_name: str, target_time: str | None = None
) -> dict:
    """从备份恢复数据。target_time 支持 ISO 格式时间点恢复。"""

@router.get("/list")
async def list_backups() -> dict:
    """列出所有可用备份。"""
```

---

## 五、数据流

### 4.1 每日备份流程

```
02:00 — apscheduler 触发 full_backup()
  → 检查磁盘空间 (> 20% 预留)
  → asyncio.create_subprocess_exec("mongodump", "--uri=...", "--out=...", "--gzip")
  → 计算 SHA256 校验和 → 写入 checksum.txt
  → 记录日志: "[Backup] 全量备份完成: full_20260909_020000, checksum=abc123"
  → _sync_to_remote: shutil.copytree → /mnt/backup/mongodb/
  → _cleanup_old_backups(local_dir, 7): 删除 7 天前备份
  → _cleanup_old_backups(remote_dir, 30): 删除 30 天前备份
  → 返回 {status: "success", backup_name, checksum, size_mb}

06:00 — apscheduler 触发 verify_backup()
  → 读取最新全量备份的 checksum
  → _compute_checksum(backup_path) → 比对期望值
  → mongorestore --nsFrom="*" --nsTo="backup_test_*" → 试恢复到临时数据库
  → 验证恢复成功 → dropDatabase("backup_test_*")
  → 返回 {status: "verified"} 或 {status: "corrupted"}
```

### 4.2 恢复决策树

```
需要恢复
  ├─ 单集合误删除
  │   └→ mongorestore --nsInclude="yi_ai.sessions" --gzip
  │       └→ 仅恢复目标集合，不影响其他集合
  ├─ 时间点恢复
  │   └→ 找最近全量 + 回放 oplog 到目标时间
  │       └→ mongorestore --gzip --oplogReplay --oplogLimit=T
  └─ 全节点故障
      └→ 从远程拉取最近全量备份 → mongorestore --drop --gzip
          └→ 恢复全部 8 个集合 → 重启 YiAi 服务
```

---

## 六、实施路线图

| 阶段 | 人天 | 任务 | 产出 | 验证 |
|------|------|------|------|------|
| 一：基础设施 | 0.1 | 创建目录结构 + 配置项 | `config.py` + 备份目录 | 配置可读，目录创建成功 |
| 二：全量备份 | 0.3 | 实现 full_backup: mongodump + gzip + 校验和 | `backup_service.py` (~100行) | mongodump 执行成功，备份文件生成 |
| 三：增量备份 | 0.15 | 实现 incremental_backup: mongodump --oplog | 增量方法 | oplog 备份文件生成 |
| 四：验证与恢复 | 0.2 | 实现 verify_backup (试恢复) + restore (时间点恢复) | 验证 + 恢复方法 | 试恢复成功，数据一致 |
| 五：远程同步 | 0.15 | 实现本地↔远程同步 + 备份清理策略 | 同步 + 清理方法 | 远程备份可见，过期被清理 |
| 六：调度与端点 | 0.3 | 配置 3 个定时任务 + 4 个 RPC 端点 | scheduler + routes | 定时任务按时触发，API 正常 |
| 七：灾备演练 | 0.2 | 全链路恢复演练：模拟灾难 → 恢复 | 演练报告 | 备份可成功恢复 |

**合计：1.5d。**

---

### 6.1 代码审查检查清单

- [ ] `BackupService` 初始化时自动创建备份目录（本地 + 远程）
- [ ] 全量备份使用 `mongodump --gzip`，正确捕获 stdout/stderr 和 returncode
- [ ] 增量备份使用 `mongodump --oplog`，每小时执行
- [ ] 备份验证包含 SHA256 校验和检查 + 试恢复到临时数据库
- [ ] 试恢复后清理临时数据库（`dropDatabase`），不留残留
- [ ] 备份文件权限 `600`（仅 YiAi 进程可读写）
- [ ] 备份目录命名：`full_YYYYMMDD_HHMMSS` / `incr_YYYYMMDD_HHMMSS`
- [ ] 远程同步使用 `shutil.copytree`，失败时记录 WARNING 但不阻断本地备份
- [ ] 备份清理策略：本地 7 天 / 远程 30 天
- [ ] 备份失败时记录 ERROR 日志 + 触发企业微信告警
- [ ] RPC 端点添加权限校验（仅管理员手动触发备份/恢复）
- [ ] `ruff` 代码规范通过 + `mypy` 类型检查通过
- [ ] 备份任务使用 `asyncio.Lock` 防止并发执行

---

---

## 七、测试策略

### 7.1 测试分层

| 层级 | 覆盖范围 | 工具 |
|------|----------|------|
| 单元测试 | BackupService 方法（校验和/清理/磁盘检查）、调度器配置 | pytest |
| 集成测试 | mongodump 执行 + SHA256 校验 + 试恢复 + 远程同步 | pytest + subprocess |
| 灾备演练 | 全链路恢复：模拟灾难 → 恢复 → 数据一致性验证 | 手动 / 自动化脚本 |

### 7.2 关键测试用例

| 场景 | 验证点 |
|------|--------|
| 全量备份 | mongodump --gzip 成功，备份文件生成，SHA256 校验和写入 |
| 增量备份 | mongodump --oplog 成功，oplog 文件生成 |
| 备份验证 | 试恢复到临时库 → 数据一致 → 临时库清理无残留 |
| 时间点恢复 | 全量 + oplog 回放到指定时间 → 数据正确 |
| 磁盘空间不足 | 使用率 > 80% → 跳过备份 + 告警 |
| 远程同步失败 | NFS 不可用 → WARNING + 本地备份不受影响 |
| 过期清理 | 本地 7 天 + 远程 30 天过期备份被删除 |
| 并发保护 | asyncio.Lock 防止两个全量备份同时执行 |

---

## 八、技术风险评估

| 风险 | 概率 | 影响 | 等级 | 缓解措施 |
|------|------|------|------|----------|
| 备份期间磁盘空间不足 | 中 | 高 | 高 | 备份前检查磁盘空间（< 80% 才执行）；配置磁盘告警 |
| mongodump 在 Docker 中不可用 | 低 | 高 | 中 | Dockerfile 中预装 `mongodb-database-tools` |
| oplog 在备份前被覆盖 | 中 | 高 | 中 | 增加 `oplogSizeMB` 到 1024MB；备份前检查 oplog 窗口 |
| 备份文件损坏 | 低 | 高 | 中 | 每日试恢复验证 + SHA256 校验；损坏时告警 |
| 恢复时 `--drop` 误删生产数据 | 中 | 极高 | 高 | 恢复操作需管理员二次确认；先恢复到临时库验证 |
| 备份数据泄露 | 低 | 高 | 高 | 备份文件 `chmod 600`；远程传输使用 SSH/SCP 加密 |
| 远程存储 NFS 超时 | 中 | 低 | 低 | 远程同步失败仅 WARNING，不影响本地备份 |

### 回滚策略

| 场景 | 操作 | 回滚时间 |
|------|------|----------|
| 备份调度器异常频繁执行 | `scheduler.pause_job("full_backup")` | < 1min |
| 备份占用过多磁盘 | 手动清理过期备份 + 调整保留天数 | < 5min |
| 恢复操作执行错误 | 选择更早备份重新恢复 | < 5min |
| 远程同步导致网络拥塞 | 暂停远程同步 | < 1min |

## 已知缺口与技术债

### 功能缺口

| # | 缺口 | 影响 | 建议 |
|---|------|------|------|
| 1 | 无实时 oplog 流式备份（秒级 RPO） | 极端场景下最多丢失 1 小时数据 | 未来引入 change stream 实时备份 |

### 技术债

| # | 技术债 | 优先级 | 预计人天 | 说明 | 状态 |
|---|--------|--------|---------|------|------|
| 1 | 单节点无副本集，mongodump 备份期间无法实现真正的一致性快照 | 中 | 2.0 | 需先部署副本集 | 未开始 |
| 2 | 远程存储目前依赖 NFS/SSH，无对象存储 (OSS/S3) 支持 | 低 | 1.0 | 后续扩展 | 未开始 |

---

## 附录 A. 变更记录

| 日期 | 版本 | 变更内容 | 作者 |
|------|------|----------|------|
| 2026-09-11 | v1.0 | 初始版本：BackupService、调度器、RPC 端点、恢复流程 | 陈铭 |
| 2026-09-23 | v1.1 | 补充设计约束（RPO/RTO/磁盘保护）、测试策略（分层+关键用例）、变更记录 | 陈铭 |