// ==========================================================================
// docs-binding.js — YrY 文档中心数据绑定与交互逻辑
// 依赖: Vue 3 (window.Vue) · ../cdn/shared.js (YrY.*) · ../cdn/yry-*/index.js
// ==========================================================================

(function() {
  'use strict';



  // ── Block 1: Template clone ──
{
      const tpl = document.getElementById('notifyPanelComponent');
      if (tpl) document.body.appendChild(tpl.content.cloneNode(true));
    }

  // ── Block 2: Animation + event delegation ──
/* Staggered card animations (静态 HTML 部分) */
    document.querySelectorAll('.card-grid .item-card').forEach((card, i) => {
      card.style.animationDelay = `${0.01 + (i % 20) * 0.012}s`;
    });

    /* Vue 渲染的卡片 · 等所有 doc-layer 挂载完再补一次 */
    document.addEventListener('yry-doc-layer-ready', function () {
      /* 等下一帧,确保 Vue 已完成 patch */
      requestAnimationFrame(function () {
        document.querySelectorAll('#layer-deps-app .item-card, #layer-skills-app .item-card, #layer-story-app .story-card, #layer-scene-app .scene-card').forEach(function (card, i) {
          card.style.animationDelay = (0.01 + (i % 20) * 0.012) + 's';
        });
      });
    });

    /* Back to top */
    {
      const btn = document.getElementById('backTop');
      const toggle = () => btn.classList.toggle('visible', window.scrollY > 400);
      window.addEventListener('scroll', toggle, { passive: true });
      btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
      toggle();
    }

  // ── Block 3: Data binding ──
/* ═══ 概述 ═══
       自定义元素 <yry-xxx> 通过属性(property)方式接收数据。
       为保证 props 在 Vue 升级时可用,采用"双设"策略:
         1) 内联脚本立即在元素上设属性 (覆盖大多数情况)
         2) 监听 *-ready 事件,组件定义完成后再设一次 (覆盖元素晚于组件定义出现的场景)
       事件 (layer-panel-select / panel-hub-select) 通过 element.addEventListener 监听。
    */

    /* ── 数据容器 ────────────────────────────────────────────── */
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
        el.icon   = '⭐';
        el.prefix = 'YrY ';
        el.accent = '文档中心';
        el.meta   = '📌 v4.5 · 📅 2026-06-16 · 🏷️ docs · Documentation Hub';
        el.desc   = '故事驱动的 SDLC 编排系统 — 六层结构：依赖/框架 → 19 技能 → 7 故事 → 37 场景 → Agent 角色与规则 → 参考入口';
      },
      /* 3) Stats Grid */
      statsGrid: function (el) {
        el.items = [
          { value: 12, label: '依赖/框架',   modifier: 'health' },
          { value: 19, label: '技能' },
          { value: 7,  label: '故事',        modifier: 'health' },
          { value: 37, label: '场景',        modifier: 'health' },
          { value: 9,  label: 'Agent 角色' },
          { value: 18, label: '规则',        modifier: 'health' },
          { value: 9,  label: '参考入口',    modifier: 'health' }
        ];
      },
      /* 4) Cross Nav */
      crossNav: function (el) {
        el.basePath = '';
        el.active   = '';
        el.pages    = [
          { id: 'CDN 共享库',  icon: '🌐', href: '../cdn/index.html' },
          { id: '自检中心',    icon: '🧪', href: '../tests/index.html' },
          { id: '演示中心',    icon: '🎬', href: './故事任务面板/架构/场景-1-新人上手/演示.html' },
          { id: '健康报告',    icon: '🩺', href: './健康报告/index.html' },
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
        el.flow = 'Cron 定时触发 → 技能执行 → 通知产出 → 🔔 通知面板展示 → 数据写入 .memory/ → 🧬 自改进分析消费';
      }
    };

    /* ── 立即设置 (元素已在 DOM,组件尚未定义) ────────────────── */
    function applyAll() {
      var bc  = document.getElementById('breadcrumb-app');
      var sh  = document.getElementById('scene-header-app');
      var sg  = document.getElementById('stats-grid-app');
      var cn  = document.getElementById('cross-nav-app');
      var ph  = document.getElementById('panel-hub-app');
      if (bc) YRY_APP_DATA.breadcrumb(bc);
      if (sh) YRY_APP_DATA.sceneHeader(sh);
      if (sg) YRY_APP_DATA.statsGrid(sg);
      if (cn) YRY_APP_DATA.crossNav(cn);
      if (ph) {
        YRY_APP_DATA.panelHub(ph);
        /* 监听 panel-hub-select 事件 → 转发到 PanelHub */
        ph.addEventListener('panel-hub-select', function (e) {
          if (window.PanelHub) window.PanelHub.open(e.detail.panel);
        });
      }
    }
    applyAll();

    /* ── 在组件 *-ready 事件触发后再设一次 (此时元素已升级) ── */
    ['yry-breadcrumb-ready', 'yry-scene-header-ready', 'yry-stats-grid-ready',
     'yry-cross-nav-ready', 'yry-panel-hub-ready'].forEach(function (ev) {
      document.addEventListener(ev, applyAll, { once: true });
    });

    /* ── 6) Layer 1-4: YryDocLayer × 4 (从 window.YRY_DOCS_DATA 读取) ── */
    function setDocLayerData() {
      if (!window.YRY_DOCS_DATA || !window.YRY_DOCS_DATA.layers) return;
      var map = {
        'layer-deps':   'layer-deps-app',
        'layer-skills': 'layer-skills-app',
        'layer-story':  'layer-story-app',
        'layer-scene':  'layer-scene-app'
      };
      window.YRY_DOCS_DATA.layers.forEach(function (layer) {
        var el = document.getElementById(map[layer.id]);
        if (!el) return;
        el.layerId             = layer.id;
        el.num                 = layer.num;
        el.titleIcon           = layer.titleIcon;
        el.titleAccent         = layer.titleAccent;
        el.titlePrefix         = layer.titlePrefix || '';
        el.titleSuffix         = layer.titleSuffix || '';
        el.stats               = layer.stats || [];
        el.panels              = layer.panels || [];
        el.panelsTitle         = layer.panelsTitle || '';
        el.sections            = layer.sections || [];
      });
    }
    setDocLayerData();
    if (window.YRY_DOCS_DATA) setDocLayerData();
    document.addEventListener('yry-doc-layer-ready', setDocLayerData, { once: true });
    document.addEventListener('DOMContentLoaded', setDocLayerData, { once: true });

    /* ── 7) SubTitle × 9 (Layer 5 / R / 6 子区块标题) ────────── */
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
    function applySubTitles() {
      SUB_TITLE_DATA.forEach(function (m) {
        var el = document.getElementById(m.id);
        if (!el) return;
        el.icon  = m.props.icon;
        el.text  = m.props.text;
        el.count = m.props.count || '';
      });
    }
    applySubTitles();
    document.addEventListener('yry-sub-title-ready', applySubTitles, { once: true });

    /* ── 8) Static Layer × 3 (Layer 5 / R / 6 容器) ──────────── */
    var STATIC_LAYER_DATA = [
      {
        mountId: 'layer-agents-app',
        props: {
          layerId: 'layer-agents',
          num: '5',
          titleAccent: 'Agent 角色与规则',
          stats: ['9 Agent 角色 + 1 拓扑总纲 · 18 治理规则'],
          panelsContainerTitle: 'Agent 行为受规则约束，规则合规性由健康检查监控',
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
          stats: ['18 规则 · 管线纪律 · 安全 · 文档 · 自改进 · 设计原则'],
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
    function applyStaticLayers() {
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
    }
    applyStaticLayers();
    document.addEventListener('yry-layer-ready', applyStaticLayers, { once: true });

    /* 路由 layer-panel-select 事件 → 派发到 layerInfo / PanelHub (依 onPanel 字段) */
    document.addEventListener('layer-panel-select', function (e) {
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
    });

})();
