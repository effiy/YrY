---

doc_type: module
prd_id: "PE-09-108"
title: "PE-09-108-test: 阅读时间估算 — 测试方案"
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

# PE-09-108-test: 阅读时间估算 — 测试方案

## 测试用例

### TC-01: 长回复显示阅读时间

```
Given: AI 回复 200 words
When: 渲染 MessageBubble (pet, 非 streaming)
Then: readingTimeSecs = 60, showReadingTime = true
      显示 "~60s read"
```

### TC-02: 短回复不显示

```
Given: AI 回复 10 words
When: 渲染
Then: readingTimeSecs = 3, showReadingTime = false
      不显示阅读时间
```

### TC-03: 流式中不显示

```
Given: AI 回复正在 streaming
When: 渲染
Then: showReadingTime = false（streaming 检查）
```

### TC-04: 用户消息不显示

```
Given: 用户消息 200 words
When: 渲染
Then: showReadingTime = false（type 检查）
```