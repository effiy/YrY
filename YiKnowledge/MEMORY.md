---
title: YiKnowledge 规则手册与命名约定
tags: [knowledge-base, rules, naming, frontmatter]
category: root
created: 2026-01-01
updated: 2026-09-10
source: internal
type: summary
status: stable
lifecycle: active
review_cycle: quarterly
roles: [curator]
benefit: 知识库规则、Frontmatter 规范和命名约定的唯一权威来源
last_verified: 2026-09-10
related:
  - ./README.md
  - ./INDEX.md
  - ./curator/governance/02-治理-治理规范.md
  - ./curator/governance/04-治理-就绪检查清单.md
  - ./curator/templates/00-INDEX.md
---

# YiKnowledge 规则手册

## 目录结构

7 个角色目录 + 2 个跨领域索引：

```
YiKnowledge/
├── INDEX.md              # 全库目录索引
├── README.md             # 顶层概览（流水线叙事 + 角色边界）
├── MEMORY.md             # 本文件：规则手册
├── engineer/             # 实现层：架构、开发、质量、数据、可靠性、流程、经验教训、项目
├── leader/               # 决策层：架构决策、技术选型、容量规划、风险评估、路线图
├── producter/            # 需求层：框架、发现、交付、策略
├── aier/                 # AI 层：基础、方法论、平台、机器学习
├── srer/                 # 运维层：事件响应、可观测性、发布
├── executiver/           # 业务层：战略、行业、路线图、阅读清单
├── curator/              # 治理层：治理规范、架构图、模板、归档
├── projects/             # 项目中心：4 个项目的缺陷/需求/文档/示例
└── skills/               # Claude Code 自定义技能
```

## 角色边界

每个角色只回答一个问题，不越界处理：

| 角色 | 核心问题 | 典型文件示例 |
|---|---|---|
| engineer/ | 如何实现？ | [engineer/build/implement-an-api.md](./engineer/build/implement-an-api.md) —— API 实现模式 |
| leader/ | 如何决策？ | [leader/architecture/01-架构-架构决策设计.md](./leader/architecture/01-架构-架构决策设计.md) —— 架构决策记录 |
| producter/ | 构建什么产品？ | [producter/discovery/01-发现-编写PRD.md](./producter/discovery/01-发现-编写PRD.md) —— PRD 编写指南 |
| aier/ | 如何使用 AI？ | [aier/methods/](./aier/methods/) —— RAG 模式、Agent 架构 |
| executiver/ | 如何做业务？ | [executiver/strategy/](./executiver/strategy/) —— 企业战略、SWOT 分析 |
| srer/ | 如何保障稳定性？ | [srer/observability/07-可观测-搭建可观测性.md](./srer/observability/07-可观测-搭建可观测性.md) —— 可观测性搭建 |
| curator/ | 如何管理知识库？ | [curator/governance/04-治理-就绪检查清单.md](./curator/governance/04-治理-就绪检查清单.md) —— 就绪检查清单 |

## 文件命名约定

### 知识文件命名（角色目录内）

采用 **{序号}-{分类}-{描述}.md** 格式：
- **序号**：两位数字（01-99），控制目录内排序
- **分类**：中文简短分类名（如"治理"、"框架"、"发布"、"设计"）
- **描述**：中文文件主题描述
- 全部使用中文文件名 + 英文角色子目录

**命名示例：**
```
curator/governance/
├── 01-治理-知识健康看板.md      # 正确：序号-分类-描述
├── 02-治理-治理规范.md
├── 04-治理-就绪检查清单.md

srer/release/
├── 01-发布-金丝雀发布.md        # 正确
├── 04-发布-发布流程.md

producter/frameworks/
├── 01-框架-用户研究方法.md      # 正确
├── 06-框架-RICE-ICE优先级.md
```

**硬约束：**
- 禁止使用下划线 `_` —— 使用连字符 `-` 替代
- 禁止纯数字文件名 —— 必须包含分类和描述
- 分类名不超过 4 个汉字

### 子目录命名（英文）

角色子目录使用英文 kebab-case：
```
engineer/build/      # 正确
engineer/ship/       # 正确
engineer/learn/      # 正确
```

### 跨领域索引用大写下划线

```
SECURITY.md        # 正确
COLLABORATION.md   # 正确
ENGINEERING.md     # 正确
```

## YAML Frontmatter 规范

### 完整字段定义

```yaml
---
title: 文件标题                        # 必填——中文标题，10-30 字
aliases: [别名1, 别名2]                # 推荐——用于搜索召回和交叉引用
tags: [标签1, 标签2, 标签3]             # 必填——3-5 个英文标签
category: root | <角色>/<子目录>        # 必填——知识分类路径
created: YYYY-MM-DD                   # 必填——创建日期
updated: YYYY-MM-DD                   # 必填——最后更新日期
source: internal | <url>              # 必填——internal（原创）或外部 URL
type: summary | original | template | prompt  # 必填——内容类型
status: draft | stable | deprecated   # 必填——内容状态
lifecycle: inbox | triage | active | reference | archive  # 可选——生命周期阶段
review_cycle: weekly | monthly | quarterly | yearly  # 外部内容必填——审查周期
last_verified: YYYY-MM-DD             # 外部内容必填——最后验证日期
roles: [角色1, 角色2]                  # 推荐——跨角色可见性标记
benefit: "简短描述"                    # 推荐——读者能获得什么价值
acceptance_criteria:                  # 推荐——可验证的质量标准
  - "可验证的条款"
related:                              # 推荐——相关文件相对路径
  - relative/path/to/file.md
---
```

### 字段分类

**必填字段**（8 个）：`title`、`tags`、`category`、`created`、`updated`、`source`、`type`、`status`

