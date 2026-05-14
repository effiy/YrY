#!/usr/bin/env node

// node skills/rui/scripts/init.js [--dry-run] [--json] [--force]
// rui init: 基线 → 基线注入 → 就绪检查(8项) → 交付

const fs = require('fs');
const fsp = fs.promises;
const path = require('path');
const C = require('./constants.js');

const REPO_ROOT = process.cwd();
const CLAUDE_DIR = path.join(REPO_ROOT, '.claude');

// ── 8-item readiness check definitions ──────────────────────────

const CHECKS = {
  'CLAUDE.md': {
    order: 1,
    description: '哲学基础：三公理 + 六原则 + 七准则 + 退化对策',
    file: path.join(REPO_ROOT, 'CLAUDE.md'),
    validate(content) {
      const required = [
        { label: '公理: 信模型', pattern: /信模型/ },
        { label: '公理: 惜注意', pattern: /惜注意/ },
        { label: '公理: 验现实', pattern: /验现实/ },
        { label: '原则: 守底线', pattern: /守底线/ },
        { label: '准则: 思在前', pattern: /思在前/ },
        { label: '退化对策', pattern: /先可见.*后规则/ },
      ];
      return checkPatterns(content, required);
    },
  },
  'README.md': {
    order: 2,
    description: '系统文档：系统能力 + 项目结构 + 快速开始',
    file: path.join(REPO_ROOT, 'README.md'),
    validate(content) {
      const required = [
        { label: '系统能力', pattern: /系统能力/ },
        { label: '项目结构', pattern: /项目结构/ },
        { label: '快速开始', pattern: /快速开始/ },
        { label: 'rui init', pattern: /\/rui\s+init/ },
      ];
      return checkPatterns(content, required);
    },
  },
  'agents/': {
    order: 3,
    description: '7 个 Agent 文件（AGENT.md + 6 角色定义）',
    file: path.join(CLAUDE_DIR, 'agents'),
    validate() {
      const overview = 'AGENT.md';
      const roles = ['pm.md', 'coder.md', 'tester.md', 'reporter.md', 'security.md', 'self-improve.md'];
      const missing = [];

      // AGENT.md is overview — just needs to exist with content
      const overviewPath = path.join(CLAUDE_DIR, 'agents', overview);
      if (!fs.existsSync(overviewPath)) missing.push(overview);
      else {
        const content = fs.readFileSync(overviewPath, 'utf8');
        if (content.trim().length < C.MIN_AGENT_CONTENT_LENGTH) missing.push(`${overview}(内容过短)`);
      }

      // Role agents need valid frontmatter
      for (const f of roles) {
        const fp = path.join(CLAUDE_DIR, 'agents', f);
        if (!fs.existsSync(fp)) missing.push(f);
        else {
          const content = fs.readFileSync(fp, 'utf8');
          if (!content.startsWith('---') || !content.includes('name:')) missing.push(`${f}(缺少 frontmatter)`);
        }
      }
      return { ok: missing.length === 0, missing, detail: missing.length === 0 ? '全部 7 个 Agent 文件有效' : `缺失/无效: ${missing.join(', ')}` };
    },
  },
  'rules/': {
    order: 4,
    description: '6 个规则文件（code-pipeline + doc-generation + gate-rules + import-docs + rui-claude + self-improve）',
    file: path.join(CLAUDE_DIR, 'rules'),
    validate() {
      const required = ['code-pipeline.md', 'doc-generation.md', 'gate-rules.md', 'import-docs.md', 'rui-claude.md', 'self-improve.md'];
      const missing = [];
      for (const f of required) {
        if (!fs.existsSync(path.join(CLAUDE_DIR, 'rules', f))) missing.push(f);
      }
      return { ok: missing.length === 0, missing, detail: missing.length === 0 ? '全部 6 个规则文件存在' : `缺失: ${missing.join(', ')}` };
    },
  },
  'formulas.md': {
    order: 5,
    description: '故事文档公式（F.story.01–08 主线 + F.supp.10–16 补充）',
    file: path.join(CLAUDE_DIR, 'formulas.md'),
    validate(content) {
      const required = [
        { label: 'F.meta 通用元素', pattern: /F\.meta/ },
        { label: 'F.story 故事主线公式', pattern: /F\.story\.01/ },
        { label: 'F.supp 补充文档公式', pattern: /F\.supp\./ },
        { label: '8 份故事主线覆盖', pattern: /F\.story\.01[\s\S]*F\.story\.02[\s\S]*F\.story\.03[\s\S]*F\.story\.04[\s\S]*F\.story\.05[\s\S]*F\.story\.06[\s\S]*F\.story\.07[\s\S]*F\.story\.08/ },
      ];
      return checkPatterns(content, required);
    },
  },
  '.mcp.json': {
    order: 6,
    description: 'MCP 配置：有效 JSON + mcpServers 字段',
    file: path.join(CLAUDE_DIR, '.mcp.json'),
    validate(content) {
      try {
        const parsed = JSON.parse(content);
        if (!('mcpServers' in parsed)) return { ok: false, detail: '缺少 mcpServers 字段' };
        return { ok: true, detail: 'MCP 配置有效' };
      } catch (e) {
        return { ok: false, detail: `JSON 解析失败: ${e.message}` };
      }
    },
  },
  'settings.json': {
    order: 7,
    description: '项目设置：有效 JSON + permissions 字段',
    file: path.join(CLAUDE_DIR, 'settings.json'),
    validate(content) {
      try {
        const parsed = JSON.parse(content);
        if (!('permissions' in parsed)) return { ok: false, detail: '缺少 permissions 字段' };
        const permCount = Object.keys(parsed.permissions).length;
        if (permCount === 0) return { ok: false, detail: 'permissions 为空' };
        return { ok: true, detail: `权限配置有效 (${permCount} 项)` };
      } catch (e) {
        return { ok: false, detail: `JSON 解析失败: ${e.message}` };
      }
    },
  },
  '.claude/': {
    order: 8,
    description: '.claude/ 目录结构完整（agents/ + rules/ + formulas.md + coder.md + settings.json + .mcp.json + settings.local.json）',
    file: CLAUDE_DIR,
    validate() {
      const required = [
        'agents/', 'rules/', 'formulas.md', 'coder.md',
        'settings.json', '.mcp.json', 'settings.local.json',
      ];
      const missing = [];
      for (const f of required) {
        if (!fs.existsSync(path.join(CLAUDE_DIR, f))) missing.push(f);
      }
      return { ok: missing.length === 0, missing, detail: missing.length === 0 ? '.claude/ 目录结构完整' : `缺失: ${missing.join(', ')}` };
    },
  },
};

function checkPatterns(content, required) {
  const missing = [];
  for (const { label, pattern } of required) {
    if (!pattern.test(content)) missing.push(label);
  }
  return { ok: missing.length === 0, missing, detail: missing.length === 0 ? '全部关键节点存在' : `缺失: ${missing.join(', ')}` };
}

// ── Baseline extraction ─────────────────────────────────────────

