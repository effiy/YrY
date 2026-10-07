---

doc_type: module
prd_id: "PO-09-57"
title: "PO-09-57: 历史记录单条删除 — 每行删除按钮 + 确认提示"
status: 已完成
priority: P2
owner: Claude
roles: [product, engineer]
created: 2026-09-23
updated: 2026-09-23
project: YiPot
project_id: yipot
prd_month: "202609"

type: 需求
---

# PO-09-57: 历史记录单条删除

> 子 PRD，主 PRD：[54-prd-交互增强与历史优化](./54-prd-交互增强与历史优化.md)

## 范围

**In scope**：每行 `MdDeleteOutline` 按钮 + `confirm()` + `DELETE FROM history WHERE id=$1`

| 优先级 | 故事 | 验收标准 |
|--------|------|---------|
| P2 | 删除单条记录 | confirm 弹窗，删除后刷新 |

## 时间线

全部 2026-09-23（Claude）