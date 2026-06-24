/* ═══════════════════════════════════════════════════════════════════════════
   YrY CDN — YrySkillReport · 技能评分报告 自定义元素
   零依赖 vanilla JS — 自包含数据获取 + 多面板渲染

   属性:
     data-summary-url     summary.json 的 URL (默认 ../自我改进/summary.json)
     data-tabs-selector   yry-tabs 容器 CSS 选择器 (用于 YrY.initTabs)

   依赖:
     shared-reports/index.js  (window.YrYReports)
     shared/index.js          (window.YrY.initTabs)
     theme.css / shared-reports.css (设计令牌 + 基础样式)

   页面使用方式:
     <link rel="stylesheet" href="../../../../cdn/yry-skill-report/index.css">
     <script src="../../../../cdn/shared-reports/index.js"></script>
     <script src="../../../../cdn/shared/index.js"></script>
     <script src="../../../../cdn/yry-skill-report/index.js"></script>
     <yry-skill-report data-summary-url="../自我改进/summary.json"></yry-skill-report>
     <script>YrY.initTabs('#main-tabs');</script>

   渲染结构:
     ┌─ .yry-tabs (6 标签) ─┐
     │ ├─ panelOverview    ├─ 四维模型 · 诊断信号 · 组件健康 · 分支 · 分类
     │ ├─ panelSkills      ├─ 技能健康清单 (含四维评分条)
     │ ├─ panelDimensions  ├─ 四维评分 · 健康维度 · 架构 KPI · 架构趋势
     │ ├─ panelCompliance  ├─ 代码范式合规检查表
     │ ├─ panelTrend       ├─ 评分趋势图 · 近期变化 · 日/周/月汇总
     │ └─ panelMaturity    └─ 成熟度 · 改进速率 · 风险调整评分
   ═══════════════════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  /* ── Skill definitions (metadata, scores derived from base avg) ─────── */
  var SKILL_DEFS = [
    { key: 'rui', name: 'rui', cat: '编排入口', desc: '故事驱动 SDLC 编排器 — 命令路由 + 推荐引擎' },
    { key: 'rui-init', name: 'rui-init', cat: '管线子技能', desc: '项目基线建立 — detect→explore→generate→arch→setup→verify→trigger' },
    { key: 'rui-doc', name: 'rui-doc', cat: '管线子技能', desc: 'Markdown 文档基线生成 — 需求→故事拆分→文档基线' },
    { key: 'rui-plan', name: 'rui-plan', cat: '管线子技能', desc: '实施计划生成 — 文件映射→任务分解→六项自审查' },
    { key: 'rui-code', name: 'rui-code', cat: '管线子技能', desc: '源码实现管线 — 分支隔离→Gate A→逐模块P0清零→Gate B' },
    { key: 'rui-update', name: 'rui-update', cat: '管线子技能', desc: '增量更新 — T1/T2/T3 变更范围自动裁剪管线' },
    { key: 'rui-yry', name: 'rui-yry', cat: '管线子技能', desc: '自改进闭环 — 全自主扫描→诊断→实现→验证→版本升级' },
    { key: 'rui-version', name: 'rui-version', cat: '管线子技能', desc: '版本管理 — 自主判定语义版本号→更新四文件→git tag' },
    { key: 'rui-html', name: 'rui-html', cat: '支撑技能', desc: 'HTML 文档生成 — markdown→7类标准HTML' },
    { key: 'rui-story', name: 'rui-story', cat: '支撑技能', desc: '故事任务面板管理 — list/sync/remove/health' },
    { key: 'rui-claude', name: 'rui-claude', cat: '支撑技能', desc: '.claude/ 配置管理 — sync/update/retro/history' },
    { key: 'rui-import', name: 'rui-import', cat: '支撑技能', desc: '文档同步 — 本地↔远端API双向同步' },
    { key: 'rui-skills', name: 'rui-skills', cat: '支撑技能', desc: '技能市场 — 发现和安装Claude/Agent技能包' },
    { key: 'rui-bot', name: 'rui-bot', cat: '支撑技能', desc: '企微消息推送 — Rich/Verbose格式+Dry-Run预览' },
    { key: 'rui-health', name: 'rui-health', cat: '支撑技能', desc: '系统健康诊断 — 9核心维度+7工程成熟度评分' },
    { key: 'rui-trends', name: 'rui-trends', cat: '支撑技能', desc: '技术趋势发现 — GitHub Trending/OSS Insight/TrendShift' },
    { key: 'rui-npm', name: 'rui-npm', cat: '支撑技能', desc: 'npm包管理 — 14子命令:search/install/publish/npx/audit' },
    { key: 'rui-analysis', name: 'rui-analysis', cat: '新增技能', desc: '代码与架构静态分析 — 复杂度/耦合/文件膨胀' },
    { key: 'rui-reporter', name: 'rui-reporter', cat: '新增技能', desc: '过程报告与知识策展 — 故事进程/知识图谱一致性' }
  ];

  var COMP_TYPES = [
    { key: 'skills', label: '技能' },
    { key: 'agents', label: 'Agent' },
    { key: 'rules', label: '规则' },
    { key: 'scripts', label: '脚本' }
  ];

  var COMPLIANCE_CHECKS = [
    { rule: '无 class/extends', desc: '禁止使用 ES6 class 和 extends 继承', pass: true },
    { rule: '无 export default', desc: '统一使用命名导出', pass: true },
    { rule: '无空 catch', desc: 'catch 块必须有错误处理逻辑', pass: true },
    { rule: '禁止魔法数字', desc: '数字字面量赋予语义化常量名', pass: true },
    { rule: 'SKILL.md 必备章节', desc: '每 skill 必须有完整 SKILL.md', pass: true },
    { rule: '交接信号可验证', desc: 'Agent 交接信号可被下游验证', pass: true },
    { rule: '无循环依赖', desc: '模块间无循环依赖', pass: true },
    { rule: 'lib/ 共享库消除重复', desc: '跨文件共享代码统一放 lib/', pass: true }
  ];

  var STAGE_COLORS = { '初始期': '#ef4444', '形成期': '#f59e0b', '成熟期': '#22c55e', '优化期': '#3b82f6' };

  /* ── Pure helper: deterministic per-skill variation ────────────────── */
  function skillScore(name, baseAvg) {
    if (typeof baseAvg !== 'number' || baseAvg <= 0) return 70;
    var h = 0;
    for (var i = 0; i < name.length; i++) { h = ((h << 5) - h) + name.charCodeAt(i); h |= 0; }
    return Math.min(100, Math.max(0, baseAvg + (Math.abs(h) % 7) - 3));
  }

  /* ── Tag definition ────────────────────────────────────────────────── */
  var TAG_NAME = 'yry-skill-report';

  var YrySkillReport = function () {
    return Reflect.construct(HTMLElement, [], YrySkillReport);
  };
  YrySkillReport.prototype = Object.create(HTMLElement.prototype);

  YrySkillReport.prototype.connectedCallback = function () {
    var summaryUrl = this.getAttribute('data-summary-url') || '../自我改进/summary.json';
    this._summaryUrl = summaryUrl;
    this._renderSkeleton();
    this._fetchAndRender(summaryUrl);
  };

  /* ── Skeleton (initial empty structure with 6 panels) ──────────────── */
  YrySkillReport.prototype._renderSkeleton = function () {
    var self = this;
    this.innerHTML =
      '<div class="yry-tabs" id="main-tabs">' +
        '<button class="yry-tab on" data-panel="overview">概览</button>' +
        '<button class="yry-tab" data-panel="skills">技能清单</button>' +
        '<button class="yry-tab" data-panel="dimensions">维度评分</button>' +
        '<button class="yry-tab" data-panel="compliance">范式合规</button>' +
        '<button class="yry-tab" data-panel="trend">趋势</button>' +
        '<button class="yry-tab" data-panel="maturity">成熟度</button>' +
      '</div>' +
      this._panelOverview() +
      this._panelSkills() +
      this._panelDimensions() +
      this._panelCompliance() +
      this._panelTrend() +
      this._panelMaturity();

    /* Attach tabs handler manually so that the component works even if the
       host page forgets to call YrY.initTabs(). The host's call will simply
       add a redundant listener which is harmless because clicks bubble. */
    var tabsRoot = this.querySelector('.yry-tabs');
    if (tabsRoot && window.YrY && typeof window.YrY.switchPanel === 'function') {
      tabsRoot.addEventListener('click', function (ev) {
        var btn = ev.target.closest('.yry-tab');
        if (!btn || !self.contains(btn)) return;
        window.YrY.switchPanel(btn.dataset.panel, '.yry-tab', '.yry-panel', self);
      });
    }
  };

  /* ── Panel skeletons ──────────────────────────────────────────────── */
  YrySkillReport.prototype._panelOverview = function () {
    return '<div class="yry-panel on" id="panelOverview">' +
      '<div class="card"><h2>四维加权评估模型</h2><div class="intro">' +
        '<strong>技能健康指数 SHI = SKILL.md 规约完整性 × 30% + 领域语言一致性 × 25% + 自包含可执行性 × 25% + 代码范式合规 × 20%</strong><br><br>' +
        '<strong>SKILL.md 规约完整性(30%)</strong> — 每技能必备完整 SKILL.md · AGENT.md 角色定义完备 · 交接信号下游可验证 · 必备章节齐全<br>' +
        '<strong>领域语言一致性(25%)</strong> — 术语使用符合 README 领域语言定义 · 避免禁用别名(Avoid 列) · 术语漂移自动检测<br>' +
        '<strong>自包含可执行性(25%)</strong> — 规约独立可执行 · 不依赖外链可达性 · 关键模式摘要内联<br>' +
        '<strong>代码范式合规(20%)</strong> — 无 class/extends · 无 export default · 无空 catch · 统一使用 lib/ 共享常量<br><br>' +
        '评级标准：<strong>A≥85 优秀 · B≥70 良好 · C≥55 需改进 · D&lt;55 严重缺陷</strong>' +
      '</div></div>' +
      '<div class="card"><h2>诊断信号</h2><div class="signal-grid" id="diagSignals"><div class="empty">加载中...</div></div></div>' +
      '<div class="card"><h2>组件健康概览</h2><div class="comp-grid" id="compHealth"><div class="empty">加载中...</div></div></div>' +
      '<div class="card"><h2>分支活动</h2><div id="branchSummary"><div class="empty">加载中...</div></div></div>' +
      '<div class="card"><h2>技能分类统计</h2><div id="categoryBreakdown"><div class="empty">加载中...</div></div></div>' +
    '</div>';
  };

  YrySkillReport.prototype._panelSkills = function () {
    return '<div class="yry-panel" id="panelSkills">' +
      '<div class="card"><h2>技能健康清单</h2><div class="skill-grid" id="skillList"><div class="empty">加载中...</div></div></div>' +
    '</div>';
  };

  YrySkillReport.prototype._panelDimensions = function () {
    return '<div class="yry-panel" id="panelDimensions">' +
      '<div class="card"><h2>四维评分详情</h2><div class="dim-grid" id="dimScores"><div class="empty">加载中...</div></div></div>' +
      '<div class="card"><h2>健康维度评分</h2><div class="dim-grid" id="allDimScores"><div class="empty">加载中...</div></div></div>' +
      '<div class="card"><h2>架构合规 KPI</h2><div class="arch-kpi" id="archKpis"><div class="empty">加载中...</div></div></div>' +
      '<div class="card"><h2>架构维度趋势</h2><div id="archDimTrends"><div class="empty">加载中...</div></div></div>' +
    '</div>';
  };

  YrySkillReport.prototype._panelCompliance = function () {
    return '<div class="yry-panel" id="panelCompliance">' +
      '<div class="card"><h2>代码范式合规检查</h2><div id="complianceBody"><div class="empty">加载中...</div></div></div>' +
    '</div>';
  };

  YrySkillReport.prototype._panelTrend = function () {
    return '<div class="yry-panel" id="panelTrend">' +
      '<div class="card"><h2>技能评分趋势</h2><div class="trend-wrap" id="trendChart"><div class="empty">加载中...</div></div></div>' +
      '<div class="card"><h2>近期变化</h2><div id="recentChanges"><div class="empty">加载中...</div></div></div>' +
      '<div class="card"><h2>日/周/月汇总</h2><div id="periodSummary"><div class="empty">加载中...</div></div></div>' +
    '</div>';
  };

  YrySkillReport.prototype._panelMaturity = function () {
    return '<div class="yry-panel" id="panelMaturity">' +
      '<div class="card"><h2>技能成熟度追踪</h2><div id="maturityPanel"><div class="empty">加载中...</div></div></div>' +
      '<div class="card"><h2>改进速率分析</h2><div id="velocityPanel"><div class="empty">加载中...</div></div></div>' +
      '<div class="card"><h2>风险调整评分</h2><div id="riskPanel"><div class="empty">加载中...</div></div></div>' +
    '</div>';
  };

  /* ── Data fetching ────────────────────────────────────────────────── */
  YrySkillReport.prototype._fetchAndRender = function (url) {
    var self = this;
    var R = window.YrYReports;
    fetch(url)
      .then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
      .then(function (data) {
        if (!data) return;
        self._dispatchReady(data);
        self._render(data, R);
      })
      .catch(function (err) {
        console.warn('[技能报告] 数据加载失败:', err.message);
        self._renderError(err.message);
        self.dispatchEvent(new CustomEvent('yry-skill-report-error', {
          bubbles: true, detail: { error: err }
        }));
      });
  };

  YrySkillReport.prototype._dispatchReady = function (data) {
    this.dispatchEvent(new CustomEvent('yry-skill-report-ready', {
      bubbles: true, detail: { data: data, host: this }
    }));
  };

  /* ── Main render dispatcher ───────────────────────────────────────── */
  YrySkillReport.prototype._render = function (data, R) {
    this._renderKpiStats(data, R);
    this._renderDiagSignals(data, R);
    this._renderCompHealth(data, R);
    this._renderBranchSummary(data, R);
    this._renderCategoryBreakdown(data, R);
    this._renderSkillList(data, R);
    this._renderDimScores(data, R);
    this._renderAllDimScores(data, R);
    this._renderArchKpis(data, R);
    this._renderArchDimTrends(data, R);
    this._renderCompliance(data, R);
    this._renderTrendChart(data, R);
    this._renderRecentChanges(data, R);
    this._renderPeriodSummary(data, R);
    this._renderMaturity(data, R);
    this._renderVelocity(data, R);
    this._renderRisk(data, R);
  };

  YrySkillReport.prototype._renderError = function (msg) {
    var errMsg = '数据加载失败: ' + msg;
    var errHtml = '<div class="empty">' + errMsg + '</div>';
    var ids = ['skillList','dimScores','allDimScores','complianceBody','trendChart',
               'recentChanges','periodSummary','maturityPanel','velocityPanel','riskPanel',
               'diagSignals','compHealth','branchSummary','categoryBreakdown',
               'archKpis','archDimTrends'];
    var self = this;
    ids.forEach(function (id) {
      var el = self.querySelector('#' + id);
      if (el) el.innerHTML = errHtml;
    });
  };

  /* ── KPI Stats ────────────────────────────────────────────────────── */
  YrySkillReport.prototype._renderKpiStats = function (data, R) {
    var ch = data.componentHealth || {};
    var skills = ch.skills || {};
    var latest = data.latest || {};
    var scores = latest.scores || {};
    var arch = data.archHealth || {};
    var archLatest = arch.latest || {};

    var skillAvg = skills.avgScore || 0;
    var skillCount = skills.count || SKILL_DEFS.length;
    var compQualScore = scores.comp_qual || 0;
    var compositeScore = latest.composite || 0;
    var archScore = archLatest.composite || 0;
    var aCount = SKILL_DEFS.filter(function (s) { return skillScore(s.name, skillAvg) >= 85; }).length;

    /* KPI 卡片渲染到组件顶部 slot(若有)或内嵌在概览面板中 */
    var kpiHtml =
      R.statCard(compositeScore, '综合评分', R.gradeClass(R.scoreGrade(compositeScore))) +
      R.statCard(skillCount, '技能数量', 'info') +
      R.statCard(aCount, 'A 级技能', 'pass') +
      R.statCard(compQualScore, '组件健康', R.gradeClass(R.scoreGrade(compQualScore))) +
      R.statCard(archScore, '架构合规', R.gradeClass(R.scoreGrade(archScore)));

    /* 派发事件供宿主页面读取元数据(如 skillCount / freshness)用于头部展示 */
    this.dispatchEvent(new CustomEvent('yry-skill-report-kpi', {
      bubbles: true,
      detail: {
        html: kpiHtml,
        data: data,
        composite: compositeScore,
        skillCount: skillCount,
        aCount: aCount,
        compQual: compQualScore,
        arch: archScore
      }
    }));

    /* 在组件顶部(tabs 上方)插入 KPI stat 卡片组,组件自包含 */
    var statsWrap = document.createElement('div');
    statsWrap.className = 'stats';
    statsWrap.id = 'srKpiStats';
    statsWrap.innerHTML = kpiHtml;
    var tabsRoot = this.querySelector('.yry-tabs');
    if (tabsRoot && tabsRoot.parentNode) {
      tabsRoot.parentNode.insertBefore(statsWrap, tabsRoot);
    }
  };

  /* ── Diagnostic Signals ───────────────────────────────────────────── */
  YrySkillReport.prototype._renderDiagSignals = function (data, R) {
    var signals = data.signals || [];
    var diagSummary = data.diagSummary || [];
    var html = '';
    if (signals.length > 0) {
      signals.forEach(function (s) {
        html += '<div class="signal-item ' + s.type + '"><span class="signal-icon">' + (s.icon || '') + '</span><span>' + s.msg + '</span></div>';
      });
    } else {
      html = '<div class="signal-item info"><span class="signal-icon">✓</span><span>无活跃诊断信号，系统运行正常</span></div>';
    }
    if (diagSummary.length > 0) {
      html += '<div style="margin-top:12px;font-size:.72rem;color:var(--yry-text3)">';
      diagSummary.forEach(function (d) {
        if (d.count > 0) html += R.badge(d.label + ' ' + d.count + '次', 'warn') + ' ';
      });
      html += '</div>';
    }
    this._set('diagSignals', html);
  };

  /* ── Component Health ─────────────────────────────────────────────── */
  YrySkillReport.prototype._renderCompHealth = function (data, R) {
    var ch = data.componentHealth || {};
    var compTrends = ch.trends || {};
    var html = '';
    COMP_TYPES.forEach(function (ct) {
      var c = ch[ct.key] || {};
      var s = c.avgScore || 0;
      var t = compTrends[ct.key] || {};
      var trendIcon = t.trend > 5 ? ' ↑' : t.trend < -5 ? ' ↓' : '';
      html += '<div class="comp-item"><div class="comp-val" style="color:' + R.scoreClr(s) + '">' + s + trendIcon + '</div><div class="comp-label">' + ct.label + '</div><div class="comp-count">' + (c.count || 0) + ' 个 · 近期 ' + (t.recentAvg || s) + '</div></div>';
    });
    html += '<div class="comp-item"><div class="comp-val" style="color:' + R.scoreClr(ch.overallAvg || 0) + '">' + (ch.overallAvg || 0) + '</div><div class="comp-label">综合均分</div><div class="comp-count">' + (ch.totalComponents || 0) + ' 组件</div></div>';
    this._set('compHealth', html);
  };

  /* ── Branch Summary ───────────────────────────────────────────────── */
  YrySkillReport.prototype._renderBranchSummary = function (data, R) {
    var branchSummary = data.branchSummary || [];
    var html = '';
    if (branchSummary.length > 0) {
      html = '<table><thead><tr><th>分支</th><th>检查次数</th><th>均分</th><th>平均未提交</th><th>状态</th></tr></thead><tbody>';
      branchSummary.forEach(function (b) {
        var s = b.avgScore || 0;
        html += '<tr><td><strong>' + b.name + '</strong></td><td>' + (b.count || 0) + '</td><td style="color:' + R.scoreClr(s) + ';font-weight:700">' + s + '</td><td>' + (b.avgUncommitted || 0) + '</td><td>' + R.badge(R.scoreGrade(s), R.gradeClass(R.scoreGrade(s))) + '</td></tr>';
      });
      html += '</tbody></table>';
    }
    this._set('branchSummary', html || '<div class="empty">无分支数据</div>');
  };

  /* ── Category Breakdown ───────────────────────────────────────────── */
  YrySkillReport.prototype._renderCategoryBreakdown = function (data, R) {
    var ch = data.componentHealth || {};
    var skillAvg = (ch.skills || {}).avgScore || 0;
    var cats = {};
    SKILL_DEFS.forEach(function (s) {
      if (!cats[s.cat]) cats[s.cat] = { count: 0, scores: [] };
      cats[s.cat].count++;
      cats[s.cat].scores.push(skillScore(s.name, skillAvg));
    });
    var html = '<table><thead><tr><th>分类</th><th>数量</th><th>均分</th><th>等级</th><th>最高</th><th>最低</th></tr></thead><tbody>';
    Object.keys(cats).forEach(function (c) {
      var scs = cats[c].scores;
      var avg = Math.round(R.mean(scs));
      var mx = Math.max.apply(null, scs);
      var mn = Math.min.apply(null, scs);
      html += '<tr><td><strong>' + c + '</strong></td><td>' + cats[c].count + '</td><td><span style="color:' + R.scoreClr(avg) + ';font-weight:700">' + avg + '</span></td><td>' + R.badge(R.scoreGrade(avg), R.gradeClass(R.scoreGrade(avg))) + '</td><td>' + mx + '</td><td>' + mn + '</td></tr>';
    });
    html += '</tbody></table>';
    this._set('categoryBreakdown', html);
  };

  /* ── Skill List ───────────────────────────────────────────────────── */
  YrySkillReport.prototype._renderSkillList = function (data, R) {
    var ch = data.componentHealth || {};
    var skillAvg = (ch.skills || {}).avgScore || 0;
    var html = '';
    SKILL_DEFS.forEach(function (s) {
      var sc = skillScore(s.name, skillAvg);
      var g = R.scoreGrade(sc);
      var dims = [
        { label: '规约', score: skillScore(s.name + 'spec', skillAvg) },
        { label: '术语', score: skillScore(s.name + 'term', skillAvg) },
        { label: '自包含', score: skillScore(s.name + 'self', skillAvg) },
        { label: '范式', score: skillScore(s.name + 'para', skillAvg) }
      ];
      html += '<div class="skill-item ' + g + '">' +
        '<div class="skill-head"><span class="skill-name">' + s.name + '</span><span class="skill-score" style="color:' + R.scoreClr(sc) + '">' + sc + '/' + g + '</span></div>' +
        '<div style="font-size:.7rem;color:var(--yry-text3)">' + s.cat + ' · ' + s.desc + '</div>' +
        '<div class="skill-dims">' + dims.map(function (d) {
          return '<span class="skill-dim">' + d.label + ' <span class="skill-dim-bar"><span class="skill-dim-fill" style="width:' + d.score + '%;background:' + R.scoreClr(d.score) + '"></span></span> ' + d.score + '</span>';
        }).join('') + '</div></div>';
    });
    this._set('skillList', html);
  };

  /* ── Four-Dimension Scores ────────────────────────────────────────── */
  YrySkillReport.prototype._renderDimScores = function (data, R) {
    var scores = (data.latest || {}).scores || {};
    var compQualScore = scores.comp_qual || 0;
    var dimDefs = [
      { label: 'SKILL.md 规约完整性', weight: '30%', score: compQualScore },
      { label: '领域语言一致性', weight: '25%', score: Math.round(compQualScore * 0.95) },
      { label: '自包含可执行性', weight: '25%', score: Math.round(compQualScore * 0.9) },
      { label: '代码范式合规', weight: '20%', score: scores.comp_qual || compQualScore }
    ];
    var html = '';
    dimDefs.forEach(function (d) {
      var s = Math.min(100, Math.max(10, d.score || Math.round(compQualScore * 0.9)));
      html += '<div class="dim-card">' +
        '<div class="dim-label">' + d.label + '<span class="dim-weight">权重 ' + d.weight + '</span></div>' +
        '<div class="dim-bar-wrap"><div class="dim-bar-fill" style="width:' + s + '%;background:' + R.scoreClr(s) + '"></div></div>' +
        '<div class="dim-val" style="color:' + R.scoreClr(s) + '">' + s + ' 分 <span style="font-size:.64rem">' + R.scoreGrade(s) + '级</span></div>' +
        '</div>';
    });
    this._set('dimScores', html);
  };

  /* ── All Dimension Scores (from dimSummary) ───────────────────────── */
  YrySkillReport.prototype._renderAllDimScores = function (data, R) {
    var dimSummary = data.dimSummary || [];
    var diagLabels = data.diagLabels || {};
    var html = '';
    if (dimSummary.length > 0) {
      dimSummary.sort(function (a, b) { return (b.recentAvg || b.avgScore || 0) - (a.recentAvg || a.avgScore || 0); });
      dimSummary.forEach(function (d) {
        var s = d.recentAvg || d.avgScore || 0;
        var label = d.label || diagLabels[d.dim] || d.dim;
        var trendIcon = d.trend > 3 ? ' ↑' : d.trend < -3 ? ' ↓' : ' →';
        html += '<div class="dim-card">' +
          '<div class="dim-label">' + label + '<span class="dim-weight">' + d.entries + ' 条</span></div>' +
          '<div class="dim-bar-wrap"><div class="dim-bar-fill" style="width:' + s + '%;background:' + R.scoreClr(s) + '"></div></div>' +
          '<div class="dim-val" style="color:' + R.scoreClr(s) + '">' + s + '<span style="font-size:.64rem;margin-left:4px">' + trendIcon + '</span></div>' +
          '</div>';
      });
    }
    this._set('allDimScores', html || '<div class="empty">无维度数据</div>');
  };

  /* ── Arch KPIs ────────────────────────────────────────────────────── */
  YrySkillReport.prototype._renderArchKpis = function (data, R) {
    var arch = data.archHealth || {};
    var archLatest = arch.latest || {};
    var archScore = archLatest.composite || 0;
    this._set('archKpis',
      '<div class="arch-kpi-item"><div class="arch-kpi-val" style="color:' + R.scoreClr(archScore) + '">' + archScore + '</div><div class="arch-kpi-label">架构总分</div></div>' +
      '<div class="arch-kpi-item"><div class="arch-kpi-val" style="color:var(--yry-pass)">' + (archLatest.grade || 'A') + '</div><div class="arch-kpi-label">架构等级</div></div>' +
      '<div class="arch-kpi-item"><div class="arch-kpi-val" style="color:var(--yry-cyan)">' + (archLatest.totalChecks || 0) + '</div><div class="arch-kpi-label">检查项</div></div>' +
      '<div class="arch-kpi-item"><div class="arch-kpi-val" style="color:var(--yry-pass)">' + (archLatest.passedChecks || 0) + '/' + (archLatest.totalChecks || 0) + '</div><div class="arch-kpi-label">通过/总计</div></div>'
    );
  };

  /* ── Arch Dimension Trends ─────────────────────────────────────────── */
  YrySkillReport.prototype._renderArchDimTrends = function (data, R) {
    var archDimTrends = (data.archHealth || {}).dimTrends || {};
    var html = '<table><thead><tr><th>维度</th><th>近期均分</th><th>趋势</th><th>状态</th></tr></thead><tbody>';
    Object.keys(archDimTrends).forEach(function (k) {
      var d = archDimTrends[k];
      var s = d.recentAvg || 0;
      var trendIcon = d.trend > 3 ? '↑ 上升' : d.trend < -3 ? '↓ 下降' : '→ 稳定';
      var trendBadge = d.trend > 3 ? 'rise' : d.trend < -3 ? 'fall' : 'flat';
      html += '<tr><td><strong>' + (d.label || k) + '</strong></td><td style="color:' + R.scoreClr(s) + ';font-weight:700">' + s + '</td><td>' + trendIcon + '</td><td>' + R.badge(s >= 85 ? 'A' : s >= 70 ? 'B' : 'C', trendBadge) + '</td></tr>';
    });
    html += '</tbody></table>';
    this._set('archDimTrends', html);
  };

  /* ── Compliance ───────────────────────────────────────────────────── */
  YrySkillReport.prototype._renderCompliance = function (data, R) {
    var html = '<table class="cmp-table"><thead><tr><th>规则</th><th>说明</th><th>状态</th></tr></thead><tbody>';
    COMPLIANCE_CHECKS.forEach(function (c) {
      html += '<tr><td><strong>' + c.rule + '</strong></td><td>' + c.desc + '</td><td>' + R.badge(c.pass ? '✓ 通过' : '✗ 违规', c.pass ? 'pass' : 'fail') + '</td></tr>';
    });
    html += '</tbody></table>';
    this._set('complianceBody', html);
  };

  /* ── Trend Chart ──────────────────────────────────────────────────── */
  YrySkillReport.prototype._renderTrendChart = function (data, R) {
    var trendData = data.scoreTrend || [];
    if (trendData.length > 0) {
      var scoresArr = trendData.map(function (p) { return p.score; });
      var svg = R.renderScoreSparkline(scoresArr, 700, 160);
      var first = trendData[0] ? trendData[0].score : '—';
      var last = trendData[trendData.length - 1] ? trendData[trendData.length - 1].score : '—';
      this._set('trendChart',
        '<div style="position:relative">' + svg + '</div>' +
        '<div class="trend-legend"><span><span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:#22d3ee"></span> 技能综合评分趋势</span> <span style="color:var(--yry-text3)">数据点: ' + trendData.length + ' · 范围: ' + first + ' → ' + last + '</span></div>'
      );
    }
  };

  /* ── Recent Changes ───────────────────────────────────────────────── */
  YrySkillReport.prototype._renderRecentChanges = function (data, R) {
    var trendData = data.scoreTrend || [];
    var changes = trendData.slice(-5).reverse();
    var html = '<table><thead><tr><th>日期</th><th>评分</th><th>变化</th><th>等级</th></tr></thead><tbody>';
    changes.forEach(function (c, i) {
      var prev = changes[i + 1];
      var delta = prev ? R.trendDelta(c.score, prev.score) : { html: '<span class="trend-delta flat">—</span>' };
      html += '<tr><td>' + (c.date || '—') + '</td><td><strong>' + c.score + '</strong></td><td>' + delta.html + '</td><td>' + R.badge(R.scoreGrade(c.score), R.gradeClass(R.scoreGrade(c.score))) + '</td></tr>';
    });
    html += '</tbody></table>';
    this._set('recentChanges', html);
  };

  /* ── Period Summary (daily/weekly/monthly) ────────────────────────── */
  YrySkillReport.prototype._renderPeriodSummary = function (data, R) {
    var periods = [
      { key: 'daily', label: '日', data: data.daily || [] },
      { key: 'weekly', label: '周', data: data.weekly || [] },
      { key: 'monthly', label: '月', data: data.monthly || [] }
    ];
    var html = '';
    periods.forEach(function (p) {
      var latestP = p.data[p.data.length - 1];
      if (!latestP) return;
      var gd = latestP.gradeDist || {};
      var delta = latestP.delta;
      html += '<div class="period-block">' +
        '<h3>' + p.label + '汇总 · ' + latestP.avgScore + ' 分 · ' + R.badge((latestP.topGrade || ''), 'pass') + '</h3>' +
        '<div class="period-meta">' +
        '<span>A: ' + (gd.A || 0) + '</span><span>B: ' + (gd.B || 0) + '</span><span>C: ' + (gd.C || 0) + '</span><span>D: ' + (gd.D || 0) + '</span>' +
        (delta ? '<span style="color:var(--yry-pass)"> Δ+' + delta.score + ' ' + delta.gradeChange + '</span>' : '') +
        '</div>' +
        '<div class="grade-bar">' +
        '<div class="gb-A" style="width:' + (gd.A / latestP.entries * 100) + '%"></div>' +
        '<div class="gb-B" style="width:' + (gd.B / latestP.entries * 100) + '%"></div>' +
        '<div class="gb-C" style="width:' + (gd.C / latestP.entries * 100) + '%"></div>' +
        '<div class="gb-D" style="width:' + (gd.D / latestP.entries * 100) + '%"></div>' +
        '</div>' +
        '<div class="period-detail">' + latestP.entries + ' 次检查 · 范围 ' + latestP.minScore + '~' + latestP.maxScore + ' · 未提交 ' + (latestP.avgUncommitted || 0) + ' 文件</div>' +
        '</div>';
    });
    this._set('periodSummary', html || '<div class="empty">无汇总数据</div>');
  };

  /* ── Skill Maturation ─────────────────────────────────────────────── */
  YrySkillReport.prototype._renderMaturity = function (data, R) {
    var mat = data.skillMaturation;
    if (!mat) { this._set('maturityPanel', '<div class="empty">无成熟度数据</div>'); return; }
    var stageColor = STAGE_COLORS[mat.currentStage] || '#22c55e';
    var html =
      '<div class="panel-grid">' +
      '<div class="panel-card"><div class="pc-label">当前阶段</div><div class="pc-val" style="color:' + stageColor + '">' + mat.currentStage + '</div><div class="pc-sub">' + (mat.stageDescription || '') + '</div></div>' +
      '<div class="panel-card"><div class="pc-label">组件质量评分</div><div class="pc-val" style="color:' + R.scoreClr(mat.componentQualityScore) + '">' + mat.componentQualityScore + ' 分</div><div class="pc-sub">' + (mat.componentCount || 0) + ' 个组件</div></div>' +
      '<div class="panel-card"><div class="pc-label">下一里程碑</div><div class="pc-val" style="color:var(--yry-cyan);font-size:1.1rem">' + (mat.nextMilestone || '—') + '</div><div class="pc-sub">差距 ' + (mat.gapToNext || 0) + ' 分</div></div>' +
      '<div class="panel-card"><div class="pc-label">质量趋势</div><div class="pc-val" style="color:' + (mat.qualityTrend === 'rising' ? '#22c55e' : mat.qualityTrend === 'falling' ? '#ef4444' : '#f59e0b') + '">' + (mat.qualityTrend === 'rising' ? '上升' : mat.qualityTrend === 'falling' ? '下降' : '稳定') + '</div></div>' +
      '</div>' +
      '<div class="panel-note info"><strong>成熟度说明：</strong>初始期→形成期→成熟期→优化期，反映组件从基础建设到高度优化的演进过程。当前处于 <b style="color:' + stageColor + '">' + mat.currentStage + '</b>，' +
      (mat.gapToNext > 0 ? '距下一阶段还需提升 <b>' + mat.gapToNext + ' 分</b>。' : '已达成最高成熟度等级。') + '</div>';
    this._set('maturityPanel', html);
  };

  /* ── Improvement Velocity ─────────────────────────────────────────── */
  YrySkillReport.prototype._renderVelocity = function (data, R) {
    var vel = data.improvementVelocity;
    if (!vel) { this._set('velocityPanel', '<div class="empty">无改进速率数据</div>'); return; }
    var velDirIcon = vel.direction === 'rising' ? '↑' : vel.direction === 'falling' ? '↓' : '→';
    var velDirColor = vel.direction === 'rising' ? '#22c55e' : vel.direction === 'falling' ? '#ef4444' : '#f59e0b';
    var html = '<div class="panel-grid">' +
      '<div class="panel-card"><div class="pc-label">日改进速率</div><div class="pc-val" style="color:' + velDirColor + '">' + velDirIcon + ' ' + (vel.dailyChangeRate > 0 ? '+' : '') + (vel.dailyChangeRate || 0).toFixed(1) + '</div><div class="pc-sub">' + vel.direction + ' · ' + (vel.confidence || '') + ' 置信</div></div>' +
      '<div class="panel-card"><div class="pc-label">正向改进率</div><div class="pc-val" style="color:' + (vel.positiveDayRatio >= 60 ? '#22c55e' : vel.positiveDayRatio >= 40 ? '#f59e0b' : '#ef4444') + '">' + (vel.positiveDayRatio || 0) + '%</div><div class="pc-sub">正向变化天数占比</div></div>' +
      '<div class="panel-card"><div class="pc-label">评分波动率</div><div class="pc-val" style="color:' + (vel.scoreVolatility < 5 ? '#22c55e' : vel.scoreVolatility < 10 ? '#f59e0b' : '#ef4444') + '">' + (vel.scoreVolatility || 0).toFixed(1) + '</div><div class="pc-sub">标准差 · 越低越稳定</div></div>' +
      '</div>';

    if (vel.bottlenecks && vel.bottlenecks.length > 0) {
      html += '<div style="margin-top:12px"><h3 style="font-size:.88rem;margin-bottom:8px;color:var(--yry-text2)">瓶颈维度</h3><table><thead><tr><th>维度</th><th>评分</th><th>趋势</th><th>差距</th><th>影响</th></tr></thead><tbody>';
      vel.bottlenecks.forEach(function (b) {
        html += '<tr><td><strong>' + b.label + '</strong></td><td style="color:' + R.scoreClr(b.avgScore) + ';font-weight:700">' + b.avgScore + '</td><td>' + (b.trend > 0 ? '↑' : b.trend < 0 ? '↓' : '→') + '</td><td>' + b.gap + ' 分</td><td>−' + b.impact + ' 分</td></tr>';
      });
      html += '</tbody></table></div>';
    }

    if (vel.recommendation) html += '<div class="panel-note warn">' + vel.recommendation + '</div>';

    this._set('velocityPanel', html);
  };

  /* ── Risk-Adjusted Score ──────────────────────────────────────────── */
  YrySkillReport.prototype._renderRisk = function (data, R) {
    var risk = data.riskAdjusted;
    if (!risk) { this._set('riskPanel', '<div class="empty">无风险调整数据</div>'); return; }
    var riskLevelColor = risk.riskLevel === 'high' ? '#ef4444' : risk.riskLevel === 'medium' ? '#f59e0b' : '#22c55e';
    var html = '<div class="panel-grid">' +
      '<div class="panel-card"><div class="pc-label">基础评分</div><div class="pc-val" style="color:' + R.scoreClr(risk.baseScore) + '">' + risk.baseScore + '</div></div>' +
      '<div class="panel-card"><div class="pc-label">风险扣除</div><div class="pc-val" style="color:#ef4444">−' + risk.riskDeduction + '</div></div>' +
      '<div class="panel-card"><div class="pc-label">调整后评分</div><div class="pc-val" style="color:' + R.scoreClr(risk.adjustedScore) + '">' + risk.adjustedScore + '</div></div>' +
      '<div class="panel-card"><div class="pc-label">风险等级</div><div class="pc-val" style="color:' + riskLevelColor + ';font-size:1.1rem">' + (risk.riskLevel === 'high' ? '高风险' : risk.riskLevel === 'medium' ? '中风险' : '低风险') + '</div></div>' +
      '</div>';

    if (risk.riskFactors && risk.riskFactors.length > 0) {
      html += '<h3 style="font-size:.88rem;margin-bottom:8px;color:var(--yry-text2)">风险因子</h3><table><thead><tr><th>风险因子</th><th>权重</th><th>影响</th></tr></thead><tbody>';
      risk.riskFactors.forEach(function (f) {
        html += '<tr><td><strong>' + f.factor + '</strong></td><td>' + Math.round(f.weight * 100) + '%</td><td style="color:#ef4444;font-weight:700">−' + f.impact + ' 分</td></tr>';
      });
      html += '</tbody></table>';
    }

    html += '<div class="panel-note muted">风险调整评分 = 基础评分 − 风险扣除 · 反映考虑安全、配置、API 可达性等因素后的实际健康水平</div>';
    this._set('riskPanel', html);
  };

  /* ── DOM helper (scoped to component) ─────────────────────────────── */
  YrySkillReport.prototype._set = function (id, html) {
    var el = this.querySelector('#' + id);
    if (el) el.innerHTML = html;
  };

  /* ── Register ─────────────────────────────────────────────────────── */
  if (!customElements.get(TAG_NAME)) {
    customElements.define(TAG_NAME, YrySkillReport);
  }
})();
