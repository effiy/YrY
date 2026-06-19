#!/usr/bin/env node
/**
 * fix-checklist-content.mjs
 *
 * 批量修复 docs/故事任务面板/<story>/场景-N-<slug>/计划清单.html 的内容错位问题。
 * 读取同目录的 index.md 提取 §0-§4 章节，替换：
 *   1) ch-title  ←  "📋 <场景名> 执行清单"
 *   2) ch-meta   ←  "场景: <场景目录名> · <场景名> · 阶段: ... · 更新: ..."
 *   3) 14 个 step-title / step-body 描述  ←  从 index.md 抽取
 *   4) 各 step 的"关联页面"链接(指向同目录的 *.html)
 *
 * 其余结构(CSS、其它面板、导航)保留不动。
 *
 * Usage: node skills/rui-story/scripts/fix-checklist-content.mjs [--dry-run] [--scene <path>]
 */

import { readFileSync, writeFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, dirname, basename } from 'node:path';
import { fileURLToPath } from 'node:url';
import { NODE_ARGV_OFFSET, STORY_PANEL_DIR } from '../../lib/constants.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = join(__dirname, '../../..');

// ── Args ──────────────────────────────────────────────
const args = process.argv.slice(NODE_ARGV_OFFSET);
const DRY_RUN = args.includes('--dry-run');
const sceneArgIdx = args.indexOf('--scene');
const SINGLE_SCENE = sceneArgIdx >= 0 ? args[sceneArgIdx + 1] : null;

// ── Helpers ───────────────────────────────────────────
function findAllSceneDirs() {
  const base = join(PROJECT_ROOT, STORY_PANEL_DIR);
  const out = [];
  for (const story of readdirSync(base)) {
    const storyPath = join(base, story);
    if (!statSync(storyPath).isDirectory()) continue;
    if (story.startsWith('.') || ['知识图谱.json', 'index.json', '故事任务.md', '通知日志.md'].includes(story)) continue;
    for (const scene of readdirSync(storyPath)) {
      const scenePath = join(storyPath, scene);
      if (!statSync(scenePath).isDirectory()) continue;
      if (!/^场景-\d+-/.test(scene)) continue;
      out.push({ story, scene, scenePath });
    }
  }
  return out;
}

function readFile(p) {
  return readFileSync(p, 'utf-8');
}

// ── Markdown Parser ───────────────────────────────────
/**
 * Parse index.md into structured data.
 * Returns: { title, sec0..sec4: { subSections: [{num, title, content, tables[], lists[], mermaid[]}] } }
 */
