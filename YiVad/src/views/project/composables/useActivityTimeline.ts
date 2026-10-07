import { computed, ref, type Component, type Ref, type ComputedRef } from "vue";
import { useI18n } from "vue-i18n";
import { Document, Warning, Grid, Notebook } from "@element-plus/icons-vue";
import { formatRelativeTime, formatAbsolute } from "@/utils/datetime";
import { getIssueFilePath } from "@/api/modules/issueService";
import { ISSUE_PRIORITY_MAP } from "@/api/modules/issueService";
import { BUG_PRIORITY_MAP, BUG_SEVERITY_MAP } from "@/api/modules/bug";
import { MODULE_STATUS_MAP } from "@/api/modules/moduleService";
import { PRIORITY_COLORS, STATUS_COLORS } from "@/views/project/constants";
import { activityColor } from "@/views/project/composables/useProjectStats";
import type { ActivityItem } from "@/views/project/types";
import type { Issue } from "@/api/modules/issueService";
import type { BugDocument } from "@/api/modules/bug";
import type { Module } from "@/api/modules/moduleService";
import type { KnowledgeFileEntry } from "@/api/interface/yiAi";

// ── Doc type detection ──

const DOC_TYPE_LABELS: Record<string, string> = {
  prd: "PRD", architecture: "Architecture", spec: "Spec",
  workflow: "Workflow", guide: "Guide", module: "Dev",
  test: "Test", okr: "OKR", bug: "Bug"
};

const DOC_TYPE_COLORS: Record<string, string> = {
  prd: "#9a60b4", architecture: "#409eff", spec: "#67c23a",
  workflow: "#e6a23c", guide: "#36cfc9", module: "#597ef7",
  test: "#73d13d", okr: "#ff4d4f", bug: "#f56c6c"
};

function docTypeLabel(type: string): string {
  return DOC_TYPE_LABELS[type] || type.charAt(0).toUpperCase() + type.slice(1);
}

function docTypeColor(type: string): string {
  return DOC_TYPE_COLORS[type] || "#909399";
}

function detectDocType(path: string, meta?: Record<string, unknown>): string {
  const fromMeta = (meta?.doc_type as string) || (meta?.type as string) || undefined;
  if (fromMeta) return fromMeta;
  if (path.includes("/prds/")) return "prd";
  if (path.includes("/devs/")) return "module";
  if (path.includes("/tests/")) return "test";
  if (path.includes("/okrs/")) return "okr";
  if (path.includes("/workflows/")) return "workflow";
  if (path.includes("/architecture/")) return "architecture";
  if (path.includes("/specs/")) return "spec";
  return "doc";
}

// ── Issue status context labels ──

const STATUS_LABELS: Record<string, string> = {
  backlog: "Backlog", todo: "To Do", in_progress: "In Progress",
  in_review: "In Review", done: "Done", cancelled: "Cancelled"
};

function statusLabel(s: string): string {
  return STATUS_LABELS[s] || s;
}

// ── Doc status maps ──

const DOC_STATUS_LABELS: Record<string, string> = {
  draft: "Draft", review: "In Review", active: "Active",
  done: "Done", completed: "Completed", deprecated: "Deprecated",
  archived: "Archived", "已合并": "Merged", "待开始": "Pending",
  "需求已编写": "Spec Ready", "进行中": "In Progress",
  "已完成": "Done", "已取消": "Cancelled", "待评审": "Review"
};

const DOC_STATUS_COLORS: Record<string, string> = {
  draft: "#909399", review: "#e6a23c", active: "#67c23a",
  done: "#409eff", completed: "#409eff", deprecated: "#f56c6c",
  archived: "#c0c4cc", "已合并": "#67c23a", "待开始": "#909399",
  "需求已编写": "#409eff", "进行中": "#e6a23c", "已完成": "#67c23a",
  "已取消": "#f56c6c", "待评审": "#e6a23c"
};

interface DocSubtitleParts {
  assignee: string;
  statusLabel: string;
  statusColor: string;
  subtitle: string;
}

