#!/usr/bin/env node
/* ═══════════════════════════════════════════════════════════════════════════
   validate.mjs — YrY CDN 验证工具

   验证维度:
     - manifest:  components-manifest/index.json 与实际文件一致性
     - version:   package.json 版本号与各文件的一致性
     - components: 组件文件完整性 + CSS token 规范性 + 硬编码颜色检测
     - tokens:    tokens/index.css 设计令牌完整性

   Usage:
     node scripts/validate.mjs                       # 全部验证
     node scripts/validate.mjs --only=manifest       # 仅 manifest
     node scripts/validate.mjs --only=version        # 仅 version
     node scripts/validate.mjs --only=components     # 仅 components
     node scripts/validate.mjs --only=tokens         # 仅 tokens
     node scripts/validate.mjs --fix                 # 自动修复可修复问题
   ═══════════════════════════════════════════════════════════════════════════ */

import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const CDN = join(__dirname, '..');

const $$ = { errors: 0, warnings: 0, fixes: 0 };
function err(msg) { console.error('  ❌ ' + msg); $$.errors++; }
function warn(msg) { console.warn('  ⚠️  ' + msg); $$.warnings++; }
function ok(msg) { console.log('  ✓ ' + msg); }
function info(msg) { console.log('  ℹ️  ' + msg); }

/* ── Validate manifest ───────────────────────────────────────────────────── */
function validateManifest() {
  console.log('\n── Manifest ──');
  const mp = join(CDN, 'components-manifest', 'index.json');
  if (!existsSync(mp)) { err('components-manifest/index.json missing'); return; }

  let manifest;
  try { manifest = JSON.parse(readFileSync(mp, 'utf-8')); } catch (e) { err('Invalid JSON: ' + e.message); return; }
  if (!manifest._meta) { err('_meta missing'); return; }
  if (!manifest.components) { err('components array missing'); return; }

  const actualDirs = new Set(
    readdirSync(CDN, { withFileTypes: true })
      .filter(d => d.isDirectory() && d.name.startsWith('yry-'))
      .map(d => d.name)
  );
  const manifestDirs = new Set(manifest.components.map(c => c.name));

  // Manifest has entries for non-existent dirs
  for (const name of manifestDirs) {
    if (!actualDirs.has(name)) warn(`manifest entry "${name}" has no matching directory`);
  }
  // Actual dirs not in manifest
  for (const name of actualDirs) {
    if (!manifestDirs.has(name)) warn(`directory "${name}" not in manifest`);
  }

  // Validate each component has required files per manifest
  let fileMismatch = 0;
  for (const c of manifest.components) {
    for (const f of ['html', 'css', 'js']) {
      const actualExists = existsSync(join(CDN, c.name, `index.${f}`));
      if (actualExists !== c.files[f]?.exists) {
        warn(`${c.name}/index.${f}: manifest says ${c.files[f]?.exists}, actual ${actualExists}`);
        fileMismatch++;
      }
    }
  }
  if (fileMismatch === 0) ok('all file existence records match disk');
}

