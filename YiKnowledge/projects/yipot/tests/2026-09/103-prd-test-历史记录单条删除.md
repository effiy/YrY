---

doc_type: test
prd_test_id: "PO-09-103"
title: "PO-09-103: 历史记录单条删除 — 测试方案"
status: 已完成
priority: P2
owner: Claude
roles: [engineer]
created: 2026-09-23
updated: 2026-09-23
project: YiPot
project_id: yipot
prd_month: "202609"

type: test
---

# PO-09-103: 单条删除 — 测试方案

| 场景 | 期望 |
|------|------|
| 点击删除 → 确认 | 记录消失，统计更新 |
| 点击删除 → 取消 | 记录保留 |
| 删除最后一条 | 表格为空，统计归零 |