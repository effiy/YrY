---
doc_type: module
prd_task_id: "YK-09-11"
title: "YK-09-11: Knowledge Watcher 内部机制与性能调优 — 开发方案"
status: 需求已编写
priority: P1
owner: 陈铭
roles: [engineer]
created: 2026-09-15
updated: 2026-09-15
project: YiKnowledge
project_id: yiknowledge
prd_month: "202609"
estimate_backend: 2.0
source_prd: "14-架构设计-KnowledgeWatcher内部机制与性能调优.md"
source_okr: [yiknowledge-001]
related_tests: ["14-prd-test-KnowledgeWatcher内部机制与性能调优"]
---

# YK-09-11: Knowledge Watcher 内部机制与性能调优 — 开发方案

> 来源 PRD：[14-架构设计-KnowledgeWatcher内部机制与性能调优.md](../../prds/2026-09/14-架构设计-KnowledgeWatcher内部机制与性能调优.md)
> 需求编号：YK-09-11 · 优先级：P1 · 人天：2.0d

> **文档职责**：本文档定义**怎么做、为什么这么做、实际做成什么样**（HOW）。

---

## 一、架构总览

优化 KnowledgeWatcher 扫描管线：增量索引（仅处理变更文件）、批量写入 MDB（bulk_write 替代逐条 insert）、并发扫描（`asyncio.gather` 并行处理多文件）、性能指标采集。

### 文件清单

```
YiAi/src/domain/knowledge/watcher.py  # 【修改】增量索引 + 批量写入 + 并发
```

---

## 二、关键技术决策

### D-01：mtime + checksum 双重变更检测

仅 mtime 不可靠（touch 命令会更新 mtime 但不改变内容）。增加文件内容 SHA256 checksum 缓存，mtime 变更 + checksum 不同 → 确认内容变更，避免无效索引更新。

### D-02：bulk_write 批量写入

当前逐条 `update_one` 在 800 文档场景下产生 800 次 MDB 网络往返。改为 `bulk_write` 批量写入（每批 50 条），网络往返减少 94%。

### D-03：并发扫描 — asyncio.Semaphore 限流

`asyncio.gather` 并行处理但用 `Semaphore(10)` 限制并发数，防止过多文件同时读取导致磁盘 I/O 竞争。

---

## 三、实施步骤

| 步骤 | 任务 | 人天 |
|------|------|------|
| 1 | checksum 缓存 + 双重变更检测 | 0.4 |
| 2 | bulk_write 批量写入（50/批） | 0.3 |
| 3 | 并发扫描（Semaphore 10） | 0.3 |
| 4 | 性能指标采集（扫描耗时/文件数/批量大小） | 0.3 |
| 5 | 全库扫描性能对比（修复前/后） | 0.3 |
| 6 | 回归测试 | 0.4 |

**总计：2.0d**

---

## 四、性能对比

| 指标 | 修复前 | 修复后 | 改善 |
|------|--------|--------|------|
| 全库扫描（800 docs，无变更） | ~8s | ~3s | 62% |
| 全库扫描（50 docs 变更） | ~15s | ~5s | 67% |
| MDB 写入往返 | 800 次 | ~16 批 | 98% |

---

## 五、实现完成记录

> **状态**：需求已编写，尚未开始实施。

---

## 六、已知缺口与技术债

| # | 技术债 | 优先级 | 说明 | 状态 |
|---|--------|--------|------|------|
| 1 | checksum 缓存未持久化 | P2 | 重启后首次扫描需重新计算全库 checksum | 待实施（MDB 持久化） |
| 2 | Semaphore 并发数硬编码 10 | P3 | 不同磁盘性能（SSD/HDD）最优并发数不同 | 待实施（配置化） |

---