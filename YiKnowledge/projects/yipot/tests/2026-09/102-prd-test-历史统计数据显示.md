---

doc_type: test
prd_test_id: "PO-09-102"
title: "PO-09-102: 历史统计数据显示 — 测试方案"
status: 已完成
priority: P1
owner: Claude
roles: [engineer]
created: 2026-09-23
updated: 2026-09-23
project: YiPot
project_id: yipot
prd_month: "202609"

type: test
---

# PO-09-102: 统计显示 — 测试方案

| 场景 | 期望 |
|------|------|
| 100 条记录 | 显示 N records / M unique / ~K avg chars |
| 0 条 | 全部为 0 |
| Clear All | 统计归零 |
| 新翻译后返回 | 自动更新 |