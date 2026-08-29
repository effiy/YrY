// ═══════════════════════════════════════════════════════════════════
// OKR 任务编排三要素 — skill / agent / mcp（纯函数，无 Vue 依赖）
//
// 参考 deepseek-harness「一切皆插件」：每个推荐任务除了「做什么」，
// 还要确定「用什么做」—— skill（能力 / 插件）、agent（角色 persona）、
// mcp（外部工具服务器）。
//
// 与 okrRecommend.ts 的 fallback→AI 升级模式一致：
//   - 确定性映射（角色 × 清单类型）作为兜底，保证离线可复现；
//   - AI 给出更贴切的 skill/agent/mcp 时按需采纳（id 需合法）。
// ═══════════════════════════════════════════════════════════════════
import { skills } from "@/views/knowledge/skills/constants";
import { rolesData } from "@/views/knowledge/executiver/okrData";

export type OkrSkill = string;
export type OkrAgent = string;
export type OkrMcp = "github" | "yiai" | "";

export interface Orchestration {
  skill: OkrSkill;
  agent: OkrAgent;
  mcp: OkrMcp;
}

const SKILL_IDS = new Set(skills.map(s => s.id));

/** 角色 → 主技能 + 候选（id 取自 skills/constants.ts 的 SkillDef.id）。 */
export const ROLE_SKILL: Record<string, { skill: string; candidates: string[] }> = {
  executiver: { skill: "business-strategy", candidates: ["business-strategy", "market-research", "mermaid"] },
  producter: { skill: "gen-brd", candidates: ["gen-brd", "market-research", "ui-ux"] },
  leader: { skill: "code-quality-research", candidates: ["code-quality-research", "mermaid", "github"] },
  engineer: { skill: "fastapi", candidates: ["fastapi", "vue", "nodejs", "github"] },
  srer: { skill: "nginx", candidates: ["nginx", "lighthouse", "tmux", "github"] },
  aier: { skill: "skill-creator", candidates: ["skill-creator", "mermaid", "code-quality-research"] },
  curator: { skill: "market-research", candidates: ["market-research", "import", "public-api"] }
};

/** 工程角色默认走 github MCP（代码 / 仓库操作），其余走 yiai（AI / 知识库）。 */
const ENGINEERING_ROLES = new Set(["engineer", "leader", "srer"]);

/** 解析 skill：AI 给出的 id 合法则采纳，否则回退到角色主技能（风险/冲刺清单给一点倾向）。 */
export function resolveSkill(role: string, listType?: string, aiSkill?: unknown): OkrSkill {
  const s = String(aiSkill ?? "").trim();
  if (s && SKILL_IDS.has(s)) return s;
  if (listType === "risk" && role === "srer") return "lighthouse";
  if (listType === "sprint" && role === "engineer") return "vue";
  return ROLE_SKILL[role]?.skill ?? "business-strategy";
}

/** 解析 agent：AI 给非空 persona 则采纳，否则由角色名派生（如 "Executive Agent"）。 */
export function resolveAgent(role: string, aiAgent?: unknown): OkrAgent {
  const s = String(aiAgent ?? "").trim();
  if (s) return s;
  const meta = rolesData[role];
  return meta ? `${meta.name} Agent` : "Executive Agent";
}

/** 解析 mcp：显式 github/yiai/none 采纳，缺失或非法回退到角色默认。 */
export function resolveMcp(role: string, aiMcp?: unknown): OkrMcp {
  if (aiMcp === undefined || aiMcp === null) {
    return ENGINEERING_ROLES.has(role) ? "github" : "yiai";
  }
  const s = String(aiMcp).trim().toLowerCase();
  if (s === "github") return "github";
  if (s === "yiai") return "yiai";
  if (s === "" || s === "none") return "";
  return ENGINEERING_ROLES.has(role) ? "github" : "yiai";
}

/** 归一化 / 兜底时统一补全三要素。 */
export function applyOrchestration(input: {
  role: string;
  listType?: string;
  skill?: unknown;
  agent?: unknown;
  mcp?: unknown;
}): Orchestration {
  return {
    skill: resolveSkill(input.role, input.listType, input.skill),
    agent: resolveAgent(input.role, input.agent),
    mcp: resolveMcp(input.role, input.mcp)
  };
}
