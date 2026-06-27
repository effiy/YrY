# YryBreadcrumb · Vue 3 面包屑组件

> 一个**零打包** (build-free) 的 Vue 3 单文件组件,按 `index.html` / `index.js` / `index.css` 三文件拆分,模板/逻辑/样式各司其职。
>
> 所有 HTML 页面统一采用 **YrY CSS 设计系统**：`@layer` 级联 · 22 设计令牌 (`--yry-color-*`) · 亮/暗双模自适应 · `prefers-reduced-motion` a11y 动效克制 · skip-link 键盘可达性。CSS 资源通过 CDN 加载 (`shared/index.css` / `theme/index.css` / `yry-checklist.css`)。

## 文件结构

```
yry-breadcrumb/
├── index.html                       # 模板源 + Demo 预览页
├── index.js                         # Loader: 异步 fetch 模板 → 注册组件 → 派发 ready 事件
├── index.css                        # 组件样式 (使用 --yry-color-* 设计令牌)
└── scenes/                         # 组件任务故事 (5 场景 · 8 交付物 / 场景)
    │   └── README.md              # 本文件（组件根目录）
    ├── index.html                   # 任务故事总览 (5 场景导航 · 组件结构 · 交付物索引)
    ├── 场景-1-需求与设计/
    │   ├── index.md                 #   场景正文 (5 章节 + Mermaid)
    │   ├── 审查.html                #   技术评审 (7 项清单)
    │   ├── 架构图.html              #   关键流程图
    │   ├── 测试面板.html            #   测试用例 + 自动化入口
    │   ├── 源码.html                #   关键源码片段 + 行号
    │   ├── 演示.html                #   3 种 items 模式可交互演示
    │   ├── 知识图谱.html            #   概念节点-边图
    │   └── 计划清单.html            #   任务 / 验收 / 交付
    ├── 场景-2-模板与样式/           (× 8 文件, 同上结构)
    ├── 场景-3-Loader实现/           (× 8 文件, 同上结构)
    ├── 场景-4-页面集成/             (× 8 文件, 同上结构)
    └── 场景-5-测试与发布/           (× 8 文件, 同上结构)
```

| 文件 | 角色 | 谁会读它 |
|------|------|---------|
| `index.html` | **模板源** (唯一真实来源) + Demo 预览页 | `index.js` (fetch 提取 template) · 浏览器 (Demo 预览) |
| `index.js` | Loader,运行时注册组件 | 页面 (`<script src=...>`) |
| `index.css` | 组件样式 | 页面 (`<link rel=stylesheet href=...>`) |
| `scenes/场景-N-xxx/*` | 5 场景 × 8 标准交付物 = 40 个文件 | 维护者 / 评审 / 集成 / 测试 / 演示 |

## 5 场景导航

| 场景 | 标题 | 主题 | 关键产物 | 状态 |
|------|------|------|---------|------|
| [1](scenes/场景-1-需求与设计/index.md) | 需求与设计 | 需求来源 / 5 项设计决策 / Props 草案 | `index.md` §1-3 | ✅ |
| [2](scenes/场景-2-模板与样式/index.md) | 模板与样式 | Vue template + CSS 设计令牌 | [源码.html](scenes/场景-2-模板与样式/源码.html) | ✅ |
| [3](scenes/场景-3-Loader实现/index.md) | Loader 实现 | fetch + DOMParser + ready 事件 + 5s 超时 | [源码.html](scenes/场景-3-Loader实现/源码.html) | ✅ |
| [4](scenes/场景-4-页面集成/index.md) | 页面集成 | 4 文件引用顺序 + 4 种 items 模式 | [演示.html](scenes/场景-4-页面集成/演示.html) | ✅ |
| [5](scenes/场景-5-测试与发布/index.md) | 测试与发布 | 7 项自测 + npm 集成 | [测试面板.html](scenes/场景-5-测试与发布/测试面板.html) | ✅ |

