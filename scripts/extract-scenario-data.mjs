// scripts/extract-scenario-data.mjs — 抽取单个场景的 index.md → 缓存 JSON
import path from 'node:path';
import { forEachScenario } from './lib/walk.mjs';
import { DOCS_DIR } from './lib/paths.mjs';
import { extractScenarioData, writeCache } from './lib/extract.mjs';

const target = process.argv[2]; // 可选：<subdir>/<scenarioDir>

const handler = async (ctx) => {
  const data = await extractScenarioData(ctx);
  await writeCache(ctx, data);
  return { ctx, data };
};

if (target) {
  const [subdir, scenarioDir] = target.split('/');
  const fullPath = path.join(DOCS_DIR, subdir, scenarioDir);
  const result = await handler({ subdir, scenarioDir, fullPath });
  printOne(result.ctx, result.data);
} else {
  const { ok, failed } = await forEachScenario(handler);
  for (const { ctx, data } of ok) printOne(ctx, data);
  report(failed);
}

function printOne(ctx, data) {
  const tcCount = data.testCases.normal.length + data.testCases.boundary.length;
  console.log(`✅ ${ctx.subdir}/${ctx.scenarioDir}`);
  console.log(`   标题: ${data.title} | 角色: ${data.role.slice(0, 30)}...`);
  console.log(`   价值 ${data.valuePoints.length} | 模块 ${data.modules.length} | 用例 ${tcCount} | 建议 ${data.recommendations.length} | 源 ${data.sources.length}`);
}

function report(failed) {
  if (!failed.length) { console.log(`\n📊 抽取完成`); return; }
  console.log(`\n❌ 失败 ${failed.length}:`);
  for (const { ctx, err } of failed) console.log(`  ${ctx.subdir}/${ctx.scenarioDir}: ${err.message}`);
  process.exitCode = 1;
}
