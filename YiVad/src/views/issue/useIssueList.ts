import { computed, reactive, ref, watch, type Ref } from "vue";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { useIssueStore } from "@/stores/modules/issue";
import { useUserStore } from "@/stores/modules/user";
import {
  getIssueList,
  ISSUE_STATUS_MAP,
  ISSUE_PRIORITY_MAP,
  ISSUE_TYPE_MAP,
  ISSUE_SOURCE_MAP,
  REVIEW_STATUS_MAP,
  ISSUE_STATUS_TAG_MAP,
  ISSUE_TYPE_TAG_MAP,
  typeLabel as _typeLabel,
  getIssueFilePath
} from "@/api/modules/issueService";
import type {
  Issue,
  IssueStatus,
  IssuePriority,
  IssueType,
  TagType,
  IssueSource,
  ReviewStatus
} from "@/api/modules/issueService";
import { formatDate, formatRelativeTime } from "@/utils/datetime";
import type { ColumnProps } from "@/components";
import { useDateFilter } from "@/hooks/useDateFilter";
import { goalRoleMap, allGoalsMap } from "@/views/knowledge/executive/okrData";
import { useRequirements, type LinkedDocInfo } from "@/views/project/composables/useRequirements";

/** Display metadata for an OKR goal chip. */
export interface GoalDisplayMeta {
  icon: string;
  title: string;
  statusTag: string;
  statusTagType: "success" | "warning" | "info" | "primary" | "danger" | undefined;
  tooltip: string;
}

