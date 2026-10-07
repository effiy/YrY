---

title: "11-prd-task-数据质量与指标覆盖增强"
tags: ["dev", "data-quality", "gap-metrics"]
category: projects/yivad/devs
created: "2026-09-23"
updated: "2026-09-23"
source: "claude"
type: task
status: 已完成
owner: "Chengliang Yi"
estimate_frontend: "1.5d"
priority: "P1"
source_prd: "11-prd-数据质量与指标覆盖增强"

---

## 实施计划

### 1. useHomeData.ts — 新增缺口查询

**文件**：`YiVad/src/hooks/useHomeData.ts`

- `HomeStats` 新增 `noPriorityCount`、`noDueDateCount`
- `loadTodayCounts` 新增查询：
  - 无优先级：`priority in [null, "", "none"]`
  - 无截止日期：`due_date is null/empty/not exists`

### 2. 首页 UI — 缺口告警

**文件**：`YiVad/src/views/home/index.vue`

- Alert 区域新增两条黄色告警（优先级缺失、截止日期缺失）
- 阈值：大于 20 才显示
- 导入 `Flag` 图标

### 3. 项目详情页 — 数据质量模块

**文件**：`YiVad/src/views/project/components/DetailOverview.vue`

- 新增 `dataQualityIssues` computed：聚合开放 Issue 的优先级/截止日期/负责人缺失数
- 新增 Data Quality 卡片区域（3 个指标卡片）
- 使用 Flag/Timer/User 图标
- 导入 `useRouter`、`Flag`、`Timer`、`User`

### 4. 样式

**文件**：`YiVad/src/styles/DetailOverview.scss`

- 新增 `.do-dq-grid`、`.do-dq-item`、`.do-dq-item__count/label` 样式
- warn 橙色背景、info 蓝色背景

### 5. 数据修复 — 项目 Key 正常化

通过 MongoDB updateMany 批量修复：
```
db.issues.updateMany({project_key: 'YiVad'}, {$set: {project_key: 'yivad'}})
db.bugs.updateMany({project_key: 'YiVad'}, {$set: {project_key: 'yivad'}})
```
修复量：535 issues + 178 bugs

### 6. 国际化

- `home.zh.ts/en.ts`：`noPriorityItems`、`noDueDateItems`
- `project.zh.ts/en.ts`：`overview.dataQuality.*`