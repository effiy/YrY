/**
 * Demo project catalog + seed instantiation.
 *
 * The demo definitions mirror the YiKnowledge `demos/projects/*.md` seed payloads
 * (single source of truth: the markdown files). `DEMOS` is the machine-readable
 * copy consumed by the Project Management "Demo Gallery"; `createProjectFromDemo`
 * turns one into a real project with seeded issues / cycles / releases.
 */
import { createProject } from "./projectService";
import type { ProjectMember } from "./projectService";
import { createIssue } from "./issueService";
import type { IssueStatus, IssuePriority, IssueType } from "./issueService";
import { createCycle } from "./cycleService";
import type { CycleStatus } from "./cycleService";
import { createRelease } from "./releaseService";
import type { ReleaseStatus } from "./releaseService";
import { queryDocuments, createDocument, deleteDocument } from "./dataService";

export interface DemoSeedIssue {
  title: string;
  description?: string;
  issue_type: IssueType;
  status: IssueStatus;
  priority: IssuePriority;
  /** Index into the demo's `cycles` array (undefined = no cycle). */
  cycle?: number;
  /** Index into the demo's `releases` array (undefined = no release). */
  release?: number;
}

export interface DemoSeedCycle {
  name: string;
  goal?: string;
  status: CycleStatus;
  start_date: string;
  end_date: string;
}

export interface DemoSeedRelease {
  version: string;
  name: string;
  notes?: string;
  status: ReleaseStatus;
  target_date?: string;
}

export interface DemoMember {
  user_id: string;
  username: string;
  role: ProjectMember["role"];
}

export interface DemoDefinition {
  /** kebab-case slug matching the YiKnowledge file stem (e.g. "ecommerce-platform"). */
  slug: string;
  name: string;
  identifier: string;
  tagline: string;
  category: string;
  /** Cover gradient pair rendered on the gallery card. */
  gradient: [string, string];
  description: string;
  members: DemoMember[];
  issues: DemoSeedIssue[];
  cycles: DemoSeedCycle[];
  releases: DemoSeedRelease[];
}

