---

doc_type: module
prd_id: "PO-09-63"
title: "PO-09-63-test: 缓存指示器 — 测试方案"
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

# PO-09-63-test: 缓存指示器 — 测试方案

## 测试用例

### TC-01: 首次翻译无缓存徽章

```
Given: 翻译记忆无 "Hello world" 缓存
When: 翻译 "Hello world"
Then: 不显示 ⚡ Cached 徽章
      translateViaYiAi 返回 {text: "...", cached: false}
```

### TC-02: 重复翻译显示缓存徽章

```
Given: "Hello world" 已翻译过（缓存存在）
When: 再次翻译 "Hello world"（相同文本）
Then: 显示 ⚡ Cached 紫色徽章
      translateViaYiAi 返回 {text: "...", cached: true}
```

### TC-03: 文本切换清除徽章

```
Given: 当前显示 ⚡ Cached 徽章（刚翻译了 "Hello"）
When: 输入新文本 "World" 触发翻译
Then: setIsCached(false) 被调用，徽章消失
```

### TC-04: 流式翻译永远不缓存

```
Given: 选择 openai 引擎（流式）
When: 翻译任意文本
Then: handleTranslateSuccess 的 cached=0
      不显示 ⚡ Cached 徽章
```

### TC-05: 直接 API 路径不缓存

```
Given: 选择 google 引擎（不走 YiAi）
When: 翻译文本
Then: onSuccess 默认 cached=false
      不显示 ⚡ Cached 徽章
```

## 测试环境

- YiAi 运行，MongoDB translation_memory 有数据
- YiPot `pnpm tauri dev`