function buildDocSubtitle(f: { path: string; meta?: Record<string, unknown> }): DocSubtitleParts {
  const meta = f.meta || {};
  const docType = detectDocType(f.path, meta);
  const status = (meta.status as string) || "";
  const owner = (meta.owner as string) || (meta.author as string) || "";
  const assignee = (meta.assignee as string) || owner || "";
  const parts: string[] = [];

  if (docType === "prd") {
    const est = (meta.estimate_backend as number) || (meta.estimate_frontend as number);
    if (est) parts.push(`${est}d`);
    const month = (meta.prd_month as string) || "";
    if (month) parts.push(month);
  } else if (docType === "module") {
    const sourcePrd = (meta.source_prd as string) || "";
    if (sourcePrd) parts.push(`← ${sourcePrd.replace(/\.md$/, "").split("/").pop() || sourcePrd}`);
    const est = meta.estimate_frontend as number | undefined;
    if (est) parts.push(`${est}d`);
    const priority = meta.priority as string | undefined;
    if (priority) parts.push(priority);
  } else if (docType === "test") {
    const sourcePrds = meta.source_prds;
    if (Array.isArray(sourcePrds) && sourcePrds.length) {
      parts.push(`← ${sourcePrds.map((s: string) => s.replace(/\.md$/, "").split("/").pop() || s).join(", ")}`);
    }
    const tcCount = Array.isArray(meta.test_cases) ? (meta.test_cases as unknown[]).length : 0;
    if (tcCount) parts.push(`${tcCount} test cases`);
  } else if (docType === "okr") {
    const progress = meta.progress as number | undefined;
    if (progress !== undefined) parts.push(`${progress}%`);
    const period = (meta.period as string) || "";
    if (period) parts.push(period);
    const krCount = Object.keys(meta).filter(k => /^kr\d+$/.test(k)).length;
    if (krCount) parts.push(`${krCount} KRs`);
  }

  return {
    assignee,
    statusLabel: DOC_STATUS_LABELS[status] || "",
    statusColor: DOC_STATUS_COLORS[status] || "",
    subtitle: parts.join(" · ")
  };
}

const BUG_SEVERITY_COLORS: Record<string, string> = {
  critical: "#f56c6c", major: "#e6a23c", minor: "#409eff", trivial: "#909399"
};

function bugPriorityColorKey(p: string): keyof typeof PRIORITY_COLORS {
  const map: Record<string, keyof typeof PRIORITY_COLORS> = {
    p0: "urgent", p1: "high", p2: "medium", p3: "low",
    urgent: "urgent", high: "high", medium: "medium", low: "low"
  };
  return map[p] || "none";
}

export interface ActivitySparklineDay {
  date: string;
  count: number;
  level: number;
}

// ── Composable ──

export interface ActivityTimelineInput {
  allIssues: Ref<Issue[]>;
  allBugs: Ref<BugDocument[]>;
  allModules: Ref<Module[]>;
  knowledgeFiles: Ref<KnowledgeFileEntry[]>;
  projectKey: ComputedRef<string>;
  filterDateStr: ComputedRef<string>;
  now: ComputedRef<number>;
}

const MAX_VISIBLE = 25;

