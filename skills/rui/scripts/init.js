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
  'templates/': {
    order: 5,
    description: '5 类文档模板目录（故事任务面板 + 组件文档 + 接口文档 + 页面文档 + 领域模型）',
    file: path.join(CLAUDE_DIR, 'templates'),
    validate() {
      const requiredDirs = ['故事任务面板', '组件文档', '接口文档', '页面文档', '领域模型'];
      const storyFiles = [
        '01-故事任务模板.md', '02-后端技术评审模板.md', '03-前端技术评审模板.md',
        '04-测试用例评审模板.md', '05-后端实施报告模板.md', '06-前端实施报告模板.md',
        '07-测试用例报告模板.md', '08-自改进复盘模板.md',
      ];
      const refFiles = ['00-索引.md', '01-', '02-', '03-', '04-'];
      const missing = [];

      // Check subdirectories exist
      for (const dir of requiredDirs) {
        const dirPath = path.join(CLAUDE_DIR, 'templates', dir);
        if (!fs.existsSync(dirPath)) { missing.push(`${dir}/`); continue; }
        // Check story templates have all 8 files
        if (dir === '故事任务面板') {
          for (const f of storyFiles) {
            const fp = path.join(dirPath, f);
            if (!fs.existsSync(fp)) missing.push(`${dir}/${f}`);
            else {
              const content = fs.readFileSync(fp, 'utf8');
              if (content.trim().length < C.MIN_TEMPLATE_CONTENT_LENGTH) missing.push(`${dir}/${f}(内容过短)`);
            }
          }
        } else {
          // Reference doc templates: check 00-04 exist
          const files = fs.readdirSync(dirPath).filter(f => f.endsWith('.md'));
          if (files.length < 5) missing.push(`${dir}/(${files.length}/5 文件)`);
        }
      }
      const total = requiredDirs.length;
      return { ok: missing.length === 0, missing, detail: missing.length === 0 ? `全部 ${total} 类模板目录完整` : `缺失/异常: ${missing.join(', ')}` };
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
    description: '.claude/ 目录结构完整（agents/ + rules/ + templates/ + settings.json + .mcp.json + settings.local.json）',
    file: CLAUDE_DIR,
    validate() {
      const required = [
        'agents/', 'rules/', 'templates/',
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
    if (descMatch) baseline.projectDescription = descMatch[1].trim();

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

  // ── 新增：从 package.json 提取依赖和脚本 ──
  const pkgPath = path.join(REPO_ROOT, 'package.json');
  if (fs.existsSync(pkgPath)) {
    try {
      const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
      baseline.dependencies = {
        production: Object.keys(pkg.dependencies || {}),
        dev: Object.keys(pkg.devDependencies || {}),
      };
      if (pkg.scripts) {
        if (pkg.scripts.build && !baseline.buildCommands.includes(`npm run build`)) baseline.buildCommands.push(`npm run build`);
        if (pkg.scripts.test && !baseline.testCommands.includes(`npm test`)) baseline.testCommands.push(`npm test`);
        if (pkg.scripts.lint && !baseline.buildCommands.includes(`npm run lint`)) baseline.buildCommands.push(`npm run lint`);
        if (pkg.scripts.dev && !baseline.buildCommands.includes(`npm run dev`)) baseline.buildCommands.push(`npm run dev`);
      }
      // Extract tech stack from dependencies
      const allDeps = { ...pkg.dependencies, ...pkg.devDependencies };
      const knownFrameworks = ['react', 'vue', 'angular', 'svelte', 'next', 'nuxt', 'express', 'koa', 'fastify', 'nestjs', 'django', 'flask', 'spring'];
      for (const fw of knownFrameworks) {
        if (allDeps[fw] && !baseline.techStack.includes(fw)) {
          baseline.techStack.push(`${fw}@${allDeps[fw]}`);
        }
      }
    } catch {}
  }

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

function copyDir(srcDir, destDir) {
  const results = [];
  if (!fs.existsSync(srcDir)) return [{ action: 'skip', reason: `源目录不存在: ${srcDir}` }];
  ensureDir(destDir);
  const entries = fs.readdirSync(srcDir, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.isDirectory()) {
      results.push(...copyDir(path.join(srcDir, entry.name), path.join(destDir, entry.name)));
    } else {
      results.push(copyFile(path.join(srcDir, entry.name), path.join(destDir, entry.name)));
    }
  }
  return results;
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
    path.join(CLAUDE_DIR, 'templates'),
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

  // Copy agents from project root agents/
  const agentsSrc = path.join(REPO_ROOT, 'agents');
  const agentsDest = path.join(CLAUDE_DIR, 'agents');
  if (fs.existsSync(agentsSrc)) {
    const agentFiles = fs.readdirSync(agentsSrc).filter(f => f.endsWith('.md'));
    for (const f of agentFiles) {
      const src = path.join(agentsSrc, f);
      const dest = path.join(agentsDest, f);
      if (dryRun) {
        results.created.push({ path: path.relative(REPO_ROOT, dest), action: force ? 'will-overwrite' : 'will-copy', source: `agents/${f}` });
      } else {
        const r = copyFile(src, dest, force);
        if (r.action === 'create' || r.action === 'overwrite') results.created.push({ path: path.relative(REPO_ROOT, dest), action: r.action === 'overwrite' ? 'overwritten' : 'copied', source: `agents/${f}` });
        else results.skipped.push({ path: path.relative(REPO_ROOT, dest), reason: r.reason });
      }
    }
  }

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

  // Copy templates (recursive — preserves subdirectory structure)
  const templatesSrc = path.join(REPO_ROOT, 'skills', 'rui', 'templates');
  const templatesDest = path.join(CLAUDE_DIR, 'templates');
  if (fs.existsSync(templatesSrc)) {
    if (dryRun) {
      results.created.push({ path: path.relative(REPO_ROOT, templatesDest), action: 'will-copy', source: 'skills/rui/templates/ (recursive)' });
    } else {
      const copyResults = copyDir(templatesSrc, templatesDest);
      for (const r of copyResults) {
        if (r.action === 'create' || r.action === 'overwrite') results.created.push({ path: 'templates/', action: 'copied', source: 'skills/rui/templates/' });
        else if (r.action === 'skip') results.skipped.push({ path: 'templates/', reason: r.reason });
      }
      if (copyResults.filter(r => r.action === 'create').length > 0) {
        results.created.push({ path: path.relative(REPO_ROOT, templatesDest), action: 'copied', source: `skills/rui/templates/ (${copyResults.filter(r => r.action === 'create').length} files)` });
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

  // ── Project-type-aware customization ──

  // Generate project-profile.json with detected type and conventions
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

  // Post-process coder.md with project-type-specific formula
  const coderDest = path.join(CLAUDE_DIR, 'agents', 'coder.md');
  if (fs.existsSync(coderDest) && !dryRun) {
    try {
      let coderContent = fs.readFileSync(coderDest, 'utf8');
      if (!coderContent.includes('<!-- project-type-injected -->') || force) {
        // Remove old injection if force re-injecting
        if (force && coderContent.includes('<!-- project-type-injected -->')) {
          coderContent = coderContent.replace(/<!-- project-type-injected -->[\s\S]*?(?=## 触发)/, '');
        }
        const injection = buildCoderInjection(baseline, profile);
        coderContent = coderContent.replace(/(## 触发)/, injection + '\n$1');
        fs.writeFileSync(coderDest, coderContent, 'utf8');
        results.created.push({ path: path.relative(REPO_ROOT, coderDest), action: force ? 're-injected' : 'injected', source: `项目基线注入` });
      }
    } catch (e) {
      results.skipped.push({ path: path.relative(REPO_ROOT, coderDest), reason: `注入失败: ${e.message}` });
    }
  }

  // Post-process tester.md with project-specific test commands
  const testerDest = path.join(CLAUDE_DIR, 'agents', 'tester.md');
  if (fs.existsSync(testerDest) && !dryRun) {
    try {
      let testerContent = fs.readFileSync(testerDest, 'utf8');
      if (!testerContent.includes('<!-- project-baseline-injected -->') || force) {
        if (force && testerContent.includes('<!-- project-baseline-injected -->')) {
          testerContent = testerContent.replace(/<!-- project-baseline-injected -->[\s\S]*?(?=## 触发)/, '');
        }
        const injection = buildTesterInjection(baseline);
        if (injection) {
          testerContent = testerContent.replace(/(## 触发)/, injection + '\n$1');
          fs.writeFileSync(testerDest, testerContent, 'utf8');
          results.created.push({ path: path.relative(REPO_ROOT, testerDest), action: force ? 're-injected' : 'injected', source: '测试基线注入' });
        }
      }
    } catch (e) {
      results.skipped.push({ path: path.relative(REPO_ROOT, testerDest), reason: `注入失败: ${e.message}` });
    }
  }

  // Post-process security.md with project-specific constraints
  const securityDest = path.join(CLAUDE_DIR, 'agents', 'security.md');
  if (fs.existsSync(securityDest) && !dryRun) {
    try {
      let secContent = fs.readFileSync(securityDest, 'utf8');
      if (!secContent.includes('<!-- project-baseline-injected -->') || force) {
        if (force && secContent.includes('<!-- project-baseline-injected -->')) {
          secContent = secContent.replace(/<!-- project-baseline-injected -->[\s\S]*?(?=## 触发)/, '');
        }
        const injection = buildSecurityInjection(baseline);
        if (injection) {
          secContent = secContent.replace(/(## 触发)/, injection + '\n$1');
          fs.writeFileSync(securityDest, secContent, 'utf8');
          results.created.push({ path: path.relative(REPO_ROOT, securityDest), action: force ? 're-injected' : 'injected', source: '安全基线注入' });
        }
      }
    } catch (e) {
      results.skipped.push({ path: path.relative(REPO_ROOT, securityDest), reason: `注入失败: ${e.message}` });
    }
  }

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

/**
 * Filter key-value items (like keyFiles with path+desc).
 * @param {Array<{path: string, desc: string}>} items
 * @param {string} existingContent
 * @returns {Array<{path: string, desc: string}>}
 */
function filterNewKeyFiles(items, existingContent) {
  if (!existingContent || !items || items.length === 0) return items;
  return items.filter(f => !isAlreadyPresent(f.path, existingContent));
}

// ── Injection content builders ──────────────────────────────────

function buildCoderInjection(baseline, profile) {
  // Read existing content from the target file to avoid duplication
  const coderDest = path.join(CLAUDE_DIR, 'agents', 'coder.md');
  const existingContent = fs.existsSync(coderDest) ? fs.readFileSync(coderDest, 'utf8') : '';

  const lines = ['<!-- project-type-injected -->'];

  // Summary line — always inject (lightweight, provides quick reference)
  lines.push(`> **项目**: ${baseline.project} · **类型**: ${profile.type_label} · **Coder 公式**: \`${profile.coder_formula.text}\` · **关注**: ${profile.coder_formula.focus}`);

  // Only inject sections with genuinely new (complementary) content
  const newTechStack = filterNewItems(baseline.techStack, existingContent);
  if (newTechStack.length > 0) {
    lines.push('');
    lines.push('## 基线补充：技术栈');
    lines.push('');
    for (const t of newTechStack) {
      lines.push(`- ${t}`);
    }
  }

  const newStandards = filterNewItems(baseline.codingStandards, existingContent);
  if (newStandards.length > 0) {
    lines.push('');
    lines.push('## 基线补充：编码规范');
    lines.push('');
    for (const s of newStandards) {
      lines.push(`- ${s}`);
    }
  }

  const newProhibitions = filterNewItems(baseline.prohibitions, existingContent);
  if (newProhibitions.length > 0) {
    lines.push('');
    lines.push('## 基线补充：禁止事项');
    lines.push('');
    for (const p of newProhibitions) {
      lines.push(`- ${p}`);
    }
  }

  const newKeyFiles = filterNewKeyFiles(baseline.keyFiles, existingContent);
  if (newKeyFiles.length > 0) {
    lines.push('');
    lines.push('## 基线补充：关键文件');
    lines.push('');
    for (const f of newKeyFiles) {
      lines.push(`- \`${f.path}\` — ${f.desc}`);
    }
  }

  const newModules = filterNewItems(baseline.coreModules, existingContent);
  if (newModules.length > 0) {
    lines.push('');
    lines.push('## 基线补充：核心模块');
    lines.push('');
    for (const m of newModules) {
      lines.push(`- ${m}`);
    }
  }

  const newBuildCmds = filterNewItems(baseline.buildCommands, existingContent);
  if (newBuildCmds.length > 0) {
    lines.push('');
    lines.push('## 基线补充：构建命令');
    lines.push('');
    for (const cmd of newBuildCmds) {
      lines.push(`- \`${cmd}\``);
    }
  }

  // If no complementary content was found, return minimal injection (just the summary)
  if (lines.length <= 2) {
    lines.push('');
    lines.push('> 基线信息已在插件文件中完整覆盖，无需补充注入。');
  }

  lines.push('');
  return lines.join('\n');
}

function buildTesterInjection(baseline) {
  // Read existing content from the target file to avoid duplication
  const testerDest = path.join(CLAUDE_DIR, 'agents', 'tester.md');
  const existingContent = fs.existsSync(testerDest) ? fs.readFileSync(testerDest, 'utf8') : '';

  const lines = ['<!-- project-baseline-injected -->'];
  let hasContent = false;

  const newTestCmds = filterNewItems(baseline.testCommands, existingContent);
  if (newTestCmds.length > 0) {
    lines.push('');
    lines.push('## 基线补充：测试命令');
    lines.push('');
    for (const cmd of newTestCmds) {
      lines.push(`- \`${cmd}\``);
    }
    hasContent = true;
  }

  const newBuildCmds = filterNewItems(baseline.buildCommands, existingContent);
  if (newBuildCmds.length > 0) {
    lines.push('');
    lines.push('## 基线补充：构建命令');
    lines.push('');
    for (const cmd of newBuildCmds) {
      lines.push(`- \`${cmd}\``);
    }
    hasContent = true;
  }

  const newStandards = filterNewItems(baseline.codingStandards, existingContent);
  if (newStandards.length > 0) {
    lines.push('');
    lines.push('## 基线补充：编码规范（测试需遵循）');
    lines.push('');
    for (const s of newStandards) {
      lines.push(`- ${s}`);
    }
    hasContent = true;
  }

  if (!hasContent) return null;
  lines.push('');
  return lines.join('\n');
}

function buildSecurityInjection(baseline) {
  // Read existing content from the target file to avoid duplication
  const securityDest = path.join(CLAUDE_DIR, 'agents', 'security.md');
  const existingContent = fs.existsSync(securityDest) ? fs.readFileSync(securityDest, 'utf8') : '';

  const lines = ['<!-- project-baseline-injected -->'];
  let hasContent = false;

  const newConstraints = filterNewItems(baseline.securityConstraints, existingContent);
  if (newConstraints.length > 0) {
    lines.push('');
    lines.push('## 基线补充：安全约束');
    lines.push('');
    for (const c of newConstraints) {
      lines.push(`- ${c}`);
    }
    hasContent = true;
  }

  const newTechStack = filterNewItems(baseline.techStack, existingContent);
  if (newTechStack.length > 0) {
    lines.push('');
    lines.push('## 基线补充：技术栈（安全审查范围）');
    lines.push('');
    for (const t of newTechStack) {
      lines.push(`- ${t}`);
    }
    hasContent = true;
  }

  const prodDeps = baseline.dependencies.production || [];
  if (prodDeps.length > 0) {
    // Only highlight security-sensitive deps that aren't already mentioned
    const secSensitive = ['jsonwebtoken', 'bcrypt', 'crypto', 'helmet', 'cors', 'passport', 'oauth', 'session', 'cookie'];
    const highlighted = prodDeps.filter(d => secSensitive.some(s => d.includes(s)));
    const newHighlighted = filterNewItems(highlighted, existingContent);
    if (newHighlighted.length > 0) {
      lines.push('');
      lines.push('## 基线补充：安全敏感依赖');
      lines.push('');
      lines.push(`共 ${prodDeps.length} 个生产依赖。以下为安全敏感项（未在插件文件中提及）：`);
      for (const d of newHighlighted) {
        lines.push(`- \`${d}\` — 安全敏感`);
      }
      hasContent = true;
    }
  }

  const newDeployInfo = filterNewItems(baseline.deploymentInfo, existingContent);
  if (newDeployInfo.length > 0) {
    lines.push('');
    lines.push('## 基线补充：部署环境（攻击面）');
    lines.push('');
    for (const d of newDeployInfo) {
      lines.push(`- ${d}`);
    }
    hasContent = true;
  }

  if (!hasContent) return null;
  lines.push('');
  return lines.join('\n');
}

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
    console.log('  --force      强制覆盖已有文件并重新注入基线');
    console.log('');
    console.log('流程: 基线提取 → 基线注入 → 就绪检查(8项) → 交付');
    console.log('');
    console.log('--force 模式：覆盖所有已有文件，重新从 CLAUDE.md/README.md 提取');
    console.log('并注入项目特有信息到 agents/rules 文件。适用于基线文件更新后刷新。');
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