export function useIssueList(
  props: { projectKey?: string; filterIssueType?: string; excludeIssueType?: string; filterDate?: Date | null },
  deps: {
    previewDlgRef: Ref<any>;
    cardIssuesAll: Ref<Issue[]>;
    refreshTable: () => void;
  }
) {
  const router = useRouter();
  const { t } = useI18n();
  const store = useIssueStore();
  const userStore = useUserStore();

  // ── Requirements integration (only when filterIssueType === 'requirement') ──
  const {
    okrFileMap,
    linksForPrd
  } = useRequirements();

  // ── Search / filter state ──
  const searchText = ref("");
  const keySearchText = ref("");
  const assigneeSearchText = ref("");
  const labelSearchText = ref("");
  const quickFilter = ref("");
  const labelFilter = ref("");
  const goalFilter = ref("");
  const activeAttention = ref("");
  const overdueFilter = ref(false);
  const daysFilter = ref(0);
  const blockedFilter = ref(false);
  const noDueDateFilter = ref(false);
  const noTypeFilter = ref(false);
  const staleDays = ref(0);
  const noPriorityFilter = ref(false);

  const filters = reactive<{ status: string; priority: string; issue_type: string; assignee: string }>({
    status: "",
    priority: "",
    issue_type: props.filterIssueType || "",
    assignee: ""
  });

  // ── View mode & card pagination ──
  const viewMode = ref<"table" | "card" | "list">("table");
  const cardPage = ref(1);
  const cardPageSize = 20;

  const cardIssues = computed(() => {
    const start = (cardPage.value - 1) * cardPageSize;
    return deps.cardIssuesAll.value.slice(start, start + cardPageSize);
  });
  const cardTotal = computed(() => deps.cardIssuesAll.value.length);
  function onCardPage(p: number) {
    cardPage.value = p;
  }

  // ── Filter date ──
  const _filterDate = ref<Date | null>(null);
  const filterDate = computed({
    get: () => (props.filterDate !== undefined ? props.filterDate : _filterDate.value),
    set: v => {
      _filterDate.value = v;
    }
  });
  const {
    label: filterDateLabel,
    isToday: isFilterToday,
    filterDateStr,
    goToPrevDay,
    goToNextDay,
    goToFilterToday,
    clearFilterDate
  } = useDateFilter(filterDate);

  // ── Quick filters ──
  const quickFilters = [
    { key: "my", label: "My Issues" },
    { key: "open", label: "Open" },
    { key: "high", label: "High Priority" },
    { key: "week", label: "Due This Week" },
    { key: "done", label: "Recently Done" }
  ];

  // ── Active filter pills ──
  const hasActiveFilter = computed(() =>
    !!(quickFilter.value || filters.status || filters.priority || filters.issue_type || filters.assignee || labelFilter.value || goalFilter.value || filterDateStr.value || overdueFilter.value || daysFilter.value || blockedFilter.value || noDueDateFilter.value || noTypeFilter.value || staleDays.value || noPriorityFilter.value)
  );

  const activePills = computed<Array<{ id: string; label: string; clear: () => void }>>(() => {
    const builders: Array<() => { id: string; label: string; clear: () => void } | null> = [
      () =>
        quickFilter.value
          ? {
              id: "qf",
              label: quickFilters.find(q => q.key === quickFilter.value)?.label || quickFilter.value,
              clear: () => {
                quickFilter.value = "";
              }
            }
          : null,
      () =>
        filters.status
          ? {
              id: "status",
              label: `Status: ${ISSUE_STATUS_MAP[filters.status as IssueStatus] || filters.status}`,
              clear: () => {
                filters.status = "";
              }
            }
          : null,
      () =>
        filters.priority
          ? {
              id: "priority",
              label: `Priority: ${ISSUE_PRIORITY_MAP[filters.priority as IssuePriority] || filters.priority}`,
              clear: () => {
                filters.priority = "";
              }
            }
          : null,
      () =>
        filters.issue_type
          ? {
              id: "type",
              label: `Type: ${ISSUE_TYPE_MAP[filters.issue_type as IssueType] || filters.issue_type}`,
              clear: () => {
                filters.issue_type = "";
              }
            }
          : null,
      () =>
        filters.assignee
          ? {
              id: "assignee",
              label: `Assignee: ${filters.assignee}`,
              clear: () => {
                filters.assignee = "";
              }
            }
          : null,
      () =>
        labelFilter.value
          ? {
              id: "label",
              label: `Label: ${labelFilter.value}`,
              clear: () => {
                labelFilter.value = "";
              }
            }
          : null,
      () =>
        goalFilter.value
          ? {
              id: "goal",
              label: `Goal: ${goalLabel(goalFilter.value)}`,
              clear: () => {
                goalFilter.value = "";
              }
            }
          : null,
      () =>
        overdueFilter.value
          ? { id: "overdue", label: "Overdue", clear: () => { overdueFilter.value = false; } }
          : null,
      () =>
        daysFilter.value > 0
          ? { id: "days", label: `Last ${daysFilter.value}d`, clear: () => { daysFilter.value = 0; } }
          : null,
      () =>
        blockedFilter.value
          ? { id: "blocked", label: "Blocked", clear: () => { blockedFilter.value = false; } }
          : null,
      () =>
        noDueDateFilter.value
          ? { id: "noDueDate", label: "No Due Date", clear: () => { noDueDateFilter.value = false; } }
          : null,
      () =>
        noTypeFilter.value
          ? { id: "noType", label: "No Type", clear: () => { noTypeFilter.value = false; } }
          : null,
      () =>
        staleDays.value > 0
          ? { id: "stale", label: `Stale >${staleDays.value}d`, clear: () => { staleDays.value = 0; } }
          : null,
      () =>
        noPriorityFilter.value
          ? { id: "noPriority", label: "No Priority", clear: () => { noPriorityFilter.value = false; } }
          : null
    ];
    return builders.map(b => b()).filter(Boolean) as Array<{ id: string; label: string; clear: () => void }>;
  });

  function removePill(p: { id: string; label: string; clear: () => void }) {
    p.clear();
    deps.refreshTable();
  }

  function clearAllFilters() {
    quickFilter.value = "";
    labelFilter.value = "";
    goalFilter.value = "";
    activeAttention.value = "";
    overdueFilter.value = false;
    daysFilter.value = 0;
    blockedFilter.value = false;
    noDueDateFilter.value = false;
    noTypeFilter.value = false;
    staleDays.value = 0;
    noPriorityFilter.value = false;
    searchText.value = "";
    keySearchText.value = "";
    assigneeSearchText.value = "";
    labelSearchText.value = "";
    filters.status = "";
    filters.priority = "";
    filters.issue_type = "";
    filters.assignee = "";
    deps.refreshTable();
  }

  function applyQuickFilter(key: string) {
    quickFilter.value = key === quickFilter.value ? "" : key;
    deps.refreshTable();
  }

  function applyAttentionFilter(type: "overdue" | "unassigned" | "blocked") {
    quickFilter.value = "";
    activeAttention.value = activeAttention.value === type ? "" : type;
    if (type === "overdue") filters.status = "todo,in_progress,in_review";
    deps.refreshTable();
  }

  function onChartClick(dim: "status" | "priority" | "issue_type" | "assignee", e: { name?: string }) {
    const name = e?.name;
    if (!name) return;
    filters[dim] = filters[dim] === name ? "" : name;
    deps.refreshTable();
  }

  // ── Display helpers ──
  const statusLabel = (status: IssueStatus) => ISSUE_STATUS_MAP[status] || status;
  const priorityLabel = (p: IssuePriority) => ISSUE_PRIORITY_MAP[p] || p;
  const statusTagType = (status: IssueStatus): TagType => ISSUE_STATUS_TAG_MAP[status] || "info";
  function priorityColor(p: IssuePriority) {
    const map: Record<IssuePriority, string> = {
      urgent: "#f56c6c",
      high: "#e6a23c",
      medium: "#409eff",
      low: "#909399",
      none: "#c0c4cc"
    };
    return map[p] || "#909399";
  }
  const typeLabel = (t: IssueType) => ISSUE_TYPE_MAP[t] || t;
  const typeTagType = (t: IssueType): TagType => ISSUE_TYPE_TAG_MAP[t] || "info";
  const sourceLabel = (s: IssueSource) => ISSUE_SOURCE_MAP[s] || s;
  const reviewLabel = (s: ReviewStatus) => REVIEW_STATUS_MAP[s] || s;
  function reviewTagType(s: ReviewStatus): TagType {
    const m: Record<ReviewStatus, TagType> = { pending: "info", approved: "success", rejected: "danger", in_review: "warning" };
    return m[s] || "info";
  }
  function formatMonth(iso: string): string {
    if (!iso) return "-";
    return iso.slice(0, 7);
  }
  function truncateDesc(text: string): string {
    const plain = text
      .replace(/#{1,6}\s/g, "")
      .replace(/\*\*/g, "")
      .replace(/\*/g, "")
      .replace(/`/g, "")
      .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
      .replace(/>\s/g, "")
      .replace(/[-*+]\s/g, "")
      .replace(/\n+/g, " ")
      .trim();
    return plain.length > 160 ? plain.slice(0, 160) + "..." : plain;
  }
  function priorityTagType(p: IssuePriority): TagType {
    const map: Record<IssuePriority, TagType> = { urgent: "danger", high: "warning", medium: "primary", low: "info", none: "info" };
    return map[p] || "info";
  }
  function dueClass(issue: Issue): string {
    if (!issue.due_date || issue.status === "done") return "";
    return new Date(issue.due_date).getTime() < Date.now() ? "issue-card__due--overdue" : "";
  }
  function dueCell(row: Issue): { text: string; cls: string } {
    if (!row.due_date) return { text: "\u2014", cls: "issue-list__muted" };
    if (row.status !== "done") {
      const ms = new Date(row.due_date).getTime() - Date.now();
      if (ms < 0) return { text: `${formatDate(row.due_date)} \u00b7 Overdue`, cls: "issue-list__due--overdue" };
      const days = Math.ceil(ms / 86400000);
      if (days <= 3) return { text: `${formatDate(row.due_date)} \u00b7 ${days}d`, cls: "issue-list__due--soon" };
    }
    return { text: formatDate(row.due_date), cls: "" };
  }

  // ── OKR display ──
  const goalLabel = (goalId: string) => allGoalsMap[goalId]?.title || goalId;
  function okrFileName(goalId: string): string {
    return okrFileMap.value.get(goalId)?.title || goalId;
  }

  const projectGoalMetaCache = computed<Map<string, GoalDisplayMeta>>(() => {
    const map = new Map<string, GoalDisplayMeta>();
    for (const [id, g] of Object.entries(allGoalsMap)) {
      const statusTagType = (
        g.status === "active" || g.status === "completed"
          ? "success"
          : g.status === "planned" || g.status === "in_progress"
            ? "warning"
            : g.status === "blocked"
              ? "danger"
              : "info"
      ) as GoalDisplayMeta["statusTagType"];
      map.set(id, {
        icon: g.icon,
        title: g.title,
        statusTag: g.status,
        statusTagType,
        tooltip: `${g.description}\nOwner: ${g.owner} \u00b7 ${g.period}`
      });
    }
    for (const [id, info] of okrFileMap.value.entries()) {
      if (map.has(id)) continue;
      const pctLabel = info.progress ? ` \u00b7 ${info.progress}%` : "";
      const statusTagType = (
        info.status === "completed"
          ? "success"
          : info.status === "in_progress"
            ? "warning"
            : info.status === "blocked"
              ? "danger"
              : "info"
      ) as GoalDisplayMeta["statusTagType"];
      map.set(id, {
        icon: "\ud83c\udfaf",
        title: info.title || id,
        statusTag: info.status || "",
        statusTagType,
        tooltip: `${info.title || id}${pctLabel}\n${info.period || ""}${info.owner ? ` \u00b7 ${info.owner}` : ""}`
      });
    }
    return map;
  });

  function goalDisplayMeta(goalId: string): GoalDisplayMeta {
    return (
      projectGoalMetaCache.value.get(goalId) || {
        icon: "\ud83c\udfaf",
        title: okrFileName(goalId),
        statusTag: "",
        statusTagType: "info",
        tooltip: goalId
      }
    );
  }

  function openOkrFile(goalId: string) {
    const info = okrFileMap.value.get(goalId);
    if (info) deps.previewDlgRef.value?.open(info.path);
  }

  /** Dev tasks / test specs linked to a PRD row, resolved from its knowledge path. */
  const prdLinks = (row: Issue) => linksForPrd(row.kb_file_path);

  function openDocLink(path: string) {
    if (path) deps.previewDlgRef.value?.open(path);
  }

  // ── Navigation ──
  const goProject = (key: string) => {
    if (key) router.push(`/project/${key}`);
  };
  const goModule = (key: string) => {
    if (key) router.push(`/module/${key}`);
  };
  function goGoal(goalId: string) {
    const role = goalRoleMap[goalId];
    if (role) router.push(`/knowledge/executive/okr?role=${role}&goal=${goalId}`);
  }

  // ── Columns definition ──
  const columns = computed<ColumnProps<Issue>[]>(() => {
    const coreCols: ColumnProps<Issue>[] = [
      { type: "selection", width: 50 },
      { prop: "key", label: t("issue.table.key"), width: 120 },
      { prop: "title", label: t("issue.table.title"), minWidth: 220 },
      { prop: "issue_type", label: t("issue.table.type"), width: 105 },
      { prop: "priority", label: t("issue.table.priority"), width: 92 },
      { prop: "estimate_points", label: t("issue.table.points"), width: 80 },
      { prop: "status", label: t("issue.table.status"), width: 110 },
      { prop: "labels", label: t("issue.table.labels"), width: 150 },
      { prop: "source", label: t("issue.table.source"), width: 105 },
      { prop: "review_status", label: t("issue.table.review"), width: 105 }
    ];
    const projectCol: ColumnProps<Issue> = { prop: "project_key", label: t("issue.table.project"), width: 130 };
    const tailCols: ColumnProps<Issue>[] = [
      { prop: "module", label: t("issue.table.module"), width: 120 },
      { prop: "goal_id", label: t("issue.table.goal"), width: 120 },
      { prop: "assignee", label: t("issue.table.assignee"), width: 100 },
      { prop: "start_date", label: t("issue.table.start"), width: 110 },
      { prop: "due_date", label: t("issue.table.due"), width: 135 },
      { prop: "created_at", label: t("issue.table.created"), width: 120 },
      { prop: "updated_at", label: t("issue.table.updated"), width: 120 },
      { prop: "operation", label: t("issue.table.actions"), width: 190, fixed: "right" }
    ];
    return [...coreCols, ...(props.projectKey ? [] : [projectCol]), ...tailCols];
  });

  // ── Data fetching ──
  function buildApiParams(pageNum: number, pageSize: number, searchParams: Record<string, any>): Record<string, any> {
    const merged: Record<string, any> = { pageNum, pageSize, project_key: props.projectKey, ...searchParams };
    if (merged.title) {
      merged.search = merged.title;
      delete merged.title;
    }
    if (searchText.value) merged.search = searchText.value;
    if (keySearchText.value) merged.key = keySearchText.value;
    if (assigneeSearchText.value) merged.assignee = assigneeSearchText.value;
    if (labelSearchText.value) merged.labels = labelSearchText.value;
    if (filters.status) merged.status = filters.status;
    if (filters.priority) merged.priority = filters.priority;
    if (filters.issue_type) merged.issue_type = filters.issue_type;
    if (props.excludeIssueType) merged.exclude_issue_type = props.excludeIssueType;
    if (filters.assignee) {
      if (filters.assignee === "none") {
        (merged.$and ||= []).push({ $or: [{ assignee: { $exists: false } }, { assignee: "" }, { assignee: null }] });
      } else {
        merged.assignee = filters.assignee;
      }
    }
    if (labelFilter.value) merged.labels = labelFilter.value;
    if (goalFilter.value) merged.goal_id = goalFilter.value;
    if (filterDateStr.value) {
      if (props.filterDate !== undefined) {
        merged.due_date = filterDateStr.value;
      } else {
        merged.updated_at_start = filterDateStr.value;
        merged.updated_at_end = filterDateStr.value;
      }
    }
    if (overdueFilter.value) {
      merged.status = "todo,in_progress,in_review";
      merged.due_date = { $lt: new Date().toISOString().slice(0, 10), $ne: "" };
    }
    if (daysFilter.value > 0) {
      const d = new Date();
      d.setDate(d.getDate() - daysFilter.value);
      merged.updated_at_start = d.toISOString().slice(0, 10);
    }
    if (blockedFilter.value) {
      merged.blocked_by = { $ne: [], $exists: true };
    }
    if (noDueDateFilter.value) {
      merged.status = merged.status || "todo,in_progress,in_review";
      (merged.$and ||= []).push({ $or: [{ due_date: { $exists: false } }, { due_date: null }, { due_date: "" }] });
    }
    if (noTypeFilter.value) {
      merged.status = merged.status || "todo,in_progress,in_review";
      (merged.$and ||= []).push({ $or: [{ issue_type: { $exists: false } }, { issue_type: null }, { issue_type: "" }] });
    }
    if (staleDays.value > 0) {
      merged.status = merged.status || "todo,in_progress,in_review";
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - staleDays.value);
      merged.updated_at_end = cutoff.toISOString().slice(0, 10);
    }
    if (noPriorityFilter.value) {
      merged.status = merged.status || "todo,in_progress,in_review";
      (merged.$and ||= []).push({ $or: [{ priority: { $exists: false } }, { priority: null }, { priority: "" }, { priority: "none" }] });
    }
    return merged;
  }

  function applyQuickFilters(merged: Record<string, any>) {
    if (!quickFilter.value) return;
    const today = new Date().toISOString().slice(0, 10);
    const weekEnd = new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10);
    switch (quickFilter.value) {
      case "my":
        merged.assignee = userStore.userInfo.name || "admin";
        break;
      case "open":
        merged.status = "todo,in_progress,in_review";
        break;
      case "high":
        merged.priority = "urgent,high";
        break;
      case "week":
        merged.due_date_start = today;
        merged.due_date_end = weekEnd;
        break;
      case "done":
        merged.status = "done";
        merged.orderBy = "updated_at";
        break;
    }
  }



  async function fetchIssues(params: any) {
    const { pageNum, pageSize, ...searchParams } = params;
    const merged = buildApiParams(pageNum, pageSize, searchParams);
    applyQuickFilters(merged);

    const res = await getIssueList(merged);
    const list = (res.data?.list ?? []) as Issue[];
    const total = res.data?.total ?? 0;

    store.issues = list;
    store.total = total;
    return { data: { list, total, pageNum: merged.pageNum, pageSize: merged.pageSize } };
  }

  // ── Unique row id ──
  const rowId = (row: Issue) => row.kb_file_path || row.key;

  return {
    // search/filter state
    searchText,
    keySearchText,
    assigneeSearchText,
    labelSearchText,
    quickFilter,
    labelFilter,
    goalFilter,
    activeAttention,
    overdueFilter,
    daysFilter,
    blockedFilter,
    noDueDateFilter,
    noTypeFilter,
    staleDays,
    noPriorityFilter,
    filters,
    // view mode
    viewMode,
    cardPage,
    cardPageSize,
    cardIssues,
    cardTotal,
    onCardPage,
    // columns
    columns,
    // data fetching
    fetchIssues,
    buildApiParams,
    applyQuickFilters,
    // requirements
    okrFileMap,
    linksForPrd,
    // filter date
    filterDate,
    filterDateLabel,
    isFilterToday,
    filterDateStr,
    goToPrevDay,
    goToNextDay,
    goToFilterToday,
    clearFilterDate,
    // format helpers
    formatDate,
    formatRelativeTime,
    // quick filters
    quickFilters,
    // filter pills
    hasActiveFilter,
    activePills,
    removePill,
    clearAllFilters,
    applyQuickFilter,
    applyAttentionFilter,
    onChartClick,
    // display helpers
    statusLabel,
    priorityLabel,
    statusTagType,
    priorityColor,
    typeLabel,
    typeTagType,
    sourceLabel,
    reviewLabel,
    reviewTagType,
    formatMonth,
    truncateDesc,
    priorityTagType,
    dueClass,
    dueCell,
    rowId,
    // OKR
    goalLabel,
    goalDisplayMeta,
    projectGoalMetaCache,
    openOkrFile,
    prdLinks,
    openDocLink,
    // navigation
    goProject,
    goModule,
    goGoal,
    // store access
    store
  };
}

export type IssueListContext = ReturnType<typeof useIssueList>;