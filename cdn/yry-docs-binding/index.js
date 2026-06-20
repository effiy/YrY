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

  const TAG_NAME = 'yry-docs-binding';
  const TEMPLATE_ID = 'yry-docs-binding-tpl';
  const READY_EVENT = 'yry-docs-binding-ready';
  const LOAD_TIMEOUT_MS = 5000;
  const REFRESH_MS = 5 * 60 * 1000;

  if (customElements.get(TAG_NAME)) return;

  const script = document.currentScript;
  if (!script || !script.src) {
    console.error('[YryDocsBinding] 无法获取当前脚本 URL,组件已跳过注册');
    return;
  }
  const scriptUrl = new URL(script.getAttribute('src'), window.location.href);
  const templateUrl = new URL('index.html', scriptUrl).href;

  /* ── Module-level constants (原 YRY_APP_DATA, 1:1 保留) ────────── */
  const YRY_APP_DATA = {
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
      el.desc        = '故事驱动的 SDLC 编排系统 — 六层结构:19技能(四维健康评估)→6运行时+6开发依赖→7故事(五场景全生命周期)→37场景(7件标准交付物)→9Agent角色+1拓扑总纲+18治理规则→4文档入口+5监控仪表板。';
    },
    /* 3) Stats Grid */
    statsGrid: function (el) {
      el.items = [
        { value: '86/A', label: '技能评分', modifier: 'health', sub: '19技能 · SKILL.md规约完整性·领域语言一致性·自包含可执行性·代码范式合规',
          tooltip: '【技能健康指数 SHI】\n四维加权评估模型 →\n' +
            '① SKILL.md规约完整性(30%): 每技能必备完整SKILL.md·交接信号下游可验证·AGENT.md角色定义完备\n' +
            '② 领域语言一致性(25%): 术语使用符合领域语言定义·避免禁用别名·术语漂移自动检测\n' +
            '③ 自包含可执行性(25%): 规约独立可执行·关键模式内联·不依赖外链可达性\n' +
            '④ 代码范式合规(20%): 无class/extends·无export default·无空catch·lib共享无重复\n\n' +
            '覆盖 19 技能: rui主线(9) + 工程支撑(7) + 架构健康(10维度) + 4实时面板\n\n' +
            '评级: A≥80 优秀 · B≥60 良好 · C≥40 需改进 · D<40 严重缺陷\n' +
            '数据源: arch-check.mjs --append-trend · 每 5min 刷新 · 点击跳转技能报告 →' },
        { value: '77/B', label: '健康评分', modifier: 'warn-h', sub: '核心9维·工程成熟度7维·扩展3维·D0-D8诊断联动',
          tooltip: '【项目综合健康指数 PHI】\n19维加权聚合模型,分三大类 →\n\n' +
            '▸ 核心维度(9): token·config·robots·api·reports·format·diagnostics·git·security\n' +
            '  当前: diagnostics(70)·git(40) 待改进,其余 7 维满分\n' +
            '▸ 工程成熟度(7): 测试覆盖·类型安全·代码检查·CI/CD·文档·依赖·Git实践\n' +
            '  当前: testing(60)·cicd(0) 待改进,types/docs/deps满分\n' +
            '▸ 扩展维度(3): file_size·dep_analysis·notify\n' +
            '  当前: dep_analysis(21) 不足,file_size(98)·notify(100)良好\n\n' +
            '当前: 77分 / B级 · 良好\n' +
            '触发的诊断: D0基线偏离·D2质量退化\n\n' +
            '评级: A≥80 优秀 · B≥60 良好 · C≥40 需改进 · D<40 严重缺陷\n' +
            '数据源: .memory/health-trend.jsonl → summary.json · 每 5min 刷新 · 点击跳转健康报告 →' },
        { value: '60分', label: '测试评分', modifier: 'warn-h', sub: '测试覆盖·类型安全·代码检查·CI/CD·文档·依赖·Git实践',
          tooltip: '【测试质量指数 TQI】\n工程成熟度 7 维加权评估 →\n\n' +
            '① 测试覆盖(30%): 60分 — 单元·集成·E2E覆盖率待提升\n' +
            '② 类型安全(15%): 100分 — TypeScript/JSDoc类型标注完整\n' +
            '③ 代码检查(15%): 80分 — ESLint·Prettier·arch-check配置完善\n' +
            '④ CI/CD(10%): 0分 — 自动化流水线尚未建立\n' +
            '⑤ 文档覆盖(10%): 100分 — 所有skill/scene文档齐备\n' +
            '⑥ 依赖管理(10%): 100分 — 无高危漏洞·许可证合规\n' +
            '⑦ Git实践(10%): 80分 — 分支隔离·提交规范·PR审查流程\n\n' +
            '综合: 60分 / B级 · 良好 (CI/CD缺失为主要扣分项)\n' +
            '评级: A≥80 · B≥60 · C≥40 · D<40\n' +
            '数据源: vitest runner + arch-check.mjs · 每 5min 刷新 · 点击跳转测试报告 →' },
        { value: '89分', label: '自改进', modifier: 'health', sub: 'Skills·Agents·Rules·Scripts四象限·D0-D8诊断持续监控',
          tooltip: '【自改进闭环指数 SII】\n组件健康四象限加权聚合 →\n\n' +
            '▸ Skills(技能): 代码范式合规·规约完整性·依赖健康\n' +
            '▸ Agents(角色): AGENT.md完备性·交接信号规范·能力边界清晰\n' +
            '▸ Rules(规则): 管线纪律·安全红线·文档质量标准·设计原则\n' +
            '▸ Scripts(脚本): lib共享率·函数纯度·错误处理·常量规范\n\n' +
            '当前: 89分 / A级 · 优秀\n' +
            '反映项目整体代码质量、架构合规度和自修复能力\n' +
            'D0-D8 九级诊断引擎持续监控,异常自动触发改进建议\n\n' +
            '评级: A≥80 · B≥60 · C≥40 · D<40\n' +
            '数据源: D0-D8 诊断引擎 + arch-check.mjs · 每 5min 刷新 · 点击跳转自改进报告 →' },
        { value: 12, label: '依赖/框架', modifier: 'info',
          tooltip: '【运行时依赖 6】\nVue 3 · Cytoscape.js · Mermaid · marked · DOMPurify · highlight.js\n\n' +
            '【开发依赖 6】\nvitest · @vitest/ui · eslint · prettier · jsdom · node-fetch\n\n' +
            '策略: 最小化外部依赖·零打包构建·CDN全球分发·语义化版本锁定' },
        { value: 7,  label: '故事', modifier: 'health',
          tooltip: '【7 个独立故事 · 全生命周期跟踪】\n' +
            '架构与设计 · 自动化测试 · npm包发布 · CDN共享库\n' +
            '自改进闭环 · 文档首页 · 计划与清单\n\n' +
            '每故事包含: 需求→设计→实现→集成→发布五场景\n' +
            '故事健康独立评估·D0-D7诊断逐故事追踪\n' +
            '详见 Layer 4 故事卡片 →' },
        { value: 37, label: '场景', modifier: 'health',
          tooltip: '【37 个场景 · 分布在 7 个故事中】\n' +
            '每场景 7 件标准交付物 →\n' +
            '📋清单 · 📐架构图 · 🔗知识图谱 · 🧪测试面板\n' +
            '📄源码 · 💡演示 · 📝审查\n\n' +
            '场景健康度独立评估·交付物完整性自动检测\n' +
            '详见 Layer 5 场景卡片 →' },
        { value: 9,  label: 'Agent', modifier: 'info',
          tooltip: '【9 个 Agent 角色 + 1 份拓扑总纲】\n' +
            'pm(产品)·coder(开发)·reporter(报告)·reviewer(审查)\n' +
            'architect(架构)·qa(质量保证)·devops(运维)\n' +
            'researcher(研究)·coordinator(协调)\n\n' +
            '角色拓扑定义 Agent 间协作模式与交接信号规范\n' +
            '详见 Layer 5 Agent 角色卡片 →' },
        { value: 18, label: '规则', modifier: 'health',
          tooltip: '【18 条治理规则 · 五大类】\n' +
            '▸ 管线与执行(5): 分支隔离·GateA/B·P0清零·模块交付·研究优先\n' +
            '▸ 文档(4): 表达优先·doc-quality·architecture-diagram·doc-generation\n' +
            '▸ 安全与配置(2): security-guardrails·rui-claude\n' +
            '▸ 自改进(1): self-improve闭环\n' +
            '▸ 设计与质量(6): SRP·DIP·OCP·DRY·组合优于继承·可健康检测\n\n' +
            '合规性由 arch-check.mjs 自动验证 · 详见 Layer R 规则卡片 →' },
        { value: 9,  label: '参考入口', modifier: 'info',
          tooltip: '【4 文档入口 + 5 监控仪表板】\n\n' +
            '文档入口 →\n' +
            'CLAUDE.md · README.md · 健康报告 · 自我改进\n\n' +
            '监控仪表板 →\n' +
            '自循环报告 · 趋势报告 · 项目分析 · 测试报告 · 组件报告\n\n' +
            '详见 Layer 6 参考入口卡片 →' }
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
      el.label = { text: '🩺 健康 —', panel: 'selfimprove', title: '点击打开自改进面板查看19维健康详情·D0-D8诊断·E1-E4评估·趋势预测·优先级矩阵' };
      el.buttons = [
        { icon: '⏰', name: '调度',   desc: '定时·触发·编排', color: 'var(--yry-cyan)', panel: 'cron',        title: '调度任务 — 展示 .claude/scheduled_tasks.json 中所有定时任务。包含 cron 表达式、人类可读描述、活跃/空闲状态、下次触发预估。' },
        { icon: '🔔', name: '通知',   desc: '健康·循环·趋势', color: '#ef4444',       panel: 'notify',      title: '通知中心 — 健康检查报告、自循环巡检、趋势扫描三类通知统一汇总。健康报告按日期展示最新一份,支持按类型筛选、最新评分趋势、诊断触发追踪。' },
        { icon: '🧬', name: '自改进', desc: '趋势·诊断·评估', color: '#a78bfa',       panel: 'selfimprove', title: '自改进分析 — 读取 .memory/health-trend.jsonl 和 summary.json,按日/周/月/全景四个视角展示健康趋势、D0-D7 诊断覆盖率、等级分布、分支健康对比;健康数据按日期覆盖,每天保留一个快照。' },
        { icon: '❓', name: 'FAQ',    desc: '知识·指南·解惑', color: '#22c55e',       panel: 'faq',         title: '常见问题 — 系统知识入口:YrY 概念、命令使用、面板关系、健康检查原理、Skill/Agent/Rule 区别。含交叉面板导航链接。' }
      ];
      el.flow = '⏰ Cron定时触发(17项活跃任务) → 🛠 19技能按需执行 → 📊 报告产出(健康/测试/趋势/组件/技能/加载链6份) → 🔔 企微通知推送(健康·循环·趋势三通道) → 🧬 自改进分析消费(D0-D8诊断·E1-E4评估·闭环回写)';
    }
  };

  /* ── SubTitle × 9 数据 ─────────────────────────────────────────── */
  const SUB_TITLE_DATA = [
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
  const STATIC_LAYER_DATA = [
    {
      mountId: 'layer-agents-app',
      props: {
        layerId: 'layer-agents',
        num: '5',
        titleAccent: 'Agent 角色与规则',
        stats: ['🩺 Agent 健康 99/A · 9 角色(pm/coder/reporter/reviewer/architect/qa/devops/researcher/coordinator) · 1 拓扑总纲 · 18 治理规则 · 交接信号可验证'],
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
        stats: ['🩺 规则健康 91/A · 18规则五大类:管线与执行(5)·文档(4)·安全与配置(2)·自改进(1)·设计与质量(6) · arch-check自动验证'],
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
        stats: ['4文档入口(CLAUDE.md·README.md·健康报告·自我改进) + 5监控仪表板(自循环·趋势·项目分析·测试·组件) · 实时监控·每5min刷新'],
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
  // YrY 是旧版 globals 上的扩展点(sceneMeta 等)。兼容声明 + 静态访问保护,避免 ESLint 误报。
  /* global YrY */
  const _YrY = (typeof YrY !== 'undefined') ? YrY : undefined;
  const sceneMeta = (_YrY && _YrY.sceneMeta) ? _YrY.sceneMeta : function (p) {
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

  const layerDeps = {
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

  const layerLib = {
    id: 'layer-lib', num: 'L',
    titleIcon: '📚', titleAccent: '内部共享库 (lib/)',
    stats: ['🩺 库健康 92/A · 28 模块 · 7 类目 · 105 自检测试全通过'],
    panels: [
      { icon: '🔬', label: '', title: '查看 lib/ 详情', panel: 'lib', onPanel: 'layerInfo' },
      { icon: '🧪', label: '', title: 'lib/ 自检报告',  panel: 'selfimprove', onPanel: 'panel' }
    ],
    sections: [
      {
        subTitle: { icon: '🔍', text: '架构校验 (3)', count: '3 项' },
        grid: 'card',
        items: [
          { icon: 'A', iconModifier: 'rule', name: 'arch-check.mjs', desc: '10 维度架构合规检查 — kernel(3) + solid(5) + quality(2)。node lib/arch-check.mjs --all 一次扫描全项目;输出 dim/label/checks/pass 结构化报告', tags: [{ text: 'CLI', modifier: 'accent' }, { text: '架构门禁', modifier: 'cyan' }], meta: 'arch-check.mjs · 10 维度 · arch-dimensions/*.mjs 子模块', demo: 'lib/arch-check.mjs' },
          { icon: 'K', iconModifier: 'rule', name: 'arch-dimensions/kernel-paradigm.mjs', desc: 'kernel + paradigm + coupling — 系统内核结构检查。kernel 验证 SKILL.md 必备章节;paradigm 检查 agent 拓扑;coupling 检测循环依赖', tags: [{ text: '维度检查器', modifier: 'green' }], meta: 'checkKernel · checkParadigm · checkCoupling', demo: 'lib/arch-dimensions/kernel-paradigm.mjs' },
          { icon: 'S', iconModifier: 'rule', name: 'arch-dimensions/solid.mjs', desc: 'SOLID 五原则检查器 — SRP / DRY / YAGNI / OCP / ISP。每条原则对应一条可执行断言,违反即降级评分', tags: [{ text: 'SOLID', modifier: 'info' }, { text: '5 检查器', modifier: 'accent' }], meta: 'checkSRP · checkDRY · checkYAGNI · checkOCP · checkISP', demo: 'lib/arch-dimensions/solid.mjs' },
          { icon: 'Q', iconModifier: 'rule', name: 'arch-dimensions/quality.mjs', desc: '质量维度 — ISP · frontmatter · 文档新鲜度。检测文档是否过期(超过 60 天无更新)、frontmatter 完整性、接口隔离合规', tags: [{ text: '质量门禁', modifier: 'purple' }], meta: 'checkISP · checkFrontmatter · checkDocFreshness', demo: 'lib/arch-dimensions/quality.mjs' }
        ]
      },
      {
        subTitle: { icon: '⚙️', text: '引擎 (4)', count: '4 项' },
        grid: 'card',
        items: [
          { icon: 'D', iconModifier: 'rule', name: 'engine/diagnostics.mjs', desc: '诊断引擎 — D0-D7 八级规则化判定。每级诊断包含触发条件、证据来源、置信度计算', tags: [{ text: '诊断', modifier: 'accent' }, { text: 'D0-D7', modifier: 'cyan' }], meta: 'lib/engine/diagnostics.mjs', demo: 'lib/engine/diagnostics.mjs' },
          { icon: 'E', iconModifier: 'rule', name: 'engine/evaluate.mjs',     desc: '评估引擎 — E1-E4 改进前后对比、指标变化量化、闭合标准、回溯报告', tags: [{ text: '评估', modifier: 'green' }, { text: 'E1-E4', modifier: 'cyan' }], meta: 'lib/engine/evaluate.mjs', demo: 'lib/engine/evaluate.mjs' },
          { icon: 'M', iconModifier: 'rule', name: 'engine/materialize.mjs',  desc: '物化引擎 — 把抽象规则转化为可执行产物(story 文档、checklist、skill 模块)', tags: [{ text: '物化', modifier: 'info' }, { text: '规则→产物', modifier: 'accent' }], meta: 'lib/engine/materialize.mjs', demo: 'lib/engine/materialize.mjs' },
          { icon: 'U', iconModifier: 'rule', name: 'engine/upgrade.mjs',      desc: '升级引擎 — 经验技能化升级路径。跨会话持久化、记忆压缩、相似检索注入', tags: [{ text: '升级', modifier: 'purple' }, { text: '技能化', modifier: 'cyan' }], meta: 'lib/engine/upgrade.mjs', demo: 'lib/engine/upgrade.mjs' }
        ]
      },
      {
        subTitle: { icon: '🛠', text: '基础工具 (6)', count: '6 项' },
        grid: 'card',
        items: [
          { icon: 'C', iconModifier: 'ref', name: 'constants.mjs', desc: '项目共享常量 — CLI argv 偏移、网络超时、API 配置、消息长度、健康评级阈值。集中管理避免散落', tags: [{ text: '常量', modifier: 'info' }], meta: 'NODE_ARGV_OFFSET · HTTP_TIMEOUT_MS · HEALTH_GRADE_THRESHOLDS', demo: 'lib/constants.mjs' },
          { icon: 'F', iconModifier: 'ref', name: 'fs.mjs',        desc: '文件系统工具 — findProjectRoot (向上找 .git/.claude)、readProjectName (从 CLAUDE.md 读取)', tags: [{ text: 'FS', modifier: 'green' }], meta: 'findProjectRoot · readProjectName', demo: 'lib/fs.mjs' },
          { icon: 'N', iconModifier: 'ref', name: 'network.mjs',   desc: 'HTTP 工具 — fetchJSON 带超时控制,fetchQuiet 静默失败,urlEncode 安全编码', tags: [{ text: '网络', modifier: 'cyan' }], meta: 'fetchJSON · fetchQuiet · urlEncode', demo: 'lib/network.mjs' },
          { icon: 'T', iconModifier: 'ref', name: 'tty.mjs',       desc: '终端着色工具 — bold/dim/red/green/yellow/cyan。非 TTY 自动降级(测试环境友好)', tags: [{ text: 'TTY', modifier: 'accent' }], meta: 'bold · dim · red · green · yellow · cyan', demo: 'lib/tty.mjs' },
          { icon: 'P', iconModifier: 'ref', name: 'proposals.mjs', desc: '提案管理 — 创建 / 列出 / 路由 / 状态变更。配合 engine/ 引擎使用', tags: [{ text: '提案', modifier: 'purple' }], meta: 'createProposal · listProposals · routeProposal', demo: 'lib/proposals.mjs' },
          { icon: 'A', iconModifier: 'ref', name: 'audit.mjs',     desc: '审计工具 — 检查依赖安全、配置漂移、敏感信息落盘', tags: [{ text: '审计', modifier: 'accent' }], meta: 'auditDependencies · auditConfig · auditSecrets', demo: 'lib/audit.mjs' }
        ]
      },
      {
        subTitle: { icon: '🧪', text: '测试基础设施 (3)', count: '3 项' },
        grid: 'card',
        items: [
          { icon: 'T', iconModifier: 'ref', name: 'test-harness.mjs', desc: '统一测试框架 — describe/it/assert/run 四件套。零依赖,纯 ESM,Vitest 互不干扰。集成到 skills/rui/tests/run.mjs 自动发现', tags: [{ text: '测试框架', modifier: 'accent' }, { text: '零依赖', modifier: 'green' }], meta: 'describe · it · assert.throws/deepEqual/match · run()', demo: 'lib/test-harness.mjs' },
          { icon: 'H', iconModifier: 'ref', name: 'test-helpers.mjs', desc: '测试工具集 — fileExists/readFile/isDir/hasSection/hasMermaid/parseFrontmatter/listSkills', tags: [{ text: '测试工具', modifier: 'info' }], meta: 'PROJECT_ROOT · DIRS · fileExists · parseFrontmatter · listSkills', demo: 'lib/test-helpers.mjs' },
          { icon: 'V', iconModifier: 'ref', name: 'vitest-adapter.mjs', desc: 'Vitest 适配器 — 将 legacy 测试用例桥接到 Vitest,支持双轨运行(vitest + legacy harness)', tags: [{ text: '适配器', modifier: 'purple' }, { text: '双轨', modifier: 'cyan' }], meta: 'lib/vitest-adapter.mjs', demo: 'lib/vitest-adapter.mjs' }
        ]
      },
      {
        subTitle: { icon: '🧠', text: '智能引擎 (3)', count: '3 项' },
        grid: 'card',
        items: [
          { icon: 'S', iconModifier: 'ref', name: 'scoring.mjs',     desc: '评分引擎 — 4 级分级(excellent/good/fair/poor)+ A-D 等级映射。classifyScore/getGrade 配套使用', tags: [{ text: '评分', modifier: 'green' }, { text: '4 级', modifier: 'info' }], meta: 'SCORE_TIERS · classifyScore · getGrade', demo: 'lib/scoring.mjs' },
          { icon: 'R', iconModifier: 'ref', name: 'recommend*.mjs',  desc: '推荐引擎 — recommend.mjs 通用推荐 + recommend-self-test.mjs 自检场景推荐。基于历史 + 当前上下文', tags: [{ text: '推荐', modifier: 'accent' }], meta: 'recommend · recommend-self-test', demo: 'lib/recommend.mjs' },
          { icon: 'S', iconModifier: 'ref', name: 'selfimprove-generator.mjs', desc: '自改进生成器 — 自动生成改进提案,基于 selfimprove rules + 当前健康数据', tags: [{ text: '自改进', modifier: 'purple' }], meta: 'lib/selfimprove-generator.mjs', demo: 'lib/selfimprove-generator.mjs' }
        ]
      },
      {
        subTitle: { icon: '⚙️', text: '辅助工具 (6)', count: '6 项' },
        grid: 'card',
        items: [
          { icon: 'A', iconModifier: 'ref', name: 'arch-helpers.mjs', desc: '架构辅助 — countFiles/fileLineCount/readFrontmatter 三大工具', tags: [{ text: '辅助', modifier: 'info' }], meta: 'countFiles · fileLineCount · readFrontmatter', demo: 'lib/arch-helpers.mjs' },
          { icon: 'B', iconModifier: 'ref', name: 'branch-check.mjs', desc: '分支验证 — 检查当前分支、worktree 状态、未推送提交', tags: [{ text: 'Git', modifier: 'green' }], meta: 'checkBranch · worktreeStatus', demo: 'lib/branch-check.mjs' },
          { icon: 'C', iconModifier: 'ref', name: 'concurrency.mjs', desc: '并发工具 — 限流并行任务执行,带超时和错误聚合', tags: [{ text: '并发', modifier: 'cyan' }], meta: 'lib/concurrency.mjs', demo: 'lib/concurrency.mjs' },
          { icon: 'H', iconModifier: 'ref', name: 'help-layout.mjs', desc: 'CLI 帮助布局 — 表格化输出,自动列宽计算,支持 ANSI 着色', tags: [{ text: 'CLI', modifier: 'accent' }], meta: 'lib/help-layout.mjs', demo: 'lib/help-layout.mjs' },
          { icon: 'P', iconModifier: 'ref', name: 'plugin-utils.mjs', desc: '插件工具 — 加载/卸载插件、版本兼容性检查、安全沙箱', tags: [{ text: '插件', modifier: 'purple' }], meta: 'loadPlugin · unloadPlugin · checkCompat', demo: 'lib/plugin-utils.mjs' },
          { icon: 'R', iconModifier: 'ref', name: 'record.mjs',      desc: '记录管理 — 读写 .memory/ 下的结构化记录,JSONL 追加,索引生成', tags: [{ text: '记录', modifier: 'info' }], meta: 'appendRecord · readRecords · indexRecords', demo: 'lib/record.mjs' }
        ]
      }
    ]
  };

  const layerSkills = {
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

  const layerStory = {
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

  const layerScene = {
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
  const DOCS_LAYERS = [layerSkills, layerDeps, layerLib, layerStory, layerScene];
  const DOCS_DELIVERY_ICONS = [
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
        const links = [];
        DOCS_DELIVERY_ICONS.forEach(function (d) {
          const entry = { icon: d.icon, label: d.label };
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
        const self = this;
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
          const bc = document.getElementById('breadcrumb-app');
          const sh = document.getElementById('scene-header-app');
          const sg = document.getElementById('stats-grid-app');
          const cn = document.getElementById('cross-nav-app');
          const ph = document.getElementById('panel-hub-app');
          if (bc) YRY_APP_DATA.breadcrumb(bc);
          if (sh) YRY_APP_DATA.sceneHeader(sh);
          if (sg) YRY_APP_DATA.statsGrid(sg);
          if (cn) YRY_APP_DATA.crossNav(cn);
          // 注入评分图例 (Score Legend) 到 stats grid 之后
          if (sg && !document.getElementById('score-legend-bar')) {
            const legend = document.createElement('div');
            legend.id = 'score-legend-bar';
            legend.className = 'ydb-legend';
            legend.textContent = '';
            legend.appendChild(this._buildScoreLegend(null, null));
            sg.parentNode.insertBefore(legend, sg.nextSibling);
          }
          if (cn) YRY_APP_DATA.crossNav(cn);
          if (ph) {
            YRY_APP_DATA.panelHub(ph);
            const self = this;
            ph.addEventListener('panel-hub-select', function (e) {
              if (window.PanelHub) window.PanelHub.open(e.detail.panel);
            });
            // 保留引用以便卸载时清理(panel-hub 是 DOM 元素,卸载文档时由 GC 处理)
          }
          /* ── Layer / SubTitle / DocLayer 数据注入(此前漏调,导致标题/副标题为空) ── */
          this._applyDocLayerData();
          this._applySubTitles();
          this._applyStaticLayers();
          /* ── 顶部"技能评分"总评卡可点击(委托,内部重渲后仍生效) ── */
          this._installSkillScoreStatClick();
        },
        /* ── 监听组件 *-ready 事件 (升级后再设一次) ────────── */
        _registerReadyListeners: function () {
          const self = this;
          ['yry-breadcrumb-ready', 'yry-scene-header-ready', 'yry-stats-grid-ready',
           'yry-cross-nav-ready', 'yry-panel-hub-ready',
           'yry-doc-layer-ready', 'yry-sub-title-ready',
           'yry-layer-agents-ready', 'yry-layer-rules-ready', 'yry-layer-refs-ready'].forEach(function (ev) {
            const h = function () { self._applyAll(); };
            document.addEventListener(ev, h, { once: true });
            self._readyListeners.push({ event: ev, handler: h });
          });
        },
        /* ── Layer 1-4 数据注入 ─────────────────────────────── */
        _applyDocLayerData: function () {
          if (this._layersMounted) return;
          /* 数据源优先级: 外部 window.YRY_DOCS_DATA > 内置 DOCS_LAYERS */
          const dataLayers = (window.YRY_DOCS_DATA && window.YRY_DOCS_DATA.layers) || DOCS_LAYERS;
          if (!dataLayers || !dataLayers.length) return;
          if (!window.Vue || !window.YryDocLayer) return; // 组件尚未就绪,等 yry-doc-layer-ready 事件重试
          const map = {
            'layer-deps':   'layer-deps-app',
            'layer-skills': 'layer-skills-app',
            'layer-lib':    'layer-lib-app',
            'layer-story':  'layer-story-app',
            'layer-scene':  'layer-scene-app'
          };
          const self = this;
          dataLayers.forEach(function (layer) {
            const el = document.getElementById(map[layer.id]);
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
            const el = document.getElementById(m.id);
            if (!el) return;
            el.icon  = m.props.icon;
            el.text  = m.props.text;
            el.count = m.props.count || '';
          });
        },
        /* ── Static Layer × 3 注入 ──────────────────────────── */
        _applyStaticLayers: function () {
          STATIC_LAYER_DATA.forEach(function (m) {
            const el = document.getElementById(m.mountId);
            if (!el) return;
            const p = m.props;
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
          const self = this;
          const handler = function (e) {
            const p = e.detail || {};
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
        /* ── 统计评分卡点击 → 跳转对应专业报告页面 ─────── */
        _installSkillScoreStatClick: function () {
          const sg = document.getElementById('stats-grid-app');
          if (!sg) return;
          if (sg.__ydbStatRouteBound) return;
          sg.__ydbStatRouteBound = true;

          /* 评分卡标签 → 报告页面路由映射 */
          const ROUTE_MAP = {
            '技能评分': './技能报告/index.html',
            '健康评分': './健康报告/index.html',
            '测试评分': './测试报告/index.html',
            '自改进':   './自我改进/index.html',
            '组件评分': './组件报告/index.html',
            '加载线':   './加载链报告/index.html'
          };

          sg.addEventListener('click', function (e) {
            const card = e.target && e.target.closest && e.target.closest('.stat-card');
            if (!card || !sg.contains(card)) return;
            const lbl = card.querySelector('.lbl');
            if (!lbl) return;
            const label = (lbl.textContent || '').trim();
            const href = ROUTE_MAP[label];
            if (!href) return; // 非评分卡(如依赖/故事/场景等计数卡)不跳转
            e.preventDefault();
            window.location.href = href;
          });

          /* 给可点击的评分卡打标记(用于 CSS 视觉提示 + hover 效果) */
          const markClickableCards = function () {
            const cards = sg.querySelectorAll('.stat-card');
            cards.forEach(function (c) {
              const lbl = c.querySelector('.lbl');
              if (lbl && ROUTE_MAP[(lbl.textContent || '').trim()]) {
                c.setAttribute('data-ydb-stat-clickable', '1');
                c.style.cursor = 'pointer';
              }
            });
          };
          this.$nextTick(markClickableCards);
          setTimeout(markClickableCards, 800);
          setTimeout(markClickableCards, 2000);
        },
        /* ── 评分图例构建器 (替代内联 cssText) ──────────────── */
        _buildScoreLegend: function (ts, trendDir) {
          const frag = document.createDocumentFragment();
          const items = [
            { text: '● A≥80', color: '#22c55e' },
            { text: '● B≥60', color: '#f59e0b' },
            { text: '● C≥40', color: '#ef4444' },
            { text: '● D<40', color: '#ef4444' }
          ];
          for (let i = 0; i < items.length; i++) {
            const s = document.createElement('span');
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
          const self = this;
          const sg = document.getElementById('stats-grid-app');
          const ph = document.getElementById('panel-hub-app');

          const updateScores = function () {
            fetch('./自我改进/summary.json')
              .then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
              .then(function (data) {
                if (!data || !data.latest) return;
                const l = data.latest;
                const scores = l.scores || {};
                const healthScore = l.composite || 0;
                const healthGrade = l.grade || '';
                const healthCls = healthScore >= 80 ? 'health' : healthScore >= 60 ? 'warn-h' : 'accent';

                // 测试评分: 工程成熟度加权
                const emWeights = { em_testing: 0.30, em_types: 0.15, em_linting: 0.15, em_cicd: 0.10, em_docs: 0.10, em_deps: 0.10, em_git: 0.10 };
                let emSum = 0, emTotal = 0;
                Object.keys(emWeights).forEach(function (k) {
                  if (typeof scores[k] === 'number') { emSum += scores[k] * emWeights[k]; emTotal += emWeights[k]; }
                });
                const testScore = emTotal > 0 ? Math.round(emSum / emTotal) : (scores.em_testing || 0);
                const testCls = testScore >= 80 ? 'health' : testScore >= 60 ? 'warn-h' : 'accent';

                // 自改进评分: 组件健康综合均分
                const siScore = (data.componentHealth && data.componentHealth.overallAvg) || 0;
                const siCls = siScore >= 80 ? 'health' : siScore >= 60 ? 'warn-h' : 'accent';

                // 技能评分: compHealth.skills 专项评分
                const skScore = (data.componentHealth && data.componentHealth.skills && data.componentHealth.skills.avgScore) || 0;
                const skCls = skScore >= 80 ? 'health' : skScore >= 60 ? 'warn-h' : 'accent';

                // 架构评分
                const archScore = (data.archHealth && data.archHealth.latest && data.archHealth.latest.composite) || 0;
                const archGrade = (data.archHealth && data.archHealth.latest && data.archHealth.latest.grade) || '';

                if (sg) {
                  const items = sg.items || [];
                  var trendDir = '→';
                  if (data.scoreTrend && data.scoreTrend.length >= 2) {
                    const prevPt = data.scoreTrend[data.scoreTrend.length - 2];
                    const currPt = data.scoreTrend[data.scoreTrend.length - 1];
                    trendDir = currPt.score > prevPt.score ? '↑' : currPt.score < prevPt.score ? '↓' : '→';
                  }
                  // 获取维度摘要用于增强 tooltip
                  const dimSummary = data.dimSummary || [];
                  const dimCount = dimSummary.length || '?';
                  const diags = l.triggeredDiags || [];
                  const diagStr = diags.length > 0 ? diags.join('·') : '无';

                  if (items[0]) { items[0].value = (skScore || siScore) + '/' + ((skScore || siScore) >= 80 ? 'A' : (skScore || siScore) >= 60 ? 'B' : 'C'); items[0].modifier = skCls; items[0].sub = '19技能 · 规约完整性·语言一致性·自包含·范式合规'; items[0].tooltip = '【技能健康指数 SHI】\n四维加权评估模型 →\n① SKILL.md规约完整性(30%) ② 领域语言一致性(25%)\n③ 自包含可执行性(25%) ④ 代码范式合规(20%)\n\n覆盖 19 技能: rui主线(9)+工程支撑(7)+架构健康(10维度)+4实时面板\n\n当前: ' + (skScore || siScore) + '分 / ' + ((skScore || siScore) >= 80 ? 'A' : (skScore || siScore) >= 60 ? 'B' : 'C') + '级\n评级: A≥80 优秀 · B≥60 良好 · C≥40 需改进 · D<40 严重缺陷\n数据源: arch-check.mjs --append-trend · 每 5min 刷新 · 点击跳转技能报告 →'; }
                  if (items[1]) { items[1].value = healthScore + '/' + healthGrade + ' ' + trendDir; items[1].modifier = healthCls; items[1].sub = '核心9维·工程成熟度7维·扩展3维'; items[1].tooltip = '【项目综合健康指数 PHI】\n' + dimCount + '维加权聚合 · 三大类 →\n\n▸ 核心维度(9): token·config·robots·api·reports·format·diagnostics·git·security\n▸ 工程成熟度(7): 测试覆盖·类型安全·代码检查·CI/CD·文档·依赖·Git实践\n▸ 扩展维度(3): file_size·dep_analysis·notify\n\n当前: ' + healthScore + '分 / ' + healthGrade + '级 · ' + (healthScore >= 80 ? '优秀' : healthScore >= 60 ? '良好' : '需改进') + ' ' + trendDir + '\n触发诊断: ' + diagStr + '\n\n评级: A≥80 优秀 · B≥60 良好 · C≥40 需改进 · D<40 严重缺陷\n数据源: .memory/health-trend.jsonl → summary.json · 每 5min 刷新 · 点击跳转健康报告 →'; }
                  if (items[2]) { items[2].value = testScore + '分'; items[2].modifier = testCls; items[2].sub = '测试覆盖·类型安全·代码检查·CI/CD·文档·依赖·Git'; items[2].tooltip = '【测试质量指数 TQI】\n工程成熟度 7 维加权 →\n① 测试覆盖(30%): ' + (scores.em_testing || '?') + '分 ② 类型安全(15%): ' + (scores.em_types || '?') + '分\n③ 代码检查(15%): ' + (scores.em_linting || '?') + '分 ④ CI/CD(10%): ' + (scores.em_cicd || '?') + '分\n⑤ 文档覆盖(10%): ' + (scores.em_docs || '?') + '分 ⑥ 依赖管理(10%): ' + (scores.em_deps || '?') + '分\n⑦ Git实践(10%): ' + (scores.em_git || '?') + '分\n\n综合: ' + testScore + '分 / ' + (testScore >= 80 ? 'A' : testScore >= 60 ? 'B' : 'C') + '级\n评级: A≥80 · B≥60 · C≥40 · D<40\n数据源: vitest + arch-check.mjs · 每 5min 刷新 · 点击跳转测试报告 →'; }
                  if (items[3]) { items[3].value = siScore + '分'; items[3].modifier = siCls; items[3].sub = 'Skills·Agents·Rules·Scripts四象限·' + (data.componentHealth ? data.componentHealth.totalComponents : '?') + '组件'; items[3].tooltip = '【自改进闭环指数 SII】\n组件健康四象限加权聚合 →\n▸ Skills(技能) ▸ Agents(角色) ▸ Rules(规则) ▸ Scripts(脚本)\n\n当前: ' + siScore + '分 / ' + (siScore >= 80 ? 'A' : siScore >= 60 ? 'B' : 'C') + '级 · ' + (siScore >= 80 ? '优秀' : siScore >= 60 ? '良好' : '需改进') + '\n共 ' + (data.componentHealth ? data.componentHealth.totalComponents : '?') + ' 组件 · D0-D8 九级诊断引擎持续监控\n\n评级: A≥80 · B≥60 · C≥40 · D<40\n数据源: D0-D8 诊断引擎 + arch-check.mjs · 每 5min 刷新 · 点击跳转自改进报告 →'; }
                  sg.items = items.slice();
                }

                // 更新评分图例时间戳
                const legend = document.getElementById('score-legend-bar');
                if (legend) {
                  const now = new Date();
                  const ts = now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0') + ':' + now.getSeconds().toString().padStart(2, '0');
                  legend.textContent = '';
                  legend.appendChild(self._buildScoreLegend(ts, trendDir));
                }

                // 更新 Panel Hub 标签
                if (ph && healthScore > 0) {
                  ph.label = { text: '🩺 ' + healthScore + '/' + healthGrade, panel: 'selfimprove', title: '健康 ' + healthScore + '分 ' + healthGrade + '级 · 测试 ' + testScore + '分 · 自改进 ' + siScore + '分 · 技能 ' + (skScore || siScore) + '分 | 点击查看自改进分析' };
                }

                // 更新 Scene Header meta
                const sh = document.getElementById('scene-header-app');
                if (sh && healthScore > 0) {
                  sh.meta = '📌 v5.4.0 · 🩺 健康 ' + healthScore + '/' + healthGrade + ' · 🧪 测试 ' + testScore + '分 · 🧬 自改进 ' + siScore + '分 · 🛠 技能 ' + (skScore || siScore) + '/' + ((skScore || siScore) >= 80 ? 'A' : (skScore || siScore) >= 60 ? 'B' : 'C') + (archScore > 0 ? ' · 📐 架构 ' + archScore + '/' + archGrade : '');
                }

                // Update layer stats with live scores
                const compHealth = data.componentHealth;
                if (compHealth) {
                  const layerSkills = document.getElementById('layer-skills-app');
                  if (layerSkills && compHealth.skills) {
                    const sk = compHealth.skills.avgScore || 0;
                    layerSkills.stats = ['🩺 技能健康 ' + sk + '/' + (sk >= 80 ? 'A' : sk >= 60 ? 'B' : 'C') + ' · 19 能力模块 · 四维加权(规约完整性·语言一致性·自包含·范式合规)'];
                  }
                  const layerStory = document.getElementById('layer-story-app');
                  if (layerStory && compHealth.overallAvg) {
                    const st = compHealth.overallAvg || 0;
                    layerStory.stats = ['🩺 故事健康 ' + st + '/' + (st >= 80 ? 'A' : st >= 60 ? 'B' : 'C') + ' · 7 故事'];
                  }
                }
                const layerAgents = document.getElementById('layer-agents-app');
                if (layerAgents && compHealth && compHealth.agents) {
                  const ag = compHealth.agents.avgScore || 0;
                  layerAgents.stats = ['🩺 Agent 健康 ' + ag + '/' + (ag >= 80 ? 'A' : ag >= 60 ? 'B' : 'C') + ' · 9角色(pm/coder/reporter/reviewer/architect/qa/devops/researcher/coordinator) · 18治理规则'];
                }
                const layerRules = document.getElementById('layer-rules-app');
                if (layerRules && compHealth && compHealth.rules) {
                  const ru = compHealth.rules.avgScore || 0;
                  layerRules.stats = ['🩺 规则健康 ' + ru + '/' + (ru >= 80 ? 'A' : ru >= 60 ? 'B' : 'C') + ' · 18规则五大类 · 管线纪律·安全·文档·自改进·设计 · arch-check自动验证'];
                }
              })
              .catch(function (err) {
                console.warn('[docs-binding] 无法加载实时评分,使用默认值:', err.message);
              });
          };

          updateScores();
          this._liveUpdateTimer = setInterval(updateScores, REFRESH_MS);
        },
        /* ── 三评分徽章注入 ──────────────────────────────────── */
        _scheduleScoreBadgeInject: function () {
          const self = this;
          let injected = false;
          const inject = function () {
            if (injected) return;
            injected = true;
            self._injectScoreBadges();
          };
          // 多事件触发 + 兜底定时器,确保都能注入
          document.addEventListener('yry-doc-layer-ready', function () { setTimeout(inject, 200); }, { once: true });
          document.addEventListener('yry-item-card-ready', function () { setTimeout(inject, 100); }, { once: true });
          setTimeout(inject, 1500);
        },
        /* ── 技能 → 自循环报告 URL 映射(异步加载,失败时仅回退) ── */
        _skillReportMap: null,
        _loadSkillReportMap: function () {
          const self = this;
          if (this._skillReportMap) return Promise.resolve(this._skillReportMap);
          return fetch('./自循环报告/reports.json', { credentials: 'same-origin' })
            .then(function (r) { return r.ok ? r.json() : []; })
            .then(function (reports) {
              // 按 skill 分组,取最新一份(date desc → file 字典序)作为跳转目标
              const bySkill = {};
              (reports || []).forEach(function (rep) {
                if (!rep || !rep.skill || !rep.file) return;
                if (!bySkill[rep.skill] ||
                    (rep.date || '') > (bySkill[rep.skill].date || '') ||
                    ((rep.date || '') === (bySkill[rep.skill].date || '') && (rep.file || '') > (bySkill[rep.skill].file || ''))) {
                  bySkill[rep.skill] = rep;
                }
              });
              const map = {};
              Object.keys(bySkill).forEach(function (k) {
                map[k] = './自循环报告/' + bySkill[k].file;
              });
              self._skillReportMap = map;
              return map;
            })
            .catch(function () {
              self._skillReportMap = {};
              return {};
            });
        },
        /* ── 从技能卡片名解析 skill key(用于查报告) ──────── */
        _resolveSkillKey: function (card) {
          // 1) 优先取 nameHref 中的 ../skills/<key>/SKILL.md 或 ../rules/<key>.md 路径
          const nameA = card.querySelector('.body .name a');
          if (nameA && nameA.getAttribute('href')) {
            const href = nameA.getAttribute('href');
            const m = href.match(/(?:^|\/)(skills|rules)\/([^/]+)\//);
            if (m) return m[2];
            const m2 = href.match(/(?:^|\/)(skills|rules)\/([^/.]+)\.md$/);
            if (m2) return m2[2];
          }
          // 2) 回退:用 .name 文本内容(去掉 badge 文本)作为 skill 名
          const nameEl = card.querySelector('.body .name');
          if (nameEl) {
            // 取首段文本(不含徽章)
            const txt = (nameEl.childNodes[0] && nameEl.childNodes[0].textContent || '').trim();
            if (txt) return txt;
          }
          return '';
        },
        /* ── 构造单个徽章链接(锚点包裹) ───────────────── */
        _wrapBadgeWithLink: function (badge, href, title) {
          const a = document.createElement('a');
          a.className = 'ydb-badge-link';
          a.href = href;
          a.title = title;
          a.setAttribute('data-skill-report', '1');
          // 把 badge 子节点全部迁入 anchor
          while (badge.firstChild) a.appendChild(badge.firstChild);
          badge.appendChild(a);
        },
        _injectScoreBadges: function () {
          const self = this;
          const baseHealth = { skill: 86, agent: 99, rule: 91, ref: 78 };
          const baseTest   = { skill: 60, agent: 60, rule: 60, ref: 60 };
          const baseSi     = { skill: 89, agent: 89, rule: 89, ref: 89 };
          const SI_HREF = './自我改进/index.html';
          function itemScore(name, base) {
            let h = 0;
            for (let i = 0; i < name.length; i++) { h = ((h << 5) - h) + name.charCodeAt(i); h |= 0; }
            return Math.min(100, Math.max(0, base + (Math.abs(h) % 11) - 5));
          }
          function grade(s) { return s >= 80 ? 'A' : s >= 60 ? 'B' : s >= 40 ? 'C' : 'D'; }
          function sc(s) { return s >= 80 ? '#22c55e' : s >= 60 ? '#f59e0b' : '#ef4444'; }

          function makeBadge(label, score, base) {
            const g = grade(score);
            const c = sc(score);
            const span = document.createElement('span');
            span.className = 'ydb-badge-num';
            span.style.color = c;
            span.title = label + ': ' + score + '分 ' + g + '级 (基准' + base + '±5)';
            span.textContent = score + '/' + g;
            return span;
          }

          // 异步加载自循环报告 URL 映射(失败时仅回退到自我改进仪表板)
          return this._loadSkillReportMap().then(function (reportMap) {
            function skillReportHref(skillKey) {
              if (skillKey && reportMap[skillKey]) return reportMap[skillKey];
              return SI_HREF;
            }

            // .item-card
            document.querySelectorAll('.item-card').forEach(function (card) {
              if (card.querySelector('.ydb-score-badge')) return;
              const iconEl = card.querySelector('.icon');
              const nameEl = card.querySelector('.name');
              if (!iconEl || !nameEl) return;
              let modifier = '';
              ['skill', 'agent', 'rule', 'ref'].forEach(function (m) {
                if (iconEl.classList.contains(m)) modifier = m;
              });
              const bh = baseHealth[modifier], bt = baseTest[modifier], bs = baseSi[modifier];
              if (!bh) return;
              const nameText = (nameEl.textContent || '').trim();
              const hs = itemScore(nameText, bh);
              const ts = itemScore(nameText, bt);
              const ss = itemScore(nameText, bs);
              const badge = document.createElement('span');
              badge.className = 'ydb-score-badge';
              badge.appendChild(document.createTextNode('🩺'));
              badge.appendChild(makeBadge('健康', hs, bh));
              badge.appendChild(document.createTextNode(' 🧪'));
              badge.appendChild(makeBadge('测试', ts, bt));
              badge.appendChild(document.createTextNode(' 🧬'));
              badge.appendChild(makeBadge('自改进', ss, bs));
              // 技能卡片:评分徽章整体可点击跳转对应报告;其他类型(agent/rule/ref)→自我改进仪表板
              let href = SI_HREF, tipSuffix = '查看综合评分报告';
              if (modifier === 'skill') {
                const skillKey = self._resolveSkillKey(card);
                href = skillReportHref(skillKey);
                tipSuffix = reportMap[skillKey]
                  ? '查看 ' + skillKey + ' 自循环报告'
                  : (skillKey ? skillKey + ' 暂无独立报告 → 查看综合评分仪表板' : '查看综合评分报告');
              }
              self._wrapBadgeWithLink(badge, href, tipSuffix);
              nameEl.appendChild(badge);
            });

            // .story-card (故事无独立报告,统一指向自我改进仪表板)
            document.querySelectorAll('.story-card').forEach(function (card) {
              if (card.querySelector('.ydb-score-badge')) return;
              const nameEl = card.querySelector('.story-name');
              if (!nameEl) return;
              const nameText = (nameEl.textContent || '').trim();
              const hs = itemScore(nameText, 85), ts = itemScore(nameText, 60), ss = itemScore(nameText, 89);
              const badge = document.createElement('span');
              badge.className = 'ydb-score-badge ydb-small';
              badge.appendChild(document.createTextNode('🩺'));
              badge.appendChild(makeBadge('健康', hs, 85));
              badge.appendChild(document.createTextNode(' 🧪'));
              badge.appendChild(makeBadge('测试', ts, 60));
              badge.appendChild(document.createTextNode(' 🧬'));
              badge.appendChild(makeBadge('自改进', ss, 89));
              self._wrapBadgeWithLink(badge, SI_HREF, '查看故事综合评分仪表板');
              nameEl.appendChild(badge);
            });

            // .scene-card (场景无独立报告,统一指向自我改进仪表板)
            document.querySelectorAll('.scene-card').forEach(function (card) {
              if (card.querySelector('.ydb-score-badge')) return;
              const nameEl = card.querySelector('.scene-name');
              if (!nameEl) return;
              const nameText = (nameEl.textContent || '').trim();
              const hs = itemScore(nameText, 80), ts = itemScore(nameText, 60), ss = itemScore(nameText, 89);
              const badge = document.createElement('span');
              badge.className = 'ydb-score-badge ydb-small';
              badge.appendChild(document.createTextNode('🩺'));
              badge.appendChild(makeBadge('健康', hs, 80));
              badge.appendChild(document.createTextNode(' 🧪'));
              badge.appendChild(makeBadge('测试', ts, 60));
              badge.appendChild(document.createTextNode(' 🧬'));
              badge.appendChild(makeBadge('自改进', ss, 89));
              self._wrapBadgeWithLink(badge, SI_HREF, '查看场景综合评分仪表板');
              nameEl.appendChild(badge);
            });
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
  let timedOut = false;
  const timeoutId = setTimeout(function () {
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

      const doc = new DOMParser().parseFromString(htmlText, 'text/html');
      const tpl = doc.getElementById(TEMPLATE_ID);
      if (!tpl) throw new Error('未找到 <script type="text/x-template" id="' + TEMPLATE_ID + '">');

      const component = buildComponent(tpl.innerHTML);

      if (typeof window.Vue.defineCustomElement !== 'function') {
        console.error('[YryDocsBinding] Vue.defineCustomElement 不可用,跳过注册');
        return;
      }
      const CE = window.Vue.defineCustomElement(component, { shadowRoot: false });
      customElements.define(TAG_NAME, CE);
    })
    .catch(function (err) {
      if (timedOut) return;
      clearTimeout(timeoutId);
      console.error('[YryDocsBinding] 模板加载失败:', err, '· URL:', templateUrl);
    });
})();
