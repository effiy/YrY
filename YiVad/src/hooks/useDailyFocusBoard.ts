/**
 * Daily Focus Board composable.
 *
 * Reads YiKnowledge/curator/daily/001-今日焦点-焦点总控.md via YiAi
 * knowledge-read endpoint and parses 8 structured sections:
 *   1. Hero banner (hero / must_do_one / narrative)
 *   2. SRE status matrix (level + items)
 *   3. OKR trackers (id / title / progress / coverage / status / anchor)
 *   4. Role-driven action items (role / priority / title / why / anchor / status)
 *   5. Quick anchor pills (label / anchor / role)
 *   6. Daily 3-2-1 digest (signals / decisions / redlines + summary_file)
 *   7. Focus extension links (group / title / anchor / role)
 *   8. Falsifiability baseline (kept as markdown, surfaced in hover)
 *
 * If the file is missing or parse fails, every ref returns empty/default values
 * so the home page can degrade gracefully to the issue-only list view.
 *
 * Data freshness poll: 5 minutes.
 */
import { ref, onMounted, onUnmounted, type Ref } from "vue";
import { readKnowledgeFile } from "@/api/modules/knowledgeService";

export const FOCUS_FILE_PATH = "curator/daily/001-今日焦点-焦点总控.md";

export type DigestLevel = "critical" | "major" | "warn" | "clear" | string;

export interface SreStatusItem {
  id?: string;
  level: DigestLevel;
  title: string;
  owner?: string;
  anchor?: string;
  detail?: string;
}

export interface SreStatus {
  level: DigestLevel;
  items: SreStatusItem[];
}

export interface OkrTracker {
  id: string;
  title: string;
  period?: string;
  owner?: string;
  progress: number;
  coverage?: number;
  total?: number;
  status: "active" | "at_risk" | "off_track" | "done" | string;
  anchor: string;
  today_focus?: string;
}

export interface FocusAction {
  role: string;
  priority: string;
  title: string;
  why?: string;
  anchor: string;
  status: string;
}

export interface QuickAnchor {
  label: string;
  anchor: string;
  role?: string;
}

export interface FocusHero {
  date?: string;
  hero?: string;
  must_do_one?: string;
  narrative?: string;
}

export interface DigestSignal {
  id: string;
  level: DigestLevel;
  title: string;
  confidence?: number;
  ref?: string;
}

export interface DigestDecision {
  id: string;
  title: string;
  recommend?: string;
  deadline?: string;
  ref?: string;
}

export interface DigestRedline {
  id: string;
  title: string;
  detail?: string;
  ref?: string;
}

export interface DailyDigest {
  summary_file?: string;
  signals: DigestSignal[];
  decisions: DigestDecision[];
  redlines: DigestRedline[];
}

export interface FocusLink {
  group?: string;
  title: string;
  anchor: string;
  role?: string;
}

export interface FocusBoard {
  hero: Ref<FocusHero>;
  sre: Ref<SreStatus>;
  okrs: Ref<OkrTracker[]>;
  actions: Ref<FocusAction[]>;
  anchors: Ref<QuickAnchor[]>;
  digest: Ref<DailyDigest>;
  links: Ref<FocusLink[]>;
  available: Ref<boolean>;
  loading: Ref<boolean>;
  lastUpdated: Ref<number>;
  retry: () => Promise<void>;
}

const POLL_MS = 5 * 60 * 1000;

function extractYamlBlock(content: string, startHeading: string): string {
  // Slice from heading to next `## ` heading or end of file
  const start = content.indexOf(startHeading);
  if (start < 0) return "";
  const rest = content.slice(start);
  // Find next top-level heading
  const after = rest.indexOf("\n## ");
  const section = after >= 0 ? rest.slice(0, after) : rest;
  // Extract first fenced yaml block
  const m = section.match(/```yaml\s*([\s\S]*?)```/);
  return m ? m[1] : "";
}

