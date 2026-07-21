/**
 * YiDoc · 项目仪表盘数据模型
 * --------------------------------------------------------------------------
 * yry-init pipeline step ③ 生成，由 profile + exploration 驱动。
 * 暴露为 window.HELP_CONFIG，供 index.js (Vue 3) 消费。
 *
 * 项目概述：
 *   YiDoc 是 YrY 生态的文档中枢，整合 6 个子项目（YiAi / YiH5 / YiPet /
 *   YiPot / YiWeb / Websites）的 yry-init 流水线报告。每个子项目包含
 *   完整的 detect → explore → generate → arch → verify 产出。
 */
window.HELP_CONFIG = {
  titleIcon:     "📚",
  title:         "YiDoc · YrY 项目文档中枢",
  tagline:       "6 个项目的 yry-init 流水线报告 · 68+ 架构 & 自检场景 · detect → explore → generate → arch → verify · 统一仪表盘 · 代码已重构消除冗余",
  backTopLabel:  "Back to Top",
  footerNote:    "由 yry-init 流水线自动生成 · detect → explore → generate → arch → verify · YiPet API 已修复对齐 YiAi 后端",

  // 面包屑导航栏
  breadcrumb: [
    { label: "YiDoc", href: "index.html" },
    { label: "Dashboard" }
  ],

  // 顶层 KPI 统计卡片
  stats: [
    { value: "6",   label: "Projects",          modifier: "accent", sub: "yry-init 报告" },
    { value: "68+", label: "Scenes",             modifier: "cyan",   sub: "arch + test" },
    { value: "500+",label: "Source Files",       modifier: "info",   sub: "全项目合计" },
    { value: "11",  label: "Tech Stacks",        modifier: "health", sub: "Python · JS · Rust · Vue" }
  ],

  // 跨面板导航工具栏
  panelHub: {
    label: { text: '📊', panel: 'reports', title: 'Report Dashboards' },
    targetBlank: true,
    buttons: [
      { icon: '🏛', name: 'Architecture',   desc: 'Architecture scenes',  color: 'var(--yry-accent)', panel: 'arch' },
      { icon: '🪢', name: 'Apis Report',   desc: 'Api health analysis',  color: 'var(--yry-violet)', panel: 'apis' },
      { icon: '📊', name: 'Files Report',   desc: 'Code health analysis',  color: 'var(--yry-violet)', panel: 'files' },
      { icon: '✅', name: 'Test Scenes',    desc: 'Self-check strategy',  color: 'var(--yry-cyan)',   panel: 'test', targetBlank: false },
      { icon: '📁', name: 'Projects',       desc: 'All project reports',  color: 'var(--yry-accent)', panel: 'projects' },
    ],
    flow: 'File Analysis → Project Reports → Arch Scenes → Test Verification',
    urls: {
      arch:       'arch/index.html',
      apis:      'apis/index.html',
      files:      'files/index.html',
      test:       'test/index.html',
      projects:   'projects/',
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
        summary: 'All 6 project yry-init pipelines completed. 66+ architecture and test scenes generated. YiAi (Python/FastAPI), YiH5 (Vanilla JS SPA), YiPet (Chrome Extension), YiPot (Tauri Desktop), YiWeb (Vue 3 SPA), Websites (14 static templates).',
        metrics: [
          { label: 'Window',    value: '1d',       tone: 'is-neutral' },
          { label: 'Projects',  value: '6',         tone: 'is-pass'   },
          { label: 'Scenes',    value: '66+',       tone: 'is-pass'   },
          { label: 'Arch',      value: '31 scenes', tone: 'is-pass'   },
          { label: 'Test',      value: '36 scenes', tone: 'is-pass'   },
          { label: 'Status',    value: 'All Pass',  tone: 'is-pass'   },
        ],
        tags: [
          { label: 'all-pass',  tone: 'is-pass' },
          { label: 'yry-init',  tone: 'is-info' },
        ],
        meta: '6 projects · 66+ scenes · all pipelines verified',
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

    // ── §3 · 项目 yry-init 报告总览 ─────────────────────
    {
      id:    "section-projects",
      badge: "3",
      badgeTone: null,
      title: "Project yry-init Reports",
      meta:  "6 projects · 68+ scenes · 500+ source files · 4 languages",
      groups: [
        {
          kind:  "stories",
          icon:  "📁",
          title: "Project Report Catalog",
          items: [
            {
              icon:        "🐍",
              title:       "YiAi · Python FastAPI Backend",
              badge:       "11 scenes",
              description: "AI 服务 API · <strong>FastAPI + MongoDB</strong> · 模块化执行引擎 · AI 对话 + RSS 订阅 + OSS 存储 · 47 源文件 · 19 运行时依赖",
              sceneLinks: [
                { label: "1. Module Location",         href: "projects/YiAi/arch/scene-1-module-location/index.md" },
                { label: "2. Data Flow Tracing",        href: "projects/YiAi/arch/scene-2-data-flow-tracing/index.md" },
                { label: "3. Newcomer Onboarding",     href: "projects/YiAi/arch/scene-3-newcomer-onboarding/index.md" },
                { label: "4. Dependency Impact",        href: "projects/YiAi/arch/scene-4-dependency-change-impact/index.md" },
                { label: "5. Security Surface",        href: "projects/YiAi/arch/scene-5-trust-boundary-security-surface/index.md" }
              ],
              links: [
                { label: "YiAi Data Model →", href: "projects/YiAi/data.js", target: "_blank" }
              ],
              meta: "5 arch + 6 test scenes · risk: medium · Python backend"
            },
            {
              icon:        "📱",
              title:       "YiH5 · Vanilla JS H5 Frontend",
              badge:       "11 scenes",
              description: "原生 JS SPA · <strong>会话管理 + AI 聊天 + 信息流</strong> · 9 组件 + 7 服务 · Mermaid 图表集成 · 38 源文件 · 3 外部库",
              sceneLinks: [
                { label: "1. Module Location",         href: "projects/YiH5/arch/scene-1-module-location/index.md" },
                { label: "2. Data Flow Tracing",        href: "projects/YiH5/arch/scene-2-data-flow-tracing/index.md" },
                { label: "3. Newcomer Onboarding",     href: "projects/YiH5/arch/scene-3-newcomer-onboarding/index.md" },
                { label: "4. Dependency Impact",        href: "projects/YiH5/arch/scene-4-dependency-change-impact/index.md" },
                { label: "5. Security Surface",        href: "projects/YiH5/arch/scene-5-trust-boundary-security-surface/index.md" }
              ],
              links: [
                { label: "YiH5 Data Model →", href: "projects/YiH5/data.js", target: "_blank" }
              ],
              meta: "5 arch + 6 test scenes · risk: low · Vanilla JS SPA"
            },
            {
              icon:        "🐾",
              title:       "YiPet · AI Chrome Extension",
              badge:       "12 scenes",
              description: "温柔陪伴助手 · <strong>Manifest V3</strong> · IIFE 模块化 · 26 CDN 组件 · 49 第三方库 · 275 源文件 · Markdown + Mermaid 渲染 · API 已修复 · 共享原型工具方法",
              sceneLinks: [
                { label: "1. Module Location",         href: "projects/YiPet/arch/scene-1-module-location/index.md" },
                { label: "2. Data Flow Tracing",        href: "projects/YiPet/arch/scene-2-data-flow-tracing/index.md" },
                { label: "3. Newcomer Onboarding",     href: "projects/YiPet/arch/scene-3-newcomer-onboarding/index.md" },
                { label: "4. Dependency Impact",        href: "projects/YiPet/arch/scene-4-dependency-change-impact/index.md" },
                { label: "5. Security Surface",        href: "projects/YiPet/arch/scene-5-trust-boundary-security-surface/index.md" }
              ],
              links: [
                { label: "YiPet Data Model →", href: "projects/YiPet/data.js", target: "_blank" }
              ],
              meta: "6 arch + 6 test scenes · risk: medium · Chrome Extension"
            },
            {
              icon:        "🖥",
              title:       "YiPot · Tauri Desktop Translation Tool",
              badge:       "12 scenes",
              description: "跨平台桌面翻译器 · <strong>Tauri + React</strong> · 21 翻译引擎 + 15 OCR 后端 + TTS · 55+ 源文件 · Rust 后端 + JSX 前端",
              sceneLinks: [
                { label: "1. Module Location",         href: "projects/YiPot/arch/scene-1-module-location/index.md" },
                { label: "2. Data Flow Tracing",        href: "projects/YiPot/arch/scene-2-data-flow-tracing/index.md" },
                { label: "3. Newcomer Onboarding",     href: "projects/YiPot/arch/scene-3-newcomer-onboarding/index.md" },
                { label: "4. Dependency Impact",        href: "projects/YiPot/arch/scene-4-dependency-change-impact/index.md" },
                { label: "5. Security Surface",        href: "projects/YiPot/arch/scene-5-trust-boundary-security-surface/index.md" },
                { label: "6. IPC & Window Lifecycle",  href: "projects/YiPot/arch/scene-6-ipc-window-lifecycle/index.md" }
              ],
              links: [
                { label: "YiPot Data Model →", href: "projects/YiPot/data.js", target: "_blank" }
              ],
              meta: "6 arch + 6 test scenes · risk: medium · Tauri fullstack"
            },
            {
              icon:        "🔍",
              title:       "YiWeb · AI Code Review Web Application",
              badge:       "12 scenes",
              description: "Vue 3 SPA · <strong>三个视图 (aicr / claude / story)</strong> · Hook 模式状态管理 · CDN 组件系统 · 95 源文件 · 3 视图 + 20 组件",
              sceneLinks: [
                { label: "1. Module Location",         href: "projects/YiWeb/arch/scene-1-module-location/index.md" },
                { label: "2. Data Flow Tracing",        href: "projects/YiWeb/arch/scene-2-data-flow-tracing/index.md" },
                { label: "3. Newcomer Onboarding",     href: "projects/YiWeb/arch/scene-3-newcomer-onboarding/index.md" },
                { label: "4. Dependency Impact",        href: "projects/YiWeb/arch/scene-4-dependency-change-impact/index.md" },
                { label: "5. Security Surface",        href: "projects/YiWeb/arch/scene-5-trust-boundary-security-surface/index.md" },
                { label: "6. View & Hook Lifecycle",   href: "projects/YiWeb/arch/scene-6-view-hook-lifecycle/index.md" }
              ],
              links: [
                { label: "YiWeb Data Model →", href: "projects/YiWeb/data.js", target: "_blank" }
              ],
              meta: "6 arch + 6 test scenes · risk: medium · Vue 3 SPA"
            },
            {
              icon:        "🌐",
              title:       "Websites · Static HTML Template Collection",
              badge:       "11 scenes",
              description: "14 独立静态 HTML 模板 · <strong>Bootstrap / Tailwind / jQuery / Swiper</strong> · 282 HTML 页面 · 39 CSS · 89 JS · 独立部署",
              sceneLinks: [
                { label: "1. Module Location",         href: "projects/Websites/arch/scene-1-module-location/index.md" },
                { label: "2. Data Flow Tracing",        href: "projects/Websites/arch/scene-2-data-flow-tracing/index.md" },
                { label: "3. Newcomer Onboarding",     href: "projects/Websites/arch/scene-3-newcomer-onboarding/index.md" },
                { label: "4. Dependency Impact",        href: "projects/Websites/arch/scene-4-dependency-change-impact/index.md" },
                { label: "5. Security Surface",        href: "projects/Websites/arch/scene-5-trust-boundary-security-surface/index.md" }
              ],
              links: [
                { label: "Websites Data Model →", href: "projects/Websites/data.js", target: "_blank" }
              ],
              meta: "5 arch + 6 test scenes · risk: low · Static HTML"
            }
          ]
        }
      ]
    },

    // ── §4 · 主要网站模块 ────────────────────────────────
    {
      id:    "section-source",
      badge: "4",
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
    { label: "YiAi Report",     href: "projects/YiAi/data.js",        targetBlank: true },
    { label: "YiH5 Report",     href: "projects/YiH5/data.js",        targetBlank: true },
    { label: "YiPet Report",    href: "projects/YiPet/data.js",       targetBlank: true },
    { label: "YiPot Report",    href: "projects/YiPot/data.js",       targetBlank: true },
    { label: "YiWeb Report",    href: "projects/YiWeb/data.js",       targetBlank: true },
    { label: "Websites Report", href: "projects/Websites/data.js",    targetBlank: true },
    { label: "Architecture",    href: "arch/index.html",              targetBlank: true },
    { label: "Test Scenes",     href: "test/index.html",              targetBlank: true }
  ]
};
