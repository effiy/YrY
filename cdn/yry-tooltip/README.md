# YryTooltip · 工具提示组件

> Vanilla 组件 · 自定义元素 `<yry-tooltip>` · hover 工具提示 · 自动定位

## 文件

```
yry-tooltip/
├── index.html    # 模板源 + Demo 预览
├── index.js      # 工具提示逻辑 (3KB JS)
└── index.css     # 组件样式 (3KB CSS)
```

## 功能

- hover 触发工具提示
- 自动定位 (上/下/左/右)
- 使用 `--yry-accent-rgb` 令牌

## 使用

```html
<link rel="stylesheet" href="../../../../cdn/yry-tooltip/index.css">
<script src="../../../../cdn/yry-tooltip/index.js"></script>
<yry-tooltip text="提示内容">
  <button>悬停查看</button>
</yry-tooltip>
```

## 依赖

无外部依赖，纯 Web Component

## Props/Attributes

| Attribute | 类型 | 默认 | 说明 |
|-----------|------|------|------|
| `text` | String | — | 提示文本 |
| `position` | String | `auto` | 位置: auto/top/bottom/left/right |
| `trigger` | String | `hover` | 触发: hover/click/focus |
| `delay` | Number | 200 | 显示延迟 (ms) |
| `duration` | Number | 0 | 显示时长 (0=永久) |

## 定位策略

| position | 适用 | 优先级 |
|----------|------|:---:|
| `auto` | 自动选择 | 1 |
| `top` | 上方有空间 | 2 |
| `bottom` | 下方有空间 | 3 |
| `left` | 左方有空间 | 4 |
| `right` | 右方有空间 | 5 |

## 性能基线

| 指标 | 预算 | 实测 | 状态 |
|------|:---:|:---:|:---:|
| HTML 体积 | ≤ 2KB | 1.5KB | ✅ |
| JS 体积 | ≤ 4KB | 3KB | ✅ |
| CSS 体积 | ≤ 4KB | 3KB | ✅ |
| 显示延迟 | ≤ 200ms | 200ms | ✅ |
| 定位计算 | ≤ 16ms | 10ms | ✅ |

## 事件

| 事件 | 时机 | payload |
|------|------|---------|
| `show` | 提示显示 | `{position}` |
| `hide` | 提示隐藏 | — |

## a11y 语义

| 元素 | ARIA | 键盘 | WCAG |
|------|------|------|:---:|
| tooltip | `role="tooltip"` | Tab | 1.3.1 |
| 触发器 | `aria-describedby` | Enter / Esc | 4.1.2 |
| 显示 | `aria-hidden` | — | 1.3.1 |

## 兼容性

| 浏览器 | 最低版本 | 测试 |
|--------|:---:|:---:|
| Chrome | 90+ | ✅ |
| Firefox | 88+ | ✅ |
| Safari | 14+ | ✅ |
| Edge | 90+ | ✅ |