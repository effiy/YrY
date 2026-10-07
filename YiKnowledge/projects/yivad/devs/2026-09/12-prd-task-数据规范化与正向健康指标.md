---

title: "12-prd-task-数据规范化与正向健康指标"
tags: ["dev", "data-normalization", "health-metrics"]
category: projects/yivad/devs
created: "2026-09-23"
updated: "2026-09-23"
source: "claude"
type: task
status: 已完成
owner: "Chengliang Yi"
estimate_frontend: "1d"
priority: "P1"
source_prd: "12-prd-数据规范化与正向健康指标"

---

## 实施计划

### 1. 数据正常化

通过 MongoDB `updateMany` 批量修复 Status 不一致（443 条记录）。

### 2. useHomeData.ts — 新增 Type 缺口

- `HomeStats` 新增 `noTypeCount`
- `loadTodayCounts` 新增查询：开放 Issue 中 `issue_type` 为 null/empty

### 3. 首页 UI — Type 缺口告警

- Alert 区域新增「N 个 Issue 缺少类型」黄色告警（>20 阈值）
- 导入 `PriceTag` 图标
- 更新告警可见性条件

### 4. 项目详情 — 正向健康指标

- Bugs 卡片升级：显示 `解决率% resolved · resolved/total`
- 解决率 >80% 时卡片变绿色（正向指标），否则保持红色（需要关注）
- 新增 Docs 卡片：显示项目 YiKnowledge 文档数量

### 5. 数据质量扩展

- 数据质量卡片新增「缺少类型」指标（Collection 图标）
- i18n 新增 `dataQuality.noType`（zh/en）

### 6. 国际化

- `home.zh.ts/en.ts`：`noTypeItems`
- `project.zh.ts/en.ts`：`overview.stats.docs`、`overview.dataQuality.noType`