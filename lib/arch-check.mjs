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
import { existsSync, readFileSync, readdirSync, statSync, appendFileSync, mkdirSync } from "node:fs";
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
 * A1: Kernel size constraints with creep detection.
 *
 * Creep warning triggers at 80% of limit — the kernel is still healthy
 * but growth should be reviewed before it becomes a violation.
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

  // Creep threshold: 80% of limit
  const CREEP_RATIO = 0.8;
  const libCreep = libCount >= KERNEL_LIB_MAX_FILES * CREEP_RATIO;
  const rulesCreep = rulesCount >= KERNEL_RULES_MAX_FILES * CREEP_RATIO;
  const orchCreep = orchLines >= KERNEL_ORCHESTRATOR_MAX_LINES * CREEP_RATIO;

  // List newest lib files (potential creep candidates)
  let newestLib = [];
  try {
    const files = readdirSync(libDir).filter((f) => f.endsWith(".mjs"));
    const withMtime = files.map((f) => ({
      name: f,
      mtime: statSync(join(libDir, f)).mtime.getTime(),
    }));
    withMtime.sort((a, b) => b.mtime - a.mtime);
    newestLib = withMtime.slice(0, 5).map((f) => f.name);
  } catch { /* ignore */ }

  const checks = [
    {
      id: "kernel-lib",
      pass: libCount <= KERNEL_LIB_MAX_FILES,
      detail: `lib/ 文件数 ${libCount}/${KERNEL_LIB_MAX_FILES}` +
        (libCreep ? ` ⚠️ 接近上限 (${Math.round(libCount/KERNEL_LIB_MAX_FILES*100)}%)` : ""),
      evidence: { count: libCount, creep: libCreep, newest: newestLib },
    },
    {
      id: "kernel-rules",
      pass: rulesCount <= KERNEL_RULES_MAX_FILES,
      detail: `内核规则数 ${rulesCount}/${KERNEL_RULES_MAX_FILES}` +
        (rulesCreep ? ` ⚠️ 接近上限 (${Math.round(rulesCount/KERNEL_RULES_MAX_FILES*100)}%)` : ""),
      evidence: { count: rulesCount, creep: rulesCreep },
    },
    {
      id: "kernel-orchestrator",
      pass: orchLines <= KERNEL_ORCHESTRATOR_MAX_LINES,
      detail: `rui 编排器 ${orchLines}/${KERNEL_ORCHESTRATOR_MAX_LINES} 行` +
        (orchCreep ? ` ⚠️ 接近上限 (${Math.round(orchLines/KERNEL_ORCHESTRATOR_MAX_LINES*100)}%)` : ""),
      evidence: { lines: orchLines, creep: orchCreep },
    },
  ];

  // Add creep analysis if any dimension is in creep zone
  if (libCreep || rulesCreep || orchCreep) {
    checks.push({
      id: "kernel-creep",
      pass: true, // Warning only, not a failure
      detail: `内核蠕变预警: ${[
        libCreep && `lib/ ${libCount}/${KERNEL_LIB_MAX_FILES}`,
        rulesCreep && `规则 ${rulesCount}/${KERNEL_RULES_MAX_FILES}`,
        orchCreep && `编排器 ${orchLines}/${KERNEL_ORCHESTRATOR_MAX_LINES}行`,
      ].filter(Boolean).join(", ")}。审查新增文件是否可作为扩展存在`,
      evidence: { libCreep, rulesCreep, orchCreep, newestLib },
    });
  }

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

  // Empty catch blocks — single-line catch{} with truly empty body
  let emptyCatchCount = 0;
  try {
    const result = execSync(
      `grep -rn "catch\\s*{\\s*}" "${libDir}" --include="*.mjs" 2>/dev/null || true`,
      { encoding: "utf-8", timeout: 5000 }
    );
    emptyCatchCount = result.trim().split("\n")
      .filter(Boolean)
      .filter((l) => !l.startsWith(selfPath)) // exclude self
      .length;
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
 *
 * Exemption categories (not counted as YAGNI violations):
 *   1. CONFIG_CONSTANTS — UPPER_CASE named exports (configuration data)
 *   2. INTERNAL_UTILITIES — called ≥2 times within own file (export + 2 calls = 3 refs)
 *   3. COMMAND_HANDLERS — cmd[A-Z] pattern (CLI entry points, dispatched dynamically)
 *   4. MODULE_COHESION — all exports from this file consumed by the same single caller file
 *      (the module itself is the unit of reuse; individual functions need not have 2+ callers)
 */
function checkYAGNI(projectRoot) {
  const libDir = join(projectRoot, "lib");
  const skillsDir = join(projectRoot, "skills");
  const singleCallers = [];

  try {
    const files = readdirSync(libDir).filter((f) =>
      f.endsWith(".mjs") && f !== "constants.mjs" && f !== "arch-check.mjs"
    );
    for (const file of files) {
      const filePath = join(libDir, file);
      const content = readFileSync(filePath, "utf-8");
      const exports = content.match(/export (?:const|function|let|var) (\w+)/g);
      if (!exports) continue;

      for (const exp of exports) {
        const name = exp.replace(/export (?:const|function|let|var) /, "");

        // Exemption 1: CONFIG_CONSTANTS (UPPER_CASE with underscores)
        if (/^[A-Z][A-Z_0-9]+$/.test(name)) continue;

        // Exemption 2: INTERNAL_UTILITIES — called ≥1 time within own file
        const selfRefs = (content.match(new RegExp("\\b" + name + "\\b", "g")) || []).length;
        if (selfRefs >= 2) continue; // ≥2 = export declaration + ≥1 internal call

        // Exemption 3: COMMAND_HANDLERS — cmdXxx pattern (CLI entry points)
        if (/^cmd[A-Z]/.test(name)) continue;

        // Count external callers (in .mjs, .md files, excluding self and node_modules)
        let callerFiles;
        try {
          const result = execSync(
            `grep -r "\\b${name}\\b" "${projectRoot}" --include="*.mjs" --include="*.md" -l 2>/dev/null | grep -v "${file}" | grep -v node_modules | wc -l`,
            { encoding: "utf-8", timeout: 5000 }
          );
          callerFiles = parseInt(result.trim(), 10) || 0;
        } catch { callerFiles = 0; }

        if (callerFiles >= DPT.YAGNI_MIN_CALL_SITES) continue;

        // Exemption 4: MODULE_COHESION — check if all exports from this file
        // are consumed by the same single caller (module is the abstraction unit)
        if (callerFiles === 1) {
          // Get the single caller file name
          let singleCaller;
          try {
            singleCaller = execSync(
              `grep -r "\\b${name}\\b" "${projectRoot}" --include="*.mjs" --include="*.md" -l 2>/dev/null | grep -v "${file}" | grep -v node_modules | head -1 | xargs basename`,
              { encoding: "utf-8", timeout: 5000 }
            ).trim();
          } catch { singleCaller = ""; }

          // Check if other exports from this file also only have this same caller
          if (singleCaller) {
            const otherExports = exports
              .map((e) => e.replace(/export (?:const|function|let|var) /, ""))
              .filter((n) => n !== name && !n.startsWith("_") && !/^[A-Z][A-Z_0-9]+$/.test(n) && !/^cmd[A-Z]/.test(n));

            let allSameCaller = otherExports.length > 0;
            for (const other of otherExports) {
              try {
                const otherCallers = execSync(
                  `grep -r "\\b${other}\\b" "${projectRoot}" --include="*.mjs" --include="*.md" -l 2>/dev/null | grep -v "${file}" | grep -v node_modules | wc -l`,
                  { encoding: "utf-8", timeout: 3000 }
                );
                if (parseInt(otherCallers.trim(), 10) > 1) {
                  allSameCaller = false;
                  break;
                }
              } catch { /* ignore */ }
            }
            if (allSameCaller) continue; // Module is the unit of reuse
          }
        }

        singleCallers.push({ file, name, callers: callerFiles });
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
        ? "所有 lib export 有 ≥2 个调用方（含豁免项）"
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
 * A8: ISP — Interface Segregation for agents
 * Each agent's tools must match its responsibilities.
 * Over-provisioned tools = ISP violation.
 */

// Expected tool sets per agent role (from rules/design-principles.md §ISP)
const AGENT_TOOL_SPEC = {
  pm:              { allowed: ["Read", "Grep", "Glob", "Bash"],             forbid: ["Edit", "Write"] },
  planner:         { allowed: ["Read", "Grep", "Glob", "Bash"],             forbid: ["Edit", "Write"] },
  coder:           { allowed: ["Read", "Grep", "Glob", "Edit", "Write", "Bash"], forbid: [] },
  tester:          { allowed: ["Read", "Grep", "Glob", "Bash"],             forbid: ["Edit", "Write"] },
  reporter:        { allowed: ["Read", "Grep", "Glob"],                     forbid: ["Edit", "Write", "Bash"] },
  "code-reviewer": { allowed: ["Read", "Grep", "Glob", "Bash"],             forbid: ["Edit", "Write"] },
  security:        { allowed: ["Read", "Grep", "Glob"],                     forbid: ["Edit", "Write", "Bash"] },
  "self-improve":  { allowed: ["Read", "Grep", "Glob", "Bash"],             forbid: ["Edit", "Write"] },
  architect:       { allowed: ["Read", "Grep", "Glob"],                     forbid: ["Edit", "Write", "Bash"] },
};

function checkISP(projectRoot) {
  const agentsDir = join(projectRoot, "agents");
  const violations = [];

  try {
    const agentFiles = readdirSync(agentsDir).filter((f) => f.endsWith(".md") && f !== "AGENT.md");
    for (const file of agentFiles) {
      const agentName = file.replace(".md", "");
      const spec = AGENT_TOOL_SPEC[agentName];
      if (!spec) continue; // Unknown agent, skip

      const agentPath = join(agentsDir, file);
      const fm = readFrontmatter(agentPath);
      if (!fm || !fm.tools) {
        violations.push({ agent: agentName, issue: "缺少 tools 声明" });
        continue;
      }

      // Parse tools field — may be YAML list string like "[Read, Grep, Glob]"
      let tools = [];
      const toolsRaw = fm.tools;
      if (typeof toolsRaw === "string") {
        tools = toolsRaw.replace(/[\[\]"\s]/g, "").split(",").filter(Boolean);
      }

      // Check for forbidden tools
      for (const tool of tools) {
        if (spec.forbid.includes(tool)) {
          violations.push({
            agent: agentName,
            issue: `${agentName} 不应有 ${tool} 工具（职责边界外）`,
            tool,
          });
        }
      }

      // Check for over-provisioning: tools > 1.5× expected minimum
      const expectedMin = spec.allowed.length;
      if (tools.length > expectedMin * 1.5 && tools.length > expectedMin) {
        violations.push({
          agent: agentName,
          issue: `工具集过大: ${tools.length} 个 (预期 ≤ ${expectedMin})。检查是否违反 ISP`,
          tools,
          expected: spec.allowed,
        });
      }
    }
  } catch { /* ignore */ }

  return {
    dim: "arch_isp",
    label: "ISP 合规",
    pass: violations.length === 0,
    checks: [{
      id: "isp-tools",
      pass: violations.length === 0,
      detail: violations.length === 0
        ? "所有 Agent 工具集符合 ISP"
        : `${violations.length} 个 Agent 工具集违规`,
      evidence: violations.slice(0, 10),
    }],
  };
}

/**
 * A9: Frontmatter completeness — config API compliance
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

/**
 * A10: Documentation freshness — verify CLAUDE.md guide links and doc references
 * are valid (point to existing files).
 */
function checkDocFreshness(projectRoot) {
  const violations = [];
  const claudePath = join(projectRoot, "CLAUDE.md");

  // Verify CLAUDE.md guide links are valid
  if (existsSync(claudePath)) {
    try {
      const content = readFileSync(claudePath, "utf-8");
      // Extract markdown links: [text](./path) or [text](path)
      const linkRe = /\[([^\]]+)\]\(\.\/([^)]+)\)/g;
      let match;
      while ((match = linkRe.exec(content)) !== null) {
        const linkText = match[1];
        const linkPath = match[2].replace(/#.*$/, ""); // Remove anchor
        const fullPath = join(projectRoot, linkPath);
        if (!existsSync(fullPath)) {
          violations.push({
            file: "CLAUDE.md",
            link: linkPath,
            text: linkText,
            issue: "链接目标不存在",
          });
        }
      }
    } catch { /* ignore */ }
  }

  // Verify each SKILL.md references agents that exist
  const skillsDir = join(projectRoot, "skills");
  const agentsDir = join(projectRoot, "agents");
  if (existsSync(skillsDir) && existsSync(agentsDir)) {
    try {
      const agentFiles = readdirSync(agentsDir).filter((f) => f.endsWith(".md") && f !== "AGENT.md");
      const agentNames = agentFiles.map((f) => f.replace(".md", ""));

      const skillDirs = readdirSync(skillsDir, { withFileTypes: true })
        .filter((d) => d.isDirectory());
      for (const d of skillDirs) {
        const skillMd = join(skillsDir, d.name, "SKILL.md");
        if (!existsSync(skillMd)) continue;
        const fm = readFrontmatter(skillMd);
        if (!fm || !fm.agents) continue;

        // Parse agents field (YAML inline object)
        const agentsRaw = fm.agents;
        const declaredAgents = [];
        const agentMatch = agentsRaw.match(/required:\s*\[([^\]]*)\]/);
        if (agentMatch) {
          agentMatch[1].split(",").forEach((a) => {
            const name = a.trim().replace(/["']/g, "");
            if (name) declaredAgents.push(name);
          });
        }
        const optMatch = agentsRaw.match(/optional:\s*\[([^\]]*)\]/);
        if (optMatch) {
          optMatch[1].split(",").forEach((a) => {
            const name = a.trim().replace(/["']/g, "");
            if (name) declaredAgents.push(name);
          });
        }

        for (const ag of declaredAgents) {
          if (!agentNames.includes(ag)) {
            violations.push({
              skill: d.name,
              agent: ag,
              issue: `引用的 Agent "${ag}" 不存在于 agents/ 目录`,
            });
          }
        }
      }
    } catch { /* ignore */ }
  }

  return {
    dim: "arch_docs",
    label: "文档新鲜度",
    pass: violations.length === 0,
    checks: [{
      id: "docs-fresh",
      pass: violations.length === 0,
      detail: violations.length === 0
        ? "文档链接和引用均有效"
        : `${violations.length} 处文档引用失效`,
      evidence: violations.slice(0, 10),
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
    checkISP(projectRoot),
    checkFrontmatter(projectRoot),
    checkDocFreshness(projectRoot),
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

/**
 * Build a health-trend compatible arch scores object.
 * Can be merged into health-trend.jsonl entries.
 */
export function archScoresForTrend(projectRoot) {
  const { dimensions, summary } = runArchCheck(projectRoot);
  const scores = {};
  for (const dim of dimensions) {
    const passed = dim.checks.filter((c) => c.pass).length;
    const total = dim.checks.length;
    scores[dim.dim] = total > 0 ? Math.round((passed / total) * 100) : 100;
  }
  return {
    archComposite: summary.passedChecks > 0
      ? Math.round((summary.passedChecks / summary.totalChecks) * 100)
      : 100,
    archGrade: summary.grade,
    archScores: scores,
    archFailedDims: summary.failedDimensions,
  };
}

/**
 * Append an architecture health trend entry to .memory/arch-trend.jsonl.
 * Returns the appended entry or null on failure.
 */
export function appendArchTrend(projectRoot) {
  const { summary, dimensions } = runArchCheck(projectRoot);
  const scores = {};
  for (const dim of dimensions) {
    const passed = dim.checks.filter((c) => c.pass).length;
    const total = dim.checks.length;
    scores[dim.dim] = total > 0 ? Math.round((passed / total) * 100) : 100;
  }

  let gitBranch = "unknown";
  try {
    gitBranch = execSync("git branch --show-current", { encoding: "utf-8", timeout: 3000 }).trim();
  } catch { /* ignore */ }

  const entry = {
    timestamp: new Date().toISOString(),
    archComposite: summary.passedChecks > 0
      ? Math.round((summary.passedChecks / summary.totalChecks) * 100)
      : 100,
    archGrade: summary.grade,
    archScores: scores,
    archFailedDims: summary.failedDimensions,
    totalChecks: summary.totalChecks,
    passedChecks: summary.passedChecks,
    gitBranch,
  };

  try {
    const trendPath = join(projectRoot, ".memory", "arch-trend.jsonl");
    const dir = join(projectRoot, ".memory");
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
    appendFileSync(trendPath, JSON.stringify(entry) + "\n", "utf-8");
    return entry;
  } catch {
    return null;
  }
}

// ── CLI ──────────────────────────────────────────────────────────────────

const _isMain = process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1];
if (_isMain) {
  const args = process.argv.slice(2);
  const root = findProjectRoot(process.cwd());

  if (args.includes("--append-trend")) {
    const entry = appendArchTrend(root);
    if (entry) {
      console.log(`[arch] 趋势已追加: ${entry.archGrade}级 ${entry.archComposite}分`);
      process.exit(0);
    } else {
      console.error("[arch] 趋势追加失败");
      process.exit(1);
    }
  }

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
  } else if (args.includes("--fix") || args.includes("--fix-dry-run")) {
    // Output fix suggestions for each failed check
    const dryRun = args.includes("--fix-dry-run");
    console.log(dryRun ? "═══ 架构修复建议（dry-run） ═══\n" : "═══ 架构修复 ═══\n");

    let fixCount = 0;
    for (const dim of result.dimensions) {
      for (const check of dim.checks) {
        if (check.pass) continue;
        fixCount++;

        const fix = suggestFix(check, dim, root);
        if (fix) {
          console.log(`🔧 ${dim.label} > ${check.id}`);
          console.log(`   问题: ${check.detail}`);
          console.log(`   修复: ${fix.description}`);
          if (fix.command) {
            console.log(`   命令: ${fix.command}`);
          }
          if (fix.file && fix.editHint) {
            console.log(`   文件: ${fix.file}`);
            console.log(`   操作: ${fix.editHint}`);
          }
          console.log();
        }
      }
    }

    if (fixCount === 0) {
      console.log("✅ 无需修复，所有检查已通过");
    } else {
      console.log(`共 ${fixCount} 项需修复。使用 --fix 查看此建议，手动执行修复。`);
    }
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

/**
 * Suggest fixes for common architecture violations.
 * Returns { description, command?, file?, editHint? } or null if not auto-fixable.
 */
function suggestFix(check, dim, projectRoot) {
  const id = check.id;

  const FIXES = {
    "kernel-lib": {
      description: "审查 lib/ 中最新的文件，确定是否可作为独立 Skill 或合并到现有模块",
      command: `ls -lt ${join(projectRoot, "lib")}/*.mjs | head -10`,
      file: null,
      editHint: "将可独立的功能提升为 skills/<name>/；将仅被单一模块使用的工具函数内联到调用方",
    },
    "kernel-rules": {
      description: "审查内核规则文件，将专项规则（非跨 ≥3 个 Skill 的约束）降级为 Skill 级规则",
      command: `ls ${join(projectRoot, "rules")}/*.md | wc -l`,
      editHint: "非通用规则 → 移至对应 skills/<name>/ 目录",
    },
    "kernel-orchestrator": {
      description: "rui 编排器接近行数上限，将可独立的路由逻辑拆分为子技能委托",
      file: join(projectRoot, "skills", "rui", "SKILL.md"),
      editHint: "将子命令路由表拆分为独立文件 skills/rui/lib/routes.mjs",
    },
    "paradigm-class": {
      description: "将 class 定义改写为纯函数 + 组合模式",
      command: `grep -rn "class |extends " ${join(projectRoot, "lib")} --include="*.mjs" | grep -v "//" | grep -v "*"`,
      editHint: "class → function + 组合（见 rules/code-paradigm.md §禁止 class/extends）",
    },
    "paradigm-default-export": {
      description: "将 export default 改为具名导出",
      command: `grep -rn "export default" ${join(projectRoot, "lib")} --include="*.mjs" | grep -v "//"`,
      editHint: "export default function foo → export function foo（见 rules/code-paradigm.md §具名导出）",
    },
    "paradigm-empty-catch": {
      description: "为空 catch 块添加显式错误处理",
      command: `grep -rn "catch\s*{" ${join(projectRoot, "lib")} --include="*.mjs"`,
      editHint: "catch {} → catch (err) { /* 记录或传播错误 */ }",
    },
    "coupling-skill-skill": {
      description: "将跨 Skill 直接 import 改为通过 lib/ 共享库或 rui 编排器路由",
      editHint: "import { x } from '../../skills/other/...' → import { x } from '../../lib/shared.mjs'",
    },
    "coupling-agent-skill": {
      description: "Agent 文件不应直接引用 Skill 内部路径",
      editHint: "删除 Agent 中的 Skill 内部 import，Agent 通过编排器委托 Skill",
    },
    "srp-description": {
      description: "重写 Skill description，去除并列连词（和/与/也/并/及）",
      editHint: "将 '做 A 和 B 和 C' 拆分为独立 Skill，或重新表述为单一职责",
    },
    "yagni-single-caller": {
      description: "审查单调用方 export：若为内部工具则标记 _ 前缀，若为配置常量则豁免，否则内联",
      editHint: "内部工具 → 加 _ 前缀；配置常量 → UPPER_CASE；单调用方 → 内联到调用文件",
    },
    "isp-tools": {
      description: "移除 Agent 职责边界外的工具",
      editHint: "编辑 agents/<name>.md 的 tools frontmatter，移除越权工具",
    },
    "frontmatter-complete": {
      description: "补全 SKILL.md 或 agent .md 的 frontmatter 必填字段",
      command: `node ${join(projectRoot, "lib", "arch-check.mjs")} --dim arch_frontmatter`,
      editHint: "对照 rules/architecture-principles.md §配置 API 规范 补全缺失字段",
    },
  };

  return FIXES[id] || {
    description: "手动审查并修复上述问题",
    command: null,
    file: null,
    editHint: null,
  };
}
