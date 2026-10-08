---
title: 使用 @ts-ignore 在 auto-imports.d.ts 生成文件中
tags: [yipet, code-quality, types]
category: projects/yipet/bugs/code-quality
created: 2026-09-09
updated: 2026-09-10
source: YiPet
type: bug
status: resolved
severity: trivial
priority: p3
---

# 使用 @ts-ignore 在 auto-imports.d.ts 生成文件中

## 现象

YiVad 的 `typings/auto-imports.d.ts:93` 包含 `// @ts-ignore` 注释来抑制类型错误。这通常是自动生成工具的输出问题。

## 涉及文件

- 自动生成的类型声明文件

## 修复方案

检查 `unplugin-auto-import` 配置，确保生成正确的类型声明无需 `@ts-ignore`。


## 影响范围

**影响模块**：自动生成的 TypeScript 类型文件。
**影响用户**：`@ts-ignore` 注释绕过了类型检查，可能隐藏真实的类型不匹配问题。
**影响范围**：所有使用生成类型的 TypeScript 代码。
## 预防措施

| 层面 | 措施 | 责任人 |
|------|------|--------|
| 工具 | 自动生成的类型文件应通过代码生成工具的质量检查 | DevOps |
| 代码 | 用 `@ts-expect-error` 替代 `@ts-ignore`——当错误修复时会触发提醒 | 开发者 |
| 流程 | 定期审查 `@ts-ignore` 的使用，评估是否可以移除 | 开发者 |


## 经验教训

`@ts-ignore` 是最危险的 TypeScript 注释之一——它会静默忽略下一行的所有类型错误，包括新引入的错误。`@ts-expect-error` 是更安全的选择：当错误不再存在时，TypeScript 会提示可以移除注释。
