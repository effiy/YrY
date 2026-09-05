---
title: "项目列表页: PageHeaderCard title/description 国际化内容未显示"
tags:
- i18n
- vue-template
- v-bind
- project-list
category: projects/yivad/bugs
created: "2026-09-03"
updated: "2026-09-03"
source: internal
type: bug
status: resolved
severity: minor
priority: p2
project: YiVad
module: views/project/index.vue
reporter: Claude
environment: Chrome / macOS
affectedVersion: main (pre-fix)
fixedVersion: main (post-fix 2026-09-03)
frequency: always
---

## Description

项目列表页 (`/project`) 的 `PageHeaderCard` 组件的 title 和 description 显示为原始 i18n key 字符串（如 `$t('project.list.title')`），而非翻译后的文本。搜索框的 placeholder 也有同样的问题。

## Steps to Reproduce

1. 打开项目列表页 `http://localhost:8848/#/project`
2. 查看页面顶部的标题和描述文字

## Expected Result

标题显示为 "项目"（中文）或 "Projects"（英文），描述显示对应的翻译文本。

## Actual Result

标题和描述显示为原始字符串 `$t('project.list.title')` 和 `$t('project.list.description')`。

## Cause

Vue 模板中 `PageHeaderCard` 的 `title` 和 `description` prop 以及 `el-input` 的 `placeholder` 使用了静态属性绑定（无 `:` 前缀），导致 `$t(...)` 被当作字面字符串传递，而非作为 JavaScript 表达式求值。

- `title="$t('project.list.title')"` → 传递字面字符串 `"$t('project.list.title')"`
- `:title="$t('project.list.title')"` → 求值表达式，传递翻译后的文本

## Solution

将三处静态绑定改为动态绑定（添加 `:` 前缀）：

1. `title="$t('project.list.title')"` → `:title="$t('project.list.title')"`
2. `description="$t('project.list.description')"` → `:description="$t('project.list.description')"`
3. `placeholder="$t('project.list.searchPlaceholder')"` → `:placeholder="$t('project.list.searchPlaceholder')"`