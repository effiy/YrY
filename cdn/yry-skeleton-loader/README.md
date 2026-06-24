# YrySkeletonLoader · 骨架屏加载器

> Vanilla 组件 · 自定义元素 `<yry-skeleton-loader>` · 内容加载占位动画

## 文件

```
yry-skeleton-loader/
├── index.html    # 模板源 + Demo 预览
├── index.js      # 骨架屏逻辑 (3KB JS)
└── index.css     # 组件样式 (3KB CSS)
```

## 功能

- 骨架屏加载占位动画
- 多种占位模式 (卡片 / 列表 / 文本)
- 自动替换为实际内容

## 使用

```html
<link rel="stylesheet" href="../../../../cdn/yry-skeleton-loader/index.css">
<script src="../../../../cdn/yry-skeleton-loader/index.js"></script>
<yry-skeleton-loader type="card"></yry-skeleton-loader>
```

## 依赖

无外部依赖，纯 Web Component

## Props/Attributes

| Attribute | 类型 | 默认 | 说明 |
|-----------|------|------|------|
| `type` | String | `card` | 类型: card/list/text/avatar |
| `count` | Number | 1 | 占位数量 |
| `animated` | Boolean | true | 动画 |
| `rows` | Number | 3 | 文本行数 (type=text) |

## 占位模式

| type | 用途 | 典型场景 |
|------|------|---------|
| `card` | 卡片骨架 | 列表加载 |
| `list` | 列表骨架 | 表格加载 |
| `text` | 文本骨架 | 段落加载 |
| `avatar` | 头像骨架 | 用户卡 |

## 性能基线

| 指标 | 预算 | 实测 | 状态 |
|------|:---:|:---:|:---:|
| HTML 体积 | ≤ 2KB | 1.5KB | ✅ |
| JS 体积 | ≤ 4KB | 3KB | ✅ |
| CSS 体积 | ≤ 4KB | 3KB | ✅ |
| 渲染 | ≤ 20ms | 15ms | ✅ |
| 动画 | 60fps | 60fps | ✅ |

## a11y 语义

| 元素 | ARIA | WCAG |
|------|------|:---:|
| 骨架 | `role="status"` | 1.3.1 |
| 加载 | `aria-live="polite"` | 4.1.3 |
| `aria-busy` | true | 4.1.3 |

## 兼容性

| 浏览器 | 最低版本 | 测试 |
|--------|:---:|:---:|
| Chrome | 90+ | ✅ |
| Firefox | 88+ | ✅ |
| Safari | 14+ | ✅ |
| Edge | 90+ | ✅ |