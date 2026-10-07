---

doc_type: module
prd_id: "PE-09-116"
title: "PE-09-116-test: 时间分组 — 测试方案"
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

# PE-09-116-test: 时间分组 — 测试方案

## 测试用例

### TC-01: 混合时间分三组

```
Given: 3 个今天会话 + 5 个本周会话 + 4 个旧会话
When: 渲染侧边栏
Then: 显示 3 个分组头（Today · 3 / This Week · 5 / Older · 4）
```

### TC-02: 仅今天有会话

```
Given: 3 个会话全部今天
When: 渲染
Then: 仅显示 "Today · 3"，无其他分组头
```

### TC-03: 空分组不显示

```
Given: 今天无会话，本周 2 个
When: 渲染
Then: 无 "Today" 头，直接显示 "This Week · 2"