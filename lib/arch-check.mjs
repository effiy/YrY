#!/usr/bin/env node
/**
 * arch-check — Architecture compliance verification script
 *
 * Verifies all architecture and design principles defined in:
 *   - rules/architecture-principles.md
 *   - rules/design-principles.md
 *
 * Each check produces a { pass, detail, evidence } result.
 * The script outputs a structured JSON report and exits non-zero
 * if any P0 (blocking) check fails.
 *
 * Usage:
 *   node lib/arch-check.mjs                    # Full check
 *   node lib/arch-check.mjs --json             # JSON output only
 *   node lib/arch-check.mjs --dim <dimension>  # Single dimension
 *   node lib/arch-check.mjs --short            # Single-line summary
 *
 * Dimensions:
 *   kernel     — Kernel size constraints
 *   paradigm   — Code paradigm compliance (class/default export/magic numbers)
 *   coupling   — Module coupling (skill-to-skill, agent-to-skill imports)
 *   srp        — Single Responsibility Principle (description conjunctions)
 *   dry        — Don't Repeat Yourself (duplicate definitions)
 *   yagni      — You Ain't Gonna Need It (single-caller exports)
 *   ocp        — Open/Closed Principle (new skills vs orchestrator changes)
 *   frontmatter — Config API frontmatter completeness
 *   imports    — Import convention compliance
 *   extensions — Extension isolation (recent changes)
 */

import { join, dirname } from "node:path";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { execSync } from "node:child_process";
import { fileURLToPath } from "node:url";

import { findProjectRoot } from "./fs.mjs";
import {
  KERNEL_LIB_MAX_FILES,
  KERNEL_RULES_MAX_FILES,
  KERNEL_ORCHESTRATOR_MAX_LINES,
  KERNEL_RULE_FILES,
  DESIGN_PRINCIPLE_THRESHOLDS as DPT,
  ARCH_HEALTH_DIM_LABELS,
} from "./constants.mjs";

// ── helpers ──────────────────────────────────────────────────────────────

function grepLines(pattern, dir, ext = ".mjs", excludeFile = null) {
  try {
    let cmd = `grep -r "${pattern}" "${dir}" --include="*${ext}" -n 2>/dev/null || true`;
    const result = execSync(cmd, { encoding: "utf-8", timeout: 5000 });
    let lines = result.trim().split("\n").filter(Boolean);
    if (excludeFile) {
      lines = lines.filter((l) => !l.startsWith(excludeFile));
    }
    return lines;
  } catch {
    return [];
  }
}

function grepCount(pattern, dir, ext = ".mjs") {
  try {
    const result = execSync(
      `grep -r "${pattern}" "${dir}" --include="*${ext}" -l 2>/dev/null | wc -l`,
      { encoding: "utf-8", timeout: 5000 }
    );
    return parseInt(result.trim(), 10) || 0;
  } catch {
    return 0;
  }
}

function countFiles(dir, pattern = "*.mjs") {
  try {
    const result = execSync(
      `ls ${dir}/${pattern} 2>/dev/null | wc -l`,
      { encoding: "utf-8", timeout: 3000 }
    );
    return parseInt(result.trim(), 10) || 0;
  } catch {
    return 0;
  }
}

function fileLineCount(filePath) {
  try {
    const content = readFileSync(filePath, "utf-8");
    return content.split("\n").length;
  } catch {
    return 0;
  }
}

function readFrontmatter(filePath) {
  try {
    const content = readFileSync(filePath, "utf-8");
    const match = content.match(/^---\n([\s\S]*?)\n---/);
    if (!match) return null;
    // Simple YAML parser for flat key: value pairs
    const fm = {};
    const lines = match[1].split("\n");
    for (const line of lines) {
      const kv = line.match(/^(\w+):\s*(.+)/);
      if (kv) {
        const key = kv[1].trim();
        let val = kv[2].trim();
        // Unquote
        if ((val.startsWith('"') && val.endsWith('"')) ||
            (val.startsWith("'") && val.endsWith("'"))) {
          val = val.slice(1, -1);
        }
        fm[key] = val;
      }
    }
    return fm;
  } catch {
    return null;
  }
}

/**
 * Check if a Chinese string contains conjunctions that indicate
 * multiple responsibilities (和/与/也/并/及/以及/并且).
 */
function hasConjunctions(desc) {
  if (!desc) return false;
  return /和|与|也|并|及|以及|并且/.test(desc);
}

// ── dimension checks ─────────────────────────────────────────────────────

