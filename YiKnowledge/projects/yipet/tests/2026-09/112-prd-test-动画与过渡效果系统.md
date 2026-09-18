---
doc_type: test
title: "动画与过渡效果系统 — 测试用例"
status: 已完成
owner: 陈铭
created: 2026-09-11
updated: 2026-09-15
project: YiPet
prd_month: "202609"
source_prds: ["112-功能实现-动画与过渡效果系统"]
---

# 动画与过渡效果系统 — 测试用例

> **文档职责**：本文档定义**怎么验证**（VERIFY），不含产品目标与实现方案。

| 编号 | 用例 | 预期 | 优先级 |
|------|------|------|--------|
| TC-ANM01 | CSS 动画 60fps | transform+opacity Composite 层 | P1 |
| TC-ANM02 | prefers-reduced-motion | 禁用所有动画 | P1 |
| TC-ANM03 | rAF 批量更新 | 流式渲染帧率稳定 | P1 |