---

doc_type: test
title: "知识库监听器-文件系统到数据库同步 — 测试规格"
status: 待开始
priority: 中
owner: 陈铭
roles: [engineer, qa]
created: 2026-09-11
updated: 2026-09-23
project: YiAi
project_id: yiai
prd_month: "202607"
prd_task_id: "5"
source_prds: ["02-需求-知识库监听器"]
source_modules: []
source_okr: [yiai-001]

type: test
---

# 知识库监听器 (Knowledge Watcher) — 文件系统到 MongoDB 同步 — 测试规格

> **文档职责**：本文档定义 Knowledge Watcher 模块的**怎么验证**（VERIFY），覆盖轮询调度、文件扫描、Frontmatter 解析、MongoDB 同步、RAG 触发和跨平台兼容。

> 来源 PRD：[02-需求-知识库监听器.md](../../prds/2026-07/02-需求-知识库监听器.md)
> 来源 Dev：[02-prd-task-知识库监听器.md](../../devs/2026-07/02-prd-task-知识库监听器.md)

---

<a id="sec-scope"></a>
## 一、测试范围与策略

### 1.1 测试分层

| 层级 | 描述 | 工具 | 覆盖目标 |
|------|------|------|---------|
| L1 单元测试 | 纯函数/类级，无外部依赖 | pytest + unittest.mock | Frontmatter 解析器、content hash 计算、变更检测逻辑 |
| L2 集成测试 | 真实文件系统 + MongoDB test db | pytest-asyncio + motor + tmp_path | 轮询调度、bulk_write 同步、快照对比、RAG 触发 |
| L3 手动回归 | 真实 YiKnowledge 目录树 | 手动 + curl + MongoDB Compass | 文件增删改全流程、跨平台兼容 |
| L4 性能基准 | 扫描性能测量 | pytest + time.perf_counter | 1000 文件扫描 < 200ms，bulk_write 分批 |

### 1.2 测试数据

```python
# tests/conftest.py 新增 fixtures

@pytest.fixture
def sample_md_with_full_frontmatter():
    """包含完整 frontmatter 的 markdown 内容。"""
    return """---
title: "测试文档"
tags: [test, integration]
category: "项目/测试"
created: 2026-09-23
updated: 2026-09-23
source: internal
type: test
status: draft
lifecycle: active
review_cycle: monthly
roles: [engineer]
---

# 测试文档

这是正文内容，用于验证 Frontmatter 解析和正文分离。
"""

@pytest.fixture
def sample_md_missing_fields():
    """缺少 tags 字段的 markdown 内容。"""
    return """---
title: "不完整文档"
category: "项目/测试"
created: 2026-09-23
updated: 2026-09-23
source: internal
type: test
status: draft
---

# 不完整文档

缺少 tags 字段的文档正文。
"""

@pytest.fixture
def sample_md_string_tags():
    """tags 使用字符串格式而非数组。"""
    return """---
title: "字符串标签"
tags: "tag1, tag2, tag3"
category: "项目/测试"
created: 2026-09-23
updated: 2026-09-23
source: internal
type: test
status: draft
---

# 字符串标签文档
"""

@pytest.fixture
def sample_md_no_frontmatter():
    """无 frontmatter 的 markdown 内容。"""
    return """# 无 Frontmatter 文档

这个文档没有 YAML frontmatter 块。
"""

@pytest.fixture
def knowledge_test_dir(tmp_path):
    """创建包含多个 markdown 文件的模拟 YiKnowledge 目录。"""
    base = tmp_path / "YiKnowledge"
    base.mkdir()

    # 创建 5 个正常文件
    for i in range(5):
        (base / f"test-{i:02d}.md").write_text(f"""---
title: "测试文档 {i}"
tags: [test, doc-{i}]
category: "项目/测试"
created: 2026-09-23
updated: 2026-09-23
source: internal
type: test
status: draft
---

# 测试文档 {i}

这是第 {i} 个测试文档的正文内容。
""")

    # 创建一个无 frontmatter 文件
    (base / "no-frontmatter.md").write_text("# 无 Frontmatter\n\n纯文本内容。")

    # 创建一个非 .md 文件（应被忽略）
    (base / "readme.txt").write_text("This is not a markdown file.")

    # 创建一个隐藏文件（应被过滤）
    (base / ".hidden.md").write_text("# Hidden\n\nHidden content.")

    return base

@pytest.fixture
def scanner(knowledge_test_dir):
    """创建 FileScanner 实例。"""
    from domain.knowledge.scanner import FileScanner
    return FileScanner(str(knowledge_test_dir))

@pytest.fixture
def parser():
    """创建 FrontmatterParser 实例。"""
    from domain.knowledge.parser import FrontmatterParser
    return FrontmatterParser()
```

