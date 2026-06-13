// scripts/lib/paths.mjs — 路径与场景配置
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import fs from 'node:fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const ROOT = path.resolve(__dirname, '../..');
export const SCRIPTS_DIR = path.join(ROOT, 'scripts');
export const DOCS_DIR = path.join(ROOT, 'docs/故事任务面板');
export const TEMPLATE_DIR = path.join(DOCS_DIR, '架构/场景-1-新人上手');
export const CACHE_DIR = path.join(SCRIPTS_DIR, '.cache');

/** 7 个子目录的固定顺序（每个子目录下放一组场景） */
export const SUBDIRS = Object.freeze([
  '架构', '计划清单', '自测', '自改进', 'cdn', 'npm包管理', '首页'
]);

/** 参考模板（不应被脚本改写） */
export const TEMPLATE_SCENARIO = '场景-1-新人上手';

/** 7 类 HTML 制品（按惯例命名） */
export const ARTIFACTS = Object.freeze([
  '审查.html', '架构图.html', '测试面板.html',
  '源码.html', '演示.html', '知识图谱.html', '计划清单.html'
]);

/** 解析一个子目录下的所有场景路径。
 *  - 跳过以 . 开头的隐藏目录
 *  - 跳过参考模板 TEMPLATE_SCENARIO
 *  - 仅识别 "场景-N-…" 形式的目录
 * @returns {Array<{subdir: string, scenarioDir: string, fullPath: string}>}
 */
export function listScenarios() {
  const out = [];
  for (const sub of SUBDIRS) {
    const base = path.join(DOCS_DIR, sub);
    let entries;
    try { entries = fs.readdirSync(base); }
    catch { continue; }
    for (const name of entries) {
      if (name.startsWith('.') || name === TEMPLATE_SCENARIO) continue;
      if (!name.startsWith('场景-')) continue;
      out.push({ subdir: sub, scenarioDir: name, fullPath: path.join(base, name) });
    }
  }
  return out;
}
