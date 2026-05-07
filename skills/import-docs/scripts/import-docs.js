#!/usr/bin/env node

const fs = require('fs');
const fsp = fs.promises;
const path = require('path');
const http = require('https');
const util = require('util');
const { execFile } = require('child_process');
const execFileAsync = util.promisify(execFile);

/**
 * 从起始目录向上查找项目根目录（workspace root）
 * 优先检测 .git，否则检测 workspace 特征（.claude/ + 子项目目录）
 * @param {string} startDir - 起始目录
 * @returns {string} 项目根目录
 */
function findProjectRoot(startDir) {
  let currentDir = path.resolve(startDir);
  let gitRoot = null;
  while (true) {
    try {
      fs.accessSync(path.join(currentDir, '.git'));
      gitRoot = currentDir;
    } catch {
      // 没找到，继续
    }
    const parentDir = path.dirname(currentDir);
    if (parentDir === currentDir) break;
    currentDir = parentDir;
  }

  if (gitRoot) {
    // .claude 仓库模式：workspace 根为父目录
    if (path.basename(gitRoot) === '.claude') return path.dirname(gitRoot);
    return gitRoot;
  }

  // 无 .git 时检测 workspace 特征
  let candidate = path.resolve(startDir);
  while (true) {
    const hasClaudeDir = fs.existsSync(path.join(candidate, '.claude'));
    const entries = fs.readdirSync(candidate, { withFileTypes: true });
    const subprojectDirs = entries.filter(e =>
      e.isDirectory() && !e.name.startsWith('.') && !e.name.startsWith('_')
    ).map(e => e.name);
    if (hasClaudeDir && subprojectDirs.length >= 2) return candidate;
    const parentDir = path.dirname(candidate);
    if (parentDir === candidate) break;
    candidate = parentDir;
  }
  return path.resolve(startDir);
}

/**
 * 检查当前目录是否在项目根目录的 .claude 下
 * @param {string} cwd - 当前工作目录
 * @param {string} projectRoot - 项目根目录
 * @returns {boolean}
 */
function isInClaudeDir(cwd, projectRoot) {
  const claudeDir = path.join(projectRoot, '.claude');
  const relative = path.relative(claudeDir, cwd);
  return !relative.startsWith('..') && !path.isAbsolute(relative);
}

/**
 * 查找文件，优先使用 git ls-files 以遵循 .gitignore 规则
 * @param {string} dir - 起始目录
 * @param {string[]} exts - 扩展名列表，为空表示所有文件
 * @param {string} projectRoot - git 仓库根目录
 * @returns {Promise<string[]>} 文件路径列表
 */
async function findFiles(dir, exts, projectRoot) {
  const dirRel = path.relative(projectRoot, dir);
  const canUseGit = projectRoot && !dirRel.startsWith('..') && !path.isAbsolute(dirRel);

  if (canUseGit) {
    try {
      await fsp.access(path.join(projectRoot, '.git'));
      const { stdout } = await execFileAsync('git', ['-C', projectRoot, 'ls-files', '--cached', '--others', '--exclude-standard'], {
        maxBuffer: 50 * 1024 * 1024
      });
      const dirRelPosix = dirRel.split(path.sep).join('/');
      return stdout
        .split('\n')
        .filter(Boolean)
        .filter(file => dirRelPosix === '' || file === dirRelPosix || file.startsWith(dirRelPosix + '/'))
        .filter(file => {
          if (exts.length === 0) return true;
          const ext = path.extname(file).slice(1).toLowerCase();
          return exts.includes(ext);
        })
        .map(file => path.join(projectRoot, file));
    } catch {
      // 回退到文件系统遍历
    }
  }

  const results = [];

  async function traverse(currentDir) {
    const entries = await fsp.readdir(currentDir, { withFileTypes: true });

    for (const entry of entries) {
      if (entry.name === '.git' || entry.name === 'node_modules') {
        continue;
      }
      const fullPath = path.join(currentDir, entry.name);

      if (entry.isDirectory() && !entry.isSymbolicLink()) {
        await traverse(fullPath);
      } else if (entry.isFile()) {
        if (exts.length === 0) {
          results.push(fullPath);
        } else {
          const ext = path.extname(entry.name).slice(1).toLowerCase();
          if (exts.includes(ext)) {
            results.push(fullPath);
          }
        }
      }
    }
  }

  await traverse(dir);
  return results;
}

