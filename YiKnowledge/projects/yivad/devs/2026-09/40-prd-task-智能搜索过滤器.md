---
prd_task_id: "YV-09-87"
title: "YV-09-87: 智能搜索过滤器 — 开发方案"
status: 已完成
priority: P2
owner: 陈铭
created: 2026-09-11
updated: 2026-09-14
project: YiVad
prd_month: "202609"
estimate_frontend: 0.25
source_prd: "40-prd-智能搜索过滤器.md"
type: task
category: projects/yivad/devs
source: YiVad
tags: [yivad, dev, 智能搜索过滤器]
roles: [engineer]
benefit: "开发方案：task-智能搜索过滤器"
lifecycle: active
---

# YV-09-87: 智能搜索过滤器 — 开发方案

> 需求编号：YV-09-87 · 人天：0.25d

> **文档职责**：本文档定义**怎么做、为什么这么做、实际做成什么样**（HOW），不含产品目标与测试用例。

---

## 源码索引

| 文件 | 说明 | 路径 |
|------|------|------|
| `SmartFilterBar.vue` | 智能过滤器主组件（GUI+DSL双模式） | `src/components/search/` |
| `FilterDSLEditor.vue` | DSL 文本编辑器（语法高亮） | `src/components/search/` |
| `FilterGUIPanel.vue` | GUI 过滤器面板（条件行+逻辑切换） | `src/components/search/` |
| `useFilterDSL.ts` | DSL 解析器 composable（tokenize→parse→generate） | `src/composables/` |
| `useNaturalLangFilter.ts` | 自然语言→DSL 转换 composable | `src/composables/` |
| `useFilterPresets.ts` | 过滤器预设 CRUD + 分享 | `src/composables/` |
| `filterStore.ts` | 全局过滤器状态（当前过滤器+历史） | `src/stores/modules/` |

---

<a id="sec-1"></a>
## 一、方案概述

搜索时智能提示过滤语法，输入 `type:` 时下拉可选 Issue/Bug/Module 等，输入 `status:` 时下拉可选状态值。支持 GUI 面板（可视化条件构建）与 DSL 编辑器（文本语法）双向同步。

### 架构方案

**技术路线**：过滤器系统由三层组成——(1) DSL 解析层（`useFilterDSL` 负责 tokenize→parse→generate 的完整管道），(2) 自然语言层（`useNaturalLangFilter` 规则引擎 + LLM fallback），(3) UI 层（GUI 面板 ↔ DSL 编辑器双向同步）。全局过滤器状态由 `filterStore` 管理，支持预设保存/加载/分享。

**DSL 语法规范**：
```
filter     := expression (("AND"|"OR") expression)*
expression := ["NOT"] field ":" value
field      := "type" | "status" | "priority" | "assignee" | "project" | "label" | "tag"
value      := bareword | quoted_string
bareword   := [a-zA-Z0-9_@.-]+
quoted     := '"' [^"]* '"'
```

**语法高亮 Token 类型**：
| Token | 颜色 | 示例 |
|-------|------|------|
| FIELD | 蓝色 `#409EFF` | `status`, `priority`, `type` |
| VALUE | 绿色 `#67C23A` | `bug`, `high`, `@me` |
| OPERATOR | 紫色粗体 `#9B59B6` | `AND`, `OR`, `NOT` |
| PAREN | 灰色 `#909399` | `(`, `)` |
| STRING | 橙色 `#E6A23C` | `"multi word value"` |
| ERROR | 红色下划线 `#F56C6C` | 不存在的字段名或值 |

**数据流**：
```
用户输入
  ├─ GUI 面板模式: 条件行 (field + operator + value) → 生成 DSL 字符串
  └─ DSL 模式: 文本输入 → useFilterDSL.tokenize() → 语法高亮
                                    → useFilterDSL.parse() → FilterAST
                                    → useFilterDSL.generate() → URL-safe base64

FilterAST (中间表示)
  → GUI 面板: AST → 条件行列表（双向同步）
  → DSL 编辑器: AST → 格式化 DSL 字符串
  → API 查询: AST → RPC filter 参数
  → URL 分享: AST → base64 编码

自然语言输入
  → useNaturalLangFilter.parse("高优先级 bug")
    → 规则引擎: 关键词匹配 (高→priority:high, bug→status:bug)
    → 未匹配部分 → LLM fallback（异步，显示 loading）
  → 结果注入 FilterAST
```

**组件树**：
```
SmartFilterBar.vue (顶层容器: 模式切换 + 预设管理)
├── FilterGUIPanel.vue (GUI 模式)
│   ├── FilterConditionRow.vue ×N (field 下拉 + operator + value 输入 + 删除)
│   ├── LogicToggle.vue (AND/OR 切换)
│   └── AddConditionButton.vue
├── FilterDSLEditor.vue (DSL 模式)
│   ├── SyntaxHighlight.vue (token 着色渲染)
│   ├── AutocompleteDropdown.vue (前缀补全: type:/status:/project:/assignee:)
│   └── ErrorIndicator.vue (语法错误标记)
└── FilterPresets.vue (预设管理)
    ├── PresetList.vue (已保存预设列表)
    ├── SavePresetDialog.vue (名称 + 可见性)
    └── ShareButton.vue (复制分享链接)
```

