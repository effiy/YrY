#!/usr/bin/env node

// rui init —— 建立项目基线（全产物项目耦合生成）
//
// 用法: node init.js [--dry-run] [--force] [--json] [--help]
//
// 三段式（口诀：探—生—验）
//   1. detect()    扫描项目 → 生成 profile 对象（事实层，内存中）
//   2. generate()  按项目情况生成/裁剪全部产物（生成层）
//   3. verify()    就绪检查（验证层）
//
// 设计哲学（详见 ../../../CLAUDE.md）
//   - 信模型：所有产物由 init 根据项目实际情况生成，高度耦合项目
//   - 惜注意：按项目类型裁剪，不生成无关内容
//   - 验现实：verify() 失败即 exit 1，要求重跑
//
// 可重复运行：每次运行根据最新项目情况更新和裁剪已有内容

'use strict';

const fs   = require('fs');
const fsp  = fs.promises;
const path = require('path');
const C    = require('./constants.js');

const REPO_ROOT  = process.cwd();
const CLAUDE_DIR = path.join(REPO_ROOT, '.claude');

// ── 产物清单 ────────────────────────────────────────────────────
const AGENT_FILES = ['AGENT.md', 'pm.md', 'coder.md', 'tester.md', 'reporter.md', 'security.md', 'self-improve.md'];
const RULE_FILES  = ['code-pipeline.md', 'delivery-gate.md', 'doc-generation.md', 'rui-claude.md', 'self-improve.md'];

// ── 1. detect ──────────────────────────────────────────────────
// 扫描项目，产出 profile。六类信号：
//   - 项目身份：name（目录名）
//   - 项目类型：frontend / backend / fullstack / meta / unknown
//   - 项目清单（manifest）：依赖 + 构建/测试命令 + 技术栈
//   - 安全面（security_surface）：用户输入/API/存储/认证
//   - 测试框架（test_framework）：具体框架名
//   - CI 配置（ci_config）：部署管线
//   - 架构信号（architecture）：monorepo/microservice/plugin

