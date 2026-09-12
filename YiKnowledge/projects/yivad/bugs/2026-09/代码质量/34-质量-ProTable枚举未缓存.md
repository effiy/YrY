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

- 此类问题属于常见开发疏忽，可通过静态分析和自动化检查提前发现
- 建议将典型问题模式记录到团队知识库，避免重复踩坑
- 代码审查应重点关注此类边界情况

