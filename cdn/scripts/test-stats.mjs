#!/usr/bin/env node
/**
 * cdn 测试统计 — 生成测试覆盖情况报告
 * 只统计 Vue3 custom element 组件(含 defineCustomElement 或 YrYVueCE)
 */
import fs from 'node:fs';
import path from 'node:path';

const CDN = path.resolve(import.meta.dirname, '..');
const testsDir = path.join(CDN, 'tests');

// 列出所有 Vue3 custom element 组件
const allDirs = fs
  .readdirSync(CDN)
  .filter((d) => d.startsWith('yry-') && fs.existsSync(path.join(CDN, d, 'index.js')));

const vue3Components = [];
for (const d of allDirs) {
  const content = fs.readFileSync(path.join(CDN, d, 'index.js'), 'utf8');
  if (content.includes('defineCustomElement') || content.includes('YrYVueCE')) {
    vue3Components.push(d);
  }
}
vue3Components.sort();

// 列出所有测试文件
const testFiles = fs
  .readdirSync(testsDir)
  .filter((f) => f.startsWith('yry-') && f.endsWith('.test.mjs'));

// 测试覆盖的组件
const testedComponents = new Set();
for (const tf of testFiles) {
  const m = tf.match(/^(yry-.+)\.test\.mjs$/);
  if (m) testedComponents.add(m[1]);
}

const untested = vue3Components.filter((c) => !testedComponents.has(c));
const coverage =
  vue3Components.length > 0
    ? ((testedComponents.size / vue3Components.length) * 100).toFixed(1)
    : 0;

console.log('═══════════════════════════════════════════════════════');
console.log('  YrY CDN · Vue3 组件测试覆盖统计');
console.log('═══════════════════════════════════════════════════════');
console.log(`  Vue3 组件总数:    ${vue3Components.length}`);
console.log(`  已测试组件:      ${testedComponents.size} (${coverage}%)`);
console.log(`  未测试组件:      ${untested.length}`);
console.log(`  测试文件数:      ${testFiles.length}`);
console.log('═══════════════════════════════════════════════════════');
if (untested.length > 0) {
  console.log('  未测试 Vue3 组件:');
  for (const c of untested) console.log(`    - ${c}`);
  console.log('═══════════════════════════════════════════════════════');
} else {
  console.log('  ✅ 所有 Vue3 组件都已测试覆盖');
  console.log('═══════════════════════════════════════════════════════');
}
