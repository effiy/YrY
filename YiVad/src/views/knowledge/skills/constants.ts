export interface SkillDef {
  id: string;
  name: string;
  title: string;
  icon: string;
  description: string;
  files: number;
  lifecycle: string;
  user_invocable: boolean;
  status: string;
  category: string;
}

export interface SkillCategory {
  id: string;
  icon: string;
  label: string;
  color: string;
  desc: string;
}

export const categories: SkillCategory[] = [
  {
    id: "frontend",
    icon: "🎨",
    label: "Frontend",
    color: "#409eff",
    desc: "Vue 3, Vite, CSS, H5, Chrome Extensions, Tauri, UI/UX — browser and desktop UI skills."
  },
  {
    id: "backend",
    icon: "⚙️",
    label: "Backend",
    color: "#10b981",
    desc: "FastAPI, Node.js, Nginx, public API probing — server-side and infrastructure skills."
  },
  {
    id: "platform",
    icon: "🔧",
    label: "Platform & Tools",
    color: "#7c3aed",
    desc: "Git, GitHub, npm, Lighthouse, Tmux — developer tooling and platform skills."
  },
  {
    id: "ai",
    icon: "🤖",
    label: "AI & Claude Code",
    color: "#f59e0b",
    desc: "Skill creator, project init, document import, BRD generation, Mermaid diagrams — AI-native skills."
  },
  {
    id: "business",
    icon: "🏢",
    label: "Business & Strategy",
    color: "#ef4444",
    desc: "Market research, code quality evaluation, business strategy — research and strategic skills."
  }
];

