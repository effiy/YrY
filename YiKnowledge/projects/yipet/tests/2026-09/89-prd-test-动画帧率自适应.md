---
doc_type: test
title: "动画帧率自适应 — 测试用例"
status: 已完成
owner: 陈铭
created: 2026-09-11
updated: 2026-09-15
project: YiPet
prd_month: "202609"
---

# 动画帧率自适应 — 测试用例

> **文档职责**：本文档定义**怎么验证**（VERIFY），不含产品目标与实现方案。
| 编号 | 用例 | 预期 | 优先级 |
|------|------|------|--------|
| TC-FPS01 | 60fps→全帧率 | 高性能设备 | P1 |
| TC-FPS02 | 30fps→降级 | 中性能设备 | P2 |
| TC-FPS03 | prefers-reduced-motion | 全部禁用 | P1 |