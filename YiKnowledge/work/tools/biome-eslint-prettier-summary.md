---
title: Biome / ESLint / Prettier 对比
tags: [工具, lint, 格式化, JavaScript]
category: work/tools
created: 2026-07-31
updated: 2026-07-31
source: internal
type: summary
status: stable
---

# Biome / ESLint / Prettier 对比

## 1. 适用场景

JavaScript / TypeScript 项目的代码风格与质量工具。核心是两件事：

1. **Lint**：找代码问题（unused vars、no-eval、React hooks 规则）
2. **Format**：统一代码风格（缩进、引号、换行）

历史：Prettier + ESLint 是黄金组合；Biome（前 Rome）试图一个工具全包。

## 2. 工具对比

| 维度 | ESLint + Prettier | Biome |
|---|---|---|
| 实现语言 | JS / Rust（部分） | Rust |
| 速度 | 慢（大项目数十秒） | 极快（10x+） |
| Lint 能力 | 强，规则丰富 | 较弱，但够用 |
| Format 能力 | Prettier 业界标准 | 自研，兼容度高 |
| 配置 | 复杂（两套） | 单文件 |
| 生态 | 极广 | 成长中 |
| IDE 集成 | 成熟 | 成熟 |
| Vue / Svelte 支持 | 完整 | 部分支持 |
| 与 monorepo 兼容 | 需要配置 | 原生支持 |

## 3. ESLint + Prettier 配置要点

### 典型配置

```json
// .eslintrc.json
{
  "extends": ["eslint:recommended", "plugin:@typescript-eslint/recommended", "plugin:react/recommended", "prettier"],
  "rules": { ... }
}

// .prettierrc
{
  "semi": true,
  "singleQuote": true,
  "trailingComma": "all"
}
```

### 工作流

- `eslint --fix` 修 lint
- `prettier --write` 修 format
- `lint-staged` + `husky` 在 commit 前自动修

### 优势

- 生态最广（插件无数）
- Vue / React / Node 都有专门规则
- 与 TypeScript 类型检查联动
- 大公司标配

### 劣势

- 慢（大项目 30s+）
- 两套配置易冲突
- 配置漂移（不同项目不同）

## 4. Biome 配置要点

### 典型配置

```json
// biome.json
{
  "linter": {
    "enabled": true,
    "rules": {"recommended": true}
  },
  "formatter": {
    "enabled": true,
    "indentStyle": "space",
    "indentWidth": 2
  },
  "organizeImports": {"enabled": true}
}
```

### 工作流

- `biome check --write` 一键修 lint + format + imports
- `biome ci` CI 模式
- 与 husky 配合：commit 前跑

### 优势

- 极快（Rust 实现，单线程比 ESLint+Prettier 快 10x+）
- 单工具全包
- 配置简单
- monorepo 友好
- 适合大项目

### 劣势

- 规则不如 ESLint 丰富
- Vue / Svelte 支持较弱
- 一些 React 高级规则缺失
- 生态成长中

## 5. 选型决策

```
项目是否大量用 Vue / Svelte？
├─ 是 → ESLint + Prettier（生态支持完整）
└─ 否 → 团队是否在意 lint 速度？
        ├─ 大型项目 / monorepo → Biome（速度优势大）
        ├─ 中型项目 → 都可，Biome 简单
        └─ 团队已熟悉 ESLint → ESLint + Prettier（不折腾）
```

## 6. 迁移路径

### ESLint → Biome

1. `biome init` 生成配置
2. 用 `biome migrate eslint` 转换规则
3. 不兼容规则手动调
4. PR review 后合并
5. 保留 ESLint 几周做兼容期，然后删除

### 注意事项

- 一些规则 Biome 没有，需手动禁用或保留 ESLint
- Vue SFC 的 `<script>` lint 用 Biome 可能漏
- React 高级 hooks 规则 Biome 不完整

## 7. 性能参考

| 项目规模 | ESLint + Prettier | Biome |
|---|---|---|
| 10k 行 | 5s | 0.5s |
| 100k 行 | 30s | 3s |
| 1M 行 | 5min | 30s |

> 数值依赖硬件与配置；Biome 在大项目优势明显。

## 8. CI / Pre-commit 集成

### Pre-commit（lint-staged + husky）

```json
// package.json
"lint-staged": {
  "*.{ts,tsx,js,jsx}": ["biome check --write"]
}
```

### CI

```yaml
- name: Lint
  run: pnpm biome ci
```

## 9. 反模式

| 反模式 | 现象 | 修复 |
|---|---|---|
| 不配置 pre-commit | CI 失败多 | 加 husky |
| 全开规则 | 太严团队烦 | recommended 起步 |
| 修规则不修代码 | 历史 warning 多 | 一次性修 + pre-commit 防 |
| ESLint + Biome 并存 | 工具重复 | 选其一 |
| 不跑 TypeScript 检查 | 类型 bug | `tsc --noEmit` + lint |

## 10. 与其他工具关系

- TypeScript：`tsc --noEmit` 跑类型检查（与 lint 并行）
- Stylelint：CSS lint（与 JS lint 独立）
- Markdownlint：文档 lint
- commitlint：commit message lint

## 11. 本团队落地情况

- YiAi / YiVad：ESLint + Prettier（历史原因，迁移成本高）
- YiPet：Biome（迁移已完成，[see project_yipet_stack_migration memory]）
- 新项目默认：Biome

## 12. 参考资料

- ESLint: https://eslint.org
- Prettier: https://prettier.io
- Biome: https://biomejs.dev
