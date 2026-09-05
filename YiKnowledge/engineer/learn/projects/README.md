---
title: projects/ directory explanation
tags: [projects, MOC, stories, engineering, onboarding]
category: engineer/learn/projects
created: 2026-08-03
updated: 2026-08-03
last_verified: 2026-08-07
source: internal
type: summary
status: stable
lifecycle: reference
review_cycle: quarterly
roles: [engineer]
benefit: "Engineers access per-project business and engineering documentation, understanding the context and decisions behind each codebase"
acceptance_criteria:
  - "core ideas are clearly stated and distinguishable from source material"
  - "actionable recommendations are given, not just information"
  - anti-patterns or when-not-to-use are identified
related:
  - ./INDEX.md
  - ../../run/onboarding/yiai/onboarding.md
  - ../../run/onboarding/yipet/onboarding.md
  - ../../run/onboarding/yivad/onboarding.md
  - ../../run/onboarding/handoff-project.md
---

# projects/ — 项目业务与工程文档

> **作为** engineer，**我希望**理解并应用 projects/ 目录说明，**以便**理解每个代码库背后的上下文和决策。

> 每个项目汇集两类内容：业务需求（stories/）和工程文档（engineering/），由 onboarding.md 作为入门路径串联起来。

## 目录结构

```
projects/
  README.md                       # 本文件：分类 + stories/engineering 拆分
  INDEX.md                        # 项目索引表（叶子概览 + 关键子路径）
  {project-name}/
    README.md                     # 项目卡片：定位、技术栈、子目录
    onboarding.md                 # 新人 onboarding（8 个固定章节）
    stories/                      # 业务内容（BRD 驱动的 Story/Scene）
      {story-name}/
        story.md
        {scene-name}/scene.md
    engineering/                  # 工程文档镜像（CLAUDE.md / README.md / CHANGELOG.md）
      claude.md
      readme.md
      changelog.md                # 仅部分项目
```

## stories/ vs engineering/ 拆分

| 维度 | stories/ | engineering/ |
|---|---|---|
| 内容驱动 | BRD / 用户故事 | 架构与规范 |
| 数据关系 | DB 存储元数据（key、status 等）；文件存储富文本 | 文件系统自包含 |
| 更新频率 | 随需求迭代 | 随架构演进 |
| 来源 | 业务与 PM 共同维护 | 项目根目录文件镜像 |

## 设计原则（stories/）

- **DB 存储元数据**：`key`、`name`、`status`、`priority`、`assignee`、`startDate`、`dueDate`、`completedAt`、`sprint`、`scheduleStatus`、`createdAt`、`updatedAt` 等管理字段存储在 DB 中
- **文件系统存储内容**：`description`、`background`、`acceptance`、`scenarios[].steps`、`scenarios[].trigger`、所有 BRD 章节等富文本内容存储在 Markdown 文件中
- **关联关系**：DB 记录中的 `project` 字段对应文件系统 `projects/{project-name}/`；Story 目录名即语义标识符
- **渐进式阅读**：文件以 YAML frontmatter 开头，支持先读取 15 行获取元数据，确认相关性后再读取全文

## story.md 模板

```markdown
---
key: story_1700000000000
name: {name}
status: draft
priority: p2
assignee: Zhang San
startDate: 2025-01-01
dueDate: 2025-01-15
sprint: Sprint 1
scheduleStatus: on_track
project: YiAi
tags: [tag1, tag2]
createdAt: 1700000000000
updatedAt: 1700000000000
---

# {name}

## Background
## Description
## Acceptance criteria

## BRD chapters
### Business objectives
### Core users
### Involved countries
### Involved modules
### Business rules
### Constraints
### Milestones
### Urgency
### Acceptance criteria
### Attachments
### Approval records
```

## scene.md 模板

```markdown
---
key: sc_1700000000000_abc123
name: {name}
status: draft
priority: p2
createdAt: 1700000000000
updatedAt: 1700000000000
---

# {name}

## Description
## Trigger
## Prerequisites
## Expected result

## Steps

| Order | Action | Description |
|-------|--------|-------------|
| 1     | Given  | ...         |
| 2     | When   | ...         |
| 3     | Then   | ...         |

## Tags
## Related files
- filePath: src/views/foo.vue, fileName: foo.vue
```

## engineering/ 同步规范

`engineering/` 中的 `claude.md` / `readme.md` / `changelog.md` 是**项目根目录**同名文件的镜像副本，用于在 YiKnowledge 内集中查阅。原始文件仍由各项目根目录维护。

修改项目根目录的 `CLAUDE.md` / `README.md` / `CHANGELOG.md` 后，手动 `cp` 同步到本目录，或通过项目级 hook 自动同步。

## 项目列表

- [YiAi](yiai) — AI + BRD agent（FastAPI 后端，端口 10086）
- [YiPet](yipet) — 浏览器扩展 + 桌面应用（Chrome MV3、React 18 + Ant Design 5）
- [YiVad](yivad) — 主控 Web 应用（Vue 3.5 + Rsbuild 1，端口 8848）

详细子路径参见 [INDEX.md](./INDEX.md)。添加新项目卡片时，在此目录创建 `{project-name}/README.md` 并在 INDEX.md 中注册。