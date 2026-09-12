---
title: "code-quality: Vue 模板属性未使用 kebab-case 命名"
tags: [yivad, bug, code-quality, vue]
category: projects/yivad/bugs/code-quality
created: 2026-09-09
updated: 2026-09-10
source: YiVad
type: bug
status: closed
severity: trivial
priority: p3
project: YiVad
module: src/views/knowledge/components/RoleKnowledgePage.vue, src/views/knowledge/role.vue
reporter: Claude
environment: development
affected_version: 1.0.0
fixed_version: 1.0.0
frequency: always
---

# code-quality: Vue 模板属性未使用 kebab-case 命名

## 现象

ESLint 报 `vue/attribute-hyphenation` 错误：
```
src/views/knowledge/components/RoleKnowledgePage.vue
  56:11  error  Attribute ':filesByDir' must be hyphenated
  57:11  error  Attribute ':collapsedSections' must be hyphenated
  59:11  error  Attribute ':structuralTags' must be hyphenated
  67:11  error  Attribute ':totalCount' must be hyphenated
  75:11  error  Attribute ':totalCount' must be hyphenated

src/views/knowledge/role.vue
  4:5   error  Attribute ':domainsWord' must be hyphenated
  8:5   error  Attribute ':structuralTags' must be hyphenated
```

## 复现步骤

1. 运行 `cd YiVad && npx eslint src/`
2. 观察 `vue/attribute-hyphenation` 错误

## 预期行为

Vue 模板中属性名应使用 kebab-case（如 `:files-by-dir`），Vue 自动将其映射到组件的 camelCase prop

## 实际行为

模板中使用了 camelCase 属性名（`:filesByDir`、`:collapsedSections` 等），虽然 Vue 运行时兼容，但不符合 Vue 官方风格指南和 ESLint 规则

## 根因分析

Vue 官方风格指南要求模板中的 prop 名称使用 kebab-case。Vue 的 prop 解析机制会自动将 kebab-case 转换为 camelCase，因此 `:files-by-dir` 会正确映射到 `filesByDir` prop。

## 修复方案

**`role.vue`**: `:domainsWord` → `:domains-word`，`:structuralTags` → `:structural-tags`

**`RoleKnowledgePage.vue`**: `:filesByDir` → `:files-by-dir`，`:collapsedSections` → `:collapsed-sections`，`:structuralTags` → `:structural-tags`，`:totalCount` → `:total-count`，`@toggleSection` → `@toggle-section`

## 影响范围

- **影响模块**：src/views/knowledge/role.vue、src/views/knowledge/components/RoleKnowledgePage.vue
- **是否影响 API 契约**：否
- **是否影响其他前端项目**：否

## 验证方法

- [x] `npx eslint` 0 错误
- [x] `vue-tsc --noEmit` 通过
- [x] `pnpm test` 通过（17 文件，156 测试）

## 预防措施

| 层面 | 措施 |
|------|------|
| 代码 | 模板中始终使用 kebab-case 属性名 |
| 测试 | ESLint `vue/attribute-hyphenation` 规则已启用 |
| 流程 | CI 中 ESLint 阻断构建 |

## 经验教训

- 此类问题属于常见开发疏忽，可通过静态分析和自动化检查提前发现
- 建议将典型问题模式记录到团队知识库，避免重复踩坑
- 代码审查应重点关注此类边界情况