export const DEMOS: DemoDefinition[] = [
  {
    slug: "ecommerce-platform",
    name: "E-Commerce Platform",
    identifier: "SHOP",
    tagline: "A complete online storefront with cart, checkout, and inventory.",
    category: "Web",
    gradient: ["#667eea", "#764ba2"],
    description: "A complete online storefront with product catalog, cart, checkout, order management, and inventory tracking.",
    members: [
      { user_id: "admin", username: "Admin", role: "owner" },
      { user_id: "alice", username: "Alice Chen", role: "admin" },
      { user_id: "bob", username: "Bob Wu", role: "member" }
    ],
    issues: [
      { title: "Product catalog & search", issue_type: "requirement", status: "done", priority: "high", cycle: 0, release: 0 },
      { title: "Shopping cart", issue_type: "feature", status: "done", priority: "high", cycle: 0, release: 0 },
      { title: "Checkout & payments", issue_type: "feature", status: "in_progress", priority: "urgent", cycle: 1, release: 0 },
      { title: "Order management", issue_type: "task", status: "todo", priority: "high", cycle: 1, release: 0 },
      { title: "Inventory tracking", issue_type: "task", status: "todo", priority: "medium", cycle: 1 },
      { title: "Customer accounts", issue_type: "requirement", status: "backlog", priority: "low" }
    ],
    cycles: [
      { name: "MVP", status: "completed", start_date: "2026-08-01", end_date: "2026-08-14", goal: "Launch catalog, cart, checkout" },
      { name: "Checkout & Fulfillment", status: "active", start_date: "2026-08-15", end_date: "2026-08-28", goal: "Orders + inventory" }
    ],
    releases: [
      { version: "v0.1.0", name: "Initial storefront", status: "in_progress", target_date: "2026-08-28" }
    ]
  },
  {
    slug: "knowledge-base",
    name: "Knowledge Base",
    identifier: "KBASE",
    tagline: "A markdown knowledge base with full-text search and RAG.",
    category: "AI",
    gradient: ["#4facfe", "#00f2fe"],
    description: "A markdown knowledge base with full-text search, RAG retrieval, access control, and version history.",
    members: [
      { user_id: "admin", username: "Admin", role: "owner" },
      { user_id: "dana", username: "Dana Liu", role: "member" }
    ],
    issues: [
      { title: "Markdown editor", issue_type: "feature", status: "done", priority: "high", cycle: 0, release: 0 },
      { title: "Full-text search", issue_type: "feature", status: "done", priority: "high", cycle: 0, release: 0 },
      { title: "RAG retrieval pipeline", issue_type: "feature", status: "in_progress", priority: "urgent", cycle: 0, release: 0 },
      { title: "Access control", issue_type: "task", status: "todo", priority: "medium", cycle: 0, release: 0 },
      { title: "Version history", issue_type: "improvement", status: "backlog", priority: "low" }
    ],
    cycles: [
      { name: "Core features", status: "active", start_date: "2026-08-18", end_date: "2026-09-04", goal: "Editor, search, RAG, access control" }
    ],
    releases: [
      { version: "v0.2.0", name: "RAG beta", status: "planned", target_date: "2026-09-04" }
    ]
  },
  {
    slug: "chrome-extension",
    name: "Chrome Extension",
    identifier: "PEXT",
    tagline: "A Manifest V3 browser extension with an AI sidebar.",
    category: "Extension",
    gradient: ["#43e97b", "#38f9d7"],
    description: "A Manifest V3 browser extension with content-script injection, an AI sidebar, an options page, and OAuth login.",
    members: [
      { user_id: "admin", username: "Admin", role: "owner" }
    ],
    issues: [
      { title: "Content script injection", issue_type: "feature", status: "done", priority: "high", cycle: 0, release: 0 },
      { title: "AI sidebar panel", issue_type: "feature", status: "in_progress", priority: "high", cycle: 0, release: 0 },
      { title: "Options page", issue_type: "task", status: "todo", priority: "medium", cycle: 0, release: 0 },
      { title: "OAuth login", issue_type: "task", status: "backlog", priority: "medium" }
    ],
    cycles: [
      { name: "Extension MVP", status: "active", start_date: "2026-08-20", end_date: "2026-08-27", goal: "Injection, sidebar, options" }
    ],
    releases: [
      { version: "v0.1.0", name: "Extension MVP", status: "in_progress", target_date: "2026-08-27" }
    ]
  },
  {
    slug: "mobile-app",
    name: "Mobile App",
    identifier: "APP",
    tagline: "A cross-platform mobile app with auth, feed, and offline sync.",
    category: "Mobile",
    gradient: ["#fa709a", "#fee140"],
    description: "A cross-platform mobile app with user authentication, activity feed, offline sync, push notifications, and dark mode.",
    members: [
      { user_id: "admin", username: "Admin", role: "owner" },
      { user_id: "eve", username: "Eve Wang", role: "member" }
    ],
    issues: [
      { title: "User authentication", issue_type: "feature", status: "done", priority: "high", cycle: 0, release: 0 },
      { title: "Activity feed", issue_type: "feature", status: "done", priority: "high", cycle: 0, release: 0 },
      { title: "Offline sync", issue_type: "feature", status: "in_progress", priority: "urgent", cycle: 0, release: 0 },
      { title: "Push notifications", issue_type: "task", status: "todo", priority: "medium", cycle: 0, release: 0 },
      { title: "Dark mode", issue_type: "improvement", status: "backlog", priority: "low" }
    ],
    cycles: [
      { name: "MVP", status: "active", start_date: "2026-08-19", end_date: "2026-08-29", goal: "Auth, feed, offline sync" }
    ],
    releases: [
      { version: "v0.3.0", name: "Mobile MVP", status: "planned", target_date: "2026-08-29" }
    ]
  },
  {
    slug: "data-platform",
    name: "Data Platform",
    identifier: "DATA",
    tagline: "A batch + streaming analytics platform with dashboards.",
    category: "Data",
    gradient: ["#30cfd0", "#330867"],
    description: "A batch and streaming analytics platform with ingestion, dashboards, data-quality checks, and a metadata catalog.",
    members: [
      { user_id: "admin", username: "Admin", role: "owner" },
      { user_id: "frank", username: "Frank Zhou", role: "member" }
    ],
    issues: [
      { title: "Data ingestion (batch)", issue_type: "feature", status: "done", priority: "high", cycle: 0, release: 0 },
      { title: "Streaming pipeline", issue_type: "feature", status: "in_progress", priority: "urgent", cycle: 1, release: 0 },
      { title: "Analytics dashboards", issue_type: "feature", status: "todo", priority: "high", cycle: 1, release: 0 },
      { title: "Data quality checks", issue_type: "task", status: "todo", priority: "medium", cycle: 1 },
      { title: "Metadata catalog", issue_type: "requirement", status: "backlog", priority: "low" }
    ],
    cycles: [
      { name: "Ingestion", status: "completed", start_date: "2026-08-05", end_date: "2026-08-18", goal: "Batch + streaming ingestion" },
      { name: "Streaming & Dashboards", status: "active", start_date: "2026-08-19", end_date: "2026-09-02", goal: "Dashboards + quality checks" }
    ],
    releases: [
      { version: "v0.4.0", name: "Analytics beta", status: "in_progress", target_date: "2026-09-02" }
    ]
  },
  {
    slug: "sre-operations",
    name: "SRE Operations",
    identifier: "OPS",
    tagline: "Observability, SLOs, and on-call for a reliable service.",
    category: "SRE",
    gradient: ["#243b55", "#141e30"],
    description: "A service-reliability program covering observability, on-call rotation, SLOs, incident response runbooks, and postmortem automation.",
    members: [
      { user_id: "admin", username: "Admin", role: "owner" },
      { user_id: "grace", username: "Grace Lin", role: "member" }
    ],
    issues: [
      { title: "Golden signals dashboards", issue_type: "feature", status: "done", priority: "high", cycle: 0, release: 0 },
      { title: "On-call rotation & paging", issue_type: "feature", status: "done", priority: "high", cycle: 0, release: 0 },
      { title: "SLO definitions & alerting", issue_type: "requirement", status: "in_progress", priority: "urgent", cycle: 1, release: 0 },
      { title: "Incident response runbooks", issue_type: "task", status: "todo", priority: "high", cycle: 1, release: 0 },
      { title: "Postmortem automation", issue_type: "task", status: "backlog", priority: "medium" }
    ],
    cycles: [
      { name: "Observability MVP", status: "completed", start_date: "2026-08-01", end_date: "2026-08-14", goal: "Golden signals + on-call" },
      { name: "Reliability Engineering", status: "active", start_date: "2026-08-15", end_date: "2026-08-28", goal: "SLOs + runbooks" }
    ],
    releases: [
      { version: "v0.1.0", name: "Observability baseline", status: "in_progress", target_date: "2026-08-28" }
    ]
  }
];

