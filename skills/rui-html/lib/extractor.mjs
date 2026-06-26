/**
 * extractor.mjs — Markdown data extraction for rui-docs
 *
 * Reads a scene's index.md and extracts structured data:
 * - Scene metadata (title, version, date)
 * - §0–§4 section content
 * - Tables, mermaid blocks, lists
 */

import { readFileSync, existsSync } from 'node:fs';
import { join, basename, dirname } from 'node:path';
import { escHtml } from '../../../lib/fs.mjs';

export { escHtml as escapeHtml };

/**
 * Parse scene metadata from index.md.
 * Returns null if index.md doesn't exist.
 */
export function extractSceneData(/** @type {string} */ scenePath, /** @type {string | undefined} */ storyName) {
  const indexPath = join(scenePath, 'index.md');
  if (!existsSync(indexPath)) return null;

  const raw = readFileSync(indexPath, 'utf-8');
  const sceneDirName = basename(scenePath);

  // Parse scene number and slug from directory name: "场景-N-<slug>"
  const dirMatch = sceneDirName.match(/^场景-(\d+)-(.+)$/);
  const sceneNum = dirMatch ? parseInt(dirMatch[1], 10) : 1;
  const sceneSlug = dirMatch ? dirMatch[2] : sceneDirName;

  // Parse scene title from first heading
  const titleMatch = raw.match(/^#\s+.+?[:：]\s*(.+)$/m) || raw.match(/^#\s+(.+)$/m);
  const sceneTitle = titleMatch ? titleMatch[1].trim() : sceneSlug;

  // Parse metadata row: | v1.1.0 | 2026-06-05 | ...
  const metaMatch = raw.match(/\|\s*(v[\d.]+)\s*\|\s*(\d{4}-\d{2}-\d{2})\s*\|/);
  const version = metaMatch ? metaMatch[1] : '1.0.0';
  const date = metaMatch ? metaMatch[2] : new Date().toISOString().slice(0, 10);

  // Parse story title from navigation breadcrumb or story task file
  const storyTaskPath = join(dirname(scenePath), '故事任务.md');
  let storyTitle = storyName;
  if (existsSync(storyTaskPath)) {
    const taskRaw = readFileSync(storyTaskPath, 'utf-8');
    const taskTitleMatch = taskRaw.match(/^#\s+(.+)$/m);
    if (taskTitleMatch) storyTitle = taskTitleMatch[1].trim();
  }

  // Split into sections
  const sections = splitSections(raw);

  // Extract structured data per section
  const data = {
    storyName,
    storyTitle,
    sceneNum,
    sceneSlug,
    sceneTitle,
    version,
    date,
    sections,
    mermaidBlocks: extractMermaidBlocks(raw),
    tables: extractAllTables(raw),
    overview: extractOverview(raw),
  };

  return data;
}

/**
 * Split markdown into §0–§4 sections by anchor markers.
 */
function splitSections(/** @type {string} */ raw) {
  /** @type {Record<string, any>} */
  const sections = {};
  const secPatterns = [
    { key: 'sec0', re: /<a\s+id="sec0"><\/a>/ },
    { key: 'sec1', re: /<a\s+id="sec1"><\/a>/ },
    { key: 'sec2', re: /<a\s+id="sec2"><\/a>/ },
    { key: 'sec3', re: /<a\s+id="sec3"><\/a>/ },
    { key: 'sec4', re: /<a\s+id="sec4"><\/a>/ },
  ];

  // Also try ## §N headers as fallback
  const h2Patterns = [
    { key: 'sec0', re: /^##\s+§0\s+/m },
    { key: 'sec1', re: /^##\s+§1\s+/m },
    { key: 'sec2', re: /^##\s+§2\s+/m },
    { key: 'sec3', re: /^##\s+§3\s+/m },
    { key: 'sec4', re: /^##\s+§4\s+/m },
  ];

  for (let i = 0; i < secPatterns.length; i++) {
    const { key, re } = secPatterns[i];
    const anchorMatch = raw.match(re);
    const h2Match = raw.match(h2Patterns[i].re);
    const startMatch = anchorMatch || h2Match;

    if (!startMatch) { sections[key] = null; continue; }

    const startIdx = startMatch.index ?? 0;
    const nextIdx = findNextSectionStart(raw, startIdx + startMatch[0].length, secPatterns, i + 1);

    const content = raw.slice(startIdx, nextIdx > 0 ? nextIdx : undefined).trim();
    sections[key] = content;
  }

  return sections;
}

function findNextSectionStart(/** @type {string} */ raw, /** @type {number} */ fromIdx, /** @type {any[]} */ secPatterns, /** @type {number} */ fromI) {
  let earliest = -1;
  for (let i = fromI; i < secPatterns.length; i++) {
    const match = raw.slice(fromIdx).match(secPatterns[i].re);
    if (match && (earliest === -1 || (match.index ?? 0) < earliest)) {
      earliest = fromIdx + (match.index ?? 0);
    }
  }
  // Also check for ## § headers
  const h2Re = /^##\s+§[0-4]\s+/m;
  const remaining = raw.slice(fromIdx);
  const h2Match = remaining.match(h2Re);
  if (h2Match && (earliest === -1 || fromIdx + (h2Match.index ?? 0) < earliest)) {
    earliest = fromIdx + (h2Match.index ?? 0);
  }
  // Check for --- (horizontal rule before next section)
  const hrRe = /\n---\n/;
  const hrMatch = remaining.match(hrRe);
  if (hrMatch && (earliest === -1 || fromIdx + (hrMatch.index ?? 0) < earliest)) {
    // Only count --- if it's near a section header
    const afterHr = remaining.slice((hrMatch.index ?? 0) + 4);
    if (/^<a\s+id="sec/i.test(afterHr) || /^##\s+§/.test(afterHr)) {
      earliest = fromIdx + (hrMatch.index ?? 0);
    }
  }
  return earliest;
}

/**
 * Extract all mermaid code blocks.
 */
function extractMermaidBlocks(/** @type {string} */ raw) {
  const blocks = [];
  const re = /```mermaid\n([\s\S]*?)```/g;
  let match;
  while ((match = re.exec(raw)) !== null) {
    blocks.push({
      code: match[1].trim(),
      fullMatch: match[0],
      index: match.index,
    });
  }
  return blocks;
}

/**
 * Extract all markdown tables into structured arrays.
 */
function extractAllTables(/** @type {string} */ raw) {
  const tables = [];
  const lines = raw.split('\n');
  let i = 0;

  while (i < lines.length) {
    // Find table start: a line with pipes and a separator line following
    if (lines[i].startsWith('|') && lines[i].includes('|', 1)) {
      const headerLine = lines[i];
      const nextLine = lines[i + 1];
      if (nextLine && /^\|[\s\-:|]+\|$/.test(nextLine)) {
        // This is a table header
        const headers = parseTableRow(headerLine);
        const rows = [];
        let j = i + 2;
        while (j < lines.length && lines[j].startsWith('|')) {
          rows.push(parseTableRow(lines[j]));
          j++;
        }
        tables.push({ headers, rows, startLine: i });
        i = j;
        continue;
      }
    }
    i++;
  }

  return tables;
}

function parseTableRow(/** @type {string} */ line) {
  return line
    .replace(/^\|/, '')
    .replace(/\|$/, '')
    .split('|')
    .map((/** @type {string} */ cell) => cell.trim());
}

/**
 * Extract overview section (between ## 概述 and first ---).
 */
function extractOverview(/** @type {string} */ raw) {
  const overviewMatch = raw.match(/##\s+概述\n([\s\S]*?)\n---/);
  if (overviewMatch) return overviewMatch[1].trim();

  // Fallback: take content after first heading until first section
  const firstHeading = raw.match(/^##\s+(.+)$/m);
  if (firstHeading) {
    const afterHeading = raw.slice((firstHeading.index ?? 0) + firstHeading[0].length);
    const nextSep = afterHeading.match(/\n---\n/);
    if (nextSep) {
      return afterHeading.slice(0, nextSep.index ?? 0).trim();
    }
  }

  return null;
}

/**
 * Check if section content is placeholder (not yet filled).
 */
export function isPlaceholder(/** @type {string} */ sectionContent) {
  if (!sectionContent) return true;
  const placeholderMarkers = [
    '文档生成阶段填充',
    '> 文档生成阶段填充',
    'TODO',
    'TBD',
  ];
  const stripped = sectionContent.replace(/<[^>]+>/g, '').trim();
  if (stripped.length < 50) return true; // Very short = likely placeholder
  for (const marker of placeholderMarkers) {
    if (stripped.includes(marker)) return true;
  }
  return false;
}

/**
 * Render markdown section to simple HTML.
 * Handles: headers, tables, lists, mermaid blocks, bold, inline code, links.
 */
export function markdownToHtml(/** @type {string} */ md) {
  if (!md) return '';
  if (isPlaceholder(md)) {
    return '<div class="placeholder">数据待填充 — 运行 /rui code 生成</div>';
  }

  let html = md;

  // Extract and protect mermaid blocks
  /** @type {string[]} */
  const mermaidBlocks = [];
  html = html.replace(/```mermaid\n([\s\S]*?)```/g, (_, code) => {
    const id = `__MERMAID_${mermaidBlocks.length}__`;
    mermaidBlocks.push(code.trim());
    return id;
  });

  // Extract and protect HTML anchor tags
  /** @type {{id: string, html: string}[]} */
  const anchors = [];
  html = html.replace(/<a\s+id="([^"]*)"><\/a>/g, (match, id) => {
    const idx = anchors.length;
    anchors.push({ id, html: match });
    return `__ANCHOR_${idx}__`;
  });

  // Convert headers (## → h2, ### → h3)
  html = html.replace(/^#### (.+)$/gm, '<h4>$1</h4>');
  html = html.replace(/^### (.+)$/gm, '<h3>$1</h3>');
  html = html.replace(/^## (.+)$/gm, '<h2>$1</h2>');

  // Convert bold
  html = html.replace(/\*\*(.+?)\*\*/g, '<b>$1</b>');

  // Convert inline code
  html = html.replace(/`([^`]+)`/g, '<code>$1</code>');

  // Convert links
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');

  // Convert markdown tables to HTML tables
  html = convertTablesToHtml(html);

  // Convert unordered lists
  html = html.replace(/^(\s*)- (.+)$/gm, (_, indent, content) => {
    const level = Math.floor(indent.length / 2);
    return `${'  '.repeat(level)}<li>${content}</li>`;
  });

  // Wrap adjacent <li> in <ul>
  html = html.replace(/((?:<li>.*<\/li>\n?)+)/g, '<ul>$1</ul>');

  // Convert paragraphs (double newlines)
  html = html.replace(/\n\n+/g, '</p><p>');
  html = `<p>${html}</p>`;

  // Clean up empty paragraphs
  html = html.replace(/<p>\s*<\/p>/g, '');
  html = html.replace(/<p>\s*<(h[234]|ul|table|div)/g, '<$1');
  html = html.replace(/<\/(h[234]|ul|table|div)>\s*<\/p>/g, '</$1>');

  // Restore anchors
  anchors.forEach((a, i) => {
    html = html.replace(`__ANCHOR_${i}__`, a.html);
  });

  // Restore mermaid blocks as pre blocks (will be rendered client-side)
  mermaidBlocks.forEach((code, i) => {
    html = html.replace(
      `__MERMAID_${i}__`,
      `<pre class="mermaid">${escHtml(code)}</pre>`
    );
  });

  return html;
}

function convertTablesToHtml(/** @type {string} */ html) {
  // Find markdown tables: header row, separator row, body rows
  const lines = html.split('\n');
  const result = [];
  let i = 0;

  while (i < lines.length) {
    if (lines[i].startsWith('|') && lines[i + 1] && /^\|[\s\-:|]+\|$/.test(lines[i + 1])) {
      const headers = parseTableRow(lines[i]);
      const rows = [];
      let j = i + 2;
      while (j < lines.length && lines[j].startsWith('|')) {
        rows.push(parseTableRow(lines[j]));
        j++;
      }

      let tableHtml = '<table><thead><tr>';
      for (const h of headers) {
        tableHtml += `<th>${h}</th>`;
      }
      tableHtml += '</tr></thead><tbody>';
      for (const row of rows) {
        tableHtml += '<tr>';
        for (const cell of row) {
          // Handle emoji-only centering
          const isCentered = /^[✅❌⚠️⬜⬛☐☑️▪️▫️]$/u.test(cell.trim());
          const cls = isCentered ? ' class="td-center"' : '';
          tableHtml += `<td${cls}>${cell}</td>`;
        }
        tableHtml += '</tr>';
      }
      tableHtml += '</tbody></table>';

      result.push(tableHtml);
      i = j;
    } else {
      result.push(lines[i]);
      i++;
    }
  }

  return result.join('\n');
}
