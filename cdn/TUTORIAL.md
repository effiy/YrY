# YrY CDN · 实战教程

> 逐步构建一个完整的场景页面, 从零开始使用 CDN 组件。

## 目标

构建一个典型的「场景文档页」, 包含面包屑、场景头部、统计卡、交叉导航、回到顶部。

最终效果参考: 任意 `yry-*/scenes/场景-*/审查.html` 等页面。

---

## 步骤 1: 最小骨架

创建 `my-scene.html`:

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>我的场景页</title>
  <!-- 共享基线 + Cat B 主题 -->
  <link rel="stylesheet" href="../../../../cdn/shared/index.css">
  <link rel="stylesheet" href="../../../../cdn/theme/index.css">
  <script src="../../../../cdn/shared/index.js"></script>
</head>
<body>
  <div class="yry-container">
    <h1>Hello YrY CDN</h1>
  </div>
</body>
</html>
```

浏览器打开 — 深色背景、系统字体、14 设计令牌已就绪。

---

## 步骤 2: 添加面包屑导航

```html
<head>
  <!-- ... 已有样式 ... -->
  <link rel="stylesheet" href="../../../../cdn/yry-breadcrumb/index.css">
  <script src="https://unpkg.com/vue@3/dist/vue.global.prod.js"></script>
  <script src="../../../../cdn/shared/index.js"></script>
  <script src="../../../../cdn/yry-breadcrumb/index.js"></script>
</head>
<body>
  <div id="breadcrumb-app"></div>
  <div class="yry-container">
    <h1>Hello YrY CDN</h1>
  </div>
  <script>
    function mount() {
      Vue.createApp(window.YryBreadcrumb, {
        items: [
          { label: '文档中心', href: '../../../index.html', icon: '📄' },
          { label: '我的场景' }
        ]
      }).mount('#breadcrumb-app');
    }
    if (window.YryBreadcrumb) mount();
    else document.addEventListener('yry-breadcrumb-ready', mount, { once: true });
  </script>
</body>
```

**要点**: Vue 3 必须在组件 JS 之前加载; 使用「双设」挂载策略 (同步检查 + ready 事件)。

---

## 步骤 3: 添加场景头部

```html
<head>
  <link rel="stylesheet" href="../../../../cdn/yry-scene-header/index.css">
  <script src="../../../../cdn/yry-scene-header/index.js"></script>
</head>
<body>
  <div id="breadcrumb-app"></div>
  <div id="scene-header-app"></div>
  <div class="yry-container">
    <!-- 页面内容 -->
  </div>
  <script>
    function mountHeader() {
      Vue.createApp(window.YrySceneHeader, {
        icon: '📋',
        titlePrefix: '场景-1',
        accent: ' · 我的第一个 CDN 页面',
        meta: '📌 v1.0 · 📅 2026-06-22',
        desc: '学习如何使用 YrY CDN 组件构建场景页面'
      }).mount('#scene-header-app');
    }
    // 合并挂载: 等待两个组件都就绪
    function mountAll() {
      if (window.YryBreadcrumb && window.YrySceneHeader) {
        mount();        // 面包屑
        mountHeader();  // 场景头部
      }
    }
    ['yry-breadcrumb-ready', 'yry-scene-header-ready'].forEach(ev =>
      document.addEventListener(ev, mountAll, { once: true })
    );
    mountAll(); // 同步尝试
  </script>
</body>
```

---

## 步骤 4: 添加统计卡

```html
<head>
  <link rel="stylesheet" href="../../../../cdn/yry-stats-grid/index.css">
  <script src="../../../../cdn/yry-stats-grid/index.js"></script>
</head>
<body>
  <div id="stats-app"></div>
  <script>
    function mountStats() {
      Vue.createApp(window.YryStatsGrid, {
        items: [
          { value: 5,  label: '已完成', modifier: 'health' },
          { value: 1,  label: '进行中', modifier: 'warn-h' },
          { value: 0,  label: '待开始' },
          { value: '83%', label: '完成进度', modifier: 'accent' }
        ]
      }).mount('#stats-app');
    }
    // 注册到 mountAll
  </script>
