---
title: "lang_detect.js 7 个 API 检测函数缺少 try/catch 导致未处理 Promise 拒绝"
tags: [bug, frontend, js, error-handling, lang-detect, promise]
category: projects/yipot/bugs
created: 2026-09-23
updated: 2026-09-23
source: internal
type: bug
status: resolved
severity: major
priority: p1
project: yipot
module: src/utils/lang_detect.js
reporter: Claude
environment: all
affected_version: 3.0.7
fixed_version: 3.0.8
frequency: occasional
roles: [engineer]
---

# lang_detect.js 7 个 API 检测函数缺少 try/catch

---

## 一、现象

> 当网络不可达或 API 服务异常时，`baidu_detect`/`tencent_detect`/`google_detect`/`niutrans_detect`/`yandex_detect`/`bing_detect` 中的 `fetch()` 抛出异常，导致未处理的 Promise 拒绝，用户界面无任何反馈。

## 二、根因

全部 7 个检测函数的 `fetch()` 调用未被 `try/catch` 包裹。网络异常时异常向上传播为未处理的 Promise 拒绝。`niutrans_detect` 中还存在 `new String(new Date().getTime())` 反模式（应使用 `String()` 原始类型）。

## 三、修复

**7 个函数统一修复模式：**

```js
// Before:
async function baidu_detect(text) {
    let res = await fetch(...);
    if (res.ok) { ... }
    return 'en';
}

// After:
async function baidu_detect(text) {
    try {
        let res = await fetch(...);
        if (res.ok && res.data?.lan && ...) { return lang_map[...]; }
    } catch { /* fall through to default */ }
    return 'en';
}
```

同时修复：
- `new String(new Date().getTime())` → `String(new Date().getTime())`
- 可选链 `res.data?.lan` 替代 `result.lan` 深度访问
- 代码压缩：lang_map 声明从多行合并为紧凑格式

## 四、验证

- [x] `pnpm build` 通过
- [ ] 断网时语言检测降级为 `'en'` 而非未处理异常