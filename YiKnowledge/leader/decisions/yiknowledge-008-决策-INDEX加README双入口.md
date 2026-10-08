---
title: "ADR: YiKnowledge 每个目录强制 INDEX.md + README.md 双入口机制"
tags: [category/leader, 决策, adr, yiknowledge, index, readme, dual-entry, navigation]
category: leader/decisions
created: 2026-10-07
updated: 2026-10-07
source: internal
type: decision
status: stable
lifecycle: active
review_cycle: quarterly
roles: [leader, curator]
benefit: "任何目录下人类 2 跳内找到内容，AI RAG 通过 INDEX 的结构化导航 + README 的语义描述，召回率提升 30%；新人入职路径清晰无死角"
acceptance_criteria:
  - "INDEX.md 定位：结构化导航 + 表格索引 + 新人路径 + 审查流程；README.md 定位：语义定位 + 流水线阶段 + 范围边界 + 反模式
  - "所有含 ≥3 个 md 文件的目录（18 个目录级）必须都有双入口，覆盖率 100%
  - "INDEX 和 README 的 Frontmatter 的 `type` 字段区分：INDEX.md 必须 `type=index`、README.md 必须 `type=summary`
related:
  - ./README.md
  - ./yiknowledge-yiknowledge-yiknowledge-007-决策-7角色目录划分.md
  - ../../curator/governance/0002-治理-治理规范.md
  - ../../curator/governance/0004-治理-就绪检查清单.md
  - ../../curator/INDEX.md
  - ../../curator/README.md
  - ../../README.md
  - ../../curator/diagrams/0002-图表-目录蓝图.md
---

# ADR: YiKnowledge 每个目录强制 INDEX.md + README.md 双入口机制

> **状态**：已接受 (2026-10-07)

---

## 上下文

当前 YiKnowledge 目录入口混乱：
- 有的目录只有 README（如 curator/templates/、engineer/build/）
- 有的目录只有 INDEX（如 executive/strategy/、aier/）
- 少数大目录两个都有（curator/、engineer/），但内容重复——README 和 INDEX 都是"子目录列表 + 说明"
- 参考 `curator/INDEX.md:22-65` 和 `curator/README.md:37-156`——INDEX 更偏表格索引 + 新人路径，README 更偏角色定位 + 生命周期，但两者没有明确分工，写的时候靠感觉

结果：
1. **人类找内容要 3-5 跳**：新人进入 `engineer/`，如果只有 README 没表格索引，要逐个点子目录看名字才能知道"CodeReview 指南在哪"
2. **AI RAG 召回边界模糊**：没有明确的"INDEX 结构化导航"和"README 语义锚点"双信号，RAG 无法区分"这个目录的范围是什么（README）"和"这个目录下有什么文件（INDEX）"
3. **Curator 审查无标准**：就绪检查清单（0004-治理-就绪检查清单.md）没写"新建子目录要不要加 INDEX/README"，Curator 凭感觉提醒

为什么现在定：
- Q3 Curator OKR `cur-001 loop-retrievability`（goal.md 第 6 条）要求 2 跳内可检索率从 60%→95%，没有双入口机制做不到
- yiknowledge-07（7 角色）刚明确了 7 大目录 + N 个子目录，所有目录统一双入口需要决策

---

## 决策

**YiKnowledge 所有 ≥3 个 md 文件的目录（顶层 7 角色目录 + 子目录 ≥3 文件的），强制同时存在 INDEX.md + README.md，两者分工明确不可互相替代。**

### 双入口分工表（核心规则）

| 维度 | INDEX.md | README.md |
|---|---|---|
| **定位** | 结构化导航总索引（给人快速找文件） | 语义定位说明书（给人+AI 理解这个目录是啥） |
| **Frontmatter `type`** | **必须 `type: index`** | **必须 `type: summary`** |
| **Frontmatter `category`** | 写本目录路径，例：`category: curator` | 同左 |
| **读者入口** | **人类读者第一入口**：打开目录先看 INDEX 找东西 | **AI 召回第一入口**：RAG 先读 README 判断"这个目录和查询相关吗" |
| **必含章节** | ① 子目录映射表（表格列：领域/内容/核心用途）；② 快速导航：新人阅读路径（按顺序编号）；③ 审查流程/发布流程；④ 交叉引用 | ① 本目录一句话定位；② 范围（范围内/范围外/边界决策规则表）；③ 在流水线/角色中的位置（Pipeline 定位）；④ 反模式 / 常见误用（3-6 条）；⑤ 快速导航或核心观点 |
| **必含表格** | 至少 1 张「子目录 → 内容 → 用途」映射表 | 至少 1 张「边界情况决策规则」或「范围外清单」表 |
| **反模式章节** | 可选（不强制） | **强制**：≥3 条"常见误用/放错内容的反模式" |
| **交叉引用** | 必须链到：同目录 README.md + 上层 INDEX + 下层 INDEX | 必须链到：同目录 INDEX.md + 上层 README |
| **更新频率** | 每次新增/删除/移动文件都更新 | 季度审查更新（或目录定位变更时更新） |
| **长度建议** | 可长（100-300 行表格和路径都行） | 必短（≤150 行，语义精要） |

### 反例：当前 curator/ 的两份内容（改造方向）