---

<a id="sec-test-cases"></a>
## 二、测试用例

### 2.1 轮询调度

---

#### TC-WATCH-001: apscheduler 正常启动与 60s 轮询

| 字段 | 内容 |
|------|------|
| **ID** | TC-WATCH-001 |
| **层级** | L2 集成 |
| **优先级** | P0 |
| **前提** | YiAi 服务启动，`knowledge.watcher_enabled=true`，`knowledge.watcher_poll_seconds=60` |
| **步骤** | 1. 启动 YiAi 服务<br/>2. 检查启动日志中 apscheduler 注册信息<br/>3. 等待 65s<br/>4. 检查日志中至少出现 1 次 `[Watcher] scan complete` |
| **预期结果** | - 日志包含 `apscheduler: Added job "knowledge_watcher"`<br/>- 60s 后首次扫描触发<br/>- 扫描日志包含文件计数（added/modified/deleted） |

---

#### TC-WATCH-002: 轮询间隔可配置

| 字段 | 内容 |
|------|------|
| **ID** | TC-WATCH-002 |
| **层级** | L2 集成 |
| **优先级** | P1 |
| **前提** | `config.yaml` 中 `knowledge.watcher_poll_seconds=10` |
| **步骤** | 1. 修改配置为 10s 轮询间隔<br/>2. 重启 YiAi<br/>3. 观察两次扫描日志的时间间隔 |
| **预期结果** | - 两次扫描间隔约为 10s<br/>- 配置热更新后生效 |

---

#### TC-WATCH-003: 手动触发全量扫描 (RPC scan_knowledge)

| 字段 | 内容 |
|------|------|
| **ID** | TC-WATCH-003 |
| **层级** | L2 集成 |
| **优先级** | P0 |
| **前提** | YiAi 服务运行，YiKnowledge 目录有测试文件 |
| **步骤** | 1. 发送 POST / RPC 请求 `{module_name: "services.knowledge.knowledge_service", method_name: "scan_knowledge", parameters: {}}`<br/>2. 检查响应中的同步计数 |
| **预期结果** | - 返回 `{code: 0, data: {total: N, added: X, modified: Y, deleted: Z}}`<br/>- 同步计数与实际文件数一致 |

---

#### TC-WATCH-004: Watcher 禁用时不启动轮询

| 字段 | 内容 |
|------|------|
| **ID** | TC-WATCH-004 |
| **层级** | L2 集成 |
| **优先级** | P1 |
| **前提** | `knowledge.watcher_enabled=false` |
| **步骤** | 1. 在配置中禁用 Watcher<br/>2. 启动 YiAi<br/>3. 检查日志中无 apscheduler 注册 |
| **预期结果** | - 日志中无 `knowledge_watcher` 相关条目<br/>- 手动 `scan_knowledge` 仍可正常调用 |

---

### 2.2 文件扫描与变更检测

---

#### TC-SCAN-001: 首次扫描发现所有 .md 文件

