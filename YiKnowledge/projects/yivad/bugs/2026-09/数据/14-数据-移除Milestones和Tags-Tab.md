---
title: "项目详情页: 移除 Milestones 和 Tags Tab"
key: project-detail-remove-milestones-tags-tabs-20260910
tags:
- ui-refinement
- tabs
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
module: hooks/useDetailTabs.ts
reporter: Claude
environment: Chrome / macOS
affectedVersion: main
fixedVersion: main (post-fix 2026-09-10)
frequency: always
---

## Description

项目详情页 Tab 栏包含 Milestones 和 Tags 两个 Tab，当前功能未完善且对项目详情页实用价值有限，移除以简化导航。

**补充说明**：此问题在常规开发和测试流程中未被及时发现，建议加强对应模块的自动化测试覆盖。
### 移除的 Tab

| Tab | 组件 | 原因 |
|-----|------|------|
| Milestones | `MilestoneList` | 里程碑功能尚未完善，暂不展示 |
| Tags | `TagAdmin` | 标签管理在项目详情页中非核心功能 |

## Fix

### hooks/useDetailTabs.ts

移除 `milestones` 和 `tags` 两个 Tab 定义及对应的组件导入：

```diff
- import MilestoneList from "@/components/milestone/MilestoneList.vue";
- import TagAdmin from "@/components/tag/TagAdmin.vue";

  const tabs = computed<TabConfig[]>(() => [
    ...
-   { name: "milestones", label: t("project.detail.tabs.milestones"), component: MilestoneList },
-   { name: "tags", label: t("project.detail.tabs.tags"), component: TagAdmin },
  ]);
```

## Verification

- [ ] 项目详情页 Tab 栏不再显示 Milestones 和 Tags
- [ ] 其余 6 个 Tab（Overview、Requirements、Modules、Docs、Bugs、Members）正常显示和切换
- [ ] `vue-tsc --noEmit` 通过

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

