// skills/rui-story/lib/breadcrumb.mjs — 面包屑 + 场景导航生成器
// 样式与 1-新人上手/计划清单.html 保持一致（极简：4 段，root 是 <a>，其余 3 段都是 <span class="bc-current">）
import fs from 'node:fs';
import path from 'node:path';
import { DOCS_DIR } from './paths.mjs';
import { esc } from './escape.mjs';

/** 子目录的中文标签 / 图标 / hint / story code（与 故事任务.md 的 🌿 分支名一致） */
const SUBDIR_META = Object.freeze({
  '架构':        { icon: '🏗️', label: '架构',       hint: '系统架构知识固化',     code: 'yry-arch' },
  '计划清单':    { icon: '📋', label: '计划清单',   hint: '清单与自循环',         code: 'yry-checklist' },
  '自测':        { icon: '🧪', label: '自测',       hint: '自动化自检',           code: 'yry-self-test' },
  '自改进':      { icon: '🔄', label: '自改进',     hint: '诊断与闭环',           code: 'yry-self-improve' },
  'cdn':         { icon: '☁️', label: 'CDN',        hint: '资源与发布',           code: 'yry-cdn' },
  'npm包管理':   { icon: '📦', label: 'NPM 包管理', hint: '依赖与版本',           code: 'rui-npm' },
  '首页':        { icon: '🏠', label: '首页',       hint: '总览与导航',           code: 'yry-index' }
});

/** 7 类制品的图标与标签 */
const ARTIFACT_META = Object.freeze({
  '审查.html':     { icon: '📝', label: '审查' },
  '架构图.html':   { icon: '📐', label: '架构图' },
  '测试面板.html': { icon: '🧪', label: '测试面板' },
  '源码.html':     { icon: '📜', label: '源码' },
  '演示.html':     { icon: '💡', label: '演示' },
  '知识图谱.html': { icon: '🔗', label: '知识图谱' },
  '计划清单.html': { icon: '📋', label: '计划清单' }
});

/** 从 scenarioDir 抽取场景号；找不到则回退到 "?" */
function parseScenarioNumber(scenarioDir) {
  const m = scenarioDir.match(/^场景-(\d+)/);
  return m ? m[1] : '?';
}

/**
 * 生成 4 级面包屑 HTML（与 1-新人上手/计划清单.html 风格完全一致）。
 *  根 → 子目录(code · hint) → 场景(N · 标题) → 当前页(icon · label)
 *
 * @param {{subdir:string, scenarioDir:string, title:string}} ctx
 * @param {string} artifact - 7 类制品之一
 * @returns {string} 面包屑 <nav> 元素
 */
export function buildBreadcrumb(ctx, artifact) {
  const sub = SUBDIR_META[ctx.subdir] ?? { icon: '📁', label: ctx.subdir, hint: '', code: ctx.subdir };
  const art = ARTIFACT_META[artifact]   ?? { icon: '📄', label: artifact };
  const num = parseScenarioNumber(ctx.scenarioDir);

  // 单行紧凑格式（与目标模板保持一致），所有非根段都是 <span class="bc-current">
  return `<nav class="breadcrumb"><a href="../../../index.html">📄 文档中心</a><span class="bc-sep">/</span><span class="bc-current">${esc(sub.code)} · ${esc(sub.hint)}</span><span class="bc-sep">/</span><span class="bc-current">场景 ${esc(num)} · ${esc(ctx.title)}</span><span class="bc-sep">/</span><span class="bc-current">${art.icon} ${esc(art.label)}</span></nav>`;
}

/* ───────── 场景导航（scene-nav） ───────── */

/** 读取某子目录下所有场景的 {scenarioDir, title}，按场景号排序 */
function listSiblingScenarios(subdir) {
  const base = path.join(DOCS_DIR, subdir);
  let entries;
  try { entries = fs.readdirSync(base); }
  catch { return []; }
  const out = [];
  for (const name of entries) {
    if (!name.startsWith('场景-')) continue;
    const mdPath = path.join(base, name, 'index.md');
    let title = '';
    try {
      const md = fs.readFileSync(mdPath, 'utf8');
      const m = md.match(/^#\s*场景[\s-]*\d+[\s]*[：:·—-]\s*(.+?)$/m);
      if (m) title = m[1].trim();
    } catch { /* ignore */ }
    out.push({ scenarioDir: name, title, num: parseScenarioNumber(name) });
  }
  out.sort((a, b) => Number(a.num) - Number(b.num));
  return out;
}

/**
 * 生成场景导航 HTML（与 1-新人上手/计划清单.html 风格一致）：
 *  列出同子目录下所有兄弟场景的 计划清单.html 链接，当前场景高亮，最后追加 故事任务.md 入口。
 *
 * @param {{subdir:string, scenarioDir:string, title:string}} ctx
 * @returns {string} scene-nav <nav> 元素
 */
export function buildSceneNav(ctx) {
  const siblings = listSiblingScenarios(ctx.subdir);
  if (siblings.length === 0) return '';

  const parts = ['<nav class="scene-nav">'];
  let first = true;
  for (const s of siblings) {
    if (!first) parts.push('  <span class="scene-nav-sep">·</span>');
    const isActive = s.scenarioDir === ctx.scenarioDir;
    const cls = isActive ? 'scene-nav-link active' : 'scene-nav-link';
    const label = `📋 场景${s.num} · ${s.title || s.scenarioDir}`;
    const href = isActive ? '计划清单.html' : `../${s.scenarioDir}/计划清单.html`;
    parts.push(`  <a class="${cls}" href="${esc(href)}">${esc(label)}</a>`);
    first = false;
  }
  // 追加 故事任务.md 入口
  parts.push('  <span class="scene-nav-sep">·</span>');
  parts.push(`  <a class="scene-nav-link story" href="../故事任务.md">📖 故事任务</a>`);
  parts.push('</nav>');
  return parts.join('\n');
}
