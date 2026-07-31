# 项目 / Projects

每个项目下并存两类内容：业务需求（stories/）与工程文档（engineering/）。

## 目录结构

```
projects/
  {project-name}/
    README.md                       # 项目卡片：定位、技术栈、当前状态
    stories/                        # 业务内容（BRD 驱动的 Story/Scene）
      {story-name}/
        story.md
        {scene-name}/scene.md
    engineering/                    # 工程文档镜像（CLAUDE.md / README.md / CHANGELOG.md）
      claude.md
      readme.md
      changelog.md                  # 仅部分项目
```

## stories/ 与 engineering/ 的分工

| 维度 | stories/ | engineering/ |
|---|---|---|
| 内容驱动 | BRD / 用户故事 | 架构与约定 |
| 数据关联 | 数据库存元数据（key、status 等），文件存富文本内容 | 文件系统自洽 |
| 更新频率 | 随需求迭代 | 随架构演进 |
| 来源 | 业务方与 PM 共同维护 | 项目根目录文件镜像 |

## 设计原则（stories/）

- **数据库存元数据**：`key`、`name`、`status`、`priority`、`assignee`、`startDate`、`dueDate`、`completedAt`、`sprint`、`scheduleStatus`、`createdAt`、`updatedAt` 等管理型字段存数据库
- **文件系统存内容**：`description`、`background`、`acceptance`、`scenarios[].steps`、`scenarios[].trigger`、BRD 所有章节等富文本内容存 Markdown 文件
- **关联方式**：数据库记录中的 `project` 字段与文件系统 `projects/{project-name}/` 对应，Story 目录名即为语义标识
- **渐进式读取**：文件开头使用 YAML Frontmatter，支持先读 15 行获取元数据，确认相关后再读全文

## story.md 模板

```markdown
---
key: story_1700000000000
name: {名称}
status: planning
priority: p2
assignee: 张三
startDate: 2025-01-01
dueDate: 2025-01-15
sprint: Sprint 1
scheduleStatus: on_track
project: YiAi
tags: [标签1, 标签2]
createdAt: 1700000000000
updatedAt: 1700000000000
---

# {名称}

## 背景 (background)
## 描述 (description)
## 验收标准 (acceptance)

## BRD 章节
### 业务目标 (objectives)
### 核心用户 (coreUsers)
### 涉及国家 (involvedCountries)
### 涉及模块 (involvedModules)
### 业务规则 (businessRules)
### 约束条件 (constraints)
### 里程碑 (milestones)
### 紧迫度 (urgency)
### 验收标准 (acceptanceCriteria)
### 附件 (attachments)
### 审批记录 (approvalRecords)
```

## scene.md 模板

```markdown
---
key: sc_1700000000000_abc123
name: {名称}
status: planning
priority: p2
createdAt: 1700000000000
updatedAt: 1700000000000
---

# {名称}

## 描述 (description)
## 触发条件 (trigger)
## 前置条件 (prerequisites)
## 预期结果 (expectedResult)

## 步骤 (steps)

| Order | Action | Description |
|-------|--------|-------------|
| 1     | Given  | ...         |
| 2     | When   | ...         |
| 3     | Then   | ...         |

## 标签 (tags)
## 关联文件 (files)
- filePath: src/views/foo.vue, fileName: foo.vue
```

## engineering/ 同步约定

`engineering/` 下的 `claude.md` / `readme.md` / `changelog.md` 是**项目根目录**同名文件的镜像拷贝，用于在 YiKnowledge 内集中查阅。原文件仍在各自项目根目录下维护。

修改原项目根的 `CLAUDE.md` / `README.md` / `CHANGELOG.md` 后，需手动 `cp` 同步到本目录，或通过项目级 hook 自动同步。

## 项目列表

- [YiAi](./YiAi/) —  AI + BRD 智能体
- [YiPet](./YiPet/) — 浏览器扩展 + 桌面应用
- [YiVad](./YiVad/) — 主控 Web 应用

> 如需新增项目卡片，在本目录新建 `{project-name}/README.md`。
