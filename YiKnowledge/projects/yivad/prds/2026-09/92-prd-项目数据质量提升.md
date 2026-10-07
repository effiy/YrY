---
title: "YiVad 项目数据质量提升 — 综合报告"
status: 已完成
priority: P0
owner: Chengliang.Yi
created: 2026-09-23
updated: 2026-09-23
project: YiVad
type: report
tags: [综合报告, 数据质量, 后端修复, 前端规范化]
category: 项目/管理后台/报告
roles: [engineer]
source_okr: [yivad-003]
source: 内部
related_modules: ["92-prd-task-项目数据看板聚合修复"]
related_tests: ["92-prd-test-项目数据看板聚合修复"]
benefit: "综合报告：项目数据质量提升"
lifecycle: active
---

# YiVad 项目数据质量提升 — 综合报告

> 覆盖 PRD: [YV-09-90 项目数据规范化](./90-prd-项目数据规范化.md) + [YV-09-92 项目数据看板聚合修复](./92-prd-项目数据看板聚合修复.md)
> OKR: yivad-003 代码质量与健康度提升

---

## 一、问题发现

`/project/yivad` 页面显示的统计数据严重失真：

| 指标 | 页面显示 | MongoDB 实际 | 偏差 |
|------|---------|-------------|------|
| Issue 总数 | 9 | 544 | **仅统计 1.7%** |
| 已完成 | 4 | 206 | **少报 98%** |
| 完成率 | 2% | 38% | **偏差 36pp** |
| 逾期 | 2 | 0 | 虚报 |
| 未分配 | 150 | 0 | 虚报 |

**根因链**：外部导入 → Schema 不兼容（Title Case、字段名差异）→ 前端统计层 + 后端聚合层双重失效。

## 二、修复方案

### 前端（YV-09-90）

| 修复点 | 文件 | 方案 |
|--------|------|------|
| 字段映射 | `issueService.ts` | `normalizeIssue()` 6字段规范化（status/issue_type/priority/assignee/updated_at/created_at） |
| 加载接入 | `useProjectDetail.ts` `useProjectData.ts` `issueStore.ts` | 3路径 `.map(normalizeIssue)` |
| 数据修复 | MongoDB | 94 状态 + 150 assignee + 3 module → 247 条 |
| 单元测试 | `normalizeIssue.test.ts` | 31 用例 |

### 后端（YV-09-92）

| 修复点 | 文件 | 方案 |
|--------|------|------|
| project_key 匹配 | `project_dashboard.py` | `$or` 匹配双大小写 + 合并 |
| status 枚举 | 同上 | CLOSED 列表含 Title Case 变体 |
| 逾期判断 | 同上 | `$gte` 门控排除 null |
| key 合并 | 同上 | `key.lower()` 归并 |

## 三、效果

| 指标 | Before | After |
|------|--------|-------|
| Issues | 9 | **544** |
| Done | 4 | **206** |
| Completion | 2% | **38%** |
| Overdue | 2 | **0** |
| Unassigned | 150 | **0** |
| Type "?" | 191 | **0** |
| Priority "?" | 191 | **0** |

## 四、交付文件

| # | 文件 | 类型 |
|---|------|------|
| 1 | `YiAi/src/services/analytics/project_dashboard.py` | 后端代码 |
| 2 | `YiVad/src/api/modules/issueService.ts` | 前端代码 |
| 3 | `YiVad/src/hooks/useProjectDetail.ts` | 前端代码 |
| 4 | `YiVad/src/views/project/composables/useProjectData.ts` | 前端代码 |
| 5 | `YiVad/src/stores/modules/issue.ts` | 前端代码 |
| 6 | `YiVad/tests/api/normalizeIssue.test.ts` | 单元测试 |
| 7 | `prds/2026-09/90-prd-项目数据规范化.md` | PRD |
| 8 | `devs/2026-09/90-prd-task-项目数据规范化.md` | Dev |
| 9 | `tests/2026-09/90-prd-test-项目数据规范化.md` | Test |
| 10 | `prds/2026-09/90-交付报告-项目数据规范化.md` | 交付报告 |
| 11 | `prds/2026-09/92-prd-项目数据看板聚合修复.md` | PRD |
| 12 | `devs/2026-09/92-prd-task-项目数据看板聚合修复.md` | Dev |
| 13 | `tests/2026-09/92-prd-test-项目数据看板聚合修复.md` | Test |
| 14 | `prds/2026-09/92-综合报告-项目数据质量提升.md` | 综合报告 |

全部已注册至 `prds/` `devs/` `tests/` 三处 README 可追溯矩阵。

## 五、数据链路验证

```
MongoDB (544 issues) → Dashboard API ($or + CLOSED fix) → useProjectStats (authoritative)
                     → Issue API → normalizeIssue() → 15+ consumer components
```

`curl /analytics/dashboard` → `issues=544 done=206 overdue=0` ✅
`npx vitest run normalizeIssue.test.ts` → `31/31 passed` ✅