#!/usr/bin/env node
/**
 * arch-check — Architecture compliance verification script
 *
 * Verifies all architecture and design principles defined in:
 *   - skills/rui/rules/architecture-principles.md
 *   - skills/rui/rules/design-principles.md
 *
 * Usage:
 *   node lib/arch-check.mjs                    # Full check
 *   node lib/arch-check.mjs --json             # JSON output only
 *   node lib/arch-check.mjs --dim <dimension>  # Single dimension
 *   node lib/arch-check.mjs --short            # Single-line summary
 *
 * Dimensions: kernel · paradigm · coupling · srp · dry · yagni · ocp · frontmatter · imports · extensions
 */

import { join } from "node:path";
import { existsSync, appendFileSync, mkdirSync } from "node:fs";
import { execSync } from "node:child_process";

import { findProjectRoot, isMain } from "./fs.mjs";
import { NODE_ARGV_OFFSET } from "./constants.mjs";

import { checkKernel, checkParadigm, checkCoupling } from "./arch-dimensions/kernel-paradigm.mjs";
import { checkSRP, checkDRY, checkYAGNI, checkOCP } from "./arch-dimensions/solid.mjs";
import { checkISP, checkFrontmatter, checkDocFreshness } from "./arch-dimensions/quality.mjs";

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

export function archCheckShort(projectRoot) {
  const { summary } = runArchCheck(projectRoot);
  return `[arch] ${summary.grade}级 | ${summary.passedChecks}/${summary.totalChecks} 通过` +
    (summary.failedDimensions.length > 0
      ? ` | 失败: ${summary.failedDimensions.join(", ")}`
      : " | 全部通过");
}

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

export function appendArchTrend(projectRoot) {
  const { summary } = runArchCheck(projectRoot);
  const trends = archScoresForTrend(projectRoot);

  let gitBranch = "unknown";
  try {
    gitBranch = execSync("git branch --show-current", { encoding: "utf-8", timeout: 3000 }).trim();
  } catch { /* ignore */ }

  const entry = {
    timestamp: new Date().toISOString(),
    ...trends,
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
      command: `find ${join(projectRoot, "skills")} -path "*/rules/*.md" | wc -l`,
      editHint: "非通用规则 → 移至对应 skills/<name>/rules/ 目录；规则现已整合入 skills/",
    },
    "kernel-orchestrator": {
      description: "rui 编排器接近行数上限，将可独立的路由逻辑拆分为子技能委托",
      file: join(projectRoot, "skills", "rui", "SKILL.md"),
      editHint: "将子命令路由表拆分为独立文件 skills/rui/lib/routes.mjs",
    },
    "paradigm-class": {
      description: "将 class 定义改写为纯函数 + 组合模式",
      command: `grep -rn "class |extends " ${join(projectRoot, "lib")} --include="*.mjs" | grep -v "//" | grep -v "*"`,
      editHint: "class → function + 组合（见 skills/rui-code/rules/code-paradigm.md §禁止 class/extends）",
    },
    "paradigm-default-export": {
      description: "将 export default 改为具名导出",
      command: `grep -rn "export default" ${join(projectRoot, "lib")} --include="*.mjs" | grep -v "//"`,
      editHint: "export default function foo → export function foo（见 skills/rui-code/rules/code-paradigm.md §具名导出）",
    },
    "paradigm-empty-catch": {
      description: "为空 catch 块添加显式错误处理",
      command: `grep -rn "catch\\s*{" ${join(projectRoot, "lib")} --include="*.mjs"`,
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
      editHint: "编辑 skills/<name>/<agent-role>.md 的 tools frontmatter，移除越权工具",
    },
    "frontmatter-complete": {
      description: "补全 SKILL.md 或 agent .md 的 frontmatter 必填字段",
      command: `node ${join(projectRoot, "lib", "arch-check.mjs")} --dim arch_frontmatter`,
      editHint: "对照 skills/rui/rules/architecture-principles.md §配置 API 规范 补全缺失字段",
    },
  };

  return FIXES[id] || {
    description: "手动审查并修复上述问题",
    command: null,
    file: null,
    editHint: null,
  };
}

const _isMain = isMain(import.meta.url);
if (_isMain) {
  const args = process.argv.slice(NODE_ARGV_OFFSET);
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
      console.log(JSON.stringify(result, null, 2));
    }
  }

  process.exit(result.pass ? 0 : 1);
}