**推荐字段**（5 个）：`aliases`、`lifecycle`、`roles`、`benefit`、`acceptance_criteria`、`related`

**外部内容必填**（2 个）：当 `source` 为外部 URL 时，必须填写 `review_cycle` 和 `last_verified`

### Frontmatter 示例

```yaml
---
title: RICE-ICE 优先级框架
aliases: [优先级排序, 需求优先级, 功能排序]
tags: [priority, rice, ice, product-management]
category: producter/frameworks
created: 2026-06-15
updated: 2026-09-10
source: internal
type: summary
status: stable
lifecycle: active
review_cycle: quarterly
last_verified: 2026-09-10
roles: [producter, leader, executiver]
benefit: 掌握 RICE 和 ICE 两种优先级排序框架，能够科学地排定功能开发顺序
acceptance_criteria:
  - 能区分 RICE（四因子）和 ICE（三因子）的适用场景
  - 能独立完成一个功能的 RICE 打分
  - 了解两种框架的常见误用模式
related:
  - ./04-框架-MoSCoW优先级.md
  - ../../leader/roadmap/07-路线图-技术选型.md
---
```

## 内容结构约定

### 知识叶子（leaf knowledge）标准结构

每个知识文件应遵循统一的正文结构：

1. **摘要** —— 2-3 句话概括核心内容，让读者 5 秒内判断是否继续阅读
2. **核心观点** —— 列出 3-5 个核心论点，每个 1-2 句话
3. **关键信息** —— 以表格、列表或流程图形式呈现的实质性内容
4. **行动建议** —— 可操作的步骤或决策指南（不是泛泛的"要注意"）
5. **反模式** —— 明确写出**不应该怎么做**，并附带错误示例（如有）
6. **相关链接** —— 指向相关角色目录中的其他知识文件

### 外部知识双副本

从外部来源（文章、书籍、视频、论文）获取的知识，采用双文件策略：

- **`*-original.md`**（源文件）—— 完整保留原文内容，标注出处和获取时间
- **`*-summary.md`**（综合）—— 经过消化提炼的要点、个人见解、可操作建议

两者绝不混合。读者按需选择：原文查阅读 original，快速学习读 summary。

## 内容时效性管理

- 外部内容（`source: <url>`）必须设置 `last_verified` + `review_cycle`
- 超过 `review_cycle` 指定周期未验证的内容，标记为 `status: deprecated`
- 超过 6 个月未更新的活跃内容，应触发审查提醒
- 已弃用内容移动到 `curator/archive/`，并在原位置保留重定向说明

## 渐进式阅读策略

设计原则：让读者在打开文件之前就能判断内容是否相关。

1. **读元数据** —— `head -15 file.md` 读取 frontmatter，5 秒内判断相关性
2. **判断相关性** —— 使用 `tags`、`category`、`title`、`lifecycle`、`roles` 字段
3. **查看结构** —— `grep "^## " file.md` 显示正文各级标题，了解内容骨架
4. **全文阅读** —— 仅在确认相关后，才投入时间完整阅读

```bash
# 按标签过滤知识文件
rg "^tags:.*keyword" YiKnowledge -l

# 按角色过滤（查看所有 engineer 角色可见的文件）
rg "^roles:.*engineer" YiKnowledge -l

# 仅活跃内容（排除 inbox/triage/reference/archive 状态）
rg "^lifecycle: active" YiKnowledge -l

# 查看文件的 frontmatter 和标题结构
head -15 YiKnowledge/engineer/build/implement-an-api.md
grep "^## " YiKnowledge/engineer/build/implement-an-api.md
```

## 目录层级限制

**最多 3 级目录**：`角色/问题域/文件.md`

```
# 正确（3 级以内）
engineer/build/implement-an-api.md              # 2 级
srer/observability/07-可观测-搭建可观测性.md       # 2 级
producter/discovery/prd/template.md             # 3 级

# 错误（超过 3 级）
engineer/build/api/rest/authentication.md       # 4 级 —— 禁止
```

超过 3 级的场景应使用**分类子目录替代嵌套子目录**，例如将 `api/rest/auth.md` 改为 `api-rest-auth.md` 放在 2 级目录下。

## 设计原则

1. **角色优先，边界清晰** —— 每一条知识只属于一个角色目录。多角色覆盖使用 frontmatter `roles:`，绝不复制内容。
2. **描述性中文文件名** —— {序号}-{分类}-{描述}.md 格式，禁止下划线和纯数字。
3. **外部知识双副本** —— `*-original.md`（源文件）+ `*-summary.md`（综合），绝不混合。
4. **YAML frontmatter 必填** —— 8 个必填字段 + 5 个推荐字段是 RAG 召回信号。
5. **统一正文结构** —— 摘要 / 核心观点 / 关键信息 / 行动建议 / 反模式 / 相关链接。
6. **时效性标注** —— 外部内容需要 `last_verified` + `review_cycle`；超过 6 个月未验证则标记为 `status: deprecated`。
7. **最多 3 级目录** —— `角色/问题域/文件.md`；不允许嵌套子子目录。

## 相关资源

- [README.md](./README.md) —— 知识库顶层概览，流水线叙事 + 角色决策树
- [INDEX.md](./INDEX.md) —— 全库导航索引，按角色 × 阶段的矩阵视图
- [curator/governance/04-治理-就绪检查清单.md](./curator/governance/04-治理-就绪检查清单.md) —— 新增内容前的 10 个问题关卡
- [curator/governance/02-治理-治理规范.md](./curator/governance/02-治理-治理规范.md) —— 知识生命周期治理规范
- [curator/templates/00-INDEX.md](./curator/templates/00-INDEX.md) —— 10 类文档模板索引