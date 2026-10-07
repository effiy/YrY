---

doc_type: test
prd_test_id: "YV-09-101"
title: "YV-09-101: 翻译分析 ECharts 仪表盘 — 测试方案"
status: 已完成
priority: P0
owner: Claude
roles: [engineer]
created: 2026-09-23
updated: 2026-09-23
project: YiVad
project_id: yivad
prd_month: "202609"
estimate: 0.1
source_task: "101-prd-task-翻译分析ECharts仪表盘.md"

type: test
---

# YV-09-101: ECharts 仪表盘 — 测试方案

## 测试用例

| 场景 | 期望 |
|------|------|
| 5 KPI 卡片正常渲染 | 数值+单位显示 |
| 饼图有数据 | 环形图 + 标签百分比 |
| 柱状图颜色编码 | 绿≥90%/黄≥70%/红<70% |
| 折线图 dataZoom | 滑块可拖拽缩放 |
| 空数据 | 图表不崩溃 |
| 窗口 resize | echarts.resize() 自适应 |
| 组件卸载 | dispose() 调用 |

## 测试命令

```bash
cd YiVad && pnpm vitest run tests/api/translationService.test.ts
```