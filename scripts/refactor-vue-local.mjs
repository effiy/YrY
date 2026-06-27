/**
 * refactor-vue-local.mjs
 *
 * Replace https://unpkg.com/vue@3/dist/vue.global.prod.js with local relative paths
 * to cdn/shared/vue.global.prod.js in all project files.
 *
 * Also removes unpkg.com preconnect/dns-prefetch hints.
 *
 * Usage: node scripts/refactor-vue-local.mjs [--dry-run]
 */

import { readFileSync, writeFileSync } from 'node:fs';
import { relative, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const TARGET = resolve(ROOT, 'cdn/shared/vue.global.prod.js');
const DRY_RUN = process.argv.includes('--dry-run');

const UNPKG_VUE_URL = 'https://unpkg.com/vue@3/dist/vue.global.prod.js';
const UNPKG_DOMAIN = 'https://unpkg.com';

// Find all files containing the unpkg vue URL
function findFiles() {
  const result = execSync(
    `grep -rl "${UNPKG_VUE_URL}" "${ROOT}" --include="*.html" --include="*.js" --include="*.mjs" --include="*.md" 2>/dev/null || true`,
    { encoding: 'utf-8' }
  );
  const scriptPath = fileURLToPath(import.meta.url);
  return result.trim().split('\n').filter(Boolean).filter(f => f !== scriptPath);
}

// Also find files with unpkg.com preconnect/dns-prefetch
function findUnpkgHintFiles() {
  const result = execSync(
    `grep -rl "${UNPKG_DOMAIN}" "${ROOT}" --include="*.html" 2>/dev/null || true`,
    { encoding: 'utf-8' }
  );
  return result.trim().split('\n').filter(Boolean);
}

function countOccurrences(str, substr) {
  let count = 0;
  let pos = 0;
  while ((pos = str.indexOf(substr, pos)) !== -1) {
    count++;
    pos += substr.length;
  }
  return count;
}

function processFile(filePath) {
  const fileDir = dirname(filePath);
  let relPath = relative(fileDir, TARGET);
  // Ensure no leading './' for cleaner output, but keep relative
  // relative() already handles this correctly

  let content = readFileSync(filePath, 'utf-8');
  const original = content;

  // Count occurrences
  const count = countOccurrences(content, UNPKG_VUE_URL);
  if (count === 0) return { file: filePath, replaced: 0, hintsRemoved: 0 };

  // Replace the unpkg Vue URL with local relative path
  content = content.split(UNPKG_VUE_URL).join(relPath);

  // Remove preconnect/dns-prefetch hints for unpkg.com
  let hintsRemoved = 0;

  // Remove preconnect link for unpkg.com
  const preconnectPattern = new RegExp(
    `^\\s*<link\\s+rel="preconnect"\\s+href="${UNPKG_DOMAIN}"[^>]*>\\s*\\n`,
    'gm'
  );
  const preconnectMatches = content.match(preconnectPattern);
  if (preconnectMatches) {
    hintsRemoved += preconnectMatches.length;
    content = content.replace(preconnectPattern, '');
  }

  // Remove dns-prefetch link for unpkg.com
  const dnsPrefetchPattern = new RegExp(
    `^\\s*<link\\s+rel="dns-prefetch"\\s+href="${UNPKG_DOMAIN}"[^>]*>\\s*\\n`,
    'gm'
  );
  const dnsMatches = content.match(dnsPrefetchPattern);
  if (dnsMatches) {
    hintsRemoved += dnsMatches.length;
    content = content.replace(dnsPrefetchPattern, '');
  }

  if (!DRY_RUN) {
    writeFileSync(filePath, content, 'utf-8');
  }

  return { file: filePath, replaced: count, hintsRemoved };
}

// ── Main ─────────────────────────────────────────────────────────────────

console.log('Target:', relative(ROOT, TARGET));
console.log('Mode:', DRY_RUN ? 'DRY RUN' : 'LIVE');
console.log('');

const files = findFiles();
console.log(`Found ${files.length} files with unpkg Vue URL\n`);

let totalReplaced = 0;
let totalHintsRemoved = 0;

for (const file of files) {
  const { file: f, replaced, hintsRemoved } = processFile(file);
  if (replaced > 0 || hintsRemoved > 0) {
    const shortPath = relative(ROOT, f);
    const computedRel = relative(dirname(f), TARGET);
    console.log(`  ${shortPath}`);
    console.log(`    → ${computedRel}  (${replaced} replacements)`);
    if (hintsRemoved > 0) {
      console.log(`    → ${hintsRemoved} unpkg hints removed`);
    }
    totalReplaced += replaced;
    totalHintsRemoved += hintsRemoved;
  }
}

// Also check for files with only unpkg hints (no vue URL)
const hintFiles = findUnpkgHintFiles();
for (const file of hintFiles) {
  if (files.includes(file)) continue; // already processed
  let content = readFileSync(file, 'utf-8');
  const original = content;
  let hintsRemoved = 0;

  const preconnectPattern = new RegExp(
    `^\\s*<link\\s+rel="preconnect"\\s+href="${UNPKG_DOMAIN}"[^>]*>\\s*\\n`,
    'gm'
  );
  const m1 = content.match(preconnectPattern);
  if (m1) { hintsRemoved += m1.length; content = content.replace(preconnectPattern, ''); }

  const dnsPrefetchPattern = new RegExp(
    `^\\s*<link\\s+rel="dns-prefetch"\\s+href="${UNPKG_DOMAIN}"[^>]*>\\s*\\n`,
    'gm'
  );
  const m2 = content.match(dnsPrefetchPattern);
  if (m2) { hintsRemoved += m2.length; content = content.replace(dnsPrefetchPattern, ''); }

  if (hintsRemoved > 0 && content !== original) {
    if (!DRY_RUN) writeFileSync(file, content, 'utf-8');
    console.log(`  ${relative(ROOT, file)} → ${hintsRemoved} unpkg hints removed`);
    totalHintsRemoved += hintsRemoved;
  }
}

console.log('');
console.log(`Total: ${totalReplaced} URLs replaced, ${totalHintsRemoved} unpkg hints removed`);
if (DRY_RUN) console.log('[DRY RUN] No files were modified.');
