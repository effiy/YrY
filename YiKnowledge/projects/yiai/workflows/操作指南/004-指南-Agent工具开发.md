---
title: Agent 工具开发指南
tags: [yiai, agent, tool, development, debug]
category: projects/yiai/workflows
created: 2026-09-15
updated: 2026-09-15
source: internal
type: howto
status: stable
lifecycle: active
review_cycle: monthly
roles: [engineer, aier]
benefit: "在 YiAi Agent 中开发、注册、调试工具的完整实操指南"
---

# Agent 工具开发指南

> **读完你将能够**：在 YiAi Agent 中开发、注册、调试工具的完整实操指南

> 如何给 YiAi Agent 添加新工具：接口契约、注册流程、确认门控、调试方法、常见陷阱。

## 一、工具接口契约

每个 Agent 工具是一个 async 函数，签名为：

```python
async def tool_name(**kwargs) -> dict:
    """工具描述（LLM 通过此描述决定何时调用）"""
    return {"result": "..."}
```

**必须遵守的契约：**

| 规则 | 说明 |
|------|------|
| 返回值必须是 `dict` | Agent 循环依赖 dict 类型做结果裁剪和序列化 |
| 使用 `**kwargs` | 参数由 LLM 动态决定，不用固定签名 |
| docstring 是工具的"说明书" | LLM 根据 docstring 决定调用时机和参数 |
| 错误用 `BusinessException` | 不要 `return {"error": "..."}` ，Agent 无法识别 |
| 大结果设置 `_truncate_hint` | 超过 6000 字符的结果会被裁剪，可提前告知 |

## 二、注册工具

在 `domain/ai/tools.py` 的 `ToolRegistry` 中注册：

```python
# domain/ai/tools.py
from domain.ai.tools import ToolRegistry, ToolMeta

class ToolRegistry:
    _tools: dict[str, ToolMeta] = {}

    @classmethod
    def register(cls, name: str, fn, meta: ToolMeta):
        cls._tools[name] = ToolMeta(fn=fn, **meta)

# 注册新工具
ToolRegistry.register(
    name="db_search",
    fn=search_documents,
    meta=ToolMeta(
        description="搜索文档内容，支持关键词和正则",
        requires_confirmation=False,   # 读操作不需要确认
        category="database",
    )
)
```

### ToolMeta 字段

| 字段 | 类型 | 说明 |
|------|------|------|
| `description` | `str` | LLM 看到的工具描述，决定调用时机 |
| `requires_confirmation` | `bool` | 写操作设为 `True`，需用户确认才执行 |
| `category` | `str` | 分组（`database`, `file`, `knowledge`, `system`） |
| `is_destructive` | `bool` | 标记为破坏性操作，Agent 会更谨慎 |

## 三、确认门控模式

写操作工具必须设置 `requires_confirmation=True`：

```python
async def db_create(cname: str, data: dict) -> dict:
    """在数据库中创建文档。cname: 集合名, data: 文档数据"""
    # 参数校验
    if not cname or not data:
        raise BusinessException(ErrorCode.INVALID_PARAMS, "cname 和 data 必填")

    doc_id = await db.insert_one(cname, data)
    return {"inserted_id": doc_id, "cname": cname}


ToolRegistry.register(
    name="db_create",
    fn=db_create,
    meta=ToolMeta(
        description="创建数据库文档",
        requires_confirmation=True,   # 写操作 = 必须确认
        is_destructive=False,
        category="database",
    )
)
```

### 确认流程

```
Agent 决定调用 db_create
  → 发送 confirmation_required 事件给前端
  → 前端展示确认对话框（120s 超时自动拒绝）
  → 用户确认/拒绝
  → 确认：执行工具 → 返回结果
  → 拒绝：记录到拒绝记忆 → Agent 重新规划（同 session 内自动拦截）
```

## 四、完整示例：添加搜索工具

### Step 1: 实现工具函数

