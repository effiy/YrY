---

doc_type: test
title: "YA-09-01: RAG 引擎稳定性修复 — 测试规格"
status: 已完成
priority: P0
owner: 陈铭
roles: [engineer, qa]
created: 2026-09-11
updated: 2026-09-23
project: YiAi
project_id: yiai
prd_month: "202609"
prd_task_id: "YA-09-01"
source_prds: ["05-需求-RAG引擎"]
source_modules: ["05-prd-task-RAG引擎"]
source_okr: [yiai-001]

type: test
---

# YA-09-01: RAG 引擎稳定性修复 — 测试规格

> 来源 PRD：[05-需求-RAG引擎.md](../../prds/2026-09/05-需求-RAG引擎.md)
> 开发方案：[05-prd-task-RAG引擎.md](../../devs/2026-09/05-prd-task-RAG引擎.md)
> 需求编号：YA-09-01 · 优先级：P0

> **文档职责**：本文档定义**怎么验证**（VERIFY）。覆盖增量索引回滚、Embedding 维度校验、静默失败消除。

---

<a id="sec-scope"></a>
## 一、测试范围与策略

### 1.1 测试分层

| 层级 | 描述 | 工具 | 覆盖目标 |
|------|------|------|---------|
| L1 单元测试 | 纯函数/类级，mock 外部依赖 | pytest + unittest.mock | `refresh_index` 逐个 insert 逻辑、`load_index` 维度校验、`DimensionMismatchError` 异常 |
| L2 集成测试 | 真实文件系统 + llama_index + MongoDB test db | pytest-asyncio + motor + tmp_path | 增量索引端到端、Embedding 模型切换、现有测试回归 |
| L4 性能基准 | 索引构建性能测量 | pytest + time.perf_counter | 增量索引延迟、全量重建对比 |

### 1.2 核心缺陷覆盖

| 缺陷 | 严重程度 | 修复前行为 | 修复后预期 |
|------|----------|-----------|-----------|
| `insert_documents` 方法不存在 | 高 | AttributeError，增量索引失败 | 逐个 `insert(doc)`，日志显示 inserted/deleted/errors |
| Embedding 维度不匹配 | 高 | 静默返回空结果 | DimensionMismatchError + 明确提示重建 |
| 静默失败无告警 | 中 | ERROR 日志未被告警系统捕获 | 结构化日志 + 可配置告警 |

### 1.3 测试环境要求

```yaml
Python: 3.10+
llama_index: 0.13.x
Ollama: nomic-embed-text (768d), mxbai-embed-large (1024d)
pytest: 8.x + pytest-asyncio
tmp_path: 内置（无需额外安装）
```

---

<a id="sec-fixtures"></a>
## 二、测试数据与 Fixtures

```python
import pytest
import pytest_asyncio
from pathlib import Path
from unittest.mock import MagicMock, AsyncMock, patch

@pytest.fixture
def sample_documents():
    """5 个模拟 Document 对象——代表知识库中变更的文件。"""
    from llama_index.core.schema import Document
    return [
        Document(text="文档内容 1", metadata={"file_path": "test/doc1.md"}),
        Document(text="文档内容 2", metadata={"file_path": "test/doc2.md"}),
        Document(text="文档内容 3", metadata={"file_path": "test/doc3.md"}),
        Document(text="文档内容 4", metadata={"file_path": "test/doc4.md"}),
        Document(text="文档内容 5", metadata={"file_path": "test/doc5.md"}),
    ]

@pytest.fixture
def mock_vector_store_index():
    """mock llama_index VectorStoreIndex——用于单元测试。"""
    mock = MagicMock()
    mock.insert = MagicMock()  # 单个 insert
    mock.storage_context = MagicMock()
    mock.storage_context.persist = MagicMock()
    return mock

@pytest.fixture
def mock_embed_model_768():
    """Mock 768 维 Embedding 模型。"""
    model = MagicMock()
    model.embed_dim = 768
    return model

@pytest.fixture
def mock_embed_model_1024():
    """Mock 1024 维 Embedding 模型。"""
    model = MagicMock()
    model.embed_dim = 1024
    return model

@pytest.fixture
def dimension_mismatch_config():
    """维度不匹配场景的配置。"""
    return {
        "old_index_dim": 768,
        "new_embed_dim": 1024,
        "old_model": "nomic-embed-text",
        "new_model": "mxbai-embed-large",
    }

@pytest.fixture
def test_knowledge_files(tmp_path):
    """在临时目录中创建模拟知识库文件。"""
    knowledge_dir = tmp_path / "YiKnowledge"
    knowledge_dir.mkdir()
    for i in range(5):
        file_path = knowledge_dir / f"test-doc-{i}.md"
        file_path.write_text(f"""---
title: "测试文档 {i}"
tags: [test]
category: "测试"
created: 2026-09-23
updated: 2026-09-23
source: internal
type: test
status: stable
---

# 测试文档 {i}

这是测试文档 {i} 的正文内容，用于验证增量索引功能。
""")
    return knowledge_dir

@pytest.fixture
def failing_document():
    """模拟写入磁盘失败的文档。"""
    from llama_index.core.schema import Document
    return Document(text="失败文档", metadata={"file_path": "test/fail.md"})
```