/**
 * Create a real project from a demo definition, seeding its issues, cycles,
 * and releases. Keys are derived from the project key so they never collide.
 * Returns the new project key.
 */
export async function createProjectFromDemo(demo: DemoDefinition): Promise<{ projectKey: string }> {
  const projectKey = `${demo.identifier.toLowerCase()}-${Date.now().toString(36)}`;
  const cycleKeys = demo.cycles.map((_, i) => `${projectKey}-cyc-${i + 1}`);
  const releaseKeys = demo.releases.map((_, i) => `${projectKey}-rel-${i + 1}`);
  const issueKeys = demo.issues.map((_, i) => `${projectKey}-iss-${i + 1}`);

  await createProject({
    key: projectKey,
    name: demo.name,
    identifier: demo.identifier,
    description: demo.description,
    status: "active",
    members: demo.members as ProjectMember[]
  });

  for (let i = 0; i < demo.cycles.length; i++) {
    const c = demo.cycles[i];
    const linked = demo.issues.map((it, idx) => (it.cycle === i ? issueKeys[idx] : null)).filter(Boolean) as string[];
    await createCycle({
      key: cycleKeys[i],
      project_key: projectKey,
      name: c.name,
      goal: c.goal,
      status: c.status,
      start_date: c.start_date,
      end_date: c.end_date,
      issue_keys: linked
    });
  }

  for (let i = 0; i < demo.releases.length; i++) {
    const r = demo.releases[i];
    const linked = demo.issues.map((it, idx) => (it.release === i ? issueKeys[idx] : null)).filter(Boolean) as string[];
    await createRelease({
      key: releaseKeys[i],
      project_key: projectKey,
      version: r.version,
      name: r.name,
      notes: r.notes,
      status: r.status,
      target_date: r.target_date,
      issue_keys: linked
    });
  }

  for (let i = 0; i < demo.issues.length; i++) {
    const it = demo.issues[i];
    await createIssue({
      key: issueKeys[i],
      project_key: projectKey,
      sequence_id: i + 1,
      title: it.title,
      description: it.description,
      status: it.status,
      priority: it.priority,
      issue_type: it.issue_type,
      labels: [],
      cycle_key: it.cycle != null ? cycleKeys[it.cycle] : undefined,
      release_key: it.release != null ? releaseKeys[it.release] : undefined
    });
  }

  return { projectKey };
}

/**
 * User-saved templates live alongside the built-in `DEMOS` in the generic
 * `demo_templates` collection (no YiAi change needed — `data_service` is
 * collection-agnostic). "Save as Template" snapshots a live project into a
 * `DemoDefinition`; the gallery merges these with `DEMOS` at open time.
 */
export interface DemoTemplate extends DemoDefinition {
  /** Document key in the `demo_templates` collection (e.g. "PTMPL-…"). */
  key: string;
}

const TEMPLATE_COLLECTION = "demo_templates";

export async function listDemoTemplates(): Promise<DemoTemplate[]> {
  const res = await queryDocuments<DemoTemplate>({
    cname: TEMPLATE_COLLECTION,
    filter: {},
    pageNum: 1,
    pageSize: 100,
    orderBy: "updated_at",
    orderType: "desc"
  });
  return res.data?.list ?? [];
}

export async function saveProjectAsDemo(def: DemoDefinition): Promise<void> {
  const now = new Date().toISOString();
  await createDocument(TEMPLATE_COLLECTION, {
    key: `PTMPL-${Date.now().toString(36).toUpperCase()}`,
    ...def,
    created_at: now,
    updated_at: now
  });
}

export async function deleteDemoTemplate(key: string): Promise<void> {
  await deleteDocument(TEMPLATE_COLLECTION, key);
}
