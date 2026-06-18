/**
 * validate.mjs — 校验脚本(三合一)
 *
 * 三类校验:
 *   1. components  - 所有 yry- 前缀组件的完整性(三件套齐备)
 *   2. manifest    - components.manifest.json 与磁盘文件一致
 *   3. version     - package.json / index.html / README 等版本号一致
 *
 * 模式:
 *   node scripts/validate.mjs                    全部校验
 *   node scripts/validate.mjs --only=components 仅校验组件完整性
 *   node scripts/validate.mjs --only=manifest    仅校验 manifest
 *   node scripts/validate.mjs --only=version     仅校验版本
 *
 * 退出码:
 *   0 - 全部通过
 *   1 - 发现不一致
 *
 * 约束: 纯 Node ESM,无 class/extends
 */

import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const CDN_ROOT = join(__dirname, '..');

// ── CLI 解析 ──────────────────────────────────────────────────────────
const args = process.argv.slice(2);
const onlyArg = args.find((a) => a.startsWith('--only='));
const ONLY = onlyArg ? onlyArg.split('=')[1] : 'all';

if (!['all', 'components', 'manifest', 'version'].includes(ONLY)) {
  console.error(`[validate] 未知 --only 值: ${ONLY}`);
  console.error('  可选: all | components | manifest | version');
  process.exit(2);
}

// ── 工具 ────────────────────────────────────────────────────────────────
function readJSON(path) {
  return JSON.parse(readFileSync(path, 'utf8'));
}
function readText(path) {
  return existsSync(path) ? readFileSync(path, 'utf8') : '';
}
function listDirs(prefix) {
  if (!existsSync(CDN_ROOT)) return [];
  return readdirSync(CDN_ROOT, { withFileTypes: true })
    .filter((d) => d.isDirectory() && d.name.startsWith(prefix))
    .map((d) => d.name)
    .sort();
}

// ── 校验 1: components 完整性 ──────────────────────────────────────────
function validateComponents() {
  const issues = [];
  const componentDirs = listDirs('yry-');
  for (const dir of componentDirs) {
    const dirPath = join(CDN_ROOT, dir);
    const html = existsSync(join(dirPath, 'index.html'));
    const css = existsSync(join(dirPath, 'index.css'));
    const js = existsSync(join(dirPath, 'index.js'));

    const jsSource = readText(join(dirPath, 'index.js'));
    const isVue = jsSource && /defineCustomElement|window\.Vue/.test(jsSource);

    if (isVue) {
      if (!html || !css || !js) {
        issues.push({ kind: 'incomplete', dir, missing: { html: !html, css: !css, js: !js } });
      }
    } else {
      if (!css || !js) {
        issues.push({ kind: 'incomplete', dir, missing: { html: !html, css: !css, js: !js } });
      }
    }
  }

  const requiredFiles = [
    'package.json',
    'README.md',
    '.npmignore',
    'shared.css',
    'shared.js',
    'theme.css',
    'theme-mono.css',
    'fonts.css'
  ];
  for (const f of requiredFiles) {
    if (!existsSync(join(CDN_ROOT, f))) {
      issues.push({ kind: 'missing-root', file: f });
    }
  }

  for (const weight of [400, 500, 600, 700]) {
    const fontPath = join(CDN_ROOT, 'fonts', `jetbrains-mono-latin-${weight}-normal.woff2`);
    if (!existsSync(fontPath)) {
      issues.push({ kind: 'missing-font', weight });
    }
  }

  return { componentCount: componentDirs.length, issues };
}

// ── 校验 2: manifest 一致性 ───────────────────────────────────────────
function validateManifest() {
  const issues = [];
  const manifestPath = join(CDN_ROOT, 'components.manifest.json');
  if (!existsSync(manifestPath)) {
    return { issues: [{ kind: 'missing-manifest' }] };
  }
  const manifest = readJSON(manifestPath);
  const diskDirs = new Set(listDirs('yry-'));
  const manifestDirs = new Set(manifest.components.map((c) => c.name));

  for (const name of manifestDirs) {
    if (!diskDirs.has(name)) {
      issues.push({ kind: 'orphan-in-manifest', name });
    }
  }
  for (const name of diskDirs) {
    if (!manifestDirs.has(name)) {
      issues.push({ kind: 'missing-in-manifest', name });
    }
  }
  const pkg = readJSON(join(CDN_ROOT, 'package.json'));
  if (manifest._meta.cdnVersion !== pkg.version) {
    issues.push({
      kind: 'stale-manifest-version',
      manifestVersion: manifest._meta.cdnVersion,
      packageVersion: pkg.version
    });
  }

  return {
    manifestComponents: manifest.components.length,
    diskComponents: diskDirs.size,
    issues
  };
}

