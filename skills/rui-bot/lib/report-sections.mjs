/**
 * report-sections — HTML section builders for health reports.
 * Extracted from health-report.mjs for module decomposition.
 */

import { DIM_LABELS, DIM_WEIGHTS } from "./report-constants.mjs";
import { PASS_THRESHOLD, WARN_THRESHOLD, scoreColor, scoreIcon, avgScore } from "./bot-health-analysis.mjs";
import { contributionAnalysis, scoreDistribution, classifyScore } from "../../../lib/scoring.mjs";

/**
 * Build a comprehensive Executive Briefing narrative that synthesizes
 * all health dimensions into a professional, readable summary.
 * This is the "story" behind the numbers.
 *
 * @param {object} hr - Health result
 * @param {object} prev - Previous health entry
 * @param {Array} recommendations - Improvement recommendations
 * @returns {string} HTML
 */
export function buildExecutiveBriefing(hr, prev, recommendations) {
  var scores = hr.scores || {};
  var grade = hr.grade || "C";
  var composite = hr.composite || 0;

  // Categorize dimensions
  var critical = [], warning = [], healthy = [];
  for (var _a = 0, _b = Object.entries(scores); _a < _b.length; _a++) {
    var _c = _b[_a], dim = _c[0], score = _c[1];
    var label = DIM_LABELS[dim] || dim;
    if (score < 60) critical.push({ dim, label, score });
    else if (score < 80) warning.push({ dim, label, score });
    else healthy.push({ dim, label, score });
  }

  // Grade narrative
  var gradeNarrative = {
    A: "项目处于卓越健康状态，所有核心维度均达标，架构合规，工程实践成熟。建议保持当前节奏，关注趋势变化以防退化。",
    B: "项目整体健康良好，多数维度达标，但存在个别需关注领域。建议优先处理告警维度，防止降级为严重问题。",
    C: "项目存在明显健康风险，多个维度未达标。需立即制定改进计划，优先修复关键维度，避免进一步恶化。",
    D: "项目健康严重告警，核心维度大面积不达标。需启动紧急响应机制，逐项排查根因并立即修复。",
  };

  var narrative = gradeNarrative[grade] || gradeNarrative.C;

  // Trend narrative
  var trendNarrative = "";
  if (prev && prev.score) {
    var diff = composite - prev.score;
    if (diff > 5) trendNarrative = "较上次检查提升 " + diff + " 分，改进趋势明显。";
    else if (diff < -5) trendNarrative = "较上次检查下降 " + Math.abs(diff) + " 分，需关注退化趋势。";
    else trendNarrative = "较上次检查基本持平，状态稳定。";
  }

  // Critical items narrative
  var criticalNarrative = "";
  if (critical.length > 0) {
    criticalNarrative = "当前 <b style='color:#ef4444'>" + critical.length + " 个维度处于严重告警状态</b>：" +
      critical.map(function(c) { return c.label + "(" + c.score + "分)"; }).join("、") +
      "。这些维度直接影响项目核心功能，建议立即处理。";
  } else {
    criticalNarrative = "当前<b style='color:#22c55e'>无严重告警维度</b>，所有核心指标均在安全线以上。";
  }

  // Warning items narrative
  var warningNarrative = "";
  if (warning.length > 0) {
    warningNarrative = warning.length + " 个维度处于需关注状态：" +
      warning.slice(0, 5).map(function(w) { return w.label + "(" + w.score + "分)"; }).join("、") +
      (warning.length > 5 ? " 等" : "") + "。建议在下一维护窗口内处理。";
  }

  // Top strengths
  var sorted = Object.entries(scores).sort(function(a, b) { return b[1] - a[1]; });
  var top3 = sorted.slice(0, 3);
  var strengthsNarrative = "表现最佳维度：" + top3.map(function(s) { return "<b style='color:#22c55e'>" + (DIM_LABELS[s[0]] || s[0]) + " " + s[1] + "分</b>"; }).join("、") + "。";

  // Recommendation summary
  var recNarrative = "";
  if (recommendations.length > 0) {
    var highRecs = recommendations.filter(function(r) { return r.priority === "high"; });
    if (highRecs.length > 0) {
      recNarrative = "已生成 <b>" + recommendations.length + " 项改进建议</b>，其中 <b style='color:#ef4444'>" + highRecs.length + " 项为高优先级</b>，建议优先执行。";
    } else {
      recNarrative = "已生成 <b>" + recommendations.length + " 项改进建议</b>，可按计划逐步执行。";
    }
  }

  // Diagnostic summary
  var diagNarrative = "";
  var diagCount = (hr.diagnostics && hr.diagnostics.triggered && hr.diagnostics.triggered.length) || 0;
  if (diagCount > 0) {
    diagNarrative = "诊断引擎触发 <b style='color:#f59e0b'>" + diagCount + " 项诊断</b>，建议查看诊断详情面板了解具体问题和修复建议。";
  } else {
    diagNarrative = "诊断引擎<b style='color:#22c55e'>未触发任何诊断</b>，系统运行正常。";
  }

  return '<div class="h-section" style="border-left:3px solid var(--yry-accent);background:rgba(255,193,7,.04)">' +
    '<h2>📋 执行简报 <span style="font-size:.78rem;color:var(--yry-text3);font-weight:400;margin-left:8px">Executive Briefing</span></h2>' +
    '<div style="font-size:.88rem;line-height:1.9;color:var(--yry-text2);padding:8px 0">' +
    '<p style="margin-bottom:12px"><b style="color:var(--yry-accent)">综合评估：</b>' + narrative + ' ' + trendNarrative + '</p>' +
    '<p style="margin-bottom:12px"><b style="color:var(--yry-accent)">关键发现：</b>' + criticalNarrative + '</p>' +
    (warningNarrative ? '<p style="margin-bottom:12px"><b style="color:var(--yry-accent)">需关注：</b>' + warningNarrative + '</p>' : '') +
    '<p style="margin-bottom:12px"><b style="color:var(--yry-accent)">优势领域：</b>' + strengthsNarrative + '</p>' +
    '<p style="margin-bottom:12px"><b style="color:var(--yry-accent)">改进建议：</b>' + recNarrative + '</p>' +
    '<p style="margin-bottom:0"><b style="color:var(--yry-accent)">诊断状态：</b>' + diagNarrative + '</p>' +
    '</div>' +
    '<div style="display:flex;flex-wrap:wrap;gap:8px;margin-top:12px;padding-top:12px;border-top:var(--yry-border)">' +
    '<span style="padding:4px 12px;background:rgba(34,197,94,.08);border-radius:6px;font-size:.72rem;color:#22c55e">✅ ' + healthy.length + ' 项健康</span>' +
    (warning.length > 0 ? '<span style="padding:4px 12px;background:rgba(245,158,11,.08);border-radius:6px;font-size:.72rem;color:#f59e0b">⚠️ ' + warning.length + ' 项需关注</span>' : '') +
    (critical.length > 0 ? '<span style="padding:4px 12px;background:rgba(239,68,68,.08);border-radius:6px;font-size:.72rem;color:#ef4444">🚫 ' + critical.length + ' 项严重</span>' : '') +
    '<span style="padding:4px 12px;background:rgba(59,130,246,.08);border-radius:6px;font-size:.72rem;color:var(--yry-cyan)">🔬 ' + diagCount + ' 项诊断触发</span>' +
    '<span style="padding:4px 12px;background:rgba(255,193,7,.08);border-radius:6px;font-size:.72rem;color:var(--yry-accent)">💡 ' + recommendations.length + ' 项建议</span>' +
    '</div>' +
    '</div>';
}

export function buildScoreTrend(history) {
  if (!history || history.length < 2) return "";
  const recent = history.slice(-10);
  const maxScore = 100;
  const bars = recent.map((h, i) => {
    const hPx = Math.max(4, Math.round((h.composite / maxScore) * 60));
    const color = h.grade === "A" ? "var(--yry-pass)" : h.grade === "B" ? "var(--yry-pass)" : h.grade === "C" ? "var(--yry-warn)" : "var(--yry-fail)";
    const date = h.timestamp?.slice(0, 10) || "";
    const isLatest = i === recent.length - 1;
    return `<div style="display:flex;flex-direction:column;align-items:center;gap:4px;flex:1;min-width:20px">
      <span style="font-size:.65rem;font-weight:${isLatest ? '700' : '400'};color:var(--yry-accent)">${h.composite}</span>
      <div style="width:100%;max-width:40px;height:${hPx}px;background:${color};border-radius:3px 3px 0 0;opacity:${isLatest ? '1' : '.6'};transition:opacity .2s" title="${date}: ${h.composite} 分 (${h.grade})" onmouseover="this.style.opacity='1'" onmouseout="this.style.opacity='${isLatest ? '1' : '.6'}'"></div>
      <span style="font-size:.58rem;color:var(--yry-text3)">${date.slice(5)}</span>
    </div>`;
  }).join("");
  return `<div class="h-section">
    <h2>📈 健康趋势 <span style="font-size:.78rem;color:var(--yry-text3);font-weight:400;margin-left:8px">最近 ${recent.length} 次</span></h2>
    <div style="display:flex;align-items:flex-end;gap:4px;padding:16px 0 8px;overflow-x:auto">${bars}</div>
    <div style="font-size:.68rem;color:var(--yry-text3);text-align:center;margin-top:4px">▲ 综合健康度变化趋势 — 高分高柱，绿色=优秀 黄色=需关注 红色=告警</div>
  </div>`;
}

export function buildSummaryCard(hr, prev, recommendations) {
  const overallIcon = hr.grade === "A" || hr.grade === "B" ? "✅" : hr.grade === "C" ? "⚠️" : "🚫";
  const overallLabel = hr.grade === "A" ? "优秀" : hr.grade === "B" ? "良好" : hr.grade === "C" ? "需关注" : "告警";

  const sortedDims = Object.entries(hr.scores || {})
    .sort(([, a], [, b]) => a - b);
  const weakest = sortedDims[0];
  const weakLabel = weakest ? `${DIM_LABELS[weakest[0]] || weakest[0]} ${weakest[1]}分` : "—";
  const strongest = sortedDims[sortedDims.length - 1];
  const strongLabel = strongest ? `${DIM_LABELS[strongest[0]] || strongest[0]} ${strongest[1]}分` : "—";

  let trendText = "";
  if (prev) {
    const diff = hr.composite - prev.score;
    trendText = diff > 3 ? `↑${diff}` : diff < -3 ? `↓${Math.abs(diff)}` : "→0";
  }

  let dimPass = 0, dimWarn = 0, dimFail = 0;
  for (const s of Object.values(hr.scores || {})) {
    if (s >= 80) dimPass++;
    else if (s >= 60) dimWarn++;
    else dimFail++;
  }

  const topRec = recommendations.length > 0 ? recommendations[0].text : "";

  return `<div class="h-summary-card">
    <div class="h-summary-row">
      <div class="h-summary-item">
        <div class="h-summary-val">${overallIcon} ${overallLabel}</div>
        <div class="h-summary-lbl">综合评估</div>
      </div>
      <div class="h-summary-item">
        <div class="h-summary-val">${hr.diagnostics?.triggered?.length ?? 0}/8</div>
        <div class="h-summary-lbl">诊断触发${hr.diagnostics?.bootstrapped ? ' (引导)' : ''}</div>
      </div>
      <div class="h-summary-item">
        <div class="h-summary-val"><span style="color:#22c55e">${dimPass}</span> <span style="color:#f59e0b">${dimWarn}</span> <span style="color:#ef4444">${dimFail}</span></div>
        <div class="h-summary-lbl">维度过关/告警/失败</div>
      </div>
      <div class="h-summary-item">
        <div class="h-summary-val">${weakLabel}${trendText ? ` ${trendText}` : ""}</div>
        <div class="h-summary-lbl">最弱维度${trendText ? ' · 趋势' : ''}</div>
      </div>
    </div>
    <div class="h-summary-row" style="margin-top:8px">
      <div class="h-summary-item">
        <div class="h-summary-val" style="color:#22c55e">${strongLabel}</div>
        <div class="h-summary-lbl">最强维度</div>
      </div>
      <div class="h-summary-item">
        <div class="h-summary-val">${recommendations.length} 项</div>
        <div class="h-summary-lbl">改进建议</div>
      </div>
      <div class="h-summary-item" style="flex:2;min-width:160px">
        <div class="h-summary-val" style="font-size:.75rem;text-align:left">${topRec ? '💡 '+topRec.slice(0,50)+(topRec.length>50?'…':'') : '—'}</div>
        <div class="h-summary-lbl">首项建议</div>
      </div>
    </div>
  </div>`;
}

export function buildScoreBreakdown(hr) {
  const entries = [];
  for (const [dim, score] of Object.entries(hr.scores || {})) {
    const label = DIM_LABELS[dim] || dim;
    const weight = DIM_WEIGHTS[dim] || 0;
    const contribution = Math.round(score * weight / 100);
    entries.push({ dim, label, score, weight, contribution });
  }
  entries.sort((a, b) => b.contribution - a.contribution);

  const totalWeight = entries.reduce((s, e) => s + e.weight, 0);
  const totalContribution = entries.reduce((s, e) => s + e.contribution, 0);

  const bars = entries.map((e, i) => {
    const barColor = scoreColor(e.score);
    const barPct = ((e.contribution / totalContribution) * 100).toFixed(0);
    return `<div class="h-comp-row">
      <span class="h-comp-rank">${i + 1}</span>
      <span class="h-comp-label">${e.label}</span>
      <span class="h-comp-score" style="color:${barColor}">${e.score}分 × ${e.weight}%</span>
      <div class="h-comp-bar-wrap"><div class="h-comp-bar-inner" style="width:${barPct}%;background:${barColor}"></div></div>
      <span class="h-comp-val">${e.contribution}</span>
    </div>`;
  }).join("");

  return `<div class="h-section">
    <h2>🔢 评分构成 <span style="font-size:.78rem;color:var(--yry-text3);font-weight:400;margin-left:8px">加权分解 · 合计 ${totalContribution}/${totalWeight * 100 / totalWeight} 分</span></h2>
    <div class="h-comp-list">${bars}</div>
    <div style="margin-top:10px;font-size:.68rem;color:var(--yry-text3)">计算公式: 综合评分 = Σ(维度得分 × 权重%) / Σ权重% · 按贡献值降序排列</div>
  </div>`;
}

export function buildRecommendationsSection(recs) {
  const items = recs.map((r) => {
    const prioColor = r.priority === "high" ? "var(--yry-fail)" : "var(--yry-warn)";
    return `<div class="h-rec-item">
      <span class="h-rec-prio" style="color:${prioColor}">${r.priority === "high" ? "🔴" : "🟡"}</span>
      <div class="h-rec-body">
        <div class="h-rec-source">${r.source}</div>
        <div class="h-rec-text">${r.text}</div>
      </div>
    </div>`;
  }).join("\n");

  return `<div class="h-section">
    <h2>💡 改进建议 <span style="font-size:.78rem;color:var(--yry-text3);font-weight:400;margin-left:8px">${recs.length} 项</span></h2>
    <div class="h-rec-list">${items}</div>
  </div>`;
}

