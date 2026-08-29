/**
 * Claude Skills service — read/write .claude/skills/ files via YiAi
 * project-file I/O endpoints.
 *
 * Each skill lives at `.claude/skills/<name>/SKILL.md` under the
 * projects_root (YrY/), NOT under YiAi/static/. All four operations
 * (read/write/delete-folder/rename-folder) use the project-aware YiAi
 * endpoints that resolve against `projects_root` and auto-detect
 * `.claude` as the first path segment.
 */
import { buildYiAiUrl, yiAiAuthHeaders } from "@/config/yiweb";

// ── Types ────────────────────────────────────────────────────────────────────

export interface ClaudeSkillMeta {
  /** Directory name under .claude/skills/ */
  name: string;
  /** Parsed from SKILL.md YAML frontmatter */
  description: string;
  /** Derived from skill content / directory structure */
  category: "code" | "tools" | "init" | "other";
  /** File path relative to project root */
  filePath: string;
  /** Raw SKILL.md content (only populated on detail read) */
  content?: string;
  /** Frontmatter body (everything after ---) (only populated on detail read) */
  body?: string;
  /** Parsed frontmatter fields */
  frontmatter?: Record<string, any>;
  /** File size in bytes */
  size?: number;
  /** Usage reference count in codebase */
  usageCount?: number;
}

export interface SkillUsageRef {
  file: string;
  line: number;
  snippet: string;
}

// ── Known skill registry ─────────────────────────────────────────────────────
// This is the canonical list of skill directories under .claude/skills/.
// When skills are added/deleted, update this list to keep the UI in sync.

export const KNOWN_SKILLS: string[] = [
  "chrome", "css", "fastapi", "git", "github", "h5",
  "import", "lighthouse", "mermaid", "nginx", "nodejs",
  "public-api", "skill-creator", "tauri", "tmux", "ui-ux",
  "vite", "vue", "yry-init", "yry-npm", "yry-optimize-meta-columns"
];

const SKILL_CATEGORIES: Record<string, ClaudeSkillMeta["category"]> = {
  "yry-init": "init",
  "yry-npm": "tools",
  "yry-optimize-meta-columns": "tools",
  github: "tools",
  import: "tools",
  lighthouse: "tools",
  mermaid: "tools",
  "skill-creator": "tools",
  tmux: "tools",
  "ui-ux": "tools",
  git: "tools",
  "public-api": "tools",
  // Everything else is "code" (framework/language skills)
};

function getCategory(name: string): ClaudeSkillMeta["category"] {
  return SKILL_CATEGORIES[name] ?? "code";
}

// ── File I/O helpers ─────────────────────────────────────────────────────────

async function postJson<T>(path: string, body: Record<string, unknown>): Promise<T> {
  const url = buildYiAiUrl(path);
  const resp = await fetch(url, {
    method: "POST",
    headers: yiAiAuthHeaders(),
    body: JSON.stringify(body)
  });
  if (!resp.ok) {
    const text = await resp.text().catch(() => "");
    throw new Error(`${path} HTTP ${resp.status}: ${text}`);
  }
  return resp.json();
}

function skillFilePath(name: string): string {
  return `.claude/skills/${name}/SKILL.md`;
}

// ── YAML frontmatter parser ──────────────────────────────────────────────────

/**
 * Parse SKILL.md content into frontmatter + body.
 * Frontmatter is the YAML block between the first two `---` lines.
 */
function parseFrontmatter(raw: string): { frontmatter: Record<string, any>; body: string } {
  const parts = raw.split(/^---\s*$/m);
  if (parts.length >= 3 && raw.startsWith("---")) {
    const yamlBlock = parts[1];
    const body = parts.slice(2).join("---").trim();
    const fm: Record<string, any> = {};
    // Simple YAML parser (handles scalar values, lists can be added later)
    for (const line of yamlBlock.split("\n")) {
      const m = line.match(/^(\w[\w-]*)\s*:\s*(.*)/);
      if (m) {
        const key = m[1];
        let val: any = m[2].trim();
        // Unquote
        if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
          val = val.slice(1, -1);
        }
        // Boolean
        if (val === "true") val = true;
        else if (val === "false") val = false;
        fm[key] = val;
      }
    }
    return { frontmatter: fm, body };
  }
  return { frontmatter: {}, body: raw };
}

/** Project parameter for /read-project-file. The function auto-detects the
 * actual project from the first path segment (`.claude`), so this value is
 * only a placeholder to satisfy the non-empty validation. */
