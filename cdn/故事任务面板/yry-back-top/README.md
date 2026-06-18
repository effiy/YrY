# YryBackTop · 回到顶部按钮

> 一个**零配置** (zero-config) 的 vanilla JS 组件，`<script>` 加载后自动创建按钮并绑定 scroll/click 事件，无需写任何 HTML 或 JS。

## 文件结构

```
yry-back-top/
├── index.html    # 模板源 + Demo 预览页
├── index.js      # 自初始化: 创建按钮 → 绑定 scroll → 绑定 click
└── index.css     # 组件样式: 固定定位 · 圆形按钮 · 渐入动画
```

## 架构

```
┌─────────────────┐
│   index.js      │
│  ① 创建 <button> │
│  ② 注入 body     │
│  ③ scroll > 400  │ ←─── 显示按钮
│  ④ click →       │
│     scrollTo top │
└─────────────────┘
         │
         ▼
┌─────────────────┐
│  页面 mount      │ ←─── 零配置，加载即生效
└─────────────────┘
```

## 页面使用

```html
<link rel="stylesheet" href="../../../../cdn/yry-back-top/index.css">
<script src="../../../../cdn/yry-back-top/index.js"></script>
```

仅需 2 行引用，无需写任何 HTML 或 JS。脚本加载后自动创建 `<button class="back-top">` 并注入到 `<body>`。

## 行为

| 行为 | 触发 | 详情 |
|------|------|------|
| 显示按钮 | `scrollY > 400px` | 添加 `.visible` 类，`opacity: 1` + `translateY(0)` |
| 隐藏按钮 | `scrollY ≤ 400px` | 移除 `.visible` 类，`opacity: 0` + `translateY(10px)` |
| 回到顶部 | 点击按钮 | `window.scrollTo({ top: 0, behavior: 'smooth' })` |
| 键盘快捷键 | `Alt+↑` | 同样触发平滑滚动到顶部 |

## 样式令牌 (index.css)

| class | 用途 | 关键值 |
|-------|------|--------|
| `.back-top` | 固定定位按钮 | `position: fixed; bottom: 24px; right: 24px; z-index: 999` |
| `.back-top.visible` | 显示状态 | `opacity: 1; transform: translateY(0)` |
| `.back-top:hover` | 悬停效果 | 背景色变亮，轻微缩放 |

---

> 维护者提示：本组件属于 CDN 场景 3（组件库与 JS 工具 API），是 4 个 Vue 3/vanilla 组件之一。修改后请确认 `index.html` Demo 页正常渲染。