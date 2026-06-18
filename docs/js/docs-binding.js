// ==========================================================================
// docs-binding.js — YrY 文档中心数据绑定与交互逻辑
// 依赖: Vue 3 (window.Vue) · ../cdn/shared.js (YrY.*) · ../cdn/yry-*/index.js
// ==========================================================================

(function() {
  'use strict';



  // ── Block 1: Animation + event delegation ──
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

  // ── Block 2: Data binding ──
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
        el.icon        = '⭐';
        el.titlePrefix = 'YrY ';
        el.accent      = '文档中心';
        el.meta        = '📌 v5.4.0 · 🩺 健康 77/B · 🧪 测试 60分 · 🧬 自改进 89/A · 🛡 安全 100分';
        el.desc        = '故事驱动的 SDLC 编排系统 — 六层结构：依赖/框架 → 19 技能 → 7 故事 → 37 场景 → Agent 角色与规则 → 参考入口';
      },
      /* 3) Stats Grid */
      statsGrid: function (el) {
        el.items = [
          { value: '77/B', label: '健康评分', modifier: 'warn-h', sub: '综合 19 维', tooltip: '健康评分 = 19 维度加权均分。A≥80 B≥60 C≥40 D<40。数据源: .memory/health-trend.jsonl → summary.json' },
          { value: '60分', label: '测试评分', modifier: 'warn-h', sub: '工程成熟度', tooltip: '测试评分 = 工程成熟度 7 维加权: 测试覆盖×30% + 类型安全×15% + 代码检查×15% + CI/CD×10% + 文档×10% + 依赖×10% + Git实践×10%' },
          { value: '89分', label: '自改进', modifier: 'health', sub: '组件健康均分', tooltip: '自改进评分 = Skills/Agents/Rules/Scripts 四类组件健康评分的加权均分。反映项目整体代码质量和架构合规度' },
          { value: '100', label: '安全评分', modifier: 'health', sub: '4 项不妥协', tooltip: '安全评分 = 认证不可绕过 · 密钥不落盘 · 输入必校验 · 架构合规不可绕过。四项全部通过=100分，任一项失败=0分' },
          { value: 12, label: '依赖/框架', modifier: 'info', tooltip: '6 运行时依赖 + 6 开发依赖' },
          { value: 19, label: '技能', modifier: 'health', tooltip: '1 编排入口 + 7 管线子技能 + 8 支撑技能 + 3 新增技能' },
          { value: 7,  label: '故事', modifier: 'health', tooltip: '7 个故事: 架构 · 自测 · npm · CDN · 自改进 · 首页 · 计划清单' },
          { value: 37, label: '场景', modifier: 'health', tooltip: '37 个场景分布在 7 个故事中，每个场景 7 件标准交付物' },
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

    /* ── Score legend helpers (shared by applyAll + updateScores) ── */
    function scoreLegend() {
      var frag = document.createDocumentFragment();
      var items = [
        { text: '● A≥80', color: '#22c55e' },
        { text: '● B≥60', color: '#f59e0b' },
        { text: '● C≥40', color: '#ef4444' },
        { text: '● D<40', color: '#ef4444' },
      ];
      for (var i = 0; i < items.length; i++) {
        var s = document.createElement('span');
        s.style.color = items[i].color;
        s.textContent = items[i].text;
        frag.appendChild(s);
        if (i < items.length - 1) frag.appendChild(document.createTextNode(' '));
      }
      frag.appendChild(document.createTextNode('  |  数据源: summary.json  |  每 5 分钟自动刷新'));
      return frag;
    }

    function scoreLegendWithTime(ts, trendDir) {
      var frag = document.createDocumentFragment();
      var items = [
        { text: '● A≥80', color: '#22c55e' },
        { text: '● B≥60', color: '#f59e0b' },
        { text: '● C≥40', color: '#ef4444' },
        { text: '● D<40', color: '#ef4444' },
      ];
      for (var i = 0; i < items.length; i++) {
        var s = document.createElement('span');
        s.style.color = items[i].color;
        s.textContent = items[i].text;
        frag.appendChild(s);
        if (i < items.length - 1) frag.appendChild(document.createTextNode(' '));
      }
      frag.appendChild(document.createTextNode('  |  数据源: summary.json  |  更新: ' + ts + '  |  趋势: ' + trendDir + '  |  每 5 分钟自动刷新'));
      return frag;
    }

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
      // Inject score legend bar after stats grid
      if (sg && !document.getElementById('score-legend-bar')) {
        var legend = document.createElement('div');
        legend.id = 'score-legend-bar';
        legend.style.cssText = 'text-align:center;margin:-8px 0 16px;font-size:.58rem;color:var(--text-muted);opacity:.8';
        legend.textContent = '';
	        legend.appendChild(scoreLegend());
        sg.parentNode.insertBefore(legend, sg.nextSibling);
      }
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

    /* ── Live score fetcher: 从 summary.json 拉取最新评分并更新 Stats Grid ── */
    (function fetchLiveScores() {
      var sg = document.getElementById('stats-grid-app');
      var ph = document.getElementById('panel-hub-app');
      var REFRESH_MS = 5 * 60 * 1000;

      function updateScores() {
      fetch('./自我改进/summary.json')
        .then(function(r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
        .then(function(data) {
          if (!data || !data.latest) return;
          var l = data.latest;
          var scores = l.scores || {};
          var healthScore = l.composite || 0;
          var healthGrade = l.grade || '';
          var healthCls = healthScore >= 80 ? 'health' : healthScore >= 60 ? 'warn-h' : 'accent';

          // 测试评分: 工程成熟度加权 (em_testing×30% + em_types×15% + em_linting×15% + em_cicd×10% + em_docs×10% + em_deps×10% + em_git×10%)
          var emWeights = { em_testing: 0.30, em_types: 0.15, em_linting: 0.15, em_cicd: 0.10, em_docs: 0.10, em_deps: 0.10, em_git: 0.10 };
          var emSum = 0, emTotal = 0;
          Object.keys(emWeights).forEach(function(k) {
            if (typeof scores[k] === 'number') { emSum += scores[k] * emWeights[k]; emTotal += emWeights[k]; }
          });
          var testScore = emTotal > 0 ? Math.round(emSum / emTotal) : (scores.em_testing || 0);
          var testCls = testScore >= 80 ? 'health' : testScore >= 60 ? 'warn-h' : 'accent';

          // 自改进评分: 组件健康综合均分
          var siScore = (data.componentHealth && data.componentHealth.overallAvg) || 0;
          var siCls = siScore >= 80 ? 'health' : siScore >= 60 ? 'warn-h' : 'accent';

          // 安全评分: 直接从 scores 取
          var secScore = scores.security || 0;
          var secCls = secScore >= 80 ? 'health' : secScore >= 60 ? 'warn-h' : 'accent';

          // 架构评分: 从 archHealth 提取
          var archScore = (data.archHealth && data.archHealth.latest && data.archHealth.latest.composite) || 0;
          var archGrade = (data.archHealth && data.archHealth.latest && data.archHealth.latest.grade) || '';

          if (sg) {
            var items = sg.items || [];
            // 计算趋势: 从 scoreTrend 取最后两个数据点
            var trendDir = '→';
            if (data.scoreTrend && data.scoreTrend.length >= 2) {
              var prevPt = data.scoreTrend[data.scoreTrend.length - 2];
              var currPt = data.scoreTrend[data.scoreTrend.length - 1];
              trendDir = currPt.score > prevPt.score ? '↑' : currPt.score < prevPt.score ? '↓' : '→';
            }
            if (items[0]) { items[0].value = healthScore + '/' + healthGrade + ' ' + trendDir; items[0].modifier = healthCls; items[0].sub = '综合 ' + (data.dimSummary ? data.dimSummary.length : '?') + ' 维'; items[0].tooltip = '健康评分 = ' + (data.dimSummary ? data.dimSummary.length : '?') + ' 维度加权均分。A≥80 B≥60 C≥40 D<40。最新: ' + healthScore + '分 ' + healthGrade + '级 ' + trendDir + '。数据源: .memory/health-trend.jsonl → summary.json'; }
            if (items[1]) { items[1].value = testScore + '分'; items[1].modifier = testCls; items[1].sub = '加权 ' + testScore + '/' + (testScore >= 80 ? 'A' : testScore >= 60 ? 'B' : 'C'); items[1].tooltip = '测试评分 = 工程成熟度加权: 测试×30% + 类型×15% + 检查×15% + CI/CD×10% + 文档×10% + 依赖×10% + Git×10% = ' + testScore + '分'; }
            if (items[2]) { items[2].value = siScore + '分'; items[2].modifier = siCls; items[2].sub = (data.componentHealth ? data.componentHealth.totalComponents : '?') + ' 组件'; items[2].tooltip = '自改进评分 = Skills/Agents/Rules/Scripts 四类组件健康均分。当前 ' + siScore + '分，共 ' + (data.componentHealth ? data.componentHealth.totalComponents : '?') + ' 组件'; }
            if (items[3]) { items[3].value = secScore + '分'; items[3].modifier = secCls; items[3].sub = secScore >= 80 ? '全部通过' : '有未通过项'; items[3].tooltip = '安全评分 = 四项不妥协底线检查: 认证不可绕过 · 密钥不落盘 · 输入必校验 · 架构合规不可绕过'; }
            sg.items = items.slice();
          }

          // 更新评分图例时间戳
          var legend = document.getElementById('score-legend-bar');
          if (legend) {
            var now = new Date();
            var ts = now.getHours().toString().padStart(2,'0') + ':' + now.getMinutes().toString().padStart(2,'0') + ':' + now.getSeconds().toString().padStart(2,'0');
            legend.textContent = '';
	            legend.appendChild(scoreLegendWithTime(ts, trendDir));
          }

          // 更新 Panel Hub 标签
          if (ph && healthScore > 0) {
            ph.label = { text: '🩺 ' + healthScore + '/' + healthGrade, panel: 'selfimprove', title: '健康 ' + healthScore + '分 ' + healthGrade + '级 · 测试 ' + testScore + '分 · 自改进 ' + siScore + '分 | 点击查看自改进分析' };
          }

          // 更新 Scene Header meta
          var sh = document.getElementById('scene-header-app');
          if (sh && healthScore > 0) {
            sh.meta = '📌 v5.4.0 · 🩺 健康 ' + healthScore + '/' + healthGrade + ' · 🧪 测试 ' + testScore + '分 · 🧬 自改进 ' + siScore + '分 · 🛡 安全 ' + secScore + '分' + (archScore > 0 ? ' · 📐 架构 ' + archScore + '/' + archGrade : '');
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
            setTimeout(function() { sg.style.boxShadow = ''; }, 800);
          }
        })
        .catch(function(err) {
          console.warn('[docs-binding] 无法加载实时评分,使用默认值:', err.message);
        });
      }

      updateScores();
      setInterval(updateScores, REFRESH_MS);
    })();

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
          stats: ['🩺 Agent 健康 99/A · 9 Agent 角色 + 1 拓扑总纲 · 18 治理规则'],
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

    /* ── 三评分徽章注入: 每张卡片显示 健康/测试/自改进 三项评分 ── */
    (function injectScoreBadges() {
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
        span.style.cssText = 'color:' + c + ';font-weight:600';
        span.title = label + ': ' + score + '分 ' + g + '级 (基准' + base + '±5)';
        span.textContent = score + '/' + g;
        return span;
      }
      function inject() {
        document.querySelectorAll('.item-card').forEach(function(card) {
          if (card.querySelector('.score-badge')) return;
          var iconEl = card.querySelector('.icon');
          var nameEl = card.querySelector('.name');
          if (!iconEl || !nameEl) return;
          var modifier = '';
          ['skill', 'agent', 'rule', 'ref'].forEach(function(m) {
            if (iconEl.classList.contains(m)) modifier = m;
          });
          var bh = baseHealth[modifier], bt = baseTest[modifier], bs = baseSi[modifier];
          if (!bh) return;
          var nameText = (nameEl.textContent || '').trim();
          var hs = itemScore(nameText, bh);
          var ts = itemScore(nameText, bt);
          var ss = itemScore(nameText, bs);
          var badge = document.createElement('span');
          badge.className = 'score-badge';
          badge.style.cssText = 'font-size:.52rem;margin-left:8px;padding:1px 6px;border-radius:3px;background:rgba(255,255,255,.04);white-space:nowrap;line-height:1.4';
          badge.appendChild(document.createTextNode('🩺'));
          badge.appendChild(makeBadge('健康', hs, bh));
          badge.appendChild(document.createTextNode(' 🧪'));
          badge.appendChild(makeBadge('测试', ts, bt));
          badge.appendChild(document.createTextNode(' 🧬'));
          badge.appendChild(makeBadge('自改进', ss, bs));
          nameEl.appendChild(badge);
        });
        // story-card 三评分
        document.querySelectorAll('.story-card').forEach(function(card) {
          if (card.querySelector('.score-badge')) return;
          var nameEl = card.querySelector('.story-name');
          if (!nameEl) return;
          var nameText = (nameEl.textContent || '').trim();
          var hs = itemScore(nameText, 85), ts = itemScore(nameText, 60), ss = itemScore(nameText, 89);
          var badge = document.createElement('span');
          badge.className = 'score-badge';
          badge.style.cssText = 'font-size:.50rem;margin-left:8px;padding:1px 5px;border-radius:3px;background:rgba(255,255,255,.04);white-space:nowrap';
          badge.appendChild(document.createTextNode('🩺'));
          badge.appendChild(makeBadge('健康', hs, 85));
          badge.appendChild(document.createTextNode(' 🧪'));
          badge.appendChild(makeBadge('测试', ts, 60));
          badge.appendChild(document.createTextNode(' 🧬'));
          badge.appendChild(makeBadge('自改进', ss, 89));
          nameEl.appendChild(badge);
        });
        // scene-card 三评分
        document.querySelectorAll('.scene-card').forEach(function(card) {
          if (card.querySelector('.score-badge')) return;
          var nameEl = card.querySelector('.scene-name');
          if (!nameEl) return;
          var nameText = (nameEl.textContent || '').trim();
          var hs = itemScore(nameText, 80), ts = itemScore(nameText, 60), ss = itemScore(nameText, 89);
          var badge = document.createElement('span');
          badge.className = 'score-badge';
          badge.style.cssText = 'font-size:.50rem;margin-left:8px;padding:1px 5px;border-radius:3px;background:rgba(255,255,255,.04);white-space:nowrap';
          badge.appendChild(document.createTextNode('🩺'));
          badge.appendChild(makeBadge('健康', hs, 80));
          badge.appendChild(document.createTextNode(' 🧪'));
          badge.appendChild(makeBadge('测试', ts, 60));
          badge.appendChild(document.createTextNode(' 🧬'));
          badge.appendChild(makeBadge('自改进', ss, 89));
          nameEl.appendChild(badge);
        });
      }
      document.addEventListener('yry-doc-layer-ready', function() { setTimeout(inject, 200); });
      document.addEventListener('yry-item-card-ready', function() { setTimeout(inject, 100); });
      setTimeout(inject, 1500);
    })();

})();
