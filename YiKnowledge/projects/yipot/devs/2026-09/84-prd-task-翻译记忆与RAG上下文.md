---

doc_type: module
prd_task_id: "YP-09-53-4"
title: "YiAi 翻译记忆 + RAG 上下文增强 — 开发方案"
status: 已完成
priority: P0
owner: Chengliang.Yi
roles: [engineer]
created: 2026-09-23
updated: 2026-09-23
project: YiPot
project_id: yipot
prd_month: "202609"
estimate_backend: 0.5
source_prd: "53-prd-YiAi后端集成.md"
parent_module: "YP-09-53"
related_tests: ["YP-09-53"]

type: task
---

# YiAi 翻译记忆 + RAG 上下文增强 — 开发方案

> 来源 PRD：[53-prd-YiAi后端集成.md](../../prds/2026-09/53-prd-YiAi后端集成.md) · 父模块：[80-prd-task-YiAi后端集成.md](./80-prd-task-YiAi后端集成.md)

---

## 源码索引

| 文件 | 说明 | 行数 |
|------|------|------|
| `YiAi/src/services/translation/memory_service.py` | 翻译记忆缓存（lookup/store/search/stats） | 80 |
| `YiAi/src/services/translation/context_service.py` | RAG 上下文增强翻译 | 75 |

---

## 一、翻译记忆缓存

### 1.1 数据模型

```json
// MongoDB collection: translation_memory
{
  "text_hash": "a1b2c3d4e5f6g7h8",  // SHA256(text + from_lang + to_lang)[:16]
  "source": "Hello world",           // 原文
  "target": "你好世界",               // 译文
  "from_lang": "en",                 // 源语言
  "to_lang": "zh",                   // 目标语言
  "provider": "openai",              // 翻译引擎
  "created_at": "2026-09-23T10:00:00Z",
  "updated_at": "2026-09-23T10:00:00Z"
}
```

### 1.2 核心 API

```python
# 查找缓存
async def lookup(text: str, from_lang: str, to_lang: str) -> dict | None:
    text_hash = _hash(text + from_lang + to_lang)
    doc = await db.db[COLLECTION].find_one({"text_hash": text_hash})
    if doc:
        doc["hit"] = True
        return doc
    return None

# 存储结果（upsert — 最新翻译覆盖旧结果）
async def store(text, from_lang, to_lang, result, provider):
    text_hash = _hash(text + from_lang + to_lang)
    await db.db[COLLECTION].update_one(
        {"text_hash": text_hash},
        {"$set": {"source": text, "target": result, ...},
         "$setOnInsert": {"created_at": datetime.now(timezone.utc)}},
        upsert=True,
    )

# 前缀搜索（输入联想）
async def search_by_prefix(prefix, from_lang, to_lang, limit=10):
    cursor = db.db[COLLECTION].find(
        {"source": {"$regex": f"^{prefix}", "$options": "i"},
         "from_lang": from_lang, "to_lang": to_lang},
    ).sort("updated_at", -1).limit(limit)
    return await cursor.to_list(length=limit)

# 统计信息
async def stats():
    total = await db.db[COLLECTION].count_documents({})
    langs = await db.db[COLLECTION].aggregate([
        {"$group": {"_id": "$from_lang", "to_languages": {"$addToSet": "$to_lang"}}},
    ]).to_list(None)
    return {"total": total, "languages": langs, ...}
```

### 1.3 缓存策略

| 维度 | 策略 | 理由 |
|------|------|------|
| 缓存键 | `SHA256(text + from_lang + to_lang)[:16]` | 碰撞概率极低，索引高效 |
| 更新策略 | Upsert（最新覆盖） | 翻译结果以最新调用为准 |
| 生命周期 | 永久保留 | 翻译是确定性操作，结果不会过期 |
| LLM 豁免 | `use_memory=False` 跳过缓存 | 非确定性输出，用户可能想重新生成 |
| 清理方式 | 手动调用 / TTL 索引可选 | 避免自动过期导致缓存命中率下降 |

### 1.4 集成点

`translate_service.translate()` 中的集成逻辑：

```python
# 1. 翻译前：检查缓存
if use_memory:
    cached = await memory_service.lookup(text, from_lang, to_lang)
    if cached and len(selected) <= 1:
        return [{"provider": cached["provider"], "text": cached["target"], "cached": True}]

# 2. 翻译后：存储结果
if use_memory and entry["text"] and not entry.get("error"):
    await memory_service.store(text, from_lang, to_lang, entry["text"], entry["provider"])
```

