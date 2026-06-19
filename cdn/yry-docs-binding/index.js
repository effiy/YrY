/**
 * yry-docs-binding/index.js — 文档中心数据绑定控制器 (Vue 3 custom element)
 *
 * 重构自 docs/js/docs-binding.js (517 行 IIFE):
 *   - 拆分为三件套: index.html (模板源) / index.js (Vue) / index.css (样式)
 *   - 改用 Vue 3 defineCustomElement,模板来自 fetch('index.html') + DOMParser
 *   - 业务逻辑 1:1 保留 (data / live fetch / 事件路由 / 徽章注入)
 *   - 卸载时 (disconnectedCallback) 清理定时器与监听器
 *   - 内联 cssText 全部迁出到 index.css (使用 .ydb-* 命名空间)
 *   - 派发事件: yry-docs-binding-ready
 *
 * 加载链:
 *   <link rel="stylesheet" href="../cdn/yry-docs-binding/index.css">
 *   <script src="https://unpkg.com/vue@3/dist/vue.global.prod.js"></script>
 *   <script src="../cdn/yry-docs-binding/index.js"></script>
 *   ...
 *   <yry-docs-binding></yry-docs-binding>     <!-- 放在 body 末尾任意位置 -->
 *
 * 控制器职责 (mounted() 钩子中执行):
 *   1) 立即绑定: Breadcrumb / SceneHeader / StatsGrid / CrossNav / PanelHub
 *   2) 监听 yry-*-ready 事件,组件升级后再补一次
 *   3) Live 评分拉取: summary.json (每 5 分钟)
 *   4) 事件路由: panel-hub-select → PanelHub.open() / layer-panel-select → layerInfo/Hub
 *   5) 注入三评分徽章到 .item-card / .story-card / .scene-card
 *   6) 注入评分图例 (Score Legend) 到 StatsGrid 之后
 */
