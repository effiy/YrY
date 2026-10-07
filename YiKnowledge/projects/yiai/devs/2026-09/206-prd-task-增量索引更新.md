---

doc_type: module
prd_task_id: "YA-09-88"
title: "YA-09-88: 增量索引更新 — 知识监视器增量扫描 — 开发方案"
status: 需求已编写
priority: P1
owner: 陈铭
roles: [engineer]
created: 2026-09-11
updated: 2026-09-23
project: YiAi
project_id: yiai
prd_month: "202609"
estimate_frontend: 4.0
source_prd: "206-需求-增量索引更新.md"
source_okr: [yiai-001]
related_tests: ["206-prd-test-增量索引更新"]

type: task
---

# YA-09-88: 增量索引更新 — 知识监视器增量扫描 — 开发方案

> 来源 PRD：[206-需求-增量索引更新.md](../../prds/2026-09/206-需求-增量索引更新.md)
> 需求编号：YA-09-88 · 优先级：P1 · 人天：4.0d
> 测试规格：[206-prd-test-增量索引更新.md](../../tests/2026-09/206-prd-test-增量索引更新.md)

---

<a id="sec-1"></a>
## 一、问题分析

当前 `KnowledgeWatcher` 每次扫描 YiKnowledge 全量目录（1000+ 文件），逐文件解析 frontmatter → 重建向量索引。全量扫描耗时 30s+，且扫描期间 CPU 100%。

**根因**：扫描逻辑无增量能力——文件 mtime 被忽略，每次都当做全量新索引。

**目标**：扫描耗时 30s → 2s，CPU 占用从 100% → <20%。

---

<a id="sec-2"></a>
## 二、设计方案

### 2.1 增量检测

```python
# domain/knowledge/watcher.py
class IncrementalWatcher:
    def __init__(self, db, index_dir: str):
        self._db = db
        self._index_dir = index_dir
        self._last_scan: dict[str, float] = {}  # path → mtime

    async def scan(self):
        current_files = set()
        changes = {"added": [], "modified": [], "deleted": []}

        for file_path in self._walk_md_files():
            current_files.add(file_path)
            mtime = os.path.getmtime(file_path)
            prev = self._last_scan.get(file_path)

            if prev is None:
                changes["added"].append(file_path)
            elif mtime > prev:
                changes["modified"].append(file_path)

            self._last_scan[file_path] = mtime

        # 检测删除：last_scan 中有但当前文件系统中没有的
        for path in self._last_scan:
            if path not in current_files:
                changes["deleted"].append(path)
                del self._last_scan[path]

        return changes

    async def apply_changes(self, changes):
        for path in changes["added"]:
            await self._index_file(path)
        for path in changes["modified"]:
            await self._reindex_file(path)
        for path in changes["deleted"]:
            await self._remove_from_index(path)
```

### 2.2 向量索引原地更新

```python
# domain/rag/indexer.py
async def update_document(self, path: str, content: str):
    """原地更新单个文档的向量索引，不重建整个索引."""
    doc_id = self._path_to_id(path)
    # 删除旧向量
    self._index.delete(doc_id)
    # 重新分块 + 嵌入 + 插入
    nodes = self._splitter.split_text(content)
    embeddings = await self._embedder.embed_batch([n.text for n in nodes])
    self._index.insert_batch(
        [(f"{doc_id}_{i}", emb, {"text": n.text, "path": path})
         for i, (n, emb) in enumerate(zip(nodes, embeddings))]
    )
```

### 2.3 文件系统事件补充

```python
# 使用 watchdog 监听文件变更，作为 mtime 轮询的补充
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler

class KnowledgeFileHandler(FileSystemEventHandler):
    def __init__(self, watcher: IncrementalWatcher):
        self._watcher = watcher
        self._pending = set()

    def on_modified(self, event):
        if event.src_path.endswith(".md"):
            self._pending.add(event.src_path)

    async def flush(self):
        for path in self._pending:
            await self._watcher._reindex_file(path)
        self._pending.clear()
```

### 2.4 设计决策

| 决策 | 选择 | 理由 |
|------|------|------|
| 增量依据 | 文件 mtime | 简单可靠，无外部依赖 |
| 事件补充 | watchdog（可选） | 实时性更好，但需要文件系统支持 |
| 索引更新 | 原地更新 | vs 全量重建（慢） |
| deleted 检测 | last_scan 对比 | vs inotify（需要常驻进程） |
| 首次扫描 | 全量（保留现有逻辑） | 新增文件不需要增量 |

---

<a id="sec-3"></a>
## 三、实施步骤

| # | 步骤 | 验证 | 人天 |
|---|------|------|------|
| 1 | `IncrementalWatcher` 类 + mtime 检测 | 修改 1 个文件后仅重新索引该文件 | 1.5 |
| 2 | 向量索引 `update_document` 原地更新 | 更新后查询可检索到最新内容 | 1.0 |
| 3 | 集成到现有 `KnowledgeWatcher`（保留全量模式作为 fallback） | 增量 + 全量模式可通过 config 切换 | 0.5 |
| 4 | watchdog 文件事件监听（可选） | 文件保存后 2s 内索引更新 | 0.5 |
| 5 | 性能验证：1000 文件增量扫描 < 2s | `time python -m pytest tests/knowledge/` | 0.5 |

**合计：4.0d**

---

<a id="sec-4"></a>
## 四、回滚

- `config.yaml: knowledge.watcher_mode = "full"` 回退到全量模式
- 增量模式出问题时不影响现有功能（共享同一 `KnowledgeWatcher` 接口）