---
doc_type: test
title: "聊天窗口交互 — 测试用例"
status: 已完成
priority: 中
owner: 陈铭
roles: [engineer, qa]
created: 2026-09-11
updated: 2026-09-15
project: YiPet
prd_month: "202609"
source_prds: ["12-功能实现-聊天窗口交互"]
source_modules: ["12-prd-task-聊天窗口交互"]
---

# 聊天窗口交互 — 测试用例

> **文档职责**：本文档定义**怎么验证**（VERIFY），不含产品目标与实现方案。

## 测试用例

| 编号 | 用例 | 预期 | 优先级 |
|------|------|------|--------|
| TC-WIN01 | 窗口拖拽 | 顶部边缘→调整位置/大小 | P0 |
| TC-WIN02 | 侧边栏拖拽 | 左右拖拽调整宽度 | P1 |
| TC-WIN03 | 消息操作菜单 | 编辑/删除/重新生成/复制 | P0 |
| TC-WIN04 | 最小尺寸限制 | 400x300 下限 | P1 |

## 出口准则

- [ ] P0 用例 100% 通过