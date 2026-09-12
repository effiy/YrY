---
title: macOS FSEvents Silent Drop — File Watcher Polling Fallback
tags: [gotcha, macos, fsevents, file-watcher, knowledge-base]
category: engineer/learn/lessons/gotchas
created: 2026-08-21
updated: 2026-09-10
source: internal
type: summary
status: stable
lifecycle: active
review_cycle: quarterly
roles: [engineer]
benefit: "Engineers understand why YiAi's knowledge watcher uses polling instead of FSEvents, and when to apply the same pattern"
acceptance_criteria:
  - "Platform-specific failure mode documented"
  - "Polling fallback implementation described"
  - "Trade-offs between polling interval and CPU usage discussed"
related:
  - ./README.md
  - ../../../../YiAi/CLAUDE.md
---

# macOS FSEvents 静默丢弃 —— 文件监听器的轮询降级方案

> **此机器上的 macOS FSEvents 会静默丢弃文件变更事件。** YiAi 的知识库监听器使用 apscheduler 每 60 秒轮询一次作为降级替代方案。

## 问题描述

YiAi 的知识库监听器监控 `../YiKnowledge` 目录中的文件变更（创建、更新、删除），并将其同步到 MongoDB 和 RAG 向量索引。最初实现使用 macOS FSEvents（通过 `watchdog` 库）进行实时文件变更通知。

然而在这台特定的机器上，FSEvents **静默地丢弃事件**——文件在磁盘上被创建或修改，但监听器永远不会收到通知。知识库和 MongoDB 在不产生任何错误或警告的情况下逐渐失同步。

### 影响范围

- **受影响项目**：YiAi（知识库监听器）、任何依赖实时文件监听的 macOS 本地服务
- **用户可感知症状**：添加到 YiKnowledge 的知识文件不会出现在 RAG 索引或 MongoDB `knowledge_files` 集合中。所有消费者（YiVad、YiPet、RAG 查询）看到的知识库内容为空或过时。
- **严重程度**：高——知识库是 RAG 检索的唯一数据源，失同步意味着 AI 回答基于过期知识

### 为什么 FSEvents 会静默丢弃事件

FSEvents 的可靠性受到以下因素影响：

1. **内核事件队列溢出**：macOS 内核为 FSEvents 维护一个固定大小的事件队列。高频率的文件操作（如知识库批量导入）可能导致队列溢出，后续事件被丢弃
2. **文件系统差异**：APFS vs HFS+、本地磁盘 vs 网络挂载（NFS/SMB）——不同文件系统对 FSEvents 的支持程度不同
3. **机器特定问题**：某些 macOS 版本或硬件配置下 FSEvents 行为不稳定，可能与安全软件、磁盘加密或其他系统级钩子冲突

最重要的是：这种丢弃是**静默的**——没有任何错误日志、没有回调触发、没有任何迹象表明事件被遗漏。唯一的发现方式是比对磁盘上的实际文件和应用中的数据。

## 修复方案

将 FSEvents 替换为 **apscheduler 定时轮询**，间隔为 60 秒：

```python
# YiAi/src/domain/knowledge/watcher.py
from apscheduler.schedulers.asyncio import AsyncIOScheduler

scheduler = AsyncIOScheduler()
scheduler.add_job(
    scanner.scan_and_sync,
    'interval',
    seconds=60,
    id='knowledge_watcher'
)
```

### 轮询循环的工作流程

1. **目录遍历**：遍历 `../YiKnowledge` 完整目录树，收集所有 `.md` 文件
2. **变更检测**：对比文件的哈希值/修改时间与上次已知状态，识别新增、修改和删除的文件
3. **同步到 MongoDB**：将变更文件的元数据和内容 upsert 到 `knowledge_files` 集合
4. **触发增量索引**：调用 RAG 索引器的增量更新，只重建变更文件的向量索引

### 为什么选择 60 秒

| 轮询间隔 | 延迟 | CPU 占用 | 数据新鲜度 |
|---|---|---|---|
| 5 秒 | <=5 秒 | 中等（频繁遍历 1000+ 文件） | 准实时 |
| 60 秒（当前） | <=60 秒 | 低 | 可接受（知识库更新不频繁） |
| 300 秒 | <=5 分钟 | 极低 | 较差（RAG 查询可能返回过时结果） |

60 秒是一个权衡结果：知识库内容的更新通常是人为的（编辑文档、添加新知识），频率不高，60 秒的延迟对 RAG 查询几乎无感知影响。相比 5 秒轮询，CPU 开销降低了约 12 倍。

## 方案对比

| 方案 | 延迟 | CPU 占用 | 可靠性 | 适用场景 |
|---|---|---|---|---|
| FSEvents（理想） | <1 秒 | 接近零 | 在此机器上不可靠 | macOS 本地开发 |
| 轮询 5 秒 | <=5 秒 | 中等 | 可靠 | 需要准实时的场景 |
| 轮询 60 秒（当前） | <=60 秒 | 低 | 可靠 | YiKnowledge 知识库同步 |
| 轮询 300 秒 | <=5 分钟 | 极低 | 可靠但过时 | 低频率更新的静态内容 |

## 适用场景——何时应该使用轮询降级

这个教训不仅仅适用于 YiAi 的知识库监听器。在以下场景中优先考虑使用轮询降级方案：

- **macOS 上的文件监听器**：始终提供轮询降级方案。FSEvents 的可靠性因机器、系统版本和文件系统而异。不要假设 FSEvents 在任何环境中都可靠工作。
- **容器中的目录监听**：Docker 卷挂载、网络文件系统（NFS/SMB）通常不支持 FSEvents/inotify。在这些环境中，轮询是唯一可靠的选择。
- **关键同步路径**：如果数据过期会对用户产生可见影响（如 RAG 搜索结果为空），轮询降级的成本远低于调试遗漏事件的成本。

## 检测方法

### 如何判断 FSEvents 是否在丢弃事件

| 症状 | 检测方法 |
|---|---|
| 文件在磁盘上存在，但不在应用中 | 对比 `ls YiKnowledge/<role>/` 文件和 `db.knowledge_files.find({})` 的计数 |
| MongoDB 记录数量始终不变 | 在 YiKnowledge 中添加文件后 2 分钟查询 MongoDB，记录数应增加 |
| 监听器日志显示"0 个文件同步" | 检查 YiAi 启动日志中 Knowledge Watcher 的同步计数，如果一直为 0 但文件确实有变更，说明事件被遗漏 |

### 验证修复是否有效

```bash
# 1. 添加测试文件到 YiKnowledge
echo "test" > YiKnowledge/engineer/_test_watcher.md

# 2. 等待 2 分钟（2 个轮询周期）

# 3. 检查 MongoDB 中是否出现该文件
# 在 YiAi 的 Python 环境中：
# from data.database import MongoDB
# db = MongoDB.get_db()
# doc = await db.knowledge_files.find_one({"path": {"$regex": "_test_watcher"}})
# assert doc is not None, "Watcher did not pick up the test file"

# 4. 清理测试文件
rm YiKnowledge/engineer/_test_watcher.md
```

## 已知限制

- 轮询方案在超大目录（>10,000 文件）下 CPU 开销会显著增加。如果 YiKnowledge 增长到这个规模，需要考虑增量轮询（只检查修改时间在最近 N 分钟内的文件）
- 60 秒间隔意味着知识的"最大过时时间"是 60 秒。对于需要准实时知识更新的场景，可以降低到 5-10 秒，但要接受对应的 CPU 开销增加