function extractBaseline() {
  const baseline = {
    project: path.basename(REPO_ROOT),
    philosophy: {},
    capabilities: {},
    techStack: [],
    conventions: [],
    prohibitions: [],
    directoryStructure: {},
    keyFiles: [],
    buildCommands: [],
    testCommands: [],
    architecture: {},
    injectionTargets: {},
    // ── 新增：从项目基线文件提取的项目特有信息 ──
    projectDescription: '',
    coreModules: [],
    apiPatterns: [],
    codingStandards: [],
    securityConstraints: [],
    deploymentInfo: [],
    dependencies: {},
  };

  // Extract from CLAUDE.md
  const claudePath = path.join(REPO_ROOT, 'CLAUDE.md');
  if (fs.existsSync(claudePath)) {
    const content = fs.readFileSync(claudePath, 'utf8');

    // Extract philosophy axioms
    const axiomMatch = content.match(/信模型[^。]+。[^。]+。?/);
    if (axiomMatch) baseline.philosophy.axioms = axiomMatch[0];

    // Extract work principles (pattern: **Name — summary。** description)
    const principlesSection = content.match(/## 工作原则([\s\S]*?)(?=##|$)/);
    if (principlesSection) {
      const principleMatches = principlesSection[1].matchAll(/\*\*(\S+)\s*[—\-].*?\*\*\s*(.+?)(?=\n|$)/g);
      for (const m of principleMatches) {
        const desc = m[2].trim();
        if (desc.length > C.MIN_PHILOSOPHY_DESC_LENGTH) baseline.philosophy[m[1]] = desc;
      }
    }

    // Extract execution guidelines (pattern: **Name。** description)
    const execSection = content.match(/## 执行准则([\s\S]*?)(?=##|$)/);
    if (execSection) {
      const guidelineMatches = execSection[1].matchAll(/\*\*(\S+)。\*\*\s*(.+?)(?=\n|$)/g);
      for (const m of guidelineMatches) {
        const desc = m[2].trim();
        if (desc.length > C.MIN_PHILOSOPHY_DESC_LENGTH) baseline.philosophy[m[1]] = desc;
      }
    }

    // ── 新增：提取编码规范 ──
    const codingSection = content.match(/##\s*(?:编码规范|Coding Standards?|代码规范)([\s\S]*?)(?=##|$)/i);
    if (codingSection) {
      for (const m of codingSection[1].matchAll(/[-*]\s+(.+)/g)) {
        baseline.codingStandards.push(m[1].trim());
      }
    }

    // ── 新增：提取禁止事项（更全面） ──
    const prohibitionPatterns = [
      /禁止[^。\n]+/g,
      /不得[^。\n]+/g,
      /不允许[^。\n]+/g,
    ];
    for (const pat of prohibitionPatterns) {
      for (const m of content.matchAll(pat)) {
        const item = m[0].trim();
        if (item.length > 4 && !baseline.prohibitions.includes(item)) {
          baseline.prohibitions.push(item);
        }
      }
    }

    // ── 新增：提取关键文件 ──
    const keyFileSection = content.match(/##\s*(?:关键文件|Key Files|核心文件)([\s\S]*?)(?=##|$)/i);
    if (keyFileSection) {
      for (const m of keyFileSection[1].matchAll(/[-*]\s+`?([^\s`]+)`?\s*[—:\-]?\s*(.*)/g)) {
        baseline.keyFiles.push({ path: m[1], desc: m[2].trim() });
      }
    }

    // ── 新增：提取安全约束 ──
    const secSection = content.match(/##\s*(?:安全|Security)([\s\S]*?)(?=##|$)/i);
    if (secSection) {
      for (const m of secSection[1].matchAll(/[-*]\s+(.+)/g)) {
        baseline.securityConstraints.push(m[1].trim());
      }
    }

    // Fallback prohibitions from philosophy
    if (baseline.prohibitions.length === 0) {
      baseline.prohibitions.push('禁止跳过验证：没验证等于没做');
      baseline.prohibitions.push('禁止过度设计：只解决当前问题');
      baseline.prohibitions.push('禁止猜测：不确定就问');
    }
  }

  // Extract from README.md
  const readmePath = path.join(REPO_ROOT, 'README.md');
  if (fs.existsSync(readmePath)) {
    const content = fs.readFileSync(readmePath, 'utf8');

    // ── 新增：提取项目描述（第一段或 ## 简介） ──
    const descMatch = content.match(/^#\s+.+\n+([^#\n][^\n]+)/m);
    if (descMatch) baseline.projectDescription = descMatch[1].trim().replace(/^>\s*/, '');

    // Extract system capabilities
    const capSection = content.match(/## 系统能力([\s\S]*?)(?=##|$)/);
    if (capSection) {
      const capMatches = capSection[1].matchAll(/\|\s*(\S+)\s*\|[^|]*\|[^|]*\|[^|]*\|/g);
      for (const m of capMatches) {
        baseline.capabilities[m[1]] = true;
      }
    }

    // Extract project structure (directory listing)
    const structSection = content.match(/## 项目结构([\s\S]*?)(?=##|$)/);
    if (structSection) {
      const dirMatches = structSection[1].matchAll(/(?:├──|└──)\s+(\S+)\s*#?\s*(.*)/g);
      for (const m of dirMatches) {
        baseline.directoryStructure[m[1]] = m[2] || '';
      }
    }

    // ── 新增：提取技术栈 ──
    const techSection = content.match(/##\s*(?:技术栈|Tech Stack|技术选型|Dependencies)([\s\S]*?)(?=##|$)/i);
    if (techSection) {
      for (const m of techSection[1].matchAll(/[-*]\s+\*?\*?([^*\n]+)\*?\*?\s*/g)) {
        baseline.techStack.push(m[1].trim());
      }
    }
    // Also extract from table format
    const techTableMatches = content.matchAll(/\|\s*(?:技术|框架|库|工具)\s*\|[^|]*\|/gi);
    for (const m of techTableMatches) {
      // skip header rows
    }

    // ── 新增：提取核心模块/架构 ──
    const archSection = content.match(/##\s*(?:架构|Architecture|核心架构|系统架构)([\s\S]*?)(?=##|$)/i);
    if (archSection) {
      for (const m of archSection[1].matchAll(/[-*]\s+\*?\*?([^*\n]+)\*?\*?\s*/g)) {
        baseline.coreModules.push(m[1].trim());
      }
      // Extract from mermaid diagrams
      const mermaidMatch = archSection[1].match(/```mermaid([\s\S]*?)```/);
      if (mermaidMatch) baseline.architecture.diagram = mermaidMatch[1].trim();
    }

    // Extract quick start commands (inline code + code blocks)
    const quickSection = content.match(/## 快速开始([\s\S]*?)(?=##|$)/);
    if (quickSection) {
      const text = quickSection[1];
      for (const m of text.matchAll(/`(\/[^`\s]+(?:\s+[^`]+)?)`/g)) {
        baseline.buildCommands.push(m[1].trim());
      }
      for (const m of text.matchAll(/^\s*(\/\S+(?:\s+[^\n#]+)?)/gm)) {
        const cmd = m[1].trim();
        if (!baseline.buildCommands.includes(cmd)) baseline.buildCommands.push(cmd);
      }
    }

    // ── 新增：提取构建/测试命令 ──
    const buildSection = content.match(/##\s*(?:构建|Build|开发|Development)([\s\S]*?)(?=##|$)/i);
    if (buildSection) {
      for (const m of buildSection[1].matchAll(/```(?:bash|sh|shell)?\n([\s\S]*?)```/g)) {
        for (const line of m[1].split('\n').filter(l => l.trim() && !l.startsWith('#'))) {
          baseline.buildCommands.push(line.trim());
        }
      }
    }
    const testSection = content.match(/##\s*(?:测试|Test|Testing)([\s\S]*?)(?=##|$)/i);
    if (testSection) {
      for (const m of testSection[1].matchAll(/```(?:bash|sh|shell)?\n([\s\S]*?)```/g)) {
        for (const line of m[1].split('\n').filter(l => l.trim() && !l.startsWith('#'))) {
          baseline.testCommands.push(line.trim());
        }
      }
    }

    // ── 新增：提取部署信息 ──
    const deploySection = content.match(/##\s*(?:部署|Deploy|Deployment)([\s\S]*?)(?=##|$)/i);
    if (deploySection) {
      for (const m of deploySection[1].matchAll(/[-*]\s+(.+)/g)) {
        baseline.deploymentInfo.push(m[1].trim());
      }
    }
  }

  // ── 新增：从项目清单（manifest）提取依赖和脚本，按生态优先级 ──
  // 第三源不再钉死 package.json：按生态文件存在性派发，多生态并存时合并抽取
  const manifest = extractManifestSignals(REPO_ROOT);
  baseline.dependencies = manifest.dependencies;
  for (const cmd of manifest.buildCommands) {
    if (!baseline.buildCommands.includes(cmd)) baseline.buildCommands.push(cmd);
  }
  for (const cmd of manifest.testCommands) {
    if (!baseline.testCommands.includes(cmd)) baseline.testCommands.push(cmd);
  }
  for (const t of manifest.techStack) {
    if (!baseline.techStack.includes(t)) baseline.techStack.push(t);
  }
  baseline.manifestEcosystems = manifest.ecosystems;

  // Detect project type
  baseline.projectType = C.detectProjectType(REPO_ROOT);

  // Build injection targets (enhanced with project-specific data)
  baseline.injectionTargets = {
    'coder.md': {
      techStack: baseline.techStack,
      conventions: baseline.codingStandards,
      prohibitions: baseline.prohibitions,
      keyFiles: baseline.keyFiles,
      buildCommands: baseline.buildCommands,
      testCommands: baseline.testCommands,
      coreModules: baseline.coreModules,
    },
    'security.md': {
      techStack: baseline.techStack,
      architecture: baseline.architecture,
      securityConstraints: baseline.securityConstraints,
      dependencies: baseline.dependencies,
    },
    'tester.md': {
      conventions: baseline.codingStandards,
      buildCommands: baseline.buildCommands,
      testCommands: baseline.testCommands,
    },
    'code-pipeline.md': {
      prohibitions: baseline.prohibitions,
      buildCommands: baseline.buildCommands,
      testCommands: baseline.testCommands,
    },
  };

  return baseline;
}

function detectProjectType() {
  // Delegate to shared implementation in constants.js for consistency with recommend.js
  return C.detectProjectType(REPO_ROOT);
}

// ── Manifest extraction（第三源：按生态分派） ───────────────────
// 项目清单（manifest）按生态文件存在性派发，多生态项目并存抽取并合并
function extractManifestSignals(repoRoot) {
  const out = {
    dependencies: { production: [], dev: [] },
    buildCommands: [],
    testCommands: [],
    techStack: [],
    ecosystems: [],
  };

  const exists = (rel) => fs.existsSync(path.join(repoRoot, rel));
  const readSafe = (rel) => {
    try { return fs.readFileSync(path.join(repoRoot, rel), 'utf8'); } catch { return ''; }
  };
  const pushUniq = (arr, v) => { if (v && !arr.includes(v)) arr.push(v); };

  // Node — package.json
  if (exists('package.json')) {
    try {
      const pkg = JSON.parse(readSafe('package.json'));
      const prod = Object.keys(pkg.dependencies || {});
      const dev = Object.keys(pkg.devDependencies || {});
      out.dependencies.production.push(...prod);
      out.dependencies.dev.push(...dev);
      if (pkg.scripts) {
        if (pkg.scripts.build) pushUniq(out.buildCommands, 'npm run build');
        if (pkg.scripts.lint)  pushUniq(out.buildCommands, 'npm run lint');
        if (pkg.scripts.dev)   pushUniq(out.buildCommands, 'npm run dev');
        if (pkg.scripts.test)  pushUniq(out.testCommands,  'npm test');
      }
      const allDeps = { ...pkg.dependencies, ...pkg.devDependencies };
      const known = ['react','vue','angular','svelte','next','nuxt','express','koa','fastify','nestjs'];
      for (const fw of known) if (allDeps[fw]) pushUniq(out.techStack, `${fw}@${allDeps[fw]}`);
      out.ecosystems.push('node');
    } catch {}
  }

  // Python — pyproject.toml / requirements.txt / Pipfile
  if (exists('pyproject.toml')) {
    const txt = readSafe('pyproject.toml');
    // [project.dependencies] or [tool.poetry.dependencies] — naïve line scan
    const depBlock = txt.match(/\[(?:project|tool\.poetry)\.dependencies\]([\s\S]*?)(?=\n\[|$)/);
    if (depBlock) {
      for (const m of depBlock[1].matchAll(/^\s*([a-zA-Z0-9_\-]+)\s*=/gm)) {
        if (m[1] !== 'python') pushUniq(out.dependencies.production, m[1]);
      }
    }
    pushUniq(out.buildCommands, 'python -m build');
    pushUniq(out.testCommands, 'pytest');
    if (/django/i.test(txt))  pushUniq(out.techStack, 'django');
    if (/flask/i.test(txt))   pushUniq(out.techStack, 'flask');
    if (/fastapi/i.test(txt)) pushUniq(out.techStack, 'fastapi');
    out.ecosystems.push('python');
  } else if (exists('requirements.txt')) {
    for (const line of readSafe('requirements.txt').split('\n')) {
      const m = line.match(/^\s*([a-zA-Z0-9_\-\.]+)/);
      if (m && !line.trim().startsWith('#')) pushUniq(out.dependencies.production, m[1]);
    }
    pushUniq(out.testCommands, 'pytest');
    out.ecosystems.push('python');
  } else if (exists('Pipfile')) {
    out.ecosystems.push('python');
    pushUniq(out.testCommands, 'pytest');
  }

  // Rust — Cargo.toml
  if (exists('Cargo.toml')) {
    const txt = readSafe('Cargo.toml');
    const dep = txt.match(/\[dependencies\]([\s\S]*?)(?=\n\[|$)/);
    const devDep = txt.match(/\[dev-dependencies\]([\s\S]*?)(?=\n\[|$)/);
    if (dep)    for (const m of dep[1].matchAll(/^\s*([a-zA-Z0-9_\-]+)\s*=/gm))    pushUniq(out.dependencies.production, m[1]);
    if (devDep) for (const m of devDep[1].matchAll(/^\s*([a-zA-Z0-9_\-]+)\s*=/gm)) pushUniq(out.dependencies.dev, m[1]);
    pushUniq(out.buildCommands, 'cargo build');
    pushUniq(out.testCommands,  'cargo test');
    out.ecosystems.push('rust');
  }

  // Go — go.mod
  if (exists('go.mod')) {
    const txt = readSafe('go.mod');
    const req = txt.match(/require\s*\(([\s\S]*?)\)/);
    if (req) {
      for (const m of req[1].matchAll(/^\s*([^\s]+)\s+v[\d.]+/gm)) pushUniq(out.dependencies.production, m[1]);
    } else {
      for (const m of txt.matchAll(/^require\s+([^\s]+)\s+v[\d.]+/gm)) pushUniq(out.dependencies.production, m[1]);
    }
    pushUniq(out.buildCommands, 'go build ./...');
    pushUniq(out.testCommands,  'go test ./...');
    out.ecosystems.push('go');
  }

  // Java — pom.xml / build.gradle(.kts)
  if (exists('pom.xml')) {
    const txt = readSafe('pom.xml');
    for (const m of txt.matchAll(/<artifactId>([^<]+)<\/artifactId>/g)) pushUniq(out.dependencies.production, m[1]);
    pushUniq(out.buildCommands, 'mvn package');
    pushUniq(out.testCommands,  'mvn test');
    if (/spring-boot/i.test(txt)) pushUniq(out.techStack, 'spring-boot');
    out.ecosystems.push('java-maven');
  } else if (exists('build.gradle') || exists('build.gradle.kts')) {
    const txt = readSafe(exists('build.gradle.kts') ? 'build.gradle.kts' : 'build.gradle');
    for (const m of txt.matchAll(/(?:implementation|api|compile|testImplementation)[\s(]+["']([^"':]+:[^"':]+)/g)) {
      pushUniq(out.dependencies.production, m[1]);
    }
    const wrapper = exists('gradlew') ? './gradlew' : 'gradle';
    pushUniq(out.buildCommands, `${wrapper} build`);
    pushUniq(out.testCommands,  `${wrapper} test`);
    out.ecosystems.push('java-gradle');
  }

  // Ruby — Gemfile
  if (exists('Gemfile')) {
    const txt = readSafe('Gemfile');
    for (const m of txt.matchAll(/^\s*gem\s+['"]([^'"]+)['"]/gm)) pushUniq(out.dependencies.production, m[1]);
    pushUniq(out.testCommands, 'bundle exec rspec');
    out.ecosystems.push('ruby');
  }

  // PHP — composer.json
  if (exists('composer.json')) {
    try {
      const cj = JSON.parse(readSafe('composer.json'));
      out.dependencies.production.push(...Object.keys(cj.require || {}));
      out.dependencies.dev.push(...Object.keys(cj['require-dev'] || {}));
      if (cj.scripts && cj.scripts.test) pushUniq(out.testCommands, 'composer test');
      out.ecosystems.push('php');
    } catch {}
  }

  // Meta — Claude Code plugin
  if (exists('.claude-plugin/plugin.json')) {
    out.ecosystems.push('meta');
  }

  return out;
}

// ── Directory & file creation ────────────────────────────────────

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function copyFile(src, dest, force = false) {
  if (!fs.existsSync(src)) return { action: 'skip', reason: `源文件不存在: ${src}` };
  ensureDir(path.dirname(dest));
  if (fs.existsSync(dest) && !force) return { action: 'skip', reason: '已存在' };
  fs.copyFileSync(src, dest);
  return { action: force && fs.existsSync(dest) ? 'overwrite' : 'create' };
}

function writeJson(filePath, data, force = false) {
  ensureDir(path.dirname(filePath));
  if (!fs.existsSync(filePath) || force) {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n', 'utf8');
    return { action: force && fs.existsSync(filePath) ? 'overwrite' : 'create' };
  }
  return { action: 'skip', reason: '已存在' };
}

// ── Phase 2: Injection ──────────────────────────────────────────

function injectBaseline(baseline, dryRun, force = false) {
  const results = { created: [], skipped: [], dirs: [] };

  // Create .claude/ root directories
  const dirs = [
    path.join(CLAUDE_DIR, 'agents'),
    path.join(CLAUDE_DIR, 'rules'),
    path.join(CLAUDE_DIR, '.history'),
    path.join(REPO_ROOT, 'docs', '故事任务面板'),
  ];

  for (const dir of dirs) {
    if (dryRun) {
      results.dirs.push({ path: path.relative(REPO_ROOT, dir), action: 'will-create' });
    } else {
      ensureDir(dir);
      results.dirs.push({ path: path.relative(REPO_ROOT, dir), action: 'created' });
    }
  }

  // ── Project-type-aware profile (must precede agent shell generation) ──
  const coderFormula = getCoderFormula(baseline.projectType.type);
  const profilePath = path.join(CLAUDE_DIR, 'project-profile.json');
  const profile = {
    project: baseline.project,
    type: baseline.projectType.type,
    type_label: labelForType(baseline.projectType.type),
    tech_signals: baseline.projectType.indicators,
    coder_formula: coderFormula,
    story_defaults: getStoryDefaults(baseline.projectType.type),
    generated_at: new Date().toISOString(),
    _doc: 'rui init 自动检测的项目画像。story 生成时以此为基准选择目录骨架和 Coder 公式。',
  };

  if (dryRun) {
    results.created.push({ path: path.relative(REPO_ROOT, profilePath), action: 'will-create', source: 'auto-generated' });
  } else {
    const r = writeJson(profilePath, profile);
    if (r.action === 'create') results.created.push({ path: path.relative(REPO_ROOT, profilePath), action: 'created', source: 'auto-generated' });
    else results.skipped.push({ path: path.relative(REPO_ROOT, profilePath), reason: r.reason });
  }

  // Generate project agent shells (high cohesion: project baseline as body;
  // low coupling: links out to plugin role contract instead of copying)
  generateProjectAgents(baseline, profile, dryRun, force, results);

  // Copy rules from project root rules/
  const rulesSrc = path.join(REPO_ROOT, 'rules');
  const rulesDest = path.join(CLAUDE_DIR, 'rules');
  if (fs.existsSync(rulesSrc)) {
    const ruleFiles = fs.readdirSync(rulesSrc).filter(f => f.endsWith('.md'));
    for (const f of ruleFiles) {
      const src = path.join(rulesSrc, f);
      const dest = path.join(rulesDest, f);
      if (dryRun) {
        results.created.push({ path: path.relative(REPO_ROOT, dest), action: force ? 'will-overwrite' : 'will-copy', source: `rules/${f}` });
      } else {
        const r = copyFile(src, dest, force);
        if (r.action === 'create' || r.action === 'overwrite') results.created.push({ path: path.relative(REPO_ROOT, dest), action: r.action === 'overwrite' ? 'overwritten' : 'copied', source: `rules/${f}` });
        else results.skipped.push({ path: path.relative(REPO_ROOT, dest), reason: r.reason });
      }
    }
  }

  // Copy formulas.md (single file — replaces legacy templates/ directory)
  const formulasSrc = path.join(REPO_ROOT, 'skills', 'rui', 'formulas.md');
  const formulasDest = path.join(CLAUDE_DIR, 'formulas.md');
  if (fs.existsSync(formulasSrc)) {
    if (dryRun) {
      results.created.push({ path: path.relative(REPO_ROOT, formulasDest), action: force ? 'will-overwrite' : 'will-copy', source: 'skills/rui/formulas.md' });
    } else {
      const r = copyFile(formulasSrc, formulasDest, force);
      if (r.action === 'create' || r.action === 'overwrite') {
        results.created.push({ path: path.relative(REPO_ROOT, formulasDest), action: r.action === 'overwrite' ? 'overwritten' : 'copied', source: 'skills/rui/formulas.md' });
      } else {
        results.skipped.push({ path: path.relative(REPO_ROOT, formulasDest), reason: r.reason });
      }
    }
  }

  // Copy coder.md (目录生命周期 + 参考文档公式 + 数据契约)
  const coderDocSrc = path.join(REPO_ROOT, 'skills', 'rui', 'coder.md');
  const coderDocDest = path.join(CLAUDE_DIR, 'coder.md');
  if (fs.existsSync(coderDocSrc)) {
    if (dryRun) {
      results.created.push({ path: path.relative(REPO_ROOT, coderDocDest), action: force ? 'will-overwrite' : 'will-copy', source: 'skills/rui/coder.md' });
    } else {
      const r = copyFile(coderDocSrc, coderDocDest, force);
      if (r.action === 'create' || r.action === 'overwrite') {
        results.created.push({ path: path.relative(REPO_ROOT, coderDocDest), action: r.action === 'overwrite' ? 'overwritten' : 'copied', source: 'skills/rui/coder.md' });
      } else {
        results.skipped.push({ path: path.relative(REPO_ROOT, coderDocDest), reason: r.reason });
      }
    }
  }

  // Generate config files
  const mcpSrc = path.join(REPO_ROOT, '.mcp.json');
  const mcpDest = path.join(CLAUDE_DIR, '.mcp.json');
  if (fs.existsSync(mcpSrc)) {
    if (dryRun) {
      results.created.push({ path: path.relative(REPO_ROOT, mcpDest), action: 'will-copy', source: '.mcp.json' });
    } else {
      const r = copyFile(mcpSrc, mcpDest);
      if (r.action === 'create') results.created.push({ path: path.relative(REPO_ROOT, mcpDest), action: 'copied', source: '.mcp.json' });
      else results.skipped.push({ path: path.relative(REPO_ROOT, mcpDest), reason: r.reason });
    }
  }

  const settingsSrc = path.join(REPO_ROOT, 'settings.json');
  const settingsDest = path.join(CLAUDE_DIR, 'settings.json');
  if (fs.existsSync(settingsSrc)) {
    if (dryRun) {
      results.created.push({ path: path.relative(REPO_ROOT, settingsDest), action: 'will-copy', source: 'settings.json' });
    } else {
      const r = copyFile(settingsSrc, settingsDest);
      if (r.action === 'create') results.created.push({ path: path.relative(REPO_ROOT, settingsDest), action: 'copied', source: 'settings.json' });
      else results.skipped.push({ path: path.relative(REPO_ROOT, settingsDest), reason: r.reason });
    }
  }

  // Generate settings.local.json
  const localSettingsPath = path.join(CLAUDE_DIR, 'settings.local.json');
  if (dryRun) {
    results.created.push({ path: path.relative(REPO_ROOT, localSettingsPath), action: 'will-create' });
  } else {
    const r = writeJson(localSettingsPath, {
      _doc: '本地覆盖配置（不入库、不同步）。优先级高于 settings.json。常用场景：个人 API key、本地路径、调试开关。',
      permissions: {},
    });
    if (r.action === 'create') results.created.push({ path: path.relative(REPO_ROOT, localSettingsPath), action: 'created' });
    else results.skipped.push({ path: path.relative(REPO_ROOT, localSettingsPath), reason: r.reason });
  }

  // ── Post-injection: project baseline into shared rules ──
  // (agents/* are now generated as project shells; only rules/code-pipeline.md
  //  remains a verbatim copy that benefits from baseline injection.)

  // Post-process code-pipeline.md with project-specific build/test commands
  const pipelineDest = path.join(CLAUDE_DIR, 'rules', 'code-pipeline.md');
  if (fs.existsSync(pipelineDest) && !dryRun) {
    try {
      let pipelineContent = fs.readFileSync(pipelineDest, 'utf8');
      if (!pipelineContent.includes('<!-- project-baseline-injected -->') || force) {
        if (force && pipelineContent.includes('<!-- project-baseline-injected -->')) {
          pipelineContent = pipelineContent.replace(/\n<!-- project-baseline-injected -->[\s\S]*$/, '');
        }
        const injection = buildPipelineInjection(baseline);
        if (injection) {
          pipelineContent += '\n' + injection;
          fs.writeFileSync(pipelineDest, pipelineContent, 'utf8');
          results.created.push({ path: path.relative(REPO_ROOT, pipelineDest), action: force ? 're-injected' : 'injected', source: '管线基线注入' });
        }
      }
    } catch (e) {
      results.skipped.push({ path: path.relative(REPO_ROOT, pipelineDest), reason: `注入失败: ${e.message}` });
    }
  }

  // Generate .gitignore entries for local-only files
  const gitignorePath = path.join(CLAUDE_DIR, '.gitignore');
  if (!dryRun) {
    const gitignoreEntries = [
      'settings.local.json',
      '.history/',
    ];
    if (!fs.existsSync(gitignorePath)) {
      fs.writeFileSync(gitignorePath, gitignoreEntries.join('\n') + '\n', 'utf8');
      results.created.push({ path: path.relative(REPO_ROOT, gitignorePath), action: 'created', source: '本地文件排除' });
    }
  }

  return results;
}

// ── Project agent shell generation ──────────────────────────────
// 设计：项目下 .claude/agents/*.md 是「薄壳」——保留插件的 frontmatter（让 Claude Code 加载），
// 用外链指向插件契约（低耦合：不复制角色契约文档），主体是 rui init 提取的项目档案
// （高内聚：技术栈、命令、约束都是项目特有信息）。插件升级时项目文件不被覆盖；
// 项目档案变化时仅本机 .claude/ 重新生成。

const PROJECT_AGENT_MARKER = '<!-- rui-init: project-agent-shell -->';
const PLUGIN_AGENTS_LOCAL = '~/.claude/plugins/marketplaces/yry/agents';
const PLUGIN_AGENTS_REMOTE = 'https://github.com/effiy/YrY/blob/main/agents';

/**
 * Split a markdown file into { frontmatter, body }.
 * Frontmatter is the YAML block delimited by `---` at the very top.
 */
function splitFrontmatter(content) {
  if (!content || !content.startsWith('---')) return { frontmatter: '', body: content || '' };
  const end = content.indexOf('\n---', 3);
  if (end < 0) return { frontmatter: '', body: content };
  const fmEnd = end + 4; // include closing '---' line
  const after = content.indexOf('\n', fmEnd);
  return {
    frontmatter: content.slice(0, after >= 0 ? after : fmEnd),
    body: after >= 0 ? content.slice(after + 1) : '',
  };
}

/**
 * Pull a one-line "mantra" from a plugin agent body.
 * Looks for the first `> **口诀：xxx。** ...` blockquote line.
 */
function extractMantra(body) {
  if (!body) return '';
  const m = body.match(/^>\s+\*\*([^*]+)\*\*\s*([^\n]+)/m);
  if (!m) return '';
  return `> **${m[1].trim()}** ${m[2].trim()}`;
}

function bullets(items, fallback = '> 待项目基线补充') {
  if (!items || items.length === 0) return fallback;
  return items.map((s) => `- ${s}`).join('\n');
}

function bulletsCode(items, fallback = '> 待项目基线补充') {
  if (!items || items.length === 0) return fallback;
  return items.map((s) => `- \`${s}\``).join('\n');
}

function bulletsKeyFiles(items, fallback = '> 待项目基线补充') {
  if (!items || items.length === 0) return fallback;
  return items.map((f) => `- \`${f.path}\` — ${f.desc}`).join('\n');
}

function pluginLink(file) {
  return `[插件 agents/${file}](${PLUGIN_AGENTS_REMOTE}/${file})（本地副本：\`${PLUGIN_AGENTS_LOCAL}/${file}\`）`;
}

/**
 * Build a project-scoped agent shell.
 * - Preserves the plugin's frontmatter so Claude Code can load the agent.
 * - Replaces the body with project baseline content + a link to the plugin contract.
 *
 * @param {string} role       - One of: AGENT, pm, coder, tester, reporter, security, self-improve
 * @param {object} pluginSrc  - { frontmatter, body, mantra }
 * @param {object} baseline   - extracted baseline
 * @param {object} profile    - project-profile.json content
 * @returns {string} markdown content
 */
function buildAgentShell(role, pluginSrc, baseline, profile) {
  const file = `${role}.md`;
  const head = [];
  if (pluginSrc.frontmatter) {
    head.push(pluginSrc.frontmatter);
    head.push('');
  }
  head.push(PROJECT_AGENT_MARKER);
  head.push(`<!-- 项目: ${baseline.project} · 类型: ${profile.type_label} · 生成: rui init -->`);
  head.push('');

  const sections = [];

  if (role === 'AGENT') {
    sections.push(`# Agents（项目实例 · ${baseline.project}）`);
    sections.push('');
    if (pluginSrc.mantra) sections.push(pluginSrc.mantra, '');
    sections.push(`> 角色拓扑、共用底线（证据等级 / 影响分析 / 生效标志）见 ${pluginLink('AGENT.md')}。本文件只承载项目特有的角色画像。`);
    sections.push('');
    sections.push('## 项目角色画像');
    sections.push('');
    sections.push('| Agent | 项目侧主要承载 | 项目档案 |');
    sections.push('|-------|--------------|---------|');
    sections.push(`| pm | 故事拆分锚定项目 \`${baseline.project}\` | [pm.md](./pm.md) |`);
    sections.push(`| coder | ${profile.type_label}（公式 \`${profile.coder_formula.text}\`） | [coder.md](./coder.md) |`);
    sections.push('| tester | 项目构建/测试命令 + Gate A/B | [tester.md](./tester.md) |');
    sections.push('| security | 项目安全约束 + 敏感依赖 | [security.md](./security.md) |');
    sections.push('| reporter | 项目文档路径 + 交叉引用 | [reporter.md](./reporter.md) |');
    sections.push('| self-improve | 项目记忆/提案数据源 | [self-improve.md](./self-improve.md) |');
    sections.push('');
    sections.push('## 项目档案');
    sections.push('');
    sections.push(`- 项目: **${baseline.project}**`);
    sections.push(`- 类型: **${profile.type_label}**`);
    if (baseline.projectDescription) sections.push(`- 描述: ${baseline.projectDescription}`);
    if (baseline.techStack.length) sections.push(`- 技术栈: ${baseline.techStack.slice(0, 10).join(', ')}`);
    if (baseline.manifestEcosystems && baseline.manifestEcosystems.length) sections.push(`- 生态: ${baseline.manifestEcosystems.join(', ')}`);
  }

  if (role === 'pm') {
    sections.push(`# pm — 产品决策者（项目实例 · ${baseline.project}）`);
    sections.push('');
    if (pluginSrc.mantra) sections.push(pluginSrc.mantra, '');
    sections.push(`> 角色契约（触发 / 决策面 / 拆故事规则 / 反推探索 / 生效标志）见 ${pluginLink('pm.md')}。本文件只承载项目档案，下游 Agent 据此对齐故事骨架。`);
    sections.push('');
    sections.push('## 项目档案');
    sections.push('');
    sections.push('| 字段 | 值 |');
    sections.push('|------|----|');
    sections.push(`| 项目名 | \`${baseline.project}\` |`);
    sections.push(`| 项目类型 | ${profile.type_label} |`);
    sections.push(`| 故事骨架 | \`${profile.story_defaults.skeleton}\` |`);
    sections.push(`| 必备文件 | ${(profile.story_defaults.required_files || []).join(' / ') || '—'} |`);
    sections.push(`| 跳过文件 | ${(profile.story_defaults.skip_files || []).join(' / ') || '—'} |`);
    sections.push(`| 文档根 | \`docs/故事任务面板/${baseline.project}/<name>/\` |`);
    sections.push(`| 分支前缀 | \`feat/${baseline.project}-<name>\` |`);
    sections.push('');
    if (baseline.projectDescription) {
      sections.push('## 项目描述');
      sections.push('');
      sections.push(baseline.projectDescription);
      sections.push('');
    }
    sections.push('## 项目侧生效标志');
    sections.push('');
    sections.push(`- 故事 §1 引用项目 \`${baseline.project}\` 的角色 / 入口范围`);
    sections.push(`- §4 任务表与 ${profile.type_label} 故事骨架（${(profile.story_defaults.required_files || []).join(' / ')}）一致`);
    sections.push('- 跨故事依赖标注的项目模块在本档案「核心模块」内可索引');
  }

  if (role === 'coder') {
    sections.push(`# coder — 代码实现（项目实例 · ${baseline.project}）`);
    sections.push('');
    if (pluginSrc.mantra) sections.push(pluginSrc.mantra, '');
    sections.push(`> 角色契约（触发 / 工作循环 / 规则 / 审查维度 / 职责边界 / 生效标志）见 ${pluginLink('coder.md')}。本文件只承载项目档案，实现期据此约束。`);
    sections.push('');
    sections.push('## 项目档案');
    sections.push('');
    sections.push('| 字段 | 值 |');
    sections.push('|------|----|');
    sections.push(`| 项目 | \`${baseline.project}\` |`);
    sections.push(`| 项目类型 | ${profile.type_label} |`);
    sections.push(`| Coder 公式 | \`${profile.coder_formula.text}\` |`);
    sections.push(`| 关注点 | ${profile.coder_formula.focus} |`);
    if (baseline.manifestEcosystems && baseline.manifestEcosystems.length) sections.push(`| 生态 | ${baseline.manifestEcosystems.join(', ')} |`);
    sections.push('');
    sections.push('## 技术栈'); sections.push(''); sections.push(bullets(baseline.techStack)); sections.push('');
    sections.push('## 编码规范'); sections.push(''); sections.push(bullets(baseline.codingStandards)); sections.push('');
    sections.push('## 禁止事项'); sections.push(''); sections.push(bullets(baseline.prohibitions)); sections.push('');
    sections.push('## 关键文件'); sections.push(''); sections.push(bulletsKeyFiles(baseline.keyFiles)); sections.push('');
    sections.push('## 核心模块'); sections.push(''); sections.push(bullets(baseline.coreModules)); sections.push('');
    sections.push('## 构建命令'); sections.push(''); sections.push(bulletsCode(baseline.buildCommands)); sections.push('');
    sections.push('## 项目侧生效标志');
    sections.push('');
    sections.push('- 05/06 偏差表逐条对照本档案「编码规范 / 禁止事项」');
    sections.push('- 影响链 §3 二级传递只在本档案「关键文件 / 核心模块」范围内闭合');
    sections.push(`- 实际产物路径与 ${profile.type_label} 故事骨架（${(profile.story_defaults.required_files || []).join(' / ')}）一致`);
  }

  if (role === 'tester') {
    sections.push(`# tester — 质量保证（项目实例 · ${baseline.project}）`);
    sections.push('');
    if (pluginSrc.mantra) sections.push(pluginSrc.mantra, '');
    sections.push(`> 角色契约（触发 / 双 Gate / 用例规则 / 审查维度 / 生效标志）见 ${pluginLink('tester.md')}。本文件只承载项目命令字典，Gate A/B 验证使用。`);
    sections.push('');
    sections.push('## 测试命令'); sections.push(''); sections.push(bulletsCode(baseline.testCommands)); sections.push('');
    sections.push('## 构建命令（验证前置）'); sections.push(''); sections.push(bulletsCode(baseline.buildCommands)); sections.push('');
    sections.push('## 编码规范（测试需遵循）'); sections.push(''); sections.push(bullets(baseline.codingStandards)); sections.push('');
    sections.push('## 项目侧生效标志');
    sections.push('');
    sections.push('- Gate A：04 §6 列出本档案「测试命令」中的具体命令而非占位符');
    sections.push('- Gate B：07 验证日志包含本档案至少一条「构建命令 + 测试命令」实际输出');
  }

  if (role === 'security') {
    sections.push(`# security — 安全专家（项目实例 · ${baseline.project}）`);
    sections.push('');
    if (pluginSrc.mantra) sections.push(pluginSrc.mantra, '');
    sections.push(`> 角色契约（触发 / 注入条件 / 规则 / 审查维度 / 生效标志）见 ${pluginLink('security.md')}。本文件只承载项目特有的攻击面信息。`);
    sections.push('');
    sections.push('## 安全约束'); sections.push(''); sections.push(bullets(baseline.securityConstraints)); sections.push('');
    sections.push('## 技术栈（审查范围）'); sections.push(''); sections.push(bullets(baseline.techStack)); sections.push('');

    const prodDeps = (baseline.dependencies && baseline.dependencies.production) || [];
    const sensitive = ['jsonwebtoken', 'bcrypt', 'crypto', 'helmet', 'cors', 'passport', 'oauth', 'session', 'cookie'];
    const flagged = prodDeps.filter((d) => sensitive.some((s) => d.includes(s)));
    sections.push('## 安全敏感依赖');
    sections.push('');
    if (flagged.length === 0) {
      sections.push(`> 在 ${prodDeps.length} 个生产依赖中未匹配到敏感关键词；故事注入时若引入 auth/session/crypto 类依赖需同步追加。`);
    } else {
      sections.push(`共 ${prodDeps.length} 个生产依赖，下列匹配敏感关键词（${sensitive.join(' / ')}）：`);
      for (const d of flagged) sections.push(`- \`${d}\``);
    }
    sections.push('');
    sections.push('## 部署环境（攻击面）'); sections.push(''); sections.push(bullets(baseline.deploymentInfo));
    sections.push('');
    sections.push('## 项目侧生效标志');
    sections.push('');
    sections.push('- 故事 §3 表头列出本档案「安全约束」中至少一条与故事场景对齐');
    sections.push('- 触发注入条件时 §4 安全任务能映射到本档案「安全敏感依赖」或「攻击面」');
  }

  if (role === 'reporter') {
    sections.push(`# reporter — 过程报告与知识策展（项目实例 · ${baseline.project}）`);
    sections.push('');
    if (pluginSrc.mantra) sections.push(pluginSrc.mantra, '');
    sections.push(`> 角色契约（触发 / 工作面 / 报告骨架 / 审查维度 / 生效标志）见 ${pluginLink('reporter.md')}。本文件只承载项目文档路径与命名规范。`);
    sections.push('');
    sections.push('## 项目文档地址');
    sections.push('');
    sections.push('| 类别 | 路径 |');
    sections.push('|------|------|');
    sections.push(`| 故事面板 | \`docs/故事任务面板/${baseline.project}/<name>/\` |`);
    sections.push(`| 评审三件 | \`02-后端评审.md\` / \`03-前端评审.md\` / \`04-测试评审.md\` |`);
    sections.push(`| 实施报告 | \`05-后端实施报告.md\` / \`06-前端实施报告.md\` |`);
    sections.push(`| 测试报告 | \`07-测试报告.md\` |`);
    sections.push(`| 自改进 | \`08-自改进复盘.md\` |`);
    sections.push(`| 记忆 | \`.memory/execution-memory.jsonl\` / \`.memory/rui-state.json\` |`);
    sections.push(`| 提案 | \`.improvement/proposals.jsonl\` |`);
    sections.push('');
    sections.push('## 项目侧生效标志');
    sections.push('');
    sections.push(`- 三报告交叉引用使用本档案声明的相对路径，不出现绝对路径或 \`docs/<name>/\` 漏 \`${baseline.project}/\` 前缀`);
    sections.push('- 策展 commit 信息含项目名前缀 `' + baseline.project + ':`');
  }

  if (role === 'self-improve') {
    sections.push(`# self-improve — 自改进管线（项目实例 · ${baseline.project}）`);
    sections.push('');
    if (pluginSrc.mantra) sections.push(pluginSrc.mantra, '');
    sections.push(`> 角色契约（触发 / 三段闭环 / D0–D7 诊断 / 提案矩阵 / 生效标志）见 ${pluginLink('self-improve.md')}。本文件只承载项目数据源与基线锚点。`);
    sections.push('');
    sections.push('## 项目基线锚点（诊断依据）');
    sections.push('');
    sections.push('| 锚点 | 路径 |');
    sections.push('|------|------|');
    sections.push('| 哲学 | [`CLAUDE.md`](../../CLAUDE.md) |');
    sections.push('| 系统视图 | [`README.md`](../../README.md) |');
    sections.push('| 项目画像 | [`.claude/project-profile.json`](../project-profile.json) |');
    sections.push('| 共用规则 | [`.claude/rules/`](../rules/) |');
    sections.push('| 角色画像 | [`.claude/agents/`](./AGENT.md) |');
    sections.push('');
    sections.push('## 项目数据源');
    sections.push('');
    sections.push(`- 记忆: \`docs/故事任务面板/${baseline.project}/<name>/.memory/execution-memory.jsonl\``);
    sections.push(`- 状态: \`docs/故事任务面板/${baseline.project}/<name>/.memory/rui-state.json\``);
    sections.push(`- 提案: \`docs/故事任务面板/${baseline.project}/<name>/.improvement/proposals.jsonl\``);
    sections.push(`- init 记忆: \`docs/故事任务面板/.init-memory.json\``);
    sections.push('');
    sections.push('## 项目侧生效标志');
    sections.push('');
    sections.push('- 08 §0 基线校准表引用本档案三类锚点（CLAUDE.md / project-profile / rules）');
    sections.push(`- 提案的「类型」字段与项目类型 \`${profile.type}\` 适配（前端不出 backend-only 提案）`);
  }

  return head.join('\n') + sections.join('\n') + '\n';
}

/**
 * Generate all 7 project agent shells under .claude/agents/.
 * Replaces the previous "verbatim copy + tail injection" approach.
 */
function generateProjectAgents(baseline, profile, dryRun, force, results) {
  const agentsSrc = path.join(REPO_ROOT, 'agents');
  const agentsDest = path.join(CLAUDE_DIR, 'agents');
  const roles = ['AGENT', 'pm', 'coder', 'tester', 'reporter', 'security', 'self-improve'];

  for (const role of roles) {
    const file = `${role}.md`;
    const srcPath = path.join(agentsSrc, file);
    const destPath = path.join(agentsDest, file);
    const rel = path.relative(REPO_ROOT, destPath);

    if (!fs.existsSync(srcPath)) {
      results.skipped.push({ path: rel, reason: `插件源文件不存在: agents/${file}` });
      continue;
    }

    // Check if dest is a project-shell (regenerate ok) or user-customized (preserve)
    const exists = fs.existsSync(destPath);
    if (exists && !force) {
      const existing = fs.readFileSync(destPath, 'utf8');
      const isOurShell = existing.includes(PROJECT_AGENT_MARKER);
      if (!isOurShell) {
        // User-customized — never overwrite without --force
        results.skipped.push({ path: rel, reason: '已存在且非 rui init 生成（使用 --force 覆盖）' });
        continue;
      }
      // Our shell exists — skip unless --force, since baseline may have changed
      // but user might have added project-specific notes below the shell
      results.skipped.push({ path: rel, reason: '已存在 rui init 薄壳（--force 重新生成以同步基线）' });
      continue;
    }

    const srcContent = fs.readFileSync(srcPath, 'utf8');
    const fm = splitFrontmatter(srcContent);
    const mantra = extractMantra(fm.body);
    const shell = buildAgentShell(role, { frontmatter: fm.frontmatter, body: fm.body, mantra }, baseline, profile);

    if (dryRun) {
      results.created.push({ path: rel, action: force && exists ? 'will-overwrite' : 'will-create', source: `项目薄壳 ← agents/${file}` });
    } else {
      ensureDir(path.dirname(destPath));
      fs.writeFileSync(destPath, shell, 'utf8');
      results.created.push({ path: rel, action: force && exists ? 'regenerated' : 'generated', source: `项目薄壳 ← agents/${file}` });
    }
  }
}

// ── Deduplication helpers ────────────────────────────────────────

/**
 * Check if a string (item) is already semantically present in existing content.
 * Uses normalized substring matching to avoid injecting duplicate information.
 * @param {string} item - The item to check
 * @param {string} existingContent - The existing file content to check against
 * @returns {boolean} true if item is already present
 */
function isAlreadyPresent(item, existingContent) {
  if (!item || !existingContent) return false;
  // Normalize: lowercase, collapse whitespace, strip markdown formatting
  const normalize = (s) => s.toLowerCase().replace(/[*_`#\-|>]/g, '').replace(/\s+/g, ' ').trim();
  const normalizedItem = normalize(item);
  const normalizedContent = normalize(existingContent);

  // Direct substring match (core content already mentioned)
  if (normalizedContent.includes(normalizedItem)) return true;

  // For short items (< 15 chars), require exact match
  if (normalizedItem.length < 15) return false;

  // For longer items, check if key phrases (first 3+ words) are present
  const keyPhrase = normalizedItem.split(' ').slice(0, 4).join(' ');
  if (keyPhrase.length >= 8 && normalizedContent.includes(keyPhrase)) return true;

  return false;
}

/**
 * Filter a list of items, keeping only those NOT already present in existing content.
 * @param {string[]} items - Items to filter
 * @param {string} existingContent - Existing file content
 * @returns {string[]} Items that are genuinely new (complementary)
 */
function filterNewItems(items, existingContent) {
  if (!existingContent || !items || items.length === 0) return items;
  return items.filter(item => !isAlreadyPresent(item, existingContent));
}

// ── Injection content builders ──────────────────────────────────
// 仅 rules/code-pipeline.md 的注入保留：rules 是跨 agent 共用约束，按基线补充更合适。
// agents/* 的注入在 1.15 改为「项目薄壳」（见 buildAgentShell / generateProjectAgents），
// 项目特有信息直接构成主体内容，不再做尾部追加。

function buildPipelineInjection(baseline) {
  // Read existing content from the target file to avoid duplication
  const pipelineDest = path.join(CLAUDE_DIR, 'rules', 'code-pipeline.md');
  const existingContent = fs.existsSync(pipelineDest) ? fs.readFileSync(pipelineDest, 'utf8') : '';

  const lines = ['<!-- project-baseline-injected -->'];
  let hasContent = false;

  const newBuildCmds = filterNewItems(baseline.buildCommands, existingContent);
  const newTestCmds = filterNewItems(baseline.testCommands, existingContent);
  if (newBuildCmds.length > 0 || newTestCmds.length > 0) {
    lines.push('');
    lines.push('## 基线补充：构建与验证命令');
    lines.push('');
    lines.push('> 以下命令从项目基线文件提取，与插件已有内容互补。Gate B 验证阶段使用。');
    lines.push('');
    if (newBuildCmds.length > 0) {
      lines.push('**构建:**');
      for (const cmd of newBuildCmds) {
        lines.push(`- \`${cmd}\``);
      }
    }
    if (newTestCmds.length > 0) {
      lines.push('');
      lines.push('**测试:**');
      for (const cmd of newTestCmds) {
        lines.push(`- \`${cmd}\``);
      }
    }
    hasContent = true;
  }

  const newProhibitions = filterNewItems(baseline.prohibitions, existingContent);
  if (newProhibitions.length > 0) {
    lines.push('');
    lines.push('## 基线补充：禁止事项');
    lines.push('');
    for (const p of newProhibitions) {
      lines.push(`- ${p}`);
    }
    hasContent = true;
  }

  if (!hasContent) return null;
  lines.push('');
  return lines.join('\n');
}

function getCoderFormula(type) {
  // Delegate to shared implementation in constants.js
  return C.getCoderFormula(type);
}

function getStoryDefaults(type) {
  const defaults = {
    frontend: { skeleton: 'frontend-only', required_files: ['01', '03', '04', '06', '07', '08'], skip_files: ['02', '05'] },
    backend: { skeleton: 'backend-only', required_files: ['01', '02', '04', '05', '07', '08'], skip_files: ['03', '06'] },
    fullstack: { skeleton: 'fullstack', required_files: ['01', '02', '03', '04', '05', '06', '07', '08'], skip_files: [] },
    meta: { skeleton: 'fullstack', required_files: ['01', '02', '03', '04', '05', '06', '07', '08'], skip_files: [] },
  };
  return defaults[type] || defaults.meta;
}

// ── Phase 3: 8-item readiness check ─────────────────────────────

function runReadinessCheck() {
  const results = [];
  let allPassed = true;

  for (const [name, check] of Object.entries(CHECKS).sort((a, b) => a[1].order - b[1].order)) {
    let result;
    try {
      if (typeof check.validate === 'function') {
        if (fs.existsSync(check.file)) {
          const isDir = fs.statSync(check.file).isDirectory();
          if (isDir) {
            result = check.validate();
          } else {
            const content = fs.readFileSync(check.file, 'utf8');
            result = check.validate(content);
          }
        } else {
          result = { ok: false, detail: `文件/目录不存在: ${check.file}` };
        }
      }
    } catch (e) {
      result = { ok: false, detail: `检查异常: ${e.message}` };
    }

    if (!result.ok) allPassed = false;
    results.push({
      order: check.order,
      name,
      description: check.description,
      ok: result.ok,
      detail: result.detail,
      missing: result.missing || [],
    });
  }

  return { results, allPassed };
}

// ── Phase 4: Executive memory record ─────────────────────────────

function recordInitMemory(baseline, checkResults, dryRun) {
  if (dryRun) return;
  const storyboardDir = path.join(REPO_ROOT, 'docs', '故事任务面板');
  ensureDir(storyboardDir);

  const memoryEntry = {
    session_id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    timestamp: new Date().toISOString(),
    story_name: 'rui-init',
    feature: '项目初始化',
    description: `rui init 基线注入完成。项目类型: ${baseline.projectType.type}。${checkResults.allPassed ? '8 项检查全部通过' : `${checkResults.results.filter(r => !r.ok).length} 项未通过`}。`,
    planned_change_level: 'T1',
    actual_change_level: 'T1',
    phase_transitions: [{ from: null, to: '基线注入', timestamp: new Date().toISOString(), duration_ms: 0 }],
    update_context: 'rui init',
    agents_called: ['pm'],
    quality_issues: { P0: checkResults.results.filter(r => !r.ok).map(r => `${r.name}: ${r.detail}`), P1: [], P2: [] },
    bad_cases: [],
    was_blocked: !checkResults.allPassed,
    block_reason: checkResults.allPassed ? null : checkResults.results.filter(r => !r.ok).map(r => r.name).join(', '),
  };

  // Write as a standalone record (not per-story, since init is project-level)
  const memoryFile = path.join(storyboardDir, '.init-memory.json');
  fs.writeFileSync(memoryFile, JSON.stringify(memoryEntry, null, 2), 'utf8');
}

// ── Output ──────────────────────────────────────────────────────

function printHuman(baseline, injectResults, checkResults) {
  console.log('# rui init\n');

  // Phase 1: Baseline
  console.log('## 基线提取\n');
  console.log(`- 项目: **${baseline.project}**`);
  if (baseline.projectDescription) console.log(`- 描述: ${baseline.projectDescription}`);
  console.log(`- 类型: **${labelForType(baseline.projectType.type)}** (前端信号=${baseline.projectType.frontendScore}, 后端信号=${baseline.projectType.backendScore})`);
  if (baseline.projectType.indicators.length > 0) {
    console.log(`- 技术信号: ${baseline.projectType.indicators.join(', ')}`);
  }
  if (baseline.techStack.length > 0) {
    console.log(`- 技术栈: ${baseline.techStack.join(', ')}`);
  }
  if (Object.keys(baseline.philosophy).length > 0) {
    console.log(`- 哲学: ${Object.keys(baseline.philosophy).length} 条公理/原则/准则`);
  }
  if (baseline.codingStandards.length > 0) {
    console.log(`- 编码规范: ${baseline.codingStandards.length} 条`);
  }
  if (baseline.prohibitions.length > 0) {
    console.log(`- 禁止事项: ${baseline.prohibitions.length} 条`);
  }
  if (baseline.securityConstraints.length > 0) {
    console.log(`- 安全约束: ${baseline.securityConstraints.length} 条`);
  }
  if (baseline.keyFiles.length > 0) {
    console.log(`- 关键文件: ${baseline.keyFiles.length} 个`);
  }
  if (baseline.coreModules.length > 0) {
    console.log(`- 核心模块: ${baseline.coreModules.length} 个`);
  }
  if (Object.keys(baseline.directoryStructure).length > 0) {
    console.log(`- 目录: ${Object.keys(baseline.directoryStructure).length} 个关键路径`);
  }
  if (baseline.buildCommands.length > 0) {
    console.log(`- 构建命令: ${baseline.buildCommands.length} 条`);
  }
  if (baseline.testCommands.length > 0) {
    console.log(`- 测试命令: ${baseline.testCommands.length} 条`);
  }
  console.log();

  // Phase 2: Injection
  console.log('## 基线注入（互补模式）\n');
  console.log('> 注入内容以项目基线文档为数据基础，仅补充插件文件中未覆盖的信息。\n');
  const created = injectResults.created.filter(i => i.action !== 'will-copy' && i.action !== 'will-create');
  const willCreate = injectResults.created.filter(i => i.action === 'will-copy' || i.action === 'will-create');
  const skipped = injectResults.skipped;

  if (created.length > 0) {
    console.log(`已创建 ${created.length} 项：`);
    for (const item of created) {
      const source = item.source ? ` ← ${item.source}` : '';
      console.log(`  + ${item.path}${source}`);
    }
  }
  if (willCreate.length > 0) {
    console.log(`将创建 ${willCreate.length} 项 (dry-run)：`);
    for (const item of willCreate) {
      const source = item.source ? ` ← ${item.source}` : '';
      console.log(`  ~ ${item.path}${source}`);
    }
  }
  if (skipped.length > 0) {
    console.log(`跳过 ${skipped.length} 项（已存在）`);
  }
  if (injectResults.dirs.length > 0) {
    const createdDirs = injectResults.dirs.filter(d => d.action === 'created').length;
    const willDirs = injectResults.dirs.filter(d => d.action === 'will-create').length;
    if (createdDirs > 0) console.log(`创建 ${createdDirs} 个目录`);
    if (willDirs > 0) console.log(`将创建 ${willDirs} 个目录 (dry-run)`);
  }
  console.log();

  // Phase 3: Readiness check
  console.log('## 就绪检查 (8 项)\n');
  console.log('| # | 检查项 | 状态 | 说明 |');
  console.log('|---|--------|------|------|');
  for (const r of checkResults.results) {
    const status = r.ok ? '✅' : '❌';
    console.log(`| ${r.order} | ${r.name} | ${status} | ${r.detail} |`);
  }
  console.log();

  const passed = checkResults.results.filter(r => r.ok).length;
  const failed = checkResults.results.filter(r => !r.ok).length;
  console.log(`**结果: ${passed}/8 通过**${failed > 0 ? ` — ${failed} 项未通过需修复` : ' — 全部就绪'}`);
  console.log();

  // Phase 4: Next steps
  console.log('## 下一步\n');
  if (failed > 0) {
    console.log('修复未通过项后重新运行 `/rui init`。');
  } else {
    console.log('项目基线就绪。开始第一个故事：');
    console.log('- `/rui doc "需求描述"` — 需求拆分 + 文档管线');
    console.log('- `/rui doc --from-code` — 从现有代码逆向生成文档');
    console.log('- `/rui` — 获取任务推荐');
  }
}

function printJson(baseline, injectResults, checkResults) {
  const output = {
    timestamp: new Date().toISOString(),
    project: baseline.project,
    project_type: baseline.projectType,
    baseline: {
      project_description: baseline.projectDescription,
      philosophy_keys: Object.keys(baseline.philosophy),
      tech_stack: baseline.techStack,
      coding_standards: baseline.codingStandards,
      prohibitions: baseline.prohibitions,
      security_constraints: baseline.securityConstraints,
      key_files: baseline.keyFiles,
      core_modules: baseline.coreModules,
      directory_keys: Object.keys(baseline.directoryStructure),
      build_commands: baseline.buildCommands,
      test_commands: baseline.testCommands,
      deployment_info: baseline.deploymentInfo,
      dependencies: baseline.dependencies,
    },
    injection: {
      created: injectResults.created.length,
      skipped: injectResults.skipped.length,
      dirs: injectResults.dirs.length,
      details: {
        created: injectResults.created,
        skipped: injectResults.skipped,
        dirs: injectResults.dirs,
      },
    },
    readiness_check: {
      all_passed: checkResults.allPassed,
      passed: checkResults.results.filter(r => r.ok).length,
      failed: checkResults.results.filter(r => !r.ok).length,
      items: checkResults.results.map(r => ({
        order: r.order,
        name: r.name,
        ok: r.ok,
        detail: r.detail,
      })),
    },
    next_steps: checkResults.allPassed
      ? ['/rui doc "需求描述"', '/rui doc --from-code', '/rui']
      : ['修复未通过项', '重新运行 /rui init'],
  };
  console.log(JSON.stringify(output, null, 2));
}

function labelForType(type) {
  // Delegate to shared implementation in constants.js
  return C.labelForType(type);
}

// ── Main ────────────────────────────────────────────────────────

async function main() {
  const args = process.argv.slice(2);
  const jsonMode = args.includes('--json');
  const dryRun = args.includes('--dry-run');
  const force = args.includes('--force');

  if (args.includes('--help') || args.includes('-h')) {
    console.log('用法: node skills/rui/scripts/init.js [选项]');
    console.log('');
    console.log('选项:');
    console.log('  --json       JSON 格式输出');
    console.log('  --dry-run    仅检查，不写入文件');
    console.log('  --force      重新生成项目薄壳并覆盖公共物料');
    console.log('');
    console.log('流程: 基线提取 → 项目薄壳生成（agents）+ 公共物料复制 + rules 互补注入 → 就绪检查(8 项)');
    console.log('');
    console.log('--force 模式：覆盖标记为 rui init 薄壳的 .claude/agents/*.md（不动用户自定义文件），');
    console.log('整文件刷新 .claude/rules/、formulas.md、coder.md、配置文件，并重新执行 rules 注入。');
    console.log('用户在生成的薄壳上手工补充的内容会被覆盖；如需保留请删除 <!-- rui-init: project-agent-shell --> 标记。');
    process.exit(0);
  }

  // Phase 1: Baseline extraction
  const baseline = extractBaseline();

  // Phase 2: Baseline injection
  const injectResults = injectBaseline(baseline, dryRun, force);

  // Phase 3: 8-item readiness check
  const checkResults = runReadinessCheck();

  // Phase 4: Record memory & output
  recordInitMemory(baseline, checkResults, dryRun);

  if (jsonMode) {
    printJson(baseline, injectResults, checkResults);
  } else {
    printHuman(baseline, injectResults, checkResults);
  }

  // Exit with appropriate code
  process.exit(checkResults.allPassed ? 0 : 1);
}

main().catch(err => { console.error(err); process.exit(1); });