## 设计动机

零打包的"组件"通常只有 1 个 `component.js` 大杂烩 (template 字符串 + props + styles inline)。本组件把 template/logic/style 拆到 3 个职责单一的文件,让**设计/前端/测试**可以各改各的部分而互不干扰:

- 🎨 **设计师**改 `index.html` 的 `<script type="text/x-template">` 块 → loader 自动同步
- ⚙️ **前端**改 `index.js` 的 props 定义 / fetch 逻辑 / ready 事件
- 🎭 **样式**改 `index.css`,不影响 template/JS

`index.html` 同时是 Demo 页:浏览器直接打开即可看到组件渲染效果,无需任何 dev server。

## 架构

```
┌─────────────────┐
│   index.html    │ ←─── 浏览器打开 (Demo 预览)
│  ┌───────────┐  │
│  │ <script>  │  │
│  │ template  │  │ ←─── 模板源 (单一真实来源)
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
│     breadcrumb- │
│     tpl 块      │
│  ④ Vue.register │
│  ⑤ dispatchEvent│
└────────┬────────┘
         │ window.YryBreadcrumb + 'yry-breadcrumb-ready' 事件
         ▼
┌─────────────────┐
│  页面 mount 脚本 │ ←─── 监听 ready 事件后 Vue.createApp(...).mount('#app')
└─────────────────┘
```

## 页面使用

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <!-- 1. 组件样式 -->
  <link rel="stylesheet" href="./index.css">
  <!-- 2. Vue 3 (必须先于组件加载) -->
  <script src="../shared/vue.global.prod.js"></script>
</head>
<body>
  <!-- 3. 挂载点 -->
  <div id="breadcrumb-app"></div>

  <!-- 4. 组件 loader (异步 fetch 模板) -->
  <script src="./index.js"></script>

  <!-- 5. 页面级 mount 脚本 · 等待 yry-breadcrumb-ready 后挂载 -->
  <script>
    function mountBreadcrumb() {
      if (!window.Vue || !window.YryBreadcrumb) return;
      Vue.createApp(window.YryBreadcrumb, {
        ariaLabel: '面包屑导航',
        items: [
          { label: '文档中心',   href: '../../../index.html', icon: '📄' },
          { label: 'yry-checklist · 清单与自循环' },
          { label: '场景 1 · 模板架构与 CSS 设计系统' },
          { label: '计划清单',   icon: '📋' }
        ]
      }).mount('#breadcrumb-app');
    }
    // 同步就绪 (cache 命中) → 直接挂载
    // 异步就绪 (cold load) → 等 ready 事件
    if (window.YryBreadcrumb) mountBreadcrumb();
    else document.addEventListener('yry-breadcrumb-ready', mountBreadcrumb, { once: true });
  </script>