export function buildComponentSections(compScores) {
  if (!compScores) return "";
  const sc = scoreColor;
  function chip(s){return s>=80?'<span class="h-comp-chip pass">优秀</span>':s>=60?'<span class="h-comp-chip warn">一般</span>':'<span class="h-comp-chip fail">待改进</span>'}
  function tbl(items,showMeta){
    if(!items||!items.length)return'<div class="h-placeholder">暂无数据</div>';
    const s=[...items].sort((a,b)=>b.score-a.score);
    return`<table class="h-comp-table"><thead><tr><th>#</th><th>名称</th>${showMeta?'<th>属性</th>':''}<th>评分</th><th>等级</th></tr></thead><tbody>${s.map((x,i)=>{const m=[];if(x.hasSkillMd!==undefined)m.push(x.hasSkillMd?'📄':'❌SKILL.md');if(x.hasLib)m.push('📦lib');if(x.mjsCount>0)m.push('📜'+x.mjsCount);if(x.category)m.push('📂'+x.category);return`<tr><td class="h-comp-rank">${i+1}</td><td class="h-comp-name">${x.name}</td>${showMeta?`<td class="h-comp-meta">${m.join(' ')||'—'}</td>`:''}<td class="h-comp-score-cell"><div class="h-comp-score-bar"><div class="h-comp-score-fill" style="width:${x.score}%;background:${sc(x.score)}"></div></div><span class="h-comp-score-num" style="color:${sc(x.score)}">${x.score} 分</span></td><td>${chip(x.score)}</td></tr>`}).join('')}</tbody></table>`}
  const avg = avgScore;
  const all=[...(compScores.skills||[]),...(compScores.agents||[]),...(compScores.rules||[]),...(compScores.scripts||[])];
  const lo=all.filter(c=>c.score<60);
  return`<div class="h-section"><h2>📦 组件评分总览</h2><div class="h-comp-summary"><div class="h-comp-sum-item"><div class="h-comp-sum-val" style="color:${sc(avg(all))}">${avg(all)}</div><div class="h-comp-sum-lbl">综合均分 · ${all.length} 组件</div></div><div class="h-comp-sum-item"><div class="h-comp-sum-val" style="color:${sc(avg(compScores.skills))}">${avg(compScores.skills)}</div><div class="h-comp-sum-lbl">Skills · ${compScores.skills.length} 个</div></div><div class="h-comp-sum-item"><div class="h-comp-sum-val" style="color:${sc(avg(compScores.agents))}">${avg(compScores.agents)}</div><div class="h-comp-sum-lbl">Agents · ${compScores.agents.length} 个</div></div><div class="h-comp-sum-item"><div class="h-comp-sum-val" style="color:${sc(avg(compScores.rules))}">${avg(compScores.rules)}</div><div class="h-comp-sum-lbl">Rules · ${compScores.rules.length} 个</div></div><div class="h-comp-sum-item"><div class="h-comp-sum-val" style="color:${sc(avg(compScores.scripts))}">${avg(compScores.scripts)}</div><div class="h-comp-sum-lbl">Scripts · ${compScores.scripts.length} 个</div></div></div></div>${lo.length?`<div class="h-section" style="border-left:3px solid var(--yry-fail)"><h2>⚠️ 低分组件 <span style="font-size:.78rem;color:var(--yry-text3);font-weight:400;margin-left:8px">${lo.length} 个</span></h2><div class="h-rec-list">${lo.map(c=>`<div class="h-rec-item"><span class="h-rec-prio" style="color:var(--yry-fail)">🔴</span><div class="h-rec-body"><div class="h-rec-source">${c.name} · ${c.score} 分</div><div class="h-rec-text">${(c.recommendations||['补充完善']).join('；')}</div></div></div>`).join('')}</div></div>`:''}<div class="h-section"><h2>🤖 Skills <span style="font-size:.78rem;color:var(--yry-text3);font-weight:400;margin-left:8px">${compScores.skills.length} 个 · 均分 ${avg(compScores.skills)}</span></h2>${tbl(compScores.skills,true)}</div><div class="h-section"><h2>👥 Agents <span style="font-size:.78rem;color:var(--yry-text3);font-weight:400;margin-left:8px">${compScores.agents.length} 个 · 均分 ${avg(compScores.agents)}</span></h2>${tbl(compScores.agents,false)}</div><div class="h-section"><h2>📏 Rules <span style="font-size:.78rem;color:var(--yry-text3);font-weight:400;margin-left:8px">${compScores.rules.length} 个 · 均分 ${avg(compScores.rules)}</span></h2>${tbl(compScores.rules,false)}</div><div class="h-section"><h2>📜 Scripts <span style="font-size:.78rem;color:var(--yry-text3);font-weight:400;margin-left:8px">${compScores.scripts.length} 个 · 均分 ${avg(compScores.scripts)}</span></h2>${tbl(compScores.scripts,true)}</div>`;
}

export function buildStructureSection(hr) {
  const si = hr.structInfo;
  if (!si) return "";

  const score = si.score ?? 0;
  const icon = si.icon || "📐";
  const barColor = scoreColor(score);

  const totals = si.totals || { fileCount: 0, totalLines: 0 };

  const summaryHtml = `<div class="h-summary-row">
    <div class="h-summary-item">
      <div class="h-summary-val">${totals.fileCount}</div>
      <div class="h-summary-lbl">源文件</div>
    </div>
    <div class="h-summary-item">
      <div class="h-summary-val">${totals.totalLines.toLocaleString()}</div>
      <div class="h-summary-lbl">总行数</div>
    </div>
    <div class="h-summary-item">
      <div class="h-summary-val" style="color:${si.critFileCount > 0 ? 'var(--yry-fail)' : si.allLargeFileCount > 0 ? 'var(--yry-warn)' : 'var(--yry-pass)'}">${si.allLargeFileCount || 0}</div>
      <div class="h-summary-lbl">大文件 ≥500 行${si.critFileCount > 0 ? ` (≥1000: ${si.critFileCount})` : ""}</div>
    </div>
    <div class="h-summary-item">
      <div class="h-summary-val" style="color:${barColor}">${score}</div>
      <div class="h-summary-lbl">结构健康分</div>
    </div>
  </div>`;

  let filesHtml = "";
  if (si.largeFiles && si.largeFiles.length > 0) {
    const topFiles = si.largeFiles.slice(0, 5);
    const rows = topFiles.map((f, i) => {
      const tier = f.lines >= 1000 ? "fail" : "warn";
      const tierLabel = f.lines >= 1000 ? "巨型" : "大型";
      const tierColor = f.lines >= 1000 ? "var(--yry-fail)" : "var(--yry-warn)";
      const pct = Math.min(100, (f.lines / 2000) * 100);
      return `<tr class="h-struct-row">
        <td class="h-struct-rank">${i + 1}</td>
        <td class="h-struct-path" title="${f.path}">${f.path}</td>
        <td class="h-struct-ext">${f.ext || "—"}</td>
        <td class="h-struct-lines" style="font-family:'JetBrains Mono',monospace">${f.lines.toLocaleString()}</td>
        <td class="h-struct-bar-cell"><div class="h-struct-bar"><div class="h-struct-bar-fill" style="width:${pct}%;background:${tierColor}"></div></div></td>
        <td><span class="h-struct-chip ${tier}">${tierLabel}</span></td>
      </tr>`;
    }).join("");
    filesHtml = `
      <h3 class="h-struct-sub">📄 大文件 TOP 5 <span class="h-struct-sub-note">≥500 行 · 按行数降序 · 共 ${si.largeFiles.length} 个</span></h3>
      <table class="h-struct-table">
        <thead><tr><th>#</th><th>路径</th><th>类型</th><th>行数</th><th>规模</th><th>级别</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>`;
  } else {
    filesHtml = `<div class="h-placeholder">✅ 未发现 ≥500 行的大文件</div>`;
  }

  let modulesHtml = "";
  if (si.modules && si.modules.length > 0) {
    const topMods = si.modules.slice(0, 5);
    const rows = topMods.map((m, i) => {
      const hot = m.lines >= 3000 || m.fileCount >= 30;
      const pct = Math.min(100, (m.lines / 10000) * 100);
      const mBarColor = hot ? "var(--yry-warn)" : "var(--yry-pass)";
      return `<tr>
        <td class="h-struct-rank">${i + 1}</td>
        <td class="h-struct-path"><strong>${m.name}</strong></td>
        <td class="h-struct-lines">${m.fileCount}</td>
        <td class="h-struct-lines" style="font-family:'JetBrains Mono',monospace">${m.lines.toLocaleString()}</td>
        <td class="h-struct-lines">${m.avgLines}</td>
        <td class="h-struct-bar-cell"><div class="h-struct-bar"><div class="h-struct-bar-fill" style="width:${pct}%;background:${mBarColor}"></div></div></td>
        <td class="h-struct-max" title="${m.maxFile}">${m.maxLines.toLocaleString()} 行</td>
        <td>${hot ? '<span class="h-struct-chip warn">热</span>' : '<span class="h-struct-chip pass">正常</span>'}</td>
      </tr>`;
    }).join("");
    modulesHtml = `
      <h3 class="h-struct-sub">📦 顶层模块 TOP 5 <span class="h-struct-sub-note">按总行数降序 · 共 ${si.modules.length} 个模块</span></h3>
      <table class="h-struct-table">
        <thead><tr><th>#</th><th>模块</th><th>文件数</th><th>总行数</th><th>均行数</th><th>规模</th><th>最大文件</th><th>状态</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>`;
  }

  return `<div class="h-section">
    <h2>📐 结构健康 <span style="font-size:.78rem;color:var(--yry-text3);font-weight:400;margin-left:8px">${icon} ${si.summary || ""}</span></h2>
    ${summaryHtml}
    ${filesHtml}
    ${modulesHtml}
    <div class="h-struct-legend">
      <span class="h-struct-chip fail">巨型 ≥1000 行</span>
      <span class="h-struct-chip warn">大型 ≥500 行 · 热模块 ≥3000 行或 ≥30 文件</span>
      <span class="h-struct-chip pass">正常</span>
    </div>
  </div>`;
}

export function buildGitSecuritySection(hr) {
  const parts = [];

  if (hr.gitInfo) {
    const gi = hr.gitInfo;
    const icon = scoreIcon(gi.score);
    parts.push(`<div class="h-section">
      <h2>📦 Git 仓库状态 <span style="font-size:.78rem;color:var(--yry-text3);font-weight:400;margin-left:8px">${icon} ${gi.summary}</span></h2>
      <div class="h-detail-list">
        <div class="h-detail-item"><span class="h-detail-icon">🌿</span><span class="h-detail-text">分支: <strong>${gi.branch || "?"}</strong></span></div>
        <div class="h-detail-item"><span class="h-detail-icon">📝</span><span class="h-detail-text">未提交文件: ${gi.uncommitted ?? "?"} 个</span></div>
        ${gi.behind ? `<div class="h-detail-item"><span class="h-detail-icon">⬇️</span><span class="h-detail-text">落后 origin: ${gi.behind} 个提交</span></div>` : ""}
        ${gi.ahead ? `<div class="h-detail-item"><span class="h-detail-icon">⬆️</span><span class="h-detail-text">领先 origin: ${gi.ahead} 个提交</span></div>` : ""}
      </div>
    </div>`);
  }

  if (hr.secInfo) {
    const si = hr.secInfo;
    const icon = scoreIcon(si.score);
    const findingItems = (si.findings || []).length > 0
      ? si.findings.slice(0, 5).map((f) => `<div class="h-detail-item"><span class="h-detail-icon">⚠️</span><span class="h-detail-text" style="font-family:monospace;font-size:.76rem">${f}</span></div>`).join("")
      : "";
    parts.push(`<div class="h-section">
      <h2>🛡️ 安全扫描 <span style="font-size:.78rem;color:var(--yry-text3);font-weight:400;margin-left:8px">${icon} ${si.summary}</span></h2>
      ${findingItems ? `<div class="h-detail-list">${findingItems}</div>` : '<div class="h-placeholder">未发现安全风险 — 未检测到硬编码凭据、密钥或 Token 泄露</div>'}
    </div>`);
  }

  return parts.join("\n");
}

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export function buildFileSizeSection(hr) {
  const fi = hr.fileSizeInfo;
  if (!fi) return "";

  const score = fi.score ?? 0;
  const barColor = scoreColor(score);

  // Summary stats
  const summaryHtml = `<div class="h-summary-row">
    <div class="h-summary-item">
      <div class="h-summary-val">${fi.totalFiles}</div>
      <div class="h-summary-lbl">源文件</div>
    </div>
    <div class="h-summary-item">
      <div class="h-summary-val">${formatBytes(fi.totalBytes)}</div>
      <div class="h-summary-lbl">总大小</div>
    </div>
    <div class="h-summary-item">
      <div class="h-summary-val">${formatBytes(fi.avgFileSize)}</div>
      <div class="h-summary-lbl">平均文件大小</div>
    </div>
    <div class="h-summary-item">
      <div class="h-summary-val" style="color:${fi.growthPct !== null ? (fi.growthPct > 10 ? 'var(--yry-fail)' : fi.growthPct > 5 ? 'var(--yry-warn)' : 'var(--yry-pass)') : 'var(--yry-text2)'}">${fi.growthPct !== null ? (fi.growthPct > 0 ? '+' : '') + fi.growthPct + '%' : '—'}</div>
      <div class="h-summary-lbl">体积变化</div>
    </div>
  </div>`;

  // Size distribution histogram
  const maxBucket = Math.max(1, ...fi.bucketCounts.map((b) => b.count));
  const distHtml = fi.bucketCounts.map((b) => {
    const pct = Math.round((b.count / maxBucket) * 100);
    const barW = Math.max(2, Math.round((b.count / Math.max(1, fi.totalFiles)) * 100));
    return `<div class="h-comp-row">
      <span class="h-comp-label">${b.label}</span>
      <span class="h-comp-score" style="color:var(--yry-text2)">${b.count} 文件</span>
      <div class="h-comp-bar-wrap"><div class="h-comp-bar-inner" style="width:${barW}%;background:var(--yry-cyan)"></div></div>
      <span class="h-comp-val">${barW}%</span>
    </div>`;
  }).join("");

  // Largest files table
  let largestHtml = "";
  if (fi.largestFiles && fi.largestFiles.length > 0) {
    const topFiles = fi.largestFiles.slice(0, 10);
    const rows = topFiles.map((f, i) => {
      const tier = f.bytes >= 500 * 1024 ? "fail" : f.bytes >= 100 * 1024 ? "warn" : "pass";
      const tierLabel = f.bytes >= 500 * 1024 ? "巨型" : f.bytes >= 100 * 1024 ? "大型" : "正常";
      const tierColor = f.bytes >= 500 * 1024 ? "var(--yry-fail)" : f.bytes >= 100 * 1024 ? "var(--yry-warn)" : "var(--yry-pass)";
      const pct = Math.min(100, (f.bytes / Math.max(1, fi.largestFiles[0]?.bytes || 1)) * 100);
      return `<tr>
        <td class="h-struct-rank">${i + 1}</td>
        <td class="h-struct-path" title="${f.path}">${f.path}</td>
        <td class="h-struct-ext">${f.ext || "—"}</td>
        <td class="h-struct-lines" style="font-family:'JetBrains Mono',monospace">${formatBytes(f.bytes)}</td>
        <td class="h-struct-bar-cell"><div class="h-struct-bar"><div class="h-struct-bar-fill" style="width:${pct}%;background:${tierColor}"></div></div></td>
        <td><span class="h-struct-chip ${tier}">${tierLabel}</span></td>
      </tr>`;
    }).join("");
    largestHtml = `
      <h3 class="h-struct-sub">📄 最大文件 TOP 10 <span class="h-struct-sub-note">按字节大小降序 · 共 ${fi.largestFiles.length} 个</span></h3>
      <table class="h-struct-table">
        <thead><tr><th>#</th><th>路径</th><th>类型</th><th>大小</th><th>规模</th><th>级别</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>`;
  }

  // Extension breakdown
  const extRows = fi.extSizes.slice(0, 8).map((e, i) => {
    const barW = Math.max(2, Math.round((e.totalBytes / Math.max(1, fi.totalBytes)) * 100));
    return `<tr>
      <td class="h-struct-rank">${i + 1}</td>
      <td class="h-struct-ext">.${e.ext}</td>
      <td class="h-struct-lines">${e.count}</td>
      <td class="h-struct-lines" style="font-family:'JetBrains Mono',monospace">${formatBytes(e.totalBytes)}</td>
      <td class="h-struct-bar-cell"><div class="h-struct-bar"><div class="h-struct-bar-fill" style="width:${barW}%;background:var(--yry-cyan)"></div></div></td>
      <td class="h-struct-lines">${e.pct}%</td>
    </tr>`;
  }).join("");

  return `<div class="h-section">
    <h2>📏 文件体积分析 <span style="font-size:.78rem;color:var(--yry-text3);font-weight:400;margin-left:8px">${fi.icon || ""} ${fi.summary || ""}</span></h2>
    ${summaryHtml}
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-top:16px">
      <div>
        <h3 class="h-struct-sub">📊 大小分布</h3>
        <div class="h-comp-list">${distHtml}</div>
      </div>
      <div>
        <h3 class="h-struct-sub">📁 文件类型占比</h3>
        <table class="h-struct-table">
          <thead><tr><th>#</th><th>类型</th><th>文件数</th><th>大小</th><th>占比</th><th>%</th></tr></thead>
          <tbody>${extRows}</tbody>
        </table>
      </div>
    </div>
    ${largestHtml}
    <div class="h-struct-legend">
      <span class="h-struct-chip fail">巨型 ≥500 KB</span>
      <span class="h-struct-chip warn">大型 ≥100 KB</span>
      <span class="h-struct-chip pass">正常</span>
    </div>
  </div>`;
}

