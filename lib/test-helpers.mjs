/**
 * Shared test helpers — file system, path, and content utilities
 * for YrY self-test suites.
 */

import { readFileSync, readdirSync, existsSync, statSync } from 'node:fs';
import { resolve, dirname, basename, extname } from 'node:path';
import { fileURLToPath } from 'node:url';

// ── Path constants ────────────────────────────────────────────────
const LIB_DIR = dirname(fileURLToPath(import.meta.url));
// test-helpers.mjs is at lib/ — go up one level to reach project root
export const PROJECT_ROOT = resolve(LIB_DIR, '..');

export const DIRS = {
  skills: resolve(PROJECT_ROOT, 'skills'),
  agents: resolve(PROJECT_ROOT, 'agents'),
  rules: resolve(PROJECT_ROOT, 'rules'),
  docs: resolve(PROJECT_ROOT, 'docs'),
  stories: resolve(PROJECT_ROOT, 'docs', '故事任务面板'),
  claude: resolve(PROJECT_ROOT, '.claude'),
};

// ── File system helpers ───────────────────────────────────────────
/** @param {string} relativePath - Path relative to project root
 *  @returns {boolean} True if file exists */
export function fileExists(relativePath) {
  return existsSync(resolve(PROJECT_ROOT, relativePath));
}

/**
 * Read a file as UTF-8 string.
 * @param {string} relativePath - Path relative to project root
 * @returns {string} File content
 */
export function readFile(relativePath) {
  return readFileSync(resolve(PROJECT_ROOT, relativePath), 'utf-8');
}

/** Read a directory, returning an array of entry names.
 * @param {string} relativePath - Path relative to project root
 * @returns {string[]} Entry names */
export function readDir(relativePath) {
  return readdirSync(resolve(PROJECT_ROOT, relativePath));
}

/** Check if a path is a directory (and exists).
 * @param {string} relativePath - Path relative to project root
 * @returns {boolean} */
export function isDir(relativePath) {
  const full = resolve(PROJECT_ROOT, relativePath);
  return existsSync(full) && statSync(full).isDirectory();
}

// ── Content checks ────────────────────────────────────────────────
/** Check if markdown content has a section with the given heading.
 * @param {string} content - Markdown content
 * @param {string} heading - Heading text to match (e.g. "Agent 角色")
 * @returns {boolean} */
export function hasSection(content, heading) {
  const pattern = new RegExp(`^#{1,4}\\s+${escapeRegex(heading)}`, 'm');
  return pattern.test(content);
}

/** Check if content contains a mermaid diagram block.
 * @param {string} content
 * @returns {boolean} */
export function hasMermaidDiagram(content) {
  return /```mermaid/.test(content);
}

/** Check if content contains a markdown table row.
 * @param {string} content
 * @returns {boolean} */
export function hasTable(content) {
  return /^\|.*\|.*\|$/m.test(content);
}

/** Count markdown-style links `[text](url)` in content.
 * @param {string} content
 * @returns {number} */
export function countMarkdownLinks(content) {
  const matches = content.match(/\[([^\]]+)\]\(([^)]+)\)/g);
  return matches ? matches.length : 0;
}

// ── String helpers ────────────────────────────────────────────────
/** Escape regex metacharacters in a string for safe embedding in a RegExp.
 * @param {string} str
 * @returns {string} Escaped string */
export function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/** Parse simple YAML frontmatter (key: value pairs) from markdown content.
 * @param {string} content - Markdown with optional `---\n...\n---` header
 * @returns {object|null} Parsed frontmatter, or null if absent */
export function parseFrontmatter(content) {
  const match = content.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return null;
  const fm = {};
  for (const line of match[1].split('\n')) {
    const colon = line.indexOf(':');
    if (colon > 0) {
      const key = line.slice(0, colon).trim();
      let value = line.slice(colon + 1).trim();
      // Unquote
      if ((value.startsWith('"') && value.endsWith('"')) ||
          (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }
      fm[key] = value;
    }
  }
  return fm;
}

// ── List all items in a category ──────────────────────────────────
/** List all skill directory names under skills/.
 * @returns {string[]} */
export function listSkills() {
  return readDir('skills').filter(d => isDir(`skills/${d}`));
}

/** List all known agent role names (pm, coder, tester, etc.) found across skills.
 * @returns {string[]} */
export function listAgents() {
  // Agents are now integrated into skills — scan for agent role files across all skills
  const skills = readDir('skills');
  const agentNames = new Set();
  for (const skill of skills) {
    try {
      const files = readDir(`skills/${skill}`);
      for (const f of files) {
        // Agent role files are direct .md files in skill dirs (not SKILL.md, not formulas.md, etc.)
        const knownAgents = ['pm', 'coder', 'tester', 'security', 'reporter',
          'planner', 'architect', 'code-reviewer', 'self-improve', 'AGENT'];
        const name = basename(f, '.md');
        if (knownAgents.includes(name)) {
          agentNames.add(name);
        }
      }
    } catch { /* Expected: not all skills have agent .md files */ }
  }
  return [...agentNames];
}

/** List all rule file basenames (without `.md`) under skills/&lt;name&gt;/rules/.
 * @returns {string[]} */
export function listRules() {
  // Rules are now integrated into skills under skills/*/rules/
  const skills = readDir('skills');
  const ruleNames = [];
  for (const skill of skills) {
    try {
      const files = readDir(`skills/${skill}/rules`);
      for (const f of files) {
        if (f.endsWith('.md')) {
          ruleNames.push(basename(f, '.md'));
        }
      }
    } catch { /* Expected: not all skills have rules/ subdirectory */ }
  }
  return ruleNames;
}

/** List story directory names under docs/故事任务面板/.
 * @returns {string[]} */
export function listStoryDirs() {
  if (!existsSync(DIRS.stories)) return [];
  return readdirSync(DIRS.stories).filter(d => {
    const full = resolve(DIRS.stories, d);
    return statSync(full).isDirectory() && !d.startsWith('.');
  });
}
