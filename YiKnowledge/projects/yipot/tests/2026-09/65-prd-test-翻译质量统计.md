---

doc_type: module
prd_id: "PO-09-65"
title: "PO-09-65-test: 翻译质量统计 — 测试方案"
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

# PO-09-65-test: 翻译质量统计 — 测试方案

## 测试用例

### TC-01: 有反馈时显示好评率

```
Given: YiAi translation_feedback 有 10 good + 2 bad
When: 打开 History 页面
Then: 显示 "83% 👍"（绿色，≥80%）
      tooltip: "10 good · 2 bad"
```

### TC-02: 中等好评率显示黄色

```
Given: 5 good + 5 bad = 50%
When: 打开 History 页面
Then: 显示 "50% 👍"（黄色）
```

### TC-03: 低好评率显示红色

```
Given: 2 good + 8 bad = 20%
When: 打开 History 页面
Then: 显示 "20% 👍"（红色）
```

### TC-04: 无反馈时不显示

```
Given: translation_feedback 为空
When: 打开 History 页面
Then: feedbackTotal = 0，不显示 👍 统计
```

### TC-05: YiAi 不可达降级

```
Given: YiAi 未运行
When: 打开 History 页面
Then: health = null，feedbackGood/Total = 0
      不显示 👍 统计，页面正常
```

## 测试环境

- YiAi 运行，MongoDB translation_feedback 有数据
- YiPot `pnpm tauri dev`