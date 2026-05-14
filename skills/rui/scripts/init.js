#!/usr/bin/env node

// rui init —— 建立项目基线
//
// 用法: node init.js [--dry-run] [--force] [--json] [--help]
//
// 三段式（口诀：探—物—验）
//   1. detect()      扫描项目 → 生成 project-profile.json（事实层）
//   2. materialize() 复制插件公共物料到 .claude/（基线层）
//   3. verify()      五项就绪检查（验证层）
//
// 设计哲学（详见 ../../../CLAUDE.md）
//   - 信模型：项目特有信息全部进 project-profile.json，agent 启动时自读，
//     不再做"项目薄壳"和"rules 基线注入"两个复杂机制
//   - 惜注意：把 1442 行压到 ~400 行，删除哑黏合代码
//   - 验现实：verify() 失败即 exit 1，要求重跑

'use strict';

const fs   = require('fs');
const fsp  = fs.promises;
const path = require('path');
const C    = require('./constants.js');

const REPO_ROOT  = process.cwd();
const CLAUDE_DIR = path.join(REPO_ROOT, '.claude');

// ── 公共物料清单 ────────────────────────────────────────────────
// 整文件复制（每次 init 同步最新）。源在插件根，目标在 .claude/。
//
// 设计：不再做"项目薄壳"——agent 直接读 plugin 原版 + project-profile.json，
// 项目特有信息全在 profile 里。

const AGENT_FILES = ['AGENT.md', 'pm.md', 'coder.md', 'tester.md', 'reporter.md', 'security.md', 'self-improve.md'];
const RULE_FILES  = ['code-pipeline.md', 'delivery-gate.md', 'doc-generation.md', 'rui-claude.md', 'self-improve.md', 'no-magic-number.md'];

// ── 1. detect ──────────────────────────────────────────────────
// 扫描项目，产出 profile。三类信号：
//   - 项目身份：name（目录名）
//   - 项目类型：frontend / backend / fullstack / meta / unknown
//   - 项目清单（manifest）：依赖 + 构建/测试命令 + 技术栈
//
// CLAUDE.md / README.md 不再做"提取注入"——这些是 agent 直接读的活文档。

function detect() {
  const project   = path.basename(REPO_ROOT);
  const typeInfo  = C.detectProjectType(REPO_ROOT);
  const manifest  = extractManifest(REPO_ROOT);

  return {
    project,
    type:        typeInfo.type,
    type_label:  C.labelForType(typeInfo.type),
    tech_signals: typeInfo.indicators,
    coder_formula: C.getCoderFormula(typeInfo.type),
    story_defaults: storyDefaultsFor(typeInfo.type),
    manifest:    {
      ecosystems:    manifest.ecosystems,
      tech_stack:    manifest.techStack,
      dependencies:  manifest.dependencies,
      build_commands: manifest.buildCommands,
      test_commands:  manifest.testCommands,
    },
    generated_at: new Date().toISOString(),
    _doc: 'rui init 生成的项目画像。agent 启动时读取，作为项目特有信息的唯一来源。手动编辑无效——下次 init 会覆盖。',
  };
}

function storyDefaultsFor(type) {
  // 按项目类型决定故事骨架（八件套裁剪）
  const map = {
    frontend:  { skeleton: 'frontend-only',  required_files: ['01', '03', '04', '06', '07', '08'], skip_files: ['02', '05'] },
    backend:   { skeleton: 'backend-only',   required_files: ['01', '02', '04', '05', '07', '08'], skip_files: ['03', '06'] },
    fullstack: { skeleton: 'fullstack',      required_files: ['01', '02', '03', '04', '05', '06', '07', '08'], skip_files: [] },
    meta:      { skeleton: 'fullstack',      required_files: ['01', '02', '03', '04', '05', '06', '07', '08'], skip_files: [] },
  };
  return map[type] || map.meta;
}

