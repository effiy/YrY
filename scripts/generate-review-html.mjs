// scripts/generate-review-html.mjs — 单个场景的审查.html 生成
// 用法: node scripts/generate-review-html.mjs <subdir> <scenarioDir>
import path from 'node:path';
import { DOCS_DIR } from './lib/paths.mjs';
import { readCache } from './lib/extract.mjs';
import { generateReviewHtml } from './lib/generate.mjs';

const [, , subdir, scenarioDir] = process.argv;
if (!subdir || !scenarioDir) {
  console.error('用法: node scripts/generate-review-html.mjs <subdir> <scenarioDir>');
  process.exit(1);
}

const ctx = { subdir, scenarioDir, fullPath: path.join(DOCS_DIR, subdir, scenarioDir) };
const data = await readCache(ctx);
if (!data) { console.error(`❌ 无缓存: ${subdir}/${scenarioDir}（先跑 extract-scenario-data.mjs）`); process.exit(1); }

const { size } = await generateReviewHtml(ctx, data);
console.log(`✅ ${subdir}/${scenarioDir}/审查.html (${(size / 1024).toFixed(1)} KB)`);
