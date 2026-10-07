---
title: "History/index.jsx TypeScript 类型注解在 JSX 文件中导致构建失败"
tags: [bug, frontend, build, typescript, jsx, syntax]
category: projects/yipot/bugs
created: 2026-09-23
updated: 2026-09-23
source: internal
type: bug
status: resolved
severity: critical
priority: p0
project: yipot
module: src/window/Config/pages/History/index.jsx
reporter: Claude
environment: all
affected_version: 3.0.7
fixed_version: 3.0.8
frequency: always
roles: [engineer]
---

# History/index.jsx TypeScript 类型注解导致构建失败

---

## 一、现象

> `pnpm build` 报错 `ERROR: Expected ")" but found ":" at History/index.jsx:69:54`。esbuild 无法解析 `.jsx` 文件中的 TypeScript 类型注解 `(p: any)`。

## 二、根因

```js
// Line 69-71 — TypeScript syntax in .jsx file:
const healthyCount = provEntries.filter((p: any) => p.status === 'healthy').length;
```

## 三、修复

移除 TypeScript 类型注解：

```js
const healthyCount = provEntries.filter((p) => p.status === 'healthy').length;
```

## 四、验证

- [x] `pnpm build` 通过
- [ ] YiAi 数据统计面板正常渲染