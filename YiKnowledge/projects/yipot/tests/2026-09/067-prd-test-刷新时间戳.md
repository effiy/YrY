---

doc_type: module
prd_id: "PO-09-67"
title: "PO-09-67-test: 刷新时间戳 — 测试方案"
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

# PO-09-67-test: 刷新时间戳 — 测试方案

## 测试用例

### TC-01: 初始加载显示 just now

```
Given: History 页面首次加载
When: loadYiAiStats 完成
Then: 刷新按钮旁显示 "just now"
```

### TC-02: 时间推进

```
Given: lastRefresh = Date.now() - 30000
When: 组件重新渲染
Then: 显示 "30s ago"
```

### TC-03: 刷新重置

```
Given: 显示 "2m ago"
When: 点击刷新按钮
Then: loadYiAiStats 完成，setLastRefresh(Date.now())
      显示 "just now"
```

### TC-04: 首次加载前不显示

```
Given: lastRefresh = null
When: 渲染 stats bar
Then: 时间戳不显示
```

## 测试环境

- YiPot `pnpm tauri dev`