---
doc_type: module
prd_task_id: "YA-09-01"
title: "YA-09-01: RAG 引擎稳定性修复 — 增量索引修复 + Embedding 维度校验 — 开发方案"
status: 已完成
priority: P0
owner: 陈铭
roles: [engineer]
created: 2026-09-11
updated: 2026-09-14
project: YiAi
project_id: yiai
prd_month: "202609"
estimate_frontend: 3.0
source_prd: "05-需求-RAG引擎.md"
source_okr: [yiai-001]
related_tests: ["05-prd-test-RAG引擎"]
---

# YA-09-01: RAG 引擎稳定性修复 — 增量索引修复 + Embedding 维度校验 — 开发方案

> **文档职责**：本文档定义**怎么做、为什么这么做、实际做成什么样**（HOW），不含产品目标与测试用例。

> 来源 PRD：[05-需求-RAG引擎.md](../../prds/2026-09/05-需求-RAG引擎.md)
> 需求编号：YA-09-01 · 优先级：P0 · 人天：3.0d · 状态：已完成

---

<a id="sec-1"></a>
## 一、问题背景

七月 RAG 引擎存在两个影响稳定性的问题：

| 问题 | 根因 | 影响 |
|------|------|------|
| 增量索引不完整 | Watcher 触发 `build_file_index` 时未处理部分失败 | 索引与实际文件不一致 |
| Embedding 维度不匹配 | 切换模型后旧索引维度与新模型不兼容 | 检索失败 |

---

<a id="sec-2"></a>
## 二、修复方案

### 2.1 增量索引原子性

```python
async def build_file_index(file_paths: list[str]):
    try:
        for path in file_paths:
            await _index_single(path)
        await _persist_index()
    except Exception:
        await _rollback_index()  # 回滚到上一个快照
        raise
```

### 2.2 Embedding 维度校验

```python
async def get_kb_index():
    index = await _load_or_create_index()
    expected_dim = _get_embedding_dim(settings.rag_embed_model)
    if index.dimension != expected_dim:
        logger.warning(f"Dimension mismatch: {index.dimension} vs {expected_dim}, rebuilding")
        index = await _rebuild_index()
    return index
```

---

<a id="sec-3"></a>
## 三、实施步骤

| 步骤 | 内容 | 验证 | 人天 |
|------|------|------|------|
| 1 | 增量索引回滚机制 | 部分失败后索引回退到上一个完整状态 | 1.0 |
| 2 | Embedding 维度校验 + 自动重建 | 切换模型后自动重建索引 | 1.0 |
| 3 | 错误日志增强 + 测试 | 失败原因可追溯 | 1.0 |

**合计：3.0d**。

---

<a id="sec-4"></a>
## 四、关联模块

- 依赖：[YA-07-01 混合检索引擎](../2026-07/01-prd-task-混合检索引擎.md)
- 依赖：[YA-07-02 知识库监听器](../2026-07/02-prd-task-知识库监听器.md)
- 参考：[Ollama Embedding 维度不匹配](../../bugs/2026-09/大模型/01-模型-Ollama-Embedding维度不匹配.md)

---

## 已知缺口与技术债

### 功能缺口

| # | 缺口 | 影响 | 建议 |
|---|------|------|------|
| — | 无 | — | — |

### 技术债

| # | 技术债 | 优先级 | 预计人天 | 说明 | 状态 |
|---|--------|--------|---------|------|------|
| 1 | 索引回滚依赖文件系统快照 | P2 | 0.3 | 快照损坏时无法回滚 | 待实施 |
| 2 | 维度校验仅在加载时检查 | P3 | 0.1 | 运行时切换模型不触发重建 | 待实施 |
