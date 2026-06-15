# YryBreadcrumb · Vue 3 面包屑组件

> 一个**零打包** (build-free) 的 Vue 3 单文件组件,按 `index.html` / `index.js` / `index.css` 三文件拆分,模板/逻辑/样式各司其职。
>
> 所有 HTML 页面统一采用 **YrY CSS 设计系统**：`@layer` 级联 · 22 设计令牌 (`--yry-color-*`) · 亮/暗双模自适应 · `prefers-reduced-motion` a11y 动效克制 · skip-link 键盘可达性。CSS 资源通过 CDN 加载 (`shared.css` / `theme.css` / `yry-checklist.css`)。

## 文件结构

```
yry-breadcrumb/
├── index.html                       # 模板源 + Demo 预览页
├── index.js                         # Loader: 异步 fetch 模板 → 注册组件 → 派发 ready 事件
├── index.css                        # 组件样式 (使用 --yry-color-* 设计令牌)
└── 任务故事/                        # 组件任务故事 (5 场景 · 8 交付物 / 场景)
    ├── README.md                    # 本文件
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
| `任务故事/场景-N-xxx/*` | 5 场景 × 8 标准交付物 = 40 个文件 | 维护者 / 评审 / 集成 / 测试 / 演示 |

## 5 场景导航

| 场景 | 标题 | 主题 | 关键产物 | 状态 |
|------|------|------|---------|------|
| [1](场景-1-需求与设计/index.md) | 需求与设计 | 需求来源 / 5 项设计决策 / Props 草案 | `index.md` §1-3 | ✅ |
| [2](场景-2-模板与样式/index.md) | 模板与样式 | Vue template + CSS 设计令牌 | [源码.html](场景-2-模板与样式/源码.html) | ✅ |
| [3](场景-3-Loader实现/index.md) | Loader 实现 | fetch + DOMParser + ready 事件 + 5s 超时 | [源码.html](场景-3-Loader实现/源码.html) | ✅ |
| [4](场景-4-页面集成/index.md) | 页面集成 | 4 文件引用顺序 + 4 种 items 模式 | [演示.html](场景-4-页面集成/演示.html) | ✅ |
| [5](场景-5-测试与发布/index.md) | 测试与发布 | 7 项自测 + npm 集成 | [测试面板.html](场景-5-测试与发布/测试面板.html) | ✅ |

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
  <link rel="stylesheet" href="../../../../cdn/yry-breadcrumb/index.css">
  <!-- 2. Vue 3 (必须先于组件加载) -->
  <script src="https://unpkg.com/vue@3/dist/vue.global.prod.js"></script>
</head>
<body>
  <!-- 3. 挂载点 -->
  <div id="breadcrumb-app"></div>

  <!-- 4. 组件 loader (异步 fetch 模板) -->
  <script src="../../../../cdn/yry-breadcrumb/index.js"></script>

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

所有颜色都用 `var(--yry-color-*, #fallback)` 形式,即使页面未加载 `theme.css` 也能正常显示。

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
file:///Users/yi/Yi/YrY/cdn/yry-breadcrumb/index.html
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

---

## 文档目录 · 故事任务索引

本组件位于 CDN 故事任务的 **场景 3** (组件库与 JS 工具 API)。下面是项目所有故事任务的目录树,便于从组件回溯到所属故事。

### 🗂 `docs/故事任务面板/` 总览

> 7 大故事任务分类 · 共 37 个场景 · 每个场景含 8 个交付物 (index.md / 审查 / 架构图 / 测试面板 / 源码 / 演示 / 知识图谱 / 计划清单)

```
docs/故事任务面板/
├── cdn/                       # ★ 本组件所属故事 (5 场景)
├── npm包管理/                  #   npm 包管理 (5 场景)
├── 架构/                      #   系统架构 (8 场景)
├── 自改进/                    #   自改进机制 (5 场景)
├── 自测/                      #   自测体系 (6 场景)
├── 计划清单/                  #   计划清单组件 (4 场景)
└── 首页/                      #   首页仪表板 (4 场景)
```

**总入口**: [docs/故事任务面板/index.json](file:///Users/yi/YrY/docs/%E6%95%85%E4%BA%8B%E4%BB%BB%E5%8A%A1%E9%9D%A2%E6%9D%BF/index.json) · 各分类根目录含 `故事任务.md` (故事总览) + `知识图谱.html/.json` (知识图谱可视化)

### 🟢 CDN 故事任务 · 5 场景 (本组件直接所属)

本组件 `YryBreadcrumb` 在 CDN 故事中的位置:**场景 3 · 组件库与 JS 工具 API** (面包屑归类于"全局组件")。

| 场景 | 标题 | 状态 | 核心交付 | 本组件相关性 |
|------|------|------|---------|------------|
| 1 | CDN 资源加载与页面渲染 | ✅ | CDN 4 文件 + 页面接入示例 | ⬜ 间接 (本组件需 Vue 3) |
| 2 | 双主题系统设计 | ✅ | `theme.css` (B 类) + `theme-mono.css` (A 类) | ⬜ 间接 (CSS 使用 token) |
| 3 | **组件库与 JS 工具 API** | ✅ | 21 个 CSS 组件 + 9 个 JS API | ✅ **本组件在此** |
| 4 | 存量页面迁移 | ✅ | 4 文件拆分 · 设计令牌 · 灰度迁移 | ⬜ 间接 (本组件可被新页面直接使用) |
| 5 | npm 包发布与版本管理 | ✅ | `yry-cdn@1.1.0` · 语义化版本 | ⬜ 间接 (本组件随包发布) |

**场景 3 详情** (本组件文档所在地):
- 📄 [场景-3-组件库与JS工具API/index.md](file:///Users/yi/YrY/docs/%E6%95%85%E4%BA%8B%E4%BB%BB%E5%8A%A1%E9%9D%A2%E6%9D%BF/cdn/%E5%9C%BA%E6%99%AF-3-%E7%BB%84%E4%BB%B6%E5%BA%93%E4%B8%8EJS%E5%B7%A5%E5%85%B7API/index.md) — 场景正文 (技术评审 / 测试设计 / 实施 / 报告 / 自改进)
- 🎯 [场景-3-组件库与JS工具API/演示.html](file:///Users/yi/YrY/docs/%E6%95%85%E4%BA%8B%E4%BB%BB%E5%8A%A1%E9%9D%A2%E6%9D%BF/cdn/%E5%9C%BA%E6%99%AF-3-%E7%BB%84%E4%BB%B6%E5%BA%93%E4%B8%8EJS%E5%B7%A5%E5%85%B7API/%E6%BC%94%E7%A4%BA.html) — 21 个 CSS 组件 + 9 个 JS API 的可交互演示
- 🏗 [场景-3-组件库与JS工具API/架构图.html](file:///Users/yi/YrY/docs/%E6%95%85%E4%BA%8B%E4%BB%BB%E5%8A%A1%E9%9D%A2%E6%9D%BF/cdn/%E5%9C%BA%E6%99%AF-3-%E7%BB%84%E4%BB%B6%E5%BA%93%E4%B8%8EJS%E5%B7%A5%E5%85%B7API/%E6%9E%B6%E6%9E%84%E5%9B%BE.html) — 组件分类 + 数据流图
- 📋 [场景-3-组件库与JS工具API/计划清单.html](file:///Users/yi/YrY/docs/%E6%95%85%E4%BA%8B%E4%BB%BB%E5%8A%A1%E9%9D%A2%E6%9D%BF/cdn/%E5%9C%BA%E6%99%AF-3-%E7%BB%84%E4%BB%B6%E5%BA%93%E4%B8%8EJS%E5%B7%A5%E5%85%B7API/%E8%AE%A1%E5%88%92%E6%B8%85%E5%8D%95.html) — 任务分解 + 交付清单

### 🟡 其他 6 大故事任务 (本组件间接相关)

| 分类 | 场景数 | 主题 | 与本组件关系 |
|------|-------|------|------------|
| [npm包管理](file:///Users/yi/YrY/docs/%E6%95%85%E4%BA%8B%E4%BB%BB%E5%8A%A1%E9%9D%A2%E6%9D%BF/npm%E5%8C%85%E7%AE%A1%E7%90%86/%E6%95%85%E4%BA%8B%E4%BB%BB%E5%8A%A1.md) | 5 | 包搜索 / 安装 / 本地发布 / 审计 / 账号管理 | 间接 — `yry-cdn@1.1.0` 包随本组件发布 |
| [架构](file:///Users/yi/Yi/YrY/docs/%E6%95%85%E4%BA%8B%E4%BB%BB%E5%8A%A1%E9%9D%A2%E6%9D%BF/%E6%9E%B6%E6%9E%84/%E6%95%85%E4%BA%8B%E4%BB%BB%E5%8A%A1.md) | 8 | 新人上手 / 模块定位 / 数据流 / 依赖变更 / 信任边界 / 断言脚本化 / 漂移监测 / 健康仪表板 | 间接 — 场景 1 (新人上手) 的页面会用到本组件 |
| [自改进](file:///Users/yi/Yi/YrY/docs/%E6%95%85%E4%BA%8B%E4%BB%BB%E5%8A%A1%E9%9D%A2%E6%9D%BF/%E8%87%AA%E6%94%B9%E8%BF%9B/%E6%95%85%E4%BA%8B%E4%BB%BB%E5%8A%A1.md) | 5 | 数据采集 / 诊断引擎 / 提案生成 / 效果评估 / 经验技能化 | 间接 — 提案可能涉及本组件的优化 |
| [自测](file:///Users/yi/Yi/YrY/docs/%E6%95%85%E4%BA%8B%E4%BB%BB%E5%8A%A1%E9%9D%A2%E6%9D%BF/%E8%87%AA%E6%B5%8B/%E6%95%85%E4%BA%8B%E4%BB%BB%E5%8A%A1.md) | 6 | init 自检 / commit 自检 / 文档一致性 / 安全回归 / 集成回归 / 第三方 | 间接 — TC 套件需覆盖本组件 |
| [计划清单](file:///Users/yi/Yi/YrY/docs/%E6%95%85%E4%BA%8B%E4%BB%BB%E5%8A%A1%E9%9D%A2%E6%9D%BF/%E8%AE%A1%E5%88%92%E6%B8%85%E5%8D%95/%E6%95%85%E4%BA%8B%E4%BB%BB%E5%8A%A1.md) | 4 | 模板架构 · 交互组件 · 验证报告 · 批量生成 | 间接 — 模板场景 (场景 1) 已用本组件重构面包屑 |
| [首页](file:///Users/yi/Yi/YrY/docs/%E6%95%85%E4%BA%8B%E4%BB%BB%E5%8A%A1%E9%9D%A2%E6%9D%BF/%E9%A6%96%E9%A1%B5/%E6%95%85%E4%BA%8B%E4%BB%BB%E5%8A%A1.md) | 4 | 数据采集 / 实时面板 / 交叉导航 / 自动化生成 | 间接 — 首页面包屑也用本组件 |

### 📑 每个场景的标准 8 交付物

每个 `场景-N-xxx/` 目录含 8 个同名 HTML/MD 文件 (`index.md` 例外为 `.md`):

| 文件 | 内容 |
|------|------|
| `index.md` | 场景正文 (§0 评审 / §1 设计 / §2 实施 / §3 报告 / §4 自改进) |
| `审查.html` | 技术评审 (代码审查清单) |
| `架构图.html` | 架构图 / 数据流图 (Mermaid 可视化) |
| `测试面板.html` | 测试用例 + 自动化测试入口 |
| `源码.html` | 关键源码片段 + 行号引用 |
| `演示.html` | 可交互演示 (浏览器直接运行) |
| `知识图谱.html` | 概念关联 (节点-边图) |
| `计划清单.html` | 任务清单 + 验收标准 + 交付物链接 |

### 🔍 快速跳转 (本组件相关)

- 本组件仓库: [`cdn/yry-breadcrumb/`](file:///Users/yi/Yi/YrY/cdn/yry-breadcrumb/) · [README](file:///Users/yi/Yi/YrY/cdn/yry-breadcrumb/%E4%BB%BB%E5%8A%A1%E6%95%85%E4%BA%8B/README.md) · [Demo](file:///Users/yi/Yi/YrY/cdn/yry-breadcrumb/index.html)
- 所属场景: [场景-3-组件库与JS工具API](file:///Users/yi/Yi/YrY/docs/%E6%95%85%E4%BA%8B%E4%BB%BB%E5%8A%A1%E9%9D%A2%E6%9D%BF/cdn/%E5%9C%BA%E6%99%AF-3-%E7%BB%84%E4%BB%B6%E5%BA%93%E4%B8%8EJS%E5%B7%A5%E5%85%B7API/index.md)
- 已使用本组件的页面: [计划清单 · 场景 1](file:///Users/yi/Yi/YrY/docs/%E6%95%85%E4%BA%8B%E4%BB%BB%E5%8A%A1%E9%9D%A2%E6%9D%BF/%E8%AE%A1%E5%88%92%E6%B8%85%E5%8D%95/%E5%9C%BA%E6%99%AF-1-%E6%A8%A1%E6%9D%BF%E6%9E%B6%E6%9E%84%E4%B8%8ECSS%E8%AE%BE%E8%AE%A1%E7%B3%BB%E7%BB%9F/%E8%AE%A1%E5%88%92%E6%B8%85%E5%8D%95.html) · 未来可接入: 架构/自测/自改进/首页等 28+ 场景页

---

> 维护者提示:本节是导航索引,场景的具体内容请直接阅读各 `index.md`。如某个场景新增/合并/删除,请同步更新本节。
