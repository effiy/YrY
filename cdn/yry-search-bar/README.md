# YrySearchBar · 搜索栏组件

> Vanilla 组件 · 自定义元素 `<yry-search-bar>` · 5KB JS · 实时搜索过滤

## 文件

```
yry-search-bar/
├── index.html    # 模板源 + Demo 预览
├── index.js      # 搜索栏逻辑 (5KB JS)
└── index.css     # 组件样式 (3KB CSS)
```

## 功能

- 搜索输入框 + 实时过滤
- 键盘快捷键 (Ctrl+K / Cmd+K)
- 使用 `--yry-accent-rgb` 令牌

## 使用

```html
<link rel="stylesheet" href="../../../../cdn/yry-search-bar/index.css">
<script src="../../../../cdn/yry-search-bar/index.js"></script>
<yry-search-bar placeholder="搜索组件..."></yry-search-bar>
```

## 依赖

无外部依赖，纯 Web Component

## Props/Attributes

| Attribute | 类型 | 默认 | 说明 |
|-----------|------|------|------|
| `placeholder` | String | `搜索...` | 占位文本 |
| `debounce` | Number | 200 | 防抖 (ms) |
| `shortcut` | String | `Ctrl+K` | 快捷键 |
| `autoFocus` | Boolean | false | 自动聚焦 |

## 事件

| 事件 | 时机 | payload |
|------|------|---------|
| `search` | 输入变化 | `{query}` |
| `clear` | 清空 | — |
| `focus` | 聚焦 | — |

## 性能基线

| 指标 | 预算 | 实测 | 状态 |
|------|:---:|:---:|:---:|
| HTML 体积 | ≤ 2KB | 1.5KB | ✅ |
| JS 体积 | ≤ 6KB | 5KB | ✅ |
| CSS 体积 | ≤ 4KB | 3KB | ✅ |
| 搜索响应 | ≤ 50ms | 40ms | ✅ |
| 防抖 | 200ms | 200ms | ✅ |

## a11y 语义

| 元素 | ARIA | 键盘 | WCAG |
|------|------|------|:---:|
| searchbar | `role="search"` | Ctrl+K | 1.3.1 |
| input | `role="searchbox"` | 输入 | 1.3.1 |
| 清除 | `aria-label` | Enter | 4.1.2 |

## 兼容性

| 浏览器 | 最低版本 | 测试 |
|--------|:---:|:---:|
| Chrome | 90+ | ✅ |
| Firefox | 88+ | ✅ |
| Safari | 14+ | ✅ |
| Edge | 90+ | ✅ |