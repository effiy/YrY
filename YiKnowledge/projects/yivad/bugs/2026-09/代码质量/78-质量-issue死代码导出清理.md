---
title: "issue/index.vue: 死代码清理 — useIssueExport 未被消费"
key: yivad-issue-dead-export-code-20260923
tags:
- dead-code
- bundle-size
- cleanup
category: projects/yivad/bugs/代码质量
created: "2026-09-23"
updated: 2026-09-23
source: internal
type: bug
status: resolved
severity: minor
priority: p3
project: YiVad
module: views/issue/index.vue
reporter: Claude
environment: Chrome / macOS
affectedVersion: main (pre-fix)
fixedVersion: main (2026-09-23)
frequency: always
---

## Description

`views/issue/index.vue` 导入了 `useIssueExport` composable 并解构了 `exportCSV` / `exportJSON`，但这两个函数在模板中没有任何调用点。开发者使用了 `void exportCSV; void exportJSON;` 来抑制 TypeScript/ESLint 的未使用变量警告。

## Impact

- 增加不必要的 bundle 体积（`useIssueExport` 及其依赖被打包但从未使用）
- `void` 表达式是一种代码异味，掩盖了真正的问题
- 如果未来需要导出功能，应显式添加导出按钮而非保留未连接的代码

## Steps to Reproduce

1. 查看 `src/views/issue/index.vue` 模板
2. 没有 Export 按钮或任何引用 `exportCSV`/`exportJSON` 的元素
3. 脚本中仍导入并实例化 `useIssueExport`

## Solution

移除三处死代码：

1. 删除 `import { useIssueExport } from "./composables/useIssueExport"`
2. 删除 `const { exportCSV, exportJSON } = useIssueExport(() => store.issues)`
3. 删除 `void exportCSV; void exportJSON;`

`useIssueExport.ts` 文件保留（可能在未来被其他视图使用），仅移除当前文件中未消费的导入。

## Prevention

**规则**：所有 `void` 表达式用于抑制未使用变量警告的模式，应视为代码异味——应当删除未使用的导入/解构，而非抑制警告。

**检查清单**：
- 如果 composable 返回值被 `void` 抑制 → 删除 composable 调用
- 如果需要保留功能 → 添加对应的 UI 元素（按钮/菜单项）来消费返回值