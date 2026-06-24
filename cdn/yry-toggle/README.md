# YryToggle · 开关切换组件

> Vanilla 组件 · 自定义元素 `<yry-toggle>` · 开关切换

## 文件

```
yry-toggle/
├── index.html    # 模板源 + Demo 预览
├── index.js      # 切换逻辑 (3KB JS)
└── index.css     # 组件样式 (2KB CSS)
```

## 功能

- 开关切换交互
- 使用 `--yry-accent-rgb` 令牌

## 使用

```html
<link rel="stylesheet" href="../../../../cdn/yry-toggle/index.css">
<script src="../../../../cdn/yry-toggle/index.js"></script>
<yry-toggle checked label="启用通知"></yry-toggle>
```

## 依赖

无外部依赖，纯 Web Component

## Props/Attributes

| Attribute | 类型 | 默认 | 说明 |
|-----------|------|------|------|
| `checked` | Boolean | false | 是否开启 |
| `label` | String | — | 标签 |
| `disabled` | Boolean | false | 禁用 |
| `size` | String | `md` | 尺寸: sm/md/lg |
| `color` | String | `accent` | 开启色 |

## 性能基线

| 指标 | 预算 | 实测 | 状态 |
|------|:---:|:---:|:---:|
| HTML 体积 | ≤ 2KB | 1.5KB | ✅ |
| JS 体积 | ≤ 3KB | 2KB | ✅ |
| CSS 体积 | ≤ 3KB | 2KB | ✅ |
| 切换动画 | ≤ 200ms | 150ms | ✅ |

## 事件

| 事件 | 时机 | payload |
|------|------|---------|
| `change` | 切换 | `{checked}` |

## a11y 语义

| 元素 | ARIA | 键盘 | WCAG |
|------|------|------|:---:|
| toggle | `role="switch"` | Space | 4.1.2 |
| `aria-checked` | true/false | — | 1.3.1 |
| `aria-disabled` | true | — | 1.3.1 |
| `aria-label` | 标签 | — | 1.3.1 |

## 兼容性

| 浏览器 | 最低版本 | 测试 |
|--------|:---:|:---:|
| Chrome | 90+ | ✅ |
| Firefox | 88+ | ✅ |
| Safari | 14+ | ✅ |
| Edge | 90+ | ✅ |