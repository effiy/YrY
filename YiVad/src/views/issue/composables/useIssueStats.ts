import { computed, reactive, ref, type Ref } from "vue";
import {
  getIssueList,
  type Issue,
  type IssueStatus,
  type IssuePriority,
  type IssueType,
  type IssueSource,
  type ReviewStatus
} from "@/api/modules/issueService";
import type { HeaderPill } from "@/components";
import type { RequireItem } from "@/views/project/composables/useRequirements";

const STATUS_COLOR: Record<IssueStatus, string> = {
  backlog: "#9a60b4",
  todo: "#909399",
  in_progress: "#5ab1ef",
  in_review: "#e6a23c",
  done: "#91cc75",
  cancelled: "#ee6666"
};

const ISSUE_STATUS_ORDER: IssueStatus[] = [
  "todo",
  "in_progress",
  "in_review",
  "done",
  "backlog",
  "cancelled"
];

type StatsShape = {
  total: number;
  todo: number;
  in_progress: number;
  in_review: number;
  done: number;
  backlog: number;
  cancelled: number;
};

function aggregateStatusCounts(list: Issue[]): StatsShape {
  const base: StatsShape = {
    total: list.length,
    todo: 0,
    in_progress: 0,
    in_review: 0,
    done: 0,
    backlog: 0,
    cancelled: 0
  };
  return list.reduce<StatsShape>((acc, issue) => {
    if (issue.status in acc) {
      acc[issue.status as keyof StatsShape]++;
    }
    return acc;
  }, base);
}

function countBy<T, K extends string | number>(
  list: T[],
  keyFn: (item: T) => K | undefined | null
): Record<string, number> {
  return list.reduce<Record<string, number>>((acc, item) => {
    const k = keyFn(item);
    if (k != null && k !== "") {
      const key = String(k);
      acc[key] = (acc[key] ?? 0) + 1;
    }
    return acc;
  }, {});
}

function mapReqStatus(s: string): IssueStatus {
  const m: Record<string, IssueStatus> = {
    "待开始": "todo",
    "进行中": "in_progress",
    "已完成": "done",
    "待排期": "backlog",
    "已取消": "cancelled",
    "待评审": "in_review"
  };
  return m[s] || "todo";
}

function mapReqPriority(p: string): IssuePriority {
  const m: Record<string, IssuePriority> = {
    "紧急": "urgent",
    "高": "high",
    "中": "medium",
    "低": "low"
  };
  return m[p] || "medium";
}

function formatReqMonth(m: string): string {
  if (m.length === 6) return `${m.slice(0, 4)}-${m.slice(4)}`;
  return m;
}

function buildReqIssues(
  reqItems: RequireItem[],
  projectKey: string | undefined
): Issue[] {
  return reqItems.map((r) => ({
    key: formatReqMonth(r.prd_month),
    project_key: projectKey || "",
    sequence_id: 0,
    title: r.title,
    description: "",
    status: mapReqStatus(r.status),
    priority: mapReqPriority(r.priority),
    issue_type: "requirement" as IssueType,
    assignee: r.assignee || undefined,
    labels: [] as string[],
    estimate_points: r.estimate_frontend || undefined,
    start_date: "",
    due_date: "",
    source: "internal" as IssueSource,
    review_status: "approved" as ReviewStatus,
    goal_id: "",
    kb_file_path: r.path,
    created_at: "",
    updated_at: ""
  }));
}

