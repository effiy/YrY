# YryProgressBar · 进度条组件

> Vue 3 自定义元素 `<yry-progress-bar>` · sticky 吸顶 · 玻璃质感 · 扫光动画

## 文件

```
yry-progress-bar/
├── index.html    # 模板源 (<script type="text/x-template" id="yry-progress-bar-tpl">) + Demo 预览
├── index.js      # 组件定义: 通过 vue-ce-loader 注册 CE + 自动滚动追踪
└── index.css     # 组件样式 (sticky 吸顶 + 玻璃磨砂 + 青紫渐变 + 扫光动画)
```

## 依赖

| 依赖 | 说明 |
|------|------|
| Vue 3 运行时 | `vue.global.prod.js` |
| `shared/vue-ce-loader.js` | 共享 CE 加载器 — fetch 模板 → DOMParser → defineCustomElement → ready 事件 |

## 事件

`yry-progress-bar-ready` — 模板 fetch + 自定义元素注册完成，`detail: { componentName, tagName }`

## 使用

### 模式 1: 显式任务进度 (`done` / `total`)

```html
<link rel="stylesheet" href="../cdn/yry-progress-bar/index.css">
<script src="https://unpkg.com/vue@3/dist/vue.global.prod.js"></script>
<script src="../cdn/shared/vue-ce-loader.js"></script>
<script src="../cdn/yry-progress-bar/index.js"></script>

<yry-progress-bar done="5" total="10" label="构建进度"></yry-progress-bar>
```

### 模式 2: 自动滚动追踪 (不设 `done` / `total`)

页面滚动时自动追踪 `scrollY / (scrollHeight - innerHeight)`：

```html
<yry-progress-bar></yry-progress-bar>
<!-- 自动吸附视口顶部，随滚动实时更新进度 -->
```

### 通过 Vue.createApp 挂载

```html
<div id="my-progress"></div>
<script>
function mount() {
  Vue.createApp(window.YryProgressBar, { done: 3, total: 8, label: '阶段进度' }).mount('#my-progress');
}
if (window.YryProgressBar) mount();
else document.addEventListener('yry-progress-bar-ready', mount, { once: true });
</script>
```

## Props API

| Prop | 类型 | 必填 | 默认 | 说明 |
|------|------|:---:|------|------|
| `done` | Number | — | `0` | 已完成数量。不设则启用自动滚动追踪 |
| `total` | Number | — | `0` | 总数量。`> 0` 时进度 = `done / total * 100%` |
| `label` | String | — | `"进度"` | 左侧标签文字 |

> **自动滚动追踪**: 当 `<yry-progress-bar>` 不含 `done` 和 `total` 属性时，自动监听 `scroll` + `resize`，进度 = `scrollY / (scrollHeight - innerHeight)`。

## 视觉特性

| 特性 | 描述 |
|------|------|
| 定位 | `sticky` 吸顶 (top: 0, z-index: 100) |
| 背景 | 半透明深色渐变 + `backdrop-filter: blur(14px)` 磨砂玻璃 |
| 填充 | 青紫渐变 + 内外发光 |
| 动画 | 持续扫光带 (`pb-shine` 2.6s) + 宽度过渡 0.5s |
| 完成态 | `pct >= 100` → 绿青渐变 + 暖光晕 |
| 空态 | `pct <= 0` → 无发光 |
| 动效偏好 | `prefers-reduced-motion: reduce` → 关闭过渡与发光 |

## CSS 自定义属性

| 属性 | 值 | 说明 |
|------|-----|------|
| `--yry-progress-bar-height` | `21px` | 主机总高度 (padding 6 + track 6 + padding 8 + border 1)，供下游 sticky 组件调整 `top` 偏移 |

## 兼容性

| 浏览器 | 最低版本 | 测试 |
|--------|:---:|:---:|
| Chrome | 90+ | ✅ |
| Firefox | 88+ | ✅ |
| Safari | 14+ | ✅ |
| Edge | 90+ | ✅ |
