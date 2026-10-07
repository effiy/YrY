// ═══════════════════════════════════════════════════════════════════
// OkrRecommendPanel 核心逻辑 composable
// ═══════════════════════════════════════════════════════════════════
import { computed, reactive, ref, onMounted, watch } from "vue";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { ElMessage } from "element-plus";
import { confirm } from "@/hooks/useConfirmAction";
import dayjs from "dayjs";
import { PROJECT_LABELS } from "@/config";
import { scanKnowledge, writeKnowledgeFile, deleteKnowledgeFile, readKnowledgeFile } from "@/api/modules/knowledgeService";
import { chat } from "@/api/modules/chatService";
import { deleteDocument } from "@/api/modules/dataService";
import type { KnowledgeFileEntry } from "@/api/interface/yiAi";
import { fetchAllOkrMetadata } from "@/api/modules/okrService";
import { seedOkrMetadataIfEmpty } from "@/views/knowledge/executive/data/okrSeed";
import type { OkrMetadataContext } from "./okrRecommend";
import KnowledgePreviewDialog from "@/components/KnowledgePreviewDialog/KnowledgePreviewDialog.vue";
import { skillLabel, mcpLabel, isOverdue } from "./format";
import {
  LIST_TYPES,
  OKR_SYSTEM_PROMPT,
  buildListPrompt,
  buildSingleItemPrompt,
  buildActionItemPrompt,
  parseRecommendation,
  parseActionItem,
  taskToMeta,
  taskFromMeta,
  actionItemFromMeta,
  exampleTaskToActionItem,
  type OkrLevel,
  type OkrListType,
  type OkrScope,
  type OkrTaskItem,
  type OkrActionItem,
  type ApiExampleTask
} from "./okrRecommend";

/** Process stages — mirrors processRecord.vue for consistent display. */
export const STAGES = [
  { key: "requirement-review", icon: "📋", label: "需求评审" },
  { key: "technical-review", icon: "🧭", label: "技术评审" },
  { key: "code-review", icon: "🔍", label: "代码审查" },
  { key: "build-debug", icon: "⚡", label: "构建调试" },
  { key: "test-report", icon: "🧪", label: "测试报告" },
  { key: "deployment", icon: "📦", label: "部署" },
  { key: "launch", icon: "🚀", label: "上线记录" },
  { key: "retrospective", icon: "🔄", label: "复盘总结" }
] as const;
export const STAGE_KEYS = STAGES.map(s => s.key);
export const STAGE_ORDER: Record<string, number> = Object.fromEntries(STAGES.map((s, i) => [s.key, i]));

interface LoopRecord {
  path: string;
  loopId: string;
  stage: string;
  title: string;
  role: string;
  goalId: string;
  status: string;
}
interface LoopGroup {
  loopId: string;
  title: string;
  records: LoopRecord[];
  stageMap: Record<string, LoopRecord>;
  goalIds: string[];
}

interface ListState {
  items: OkrTaskItem[];
  source: "ai" | "fallback" | "";
  filePaths: string[];
}

type ViewMode = "table" | "list" | "card";

/** 统一表格行：推荐任务（listType 区分来源清单）或 Action Item（kind 区分）。 */
export type TableRow = (OkrTaskItem & { kind: "task"; listType: OkrListType }) | OkrActionItem;

function str(v: unknown): string {
  return typeof v === "string" ? v : "";
}

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

/** 任务标题 → 文件名可读 slug（保留中文/英文/数字，其余分隔符归一为 `-`）。 */
function slugifyTitle(title: string): string {
  return title
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48)
    .replace(/-+$/g, "");
}

/** `YYYY-MM` → 归档季度目录名 `YYYY-Qn`。 */
function quarterDir(monthDir: string): string {
  return `${monthDir.slice(0, 4)}-Q${Math.ceil(Number(monthDir.slice(5, 7)) / 3)}`;
}

/** 目录用「年-季度 / 年-月」（date 取 YYYY-MM），具体「日」（DD）放进文件名前缀。 */
function taskFileName(listType: OkrListType, index: number, date: string, slug: string): string {
  const dir = date.slice(0, 7);
  const day = date.slice(8, 10);
  return `${KB_DIR}/${quarterDir(dir)}/${dir}/task-${listType}-${day}-${pad(index + 1)}-${slug}.md`;
}

