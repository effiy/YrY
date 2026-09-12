---
title: "Gotcha: YiPet Chat Bundle Requires --mode production to Avoid jsxDEV"
tags: [gotcha, yipet, rsbuild, react, jsx, build]
category: engineer/learn/lessons/gotchas
created: 2026-08-24
updated: 2026-09-10
source: internal
type: summary
status: stable
lifecycle: active
review_cycle: quarterly
roles: [engineer]
benefit: "Engineers avoid the jsxDEV is not a function runtime error when building the YiPet chat bundle"
acceptance_criteria:
  - "Bug scenario described with root cause"
  - "Fix pattern documented"
  - "Applicable to all Rsbuild multi-entry React builds"
related:
  - ./README.md
  - ../../../projects/yipet/README.md
  - ../../../leader/decisions/yipet/react-18-antd-migration.md
---

# 陷阱：YiPet 聊天窗口必须使用 `--mode production` 才能运行

## 症状

在开发模式下运行 YiPet 聊天窗口时，浏览器控制台报错：

```
Uncaught TypeError: jsxDEV is not a function
```

聊天窗口无法渲染，页面白屏。但 Popup 弹窗和其他构建入口工作正常。

### 影响范围

- **受影响入口**：仅 `rsbuild.config.chat.ts`（聊天窗口），Popup 弹窗和 Bootstrap 入口不受影响
- **触发条件**：使用 `npm run dev:chat`（不带 `--mode production` 标志）启动聊天窗口开发模式
- **用户可感知症状**：聊天窗口完全不可用，白屏 + 控制台报错

## 根因分析

### 为什么只有聊天窗口受影响

YiPet 有 4 个独立的 Rsbuild 构建配置：

1. `rsbuild.config.ts`（Popup + Background）—— Vue 3 SFC，不使用 JSX
2. `rsbuild.config.chat.ts`（聊天窗口）—— **Vue 3 JSX + React 18.3 CDN** ← 受影响
3. `rsbuild.config.cdn.ts`（CDN 资源）—— IIFE 打包
4. `rsbuild.config.bootstrap.ts`（Content Script）—— 无 JSX

聊天窗口的特殊之处在于它的 React 18.3 是通过 CDN 加载的（从 `public/cdn/vendor/` 目录），而 CDN 中只有生产版本的 React（不含 `jsxDEV` 函数）。

### `jsxDEV` 是什么

React 有两个 JSX 转换函数：
- **`jsxDEV`**：开发模式专用，包含额外的运行时检查和警告（如 key 检查、prop-types 验证）
- **`jsx` / `jsxs`**：生产模式使用，移除了开发检查，体积极小

### 不匹配的根源

- **Rsbuild JSX 编译**：默认使用 `jsxDEV`（开发模式下的 JSX 转换）
- **CDN 加载的 React**：生产版本（不包含 `jsxDEV` 导出）
- **结果**：运行时找不到 `jsxDEV` 函数 → `Uncaught TypeError`

## 修复方案

聊天窗口的开发脚本必须添加 `--mode production` 标志：

```json
// YiPet/package.json
{
  "scripts": {
    "dev:chat": "rsbuild dev --config rsbuild.config.chat.ts --mode production"
  }
}
```

`--mode production` 标志告诉 Rsbuild 使用生产模式的 JSX 转换（`jsx` / `jsxs`），匹配 CDN 中加载的生产版本 React。

## 预防措施

### 1. 任何使用 React 的新 Rsbuild 入口必须用 `--mode production`

YiPet 的 CDN 目录中始终只加载生产版本的 React（MV3 CSP 要求所有资源本地化，维护开发版本会增加不必要的体积）。因此：**任何通过 CDN 加载 React 的新构建入口，其 `dev` 脚本必须带 `--mode production`。**

### 2. 同时测试 `npm run dev` 和 `npm run build`

`jsxDEV` 错误只在开发模式下出现——生产构建天然使用 `jsx`/`jsxs`。因此仅测试构建产物无法发现此问题。新入口的验证必须包括：
- `npm run build`：验证构建产出
- `npm run dev`：验证开发模式运行

### 3. 考虑合并 4 个 Rsbuild 配置为单一多入口配置

当前 4 个独立的 Rsbuild 配置文件各自维护构建脚本和配置项，增加了配置差异化的风险（每个入口的 `--mode` 标志可能不同）。合并为单一配置可以消除这种差异。

## 适用场景

这个陷阱不仅限于 YiPet。在任何通过 CDN 加载生产版本 React 的场景中都可能遇到：
- Rsbuild/Webpack/Vite 多入口项目的 React CDN 加载
- 微前端架构中主应用加载 React CDN
- Chrome 扩展的 content script 注入

## 检测方法

| 检测时机 | 方法 |
|---|---|
| 开发阶段 | 启动 `npm run dev:chat`，检查浏览器控制台是否存在 `jsxDEV is not a function` 错误 |
| 代码审查 | 检查 `package.json` 中新 Rsbuild 开发脚本是否带 `--mode production`（如果该入口使用 CDN React） |
| CI 验证 | 在 CI 中增加一个步骤：`npm run dev:chat & sleep 5 && curl http://localhost:<port>` 验证聊天窗口可访问 |

## 快速排查步骤

如果遇到类似的 JSX 运行时错误：

1. 检查加载的 React 版本（`window.React.version` 或 CDN 文件内容）
2. 检查构建工具的 JSX 编译模式（`process.env.NODE_ENV`）
3. 确认 CDN 中的 React 版本是否包含对应的 JSX 转换函数
4. 如果不匹配，在 dev 脚本中添加 `--mode production`