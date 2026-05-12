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
    file: path.join(REPO_ROOT, 'agents'),
    validate() {
      const overview = 'AGENT.md';
      const roles = ['pm.md', 'coder.md', 'tester.md', 'reporter.md', 'security.md', 'self-improve.md'];
      const missing = [];

      // AGENT.md is overview — just needs to exist with content
      const overviewPath = path.join(REPO_ROOT, 'agents', overview);
      if (!fs.existsSync(overviewPath)) missing.push(overview);
      else {
        const content = fs.readFileSync(overviewPath, 'utf8');
        if (content.trim().length < C.MIN_AGENT_CONTENT_LENGTH) missing.push(`${overview}(内容过短)`);
      }

      // Role agents need valid frontmatter
      for (const f of roles) {
        const fp = path.join(REPO_ROOT, 'agents', f);
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
    file: path.join(REPO_ROOT, 'rules'),
    validate() {
      const required = ['code-pipeline.md', 'doc-generation.md', 'gate-rules.md', 'import-docs.md', 'rui-claude.md', 'self-improve.md'];
      const missing = [];
      for (const f of required) {
        if (!fs.existsSync(path.join(REPO_ROOT, 'rules', f))) missing.push(f);
      }
      return { ok: missing.length === 0, missing, detail: missing.length === 0 ? '全部 6 个规则文件存在' : `缺失: ${missing.join(', ')}` };
    },
  },
  'templates/': {
    order: 5,
    description: '8 个基线文档模板（01-故事任务 ~ 08-自改进复盘）',
    file: path.join(REPO_ROOT, 'skills', 'rui', 'templates'),
    validate() {
      const required = [
        '01-故事任务模板.md', '02-后端技术评审模板.md', '03-前端技术评审模板.md',
        '04-测试用例评审模板.md', '05-后端实施报告模板.md', '06-前端实施报告模板.md',
        '07-测试用例报告模板.md', '08-自改进复盘模板.md',
      ];
      const missing = [];
      for (const f of required) {
        const fp = path.join(REPO_ROOT, 'skills', 'rui', 'templates', f);
        if (!fs.existsSync(fp)) missing.push(f);
        else {
          const content = fs.readFileSync(fp, 'utf8');
          if (content.trim().length < C.MIN_TEMPLATE_CONTENT_LENGTH) missing.push(`${f}(内容过短)`);
        }
      }
      return { ok: missing.length === 0, missing, detail: missing.length === 0 ? '全部 8 个模板文件存在' : `缺失/异常: ${missing.join(', ')}` };
    },
  },
  '.mcp.json': {
    order: 6,
    description: 'MCP 配置：有效 JSON + mcpServers 字段',
    file: path.join(REPO_ROOT, '.mcp.json'),
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
    file: path.join(REPO_ROOT, 'settings.json'),
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
    architecture: {},
    injectionTargets: {},
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

    // Extract prohibitions (from 退化对策)
    baseline.prohibitions.push('禁止跳过验证：没验证等于没做');
    baseline.prohibitions.push('禁止过度设计：只解决当前问题');
    baseline.prohibitions.push('禁止猜测：不确定就问');
  }

  // Extract from README.md
  const readmePath = path.join(REPO_ROOT, 'README.md');
  if (fs.existsSync(readmePath)) {
    const content = fs.readFileSync(readmePath, 'utf8');

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

    // Extract quick start commands (inline code + code blocks)
    const quickSection = content.match(/## 快速开始([\s\S]*?)(?=##|$)/);
    if (quickSection) {
      const text = quickSection[1];
      // Inline backtick-enclosed commands
      for (const m of text.matchAll(/`(\/[^`\s]+(?:\s+[^`]+)?)`/g)) {
        baseline.buildCommands.push(m[1].trim());
      }
      // Code block lines starting with /
      for (const m of text.matchAll(/^\s*(\/\S+(?:\s+[^\n#]+)?)/gm)) {
        const cmd = m[1].trim();
        if (!baseline.buildCommands.includes(cmd)) baseline.buildCommands.push(cmd);
      }
    }
  }

  // Detect project type
  baseline.projectType = detectProjectType();

  // Build injection targets
  baseline.injectionTargets = {
    'coder.md': {
      techStack: baseline.techStack,
      conventions: baseline.conventions,
      prohibitions: baseline.prohibitions,
    },
    'security.md': {
      techStack: baseline.techStack,
      architecture: baseline.architecture,
    },
    'tester.md': {
      conventions: baseline.conventions,
      buildCommands: baseline.buildCommands,
    },
    'code-pipeline.md': {
      prohibitions: baseline.prohibitions,
    },
  };

  return baseline;
}

function detectProjectType() {
  let frontendScore = 0, backendScore = 0;
  const indicators = [];

  const frontendPatterns = Object.entries(C.FRONTEND_EXTENSION_WEIGHTS).map(([ext, weight]) => ({ ext, weight }));
  for (const { ext, weight } of frontendPatterns) {
    try {
      const files = fs.readdirSync(REPO_ROOT, { recursive: true }).filter(f => f.endsWith(ext) && !f.includes('node_modules') && !f.includes('.git'));
      if (files.length > 0) { frontendScore += weight * Math.min(files.length, C.MAX_FILE_COUNT_FOR_SCORING); indicators.push(`${ext}`); }
    } catch {}
  }

  const backendPatterns = Object.entries(C.BACKEND_EXTENSION_WEIGHTS).map(([ext, weight]) => ({ ext, weight }));
  for (const { ext, weight } of backendPatterns) {
    try {
      const files = fs.readdirSync(REPO_ROOT, { recursive: true }).filter(f => f.endsWith(ext) && !f.includes('node_modules') && !f.includes('.git'));
      if (files.length > 0) { backendScore += weight * Math.min(files.length, C.MAX_FILE_COUNT_FOR_SCORING); indicators.push(`${ext}`); }
    } catch {}
  }

  let type;
  if (frontendScore > backendScore && frontendScore > 0) type = 'frontend';
  else if (backendScore > frontendScore && backendScore > 0) type = 'backend';
  else if (frontendScore > 0 && backendScore > 0) type = 'fullstack';
  else type = 'meta';

  return { type, frontendScore, backendScore, indicators };
}

// ── Directory & file creation ────────────────────────────────────

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function copyFile(src, dest) {
  if (!fs.existsSync(src)) return { action: 'skip', reason: `源文件不存在: ${src}` };
  ensureDir(path.dirname(dest));
  if (fs.existsSync(dest)) return { action: 'skip', reason: '已存在' };
  fs.copyFileSync(src, dest);
  return { action: 'create' };
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

function writeJson(filePath, data) {
  ensureDir(path.dirname(filePath));
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n', 'utf8');
    return { action: 'create' };
  }
  return { action: 'skip', reason: '已存在' };
}

// ── Phase 2: Injection ──────────────────────────────────────────

function injectBaseline(baseline, dryRun) {
  const results = { created: [], skipped: [], dirs: [] };

  // Create .claude/ root directories
  const dirs = [
    path.join(CLAUDE_DIR, 'agents'),
    path.join(CLAUDE_DIR, 'rules'),
    path.join(CLAUDE_DIR, 'templates'),
    path.join(CLAUDE_DIR, 'skills', 'rui', 'templates'),
    path.join(CLAUDE_DIR, '.history'),
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
        results.created.push({ path: path.relative(REPO_ROOT, dest), action: 'will-copy', source: `agents/${f}` });
      } else {
        const r = copyFile(src, dest);
        if (r.action === 'create') results.created.push({ path: path.relative(REPO_ROOT, dest), action: 'copied', source: `agents/${f}` });
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
        results.created.push({ path: path.relative(REPO_ROOT, dest), action: 'will-copy', source: `rules/${f}` });
      } else {
        const r = copyFile(src, dest);
        if (r.action === 'create') results.created.push({ path: path.relative(REPO_ROOT, dest), action: 'copied', source: `rules/${f}` });
        else results.skipped.push({ path: path.relative(REPO_ROOT, dest), reason: r.reason });
      }
    }
  }

  // Copy templates
  const templatesSrc = path.join(REPO_ROOT, 'skills', 'rui', 'templates');
  const templatesDest = path.join(CLAUDE_DIR, 'templates');
  if (fs.existsSync(templatesSrc)) {
    const templateFiles = fs.readdirSync(templatesSrc).filter(f => f.endsWith('.md'));
    for (const f of templateFiles) {
      const src = path.join(templatesSrc, f);
      const dest = path.join(templatesDest, f);
      if (dryRun) {
        results.created.push({ path: path.relative(REPO_ROOT, dest), action: 'will-copy', source: `skills/rui/templates/${f}` });
      } else {
        const r = copyFile(src, dest);
        if (r.action === 'create') results.created.push({ path: path.relative(REPO_ROOT, dest), action: 'copied', source: `skills/rui/templates/${f}` });
        else results.skipped.push({ path: path.relative(REPO_ROOT, dest), reason: r.reason });
      }
    }
  }

  // Also copy templates to .claude/skills/rui/templates/
  const skillsTemplatesDest = path.join(CLAUDE_DIR, 'skills', 'rui', 'templates');
  if (fs.existsSync(templatesSrc)) {
    const templateFiles = fs.readdirSync(templatesSrc).filter(f => f.endsWith('.md'));
    for (const f of templateFiles) {
      const src = path.join(templatesSrc, f);
      const dest = path.join(skillsTemplatesDest, f);
      if (dryRun) {
        results.created.push({ path: path.relative(REPO_ROOT, dest), action: 'will-copy', source: `skills/rui/templates/${f}` });
      } else {
        const r = copyFile(src, dest);
        if (r.action === 'create') results.created.push({ path: path.relative(REPO_ROOT, dest), action: 'copied', source: `skills/rui/templates/${f}` });
        else results.skipped.push({ path: path.relative(REPO_ROOT, dest), reason: r.reason });
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
      if (!coderContent.includes('<!-- project-type-injected -->')) {
        const injection = `\n<!-- project-type-injected -->\n> **项目类型**: ${profile.type_label} · **Coder 公式**: \`${coderFormula.text}\` · **关注**: ${coderFormula.focus}\n`;
        coderContent = coderContent.replace(/(## 触发)/, injection + '\n$1');
        fs.writeFileSync(coderDest, coderContent, 'utf8');
        results.created.push({ path: path.relative(REPO_ROOT, coderDest), action: 'injected', source: `项目类型公式: ${coderFormula.text}` });
      }
    } catch (e) {
      results.skipped.push({ path: path.relative(REPO_ROOT, coderDest), reason: `注入失败: ${e.message}` });
    }
  }

  return results;
}

function getCoderFormula(type) {
  const formulas = {
    frontend: { text: '组件树 → Props/Events/Expose → 状态流', variant: '组件化', focus: '组件接口契约与状态管理' },
    backend: { text: '模块 → 接口 → 数据流', variant: '领域模型', focus: '领域模型完整性与API契约' },
    fullstack: { text: '模块 → 接口 → 数据流 + 组件树 → Props/Events → 状态流', variant: '前后端分离', focus: '前后端契约对齐与数据流完整性' },
    meta: { text: '模块 → 接口 → 数据流', variant: '配置/插件', focus: '规则完整性与集成契约' },
  };
  return formulas[type] || formulas.meta;
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
  console.log(`- 类型: **${labelForType(baseline.projectType.type)}** (前端信号=${baseline.projectType.frontendScore}, 后端信号=${baseline.projectType.backendScore})`);
  if (baseline.projectType.indicators.length > 0) {
    console.log(`- 技术信号: ${baseline.projectType.indicators.join(', ')}`);
  }
  if (Object.keys(baseline.philosophy).length > 0) {
    console.log(`- 哲学: ${Object.keys(baseline.philosophy).length} 条公理/原则/准则`);
  }
  if (Object.keys(baseline.directoryStructure).length > 0) {
    console.log(`- 目录: ${Object.keys(baseline.directoryStructure).length} 个关键路径`);
  }
  if (baseline.buildCommands.length > 0) {
    console.log(`- 命令: ${baseline.buildCommands.length} 条入口`);
  }
  console.log();

  // Phase 2: Injection
  console.log('## 基线注入\n');
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
      philosophy_keys: Object.keys(baseline.philosophy),
      directory_keys: Object.keys(baseline.directoryStructure),
      commands: baseline.buildCommands,
      prohibitions: baseline.prohibitions,
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
  return { frontend: '前端', backend: '后端', fullstack: '全栈', meta: '元项目(配置/插件)' }[type] || '未知';
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
    console.log('  --force      强制覆盖已有文件');
    console.log('');
    console.log('流程: 基线提取 → 基线注入 → 就绪检查(8项) → 交付');
    process.exit(0);
  }

  // Phase 1: Baseline extraction
  const baseline = extractBaseline();

  // Phase 2: Baseline injection
  const injectResults = injectBaseline(baseline, dryRun);

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
