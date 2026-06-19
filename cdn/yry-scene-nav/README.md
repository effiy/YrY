# YrySceneNav · Vue 3 场景层级导航组件

> 一个**零打包** (build-free) 的 Vue 3 单文件组件，按 `index.html` / `index.js` / `index.css` 三文件拆分。用于场景页 pill 风格面包屑导航，显示当前页面在场景层级中的位置。

## 文件结构

```
yry-scene-nav/
├── index.html    # 模板源 + Demo 预览页
├── index.js      # Loader: 异步 fetch 模板 → 注册组件 → 派发 ready 事件
└── index.css     # 组件样式: pill 风格 · 层级缩进 · 当前页高亮
```

## 架构

```
┌─────────────────┐
│   index.html    │ ←─── 模板源 (单一真实来源)
│  ┌───────────┐  │
│  │ <script>  │  │
│  │ template  │  │
│  │ </script> │  │
│  └───────────┘  │
└────────┬────────┘
         │ fetch
         ▼
┌─────────────────┐
│   index.js      │
│  ① fetch HTML   │
│  ② DOMParser    │
│  ③ 取 #yry-     │
│     scene-nav-  │
│     tpl 块      │
│  ④ Vue.register │
│  ⑤ dispatchEvent│
└────────┬────────┘
         │ window.YrySceneNav + 'yry-scene-nav-ready' 事件
         ▼
┌─────────────────┐
│  页面 mount 脚本 │ ←─── 监听 ready 事件后 Vue.createApp(...).mount('#scene-nav-app')
└─────────────────┘
```

## 页面使用

```html
<link rel="stylesheet" href="../../../../cdn/yry-scene-nav/index.css">
<script src="https://unpkg.com/vue@3/dist/vue.global.prod.js"></script>
<script src="../../../../cdn/yry-scene-nav/index.js"></script>
<div id="scene-nav-app"></div>
<script>
  function mount() {
    Vue.createApp(window.YrySceneNav, {
      items: [
        { label: '任务故事', href: '../README.md' },
        { label: '场景 1' }
      ]
    }).mount('#scene-nav-app');
  }
  if (window.YrySceneNav) mount();
  else document.addEventListener('yry-scene-nav-ready', mount, { once: true });
</script>
```

## Props API

| 名称 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `items` | `Array<{label, href?, icon?}>` | ✅ | 导航条目，最后一项为当前页（无 href） |

## 事件

| 事件 | 何时派发 | payload |
|------|---------|---------|
| `yry-scene-nav-ready` (document) | 模板 fetch + 注册完成后 | `{ component: 'YrySceneNav' }` |

---

> 维护者提示：本组件属于 CDN 场景 3（组件库与 JS 工具 API），是 4 个 Vue 3 组件之一。与 YryBreadcrumb 共享相同的 loader 架构（fetch + DOMParser + ready 事件）。与 YryBreadcrumb 的区别：SceneNav 是 pill 风格的层级导航，Breadcrumb 是 `/` 分隔的传统面包屑。