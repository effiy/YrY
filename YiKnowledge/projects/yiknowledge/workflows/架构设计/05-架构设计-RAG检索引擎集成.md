---
title: RAG 检索引擎集成
tags: [yiknowledge, rag, ai, llama-index, mongodb, watcher, hybrid-search, embedding]
category: projects/yiknowledge/specs
created: 2026-09-07
updated: 2026-09-10
source: YiKnowledge
type: architecture
status: active
---

# RAG 检索引擎集成

> YiKnowledge 作为 YiAi RAG 数据源的完整集成架构：Knowledge Watcher 轮询 → MongoDB 同步 → llama_index 索引 → 混合检索 → Agent 查询。涵盖变更检测、索引构建、检索策略、Scope 过滤、性能监控、故障处理、反模式。

## 一、数据集线

```
YiKnowledge（Markdown 文件树，1000+ 文件）
  │
  │ apscheduler 每 5s 轮询
  ▼
YiAi Knowledge Watcher（src/domain/knowledge/watcher.py）
  │
  │ 三步处理：
  │   Step 1: 遍历目录树，检测文件变更（新增/修改/删除）
  │   Step 2: 解析 YAML frontmatter → 结构化元数据
  │   Step 3: 提取正文 → 文本内容
  │
  ▼
MongoDB knowledge_files 集合
  │
  │ 字段：file_path, title, tags, category, status, content, roles, created, updated
  │
  ▼
llama_index 索引构建（src/domain/rag/builder.py）
  │
  │ VectorStoreIndex + BM25 混合索引
  │
  ▼
Vector Index（data/rag_store/）
  │
  │ 持久化到磁盘，启动时预加载
  │
  ▼
RAG 查询 → YiAi Agent → 用户
  │
  │ 混合检索：向量相似度 + BM25 关键词
  │ 可选增强：LLM Rerank + HyDE + Sentence Window
  │ 内联引用：[Source 1], [Source 2], ...
```

---

## 二、Knowledge Watcher（知识监视器）

### 轮询机制

```python
# src/domain/knowledge/watcher.py
from apscheduler.schedulers.asyncio import AsyncIOScheduler

scheduler = AsyncIOScheduler()
scheduler.add_job(
    scan_knowledge_base,
    trigger="interval",
    seconds=60,  # 可配置：knowledge.watcher_poll_seconds
    id="knowledge_watcher"
)
```

### 扫描流程

```python
async def scan_knowledge_base():
    """扫描 YiKnowledge 目录树，同步到 MongoDB"""
    base_dir = config.knowledge.base_dir  # "../YiKnowledge"

    # 1. 遍历目录树，收集所有 .md 文件
    disk_files = set()
    for root, dirs, files in os.walk(base_dir):
        for f in files:
            if f.endswith(".md"):
                rel_path = os.path.relpath(os.path.join(root, f), base_dir)
                disk_files.add(rel_path)

    # 2. 从 MongoDB 获取已有文件列表
    db_files = set()
    async for doc in db.find_many("knowledge_files", {}):
        db_files.add(doc["file_path"])

    # 3. 检测变更
    new_files = disk_files - db_files       # 新增
    deleted_files = db_files - disk_files   # 删除
    modified_files = set()
    for path in disk_files & db_files:
        disk_mtime = os.path.getmtime(os.path.join(base_dir, path))
        db_doc = await db.find_one("knowledge_files", {"file_path": path})
        if disk_mtime > db_doc.get("scanned_at", 0):
            modified_files.add(path)        # 修改

    # 4. 处理变更
    for path in new_files | modified_files:
        await process_file(path)            # 解析 frontmatter + 正文 → upsert
    for path in deleted_files:
        await db.delete_one("knowledge_files", {"file_path": path})
```

### 变更检测策略

| 检测类型 | 方法 | 时间复杂度 | 说明 |
|----------|------|-----------|------|
| 新增文件 | 目录树遍历 vs MongoDB 已有记录 | O(n) | 新文件路径不在 MongoDB 中 |
| 修改文件 | 文件 mtime vs MongoDB `scanned_at` 字段 | O(n) | mtime 更新则重新解析 |
| 删除文件 | MongoDB 记录 vs 目录树 | O(n) | 文件路径在 MongoDB 中但磁盘上不存在 |

### 文件解析

