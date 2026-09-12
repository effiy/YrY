---
title: 缺陷模板
tags: [yiai, bugs, template]
category: projects/yiai/bugs/template
created: 2026-09-07
updated: 2026-09-10
source: YiAi
type: template
status: active
---

# YiAi 缺陷模板

> 使用此模板记录 YiAi 后端缺陷。每个缺陷包含复现步骤、根因分析、修复方案和预防措施。

## 标题

> `[分类] 简短描述` — 如 `[RAG] VectorStoreIndex.insert_documents 方法不存在`

## 元信息

```yaml
severity: critical / major / minor / trivial
priority: p0 / p1 / p2 / p3
project: YiAi
module: 影响的模块路径（如 domain/rag/indexer.py）
frequency: always / intermittent / rare
environment: 运行环境（Python 版本、OS）
affected_version: 影响版本
fixed_version: 修复版本
```

## 复现步骤

1. 步骤 1（如：调用 `/rag/query` 端点，传入参数 `{...}`）
2. 步骤 2
3. 步骤 3

## 预期行为

> 描述期望的正确行为

## 实际行为

> 描述实际观察到的错误行为（包含错误日志/堆栈）

```
# 错误日志示例
Traceback (most recent call last):
  ...
```

## 根因分析

> 技术层面的根因分析，包含：
> - 问题代码位置（文件:行号）
> - 为什么会出现这个问题
> - 是否有历史原因

**问题代码**：
```python
# domain/rag/indexer.py:42
index.insert_documents(docs)  # 该方法不存在
```

**根因**：`VectorStoreIndex` 在 llama_index 0.13 中移除了 `insert_documents` 方法，需使用 `index.insert(doc)` 逐个插入。

## 修复方案

> 具体的修复方案和代码变更

**修复代码**：
```python
# 修复后
for doc in docs:
    index.insert(doc)
```

## 影响范围

- **影响模块**：列出受影响的模块
- **影响版本**：列出受影响的版本
- **是否影响 API 契约**：是 / 否
- **是否影响前端调用方**：是 / 否（YiVad / YiPet）

## 验证方法

> 如何验证修复是否生效

1. 运行单元测试：`pytest tests/rag/test_indexer.py`
2. 手动调用 API 端点验证
3. 检查日志确认无异常

## 预防措施

> 如何避免类似问题再次发生

- **代码层面**：调用第三方库 API 前验证方法存在性
- **测试层面**：添加集成测试覆盖第三方库 API 调用
- **流程层面**：升级依赖前检查 CHANGELOG 中的 breaking changes

## 相关链接

- PR：
- Commit：
- 相关 Issue：