// migrate-rui-npm-panels.mjs — split combined 用例设计 tab into 正常路径 + 边界/异常
import { readFileSync, writeFileSync, existsSync } from 'fs';

const FILES = [
  'docs/故事任务面板/rui-npm/场景-1-包搜索与发现/测试面板.html',
  'docs/故事任务面板/rui-npm/场景-2-包安装与版本管理/测试面板.html',
  'docs/故事任务面板/rui-npm/场景-3-本地发布与npx使用/测试面板.html',
  'docs/故事任务面板/rui-npm/场景-4-包信息审计与卸载/测试面板.html',
];

function migrate(content) {
  let c = content;

  // 1. Replace design tab with normal + boundary tabs
  c = c.replace(
    /<span class="tab" data-panel="design">📋 用例设计<\/span>/,
    '<span class="tab" data-panel="normal">✅ 正常路径</span>\n    <span class="tab" data-panel="boundary">⚠️ 边界/异常</span>'
  );

  // 2. Replace design panel div with normal + boundary panel divs
  c = c.replace(
    /<div class="panel" id="panelDesign"><div id="designContent"><\/div><\/div>/,
    '<div class="panel" id="panelNormal"><div id="normalContent"></div></div>\n<div class="panel" id="panelBoundary"><div id="boundaryContent"></div></div>'
  );

  // 3. Split renderDesign() into renderNormal() and renderBoundary()
  // Capture the normal-path card: from "function renderDesign(){" through the first "</table></div>'"
  // and the boundary card: from "html+='<div class=\"card\"><h2>⚠️" through the end of the function
  const designMatch = c.match(/function renderDesign\(\)\{[\s\S]*?document\.getElementById\('designContent'\)\.innerHTML=html\s*\}/);
  if (designMatch) {
    const designFn = designMatch[0];

    // Extract normal card HTML: from first html+='... to first </table></div>'
    const normalMatch = designFn.match(/var html='(<div class="card"><h2>✅ 正常路径[\s\S]*?<\/table><\/div>)'/);
    // Extract boundary card HTML: from html+='<div class="card"><h2>⚠️ to last </table></div>'
    const boundaryMatch = designFn.match(/html\+='(<div class="card"><h2>⚠️ 边界\/异常[\s\S]*?<\/table><\/div>)'/);

    if (normalMatch && boundaryMatch) {
      const normalBlock = normalMatch[1];
      const boundaryBlock = boundaryMatch[1];

      const newFuncs = `function renderNormal(){
  var container=document.getElementById('normalContent');
  var html='${normalBlock}';
  container.innerHTML=html}

function renderBoundary(){
  var container=document.getElementById('boundaryContent');
  var html='${boundaryBlock}';
  container.innerHTML=html}`;

      c = c.replace(designFn, newFuncs);
    } else {
      console.log('  WARNING: Could not parse renderDesign, skipping function split');
    }
  }

  // 4. Update switchPanel: replace design case with normal + boundary
  c = c.replace(
    /else if\(name==='design'\)renderDesign\(\)/,
    "else if(name==='normal')renderNormal();else if(name==='boundary')renderBoundary()"
  );

  // 5. Update keyboard shortcuts: add normal(3) and boundary(4), shift existing
  c = c.replace(
    /if\(e\.key==='1'\)switchPanel\('files'\);if\(e\.key==='2'\)switchPanel\('results'\);if\(e\.key==='3'\)switchPanel\('design'\);if\(e\.key==='4'\)switchPanel\('slow'\);if\(e\.key==='5'\)switchPanel\('perf'\)/,
    "if(e.key==='1')switchPanel('files');if(e.key==='2')switchPanel('results');if(e.key==='3')switchPanel('normal');if(e.key==='4')switchPanel('boundary');if(e.key==='5')switchPanel('slow');if(e.key==='6')switchPanel('perf');if(e.key==='7')switchPanel('gate')"
  );

  return c;
}

function main() {
  for (const filePath of FILES) {
    if (!existsSync(filePath)) {
      console.log(`SKIP (not found): ${filePath}`);
      continue;
    }
    console.log(`Migrating: ${filePath}`);
    const content = readFileSync(filePath, 'utf-8');

    // Check if already migrated
    if (content.includes('data-panel="normal"')) {
      console.log('  → Already migrated (normal tab found), skipping');
      continue;
    }

    const migrated = migrate(content);
    writeFileSync(filePath, migrated, 'utf-8');

    // Verify
    const hasNormal = migrated.includes('data-panel="normal"');
    const hasBoundary = migrated.includes('data-panel="boundary"');
    const hasDesign = migrated.includes('data-panel="design"');
    const dataPanelCount = (migrated.match(/data-panel="/g) || []).length;
    console.log(`  → Normal: ${hasNormal}, Boundary: ${hasBoundary}, Design removed: ${!hasDesign}, Tabs: ${dataPanelCount}`);
  }
}

main();