(function () {
  'use strict';

  if (!window.Vue) {
    console.error('[YryDocsBinding] Vue 3 未加载,请先引入 vue.global.prod.js');
    return;
  }

  var TAG_NAME = 'yry-docs-binding';
  var TEMPLATE_ID = 'yry-docs-binding-tpl';
  var READY_EVENT = 'yry-docs-binding-ready';
  var LOAD_TIMEOUT_MS = 5000;
  var REFRESH_MS = 5 * 60 * 1000;

  if (customElements.get(TAG_NAME)) return;

  var script = document.currentScript;
  if (!script || !script.src) {
    console.error('[YryDocsBinding] 无法获取当前脚本 URL,组件已跳过注册');
    return;
  }
  var scriptUrl = new URL(script.getAttribute('src'), window.location.href);
  var templateUrl = new URL('index.html', scriptUrl).href;

  /* ── Module-level constants (原 YRY_APP_DATA, 1:1 保留) ────────── */
  var YRY_APP_DATA = {
    /* 1) Breadcrumb */
    breadcrumb: function (el) {
      el.items = [
        { label: 'YrY', href: '../', icon: '📚' },
        { label: '文档中心' }
      ];
    },
    /* 2) Scene Header */
    sceneHeader: function (el) {
      el.icon        = '⭐';
      el.titlePrefix = 'YrY ';
      el.accent      = '文档中心';
      el.meta        = '📌 v5.4.0 · 🩺 健康 77/B · 🧪 测试 60分 · 🧬 自改进 89/A · 🛠 技能 86/A';
      el.desc        = '故事驱动的 SDLC 编排系统 — 六层结构:19 技能 → 依赖/框架 → 7 故事 → 37 场景 → Agent 角色与规则 → 参考入口';
    },
    /* 3) Stats Grid */
    statsGrid: function (el) {
      el.items = [
        { value: '86/A', label: '技能评分', modifier: 'health', sub: '19 能力 · 4 维评估', tooltip: '技能健康指数 · 四维加权评估 → SKILL.md 规约完整性(30%): 每技能必备完整 SKILL.md + 交接信号可验证 + 领域语言一致性(25%): 避免禁用别名·术语漂移检测 + 自包含可执行性(25%): 规约独立可执行·不依赖外链可达性 + 代码范式合规(20%): 无 class/extends·无 export default·无空 catch。评级: A≥80 优秀 B≥60 良好 C≥40 需改进 D<40 严重缺陷。数据源: arch-check.mjs --append-trend' },
        { value: '77/B', label: '健康评分', modifier: 'warn-h', sub: '综合 19 维', tooltip: '健康评分 = 19 维度加权均分。A≥80 B≥60 C≥40 D<40。数据源: .memory/health-trend.jsonl → summary.json' },
        { value: '60分', label: '测试评分', modifier: 'warn-h', sub: '工程成熟度', tooltip: '测试评分 = 工程成熟度 7 维加权: 测试覆盖×30% + 类型安全×15% + 代码检查×15% + CI/CD×10% + 文档×10% + 依赖×10% + Git实践×10%' },
        { value: '89分', label: '自改进', modifier: 'health', sub: '组件健康均分', tooltip: '自改进评分 = Skills/Agents/Rules/Scripts 四类组件健康评分的加权均分。反映项目整体代码质量和架构合规度' },
        { value: 12, label: '依赖/框架', modifier: 'info', tooltip: '6 运行时依赖 + 6 开发依赖' },
        { value: 7,  label: '故事', modifier: 'health', tooltip: '7 个故事: 架构 · 自测 · npm · CDN · 自改进 · 首页 · 计划清单' },
        { value: 37, label: '场景', modifier: 'health', tooltip: '37 个场景分布在 7 个故事中,每个场景 7 件标准交付物' },
        { value: 9,  label: 'Agent', modifier: 'info', tooltip: '9 个 Agent 角色 + 1 份拓扑总纲' },
        { value: 18, label: '规则', modifier: 'health', tooltip: '18 条治理规则: 管线纪律 · 安全 · 文档 · 自改进 · 设计原则' },
        { value: 9,  label: '参考入口', modifier: 'info', tooltip: '4 文档入口 + 5 监控仪表板' }
      ];
    },
    /* 4) Cross Nav */
    crossNav: function (el) {
      el.basePath = '';
      el.active   = '';
      el.pages    = [
        { id: 'CDN 共享库',  icon: '🌐', href: '../cdn/index.html' },
        { id: '自检中心',    icon: '🧪', href: '../tests/index.html' },
        { id: '演示中心',    icon: '🎬', href: './yry-arch/scenes/场景-1-新人上手/演示.html' },
        { id: '健康报告',    icon: '🩺', href: '../docs/健康报告/health-cdn-index.html' },
        { id: '自循环报告',  icon: '🔄', href: './自循环报告/index.html' },
        { id: '趋势报告',    icon: '📡', href: './趋势报告/index.html' },
        { id: '自我改进',    icon: '🧬', href: './自我改进/index.html' },
        { id: 'CLAUDE.md',   icon: '📜', href: '../CLAUDE.md' },
        { id: 'README.md',   icon: '📖', href: '../README.md' }
      ];
    },
    /* 5) Panel Hub */
    panelHub: function (el) {
      el.label = { text: '🩺 —', panel: 'selfimprove', title: '点击打开自改进面板查看详情' };
      el.buttons = [
        { icon: '⏰', name: '调度',   desc: '定时·触发·编排', color: 'var(--yry-cyan)', panel: 'cron',        title: '调度任务 — 展示 .claude/scheduled_tasks.json 中所有定时任务。包含 cron 表达式、人类可读描述、活跃/空闲状态、下次触发预估。' },
        { icon: '🔔', name: '通知',   desc: '健康·循环·趋势', color: '#ef4444',       panel: 'notify',      title: '通知中心 — 健康检查报告、自循环巡检、趋势扫描三类通知统一汇总。健康报告按日期展示最新一份,支持按类型筛选、最新评分趋势、诊断触发追踪。' },
        { icon: '🧬', name: '自改进', desc: '趋势·诊断·评估', color: '#a78bfa',       panel: 'selfimprove', title: '自改进分析 — 读取 .memory/health-trend.jsonl 和 summary.json,按日/周/月/全景四个视角展示健康趋势、D0-D7 诊断覆盖率、等级分布、分支健康对比;健康数据按日期覆盖,每天保留一个快照。' },
        { icon: '❓', name: 'FAQ',    desc: '知识·指南·解惑', color: '#22c55e',       panel: 'faq',         title: '常见问题 — 系统知识入口:YrY 概念、命令使用、面板关系、健康检查原理、Skill/Agent/Rule 区别。含交叉面板导航链接。' }
      ];
      el.flow = 'Cron 定时触发 → 技能执行 → 通知产出 → 🔔 通知面板展示 → 🧬 自改进分析消费';
    }
  };

  /* ── SubTitle × 9 数据 ─────────────────────────────────────────── */
  var SUB_TITLE_DATA = [
    { id: 'sub-title-agent-roles',     props: { icon: '🤖', text: 'Agent 角色',         count: '9' } },
    { id: 'sub-title-agent-topology',  props: { icon: '📜', text: 'Agent 角色拓扑' } },
    { id: 'sub-title-rule-pipeline',   props: { icon: '🛠', text: '管线与执行规则',     count: '5' } },
    { id: 'sub-title-rule-doc',        props: { icon: '📄', text: '文档规则',           count: '4' } },
    { id: 'sub-title-rule-security',   props: { icon: '🛡', text: '安全与配置规则',     count: '2' } },
    { id: 'sub-title-rule-selfimprove',props: { icon: '🔄', text: '自改进规则',         count: '1' } },
    { id: 'sub-title-rule-design',     props: { icon: '📏', text: '设计与质量管理',     count: '6' } },
    { id: 'sub-title-ref-doc',         props: { icon: '📖', text: '文档入口',           count: '4' } },
    { id: 'sub-title-ref-monitor',     props: { icon: '📊', text: '监控与报告',         count: '5' } }
  ];

  /* ── Static Layer × 3 数据 ────────────────────────────────────── */
  var STATIC_LAYER_DATA = [
    {
      mountId: 'layer-agents-app',
      props: {
        layerId: 'layer-agents',
        num: '5',
        titleAccent: 'Agent 角色与规则',
        stats: ['🩺 Agent 健康 99/A · 9 Agent 角色 + 1 拓扑总纲 · 18 治理规则'],
        panelsContainerTitle: 'Agent 行为受规则约束,规则合规性由健康检查监控',
        panels: [
          { icon: '🤖', label: '', style: 'background:#ffc107', title: 'Agent 角色详情',  panel: 'agents',      onPanel: 'layerInfo' },
          { icon: '🧬', label: '', style: 'background:#a78bfa', title: '自改进诊断',     panel: 'selfimprove', onPanel: 'panel' },
          { icon: '🔔', label: '', style: 'background:#ef4444', title: '通知中心',       panel: 'notify',      onPanel: 'panel' },
          { icon: '❓', label: '', style: 'background:#22c55e', title: 'Agent FAQ',      panel: 'faq',         onPanel: 'panel' },
          { icon: '📋', label: '', style: 'background:#64DCB4', title: '规则详情',       panel: 'rules',       onPanel: 'layerInfo' }
        ]
      }
    },
    {
      mountId: 'layer-rules-app',
      props: {
        layerId: 'layer-rules',
        num: 'R',
        titleAccent: '治理规则',
        stats: ['🩺 规则健康 91/A · 18 规则 · 管线纪律 · 安全 · 文档 · 自改进 · 设计原则'],
        style: 'margin-top:36px;',
        numStyle: 'background: var(--yry-cyan);',
        panelsContainerTitle: '规则详情',
        panels: [
          { icon: '📋', label: '', style: 'background:#64DCB4', title: '查看规则详情', panel: 'rules', onPanel: 'layerInfo' }
        ]
      }
    },
    {
      mountId: 'layer-refs-app',
      props: {
        layerId: 'layer-refs',
        num: '6',
        titleAccent: '参考入口',
        stats: ['4 文档入口 + 5 监控仪表板 · 项目元信息与实时监控'],
        panelsContainerTitle: '参考入口与监控面板',
        panels: [
          { icon: '📎', label: '', style: 'background:#94a3b8', title: '查看参考详情', panel: 'refs',        onPanel: 'layerInfo' },
          { icon: '🔔', label: '', style: 'background:#ef4444', title: '通知中心',     panel: 'notify',      onPanel: 'panel' },
          { icon: '🧬', label: '', style: 'background:#a78bfa', title: '自改进分析',   panel: 'selfimprove', onPanel: 'panel' },
          { icon: '❓', label: '', style: 'background:#22c55e', title: 'FAQ',          panel: 'faq',         onPanel: 'panel' }
        ]
      }
    }
  ];

  /* ── DOCS_DATA (1:1 保留 docs/js/docs-data.js) ──────────────────
     整个页面的内容数据都集中在此,YryDocLayer 组件会根据此数据动态渲染。
     数据格式:
       layers: [
         { id, num, titleIcon, titleAccent, stats, panels, sections: [...] }
       ]
     页面布局、样式、交互完全由 cdn/yry-* 组件承担。
  ─────────────────────────────────────────────────────────────── */
  var sceneMeta = (typeof YrY !== 'undefined' && YrY.sceneMeta) ? YrY.sceneMeta : function (p) {
    return [
      { icon: '📋', label: '清单', href: p + '/计划清单.html' },
      { icon: '📐', label: '架构', href: p + '/架构图.html' },
      { icon: '🔗', label: '图谱', href: p + '/知识图谱.html' },
      { icon: '🧪', label: '测试', href: p + '/测试面板.html' },
      { icon: '📄', label: '源码', href: p + '/源码.html' },
      { icon: '💡', label: '演示', href: p + '/演示.html' },
      { icon: '📝', label: '审查', href: p + '/审查.html' }
    ];
  };

  var layerDeps = {
    id: 'layer-deps', num: '2',
    titleIcon: '📚', titleAccent: '第三方依赖与框架',
    stats: ['🩺 依赖健康 100分 · 6 运行时 · 6 开发'],
    panels: [
      { icon: '📦', label: '', title: '查看依赖详情', panel: 'deps', onPanel: 'layerInfo' }
    ],
    sections: [
      {
        subTitle: { icon: '⚡', text: '运行时依赖 (6)', count: '6 项' },
        grid: 'card',
        items: [
          { icon: 'C', iconModifier: 'rule', name: 'yry-cdn-lib', nameHref: 'https://www.jsdelivr.com/package/npm/yry-cdn-lib', nameTarget: '_blank', desc: 'YrY 自建 CDN 共享库 — 双主题系统 (Mono + System)、14 设计令牌、22 CSS 组件、9 JS 工具 API。55+ 页面统一引用,消除内联重复代码 40–60%。<a href="../cdn/index.html" style="color:var(--yry-cyan)">详情 → CDN 共享库</a>', tags: [{ text: '自建', modifier: 'accent' }, { text: 'jsDelivr CDN', modifier: 'info' }, { text: 'v1.1.0', modifier: 'cyan' }], meta: 'shared/index.css + theme/index.css + theme-mono/index.css + fonts/index.css + shared.js', demo: 'https://www.jsdelivr.com/package/npm/yry-cdn-lib' },
          { icon: 'G', iconModifier: 'rule', name: 'Cytoscape.js', nameHref: 'https://js.cytoscape.org/', nameTarget: '_blank', desc: '图论可视化库 — 知识图谱页面的交互式节点-边图渲染。支持 breadthfirst/concentric/cose 布局、缩放平移、节点拖拽、PNG 导出', tags: [{ text: '可视化', modifier: 'green' }, { text: 'jsDelivr CDN', modifier: 'info' }, { text: 'v3.28.1', modifier: 'cyan' }], meta: '4 故事面板 · 知识图谱.html — 三层 schema: story→scene→source', demo: 'https://js.cytoscape.org/' },
          { icon: 'H', iconModifier: 'rule', name: 'html2canvas', nameHref: 'https://html2canvas.hertzen.com/', nameTarget: '_blank', desc: 'DOM 截图引擎 — 架构图和知识图谱页面的截图导出。DOM → Canvas → PNG/PDF,支持跨域图片、缩放质量可配置', tags: [{ text: '导出', modifier: 'green' }, { text: 'jsDelivr CDN', modifier: 'info' }, { text: 'v1.4.1', modifier: 'cyan' }], meta: '架构图 + 知识图谱 — Copy / PNG / PDF 三格式导出 · scale 2x 高清', demo: 'https://html2canvas.hertzen.com/' },
          { icon: 'J', iconModifier: 'rule', name: 'jsPDF', nameHref: 'https://github.com/parallax/jsPDF', nameTarget: '_blank', desc: '客户端 PDF 生成 — 架构图和知识图谱页面的 PDF 导出。配合 html2canvas 使用,支持 A4/A3 纸张、矢量缩放、多页输出', tags: [{ text: '导出', modifier: 'green' }, { text: 'jsDelivr CDN', modifier: 'info' }, { text: 'v2.5.2', modifier: 'cyan' }], meta: 'A4 纵向 · 矢量缩放 · addPage 多页 · Blob 下载触发', demo: 'https://github.com/parallax/jsPDF' },
          { icon: 'A', iconModifier: 'rule', name: 'api.effiy.cn', desc: '远端文档 API — rui-import 同步引擎的目标端点。文档 CRUD、session 管理、文件读写。认证: X-Token 环境变量注入', tags: [{ text: '自建', modifier: 'accent' }, { text: 'REST API', modifier: 'info' }, { text: '认证', modifier: 'purple' }], meta: 'query_documents · create_document · update_document · write-file · read-file · session' },
          { icon: 'W', iconModifier: 'rule', name: '企业微信 Webhook', nameHref: 'https://developer.work.weixin.qq.com/document/path/91770', nameTarget: '_blank', desc: '企微群机器人消息推送 — rui-bot 通知引擎。Rich/Verbose 格式 + Dry-Run 预览 + 失败队列重试 + 9 维健康检查', tags: [{ text: '通知', modifier: 'purple' }, { text: 'Webhook', modifier: 'info' }, { text: 'Health', modifier: 'accent' }], meta: 'rui-bot · 9维健康检查 · 自循环报告 · 阻断/完成/异常通知', demo: 'https://developer.work.weixin.qq.com/document/path/91770' }
        ]
      },
      {
        subTitle: { icon: '🛠', text: '开发依赖 (6)', count: '6 项' },
        grid: 'card',
        items: [
          { icon: 'N', iconModifier: 'ref', name: 'Node.js 内置模块', nameHref: 'https://nodejs.org/api/', nameTarget: '_blank', desc: '全部脚本基于 Node.js 内置模块:fs, path, child_process, crypto, http, os, url。14 脚本 + 8 共享库仅使用标准库', tags: [{ text: '零运行时依赖', modifier: 'green' }, { text: 'Built-in', modifier: 'info' }], meta: '14 脚本 + 8 共享库 — 全部使用 Node.js 标准库', demo: 'https://nodejs.org/api/' },
          { icon: 'V', iconModifier: 'ref', name: 'vitest', nameHref: 'https://vitest.dev/', nameTarget: '_blank', desc: '工程化测试框架 — 基于 Vite 的 ESM 原生测试运行器。提供 test/watch/coverage 命令,并行执行,v8 覆盖率。14 脚本 + 77+ 测试用例', tags: [{ text: '测试框架', modifier: 'accent' }, { text: 'npm devDependency', modifier: 'info' }, { text: 'v3.2.x', modifier: 'cyan' }], meta: 'npm test · npm run test:watch · npm run test:coverage — 双轨共存 (vitest + legacy)', demo: 'https://vitest.dev/' },
          { icon: 'U', iconModifier: 'ref', name: '@vitest/ui', nameHref: 'https://vitest.dev/guide/ui.html', nameTarget: '_blank', desc: 'Vitest 可视化仪表盘 — Web UI 实时查看测试结果、过滤/搜索用例、覆盖率可视化。开发时调试首选', tags: [{ text: '开发工具', modifier: 'green' }, { text: 'npm devDependency', modifier: 'info' }, { text: 'v3.2.x', modifier: 'cyan' }], meta: 'npm run test:ui · 实时仪表盘 · 按模块过滤', demo: 'https://vitest.dev/guide/ui.html' },
          { icon: 'M', iconModifier: 'ref', name: 'chrome-devtools-mcp', nameHref: 'https://github.com/ChromeDevTools/chrome-devtools-mcp', nameTarget: '_blank', desc: 'Chrome DevTools MCP 协议 — 程序化浏览器验证。navigate_page / evaluate_script / list_network_requests / take_screenshot 替代手工 DevTools 面板操作', tags: [{ text: '测试工具', modifier: 'accent' }, { text: 'MCP', modifier: 'info' }, { text: 'v1.2.0', modifier: 'cyan' }], meta: 'CDN 加载链路自动化验证 · 71 断言全通过 · 零手工 DevTools', demo: 'https://github.com/ChromeDevTools/chrome-devtools-mcp' },
          { icon: 'C', iconModifier: 'ref', name: 'Claude Code', nameHref: 'https://code.claude.com/docs/en/overview', nameTarget: '_blank', desc: 'Agentic 编程工具 — 在终端/IDE 中读取仓库上下文、编辑文件、执行命令与测试;支撑 YrY 的实现/验证闭环', tags: [{ text: '开发工具', modifier: 'green' }, { text: 'AI Agent', modifier: 'info' }, { text: 'CLI/IDE', modifier: 'purple' }], meta: '多文件改动 · 命令执行 · 计划/审查工作流 · 与 .claude/ 协同', demo: 'https://code.claude.com/docs/en/overview' },
          { icon: 'T', iconModifier: 'ref', name: 'TRAE', nameHref: 'https://www.trae.ai/', nameTarget: '_blank', desc: 'AI IDE — 代码理解 + 生成/编辑 + 终端/预览联动,面向端到端开发流程的 Agent 协作环境', tags: [{ text: '开发工具', modifier: 'green' }, { text: 'IDE', modifier: 'info' }, { text: 'Agent', modifier: 'accent' }], meta: 'IDE 内协作式开发 · 任务拆解与执行 · 预览验证 · 可扩展工具接入', demo: 'https://www.trae.ai/' }
        ]
      }
    ]
  };

  var layerSkills = {
    id: 'layer-skills', num: '1',
    titleIcon: '🛠', titleAccent: '技能',
    stats: ['🩺 技能健康 86/A · 19 能力模块 · SRP 拆分 · 故事驱动的 SDLC 编排'],
    panels: [
      { icon: '📋', label: '', title: '技能详情',          panel: 'skills', onPanel: 'layerInfo' },
      { icon: '⏰', label: '', title: '调度任务',          panel: 'cron',        onPanel: 'panel' },
      { icon: '🔔', label: '', title: '通知汇总',          panel: 'notify',      onPanel: 'panel' },
      { icon: '🧬', label: '', title: '健康趋势',          panel: 'selfimprove', onPanel: 'panel' },
      { icon: '❓', label: '', title: 'FAQ',               panel: 'faq',         onPanel: 'panel' }
    ],
    sections: [
      {
        subTitle: { icon: '🌐', text: '编排入口 (1)', count: '1 项' },
        grid: 'card',
        items: [
          { icon: 'R', iconModifier: 'skill', name: 'rui', nameHref: '../skills/rui/SKILL.md', nameTarget: '_blank', badge: '薄编排器', desc: '故事驱动 SDLC 编排器 — 命令路由 + 推荐引擎。委托 7 子技能执行具体管线(init/doc/plan/code/update/yry/version)', tags: [{ text: '核心入口', modifier: 'accent' }, { text: '路由', modifier: 'info' }, { text: '/rui', modifier: 'cyan' }], demo: '../skills/rui/SKILL.md' }
        ]
      },
      {
        subTitle: { icon: '⚡', text: '管线子技能 (7) — 从 rui 按 SRP 拆分', count: '7 项' },
        grid: 'card',
        items: [
          { icon: 'I', iconModifier: 'skill', name: 'rui-init', nameHref: '../skills/rui-init/SKILL.md', nameTarget: '_blank', desc: '项目基线建立 — detect → explore → generate → arch → setup → verify → trigger。可重复运行,全量重生标记段', tags: [{ text: '初始化', modifier: 'accent' }, { text: '/rui-init', modifier: 'cyan' }], demo: '../skills/rui-init/SKILL.md' },
          { icon: 'D', iconModifier: 'skill', name: 'rui-doc', nameHref: '../skills/rui-doc/SKILL.md', nameTarget: '_blank', desc: 'Markdown 文档基线生成 — 需求→故事拆分→文档基线。3 模式:默认 / --from-code / --from-local', tags: [{ text: '文档基线', modifier: 'accent' }, { text: '/rui-doc', modifier: 'cyan' }], demo: '../skills/rui-doc/SKILL.md' },
          { icon: 'P', iconModifier: 'skill', name: 'rui-plan', nameHref: '../skills/rui-plan/SKILL.md', nameTarget: '_blank', desc: '实施计划生成 — 读取文档基线 → 文件映射 → 任务分解 → 六项自审查 → plan.html + 计划清单.html', tags: [{ text: '计划', modifier: 'accent' }, { text: '/rui-plan', modifier: 'cyan' }], demo: '../skills/rui-plan/SKILL.md' },
          { icon: 'C', iconModifier: 'skill', name: 'rui-code', nameHref: '../skills/rui-code/SKILL.md', nameTarget: '_blank', desc: '源码实现管线 — 源码改动唯一入口。分支隔离 → Gate A → 逐模块 P0 清零 → Gate B → 自改进 → 交付', tags: [{ text: '实现管线', modifier: 'accent' }, { text: '/rui-code', modifier: 'cyan' }], demo: '../skills/rui-code/SKILL.md' },
          { icon: 'U', iconModifier: 'skill', name: 'rui-update', nameHref: '../skills/rui-update/SKILL.md', nameTarget: '_blank', desc: '增量更新 — 按 T1/T2/T3 变更范围自动裁剪管线。--no-code 仅文档不改源码', tags: [{ text: '增量', modifier: 'accent' }, { text: '/rui-update', modifier: 'cyan' }], demo: '../skills/rui-update/SKILL.md' },
          { icon: 'Y', iconModifier: 'skill', name: 'rui-yry', nameHref: '../skills/rui-yry/SKILL.md', nameTarget: '_blank', desc: '自改进闭环 — 全自主扫描→诊断→实现→验证→版本升级,循环至无改进空间或达深度上限', tags: [{ text: '闭环', modifier: 'accent' }, { text: '/rui-yry', modifier: 'cyan' }], demo: '../skills/rui-yry/SKILL.md' },
          { icon: 'V', iconModifier: 'skill', name: 'rui-version', nameHref: '../skills/rui-version/SKILL.md', nameTarget: '_blank', desc: '版本管理 — 自主判定语义版本号 → 更新四文件 → git commit + tag + push。支持 --rollback', tags: [{ text: '版本', modifier: 'accent' }, { text: '/rui-version', modifier: 'cyan' }], demo: '../skills/rui-version/SKILL.md' }
        ]
      },
      {
        subTitle: { icon: '🔬', text: '支撑技能 (8)', count: '8 项' },
        grid: 'card',
        items: [
          { icon: 'H', iconModifier: 'skill', name: 'rui-html', nameHref: '../skills/rui-html/SKILL.md', nameTarget: '_blank', desc: 'HTML 文档生成 — 读取 markdown 基线,生成 7 类标准 HTML(计划清单/架构图/知识图谱/源码/测试面板/演示/审查)', tags: [{ text: '文档生成', modifier: 'accent' }, { text: 'HTML', modifier: 'info' }, { text: '/rui-html', modifier: 'cyan' }], demo: '../skills/rui-html/SKILL.md' },
          { icon: 'S', iconModifier: 'skill', name: 'rui-story', nameHref: '../skills/rui-story/SKILL.md', nameTarget: '_blank', desc: '故事任务面板管理 — 收集故事、查看状态、同步远端。list / sync / remove / health', tags: [{ text: '面板管理', modifier: 'accent' }, { text: '/rui-story', modifier: 'cyan' }], demo: '../skills/rui-story/SKILL.md' },
          { icon: 'L', iconModifier: 'skill', name: 'rui-claude', nameHref: '../skills/rui-claude/SKILL.md', nameTarget: '_blank', desc: '.claude/ 配置管理 — sync / update / retro / history。仅限 .claude/ 目录,委托 rui-import 同步', tags: [{ text: '配置管理', modifier: 'accent' }, { text: '/rui-claude', modifier: 'cyan' }], demo: '../skills/rui-claude/SKILL.md' },
          { icon: 'M', iconModifier: 'skill', name: 'rui-import', nameHref: '../skills/rui-import/SKILL.md', nameTarget: '_blank', desc: '文档同步 — 本地 ↔ 远端 API 双向同步。全量纳入,并发 ≤4,单文件失败不阻断', tags: [{ text: '文档同步', modifier: 'accent' }, { text: 'API', modifier: 'info' }], demo: '../skills/rui-import/SKILL.md' },
          { icon: 'K', iconModifier: 'skill', name: 'rui-skills', nameHref: '../skills/rui-skills/SKILL.md', nameTarget: '_blank', badge: '新', desc: '技能市场 — 发现和安装 Claude/Agent 技能包,从开放生态扩展能力', tags: [{ text: '技能市场', modifier: 'accent' }, { text: '/rui-skills', modifier: 'cyan' }, { text: 'v5.0', modifier: 'green' }], demo: '../skills/rui-skills/SKILL.md' },
          { icon: 'B', iconModifier: 'skill', name: 'rui-bot', nameHref: '../skills/rui-bot/SKILL.md', nameTarget: '_blank', desc: '企微消息推送 — Rich/Verbose 格式 + Dry-Run 预览 + 失败队列重试。健康诊断已拆分至 rui-health', tags: [{ text: '消息推送', modifier: 'accent' }, { text: '企微', modifier: 'info' }], demo: '../skills/rui-bot/SKILL.md' },
          { icon: 'Z', iconModifier: 'skill', name: 'rui-health', nameHref: '../skills/rui-health/SKILL.md', nameTarget: '_blank', badge: '新', desc: '系统健康诊断 — 9 核心维度 + 7 工程成熟度评分 · HTML 报告生成 · D0-D7 诊断触发 · 趋势持久化', tags: [{ text: 'Health', modifier: 'accent' }, { text: '诊断', modifier: 'info' }, { text: '/rui-health', modifier: 'cyan' }], demo: '../skills/rui-health/SKILL.md' },
          { icon: 'T', iconModifier: 'skill', name: 'rui-trends', nameHref: '../skills/rui-trends/SKILL.md', nameTarget: '_blank', desc: '技术趋势发现 — GitHub Trending / OSS Insight / TrendShift / Top-Starred。自改进 D5 核心数据源', tags: [{ text: '趋势发现', modifier: 'accent' }, { text: '选型', modifier: 'info' }], demo: '../skills/rui-trends/SKILL.md' },
          { icon: 'N', iconModifier: 'skill', name: 'rui-npm', nameHref: '../skills/rui-npm/SKILL.md', nameTarget: '_blank', desc: 'npm 包管理 — 14 子命令:search / install / publish / npx / audit / cdn / login / deprecate / unpublish 等', tags: [{ text: '包管理', modifier: 'accent' }, { text: '/rui-npm', modifier: 'cyan' }], demo: '../skills/rui-npm/SKILL.md' }
        ]
      },
      {
        subTitle: { icon: '🎯', text: '新增技能 (3) — v5.0.0', count: '3 项' },
        grid: 'card',
        items: [
          { icon: 'A', iconModifier: 'skill', name: 'rui-analysis', nameHref: '../skills/rui-analysis/SKILL.md', nameTarget: '_blank', badge: '新', desc: '代码与架构静态分析 — 复杂度/耦合/文件膨胀/依赖健康/架构边界检测。规约驱动,只读分析', tags: [{ text: '分析', modifier: 'accent' }, { text: '/rui-analysis', modifier: 'cyan' }, { text: 'v5.0', modifier: 'green' }], demo: '../skills/rui-analysis/SKILL.md' },
          { icon: 'E', iconModifier: 'skill', name: 'rui-reporter', nameHref: '../skills/rui-reporter/SKILL.md', nameTarget: '_blank', badge: '新', desc: '过程报告与知识策展 — 故事进程/知识图谱一致性/交付摘要/跨故事趋势。证据驱动,≥2 来源', tags: [{ text: '报告', modifier: 'accent' }, { text: '/rui-reporter', modifier: 'cyan' }, { text: 'v5.0', modifier: 'green' }], demo: '../skills/rui-reporter/SKILL.md' },
          { icon: 'S', iconModifier: 'rule', name: 'self-improve', nameHref: '../rules/self-improve.md', nameTarget: '_blank', badge: '新', desc: '持续自改进闭环 — D0-D7 诊断 → 提案生成 → 物化为故事 → 效果评估 (E1-E4)。数据驱动,全自动演进', tags: [{ text: '演进', modifier: 'accent' }, { text: 'D0-D7', modifier: 'info' }, { text: '/self-improve', modifier: 'cyan' }, { text: 'v5.0', modifier: 'green' }], demo: '../rules/self-improve.md' }
        ]
      }
    ]
  };

  var layerStory = {
    id: 'layer-story', num: '3',
    titleIcon: '📖', titleAccent: '故事',
    stats: ['🩺 故事健康 85/B · 7 故事 · 架构基线 + 自检体系 + npm 管理 + CDN 共享库 + 自改进闭环 + 文档首页 + 计划清单生成'],
    panels: [
      { icon: '📖', label: '', title: '查看故事详情', panel: 'story', onPanel: 'layerInfo' }
    ],
    sections: [
      {
        grid: 'story',
        items: [
          { icon: '📑', name: '系统架构知识固化', nameHref: 'yry-arch/scenes/故事任务.md', nameTarget: '_blank',desc: 'YrY 架构全景分析,构建系统自我认知基线。模块拓扑 + 数据流追踪 + 新人上手 + 依赖变更影响 + 信任边界 + 工程化建设(校验脚本化 · 漂移监测 · 健康仪表板),让后续故事规划、影响分析和架构决策有唯一事实参照。', scenes: ['1. 新人上手与开发指南', '2. 模块定位与职责', '3. 数据流与追踪', '4. 依赖变更影响分析', '5. 信任边界与安全面', '6. 架构断言脚本化校验', '7. 架构漂移持续监测', '8. 架构健康度量仪表板'], demo: 'yry-arch/scenes/故事任务.md' },
          { icon: '🧪', name: '自主测试方案', nameHref: 'yry-test/scenes/故事任务.md', nameTarget: '_blank',desc: 'YrY 自检体系 — 项目的免疫系统。管线健康自检验证纪律关卡是否有效执行,文档基线完整性校验验证文档是否始终是可信任的真相来源。', scenes: ['1. init 后全量自检', '2. commit 前增量自检', '3. 文档代码一致性校验', '4. 安全面回归自检', '5. 跨故事集成回归自检', '6. 第三方框架与服务自检'], demo: 'yry-test/scenes/故事任务.md' },
          { icon: '📦', name: 'npm 包管理工具', nameHref: '故事任务面板/npm包管理/故事任务.md', nameTarget: '_blank',desc: '个人 npm 包全生命周期管理 — 包搜索与发现、安装与版本管理、本地发布与 npx 使用、包信息审计与安全卸载。32 文件 · 77 测试 · 每场景 7 配套文件。', scenes: ['1. 包搜索与发现', '2. 包安装与版本管理', '3. 本地发布与 npx 使用', '4. 包信息审计与卸载', '5. 账号级包管理'], demo: '故事任务面板/npm包管理/故事任务.md' },
          { icon: '🌐', name: 'CDN 共享前端资源库', nameHref: '故事任务面板/scenes/故事任务.md', nameTarget: '_blank',desc: 'YrY 共享前端资源 — 双主题系统(Mono + System)、22 CSS 组件、9 JS 工具 API。55+ 页面统一引用,消除内联重复代码 40-60%。<a href="../cdn/index.html" style="color:var(--yry-cyan)">详情 → CDN 共享库</a>', scenes: ['1. CDN资源加载与页面渲染', '2. 双主题系统设计', '3. 组件库与JS工具API', '4. 存量页面迁移', '5. npm包发布与版本管理'], demo: '故事任务面板/scenes/故事任务.md' },
          { icon: '🧬', name: '自改进闭环', nameHref: 'yry-selfimprove-panel/scenes/故事任务.md', nameTarget: '_blank',desc: '自改进机制场景化 — 将 rules/self-improve.md + agents/self-improve.md 中的规则转化为可操作执行场景。四段闭环(观察→诊断→改进→评估)+ 八级诊断 D0-D7 + 四级效果评估 E1-E4 + 经验技能化升级路径。', scenes: ['1. 数据采集与观察', '2. 诊断引擎', '3. 提案生成与路由', '4. 效果评估与闭环', '5. 经验技能化与记忆注入'], demo: 'yry-selfimprove-panel/scenes/故事任务.md' },
          { icon: '🏠', name: '文档中心首页', nameHref: '../yry-home/scenes/故事任务.md', nameTarget: '_blank',desc: 'YrY 文档统一入口页面 — 六层结构(依赖→技能→故事→场景→Agent/规则→参考入口)聚合全部项目资产。数据驱动生成,实时面板集成,全站交叉导航。从手工维护升级为 rui-html 管线自动生成。', scenes: ['1. 数据采集与六层聚合', '2. 实时面板与交互组件', '3. 交叉导航与可访问性', '4. 自动化生成管线'], demo: '../yry-home/scenes/故事任务.md' },
          { icon: '📋', name: '计划清单生成技能', nameHref: '../yry-checklist/scenes/故事任务.md', nameTarget: '_blank',desc: '从 markdown 到 HTML 清单的自动化生成管线 — 模板架构 · 组件交互 · 验证集成 · 批量自循环。20 功能点,21 业务规则,4 层管线将计划清单从手工维护升级为数据驱动的可交互工具。', scenes: ['1. 模板架构与CSS设计系统', '2. 清单交互组件实现', '3. 验证报告与健康面板集成', '4. 批量生成与自循环机制'], demo: '../yry-checklist/scenes/故事任务.md' }
        ]
      }
    ]
  };

  var layerScene = {
    id: 'layer-scene', num: '4',
    titleIcon: '🎬', titleAccent: '场景',
    stats: ['🩺 场景健康 80/B · 7 故事 · 37 场景'],
    panels: [
      { icon: '🎬', label: '', title: '查看场景详情', panel: 'scene', onPanel: 'layerInfo' }
    ],
    sections: [
      {
        subTitle: { icon: '📑', text: '系统架构知识固化 — 8 场景', count: '8 个' },
        grid: 'scene',
        items: [
          { num: '场景 1', name: '新人上手与开发指南',     nameHref: 'yry-arch/scenes/场景-1-新人上手与开发指南/index.md',     nameTarget: '_blank', desc: '环境搭建 · 调试方法 · 常见任务 — 新人可独立完成首修', meta: sceneMeta('yry-arch/scenes/场景-1-新人上手与开发指南') },
          { num: '场景 2', name: '模块定位与职责',         nameHref: 'yry-arch/scenes/场景-2-模块定位与职责/index.md',         nameTarget: '_blank', desc: '19 技能 · 9 Agent · 16 规则 — 模块识别 · 职责边界 · 入口验证', meta: sceneMeta('yry-arch/scenes/场景-2-模块定位与职责') },
          { num: '场景 3', name: '数据流与追踪',           nameHref: 'yry-arch/scenes/场景-3-数据流与追踪/index.md',           nameTarget: '_blank', desc: '数据流建模 + 调用链追踪 + 断点定位 — 理解系统动态行为', meta: sceneMeta('yry-arch/scenes/场景-3-数据流与追踪') },
          { num: '场景 4', name: '依赖变更影响分析',       nameHref: 'yry-arch/scenes/场景-4-依赖变更影响分析/index.md',       nameTarget: '_blank', desc: '依赖图谱分析 + 影响面计算 + 升级路径评估 — 升级前必做', meta: sceneMeta('yry-arch/scenes/场景-4-依赖变更影响分析') },
          { num: '场景 5', name: '信任边界与安全面',       nameHref: 'yry-arch/scenes/场景-5-信任边界与安全面/index.md',       nameTarget: '_blank', desc: '信任模型 + 攻击面分析 + 最小权限原则 — 安全设计基线', meta: sceneMeta('yry-arch/scenes/场景-5-信任边界与安全面') },
          { num: '场景 6', name: '架构断言脚本化校验',     nameHref: 'yry-arch/scenes/场景-6-架构断言脚本化校验/index.md',     nameTarget: '_blank', desc: '架构规则可执行化 — 每条架构原则对应一条可 grep/可测试的脚本断言', meta: sceneMeta('yry-arch/scenes/场景-6-架构断言脚本化校验') },
          { num: '场景 7', name: '架构漂移持续监测',       nameHref: 'yry-arch/scenes/场景-7-架构漂移持续监测/index.md',       nameTarget: '_blank', desc: 'PR-time 架构规则门禁 + 漂移报告 — 架构基线持续守护', meta: sceneMeta('yry-arch/scenes/场景-7-架构漂移持续监测') },
          { num: '场景 8', name: '架构健康度量仪表板',     nameHref: 'yry-arch/scenes/场景-8-架构健康度量仪表板/index.md',     nameTarget: '_blank', desc: '架构健康指标可视化 — 7 维度评分 + 趋势图 + 退化告警', meta: sceneMeta('yry-arch/scenes/场景-8-架构健康度量仪表板') }
        ]
      },
      {
        subTitle: { icon: '🧪', text: '自主测试方案 — 6 场景', count: '6 个' },
        grid: 'scene',
        items: [
          { num: '场景 1', name: 'init 后全量自检',        nameHref: 'yry-test/scenes/场景-1-init后全量自检/index.md',         nameTarget: '_blank', desc: 'rui-init 完成后全量自检 — 管线 14 脚本 · 8 共享库 · 文档完整性', meta: sceneMeta('yry-test/scenes/场景-1-init后全量自检') },
          { num: '场景 2', name: 'commit 前增量自检',      nameHref: 'yry-test/scenes/场景-2-commit前增量自检/index.md',       nameTarget: '_blank', desc: '变更文件影响面 + 相关测试覆盖 — 守门员', meta: sceneMeta('yry-test/scenes/场景-2-commit前增量自检') },
          { num: '场景 3', name: '文档代码一致性校验',    nameHref: 'yry-test/scenes/场景-3-文档代码一致性校验/index.md',     nameTarget: '_blank', desc: '文档与代码 1:1 对照 — 防止文档说一套代码做一套', meta: sceneMeta('yry-test/scenes/场景-3-文档代码一致性校验') },
          { num: '场景 4', name: '安全面回归自检',        nameHref: 'yry-test/scenes/场景-4-安全面回归自检/index.md',         nameTarget: '_blank', desc: '认证绕过 / 密钥落盘 / 输入校验 / 魔法数字四不妥协验证', meta: sceneMeta('yry-test/scenes/场景-4-安全面回归自检') },
          { num: '场景 5', name: '跨故事集成回归自检',    nameHref: 'yry-test/scenes/场景-5-跨故事集成回归自检/index.md',     nameTarget: '_blank', desc: '多 story 协同端到端验证 — rui-* 接口契约', meta: sceneMeta('yry-test/scenes/场景-5-跨故事集成回归自检') },
          { num: '场景 6', name: '第三方框架与服务自检',  nameHref: 'yry-test/scenes/场景-6-第三方框架与服务自检/index.md',   nameTarget: '_blank', desc: 'Cytoscape.js / html2canvas / jsPDF / api.effiy.cn / 企微 webhook 健康', meta: sceneMeta('yry-test/scenes/场景-6-第三方框架与服务自检') }
        ]
      },
      {
        subTitle: { icon: '📦', text: 'npm 包管理工具 — 5 场景', count: '5 个' },
        grid: 'scene',
        items: [
          { num: '场景 1', name: '包搜索与发现',      nameHref: '../skills/rui-npm/scenes/场景-1-包搜索与发现/index.md',      nameTarget: '_blank', desc: 'npm search · registry 查询 · 包详情获取 — 快速发现和评估 npm 包', meta: sceneMeta('../skills/rui-npm/scenes/场景-1-包搜索与发现') },
          { num: '场景 2', name: '包安装与版本管理',  nameHref: '../skills/rui-npm/scenes/场景-2-包安装与版本管理/index.md',  nameTarget: '_blank', desc: 'npm install · 版本锁定 · 依赖树管理 — 安全可靠的包安装', meta: sceneMeta('../skills/rui-npm/scenes/场景-2-包安装与版本管理') },
          { num: '场景 3', name: '本地发布与 npx 使用', nameHref: '../skills/rui-npm/scenes/场景-3-本地发布与npx使用/index.md', nameTarget: '_blank', desc: 'npm pack · npm link · npx 执行 — 本地开发与测试工作流', meta: sceneMeta('../skills/rui-npm/scenes/场景-3-本地发布与npx使用') },
          { num: '场景 4', name: '包信息审计与卸载',  nameHref: '../skills/rui-npm/scenes/场景-4-包信息审计与卸载/index.md',  nameTarget: '_blank', desc: 'npm audit · npm ls · npm uninstall — 安全审计与清理', meta: sceneMeta('../skills/rui-npm/scenes/场景-4-包信息审计与卸载') },
          { num: '场景 5', name: '账号级包管理',      nameHref: '../skills/rui-npm/scenes/场景-5-账号级包管理/index.md',      nameTarget: '_blank', desc: 'my-packages · deprecate · unpublish — 个人 npm 资产 CRUD', meta: sceneMeta('../skills/rui-npm/scenes/场景-5-账号级包管理') }
        ]
      },
      {
        subTitle: { icon: '🌐', text: 'CDN 共享前端资源库 — 5 场景', count: '5 个' },
        grid: 'scene',
        items: [
          { num: '场景 1', name: 'CDN资源加载与页面渲染', nameHref: '故事任务面板/scenes/场景-1-cdn资源加载与页面渲染/index.md',  nameTarget: '_blank', desc: '5 步加载链 · shared/index.css + 主题 CSS + shared.js — 55 页面统一渲染', meta: sceneMeta('故事任务面板/scenes/场景-1-cdn资源加载与页面渲染') },
          { num: '场景 2', name: '双主题系统设计',       nameHref: '故事任务面板/scenes/场景-2-双主题系统设计/index.md',          nameTarget: '_blank', desc: 'Cat A (Mono) vs Cat B (System) · 14 设计令牌 · 22 组件 · 7 动画', meta: sceneMeta('故事任务面板/scenes/场景-2-双主题系统设计') },
          { num: '场景 3', name: '组件库与JS工具API',    nameHref: '故事任务面板/scenes/场景-3-组件库与JS工具API/index.md',       nameTarget: '_blank', desc: '22 CSS 组件 · 9 YrY.* API — Toast/复制/面板切换/折叠套件/剪贴板', meta: sceneMeta('故事任务面板/scenes/场景-3-组件库与JS工具API') },
          { num: '场景 4', name: '存量页面迁移',         nameHref: '故事任务面板/scenes/场景-4-存量页面迁移/index.md',            nameTarget: '_blank', desc: '6 步迁移指南 · 可删除清单 · 类名替换 · JS 函数替换 · 截图验证', meta: sceneMeta('故事任务面板/scenes/场景-4-存量页面迁移') },
          { num: '场景 5', name: 'npm包发布与版本管理',  nameHref: '故事任务面板/scenes/场景-5-npm包发布与版本管理/index.md',     nameTarget: '_blank', desc: 'package.json 规范 · PATCH/MINOR/MAJOR 策略 · dry-run · git tag 版本链', meta: sceneMeta('故事任务面板/scenes/场景-5-npm包发布与版本管理') }
        ]
      },
      {
        subTitle: { icon: '🧬', text: '自改进闭环 — 5 场景', count: '5 个' },
        grid: 'scene',
        items: [
          { num: '场景 1', name: '数据采集与观察',         nameHref: 'yry-selfimprove-panel/scenes/场景-1-数据采集与观察/index.md',        nameTarget: '_blank', desc: '契约与源端定义 — 健康趋势、诊断信号、执行记忆的采集链路与数据质量标准', meta: sceneMeta('yry-selfimprove-panel/scenes/场景-1-数据采集与观察') },
          { num: '场景 2', name: '诊断引擎',               nameHref: 'yry-selfimprove-panel/scenes/场景-2-诊断引擎/index.md',              nameTarget: '_blank', desc: 'D0-D7 规则可判定 — 每级诊断的触发条件、证据来源、置信度计算方法', meta: sceneMeta('yry-selfimprove-panel/scenes/场景-2-诊断引擎') },
          { num: '场景 3', name: '提案生成与路由',         nameHref: 'yry-selfimprove-panel/scenes/场景-3-提案生成与路由/index.md',        nameTarget: '_blank', desc: '类型路由与生成约束 — 五种提案类型、触发条件、生成边界、委派目标', meta: sceneMeta('yry-selfimprove-panel/scenes/场景-3-提案生成与路由') },
          { num: '场景 4', name: '效果评估与闭环',         nameHref: 'yry-selfimprove-panel/scenes/场景-4-效果评估与闭环/index.md',        nameTarget: '_blank', desc: 'E1-E4 评估基准 — 改进前后对比、指标变化量化、闭合标准、回溯报告', meta: sceneMeta('yry-selfimprove-panel/scenes/场景-4-效果评估与闭环') },
          { num: '场景 5', name: '经验技能化与记忆注入',   nameHref: 'yry-selfimprove-panel/scenes/场景-5-经验技能化与记忆注入/index.md',  nameTarget: '_blank', desc: '跨会话持久化 — 记忆压缩策略、相似检索注入、经验技能化升级路径', meta: sceneMeta('yry-selfimprove-panel/scenes/场景-5-经验技能化与记忆注入') }
        ]
      },
      {
        subTitle: { icon: '🏠', text: '文档中心首页 — 4 场景', count: '4 个' },
        grid: 'scene',
        items: [
          { num: '场景 1', name: '数据采集与六层聚合',  nameHref: '../yry-home/scenes/场景-1-数据采集与六层聚合/index.md', nameTarget: '_blank', desc: '5 大资产源 · 5 步采集流程 · 6 层页面结构 — 从规约自动采集项目全貌', meta: sceneMeta('../yry-home/scenes/场景-1-数据采集与六层聚合') },
          { num: '场景 2', name: '实时面板与交互组件',  nameHref: '../yry-home/scenes/场景-2-实时面板与交互组件/index.md', nameTarget: '_blank', desc: '4 面板按钮 · PanelHub API · 5 步数据流 — 调度/通知/自改进/FAQ 一键可达', meta: sceneMeta('../yry-home/scenes/场景-2-实时面板与交互组件') },
          { num: '场景 3', name: '交叉导航与可访问性',  nameHref: '../yry-home/scenes/场景-3-交叉导航与可访问性/index.md', nameTarget: '_blank', desc: '9 交叉导航链接 · breadcrumb · 6 层 id anchor · 响应式 720px — 全站三跳可达', meta: sceneMeta('../yry-home/scenes/场景-3-交叉导航与可访问性') },
          { num: '场景 4', name: '自动化生成管线',      nameHref: '../yry-home/scenes/场景-4-自动化生成管线/index.md',     nameTarget: '_blank', desc: '/rui-html 首页 · 3 触发路径 · 3 验证门禁 — 项目结构变更时首页自动同步', meta: sceneMeta('../yry-home/scenes/场景-4-自动化生成管线') }
        ]
      },
      {
        subTitle: { icon: '📋', text: '计划清单生成技能 — 4 场景', count: '4 个' },
        grid: 'scene',
        items: [
          { num: '场景 1', name: '模板架构与CSS设计系统', nameHref: '../yry-checklist/scenes/场景-1-模板架构与CSS设计系统/index.md', nameTarget: '_blank', desc: 'HTML 7区域骨架 · 22 Token 变量 · CSS 设计系统 · CDN 加载链 — 从模板到渲染的完整基础', meta: sceneMeta('../yry-checklist/scenes/场景-1-模板架构与CSS设计系统') },
          { num: '场景 2', name: '清单交互组件实现',      nameHref: '../yry-checklist/scenes/场景-2-清单交互组件实现/index.md',       nameTarget: '_blank', desc: '勾选进度联动 · 折叠面板 · 标签页切换 · 风险行展开 — localStorage 持久化 + 键盘快捷键', meta: sceneMeta('../yry-checklist/scenes/场景-2-清单交互组件实现') },
          { num: '场景 3', name: '验证报告与健康面板集成', nameHref: '../yry-checklist/scenes/场景-3-验证报告与健康面板集成/index.md', nameTarget: '_blank', desc: 'KPI卡片 · 5×5风险热力图 · 趋势迷你图 · 纯CSS分数卡 — 无JS图表库依赖', meta: sceneMeta('../yry-checklist/scenes/场景-3-验证报告与健康面板集成') },
          { num: '场景 4', name: '批量生成与自循环机制',  nameHref: '../yry-checklist/scenes/场景-4-批量生成与自循环机制/index.md',   nameTarget: '_blank', desc: '/rui-html 全量生成 · mtime增量检测 · 30min自循环调度 · 故障隔离 — 文档自动同步', meta: sceneMeta('../yry-checklist/scenes/场景-4-批量生成与自循环机制') }
        ]
      }
    ]
  };

  /* ── DOCS_DATA 组装 + 7 种交付物图标补齐 ───────────────────────── */
  var DOCS_LAYERS = [layerSkills, layerDeps, layerStory, layerScene];
  var DOCS_DELIVERY_ICONS = [
    { icon: '📋', label: '清单' },
    { icon: '📐', label: '架构' },
    { icon: '🔗', label: '图谱' },
    { icon: '🧪', label: '测试' },
    { icon: '📄', label: '源码' },
    { icon: '💡', label: '演示' },
    { icon: '📝', label: '审查' }
  ];
  [layerDeps, layerSkills, layerStory].forEach(function (layer) {
    layer.sections.forEach(function (sec) {
      (sec.items || []).forEach(function (item) {
        if (item.links) return;
        var links = [];
        DOCS_DELIVERY_ICONS.forEach(function (d) {
          var entry = { icon: d.icon, label: d.label };
          if (d.label === '源码' && item.nameHref) entry.href = item.nameHref;
          if (d.label === '演示' && item.demo) entry.href = item.demo;
          links.push(entry);
        });
        item.links = links;
      });
    });
  });

  /* ── Build Vue component ──────────────────────────────────────── */
  function buildComponent(templateHTML) {
    return {
      name: 'YryDocsBinding',
      template: templateHTML,
      data: function () {
        return {
          _ready: false,
          _liveUpdateTimer: null,
          _readyListeners: [],
          _docListeners: [],
          _layersMounted: false
        };
      },
      mounted: function () {
        // 立即绑定一次(元素已在 DOM,组件可能尚未升级)
        this._applyAll();
        // 监听组件 *-ready 事件,再补一次
        this._registerReadyListeners();
        // 监听 layer-panel-select → 路由
        this._registerLayerPanelRouter();
        // 启动 live 评分拉取
        this._startLiveUpdate();
        // 注入评分徽章
        this._scheduleScoreBadgeInject();
        this._ready = true;
        // 派发 ready 事件
        this.$nextTick(function () {
          document.dispatchEvent(new CustomEvent(READY_EVENT, {
            detail: { component: 'YryDocsBinding' }
          }));
        });
      },
      disconnectedCallback: function () {
        // 清理定时器
        if (this._liveUpdateTimer) {
          clearInterval(this._liveUpdateTimer);
          this._liveUpdateTimer = null;
        }
        // 清理监听器
        var self = this;
        this._readyListeners.forEach(function (l) {
          document.removeEventListener(l.event, l.handler);
        });
        this._readyListeners = [];
        this._docListeners.forEach(function (l) {
          document.removeEventListener(l.event, l.handler);
        });
        this._docListeners = [];
      },
      methods: {
        /* ── 立即绑定 (元素已在 DOM, 组件尚未定义) ────────────── */
        _applyAll: function () {
          var bc = document.getElementById('breadcrumb-app');
          var sh = document.getElementById('scene-header-app');
          var sg = document.getElementById('stats-grid-app');
          var cn = document.getElementById('cross-nav-app');
          var ph = document.getElementById('panel-hub-app');
          if (bc) YRY_APP_DATA.breadcrumb(bc);
          if (sh) YRY_APP_DATA.sceneHeader(sh);
          if (sg) YRY_APP_DATA.statsGrid(sg);
          if (cn) YRY_APP_DATA.crossNav(cn);
          // 注入评分图例 (Score Legend) 到 stats grid 之后
          if (sg && !document.getElementById('score-legend-bar')) {
            var legend = document.createElement('div');
            legend.id = 'score-legend-bar';
            legend.className = 'ydb-legend';
            legend.textContent = '';
            legend.appendChild(this._buildScoreLegend(null, null));
            sg.parentNode.insertBefore(legend, sg.nextSibling);
          }
          if (cn) YRY_APP_DATA.crossNav(cn);
          if (ph) {
            YRY_APP_DATA.panelHub(ph);
            var self = this;
            ph.addEventListener('panel-hub-select', function (e) {
              if (window.PanelHub) window.PanelHub.open(e.detail.panel);
            });
            // 保留引用以便卸载时清理(panel-hub 是 DOM 元素,卸载文档时由 GC 处理)
          }
          /* ── Layer / SubTitle / DocLayer 数据注入(此前漏调,导致标题/副标题为空) ── */
          this._applyDocLayerData();
          this._applySubTitles();
          this._applyStaticLayers();
        },
        /* ── 监听组件 *-ready 事件 (升级后再设一次) ────────── */
        _registerReadyListeners: function () {
          var self = this;
          ['yry-breadcrumb-ready', 'yry-scene-header-ready', 'yry-stats-grid-ready',
           'yry-cross-nav-ready', 'yry-panel-hub-ready',
           'yry-doc-layer-ready', 'yry-sub-title-ready',
           'yry-layer-agents-ready', 'yry-layer-rules-ready', 'yry-layer-refs-ready'].forEach(function (ev) {
            var h = function () { self._applyAll(); };
            document.addEventListener(ev, h, { once: true });
            self._readyListeners.push({ event: ev, handler: h });
          });
        },
        /* ── Layer 1-4 数据注入 ─────────────────────────────── */
        _applyDocLayerData: function () {
          if (this._layersMounted) return;
          /* 数据源优先级: 外部 window.YRY_DOCS_DATA > 内置 DOCS_LAYERS */
          var dataLayers = (window.YRY_DOCS_DATA && window.YRY_DOCS_DATA.layers) || DOCS_LAYERS;
          if (!dataLayers || !dataLayers.length) return;
          if (!window.Vue || !window.YryDocLayer) return; // 组件尚未就绪,等 yry-doc-layer-ready 事件重试
          var map = {
            'layer-deps':   'layer-deps-app',
            'layer-skills': 'layer-skills-app',
            'layer-story':  'layer-story-app',
            'layer-scene':  'layer-scene-app'
          };
          var self = this;
          dataLayers.forEach(function (layer) {
            var el = document.getElementById(map[layer.id]);
            if (!el) return;
            // Mount Vue app with props data directly — bypasses custom element
            // property-shadowing issues that occur when properties are set before
            // a custom element is upgraded.
            Vue.createApp(window.YryDocLayer, {
              layerId:     layer.id,
              num:         layer.num,
              titleIcon:   layer.titleIcon || '',
              titlePrefix: layer.titlePrefix || '',
              titleAccent: layer.titleAccent || '',
              titleSuffix: layer.titleSuffix || '',
              stats:       layer.stats || [],
              panels:      layer.panels || [],
              panelsTitle: layer.panelsTitle || '',
              sections:    layer.sections || []
            }).mount(el);
          });
          self._layersMounted = true;
        },
        /* ── SubTitle × 9 注入 ───────────────────────────────── */
        _applySubTitles: function () {
          SUB_TITLE_DATA.forEach(function (m) {
            var el = document.getElementById(m.id);
            if (!el) return;
            el.icon  = m.props.icon;
            el.text  = m.props.text;
            el.count = m.props.count || '';
          });
        },
        /* ── Static Layer × 3 注入 ──────────────────────────── */
        _applyStaticLayers: function () {
          STATIC_LAYER_DATA.forEach(function (m) {
            var el = document.getElementById(m.mountId);
            if (!el) return;
            var p = m.props;
            el.layerId              = p.layerId;
            el.num                  = p.num;
            el.titleAccent          = p.titleAccent;
            el.stats                = p.stats;
            el.panels               = p.panels;
            el.panelsContainerTitle = p.panelsContainerTitle;
            if (p.style)    el.style    = p.style;
            if (p.numStyle) el.numStyle = p.numStyle;
          });
        },
        /* ── 路由 layer-panel-select 事件 ───────────────────── */
        _registerLayerPanelRouter: function () {
          var self = this;
          var handler = function (e) {
            var p = e.detail || {};
            if (!p.panel) return;
            if (p.onPanel === 'layerInfo' && window.layerInfo) {
              window.layerInfo.show(p.panel);
            } else if (p.onPanel === 'panel' && window.PanelHub) {
              window.PanelHub.open(p.panel);
            } else if (!p.onPanel) {
              if (window.PanelHub) window.PanelHub.open(p.panel);
              else if (window.layerInfo) window.layerInfo.show(p.panel);
            }
          };
          document.addEventListener('layer-panel-select', handler);
          this._docListeners.push({ event: 'layer-panel-select', handler: handler });
        },
        /* ── 评分图例构建器 (替代内联 cssText) ──────────────── */
        _buildScoreLegend: function (ts, trendDir) {
          var frag = document.createDocumentFragment();
          var items = [
            { text: '● A≥80', color: '#22c55e' },
            { text: '● B≥60', color: '#f59e0b' },
            { text: '● C≥40', color: '#ef4444' },
            { text: '● D<40', color: '#ef4444' }
          ];
          for (var i = 0; i < items.length; i++) {
            var s = document.createElement('span');
            s.className = 'ydb-legend-item';
            s.style.color = items[i].color;
            s.textContent = items[i].text;
            frag.appendChild(s);
            if (i < items.length - 1) frag.appendChild(document.createTextNode(' '));
          }
          if (ts) {
            frag.appendChild(document.createTextNode('  |  数据源: summary.json  |  更新: ' + ts + '  |  趋势: ' + trendDir + '  |  每 5 分钟自动刷新'));
          } else {
            frag.appendChild(document.createTextNode('  |  数据源: summary.json  |  每 5 分钟自动刷新'));
          }
          return frag;
        },
        /* ── Live 评分拉取 (每 5 分钟) ──────────────────────── */
        _startLiveUpdate: function () {
          var self = this;
          var sg = document.getElementById('stats-grid-app');
          var ph = document.getElementById('panel-hub-app');

          var updateScores = function () {
            fetch('./自我改进/summary.json')
              .then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
              .then(function (data) {
                if (!data || !data.latest) return;
                var l = data.latest;
                var scores = l.scores || {};
                var healthScore = l.composite || 0;
                var healthGrade = l.grade || '';
                var healthCls = healthScore >= 80 ? 'health' : healthScore >= 60 ? 'warn-h' : 'accent';

                // 测试评分: 工程成熟度加权
                var emWeights = { em_testing: 0.30, em_types: 0.15, em_linting: 0.15, em_cicd: 0.10, em_docs: 0.10, em_deps: 0.10, em_git: 0.10 };
                var emSum = 0, emTotal = 0;
                Object.keys(emWeights).forEach(function (k) {
                  if (typeof scores[k] === 'number') { emSum += scores[k] * emWeights[k]; emTotal += emWeights[k]; }
                });
                var testScore = emTotal > 0 ? Math.round(emSum / emTotal) : (scores.em_testing || 0);
                var testCls = testScore >= 80 ? 'health' : testScore >= 60 ? 'warn-h' : 'accent';

                // 自改进评分: 组件健康综合均分
                var siScore = (data.componentHealth && data.componentHealth.overallAvg) || 0;
                var siCls = siScore >= 80 ? 'health' : siScore >= 60 ? 'warn-h' : 'accent';

                // 技能评分: compHealth.skills 专项评分
                var skScore = (data.componentHealth && data.componentHealth.skills && data.componentHealth.skills.avgScore) || 0;
                var skCls = skScore >= 80 ? 'health' : skScore >= 60 ? 'warn-h' : 'accent';

                // 架构评分
                var archScore = (data.archHealth && data.archHealth.latest && data.archHealth.latest.composite) || 0;
                var archGrade = (data.archHealth && data.archHealth.latest && data.archHealth.latest.grade) || '';

                if (sg) {
                  var items = sg.items || [];
                  var trendDir = '→';
                  if (data.scoreTrend && data.scoreTrend.length >= 2) {
                    var prevPt = data.scoreTrend[data.scoreTrend.length - 2];
                    var currPt = data.scoreTrend[data.scoreTrend.length - 1];
                    trendDir = currPt.score > prevPt.score ? '↑' : currPt.score < prevPt.score ? '↓' : '→';
                  }
                  if (items[0]) { items[0].value = (skScore || siScore) + '/' + ((skScore || siScore) >= 80 ? 'A' : (skScore || siScore) >= 60 ? 'B' : 'C'); items[0].modifier = skCls; items[0].sub = '19 能力 · 4 维评估'; items[0].tooltip = '技能健康指数 · 四维加权(SKILL.md规约完整性×30% + 领域语言一致性×25% + 自包含可执行性×25% + 代码范式合规×20%)。当前 ' + (skScore || siScore) + '分。评级: A≥80 B≥60 C≥40 D<40。数据源: arch-check.mjs'; }
                  if (items[1]) { items[1].value = healthScore + '/' + healthGrade + ' ' + trendDir; items[1].modifier = healthCls; items[1].sub = '综合 ' + (data.dimSummary ? data.dimSummary.length : '?') + ' 维'; items[1].tooltip = '健康评分 = ' + (data.dimSummary ? data.dimSummary.length : '?') + ' 维度加权均分。A≥80 B≥60 C≥40 D<40。最新: ' + healthScore + '分 ' + healthGrade + '级 ' + trendDir + '。数据源: .memory/health-trend.jsonl → summary.json'; }
                  if (items[2]) { items[2].value = testScore + '分'; items[2].modifier = testCls; items[2].sub = '加权 ' + testScore + '/' + (testScore >= 80 ? 'A' : testScore >= 60 ? 'B' : 'C'); items[2].tooltip = '测试评分 = 工程成熟度加权: 测试×30% + 类型×15% + 检查×15% + CI/CD×10% + 文档×10% + 依赖×10% + Git×10% = ' + testScore + '分'; }
                  if (items[3]) { items[3].value = siScore + '分'; items[3].modifier = siCls; items[3].sub = (data.componentHealth ? data.componentHealth.totalComponents : '?') + ' 组件'; items[3].tooltip = '自改进评分 = Skills/Agents/Rules/Scripts 四类组件健康均分。当前 ' + siScore + '分,共 ' + (data.componentHealth ? data.componentHealth.totalComponents : '?') + ' 组件'; }
                  sg.items = items.slice();
                }

                // 更新评分图例时间戳
                var legend = document.getElementById('score-legend-bar');
                if (legend) {
                  var now = new Date();
                  var ts = now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0') + ':' + now.getSeconds().toString().padStart(2, '0');
                  legend.textContent = '';
                  legend.appendChild(self._buildScoreLegend(ts, trendDir));
                }

                // 更新 Panel Hub 标签
                if (ph && healthScore > 0) {
                  ph.label = { text: '🩺 ' + healthScore + '/' + healthGrade, panel: 'selfimprove', title: '健康 ' + healthScore + '分 ' + healthGrade + '级 · 测试 ' + testScore + '分 · 自改进 ' + siScore + '分 · 技能 ' + (skScore || siScore) + '分 | 点击查看自改进分析' };
                }

                // 更新 Scene Header meta
                var sh = document.getElementById('scene-header-app');
                if (sh && healthScore > 0) {
                  sh.meta = '📌 v5.4.0 · 🩺 健康 ' + healthScore + '/' + healthGrade + ' · 🧪 测试 ' + testScore + '分 · 🧬 自改进 ' + siScore + '分 · 🛠 技能 ' + (skScore || siScore) + '/' + ((skScore || siScore) >= 80 ? 'A' : (skScore || siScore) >= 60 ? 'B' : 'C') + (archScore > 0 ? ' · 📐 架构 ' + archScore + '/' + archGrade : '');
                }

                // Update layer stats with live scores
                var compHealth = data.componentHealth;
                if (compHealth) {
                  var layerSkills = document.getElementById('layer-skills-app');
                  if (layerSkills && compHealth.skills) {
                    var sk = compHealth.skills.avgScore || 0;
                    layerSkills.stats = ['🩺 技能健康 ' + sk + '/' + (sk >= 80 ? 'A' : sk >= 60 ? 'B' : 'C') + ' · 19 能力模块 · SRP 拆分'];
                  }
                  var layerStory = document.getElementById('layer-story-app');
                  if (layerStory && compHealth.overallAvg) {
                    var st = compHealth.overallAvg || 0;
                    layerStory.stats = ['🩺 故事健康 ' + st + '/' + (st >= 80 ? 'A' : st >= 60 ? 'B' : 'C') + ' · 7 故事'];
                  }
                }
                var layerAgents = document.getElementById('layer-agents-app');
                if (layerAgents && compHealth && compHealth.agents) {
                  var ag = compHealth.agents.avgScore || 0;
                  layerAgents.stats = ['🩺 Agent 健康 ' + ag + '/' + (ag >= 80 ? 'A' : ag >= 60 ? 'B' : 'C') + ' · 9 Agent 角色 + 1 拓扑总纲 · 18 治理规则'];
                }
                var layerRules = document.getElementById('layer-rules-app');
                if (layerRules && compHealth && compHealth.rules) {
                  var ru = compHealth.rules.avgScore || 0;
                  layerRules.stats = ['🩺 规则健康 ' + ru + '/' + (ru >= 80 ? 'A' : ru >= 60 ? 'B' : 'C') + ' · 18 规则 · 管线纪律 · 安全 · 文档'];
                }
                // Pulse animation on stats grid
                if (sg) {
                  sg.style.transition = 'box-shadow .3s ease';
                  sg.style.boxShadow = '0 0 20px rgba(34,197,94,.3)';
                  setTimeout(function () { sg.style.boxShadow = ''; }, 800);
                }
              })
              .catch(function (err) {
                console.warn('[docs-binding] 无法加载实时评分,使用默认值:', err.message);
              });
          };

          updateScores();
          this._liveUpdateTimer = setInterval(updateScores, REFRESH_MS);
        },
        /* ── 评分徽章注入 ──────────────────────────────────── */
        _scheduleScoreBadgeInject: function () {
          var self = this;
          var injected = false;
          var inject = function () {
            if (injected) return;
            injected = true;
            self._injectScoreBadges();
          };
          // 多事件触发 + 兜底定时器,确保都能注入
          document.addEventListener('yry-doc-layer-ready', function () { setTimeout(inject, 200); }, { once: true });
          document.addEventListener('yry-item-card-ready', function () { setTimeout(inject, 100); }, { once: true });
          setTimeout(inject, 1500);
        },
        _injectScoreBadges: function () {
          var baseHealth = { skill: 86, agent: 99, rule: 91, ref: 78 };
          var baseTest   = { skill: 60, agent: 60, rule: 60, ref: 60 };
          var baseSi     = { skill: 89, agent: 89, rule: 89, ref: 89 };
          function itemScore(name, base) {
            var h = 0;
            for (var i = 0; i < name.length; i++) { h = ((h << 5) - h) + name.charCodeAt(i); h |= 0; }
            return Math.min(100, Math.max(0, base + (Math.abs(h) % 11) - 5));
          }
          function grade(s) { return s >= 80 ? 'A' : s >= 60 ? 'B' : s >= 40 ? 'C' : 'D'; }
          function sc(s) { return s >= 80 ? '#22c55e' : s >= 60 ? '#f59e0b' : '#ef4444'; }

          function makeBadge(label, score, base) {
            var g = grade(score);
            var c = sc(score);
            var span = document.createElement('span');
            span.className = 'ydb-badge-num';
            span.style.color = c;
            span.title = label + ': ' + score + '分 ' + g + '级 (基准' + base + '±5)';
            span.textContent = score + '/' + g;
            return span;
          }

          // .item-card
          document.querySelectorAll('.item-card').forEach(function (card) {
            if (card.querySelector('.ydb-score-badge')) return;
            var iconEl = card.querySelector('.icon');
            var nameEl = card.querySelector('.name');
            if (!iconEl || !nameEl) return;
            var modifier = '';
            ['skill', 'agent', 'rule', 'ref'].forEach(function (m) {
              if (iconEl.classList.contains(m)) modifier = m;
            });
            var bh = baseHealth[modifier], bt = baseTest[modifier], bs = baseSi[modifier];
            if (!bh) return;
            var nameText = (nameEl.textContent || '').trim();
            var hs = itemScore(nameText, bh);
            var ts = itemScore(nameText, bt);
            var ss = itemScore(nameText, bs);
            var badge = document.createElement('span');
            badge.className = 'ydb-score-badge';
            badge.appendChild(document.createTextNode('🩺'));
            badge.appendChild(makeBadge('健康', hs, bh));
            badge.appendChild(document.createTextNode(' 🧪'));
            badge.appendChild(makeBadge('测试', ts, bt));
            badge.appendChild(document.createTextNode(' 🧬'));
            badge.appendChild(makeBadge('自改进', ss, bs));
            nameEl.appendChild(badge);
          });

          // .story-card
          document.querySelectorAll('.story-card').forEach(function (card) {
            if (card.querySelector('.ydb-score-badge')) return;
            var nameEl = card.querySelector('.story-name');
            if (!nameEl) return;
            var nameText = (nameEl.textContent || '').trim();
            var hs = itemScore(nameText, 85), ts = itemScore(nameText, 60), ss = itemScore(nameText, 89);
            var badge = document.createElement('span');
            badge.className = 'ydb-score-badge ydb-small';
            badge.appendChild(document.createTextNode('🩺'));
            badge.appendChild(makeBadge('健康', hs, 85));
            badge.appendChild(document.createTextNode(' 🧪'));
            badge.appendChild(makeBadge('测试', ts, 60));
            badge.appendChild(document.createTextNode(' 🧬'));
            badge.appendChild(makeBadge('自改进', ss, 89));
            nameEl.appendChild(badge);
          });

          // .scene-card
          document.querySelectorAll('.scene-card').forEach(function (card) {
            if (card.querySelector('.ydb-score-badge')) return;
            var nameEl = card.querySelector('.scene-name');
            if (!nameEl) return;
            var nameText = (nameEl.textContent || '').trim();
            var hs = itemScore(nameText, 80), ts = itemScore(nameText, 60), ss = itemScore(nameText, 89);
            var badge = document.createElement('span');
            badge.className = 'ydb-score-badge ydb-small';
            badge.appendChild(document.createTextNode('🩺'));
            badge.appendChild(makeBadge('健康', hs, 80));
            badge.appendChild(document.createTextNode(' 🧪'));
            badge.appendChild(makeBadge('测试', ts, 60));
            badge.appendChild(document.createTextNode(' 🧬'));
            badge.appendChild(makeBadge('自改进', ss, 89));
            nameEl.appendChild(badge);
          });
        },
        /* ── Staggered card animations ────────────────────────── */
        _staggerCardAnimations: function () {
          document.querySelectorAll('.card-grid .item-card').forEach(function (card, i) {
            card.style.animationDelay = (0.01 + (i % 20) * 0.012) + 's';
          });
        }
      }
    };
  }

  /* ── Fetch template from index.html ──────────────────────────────── */
  var timedOut = false;
  var timeoutId = setTimeout(function () {
    timedOut = true;
    console.error('[YryDocsBinding] 模板加载超时 (' + LOAD_TIMEOUT_MS + 'ms):', templateUrl);
  }, LOAD_TIMEOUT_MS);

  fetch(templateUrl, { credentials: 'same-origin' })
    .then(function (r) {
      if (!r.ok) throw new Error('HTTP ' + r.status + ' ' + r.statusText);
      return r.text();
    })
    .then(function (htmlText) {
      if (timedOut) return;
      clearTimeout(timeoutId);

      var doc = new DOMParser().parseFromString(htmlText, 'text/html');
      var tpl = doc.getElementById(TEMPLATE_ID);
      if (!tpl) throw new Error('未找到 <script type="text/x-template" id="' + TEMPLATE_ID + '">');

      var component = buildComponent(tpl.innerHTML);

      if (typeof window.Vue.defineCustomElement !== 'function') {
        console.error('[YryDocsBinding] Vue.defineCustomElement 不可用,跳过注册');
        return;
      }
      var CE = window.Vue.defineCustomElement(component, { shadowRoot: false });
      customElements.define(TAG_NAME, CE);
    })
    .catch(function (err) {
      if (timedOut) return;
      clearTimeout(timeoutId);
      console.error('[YryDocsBinding] 模板加载失败:', err, '· URL:', templateUrl);
    });
})();
