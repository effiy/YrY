/**
 * arch-dimensions/quality — ISP, frontmatter, doc freshness checks.
 *
 * Dimensions: A8 (ISP), A9 (frontmatter), A10 (doc freshness).
 */

import { join } from "node:path";
import { existsSync, readFileSync, readdirSync } from "node:fs";

import { ARCH_HEALTH_DIM_LABELS } from "../constants.mjs";

import { readFrontmatter } from "../arch-helpers.mjs";

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

export function checkISP(projectRoot) {
  const agentsDir = join(projectRoot, "agents");
  const violations = [];

  try {
    const agentFiles = readdirSync(agentsDir).filter((f) => f.endsWith(".md") && f !== "AGENT.md");
    for (const file of agentFiles) {
      const agentName = file.replace(".md", "");
      const spec = AGENT_TOOL_SPEC[agentName];
      if (!spec) continue;

      const agentPath = join(agentsDir, file);
      const fm = readFrontmatter(agentPath);
      if (!fm || !fm.tools) {
        violations.push({ agent: agentName, issue: "缺少 tools 声明" });
        continue;
      }

      let tools = [];
      const toolsRaw = fm.tools;
      if (typeof toolsRaw === "string") {
        tools = toolsRaw.replace(/[\[\]"\s]/g, "").split(",").filter(Boolean);
      }

      for (const tool of tools) {
        if (spec.forbid.includes(tool)) {
          violations.push({
            agent: agentName,
            issue: `${agentName} 不应有 ${tool} 工具（职责边界外）`,
            tool,
          });
        }
      }

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
    label: ARCH_HEALTH_DIM_LABELS.arch_isp,
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

export function checkFrontmatter(projectRoot) {
  const skillsDir = join(projectRoot, "skills");
  const agentsDir = join(projectRoot, "agents");
  const violations = [];

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

  const AGENT_REQUIRED = ["name", "description"];

  try {
    const agentFiles = readdirSync(agentsDir).filter((f) => f.endsWith(".md") && f !== "AGENT.md");
    for (const f of agentFiles) {
      const agentPath = join(agentsDir, f);
      const fm = readFrontmatter(agentPath);
      if (!fm) continue;
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

export function checkDocFreshness(projectRoot) {
  const violations = [];
  const claudePath = join(projectRoot, "CLAUDE.md");

  if (existsSync(claudePath)) {
    try {
      const content = readFileSync(claudePath, "utf-8");
      const linkRe = /\[([^\]]+)\]\(\.\/([^)]+)\)/g;
      let match;
      while ((match = linkRe.exec(content)) !== null) {
        const linkText = match[1];
        const linkPath = match[2].replace(/#.*$/, "");
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
    label: ARCH_HEALTH_DIM_LABELS.arch_docs,
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
