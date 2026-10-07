---
title: "complexProTable 点击行遗留 console.log(row) 调试代码"
tags: [yivad, code-quality, debug-logging]
category: projects/yivad/bugs/code-quality
created: 2026-09-10
updated: 2026-09-10
source: YiVad
type: bug
status: resolved
severity: trivial
priority: p3
project: YiVad
module: src/views/proTable/complexProTable/index.vue
reporter: Claude
environment: development
affected_version: 1.0.0
fixed_version: 1.0.0
frequency: always
benefit: "缺陷记录：质量-proTable-console-log"
lifecycle: active
---

# complexProTable 点击行遗留 console.log(row) 调试代码

## 现象

`src/views/proTable/complexProTable/index.vue:149` 行点击处理函数中遗留 `console.log(row)` 调试语句：

```typescript
const rowClick = (row: User.ResUserList, column: TableColumnCtx<User.ResUserList>) => {
  if (column.property == "radio" || column.property == "operation") return;
  console.log(row);
  ElMessage.success("当前行被点击了！");
};
```

## 根因分析

开发调试时添加的 `console.log` 未被移除，随代码提交到了仓库。

## 修复方案

删除 `console.log(row)` 行。

## 影响范围

- **影响模块**：src/views/proTable/complexProTable/index.vue（删除 1 行）
- **是否影响 API 契约**：否
- **是否影响其他项目**：否

## 验证方法

- [x] `vue-tsc --noEmit` 通过
- [x] 代码审查确认删除

## 预防措施

| 层面 | 措施 |
|------|------|
| 代码 | ESLint `no-console` 规则设为 warn，CI 中阻止 `console.log` 进入生产分支 |
| 流程 | pre-commit hook 中检测新增的 `console.log` 并提示移除 |

## 经验教训

- **`console.log` 是最常见的调试残留**：开发时添加、调试完忘记移除。ESLint `no-console` 规则 + pre-commit hook 可以自动化拦截。一行 `console.log(row)` 虽然无害，但在生产环境的浏览器控制台中输出用户数据是隐私风险