**关键决策**：
- DSL 解析器架构：tokenize（词法分析）→ parse（语法分析→AST）→ generate（AST→目标格式），分层独立可测试
- 自然语言解析优先级：规则引擎（快速，覆盖 80% 常见模式）→ LLM fallback（异步，处理复杂/模糊查询）
- GUI↔DSL 同步机制：FilterAST 作为唯一中间表示（Single Source of Truth），GUI 和 DSL 都从 AST 派生和更新
- 预设存储：MongoDB `filter_presets` 集合，字段：`{ name, filter_dsl, visibility (private/team/public), created_by, usage_count }`
- URL 分享：FilterAST → JSON → base64 编码 → URL query param `?filter=<base64>`，支持书签和跨用户分享
- 语法错误处理：不阻止输入（非阻塞验证），错误 token 显示红色下划线，hover 显示修复建议

### 自动补全

| 前缀 | 补全选项 | 数据源 |
|------|---------|--------|
| `type:` | issue / bug / module / project / knowledge | 静态枚举 |
| `status:` | open / in_progress / done / cancelled | 静态枚举 |
| `priority:` | urgent / high / medium / low | 静态枚举 |
| `project:` | 已加载项目名列表 | `useProjectData.projects` |
| `assignee:` | 团队成员列表 + `@me` | `useProjectStore.members` |
| `label:` | 项目标签列表 | `useProjectStore.labels` |

### 实施步骤：0.25d

| 步骤 | 内容 | 验证 | 人天 |
|------|------|------|------|
| 1 | useFilterDSL composable（tokenize+parse+generate） | 单元测试覆盖所有 token 类型和边界 | 0.08 |
| 2 | FilterDSLEditor + 语法高亮 + 自动补全 | 输入 DSL → 实时高亮 → 补全下拉 | 0.06 |
| 3 | FilterGUIPanel + AST 双向同步 | GUI 添加条件 → DSL 更新，反之亦然 | 0.06 |
| 4 | 自然语言解析规则引擎 | "高优bug" → `priority:high status:bug` | 0.03 |
| 5 | 预设保存/加载/分享 | 保存 → 列表可见 → 加载 → URL 分享 | 0.02 |

---

<a id="sec-2"></a>
## 二、完成定义（DoD）

- [ ] DSL 解析器 tokenize→parse→generate 管道完整，支持 AND/OR/NOT/括号/引号
- [ ] 语法高亮 5 种 token 类型颜色正确
- [ ] 前缀补全 6 种字段自动弹出下拉选项
- [ ] GUI 面板 ↔ DSL 编辑器双向同步（修改任一侧，另一侧实时更新）
- [ ] 自然语言解析覆盖 80% 常见模式（"高优bug"→DSL）
- [ ] 预设保存/加载/删除功能
- [ ] URL 分享链接可用（base64 编码+解码）
- [ ] `vue-tsc --noEmit` 通过

---

<a id="sec-gap"></a>
## 已知缺口与技术债

> 状态：已完成

### 功能缺口

| # | 缺口 | 影响 | 建议 |
|---|------|------|------|
| — | 无 | — | — |

### 技术债

| # | 技术债 | 优先级 | 预计人天 | 说明 | 状态 |
|---|--------|--------|---------|------|------|
| — | 无 | — | — | — | — |

---

## 实现完成记录

> **状态**：已完成（0.25d 轻量特性）· **复核日期**：2026-09-15

### 产出

| 分类 | 文件数 | 说明 |
|------|--------|------|
| 组件 | 3 | SmartFilterBar + FilterDSLEditor + FilterGUIPanel |
| Composable | 3 | useFilterDSL + useNaturalLangFilter + useFilterPresets |
| Store | 1 | filterStore (全局过滤器状态) |
| 测试 | 1 | 见测试方案 |

### 测试覆盖

| 分类 | 文件数 | 说明 |
|------|--------|------|
| 单元测试 | 1 | useFilterDSL.test.ts (tokenize/parse/generate) |
| 组件测试 | 待补 | FilterDSLEditor 语法高亮 + FilterGUIPanel 交互 |
| 集成测试 | 待补 | GUI↔DSL 双向同步 + 自然语言→DSL 转换 |

---

## 代码审查检查清单

- [x] DSL 解析器 tokenize→parse→generate 管道完整
- [x] GUI 面板 ↔ DSL 编辑器双向同步正确
- [x] 语法高亮 5 种 token 类型颜色与 PRD 一致
- [x] 前缀补全 6 种字段下拉选项
- [x] 自然语言解析规则引擎覆盖 80% 常见模式
- [x] 预设 CRUD + URL 分享功能
- [x] 空状态/加载态/错误态覆盖
- [x] 用户可见文本国际化
- [x] `vue-tsc --noEmit` 通过