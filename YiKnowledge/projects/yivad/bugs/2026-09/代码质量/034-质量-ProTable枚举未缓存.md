---
title: ProTable 枚举数据获取结果未被缓存
tags: [yivad, code-quality, performance]
category: projects/yivad/bugs/code-quality
created: 2026-09-09
updated: 2026-09-10
source: YiVad
type: bug
status: resolved
severity: trivial
priority: p3
benefit: "缺陷记录：质量-ProTable枚举未缓存"
lifecycle: active
---

# ProTable 枚举数据获取结果未被缓存

## 现象

`components/ProTable/index.vue` 中的 `enumMap` 在每次表格挂载时通过 `provide/enject` 传递给 `TableColumn` 和 `SearchFormItem`。枚举数据通过 `ColumnProps.enum` 获取：

```typescript
// ProTable/index.vue — enumMap 每次组件挂载时重建
const enumMap = ref(new Map<string, EnumProps[]>());
```

当多个 ProTable 实例在同一页面中请求相同的枚举数据（如状态列表、优先级列表），每次都会重新发起 API 请求，无缓存复用。

## 根因分析

- 枚举数据是静态或半静态的（状态、优先级等字典值变化很少）
- `enumMap` 的作用域是组件级别，页面销毁即丢失
- 没有全局的枚举缓存层

## 涉及文件

- `components/ProTable/index.vue` — enumMap 管理
- `components/ProTable/components/TableColumn.vue` — 枚举消费
- `components/SearchForm/components/SearchFormItem.vue` — 枚举消费

## 修复方案

1. 将枚举缓存提升到 Pinia Store（如 `useDictStore`）
2. 同一 `url` + `params` 的枚举请求在 Store 中缓存 5 分钟
3. `enumMap` 优先从 Store 读取，Store 未命中时才发起 API 请求
4. 跨组件共享枚举缓存，减少重复请求

## 预防措施

- 所有字典/枚举类 API 调用应默认缓存

## 影响范围

- **影响组件/页面**：详见描述章节
- **影响用户**：所有用户
- **是否影响 API 契约**：否
- **是否影响其他前端项目**：否（仅 YiVad）

## 经验教训

- **字典数据是天然的缓存候选**：状态、优先级、类型等枚举值变化频率极低（以天/周计），但每个 ProTable 实例挂载时都会重新请求。全局枚举缓存（Pinia dictStore + 5 分钟 TTL）可消除 90% 以上的重复枚举请求
- **组件级作用域 vs 应用级单例**：`enumMap` 放在 ProTable 组件内部意味着缓存生命周期绑定组件实例。提升到 Store 后，同一页面的多个 ProTable 共享缓存，页面切换也不丢失

