---
title: "Tencent Accurate/Iflytek OCR config + system info.ts icon 模板字符串 Bug"
tags: [bug, frontend, ocr, tencent, iflytek, info, icon, null-safety, typescript]
category: projects/yipot/bugs
created: 2026-09-23
updated: 2026-09-23
source: internal
type: bug
status: resolved
severity: minor
priority: p2
project: yipot
module: src/services/recognize/{tencent_accurate,iflytek}/index.jsx, src/services/recognize/system/info.ts
reporter: Claude
environment: all
affected_version: 3.0.7
fixed_version: 3.0.8
frequency: always
roles: [engineer]
---

# Tencent Accurate/Iflytek OCR config + system icon bug

---

## 一、OCR config 无默认值

`tencent_accurate/index.jsx` 和 `iflytek/index.jsx` 中 `const { config } = options` 无默认值。

**修复**: `const { config = {} } = options;`

## 二、system/info.ts icon 模板字符串 Bug

```ts
// Before:
icon: `system`,  // 模板字符串无插值 → system 作为标识符 → undefined

// After:
icon: 'system',   // 普通字符串
```

**影响**: 系统 OCR 服务图标无法显示。

## 三、验证

- [x] `pnpm build` 通过