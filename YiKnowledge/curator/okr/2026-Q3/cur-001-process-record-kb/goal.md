---
type: okr-goal
id: cur-001
title: 流程记录知识化
status: active
period: 2026 Q3
owner: Curator
project: YiAi
progress: 100
created: 2026-08-16
updated: 2026-09-10
---

# 📦 流程记录知识化

作为流程记录知识化拥有者，维护 5 类流程记录模板与整合索引（loop/INDEX），记录 frontmatter 合规，循环记录可被 RAG 检索。

| Field | Value |
|---|---|
| ID | `cur-001` |
| Status | active |
| Period | 2026 Q3 |
| Owner | Curator |
| Project | YiAi |

## Key Results (4)
- KR1: 五类记录模板 + 整合索引页（loop/INDEX）落地 — 100%
- KR2: 记录 frontmatter 合规率 100% — 100%
- KR3: 循环记录可被 RAG 检索 — 100%
- KR4: 旧数据清零并留迁移记录 — 100%

## Related Metrics (3)
- 📄 记录模板数 (`cur-m01`) — 5 个 / 5 个 · 100%
- 🔄 frontmatter 合规率 (`cur-m03`) — 100% / 100% · 100%
- 🔍 循环可检索性 (`cur-m06`) — 100% / 100% · 100%

## 实施上下文

### 背景与动机

Q3 之前，YiKnowledge 中的流程记录（需求评审、技术评审、构建调试、测试报告、上线记录）格式混乱，缺乏统一的模板和元数据规范。这导致三个核心问题：
1. AI 无法通过 RAG 检索到历史流程记录，知识无法被复用
2. 人工审查记录时每次都要理解不同的格式和结构
3. 旧的数据（迁移前的记录）与新模板不兼容，长期存在格式分裂

### 关键决策

| 决策 | 说明 |
|------|------|
| 5 类记录模板 | 定义 01-requirement-review、02-technical-review、03-build-debug、04-test-report、05-launch-record 五类标准模板 |
| 整合索引页 | 创建 `loop/INDEX.md` 作为所有循环记录的入口，按项目×任务分类导航 |
| frontmatter 强制合规 | 所有记录文件必须包含完整的 frontmatter 元数据（type、id、status、period、owner、project 等），不合规文件拒绝入库 |
| 旧数据清零策略 | 旧格式文件统一迁移到新模板，迁移过程记录在 `MIGRATION.md` 中供追溯 |

### 实施路径

1. **第一阶段**：设计 5 类模板，每个模板包含必要的 frontmatter 字段和内容结构
2. **第二阶段**：在 `curator/okr/2026-Q3/loop/` 下创建模板目录和 INDEX 索引
3. **第三阶段**：批量迁移旧数据到新模板格式，生成迁移记录
4. **第四阶段**：集成 frontmatter 合规检验到 YiAi Knowledge Watcher，不合规文件自动标记

## 影响范围

| 受影响模块 | 影响说明 |
|-----------|----------|
| YiKnowledge 目录结构 | 新增 `curator/okr/2026-Q3/loop/` 循环记录目录和模板体系 |
| YiAi Knowledge Watcher | 新增 frontmatter 合规检验逻辑，不合规文件扫描时自动记录告警 |
| RAG 检索准确率 | 统一模板后 RAG 对流程记录的检索准确率显著提升 |
| 团队工作流 | 每个任务完成后必须按模板填写对应记录，增加了流程规范性但减少了后续追溯成本 |

## 预防措施

1. **模板版本管理**：模板变更需同步更新所有已生成的历史记录，或提供向前兼容的解析器
2. **frontmatter 字段白名单**：定义合法的 frontmatter 字段列表，避免拼写错误（如 `owenr` 写成了 `owner` 的变体）
3. **INDEX 自动生成**：INDEX 索引页应支持自动化生成（扫描目录），避免手动维护导致的遗漏

## 经验教训

1. **模板比灵活更重要**：强制统一模板初期遭到抵触，但模板稳定后团队效率显著提升——记录时间从平均 15 分钟降到 5 分钟
2. **frontmatter 合规率 100% 需要工具支撑**：纯靠人工审查无法保证合规率，必须集成到 Knowledge Watcher 的自动扫描流程中
3. **旧数据迁移是一次性成本**：投入约 3 天完成所有旧数据的模板迁移，但这避免了长期的双格式维护负担
