---
doc_type: test
title: "YK-09-01: Frontmatter 质量治理 — 测试用例"
status: 已完成
priority: P0
owner: 陈铭
roles: [engineer, qa]
created: 2026-09-15
updated: 2026-09-15
project: YiKnowledge
project_id: yiknowledge
prd_month: "202609"
prd_task_id: "YK-09-01"
source_prds: ["04-质量治理-Frontmatter规范"]
source_modules: ["04-prd-task-Frontmatter规范"]
source_okr: [yiknowledge-001]
---

# YK-09-01: Frontmatter 质量治理 — 测试用例

> 来源 PRD：[04-质量治理-Frontmatter规范.md](../../prds/2026-09/04-质量治理-Frontmatter规范.md)
> 开发方案：[04-prd-task-Frontmatter规范.md](../../devs/2026-09/04-prd-task-Frontmatter规范.md)
> 需求编号：YK-09-01 · 优先级：P0

> **文档职责**：本文档定义**怎么验证**（VERIFY），不含产品目标与实现方案。

---

## 目录

- [一、测试范围与目标](#sec-1)
- [二、测试策略](#sec-2)
- [三、测试环境与前置条件](#sec-3)
- [四、准入与准出标准](#sec-4)
- [五、单元测试](#sec-5)
- [六、集成测试](#sec-6)
- [七、端到端场景](#sec-7)
- [八、缺陷分级](#sec-8)
- [九、自动化现状](#sec-9)

---

<a id="sec-1"></a>
## 一、测试范围与目标

### 1.1 在范围内

| 范围 | 内容 |
|------|------|
| `normalize_tags()` | 5 种输入格式（None/单字符串/逗号字符串/数组/空数组）+ 3 个边界情况 |
| `validate_frontmatter()` | 8 必需字段全量/部分缺失/全部缺失/None 值 |
| 日志行为 | DEBUG → WARNING 级别提升验证 |
| 集成到扫描流程 | `process_file()` 调用顺序：校验 → 归一化 → 写入 MDB |
| 存量迁移脚本 | 幂等性、字符串 tags 修复、统计输出 |
| 回归 | 现有 76 个 pytest 全部通过，RAG 标签检索恢复 |

### 1.2 不在范围内

| 排除项 | 原因 |
|--------|------|
| `status`/`type` 字段枚举值校验 | DEV §9 列为技术债 |
| 前端标签组件兼容性 | 已验证兼容（前端改动不属于本次范围） |
| CLI 自动修复工具 | DEV §9 列为技术债 |

---

<a id="sec-2"></a>
## 二、测试策略

| 层级 | 框架 | 覆盖内容 | 占比 |
|------|------|---------|------|
| 单元测试 | pytest | `normalize_tags` 8 个用例 + `validate_frontmatter` 5 个用例 | 60% |
| 集成测试 | pytest + 临时文件 | KnowledgeWatcher 扫描含异常 frontmatter 的 Markdown 文件 | 25% |
| 端到端 | 手动验证 | 全库扫描 → MongoDB 验证 → RAG 标签检索验证 | 15% |

---

<a id="sec-3"></a>
## 三、测试环境与前置条件

### 3.1 环境要求

| 组件 | 要求 |
|------|------|
| Python | 3.10+ |
| pytest | 8.x + pytest-asyncio |
| MongoDB | 可写测试数据库（`test_knowledge`） |
| 测试文件 | `tests/fixtures/frontmatter/` 下准备异常格式的 Markdown 文件 |

### 3.2 测试数据准备

```bash
# 测试 fixtures 目录结构
tests/fixtures/frontmatter/
├── valid_full.md           # 8 字段完整，tags 为数组
├── tags_string.md          # tags 为逗号分隔字符串
├── tags_single.md          # tags 为单字符串
├── tags_empty.md           # tags 为空数组
├── tags_missing.md         # 缺少 tags 字段
├── title_missing.md        # 缺少 title 字段
├── multi_field_missing.md  # 缺少 title + category
└── all_fields_missing.md   # 仅含空 frontmatter `---\n---`
```

---

<a id="sec-4"></a>
## 四、准入与准出标准

### 4.1 准入门槛

| 条件 | 判定方法 |
|------|---------|
| MongoDB 测试实例运行 | `mongosh --eval "db.runCommand({ping:1})"` |
| pytest 可执行 | `python -m pytest --version` |
| 测试 fixtures 已准备 | 8 个测试 Markdown 文件就绪 |

### 4.2 准出标准

| 条件 | 阈值 |
|------|------|
| 全部单元测试通过 | 100%（13 个用例） |
| 全部集成测试通过 | 100% |
| 现有 pytest 无回归 | 76 个测试全部绿色 |
| 存量迁移后 MDB `knowledge_files.tags` 合规率 | 100%（全部为数组类型） |
| RAG 标签检索：之前不可见的文件现在可见 | 已验证 |

---

<a id="sec-5"></a>
## 五、单元测试

### 5.1 `normalize_tags()` — 5 种输入格式

| 编号 | 用例 | 输入 | 预期输出 |
|------|------|------|---------|
| UT-NT-01 | None → 兜底 | `None` | `["untagged"]` |
| UT-NT-02 | 单字符串 | `"tag1"` | `["tag1"]` |
| UT-NT-03 | 逗号分隔字符串 | `"tag1, tag2, tag3"` | `["tag1", "tag2", "tag3"]` |
| UT-NT-04 | YAML 数组（不变） | `["tag1", "tag2"]` | `["tag1", "tag2"]` |
| UT-NT-05 | 空数组 → 兜底 | `[]` | `["untagged"]` |

### 5.2 `normalize_tags()` — 边界情况

| 编号 | 用例 | 输入 | 预期输出 |
|------|------|------|---------|
| UT-NT-06 | 空白标签被过滤 | `"tag1,  , tag2"` | `["tag1", "tag2"]` |
| UT-NT-07 | 仅逗号无内容 | `","` | `["untagged"]` |
| UT-NT-08 | 非预期类型（整数） | `123` | `["untagged"]` |

### 5.3 `validate_frontmatter()` — 字段校验

| 编号 | 用例 | 输入 | 预期 |
|------|------|------|------|
| UT-VF-01 | 8 字段完整 | 全部必需的 8 字段 | 返回 `[]` |
| UT-VF-02 | 缺少 1 个字段 | 缺 `tags` | 返回 `["tags"]` |
| UT-VF-03 | 缺少多个字段 | 缺 `title`, `category` | 返回 `["title", "category"]` |
| UT-VF-04 | 字段值为 None | `tags: null` | 返回 `["tags"]` |
| UT-VF-05 | 空 frontmatter | `{}` | 返回 8 个缺失字段列表 |

### 5.4 日志级别验证

| 编号 | 用例 | 条件 | 预期 |
|------|------|------|------|
| UT-LG-01 | 缺少字段输出 WARNING | `validate_frontmatter` 发现缺失字段 | `caplog` 捕获到 WARNING 级别日志 |
| UT-LG-02 | WARNING 日志含文件路径 | 缺失字段的文件路径为 `test/file.md` | 日志消息包含 `test/file.md` |
| UT-LG-03 | 正常文件不输出 WARNING | 8 字段完整 | `caplog` 无 WARNING（或仅 DEBUG/INFO） |

---

<a id="sec-6"></a>
## 六、集成测试

### 6.1 KnowledgeWatcher 扫描流程

| 编号 | 场景 | setup | 预期 |
|------|------|-------|------|
| IT-SC-01 | 扫描 tags 为字符串的文件 | 测试文件 `tags_string.md`（tags: "a, b"） | `knowledge_files` 中 tags 为 `["a", "b"]` |
| IT-SC-02 | 扫描缺少 title 的文件 | 测试文件 `title_missing.md` | WARNING 日志输出，文件不被写入 `knowledge_files` |
| IT-SC-03 | 扫描正常文件 | 测试文件 `valid_full.md` | 正常写入 MDB，tags 保持数组不变 |
| IT-SC-04 | 扫描空 frontmatter 文件 | 测试文件 `all_fields_missing.md` | WARNING 日志列出全部 8 个缺失字段 |
| IT-SC-05 | 扫描后 RAG 标签检索恢复 | 变更前：`tags_string.md` 按 "a" 标签搜不到 | 变更后：`tags_string.md` 按 "a" 标签能搜到 |

### 6.2 存量迁移脚本

| 编号 | 场景 | setup | 预期 |
|------|------|-------|------|
| IT-MG-01 | 修复字符串 tags | MDB 中 1 条记录 `tags: "x, y"` | 迁移后 `tags: ["x", "y"]` |
| IT-MG-02 | 已是数组不受影响 | MDB 中 1 条记录 `tags: ["x"]` | 迁移后不变 |
| IT-MG-03 | 幂等性 | 连续执行 2 次迁移 | 结果一致，统计数相同 |
| IT-MG-04 | 统计输出 | 3 条需修复 + 7 条已规范 | 输出 `fixed: 3, skipped: 7, errors: 0` |

---

<a id="sec-7"></a>
## 七、端到端场景

### 场景 1：存量文件修复验证

| 步骤 | 操作 | 验证点 |
|------|------|--------|
| 1 | 查询 MDB：`db.knowledge_files.find({"tags": {$type: "string"}})` | 记录字符串格式 tags 的文件数（基线） |
| 2 | 执行迁移脚本 `python scripts/fix_tags_migration.py` | 输出修复统计 ≥ 基线数 |
| 3 | 再次查询 MDB 字符串格式 tags | 结果为 0 |
| 4 | 验证 RAG 标签检索：搜索之前失效的标签 | 之前搜不到的文件现在出现在结果中 |

### 场景 2：新增文件自动归一化

| 步骤 | 操作 | 验证点 |
|------|------|--------|
| 1 | 在 YiKnowledge 中新建文件，tags 写为字符串 `"test, demo"` | 文件保存到磁盘 |
| 2 | 等待 KnowledgeWatcher 扫描（≤ 60s）或手动触发扫描 | 扫描完成 |
| 3 | 查询 MDB 该文件的 tags 字段 | 值为 `["test", "demo"]`（数组格式） |
| 4 | 检查 WARNING 日志 | 日志提示 tags 从字符串归一化，建议修正原始文件 |

### 场景 3：全库扫描无回归

| 步骤 | 操作 | 验证点 |
|------|------|--------|
| 1 | 清空 MDB `knowledge_files` 集合 | — |
| 2 | 触发全量扫描 | Watcher 扫描全部 800+ 文件 |
| 3 | 检查 WARNING 日志量 | < 5% 文件有缺失字段告警 |
| 4 | 运行现有 pytest | 76 个测试全部通过 |
| 5 | 验证 RAG 检索 | 常用查询结果数不低于变更前 |

---

<a id="sec-8"></a>
## 八、缺陷分级

| 级别 | 定义 | 示例 |
|------|------|------|
| S0 — 阻断 | `normalize_tags` 导致 KnowledgeWatcher 崩溃 | 全库扫描中断，文件不再被索引 |
| S1 — 严重 | tags 归一化错误导致标签检索失效 | `"a, b"` 归一化为 `["a b"]`（丢失逗号分隔） |
| S2 — 一般 | 边界情况处理不当 | 非预期类型输入未兜底导致异常 |
| S3 — 轻微 | 日志信息不完整 | WARNING 日志未包含文件路径 |

---

<a id="sec-9"></a>
## 九、自动化现状

| 模块 | 状态 | 文件 | 说明 |
|------|------|------|------|
| `normalize_tags` 单元测试 | ✅ 已完成 | `tests/test_watcher_normalize.py` | 12 个用例 |
| `validate_frontmatter` 单元测试 | ✅ 已完成 | 同上 | 5 个用例 |
| 扫描流程集成测试 | ✅ 已完成 | `tests/test_watcher_integration.py` | 5 个用例 |
| 存量迁移脚本测试 | ✅ 已完成 | `tests/test_fix_tags_migration.py` | 4 个用例 |
| 回归测试 | ✅ 已完成 | `python -m pytest tests/ -v` | 76 个测试全部通过 |

> 全部测试已自动化，CI 中 `pytest` 步骤覆盖。

---