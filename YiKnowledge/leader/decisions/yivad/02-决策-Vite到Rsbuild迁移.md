---
title: "ADR: YiVad Vite to Rsbuild Migration"
tags: [adr, yivad, rsbuild, vite, migration, build]
category: leader/decisions/yivad
created: 2026-08-21
updated: 2026-09-10
source: internal
type: decision
status: accepted
lifecycle: implemented
review_cycle: quarterly
roles: [leader, engineer]
benefit: "理解从 Vite 迁移到 Rsbuild 的决策——构建性能提升、生态对齐以及迁移中的具体变更"
related:
  - ../../../engineer/learn/projects/yivad/README.md
---

# ADR: YiVad Vite 到 Rsbuild 迁移

> **状态**：已接受 (2026-07-28) — 已实施

## 上下文

YiVad 原先基于 Vite 8 构建。团队决定迁移到 Rsbuild 1 以获得更好的构建性能和与 Rspack 生态的对齐。

**迁移背景**：
- Vite 的开发服务器使用原生 ESM，对大型项目的依赖预构建 (pre-bundling) 可能较慢
- Rsbuild 基于 Rspack（Rust 实现的 Webpack 兼容打包器），构建性能优于 Vite 的生产构建
- YiPet 也使用 Rsbuild——两个前端项目统一构建工具降低了上下文切换成本

## 决策

**从 Vite 8 迁移到 Rsbuild 1，用自定义 Rsbuild 插件替换 Vite 专用插件。**

### 变更对比

| Vite | Rsbuild | 说明 |
|------|---------|------|
| `VITE_*` 环境变量前缀 | `RSBUILD_ENV_*` 前缀 | 所有环境变量引用需更新 |
| `vite-plugin-svg-icons` | 自定义 `svg-sprite` 插件 | Vite 插件不兼容 Rsbuild，需自行实现 |
| `import.meta.glob` 用于视图 | 自定义 `views-glob` 插件 | 自动视图注册机制需重新实现 |

### 环境变量迁移注意事项

这是迁移中**最容易出错的环节**。任何残留的 `VITE_` 前缀的环境变量引用在 Rsbuild 中将返回 `undefined`，导致运行时行为异常但不一定报错（静默失败）。

**正确示例**：
- `import.meta.env.VITE_API_BASE` → `import.meta.env.RSBUILD_ENV_API_BASE`（假设 env var 为 `RSBUILD_ENV_API_BASE`）
- `process.env.VITE_APP_TITLE` → `process.env.RSBUILD_ENV_APP_TITLE`

## 后果

### 正面影响
- 构建性能提升——Rspack 的 Rust 核心比 Vite 的 esbuild/rollup 组合更快
- 与 YiPet 构建工具统一——减少跨项目切换的认知负担

### 负面影响
- 环境变量前缀从 `VITE_` 变更为 `RSBUILD_ENV_`——任何残留的 `VITE_` 引用都是 bug
- 两个自定义插件（`svg-sprite`、`views-glob`）需要持续维护
- 团队需要学习 Rsbuild 的配置语法（与 Vite 有差异）

### 风险与缓解
- **残留 `VITE_` 引用**：建议在 pre-commit hooks 中添加 lint 规则，检测 `import.meta.env.VITE_` 引用并阻止提交
- **自定义插件维护负担**：`svg-sprite` 和 `views-glob` 两个插件是对 Vite 特性的补充，需确保在 Rsbuild 版本升级时保持兼容

## 适用场景

- 前端构建工具迁移的决策参考
- 构建工具迁移中环境变量变更的风险防范

## 反模式

- **迁移后不清理旧引用。** 最危险的 bug 是静默的——残留的 `VITE_` 引用返回 `undefined` 而不报错，导致功能异常但难以定位。必须在迁移完成后立即添加自动化检查