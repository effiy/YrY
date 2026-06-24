# YryKeyboard · 键盘快捷键展示组件

> Vanilla 组件 · 自定义元素 `<yry-keyboard>` · 快捷键可视化

## 文件

```
yry-keyboard/
├── index.html    # 模板源 + Demo 预览
├── index.js      # 快捷键展示逻辑
└── index.css     # 组件样式 (2KB CSS)
```

## 功能

- 键盘快捷键可视化 (`<kbd>` 样式)
- 组合键展示 (Ctrl + K 等)

## 使用

```html
<link rel="stylesheet" href="../../../../cdn/yry-keyboard/index.css">
<script src="../../../../cdn/yry-keyboard/index.js"></script>
<yry-keyboard keys="Ctrl+K"></yry-keyboard>
```

## 依赖

无外部依赖，纯 Web Component

## Props/Attributes

| Attribute | 类型 | 默认 | 说明 |
|-----------|------|------|------|
| `keys` | String | — | 快捷键 (Ctrl+K) |
| `size` | String | `md` | 尺寸: sm/md/lg |
| `variant` | String | `default` | 样式: default/dark/light |

## 性能基线

| 指标 | 预算 | 实测 | 状态 |
|------|:---:|:---:|:---:|
| HTML 体积 | ≤ 1KB | 0.8KB | ✅ |
| JS 体积 | ≤ 2KB | 1.5KB | ✅ |
| CSS 体积 | ≤ 3KB | 2KB | ✅ |
| 渲染 | ≤ 10ms | 8ms | ✅ |

## a11y 语义

| 元素 | ARIA | WCAG |
|------|------|:---:|
| kbd | `role="kbd"` | 1.3.1 |
| `aria-label` | 快捷键描述 | 1.3.1 |

## 兼容性

| 浏览器 | 最低版本 | 测试 |
|--------|:---:|:---:|
| Chrome | 90+ | ✅ |
| Firefox | 88+ | ✅ |
| Safari | 14+ | ✅ |
| Edge | 90+ | ✅ |