export function buildDependencySection(hr) {
  const di = hr.depInfo;
  if (!di) return "";

  const score = di.score ?? 0;
  const barColor = scoreColor(score);

  // Summary
  const summaryHtml = `<div class="h-summary-row">
    <div class="h-summary-item">
      <div class="h-summary-val">${di.totalFiles}</div>
      <div class="h-summary-lbl">模块总数</div>
    </div>
    <div class="h-summary-item">
      <div class="h-summary-val">${di.totalEdges}</div>
      <div class="h-summary-lbl">依赖边</div>
    </div>
    <div class="h-summary-item">
      <div class="h-summary-val" style="color:${di.cycles.length > 0 ? 'var(--yry-fail)' : 'var(--yry-pass)'}">${di.cycles.length}</div>
      <div class="h-summary-lbl">循环依赖</div>
    </div>
    <div class="h-summary-item">
      <div class="h-summary-val" style="color:${di.orphans.length > 0 ? 'var(--yry-warn)' : 'var(--yry-pass)'}">${di.orphans.length}</div>
      <div class="h-summary-lbl">孤立文件</div>
    </div>
  </div>`;

  // Circular dependencies
  let cyclesHtml = "";
  if (di.cycles.length > 0) {
    const cycleItems = di.cycles.map((c) => {
      const shortPath = c.path.map((p) => `<code style="font-size:.72rem">${p.replace(/^skills\//,"").replace(/^lib\//,"").replace(/^agents\//,"").replace(/^rules\//,"")}</code>`).join(" <span style=\"color:var(--yry-fail)\">→</span> ");
      return `<div class="h-rec-item">
        <span class="h-rec-prio" style="color:var(--yry-fail)">🔴</span>
        <div class="h-rec-body">
          <div class="h-rec-source">${c.length} 层循环</div>
          <div class="h-rec-text">${shortPath}</div>
        </div>
      </div>`;
    }).join("");
    cyclesHtml = `
      <h3 class="h-struct-sub">⚠️ 循环依赖 <span class="h-struct-sub-note">共 ${di.cycles.length} 个 · 需重构解除</span></h3>
      <div class="h-rec-list">${cycleItems}</div>`;
  } else {
    cyclesHtml = `<div class="h-placeholder">✅ 未检测到循环依赖 — 依赖图无环</div>`;
  }

  // Fan-in (most depended on) + Fan-out (most dependencies)
  const fanInRows = (di.highFanIn || di.fanIn || []).slice(0, 8).map((f, i) => {
    const hot = f.count >= 8;
    return `<tr>
      <td class="h-struct-rank">${i + 1}</td>
      <td class="h-struct-path" title="${f.file}">${f.shortPath}</td>
      <td class="h-struct-lines" style="font-family:'JetBrains Mono',monospace;color:${hot ? 'var(--yry-warn)' : 'var(--yry-pass)'}">${f.count}</td>
      <td>${hot ? '<span class="h-struct-chip warn">核心</span>' : '<span class="h-struct-chip pass">正常</span>'}</td>
    </tr>`;
  }).join("");

  const fanOutRows = (di.highFanOut || di.fanOut || []).slice(0, 8).map((f, i) => {
    const god = f.count >= 10;
    return `<tr>
      <td class="h-struct-rank">${i + 1}</td>
      <td class="h-struct-path" title="${f.file}">${f.shortPath}</td>
      <td class="h-struct-lines" style="font-family:'JetBrains Mono',monospace;color:${god ? 'var(--yry-fail)' : 'var(--yry-warn)'}">${f.count}</td>
      <td>${god ? '<span class="h-struct-chip fail">上帝</span>' : '<span class="h-struct-chip warn">偏高</span>'}</td>
    </tr>`;
  }).join("");

  // Orphans
  let orphansHtml = "";
  if (di.orphans.length > 0) {
    const orphanItems = di.orphans.slice(0, 5).map((o) =>
      `<div class="h-detail-item"><span class="h-detail-icon">👻</span><span class="h-detail-text" style="font-family:monospace;font-size:.76rem">${o.shortPath}</span></div>`
    ).join("");
    orphansHtml = `
      <h3 class="h-struct-sub">👻 孤立文件 <span class="h-struct-sub-note">未被任何模块引用 · 共 ${di.orphans.length} 个</span></h3>
      <div class="h-detail-list">${orphanItems}</div>`;
  }

  return `<div class="h-section">
    <h2>🔗 系统组件依赖分析 <span style="font-size:.78rem;color:var(--yry-text3);font-weight:400;margin-left:8px">${di.icon || ""} ${di.summary || ""}</span></h2>
    ${summaryHtml}
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-top:16px">
      <div>
        <h3 class="h-struct-sub">📥 被依赖最多 (Fan-in) <span class="h-struct-sub-note">核心模块</span></h3>
        <table class="h-struct-table">
          <thead><tr><th>#</th><th>模块</th><th>被引用</th><th>级别</th></tr></thead>
          <tbody>${fanInRows || '<tr><td colspan="4"><div class="h-placeholder">暂无数据</div></td></tr>'}</tbody>
        </table>
      </div>
      <div>
        <h3 class="h-struct-sub">📤 依赖最多 (Fan-out) <span class="h-struct-sub-note">上帝模块</span></h3>
        <table class="h-struct-table">
          <thead><tr><th>#</th><th>模块</th><th>依赖数</th><th>级别</th></tr></thead>
          <tbody>${fanOutRows || '<tr><td colspan="4"><div class="h-placeholder">暂无数据</div></td></tr>'}</tbody>
        </table>
      </div>
    </div>
    ${cyclesHtml}
    ${orphansHtml}
    <div class="h-struct-legend">
      <span class="h-struct-chip fail">上帝模块 ≥10 依赖</span>
      <span class="h-struct-chip warn">核心模块 ≥8 被引用 · 偏高 ≥8 依赖</span>
      <span class="h-struct-chip pass">正常</span>
    </div>
  </div>`;
}

// ── Enhanced analysis sections (professional-grade) ──────────────

/**
 * Build contribution gap analysis section.
 * Identifies which dimensions drag down the composite score the most,
 * and quantifies the potential improvement if fixed.
 */
export function buildContributionGapSection(hr) {
  const analysis = contributionAnalysis(hr.scores || {}, DIM_WEIGHTS);
  if (!analysis || analysis.topDrag.length === 0) return "";

  const totalGap = analysis.dragTotal;
  const potentialScore = Math.min(100, hr.composite + Math.round(totalGap));

  const rows = analysis.topDrag.map((e, i) => {
    const barColor = scoreColor(e.score);
    const gapPct = Math.min(100, Math.round((e.gap / (analysis.topDrag[0]?.gap || 1)) * 100));
    return '<div class="h-comp-row">' +
      '<span class="h-comp-rank">' + (i + 1) + '</span>' +
      '<span class="h-comp-label">' + (DIM_LABELS[e.dim] || e.dim) + '</span>' +
      '<span class="h-comp-score" style="color:' + barColor + '">' + e.score + ' 分</span>' +
      '<span style="font-size:.72rem;color:#ef4444;min-width:50px;text-align:right">−' + (Math.round(e.gap * 10) / 10) + ' 分</span>' +
      '<div class="h-comp-bar-wrap"><div class="h-comp-bar-inner" style="width:' + gapPct + '%;background:#ef4444;opacity:.6"></div></div>' +
      '</div>';
  }).join("");

  return '<div class="h-section">' +
    '<h2>🎯 加分潜力分析 <span style="font-size:.78rem;color:var(--yry-text3);font-weight:400;margin-left:8px">拖分维度 Top ' + analysis.topDrag.length + '</span></h2>' +
    '<div style="margin-bottom:12px;padding:12px;background:rgba(245,158,11,.08);border-radius:6px;border:1px solid rgba(245,158,11,.15)">' +
    '<span style="font-weight:600">📊 当前综合评分: ' + hr.composite + ' 分</span>' +
    '<span style="margin-left:12px;color:#22c55e">修复所有拖分项可达: <b>' + potentialScore + ' 分</b></span>' +
    '<span style="margin-left:12px;font-size:.72rem;color:var(--yry-text3)">(' + analysis.topDrag.length + ' 个维度共拖低 ' + (Math.round(totalGap * 10) / 10) + ' 分)</span>' +
    '</div>' +
    '<div class="h-comp-list">' + rows + '</div>' +
    '<div style="margin-top:8px;font-size:.68rem;color:var(--yry-text3)">💡 拖分值 = (100 − 维度得分) × 维度权重 / 总权重 · 按拖分从高到低排列</div>' +
    '</div>';
}

/**
 * Build dimension health distribution section with histogram and stats.
 */
export function buildScoreDistributionSection(hr) {
  var scores = Object.values(hr.scores || {}).filter(function(s) { return typeof s === "number"; });
  if (scores.length === 0) return "";

  var dist = scoreDistribution(scores);
  var tiers = { excellent: 0, good: 0, fair: 0, poor: 0 };
  scores.forEach(function(s) {
    tiers[classifyScore(s)]++;
  });

  var buckets = [
    { range: "0–20", lo: 0, hi: 20 },
    { range: "20–40", lo: 20, hi: 40 },
    { range: "40–60", lo: 40, hi: 60 },
    { range: "60–80", lo: 60, hi: 80 },
    { range: "80–100", lo: 80, hi: 101 },
  ];
  var histogram = buckets.map(function(b) {
    return {
      range: b.range,
      count: scores.filter(function(s) { return s >= b.lo && s < b.hi; }).length,
    };
  });

  var maxCount = Math.max.apply(null, [1].concat(histogram.map(function(h) { return h.count; })));
  var bars = histogram.map(function(h) {
    var barH = Math.max(2, Math.round((h.count / maxCount) * 60));
    var color = h.range.startsWith("80") ? "#22c55e" : h.range.startsWith("60") ? "#f59e0b" : "#ef4444";
    return '<div style="display:flex;flex-direction:column;align-items:center;gap:4px;flex:1">' +
      '<span style="font-size:.7rem;font-weight:600">' + h.count + '</span>' +
      '<div style="width:100%;max-width:40px;height:' + barH + 'px;background:' + color + ';border-radius:3px 3px 0 0;opacity:.85" title="' + h.range + ': ' + h.count + ' dimensions"></div>' +
      '<span style="font-size:.6rem;color:var(--yry-text3)">' + h.range + '</span>' +
      '</div>';
  }).join("");

  return '<div class="h-section">' +
    '<h2>📊 评分分布分析</h2>' +
    '<div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:12px">' +
    '<div style="padding:12px;background:var(--bg1);border-radius:6px">' +
    '<div style="font-size:.72rem;color:var(--yry-text3);margin-bottom:8px">统计摘要</div>' +
    '<div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;font-size:.78rem">' +
    '<div>均值: <b>' + dist.mean + '</b></div>' +
    '<div>中位数: <b>' + dist.median + '</b></div>' +
    '<div>标准差: <b>' + dist.stddev + '</b></div>' +
    '<div>范围: <b>' + dist.min + '–' + dist.max + '</b></div>' +
    '<div>P25: <b>' + dist.p25 + '</b></div>' +
    '<div>P75: <b>' + dist.p75 + '</b></div>' +
    '</div></div>' +
    '<div style="padding:12px;background:var(--bg1);border-radius:6px">' +
    '<div style="font-size:.72rem;color:var(--yry-text3);margin-bottom:8px">等级分布</div>' +
    '<div style="display:flex;gap:12px;align-items:center;justify-content:center;height:60px">' +
    '<div style="text-align:center"><div style="font-size:1.4rem;font-weight:700;color:#22c55e">' + tiers.excellent + '</div><div style="font-size:.65rem;color:var(--yry-text3)">优秀≥90</div></div>' +
    '<div style="text-align:center"><div style="font-size:1.4rem;font-weight:700;color:#22c55e">' + tiers.good + '</div><div style="font-size:.65rem;color:var(--yry-text3)">良好≥75</div></div>' +
    '<div style="text-align:center"><div style="font-size:1.4rem;font-weight:700;color:#f59e0b">' + tiers.fair + '</div><div style="font-size:.65rem;color:var(--yry-text3)">一般≥60</div></div>' +
    '<div style="text-align:center"><div style="font-size:1.4rem;font-weight:700;color:#ef4444">' + tiers.poor + '</div><div style="font-size:.65rem;color:var(--yry-text3)">需关注&lt;60</div></div>' +
    '</div></div>' +
    '</div>' +
    '<div style="padding:12px;background:var(--bg1);border-radius:6px">' +
    '<div style="font-size:.72rem;color:var(--yry-text3);margin-bottom:8px">分值分布直方图</div>' +
    '<div style="display:flex;align-items:flex-end;gap:4px;padding:8px 0">' + bars + '</div>' +
    '</div>' +
    '</div>';
}

/**
 * Build cross-report correlation section.
 * Combines health, component, diagnostic, and architecture scores
 * into a Unified Project Health Index (UPHI).
 */
