# YryVerifyItem · 验证项组件

> Vue 3 组件 · 自定义元素 `<yry-verify-item>` · 验证项展示

## 文件

```
yry-verify-item/
├── index.html    # 模板源 + Demo 预览
├── index.js      # Loader: fetch → DOMParser → 注册 → ready 事件
└── index.css     # 组件样式 (3KB CSS)
```

## 事件

`yry-verify-item-ready` — 模板 fetch + 注册完成

## 使用

```html
<link rel="stylesheet" href="../../../../cdn/yry-verify-item/index.css">
<script src="https://unpkg.com/vue@3/dist/vue.global.prod.js"></script>
<script src="../../../../cdn/yry-verify-item/index.js"></script>
<div id="verify-item-app"></div>
<script>
  function mount() {
    Vue.createApp(window.YryVerifyItem, { label: '语法检查', status: 'pass' }).mount('#verify-item-app');
  }
  if (window.YryVerifyItem) mount();
  else document.addEventListener('yry-verify-item-ready', mount, { once: true });
</script>
```

## 依赖

Vue 3 运行时

## Props API

| Prop | 类型 | 必填 | 默认 | 说明 |
|------|------|:---:|--------|------|
| `label` | String | ✅ | — | 验证项标签 |
| `status` | String | ✅ | — | 状态: pass/warn/fail/skip |
| `detail` | String | — | — | 详细说明 |
| `evidence` | String | — | — | 证据路径 |
| `duration` | Number | — | — | 耗时 (ms) |

## 状态映射

| status | 图标 | 颜色 | 含义 |
|--------|:---:|------|------|
| `pass` | ✅ | 绿 | 通过 |
| `warn` | ⚠️ | 黄 | 警告 |
| `fail` | ❌ | 红 | 失败 |
| `skip` | ⏭️ | 灰 | 跳过 |

## 性能基线

| 指标 | 预算 | 实测 | 状态 |
|------|:---:|:---:|:---:|
| HTML 体积 | ≤ 2KB | 1.5KB | ✅ |
| JS 体积 | ≤ 3KB | 2KB | ✅ |
| CSS 体积 | ≤ 4KB | 3KB | ✅ |
| 渲染 | ≤ 20ms | 15ms | ✅ |

## a11y 语义

| 元素 | ARIA | WCAG |
|------|------|:---:|
| 验证项 | `role="status"` | 1.3.1 |
| 状态 | `aria-live="polite"` | 4.1.3 |
| 标签 | `aria-label` | 1.3.1 |

## 兼容性

| 浏览器 | 最低版本 | 测试 |
|--------|:---:|:---:|
| Chrome | 90+ | ✅ |
| Firefox | 88+ | ✅ |
| Safari | 14+ | ✅ |
| Edge | 90+ | ✅ |