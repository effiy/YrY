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
| 代码 | 加强代码审查，关注此类问题模式 |
| 测试 | 增加自动化测试覆盖对应场景 |
| 流程 | 将此类问题纳入检查清单 |

## 经验教训

- 此类问题属于常见开发疏忽，可通过静态分析和自动化检查提前发现
- 建议将典型问题模式记录到团队知识库，避免重复踩坑
- 代码审查应重点关注此类边界情况

