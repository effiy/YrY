---
title: 项目任务模板集成
updated: 2026-09-23
tags: [skill, reference, task-planning, templates, projects]
type: reference
status: stable
---

# 项目任务模板集成

## 与 YiKnowledge/projects 文档体系对齐

`YiKnowledge/projects/<project>/devs/` 中的文档遵循固定模式：

```
devs/YYYY-MM/
├── 00-prd-task-需求总览.md     # 当月需求汇总
├── 00-task-需求总览.md         # 当月任务清单
├── 00-test-需求总览.md         # 当月测试用例
├── NN-prd-task-功能名称.md     # 单项功能的 PRD+开发方案
├── NN-task-功能名称.md         # 单项功能的实施清单
└── NN-test-功能名称.md         # 单项功能的测试用例
```

## task_plan.md 到项目文档的转换

### 转换时机

当以下条件满足时，建议将三文件归档为项目正式文档：

1. 任务已完成（所有步骤 ✅）
2. 任务涉及的功能值得长期维护
3. 有团队成员需要了解实现方案

### 转换映射

| 三文件内容 | 目标文档 | 对应章节 |
|-----------|---------|---------|
| task_plan 背景 + 目标 | `NN-prd-task-功能名称.md` | 需求背景、方案设计 |
| task_plan 执行步骤 | `NN-task-功能名称.md` | 实施清单 |
| task_plan 验收标准 | `NN-prd-task-功能名称.md` | 验收标准 |
| findings 技术发现 | `NN-prd-task-功能名称.md` | 技术决策 |
| progress 验证结果 | `NN-test-功能名称.md` | 测试用例和验证记录 |
| findings 可复用知识 | `projects/<p>/architecture/` | 独立知识文档 |

### 转换模板

#### prd-task 模板

```markdown
---
prd_task_id: <project-abbr>-<month>-<seq>
title: <项目名> <月份>迭代 — <功能名> — 开发任务
status: 已完成
priority: 高
owner: <负责人>
roles: [engineer]
created: YYYY-MM-DD
updated: YYYY-MM-DD
project: <ProjectName>
project_id: <project-id>
prd_month: YYYYMM
estimate_frontend: <人天>
type: task
category: projects/<project>/devs
source: <来源>
tags: [<project-id>, dev, <功能标签>]
lifecycle: active
---

# <项目名> <月份>迭代 — <功能名> — 开发任务

> 来源：task-planning 三文件归档
> 任务日期：YYYY-MM-DD

## 方案设计

[从 task_plan 的「方案」章节提取]

## 技术决策

[从 findings.md 中提取关键技术发现]

### 备选方案（已排除）

[从 task_plan 的备选方案表提取]

## 实施清单

[从 task_plan 的执行步骤转换]

- [x] 1. [步骤描述] — `path/to/file`
- [x] 2. [步骤描述] — `path/to/file`

## 验收标准

[从 task_plan 的验收标准提取]

## 风险登记

[从 task_plan 的风险表提取]
```

#### task 模板

```markdown
---
prd_task_id: <project-abbr>-<month>-<seq>
title: <功能名> — 实施清单
status: 已完成
priority: 高
owner: <负责人>
roles: [engineer]
created: YYYY-MM-DD
updated: YYYY-MM-DD
project: <ProjectName>
project_id: <project-id>
prd_month: YYYYMM
type: task
category: projects/<project>/devs
tags: [<project-id>, task, <功能标签>]
lifecycle: active
---

# <功能名> — 实施清单

> 来源：task-planning task_plan.md

## 前置条件

- [ ] [依赖项 1]
- [ ] [依赖项 2]

## 实施步骤

### 步骤 1：[步骤描述]

**涉及文件**：
- `path/to/file` — [修改说明]

**验证方式**：[如何确认步骤完成]

### 步骤 2：[步骤描述]

...
```

#### test 模板

```markdown
---
prd_task_id: <project-abbr>-<month>-<seq>
title: <功能名> — 测试用例
status: 已完成
priority: 高
owner: <负责人>
roles: [engineer]
created: YYYY-MM-DD
updated: YYYY-MM-DD
project: <ProjectName>
project_id: <project-id>
prd_month: YYYYMM
type: test
category: projects/<project>/devs
tags: [<project-id>, test, <功能标签>]
lifecycle: active
---

# <功能名> — 测试用例

> 来源：task-planning progress.md 验证记录

## 自动化测试

### 单元测试
- [ ] [测试名称] — 验证 [测试目标]
  - 输入：[输入值]
  - 预期：[预期结果]

## 人工验证

- [ ] [验证项] — 验证 [验证目标]
  - 操作：[操作步骤]
  - 预期：[预期结果]
  - 实际：[实际结果]

## 验证结论

[从 progress.md 的验证结果汇总]
```

---

## 归档命令

当用户说「归档到项目」时，执行：

1. 确认目标项目和功能编号
2. 按照上述映射生成三个文档
3. 保存到 `YiKnowledge/projects/<project>/devs/YYYY-MM/`
4. 更新 `YiKnowledge/projects/INDEX.md` 的文档统计
5. 询问是否保留或删除 `tasks/<name>/` 三文件

## 编号规则

项目缩写映射：
- YiVad → YV
- YiAi → YA
- YiPet → YP
- Shared → XS

编号格式：`<缩写>-<月份>-<两位序号>`，如 `YV-09-01`