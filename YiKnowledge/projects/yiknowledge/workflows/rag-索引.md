---
title: YiKnowledge RAG 索引工作流 — YiAi 知识监听器 → MongoDB → 向量索引
tags: [yiknowledge, workflow, rag, indexing, yiai, vector]
category: projects/yiknowledge/workflows
created: 2026-09-02
updated: 2026-09-02
source: internal
type: summary
status: stable
lifecycle: active
review_cycle: quarterly
roles: [工程师, aier]
benefit: "理解 YiKnowledge 知识文件如何通过 YiAi 知识监听器同步到 MongoDB 并构建向量索引，实现 RAG 语义检索"
acceptance_criteria:
  - "列出 RAG 索引的完整数据流"
  - "列出 YiAi 知识监听器的工作机制"
  - "列出 MongoDB 存储结构"
  - "列出向量索引的构建方式"
  - "列出常见问题和排查方法"
related:
  - ../specs/架构/文件规范/规范.md
  - ../specs/架构/治理/规范.md
  - ../../../yiai/specs/architecture/rag-engine.md
---

# YiKnowledge RAG 索引工作流 — YiAi 知识监听器 → MongoDB → 向量索引

> YiKnowledge 是 YiAi RAG 引擎的核心数据源。本文档描述知识文件如何被 YiAi 知识监听器同步到 MongoDB 并构建向量索引，实现语义检索。

## 工作流概览

```
YiKnowledge/ (Markdown 文件树)
     │
     │ 1. 文件变更检测
     ▼
YiAi Knowledge Watcher (apscheduler, 每 5s 轮询)
     │
     │ 2. 解析 frontmatter + 内容
     ▼
MongoDB
     ├── knowledge_files 集合 (文件元数据 + 内容)
     └── knowledge_chunks 集合 (分块内容)
     │
     │ 3. 向量化嵌入
     ▼
llama_index 向量索引
     │
     │ 4. 语义检索
     ▼
YiAi BRD Agent (RAG 智能问答)
```

## 阶段一：文件变更检测

### 知识监听器 (Knowledge Watcher)

YiAi 的知识监听器是一个 apscheduler 定时任务，每 5 秒扫描一次 YiKnowledge 目录：

```python
# YiAi/services/knowledge_watcher.py (伪代码)
from apscheduler.schedulers.background import BackgroundScheduler

class KnowledgeWatcher:
    def __init__(self, knowledge_dir: str):
        self.knowledge_dir = knowledge_dir
        self.scheduler = BackgroundScheduler()
        self.scheduler.add_job(
            self.scan,
            'interval',
            seconds=5,
            id='knowledge_scan'
        )

    def scan(self):
        """扫描 YiKnowledge 目录，检测文件变更"""
        current_files = self._get_all_files()
        added = current_files - self.known_files
        modified = self._get_modified_files()
        removed = self.known_files - current_files

        for file in added:
            self._handle_new_file(file)
        for file in modified:
            self._handle_modified_file(file)
        for file in removed:
            self._handle_removed_file(file)

        self.known_files = current_files
```

### 检测的文件变更类型

| 变更类型 | 检测方式 | 处理动作 |
|---|---|---|
| 新增文件 | 文件路径不在已知列表中 | 解析并索引新文件 |
| 修改文件 | 文件的修改时间戳变化 | 重新解析并更新索引 |
| 删除文件 | 文件路径从已知列表中消失 | 从索引中移除 |

## 阶段二：Frontmatter 解析 + 内容处理

### 解析流程

```python
# 解析 YiKnowledge 文件 (伪代码)
import yaml
import frontmatter

def parse_knowledge_file(file_path: str) -> dict:
    """解析知识文件，提取 frontmatter 和内容"""
    with open(file_path, 'r') as f:
        post = frontmatter.load(f)

    metadata = post.metadata
    content = post.content

    return {
        'file_path': file_path,
        'title': metadata.get('title', ''),
        'tags': metadata.get('tags', []),
        'category': metadata.get('category', ''),
        'created': metadata.get('created', ''),
        'updated': metadata.get('updated', ''),
        'source': metadata.get('source', 'internal'),
        'type': metadata.get('type', 'summary'),
        'status': metadata.get('status', 'draft'),
        'lifecycle': metadata.get('lifecycle', 'inbox'),
        'review_cycle': metadata.get('review_cycle', ''),
        'last_verified': metadata.get('last_verified', ''),
        'roles': metadata.get('roles', []),
        'benefit': metadata.get('benefit', ''),
        'acceptance_criteria': metadata.get('acceptance_criteria', []),
        'related': metadata.get('related', []),
        'content': content,
        'content_hash': compute_hash(content),
    }
```

