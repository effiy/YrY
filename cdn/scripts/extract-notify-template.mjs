/**
 * extract-notify-template.mjs — 从 cdn/js/notify-panel.js 中提取
 * template 字符串拼接块,转换为独立的 <script type="text/x-template"> HTML。
 *
 * 输入:  cdn/js/notify-panel.js (line 314-438 范围)
 * 输出:  cdn/yry-notify-panel/index.html (含 template + Demo 预览)
 *
 * 算法:
 *   1. 找到 `template: /* html *\/ '...'` 起始行
 *   2. 收集后续所有 `+ '...'` 拼接行,直到顶层 `)` 结束
 *   3. 拼接为一个字符串,反转义 \' → '
 *   4. 包裹在 <script type="text/x-template" id="yry-notify-panel-tpl"> 中
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const CDN_ROOT = join(__dirname, '..');
const SOURCE = join(CDN_ROOT, 'js', 'notify-panel.js');
const OUT_DIR = join(CDN_ROOT, 'yry-notify-panel');
const OUT_HTML = join(OUT_DIR, 'index.html');

function extractTemplate(source) {
  const lines = source.split('\n');
  const startIdx = lines.findIndex((l) => /template:\s*\/\*\s*html\s*\*\//.test(l));
  if (startIdx < 0) throw new Error('未找到 template 起始行');

  const stringChunks = [];
  const startLine = lines[startIdx];
  const firstStrMatch = startLine.match(/template:\s*\/\*\s*html\s*\*\/\s*'(.*)'\s*$/);
  if (!firstStrMatch) throw new Error('首行 template 字符串格式不匹配');
  stringChunks.push(firstStrMatch[1]);

  let endIdx = startIdx;
  for (let i = startIdx + 1; i < lines.length; i++) {
    const line = lines[i];
    if (!line.trim()) continue;
    if (line.trim().startsWith('//')) continue;
    if (line.trim().startsWith('/*')) continue;

    const m = line.match(/^\s*\+\s*'(.*)'\s*\)?\s*;?\s*$/);
    if (m) {
      stringChunks.push(m[1]);
      endIdx = i;
      // 判断行末 `)` 是否在最后一个单引号之后(顶层 `)` 表示 template 表达式结束)
      const afterQuote = line.slice(line.lastIndexOf("'") + 1);
      if (afterQuote.startsWith(')')) break;
    } else if (line.trim().startsWith('});') || line.trim() === '});') {
      endIdx = i;
      break;
    } else {
      console.warn(`[extract] 意外行 ${i + 1}: ${line.trim().slice(0, 80)}`);
      endIdx = i;
      break;
    }
  }

  const raw = stringChunks.join('');
  const unescaped = raw
    .replace(/\\'/g, "'")
    .replace(/\\\\/g, '\\')
    .replace(/\\n/g, '\n')
    .replace(/\\t/g, '\t');

  console.log(
    `[extract-notify-template] 提取范围: line ${startIdx + 1} - ${endIdx + 1} (${stringChunks.length} 段)`
  );
  console.log(`[extract-notify-template] 字符数: ${unescaped.length}`);
  return unescaped;
}

function buildDemoHtml(templateHTML) {
  return `<!DOCTYPE html>
<!--
  ═══════════════════════════════════════════════════════════════════════════
  YryNotifyPanel · 通知中心面板 (Vue 3 createApp + template 注入)

  本文件有 2 个用途:
    1) **模板源** — 下方 <script type="text/x-template" id="yry-notify-panel-tpl">
       为 canonical 模板源;index.js fetch 此块渲染。
    2) **Demo 预览** — 直接用浏览器打开本文件,可看到通知面板的渲染效果
       (前提:页面 DOM 包含 #notifyPanelBody 等 hook 节点)

  加载链: ../shared.css → ../theme.css → ../yry-panel-hub/index.css →
          ../js/panel-hub.js → ../shared.js → ./index.js

  对应场景文档:
    - 通知中心:聚合 健康报告/自循环/趋势/项目分析 四类报告
    - 详细规范: yry-notify-panel/index.js 头部注释

  Differences vs 原 cdn/js/notify-panel.js:
    - Template 已移出 JS 字符串拼接,改为 HTML <script> 块 (可读性 ↑)
    - 转义单引号 \\' 已恢复为 '
    - 文件按 yry-* 三件套范式组织 (index.html/css/js)
  ═══════════════════════════════════════════════════════════════════════════ -->
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>YryNotifyPanel · Demo & Template</title>
  <link rel="stylesheet" href="../shared.css">
  <link rel="stylesheet" href="../theme.css">
  <link rel="stylesheet" href="../yry-panel-hub/index.css">
  <link rel="stylesheet" href="index.css">
  <style>
    body {
      background: var(--yry-bg, #0a0a0a);
      color: var(--yry-text, #f5f5f5);
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "PingFang SC", sans-serif;
      padding: 32px 24px 60px;
      max-width: 920px; margin: 0 auto;
      line-height: 1.55;
    }
    h1 { font-size: 1.25rem; margin: 0 0 4px; }
    h1 .accent { color: #22d3ee; }
    .demo-hint { font-size: .78rem; color: #888; margin: 0 0 20px; line-height: 1.6; }
    .demo-hint code { background: rgba(255,255,255,.06); padding: 1px 6px; border-radius: 3px;
                      font-family: ui-monospace, monospace; font-size: .72rem; color: #e0af68; }
  </style>
</head>
<body>
  <h1><span class="accent">🔔</span> YryNotifyPanel · 通知中心面板</h1>
  <p class="demo-hint">
    聚合 <code>健康报告 / 自循环 / 趋势 / 项目分析</code> 四类报告。
    需配合 <code>panel-hub.js</code>(提供 #notifyPanel / #notifyPanelBody DOM 节点)
    与 <code>shared.js</code> 一起加载。
  </p>

  <!-- ════════════════════════════════════════════════════════════════════
       TEMPLATE SOURCE OF TRUTH · YryNotifyPanel 的 template
       修改此块即更新组件,index.js fetch 此块渲染
       ════════════════════════════════════════════════════════════════════ -->
  <script type="text/x-template" id="yry-notify-panel-tpl">
${templateHTML}
  </script>

  <!-- Demo 用 DOM hook:通知面板占位节点 -->
  <div id="notifyPanel" class="notify-panel yry-notify-panel" style="display:none">
    <div id="notifyOverlay" class="notify-overlay yry-notify-overlay"></div>
    <div class="panel-header yry-panel-header">
      <span class="notify-title yry-notify-title">🔔 通知中心</span>
      <span id="npTotalCount" class="notify-count yry-notify-count">加载中...</span>
      <button id="notifyRefresh" class="panel-refresh" title="刷新" aria-label="刷新通知">↻</button>
    </div>
    <div class="panel-filters yry-panel-filters">
      <span class="np-filter-chip active" data-filter="all">全部 <span id="npBadgeAll" class="np-badge">0</span></span>
      <span class="np-filter-chip" data-filter="health">🩺 健康 <span id="npBadgeHealth" class="np-badge">0</span></span>
      <span class="np-filter-chip" data-filter="loop">🔄 自循环 <span id="npBadgeLoop" class="np-badge">0</span></span>
      <span class="np-filter-chip" data-filter="trend">📡 趋势 <span id="npBadgeTrend" class="np-badge">0</span></span>
      <span class="np-filter-chip" data-filter="analysis">🔍 分析 <span id="npBadgeAnalysis" class="np-badge">0</span></span>
    </div>
    <div id="notifyPanelBody" class="panel-body yry-panel-body"></div>
    <div class="panel-footer yry-panel-footer"><span id="npUpdateTime"></span></div>
  </div>

  <!-- 加载链 -->
  <script src="../js/panel-hub.js"></script>
  <script src="../shared.js"></script>
  <script src="https://unpkg.com/vue@3/dist/vue.global.prod.js"></script>
  <script src="index.js"></script>
</body>
</html>
`;
}

function main() {
  if (!existsSync(SOURCE)) {
    console.error(`[extract] 源文件不存在: ${SOURCE}`);
    process.exit(1);
  }
  const src = readFileSync(SOURCE, 'utf8');
  const templateHTML = extractTemplate(src);

  if (!existsSync(OUT_DIR)) mkdirSync(OUT_DIR, { recursive: true });
  const html = buildDemoHtml(templateHTML);
  writeFileSync(OUT_HTML, html);

  console.log(`[extract-notify-template] ✓ 输出: ${OUT_HTML}`);
  console.log(`[extract-notify-template] 模板字符数: ${templateHTML.length}`);
}

main();