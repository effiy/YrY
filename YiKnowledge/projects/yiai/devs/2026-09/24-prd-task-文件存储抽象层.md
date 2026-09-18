---
doc_type: module
prd_task_id: "YA-09-35"
title: "YA-09-35: 文件存储抽象层 — 本地/S3/OSS 多后端可插拔 — 开发方案"
status: 需求已编写
priority: P2
owner: 陈铭
roles: [engineer]
created: 2026-09-11
updated: 2026-09-14
project: YiAi
project_id: yiai
prd_month: "202609"
estimate_frontend: 1.5
source_prd: "24-需求-文件存储抽象层.md"
source_okr: [yiai-001]
---

# YA-09-35: 文件存储抽象层 — 本地/S3/OSS 多后端可插拔 — 开发方案

> **文档职责**：本文档定义**怎么做、为什么这么做、实际做成什么样**（HOW），不含产品目标与测试用例。

> 来源 PRD：[24-需求-文件存储抽象层.md](../../prds/2026-09/24-需求-文件存储抽象层.md)
> 需求编号：YA-09-35 · 优先级：P2 · 人天：1.5d · 状态：需求已编写

---

<a id="sec-1"></a>
## 一、方案

将 `domain/files/` 的双写（磁盘+OSS）升级为多后端可插拔架构——通过 `StorageBackend` 抽象，配置切换存储后端。

```python
class StorageBackend(ABC):
    @abstractmethod
    async def read(self, path: str) -> bytes: ...
    @abstractmethod
    async def write(self, path: str, data: bytes) -> None: ...
    @abstractmethod
    async def delete(self, path: str) -> None: ...
    @abstractmethod
    async def exists(self, path: str) -> bool: ...

class LocalBackend(StorageBackend): ...
class S3Backend(StorageBackend): ...
class OSSBackend(StorageBackend): ...

# 配置驱动
backend = create_backend(settings.storage_backend)  # "local" | "s3" | "oss"
```

### 双后端镜像

可选 `primary + mirror` 模式：主后端写入成功 → 异步镜像到备用后端。

---

<a id="sec-2"></a>
## 二、实施步骤

| 步骤 | 验证 | 人天 |
|------|------|------|
| 1 | `StorageBackend` ABC + Local/S3/OSS 实现 | 三后端可独立读写 | 0.75 |
| 2 | 配置驱动 + mirror 模式 + 测试 | 切换后端不影响上层 | 0.75 |

**合计：1.5d**。