/**
 * A1: Kernel size constraints
 */
function checkKernel(projectRoot) {
  const libDir = join(projectRoot, "lib");
  const rulesDir = join(projectRoot, "rules");
  const orchFile = join(projectRoot, "skills", "rui", "SKILL.md");

  const libCount = countFiles(libDir, "*.mjs");
  const orchLines = fileLineCount(orchFile);

  let rulesCount = 0;
  for (const f of KERNEL_RULE_FILES) {
    if (existsSync(join(rulesDir, f))) rulesCount++;
  }

  const checks = [
    {
      id: "kernel-lib",
      pass: libCount <= KERNEL_LIB_MAX_FILES,
      detail: `lib/ 文件数 ${libCount}/${KERNEL_LIB_MAX_FILES}`,
      evidence: libCount,
    },
    {
      id: "kernel-rules",
      pass: rulesCount <= KERNEL_RULES_MAX_FILES,
      detail: `内核规则数 ${rulesCount}/${KERNEL_RULES_MAX_FILES}`,
      evidence: rulesCount,
    },
    {
      id: "kernel-orchestrator",
      pass: orchLines <= KERNEL_ORCHESTRATOR_MAX_LINES,
      detail: `rui 编排器 ${orchLines}/${KERNEL_ORCHESTRATOR_MAX_LINES} 行`,
      evidence: orchLines,
    },
  ];

  return {
    dim: "arch_kernel",
    label: ARCH_HEALTH_DIM_LABELS.arch_kernel,
    pass: checks.every((c) => c.pass),
    checks,
  };
}

/**
 * A2: Code paradigm compliance
 */
function checkParadigm(projectRoot) {
  const libDir = join(projectRoot, "lib");
  const skillsDir = join(projectRoot, "skills");

  // class/extends — use word boundary to avoid matching grep pattern strings
  const selfPath = join(projectRoot, "lib", "arch-check.mjs");
  const classLines = grepLines("\\bclass\\b|\\bextends\\b", libDir).filter(
    (l) => !l.startsWith(selfPath) && !l.includes("//") && !l.includes("*") && !l.includes("Allowable")
  );
  const skillClassLines = grepLines("\\bclass\\b|\\bextends\\b", skillsDir).filter(
    (l) => !l.includes("//") && !l.includes("*")
  );

  // default export — must be followed by function/const/let/var/class/async
  const defaultExportLines = grepLines("export default \\b(function|const|let|var|class|async)\\b", libDir).filter(
    (l) => !l.startsWith(selfPath) && !l.includes("//") && !l.includes("*")
  );

  // Empty catch blocks
  const emptyCatchLines = grepLines("catch", libDir).filter(
    (l) => l.includes("catch") && (l.includes("{}") || l.includes("{ }") || l.includes("{\n"))
  );
  // More precise: catch blocks with no body
  let emptyCatchCount = 0;
  try {
    const result = execSync(
      `grep -r "catch\\s*{" "${libDir}" --include="*.mjs" -A1 2>/dev/null | grep -c "catch.*{\\s*}" || true`,
      { encoding: "utf-8", timeout: 3000 }
    );
    emptyCatchCount = parseInt(result.trim(), 10) || 0;
  } catch { /* ignore */ }

  const totalClassViolations = classLines.length + skillClassLines.length;

  const checks = [
    {
      id: "paradigm-class",
      pass: totalClassViolations <= DPT.COMPOSITION_MAX_CLASS,
      detail: totalClassViolations === 0
        ? "无 class/extends 违规"
        : `${totalClassViolations} 处 class/extends 违规`,
      evidence: classLines.slice(0, 5),
    },
    {
      id: "paradigm-default-export",
      pass: defaultExportLines.length <= DPT.PARADIGM_MAX_DEFAULT_EXPORT,
      detail: defaultExportLines.length === 0
        ? "无 export default 违规"
        : `${defaultExportLines.length} 处 export default 违规`,
      evidence: defaultExportLines.slice(0, 5),
    },
    {
      id: "paradigm-empty-catch",
      pass: emptyCatchCount === 0,
      detail: emptyCatchCount === 0
        ? "无空 catch 块"
        : `${emptyCatchCount} 处空 catch 块`,
      evidence: emptyCatchCount,
    },
  ];

  return {
    dim: "arch_paradigm",
    label: ARCH_HEALTH_DIM_LABELS.arch_paradigm,
    pass: checks.every((c) => c.pass),
    checks,
  };
}

