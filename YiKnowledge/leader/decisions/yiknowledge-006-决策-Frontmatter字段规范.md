---
title: "ADR: YiKnowledge Frontmatter 强制字段与规范"
tags: [category/leader, 决策, adr, yiknowledge, frontmatter, metadata, yaml, governance]
category: leader/decisions
created: 2026-10-07
updated: 2026-10-07
source: internal
type: decision
status: stable
lifecycle: active
review_cycle: quarterly
roles: [leader, curator]
benefit: "YiKnowledge 所有知识叶子文件 Frontmatter 合规率 100%，RAG 召回准确率提升 40%，人机双读场景下结构化信息零歧义"
acceptance_criteria:
  - "强制字段完整定义：title/tags（含 category/决策/adr 关键词）/category/created/updated/source/type/status/lifecycle/review_cycle/roles/benefit/acceptance_criteria/related 共 15 项
  - "每个字段的取值范围、数据类型、示例、反模式明确
  - "curator/governance 下就绪检查清单自动校验脚本可检测字段缺失与取值越界"
related:
  - ./README.md
  - ../../curator/templates/0002-模板-知识叶子模板.md
  - ../../curator/templates/0001-模板-ADR模板.md
  - ../../curator/governance/0002-治理-治理规范.md
  - ../../curator/governance/0004-治理-就绪检查清单.md
  - ../../curator/INDEX.md
  - ../../README.md
  - ../../aier/foundations/0002-基础-RAG设计模式.md
---

# ADR: YiKnowledge Frontmatter 强制字段与规范

> **状态**：已接受 (2026-10-07)

---

## 上下文

YiKnowledge 目前 200+ 文件的 Frontmatter 字段不统一：
- 有的文件只有 `title/tags/category` 3 项，缺少 `created/updated/lifecycle` 等关键元数据
- `tags` 无规范：有的写 `adr`、有的写 `决策`、有的写 `category/leader` 混乱
- `benefit/acceptance_criteria/related` 等高价值字段只有模板里有，实际文件覆盖率 < 10%
- 参考 `curator/governance/0002-治理-治理规范.md:56-58`（每日 Frontmatter 抽查）要求抽查但没定义标准——Curator 只能凭感觉判断合不合规

影响面：
1. **RAG 召回弱**：aier/foundations/0002-基础-RAG设计模式.md 指出 metadata 是召回的关键信号，没有 `lifecycle/tags` 过滤器，RAG 会捞出 `deprecated` 状态的过期文件误导用户
2. **治理不可自动化**：Curator 每周人工扫文件，无法用脚本（`rg "^lifecycle:\s*active"` 之类）批量审计
3. **人机双读歧义**：AI（RAG 检索增强）和人类读同一个文件，对文件有效性、角色、更新时间的理解不一致
4. **就绪检查清单（0004-治理-就绪检查清单.md）没有客观标准**

为什么现在必须定：2026-Q3 curator OKR `cur-001-process-record-kb` 要求 Frontmatter 合规率从 10% → 100%（goal.md 第 3 条），没有规范就无法度量合规率。

---

## 决策

**YiKnowledge 所有新建知识文件（curator/templates 下模板类除外，模板自己定模板字段）必须采用统一 Frontmatter 规范，共 15 项强制字段 + 1 段 YAML 头 `--- ... ---` 包裹。本决策后新建文件不合规禁止发布。**

### 15 项强制字段完整定义

