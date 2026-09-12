---
title: "LLM: Ollama 模型切换后 Embedding 维度不匹配导致 RAG 检索返回空"
tags:
- ollama
- embedding
- dimension-mismatch
- model-switch
- rag
category: projects/yiai/bugs/llm
created: 2026-09-03
updated: 2026-09-10
source: internal
type: bug
status: resolved
severity: major
priority: p1
project: YiAi
module: domain/rag/embedder.py, domain/rag/indexer.py, config.py
reporter: Claude
environment: macOS / Python 3.10+ / Ollama 0.5+
affected_version: main (pre-fix)
fixed_version: main (post-fix 2026-09-03)
frequency: always (after model switch)
---

## Description

当 Ollama 的 Embedding 模型从 `nomic-embed-text`（768 维）切换到 `mxbai-embed-large`（1024 维）后，已构建的 RAG 向量索引中的向量维度为 768，但新模型生成的查询向量维度为 1024。`llama_index` 在执行向量相似度检索时，因维度不匹配抛出异常，导致所有 RAG 查询返回空结果。

**日志表现：**
```
ValueError: shapes (1,1024) and (768,) not aligned: 1024 (dim 1) != 768 (dim 0)
```

**影响：**
- YiVad AI Chat 的 RAG 模式返回 "No relevant documents found"
- YiVad Knowledge 页面的语义搜索无结果
- YiPet 聊天窗口的知识库检索失败
- 用户无感知——前端仅显示空结果，无错误提示

## Steps to Reproduce

1. 使用 `nomic-embed-text` 模型构建 RAG 索引（向量维度 768）
2. 修改 `config.py` 中的 `EMBED_MODEL` 为 `mxbai-embed-large`
3. 重启 YiAi 后端
4. 在 YiVad AI Chat 中开启 RAG 模式，发送消息
5. 观察 RAG 引用区——始终为空
6. 检查 YiAi 日志——`ValueError: shapes not aligned`

## Expected Result

切换 Embedding 模型后，系统应检测到向量维度变化，自动触发索引重建，或提示管理员手动重建索引。

## Actual Result

`llama_index` 在 `VectorStoreIndex.query()` 时抛出维度不匹配异常，异常被 `rag_service` 的通用 `except Exception` 捕获，静默返回空结果列表。

## Root Cause

### 1. 无维度校验

`embedder.py` 在初始化时未记录当前 Embedding 模型的向量维度，`indexer.py` 在加载已有索引时未校验索引中的向量维度是否与当前模型匹配。

```python
# domain/rag/embedder.py:42 — 修复前
class Embedder:
    def __init__(self, model_name: str):
        self.model_name = model_name
        self.embed_model = OllamaEmbedding(model_name=model_name)
        # 未记录向量维度
```

### 2. 异常被静默吞没

```python
# domain/rag/rag_service.py:89 — 修复前
try:
    nodes = await self.index.asimilarity_search(query, top_k=top_k)
except Exception as e:
    logger.error(f"RAG query failed: {e}")
    nodes = []  # 静默返回空
```

## Fix

### 1. 向量维度检测与校验

```python
# domain/rag/embedder.py
class Embedder:
    def __init__(self, model_name: str):
        self.model_name = model_name
        self.embed_model = OllamaEmbedding(model_name=model_name)
        # 探测向量维度
        test_embedding = self.embed_model.get_text_embedding("test")
        self.dimension = len(test_embedding)
        logger.info(f"Embedding model '{model_name}' dimension: {self.dimension}")
```

### 2. 索引加载时维度校验

```python
# domain/rag/indexer.py
def load_index(self, embedder: Embedder) -> VectorStoreIndex:
    index = load_index_from_storage(self.storage_context)
    # 校验维度
    index_dim = index.vector_store.dimension
    if index_dim != embedder.dimension:
        raise DimensionMismatchError(
            f"Index dimension ({index_dim}) does not match "
            f"embedding model '{embedder.model_name}' dimension ({embedder.dimension}). "
            f"Please rebuild the index."
        )
    return index
```

### 3. RAG 查询异常分类处理

```python
# domain/rag/rag_service.py
try:
    nodes = await self.index.asimilarity_search(query, top_k=top_k)
except DimensionMismatchError as e:
    logger.error(f"RAG dimension mismatch: {e}")
    raise HTTPException(status_code=500, detail="RAG index needs rebuild — embedding model changed")
except Exception as e:
    logger.error(f"RAG query failed: {e}")
    nodes = []
```

## Verification

- 切换 Embedding 模型后启动 YiAi → 启动时抛出 `DimensionMismatchError`，提示管理员重建索引
- 使用相同模型重启 → 无异常，RAG 检索正常
- `rag_service` 维度不匹配异常返回 HTTP 500 + 明确错误信息，前端可展示 "索引需要重建" 提示
- 其他异常（如网络超时）仍静默降级，返回空结果

## Prevention

- **配置层面：** 在 `config.py` 中记录 `EMBED_MODEL` 和 `EMBED_DIMENSION`，变更时触发索引重建标记
- **部署层面：** 切换 Embedding 模型时，部署脚本 MUST 包含索引重建步骤
- **监控层面：** 添加 RAG 查询结果为空的比例监控，比例异常升高时告警
- **文档层面：** 在 [RAG 集成](../specs/rag-integration.md) 中记录 Embedding 模型切换的标准操作流程

## 影响范围

- **影响模块**：domain/rag/embedder.py, domain/rag/indexer.py, config.py
- **涉及文件**：
- `indexer.py`
- `config.py`
- `embedder.py`
- **是否影响 API 契约**：否
- **是否影响其他项目（YiVad/YiPet）**：否
- **用户感知**：待确认

## 经验教训

1. **根本原因**：开发过程中对边界情况和异常路径的考虑不足是此类问题的共同根因
2. **设计阶段**：在接口设计和模块实现时，应主动考虑异常输入、空值、超时等边界场景
3. **代码审查**：审查时应检查是否存在类似的反模式（如未捕获异常、无超时控制、缺少参数校验等）
4. **测试覆盖**：异常路径的测试覆盖率应与正常路径同等重视
5. **团队分享**：此类问题应在团队周会或技术分享中讨论，形成团队共识