- `curator/INDEX.md`（改造前就对，符合 INDEX 定位）：已经有子目录表、新人路径、审查流程 ✓ → 维持
- `curator/README.md`（改造前就对，符合 README 定位）：已经有范围边界表、Pipeline 定位、反模式章节（5 条）✓ → 维持
- 其他 16+ 目录现在单入口的，按本分工补齐缺失的那份

### 强制双入口目录清单（启动时 18 个，后续动态）

根据当前 200 文件分布，首批必须强制补齐双入口的目录：
1. 顶层 7 角色目录：executive/、product/、leader/、engineer/、sre/、aier/、curator/ → 约 3-4 个缺一份
2. 子目录 ≥3 文件：leader/architecture、leader/decisions、leader/roadmap、engineer/run、engineer/build、engineer/ship、curator/governance、curator/templates、executive/strategy、product/delivery、aier/methods 等 → 约 11-15 个目录缺一份

共计首批约 14-19 份文件要新建或重写。

---

## 备选评估

| 替代方案 | 优点 | 缺点 | 否决原因 |
|---|---|---|---|
| **方案 A：单入口制，每个目录只留 README.md** | 简单，没有 INDEX/README 双份维护成本 | 结构化表格索引（大目录 30+ 文件表格）放 README 会让 README 又长又乱，丢掉"语义精要"的定位；AI 召回结构化导航信号弱 | 大目录（如 executive/strategy 50+ 文件）没有 INDEX 的表格，新人找文件要点开 10 个子目录才能找到——2 跳内检索率目标无法达成 |
| **方案 B：单入口制，每个目录只留 INDEX.md** | 找东西方便 | 语义定位、范围边界、反模式这种"为什么"的内容放 INDEX 会让表格和说明混在一起——INDEX 失去"快速查找"的作用；AI 召回边界判断信号缺失 | 单入口不可能同时满足"快速找"和"理解边界"——两种目标必须两个文档承载 |
| **方案 C（已选择）：双入口 + 明确分工（type 字段区分）+ 强制必含章节** | 人类 2 跳内找东西（INDEX） + AI 边界召回强（README）；大目录和小目录都适用；分工有明确 check list 不会写重复 | 双份维护：新增/删除文件要更新 INDEX，季度要审查 README；启动时 14-19 份补写工作量约 2 人天 | 2 人天 Q3 可承受；INDEX 仅表格 + 路径 + 流程，新增文件更新 1 行表格仅 5 秒，维护成本可忽略 |

---

## 后果

### 正面影响
- **人类 2 跳内检索率 +35%**：新人进 `leader/` → 点 INDEX → 找到 `decisions/` 子目录路径 → 再点 decisions/INDEX → 找到"yipot-xx ADR"，共 2 跳；按现状缺 INDEX 的目录需要 4-5 跳
- **AI RAG 召回边界准确率 +30%**：RAG 先命中 README（type=summary，语义判断"和 executive OKR 相关吗？是 → 进 executive/README 看范围 → 再进 executive/INDEX 找具体文件"，避免召回大量错误目录下的内容
- **Curator 审查有标准**：就绪检查清单加 1 题——"如果是目录级新建（≥3 文件），INDEX 和 README 都到位了吗？各自 type 字段写对了吗？"
- **新人入职路径清晰**：每个角色目录 INDEX 有"新人按此顺序阅读 xx-yy-zz"，7 角色 7 条路径，不需要 Mentor 口口相传

### 负面影响
- **启动补写 2 人天**：14-19 份入口文档，每份约 10 分钟写表格/范围/反模式，合计约 2 人天
- **双入口维护心智负担**：Author 移动文件时容易忘更新 INDEX；Curator 每次 PR 合并前跑 `rg -l 'filename.md'` 看 INDEX 有没有对应行
- **小目录 1-2 文件也要双入口有点重**：sre/run/ 只有 2 文件的目录也要双份——实际操作：sre/run/README 50 行 + INDEX 10 行表格，10 分钟写完，成本可接受

### 中性影响
- **与 yiknowledge-06（Frontmatter）的协作**：INDEX.md 强制 `type=index`、README 强制 `type=summary`；cur-001 OKR Frontmatter 合规率脚本里加校验，`/INDEX.md` 结尾的文件 type 不是 index 直接报错
- **与 yiknowledge-07（7 角色）的协作**：每个角色目录的 README 要写清楚"本目录在流水线位置"，本 ADR 的双入口分工和 yiknowledge-07 的 7 角色范围对应
- **projects/ 辅助目录豁免**：projects/yiai/ 这种视图层镜像目录，README 写聚合说明，INDEX 写项目导航，规则相同但允许写得更精简（不强求反模式章节）

---

## Status

**状态：accepted（已接受）**

**日期：2026-10-07**

**落地计划：**
1. 立即：本任务要求的新建文件所在目录（curator/COLLABORATION.md、engineer/run/05-06、leader/decisions/yipot-06-10/yiknowledge-06-10）所在目录，双入口检查，缺失的记在待办里
2. 1 周内：就绪检查清单 0004-治理-就绪检查清单.md 新增双入口 2 题门禁（type 正确吗、必含章节齐吗）
3. 2 周内：启动 18 个目录双入口补写，Curator 分配到各角色 Reviewer 并行写
4. 月度审查：Curator 扫所有 `rg '^type: index' -g '**/README.md'` 反模式（README 错写为 index type），反之亦然
