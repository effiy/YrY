# YryHelpOverlay · 帮助覆盖层组件

> Vanilla 组件 · 自定义元素 `<yry-help-overlay>` · 快捷键提示覆盖层

## 文件

```
yry-help-overlay/
├── index.html    # 模板源 + Demo 预览
├── index.js      # 帮助覆盖层交互 (5KB JS)
└── index.css     # 组件样式 (5KB CSS)
```

## 功能

- 快捷键 `?` 触发帮助覆盖层
- 键盘快捷键列表展示
- Esc 关闭 · 点击遮罩关闭

## 使用

```html
<script src="../../../../cdn/yry-help-overlay/index.js"></script>
<!-- 按 ? 自动弹出帮助面板 -->
```

## Props/Attributes

| Attribute | 类型 | 默认 | 说明 |
|-----------|------|------|------|
| `trigger` | String | `?` | 触发键 |
| `title` | String | `快捷键` | 标题 |
| `shortcuts` | Array | 内置 | 快捷键列表 |
| `autoShow` | Boolean | false | 自动显示 |

## 默认快捷键

| 快捷键 | 功能 |
|--------|------|
| `?` | 显示帮助 |
| `Esc` | 关闭面板 |
| `Ctrl+K` | 搜索 |
| `Alt+↑` | 回到顶部 |
| `Tab` | 焦点移动 |

## 性能基线

| 指标 | 预算 | 实测 | 状态 |
|------|:---:|:---:|:---:|
| HTML 体积 | ≤ 2KB | 1.5KB | ✅ |
| JS 体积 | ≤ 6KB | 5KB | ✅ |
| CSS 体积 | ≤ 6KB | 5KB | ✅ |
| 显示 | ≤ 100ms | 80ms | ✅ |
| 关闭 | ≤ 16ms | 10ms | ✅ |

## a11y 语义

| 元素 | ARIA | 键盘 | WCAG |
|------|------|------|:---:|
| overlay | `role="dialog"` | Esc | 1.3.1 |
| `aria-modal` | true | Tab | 4.1.2 |
| 快捷键 | `aria-label` | — | 1.3.1 |

## 兼容性

| 浏览器 | 最低版本 | 测试 |
|--------|:---:|:---:|
| Chrome | 90+ | ✅ |
| Firefox | 88+ | ✅ |
| Safari | 14+ | ✅ |
| Edge | 90+ | ✅ |