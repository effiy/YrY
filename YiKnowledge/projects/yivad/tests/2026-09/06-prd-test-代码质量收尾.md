---
doc_type: test
title: "11-需求-代码质量收尾 — 测试规格"
status: 已完成
priority: 高
owner: 陈铭
roles: [engineer, qa]
created: 2026-09-11
updated: 2026-09-11
project: YiVad
project_id: yivad
prd_month: "202609"
source_prds: ["06-prd-代码质量收尾"]
source_modules: []
---
# 11-需求-代码质量收尾 — 测试规格

> 来源 PRD：[06-prd-代码质量收尾.md](../../prds/2026-09/06-prd-代码质量收尾.md)
> 提取日期：2026-09-11

---

### 视觉回归测试：样式迁移

#### Scenario: DetailOverview markdown 预览
- **GIVEN** 项目有 README.md 文件
- **WHEN** 查看 DetailOverview 的 markdown 预览区
- **THEN** h1-h4、pre、code、blockquote、table、ul/ol、a、img 样式与迁移前一致

#### Scenario: DetailDocs markdown 预览
- **GIVEN** 项目有 CLAUDE.md 文件
- **WHEN** 查看 DetailDocs 的 CLAUDE.md 预览
- **THEN** markdown 样式与 DetailOverview 的预览区一致

#### Scenario: 暗色主题兼容
- **GIVEN** 切换到暗色主题
- **WHEN** 查看 markdown 预览区
- **THEN** 代码块背景色、引用边框色、表格边框色适配暗色主题

---


## 补充：单元测试用例

### UT-CQ01: 类型定义完整性

| # | 测试场景 | 输入 | 期望结果 |
|---|---------|------|---------|
| 1 | 类型导出 | `types.ts` 导出所有接口 | `vue-tsc --noEmit` 通过 |
| 2 | 循环引用检测 | `DetailTab` 引用 `Project` 引用 `DetailTab` | madge 报告无循环 |
| 3 | Props 类型匹配 | 组件 Props 与 types.ts 一致 | TS 编译 0 错误 |

### UT-CQ02: 导入路径规范化

| # | 测试场景 | 输入 | 期望结果 |
|---|---------|------|---------|
| 1 | 别名导入 | `import X from '@/views/...'` | 不使用相对路径 `../../` |
| 2 | 跨模块导入 | Bug 页面导入 Issue composable | 使用 `@/` 别名而非深层相对路径 |
| 3 | 死代码检测 | 未使用的变量/导入 | `vue-tsc --noEmit` 报 unused 警告 |

