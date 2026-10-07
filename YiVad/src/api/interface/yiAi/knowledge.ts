/** Parsed YAML frontmatter from a knowledge markdown file. */
export interface KnowledgeMeta {
  title?: string;
  tags?: string[];
  category?: string;
  created?: string;
  updated?: string;
  source?: string;
  type?: string;
  status?: string;
  aliases?: string[];
  roles?: string[];
  /** Lifecycle stage — active / draft / deprecated / archived. */
  lifecycle?: string;
  /** Review cadence — quarterly / half-yearly / yearly. */
  review_cycle?: string;
  /** Tacit knowledge — boolean flag (true = hard to write down) or a string statement capturing the tacit essence. */
  tacit?: boolean | string;
  benefit?: string;
  acceptance_criteria?: string[];
  /** Relative paths to related knowledge entries. */
  related?: string[];
  /** Bug-specific fields from YiKnowledge projects/{project}/bugs/ frontmatter. */
  severity?: string;
  priority?: string;
  module?: string;
  key?: string;
  reporter?: string;
  assignee?: string;
  source_prd?: string;
  project?: string;
  frequency?: string;
  environment?: string;
  affectedVersion?: string;
  fixedVersion?: string;
  [key: string]: unknown;
}

/** One markdown entry returned by /knowledge-scan. */
export interface KnowledgeFileEntry {
  /** Relative path under the knowledge base dir, e.g. "aier/methodology/foo.md" */
  path: string;
  /** File name (last path segment). */
  name: string;
  /** Top-level YiKnowledge category: one of the 7 role directories (product / leader / engineer / sre / executive / aier / curator) or `static` / `__root__`. */
  category: string;
  meta: KnowledgeMeta;
  size: number;
  updatedAt: number | null;
}

export interface KnowledgeScanResponse {
  categories: { category: string; files: KnowledgeFileEntry[] }[];
}

export interface KnowledgeFilesResponse {
  files: KnowledgeFileEntry[];
  total: number;
}

export interface KnowledgeReadResponse {
  path: string;
  name: string;
  category: string;
  meta: KnowledgeMeta;
  content: string;
}

/** One story.md entry returned by /knowledge-stories. */
export interface KnowledgeStoryEntry {
  path: string;
  name: string;
  category: string;
  meta: KnowledgeMeta;
  size: number;
  updatedAt: number | null;
  /** Project name (YiAi / YiPet / YiVad / …) */
  project: string;
  /** Semantic story directory name (e.g. "ai-chat-function"). */
  storyName: string;
}

export interface KnowledgeStoriesResponse {
  stories: KnowledgeStoryEntry[];
}

/** One bug markdown entry returned by /knowledge-bugs.
 *
 *  The frontmatter is coerced into the same shape as the MongoDB BugDocument,
 *  so callers don't need to distinguish DB-vs-disk sources.
 */
export interface KnowledgeBugEntry {
  key: string;
  title: string;
  project: string;
  project_key?: string;
  issue_key?: string;
  module: string;
  iteration?: string;
  defectUrl?: string;
  severity: "critical" | "major" | "minor" | "trivial";
  priority: "p0" | "p1" | "p2" | "p3";
  status: "open" | "in_progress" | "resolved" | "closed" | "rejected" | "reopened";
  type: "functional" | "performance" | "ui" | "security" | "compatibility" | "regression" | "data" | "other";
  frequency: "always" | "sometimes" | "rarely" | "once" | "unable";
  assignee: string;
  reporter: string;
  environment: string;
  affectedVersion: string;
  fixedVersion: string;
  tags: string[];
  dueDate: number | null;
  description?: string;
  /** Relative YiKnowledge path, e.g. "projects/yivad/bugs/2026-08-21/logic/issue-detail-comment.md". */
  contentPath: string;
  createdAt: number;
  updatedAt: number;
  resolvedAt: number | null;
  closedAt: number | null;
}

export interface KnowledgeBugsResponse {
  bugs: KnowledgeBugEntry[];
  total: number;
}

/** Structured long-form body parsed from a bug's markdown file. */
export interface KnowledgeBugContent {
  description: string;
  stepsToReproduce: string[];
  expectedResult: string;
  actualResult: string;
  causeProblem?: string;
  solution?: string;
}

export interface KnowledgeBugReadResponse {
  bug: KnowledgeBugEntry;
  content: KnowledgeBugContent;
}