---

<a id="sec-cases"></a>
## 三、详细测试用例

### 3.1 增量索引修复

| ID | 用例名称 | 前置条件 | 测试步骤 | 预期结果 | 优先级 |
|----|---------|---------|---------|---------|--------|
| TC-RG-01 | 增量索引——5 文件全部成功 | Mock VectorStoreIndex | 1. 调用 `refresh_index(docs)` with 5 documents<br>2. 检查 `mock_index.insert` 调用次数<br>3. 检查 `storage_context.persist` 调用 | insert 调用 5 次，persist 调用 1 次，日志 `inserted=5, deleted=0, errors=0` | P0 |
| TC-RG-02 | 增量索引——部分失败回滚 | 第 3 个文档 insert 抛异常 | 1. 执行 `refresh_index` 含 5 文档<br>2. 第 3 个 `insert` 抛 RuntimeError<br>3. 检查索引状态 | 索引回滚到刷新前快照状态，日志 `errors=1` | P0 |
| TC-RG-03 | 增量索引——全部失败保护 | 所有 insert 均失败 | 1. `mock_index.insert` 始终抛异常<br>2. 执行刷新 | 索引保持旧状态不变，日志 `errors=5, inserted=0` | P0 |
| TC-RG-04 | 增量索引——空文档列表 | docs=[] | 1. 调用 `refresh_index([])` | 无操作，日志 `inserted=0, deleted=0, errors=0` | P1 |
| TC-RG-05 | 增量索引——0 文档场景 | Knowledge Watcher 检测到无变更 | 1. 不触发 `refresh_index` | 不调用 insert，索引保持不变 | P2 |
| TC-RG-06 | persist 失败处理 | `storage_context.persist()` 抛 IOError | 1. 所有 insert 成功<br>2. persist 失败 | 日志 ERROR 记录 persist 失败，insert 的数据可能在下次启动时丢失 | P1 |

### 3.2 Embedding 维度校验

| ID | 用例名称 | 前置条件 | 测试步骤 | 预期结果 | 优先级 |
|----|---------|---------|---------|---------|--------|
| TC-RG-07 | 维度一致——正常加载 | 索引维度 768 = 模型维度 768 | 1. 调用 `load_index()`<br>2. 检查返回值 | 返回已有索引，无异常 | P0 |
| TC-RG-08 | 维度不一致——明确报错 | 索引维度 768 != 模型维度 1024 | 1. 调用 `load_index()`<br>2. 检查异常类型 | 抛出 `DimensionMismatchError`，消息含 `old_dim=768, new_dim=1024` | P0 |
| TC-RG-09 | 维度不一致——重建引导 | 抛出 DimensionMismatchError | 1. 服务启动检测维度不匹配<br>2. 检查健康检查端点 | `/health` 返回 unhealthy，提示"请重建索引" | P0 |
| TC-RG-10 | 启动时维度检测触发 | 服务启动流程 | 1. 修改 embed_model 配置<br>2. 重启服务<br>3. 检查启动日志 | 启动日志包含维度检测结果，不匹配时阻止 RAG 可用 | P0 |
| TC-RG-11 | 首次启动无旧索引 | data/rag_store/ 为空 | 1. 调用 `load_index()`<br>2. 检查行为 | 跳过维度校验，正常构建新索引 | P2 |

