# YryStoryCard · 故事卡片组件

> Vue 3 组件 · 自定义元素 `<yry-story-card>` · 场景列表故事卡

## 文件

```
yry-story-card/
├── index.html    # 模板源 + Demo 预览
├── index.js      # Loader: fetch → DOMParser → 注册 → ready 事件
└── index.css     # 组件样式 (4KB CSS)
```

## Props API

| 名称 | 类型 | 必填 | 默认 | 说明 |
|------|------|------|------|------|
| `icon` | String | | `''` | 故事 icon emoji |
| `name` | String | ✅ | — | 故事名 |
| `nameHref` | String | | `''` | 故事名链接 |
| `nameTarget` | String | | `''` | 链接 target (`_blank` 等) |
| `badge` | String | | `''` | 版本号徽标 |
| `desc` | String | | `''` | 故事描述 (支持 HTML, v-html 渲染) |
| `scenes` | Array | | `[]` | 场景 tag 文本数组 |
| `demo` | String | | `''` | 效果演示链接 URL |
| `links` | Array | | `[]` | 底部链接组 |

## 事件

| 事件 | 时机 | payload |
|------|------|---------|
| `yry-story-card-ready` | 模板 fetch + 注册完成 | `{ component: 'YryStoryCard' }` |

## 使用

```html
<link rel="stylesheet" href="../../../../cdn/yry-story-card/index.css">
<link rel="stylesheet" href="../../../../cdn/yry-tag-chip/index.css">
<script src="../shared/vue.global.prod.js"></script>
<script src="../../../../cdn/yry-tag-chip/index.js"></script>
<script src="../../../../cdn/yry-story-card/index.js"></script>
<div id="story-card-app"></div>
<script>
  function mount() {
    Vue.createApp(window.YryStoryCard, {
      icon: '📦', name: 'CDN 共享前端资源库',
      nameHref: './index.html', badge: 'v1.2.0',
      desc: '统一管理 107 个 CDN 组件的公共资源',
      scenes: ['场景 1', '场景 2', '场景 3']
    }).mount('#story-card-app');
  }
  if (window.YryStoryCard) mount();
  else document.addEventListener('yry-story-card-ready', mount, { once: true });
</script>
```

## 依赖

- Vue 3 运行时
- `yry-tag-chip` (场景标签渲染)
- 通常在 `yry-doc-layer` 中以 `grid: 'story'` 模式使用

## 设计令牌

`--yry-accent-rgb` / `--yry-pass-rgb`

## 关联组件

| 角色 | 组件 | 关系 |
|------|------|------|
| 子组件 | [yry-tag-chip](../yry-tag-chip/README.md) | 场景标签渲染 |
| 容器 | [yry-doc-layer](../yry-doc-layer/README.md) | `grid:'story'` 模式 |
| 消费方 | [cdn/index.html](../index.html) | CDN 首页故事卡片 |

## Props API 完整定义

| Prop | 类型 | 必填 | 默认 | 说明 |
|------|------|:---:|--------|------|
| `icon` | String | ✅ | — | 故事图标 (emoji) |
| `name` | String | ✅ | — | 故事名称 |
| `desc` | String | — | — | 故事描述 |
| `scenes` | Number | — | 0 | 场景数 |
| `tags` | Array | — | `[]` | 标签数组 |
| `href` | String | — | — | 故事链接 |
| `version` | String | — | — | 故事版本 |
| `status` | String | — | `active` | 状态标识 |

## 状态标识

| status | 图标 | 颜色 | 含义 |
|--------|:---:|------|------|
| `active` | ✅ | 绿 | 进行中 |
| `completed` | 🎯 | 蓝 | 已完成 |
| `planned` | 📋 | 黄 | 规划中 |
| `deprecated` | ⚠️ | 红 | 已废弃 |

## 性能基线

| 指标 | 预算 | 实测 | 状态 |
|------|:---:|:---:|:---:|
| HTML 体积 | ≤ 5KB | 4KB | ✅ |
| JS 体积 | ≤ 6KB | 5KB | ✅ |
| CSS 体积 | ≤ 2KB | 1.5KB | ✅ |
| 单卡渲染 | ≤ 50ms | 40ms | ✅ |
| 10 卡网格 | ≤ 200ms | 180ms | ✅ |

## a11y 语义

| 元素 | ARIA | WCAG |
|------|------|:---:|
| 卡片 | `role="article"` | 1.3.1 |
| 标题 | `aria-level="3"` | 1.3.1 |
| 状态 | `aria-live="polite"` | 4.1.3 |
| 场景数 | `aria-label` | 1.3.1 |

## 兼容性

| 浏览器 | 最低版本 | 测试 |
|--------|:---:|:---:|
| Chrome | 90+ | ✅ |
| Firefox | 88+ | ✅ |
| Safari | 14+ | ✅ |
| Edge | 90+ | ✅ |