function detect() {
  const project   = path.basename(REPO_ROOT);
  const typeInfo  = C.detectProjectType(REPO_ROOT);
  const manifest  = extractManifest(REPO_ROOT);
  const security  = detectSecuritySurface(REPO_ROOT);
  const testFw    = detectTestFramework(REPO_ROOT, manifest);
  const ciConfig  = detectCIConfig(REPO_ROOT);
  const arch      = detectArchitecture(REPO_ROOT, manifest);

  return {
    project,
    type:            typeInfo.type,
    type_label:      C.labelForType(typeInfo.type),
    tech_signals:    typeInfo.indicators,
    coder_formula:   C.getCoderFormula(typeInfo.type),
    story_defaults:  storyDefaultsFor(typeInfo.type),
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


// ── 安全面探测 ─────────────────────────────────────────────────
function detectSecuritySurface(root) {
  const surface = { user_input: false, api_exposure: false, data_storage: false, auth: false, third_party: false, signals: [] };
  const srcFiles = C.sh(
    `find . -type f \\( -name "*.js" -o -name "*.ts" -o -name "*.vue" -o -name "*.jsx" -o -name "*.tsx" -o -name "*.py" -o -name "*.go" -o -name "*.java" \\) -not -path "*/node_modules/*" -not -path "*/.git/*" -not -path "*/dist/*" | head -50`,
    '', root
  ).split('\n').filter(Boolean);

  for (const file of srcFiles) {
    try {
      const content = fs.readFileSync(path.join(root, file), 'utf8').slice(0, 3000);
      if (/\b(form|input|textarea|upload|FileReader|FormData|req\.body|request\.form)\b/i.test(content)) {
        surface.user_input = true;
        if (!surface.signals.includes('用户输入')) surface.signals.push('用户输入');
      }
      if (/\b(router\.|app\.(get|post|put|delete)|@app\.route|@Controller|@RestController|@RequestMapping|express\(\))\b/.test(content)) {
        surface.api_exposure = true;
        if (!surface.signals.includes('API暴露')) surface.signals.push('API暴露');
      }
      if (/\b(localStorage|sessionStorage|IndexedDB|mongoose|sequelize|prisma|typeorm|sqlite|redis|CREATE TABLE|INSERT INTO)\b/i.test(content)) {
        surface.data_storage = true;
        if (!surface.signals.includes('数据存储')) surface.signals.push('数据存储');
      }
      if (/\b(auth|token|jwt|session|cookie|passport|bcrypt|oauth|credential|login|signup)\b/i.test(content)) {
        surface.auth = true;
        if (!surface.signals.includes('认证授权')) surface.signals.push('认证授权');
      }
      if (/\b(fetch|axios|http\.get|requests\.|urllib|net\/http)\b/i.test(content)) {
        surface.third_party = true;
        if (!surface.signals.includes('第三方调用')) surface.signals.push('第三方调用');
      }
    } catch { /* skip */ }
  }
  return surface;
}

// ── 测试框架探测 ───────────────────────────────────────────────
function detectTestFramework(root, manifest) {
  const result = { framework: null, config_file: null, runner_command: null };
  const allDeps = [...(manifest.dependencies?.dev || []), ...(manifest.dependencies?.production || [])];

  // Node test frameworks
  const nodeFrameworks = [
    { name: 'vitest', config: ['vitest.config.ts', 'vitest.config.js', 'vitest.config.mts'] },
    { name: 'jest', config: ['jest.config.js', 'jest.config.ts', 'jest.config.mjs'] },
    { name: 'mocha', config: ['.mocharc.yml', '.mocharc.js', '.mocharc.json'] },
    { name: 'ava', config: [] },
    { name: 'tap', config: [] },
  ];
  for (const fw of nodeFrameworks) {
    if (allDeps.includes(fw.name)) {
      result.framework = fw.name;
      result.runner_command = fw.name === 'vitest' ? 'npx vitest --run' : fw.name === 'jest' ? 'npx jest' : `npx ${fw.name}`;
      for (const cfg of fw.config) {
        if (fs.existsSync(path.join(root, cfg))) { result.config_file = cfg; break; }
      }
      break;
    }
  }

  // Python
  if (!result.framework) {
    if (fs.existsSync(path.join(root, 'pytest.ini')) || fs.existsSync(path.join(root, 'pyproject.toml'))) {
      const pyproject = tryRead(path.join(root, 'pyproject.toml'));
      if (pyproject.includes('[tool.pytest') || fs.existsSync(path.join(root, 'pytest.ini'))) {
        result.framework = 'pytest';
        result.runner_command = 'pytest';
        result.config_file = fs.existsSync(path.join(root, 'pytest.ini')) ? 'pytest.ini' : 'pyproject.toml';
      }
    }
  }

  // Go
  if (!result.framework && fs.existsSync(path.join(root, 'go.mod'))) {
    result.framework = 'go-test';
    result.runner_command = 'go test ./...';
  }

  // Rust
  if (!result.framework && fs.existsSync(path.join(root, 'Cargo.toml'))) {
    result.framework = 'cargo-test';
    result.runner_command = 'cargo test';
  }

  return result;
}

// ── CI 配置探测 ────────────────────────────────────────────────
function detectCIConfig(root) {
  const result = { provider: null, config_file: null, has_deploy: false };
  const checks = [
    { provider: 'github-actions', paths: ['.github/workflows'] },
    { provider: 'gitlab-ci', paths: ['.gitlab-ci.yml'] },
    { provider: 'jenkins', paths: ['Jenkinsfile'] },
    { provider: 'circleci', paths: ['.circleci/config.yml'] },
    { provider: 'azure-pipelines', paths: ['azure-pipelines.yml'] },
  ];
  for (const check of checks) {
    for (const p of check.paths) {
      if (fs.existsSync(path.join(root, p))) {
        result.provider = check.provider;
        result.config_file = p;
        // Check for deploy keywords
        if (check.provider === 'github-actions') {
          const wfDir = path.join(root, p);
          try {
            const files = fs.readdirSync(wfDir);
            for (const f of files) {
              const content = tryRead(path.join(wfDir, f));
              if (/deploy|release|publish/i.test(content)) { result.has_deploy = true; break; }
            }
          } catch {}
        } else {
          const content = tryRead(path.join(root, p));
          if (/deploy|release|publish/i.test(content)) result.has_deploy = true;
        }
        break;
      }
    }
    if (result.provider) break;
  }
  return result;
}

// ── 架构信号探测 ───────────────────────────────────────────────
function detectArchitecture(root, manifest) {
  const result = { pattern: 'single', signals: [] };

  // Monorepo signals
  if (fs.existsSync(path.join(root, 'lerna.json')) ||
      fs.existsSync(path.join(root, 'pnpm-workspace.yaml')) ||
      fs.existsSync(path.join(root, 'nx.json'))) {
    result.pattern = 'monorepo';
    result.signals.push('workspace 配置文件');
  }
  try {
    const pkg = JSON.parse(tryRead(path.join(root, 'package.json')) || '{}');
    if (pkg.workspaces) { result.pattern = 'monorepo'; result.signals.push('package.json workspaces'); }
  } catch {}

  // Plugin/extension pattern
  if (fs.existsSync(path.join(root, '.claude-plugin/plugin.json')) ||
      fs.existsSync(path.join(root, 'manifest.json')) && tryRead(path.join(root, 'manifest.json')).includes('content_scripts')) {
    result.pattern = 'plugin';
    result.signals.push('插件清单文件');
  }

  // Microservice signals
  if (fs.existsSync(path.join(root, 'docker-compose.yml')) || fs.existsSync(path.join(root, 'docker-compose.yaml'))) {
    const dc = tryRead(path.join(root, 'docker-compose.yml')) || tryRead(path.join(root, 'docker-compose.yaml'));
    const serviceCount = (dc.match(/^\s+\w+:$/gm) || []).length;
    if (serviceCount > 2) { result.pattern = 'microservice'; result.signals.push(`docker-compose ${serviceCount} 服务`); }
  }

  return result;
}


// ── 项目清单提取（保留原有逻辑）─────────────────────────────────
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


// ── 按项目类型决定文档目录 ─────────────────────────────────────
function resolveDocDirsForType(type) {
  const dirs = ['故事任务面板'];  // 所有项目都有故事面板
  if (type === 'frontend' || type === 'fullstack') {
    dirs.push('组件文档', '页面文档');
  }
  if (type === 'backend' || type === 'fullstack' || type === 'meta') {
    dirs.push('接口文档', '领域模型');
  }
  return dirs;
}

// ── 扫描源码生成文档骨架 ───────────────────────────────────────
// 根据项目类型扫描源码，发现核心模块/组件/接口，生成初始文档目录和索引文件。
// 设计原则：只生成有实际源码支撑的文档（Level A 证据），不凭空创建。
function generateDocScaffolds(profile) {
  const p = profile;
  const scaffolds = [];
  const projectName = p.project;

  // 前端：扫描组件目录
  if (p.type === 'frontend' || p.type === 'fullstack') {
    const components = discoverFrontendComponents(REPO_ROOT);
    for (const comp of components) {
      scaffolds.push({
        docTypeDir: '组件文档',
        project: projectName,
        name: comp.name,
        docPath: `docs/组件文档/${projectName}/${comp.name}/`,
        indexContent: generateComponentIndex(comp, projectName),
      });
    }

    const pages = discoverFrontendPages(REPO_ROOT);
    for (const page of pages) {
      scaffolds.push({
        docTypeDir: '页面文档',
        project: projectName,
        name: page.name,
        docPath: `docs/页面文档/${projectName}/${page.name}/`,
        indexContent: generatePageIndex(page, projectName),
      });
    }
  }

  // 后端：扫描 API 路由和领域模块
  if (p.type === 'backend' || p.type === 'fullstack') {
    const apis = discoverBackendAPIs(REPO_ROOT);
    for (const api of apis) {
      scaffolds.push({
        docTypeDir: '接口文档',
        project: projectName,
        name: api.name,
        docPath: `docs/接口文档/${projectName}/${api.name}/`,
        indexContent: generateAPIIndex(api, projectName),
      });
    }

    const domains = discoverDomainModules(REPO_ROOT);
    for (const domain of domains) {
      scaffolds.push({
        docTypeDir: '领域模型',
        project: projectName,
        name: domain.name,
        docPath: `docs/领域模型/${projectName}/${domain.name}/`,
        indexContent: generateDomainIndex(domain, projectName),
      });
    }
  }

  // 元项目：扫描 skills/agents/rules 作为领域模块
  if (p.type === 'meta') {
    const metaModules = discoverMetaModules(REPO_ROOT);
    for (const mod of metaModules) {
      scaffolds.push({
        docTypeDir: mod.docType === 'api' ? '接口文档' : '领域模型',
        project: projectName,
        name: mod.name,
        docPath: `docs/${mod.docType === 'api' ? '接口文档' : '领域模型'}/${projectName}/${mod.name}/`,
        indexContent: mod.docType === 'api'
          ? generateAPIIndex(mod, projectName)
          : generateDomainIndex(mod, projectName),
      });
    }
  }

  return scaffolds;
}

// ── 前端组件发现 ───────────────────────────────────────────────
function discoverFrontendComponents(root) {
  const components = [];
  // 扫描 src/components 或 components 目录下的顶层组件目录
  const componentDirs = [
    'src/components', 'components', 'src/ui', 'packages',
  ];
  for (const dir of componentDirs) {
    const fullDir = path.join(root, dir);
    if (!fs.existsSync(fullDir)) continue;
    try {
      const entries = fs.readdirSync(fullDir, { withFileTypes: true });
      for (const entry of entries) {
        if (!entry.isDirectory() || entry.name.startsWith('.') || entry.name === 'node_modules') continue;
        // 检查目录下是否有组件文件
        const subFiles = C.sh(`find "${path.join(fullDir, entry.name)}" -maxdepth 2 -type f \\( -name "*.vue" -o -name "*.jsx" -o -name "*.tsx" \\) | head -5`, '', root);
        if (subFiles) {
          const fileCount = subFiles.split('\n').filter(Boolean).length;
          components.push({
            name: toKebabCase(entry.name),
            path: `${dir}/${entry.name}`,
            fileCount,
            files: subFiles.split('\n').filter(Boolean).map(f => path.relative(root, f)),
          });
        }
      }
    } catch { /* skip */ }
  }

  // 如果没有组件目录结构，扫描独立的 .vue/.tsx 文件作为顶层组件
  if (components.length === 0) {
    const topFiles = C.sh(
      `find . -maxdepth 3 -type f \\( -name "*.vue" -o -name "*.tsx" -o -name "*.jsx" \\) -not -path "*/node_modules/*" -not -path "*/.git/*" | head -20`,
      '', root
    );
    if (topFiles) {
      const dirMap = new Map();
      for (const f of topFiles.split('\n').filter(Boolean)) {
        const dir = path.dirname(f).replace(/^\.\//, '');
        if (!dirMap.has(dir)) dirMap.set(dir, []);
        dirMap.get(dir).push(f);
      }
      for (const [dir, files] of dirMap) {
        if (files.length >= 2) {  // 至少 2 个组件文件才值得建文档
          const name = toKebabCase(path.basename(dir));
          if (name && name !== '.' && name !== 'src') {
            components.push({ name, path: dir, fileCount: files.length, files });
          }
        }
      }
    }
  }

  return components.slice(0, 10);  // 限制数量，避免过多
}

// ── 前端页面发现 ───────────────────────────────────────────────
function discoverFrontendPages(root) {
  const pages = [];
  const pageDirs = ['src/pages', 'src/views', 'pages', 'views', 'src/routes'];
  for (const dir of pageDirs) {
    const fullDir = path.join(root, dir);
    if (!fs.existsSync(fullDir)) continue;
    try {
      const entries = fs.readdirSync(fullDir, { withFileTypes: true });
      for (const entry of entries) {
        if (!entry.isDirectory() || entry.name.startsWith('.') || entry.name.startsWith('_')) continue;
        pages.push({
          name: toKebabCase(entry.name),
          path: `${dir}/${entry.name}`,
          route: `/${toKebabCase(entry.name)}`,
        });
      }
    } catch { /* skip */ }
  }
  return pages.slice(0, 10);
}

// ── 后端 API 发现 ──────────────────────────────────────────────
function discoverBackendAPIs(root) {
  const apis = [];
  // 扫描路由/控制器文件
  const routeFiles = C.sh(
    `find . -type f \\( -name "*router*" -o -name "*route*" -o -name "*controller*" -o -name "*Controller*" -o -name "*api*" \\) \\( -name "*.js" -o -name "*.ts" -o -name "*.py" -o -name "*.go" -o -name "*.java" \\) -not -path "*/node_modules/*" -not -path "*/.git/*" -not -path "*/dist/*" -not -path "*/skills/*" | head -20`,
    '', root
  );
  if (!routeFiles) return apis;

  const seen = new Set();
  for (const file of routeFiles.split('\n').filter(Boolean)) {
    try {
      const content = fs.readFileSync(path.join(root, file), 'utf8').slice(0, 3000);
      // 提取路由前缀
      const routeMatches = content.matchAll(/(?:router\.|app\.(?:get|post|put|delete|patch)|@(?:app\.route|RequestMapping|GetMapping|PostMapping))\s*\(\s*['"`]([^'"`]+)['"`]/g);
      for (const m of routeMatches) {
        const routePath = m[1].split('/').filter(Boolean)[0];  // 取第一段作为资源名
        if (routePath && !seen.has(routePath)) {
          seen.add(routePath);
          apis.push({
            name: toKebabCase(routePath),
            path: file.replace(/^\.\//, ''),
            basePath: `/${routePath}`,
          });
        }
      }
    } catch { /* skip */ }
  }

  // 如果没有从路由文件发现，按目录结构推断
  if (apis.length === 0) {
    const apiDirs = ['src/api', 'api', 'src/routes', 'routes', 'src/controllers', 'controllers'];
    for (const dir of apiDirs) {
      const fullDir = path.join(root, dir);
      if (!fs.existsSync(fullDir)) continue;
      try {
        const entries = fs.readdirSync(fullDir, { withFileTypes: true });
        for (const entry of entries) {
          if (entry.name.startsWith('.') || entry.name === 'index.js' || entry.name === 'index.ts') continue;
          const name = toKebabCase(entry.name.replace(/\.(js|ts|py|go|java)$/, '').replace(/Controller$|Router$|Route$/i, ''));
          if (name && !seen.has(name)) {
            seen.add(name);
            apis.push({ name, path: `${dir}/${entry.name}`, basePath: `/${name}` });
          }
        }
      } catch { /* skip */ }
    }
  }

  return apis.slice(0, 10);
}

// ── 领域模块发现 ───────────────────────────────────────────────
function discoverDomainModules(root) {
  const domains = [];
  // 扫描 src/domain, src/models, src/services, src/modules 等
  const domainDirs = [
    'src/domain', 'src/models', 'src/services', 'src/modules',
    'domain', 'models', 'services', 'modules',
    'internal', 'pkg',
  ];
  for (const dir of domainDirs) {
    const fullDir = path.join(root, dir);
    if (!fs.existsSync(fullDir)) continue;
    try {
      const entries = fs.readdirSync(fullDir, { withFileTypes: true });
      for (const entry of entries) {
        if (!entry.isDirectory() || entry.name.startsWith('.')) continue;
        domains.push({
          name: toKebabCase(entry.name),
          path: `${dir}/${entry.name}`,
          type: dir.includes('model') ? 'entity' : (dir.includes('service') ? 'service' : 'aggregate'),
        });
      }
    } catch { /* skip */ }
  }
  return domains.slice(0, 10);
}

// ── 元项目模块发现 ─────────────────────────────────────────────
function discoverMetaModules(root) {
  const modules = [];
  // Skills → 领域模型
  const skillsDir = path.join(root, 'skills');
  if (fs.existsSync(skillsDir)) {
    try {
      const entries = fs.readdirSync(skillsDir, { withFileTypes: true });
      for (const entry of entries) {
        if (!entry.isDirectory() || entry.name.startsWith('.')) continue;
        modules.push({
          name: entry.name,
          path: `skills/${entry.name}`,
          docType: 'domain',
          type: 'skill',
          description: `Skill: ${entry.name}`,
        });
      }
    } catch { /* skip */ }
  }

  // scripts 目录中有对外接口的脚本 → 接口文档
  const scriptsDir = path.join(root, 'skills', 'rui', 'scripts');
  if (fs.existsSync(scriptsDir)) {
    // 将核心脚本组合为一个接口文档
    modules.push({
      name: 'rui-scripts',
      path: 'skills/rui/scripts',
      docType: 'api',
      basePath: '/rui',
      description: 'rui 核心脚本接口',
    });
  }

  return modules;
}

// ── 索引文件生成器 ─────────────────────────────────────────────

function generateComponentIndex(comp, projectName) {
  return `# ${comp.name}

> | v0.1.0 | ${new Date().toISOString().split('T')[0]} | rui init | 🌿 main |

## 身份卡片

| 字段 | 值 |
|------|-----|
| 组件名 | ${comp.name} |
| 文件路径 | \`${comp.path}\` |
| 一句话职责 | > 待补充 |
| 项目 | ${projectName} |
| 文件数 | ${comp.fileCount} |

## 阅读路径

| 角色 | 路径 | 预计时间 |
|------|------|---------|
| 调用方 | 索引 → 01 §2 接口契约 → 04 正常场景 | 5 min |
| 维护者 | 索引 → 01 → 02 → 03 | 15 min |
| 测试者 | 索引 → 04 全场景 → 01 §2 必填可选 | 8 min |

## 文件清单

| 文件 | 定位 | 状态 |
|------|------|------|
| 01-组件概述.md | API 参考手册（查阅型） | > 待生成 |
| 02-状态与依赖.md | 架构蓝图（理解型） | > 待生成 |
| 03-样式与交互.md | 视觉规范（审查型） | > 待生成 |
| 04-操作场景.md | 用户手册（验证型） | > 待生成 |

## 关联资源

- 源码: [\`${comp.path}\`](../../../${comp.path})
`;
}

function generatePageIndex(page, projectName) {
  return `# ${page.name}

> | v0.1.0 | ${new Date().toISOString().split('T')[0]} | rui init | 🌿 main |

## 身份卡片

| 字段 | 值 |
|------|-----|
| 页面名 | ${page.name} |
| 路由 | \`${page.route}\` |
| 一句话职责 | > 待补充 |
| 项目 | ${projectName} |
| 文件路径 | \`${page.path}\` |

## 阅读路径

| 角色 | 路径 | 预计时间 |
|------|------|---------|
| 前端开发 | 索引 → 01 §1 → 02 §1 组件树 → 02 §3 通信 | 10 min |
| 测试者 | 索引 → 04 全场景 | 8 min |
| 设计师 | 索引 → 03 交互流程 | 5 min |

## 文件清单

| 文件 | 定位 | 状态 |
|------|------|------|
| 01-页面概述.md | API 参考手册（查阅型） | > 待生成 |
| 02-组件编排.md | 架构蓝图（理解型） | > 待生成 |
| 03-交互流程.md | 视觉规范（审查型） | > 待生成 |
| 04-操作场景.md | 用户手册（验证型） | > 待生成 |

## 关联资源

- 源码: [\`${page.path}\`](../../../${page.path})
`;
}

function generateAPIIndex(api, projectName) {
  return `# ${api.name}

> | v0.1.0 | ${new Date().toISOString().split('T')[0]} | rui init | 🌿 main |

## 身份卡片

| 字段 | 值 |
|------|-----|
| 资源名 | ${api.name} |
| Base URL | \`${api.basePath || '/'}\` |
| 一句话职责 | > 待补充 |
| 项目 | ${projectName} |
| 源码路径 | \`${api.path}\` |

## 阅读路径

| 角色 | 路径 | 预计时间 |
|------|------|---------|
| 前端调用方 | 索引 → 01 §2 端点清单 → 04 调用场景 | 5 min |
| 后端维护者 | 索引 → 01 → 02 → 03 | 15 min |
| SRE | 索引 → 03 §6 错误码 → 04 §5 性能约束 | 5 min |

## 文件清单

| 文件 | 定位 | 状态 |
|------|------|------|
| 01-接口概述.md | API 参考手册（查阅型） | > 待生成 |
| 02-数据模型.md | 数据字典（理解型） | > 待生成 |
| 03-中间件与安全.md | 安全白皮书（审查型） | > 待生成 |
| 04-操作场景.md | 集成手册（验证型） | > 待生成 |

## 关联资源

- 源码: [\`${api.path}\`](../../../${api.path})
`;
}

function generateDomainIndex(domain, projectName) {
  return `# ${domain.name}

> | v0.1.0 | ${new Date().toISOString().split('T')[0]} | rui init | 🌿 main |

## 身份卡片

| 字段 | 值 |
|------|-----|
| 领域名 | ${domain.name} |
| 一句话职责 | > 待补充 |
| 项目 | ${projectName} |
| 源码路径 | \`${domain.path}\` |
| 模块类型 | ${domain.type || 'aggregate'} |

## 阅读路径

| 角色 | 路径 | 预计时间 |
|------|------|---------|
| 后端开发 | 索引 → 01 §2 限界上下文 → 03 §2 领域事件 | 10 min |
| 架构师 | 索引 → 01 → 02 → 03 | 20 min |
| 测试者 | 索引 → 04 全场景 | 8 min |

## 文件清单

| 文件 | 定位 | 状态 |
|------|------|------|
| 01-领域概述.md | 领域参考（查阅型） | > 待生成 |
| 02-实体模型.md | 数据字典（理解型） | > 待生成 |
| 03-领域服务.md | 服务白皮书（审查型） | > 待生成 |
| 04-操作场景.md | 操作手册（验证型） | > 待生成 |

## 关联资源

- 源码: [\`${domain.path}\`](../../../${domain.path})
`;
}

// ── 工具：kebab-case 转换 ──────────────────────────────────────
function toKebabCase(str) {
  return str
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/[_\s]+/g, '-')
    .replace(/[^a-zA-Z0-9\-]/g, '')
    .toLowerCase()
    .replace(/^-+|-+$/g, '');
}


// ── 2. generate ────────────────────────────────────────────────
// 按项目情况生成/裁剪全部产物。每次运行都根据最新 profile 重生。
// 产物：CLAUDE.md / README.md / agents/ / rules/ / skills 配置 / docs 核心目录

function generate(profile, opts) {
  const { dryRun = false } = opts;
  const result = { created: [], skipped: [], dirs: [] };

  // 按项目类型决定需要的文档目录
  const docDirs = resolveDocDirsForType(profile.type);

  // 创建目录结构
  const coreDirs = [
    CLAUDE_DIR,
    path.join(CLAUDE_DIR, 'agents'),
    path.join(CLAUDE_DIR, 'rules'),
    path.join(CLAUDE_DIR, '.history'),
    ...docDirs.map(d => path.join(REPO_ROOT, 'docs', d)),
  ];
  for (const d of coreDirs) {
    if (dryRun) result.dirs.push({ path: rel(d), action: 'will-create' });
    else { ensureDir(d); result.dirs.push({ path: rel(d), action: 'ensured' }); }
  }

  // 1. CLAUDE.md — 哲学骨架 + 项目约束章节
  writeFile(path.join(REPO_ROOT, 'CLAUDE.md'), generateClaudeMd(profile), opts, result, 'CLAUDE.md 基线');

  // 3. README.md — 系统视图（按项目情况生成）
  writeFile(path.join(REPO_ROOT, 'README.md'), generateReadme(profile), opts, result, 'README.md 系统视图');

  // 4. agents/ — 按项目类型裁剪
  const agents = generateAgents(profile);
  for (const [filename, content] of Object.entries(agents)) {
    writeFile(path.join(CLAUDE_DIR, 'agents', filename), content, opts, result, `agents/${filename}`);
  }

  // 5. rules/ — 按项目类型裁剪
  const rules = generateRules(profile);
  for (const [filename, content] of Object.entries(rules)) {
    writeFile(path.join(CLAUDE_DIR, 'rules', filename), content, opts, result, `rules/${filename}`);
  }

  // 6. skills 配置文件（formulas / coder 手册）
  writeFile(path.join(CLAUDE_DIR, 'formulas.md'), generateFormulas(profile), opts, result, 'formulas.md');
  writeFile(path.join(CLAUDE_DIR, 'coder.md'), generateCoderHandbook(profile), opts, result, 'coder.md');

  // 7. 配置文件
  writeFile(path.join(CLAUDE_DIR, '.mcp.json'), generateMcpConfig(profile), opts, result, '.mcp.json');
  writeFile(path.join(CLAUDE_DIR, 'settings.json'), generateSettings(profile), opts, result, 'settings.json');

  // 8. settings.local.json（首次空模板，已存在不覆盖）
  const localSettings = path.join(CLAUDE_DIR, 'settings.local.json');
  if (!fs.existsSync(localSettings)) {
    writeFile(localSettings, JSON.stringify({ _doc: '本地覆盖配置（不入库、不同步）。优先级高于 settings.json。', permissions: {} }, null, 2) + '\n', opts, result, '本地覆盖模板');
  }

  // 9. .gitignore
  const gitignore = path.join(CLAUDE_DIR, '.gitignore');
  if (!fs.existsSync(gitignore)) {
    writeFile(gitignore, 'settings.local.json\n.history/\n', opts, result, '.gitignore');
  }

  // 10. 核心文档目录骨架 — 按项目类型扫描源码，生成初始文档索引
  const docScaffolds = generateDocScaffolds(profile);
  for (const scaffold of docScaffolds) {
    const scaffoldDir = path.join(REPO_ROOT, scaffold.docPath);
    if (dryRun) {
      result.dirs.push({ path: scaffold.docPath, action: 'will-create' });
    } else {
      ensureDir(scaffoldDir);
      result.dirs.push({ path: scaffold.docPath, action: 'ensured' });
    }
    // 生成索引文件（已存在不覆盖，保护手动编辑）
    const indexFile = path.join(scaffoldDir, '00-索引.md');
    if (!fs.existsSync(indexFile)) {
      writeFile(indexFile, scaffold.indexContent, opts, result, `docs/${scaffold.docTypeDir}/${scaffold.project}/${scaffold.name}/00-索引`);
    }
  }

  return result;
}

// ── 生成器：CLAUDE.md ──────────────────────────────────────────
function generateClaudeMd(profile) {
  const p = profile;
  const securitySection = p.security_surface.signals.length > 0
    ? `| 安全面 | ${p.security_surface.signals.join(' · ')} | 源码扫描 |`
    : '| 安全面 | 无显著安全面 | 源码扫描 |';

  const testSection = p.test_framework.framework
    ? `| 测试 | ${p.test_framework.framework} · \`${p.test_framework.runner_command}\` | ${p.test_framework.config_file || '约定'} |`
    : '| 测试 | 未检测到测试框架 | — |';

  const ciSection = p.ci_config.provider
    ? `| CI/CD | ${p.ci_config.provider}${p.ci_config.has_deploy ? ' (含部署)' : ''} | ${p.ci_config.config_file} |`
    : '| CI/CD | 未配置 | — |';

  const buildCmds = p.manifest.build_commands.length > 0
    ? `| 构建 | \`${p.manifest.build_commands.join('` · `')}\` | 清单文件 |`
    : '| 构建 | 无构建命令 | — |';

  const techStack = p.manifest.tech_stack.length > 0
    ? `| 技术栈 | ${p.manifest.tech_stack.join(' · ')} | 清单文件 |`
    : `| 技术栈 | ${p.type_label}项目 | 类型推断 |`;

  return `# CLAUDE.md

> 三公理推导一切——基础信念是 why，工作原则是设计约束，执行准则是日常动作。读完此文件，应能说出每个动作背后的那条公理。

## 基础信念

> **口诀：信模型，惜注意，验现实。**

\`\`\`mermaid
flowchart LR
    A[信模型<br/>模型能判断] --> B[惜注意<br/>注意力稀缺]
    B --> C[验现实<br/>运行即证]
    C -.反馈修正.-> A
\`\`\`

**信模型 — 模型有能力判断。** 上下文中的模型能做出合理决策。检查清单不能替代思考。

**惜注意 — 上下文有限且退化。** 注意力是稀缺资源。不必要的信息挤掉必要的信息。退化三因：外部不可达、渐进漂移、人机偏差。

**验现实 — 现实是唯一裁判。** 没验证等于没做。"应该没问题"不可证伪。

> 公理冲突时优先级：**验现实 > 信模型 > 惜注意**。先确保事实，再相信判断，最后省注意力。

## 工作原则

> **口诀：守底线，留核心，退一步，验为实，说清楚，称轻重。**

每条原则都在缓解某条公理的张力。

| 原则 | 服务公理 | 一句话 | 反例（违反就改） |
|------|---------|--------|----------------|
| **涌现** 守底线 | 信模型 | 只定不可妥协的底线，其余交给上下文 | 把"风格偏好"写进硬规则 |
| **简化** 留核心 | 惜注意 | 删至必要——最可靠的模块是没有模块 | 增加抽象层却没第二个调用方 |
| **消失** 退一步 | 惜注意 | 流程复杂度 ≤ 任务复杂度 | 用户感觉"在走流程"而非"在解决问题" |
| **校准** 验为实 | 验现实 | 没运行过的结论不作数 | 凭代码"看起来对"就提交 |
| **释义** 说清楚 | 惜注意 | 人看不懂，正确也没意义 | 一段话三层从句解释一件事 |
| **对等** 称轻重 | 全部 | 投入与改动量、风险等级匹配 | 改注释和重写核心循环走同套流程 |

## 执行准则

> **口诀：思在前，码从简，改必准，测先行，毕则告，图为首，自定验。**

**思先于码。** 陈述假设，呈现权衡。不确定就停，问。

**最少代码。** 只解决这个问题。不请自来的功能、单次抽象、不可能场景的错误处理——不写。

**精确修改。** 只动必须动的。改动不留残余。每行改动可追溯到请求。

**目标驱动。** 先写失败测试再通过。"看起来没问题"等于没做。

**完成通知。** 做完或卡住都同步状态。沉默比失败更危险。

**表达优先：口诀 → 图 → 结构化文本 → 表。**

**生效标志由各 agent 自定义。**

## 退化对策

> **口诀：先可见，后规则。**

类型、合约、运行结果是可见的——它们自己就在说话。规则是最后手段，因为规则本身也消耗注意力。

<!-- rui:project-start -->
## 项目约束

> 以下由 \`rui init\` 根据项目画像自动生成。每次 \`rui init\` 运行时更新。

| 维度 | 约束 | 来源 |
|------|------|------|
| 项目 | ${p.project} · ${p.type_label} · ${p.architecture.pattern} | 目录扫描 |
${techStack}
${buildCmds}
${testSection}
${securitySection}
${ciSection}
| 生态 | ${p.manifest.ecosystems.join(' · ') || '未识别'} | 清单文件 |
| Coder 公式 | ${p.coder_formula.text} | 类型推断 |
| 故事骨架 | ${p.story_defaults.skeleton}（必选: ${p.story_defaults.required_files.join('/')}）| 类型推断 |

### 项目不可妥协底线

${generateProjectBottomLines(p)}
<!-- rui:project-end -->

## 自约束

- **更短优先。** 本文件应比它指导的任何文件更短。
- **预算上限。** 公理 3 / 原则 6 / 准则 7——这是上限，不是下限。
- **增长触发审视。** 如果它增长了，说明某条推导失效了，或某层在做下一层的事。
`;
}

function generateProjectBottomLines(p) {
  const lines = [];
  // 按安全面生成底线
  if (p.security_surface.auth) lines.push('- **认证不可绕过** — 涉及 auth/token/session，任何绕过路径为 P0');
  if (p.security_surface.user_input) lines.push('- **输入必须校验** — 用户输入点已识别，XSS/注入防护为 P0');
  if (p.security_surface.data_storage) lines.push('- **存储必须安全** — 数据持久化已识别，敏感数据加密/脱敏为 P0');
  if (p.security_surface.api_exposure) lines.push('- **API 必须鉴权** — 暴露接口已识别，未鉴权端点为 P0');
  // 按架构生成底线
  if (p.architecture.pattern === 'monorepo') lines.push('- **包边界不可穿透** — monorepo 各包独立，跨包直接引用内部模块为 P0');
  if (p.architecture.pattern === 'microservice') lines.push('- **服务边界不可穿透** — 微服务间只通过定义的通道通信');
  // 通用底线
  lines.push('- **密钥不落盘** — Token/密钥/凭据禁止出现在源码或配置文件');
  if (p.test_framework.framework) lines.push(`- **测试必须通过** — \`${p.test_framework.runner_command}\` 全绿方可提交`);

  return lines.length > 0 ? lines.join('\n') : '- 无特殊底线（通用安全规则适用）';
}


// ── 生成器：README.md ──────────────────────────────────────────
function generateReadme(profile) {
  const p = profile;
  const techList = p.manifest.tech_stack.length > 0 ? p.manifest.tech_stack.join(' · ') : p.type_label;
  const ecoList = p.manifest.ecosystems.join(' · ') || '未识别';

  // 按项目类型决定能力描述
  const capabilityDesc = {
    frontend: '前端组件驱动开发，组件树 → Props/Events → 状态流',
    backend: '后端领域驱动开发，模块 → 接口 → 数据流',
    fullstack: '全栈端到端开发，前后端契约对齐与数据流完整性',
    meta: '插件/配置系统开发，规则完整性与集成契约',
    unknown: '通用软件开发，模块划分与接口定义',
  }[p.type] || '通用软件开发';

  // 按项目类型决定故事骨架说明
  const skeletonDesc = p.story_defaults.skip_files.length > 0
    ? `${p.story_defaults.skeleton}（跳过: ${p.story_defaults.skip_files.map(f => f + '-*').join('/')}）`
    : p.story_defaults.skeleton;

  return `# ${p.project}

> 故事驱动的 SDLC 编排系统。${capabilityDesc}。

- **项目类型** — ${p.type_label}（${p.architecture.pattern}）
- **技术栈** — ${techList}
- **生态** — ${ecoList}
- **基础** — 三条公理推导全部行为准则，详见 [CLAUDE.md](./CLAUDE.md)

## 系统能力

\`\`\`mermaid
flowchart TB
    User([用户]):::user
    subgraph 入口层
      direction LR
      Cmd1["/rui"]:::cmd
      Cmd2["/rui-claude"]:::cmd
    end
    User --> Cmd1 & Cmd2

    Cmd1 --> R["rui<br/>故事 SDLC 编排"]:::core
    Cmd2 --> C["rui-claude<br/>.claude 配置管理"]:::core

    R --- Agents["${AGENT_FILES.length - 1} Agents · Gate A/B<br/>故事骨架: ${skeletonDesc}"]
    C --- Scope[".claude/ 范围内<br/>sync / retro / history"]

    classDef user fill:#fff3e0,stroke:#e65100;
    classDef cmd fill:#e3f2fd,stroke:#1976d2,color:#0d47a1;
    classDef core fill:#f3e5f5,stroke:#6a1b9a;
\`\`\`

| 能力 | 入口 | 一句话 |
|------|------|--------|
| **rui** | \`/rui [doc\\|code\\|update] <args>\` | 故事驱动的 SDLC 端到端编排 |
| **rui-claude** | \`/rui-claude [sync\\|retro\\|history]\` | \`.claude/\` 配置的生命周期管理 |

## 快速开始

\`\`\`bash
/rui init                    # 建立项目基线（生成全部产物）
/rui doc "需求描述"           # 拆需求为故事
/rui code <story-name>       # 实现故事
/rui                         # 任务推荐
\`\`\`

## 项目结构

| 目录/文件 | 职责 | 生成方式 |
|-----------|------|---------|
| \`CLAUDE.md\` | 哲学基础 + 项目约束 | rui init 生成 |
| \`README.md\` | 系统视图 | rui init 生成 |
| \`.claude/agents/\` | ${AGENT_FILES.length} 个角色（按 ${p.type_label} 裁剪） | rui init 生成 |
| \`.claude/rules/\` | ${RULE_FILES.length} 个规则（按 ${p.type_label} 裁剪） | rui init 生成 |
| \`.claude/formulas.md\` | 故事文档公式 | rui init 生成 |
| \`.claude/coder.md\` | coder 工作手册 | rui init 生成 |
| \`docs/故事任务面板/\` | 故事产出 | rui doc/code 生成 |

## 项目画像

| 维度 | 值 |
|------|-----|
| 类型 | ${p.type_label} |
| 架构 | ${p.architecture.pattern} |
| Coder 公式 | ${p.coder_formula.text} |
| 安全面 | ${p.security_surface.signals.join(' · ') || '无显著安全面'} |
| 测试 | ${p.test_framework.framework || '未配置'} |
| CI/CD | ${p.ci_config.provider || '未配置'} |
| 构建 | ${p.manifest.build_commands.join(' · ') || '无'} |
| 测试命令 | ${p.manifest.test_commands.join(' · ') || '无'} |

## 进一步

- **了解哲学** — [CLAUDE.md](./CLAUDE.md)
- **规则细节** — \`.claude/rules/\`
- **角色边界** — \`.claude/agents/\`
- **文档公式** — \`.claude/formulas.md\`
- **Coder 手册** — \`.claude/coder.md\`
`;
}


// ── 生成器：agents ─────────────────────────────────────────────
// 按项目类型裁剪 agent 内容。每个 agent 的核心结构保留，但按项目情况调整细节。
function generateAgents(profile) {
  const p = profile;
  const isFrontend = p.type === 'frontend';
  const isBackend  = p.type === 'backend';
  const isMeta     = p.type === 'meta';

  const agents = {};

  // AGENT.md — 总览（通用，不裁剪）
  agents['AGENT.md'] = generateAgentOverview(p);

  // pm.md
  agents['pm.md'] = generatePmAgent(p);

  // coder.md
  agents['coder.md'] = generateCoderAgent(p);

  // tester.md
  agents['tester.md'] = generateTesterAgent(p);

  // reporter.md
  agents['reporter.md'] = generateReporterAgent(p);

  // security.md — 按安全面裁剪
  agents['security.md'] = generateSecurityAgent(p);

  // self-improve.md
  agents['self-improve.md'] = generateSelfImproveAgent(p);

  return agents;
}

function generateAgentOverview(p) {
  return `# Agents

> **口诀：指人、给据、收口。** 每条决策必有人负责，每个结论必有证据，每个变更必收闭环。

哲学源头 [CLAUDE.md](../../CLAUDE.md)：信模型、惜注意、验现实。

## 项目上下文

- **项目**: ${p.project} · ${p.type_label} · ${p.architecture.pattern}
- **Coder 公式**: ${p.coder_formula.text}
- **安全面**: ${p.security_surface.signals.join(' · ') || '无显著安全面'}
- **测试**: ${p.test_framework.framework || '未配置'} · \`${p.test_framework.runner_command || '无'}\`

## 角色拓扑

\`\`\`mermaid
flowchart LR
    pm(("pm<br/>决策")):::core
    pm -->|安全审查| sec[security]:::side
    pm -->|拆故事/排优先级| coder & tester & reporter
    coder --> tester --> reporter
    sec -.约束.-> coder
    si["self-improve"]:::side -.提案.-> pm
    coder -.记忆.-> si
    tester -.记忆.-> si
    reporter -.记忆.-> si
    classDef core fill:#fff3e0,stroke:#e65100;
    classDef side fill:#f3e5f5,stroke:#6a1b9a;
\`\`\`

| Agent | 口诀 | 一句话 |
|-------|------|--------|
| pm | 拆·排·收 | 决定做/不做/延期 |
| coder | 分·清·追 | 逐模块实现，P0 清零 |
| tester | 先·覆·断 | 测试先行，Gate 阻断 |
| reporter | 记·引·串 | 三报告交叉闭合 |
| security | 建·注·卡 | 威胁建模 → P0 卡发布 |
| self-improve | 采·断·出 | 数据驱动改进提案 |

## 共用底线

### 证据等级

| Level | 含义 | 写法 |
|-------|------|------|
| **A** 已验证 | Read/Grep/Glob 可复核 | 直接陈述，附路径 |
| **B** 可推导 | 从 A 推出一步 | "由……可得" |
| **C** 未验证 | 用户口述、未抓取 | \`> 待补充\` |
| **D** 禁止 | 无 A/B 支撑且非 C 标注 | 视为幻觉，不得出现 |

### 影响分析

闭合前禁止：生成设计结论、删/改公共接口、声称影响链已闭合。

### 生效标志

每个 agent 在自身文件末尾定义"何时算交接成功"。
`;
}

function generatePmAgent(p) {
  const explorationSection = p.type === 'frontend'
    ? '| 前端 | `.vue`/`.jsx`/`.tsx`/`.svelte` 的 Props/Events/Expose | 核心业务无文档 > 普通无文档 > 过时文档 |'
    : p.type === 'backend'
    ? '| 后端 | 路由/控制器 → HTTP 方法/路径/schema | 核心 API 无文档 > 普通无文档 > 过时文档 |'
    : '| 全栈 | 两端独立扫描 | 分别输出 |';

  return `---
name: pm
description: Product decision maker for ${p.project} (${p.type_label})
tools: Read, Grep, Glob, Bash
---

# pm — 产品决策者

> **口诀：拆·排·收。** 拆需求为故事，排优先级与顺序，收闭环回 AC。

## 项目上下文

- **项目**: ${p.project} · ${p.type_label}
- **故事骨架**: ${p.story_defaults.skeleton}（必选: ${p.story_defaults.required_files.join('/')}，跳过: ${p.story_defaults.skip_files.join('/') || '无'}）
- **Coder 公式**: ${p.coder_formula.text}

## 拆故事决策

| 信号 | 处理 |
|------|------|
| ≥2 独立角色 | 按角色拆 |
| ≥2 独立入口 | 按入口拆 |
| 子需求可独立交付 | 拆为独立故事 |
${p.type === 'fullstack' ? '| 跨前后端且任一端 > 3 模块 | 前端故事 + 后端故事 |' : ''}
| 单一场景不可再分 | 不拆 |

## --from-code 探索

| 项目类型 | 扫描目标 | 排序 |
|---------|---------|------|
${explorationSection}

## 规则

1. 自适应规划：历史数据可用时必须数据驱动
2. 不编造未验证的模块名/接口/路径
3. 策展阶段必须 git commit

## 生效标志

- 故事 §1 ≤ 3 句说清「做什么/给谁/为什么」
- §2 功能点全部 P0/P1/P2 标注且与 §5 AC 一一对应
- §4 任务表每行有 Agent + 门禁 + 交接信号
`;
}

function generateCoderAgent(p) {
  return `---
name: coder
description: Code implementer for ${p.project} (${p.type_label}), formula: ${p.coder_formula.variant}
tools: Read, Grep, Glob, Edit, Write, Bash
---

# coder — 代码实现

> **口诀：分·清·追。** 逐模块（分），P0 清零（清），改动可追溯（追）。

## 项目上下文

- **项目**: ${p.project} · ${p.type_label}
- **公式**: ${p.coder_formula.text}
- **焦点**: ${p.coder_formula.focus}
- **构建**: \`${p.manifest.build_commands.join('` · `') || '无'}\`
- **测试**: \`${p.test_framework.runner_command || p.manifest.test_commands.join('` · `') || '无'}\`

## 工作循环

\`\`\`mermaid
flowchart LR
    Br[切分支<br/>feat/${p.project}-name] --> M1[模块 1] --> R1{P0=0?}
    R1 -.否.-> M1
    R1 -->|是| M2[模块 2] --> R2{P0=0?}
    R2 -.否.-> M2
    R2 -->|是| Done[交接 tester]
\`\`\`

## 规则

1. 功能分支必须从 main/master 创建
2. 改动源码前必须已切到 \`feat/${p.project}-<name>\`
3. 源码改动唯一入口是 \`/rui code\` 管线
4. 禁止功能分支自动合并到 main
5. P0 缺失不进入实现，影响链未闭合不声称闭合
6. 不创建设计文档外的文件

## 审查维度

| 维度 | 检查点 |
|------|--------|
| Correctness | 逻辑错误、边界、null、并发 |
| Security | ${p.security_surface.signals.length > 0 ? p.security_surface.signals.join('、') : '注入、认证绕过、数据暴露'} |
| Maintainability | 命名、复杂度、重复、抽象层级 |

## 生效标志

- 每模块审查记录留痕，P0 清零证据可追溯
- 影响链标注 \`闭合\` 且二级传递可复核
- 实际接口与评审对齐或差异显式列出
`;
}

function generateTesterAgent(p) {
  const testCmd = p.test_framework.runner_command || p.manifest.test_commands[0] || '未配置';
  return `---
name: tester
description: Quality assurance for ${p.project}, test framework: ${p.test_framework.framework || 'unknown'}
tools: Read, Grep, Glob, Bash
---

# tester — 质量保证

> **口诀：先·覆·断。** 测试先行（先），覆盖正常/边界/异常/回归（覆），Gate 阻断不放行（断）。

## 项目上下文

- **测试框架**: ${p.test_framework.framework || '未配置'}
- **运行命令**: \`${testCmd}\`
- **配置文件**: ${p.test_framework.config_file || '无'}

## 双 Gate 模型

| Gate | 阻断口令 | 条件 |
|------|---------|------|
| Gate A | \`skip-gate-a\` | 04 不存在 → 阻编码 |
| Gate B | \`gate-b-limit\` | ≤2 轮修复 |

## 用例规则

1. 命名："should [预期] when [条件]"
2. Mock 外部依赖，不 mock 内部模块
3. afterEach 清理副作用
4. 每故事至少一条主操作流
5. 无测试覆盖不通过

## 验证命令

\`\`\`bash
${testCmd}
\`\`\`

## 生效标志

- 04 §1.1 覆盖矩阵：每 FP ≥3 类
- §6 Gate A 交接信号四项齐备
- 07 §6 Gate B 评估全部达标
`;
}

function generateReporterAgent(p) {
  return `---
name: reporter
description: Process reports and knowledge curation for ${p.project}
tools: Read, Grep, Glob
---

# reporter — 过程报告与知识策展

> **口诀：记·引·串。** 记发生过的事（记），每条结论附引用（引），三报告交叉对齐（串）。

## 项目上下文

- **项目**: ${p.project} · ${p.type_label}
- **故事骨架**: ${p.story_defaults.skeleton}
- **报告文件**: ${p.story_defaults.required_files.filter(f => ['05','06','07'].includes(f)).map(f => f + '-*').join(' / ') || '05/06/07'}

## 规则

1. 过程报告：不扭曲实际路径，不编造失败/建议
2. 知识策展：共性知识需 ≥2 个独立来源
3. 证据标准：Level A/B 或标注 Level C；Level D 视为幻觉
4. 交叉引用闭合：报告必须互引一致
5. 策展阶段必须 git commit

## 生效标志

- 报告版本行/关联文档/评审清单三项齐备
- 任一断言可指向 git diff 或测试输出
- 报告之间无矛盾叙述
- Gate B 评审清单全 ✅
`;
}

function generateSecurityAgent(p) {
  const sec = p.security_surface;
  // 按实际安全面裁剪注入条件和审查维度
  const injectionConditions = [];
  if (sec.user_input) injectionConditions.push('- 涉及用户输入（表单/URL 参数/上传/富文本）');
  if (sec.api_exposure) injectionConditions.push('- 调用外部 API 或暴露 API');
  if (sec.auth) injectionConditions.push('- 含认证/授权/会话/凭据');
  if (sec.data_storage) injectionConditions.push('- 数据持久化（DB/缓存/localStorage/文件）');
  if (sec.third_party) injectionConditions.push('- 第三方集成（脚本/iframe/SDK）');
  if (injectionConditions.length === 0) injectionConditions.push('- 当前项目无显著安全面，按通用规则审查');

  const reviewDimensions = [];
  if (sec.user_input) reviewDimensions.push('| Injection | XSS、命令注入、SQL 注入、路径穿越 |');
  if (sec.auth) reviewDimensions.push('| Auth | 越权、提权、会话固定、Token 处理 |');
  if (sec.data_storage) reviewDimensions.push('| Data | 敏感数据暴露、不安全存储、日志泄露 |');
  if (sec.third_party || sec.api_exposure) reviewDimensions.push('| Integrity | CSP、SRI、签名校验 |');
  if (reviewDimensions.length === 0) reviewDimensions.push('| General | 密钥硬编码、依赖漏洞、配置暴露 |');

  return `---
name: security
description: Security expert for ${p.project} — threat modeling based on detected surface
tools: Read, Grep, Glob
---

# security — 安全专家

> **口诀：建·注·卡。** 威胁建模（建），约束写入 §3 并注入任务（注），P0 卡住发布（卡）。

## 项目安全面

已识别的安全面：${sec.signals.join(' · ') || '无显著安全面'}

## 注入条件

故事满足任一项即注入安全约束 + 安全任务：

${injectionConditions.join('\n')}

## 审查维度

| 维度 | 检查点 |
|------|--------|
${reviewDimensions.join('\n')}

## 规则

1. 威胁建模不遗漏已识别的安全面
2. §3 安全约束 + §4 安全任务必须在评审阶段注入
3. 硬编码第三方域无 integrity → P0
4. 密钥/Token 出现在源码或落盘文件 → P0
5. P0 必须阻断交付，不可降级

## 生效标志

- §3 表头完整
- §4 安全任务有对应 AC/测试用例覆盖
- P0 安全发现关联到代码 commit 或显式阻断标记
`;
}

function generateSelfImproveAgent(p) {
  return `---
name: self-improve
description: Self-improvement pipeline for ${p.project} — data-driven proposals
tools: Read, Grep, Glob, Bash
---

# self-improve — 自改进管线

> **口诀：采·断·出。** 采数据（采），按 D0–D7 出诊断（断），每诊断写一条提案（出）。

## 项目上下文

- **项目**: ${p.project} · ${p.type_label}
- **基线文件**: CLAUDE.md / rules/ / agents/
- **测试命令**: \`${p.test_framework.runner_command || '无'}\`

## 诊断规则 D0–D7

| # | 信号 | 假设 | 基线依据 |
|---|------|------|---------|
| D0 | 执行与基线冲突 | 哲学偏离 | CLAUDE.md |
| D1 | 阻断率 > 20% | 预处理不充分 | code-pipeline.md |
| D2 | P0 密度 > 均值 2× | 设计遗漏 | doc-generation.md |
| D3 | T3 占比 > 30% | 需求边界模糊 | pm.md |
| D4 | Gate B > 2 轮 | 测试先行不足 | code-pipeline.md |
| D5 | 阶段耗时 > 均值 3× | Agent 协作瓶颈 | agents/ |
| D6 | 连续 2 窗口退化 | 系统性恶化 | CLAUDE.md 退化对策 |
| D7 | 提案闭合率 < 50% | 改进项不可执行 | self-improve.md |

## 规则

1. 提案必须有 snapshot 证据支撑
2. \`no-metrics\` 降级不阻断交付
3. \`proposals.jsonl\` append-only
4. 单次执行，不阻断主流程

## 生效标志

- 08 §0 基线校准表覆盖三类基线
- §2 诊断决策表 D1–D5 全部判定
- §5 评审清单 8 项全 ✅
`;
}


// ── 生成器：rules ──────────────────────────────────────────────
function generateRules(profile) {
  const p = profile;
  const rules = {};

  rules['code-pipeline.md'] = generateCodePipelineRule(p);
  rules['delivery-gate.md'] = generateDeliveryGateRule(p);
  rules['doc-generation.md'] = generateDocGenerationRule(p);
  rules['self-improve.md'] = generateSelfImproveRule(p);
  rules['rui-claude.md'] = generateRuiClaudeRule(p);

  return rules;
}

function generateCodePipelineRule(p) {
  const branchExample = `feat/${p.project}-<name>`;
  const gateANote = p.type === 'meta' ? '元项目可跳过 Gate A（配置变更）' : '单行 CSS/文案变更可跳过 Gate A';

  // 按项目类型裁剪模块清规则
  const moduleRules = [];
  moduleRules.push('8. 逐模块编码：每模块完成后审查 P0/P1/P2，**P0 不清零不进下一模块**');
  moduleRules.push('9. 影响链未闭合不声称闭合（`chain-broken`）');
  moduleRules.push('10. 不创建设计文档外的文件');

  // Gate B 步骤按项目类型裁剪
  const gateBReports = p.story_defaults.required_files
    .filter(f => ['05','06','07'].includes(f))
    .map(f => f === '05' ? '05-后端实施' : f === '06' ? '06-前端实施' : '07-测试报告');

  return `---
paths:
  - "**/*.{js,ts,jsx,tsx,vue,py,go,rs,java,rb,php}"
---

# code-pipeline

> **口诀：分支隔、测先行、模块清、闭环验。** 源码改动只走 \`/rui code\`。

## 适用

${p.project} 源码改动（${p.type_label}）。

## 规则

### 分支隔

1. 功能分支从 main/master 创建，命名 \`${branchExample}\`
2. 改动源码前必须已切到该分支（\`no-checkout\`）
3. 禁止自动合并到主干（\`auto-merge\`）
4. 源码修改唯一入口是 \`/rui code\`

### 测先行（Gate A）

5. 04-测试用例评审.md 不存在，不得编码（\`skip-gate-a\`）
6. 例外：${gateANote}
7. 测试方案与原型未就绪即视为未通过

### 模块清

${moduleRules.join('\n')}

### 闭环验（Gate B）

11. 五步：环境快照 → 静态预检 → 设计/实现对齐 → 单次执行 → 报告（${gateBReports.join('/')})
12. 报告交叉引用闭合，评审清单全 ✅ 方过
13. 修复 ≤ 2 轮，超过阻断（\`gate-b-limit\`）
14. 自改进必须产出 08

## 阻断标识

| 标识 | 触发 |
|------|------|
| \`bad-branch\` | 分支非从 main 创建 |
| \`no-checkout\` | 未切换故事分支即改源码 |
| \`auto-merge\` | 功能分支被自动合并 |
| \`skip-gate-a\` | Gate A 未通过即编码 |
| \`chain-broken\` | 影响链未闭合 |
| \`gate-b-limit\` | Gate B > 2 轮 |
`;
}

function generateDeliveryGateRule(p) {
  return `---
paths:
  - "docs/故事任务面板/**/.memory/rui-state.json"
  - "docs/故事任务面板/**/*.md"
---

# delivery-gate

> **口诀：标记即证据。** 三步交付按序执行，每步必标记。

## 适用

${p.project} 每个 \`/rui\` 命令的末端。

## 三步管线

| # | 操作 | 标记 |
|---|------|------|
| 1 | 追加日志 | \`log_appended\` |
| 2 | 文档同步 | \`docs_synced\` |
| 3 | 发送通知 | \`notification_sent\` |

## 规则

1. 标记即证据：未标记视为未执行
2. 顺序强制：三步严格按序
3. Stop hook：1 小时内有活动且未闭合 → 阻断
4. \`API_X_TOKEN\` 仅从环境变量读取，禁止写入文件
5. 缺 Token → \`no-token\` 降级，跳过推送但仍标记

## 阻断标识

| 标识 | 触发 | 降级 |
|------|------|------|
| \`delivery-incomplete\` | 三步未全部标记 | 否 |
| \`no-token\` | API_X_TOKEN 缺失 | 是 |
`;
}

function generateDocGenerationRule(p) {
  // 按项目类型决定文档类型
  const docTypes = ['故事'];
  if (p.type === 'frontend' || p.type === 'fullstack') docTypes.push('组件', '页面');
  if (p.type === 'backend' || p.type === 'fullstack') docTypes.push('接口', '领域');
  if (p.type === 'meta') docTypes.push('接口', '领域');

  return `---
paths:
  - "docs/**/*.md"
---

# doc-generation

> **口诀：版头齐、目录清、证据足、产出聚、裁剪准。**

## 适用

${p.project} 所有 \`docs/\` 下的产出。文档类型：${docTypes.join(' · ')}。

## 规则

### 1. 版头齐

- 版本行必填：\`v{版本} | {YYYY-MM-DD} | {模型} | {分支}\`
- 主体章节首尾含标准导航
- 图先文后

### 2. 目录清

| 文档类 | 路径模式 |
|--------|---------|
| 故事 | \`docs/故事任务面板/${p.project}/<name>/\` |
${p.type !== 'backend' ? `| 组件 | \`docs/组件文档/${p.project}/<component>/\` |\n| 页面 | \`docs/页面文档/${p.project}/<page>/\` |` : ''}
${p.type !== 'frontend' ? `| 接口 | \`docs/接口文档/${p.project}/<resource>/\` |\n| 领域 | \`docs/领域模型/${p.project}/<domain>/\` |` : ''}

### 3. 证据足

- A/B 可写入；C 标 \`> 待补充\`；D 禁止
- 不编造未验证的模块名/接口/路径

### 4. 产出聚

| 阶段 | 创建 |
|------|------|
| 文档生成 | ${p.story_defaults.required_files.filter(f => ['01','02','03','04'].includes(f)).join(' + ')} |
| 验证 | ${p.story_defaults.required_files.filter(f => ['05','06','07'].includes(f)).join(' / ')} |
| 自改进 | 08 |

### 5. 裁剪准

| 级别 | 范围 | 文档刷新 |
|------|------|---------|
| T1 | 措辞/格式 | 仅变更章节 |
| T2 | 增删故事/接口变更 | 目标 + 下游 |
| T3 | 边界变化/跨故事重构 | 全级联刷新 |
`;
}

function generateSelfImproveRule(p) {
  return `---
paths:
  - "docs/故事任务面板/**/.improvement/**"
  - "docs/故事任务面板/**/.memory/**"
---

# self-improve

> **口诀：有据才发、对基线断、单次不阻。**

## 适用

${p.project} 每个故事走完管线后产出 08-自改进复盘.md。

## 规则

1. 提案必须有 snapshot 证据支撑
2. \`proposals.jsonl\` append-only
3. 效果评估需前后各 ≥ 3 条记忆
4. \`no-metrics\` 降级不阻断交付
5. 诊断以基线文件为判定基准

## 诊断 D0–D7

| # | 信号 | 阈值 |
|---|------|------|
| D0 | 执行与基线冲突 | ≥1 条记忆 |
| D1 | 阻断率 | > 20% |
| D2 | P0 密度 | > 均值 2× |
| D3 | T3 占比 | > 30% |
| D4 | Gate B 轮次 | > 2 |
| D5 | 阶段耗时 | > 均值 3× |
| D6 | 连续退化 | 2 窗口 |
| D7 | 提案闭合率 | < 50% |

## 效果评估 E1–E4

| # | 指标 | 改善 | 退化 |
|---|------|------|------|
| E1 | 阻断率 | 后 < 前 | 后 > 前 |
| E2 | P0 密度 | 后 < 前 | 后 > 前 |
| E3 | bad_case | 消失 | 仍出现 |
| E4 | 综合 | 改善 > 退化 | 退化 > 改善 |
`;
}

function generateRuiClaudeRule(p) {
  return `---
paths:
  - ".claude/**"
---

# rui-claude

> 操作范围限定在 \`.claude/\` 目录。

## 适用

${p.project} 的 \`/rui-claude\` 命令。

## 规则

1. 所有变更限定在 \`.claude/\` 范围
2. sync 拉取远端最新
3. retro 健康复盘
4. history 操作回溯
5. 不修改 \`.claude/\` 范围外的文件
`;
}


// ── 生成器：formulas.md（按项目类型裁剪）─────────────────────────
function generateFormulas(profile) {
  const p = profile;
  const isFrontend = p.type === 'frontend';
  const isBackend  = p.type === 'backend';

  // 主线文件列表按项目类型裁剪
  const mainFiles = p.story_defaults.required_files;
  const skipFiles = p.story_defaults.skip_files;

  let content = `# 故事文档公式

> **口诀：公式即合约、信模型生成、不写占位符。**
>
> **项目**: ${p.project} · ${p.type_label} · 骨架: ${p.story_defaults.skeleton}
> **必选文件**: ${mainFiles.join('/')} · **跳过**: ${skipFiles.join('/') || '无'}

## 通用元素

### F.meta — 版本头

\`\`\`
> | v{version} | {YYYY-MM-DD} | {model} | 🌿 {branch} |
\`\`\`

### F.nav — 导航块

\`\`\`
> **导航**: [← {prev}](./{prev-file}.md) · [↑ {index}](./00-索引.md) · [{next} →](./{next-file}.md)
\`\`\`

### F.evidence — 证据等级

A=已验证(附路径) | B=可推导(附规则) | C=未验证(\`> 待补充\`) | D=禁止

---

## 故事主线公式

### F.story.01 — 01-故事任务.md

**公式**: \`meta + 角色公式速查 + Story×N + (§6 改进? + §7 架构演进?)\`

**角色公式速查**:
- PM: \`作为 [角色] 我想要 [动作] 以便 [价值]\`
- Tester: \`Given [前置] When [操作] Then [预期]\`
- Coder: \`${p.coder_formula.text}\`
- Security: \`威胁 → 信任边界 → 缓解\`

**每个 Story 章节**: §1 Story · §2 Requirements · §3 Design · §4 Tasks · §5 AC

`;

  // 02 后端技术评审（非纯前端项目）
  if (!isFrontend) {
    content += `### F.story.02 — 02-后端技术评审.md

**公式**: \`meta + nav + 服务架构 + API + 数据模型 + 安全 + 性能 + 评审清单\`

| 章节 | 内容 |
|------|------|
| §1 服务架构 | 模块/文件/职责 + 通信通道 |
| §2 API 接口 | 接口清单 + 请求流程 + 服务实现 |
| §3 数据模型 | 存储结构 + 数据迁移 |
| §4 安全约束 | 威胁/信任边界/缓解措施 |
| §5 性能与限制 | 维度/约束/应对 |
| §6 评审清单 | 7 项 ✅/❌ |

`;
  }

  // 03 前端技术评审（非纯后端项目）
  if (!isBackend) {
    content += `### F.story.03 — 03-前端技术评审.md

**公式**: \`meta + nav + 组件架构 + 状态 + 交互 + 样式 + DOM + 依赖 + 评审清单\`

| 章节 | 内容 |
|------|------|
| §1 组件架构 | 组件树 + 新增/变更 + 接口(Props/Events/Expose) |
| §2 状态管理 | 状态定义 + 状态流向 |
| §3 交互设计 | 操作流 + 视图状态矩阵 + 动画 |
| §4 样式方案 | 策略 + 新增样式文件 |
| §5 DOM 与事件 | 挂载点 + 事件清理 |
| §6 依赖与加载 | 加载顺序 + 命名空间 |
| §7 评审清单 | 8 项 ✅/❌ |

`;
  }

  // 04 测试用例评审（所有项目）
  content += `### F.story.04 — 04-测试用例评审.md

**公式**: \`meta + nav + 测试范围 + 用例×4类 + 环境专项 + Gate A 交接信号\`

测试框架: ${p.test_framework.framework || '未配置'} · 命令: \`${p.test_framework.runner_command || '无'}\`

`;

  // 05 后端实施报告（非纯前端）
  if (!isFrontend) {
    content += `### F.story.05 — 05-后端实施报告.md

**公式**: \`meta + nav + 实施总结 + 偏差 + P0审查 + 存储变更 + 性能观察 + 评审清单\`

`;
  }

  // 06 前端实施报告（非纯后端）
  if (!isBackend) {
    content += `### F.story.06 — 06-前端实施报告.md

**公式**: \`meta + nav + 实施总结 + 偏差 + P0审查 + 样式隔离 + 依赖加载 + 评审清单\`

`;
  }

  // 07 测试报告 + 08 自改进（所有项目）
  content += `### F.story.07 — 07-测试用例报告.md

**公式**: \`meta + nav + 测试环境 + 冒烟 + 回归 + 环境专项 + 已知问题 + Gate B 评估 + 评审清单\`

### F.story.08 — 08-自改进复盘.md

**公式**: \`meta + nav + 基线校准 + 观察 + 诊断 + 改进 + 经验沉淀 + 评审清单\`

---

## 补充文档公式（按需，编号 10–19）

| 触发条件 | 文档 | 编号 |
|---------|------|------|
${!isFrontend ? '| UI 改造 | 页面设计 | 10-页面设计.md |\n' : ''}| API 变更 | API 契约 | 10-API契约.md |
${!isFrontend ? '| 数据存储变更 | 数据迁移 | 11-数据迁移.md |\n' : ''}| 第三方集成 | 集成方案 | 12-集成方案.md |
${p.security_surface.auth ? '| 新权限控制 | 权限模型 | 13-权限模型.md |\n' : ''}| 性能敏感 | 性能基准 | 14-性能基准.md |
| 跨故事共享模块 | 模块接口 | 16-模块接口.md |

## 使用约定

1. 按文件公式逐章节产出
2. 裁剪：T1 仅写变更章节；T2 同步影响章节；T3 全文重生
3. 校验：F.meta + F.nav 占位符必须替换；表列必须齐
`;

  return content;
}

// ── 生成器：coder.md（按项目类型裁剪）──────────────────────────
function generateCoderHandbook(profile) {
  const p = profile;
  const isFrontend = p.type === 'frontend';
  const isBackend  = p.type === 'backend';

  let content = `# coder 工作手册

> **口诀：知目录、循公式、明数据。**
>
> **项目**: ${p.project} · ${p.type_label} · 公式: ${p.coder_formula.text}

## 文档分层

| 类别 | 用途 | 触发 |
|------|------|------|
| 故事级执行 | 做什么/怎么做/做了什么 | /rui doc · /rui code |
| 项目级参考 | 当前是什么 | /rui doc --from-code |

\`\`\`
docs/
├── 故事任务面板/${p.project}/<name>/   ← 执行
`;

  if (!isBackend) content += `├── 组件文档/${p.project}/<component>/  ← 参考（组件）\n├── 页面文档/${p.project}/<page>/       ← 参考（页面）\n`;
  if (!isFrontend) content += `├── 接口文档/${p.project}/<resource>/   ← 参考（API）\n└── 领域模型/${p.project}/<domain>/     ← 参考（领域）\n`;

  content += `\`\`\`

## 故事目录骨架

| 文件 | 必选 | 负责人 | 阶段 |
|------|:---:|--------|------|
| 01-故事任务.md | ✓ | pm | 文档生成 |
`;
  if (!isFrontend) content += `| 02-后端技术评审.md | ✓ | coder + security | 文档生成 |\n`;
  if (!isBackend) content += `| 03-前端技术评审.md | ✓ | coder | 文档生成 |\n`;
  content += `| 04-测试用例评审.md | ✓ | tester | 文档生成 |\n`;
  if (!isFrontend) content += `| 05-后端实施报告.md | ✓ | coder | 验证 |\n`;
  if (!isBackend) content += `| 06-前端实施报告.md | ✓ | coder | 验证 |\n`;
  content += `| 07-测试用例报告.md | ✓ | tester | 验证 |
| 08-自改进复盘.md | ✓ | self-improve | 自改进 |

## 完整度判定

| 状态 | 条件 |
|------|------|
| not_started | 故事任务不存在 |
| docs_in_progress | 故事任务存在，必选文档有缺失 |
| docs_done | 所有必选文档存在 |
| code_in_progress | 文档齐全 + 部分实施报告 |
| code_done | 所有必选文件 + 自改进复盘存在 |
| blocked | rui-state.json 中 blocked=true |

## 数据契约

\`\`\`
docs/<文档类>/${p.project}/<name>/
├── .improvement/proposals.jsonl     ← self-improve 追加
└── .memory/
    ├── execution-memory.jsonl       ← 每次阶段变更追加
    └── rui-state.json               ← 当前状态覆盖写
\`\`\`

### 写入规则

| 规则 | 说明 |
|------|------|
| append-only | execution-memory.jsonl 与 proposals.jsonl 仅追加 |
| 覆盖写 | rui-state.json 每次阶段变更覆盖 |
| 不手编 | 三个文件均由脚本管理 |
`;

  return content;
}


// ── 生成器：配置文件 ───────────────────────────────────────────
function generateMcpConfig(profile) {
  // 基础 MCP 配置，按项目生态可扩展
  const config = { mcpServers: {} };
  return JSON.stringify(config, null, 2) + '\n';
}

function generateSettings(profile) {
  const settings = {
    _doc: `${profile.project} 项目权限配置。rui init 生成。`,
    permissions: {
      allow: [],
      deny: [],
    },
  };
  // 按项目生态添加常用权限
  if (profile.manifest.ecosystems.includes('node')) {
    settings.permissions.allow.push('npm run *', 'npx *');
  }
  if (profile.manifest.ecosystems.includes('python')) {
    settings.permissions.allow.push('pytest *', 'python *');
  }
  if (profile.manifest.ecosystems.includes('rust')) {
    settings.permissions.allow.push('cargo *');
  }
  if (profile.manifest.ecosystems.includes('go')) {
    settings.permissions.allow.push('go *');
  }
  return JSON.stringify(settings, null, 2) + '\n';
}

// ── 3. verify ──────────────────────────────────────────────────
// 就绪检查。任一未通过 → exit 1。

function verify(profile) {
  const checks = [
    {
      id: 'CLAUDE.md',
      description: '哲学基础 + 项目约束',
      validate() {
        const fp = path.join(REPO_ROOT, 'CLAUDE.md');
        if (!fs.existsSync(fp)) return { ok: false, detail: '文件不存在' };
        const c = fs.readFileSync(fp, 'utf8');
        return matchAll(c, [
          ['公理: 信模型', /信模型/],
          ['公理: 惜注意', /惜注意/],
          ['公理: 验现实', /验现实/],
          ['退化对策', /先可见.*后规则/],
          ['项目约束', /rui:project-start/],
          ['项目名', new RegExp(profile.project)],
        ]);
      },
    },
    {
      id: 'README.md',
      description: '系统视图 + 项目画像',
      validate() {
        const fp = path.join(REPO_ROOT, 'README.md');
        if (!fs.existsSync(fp)) return { ok: false, detail: '文件不存在' };
        const c = fs.readFileSync(fp, 'utf8');
        return matchAll(c, [
          ['系统能力', /系统能力/],
          ['快速开始', /快速开始/],
          ['项目结构', /项目结构/],
          ['项目画像', /项目画像/],
          ['项目名', new RegExp(profile.project)],
        ]);
      },
    },
    {
      id: '.claude/agents/',
      description: `${AGENT_FILES.length} 个 Agent 文件（按 ${profile.type_label} 裁剪）`,
      validate() {
        const missing = [];
        for (const f of AGENT_FILES) {
          const fp = path.join(CLAUDE_DIR, 'agents', f);
          if (!fs.existsSync(fp)) { missing.push(f); continue; }
          const c = fs.readFileSync(fp, 'utf8');
          if (f === 'AGENT.md') {
            if (c.trim().length < C.MIN_AGENT_CONTENT_LENGTH) missing.push(`${f}(内容过短)`);
            if (!c.includes(profile.project)) missing.push(`${f}(缺项目名)`);
          } else if (!c.startsWith('---') || !c.includes('name:')) {
            missing.push(`${f}(缺 frontmatter)`);
          }
        }
        return missing.length === 0
          ? { ok: true, detail: `${AGENT_FILES.length} 个 Agent 文件合法且含项目上下文` }
          : { ok: false, detail: `缺失/无效: ${missing.join(', ')}`, missing };
      },
    },
    {
      id: '.claude/rules/',
      description: `${RULE_FILES.length} 个规则文件（按 ${profile.type_label} 裁剪）`,
      validate() {
        const missing = [];
        for (const f of RULE_FILES) {
          const fp = path.join(CLAUDE_DIR, 'rules', f);
          if (!fs.existsSync(fp)) { missing.push(f); continue; }
          const c = fs.readFileSync(fp, 'utf8');
          if (!c.includes(profile.project)) missing.push(`${f}(缺项目名)`);
        }
        return missing.length === 0
          ? { ok: true, detail: `${RULE_FILES.length} 个规则文件齐备且含项目上下文` }
          : { ok: false, detail: `缺失/无效: ${missing.join(', ')}`, missing };
      },
    },
    {
      id: '.claude/ 配置层',
      description: 'formulas + coder + settings',
      validate() {
        const items = [
          ['formulas.md', containsAll('F.story.01', 'F.story.08', profile.project)],
          ['coder.md', content => content.includes(profile.project) && content.includes(profile.coder_formula.text) ? { ok: true } : { ok: false, detail: '缺项目信息' }],
          ['settings.json', validJsonWith('permissions')],
        ];
        const fails = [];
        for (const [name, check] of items) {
          const fp = path.join(CLAUDE_DIR, name);
          if (!fs.existsSync(fp)) { fails.push(`${name}(缺失)`); continue; }
          const r = check(fs.readFileSync(fp, 'utf8'));
          if (!r.ok) fails.push(`${name}(${r.detail})`);
        }
        return fails.length === 0
          ? { ok: true, detail: '配置层完整且含项目信息' }
          : { ok: false, detail: fails.join('; '), missing: fails };
      },
    },
    {
      id: '项目耦合一致性',
      description: '所有产物与 profile 一致',
      validate() {
        const fails = [];
        // 检查 CLAUDE.md 项目章节与 profile 一致
        const claude = tryRead(path.join(REPO_ROOT, 'CLAUDE.md'));
        if (claude && !claude.includes(profile.type_label)) fails.push('CLAUDE.md 缺项目类型');
        // 检查 agents 引用正确的项目类型
        const coderAgent = tryRead(path.join(CLAUDE_DIR, 'agents', 'coder.md'));
        if (coderAgent && !coderAgent.includes(profile.coder_formula.text)) fails.push('coder.md 公式不匹配');
        // 检查 formulas 按项目类型裁剪
        const formulas = tryRead(path.join(CLAUDE_DIR, 'formulas.md'));
        if (formulas) {
          if (profile.type === 'frontend' && formulas.includes('F.story.02')) fails.push('formulas.md 前端项目不应含 02');
          if (profile.type === 'backend' && formulas.includes('F.story.03')) fails.push('formulas.md 后端项目不应含 03');
        }
        return fails.length === 0
          ? { ok: true, detail: '产物与项目画像一致' }
          : { ok: false, detail: fails.join('; ') };
      },
    },
    {
      id: 'docs/ 文档目录',
      description: `核心文档目录（按 ${profile.type_label} 裁剪）`,
      validate() {
        const expectedDirs = resolveDocDirsForType(profile.type);
        const missing = [];
        for (const dir of expectedDirs) {
          const fullDir = path.join(REPO_ROOT, 'docs', dir);
          if (!fs.existsSync(fullDir)) missing.push(dir);
        }
        if (missing.length > 0) {
          return { ok: false, detail: `缺失目录: ${missing.join(', ')}`, missing };
        }
        return { ok: true, detail: `${expectedDirs.length} 个文档目录就绪（${expectedDirs.join(' · ')}）` };
      },
    },
  ];

  const results = checks.map(c => ({ id: c.id, description: c.description, ...c.validate() }));
  const passed = results.filter(c => c.ok).length;
  return { ok: passed === results.length, total: results.length, passed, checks: results };
}

// ── 主流程 ─────────────────────────────────────────────────────

async function main() {
  const args   = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const force  = args.includes('--force');
  const json   = args.includes('--json');
  const help   = args.includes('--help') || args.includes('-h');

  if (help) { printHelp(); return; }

  // 1. detect — 扫描项目
  const profile = detect();

  // 2. generate — 按项目情况生成/裁剪全部产物
  const genResult = generate(profile, { dryRun, force });

  // 3. verify — 就绪检查
  const verifyResult = verify(profile);

  // 4. record（dry-run 跳过）
  if (!dryRun) writeInitMemory(profile, verifyResult);

  // 输出
  if (json) {
    console.log(JSON.stringify({ profile, generate: genResult, verify: verifyResult, dry_run: dryRun }, null, 2));
  } else {
    printReport(profile, genResult, verifyResult, { dryRun, force });
  }

  // 失败退出
  if (!dryRun && !verifyResult.ok) process.exit(1);
}

// ── 工具 ───────────────────────────────────────────────────────

function rel(p) { return path.relative(REPO_ROOT, p) || '.'; }
function ensureDir(d) { if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true }); }
function tryRead(fp) { try { return fs.readFileSync(fp, 'utf8'); } catch { return ''; } }

function writeFile(fp, content, opts, result, label) {
  const exists = fs.existsSync(fp);
  if (opts.dryRun) {
    result.created.push({ path: rel(fp), action: exists ? 'will-overwrite' : 'will-create', source: label });
    return;
  }
  ensureDir(path.dirname(fp));
  fs.writeFileSync(fp, content, 'utf8');
  result.created.push({ path: rel(fp), action: exists ? 'overwritten' : 'created', source: label });
}

function writeInitMemory(profile, verifyResult) {
  const memFile = path.join(REPO_ROOT, 'docs', '故事任务面板', '.init-memory.json');
  ensureDir(path.dirname(memFile));
  fs.writeFileSync(memFile, JSON.stringify({
    timestamp: new Date().toISOString(),
    project:   profile.project,
    type:      profile.type,
    type_label: profile.type_label,
    security_surface: profile.security_surface.signals,
    test_framework: profile.test_framework.framework,
    architecture: profile.architecture.pattern,
    doc_dirs: resolveDocDirsForType(profile.type),
    verify: { ok: verifyResult.ok, passed: verifyResult.passed, total: verifyResult.total },
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


// ── 输出 ───────────────────────────────────────────────────────

function printReport(profile, gen, ver, opts) {
  console.log(`\n# rui init ${opts.dryRun ? '(dry-run)' : ''}\n`);
  console.log(`项目: ${profile.project} · 类型: ${profile.type_label} · 架构: ${profile.architecture.pattern}`);
  console.log(`公式: ${profile.coder_formula.text}`);
  if (profile.manifest.ecosystems.length) console.log(`生态: ${profile.manifest.ecosystems.join(', ')}`);
  if (profile.security_surface.signals.length) console.log(`安全面: ${profile.security_surface.signals.join(' · ')}`);
  if (profile.test_framework.framework) console.log(`测试: ${profile.test_framework.framework} · \`${profile.test_framework.runner_command}\``);
  if (profile.ci_config.provider) console.log(`CI/CD: ${profile.ci_config.provider}`);
  if (profile.tech_signals.length) console.log(`信号: ${profile.tech_signals.slice(0, 5).join(' · ')}${profile.tech_signals.length > 5 ? ' ...' : ''}`);
  console.log(`文档目录: ${resolveDocDirsForType(profile.type).join(' · ')}`);
  console.log('');

  const counts = { created: 0, overwritten: 0 };
  for (const item of gen.created) {
    if (item.action === 'created' || item.action === 'will-create') counts.created++;
    else if (item.action.includes('overwrit')) counts.overwritten++;
  }

  // 统计文档骨架
  const docScaffoldCount = gen.created.filter(i => i.path.startsWith('docs/') && i.path.includes('00-索引')).length;

  console.log(`## 产物 (${counts.created} 创建 · ${counts.overwritten} 更新${docScaffoldCount > 0 ? ` · ${docScaffoldCount} 文档骨架` : ''})`);
  for (const item of gen.created) {
    console.log(`  ${actionGlyph(item.action)} ${item.path}  ← ${item.source}`);
  }
  console.log('');

  // 显示文档目录结构
  if (gen.dirs.length > 0) {
    const docDirs = gen.dirs.filter(d => d.path.startsWith('docs/'));
    if (docDirs.length > 0) {
      console.log(`## 文档目录 (${docDirs.length} 个)`);
      for (const d of docDirs) {
        console.log(`  ${d.action === 'will-create' ? '◇' : '✓'} ${d.path}`);
      }
      console.log('');
    }
  }

  console.log(`## 就绪检查 (${ver.passed}/${ver.total})`);
  for (const c of ver.checks) {
    console.log(`  ${c.ok ? '✅' : '❌'} ${c.id} — ${c.detail}`);
  }
  console.log('');

  if (ver.ok) {
    console.log('✓ 基线就绪（全部产物已按项目情况生成）。下一步:');
    console.log('  /rui doc <需求>          # 拆故事 + 文档管线');
    console.log('  /rui doc --from-code     # 从源码反推参考文档');
    console.log('  /rui                     # 任务推荐\n');
  } else if (!opts.dryRun) {
    console.log('✗ 就绪检查未通过，修复后重跑 `/rui init`。\n');
  }
}

function actionGlyph(action) {
  if (action.includes('will-')) return '◇';
  if (action.includes('overwrit')) return '↻';
  if (action === 'created') return '+';
  return ' ';
}

function printHelp() {
  console.log(`rui init — 建立项目基线（全产物项目耦合生成）

用法: node init.js [选项]

选项:
  --dry-run   只扫描和报告，不写文件
  --force     强制覆盖（默认也覆盖，此选项保留兼容）
  --json      机器可读输出
  --help      显示本帮助

流程: detect（扫描）→ generate（按项目情况生成/裁剪）→ verify（就绪检查）

探测信号:
  - 项目类型（frontend/backend/fullstack/meta）
  - 安全面（用户输入/API/存储/认证/第三方）
  - 测试框架（vitest/jest/pytest/go-test/cargo-test）
  - CI 配置（github-actions/gitlab-ci/jenkins）
  - 架构模式（single/monorepo/microservice/plugin）

产物（全部按项目情况裁剪）:
  CLAUDE.md                      哲学基础 + 项目约束
  README.md                      系统视图 + 项目画像
  .claude/agents/                角色文件（按项目类型裁剪）
  .claude/rules/                 规则文件（按项目类型裁剪）
  .claude/formulas.md            故事文档公式（按项目类型裁剪）
  .claude/coder.md               coder 工作手册（按项目类型裁剪）
  .claude/settings.json          项目权限（按生态配置）
  .claude/.mcp.json              MCP 配置
  docs/故事任务面板/             故事产出根目录

文档目录（按项目类型自动创建 + 源码扫描生成骨架）:
  docs/故事任务面板/             所有项目
  docs/组件文档/                 前端/全栈项目（扫描 src/components 等）
  docs/页面文档/                 前端/全栈项目（扫描 src/pages 等）
  docs/接口文档/                 后端/全栈/元项目（扫描路由/控制器）
  docs/领域模型/                 后端/全栈/元项目（扫描 domain/models/services）

文档骨架生成规则:
  - 只为有实际源码支撑的模块生成（Level A 证据）
  - 每个发现的模块生成 00-索引.md（导航入口）
  - 索引文件已存在不覆盖（保护手动编辑）
  - 每类最多生成 10 个骨架（避免噪音）

可重复运行：每次根据最新项目情况更新和裁剪全部产物。
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

module.exports = { detect, generate, verify };
