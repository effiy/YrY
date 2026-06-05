import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

export const TESTS_DIR = dirname(fileURLToPath(import.meta.url));
export const PROJECT_ROOT = resolve(TESTS_DIR, '../..');

export function fileExists(relativePath) { return existsSync(resolve(PROJECT_ROOT, relativePath)); }
export function readFile(relativePath) { return readFileSync(resolve(PROJECT_ROOT, relativePath), 'utf-8'); }
export function readDir(relativePath) { return readdirSync(resolve(PROJECT_ROOT, relativePath)); }
export function fileSize(relativePath) { try { return statSync(resolve(PROJECT_ROOT, relativePath)).size; } catch { return 0; } }

export function hasSection(content, sectionName) { return content.includes(sectionName); }
export function hasPattern(content, pattern) { return new RegExp(pattern).test(content); }
export function countPattern(content, pattern) { return (content.match(new RegExp(pattern, 'g')) || []).length; }

export function getMarkdownHeadings(content) {
  const headings = [];
  for (const m of content.matchAll(/^#{1,6}\s+(.+)$/gm)) headings.push(m[1]);
  return headings;
}