---

## 二、RAG 上下文增强翻译

### 2.1 核心流程

```python
async def translate_with_context(text, from_lang, to_lang, provider,
                                  domain=None, context=None, **config):
    # 1. 查询 RAG（如果指定 domain）
    rag_context = ""
    if domain:
        rag_context = await _fetch_rag_context(text, domain)

    # 2. 构建增强 system prompt
    system_parts = [
        "You are a professional translation engine. Translate the text "
        "into a colloquial, professional, elegant and fluent content, "
        "without the style of machine translation."
    ]
    if rag_context:
        system_parts.append(f"\nDomain-specific terminology and context:\n{rag_context}")
    if context:
        system_parts.append(f"\nAdditional context:\n{context}")

    # 3. 注入到 Provider 配置
    enhanced_config = dict(config)
    enhanced_config["prompt_list"] = [
        {"role": "system", "content": "\n".join(system_parts)},
        {"role": "user", "content": f"Translate into {to_lang}:\n\"\"\"\n{text}\n\"\"\""},
    ]

    return await provider.translate(text, from_lang, to_lang, **enhanced_config)
```

### 2.2 RAG 查询

```python
async def _fetch_rag_context(text: str, domain: str, max_sources: int = 3) -> str:
    from domain.rag.engine import rag_query
    results = rag_query(f"Terminology and definitions related to: {text}",
                        scope=f"projects/{domain}" if domain != "all" else None,
                        top_k=max_sources)
    context_parts = []
    for r in results[:max_sources]:
        snippet = r.get("text", "")[:300]
        path = r.get("file_path", "")
        if snippet:
            context_parts.append(f"- {snippet}" + (f" (from {path})" if path else ""))
    return "\n".join(context_parts) if context_parts else ""
```

### 2.3 使用场景

| Domain | 知识范围 | 典型场景 |
|--------|---------|---------|
| `yiai` | YiAi 后端开发文档 | 翻译 API 文档、错误消息 |
| `yivad` | YiVad 管理后台文档 | 翻译 UI 文本、表单标签 |
| `yipet` | YiPet 扩展文档 | 翻译浏览器扩展文案 |
| `all` | 全部 YiKnowledge | 通用技术文档翻译 |

### 2.4 降级策略

```
RAG 查询 → 成功 → 上下文注入 system prompt → 增强翻译
         → 失败 → logger.warning() → 降级为普通翻译（无上下文）
```

RAG 查询失败不影响翻译功能——用户仍能获得翻译结果，只是没有领域术语增强。

---

## 三、翻译记录与分析

### 3.1 记录存储

```python
# MongoDB collection: translation_records
{
  "source": "Hello world",
  "from_lang": "en",
  "to_lang": "zh",
  "results": ["你好世界", "你好，世界"],  # 多引擎结果
  "source_length": 11,
  "created_at": "2026-09-23T10:00:00Z"
}
```

### 3.2 分析接口

```python
async def translation_analytics(days: int = 30) -> dict:
    cutoff = datetime.now(timezone.utc).timestamp() - days * 86400
    total = await db.db[COLLECTION].count_documents({
        "created_at": {"$gte": datetime.fromtimestamp(cutoff, tz=timezone.utc)}
    })
    # 按目标语言聚合
    pipeline = [
        {"$match": {"created_at": {"$gte": ...}}},
        {"$group": {"_id": "$to_lang", "count": {"$sum": 1},
                    "total_chars": {"$sum": "$source_length"}}},
    ]
    by_lang = await db.db[COLLECTION].aggregate(pipeline).to_list(None)
    return {"total_translations": total, "by_target_language": [...], ...}
```

**供 YiVad Dashboard 使用**：`GET /` 或 RPC `services.translation.translate_service.translation_analytics` → 展示翻译统计图表。

---

## 四、实施进度

| 模块 | 功能 | 依赖 | 状态 |
|------|------|------|------|
| memory_service | lookup / store / search / stats | MongoDB `translation_memory` | ✅ |
| context_service | translate_with_context / _fetch_rag_context | domain.rag.engine | ✅ |
| translate_service | 集成 memory lookup + store + _log_record | memory_service + MongoDB | ✅ |