```python
async def process_file(file_path: str):
    """解析单个 Markdown 文件，提取 frontmatter + 正文"""
    full_path = os.path.join(config.knowledge.base_dir, file_path)

    with open(full_path, "r") as f:
        content = f.read()

    # 解析 YAML frontmatter
    frontmatter, body = parse_frontmatter(content)

    # 构建 MongoDB 文档
    doc = {
        "file_path": file_path,
        "title": frontmatter.get("title", ""),
        "tags": frontmatter.get("tags", []),
        "category": frontmatter.get("category", ""),
        "status": frontmatter.get("status", "draft"),
        "roles": frontmatter.get("roles", []),
        "benefit": frontmatter.get("benefit", ""),
        "content": body,                       # 正文全文
        "created": frontmatter.get("created", ""),
        "updated": frontmatter.get("updated", ""),
        "source": frontmatter.get("source", "internal"),
        "type": frontmatter.get("type", "reference"),
        "scanned_at": time.time()              # 扫描时间戳
    }

    # Upsert 到 MongoDB
    await db.update_one(
        "knowledge_files",
        {"file_path": file_path},
        {"$set": doc},
        upsert=True
    )
```

### 配置

```yaml
# YiAi config.yaml
knowledge:
  base_dir: "../YiKnowledge"         # 知识库根目录
  watcher_enabled: true              # 是否启用监视器
  watcher_poll_seconds: 60           # 轮询间隔（秒）
```

---

## 三、Frontmatter 作为检索信号

每个知识文件的 YAML frontmatter 被解析为结构化检索信号：

| Frontmatter 字段 | MongoDB 字段 | 检索用途 | 权重 | 说明 |
|------------------|-------------|----------|------|------|
| `title` | `title` | 标题向量匹配 | 高 | 标题与查询的语义相似度 |
| `tags` | `tags` | BM25 关键词 | 高 | 标签与查询关键词的精确匹配 |
| `category` | `category` | Scope 过滤 | 中 | 分类限定检索范围 |
| `status` | `status` | 内容过滤 | — | `draft`/`archived` 不检索 |
| `roles` | `roles` | 角色过滤 | 低 | 按角色筛选内容 |
| `benefit` | `benefit` | 相关性评估 | 中 | 帮助判断内容与查询的相关性 |
| `content` | `content` | 正文向量 + BM25 | 高 | 正文全文检索 |

### RAG 优化建议

| 策略 | 说明 | 效果 | 示例 |
|------|------|------|------|
| 精准标签 | tags 使用 3-5 个具体标签 | 提升 BM25 关键词匹配精度 | `[fastapi, middleware, auth]` 而非 `[tech, code]` |
| 高密度 Summary | 摘要段落包含关键信息 | 提升向量检索相关性 | "FastAPI 中间件认证实现，支持 JWT + bcrypt" |
| 结构化正文 | 清晰的 H2/H3 标题层级 | 提升分块索引质量 | 使用 Summary / Core viewpoints / Key information |
| benefit 字段 | 填写知识独特价值 | 帮助 RAG 判断内容相关性 | "为微服务技术选型提供完整决策依据" |

---

## 四、索引构建

### 构建流程

```python
# src/domain/rag/builder.py
from llama_index.core import VectorStoreIndex, Settings
from llama_index.core.node_parser import SentenceWindowNodeParser
from llama_index.embeddings.ollama import OllamaEmbedding

async def build_index(force: bool = False):
    """从 MongoDB 构建 RAG 索引"""

    # 1. 检查是否需要重建
    if not force and os.path.exists("data/rag_store/docstore.json"):
        return  # 索引已存在，跳过

    # 2. 从 MongoDB 加载所有 knowledge_files
    documents = []
    async for doc in db.find_many("knowledge_files", {
        "status": {"$nin": ["draft", "archived"]}  # 过滤草稿和归档
    }):
        # 构建 llama_index Document
        documents.append(Document(
            text=doc["content"],
            metadata={
                "file_path": doc["file_path"],
                "title": doc["title"],
                "tags": doc.get("tags", []),
                "category": doc.get("category", ""),
                "roles": doc.get("roles", []),
                "benefit": doc.get("benefit", "")
            }
        ))

    # 3. 配置 Embedding 模型
    Settings.embed_model = OllamaEmbedding(
        model_name=config.rag.embed_model,  # "nomic-embed-text"
        base_url="http://localhost:11434"
    )

    # 4. 配置分块策略
    Settings.chunk_size = config.rag.chunk_size        # 512
    Settings.chunk_overlap = config.rag.chunk_overlap   # 50

    # 5. 构建向量索引
    index = VectorStoreIndex.from_documents(documents)

    # 6. 持久化到磁盘
    index.storage_context.persist(persist_dir="data/rag_store")

    logger.info(f"Index built: {len(documents)} documents")
```

### 索引配置

