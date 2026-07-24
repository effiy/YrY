/**
 * YiDoc · 项目仪表盘数据模型
 * --------------------------------------------------------------------------
 * yry-init pipeline step ③ 生成，由 CLAUDE.md + README.md 驱动。
 * 暴露为 window.HELP_CONFIG，供 index.js (Vue 3) 消费。
 *
 * 项目概述：
 *   YiDoc 是 YrY 生态的文档中枢，整合 6 个子项目（YiAi / YiH5 /
 *   YiPet / YiPot / YiWeb / YiviY）的 yry-init 流水线报告。每个子项目包含
 *   完整的 detect → explore → generate → arch → verify 产出。
 *   共享 CDN 资源已迁移至 ../YiPet/cdn/ —— Vue 组件、样式、工具函数。
 *
 * 当前生成来源：
 *   - CLAUDE.md (2026-07-21) — 项目 profile、约束、架构模式
 *   - README.md (2026-07-21) — 系统概览、命令流、领域语言
 */
window.HELP_CONFIG = {
  titleIcon:     "📚",
  title:         "YiDoc · YrY 项目文档中枢",
  tagline:       "6 个项目的 yry-init 流水线报告 · 57+ 架构 & 自检场景 · 42 Adminto-style 文档页 · detect → explore → generate → arch → verify · 统一仪表盘",
  backTopLabel:  "Back to Top",
  footerNote:    "由 yry-init 流水线自动生成 · detect → explore → generate → arch → verify · 共享 CDN → ../YiPet/cdn/ · CLAUDE.md + README.md 已刷新",

  // 面包屑导航栏
  breadcrumb: [
    { label: "YiDoc", href: "../index.html" },
    { label: "Dashboard" }
  ],

  // 顶层 KPI 统计卡片
  stats: [
    { value: "6",   label: "Projects",          modifier: "accent", sub: "yry-init 报告" },
    { value: "57+", label: "Scenes",             modifier: "cyan",   sub: "arch + test" },
    { value: "42",  label: "Doc Pages",          modifier: "violet", sub: "6 sites · 7 pages each" },
    { value: "925+",label: "Source Files",       modifier: "info",   sub: "YiPet 527 + YiPot 324 + YiviY 74" },
    { value: "12",  label: "Tech Stacks",        modifier: "health", sub: "Python · JS · Rust · Vue · Tauri" }
  ],

  // 跨面板导航工具栏
  panelHub: {
    label: { text: '📊', panel: 'reports', title: 'Report Dashboards' },
    targetBlank: true,
    buttons: [
      { icon: '📁', name: 'Projects',       desc: 'All project reports',  color: 'var(--yry-accent)', panel: 'projects' },
    ],
    flow: 'Project Reports → Arch Scenes → Test Verification',
    urls: {
      projects:   '../projects/',
    },
  },

  // Reports 浮动面板数据（按日期组织 · 每日期一份报告含全部项目）
  reportsList: {
    daily: [
      {
        date:    '2026-07-24',
        label:   '2026-07-24',
        title:   'YrY · Daily CTO Report',
        href:    '../reports/daily/index.html?date=2026-07-24',
        status:  'verified',
        summary: '7 个项目 · 1d 窗口 · YiDoc/YiAi/YiH5/YiPet/YiPot/YiWeb/YiviY · 统一模板 · 仅更新当天 data.js',
        metrics: [
          { label: 'Window',    value: '1d',       tone: 'is-neutral' },
          { label: 'Projects',  value: '7',        tone: 'is-pass'   },
          { label: 'Commits',   value: '7',        tone: 'is-pass'   },
          { label: 'Date',      value: '07-24',    tone: 'is-neutral' },
        ],
        tags: [
          { label: 'all-projects', tone: 'is-info' },
          { label: 'single-day',   tone: 'is-pass' },
          { label: 'unified-tpl',  tone: 'is-info' },
        ],
        meta: '7 projects · 1d window · 2026-07-24',
      },
      {
        date:    '2026-07-23',
        label:   '2026-07-23',
        title:   'YrY · Daily CTO Report',
        href:    '../reports/daily/index.html?date=2026-07-23',
        status:  'verified',
        summary: '7 个项目 · 1d 窗口 · YiDoc/YiAi/YiH5/YiPet/YiPot/YiWeb/YiviY · 统一模板 · 仅更新当天 data.js',
        metrics: [
          { label: 'Window',    value: '1d',       tone: 'is-neutral' },
          { label: 'Projects',  value: '7',        tone: 'is-pass'   },
          { label: 'Commits',   value: '46+',      tone: 'is-pass'   },
          { label: 'Date',      value: '07-23',    tone: 'is-neutral' },
        ],
        tags: [
          { label: 'all-projects', tone: 'is-info' },
          { label: 'single-day',   tone: 'is-pass' },
          { label: 'unified-tpl',  tone: 'is-info' },
        ],
        meta: '7 projects · 1d window · 2026-07-23',
      },
    ],
    weekly: [],
    monthly: [],
  },

  // ── §1 · 项目 yry-init 报告总览 ─────────────────────
  sections: [
    {
      id:    "section-projects",
      badge: "1",
      badgeTone: null,
      title: "Project yry-init Reports",
      meta:  "6 projects · 57+ scenes · 925+ source files · 5 languages (Python · JS · Rust · Vue · HTML)",
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
                { label: "1. Module Location",         href: "../projects/YiAi/arch/scene-1-module-location/index.md" },
                { label: "2. Data Flow Tracing",        href: "../projects/YiAi/arch/scene-2-data-flow-tracing/index.md" },
                { label: "3. Newcomer Onboarding",     href: "../projects/YiAi/arch/scene-3-newcomer-onboarding/index.md" },
                { label: "4. Dependency Impact",        href: "../projects/YiAi/arch/scene-4-dependency-change-impact/index.md" },
                { label: "5. Security Surface",        href: "../projects/YiAi/arch/scene-5-trust-boundary-security-surface/index.md" }
              ],
              links: [
                { label: "YiAi Data Model →", href: "../projects/YiAi/data.js", target: "_blank" },
                { label: "Story Report →",    href: "../projects/YiAi/story/index.html" }
              ],
              meta: "5 arch + 6 test scenes · risk: medium · Python backend"
            },
            {
              icon:        "📱",
              title:       "YiH5 · Vanilla JS H5 Frontend",
              badge:       "11 scenes",
              description: "原生 JS SPA · <strong>会话管理 + AI 聊天 + 信息流</strong> · 9 组件 + 7 服务 · Mermaid 图表集成 · 38 源文件 · 3 外部库",
              sceneLinks: [
                { label: "1. Module Location",         href: "../projects/YiH5/arch/scene-1-module-location/index.md" },
                { label: "2. Data Flow Tracing",        href: "../projects/YiH5/arch/scene-2-data-flow-tracing/index.md" },
                { label: "3. Newcomer Onboarding",     href: "../projects/YiH5/arch/scene-3-newcomer-onboarding/index.md" },
                { label: "4. Dependency Impact",        href: "../projects/YiH5/arch/scene-4-dependency-change-impact/index.md" },
                { label: "5. Security Surface",        href: "../projects/YiH5/arch/scene-5-trust-boundary-security-surface/index.md" }
              ],
              links: [
                { label: "YiH5 Data Model →", href: "../projects/YiH5/data.js", target: "_blank" },
                { label: "Story Report →",    href: "../projects/YiH5/story/index.html" }
              ],
              meta: "5 arch + 6 test scenes · risk: low · Vanilla JS SPA"
            },
            {
              icon:        "🐾",
              title:       "YiPet · AI Chrome Extension",
              badge:       "12 scenes",
              description: "温柔陪伴助手 · <strong>Manifest V3</strong> · IIFE 模块化 · YiPet/cdn/ 共享组件体系 · 49 CDN 资源库 · 275 源文件 · Markdown + Mermaid 渲染 · 共享原型工具方法 · CDN 已迁移至 cdn/ 顶层",
              sceneLinks: [
                { label: "1. Module Location",         href: "../projects/YiPet/arch/scene-1-module-location/index.md" },
                { label: "2. Data Flow Tracing",        href: "../projects/YiPet/arch/scene-2-data-flow-tracing/index.md" },
                { label: "3. Newcomer Onboarding",     href: "../projects/YiPet/arch/scene-3-newcomer-onboarding/index.md" },
                { label: "4. Dependency Impact",        href: "../projects/YiPet/arch/scene-4-dependency-change-impact/index.md" },
                { label: "5. Security Surface",        href: "../projects/YiPet/arch/scene-5-trust-boundary-security-surface/index.md" }
              ],
              links: [
                { label: "YiPet Data Model →", href: "../projects/YiPet/data.js", target: "_blank" },
                { label: "Story Report →",    href: "../projects/YiPet/story/index.html" }
              ],
              meta: "6 arch + 6 test scenes · risk: medium · Chrome Extension"
            },
            {
              icon:        "🖥",
              title:       "YiPot · Tauri Desktop Translation Tool",
              badge:       "12 scenes",
              description: "跨平台桌面翻译器 · <strong>Tauri + React</strong> · 21 翻译引擎 + 15 OCR 后端 + TTS · 55+ 源文件 · Rust 后端 + JSX 前端",
              sceneLinks: [
                { label: "1. Module Location",         href: "../projects/YiPot/arch/scene-1-module-location/index.md" },
                { label: "2. Data Flow Tracing",        href: "../projects/YiPot/arch/scene-2-data-flow-tracing/index.md" },
                { label: "3. Newcomer Onboarding",     href: "../projects/YiPot/arch/scene-3-newcomer-onboarding/index.md" },
                { label: "4. Dependency Impact",        href: "../projects/YiPot/arch/scene-4-dependency-change-impact/index.md" },
                { label: "5. Security Surface",        href: "../projects/YiPot/arch/scene-5-trust-boundary-security-surface/index.md" },
                { label: "6. IPC & Window Lifecycle",  href: "../projects/YiPot/arch/scene-6-ipc-window-lifecycle/index.md" }
              ],
              links: [
                { label: "YiPot Data Model →", href: "../projects/YiPot/data.js", target: "_blank" },
                { label: "Story Report →",    href: "../projects/YiPot/story/index.html" }
              ],
              meta: "6 arch + 6 test scenes · risk: medium · Tauri fullstack"
            },
            {
              icon:        "🔍",
              title:       "YiWeb · AI Code Review Web Application",
              badge:       "12 scenes",
              description: "Vue 3 SPA · <strong>三个视图 (aicr / claude / story)</strong> · Hook 模式状态管理 · CDN 组件系统 · 95 源文件 · 3 视图 + 20 组件",
              sceneLinks: [
                { label: "1. Module Location",         href: "../projects/YiWeb/arch/scene-1-module-location/index.md" },
                { label: "2. Data Flow Tracing",        href: "../projects/YiWeb/arch/scene-2-data-flow-tracing/index.md" },
                { label: "3. Newcomer Onboarding",     href: "../projects/YiWeb/arch/scene-3-newcomer-onboarding/index.md" },
                { label: "4. Dependency Impact",        href: "../projects/YiWeb/arch/scene-4-dependency-change-impact/index.md" },
                { label: "5. Security Surface",        href: "../projects/YiWeb/arch/scene-5-trust-boundary-security-surface/index.md" },
                { label: "6. View & Hook Lifecycle",   href: "../projects/YiWeb/arch/scene-6-view-hook-lifecycle/index.md" }
              ],
              links: [
                { label: "YiWeb Data Model →", href: "../projects/YiWeb/data.js", target: "_blank" },
                { label: "Story Report →",    href: "../projects/YiWeb/story/index.html" }
              ],
              meta: "6 arch + 6 test scenes · risk: medium · Vue 3 SPA"
            },
            {
              icon:        "🎬",
              title:       "YiviY · Python Video Translation & Dubbing Platform",
              badge:       "NEW",
              description: "视频翻译配音工作台 · <strong>Streamlit + 12 步流水线</strong> · ASR / 句切分 / 摘要 / 翻译 / TTS / 合成 · WhisperX · Replicate · 74 源文件 · 双语文本库",
              sceneLinks: [
                { label: "1. Pipeline (st.py)",            href: "../../YiviY/st.py", target: "_blank" },
                { label: "2. Core (12 步流水线)",          href: "../../YiviY/core/", target: "_blank" },
                { label: "3. ASR / TTS Backends",          href: "../../YiviY/core/asr_backend/", target: "_blank" },
                { label: "4. Translations & Batch",        href: "../../YiviY/translations/", target: "_blank" }
              ],
              links: [
                { label: "Source Root →",             href: "../../YiviY/",                target: "_blank" },
                { label: "Streamlit UI (st.py)",       href: "../../YiviY/st.py",            target: "_blank" },
                { label: "Story Report →",             href: "../projects/YiviY/story/index.html" }
              ],
              meta: "no yry-init scenes yet · risk: medium · Python Streamlit · 74 source files"
            }
          ]
        },
        {
          id:    "claude-pipeline",
          kind:  "stories",
          icon:  "⚙️",
          title: ".claude/ Pipeline Engine · yry-init Skill System",
          items: [
            {
              icon:        "🧩",
              title:       "Skill Orchestration Root",
              badge:       "5 skills",
              description: "Pipeline 源头 · <strong>.claude/skills/</strong> 下托管 yry-init / yry-test / yry-code / yry-reports / yry-tools 五个 Skill · 共享 pipelineState 对象 · 由 /yry-init 触发全量重建",
              sceneLinks: [
                { label: "yry-init · SKILL.md",      href: "../../.claude/skills/yry-init/SKILL.md", target: "_blank" },
                { label: "yry-test · SKILL.md",      href: "../../.claude/skills/yry-test/SKILL.md", target: "_blank" },
                { label: "Orchestration Safety",     href: "../../.claude/skills/yry-init/rules/orchestration-safety.md", target: "_blank" },
                { label: "Pipeline Contracts",       href: "../../.claude/skills/yry-init/rules/pipeline-contracts.md", target: "_blank" }
              ],
              links: [
                { label: ".claude/skills/ →", href: "../../.claude/skills/", target: "_blank" }
              ],
              meta: "5 skills · 221 dirs · 534 .md · 81 .json · 5.9 MB"
            },
            {
              icon:        "🔢",
              title:       "01-detect · Project Profile",
              badge:       "5 artifacts",
              description: "识别项目类型 · <strong>manifest-parser + project-classifier</strong> 双 Agent · 决策树 + ecosystem 清单 · 输出 profile-output.json · 识别 Python/Node/Tauri/Extension/HTML 五类生态",
              sceneLinks: [
                { label: "STEP.md",                    href: "../../.claude/skills/yry-init/steps/01-detect/STEP.md", target: "_blank" },
                { label: "detection-decision-tree.md", href: "../../.claude/skills/yry-init/steps/01-detect/references/detection-decision-tree.md", target: "_blank" },
                { label: "ecosystem-manifests.md",     href: "../../.claude/skills/yry-init/steps/01-detect/references/ecosystem-manifests.md", target: "_blank" },
                { label: "profile-output.json",        href: "../../.claude/skills/yry-init/steps/01-detect/templates/profile-output.json", target: "_blank" }
              ],
              meta: "2 agents · 2 references · 2 rules · 1 template"
            },
            {
              icon:        "🗺️",
              title:       "02-explore · Module Graph",
              badge:       "5 artifacts",
              description: "构建模块依赖图 · <strong>module-graph-builder + convention-detector</strong> · 图算法 + 导入解析 · 输出 exploration-output.json · 支撑后续场景生成的事实基础",
              sceneLinks: [
                { label: "STEP.md",                 href: "../../.claude/skills/yry-init/steps/02-explore/STEP.md", target: "_blank" },
                { label: "module-map-schema.md",    href: "../../.claude/skills/yry-init/steps/02-explore/references/module-map-schema.md", target: "_blank" },
                { label: "graph-algorithms.md",     href: "../../.claude/skills/yry-init/steps/02-explore/references/graph-algorithms.md", target: "_blank" },
                { label: "exploration-output.json",  href: "../../.claude/skills/yry-init/steps/02-explore/templates/exploration-output.json", target: "_blank" }
              ],
              meta: "2 agents · 2 references · 2 rules · 1 template"
            },
            {
              icon:        "📝",
              title:       "03-generate · CLAUDE.md + README.md + Dashboard",
              badge:       "6 artifacts",
              description: "文档生成 · <strong>template-renderer + document-validator</strong> · 原则溯源 + 输出所有权 · 全量重写 CLAUDE.md / README.md / YiDoc dashboard (index.html/css/js + data.js)",
              sceneLinks: [
                { label: "STEP.md",                href: "../../.claude/skills/yry-init/steps/03-generate/STEP.md", target: "_blank" },
                { label: "doc-templates.md",       href: "../../.claude/skills/yry-init/steps/03-generate/references/doc-templates.md", target: "_blank" },
                { label: "principle-sources.md",   href: "../../.claude/skills/yry-init/steps/03-generate/references/principle-sources.md", target: "_blank" },
                { label: "output-manifest.json",   href: "../../.claude/skills/yry-init/steps/03-generate/templates/output-manifest.json", target: "_blank" },
                { label: "output-ownership.md",    href: "../../.claude/skills/yry-init/steps/03-generate/rules/output-ownership.md", target: "_blank" }
              ],
              meta: "2 agents · 2 references · 2 rules · 1 template · drives dashboard rebuild"
            },
            {
              icon:        "🏛",
              title:       "04-arch · Scene Story Trees",
              badge:       "5 artifacts",
              description: "架构/自检场景生成 · <strong>scene-builder + scene-validator</strong> · 场景目录约束 + 故事树契约 · 输出 arch/ 与 test/ 双故事树 · 每场景遵循 §0–§4 生命周期",
              sceneLinks: [
                { label: "STEP.md",                   href: "../../.claude/skills/yry-init/steps/04-arch/STEP.md", target: "_blank" },
                { label: "scene-catalog.md",          href: "../../.claude/skills/yry-init/steps/04-arch/references/scene-catalog.md", target: "_blank" },
                { label: "self-test-scenes.md",       href: "../../.claude/skills/yry-init/steps/04-arch/references/self-test-scenes.md", target: "_blank" },
                { label: "story-generation-contracts.md", href: "../../.claude/skills/yry-init/steps/04-arch/rules/story-generation-contracts.md", target: "_blank" }
              ],
              meta: "2 agents · 2 references · 2 rules · 1 template"
            },
            {
              icon:        "✅",
              title:       "05-verify · Check & Diagnose",
              badge:       "5 artifacts",
              description: "一致性校验闭环 · <strong>check-runner + failure-diagnoser</strong> · 验证契约 + 失败升级 · 输出 verify-result.json · 失败时由 pipeline-diagnoser 介入定位",
              sceneLinks: [
                { label: "STEP.md",                   href: "../../.claude/skills/yry-init/steps/05-verify/STEP.md", target: "_blank" },
                { label: "check-catalog.md",          href: "../../.claude/skills/yry-init/steps/05-verify/references/check-catalog.md", target: "_blank" },
                { label: "integration-points.md",     href: "../../.claude/skills/yry-init/steps/05-verify/references/integration-points.md", target: "_blank" },
                { label: "verify-result.json",        href: "../../.claude/skills/yry-init/steps/05-verify/templates/verify-result.json", target: "_blank" }
              ],
              meta: "2 agents · 2 references · 2 rules · 1 template"
            },
            {
              icon:        "🧪",
              title:       "yry-test · 12-Topic Knowledge Navigator",
              badge:       "12 topics",
              description: "测试知识路由 · 合并 12 源 Skill (vitest-setup / runner-choice / e2e-playwright / fixture / async-flush / async-component / suspense / composable-wrapper / pinia-setup / teleport / blackbox / no-snapshot) · 主题路由式参考",
              sceneLinks: [
                { label: "SKILL.md",         href: "../../.claude/skills/yry-test/SKILL.md", target: "_blank" },
                { label: "references/index.md",  href: "../../.claude/skills/yry-test/references/index.md", target: "_blank" },
                { label: "references/index.json", href: "../../.claude/skills/yry-test/references/index.json", target: "_blank" },
                { label: "evals.json",       href: "../../.claude/skills/yry-test/evals/evals.json", target: "_blank" }
              ],
              meta: "12 topics · Vue 3 + HTML test reference · consolidated from 12 source skills"
            }
          ]
        }
      ]
    },

    // ── §2 · 项目源码导航 ─────────────────────────────────
    {
      id:    "section-source",
      badge: "2",
      badgeTone: null,
      title: "Project Source Navigator",
      meta:  "6 sites · 42 doc pages · 7 pages each · verified links · shared templates/docs layer",
      groups: [
        {
          id:    "site-yipet",
          kind:  "items",
          icon:  "🐾",
          title: "YiPet · AI Chrome Extension (25 MB · 527 files · 7 HTML pages)",
          items: [
            { icon: "🏠", iconTone: "is-module", title: "Introduction",  description: "YiPet overview · <strong>Manifest V3 Chrome Extension</strong> · AI companion + FAQ knowledge base + Markdown/Mermaid rendering",        meta: "<span class=\"accent\">index</span> · YiPet/docs/",                  href: "../projects/YiPet/docs/index.html",          targetBlank: true },
            { icon: "⚙️", iconTone: "is-module", title: "Setup",          description: "Installation & loading · <strong>Load unpacked extension</strong> · developer workflow & debugging",   meta: "<span class=\"accent\">guide</span> · YiPet/docs/",                  href: "../projects/YiPet/docs/setup.html",          targetBlank: true },
            { icon: "📐", iconTone: "is-module", title: "Specifications", description: "File structure · <strong>core/ · modules/ · cdn/</strong> · 527 files inventory · manifest.json reference",        meta: "<span class=\"accent\">spec</span> · YiPet/docs/",                   href: "../projects/YiPet/docs/specifications.html", targetBlank: true },
            { icon: "🎨", iconTone: "is-module", title: "Customization",  description: "API endpoints & themes · <strong>config.js customization</strong> · Pet appearance · FAQ cache strategy", meta: "<span class=\"accent\">guide</span> · YiPet/docs/",                  href: "../projects/YiPet/docs/customization.html",  targetBlank: true },
            { icon: "🧩", iconTone: "is-module", title: "Modules",            description: "Module architecture · <strong>core/ · modules/ · cdn/</strong> · 3-layer structure · IIFE loading order",               meta: "<span class=\"accent\">modules</span> · YiPet/docs/",                href: "../projects/YiPet/docs/modules.html",            targetBlank: true },
            { icon: "❓", iconTone: "is-module", title: "FAQ",            description: "Frequently asked questions · <strong>troubleshooting</strong> · AI dialog · Pet customization · MV3 vs V2",            meta: "<span class=\"accent\">help</span> · YiPet/docs/",                   href: "../projects/YiPet/docs/faq.html",            targetBlank: true },
            { icon: "📋", iconTone: "is-module", title: "Changelog",      description: "Version history · <strong>v1.1.2 → v1.0</strong> · MV3 migration · CDN migration · Mermaid support",          meta: "<span class=\"accent\">log</span> · YiPet/docs/",                    href: "../projects/YiPet/docs/changelog.html",      targetBlank: true }
          ]
        },
        {
          id:    "site-yipot",
          kind:  "items",
          icon:  "🖥",
          title: "YiPot · Tauri Desktop Translator (20 MB · 324 files · 7 HTML pages)",
          items: [
            { icon: "🏠", iconTone: "is-module", title: "Introduction",  description: "YiPot overview · <strong>Tauri + React desktop app</strong> · cross-platform screen translator · OCR + TTS",        meta: "<span class=\"accent\">index</span> · YiPot/docs/",                  href: "../projects/YiPot/docs/index.html",          targetBlank: true },
            { icon: "⚙️", iconTone: "is-module", title: "Setup",          description: "Build & install · <strong>Tauri CLI + Rust toolchain</strong> · cargo build · platform packaging",   meta: "<span class=\"accent\">guide</span> · YiPot/docs/",                  href: "../projects/YiPot/docs/setup.html",          targetBlank: true },
            { icon: "📐", iconTone: "is-module", title: "Specifications", description: "Architecture · <strong>src/ · src-tauri/ · 324 files</strong> · React + Tauri IPC · Cargo.toml reference",        meta: "<span class=\"accent\">spec</span> · YiPot/docs/",                   href: "../projects/YiPot/docs/specifications.html", targetBlank: true },
            { icon: "🎨", iconTone: "is-module", title: "Customization",  description: "Theme & plugin config · <strong>TTS / OCR / translate providers</strong> · config panel · shortcut keys", meta: "<span class=\"accent\">guide</span> · YiPot/docs/",                  href: "../projects/YiPot/docs/customization.html",  targetBlank: true },
            { icon: "🪟", iconTone: "is-module", title: "Windows",        description: "Multi-window architecture · <strong>Config · Recognize · Screenshot · Translate · Updater</strong> · one window per task",               meta: "<span class=\"accent\">windows</span> · YiPot/docs/",                href: "../projects/YiPot/docs/windows.html",            targetBlank: true },
            { icon: "❓", iconTone: "is-module", title: "FAQ",            description: "Frequently asked questions · <strong>troubleshooting</strong> · Tauri crashes · OCR accuracy · TTS voices",            meta: "<span class=\"accent\">help</span> · YiPot/docs/",                   href: "../projects/YiPot/docs/faq.html",            targetBlank: true },
            { icon: "📋", iconTone: "is-module", title: "Changelog",      description: "Version history · <strong>v3.0.7 → v1.x</strong> · Tauri v2 migration · React 18 upgrade · plugin system",          meta: "<span class=\"accent\">log</span> · YiPot/docs/",                    href: "../projects/YiPot/docs/changelog.html",      targetBlank: true }
          ]
        },
        {
          id:    "site-yviy",
          kind:  "items",
          icon:  "🎬",
          title: "YiviY · Video Translation & Dubbing (592 KB · 74 files · 7 HTML pages)",
          items: [
            { icon: "🏠", iconTone: "is-module", title: "Introduction",  description: "YiviY overview · <strong>Streamlit + 12-step pipeline</strong> · ASR / translation / TTS / dubbing · Docker + Colab",        meta: "<span class=\"accent\">index</span> · YiviY/docs/",                  href: "../projects/YiviY/docs/index.html",          targetBlank: true },
            { icon: "⚙️", iconTone: "is-module", title: "Setup",          description: "Installation guide · <strong>pip install + Docker</strong> · CUDA 12.4 GPU setup · config.yaml configuration",   meta: "<span class=\"accent\">guide</span> · YiviY/docs/",                  href: "../projects/YiviY/docs/setup.html",          targetBlank: true },
            { icon: "📐", iconTone: "is-module", title: "Specifications", description: "Project structure · <strong>core/ · translations/ · batch/</strong> · 74 files · tech stack inventory",        meta: "<span class=\"accent\">spec</span> · YiviY/docs/",                   href: "../projects/YiviY/docs/specifications.html", targetBlank: true },
            { icon: "🎨", iconTone: "is-module", title: "Customization",  description: "Backend & config · <strong>ASR / TTS / LLM provider switching</strong> · glossary · prompt tuning", meta: "<span class=\"accent\">guide</span> · YiviY/docs/",                  href: "../projects/YiviY/docs/customization.html",  targetBlank: true },
            { icon: "🔁", iconTone: "is-module", title: "Pipeline",       description: "12-step pipeline detail · <strong>yt-dlp → ASR → NLP split → translate → subtitle → TTS → merge → output</strong> · step-level debugging",               meta: "<span class=\"accent\">pipeline</span> · YiviY/docs/",               href: "../projects/YiviY/docs/pipeline.html",            targetBlank: true },
            { icon: "❓", iconTone: "is-module", title: "FAQ",            description: "Frequently asked questions · <strong>GPU-free mode · translation quality · batch processing</strong> · Docker config",            meta: "<span class=\"accent\">help</span> · YiviY/docs/",                   href: "../projects/YiviY/docs/faq.html",            targetBlank: true },
            { icon: "📋", iconTone: "is-module", title: "Changelog",      description: "Version history · <strong>v1.0 → v0.1</strong> · WhisperX · multi-TTS · Streamlit UI · Docker deployment",          meta: "<span class=\"accent\">log</span> · YiviY/docs/",                    href: "../projects/YiviY/docs/changelog.html",      targetBlank: true }
          ]
        },
        {
          id:    "site-yiai",
          kind:  "items",
          icon:  "🤖",
          title: "YiAi · FastAPI + MongoDB Backend (7 HTML pages)",
          items: [
            { icon: "🏠", iconTone: "is-module", title: "Introduction",  description: "YiAi overview · <strong>FastAPI + MongoDB async backend</strong> · AI module execution · SSE streaming · file upload",        meta: "<span class=\"accent\">index</span> · YiAi/docs/",                  href: "../projects/YiAi/docs/index.html",          targetBlank: true },
            { icon: "⚙️", iconTone: "is-module", title: "Setup",          description: "Installation · <strong>Python 3.10+ · MongoDB 6.0+</strong> · venv · pip · uvicorn · Docker optional",   meta: "<span class=\"accent\">guide</span> · YiAi/docs/",                  href: "../projects/YiAi/docs/setup.html",          targetBlank: true },
            { icon: "📐", iconTone: "is-module", title: "Specifications", description: "Project structure · <strong>api/ · core/ · models/ · services/</strong> · tech stack · source code map",        meta: "<span class=\"accent\">spec</span> · YiAi/docs/",                   href: "../projects/YiAi/docs/specifications.html", targetBlank: true },
            { icon: "🎨", iconTone: "is-module", title: "Customization",  description: "Config & theme · <strong>config.yaml · CSS variables · layout.js shim</strong> · extension recipes", meta: "<span class=\"accent\">guide</span> · YiAi/docs/",                  href: "../projects/YiAi/docs/customization.html",  targetBlank: true },
            { icon: "🔌", iconTone: "is-module", title: "Endpoints",      description: "API catalog · <strong>13 REST endpoints</strong> · X-Token auth · SSE · error codes · rate limiting",               meta: "<span class=\"accent\">api</span> · YiAi/docs/",                    href: "../projects/YiAi/docs/endpoints.html",      targetBlank: true },
            { icon: "❓", iconTone: "is-module", title: "FAQ",            description: "Frequently asked questions · <strong>General · Development · Troubleshooting · Security</strong> · 15+ Q&A",            meta: "<span class=\"accent\">help</span> · YiAi/docs/",                   href: "../projects/YiAi/docs/faq.html",            targetBlank: true },
            { icon: "📋", iconTone: "is-module", title: "Changelog",      description: "Version history · <strong>v1.0.0 → v0.1</strong> · semver badges · migration notes · feat/fix/refactor",          meta: "<span class=\"accent\">log</span> · YiAi/docs/",                    href: "../projects/YiAi/docs/changelog.html",      targetBlank: true }
          ]
        },
        {
          id:    "site-yih5",
          kind:  "items",
          icon:  "📱",
          title: "YiH5 · Vanilla JS H5 Frontend (7 HTML pages)",
          items: [
            { icon: "🏠", iconTone: "is-module", title: "Introduction",  description: "YiH5 overview · <strong>Vanilla JS H5 frontend</strong> · IIFE modular · shared CDN components · zero-build",        meta: "<span class=\"accent\">index</span> · YiH5/docs/",                  href: "../projects/YiH5/docs/index.html",          targetBlank: true },
            { icon: "⚙️", iconTone: "is-module", title: "Setup",          description: "Installation · <strong>Node 18+ · npm install</strong> · dev server · static file serving",   meta: "<span class=\"accent\">guide</span> · YiH5/docs/",                  href: "../projects/YiH5/docs/setup.html",          targetBlank: true },
            { icon: "📐", iconTone: "is-module", title: "Specifications", description: "Project structure · <strong>pages/ · components/ · utils/</strong> · tech stack · source map",        meta: "<span class=\"accent\">spec</span> · YiH5/docs/",                   href: "../projects/YiH5/docs/specifications.html", targetBlank: true },
            { icon: "🎨", iconTone: "is-module", title: "Customization",  description: "Theme & config · <strong>CSS variables · .env · layout.js shim</strong> · extension recipes", meta: "<span class=\"accent\">guide</span> · YiH5/docs/",                  href: "../projects/YiH5/docs/customization.html",  targetBlank: true },
            { icon: "📄", iconTone: "is-module", title: "Pages",          description: "H5 page catalog · <strong>7 routes</strong> · chat · news · search · session · preview · content · loading order",               meta: "<span class=\"accent\">pages</span> · YiH5/docs/",                  href: "../projects/YiH5/docs/pages.html",          targetBlank: true },
            { icon: "❓", iconTone: "is-module", title: "FAQ",            description: "Frequently asked questions · <strong>General · Development · Troubleshooting · Security</strong> · 15+ Q&A",            meta: "<span class=\"accent\">help</span> · YiH5/docs/",                   href: "../projects/YiH5/docs/faq.html",            targetBlank: true },
            { icon: "📋", iconTone: "is-module", title: "Changelog",      description: "Version history · <strong>v1.2.0 → v0.1</strong> · semver badges · migration notes · feat/fix/refactor",          meta: "<span class=\"accent\">log</span> · YiH5/docs/",                    href: "../projects/YiH5/docs/changelog.html",      targetBlank: true }
          ]
        },
        {
          id:    "site-yiweb",
          kind:  "items",
          icon:  "🌐",
          title: "YiWeb · Vue 3 SPA (7 HTML pages)",
          items: [
            { icon: "🏠", iconTone: "is-module", title: "Introduction",  description: "YiWeb overview · <strong>Vue 3 + Vite SPA</strong> · Vue Router 4 · Pinia · component-based architecture",        meta: "<span class=\"accent\">index</span> · YiWeb/docs/",                  href: "../projects/YiWeb/docs/index.html",          targetBlank: true },
            { icon: "⚙️", iconTone: "is-module", title: "Setup",          description: "Installation · <strong>Node 18+ · npm install · Vite dev server</strong> · HMR · build",   meta: "<span class=\"accent\">guide</span> · YiWeb/docs/",                  href: "../projects/YiWeb/docs/setup.html",          targetBlank: true },
            { icon: "📐", iconTone: "is-module", title: "Specifications", description: "Project structure · <strong>views/ · components/ · composables/ · stores/</strong> · tech stack",        meta: "<span class=\"accent\">spec</span> · YiWeb/docs/",                   href: "../projects/YiWeb/docs/specifications.html", targetBlank: true },
            { icon: "🎨", iconTone: "is-module", title: "Customization",  description: "Theme & config · <strong>CSS variables · .env · vite.config.js · layout.js shim</strong>", meta: "<span class=\"accent\">guide</span> · YiWeb/docs/",                  href: "../projects/YiWeb/docs/customization.html",  targetBlank: true },
            { icon: "🛣", iconTone: "is-module", title: "Routes",         description: "Vue Router catalog · <strong>7 routes · lazy loading · navigation guards · meta fields</strong>",               meta: "<span class=\"accent\">routes</span> · YiWeb/docs/",                href: "../projects/YiWeb/docs/routes.html",        targetBlank: true },
            { icon: "❓", iconTone: "is-module", title: "FAQ",            description: "Frequently asked questions · <strong>General · Development · Troubleshooting · Security</strong> · 15+ Q&A",            meta: "<span class=\"accent\">help</span> · YiWeb/docs/",                   href: "../projects/YiWeb/docs/faq.html",            targetBlank: true },
            { icon: "📋", iconTone: "is-module", title: "Changelog",      description: "Version history · <strong>v2.4.0 → v0.1</strong> · semver badges · migration notes · feat/fix/refactor",          meta: "<span class=\"accent\">log</span> · YiWeb/docs/",                    href: "../projects/YiWeb/docs/changelog.html",      targetBlank: true }
          ]
        }
      ]
    },
    // ── §3 · 共享 CDN 资源体系 (YiPet/cdn/) ─────────────────
    {
      id:    "section-cdn",
      badge: "3",
      badgeTone: null,
      title: "Shared CDN Resource System",
      meta:  "52 components · 49 vendors · 12 util modules · 3 render engines · 4 style layers",
      groups: [
        {
          id:    "cdn-components",
          kind:  "items",
          icon:  "🧩",
          title: "Component System (52 Web Components)",
          items: [
            { icon: "🔘", iconTone: "is-module", title: "YrYButton · YrYIconButton", description: "Primary & icon button components — <strong>variant, size, disabled states</strong> · click/keyboard handlers", meta: "<span class=\"accent\">buttons/</span> · 2 packages" },
            { icon: "🃏", iconTone: "is-module", title: "YrYSceneCard",            description: "Scene navigation card — <strong>icon, title, description, badge, tag links</strong> · hover animation", meta: "<span class=\"accent\">cards/</span> · 1 package" },
            { icon: "📊", iconTone: "is-module", title: "YrYStatsGrid",            description: "KPI statistics grid — <strong>responsive auto-fill</strong> · value + label + subline · color modifiers", meta: "<span class=\"accent\">data-display/</span> · 1 package" },
            { icon: "📭", iconTone: "is-module", title: "YrYEmptyState · YrYErrorState", description: "Empty & error placeholder states — <strong>icon + title + message + action slot</strong>", meta: "<span class=\"accent\">feedback/</span> · 2 packages" },
            { icon: "🔔", iconTone: "is-module", title: "YrYToast",                description: "Toast notification system — <strong>success/warning/error/info</strong> · auto-dismiss · stacking", meta: "<span class=\"accent\">feedback/</span> · 1 package" },
            { icon: "📝", iconTone: "is-module", title: "YrYInput · Select · Textarea", description: "Form controls — <strong>validation, placeholder, disabled, readonly</strong> · consistent sizing", meta: "<span class=\"accent\">forms/</span> · 3 packages" },
            { icon: "⭐", iconTone: "is-module", title: "YrYIcon · iconMap",        description: "SVG icon renderer + icon registry — <strong>size, color variants</strong> · centralized icon definitions", meta: "<span class=\"accent\">icons/</span> · 2 files" },
            { icon: "🏷", iconTone: "is-module", title: "YrYBadge · ProgressBar · ScoreBar", description: "Status indicators — <strong>inline badge, horizontal progress, graded score bar</strong> · tone variants", meta: "<span class=\"accent\">indicators/</span> · 3 packages" },
            { icon: "⏳", iconTone: "is-module", title: "YrYLoading",               description: "Loading spinner/skeleton — <strong>size + variant</strong> · inline or full-page modes", meta: "<span class=\"accent\">loaders/</span> · 1 package" },
            { icon: "🪟", iconTone: "is-module", title: "YrYModal",                 description: "Modal dialog — <strong>title + body + footer slots</strong> · backdrop + Escape close · focus trap", meta: "<span class=\"accent\">modals/</span> · 1 package" },
            { icon: "🧭", iconTone: "is-module", title: "YrYBackTop · Breadcrumb · CrossNav", description: "Navigation aids — <strong>back-to-top button, breadcrumb trail, cross-panel navigator</strong>", meta: "<span class=\"accent\">navigation/</span> · 3 packages" },
            { icon: "🎛", iconTone: "is-module", title: "YrYPanelHub",              description: "Cross-panel command hub — <strong>icon buttons + flow description</strong> · multi-panel routing", meta: "<span class=\"accent\">panels/</span> · 1 package" },
            { icon: "🏷️", iconTone: "is-module", title: "YrYTag · YrYTagChip",     description: "Tag & chip components — <strong>clickable chips + non-interactive tags</strong> · tone/color variants", meta: "<span class=\"accent\">tags/</span> · 2 packages" },
            { icon: "🧬", iconTone: "is-module", title: "YrYLoader (Core)",         description: "Dynamic component loader — <strong>import + register + mount</strong> Vue 3 components from CDN paths", meta: "<span class=\"accent\">core/</span> · 1 package" },
            { icon: "📑", iconTone: "is-module", title: "HeaderActions",            description: "Page header action bar — <strong>export, refresh, filter buttons</strong> · responsive layout", meta: "<span class=\"accent\">business/</span> · 1 package" },
            { icon: "📖", iconTone: "is-module", title: "MarkdownView",             description: "Markdown content renderer — <strong>GFM + frontmatter + TOC</strong> · plugin-driven architecture", meta: "<span class=\"accent\">business/</span> · 1 package" },
            { icon: "🔍", iconTone: "is-module", title: "SearchHeader",             description: "Global search bar — <strong>input + filters + suggestions</strong> · keyboard shortcut trigger", meta: "<span class=\"accent\">business/</span> · 1 package" },
            { icon: "💀", iconTone: "is-module", title: "SkeletonLoader",           description: "Content placeholder skeleton — <strong>text, card, list shapes</strong> · shimmer animation", meta: "<span class=\"accent\">business/</span> · 1 package" },
            { icon: "📱", iconTone: "is-module", title: "h5/ · 10 Mobile Components", description: "Mobile-optimized widgets — <strong>Chat, Content, NewsList, Search, SessionList, VirtualList, BaseList, Preview, UI, SwipeScrollController</strong>", meta: "<span class=\"accent\">business/h5/</span> · 10 packages" },
            { icon: "📋", iconTone: "is-module", title: "yry-report-api-* (7)",     description: "API report widgets — <strong>endpoints, health, methods, patterns, security, semantics, summary</strong> · shared across YiDoc/panels/apis/", meta: "<span class=\"accent\">reports/apis/</span> · 7 packages" },
            { icon: "📁", iconTone: "is-module", title: "yry-report-* (7)",         description: "File analysis widgets — <strong>summary, size, largest, coupling, risk, health, self-improvement</strong> · shared across YiDoc/panels/files/", meta: "<span class=\"accent\">reports/files/</span> · 7 packages" },
            { icon: "📐", iconTone: "is-module", title: "yry-bytes · yry-sortable", description: "Report utility libs — <strong>byte formatting + sortable table</strong> · shared across all report components", meta: "<span class=\"accent\">reports/lib/</span> · 2 files" },
            { icon: "🤖", iconTone: "is-module", title: "aicr/ · AI Code Review (9)", description: "AI code review suite — <strong>ModelSelector, CodeArea, Header, Modals, Page, Sidebar, codeView, fileTree (8 modules), keyboardShortcuts, sessionListTags</strong>", meta: "<span class=\"accent\">views/aicr/</span> · 10 packages" },
            { icon: "🧠", iconTone: "is-module", title: "claude/ · Claude Panels (3)", description: "Claude project dashboard — <strong>DetailCard, PanelPage, ProjectCard</strong> · session & project views", meta: "<span class=\"accent\">views/claude/</span> · 3 packages" },
            { icon: "📖", iconTone: "is-module", title: "story/ · Story Manager (7)", description: "Story/dependency manager — <strong>DepEditor, KnowledgeGraphViewer, StoryCard, StoryDetail, StoryList, StoryPanel, StatusBadge</strong>", meta: "<span class=\"accent\">views/story/</span> · 7 packages" },
          ]
        },
        {
          id:    "cdn-vendors",
          kind:  "items",
          icon:  "📦",
          title: "Vendor Libraries (49 CDN Packages)",
          items: [
            { icon: "🎨", iconTone: "is-module", title: "UI Frameworks & CSS",    description: "<strong>Bootstrap 5.2.3</strong>, Animate.css 3.5.1, SimpleBar 5.1.0", meta: "<span class=\"accent\">3 packages</span> · bootstrap + animate + simplebar" },
            { icon: "📐", iconTone: "is-module", title: "Icons & Fonts",          description: "<strong>Font Awesome 4.7.0</strong>, Feather Icons, RemixIcon, Flaticon, Material Design Icons", meta: "<span class=\"accent\">5 packages</span> · 4 icon sets + 1 icon font" },
            { icon: "📈", iconTone: "is-module", title: "Charts & Visualization", description: "<strong>ApexCharts 3.46.0</strong>, ProgressBar.js 1.1.0", meta: "<span class=\"accent\">2 packages</span> · charts + progress" },
            { icon: "🎬", iconTone: "is-module", title: "Animation & Effects",    description: "<strong>anime.js 3.0.0</strong>, GSAP/TweenMax, AOS, WOW.js 1.1.3, Typed.js 2.0.11, CountUp, Jarallax", meta: "<span class=\"accent\">7 packages</span> · anime + gsap + aos + wow + typed" },
            { icon: "🖼", iconTone: "is-module", title: "Media & Lightbox",       description: "<strong>Fancybox 3.5.7</strong>, Magnific Popup 1.1.0, Venobox 1.7.3, YouTube Popup 1.0.1", meta: "<span class=\"accent\">4 packages</span> · fancybox + magnific + venobox + youtube" },
            { icon: "📱", iconTone: "is-module", title: "Sliders & Carousels",    description: "<strong>Swiper 7.0.3</strong>, Slick Carousel 1.8.1, Owl Carousel 2.2.1", meta: "<span class=\"accent\">3 packages</span> · swiper + slick + owl" },
            { icon: "📄", iconTone: "is-module", title: "Document & Export",      description: "<strong>html2canvas 1.4.1</strong>, jsPDF 2.5.2, SheetJS/xlsx 0.20.3", meta: "<span class=\"accent\">3 packages</span> · screenshot + pdf + excel" },
            { icon: "🗺", iconTone: "is-module", title: "Layout & Navigation",    description: "<strong>Isotope 3.0.6</strong> (filter/sort layout), Smooth Scrollbar, Perfect Scrollbar 1.5.0, Overscroll, Waypoints 4.0.0, SlickNav 1.0.10, Sticky Kit 1.1.2, Theia Sticky Sidebar 1.7.0, ScrollUp 2.4.1, Swup (page transitions)", meta: "<span class=\"accent\">10 packages</span> · isotope + scrolls + sticky + nav" },
            { icon: "⚙️", iconTone: "is-module", title: "Core Libraries",        description: "<strong>jQuery 3.7.1</strong>, Popper.js, Modernizr 3.6.0, Day.js 1.11.21, React 15.6.1, Leaflet 1.1.1, Countdown.js, md5.js", meta: "<span class=\"accent\">8 packages</span> · jquery + popper + modernizr + dayjs + react + leaflet" },
            { icon: "📝", iconTone: "is-module", title: "Markdown & Rendering",   description: "<strong>marked.min.js</strong> (GFM parser), turndown.js (HTML→MD), mermaid.min.js (diagrams)", meta: "<span class=\"accent\">3 packages</span> · marked + turndown + mermaid" },
          ]
        },
        {
          id:    "cdn-utils",
          kind:  "items",
          icon:  "🔧",
          title: "Utility Modules (12 Categories · 50+ Modules)",
          items: [
            { icon: "🌐", iconTone: "is-module", title: "browser/",          description: "DOM helpers · event delegation · browser detection", meta: "<span class=\"accent\">3 modules</span> · dom + events + index" },
            { icon: "🏗", iconTone: "is-module", title: "core/",             description: "API client · animation · event bus · HTTP · i18n · logging · storage · validation · performance", meta: "<span class=\"accent\">16 modules</span> · api + eventBus + http + i18n + storage" },
            { icon: "🔌", iconTone: "is-module", title: "core-ext/",         description: "Extended API (request/token/error) · DOM helpers · error handler · session manager · image resource · notification · time · storage · module loader", meta: "<span class=\"accent\">8 sub-categories</span> · api + dom + error + session + ui" },
            { icon: "📊", iconTone: "is-module", title: "data/",             description: "Data normalization · domain mapping · data utilities", meta: "<span class=\"accent\">2 modules</span> · dataUtils + domain" },
            { icon: "📱", iconTone: "is-module", title: "h5/",               description: "Mobile scroll · viewport · markdown · template · config · messaging", meta: "<span class=\"accent\">8 modules</span> · scroll + viewport + markdown + msg" },
            { icon: "💾", iconTone: "is-module", title: "io/",               description: "File export utilities · data serialization", meta: "<span class=\"accent\">1 module</span> · exportUtils" },
            { icon: "🎨", iconTone: "is-module", title: "render/",           description: "Template rendering engine", meta: "<span class=\"accent\">1 module</span> · index" },
            { icon: "🕐", iconTone: "is-module", title: "time/",             description: "Date formatting · time parameters · selectors", meta: "<span class=\"accent\">4 modules</span> · date + timeParams + timeSelectors" },
            { icon: "💬", iconTone: "is-module", title: "ui/",               description: "Dialog · loading · message · toast · tooltip portal · template", meta: "<span class=\"accent\">6 modules</span> · dialog + loading + message + toast" },
            { icon: "👁", iconTone: "is-module", title: "view/",             description: "Base view class · component loader · registry · lifecycle management", meta: "<span class=\"accent\">3 modules</span> · baseView + componentLoader + registry" },
            { icon: "📐", iconTone: "is-module", title: "yidoc/",            description: "Back-to-top button · breadcrumb navigation", meta: "<span class=\"accent\">2 modules</span> · back-top + breadcrumb" },
            { icon: "🧬", iconTone: "is-module", title: "loader.js",         description: "Component auto-loader — dynamic <strong>Vue 3 component registration</strong> from CDN", meta: "<span class=\"accent\">Entry</span> · YiPet/cdn/loader.js" },
          ]
        },
        {
          id:    "cdn-engines",
          kind:  "items",
          icon:  "⚡",
          title: "Render Engines & Style System",
          items: [
            { icon: "📐", iconTone: "is-module", title: "diagram/",           description: "SVG diagram engine — <strong>9×7 grid layout + orthogonal Manhattan routing</strong> · 23 professional components · dynamic outermost wireframe · shared across all deps/ reports", meta: "<span class=\"accent\">4 files</span> · diagram.js + index.js + index.css + primitives.js" },
            { icon: "📝", iconTone: "is-module", title: "markdown/",          description: "Plugin-based Markdown renderer — <strong>9 plugins</strong> (Accordion, Containers, Frontmatter, InternalLink, Mermaid, Nested, Sanitize, TableCell, TOC) · PluginSystem + MarkdownRenderer core", meta: "<span class=\"accent\">12 files</span> · 9 plugins + 3 core modules" },
            { icon: "🧜", iconTone: "is-module", title: "mermaid/",           description: "Mermaid diagram renderer — <strong>5 plugins</strong> (AIFix, Clipboard, Download, Fullscreen, Toolbar) · dark theme config · interactive toolbar", meta: "<span class=\"accent\">7 files</span> · 5 plugins + css + config + renderer" },
            { icon: "🎨", iconTone: "is-module", title: "Style System",       description: "4-layer CSS architecture — <strong>base/ (animations + theme + tokens)</strong> · h5/ (base reset + components + layout) · yidoc/ (semantic.css) · content.css · popup.css", meta: "<span class=\"accent\">styles/</span> · 4 layer groups" },
            { icon: "✍️", iconTone: "is-module", title: "RemixIcon Fonts",    description: "Open-source icon font — <strong>woff2 · woff · ttf · svg</strong> · symbol sprite support · 2200+ icons", meta: "<span class=\"accent\">fonts/remixicon/</span> · 5 formats" },
          ]
        }
      ]
    }
  ],

  thirdPartyLibraries: [
    {
      category: 'Python Backend (YiAi)',
      description: 'Async API server — FastAPI ecosystem with MongoDB, scheduling, LLM gateway, and RSS ingestion',
      items: [
        { name: 'FastAPI',          purpose: 'High-performance async web framework with auto-generated OpenAPI docs', url: 'https://fastapi.tiangolo.com/', version: '0.104+' },
        { name: 'Uvicorn',          purpose: 'ASGI server — production-grade serving for FastAPI apps', url: 'https://www.uvicorn.org/', version: '0.24+' },
        { name: 'Pydantic',         purpose: 'Data validation and settings management via Python type annotations', url: 'https://docs.pydantic.dev/', version: '2.x' },
        { name: 'Motor',            purpose: 'Async MongoDB driver — non-blocking database access for FastAPI handlers', url: 'https://motor.readthedocs.io/', version: '3.3+' },
        { name: 'PyMongo',          purpose: 'Synchronous MongoDB driver — underlying connection layer for Motor', url: 'https://pymongo.readthedocs.io/', version: '4.6+' },
        { name: 'aiohttp',          purpose: 'Async HTTP client/server — RSS fetching and external API calls', url: 'https://docs.aiohttp.org/', version: '3.9+' },
        { name: 'APScheduler',      purpose: 'Advanced job scheduler — cron and interval-based RSS refresh tasks', url: 'https://apscheduler.readthedocs.io/', version: '3.10+' },
        { name: 'feedparser',       purpose: 'Universal RSS/Atom feed parser', url: 'https://feedparser.readthedocs.io/', version: '6.0+' },
        { name: 'Ollama (Python)',  purpose: 'Local LLM client — Ollama API integration for AI features', url: 'https://github.com/ollama/ollama-python', version: '0.1+' },
        { name: 'oss2',             purpose: 'Alibaba Cloud OSS SDK — object storage for file uploads', url: 'https://www.alibabacloud.com/help/en/oss/', version: '2.18+' },
        { name: 'Typer',            purpose: 'CLI application framework — type-hint-driven command-line interfaces', url: 'https://typer.tiangolo.com/', version: '0.9+' },
        { name: 'python-multipart', purpose: 'Multipart form-data parsing for file upload endpoints', url: 'https://github.com/Kludex/python-multipart', version: '-' },
        { name: 'aiofiles',         purpose: 'Async file I/O — non-blocking file read/write operations', url: 'https://github.com/Tinche/aiofiles', version: '23.2+' },
        { name: 'tenacity',         purpose: 'Retry/backoff decorators — resilient external API calls', url: 'https://tenacity.readthedocs.io/', version: '8.2+' },
        { name: 'PyYAML',           purpose: 'YAML configuration parsing — config.yaml application settings', url: 'https://pyyaml.org/', version: '6.0+' },
      ],
    },
    {
      category: 'Python ML / Video (YiviY)',
      description: 'Video translation & dubbing platform — speech recognition, diarization, TTS, and LLM orchestration',
      items: [
        { name: 'Streamlit',                purpose: 'Web UI framework — interactive dashboards with zero frontend code', url: 'https://streamlit.io/', version: '1.49' },
        { name: 'HuggingFace Transformers', purpose: 'Pretrained NLP & speech models — WAV2VEC2, Whisper pipelines', url: 'https://huggingface.co/docs/transformers', version: '4.48+' },
        { name: 'WhisperX',                 purpose: 'Word-level timestamped speech recognition with forced alignment', url: 'https://github.com/m-bain/whisperX', version: '3.8+' },
        { name: 'PyAnnote Audio',           purpose: 'Speaker diarization — multi-speaker separation and labeling', url: 'https://github.com/pyannote/pyannote-audio', version: '4.0+' },
        { name: 'PyTorch Lightning',        purpose: 'PyTorch training framework wrapper — streamlined ML pipelines', url: 'https://lightning.ai/docs/pytorch', version: '2.6' },
        { name: 'MoviePy',                  purpose: 'Video editing — cutting, compositing, and subtitle overlay', url: 'https://zulko.github.io/moviepy/', version: '1.0' },
        { name: 'OpenAI (Python)',          purpose: 'OpenAI API client — GPT translation and TTS synthesis', url: 'https://github.com/openai/openai-python', version: '1.55+' },
        { name: 'CTranslate2',              purpose: 'Fast inference engine — optimized transformer model execution on GPU', url: 'https://github.com/OpenNMT/CTranslate2', version: '4.5+' },
        { name: 'spaCy',                    purpose: 'NLP library — sentence splitting and linguistic analysis', url: 'https://spacy.io/', version: '3.8' },
        { name: 'librosa',                  purpose: 'Audio analysis — feature extraction for speech processing', url: 'https://librosa.org/', version: '0.11' },
        { name: 'OpenCV',                   purpose: 'Computer vision — video frame extraction and processing', url: 'https://opencv.org/', version: '4.11' },
        { name: 'yt-dlp',                   purpose: 'Video downloading — YouTube and 1000+ site support', url: 'https://github.com/yt-dlp/yt-dlp', version: '-' },
        { name: 'Replicate',                purpose: 'ML model API client — cloud-hosted model inference', url: 'https://replicate.com/', version: '0.33' },
        { name: 'pandas',                   purpose: 'Data analysis — subtitle DataFrame manipulation', url: 'https://pandas.pydata.org/', version: '2.2+' },
      ],
    },
    {
      category: 'Desktop App · Frontend (YiPot)',
      description: 'Tauri-based cross-platform desktop app — React UI with 39 translation/OCR service integrations',
      items: [
        { name: 'React',            purpose: 'Declarative UI library — component-based frontend architecture', url: 'https://react.dev/', version: '18.3' },
        { name: 'NextUI',           purpose: 'React UI component library — accessible design system with dark mode', url: 'https://nextui.org/', version: '2.4' },
        { name: 'Tailwind CSS',     purpose: 'Utility-first CSS framework — rapid styling without context switching', url: 'https://tailwindcss.com/', version: '3.4' },
        { name: 'React Router',     purpose: 'Client-side routing — declarative navigation for single-page app', url: 'https://reactrouter.com/', version: '6.27' },
        { name: 'Jotai',            purpose: 'Atomic state management — bottom-up reactive state for React', url: 'https://jotai.org/', version: '2.10' },
        { name: 'Framer Motion',    purpose: 'Declarative animation library — gesture-driven UI transitions', url: 'https://www.framer.com/motion/', version: '11.11' },
        { name: 'i18next',          purpose: 'Internationalization framework — multi-language translation UI', url: 'https://www.i18next.com/', version: '23.16' },
        { name: 'Tesseract.js',     purpose: 'Browser-based OCR engine — in-app image text recognition', url: 'https://tesseract.projectnaptha.com/', version: '5.1' },
        { name: 'crypto-js',        purpose: 'Cryptographic hashing — HMAC-SHA256 sign for 9 API services', url: 'https://github.com/brix/crypto-js', version: '4.2' },
        { name: 'jose',             purpose: 'JWT/JWS/JWE/JWK implementation — token signing and verification', url: 'https://github.com/panva/jose', version: '5.9' },
        { name: 'React Markdown',   purpose: 'Markdown rendering — translation result display in rich text', url: 'https://github.com/remarkjs/react-markdown', version: '9.0' },
      ],
    },
    {
      category: 'Desktop App · Backend (YiPot · Rust)',
      description: 'Tauri native shell — HTTP server, screen capture, clipboard, language detection, and system integration',
      items: [
        { name: 'Tauri (Rust)',     purpose: 'Desktop app framework — native window, tray, menu, and filesystem APIs', url: 'https://tauri.app/', version: '1.8' },
        { name: 'Reqwest',          purpose: 'Ergonomic HTTP client — translation API calls with connection pooling', url: 'https://docs.rs/reqwest/', version: '0.12' },
        { name: 'Serde',            purpose: 'Serialization framework — JSON request/response handling', url: 'https://serde.rs/', version: '1.0' },
        { name: 'tiny_http',        purpose: 'Embedded HTTP server — local loopback OCR/translate endpoint', url: 'https://docs.rs/tiny_http/', version: '0.12' },
        { name: 'screenshots',      purpose: 'Screen capture — screenshot-based OCR for any application', url: 'https://docs.rs/screenshots/', version: '0.7' },
        { name: 'arboard',          purpose: 'Clipboard access — cross-platform copy/paste integration', url: 'https://docs.rs/arboard/', version: '3.4' },
        { name: 'Lingua',           purpose: 'Language detection — 22-language identification without external API', url: 'https://github.com/pemistahl/lingua-rs', version: '1.6' },
        { name: 'image',            purpose: 'Image processing — format conversion and manipulation', url: 'https://docs.rs/image/', version: '0.25' },
        { name: 'base64',           purpose: 'Base64 encoding — image data serialization for API requests', url: 'https://docs.rs/base64/', version: '0.22' },
      ],
    },
    {
      category: 'Frontend Dashboards (YiDoc)',
      description: 'Vue 3 ecosystem — interactive workflow editors, API reports, and enterprise admin panels',
      items: [
        { name: 'Vue 3',            purpose: 'Progressive JavaScript framework — Composition API with reactive data binding', url: 'https://vuejs.org/', version: '3.4' },
        { name: 'LogicFlow',        purpose: 'Workflow diagram engine — visual process designer with minimap extension', url: 'https://site.logic-flow.cn/', version: '1.2' },
        { name: 'Ant Design Vue',   purpose: 'Enterprise UI component library — 60+ components for admin panels', url: 'https://antdv.com/', version: '4.x' },
        { name: 'Element Plus',     purpose: 'Vue 3 UI component library — Material Design inspired widgets', url: 'https://element-plus.org/', version: '2.7' },
        { name: 'Vite',             purpose: 'Next-gen build tool — instant HMR and optimized production builds', url: 'https://vitejs.dev/', version: '5.3' },
      ],
    },
    {
      category: 'Templates & UI Libraries',
      description: 'Static site UI libraries — Admin dashboards, landing pages, portfolios, and blog templates',
      items: [
        { name: 'Bootstrap',        purpose: 'Responsive CSS framework — grid system and prebuilt components (v4/v5)', url: 'https://getbootstrap.com/', version: '5.2' },
        { name: 'ApexCharts',       purpose: 'Interactive charting — 16 chart types for data visualization', url: 'https://apexcharts.com/', version: '3.27' },
        { name: 'Apache ECharts',   purpose: 'Declarative visualization — highly customizable interactive charts', url: 'https://echarts.apache.org/', version: '5.4' },
        { name: 'Swiper',           purpose: 'Touch slider/carousel — hardware-accelerated transitions', url: 'https://swiperjs.com/', version: '8.4' },
        { name: 'AOS',              purpose: 'Animate on Scroll — CSS-driven scroll reveal animations', url: 'https://michalsnik.github.io/aos/', version: '2.x' },
        { name: 'FullCalendar',     purpose: 'Calendar & event management — drag-and-drop scheduling', url: 'https://fullcalendar.io/', version: '6.1' },
        { name: 'Quill',            purpose: 'Rich text editor — WYSIWYG editing with custom formats', url: 'https://quilljs.com/', version: '1.3' },
        { name: 'Fancybox',         purpose: 'Lightbox gallery — image, video, and iframe modal display', url: 'https://fancyapps.com/fancybox/', version: '3.5' },
        { name: 'anime.js',         purpose: 'Animation engine — lightweight JavaScript animation toolkit', url: 'https://animejs.com/', version: '3.0' },
        { name: 'GSAP',             purpose: 'Professional animation — high-performance SVG and DOM animations', url: 'https://greensock.com/gsap/', version: '-' },
      ],
    },
    {
      category: 'Browser Extension (YiPet)',
      description: 'Chrome extension — markdown conversion, mind map rendering, PDF generation, and data export',
      items: [
        { name: 'Mermaid',          purpose: 'Diagram & mind map rendering — flowchart, sequence, and gantt charts', url: 'https://mermaid.js.org/', version: '-' },
        { name: 'Marked',           purpose: 'Markdown parser — fast .md to HTML conversion with GFM support', url: 'https://marked.js.org/', version: '-' },
        { name: 'Turndown',         purpose: 'HTML to Markdown converter — DOM-based rich text extraction', url: 'https://github.com/mixmark-io/turndown', version: '-' },
        { name: 'html2canvas',      purpose: 'HTML screenshots — render DOM elements to canvas images', url: 'https://html2canvas.hertzen.com/', version: '1.4' },
        { name: 'jsPDF',            purpose: 'PDF generation — client-side PDF creation from HTML content', url: 'https://github.com/parallax/jsPDF', version: '2.5' },
        { name: 'SheetJS',          purpose: 'Excel read/write — xlsx export for data tables and reports', url: 'https://sheetjs.com/', version: '0.20' },
        { name: 'Leaflet',          purpose: 'Interactive maps — lightweight open-source mapping library', url: 'https://leafletjs.com/', version: '1.1' },
      ],
    },
    {
      category: 'Infrastructure & External Services',
      description: 'Cross-cutting dependencies — databases, storage, LLM serving, and containerization',
      items: [
        { name: 'MongoDB',          purpose: 'Document database — primary data store for YiAi API server', url: 'https://www.mongodb.com/docs/', version: '-' },
        { name: 'Ollama',           purpose: 'Local LLM serving — self-hosted GPT, embedding, and vision models', url: 'https://ollama.com/', version: '-' },
        { name: 'Docker',           purpose: 'Container platform — GPU-accelerated YiviY deployment with CUDA 12.4', url: 'https://docs.docker.com/', version: '-' },
        { name: 'Alibaba Cloud OSS',purpose: 'Object storage — image upload and static asset hosting', url: 'https://www.alibabacloud.com/help/en/oss/', version: '-' },
        { name: 'Nginx',            purpose: 'Reverse proxy — SSL termination and static asset serving', url: 'https://nginx.org/en/docs/', version: '-' },
      ],
    },
  ],

  footerLinks: [
    { label: "CLAUDE.md",       href: "../CLAUDE.md",                    targetBlank: true },
    { label: "README.md",       href: "../README.md",                    targetBlank: true },
    { label: "YiAi Report",     href: "../projects/YiAi/data.js",        targetBlank: true },
    { label: "YiH5 Report",     href: "../projects/YiH5/data.js",        targetBlank: true },
    { label: "YiPet Report",    href: "../projects/YiPet/data.js",       targetBlank: true },
    { label: "YiPot Report",    href: "../projects/YiPot/data.js",       targetBlank: true },
    { label: "YiWeb Report",    href: "../projects/YiWeb/data.js",       targetBlank: true },
    { label: "YiviY Source",    href: "../../YiviY/",                    targetBlank: true }
  ]
};