function parseYamlishStruct<T = unknown>(block: string, topKey?: string): T | null {
  if (!block) return null;
  try {
    // Very small YAML subset parser — enough for our structured focus file.
    // Rules:
    //   - list items start with `  - key: value` or `    - `
    //   - top-level key after topKey
    //   - scalar values: string (strip quotes), number, boolean
    const lines = block.split(/\r?\n/);
    const root: Record<string, unknown> = {};
    const stack: Array<{ indent: number; container: Record<string, unknown> | unknown[] }> = [
      { indent: -1, container: root },
    ];
    type StackItem = { indent: number; container: Record<string, unknown> | unknown[] };

    const stripInlineComment = (value: string): string => {
      // 剥离 YAML 行内 # 注释（仅出现在值为未引用的标量里），保留引号内部的 # 视为字面量。
      const v = value;
      let inSingle = false;
      let inDouble = false;
      for (let i = 0; i < v.length; i += 1) {
        const ch = v[i];
        const prev = i > 0 ? v[i - 1] : "";
        if (ch === '"' && !inSingle && prev !== "\\") inDouble = !inDouble;
        else if (ch === "'" && !inDouble) inSingle = !inSingle;
        else if (ch === "#" && !inSingle && !inDouble) {
          // YAML 规范要求 # 前必须为空白（或行首）才算注释
          if (i === 0 || /\s/.test(prev)) return v.slice(0, i);
        }
      }
      return v;
    };
    const scalar = (raw: string): unknown => {
      const cleaned = stripInlineComment(raw);
      const s = cleaned.trim();
      if (s.length >= 2 && ((s[0] === '"' && s[s.length - 1] === '"') || (s[0] === "'" && s[s.length - 1] === "'"))) {
        return s.slice(1, -1);
      }
      if (/^-?\d+(\.\d+)?$/.test(s)) return Number(s);
      if (s === "true") return true;
      if (s === "false") return false;
      if (s === "null" || s === "~") return null;
      return s;
    };

    for (const rawLine of lines) {
      if (!rawLine.trim() || rawLine.trimStart().startsWith("#")) continue;
      const indent = rawLine.match(/^\s*/)?.[0].length ?? 0;
      const line = rawLine.slice(indent);
      // Pop stack until we find a parent with smaller indent
      while (stack.length > 1 && (stack[stack.length - 1] as StackItem).indent >= indent) {
        stack.pop();
      }
      const parent = (stack[stack.length - 1] as StackItem).container;
      if (line.startsWith("- ")) {
        const body = line.slice(2);
        let hostContainer: Record<string, unknown> | unknown[] = parent as any;

        // --- Placeholder → Array rewrite: handle `key:\n  - dict1\n    k: v` pattern
        // When the current `parent` is a non-array EMPTY object created by a previous
        // `key:` (no-value) line, it's a placeholder that must become the list array.
        if (
          !Array.isArray(hostContainer) &&
          Object.keys(hostContainer as Record<string, unknown>).length === 0 &&
          stack.length >= 2
        ) {
          const popped = stack.pop() as StackItem;
          const grand = (stack[stack.length - 1] as StackItem).container as Record<string, unknown>;
          let foundKey: string | null = null;
          for (const k of Object.keys(grand)) {
            if ((grand as any)[k] === popped.container) {
              foundKey = k;
              break;
            }
          }
          if (foundKey) {
            const arr: unknown[] = [];
            (grand as any)[foundKey] = arr;
            // Reuse the ORIGINAL placeholder frame's indent (the key: line indent,
            // not the `- item` line indent) so sibling array items (same indent as
            // this line) will stop popping before reaching the array frame itself.
            stack.push({ indent: popped.indent, container: arr });
            hostContainer = arr;
          } else {
            // Could not find back-ref; push the placeholder back and fall through
            stack.push(popped);
          }
        }

        const arr = Array.isArray(hostContainer) ? (hostContainer as unknown[]) : null;
        if (body.includes(":")) {
          // dict entry within list item
          const firstColon = body.indexOf(":");
          const firstKey = body.slice(0, firstColon).trim();
          const firstVal = body.slice(firstColon + 1).trim();
          const obj: Record<string, unknown> = {};
          if (firstVal) obj[firstKey] = scalar(firstVal);
          else obj[firstKey] = {};
          if (arr) arr.push(obj);
          else {
            const pObj = hostContainer as Record<string, unknown>;
            if (!Array.isArray(pObj[firstKey])) pObj[firstKey] = [];
            (pObj[firstKey] as unknown[]).push(obj);
          }
          stack.push({ indent, container: obj });
        } else {
          const val = scalar(body);
          if (arr) arr.push(val);
        }
      } else if (line.includes(":") && !line.startsWith("-")) {
        const firstColon = line.indexOf(":");
        const key = line.slice(0, firstColon).trim();
        const valueRaw = line.slice(firstColon + 1).trim();
        const pObj = parent as Record<string, unknown>;
        if (valueRaw === "") {
          pObj[key] = {};
          stack.push({ indent, container: pObj[key] as Record<string, unknown> });
        } else {
          pObj[key] = scalar(valueRaw);
        }
      }
    }

    const result = topKey ? (root[topKey] as T) : (root as unknown as T);
    return result ?? null;
  } catch {
    return null;
  }
}

/** Replace overwritten dict-with-following-list issue: if a child object is empty
 *  and the next non-empty child sibling is a list push, rewrite the parent[key]
 *  to an array. Handled inline above; this helper is kept for future extensions.
 */

