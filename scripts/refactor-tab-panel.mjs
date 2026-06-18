#!/usr/bin/env node
/**
 * Batch refactor: 演示.html tab panel IIFE → YrY.initDemoTabs()
 *
 * Replaces the inline 5-line tab panel init with a deferred call after shared.js loads.
 * Since YrY.initDemoTabs is defined in shared.js (loaded after main block),
 * we place the call in a new <script> after shared.js.
 *
 * Usage: node cdn/js/refactor-tab-panel.mjs [--dry-run]
 */

import { readFileSync, writeFileSync } from 'node:fs';
import { globSync } from 'node:fs';
import { resolve, relative, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '../..');
const DRY_RUN = process.argv.includes('--dry-run');

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

  // Find the tab panel IIFE: starts with (function(){var SCENE_KEY='
  const startMarker = "(function(){var SCENE_KEY='";
  const iifeIdx = raw.indexOf(startMarker);
  if (iifeIdx === -1) {
    console.log(`  ✗ ${relative(root, f)} — SCENE_KEY IIFE not found`);
    continue;
  }

  // Extract SCENE_KEY value
  const keyStart = iifeIdx + startMarker.length;
  const keyEnd = raw.indexOf("'", keyStart);
  const sceneKey = raw.slice(keyStart, keyEnd);

  // Find the end of the IIFE: ...catch(e){}})();
  // The pattern ends with: })();
  // Search for the closing after SCENE_KEY
  const iifeEnd = raw.indexOf('})();', raw.indexOf('catch(e){}', iifeIdx));
  if (iifeEnd === -1) {
    console.log(`  ✗ ${relative(root, f)} — IIFE end not found`);
    continue;
  }
  const iifeBlockEnd = iifeEnd + '})();'.length;

  // Remove the IIFE block from the main <script>
  const before = raw.slice(0, iifeIdx);
  let after = raw.slice(iifeBlockEnd);

  // Clean up leading newlines (there might be blank lines)
  after = after.replace(/^\n{1,2}/, '');

  // Add the init call AFTER shared.js
  // Find the shared.js script tag
  const sharedIdx = after.indexOf('<script src="') + after.slice(after.indexOf('<script src="')).indexOf('shared.js');
  if (sharedIdx === -1) {
    console.log(`  ✗ ${relative(root, f)} — shared.js not found`);
    continue;
  }

  // Find the end of the shared.js tag
  const sharedEnd = after.indexOf('</script>', sharedIdx) + '</script>'.length;

  const srcPath = relative(dirname(f), resolve(root, 'cdn', 'shared.js'));
  const newCall = `\n<script>YrY.initDemoTabs('${sceneKey}')</script>`;

  const newRaw = before +
    after.slice(0, sharedEnd) +
    newCall +
    after.slice(sharedEnd);
  const saved = raw.length - newRaw.length;

  if (DRY_RUN) {
    console.log(`[DRY-RUN] ${relative(root, f)} key=${sceneKey} (${saved}B)`);
  } else {
    writeFileSync(f, newRaw, 'utf-8');
  }
  rep++;
  total += saved;
}

console.log(`\n${rep}/${files.length} replaced, ${total}B saved (~${Math.round(total / 1024)}KB)`);