export function buildCrossReportSection(hr, archResult, compScores) {
  var healthScore = hr.composite || 0;

  var compAll = compScores
    ? (compScores.skills || []).concat(compScores.agents || [], compScores.rules || [], compScores.scripts || [])
    : [];
  var compAvg = compAll.length > 0 ? avgScore(compAll) : null;

  var diagTriggered = (hr.diagnostics && hr.diagnostics.triggered && hr.diagnostics.triggered.length) || 0;
  var diagScore = Math.max(0, 100 - diagTriggered * 15);

  var archScore = (archResult && archResult.archComposite != null) ? archResult.archComposite
    : (archResult && archResult.composite != null) ? archResult.composite : null;

  var indices = [{ label: "运营健康", score: healthScore, weight: 0.4 }];
  if (compAvg !== null) indices.push({ label: "组件质量", score: compAvg, weight: 0.25 });
  indices.push({ label: "诊断健康", score: diagScore, weight: 0.2 });
  if (archScore !== null) indices.push({ label: "架构合规", score: archScore, weight: 0.15 });

  var totalWeight = indices.reduce(function(s, i) { return s + i.weight; }, 0);
  var unifiedIndex = indices.length > 0
    ? Math.round(indices.reduce(function(s, i) { return s + i.score * i.weight; }, 0) / totalWeight)
    : healthScore;

  function getUG(s) { return s >= 90 ? "A" : s >= 75 ? "B" : s >= 60 ? "C" : "D"; }
  var unifiedGrade = getUG(unifiedIndex);
  var gradeColor = unifiedGrade === "A" || unifiedGrade === "B" ? "#22c55e" : unifiedGrade === "C" ? "#f59e0b" : "#ef4444";

  var indexCards = indices.map(function(i) {
    var color = i.score >= 90 ? "#22c55e" : i.score >= 75 ? "#22c55e" : i.score >= 60 ? "#f59e0b" : "#ef4444";
    return '<div style="text-align:center;padding:12px;background:var(--bg1);border-radius:6px;flex:1;min-width:120px">' +
      '<div style="font-size:1.6rem;font-weight:700;color:' + color + '">' + i.score + '</div>' +
      '<div style="font-size:.75rem;color:var(--yry-text2)">' + i.label + '</div>' +
      '<div style="font-size:.65rem;color:var(--yry-text3)">权重 ' + Math.round(i.weight * 100) + '%</div>' +
      '</div>';
  }).join("");

  var notes = [];
  if (compAvg !== null && Math.abs(healthScore - compAvg) > 20) {
    notes.push('运营健康 (' + healthScore + ') 与组件质量 (' + compAvg + ') 偏差 ' + Math.abs(healthScore - compAvg) + ' 分，需关注评分口径差异');
  }
  if (diagTriggered >= 3) {
    notes.push(diagTriggered + ' 个诊断被触发，诊断健康度偏低 (' + diagScore + ')，建议优先处理诊断告警');
  }

  return '<div class="h-section">' +
    '<h2>🔗 综合项目健康指数 (UPHI) <span style="font-size:.78rem;color:var(--yry-text3);font-weight:400;margin-left:8px">跨维度统一评分</span></h2>' +
    '<div style="margin-bottom:12px;padding:16px;background:var(--bg2);border-radius:8px;border:1px solid var(--border2);text-align:center">' +
    '<div style="font-size:.75rem;color:var(--yry-text3);margin-bottom:4px">统一项目健康指数</div>' +
    '<div style="font-size:3rem;font-weight:700;color:' + gradeColor + '">' + unifiedIndex + '</div>' +
    '<div style="font-size:1rem;color:var(--yry-text2)">' + unifiedGrade + ' 级 · ' + (unifiedGrade === "A" ? "优秀" : unifiedGrade === "B" ? "良好" : unifiedGrade === "C" ? "一般" : "需关注") + '</div>' +
    '</div>' +
    '<div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:12px">' + indexCards + '</div>' +
    (notes.length > 0 ? '<div style="padding:10px;background:rgba(245,158,11,.08);border-radius:6px;border:1px solid rgba(245,158,11,.15)">' +
      notes.map(function(n) { return '<div style="font-size:.75rem;color:var(--yry-text2);margin:4px 0">🔍 ' + n + '</div>'; }).join("") +
    '</div>' : "") +
    '<div style="margin-top:8px;font-size:.68rem;color:var(--yry-text3)">UPHI = 运营健康×40% + 组件质量×25% + 诊断健康×20% + 架构合规×15%</div>' +
    '</div>';
}

// ── SVG visualization sections ──────────────────────────────────

/**
 * Build SVG radar/spider chart for dimension category scores.
 * Pure SVG, no external dependencies.
 *
 * @param {object} catScores - { [category]: { score, weight, dimCount } }
 * @param {object} catLabels - { [category]: label }
 * @returns {string} HTML with inline SVG
 */
export function buildRadarChart(catScores, catLabels) {
  var cats = Object.entries(catScores).filter(function(e) { return e[1].dimCount > 0; });
  if (cats.length < 3) return "";

  var cx = 150, cy = 150, r = 110;
  var n = cats.length;
  var angleStep = (2 * Math.PI) / n;
  var startAngle = -Math.PI / 2; // Start from top

  // Grid rings at 25%, 50%, 75%, 100%
  var rings = [0.25, 0.5, 0.75, 1.0];
  var ringPaths = rings.map(function(frac) {
    var points = [];
    for (var i = 0; i < n; i++) {
      var a = startAngle + i * angleStep;
      points.push((cx + r * frac * Math.cos(a)).toFixed(1) + ',' + (cy + r * frac * Math.sin(a)).toFixed(1));
    }
    return '<polygon points="' + points.join(' ') + '" fill="none" stroke="var(--border2)" stroke-width="0.5" />';
  }).join("\n");

  // Axis lines
  var axisLines = cats.map(function(_, i) {
    var a = startAngle + i * angleStep;
    var x = (cx + r * Math.cos(a)).toFixed(1);
    var y = (cy + r * Math.sin(a)).toFixed(1);
    return '<line x1="' + cx + '" y1="' + cy + '" x2="' + x + '" y2="' + y + '" stroke="var(--border2)" stroke-width="0.5" />';
  }).join("\n");

  // Score polygon
  var scorePoints = cats.map(function(e, i) {
    var frac = e[1].score / 100;
    var a = startAngle + i * angleStep;
    return (cx + r * frac * Math.cos(a)).toFixed(1) + ',' + (cy + r * frac * Math.sin(a)).toFixed(1);
  }).join(' ');

  var scoreColor = cats.reduce(function(s, e) { return s + e[1].score; }, 0) / cats.length >= 80 ? '#22c55e' :
    cats.reduce(function(s, e) { return s + e[1].score; }, 0) / cats.length >= 60 ? '#f59e0b' : '#ef4444';

  // Labels
  var labels = cats.map(function(e, i) {
    var a = startAngle + i * angleStep;
    var labelR = r + 25;
    var lx = (cx + labelR * Math.cos(a)).toFixed(1);
    var ly = (cy + labelR * Math.sin(a)).toFixed(1);
    var anchor = Math.abs(Math.cos(a)) < 0.3 ? 'middle' : Math.cos(a) > 0 ? 'start' : 'end';
    var label = (catLabels && catLabels[e[0]]) || e[0];
    return '<text x="' + lx + '" y="' + ly + '" text-anchor="' + anchor + '" dominant-baseline="central" fill="var(--yry-text2)" font-size="11" font-weight="600">' + label + '</text>' +
      '<text x="' + lx + '" y="' + (parseFloat(ly) + 14) + '" text-anchor="' + anchor + '" dominant-baseline="central" fill="var(--yry-text3)" font-size="10">' + e[1].score + '分</text>';
  }).join("\n");

  // Score dots
  var dots = cats.map(function(e, i) {
    var frac = e[1].score / 100;
    var a = startAngle + i * angleStep;
    var dx = (cx + r * frac * Math.cos(a)).toFixed(1);
    var dy = (cy + r * frac * Math.sin(a)).toFixed(1);
    return '<circle cx="' + dx + '" cy="' + dy + '" r="3" fill="' + scoreColor + '" stroke="var(--bg1)" stroke-width="1" />';
  }).join("\n");

  return '<div class="h-section">' +
    '<h2>🕸️ 维度雷达图 <span style="font-size:.78rem;color:var(--yry-text3);font-weight:400;margin-left:8px">分类评分概览</span></h2>' +
    '<div style="display:flex;justify-content:center;padding:16px 0">' +
    '<svg viewBox="0 0 300 300" width="100%" style="max-width:450px">' +
    ringPaths + axisLines +
    '<polygon points="' + scorePoints + '" fill="' + scoreColor + '" fill-opacity="0.15" stroke="' + scoreColor + '" stroke-width="1.5" />' +
    dots + labels +
    '</svg>' +
    '</div>' +
    '<div style="font-size:.68rem;color:var(--yry-text3);text-align:center">雷达图展示运营、结构、工程、质量四大维度的均衡性 · 覆盖面积越大越健康</div>' +
    '</div>';
}

/**
 * Build SVG heat map grid for dimension scores.
 * Rows = categories, cells = dimensions, color = score.
 *
 * @param {object} scores - { dimKey: score }
 * @param {object} dimensions - HEALTH_SCORING_DIMENSIONS
 * @returns {string} HTML
 */
export function buildHeatMap(scores, dimensions) {
  var catOrder = ["core", "structural", "engineering", "quality"];
  var catIcons = { core: "⚙️", structural: "📏", engineering: "🔧", quality: "🧩" };
  var catLabels = { core: "核心运营", structural: "结构健康", engineering: "工程成熟度", quality: "组件质量" };

  // Group dims by category
  var groups = {};
  for (var _i = 0; _i < catOrder.length; _i++) {
    groups[catOrder[_i]] = [];
  }
  for (var _a = 0, _b = Object.entries(dimensions); _a < _b.length; _a++) {
    var _c = _b[_a], dim = _c[0], cfg = _c[1];
    var cat = cfg.category || "other";
    if (!groups[cat]) groups[cat] = [];
    if (scores[dim] !== undefined) {
      groups[cat].push({ dim: dim, label: cfg.label, score: scores[dim] });
    }
  }

  var maxCols = 0;
  for (var _d = 0, _e = Object.values(groups); _d < _e.length; _d++) {
    var g = _e[_d];
    if (g.length > maxCols) maxCols = g.length;
  }

  function heatColor(score) {
    if (score >= 90) return '#22c55e';
    if (score >= 80) return '#4ade80';
    if (score >= 70) return '#facc15';
    if (score >= 60) return '#f59e0b';
    if (score >= 40) return '#f87171';
    return '#ef4444';
  }

  function heatBg(score) {
    if (score >= 90) return 'rgba(34,197,94,0.25)';
    if (score >= 80) return 'rgba(74,222,128,0.2)';
    if (score >= 70) return 'rgba(250,204,21,0.2)';
    if (score >= 60) return 'rgba(245,158,11,0.18)';
    if (score >= 40) return 'rgba(248,113,113,0.18)';
    return 'rgba(239,68,68,0.2)';
  }

  var rows = "";
  for (var _f = 0; _f < catOrder.length; _f++) {
    var cat = catOrder[_f];
    var dims = groups[cat];
    if (!dims || dims.length === 0) continue;
    var cells = "";
    for (var _g = 0; _g < dims.length; _g++) {
      var d = dims[_g];
      cells += '<div style="padding:6px 8px;background:' + heatBg(d.score) + ';border-radius:4px;text-align:center;min-width:70px" title="' + d.label + ': ' + d.score + ' 分">' +
        '<div style="font-size:.65rem;color:var(--yry-text3)">' + d.label + '</div>' +
        '<div style="font-size:.85rem;font-weight:700;color:' + heatColor(d.score) + '">' + d.score + '</div>' +
        '</div>';
    }
    rows += '<div style="display:flex;align-items:center;gap:8px;margin-bottom:8px">' +
      '<div style="min-width:80px;font-size:.75rem;font-weight:600;color:var(--yry-text2)">' + (catIcons[cat] || '') + ' ' + (catLabels[cat] || cat) + '</div>' +
      '<div style="display:flex;flex-wrap:wrap;gap:6px;flex:1">' + cells + '</div>' +
      '</div>';
  }

  return '<div class="h-section">' +
    '<h2>🔥 评分热力图 <span style="font-size:.78rem;color:var(--yry-text3);font-weight:400;margin-left:8px">维度×分类矩阵</span></h2>' +
    '<div style="padding:8px 0">' + rows + '</div>' +
    '<div style="display:flex;gap:12px;justify-content:center;margin-top:8px;font-size:.65rem;color:var(--yry-text3)">' +
    '<span>🟢 ≥90 优秀</span><span>🟡 ≥70 良好</span><span>🟠 ≥60 一般</span><span>🔴 &lt;60 需关注</span>' +
    '</div>' +
    '</div>';
}

// ── Dimension fix guidance and detail panel ─────────────────────

/**
 * Fix guidance: dimension → specific actionable recommendations.
 * Each entry lists what to check/fix when the dimension scores below threshold.
 */
var DIM_FIX_GUIDANCE = {
  token: {
    check: "检查 API_X_TOKEN 环境变量是否正确配置",
    fix: "在 CI/CD 环境变量或 .env 文件中设置 API_X_TOKEN",
    impact: "影响所有通知发送功能",
  },
  config: {
    check: "检查 .claude/skills/rui-bot/config.json 文件是否存在",
    fix: "运行 rui-init 或手动创建配置文件，配置至少一个机器人 webhook",
    impact: "影响企微通知路由和机器人选择",
  },
  robots: {
    check: "检查每个机器人的 webhook_url 或 webhook_url_env 配置",
    fix: "在企业微信后台获取 Webhook 地址，填入 config.json 的 robots 字段",
    impact: "影响消息投递成功率",
  },
  api: {
    check: "检查 API 端点可达性和 Token 有效性",
    fix: "确认 DEFAULT_API_URL 可访问，或配置自定义 api_url；验证 Token 未过期",
    impact: "阻断所有通知发送",
  },
  reports: {
    check: "检查 docs/健康报告/ 目录是否存在且包含近期报告",
    fix: "运行 node skills/rui-bot/send.mjs health --html 生成报告",
    impact: "影响健康监控可见性和趋势分析",
  },
  format: {
    check: "检查通知消息是否包含必需字段（emoji、story、skill、status）",
    fix: "发送通知时确保 msgType 和对应字段完整；参考 FIELD_EMOJI 配置",
    impact: "影响消息格式合规性和可读性",
  },
  diagnostics: {
    check: "检查 .memory/execution-memory.jsonl 是否有足够执行记录",
    fix: "正常执行 rui 管线积累执行记录；确保 MIN_EXEC_MEMORIES ≥ 3",
    impact: "影响 D0-D8 诊断准确性和问题发现能力",
  },
  git: {
    check: "检查未提交文件数和分支状态",
    fix: "提交或暂存未提交文件；确保在正确的功能分支上工作",
    impact: "影响代码可追溯性和协作效率",
  },
  security: {
    check: "检查代码中是否包含硬编码密钥、Token、密码",
    fix: "将所有凭据移至环境变量；使用 .gitignore 排除敏感文件；运行安全扫描",
    impact: "P0 安全问题，可能导致凭据泄露",
  },
  file_size: {
    check: "检查是否有超过 50KB 的大文件或文件数量异常增长",
    fix: "拆分大文件（>500行）；检查 CDN 资源是否误提交到源码仓库",
    impact: "影响仓库克隆速度和编辑器性能",
  },
  dep_analysis: {
    check: "检查是否有循环依赖、上帝模块（≥10 依赖）或孤立文件",
    fix: "打破循环依赖（提取共享接口）；减少上帝模块依赖；清理或归档孤立文件",
    impact: "影响代码可维护性和模块化程度",
  },
  em_testing: {
    check: "检查测试框架配置和测试用例数量",
    fix: "安装 vitest/jest；添加测试脚本到 package.json；编写单元测试覆盖核心逻辑",
    impact: "影响代码质量保障和回归风险",
  },
  em_types: {
    check: "检查 TypeScript 配置和类型严格性",
    fix: "添加 tsconfig.json 并启用 strict 模式；为核心模块添加类型声明",
    impact: "影响代码健壮性和 IDE 智能提示",
  },
  em_linting: {
    check: "检查 ESLint、Prettier、EditorConfig 配置",
    fix: "安装 ESLint + Prettier；添加 .editorconfig；在 CI 中强制执行检查",
    impact: "影响代码风格一致性和可读性",
  },
  em_cicd: {
    check: "检查 CI/CD 管线配置和工作流数量",
    fix: "在 .github/workflows/ 中添加测试和部署工作流；配置自动化检查",
    impact: "影响自动化程度和交付速度",
  },
  em_docs: {
    check: "检查 README.md、CLAUDE.md、docs/ 目录是否齐全",
    fix: "补充 README 项目说明；完善 CLAUDE.md 开发指南；建立 docs/ 文档目录",
    impact: "影响新人上手速度和知识传承",
  },
  em_deps: {
    check: "检查 lockfile 存在性和版本管理脚本",
    fix: "提交 lockfile 到仓库；添加 version/release 脚本；定期更新依赖",
    impact: "影响构建可复现性和依赖安全",
  },
  em_git: {
    check: "检查 .gitignore、.gitattributes、PR 模板配置",
    fix: "添加 .gitignore 排除构建产物；配置 .gitattributes 换行符处理；添加 PR 模板",
    impact: "影响协作规范和代码审查质量",
  },
  comp_qual: {
    check: "检查组件的 SKILL.md/AGENT.md 完整性和代码质量",
    fix: "补充缺失的 SKILL.md；完善 frontmatter；添加 Mermaid 图表；增加代码注释",
    impact: "影响 YrY 插件的可发现性和可用性",
  },
  notify: {
    check: "检查 .memory/notification-log.jsonl 中的投递成功率",
    fix: "核查失败通知的 error 信息；确认 API_X_TOKEN 有效；检查 webhook 配置正确",
    impact: "影响企微通知的可靠性和监控覆盖",
  },
};

