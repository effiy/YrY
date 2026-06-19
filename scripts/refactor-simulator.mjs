#!/usr/bin/env node
/**
 * Batch refactor: 演示.html → yry-simulator/index.js
 * Replaces sim log IIFE + state vars + 4 simulator functions with external script.
 *
 * Usage: node cdn/js/refactor-simulator.mjs [--dry-run]
 */

import { readFileSync, writeFileSync } from 'node:fs';
import { globSync } from 'node:fs';
import { resolve, relative, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '../..');
const DRY_RUN = process.argv.includes('--dry-run');

const SIM_LOG_BLOCK = `(function(){var origLog=function(msg,color){var box=document.getElementById('simLogBox');if(!box)return;box.style.display='block';var div=document.createElement('div');div.className='log-line';var now=new Date();var time=('0'+now.getHours()).slice(-2)+':'+('0'+now.getMinutes()).slice(-2)+':'+('0'+now.getSeconds()).slice(-2)+'.'+('00'+now.getMilliseconds()).slice(-3);div.innerHTML='<span class="log-time">'+time+'</span><span class="log-icon" style="color:'+(color||'var(--text2)')+'">●</span><span style="color:'+(color||'var(--text2)')+'">'+msg+'</span>';var ms=document.createElement('span');ms.className='log-ms';ms.textContent='+0ms';div.appendChild(ms);box.appendChild(div);box.scrollTop=box.scrollHeight;return div};var startTime=Date.now();window.simLog=function(msg,color){var div=origLog(msg,color);if(div){var ms=Date.now()-startTime;div.querySelector('.log-ms').textContent='+'+ms+'ms'}};setTimeout(function(){window.simLog=window.simLog;},0)})();`;

const STATE_VARS = `var simRunning=false,simSpeed=1,simStageIds=['stg0','stg1','stg2','stg3','stg4'];`;

// The 4 function definitions will be matched and removed together
// using a start/end pattern

if (DRY_RUN) console.log('[DRY-RUN] No files will be modified.\n');

const files = [
  ...new Set([
    ...globSync(resolve(root, 'docs/故事任务面板/*/场景-*/演示.html')),
    ...globSync(resolve(root, 'cdn/故事任务面板/cdn/场景-*/演示.html')),
  ])
];

console.log(`演示.html files: ${files.length} total\n`);

let rep = 0, total = 0;
for (const f of files) {
  const raw = readFileSync(f, 'utf-8');

  // 1. Find sim log block
  const logIdx = raw.indexOf(SIM_LOG_BLOCK);
  if (logIdx === -1) {
    console.log(`  ✗ ${relative(root, f)} — sim log not found`);
    continue;
  }

  // 2. Find state vars (immediately after sim log)
  const stateIdx = raw.indexOf(STATE_VARS, logIdx + SIM_LOG_BLOCK.length);
  if (stateIdx === -1) {
    console.log(`  ✗ ${relative(root, f)} — state vars not found`);
    continue;
  }

  // 3. Find the 4 function blocks that follow. They span from:
  //    function updateStage(...){...} through function startSim(...){...}
  //    (immediately after state vars, through newline, stageDefsS3 is between state vars and updateStage)
  // Wait - let me re-check the structure. After state vars:
  //    \nvar stageDefsS3=[...];\nfunction updateStage(...)...function startSim(...){...}
  // So updateStage starts AFTER stageDefsS3. Let me find it differently.
  const funcSearchStart = stateIdx + STATE_VARS.length;

  // Find function updateStage (skip past stageDefsS3 which varies per file)
  const updateStageIdx = raw.indexOf('function updateStage(idx,statusCls,statusText,barPct)', funcSearchStart);
  if (updateStageIdx === -1) {
    console.log(`  ✗ ${relative(root, f)} — updateStage not found`);
    continue;
  }

  // Find the end: function startSim body ends with the closing } before </script>
  // Search for the pattern that ends startSim: },duration)}setTimeout(next,300/simSpeed)}
  const startSimEnd = raw.indexOf('},duration)}setTimeout(next,300/simSpeed)}', updateStageIdx);
  if (startSimEnd === -1) {
    console.log(`  ✗ ${relative(root, f)} — startSim end not found`);
    continue;
  }
  const funcEndIdx = startSimEnd + '},duration)}setTimeout(next,300/simSpeed)}'.length;

  // Now find the main <script> block that contains this code
  let scriptStart = -1;
  let searchFrom = logIdx;
  while (searchFrom > 0) {
    const candidate = raw.lastIndexOf('<script>', searchFrom);
    if (candidate === -1) break;
    if (raw[candidate + 7] !== ' ' && raw[candidate + 7] !== '\t') {
      scriptStart = candidate;
      break;
    }
    searchFrom = candidate - 1;
  }
  if (scriptStart === -1) {
    console.log(`  ✗ ${relative(root, f)} — inline <script> not found`);
    continue;
  }

  const srcPath = relative(dirname(f), resolve(root, 'cdn', 'yry-simulator/index.js'));
  const afterScriptTag = raw.slice(scriptStart + '<script>'.length);

  // Positions relative to afterScriptTag
  const relLog = logIdx - scriptStart - '<script>'.length;
  const relState = stateIdx - scriptStart - '<script>'.length;
  const relFuncStart = updateStageIdx - scriptStart - '<script>'.length;
  const relFuncEnd = funcEndIdx - scriptStart - '<script>'.length;

  // Build new main block by removing the 3 sections
  let mainContent = afterScriptTag;

  // Remove sim log block (work backwards to preserve positions)
  mainContent = mainContent.slice(0, relLog) + mainContent.slice(relLog + SIM_LOG_BLOCK.length);

  // Recalculate state vars position (shifted by sim log removal)
  const shift1 = SIM_LOG_BLOCK.length;
  const adjState = relState - shift1;
  // Remove newline before state vars if present
  let stateStart = adjState;
  if (mainContent[stateStart - 1] === '\n') { stateStart--; }
  mainContent = mainContent.slice(0, stateStart) + mainContent.slice(adjState + STATE_VARS.length);

  // Recalculate function positions (shifted by both removals)
  const shift2 = shift1 + (adjState - stateStart) + STATE_VARS.length;
  const adjFuncStart = relFuncStart - shift2;
  const adjFuncEnd = relFuncEnd - shift2;

  // Remove newline before function block if present
  let funcStart = adjFuncStart;
  while (funcStart > 0 && mainContent[funcStart - 1] === '\n') { funcStart--; }
  mainContent = mainContent.slice(0, funcStart) + mainContent.slice(adjFuncEnd);

  // Build the final file
  const before = raw.slice(0, scriptStart);
  const newRaw = before +
    `<script src="${srcPath}"></script>\n` +
    `<script>` +
    mainContent;
  const saved = raw.length - newRaw.length;

  if (DRY_RUN) {
    console.log(`[DRY-RUN] ${relative(root, f)} (${saved}B)`);
  } else {
    writeFileSync(f, newRaw, 'utf-8');
  }
  rep++;
  total += saved;
}

console.log(`\n${rep}/${files.length} replaced, ${total}B saved (~${Math.round(total / 1024)}KB)`);
