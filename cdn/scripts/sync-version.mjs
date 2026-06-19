#!/usr/bin/env node
/* ═══════════════════════════════════════════════════════════════════════════
   sync-version.mjs — sync cdn/package.json version into downstream files

   同步版本号到:
     - cdn/index.html (meta generator content)
     - cdn/README.md (badge + version references)
     - cdn/CHANGELOG.md (latest release heading)
     - cdn/components-manifest/index.json (_meta.cdnVersion)
     - cdn/cdn-summary/index.json

   Usage:
     node scripts/sync-version.mjs              # sync from package.json
     node scripts/sync-version.mjs --bump       # bump patch, then sync
     node scripts/sync-version.mjs --bump=minor # bump minor
   ═══════════════════════════════════════════════════════════════════════════ */

import { readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const CDN = join(__dirname, '..');
const PKG_PATH = join(CDN, 'package.json');

/* ── Bump version ────────────────────────────────────────────────────────── */
function bumpVersion(current, level) {
  const parts = current.split('.').map(Number);
  if (level === 'major') { parts[0]++; parts[1] = 0; parts[2] = 0; }
  else if (level === 'minor') { parts[1]++; parts[2] = 0; }
  else { parts[2]++; } // patch
  return parts.join('.');
}

/* ── Update file with regex ──────────────────────────────────────────────── */
function updateFile(path, replacements) {
  let content;
  try { content = readFileSync(path, 'utf-8'); } catch { console.warn('  ⚠ skip (not found): %s', path); return false; }
  let changed = false;
  for (const [pattern, replacement] of replacements) {
    const before = content;
    content = content.replace(pattern, replacement);
    if (content !== before) changed = true;
  }
  if (changed) {
    writeFileSync(path, content, 'utf-8');
    console.log('  ✓ updated: %s', path);
  }
  return changed;
}

/* ── Main ────────────────────────────────────────────────────────────────── */
function main() {
  const args = process.argv.slice(2);
  const bumpArg = args.find(a => a.startsWith('--bump'));

  const pkg = JSON.parse(readFileSync(PKG_PATH, 'utf-8'));
  const oldVersion = pkg.version;

  if (bumpArg) {
    const level = bumpArg.includes('=') ? bumpArg.split('=')[1] : 'patch';
    const newVersion = bumpVersion(oldVersion, level);
    pkg.version = newVersion;
    writeFileSync(PKG_PATH, JSON.stringify(pkg, null, 2) + '\n', 'utf-8');
    console.log('Bumped: %s → %s (%s)', oldVersion, newVersion, level);
  }

  const V = pkg.version;
  console.log('Syncing version %s to downstream files...', V);

  // cdn/index.html
  updateFile(join(CDN, 'index.html'), [
    [/<meta name="cdn-version" content="[^"]*"/g, `<meta name="cdn-version" content="${V}"`],
    [/version:\s*['"]?\d+\.\d+\.\d+['"]?/g, `version: '${V}'`]
  ]);

  // cdn/README.md
  updateFile(join(CDN, 'README.md'), [
    [/(?:版本|version)[：:]\s*`?\d+\.\d+\.\d+`?/gi, `version: \`${V}\``],
    [/cdn@\d+\.\d+\.\d+/g, `cdn@${V}`],
    [/"\d+\.\d+\.\d+"/g, `"${V}"`]
  ]);

  // cdn/CHANGELOG.md
  updateFile(join(CDN, 'CHANGELOG.md'), [
    [/##\s+\[\d+\.\d+\.\d+\]/g, `## [${V}]`]
  ]);

  // cdn/components-manifest/index.json
  const manifestPath = join(CDN, 'components-manifest', 'index.json');
  try {
    const manifest = JSON.parse(readFileSync(manifestPath, 'utf-8'));
    if (manifest._meta) manifest._meta.cdnVersion = V;
    if (manifest.stats) manifest.stats.generatedAt = new Date().toISOString();
    writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + '\n', 'utf-8');
    console.log('  ✓ updated: %s', manifestPath);
  } catch { console.warn('  ⚠ skip: %s', manifestPath); }

  console.log('Done — version synced to %s', V);
}

main();
