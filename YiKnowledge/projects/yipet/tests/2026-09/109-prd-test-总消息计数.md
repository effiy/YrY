---

doc_type: module
prd_id: "PE-09-109"
title: "PE-09-109-test: 总消息计数 — 测试方案"
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

# PE-09-109-test: 总消息计数 — 测试方案

## 测试用例

### TC-01: 有消息时显示计数

```
Given: 3 sessions, messageCount 分别为 10, 25, 0
When: 渲染 sidebar footer
Then: totalMessageCount = 35, 显示 "· 35 msgs"
```

### TC-02: 无消息时不显示

```
Given: 2 sessions, messageCount 均为 0
When: 渲染
Then: totalMessageCount = 0, v-if 隐藏
```

### TC-03: 单数形式

```
Given: 1 session, messageCount = 1
When: 渲染
Then: 显示 "· 1 msg"（非 "msgs"）