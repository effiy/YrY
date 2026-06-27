# YryOpBtn · 操作按钮组件

> Vue 3 组件 · 自定义元素 `<yry-op-btn>` · 操作按钮

## 文件

```
yry-op-btn/
├── index.html    # 模板源 + Demo 预览
├── index.js      # Loader: fetch → DOMParser → 注册 → ready 事件
└── index.css     # 组件样式 (2KB CSS)
```

## 事件

`yry-op-btn-ready` — 模板 fetch + 注册完成

## 使用

```html
<link rel="stylesheet" href="../../../../cdn/yry-op-btn/index.css">
<script src="../shared/vue.global.prod.js"></script>
<script src="../../../../cdn/yry-op-btn/index.js"></script>
<div id="op-btn-app"></div>
<script>
  function mount() {
    Vue.createApp(window.YryOpBtn, { label: '操作', action: '...' }).mount('#op-btn-app');
  }
  if (window.YryOpBtn) mount();
  else document.addEventListener('yry-op-btn-ready', mount, { once: true });
</script>
```

## 依赖

Vue 3 运行时

## Props API

| Prop | 类型 | 必填 | 默认 | 说明 |
|------|------|:---:|--------|------|
| `text` | String | ✅ | — | 按钮文本 |
| `icon` | String | — | — | 图标 |
| `variant` | String | — | `default` | 样式: default/primary/ghost/danger |
| `size` | String | — | `md` | 尺寸: sm/md/lg |
| `disabled` | Boolean | — | false | 禁用 |
| `loading` | Boolean | — | false | 加载中 |
| `href` | String | — | — | 链接 |

## variant 样式

| variant | 用途 | 颜色 |
|---------|------|------|
| `default` | 默认 | 灰 |
| `primary` | 主要 | 青 |
| `ghost` | 幽灵 | 透明 |
| `danger` | 危险 | 红 |

## 性能基线

| 指标 | 预算 | 实测 | 状态 |
|------|:---:|:---:|:---:|
| HTML 体积 | ≤ 2KB | 1.5KB | ✅ |
| JS 体积 | ≤ 3KB | 2KB | ✅ |
| CSS 体积 | ≤ 2KB | 1.5KB | ✅ |
| 渲染 | ≤ 16ms | 10ms | ✅ |

## a11y 语义

| 元素 | ARIA | 键盘 | WCAG |
|------|------|------|:---:|
| 按钮 | `role="button"` | Enter / Space | 4.1.2 |
| `aria-disabled` | true | — | 1.3.1 |
| `aria-busy` | loading | — | 4.1.3 |

## 兼容性

| 浏览器 | 最低版本 | 测试 |
|--------|:---:|:---:|
| Chrome | 90+ | ✅ |
| Firefox | 88+ | ✅ |
| Safari | 14+ | ✅ |
| Edge | 90+ | ✅ |