/**
 * A3: Coupling check — skill-to-skill and agent-to-skill imports
 */
function checkCoupling(projectRoot) {
  const skillsDir = join(projectRoot, "skills");
  const agentsDir = join(projectRoot, "agents");

  // Skill-to-skill direct imports (not via lib/)
  const skillImports = grepLines("from.*skills/", skillsDir).filter(
    (l) => !l.includes("../../lib/") && !l.includes("node_modules")
  );

  // Agent-to-skill imports
  const agentImports = grepLines("from.*skills/", agentsDir, ".md").filter(
    (l) => !l.includes("SKILL.md") // Allow referencing SKILL.md path in docs
  );

  const checks = [
    {
      id: "coupling-skill-skill",
      pass: skillImports.length <= DPT.COUPLING_MAX_DIRECT_IMPORTS,
      detail: skillImports.length === 0
        ? "无 Skill 间直接 import"
        : `${skillImports.length} 处 Skill 间直接 import`,
      evidence: skillImports.slice(0, 5),
    },
    {
      id: "coupling-agent-skill",
      pass: agentImports.length <= DPT.DIP_MAX_AGENT_SKILL_IMPORT,
      detail: agentImports.length === 0
        ? "无 Agent import Skill"
        : `${agentImports.length} 处 Agent import Skill`,
      evidence: agentImports.slice(0, 5),
    },
  ];

  return {
    dim: "arch_imports",
    label: ARCH_HEALTH_DIM_LABELS.arch_imports,
    pass: checks.every((c) => c.pass),
    checks,
  };
}

/**
 * A4: SRP compliance — descriptions without conjunctions
 */
function checkSRP(projectRoot) {
  const skillsDir = join(projectRoot, "skills");
  const violations = [];

  try {
    const skillDirs = readdirSync(skillsDir, { withFileTypes: true })
      .filter((d) => d.isDirectory());

    for (const d of skillDirs) {
      const skillMd = join(skillsDir, d.name, "SKILL.md");
      if (!existsSync(skillMd)) continue;

      const fm = readFrontmatter(skillMd);
      if (!fm || !fm.description) {
        violations.push({ skill: d.name, issue: "缺少 description 字段" });
        continue;
      }

      if (hasConjunctions(fm.description)) {
        violations.push({
          skill: d.name,
          description: fm.description.slice(0, 80),
          issue: "description 含并列连词（和/与/也/并/及）",
        });
      }
    }
  } catch { /* ignore */ }

  return {
    dim: "arch_srp",
    label: ARCH_HEALTH_DIM_LABELS.arch_srp,
    pass: violations.length <= DPT.SRP_CONJUNCTION_MAX,
    checks: [{
      id: "srp-description",
      pass: violations.length <= DPT.SRP_CONJUNCTION_MAX,
      detail: violations.length === 0
        ? "所有 Skill description 通过 SRP 检查"
        : `${violations.length} 个 Skill description 含并列连词`,
      evidence: violations.slice(0, 10),
    }],
  };
}

/**
 * A5: DRY — duplicate definitions across files
 */
function checkDRY(projectRoot) {
  const libDir = join(projectRoot, "lib");
  const dups = [];

  try {
    // Find duplicate function signatures (simplified: named exports)
    const exportPatterns = {};
    const files = readdirSync(libDir).filter((f) => f.endsWith(".mjs"));

    for (const file of files) {
      const content = readFileSync(join(libDir, file), "utf-8");
      const exports = content.match(/export (?:const|function|let|var) (\w+)/g);
      if (exports) {
        for (const exp of exports) {
          const name = exp.replace(/export (?:const|function|let|var) /, "");
          if (!exportPatterns[name]) exportPatterns[name] = [];
          exportPatterns[name].push(file);
        }
      }
    }

    for (const [name, files] of Object.entries(exportPatterns)) {
      if (files.length > DPT.DRY_MAX_DUPLICATES) {
        dups.push({ name, files });
      }
    }
  } catch { /* ignore */ }

  return {
    dim: "dry",
    label: "DRY 合规",
    pass: dups.length === 0,
    checks: [{
      id: "dry-duplicates",
      pass: dups.length === 0,
      detail: dups.length === 0
        ? "无重复导出定义"
        : `${dups.length} 个符号在多文件中重复定义`,
      evidence: dups.slice(0, 10),
    }],
  };
}

/**
 * A6: YAGNI — single-caller exports in lib/
 */