/** 从文件名推导稳定 id（task-daily-15-03-<slug>.md → daily-03，日仅作归档分组不参与 id）。 */
function taskIdFromFileName(name: string): string {
  const m = name.match(/^task-(daily|weekly|risk)-\d{2}-(\d{2})(?:-.*)?\.md$/);
  return m ? `${m[1]}-${m[2]}` : name.replace(/\.md$/, "");
}

function renderTaskBody(item: OkrTaskItem): string {
  const metric = item.metric;
  const metricLine = metric
    ? `- **指标** ${metric.icon} ${metric.name}（当前 ${metric.current}${metric.unit} → 目标 ${metric.target}${metric.unit}，进度 ${metric.progress}%）`
    : "- **指标** —";
  return [
    `# ${item.title}`,
    "",
    `> ${item.reason || item.title}`,
    "",
    "| Field | Value |",
    "|---|---|",
    `| Role | ${item.roleName} |`,
    `| Priority | ${item.priority} |`,
    `| Score | ${item.score} |`,
    `| Effort | ${item.effort} |`,
    `| Due | ${item.dueDate || "—"} |`,
    `| Goal | ${item.goalId || "—"} |`,
    `| Skill | ${item.skill ? skillLabel(item.skill) : "—"} |`,
    `| Agent | ${item.agent || "—"} |`,
    `| MCP | ${mcpLabel(item.mcp)} |`,
    "",
    metricLine
  ].join("\n");
}

const KB_DIR = "okr";

function buildLoopGroups(files: KnowledgeFileEntry[]): LoopGroup[] {
  const records: LoopRecord[] = [];
  const summaryTitles: Record<string, string> = {};
  for (const f of files) {
    const m = f.meta ?? {};
    if (m.type === "loop-summary") {
      const sid = str(m.loopId);
      const stitle = str(m.title);
      if (sid && stitle) summaryTitles[sid] = stitle;
      continue;
    }
    if (m.type !== "loop-record") continue;
    const stage = str(m.stage);
    if (!(stage in STAGE_ORDER)) continue;
    records.push({
      path: f.path,
      loopId: str(m.loopId) || f.path.split("/").find(seg => /^loop-/.test(seg)) || "loop",
      stage,
      title: str(m.title) || f.name.replace(/\.md$/, ""),
      role: str(m.role),
      goalId: str(m.goalId),
      status: str(m.status) || "in-progress"
    });
  }
  const byLoop = new Map<string, LoopRecord[]>();
  for (const r of records) {
    if (!byLoop.has(r.loopId)) byLoop.set(r.loopId, []);
    byLoop.get(r.loopId)!.push(r);
  }
  return [...byLoop.entries()].map(([loopId, recs]) => {
    recs.sort((a, b) => (STAGE_ORDER[a.stage] ?? 99) - (STAGE_ORDER[b.stage] ?? 99));
    const stageMap: Record<string, LoopRecord> = {};
    const goalIds = new Set<string>();
    for (const r of recs) {
      stageMap[r.stage] = r;
      if (r.goalId) goalIds.add(r.goalId);
    }
    const title =
      summaryTitles[loopId] ||
      (() => {
        const dirSlug = recs[0]?.path.split("/").find(seg => /^loop-/.test(seg)) ?? loopId;
        return dirSlug
          .replace(/^loop-\d+-/, "")
          .replace(/-/g, " ")
          .replace(/\b\w/g, c => c.toUpperCase());
      })();
    return { loopId, title, records: recs, stageMap, goalIds: [...goalIds] };
  });
}

const emptyState = (): ListState => ({ items: [], source: "", filePaths: [] });

