#!/usr/bin/env node

// rui init — 建立项目基线
//
// 三段式（口诀：探—生—验）
//   1. detect()    扫描项目 → profile（事实层）
//   2. generate()  按 profile 生成产物（生成层）
//   3. verify()    就绪检查（验证层）
//
// 设计哲学（CLAUDE.md）
//   - 信模型：产物由 profile 驱动，不硬编码假设
//   - 惜注意：模板外置（init-templates.js），本文件只有流程
//   - 验现实：verify() 失败即 exit 1
//
// 用法: node init.js [--dry-run] [--force] [--json] [--help]

'use strict';

const fs   = require('fs');
const path = require('path');
const C    = require('./constants.js');
const T    = require('./init-templates.js');

const REPO_ROOT  = process.cwd();
const CLAUDE_DIR = path.join(REPO_ROOT, '.claude');

const AGENT_FILES = ['AGENT.md', 'pm.md', 'coder.md', 'tester.md', 'reporter.md', 'security.md', 'self-improve.md'];
const RULE_FILES  = ['code-pipeline.md', 'delivery-gate.md', 'doc-generation.md', 'rui-claude.md', 'self-improve.md'];

// ═══════════════════════════════════════════════════════════════
// 1. DETECT — 扫描项目，产出 profile
// ═══════════════════════════════════════════════════════════════

function detect() {
  const project  = path.basename(REPO_ROOT);
  const typeInfo = C.detectProjectType(REPO_ROOT);
  const manifest = extractManifest(REPO_ROOT);
  const security = detectSecuritySurface(REPO_ROOT);
  const testFw   = detectTestFramework(REPO_ROOT, manifest);
  const ciConfig = detectCIConfig(REPO_ROOT);
  const arch     = detectArchitecture(REPO_ROOT, manifest);

  return {
    project,
    type:             typeInfo.type,
    type_label:       C.labelForType(typeInfo.type),
    tech_signals:     typeInfo.indicators,
    coder_formula:    C.getCoderFormula(typeInfo.type),
    story_defaults:   storyDefaultsFor(typeInfo.type),
    manifest: {
      ecosystems:     manifest.ecosystems,
      tech_stack:     manifest.techStack,
      dependencies:   manifest.dependencies,
      build_commands: manifest.buildCommands,
      test_commands:  manifest.testCommands,
    },
    security_surface: security,
    test_framework:   testFw,
    ci_config:        ciConfig,
    architecture:     arch,
    generated_at:     new Date().toISOString(),
  };
}

function storyDefaultsFor(type) {
  const map = {
    frontend:  { skeleton: 'frontend-only',  required_files: ['01', '03', '04', '06', '07', '08'], skip_files: ['02', '05'] },
    backend:   { skeleton: 'backend-only',   required_files: ['01', '02', '04', '05', '07', '08'], skip_files: ['03', '06'] },
    fullstack: { skeleton: 'fullstack',      required_files: ['01', '02', '03', '04', '05', '06', '07', '08'], skip_files: [] },
    meta:      { skeleton: 'fullstack',      required_files: ['01', '02', '03', '04', '05', '06', '07', '08'], skip_files: [] },
  };
  return map[type] || map.meta;
}

// ── 探测器 ─────────────────────────────────────────────────────

