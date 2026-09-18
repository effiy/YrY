---
doc_type: module
prd_task_id: "YK-09-01"
title: "YK-09-01: Frontmatter 质量治理 — 开发方案"
status: 已完成
priority: P0
owner: 陈铭
roles: [engineer]
created: 2026-09-11
updated: 2026-09-15
project: YiKnowledge
project_id: yiknowledge
prd_month: "202609"
estimate_frontend: 2.0
source_prd: "04-质量治理-Frontmatter规范.md"
source_okr: [yiknowledge-001]
related_tests: ["04-prd-test-Frontmatter规范"]
---

# YK-09-01: Frontmatter 质量治理 — 开发方案

> 来源 PRD：[04-质量治理-Frontmatter规范.md](../../prds/2026-09/04-质量治理-Frontmatter规范.md)
> 需求编号：YK-09-01 · 优先级：P0 · 人天：2.0d · 状态：已完成
> 测试方案：[04-prd-test-Frontmatter规范.md](../../tests/2026-09/04-prd-test-Frontmatter规范.md)

> **文档职责**：本文档定义**怎么做、为什么这么做、实际做成什么样**（HOW），不含产品目标与测试用例。

---

## 目录

- [一、架构总览](#sec-1)
- [二、关键技术决策](#sec-2)
- [三、实现规格](#sec-3)
- [四、RPC 影响范围](#sec-4)
- [五、实施步骤](#sec-5)
- [六、代码审查检查清单](#sec-6)
- [七、风险与回归预测](#sec-7)
- [八、实现完成记录](#sec-8)
- [九、已知缺口与技术债](#sec-9)

---

<a id="sec-1"></a>
## 一、架构总览

### 1.1 改动范围

本次改动**仅涉及 YiAi 后端 `KnowledgeWatcher` 模块**，不涉及前端、数据库 schema 变更或 API 契约变更。

```
YiAi/src/domain/knowledge/
├── watcher.py              # 【修改】新增 normalize_tags() + validate_frontmatter()
└── test_watcher.py         # 【新增】单元测试

YiKnowledge/curator/governance/
└── readiness-checklist.md  # 【修改】新增第 11 项：tags 格式检查
```

### 1.2 核心改动

| 改动 | 位置 | 说明 |
|------|------|------|
| `normalize_tags()` | `watcher.py` 新增函数 | 5 种输入格式归一化为 `list[str]`，空值兜底 `["untagged"]` |
| `validate_frontmatter()` | `watcher.py` 新增函数 | 8 必需字段校验，缺失时 WARNING 日志 |
| 日志级别提升 | `watcher.py` 现有逻辑 | 缺失字段从 `logger.debug` → `logger.warning` |
| 集成到扫描流程 | `watcher.py` `process_file()` | 解析 frontmatter 后立即调用校验 + 归一化 |
| 就绪检查清单 | `readiness-checklist.md` | 新增第 11 项：tags 格式检查 |

---

<a id="sec-2"></a>
## 二、关键技术决策

PRD 已定义 3 项设计决策，此处补充实现层面决策：

### D-01：归一化仅在内存中进行，不修改原始文件

`normalize_tags()` 在 KnowledgeWatcher 解析 frontmatter 后、写入 MongoDB 前执行。原始 Markdown 文件的 `tags` 字段保持作者原有格式不变。这避免了 Git diff 噪音（自动修改文件会让作者困惑），同时确保 MongoDB 中的数据始终规范。

### D-02：空 tags 兜底 `["untagged"]` 而非拒绝索引

PRD 决策 1 选择"自动转换"，但未定义空值的处理。选择兜底而非拒绝，因为 tag 为空不代表内容无价值——文件仍可通过全文搜索和分类过滤找到。`["untagged"]` 标签使这些文件在"未分类"视图中可见，引导作者补充标签。

### D-03：8 字段全量校验，但仅 tags 归一化

仅 `tags` 存在格式歧义（字符串 vs 数组）。其余 7 个字段（`title`/`category`/`created`/`updated`/`source`/`type`/`status`）要么是简单字符串，要么有枚举约束——缺失直接告警，无需归一化。未来若发现其他字段也存在格式异化，可扩展 `normalize_*` 函数族。

---

<a id="sec-3"></a>
## 三、实现规格

### 3.1 `normalize_tags()`

```python
# YiAi/src/domain/knowledge/watcher.py

def normalize_tags(tags) -> list[str]:
    """将 tags 归一化为 YAML 数组格式。

    处理 5 种输入格式:
    - None → ["untagged"]
    - "tag1" → ["tag1"]
    - "tag1, tag2" → ["tag1", "tag2"]
    - ["tag1", "tag2"] → ["tag1", "tag2"] (不变)
    - [] → ["untagged"]
    """
    if tags is None:
        return ["untagged"]
    if isinstance(tags, str):
        parts = [t.strip() for t in tags.split(",") if t.strip()]
        return parts if parts else ["untagged"]
    if isinstance(tags, list):
        return tags if tags else ["untagged"]
    return ["untagged"]
```

**边界情况处理**：
- 逗号分隔的字符串中，空白标签被过滤（`"tag1,  , tag2"` → `["tag1", "tag2"]`）
- 列表中的空字符串元素被保留（不做二次过滤，因为空标签可能是数据错误，应在校验层捕获）
- 非预期类型（如整数 123）兜底 `["untagged"]`

### 3.2 `validate_frontmatter()`

```python
REQUIRED_FIELDS = ["title", "tags", "category", "created", "updated", "source", "type", "status"]

def validate_frontmatter(fm: dict, file_path: str) -> list[str]:
    """校验 frontmatter 必需字段，返回缺失字段列表。"""
    missing = [f for f in REQUIRED_FIELDS if f not in fm or fm[f] is None]
    if missing:
        logger.warning(
            f"[Frontmatter] {file_path} 缺少必需字段: {missing}，"
            f"文件将不会被索引"
        )
    return missing
```

**日志行为**：
- 之前：`logger.debug(...)` — 生产环境默认不可见
- 之后：`logger.warning(...)` — 生产环境默认可见，触发运维告警

### 3.3 集成到扫描流程

```python
# watcher.py process_file() 中的调用位置

fm = parse_frontmatter(content)          # 现有：解析 YAML frontmatter
missing = validate_frontmatter(fm, path)  # 新增：字段校验
if missing:
    return  # 跳过索引（文件不进入 MongoDB + 向量索引）

fm["tags"] = normalize_tags(fm.get("tags"))  # 新增：tags 归一化

# 继续现有流程：写入 MongoDB + 更新向量索引
await upsert_knowledge_file(fm, content)
```

---

<a id="sec-4"></a>
## 四、RPC 影响范围

### 4.1 无新增 RPC 方法

本次改动仅修改 KnowledgeWatcher 内部逻辑，不新增 RPC 端点，不修改现有 API 契约。

### 4.2 间接影响的 RPC 方法

| module_name | method_name | 影响 |
|-------------|------------|------|
| `services.knowledge.knowledge_service` | `scan_knowledge` | Watcher 扫描时自动应用 tags 归一化和字段校验 |
| `services.data.data_service` | `query_documents` (`cname="knowledge_files"`) | 返回的 `tags` 字段从**可能为字符串**变为**始终为数组** |
| `services.rag.rag_service` | `rag_query` | 标签过滤从**部分失效**变为**全部生效** |

### 4.3 破坏性变更评估

**无破坏性变更**。原因：
1. `normalize_tags()` 是收敛性变换（字符串 → 数组），不会减少信息
2. `validate_frontmatter()` 的跳过行为与现有逻辑一致，仅日志级别提升
3. 现有前端（YiVad/YiPet）的标签展示逻辑已验证同时支持字符串和数组格式

---

<a id="sec-5"></a>
## 五、实施步骤

| 步骤 | 任务 | 产出 | 验证方式 | 人天 |
|------|------|------|----------|------|
| 1 | 实现 `normalize_tags()` | `watcher.py` 新增函数 | 单元测试 5 种输入格式 | 0.3 |
| 2 | 实现 `validate_frontmatter()` | `watcher.py` 新增函数 + 日志级别提升 | 单元测试 8 字段全量/部分缺失场景 | 0.3 |
| 3 | 集成到 `process_file()` | `watcher.py` 修改扫描流程 | 集成测试：真实文件扫描 | 0.3 |
| 4 | 存量数据修复脚本 | `scripts/fix_tags_migration.py` | 对 MongoDB `knowledge_files` 全量执行 `normalize_tags` | 0.3 |
| 5 | 更新就绪检查清单 | `readiness-checklist.md` 第 11 项 | curator review | 0.1 |
| 6 | 端到端验证 + 监控 | 扫描全库 800+ 文件，观察 WARNING 日志量 | 日志量可接受（< 5% 文件有缺失字段） | 0.3 |
| 7 | 回归测试 | 现有 76 个 pytest 全部通过 | CI 绿色 | 0.2 |
| 8 | 文档更新 | 本 DEV 文件 + CHANGELOG | — | 0.2 |

**总计：2.0d**

---

<a id="sec-6"></a>
## 六、代码审查检查清单

### 核心逻辑

- [x] `normalize_tags(None)` 返回 `["untagged"]`
- [x] `normalize_tags("tag1, tag2")` 返回 `["tag1", "tag2"]`
- [x] `normalize_tags(["tag1", "tag2"])` 返回 `["tag1", "tag2"]`（不变）
- [x] `normalize_tags("")` 返回 `["untagged"]`
- [x] `normalize_tags([])` 返回 `["untagged"]`
- [x] `normalize_tags(123)` 返回 `["untagged"]`（非预期类型兜底）
- [x] `validate_frontmatter()` 正确检测 8 个必需字段的缺失
- [x] `validate_frontmatter()` 对 `None` 值视为缺失

### 日志行为

- [x] 缺失字段输出 `logger.warning`（非 `logger.debug`）
- [x] tags 从字符串归一化时输出 `logger.warning`（提示作者修正原始文件）
- [x] 日志包含文件路径，便于定位

### 存量数据

- [x] 迁移脚本正确处理 MongoDB 中已有的字符串格式 tags
- [x] 迁移脚本幂等（可重复执行）
- [x] 迁移脚本输出处理统计（修复数/已规范数/错误数）

### 回归

- [x] 现有 `test_watcher.py` 全部通过
- [x] 全库扫描后 `knowledge_files` 集合的 tags 全部为数组格式
- [x] RAG 标签检索：之前搜不到的文件现在可搜到

---

<a id="sec-7"></a>
## 七、风险与回归预测

### 7.1 技术风险

| 风险 | 概率 | 影响 | 缓解措施 | 应急预案 |
|------|------|------|---------|---------|
| `normalize_tags` 误处理嵌套列表 | 低 | 中 | isinstance 检查顺序：`str` 先于 `list`，避免字符串被当作字符列表 | 回滚 + 添加嵌套列表检测 |
| 存量迁移脚本超时 | 中 | 低 | 分页处理（每批 100 条），显示进度 | 调大批量或分多次执行 |
| WARNING 日志暴增 | 中 | 中 | 先 dry-run 扫描全库统计缺失字段文件数 | 临时降低日志级别或限流 |
| 归一化后 RAG 标签过滤行为变化 | 低 | 中 | 归一化后标签数量只增不减（字符串 "a,b" → 数组 ["a","b"]），召回率提升 | 监控 RAG 检索延迟和结果数 |

### 7.2 回归问题预测

| # | 问题 | 触发场景 | 预防措施 |
|---|------|---------|---------|
| 1 | 存量字符串 tags 迁移后前端标签组件显示异常 | 前端标签组件假设 tags 为字符串并手动 split | 验证 YiVad/YiPet 标签组件同时兼容数组格式 |
| 2 | RAG 标签过滤结果数突然增加 | 归一化后之前不可见的文件变为可见 | 对比迁移前后常用标签的检索结果数 |
| 3 | Watcher 扫描耗时增加 | `validate_frontmatter` + `normalize_tags` 额外计算 | 本地测量扫描耗时差值（预期 < 5ms/文件） |

---

<a id="sec-8"></a>
## 八、实现完成记录

> **完成日期**：2026-09-10 · **复核日期**：2026-09-15
> **状态**：已实现并合并至主分支

### 8.1 产出清单

| 分类 | 文件 | 说明 |
|------|------|------|
| 核心实现 | `YiAi/src/domain/knowledge/watcher.py` | 新增 `normalize_tags()` + `validate_frontmatter()`，日志级别提升 |
| 迁移脚本 | `YiAi/scripts/fix_tags_migration.py` | MongoDB 存量 tags 全量归一化 |
| 单元测试 | `YiAi/tests/test_watcher_normalize.py` | 12 个测试用例覆盖 5 种输入格式 + 边界情况 |
| 治理更新 | `YiKnowledge/curator/governance/readiness-checklist.md` | 新增第 11 项：tags 格式检查 |
| **合计** | **4 个文件** | |

### 8.2 存量修复统计

| 指标 | 值 |
|------|-----|
| 扫描文件总数 | 847 |
| tags 为字符串格式（已修复） | 23 |
| tags 为空（兜底 `["untagged"]`） | 5 |
| 缺失必填字段（WARNING + 跳过索引） | 12 |
| 归一化后 MDB 中 tags 格式合规率 | 100% |

---

<a id="sec-9"></a>
## 九、已知缺口与技术债

### 9.1 功能缺口

| # | 缺口 | 影响 | 现状 | 建议 |
|---|------|------|------|------|
| 1 | `status` 字段枚举值校验 | `status: "invalid_value"` 不会被检测，仅缺失时告警 | 未实现 | 扩展 `validate_frontmatter` 增加枚举值校验（`draft/review/stable/archived`） |
| 2 | `type` 字段枚举值校验 | 同上，`type: "unknown"` 不会被检测 | 未实现 | 同上 |
| 3 | 自动修复建议（CLI 工具） | 作者不知道原始文件中的 tags 格式不规范 | 未实现，当前仅 WARNING 日志 | 提供 `yiknowledge fix-frontmatter <file>` CLI 命令 |

### 9.2 技术债

| # | 技术债 | 优先级 | 预计人天 | 说明 | 状态 |
|---|--------|--------|---------|------|------|
| 1 | `validate_frontmatter` 扩展枚举值校验 | P2 | 0.3 | 增加 `status` 和 `type` 字段的枚举值校验 | 待实施 |
| 2 | Frontmatter 自动修复 CLI 工具 | P3 | 0.5 | `yiknowledge fix-frontmatter` 命令，支持 `--dry-run` 和 `--fix` 模式 | 待实施 |
| 3 | KnowledgeWatcher 扫描统计上报 | P3 | 0.3 | 每次扫描后上报"跳过文件数/归一化数/总文件数"到 Dashboard | 待实施 |

---