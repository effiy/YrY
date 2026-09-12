---
title: unplugin 插件版本锁定在 package.json 中可能过时
tags: [yivad, code-quality, dependencies]
category: projects/yivad/bugs/code-quality
created: 2026-09-09
updated: 2026-09-10
source: YiVad
type: bug
status: resolved
severity: trivial
priority: p3
---

# unplugin 插件版本锁定在 package.json 中可能过时

## 现象

`unplugin-auto-import` 和 `unplugin-vue-components` 的版本在 `package.json` 中可能已过时，但这些插件频繁更新以支持最新的 Element Plus 和 Vue 版本。

## 涉及文件

- `YiVad/package.json`

## 修复方案

定期运行 `pnpm update` 并检查 Element Plus resolver 的兼容性。

## 预防措施

自动导入插件版本与 Element Plus 版本有隐式依赖关系，升级时需联动检查。

## 影响范围

- **影响组件/页面**：详见描述章节
- **影响用户**：所有用户
- **是否影响 API 契约**：否
- **是否影响其他前端项目**：否（仅 YiVad）

## 经验教训

- 此类问题属于常见开发疏忽，可通过静态分析和自动化检查提前发现
- 建议将典型问题模式记录到团队知识库，避免重复踩坑
- 代码审查应重点关注此类边界情况

