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
| 代码 | 加强代码审查，关注此类问题模式 |
| 测试 | 增加自动化测试覆盖对应场景 |
| 流程 | 将此类问题纳入检查清单 |

## 经验教训

- 此类问题属于常见开发疏忽，可通过静态分析和自动化检查提前发现
- 建议将典型问题模式记录到团队知识库，避免重复踩坑
- 代码审查应重点关注此类边界情况