```python
# domain/ai/tools/search_tools.py
import re
from data.database import db
from shared.exceptions import BusinessException
from shared.error_codes import ErrorCode

async def search_documents(query: str, cname: str = "knowledge_files", limit: int = 10) -> dict:
    """在指定集合中全文搜索文档。
    
    参数:
    - query: 搜索关键词
    - cname: 集合名称，默认 knowledge_files
    - limit: 返回数量上限，默认 10
    """
    if not query or len(query) < 2:
        raise BusinessException(ErrorCode.INVALID_PARAMS, "搜索词至少 2 个字符")

    # 使用 MongoDB 文本搜索
    try:
        results = await db.db[cname].find(
            {"$text": {"$search": query}},
            {"score": {"$meta": "textScore"}}
        ).sort([("score", {"$meta": "textScore"})]).limit(limit).to_list(limit)
    except Exception:
        # 回退到正则搜索
        pattern = re.compile(re.escape(query), re.IGNORECASE)
        results = await db.db[cname].find(
            {"$or": [
                {"title": pattern},
                {"content": pattern},
                {"tags": pattern},
            ]}
        ).limit(limit).to_list(limit)

    # 序列化 ObjectId
    for doc in results:
        if "_id" in doc:
            doc["_id"] = str(doc["_id"])

    return {
        "results": results,
        "total": len(results),
        "query": query,
    }
```

### Step 2: 注册

```python
# domain/ai/tools.py
from domain.ai.tools.search_tools import search_documents

ToolRegistry.register(
    name="search_docs",
    fn=search_documents,
    meta=ToolMeta(
        description="全文搜索知识库文档，支持关键词匹配",
        requires_confirmation=False,
        category="knowledge",
    )
)
```

### Step 3: 编写测试

```python
# tests/domain/ai/test_search_tools.py
import pytest
from unittest.mock import AsyncMock, patch
from domain.ai.tools.search_tools import search_documents
from shared.exceptions import BusinessException

@pytest.mark.asyncio
async def test_search_documents_success():
    mock_db = AsyncMock()
    mock_db.db = {"knowledge_files": AsyncMock()}
    mock_db.db["knowledge_files"].find.return_value.sort.return_value.limit.return_value.to_list = AsyncMock(
        return_value=[{"_id": "abc", "title": "测试文档", "content": "..."}]
    )

    with patch("domain.ai.tools.search_tools.db", mock_db):
        result = await search_documents(query="测试")

    assert result["total"] == 1
    assert result["results"][0]["title"] == "测试文档"

@pytest.mark.asyncio
async def test_search_documents_query_too_short():
    with pytest.raises(BusinessException):
        await search_documents(query="a")
```

## 五、调试工具

### 查看已注册工具

```bash
curl -X POST http://localhost:10086/ \
  -H "Content-Type: application/json" \
  -d '{
    "module_name": "services.ai.agent_service",
    "method_name": "list_tools",
    "parameters": {}
  }'
```

### 单步执行工具

```bash
# 直接调用工具，跳过 Agent 循环
curl -X POST http://localhost:10086/agent/tool-execute \
  -H "Content-Type: application/json" \
  -d '{"tool": "search_docs", "args": {"query": "RPC协议"}}'
```

### 查看 Agent 轨迹

```python
# 在 Agent 运行日志中查看工具调用序列
# 日志格式：
# [Agent] turn=1 tool_call=search_docs args={"query":"RPC协议"}
# [Agent] turn=1 tool_result={"total":3,...}
# [Agent] turn=2 tool_call=db_create args={...} confirmation=required
```

## 六、常见陷阱

| 陷阱 | 表现 | 修复 |
|------|------|------|
| 工具返回非 dict 类型 | Agent 崩溃 `AttributeError: 'str' object has no attribute 'get'` | 确保返回 `dict` |
| 忘记注册 `requires_confirmation` | 写操作不经确认直接执行 | 检查 ToolMeta |
| 工具 docstring 太简略 | LLM 不知道何时调用此工具 | docstring 说明触发条件、参数含义 |
| 工具执行超时无处理 | Agent 卡住，无响应 | 工具内部加 `asyncio.timeout` |
| 返回数据过大 | 结果被裁剪为 6000 字符，丢失信息 | 只返回关键字段，用 `fields` 参数控制 |
| ObjectId 未序列化 | `ObjectId not JSON serializable` | 返回前 `str(doc["_id"])` |
| 工具内直接 import 重量模块 | 每次调用都重复导入，拖慢 Agent | 在模块顶部 import |

## 七、工具设计原则

1. **单一职责** — 一个工具只做一件事。`search_docs` 只搜索，不顺便更新索引
2. **幂等性** — 读操作多次调用返回相同结果；写操作 `db_create` 可设唯一键防重复
3. **明确错误** — 用 `BusinessException` + 具体描述，不用裸 `Exception`
4. **参数校验前置** — 在工具函数开头校验，不在 Agent 循环中靠 LLM 保证
5. **结果精炼** — 返回 Agent 需要的信息，不返回整个 MongoDB 文档（排除 `_id`, `created_at` 等无用字段）