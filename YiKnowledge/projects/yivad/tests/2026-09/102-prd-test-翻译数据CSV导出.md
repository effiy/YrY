---

doc_type: test
prd_test_id: "YV-09-102"
title: "YV-09-102: CSV 导出 — 测试方案"
status: 已完成
priority: P2
owner: Claude
roles: [engineer]
created: 2026-09-23
updated: 2026-09-23
project: YiVad
project_id: yivad
prd_month: "202609"
source_task: "102-prd-task-翻译数据CSV导出.md"

type: test
---

# YV-09-102: CSV 导出 — 测试方案

| 场景 | 期望 |
|------|------|
| 有数据时点击 CSV | 下载 .csv 文件，含 4 列 |
| 无数据时按钮 | disabled |
| 文件名格式 | `translation-providers-YYYY-MM-DD.csv` |
| 空数据行 | 不包含空行 |