/* ── Validate version ────────────────────────────────────────────────────── */
function validateVersion() {
  console.log('\n── Version ──');
  const pkg = JSON.parse(readFileSync(join(CDN, 'package.json'), 'utf-8'));
  const V = pkg.version;
  ok(`package.json version: ${V}`);

  // Check index.html
  try {
    const html = readFileSync(join(CDN, 'index.html'), 'utf-8');
    const vm = html.match(/cdn-version["\s]+content=["']([^"']+)["']/);
    if (vm && vm[1] !== V) warn(`index.html version ${vm[1]} ≠ package.json ${V}`);
    else if (!vm) warn('index.html: no cdn-version meta tag');
    else ok('index.html version matches');
  } catch { warn('index.html not found'); }

  // Check README
  try {
    const readme = readFileSync(join(CDN, 'README.md'), 'utf-8');
    if (!readme.includes(V)) warn(`README.md may not reference version ${V}`);
    else ok('README.md references current version');
  } catch { /* skip */ }

  // Check manifest
  try {
    const manifest = JSON.parse(readFileSync(join(CDN, 'components-manifest', 'index.json'), 'utf-8'));
    if (manifest._meta?.cdnVersion !== V) warn(`manifest version ${manifest._meta?.cdnVersion} ≠ package.json ${V}`);
    else ok('manifest version matches');
  } catch { warn('manifest not found'); }
}

/* ── Validate components ─────────────────────────────────────────────────── */
function validateComponents() {
  console.log('\n── Components ──');
  const dirs = readdirSync(CDN, { withFileTypes: true })
    .filter(d => d.isDirectory() && d.name.startsWith('yry-'))
    .map(d => d.name)
    .sort();

  let total = 0, complete = 0, cssOk = 0, cssHardcoded = 0, jsOk = 0;
  const hardcodedColors = [];

  for (const name of dirs) {
    total++;
    const dir = join(CDN, name);
    const hasHtml = existsSync(join(dir, 'index.html'));
    const hasCss = existsSync(join(dir, 'index.css'));
    const hasJs = existsSync(join(dir, 'index.js'));

    if (hasHtml && hasCss && hasJs) complete++;
    else {
      const missing = [];
      if (!hasHtml) missing.push('html');
      if (!hasCss) missing.push('css');
      if (!hasJs) missing.push('js');
      warn(`${name}: missing ${missing.join(', ')}`);
    }

    // CSS validation: check for hardcoded hex colors
    if (hasCss) {
      const css = readFileSync(join(dir, 'index.css'), 'utf-8');
      // Find hardcoded hex colors in CSS values (NOT fallbacks inside var())
      // Strategy: strip all var() calls, THEN look for remaining hex colors
      const stripped = css.replace(/var\([^)]+\)/g, '');
      const hexRe = /(?<!\w)#([0-9a-fA-F]{3,8})\b/g;
      let m;
      const hexColors = [];
      while ((m = hexRe.exec(stripped)) !== null) {
        // Skip if inside a comment or url()
        const before = stripped.substring(Math.max(0, m.index - 30), m.index);
        if (before.includes('/*') && !before.includes('*/')) continue;
        if (before.includes('url(')) continue;
        hexColors.push(m[0].trim());
      }
      if (hexColors.length > 0) {
        cssHardcoded++;
        // Only report first 3 per component to avoid noise
        const preview = hexColors.slice(0, 3).join(', ') + (hexColors.length > 3 ? ` +${hexColors.length - 3}` : '');
        hardcodedColors.push({ name, count: hexColors.length, preview });
      } else {
        cssOk++;
      }
    }
  }

  ok(`${complete}/${total} components complete (all 3 files)`);
  ok(`${cssOk} components use only CSS variables (no hardcoded hex)`);
  if (cssHardcoded > 0) {
    warn(`${cssHardcoded} components have hardcoded hex colors (should use var(--yry-*)):`);
    for (const hc of hardcodedColors.slice(0, 10)) {
      info(`  ${hc.name}: ${hc.count} hardcoded (${hc.preview})`);
    }
    if (hardcodedColors.length > 10) info(`  ... and ${hardcodedColors.length - 10} more`);
  }
}

/* ── Validate tokens ─────────────────────────────────────────────────────── */
function validateTokens() {
  console.log('\n── Design Tokens ──');
  const tokensPath = join(CDN, 'tokens', 'index.css');
  if (!existsSync(tokensPath)) { err('tokens/index.css missing'); return; }

  const tokensCss = readFileSync(tokensPath, 'utf-8');
  const definedTokens = new Set();
  const tokRe = /--([\w-]+):/g;
  let tm;
  while ((tm = tokRe.exec(tokensCss)) !== null) definedTokens.add('--' + tm[1]);

  ok(`${definedTokens.size} design tokens defined in tokens/index.css`);

  // Check that required semantic tokens exist
  const required = ['--yry-bg', '--yry-accent', '--yry-cyan', '--yry-pass', '--yry-fail',
    '--yry-warn', '--yry-info', '--yry-text', '--yry-text2', '--yry-text3',
    '--yry-shadow', '--yry-shadow-lg', '--yry-radius', '--yry-border'];
  const missing = required.filter(t => !definedTokens.has(t));
  if (missing.length > 0) err(`Missing required tokens: ${missing.join(', ')}`);
  else ok('all required semantic tokens present');

  // Check theme CSS files import tokens
  for (const f of ['theme/index.css', 'theme-mono/index.css', 'shared/index.css', 'shared-reports/index.css']) {
    const fp = join(CDN, f);
    if (!existsSync(fp)) { warn(`${f} missing`); continue; }
    const content = readFileSync(fp, 'utf-8');
    if (!content.includes("url('../tokens/index.css')") && !content.includes('tokens/index.css')) {
      warn(`${f} should @import tokens/index.css`);
    } else {
      ok(`${f} imports tokens`);
    }
  }
}

/* ── Main ────────────────────────────────────────────────────────────────── */
function main() {
  const args = process.argv.slice(2);
  const only = args.find(a => a.startsWith('--only='))?.split('=')[1];
  const fix = args.includes('--fix');

  console.log('YrY CDN Validate');
  console.log('═══════════════');

  const run = (name) => !only || only === name;

  if (run('manifest')) validateManifest();
  if (run('version')) validateVersion();
  if (run('components')) validateComponents();
  if (run('tokens')) validateTokens();

  console.log(`\n${$$.errors > 0 ? '❌' : '✓'} ${$$.errors} errors, ${$$.warnings} warnings`);
  if (fix) console.log('  (--fix mode: auto-fixes not yet implemented)');
  process.exit($$.errors > 0 ? 1 : 0);
}

main();