</body>
</html>
```

**加载顺序至关重要**:
1. `<link>` 组件样式 (FOUC 防护)
2. `<script>` Vue 3 (组件依赖)
3. `<script>` `index.js` (loader)
4. `<script>` mount 脚本 (同步检查 + 异步事件)

## Props API

| 名称 | 类型 | 必填 | 默认 | 说明 |
|------|------|------|------|------|
| `items` | `Array<{label, href?, icon?}>` | ✅ | — | 面包屑条目 |
| `ariaLabel` | `string` | | `'面包屑导航'` | `<nav>` 的 `aria-label` |
| `separator` | `string` | | `'/'` | 分隔符文本 (预留) |

**item 字段**:
- `label` (必填): 显示文字
- `href` (可选): 存在则渲染为 `<a>`,缺省则渲染为 `<span class="bc-current">`
- `icon` (可选): emoji / 字符,前面加 `&nbsp;` 渲染

**a11y 行为**:
- 链接项 → `<a :href="item.href">`
- 当前项 (无 href) → `<span class="bc-current" :aria-current="i === items.length - 1 ? 'page' : null">`
- 分隔符 → `<span class="bc-sep" aria-hidden="true">/</span>`

## 事件 / 副作用

| 事件 | 何时派发 | 监听者 | payload |
|------|---------|--------|---------|
| `yry-breadcrumb-ready` (document 上) | 模板 fetch + 注册完成后 | 页面 mount 脚本 | `{ component: 'YryBreadcrumb' }` |

| 全局副作用 | 内容 | 时机 |
|-----------|------|------|
| `window.YryBreadcrumb` | 组件 options 对象 | 注册完成后 |
| `console.warn` / `console.error` | 加载/解析失败诊断 | 出错时 |

**降级保护**:
- 缺 Vue 3 → `console.warn` 跳过注册
- `currentScript` 拿不到 → 跳过注册
- `fetch` 失败 / 超时 (5s) → `console.error` 不注册
- 模板块 id 找不到 → 抛错

## 模板源 (index.html 核心)

```html
<script type="text/x-template" id="yry-breadcrumb-tpl">
  <nav class="breadcrumb" :aria-label="ariaLabel">
    <template v-for="(item, i) in items" :key="i">
      <span v-if="i > 0" class="bc-sep" aria-hidden="true">/</span>
      <a v-if="item.href" :href="item.href">
        <template v-if="item.icon">{{ item.icon }}&nbsp;</template>{{ item.label }}
      </a>
      <span v-else class="bc-current" :aria-current="i === items.length - 1 ? 'page' : null">
        <template v-if="item.icon">{{ item.icon }}&nbsp;</template>{{ item.label }}
      </span>
    </template>
  </nav>
