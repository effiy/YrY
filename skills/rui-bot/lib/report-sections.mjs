/**
 * report-sections — HTML section builders for health reports.
 * Extracted from health-report.mjs for module decomposition.
 */

import { DIM_ICONS, DIM_LABELS, DIM_WEIGHTS } from "./report-constants.mjs";

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
    const barColor = e.score >= 80 ? "var(--yry-pass)" : e.score >= 60 ? "var(--yry-warn)" : "var(--yry-fail)";
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
  function sc(s){return s>=80?"var(--yry-pass)":s>=60?"var(--yry-warn)":"var(--yry-fail)"}
  function chip(s){return s>=80?'<span class="h-comp-chip pass">优秀</span>':s>=60?'<span class="h-comp-chip warn">一般</span>':'<span class="h-comp-chip fail">待改进</span>'}
  function tbl(items,showMeta){
    if(!items||!items.length)return'<div class="h-placeholder">暂无数据</div>';
    const s=[...items].sort((a,b)=>b.score-a.score);
    return`<table class="h-comp-table"><thead><tr><th>#</th><th>名称</th>${showMeta?'<th>属性</th>':''}<th>评分</th><th>等级</th></tr></thead><tbody>${s.map((x,i)=>{const m=[];if(x.hasSkillMd!==undefined)m.push(x.hasSkillMd?'📄':'❌SKILL.md');if(x.hasLib)m.push('📦lib');if(x.mjsCount>0)m.push('📜'+x.mjsCount);if(x.category)m.push('📂'+x.category);return`<tr><td class="h-comp-rank">${i+1}</td><td class="h-comp-name">${x.name}</td>${showMeta?`<td class="h-comp-meta">${m.join(' ')||'—'}</td>`:''}<td class="h-comp-score-cell"><div class="h-comp-score-bar"><div class="h-comp-score-fill" style="width:${x.score}%;background:${sc(x.score)}"></div></div><span class="h-comp-score-num" style="color:${sc(x.score)}">${x.score} 分</span></td><td>${chip(x.score)}</td></tr>`}).join('')}</tbody></table>`}
  const avg=a=>a.length?Math.round(a.reduce((p,c)=>p+c.score,0)/a.length):0;
  const all=[...(compScores.skills||[]),...(compScores.agents||[]),...(compScores.rules||[]),...(compScores.scripts||[])];
  const lo=all.filter(c=>c.score<60);
  return`<div class="h-section"><h2>📦 组件评分总览</h2><div class="h-comp-summary"><div class="h-comp-sum-item"><div class="h-comp-sum-val" style="color:${sc(avg(all))}">${avg(all)}</div><div class="h-comp-sum-lbl">综合均分 · ${all.length} 组件</div></div><div class="h-comp-sum-item"><div class="h-comp-sum-val" style="color:${sc(avg(compScores.skills))}">${avg(compScores.skills)}</div><div class="h-comp-sum-lbl">Skills · ${compScores.skills.length} 个</div></div><div class="h-comp-sum-item"><div class="h-comp-sum-val" style="color:${sc(avg(compScores.agents))}">${avg(compScores.agents)}</div><div class="h-comp-sum-lbl">Agents · ${compScores.agents.length} 个</div></div><div class="h-comp-sum-item"><div class="h-comp-sum-val" style="color:${sc(avg(compScores.rules))}">${avg(compScores.rules)}</div><div class="h-comp-sum-lbl">Rules · ${compScores.rules.length} 个</div></div><div class="h-comp-sum-item"><div class="h-comp-sum-val" style="color:${sc(avg(compScores.scripts))}">${avg(compScores.scripts)}</div><div class="h-comp-sum-lbl">Scripts · ${compScores.scripts.length} 个</div></div></div></div>${lo.length?`<div class="h-section" style="border-left:3px solid var(--yry-fail)"><h2>⚠️ 低分组件 <span style="font-size:.78rem;color:var(--yry-text3);font-weight:400;margin-left:8px">${lo.length} 个</span></h2><div class="h-rec-list">${lo.map(c=>`<div class="h-rec-item"><span class="h-rec-prio" style="color:var(--yry-fail)">🔴</span><div class="h-rec-body"><div class="h-rec-source">${c.name} · ${c.score} 分</div><div class="h-rec-text">${(c.recommendations||['补充完善']).join('；')}</div></div></div>`).join('')}</div></div>`:''}<div class="h-section"><h2>🤖 Skills <span style="font-size:.78rem;color:var(--yry-text3);font-weight:400;margin-left:8px">${compScores.skills.length} 个 · 均分 ${avg(compScores.skills)}</span></h2>${tbl(compScores.skills,true)}</div><div class="h-section"><h2>👥 Agents <span style="font-size:.78rem;color:var(--yry-text3);font-weight:400;margin-left:8px">${compScores.agents.length} 个 · 均分 ${avg(compScores.agents)}</span></h2>${tbl(compScores.agents,false)}</div><div class="h-section"><h2>📏 Rules <span style="font-size:.78rem;color:var(--yry-text3);font-weight:400;margin-left:8px">${compScores.rules.length} 个 · 均分 ${avg(compScores.rules)}</span></h2>${tbl(compScores.rules,false)}</div><div class="h-section"><h2>📜 Scripts <span style="font-size:.78rem;color:var(--yry-text3);font-weight:400;margin-left:8px">${compScores.scripts.length} 个 · 均分 ${avg(compScores.scripts)}</span></h2>${tbl(compScores.scripts,true)}</div>`;
}

export function buildStructureSection(hr) {
  const si = hr.structInfo;
  if (!si) return "";

  const score = si.score ?? 0;
  const icon = si.icon || "📐";
  const barColor = score >= 80 ? "var(--yry-pass)" : score >= 60 ? "var(--yry-warn)" : "var(--yry-fail)";

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
    const icon = gi.score >= 80 ? "✅" : gi.score >= 60 ? "⚠️" : "❌";
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
    const icon = si.score >= 80 ? "✅" : si.score >= 60 ? "⚠️" : "❌";
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
