---

doc_type: test
prd_test_id: "YP-09-108"
title: "YP-09-108: 智能供应商推荐 — 测试方案"
status: 已完成
priority: P2
created: 2026-09-23
updated: 2026-09-23
project: YiPet
project_id: yipet
prd_month: "202609"

type: test
---

# YP-09-108: 智能供应商推荐 — 测试方案

| 场景 | 期望 |
|------|------|
| getProviderRecommend() | 返回 {recommended, providers[], counts} |
| 全部 healthy | recommended != null, healthy_count = N |
| RPC 失败 | throw Error |
| 类型一致性 | 与 YiVad ProviderRecommendation 对称 |