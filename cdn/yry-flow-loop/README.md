# YryFlowLoop · 闭环数据流图

> Vue 3 组件 · 自定义元素 `<yry-flow-loop>` · 展示观察→诊断→改进→评估四段闭环数据流

## 文件

```
yry-flow-loop/
├── index.html    # 模板源 + Demo 预览
├── index.js      # Vue 3 组件 loader (异步 fetch 模板)
└── index.css     # 组件样式
```

## 功能

- 渲染四段闭环数据流图 (观察 → 诊断 → 改进 → 评估)
- 每段节点支持 `icon` / `name` / `sub` / `variant` (observe/diagnose/improve/evaluate 四色)
- 节点间箭头可自定义 (`arrowIcon` prop)
- 末尾可选回环箭头表示循环 (`loopArrow` + `loopIcon` props)
- 响应式: 640px 以下自动改为纵向布局

## 使用

```html
<link rel="stylesheet" href="../../cdn/yry-flow-loop/index.css">
<script src="../shared/vue.global.prod.js"></script>
<script src="../../cdn/yry-flow-loop/index.js"></script>
<div id="flow-app"></div>
<script>
  function mount() {
    Vue.createApp(window.YryFlowLoop, {
      stages: [
        { icon: '①', name: '观察', sub: '数据采集', variant: 'observe' },
        { icon: '②', name: '诊断', sub: 'D0-D8', variant: 'diagnose' },
        { icon: '③', name: '改进', sub: 'proposals', variant: 'improve' },
        { icon: '④', name: '评估', sub: 'E1-E4', variant: 'evaluate' }
      ]
    }).mount('#flow-app');
  }
  if (window.YryFlowLoop) mount();
  else document.addEventListener('yry-flow-loop-ready', mount, { once: true });
</script>
```

或直接使用自定义元素 (需要 Vue 3 + defineCustomElement):

```html
<yry-flow-loop stages='[{"icon":"①","name":"观察","variant":"observe"}]'></yry-flow-loop>
```

## Props

| Prop | 类型 | 默认 | 说明 |
|------|------|------|------|
| `stages` | Array | (必填) | 节点列表,每项 `{icon, name, sub?, variant}` |
| `loopArrow` | Boolean | `true` | 是否在末尾显示回环箭头 |
| `loopIcon` | String | `↻` | 回环箭头图标 |
| `arrowIcon` | String | `→` | 节点间箭头图标 |

### stage.variant 取值

| variant | 颜色 | 用途 |
|---------|------|------|
| `observe` | cyan | 观察 (数据采集) |
| `diagnose` | warn | 诊断 (D0-D8) |
| `improve` | accent | 改进 (proposals) |
| `evaluate` | pass | 评估 (E1-E4) |

## 依赖

- Vue 3 (`vue.global.prod.js`)
- 共享样式 `cdn/theme/index.css` (提供 `--yry-*` design tokens,可降级使用 fallback)
