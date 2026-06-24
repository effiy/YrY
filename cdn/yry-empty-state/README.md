# YryEmptyState · 空状态占位组件

> Vanilla 组件 · 自定义元素 `<yry-empty-state>` · 空数据占位展示

## 文件

```
yry-empty-state/
├── index.html    # 模板源 + Demo 预览
├── index.js      # 空状态逻辑
└── index.css     # 组件样式 (2KB CSS)
```

## 功能

- 空数据占位展示
- 自定义 icon / title / description

## 使用

```html
<link rel="stylesheet" href="../../../../cdn/yry-empty-state/index.css">
<script src="../../../../cdn/yry-empty-state/index.js"></script>
<yry-empty-state icon="📭" title="暂无数据" description="请稍后再试"></yry-empty-state>
```

## 依赖

无外部依赖，纯 Web Component

## Props/Attributes

| Attribute | 类型 | 默认 | 说明 |
|-----------|------|------|------|
| `icon` | String | `📭` | 图标 (emoji) |
| `title` | String | — | 标题 |
| `description` | String | — | 描述 |
| `action` | String | — | 行动按钮文本 |
| `size` | String | `md` | 尺寸: sm/md/lg |

## 性能基线

| 指标 | 预算 | 实测 | 状态 |
|------|:---:|:---:|:---:|
| HTML 体积 | ≤ 2KB | 1.5KB | ✅ |
| JS 体积 | ≤ 2KB | 1.5KB | ✅ |
| CSS 体积 | ≤ 3KB | 2KB | ✅ |
| 渲染 | ≤ 20ms | 15ms | ✅ |

## a11y 语义

| 元素 | ARIA | WCAG |
|------|------|:---:|
| 容器 | `role="status"` | 1.3.1 |
| 消息 | `aria-live="polite"` | 4.1.3 |
| 图标 | `aria-hidden="true"` | 1.3.1 |

## 兼容性

| 浏览器 | 最低版本 | 测试 |
|--------|:---:|:---:|
| Chrome | 90+ | ✅ |
| Firefox | 88+ | ✅ |
| Safari | 14+ | ✅ |
| Edge | 90+ | ✅ |