// 项目清单（manifest）按生态分派。多生态项目并存抽取并合并。
function extractManifest(root) {
  const out = {
    dependencies:   { production: [], dev: [] },
    buildCommands:  [],
    testCommands:   [],
    techStack:      [],
    ecosystems:     [],
  };
  const exists  = rel => fs.existsSync(path.join(root, rel));
  const read    = rel => { try { return fs.readFileSync(path.join(root, rel), 'utf8'); } catch { return ''; } };
  const uniqAdd = (arr, v) => { if (v && !arr.includes(v)) arr.push(v); };

  // Node
  if (exists('package.json')) {
    try {
      const pkg = JSON.parse(read('package.json'));
      out.dependencies.production.push(...Object.keys(pkg.dependencies || {}));
      out.dependencies.dev.push(...Object.keys(pkg.devDependencies || {}));
      if (pkg.scripts?.build) uniqAdd(out.buildCommands, 'npm run build');
      if (pkg.scripts?.lint)  uniqAdd(out.buildCommands, 'npm run lint');
      if (pkg.scripts?.dev)   uniqAdd(out.buildCommands, 'npm run dev');
      if (pkg.scripts?.test)  uniqAdd(out.testCommands,  'npm test');
      const all = { ...pkg.dependencies, ...pkg.devDependencies };
      for (const fw of ['react','vue','angular','svelte','next','nuxt','express','koa','fastify','nestjs']) {
        if (all[fw]) uniqAdd(out.techStack, `${fw}@${all[fw]}`);
      }
      out.ecosystems.push('node');
    } catch {}
  }

  // Python
  if (exists('pyproject.toml')) {
    const txt = read('pyproject.toml');
    const block = txt.match(/\[(?:project|tool\.poetry)\.dependencies\]([\s\S]*?)(?=\n\[|$)/);
    if (block) for (const m of block[1].matchAll(/^\s*([a-zA-Z0-9_\-]+)\s*=/gm))
      if (m[1] !== 'python') uniqAdd(out.dependencies.production, m[1]);
    uniqAdd(out.buildCommands, 'python -m build');
    uniqAdd(out.testCommands,  'pytest');
    if (/django/i.test(txt))  uniqAdd(out.techStack, 'django');
    if (/flask/i.test(txt))   uniqAdd(out.techStack, 'flask');
    if (/fastapi/i.test(txt)) uniqAdd(out.techStack, 'fastapi');
    out.ecosystems.push('python');
  } else if (exists('requirements.txt')) {
    for (const line of read('requirements.txt').split('\n')) {
      const m = line.match(/^\s*([a-zA-Z0-9_\-\.]+)/);
      if (m && !line.trim().startsWith('#')) uniqAdd(out.dependencies.production, m[1]);
    }
    uniqAdd(out.testCommands, 'pytest');
    out.ecosystems.push('python');
  }

  // Rust
  if (exists('Cargo.toml')) {
    const txt = read('Cargo.toml');
    for (const [section, target] of [['dependencies', out.dependencies.production], ['dev-dependencies', out.dependencies.dev]]) {
      const m = txt.match(new RegExp(`\\[${section}\\]([\\s\\S]*?)(?=\\n\\[|$)`));
      if (m) for (const dep of m[1].matchAll(/^\s*([a-zA-Z0-9_\-]+)\s*=/gm)) uniqAdd(target, dep[1]);
    }
    uniqAdd(out.buildCommands, 'cargo build');
    uniqAdd(out.testCommands,  'cargo test');
    out.ecosystems.push('rust');
  }

  // Go
  if (exists('go.mod')) {
    const txt = read('go.mod');
    const req = txt.match(/require\s*\(([\s\S]*?)\)/);
    const matches = req ? req[1].matchAll(/^\s*([^\s]+)\s+v[\d.]+/gm) : txt.matchAll(/^require\s+([^\s]+)\s+v[\d.]+/gm);
    for (const m of matches) uniqAdd(out.dependencies.production, m[1]);
    uniqAdd(out.buildCommands, 'go build ./...');
    uniqAdd(out.testCommands,  'go test ./...');
    out.ecosystems.push('go');
  }

  // Java
  if (exists('pom.xml')) {
    const txt = read('pom.xml');
    for (const m of txt.matchAll(/<artifactId>([^<]+)<\/artifactId>/g)) uniqAdd(out.dependencies.production, m[1]);
    uniqAdd(out.buildCommands, 'mvn package');
    uniqAdd(out.testCommands,  'mvn test');
    if (/spring-boot/i.test(txt)) uniqAdd(out.techStack, 'spring-boot');
    out.ecosystems.push('java-maven');
  } else if (exists('build.gradle') || exists('build.gradle.kts')) {
    const file = exists('build.gradle.kts') ? 'build.gradle.kts' : 'build.gradle';
    const txt = read(file);
    for (const m of txt.matchAll(/(?:implementation|api|compile|testImplementation)[\s(]+["']([^"':]+:[^"':]+)/g))
      uniqAdd(out.dependencies.production, m[1]);
    const wrapper = exists('gradlew') ? './gradlew' : 'gradle';
    uniqAdd(out.buildCommands, `${wrapper} build`);
    uniqAdd(out.testCommands,  `${wrapper} test`);
    out.ecosystems.push('java-gradle');
  }

  // Ruby / PHP / Meta
  if (exists('Gemfile')) {
    for (const m of read('Gemfile').matchAll(/^\s*gem\s+['"]([^'"]+)['"]/gm))
      uniqAdd(out.dependencies.production, m[1]);
    uniqAdd(out.testCommands, 'bundle exec rspec');
    out.ecosystems.push('ruby');
  }
  if (exists('composer.json')) {
    try {
      const cj = JSON.parse(read('composer.json'));
      out.dependencies.production.push(...Object.keys(cj.require || {}));
      out.dependencies.dev.push(...Object.keys(cj['require-dev'] || {}));
      if (cj.scripts?.test) uniqAdd(out.testCommands, 'composer test');
      out.ecosystems.push('php');
    } catch {}
  }
  if (exists('.claude-plugin/plugin.json')) out.ecosystems.push('meta');

  return out;
}

// ── 2. materialize ─────────────────────────────────────────────
// 复制公共物料到 .claude/。整文件复制（每次 init 同步最新）。
// dryRun: 不写文件，只报告动作；force: 覆盖已有文件。

function materialize(profile, opts) {
  const { dryRun = false, force = false } = opts;
  const result = { created: [], skipped: [], dirs: [] };

  // 创建目录
  for (const d of [
    path.join(CLAUDE_DIR, 'agents'),
    path.join(CLAUDE_DIR, 'rules'),
    path.join(CLAUDE_DIR, '.history'),
    path.join(REPO_ROOT, 'docs', '故事任务面板'),
  ]) {
    if (dryRun) result.dirs.push({ path: rel(d), action: 'will-create' });
    else { ensureDir(d); result.dirs.push({ path: rel(d), action: 'created' }); }
  }

  // 复制 agents/ 和 rules/（整文件）
  copyDir(path.join(REPO_ROOT, 'agents'), path.join(CLAUDE_DIR, 'agents'), AGENT_FILES, opts, result);
  copyDir(path.join(REPO_ROOT, 'rules'),  path.join(CLAUDE_DIR, 'rules'),  RULE_FILES,  opts, result);

  // 复制单文件
  for (const [src, dst, label] of [
    [path.join(REPO_ROOT, 'skills/rui/formulas.md'), path.join(CLAUDE_DIR, 'formulas.md'), 'skills/rui/formulas.md'],
    [path.join(REPO_ROOT, 'skills/rui/coder.md'),    path.join(CLAUDE_DIR, 'coder.md'),    'skills/rui/coder.md'],
    [path.join(REPO_ROOT, '.mcp.json'),              path.join(CLAUDE_DIR, '.mcp.json'),   '.mcp.json'],
    [path.join(REPO_ROOT, 'settings.json'),          path.join(CLAUDE_DIR, 'settings.json'), 'settings.json'],
  ]) {
    copyOne(src, dst, label, opts, result);
  }

  // 写入 project-profile.json（项目特有信息的唯一来源）
  writeJsonFile(path.join(CLAUDE_DIR, 'project-profile.json'), profile, true, opts, result, '项目画像');

  // 生成 settings.local.json（首次空模板，已存在不覆盖）
  writeJsonFile(
    path.join(CLAUDE_DIR, 'settings.local.json'),
    {
      _doc: '本地覆盖配置（不入库、不同步）。优先级高于 settings.json。',
      permissions: {},
    },
    false, opts, result, '本地覆盖模板'
  );

  // 生成 .gitignore（首次创建）
  const gitignore = path.join(CLAUDE_DIR, '.gitignore');
  if (!dryRun && !fs.existsSync(gitignore)) {
    fs.writeFileSync(gitignore, 'settings.local.json\n.history/\n', 'utf8');
    result.created.push({ path: rel(gitignore), action: 'created', source: '本地文件排除' });
  } else if (dryRun && !fs.existsSync(gitignore)) {
    result.created.push({ path: rel(gitignore), action: 'will-create', source: '本地文件排除' });
  }

  return result;
}

// ── 3. verify ──────────────────────────────────────────────────
// 五项就绪检查（合并自原来的 8 项）。任一未通过 → exit 1。

const CHECKS = [
  {
    id: 'CLAUDE.md',
    description: '哲学基础：三公理 + 退化对策',
    validate() {
      const fp = path.join(REPO_ROOT, 'CLAUDE.md');
      if (!fs.existsSync(fp)) return { ok: false, detail: '文件不存在' };
      const c = fs.readFileSync(fp, 'utf8');
      return matchAll(c, [
        ['公理: 信模型', /信模型/],
        ['公理: 惜注意', /惜注意/],
        ['公理: 验现实', /验现实/],
        ['退化对策',   /先可见.*后规则/],
      ]);
    },
  },
  {
    id: 'README.md',
    description: '系统视图：能力 + 结构 + 快速开始',
    validate() {
      const fp = path.join(REPO_ROOT, 'README.md');
      if (!fs.existsSync(fp)) return { ok: false, detail: '文件不存在' };
      const c = fs.readFileSync(fp, 'utf8');
      return matchAll(c, [
        ['系统能力',    /系统能力|能力概览/],
        ['项目结构',    /项目结构|目录结构/],
        ['快速开始',    /快速开始|Quick.?Start/i],
        ['/rui init',   /\/rui\s+init/],
      ]);
    },
  },
  {
    id: '.claude/agents/',
    description: '7 个 Agent 文件 + frontmatter 合法',
    validate() {
      const missing = [];
      for (const f of AGENT_FILES) {
        const fp = path.join(CLAUDE_DIR, 'agents', f);
        if (!fs.existsSync(fp)) { missing.push(f); continue; }
        const c = fs.readFileSync(fp, 'utf8');
        if (f === 'AGENT.md') {
          if (c.trim().length < C.MIN_AGENT_CONTENT_LENGTH) missing.push(`${f}(内容过短)`);
        } else if (!c.startsWith('---') || !c.includes('name:')) {
          missing.push(`${f}(缺 frontmatter)`);
        }
      }
      return missing.length === 0
        ? { ok: true, detail: '7 个 Agent 文件合法' }
        : { ok: false, detail: `缺失/无效: ${missing.join(', ')}`, missing };
    },
  },
  {
    id: '.claude/rules/',
    description: '6 个规则文件齐备',
    validate() {
      const missing = RULE_FILES.filter(f => !fs.existsSync(path.join(CLAUDE_DIR, 'rules', f)));
      return missing.length === 0
        ? { ok: true, detail: '6 个规则文件齐备' }
        : { ok: false, detail: `缺失: ${missing.join(', ')}`, missing };
    },
  },
  {
    id: '.claude/ 配置层',
    description: 'project-profile + formulas + coder + settings + .mcp.json + settings.local',
    validate() {
      const items = [
        ['project-profile.json', validJsonWith('project', 'type', 'coder_formula')],
        ['formulas.md',          containsAll('F.story.01', 'F.story.08', 'F.supp.', 'F.meta')],
        ['coder.md',             nonEmptyMd()],
        ['.mcp.json',            validJsonWith('mcpServers')],
        ['settings.json',        validJsonWith('permissions')],
        ['settings.local.json',  validJsonWith('permissions')],
      ];
      const fails = [];
      for (const [name, check] of items) {
        const fp = path.join(CLAUDE_DIR, name);
        if (!fs.existsSync(fp)) { fails.push(`${name}(缺失)`); continue; }
        const r = check(fs.readFileSync(fp, 'utf8'));
        if (!r.ok) fails.push(`${name}(${r.detail})`);
      }
      return fails.length === 0
        ? { ok: true, detail: '配置层完整' }
        : { ok: false, detail: fails.join('; '), missing: fails };
    },
  },
];

function verify() {
  const checks = CHECKS.map(c => ({ id: c.id, description: c.description, ...c.validate() }));
  const passed = checks.filter(c => c.ok).length;
  return { ok: passed === checks.length, total: checks.length, passed, checks };
}

// ── 主流程 ─────────────────────────────────────────────────────

async function main() {
  const args   = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const force  = args.includes('--force');
  const json   = args.includes('--json');
  const help   = args.includes('--help') || args.includes('-h');

  if (help) { printHelp(); return; }

  // 1. detect
  const profile = detect();

  // 2. materialize
  const matResult = materialize(profile, { dryRun, force });

  // 3. verify（dry-run 也跑，但跑的是当前磁盘状态）
  const verifyResult = verify();

  // 4. record（dry-run 跳过）
  if (!dryRun) writeInitMemory(profile, verifyResult);

  // 输出
  if (json) {
    console.log(JSON.stringify({ profile, materialize: matResult, verify: verifyResult, dry_run: dryRun }, null, 2));
  } else {
    printReport(profile, matResult, verifyResult, { dryRun, force });
  }

  // 失败退出
  if (!dryRun && !verifyResult.ok) process.exit(1);
}

// ── 工具 ───────────────────────────────────────────────────────

function rel(p) { return path.relative(REPO_ROOT, p) || '.'; }
function ensureDir(d) { if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true }); }

