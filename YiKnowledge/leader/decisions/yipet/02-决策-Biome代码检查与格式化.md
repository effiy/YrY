---
title: "ADR: YiPet Biome Lint/Format Adoption"
tags: [adr, yipet, biome, linting, formatting]
category: leader/decisions/yipet
created: 2026-08-21
updated: 2026-09-10
source: internal
type: decision
status: accepted
lifecycle: implemented
review_cycle: quarterly
roles: [leader, engineer]
benefit: "理解用 Biome 替代 ESLint + Prettier 的决策——单一工具完成代码检查与格式化，更快、更简洁"
related:
  - ../../../engineer/learn/projects/yipet/README.md
---

# ADR: YiPet 采用 Biome 代码检查与格式化

> **状态**：已接受 (2026-07-28) — 已实施

## 上下文

YiPet 的技术栈迁移（React 15 → 18，Bootstrap → Ant Design 5）为同时现代化代码检查和格式化工具链提供了理想时机。ESLint + Prettier 的组合虽然成熟，但配置复杂且运行速度较慢——两个工具的规则可能冲突，需要额外的整合配置。

**改造前的状况**：
- 两个独立的配置文件和两个 npm 包
- ESLint（JS 实现）在 YiPet 的多入口 Rsbuild 构建中运行缓慢
- Prettier 和 ESLint 之间存在规则冲突，需要额外的 `eslint-config-prettier` 来协调
- MV3 内容安全策略限制外部脚本，工具链也是依赖管理的一部分

## 决策

**用 Biome 2.5 替换 ESLint + Prettier，同时处理代码检查和格式化。**

Biome 是基于 Rust 的高性能工具，将代码检查和格式化合并为一个二进制文件。它对 TypeScript/TSX 项目覆盖了与 ESLint + Prettier 相同的规则集。

### 配置变更

**之前**：`.eslintrc.js` + `.prettierrc` + `eslint-config-prettier`
**之后**：单一的 `biome.json` 配置文件

```json
// biome.json 示例结构
{
  "formatter": { "indentStyle": "space", "lineWidth": 100 },
  "linter": {
    "rules": {
      "recommended": true,
      "correctness": { "noUnusedVariables": "error" }
    }
  }
}
```

### 命令变更

**之前**：`eslint --fix src/` + `prettier --write src/`
**之后**：`biome check --write src/`（一次运行完成检查和格式化）

## 选择理由

- **单一工具替代两个**（ESLint + Prettier）— 更少的配置，更少的依赖
- **基于 Rust 构建** — 比基于 JS 的 ESLint 快 10-20 倍，对于多入口 Rsbuild 构建至关重要
- **原生 TypeScript/TSX 支持** — 无需额外的解析器
- `biome check --write` 一次运行完成代码检查和格式化
- 对 MV3 CSP 更友好 — 少一个 npm 包意味着更少的供应链风险

## 后果

### 正面影响
- `biome.json` 是唯一的配置文件——配置复杂度降低
- Pre-commit hooks 使用 `biome check --write` 替代 `eslint --fix` + `prettier --write`
- CI 运行时间显著缩短

### 负面影响
- YiVad 仍使用 ESLint + Prettier — 跨项目工具链差异被接受
- Biome 的规则集是 ESLint 的子集（部分小众 ESLint 规则不在 Biome 中）
- 团队需要学习 Biome 的配置语法（与 ESLint 不同）

### 跨项目差异
YiVad 保持了 ESLint + Prettier 方案。这一差异是合理的——YiVad 的构建架构和依赖约束与 YiPet 不同。跨项目工具链统一不是目标，每个项目选择最适合其场景的工具才是。

## 适用场景

- 评估前端项目的代码检查与格式化工具选型
- Chrome 扩展项目中 CSP 对工具链选择的约束考量

## 反模式

- **为跨项目统一而强制迁移。** YiVad 用 ESLint + Prettier 运行良好，没有必要仅仅为"统一"而迁移到 Biome。工具选择应以项目实际需求为驱动，而非表面统一性