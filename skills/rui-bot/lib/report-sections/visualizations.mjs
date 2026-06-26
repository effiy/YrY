/**
 * report-sections/visualizations — Pure SVG / chart builders.
 *
 * Each function emits inline SVG or HTML for a single chart in the report.
 * Pure (no I/O), no shared mutable state with other modules.
 */

import {
  COLOR_PASS, COLOR_WARN_ORANGE, COLOR_FAIL,
  heatHex, heatBgHex, scoreHex, escapeHtml,
} from "../report-styles.mjs";

/**
 * Build SVG radar/spider chart for dimension category scores.
 *
 * @param {Record<string, any>} catScores - { [category]: { score, weight, dimCount } }
 * @param {Record<string, string>} catLabels - { [category]: label }
 * @returns {string} HTML with inline SVG
 */
export function buildRadarChart(/** @type {Record<string, any>} */ catScores, /** @type {Record<string, string>} */ catLabels) {
  const cats = Object.entries(catScores).filter(e => e[1].dimCount > 0);
  if (cats.length < 3) return "";

  const cx = 150, cy = 150, r = 110;
  const n = cats.length;
  const angleStep = (2 * Math.PI) / n;
  const startAngle = -Math.PI / 2;

  const rings = [0.25, 0.5, 0.75, 1.0];
  const ringPaths = rings.map(frac => {
    const points = [];
    for (let i = 0; i < n; i++) {
      const a = startAngle + i * angleStep;
      points.push(`${(cx + r * frac * Math.cos(a)).toFixed(1)},${(cy + r * frac * Math.sin(a)).toFixed(1)}`);
    }
    return `<polygon points="${points.join(' ')}" fill="none" stroke="var(--border-faint)" stroke-width="0.5" />`;
  }).join("\n");

  const axisLines = cats.map((_, i) => {
    const a = startAngle + i * angleStep;
    const x = (cx + r * Math.cos(a)).toFixed(1);
    const y = (cy + r * Math.sin(a)).toFixed(1);
    return `<line x1="${cx}" y1="${cy}" x2="${x}" y2="${y}" stroke="var(--border-faint)" stroke-width="0.5" />`;
  }).join("\n");

  const scorePoints = cats.map((/** @type {any} */ e, /** @type {number} */ i) => {
    const frac = e[1].score / 100;
    const a = startAngle + i * angleStep;
    return `${(cx + r * frac * Math.cos(a)).toFixed(1)},${(cy + r * frac * Math.sin(a)).toFixed(1)}`;
  }).join(' ');

  const avgScore = cats.reduce((s, e) => s + e[1].score, 0) / cats.length;
  const scoreColor = avgScore >= 80 ? COLOR_PASS : avgScore >= 60 ? COLOR_WARN_ORANGE : COLOR_FAIL;

  const labels = cats.map((/** @type {any} */ e, /** @type {number} */ i) => {
    const a = startAngle + i * angleStep;
    const labelR = r + 25;
    const lx = (cx + labelR * Math.cos(a)).toFixed(1);
    const ly = (cy + labelR * Math.sin(a)).toFixed(1);
    const anchor = Math.abs(Math.cos(a)) < 0.3 ? 'middle' : Math.cos(a) > 0 ? 'start' : 'end';
    const label = (catLabels && catLabels[e[0]]) || e[0];
    return `<text x="${lx}" y="${ly}" text-anchor="${anchor}" dominant-baseline="central" fill="var(--yry-text-secondary)" font-size="11" font-weight="600">${escapeHtml(label)}</text>` +
      `<text x="${lx}" y="${parseFloat(ly) + 14}" text-anchor="${anchor}" dominant-baseline="central" fill="var(--yry-text-tertiary)" font-size="10">${e[1].score}分</text>`;
  }).join("\n");

  const dots = cats.map((/** @type {any} */ e, /** @type {number} */ i) => {
    const frac = e[1].score / 100;
    const a = startAngle + i * angleStep;
    const dx = (cx + r * frac * Math.cos(a)).toFixed(1);
    const dy = (cy + r * frac * Math.sin(a)).toFixed(1);
    return `<circle cx="${dx}" cy="${dy}" r="3" fill="${scoreColor}" stroke="var(--bg-canvas)" stroke-width="1" />`;
  }).join("\n");

  return `<div class="h-section">
<h2>🕸️ 维度雷达图 <span class="h-section-sub-inline">分类评分概览</span></h2>
<div class="h-rs-flex-center">
<svg viewBox="0 0 300 300" width="100%" class="h-rs-radar-svg">
${ringPaths}${axisLines}
<polygon points="${scorePoints}" fill="${scoreColor}" fill-opacity="0.15" stroke="${scoreColor}" stroke-width="1.5" />
${dots}${labels}
</svg>
</div>
<div class="h-rs-note-center">雷达图展示运营、结构、工程、质量四大维度的均衡性 · 覆盖面积越大越健康</div>
</div>`;
}

/**
 * Build SVG heat-map grid for dimension scores.
 * Rows = categories, cells = dimensions, color = score.
 *
 * @param {Record<string, number>} scores - { dimKey: score }
 * @param {Record<string, any>} dimensions - HEALTH_SCORING_DIMENSIONS
 * @returns {string} HTML
 */