/**
 * Build dimension detail panel for the HTML report.
 * Shows each dimension with its score, status, fix guidance, and trend.
 *
 * @param {object} hr - Health result
 * @param {object} dimHistory - From getDimensionHistory()
 * @returns {string} HTML
 */
export function buildDimensionDetailPanel(hr, dimHistory) {
  var scores = hr.scores || {};
  var entries = [];

  for (var _a = 0, _b = Object.entries(scores); _a < _b.length; _a++) {
    var _c = _b[_a], dim = _c[0], score = _c[1];
    var label = DIM_LABELS[dim] || dim;
    var guidance = DIM_FIX_GUIDANCE[dim] || null;
    var status = score >= 80 ? "pass" : score >= 60 ? "warn" : "fail";
    var statusIcon = score >= 80 ? "✅" : score >= 60 ? "⚠️" : "❌";
    var statusColor = score >= 80 ? "#22c55e" : score >= 60 ? "#f59e0b" : "#ef4444";
    var statusBg = score >= 80 ? "rgba(34,197,94,.12)" : score >= 60 ? "rgba(245,158,11,.12)" : "rgba(239,68,68,.12)";

    // Trend icon
    var trendHtml = "";
    if (dimHistory) {
      var dh = dimHistory[label] || [];
      if (dh.length >= 2) {
        var prev = dh[dh.length - 2];
        if (prev && prev.score !== undefined) {
          var diff = score - prev.score;
          if (diff > 5) trendHtml = '<span style="color:#22c55e;font-size:.75rem" title="上升 ' + diff + ' 分">↑' + diff + '</span>';
          else if (diff < -5) trendHtml = '<span style="color:#ef4444;font-size:.75rem" title="下降 ' + Math.abs(diff) + ' 分">↓' + Math.abs(diff) + '</span>';
          else trendHtml = '<span style="color:var(--yry-text3);font-size:.75rem">→</span>';
        }
      }
    }

    entries.push({
      dim: dim, label: label, score: score, status: status,
      icon: statusIcon, color: statusColor, bg: statusBg,
      trendHtml: trendHtml, guidance: guidance,
    });
  }

  // Sort: fail first, then warn, then pass
  entries.sort(function(a, b) { return a.score - b.score; });

  var rows = entries.map(function(e) {
    var guidanceHtml = "";
    if (e.guidance && e.score < 90) {
      guidanceHtml = '<div style="margin-top:6px;padding:8px;background:' + e.bg + ';border-radius:4px;font-size:.72rem">' +
        '<div><span style="color:var(--yry-text3)">🔍 检查: </span><span style="color:var(--yry-text2)">' + e.guidance.check + '</span></div>' +
        '<div><span style="color:var(--yry-text3)">🔧 修复: </span><span style="color:var(--yry-text2)">' + e.guidance.fix + '</span></div>' +
        '<div><span style="color:var(--yry-text3)">⚡ 影响: </span><span style="color:#f59e0b">' + e.guidance.impact + '</span></div>' +
        '</div>';
    } else if (e.score >= 90) {
      guidanceHtml = '<div style="margin-top:4px;font-size:.7rem;color:#22c55e">✅ 该维度健康，无需处理</div>';
    }

    var barW = Math.max(4, e.score);
    return '<div style="padding:12px;background:var(--bg1);border-radius:6px;border-left:3px solid ' + e.color + '">' +
      '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:4px">' +
      '<span style="font-weight:600;color:var(--yry-text2)">' + e.icon + ' ' + e.label + '</span>' +
      '<span style="display:flex;align-items:center;gap:8px">' + (e.trendHtml || '') + '<span style="font-size:1.1rem;font-weight:700;color:' + e.color + '">' + e.score + ' 分</span></span>' +
      '</div>' +
      '<div style="height:4px;background:var(--border2);border-radius:2px;margin-bottom:6px">' +
      '<div style="width:' + barW + '%;height:100%;background:' + e.color + ';border-radius:2px"></div>' +
      '</div>' +
      guidanceHtml +
      '</div>';
  }).join("");

  return '<div class="h-section">' +
    '<h2>🔍 维度诊断与修复指引 <span style="font-size:.78rem;color:var(--yry-text3);font-weight:400;margin-left:8px">' + entries.length + ' 项 · 按评分升序</span></h2>' +
    '<div style="display:flex;flex-direction:column;gap:8px">' + rows + '</div>' +
    '</div>';
}

// ── Score diff / change attribution ────────────────────────────

/**
 * Build score change attribution section comparing current vs previous.
 *
 * @param {object} hr - Current health result
 * @param {object|null} prev - Previous health entry from trend
 * @returns {string} HTML
 */
export function buildScoreDiffSection(hr, prev) {
  if (!prev || !prev.scores) return "";

  var currentScores = hr.scores || {};
  var prevScores = prev.scores || {};
  var currentComposite = hr.composite || 0;
  var prevComposite = prev.composite || 0;
  var diff = currentComposite - prevComposite;

  var diffIcon = diff > 2 ? '📈' : diff < -2 ? '📉' : '➡️';
  var diffColor = diff > 2 ? '#22c55e' : diff < -2 ? '#ef4444' : 'var(--yry-text2)';
  var diffSign = diff > 0 ? '+' : '';

  // Per-dimension changes
  var changes = [];
  var allDims = new Set();
  for (var _a = 0, _b = Object.keys(currentScores); _a < _b.length; _a++) { allDims.add(_b[_a]); }
  for (var _c = 0, _d = Object.keys(prevScores); _c < _d.length; _c++) { allDims.add(_d[_c]); }
  allDims.forEach(function(dim) {
    var curr = currentScores[dim];
    var prevVal = prevScores[dim];
    if (curr !== undefined && prevVal !== undefined && curr !== prevVal) {
      changes.push({ dim: dim, label: DIM_LABELS[dim] || dim, prev: prevVal, curr: curr, diff: curr - prevVal });
    }
  });
  changes.sort(function(a, b) { return Math.abs(b.diff) - Math.abs(a.diff); });

  var improved = changes.filter(function(c) { return c.diff > 0; });
  var declined = changes.filter(function(c) { return c.diff < 0; });

  var changeRows = changes.slice(0, 8).map(function(c) {
    var arrow = c.diff > 0 ? '↑' : '↓';
    var color = c.diff > 0 ? '#22c55e' : '#ef4444';
    return '<div style="display:flex;align-items:center;gap:8px;padding:4px 0;font-size:.78rem">' +
      '<span style="min-width:100px;color:var(--yry-text2)">' + c.label + '</span>' +
      '<span style="color:var(--yry-text3)">' + c.prev + '</span>' +
      '<span style="color:' + color + ';font-weight:600">' + arrow + Math.abs(c.diff) + '</span>' +
      '<span style="color:' + color + '">' + c.curr + '</span>' +
      '<div style="flex:1;height:3px;background:var(--border2);border-radius:2px">' +
      '<div style="width:' + Math.max(4, Math.abs(c.diff)) + '%;height:100%;background:' + color + ';border-radius:2px"></div>' +
      '</div>' +
      '</div>';
  }).join("");

  var prevDate = (prev.timestamp || '').slice(0, 10) || '?';

  return '<div class="h-section">' +
    '<h2>' + diffIcon + ' 评分变化归因 <span style="font-size:.78rem;color:var(--yry-text3);font-weight:400;margin-left:8px">对比 ' + prevDate + '</span></h2>' +
    '<div style="margin-bottom:12px;padding:12px;background:var(--bg2);border-radius:6px;border:1px solid var(--border2);display:flex;align-items:center;gap:16px">' +
    '<div style="text-align:center">' +
    '<div style="font-size:2rem;font-weight:700;color:' + diffColor + '">' + diffSign + diff + '</div>' +
    '<div style="font-size:.68rem;color:var(--yry-text3)">综合变化</div>' +
    '</div>' +
    '<div style="text-align:center">' +
    '<div style="font-size:1.2rem;font-weight:700;color:#22c55e">' + improved.length + '</div>' +
    '<div style="font-size:.68rem;color:var(--yry-text3)">改善维度</div>' +
    '</div>' +
    '<div style="text-align:center">' +
    '<div style="font-size:1.2rem;font-weight:700;color:#ef4444">' + declined.length + '</div>' +
    '<div style="font-size:.68rem;color:var(--yry-text3)">退化维度</div>' +
    '</div>' +
    '<div style="text-align:center">' +
    '<div style="font-size:1.2rem;font-weight:700;color:var(--yry-text2)">' + (prevComposite) + ' → ' + currentComposite + '</div>' +
    '<div style="font-size:.68rem;color:var(--yry-text3)">' + prevDate + ' → 本次</div>' +
    '</div>' +
    '</div>' +
    (changeRows ? '<div style="padding:8px 0">' + changeRows + '</div>' : '') +
    (changes.length > 8 ? '<div style="font-size:.72rem;color:var(--yry-text3);text-align:center">还有 ' + (changes.length - 8) + ' 项变化未列出</div>' : '') +
    '</div>';
}

// ── Professional analysis sections ─────────────────────────────

/**
 * Build a Risk Matrix (probability × impact) for identified issues.
 * Categorizes risks into Critical/High/Medium/Low based on dimension scores
 * and diagnostic triggers.
 *
 * @param {object} hr - Health result with scores, diagnostics, structInfo
 * @returns {string} HTML
 */
export function buildRiskMatrix(hr) {
  var risks = [];

  // Dimension-based risks
  var scores = hr.scores || {};
  for (var _a = 0, _b = Object.entries(scores); _a < _b.length; _a++) {
    var _c = _b[_a], dim = _c[0], score = _c[1];
    if (score >= 80) continue;
    var label = DIM_LABELS[dim] || dim;
    var weight = DIM_WEIGHTS[dim] || 0;
    var probability = score < 40 ? "high" : score < 60 ? "medium" : "low";
    var impact = weight >= 10 ? "critical" : weight >= 5 ? "high" : "medium";
    risks.push({
      id: dim, label: label, category: "维度评分",
      probability: probability, impact: impact,
      score: score, detail: "当前得分 " + score + " 分，权重 " + weight + "%",
      mitigation: (DIM_FIX_GUIDANCE[dim] && DIM_FIX_GUIDANCE[dim].fix) || "检查并修复该维度相关问题",
    });
  }

  // Diagnostic-based risks
  if (hr.diagnostics && hr.diagnostics.triggered) {
    for (var _d = 0, _e = hr.diagnostics.triggered; _d < _e.length; _d++) {
      var diag = _e[_d];
      risks.push({
        id: diag.id, label: diag.label || diag.id, category: "诊断触发",
        probability: diag.confidence === "high" ? "high" : "medium",
        impact: diag.id === "D0" ? "critical" : diag.id === "D1" || diag.id === "D2" ? "high" : "medium",
        score: 0, detail: diag.evidence || "",
        mitigation: diag.suggestion || "参考诊断建议进行处理",
      });
    }
  }

  // Structural risks
  if (hr.structInfo) {
    var si = hr.structInfo;
    if (si.critFileCount > 0) {
      risks.push({
        id: "struct-crit", label: "巨型文件风险", category: "结构健康",
        probability: si.critFileCount > 3 ? "high" : "medium",
        impact: "high", score: si.score || 0,
        detail: si.critFileCount + " 个文件超过 1000 行，共 " + si.allLargeFileCount + " 个大文件",
        mitigation: "拆分巨型文件，提取共享逻辑到独立模块，遵循单一职责原则",
      });
    }
  }

  if (risks.length === 0) {
    return '<div class="h-section">' +
      '<h2>🎲 风险矩阵 <span style="font-size:.78rem;color:var(--yry-text3);font-weight:400;margin-left:8px">Risk Matrix</span></h2>' +
      '<div class="h-placeholder">✅ 未识别到显著风险 — 所有维度均处于健康状态</div>' +
      '</div>';
  }

  // Risk level mapping
  function riskLevel(prob, imp) {
    if (imp === "critical" && prob === "high") return { level: "P0", label: "严重", color: "#ef4444", bg: "rgba(239,68,68,.12)" };
    if (imp === "critical" || (imp === "high" && prob === "high")) return { level: "P1", label: "高", color: "#f97316", bg: "rgba(249,115,22,.12)" };
    if (imp === "high" || (imp === "medium" && prob === "high")) return { level: "P2", label: "中", color: "#f59e0b", bg: "rgba(245,158,11,.12)" };
    return { level: "P3", label: "低", color: "#3b82f6", bg: "rgba(59,130,246,.12)" };
  }

  // Sort by severity
  var priorityOrder = { P0: 0, P1: 1, P2: 2, P3: 3 };
  risks.sort(function(a, b) {
    var la = riskLevel(a.probability, a.impact);
    var lb = riskLevel(b.probability, b.impact);
    return (priorityOrder[la.level] || 4) - (priorityOrder[lb.level] || 4);
  });

  var p0Count = 0, p1Count = 0, p2Count = 0, p3Count = 0;
  var riskRows = risks.map(function(r) {
    var rl = riskLevel(r.probability, r.impact);
    if (rl.level === "P0") p0Count++;
    else if (rl.level === "P1") p1Count++;
    else if (rl.level === "P2") p2Count++;
    else p3Count++;

    var probLabel = { high: "高概率", medium: "中概率", low: "低概率" }[r.probability] || r.probability;
    var impLabel = { critical: "严重", high: "高", medium: "中", low: "低" }[r.impact] || r.impact;

    return '<div style="padding:14px;background:var(--bg1);border-radius:6px;border-left:3px solid ' + rl.color + ';margin-bottom:8px">' +
      '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px">' +
      '<div style="display:flex;align-items:center;gap:8px">' +
      '<span style="padding:3px 10px;border-radius:4px;font-size:.7rem;font-weight:700;background:' + rl.bg + ';color:' + rl.color + '">' + rl.level + ' ' + rl.label + '</span>' +
      '<span style="font-weight:600;color:var(--yry-text)">' + r.label + '</span>' +
      '<span style="font-size:.68rem;color:var(--yry-text3);padding:2px 6px;border-radius:3px;background:var(--bg2)">' + r.category + '</span>' +
      '</div>' +
      '<div style="display:flex;gap:8px;font-size:.68rem">' +
      '<span style="color:var(--yry-text3)">概率: <b style="color:' + (r.probability === "high" ? "#ef4444" : r.probability === "medium" ? "#f59e0b" : "#3b82f6") + '">' + probLabel + '</b></span>' +
      '<span style="color:var(--yry-text3)">影响: <b style="color:' + (r.impact === "critical" ? "#ef4444" : r.impact === "high" ? "#f97316" : "#f59e0b") + '">' + impLabel + '</b></span>' +
      '</div>' +
      '</div>' +
      '<div style="font-size:.78rem;color:var(--yry-text2);margin-bottom:4px">' + r.detail + '</div>' +
      '<div style="font-size:.74rem;color:#22c55e;padding:6px 8px;background:rgba(34,197,94,.06);border-radius:4px">💡 缓解措施: ' + r.mitigation + '</div>' +
      '</div>';
  }).join("");

  var summaryBar = '<div style="display:flex;gap:12px;margin-bottom:12px;flex-wrap:wrap">' +
    (p0Count > 0 ? '<span style="padding:6px 14px;background:rgba(239,68,68,.12);border:1px solid rgba(239,68,68,.2);border-radius:6px;font-size:.78rem;font-weight:600;color:#ef4444">🔴 P0 严重: ' + p0Count + '</span>' : '') +
    (p1Count > 0 ? '<span style="padding:6px 14px;background:rgba(249,115,22,.12);border:1px solid rgba(249,115,22,.2);border-radius:6px;font-size:.78rem;font-weight:600;color:#f97316">🟠 P1 高: ' + p1Count + '</span>' : '') +
    (p2Count > 0 ? '<span style="padding:6px 14px;background:rgba(245,158,11,.12);border:1px solid rgba(245,158,11,.2);border-radius:6px;font-size:.78rem;font-weight:600;color:#f59e0b">🟡 P2 中: ' + p2Count + '</span>' : '') +
    (p3Count > 0 ? '<span style="padding:6px 14px;background:rgba(59,130,246,.12);border:1px solid rgba(59,130,246,.2);border-radius:6px;font-size:.78rem;font-weight:600;color:#3b82f6">🔵 P3 低: ' + p3Count + '</span>' : '') +
    '</div>';

  return '<div class="h-section">' +
    '<h2>🎲 风险矩阵 <span style="font-size:.78rem;color:var(--yry-text3);font-weight:400;margin-left:8px">Probability × Impact · ' + risks.length + ' 项风险</span></h2>' +
    summaryBar +
    '<div style="padding:4px 0">' + riskRows + '</div>' +
    '<div style="font-size:.68rem;color:var(--yry-text3);margin-top:8px">风险等级 = 概率 × 影响 · P0: 立即处理 · P1: 24h内 · P2: 本周 · P3: 持续监控</div>' +
    '</div>';
}