function checkYAGNI(projectRoot) {
  const libDir = join(projectRoot, "lib");
  const singleCallers = [];

  try {
    const files = readdirSync(libDir).filter((f) =>
      f.endsWith(".mjs") && f !== "constants.mjs" && f !== "arch-check.mjs"
    );
    for (const file of files) {
      const content = readFileSync(join(libDir, file), "utf-8");
      const exports = content.match(/export (?:const|function|let|var) (\w+)/g);
      if (!exports) continue;

      for (const exp of exports) {
        const name = exp.replace(/export (?:const|function|let|var) /, "");
        // Skip internal (_ prefixed) and well-known utilities
        if (name.startsWith("_")) continue;

        // Count callers outside this file
        try {
          const result = execSync(
            `grep -r "${name}" "${projectRoot}" --include="*.mjs" --include="*.md" -l 2>/dev/null | grep -v "${file}" | wc -l`,
            { encoding: "utf-8", timeout: 5000 }
          );
          const callers = parseInt(result.trim(), 10) || 0;
          if (callers < DPT.YAGNI_MIN_CALL_SITES) {
            singleCallers.push({ file, name, callers });
          }
        } catch { /* ignore */ }
      }
    }
  } catch { /* ignore */ }

  return {
    dim: "yagni",
    label: "YAGNI 合规",
    pass: singleCallers.length === 0,
    checks: [{
      id: "yagni-single-caller",
      pass: singleCallers.length === 0,
      detail: singleCallers.length === 0
        ? "所有 lib export 有 ≥2 个调用方"
        : `${singleCallers.length} 个 export 仅 0-1 个调用方`,
      evidence: singleCallers.slice(0, 10),
    }],
  };
}

/**
 * A7: OCP — new skills shouldn't modify orchestrator
 */
function checkOCP(projectRoot) {
  try {
    // Check if recent skill additions modified the orchestrator
    const result = execSync(
      `cd "${projectRoot}" && git log --oneline --diff-filter=A -- skills/ --name-only -20 2>/dev/null | grep "SKILL.md" | grep -v "skills/rui/SKILL.md" || true`,
      { encoding: "utf-8", timeout: 5000 }
    );
    const newSkills = result.trim().split("\n").filter(Boolean);

    // Check if orchestrator was modified in the same timeframe
    const orchChanges = execSync(
      `cd "${projectRoot}" && git log --oneline -20 -- skills/rui/SKILL.md 2>/dev/null | wc -l`,
      { encoding: "utf-8", timeout: 5000 }
    );
    const orchCount = parseInt(orchChanges.trim(), 10) || 0;

    return {
      dim: "arch_extensions",
      label: ARCH_HEALTH_DIM_LABELS.arch_extensions,
      pass: true, // OCP is informational — violations are noted but not blocking
      checks: [{
        id: "ocp-orchestrator",
        pass: true,
        detail: `最近 20 次提交中编排器修改 ${orchCount} 次（新增 ${newSkills.length} 个 Skill）`,
        evidence: { newSkills: newSkills.length, orchChanges: orchCount },
      }],
    };
  } catch {
    return {
      dim: "arch_extensions",
      label: ARCH_HEALTH_DIM_LABELS.arch_extensions,
      pass: true,
      checks: [{ id: "ocp-orchestrator", pass: true, detail: "无法检测（Git 不可用）", evidence: null }],
    };
  }
}

/**
 * A8: Frontmatter completeness — config API compliance
 */
function checkFrontmatter(projectRoot) {
  const skillsDir = join(projectRoot, "skills");
  const agentsDir = join(projectRoot, "agents");
  const violations = [];

  // Skill frontmatter required fields
  const SKILL_REQUIRED = ["name", "description", "user_invocable", "lifecycle"];

  try {
    const skillDirs = readdirSync(skillsDir, { withFileTypes: true })
      .filter((d) => d.isDirectory());
    for (const d of skillDirs) {
      const skillMd = join(skillsDir, d.name, "SKILL.md");
      if (!existsSync(skillMd)) {
        violations.push({ skill: d.name, issue: "缺少 SKILL.md" });
        continue;
      }
      const fm = readFrontmatter(skillMd);
      if (!fm) {
        violations.push({ skill: d.name, issue: "SKILL.md 无有效 frontmatter" });
        continue;
      }
      for (const field of SKILL_REQUIRED) {
        if (!fm[field]) {
          violations.push({ skill: d.name, issue: `缺少必填字段: ${field}` });
        }
      }
    }
  } catch { /* ignore */ }

  // Agent frontmatter required fields
  const AGENT_REQUIRED = ["name", "description"];

  try {
    const agentFiles = readdirSync(agentsDir).filter((f) => f.endsWith(".md") && f !== "AGENT.md");
    for (const f of agentFiles) {
      const agentPath = join(agentsDir, f);
      const fm = readFrontmatter(agentPath);
      if (!fm) continue; // AGENT.md is the overview, no frontmatter required
      for (const field of AGENT_REQUIRED) {
        if (!fm[field]) {
          violations.push({ agent: f, issue: `缺少必填字段: ${field}` });
        }
      }
    }
  } catch { /* ignore */ }

  return {
    dim: "arch_frontmatter",
    label: ARCH_HEALTH_DIM_LABELS.arch_frontmatter,
    pass: violations.length === 0,
    checks: [{
      id: "frontmatter-complete",
      pass: violations.length === 0,
      detail: violations.length === 0
        ? "所有 Skill/Agent frontmatter 字段完整"
        : `${violations.length} 个 frontmatter 问题`,
      evidence: violations.slice(0, 15),
    }],
  };
}

