---
name: issue-creator
description: >
  Issue 追踪管理方法论。指导如何创建、分类、优先级排序、分配和追踪 Issue（任务/需求/Bug/改进），
  涵盖状态流转、看板管理、标签分类、数据质量分析和进度追踪的最佳实践。
  当用户提到 Issue、任务、需求、Bug、缺陷、改进项、看板任务、任务分配、状态流转、
  工作项管理时使用。
user_invocable: true
lifecycle: default-pipeline
auto-trigger-rules:
  - 用户想要创建/管理/追踪 Issue 或工作任务
  - 用户提到 Issue、Bug、需求、任务、改进项、看板
  - 用户需要分配任务、修改状态、设置截止日期
  - 用户需要按状态/优先级/类型/负责人筛选 Issue
  - 用户询问工作项管理方法或流程
priority: normal
---

# Issues — Issue 追踪管理

一个交互式 Issue 管理助手，根据用户意图自动选择操作模式。覆盖 Issue 全生命周期：创建、分类、排期、流转、评审、交付。

## 模式选择

分析用户意图，自动选择以下模式。**先说明当前模式**，再执行。

### 创建模式

当用户想要创建新的 Issue 时触发。逐项引导用户填写，不要求一次性给全。

**引导顺序：**

1. **标题** — 动词开头，简洁描述，"修复登录超时" 而非 "登录问题"
2. **类型** — bug / task / feature / improvement / requirement
3. **优先级** — urgent / high / medium / low（默认 medium）
4. **描述** — 背景、涉及模块、复现步骤（bug）、预期效果
5. **可选补充** — 负责人、截止日期、标签、验收标准、预估工时

**输出格式：** 将收集到的内容整理为 Issue 卡片：

```
## [类型图标] 标题

| 字段 | 值 |
|------|-----|
| 类型 | bug / task / feature / improvement / requirement |
| 优先级 | urgent / high / medium / low |
| 状态 | backlog |
| 负责人 | @name |
| 截止日期 | YYYY-MM-DD |
| 标签 | tag1, tag2 |

### 描述
...

### 验收标准
- [ ] ...
```

### 流转模式

当用户想要修改 Issue 状态时触发。核心规则：

- `backlog → todo`：排期确认，明确迭代计划
- `todo → in_progress`：开始执行
- `in_progress → in_review`：提交评审/代码审查
- `in_review → done`：评审通过，验收完成
- `in_review → in_progress`：评审不通过，退回修改
- 任意非终态 → `cancelled`：确认取消

**执行时：** 确认当前状态、目标状态、变更原因，然后输出状态变更记录。

### 筛选模式

当用户想要查看/搜索 Issue 时触发。支持多维度筛选：

| 维度 | 示例 |
|------|------|
| 状态 | `in_progress`, `done` |
| 优先级 | `urgent`, `high` |
| 类型 | `bug`, `feature` |
| 负责人 | `@name` |
| 标签 | `frontend`, `api` |
| 时间 | 本周截止、逾期、最近创建 |

**快捷视角：**
- **我的 Issue** — 当前用户负责的工作
- **高优先级** — urgent + high
- **本周截止** — 7 天内到期
- **阻塞项** — 被 blocked_by 的 Issue
- **逾期** — 过截止日期未完成

### 看板模式

当用户想要查看整体工作流时触发。按状态分列展示：

```
Backlog (N) | Todo (N) | In Progress (N) | In Review (N) | Done (N)
```

每列显示 Issue 标题、负责人、优先级。标注阻塞项和逾期项。

### 诊断模式

当用户想要检查数据质量时触发。检查以下维度：

| 指标 | 检查项 | 健康线 |
|------|--------|--------|
| 负责人分配率 | 活跃 Issue 中有 assignee 的比例 | ≥ 80% |
| 截止日期设置率 | 活跃 Issue 中有 due_date 的比例 | ≥ 80% |
| 标签使用率 | 有 labels 的 Issue 比例 | ≥ 60% |
| 描述填写率 | description 非空的比例 | ≥ 90% |
| 验收标准率 | acceptance_criteria 非空的比例 | ≥ 70% |

**异常清单：**
- 逾期未完成 — 需重新评估排期或拆分
- 未分配 — 活跃但无负责人，需分配
- 长期停滞 — 超过 2 周未更新的 in_progress 项
- 阻塞 — 被 blocked_by 且无进展

---

## 核心概念

### Issue 类型

| 类型 | 说明 | 典型场景 |
|------|------|----------|
| `bug` | 缺陷 | 线上问题、功能异常、体验问题 |
| `task` | 任务 | 开发任务、运维操作、日常事务 |
| `feature` | 功能 | 新功能开发、能力建设 |
| `improvement` | 改进 | 性能优化、代码重构、流程优化 |
| `requirement` | 需求 | 业务需求文档化、需求拆解 |

### 优先级

| 优先级 | 响应要求 |
|--------|----------|
| `urgent` | 立即处理，阻塞其他工作 |
| `high` | 当前迭代内必须完成 |
| `medium` | 按正常节奏处理 |
| `low` | 有空闲时处理 |

### 状态流转

```
backlog → todo → in_progress → in_review → done
  ↓         ↓         ↓            ↓         ↓
  └─────────┴─────────┴────────────┴─────→ cancelled
```

`done` 和 `cancelled` 是终态，不可再流转。

### 依赖关系

| 关系 | 含义 |
|------|------|
| `blocked_by` | 被其他 Issue 阻塞，依赖完成后才能开始 |
| `blocks` | 阻塞其他 Issue |
| `related` | 一般关联，无强制依赖 |
| `parent_key` | 父 Issue，用于大需求拆分子任务 |

---

## 与 BRD/PRD 的关系

```
BRD（业务需求）→ PRD（产品规格）→ Issue（可执行工作项）
```

- BRD 中的需求 → `requirement` 类型 Issue
- PRD 中的功能 → `feature` 或 `task` 类型 Issue
- 测试/线上反馈 → `bug` 类型 Issue
- 技术优化 → `improvement` 类型 Issue

**转换技能：** `brd-to-prd` 将 BRD 转为 PRD，`prd-to-issues` 将 PRD 拆解为 Issue。

---

## 参考文件

- `references/issue-model.md` — 完整的 Issue 数据模型、枚举定义和数据质量指标