/**
 * Bug reporting service — wraps YiAi's bug logging flow.
 *
 * Mirrors YiVad's src/api/modules/bug.ts. The bug metadata goes to MongoDB
 * `bugs` collection via the data_service RPC; the long-form body (description
 * / steps / expected / actual / cause / solution) goes to a markdown file
 * under ~/YiKnowledge/lessons/failures/bugs/<key>.md via the knowledge_service
 * `write_entry_markdown` RPC.
 *
 * Split rationale: the DB doc stays lean for cheap queries; the long-form
 * markdown stays searchable by YiKnowledge's scanner + editable as files.
 */
import type { ApiClient, ApiResponse } from '../client';
import type {
  BugContent,
  BugDocument,
  BugFrequency,
  BugPriority,
  BugSeverity,
  BugStatus,
  BugType,
} from '../types';

const CNAME = 'bugs';
const CONTENT_CATEGORY = 'lessons/failures/bugs';

const KNOWLEDGE_MODULE = 'services.knowledge.knowledge_service';
const DATA_MODULE = 'services.database.data_service';

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

function contentPathFor(key: string): string {
  return `${CONTENT_CATEGORY}/${key}.md`;
}

function buildFrontmatter(bug: BugDocument): Record<string, unknown> {
  return {
    title: bug.title,
    key: bug.key,
    tags: bug.tags,
    category: CONTENT_CATEGORY,
    created: new Date(bug.createdAt).toISOString().slice(0, 10),
    updated: new Date(bug.updatedAt).toISOString().slice(0, 10),
    source: 'internal',
    type: 'bug',
    status: bug.status,
    severity: bug.severity,
    priority: bug.priority,
    project: bug.project,
    module: bug.module,
    iteration: bug.iteration ?? '',
    defectUrl: bug.defectUrl ?? '',
    assignee: bug.assignee,
    reporter: bug.reporter,
    environment: bug.environment,
    affectedVersion: bug.affectedVersion,
    fixedVersion: bug.fixedVersion,
    frequency: bug.frequency,
  };
}

function buildMarkdownBody(content: BugContent): string {
  const steps = content.stepsToReproduce.length
    ? content.stepsToReproduce.map((s, i) => `${i + 1}. ${s}`).join('\n')
    : '_No steps recorded._';
  const cause = content.causeProblem?.trim() || '_Root cause not yet recorded._';
  const solution = content.solution?.trim() || '_Solution not yet recorded._';
  return [
    '## Description',
    content.description?.trim() || '_No description provided._',
    '',
    '## Steps to Reproduce',
    steps,
    '',
    '## Expected Result',
    content.expectedResult?.trim() || '_Not specified._',
    '',
    '## Actual Result',
    content.actualResult?.trim() || '_Not specified._',
    '',
    '## Cause',
    cause,
    '',
    '## Solution',
    solution,
    '',
  ].join('\n');
}

export interface BugCreateInput {
  key: string;
  title: string;
  project: string;
  module: string;
  severity: BugSeverity;
  priority: BugPriority;
  status: BugStatus;
  type: BugType;
  frequency: BugFrequency;
  assignee: string;
  reporter: string;
  environment: string;
  affectedVersion: string;
  fixedVersion: string;
  tags: string[];
  iteration?: string;
  defectUrl?: string;
  dueDate?: number | null;
}

export class BugService {
  constructor(private client: ApiClient) {}

  /** Create a bug: write markdown body first, then metadata doc. */
  async createBug(
    meta: BugCreateInput,
    content: BugContent,
  ): Promise<{ envelope: ApiResponse<unknown>; contentPath: string }> {
    const now = Date.now();
    const contentPath = contentPathFor(meta.key);
    const bugDoc: BugDocument = {
      ...meta,
      contentPath,
      dueDate: meta.dueDate ?? null,
      iteration: meta.iteration,
      defectUrl: meta.defectUrl,
      createdAt: now,
      updatedAt: now,
      resolvedAt: meta.status === 'resolved' ? now : null,
      closedAt: meta.status === 'closed' ? now : null,
    };

    // 1. Write markdown body + frontmatter via knowledge_service RPC.
    const mdRes = await this.client.rpc(KNOWLEDGE_MODULE, 'write_entry_markdown', {
      rel_path: contentPath,
      content: buildMarkdownBody(content),
      meta: buildFrontmatter(bugDoc),
    });
    if (!mdRes.ok) {
      throw new Error(mdRes.error || 'Failed to write bug markdown');
    }

    // 2. Create the metadata doc in MongoDB `bugs` collection.
    const envelope = await this.client.rpc(DATA_MODULE, 'create_document', {
      cname: CNAME,
      data: bugDoc,
    });
    if (!envelope.ok) {
      throw new Error(envelope.error || 'Failed to create bug metadata');
    }
    return { envelope, contentPath };
  }

