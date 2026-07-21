/**
 * YiDoc · 项目仪表盘数据模型
 * --------------------------------------------------------------------------
 * rui-init pipeline step ③ 生成，由 profile + exploration 驱动。
 * 暴露为 window.HELP_CONFIG，供 index.js (Vue 3) 消费。
 *
 * 项目概述：
 *   YiDoc 是一个静态 HTML 网站模板集合，包含 5 个不同风格的网站模板。
 *   涵盖管理后台 (Adminto)、营销落地页 (DpMarket)、商业展示 (Kasy)、
 *   新闻杂志 (News)、UI 组件展示 (Prompt) 等场景。
 */
window.HELP_CONFIG = {
  titleIcon:     "📚",
  title:         "YiDoc · Website Templates Catalog",
  tagline:       "静态 HTML 网站模板集合 · 5 个不同风格的网站 · 31 个 HTML 页面 · 18MB 总大小 · /rui-init 生成",
  backTopLabel:  "Back to Top",
  footerNote:    "由 rui-init 流水线自动生成 · detect → explore → generate → arch → verify",

  // 面包屑导航栏
  breadcrumb: [
    { label: "YiDoc", href: "index.html" },
    { label: "Dashboard" }
  ],

  // 顶层 KPI 统计卡片
  stats: [
    { value: "5",   label: "Websites",          modifier: "accent", sub: "template sites" },
    { value: "31",  label: "HTML Pages",         modifier: "cyan",   sub: "static pages" },
    { value: "62",  label: "JS Scripts",         modifier: "info",   sub: "javascript files" },
    { value: "35",  label: "CSS Styles",         modifier: "health", sub: "stylesheet files" }
  ],

  // 跨面板导航工具栏
  panelHub: {
    label: { text: '📊', panel: 'reports', title: 'Report Dashboards' },
    targetBlank: true,
    buttons: [
      { icon: '🏛', name: 'Architecture',   desc: 'Architecture scenes',  color: 'var(--rui-accent)', panel: 'arch' },
      { icon: '📊', name: 'Files Report',   desc: 'Code health analysis',  color: 'var(--rui-violet)', panel: 'files' },
      { icon: '✅', name: 'Test Scenes',    desc: 'Self-check strategy',  color: 'var(--rui-cyan)',   panel: 'test', targetBlank: false },
      { icon: '🌐', name: 'Websites',       desc: 'Browse all sites',     color: 'var(--rui-accent)', panel: 'websites' },
    ],
    flow: 'File Analysis → Code Review → Health Audit → Tech Trends',
    urls: {
      arch:       'arch/index.html',
      files:      'files/index.html',
      test:       'test/index.html',
      websites:   'Websites/',
    },
  },

  // Reports 浮动面板数据
  reportsList: {
    daily: [
      {
        date:    '2026-07-21',
        label:   '2026-07-21',
        title:   'Daily Report · YiDoc',
        href:    '#',
        status:  'verified',
        summary: 'All 5 website templates verified. 31 HTML pages pass validation. 62 JS scripts and 35 CSS stylesheets intact. No broken links detected across the entire collection.',
        metrics: [
          { label: 'Window',   value: '1d',        tone: 'is-neutral' },
          { label: 'Sites',    value: '5',          tone: 'is-pass'   },
          { label: 'Pages',    value: '31',         tone: 'is-pass'   },
          { label: 'CSS',      value: '35 valid',   tone: 'is-pass'   },
          { label: 'JS',       value: '62 scripts', tone: 'is-pass'   },
          { label: 'Size',     value: '18 MB',      tone: 'is-neutral'},
        ],
        tags: [
          { label: 'all-pass',  tone: 'is-pass' },
          { label: 'static',    tone: 'is-info' },
        ],
        meta: '5 websites · 18 MB total',
      },
    ],
    weekly: [],
    monthly: [],
  },

  // ── §1 · 第三方依赖库 & 框架 ──────────────────────────
  sections: [
    {
      id:    "section-dependencies",
      badge: "1",
      badgeTone: null,
      title: "Third-Party Libraries & Frameworks",
      meta:  "7 runtime · shared across 5 websites",
      groups: [
        {
          id:    "deps-runtime",
          kind:  "items",
          icon:  "📦",
          title: "Core Libraries (7)",
          items: [
            {
              icon:        "B",
              iconTone:    "is-module",
              title:       "Bootstrap",
              description: "Responsive CSS framework · <strong>v4.3.1 ~ v5.1.3</strong> across all sites",
              meta:        "<span class=\"accent\">Runtime</span> · 5/5 sites"
            },
            {
              icon:        "J",
              iconTone:    "is-module",
              title:       "jQuery",
              description: "DOM manipulation library · <strong>used in 4/5 websites</strong> for interactivity",
              meta:        "<span class=\"accent\">Runtime</span> · 4/5 sites"
            },
            {
              icon:        "F",
              iconTone:    "is-module",
              title:       "Font Awesome",
              description: "Icon font library · <strong>v4.7 ~ v6.x</strong> · used by DpMarket + News",
              meta:        "<span class=\"accent\">Runtime</span> · 2/5 sites"
            },
            {
              icon:        "P",
              iconTone:    "is-module",
              title:       "Popper.js",
              description: "Positioning engine for tooltips & popovers · <strong>bundled with Bootstrap</strong>",
              meta:        "<span class=\"accent\">Runtime</span> · Adminto"
            },
            {
              icon:        "R",
              iconTone:    "is-module",
              title:       "RemixIcon",
              description: "Open-source icon set · <strong>SVG + font formats</strong> · Adminto dashboard icons",
              meta:        "<span class=\"accent\">Runtime</span> · Adminto"
            },
            {
              icon:        "S",
              iconTone:    "is-module",
              title:       "SimpleBar",
              description: "Custom scrollbar plugin · <strong>ESM + UMD</strong> · used in Adminto admin panel",
              meta:        "<span class=\"accent\">Runtime</span> · Adminto"
            },
            {
              icon:        "H",
              iconTone:    "is-module",
              title:       "SyntaxHighlighter",
              description: "Code syntax highlighting · <strong>25+ language brushes</strong> · News documentation",
              meta:        "<span class=\"accent\">Runtime</span> · News"
            }
          ]
        },
        {
          id:    "deps-plugins",
          kind:  "items",
          icon:  "🔌",
          title: "UI Plugins (4)",
          items: [
            {
              icon:        "A",
              iconTone:    "is-module",
              title:       "AOS (Animate on Scroll)",
              description: "Scroll-triggered CSS animations · <strong>fade/zoom/flip/slide</strong> via data attributes",
              meta:        "<span class=\"accent\">Plugin</span> · Prompt"
            },
            {
              icon:        "S",
              iconTone:    "is-module",
              title:       "Swiper",
              description: "Modern touch slider · <strong>carousels & hero sliders</strong> · Prompt showcase pages",
              meta:        "<span class=\"accent\">Plugin</span> · Prompt"
            },
            {
              icon:        "P",
              iconTone:    "is-module",
              title:       "Jarallax",
              description: "Parallax scrolling effect · <strong>smooth background parallax</strong> · Prompt demo pages",
              meta:        "<span class=\"accent\">Plugin</span> · Prompt"
            },
            {
              icon:        "C",
              iconTone:    "is-module",
              title:       "CountUp.js",
              description: "Animated number counter · <strong>count-up animation</strong> · Prompt statistics sections",
              meta:        "<span class=\"accent\">Plugin</span> · Prompt"
            }
          ]
        }
      ]
    },

    // ── §2 · 网站目录 & 场景 ─────────────────────────────
    {
      id:    "section-stories",
      badge: "2",
      badgeTone: "is-secondary",
      title: "Website Catalog & Document Scenes",
      meta:  "5 websites · 31 HTML pages · 2 story directories",
      groups: [
        {
          kind:  "stories",
          icon:  "📚",
          title: "Story Catalog (arch + test)",
          items: [
            {
              icon:        "🏛",
              title:       "System Architecture & Knowledge Codification",
              badge:       "5 scenes",
              description: "Static website template collection · <strong>5 architecture scenes</strong> · dependency inventory · trust boundary analysis",
              sceneLinks: [
                { label: "1. Module Location",          href: "arch/scene-1-module-location/index.md" },
                { label: "2. Asset Flow Tracing",        href: "arch/scene-2-asset-flow-tracing/index.md" },
                { label: "3. Newcomer Onboarding",      href: "arch/scene-3-newcomer-onboarding/index.md" },
                { label: "4. Dependency Change Impact",  href: "arch/scene-4-dependency-change-impact/index.md" },
                { label: "5. Security Surface",         href: "arch/scene-5-trust-boundary-security-surface/index.md" }
              ],
              links: [
                { label: "Architecture Dashboard →", href: "arch/index.html" }
              ],
              meta: "5 scenes · risk: low · static HTML collection"
            },
            {
              icon:        "✅",
              title:       "Self-Check Automation Suite",
              badge:       "6 scenes",
              description: "Static site integrity verification · <strong>6 test scenes</strong> · link checking · asset validation · cross-site consistency",
              sceneLinks: [
                { label: "1. Post-Init Self-Check",     href: "test/scene-1-post-init-full-self-check/index.md" },
                { label: "2. Pre-Commit Self-Check",    href: "test/scene-2-pre-commit-incremental-self-check/index.md" },
                { label: "3. Doc Consistency",          href: "test/scene-3-doc-code-consistency/index.md" },
                { label: "4. Security Regression",      href: "test/scene-4-security-surface-regression/index.md" },
                { label: "5. Integration Regression",   href: "test/scene-5-cross-story-integration-regression/index.md" },
                { label: "6. Third-Party Services",     href: "test/scene-6-third-party-framework-service/index.md" }
              ],
              links: [
                { label: "Test Dashboard →", href: "test/index.html" }
              ],
              meta: "6 scenes · risk: low · all static validation"
            }
          ]
        }
      ]
    },

    // ── §3 · 主要网站模块 ────────────────────────────────
    {
      id:    "section-source",
      badge: "3",
      badgeTone: null,
      title: "Website Template Collection",
      meta:  "5 sites · 31 pages · 35 CSS · 62 JS · 41 fonts · 31 images",
      groups: [
        {
          id:    "site-adminto",
          kind:  "items",
          icon:  "🖥",
          title: "Adminto · Admin Dashboard (4.0 MB)",
          items: [
            { icon: "🏠", iconTone: "is-module", title: "index.html",          description: "Admin dashboard introduction · <strong>Bootstrap 5</strong>",       meta: "<span class=\"accent\">5 pages</span> · Websites/Adminto/" },
            { icon: "⚙️", iconTone: "is-module", title: "changelog.html",      description: "Version changelog · <strong>release history</strong>",              meta: "<span class=\"accent\">Page</span> · Websites/Adminto/" },
            { icon: "🎨", iconTone: "is-module", title: "customization.html",   description: "Customization guide · <strong>theme options</strong>",               meta: "<span class=\"accent\">Page</span> · Websites/Adminto/" },
            { icon: "🌐", iconTone: "is-module", title: "rtl.html",             description: "RTL layout support · <strong>right-to-left</strong>",                meta: "<span class=\"accent\">Page</span> · Websites/Adminto/" },
            { icon: "🔧", iconTone: "is-module", title: "setup.html",           description: "Setup guide · <strong>getting started</strong>",                     meta: "<span class=\"accent\">Page</span> · Websites/Adminto/" }
          ]
        },
        {
          id:    "site-dpmarket",
          kind:  "items",
          icon:  "🛒",
          title: "DpMarket · Digital Marketplace (3.8 MB)",
          items: [
            { icon: "🏠", iconTone: "is-module", title: "index.html",          description: "Digital marketplace landing · <strong>Bootstrap + Font Awesome</strong>", meta: "<span class=\"accent\">1 page</span> · Websites/DpMarket/" },
            { icon: "🎨", iconTone: "is-module", title: "style.css",            description: "Custom marketplace theme · <strong>responsive layout</strong>",      meta: "<span class=\"accent\">CSS</span> · Websites/DpMarket/css/" },
            { icon: "⚡", iconTone: "is-module", title: "script.js",            description: "Main site logic · <strong>jQuery nav & scroll</strong>",             meta: "<span class=\"accent\">JS</span> · Websites/DpMarket/js/" }
          ]
        },
        {
          id:    "site-kasy",
          kind:  "items",
          icon:  "💼",
          title: "Kasy · Business Landing (2.3 MB)",
          items: [
            { icon: "🏠", iconTone: "is-module", title: "index.html",          description: "Multi-purpose landing page · <strong>Bootstrap 5.1.3</strong>",    meta: "<span class=\"accent\">1 page</span> · Websites/Kasy/" },
            { icon: "🎨", iconTone: "is-module", title: "styles.css",           description: "Business theme styles · <strong>modern design</strong>",             meta: "<span class=\"accent\">CSS</span> · Websites/Kasy/css/" },
            { icon: "📝", iconTone: "is-module", title: "prettify.js",          description: "Code syntax prettifier · <strong>code samples</strong>",             meta: "<span class=\"accent\">JS</span> · Websites/Kasy/js/" }
          ]
        },
        {
          id:    "site-news",
          kind:  "items",
          icon:  "📰",
          title: "News · Magazine Template (6.6 MB)",
          items: [
            { icon: "🏠", iconTone: "is-module", title: "index.html",          description: "News magazine layout · <strong>Font Awesome 6 + Bootstrap</strong>", meta: "<span class=\"accent\">1 page</span> · Websites/News/" },
            { icon: "🎨", iconTone: "is-module", title: "main.css",             description: "Magazine theme · <strong>responsive grid</strong>",                  meta: "<span class=\"accent\">CSS</span> · Websites/News/assets/css/" },
            { icon: "💻", iconTone: "is-module", title: "SyntaxHighlighter",    description: "Code highlighting library · <strong>25+ language brushes</strong>",   meta: "<span class=\"accent\">Plugin</span> · Websites/News/assets/" },
            { icon: "⚡", iconTone: "is-module", title: "main.js",              description: "Magazine interactivity · <strong>jQuery + Bootstrap bundle</strong>",meta: "<span class=\"accent\">JS</span> · Websites/News/assets/js/" }
          ]
        },
        {
          id:    "site-prompt",
          kind:  "items",
          icon:  "🎯",
          title: "Prompt · UI Components Showcase (1.3 MB)",
          items: [
            { icon: "🏠", iconTone: "is-module", title: "index.html",          description: "Prompt landing page · <strong>Bootstrap 5.1.3</strong> · entry point", meta: "<span class=\"accent\">22 pages</span> · Websites/Prompt/" },
            { icon: "🧩", iconTone: "is-module", title: "bootstrap.html",       description: "Bootstrap components reference · <strong>core grid + utilities</strong>", meta: "<span class=\"accent\">Doc</span> · Websites/Prompt/" },
            { icon: "✨", iconTone: "is-module", title: "custom-heros.html",    description: "Hero section variations · <strong>AOS animations</strong>",         meta: "<span class=\"accent\">Demo</span> · Websites/Prompt/" },
            { icon: "🎠", iconTone: "is-module", title: "custom-swiper.html",   description: "Swiper carousel demos · <strong>touch slider</strong>",             meta: "<span class=\"accent\">Demo</span> · Websites/Prompt/" },
            { icon: "🖼", iconTone: "is-module", title: "custom-gallery.html",  description: "Image gallery demos · <strong>lightbox plugin</strong>",             meta: "<span class=\"accent\">Demo</span> · Websites/Prompt/" },
            { icon: "🚀", iconTone: "is-module", title: "quick-start.html",     description: "Quick start guide · <strong>build & compile steps</strong>",         meta: "<span class=\"accent\">Doc</span> · Websites/Prompt/" }
          ]
        }
      ]
    }
  ],

  footerLinks: [
    { label: "Adminto",       href: "Websites/Adminto/index.html",   targetBlank: true },
    { label: "DpMarket",     href: "Websites/DpMarket/index.html",   targetBlank: true },
    { label: "Kasy",         href: "Websites/Kasy/index.html",       targetBlank: true },
    { label: "News",         href: "Websites/News/index.html",       targetBlank: true },
    { label: "Prompt",       href: "Websites/Prompt/index.html",     targetBlank: true },
    { label: "Architecture", href: "arch/index.html",                targetBlank: true },
    { label: "Test Scenes",  href: "test/index.html",                targetBlank: true }
  ]
};
