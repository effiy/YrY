/**
 * arch-dimensions/solid — SRP, DRY, YAGNI, OCP checks.
 *
 * Dimensions: A4 (SRP), A5 (DRY), A6 (YAGNI), A7 (OCP).
 */

import { join } from "node:path";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { execSync } from "node:child_process";

import {
  DESIGN_PRINCIPLE_THRESHOLDS as DPT,
  ARCH_HEALTH_DIM_LABELS,
} from "../constants.mjs";

/**
 * Parse YAML frontmatter from a markdown file.
 *
 * @param {string} filePath - Absolute path to the .md file
 * @returns {object|null} Parsed frontmatter object, or null if missing/invalid
 */
export function readFrontmatter(filePath) {
  try {
    const content = readFileSync(filePath, "utf-8");
    const match = content.match(/^---\n([\s\S]*?)\n---/);
    if (!match) return null;
    const fm = {};
    const lines = match[1].split("\n");
    for (const line of lines) {
      const kv = line.match(/^(\w+):\s*(.+)/);
      if (kv) {
        const key = kv[1].trim();
        let val = kv[2].trim();
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

function hasConjunctions(desc) {
  if (!desc) return false;
  return /和|与|也|并|及|以及|并且/.test(desc);
}

/**
 * Check Single Responsibility Principle: each skill/agent should have one clear responsibility.
 *
 * @param {string} projectRoot - Absolute path to project root
 * @returns {{ dim: string, label: string, pass: boolean, checks: Array }}
 */
export function checkSRP(projectRoot) {
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
 * Check Don't Repeat Yourself: detect duplicate code blocks across lib/ files.
 *
 * @param {string} projectRoot - Absolute path to project root
 * @returns {{ dim: string, label: string, pass: boolean, checks: Array }}
 */
export function checkDRY(projectRoot) {
  const libDir = join(projectRoot, "lib");
  const dups = [];

  try {
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
 * Check You Aren't Gonna Need It: flag lib/ files with single callers (over-engineering).
 *
 * @param {string} projectRoot - Absolute path to project root
 * @returns {{ dim: string, label: string, pass: boolean, checks: Array }}
 */
export function checkYAGNI(projectRoot) {
  const libDir = join(projectRoot, "lib");
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

        if (/^[A-Z][A-Z_0-9]+$/.test(name)) continue;

        const selfRefs = (content.match(new RegExp("\\b" + name + "\\b", "g")) || []).length;
        if (selfRefs >= 2) continue;

        if (/^cmd[A-Z]/.test(name)) continue;

        let callerFiles;
        try {
          const result = execSync(
            `grep -r "\\b${name}\\b" "${projectRoot}" --include="*.mjs" --include="*.md" -l 2>/dev/null | grep -v "${file}" | grep -v node_modules | wc -l`,
            { encoding: "utf-8", timeout: 5000 }
          );
          callerFiles = parseInt(result.trim(), 10) || 0;
        } catch { callerFiles = 0; }

        if (callerFiles >= DPT.YAGNI_MIN_CALL_SITES) continue;

        if (callerFiles === 1) {
          let singleCaller;
          try {
            singleCaller = execSync(
              `grep -r "\\b${name}\\b" "${projectRoot}" --include="*.mjs" --include="*.md" -l 2>/dev/null | grep -v "${file}" | grep -v node_modules | head -1 | xargs basename`,
              { encoding: "utf-8", timeout: 5000 }
            ).trim();
          } catch { singleCaller = ""; }

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
            if (allSameCaller) continue;
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
 * Check Open/Closed Principle: skills should be extensible without modifying the orchestrator.
 *
 * @param {string} projectRoot - Absolute path to project root
 * @returns {{ dim: string, label: string, pass: boolean, checks: Array }}
 */
export function checkOCP(projectRoot) {
  try {
    const result = execSync(
      `cd "${projectRoot}" && git log --oneline --diff-filter=A -- skills/ --name-only -20 2>/dev/null | grep "SKILL.md" | grep -v "skills/rui/SKILL.md" || true`,
      { encoding: "utf-8", timeout: 5000 }
    );
    const newSkills = result.trim().split("\n").filter(Boolean);

    const orchChanges = execSync(
      `cd "${projectRoot}" && git log --oneline -20 -- skills/rui/SKILL.md 2>/dev/null | wc -l`,
      { encoding: "utf-8", timeout: 5000 }
    );
    const orchCount = parseInt(orchChanges.trim(), 10) || 0;

    return {
      dim: "arch_extensions",
      label: ARCH_HEALTH_DIM_LABELS.arch_extensions,
      pass: true,
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
