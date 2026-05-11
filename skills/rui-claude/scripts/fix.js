#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const CLAUDE_DIR = path.join(process.cwd(), '.claude');

// ---- 业务无关项（可自动补齐） ----

const INFRA_FILES = {
  '.mcp.json': JSON.stringify({
    mcpServers: {},
    _doc: 'MCP (Model Context Protocol) 服务配置。添加服务见 _example。',
    _example: {
      mcpServers: {
        filesystem: {
          command: 'npx',
          args: ['-y', '@modelcontextprotocol/server-filesystem', '/path/to/allowed/dir']
        }
      }
    }
  }, null, 2) + '\n',
  'settings.json': JSON.stringify({
    permissions: {},
    _doc: 'Claude Code 项目级配置。permissions 控制工具调用授权——格式: { "tool_name": { "allow": true } }。'
  }, null, 2) + '\n',
  'settings.local.json': JSON.stringify({
    _doc: '本地覆盖配置（不入库、不同步）。优先级高于 settings.json。常用场景：个人 API key、本地路径、调试开关。',
    permissions: {}
  }, null, 2) + '\n',
};

const INFRA_DIRS = ['templates'];

// ---- 工具函数 ----

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

// ---- 检查基础设施 ----

function checkInfra(targetClaude, dryRun) {
  const results = { fixed: [], skipped: [] };

  ensureDir(targetClaude);

  for (const [filename, content] of Object.entries(INFRA_FILES)) {
    const fp = path.join(targetClaude, filename);
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

  for (const dir of INFRA_DIRS) {
    const dp = path.join(targetClaude, dir);
    if (fs.existsSync(dp)) {
      results.skipped.push({ path: `${dir}/`, reason: '已存在' });
    } else if (dryRun) {
      results.fixed.push({ path: `${dir}/`, action: '将创建空目录' });
    } else {
      try {
        ensureDir(dp);
        results.fixed.push({ path: `${dir}/`, action: '创建空目录' });
      } catch (e) {
        results.skipped.push({ path: `${dir}/`, reason: `创建失败: ${e.message}` });
      }
    }
  }

  return results;
}

// ---- 输出 ----

function report(results) {
  console.log(`🔧 rui-claude fix\n`);

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

  if (results.fixed.length === 0 && results.skipped.every(s => s.reason === '已存在')) {
    console.log('✅ 基础设施完整，无需补齐。');
  }
}

// ---- CLI ----

const args = process.argv.slice(2);
const jsonOutput = args.includes('--json');
const dryRun = args.includes('--dry-run');

if (args.includes('--help') || args.includes('-h')) {
  console.log('用法: node fix.js [选项]');
  console.log('');
  console.log('选项:');
  console.log('  --json        输出 JSON 格式');
  console.log('  --dry-run     仅检查，不写入');
  console.log('');
  console.log('示例:');
  console.log('  node fix.js               补齐本地基础设施骨架');
  console.log('  node fix.js --dry-run     预览补全计划');
  process.exit(0);
}

const results = checkInfra(CLAUDE_DIR, dryRun);
if (jsonOutput) {
  console.log(JSON.stringify(results, null, 2));
} else {
  report(results);
}