export function useActivityTimeline(input: ActivityTimelineInput) {
  const { t } = useI18n();
  const { allIssues, allBugs, allModules, knowledgeFiles, projectKey, filterDateStr, now } = input;

  const activityTypeFilter = ref<"all" | "requirement" | "bug" | "module" | "doc">("all");

  // ── Build activity from all data sources ──

  const overviewActivity = computed<ActivityItem[]>(() => {
    const date = filterDateStr.value;
    const key = projectKey.value;

    const reqIssues = date
      ? allIssues.value.filter(i => i.issue_type === "requirement" && (i.updated_at || "").slice(0, 10) === date)
      : allIssues.value.filter(i => i.issue_type === "requirement");
    const bugs = date
      ? allBugs.value.filter(b => new Date(b.updatedAt).toISOString().slice(0, 10) === date)
      : allBugs.value;
    const mods = date
      ? allModules.value.filter(m => (m.updated_at || "").slice(0, 10) === date)
      : allModules.value;

    const activity: ActivityItem[] = [];

    // Requirements
    reqIssues.slice(0, 20).forEach(i => {
      const actionKey: Record<string, string> = {
        backlog: "created", todo: "created", in_progress: "started",
        in_review: "inReview", done: "completed", cancelled: "cancelled"
      };
      activity.push({
        id: i.key, type: "requirement",
        action: (actionKey[i.status] && t(`project.overview.activity.${actionKey[i.status]}`)) || i.status,
        target: i.title, timeAgo: formatRelativeTime(i.updated_at, now.value),
        updatedAt: i.updated_at, filePath: getIssueFilePath(i),
        assignee: i.assignee || "",
        priority: ISSUE_PRIORITY_MAP[i.priority] || i.priority,
        priorityColor: PRIORITY_COLORS[i.priority as keyof typeof PRIORITY_COLORS] || PRIORITY_COLORS.none,
        badge: ISSUE_PRIORITY_MAP[i.priority] || "",
        badgeColor: PRIORITY_COLORS[i.priority as keyof typeof PRIORITY_COLORS] || PRIORITY_COLORS.none,
        subtitle: statusLabel(i.status)
      });
    });

    // Bugs
    bugs.slice(0, 10).forEach(b => {
      const actionKey: Record<string, string> = {
        open: "reported", reopened: "reopened", in_progress: "fixing",
        resolved: "resolved", closed: "closed", rejected: "rejected"
      };
      activity.push({
        id: b.key, type: "bug",
        action: (actionKey[b.status] && t(`project.overview.activity.${actionKey[b.status]}`)) || b.status,
        target: b.title, timeAgo: formatRelativeTime(b.updatedAt, now.value),
        updatedAt: new Date(b.updatedAt).toISOString(), filePath: b.contentPath || "",
        assignee: b.assignee || b.reporter || "",
        priority: BUG_PRIORITY_MAP[b.priority] || b.priority,
        priorityColor: PRIORITY_COLORS[bugPriorityColorKey(b.priority)],
        badge: BUG_SEVERITY_MAP[b.severity] || "",
        badgeColor: BUG_SEVERITY_COLORS[b.severity] || "#909399",
        subtitle: [BUG_SEVERITY_MAP[b.severity] || b.severity, statusLabel(b.status)].filter(Boolean).join(" · ")
      });
    });

    // Modules
    mods.slice(0, 10).forEach(m => {
      const isNew = m.created_at === m.updated_at;
      activity.push({
        id: m.key, type: "module",
        action: isNew ? t("project.overview.activity.moduleCreated") : t("project.overview.activity.moduleUpdated"),
        target: m.name, timeAgo: formatRelativeTime(m.updated_at, now.value),
        updatedAt: m.updated_at, link: `/project/${m.project_key}?tab=devs`,
        assignee: m.lead || "",
        badge: MODULE_STATUS_MAP[m.status] || "",
        badgeColor: STATUS_COLORS[m.status as keyof typeof STATUS_COLORS] || "#909399",
        subtitle: MODULE_STATUS_MAP[m.status] || m.status
      });
    });

    // Knowledge files
    const projectPrefix = `projects/${key}/`;
    const excludeDirs = ["bugs/", "lessons/"];
    knowledgeFiles.value
      .filter(f => {
        if (!key || !f.path.startsWith(projectPrefix)) return false;
        if (f.name === "README.md") return false;
        const rel = f.path.slice(projectPrefix.length);
        if (excludeDirs.some(d => rel.startsWith(d))) return false;
        if (date) {
          const fileDate = f.updatedAt ? new Date(f.updatedAt).toISOString().slice(0, 10) : "";
          return fileDate === date;
        }
        return true;
      })
      .slice(0, 15)
      .forEach(f => {
        const fileDate = f.updatedAt ? new Date(f.updatedAt).toISOString() : new Date().toISOString();
        const created = f.meta?.created || "";
        const isNew = !created || fileDate.slice(0, 10) === created.slice(0, 10);
        const docType = detectDocType(f.path, f.meta);
        const parts = buildDocSubtitle(f);
        activity.push({
          id: f.path, type: "doc",
          action: isNew ? t("project.overview.activity.docCreated") : t("project.overview.activity.docUpdated"),
          target: (f.meta?.title as string) || f.name.replace(/\.md$/, ""),
          timeAgo: formatRelativeTime(fileDate, now.value), updatedAt: fileDate,
          filePath: f.path, assignee: parts.assignee,
          badge: docTypeLabel(docType), badgeColor: docTypeColor(docType),
          priority: parts.statusLabel, priorityColor: parts.statusColor,
          subtitle: [docTypeLabel(docType), parts.statusLabel].filter(Boolean).join(" · ")
        });
      });

    activity.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
    return activity.slice(0, 30);
  });

  // ── Filtered activity ──

  const filteredActivity = computed(() => {
    if (activityTypeFilter.value === "all") return overviewActivity.value;
    return overviewActivity.value.filter(a => a.type === activityTypeFilter.value);
  });

  const visibleActivity = computed(() => filteredActivity.value.slice(0, MAX_VISIBLE));

  // ── Compact filter counts (replaces old KPI pills) ──

  const activityFilters = computed(() => {
    const all = overviewActivity.value;
    return [
      { key: "all" as const, label: t("project.overview.activity.filterAll"), count: all.length },
      { key: "requirement" as const, label: t("project.overview.activity.filterRequirements"), count: all.filter(a => a.type === "requirement").length, color: activityColor("requirement") },
      { key: "bug" as const, label: t("project.overview.activity.filterBugs"), count: all.filter(a => a.type === "bug").length, color: activityColor("bug") },
      { key: "module" as const, label: t("project.overview.activity.filterModules"), count: all.filter(a => a.type === "module").length, color: activityColor("module") },
      { key: "doc" as const, label: t("project.overview.activity.filterDocs"), count: all.filter(a => a.type === "doc").length, color: activityColor("doc") }
    ];
  });

  // ── Date-grouped timeline ──

  const activityGroups = computed(() => {
    const nowDate = new Date(now.value);
    const today = nowDate.toISOString().slice(0, 10);
    const yesterday = new Date(now.value - 86400000).toISOString().slice(0, 10);
    const dow = nowDate.getDay();
    const mondayOffset = dow === 0 ? 6 : dow - 1;
    const monday = new Date(nowDate);
    monday.setDate(nowDate.getDate() - mondayOffset);
    const weekStart = monday.toISOString().slice(0, 10);

    const groups: { label: string; items: ActivityItem[] }[] = [];
    const order = [t("project.overview.activity.today"), t("project.overview.activity.yesterday"), t("project.overview.activity.thisWeek"), t("project.overview.activity.earlier")];

    for (const item of visibleActivity.value) {
      const day = (item.updatedAt || "").slice(0, 10);
      let label: string;
      if (day === today) label = t("project.overview.activity.today");
      else if (day === yesterday) label = t("project.overview.activity.yesterday");
      else if (day >= weekStart) label = t("project.overview.activity.thisWeek");
      else label = t("project.overview.activity.earlier");

      let group = groups.find(g => g.label === label);
      if (!group) { group = { label, items: [] }; groups.push(group); }
      group.items.push(item);
    }

    groups.sort((a, b) => order.indexOf(a.label) - order.indexOf(b.label));
    return groups;
  });

  // ── Empty state ──

  const activityEmptyText = computed(() => {
    if (activityTypeFilter.value === "all") return t("project.overview.activity.empty");
    const labels: Record<string, string> = {
      requirement: t("project.overview.activity.filterRequirements"),
      bug: t("project.overview.activity.filterBugs"),
      module: t("project.overview.activity.filterModules"),
      doc: t("project.overview.activity.filterDocs")
    };
    return t("project.overview.activity.emptyFiltered", { type: labels[activityTypeFilter.value] || activityTypeFilter.value });
  });

  // ── 7-day sparkline ──

  const activitySparkline = computed(() => {
    const counts = new Map<string, number>();
    overviewActivity.value.forEach(a => {
      const d = (a.updatedAt || "").slice(0, 10);
      counts.set(d, (counts.get(d) || 0) + 1);
    });
    const days: { date: string; count: number; level: number }[] = [];
    const maxCount = Math.max(1, ...counts.values());
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now.value - i * 86400000);
      const ymd = d.toISOString().slice(0, 10);
      const count = counts.get(ymd) || 0;
      days.push({ date: ymd, count, level: count === 0 ? 0 : Math.max(1, Math.ceil(count / maxCount * 3)) });
    }
    return days;
  });

  // ── Actions ──

  function setFilter(type: string) {
    if (activityTypeFilter.value === type) {
      activityTypeFilter.value = "all";
    } else {
      activityTypeFilter.value = type as typeof activityTypeFilter.value;
    }
  }

  function isActivityFresh(a: ActivityItem): boolean {
    if (!a.updatedAt) return false;
    return Date.now() - new Date(a.updatedAt).getTime() < 300_000;
  }

  function activityTooltip(a: ActivityItem): string {
    return formatAbsolute(a.updatedAt);
  }

  function activityTypeIcon(type: string): Component | null {
    const icons: Record<string, Component> = {
      requirement: Document, bug: Warning, module: Grid, doc: Notebook
    };
    return icons[type] || null;
  }

  return {
    activityTypeFilter,
    overviewActivity,
    filteredActivity,
    visibleActivity,
    activityFilters,
    activityEmptyText,
    activityGroups,
    setFilter,
    isActivityFresh,
    activityTypeIcon,
    activityTooltip,
    activityColor,
    activitySparkline
  };
}

export type UseActivityTimelineReturn = ReturnType<typeof useActivityTimeline>;