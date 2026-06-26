/**
 * upgrade — experience-to-skill upgrade candidate detection
 * Extracted from proposals.mjs for single-responsibility.
 */

import { join } from "node:path";
import { existsSync, readdirSync } from "node:fs";

import { STORY_PANEL_DIR, PROPOSALS_FILE, UPGRADE_THRESHOLDS, UPGRADE_TARGETS } from "../constants.mjs";
import { bold, dim, green } from "../tty.mjs";
import { findProjectRoot, readJsonl } from "../fs.mjs";

/**
 * CLI entry for detecting rule upgrade candidates from recurring diagnostic patterns.
 *
 * @param {object} _opts - CLI options (since, min-occurrences, etc.)
 * @returns {void}
 */
export function cmdUpgradeCandidates(_opts) {
  const projectRoot = findProjectRoot(process.cwd());
  const panelDir = join(projectRoot, STORY_PANEL_DIR);

  const allProposals = [];
  if (existsSync(panelDir)) {
    try {
      const dirs = readdirSync(panelDir, { withFileTypes: true })
        .filter((/** @type {any} */ d) => d.isDirectory() && !d.name.startsWith("."));
      for (const d of dirs) {
        const proposalsPath = join(panelDir, d.name, PROPOSALS_FILE);
        const proposals = readJsonl(proposalsPath);
        for (const p of proposals) {
          allProposals.push({ ...p, _dir: d.name });
        }
      }
    } catch { /* skip */ }
  }

  console.log("");
  console.log(bold("经验技能化候选"));
  console.log("══════════════");
  console.log("");

  if (allProposals.length === 0) {
    console.log(dim("  无提案数据"));
    console.log("");
    return;
  }

  /** @type {Record<string, Set<string>>} */ const typeStoryCounts = {};
  for (const p of allProposals) {
    if (!typeStoryCounts[p.type]) typeStoryCounts[p.type] = new Set();
    typeStoryCounts[p.type].add(p._dir || p.story_name);
  }

  const upgradeMap = UPGRADE_TARGETS;
  const thresholdMap = UPGRADE_THRESHOLDS;

  let foundCandidate = false;
  for (const [type, stories] of Object.entries(typeStoryCounts)) {
    const threshold = (/** @type {any} */ (thresholdMap))[type] || 3;
    const storyList = [...stories].sort();
    const count = storyList.length;

    if (count >= threshold) {
      foundCandidate = true;
      console.log(green(`  ✅ ${type}: ${count} 个故事触发 (${storyList.join(", ")}) ≥ 阈值 ${threshold}`));
      console.log(`     升级目标: ${(/** @type {any} */ (upgradeMap))[type] || "—"}`);
      console.log("");
    }
  }

  if (!foundCandidate) {
    console.log(dim("  无满足升级阈值的提案类型"));
    console.log("");
    console.log(dim("  升级阈值: process/quality/refactor ≥3 故事, security ≥1 故事, skill ≥2 故事"));
    console.log("");
    return;
  }

  console.log(bold("  建议执行经验技能化升级"));
  console.log("");
}
