---
title: Issue 数据模型参考
tags: [issue, data-model, reference, enum, status-flow]
category: skills/issue-creator/references
created: 2026-08-20
updated: 2026-09-10
source: internal
type: reference
status: stable
lifecycle: active
related:
  - ../SKILL.md
  - ../README.md
---

# Issue 数据模型参考

## 枚举定义

### 一、IssueStatus —— 状态

| 值 | 显示名称 | 说明 | 是否终态 |
|------|------|------|----------|
| `backlog` | 待办池 | 待办池，尚未排期 | 否 |
| `todo` | 待开始 | 已排期，等待认领 | 否 |
| `in_progress` | 进行中 | 正在执行，有明确负责人 | 否 |
| `in_review` | 评审中 | 已提交评审/代码审查 | 否 |
| `done` | 已完成 | 评审通过，验收完成 | **是（终态）** |
| `cancelled` | 已取消 | 因各种原因取消 | **是（终态）** |

### 二、IssuePriority —— 优先级

| 值 | 显示名称 | 响应要求 | In Progress 并发上限 |
|------|------|----------|-------------------|
| `urgent` | 紧急 | 立即处理，可打断其他工作 | 1 个 |
| `high` | 高优先级 | 当前迭代内必须完成 | 2 个 |
| `medium` | 中优先级 | 按正常节奏处理 | 无限制 |
| `low` | 低优先级 | 有空闲时处理 | 无限制 |
| `none` | 未设置 | 需尽快补充优先级 | — |

### 三、IssueType —— 类型

| 值 | 显示名称 | 典型场景 | 标题动词示例 |
|------|------|----------|------------|
| `bug` | 缺陷 | 线上问题、功能异常、体验问题 | 修复、解决 |
| `task` | 任务 | 开发任务、运维操作、日常事务 | 完成、执行、处理 |
| `feature` | 功能 | 新功能开发、能力建设 | 添加、实现、支持 |
| `improvement` | 改进 | 性能优化、代码重构、流程优化 | 优化、重构、提升 |
| `requirement` | 需求 | 业务需求文档化、需求拆解 | 设计、规划、调研 |

### 四、IssueSource —— 来源

| 值 | 说明 | 示例 |
|------|------|------|
| `customer` | 客户反馈 | 用户工单、客服转交 |
| `internal` | 内部发现 | 代码审查、内部测试、技术评审 |
| `market` | 市场/竞品分析 | 竞品功能对比、行业趋势 |
| `compliance` | 合规要求 | 安全审计、法规变更 |
| `other` | 其他 | 无法归入上述类别 |

### 五、ReviewStatus —— 评审状态

| 值 | 说明 | 适用场景 |
|------|------|----------|
| `pending` | 待评审 | 尚未有人认领评审任务 |
| `in_review` | 评审中 | 评审人已开始审查 |
| `approved` | 已通过 | 评审通过，可转入 done |
| `rejected` | 已驳回 | 评审不通过，需退回 in_progress 修改 |

---

## 完整字段定义

| 字段 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|------|------|
| `key` | string | **是** | 自动生成 | 唯一标识，格式 `YR-{序号}` |
| `title` | string | **是** | — | 标题，5-100 字符，动词开头 |
| `description` | string | 否 | — | Markdown 格式的详细描述 |
| `status` | IssueStatus | **是** | `backlog` | 当前状态 |
| `priority` | IssuePriority | **是** | `medium` | 优先级 |
| `issue_type` | IssueType | **是** | `task` | Issue 类型 |
| `assignee` | string | 否 | — | 负责人用户名 |
| `labels` | string[] | 否 | `[]` | 标签列表，建议 2-5 个 |
| `parent_key` | string | 否 | — | 父 Issue 的唯一标识（用于大需求拆分） |
| `start_date` | string | 否 | — | 开始日期 (YYYY-MM-DD) |
| `due_date` | string | 否 | — | 截止日期 (YYYY-MM-DD) |
| `estimate_points` | number | 否 | — | 预估故事点数（Fibonacci 序列：1, 2, 3, 5, 8, 13） |
| `time_estimate` | number | 否 | — | 预估工时（小时） |
| `time_spent` | number | 否 | `0` | 已用工时（小时），流转到 done 时自动计算 |
| `blocked_by` | string[] | 否 | `[]` | 被哪些 Issue 阻塞（存放 Issue key 列表） |
| `blocks` | string[] | 否 | `[]` | 阻塞哪些 Issue（存放 Issue key 列表） |
| `related` | string[] | 否 | `[]` | 关联 Issue（一般关联，无强制依赖） |
| `source` | IssueSource | 否 | `internal` | Issue 来源 |
| `acceptance_criteria` | string | 否 | — | 验收标准（Markdown 格式，建议使用 checklist） |
| `review_status` | ReviewStatus | 否 | `pending` | 评审状态 |
| `attachments` | array | 否 | `[]` | 附件列表（文件 URL 或 base64） |
| `created_at` | string | 否 | 自动生成 | 创建时间 (ISO 8601) |
| `updated_at` | string | 否 | 自动更新 | 最后更新时间 (ISO 8601) |

