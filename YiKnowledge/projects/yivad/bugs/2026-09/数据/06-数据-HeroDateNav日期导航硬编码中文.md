---
title: "HeroDateNav: 日期导航「今天」按钮和清除提示为硬编码中文"
key: hero-date-nav-i18n-hardcoded-20260907
tags:
- i18n
- hardcoded-string
- date-nav
category: projects/yivad/bugs/data
created: "2026-09-07"
updated: 2026-09-10
source: internal
type: bug
status: resolved
severity: minor
priority: p2
project: YiVad
module: components/HeroDateNav/HeroDateNav.vue
reporter: Claude
environment: Chrome / macOS
affectedVersion: main (pre-fix)
fixedVersion: main (post-fix 2026-09-07)
frequency: always
---

## Description

`HeroDateNav.vue` 组件中「今天」按钮文字和清除按钮的 `title` 属性为硬编码中文，未使用 i18n。i18n 文件中已有 `dateFilter.today` 键，但组件未使用；`dateFilter.clear` 键缺失。

- 按钮文字 `今天` → 应为 `{{ t("dateFilter.today") }}`
- title 属性 `title="清除日期筛选"` → 应为 `:title="$t('dateFilter.clear')"`

## Steps to Reproduce

1. 切换语言为英文
2. 访问 `http://localhost:8848/#/project/yivad`
3. 选择一个日期筛选
4. 「今天」按钮和清除按钮的 tooltip 仍显示中文

## Root Cause

`HeroDateNav.vue` 未导入 `useI18n`，文本直接硬编码为中文。`dateFilter.clear` 键在 i18n 文件中不存在。

## Fix

1. 在 `HeroDateNav.vue` 中添加 `useI18n` 导入
2. 将 `今天` 改为 `{{ t("dateFilter.today") }}`
3. 将 `title="清除日期筛选"` 改为 `:title="$t('dateFilter.clear')"`
4. 在 `zh.ts` 中添加 `clear: "清除日期筛选"`
5. 在 `en.ts` 中添加 `clear: "Clear date filter"`

## Verification

- `vue-tsc --noEmit` 通过
- 中文环境显示 "今天" / "清除日期筛选"
- 英文环境显示 "Today" / "Clear date filter"

## 影响范围

- **影响组件/页面**：详见描述章节
- **影响用户**：所有用户
- **是否影响 API 契约**：否
- **是否影响其他前端项目**：否（仅 YiVad）

## 预防措施

| 层面 | 措施 |
|------|------|
| 代码 | 加强代码审查，关注此类问题模式 |
| 测试 | 增加自动化测试覆盖对应场景 |
| 流程 | 将此类问题纳入检查清单 |

## 经验教训

- 此类问题属于常见开发疏忽，可通过静态分析和自动化检查提前发现
- 建议将典型问题模式记录到团队知识库，避免重复踩坑
- 代码审查应重点关注此类边界情况

