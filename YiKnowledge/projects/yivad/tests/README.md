---
title: YiVad 测试用例索引
tags: [yivad, test, index]
category: projects/yivad/tests
created: 2026-10-07
updated: 2026-10-07
source: YiVad
type: index
status: stable
lifecycle: active
review_cycle: monthly
roles: [engineer]
benefit: "YiVad 前端测试用例的统一索引，按月份和模块组织"
---

# YiVad 测试用例

> 测试用例按月份 → 模块归档，与开发模块通过 `source_modules` 字段建立追溯链。

## 目录结构

```
tests/
├── README.md                  # 本文件 — 测试索引
└── 2026-09/                   # 九月测试用例
```

## 测试策略

| 层级 | 框架 | 覆盖范围 |
|------|------|---------|
| 单元测试 | Vitest + @vue/test-utils | hooks、composables、工具函数 |
| 组件测试 | Vitest + jsdom | 组件渲染、事件、插槽 |
| 类型检查 | vue-tsc --noEmit | TypeScript 类型正确性 |

## 追溯规则

| 从 | 到 | 字段 |
|----|----|------|
| Dev Module | Test | `related_tests` |
| Test | Dev Module | `source_modules` |

每个测试文件**必须**通过 `source_modules` 关联到开发模块。

## 质量门禁

| 门禁 | 状态 |
|------|------|
| vue-tsc --noEmit | 0 errors |
| Vitest 单元测试 | 41/41 |

## 相关资源

- [YiVad 开发文档](../devs/)
- [YiAi 测试用例](../../yiai/tests/)
- [测试策略](../../../../CLAUDE.md#测试策略)