---

doc_type: module
prd_id: "PE-09-110"
title: "PE-09-110-test: 会话陈旧标记 — 测试方案"
status: 已完成
priority: P2
owner: Claude
roles: [engineer]
created: 2026-09-23
updated: 2026-09-23
project: YiPet
project_id: yipet
prd_month: "202609"

type: test
---

# PE-09-110-test: 会话陈旧标记 — 测试方案

## 测试用例

### TC-01: 旧会话显示 stale

```
Given: 会话 updatedAt = 8 天前
When: 渲染 SessionListItem
Then: isStale = true, 显示黄色 "stale" 徽章
```

### TC-02: 新会话不显示

```
Given: 会话 updatedAt = 3 天前
When: 渲染
Then: isStale = false, 无徽章

### TC-03: 正好 7 天

```
Given: 会话 updatedAt = 7 天前（168h）
When: 渲染
Then: isStale = false（days > 7, 非 >= 7）