function copyOne(src, dst, label, opts, result) {
  if (!fs.existsSync(src)) {
    result.skipped.push({ path: rel(dst), reason: `源缺失: ${label}` });
    return;
  }
  const dstExists = fs.existsSync(dst);
  if (opts.dryRun) {
    result.created.push({ path: rel(dst), action: dstExists && opts.force ? 'will-overwrite' : (dstExists ? 'will-skip' : 'will-copy'), source: label });
    return;
  }
  if (dstExists && !opts.force) {
    result.skipped.push({ path: rel(dst), reason: '已存在' });
    return;
  }
  ensureDir(path.dirname(dst));
  fs.copyFileSync(src, dst);
  result.created.push({ path: rel(dst), action: dstExists ? 'overwritten' : 'copied', source: label });
}

function copyDir(src, dst, files, opts, result) {
  if (!fs.existsSync(src)) {
    result.skipped.push({ path: rel(dst), reason: `源目录缺失: ${rel(src)}` });
    return;
  }
  for (const f of files) copyOne(path.join(src, f), path.join(dst, f), `${path.basename(src)}/${f}`, opts, result);
}

function writeJsonFile(fp, data, overwrite, opts, result, label) {
  const exists = fs.existsSync(fp);
  if (opts.dryRun) {
    result.created.push({ path: rel(fp), action: exists ? (overwrite || opts.force ? 'will-overwrite' : 'will-skip') : 'will-create', source: label });
    return;
  }
  if (exists && !overwrite && !opts.force) {
    result.skipped.push({ path: rel(fp), reason: '已存在' });
    return;
  }
  ensureDir(path.dirname(fp));
  fs.writeFileSync(fp, JSON.stringify(data, null, 2) + '\n', 'utf8');
  result.created.push({ path: rel(fp), action: exists ? 'overwritten' : 'created', source: label });
}

