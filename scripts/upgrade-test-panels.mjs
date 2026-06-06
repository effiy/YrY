// upgrade-test-panels.mjs — upgrade V2 test panels (5-tab → 7-tab) and V1 (3-tab → 7-tab)
import { readFileSync, writeFileSync, existsSync } from 'fs';

const V2_FILES = [
  'docs/故事任务面板/yry-arch/场景-1-模块定位/测试面板.html',
  'docs/故事任务面板/yry-arch/场景-2-数据流追踪/测试面板.html',
  'docs/故事任务面板/yry-arch/场景-3-新人上手/测试面板.html',
  'docs/故事任务面板/yry-arch/场景-4-依赖变更影响/测试面板.html',
];

// ── V2 upgrade: add 正常路径 + 边界/异常 tabs to existing 5-tab structure ──
function upgradeV2(content) {
  let c = content;

  // 1. Add normal + boundary tabs after results tab
  c = c.replace(
    /(<span class="tab" data-panel="results">📊 执行结果<\/span>)\n(\s*)(<span class="tab" data-panel="slow">🐢 慢测试<\/span>)/,
    '$1\n$2<span class="tab" data-panel="normal">✅ 正常路径</span>\n$2<span class="tab" data-panel="boundary">⚠️ 边界/异常</span>\n$2$3'
  );

  // 2. Add panel divs before panelSlow
  c = c.replace(
    /(<div class="panel" id="panelSlow">)/,
    '<div class="panel" id="panelNormal"><div id="normalContent"></div></div>\n<div class="panel" id="panelBoundary"><div id="boundaryContent"></div></div>\n$1'
  );

  // 3. Add testDesign constant after perfData
  c = c.replace(
    /(const perfData = [^;]*;)/,
    '$1\nconst testDesign = {"normal":[],"boundary":[]};'
  );

  // 4. Insert renderNormal + renderBoundary before renderSlow
  const funcs = `
/* ═══ Normal path panel ═══ */
function renderNormal(){
  var container=document.getElementById('normalContent');
  var cases=testDesign&&testDesign.normal||[];
  if(!cases.length){container.innerHTML='<div class="state-msg"><div class="icon">✅</div><h3>暂无正常路径用例设计</h3><p>请补充场景 §1 测试设计中的正常路径用例（TC-N）</p></div>';return}
  var html='<table class="test-table"><thead><tr><th>TC#</th><th>Given</th><th>When</th><th>Then</th><th>覆盖</th><th>优先级</th></tr></thead><tbody>';
  for(var i=0;i<cases.length;i++){var c=cases[i];html+='<tr><td>'+esc(c.id||'TC-N'+(i+1))+'</td><td>'+esc(c.given||'')+'</td><td><code>'+esc(c.when||'')+'</code></td><td>'+esc(c.then||'')+'</td><td>'+esc(c.covers||'')+'</td><td><span class="badge '+(c.priority==='P0'?'p0':'p1')+'">'+esc(c.priority||'P1')+'</span></td></tr>'}
  html+='</tbody></table>';container.innerHTML=html}

/* ═══ Boundary/exception panel ═══ */
function renderBoundary(){
  var container=document.getElementById('boundaryContent');
  var cases=testDesign&&testDesign.boundary||[];
  if(!cases.length){container.innerHTML='<div class="state-msg"><div class="icon">⚠️</div><h3>暂无边界/异常用例设计</h3><p>请补充场景 §1 测试设计中的边界/异常用例（TC-B）</p></div>';return}
  var html='<table class="test-table"><thead><tr><th>TC#</th><th>Given</th><th>When</th><th>Then</th><th>覆盖</th><th>优先级</th></tr></thead><tbody>';
  for(var i=0;i<cases.length;i++){var c=cases[i];html+='<tr><td>'+esc(c.id||'TC-B'+(i+1))+'</td><td>'+esc(c.given||'')+'</td><td><code>'+esc(c.when||'')+'</code></td><td>'+esc(c.then||'')+'</td><td>'+esc(c.covers||'')+'</td><td><span class="badge '+(c.priority==='P0'?'p0':'p1')+'">'+esc(c.priority||'P1')+'</span></td></tr>'}
  html+='</tbody></table>';container.innerHTML=html}`;

  c = c.replace(
    /(\/\* ═══ Slow tests panel)/,
    funcs + '\n\n$1'
  );

  // 5. Update switchPanel
  c = c.replace(
    /else if\(name==='results'\)renderResults\(\);else if\(name==='slow'\)renderSlow\(\)/,
    "else if(name==='results')renderResults();else if(name==='normal')renderNormal();else if(name==='boundary')renderBoundary();else if(name==='slow')renderSlow()"
  );

  // 6. Update keyboard shortcuts
  c = c.replace(
    /if\(e\.key==='1'\)switchPanel\('files'\);if\(e\.key==='2'\)switchPanel\('results'\);if\(e\.key==='3'\)switchPanel\('slow'\);if\(e\.key==='4'\)switchPanel\('perf'\)/,
    "if(e.key==='1')switchPanel('files');if(e.key==='2')switchPanel('results');if(e.key==='3')switchPanel('normal');if(e.key==='4')switchPanel('boundary');if(e.key==='5')switchPanel('slow');if(e.key==='6')switchPanel('perf');if(e.key==='7')switchPanel('gate')"
  );

  return c;
}

// ── Main ──
function main() {
  for (const filePath of V2_FILES) {
    if (!existsSync(filePath)) {
      console.log(`SKIP (not found): ${filePath}`);
      continue;
    }
    console.log(`Upgrading: ${filePath}`);
    const content = readFileSync(filePath, 'utf-8');

    // Check if already upgraded
    if (content.includes('data-panel="normal"')) {
      console.log('  → Already upgraded (normal tab found), skipping');
      continue;
    }

    const upgraded = upgradeV2(content);
    writeFileSync(filePath, upgraded, 'utf-8');

    // Verify
    const tabCount = (upgraded.match(/class="tab"/g) || []).length;
    const panelCount = (upgraded.match(/class="panel"/g) || []).length;
    const normalOk = upgraded.includes('data-panel="normal"');
    const boundaryOk = upgraded.includes('data-panel="boundary"');
    console.log(`  → Tabs: ${tabCount}, Panels: ${panelCount}, Normal: ${normalOk}, Boundary: ${boundaryOk}`);
  }
}

main();
