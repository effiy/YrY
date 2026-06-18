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
  comp_qual:   { formula: '全部组件均分: Skills(40+60) + Agents(40+60) + Rules(40+60) + Scripts(40+60)', source: 'skills/ agents/ rules/ lib/ 扫描', checks: ['SKILL.md存在', 'frontmatter', '文档长度', '代码注释', '测试覆盖'] },
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
