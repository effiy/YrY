/**
 * arch-dimensions/kernel-paradigm — Kernel size, paradigm, coupling checks.
 *
 * Dimensions: A1 (kernel), A2 (paradigm), A3 (coupling).
 */

import { join } from "node:path";
import { existsSync, readdirSync, statSync } from "node:fs";
import { execSync } from "node:child_process";

import {
  KERNEL_LIB_MAX_FILES,
  KERNEL_RULES_MAX_FILES,
  KERNEL_ORCHESTRATOR_MAX_LINES,
  KERNEL_RULE_FILES,
  DESIGN_PRINCIPLE_THRESHOLDS as DPT,
  ARCH_HEALTH_DIM_LABELS,
} from "../constants.mjs";

import { grepLines, countFiles, fileLineCount } from "../arch-helpers.mjs";

export function checkKernel(projectRoot) {
  const libDir = join(projectRoot, "lib");
  const skillsDir = join(projectRoot, "skills");
  const orchFile = join(projectRoot, "skills", "rui", "SKILL.md");

  const libCount = countFiles(libDir, "*.mjs");
  const orchLines = fileLineCount(orchFile);

  // Rules are now integrated into skills/*/rules/ — search recursively
  let rulesCount = 0;
  for (const f of KERNEL_RULE_FILES) {
    // Search across all skills/*/rules/ directories
    try {
      const skillDirs = readdirSync(skillsDir, { withFileTypes: true })
        .filter((d) => d.isDirectory());
      let found = false;
      for (const sd of skillDirs) {
        if (existsSync(join(skillsDir, sd.name, "rules", f))) {
          found = true;
          break;
        }
      }
      if (found) rulesCount++;
    } catch { /* dir read error, keep rulesCount as-is */ }
  }

  const CREEP_RATIO = 0.8;
  const libCreep = libCount >= KERNEL_LIB_MAX_FILES * CREEP_RATIO;
  const rulesCreep = rulesCount >= KERNEL_RULES_MAX_FILES * CREEP_RATIO;
  const orchCreep = orchLines >= KERNEL_ORCHESTRATOR_MAX_LINES * CREEP_RATIO;

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

  if (libCreep || rulesCreep || orchCreep) {
    checks.push({
      id: "kernel-creep",
      pass: true,
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

export function checkParadigm(projectRoot) {
  const libDir = join(projectRoot, "lib");
  const skillsDir = join(projectRoot, "skills");

  const selfPath = join(projectRoot, "lib", "arch-check.mjs");
  const classLines = grepLines("\\bclass\\b|\\bextends\\b", libDir).filter(
    (l) => !l.startsWith(selfPath) && !l.includes("//") && !l.includes("*") && !l.includes("Allowable")
  );
  const skillClassLines = grepLines("\\bclass\\b|\\bextends\\b", skillsDir).filter(
    (l) => !l.includes("//") && !l.includes("*")
  );

  const defaultExportLine = grepLines("export default \\b(function|const|let|var|class|async)\\b", libDir).filter(
    (l) => !l.startsWith(selfPath) && !l.includes("//") && !l.includes("*")
  );

  let emptyCatchCount = 0;
  try {
    const result = execSync(
      `grep -rn "catch\\s*{\\s*}" "${libDir}" --include="*.mjs" 2>/dev/null || true`,
      { encoding: "utf-8", timeout: 5000 }
    );
    emptyCatchCount = result.trim().split("\n")
      .filter(Boolean)
      .filter((l) => !l.startsWith(selfPath))
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
      pass: defaultExportLine.length <= DPT.PARADIGM_MAX_DEFAULT_EXPORT,
      detail: defaultExportLine.length === 0
        ? "无 export default 违规"
        : `${defaultExportLine.length} 处 export default 违规`,
      evidence: defaultExportLine.slice(0, 5),
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

export function checkCoupling(projectRoot) {
  const skillsDir = join(projectRoot, "skills");
  const agentsDir = join(projectRoot, "agents");

  const skillImports = grepLines("from.*skills/", skillsDir).filter(
    (l) => !l.includes("../../lib/") && !l.includes("node_modules") &&
         !/^\s*\*/.test(l.split(":")[2] || "") &&    // exclude comment lines
         !/^\s*\/\//.test(l.split(":")[2] || "") &&   // exclude // comments
         !/"[^"]*from[^"]*skills\/[^"]*"/.test(l)     // exclude string literals
  );

  const agentImports = grepLines("from.*skills/", agentsDir, ".md").filter(
    (l) => !l.includes("SKILL.md")
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