function detectSecuritySurface(root) {
  const surface = { user_input: false, api_exposure: false, data_storage: false, auth: false, third_party: false, signals: [] };
  const srcFiles = C.sh(
    `find . -type f \\( -name "*.js" -o -name "*.ts" -o -name "*.vue" -o -name "*.jsx" -o -name "*.tsx" -o -name "*.py" -o -name "*.go" -o -name "*.java" \\) -not -path "*/node_modules/*" -not -path "*/.git/*" -not -path "*/dist/*" | head -50`,
    '', root
  ).split('\n').filter(Boolean);

  const patterns = [
    ['user_input', /\b(form|input|textarea|upload|FileReader|FormData|req\.body|request\.form)\b/i, '用户输入'],
    ['api_exposure', /\b(router\.|app\.(get|post|put|delete)|@app\.route|@Controller|@RestController|express\(\))\b/, 'API暴露'],
    ['data_storage', /\b(localStorage|sessionStorage|IndexedDB|mongoose|sequelize|prisma|typeorm|sqlite|redis|CREATE TABLE)\b/i, '数据存储'],
    ['auth', /\b(auth|token|jwt|session|cookie|passport|bcrypt|oauth|credential|login)\b/i, '认证授权'],
    ['third_party', /\b(fetch|axios|http\.get|requests\.|urllib|net\/http)\b/i, '第三方调用'],
  ];

  for (const file of srcFiles) {
    try {
      const content = fs.readFileSync(path.join(root, file), 'utf8').slice(0, 3000);
      for (const [key, regex, label] of patterns) {
        if (!surface[key] && regex.test(content)) {
          surface[key] = true;
          surface.signals.push(label);
        }
      }
    } catch { /* skip */ }
  }
  return surface;
}

function detectTestFramework(root, manifest) {
  const result = { framework: null, config_file: null, runner_command: null };
  const allDeps = [...(manifest.dependencies?.dev || []), ...(manifest.dependencies?.production || [])];

  const frameworks = [
    { name: 'vitest', configs: ['vitest.config.ts', 'vitest.config.js'], cmd: 'npx vitest --run' },
    { name: 'jest', configs: ['jest.config.js', 'jest.config.ts'], cmd: 'npx jest' },
    { name: 'mocha', configs: ['.mocharc.yml', '.mocharc.js'], cmd: 'npx mocha' },
  ];
  for (const fw of frameworks) {
    if (allDeps.includes(fw.name)) {
      result.framework = fw.name;
      result.runner_command = fw.cmd;
      for (const cfg of fw.configs) {
        if (fs.existsSync(path.join(root, cfg))) { result.config_file = cfg; break; }
      }
      return result;
    }
  }

  // Python / Go / Rust
  if (fs.existsSync(path.join(root, 'pytest.ini')) || (fs.existsSync(path.join(root, 'pyproject.toml')) && tryRead(path.join(root, 'pyproject.toml')).includes('[tool.pytest'))) {
    return { framework: 'pytest', runner_command: 'pytest', config_file: fs.existsSync(path.join(root, 'pytest.ini')) ? 'pytest.ini' : 'pyproject.toml' };
  }
  if (fs.existsSync(path.join(root, 'go.mod'))) return { framework: 'go-test', runner_command: 'go test ./...', config_file: null };
  if (fs.existsSync(path.join(root, 'Cargo.toml'))) return { framework: 'cargo-test', runner_command: 'cargo test', config_file: null };

  return result;
}

function detectCIConfig(root) {
  const result = { provider: null, config_file: null, has_deploy: false };
  const checks = [
    { provider: 'github-actions', paths: ['.github/workflows'] },
    { provider: 'gitlab-ci', paths: ['.gitlab-ci.yml'] },
    { provider: 'jenkins', paths: ['Jenkinsfile'] },
  ];
  for (const check of checks) {
    for (const p of check.paths) {
      if (fs.existsSync(path.join(root, p))) {
        result.provider = check.provider;
        result.config_file = p;
        const content = fs.statSync(path.join(root, p)).isDirectory()
          ? C.sh(`cat ${path.join(root, p)}/* 2>/dev/null | head -200`, '', root)
          : tryRead(path.join(root, p));
        if (/deploy|release|publish/i.test(content)) result.has_deploy = true;
        return result;
      }
    }
  }
  return result;
}

