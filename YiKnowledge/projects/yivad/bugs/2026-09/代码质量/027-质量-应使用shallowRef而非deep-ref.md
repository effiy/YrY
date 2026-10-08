---
title: 数据列表和图表配置使用深响应 ref() 而非 shallowRef()
tags: [yivad, code-quality, performance]
category: projects/yivad/bugs/code-quality
created: 2026-09-09
updated: 2026-09-10
source: YiVad
type: bug
status: resolved
severity: trivial
priority: p3
benefit: "缺陷记录：质量-应使用shallowRef而非deep-ref"
lifecycle: active
---

# 数据列表和图表配置使用深响应 ref() 而非 shallowRef()

## 现象

YiVad 代码库中仅 1 处使用 `shallowRef()`（`WangEditor/index.vue` 的编辑器实例）。其余所有响应式数据均使用 `ref()`，包括：

- **ProTable 表格数据 `ref([])`** — 每次分页加载数百条记录时触发深度响应式追踪
- **ECharts 配置 `ref({})`** — 大型图表配置对象被递归代理
- **知识库文件树 `ref([])`** — 数千个节点被全部转为响应式
- **Store 中的列表数据** — `reactive<T>()` 对整个状态树做深响应

Vue 3 的 `ref()` 默认执行深度响应式转换（`deep: true`），对于大型纯数据对象（只整体替换、不局部修改），这是不必要的开销。

## 根因分析

- 开发者习惯使用 `ref()` 而不评估是否需要深度响应
- 表格数据通常整体替换（`data.value = newRows`），不需要逐行追踪
- 没有团队级的 Vue 3 性能优化指南

## 涉及文件

- `views/*/index.vue` — 表格数据 ref
- `components/ProTable/` — TableColumn 数据
- `stores/modules/*` — 使用 `reactive()` 的大对象
- `views/dashboard/knowledgeBase/` — 大列表 + 图表配置

## 修复方案

1. 对表格数据、图表配置、大列表使用 `shallowRef()`
2. 仅在需要局部修改追踪的地方使用 `ref()`（如表单输入）
3. 使用 `triggerRef(tableData)` 在整体替换后手动触发更新
4. 编写性能指南记录选择标准

## 预防措施

- 超过 100 个元素的数据集合优先考虑 `shallowRef`

## 影响范围

- **影响组件/页面**：详见描述章节
- **影响用户**：所有用户
- **是否影响 API 契约**：否
- **是否影响其他前端项目**：否（仅 YiVad）

## 经验教训

- **`ref()` 的默认深度响应是有代价的**：对于「整体替换」模式的数据（表格列表 `data.value = newRows`、图表配置 `option.value = {...}`），深度代理产生的 Proxy 开销是纯粹浪费。`shallowRef()` + 整体替换或 `.value =` 重新赋值是更优选择
- **大规模列表的性能差异**：知识库文件树数千个节点全部被 `ref()` 深度代理，即使这些节点只是展示数据、永不被局部修改。在数据量大且只读的场景下，`shallowRef` 可显著降低内存和初始化开销