</script>
```

⚠️ **不要改 id**: `yry-breadcrumb-tpl` 是 `index.js` 查找的锚点。

## 样式令牌 (index.css)

| class | 用途 | 颜色来源 |
|-------|------|---------|
| `.breadcrumb` | flex 容器 | — |
| `.breadcrumb a` | 链接项 | `var(--yry-color-text-2)` 默认 #d4d4d4 |
| `.breadcrumb a:hover` | 链接 hover | `var(--yry-color-accent)` 默认 #ffc107 |
| `.bc-sep` | 分隔符 `/` | `var(--yry-color-text-3)` opacity .4 |
| `.bc-current` | 当前项 | `var(--yry-color-text-1)` 默认 #f5f5f5,font-weight 500 |

所有颜色都用 `var(--yry-color-*, #fallback)` 形式,即使页面未加载 `theme/index.css` 也能正常显示。

## 修改指南

| 想改什么 | 改哪个文件 | 是否需要清缓存 |
|---------|----------|--------------|
| 渲染结构 (HTML/标签) | `index.html` 的 `<script type="text/x-template">` 块 | ✅ 需清浏览器缓存 (或硬刷新) |
| 组件 props / name / 行为 | `index.js` 的 `buildComponent` 工厂 | ✅ 同上 |
| 颜色 / 间距 / hover 效果 | `index.css` | ✅ 同上 |
| Demo 示例数据 | `index.html` 的 3 个 `mountDemo()` 调用 | ✅ 同上 |

**为何改 template 也要清缓存?**
- `index.html` 整页被浏览器缓存
- `index.js` 的 fetch 命中 HTTP 304 / 内存缓存,可能拿到旧 template
- 硬刷新 (Cmd+Shift+R) 或加版本号 `index.html?v=2` 强制重新加载

## Demo

直接浏览器打开 `index.html`:

```
./index.html
```

可看到 3 个示例:
- **Demo 1**: 含 `href` + `icon` (链接项带 emoji 图标)
- **Demo 2**: 纯文本路径 (无 href,全部为当前项)
- **Demo 3**: 8 级长路径 (验证 wrap 与分隔符渲染)

## 验证清单 (开发自测)

修改后请逐项确认:

- [ ] `node --check cdn/yry-breadcrumb/index.js` 语法通过
- [ ] 浏览器直接打开 `index.html`,3 个 demo 全部渲染正常
- [ ] 控制台无 Vue warning / fetch error
- [ ] 硬刷新页面后,`#breadcrumb-app` 内出现 `<nav class="breadcrumb">`
- [ ] 当前页 (例如 `docs/.../计划清单.html`) 的 mount 脚本能正确挂载,面包屑显示 4 个条目
- [ ] 键盘 Tab 能从第 1 个链接依次聚焦到当前项前的最后一个链接,当前项为 `<span>` 不进 tab 序列
- [ ] 屏幕阅读器朗读顺序: link, separator (aria-hidden 跳过), link, ..., current (aria-current="page")

## 与 `cdn/README.md` 的关系

`cdn/README.md` 是 **CDN 总览** (列所有资源/JS API/Tokens)。
本文件是 **YryBreadcrumb 组件专属文档** (内部架构/修改指南/自测清单)。

两文件内容互不重复:
- `cdn/README.md` 列出"如何加载 + Props 一览表" (用户视角)
- 本文件展开"loader 内部机制 + 修改哪个文件改什么" (维护者视角)

## 关联组件

| 角色 | 组件 | 关系 |
|------|------|------|
| 同级 | [yry-cross-nav](../yry-cross-nav/README.md) | 场景页交叉导航 |
| 同级 | [yry-scene-nav](../yry-scene-nav/README.md) | 场景上一/下一导航 |
| 消费方 | 55+ 场景页 | 所有场景页面顶部面包屑 |

---

## 文档目录 · 故事任务索引

本组件位于 CDN 故事任务的 **场景 3** (组件库与 JS 工具 API)。场景文档位于 `scenes/` 目录。

### 🟢 本组件场景 (5 场景)

| 场景 | 标题 | 状态 |
|------|------|------|
| 1 | [需求与设计](scenes/场景-1-需求与设计/index.md) | ✅ |
| 2 | [模板与样式](scenes/场景-2-模板与样式/index.md) | ✅ |
| 3 | [Loader 实现](scenes/场景-3-Loader实现/index.md) | ✅ |
| 4 | [页面集成](scenes/场景-4-页面集成/index.md) | ✅ |
| 5 | [测试与发布](scenes/场景-5-测试与发布/index.md) | ✅ |

场景总览: [scenes/index.html](scenes/index.html)

### 🟡 其他故事驱动组件 (间接相关)

| 组件 | 场景数 | 故事文档 |
|------|-------|---------|
| [yry-arch](../yry-arch/scenes/README.md) | 8 | 架构知识编目与验证 |
| [yry-checklist](../yry-checklist/scenes/README.md) | 4 | 计划清单自动化生成管线 |
| [yry-home](../yry-home/scenes/README.md) | 4 | 文档首页仪表板 |
| [yry-selfimprove-panel](../yry-selfimprove-panel/scenes/README.md) | 5 | 自改进闭环 |
| [yry-test](../yry-test/scenes/README.md) | 6 | 测试体系 |

### 📑 标准交付物 (每场景 8 件套)

| 文件 | 角色 |
|------|------|
| `index.md` | 场景正文 |
| `审查.html` | 技术评审 |
| `架构图.html` | 关键流程图 |
| `测试面板.html` | 测试用例 + 自动化 |
| `源码.html` | 关键源码片段 |
| `演示.html` | 可交互演示 |
| `知识图谱.html` | 概念节点-边图 |
| `计划清单.html` | 任务 / 验收 / 交付 |

### 🔍 快速跳转

- 本组件: [README](./README.md) · [Demo](./index.html) · [场景索引](./scenes/index.html)
- 已使用本组件的页面: [CDN 首页](../index.html) · 55+ 场景页

---

> 维护者提示:本节是导航索引,场景的具体内容请直接阅读各 `index.md`。如某个场景新增/合并/删除,请同步更新本节。