| 字段 | 内容 |
|------|------|
| **ID** | TC-SCAN-001 |
| **层级** | L1 单元 |
| **优先级** | P0 |
| **前提** | `knowledge_test_dir` fixture 有 7 个 .md 文件（含隐藏文件） |
| **步骤** | 1. 调用 `scanner.scan()` 获取文件列表<br/>2. 计数 `.md` 文件 |
| **预期结果** | - 返回 5 个正常 .md 文件（不含 `.hidden.md` 隐藏文件）<br/>- 返回 1 个无 frontmatter 的 .md 文件<br/>- 不包含 `readme.txt` 非 .md 文件<br/>- 不包含 `.hidden.md` 隐藏文件 |

---

#### TC-SCAN-002: mtime 变更检测

| 字段 | 内容 |
|------|------|
| **ID** | TC-SCAN-002 |
| **层级** | L1 单元 |
| **优先级** | P0 |
| **前提** | 已有文件在初始状态缓存中 |
| **步骤** | 1. 首次扫描建立基线 `_last_state`<br/>2. 修改文件 `test-01.md` 内容<br/>3. 第二次扫描 |
| **预期结果** | - 第二次扫描检测到 `test-01.md` 为 `modified`<br/>- 其他未修改文件标记为 `skipped` |

---

#### TC-SCAN-003: content hash 双重校验防误更新

| 字段 | 内容 |
|------|------|
| **ID** | TC-SCAN-003 |
| **层级** | L1 单元 |
| **优先级** | P0 |
| **前提** | `mtime` 变更但内容未变（`touch` 命令更新 mtime） |
| **步骤** | 1. 对文件执行 `os.utime` 更新 mtime（不改变内容）<br/>2. 扫描文件<br/>3. 检查 `content_hash` 对比结果 |
| **预期结果** | - mtime 变更被检测到<br/>- 但 `content_hash` 未变化<br/>- 文件被标记为 `skipped`（不触发 MongoDB 更新） |

---

#### TC-SCAN-004: 文件删除检测

| 字段 | 内容 |
|------|------|
| **ID** | TC-SCAN-004 |
| **层级** | L1 单元 |
| **优先级** | P0 |
| **前提** | 文件在初始状态中存在 |
| **步骤** | 1. 首次扫描建立基线<br/>2. 删除文件 `test-02.md`<br/>3. 第二次扫描 |
| **预期结果** | - `test-02.md` 被检测为 `deleted`<br/>- 触发 MongoDB `delete_one` 操作 |

---

#### TC-SCAN-005: 新增文件检测

| 字段 | 内容 |
|------|------|
| **ID** | TC-SCAN-005 |
| **层级** | L1 单元 |
| **优先级** | P0 |
| **前提** | 初始目录无 `new-file.md` |
| **步骤** | 1. 首次扫描建立基线<br/>2. 创建 `new-file.md`（含完整 frontmatter）<br/>3. 第二次扫描 |
| **预期结果** | - `new-file.md` 被检测为 `added`<br/>- 触发 MongoDB `insert_one` 操作 |

---

### 2.3 Frontmatter 解析

---

#### TC-PARSE-001: 完整 frontmatter 解析 8 个必填字段

| 字段 | 内容 |
|------|------|
| **ID** | TC-PARSE-001 |
| **层级** | L1 单元 |
| **优先级** | P0 |
| **前提** | `sample_md_with_full_frontmatter` fixture |
| **步骤** | 1. 调用 `parser.parse(sample_md_with_full_frontmatter)`<br/>2. 检查返回的所有字段 |
| **预期结果** | - `title` = "测试文档"<br/>- `tags` = ["test", "integration"]<br/>- `category` = "项目/测试"<br/>- `created` = "2026-09-23"<br/>- `updated` = "2026-09-23"<br/>- `source` = "internal"<br/>- `type` = "test"<br/>- `status` = "draft"<br/>- `body` 包含 "# 测试文档" 之后的正文 |

---

#### TC-PARSE-002: 缺失必填字段告警处理