### 内容分块 (Chunking)

长文档会被分块处理，每个 chunk 保留上下文：

```python
# 内容分块 (伪代码)
def chunk_content(content: str, chunk_size: int = 512, overlap: int = 50) -> list:
    """将长内容分成小块，每块保留上下文重叠"""
    chunks = []
    paragraphs = content.split('\n\n')

    current_chunk = ''
    for para in paragraphs:
        if len(current_chunk) + len(para) > chunk_size:
            chunks.append(current_chunk.strip())
            current_chunk = para
        else:
            current_chunk += '\n\n' + para

    if current_chunk:
        chunks.append(current_chunk.strip())

    return chunks
```

## 阶段三：MongoDB 存储

### 集合结构

#### knowledge_files 集合

存储文件元数据和完整内容：

```json
{
  "_id": "ObjectId(...)",
  "file_path": "YiKnowledge/engineer/architecture/overview.md",
  "title": "架构概览",
  "tags": ["architecture", "overview", "engineer"],
  "category": "engineer/architecture",
  "created": "2026-08-01",
  "updated": "2026-09-02",
  "source": "internal",
  "type": "summary",
  "status": "stable",
  "lifecycle": "active",
  "review_cycle": "quarterly",
  "last_verified": "2026-09-02",
  "roles": ["engineer"],
  "benefit": "快速了解系统架构",
  "acceptance_criteria": ["列出所有模块", "有架构图"],
  "related": ["./detail.md"],
  "content": "# 架构概览\n\n...",
  "content_hash": "abc123...",
  "indexed_at": "2026-09-02T10:00:00Z",
  "chunk_count": 3
}
```

#### knowledge_chunks 集合

存储分块内容和向量：

```json
{
  "_id": "ObjectId(...)",
  "file_id": "ObjectId(...)",
  "file_path": "YiKnowledge/engineer/architecture/overview.md",
  "chunk_index": 0,
  "content": "## 概述\n\n系统架构包括...",
  "embedding": [0.123, -0.456, ...],  // 1536 维向量
  "token_count": 128,
  "metadata": {
    "title": "架构概览",
    "tags": ["architecture", "overview"],
    "category": "engineer/architecture",
    "lifecycle": "active"
  }
}
```

### 索引策略

```javascript
// MongoDB 索引 (伪代码)
db.knowledge_files.createIndex({ "file_path": 1 }, { unique: true });
db.knowledge_files.createIndex({ "tags": 1 });
db.knowledge_files.createIndex({ "category": 1 });
db.knowledge_files.createIndex({ "lifecycle": 1 });
db.knowledge_files.createIndex({ "updated": 1 });

db.knowledge_chunks.createIndex({ "file_id": 1 });
db.knowledge_chunks.createIndex({ "metadata.tags": 1 });
db.knowledge_chunks.createIndex({ "metadata.lifecycle": 1 });
```

## 阶段四：向量索引构建

### 嵌入模型

使用 Ollama 本地模型进行文本向量化：

```python
# 向量嵌入 (伪代码)
from llama_index.embeddings.ollama import OllamaEmbedding

embed_model = OllamaEmbedding(
    model_name="nomic-embed-text",
    base_url="http://localhost:11434",
)

def embed_chunks(chunks: list) -> list:
    """将文本块转换为向量"""
    embeddings = []
    for chunk in chunks:
        vector = embed_model.get_text_embedding(chunk.content)
        chunk.embedding = vector
        embeddings.append(chunk)
    return embeddings
```

### 向量索引

使用 llama_index 构建向量索引：

```python
# 向量索引构建 (伪代码)
from llama_index.core import VectorStoreIndex, Document
from llama_index.vector_stores.mongodb import MongoDBAtlasVectorSearch

def build_vector_index(chunks: list):
    """构建向量索引"""
    documents = []
    for chunk in chunks:
        doc = Document(
            text=chunk.content,
            metadata={
                'file_path': chunk.file_path,
                'title': chunk.metadata.title,
                'tags': chunk.metadata.tags,
                'category': chunk.metadata.category,
                'chunk_index': chunk.chunk_index,
            },
            embedding=chunk.embedding,
        )
        documents.append(doc)

    index = VectorStoreIndex.from_documents(documents)
    return index
```

