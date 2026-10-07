---
title: "issue/detail.vue Upload 图标未导入"
tags: [yivad, bug, import]
category: projects/yivad/bugs/code-quality
created: 2026-09-08
updated: 2026-09-10
source: YiVad
type: bug
status: resolved
severity: minor
priority: p2
project: YiVad
module: views/issue/detail.vue
benefit: "缺陷记录：质量-IssueDetail-Upload图标未导入"
lifecycle: active
---

# issue/detail.vue Upload 图标未导入

## Description

`issue/detail.vue` 模板中使用 `Upload` 图标（`:icon="Upload"`），但未从 `@element-plus/icons-vue` 导入，导致类型错误：

```
error TS2339: Property 'Upload' does not exist on type '...'
```

## Steps to Reproduce

1. 运行 `npx vue-tsc --noEmit`
2. 查看 `issue/detail.vue` 第 411 行

## Expected Result

`Upload` 图标正确导入，类型检查通过

## Actual Result

`Upload` 属性不存在，类型检查失败

## Cause

Element Plus 图标需要从 `@element-plus/icons-vue` 显式导入，`unplugin-vue-components` 不会自动导入图标。

## Solution

添加 `import { Upload } from "@element-plus/icons-vue";`

## 影响范围

- **影响组件/页面**：详见描述章节
- **影响用户**：所有用户
- **是否影响 API 契约**：否
- **是否影响其他前端项目**：否（仅 YiVad）

## 预防措施

| 层面 | 措施 |
|------|------|
| 代码 | 使用 Element Plus 图标前检查 import 语句，`unplugin-vue-components` 不自动导入图标组件 |
| 测试 | `vue-tsc --noEmit` 必须在每次提交前运行，CI 中配置为阻断项 |

## 经验教训

- **`unplugin-vue-components` 的自动导入边界**：该插件只自动导入 Element Plus 组件（如 `ElButton`），不处理图标库。`@element-plus/icons-vue` 的每个图标都需要显式 `import { Upload } from "@element-plus/icons-vue"`
- **模板中使用但未导入的变量**：Vue 模板中的 `:icon="Upload"` 引用脚本中的 `Upload` 变量，但 `vue-tsc` 的报错指向模板类型推断失败，容易误导排查方向

