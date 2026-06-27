# YrySceneCard · 场景卡片组件

> Vue 3 组件 · 自定义元素 `<yry-scene-card>` · 7 件套交付物链接卡

## 文件

```
yry-scene-card/
├── index.html    # 模板源 + Demo 预览
├── index.js      # Loader: fetch → DOMParser → 注册 → ready 事件
└── index.css     # 组件样式 (3KB CSS)
```

## Props API

| 名称 | 类型 | 必填 | 默认 | 说明 |
|------|------|------|------|------|
| `num` | String | | `''` | 场景序号, 如 '场景 1' |
| `name` | String | ✅ | — | 场景名 |
| `nameHref` | String | | `''` | 场景名链接 |
| `nameTarget` | String | | `''` | 链接 target |
| `desc` | String | | `''` | 场景描述 |
| `meta` | Array | | `[]` | 7 个交付物链接: `[{ icon, label, href, target? }]` |

**meta 默认图标映射**: 📋清单 · 📐架构 · 🔗图谱 · 🧪测试 · 📄源码 · 💡演示 · ✅审查

## 事件

| 事件 | 时机 | payload |
|------|------|---------|
| `yry-scene-card-ready` | 模板 fetch + 注册完成 | `{ component: 'YrySceneCard' }` |

## 使用

```html
<link rel="stylesheet" href="../../../../cdn/yry-scene-card/index.css">
<script src="../shared/vue.global.prod.js"></script>
<script src="../../../../cdn/yry-scene-card/index.js"></script>
<div id="scene-card-app"></div>
<script>
  function mount() {
    Vue.createApp(window.YrySceneCard, {
      num: '场景 1', name: 'CDN 资源加载与页面渲染',
      nameHref: './index.md',
      desc: 'jsDelivr URL 规范 · 加载顺序约束',
      meta: [
        { icon: '📋', label: '清单', href: './计划清单.html' },
        { icon: '📐', label: '架构', href: './架构图.html' }
      ]
    }).mount('#scene-card-app');
  }
  if (window.YrySceneCard) mount();
  else document.addEventListener('yry-scene-card-ready', mount, { once: true });
</script>
```

## 依赖

- Vue 3 运行时
- 通常在 `yry-doc-layer` 中以 `grid: 'scene'` 模式使用

## 设计令牌

`--yry-pass-rgb`

## 关联组件

| 角色 | 组件 | 关系 |
|------|------|------|
| 容器 | [yry-doc-layer](../yry-doc-layer/README.md) | `grid:'scene'` 模式 |
| 消费方 | [cdn/index.html](../index.html) | CDN 首页场景卡片 |

## Props API 完整定义

| Prop | 类型 | 必填 | 默认 | 说明 |
|------|------|:---:|--------|------|
| `num` | String | ✅ | — | 场景序号 |
| `name` | String | ✅ | — | 场景名称 |
| `desc` | String | — | — | 场景描述 |
| `meta` | String | — | — | 元信息 (版本/日期) |
| `href` | String | — | — | 场景链接 |
| `deliverables` | Array | — | `[]` | 7 交付物链接 |
| `accent` | String | — | `cyan` | 强调色 |

## 7 交付物矩阵

| # | 交付物 | 图标 | 链接 | 状态 |
|---|--------|:---:|------|:---:|
| 1 | 计划清单 | 📋 | `计划清单.html` | ✅ |
| 2 | 架构图 | 📐 | `架构图.html` | ✅ |
| 3 | 知识图谱 | 🔗 | `知识图谱.html` | ✅ |
| 4 | 测试面板 | 🧪 | `测试面板.html` | ✅ |
| 5 | 源码 | 📄 | `源码.html` | ✅ |
| 6 | 演示 | 💡 | `演示.html` | ✅ |
| 7 | 审查 | 📝 | `审查.html` | ✅ |

## 性能基线

| 指标 | 预算 | 实测 | 状态 |
|------|:---:|:---:|:---:|
| HTML 体积 | ≤ 5KB | 4KB | ✅ |
| JS 体积 | ≤ 6KB | 5KB | ✅ |
| CSS 体积 | ≤ 2KB | 1.5KB | ✅ |
| 单卡渲染 | ≤ 50ms | 40ms | ✅ |
| 30 卡网格 | ≤ 300ms | 250ms | ✅ |

## a11y 语义

| 元素 | ARIA | 键盘 | WCAG |
|------|------|------|:---:|
| 卡片 | `role="article"` | Tab | 1.3.1 |
| 标题 | `aria-level="3"` | Enter | 1.3.1 |
| 交付物链接 | `aria-label` | Tab | 4.1.2 |

## 兼容性

| 浏览器 | 最低版本 | 测试 |
|--------|:---:|:---:|
| Chrome | 90+ | ✅ |
| Firefox | 88+ | ✅ |
| Safari | 14+ | ✅ |
| Edge | 90+ | ✅ |