</body>
```

---

## 步骤 5: 添加交叉导航

```html
<head>
  <link rel="stylesheet" href="../../../../cdn/yry-cross-nav/index.css">
  <script src="../../../../cdn/yry-cross-nav/index.js"></script>
</head>
<body>
  <div id="cross-nav-app"></div>
  <script>
    function mountCrossNav() {
      Vue.createApp(window.YryCrossNav, {
        basePath: './',
        active: '清单',
        pages: [
          { id: '清单', icon: '📋', href: '计划清单.html' },
          { id: '架构', icon: '📐', href: '架构图.html' },
          { id: '演示', icon: '💡', href: '演示.html' }
        ]
      }).mount('#cross-nav-app');
    }
  </script>
</body>
```

---

## 步骤 6: 添加回到顶部

零配置, 仅需 2 行引用:

```html
<head>
  <link rel="stylesheet" href="../../../../cdn/yry-back-top/index.css">
  <script src="../../../../cdn/yry-back-top/index.js"></script>
</head>
```

滚动超过 400px 自动显示 ↑ 按钮, 点击平滑回顶部。

---

## 步骤 7: 添加 Toast 反馈

`shared/index.js` 已加载, 直接调用:

```html
<script>
  YrY.toast('页面加载完成');
  // 点击复制按钮
  document.querySelector('.copy-btn').addEventListener('click', function() {
    YrY.copyCmd(this, '要复制的命令');
  });
</script>
```

---

## 完整页面

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>我的场景页</title>

  <!-- ═══ 样式 (按加载顺序) ═══ -->
  <link rel="stylesheet" href="../../../../cdn/shared/index.css">
  <link rel="stylesheet" href="../../../../cdn/theme/index.css">
  <link rel="stylesheet" href="../../../../cdn/yry-breadcrumb/index.css">
  <link rel="stylesheet" href="../../../../cdn/yry-scene-header/index.css">
  <link rel="stylesheet" href="../../../../cdn/yry-stats-grid/index.css">
  <link rel="stylesheet" href="../../../../cdn/yry-cross-nav/index.css">
  <link rel="stylesheet" href="../../../../cdn/yry-back-top/index.css">

  <!-- ═══ 脚本 (按依赖顺序) ═══ -->
  <script src="https://unpkg.com/vue@3/dist/vue.global.prod.js"></script>
  <script src="../../../../cdn/shared/index.js"></script>
  <script src="../../../../cdn/yry-breadcrumb/index.js"></script>
  <script src="../../../../cdn/yry-scene-header/index.js"></script>
  <script src="../../../../cdn/yry-stats-grid/index.js"></script>
  <script src="../../../../cdn/yry-cross-nav/index.js"></script>
  <script src="../../../../cdn/yry-back-top/index.js"></script>
</head>
<body>
  <!-- 面包屑 -->
  <div id="breadcrumb-app"></div>

  <!-- 场景头部 -->
  <div id="scene-header-app"></div>

  <!-- 统计卡 -->
  <div id="stats-app"></div>

  <!-- 交叉导航 -->
  <div id="cross-nav-app"></div>

  <!-- 主内容 -->
  <div class="yry-container">
    <div class="yry-section">
      <h2>概述</h2>
      <p>使用 YrY CDN 组件构建的页面内容...</p>
    </div>
  </div>

  <script>
    /* ── 挂载函数 ── */
    function mountBreadcrumb() {
      Vue.createApp(window.YryBreadcrumb, {
        items: [{ label: '文档中心', href: '../../../index.html', icon: '📄' }, { label: '我的场景' }]
      }).mount('#breadcrumb-app');
    }

    function mountHeader() {
      Vue.createApp(window.YrySceneHeader, {
        icon: '📋', titlePrefix: '场景-1',
        accent: ' · 我的第一个 CDN 页面',
        meta: '📌 v1.0 · 📅 2026-06-22',
        desc: '学习如何使用 YrY CDN 组件构建场景页面'
      }).mount('#scene-header-app');
    }

    function mountStats() {
      Vue.createApp(window.YryStatsGrid, {
        items: [
          { value: 5, label: '已完成', modifier: 'health' },
          { value: 1, label: '进行中', modifier: 'warn-h' },
          { value: '83%', label: '完成进度', modifier: 'accent' }
        ]
      }).mount('#stats-app');
    }

    function mountCrossNav() {
      Vue.createApp(window.YryCrossNav, {
        basePath: './', active: '清单',
        pages: [
          { id: '清单', icon: '📋', href: '计划清单.html' },
          { id: '架构', icon: '📐', href: '架构图.html' },
          { id: '演示', icon: '💡', href: '演示.html' }
        ]
      }).mount('#cross-nav-app');
    }

    /* ── 统一挂载 (双设策略) ── */
    function mountAll() {
      var ok = window.YryBreadcrumb && window.YrySceneHeader
            && window.YryStatsGrid && window.YryCrossNav;
      if (!ok) return;
      mountBreadcrumb();
      mountHeader();
      mountStats();
      mountCrossNav();
      YrY.toast('页面加载完成');
    }

    ['yry-breadcrumb-ready', 'yry-scene-header-ready',
     'yry-stats-grid-ready', 'yry-cross-nav-ready'].forEach(function(ev) {
      document.addEventListener(ev, mountAll, { once: true });
    });
    mountAll();
  </script>
</body>
</html>
```