const SKILL_PROJECT = ".";

// ── Public API ───────────────────────────────────────────────────────────────

/** List all skills: read each SKILL.md, parse frontmatter, return metadata. */
export async function listClaudeSkills(): Promise<ClaudeSkillMeta[]> {
  const results = await Promise.allSettled(
    KNOWN_SKILLS.map(async (name) => {
      try {
        const data = await postJson<{ content?: string; data?: { content?: string } }>("/read-project-file", {
          project: SKILL_PROJECT,
          target_file: skillFilePath(name)
        });
        const raw = data?.data?.content ?? data?.content ?? "";
        const { frontmatter } = parseFrontmatter(raw);
        return {
          name,
          description: frontmatter.description || frontmatter.name || name,
          category: getCategory(name),
          filePath: skillFilePath(name),
          size: raw.length
        } as ClaudeSkillMeta;
      } catch {
        // Skill file doesn't exist or is unreadable — still show in list
        return {
          name,
          description: "(file not found or unreadable)",
          category: getCategory(name),
          filePath: skillFilePath(name)
        } as ClaudeSkillMeta;
      }
    })
  );

  return results
    .filter((r): r is PromiseFulfilledResult<ClaudeSkillMeta> => r.status === "fulfilled")
    .map((r) => r.value)
    .sort((a, b) => a.name.localeCompare(b.name));
}

/** Read a single skill's full SKILL.md content. */
export async function readClaudeSkill(name: string): Promise<ClaudeSkillMeta> {
  const data = await postJson<{ content?: string; data?: { content?: string } }>("/read-project-file", {
    project: SKILL_PROJECT,
    target_file: skillFilePath(name)
  });
  const raw = data?.data?.content ?? data?.content ?? "";
  const { frontmatter, body } = parseFrontmatter(raw);
  return {
    name,
    description: frontmatter.description || name,
    category: getCategory(name),
    filePath: skillFilePath(name),
    content: raw,
    body,
    frontmatter,
    size: raw.length
  };
}

/** Write (create or update) a skill's SKILL.md. */
export async function writeClaudeSkill(name: string, content: string): Promise<void> {
  await postJson("/write-project-file", {
    project: SKILL_PROJECT,
    target_file: skillFilePath(name),
    content
  });
}

/** Delete a skill directory entirely. */
export async function deleteClaudeSkill(name: string): Promise<void> {
  await postJson("/delete-project-folder", {
    project: SKILL_PROJECT,
    target_dir: `.claude/skills/${name}`
  });
}

/** Rename a skill directory. */
export async function renameClaudeSkill(oldName: string, newName: string): Promise<void> {
  await postJson("/rename-project-folder", {
    project: SKILL_PROJECT,
    old_dir: `.claude/skills/${oldName}`,
    new_dir: `.claude/skills/${newName}`
  });
}

/** Create a new skill with a minimal SKILL.md skeleton. */
export async function createClaudeSkill(name: string, options?: {
  description?: string;
  category?: ClaudeSkillMeta["category"];
}): Promise<void> {
  const desc = options?.description || name;
  const frontmatter = [
    "---",
    `name: ${name}`,
    "description: >",
    `  ${desc}`,
    "lifecycle: default-pipeline",
    "user_invocable: true",
    "---",
    "",
    `# ${name}`,
    "",
    `> ${desc}`,
    "",
    "## What this skill does",
    "",
    "...",
    "",
    "## Workflow",
    "",
    "1. ...",
    ""
  ].join("\n");
  await writeClaudeSkill(name, frontmatter);
  // Add to known skills list if not present
  if (!KNOWN_SKILLS.includes(name)) {
    KNOWN_SKILLS.push(name);
  }
}

/**
 * Search the codebase for references to a skill name.
 * Uses YiAi's knowledge/scan endpoints if available; falls back to local grep.
 * Returns a best-effort list of referencing files.
 */
export async function getClaudeSkillUsage(name: string): Promise<SkillUsageRef[]> {
  // Try to search via the YiVad dev server source tree, or knowledge endpoints
  // For now, return an empty list — usage stats require server-side search support.
  // The UI shows a "—" placeholder when results are empty.
  try {
    // Search for the skill name in common reference patterns
    const patterns = [name, `.claude/skills/${name}`, `/${name}`];
    // This would need a code-search endpoint; not available via current APIs.
    // Future: integrate with YiAi knowledge search or a dedicated grep endpoint.
    return [];
  } catch {
    return [];
  }
}
