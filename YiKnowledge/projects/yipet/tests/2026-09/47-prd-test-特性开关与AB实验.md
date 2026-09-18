---
doc_type: test
title: "特性开关与 AB 实验 — 测试用例"
status: 待开始
owner: 陈铭
created: 2026-09-11
updated: 2026-09-15
project: YiPet
prd_month: "202609"
source_prds: ["47-基础设施-特性开关与AB实验"]
---

# 特性开关与 AB 实验 — 测试用例

> **文档职责**：本文档定义**怎么验证**（VERIFY），不含产品目标与实现方案。

| 编号 | 用例 | 预期 | 优先级 |
|------|------|------|--------|
| TC-FF01 | boolean 开关 | true/false 控制功能 | P1 |
| TC-FF02 | 百分比灰度 | 10% 用户看到新功能 | P2 |
| TC-FF03 | 用户白名单 | 指定用户生效 | P1 |