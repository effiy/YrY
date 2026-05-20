#!/usr/bin/env node
/**
 * Plugin health analyzer — checks .claude-plugin/ integrity across multiple dimensions.
 *
 * Exit: 0 = healthy, 1 = errors found
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..', '..');

const REQUIRED_PLUGIN_FIELDS = ['name', 'description', 'version', 'author', 'repository', 'keywords', 'license'];
const REQUIRED_DIRS = ['skills', 'agents', 'rules'];

function status(level, msg) {
  return { level, msg };
}

function checkPluginJson() {
  const p = path.join(ROOT, '.claude-plugin', 'plugin.json');
  if (!fs.existsSync(p)) {
    return [status('ERROR', 'plugin.json not found')];
  }

  const results = [];
  try {
    const obj = JSON.parse(fs.readFileSync(p, 'utf-8'));
    for (const field of REQUIRED_PLUGIN_FIELDS) {
      if (obj[field] === undefined || obj[field] === null || obj[field] === '') {
        results.push(status('ERROR', `plugin.json: missing field "${field}"`));
      }
    }
    if (obj.author && !obj.author.name) {
      results.push(status('WARN', 'plugin.json: author.name is empty'));
    }
    if (obj.keywords && (!Array.isArray(obj.keywords) || obj.keywords.length === 0)) {
      results.push(status('WARN', 'plugin.json: keywords is empty'));
    }
    if (results.length === 0) {
      results.push(status('PASS', 'plugin.json: all required fields present'));
    }
  } catch (e) {
    results.push(status('ERROR', `plugin.json: parse error — ${e.message}`));
  }
  return results;
}

function checkMarketplaceJson() {
  const p = path.join(ROOT, '.claude-plugin', 'marketplace.json');
  if (!fs.existsSync(p)) {
    return [status('ERROR', 'marketplace.json not found')];
  }

  const results = [];
  try {
    const obj = JSON.parse(fs.readFileSync(p, 'utf-8'));

    if (!obj.metadata) {
      results.push(status('ERROR', 'marketplace.json: missing metadata'));
    } else {
      if (!obj.metadata.description) results.push(status('WARN', 'marketplace.json: metadata.description missing'));
      if (!obj.metadata.version) results.push(status('ERROR', 'marketplace.json: metadata.version missing'));
    }

    if (!obj.plugins || !Array.isArray(obj.plugins) || obj.plugins.length === 0) {
      results.push(status('ERROR', 'marketplace.json: plugins array empty or missing'));
    } else {
      const p0 = obj.plugins[0];
      if (!p0.name) results.push(status('ERROR', 'marketplace.json: plugins[0].name missing'));
      if (!p0.version) results.push(status('ERROR', 'marketplace.json: plugins[0].version missing'));
      if (!p0.source || !p0.source.repo) {
        results.push(status('WARN', 'marketplace.json: plugins[0].source.repo missing'));
      }
      if (obj.metadata && p0.version && obj.metadata.version !== p0.version) {
        results.push(status('ERROR',
          `marketplace.json: version mismatch — metadata=${obj.metadata.version} vs plugins[0]=${p0.version}`));
      }
    }

    if (results.every(r => r.level !== 'ERROR')) {
      results.push(status('PASS', 'marketplace.json: valid'));
    }
  } catch (e) {
    results.push(status('ERROR', `marketplace.json: parse error — ${e.message}`));
  }
  return results;
}

function checkVersionConsistency() {
  return checkVersionConsistencyInline();
}

function checkVersionConsistencyInline() {
  // Simple inline version: read plugin.json version and CLAUDE.md version directly
  try {
    const pluginRaw = fs.readFileSync(path.join(ROOT, '.claude-plugin', 'plugin.json'), 'utf-8');
    const pluginVer = JSON.parse(pluginRaw).version;
    const claudeRaw = fs.readFileSync(path.join(ROOT, 'CLAUDE.md'), 'utf-8');
    const claudeMatch = claudeRaw.match(/\| 版本 \| (\d+\.\d+\.\d+) \|/);
    if (!claudeMatch) return [status('WARN', 'version consistency: could not parse CLAUDE.md version')];
    if (pluginVer === claudeMatch[1]) {
      return [status('PASS', 'version consistency: plugin.json matches CLAUDE.md')];
    }
    return [status('ERROR', `version consistency: plugin.json=${pluginVer} vs CLAUDE.md=${claudeMatch[1]}`)];
  } catch (e) {
    return [status('ERROR', `version consistency: ${e.message}`)];
  }
}

function checkRequiredDirs() {
  const results = [];
  for (const dir of REQUIRED_DIRS) {
    const p = path.join(ROOT, dir);
    if (!fs.existsSync(p)) {
      results.push(status('WARN', `directory "${dir}/" not found`));
    }
  }
  if (results.length === 0) {
    results.push(status('PASS', `required directories: all ${REQUIRED_DIRS.length} present`));
  }
  return results;
}

function showHelp() {
  console.log('rui-plugin health — 插件健康分析');
  console.log('');
  console.log('用法: /rui-plugin health');
  console.log('检查维度: plugin.json / marketplace.json / version 一致性 / 必需目录');
  console.log('退出: 0 = healthy, 1 = error');
  console.log('');
  console.log('详细: /rui-plugin --help 或 node skills/rui-plugin/help.mjs');
  process.exit(0);
}

function main() {
  const arg = process.argv[2];
  if (arg === '--help' || arg === '-h' || arg === 'help') {
    showHelp();
  }

  const allResults = [
    { dimension: 'plugin.json completeness', checks: checkPluginJson() },
    { dimension: 'marketplace.json validity', checks: checkMarketplaceJson() },
    { dimension: 'version consistency', checks: checkVersionConsistencyInline() },
    { dimension: 'required directories', checks: checkRequiredDirs() },
  ];

  // Count totals
  let totalPass = 0, totalWarn = 0, totalError = 0;

  console.log('Plugin Health Report');
  console.log('===================\n');

  for (const { dimension, checks } of allResults) {
    console.log(`── ${dimension}`);
    for (const c of checks) {
      const icon = c.level === 'PASS' ? '✅' : c.level === 'WARN' ? '⚠️' : '❌';
      console.log(`  ${icon} ${c.msg}`);
      if (c.level === 'PASS') totalPass++;
      else if (c.level === 'WARN') totalWarn++;
      else totalError++;
    }
    console.log('');
  }

  console.log(`Summary: ${totalPass} pass, ${totalWarn} warn, ${totalError} error`);

  if (totalError > 0) {
    console.log('\nHealth check FAILED — fix errors above.');
    process.exit(1);
  }

  if (totalWarn > 0) {
    console.log('\nHealth check PASSED with warnings.');
  } else {
    console.log('\nHealth check PASSED.');
  }
  process.exit(0);
}

main();
