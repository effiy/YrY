#!/usr/bin/env node
/**
 * validate-package.mjs — npm 包发布前验证
 *
 * 验证 CDN 包的结构完整性、文件完整性、package.json 一致性。
 * 用法: node scripts/validate-package.mjs [--json] [path/to/package]
 *
 * 对应场景文档:
 *   - docs/故事任务面板/yry-cdn/场景-5-npm包发布与版本管理/
 */

import { existsSync, readFileSync, statSync, readdirSync } from 'node:fs';
import { resolve, join, relative, basename, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const JSON_MODE = process.argv.includes('--json');

// ── Config ───────────────────────────────────────────────────────────
const REQUIRED_FIELDS = ['name', 'version', 'description', 'main', 'files', 'license'];
const REQUIRED_FILES = ['shared.css', 'shared.js', 'theme.css', 'theme-mono.css', 'fonts.css', 'README.md'];
const FORBIDDEN_FILES = ['.env', 'node_modules/', '.git/'];
const MAX_FILE_SIZE = 500 * 1024; // 500KB per file

// ── Validate ─────────────────────────────────────────────────────────
function validatePackage(pkgDir) {
  const report = { errors: [], warnings: [], ok: [] };
  const rel = relative(ROOT, pkgDir);

  // Check package.json
  const pkgPath = join(pkgDir, 'package.json');
  if (!existsSync(pkgPath)) {
    report.errors.push('package.json not found');
    return report;
  }

  let pkg;
  try {
    pkg = JSON.parse(readFileSync(pkgPath, 'utf-8'));
  } catch {
    report.errors.push('package.json is not valid JSON');
    return report;
  }

  // Check required fields
  for (const field of REQUIRED_FIELDS) {
    if (pkg[field] === undefined || pkg[field] === null || pkg[field] === '') {
      report.errors.push(`package.json missing required field: ${field}`);
    } else {
      report.ok.push(`field: ${field} = ${Array.isArray(pkg[field]) ? pkg[field].join(', ') : String(pkg[field]).substring(0, 60)}`);
    }
  }

  // Validate semver
  if (pkg.version && !/^\d+\.\d+\.\d+/.test(pkg.version)) {
    report.warnings.push(`version "${pkg.version}" is not valid semver`);
  }

  // Check files[] entries exist on disk
  if (Array.isArray(pkg.files)) {
    for (const f of pkg.files) {
      // Glob patterns like fonts/*.woff2
      if (f.includes('*')) {
        const dir = join(pkgDir, dirname(f));
        const ext = extname(f);
        if (existsSync(dir)) {
          const matches = readdirSync(dir).filter(e => e.endsWith(ext));
          if (matches.length === 0) {
            report.warnings.push(`files[] glob "${f}" matches no files`);
          } else {
            report.ok.push(`file: ${f} → ${matches.length} matches`);
          }
        } else {
          report.warnings.push(`files[] glob dir not found: ${f}`);
        }
      } else if (!existsSync(join(pkgDir, f))) {
        report.errors.push(`files[] entry "${f}" does not exist on disk`);
      } else {
        const size = statSync(join(pkgDir, f)).size;
        if (size > MAX_FILE_SIZE) {
          report.warnings.push(`file "${f}" is ${(size / 1024).toFixed(0)}KB (max ${MAX_FILE_SIZE / 1024}KB)`);
        } else {
          report.ok.push(`file: ${f} (${(size / 1024).toFixed(0)}KB)`);
        }
      }
    }
  }

  // Check required CDN files exist
  for (const f of REQUIRED_FILES) {
    if (!existsSync(join(pkgDir, f))) {
      report.errors.push(`required CDN file missing: ${f}`);
    }
  }

  // Check forbidden files
  for (const f of FORBIDDEN_FILES) {
    if (existsSync(join(pkgDir, f))) {
      report.errors.push(`forbidden file/dir in package: ${f}`);
    }
  }

  return report;
}

// ── Main ─────────────────────────────────────────────────────────────
function main() {
  const pkgDir = process.argv.filter(a => !a.startsWith('--') && a !== process.argv[1]).pop();
  const target = pkgDir ? resolve(pkgDir) : join(ROOT, 'cdn');
  const report = validatePackage(target);

  if (JSON_MODE) {
    console.log(JSON.stringify({
      timestamp: new Date().toISOString(),
      package: relative(ROOT, target),
      ...report,
      passed: report.errors.length === 0,
    }));
  } else {
    console.log(`╔══════════════════════════════════════════╗`);
    console.log(`║  YrY CDN 包发布验证                       ║`);
    console.log(`╚══════════════════════════════════════════╝\n`);
    console.log(`  包目录: ${relative(ROOT, target)}\n`);

    if (report.ok.length) {
      console.log(`  ✅ 通过检查: ${report.ok.length}`);
      for (const o of report.ok) console.log(`     ${o}`);
    }
    if (report.warnings.length) {
      console.log(`\n  ⚠️ 警告: ${report.warnings.length}`);
      for (const w of report.warnings) console.log(`     ${w}`);
    }
    if (report.errors.length) {
      console.log(`\n  ❌ 错误: ${report.errors.length}`);
      for (const e of report.errors) console.log(`     ${e}`);
    }

    const passed = report.errors.length === 0;
    console.log(`\n  ${passed ? '✅ 验证通过' : '❌ 验证未通过'}`);
  }

  return report.errors.length === 0 ? 0 : 1;
}

process.exit(main());
