#!/usr/bin/env node

/**
 * import-docs — 将本地文档批量同步到远端 API
 *
 * 用法:
 *   node import-docs.js --workspace          # 全量同步
 *   node import-docs.js list --workspace     # 仅列出文件
 *   node import-docs.js --dir <path>         # 指定目录
 */

'use strict';

const fs = require('fs');
const fsp = fs.promises;
const path = require('path');
const https = require('https');
const http = require('http');

// ── 项目根目录探测 ─────────────────────────────────────────────

function findProjectRoot(startDir) {
  let dir = path.resolve(startDir);
  while (true) {
    if (fs.existsSync(path.join(dir, '.git'))) return dir;
    if (fs.existsSync(path.join(dir, '.claude'))) return dir;
    const parent = path.dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  return path.resolve(startDir);
}

// ── 文件扫描 ───────────────────────────────────────────────────

async function scanFiles(dir, projectRoot, exts, excludeDirs) {
  const extSet = new Set(exts);
  const excludes = new Set(['.git', 'node_modules', '.claude-plugin', ...excludeDirs]);
  const results = [];

  async function walk(current) {
    let entries;
    try { entries = await fsp.readdir(current, { withFileTypes: true }); } catch { return; }

    for (const entry of entries) {
      if (excludes.has(entry.name)) continue;
      const full = path.join(current, entry.name);

      if (entry.isDirectory()) {
        await walk(full);
      } else if (entry.isFile()) {
        const rel = path.relative(projectRoot, full);
        const underClaude = rel.startsWith('.claude' + path.sep);
        if (underClaude || extSet.has(path.extname(entry.name).slice(1).toLowerCase())) {
          results.push(full);
        }
      }
    }
  }

  await walk(dir);
  return results;
}

// ── HTTP 请求 ──────────────────────────────────────────────────

function request(apiUrl, endpoint, method, token, data) {
  return new Promise((resolve, reject) => {
    const url = new URL(endpoint, apiUrl);
    const mod = url.protocol === 'https:' ? https : http;
    const body = data ? JSON.stringify(data) : null;
    const opts = {
      hostname: url.hostname,
      port: url.port || (url.protocol === 'https:' ? 443 : 80),
      path: url.pathname + url.search,
      method,
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    };
    if (token) opts.headers['X-Token'] = token;
    if (body) opts.headers['Content-Length'] = Buffer.byteLength(body);

    const req = mod.request(opts, (res) => {
      const chunks = [];
      res.on('data', (c) => chunks.push(c));
      res.on('end', () => {
        const raw = Buffer.concat(chunks).toString('utf-8');
        try { resolve(JSON.parse(raw)); } catch { resolve(raw); }
      });
    });
    req.on('error', reject);
    req.setTimeout(30000, () => { req.destroy(); reject(new Error('timeout')); });
    if (body) req.write(body);
    req.end();
  });
}

// ── 远端路径解析 ───────────────────────────────────────────────

function resolveRemotePath(fullPath, projectRoot, prefix) {
  const rel = path.relative(projectRoot, fullPath).split(path.sep).map(p => p.replace(/\s+/g, '_')).join('/');

  // docs/故事任务面板/ 下的文件以「故事任务面板」为一级标签
  const storyPanel = 'docs/故事任务面板/';
  if (rel.startsWith(storyPanel.replace(/\//g, path.sep === '\\' ? '\\' : '/')) || rel.startsWith('docs/故事任务面板/')) {
    const sub = rel.slice(storyPanel.length);
    return [...prefix, '故事任务面板', sub].filter(Boolean).join('/');
  }

  const label = path.basename(projectRoot).replace(/\s+/g, '_');
  return [...prefix, label, rel].filter(Boolean).join('/');
}

// ── 上传单文件 ─────────────────────────────────────────────────

async function uploadFile(fullPath, projectRoot, apiUrl, token, existingPaths, prefix) {
  const remotePath = resolveRemotePath(fullPath, projectRoot, prefix);
  const content = await fsp.readFile(fullPath, 'utf-8');

  await request(apiUrl, '/write-file', 'POST', token, {
    target_file: remotePath,
    content,
    is_base64: false,
  });

  if (existingPaths.has(remotePath)) return { status: 'overwritten', path: remotePath };

  // 创建 session
  const now = Date.now();
  const parts = remotePath.split('/');
  await request(apiUrl, '/', 'POST', token, {
    module_name: 'services.database.data_service',
    method_name: 'create_document',
    parameters: {
      cname: 'sessions',
      data: {
        url: `app-session://${now}-${Math.random().toString(36).slice(2, 9)}`,
        title: parts[parts.length - 1],
        file_path: remotePath,
        messages: [],
        tags: parts.slice(0, -1),
        isFavorite: false,
        createdAt: now,
        updatedAt: now,
        lastAccessTime: now,
      },
    },
  });

  existingPaths.add(remotePath);
  return { status: 'created', path: remotePath };
}

// ── 查询已有 sessions ──────────────────────────────────────────

async function getExistingPaths(apiUrl, token) {
  const result = await request(apiUrl, '/', 'POST', token, {
    module_name: 'services.database.data_service',
    method_name: 'query_documents',
    parameters: { cname: 'sessions', limit: 10000 },
  });
  const list = result?.data?.list || [];
  return new Set(list.map(s => s.file_path).filter(Boolean));
}

// ── 并发池 ─────────────────────────────────────────────────────

async function pool(concurrency, items, fn) {
  const executing = new Set();
  for (const item of items) {
    const p = fn(item).then(() => executing.delete(p));
    executing.add(p);
    if (executing.size >= concurrency) await Promise.race(executing);
  }
  await Promise.all(executing);
}

// ── CLI ────────────────────────────────────────────────────────

async function main() {
  const args = process.argv.slice(2);
  let command = 'import';
  let idx = 0;

  if (args[0] && !args[0].startsWith('-')) { command = args[0]; idx = 1; }

  const config = { dir: null, exts: ['md'], excludeDirs: [], prefix: [], workspace: false, apiUrl: 'https://api.effiy.cn' };

  for (let i = idx; i < args.length; i++) {
    const a = args[i];
    if (a === '--workspace' || a === '-w') config.workspace = true;
    else if (a === '--dir' || a === '-d') config.dir = path.resolve(args[++i]);
    else if (a === '--exts' || a === '-e') config.exts = args[++i].split(',').map(e => e.trim().replace(/^\./, ''));
    else if (a === '--exclude' || a === '-x') config.excludeDirs = args[++i].split(',').map(d => d.trim());
    else if (a === '--prefix' || a === '-p') config.prefix = args[++i].split(',').map(p => p.trim());
    else if (a === '--api-url' || a === '-a') config.apiUrl = args[++i];
  }

  const projectRoot = findProjectRoot(process.cwd());
  const scanDir = config.dir || projectRoot;
  const files = await scanFiles(scanDir, projectRoot, config.exts, config.excludeDirs);

  console.log(`Scan: ${files.length} files in ${path.relative(process.cwd(), scanDir) || '.'}`);

  if (files.length === 0) return;

  if (command === 'list') {
    files.sort().forEach(f => console.log(`  ${path.relative(projectRoot, f)}`));
    return;
  }

  const token = (process.env.API_X_TOKEN || '').trim();
  if (!token) { console.error('Error: API_X_TOKEN not set'); process.exit(1); }

  const existingPaths = await getExistingPaths(config.apiUrl, token);
  const stats = { created: 0, overwritten: 0, failed: 0 };

  await pool(4, files, async (file) => {
    try {
      const r = await uploadFile(file, projectRoot, config.apiUrl, token, existingPaths, config.prefix);
      stats[r.status]++;
      console.log(`  ✓ ${r.path} (${r.status})`);
    } catch (err) {
      stats.failed++;
      console.log(`  ✗ ${path.relative(projectRoot, file)} — ${err.message}`);
    }
  });

  console.log(`\nDone: ${stats.created} created, ${stats.overwritten} overwritten, ${stats.failed} failed`);
  if (stats.failed > 0) process.exit(1);
}

main().catch(err => { console.error('Error:', err.message); process.exit(1); });
