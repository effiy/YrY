---
title: 项目 README 中引用了 CLAUDE.md 但未在 YiVad 目录中
tags: [yivad, code-quality, documentation]
category: projects/yivad/bugs/code-quality
created: 2026-09-09
updated: 2026-09-10
source: YiVad
type: bug
status: resolved
severity: trivial
priority: p3
---

# 项目 README 中引用了 CLAUDE.md 但未在 YiVad 目录中

## 现象

CLAUDE.md 的指引部分说"先阅读项目 CLAUDE.md"，但 `YiVad/CLAUDE.md` 确实存在而引用正确。但 `YiVad/README.md` 中的部分内容与实际的 CLAUDE.md 指引不完全对应——README 描述了 Vue 2 时代的一些已废弃的模式（如 `vue-cli` 构建工具）。

## 根因分析

- README 在多次技术栈迁移后部分过时
- CLAUDE.md 及时更新但 README 未被审计

## 涉及文件

- `YiVad/README.md` — 部分过时内容

## 修复方案

审计 README 确保所有技术栈描述与实际一致（Rsbuild 而非 Webpack/Vite、Vue 3.5 而非 Vue 2）。

## 预防措施

- README 与 CLAUDE.md 应同步更新

## 影响范围

- **影响组件/页面**：详见描述章节
- **影响用户**：所有用户
- **是否影响 API 契约**：否
- **是否影响其他前端项目**：否（仅 YiVad）

## 经验教训

- 此类问题属于常见开发疏忽，可通过静态分析和自动化检查提前发现
- 建议将典型问题模式记录到团队知识库，避免重复踩坑
- 代码审查应重点关注此类边界情况