---

## 进阶: 使用文档分层组件

对于有多子节的复杂页面, 用 `yry-doc-layer` 替代手动布局:

```html
<head>
  <!-- 6 个子组件样式 -->
  <link rel="stylesheet" href="../../../../cdn/yry-layer/index.css">
  <link rel="stylesheet" href="../../../../cdn/yry-sub-title/index.css">
  <link rel="stylesheet" href="../../../../cdn/yry-tag-chip/index.css">
  <link rel="stylesheet" href="../../../../cdn/yry-item-card/index.css">
  <link rel="stylesheet" href="../../../../cdn/yry-story-card/index.css">
  <link rel="stylesheet" href="../../../../cdn/yry-scene-card/index.css">
  <link rel="stylesheet" href="../../../../cdn/yry-doc-layer/index.css">

  <!-- 6 个子组件 JS (按依赖顺序) -->
  <script src="../../../../cdn/yry-tag-chip/index.js"></script>
  <script src="../../../../cdn/yry-item-card/index.js"></script>
  <script src="../../../../cdn/yry-story-card/index.js"></script>
  <script src="../../../../cdn/yry-scene-card/index.js"></script>
  <script src="../../../../cdn/yry-sub-title/index.js"></script>
  <script src="../../../../cdn/yry-layer/index.js"></script>
  <script src="../../../../cdn/yry-doc-layer/index.js"></script>
</head>
<body>
  <div id="layer-deps-app"></div>
  <script>
    function mountLayer() {
      Vue.createApp(window.YryDocLayer, {
        layerId: 'layer-deps', num: '1',
        titleAccent: '第三方依赖与框架',
        stats: ['6 运行时 · 6 开发'],
        sections: [
          {
            subTitle: { icon: '⚡', text: '运行时依赖' },
            grid: 'card',
            items: [
              { icon: 'V', iconModifier: 'skill', name: 'Vue 3', desc: '前端框架', tags: [{text:'运行时',modifier:'accent'}] },
              { icon: 'C', iconModifier: 'skill', name: 'Cytoscape.js', desc: '图谱可视化', tags: [{text:'运行时',modifier:'accent'}] }
            ]
          },
          {
            subTitle: { icon: '📖', text: '相关故事' },
            grid: 'story',
            items: [
              { icon: '📦', name: 'CDN 共享前端资源库', desc: '5 场景', scenes: ['场景1','场景2','场景3'] }
            ]
          }
        ]
      }).mount('#layer-deps-app');
    }
    if (window.YryDocLayer) mountLayer();
    else document.addEventListener('yry-doc-layer-ready', mountLayer, { once: true });
  </script>
</body>
```

---

## 常见模式速查

### 纯文档页 (无 Vue)

```html
<link rel="stylesheet" href="../../../../cdn/shared/index.css">
<link rel="stylesheet" href="../../../../cdn/theme/index.css">
<script src="../../../../cdn/shared/index.js"></script>
```

### 架构图页 (Cat A)

