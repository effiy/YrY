# YryReportSection · 评分报告 Section 容器

> Vue 3 组件 · 自定义元素 `<yry-report-section>` · `<section class="score-report">` 完整封装

## 文件

```
yry-report-section/
├── index.html    # 模板源 (<script type="text/x-template">) + Demo 预览
├── index.js      # Loader: fetch → DOMParser → 注册 → ready 事件
└── index.css     # 空 (样式由 docs/index.html 页面级 CSS 提供)
```

## Props API

| 名称 | 类型 | 必填 | 默认 | 说明 |
|------|------|------|------|------|
| `title` | String | ✅ | — | `sr-title` 主标题 |
| `metaInfo` | String | | `''` | 右侧元信息文本 (`sr-meta-info`) |
| `intro` | String | | `''` | `sr-intro-box` 内容 (支持 HTML) |
| `links` | Array | | `[]` | 链接数组,内部自动渲染为 `<yry-report-link>` |
| `linksClass` | String | | `'sr-links is-tight-gap'` | 链接容器 class |
| `footerNote` | String | | `''` | 底部说明 (支持 HTML) |
| `footerTight` | Boolean | | `false` | 底部说明使用紧凑间距 (`.is-tight`) |
| `id` | String | | `''` | section id (用于 `#锚点` 跳转) |
| `titleId` | String | | `''` | `sr-title` 的 id (用于 `#sr-detail-nav` 等子锚点) |
| `linksId` | String | | `''` | 链接容器的 id (用于折叠按钮 `data-target`) |
| `sectionClass` | String | | `''` | 额外加在 `<section>` 上的 class |
| `showHeader` | Boolean | | `true` | 是否显示 `sr-header` |

**link 对象**: 见 [`yry-report-link` Props API](./../yry-report-link/README.md)
(href, title, emoji, text)

## 事件

| 事件 | 时机 | payload |
|------|------|---------|
| `yry-report-section-ready` | 模板 fetch + 注册完成 | `{ component: 'YryReportSection' }` |
| `yry-report-section-ready:mounted` | 首次 mount 完毕 | `{ component, host, id }` |
| `yry-report-section-ready:updated` | props 变化后重新渲染 | `{ component, host, id }` |

## 使用

```html
<script src="https://unpkg.com/vue@3/dist/vue.global.prod.js"></script>
<script src="../../../../cdn/shared/vue-ce-loader.js"></script>
<script src="../../../../cdn/yry-report-link/index.js"></script>
<script src="../../../../cdn/yry-report-section/index.js"></script>

<yry-report-section id="skills-market"></yry-report-section>
<script>
  function mount() {
    document.getElementById('skills-market').title = '🛠 技能市场';
    document.getElementById('skills-market').metaInfo = '20 个 SKILL.md 入口';
    document.getElementById('skills-market').intro = '<strong>自包含规约单元</strong>,遵循 SRP 单一职责';
    document.getElementById('skills-market').links = [
      { href: '../skills/rui/SKILL.md',      emoji: '🛡', text: 'rui' },
      { href: '../skills/rui-code/SKILL.md', emoji: '⌨', text: 'rui-code' }
    ];
    document.getElementById('skills-market').footerNote = '共 20 个入口 · 已校验';
  }
  if (window.YryReportSection) mount();
  else document.addEventListener('yry-report-section-ready', mount, { once: true });
</script>
```

## DOM 结构

```html
<section class="score-report" id="skills-market">
  <div class="sr-header">
    <span class="sr-title">🛠 技能市场</span>
    <span class="sr-meta-info">20 个 SKILL.md 入口</span>
  </div>
  <div class="sr-intro-box">...</div>
  <div class="sr-links is-tight-gap">
    <a class="sr-link" href="..." title="...">🛡&nbsp;rui</a>
    <a class="sr-link" href="..." title="...">⌨&nbsp;rui-code</a>
  </div>
  <div class="sr-footer-note">共 20 个入口 · 已校验</div>
</section>
```

## 兼容说明

- 使用 Vue 3 custom element (`shadowRoot: false`),渲染到 light DOM。
- 因此 `document.querySelectorAll('.sr-link')` 仍可直接命中,原外部脚本无需改动。
- 监听 `yry-report-section-ready:mounted` 事件后可对渲染后的 DOM 做后处理。

## 适用场景

`docs/index.html` 中以下 section 可用本组件替换(结构完全一致):

- 最新报告快照 (`sm-snapshot`)
- 详细报告导航 (`sr-detail-nav`)
- CDN 资源与文档中心
- 20 技能市场
- 治理规则与共享库
- 共享库 lib/ 完整索引
- 测试基础设施
- README 章节导航
- CLAUDE.md 章节导航
- 故障排查锚点
- Agent 角色契约与故事公式

## 依赖

- Vue 3 运行时
- `shared/vue-ce-loader.js`
- `yry-report-link` (异步等待 `yry-report-link-ready` 事件)
- 页面级 `.sr-*` 样式 (来自 docs/index.html 的页面级 `<style>` 段)