function writeInitMemory(profile, verifyResult) {
  const memFile = path.join(REPO_ROOT, 'docs', '故事任务面板', '.init-memory.json');
  ensureDir(path.dirname(memFile));
  fs.writeFileSync(memFile, JSON.stringify({
    timestamp: new Date().toISOString(),
    project:   profile.project,
    type:      profile.type,
    verify:    { ok: verifyResult.ok, passed: verifyResult.passed, total: verifyResult.total },
  }, null, 2) + '\n', 'utf8');
}

// 内容校验小工具
function matchAll(content, patterns) {
  const missing = [];
  for (const [label, pat] of patterns) if (!pat.test(content)) missing.push(label);
  return missing.length === 0
    ? { ok: true, detail: '关键节点全部命中' }
    : { ok: false, detail: `缺失: ${missing.join(', ')}`, missing };
}

function validJsonWith(...required) {
  return content => {
    try {
      const obj = JSON.parse(content);
      const missing = required.filter(k => !(k in obj));
      return missing.length === 0
        ? { ok: true }
        : { ok: false, detail: `缺字段: ${missing.join(', ')}` };
    } catch (e) {
      return { ok: false, detail: `JSON 非法: ${e.message}` };
    }
  };
}

function containsAll(...keywords) {
  return content => {
    const missing = keywords.filter(k => !content.includes(k));
    return missing.length === 0
      ? { ok: true }
      : { ok: false, detail: `缺关键节点: ${missing.join(', ')}` };
  };
}

