---

doc_type: module
prd_id: "PO-09-69"
title: "PO-09-69-test: 语种分布摘要 — 测试方案"
status: 已完成
priority: P2
owner: Claude
roles: [engineer]
created: 2026-09-23
updated: 2026-09-23
project: YiPot
project_id: yipot
prd_month: "202609"

type: test
---

# PO-09-69-test: 语种分布摘要 — 测试方案

## 测试用例

### TC-01: 显示 Top 3 语言

```
Given: by_target_language = [{language:"zh",count:120},{language:"en",count:80},{language:"ja",count:45},{language:"ko",count:20}]
When: 渲染 stats bar
Then: 显示 "4 langs zh en ja"
```

### TC-02: 少于 3 种语言

```
Given: by_target_language = [{language:"zh",count:10}]
When: 渲染
Then: 显示 "1 langs zh"
```

### TC-03: 无语言数据

```
Given: analytics = null
When: 渲染
Then: topLangs = [], 不显示语言标签