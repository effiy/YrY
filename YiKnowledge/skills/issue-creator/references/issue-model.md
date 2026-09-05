# Issue 数据模型参考

## 枚举定义

### IssueStatus — 状态

| 值 | 显示名 | 说明 |
|------|------|------|
| `backlog` | Backlog | 待办池，尚未排期 |
| `todo` | Todo | 已排期，待开始 |
| `in_progress` | In Progress | 进行中 |
| `in_review` | In Review | 评审中 |
| `done` | Done | 已完成 |
| `cancelled` | Cancelled | 已取消 |

### IssuePriority — 优先级

| 值 | 说明 |
|------|------|
| `urgent` | 紧急，立即处理 |
| `high` | 高，当前迭代必须完成 |
| `medium` | 中，正常节奏 |
| `low` | 低，有空闲时处理 |
| `none` | 未设置 |

### IssueType — 类型

| 值 | 说明 | 典型场景 |
|------|------|----------|
| `bug` | 缺陷 | 线上问题、功能异常、体验问题 |
| `task` | 任务 | 开发任务、运维操作、日常事务 |
| `feature` | 功能 | 新功能开发、能力建设 |
| `improvement` | 改进 | 性能优化、代码重构、流程优化 |
| `requirement` | 需求 | 业务需求文档化、需求拆解 |

### IssueSource — 来源

| 值 | 说明 |
|------|------|
| `customer` | 客户反馈 |
| `internal` | 内部发现 |
| `market` | 市场/竞品分析 |
| `compliance` | 合规要求 |
| `other` | 其他 |

### ReviewStatus — 评审状态

| 值 | 说明 |
|------|------|
| `pending` | 待评审 |
| `approved` | 已通过 |
| `rejected` | 已驳回 |
| `in_review` | 评审中 |

## 完整字段

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `key` | string | 是 | 唯一标识 |
| `title` | string | 是 | 标题 |
| `description` | string | 否 | Markdown 描述 |
| `status` | IssueStatus | 是 | 当前状态 |
| `priority` | IssuePriority | 是 | 优先级 |
| `issue_type` | IssueType | 是 | 类型 |
| `assignee` | string | 否 | 负责人 |
| `labels` | string[] | 否 | 标签列表 |
| `parent_key` | string | 否 | 父 Issue key |
| `start_date` | string | 否 | 开始日期 (YYYY-MM-DD) |
| `due_date` | string | 否 | 截止日期 (YYYY-MM-DD) |
| `estimate_points` | number | 否 | 预估点数 |
| `time_estimate` | number | 否 | 预估工时（小时） |
| `time_spent` | number | 否 | 已用工时（小时） |
| `blocked_by` | string[] | 否 | 被哪些 Issue 阻塞 |
| `blocks` | string[] | 否 | 阻塞哪些 Issue |
| `related` | string[] | 否 | 关联 Issue |
| `source` | IssueSource | 否 | 来源 |
| `acceptance_criteria` | string | 否 | 验收标准 |
| `review_status` | ReviewStatus | 否 | 评审状态 |
| `attachments` | array | 否 | 附件列表 |
| `created_at` | string | 否 | 创建时间 |
| `updated_at` | string | 否 | 更新时间 |

## 状态流转规则

```
backlog → todo → in_progress → in_review → done
  ↓         ↓         ↓            ↓         ↓
  └─────────┴─────────┴────────────┴─────→ cancelled
```

- 任何非 `done`/`cancelled` 状态都可以转为 `cancelled`
- `backlog` 是初始积压状态，排期后转为 `todo`
- `in_progress` 表示正在执行
- `in_review` 表示等待评审/验收
- `in_review` 可退回 `in_progress`（评审不通过）
- `done` 和 `cancelled` 是终态

## 依赖关系

- **blocked_by** — 被其他 Issue 阻塞，依赖完成后才能开始
- **blocks** — 阻塞其他 Issue，完成后才能解除阻塞
- **related** — 一般关联，无强制依赖
- **parent_key** — 父 Issue，用于将大需求拆分为子任务

## 数据质量指标

完整性检查覆盖以下字段：

1. **assignee** — 负责人分配率
2. **due_date** — 截止日期设置率
3. **labels** — 标签使用率
4. **description** — 描述填写率
5. **acceptance_criteria** — 验收标准填写率
6. **estimate_points** — 预估点数设置率

质量等级：
- ≥ 80%：健康
- 50-79%：需关注
- < 50%：差