export function useIssueStats(
  props: {
    projectKey?: string;
    filterIssueType?: string;
    excludeIssueType?: string;
    filterDate?: Date | null;
  },
  opts: {
    filterDateStr: Ref<string>;
    reqItems: Ref<any[]>;
    reqLoading: Ref<boolean>;
    fetchRequirements: (projectKey: string) => Promise<void>;
  }
) {
  const allIssues = ref<Issue[]>([]);
  const cardIssuesAll = ref<Issue[]>([]);
  const recentlyViewed = ref<Issue[]>([]);

  const stats = reactive<StatsShape>({
    total: 0,
    todo: 0,
    in_progress: 0,
    in_review: 0,
    done: 0,
    backlog: 0,
    cancelled: 0
  });

  const openCount = computed(
    () => stats.todo + stats.in_progress + stats.in_review
  );

  const completionPct = computed(() =>
    stats.total ? Math.round((stats.done / stats.total) * 100) : 0
  );

  const headerPills = computed<HeaderPill[]>(() => [
    { value: stats.total, label: "Total" },
    { value: openCount.value, label: "Open" },
    { value: stats.done, label: "Done" },
    {
      value: completionPct.value,
      suffix: "%",
      label: "Completed",
      accent: true,
      accentColor: "var(--el-color-primary-light-9)",
      accentValueColor: "var(--el-color-primary)"
    }
  ]);

  const statusDist = computed(() =>
    countBy(allIssues.value, (i) => i.status)
  );

  const priorityDist = computed(() =>
    countBy(allIssues.value, (i) => i.priority)
  );

  const typeDist = computed(() =>
    countBy(allIssues.value, (i) => i.issue_type)
  );

  const assigneeDist = computed(() =>
    countBy(allIssues.value, (i) => i.assignee)
  );

  const createdByDay = computed(() =>
    countBy(allIssues.value, (i) => (i.created_at || "").slice(0, 10) || null)
  );

  const completeness = computed(() => {
    const total = allIssues.value.length;
    const fields = [
      {
        key: "assignee",
        label: "Assignee",
        filled: allIssues.value.filter((i) => i.assignee).length
      },
      {
        key: "due_date",
        label: "Due Date",
        filled: allIssues.value.filter((i) => i.due_date).length
      },
      {
        key: "labels",
        label: "Labels",
        filled: allIssues.value.filter((i) => i.labels?.length).length
      },
      {
        key: "description",
        label: "Description",
        filled: allIssues.value.filter((i) => i.description).length
      },
      {
        key: "acceptance",
        label: "Acceptance",
        filled: allIssues.value.filter((i) => i.acceptance_criteria).length
      },
      {
        key: "estimate",
        label: "Estimate",
        filled: allIssues.value.filter((i) => i.estimate_points != null).length
      }
    ];
    return fields.map((f) => ({
      ...f,
      pct: total ? Math.round((f.filled / total) * 100) : 0,
      missing: total - f.filled
    }));
  });

  const attention = computed(() => {
    const now = Date.now();
    const overdue = allIssues.value.filter(
      (i) =>
        i.due_date &&
        i.status !== "done" &&
        new Date(i.due_date).getTime() < now
    ).length;
    const unassigned = allIssues.value.filter(
      (i) => !i.assignee && i.status !== "done" && i.status !== "cancelled"
    ).length;
    const blocked = allIssues.value.filter((i) => i.blocked_by?.length).length;
    return { overdue, unassigned, blocked };
  });

  function qualityBarColor(pct: number): string {
    if (pct >= 80) return "#67c23a";
    if (pct >= 50) return "#e6a23c";
    return "#f56c6c";
  }

  function trackRecent(issue: Issue) {
    recentlyViewed.value = [
      issue,
      ...recentlyViewed.value.filter((r) => r.key !== issue.key)
    ].slice(0, 8);
  }

  function applyCountsToStats(counts: StatsShape) {
    Object.assign(stats, counts);
  }

  async function loadStats() {
    if (props.filterIssueType === "requirement") return;
    try {
      const params: any = {
        project_key: props.projectKey || undefined,
        pageSize: 1000
      };
      if (props.filterIssueType) params.issue_type = props.filterIssueType;
      if (props.excludeIssueType)
        params.exclude_issue_type = props.excludeIssueType;
      if (opts.filterDateStr.value) {
        if (props.filterDate !== undefined) {
          params.due_date = opts.filterDateStr.value;
        } else {
          params.updated_at_start = opts.filterDateStr.value;
          params.updated_at_end = opts.filterDateStr.value;
        }
      }
      const res = await getIssueList(params);
      const list = (res.data?.list as Issue[]) ?? [];
      allIssues.value = list;
      cardIssuesAll.value = list;
      applyCountsToStats(aggregateStatusCounts(list));
    } catch {
      // stats are best-effort
    }
  }

  function syncRequirementStats() {
    const mapped = buildReqIssues(
      opts.reqItems.value as RequireItem[],
      props.projectKey
    );
    allIssues.value = mapped;
    cardIssuesAll.value = mapped;
    applyCountsToStats(aggregateStatusCounts(mapped));
  }

  return {
    allIssues,
    cardIssuesAll,
    stats,
    openCount,
    completionPct,
    headerPills,
    recentlyViewed,
    trackRecent,
    statusDist,
    priorityDist,
    typeDist,
    assigneeDist,
    createdByDay,
    loadStats,
    completeness,
    attention,
    qualityBarColor,
    syncRequirementStats,
    aggregateStatusCounts,
    STATUS_COLOR,
    ISSUE_STATUS_ORDER
  };
}

export {
  aggregateStatusCounts,
  STATUS_COLOR,
  ISSUE_STATUS_ORDER,
  mapReqStatus,
  mapReqPriority,
  formatReqMonth,
  buildReqIssues,
  countBy
};
