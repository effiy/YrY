/**
 * report-sections — HTML section builders for health reports.
 * Extracted from health-report.mjs for module decomposition.
 */

import { DIM_LABELS, DIM_WEIGHTS } from "./report-constants.mjs";
import { PASS_THRESHOLD, WARN_THRESHOLD, scoreColor, scoreIcon, avgScore } from "./bot-health-analysis.mjs";
import { contributionAnalysis, scoreDistribution, classifyScore } from "../../../lib/scoring.mjs";

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

  var archScore = (archResult && archResult.composite != null) ? archResult.composite : null;

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
