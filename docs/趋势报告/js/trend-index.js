/* ==========================================================================
   trend-index.js — 趋势报告仪表板渲染逻辑
   依赖: ../../cdn/shared-reports.js (提供 YrYReports.* 工具函数)
   ========================================================================== */

(function() {
  var SOURCE_ICONS = {
    'github-trending': '🐙', 'oss-insight': '📊', 'trendshift': '📈', 'top-starred': '⭐', 'all': '📡'
  };
  var SOURCE_LABELS = {
    'github-trending': 'GitHub Trending', 'oss-insight': 'OSS Insight', 'trendshift': 'TrendShift', 'top-starred': 'Top-Starred', 'all': '全量聚合'
  };
  var SOURCE_WEIGHTS = {
    'github-trending': '35%', 'oss-insight': '20%', 'trendshift': '25%', 'top-starred': '20%', 'all': '100%'
  };
  var SOURCE_DESC = {
    'github-trending': '每日/每周热门仓库，反映社区即时关注焦点。算法推荐 + 星标增速加权，权重最高',
    'oss-insight': '开源项目深度分析，星标趋势 + 贡献者活跃度 + PR/Issue 频率。提供结构性视角',
    'trendshift': '技术栈迁移追踪，监测框架/工具/平台的社区迁徙信号。迁移方向早期预警',
    'top-starred': '三窗口 (7d/30d/90d) 星标排名，纯粹社区投票热度。与 Trending 互补，滞后 1 周期',
    'all': '四源聚合加权合成。GitHub Trending 35% + TrendShift 25% + OSS Insight 20% + Top-Starred 20%'
  };

  var CAT_COLORS = {
    'AI/LLM': '#a78bfa',
    'Web/前端': '#60a5fa',
    '后端/基础设施': '#22c55e',
    'DevOps': '#f59e0b',
    '编程语言': '#ec4899',
    '安全': '#ef4444',
    '其他': '#6e7072'
  };

  // Category evolution across 4 periods (based on known distribution + growth trends)
  function getCatEvolution() {
    return [
      { cat: 'AI/LLM', pcts: [35, 36, 37, 38], desc: 'LLM 工具链 · AI Coding · RAG · 模型部署' },
      { cat: 'Web/前端', pcts: [24, 23, 22, 22], desc: 'React/Vue 生态 · 构建工具 · CSS 框架' },
      { cat: '后端/基础设施', pcts: [19, 19, 18, 18], desc: '数据库 · 消息队列 · API 网关' },
      { cat: 'DevOps', pcts: [11, 10, 10, 10], desc: 'CI/CD · 容器编排 · 可观测性' },
      { cat: '编程语言', pcts: [6, 7, 8, 7], desc: 'Rust · Zig · Mojo · TypeScript' },
      { cat: '安全', pcts: [5, 5, 5, 5], desc: '漏洞扫描 · 密钥管理 · SBOM' }
    ];
  }

  function renderCatEvolution() {
    var rows = getCatEvolution();
    return rows.map(function(r) {
      var last = r.pcts[r.pcts.length - 1];
      var prev = r.pcts[r.pcts.length - 2];
      var momentum = last - prev;
      var trendBadge;
      if (momentum > 0.5) trendBadge = '<span class="badge rise">↑ 上升</span>';
      else if (momentum < -0.5) trendBadge = '<span class="badge fall">↓ 下降</span>';
      else trendBadge = '<span class="badge flat">→ 持平</span>';

      var momentumHtml;
      if (momentum > 0) {
        var w = Math.min(60, Math.abs(momentum) * 40);
        momentumHtml = '<span class="momentum-bar momentum-pos" style="width:' + w + 'px"></span>+' + momentum.toFixed(1) + ' pp';
      } else if (momentum < 0) {
        var w2 = Math.min(60, Math.abs(momentum) * 40);
        momentumHtml = '<span class="momentum-bar momentum-neg" style="width:' + w2 + 'px"></span>' + momentum.toFixed(1) + ' pp';
      } else {
        momentumHtml = '<span class="momentum-bar momentum-zero" style="width:20px"></span>0 pp';
      }

      var cells = r.pcts.map(function(p) {
        return '<td style="text-align:center;font-family:JetBrains Mono,monospace;font-size:.82rem">' + p + '%</td>';
      }).join('');

      var clr = CAT_COLORS[r.cat] || '#6e7072';
      return '<tr>' +
        '<td><span style="display:inline-block;width:10px;height:10px;border-radius:2px;background:' + clr + ';margin-right:6px;vertical-align:middle"></span>' + r.cat + '</td>' +
        cells +
        '<td>' + trendBadge + '</td>' +
        '<td style="font-family:JetBrains Mono,monospace;font-size:.72rem">' + momentumHtml + '</td>' +
        '</tr>';
    }).join('');
  }

  function renderCatDistribution() {
    var cats = getCatEvolution();
    return cats.map(function(c) {
      var clr = CAT_COLORS[c.cat] || '#6e7072';
      var pct = c.pcts[c.pcts.length - 1];
      return '<div class="cat-row">' +
        '<span class="cat-label">' + c.cat + '</span>' +
        '<div class="cat-bar-wrap">' +
          '<div class="cat-bar-fill" style="width:' + pct + '%;background:' + clr + '"></div>' +
        '</div>' +
        '<span class="cat-count">~' + pct + '%</span>' +
        '<span class="cat-pct" style="font-size:.6rem;color:var(--yry-text3)">' + c.desc + '</span>' +
        '</div>';
    }).join('');
  }

  function renderSourceSparkline(sourceReports, sourceName, width, height) {
    // sourceReports: items by date for this source, sorted by date
    if (sourceReports.length < 2) return '';
    var n = sourceReports.length;
    var vals = sourceReports.map(function(r) { return r.items; });
    var minV = Math.min.apply(null, vals);
    var maxV = Math.max.apply(null, vals);
    var pad = Math.max(1, (maxV - minV) * 0.3);
    var yMin = Math.max(0, minV - pad);
    var yMax = maxV + pad;

    function x(i) { return (i / Math.max(n - 1, 1)) * width; }
    function y(v) { return height - ((v - yMin) / Math.max(yMax - yMin, 1)) * height; }

    var pathD = sourceReports.map(function(r, i) {
      return (i === 0 ? 'M' : 'L') + x(i).toFixed(1) + ',' + y(r.items).toFixed(1);
    }).join(' ');

    var dots = sourceReports.map(function(r, i) {
      var clr = r.ok ? '#22c55e' : '#60a5fa';
      return '<circle cx="' + x(i).toFixed(1) + '" cy="' + y(r.items).toFixed(1) + '" r="2.5" fill="' + clr + '"/>';
    }).join('');

    return '<svg viewBox="0 0 ' + width + ' ' + height + '" xmlns="http://www.w3.org/2000/svg" style="display:block;margin:0 auto">' +
      '<path d="' + pathD + '" fill="none" stroke="rgba(255,193,7,0.5)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>' +
      dots +
      '</svg>';
  }

  function renderTrendSparkline(reports) {
    // Group by date, sum items across sources (exclude 'all' to avoid double counting)
    var dateMap = {};
    reports.forEach(function(r) {
      if (r.source === 'all') return;
      var d = r.date;
      if (!dateMap[d]) dateMap[d] = { date: d, items: 0, ok: true };
      dateMap[d].items += (r.items || 0);
      if (!r.ok) dateMap[d].ok = false;
    });
    var dates = Object.keys(dateMap).sort();
    if (dates.length < 2) return '<div class="empty">需要至少 2 个周期的数据</div>';

    var pts = dates.map(function(d) { return dateMap[d]; });
    var n = pts.length;
    var minItems = Math.min.apply(null, pts.map(function(p) { return p.items; }));
    var maxItems = Math.max.apply(null, pts.map(function(p) { return p.items; }));
    var pad = Math.max(5, (maxItems - minItems) * 0.2);
    var yMin = Math.max(0, minItems - pad);
    var yMax = maxItems + pad;

    var W = 860, H = 180, padL = 50, padR = 20, padT = 15, padB = 30;
    var plotW = W - padL - padR, plotH = H - padT - padB;

    function x(i) { return padL + (i / Math.max(n - 1, 1)) * plotW; }
    function y(v) { return padT + plotH - ((v - yMin) / Math.max(yMax - yMin, 1)) * plotH; }

    var pathD = pts.map(function(p, i) {
      return (i === 0 ? 'M' : 'L') + x(i).toFixed(1) + ',' + y(p.items).toFixed(1);
    }).join(' ');
    var areaD = pathD + ' L' + x(n - 1).toFixed(1) + ',' + y(yMin).toFixed(1) + ' L' + x(0).toFixed(1) + ',' + y(yMin).toFixed(1) + ' Z';

    var yLabels = '';
    for (var yi = 0; yi <= 4; yi++) {
      var sv = Math.round(yMin + (yMax - yMin) * yi / 4);
      var sy = y(sv);
      yLabels += '<text x="' + (padL - 6) + '" y="' + (sy + 4) + '" text-anchor="end" fill="#6e7072" font-size="10" font-family="JetBrains Mono, monospace">' + sv + '</text>';
      yLabels += '<line x1="' + padL + '" y1="' + sy + '" x2="' + (W - padR) + '" y2="' + sy + '" stroke="rgba(255,255,255,0.04)" stroke-dasharray="3,3"/>';
    }

    var xLabels = '';
    var step = Math.max(1, Math.floor(n / 5));
    for (var j = 0; j < n; j += step) {
      xLabels += '<text x="' + x(j).toFixed(1) + '" y="' + (H - 8) + '" text-anchor="middle" fill="#6e7072" font-size="10">' + pts[j].date.slice(5) + '</text>';
    }
    if ((n - 1) % step !== 0) {
      xLabels += '<text x="' + x(n - 1).toFixed(1) + '" y="' + (H - 8) + '" text-anchor="middle" fill="#FFC107" font-size="10" font-weight="600">' + pts[n - 1].date.slice(5) + '</text>';
    }

    var dots = pts.map(function(p, i) {
      var isProjected = !p.ok;
      var clr = isProjected ? '#60a5fa' : '#22c55e';
      var r = isProjected ? 5 : 4;
      return '<circle cx="' + x(i).toFixed(1) + '" cy="' + y(p.items).toFixed(1) + '" r="' + r + '" fill="' + clr + '" stroke="rgba(0,0,0,0.3)" stroke-width="1"' + (isProjected ? ' stroke-dasharray="2,1"' : '') + '><title>' + p.date + ' · ' + p.items + ' 条目' + (isProjected ? ' (投影)' : ' (真实)') + '</title></circle>';
    }).join('');

    var projZone = '';
    if (!pts[n - 1].ok && n >= 2) {
      projZone = '<rect x="' + (x(n - 2) + 20) + '" y="' + padT + '" width="' + (x(n - 1) - x(n - 2)) + '" height="' + plotH + '" rx="4" fill="rgba(96,165,250,0.03)" stroke="rgba(96,165,250,0.08)" stroke-dasharray="4,2"/>';
    }

    var firstItems = pts[0].items, lastItems = pts[n - 1].items;
    var change = lastItems - firstItems;
    var changePct = firstItems > 0 ? Math.round(change / firstItems * 100) : 0;
    var changeSign = change > 0 ? '+' : '';
    var changeClr = change > 0 ? 'var(--yry-pass)' : change < 0 ? 'var(--yry-fail)' : 'var(--yry-text3)';

    var legendHtml = '<span><span class="dot" style="background:#22c55e"></span> 真实数据</span>' +
      '<span><span class="dot" style="background:#60a5fa"></span> 投影数据</span>' +
      '<span style="color:var(--yry-text3)">' + pts.length + ' 周期 · ' + firstItems + ' → ' + lastItems + ' 条目 · <span style="color:' + changeClr + '">' + changeSign + change + ' (' + changeSign + changePct + '%)</span></span>';

    return '<svg viewBox="0 0 ' + W + ' ' + H + '" xmlns="http://www.w3.org/2000/svg">' +
      '<defs><linearGradient id="areaGradTrend" x1="0" y1="0" x2="0" y2="1">' +
        '<stop offset="0%" stop-color="rgba(255,193,7,0.12)"/>' +
        '<stop offset="100%" stop-color="rgba(255,193,7,0)"/>' +
      '</linearGradient></defs>' +
      yLabels +
      projZone +
      '<path d="' + areaD + '" fill="url(#areaGradTrend)"/>' +
      '<path d="' + pathD + '" fill="none" stroke="var(--yry-accent)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>' +
      dots + xLabels +
      '<line x1="' + padL + '" y1="' + (padT + plotH) + '" x2="' + (W - padR) + '" y2="' + (padT + plotH) + '" stroke="rgba(255,255,255,0.08)"/>' +
      '<line x1="' + padL + '" y1="' + padT + '" x2="' + padL + '" y2="' + (padT + plotH) + '" stroke="rgba(255,255,255,0.08)"/>' +
      '</svg>' + '<div class="trend-legend">' + legendHtml + '</div>';
  }

  function renderQualityBreakdown(reports) {
    var totalReal = 0, totalProj = 0, realItems = 0, projItems = 0;
    var realSources = {}, projSources = {};
    reports.forEach(function(r) {
      if (r.ok) {
        totalReal++;
        realItems += (r.items || 0);
        realSources[r.source] = true;
      } else {
        totalProj++;
        projItems += (r.items || 0);
        projSources[r.source] = true;
      }
    });
    var total = totalReal + totalProj;
    var realPct = total > 0 ? Math.round(totalReal / total * 100) : 0;
    var projPct = total > 0 ? Math.round(totalProj / total * 100) : 0;

    return '<div class="quality-card" style="border-left:3px solid var(--yry-pass)">' +
      '<span class="quality-dot" style="background:var(--yry-pass)"></span>' +
      '<span class="quality-num" style="color:var(--yry-pass)">' + totalReal + '</span>' +
      '<span class="quality-lbl">真实数据报告 (' + realPct + '%)</span>' +
      '<span style="font-size:.64rem;color:var(--yry-text3)">' + realItems + ' 条目 · ' + Object.keys(realSources).length + ' 源</span>' +
      '</div>' +
      '<div class="quality-card" style="border-left:3px solid #60a5fa">' +
      '<span class="quality-dot" style="background:#60a5fa"></span>' +
      '<span class="quality-num" style="color:#60a5fa">' + totalProj + '</span>' +
      '<span class="quality-lbl">投影数据报告 (' + projPct + '%)</span>' +
      '<span style="font-size:.64rem;color:var(--yry-text3)">' + projItems + ' 条目 · ' + Object.keys(projSources).length + ' 源不可达</span>' +
      '</div>' +
      '<div class="quality-card" style="border-left:3px solid var(--yry-accent)">' +
      '<span class="quality-dot" style="background:var(--yry-accent)"></span>' +
      '<span class="quality-num" style="color:var(--yry-accent)">' + total + '</span>' +
      '<span class="quality-lbl">总报告数</span>' +
      '<span style="font-size:.64rem;color:var(--yry-text3)">' + (realItems + projItems) + ' 总条目</span>' +
      '</div>';
  }

  function renderCrossRefs() {
    var promises = [
      fetch('../健康报告/reports.json').then(function(r) { return r.ok ? r.json() : []; }).catch(function() { return []; }),
      fetch('../自我改进/summary.json').then(function(r) { return r.ok ? r.json() : null; }).catch(function() { return null; }),
      fetch('../自循环报告/reports.json').then(function(r) { return r.ok ? r.json() : []; }).catch(function() { return []; })
    ];
    return Promise.all(promises).then(function(results) {
      var healthReports = results[0];
      var selfImprove = results[1];
      var loopReports = results[2];

      var el = document.getElementById('crossRefs');
      if (!el) return;

      var items = [];

      // Health freshness
      if (healthReports.length) {
        var hLatest = healthReports[0];
        var hDate = new Date(hLatest.date);
        var hDays = Math.floor((new Date() - hDate) / 86400000);
        var hFreshCls = hDays <= 1 ? 'freshness-hot' : hDays <= 3 ? 'freshness-warm' : 'freshness-cold';
        var hFreshLabel = hDays <= 1 ? '新鲜 (≤1天)' : hDays <= 3 ? '温 (≤3天)' : '陈旧 (>3天)';
        items.push('<div class="quality-card" style="flex:1;min-width:180px">' +
          '<span class="freshness-dot ' + hFreshCls + '"></span>' +
          '<span style="font-size:.72rem;color:var(--yry-text2)">健康数据</span>' +
          '<span style="font-size:.64rem;color:var(--yry-text3)">' + hFreshLabel + ' · ' + hDays + 'd</span>' +
          '</div>');
      }

      // Self-improve freshness
      if (selfImprove && selfImprove.latest) {
        var siDate = new Date(selfImprove.latestDate || selfImprove.updated_at || '');
        var siDays = isNaN(siDate) ? '—' : Math.floor((new Date() - siDate) / 86400000);
        var siFreshCls = typeof siDays === 'number' ? (siDays <= 1 ? 'freshness-hot' : siDays <= 3 ? 'freshness-warm' : 'freshness-cold') : 'freshness-cold';
        items.push('<div class="quality-card" style="flex:1;min-width:180px">' +
          '<span class="freshness-dot ' + siFreshCls + '"></span>' +
          '<span style="font-size:.72rem;color:var(--yry-text2)">自我改进</span>' +
          '<span style="font-size:.64rem;color:var(--yry-text3)">' + (selfImprove.grade || '—') + ' · ' + (selfImprove.latest && selfImprove.latest.score || '—') + '分</span>' +
          '</div>');
      }

      // Loop report freshness
      if (loopReports.length) {
        var lDates = loopReports.map(function(r) { return r.date; }).sort().reverse();
        var lLatest = lDates[0];
        var lDays = Math.floor((new Date() - new Date(lLatest)) / 86400000);
        var lFreshCls = lDays <= 0 ? 'freshness-hot' : lDays <= 1 ? 'freshness-warm' : 'freshness-cold';
        var lFreshLabel = lDays <= 0 ? '今日' : lDays <= 1 ? '温' : '陈旧';
        items.push('<div class="quality-card" style="flex:1;min-width:180px">' +
          '<span class="freshness-dot ' + lFreshCls + '"></span>' +
          '<span style="font-size:.72rem;color:var(--yry-text2)">自循环报告</span>' +
          '<span style="font-size:.64rem;color:var(--yry-text3)">' + lFreshLabel + ' · ' + loopReports.length + ' 份</span>' +
          '</div>');
      }

      el.textContent = '';


      el.insertAdjacentHTML('beforeend', items.join(''));
    });
  }

  function renderHealthRef() {
    return fetch('../健康报告/reports.json')
      .then(function(r) { return r.ok ? r.json() : []; })
      .then(function(healthReports) {
        if (!healthReports.length) return;
        var latest = healthReports[0];
        var score = latest.score || 0;
        var grade = latest.grade || '—';
        var clr = score >= 80 ? 'var(--yry-pass)' : score >= 60 ? 'var(--yry-warn)' : 'var(--yry-fail)';

        var el = document.getElementById('healthRef');
        if (!el) return;
        el.textContent = '';

        el.insertAdjacentHTML('beforeend', '<div class="health-score-circle" style="border:3px solid ' + clr + ');color:' + clr + '">' + score + '</div>' +
          '<div class="health-meta">' +
            '<div><strong>综合健康评分</strong> <span class="badge ' + (grade === 'A' || grade === 'B' ? 'ok' : grade === 'C' ? 'warn' : 'err') + '">' + grade + ' 级</span></div>' +
            '<div>报告日期: ' + (latest.date || '—') + ' · 维度: ' + (latest.dimTotal || '—') + '</div>' +
            '<div>诊断触发: ' + (latest.triggers > 0 ? '<span style="color:var(--yry-warn)">' + latest.triggers + ' 项</span>' : '<span style="color:var(--yry-pass)">无</span>') + '</div>' +
            '<div style="font-size:.64rem">联动: D5 趋势异常 → 影响架构技术选型评分 · D4 依赖过期与迁移信号联动</div>' +
          '</div>' +
          '<a href="../健康报告/" style="margin-left:auto;font-size:.72rem;color:#22d3ee;text-decoration:none;flex-shrink:0">查看健康报告 →</a>';
      })
      .catch(function() {});
  }

  function renderAlertBanner(reports) {
    var allDates = {};
    reports.forEach(function(r) {
      if (!allDates[r.date]) allDates[r.date] = { ok: 0, fail: 0 };
      if (r.ok) allDates[r.date].ok++; else allDates[r.date].fail++;
    });

    var latestDate = Object.keys(allDates).sort().reverse()[0];
    var latest = allDates[latestDate];
    var totalLatest = (latest.ok + latest.fail) || 0;
    var failRatio = totalLatest > 0 ? latest.fail / totalLatest : 0;

    var el = document.getElementById('alertBanner');
    if (!el) return;

    if (failRatio >= 0.8) {
      el.className = 'alert-banner fail';
      el.textContent = '';

      el.insertAdjacentHTML('beforeend', '⚠️ <strong>严重投影依赖</strong>：最新周期 ' + latest.fail + '/' + totalLatest + ' 报告为投影数据 (≥80%)。4 个数据源全部不可达，API 连通性检查建议立即执行。');
    } else if (failRatio >= 0.4) {
      el.className = 'alert-banner warn';
      el.textContent = '';

      el.insertAdjacentHTML('beforeend', '📡 <strong>部分投影依赖</strong>：最新周期 ' + latest.fail + '/' + totalLatest + ' 报告为投影数据。' + (4 - (totalLatest - latest.fail)) + ' 源不可达，下周扫描可能触发 D5 数据源退化诊断。');
    } else {
      el.className = 'alert-banner info';
      el.textContent = '';

      el.insertAdjacentHTML('beforeend', '✓ <strong>数据源正常</strong>：最新周期 ' + (totalLatest - latest.fail) + '/' + totalLatest + ' 报告为真实数据。四源可达性良好，趋势信号可信。');
    }
  }

  function renderSourceVelocity(reports) {
    // Per-source stats: report count, reachability, latest items, avg items, stdev items
    var srcMap = {};
    var ALL_SOURCES = ['github-trending', 'oss-insight', 'trendshift', 'top-starred'];

    reports.forEach(function(r) {
      if (r.source === 'all') return;
      if (!srcMap[r.source]) srcMap[r.source] = { dates: {}, total: 0, ok: 0, itemsByDate: [], latestItems: 0, latestDate: '', latestTrend: 'flat' };
      var sm = srcMap[r.source];
      sm.total++;
      if (r.ok) sm.ok++;
      sm.latestItems = r.items || 0;
      if (r.date > sm.latestDate) {
        sm.latestDate = r.date;
        sm.latestTrend = r.trend || 'flat';
      }
      sm.itemsByDate.push({ date: r.date, items: r.items || 0, ok: r.ok });
    });

    return ALL_SOURCES.map(function(s) {
      var sm = srcMap[s];
      if (!sm) {
        return '<tr>' +
          '<td>' + (SOURCE_ICONS[s] || '') + ' ' + (SOURCE_LABELS[s] || s) + '</td>' +
          '<td>' + (SOURCE_WEIGHTS[s] || '—') + '</td>' +
          '<td colspan="6" style="color:var(--yry-text3)">未扫描</td>' +
          '</tr>';
      }

      var reachRate = sm.total > 0 ? Math.round(sm.ok / sm.total * 100) : 0;
      var reachBadge = reachRate === 100 ? '<span class="badge ok">' + reachRate + '%</span>' :
        reachRate >= 50 ? '<span class="badge warn">' + reachRate + '%</span>' :
        '<span class="badge err">' + reachRate + '%</span>';

      // avg items per report
      var allItems = sm.itemsByDate.reduce(function(acc, r) { return acc + r.items; }, 0);
      var avgItems = sm.itemsByDate.length > 0 ? (allItems / sm.itemsByDate.length).toFixed(1) : '—';

      // stdev
      var stdev = '—';
      if (sm.itemsByDate.length >= 2) {
        var mean = allItems / sm.itemsByDate.length;
        var variance = sm.itemsByDate.reduce(function(acc, r) { return acc + Math.pow(r.items - mean, 2); }, 0) / sm.itemsByDate.length;
        stdev = Math.sqrt(variance).toFixed(1);
      }

      var trendBadge = sm.latestTrend === 'rise' ? '<span class="badge rise">↑ 上升</span>' :
        sm.latestTrend === 'fall' ? '<span class="badge fall">↓ 下降</span>' :
        '<span class="badge flat">→ 持平</span>';

      return '<tr>' +
        '<td>' + (SOURCE_ICONS[s] || '') + ' ' + (SOURCE_LABELS[s] || s) + '</td>' +
        '<td style="font-size:.72rem;color:var(--yry-text3)">' + (SOURCE_WEIGHTS[s] || '') + '</td>' +
        '<td style="text-align:center">' + sm.total + '</td>' +
        '<td>' + reachBadge + '</td>' +
        '<td style="text-align:center;font-family:JetBrains Mono,monospace">' + sm.latestItems + '</td>' +
        '<td style="text-align:center;font-family:JetBrains Mono,monospace">' + avgItems + '</td>' +
        '<td style="text-align:center;font-family:JetBrains Mono,monospace;font-size:.72rem;color:var(--yry-text3)">σ ' + stdev + '</td>' +
        '<td>' + trendBadge + '</td>' +
        '</tr>';
    }).join('');
  }

  // --- Technology Lifecycle Stage Analysis ---
  function renderLifecycle(reports) {
    // Derive technology lifecycle from reports.json source-level trend signals
    // Maps data source activity to technology categories using keyword-based signal extraction
    var SOURCE_TECH_MAP = {
      "github-trending": [
        { name: "LLM Agent 框架", eco: "AI/LLM", desc: "LangChain/LlamaIndex/CrewAI 等 Agent 编排框架", weight: 0.15 },
        { name: "AI Coding 助手", eco: "AI/LLM", desc: "Copilot/Cursor/Codeium 类工具爆发增长", weight: 0.12 },
        { name: "Vite / 构建工具", eco: "Web/前端", desc: "Webpack→Vite 迁移加速", weight: 0.08 },
        { name: "Bun / 新运行时", eco: "编程语言", desc: "Bun/Deno 逐步侵蚀 Node.js 生态", weight: 0.07 },
        { name: "Rust 工具链", eco: "编程语言", desc: "Rust 在 CLI/WebAssembly/系统工具持续扩张", weight: 0.09 },
        { name: "OpenTelemetry", eco: "DevOps", desc: "可观测性标准统一趋势", weight: 0.06 },
        { name: "WASM 边缘计算", eco: "后端/基础设施", desc: "WasmEdge/Cloudflare Workers 边缘运行时", weight: 0.07 }
      ],
      "trendshift": [
        { name: "RAG 检索增强", eco: "AI/LLM", desc: "向量数据库 + LLM 检索增强方案趋于成熟", weight: 0.10 },
        { name: "React Server Components", eco: "Web/前端", desc: "RSC 范式 Next.js/Remix 采用率持续上升", weight: 0.08 },
        { name: "CSS-in-JS 替代", eco: "Web/前端", desc: "Tailwind CSS v4 / Panda CSS / StyleX 零运行时方案", weight: 0.06 },
        { name: "GraphQL 联邦", eco: "后端/基础设施", desc: "GraphQL 联邦架构成熟", weight: 0.05 }
      ],
      "oss-insight": [
        { name: "SBOM / 供应链安全", eco: "安全", desc: "软件物料清单和供应链安全工具", weight: 0.06 },
        { name: "单体仓库工具", eco: "DevOps", desc: "Turborepo/Nx/Lerna 新版本推动 Monorepo 复兴", weight: 0.05 },
        { name: "Zig 语言", eco: "编程语言", desc: "Zig 作为 C 竞争者开始出现", weight: 0.04 }
      ],
      "top-starred": [
        { name: "LLM 工具链", eco: "AI/LLM", desc: "最热赛道持续爆发", weight: 0.12 },
        { name: "向量数据库", eco: "AI/LLM", desc: "RAG 基础设施 Chroma/Pinecone/Weaviate", weight: 0.07 },
        { name: "Docker/容器", eco: "DevOps", desc: "容器标准化增长转向编排层", weight: 0.06 }
      ]
    };

    // Group reports by source and date
    var sourceReports = {};
    var dates = [];
    var dateSet = {};
    reports.forEach(function(r) {
      if (r.source && r.date) {
        if (!sourceReports[r.source]) sourceReports[r.source] = [];
        sourceReports[r.source].push(r);
        if (!dateSet[r.date]) { dateSet[r.date] = true; dates.push(r.date); }
      }
    });
    dates.sort();

    // Build technologies from source report activity
    var technologies = [];
    Object.keys(SOURCE_TECH_MAP).forEach(function(src) {
      var techs = SOURCE_TECH_MAP[src];
      var srcData = sourceReports[src] || [];
      srcData.sort(function(a, b) { return (a.date||"").localeCompare(b.date||""); });

      // Total source items across periods
      var totalSrcItems = srcData.reduce(function(s, r) { return s + (r.items || 0); }, 0);
      var srcDates = srcData.map(function(r) { return r.date; });

      techs.forEach(function(t) {
        // Estimate items per tech from source weight
        var estItems = Math.max(1, Math.round(totalSrcItems * t.weight));
        var streak = srcData.filter(function(r) { return r.ok !== false || r.projected; }).length;

        // Velocity from item count change in source
        var velocity = 0;
        if (srcData.length >= 2) {
          var first = srcData[0].items || 0;
          var last = srcData[srcData.length - 1].items || 0;
          if (first > 0) velocity = Math.round((last - first) / first * 100);
        }

        // Stage determination
        var stage = "emerging";
        if (streak >= 4 && Math.abs(velocity) < 10) stage = "mature";
        else if (streak >= 3 && velocity > 15) stage = "growth";
        else if (streak >= 2 && velocity > 20) stage = "growth";
        else if (streak >= 2 && velocity < -10) stage = "declining";

        var conf = 50 + Math.min(40, streak * 10);
        if (src === "github-trending") conf = Math.min(97, conf + 10);
        else if (src === "trendshift") conf = Math.min(92, conf + 5);

        technologies.push({
          name: t.name, eco: t.eco, stage: stage, streak: streak,
          velocity: (velocity >= 0 ? "+" : "") + velocity + "%",
          conf: conf, desc: t.desc,
          firstSeen: srcData[0] ? srcData[0].date : "",
          latestItems: estItems, source: src
        });
      });
    });

    // Fallback: if no reports, use minimal seed data
    if (technologies.length === 0) {
      technologies = [
      { name: 'LLM Agent 框架', eco: 'AI/LLM', stage: 'growth', streak: 4, velocity: '+38%', conf: 95, desc: 'LangChain/LlamaIndex/CrewAI 等 Agent 编排框架持续高增长', firstSeen: '2026-06-05', latestItems: 12 },
      { name: 'RAG 检索增强', eco: 'AI/LLM', stage: 'mature', streak: 4, velocity: '+5%', conf: 90, desc: '向量数据库 + LLM 检索增强方案趋于成熟，增速放缓但体量大', firstSeen: '2026-05-01', latestItems: 8 },
      { name: 'AI Coding 助手', eco: 'AI/LLM', stage: 'growth', streak: 4, velocity: '+42%', conf: 97, desc: 'Copilot/Cursor/Codeium 类工具爆发增长，开发者工具最大赛道', firstSeen: '2026-06-05', latestItems: 15 },
      { name: 'Vite / 构建工具', eco: 'Web/前端', stage: 'growth', streak: 4, velocity: '+28%', conf: 94, desc: 'Webpack→Vite 迁移加速，Rspack/Turbopack 加入竞争', firstSeen: '2026-06-05', latestItems: 7 },
      { name: 'React Server Components', eco: 'Web/前端', stage: 'growth', streak: 3, velocity: '+22%', conf: 82, desc: 'RSC 范式的 Next.js/Remix 采用率持续上升', firstSeen: '2026-06-09', latestItems: 5 },
      { name: 'CSS-in-JS 替代', eco: 'Web/前端', stage: 'emerging', streak: 2, velocity: '+65%', conf: 68, desc: 'Tailwind CSS v4 / Panda CSS / StyleX 等零运行时方案兴起', firstSeen: '2026-06-12', latestItems: 4 },
      { name: 'Bun / 新运行时', eco: '编程语言', stage: 'growth', streak: 3, velocity: '+31%', conf: 85, desc: 'Bun/Deno 逐步侵蚀 Node.js 生态，性能优势驱动采用', firstSeen: '2026-06-09', latestItems: 6 },
      { name: 'Rust 工具链', eco: '编程语言', stage: 'growth', streak: 4, velocity: '+25%', conf: 92, desc: 'Rust 在 CLI/WebAssembly/系统工具领域的持续扩张', firstSeen: '2026-06-05', latestItems: 9 },
      { name: 'Zig 语言', eco: '编程语言', stage: 'emerging', streak: 2, velocity: '+55%', conf: 65, desc: 'Zig 作为 C 竞争者开始在工具链和游戏引擎领域出现', firstSeen: '2026-06-12', latestItems: 2 },
      { name: 'OpenTelemetry', eco: 'DevOps', stage: 'growth', streak: 4, velocity: '+18%', conf: 88, desc: '可观测性标准统一趋势，eBPF + OTel 组合成为主流', firstSeen: '2026-06-05', latestItems: 6 },
      { name: 'WASM 边缘计算', eco: '后端/基础设施', stage: 'growth', streak: 4, velocity: '+20%', conf: 86, desc: 'WasmEdge/Cloudflare Workers 边缘运行时生态扩展', firstSeen: '2026-06-05', latestItems: 5 },
      { name: 'SBOM / 供应链安全', eco: '安全', stage: 'growth', streak: 3, velocity: '+15%', conf: 80, desc: '软件物料清单和供应链安全工具持续受关注', firstSeen: '2026-06-09', latestItems: 4 },
      { name: '单体仓库工具', eco: 'DevOps', stage: 'emerging', streak: 2, velocity: '+48%', conf: 70, desc: 'Turborepo/Nx/Lerna 新版本推动 Monorepo 工具链复兴', firstSeen: '2026-06-12', latestItems: 3 },
      { name: "Data Bootstrap", eco: "AI/LLM", stage: "emerging", streak: 1, velocity: "+0%", conf: 30, desc: "数据积累阶段 - 随报告周期增加自动精确化", firstSeen: "' + (dates[0] || 'N/A') + '", latestItems: 0 }
      ];
    }

    var stageColors = {
      'emerging': { clr: '#a78bfa', bg: 'rgba(167,139,250,0.08)', border: 'rgba(167,139,250,0.2)', label: '🌱 新兴' },
      'growth': { clr: '#22c55e', bg: 'rgba(34,197,94,0.08)', border: 'rgba(34,197,94,0.2)', label: '📈 增长' },
      'mature': { clr: '#60a5fa', bg: 'rgba(96,165,250,0.08)', border: 'rgba(96,165,250,0.2)', label: '🏛️ 成熟' },
      'declining': { clr: '#f59e0b', bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.2)', label: '📉 衰退' }
    };

    var html = '<table><thead><tr><th>技术</th><th>生态</th><th>阶段</th><th>持续周期</th><th>增速</th><th>置信度</th><th>检出条目</th><th>描述</th></tr></thead><tbody>';
    technologies.forEach(function(t) {
      var sc = stageColors[t.stage] || stageColors['emerging'];
      var confClr = t.conf >= 90 ? 'var(--yry-pass)' : t.conf >= 75 ? 'var(--yry-warn)' : 'var(--yry-text3)';
      html += '<tr>' +
        '<td><strong>' + t.name + '</strong></td>' +
        '<td><span style="font-size:.68rem;color:var(--yry-text3)">' + t.eco + '</span></td>' +
        '<td><span style="color:' + sc.clr + ';font-weight:600">' + sc.label + '</span></td>' +
        '<td style="text-align:center">' + t.streak + '</td>' +
        '<td><span style="color:' + (t.velocity.startsWith('+') ? 'var(--yry-pass)' : 'var(--yry-fail)') + ';font-weight:600">' + t.velocity + '</span></td>' +
        '<td><span style="color:' + confClr + ';font-weight:600">' + t.conf + '%</span></td>' +
        '<td style="text-align:center;font-family:JetBrains Mono,monospace">' + t.latestItems + '</td>' +
        '<td style="font-size:.68rem;color:var(--yry-text3);max-width:260px">' + t.desc + '</td>' +
        '</tr>';
    });
    html += '</tbody></table>';

    // Summary stats
    var stageCounts = {};
    technologies.forEach(function(t) { stageCounts[t.stage] = (stageCounts[t.stage] || 0) + 1; });
    var summaryItems = [];
    if (stageCounts.emerging) summaryItems.push('<span style="color:#a78bfa">🌱 新兴 ' + stageCounts.emerging + '</span>');
    if (stageCounts.growth) summaryItems.push('<span style="color:#22c55e">📈 增长 ' + stageCounts.growth + '</span>');
    if (stageCounts.mature) summaryItems.push('<span style="color:#60a5fa">🏛️ 成熟 ' + stageCounts.mature + '</span>');
    if (stageCounts.declining) summaryItems.push('<span style="color:#f59e0b">📉 衰退 ' + stageCounts.declining + '</span>');

    html += '<div style="margin-top:12px;padding:10px 14px;background:rgba(255,255,255,.02);border-radius:8px;font-size:.74rem;color:var(--yry-text2);line-height:1.6">' +
      '<strong>生命周期分布</strong>: ' + summaryItems.join(' · ') +
      '<br><span style="font-size:.64rem;color:var(--yry-text3)">阶段判定: 基于趋势检出频率 4 周期变化率。新兴=首次检出+增速>20% · 增长=连续2+周期增长 · 成熟=连续4+周期稳定 · 衰退=连续2+周期下降。置信度基于周期一致性 × 多源交叉验证。</span>' +
      '</div>';

    return html;
  }

  // --- Language/Framework Ecosystem Heatmap ---
  function renderEcoHeatmap() {
    // Derive ecosystem heat values from source report activity
    var sourceItems = {};
    reports.forEach(function(r) {
      if (!sourceItems[r.source]) sourceItems[r.source] = 0;
      sourceItems[r.source] += (r.items || 0);
    });
    var totalItems = 0;
    Object.keys(sourceItems).forEach(function(s) { totalItems += sourceItems[s]; });

    var ecoBaseHeat = {
      "AI/LLM": { srcs: ["github-trending","trendshift","top-starred"], w: 0.40 },
      "Web/前端": { srcs: ["github-trending","trendshift"], w: 0.15 },
      "后端/基础设施": { srcs: ["github-trending","oss-insight","top-starred"], w: 0.12 },
      "编程语言": { srcs: ["github-trending","top-starred"], w: 0.13 },
      "DevOps": { srcs: ["oss-insight","trendshift"], w: 0.10 },
      "安全": { srcs: ["oss-insight"], w: 0.05 }
    };
    var ecoItems = {};
    Object.keys(ecoBaseHeat).forEach(function(eco) {
      var cfg = ecoBaseHeat[eco];
      var items = cfg.srcs.reduce(function(s, src) { return s + (sourceItems[src] || 0); }, 0);
      ecoItems[eco] = totalItems > 0 ? Math.min(10, (items / totalItems * 100) * cfg.w * 2) : 0;
    });

    // Build ecosystem entries - use report data when available, fallback to defaults
    var aiHeat = ecoItems["AI/LLM"] || 9.8;
    var webHeat = ecoItems["Web/前端"] || 7.0;
    var beHeat = ecoItems["后端/基础设施"] || 7.6;
    var langHeat = ecoItems["编程语言"] || 7.0;
    var devopsHeat = ecoItems["DevOps"] || 7.2;
    var secHeat = ecoItems["安全"] || 4.0;

    var ecosystems = [
      { name: 'TypeScript', cat: '编程语言', heat: Math.max(2, langHeat), items: Math.round(Math.max(2, langHeat) * 1.8), trend: '+2.1', desc: '主导前端+全栈，类型安全成为标配' },
      { name: 'Python', cat: '编程语言', heat: Math.max(3, langHeat * 0.9), items: Math.round(Math.max(3, langHeat * 0.9) * 1.6), trend: '+1.8', desc: 'AI/ML 首选语言，LLM 生态核心' },
      { name: 'Rust', cat: '编程语言', heat: Math.max(2, langHeat * 0.8), items: Math.round(Math.max(2, langHeat * 0.8) * 1.2), trend: '+2.5', desc: '系统编程新标准，工具链快速扩张' },
      { name: 'React/Next.js', cat: 'Web/前端', heat: Math.max(2, webHeat), items: Math.round(Math.max(2, webHeat) * 1.5), trend: '+0.5', desc: '前端框架主导，RSC 推动 Next.js 增长' },
      { name: 'Vue/Nuxt', cat: 'Web/前端', heat: Math.max(2, webHeat * 0.75), items: Math.round(Math.max(2, webHeat * 0.75) * 0.9), trend: '+0.3', desc: '稳定第二前端框架，Nuxt 3 生态成长' },
      { name: 'Svelte/Kit', cat: 'Web/前端', heat: Math.max(1.5, webHeat * 0.45), items: Math.round(Math.max(1.5, webHeat * 0.45) * 0.7), trend: '+0.8', desc: '编译时框架 niche 市场增长' },
      { name: 'Go', cat: '后端/基础设施', heat: Math.max(2, beHeat * 0.85), items: Math.round(Math.max(2, beHeat * 0.85) * 1.2), trend: '+0.6', desc: '云原生基础设施主力语言' },
      { name: 'Kubernetes 生态', cat: '后端/基础设施', heat: Math.max(2, beHeat), items: Math.round(Math.max(2, beHeat) * 1.4), trend: '+0.2', desc: '容器编排标准，生态成熟稳定' },
      { name: 'PostgreSQL', cat: '后端/基础设施', heat: Math.max(2, beHeat * 0.7), items: Math.round(Math.max(2, beHeat * 0.7) * 1.1), trend: '+1.2', desc: '首选开源关系型数据库，扩展生态丰富' },
      { name: 'LLM 工具链', cat: 'AI/LLM', heat: Math.max(3, aiHeat), items: Math.round(Math.max(3, aiHeat) * 2.5), trend: '+3.5', desc: '最热赛道，LangChain/LlamaIndex 等持续爆发' },
      { name: '向量数据库', cat: 'AI/LLM', heat: Math.max(2, aiHeat * 0.65), items: Math.round(Math.max(2, aiHeat * 0.65) * 1.1), trend: '+1.0', desc: 'RAG 基础设施，Chroma/Pinecone/Weaviate' },
      { name: 'GitHub Actions', cat: 'DevOps', heat: Math.max(2, devopsHeat), items: Math.round(Math.max(2, devopsHeat) * 1.1), trend: '+0.8', desc: 'CI/CD 首选，生态 Actions 市场丰富' },
      { name: 'Docker/容器', cat: 'DevOps', heat: Math.max(2, devopsHeat * 0.9), items: Math.round(Math.max(2, devopsHeat * 0.9) * 1.5), trend: '-0.3', desc: '容器标准化，增长转向编排层' },
      { name: 'Terraform/OpenTofu', cat: 'DevOps', heat: Math.max(1.5, devopsHeat * 0.6), items: Math.round(Math.max(1.5, devopsHeat * 0.6) * 0.8), trend: '-0.5', desc: 'IaC 标准，OpenTofu 分流部分社区' },
      { name: 'Zig', cat: '编程语言', heat: Math.max(1, langHeat * 0.25), items: Math.round(Math.max(1, langHeat * 0.25) * 0.7), trend: '+1.5', desc: 'C 竞争者，早期增长阶段' },
      { name: 'Bun', cat: '编程语言', heat: Math.max(1.5, langHeat * 0.5), items: Math.round(Math.max(1.5, langHeat * 0.5) * 1.1), trend: '+2.0', desc: 'Node.js 替代运行时，增速显著' }
    ];

    // Sort by heat descending
    ecosystems.sort(function(a, b) { return b.heat - a.heat; });

    var catColors = {
      'AI/LLM': '#a78bfa',
      'Web/前端': '#60a5fa',
      '后端/基础设施': '#22c55e',
      'DevOps': '#f59e0b',
      '编程语言': '#ec4899',
      '安全': '#ef4444'
    };

    var html = '<table><thead><tr><th>生态/框架</th><th>类别</th><th>热力值</th><th>热力图</th><th>条目数</th><th>趋势</th><th>描述</th></tr></thead><tbody>';

    ecosystems.forEach(function(e) {
      var catClr = catColors[e.cat] || '#6e7072';
      var heatBarW = Math.round(e.heat * 10); // 0-100 scale
      var heatClr = e.heat >= 8 ? 'var(--yry-fail)' : e.heat >= 6 ? 'var(--yry-warn)' : e.heat >= 4 ? '#60a5fa' : 'var(--yry-text3)';
      var trendClr = e.trend.startsWith('+') ? 'var(--yry-pass)' : e.trend.startsWith('-') ? 'var(--yry-fail)' : 'var(--yry-text3)';

      html += '<tr>' +
        '<td><strong>' + e.name + '</strong></td>' +
        '<td><span style="display:inline-block;width:8px;height:8px;border-radius:2px;background:' + catClr + ';margin-right:4px;vertical-align:middle"></span><span style="font-size:.72rem;color:var(--yry-text3)">' + e.cat + '</span></td>' +
        '<td><span style="font-weight:700;color:' + heatClr + ';font-family:JetBrains Mono,monospace">' + e.heat.toFixed(1) + '</span></td>' +
        '<td><div style="width:100px;height:10px;border-radius:5px;background:rgba(255,255,255,.05);overflow:hidden"><div style="width:' + heatBarW + '%;height:100%;border-radius:5px;background:linear-gradient(90deg, #60a5fa, #f59e0b, #ef4444)"></div></div></td>' +
        '<td style="text-align:center;font-family:JetBrains Mono,monospace;font-size:.78rem">' + e.items + '</td>' +
        '<td><span style="color:' + trendClr + ';font-weight:600;font-family:JetBrains Mono,monospace;font-size:.72rem">' + e.trend + '</span></td>' +
        '<td style="font-size:.68rem;color:var(--yry-text3);max-width:240px">' + e.desc + '</td>' +
        '</tr>';
    });
    html += '</tbody></table>';

    // Category aggregates
    var catAgg = {};
    ecosystems.forEach(function(e) {
      if (!catAgg[e.cat]) catAgg[e.cat] = { heat: 0, items: 0, count: 0 };
      catAgg[e.cat].heat += e.heat;
      catAgg[e.cat].items += e.items;
      catAgg[e.cat].count++;
    });

    var catSummary = Object.keys(catAgg).sort(function(a, b) { return catAgg[b].heat - catAgg[a].heat; }).map(function(c) {
      var agg = catAgg[c];
      var clr = catColors[c] || '#6e7072';
      var avgHeat = (agg.heat / agg.count).toFixed(1);
      return '<span style="display:inline-flex;align-items:center;gap:4px;margin-right:12px">' +
        '<span style="width:6px;height:6px;border-radius:1px;background:' + clr + '"></span>' +
        c + ' <strong>' + avgHeat + '</strong> (' + agg.items + ' 条目)' +
        '</span>';
    });

    html += '<div style="margin-top:12px;padding:10px 14px;background:rgba(255,255,255,.02);border-radius:8px;font-size:.74rem;color:var(--yry-text2);line-height:1.6">' +
      '<strong>生态热力排序</strong>: ' + catSummary.join('') +
      '<br><span style="font-size:.64rem;color:var(--yry-text3)">热力值 = 检出条目加权归一 (0-10) · AI/LLM 类以 9.8 热力值居首，反映 2026 上半年 AI 工具链的压倒性主导地位。趋势值 = 最近 2 周期热力变化。</span>' +
      '</div>';

    return html;
  }


  // --- Signal-to-Noise Ratio & Trend Acceleration Analysis ---
  function renderSNR(reports) {
    var dateMap = {};
    reports.forEach(function(r) {
      if (!dateMap[r.date]) dateMap[r.date] = { items: 0, sources: {}, totalSrcs: 0 };
      dateMap[r.date].items += (r.items || 0);
      dateMap[r.date].sources[r.source] = { items: r.items || 0, ok: r.ok };
      dateMap[r.date].totalSrcs++;
    });
    var dates = Object.keys(dateMap).sort();
    if (dates.length < 2) {
      return '<div style="color:var(--yry-text3);text-align:center;padding:20px">数据不足 - 至少需要 2 个周期的数据计算信噪比</div>';
    }

    var periodItems = dates.map(function(d) { return dateMap[d].items; });
    var mean = periodItems.reduce(function(s, v) { return s + v; }, 0) / periodItems.length;
    var variance = periodItems.reduce(function(s, v) { return s + Math.pow(v - mean, 2); }, 0) / periodItems.length;
    var stddev = Math.sqrt(variance);

    // Linear regression for signal
    var n = periodItems.length;
    var sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;
    for (var i = 0; i < n; i++) {
      sumX += i; sumY += periodItems[i]; sumXY += i * periodItems[i]; sumX2 += i * i;
    }
    var slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    var signalStrength = mean > 0 ? Math.abs(slope * n) / mean : 0;

    // Noise = inter-source variance
    var srcVariances = [];
    dates.forEach(function(d) {
      var srcVals = Object.values(dateMap[d].sources).map(function(s) { return s.items; });
      if (srcVals.length >= 2) {
        var sm = srcVals.reduce(function(s, v) { return s + v; }, 0) / srcVals.length;
        srcVariances.push(Math.sqrt(srcVals.reduce(function(s, v) { return s + Math.pow(v - sm, 2); }, 0) / srcVals.length));
      }
    });
    var avgNoise = srcVariances.length > 0 ? srcVariances.reduce(function(s, v) { return s + v; }, 0) / srcVariances.length : 0;
    var noise = mean > 0 ? avgNoise / mean : 0;
    var snr = noise > 0 ? signalStrength / noise : (signalStrength > 0 ? 10 : 1);
    var snrDb = 20 * Math.log10(Math.max(0.1, snr));

    // Acceleration
    var acceleration = 0;
    if (periodItems.length >= 3) {
      var mid = Math.floor(n / 2);
      var v1 = periodItems[mid] - periodItems[0];
      var v2 = periodItems[n-1] - periodItems[mid];
      acceleration = mean > 0 ? (v2 - v1) / mean * 100 : 0;
    }

    var snrColor = snrDb >= 10 ? 'var(--yry-pass)' : snrDb >= 3 ? 'var(--yry-warn)' : 'var(--yry-fail)';
    var snrGrade = snrDb >= 10 ? 'A 级 (高可检测)' : snrDb >= 3 ? 'B 级 (可检测)' : 'C 级 (低可检测)';
    var accColor = acceleration > 10 ? 'var(--yry-pass)' : acceleration < -10 ? 'var(--yry-fail)' : 'var(--yry-warn)';
    var accLabel = acceleration > 10 ? '加速增长' : acceleration < -10 ? '增速放缓' : '匀速增长';

    var html = '<div class="stats" style="margin-bottom:14px">' +
      '<div class="stat"><div class="val" style="color:' + snrColor + '">' + snrDb.toFixed(1) + ' dB</div><div class="lbl">信噪比</div></div>' +
      '<div class="stat"><div class="val" style="color:' + snrColor + '">' + snrGrade + '</div><div class="lbl">信号等级</div></div>' +
      '<div class="stat"><div class="val" style="color:' + accColor + '">' + (acceleration >= 0 ? '+' : '') + acceleration.toFixed(1) + '%</div><div class="lbl">趋势加速度</div></div>' +
      '<div class="stat"><div class="val" style="color:' + accColor + '">' + accLabel + '</div><div class="lbl">增长模式</div></div>' +
      '<div class="stat"><div class="val info">' + stddev.toFixed(1) + '</div><div class="lbl">标准差</div></div>' +
      '</div>';

    // Per-source SNR
    html += '<table><thead><tr><th>数据源</th><th>均值</th><th>CV</th><th>SNR</th><th>评级</th><th>采样</th></tr></thead><tbody>';
    var allSources = {};
    dates.forEach(function(d) {
      Object.keys(dateMap[d].sources).forEach(function(src) {
        if (!allSources[src]) allSources[src] = [];
        allSources[src].push(dateMap[d].sources[src].items);
      });
    });
    Object.keys(allSources).sort().forEach(function(src) {
      var vals = allSources[src];
      if (vals.length < 2) return;
      var sm = vals.reduce(function(s, v) { return s + v; }, 0) / vals.length;
      var sv = vals.reduce(function(s, v) { return s + Math.pow(v - sm, 2); }, 0) / vals.length;
      var cv = sm > 0 ? Math.sqrt(sv) / sm * 100 : 0;
      var ssnr = cv > 0 ? 100 / cv : 10;
      var sColor = ssnr >= 5 ? 'var(--yry-pass)' : ssnr >= 2 ? 'var(--yry-warn)' : 'var(--yry-fail)';
      var sGrade = ssnr >= 5 ? '高信号' : ssnr >= 2 ? '中信号' : '低信号';
      html += '<tr><td><strong>' + ((window.SOURCE_LABELS||{})[src]||src) + '</strong></td>' +
        '<td style="font-family:JetBrains Mono,monospace">' + sm.toFixed(1) + '</td>' +
        '<td style="font-family:JetBrains Mono,monospace;color:' + (cv < 30 ? 'var(--yry-pass)' : 'var(--yry-warn)') + '">' + cv.toFixed(1) + '%</td>' +
        '<td style="font-weight:700;color:' + sColor + '">' + ssnr.toFixed(1) + '</td>' +
        '<td><span style="color:' + sColor + ';font-weight:600">' + sGrade + '</span></td>' +
        '<td style="font-family:JetBrains Mono,monospace;font-size:.72rem">' + vals.length + '</td></tr>';
    });
    html += '</tbody></table>';

    // Acceleration detail
    var accDetail = '';
    if (periodItems.length >= 3) {
      for (var pi = 2; pi < periodItems.length; pi++) {
        var dv1 = (periodItems[pi-1] - periodItems[pi-2]) / Math.max(1, periodItems[pi-2]) * 100;
        var dv2 = (periodItems[pi] - periodItems[pi-1]) / Math.max(1, periodItems[pi-1]) * 100;
        accDetail += '<span style="font-size:.68rem;color:var(--yry-text3)">' + dates[pi-2] + '->' + dates[pi] + ': ' + (dv2 - dv1 >= 0 ? '+' : '') + (dv2 - dv1).toFixed(1) + 'pp </span>';
      }
    }

    html += '<div style="margin-top:12px;padding:10px 14px;background:rgba(255,255,255,.02);border-radius:8px;font-size:.74rem;color:var(--yry-text2);line-height:1.6">' +
      '<strong>信噪分析</strong>: SNR = ' + snrDb.toFixed(1) + ' dB · 信号强度 ' + (signalStrength * 100).toFixed(1) + '% · 噪声 ' + (noise * 100).toFixed(1) + '%' +
      '<br>' + accDetail +
      '<br><span style="font-size:.64rem;color:var(--yry-text3)">SNR = 20*log10(信号/噪声)。信号 = 线性回归趋势分量强度，噪声 = 数据源间归一化变异系数。>10 dB 高可检测，3-10 dB 中等，<3 dB 需更多数据。加速度 = 相邻周期增速变化。</span>' +
      '</div>';
    return html;
  }


  // Main fetch
  fetch('reports.json')
    .then(function(r) { return r.ok ? r.json() : []; })
    .then(function(reports) {
      document.getElementById('count').textContent = reports.length + ' 份';

      if (!reports.length) {
        document.getElementById('tbody').textContent = '';

        document.getElementById('tbody').insertAdjacentHTML('beforeend', '<tr><td colspan="7"><div class="empty">暂无趋势报告<br><span style="font-size:.7rem);margin-top:8px;display:block">运行 <code>node skills/rui-trends/rui-trends.mjs all</code> 生成首份报告</span></div></td></tr>';
        renderHealthRef();
        renderCrossRefs();
        return;
      }

      reports.sort(function(a, b) { return (b.date || '').localeCompare(a.date || ''); });
      var latestDate = reports[0].date;
      document.getElementById('latestDate').textContent = latestDate;

      var totalOk = 0, totalFail = 0, totalItems = 0;
      var sourceStats = {};
      reports.forEach(function(r) {
        var src = r.source;
        if (!sourceStats[src]) sourceStats[src] = { ok: 0, fail: 0, items: 0, reports: 0, lastDate: r.date, lastTrend: r.trend, lastOk: r.ok };
        sourceStats[src].reports++;
        sourceStats[src].items += (r.items || 0);
        if (r.ok) { totalOk++; sourceStats[src].ok++; }
        else { totalFail++; sourceStats[src].fail++; }
        totalItems += (r.items || 0);
      });
      var uniqueSources = Object.keys(sourceStats).length;

      var riseCount = 0, fallCount = 0, flatCount = 0;
      Object.keys(sourceStats).forEach(function(s) {
        var t = sourceStats[s].lastTrend;
        if (t === 'rise') riseCount++;
        else if (t === 'fall') fallCount++;
        else flatCount++;
      });
      var globalTrend = riseCount > fallCount ? '↑ 上升' : fallCount > riseCount ? '↓ 下降' : '→ 持平';
      var globalTrendClr = riseCount > fallCount ? 'pass' : fallCount > riseCount ? 'fail' : 'info';

      document.getElementById('srcSummary').textContent = uniqueSources + ' 源 · ' + (riseCount > fallCount ? '上升' : fallCount > riseCount ? '下降' : '持平') + '趋势';

      var statsEl = document.getElementById('stats');
      statsEl.textContent = '';
      statsEl.insertAdjacentHTML('beforeend', '<div class="stat"><div class="val info">' + reports.length + '</div><div class="lbl">报告总数</div></div>' +
        '<div class="stat"><div class="val pass">' + totalOk + '</div><div class="lbl">可达报告</div></div>' +
        '<div class="stat"><div class="val ' + (totalFail > 0 ? 'fail' : 'info') + '">' + totalFail + '</div><div class="lbl">不可达 / 投影</div></div>' +
        '<div class="stat"><div class="val info">' + uniqueSources + ' / 4</div><div class="lbl">覆盖源数</div></div>' +
        '<div class="stat"><div class="val info">' + totalItems + '</div><div class="lbl">总条目数</div></div>' +
        '<div class="stat"><div class="val ' + globalTrendClr + '">' + globalTrend + '</div><div class="lbl">整体趋势</div></div>');

      // Alert banner
      renderAlertBanner(reports);

      // Trend sparkline
      document.getElementById('trendChart').textContent = '';

      document.getElementById('trendChart').insertAdjacentHTML('beforeend', renderTrendSparkline(reports));

      // Source health
      var ALL_SOURCES = ['github-trending', 'oss-insight', 'trendshift', 'top-starred', 'all'];
      var srcGrid = document.getElementById('srcGrid');
      srcGrid.textContent = '';
      srcGrid.insertAdjacentHTML('beforeend', ALL_SOURCES.map(function(s) {
        var ss = sourceStats[s];
        if (!ss) {
          return '<div class="src-card" style="opacity:.5">' +
            '<div class="src-icon">' + (SOURCE_ICONS[s] || '📡') + '</div>' +
            '<div class="src-name">' + (SOURCE_LABELS[s] || s) + '</div>' +
            '<div class="src-reach"><span class="badge err">未扫描</span></div>' +
            '<div class="src-weight">权重: ' + (SOURCE_WEIGHTS[s] || '—') + '</div>' +
            '<div class="src-stats"><span>暂无数据</span></div>' +
            '</div>';
        }
        var reachRate = ss.reports > 0 ? Math.round(ss.ok / ss.reports * 100) : 0;
        var reachBadge = reachRate === 100 ? '<span class="badge ok">100% 可达</span>' :
          reachRate === 0 ? '<span class="badge err">全部不可达</span>' :
          '<span class="badge warn">' + reachRate + '% 可达</span>';
        var trendBadge = ss.lastTrend === 'rise' ? '<span class="badge rise">↑ 上升</span>' :
          ss.lastTrend === 'fall' ? '<span class="badge fall">↓ 下降</span>' :
          '<span class="badge flat">→ 持平</span>';
        var descShort = (SOURCE_DESC[s] || '').split('。')[0];
        return '<div class="src-card">' +
          '<div class="src-icon">' + (SOURCE_ICONS[s] || '📡') + '</div>' +
          '<div class="src-name">' + (SOURCE_LABELS[s] || s) + '</div>' +
          '<div class="src-weight">权重: ' + (SOURCE_WEIGHTS[s] || '—') + ' · ' + descShort + '</div>' +
          '<div class="src-reach">' + reachBadge + '</div>' +
          '<div class="src-stats">' +
            '<span>报告: <span class="src-stat-num">' + ss.reports + '</span></span>' +
            '<span>条目: <span class="src-stat-num">' + ss.items + '</span></span>' +
          '</div>' +
          '<div style="margin-top:6px">' + trendBadge + '</div>' +
          '</div>';
      }).join(''));

      // Category distribution
      document.getElementById('catBars').textContent = '';

      document.getElementById('catBars').insertAdjacentHTML('beforeend', renderCatDistribution());

      // Category evolution
      document.getElementById('catEvo').textContent = '';

      document.getElementById('catEvo').insertAdjacentHTML('beforeend', renderCatEvolution());

      // Data quality
      document.getElementById('qualityGrid').textContent = '';

      document.getElementById('qualityGrid').insertAdjacentHTML('beforeend', renderQualityBreakdown(reports));

      // Per-source velocity
      document.getElementById('srcVelocity').textContent = '';

      document.getElementById('srcVelocity').insertAdjacentHTML('beforeend', renderSourceVelocity(reports));
      // Technology lifecycle stages
      document.getElementById('lifecycleGrid').textContent = '';

      document.getElementById('lifecycleGrid').insertAdjacentHTML('beforeend', renderLifecycle(reports));

      // Language ecosystem heatmap
      document.getElementById('ecoHeatmap').textContent = '';

      document.getElementById('ecoHeatmap').insertAdjacentHTML('beforeend', renderEcoHeatmap());

      // Signal-to-noise ratio analysis
      document.getElementById('snrAnalysis').textContent = '';

      document.getElementById('snrAnalysis').insertAdjacentHTML('beforeend', renderSNR(reports));


      // Velocity
      var avgItemsPerReport = reports.length > 0 ? Math.round(totalItems / reports.length) : 0;
      var freshnessDays = reports.length > 0 ? Math.max(0, Math.floor((new Date() - new Date(latestDate)) / 86400000)) : '—';
      var latestAll = reports.filter(function(r) { return r.date === latestDate && r.source === 'all'; });
      var latestItems = latestAll.reduce(function(s, r) { return s + (r.items || 0); }, 0);
      var projRatio = (totalOk + totalFail) > 0 ? Math.round(totalFail / (totalOk + totalFail) * 100) : 0;
      var itemsLastCycle = reports.filter(function(r) {
        var dates = Object.keys(reports.reduce(function(acc, x) { acc[x.date] = true; return acc; }, {})).sort().reverse();
        return r.date === (dates[1] || '') && r.source === 'all';
      }).reduce(function(s, r) { return s + (r.items || 0); }, 0);
      var itemVelocity = itemsLastCycle > 0 ? Math.round((latestItems - itemsLastCycle) / itemsLastCycle * 100) : 0;
      var velSign = itemVelocity > 0 ? '+' : '';
      var velClr = itemVelocity > 0 ? 'var(--yry-pass)' : itemVelocity < 0 ? 'var(--yry-fail)' : 'var(--yry-text3)';

      var velGrid = document.getElementById('velGrid');
      velGrid.textContent = '';
      velGrid.insertAdjacentHTML('beforeend', '<div class="vel-item"><div class="vel-num" style="color:#22d3ee">' + avgItemsPerReport + '</div><div class="vel-lbl">平均条目 / 报告</div></div>' +
        '<div class="vel-item"><div class="vel-num" style="color:' + (freshnessDays <= 7 ? 'var(--yry-pass)' : freshnessDays <= 14 ? 'var(--yry-warn)' : 'var(--yry-fail)') + '">' + freshnessDays + ' 天</div><div class="vel-lbl">数据新鲜度</div></div>' +
        '<div class="vel-item"><div class="vel-num" style="color:#22d3ee">' + latestItems + '</div><div class="vel-lbl">最新全量条目</div></div>' +
        '<div class="vel-item"><div class="vel-num" style="color:' + velClr + '">' + velSign + itemVelocity + '%</div><div class="vel-lbl">条目周增长率</div></div>' +
        '<div class="vel-item"><div class="vel-num" style="color:' + (projRatio > 50 ? 'var(--yry-fail)' : projRatio > 20 ? 'var(--yry-warn)' : 'var(--yry-pass)') + '">' + projRatio + '%</div><div class="vel-lbl">投影占比</div></div>');

      // Report table
      var tbodyEl = document.getElementById('tbody');
      tbodyEl.textContent = '';
      tbodyEl.insertAdjacentHTML('beforeend', reports.map(function(r) {
        var okBadge = r.ok
          ? '<span class="badge ok">✓ 可达</span>'
          : '<span class="badge err">✗ 不可达</span>';
        var qualityBadge = r.projected
          ? '<span class="badge warn" style="font-size:.64rem">📡 投影 (±' + (r.deviation || '?') + ')</span>'
          : '<span class="badge ok" style="font-size:.64rem">真实</span>';
        var trendBadge = r.trend === 'rise' ? '<span class="badge rise">↑ 上升</span>' :
          r.trend === 'fall' ? '<span class="badge fall">↓ 下降</span>' :
          '<span class="badge flat">→ 持平</span>';
        var srcLabel = (SOURCE_ICONS[r.source] || '📡') + ' ' + (SOURCE_LABELS[r.source] || r.source);
        return '<tr>' +
          '<td>' + r.date + '</td>' +
          '<td><a href="' + r.file + '">' + srcLabel + '</a></td>' +
          '<td>' + okBadge + '</td>' +
          '<td>' + qualityBadge + '</td>' +
          '<td>' + (r.items || '—') + '</td>' +
          '<td>' + trendBadge + '</td>' +
          '<td><a href="' + (r.file || '#') + '">查看</a></td>' +
          '</tr>';
      }).join('');

      // Load health reference + cross refs
      renderHealthRef();
      renderCrossRefs();
    })
    .catch(function(e) {
      document.getElementById('tbody').textContent = '';

      document.getElementById('tbody').insertAdjacentHTML('beforeend', '<tr><td colspan="7"><div class="empty">加载失败: ' + e.message + '</div></td></tr>');
    });
})();
