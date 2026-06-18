#!/usr/bin/env node
/**
 * rui-html — 故事场景 HTML 文档生成器
 *
 * 读取故事 markdown 文档，按参考模板生成 7 类标准 HTML。
 * Usage: node skills/rui-html/rui-html.mjs <story> [--scene N] [--type name] [--force]
 */

import { join, resolve } from 'node:path';
import { existsSync, readdirSync } from 'node:fs';
import { bold, dim, red, green, yellow, cyan } from '../../lib/tty.mjs';
import { NODE_ARGV_OFFSET, STORY_PANEL_DIR } from '../../lib/constants.mjs';
import { findProjectRoot } from '../../lib/fs.mjs';
import { extractSceneData } from './lib/extractor.mjs';
import { generateSceneDocs } from './lib/generator.mjs';
import { DOC_TYPES } from './lib/templates.mjs';

function parseArgs() {
  const args = process.argv.slice(NODE_ARGV_OFFSET);
  if (args.length === 0 || args[0] === '--help' || args[0] === '-h' || args[0] === 'help') {
    return { command: 'help' };
  }

  const storyName = args[0];
  let scene = null;
  let type = null;
  let force = false;

  for (let i = 1; i < args.length; i++) {
    if ((args[i] === '--scene' || args[i] === '-s') && args[i + 1]) {
      scene = parseInt(args[++i], 10);
    }
    if ((args[i] === '--type' || args[i] === '-t') && args[i + 1]) {
      type = args[++i];
    }
    if (args[i] === '--force' || args[i] === '-f') {
      force = true;
    }
  }

  return { command: 'generate', storyName, scene, type, force };
}

function findStoryDir(projectRoot, storyName) {
  const storyDir = join(projectRoot, STORY_PANEL_DIR, storyName);
  if (!existsSync(storyDir)) {
    console.error(red(`故事 "${storyName}" 不存在于 ${STORY_PANEL_DIR}/`));
    const panelDir = join(projectRoot, STORY_PANEL_DIR);
    if (existsSync(panelDir)) {
      const available = readdirSync(panelDir, { withFileTypes: true })
        .filter(d => d.isDirectory() && !d.name.startsWith('.'))
        .map(d => d.name);
      if (available.length > 0) {
        console.error(dim(`可用故事: ${available.join(', ')}`));
      }
    }
    process.exit(1);
  }
  return storyDir;
}

function findSceneDirs(storyDir) {
  const entries = readdirSync(storyDir, { withFileTypes: true });
  return entries
    .filter(d => d.isDirectory() && /^场景-\d+-/.test(d.name))
    .map(d => d.name)
    .sort();
}

async function main() {
  const opts = parseArgs();

  if (opts.command === 'help') {
    const { execSync } = await import('node:child_process');
    const helpPath = resolve(import.meta.dirname || __dirname, 'help.mjs');
    execSync(`node "${helpPath}"`, { stdio: 'inherit' });
    return;
  }

  // Validate type if specified
  if (opts.type && !DOC_TYPES.includes(opts.type)) {
    console.error(red(`无效文档类型 "${opts.type}"`));
    console.error(dim(`可用类型: ${DOC_TYPES.join(', ')}`));
    process.exit(1);
  }

  const projectRoot = findProjectRoot(process.cwd());
  const storyDir = findStoryDir(projectRoot, opts.storyName);
  const allScenes = findSceneDirs(storyDir);

  if (allScenes.length === 0) {
    console.error(yellow(`故事 "${opts.storyName}" 下没有找到场景目录`));
    process.exit(1);
  }

  // Filter scenes
  let targetScenes = allScenes;
  if (opts.scene !== null) {
    const prefix = `场景-${opts.scene}-`;
    targetScenes = allScenes.filter(s => s.startsWith(prefix));
    if (targetScenes.length === 0) {
      console.error(red(`未找到场景 ${opts.scene}`));
      console.error(dim(`可用场景: ${allScenes.join(', ')}`));
      process.exit(1);
    }
  }

  // Filter doc types
  const targetTypes = opts.type ? [opts.type] : DOC_TYPES;

  console.log(bold(`\n📐 rui-html — ${opts.storyName}`));
  console.log(dim(`  场景数: ${targetScenes.length}  ·  文档类型: ${targetTypes.length}  ·  模式: ${opts.force ? '强制覆盖' : '安全跳过'}`));
  console.log();

  let totalGenerated = 0;
  let totalSkipped = 0;

  for (const sceneDir of targetScenes) {
    const scenePath = join(storyDir, sceneDir);
    console.log(cyan(`  ${sceneDir}/`));

    // Extract data from index.md
    const ctx = extractSceneData(scenePath, opts.storyName);

    if (!ctx) {
      console.log(dim('    ⚠ index.md 不存在，跳过'));
      continue;
    }

    // Build story title from context
    ctx.storyTitle = ctx.storyTitle || opts.storyName;
    ctx.force = opts.force;

    // Generate docs
    for (const docType of targetTypes) {
      const result = generateSceneDocs(ctx, docType, scenePath);
      if (result.generated) {
        console.log(green(`    ✅ ${docType}.html`));
        totalGenerated++;
      } else if (result.skipped) {
        console.log(yellow(`    ⏭ ${docType}.html (已存在，--force 覆盖)`));
        totalSkipped++;
      } else if (result.error) {
        console.log(red(`    ❌ ${docType}.html — ${result.error}`));
      }
    }
  }

  console.log();
  console.log(bold('  摘要:'));
  console.log(green(`    生成: ${totalGenerated}`));
  if (totalSkipped > 0) console.log(yellow(`    跳过: ${totalSkipped}`));
  console.log();
}

main().catch(err => {
  console.error(red(`错误: ${err.message}`));
  process.exit(1);
});
