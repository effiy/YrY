---

doc_type: module
prd_id: "PO-09-64"
title: "PO-09-64-test: 历史页 YiAi 分析 — 测试方案"
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

# PO-09-64-test: 历史页 YiAi 分析 — 测试方案

## 测试用例

### TC-01: YiAi 可用时显示云端统计

```
Given: YiAi 运行，translation_records 有数据
When: 打开 History 页面
Then: 本地统计 "142 records · 89 unique · ~120 avg chars"
      右侧显示 "| 142 Ai tr. · 5 langs · en→zh zh→en ja→zh"
```

### TC-02: YiAi 不可达时降级

```
Given: YiAi 未运行
When: 打开 History 页面
Then: 仅显示本地统计 "142 records · 89 unique · ~120 avg chars"
      无云端统计区
```

### TC-03: 空数据分析

```
Given: YiAi 运行，translation_records 为空
When: 打开 History 页面
Then: 云端统计显示 "0 Ai tr. · 0 langs"
      无语种对显示
```

### TC-04: API 未初始化时

```
Given: getApi() 返回 null
When: 打开 History 页面
Then: loadYiAiStats 提前返回，yiAiStats 为 null
      无云端统计区
```

## 测试环境

- YiAi 运行在 localhost:10086
- YiPot `pnpm tauri dev`