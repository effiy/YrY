---

doc_type: test
prd_test_id: "YV-09-104"
title: "YV-09-104: Analytics Console — 测试方案"
status: 已完成
priority: P0
owner: Claude
roles: [engineer]
created: 2026-09-23
updated: 2026-09-23
project: YiVad
project_id: yivad
prd_month: "202609"

type: test
---

# YV-09-104: Analytics Console — 测试方案

| 场景 | 期望 |
|------|------|
| 7 KPI 卡片渲染 | 数值 + 趋势 + 迷你图 |
| Quality Score >80 | 绿色 |
| Quality Score 60-80 | 黄色 |
| Quality Score <60 | 红色 |
| Open Bugs 趋势上升 | 红色（inverted） |
| 项目筛选切换 | 数据联动刷新 |
| 空数据 | 骨架屏显示 |
| API 失败 | el-alert + Retry |