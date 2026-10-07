---

doc_type: module
prd_task_id: "YA-09-71"
title: "YA-09-71: 模型注册与版本管理 — LLM 模型元数据与热切换 — 开发方案"
status: 需求已编写
priority: P2
owner: 陈铭
roles: [engineer]
created: 2026-09-11
updated: 2026-09-23
project: YiAi
project_id: yiai
prd_month: "202609"
estimate_frontend: 4.0
source_prd: "172-需求-模型注册与版本管理.md"
source_okr: [yiai-001]
related_tests: ["172-prd-test-模型注册与版本管理"]

type: task
---

# YA-09-71: 模型注册与版本管理 — LLM 模型元数据与热切换 — 开发方案

> 来源 PRD：[172-需求-模型注册与版本管理.md](../../prds/2026-09/172-需求-模型注册与版本管理.md)
> 需求编号：YA-09-71 · 优先级：P2 · 人天：4.0d

---

<a id="sec-1"></a>
## 一、问题

当前 Ollama 模型通过 `config.yaml` 直接引用模型名字符串，无版本概念。模型更新（如 `qwen2.5:7b → qwen2.5:7b-v2`）需手动修改配置并重启。

**目标**: 模型注册表 + 别名 + 热切换，无需重启。

---

<a id="sec-2"></a>
## 二、方案

### 2.1 数据模型

```python
# MongoDB collection: model_registry
{
    "_id": "qwen2.5-7b-v2",
    "name": "qwen2.5",
    "version": "7b-v2",
    "provider": "ollama",
    "parameters": "7B",
    "context_length": 32768,
    "capabilities": ["chat", "rag", "agent"],
    "status": "active",  # active | deprecated | disabled
    "aliases": ["production"],
    "performance": {
        "avg_latency_ms": 850,
        "tokens_per_second": 45,
        "error_rate": 0.001
    },
    "created_at": "2026-09-15T00:00:00Z"
}
```

### 2.2 模型解析器

```python
# domain/llm/model_registry.py
class ModelRegistry:
    def __init__(self, db, ollama_client):
        self._db = db
        self._ollama = ollama_client
        self._alias_cache: dict[str, str] = {}

    async def resolve(self, model_ref: str) -> str:
        """解析模型引用 → 实际模型名。
        支持：直接名称 "qwen2.5:7b"、别名 "production"、版本 "qwen2.5:latest""""
        # 检查别名缓存
        if model_ref in self._alias_cache:
            return self._alias_cache[model_ref]

        # 查询注册表
        doc = await self._db.model_registry.find_one({
            "$or": [
                {"_id": model_ref},
                {"aliases": model_ref}
            ]
        })
        if doc:
            resolved = f"{doc['name']}:{doc['version']}"
            self._alias_cache[model_ref] = resolved
            return resolved

        # 回退：直接使用原始引用
        return model_ref

    async def hot_swap_alias(self, alias: str, new_model_id: str):
        """热切换别名指向新模型，无需重启."""
        # 移除旧别名
        await self._db.model_registry.update_many(
            {"aliases": alias}, {"$pull": {"aliases": alias}}
        )
        # 添加新别名
        await self._db.model_registry.update_one(
            {"_id": new_model_id}, {"$addToSet": {"aliases": alias}}
        )
        # 清除缓存
        self._alias_cache.pop(alias, None)
```

### 2.3 模型性能追踪

```python
async def track_inference(model: str, latency_ms: float, tokens: int, error: str = None):
    await db.model_registry.update_one(
        {"_id": model},
        {"$push": {
            "inference_log": {
                "latency_ms": latency_ms, "tokens": tokens,
                "error": error, "timestamp": datetime.utcnow()
            }
        }},
        upsert=True
    )
```

---

<a id="sec-3"></a>
## 三、实施步骤

| # | 步骤 | 验证 | 人天 |
|---|------|------|------|
| 1 | MongoDB schema + `ModelRegistry` CRUD | 注册/查询/别名解析 | 1.0 |
| 2 | 集成到 `chat/rag/agent` 服务（替换硬编码模型名） | 所有端点使用 `registry.resolve(model)` | 1.0 |
| 3 | 热切换 API + 别名管理 | `POST /models/hot-swap` → 即时生效 | 1.0 |
| 4 | 性能追踪 + 日志 | 每次推理自动记录延迟/token | 0.5 |
| 5 | YiVad 管理界面：模型列表/别名/性能图表 | 前端可操作模型别名和查看性能 | 0.5 |

**合计：4.0d**

---

<a id="sec-4"></a>
## 四、回滚

- 模型解析器 fallback 到原始引用，注册表故障不影响推理
- 热切换仅修改别名映射，不删除模型数据
- `config.yaml: model_registry.enabled = false` 回退到直接模型名引用