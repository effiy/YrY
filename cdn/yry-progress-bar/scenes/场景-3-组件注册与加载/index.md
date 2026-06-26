# 场景 3: 组件注册与加载

> | v5.4.0 | 2026-06-27 | 初始 | 组件: YryProgressBar |
> **导航**: [← 场景 2](../场景-2-模板与样式/index.md) · [场景 4 →](../场景-4-双模式进度追踪/index.md)
> **交付物**: [📋 清单](清单.html) · [📐 架构](架构图.html) · [🔗 图谱](知识图谱.html) · [📄 源码](源码.html) · [🧪 测试](测试面板.html) · [💡 演示](演示.html) · [📝 审查](审查.html)

[§0 概述](#sec0) · [§1 关键内容](#sec1) · [§2 实施](#sec2) · [§3 验证](#sec3) · [§4 自改进](#sec4)

<a id="sec0"></a>
## §0 概述

本场景是 **YryProgressBar** 的第 3 个场景，聚焦于 **组件注册与加载**：通过共享 `vue-ce-loader.js` 进行组件注册，`YrYVueCE.define()` 调用契约，`yry-progress-bar-ready` 事件派发，以及模板 fetch → DOMParser → defineCustomElement 的完整加载链。

### 加载链

```mermaid
%%{init: {'theme': 'base', 'themeVariables': {
  'primaryColor': '#1e1f2b', 'primaryTextColor': '#a9b1d6',
  'primaryBorderColor': '#a78bfa', 'lineColor': '#a78bfa',
  'secondaryColor': '#2b2d3b', 'tertiaryColor': '#21232f'
}}}%%
sequenceDiagram
    participant Page
    participant Loader as vue-ce-loader.js
    participant Component as index.js
    participant Vue
    participant CE as customElements

    Page->>Loader: &lt;script src&gt;
    Loader->>Loader: 注册 window.YrYVueCE
    Page->>Component: &lt;script src&gt;
    Component->>Loader: YrYVueCE.define({componentName, templateId, buildComponent})
    Loader->>Loader: fetch(index.html) → DOMParser → getElementById
    Loader->>Vue: defineCustomElement(component)
    Vue-->>Loader: Custom Element 构造器
    Loader->>CE: customElements.define('yry-progress-bar', ctor)
    Loader->>Page: dispatchEvent('yry-progress-bar-ready')
    Loader->>Page: window.YryProgressBar = component
```

<a id="sec1"></a>
## §1 关键内容

### YrYVueCE.define() 调用契约

```javascript
window.YrYVueCE.define({
  componentName: 'YryProgressBar',        // PascalCase → 自动转 'yry-progress-bar'
  templateId: 'yry-progress-bar-tpl',      // index.html 中 <script type="text/x-template" id="...">
  buildComponent: function (templateHTML) {
    return {
      name: 'YryProgressBar',
      props: {
        done: { type: Number, default: 0 },
        total: { type: Number, default: 0 },
        label: { type: String, default: '进度' }
      },
      data: function () { /* scroll state */ },
      computed: {
        pct: function () { /* done/total * 100 */ }
      },
      methods: {
        _updateScroll: function () { /* RAF scroll handler */ }
      },
      mounted: function () { /* detect mode + bind listeners */ },
      beforeUnmount: function () { /* cleanup */ },
      template: templateHTML
    };
  }
});
```

### vue-ce-loader 处理流程

| 步骤 | 操作 | 说明 |
|:---:|------|------|
| 1 | 幂等检查 | `if (window.YrYVueCE) return` — 避免重复注册 |
| 2 | PascalCase → kebab-case | `YryProgressBar` → `yry-progress-bar` |
| 3 | 脚本路径解析 | `document.currentScript.src` → URL 对象 |
| 4 | 模板 URL 推导 | `new URL('index.html', scriptUrl)` — 同目录 index.html |
| 5 | fetch 模板 | `fetch(templateUrl)` + 5s 超时 |
| 6 | DOMParser 提取 | `doc.getElementById(templateId)` → innerHTML |
| 7 | buildComponent | 调用组件提供的工厂函数 |
| 8 | defineCustomElement | `Vue.defineCustomElement(component, { shadowRoot: false })` |
| 9 | customElements.define | 全局注册 `<yry-progress-bar>` |
| 10 | window 暴露 | `window.YryProgressBar = component` |
| 11 | ready 事件 | `dispatchEvent(new CustomEvent('yry-progress-bar-ready'))` |

### 降级策略

| 场景 | 触发条件 | 降级行为 | 用户影响 |
|------|---------|---------|---------|
| vue-ce-loader 未加载 | `window.YrYVueCE` 为 `undefined` | `console.warn` + `return` | 组件不注册，无阻塞 |
| Vue 3 未加载 | `window.Vue` 为 `undefined` | `console.error` (loader 层) | 组件不注册 |
| fetch 超时 | 5s 内未返回 | `console.error` + 不注册 | 组件不渲染 |
| 模板 id 缺失 | `getElementById` 返回 `null` | throw → catch → `console.error` | 组件不注册 |
| 网络失败 | fetch reject / HTTP 4xx/5xx | `.catch` → `console.error` | 组件不注册 |

### 幂等保证

| 层级 | 机制 | 说明 |
|------|------|------|
| vue-ce-loader | `if (window.YrYVueCE) return` | 多次 `<script>` 引入不重复执行 |
| customElements | `customElements.get(tagName)` 检查 | 同名 CE 不重复 define |
| ready 事件 | `{once: true}` 监听 | 页面 mount 只触发一次 |

### 加载依赖顺序

```
1. Vue 3 运行时          ← <script src="vue.global.prod.js">
2. vue-ce-loader.js     ← <script src="cdn/shared/vue-ce-loader.js">
3. YryProgressBar JS    ← <script src="cdn/yry-progress-bar/index.js">
4. YryProgressBar CSS   ← <link href="cdn/yry-progress-bar/index.css">
```

CSS 可在任意位置引入 (无顺序依赖)，建议在 `<head>` 中提前加载避免 FOUC。

<a id="sec2"></a>
## §2 实施

### 任务管线

| # | 任务 | 验收信号 | 状态 |
|:---:|------|---------|:---:|
| 1 | IIFE 包装 + vue-ce-loader 检测 | `window.YrYVueCE` 检测 · 提前 return | ✅ |
| 2 | YrYVueCE.define() 调用 | componentName / templateId / buildComponent 三参数完整 | ✅ |
| 3 | Props 定义 | done(Number) / total(Number) / label(String) | ✅ |
| 4 | ready 事件消费 | `document.addEventListener('yry-progress-bar-ready', ...)` | ✅ |
| 5 | 降级路径验证 | loader 缺失 / Vue 缺失 / 网络失败均有降级 | ✅ |

<a id="sec3"></a>
## §3 验证

| 验证项 | 方法 | 阈值 |
|--------|------|:---:|
| CE 注册成功 | `customElements.get('yry-progress-bar')` | 非 undefined |
| window 暴露 | `typeof window.YryProgressBar` | `'object'` |
| ready 事件派发 | 监听 `yry-progress-bar-ready` | 事件触发 |
| loader 缺失降级 | 移除 vue-ce-loader.js | console.warn · 不抛异常 |
| Vue 缺失降级 | 移除 Vue 3 | console.error · 不抛异常 |
| 幂等注册 | 两次引入 index.js | 无重复 define 错误 |

<a id="sec4"></a>
## §4 自改进

| 维度 | 当前 | 目标 | 行动 |
|------|:---:|:---:|------|
| 超时配置 | loader 固定 5s | 组件级可配 | 支持 `data-timeout` attribute |
| 加载骨架 | 无 | loading 占位 | 注册前显示骨架屏 |
| 模板缓存 | 无 | sessionStorage 缓存 | 减少重复 fetch |
| 重试策略 | 0 次 | 1 次重试 | fetch 失败后 2s 重试 |

---

> 维护者提示: `templateId` 必须与 `index.html` 中 `<script type="text/x-template" id="yry-progress-bar-tpl">` 的 id 完全一致。`componentName` 的 PascalCase → kebab-case 转换由 loader 自动完成。
