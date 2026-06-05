/**
 * Shared test helpers — file system, path, and content utilities
 * for YrY self-test suites.
 */

import { readFileSync, readdirSync, existsSync, statSync } from 'node:fs';
import { resolve, dirname, basename, extname } from 'node:path';
import { fileURLToPath } from 'node:url';

// ── Path constants ────────────────────────────────────────────────
const TESTS_DIR = dirname(fileURLToPath(import.meta.url));
// helpers.mjs is at tests/lib/ — go up two levels to reach project root
export const PROJECT_ROOT = resolve(TESTS_DIR, '..', '..');

export const DIRS = {
  skills: resolve(PROJECT_ROOT, 'skills'),
  agents: resolve(PROJECT_ROOT, 'agents'),
  rules: resolve(PROJECT_ROOT, 'rules'),
  docs: resolve(PROJECT_ROOT, 'docs'),
  stories: resolve(PROJECT_ROOT, 'docs', '故事任务面板'),
  claude: resolve(PROJECT_ROOT, '.claude'),
};

// ── File system helpers ───────────────────────────────────────────
export function fileExists(relativePath) {
  return existsSync(resolve(PROJECT_ROOT, relativePath));
}

export function readFile(relativePath) {
  return readFileSync(resolve(PROJECT_ROOT, relativePath), 'utf-8');
}

export function readDir(relativePath) {
  return readdirSync(resolve(PROJECT_ROOT, relativePath));
}

export function isDir(relativePath) {
  const full = resolve(PROJECT_ROOT, relativePath);
  return existsSync(full) && statSync(full).isDirectory();
}

// ── Content checks ────────────────────────────────────────────────
export function hasSection(content, heading) {
  const pattern = new RegExp(`^#{1,4}\\s+${escapeRegex(heading)}`, 'm');
  return pattern.test(content);
}

export function hasMermaidDiagram(content) {
  return /```mermaid/.test(content);
}

export function hasTable(content) {
  return /^\|.*\|.*\|$/m.test(content);
}

export function countMarkdownLinks(content) {
  const matches = content.match(/\[([^\]]+)\]\(([^)]+)\)/g);
  return matches ? matches.length : 0;
}

// ── String helpers ────────────────────────────────────────────────
export function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

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
export function listSkills() {
  return readDir('skills').filter(d => isDir(`skills/${d}`));
}

export function listAgents() {
  return readDir('agents')
    .filter(f => f.endsWith('.md') && f !== 'AGENT.md')
    .map(f => basename(f, '.md'));
}

export function listRules() {
  return readDir('rules')
    .filter(f => f.endsWith('.md'))
    .map(f => basename(f, '.md'));
}

export function listStoryDirs() {
  if (!existsSync(DIRS.stories)) return [];
  return readdirSync(DIRS.stories).filter(d => {
    const full = resolve(DIRS.stories, d);
    return statSync(full).isDirectory() && !d.startsWith('.');
  });
}
