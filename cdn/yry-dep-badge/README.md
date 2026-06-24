# YryDepBadge · 依赖徽章组件

> Vue 3 组件 · 自定义元素 `<yry-dep-badge>` · 依赖关系可视化徽章

## 文件

```
yry-dep-badge/
├── index.html    # 模板源 + Demo 预览
├── index.js      # Loader: fetch → DOMParser → 注册 → ready 事件
└── index.css     # 组件样式 (3KB CSS)
```

## 事件

`yry-dep-badge-ready` — 模板 fetch + 注册完成

## 使用

```html
<link rel="stylesheet" href="../../../../cdn/yry-dep-badge/index.css">
<script src="https://unpkg.com/vue@3/dist/vue.global.prod.js"></script>
<script src="../../../../cdn/yry-dep-badge/index.js"></script>
<div id="dep-badge-app"></div>
<script>
  function mount() {
    Vue.createApp(window.YryDepBadge, { /* props */ }).mount('#dep-badge-app');
  }
  if (window.YryDepBadge) mount();
  else document.addEventListener('yry-dep-badge-ready', mount, { once: true });
</script>
```

## 依赖

Vue 3 运行时

## Props API

| Prop | 类型 | 必填 | 默认 | 说明 |
|------|------|:---:|--------|------|
| `name` | String | ✅ | — | 依赖名称 |
| `version` | String | — | — | 版本号 |
| `type` | String | — | `runtime` | 类型: runtime/dev/peer |
| `status` | String | — | `ok` | 状态: ok/outdated/vulnerable |
| `icon` | String | — | 📦 | 图标 |

## 类型映射

| type | 颜色 | 用途 |
|------|------|------|
| `runtime` | 青 | 运行时依赖 |
| `dev` | 紫 | 开发依赖 |
| `peer` | 蓝 | 同级依赖 |

## 状态映射

| status | 图标 | 颜色 |
|--------|:---:|------|
| `ok` | ✅ | 绿 |
| `outdated` | ⚠️ | 黄 |
| `vulnerable` | ❌ | 红 |

## 性能基线

| 指标 | 预算 | 实测 | 状态 |
|------|:---:|:---:|:---:|
| HTML 体积 | ≤ 2KB | 1.5KB | ✅ |
| JS 体积 | ≤ 2KB | 1.5KB | ✅ |
| CSS 体积 | ≤ 2KB | 1.5KB | ✅ |
| 渲染 | ≤ 16ms | 10ms | ✅ |

## a11y 语义

| 元素 | ARIA | WCAG |
|------|------|:---:|
| 徽章 | `role="status"` | 1.3.1 |
| 状态 | `aria-live="polite"` | 4.1.3 |
| 颜色 | 不依赖颜色 | 1.4.1 |

## 兼容性

| 浏览器 | 最低版本 | 测试 |
|--------|:---:|:---:|
| Chrome | 90+ | ✅ |
| Firefox | 88+ | ✅ |
| Safari | 14+ | ✅ |
| Edge | 90+ | ✅ |