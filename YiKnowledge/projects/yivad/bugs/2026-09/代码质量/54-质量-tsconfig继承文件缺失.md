---
title: tsconfig.json extends 了不存在的 tsconfig.base.json
tags: [yivad, code-quality, typescript-config]
category: projects/yivad/bugs/code-quality
created: 2026-09-09
updated: 2026-09-10
source: YiVad
type: bug
status: resolved
severity: minor
priority: p2
---

# tsconfig.json extends 了不存在的 tsconfig.base.json

## 现象

`YiPet/tsconfig.json` 第 2 行引用了不存在的文件：

```json
{
  "extends": "./tsconfig.base.json",
  "include": ["src/**/*.ts", "src/**/*.tsx", "src/**/*.vue"],
```

项目根目录中不存在 `tsconfig.base.json` 文件。TypeScript 编译器在 `extends` 指向不存在的文件时，根据 TypeScript 版本可能有不同行为：
- TS 5.0+ 会报错
- 某些版本静默忽略，使用默认配置

这可能导致 `tsconfig.json` 中显式声明的 `compilerOptions`（`noEmit: true`）实际生效，但缺少了基础配置的继承链。

## 根因分析

- `tsconfig.base.json` 可能在项目重构时被删除，但 extends 引用未更新
- 或意图是共享 YiVad 和 YiPet 的 tsconfig，但文件未被正确放置

## 涉及文件

- `YiPet/tsconfig.json:2` — 引用不存在的文件

## 修复方案

删除 `extends` 行，并确保 `compilerOptions` 包含必要的基础选项（`strict: true`、`target`、`module` 等已存在）。

## 预防措施

- CI 中运行 `tsc --noEmit --showConfig` 验证配置解析正确

## 影响范围

- **影响组件/页面**：详见描述章节
- **影响用户**：所有用户
- **是否影响 API 契约**：否
- **是否影响其他前端项目**：否（仅 YiVad）

## 经验教训

- 此类问题属于常见开发疏忽，可通过静态分析和自动化检查提前发现
- 建议将典型问题模式记录到团队知识库，避免重复踩坑
- 代码审查应重点关注此类边界情况