/**
 * Build an Improvement Roadmap with prioritized actions and estimated timelines.
 *
 * @param {object} hr - Health result
 * @param {Array} recommendations - List of recommendation objects
 * @returns {string} HTML
 */
export function buildImprovementRoadmap(hr, recommendations) {
  if (!recommendations || recommendations.length === 0) {
    return '<div class="h-section">' +
      '<h2>🗺️ 改进路线图 <span style="font-size:.78rem;color:var(--yry-text3);font-weight:400;margin-left:8px">Improvement Roadmap</span></h2>' +
      '<div class="h-placeholder">✅ 当前无改进项 — 所有维度健康</div>' +
      '</div>';
  }

  // Categorize by timeline
  var immediate = []; // 0-24h: P0 items
  var shortTerm = [];  // 1-7 days: high priority
  var midTerm = [];    // 1-4 weeks: medium priority
  var longTerm = [];   // 1-3 months: low priority

  for (var _i = 0; _i < recommendations.length; _i++) {
    var r = recommendations[_i];
    if (r.priority === "high") {
      immediate.push(r);
    } else if (r.priority === "medium") {
      shortTerm.push(r);
    } else {
      midTerm.push(r);
    }
  }

  // Add dimension-based long-term improvements
  var scores = hr.scores || {};
  var dimsForLongTerm = [];
  for (var _a = 0, _b = Object.entries(scores); _a < _b.length; _a++) {
    var _c = _b[_a], dim = _c[0], score = _c[1];
    if (score >= 60 && score < 80 && DIM_FIX_GUIDANCE[dim]) {
      dimsForLongTerm.push({
        source: DIM_LABELS[dim] || dim,
        text: DIM_FIX_GUIDANCE[dim].fix || "优化该维度评分",
        priority: "low",
      });
    }
  }
  longTerm = longTerm.concat(dimsForLongTerm.slice(0, 3));

  function buildPhase(label, icon, color, timeline, items) {
    if (items.length === 0) return "";
    var itemHtml = items.map(function(r) {
      return '<div style="padding:10px 14px;background:rgba(15,23,42,.4);border-radius:6px;border:var(--yry-border);margin-bottom:6px">' +
        '<div style="font-size:.82rem;font-weight:600;color:var(--yry-text)">' + (r.source || '') + '</div>' +
        '<div style="font-size:.78rem;color:var(--yry-text2);margin-top:4px">' + (r.text || '') + '</div>' +
        '</div>';
    }).join("");

    return '<div style="margin-bottom:16px">' +
      '<div style="display:flex;align-items:center;gap:8px;margin-bottom:8px">' +
      '<span style="padding:4px 12px;border-radius:6px;font-size:.78rem;font-weight:700;background:' + color.replace(')', ',.12)').replace('rgb', 'rgba') + ';color:' + color + '">' + icon + ' ' + label + '</span>' +
      '<span style="font-size:.72rem;color:var(--yry-text3)">⏱️ ' + timeline + ' · ' + items.length + ' 项</span>' +
      '</div>' +
      itemHtml +
      '</div>';
  }

  var phases = buildPhase("立即行动", "🔴", "#ef4444", "0–24 小时", immediate) +
    buildPhase("短期计划", "🟠", "#f97316", "1–7 天", shortTerm) +
    buildPhase("中期规划", "🟡", "#f59e0b", "1–4 周", midTerm) +
    buildPhase("长期优化", "🔵", "#3b82f6", "1–3 月", longTerm);

  // Calculate potential score improvement
  var totalPotential = 0;
  if (immediate.length > 0) totalPotential += Math.min(15, immediate.length * 5);
  if (shortTerm.length > 0) totalPotential += Math.min(10, shortTerm.length * 3);
  if (midTerm.length > 0) totalPotential += Math.min(5, midTerm.length * 2);

  return '<div class="h-section">' +
    '<h2>🗺️ 改进路线图 <span style="font-size:.78rem;color:var(--yry-text3);font-weight:400;margin-left:8px">' + recommendations.length + ' 项改进 · 预计提升 ' + totalPotential + ' 分</span></h2>' +
    (totalPotential > 0 ? '<div style="padding:10px;background:rgba(34,197,94,.06);border-radius:6px;border:1px solid rgba(34,197,94,.15);margin-bottom:12px;font-size:.78rem;color:var(--yry-text2)">📈 完成全部改进后，预计综合评分可达 <b style="color:#22c55e">' + Math.min(100, (hr.composite || 0) + totalPotential) + ' 分</b>（当前 ' + (hr.composite || 0) + ' 分）</div>' : '') +
    phases +
    '</div>';
}

/**
 * Build a Key Metrics Dashboard with executive-level KPIs.
 *
 * @param {object} hr - Health result
 * @param {object} prev - Previous health entry
 * @param {object} healthTrend - Full health trend data
 * @returns {string} HTML
 */
export function buildKeyMetricsDashboard(hr, prev, healthTrend) {
  var scores = hr.scores || {};
  var trendLen = healthTrend ? healthTrend.length : 0;

  // KPI 1: System Availability (based on API + robots + config)
  var availabilityScore = Math.round(
    ((scores.api || 0) * 0.4 + (scores.robots || 0) * 0.3 + (scores.config || 0) * 0.3)
  );

  // KPI 2: Code Health Index (based on structure + deps + file_size)
  var codeHealthScore = Math.round(
    ((scores.file_size || 0) * 0.35 + (scores.dep_analysis || 0) * 0.35 + ((hr.structInfo && hr.structInfo.score) || 0) * 0.3)
  );

  // KPI 3: Security Posture (based on security + token)
  var securityScore = Math.round(
    ((scores.security || 0) * 0.5 + (scores.token || 0) * 0.5)
  );

  // KPI 4: Operational Maturity (based on reports + diagnostics + git + format)
  var opsMaturity = Math.round(
    ((scores.reports || 0) * 0.25 + (scores.diagnostics || 0) * 0.25 + (scores.git || 0) * 0.25 + (scores.format || 0) * 0.25)
  );

  // KPI 5: Engineering Maturity
  var emDims = ["em_testing", "em_types", "em_linting", "em_cicd", "em_docs", "em_deps", "em_git"];
  var emScores = emDims.map(function(d) { return scores[d]; }).filter(function(s) { return typeof s === "number"; });
  var engMaturity = emScores.length > 0 ? Math.round(emScores.reduce(function(a, b) { return a + b; }, 0) / emScores.length) : null;

  function kpiCard(label, value, icon, color, subtitle) {
    if (value === null || value === undefined) return "";
    var c = color || (value >= 80 ? "#22c55e" : value >= 60 ? "#f59e0b" : "#ef4444");
    var grade = value >= 90 ? "A" : value >= 75 ? "B" : value >= 60 ? "C" : "D";
    return '<div style="text-align:center;padding:14px 12px;background:var(--bg1);border-radius:8px;border:1px solid var(--border2);flex:1;min-width:110px">' +
      '<div style="font-size:1.4rem;margin-bottom:4px">' + icon + '</div>' +
      '<div style="font-size:1.8rem;font-weight:700;color:' + c + '">' + value + '</div>' +
      '<div style="font-size:.68rem;color:var(--yry-text3);margin-top:2px">' + label + '</div>' +
      '<div style="font-size:.65rem;color:var(--yry-text3);margin-top:2px">' + grade + ' 级' + (subtitle ? ' · ' + subtitle : '') + '</div>' +
      '</div>';
  }

  // Trend indicators
  var trendIndicators = "";
  if (prev && prev.scores) {
    var prevAvail = Math.round(((prev.scores.api || 0) * 0.4 + (prev.scores.robots || 0) * 0.3 + (prev.scores.config || 0) * 0.3));
    var prevCode = Math.round(((prev.scores.file_size || 0) * 0.35 + (prev.scores.dep_analysis || 0) * 0.35 + ((prev.structScore) || 0) * 0.3));
    var prevSec = Math.round(((prev.scores.security || 0) * 0.5 + (prev.scores.token || 0) * 0.5));
    var prevOps = Math.round(((prev.scores.reports || 0) * 0.25 + (prev.scores.diagnostics || 0) * 0.25 + (prev.scores.git || 0) * 0.25 + (prev.scores.format || 0) * 0.25));

    var changes = [
      { label: "可用性", curr: availabilityScore, prev: prevAvail },
      { label: "代码健康", curr: codeHealthScore, prev: prevCode },
      { label: "安全态势", curr: securityScore, prev: prevSec },
      { label: "运维成熟度", curr: opsMaturity, prev: prevOps },
    ];

    trendIndicators = '<div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:8px;font-size:.68rem">' +
      changes.map(function(ch) {
        var d = ch.curr - ch.prev;
        var icon = d > 2 ? "↑" : d < -2 ? "↓" : "→";
        var color = d > 2 ? "#22c55e" : d < -2 ? "#ef4444" : "var(--yry-text3)";
        return '<span style="color:' + color + '">' + ch.label + ' ' + icon + Math.abs(d) + '</span>';
      }).join(' · ') +
      '</div>';
  }

  return '<div class="h-section">' +
    '<h2>📊 关键绩效指标 (KPI) <span style="font-size:.78rem;color:var(--yry-text3);font-weight:400;margin-left:8px">Executive Dashboard</span></h2>' +
    '<div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:8px">' +
    kpiCard("系统可用性", availabilityScore, "🟢", null, "API+机器人+配置") +
    kpiCard("代码健康度", codeHealthScore, "📐", null, "结构+依赖+体积") +
    kpiCard("安全态势", securityScore, "🛡️", null, "Token+扫描") +
    kpiCard("运维成熟度", opsMaturity, "⚙️", null, "报告+诊断+Git") +
    (engMaturity !== null ? kpiCard("工程成熟度", engMaturity, "🏗️", null, "7项工程实践") : "") +
    '</div>' +
    trendIndicators +
    '<div style="font-size:.65rem;color:var(--yry-text3);margin-top:8px">KPI 基于加权维度聚合计算 · 趋势对比上周期 · A≥90 B≥75 C≥60 D&lt;60</div>' +
    '</div>';
}

// ── Correlation matrix visualization ────────────────────────────

/**
 * Build correlation matrix heat map HTML.
 *
 * @param {{ matrix: number[][], labels: string[], insights: string[] }} corrData
 * @returns {string} HTML
 */
export function buildCorrelationMatrixHTML(corrData) {
  if (!corrData || !corrData.labels || corrData.labels.length < 3) return "";

  var labels = corrData.labels;
  var matrix = corrData.matrix;
  var n = labels.length;

  // Color function: red for negative, green for positive, intensity = |r|
  function corrColor(r) {
    var abs = Math.abs(r);
    if (r > 0) {
      if (abs >= 0.8) return 'rgba(34,197,94,' + (0.3 + abs * 0.7).toFixed(2) + ')';
      if (abs >= 0.5) return 'rgba(34,197,94,' + (0.15 + abs * 0.3).toFixed(2) + ')';
      return 'rgba(34,197,94,' + (abs * 0.2).toFixed(2) + ')';
    } else {
      if (abs >= 0.8) return 'rgba(239,68,68,' + (0.3 + abs * 0.7).toFixed(2) + ')';
      if (abs >= 0.5) return 'rgba(239,68,68,' + (0.15 + abs * 0.3).toFixed(2) + ')';
      return 'rgba(239,68,68,' + (abs * 0.2).toFixed(2) + ')';
    }
  }

  function textColor(r) {
    return Math.abs(r) >= 0.6 ? '#fff' : 'var(--yry-text2)';
  }

  // Header row
  var headerCells = '<th style="padding:4px 6px;font-size:.65rem;color:var(--yry-text3)"></th>';
  for (var _a = 0; _a < n; _a++) {
    headerCells += '<th style="padding:4px 6px;font-size:.6rem;color:var(--yry-text3);max-width:60px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap" title="' + labels[_a] + '">' + labels[_a].slice(0, 6) + '</th>';
  }

  // Data rows
  var rows = '';
  for (var i = 0; i < n; i++) {
    var cells = '<th style="padding:4px 6px;font-size:.6rem;color:var(--yry-text3);text-align:right;max-width:60px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap" title="' + labels[i] + '">' + labels[i].slice(0, 6) + '</th>';
    for (var j = 0; j < n; j++) {
      var r = matrix[i][j];
      var bg = i === j ? 'var(--bg2)' : corrColor(r);
      var tc = i === j ? 'var(--yry-text3)' : textColor(r);
      cells += '<td style="padding:3px 5px;text-align:center;font-size:.65rem;font-weight:' + (Math.abs(r) >= 0.7 ? '700' : '400') + ';background:' + bg + ';color:' + tc + ';border-radius:2px" title="' + labels[i] + ' × ' + labels[j] + ': r=' + r.toFixed(2) + '">' + (i === j ? '1' : r.toFixed(1)) + '</td>';
    }
    rows += '<tr>' + cells + '</tr>';
  }

  // Insights
  var insightsHTML = '';
  if (corrData.insights && corrData.insights.length > 0) {
    insightsHTML = '<div style="margin-top:12px;padding:10px;background:rgba(245,158,11,.08);border-radius:6px;border:1px solid rgba(245,158,11,.15)">' +
      '<div style="font-size:.72rem;color:var(--yry-text2);font-weight:600;margin-bottom:6px">🔍 相关性洞察</div>' +
      corrData.insights.map(function(ins) {
        return '<div style="font-size:.7rem;color:var(--yry-text2);margin:3px 0">• ' + ins + '</div>';
      }).join('') +
      '</div>';
  }

  return '<div class="h-section">' +
    '<h2>🔗 维度相关性矩阵 <span style="font-size:.78rem;color:var(--yry-text3);font-weight:400;margin-left:8px">Pearson r · ' + n + '×' + n + ' 维度</span></h2>' +
    '<div style="overflow-x:auto;padding:8px 0">' +
    '<table style="border-collapse:collapse;font-size:.65rem"><thead><tr>' + headerCells + '</tr></thead><tbody>' + rows + '</tbody></table>' +
    '</div>' +
    '<div style="display:flex;gap:16px;justify-content:center;margin-top:8px;font-size:.62rem;color:var(--yry-text3)">' +
    '<span>🟢 正相关 (r>0)</span><span>🔴 负相关 (r<0)</span><span>颜色深浅 = 相关强度</span><span>粗体 = |r|≥0.7</span>' +
    '</div>' +
    insightsHTML +
    '<div style="margin-top:8px;font-size:.62rem;color:var(--yry-text3);text-align:center">基于历史健康检查数据的 Pearson 相关系数矩阵 · 需 ≥3 对数据点方可计算</div>' +
    '</div>';
}