/** X-Token 仅从系统环境变量 `API_X_TOKEN` 读取，不接受配置文件或其它来源。 */
function readApiXTokenFromEnv() {
  const v = process.env.API_X_TOKEN;
  if (v == null || v === '') return null;
  const t = String(v).trim();
  return t || null;
}

/**
 * 查找工作区内所有待导入目标
 * 规则：根 .claude/（除 .git）+ docs/（.md）；子项目 .claude/（除 .git）+ docs/（.md）+ CLAUDE.md + README.md
 * @param {string} projectRoot - 工作区根目录
 * @returns {Array<{dir: string, exts: string[], label: string, names?: string[]}>}
 */
function findWorkspaceTargets(projectRoot) {
  const targets = [];
  const subprojects = fs.readdirSync(projectRoot, { withFileTypes: true })
    .filter(e => e.isDirectory() && !e.name.startsWith('.') && !e.name.startsWith('_') && e.name !== 'docs')
    .map(e => e.name)
    .sort();

  // Root .claude/ — all files except .git
  const rootClaudeDir = path.join(projectRoot, '.claude');
  if (fs.existsSync(rootClaudeDir)) {
    targets.push({ dir: rootClaudeDir, exts: [], label: '.claude' });
  }

  // Root docs/ — .md files
  const docsDir = path.join(projectRoot, 'docs');
  if (fs.existsSync(docsDir)) {
    targets.push({ dir: docsDir, exts: ['md'], label: 'docs' });
  }

  // Sub-projects: .claude/, docs/, CLAUDE.md, README.md
  for (const name of subprojects) {
    const projDir = path.join(projectRoot, name);

    const claudeDir = path.join(projDir, '.claude');
    if (fs.existsSync(claudeDir)) {
      targets.push({ dir: claudeDir, exts: [], label: `${name}/.claude` });
    }

    const projDocsDir = path.join(projDir, 'docs');
    if (fs.existsSync(projDocsDir)) {
      targets.push({ dir: projDocsDir, exts: ['md'], label: `${name}/docs` });
    }

    for (const fileName of ['CLAUDE.md', 'README.md']) {
      const filePath = path.join(projDir, fileName);
      if (fs.existsSync(filePath)) {
        targets.push({ dir: projDir, exts: [], names: [fileName], label: `${name}/${fileName}` });
      }
    }
  }

  return targets;
}

/**
 * 确定导入配置
 * @returns {object} 配置对象
 */
function determineConfig() {
  const args = process.argv.slice(2);
  const config = {
    command: 'import',
    dir: null,
    exts: null,
    token: readApiXTokenFromEnv(),
    apiUrl: 'https://api.effiy.cn',
    prefix: [],
    workspace: false
  };

  let argStartIndex = 0;
  if (args[0] && !args[0].startsWith('-')) {
    config.command = args[0];
    argStartIndex = 1;
  }

  for (let i = argStartIndex; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--dir' || arg === '-d') {
      config.dir = path.resolve(args[++i]);
    } else if (arg === '--exts' || arg === '-e') {
      config.exts = args[++i].split(',').map(e => e.trim().toLowerCase());
    } else if (arg === '--token' || arg === '-t') {
      console.error('Error: --token 已禁用。出于安全原因，仅允许使用系统环境变量 API_X_TOKEN。');
      process.exit(1);
    } else if (arg === '--api-url' || arg === '-a') {
      config.apiUrl = args[++i];
    } else if (arg === '--prefix' || arg === '-p') {
      config.prefix = args[++i].split(',').map(p => p.trim()).filter(Boolean);
    } else if (arg === '--workspace' || arg === '-w') {
      config.workspace = true;
    } else if (arg === '--help' || arg === '-h') {
      printHelp();
      process.exit(0);
    }
  }

  const cwd = process.cwd();
  const projectRoot = findProjectRoot(cwd);

  if (config.workspace) {
    // workspace mode: scan all targets, ignore dir/exts
    config.targets = findWorkspaceTargets(projectRoot);
  } else {
    const inClaudeDir = isInClaudeDir(cwd, projectRoot);

    if (config.dir === null) {
      if (inClaudeDir) {
        const claudeDir = path.join(projectRoot, '.claude');
        try {
          fs.accessSync(claudeDir);
          config.dir = claudeDir;
        } catch {
          config.dir = cwd;
        }
        config.exts = config.exts || [];
      } else {
        config.dir = projectRoot;
        config.exts = config.exts || ['md'];
      }
    } else {
      const dirName = path.basename(config.dir);
      if (['.claude', '.cursor'].includes(dirName)) {
        config.exts = config.exts || [];
      } else {
        config.exts = config.exts || ['md'];
      }
    }
    config.targets = [{ dir: config.dir, exts: config.exts || [], label: path.basename(config.dir) }];
  }

  return { ...config, projectRoot };
}