| 配置项 | 默认值 | 说明 | 调优建议 |
|--------|--------|------|----------|
| `rag.embed_model` | `nomic-embed-text` | Embedding 模型 | 中文内容可考虑 `bge-m3` |
| `rag.chunk_size` | `512` | 分块大小（tokens） | 长文档增大，短文档减小 |
| `rag.chunk_overlap` | `50` | 分块重叠（tokens） | 约 10% 的 chunk_size |
| `rag.top_k` | `5` | 返回片段数 | 精度优先增大，速度优先减小 |

### 索引触发方式

| 触发方式 | 命令/配置 | 说明 |
|----------|----------|------|
| 启动时自动 | `lifespan startup` 中调用 | 如果索引不存在则自动构建 |
| 手动触发 | `POST /rag/build-index` | 强制重建索引 |
| 增量更新 | Knowledge Watcher 检测到变更后 | 自动增量更新索引 |

---

## 五、混合检索

### 检索架构

```
用户查询
  │
  ├── 向量检索（VectorStoreIndex）
  │   ├── 语义相似度匹配
  │   ├── 捕获同义词和概念相关性
  │   └── 返回 Top-K 向量结果
  │
  ├── BM25 关键词检索
  │   ├── 精确关键词匹配
  │   ├── 捕获术语和专有名词
  │   └── 返回 Top-K 关键词结果
  │
  ▼
QueryFusionRetriever（结果融合）
  │
  ├── LLM Rerank（可选）
  │   └── 二阶段重排序，提升 Top-K 精度
  │
  ├── HyDE 查询增强（可选）
  │   └── 用 LLM 生成假设文档再检索
  │
  ├── Sentence Window
  │   └── 检索句子级片段，返回周围窗口上下文
  │
  ▼
内联引用编号 [Source 1], [Source 2], ...
  │
  ▼
返回结果 → Agent
```

### RAG 查询实现

```python
# src/domain/rag/engine.py
async def rag_query(
    query: str,
    top_k: int = 5,
    scope: str | None = None,
    use_hyde: bool = True,
    use_rerank: bool = False
) -> RagResult:
    """RAG 检索：返回相关文档片段 + 引用编号"""

    # 1. HyDE 查询增强（可选）
    if use_hyde:
        query = await hyde_expand(query)

    # 2. Scope 过滤
    filters = _build_scope_filter(scope)

    # 3. 混合检索
    vector_results = await vector_index.query(query, top_k=top_k * 2, filters=filters)
    bm25_results = await bm25_index.query(query, top_k=top_k * 2, filters=filters)

    # 4. 结果融合（RRF: Reciprocal Rank Fusion）
    fused = reciprocal_rank_fusion(vector_results, bm25_results, top_k=top_k)

    # 5. LLM Rerank（可选）
    if use_rerank:
        fused = await llm_rerank(query, fused, top_k=top_k)

    # 6. 添加引用编号
    return add_citations(fused)
```

### 检索策略对比

| 策略 | 优势 | 劣势 | 适用场景 |
|------|------|------|----------|
| 纯向量检索 | 语义理解好，同义词匹配 | 专有名词/术语匹配弱 | 概念性查询 |
| 纯 BM25 | 精确关键词匹配 | 无语义理解 | 术语查询 |
| 混合检索 | 两者优势互补 | 计算量翻倍 | 通用检索（推荐） |
| + LLM Rerank | Top-K 精度高 | 增加延迟和成本 | 高精度需求 |
| + HyDE | 短查询增强 | 额外的 LLM 调用 | 简短查询 |

### 配置开关

```yaml
# YiAi config.yaml
rag:
  hybrid_search: true       # 混合检索（向量 + BM25）
  use_rerank: false         # LLM Rerank（提升精度但增加延迟）
  use_hyde: true            # HyDE 查询增强
  use_sentence_window: true # Sentence Window 检索
  use_citations: true       # 内联引用编号
```

---

## 六、Scope 过滤

支持文件级和文件夹级 scope 限定，缩小检索范围：

```python
def _build_scope_filter(scope: str | None) -> dict | None:
    """构建 Scope 过滤条件"""
    if not scope:
        return None

    # 判断是文件还是文件夹
    if scope.endswith(".md"):
        return {"file_path": scope}          # 文件级过滤
    else:
        return {"file_path": {"$regex": f"^{scope}"}}  # 文件夹级过滤
```

### Scope 使用示例

```python
# 按文件过滤
rag_query("微服务架构", scope="leader/decisions/microservices.md")

# 按文件夹过滤
rag_query("安全最佳实践", scope="engineer/ship/")

# 按角色过滤
rag_query("需求优先级", scope="producter/")

# 按项目过滤
rag_query("ProTable 使用", scope="engineer/projects/yivad/")
```

---

## 七、性能与监控

### 索引统计

