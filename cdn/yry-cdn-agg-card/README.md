# YryCdnAggCard · CDN 聚合中心单卡 (v2)

> Vue 3 组件 · 自定义元素 `<yry-cdn-agg-card>` · 单张聚合页入口卡片
> v2 · 重设计: 引入 hero · body · chips · foot 四段结构 + 强调色细条 + 交互微动效。

## 文件

```
yry-cdn-agg-card/
├── index.html    # 模板源 (<script type="text/x-template">) + Demo 预览
├── index.js      # Loader: fetch → DOMParser → 注册 → ready 事件
└── index.css     # 卡片样式 (v2 · hero/chips/foot + hover/focus/visited)
```

## Props API

| 名称 | 类型 | 必填 | 默认 | 说明 |
|------|------|------|------|------|
| `href` | String | ✅ | — | 卡片跳转链接 |
| `title` | String | | `''` | 链接 `title` 属性 (悬停提示) |
| `emoji` | String | | `''` | 左侧 emoji 图标 |
| `name` | String | ✅ | — | 卡片主标题 (如 "清单聚合") |
| `badge` | String | | `''` | hero 区路径徽标 (如 `checklist.html`) |
| `dataSource` | String | | `''` | foot 区数据源徽标 (如 `manifest.json`) |
| `body` | String | | `''` | 描述正文 (支持 HTML,经 `v-html` 渲染) |
| `chips` | Array<String> | | `[]` | 能力标签数组 |
| `cta` | String | | `''` | foot 区 CTA 文字 (如 "浏览清单 →") |
| `target` | String | | `''` | 链接打开方式 (`_blank` 等) |

## 事件

| 事件 | 时机 | payload |
|------|------|---------|
| `yry-cdn-agg-card-ready` | 模板 fetch + 注册完成 | `{ component: 'YryCdnAggCard' }` |

## 使用

```html
<link rel="stylesheet" href="../../../../cdn/yry-cdn-agg-card/index.css">
<script src="https://unpkg.com/vue@3/dist/vue.global.prod.js"></script>
<script src="../../../../cdn/shared/vue-ce-loader.js"></script>
<script src="../../../../cdn/yry-cdn-agg-card/index.js"></script>

<yry-cdn-agg-card
  href="../cdn/checklist.html"
  title="全卡片文件清单"
  emoji="📋" name="清单聚合"
  badge="checklist.html" data-source="manifest.json"
  cta="浏览清单 →"></yry-cdn-agg-card>
```

## v2 DOM 结构

```html
<a class="cdn-agg-card sr-link" href="..." title="...">
  <span class="cdn-agg-accent-bar"></span>          <!-- 强调色细条 -->
  <header class="cdn-agg-top">                     <!-- hero 区 -->
    <div class="cdn-agg-emoji-wrap"><span class="cdn-agg-emoji">📋</span></div>
    <div class="cdn-agg-id">
      <div class="cdn-agg-name">清单聚合</div>
      <div class="cdn-agg-badge">checklist.html</div>
    </div>
  </header>
  <div class="cdn-agg-body">描述正文(支持 HTML,可含 .cdn-agg-stats*)</div>
  <div class="cdn-agg-chips">
    <span class="cdn-agg-chip">状态徽章</span>
    <span class="cdn-agg-chip">类型过滤</span>
  </div>
  <footer class="cdn-agg-foot">                    <!-- foot 区 -->
    <span class="cdn-agg-datasource">
      <span class="cdn-agg-datasource-dot"></span>manifest.json
    </span>
    <span class="cdn-agg-cta">
      <span class="cdn-agg-cta-text">浏览清单 →</span>
      <span class="cdn-agg-cta-arrow">→</span>
    </span>
  </footer>
</a>
```

## v2 设计要点

- **四段阅读节奏**: hero (大 emoji + 主标题) → body (描述 + 内联 stats) → chips (能力标签) → foot (数据源 · CTA)
- **强调色细条**: 左侧 2px 渐变条默认隐藏,hover/focus 浮现 (`scaleY 0.35 → 1`)
- **emoji 底座**: 40×40 圆角矩形 + 内嵌径向高光,hover 旋转 -4° + 缩放 1.06
- **hero 标题**: 0.95rem · 700,hover 转强调色
- **body 描述**: 0.78rem · 1.65 行高 · text2 色,内联 `<code>` 单独着色
- **stats 条**: 胶囊形,绿色数字 + 灰底标签
- **chips 标签**: 胶囊形,hover 微抬 + 颜色加深
- **foot 区分隔**: dashed 顶边把 footer 与正文清晰分开
- **CTA 箭头**: 静态 `→`,hover 右移 4px (micro-interaction)
- **已浏览态**: `data-visited="1"` 触发绿色边框 + 右上角 "✓ 已浏览" 徽标
- **聚焦态**: `:focus-visible` 与 hover 同等待遇,键盘可达
- **减少动效**: `@media (prefers-reduced-motion: reduce)` 自动取消 transform
- **紧凑栅格**: 父容器 `.yry-card-grid.is-compact` 触发更小尺寸变体

## 外部脚本约束 (必须保留)

- `.cdn-agg-card` — 根元素
- `.cdn-agg-cta` — 外部 `stampCard()` 脚本以此为锚点插入 `.cdn-freshness` 徽标
- `.cdn-freshness` — 动态追加的新鲜度徽标
- `.cdn-agg-stats` / `.cdn-agg-stat` — 由 body HTML 注入的统计胶囊
- `[data-visited="1"]` — 外部 JS 设置的已浏览标记
- `class="sr-link"` — 兼容页面级 `.score-report .sr-link` 通用 hover 样式

## 依赖

- Vue 3 运行时
- `shared/vue-ce-loader.js`
