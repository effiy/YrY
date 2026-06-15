/**
 * bot-health-analysis — Engineering maturity, component scores, test counting.
 * Extracted from send.mjs for module decomposition.
 */

import { join } from "node:path";
import { existsSync, readFileSync, readdirSync } from "node:fs";

export function assessEngineeringMaturity(projectRoot) {
  const scores = {};
  const details = [];
  const summaries = {};
  const pkgJsonPath = join(projectRoot, "package.json");
  const pkg = existsSync(pkgJsonPath) ? JSON.parse(readFileSync(pkgJsonPath, "utf-8")) : null;
  const allDeps = { ...(pkg?.dependencies || {}), ...(pkg?.devDependencies || {}) };
  const depNames = Object.keys(allDeps);

  // 1. Testing infrastructure
  const testFrameworks = ["vitest", "jest", "mocha", "ava", "jasmine", "pytest", "go-test", "cargo-test"];
  const hasTestFramework = depNames.some(d => testFrameworks.includes(d));
  const hasTestDir = existsSync(join(projectRoot, "tests")) || existsSync(join(projectRoot, "__tests__")) || existsSync(join(projectRoot, "test"));
  const hasTestScript = pkg?.scripts?.test;
  const testCaseCount = countTestCases(projectRoot);
  let emTestScore = 0;
  if (hasTestFramework && testCaseCount >= 10) emTestScore = 100;
  else if (hasTestFramework && testCaseCount > 0) emTestScore = 80;
  else if (hasTestFramework || hasTestDir) emTestScore = 60;
  else if (hasTestScript) emTestScore = 30;
  scores.em_testing = emTestScore;
  summaries.em_testing = hasTestFramework ? `${testCaseCount} 用例` : "无测试框架";
  details.push({ dim: "em_testing", label: "测试体系", status: emTestScore >= 80 ? "pass" : emTestScore >= 60 ? "warn" : "fail", detail: `${hasTestFramework ? testFrameworks.find(d => depNames.includes(d)) : "无框架"}, ${testCaseCount} 用例`, score: emTestScore });

  // 2. Type safety
  const isTS = existsSync(join(projectRoot, "tsconfig.json"));
  const hasStrictTS = isTS && readFileSync(join(projectRoot, "tsconfig.json"), "utf-8").includes('"strict"');
  const hasFlow = depNames.includes("flow-bin") || existsSync(join(projectRoot, ".flowconfig"));
  const hasTypings = existsSync(join(projectRoot, "*.d.ts")) || depNames.some(d => d.startsWith("@types/"));
  let emTypeScore = 0;
  if (isTS && hasStrictTS) emTypeScore = 100;
  else if (isTS) emTypeScore = 70;
  else if (hasFlow || hasTypings) emTypeScore = 40;
  scores.em_types = emTypeScore;
  summaries.em_types = isTS ? (hasStrictTS ? "strict" : "宽松") : "纯 JS";
  details.push({ dim: "em_types", label: "类型安全", status: emTypeScore >= 80 ? "pass" : emTypeScore >= 60 ? "warn" : "fail", detail: isTS ? `TypeScript${hasStrictTS ? " strict" : " (宽松)"}` : "纯 JavaScript", score: emTypeScore });

  // 3. Linting/code style
  const hasESLint = existsSync(join(projectRoot, ".eslintrc.js")) || existsSync(join(projectRoot, ".eslintrc.json")) || existsSync(join(projectRoot, ".eslintrc.cjs")) || existsSync(join(projectRoot, ".eslintrc")) || existsSync(join(projectRoot, "eslint.config.js")) || existsSync(join(projectRoot, "eslint.config.mjs"));
  const hasPrettier = existsSync(join(projectRoot, ".prettierrc")) || existsSync(join(projectRoot, ".prettierrc.json")) || existsSync(join(projectRoot, ".prettierrc.js")) || existsSync(join(projectRoot, "prettier.config.js"));
  const hasEditorConfig = existsSync(join(projectRoot, ".editorconfig"));
  const lintCount = [hasESLint, hasPrettier, hasEditorConfig].filter(Boolean).length;
  const hasCILint = hasESLint && (existsSync(join(projectRoot, ".github")) || existsSync(join(projectRoot, ".gitlab-ci.yml")));
  let emLintScore = 0;
  if (hasCILint) emLintScore = 100;
  else if (lintCount >= 2) emLintScore = 80;
  else if (lintCount >= 1) emLintScore = 60;
  scores.em_linting = emLintScore;
  const lintTools = [];
  if (hasESLint) lintTools.push("ESLint");
  if (hasPrettier) lintTools.push("Prettier");
  if (hasEditorConfig) lintTools.push("EditorConfig");
  summaries.em_linting = lintTools.join(",") || "无";
  details.push({ dim: "em_linting", label: "代码规范", status: emLintScore >= 80 ? "pass" : emLintScore >= 60 ? "warn" : "fail", detail: `${lintCount} 工具: ${lintTools.join(", ") || "无"}${hasCILint ? " + CI 强制" : ""}`, score: emLintScore });

  // 4. CI/CD
  const hasGitHubActions = existsSync(join(projectRoot, ".github", "workflows"));
  const hasGitLabCI = existsSync(join(projectRoot, ".gitlab-ci.yml"));
  const hasJenkins = existsSync(join(projectRoot, "Jenkinsfile"));
  const hasCICD = hasGitHubActions || hasGitLabCI || hasJenkins;
  const hasCIWorkflows = hasGitHubActions && readdirSync(join(projectRoot, ".github", "workflows")).filter(f => f.endsWith(".yml") || f.endsWith(".yaml")).length > 0;
  let emCICDScore = 0;
  if (hasCIWorkflows) emCICDScore = 100;
  else if (hasCICD) emCICDScore = 70;
  scores.em_cicd = emCICDScore;
  const ciLabel = hasGitHubActions ? "GitHub Actions" : hasGitLabCI ? "GitLab CI" : hasJenkins ? "Jenkins" : "无";
  summaries.em_cicd = ciLabel;
  details.push({ dim: "em_cicd", label: "CI/CD", status: emCICDScore >= 80 ? "pass" : emCICDScore >= 60 ? "warn" : "fail", detail: hasCICD ? ciLabel : "无 CI/CD 管线", score: emCICDScore });

  // 5. Documentation completeness
  const hasReadme = existsSync(join(projectRoot, "README.md"));
  const hasClaude = existsSync(join(projectRoot, "CLAUDE.md"));
  const hasAPIDocs = existsSync(join(projectRoot, "docs")) || existsSync(join(projectRoot, "api-docs"));
  const docCount = [hasReadme, hasClaude, hasAPIDocs].filter(Boolean).length;
  let emDocScore = 0;
  if (docCount >= 3) emDocScore = 100;
  else if (docCount >= 2) emDocScore = 80;
  else if (docCount >= 1) emDocScore = 50;
  scores.em_docs = emDocScore;
  const docList = [];
  if (hasReadme) docList.push("README");
  if (hasClaude) docList.push("CLAUDE.md");
  if (hasAPIDocs) docList.push("docs/");
  summaries.em_docs = docList.join(",") || "无";
  details.push({ dim: "em_docs", label: "文档完整", status: emDocScore >= 80 ? "pass" : emDocScore >= 60 ? "warn" : "fail", detail: `${docCount} 文档: ${docList.join(", ") || "无"}`, score: emDocScore });

  // 6. Dependency management
  const hasLockfile = existsSync(join(projectRoot, "package-lock.json")) || existsSync(join(projectRoot, "yarn.lock")) || existsSync(join(projectRoot, "pnpm-lock.yaml")) || existsSync(join(projectRoot, "bun.lockb"));
  const hasNpmScriptVersion = pkg?.scripts && Object.keys(pkg.scripts).some(k => k.includes("version") || k.includes("release"));
  const lockType = existsSync(join(projectRoot, "pnpm-lock.yaml")) ? "pnpm" : existsSync(join(projectRoot, "yarn.lock")) ? "yarn" : existsSync(join(projectRoot, "package-lock.json")) ? "npm" : existsSync(join(projectRoot, "bun.lockb")) ? "bun" : "";
  let emDepScore = 0;
  if (hasLockfile && hasNpmScriptVersion) emDepScore = 100;
  else if (hasLockfile) emDepScore = 70;
  scores.em_deps = emDepScore;
  summaries.em_deps = hasLockfile ? lockType : "无 lockfile";
  details.push({ dim: "em_deps", label: "依赖管理", status: emDepScore >= 80 ? "pass" : emDepScore >= 60 ? "warn" : "fail", detail: hasLockfile ? `${lockType} lockfile${hasNpmScriptVersion ? " + 版本脚本" : ""}` : "无锁文件", score: emDepScore });

  // 7. Git discipline
  const hasGitignore = existsSync(join(projectRoot, ".gitignore"));
  const hasGitAttributes = existsSync(join(projectRoot, ".gitattributes"));
  const hasPRTemplate = existsSync(join(projectRoot, ".github", "PULL_REQUEST_TEMPLATE.md")) || existsSync(join(projectRoot, ".github", "pull_request_template.md"));
  const gitDiscCount = [hasGitignore, hasGitAttributes, hasPRTemplate].filter(Boolean).length;
  const hasBranchProtection = existsSync(join(projectRoot, ".github")) && gitDiscCount >= 2;
  let emGitScore = 0;
  if (hasBranchProtection) emGitScore = 100;
  else if (gitDiscCount >= 2) emGitScore = 80;
  else if (hasGitignore) emGitScore = 60;
  scores.em_git = emGitScore;
  const gitItems = [];
  if (hasGitignore) gitItems.push(".gitignore");
  if (hasGitAttributes) gitItems.push(".gitattributes");
  if (hasPRTemplate) gitItems.push("PR 模板");
  summaries.em_git = gitItems.join(",") || "仅基本";
  details.push({ dim: "em_git", label: "Git 纪律", status: emGitScore >= 80 ? "pass" : emGitScore >= 60 ? "warn" : "fail", detail: `${gitDiscCount} 项: ${gitItems.join(", ") || "无"}`, score: emGitScore });

  return { scores, details, summaries };
}