// ── Dimension influence ranking section ─────────────────────────

/**
 * Build dimension influence ranking HTML section.
 *
 * @param {Array} influence - From rankDimensionInfluence()
 * @returns {string} HTML
 */
export function buildInfluenceRankingSection(influence) {
  if (!influence || influence.length < 3) return "";

  var rows = influence.slice(0, 10).map(function(e, i) {
    var barW = Math.min(100, Math.round((e.influence / (influence[0]?.influence || 1)) * 100));
    var catIcon = { core: '⚙️', structural: '📏', engineering: '🔧', quality: '🧩' }[e.category] || '📌';
    var influenceColor = e.influence >= 20 ? '#ef4444' : e.influence >= 12 ? '#f59e0b' : '#22c55e';
    return '<div style="display:flex;align-items:center;gap:8px;padding:6px 0;font-size:.75rem;border-bottom:1px solid var(--border2)">' +
      '<span style="min-width:20px;color:var(--yry-text3)">' + (i + 1) + '</span>' +
      '<span style="min-width:16px">' + catIcon + '</span>' +
      '<span style="min-width:90px;color:var(--yry-text2);font-weight:500">' + e.label + '</span>' +
      '<span style="min-width:36px;text-align:right;font-weight:600;color:' + influenceColor + '">' + e.influence.toFixed(1) + '</span>' +
      '<div style="flex:1;height:4px;background:var(--border2);border-radius:2px">' +
      '<div style="width:' + barW + '%;height:100%;background:' + influenceColor + ';border-radius:2px"></div>' +
      '</div>' +
      '<span style="min-width:56px;text-align:right;font-size:.65rem;color:var(--yry-text3)">权重' + e.weight + '%</span>' +
      '<span style="min-width:40px;text-align:right;font-size:.65rem;color:var(--yry-text3)">' + e.currentScore + '分</span>' +
      '</div>';
  }).join("");

  var topCategory = influence[0]?.category || '';
  var catLabel = { core: '核心运营', structural: '结构健康', engineering: '工程成熟度', quality: '组件质量' }[topCategory] || topCategory;

  return '<div class="h-section">' +
    '<h2>📐 维度影响力排名 <span style="font-size:.78rem;color:var(--yry-text3);font-weight:400;margin-left:8px">Top ' + Math.min(10, influence.length) + ' · 综合权重+方差+缺口</span></h2>' +
    '<div style="margin-bottom:8px;padding:8px 12px;background:rgba(245,158,11,.06);border-radius:6px;font-size:.7rem;color:var(--yry-text2)">' +
    '💡 影响力 = 权重(40%) + 历史方差(30%) + 当前缺口(30%) · 排名靠前的维度对综合评分影响最大，改进优先级最高' +
    '</div>' +
    '<div style="padding:4px 0">' + rows + '</div>' +
    '<div style="margin-top:6px;font-size:.62rem;color:var(--yry-text3);text-align:center">' +
    '影响力最高类别: ' + catLabel + ' · ' + influence.filter(function(e) { return e.influence >= 15; }).length + ' 个高影响力维度 (≥15)' +
    '</div>' +
    '</div>';
}

// ── Executive summary section ───────────────────────────────────

/**
 * Build executive summary HTML for the report.
 *
 * @param {object} execData - From generateExecutiveSummary()
 * @param {number} composite - Composite score
 * @param {string} grade - Grade letter
 * @returns {string} HTML
 */
export function buildExecutiveSummaryHTML(execData, composite, grade) {
  if (!execData) return "";

  var gradeColor = grade === 'A' ? '#22c55e' : grade === 'B' ? '#22c55e' : grade === 'C' ? '#f59e0b' : '#ef4444';
  var gradeBg = grade === 'A' ? 'rgba(34,197,94,.08)' : grade === 'B' ? 'rgba(34,197,94,.06)' : grade === 'C' ? 'rgba(245,158,11,.08)' : 'rgba(239,68,68,.08)';

  var highlightsHTML = '';
  if (execData.highlights && execData.highlights.length > 0) {
    highlightsHTML = '<div style="display:flex;flex-wrap:wrap;gap:6px;margin-top:8px">' +
      execData.highlights.map(function(h) {
        var isWarning = h.indexOf('⚠️') >= 0;
        var bg = isWarning ? 'rgba(239,68,68,.08)' : 'rgba(34,197,94,.06)';
        var border = isWarning ? 'rgba(239,68,68,.25)' : 'rgba(34,197,94,.2)';
        return '<span style="padding:4px 10px;background:' + bg + ';border:1px solid ' + border + ';border-radius:4px;font-size:.7rem;color:var(--yry-text2)">' + h + '</span>';
      }).join('') +
      '</div>';
  }

  var risksHTML = '';
  if (execData.risks && execData.risks.length > 0) {
    risksHTML = '<div style="margin-top:8px;padding:8px 12px;background:rgba(239,68,68,.06);border-radius:6px;border:1px solid rgba(239,68,68,.15)">' +
      '<div style="font-size:.7rem;color:#ef4444;font-weight:600;margin-bottom:4px">⚠️ 风险提示</div>' +
      execData.risks.map(function(r) {
        return '<div style="font-size:.7rem;color:var(--yry-text2);margin:2px 0">• ' + r + '</div>';
      }).join('') +
      '</div>';
  }

  return '<div class="h-section" style="border-left:3px solid ' + gradeColor + ';background:' + gradeBg + '">' +
    '<h2>📋 执行摘要 <span style="font-size:.78rem;color:var(--yry-text3);font-weight:400;margin-left:8px">Executive Summary</span></h2>' +
    '<div style="font-size:.85rem;line-height:1.6;color:var(--yry-text2);padding:8px 0">' + execData.summary + '</div>' +
    highlightsHTML +
    risksHTML +
    '</div>';
}

// ── Score traceability panel ────────────────────────────────────

/**
 * Score methodology definitions for each dimension.
 * Documents the scoring formula, data sources, and check items.
 */
var SCORE_METHODOLOGY = {
  token:       { formula: 'API_X_TOKEN 环境变量存在 → 100分，否则 → 0分', source: 'process.env', checks: ['环境变量检查'] },
  config:      { formula: 'config.json 存在 + robots>0 → 100分；仅存在 → 60分；缺失 → 20分', source: '.claude/skills/rui-bot/config.json', checks: ['文件存在性', '机器人数量'] },
  robots:      { formula: '已配置webhook的机器人数 / 总机器人数 × 100', source: 'config.json robots字段', checks: ['webhook_url', 'webhook_url_env'] },
  api:         { formula: 'API POST 可达 → 100分；不可达 → 0分', source: 'HTTP POST 健康检查', checks: ['HTTP响应', '超时控制'] },
  reports:     { formula: '有索引+近期报告 → 100分；有索引+过期 → 60分；无索引 → 40分；目录缺失 → 0分', source: 'docs/健康报告/', checks: ['目录存在', '报告数量', '报告新鲜度'] },
  format:      { formula: '全部消息格式约束通过 → 100分；否则 max(0, 100 - 问题数×25)', source: 'FIELD_EMOJI 配置', checks: ['emoji字段', '必填字段完整性'] },
  diagnostics: { formula: 'max(0, 100 - 触发诊断数×15)', source: '.memory/execution-memory.jsonl', checks: ['D0-D8 8项诊断', '执行记忆数量'] },
  git:         { formula: 'clean → 100分；1-2问题 → 80分；3+问题 → 60分；20+未提交 → 40分', source: 'git status', checks: ['未提交数', '分支状态', '未推送提交'] },
  security:    { formula: '无发现 → 100分；1-2项 → 70分；3-5项 → 40分；6+项 → 20分', source: 'grep 模式扫描', checks: ['硬编码密钥', 'Token泄露', '密码明文'] },
  notify:      { formula: '无记录 → 100分；成功率≥95% → 90分；≥80% → 70分；≥50% → 40分；<50% → 20分', source: '.memory/notification-log.jsonl', checks: ['投递成功率', '平均重试次数'] },
  file_size:   { formula: '100 - 大文件数×10 - 警告文件×2 - 平均体积惩罚', source: 'lib/ 文件扫描', checks: ['文件数', '总体积', '大文件(>50KB)', '平均体积'] },
  dep_analysis:{ formula: '100 - 循环依赖×15 - 上帝模块×5 - 孤立文件×2 - 额外惩罚', source: 'import/export 解析', checks: ['循环依赖', '上帝模块(≥10依赖)', '孤立文件'] },
  em_testing:  { formula: '有框架+≥10用例 → 100分；有框架+少量 → 80分；仅框架或目录 → 60分；仅脚本 → 30分', source: 'package.json + tests/', checks: ['测试框架', '测试目录', '用例数量'] },
  em_types:    { formula: 'TS strict → 100分；TS宽松 → 70分；Flow/类型声明 → 40分', source: 'tsconfig.json', checks: ['TS配置', 'strict模式', '类型声明'] },
  em_linting:  { formula: 'ESLint+CI强制 → 100分；2+工具 → 80分；1+工具 → 60分', source: '.eslintrc* + .prettier*', checks: ['ESLint', 'Prettier', 'EditorConfig', 'CI集成'] },
  em_cicd:     { formula: '有工作流 → 100分；有CI配置 → 70分', source: '.github/workflows/', checks: ['GitHub Actions', 'GitLab CI', 'Jenkins'] },
  em_docs:     { formula: '3文档齐全 → 100分；2文档 → 80分；1文档 → 50分', source: '根目录文件扫描', checks: ['README.md', 'CLAUDE.md', 'docs/'] },
  em_deps:     { formula: 'lockfile+版本脚本 → 100分；仅有lockfile → 70分', source: 'package.json + lockfile', checks: ['lockfile', '版本管理脚本'] },
  em_git:      { formula: 'GitHub+2+项 → 100分；2+项 → 80分；仅.gitignore → 60分', source: '.git* 文件扫描', checks: ['.gitignore', '.gitattributes', 'PR模板'] },
  comp_qual:   { formula: '全部组件均分: Skills(40+60+60) 含 Agents + Rules + Scripts(40+60)', source: 'skills/ lib/ 扫描', checks: ['SKILL.md存在', 'frontmatter', '文档长度', '代码注释', '测试覆盖'] },
};

/**
 * Build score traceability panel HTML.
 *
 * @param {object} scores - { dimKey: score }
 * @returns {string} HTML
 */
export function buildScoreTraceabilityPanel(scores) {
  var entries = Object.entries(scores || {})
    .filter(function(e) { return SCORE_METHODOLOGY[e[0]] !== undefined; })
    .sort(function(a, b) { return a[1] - b[1]; }); // worst first

  if (entries.length === 0) return '';

  var rows = entries.map(function(e, i) {
    var dim = e[0], score = e[1];
    var method = SCORE_METHODOLOGY[dim];
    var label = DIM_LABELS[dim] || dim;
    var color = score >= 80 ? '#22c55e' : score >= 60 ? '#f59e0b' : '#ef4444';

    return '<details style="margin-bottom:6px;background:var(--bg1);border-radius:6px;padding:8px 12px">' +
      '<summary style="cursor:pointer;display:flex;align-items:center;gap:12px;font-size:.78rem">' +
      '<span style="min-width:90px;color:var(--yry-text2)">' + label + '</span>' +
      '<span style="min-width:36px;font-weight:700;color:' + color + '">' + score + '</span>' +
      '<span style="flex:1;height:3px;background:var(--border2);border-radius:2px">' +
      '<span style="display:block;width:' + Math.max(4, score) + '%;height:100%;background:' + color + ';border-radius:2px"></span>' +
      '</span>' +
      '</summary>' +
      '<div style="margin-top:8px;padding:8px;background:var(--bg2);border-radius:4px;font-size:.7rem">' +
      '<div style="margin-bottom:4px"><span style="color:var(--yry-text3)">📐 公式: </span><span style="color:var(--yry-text2)">' + method.formula + '</span></div>' +
      '<div style="margin-bottom:4px"><span style="color:var(--yry-text3)">📂 数据源: </span><span style="color:var(--yry-text2)">' + method.source + '</span></div>' +
      '<div><span style="color:var(--yry-text3)">✅ 检查项: </span><span style="color:var(--yry-text2)">' + (method.checks || []).join(' · ') + '</span></div>' +
      '</div>' +
      '</details>';
  }).join("");

  return '<div class="h-section">' +
    '<h2>🔬 评分溯源 <span style="font-size:.78rem;color:var(--yry-text3);font-weight:400;margin-left:8px">Score Traceability · ' + entries.length + ' 维度</span></h2>' +
    '<div style="margin-bottom:8px;font-size:.7rem;color:var(--yry-text3)">点击展开查看每个维度的评分公式、数据源和检查项详情</div>' +
    rows +
    '<div style="margin-top:8px;font-size:.62rem;color:var(--yry-text3);text-align:center">评分溯源按得分升序排列 · 所有评分均可通过数据源复现验证</div>' +
    '</div>';
}

/**
 * Build a forecast and projection panel showing predicted health trajectory.
 * Uses enhanced trend data for 7-day and 30-day projections with confidence intervals.
 *
 * @param {object} enhancedTrend - From buildEnhancedTrendAnalysis()
 * @param {object} hr - Current health result
 * @returns {string} HTML
 */
