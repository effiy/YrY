---
title: React 18 + jsxDEV 不匹配
tags: [陷阱, React, jsxDEV, 打包]
category: lessons/gotchas
created: 2026-07-31
updated: 2026-07-31
source: internal
type: summary
status: stable
---

# React 18 + jsxDEV 不匹配

## 1. 现象

React 18 项目在打包后报错：

```
jsxDEV is not a function
```

或：

```
TypeError: Cannot read properties of undefined (reading 'jsxDEV')
```

只在生产构建（NODE_ENV=production）出现，dev 模式正常。

## 2. 根因

React 18 的 SWC / Babel 插件区分 dev / prod：

- dev mode：调用 `jsxDEV`（带 source 位置信息，便于调试）
- prod mode：调用 `jsx` 或 `jsxRuntime.jsx`（最小化）

陷阱：**SWC/Babel 配置使用 dev mode，但构建时 NODE_ENV=production**。

- 源码中 `import { jsxDEV } from 'react/jsx-dev-runtime'`
- 生产构建时 React 切换到 `react/jsx-runtime`（不含 jsxDEV）
- 报错 "jsxDEV is not a function"

## 3. 典型触发场景

- Babel 配置 `runtime: 'automatic'`，但 `development: true` 写死
- SWC 配置 `jsc.transform.react.development: true` 写死
- Vite / Rsbuild 的 `define` 中 `NODE_ENV` 与构建 mode 不一致
- 用 esbuild 跑 React 但 NODE_ENV 处理错

## 4. 解决方案

### 方案 1：构建模式与 NODE_ENV 对齐

确保 dev 构建时 NODE_ENV=development，prod 构建时 NODE_ENV=production。

```bash
# Dev
NODE_ENV=development vite

# Prod
NODE_ENV=production vite build
```

### 方案 2：SWC 配置自动跟随 NODE_ENV

```json
{
  "jsc": {
    "transform": {
      "react": {
        "runtime": "automatic",
        "development": false  // 或不要写死，跟随 NODE_ENV
      }
    }
  }
}
```

不写 `development` 字段让 SWC 跟随 NODE_ENV 自动判断。

### 方案 3：Babel 配置自动跟随

```js
// babel.config.js
module.exports = (api) => {
  const isDev = api.env('development');
  return {
    presets: [
      ['@babel/preset-react', { runtime: 'automatic', development: isDev }]
    ]
  };
};
```

### 方案 4：单独 dev 脚本用 production mode

YiPet chat.js 例子：dev 脚本仍走 production mode 构建，避免 jsxDEV：

```json
{
  "scripts": {
    "build:chat": "NODE_ENV=production webpack --mode production",
    "dev:chat": "NODE_ENV=production webpack --mode production --watch"
  }
}
```

不优雅但实用。

## 5. 预防措施

- React 项目 Babel / SWC 配置不写死 `development`
- CI 跑 production build 之前必跑 dev build 验证
- 监控生产环境报错，发现 jsxDEV 类问题立即排查
- 升级 React 大版本时跑全套测试

## 6. 类似陷阱

- Vue 3 与 Vue 2 模板编译差异
- Vue JSX 与 React JSX 配置不同
- SolidJS 的 jsxDEV 类似陷阱

## 7. 排查步骤

1. 看报错是否含 `jsxDEV` 或 `jsx-runtime`
2. 看构建命令的 NODE_ENV 与 mode 是否一致
3. 看 Babel / SWC 配置是否写死 development
4. 看是否有 `process.env.NODE_ENV` 的 define 配置错
5. 跑 dev 与 prod build 对比 React import 路径

## 8. 本团队落地

- YiPet chat.js dev 脚本用 `--mode production`（个人 memory `project_yipet_chat_jsxdev.md`）
- 配置约定：React 项目不写死 development
- 新 React 项目默认用 Vite / Rsbuild，避免手写 Babel

## 9. 关联记忆

- 个人 memory: `project_yipet_chat_jsxdev.md`
- 工具：[SWC React 配置](https://swc.rs/docs/configuration/compatibility/#react)