export function buildHeatMap(/** @type {Record<string, number>} */ scores, /** @type {Record<string, any>} */ dimensions) {
  /** @type {string[]} */
  const catOrder = ["core", "structural", "engineering", "quality"];
  /** @type {Record<string, string>} */
  const catIcons = { core: "⚙️", structural: "📏", engineering: "🔧", quality: "🧩" };
  /** @type {Record<string, string>} */
  const catLabels = { core: "核心运营", structural: "结构健康", engineering: "工程成熟度", quality: "组件质量" };

  /** @type {Record<string, any[]>} */
  const groups = {};
  for (const cat of catOrder) groups[cat] = [];
  for (const [dim, cfg] of Object.entries(dimensions)) {
    const cat = cfg.category || "other";
    if (!groups[cat]) groups[cat] = [];
    if (scores[dim] !== undefined) {
      groups[cat].push({ dim, label: cfg.label, score: scores[dim] });
    }
  }

  const rows = catOrder
    .map((/** @type {string} */ cat) => {
      const dims = groups[cat] || [];
      if (!dims || dims.length === 0) return '';
      const cells = dims.map((/** @type {any} */ d) => {
        const bg = heatBgHex(d.score);
        const color = heatHex(d.score);
        return `<div class="h-rs-heat-cell" style="--heat-bg:${bg}" title="${escapeHtml(d.label)}: ${d.score} 分">
<div class="h-rs-heat-label">${escapeHtml(d.label)}</div>
<div class="h-rs-heat-val" style="--heat-color:${color}">${d.score}</div>
</div>`;
      }).join("");
      return `<div class="h-rs-flex-row">
<div class="h-rs-heat-row-label">${catIcons[cat] || ''} ${catLabels[cat] || cat}</div>
<div class="h-rs-heat-cells">${cells}</div>
</div>`;
    })
    .join("");

  return `<div class="h-section">
<h2>🔥 评分热力图 <span class="h-section-sub-inline">维度×分类矩阵</span></h2>
<div class="h-rs-pad-8">${rows}</div>
<div class="h-rs-corr-legend h-rs-mt8">
<span>🟢 ≥90 优秀</span><span>🟡 ≥70 良好</span><span>🟠 ≥60 一般</span><span>🔴 &lt;60 需关注</span>
</div>
</div>`;
}

/**
 * Build correlation matrix heat map HTML.
 *
 * @param {{ matrix: number[][], labels: string[], insights: string[] } | null} corrData
 * @returns {string} HTML
 */
export function buildCorrelationMatrixHTML(/** @type {any} */ corrData) {
  if (!corrData || !corrData.labels || corrData.labels.length < 3) return "";

  const { labels, matrix, insights } = corrData;
  const n = labels.length;

  const corrColor = (/** @type {number} */ r) => {
    const abs = Math.abs(r);
    const channel = r > 0 ? '34,197,94' : '239,68,68';
    if (abs >= 0.8) return `rgba(${channel},${(0.3 + abs * 0.7).toFixed(2)})`;
    if (abs >= 0.5) return `rgba(${channel},${(0.15 + abs * 0.3).toFixed(2)})`;
    return `rgba(${channel},${(abs * 0.2).toFixed(2)})`;
  };

  const textColor = (/** @type {number} */ r) => Math.abs(r) >= 0.6 ? '#fff' : 'var(--yry-text-secondary)';

  const headerCells = `<th class="h-rs-corr-th"></th>${labels.map((/** @type {string} */ lab) => `<th class="h-rs-corr-th-sm" title="${escapeHtml(lab)}">${escapeHtml(lab.slice(0, 6))}</th>`).join("")}`;

  const rows = labels.map((/** @type {string} */ _, /** @type {number} */ i) => {
    const cells = `<th class="h-rs-corr-th-right" title="${escapeHtml(labels[i])}">${escapeHtml(labels[i].slice(0, 6))}</th>` +
      labels.map((/** @type {string} */ _, /** @type {number} */ j) => {
        const r = matrix[i][j];
        const bg = i === j ? 'var(--bg-card)' : corrColor(r);
        const tc = i === j ? 'var(--yry-text-tertiary)' : textColor(r);
        const weight = Math.abs(r) >= 0.7 ? '700' : '400';
        const val = i === j ? '1' : r.toFixed(1);
        return `<td class="h-rs-corr-td" style="--corr-weight:${weight};--corr-bg:${bg};--corr-color:${tc}" title="${escapeHtml(labels[i])} × ${escapeHtml(labels[j])}: r=${r.toFixed(2)}">${val}</td>`;
      }).join("");
    return `<tr>${cells}</tr>`;
  }).join("");

  let insightsHTML = '';
  if (insights && insights.length > 0) {
    insightsHTML = `<div class="h-rs-corr-insights">
<div class="h-rs-corr-insight-title">🔍 相关性洞察</div>
${insights.map((/** @type {string} */ ins) => `<div class="h-rs-corr-insight">• ${escapeHtml(ins)}</div>`).join('')}
</div>`;
  }

  return `<div class="h-section">
<h2>🔗 维度相关性矩阵 <span class="h-section-sub-inline">Pearson r · ${n}×${n} 维度</span></h2>
<div class="h-rs-corr-matrix">
<table class="h-rs-corr-table"><thead><tr>${headerCells}</tr></thead><tbody>${rows}</tbody></table>
</div>
<div class="h-rs-corr-legend h-rs-mt8">
<span>🟢 正相关 (r>0)</span><span>🔴 负相关 (r<0)</span><span>颜色深浅 = 相关强度</span><span>粗体 = |r|≥0.7</span>
</div>
${insightsHTML}
<div class="h-rs-note-top">基于历史健康检查数据的 Pearson 相关系数矩阵 · 需 ≥3 对数据点方可计算</div>
</div>`;
}