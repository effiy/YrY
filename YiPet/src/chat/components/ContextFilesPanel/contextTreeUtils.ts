/**
 * Context file tree utilities — pure functions for parsing session pageContent
 * into a tree structure and flattening for display.
 */

export interface ContextNode {
  key: string;
  name: string;
  path: string;
  type: 'file' | 'folder';
  content?: string;
  tags?: string[];
  children?: ContextNode[];
}

export interface DisplayItem {
  node: ContextNode;
  depth: number;
  key: string;
}

const CTX_PREFIX = 'ctx:';
const SEP = '\n\n---\n\n';

export function extractCtxPaths(tags: string[]): string[] {
  return (tags || [])
    .filter((t) => typeof t === 'string' && t.startsWith(CTX_PREFIX))
    .map((t) => t.slice(CTX_PREFIX.length));
}

export function parseToTree(raw: string, tags: string[]): ContextNode[] {
  const ctxPaths = extractCtxPaths(tags);
  let filePaths: string[];
  if (ctxPaths.length) {
    filePaths = ctxPaths;
  } else if (raw) {
    const sections = raw.split(SEP);
    filePaths = sections
      .map((sec) => {
        const m = sec.split('\n')[0]?.match(/^## (.+)$/);
        return m?.[1] || '';
      })
      .filter(Boolean);
  } else {
    return [];
  }

  const contentMap = new Map<string, string>();
  if (raw) {
    for (const section of raw.split(SEP)) {
      const lines = section.split('\n');
      const m = lines[0]?.match(/^## (.+)$/);
      const path = m?.[1] || '';
      const body = lines.slice(1).join('\n').trim();
      if (path) contentMap.set(path, body);
    }
  }

  const files: ContextNode[] = [];
  for (const path of filePaths) {
    const name = path.split('/').pop() || path;
    files.push({
      key: path,
      name,
      path,
      type: 'file',
      content: contentMap.get(path) || '',
      tags: path.split('/').slice(0, -1),
    });
  }

  const roots: ContextNode[] = [];
  const folderMap = new Map<string, ContextNode>();

  for (const file of files) {
    const parts = file.path.split('/');
    if (parts.length <= 1) {
      roots.push(file);
      continue;
    }

    let siblings = roots;
    let prefix = '';
    for (let i = 0; i < parts.length - 1; i++) {
      prefix = prefix ? `${prefix}/${parts[i]}` : parts[i];
      const folderKey = `folder:${prefix}`;
      let folder = folderMap.get(folderKey);
      if (!folder) {
        folder = {
          key: folderKey,
          name: parts[i],
          path: prefix,
          type: 'folder',
          children: [],
        };
        folderMap.set(folderKey, folder);
        siblings.push(folder);
      }
      siblings = folder.children!;
    }
    siblings.push(file);
  }

  sortTree(roots);
  return roots;
}

export function sortTree(nodes: ContextNode[]) {
  nodes.sort((a, b) => {
    if (a.type !== b.type) return a.type === 'folder' ? -1 : 1;
    return a.name.localeCompare(b.name, 'zh-CN');
  });
  for (const n of nodes) if (n.children) sortTree(n.children);
}

export function flattenForDisplay(nodes: ContextNode[], depth = 0): DisplayItem[] {
  const out: DisplayItem[] = [];
  for (const n of nodes) {
    out.push({ node: n, depth, key: n.key });
    if (n.type === 'folder' && n.children?.length) {
      out.push(...flattenForDisplay(n.children, depth + 1));
    }
  }
  return out;
}

export function countFiles(nodes: ContextNode[]): number {
  let c = 0;
  for (const n of nodes) {
    if (n.type === 'file') c++;
    else if (n.children) c += countFiles(n.children);
  }
  return c;
}

// ── Knowledge browse tree (built from API response, not pageContent) ──

interface KnowledgeFileEntry {
  path: string;
  name: string;
  meta?: Record<string, unknown>;
  updated?: string;
}

/** Build a ContextNode tree from KnowledgeScanResponse categories. */
export function buildKnowledgeBrowseTree(
  categories: Array<{ category: string; files: KnowledgeFileEntry[] }>,
  searchQuery = '',
): ContextNode[] {
  const roots: ContextNode[] = [];
  const folderMap = new Map<string, ContextNode>();

  for (const cat of categories) {
    for (const f of cat.files) {
      const parts = f.path.split('/').filter(Boolean);
      if (parts.length === 0) continue;

      let siblings = roots;
      let prefix = '';
      for (let i = 0; i < parts.length; i++) {
        const segment = parts[i];
        prefix = prefix ? `${prefix}/${segment}` : segment;
        const isLeaf = i === parts.length - 1;
        if (isLeaf) {
          siblings.push({ key: `file:${f.path}`, name: f.name, path: f.path, type: 'file' });
        } else {
          const folderKey = `folder:${prefix}`;
          let folder = folderMap.get(folderKey);
          if (!folder) {
            folder = { key: folderKey, name: segment, path: prefix, type: 'folder', children: [] };
            folderMap.set(folderKey, folder);
            siblings.push(folder);
          }
          siblings = folder.children!;
        }
      }
    }
  }

  sortTree(roots);

  if (!searchQuery) return roots;
  return filterTree(roots, searchQuery);
}

/** Filter a ContextNode tree by name/path query (case-insensitive substring). */
export function filterTree(nodes: ContextNode[], query: string): ContextNode[] {
  const q = query.toLowerCase();
  const out: ContextNode[] = [];
  for (const n of nodes) {
    if (n.type === 'file') {
      if (n.name.toLowerCase().includes(q) || n.path.toLowerCase().includes(q)) out.push(n);
    } else {
      const filtered = n.children ? filterTree(n.children, q) : [];
      if (filtered.length) out.push({ ...n, children: filtered });
    }
  }
  return out;
}