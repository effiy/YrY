---
doc_type: test
title: "聊天窗口拖拽管理 — 测试用例"
status: 已完成
priority: 中
owner: 陈铭
roles: [engineer, qa]
created: 2026-09-11
updated: 2026-09-15
project: YiPet
prd_month: "202609"
source_prds: ["24-架构设计-聊天窗口拖拽管理"]
source_modules: ["24-prd-task-聊天窗口拖拽管理"]
---

# 聊天窗口拖拽管理 — 测试用例

> **文档职责**：本文档定义**怎么验证**（VERIFY），不含产品目标与实现方案。

## 测试用例

| 编号 | 用例 | 预期 | 优先级 |
|------|------|------|--------|
| TC-DRG01 | 窗口自由拖拽 | 鼠标拖拽→位置跟随 | P0 |
| TC-DRG02 | 最小尺寸限制 | 400x300 下限 | P1 |
| TC-DRG03 | 边界吸附 | 距边缘 16px 吸附 | P1 |
| TC-DRG04 | 多显示器 | 窗口不超出可视区域 | P2 |

## 出口准则

- [ ] P0 用例 100% 通过