export const skills: SkillDef[] = [
  // ── Frontend ────────────────────────────────────────
  {
    id: "vue",
    name: "vue",
    title: "Vue 3",
    icon: "🟢",
    description: "Vue 3 Composition API, Pinia, Vue Router, Element Plus, custom directives, composables, and SFC conventions.",
    files: 10,
    lifecycle: "active",
    user_invocable: true,
    status: "stable",
    category: "frontend"
  },
  {
    id: "vite",
    name: "vite",
    title: "Vite",
    icon: "⚡",
    description: "Vite.js build tool, plugins, framework integrations, SSR/SSG, and migration guides.",
    files: 3,
    lifecycle: "active",
    user_invocable: true,
    status: "stable",
    category: "frontend"
  },
  {
    id: "css",
    name: "css",
    title: "CSS",
    icon: "🎯",
    description: "Modern CSS: cascade layers, container queries, custom properties, Grid/Flexbox, and responsive patterns.",
    files: 1,
    lifecycle: "active",
    user_invocable: true,
    status: "stable",
    category: "frontend"
  },
  {
    id: "h5",
    name: "h5",
    title: "H5 Mobile",
    icon: "📱",
    description: "H5 mobile web development: viewport, touch events, responsive design, and mobile-first patterns.",
    files: 1,
    lifecycle: "active",
    user_invocable: true,
    status: "stable",
    category: "frontend"
  },
  {
    id: "ui-ux",
    name: "ui-ux",
    title: "UI/UX",
    icon: "🎨",
    description: "UI/UX design: logos, icons, banners, slides, CIP, design systems, and presentation components.",
    files: 51,
    lifecycle: "active",
    user_invocable: true,
    status: "stable",
    category: "frontend"
  },
  {
    id: "chrome",
    name: "chrome",
    title: "Chrome Extension",
    icon: "🧩",
    description: "Chrome Extension MV3: service workers, content scripts, Chrome APIs, and manifest configuration.",
    files: 1,
    lifecycle: "active",
    user_invocable: true,
    status: "stable",
    category: "frontend"
  },
  {
    id: "tauri",
    name: "tauri",
    title: "Tauri",
    icon: "🦀",
    description: "Tauri ecosystem: templates, plugins, integrations, and showcase apps for desktop development.",
    files: 2,
    lifecycle: "active",
    user_invocable: true,
    status: "stable",
    category: "frontend"
  },
  // ── Backend ─────────────────────────────────────────
  {
    id: "fastapi",
    name: "fastapi",
    title: "FastAPI",
    icon: "🐍",
    description: "FastAPI: dependency injection, middleware, Pydantic validation, WebSocket, and testing patterns.",
    files: 1,
    lifecycle: "active",
    user_invocable: true,
    status: "stable",
    category: "backend"
  },
  {
    id: "nodejs",
    name: "nodejs",
    title: "Node.js",
    icon: "💚",
    description: "Node.js best practices: 100+ vetted practices by category — error handling, security, performance, and more.",
    files: 2,
    lifecycle: "active",
    user_invocable: true,
    status: "stable",
    category: "backend"
  },
  {
    id: "nginx",
    name: "nginx",
    title: "Nginx",
    icon: "🌐",
    description: "Nginx operations: configuration, tuning, security hardening, logging, and reverse proxy patterns.",
    files: 2,
    lifecycle: "active",
    user_invocable: true,
    status: "stable",
    category: "backend"
  },
  {
    id: "public-api",
    name: "public-api",
    title: "Public API",
    icon: "🔌",
    description: "Public API probing: curl-based discovery, endpoint enumeration, OpenAPI scraping, and integration testing.",
    files: 1,
    lifecycle: "active",
    user_invocable: true,
    status: "stable",
    category: "backend"
  },
  // ── Platform & Tools ────────────────────────────────
  {
    id: "git",
    name: "git",
    title: "Git",
    icon: "📦",
    description: "Git: branch, merge, rebase, stash, cherry-pick, bisect, reflog, hooks, and workflow patterns.",
    files: 1,
    lifecycle: "active",
    user_invocable: true,
    status: "stable",
    category: "platform"
  },
  {
    id: "github",
    name: "github",
    title: "GitHub",
    icon: "🐙",
    description: "GitHub: issues, PRs, code search, repo operations, security scanning, and API integration.",
    files: 4,
    lifecycle: "active",
    user_invocable: true,
    status: "stable",
    category: "platform"
  },
  {
    id: "npm",
    name: "npm",
    title: "npm",
    icon: "📦",
    description: "Personal npm package management: search, install, publish, version management, and registry operations.",
    files: 7,
    lifecycle: "active",
    user_invocable: true,
    status: "stable",
    category: "platform"
  },
  {
    id: "lighthouse",
    name: "lighthouse",
    title: "Lighthouse",
    icon: "🔦",
    description: "Lighthouse: performance audits, CI integration, DevTools workflows, and score optimization.",
    files: 3,
    lifecycle: "active",
    user_invocable: true,
    status: "stable",
    category: "platform"
  },
  {
    id: "tmux",
    name: "tmux",
    title: "Tmux",
    icon: "🖥️",
    description: "Tmux: tutorials, cheat sheets, themes, plugins, and session management for terminal productivity.",
    files: 3,
    lifecycle: "active",
    user_invocable: true,
    status: "stable",
    category: "platform"
  },
  // ── AI & Claude Code ────────────────────────────────
  {
    id: "skill-creator",
    name: "skill-creator",
    title: "Skill Creator",
    icon: "🛠️",
    description: "Create, improve, evaluate, and package Claude Code skills. The meta-skill for building skills.",
    files: 10,
    lifecycle: "active",
    user_invocable: true,
    status: "stable",
    category: "ai"
  },
  {
    id: "init",
    name: "yry-init",
    title: "Project Init",
    icon: "🚀",
    description: "Project initialization pipeline: detect → explore → generate → verify. Full CLAUDE.md/README.md rebuild.",
    files: 45,
    lifecycle: "active",
    user_invocable: true,
    status: "stable",
    category: "ai"
  },
  {
    id: "import",
    name: "import",
    title: "Document Import",
    icon: "📥",
    description: "Document import/sync to remote API. Pull, scan, and upload knowledge files to the knowledge base.",
    files: 2,
    lifecycle: "active",
    user_invocable: true,
    status: "stable",
    category: "ai"
  },
  {
    id: "gen-brd",
    name: "gen-brd",
    title: "BRD Generator",
    icon: "📋",
    description: "Generate BRD (Business Requirements Document) entries with structured frontmatter and acceptance criteria.",
    files: 1,
    lifecycle: "active",
    user_invocable: true,
    status: "stable",
    category: "ai"
  },
  {
    id: "mermaid",
    name: "mermaid",
    title: "Mermaid",
    icon: "📊",
    description: "Mermaid diagram rendering: 15+ themes, 5 diagram types (flowchart, sequence, class, ER, Gantt).",
    files: 4,
    lifecycle: "active",
    user_invocable: true,
    status: "stable",
    category: "ai"
  },
  // ── Business & Strategy ─────────────────────────────
  {
    id: "market-research",
    name: "market-research",
    title: "Market Research",
    icon: "🔍",
    description: "Full research lifecycle: landscape surveys, single-project evaluation, head-to-head comparison, YiKnowledge output.",
    files: 1,
    lifecycle: "active",
    user_invocable: true,
    status: "stable",
    category: "business"
  },
  {
    id: "code-quality-research",
    name: "code-quality-research",
    title: "Code Quality Research",
    icon: "✅",
    description: "Evaluate and select AI-powered code quality tools across 4 key paths: review, test generation, refactoring, style alignment.",
    files: 1,
    lifecycle: "active",
    user_invocable: true,
    status: "stable",
    category: "business"
  },
  {
    id: "business-strategy",
    name: "business-strategy",
    title: "Business Strategy",
    icon: "📈",
    description: "Define organizational strategy: market intelligence, competitive analysis, OKRs, roadmaps, build-vs-buy decisions.",
    files: 1,
    lifecycle: "active",
    user_invocable: true,
    status: "stable",
    category: "business"
  },
  // ── Platform & Tools (continued) ─────────────────────
  {
    id: "agile-defect",
    name: "agile-defect",
    title: "Agile Defect",
    icon: "🐛",
    description: "Agile platform defect management — search, triage, and inspect defects from the Zeekr Agile MP system.",
    files: 1,
    lifecycle: "active",
    user_invocable: true,
    status: "stable",
    category: "platform"
  }
];

export function skillsInCat(catId: string): SkillDef[] {
  return skills.filter(s => s.category === catId);
}