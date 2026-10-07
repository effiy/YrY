---

title: "10-prd-task-仪表盘指标增强"
tags: ["dev", "dashboard", "metrics", "bug-severity"]
category: projects/yivad/devs
created: "2026-09-23"
updated: "2026-09-23"
source: "claude"
type: task
status: 已完成
owner: "Chengliang Yi"
estimate_frontend: "2d"
priority: "P1"
source_prd: "10-prd-仪表盘指标增强"

---

## 实施计划

### 1. useHomeData.ts — 新增数据查询

**文件**：`YiVad/src/hooks/useHomeData.ts`

- `HomeStats` 接口新增字段：`unassignedCount`、`criticalBugCount`、`majorBugCount`、`bugSeverityGroups`
- `loadTodayCounts` 新增 3 个查询：
  - 未分配 Issue：`$or` 匹配空 assignee
  - Critical Bug：severity in ["critical", "urgent", "Critical", "Urgent"]
  - Major Bug：severity in ["major", "high", "Major", "High"]
- `loadStatusBreakdowns` 新增 bug severity group 查询

### 2. 首页 UI — 警告与卡片

**文件**：`YiVad/src/views/home/index.vue`

- Alert 区域新增「未分配任务」和「严重 Bug」两条提醒
- 侧边栏新增 Bug 严重度分布卡片（条状图）
- 新增 `sevLabel`/`sevWidth` 辅助函数
- 导入 `User`、`CircleCloseFilled` 图标
- 新增 SCSS 样式 `.ho-bug-sev-*`

### 3. 项目详情页 — Bug 严重度分布

**文件**：`YiVad/src/views/project/components/DetailOverview.vue`

- 在 Stats Strip 和 README 之间新增 Bug 严重度分布模块
- 新增 `openBugCount`、`bugSeverityData`、`bugSevBars` 计算属性
- 使用 `allBugs` 前端聚合，无需额外 API 调用

### 4. 样式

**文件**：`YiVad/src/styles/DetailOverview.scss`

- 新增 `.do-bug-sev-*` 样式（bars/track/fill/val）

### 5. 国际化

- `home.zh.ts` / `home.en.ts`：`bugSeverity`、`unassignedItems`、`criticalBugs`
- `project.zh.ts` / `project.en.ts`：`overview.bugSeverity.title`、`overview.bugSeverity.openCount`