/**
 * Scan all project components (skills, agents, rules, scripts) and compute
 * per-component quality scores with detailed criteria breakdowns and
 * recommendations for low-scoring components.
 */
export function scanComponentScores(projectRoot) {
  const results = { skills: [], agents: [], rules: [], scripts: [] };

  // ── Skills ───────────────────────────────────────────────
  const skillsDir = join(projectRoot, "skills");
  if (existsSync(skillsDir)) {
    const skillDirs = readdirSync(skillsDir, { withFileTypes: true })
      .filter((d) => d.isDirectory());
    for (const sd of skillDirs) {
      const criteria = {};
      const recs = [];
      let score = 0;
      const skillPath = join(skillsDir, sd.name);
      const skillMd = join(skillPath, "SKILL.md");

      // C1: SKILL.md exists (40 pts)
      criteria["SKILL.md 存在"] = existsSync(skillMd);
      if (criteria["SKILL.md 存在"]) {
        score += 40;
        let content = "";
        let lines = 0;
        try { content = readFileSync(skillMd, "utf-8"); lines = content.split("\n").length; } catch {}

        // C2: frontmatter (10 pts)
        criteria["YAML frontmatter"] = /^---/m.test(content);
        if (criteria["YAML frontmatter"]) score += 10;
        else recs.push("添加 YAML frontmatter (name + description)");

        // C3: comprehensive docs (20 pts)
        criteria[`文档 ≥100 行 (当前 ${lines})`] = lines >= 100;
        if (lines >= 100) score += 20;
        else if (lines >= 50) { score += 10; recs.push(`SKILL.md 仅 ${lines} 行，建议扩充到 ≥100 行`); }
        else recs.push(`SKILL.md 仅 ${lines} 行，建议扩充到 ≥100 行`);

        // C4: diagrams (5 pts)
        criteria["含 Mermaid 图表"] = /mermaid|```mermaid/.test(content);
        if (criteria["含 Mermaid 图表"]) score += 5;

        // C5: modular lib/ (15 pts)
        criteria["lib/ 子目录"] = existsSync(join(skillPath, "lib"));
        if (criteria["lib/ 子目录"]) score += 15;
        else if (lines >= 150) recs.push("建议抽取共享逻辑到 lib/ 子目录");

        // Count scripts and help entry
        let mjsCount = 0, hasHelp = false;
        try {
          const files = readdirSync(skillPath, { recursive: true, withFileTypes: true });
          for (const f of files) {
            if (f.isFile() && f.name.endsWith(".mjs")) { mjsCount++; if (f.name === "help.mjs") hasHelp = true; }
          }
        } catch {}

        // C6: help entry (5 pts)
        criteria["help.mjs 入口"] = hasHelp;
        if (hasHelp) score += 5;
        else recs.push("添加 help.mjs 作为技能帮助入口");

        // C7: rich scripts (5 pts)
        criteria[`≥3 个 .mjs (当前 ${mjsCount})`] = mjsCount >= 3;
        if (mjsCount >= 3) score += 5;
      } else {
        recs.push("创建 SKILL.md — 技能无规约文件");
      }

      results.skills.push({
        name: sd.name,
        score: Math.min(100, score),
        criteria,
        recommendations: recs,
        hasSkillMd: criteria["SKILL.md 存在"],
        hasLib: criteria["lib/ 子目录"],
        mjsCount: Object.entries(criteria).find(([k]) => k.includes(".mjs"))?.[1] || 0,
      });
    }
  }

  // ── Agents ───────────────────────────────────────────────
  const agentsDir = join(projectRoot, "agents");
  if (existsSync(agentsDir)) {
    try {
      const agentFiles = readdirSync(agentsDir).filter((f) => f.endsWith(".md"));
      for (const af of agentFiles) {
        const criteria = {};
        const recs = [];
        const agentPath = join(agentsDir, af);
        let score = 0;
        try {
          const content = readFileSync(agentPath, "utf-8");
          const lines = content.split("\n").length;

          // C1: file exists (40)
          score = 40;

          // C2: frontmatter + description (20)
          const hasFM = /^---/m.test(content);
          const hasDesc = /description:/m.test(content);
          criteria["frontmatter + description"] = hasFM && hasDesc;
          if (hasFM && hasDesc) score += 20;
          else if (hasFM) { score += 10; recs.push("frontmatter 缺少 description 字段"); }
          else recs.push("添加 YAML frontmatter");

          // C3: line count (20)
          criteria[`≥200 行 (当前 ${lines})`] = lines >= 200;
          if (lines >= 200) score += 20;
          else if (lines >= 100) { score += 10; recs.push(`仅 ${lines} 行，建议扩充到 ≥200 行`); }
          else recs.push(`仅 ${lines} 行，建议扩充到 ≥200 行`);

          // C4: Red Flags (10)
          criteria["含 Red Flags / 合理化速查"] = /Red Flag|red flag|合理化/.test(content);
          if (criteria["含 Red Flags / 合理化速查"]) score += 10;
          else recs.push("添加 Red Flags 和合理化速查表");

          // C5: Mermaid (5)
          criteria["含 Mermaid 图表"] = /mermaid|```mermaid/.test(content);
          if (criteria["含 Mermaid 图表"]) score += 5;

          // C6: structured sections (5)
          criteria["含结构化章节"] = /##\s+(触发|规则|操作|生效)/.test(content);
          if (criteria["含结构化章节"]) score += 5;
          else recs.push("添加结构化章节 (触发/规则/操作/生效标志)");
        } catch {}
        results.agents.push({
          name: af.replace(".md", ""),
          score: Math.min(100, score),
          criteria,
          recommendations: recs,
        });
      }
    } catch {}
  }

  // ── Rules ───────────────────────────────────────────────
  const rulesDir = join(projectRoot, "rules");
  if (existsSync(rulesDir)) {
    try {
      const ruleFiles = readdirSync(rulesDir).filter((f) => f.endsWith(".md"));
      for (const rf of ruleFiles) {
        const criteria = {};
        const recs = [];
        const rulePath = join(rulesDir, rf);
        let score = 0;
        try {
          const content = readFileSync(rulePath, "utf-8");
          const lines = content.split("\n").length;

          // C1: file exists (40)
          score = 40;

          // C2: frontmatter (15)
          criteria["YAML frontmatter"] = /^---/m.test(content);
          if (criteria["YAML frontmatter"]) score += 15;
          else recs.push("添加 YAML frontmatter");

          // C3: paths or description (15)
          criteria["paths / description 字段"] = /paths:|description:/m.test(content);
          if (criteria["paths / description 字段"]) score += 15;
          else recs.push("frontmatter 添加 paths 或 description 字段");

          // C4: line count (20)
          criteria[`≥150 行 (当前 ${lines})`] = lines >= 150;
          if (lines >= 150) score += 20;
          else if (lines >= 80) { score += 10; recs.push(`仅 ${lines} 行，建议扩充到 ≥150 行`); }
          else recs.push(`仅 ${lines} 行，建议扩充到 ≥150 行`);

          // C5: Mermaid (5)
          criteria["含 Mermaid 图表"] = /mermaid|```mermaid/.test(content);
          if (criteria["含 Mermaid 图表"]) score += 5;

          // C6: structured (5)
          criteria["含结构化章节"] = /##\s+|###\s+/.test(content);
          if (criteria["含结构化章节"]) score += 5;
        } catch {}
        results.rules.push({
          name: rf.replace(".md", ""),
          score: Math.min(100, score),
          criteria,
          recommendations: recs,
        });
      }
    } catch {}
  }

  // ── Scripts (lib/ + lib/engine/ + skills/*/lib/) ─────────
  const scriptDirs = [join(projectRoot, "lib"), join(projectRoot, "lib", "engine")];
  if (existsSync(skillsDir)) {
    try {
      for (const sd of readdirSync(skillsDir, { withFileTypes: true }).filter((d) => d.isDirectory())) {
        const skillLib = join(skillsDir, sd.name, "lib");
        if (existsSync(skillLib)) scriptDirs.push(skillLib);
      }
    } catch {}
  }

  for (const dir of scriptDirs) {
    if (!existsSync(dir)) continue;
    try {
      const files = readdirSync(dir, { recursive: true, withFileTypes: true });
      for (const f of files) {
        if (!f.isFile() || !f.name.endsWith(".mjs")) continue;
        const filePath = join(f.path || dir, f.name);
        const criteria = {};
        const recs = [];
        let score = 0;
        try {
          const content = readFileSync(filePath, "utf-8");
          const lines = content.split("\n").length;

          // C1: file exists (40)
          score = 40;

          // C2: JSDoc (20)
          criteria["含 JSDoc 注释"] = /\/\*\*[\s\S]*?\*\//.test(content);
          if (criteria["含 JSDoc 注释"]) score += 20;
          else recs.push("添加 JSDoc 注释说明函数用途和参数");

          // C3: exports (15)
          criteria["含 export 导出"] = /\bexport\s+(default\s+)?(function|class|const|let|var|async)/.test(content);
          if (criteria["含 export 导出"]) score += 15;
          else recs.push("添加 export 语句使函数可被导入复用");

          // C4: line count (15)
          criteria[`≥100 行 (当前 ${lines})`] = lines >= 100;
          if (lines >= 100) score += 15;
          else if (lines >= 30) score += 10;

          // C5: test coverage (10)
          const baseName = f.name.replace(".mjs", "");
          const hasTest = existsSync(join(projectRoot, "tests", `${baseName}.test.mjs`))
            || existsSync(join(projectRoot, "tests", "skills", `${baseName}.test.mjs`));
          criteria["有对应测试文件"] = hasTest;
          if (hasTest) score += 10;
          else if (lines >= 50) recs.push(`创建 tests/${baseName}.test.mjs 增加测试覆盖`);
        } catch {}

        // Derive category from path
        let category = "lib";
        if (dir.includes("/engine")) category = "engine";
        else if (dir.includes("skills/")) {
          const parts = dir.split("/");
          const skillIdx = parts.indexOf("skills");
          category = parts[skillIdx + 1] || "skill-lib";
        }
        results.scripts.push({
          name: f.name,
          category,
          score: Math.min(100, score),
          criteria,
          recommendations: recs,
        });
      }
    } catch {}
  }

  return results;
}

/**
 * Count test cases across known test file patterns.
 */
export function countTestCases(projectRoot) {
  let count = 0;
  const testDirs = ["tests", "__tests__", "test", "spec"];
  for (const dir of testDirs) {
    const p = join(projectRoot, dir);
    if (!existsSync(p)) continue;
    try {
      const files = readdirSync(p, { recursive: true, withFileTypes: true });
      for (const f of files) {
        if (f.isFile() && /\.(test|spec)\.(m?js|ts|tsx|py|go|rs)$/.test(f.name)) {
          try {
            const content = readFileSync(join(f.path || p, f.name), "utf-8");
            const matches = content.match(/\b(it|test|describe|def test_|func Test)\b/g);
            if (matches) count += matches.length;
          } catch {}
        }
      }
    } catch {}
  }
  return count;
}
