---
title: "RAG: VectorStoreIndex.insert_documents 方法不存在，增量刷新失败"
tags: [rag, llama-index, indexer, incremental-refresh]
category: projects/yiai/bugs/rag
created: 2026-09-07
updated: 2026-09-10
source: internal
type: bug
status: resolved
severity: major
priority: p1
project: YiAi
module: domain/rag/indexer.py
reporter: Claude
environment: macOS / Python 3.10+
affected_version: main (pre-fix)
fixed_version: main (post-fix 2026-09-07)
frequency: always
---

## Description

RAG 知识库监视器（`domain/knowledge/watcher.py`）在执行增量索引刷新时，调用 `refresh_index_for_changes` 插入新增/变更的文档，但 `VectorStoreIndex` 对象没有 `insert_documents` 方法，导致 `AttributeError: 'VectorStoreIndex' object has no attribute 'insert_documents'`。

日志中观察到：`RAG incremental refresh: {'inserted': 0, 'deleted': 1, 'errors': ["insert: 'VectorStoreIndex' object has no attribute 'insert_documents'"]}`

删除操作正常执行，但插入操作全部失败，导致新增/变更的文档无法被 RAG 检索到。

## Steps to Reproduce

1. 启动 YiAi 后端（`python main.py`）
2. 在 YiKnowledge 目录中新增或修改一个 markdown 文件
3. 等待知识监视器轮询（默认每 5 秒）
4. 检查 `logs/app.log` 中的 RAG 增量刷新日志

## Expected Result

新增/变更的文档被成功插入到 RAG 索引中，增量刷新日志显示 `inserted > 0` 且 `errors` 为空。

## Actual Result

`inserted` 始终为 0，`errors` 包含 `"insert: 'VectorStoreIndex' object has no attribute 'insert_documents'"`。

## Cause

`llama_index` 的 `VectorStoreIndex` 类没有 `insert_documents` 方法。正确的 API 是 `index.insert(doc)` —— 逐个插入文档。

## Solution

将 `index.insert_documents(docs, show_progress=False)` 替换为逐个调用 `index.insert(doc)` 的循环：

```diff
- index.insert_documents(docs, show_progress=False)
+ for doc in docs:
+     index.insert(doc)
```

## Code Diff

**文件**: `YiAi/src/domain/rag/indexer.py:269`

```diff
 if docs:
-    index.insert_documents(docs, show_progress=False)
+    for doc in docs:
+        index.insert(doc)
     inserted = len(docs)
```

## Prevention

**规则**: 使用 `llama_index` 的 `VectorStoreIndex` 时，插入文档使用 `index.insert(doc)` 而非不存在的 `insert_documents`。

**检查清单**:
- 新增 llamaindex API 调用前，先确认方法是否存在（`hasattr(index, 'method_name')` 或查阅 llamaindex 文档）
- RAG 增量刷新后，检查日志中 `errors` 是否为空

## 影响范围

- **影响模块**：domain/rag/indexer.py
- **涉及文件**：
- domain/rag/indexer.py
- **是否影响 API 契约**：否
- **是否影响其他项目（YiVad/YiPet）**：否
- **用户感知**：待确认

## 经验教训

1. **根本原因**：开发过程中对边界情况和异常路径的考虑不足是此类问题的共同根因
2. **设计阶段**：在接口设计和模块实现时，应主动考虑异常输入、空值、超时等边界场景
3. **代码审查**：审查时应检查是否存在类似的反模式（如未捕获异常、无超时控制、缺少参数校验等）
4. **测试覆盖**：异常路径的测试覆盖率应与正常路径同等重视
5. **团队分享**：此类问题应在团队周会或技术分享中讨论，形成团队共识
