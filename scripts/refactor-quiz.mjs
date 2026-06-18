#!/usr/bin/env node
/**
 * Batch refactor: yry-breadcrumb 演示.html → yry-quiz.js
 * Replaces inline quiz scoring <script>...</script> with <script src="../../../yry-quiz.js"></script>
 *
 * Usage: node cdn/js/refactor-quiz.mjs [--dry-run]
 */

import { readFileSync, writeFileSync } from 'node:fs';
import { globSync } from 'node:fs';
import { resolve, relative, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '../..');
const DRY_RUN = process.argv.includes('--dry-run');

const QUIZ_SCRIPT = `document.querySelectorAll('.quiz-opt').forEach(function(opt) {
  opt.addEventListener('click', function() {
    var card = this.closest('.quiz-card');
    if (card.classList.contains('answered')) return;
    card.classList.add('answered');
    var isCorrect = this.dataset.answer === 'correct';
    this.classList.add(isCorrect ? 'correct' : 'wrong');
    card.querySelector('.quiz-feedback').classList.add('show');
    card.querySelectorAll('.quiz-opt').forEach(function(o) { o.classList.add('disabled'); });
    if (isCorrect) {
      card.dataset.score = '1';
    }
    updateQuizScore();
  });
});
function updateQuizScore() {
  var total = document.querySelectorAll('.quiz-card').length;
  var score = document.querySelectorAll('.quiz-card[data-score="1"]').length;
  var el = document.querySelector('.quiz-score');
  if (el) { el.classList.add('show'); el.querySelector('.qs-big').textContent = score + '/' + total; }
}`;

if (DRY_RUN) console.log('[DRY-RUN] No files will be modified.\n');

const files = globSync(resolve(root, 'cdn/故事任务面板/yry-breadcrumb/场景-*/演示.html'));
console.log(`yry-breadcrumb 演示.html: ${files.length} total\n`);

let rep = 0, total = 0;
for (const f of files) {
  const raw = readFileSync(f, 'utf-8');
  const srcPath = relative(dirname(f), resolve(root, 'cdn', 'yry-quiz.js'));

  // Find the quiz script tag
  const startMarker = `<script>\n${QUIZ_SCRIPT}`;
  const idx = raw.indexOf(startMarker);
  if (idx === -1) {
    console.log(`  ✗ ${relative(root, f)} — quiz script not found`);
    continue;
  }

  const endTag = '\n</script>';
  const endIdx = raw.indexOf(endTag, idx + startMarker.length);
  if (endIdx === -1) {
    console.log(`  ✗ ${relative(root, f)} — </script> not found`);
    continue;
  }

  const before = raw.slice(0, idx);
  const after = raw.slice(endIdx + endTag.length);
  const newRaw = before + `<script src="${srcPath}"></script>` + after;
  const saved = raw.length - newRaw.length;

  if (DRY_RUN) {
    console.log(`[DRY-RUN] ${relative(root, f)} (${saved}B)`);
  } else {
    writeFileSync(f, newRaw, 'utf-8');
  }
  rep++;
  total += saved;
}

console.log(`\n${rep}/${files.length} replaced, ${total}B saved`);
