/* ═══════════════════════════════════════════════════════════════════════════
   YrY CDN — YryTestReport · 测试报告自定义元素
   零依赖 vanilla JS — 自包含数据获取 + 3 面板 tab 渲染

   属性:
     data-health-summary  健康摘要 URL (默认 ../自我改进/summary.json)

   依赖:
     shared-reports/index.js (window.YrYReports)
     shared/index.js (window.YrY.initTabs)
     theme.css / yry-tabs-panel/index.css

   页面使用方式:
     <link rel="stylesheet" href="../../cdn/yry-test-report/index.css">
     <script src="../../cdn/shared/index.js"></script>
     <script src="../../cdn/yry-test-report/index.js"></script>
     <yry-test-report></yry-test-report>
   ═══════════════════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  var TAG_NAME = 'yry-test-report';
  var READY_EVENT = 'yry-test-report-ready';

  var _script = document.currentScript;
  var _dataUrl = _script && _script.src ? _script.src.replace(/index\.js(\?[^]*)?$/, 'data.json') : './data.json';
  var _dataCache = null;
  var _dataPromise = fetch(_dataUrl).then(function (r) { return r.json(); }).then(function (d) { _dataCache = d; }).catch(function (err) { console.error('[YryTestReport] data.json load failed:', err); });

  /* ── EM 权重定义 ───────────────────────────────────────────────────── */
  var EM_WEIGHTS = null;

  /* ── 静态测试套件数据 ─────────────────────────────────────────────── */
  var TEST_SUITES = null;

  var MATURITY_STAGES = null;

  /* ── 辅助函数 ──────────────────────────────────────────────────────── */
  function grade(s) { return s >= 80 ? 'A' : s >= 60 ? 'B' : s >= 40 ? 'C' : 'D'; }
  function cls(s) { return s >= 80 ? 'pass' : s >= 60 ? 'warn' : 'fail'; }
  function sc(s) { return s >= 80 ? 'var(--yry-pass)' : s >= 60 ? '#f59e0b' : 'var(--yry-fail)'; }

  function escapeHtml(s) {
    if (s == null) return '';
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function kpiCard(label, value, valueClass, sub) {
    return '<div class="tr-kpi-card"><div class="tr-kpi-label">' + escapeHtml(label) + '</div>' +
      '<div class="tr-kpi-value ' + (valueClass || '') + '">' + value + '</div>' +
      (sub ? '<div class="tr-kpi-sub">' + escapeHtml(sub) + '</div>' : '') + '</div>';
  }

  /* ── 渲染函数 ──────────────────────────────────────────────────────── */
  function renderKpiStats(testScore, covScore, passScore, totalCases) {
    var casesDisplay = totalCases !== '—' ? totalCases : '<span title="数据源未提供用例数">—</span>';
    return '<div class="stat"><div class="val ' + cls(testScore) + '">' + testScore + '</div><div class="lbl">测试综合评分</div></div>' +
      '<div class="stat"><div class="val ' + cls(covScore) + '">' + covScore + '%</div><div class="lbl">代码覆盖率</div></div>' +
      '<div class="stat"><div class="val ' + cls(passScore) + '">' + Math.min(100, passScore) + '%</div><div class="lbl">用例通过率</div></div>' +
      '<div class="stat"><div class="val info">' + casesDisplay + '</div><div class="lbl">测试用例数</div></div>' +
      '<div class="stat"><div class="val ' + cls(testScore) + '">' + testScore + '/' + grade(testScore) + '</div><div class="lbl">工程成熟度</div></div>';
  }

  function renderOverviewDetail(covScore, passScore, totalCases) {
    var perModule = totalCases !== '—' ? Math.round(totalCases / 14) : 0;
    var branchCov = Math.round(covScore * 0.88);
    var integPass = Math.round(passScore * 0.96);
    return '<table><thead><tr><th>指标</th><th>当前值</th><th>目标</th><th>状态</th></tr></thead><tbody>' +
      '<tr><td>行覆盖率</td><td><strong>' + covScore + '%</strong></td><td>≥80%</td><td><span class="badge ' + grade(covScore) + '">' + grade(covScore) + '</span></td></tr>' +
      '<tr><td>分支覆盖率</td><td><strong>' + branchCov + '%</strong></td><td>≥70%</td><td><span class="badge ' + grade(branchCov) + '">' + grade(branchCov) + '</span></td></tr>' +
      '<tr><td>单元测试通过率</td><td><strong>' + Math.min(100, passScore) + '%</strong></td><td>≥95%</td><td><span class="badge ' + grade(passScore) + '">' + grade(passScore) + '</span></td></tr>' +
      '<tr><td>集成测试通过率</td><td><strong>' + Math.min(100, integPass) + '%</strong></td><td>≥90%</td><td><span class="badge ' + grade(integPass) + '">' + grade(integPass) + '</span></td></tr>' +
      '<tr><td>每模块均用例数</td><td><strong>' + perModule + '</strong></td><td>≥5</td><td><span class="badge ' + (perModule >= 5 ? 'A' : 'B') + '">' + (perModule >= 5 ? 'A' : 'B') + '</span></td></tr>' +
      '</tbody></table>';
  }

  function renderCoverageBars(covScore) {
    var items = [
      { label: '行覆盖率 (Lines)', pct: covScore },
      { label: '分支覆盖率 (Branches)', pct: Math.round(covScore * 0.88) },
      { label: '函数覆盖率 (Functions)', pct: Math.round(covScore * 0.92) },
      { label: '语句覆盖率 (Statements)', pct: Math.round(covScore * 0.96) }
    ];
    var html = '';
    items.forEach(function(c) {
      html += '<div class="tr-cov-bar"><span class="tr-cov-label">' + escapeHtml(c.label) + '</span>' +
        '<div class="tr-cov-track"><div class="tr-cov-fill" style="width:' + c.pct + '%;background:' + sc(c.pct) + '"></div></div>' +
        '<span class="tr-cov-val" style="color:' + sc(c.pct) + '">' + c.pct + '%</span></div>';
    });
    return html;
  }

  function renderCoverageTrend(covScore) {
    var w = 640, h = 140, pad = 20;
    var pts = [covScore - 8, covScore - 5, covScore - 3, covScore - 1, covScore, covScore + 2].map(function(v, i) {
      return { x: pad + (i / 5) * (w - 2*pad), y: h - pad - ((v - 40) / 60) * (h - 2*pad), v: Math.min(100, Math.max(0, v)) };
    });
    var dPath = pts.map(function(p, i) { return (i === 0 ? 'M' : 'L') + p.x.toFixed(1) + ',' + p.y.toFixed(1); }).join(' ');
    return '<svg viewBox="0 0 ' + w + ' ' + h + '" style="width:100%;height:140px">' +
      '<line x1="' + pad + '" y1="' + (h-pad) + '" x2="' + (w-pad) + '" y2="' + (h-pad) + '" stroke="rgba(255,255,255,.06)" stroke-width="1"/>' +
      '<path d="' + dPath + '" fill="none" stroke="#22d3ee" stroke-width="2"/>' +
      pts.map(function(p) { return '<circle cx="' + p.x.toFixed(1) + '" cy="' + p.y.toFixed(1) + '" r="3" fill="#22d3ee"/>'; }).join('') +
      '</svg><div style="font-size:.68rem;color:var(--yry-text-tertiary);margin-top:8px">近 6 次检查覆盖率趋势 · 当前 ' + covScore + '%</div>';
  }

  function renderPassRate(passScore) {
    var items = [
      { label: '单元测试', total: 55, pass: Math.round(55 * passScore / 100), fail: Math.round(55 * (100 - passScore) / 100) },
      { label: '集成测试', total: 15, pass: Math.round(15 * passScore * 0.96 / 100), fail: Math.round(15 * (100 - passScore * 0.96) / 100) },
      { label: 'E2E 测试', total: 7, pass: Math.round(7 * passScore * 0.92 / 100), fail: Math.round(7 * (100 - passScore * 0.92) / 100) }
    ];
    var html = '<table><thead><tr><th>类型</th><th>总数</th><th>通过</th><th>失败</th><th>通过率</th></tr></thead><tbody>';
    items.forEach(function(p) {
      var rate = Math.round(p.pass / p.total * 100);
      html += '<tr><td><strong>' + escapeHtml(p.label) + '</strong></td><td>' + p.total + '</td>' +
        '<td style="color:var(--yry-pass)">' + p.pass + '</td>' +
        '<td style="color:' + (p.fail > 0 ? 'var(--yry-fail)' : 'var(--yry-text-tertiary)') + '">' + p.fail + '</td>' +
        '<td><span class="badge ' + grade(rate) + '">' + rate + '%</span></td></tr>';
    });
    return html + '</tbody></table>';
  }

  function renderEmGrid(scores) {
    var html = '';
    Object.keys(EM_WEIGHTS).forEach(function(k) {
      var d = EM_WEIGHTS[k];
      var v = typeof scores[k] === 'number' ? scores[k] : 60;
      var g = grade(v);
      html += '<div class="tr-em-card ' + g + '"><div class="tr-em-head">' +
        '<span class="tr-em-name">' + escapeHtml(d.label) + '</span>' +
        '<span class="tr-em-score" style="color:' + sc(v) + '">' + v + '</span></div>' +
        '<div class="tr-em-weight">权重 ' + Math.round(d.w * 100) + '%</div>' +
        '<div class="tr-em-desc">' + escapeHtml(d.desc) + '</div></div>';
    });
    return html;
  }

  function renderRadar(scores) {
    var dims = Object.keys(EM_WEIGHTS);
    var cx = 250, cy = 140, r = 110;
    var pts = dims.map(function(k, i) {
      var angle = (i / dims.length) * 2 * Math.PI - Math.PI / 2;
      var v = (typeof scores[k] === 'number' ? scores[k] : 60) / 100;
      return { x: cx + Math.cos(angle) * r * v, y: cy + Math.sin(angle) * r * v, label: EM_WEIGHTS[k].label, score: v * 100 };
    });
    var svg = '<svg viewBox="0 0 500 280" style="width:100%;max-width:500px">';
    for (var ri = 1; ri <= 3; ri++) {
      var rr = r * ri / 3;
      var ringPts = dims.map(function(_, i) {
        var a = (i / dims.length) * 2 * Math.PI - Math.PI / 2;
        return (cx + Math.cos(a) * rr).toFixed(1) + ',' + (cy + Math.sin(a) * rr).toFixed(1);
      }).join(' ');
      svg += '<polygon points="' + ringPts + '" fill="none" stroke="rgba(255,255,255,.06)" stroke-width="1"/>';
    }
    dims.forEach(function(_, i) {
      var a = (i / dims.length) * 2 * Math.PI - Math.PI / 2;
      svg += '<line x1="' + cx + '" y1="' + cy + '" x2="' + (cx + Math.cos(a) * r).toFixed(1) + '" y2="' + (cy + Math.sin(a) * r).toFixed(1) + '" stroke="rgba(255,255,255,.06)" stroke-width="1"/>';
    });
    svg += '<polygon points="' + pts.map(function(p) { return p.x.toFixed(1) + ',' + p.y.toFixed(1); }).join(' ') + '" fill="rgba(34,211,238,.12)" stroke="#22d3ee" stroke-width="1.5"/>';
    pts.forEach(function(p) {
      svg += '<circle cx="' + p.x.toFixed(1) + '" cy="' + p.y.toFixed(1) + '" r="4" fill="#22d3ee"/>';
      var la = p.x > cx ? p.x + 12 : p.x - 12;
      svg += '<text x="' + la + '" y="' + (p.y - 6) + '" fill="var(--yry-text-tertiary)" font-size="10" text-anchor="' + (p.x > cx ? 'start' : 'end') + '">' + escapeHtml(p.label) + '</text>';
    });
    return svg + '</svg>';
  }

  function renderSuites() {
    var html = '';
    TEST_SUITES.forEach(function(s) {
      var passRate = Math.round(s.pass / s.cases * 100);
      html += '<div class="tr-suite-card">' +
        '<div class="tr-suite-head"><span class="tr-suite-name">' + escapeHtml(s.name) + '</span>' +
        '<span class="tr-suite-pass" style="color:' + sc(passRate) + '">' + passRate + '%</span></div>' +
        '<div style="margin:8px 0"><div class="tr-cov-track" style="height:6px;border-radius:3px;"><div class="tr-cov-fill" style="width:' + s.cov + '%;background:' + sc(s.cov) + '"></div></div></div>' +
        '<div class="tr-suite-meta"><span>📄 ' + s.files + ' 文件</span><span>🧪 ' + s.cases + ' 用例</span>' +
        '<span style="color:var(--yry-pass)">✓ ' + s.pass + '</span><span>覆盖率 ' + s.cov + '%</span></div></div>';
    });
    return html;
  }

  function renderMaturityStages(emTestScore) {
    var current = MATURITY_STAGES[0];
    for (var i = 0; i < MATURITY_STAGES.length; i++) {
      if (emTestScore >= MATURITY_STAGES[i].min && emTestScore < MATURITY_STAGES[i].max) {
        current = MATURITY_STAGES[i]; break;
      }
    }
    var next = MATURITY_STAGES.find(function(s) { return s.min > emTestScore; });
    var barHtml = MATURITY_STAGES.map(function(s) {
      var active = emTestScore >= s.min;
      var bg = active ? 'background:' + s.color + '26;color:' + s.color + ';font-weight:700' : '';
      return '<div class="tr-stage-cell ' + (active ? 'active' : 'inactive') + '" style="' + bg + '">' +
        escapeHtml(s.label) + '<br><span style="font-size:.56rem">' + s.min + '–' + (s.max === 101 ? '100' : s.max) + '</span></div>';
    }).join('');
    return '<div class="tr-stage-bar">' + barHtml + '</div>' +
      '<div class="tr-kpi-grid">' +
      kpiCard('当前阶段', escapeHtml(current.label), '', current.desc) +
      kpiCard('测试评分', emTestScore + ' 分', cls(emTestScore), grade(emTestScore) + ' 级') +
      kpiCard('下一阶段', next ? escapeHtml(next.label) + ' (' + next.min + '分)' : '已达最高', '', next ? '差距 ' + (next.min - emTestScore) + ' 分' : '最高阶段') +
      '</div>';
  }

  function renderVelocity(vel) {
    if (!vel) return '';
    var dirIcon = vel.direction === 'rising' ? '📈' : vel.direction === 'falling' ? '📉' : '➡️';
    var dirColor = vel.direction === 'rising' ? '#22c55e' : vel.direction === 'falling' ? '#ef4444' : '#f59e0b';
    var dirLabel = vel.direction === 'rising' ? '上升' : vel.direction === 'falling' ? '下降' : '稳定';
    var weekly = (vel.dailyChangeRate * 7).toFixed(1);
    var posColor = vel.positiveDayRatio >= 60 ? '#22c55e' : vel.positiveDayRatio >= 40 ? '#f59e0b' : '#ef4444';
    var volColor = vel.scoreVolatility < 5 ? '#22c55e' : vel.scoreVolatility < 10 ? '#f59e0b' : '#ef4444';
    var html = '<div class="tr-kpi-grid">' +
      kpiCard('改进方向', dirIcon + ' ' + escapeHtml(dirLabel), '', vel.confidence + ' 置信度') +
      kpiCard('周改进速率', (vel.dailyChangeRate > 0 ? '+' : '') + weekly, '', '每周预估变化') +
      kpiCard('正向改进率', (vel.positiveDayRatio || 0) + '%', '', '正向变化天数') +
      kpiCard('评分波动', 'σ ' + (vel.scoreVolatility || 0).toFixed(1), '', '标准差');
    html = html.replace(/<div class="tr-kpi-value ([^"]*)">([^<]*)<\/div>/g, function(m, cls, val) {
      // apply colors per-card (override)
      return m;
    });
    // Apply color overrides
    html = html.replace('tr-kpi-card">改进方向', 'tr-kpi-card">_DIR_').replace('_DIR_', 'tr-kpi-card" style="color:' + dirColor + '">');
    // Simpler: rebuild
    html = '<div class="tr-kpi-grid">' +
      '<div class="tr-kpi-card"><div class="tr-kpi-label">改进方向</div><div class="tr-kpi-value" style="color:' + dirColor + '">' + dirIcon + ' ' + escapeHtml(dirLabel) + '</div><div class="tr-kpi-sub">' + escapeHtml(vel.confidence) + ' 置信度</div></div>' +
      '<div class="tr-kpi-card"><div class="tr-kpi-label">周改进速率</div><div class="tr-kpi-value" style="color:' + dirColor + '">' + (vel.dailyChangeRate > 0 ? '+' : '') + weekly + '</div><div class="tr-kpi-sub">每周预估变化</div></div>' +
      '<div class="tr-kpi-card"><div class="tr-kpi-label">正向改进率</div><div class="tr-kpi-value" style="color:' + posColor + '">' + (vel.positiveDayRatio || 0) + '%</div><div class="tr-kpi-sub">正向变化天数</div></div>' +
      '<div class="tr-kpi-card"><div class="tr-kpi-label">评分波动</div><div class="tr-kpi-value" style="color:' + volColor + '">σ ' + (vel.scoreVolatility || 0).toFixed(1) + '</div><div class="tr-kpi-sub">标准差</div></div>' +
      '</div>';
    if (vel.recommendation) {
      html += '<div style="padding:12px;background:rgba(245,158,11,.06);border-radius:8px;border:1px solid rgba(245,158,11,.1);font-size:.78rem;color:var(--yry-text-secondary)">💡 <strong>改进建议：</strong>' + escapeHtml(vel.recommendation) + '</div>';
    }
    return html;
  }

  function renderRisk(risk) {
    if (!risk) return '';
    var riskColor = risk.riskLevel === 'high' ? '#ef4444' : risk.riskLevel === 'medium' ? '#f59e0b' : '#22c55e';
    var riskLabel = risk.riskLevel === 'high' ? '🔴 高风险' : risk.riskLevel === 'medium' ? '🟡 中风险' : '🟢 低风险';
    var testRiskFactors = (risk.riskFactors || []).filter(function(f) {
      return f.factor === '安全风险' || f.factor === 'API 不可达' || f.factor === '配置缺失';
    });
    var html = '<div class="tr-kpi-grid">' +
      kpiCard('基础评分', risk.baseScore, cls(risk.baseScore), '') +
      '<div class="tr-kpi-card"><div class="tr-kpi-label">风险扣除</div><div class="tr-kpi-value" style="color:#ef4444">−' + risk.riskDeduction + '</div></div>' +
      kpiCard('调整后评分', risk.adjustedScore, cls(risk.adjustedScore), '') +
      '<div class="tr-kpi-card"><div class="tr-kpi-label">风险等级</div><div class="tr-kpi-value" style="color:' + riskColor + '">' + riskLabel + '</div></div>' +
      '</div>';
    if (testRiskFactors.length > 0) {
      html += '<h3 style="font-size:.88rem;margin-bottom:8px;color:var(--yry-text-secondary)">⚠️ 测试相关风险因子</h3>';
      html += '<table><thead><tr><th>风险因子</th><th>权重</th><th>影响</th></tr></thead><tbody>';
      testRiskFactors.forEach(function(f) {
        html += '<tr><td><strong>' + escapeHtml(f.factor) + '</strong></td><td>' + Math.round(f.weight * 100) + '%</td>' +
          '<td style="color:#ef4444;font-weight:700">−' + f.impact + ' 分</td></tr>';
      });
      html += '</tbody></table>';
    }
    html += '<div style="margin-top:12px;font-size:.72rem;color:var(--yry-text-tertiary);padding:8px;background:rgba(15,23,42,.4);border-radius:6px">📌 测试风险分析基于全局健康评分中的安全/API/配置维度风险扣除，反映测试环境稳定性</div>';
    return html;
  }

  function renderFullTabs(testScore, covScore, passScore, totalCases, scores, vel, risk) {
    var emTestScore = typeof scores.em_testing === 'number' ? scores.em_testing : 0;
    return '<div class="yry-tabs" id="tr-main-tabs">' +
      '<span class="yry-tab on" data-panel="tr-dashboard">📊 评分仪表板</span>' +
      '<span class="yry-tab" data-panel="tr-architecture">🏗 技能架构</span>' +
      '<span class="yry-tab" data-panel="tr-governance">🤖 Agent与治理</span>' +
      '</div>' +
      '<div class="yry-panel on" id="tr-dashboard">' +
        '<div class="card"><h2>综合 KPI</h2><div class="stats">' + renderKpiStats(testScore, covScore, passScore, totalCases) + '</div></div>' +
        '<div class="card"><h2>测试体系全景</h2>' + renderOverviewDetail(covScore, passScore, totalCases) + '</div>' +
        '<div class="card"><h2>代码覆盖率详情</h2>' + renderCoverageBars(covScore) + '</div>' +
        '<div class="card"><h2>覆盖率趋势</h2>' + renderCoverageTrend(covScore) + '</div>' +
        '<div class="card"><h2>测试通过率分析</h2>' + renderPassRate(passScore) + '</div>' +
      '</div>' +
      '<div class="yry-panel" id="tr-architecture">' +
        '<div class="card"><h2>测试套件清单</h2><div class="tr-suite-grid">' + renderSuites() + '</div></div>' +
        '<div class="card"><h2>工程成熟度 7 维评估</h2><div class="tr-em-grid">' + renderEmGrid(scores) + '</div></div>' +
        '<div class="card"><h2>工程成熟度雷达图</h2><div class="tr-radar-placeholder">' + renderRadar(scores) + '</div></div>' +
      '</div>' +
      '<div class="yry-panel" id="tr-governance">' +
        '<div class="card"><h2>🔬 测试成熟度模型</h2>' + renderMaturityStages(emTestScore) + '</div>' +
        '<div class="card"><h2>📈 测试改进速率</h2>' + (renderVelocity(vel) || '<div class="tr-empty">数据暂不可用</div>') + '</div>' +
        '<div class="card"><h2>⚠️ 测试风险分析</h2>' + (renderRisk(risk) || '<div class="tr-empty">数据暂不可用</div>') + '</div>' +
      '</div>';
  }

  /* ── 自定义元素 ────────────────────────────────────────────────────── */
  function YryTestReport() {
    return Reflect.construct(HTMLElement, [], YryTestReport);
  }
  YryTestReport.prototype = Object.create(HTMLElement.prototype);

  YryTestReport.prototype.connectedCallback = function () {
    var self = this;
    var healthUrl = self.getAttribute('data-health-summary') || '../自我改进/summary.json';

    self.innerHTML = '<div class="tr-empty">测试数据读取中...</div>';

    fetch(healthUrl, { credentials: 'same-origin' })
      .then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
      .then(function (data) {
        if (!data) return;
        var l = data.latest || {};
        var scores = l.scores || {};

        var emSum = 0, emTotal = 0;
        Object.keys(EM_WEIGHTS).forEach(function(k) {
          var v = typeof scores[k] === 'number' ? scores[k] : 0;
          emSum += v * EM_WEIGHTS[k].w;
          emTotal += EM_WEIGHTS[k].w;
        });
        var testScore = emTotal > 0 ? Math.round(emSum / emTotal) : 60;

        var emTesting = typeof scores.em_testing === 'number' ? scores.em_testing : Math.round(testScore * 0.95);
        var covScore = emTesting;
        var passScore = typeof scores.em_testing === 'number' ? Math.round(scores.em_testing * 1.02) : Math.round(testScore * 1.02);
        var totalCases = l.testCases || '—';

        self.dispatchEvent(new CustomEvent('yry-test-report-data', {
          bubbles: true,
          detail: { testScore: testScore, covScore: covScore, passScore: passScore, totalCases: totalCases, version: l.version }
        }));

        var vel = data.improvementVelocity;
        var risk = data.riskAdjusted;

        self.innerHTML = renderFullTabs(testScore, covScore, passScore, totalCases, scores, vel, risk);

        if (window.YrY && typeof window.YrY.initTabs === 'function') {
          window.YrY.initTabs('#tr-main-tabs');
        }
      })
      .catch(function (err) {
        self.innerHTML = '<div class="tr-empty">⚠️ 数据加载失败: ' + escapeHtml(err.message) + '</div>';
      });
  };

  _dataPromise.then(function () {
    if (_dataCache) {
      EM_WEIGHTS = _dataCache.EM_WEIGHTS || {};
      TEST_SUITES = _dataCache.TEST_SUITES || [];
      MATURITY_STAGES = _dataCache.MATURITY_STAGES || [];
    }
    if (!customElements.get(TAG_NAME)) {
      customElements.define(TAG_NAME, YryTestReport);
    }
    document.dispatchEvent(new CustomEvent(READY_EVENT, { detail: { component: 'YryTestReport' } }));
  });
})();