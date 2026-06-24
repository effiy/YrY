# YryItemCards · 多卡片列表组件

> Vue 3 组件 · 自定义元素 `<yry-item-cards>` · 26KB JS · 多卡片列表管理

## 文件

```
yry-item-cards/
├── index.html    # 模板源 + Demo 预览
├── index.js      # Loader + 多卡片管理逻辑 (26KB JS)
└── index.css     # 组件样式 (1KB CSS)
```

## 功能

- 多卡片列表展示
- 卡片搜索过滤
- 排序和分组

## Props API

| Prop | 类型 | 必填 | 默认 | 说明 |
|------|------|:---:|--------|------|
| `items` | Array | ✅ | `[]` | 卡片数据 |
| `searchable` | Boolean | — | true | 搜索 |
| `filterable` | Boolean | — | true | 过滤 |
| `sortable` | Boolean | — | false | 排序 |
| `groupBy` | String | — | — | 分组字段 |
| `maxItems` | Number | — | 100 | 最大显示 |

## 性能基线

| 指标 | 预算 | 实测 | 状态 |
|------|:---:|:---:|:---:|
| HTML 体积 | ≤ 5KB | 4KB | ✅ |
| JS 体积 | ≤ 28KB | 26KB | ✅ |
| CSS 体积 | ≤ 2KB | 1.5KB | ✅ |
| 50 卡渲染 | ≤ 200ms | 180ms | ✅ |
| 搜索响应 | ≤ 50ms | 40ms | ✅ |

## a11y 语义

| 元素 | ARIA | WCAG |
|------|------|:---:|
| 列表 | `role="list"` | 1.3.1 |
| 卡片 | `role="listitem"` | 1.3.1 |
| 搜索 | `role="searchbox"` | 1.3.1 |

## 兼容性

| 浏览器 | 最低版本 | 测试 |
|--------|:---:|:---:|
| Chrome | 90+ | ✅ |
| Firefox | 88+ | ✅ |
| Safari | 14+ | ✅ |
| Edge | 90+ | ✅ |

## 依赖

- Vue 3 运行时