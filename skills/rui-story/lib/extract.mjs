/**
 * extract.mjs — Story data extraction utilities
 *
 * Extracted from rui-story.mjs for single-responsibility.
 */

import { join } from "node:path";
import { existsSync, readFileSync } from "node:fs";

const STORY_DIR_OFFSET = 1;
const STORY_NAME_OFFSET = 2;

export const BASELINE_DOCS = ["使用场景", "技术评审", "测试设计", "安全审计"];

// §0-§4 scene-based document model — scenes contain index.md with lifecycle sections
const SCENE_HTML_FILES = ["计划清单.html","架构图.html","知识图谱.html","源码.html","测试面板.html","演示.html","审查.html"];

export function extractStoryName(filePath) {
  const parts = filePath.split("/");
  const panelIdx = parts.indexOf("故事任务面板");
  if (panelIdx === -1 || panelIdx + STORY_NAME_OFFSET >= parts.length) return null;
  return parts[panelIdx + STORY_DIR_OFFSET];
}

export function groupSessionsByStory(sessions) {
  const map = new Map();
  for (const s of sessions) {
    const fp = s.file_path || "";
    const name = extractStoryName(fp);
    if (!name) continue;
    if (!map.has(name)) map.set(name, []);
    map.get(name).push(s);
  }
  return map;
}

export function readBlockedState(projectRoot, storyName) {
  const ruiStatePath = join(projectRoot, "docs", "故事任务面板", storyName, ".memory", "rui-state.json");
  if (!existsSync(ruiStatePath)) return null;
  try {
    const data = JSON.parse(readFileSync(ruiStatePath, "utf-8"));
    return { blocked: data.blocked === true, block_reason: data.block_reason || null };
  } catch {
    return null;
  }
}

export function hasProjectFile(fileBasenames, projectPrefix, docType) {
  // Try with project prefix first: "YrY-故事任务.md"
  const withPrefix = `${projectPrefix}${docType}.md`;
  if (fileBasenames.has(withPrefix)) return true;
  // Fallback: bare name without prefix: "故事任务.md" (kebab-case convention)
  const bare = `${docType}.md`;
  return fileBasenames.has(bare);
}

/**
 * Check if file paths contain a pattern (for scene-level checks).
 */
function hasFilePath(filePaths, pattern) {
  return filePaths.some(fp => fp.includes(pattern));
}

/**
 * Count scene directories that have all 7 required HTML files.
 */
function countCompleteScenes(filePaths) {
  const sceneDirs = new Map();
  for (const fp of filePaths) {
    const m = fp.match(/(场景-\d+)/);
    if (m) {
      const scene = m[1];
      if (!sceneDirs.has(scene)) sceneDirs.set(scene, new Set());
      const basename = fp.split("/").pop();
      if (SCENE_HTML_FILES.includes(basename)) sceneDirs.get(scene).add(basename);
    }
  }
  let complete = 0;
  for (const htmls of sceneDirs.values()) {
    if (SCENE_HTML_FILES.every(h => htmls.has(h))) complete++;
  }
  return { complete, total: sceneDirs.size };
}

export function determineStatus(fileBasenames, projectPrefix, blockedState, filePaths) {
  if (!hasProjectFile(fileBasenames, projectPrefix, "故事任务")) return "任务";

  // Check scene-based document model: scenes with index.md + 7 HTML files
  const paths = filePaths || [];
  const hasScenes = paths.some(fp => /场景-\d+/.test(fp));
  const hasSceneIndex = paths.some(fp => /场景-\d+.*\/index\.md$/.test(fp));

  if (!hasScenes || !hasSceneIndex) {
    // Fall back to legacy flat-file check
    const baselineComplete = BASELINE_DOCS.every(doc => hasProjectFile(fileBasenames, projectPrefix, doc));
    if (!baselineComplete) return "设计";
  }

  // Scene-based progression: check HTML completeness
  const { complete, total } = countCompleteScenes(paths);
  if (complete === 0) return "设计";
  if (complete < total) return "实施";

  // All scenes have complete HTML → check KG
  if (!hasProjectFile(fileBasenames, projectPrefix, "知识图谱") &&
      !paths.some(fp => fp.endsWith("知识图谱.json"))) return "测试";

  // Check §4 evidence: 审查.html in scenes
  const hasReview = paths.some(fp => /场景-\d+.*\/审查\.html$/.test(fp));
  if (!hasReview) return "报告";

  return "改进";
}
