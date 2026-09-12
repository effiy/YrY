---
title: 缺少 TypeScript isolatedModules 检查
tags: [yivad, code-quality, typescript]
category: projects/yivad/bugs/code-quality
created: 2026-09-09
updated: 2026-09-10
source: YiVad
type: bug
status: resolved
severity: trivial
priority: p3
---

# 缺少 TypeScript isolatedModules 检查

## 现象

`tsconfig.json` 中 `isolatedModules: true` 未启用。Rsbuild 使用 esbuild/swc 进行转译（每个文件独立编译），`isolatedModules` 可确保 TypeScript 代码在独立编译时不会出错（如 const enum 导出、类型重导出）。

## 涉及文件

- `YiVad/tsconfig.json`

## 修复方案

```json
"compilerOptions": { "isolatedModules": true }
```

## 预防措施

使用非 tsc 编译器（esbuild/swc/babel）时必须启用 isolatedModules。

## 影响范围

- **影响组件/页面**：详见描述章节
- **影响用户**：所有用户
- **是否影响 API 契约**：否
- **是否影响其他前端项目**：否（仅 YiVad）

## 经验教训

- 此类问题属于常见开发疏忽，可通过静态分析和自动化检查提前发现
- 建议将典型问题模式记录到团队知识库，避免重复踩坑
- 代码审查应重点关注此类边界情况

