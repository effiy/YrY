// skills/rui-story/lib/extract-scenario.mjs — 从 index.md 抽取结构化场景数据
import fs from 'node:fs/promises';
import path from 'node:path';
import { CACHE_DIR } from './paths.mjs';

/* ───────── 工具 ───────── */

/** 截取 ### anchor 到下一个 ###/##/---/<a 之前 */
function extractSection(/** @type {string} */ content, /** @type {string} */ anchor) {
  const re = new RegExp(`###\\s+${anchor}\\s*\\n([\\s\\S]*?)(?=\\n###|\\n##|\\n---|\\n<a)`, '');
  return content.match(re)?.[1] ?? '';
}

/** 抽取一个 markdown 表格的所有数据行（去表头） */
function extractTableRows(/** @type {string} */ section, /** @type {number} */ minCols = 2) {
  if (!section) return [];
  const rows = [];
  for (const line of section.split('\n')) {
    const t = line.trim();
    if (!t.startsWith('|') || t.match(/^\|[\s\-:|]+\|$/)) continue;
    const cells = t.split('|').map((/** @type {string} */ s) => s.trim()).filter(Boolean);
    if (cells.length >= minCols) rows.push(cells);
  }
  return rows.slice(1);
}

/* ───────── 抽取器 ───────── */

function extractTitle(/** @type {string} */ content) {
  // 兼容多种分隔符：冒号(:：)、中点(·)、破折号(—–-)、直接连写(场景-N-)
  const m = content.match(/^#\s*场景[\s-]*\d+[\s]*[：:·—-]\s*(.+?)$/m);
  return m?.[1]?.trim() ?? '';
}

function extractRoleGoalPriority(/** @type {string} */ content) {
  const m = content.match(
    /\*\*角色\*\*[:：]\s*(.+?)\s*·\s*\*\*目标\*\*[:：]\s*(.+?)\s*·\s*\*\*优先级\*\*[:：]\s*(\S+)/
  );
  if (!m) return { role: '', goal: '', priority: 'P0' };
  return { role: m[1].trim(), goal: m[2].trim(), priority: m[3].trim() };
}

function extractValuePoints(/** @type {string} */ content) {
  const sec = extractSection(content, '主要价值');
  const out = [];
  for (const line of sec.split('\n')) {
    const m = line.match(/^-\s*(.*?)\*\*(.+?)\*\*\s*[—–-]\s*(.+)$/);
    if (m) out.push({ emoji: m[1].trim().slice(0, 2) || '•', name: m[2], desc: m[3] });
  }
  return out;
}

function extractModules(/** @type {string} */ content) {
  return extractTableRows(extractSection(content, '涉及模块'), 2)
    .map((/** @type {string[]} */ c) => ({ name: c[0], role: c[1] ?? '', path: c[2] ?? '' }));
}

function extractTestCases(/** @type {string} */ content) {
  /** @type {Record<string, any[]>} */
  const result = { normal: [], boundary: [] };
  for (const [secName, key] of [['正常路径用例', 'normal'], ['边界/异常用例', 'boundary']]) {
    const sec = extractSection(content, secName);
    for (const cells of extractTableRows(sec, 3)) {
      const priority = cells[cells.length - 1] || 'P0';
      const name = cells[1] || cells[2] || cells[0];
      result[key].push({ id: cells[0], name, priority });
    }
  }
  return result;
}

function extractIssuesAndRecs(/** @type {string} */ content) {
  /** @type {any[]} */
  const issues = [];
  /** @type {any[]} */
  const recs = [];
  const secNames = ['D0–D8 诊断', 'D0-D8 诊断', '诊断摘要', '改进清单', '改进提案'];
  for (const secName of secNames) {
    const sec = extractSection(content, secName);
    if (!sec) continue;
    const isDiag = secName.includes('诊断');
    for (const cells of extractTableRows(sec, 2)) {
      if (!cells[0].match(/^[DR#]\d+/)) continue;
      const entry = {
        id: cells[0],
        desc: cells[1] || cells[2] || '',
        status: cells[2] || cells[3] || '未触发'
      };
      (isDiag ? issues : recs).push(entry);
    }
  }
  return { issues, recs };
}

function extractSourcesAndActions(/** @type {string} */ content) {
  const sources = [];
  const actions = [];
  const secNames = ['开发源码清单', '源码清单', '操作步骤记录', '实施项'];
  for (const secName of secNames) {
    const sec = extractSection(content, secName);
    if (!sec) continue;
    for (const cells of extractTableRows(sec, 2)) {
      if (cells[0].match(/^\d+$/)) {
        actions.push({
          id: cells[0],
          desc: cells[1] || cells[2] || '',
          result: cells[cells.length - 1] || ''
        });
      } else {
        sources.push({ name: cells[0], path: cells[1] ?? '', type: cells[2] ?? '' });
      }
    }
  }
  return { sources, actions };
}

/* ───────── 入口 ───────── */

/**
 * 从场景目录的 index.md 抽取全部结构化数据。
 * @param {{fullPath: string, scenarioDir: string, subdir: string}} ctx
 * @returns {Promise<object>}
 */
export async function extractScenarioData(ctx) {
  const mdPath = path.join(ctx.fullPath, 'index.md');
  const content = await fs.readFile(mdPath, 'utf8');
  const { role, goal, priority } = extractRoleGoalPriority(content);
  const { issues, recs } = extractIssuesAndRecs(content);
  const { sources, actions } = extractSourcesAndActions(content);

  return {
    scenarioDir: ctx.scenarioDir,
    title: extractTitle(content),
    role, goal, priority,
    valuePoints: extractValuePoints(content),
    modules: extractModules(content),
    testCases: extractTestCases(content),
    issues, recommendations: recs,
    sources, actions
  };
}

/** 缓存文件路径 — 把数据放到 skills/rui-story/scripts/.cache/ 而不是污染场景目录 */
export function cachePathFor(/** @type {{subdir: string, scenarioDir: string}} */ ctx) {
  return path.join(CACHE_DIR, `${ctx.subdir}__${ctx.scenarioDir}.json`);
}

/** 读取缓存（若存在且 mtime 更新） */
export async function readCache(/** @type {{subdir: string, scenarioDir: string}} */ ctx) {
  try { return JSON.parse(await fs.readFile(cachePathFor(ctx), 'utf8')); }
  catch { return null; }
}

/** 写入缓存 */
export async function writeCache(/** @type {{subdir: string, scenarioDir: string}} */ ctx, /** @type {any} */ data) {
  await fs.mkdir(CACHE_DIR, { recursive: true });
  await fs.writeFile(cachePathFor(ctx), JSON.stringify(data, null, 2), 'utf8');
}
