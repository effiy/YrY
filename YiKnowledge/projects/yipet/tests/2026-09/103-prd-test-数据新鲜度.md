---

doc_type: module
prd_id: "PE-09-103"
title: "PE-09-103-test: 数据新鲜度指示器 — 测试方案"
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

# PE-09-103-test: 数据新鲜度指示器 — 测试方案

## 测试用例

### TC-01: 加载后显示新鲜

```
Given: 会话加载完成，lastSyncTime = Date.now()
When: 渲染 StatsBar
Then: 显示绿色脉冲圆点 + "just now" 标签
      isFresh = true
```

### TC-02: 60s 后变陈旧

```
Given: lastSyncTime = Date.now() - 61000
When: 渲染 StatsBar
Then: 显示灰色圆点 + "1m ago" 标签
      isFresh = false，无脉冲动画
```

### TC-03: 长时间后显示小时

```
Given: lastSyncTime = Date.now() - 7200000
When: 渲染 StatsBar
Then: 显示灰色圆点 + "2h ago" 标签
```

### TC-04: 点击刷新

```
Given: StatsBar 显示新鲜度指示器
When: 点击刷新按钮
Then: 调用 store.mount()，重新加载会话
      lastSyncTime 更新为当前时间
```

### TC-05: 未加载时不显示

```
Given: lastSyncTime = 0（会话未加载）
When: 渲染 StatsBar
Then: ageLabel = ''，新鲜度区域不渲染
```

## 测试环境

- Vitest 2 + jsdom 29
- Mock Pinia store with lastSyncTime