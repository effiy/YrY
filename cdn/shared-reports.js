/* ==========================================================================
   shared-reports.js — YrY report pages shared JavaScript utilities
   用于: 健康报告 · 趋势报告 · 自循环报告 · 自我改进 · 项目分析

   依赖: theme.css (提供 --yry-* design tokens via CSS custom properties)
   加载: <script src="../../cdn/shared-reports.js"></script>

   所有函数挂载在 window.YrYReports 命名空间下。
   ========================================================================== */

(function () {
  'use strict';

  var R = window.YrYReports = {};

  /* ── Score helpers ─────────────────────────────────────────────────────── */

  /** 分数 → 颜色 CSS 变量 */
  R.scoreClr = function (s) {
    return s >= 85 ? 'var(--yry-pass)' : s >= 70 ? '#4ade80' : s >= 55 ? 'var(--yry-warn)' : 'var(--yry-fail)';
  };

  /** 分数 → 字母等级 */
  R.scoreGrade = function (s) {
    return s >= 85 ? 'A' : s >= 70 ? 'B' : s >= 55 ? 'C' : 'D';
  };

  /** 分数 → 等级 CSS class (A/B/C/D) */
  R.scoreCls = function (s) {
    return s >= 85 ? 'A' : s >= 70 ? 'B' : s >= 55 ? 'C' : 'D';
  };

  /** 等级 → 颜色 class (pass/warn/fail/info) */
  R.gradeClass = function (grade) {
    return { A: 'pass', B: 'pass', C: 'warn', D: 'fail' }[grade] || 'info';
  };

  /* ── Time formatting ───────────────────────────────────────────────────── */

  /** 相对时间格式化 (分钟 → 中文) */
  R.fmtMinutesAgo = function (minutes) {
    if (minutes == null || isNaN(minutes)) return '—';
    if (minutes < 5) return '刚刚';
    if (minutes < 60) return minutes + ' 分钟前';
    var hours = Math.floor(minutes / 60);
    if (hours < 24) return hours + ' 小时前';
    var days = Math.floor(hours / 24);
    return days + ' 天前';
  };

  /** 日期差 → 新鲜度 class (hot/warm/cold) */
  R.freshnessClass = function (diffMinutes) {
    return diffMinutes < 480 ? 'hot' : diffMinutes < 1440 ? 'warm' : 'cold';
  };

  /** 日期差 → 新鲜度中文标签 */
  R.freshnessLabel = function (diffMinutes) {
    return diffMinutes < 480 ? '实时数据' : diffMinutes < 1440 ? '今日更新' : '数据过时';
  };

  /* ── Freshness badge HTML ──────────────────────────────────────────────── */

  /**
   * 生成新鲜度 badge HTML
   * @param {string|Date} dateStr - 日期字符串 (YYYY-MM-DD)
   * @param {Date} [now] - 当前时间，默认 new Date()
   * @returns {string} HTML
   */
  R.renderFreshnessBadge = function (dateStr, now) {
    now = now || new Date();
    var d = new Date(dateStr + 'T12:00:00');
    var diffMin = Math.floor((now - d) / 60000);
    var cls = R.freshnessClass(diffMin);
    var label = R.freshnessLabel(diffMin);
    return '<span class="fresh ' + cls + '"><span class="dot"></span>' + label + ' · ' + R.fmtMinutesAgo(diffMin) + '</span>';
  };

  /**
   * 生成 freshness 状态文本和 class（用于 stat 卡片中）
   * @returns {{ text: string, cls: string }}
   */
  R.freshnessStat = function (dateStr, now) {
    now = now || new Date();
    var d = new Date(dateStr + 'T12:00:00');
    var diffMin = Math.floor((now - d) / 60000);
    var cls = diffMin < 480 ? 'pass' : diffMin < 1440 ? 'warn' : 'fail';
    return { text: R.fmtMinutesAgo(diffMin), cls: cls };
  };

  /* ── SVG Sparkline ─────────────────────────────────────────────────────── */

  /**
   * 生成得分趋势 SVG 迷你图
   * @param {number[]} scores - 得分数组 (时间升序)
   * @param {number} [width=320]
   * @param {number} [height=52]
   * @returns {string} SVG HTML
   */
  R.renderScoreSparkline = function (scores, width, height) {
    if (!scores || scores.length < 2) return '';
    var w = width || 320, h = height || 52;
    var pad = 4;
    var minS = Math.min.apply(null, scores), maxS = Math.max.apply(null, scores);
    var range = maxS - minS || 10;
    var stepX = (w - pad * 2) / (scores.length - 1);
    var points = scores.map(function (s, i) {
      var x = pad + i * stepX;
      var y = pad + (h - pad * 2) * (1 - (s - minS + range * 0.1) / (range * 1.2));
      return x.toFixed(1) + ',' + y.toFixed(1);
    }).join(' ');

    var svg = '<svg width="' + w + '" height="' + h + '" style="display:block;margin:0 auto">';
    svg += '<line x1="' + pad + '" y1="' + (h - pad) + '" x2="' + (w - pad) + '" y2="' + (h - pad) + '" stroke="rgba(255,255,255,.06)" stroke-width="1"/>';
    svg += '<line x1="' + pad + '" y1="' + pad + '" x2="' + (w - pad) + '" y2="' + pad + '" stroke="rgba(255,255,255,.04)" stroke-width="1"/>';
    svg += '<polygon points="' + pad + ',' + (h - pad) + ' ' + points + ' ' + (w - pad) + ',' + (h - pad) + '" fill="rgba(34,211,238,.08)" stroke="none"/>';
    svg += '<polyline points="' + points + '" fill="none" stroke="#22d3ee" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>';
    scores.forEach(function (s, i) {
      var x = (pad + i * stepX).toFixed(1);
      var y = (pad + (h - pad * 2) * (1 - (s - minS + range * 0.1) / (range * 1.2))).toFixed(1);
      svg += '<circle cx="' + x + '" cy="' + y + '" r="3" fill="var(--yry-bg)" stroke="#22d3ee" stroke-width="1.5"/>';
    });
    if (scores.length <= 4) {
      scores.forEach(function (s, i) {
        var x = (pad + i * stepX).toFixed(1);
        var y = (pad + (h - pad * 2) * (1 - (s - minS + range * 0.1) / (range * 1.2)) - 10).toFixed(1);
        svg += '<text x="' + x + '" y="' + y + '" text-anchor="middle" fill="' + R.scoreClr(s) + '" font-size="9" font-weight="600">' + s + '</text>';
      });
    }
    svg += '</svg>';
    return svg;
  };

  /* ── Trend delta ───────────────────────────────────────────────────────── */

  /**
   * 计算趋势方向
   * @returns {{ delta: number, cls: string, html: string }}
   */
  R.trendDelta = function (currentScore, previousScore) {
    var delta = currentScore - previousScore;
    if (delta > 3) return { delta: delta, cls: 'up', html: '<span class="trend-delta up">↑ +' + delta + '</span>' };
    if (delta < -3) return { delta: delta, cls: 'down', html: '<span class="trend-delta down">↓ ' + delta + '</span>' };
    return { delta: delta, cls: 'flat', html: '<span class="trend-delta flat">→ ' + (delta >= 0 ? '+' : '') + delta + '</span>' };
  };

  /* ── Stat card HTML ────────────────────────────────────────────────────── */

  /**
   * 生成 stat 卡片 HTML
   * @param {string|number} val - 值
   * @param {string} label - 标签
   * @param {string} [cls='info'] - CSS class (pass/warn/fail/info)
   * @returns {string} HTML
   */
  R.statCard = function (val, label, cls) {
    cls = cls || 'info';
    return '<div class="stat"><div class="val ' + cls + '">' + val + '</div><div class="lbl">' + label + '</div></div>';
  };

  /* ── Report table helpers ──────────────────────────────────────────────── */

  /**
   * 生成 badge HTML
   * @param {string} text - 显示文本
   * @param {string} variant - pass/warn/fail/info/p0/p1/p2/ok/err/rise/fall/flat
   * @returns {string} HTML
   */
  R.badge = function (text, variant) {
    return '<span class="badge ' + (variant || 'info') + '">' + text + '</span>';
  };

  /* ── Cross-dashboard data fetching ─────────────────────────────────────── */

  /**
   * 并行获取跨仪表板引用数据
   * 各 fetch 失败时静默降级为空数组/null
   * @returns {Promise<{health:Array, selfImprove:object|null, loop:Array, trend:Array}>}
   */
  R.fetchCrossRefData = function () {
    return Promise.all([
      fetch('../健康报告/reports.json').then(function (r) { return r.ok ? r.json() : []; }).catch(function () { return []; }),
      fetch('../自我改进/summary.json').then(function (r) { return r.ok ? r.json() : null; }).catch(function () { return null; }),
      fetch('../自循环报告/reports.json').then(function (r) { return r.ok ? r.json() : []; }).catch(function () { return []; }),
      fetch('../趋势报告/reports.json').then(function (r) { return r.ok ? r.json() : []; }).catch(function () { return []; })
    ]).then(function (results) {
      return {
        health: results[0],
        selfImprove: results[1],
        loop: results[2],
        trend: results[3]
      };
    });
  };

  /* ── Statistical helpers ───────────────────────────────────────────────── */

  /** 数组平均值 */
  R.mean = function (arr) {
    if (!arr.length) return 0;
    return arr.reduce(function (a, b) { return a + b; }, 0) / arr.length;
  };

  /** 数组标准差 (population) */
  R.stddev = function (arr, mean) {
    if (arr.length < 2) return 0;
    var m = mean !== undefined ? mean : R.mean(arr);
    var variance = arr.reduce(function (a, b) { return a + (b - m) * (b - m); }, 0) / arr.length;
    return Math.sqrt(variance);
  };

  /** 数组变异系数 CV (%) */
  R.cv = function (arr) {
    var m = R.mean(arr);
    return m > 0 ? Math.round(R.stddev(arr, m) / m * 100) : 0;
  };

  /** 简单线性回归斜率 (x: 0,1,...,n-1) */
  R.linearSlope = function (vals) {
    var n = vals.length;
    if (n < 2) return 0;
    var mean = R.mean(vals);
    var xMean = (n - 1) / 2;
    var sumXY = 0, sumX2 = 0;
    for (var i = 0; i < n; i++) {
      sumXY += (i - xMean) * (vals[i] - mean);
      sumX2 += (i - xMean) * (i - xMean);
    }
    return sumX2 > 0 ? sumXY / sumX2 : 0;
  };

  /** 数组中位数 */
  R.median = function (arr) {
    var sorted = arr.slice().sort(function (a, b) { return a - b; });
    var mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 === 0 ? Math.round((sorted[mid - 1] + sorted[mid]) / 2) : sorted[mid];
  };

  /* ── DOM helpers ───────────────────────────────────────────────────────── */

  /** 安全设置元素文本 */
  R.setText = function (id, text) {
    var el = typeof id === 'string' ? document.getElementById(id) : id;
    if (el) el.textContent = text;
  };

  /** 安全设置元素 HTML */
  R.setHTML = function (id, html) {
    var el = typeof id === 'string' ? document.getElementById(id) : id;
    if (el) el.textContent = '';
 el.insertAdjacentHTML('beforeend', html);
  };

  /** 安全显示/隐藏元素 */
  R.toggle = function (id, show) {
    var el = typeof id === 'string' ? document.getElementById(id) : id;
    if (el) el.style.display = show ? '' : 'none';
  };
})();