```html
<link rel="stylesheet" href="../../../../cdn/fonts/index.css">
<link rel="stylesheet" href="../../../../cdn/shared/index.css">
<link rel="stylesheet" href="../../../../cdn/theme-mono/index.css">
<link rel="stylesheet" href="../../../../cdn/yry-arch/index.css">
<script src="../../../../cdn/shared/index.js"></script>
<script src="../../../../cdn/yry-arch/index.js"></script>
```

### 审查页 (Cat B + 审查样式)

```html
<link rel="stylesheet" href="../../../../cdn/shared/index.css">
<link rel="stylesheet" href="../../../../cdn/theme/index.css">
<link rel="stylesheet" href="../../../../cdn/yry-review/index.css">
<script src="../../../../cdn/shared/index.js"></script>
```

### 测试页 (Cat B + 测试面板)

```html
<link rel="stylesheet" href="../../../../cdn/shared/index.css">
<link rel="stylesheet" href="../../../../cdn/theme/index.css">
<link rel="stylesheet" href="../../../../cdn/yry-test/index.css">
<script src="../../../../cdn/shared/index.js"></script>
<script src="../../../../cdn/yry-test/index.js"></script>
```

---

## 调试技巧

1. **组件不渲染**: 打开控制台, 搜索 `[Yry` 查看组件加载日志
2. **模板不更新**: 硬刷新 (Cmd+Shift+R) 绕过 fetch 缓存
3. **Vue 未加载**: 检查 Network 面板, 确认 `vue.global.prod.js` 在组件 JS 之前加载
4. **ready 事件未触发**: 检查组件 JS 是否 404, 控制台是否有 fetch 错误

---

## 常见错误与排查

### 错误 1: `YrY is not defined`

**症状**: 控制台报 `Uncaught ReferenceError: YrY is not defined`

**原因**: `shared/index.js` 未加载或加载顺序错误

**解决**:
```html
<!-- shared/index.js 必须在所有组件 JS 之前加载 -->
<script src="https://unpkg.com/vue@3/dist/vue.global.prod.js"></script>
<script src="../../../../cdn/shared/index.js"></script>  <!-- ← 必须在这 -->
<script src="../../../../cdn/yry-breadcrumb/index.js"></script>
```

### 错误 2: 组件挂载后空白

**症状**: 组件 DOM 元素存在但内容为空

**原因**: Vue 3 未加载或组件 JS 在 Vue 之前加载

**检查清单**:
- [ ] Network 面板确认 `vue.global.prod.js` 返回 200
- [ ] 确认 `window.Vue` 不为 undefined
- [ ] 确认组件 JS 在 Vue 之后加载

### 错误 3: 样式不生效

**症状**: 组件渲染了但样式错乱

**原因**: 加载链顺序错误或 CSS 变量未定义

**正确顺序**:
```
shared/index.css  →  theme/index.css  →  组件 CSS
(基线 Reset)        (设计令牌)           (组件样式)
```

### 错误 4: `fetch` 模板 404

**症状**: 控制台报 `Failed to fetch template yry-xxx-tpl`

**原因**: 组件 `index.html` 不在预期路径

**解决**: 检查组件 JS 中的 `fetch` 路径, 或检查组件 HTML 模板是否在 `index.html` 中存在且 `id` 匹配

### 错误 5: 双主题切换无效

**症状**: 调用 `YrY.switchTheme()` 后主题不变

**原因**: 未同时加载 `theme/index.css` 和 `theme-mono/index.css`

**解决**:
```html
<link rel="stylesheet" href="../../../../cdn/theme/index.css">
<link rel="stylesheet" href="../../../../cdn/theme-mono/index.css">
```

---

## 性能优化

### 加载性能

| 优化项 | 方法 | 预期效果 |
|--------|------|---------|
| **资源预加载** | `<link rel="preload">` 关键 CSS/JS | FCP 减少 100-200ms |
| **DNS 预解析** | `<link rel="dns-prefetch">` 外部 CDN | DNS 查询提前 50-100ms |
| **字体优化** | `font-display: swap` + woff2 预加载 | 无 FOIT (不可见文本闪烁) |
| **组件按需加载** | 仅引用页面实际使用的组件 | 减少 50-80% CSS 请求 |
| **缓存策略** | 版本化 URL + 长缓存 `max-age=31536000` | 重复访问 0 网络请求 |