function detectArchitecture(root, manifest) {
  const result = { pattern: 'single', signals: [] };
  if (fs.existsSync(path.join(root, 'lerna.json')) || fs.existsSync(path.join(root, 'pnpm-workspace.yaml')) || fs.existsSync(path.join(root, 'nx.json'))) {
    result.pattern = 'monorepo'; result.signals.push('workspace 配置文件');
  }
  try {
    const pkg = JSON.parse(tryRead(path.join(root, 'package.json')) || '{}');
    if (pkg.workspaces) { result.pattern = 'monorepo'; result.signals.push('package.json workspaces'); }
  } catch {}
  if (fs.existsSync(path.join(root, '.claude-plugin/plugin.json'))) {
    result.pattern = 'plugin'; result.signals.push('插件清单文件');
  }
  const dc = tryRead(path.join(root, 'docker-compose.yml')) || tryRead(path.join(root, 'docker-compose.yaml'));
  if (dc && (dc.match(/^\s+\w+:$/gm) || []).length > 2) {
    result.pattern = 'microservice'; result.signals.push('docker-compose 多服务');
  }
  return result;
}

function extractManifest(root) {
  const out = { dependencies: { production: [], dev: [] }, buildCommands: [], testCommands: [], techStack: [], ecosystems: [] };
  const exists = rel => fs.existsSync(path.join(root, rel));
  const read = rel => tryRead(path.join(root, rel));
  const add = (arr, v) => { if (v && !arr.includes(v)) arr.push(v); };

  if (exists('package.json')) {
    try {
      const pkg = JSON.parse(read('package.json'));
      out.dependencies.production.push(...Object.keys(pkg.dependencies || {}));
      out.dependencies.dev.push(...Object.keys(pkg.devDependencies || {}));
      if (pkg.scripts?.build) add(out.buildCommands, 'npm run build');
      if (pkg.scripts?.test) add(out.testCommands, 'npm test');
      const all = { ...pkg.dependencies, ...pkg.devDependencies };
      for (const fw of ['react','vue','angular','svelte','next','nuxt','express','koa','fastify','nestjs']) {
        if (all[fw]) add(out.techStack, `${fw}@${all[fw]}`);
      }
      out.ecosystems.push('node');
    } catch {}
  }
  if (exists('pyproject.toml') || exists('requirements.txt')) out.ecosystems.push('python');
  if (exists('Cargo.toml')) { add(out.buildCommands, 'cargo build'); add(out.testCommands, 'cargo test'); out.ecosystems.push('rust'); }
  if (exists('go.mod')) { add(out.buildCommands, 'go build ./...'); add(out.testCommands, 'go test ./...'); out.ecosystems.push('go'); }
  if (exists('pom.xml') || exists('build.gradle') || exists('build.gradle.kts')) out.ecosystems.push('java');
  if (exists('.claude-plugin/plugin.json')) out.ecosystems.push('meta');

  return out;
}

// ── 源码发现（核心文档用）──────────────────────────────────────

function discoverFrontendComponents(root) {
  const components = [];
  for (const dir of ['src/components', 'components', 'src/ui', 'packages']) {
    const fullDir = path.join(root, dir);
    if (!fs.existsSync(fullDir)) continue;
    try {
      for (const entry of fs.readdirSync(fullDir, { withFileTypes: true })) {
        if (!entry.isDirectory() || entry.name.startsWith('.') || entry.name === 'node_modules') continue;
        const subFiles = C.sh(`find "${path.join(fullDir, entry.name)}" -maxdepth 2 -type f \\( -name "*.vue" -o -name "*.jsx" -o -name "*.tsx" \\) | head -5`, '', root);
        if (subFiles) {
          components.push({ name: toKebabCase(entry.name), path: `${dir}/${entry.name}`, fileCount: subFiles.split('\n').filter(Boolean).length, files: subFiles.split('\n').filter(Boolean).map(f => path.relative(root, f)) });
        }
      }
    } catch {}
  }
  return components.slice(0, 10);
}