| 字段 | 内容 |
|------|------|
| **ID** | TC-PARSE-002 |
| **层级** | L1 单元 |
| **优先级** | P0 |
| **前提** | `sample_md_missing_fields` fixture（缺 `tags`） |
| **步骤** | 1. 调用 `parser.parse(sample_md_missing_fields)`<br/>2. 检查日志输出 |
| **预期结果** | - WARNING 日志包含 "Missing required field: tags"<br/>- 文档仍被解析和同步<br/>- `tags` 字段被设为默认值 `[]`<br/>- 其他字段正确提取 |

---

#### TC-PARSE-003: tags 字符串格式自动归一化

| 字段 | 内容 |
|------|------|
| **ID** | TC-PARSE-003 |
| **层级** | L1 单元 |
| **优先级** | P1 |
| **前提** | `sample_md_string_tags` fixture |
| **步骤** | 1. 调用 `parser.parse(sample_md_string_tags)`<br/>2. 检查 `tags` 字段值 |
| **预期结果** | - `tags` 被归一化为 `["tag1", "tag2", "tag3"]` 数组<br/>- WARNING 日志提示 "tags format auto-converted from string to list" |

---

#### TC-PARSE-004: 无 frontmatter 文件处理

| 字段 | 内容 |
|------|------|
| **ID** | TC-PARSE-004 |
| **层级** | L1 单元 |
| **优先级** | P1 |
| **前提** | `sample_md_no_frontmatter` fixture |
| **步骤** | 1. 调用 `parser.parse(sample_md_no_frontmatter)` |
| **预期结果** | - 返回空 dict `{}`（无 frontmatter 元数据）<br/>- `body` 包含全部文本内容<br/>- 文档仍被同步到 MongoDB（使用默认值） |

---

#### TC-PARSE-005: YAML 格式错误文件不中断扫描

| 字段 | 内容 |
|------|------|
| **ID** | TC-PARSE-005 |
| **层级** | L1 单元 |
| **优先级** | P1 |
| **前提** | 文件包含非法 YAML（如缩进错误的 frontmatter） |
| **步骤** | 1. 创建含非法 YAML 的测试文件<br/>2. 调用 `parser.parse()` |
| **预期结果** | - `yaml.YAMLError` 被捕获<br/>- ERROR 日志记录解析失败<br/>- 文件被标记为 `PARSE_ERROR`<br/>- 不中断整体扫描流程 |

---

### 2.4 MongoDB 同步

---

#### TC-SYNC-001: 新增文件 upsert 到 MongoDB

| 字段 | 内容 |
|------|------|
| **ID** | TC-SYNC-001 |
| **层级** | L2 集成 |
| **优先级** | P0 |
| **前提** | MongoDB test db 可用 |
| **步骤** | 1. 扫描一个新文件<br/>2. 调用 `writer.upsert(doc)`<br/>3. 查询 MongoDB `knowledge_files` 集合 |
| **预期结果** | - 文档正确写入 MongoDB<br/>- `file_path` 为相对路径<br/>- 所有 frontmatter 字段正确映射<br/>- `mtime` 字段写入时间戳 |

---

#### TC-SYNC-002: 修改文件 update_one

| 字段 | 内容 |
|------|------|
| **ID** | TC-SYNC-002 |
| **层级** | L2 集成 |
| **优先级** | P0 |
| **前提** | MongoDB 中已存在该文件的文档 |
| **步骤** | 1. 修改文件内容（变更 `body` 和 `updated` 字段）<br/>2. 重新扫描并调用 `writer.upsert(doc)`<br/>3. 查询 MongoDB 文档 |
| **预期结果** | - 文档 `body` 字段更新为新内容<br/>- `updated` 时间戳更新<br/>- 文档 `_id` 不变（update 而非 insert）<br/>- Motor `update_one` 延迟 < 5ms |

---

#### TC-SYNC-003: 删除文件 delete_one

