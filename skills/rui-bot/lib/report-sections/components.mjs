/**
 * report-sections/components — YrY plugin component scores (skills/agents/rules/scripts).
 *
 *   - buildComponentSections  summary + per-type breakdown + low-score list
 */

import { scoreColor, scoreStatus, avgScore } from "../bot-health-analysis.mjs";
import { escapeHtml, scoreHex } from "../report-styles.mjs";
import { placeholder } from "../report-templates.mjs";

/**
 * Build all component-quality sections.
 *
 * @param {object} compScores - { skills, agents, rules, scripts }
 * @returns {string} HTML
 */
export function buildComponentSections(/** @type {any} */ compScores) {
  if (!compScores) return "";

  /** @param {number} s */
  function chip(s) {
    return s >= 80 ? '<span class="h-comp-chip pass">优秀</span>'
      : s >= 60 ? '<span class="h-comp-chip warn">一般</span>'
        : '<span class="h-comp-chip fail">待改进</span>';
  }

  function tbl(/** @type {any[]} */ items, /** @type {boolean} */ showMeta) {
    if (!items || !items.length) return placeholder("暂无数据");
    const sorted = [...items].sort((a, b) => b.score - a.score);
    return `<table class="h-comp-table"><thead><tr><th>#</th><th>名称</th>${showMeta ? '<th>属性</th>' : ''}<th>评分</th><th>等级</th></tr></thead><tbody>${sorted.map((x, i) => {
      const m = [];
      if (x.hasSkillMd !== undefined) m.push(x.hasSkillMd ? "📄" : "❌SKILL.md");
      if (x.hasLib) m.push("📦lib");
      if (x.mjsCount > 0) m.push("📜" + x.mjsCount);
      if (x.category) m.push("📂" + x.category);
      return `<tr><td class="h-comp-rank">${i + 1}</td><td class="h-comp-name">${escapeHtml(x.name)}</td>${showMeta ? `<td class="h-comp-meta">${m.join(" ") || "—"}</td>` : ""}<td class="h-comp-score-cell"><div class="h-comp-score-bar"><div class="h-comp-score-fill" style="--w:${x.score}%;--color:${scoreColor(x.score)}"></div></div><span class="h-comp-score-num" style="--color:${scoreColor(x.score)}">${x.score} 分</span></td><td>${chip(x.score)}</td></tr>`;
    }).join("")}</tbody></table>`;
  }

  const all = [...(compScores.skills || []), ...(compScores.agents || []), ...(compScores.rules || []), ...(compScores.scripts || [])];
  const lo = all.filter(c => c.score < 60);
  const avg = avgScore;

  return `<div class="h-section"><h2>📦 组件评分总览</h2><div class="h-comp-summary"><div class="h-comp-sum-item"><div class="h-comp-sum-val ${scoreStatus(avg(all))}">${avg(all)}</div><div class="h-comp-sum-lbl">综合均分 · ${all.length} 组件</div></div><div class="h-comp-sum-item"><div class="h-comp-sum-val ${scoreStatus(avg(compScores.skills))}">${avg(compScores.skills)}</div><div class="h-comp-sum-lbl">Skills · ${compScores.skills.length} 个</div></div><div class="h-comp-sum-item"><div class="h-comp-sum-val ${scoreStatus(avg(compScores.agents))}">${avg(compScores.agents)}</div><div class="h-comp-sum-lbl">Agents · ${compScores.agents.length} 个</div></div><div class="h-comp-sum-item"><div class="h-comp-sum-val ${scoreStatus(avg(compScores.rules))}">${avg(compScores.rules)}</div><div class="h-comp-sum-lbl">Rules · ${compScores.rules.length} 个</div></div><div class="h-comp-sum-item"><div class="h-comp-sum-val ${scoreStatus(avg(compScores.scripts))}">${avg(compScores.scripts)}</div><div class="h-comp-sum-lbl">Scripts · ${compScores.scripts.length} 个</div></div></div></div>${lo.length ? `<div class="h-section feat-fail"><h2>⚠️ 低分组件 <span class="h-section-sub-inline">${lo.length} 个</span></h2><div class="h-rec-list">${lo.map(c => `<div class="h-rec-item"><span class="h-rec-prio" style="--color:var(--yry-fail)">🔴</span><div class="h-rec-body"><div class="h-rec-source">${escapeHtml(c.name)} · ${c.score} 分</div><div class="h-rec-text">${escapeHtml((c.recommendations || ["补充完善"]).join("；"))}</div></div></div>`).join("")}</div></div>` : ""}<div class="h-section"><h2>🤖 Skills <span class="h-section-sub-inline">${compScores.skills.length} 个 · 均分 ${avg(compScores.skills)}</span></h2>${tbl(compScores.skills, true)}</div><div class="h-section"><h2>👥 Agents <span class="h-section-sub-inline">${compScores.agents.length} 个 · 均分 ${avg(compScores.agents)}</span></h2>${tbl(compScores.agents, false)}</div><div class="h-section"><h2>📏 Rules <span class="h-section-sub-inline">${compScores.rules.length} 个 · 均分 ${avg(compScores.rules)}</span></h2>${tbl(compScores.rules, false)}</div><div class="h-section"><h2>📜 Scripts <span class="h-section-sub-inline">${compScores.scripts.length} 个 · 均分 ${avg(compScores.scripts)}</span></h2>${tbl(compScores.scripts, false)}</div>`;
}