export function buildForecastPanel(enhancedTrend, hr) {
  if (!enhancedTrend || !enhancedTrend.forecast) return "";

  var forecast = enhancedTrend.forecast;
  var trend = enhancedTrend.trend;
  var velocity = enhancedTrend.velocity;
  var distribution = enhancedTrend.distribution;

  var forecastColor = trend.direction === "rising" ? "#22c55e"
    : trend.direction === "falling" ? "#ef4444" : "#f59e0b";
  var forecastIcon = trend.direction === "rising" ? "📈"
    : trend.direction === "falling" ? "📉" : "📊";

  // 7-day projection
  var day7Value = forecast.forecast || hr.composite;
  var day7Range = forecast.range || [day7Value - 5, day7Value + 5];
  var day7Change = day7Value - hr.composite;

  // 30-day projection (extrapolate)
  var day30Value = Math.round(day7Value + (trend.slopePerWeek || 0) * 3);
  day30Value = Math.max(0, Math.min(100, day30Value));
  var day30Change = day30Value - hr.composite;

  // Confidence assessment
  var confidenceLabel = trend.confidence === "high" ? "高置信度"
    : trend.confidence === "medium" ? "中等置信度" : "低置信度";
  var confidenceColor = trend.confidence === "high" ? "#22c55e"
    : trend.confidence === "medium" ? "#f59e0b" : "#ef4444";
  var confidenceNote = trend.confidence === "high"
    ? "数据充足，预测可靠，可作为决策依据"
    : trend.confidence === "medium"
    ? "数据量适中，预测方向可信，具体数值仅供参考"
    : "数据不足，预测仅供参考，建议积累更多数据后重新评估";

  // Risk assessment for projection
  var risks = [];
  if (trend.direction === "falling") {
    risks.push("评分持续下降，若不干预可能触发更多诊断告警");
  }
  if (velocity && velocity.accelerating && velocity.recent < 0) {
    risks.push("下降趋势正在加速，需立即采取纠正措施");
  }
  if (distribution && distribution.stddev > 10) {
    risks.push("评分波动较大(σ=" + distribution.stddev + ")，预测不确定性较高");
  }
  if (trend.r2 < 0.5) {
    risks.push("趋势拟合度低(R²=" + trend.r2 + ")，评分变化缺乏明确方向性");
  }

  var changeColor7 = day7Change > 0 ? "#22c55e" : day7Change < 0 ? "#ef4444" : "var(--yry-text2)";
  var changeColor30 = day30Change > 0 ? "#22c55e" : day30Change < 0 ? "#ef4444" : "var(--yry-text2)";

  return '<div class="h-section">' +
    '<h2>🔮 健康预测与投影 <span style="font-size:.78rem;color:var(--yry-text3);font-weight:400;margin-left:8px">Forecast & Projection</span></h2>' +
    '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:12px;margin-bottom:16px">' +
    '<div style="text-align:center;padding:16px;background:var(--bg1);border-radius:8px;border:1px solid var(--border2)">' +
    '<div style="font-size:2rem;margin-bottom:4px">' + forecastIcon + '</div>' +
    '<div style="font-size:.7rem;color:var(--yry-text3);margin-bottom:4px">趋势方向</div>' +
    '<div style="font-size:1rem;font-weight:700;color:' + forecastColor + '">' +
    (trend.direction === "rising" ? "上升" : trend.direction === "falling" ? "下降" : "稳定") +
    ' (' + (trend.slopePerWeek > 0 ? "+" : "") + trend.slopePerWeek + '/周)</div>' +
    '</div>' +
    '<div style="text-align:center;padding:16px;background:var(--bg1);border-radius:8px;border:1px solid var(--border2)">' +
    '<div style="font-size:.7rem;color:var(--yry-text3);margin-bottom:4px">7 天预测</div>' +
    '<div style="font-size:1.6rem;font-weight:700;color:' + forecastColor + '">' + day7Value + ' 分</div>' +
    '<div style="font-size:.72rem;color:' + changeColor7 + '">' + (day7Change > 0 ? "+" : "") + day7Change + ' 分</div>' +
    '<div style="font-size:.64rem;color:var(--yry-text3);margin-top:4px">区间: ' + day7Range[0] + '–' + day7Range[1] + ' 分</div>' +
    '</div>' +
    '<div style="text-align:center;padding:16px;background:var(--bg1);border-radius:8px;border:1px solid var(--border2)">' +
    '<div style="font-size:.7rem;color:var(--yry-text3);margin-bottom:4px">30 天投影</div>' +
    '<div style="font-size:1.6rem;font-weight:700;color:' + (day30Change > 0 ? "#22c55e" : "#ef4444") + '">' + day30Value + ' 分</div>' +
    '<div style="font-size:.72rem;color:' + changeColor30 + '">' + (day30Change > 0 ? "+" : "") + day30Change + ' 分</div>' +
    '<div style="font-size:.64rem;color:var(--yry-text3);margin-top:4px">基于当前趋势外推</div>' +
    '</div>' +
    '<div style="text-align:center;padding:16px;background:var(--bg1);border-radius:8px;border:1px solid var(--border2)">' +
    '<div style="font-size:.7rem;color:var(--yry-text3);margin-bottom:4px">预测置信度</div>' +
    '<div style="font-size:1.1rem;font-weight:700;color:' + confidenceColor + '">' + confidenceLabel + '</div>' +
    '<div style="font-size:.68rem;color:var(--yry-text3);margin-top:4px">R² = ' + trend.r2 + '</div>' +
    '<div style="font-size:.64rem;color:var(--yry-text3);margin-top:2px">' + confidenceNote + '</div>' +
    '</div>' +
    '</div>' +
    (risks.length > 0 ? '<div style="padding:12px;background:rgba(245,158,11,.06);border-radius:8px;border:1px solid rgba(245,158,11,.15);margin-bottom:8px">' +
    '<div style="font-size:.78rem;font-weight:600;color:#f59e0b;margin-bottom:6px">⚠️ 预测风险提示</div>' +
    risks.map(function(r) { return '<div style="font-size:.74rem;color:var(--yry-text2);margin:4px 0">• ' + r + '</div>'; }).join("") +
    '</div>' : '') +
    '<div style="font-size:.68rem;color:var(--yry-text3);text-align:center">预测基于历史健康趋势数据的线性回归模型 · 30天投影 = 7天预测 + 趋势外推 · 实际结果受代码变更、配置调整等因素影响</div>' +
    '</div>';
}

/**
 * Build a Technical Debt Quantification section.
 * Estimates the "cost" of current issues in terms of risk, effort, and score impact.
 * Translates dimension scores into concrete remediation estimates.
 *
 * @param {object} hr - Health result
 * @returns {string} HTML
 */
export function buildTechnicalDebtAnalysis(hr) {
  var scores = hr.scores || {};
  var structInfo = hr.structInfo || {};
  var depInfo = hr.depInfo || {};

  // Define debt items with remediation estimates
  var debtItems = [];

  // CI/CD missing
  if ((scores.em_cicd || 0) < 30) {
    debtItems.push({
      category: "工程基础设施",
      issue: "CI/CD 管线缺失",
      severity: "high",
      impact: "无自动化测试门禁和部署流水线，代码质量无法保证",
      effort: "2-4 小时",
      remediation: "在 .github/workflows/ 中添加 test.yml 和 deploy.yml，配置 vitest 自动运行和 lint 检查",
      scoreGain: "+60-80 分 (em_cicd)",
    });
  }

  // Bot configuration missing
  if ((scores.robots || 0) < 30) {
    debtItems.push({
      category: "运维配置",
      issue: "通知机器人未配置",
      severity: "high",
      impact: "健康告警、诊断触发、管线异常等无法推送通知，影响问题发现和响应速度",
      effort: "30 分钟",
      remediation: "在企业微信后台创建 Webhook 机器人，将 webhook_url 配置到 .claude/skills/rui-bot/config.json",
      scoreGain: "+80-100 分 (robots)",
    });
  }

  // Config health
  if ((scores.config || 0) < 40) {
    debtItems.push({
      category: "运维配置",
      issue: "配置文件不完整",
      severity: "medium",
      impact: "缺少必要的技能配置文件，部分功能可能无法正常启用",
      effort: "1-2 小时",
      remediation: "运行 rui-init 补全 .claude/skills/ 下的配置文件，确保每个技能有完整的 config.json",
      scoreGain: "+40-60 分 (config)",
    });
  }

  // Git discipline
  if ((scores.git || 0) < 60) {
    var uncommitted = hr.gitInfo ? hr.gitInfo.uncommitted : "?";
    debtItems.push({
      category: "开发规范",
      issue: "Git 仓库状态不洁 (" + uncommitted + " 个未提交文件)",
      severity: "medium",
      impact: "未提交文件影响代码可追溯性和分支隔离策略，增加协作冲突风险",
      effort: "15-30 分钟",
      remediation: "审查未提交文件，将源码文件提交到对应功能分支，将临时文件添加到 .gitignore",
      scoreGain: "+40-60 分 (git)",
    });
  }

  // Large files
  if (structInfo.critFileCount > 0 || structInfo.allLargeFileCount > 3) {
    debtItems.push({
      category: "代码结构",
      issue: "大文件问题 (" + (structInfo.critFileCount || 0) + " 个巨型 + " + ((structInfo.allLargeFileCount || 0) - (structInfo.critFileCount || 0)) + " 个大型)",
      severity: structInfo.critFileCount > 0 ? "high" : "medium",
      impact: "大文件降低代码可读性和可维护性，增加代码审查难度和合并冲突概率",
      effort: "4-8 小时",
      remediation: "将巨型文件(>1000行)按职责拆分为多个模块，提取共享逻辑到 lib/，遵循单一职责原则",
      scoreGain: "+10-20 分 (file_size)",
    });
  }

  // Architecture compliance
  if (hr.archResult && hr.archResult.archFailedDims && hr.archResult.archFailedDims.length > 0) {
    var failedDims = hr.archResult.archFailedDims;
    debtItems.push({
      category: "架构合规",
      issue: "架构合规失败 (" + failedDims.join("、") + ")",
      severity: "medium",
      impact: "架构合规是项目不可妥协底线，失败维度需要在下一迭代中修复",
      effort: "2-4 小时",
      remediation: "运行 node lib/arch-check.mjs --fix 自动修复可修复项，手动处理内核体积和 YAGNI 合规问题",
      scoreGain: "+5-12 分 (综合)",
    });
  }

  // Dependency issues
  if (depInfo.cycles && depInfo.cycles.length > 0) {
    debtItems.push({
      category: "代码结构",
      issue: "循环依赖 (" + depInfo.cycles.length + " 个)",
      severity: "high",
      impact: "循环依赖破坏模块边界，导致代码耦合、测试困难和重构风险",
      effort: "2-6 小时",
      remediation: "提取共享接口或抽象层打破循环，将双向依赖改为单向依赖",
      scoreGain: "+10-20 分 (dep_analysis)",
    });
  }

  if (debtItems.length === 0) {
    return '<div class="h-section">' +
      '<h2>🏗️ 技术债务分析 <span style="font-size:.78rem;color:var(--yry-text3);font-weight:400;margin-left:8px">Technical Debt</span></h2>' +
      '<div class="h-placeholder">✅ 未检测到显著技术债务 — 所有维度均处于健康状态</div>' +
      '</div>';
  }

  // Calculate total debt
  var highCount = debtItems.filter(function(d) { return d.severity === "high"; }).length;
  var mediumCount = debtItems.filter(function(d) { return d.severity === "medium"; }).length;
  var totalEffort = debtItems.reduce(function(s, d) {
    var match = d.effort.match(/(\d+)-(\d+)/);
    return s + (match ? (parseInt(match[1]) + parseInt(match[2])) / 2 : 2);
  }, 0);

  var debtRows = debtItems.map(function(d) {
    var sevColor = d.severity === "high" ? "#ef4444" : d.severity === "medium" ? "#f59e0b" : "#3b82f6";
    var sevBg = d.severity === "high" ? "rgba(239,68,68,.08)" : d.severity === "medium" ? "rgba(245,158,11,.08)" : "rgba(59,130,246,.08)";
    return '<div style="padding:14px;background:var(--bg1);border-radius:8px;border-left:3px solid ' + sevColor + ';margin-bottom:10px">' +
      '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px">' +
      '<div style="display:flex;align-items:center;gap:8px">' +
      '<span style="padding:2px 8px;border-radius:4px;font-size:.68rem;font-weight:700;background:' + sevBg + ';color:' + sevColor + '">' + (d.severity === "high" ? "严重" : d.severity === "medium" ? "中等" : "轻微") + '</span>' +
      '<span style="font-weight:600;color:var(--yry-text)">' + d.issue + '</span>' +
      '<span style="font-size:.68rem;color:var(--yry-text3);padding:2px 6px;background:var(--bg2);border-radius:4px">' + d.category + '</span>' +
      '</div>' +
      '<span style="font-size:.72rem;color:var(--yry-text3)">⏱️ ' + d.effort + '</span>' +
      '</div>' +
      '<div style="font-size:.78rem;color:var(--yry-text2);margin-bottom:6px">📋 ' + d.impact + '</div>' +
      '<div style="font-size:.76rem;color:#22c55e;padding:6px 10px;background:rgba(34,197,94,.06);border-radius:4px;margin-bottom:4px">🔧 <b>修复方案：</b>' + d.remediation + '</div>' +
      '<div style="font-size:.72rem;color:var(--yry-accent)">📈 预计提升：' + d.scoreGain + '</div>' +
      '</div>';
  }).join("");

  var totalPotentialGain = debtItems.reduce(function(s, d) {
    var match = d.scoreGain.match(/\+(\d+)-(\d+)/);
    return s + (match ? (parseInt(match[1]) + parseInt(match[2])) / 2 : 10);
  }, 0);

  return '<div class="h-section">' +
    '<h2>🏗️ 技术债务量化 <span style="font-size:.78rem;color:var(--yry-text3);font-weight:400;margin-left:8px">Technical Debt Quantification</span></h2>' +
    '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:12px;margin-bottom:16px">' +
    '<div style="text-align:center;padding:14px;background:rgba(239,68,68,.06);border-radius:8px;border:1px solid rgba(239,68,68,.15)">' +
    '<div style="font-size:1.8rem;font-weight:700;color:#ef4444">' + debtItems.length + '</div>' +
    '<div style="font-size:.7rem;color:var(--yry-text3)">债务项</div>' +
    '</div>' +
    '<div style="text-align:center;padding:14px;background:rgba(239,68,68,.06);border-radius:8px;border:1px solid rgba(239,68,68,.15)">' +
    '<div style="font-size:1.8rem;font-weight:700;color:#ef4444">' + highCount + '</div>' +
    '<div style="font-size:.7rem;color:var(--yry-text3)">严重项</div>' +
    '</div>' +
    '<div style="text-align:center;padding:14px;background:rgba(245,158,11,.06);border-radius:8px;border:1px solid rgba(245,158,11,.15)">' +
    '<div style="font-size:1.8rem;font-weight:700;color:#f59e0b">' + mediumCount + '</div>' +
    '<div style="font-size:.7rem;color:var(--yry-text3)">中等项</div>' +
    '</div>' +
    '<div style="text-align:center;padding:14px;background:rgba(59,130,246,.06);border-radius:8px;border:1px solid rgba(59,130,246,.15)">' +
    '<div style="font-size:1.8rem;font-weight:700;color:#3b82f6">~' + Math.round(totalEffort) + 'h</div>' +
    '<div style="font-size:.7rem;color:var(--yry-text3)">预计工时</div>' +
    '</div>' +
    '<div style="text-align:center;padding:14px;background:rgba(34,197,94,.06);border-radius:8px;border:1px solid rgba(34,197,94,.15)">' +
    '<div style="font-size:1.8rem;font-weight:700;color:#22c55e">+~' + Math.round(totalPotentialGain) + '</div>' +
    '<div style="font-size:.7rem;color:var(--yry-text3)">预计评分提升</div>' +
    '</div>' +
    '</div>' +
    '<div style="margin-bottom:8px;font-size:.78rem;color:var(--yry-text2);padding:10px;background:rgba(255,193,7,.04);border-radius:6px">📐 技术债务 = 当前评分与目标评分之间的差距 × 修复难度系数。以上估算基于行业标准修复速度和 YrY 项目实际代码结构。</div>' +
    debtRows +
    '<div style="font-size:.68rem;color:var(--yry-text3);text-align:center;margin-top:8px">工时估算基于熟练开发者单人操作 · 实际时间可能因代码复杂度、依赖关系和测试需求而有所不同</div>' +
    '</div>';
}
