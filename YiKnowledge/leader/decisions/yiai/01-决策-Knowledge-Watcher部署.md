---
title: "ADR: Knowledge Watcher Deployment"
tags: [adr, yiai, knowledge, watcher, macOS, polling]
category: leader/decisions/yiai
created: 2026-08-03
updated: 2026-09-10
last_verified: 2026-08-21
source: internal
type: decision
status: accepted
lifecycle: implemented
review_cycle: quarterly
roles: [leader, engineer]
benefit: "理解为什么知识监听器使用轮询而非文件系统事件来检测 YiKnowledge 变更"
acceptance_criteria:
  - "决策理由和实施细节已完整记录"
related:
  - ../../../engineer/learn/lessons/gotchas/macos-fsevents-silent-drop.md
  - ../../../engineer/learn/projects/yiai/README.md
---

# ADR: 知识监听器部署

> **状态**：已接受 (2026-08-03) — 已通过 apscheduler 轮询实现

## 上下文

YiAi 需要检测 `YiKnowledge` markdown 目录树的变更，并将变更的文件重新索引到 MongoDB 和向量存储中。最自然的方案是使用文件系统事件（macOS 上的 FSEvents、Linux 上的 inotify）——文件一旦变化，监听器立刻收到事件并触发索引。

**业务需求**：当开发者或 AI 助手修改 YiKnowledge 中的 markdown 文件后，RAG 引擎需要在可接受的延迟内反映这些变更。这意味着知识监听器的可靠性直接影响 RAG 回答的质量。

**技术约束**：
- 开发环境是 macOS
- FSEvents 在此机器上表现出静默事件丢失
- YiKnowledge 目录当前包含约 1000 个文件
- 每个文件变更需要：读取文件 → 解析 frontmatter → 更新 MongoDB → 更新向量索引

**问题**：FSEvents 在此机器上不可靠——文件变更事件会静默丢失，导致知识监听器遗漏更新，造成 MongoDB 和 RAG 索引与磁盘上的实际文件内容不一致。

## 决策

**使用 apscheduler 每 5 秒轮询替代文件系统事件，配合增量索引、防抖、失败重试和监控。**

### 实施细节

| 组件 | 行为 | 设计理由 |
|-----------|----------|----------|
| 轮询间隔 | 5 秒 (apscheduler) | 在响应性和 CPU 开销之间的合理平衡 |
| 变更检测 | 对比文件修改时间与上次索引状态 | 避免重新索引未变更的文件 |
| 增量索引 | 仅重新索引发生变更的文件，不遍历整个目录树 | 将开销与变更量成正比，而非目录大小 |
| 防抖 | 2 秒防抖，避免重复索引正在编辑的文件 | 用户在编辑器中保存文件时可能触发多次事件 |
| 失败重试 | 索引失败最多重试 3 次，使用指数退避 | 处理临时性失败（如 MongoDB 瞬时不可用）|
| 监控 | 每次扫描记录耗时、文件数量和索引错误 | 便于发现性能退化或异常 |

### 工作流程

```
apscheduler 每 5 秒触发
  → 获取 YiKnowledge 目录树的文件列表
  → 对每个文件计算修改时间哈希
  → 与上次扫描状态比对
  → 只对变更文件执行：
      1. 读取文件内容
      2. 解析 frontmatter（title, tags, category 等）
      3. 更新 MongoDB knowledge_files 集合
      4. 更新向量索引（llama_index embedding）
  → 记录扫描日志（耗时、文件数、错误数）
```

## 选择理由

- FSEvents 在此机器上经证实不可靠（观察到事件丢失）
- 5 秒轮询是响应性和 CPU 使用率之间的合理权衡
- 增量索引使计算成本与变更量成正比，而非目录大小
- `apscheduler` 是成熟稳定的 Python 调度库，与 FastAPI 生命周期集成良好

## 替代方案

| 替代方案 | 拒绝原因 |
|---|---|
| FSEvents（保留）| 当前机器上不可靠——静默事件丢失 |
| inotify | 仅支持 Linux，macOS 不可用 |
| 1 秒轮询间隔 | CPU 使用率更高，相比 5 秒无实质延迟改善 |
| 30 秒轮询间隔 | 延迟过长——知识变更需等 30 秒才能在 RAG 中反映 |

## 后果

### 正面影响
- 知识文件变更可在 5 秒内被可靠检测
- 不依赖平台特定的文件监听 API（跨平台可移植）
- 在 macOS、Linux、容器环境中行为一致

### 负面影响
- 5 秒轮询产生持续的低级别 CPU 开销（约 0.5-2% 取决于文件数量）
- 文件变更非即时——存在最高 5 秒延迟
- 目录遍历在文件数量增长时开销线性增加

### 中性影响
- 监听器架构从事件驱动变为轮询驱动
- 未来迁移到更高效的监听器需要回退到事件驱动模型

## 适用场景

- 当文件系统事件不可靠时的替代方案设计参考
- 评估轮询频率与 CPU 开销的权衡
- 增量索引策略在其他模块中的复用

## 常见问题

**Q: 如果 YiKnowledge 文件数量增长到 10,000 个，5 秒轮询还能工作吗？**
A: 需要评估。当前增量索引策略只处理变更文件，所以开销与变更数而非总数成正比。但如果全量扫描 10,000 个文件的元信息（修改时间、大小）本身超过 5 秒，则需要调整策略（如分批扫描或多线程）。

## 反模式

- **为不可靠的事件通知叠加复杂的修复层。** 试图通过"监听事件 + 定时验证"的双重机制补救 FSEvents 的不可靠性，结果增加了复杂度却未根本解决问题。直接切换为轮询是更简洁的方案
- **忽视环境差异。** FSEvents 可能在其他 macOS 机器上表现正常。此决策是特定环境的应对方案，文档化在 gotchas 中以避免将来的混淆