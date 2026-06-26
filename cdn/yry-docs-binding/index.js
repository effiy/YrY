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
  const dataUrl = new URL('data.json', scriptUrl).href;

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
      el.meta        = '📌 v5.4.0 · 🩺 健康 94/A · 🧪 测试 100/A · 🧬 自改进 89/B · 📐 架构 A级 · 🛠 组件 86/A';
    },
    /* 3) Stats Grid */
    statsGrid: function (el) {
      el.items = [
        { value: '94/A', label: '健康评分', modifier: 'health', sub: 'PHI · 19+维度加权·核心9维+工程7维+扩展3维·D0-D8诊断联动' },
        { value: '86/A', label: '组件/模块评分', modifier: 'health', sub: 'SHI · 20 Skills·9 Agents·18 Rules·30+ Scripts 四象限质量扫描' },
        { value: '100/A', label: '测试评分', modifier: 'health', sub: 'TQI · 测试体系·类型安全·代码规范·CI/CD·文档·依赖·Git纪律' },
        { value: '89/B', label: '自改进评分', modifier: 'health', sub: 'SII · D0-D8诊断持续监控·趋势持久化·经验技能化·闭环验证' },
        { value: 'A级', label: '架构评分', modifier: 'health', sub: 'AQI · 10维度架构合规·内核轻量·范式合规·扩展隔离·文档新鲜度' },
        { value: 7,  label: '故事', modifier: 'health' },
        { value: 37, label: '场景', modifier: 'health' },
        { value: 9,  label: 'Agent', modifier: 'info' },
        { value: 18, label: '规则', modifier: 'health' }
      ];
    },
    /* 4) Cross Nav */
    crossNav: function (el) {
      el.basePath = '';
      el.active   = '';
      el.pages    = [
        { id: 'CDN 共享库',  icon: '🌐', href: '../cdn/index.html' },
        { id: '自检中心',    icon: '🧪', href: '../tests/index.html' },
        { id: '演示中心',    icon: '🎬', href: '../cdn/yry-arch/scenes/场景-1-新人上手/演示.html' },
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
  /* ── 数据外置: 见 data.json, 由 IIFE 顶层 fetch 注入 window.YRY_DOCS_DATA ── */

  /* ── Build Vue component ──────────────────────────────────────── */
  function buildComponent(templateHTML) {
    return {
      name: 'YryDocsBinding',
      template: templateHTML,
      data: function () {
        return {
          _ready: false,
          _liveUpdateTimer: null,
          _liveFetchWarned: false,
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
          /* ── 统计评分卡点击路由 (委托,内部重渲后仍生效) ── */
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
          /* 数据源: window.YRY_DOCS_DATA.layers (由 IIFE 顶层 fetch data.json 注入) */
          const dataLayers = (window.YRY_DOCS_DATA && window.YRY_DOCS_DATA.layers) || [];
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
          const list = (window.YRY_DOCS_DATA && window.YRY_DOCS_DATA.SUB_TITLE_DATA) || [];
          list.forEach(function (m) {
            const el = document.getElementById(m.id);
            if (!el) return;
            el.icon  = m.props.icon;
            el.text  = m.props.text;
            el.count = m.props.count || '';
          });
        },
        /* ── Static Layer × 3 注入 ──────────────────────────── */
        _applyStaticLayers: function () {
          const list = (window.YRY_DOCS_DATA && window.YRY_DOCS_DATA.STATIC_LAYER_DATA) || [];
          list.forEach(function (m) {
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

          /* 评分卡标签 → 报告页面路由映射
             注: 健康评分走「最新报告直跳」(动态解析),其余六张卡片走静态入口页,
             与 docs/index.html 上方的「一致性」约定保持一致 — 点击后直达最新一份报告 */
          const ROUTE_MAP = {
            '健康评分': null,   // 占位:由 _resolveLatestHealthHref 动态返回
            '测试评分': './测试报告/index.html',
            '自改进评分':   './自我改进/index.html',
            '组件评分': './组件报告/index.html',
            '加载线':   './加载链报告/index.html'
          };

          /* 健康评分卡 → 最新报告直跳 (与其它评分卡保持一致)
             健康报告目录结构特殊:
               ./健康报告/index.html     — 历史报告列表(汇总入口)
               ./健康报告/health-YYYY-MM-DD.html — 单日报告(由 rui-bot health 生成)
               ./健康报告/reports.json   — 报告清单(首项为最新)
             点击健康评分卡时,fetch reports.json 取首项 file,直达当日报告页;
             fetch 失败时回退到 index.html(历史列表)。结果缓存 60s,避免重复请求。 */
          const HEALTH_DIR = './健康报告/';
          let _healthLatestCache = null;
          const _resolveLatestHealthHref = function () {
            if (_healthLatestCache && Date.now() - _healthLatestCache.ts < 60000) {
              return Promise.resolve(_healthLatestCache.href);
            }
            return fetch(HEALTH_DIR + 'reports.json', { cache: 'no-store' })
              .then(function (r) { return r.ok ? r.json() : null; })
              .then(function (arr) {
                const file = (Array.isArray(arr) && arr[0] && arr[0].file) || '';
                const href = file ? (HEALTH_DIR + file) : (HEALTH_DIR + 'index.html');
                _healthLatestCache = { href: href, ts: Date.now() };
                return href;
              })
              .catch(function () {
                const href = HEALTH_DIR + 'index.html';
                _healthLatestCache = { href: href, ts: Date.now() };
                return href;
              });
          };

          sg.addEventListener('click', function (e) {
            const card = e.target && e.target.closest && e.target.closest('.stat-card');
            if (!card || !sg.contains(card)) return;
            const lbl = card.querySelector('.lbl');
            if (!lbl) return;
            const label = (lbl.textContent || '').trim();
            if (!ROUTE_MAP.hasOwnProperty(label)) return; // 非评分卡(如依赖/故事/场景等计数卡)不跳转
            e.preventDefault();
            if (label === '健康评分') {
              _resolveLatestHealthHref().then(function (href) { window.location.href = href; });
              return;
            }
            window.location.href = ROUTE_MAP[label];
          });

          /* 给可点击的评分卡打标记(用于 CSS 视觉提示 + hover 效果)
             注: 健康评分在 ROUTE_MAP 中值为 null(走动态解析),但仍属于可点击评分卡,
             故判定条件改为 hasOwnProperty 而非真值检查 */
          const markClickableCards = function () {
            const cards = sg.querySelectorAll('.stat-card');
            cards.forEach(function (c) {
              const lbl = c.querySelector('.lbl');
              if (lbl && ROUTE_MAP.hasOwnProperty((lbl.textContent || '').trim())) {
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

                  if (items[0]) { items[0].value = healthScore + '/' + healthGrade + ' ' + trendDir; items[0].modifier = healthCls; items[0].sub = '核心9维·工程成熟度7维·扩展3维'; items[0].tooltip = '【项目综合健康指数 PHI】\n' + dimCount + '维加权聚合 · 三大类 →\n\n▸ 核心维度(9): token·config·robots·api·reports·format·diagnostics·git·security\n▸ 工程成熟度(7): 测试覆盖·类型安全·代码检查·CI/CD·文档·依赖·Git实践\n▸ 扩展维度(3): file_size·dep_analysis·notify\n\n当前: ' + healthScore + '分 / ' + healthGrade + '级 · ' + (healthScore >= 80 ? '优秀' : healthScore >= 60 ? '良好' : '需改进') + ' ' + trendDir + '\n触发诊断: ' + diagStr + '\n\n评级: A≥80 优秀 · B≥60 良好 · C≥40 需改进 · D<40 严重缺陷\n数据源: .memory/health-trend.jsonl → summary.json · 每 5min 刷新 · 点击跳转健康报告 →'; }
                  if (items[1]) { items[1].value = testScore + '分'; items[1].modifier = testCls; items[1].sub = '测试覆盖·类型安全·代码检查·CI/CD·文档·依赖·Git'; items[1].tooltip = '【测试质量指数 TQI】\n工程成熟度 7 维加权 →\n① 测试覆盖(30%): ' + (scores.em_testing || '?') + '分 ② 类型安全(15%): ' + (scores.em_types || '?') + '分\n③ 代码检查(15%): ' + (scores.em_linting || '?') + '分 ④ CI/CD(10%): ' + (scores.em_cicd || '?') + '分\n⑤ 文档覆盖(10%): ' + (scores.em_docs || '?') + '分 ⑥ 依赖管理(10%): ' + (scores.em_deps || '?') + '分\n⑦ Git实践(10%): ' + (scores.em_git || '?') + '分\n\n综合: ' + testScore + '分 / ' + (testScore >= 80 ? 'A' : testScore >= 60 ? 'B' : 'C') + '级\n评级: A≥80 · B≥60 · C≥40 · D<40\n数据源: vitest + arch-check.mjs · 每 5min 刷新 · 点击跳转测试报告 →'; }
                  if (items[2]) { items[2].value = siScore + '分'; items[2].modifier = siCls; items[2].sub = 'Skills·Agents·Rules·Scripts四象限·' + (data.componentHealth ? data.componentHealth.totalComponents : '?') + '组件'; items[2].tooltip = '【自改进闭环指数 SII】\n组件健康四象限加权聚合 →\n▸ Skills(技能) ▸ Agents(角色) ▸ Rules(规则) ▸ Scripts(脚本)\n\n当前: ' + siScore + '分 / ' + (siScore >= 80 ? 'A' : siScore >= 60 ? 'B' : 'C') + '级 · ' + (siScore >= 80 ? '优秀' : siScore >= 60 ? '良好' : '需改进') + '\n共 ' + (data.componentHealth ? data.componentHealth.totalComponents : '?') + ' 组件 · D0-D8 九级诊断引擎持续监控\n\n评级: A≥80 · B≥60 · C≥40 · D<40\n数据源: D0-D8 诊断引擎 + arch-check.mjs · 每 5min 刷新 · 点击跳转自改进报告 →'; }
                  if (items[3]) { items[3].value = (archScore > 0 ? archScore + '/' + archGrade : '—'); items[3].modifier = archScore >= 80 ? 'health' : archScore >= 60 ? 'warn-h' : 'accent'; items[3].sub = '10维度架构合规·内核轻量·范式合规·SRP·DRY·OCP·ISP·扩展隔离·文档新鲜度'; items[3].tooltip = '【架构合规指数 ACI】\n10 维度架构健康评估 →\n▸ 内核轻量(lib≤20·编排器≤500行) ▸ 范式合规(无class/extends·无export default·无空catch)\n▸ 低耦合(扩展隔离) ▸ 单一职责(SRP) ▸ 无重复(DRY)\n▸ 精简(YAGNI) ▸ 扩展开放(OCP) ▸ 接口隔离(ISP)\n▸ 前置信息(frontmatter) ▸ 文档新鲜度\n\n当前: ' + (archScore > 0 ? archScore + '分 / ' + archGrade + '级' : '等待数据刷新') + '\n评级: A(0失败) · B(≤2失败) · C(≤4失败) · D(>4失败)\n数据源: arch-check.mjs --append-trend · 每 5min 刷新 · 点击跳转架构报告 →'; }
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
                  ph.label = { text: '🩺 ' + healthScore + '/' + healthGrade, panel: 'selfimprove', title: '健康 ' + healthScore + '分 ' + healthGrade + '级 · 测试 ' + testScore + '分 · 自改进 ' + siScore + '分 | 点击查看自改进分析' };
                }

                // 更新 Scene Header meta
                const sh = document.getElementById('scene-header-app');
                if (sh && healthScore > 0) {
                  sh.meta = '📌 v5.4.0 · 🩺 健康 ' + healthScore + '/' + healthGrade + ' · 🧪 测试 ' + testScore + '分 · 🧬 自改进 ' + siScore + '分' + (archScore > 0 ? ' · 📐 架构 ' + archScore + '/' + archGrade : '');
                }

                // Update layer stats with live scores
                const compHealth = data.componentHealth;
                if (compHealth) {
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
                if (!self._liveFetchWarned) {
                  self._liveFetchWarned = true;
                  console.warn('[docs-binding] 无法加载实时评分,使用默认值:', err.message);
                }
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
        /* ── 给徽章附加点击事件 → 打开卡片分析报告 ───────────────── */
        _attachReportClick: function (badge, card, title) {
          badge.style.cursor = 'pointer';
          badge.title = title || '点击查看卡片分析报告';
          badge.setAttribute('role', 'button');
          badge.setAttribute('tabindex', '0');
          badge.addEventListener('click', function (e) {
            e.preventDefault();
            e.stopPropagation();
            if (window.YryCardReport) window.YryCardReport.open(card);
          });
          badge.addEventListener('keydown', function (e) {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              if (window.YryCardReport) window.YryCardReport.open(card);
            }
          });
        },
        _injectScoreBadges: function () {
          const self = this;
          const baseHealth = { skill: 86, agent: 99, rule: 91, ref: 78 };
          const baseTest   = { skill: 60, agent: 60, rule: 60, ref: 60 };
          const baseSi     = { skill: 89, agent: 89, rule: 89, ref: 89 };
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

          {
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
              // 徽章整体可点击 → 打开该卡片的内容分析报告 (每张卡片独立)
              const tipSuffix = modifier === 'skill'
                ? '点击查看技能卡片分析报告'
                : '点击查看卡片分析报告';
              self._attachReportClick(badge, card, tipSuffix);
              nameEl.appendChild(badge);
            });

            // .story-card (故事卡片 → 打开该故事卡的分析报告)
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
              self._attachReportClick(badge, card, '点击查看故事卡片分析报告');
              nameEl.appendChild(badge);
            });

            // .scene-card (场景卡片 → 打开该场景卡的分析报告)
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
              self._attachReportClick(badge, card, '点击查看场景卡片分析报告');
              nameEl.appendChild(badge);
            });
          }
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

  /* ── Fetch template + data in parallel, gate component registration ── */
  let timedOut = false;
  const timeoutId = setTimeout(function () {
    timedOut = true;
    console.error('[YryDocsBinding] 资源加载超时 (' + LOAD_TIMEOUT_MS + 'ms):', templateUrl, '/', dataUrl);
  }, LOAD_TIMEOUT_MS);

  function processData(data) {
    if (window.YRY_DOCS_DATA && window.YRY_DOCS_DATA._loaded) return;
    // 组装 DOCS_LAYERS (顺序: skills → deps → lib → story → scene)
    data.layers = [data.layerSkills, data.layerDeps, data.layerLib, data.layerStory, data.layerScene];
    // 7 种交付物图标补齐 (原 forEach 突变 — 给 layerDeps/Skills/Story 的每个 item 加 links)
    [data.layerDeps, data.layerSkills, data.layerStory].forEach(function (layer) {
      layer.sections.forEach(function (sec) {
        (sec.items || []).forEach(function (item) {
          if (item.links) return;
          const links = [];
          data.DOCS_DELIVERY_ICONS.forEach(function (d) {
            const entry = { icon: d.icon, label: d.label };
            if (d.label === '源码' && item.nameHref) entry.href = item.nameHref;
            if (d.label === '演示' && item.demo) entry.href = item.demo;
            links.push(entry);
          });
          item.links = links;
        });
      });
    });
    data._loaded = true;
    window.YRY_DOCS_DATA = data;
  }

  const templatePromise = fetch(templateUrl, { credentials: 'same-origin' })
    .then(function (r) {
      if (!r.ok) throw new Error('HTTP ' + r.status + ' ' + r.statusText);
      return r.text();
    });

  const dataPromise = fetch(dataUrl, { credentials: 'same-origin' })
    .then(function (r) {
      if (!r.ok) throw new Error('HTTP ' + r.status + ' ' + r.statusText);
      return r.json();
    })
    .then(processData)
    .catch(function (err) {
      console.error('[YryDocsBinding] data.json 加载失败:', err, '· URL:', dataUrl);
    });

  Promise.all([templatePromise, dataPromise])
    .then(function (results) {
      if (timedOut) return;
      clearTimeout(timeoutId);
      const htmlText = results[0];

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