| 字段 | 内容 |
|------|------|
| **ID** | TC-SYNC-003 |
| **层级** | L2 集成 |
| **优先级** | P0 |
| **前提** | MongoDB 中已存在该文件的文档 |
| **步骤** | 1. 从文件系统删除文件<br/>2. 扫描检测到 `deleted` 变更<br/>3. 调用 `writer.delete(file_path)` |
| **预期结果** | - MongoDB 中文档被删除（或标记为 deleted）<br/>- 日志记录删除事件<br/>- 后续 RAG 检索不再返回该文档 |

---

#### TC-SYNC-004: bulk_write 分批写入

| 字段 | 内容 |
|------|------|
| **ID** | TC-SYNC-004 |
| **层级** | L2 集成 |
| **优先级** | P1 |
| **前提** | 200+ 文件需要同步 |
| **步骤** | 1. 创建 200 个新 markdown 文件<br/>2. 触发全量扫描<br/>3. 检查日志中的批量写入信息 |
| **预期结果** | - `bulk_write` 以 1000 条为一批（_BULK_CHUNK）<br/>- 所有文件成功写入<br/>- `BulkWriteError` 被捕获并记录（不中断整体） |

---

#### TC-SYNC-005: MongoDB 索引验证

| 字段 | 内容 |
|------|------|
| **ID** | TC-SYNC-005 |
| **层级** | L2 集成 |
| **优先级** | P1 |
| **前提** | YiAi 首次启动，knowledge_files 集合已创建 |
| **步骤** | 1. 查询 MongoDB 集合索引<br/>2. `db.knowledge_files.getIndexes()`<br/>3. 验证每个索引 |
| **预期结果** | - `title` 单字段索引存在<br/>- `tags` 多键索引存在<br/>- `category` 索引存在<br/>- `roles` 索引存在<br/>- `lifecycle` 索引存在<br/>- `status` 索引存在<br/>- `title + body` 全文索引存在 |

---

### 2.5 快照对比与 RAG 触发

---

#### TC-SNAP-001: 快照对比 — 无变更时跳过

| 字段 | 内容 |
|------|------|
| **ID** | TC-SNAP-001 |
| **层级** | L2 集成 |
| **优先级** | P0 |
| **前提** | 文件树无变更 |
| **步骤** | 1. 首次构建快照 `_build_md_snapshot(base)`<br/>2. 60s 后再次构建快照<br/>3. 对比两个快照 |
| **预期结果** | - 快照对比返回空差异<br/>- 日志 "No changes detected, skipping"<br/>- 不触发 RAG 索引更新 |

---

#### TC-SNAP-002: 快照变更触发 RAG 增量重建

| 字段 | 内容 |
|------|------|
| **ID** | TC-SNAP-002 |
| **层级** | L2 集成 |
| **优先级** | P0 |
| **前提** | RAG Indexer 可用 |
| **步骤** | 1. 修改一个文件内容<br/>2. 构建新快照并与旧快照对比<br/>3. 检查是否触发 `indexer.build_file_index()` |
| **预期结果** | - 快照对比检测到 `size_bytes` 或 `mtime_ms` 变化<br/>- RAG Indexer 收到增量重建调用<br/>- 日志包含 "RAG incremental rebuild triggered" |

---

#### TC-SNAP-003: 快照仅记录 .md 文件

| 字段 | 内容 |
|------|------|
| **ID** | TC-SNAP-003 |
| **层级** | L1 单元 |
| **优先级** | P1 |
| **前提** | 目录中混合 .md 和其他类型文件 |
| **步骤** | 1. 调用 `_build_md_snapshot(base)`<br/>2. 检查返回的快照字典 |
| **预期结果** | - 快照仅包含 `.md` 文件<br/>- 不包含 `.txt`、`.json`、`.yaml` 等非 markdown 文件 |

---

<a id="sec-edge-cases"></a>
## 三、边界与异常测试

### TC-EDGE-001: base_dir 不存在时的处理