function nonEmptyMd() {
  return content => content.trim().length > 50
    ? { ok: true }
    : { ok: false, detail: '内容过短' };
}

// ── 输出 ───────────────────────────────────────────────────────

function printReport(profile, mat, ver, opts) {
  console.log(`\n# rui init ${opts.dryRun ? '(dry-run)' : ''}\n`);
  console.log(`项目: ${profile.project} · 类型: ${profile.type_label} · 公式: ${profile.coder_formula.text}`);
  if (profile.manifest.ecosystems.length) console.log(`生态: ${profile.manifest.ecosystems.join(', ')}`);
  if (profile.tech_signals.length) console.log(`信号: ${profile.tech_signals.slice(0, 5).join(' · ')}${profile.tech_signals.length > 5 ? ' ...' : ''}`);
  console.log('');

  const counts = { created: 0, copied: 0, overwritten: 0, skipped: 0, willPrefix: 0 };
  for (const item of mat.created) {
    if (item.action === 'created' || item.action === 'will-create') counts.created++;
    else if (item.action === 'copied' || item.action === 'will-copy') counts.copied++;
    else if (item.action.includes('overwrit')) counts.overwritten++;
  }
  counts.skipped = mat.skipped.length;

  console.log(`## 物料 (${counts.created} 创建 · ${counts.copied} 复制 · ${counts.overwritten} 覆盖 · ${counts.skipped} 跳过)`);
  for (const item of mat.created) {
    console.log(`  ${actionGlyph(item.action)} ${item.path}${item.source ? `  ← ${item.source}` : ''}`);
  }
  if (mat.skipped.length && opts.dryRun === false) {
    console.log(`  跳过: ${mat.skipped.length} 项（已存在，--force 可覆盖）`);
  }
  console.log('');

  console.log(`## 就绪检查 (${ver.passed}/${ver.total})`);
  for (const c of ver.checks) {
    console.log(`  ${c.ok ? '✅' : '❌'} ${c.id} — ${c.detail}`);
  }
  console.log('');

  if (ver.ok) {
    console.log('✓ 基线就绪。下一步:');
    console.log('  /rui doc <需求>          # 拆故事 + 文档管线');
    console.log('  /rui                     # 任务推荐\n');
  } else if (!opts.dryRun) {
    console.log('✗ 就绪检查未通过，修复后重跑 `/rui init`。\n');
  }
}

