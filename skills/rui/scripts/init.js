#!/usr/bin/env node

// rui init — 建立项目基线
//
// 三段式：探—生—验
//   1. detect()    扫描项目 → profile（事实层）
//   2. generate()  按 profile 生成产物（生成层）
//   3. verify()    就绪检查（验证层）
//
// 设计哲学
//   - 信模型：产物由 profile 驱动，不硬编码假设
//   - 惜注意：模板外置（init-templates.js），本文件只有流程
//   - 验现实：verify() 失败即 exit 1
//
// 用法: node init.js [--json] [--help]

'use strict';

const fs   = require('fs');
const path = require('path');
const C    = require('./constants.js');
const T    = require('./init-templates.js');

const REPO_ROOT  = process.cwd();

// ═══════════════════════════════════════════════════════════════
// 1. DETECT — 扫描项目，产出 profile
// ═══════════════════════════════════════════════════════════════

function detect() {
  const project  = path.basename(REPO_ROOT);
  const typeInfo = C.detectProjectType(REPO_ROOT);
  const manifest = extractManifest(REPO_ROOT);
  const security = detectSecuritySurface(REPO_ROOT);
  const testFw   = detectTestFramework(REPO_ROOT, manifest);
  const arch = detectArchitecture(REPO_ROOT, manifest);

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

function detectArchitecture(root, manifest) {
  const result = { pattern: 'single', signals: [] };
  if (fs.existsSync(path.join(root, 'lerna.json')) || fs.existsSync(path.join(root, 'pnpm-workspace.yaml')) || fs.existsSync(path.join(root, 'nx.json'))) {
    result.pattern = 'monorepo'; result.signals.push('workspace 配置文件');
  }
  try {
    const pkg = JSON.parse(tryRead(path.join(root, 'package.json')) || '{}');
    if (pkg.workspaces) { result.pattern = 'monorepo'; result.signals.push('package.json workspaces'); }
  } catch {}

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

  return out;
}

// ═══════════════════════════════════════════════════════════════
// 2. GENERATE — 按 profile 生成产物
// ═══════════════════════════════════════════════════════════════

function generate(profile, opts = {}) {
  const result = { created: [], skipped: [], dirs: [] };
  const p = profile;
  const skipContent = opts.skipContent === true;

  // 目录结构
  const storyDir = path.join(REPO_ROOT, 'docs', '故事任务面板');
  const skeletonDir = path.join(storyDir, p.project, '.skeleton');
  ensureDir(storyDir);
  ensureDir(skeletonDir);
  result.dirs.push({ path: 'docs/故事任务面板', action: 'ensured' });
  result.dirs.push({ path: `docs/故事任务面板/${p.project}/.skeleton`, action: 'ensured' });

  // ── CLAUDE.md 生成/更新 ──
  if (skipContent) {
    result.skipped.push({ path: 'CLAUDE.md', reason: '默认由大模型生成（--template 启用 JS 模板）' });
    result.skipped.push({ path: 'README.md', reason: '默认由大模型生成（--template 启用 JS 模板）' });
    result.skipped.push({ path: `docs/故事任务面板/${p.project}/.skeleton/*.md`, reason: '默认由大模型生成（--template 启用 JS 模板）' });
  } else {
    const claudePath = path.join(REPO_ROOT, 'CLAUDE.md');
    if (fs.existsSync(claudePath)) {
      // 已有 CLAUDE.md → 只替换 project-start/end 段
      const existing = fs.readFileSync(claudePath, 'utf8');
      const startMarker = '<!-- rui:project-start -->';
      const endMarker = '<!-- rui:project-end -->';
      const startIdx = existing.indexOf(startMarker);
      const endIdx = existing.indexOf(endMarker);
      if (startIdx !== -1 && endIdx !== -1) {
        const newContent = existing.slice(0, startIdx) + T.claudeMdProjectSection(p) + existing.slice(endIdx + endMarker.length);
        write(claudePath, newContent, result, 'CLAUDE.md (项目约束段)');
      } else {
        // 无标记 → 在文件末尾追加
        const section = '\n' + T.claudeMdProjectSection(p) + '\n';
        write(claudePath, existing + section, result, 'CLAUDE.md (追加项目约束)');
      }
    } else {
      // 无 CLAUDE.md → 全量生成
      write(claudePath, T.claudeMdFull(p), result, 'CLAUDE.md (全量生成)');
    }

    // ── README.md ──
    write(path.join(REPO_ROOT, 'README.md'), T.readmeMd(p), result, 'README.md');

    // ── 故事目录骨架文档 ──
    const skeletonDocs = T.storySkeletonDocs(p);
    for (const doc of skeletonDocs) {
      const docPath = path.join(skeletonDir, doc.filename);
      write(docPath, doc.content, result, `骨架/${doc.filename}`);
    }
  }

  // ── .claude/ 目录结构 ──
  const pluginRoot = findPluginRoot();
  const claudeDir = path.join(REPO_ROOT, '.claude');

  // agents
  const agentsSrc = path.join(pluginRoot, 'agents');
  const agentsDst = path.join(claudeDir, 'agents');
  if (fs.existsSync(agentsSrc)) {
    copyDir(agentsSrc, agentsDst, result, 'agents');
  }

  // rules
  const rulesSrc = path.join(pluginRoot, 'rules');
  const rulesDst = path.join(claudeDir, 'rules');
  if (fs.existsSync(rulesSrc)) {
    copyDir(rulesSrc, rulesDst, result, 'rules');
  }

  // skills config — 优先使用项目已有配置，回退到插件配置
  const weworkConfigPath = path.join(claudeDir, 'skills', 'wework-bot', 'config.json');
  const pluginWeworkConfigPath = path.join(pluginRoot, 'skills', 'wework-bot', 'config.json');
  let weworkPluginCfg = null;
  if (fs.existsSync(pluginWeworkConfigPath)) {
    try { weworkPluginCfg = JSON.parse(fs.readFileSync(pluginWeworkConfigPath, 'utf8')); } catch {}
  }
  // 如果项目已有配置（非模板生成），保留；否则使用插件配置作为默认值
  if (fs.existsSync(weworkConfigPath) && !skipContent) {
    // 已有配置且本次会用模板生成 → 保留（不覆盖已配置的值）
  }
  write(weworkConfigPath, T.weworkBotConfig(p, weworkPluginCfg), result, 'skills/wework-bot/config.json');

  // skills/rui/ formulas & coder (referenced by agents/rules)
  const ruiSkillSrc = path.join(pluginRoot, 'skills', 'rui');
  const ruiSkillDst = path.join(claudeDir, 'skills', 'rui');
  for (const fname of ['formulas.md', 'coder.md']) {
    const src = path.join(ruiSkillSrc, fname);
    const dst = path.join(ruiSkillDst, fname);
    if (fs.existsSync(src)) {
      write(dst, fs.readFileSync(src, 'utf8'), result, `skills/rui/${fname}`);
    }
  }

  // settings.json → .claude/settings.json（迁移 hooks + permissions）
  const pluginSettingsPath = path.join(pluginRoot, 'settings.json');
  const claudeSettingsPath = path.join(claudeDir, 'settings.json');
  if (fs.existsSync(pluginSettingsPath)) {
    write(claudeSettingsPath, fs.readFileSync(pluginSettingsPath, 'utf8'), result, '.claude/settings.json');
  } else if (!fs.existsSync(claudeSettingsPath)) {
    const minimalSettings = JSON.stringify({
      permissions: {
        Read: { allow: true }, Edit: { allow: true }, Write: { allow: true },
        Grep: { allow: true }, Glob: { allow: true }, Bash: { allow: true },
        WebFetch: { allow: true }, WebSearch: { allow: true }, Skill: { allow: true },
        TaskCreate: { allow: true }, TaskUpdate: { allow: true }, TaskList: { allow: true },
        TaskGet: { allow: true }, Agent: { allow: true }, AskUserQuestion: { allow: true },
        NotebookEdit: { allow: true }
      },
      hooks: {
        Stop: [{
          hooks: [
            { type: 'command', command: 'node skills/wework-bot/scripts/hook-log.js', timeout: 15, statusMessage: '追加通知日志...' },
            { type: 'command', command: 'node skills/import-docs/scripts/hook-sync.js', timeout: 60, statusMessage: '同步文档到远端...' },
            { type: 'command', command: 'node skills/wework-bot/scripts/hook-notify.js', timeout: 30, statusMessage: '发送企微通知...' },
            { type: 'command', command: 'node skills/rui/scripts/delivery-gate.js check-all --json --recent-hours 1', timeout: 15, statusMessage: '检查交付管线状态...' }
          ]
        }]
      },
      _note: '由 rui init 生成。hooks.Stop 按序执行：通知日志 → 文档同步 → 企微通知 → 交付门检。'
    }, null, 2) + '\n';
    write(claudeSettingsPath, minimalSettings, result, '.claude/settings.json');
  }

  // memory & history dirs
  const memoryDir = path.join(claudeDir, 'memory');
  const historyDir = path.join(claudeDir, '.history');
  ensureDir(memoryDir);
  ensureDir(historyDir);
  result.dirs.push({ path: '.claude/memory', action: 'ensured' });
  result.dirs.push({ path: '.claude/.history', action: 'ensured' });

  return result;
}

// ═══════════════════════════════════════════════════════════════
// 3. VERIFY — 就绪检查
// ═══════════════════════════════════════════════════════════════

function verify(profile) {
  const checks = [
    { id: 'CLAUDE.md', validate: () => fileContains(path.join(REPO_ROOT, 'CLAUDE.md'), ['rui:project-start', profile.project]) },
    { id: 'README.md', validate: () => fileContains(path.join(REPO_ROOT, 'README.md'), [profile.project]) },
    { id: '故事面板目录', validate: () => ({ ok: fs.existsSync(path.join(REPO_ROOT, 'docs', '故事任务面板')), detail: fs.existsSync(path.join(REPO_ROOT, 'docs', '故事任务面板')) ? '✓' : '目录不存在' }) },
    { id: '骨架文档', validate: () => {
      const skDir = path.join(REPO_ROOT, 'docs', '故事任务面板', profile.project, '.skeleton');
      if (!fs.existsSync(skDir)) return { ok: false, detail: '骨架目录不存在' };
      const files = fs.readdirSync(skDir).filter(f => f.endsWith('.md'));
      const expected = profile.story_defaults.required_files.length + 1; // +1 for 00
      return files.length >= expected
        ? { ok: true, detail: `✓ ${files.length} 文件` }
        : { ok: false, detail: `${files.length}/${expected} 文件` };
    }},
    { id: '.claude/agents', validate: () => {
      const dir = path.join(REPO_ROOT, '.claude', 'agents');
      if (!fs.existsSync(dir)) return { ok: false, detail: '目录不存在' };
      const files = fs.readdirSync(dir).filter(f => f.endsWith('.md'));
      return files.length >= 4 ? { ok: true, detail: `✓ ${files.length} 个 agent` } : { ok: false, detail: `${files.length} 个 agent` };
    }},
    { id: '.claude/rules', validate: () => {
      const dir = path.join(REPO_ROOT, '.claude', 'rules');
      if (!fs.existsSync(dir)) return { ok: false, detail: '目录不存在' };
      const files = fs.readdirSync(dir).filter(f => f.endsWith('.md'));
      return files.length >= 3 ? { ok: true, detail: `✓ ${files.length} 个规则` } : { ok: false, detail: `${files.length} 个规则` };
    }},
    { id: '.claude/settings.json', validate: () => {
      const cfg = path.join(REPO_ROOT, '.claude', 'settings.json');
      if (!fs.existsSync(cfg)) return { ok: false, detail: '文件不存在，Stop hooks 未激活' };
      try {
        const parsed = JSON.parse(fs.readFileSync(cfg, 'utf8'));
        const hooks = parsed && parsed.hooks && parsed.hooks.Stop;
        if (!hooks || !Array.isArray(hooks) || hooks.length === 0) return { ok: false, detail: 'Stop hooks 未配置' };
        return { ok: true, detail: `✓ ${hooks.length} 组 Stop hooks` };
      } catch { return { ok: false, detail: 'JSON 解析失败' }; }
    }},
    { id: '.claude/skills', validate: () => {
      const cfg = path.join(REPO_ROOT, '.claude', 'skills', 'wework-bot', 'config.json');
      return fs.existsSync(cfg)
        ? { ok: true, detail: '✓ wework-bot 配置' }
        : { ok: false, detail: 'wework-bot/config.json 不存在' };
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
  const args        = process.argv.slice(2);
  const json        = args.includes('--json');
  const profileOnly = args.includes('--profile-only');
  const useTemplate = args.includes('--template');
  if (args.includes('--help') || args.includes('-h')) { printHelp(); return; }

  const profile = detect();

  // --profile-only: 仅探测，输出 profile JSON 后退出
  if (profileOnly) {
    console.log(JSON.stringify(profile, null, 2));
    return;
  }

  // 默认：skipContent=true，内容由大模型生成。--template 启用 JS 模板生成。
  const genResult   = generate(profile, { skipContent: !useTemplate });
  const verifyResult = verify(profile);

  writeInitMemory(profile, verifyResult);

  if (verifyResult.ok) {
    triggerImportDocs();
    triggerWeworkNotify(profile);
  }

  if (json) {
    console.log(JSON.stringify({ profile, generate: genResult, verify: verifyResult }, null, 2));
  } else {
    printReport(profile, genResult, verifyResult);
  }

  if (!verifyResult.ok) process.exit(1);
}

// ═══════════════════════════════════════════════════════════════
// 4. TRIGGERS — init 完成后触发 import-docs / wework-bot
// ═══════════════════════════════════════════════════════════════

function triggerImportDocs() {
  const { execSync } = require('child_process');
  const scriptPath = path.join(REPO_ROOT, 'skills', 'import-docs', 'scripts', 'import-docs.js');
  if (!fs.existsSync(scriptPath)) return;

  try {
    execSync(`node "${scriptPath}" --workspace`, {
      cwd: REPO_ROOT,
      stdio: 'pipe',
      encoding: 'utf8',
      timeout: 60000,
      env: { ...process.env },
    });
    console.log('  ✓ import-docs: 文档已同步到远端');
  } catch (err) {
    if (!process.env.API_X_TOKEN) {
      console.log('  ◇ import-docs: 跳过（API_X_TOKEN 未设置）');
    } else {
      console.log(`  ⚠ import-docs: 同步失败 — ${err.message.split('\n')[0]}`);
    }
  }
}

function triggerWeworkNotify(profile) {
  const { execSync } = require('child_process');
  const scriptPath = path.join(REPO_ROOT, 'skills', 'wework-bot', 'scripts', 'send-message.js');
  if (!fs.existsSync(scriptPath)) return;
  if (!process.env.API_X_TOKEN) {
    console.log('  ◇ wework-bot: 跳过（API_X_TOKEN 未设置）');
    return;
  }

  const message = [
    `🎯 结论: ${profile.project} 项目基线初始化完成`,
    `📝 描述: rui init 探测项目画像并生成基线文档`,
    `📌 范围: CLAUDE.md · README.md · docs/故事任务面板/`,
    `👉 下一步: /rui doc <需求> 拆故事`,
    `🌐 影响: 项目约束已写入 CLAUDE.md`,
    `📎 证据: docs/故事任务面板/.init-memory.json`,
  ].join('\n');

  const tmpFile = path.join(REPO_ROOT, '.init-notify-content.tmp');
  try {
    fs.writeFileSync(tmpFile, message, 'utf8');
    execSync(`node "${scriptPath}" --agent rui --project "${profile.project}" --content-file "${tmpFile}"`, {
      cwd: REPO_ROOT,
      stdio: 'pipe',
      timeout: 30000,
      env: { ...process.env },
    });
    console.log('  ✓ wework-bot: 初始化通知已发送');
  } catch (err) {
    console.log(`  ⚠ wework-bot: 通知失败 — ${err.message.split('\n')[0]}`);
  } finally {
    try { fs.unlinkSync(tmpFile); } catch { /* ignore */ }
  }
}

// ═══════════════════════════════════════════════════════════════
// UTILS
// ═══════════════════════════════════════════════════════════════

function rel(p) { return path.relative(REPO_ROOT, p) || '.'; }
function ensureDir(d) { if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true }); }
function tryRead(fp) { try { return fs.readFileSync(fp, 'utf8'); } catch { return ''; } }

function findPluginRoot() {
  let currentDir = __dirname;
  while (true) {
    if (fs.existsSync(path.join(currentDir, '.claude-plugin')) ||
        fs.existsSync(path.join(currentDir, 'plugin.json'))) {
      return currentDir;
    }
    const parentDir = path.dirname(currentDir);
    if (parentDir === currentDir) break;
    currentDir = parentDir;
  }
  return path.resolve(__dirname, '..', '..', '..');
}

function copyDir(src, dst, result, labelPrefix) {
  if (!fs.existsSync(src)) return;
  ensureDir(dst);
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const srcPath = path.join(src, entry.name);
    const dstPath = path.join(dst, entry.name);
    if (entry.isDirectory()) {
      copyDir(srcPath, dstPath, result, labelPrefix);
    } else {
      write(dstPath, fs.readFileSync(srcPath, 'utf8'), result, `${labelPrefix}/${entry.name}`);
    }
  }
}

function write(fp, content, result, label) {
  const exists = fs.existsSync(fp);
  ensureDir(path.dirname(fp));
  fs.writeFileSync(fp, content, 'utf8');
  result.created.push({ path: rel(fp), action: exists ? 'overwritten' : 'created', source: label });
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
  const missing = patterns.filter(p => {
    if (typeof p === 'string') return !c.includes(p);
    return !p.test(c);
  });
  return missing.length === 0 ? { ok: true, detail: '✓' } : { ok: false, detail: `缺失关键内容` };
}

// ═══════════════════════════════════════════════════════════════
// OUTPUT
// ═══════════════════════════════════════════════════════════════

function printReport(profile, gen, ver) {
  console.log(`\n# rui init\n`);
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

  const allDirs = gen.dirs;
  if (allDirs.length > 0) {
    console.log(`## 目录 (${allDirs.length} 个)`);
    for (const d of allDirs) console.log(`  ${d.action === 'will-create' ? '◇' : '✓'} ${d.path}`);
    console.log('');
  }

  if (gen.skipped.length > 0) {
    console.log(`## 跳过 (${gen.skipped.length} 项，由大模型生成)`);
    for (const s of gen.skipped) console.log(`  ◇ ${s.path} — ${s.reason}`);
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
  } else {
    console.log('✗ 就绪检查未通过，修复后重跑 `/rui init`。\n');
  }
}

function printHelp() {
  console.log(`rui init — 建立项目基线

用法: node init.js [--json] [--profile-only] [--template] [--help]

默认行为: 只做机械性搭建（目录 · agents/rules 复制 · skills 配置 · 验证 · 触发同步+通知）。
CLAUDE.md、README.md、骨架文档等所有内容均由大模型通过深度项目探索生成。

选项:
  --json          以 JSON 格式输出
  --profile-only  仅探测项目画像，输出 profile JSON 后退出（不生成任何文件）
  --template      启用 JS 模板生成内容（回退模式；默认关闭，内容由大模型生成）

流程: detect → [大模型探索+生成] → setup → verify → trigger
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
