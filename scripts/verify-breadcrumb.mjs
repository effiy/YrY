// scripts/verify-breadcrumb.mjs — 校验所有 html 的面包屑+场景导航符合目标样式
import fs from 'node:fs';
import path from 'node:path';
import { DOCS_DIR, ARTIFACTS, SUBDIRS, TEMPLATE_SCENARIO } from './lib/paths.mjs';

const TARGET_BC_RE = /^<nav class="breadcrumb"><a href="\.\.\/\.\.\/\.\.\/index\.html">📄 文档中心<\/a><span class="bc-sep">\/<\/span><span class="bc-current">[^\s<·]+ · [^<]+<\/span><span class="bc-sep">\/<\/span><span class="bc-current">场景 \d+ · [^<]+<\/span><span class="bc-sep">\/<\/span><span class="bc-current">[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}] [^\s<]+<\/span><\/nav>$/u;

const targetBCPattern = new RegExp(
  '<nav class="breadcrumb">' +
  '<a href="../../../index.html">📄 文档中心</a>' +
  '<span class="bc-sep">/</span>' +
  '<span class="bc-current">[^<]+</span>' +
  '<span class="bc-sep">/</span>' +
  '<span class="bc-current">场景 \\d+ · [^<]+</span>' +
  '<span class="bc-sep">/</span>' +
  '<span class="bc-current">[^<]+</span>' +
  '</nav>'
);

const sceneNavPattern = /<nav class="scene-nav">[\s\S]*?<a class="scene-nav-link story" href="\.\.\/故事任务\.md">📖 故事任务<\/a>\s*<\/nav>/;

let total = 0, pass = 0, fail = 0;
const fails = [];

for (const sub of SUBDIRS) {
  const base = path.join(DOCS_DIR, sub);
  if (!fs.existsSync(base)) continue;
  for (const name of fs.readdirSync(base)) {
    if (!name.startsWith('场景-') || name === TEMPLATE_SCENARIO) continue;
    const dir = path.join(base, name);
    for (const file of fs.readdirSync(dir)) {
      if (!file.endsWith('.html')) continue;
      total++;
      const html = fs.readFileSync(path.join(dir, file), 'utf8');
      const hasGoodBC = targetBCPattern.test(html);
      const hasGoodSceneNav = sceneNavPattern.test(html);
      // 排除旧式（多行/含额外 class 的）面包屑
      const hasOldStyleBC = /<nav class="breadcrumb"[^>]*>\s*<div class="bc-line">/m.test(html) ||
                           /<nav class="breadcrumb"[^>]*aria-label="breadcrumb"/m.test(html);
      if (hasGoodBC && hasGoodSceneNav && !hasOldStyleBC) {
        pass++;
      } else {
        fail++;
        fails.push({
          file: path.relative(DOCS_DIR, path.join(dir, file)),
          hasGoodBC, hasGoodSceneNav, hasOldStyleBC
        });
      }
    }
  }
}

console.log(`📊 校验结果: ${pass}/${total} 通过, ${fail} 失败`);
if (fail > 0) {
  console.log('\n❌ 失败的文件:');
  for (const f of fails.slice(0, 20)) {
    console.log(`  - ${f.file} (BC=${f.hasGoodBC} Nav=${f.hasGoodSceneNav} Old=${f.hasOldStyleBC})`);
  }
  if (fails.length > 20) console.log(`  ... 还有 ${fails.length - 20} 个`);
  process.exit(1);
}