### 推荐配置

```html
<head>
  <!-- 预连接外部 CDN -->
  <link rel="preconnect" href="https://unpkg.com" crossorigin>
  <link rel="dns-prefetch" href="https://unpkg.com">

  <!-- 预加载关键资源 -->
  <link rel="preload" href="../../../../cdn/shared/index.css" as="style">
  <link rel="preload" href="../../../../cdn/shared/index.js" as="script">
  <link rel="preload" href="https://unpkg.com/vue@3/dist/vue.global.prod.js" as="script" crossorigin>

  <!-- 样式 -->
  <link rel="stylesheet" href="../../../../cdn/shared/index.css">
  <link rel="stylesheet" href="../../../../cdn/theme/index.css">
</head>
```

### 组件加载优化

```javascript
// 延迟加载非关键组件 (在页面主要内容渲染后)
window.addEventListener('load', function() {
  var s = document.createElement('script');
  s.src = '../../../../cdn/yry-back-top/index.js';
  document.head.appendChild(s);
});
```

### 性能目标

| 指标 | 目标 | 测量方法 |
|------|------|---------|
| **FCP** (首次内容渲染) | ≤ 500ms | Lighthouse / Performance API |
| **LCP** (最大内容渲染) | ≤ 1s | Lighthouse / Performance API |
| **CLS** (累积布局偏移) | ≤ 0.1 | Lighthouse / Performance API |
| **总加载时间** | ≤ 625ms | Network 面板总耗时 |
| **可交互时间** | ≤ 480ms | Lighthouse TTI |

---

## 组件选型指南

### 按页面类型推荐

| 页面类型 | 推荐组件 | 最小加载链 |
|---------|---------|-----------|
| **纯文档页** | (仅 shared + theme) | 2 CSS + 1 JS |
| **场景文档页** | breadcrumb + scene-header + stats-grid + cross-nav + back-top | 5 CSS + 5 JS + Vue 3 |
| **架构图页** | theme-mono + yry-arch | 4 CSS + 2 JS |
| **审查页** | breadcrumb + scene-header + yry-review | 4 CSS + 3 JS + Vue 3 |
| **测试面板** | yry-test + stats-grid | 3 CSS + 3 JS + Vue 3 |
| **仪表板页** | panel-hub + stats-grid + doc-layer | 8 CSS + 9 JS + Vue 3 |
| **知识图谱** | theme-mono + yry-graph + cytoscape | 4 CSS + 3 JS |

### 组件依赖层级

```
Level 0 (基线): shared/index.css + shared/index.js + Vue 3
Level 1 (原子): tag-chip · sub-title · badge · toast
Level 2 (卡片): item-card · card-grid · story-card · scene-card
Level 3 (布局): layer · doc-layer · stats-grid · panel-hub
Level 4 (页面): breadcrumb · scene-header · cross-nav · scene-nav
Level 5 (工具): back-top · export-toolbar · footer-note
```

> 上层组件依赖下层, 引用时需包含所有下级依赖。

### 组件依赖检测命令

```bash
# 检测组件依赖
ls cdn/yry-item-card/                      # 单组件
grep -l 'yry-tag-chip' cdn/yry-*/index.js  # 查找依赖 tag-chip 的组件
find cdn -name 'index.js' -exec grep -l 'Vue.defineCustomElement' {} \;  # Vue 组件清单

# 加载链验证
grep -oP 'href="\K[^"]+' my-page.html | xargs -I{} curl -sI {} | grep -E 'HTTP|content-length'
```

### 常见错误排查

| 错误信号 | 根因 | 修复 |
|---------|------|------|
| `Vue is not defined` | Vue 3 未加载 | 添加 `<script src="https://unpkg.com/vue@3/...">` |
| `YryBreadcrumb is not a constructor` | 组件 JS 未加载 | 检查 `<script src="../../cdn/yry-breadcrumb/index.js">` |
| `Failed to fetch template` | 路径错误 | 使用 `new URL(...)` 自动推导 |
| `CustomElement not defined` | 注册时机晚于使用 | 监听 `*-ready` 事件 |
| 样式错乱 | CSS 顺序错误 | shared → theme → 组件 CSS |
| 闪烁 FOUC | CSS 未先加载 | `<link>` 在 `<script>` 前 |
| 控制台 404 | 路径深度错误 | 使用 `new URL(...)` 推导 |

