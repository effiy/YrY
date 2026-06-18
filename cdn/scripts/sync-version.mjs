/**
 * sync-version.mjs — 版本号统一同步脚本
 *
 * 读取 package.json 的 version,然后扫描以下文件中所有匹配的版本字符串:
 *   - index.html              (jsDelivr URL · yry-* meta · footer version)
 *   - 健康报告/index.html     (jsDelivr URL)
 *   - README.md               (npm install 引用)
 *   - CHANGELOG.md            (版本标题)
 *   - components.manifest.json (由 build-manifest.mjs 自动维护)
 *
 * 模式:
 *   node scripts/sync-version.mjs              默认:dry-run,只报告
 *   node scripts/sync-version.mjs --check      同 --dry-run,但 exit 1 表示不一致 (供 CI)
 *   node scripts/sync-version.mjs --apply      实际写入文件
 *
 * 约束:
 *   - 纯 Node ESM,无第三方依赖
 *   - 无 class/extends
 */

import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const CDN_ROOT = join(__dirname, '..');

const PACKAGE_JSON_PATH = join(CDN_ROOT, 'package.json');

const SCAN_TARGETS = [
  'index.html',
  'README.md',
  'CHANGELOG.md',
  '健康报告/index.html'
];

const args = process.argv.slice(2);
const MODE = args.includes('--apply')
  ? 'apply'
  : args.includes('--check')
    ? 'check'
    : 'dry';

function readJSON(path) {
  return JSON.parse(readFileSync(path, 'utf8'));
}

function readText(path) {
  return existsSync(path) ? readFileSync(path, 'utf8') : null;
}

function writeText(path, content) {
  writeFileSync(path, content);
}

/**
 * 在文本中查找所有不一致的版本号匹配
 * 返回的每一项都满足 current !== expected
 */
function findMismatches(text, pkgVersion) {
  const all = [];
  let m;

  // ── 1. jsDelivr / unpkg 包名+版本 ──
  const cdnUrlRe = /(cdn\.jsdelivr\.net\/npm\/|unpkg\.com\/)(yry-cdn(?:-lib)?)@(\d+\.\d+\.\d+(?:-[\w.]+)?)/g;
  while ((m = cdnUrlRe.exec(text)) !== null) {
    all.push({
      offset: m.index,
      match: m[0],
      current: m[3],
      expected: pkgVersion,
      kind: 'cdn-url',
      replacement: `${m[1]}yry-cdn@${pkgVersion}`
    });
  }

  // ── 2. 文本描述里的 "yry-cdn-lib vX.Y.Z" 或 "yry-cdn vX.Y.Z" ──
  const packageRefRe = /yry-cdn(?:-lib)?\s+v(\d+\.\d+\.\d+(?:-[\w.]+)?)/g;
  while ((m = packageRefRe.exec(text)) !== null) {
    all.push({
      offset: m.index,
      match: m[0],
      current: m[1],
      expected: pkgVersion,
      kind: 'package-ref',
      replacement: `yry-cdn v${pkgVersion}`
    });
  }

  // ── 3. footer-note version="X.Y.Z" 属性 ──
  const footerRe = /(<yry-footer-note[^>]*version=)(["'])(\d+\.\d+\.\d+(?:-[\w.]+)?)\2/g;
  while ((m = footerRe.exec(text)) !== null) {
    all.push({
      offset: m.index,
      match: m[0],
      current: m[3],
      expected: pkgVersion,
      kind: 'footer-version',
      replacement: `${m[1]}${m[2]}${pkgVersion}${m[2]}`
    });
  }

  // ── 4. emoji 标签里的 "vX.Y.Z" (📦 v1.2.0 之类) ──
  const emojiVerRe = /([\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}] )v(\d+\.\d+\.\d+(?:-[\w.]+)?)/gu;
  while ((m = emojiVerRe.exec(text)) !== null) {
    all.push({
      offset: m.index,
      match: m[0],
      current: m[2],
      expected: pkgVersion,
      kind: 'emoji-version',
      replacement: `${m[1]}v${pkgVersion}`
    });
  }

  // 过滤:只保留真正不一致的
  return all.filter((mm) => mm.current !== mm.expected);
}

function applyReplacements(text, mismatches) {
  const sorted = [...mismatches].sort((a, b) => b.offset - a.offset);
  let result = text;
  for (const mm of sorted) {
    result =
      result.slice(0, mm.offset) + mm.replacement + result.slice(mm.offset + mm.match.length);
  }
  return result;
}

function main() {
  const pkg = readJSON(PACKAGE_JSON_PATH);
  const pkgVersion = pkg.version;
  console.log(`[sync-version] package.json version = ${pkgVersion}`);
  console.log(`[sync-version] mode = ${MODE}\n`);

  let totalMismatches = 0;
  const report = [];

  for (const relPath of SCAN_TARGETS) {
    const absPath = join(CDN_ROOT, relPath);
    if (!existsSync(absPath)) {
      console.log(`  ⚠️  ${relPath} (不存在,跳过)`);
      continue;
    }
    const text = readText(absPath);
    const mismatches = findMismatches(text, pkgVersion);
    if (mismatches.length === 0) {
      console.log(`  ✓ ${relPath}`);
    } else {
      console.log(`  ✗ ${relPath} — ${mismatches.length} 处不一致:`);
      for (const mm of mismatches) {
        const ctx = text
          .slice(Math.max(0, mm.offset - 20), mm.offset + mm.match.length + 20)
          .replace(/\n/g, '↵');
        console.log(`    · [${mm.kind}] ${mm.current} → ${mm.expected}  …${ctx}…`);
      }
      report.push({ path: absPath, text, mismatches });
      totalMismatches += mismatches.length;
    }
  }

  console.log('');
  if (totalMismatches === 0) {
    console.log(`[sync-version] ✓ 全部一致 (${SCAN_TARGETS.length} 个文件,${pkgVersion})`);
    process.exit(0);
  }

  if (MODE === 'apply') {
    console.log(`[sync-version] → 写入 ${report.length} 个文件…`);
    for (const { path, text, mismatches } of report) {
      const updated = applyReplacements(text, mismatches);
      writeText(path, updated);
      console.log(`    ✓ ${path}`);
    }
    console.log(`\n[sync-version] ✓ 已同步 ${totalMismatches} 处 (${pkgVersion})`);
    console.log(`[sync-version] 建议:运行 npm run build:manifest 重新生成 components.manifest.json`);
    process.exit(0);
  }

  if (MODE === 'check') {
    console.log(`[sync-version] ✗ 不一致 ${totalMismatches} 处 — exit 1`);
    process.exit(1);
  }

  console.log(`[sync-version] ℹ️ dry-run 完成,发现 ${totalMismatches} 处不一致。`);
  console.log(`[sync-version]    使用 --apply 实际修复,或 --check 在 CI 中检测。`);
}

main();