| 字段 | 内容 |
|------|------|
| **ID** | TC-EDGE-001 |
| **层级** | L2 集成 |
| **优先级** | P1 |
| **步骤** | 1. 配置 `knowledge.base_dir=/nonexistent/path`<br/>2. 启动 YiAi |
| **预期结果** | - 启动时不崩溃<br/>- 日志 WARNING: "Knowledge base directory not found, watcher disabled"<br/>- 其他服务正常运行 |

### TC-EDGE-002: 文件读取失败（权限不足）

| 字段 | 内容 |
|------|------|
| **ID** | TC-EDGE-002 |
| **层级** | L1 单元 |
| **优先级** | P1 |
| **步骤** | 1. 创建一个无读取权限的文件<br/>2. 扫描该文件 |
| **预期结果** | - `try/except` 捕获 `PermissionError`<br/>- 文件被跳过，不中断整体扫描<br/>- ERROR 日志记录文件路径 |

### TC-EDGE-003: Docker 环境下 mtime 精度为 1 秒

| 字段 | 内容 |
|------|------|
| **ID** | TC-EDGE-003 |
| **层级** | L2 集成 |
| **优先级** | P1 |
| **前提** | Docker volume 挂载，`osxfs` 驱动 `st_mtime` 精度 1 秒 |
| **步骤** | 1. 在 1 秒内修改文件两次<br/>2. 触发轮询扫描 |
| **预期结果** | - mtime 未变化时回退到 `content_hash` 对比<br/>- 双重检测确保不遗漏第二次变更 |

### TC-EDGE-004: MongoDB 不可达时跳过本轮同步

| 字段 | 内容 |
|------|------|
| **ID** | TC-EDGE-004 |
| **层级** | L2 集成 |
| **优先级** | P0 |
| **步骤** | 1. 停止 MongoDB<br/>2. 触发轮询扫描 |
| **预期结果** | - `write_to_mongo()` 抛出 `ServerSelectionTimeoutError`<br/>- 异常被捕获，日志记录 "MongoDB unreachable, skipping this round"<br/>- apscheduler 不中断，下次轮询继续<br/>- 重试最多 3 次后进入 `degraded` 状态 |

### TC-EDGE-005: 全量重建与增量扫描并发冲突

| 字段 | 内容 |
|------|------|
| **ID** | TC-EDGE-005 |
| **层级** | L2 集成 |
| **优先级** | P1 |
| **步骤** | 1. 手动触发 `rebuild_all()`（耗时约 5s）<br/>2. 同时 apscheduler 触发增量扫描<br/>3. 检查是否出现 `E11000 duplicate key error` |
| **预期结果** | - `asyncio.Lock` 保护，同时只有一个扫描任务执行<br/>- 增量扫描排队等待全量重建完成<br/>- 不出现 MongoDB 重复键错误 |

### TC-EDGE-006: 大文件 (> 5MB) 处理

| 字段 | 内容 |
|------|------|
| **ID** | TC-EDGE-006 |
| **层级** | L1 单元 |
| **优先级** | P2 |
| **步骤** | 1. 创建 6MB 的 markdown 文件<br/>2. 调用 `parser.parse()` |
| **预期结果** | - 文件大小超过 `MAX_FILE_SIZE` (5MB)<br/>- 仅提取 frontmatter，正文存储为 `content_truncated: true`<br/>- RAG 索引跳过该文件 |

### TC-EDGE-007: BOM 字符兼容 (UTF-8 BOM)

| 字段 | 内容 |
|------|------|
| **ID** | TC-EDGE-007 |
| **层级** | L1 单元 |
| **优先级** | P2 |
| **步骤** | 1. 创建包含 BOM 头 (`\ufeff`) 的 markdown 文件<br/>2. 调用 `parser.parse()` |
| **预期结果** | - BOM 字符被自动移除<br/>- Frontmatter 正常解析<br/>- 支持 `\ufeff` (UTF-8 BOM) 和 `\ufffe` (UTF-16 LE BOM) |

---

<a id="sec-regression"></a>
## 四、回归测试

