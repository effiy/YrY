---
title: vitest 配置中 resolve.alias 与 rsbuild 不完全一致
tags: [yivad, code-quality, testing]
category: projects/yivad/bugs/code-quality
created: 2026-09-09
updated: 2026-09-10
source: YiVad
type: bug
status: resolved
severity: trivial
priority: p3
---

# vitest 配置中 resolve.alias 与 rsbuild 不完全一致

## 现象

`vitest.config.ts` 中的 `resolve.alias` 手动维护了与 `rsbuild.config.ts` 相同的别名映射，但有覆盖不完整的风险：

```typescript
// vitest.config.ts — 手动维护别名
resolve: {
  alias: {
    "@": resolve(rootDir, "src"),
    "@yivad/views-glob": resolve(rootDir, "tests/mocks/viewsGlob.ts"),
  }
}
```

如果 `rsbuild.config.ts` 添加了新别名（如 `@components`、`@hooks`），而 vitest 配置未同步更新，测试中导入这些别名会失败。

## 根因分析

- 别名在三处维护：rsbuild、tsconfig paths、vitest resolve.alias
- 缺少共享的基础别名配置

## 涉及文件

- `vitest.config.ts` — 别名配置
- `rsbuild.config.ts` — 别名配置
- `tsconfig.json` — paths 配置

## 修复方案

从 `tsconfig.json` 的 `compilerOptions.paths` 读取别名，vitest 通过 `vite-tsconfig-paths` 插件自动解析。

## 预防措施

- 别名配置应在单一源（tsconfig paths）定义，rsbuild 和 vitest 从中派生

## 影响范围

- **影响组件/页面**：详见描述章节
- **影响用户**：所有用户
- **是否影响 API 契约**：否
- **是否影响其他前端项目**：否（仅 YiVad）

## 经验教训

- 此类问题属于常见开发疏忽，可通过静态分析和自动化检查提前发现
- 建议将典型问题模式记录到团队知识库，避免重复踩坑
- 代码审查应重点关注此类边界情况

