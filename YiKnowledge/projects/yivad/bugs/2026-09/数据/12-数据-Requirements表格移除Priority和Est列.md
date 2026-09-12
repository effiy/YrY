---
title: "项目详情页: Requirements 表格移除 Priority 和 Est 列"
key: requirements-table-remove-priority-est-20260910
tags:
- ui-refinement
- requirements-table
- project-detail
category: projects/yivad/bugs/data
created: "2026-09-10"
updated: 2026-09-10
source: internal
type: improvement
status: resolved
severity: minor
priority: p3
project: YiVad
module: views/issue/index.vue
reporter: Claude
environment: Chrome / macOS
affectedVersion: main
fixedVersion: main (post-fix 2026-09-10)
frequency: always
---

## Description

访问 `http://localhost:8848/#/project/yivad` → Requirements Tab 时，表格展示了 6 列：Month、Title、Status、**Priority**、**Est.**、Actions。其中 Priority 和 Est. 两列对需求列表的实用价值有限，移除以简化表格。

### 涉及列

| 列名 | prop | 移除原因 |
|------|------|---------|
| Priority | `priority` | 需求优先级信息在详情页即可查看，表格中不需要 |
| Est. | `estimate_points` | 预估人天在需求 markdown frontmatter 中有记录，表格中展示意义不大 |

## Steps to Reproduce

1. 访问 `http://localhost:8848/#/project/yivad`
2. 切换到 Requirements Tab
3. 观察表格列 —— 原先有 Priority 和 Est. 两列

## Fix

### views/issue/index.vue (line 648-657)

移除 `filterIssueType === "requirement"` 分支中的 `priority` 和 `estimate_points` 两列定义：

```diff
  if (props.filterIssueType === "requirement") {
    return [
      { prop: "key", label: t("issue.table.month"), width: 100 },
      { prop: "title", label: t("issue.table.title"), minWidth: 240 },
      { prop: "status", label: t("issue.table.status"), width: 100 },
-     { prop: "priority", label: t("issue.table.priority"), width: 90 },
-     { prop: "estimate_points", label: t("issue.table.est"), width: 70, render: ... },
      { prop: "operation", label: t("issue.table.actions"), width: 190, fixed: "right" }
    ];
  }
```

## Verification

- [ ] Requirements 表格仅显示 Month、Title、Status、Actions 四列
- [ ] 中英文环境下列标题正确显示
- [ ] 其他 Issue 列表（非 requirement 类型）不受影响，仍保留 Priority 和 Points 列

## 影响范围

- **影响组件/页面**：详见描述章节
- **影响用户**：所有用户
- **是否影响 API 契约**：否
- **是否影响其他前端项目**：否（仅 YiVad）

## 预防措施

| 层面 | 措施 |
|------|------|
| 代码 | 加强代码审查，关注此类问题模式 |
| 测试 | 增加自动化测试覆盖对应场景 |
| 流程 | 将此类问题纳入检查清单 |

## 经验教训

- 此类问题属于常见开发疏忽，可通过静态分析和自动化检查提前发现
- 建议将典型问题模式记录到团队知识库，避免重复踩坑
- 代码审查应重点关注此类边界情况