| # | 字段 | 类型 | 取值规范 | 示例 | 是否必填 |
|---|---|---|---|---|---|
| 1 | `title` | string | 人类可读标题，≤30字；用 `"..."` 包裹防特殊字符 | `"ADR: YiKnowledge Frontmatter 字段"` | ✅ 必填 |
| 2 | `tags` | list[string] | 小写/下划线；**必须至少包含 1 个 category/目录前缀**（如 `category/leader`）、**ADR 必须包含 `决策` 和 `adr` 两个关键词**；≤8 项；重复自动去重 | `[category/leader, 决策, adr, yiknowledge, frontmatter]` | ✅ 必填 |
| 3 | `category` | string | 精确匹配文件所在目录，相对 YiKnowledge 根目录；`aier/foundations` 这种多级目录也写完整 | `leader/decisions` | ✅ 必填 |
| 4 | `created` | date | `YYYY-MM-DD`，不可改；文件创建日期 | `2026-10-07` | ✅ 必填 |
| 5 | `updated` | date | `YYYY-MM-DD`，每次修改正文内容必须更新 | `2026-10-07` | ✅ 必填 |
| 6 | `source` | enum | `internal`（内部原创）/ `external`（外部转载）/ `mixed`（混合整理） | `internal` | ✅ 必填 |
| 7 | `type` | enum | `guide`（指南）/ `decision`（决策/ADR）/ `summary`（索引总结）/ `template`（模板）/ `report`（报告）/ `leaf`（标准知识叶子） | `decision` | ✅ 必填 |
| 8 | `status` | enum | `proposed`（提案）/ `stable`（稳定）/ `experimental`（实验）/ `deprecated`（废弃）/ `superseded`（被取代，需链接新版） | `stable` | ✅ 必填 |
| 9 | `lifecycle` | enum | `inbox`（收件箱）/ `triage`（已分类待精炼）/ `active`（活跃维护）/ `reference`（稳定参考）/ `archive`（归档） | `active` | ✅ 必填 |
| 10 | `review_cycle` | enum | `weekly` / `monthly` / `quarterly` / `yearly` / `adhoc`；Curator 按此安排审查节奏 | `quarterly` | ✅ 必填 |
| 11 | `roles` | list[string] | 读者角色，从 7 角色枚举取（leader/engineer/curator/product/executive/aier/sre），可多角色 | `[leader, curator]` | ✅ 必填 |
| 12 | `benefit` | string | 一句话价值主张；≤ 50 字，读者读完知道"这文件能帮我什么"；面向用户非作者 | `"用统一 frontmatter 让 RAG 召回率 +40%"` | ✅ 必填 |
| 13 | `acceptance_criteria` | list[string] | 可验证验收标准 3-5 条；每条以动词开头，可判定 T/F；不可写"提升质量"空话 | `["就绪检查清单含 frontmatter 校验"]` | ✅ 必填 |
| 14 | `related` | list[string] | **5-8 个相对路径真实存在**的文件链接；含至少 1 个上游索引 + 2 个同目录 + 1 个跨目录文档；用 `../../dir/file.md` 形式 | `["../../curator/governance/0002-治理-治理规范.md", ...]` | ✅ 必填 |
| 15 | `aliases` | list[string] | 可选字段；别名，用于 RAG 重名召回；不强制 | `[frontmatter-spec, metadata-spec]` | ⚪ 可选 |

### 约束与组合规则

1. **tags 关键词强制**：
   - 目录 = `leader/decisions` 的 ADR 文件 → tags 列表 **必须包含** `"决策"` + `"adr"` + `"category/leader"`
   - 其他目录 → tags 至少含 `category/<目录名最末一级>`，例：engineer/run → 至少 `category/engineer`（允许写完整 `category/engineer/run`）
2. **category 必须和路径一致**：写脚本自动校验 `file_path.contains(f.category.replace("-", "/"))`（序号前缀忽略），不一致直接 CI 报错
3. **status/lifecycle 合法组合矩阵**：
   | status ↓ \ lifecycle → | inbox | triage | active | reference | archive |
   |---|---|---|---|---|---|
   | proposed | ✅ | ✅ | ❌ | ❌ | ❌ |
   | stable | ❌ | ❌ | ✅ | ✅ | ❌ |
   | experimental | ❌ | ❌ | ✅ | ❌ | ❌ |
   | deprecated | ❌ | ❌ | ❌ | ✅ | ❌ |
   | superseded | ❌ | ❌ | ❌ | ❌ | ✅ |
4. **roles 7 角色枚举**：`{leader, engineer, curator, product, executive, aier, sre}`——超出 7 个视为非法，需先提案扩展 7 角色（yiknowledge-07 ADR）

---