function discoverBackendAPIs(root) {
  const apis = [];
  const routeFiles = C.sh(
    `find . -type f \\( -name "*router*" -o -name "*route*" -o -name "*controller*" -o -name "*api*" \\) \\( -name "*.js" -o -name "*.ts" -o -name "*.py" -o -name "*.go" \\) -not -path "*/node_modules/*" -not -path "*/.git/*" -not -path "*/dist/*" -not -path "*/skills/*" | head -20`,
    '', root
  );
  if (!routeFiles) return apis;
  const seen = new Set();
  for (const file of routeFiles.split('\n').filter(Boolean)) {
    try {
      const content = fs.readFileSync(path.join(root, file), 'utf8').slice(0, 3000);
      for (const m of content.matchAll(/(?:router\.|app\.(?:get|post|put|delete|patch)|@(?:app\.route|RequestMapping))\s*\(\s*['"`]([^'"`]+)['"`]/g)) {
        const routePath = m[1].split('/').filter(Boolean)[0];
        if (routePath && !seen.has(routePath)) {
          seen.add(routePath);
          apis.push({ name: toKebabCase(routePath), path: file.replace(/^\.\//, ''), basePath: `/${routePath}` });
        }
      }
    } catch {}
  }
  return apis.slice(0, 10);
}

function discoverMetaModules(root) {
  const modules = [];
  const skillsDir = path.join(root, 'skills');
  if (fs.existsSync(skillsDir)) {
    try {
      for (const entry of fs.readdirSync(skillsDir, { withFileTypes: true })) {
        if (entry.isDirectory() && !entry.name.startsWith('.')) {
          modules.push({ name: entry.name, path: `skills/${entry.name}`, type: 'skill', description: `Skill: ${entry.name}` });
        }
      }
    } catch {}
  }
  if (fs.existsSync(path.join(root, 'agents'))) modules.push({ name: 'agents', path: 'agents', type: 'agent-system', description: 'Agent 角色系统' });
  if (fs.existsSync(path.join(root, 'rules'))) modules.push({ name: 'rules', path: 'rules', type: 'rule-system', description: '规则系统' });
  return modules;
}

function discoverMetaAPIs(root) {
  const apis = [];
  for (const dir of ['skills/rui/scripts', 'skills/rui-claude/scripts']) {
    const fullDir = path.join(root, dir);
    if (!fs.existsSync(fullDir)) continue;
    try {
      for (const entry of fs.readdirSync(fullDir)) {
        if (entry.endsWith('.js')) apis.push({ name: toKebabCase(entry.replace(/\.js$/, '')), path: `${dir}/${entry}`, basePath: `/${toKebabCase(entry.replace(/\.js$/, ''))}` });
      }
    } catch {}
  }
  return apis;
}

function toKebabCase(str) {
  return str.replace(/([a-z])([A-Z])/g, '$1-$2').replace(/[_\s]+/g, '-').replace(/[^a-zA-Z0-9\-]/g, '').toLowerCase().replace(/^-+|-+$/g, '');
}

// ═══════════════════════════════════════════════════════════════
// 2. GENERATE — 按 profile 生成产物
// ═══════════════════════════════════════════════════════════════

function resolveDocDirsForType(type) {
  const dirs = ['故事任务面板'];
  if (type === 'frontend' || type === 'fullstack') dirs.push('组件文档', '页面文档');
  if (type === 'backend' || type === 'fullstack' || type === 'meta') dirs.push('接口文档', '领域模型');
  return dirs;
}

function generate(profile, opts) {
  const { dryRun = false } = opts;
  const result = { created: [], skipped: [], dirs: [] };
  const p = profile;

  // 目录结构
  const docDirs = resolveDocDirsForType(p.type);
  const coreDirs = [CLAUDE_DIR, path.join(CLAUDE_DIR, 'agents'), path.join(CLAUDE_DIR, 'rules'), path.join(CLAUDE_DIR, '.history'), ...docDirs.map(d => path.join(REPO_ROOT, 'docs', d))];
  for (const d of coreDirs) {
    if (dryRun) result.dirs.push({ path: rel(d), action: 'will-create' });
    else { ensureDir(d); result.dirs.push({ path: rel(d), action: 'ensured' }); }
  }

  // 产物生成（模板来自 init-templates.js）
  write(path.join(REPO_ROOT, 'CLAUDE.md'), T.claudeMd(p), opts, result, 'CLAUDE.md');
  write(path.join(REPO_ROOT, 'README.md'), T.readmeMd(p, { agentCount: AGENT_FILES.length - 1 }), opts, result, 'README.md');

  for (const [f, content] of Object.entries(T.agents(p))) write(path.join(CLAUDE_DIR, 'agents', f), content, opts, result, `agents/${f}`);
  for (const [f, content] of Object.entries(T.rules(p))) write(path.join(CLAUDE_DIR, 'rules', f), content, opts, result, `rules/${f}`);

  write(path.join(CLAUDE_DIR, 'formulas.md'), T.formulas(p), opts, result, 'formulas.md');
  write(path.join(CLAUDE_DIR, 'coder.md'), T.coderHandbook(p), opts, result, 'coder.md');
  write(path.join(CLAUDE_DIR, '.mcp.json'), T.mcpConfig(), opts, result, '.mcp.json');
  write(path.join(CLAUDE_DIR, 'settings.json'), T.settings(p), opts, result, 'settings.json');

  // 首次文件（已存在不覆盖）
  const localSettings = path.join(CLAUDE_DIR, 'settings.local.json');
  if (!fs.existsSync(localSettings)) write(localSettings, JSON.stringify({ _doc: '本地覆盖配置', permissions: {} }, null, 2) + '\n', opts, result, '本地覆盖模板');
  const gitignore = path.join(CLAUDE_DIR, '.gitignore');
  if (!fs.existsSync(gitignore)) write(gitignore, 'settings.local.json\n.history/\n', opts, result, '.gitignore');

  // 核心文档
  const coreDocDir = path.join(REPO_ROOT, 'docs', p.project);
  if (dryRun) result.dirs.push({ path: `docs/${p.project}/`, action: 'will-create' });
  else { ensureDir(coreDocDir); result.dirs.push({ path: `docs/${p.project}/`, action: 'ensured' }); }

  writeIfNew(path.join(coreDocDir, '架构故事.md'), T.architectureStory(p), opts, result, '架构故事');

  if (p.type === 'backend' || p.type === 'fullstack' || p.type === 'meta') {
    const apis = p.type === 'meta' ? discoverMetaAPIs(REPO_ROOT) : discoverBackendAPIs(REPO_ROOT);
    if (apis.length > 0) writeIfNew(path.join(coreDocDir, '核心接口文档.md'), T.coreInterfaceDoc(apis, p), opts, result, '核心接口文档【推荐的】');
  }
  if (p.type === 'frontend' || p.type === 'fullstack') {
    const comps = discoverFrontendComponents(REPO_ROOT);
    if (comps.length > 0) writeIfNew(path.join(coreDocDir, '核心组件文档.md'), T.coreComponentDoc(comps, p), opts, result, '核心组件文档【推荐的】');
  }
  if (p.type === 'meta') {
    const mods = discoverMetaModules(REPO_ROOT);
    if (mods.length > 0) writeIfNew(path.join(coreDocDir, '核心组件文档.md'), T.coreModuleDoc(mods, p), opts, result, '核心组件文档【推荐的】');
  }

  return result;
}

// ═══════════════════════════════════════════════════════════════
// 3. VERIFY — 就绪检查
// ═══════════════════════════════════════════════════════════════

function verify(profile) {
  const checks = [
    { id: 'CLAUDE.md', validate: () => fileContains(path.join(REPO_ROOT, 'CLAUDE.md'), [/信模型/, /惜注意/, /验现实/, /rui:project-start/, new RegExp(profile.project)]) },
    { id: 'README.md', validate: () => fileContains(path.join(REPO_ROOT, 'README.md'), [/系统能力|快速开始/, new RegExp(profile.project)]) },
    { id: 'agents/', validate() {
      const missing = AGENT_FILES.filter(f => {
        const fp = path.join(CLAUDE_DIR, 'agents', f);
        if (!fs.existsSync(fp)) return true;
        const c = fs.readFileSync(fp, 'utf8');
        return f === 'AGENT.md' ? (c.length < C.MIN_AGENT_CONTENT_LENGTH || !c.includes(profile.project)) : (!c.startsWith('---'));
      });
      return missing.length === 0 ? { ok: true, detail: `${AGENT_FILES.length} agents 就绪` } : { ok: false, detail: `缺失: ${missing.join(', ')}` };
    }},
    { id: 'rules/', validate() {
      const missing = RULE_FILES.filter(f => !fs.existsSync(path.join(CLAUDE_DIR, 'rules', f)));
      return missing.length === 0 ? { ok: true, detail: `${RULE_FILES.length} rules 就绪` } : { ok: false, detail: `缺失: ${missing.join(', ')}` };
    }},
    { id: '配置层', validate() {
      const fails = [];
      if (!fs.existsSync(path.join(CLAUDE_DIR, 'formulas.md'))) fails.push('formulas.md');
      if (!fs.existsSync(path.join(CLAUDE_DIR, 'coder.md'))) fails.push('coder.md');
      if (!fs.existsSync(path.join(CLAUDE_DIR, 'settings.json'))) fails.push('settings.json');
      return fails.length === 0 ? { ok: true, detail: '配置层完整' } : { ok: false, detail: `缺失: ${fails.join(', ')}` };
    }},
    { id: '核心文档', validate() {
      const missing = [];
      const docDirs = resolveDocDirsForType(profile.type);
      for (const dir of docDirs) { if (!fs.existsSync(path.join(REPO_ROOT, 'docs', dir))) missing.push(dir); }
      if (!fs.existsSync(path.join(REPO_ROOT, 'docs', profile.project, '架构故事.md'))) missing.push('架构故事.md');
      return missing.length === 0 ? { ok: true, detail: '核心文档就绪' } : { ok: false, detail: `缺失: ${missing.join(', ')}` };
    }},
  ];

  const results = checks.map(c => ({ id: c.id, ...c.validate() }));
  const passed = results.filter(c => c.ok).length;
  return { ok: passed === results.length, total: results.length, passed, checks: results };
}

// ═══════════════════════════════════════════════════════════════
// MAIN
// ═══════════════════════════════════════════════════════════════

async function main() {
  const args   = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const force  = args.includes('--force');
  const json   = args.includes('--json');
  if (args.includes('--help') || args.includes('-h')) { printHelp(); return; }

  const profile     = detect();
  const genResult   = generate(profile, { dryRun, force });
  const verifyResult = verify(profile);

  if (!dryRun) writeInitMemory(profile, verifyResult);

  if (json) {
    console.log(JSON.stringify({ profile, generate: genResult, verify: verifyResult, dry_run: dryRun }, null, 2));
  } else {
    printReport(profile, genResult, verifyResult, { dryRun });
  }

  if (!dryRun && !verifyResult.ok) process.exit(1);
}

// ═══════════════════════════════════════════════════════════════
// UTILS
// ═══════════════════════════════════════════════════════════════

function rel(p) { return path.relative(REPO_ROOT, p) || '.'; }
function ensureDir(d) { if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true }); }
function tryRead(fp) { try { return fs.readFileSync(fp, 'utf8'); } catch { return ''; } }

function write(fp, content, opts, result, label) {
  const exists = fs.existsSync(fp);
  if (opts.dryRun) { result.created.push({ path: rel(fp), action: exists ? 'will-overwrite' : 'will-create', source: label }); return; }
  ensureDir(path.dirname(fp));
  fs.writeFileSync(fp, content, 'utf8');
  result.created.push({ path: rel(fp), action: exists ? 'overwritten' : 'created', source: label });
}

function writeIfNew(fp, content, opts, result, label) {
  if (!opts.dryRun && fs.existsSync(fp)) return;
  write(fp, content, opts, result, label);
}

function writeInitMemory(profile, verifyResult) {
  const memFile = path.join(REPO_ROOT, 'docs', '故事任务面板', '.init-memory.json');
  ensureDir(path.dirname(memFile));
  fs.writeFileSync(memFile, JSON.stringify({
    timestamp: new Date().toISOString(),
    project: profile.project, type: profile.type, type_label: profile.type_label,
    security_surface: profile.security_surface.signals,
    test_framework: profile.test_framework.framework,
    architecture: profile.architecture.pattern,
    verify: { ok: verifyResult.ok, passed: verifyResult.passed, total: verifyResult.total },
  }, null, 2) + '\n', 'utf8');
}

function fileContains(fp, patterns) {
  if (!fs.existsSync(fp)) return { ok: false, detail: '文件不存在' };
  const c = fs.readFileSync(fp, 'utf8');
  const missing = patterns.filter(p => !p.test(c));
  return missing.length === 0 ? { ok: true, detail: '✓' } : { ok: false, detail: `缺失关键内容` };
}

// ═══════════════════════════════════════════════════════════════
// OUTPUT
// ═══════════════════════════════════════════════════════════════

function printReport(profile, gen, ver, opts) {
  console.log(`\n# rui init ${opts.dryRun ? '(dry-run)' : ''}\n`);
  console.log(`项目: ${profile.project} · 类型: ${profile.type_label} · 架构: ${profile.architecture.pattern}`);
  console.log(`公式: ${profile.coder_formula.text}`);
  if (profile.manifest.ecosystems.length) console.log(`生态: ${profile.manifest.ecosystems.join(', ')}`);
  if (profile.security_surface.signals.length) console.log(`安全面: ${profile.security_surface.signals.join(' · ')}`);
  if (profile.test_framework.framework) console.log(`测试: ${profile.test_framework.framework}`);
  console.log('');

  const counts = { created: 0, overwritten: 0 };
  for (const item of gen.created) {
    if (item.action === 'created' || item.action === 'will-create') counts.created++;
    else counts.overwritten++;
  }
  console.log(`## 产物 (${counts.created} 创建 · ${counts.overwritten} 更新)`);
  for (const item of gen.created) {
    const g = item.action.includes('will-') ? '◇' : item.action.includes('overwrit') ? '↻' : '+';
    console.log(`  ${g} ${item.path}  ← ${item.source}`);
  }
  console.log('');

  const docDirs = gen.dirs.filter(d => d.path.startsWith('docs/'));
  if (docDirs.length > 0) {
    console.log(`## 文档目录 (${docDirs.length} 个)`);
    for (const d of docDirs) console.log(`  ${d.action === 'will-create' ? '◇' : '✓'} ${d.path}`);
    console.log('');
  }

  console.log(`## 就绪检查 (${ver.passed}/${ver.total})`);
  for (const c of ver.checks) console.log(`  ${c.ok ? '✅' : '❌'} ${c.id} — ${c.detail}`);
  console.log('');

  if (ver.ok) {
    console.log('✓ 基线就绪。下一步:');
    console.log('  /rui doc <需求>    # 拆故事');
    console.log('  /rui code <name>   # 实现');
    console.log('  /rui               # 推荐\n');
  } else if (!opts.dryRun) {
    console.log('✗ 就绪检查未通过，修复后重跑 `/rui init`。\n');
  }
}

function printHelp() {
  console.log(`rui init — 建立项目基线

用法: node init.js [--dry-run] [--force] [--json] [--help]

流程: detect → generate → verify

探测: 项目类型 · 安全面 · 测试框架 · CI · 架构模式
产物: CLAUDE.md · README.md · agents/ · rules/ · formulas · coder · 核心文档
验证: 所有产物存在且含项目上下文

可重复运行。
`);
}

// ═══════════════════════════════════════════════════════════════
// ENTRY
// ═══════════════════════════════════════════════════════════════

if (require.main === module) {
  main().catch(err => {
    console.error('rui init 失败:', err.message);
    if (process.env.DEBUG) console.error(err.stack);
    process.exit(2);
  });
}

module.exports = { detect, generate, verify };