function printHelp() {
  console.log(`
Document import — sync local files to remote documentation API

Usage:
  node .claude/skills/import-docs/scripts/import-docs.js import [options]
  node .claude/skills/import-docs/scripts/import-docs.js list [options]
  node .claude/skills/import-docs/scripts/import-docs.js [options]   # defaults to import

Options:
  --workspace, -w  Scan root .claude/ + docs/ + each subproject .claude/ + docs/ + CLAUDE.md + README.md
  --dir, -d        Single directory to import (default: auto-detect)
  --exts, -e       File extensions (comma-separated, default: auto-detect)
  --token, -t      [disabled] use API_X_TOKEN environment variable only
  --api-url, -a    API base URL (default: https://api.effiy.cn)
  --prefix, -p     Path prefix (comma-separated, e.g. Projects,YourNamespace)
  --help, -h       Show this help message
`);
}

function request(apiUrl, endpoint, method, token, data) {
  return new Promise((resolve, reject) => {
    const url = new URL(endpoint, apiUrl);
    const postData = data ? JSON.stringify(data) : null;

    const requestOptions = {
      hostname: url.hostname,
      port: url.port || 443,
      path: url.pathname + url.search,
      method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    if (token) {
      requestOptions.headers['X-Token'] = token;
    }

    if (postData) {
      requestOptions.headers['Content-Length'] = Buffer.byteLength(postData);
    }

    const req = http.request(requestOptions, (res) => {
      let body = '';
      res.on('data', (chunk) => {
        body += chunk;
      });
      res.on('end', () => {
        try {
          resolve(JSON.parse(body));
        } catch (e) {
          resolve(body);
        }
      });
    });

    req.on('error', reject);

    if (postData) {
      req.write(postData);
    }

    req.end();
  });
}

async function getExistingSessions(apiUrl, token) {
  const result = await request(apiUrl, '/', 'POST', token, {
    module_name: 'services.database.data_service',
    method_name: 'query_documents',
    parameters: {
      cname: 'sessions',
      limit: 10000
    }
  });

  const sessions = result?.data?.list || [];
  const existingSet = new Set();

  for (const session of sessions) {
    if (session.file_path) {
      existingSet.add(session.file_path);
    }
  }

  return { sessions, existingSet };
}

async function importFile(fullPath, projectRoot, apiUrl, token, existingSet, prefix) {
  const relativeFromRoot = path.relative(projectRoot, fullPath)
    .split(path.sep)
    .map(part => part.replace(/\s+/g, '_'))
    .join('/');

  const rootDirName = path.basename(projectRoot).replace(/\s+/g, '_');

  const targetPathParts = [];
  if (prefix.length > 0) {
    targetPathParts.push(...prefix.map(part => part.replace(/\s+/g, '_')));
  }
  targetPathParts.push(rootDirName);
  targetPathParts.push(relativeFromRoot);

  const targetPath = targetPathParts.join('/');
  const allParts = targetPath.split('/');
  const title = allParts[allParts.length - 1];
  const tags = allParts.slice(0, -1);
  const isDuplicate = existingSet.has(targetPath);
  const content = await fsp.readFile(fullPath, 'utf-8');

  await request(apiUrl, '/write-file', 'POST', token, {
    target_file: targetPath,
    content,
    is_base64: false
  });

  if (isDuplicate) {
    return { status: 'overwritten', path: targetPath };
  }

  const now = Date.now();
  const random = Math.random().toString(36).slice(2, 11);
  await request(apiUrl, '/', 'POST', token, {
    module_name: 'services.database.data_service',
    method_name: 'create_document',
    parameters: {
      cname: 'sessions',
      data: {
        url: `app-session://${now}-${random}`,
        title,
        file_path: targetPath,
        messages: [],
        tags,
        isFavorite: false,
        createdAt: now,
        updatedAt: now,
        lastAccessTime: now
      }
    }
  });

  existingSet.add(targetPath);
  return { status: 'ok', path: targetPath };
}

function toSortedRelativePaths(files, baseDir) {
  return files
    .map(file => path.relative(baseDir, file).split(path.sep).join('/'))
    .sort((a, b) => a.localeCompare(b, 'zh-Hans-CN'));
}

async function main() {
  const config = determineConfig();

  if (!['import', 'list'].includes(config.command)) {
    console.error(`Error: unsupported command "${config.command}". Use "import" or "list".`);
    process.exit(1);
  }

  const isWorkspaceMode = config.workspace;
  const targets = config.targets;

  for (const target of targets) {
    try {
      await fsp.access(target.dir);
    } catch {
      console.log(`[${target.label}] directory not found, skipping`);
      continue;
    }
  }

  const validTargets = targets.filter(t => fs.existsSync(t.dir));

  console.log('=== Document import ===');
  console.log('Command:', config.command);
  console.log('Mode:', isWorkspaceMode ? 'workspace' : 'single');
  if (config.command === 'import') {
    console.log('API:', config.apiUrl);
    if (config.prefix.length > 0) {
      console.log('Prefix:', config.prefix.join('/'));
    }
  }
  console.log(`Targets: ${validTargets.length}`);
  for (const t of validTargets) {
    const filterLabel = t.names ? t.names.join(',') : (t.exts.length === 0 ? 'all' : t.exts.join(','));
    console.log(`  - ${t.label} (${filterLabel})`);
  }
  console.log();

  // Collect all files across targets
  const allFiles = [];
  for (const target of validTargets) {
    if (target.names) {
      for (const name of target.names) {
        allFiles.push({ fullPath: path.join(target.dir, name), target });
      }
    } else {
      const files = await findFiles(target.dir, target.exts, config.projectRoot);
      for (const file of files) {
        allFiles.push({ fullPath: file, target });
      }
    }
  }

  console.log(`Found ${allFiles.length} files`);

  if (allFiles.length === 0) {
    console.log('No files to process');
    return;
  }

  if (config.command === 'list') {
    for (const { fullPath, target } of allFiles) {
      if (target.names) {
        console.log(`- ${target.label}`);
      } else {
        const relativePath = path.relative(target.dir, fullPath).split(path.sep).join('/');
        console.log(`- ${target.label}/${relativePath}`);
      }
    }
    return;
  }

  if (!config.token) {
    console.error('Error: missing API_X_TOKEN environment variable');
    process.exit(1);
  }

  console.log('Querying existing sessions...');
  const { existingSet } = await getExistingSessions(config.apiUrl, config.token);
  console.log(`Found ${existingSet.size} existing sessions with file_path`);
  console.log();

  const stats = { ok: 0, overwritten: 0, failed: 0 };

  for (let i = 0; i < allFiles.length; i++) {
    const { fullPath, target } = allFiles[i];
    if (target.names) {
      console.log(`[${i + 1}/${allFiles.length}] [${target.label}]`);
    } else {
      const relativePath = path.relative(target.dir, fullPath);
      console.log(`[${i + 1}/${allFiles.length}] [${target.label}] ${relativePath}`);
    }

    try {
      const result = await importFile(fullPath, config.projectRoot, config.apiUrl, config.token, existingSet, config.prefix);
      if (result.status === 'ok') {
        console.log(`  ✓ ${result.path} (created)`);
        stats.ok++;
      } else if (result.status === 'overwritten') {
        console.log(`  ✓ ${result.path} (file overwritten, session exists)`);
        stats.overwritten++;
      }
    } catch (error) {
      console.log(`  ✗ ${relativePath} - ${error.message}`);
      stats.failed++;
    }
  }

  console.log();
  console.log(`Done: ${stats.ok} created, ${stats.overwritten} overwritten, ${stats.failed} failed`);

  if (stats.failed > 0) {
    process.exit(1);
  }
}

main().catch(error => {
  console.error('Error:', error.message);
  process.exit(1);
});