### 7 步实战教程完整路径

| 步骤 | 目标 | 产物 | 验收 |
|:---:|------|------|------|
| 1 | 最小骨架 | HTML 基础页面 | 深色主题渲染 |
| 2 | 面包屑导航 | `<yry-breadcrumb>` | 链接可点击 |
| 3 | 场景头部 | `<yry-scene-header>` | 标题+meta 显示 |
| 4 | 统计卡片 | `<yry-stats-grid>` | KPI 卡片渲染 |
| 5 | 交叉导航 | `<yry-cross-nav>` | 7 交付物跳转 |
| 6 | 回到顶部 | `<yry-back-top>` | 滚动后按钮显示 |
| 7 | 性能优化 | preload + 缓存 | FCP ≤ 310ms |

### 实战示例完整代码

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>我的场景页</title>
  <link rel="preconnect" href="https://unpkg.com" crossorigin>
  <link rel="dns-prefetch" href="https://unpkg.com">
  <link rel="preload" href="https://unpkg.com/vue@3/dist/vue.global.prod.js" as="script" crossorigin>
  <link rel="stylesheet" href="../../../../cdn/shared/index.css">
  <link rel="stylesheet" href="../../../../cdn/theme/index.css">
  <link rel="stylesheet" href="../../../../cdn/yry-breadcrumb/index.css">
  <link rel="stylesheet" href="../../../../cdn/yry-scene-header/index.css">
  <link rel="stylesheet" href="../../../../cdn/yry-stats-grid/index.css">
  <link rel="stylesheet" href="../../../../cdn/yry-cross-nav/index.css">
  <link rel="stylesheet" href="../../../../cdn/yry-back-top/index.css">
</head>
<body>
  <div id="breadcrumb-app"></div>
  <yry-scene-header icon="📋" title-prefix="场景" accent="cyan"
    meta="v1.0.0 · 2026-06-22" desc="完整实战示例"></yry-scene-header>
  <yry-stats-grid items='[
    {"label":"通过","num":"45","trend":"↑"},
    {"label":"失败","num":"0","trend":"-"},
    {"label":"跳过","num":"3","trend":"-"}
  ]'></yry-stats-grid>
  <yry-cross-nav pages='["计划清单","架构图","测试面板","源码","演示","审查","知识图谱"]'
    active="计划清单" base-path="./"></yry-cross-nav>
  <div class="content"><!-- 场景内容 --></div>
  <yry-back-top></yry-back-top>
  <script src="https://unpkg.com/vue@3/dist/vue.global.prod.js"></script>
  <script src="../../../../cdn/shared/index.js"></script>
  <script src="../../../../cdn/yry-breadcrumb/index.js"></script>
  <script src="../../../../cdn/yry-scene-header/index.js"></script>
  <script src="../../../../cdn/yry-stats-grid/index.js"></script>
  <script src="../../../../cdn/yry-cross-nav/index.js"></script>
  <script src="../../../../cdn/yry-back-top/index.js"></script>
  <script>
    // 面包屑挂载（守卫 + ready 监听）
    function mountBreadcrumb() {
      if (!window.YryBreadcrumb) return;
      if (!document.getElementById('breadcrumb-app')) return;
      Vue.createApp(window.YryBreadcrumb, {
        items: [
          { label: '首页', href: '../../../../index.html', icon: '🏠' },
          { label: '场景', icon: '📋' }
        ],
        ariaLabel: '面包屑导航'
      }).mount('#breadcrumb-app');
    }
    if (window.YryBreadcrumb) mountBreadcrumb();
    else document.addEventListener('yry-breadcrumb-ready', mountBreadcrumb, { once: true });
  </script>
</body>
</html>
```

---

> 更多示例参见各组件 `index.html` (Demo 页) 和 [COMPONENTS.md](./COMPONENTS.md) 速查索引