  /** List bugs — newest first. Pass search to match title or module (regex). */
  listBugs(
    params: {
      search?: string;
      project?: string;
      severity?: BugSeverity;
      priority?: BugPriority;
      status?: BugStatus;
      type?: BugType;
      pageNum?: number;
      pageSize?: number;
    } = {},
  ): Promise<
    ApiResponse<{ list: BugDocument[]; total: number; pageNum: number; pageSize: number }>
  > {
    const filter: Record<string, unknown> = {};
    const search = params.search?.trim();
    if (search) {
      const rx = { $regex: search, $options: 'i' };
      filter.$or = [{ title: rx }, { module: rx }];
    }
    if (params.project) filter.project = params.project;
    if (params.severity) filter.severity = params.severity;
    if (params.priority) filter.priority = params.priority;
    if (params.status) filter.status = params.status;
    if (params.type) filter.type = params.type;

    const pageNum = params.pageNum ?? 1;
    const pageSize = params.pageSize ?? 20;

    return this.client.rpc(DATA_MODULE, 'query_documents', {
      cname: CNAME,
      filter: Object.keys(filter).length > 0 ? filter : undefined,
      pageNum,
      pageSize,
      orderBy: 'updatedAt',
      orderType: 'desc',
    }) as Promise<
      ApiResponse<{ list: BugDocument[]; total: number; pageNum: number; pageSize: number }>
    >;
  }
}

/** Generate a stable bug key from a title + timestamp. */
export function makeBugKey(title: string): string {
  const slug =
    (title || 'bug')
      .toLowerCase()
      .replace(/[^a-z0-9\u4e00-\u9fa5]+/g, '_')
      .replace(/^_+|_+$/g, '')
      .slice(0, 40) || 'bug';
  return `bug_${slug}_${Date.now().toString(36)}`;
}

/** Auto-detect project from a URL — YiAi / YiVad / YiKnowledge detection. */
export function detectProjectFromUrl(url: string): string {
  const u = url || '';
  if (u.includes(':8848') || u.includes('/YiVad')) return 'YiVad';
  if (u.includes(':10086') || u.includes('/YiAi')) return 'YiAi';
  if (u.includes('/YiKnowledge') || u.includes('yi-knowledge')) return 'YiKnowledge';
  if (u.includes('/YiPet') || u.includes('chrome-extension')) return 'YiPet';
  return 'unknown';
}

/** Detect a YiVad page type from a URL. Returns `{ kind, key? }` — `kind`
 *  is one of `yivad-bug-detail` / `yivad-brd-detail` / `yivad-story-detail`
 *  / `yivad-aichat` / `unknown`. `key` is the entity key when applicable. */
export function detectPageTypeFromUrl(url: string): { kind: string; key?: string } {
  const u = url || '';
  if (!u.includes(':8848') && !u.includes('/YiVad')) return { kind: 'unknown' };
  const hash = u.includes('#') ? u.slice(u.indexOf('#') + 1) : '';
  const path = hash || u;
  let m = path.match(/\/code-review\/bugs\/detail\/([^/?]+)/);
  if (m) return { kind: 'yivad-bug-detail', key: decodeURIComponent(m[1]) };
  m = path.match(/\/brd\/[^/]+\/detail\/([^/?]+)/);
  if (m) return { kind: 'yivad-brd-detail', key: decodeURIComponent(m[1]) };
  m = path.match(/\/story\/detail\/([^/?]+)/);
  if (m) return { kind: 'yivad-story-detail', key: decodeURIComponent(m[1]) };
  if (path.includes('/aiChat')) return { kind: 'yivad-aichat' };
  return { kind: 'unknown' };
}

/** Today's date — exposed for callers that want to seed a default value. */
export function bugToday(): string {
  return today();
}