### TC-REG-001: RPC list_files 仍正常返回

| 字段 | 内容 |
|------|------|
| **ID** | TC-REG-001 |
| **层级** | L2 集成 |
| **优先级** | P0 |
| **步骤** | 1. 调用 `services.knowledge.knowledge_service.list_files`<br/>2. 验证响应 |
| **预期结果** | - 返回文件树列表<br/>- 每个节点包含 `path`、`title`、`category` 字段<br/>- 与 Watcher 同步的数据一致 |

### TC-REG-002: 已有的 knowledge_files 数据不丢失

| 字段 | 内容 |
|------|------|
| **ID** | TC-REG-002 |
| **层级** | L2 集成 |
| **优先级** | P0 |
| **步骤** | 1. 确认 MongoDB 中已有 N 条 knowledge_files 文档<br/>2. 触发 Watcher 扫描<br/>3. 再次查询 knowledge_files 计数 |
| **预期结果** | - 文档数不变（无增删时）<br/>- 已有文档的关键字段不被覆盖<br/>- Content hash 相同时跳过更新 |

---

<a id="sec-traceability"></a>
## 五、需求-测试追溯矩阵

| PRD FR | 模块 | 测试用例 | 覆盖层级 |
|--------|------|---------|---------|
| FR-轮询调度 | Watcher | TC-WATCH-001~004 | L2 |
| FR-变更检测 | Scanner | TC-SCAN-001~005 | L1+L2 |
| FR-Frontmatter 解析 | Parser | TC-PARSE-001~005 | L1 |
| FR-MongoDB 同步 | Writer | TC-SYNC-001~005 | L2 |
| FR-快照对比 + RAG 触发 | Watcher + RAG | TC-SNAP-001~003 | L2 |
| FR-跨平台兼容 | Watcher | TC-EDGE-003 | L2 |
| FR-并发安全 | Watcher | TC-EDGE-005 | L2 |
| FR-容错与恢复 | Watcher | TC-EDGE-001~002, TC-EDGE-004, TC-EDGE-006~007 | L1+L2 |
| — | — | TC-REG-001~002 (回归) | L2 |

---

<a id="sec-coverage"></a>
## 六、覆盖缺口

| 缺口 | 原因 | 补救计划 |
|------|------|---------|
| 真实 macOS FSEvents 行为 | 当前仅测试轮询模式，FSEvents fallback 未覆盖 | 在 macOS CI 中增加文件系统事件测试 |
| 超大知识库性能 (5000+ 文件) | 测试环境文件数有限 | 使用脚本生成 5000 文件进行压测 |
| RAG 增量索引实际触发 | 需要完整 RAG 引擎运行 | 在 RAG 检索引擎测试中补充 |
| `apscheduler` 长时间运行稳定性 | 测试时间有限 | 使用 soak test（运行 24h）验证 |
| 定时任务异常恢复 (EVENT_JOB_ERROR) | 模拟 apscheduler 异常需框架级测试 | 在可观测性测试中补充 |

---

<a id="sec-references"></a>
## 七、参考文档

| 资源 | 路径 |
|------|------|
| 源 PRD | [02-需求-知识库监听器.md](../../prds/2026-07/02-需求-知识库监听器.md) |
| 源 Dev Module | [02-prd-task-知识库监听器.md](../../devs/2026-07/02-prd-task-知识库监听器.md) |
| RAG 检索引擎测试 | (待补充) |
| RAG 引擎稳定性修复 | [../2026-09/05-prd-test-RAG引擎.md](../2026-09/05-prd-test-RAG引擎.md) |
| Watcher bulk-write 部分失败 Bug | [../../bugs/2026-09/知识库/01-知识-Watcher-bulk-write部分失败.md](../../bugs/2026-09/知识库/01-知识-Watcher-bulk-write部分失败.md) |

---

*测试规格来源: `YiKnowledge/projects/yiai/prds/2026-07/02-需求-知识库监听器.md`*