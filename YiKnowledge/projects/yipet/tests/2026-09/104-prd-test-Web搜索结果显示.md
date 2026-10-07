---

doc_type: test
prd_test_id: "YP-09-104"
title: "YP-09-104: Web 搜索结果显示 — 测试方案"
status: 已完成
priority: P1
owner: Claude
roles: [engineer]
created: 2026-09-23
updated: 2026-09-23
project: YiPet
project_id: yipet
prd_month: "202609"

type: test
---

# YP-09-104: Web 搜索结果显示 — 测试方案

| 场景 | 期望 |
|------|------|
| 有搜索结果 | 卡片列表渲染 |
| 空结果 | 不渲染（v-if guard） |
| .gov 域名 | domainTier = high |
| github.com | domainTier = high |
| 未知域名 | domainTier = medium |
| 图片灯箱点击 | 大图显示 |
| 复制引用 | clipboard API 调用 |
| timingMs < 1000 | 显示 "Xms" |
| timingMs >= 1000 | 显示 "X.Xs" |