export function useOkrPanel(
  props: { projects?: string[]; roles?: string[]; filterDate?: Date | null },
  emit: { (e: "update:counts", counts: Record<string, number>): void }
) {
  const { t } = useI18n();
  const router = useRouter();

  const previewDlg = ref<InstanceType<typeof KnowledgePreviewDialog> | null>(null);

  /** OKR metadata fetched from MongoDB API — when available, overrides static imports. */
  const metadataCtx = ref<OkrMetadataContext | undefined>(undefined);

  /** API-backed role data (empty until metadata loads). */
  const apiRoles = computed(() => metadataCtx.value?.rolesData ?? {});
  /** Flat goal map from API data. */
  const apiGoals = computed(() => {
    if (!metadataCtx.value) return {} as Record<string, any>;
    const map: Record<string, any> = {};
    for (const goals of Object.values(metadataCtx.value.goalsData)) {
      for (const g of goals) map[g.id] = g;
    }
    return map;
  });

  /** 选中角色 id 集合（由父组件角色导航控制）；空数组 = 展示全部角色。 */
  const selectedRoles = computed(() => props.roles ?? []);

  /** AI 生成范围：仅选中单一角色时限定到该角色，否则生成全角色（"all"）。 */
  const roleScope = computed<OkrScope>(() => (selectedRoles.value.length === 1 ? selectedRoles.value[0] : "all"));
  const roleOptions = computed(() => Object.values(apiRoles.value).map(r => ({ id: r.id, name: r.name, icon: r.icon })));

  /** 批量生成进行中（禁用生成按钮）。 */
  const generating = ref(false);
  /** 单条重生成中的行 id（仅该行显示 loading）。 */
  const regeneratingId = ref("");

  const viewMode = ref<ViewMode>("table");

  const expandedCards = ref<Set<string>>(new Set());

  function toggleExpandCard(id: string) {
    const next = new Set(expandedCards.value);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    expandedCards.value = next;
  }

  function dueRelative(dueDate: string): string {
    if (!dueDate) return "";
    const d = dayjs(dueDate);
    if (!d.isValid()) return "";
    const today = dayjs().startOf("day");
    const diff = d.diff(today, "day");
    if (diff < 0) return `逾期 ${Math.abs(diff)} 天`;
    if (diff === 0) return "今天截止";
    if (diff === 1) return "明天截止";
    if (diff <= 3) return `${diff} 天后截止`;
    return "";
  }

  const lists = reactive<Record<OkrListType, ListState>>({
    daily: emptyState(),
    weekly: emptyState(),
    risk: emptyState()
  });

  /** Action Item（okr-action）— 与推荐任务合并展示，只读、不参与 AI 生成。 */
  const actionItems = ref<OkrActionItem[]>([]);

  /** Process loop records loaded from knowledge base. */
  const loopGroups = ref<LoopGroup[]>([]);

  /** goalId → matching loop groups (a loop may have records with different goalIds per stage). */
  const loopByGoalId = computed(() => {
    const map: Record<string, LoopGroup[]> = {};
    for (const g of loopGroups.value) {
      for (const goalId of g.goalIds) {
        if (!map[goalId]) map[goalId] = [];
        map[goalId].push(g);
      }
    }
    return map;
  });

  /** 四类推荐清单 + Action Item 合并为一张表。 */
  const allRows = computed<TableRow[]>(() => {
    const tasks: TableRow[] = LIST_TYPES.flatMap(l =>
      lists[l.key].items.map(item => ({ ...item, kind: "task" as const, listType: l.key }))
    );
    return [...tasks, ...actionItems.value].sort((a, b) => b.score - a.score);
  });

  /** 各角色条目数量（`all` 为总数），上报给父组件的角色导航角标。 */
  const roleCounts = computed<Record<string, number>>(() => {
    const roleIds = Object.keys(apiRoles.value);
    const counts: Record<string, number> = { all: allRows.value.length };
    for (const rid of roleIds) counts[rid] = allRows.value.filter(i => i.role === rid).length;
    return counts;
  });

  watch(roleCounts, c => emit("update:counts", { ...c }), { immediate: true });

  // ── 分类筛选 + 搜索 + 日期 ──────────────────────────
  const categoryFilter = ref<"all" | OkrListType>("all");
  const columnFilters = reactive<Record<string, string>>({});

  const filterDate = computed(() => props.filterDate ?? null);

  const isFilterToday = computed(() => {
    const d = filterDate.value;
    return d ? d.toDateString() === new Date().toDateString() : false;
  });

  /** 任务 → 项目 id（小写）：优先 goalId 关联目标的 project，回退到角色首项目。 */
  function projectOfRow(row: TableRow): string {
    const goal = row.goalId ? apiGoals.value[row.goalId] : undefined;
    const p = goal?.project || apiRoles.value[row.role]?.projects?.[0] || "";
    return p.toLowerCase();
  }

  /** 分类按钮上的数量：按项目筛选（不按分类/日期/搜索）统计每类行数。 */
  const categoryCounts = computed<Record<string, number>>(() => {
    const projs = props.projects;
    let scoped = projs?.length ? allRows.value.filter(i => projs.includes(projectOfRow(i))) : allRows.value;
    if (selectedRoles.value.length) scoped = scoped.filter(i => selectedRoles.value.includes(i.role));
    const counts: Record<string, number> = { all: scoped.length };
    for (const l of LIST_TYPES) counts[l.key] = scoped.filter(i => i.listType === l.key && !isResolvedRisk(i)).length;
    return counts;
  });

  const filteredItems = computed(() => {
    let result = categoryFilter.value === "all" ? allRows.value : allRows.value.filter(i => i.listType === categoryFilter.value);
    // 「风险与阻塞」只展示未解除的项；已 Done 的阻塞视为已解除，不再列出。
    if (categoryFilter.value === "risk") result = result.filter(i => !isResolvedRisk(i));
    const projs = props.projects;
    if (projs?.length) result = result.filter(i => projs.includes(projectOfRow(i)));
    if (selectedRoles.value.length) result = result.filter(i => selectedRoles.value.includes(i.role));
    if (filterDate.value) {
      const dateStr = dayjs(filterDate.value).format("YYYY-MM-DD");
      result = result.filter(i => i.dueDate === dateStr);
    }
    // per-column filters
    const f = (k: string) => (columnFilters[k] || "").trim().toLowerCase();
    const tf = f("title");
    if (tf) result = result.filter(i => i.title.toLowerCase().includes(tf));
    const rf = f("role");
    if (rf) result = result.filter(i => i.roleName.toLowerCase().includes(rf) || i.role.toLowerCase().includes(rf));
    const gf = f("goal");
    if (gf)
      result = result.filter(
        i => apiGoals.value[i.goalId]?.title?.toLowerCase().includes(gf) || i.goalId.toLowerCase().includes(gf)
      );
    const mf = f("metric");
    if (mf) result = result.filter(i => i.metric?.name?.toLowerCase().includes(mf));
    const sf = f("skill");
    if (sf) result = result.filter(i => i.skill.toLowerCase().includes(sf) || skillLabel(i.skill).toLowerCase().includes(sf));
    const af = f("agent");
    if (af) result = result.filter(i => i.agent.toLowerCase().includes(af));
    const mcpf = f("mcp");
    if (mcpf) result = result.filter(i => i.mcp.toLowerCase().includes(mcpf));
    const duef = f("due");
    if (duef) result = result.filter(i => i.dueDate.includes(duef));
    const reasonf = f("reason");
    if (reasonf) result = result.filter(i => i.reason.toLowerCase().includes(reasonf));
    return result;
  });

  const stats = computed(() => {
    const items = filteredItems.value;
    return {
      total: items.length,
      p0: items.filter(i => i.priority === "P0").length,
      overdue: items.filter(i => isOverdue(i.dueDate)).length
    };
  });

  watch(filteredItems, items => {
    const ids = new Set(items.map(i => i.id));
    const next = new Set(expandedCards.value);
    let changed = false;
    for (const id of expandedCards.value) {
      if (!ids.has(id)) {
        next.delete(id);
        changed = true;
      }
    }
    if (changed) expandedCards.value = next;
  });

  function statusTagType(status: string): "success" | "danger" | "warning" | "info" {
    if (status === "Done") return "success";
    if (status === "At Risk") return "danger";
    if (status === "In Progress") return "warning";
    return "info";
  }

  /** 已解除（Done）的风险/阻塞项不再计入「风险与阻塞」清单。 */
  function isResolvedRisk(row: TableRow): boolean {
    return row.listType === "risk" && row.kind === "action" && row.status === "Done";
  }

  function levelLabel(l: OkrLevel): string {
    return t(`home.aiRecommend.level.${l}`);
  }

  function scoreTagType(score: number): "danger" | "warning" | "primary" | "info" {
    return score >= 60 ? "danger" : score >= 35 ? "warning" : score >= 15 ? "primary" : "info";
  }

  function trendIcon(trend: string): string {
    return trend === "up" ? "↑" : trend === "down" ? "↓" : "→";
  }

  function renderRowMarkdown(row: TableRow): string {
    const metric = row.metric;
    const metricLine = metric
      ? `- **指标** ${metric.icon} ${metric.name}（当前 ${metric.current}${metric.unit} → 目标 ${metric.target}${metric.unit}，进度 ${metric.progress}%）`
      : "- **指标** —";
    const statusLine = row.kind === "action" ? `| Status | ${row.status} |` : "";
    return [
      `# ${row.title}`,
      "",
      `> ${row.reason || row.title}`,
      "",
      "| Field | Value |",
      "|---|---|",
      `| Role | ${row.roleName} |`,
      `| Priority | ${row.priority} |`,
      `| Score | ${row.score} |`,
      `| Effort | ${row.effort} |`,
      `| Due | ${row.dueDate || "—"} |`,
      `| Goal | ${row.goalId || "—"} |`,
      `| Skill | ${row.skill ? skillLabel(row.skill) : "—"} |`,
      `| Agent | ${row.agent || "—"} |`,
      `| MCP | ${mcpLabel(row.mcp)} |`,
      statusLine,
      "",
      metricLine
    ]
      .filter(Boolean)
      .join("\n");
  }

  function openPreview(row: TableRow) {
    if (row.filePath) {
      previewDlg.value?.open(row.filePath);
    } else {
      previewDlg.value?.openRaw({
        title: row.title,
        content: renderRowMarkdown(row)
      });
    }
  }

  function renderMetricMarkdown(metric: {
    id: string;
    icon: string;
    name: string;
    description: string;
    current: number;
    target: number;
    baseline: number;
    unit: string;
    trend: string;
    progress: number;
    category: string;
    framework: string;
  }): string {
    return [
      `# ${metric.icon} ${metric.name}`,
      "",
      `> ${metric.description || metric.name}`,
      "",
      "| Field | Value |",
      "|---|---|",
      `| Current | ${metric.current}${metric.unit} |`,
      `| Target | ${metric.target}${metric.unit} |`,
      `| Baseline | ${metric.baseline}${metric.unit} |`,
      `| Progress | ${metric.progress}% |`,
      `| Trend | ${metric.trend} |`,
      `| Category | ${metric.category} |`,
      `| Framework | ${metric.framework} |`
    ].join("\n");
  }

  function openMetricPreview(metric: {
    id: string;
    icon: string;
    name: string;
    description: string;
    current: number;
    target: number;
    baseline: number;
    unit: string;
    trend: string;
    progress: number;
    category: string;
    framework: string;
  }) {
    previewDlg.value?.openRaw({
      title: `${metric.icon} ${metric.name}`,
      content: renderMetricMarkdown(metric)
    });
  }

  function openSkillPreview(skillId: string) {
    previewDlg.value?.open(`skills/${skillId}/SKILL.md`);
  }

  function openAgentChat(agent: string) {
    router.push("/ai-chat");
  }

  function openMcp(mcp: string) {
    if (mcp === "github") {
      window.open("https://github.com", "_blank", "noopener,noreferrer");
    } else if (mcp === "yiai") {
      router.push("/ai-chat");
    }
  }

  function stageIcon(stage: string): string {
    return STAGES.find(s => s.key === stage)?.icon ?? "·";
  }

  function stageLabel(stage: string): string {
    return STAGES.find(s => s.key === stage)?.label ?? stage;
  }

  function goToProcess(loopId: string) {
    router.push({ path: "/knowledge/executive/processRecord", query: { loop: loopId } });
  }

  /** 项目 key → 展示名（无映射时回退原 key）。 */
  function projectLabel(key: string): string {
    return PROJECT_LABELS[key] ?? key;
  }

  /** 正向闭环：跳转到该项目的 Project Management 详情页。 */
  function goToProject(key: string) {
    router.push(`/project/${key}`);
  }

  function openRecord(path: string) {
    previewDlg.value?.open(path);
  }

  // ── 知识库持久化 ─────────────────────────────

  /** 把某一清单整体落盘：顺序编号 → 写文件 → 删除不再存在的旧文件。 */
  async function persistList(listType: OkrListType) {
    const state = lists[listType];
    const today = dayjs().format("YYYY-MM-DD");
    const newPaths: string[] = [];
    let failed = false;
    for (let i = 0; i < state.items.length; i++) {
      const item = state.items[i];
      item.id = `${listType}-${pad(i + 1)}`;
      const path = taskFileName(listType, i, item.dueDate || today, slugifyTitle(item.title) || pad(i + 1));
      item.filePath = path;
      newPaths.push(path);
      const meta: Record<string, unknown> = {
        type: "okr-task",
        list: listType,
        id: item.id,
        ...taskToMeta(item, state.source === "ai" ? "ai" : "fallback")
      };
      try {
        await writeKnowledgeFile(path, renderTaskBody(item), meta);
      } catch (e) {
        console.error("persistList write failed:", path, e);
        failed = true;
      }
    }
    const stale = state.filePaths.filter(p => !newPaths.includes(p));
    for (const p of stale) {
      try {
        await deleteKnowledgeFile(p);
      } catch {
        /* ignore */
      }
    }
    state.filePaths = newPaths;
    if (failed) ElMessage.error(t("common.partialSaveFailed"));
  }

  async function loadFromKnowledge() {
    try {
      const res = await scanKnowledge(KB_DIR);
      const files = res.categories?.flatMap(c => c.files) ?? [];
      const byList: Record<OkrListType, KnowledgeFileEntry[]> = { daily: [], weekly: [], risk: [] };
      for (const f of files.filter(f => f.meta?.type === "okr-task")) {
        const list = f.meta?.list;
        if (typeof list === "string" && list in byList) byList[list as OkrListType].push(f);
      }
      for (const l of LIST_TYPES) {
        const state = lists[l.key];
        const entries = byList[l.key].sort((a, b) => (taskIdFromFileName(a.name) < taskIdFromFileName(b.name) ? -1 : 1));
        state.items = entries
          .map(f => {
            const item = taskFromMeta(f.meta ?? {}, taskIdFromFileName(f.name), metadataCtx.value);
            if (item) item.filePath = f.path;
            return item;
          })
          .filter((x): x is OkrTaskItem => x !== null);
        state.filePaths = entries.map(f => f.path);
      }
      actionItems.value = files
        .filter(f => f.meta?.type === "okr-action")
        .map(f => {
          const row = actionItemFromMeta(f.meta ?? {}, f.name.replace(/\.md$/, ""), metadataCtx.value);
          if (row) row.filePath = f.path;
          return row;
        })
        .filter((x): x is OkrActionItem => x !== null);
      // Extract loop records
      loopGroups.value = buildLoopGroups(files);
    } catch {
      // 保持空态，等待用户手动生成
    }
  }

  /** 从对应清单中删除一条推荐，直接删文件并从状态中移除。 */
  async function removeItem(listType: OkrListType, id: string) {
    const state = lists[listType];
    const idx = state.items.findIndex(i => i.id === id);
    if (idx === -1) return;
    const item = state.items[idx];
    if (item.filePath) {
      await deleteKnowledgeFile(item.filePath);
    }
    state.items.splice(idx, 1);
    state.filePaths = state.filePaths.filter(p => p !== item.filePath);
  }

  /** 删除一条 Action Item（删知识库文件 + MongoDB 记录，不参与清单重编号）。 */
  async function removeActionItem(row: OkrActionItem) {
    if (row.filePath) {
      try {
        await deleteKnowledgeFile(row.filePath);
      } catch {
        ElMessage.error(t("common.deleteActionFailed"));
        return;
      }
    }
    // 同时从 MongoDB 删除，防止 loadMetadata 重新加载
    try {
      await deleteDocument("okr_example_tasks", row.id);
    } catch (e) {
      console.warn("removeActionItem: MongoDB delete failed:", row.id, e);
    }
    actionItems.value = actionItems.value.filter(a => a.id !== row.id);
  }

  /** 表格行删除入口：任务走清单持久化，Action Item 走文件删除。 */
  async function handleDelete(row: TableRow) {
    const ok = await confirm(t("common.deleteItemConfirm"), t("common.deleteTitle"));
    if (!ok) return;
    if (row.kind === "action") await removeActionItem(row);
    else await removeItem(row.listType, row.id);
    ElMessage.success(t("common.deleteSuccess"));
  }

  // ── AI 生成 / 重生成 ─────────────────────────────

  /** 所有清单中的任务（供 AI 生成/重生成时作为历史上下文，避免重复）。 */
  function historyTasks(): OkrTaskItem[] {
    return LIST_TYPES.flatMap(l => lists[l.key].items);
  }

  /** 为某清单生成推荐任务：buildListPrompt → chat → parseRecommendation → persistList。 */
  async function generateFor(listType: OkrListType) {
    const prompt = buildListPrompt(listType, roleScope.value, 2, historyTasks(), metadataCtx.value);
    const raw = await chat({
      system: OKR_SYSTEM_PROMPT,
      messages: [{ type: "user", message: prompt, timestamp: Date.now() }]
    });
    const items = parseRecommendation(raw, roleScope.value, listType, metadataCtx.value);
    if (!items.length) {
      ElMessage.warning(t("home.aiRecommend.generateEmpty"));
      return;
    }
    const state = lists[listType];
    state.items = items;
    state.source = "ai";
    await persistList(listType);
  }

  /** 「生成推荐」入口：当前分类为「全部」时依次生成四类，否则只生成当前分类。 */
  async function handleGenerate() {
    if (generating.value) return;
    generating.value = true;
    try {
      const target = categoryFilter.value === "all" ? LIST_TYPES.map(l => l.key) : [categoryFilter.value];
      let total = 0;
      for (const listType of target) {
        try {
          await generateFor(listType);
          total += lists[listType].items.length;
        } catch {
          ElMessage.error(t("home.aiRecommend.generateFailed"));
        }
      }
      if (total) ElMessage.success(t("home.aiRecommend.generateSuccess", { n: total }));
    } finally {
      generating.value = false;
    }
  }

  /** 单条任务重生成：buildSingleItemPrompt 推一条新任务，替换同 id 旧任务后落盘。 */
  async function regenerateTask(row: OkrTaskItem & { listType: OkrListType }) {
    const prompt = buildSingleItemPrompt(row.listType, row.role, row.title, historyTasks(), metadataCtx.value);
    const raw = await chat({
      system: OKR_SYSTEM_PROMPT,
      messages: [{ type: "user", message: prompt, timestamp: Date.now() }]
    });
    const fresh = parseRecommendation(raw, row.role, row.listType, metadataCtx.value)[0];
    if (!fresh) {
      ElMessage.warning(t("home.aiRecommend.generateEmpty"));
      return;
    }
    const state = lists[row.listType];
    const idx = state.items.findIndex(i => i.id === row.id);
    if (idx !== -1) state.items[idx] = fresh;
    state.source = "ai";
    await persistList(row.listType);
  }

  /** 单条 Action Item 重生成：优化标题/优先级/目标，保留既有 deadline/owner/role 与正文。 */
  async function regenerateAction(row: OkrActionItem) {
    const prompt = buildActionItemPrompt(row.role || "executive", row.title, row.dueDate, metadataCtx.value);
    const raw = await chat({
      system: OKR_SYSTEM_PROMPT,
      messages: [{ type: "user", message: prompt, timestamp: Date.now() }]
    });
    const parsed = parseActionItem(raw);
    if (!parsed) {
      ElMessage.warning(t("home.aiRecommend.generateEmpty"));
      return;
    }
    if (row.filePath) {
      let content = `# ${parsed.title}`;
      let meta: Record<string, unknown> = { type: "okr-action" };
      try {
        const res = await readKnowledgeFile(row.filePath);
        meta = { ...res.meta, title: parsed.title, priority: parsed.priority, goal: parsed.goalId };
        content = res.content.replace(/^# .*$/m, `# ${parsed.title}`);
      } catch {
        /* 读失败则退回新标题 + 空 meta，仍尽力落盘 */
      }
      await writeKnowledgeFile(row.filePath, content, meta);
    }
    row.title = parsed.title;
    row.priority = parsed.priority;
    row.goalId = parsed.goalId;
  }

  /** 表格操作列「重生成」入口：按行类型分派到任务或 Action Item。 */
  async function handleRegenerate(row: TableRow) {
    if (regeneratingId.value) return;
    regeneratingId.value = row.id;
    try {
      if (row.kind === "action") await regenerateAction(row);
      else await regenerateTask(row);
      ElMessage.success(t("home.aiRecommend.regenSuccess"));
    } catch {
      ElMessage.error(t("home.aiRecommend.regenFailed"));
    } finally {
      regeneratingId.value = "";
    }
  }

  /** Fetch OKR metadata from MongoDB API and build the context for prompt functions. */
  async function loadMetadata() {
    try {
      await seedOkrMetadataIfEmpty();
      const data = await fetchAllOkrMetadata();
      const allMetricsMap: Record<string, any> = {};
      for (const metric of data.metrics) allMetricsMap[metric.key] = metric;
      const goalMetricMap: Record<string, string[]> = {};
      for (const gm of data.goalMetrics) goalMetricMap[gm.goalId] = gm.metricIds;
      const rolesData: Record<string, any> = {};
      for (const r of data.roles) rolesData[r.id] = r;
      const goalsData: Record<string, any[]> = {};
      for (const g of data.goals) {
        const goal = { ...g, id: g.key };
        if (!goalsData[goal.role]) goalsData[goal.role] = [];
        goalsData[goal.role].push(goal);
      }
      const metricsData: Record<string, any[]> = {};
      for (const metric of data.metrics) {
        if (!metricsData[metric.role]) metricsData[metric.role] = [];
        metricsData[metric.role].push(metric);
      }
      const roleDailyDataMap: Record<string, any> = {};
      for (const d of data.daily) roleDailyDataMap[d.role] = d;
      const roleWeeklyDataMap: Record<string, any> = {};
      for (const w of data.weekly) roleWeeklyDataMap[w.role] = w;
      metadataCtx.value = {
        rolesData,
        goalsData,
        metricsData,
        allMetricsMap,
        goalMetricMap,
        roleDailyDataMap,
        roleWeeklyDataMap
      };

      // Populate action items from MongoDB example tasks
      const apiTasks = data.exampleTasks
        .map(t => exampleTaskToActionItem(t as ApiExampleTask, metadataCtx.value))
        .filter((x): x is OkrActionItem => x !== null);
      // Merge: API tasks take precedence; keep KB-loaded tasks not already present
      const existingIds = new Set(apiTasks.map(t => t.id));
      const kbOnly = actionItems.value.filter(t => !existingIds.has(t.id));
      // Preserve filePath from KB-loaded items when API items don't have one
      for (const apiTask of apiTasks) {
        if (!apiTask.filePath) {
          const kbMatch = actionItems.value.find(t => t.id === apiTask.id);
          if (kbMatch?.filePath) apiTask.filePath = kbMatch.filePath;
        }
      }
      actionItems.value = [...apiTasks, ...kbOnly];
    } catch {
      ElMessage.error("Failed to load OKR metadata from API");
    }
  }

  onMounted(async () => {
    await loadFromKnowledge();
    await loadMetadata();
  });

  return {
    // State
    viewMode,
    categoryFilter,
    columnFilters,
    expandedCards,
    generating,
    regeneratingId,
    metadataCtx,
    actionItems,
    loopGroups,
    previewDlg,
    lists,

    // Computed
    apiRoles,
    apiGoals,
    selectedRoles,
    roleScope,
    roleOptions,
    allRows,
    roleCounts,
    filteredItems,
    categoryCounts,
    stats,
    loopByGoalId,
    filterDate,
    isFilterToday,

    // Methods
    projectOfRow,
    toggleExpandCard,
    dueRelative,
    statusTagType,
    isResolvedRisk,
    levelLabel,
    scoreTagType,
    trendIcon,
    openPreview,
    openMetricPreview,
    openSkillPreview,
    openAgentChat,
    openMcp,
    stageIcon,
    stageLabel,
    goToProcess,
    projectLabel,
    goToProject,
    openRecord,
    handleDelete,
    handleGenerate,
    handleRegenerate,
    loadMetadata,

    // Constants
    STAGES,
    STAGE_KEYS,
    STAGE_ORDER,
    LIST_TYPES
  };
}