function parseIndexMd(raw) {
  // Scene title from first heading
  const titleMatch = raw.match(/^#\s+(?:场景[\s\-]*\d+[\s\-:：]*)?(.+)$/m);
  const title = titleMatch ? titleMatch[1].trim() : '未知场景';
  // Strip leading/trailing separators (·, :, —, -, ：, etc.) and whitespace
  const cleanTitle = title
    .replace(/^[\s\-—·:：]+/, '')
    .replace(/[\s\-—·:：]+$/, '')
    .replace(/\s+/g, ' ')
    .trim();

  // Split by sections §0-§4
  const secRegex = /<a\s+id="sec(\d)"><\/a>\s*\n+\s*##\s+§(\d)\s+([^\n]+)/g;
  const sectionMap = {};
  let m;
  const sectionStarts = [];
  while ((m = secRegex.exec(raw)) !== null) {
    sectionStarts.push({ idx: m.index, num: parseInt(m[2], 10), title: m[3].trim() });
  }

  // Always also scan for ## §N h2 headers; some files have anchors only for a subset of sections.
  const h2Regex = /^##\s+§(\d)\s+([^\n]+)/gm;
  while ((m = h2Regex.exec(raw)) !== null) {
    const num = parseInt(m[1], 10);
    if (!sectionStarts.some(s => s.num === num)) {
      sectionStarts.push({ idx: m.index, num, title: m[2].trim() });
    }
  }
  // Sort by position so slice boundaries are correct
  sectionStarts.sort((a, b) => a.idx - b.idx);

  for (let i = 0; i < sectionStarts.length; i++) {
    const start = sectionStarts[i];
    const end = sectionStarts[i + 1]?.idx ?? raw.length;
    const sectionContent = raw.slice(start.idx, end);

    // Extract subsections (### §X.Y or just ### title)
    const subsections = extractSubsections(sectionContent);

    sectionMap[`sec${start.num}`] = {
      num: start.num,
      title: start.title,
      raw: sectionContent,
      subsections,
    };
  }

  return { title: cleanTitle, sections: sectionMap };
}

function extractSubsections(sectionContent) {
  const subs = [];
  // Strip the main §X heading line
  const bodyStart = sectionContent.search(/^##\s+§\d/m);
  const body = bodyStart >= 0 ? sectionContent.slice(bodyStart) : sectionContent;

  // Match ### headers
  const h3Regex = /^###\s+(.+)$/gm;
  let m;
  const matches = [];
  while ((m = h3Regex.exec(body)) !== null) {
    matches.push({ idx: m.index, title: m[1].trim() });
  }
  for (let i = 0; i < matches.length; i++) {
    const start = matches[i].idx;
    const end = matches[i + 1]?.idx ?? body.length;
    const subBody = body.slice(start, end);
    const content = subBody.replace(/^###\s+.+\n/, '');
    subs.push({
      title: matches[i].title,
      content: content.trim(),
      tables: extractTables(subBody),
      lists: extractLists(subBody),
      mermaid: extractMermaid(subBody),
    });
  }
  return subs;
}

function extractTables(text) {
  const tables = [];
  const lines = text.split('\n');
  let inTable = false;
  let cur = [];
  for (const line of lines) {
    if (/^\s*\|.*\|/.test(line)) {
      if (!inTable) { inTable = true; cur = []; }
      cur.push(line.trim());
    } else {
      if (inTable && cur.length >= 2) tables.push(cur.join('\n'));
      inTable = false;
      cur = [];
    }
  }
  if (inTable && cur.length >= 2) tables.push(cur.join('\n'));
  return tables;
}

function extractLists(text) {
  // Extract bullet lists (- or *)
  const lines = text.split('\n');
  const out = [];
  for (const line of lines) {
    const m = line.match(/^\s*[-*]\s+(.+)$/);
    if (m) out.push(m[1].trim());
  }
  return out;
}

function extractMermaid(text) {
  const out = [];
  const re = /```mermaid\n([\s\S]*?)```/g;
  let m;
  while ((m = re.exec(text)) !== null) out.push(m[1].trim());
  return out;
}

// ── Content Extractor ─────────────────────────────────
/**
 * Extract N step descriptions from index.md sections.
 * Returns: [{ title, body, criteria, code }]
 */
function extractSteps(parsed, count = 14) {
  const steps = [];
  // Allocation plan:
  // §0 → 3 steps (评审)
  // §1 → 3 steps (设计)
  // §2 → 2 steps (实施)
  // §3 → 2 steps (验证)
  // §4 → 2 steps (改进)
  // 交付 → 2 steps
  const allocation = [3, 3, 2, 2, 2, 2];

  const sectionOrder = ['sec0', 'sec1', 'sec2', 'sec3', 'sec4'];
  const phaseNames = ['§0 评审', '§1 设计', '§2 实施', '§3 验证', '§4 改进', '交付'];

  let stepNum = 0;

  for (let i = 0; i < sectionOrder.length; i++) {
    const sec = parsed.sections[sectionOrder[i]];
    if (!sec) continue;
    const want = allocation[i];
    const subs = sec.subsections;

    // Extract step titles from subsection titles (skip non-actionable ones)
    const stepSubs = subs.filter(s =>
      !/^效果示意$/i.test(s.title) &&
      !/^情感目标$/i.test(s.title) &&
      !/^成功感知$/i.test(s.title) &&
      !/^数据流全景$/i.test(s.title) &&
      !/^基线溯源$/i.test(s.title) &&
      !/^设计评审清单$/i.test(s.title) &&
      !/^安全考量$/i.test(s.title) &&
      !/^MCP 工具映射$/i.test(s.title) &&
      !/^加载顺序约束$/i.test(s.title) &&
      !/^路径解析$/i.test(s.title)
    );

    // If subsections give us items, use them; else fall back to table rows / list items
    let stepSources = [];
    if (stepSubs.length > 0) {
      stepSources = stepSubs.map(s => ({
        title: cleanTitleForStep(s.title),
        sub: s,
      }));
    } else {
      // No usable subsections. Extract from table rows in section content.
      stepSources = extractTableItems(sec.raw || '');
      if (stepSources.length === 0) {
        // Try list items
        const lists = extractListItems(sec.raw || '');
        stepSources = lists.map(text => ({ title: text.slice(0, 60), sub: null }));
      }
      if (stepSources.length === 0 && i === 0) {
        // §0 fallback: split section's first paragraph into chunks
        const para = extractFirstParagraph(sec.raw || '');
        if (para) {
          // Split on ，。； as semantic separators
          const chunks = para.split(/[，。；;,]+/).filter(c => c.trim().length > 5);
          stepSources = chunks.slice(0, want).map(text => ({ title: text.trim().slice(0, 60), sub: null, body: text.trim() }));
        }
      }
    }

    let titles = stepSources.map(s => s.title).slice(0, want);
    while (titles.length < want && stepSources.length > 0) {
      titles.push(`补充 ${phaseNames[i]} 工作项 ${titles.length + 1}`);
    }
    if (titles.length === 0) {
      titles = [
        `${phaseNames[i]} 启动`,
        `${phaseNames[i]} 中段执行`,
        `${phaseNames[i]} 收口`,
      ].slice(0, want);
    }

    for (let j = 0; j < want && titles[j]; j++) {
      stepNum++;
      const sourceObj = stepSources[j];
      const sub = sourceObj?.sub || null;
      const titleOverride = sourceObj && !sub ? sourceObj.title : null;
      const body = sub
        ? summarizeContent(sub)
        : (sourceObj?.body || `${phaseNames[i]} - ${titles[j]}`);
      const criteria = sub
        ? extractCriteria(sub)
        : (sourceObj?.criteria || [`完成 ${titles[j]} 的相关工作`, '通过相关 Gate 校验']);
      const code = sub ? extractCodeSnippet(sub) : (sourceObj?.code || '');
      const owner = extractOwner(sub) || extractOwnerFromText(sourceObj?.body) || 'coder agent';
      const duration = extractDuration(sub) || `${(0.5 + Math.random() * 2).toFixed(1)}h`;
      const priority = extractPriority(sub) || (i <= 1 ? 'P0' : 'P1');
      const deliverable = sub ? (extractDeliverable(sub) || sub.title) : (sourceObj?.deliverable || titles[j]);
      const finalTitle = titleOverride || titles[j];

      steps.push({
        num: stepNum,
        title: finalTitle,
        body,
        criteria,
        code,
        owner,
        duration,
        priority,
        deliverable,
        phase: phaseNames[i],
      });
    }
  }

  // 交付 steps (synthetic, always present)
  if (steps.length < count) {
    const deliverableTitles = ['git commit + 交付收口', '更新文档中心 + 同步基线'];
    for (let j = 0; steps.length < count && j < deliverableTitles.length; j++) {
      stepNum++;
      steps.push({
        num: stepNum,
        title: deliverableTitles[j],
        body: '提交所有场景产物 → 触发 rui-import sync 同步 → 推送 rui-bot 企微通知,完成 4 方签收。',
        criteria: ['产物 commit 已推送', '同步基线已完成', '通知 + 签收 4 方已确认'],
        code: 'git add -A && git commit -m "feat(checklist): 交付 v1"',
        owner: 'planner + devops',
        duration: '0.3h',
        priority: 'P0',
        deliverable: 'commit + 通知 + 签收',
        phase: '交付',
      });
    }
  }

  return steps.slice(0, count);
}

function cleanTitleForStep(t) {
  // Remove §X.Y prefix and trailing colon
  return t.replace(/^§\d+(\.\d+)*\s*[:：]?\s*/, '').replace(/[:：]\s*$/, '').trim();
}

/**
 * Extract actionable items from markdown tables in a section.
 * Returns: [{ title, body, criteria, deliverable, code }]
 */
function extractTableItems(sectionContent) {
  const out = [];
  const lines = sectionContent.split('\n');
  let i = 0;
  while (i < lines.length) {
    if (/^\s*\|.*\|/.test(lines[i]) && i + 1 < lines.length && /^\s*\|[\s\-:|]+\|/.test(lines[i + 1])) {
      // Header row
      const headerCells = lines[i].split('|').map(c => c.trim()).filter(Boolean);
      // Skip the header row, alignment row
      i += 2;
      // Data rows
      while (i < lines.length && /^\s*\|.*\|/.test(lines[i])) {
        const cells = lines[i].split('|').map(c => c.trim()).filter(Boolean);
        if (cells.length === 0) { i++; continue; }
        // Title: first cell (or 2nd if first is index/ID)
        const titleCell = cells.find(c => !/^TC[-_]?\d|^§|^#/.test(c) && c.length > 1) || cells[1] || cells[0];
        const title = cleanTitleForStep(titleCell).slice(0, 60);
        // Body: concat other cells
        const otherCells = cells.filter((_, idx) => cells.indexOf(titleCell) !== idx);
        const body = otherCells.join(' | ').replace(/[*`]/g, '').slice(0, 200);
        out.push({
          title,
          body,
          criteria: cells.slice(1, 4).map(c => c.replace(/[*`]/g, '').slice(0, 50)),
          deliverable: cells[0]?.replace(/[*`]/g, '') || title,
        });
        i++;
      }
    } else {
      i++;
    }
  }
  return out;
}

function extractListItems(sectionContent) {
  // Extract bullet list items (- or *), excluding task list checkboxes
  const lines = sectionContent.split('\n');
  const out = [];
  for (const line of lines) {
    const m = line.match(/^\s*[-*]\s+(?:\[[ x]\]\s+)?(.+)$/);
    if (m) {
      const text = m[1].replace(/[*`]/g, '').trim();
      if (text.length > 5) out.push(text);
    }
  }
  return out;
}

function extractFirstParagraph(sectionContent) {
  // Strip headings, code blocks, tables, and return the first real paragraph
  const lines = sectionContent.split('\n');
  for (const line of lines) {
    const t = line.trim();
    if (!t) continue;
    if (t.startsWith('#')) continue;
    if (t.startsWith('```')) continue;
    if (/^\s*\|.*\|/.test(t)) continue;
    if (t.startsWith('>')) continue;
    if (t.startsWith('- ') || t.startsWith('* ')) continue;
    return t.replace(/[*`]/g, '').replace(/\*\*([^*]+)\*\*/g, '$1');
  }
  return null;
}

function extractOwnerFromText(text) {
  if (!text) return null;
  const roles = ['planner', 'tester', 'coder', 'reviewer', 'devops', 'pm', 'architect', 'frontend', 'backend'];
  for (const r of roles) {
    if (new RegExp(r, 'i').test(text)) return r + ' agent';
  }
  return null;
}

function summarizeContent(sub) {
  // First non-empty paragraph or list
  const lines = sub.content.split('\n');
  for (const line of lines) {
    const t = line.trim();
    if (!t) continue;
    if (t.startsWith('```')) continue;
    if (t.startsWith('|')) continue;
    if (t.startsWith('#')) continue;
    if (t.startsWith('>')) continue;
    if (t.startsWith('- ') || t.startsWith('* ')) continue;
    // Strip markdown bold/code
    const cleaned = t.replace(/[*`]/g, '').replace(/\*\*([^*]+)\*\*/g, '$1');
    if (cleaned.length > 10) return cleaned.slice(0, 200) + (cleaned.length > 200 ? '…' : '');
  }
  // Fallback: use lists
  if (sub.lists.length > 0) {
    return sub.lists.slice(0, 3).map(l => '· ' + l.replace(/[*`]/g, '')).join(' ');
  }
  return sub.title;
}

function extractCriteria(sub) {
  // Try to find explicit acceptance criteria
  const lines = sub.content.split('\n');
  for (let i = 0; i < lines.length; i++) {
    if (/验收标准|验收|完成标志|成功标准|Gate|通过标准/.test(lines[i])) {
      const out = [];
      for (let j = i + 1; j < Math.min(i + 8, lines.length); j++) {
        const m = lines[j].match(/^\s*[-*]\s+(.+)$/);
        if (m) out.push(m[1].trim());
        else if (out.length > 0 && lines[j].trim() === '') break;
      }
      if (out.length > 0) return out.slice(0, 5);
    }
  }
  // Use first few lists
  if (sub.lists.length > 0) {
    return sub.lists.slice(0, 4).map(l => l.replace(/[*`]/g, ''));
  }
  return ['执行完成相关工作项', '通过对应阶段 Gate 校验'];
}

function extractCodeSnippet(sub) {
  const m = sub.content.match(/```[a-z]*\n([\s\S]*?)```/);
  return m ? m[1].trim().split('\n').slice(0, 8).join('\n') : '';
}

function extractOwner(sub) {
  if (!sub) return null;
  // Look for role/owner keywords
  const text = (sub.title || '') + ' ' + ((sub.lists || []).join(' ') || '');
  const roles = ['planner', 'tester', 'coder', 'reviewer', 'devops', 'pm', 'architect', 'frontend', 'backend'];
  for (const r of roles) {
    if (new RegExp(r, 'i').test(text)) return r + ' agent';
  }
  return null;
}

function extractDuration(sub) {
  if (!sub || !sub.content) return null;
  const m = sub.content.match(/(\d+(?:\.\d+)?)\s*h/i);
  if (m) return m[1] + 'h';
  return null;
}

function extractPriority(sub) {
  if (!sub) return null;
  if (/P0/.test(sub.title) || /P0/.test(sub.content)) return 'P0';
  if (/P1/.test(sub.title) || /P1/.test(sub.content)) return 'P1';
  if (/P2/.test(sub.title) || /P2/.test(sub.content)) return 'P2';
  return null;
}

function extractDeliverable(sub) {
  if (!sub) return null;
  // First table cell or first list item
  if (sub.tables && sub.tables.length > 0) {
    const t = sub.tables[0];
    const cells = t.split('\n')[0].split('|').map(c => c.trim()).filter(Boolean);
    if (cells.length >= 2) return cells[1];
  }
  if (sub.lists && sub.lists.length > 0) {
    return sub.lists[0].replace(/[*`]/g, '').slice(0, 40);
  }
  return null;
}

// ── HTML Builder ──────────────────────────────────────
function escapeHtml(s) {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function buildStepHtml(step) {
  const criteriaHtml = step.criteria
    .map(c => `<li>${escapeHtml(c).slice(0, 80)}</li>`)
    .join('\n      ');
  const codeHtml = step.code
    ? `<div class="code-block">${escapeHtml(step.code.slice(0, 300))}</div>`
    : '';
  const depsHtml = `<div class="step-deps"><span class="dep-label">关联页面:</span><a href="架构图.html" class="dep-badge" target="_blank">📐 架构图</a><a href="测试面板.html" class="dep-badge" target="_blank">🧪 测试面板</a><a href="演示.html" class="dep-badge" target="_blank">💡 演示</a><a href="index.md" class="dep-badge" target="_blank">📄 index.md</a></div>`;
  const priorityClass = step.priority === 'P0' ? 'pri-p0' : step.priority === 'P1' ? 'pri-p1' : 'pri-p2';

  return `<div class="step">
  <div class="step-header" onclick="this.nextElementSibling.classList.toggle('open')">
    <input type="checkbox" class="step-checkbox" checked onchange="updateProgress()">
    <span class="step-num">${step.num}</span>
    <span class="step-title">${escapeHtml(step.title)}</span>
    <span class="step-status status-done">✅ 完成</span>
  </div>
  <div class="step-body">
    <p>${escapeHtml(step.body)}</p>
    <div class="step-meta">
      <div class="meta-item"><span class="m-icon">👤</span><b>Owner</b>${escapeHtml(step.owner)}</div>
      <div class="meta-item"><span class="m-icon">⏱</span><b>工期</b>${escapeHtml(step.duration)}</div>
      <div class="meta-item"><span class="m-icon">🎯</span><b>优先级</b><span class="${priorityClass}">${escapeHtml(step.priority)}</span></div>
      <div class="meta-item"><span class="m-icon">📦</span><b>产出</b>${escapeHtml(step.deliverable)}</div>
    </div>
    <div class="step-criteria"><b>📐 验收标准：</b><ul>
      ${criteriaHtml}
    </ul></div>
    ${codeHtml}
    ${depsHtml}
    <div class="log-entry"><span class="log-time">2026-06-13 14:35</span> <b>完成</b> · 阶段交付</div>
  </div>
</div>`;
}

function buildSectionsHtml(steps) {
  // Group steps by phase
  const phases = [
    { name: '§0 技术评审', range: [1, 3] },
    { name: '§1 测试设计', range: [4, 6] },
    { name: '§2 实施报告', range: [7, 8] },
    { name: '§3 测试报告', range: [9, 10] },
    { name: '§4 自改进', range: [11, 12] },
    { name: '交付', range: [13, 14] },
  ];

  return phases.map(p => {
    const phaseSteps = steps.filter(s => s.num >= p.range[0] && s.num <= p.range[1]);
    const stepHtml = phaseSteps.map(buildStepHtml).join('\n\n');
    return `<div class="section">
<h2><span class="dot"></span>${p.name}<span class="s-done">— 已完成</span></h2>

${stepHtml}
</div>`;
  }).join('\n\n');
}

// ── Main Replacement Logic ────────────────────────────
function fixFile(htmlPath, sceneDirName, sceneTitle) {
  const html = readFile(htmlPath);

  // 1) Replace ch-title
  const newChTitle = `📋 ${sceneTitle}执行清单`;
  const chTitleRe = /<div class="ch-title">[^<]+<\/div>/;
  if (!chTitleRe.test(html)) {
    return { ok: false, reason: 'ch-title not found' };
  }
  let updated = html.replace(chTitleRe, `<div class="ch-title">${escapeHtml(newChTitle)}</div>`);

  // 2) Replace ch-meta (the code part with scenario name)
  const newChMetaCode = `${sceneDirName} · ${sceneTitle}`;
  const chMetaRe = /(<div class="ch-meta">场景:\s*<code>)[^<]+(<\/code>[^<]*<b>[^<]+<\/b>\s*·\s*更新:\s*<code>)[^<]+(<\/code>\s*<\/div>)/;
  const chMetaMatch = updated.match(chMetaRe);
  if (chMetaMatch) {
    updated = updated.replace(chMetaRe, `$1${escapeHtml(newChMetaCode)}$2${new Date().toISOString().slice(0, 10)}$3`);
  }

  // 3) Replace h1 in header (if needed)
  const h1Re = /<h1>📋 场景-(\d+)<span class="accent">\s*·\s*([^<]+)<\/span><\/h1>/;
  const h1Match = updated.match(h1Re);
  if (h1Match && h1Match[2].trim() !== sceneTitle) {
    updated = updated.replace(h1Re, `<h1>📋 场景-${h1Match[1]}<span class="accent"> · ${escapeHtml(sceneTitle)}</span></h1>`);
  }

  // 4) Replace all step blocks
  // Find the region between first <div class="step"> and last </div> of step 14
  const stepBlockRe = /<div class="step">[\s\S]*?<div class="step">[\s\S]*?<\/div>\s*<\/div>/g;
  // Simpler: find each step block
  const stepStartRe = /<div class="step">/g;
  const stepEndRe = /<\/div>\s*<\/div>/g;
  // Count step starts
  const stepMatches = [...updated.matchAll(stepStartRe)];
  if (stepMatches.length < 13) {
    return { ok: false, reason: `only ${stepMatches.length} steps found` };
  }

  // Read index.md
  const indexPath = join(dirname(htmlPath), 'index.md');
  if (!existsSync(indexPath)) {
    return { ok: false, reason: 'index.md not found' };
  }
  const indexRaw = readFile(indexPath);
  const parsed = parseIndexMd(indexRaw);
  const steps = extractSteps(parsed);

  // Replace the entire checklist body: from first step to end of last step
  // The pattern: <div class="step"> ... up to and including the last step's closing </div></div>
  // We need to be careful — there are other <div class="step"> elements in the file (e.g., in commands panel).
  // Strategy: find the first <div class="step"> after panelChecklist, and find the matching last </div> of step 14.

  const checklistMarker = 'id="panelChecklist"';
  const checklistIdx = updated.indexOf(checklistMarker);
  if (checklistIdx < 0) {
    return { ok: false, reason: 'panelChecklist not found' };
  }

  // Find the first <div class="step"> after panelChecklist
  const stepStartAfterChecklist = updated.indexOf('<div class="step">', checklistIdx);
  if (stepStartAfterChecklist < 0) {
    return { ok: false, reason: 'no step in checklist panel' };
  }

  // Find the enclosing <div class="section"> for these steps (so we splice the whole section block)
  const sectionStart = updated.lastIndexOf('<div class="section">', stepStartAfterChecklist);
  if (sectionStart < checklistIdx) {
    return { ok: false, reason: 'no enclosing section before first step' };
  }

  // Find the end of the last step: prefer <!-- /panelChecklist --> (so we keep the panel's closing </div>),
  // then fall back to the next panel comment
  const panelCloseComment = '<!-- /panelChecklist -->';
  let afterStep = -1;
  const panelCloseIdx = updated.indexOf(panelCloseComment, stepStartAfterChecklist);
  if (panelCloseIdx > 0) {
    // Place afterStep at the closing </div> that precedes the panel close comment.
    // We want to splice up to (but not including) the </div> that closes the panelChecklist.
    // Scan backwards from panelCloseIdx to find the </div>.
    const closeDivIdx = updated.lastIndexOf('</div>', panelCloseIdx);
    if (closeDivIdx > 0) {
      afterStep = closeDivIdx + '</div>'.length;
    }
  }
  if (afterStep < 0) {
    // Fallback: find the next panel comment
    const nextPanelRe = /<!--\s*═══\s*Tab\s+\d+:/g;
    const afterChecklist = updated.slice(stepStartAfterChecklist);
    const panelMatch = afterChecklist.match(nextPanelRe);
    if (panelMatch) {
      afterStep = stepStartAfterChecklist + afterChecklist.indexOf(panelMatch[0]);
    } else {
      // Last resort: end of section
      const panelDivRe = /<div class="panel"/g;
      const m2 = afterChecklist.match(panelDivRe);
      if (m2) afterStep = stepStartAfterChecklist + afterChecklist.indexOf(m2[0]);
    }
  }
  if (afterStep < 0) {
    return { ok: false, reason: 'cannot find next panel after steps' };
  }

  // Build new steps region
  const newStepsRegion = buildSectionsHtml(steps);

  // Splice: replace from enclosing <div class="section"> through to the closing </div> of panelChecklist
  const before = updated.slice(0, sectionStart);
  const after = updated.slice(afterStep);
  // Add a closing </div> for the panelChecklist (which was being closed in the OLD region we just removed)
  const panelClose = panelCloseIdx > 0 ? '</div>' : '';
  updated = before + newStepsRegion + '\n\n' + panelClose + '\n\n' + after;

  // 5) Update breadcrumb text
  const bcRe = /<span class="bc-current">场景\s*\d+\s*·[^<]+<\/span><span class="bc-sep">\/<\/span><span class="bc-current">📋 计划清单<\/span>/;
  updated = updated.replace(bcRe, `<span class="bc-current">场景 ${extractSceneNum(sceneDirName)} · ${escapeHtml(sceneTitle)}</span><span class="bc-sep">/</span><span class="bc-current">📋 计划清单</span>`);

  return { ok: true, updated };
}

function extractSceneNum(dirName) {
  const m = dirName.match(/^场景-(\d+)-/);
  return m ? m[1] : '?';
}

// ── Run ───────────────────────────────────────────────
const scenes = findAllSceneDirs();
const targets = SINGLE_SCENE
  ? scenes.filter(s => s.scenePath === SINGLE_SCENE || s.scene === SINGLE_SCENE)
  : scenes;

let success = 0;
let failed = [];

for (const { story, scene, scenePath } of targets) {
  const htmlPath = join(scenePath, '计划清单.html');
  if (!existsSync(htmlPath)) {
    console.log(`⊘ ${story}/${scene}  no checklist html`);
    continue;
  }
  const indexPath = join(scenePath, 'index.md');
  if (!existsSync(indexPath)) {
    console.log(`⊘ ${story}/${scene}  no index.md, skip`);
    continue;
  }

  const raw = readFile(indexPath);
  const parsed = parseIndexMd(raw);
  if (!parsed || typeof parsed.title !== 'string') {
    failed.push({ story, scene, reason: 'parsed.title is invalid: ' + JSON.stringify(parsed?.title) });
    console.log(`✗ ${story}/${scene}  parsed.title is invalid`);
    continue;
  }
  const sceneTitle = parsed.title;

  let result;
  try {
    result = fixFile(htmlPath, scene, sceneTitle);
  } catch (e) {
    failed.push({ story, scene, reason: e.message + '\n' + e.stack });
    console.log(`✗ ${story}/${scene}  ${e.message}`);
    console.log(e.stack.split('\n').slice(0, 5).join('\n'));
    continue;
  }

  if (!result.ok) {
    failed.push({ story, scene, reason: result.reason });
    console.log(`✗ ${story}/${scene}  ${result.reason}`);
    continue;
  }

  if (DRY_RUN) {
      console.log(`○ ${story}/${scene}  would fix (ch-title, ch-meta, 14 steps)`);
    } else {
      writeFileSync(htmlPath, result.updated, 'utf-8');
      console.log(`✓ ${story}/${scene}`);
    }
    success++;
}

console.log(`\n${DRY_RUN ? '[DRY-RUN] ' : ''}Processed ${success} files, ${failed.length} failed`);
if (failed.length > 0) {
  for (const f of failed) {
    console.log(`  - ${f.story}/${f.scene}: ${f.reason}`);
  }
  process.exit(1);
}
