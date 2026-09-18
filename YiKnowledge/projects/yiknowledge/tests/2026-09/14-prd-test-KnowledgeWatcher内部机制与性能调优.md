---
doc_type: test
title: "YK-09-11: Knowledge Watcher 内部机制与性能调优 — 测试用例"
status: 待开始
priority: P1
owner: 陈铭
roles: [engineer, qa]
created: 2026-09-15
updated: 2026-09-15
project: YiKnowledge
project_id: yiknowledge
prd_month: "202609"
prd_task_id: "YK-09-11"
source_prds: ["14-架构设计-KnowledgeWatcher内部机制与性能调优"]
source_modules: ["14-prd-task-KnowledgeWatcher内部机制与性能调优"]
source_okr: [yiknowledge-001]
---

# YK-09-11: Knowledge Watcher 内部机制与性能调优 — 测试用例

---

## 一、单元测试

| 编号 | 用例 | 预期 |
|------|------|------|
| UT-WT-01 | mtime 变更 + checksum 相同 | 不触发索引更新（touch 命令） |
| UT-WT-02 | mtime 变更 + checksum 不同 | 触发索引更新（内容变更） |
| UT-WT-03 | mtime 不变 | 跳过（无任何处理） |
| UT-WT-04 | bulk_write 50 条/批 | 100 条变更 → 2 次 bulk_write |
| UT-WT-05 | Semaphore(10) 限流 | 20 并发任务 → 最多 10 个同时执行 |
| UT-WT-06 | checksum 缓存命中 | 重启前已计算的 checksum → 直接从缓存读取 |

---

## 二、性能测试

| 编号 | 场景 | 目标 |
|------|------|------|
| PT-01 | 全库扫描无变更（800 docs） | < 4s |
| PT-02 | 50 docs 变更扫描 | < 6s |
| PT-03 | bulk_write vs 逐条写入 | 网络往返减少 ≥ 90% |

---

## 三、缺陷分级

| 级别 | 示例 |
|------|------|
| S1 — 严重 | checksum 相同但内容不同的文件被跳过（哈希碰撞） |
| S2 — 一般 | Semaphore 未生效导致磁盘 I/O 竞争 |

---