#!/usr/bin/env node
/**
 * validate-data-flow.mjs — 数据流追踪验证
 *
 * 追踪 rui 管线中各步骤的数据输入/输出，验证数据流契约完整性。
 * 用法: node scripts/validate-data-flow.mjs [--json] [--trace <path>]
 *
 * 对应场景文档:
 *   - docs/故事任务面板/yry-arch/场景-2-数据流追踪/
 */

import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { resolve, join, relative, basename, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const JSON_MODE = process.argv.includes('--json');
const TRACE_MODE = process.argv.includes('--trace');

// ── Define data flow contracts ────────────────────────────────────────
// Each step: name, inputs (files consumed), outputs (files produced)
const PIPELINE_STEPS = [
  {
    id: 'rui-init',
    description: '项目初始化',
    inputs: ['CLAUDE.md', '.claude/'],
    outputs: ['CLAUDE.md', '.claude/settings.json'],
    validate: () => [existsSync(join(ROOT, 'CLAUDE.md'))],
  },
  {
    id: 'rui-doc',
    description: '文档生成',
    inputs: ['CLAUDE.md', 'skills/*/SKILL.md', 'agents/*.md', 'rules/*.md'],
    outputs: ['docs/故事任务面板/*/场景-*/'],
    validate: () => [existsSync(join(ROOT, 'docs', '故事任务面板'))],
  },
  {
    id: 'rui-code',
    description: '代码实现',
    inputs: ['skills/*/SKILL.md', 'templates/'],
    outputs: ['skills/*/*.mjs', 'tests/*/*.test.mjs'],
    validate: () => {
      const skillDir = join(ROOT, 'skills');
      return readdirSync(skillDir).filter(d => statSync(join(skillDir, d)).isDirectory())
        .map(d => readdirSync(join(skillDir, d)).some(f => f.endsWith('.mjs')));
    },
  },
  {
    id: 'rui-story',
    description: '故事面板管理',
    inputs: ['docs/故事任务面板/'],
    outputs: ['docs/故事任务面板/*/场景-*/'],
    validate: () => [existsSync(join(ROOT, 'docs', '故事任务面板'))],
  },
  {
    id: 'rui-import',
    description: '文档同步导入',
    inputs: ['docs/'],
    outputs: ['remote document store'],
    validate: () => [existsSync(join(ROOT, 'skills', 'rui-import', 'sync.mjs'))],
  },
  {
    id: 'rui-bot',
    description: '企微通知',
    inputs: ['story panel state'],
    outputs: ['WeChat Work message'],
    validate: () => [existsSync(join(ROOT, 'skills', 'rui-bot', 'send.mjs'))],
  },
];

// ── Trace a specific file's data flow ─────────────────────────────────
function traceFile(filePath) {
  const rel = relative(ROOT, filePath);
  const steps = [];
  for (const step of PIPELINE_STEPS) {
    const isInput = step.inputs.some(p => {
      const pattern = new RegExp('^' + p.replace(/\*/g, '.*').replace(/\//g, '\\/') + '$');
      return pattern.test(rel);
    });
    const isOutput = step.outputs.some(p => {
      const pattern = new RegExp('^' + p.replace(/\*/g, '.*').replace(/\//g, '\\/') + '$');
      return pattern.test(rel);
    });
    if (isInput || isOutput) {
      steps.push({ step: step.id, role: isInput ? 'input' : 'output', description: step.description });
    }
  }
  return steps;
}

// ── Validate all steps ───────────────────────────────────────────────
function validateAll() {
  const results = [];
  for (const step of PIPELINE_STEPS) {
    const validations = step.validate();
    const allValid = validations.every(Boolean);
    results.push({
      step: step.id,
      description: step.description,
      inputs: step.inputs,
      outputs: step.outputs,
      valid: allValid,
    });
  }
  return results;
}

// ── Main ─────────────────────────────────────────────────────────────
function main() {
  if (TRACE_MODE) {
    const target = process.argv.filter(a => !a.startsWith('--') && a !== process.argv[1]).pop();
    if (!target) { console.log('Usage: --trace <file-path>'); return 1; }
    const steps = traceFile(resolve(target));
    console.log(`Data flow trace for: ${target}\n`);
    if (steps.length === 0) console.log('  No pipeline steps reference this file.');
    else for (const s of steps) console.log(`  ${s.step} [${s.role}]: ${s.description}`);
    return 0;
  }

  const results = validateAll();
  const allValid = results.every(r => r.valid);

  if (JSON_MODE) {
    console.log(JSON.stringify({ timestamp: new Date().toISOString(), results, allValid }));
  } else {
    console.log('╔══════════════════════════════════════════╗');
    console.log('║  YrY 数据流追踪验证                       ║');
    console.log('╚══════════════════════════════════════════╝\n');
    for (const r of results) {
      console.log(`  ${r.valid ? '✅' : '❌'} ${r.step}: ${r.description}`);
      if (!r.valid) console.log(`      missing: ${r.inputs.filter((_, i) => !r.validate()[i]).join(', ')}`);
    }
    console.log(`\n  ${allValid ? '✅ 全部通过' : '❌ 存在断裂'}`);
  }

  return allValid ? 0 : 1;
}

process.exit(main());