---

## 状态流转规则

```
           ┌─────────────────────────────────────────┐
           │                                         │
           ▼                                         │
backlog ──→ todo ──→ in_progress ──→ in_review ──→ done
  │          │           │               │            │
  │          │           │               │            │
  └──────────┴───────────┴───────────────┴─────→ cancelled
```

**流转规则详表：**

| 从 | 到 | 前置条件 | 后置操作 |
|------|------|----------|----------|
| — | `backlog` | 创建 Issue 时的默认状态 | — |
| `backlog` | `todo` | 明确的迭代计划（Sprint/里程碑） | 设置 `start_date`（可选） |
| `todo` | `in_progress` | 有负责人、有预估工时 | 自动设置 `start_date`（如未设置） |
| `in_progress` | `in_review` | 有 PR 链接、有验收标准 | 设置 `review_status = pending` |
| `in_review` | `done` | `review_status = approved`、验收标准全部满足 | 自动计算 `time_spent`，标记为终态 |
| `in_review` | `in_progress` | `review_status = rejected` | 保留评审意见，追加到 description |
| 任意非终态 | `cancelled` | 明确的取消原因 | 标记为终态 |
| `done` / `cancelled` | 任意 | **禁止** | 两个终态不可流转到任何其他状态 |

---

## 依赖关系

- **blocked_by** —— 被其他 Issue 阻塞，依赖完成后才能开始。建立后应通知阻塞源的负责人。
- **blocks** —— 阻塞其他 Issue，完成后应通知被阻塞的 Issue 负责人。
- **related** —— 一般关联，无强制依赖关系。用于追踪相关但无阻塞关系的 Issue。
- **parent_key** —— 父 Issue 的唯一标识。用于将大型需求拆分为多个子任务，父 Issue 的进度由其所有子 Issue 的完成度加权计算。

**依赖关系最佳实践：**
- 依赖链不超过 3 层（A blocked_by B blocked_by C blocked_by D 是不好的）
- 每个 Issue 的 blocked_by 不超过 3 个（过多的阻塞源意味着 Issue 定义过粗）
- 建立阻塞关系时，双方负责人应明确知晓并确认

---

## 数据质量指标

完整性检查覆盖以下 6 个字段：

1. **assignee** —— 负责人分配率：活跃 Issue 中有明确负责人的比例
2. **due_date** —— 截止日期设置率：有明确交付日期的比例
3. **labels** —— 标签使用率：有标签分类的比例
4. **description** —— 描述填写率：描述非空的比例
5. **acceptance_criteria** —— 验收标准填写率：有可验证验收条件的比例
6. **estimate_points** —— 预估点数设置率：有故事点数或工时预估的比例

**质量等级：**

| 等级 | 比值范围 | 含义 | 建议操作 |
|------|----------|------|----------|
| 🟢 健康 | >= 80% | 数据质量良好 | 保持当前标准 |
| 🟡 需关注 | 50-79% | 存在改进空间 | 识别最差的 1-2 个指标，制定改进计划 |
| 🔴 差 | < 50% | 数据质量严重不足 | 触发团队专项改进，考虑在流转中增加必填校验 |

**质量趋势追踪：**
- 每月运行一次诊断模式，记录 6 个指标的值
- 关注指标的**变化趋势**而非绝对值（上升/下降比当前值更重要）
- 新团队或新项目的初始质量通常偏低，目标是 3 个月内达到健康线

---

## 相关资源

- [../SKILL.md](../SKILL.md) —— Issue 技能主文件（五种模式、配置选项、故障排查）
- [../README.md](../README.md) —— 技能说明与快速开始指南
- [../../../projects/INDEX.md](../../../projects/INDEX.md) —— 各项目实际缺陷分类与列表