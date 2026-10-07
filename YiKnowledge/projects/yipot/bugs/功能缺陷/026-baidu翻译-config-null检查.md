---
title: "Baidu 翻译 index.jsx config 解构无 null 检查"
tags: [bug, frontend, translate, baidu, null-safety, config]
category: projects/yipot/bugs
created: 2026-09-23
updated: 2026-09-23
source: internal
type: bug
status: resolved
severity: minor
priority: p2
project: yipot
module: src/services/translate/baidu/index.jsx
reporter: Claude
environment: all
affected_version: 3.0.7
fixed_version: 3.0.8
frequency: rare
roles: [engineer]
---

# Baidu 翻译 config 解构无 null 检查

---

## 一、现象

> 百度翻译服务配置未保存时，`const { appid, secret } = config;` 中 `config` 为 `undefined`，抛出 `TypeError`。

## 二、修复

```js
// Before
const { config } = options;
const { appid, secret } = config;

// After
const { config = {} } = options;
const { appid, secret } = config;
if (!appid || !secret) {
    throw 'Please configure appid and secret';
}
```

## 三、验证

- [x] `pnpm build` 通过