// ── 校验 3: 版本一致性 ────────────────────────────────────────────────
function validateVersion() {
  const issues = [];
  const pkg = readJSON(join(CDN_ROOT, 'package.json'));
  const version = pkg.version;

  const targets = ['index.html', 'README.md', 'CHANGELOG.md', '健康报告/index.html'];

  const cdnUrlRe = /(cdn\.jsdelivr\.net\/npm\/|unpkg\.com\/)(yry-cdn(?:-lib)?)@(\d+\.\d+\.\d+(?:-[\w.]+)?)/g;
  const packageRefRe = /yry-cdn(?:-lib)?\s+v(\d+\.\d+\.\d+(?:-[\w.]+)?)/g;
  const footerRe = /(<yry-footer-note[^>]*version=)(["'])(\d+\.\d+\.\d+(?:-[\w.]+)?)\2/g;
  const emojiVerRe = /([\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}] )v(\d+\.\d+\.\d+(?:-[\w.]+)?)/gu;

  for (const relPath of targets) {
    const absPath = join(CDN_ROOT, relPath);
    if (!existsSync(absPath)) continue;
    const text = readText(absPath);

    const patterns = [
      { name: 'cdn-url', re: cdnUrlRe, idx: 3 },
      { name: 'package-ref', re: packageRefRe, idx: 1 },
      { name: 'footer-version', re: footerRe, idx: 3 },
      { name: 'emoji-version', re: emojiVerRe, idx: 2 }
    ];
    for (const { name, re, idx } of patterns) {
      re.lastIndex = 0;
      let m;
      while ((m = re.exec(text)) !== null) {
        if (m[idx] !== version) {
          issues.push({
            kind: 'version-mismatch',
            file: relPath,
            pattern: name,
            current: m[idx],
            expected: version
          });
        }
      }
    }
  }

  return { version, targets: targets.length, issues };
}

// ── 主流程 ──────────────────────────────────────────────────────────────
function run(label, fn) {
  console.log(`\n─── ${label} ───`);
  const result = fn();
  if (result.issues.length === 0) {
    console.log(`  ✓ 全部通过`);
    if (result.componentCount) console.log(`    · ${result.componentCount} 个组件`);
    if (result.manifestComponents) {
      console.log(`    · manifest: ${result.manifestComponents}, 磁盘: ${result.diskComponents}`);
    }
    if (result.version) {
      console.log(`    · 版本: ${result.version}, 扫描 ${result.targets} 文件`);
    }
    return 0;
  }
  console.log(`  ✗ ${result.issues.length} 处问题:`);
  for (const it of result.issues) {
    console.log(`    · ${JSON.stringify(it)}`);
  }
  return 1;
}

function main() {
  console.log(`[validate] mode = ${ONLY}`);

  let exitCode = 0;

  if (ONLY === 'all' || ONLY === 'components') {
    const r = run('校验 1: 组件完整性', validateComponents);
    exitCode = exitCode || r;
  }
  if (ONLY === 'all' || ONLY === 'manifest') {
    const r = run('校验 2: manifest 一致性', validateManifest);
    exitCode = exitCode || r;
  }
  if (ONLY === 'all' || ONLY === 'version') {
    const r = run('校验 3: 版本一致性', validateVersion);
    exitCode = exitCode || r;
  }

  console.log('');
  if (exitCode === 0) {
    console.log(`[validate] ✓ 全部通过`);
  } else {
    console.log(`[validate] ✗ 存在不一致,exit 1`);
  }
  process.exit(exitCode);
}

main();
