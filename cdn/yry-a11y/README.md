# YryA11y · 无障碍通用样式

> 无障碍通用样式: skip-link 键盘可达性 · `prefers-reduced-motion` 动效克制 · focus 可见指示器

## 文件

```
yry-a11y/
├── index.html    # 无障碍测试预览页
└── index.css     # 无障碍样式 (skip-link · focus · reduced-motion)
```

## 状态

⚠️ **待完善** — 缺少 JS 交互层,当前仅提供 CSS 样式

## 功能

- `.sr-only` / `:focus-visible` 键盘焦点可见性
- `prefers-reduced-motion` 媒体查询 (禁用动画)
- skip-link 样式 (跳转到主内容区)

## 加载

```html
<link rel="stylesheet" href="../../../../cdn/yry-a11y/index.css">
```

在 `shared/index.css` 之后加载,确保无障碍样式优先级最高。