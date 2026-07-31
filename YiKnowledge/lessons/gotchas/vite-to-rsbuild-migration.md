---
title: Vite → Rsbuild 迁移陷阱
tags: [陷阱, Vite, Rsbuild, 迁移]
category: lessons/gotchas
created: 2026-07-31
updated: 2026-07-31
source: internal
type: summary
status: stable
---

# Vite → Rsbuild 迁移陷阱

## 1. 现象

把项目从 Vite 迁到 Rsbuild（Rspack-based），常见陷阱：

- env 变量前缀变化（`VITE_` → `RSBUILD_ENV_`）
- 自定义插件不兼容（vite-plugin-* 不直接可用）
- svg-sprite 等专有功能需重写
- views glob import 路径处理不同
- HMR 行为略有差异

## 2. 根因

- Vite 基于 esbuild + Rollup，Rsbuild 基于 Rspack（Rust webpack）
- 两者插件 API 不兼容
- 环境变量约定不同
- 静态资源处理路径不同

## 3. 解决方案

### 3.1 环境变量前缀

```bash
# Vite
VITE_API_URL=...

# Rsbuild
RSBUILD_ENV_API_URL=...
```

迁移时批量替换。代码中 `import.meta.env.VITE_X` → `process.env.RSBUILD_ENV_X`。

### 3.2 自定义插件

- vite-plugin-svg-sprite → 自写 rsbuild plugin
- vite-plugin-pages-glob → 用 rsbuild 的 source glob
- 通用插件（如 unplugin-vue-components）Rsbuild 也支持

### 3.3 svg-sprite 处理

```js
// Vite 旧写法
import { vitePluginSvgSprite } from 'vite-plugin-svg-sprite';

// Rsbuild 新写法
export const svgSpritePlugin = (options) => ({
  name: 'svg-sprite',
  setup(api) {
    api.transform({ pool: 'all' }, async (ctx) => {
      // 处理 .svg 文件
    });
  },
});
```

### 3.4 views glob import

```js
// Vite
const modules = import.meta.glob('./views/**/*.vue');

// Rsbuild (用 webpack require.context 等价)
const modules = {};
const ctx = require.context('./views', true, /\.vue$/);
ctx.keys().forEach(k => { modules[k] = ctx(k); });
```

### 3.5 HMR

- Vite：原生 ESM HMR
- Rsbuild：webpack HMR（部分场景行为差异）
- 多数场景无感，复杂 HMR 边界 case 需测试

## 4. 迁移步骤

1. 备份当前 vite 配置
2. 装 rsbuild + rsbuild core
3. 新建 rsbuild.config.ts
4. 迁 env 变量前缀
5. 重写自定义插件
6. 测试 svg-sprite / glob import / HMR
7. 跑全套测试与构建
8. 验证 dev server 与 production build
9. 团队 PR review
10. 删除旧 vite 配置

## 5. 选 Rsbuild 的理由

- 比 Vite 大项目快 5-10x
- 比 webpack 5 快（Rust 实现）
- 与 webpack 生态兼容（迁移成本相对低）
- monorepo 友好

## 6. 不迁移的理由

- Vite 已稳定，迁移无必要
- 团队不熟 Rspack
- 项目小，Vite 够快

## 7. 预防措施

- 不要假设 vite-* 插件永远可用
- 自定义插件封装为 unplugin-*（跨工具兼容）
- env 变量约定写进文档

## 8. 本团队落地

- YiVad 已迁移到 Rsbuild（详见个人 memory `project_yry_rsbuild_migration.md`）
- 关键路径：env 前缀 + svg-sprite + views-glob 三个插件重写

## 9. 类似迁移陷阱

- webpack → Vite：env 变量、CommonJS vs ESM、动态 require
- Vue CLI → Vite：node polyfill、CSS 处理差异
- 任何 webpack 系 → ESM 系：动态 require 不支持

## 10. 关联记忆

- 个人 memory: `project_yry_rsbuild_migration.md`
- 工具：[Rsbuild 文档](https://rsbuild.dev)
