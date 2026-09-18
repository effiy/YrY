---
doc_type: test
title: "动画渲染 GPU 加速 — 测试用例"
status: 已完成
owner: 陈铭
created: 2026-09-11
updated: 2026-09-15
project: YiPet
prd_month: "202609"
source_prds: ["28-性能-动画渲染GPU加速"]
---

# 动画渲染 GPU 加速 — 测试用例

> **文档职责**：本文档定义**怎么验证**（VERIFY），不含产品目标与实现方案。
| 编号 | 用例 | 预期 | 优先级 |
|------|------|------|--------|
| TC-GPU01 | transform+opacity | Composite 层 60fps | P1 |
| TC-GPU02 | will-change | 预提升合成层 | P1 |
| TC-GPU03 | 避免 Layout 动画 | width/height/top/left 不触发重排 | P2 |