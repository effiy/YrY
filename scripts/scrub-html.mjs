// scripts/scrub-html.mjs — 单个场景的 6 个 html 清理
// 用法: node scripts/scrub-html.mjs <subdir> <scenarioDir>
import path from 'node:path';
import { DOCS_DIR } from './lib/paths.mjs';
import { readCache } from './lib/extract.mjs';
import { scrubScenarioHtmls } from './lib/generate.mjs';

const [, , subdir, scenarioDir] = process.argv;
if (!subdir || !scenarioDir) {
  console.error('用法: node scripts/scrub-html.mjs <subdir> <scenarioDir>');
  process.exit(1);
}

const ctx = { subdir, scenarioDir, fullPath: path.join(DOCS_DIR, subdir, scenarioDir) };
const data = await readCache(ctx);
if (!data) { console.error(`❌ 无缓存: ${subdir}/${scenarioDir}`); process.exit(1); }

const results = await scrubScenarioHtmls(ctx, data);
for (const { size } of results) console.log(`  ✓ → ${(size / 1024).toFixed(1)} KB`);
console.log(`\n✅ 完成 ${scenarioDir}`);