| 指标 | 典型值 | 说明 |
|------|--------|------|
| 索引文件数 | 1000+ | MongoDB `knowledge_files` 集合文档数 |
| 索引大小 | 50-200 MB | `data/rag_store/` 目录大小 |
| 构建时间 | 30-60s | 全量构建（1000+ 文件） |
| 增量更新时间 | 1-5s | 单个文件变更 |
| 查询延迟 | 1-3s | 混合检索（不含 LLM 生成） |
| + LLM Rerank | +2-5s | 额外延迟 |
| + HyDE | +1-3s | 额外 LLM 调用 |

### 监控命令

```bash
# 查看索引状态
curl http://localhost:10086/rag/status
# → { "indexed_files": 1234, "index_size_mb": 85, "last_built": "2026-09-07T10:00:00" }

# 手动重建索引
curl -X POST http://localhost:10086/rag/build-index
# → { "code": 0, "data": { "indexed": 1234, "duration_seconds": 45 } }

# 查看知识文件数
curl http://localhost:10086/knowledge/stats
# → { "total": 1234, "active": 1100, "draft": 50, "archived": 84 }

# 测试 RAG 查询
curl -X POST http://localhost:10086/rag/query \
  -H "Content-Type: application/json" \
  -d '{"query": "微服务架构", "top_k": 5, "scope": "leader/"}'
```

---

## 八、故障处理

| 场景 | 检测方式 | 行为 | 恢复方式 |
|------|----------|------|----------|
| MongoDB 不可用 | 连接超时 | 索引构建失败，RAG 查询返回空 | MongoDB 恢复后重建索引 |
| Ollama 不可用 | API 调用失败 | Embedding 生成失败 | Ollama 恢复后重建索引 |
| 索引文件损坏 | 加载 docstore.json 失败 | 查询返回空结果 | 删除 `data/rag_store/` 后重建 |
| 知识文件格式错误 | frontmatter 解析失败 | 跳过该文件，记录警告日志 | 修复 frontmatter 后自动重新同步 |
| 磁盘空间不足 | 写入索引文件失败 | 索引持久化失败 | 清理磁盘空间后重建索引 |
| 文件编码错误 | UTF-8 解码失败 | 跳过该文件，记录错误日志 | 修复文件编码后重新同步 |
| 超大文件 | 文件超过 10MB | 跳过该文件，记录警告日志 | 拆分文件或压缩内容 |

### 故障处理代码

```python
async def scan_knowledge_base_safe():
    """带故障处理的扫描"""
    try:
        await scan_knowledge_base()
    except FileNotFoundError as e:
        logger.error(f"Knowledge base directory not found: {e}")
    except UnicodeDecodeError as e:
        logger.error(f"File encoding error: {e}")
    except Exception as e:
        logger.error(f"Knowledge watcher error: {e}", exc_info=True)
```

---

## 九、反模式

| 反模式 | 错误示例 | 正确做法 | 原因 |
|--------|----------|----------|------|
| 中文标签 | `tags: [API, 认证, 微服务]` | `tags: [api, auth, microservices]` | BM25 对英文关键词匹配更精准 |
| 标签过于宽泛 | `tags: [tech, code, dev]` | `tags: [fastapi, middleware, auth]` | 无区分度，检索噪音大 |
| 不写 benefit | benefit 字段为空 | `benefit: "为微服务选型提供决策依据"` | RAG 无法判断内容相关性 |
| 正文无结构 | 大段文字无标题层级 | 使用 H2/H3 组织内容 | 分块索引质量差 |
| Summary 太简短 | "这是一个 API 文档" | "FastAPI 中间件认证实现，支持 JWT + bcrypt，包含 Token 刷新和权限校验" | 向量检索相关性低 |
| 忘记更新 updated | 修改内容后不更新日期 | 每次修改后更新 `updated` | 新鲜度检测失效 |
| status 不更新 | 内容已过时，status 仍为 `stable` | 更新为 `deprecated` | RAG 检索到过时内容 |
| 文件路径过长 | `engineer/build/api/fastapi/middleware/auth.md` | `engineer/build/fastapi-auth.md` | 超过 3 级目录，语义信号稀释 |

---

## 十、约束

### 必须遵守

- 所有知识文件必须包含完整 YAML frontmatter（8 个必填字段）
- Tags 使用 3-5 个英文小写标签
- 正文使用清晰的标题层级（H2/H3）
- benefit 字段填写具体的知识价值
- 修改内容后更新 `updated` 字段
- 文件命名使用 kebab-case，最多 3 级目录

### 禁止

- 不使用中文标签
- 不跳过 benefit 字段
- 不创建超过 3 级的目录层级
- 不让 status 为 `draft` 的文件进入 RAG 检索
- 不创建无 frontmatter 的知识文件