#!/usr/bin/env node
/**
 * Batch refactor: quiz block (docs variant) → YrY.initDocsQuiz()
 * Replaces the 4-line inline quiz code with a deferred call after shared.js.
 *
 * Usage: node cdn/js/refactor-quiz-docs.mjs [--dry-run]
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

  // Find quiz comment marker
  const commentIdx = raw.indexOf('/* ─── Quiz ─── */');
  if (commentIdx === -1) {
    console.log(`  ✗ ${relative(root, f)} — quiz comment not found`);
    continue;
  }

  // Find quizState line after comment
  const stateIdx = raw.indexOf('var quizState={', commentIdx);
  if (stateIdx === -1) {
    console.log(`  ✗ ${relative(root, f)} — quizState not found`);
    continue;
  }

  // Find quizAnswerCorrect
  const correctIdx = raw.indexOf('var quizAnswerCorrect={', stateIdx);
  if (correctIdx === -1) {
    console.log(`  ✗ ${relative(root, f)} — quizAnswerCorrect not found`);
    continue;
  }

  // Extract total from quizState: count commas between { and }
  const stateEnd = raw.indexOf('}', stateIdx);
  const stateBody = raw.slice(raw.indexOf('{', stateIdx) + 1, stateEnd);
  const totalQ = stateBody.split(',').filter(function(s) { return s.trim(); }).length;

  // Extract correct answers
  const correctStart = raw.indexOf('{', correctIdx);
  const correctEnd = raw.indexOf('}', correctStart);
  const correctBody = raw.slice(correctStart + 1, correctEnd);
  // Parse pairs like "0:2" or "k:1"
  const pairs = correctBody.split(',').map(function(s) {
    const parts = s.trim().split(':');
    return parts.map(function(p) { return p.trim(); });
  });

  // Extract feedback text from showQuizScore
  const ssIdx = raw.indexOf('function showQuizScore(){', stateIdx);
  if (ssIdx === -1) {
    console.log(`  ✗ ${relative(root, f)} — showQuizScore not found`);
    continue;
  }

  function extractStr(str, marker) {
    const s = str.indexOf(marker);
    if (s === -1) return '';
    const start = str.indexOf("'", s) + 1;
    const end = str.indexOf("'", start);
    return str.slice(start, end);
  }

  const ssBody = raw.slice(ssIdx, raw.indexOf('var quizAnswerCorrect', ssIdx));
  const fbExcellent = extractStr(ssBody, 'sub.textContent=');
  const fbGood = extractStr(ssBody.slice(ssBody.indexOf(fbExcellent) + fbExcellent.length + 2), 'sub.textContent=');
  const fbPoor = extractStr(ssBody.slice(ssBody.lastIndexOf('else sub.textContent=')), 'else sub.textContent=');

  // Build init call
  const correctObj = pairs.map(function(p) { return p[0] + ':' + p[1]; }).join(',');
  const esc = function(s) { return s.replace(/\\/g, '\\\\').replace(/'/g, "\\'"); };

  const initCall =
    'YrY.initDocsQuiz({total:' + totalQ +
    ',correctAnswers:{' + correctObj + '}' +
    ',fbExcellent:\'' + esc(fbExcellent) + '\'' +
    ',fbGood:\'' + esc(fbGood) + '\'' +
    ',fbPoor:\'' + esc(fbPoor) + '\'' +
    '})';

  // Remove the 4 quiz lines
  // Line 1: comment
  let start = commentIdx;
  if (start > 0 && raw[start - 1] === '\n') start--;

  // Line 2: quizState
  let stateLineEnd = raw.indexOf('\n', stateIdx);
  if (stateLineEnd === -1) stateLineEnd = raw.length;

  // Line 3: quizAnswer
  const answerIdx = raw.indexOf('window.quizAnswer=function', stateLineEnd);
  let answerLineEnd = raw.indexOf('\n', answerIdx);
  if (answerLineEnd === -1) answerLineEnd = raw.length;

  // Line 4: showQuizScore
  const ssEnd = raw.indexOf('\n', ssIdx);
  let ssLineEnd = raw.indexOf('\n', ssEnd + 1);
  if (ssLineEnd === -1) ssLineEnd = raw.length;

  // Line 5: quizAnswerCorrect
  let correctLineEnd = raw.indexOf('\n', correctIdx);
  if (correctLineEnd === -1) correctLineEnd = raw.length;

  // End after quizAnswerCorrect line
  let end = correctLineEnd;
  // Consume trailing newline
  if (end < raw.length && raw[end] === '\n') end++;
  // Consume blank line after
  if (end < raw.length && raw[end] === '\n') end++;

  // Find shared.js to place the call after it
  const sharedStart = raw.indexOf('<script src="');
  const sharedSearch = raw.indexOf('shared.js', sharedStart);
  if (sharedSearch === -1) {
    console.log(`  ✗ ${relative(root, f)} — shared.js not found`);
    continue;
  }
  const sharedTagEnd = raw.indexOf('</script>', sharedSearch) + '</script>'.length;

  const before = raw.slice(0, start);
  const after = raw.slice(end);
  const afterBefore = after.slice(0, sharedTagEnd);
  const afterAfter = after.slice(sharedTagEnd);

  const newCall = '\n<script>' + initCall + '</script>';
  const newRaw = before + afterBefore + newCall + afterAfter;
  const saved = raw.length - newRaw.length;

  if (DRY_RUN) {
    console.log(`[DRY-RUN] ${relative(root, f)} total=${totalQ} (${saved}B)`);
  } else {
    writeFileSync(f, newRaw, 'utf-8');
  }
  rep++;
  total += saved;
}

console.log(`\n${rep}/${files.length} replaced, ${total}B saved (~${Math.round(total / 1024)}KB)`);
