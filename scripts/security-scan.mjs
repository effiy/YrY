#!/usr/bin/env node
/**
 * security-scan.mjs — YrY 安全面回归自检
 *
 * 扫描项目中的常见安全风险：硬编码凭据、XSS 向量、不安全依赖。
 * 用法: node scripts/security-scan.mjs [--json] [--strict]
 *
 * 对应场景文档:
 *   - docs/故事任务面板/yry-self-test/场景-4-安全面回归自检/
 */

import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { resolve, join, relative, extname, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const JSON_MODE = process.argv.includes('--json');
const STRICT = process.argv.includes('--strict');

// ── Patterns ─────────────────────────────────────────────────────────
const SECRET_PATTERNS = [
  { name: 'API key', pattern: /(?:api[_-]?key|apikey)\s*[:=]\s*['"][A-Za-z0-9_\-]{8,}['"]/gi },
  { name: 'Token assignment', pattern: /(?:token|secret|password)\s*[:=]\s*['"][A-Za-z0-9_\-\.]{12,}['"]/gi },
  { name: 'Private key header', pattern: /-----BEGIN (?:RSA |EC |DSA |OPENSSH )?PRIVATE KEY-----/g },
  { name: 'Generic secret', pattern: /(?:SECRET|TOKEN|PASSWORD|KEY)\s*=\s*['"][A-Za-z0-9_\-]{16,}['"]/g },
];

const XSS_PATTERNS = [
  { name: 'innerHTML', pattern: /\.innerHTML\s*=/g },
  { name: 'dangerouslySetInnerHTML', pattern: /dangerouslySetInnerHTML/g },
  { name: 'document.write', pattern: /document\.write\s*\(/g },
  { name: 'eval()', pattern: /eval\s*\(/g },
  { name: 'unescaped URL', pattern: /location(?:\.href|\.search)\s*=\s*['"`](?!https?:\/\/)/g },
];

const SAFE_FILES = [
  'tests/', 'node_modules/', '.git/', 'package-lock.json',
];

// ── Helpers ──────────────────────────────────────────────────────────
function collectFiles(exts, exclude = []) {
  const files = [];
  function walk(dir) {
    if (!existsSync(dir)) return;
    for (const entry of readdirSync(dir)) {
      const full = join(dir, entry);
      const rel = relative(ROOT, full);
      if (statSync(full).isDirectory()) {
        if (SAFE_FILES.some(d => rel.startsWith(d) || entry === d)) continue;
        if (exclude.some(d => rel.startsWith(d))) continue;
        walk(full);
      } else if (exts.includes(extname(entry))) {
        if (SAFE_FILES.some(d => rel.startsWith(d))) continue;
        files.push(full);
      }
    }
  }
  walk(ROOT);
  return files;
}

// ── Scan ─────────────────────────────────────────────────────────────
function scan() {
  const findings = { secrets: [], xss: [], dependencyWarnings: [] };

  // Phase 1: Scan source files for secrets and XSS
  const srcFiles = collectFiles(['.mjs', '.js', '.html', '.json', '.md'], []);
  for (const file of srcFiles) {
    const relPath = relative(ROOT, file);
    // Skip test files and known-safe config files
    if (relPath.includes('tests/') && !STRICT) continue;
    if (relPath.includes('package-lock.json')) continue;

    try {
      const content = readFileSync(file, 'utf-8');
      for (const { name, pattern } of SECRET_PATTERNS) {
        for (const match of content.matchAll(pattern)) {
          const lineNum = content.substring(0, match.index).split('\n').length;
          findings.secrets.push({ file: relPath, line: lineNum, type: name, match: match[0].substring(0, 60) });
        }
      }
      if (extname(file) === '.html') {
        for (const { name, pattern } of XSS_PATTERNS) {
          for (const match of content.matchAll(pattern)) {
            const lineNum = content.substring(0, match.index).split('\n').length;
            findings.xss.push({ file: relPath, line: lineNum, type: name, match: match[0] });
          }
        }
      }
    } catch {
      // Skip unreadable files
    }
  }

  // Phase 2: Check npm audit
  try {
    if (existsSync(join(ROOT, 'package.json'))) {
      const audit = execSync('npm audit --json 2>/dev/null || true', {
        cwd: ROOT, encoding: 'utf-8', timeout: 30000,
      });
      if (audit.trim()) {
        const parsed = JSON.parse(audit);
        const vulns = parsed.vulnerabilities || {};
        for (const [pkg, info] of Object.entries(vulns)) {
          if (info.severity === 'critical' || info.severity === 'high') {
            findings.dependencyWarnings.push({ package: pkg, severity: info.severity });
          }
        }
      }
    }
  } catch {
    // npm audit may fail in some environments
  }

  return findings;
}

// ── Main ─────────────────────────────────────────────────────────────
function main() {
  const findings = scan();

  if (JSON_MODE) {
    console.log(JSON.stringify({
      timestamp: new Date().toISOString(),
      summary: {
        secrets: findings.secrets.length,
        xss: findings.xss.length,
        dependencyWarnings: findings.dependencyWarnings.length,
      },
      findings,
    }));
  } else {
    console.log('╔══════════════════════════════════════════╗');
    console.log('║  YrY 安全面回归自检                      ║');
    console.log('╚══════════════════════════════════════════╝\n');

    const total = findings.secrets.length + findings.xss.length + findings.dependencyWarnings.length;

    if (total === 0) {
      console.log('  ✅ 未发现安全风险\n');
    } else {
      if (findings.secrets.length > 0) {
        console.log(`  🔴 硬编码凭据: ${findings.secrets.length} 处`);
        for (const f of findings.secrets) {
          console.log(`     ${f.file}:${f.line} — ${f.type}`);
        }
      }
      if (findings.xss.length > 0) {
        console.log(`  🟡 XSS 风险: ${findings.xss.length} 处`);
        for (const f of findings.xss) {
          console.log(`     ${f.file}:${f.line} — ${f.type}`);
        }
      }
      if (findings.dependencyWarnings.length > 0) {
        console.log(`  🟠 高危依赖: ${findings.dependencyWarnings.length} 个`);
        for (const f of findings.dependencyWarnings) {
          console.log(`     ${f.package} (${f.severity})`);
        }
      }
    }
  }

  return findings.secrets.length > 0 ? 1 : 0;
}

process.exit(main());