// ── main ─────────────────────────────────────────────────────────────────

/**
 * Run all architecture compliance checks.
 * @param {string} projectRoot
 * @returns {{ pass: boolean, dimensions: Array, summary: object }}
 */
export function runArchCheck(projectRoot) {
  const dimensions = [
    checkKernel(projectRoot),
    checkParadigm(projectRoot),
    checkCoupling(projectRoot),
    checkSRP(projectRoot),
    checkDRY(projectRoot),
    checkYAGNI(projectRoot),
    checkOCP(projectRoot),
    checkFrontmatter(projectRoot),
  ];

  const totalChecks = dimensions.reduce((s, d) => s + d.checks.length, 0);
  const passedChecks = dimensions.reduce(
    (s, d) => s + d.checks.filter((c) => c.pass).length, 0
  );
  const failedDims = dimensions.filter((d) => !d.pass);

  const summary = {
    totalChecks,
    passedChecks,
    failedChecks: totalChecks - passedChecks,
    failedDimensions: failedDims.map((d) => d.label),
    overallPass: failedDims.length === 0,
    grade: failedDims.length === 0 ? "A"
      : failedDims.length <= 2 ? "B"
      : failedDims.length <= 4 ? "C"
      : "D",
  };

  return { pass: summary.overallPass, dimensions, summary };
}

/**
 * Generate a single-line summary string.
 */
export function archCheckShort(projectRoot) {
  const { summary } = runArchCheck(projectRoot);
  return `[arch] ${summary.grade}级 | ${summary.passedChecks}/${summary.totalChecks} 通过` +
    (summary.failedDimensions.length > 0
      ? ` | 失败: ${summary.failedDimensions.join(", ")}`
      : " | 全部通过");
}

// ── CLI ──────────────────────────────────────────────────────────────────

const _isMain = process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1];
if (_isMain) {
  const args = process.argv.slice(2);
  const root = findProjectRoot(process.cwd());

  if (args.includes("--short") || args.includes("-s")) {
    console.log(archCheckShort(root));
    process.exit(0);
  }

  const dimArg = args.indexOf("--dim");
  let result;
  if (dimArg >= 0 && args[dimArg + 1]) {
    const dim = args[dimArg + 1];
    const fullResult = runArchCheck(root);
    result = fullResult.dimensions.find((d) => d.dim === dim);
    if (!result) {
      console.error(`未知维度: ${dim}。可用: ${fullResult.dimensions.map((d) => d.dim).join(", ")}`);
      process.exit(1);
    }
  } else {
    result = runArchCheck(root);
  }

  if (args.includes("--json") || args.includes("-j")) {
    console.log(JSON.stringify(result, null, 2));
  } else {
    // Pretty print
    if (result.dimensions) {
      console.log("═══ 架构合规检查 ═══\n");
      for (const dim of result.dimensions) {
        const icon = dim.pass ? "✅" : "❌";
        console.log(`${icon} ${dim.label}`);
        for (const check of dim.checks) {
          const ci = check.pass ? "  ✓" : "  ✗";
          console.log(`${ci} ${check.detail}`);
        }
        console.log();
      }
      console.log(`总结: ${result.summary.grade}级 | ${result.summary.passedChecks}/${result.summary.totalChecks} 通过`);
    } else {
      // Single dimension
      console.log(JSON.stringify(result, null, 2));
    }
  }

  process.exit(result.pass ? 0 : 1);
}
