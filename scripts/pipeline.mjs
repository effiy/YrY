// scripts/pipeline.mjs — 端到端执行：抽取 → 生成审查.html → 清理 6 个 html
// 用法:
//   node scripts/pipeline.mjs                           # 跑所有场景
//   node scripts/pipeline.mjs <subdir>                  # 跑某个子目录
//   node scripts/pipeline.mjs <subdir>/<scenarioDir>    # 跑某个场景
import { forEachScenario } from './lib/walk.mjs';
import { extractScenarioData, writeCache } from './lib/extract.mjs';
import { generateReviewHtml, scrubScenarioHtmls } from './lib/generate.mjs';

const target = process.argv[2];
const matches = (ctx) => {
  if (!target) return true;
  if (target.includes('/')) return `${ctx.subdir}/${ctx.scenarioDir}` === target;
  return ctx.subdir === target;
};

const { ok, failed } = await forEachScenario(async (ctx) => {
  if (!matches(ctx)) return null;
  const data = await extractScenarioData(ctx);
  await writeCache(ctx, data);
  await generateReviewHtml(ctx, data);
  await scrubScenarioHtmls(ctx, data);
  return ctx;
});

console.log(`\n📊 pipeline 完成: ${ok.length} 个场景`);
if (failed.length) {
  console.log(`❌ 失败 ${failed.length}:`);
  for (const { ctx, err } of failed) console.log(`  ${ctx.subdir}/${ctx.scenarioDir}: ${err.message}`);
  process.exitCode = 1;
}