function parseHero(content: string): FocusHero {
  const start = content.indexOf("## 一、今日 Hero");
  if (start < 0) return {};
  const after = content.indexOf("\n## ", start + 1);
  const section = after >= 0 ? content.slice(start, after) : content.slice(start);
  const fields: FocusHero = {};
  const rgx = /-\s*\*\*(date|hero|must_do_one|narrative)\*\*:\s*`?([^\n`]*?)`?\s*$/gm;
  let m = rgx.exec(section);
  while (m) {
    const key = m[1] as keyof FocusHero;
    fields[key] = m[2].trim();
    m = rgx.exec(section);
  }
  return fields;
}

const EMPTY_SRE: SreStatus = { level: "clear", items: [] };
const EMPTY_DIGEST: DailyDigest = { signals: [], decisions: [], redlines: [] };

function asList<T>(v: unknown, fallback: T[] = []): T[] {
  return Array.isArray(v) ? (v as T[]) : fallback;
}

export function useDailyFocusBoard(): FocusBoard {
  const hero = ref<FocusHero>({});
  const sre = ref<SreStatus>({ ...EMPTY_SRE });
  const okrs = ref<OkrTracker[]>([]);
  const actions = ref<FocusAction[]>([]);
  const anchors = ref<QuickAnchor[]>([]);
  const digest = ref<DailyDigest>({ ...EMPTY_DIGEST });
  const links = ref<FocusLink[]>([]);
  const available = ref(false);
  const loading = ref(true);
  const lastUpdated = ref(0);

  async function fetchAll() {
    loading.value = true;
    try {
      const res = await readKnowledgeFile(FOCUS_FILE_PATH);
      const content = res?.content ?? "";
      if (!content) {
        available.value = false;
        return;
      }
      available.value = true;

      hero.value = parseHero(content) || {};

      const sreYaml = extractYamlBlock(content, "## 二、SRE 运行红黄灯");
      const sreParsed = parseYamlishStruct<SreStatus>(sreYaml, "sre_status");
      sre.value = sreParsed && Array.isArray(sreParsed.items) ? sreParsed : { ...EMPTY_SRE };

      const okrYaml = extractYamlBlock(content, "## 三、OKR 锚点追踪");
      const okrParsed = parseYamlishStruct<OkrTracker[]>(okrYaml, "okr_trackers");
      okrs.value = Array.isArray(okrParsed) ? okrParsed : [];

      const actYaml = extractYamlBlock(content, "## 四、角色化今日行动项");
      const actParsed = parseYamlishStruct<FocusAction[]>(actYaml, "actions");
      actions.value = Array.isArray(actParsed) ? actParsed : [];

      const ancYaml = extractYamlBlock(content, "## 五、快速锚点");
      const ancParsed = parseYamlishStruct<QuickAnchor[]>(ancYaml, "quick_anchors");
      anchors.value = Array.isArray(ancParsed) ? ancParsed : [];

      // Section VI — 3-2-1 daily digest
      const digYaml = extractYamlBlock(content, "## 六、每日决策 3-2-1 摘要");
      const digParsed = parseYamlishStruct<Record<string, unknown>>(digYaml, "daily_digest");
      if (digParsed && typeof digParsed === "object") {
        digest.value = {
          summary_file: typeof (digParsed as any).summary_file === "string" ? (digParsed as any).summary_file : undefined,
          signals: asList<DigestSignal>((digParsed as any).signals, []).filter(s => s && typeof s === "object" && s.id && s.title),
          decisions: asList<DigestDecision>((digParsed as any).decisions, []).filter(d => d && typeof d === "object" && d.id && d.title),
          redlines: asList<DigestRedline>((digParsed as any).redlines, []).filter(r => r && typeof r === "object" && r.id && r.title),
        };
      } else {
        digest.value = { ...EMPTY_DIGEST };
      }

      // Section VII — focus extension links
      const lnkYaml = extractYamlBlock(content, "## 七、焦点延伸链接");
      const lnkParsed = parseYamlishStruct<FocusLink[]>(lnkYaml, "focus_links");
      links.value = asList<FocusLink>(lnkParsed, []).filter(l => l && typeof l === "object" && l.title && l.anchor);

      lastUpdated.value = Date.now();
    } catch {
      // Best-effort: failures leave previous state and just mark unavailable.
      available.value = available.value || false;
    } finally {
      loading.value = false;
    }
  }

  let timer: ReturnType<typeof setInterval> | null = null;
  onMounted(() => {
    fetchAll();
    timer = setInterval(fetchAll, POLL_MS);
  });
  onUnmounted(() => {
    if (timer !== null) clearInterval(timer);
  });

  return { hero, sre, okrs, actions, anchors, digest, links, available, loading, lastUpdated, retry: fetchAll };
}
