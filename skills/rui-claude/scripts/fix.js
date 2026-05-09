#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const PROJECT = path.basename(process.cwd());
const CLAUDE_DIR = path.join(process.cwd(), '.claude');

// ---- 业务无关项（可自动补齐） ----

const INFRA_FILES = {
  '.mcp.json': JSON.stringify({ mcpServers: {} }, null, 2) + '\n',
  'settings.json': JSON.stringify({ permissions: {} }, null, 2) + '\n',
  'settings.local.json': JSON.stringify({}, null, 2) + '\n',
};

const INFRA_DIRS = ['templates'];

// ---- 业务相关项（禁止补齐） ----

const BUSINESS_FILES = [
  'CLAUDE.md',
  'agents/AGENT.md',
  'agents/pm.md',
  'agents/coder.md',
  'agents/tester.md',
  'agents/reporter.md',
  'agents/security.md',
  'agents/self-improve.md',
  'rules/code-pipeline.md',
  'rules/doc-generation.md',
  'rules/gate-rules.md',
  'rules/self-improve.md',
  'rules/rui-claude.md',
  'rules/rui-docs.md',
];

const BUSINESS_DIRS = ['skills'];

function isDirEmpty(dir) {
  if (!fs.existsSync(dir)) return true;
  return fs.readdirSync(dir).length === 0;
}

// ---- 检查 ----

function check(dryRun) {
  const results = { fixed: [], skipped: [], business: [] };

  if (!fs.existsSync(CLAUDE_DIR)) {
    if (!dryRun) fs.mkdirSync(CLAUDE_DIR, { recursive: true });
  }

  // 业务无关文件
  for (const [filename, content] of Object.entries(INFRA_FILES)) {
    const fp = path.join(CLAUDE_DIR, filename);
    if (fs.existsSync(fp)) {
      results.skipped.push({ path: filename, reason: '已存在' });
    } else if (dryRun) {
      results.fixed.push({ path: filename, action: '将创建' });
    } else {
      try {
        fs.writeFileSync(fp, content, 'utf8');
        results.fixed.push({ path: filename, action: '创建' });
      } catch (e) {
        results.skipped.push({ path: filename, reason: `写入失败: ${e.message}` });
      }
    }
  }

  // 业务无关目录
  for (const dir of INFRA_DIRS) {
    const dp = path.join(CLAUDE_DIR, dir);
    if (fs.existsSync(dp)) {
      results.skipped.push({ path: `${dir}/`, reason: '已存在' });
    } else if (dryRun) {
      results.fixed.push({ path: `${dir}/`, action: '将创建空目录' });
    } else {
      try {
        fs.mkdirSync(dp, { recursive: true });
        results.fixed.push({ path: `${dir}/`, action: '创建空目录' });
      } catch (e) {
        results.skipped.push({ path: `${dir}/`, reason: `创建失败: ${e.message}` });
      }
    }
  }

  // 业务相关：只报告缺失，不补齐
  for (const f of BUSINESS_FILES) {
    const fp = path.join(CLAUDE_DIR, f);
    const dp = path.dirname(fp);
    if (!fs.existsSync(fp)) {
      results.business.push({ path: f, reason: fs.existsSync(dp) ? '文件缺失' : '目录缺失' });
    }
  }

  for (const dir of BUSINESS_DIRS) {
    const dp = path.join(CLAUDE_DIR, dir);
    if (!fs.existsSync(dp) || isDirEmpty(dp)) {
      results.business.push({ path: `${dir}/`, reason: '目录缺失或为空' });
    }
  }

  return results;
}

// ---- 输出 ----

function report(results) {
  console.log(`🔧 rui-claude fix: ${PROJECT}\n`);

  if (results.fixed.length > 0) {
    console.log(`已补齐（${results.fixed.length} 项）：`);
    for (const item of results.fixed) {
      console.log(`  ✅ ${item.action}: ${item.path}`);
    }
    console.log('');
  }

  if (results.skipped.length > 0) {
    console.log(`跳过（${results.skipped.length} 项）：`);
    for (const item of results.skipped) {
      console.log(`  ⏭️  ${item.path} — ${item.reason}`);
    }
    console.log('');
  }

  if (results.business.length > 0) {
    console.log(`禁止补齐 — 业务相关内容（${results.business.length} 项）：`);
    for (const item of results.business) {
      console.log(`  🚫 ${item.path} — ${item.reason}`);
    }
    console.log('');
    console.log(`> 以上 ${results.business.length} 项涉及业务定义（Agent 角色 / 管线规则 / Skill 逻辑），不可自动生成。请通过 /rui init 或 /rui-claude sync 获取。`);
    console.log('');
  }

  if (results.fixed.length === 0 && results.business.length === 0) {
    console.log('✅ 配置完整，无需补齐。');
  }
}

// ---- CLI ----

const args = process.argv.slice(2);
const jsonOutput = args.includes('--json');

if (args.includes('--help') || args.includes('-h')) {
  console.log('用法: node fix.js [--json] [--dry-run]');
  console.log('  --json      输出 JSON');
  console.log('  --dry-run   仅检查，不写入');
  process.exit(0);
}

if (args.includes('--dry-run')) {
  const results = check(true);
  if (jsonOutput) {
    console.log(JSON.stringify({ project: PROJECT, ...results }, null, 2));
  } else {
    // 仅报告 business 缺失项
    if (results.business.length > 0) {
      console.log(`业务相关缺失（${results.business.length} 项，不自动补齐）：`);
      for (const item of results.business) {
        console.log(`  🚫 ${item.path} — ${item.reason}`);
      }
    }
    const infraMissing = results.fixed.length;
    if (infraMissing > 0) {
      console.log(`\n可补齐基础设施（${infraMissing} 项），执行 /rui-claude fix 应用。`);
    } else if (results.business.length === 0) {
      console.log('✅ 配置完整。');
    }
  }
  process.exit(0);
}

// 默认：执行补齐
const results = check(false);
if (jsonOutput) {
  console.log(JSON.stringify({ project: PROJECT, ...results }, null, 2));
} else {
  report(results);
}
