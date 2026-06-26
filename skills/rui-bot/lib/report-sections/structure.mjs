/**
 * report-sections/structure — Repo structure, file-size, dependency sections.
 *
 *   - buildStructureSection       repo structure / 大文件 / 顶层模块
 *   - buildFileSizeSection       byte-size histogram / largest files / type breakdown
 *   - buildDependencySection     module dependency graph (Fan-in/out, cycles, orphans)
 *   - buildGitSecuritySection    git status + security findings (small panel)
 */

import { scoreColor, scoreIcon } from "../bot-health-analysis.mjs";
import {
  escapeHtml,
  STRUCTURE_THRESHOLDS, FILE_SIZE_THRESHOLDS, DEP_THRESHOLDS, COLOR_FAIL, COLOR_WARN_ORANGE, COLOR_PASS,
} from "../report-styles.mjs";
import { detailItem, placeholder } from "../report-templates.mjs";

function formatBytes(/** @type {number} */ bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

// ── Structure: file count, lines, large files, hot modules ───────

/**
 * Build repo structure section.
 *
 * @param {any} hr - health result with hr.structInfo
 * @returns {string} HTML
 */
export function buildStructureSection(/** @type {any} */ hr) {
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
      <div class="h-summary-val" style="--color:${si.critFileCount > 0 ? 'var(--yry-fail)' : si.allLargeFileCount > 0 ? 'var(--yry-warn)' : 'var(--yry-pass)'}">${si.allLargeFileCount || 0}</div>
      <div class="h-summary-lbl">大文件 ≥500 行${si.critFileCount > 0 ? ` (≥1000: ${si.critFileCount})` : ""}</div>
    </div>
    <div class="h-summary-item">
      <div class="h-summary-val" style="--color:${barColor}">${score}</div>
      <div class="h-summary-lbl">结构健康分</div>
    </div>
  </div>`;

  let filesHtml = "";
  if (si.largeFiles && si.largeFiles.length > 0) {
    const topFiles = si.largeFiles.slice(0, 5);
    const rows = topFiles.map((/** @type {any} */ f, /** @type {number} */ i) => {
      const tier = f.lines >= STRUCTURE_THRESHOLDS.GIANT_LINES ? "fail" : "warn";
      const tierLabel = f.lines >= STRUCTURE_THRESHOLDS.GIANT_LINES ? "巨型" : "大型";
      const tierColor = f.lines >= STRUCTURE_THRESHOLDS.GIANT_LINES ? COLOR_FAIL : COLOR_WARN_ORANGE;
      const pct = Math.min(100, (f.lines / 2000) * 100);
      return `<tr class="h-struct-row">
        <td class="h-struct-rank">${i + 1}</td>
        <td class="h-struct-path" title="${escapeHtml(f.path)}">${escapeHtml(f.path)}</td>
        <td class="h-struct-ext">${escapeHtml(f.ext || "—")}</td>
        <td class="h-struct-lines h-rs-mono">${f.lines.toLocaleString()}</td>
        <td class="h-struct-bar-cell"><div class="h-struct-bar"><div class="h-struct-bar-fill" style="--w:${pct}%;--color:${tierColor}"></div></div></td>
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
    filesHtml = placeholder("✅ 未发现 ≥500 行的大文件");
  }

  let modulesHtml = "";
  if (si.modules && si.modules.length > 0) {
    const topMods = si.modules.slice(0, 5);
    const rows = topMods.map((/** @type {any} */ m, /** @type {number} */ i) => {
      const hot = m.lines >= STRUCTURE_THRESHOLDS.HOT_MODULE_LINES || m.fileCount >= STRUCTURE_THRESHOLDS.HOT_MODULE_FILES;
      const pct = Math.min(100, (m.lines / 10000) * 100);
      const mBarColor = hot ? COLOR_WARN_ORANGE : COLOR_PASS;
      return `<tr>
        <td class="h-struct-rank">${i + 1}</td>
        <td class="h-struct-path"><strong>${escapeHtml(m.name)}</strong></td>
        <td class="h-struct-lines">${m.fileCount}</td>
        <td class="h-struct-lines h-rs-mono">${m.lines.toLocaleString()}</td>
        <td class="h-struct-lines">${m.avgLines}</td>
        <td class="h-struct-bar-cell"><div class="h-struct-bar"><div class="h-struct-bar-fill" style="--w:${pct}%;--color:${mBarColor}"></div></div></td>
        <td class="h-struct-max" title="${escapeHtml(m.maxFile)}">${m.maxLines.toLocaleString()} 行</td>
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
    <h2>📐 结构健康 <span class="h-section-sub-inline">${escapeHtml(icon)} ${escapeHtml(si.summary || "")}</span></h2>
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

// ── File size distribution / largest files ───────────────────────

/**
 * Build file size analysis section.
 *
 * @param {any} hr - health result with hr.fileSizeInfo
 */
export function buildFileSizeSection(/** @type {any} */ hr) {
  const fi = hr.fileSizeInfo;
  if (!fi) return "";

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
      <div class="h-summary-val" style="--color:${fi.growthPct !== null ? (fi.growthPct > 10 ? 'var(--yry-fail)' : fi.growthPct > 5 ? 'var(--yry-warn)' : 'var(--yry-pass)') : 'var(--yry-text2)'}">${fi.growthPct !== null ? (fi.growthPct > 0 ? '+' : '') + fi.growthPct + '%' : '—'}</div>
      <div class="h-summary-lbl">体积变化</div>
    </div>
  </div>`;

  const distHtml = fi.bucketCounts.map((/** @type {any} */ b) => {
    const barW = Math.max(2, Math.round((b.count / Math.max(1, fi.totalFiles)) * 100));
    return `<div class="h-comp-row">
      <span class="h-comp-label">${escapeHtml(b.label)}</span>
      <span class="h-comp-score" style="--color:var(--yry-text2)">${b.count} 文件</span>
      <div class="h-comp-bar-wrap"><div class="h-comp-bar-inner" style="--w:${barW}%;--color:var(--yry-cyan)"></div></div>
      <span class="h-comp-val">${barW}%</span>
    </div>`;
  }).join("");

  let largestHtml = "";
  if (fi.largestFiles && fi.largestFiles.length > 0) {
    const topFiles = fi.largestFiles.slice(0, 10);
    const rows = topFiles.map((/** @type {any} */ f, /** @type {number} */ i) => {
      const tier = f.bytes >= FILE_SIZE_THRESHOLDS.GIANT_BYTES ? "fail" : f.bytes >= FILE_SIZE_THRESHOLDS.LARGE_BYTES ? "warn" : "pass";
      const tierLabel = f.bytes >= FILE_SIZE_THRESHOLDS.GIANT_BYTES ? "巨型" : f.bytes >= FILE_SIZE_THRESHOLDS.LARGE_BYTES ? "大型" : "正常";
      const tierColor = f.bytes >= FILE_SIZE_THRESHOLDS.GIANT_BYTES ? COLOR_FAIL : f.bytes >= FILE_SIZE_THRESHOLDS.LARGE_BYTES ? COLOR_WARN_ORANGE : COLOR_PASS;
      const pct = Math.min(100, (f.bytes / Math.max(1, fi.largestFiles[0]?.bytes || 1)) * 100);
      return `<tr>
        <td class="h-struct-rank">${i + 1}</td>
        <td class="h-struct-path" title="${escapeHtml(f.path)}">${escapeHtml(f.path)}</td>
        <td class="h-struct-ext">${escapeHtml(f.ext || "—")}</td>
        <td class="h-struct-lines h-rs-mono">${formatBytes(f.bytes)}</td>
        <td class="h-struct-bar-cell"><div class="h-struct-bar"><div class="h-struct-bar-fill" style="--w:${pct}%;--color:${tierColor}"></div></div></td>
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

  const extRows = fi.extSizes.slice(0, 8).map((/** @type {any} */ e, /** @type {number} */ i) => {
    const barW = Math.max(2, Math.round((e.totalBytes / Math.max(1, fi.totalBytes)) * 100));
    return `<tr>
      <td class="h-struct-rank">${i + 1}</td>
      <td class="h-struct-ext">.${escapeHtml(e.ext)}</td>
      <td class="h-struct-lines">${e.count}</td>
      <td class="h-struct-lines h-rs-mono">${formatBytes(e.totalBytes)}</td>
      <td class="h-struct-bar-cell"><div class="h-struct-bar"><div class="h-struct-bar-fill" style="--w:${barW}%;--color:var(--yry-cyan)"></div></div></td>
      <td class="h-struct-lines">${e.pct}%</td>
    </tr>`;
  }).join("");

  return `<div class="h-section">
    <h2>📏 文件体积分析 <span class="h-section-sub-inline">${escapeHtml(fi.icon || "")} ${escapeHtml(fi.summary || "")}</span></h2>
    ${summaryHtml}
    <div class="h-rs-grid-2">
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

// ── Dependency graph: cycles / fan-in / fan-out / orphans ────────

/**
 * Build dependency analysis section.
 *
 * @param {any} hr - health result with hr.depInfo
 */
export function buildDependencySection(/** @type {any} */ hr) {
  const di = hr.depInfo;
  if (!di) return "";

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
      <div class="h-summary-val" style="--color:${di.cycles.length > 0 ? COLOR_FAIL : COLOR_PASS}">${di.cycles.length}</div>
      <div class="h-summary-lbl">循环依赖</div>
    </div>
    <div class="h-summary-item">
      <div class="h-summary-val" style="--color:${di.orphans.length > 0 ? COLOR_WARN_ORANGE : COLOR_PASS}">${di.orphans.length}</div>
      <div class="h-summary-lbl">孤立文件</div>
    </div>
  </div>`;

  let cyclesHtml = "";
  if (di.cycles.length > 0) {
    const cycleItems = di.cycles.map((/** @type {any} */ c) => {
      const shortPath = c.path.map((/** @type {any} */ p) => `<code class="h-rs-code-sm">${escapeHtml(p.replace(/^skills\//,"").replace(/^lib\//,"").replace(/^agents\//,"").replace(/^rules\//,""))}</code>`).join(" <span class='h-rs-arrow'>→</span> ");
      return `<div class="h-rec-item">
        <span class="h-rec-prio" style="--color:${COLOR_FAIL}">🔴</span>
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
    cyclesHtml = placeholder("✅ 未检测到循环依赖 — 依赖图无环");
  }

  const fanInRows = (di.highFanIn || di.fanIn || []).slice(0, 8).map((/** @type {any} */ f, /** @type {number} */ i) => {
    const hot = f.count >= DEP_THRESHOLDS.CORE_FANIN;
    return `<tr>
      <td class="h-struct-rank">${i + 1}</td>
      <td class="h-struct-path" title="${escapeHtml(f.file)}">${escapeHtml(f.shortPath)}</td>
      <td class="h-struct-lines h-rs-mono" style="--color:${hot ? COLOR_WARN_ORANGE : COLOR_PASS}">${f.count}</td>
      <td>${hot ? '<span class="h-struct-chip warn">核心</span>' : '<span class="h-struct-chip pass">正常</span>'}</td>
    </tr>`;
  }).join("");

  const fanOutRows = (di.highFanOut || di.fanOut || []).slice(0, 8).map((/** @type {any} */ f, /** @type {number} */ i) => {
    const god = f.count >= DEP_THRESHOLDS.GOD_MODULE_FANOUT;
    return `<tr>
      <td class="h-struct-rank">${i + 1}</td>
      <td class="h-struct-path" title="${escapeHtml(f.file)}">${escapeHtml(f.shortPath)}</td>
      <td class="h-struct-lines h-rs-mono" style="--color:${god ? COLOR_FAIL : COLOR_WARN_ORANGE}">${f.count}</td>
      <td>${god ? '<span class="h-struct-chip fail">上帝</span>' : '<span class="h-struct-chip warn">偏高</span>'}</td>
    </tr>`;
  }).join("");

  let orphansHtml = "";
  if (di.orphans.length > 0) {
    const orphanItems = di.orphans.slice(0, 5).map((/** @type {any} */ o) =>
      detailItem("👻", o.shortPath, { mono: true })
    ).join("");
    orphansHtml = `
      <h3 class="h-struct-sub">👻 孤立文件 <span class="h-struct-sub-note">未被任何模块引用 · 共 ${di.orphans.length} 个</span></h3>
      <div class="h-detail-list">${orphanItems}</div>`;
  }

  return `<div class="h-section">
    <h2>🔗 系统组件依赖分析 <span class="h-section-sub-inline">${escapeHtml(di.icon || "")} ${escapeHtml(di.summary || "")}</span></h2>
    ${summaryHtml}
    <div class="h-rs-grid-2">
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

// ── Git status + Security findings (compact panel) ───────────────

/**
 * Build a compact Git status + Security findings panel.
 *
 * @param {any} hr
 */
export function buildGitSecuritySection(/** @type {any} */ hr) {
  const parts = [];

  if (hr.gitInfo) {
    const gi = hr.gitInfo;
    const icon = scoreIcon(gi.score);
    parts.push(`<div class="h-section">
      <h2>📦 Git 仓库状态 <span class="h-section-sub-inline">${icon} ${escapeHtml(gi.summary)}</span></h2>
      <div class="h-detail-list">
        ${detailItem("🌿", `分支: <strong>${escapeHtml(gi.branch || "?")}</strong>`)}
        ${detailItem("📝", `未提交文件: ${gi.uncommitted ?? "?"} 个`)}
        ${gi.behind ? detailItem("⬇️", `落后 origin: ${gi.behind} 个提交`) : ""}
        ${gi.ahead ? detailItem("⬆️", `领先 origin: ${gi.ahead} 个提交`) : ""}
      </div>
    </div>`);
  }

  if (hr.secInfo) {
    const si = hr.secInfo;
    const icon = scoreIcon(si.score);
    const findingItems = (si.findings || []).length > 0
      ? si.findings.slice(0, 5).map((/** @type {any} */ f) => detailItem("⚠️", f, { mono: true })).join("")
      : "";
    parts.push(`<div class="h-section">
      <h2>🛡️ 安全扫描 <span class="h-section-sub-inline">${icon} ${escapeHtml(si.summary)}</span></h2>
      ${findingItems ? `<div class="h-detail-list">${findingItems}</div>` : placeholder("未发现安全风险 — 未检测到硬编码凭据、密钥或 Token 泄露")}
    </div>`);
  }

  return parts.join("\n");
}