## 备选评估

| 替代方案 | 优点 | 缺点 | 否决原因 |
|---|---|---|---|
| **方案 A：字段最小化（只强制 title/tags/category/created） | 旧文件迁移成本低；作者写起来简单** | benefit/acceptance_criteria/related 这些高价值信号缺失；RAG 无法过滤 lifecycle/status；治理无法自动化** | 无法满足 Q3 curator OKR 目标（合规率 100%）；治理回到人工审查 |
| **方案 B：引入 JSON Schema 或 YAML Schema 做强类型校验** | 类型、枚举、取值范围 100% 可编程校验；IDE 插件可自动补全** | Schema 本身维护是额外成本；团队 0 人有 JSON Schema 经验；CI 要装 yamllint + schema 插件 | 一次性收益抵不上长期维护成本；先用清单（就绪检查 10 题门禁 + rg 脚本）足够 |
| **方案 C（已选择）：15 项强制字段 + 合法组合矩阵 + rg 脚本辅助校验** | 字段全面覆盖 RAG 信号+治理需求；无额外工具依赖，纯规范 + 现有 rg/Find 工具可审计；Q3 OKR 可度量 | 旧 200 文件一次性回填约 1 人天工作量；新作者第一次写要对着规范 | 1 人天工作量 Q3 有缓冲；规范加 15 字段清单模板（模板里预填好 skeleton），复制粘贴即可完成 80% |

---

## 后果

### 正面影响
- **RAG 召回 +40%**：`lifecycle/active` 过滤掉归档，`roles` 过滤不相关角色，`tags/category/决策/adr` 增强关键词匹配——RAG 设计模式 ADR 估算提升约 40%
- **治理可度量可自动化**：`rg "^status:\s*deprecated"` 一键找废弃文件、`rg "^review_cycle:\s*quarterly"` 安排季度审查队列——Curator 每周工时从 2 小时 → 20 分钟
- **人和 AI 理解一致**：不管人类还是 LLM 读文件，先扫 Frontmatter 就能判断"这东西还有没有效、写给谁看、多久没更、该找谁审"
- **OKR 可追踪**：cur-001 OKR 第 3 条 frontmatter 合规率从 10% → 100% 有明确判定标准，可自动算分

### 负面影响
- **旧文件回填 1 人天**：200 文件缺失 benefit/acceptance_criteria/related 的 50+ 文件需要手工回填（related 要找真实文件），约 1 人天
- **新作者学习成本**：第一次新建文件要对 15 字段列表，约多出 3-5 分钟——模板（0002-模板-知识叶子模板.md）提前填好 skeleton，实际只改 title/tags/category/benefit/related 5 项，其他默认复制即可
- **related 5-8 真实链接负担**：要求 5-8 个真实链接，新作者可能为凑链接乱填——Curator 审查时 grep related 字段 + `[ -f path ]` 脚本校验文件不存在直接打回

### 中性影响
- **与 yiknowledge-07（7 角色）的协作**：roles 字段枚举 7 角色定义以 yiknowledge-07 ADR 为准，那篇变更时 roles 合法取值同步变更
- **与 yiknowledge-10（生命周期 4 阶段）的协作**：lifecycle 枚举以 yiknowledge-10 ADR 为准，inbox/triage/active/reference/archive 五态映射到 4 阶段
- **status = superseded 需补充 superseded_by 字段**：本决策中暂不强制（可选字段），后续若 superseded 文件多再升级为必填

---

## Status

**状态：accepted（已接受）**

**日期：2026-10-07**

**落地计划：**
1. 01-07 当天：本决策 + 回填 13 份新建文件（本任务要求）Frontmatter 全部符合本规范
2. 一周内：更新 curator/templates/01-02 模板，预填好 15 字段 skeleton，新文件复制改 5 项即可
3. 两周内：curator/governance/04-就绪检查清单.md 新增 Frontmatter 5 题门禁
4. 一个月内：旧文件回填完成 50%（优先补高流量文件如 README/INDEX/决策 ADR）
5. Q3 结束前：旧文件回填 100%
