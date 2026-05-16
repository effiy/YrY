#!/usr/bin/env node

/**
 * hook-sync — import-docs 的 hook 适配器
 *
 * 执行 import-docs --workspace 全量同步。
 * 降级: API_X_TOKEN 缺失时静默退出，不阻断管线。
 */

'use strict';

const { execSync } = require('child_process');
const path = require('path');

function main() {
  if (!process.env.API_X_TOKEN) {
    console.log('hook-sync: API_X_TOKEN not set, skipped');
    process.exit(0);
  }

  const script = path.join(__dirname, 'import-docs.js');

  try {
    execSync(`node "${script}" --workspace`, {
      cwd: process.cwd(),
      stdio: 'inherit',
      timeout: 120000,
    });
  } catch (err) {
    console.error(`hook-sync: sync failed — ${err.message}`);
    // 网络失败不阻断
  }
}

main();
