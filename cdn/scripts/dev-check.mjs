// 总体自检脚本 — 验证所有工程化产物
import { readFileSync, existsSync, statSync, readdirSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const CDN_ROOT = join(__dirname, '..');

const results = [];

function check(name, fn) {
  try {
    const detail = fn();
    if (detail && typeof detail.then === 'function') {
      return detail
        .then((d) => {
          results.push({ name, ok: true, detail: d || '' });
        })
        .catch((e) => {
          results.push({ name, ok: false, detail: e.message });
        });
    }
    results.push({ name, ok: true, detail: detail || '' });
    return null;
  } catch (e) {
    results.push({ name, ok: false, detail: e.message });
    return null;
  }
}

// ── JSON 配置文件可解析 ──
for (const f of ['package.json', '.prettierrc.json', '.stylelintrc.json', 'components.manifest.json']) {
  check(`JSON parse: ${f}`, () => {
    JSON.parse(readFileSync(join(CDN_ROOT, f), 'utf8'));
    return `${statSync(join(CDN_ROOT, f)).size} bytes`;
  });
}

// ── ESLint config (ESM dynamic import) ──
check('JS import: eslint.config.js', async () => {
  const url = new URL('../eslint.config.js', import.meta.url).href;
  const mod = await import(url);
  if (!mod.default || !Array.isArray(mod.default)) {
    throw new Error('expected export default array');
  }
  return `${mod.default.length} config blocks`;
});

// ── scripts 列表 ──
check('scripts/*.mjs 列表', () => {
  const files = readdirSync(join(CDN_ROOT, 'scripts')).filter((f) => f.endsWith('.mjs'));
  return files.join(', ');
});

// ── 各脚本可执行 ──
check('build:manifest', () => {
  const out = execSync('node scripts/build-manifest.mjs', { cwd: CDN_ROOT, encoding: 'utf8' });
  return out.trim();
});

check('sync-version --check', () => {
  execSync('node scripts/sync-version.mjs --check', { cwd: CDN_ROOT, encoding: 'utf8' });
  return '一致';
});

check('validate', () => {
  const out = execSync('node scripts/validate.mjs', { cwd: CDN_ROOT, encoding: 'utf8' });
  return out.split('\n').filter((l) => l.includes('通过') || l.includes('问题')).join(' | ');
});

// ── GitHub workflows 存在 ──
check('.github/workflows/cdn-ci.yml', () => {
  const p = join(CDN_ROOT, '..', '.github', 'workflows', 'cdn-ci.yml');
  if (!existsSync(p)) throw new Error('不存在');
  return `${statSync(p).size} bytes`;
});
check('.github/workflows/cdn-release.yml', () => {
  const p = join(CDN_ROOT, '..', '.github', 'workflows', 'cdn-release.yml');
  if (!existsSync(p)) throw new Error('不存在');
  return `${statSync(p).size} bytes`;
});
check('.github/PULL_REQUEST_TEMPLATE.md', () => {
  const p = join(CDN_ROOT, '..', '.github', 'PULL_REQUEST_TEMPLATE.md');
  if (!existsSync(p)) throw new Error('不存在');
  return `${statSync(p).size} bytes`;
});

// ── 等待所有 async 完成 ──
await Promise.all(results.map(() => Promise.resolve())); // drain microtasks
await new Promise((r) => setTimeout(r, 100));

// ── 输出 ──
console.log('=== 总体自检 ===\n');
for (const r of results) {
  const icon = r.ok ? '✓' : '✗';
  console.log(`  ${icon} ${r.name.padEnd(40)} ${r.detail}`);
}
console.log('');
const passed = results.filter((r) => r.ok).length;
const total = results.length;
console.log(`结果: ${passed}/${total} 通过`);
process.exit(passed === total ? 0 : 1);