### 3.3 调试操作

| ID | 用例名称 | 前置条件 | 测试步骤 | 预期结果 | 优先级 |
|----|---------|---------|---------|---------|--------|
| TC-RG-12 | 维度不匹配时 rag_build 可用 | 维度不匹配状态 | 1. 调用 `rag_build` API<br>2. 检查重建结果 | 触发全量重建，重建后检索正常 | P1 |
| TC-RG-13 | 重启后 RAG 检索恢复正常 | 修复增量索引后重启 | 1. 重启服务<br>2. 调用 `rag_query` 验证 | 返回非空结果，`total > 0` | P0 |

---

<a id="sec-edge"></a>
## 四、边界与异常测试

| ID | 用例名称 | 输入/场景 | 预期行为 | 优先级 |
|----|---------|---------|---------|--------|
| EG-RG-01 | 文件内容为空 | 空 .md 文件 | 不抛异常，insert 空文档的 embedding | P2 |
| EG-RG-02 | 超大文件（> 100MB） | 100MB markdown 文件 | 分块处理，不 OOM | P1 |
| EG-RG-03 | 文件名含特殊字符 | `test:doc?.md` | 正常处理，路径转义 | P2 |
| EG-RG-04 | 并发两个 refresh_index | 两个 Watcher 同时触发 | 索引一致性保证，无竞争条件 | P1 |
| EG-RG-05 | Ollama 不可用时增量索引 | Ollama 服务宕机 | 索引更新失败，日志记录错误，已有索引不变 | P1 |
| EG-RG-06 | 索引文件损坏 | data/rag_store/ 文件损坏 | load_index 抛明确异常，提示重建 | P1 |

---

<a id="sec-regression"></a>
## 五、回归测试

| ID | 回归场景 | 触发条件 | 验证目标 | 优先级 |
|----|---------|---------|---------|--------|
| RG-RG-01 | 全量索引重建不受影响 | 修复增量索引后调用 `rag_build` | build 行为不变，索引文档数正确 | P0 |
| RG-RG-02 | 现有 RAG 查询不受影响 | 增量索引修复后调用 `rag_query` | 查询结果质量不退化 | P0 |
| RG-RG-03 | Knowledge Watcher 轮询正常 | 修复后 Watcher 继续检测文件变更 | 轮询间隔不变，变更检测正确 | P1 |

---

<a id="sec-traceability"></a>
## 六、可追溯性矩阵

| PRD 功能需求 | 对应测试用例 | 覆盖率 |
|-------------|------------|--------|
| FR1: 增量索引逐个 insert 修复 | TC-RG-01 ~ TC-RG-06 | 全成功 + 部分失败 + 全部失败 + 不操作 |
| FR2: Embedding 维度启动时检测 | TC-RG-07 ~ TC-RG-11 | 一致/不一致/首次启动/重建引导 |
| FR3: 静默失败消除 | TC-RG-08, TC-RG-12, TC-RG-13 | 错误传播 + 重建后验证 |
| 决策1: 逐个 insert 而非批量 API | TC-RG-01, TC-RG-02 | 兼容性验证 |
| 决策2: 启动时全量检测 | TC-RG-09, TC-RG-10 | 启动即检测 |
| 决策3: 明确报错策略 | TC-RG-08 | DimensionMismatchError |

---

<a id="sec-gaps"></a>
## 七、覆盖缺口

| 缺口 | 影响 | 建议 |
|------|------|------|
| 真实 Ollama 多模型切换测试 | Mock 测试无法完全模拟真实 embedding 维度差异 | 添加在线 E2E 测试——实际切换模型后验证 |
| 索引迁移兼容性 | llama_index 版本升级时索引持久化格式可能变化 | 添加跨版本索引加载兼容性测试 |
| 大文件分块处理 | >100MB 文件的分块行为未测试 | 添加大文件增量索引性能测试 |
| 生产日志告警集成 | 结构化日志告警系统未端到端验证 | 添加日志采集→告警触发集成测试 |