#!/usr/bin/env node
/**
 * Batch refactor: 演示.html → yry-typewriter.js
 * Replaces twAdd / twRun / twReset function definitions with external script reference.
 *
 * Usage: node cdn/js/refactor-typewriter.mjs [--dry-run]
 */

import { readFileSync, writeFileSync } from 'node:fs';
import { globSync } from 'node:fs';
import { resolve, relative, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '../..');
const DRY_RUN = process.argv.includes('--dry-run');

// The exact code block to remove: twAdd + twRun + twReset (keeping twScenarios and setTimeout)
const TW_BLOCK = `function twAdd(type,prompt,cmd,content){var box=document.getElementById('twContent');if(!box)return;var line=document.createElement('span');line.className='tw-line';var colorMap={cmd:'tw-cmd',out:'tw-out',ok:'tw-ok',warn:'tw-warn',info:'tw-info',fail:'tw-fail',muted:'tw-muted'};var c=colorMap[type]||'tw-out';if(type==='cmd'){line.innerHTML='<span class="tw-prompt">'+prompt+'</span><span class="'+c+'">'+cmd+'</span>'}else{line.innerHTML='<span class="'+c+'">'+content+'</span>'}box.appendChild(line);line.scrollIntoView({block:'end',behavior:'smooth'})}
function twRun(scenario,btn){var box=document.getElementById('twContent');if(!box)return;box.innerHTML='';document.querySelectorAll('.tw-ctrl-btn').forEach(function(b){b.classList.remove('on')});if(btn)btn.classList.add('on');var lines=twScenarios[scenario]||[];var delay=0;lines.forEach(function(l){setTimeout(function(){twAdd(l.t,l.p||'',l.c||'',l.c||'');if(!l.t||l.t==='ok'&&!l.c)box.appendChild(document.createElement('br'))},delay);delay+=l.d||180})}
window.twRun=twRun;window.twReset=function(){var box=document.getElementById('twContent');if(box)box.innerHTML=''};`;

if (DRY_RUN) console.log('[DRY-RUN] No files will be modified.\n');

const patterns = [
  'docs/故事任务面板/*/场景-*/演示.html',
  'cdn/故事任务面板/cdn/场景-*/演示.html',
];
const files = [...new Set(patterns.flatMap(p => globSync(resolve(root, p))))];

console.log(`演示.html files with typewriter: ${files.length} total\n`);

let rep = 0, total = 0;
for (const f of files) {
  const raw = readFileSync(f, 'utf-8');
  const twIdx = raw.indexOf(TW_BLOCK);
  if (twIdx === -1) {
    console.log(`  ✗ ${relative(root, f)} — twAdd/twRun not found`);
    continue;
  }

  const srcPath = relative(dirname(f), resolve(root, 'cdn', 'yry-typewriter.js'));

  // Find the main <script> block that contains the typewriter code.
  // Search backwards for <script> immediately followed by newline (inline block).
  let scriptStart = -1;
  let searchFrom = twIdx;
  while (searchFrom > 0) {
    const candidate = raw.lastIndexOf('<script>', searchFrom);
    if (candidate === -1) break;
    // Verify this is an inline script (next char is newline, not ' src')
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

  const before = raw.slice(0, scriptStart);
  const middle = raw.slice(scriptStart, twIdx);
  const after = raw.slice(twIdx + TW_BLOCK.length);

  const newRaw = before +
    `<script src="${srcPath}"></script>\n` +
    middle +
    after;
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