function actionGlyph(action) {
  if (action.includes('will-')) return '◇';
  if (action.includes('overwrit')) return '↻';
  if (action === 'created' || action === 'copied') return '+';
  return ' ';
}

function printHelp() {
  console.log(`rui init — 建立项目基线

用法: node init.js [选项]

选项:
  --dry-run   只扫描和报告，不写文件
  --force     覆盖 .claude/ 下已有文件
  --json      机器可读输出（profile + materialize + verify）
  --help      显示本帮助

流程: detect（扫描）→ materialize（复制公共物料）→ verify（5 项就绪检查）

产物:
  .claude/agents/         7 个 Agent（整文件复制自插件 agents/）
  .claude/rules/          6 个规则（整文件复制自插件 rules/）
  .claude/formulas.md     故事文档公式
  .claude/coder.md        coder 工作手册
  .claude/project-profile.json   项目画像（agent 启动时自读）
  .claude/.mcp.json       MCP 配置
  .claude/settings.json   项目权限
  .claude/settings.local.json   本地覆盖（首次空模板）
  .claude/.gitignore      排除本地文件
  docs/故事任务面板/      故事产出根目录
`);
}

// ── 入口 ───────────────────────────────────────────────────────

if (require.main === module) {
  main().catch(err => {
    console.error('rui init 失败:', err.message);
    if (process.env.DEBUG) console.error(err.stack);
    process.exit(2);
  });
}

module.exports = { detect, materialize, verify };
