#!/usr/bin/env node
/**
 * rui-trends — technology trend discovery
 *
 * Usage: node skills/rui-trends/rui-trends.mjs <command> [options]
 * Commands: status, github-trending, oss-insight, trendshift, top-starred, find-skills, all
 */

import { NODE_ARGV_OFFSET } from '../../lib/constants.mjs';
import { dim, yellow, cyan } from '../../lib/tty.mjs';
import { checkStatus, fetchGitHubTrending, fetchOSSInsight, fetchTrendShift, fetchTopStarred,
         fetchAll, findAgentSkillRepos } from './lib/trend-fetch.mjs';
import { formatStatus, formatGitHubTrending, formatOSSInsight, formatTrendShift,
         formatTopStarred, formatAll } from './lib/format.mjs';
import { saveTrendSnapshot, saveAllTrendSnapshot } from './lib/trend-report.mjs';

const HELP_HINT = `${dim('使用')} ${cyan('node skills/rui-trends/help.mjs')} ${dim('查看完整帮助')}`;

// ── arg parsing ────────────────────────────────────────────────────────

function parseArgs(/** @type {string[]} */ argv) {
  const cmd = argv[NODE_ARGV_OFFSET] || 'status';
  /** @type {Record<string, any>} */
  const options = {};
  const positional = [];

  for (let i = NODE_ARGV_OFFSET + 1; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--lang' || a === '-l') options.lang = argv[++i];
    else if (a === '--since') options.since = argv[++i];
    else if (a === '--metric') options.metric = argv[++i];
    else if (a === '--range') options.range = parseInt(argv[++i], 10);
    else if (a === '--min-stars') options.minStars = parseInt(argv[++i], 10);
    else if (a === '--limit') options.limit = parseInt(argv[++i], 10);
    else if (a === '--help' || a === '-h') return { cmd: 'help', options: {} };
    else if (a === '--html') options.html = true;
    else if (!a.startsWith('-')) positional.push(a);
    else options[a.replace(/^-+/, '')] = true;
  }

  if (positional.length > 0) options._ = positional;
  return { cmd, options };
}

// ── main ───────────────────────────────────────────────────────────────

async function main() {
  const { cmd, options } = parseArgs(process.argv);

  if (cmd === 'help' || cmd === '--help' || cmd === '-h') {
    const { execSync } = await import('node:child_process');
    execSync('node skills/rui-trends/help.mjs', { cwd: process.cwd(), stdio: 'inherit' });
    return;
  }

  console.error(dim(`[rui-trends] ${cmd} — 查询中...`));

  switch (cmd) {
    case 'status': {
      const r = await checkStatus();
      console.log(formatStatus(r));
      break;
    }
    case 'github-trending': {
      const r = await fetchGitHubTrending(options);
      console.log(formatGitHubTrending(r));
      if (options.html) {
        const { filename } = saveTrendSnapshot(r);
        console.error(dim(`[rui-trends] HTML 报告已保存: docs/趋势报告/${filename}`));
      }
      break;
    }
    case 'oss-insight': {
      const r = await fetchOSSInsight(options);
      console.log(formatOSSInsight(r));
      if (options.html) {
        const { filename } = saveTrendSnapshot(r);
        console.error(dim(`[rui-trends] HTML 报告已保存: docs/趋势报告/${filename}`));
      }
      break;
    }
    case 'trendshift': {
      const r = await fetchTrendShift(options);
      console.log(formatTrendShift(r));
      if (options.html) {
        const { filename } = saveTrendSnapshot(r);
        console.error(dim(`[rui-trends] HTML 报告已保存: docs/趋势报告/${filename}`));
      }
      break;
    }
    case 'top-starred': {
      const r = await fetchTopStarred(options);
      console.log(formatTopStarred(r));
      if (options.html) {
        const { filename } = saveTrendSnapshot(r);
        console.error(dim(`[rui-trends] HTML 报告已保存: docs/趋势报告/${filename}`));
      }
      break;
    }
    case 'find-skills': {
      console.log(`${dim('> Agent 技能发现已迁移至')} ${cyan('rui-skills')}。\n`);
      console.log(`${dim('使用')} ${cyan('/rui-skills')} ${dim('发现和安装技能。')}`);
      const r = await fetchGitHubTrending(options);
      if (r.ok) {
        const agentRepos = findAgentSkillRepos(r);
        if (agentRepos.length) {
          console.log(`\n${dim('当前 GitHub Trending 中可能相关的 Agent/技能仓库：')}\n`);
          for (const repo of agentRepos.slice(0, 10)) {
            console.log(`  • ${repo.repo}${repo.language ? ` (${repo.language})` : ''} — ${(repo.description || '').slice(0, 80)}`);
          }
        }
      }
      break;
    }
    case 'all': {
      const r = await fetchAll(options);
      console.log(formatAll(r));
      if (options.html) {
        const { filename } = saveAllTrendSnapshot(r);
        console.error(dim(`[rui-trends] HTML 综合报告已保存: docs/趋势报告/${filename}`));
      }
      break;
    }
    default: {
      console.log(`${yellow(`未知子命令: ${cmd}`)}\n${HELP_HINT}`);
      process.exit(1);
    }
  }
}

main().catch((e) => {
  console.error(yellow(`[rui-trends] 错误: ${e.message}`));
  console.error(dim(e.stack));
  process.exit(1);
});