## 阶段五：RAG 语义检索

### 检索流程

```python
# RAG 检索 (伪代码)
def retrieve(query: str, top_k: int = 5, filters: dict = None) -> list:
    """语义检索知识库"""
    query_embedding = embed_model.get_query_embedding(query)

    # 构建过滤条件
    filter_conditions = {}
    if filters:
        if 'tags' in filters:
            filter_conditions['metadata.tags'] = {'$in': filters['tags']}
        if 'category' in filters:
            filter_conditions['metadata.category'] = filters['category']
        if 'lifecycle' in filters:
            filter_conditions['metadata.lifecycle'] = filters['lifecycle']

    # 向量相似度检索
    results = vector_store.similarity_search(
        query_embedding=query_embedding,
        k=top_k,
        filter=filter_conditions,
    )

    return results
```

### 检索过滤

RAG 检索支持以下过滤条件：

| 过滤条件 | 说明 | 示例 |
|---|---|---|
| `tags` | 按标签过滤 | `tags: [architecture, vue]` |
| `category` | 按分类过滤 | `category: engineer/architecture` |
| `lifecycle` | 按生命周期过滤 | `lifecycle: active` (默认) |
| `roles` | 按角色过滤 | `roles: [engineer]` |

默认情况下，RAG 检索只返回 `lifecycle: active` 的内容。

## 同步状态监控

### 健康检查

```python
# 同步状态检查 (伪代码)
def check_sync_status():
    """检查知识库同步状态"""
    git_files = count_files_in_yiknowledge()
    mongo_files = db.knowledge_files.count_documents({})
    chunks_indexed = db.knowledge_chunks.count_documents({})

    return {
        'git_files': git_files,
        'mongo_files': mongo_files,
        'chunks_indexed': chunks_indexed,
        'sync_ratio': mongo_files / git_files if git_files > 0 else 0,
        'last_scan': last_scan_time,
        'status': 'healthy' if mongo_files >= git_files * 0.95 else 'degraded',
    }
```

## 常见问题

### 问题 1：文件未同步到 MongoDB

**可能原因**：
- YiAi 未运行
- 知识监听器配置错误
- 文件 frontmatter 格式错误
- 文件路径不在监控范围内

**排查方法**：
1. 检查 YiAi 是否运行：`curl http://localhost:10086/health`
2. 检查知识监听器日志
3. 验证文件 frontmatter 格式：`head -20 <file.md>`
4. 手动触发同步：调用 `/knowledge/rescan` 接口

### 问题 2：RAG 检索不到内容

**可能原因**：
- 内容 `lifecycle` 不是 `active`
- 向量索引未更新
- 查询与内容语义不匹配

**排查方法**：
1. 检查内容的 `lifecycle` 字段
2. 检查 MongoDB 中是否有该文件
3. 检查向量索引是否包含该文件的 chunk
4. 尝试不同的查询措辞

### 问题 3：同步延迟

**可能原因**：
- 知识监听器扫描间隔过长
- 大文件处理耗时
- 向量嵌入模型响应慢

**排查方法**：
1. 检查扫描间隔配置（默认 5s）
2. 检查大文件的 chunk 数量
3. 检查 Ollama 模型响应时间

## 关键约定

1. **只有 active 内容被检索** — RAG 默认只返回 `lifecycle: active` 的内容
2. **frontmatter 是检索基础** — 标签、分类、角色等元数据是检索过滤的依据
3. **5 秒同步延迟** — 文件修改后最多 5 秒即可被检索
4. **内容分块** — 长文档自动分块，每块保留上下文重叠
5. **向量嵌入** — 使用 Ollama 本地模型，无需外部 API
6. **MongoDB 是中间存储** — 文件元数据和分块内容存储在 MongoDB

## 交叉引用

- [文件约定](../specs/架构/文件规范/规范.md) — frontmatter schema 规范
- [治理规范](../specs/架构/治理/规范.md) — 生命周期管理
- [知识生命周期](./知识生命周期.md) — 知识文件的生命周期
- [YiAi RAG 引擎](../../../yiai/specs/架构/rag-engine.md) — RAG 引擎详细架构