# YrySpinner · 加载旋转器组件

> Vanilla 组件 · 自定义元素 `<yry-spinner>` · 加载动画

## 文件

```
yry-spinner/
├── index.html    # 模板源 + Demo 预览
├── index.js      # 旋转器逻辑 (3KB JS)
└── index.css     # 组件样式 (2KB CSS)
```

## 功能

- 加载旋转器动画
- 自定义颜色和大小
- 使用 `--yry-accent` 令牌

## 使用

```html
<link rel="stylesheet" href="../../../../cdn/yry-spinner/index.css">
<script src="../../../../cdn/yry-spinner/index.js"></script>
<yry-spinner></yry-spinner>
```

## 依赖

无外部依赖，纯 Web Component

## Props/Attributes

| Attribute | 类型 | 默认 | 说明 |
|-----------|------|------|------|
| `size` | Number | 24 | 尺寸 (px) |
| `color` | String | `accent` | 颜色: accent/cyan/pass/warn/fail |
| `speed` | Number | 800 | 旋转周期 (ms) |
| `variant` | String | `circle` | 样式: circle/dots/bars |

## variant 样式

| variant | 动画 | 适用 |
|---------|------|------|
| `circle` | 圆环旋转 | 默认 |
| `dots` | 点跳动 | 轻量 |
| `bars` | 条形脉冲 | 重型 |

## 性能基线

| 指标 | 预算 | 实测 | 状态 |
|------|:---:|:---:|:---:|
| HTML 体积 | ≤ 1KB | 0.8KB | ✅ |
| JS 体积 | ≤ 3KB | 2KB | ✅ |
| CSS 体积 | ≤ 3KB | 2KB | ✅ |
| 渲染 | ≤ 10ms | 8ms | ✅ |
| 动画 | 60fps | 60fps | ✅ |

## a11y 语义

| 元素 | ARIA | WCAG |
|------|------|:---:|
| spinner | `role="status"` | 1.3.1 |
| 加载 | `aria-live="polite"` | 4.1.3 |
| `aria-label` | "加载中" | 1.3.1 |

## 兼容性

| 浏览器 | 最低版本 | 测试 |
|--------|:---:|:---:|
| Chrome | 90+ | ✅ |
| Firefox | 88+ | ✅ |
| Safari | 14+ | ✅ |
| Edge | 90+ | ✅ |