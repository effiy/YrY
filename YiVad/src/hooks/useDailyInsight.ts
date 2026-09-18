/**
 * Time-based insight data for the home page.
 * Fetches yesterday/today/tomorrow activity from issues and bugs collections.
 */
import { ref, onMounted, onUnmounted, type Ref } from "vue";
import { getIssueList, type Issue } from "@/api/modules/issueService";
import { queryDocuments } from "@/api/modules/dataService";
import type { BugDocument } from "@/api/modules/bug";

export interface DailyInsight {
  yesterdayDone: Ref<Issue[]>;
  yesterdayResolvedBugs: Ref<BugDocument[]>;
  yesterdayActivityCount: Ref<number>;
  todayDue: Ref<Issue[]>;
  todayInProgress: Ref<Issue[]>;
  tomorrowDue: Ref<Issue[]>;
  overdue: Ref<Issue[]>;
  upcoming: Ref<Issue[]>;
  blocked: Ref<Issue[]>;
  pendingReview: Ref<Issue[]>;

  loading: Ref<boolean>;
  retry: () => Promise<void>;
}

/** Local date string YYYY-MM-DD (not UTC) */
function localDate(offsetDays: number): string {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function dayRangeMs(offsetDays: number): { $gte: number; $lte: number } {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() + offsetDays);
  const end = new Date(start);
  end.setHours(23, 59, 59, 999);
  return { $gte: start.getTime(), $lte: end.getTime() };
}

const POLL_MS = 60_000;

export function useDailyInsight(): DailyInsight {
  const yesterdayDone = ref<Issue[]>([]);
  const yesterdayResolvedBugs = ref<BugDocument[]>([]);
  const yesterdayActivityCount = ref(0);
  const todayDue = ref<Issue[]>([]);
  const todayInProgress = ref<Issue[]>([]);
  const tomorrowDue = ref<Issue[]>([]);
  const overdue = ref<Issue[]>([]);
  const upcoming = ref<Issue[]>([]);
  const blocked = ref<Issue[]>([]);
  const pendingReview = ref<Issue[]>([]);
  const loading = ref(true);

  async function fetchAll() {
    loading.value = true;
    try {
      const yesterday = localDate(-1);
      const today = localDate(0);
      const tomorrow = localDate(1);
      const day8 = localDate(8);
      const day31 = localDate(31);
      const yBugRange = dayRangeMs(-1);

      const results = await Promise.allSettled([
        // 1. Yesterday done issues (total also gives activity count)
        getIssueList({ status: "done", updated_at_start: yesterday, updated_at_end: yesterday, pageSize: 8, orderBy: "updated_at", orderType: "desc" }),
        // 2. Yesterday resolved bugs
        queryDocuments<BugDocument>({ cname: "bugs", filter: { status: { $in: ["resolved", "closed"] }, updatedAt: yBugRange }, pageSize: 8, orderBy: "updatedAt", orderType: "desc" }),
        // 3. Today due
        getIssueList({ due_date: today, status: "todo,in_progress,in_review", pageSize: 10, orderBy: "priority", orderType: "desc" }),
        // 4. All in-progress (split into inProgress + blocked client-side)
        getIssueList({ status: "in_progress", pageSize: 24, orderBy: "updated_at", orderType: "desc" }),
        // 5. Tomorrow due
        getIssueList({ due_date: tomorrow, status: "todo,in_progress,in_review", pageSize: 8, orderBy: "priority", orderType: "desc" }),
        // 6. Overdue — server-side: due before today, not done/cancelled
        getIssueList({ status: "todo,in_progress,in_review", due_date_end: yesterday, pageSize: 20, orderBy: "due_date", orderType: "asc" }),
        // 7. Upcoming (day 8-31)
        getIssueList({ status: "todo,in_progress,in_review", due_date_start: day8, due_date_end: day31, pageSize: 16, orderBy: "due_date", orderType: "asc" }),
        // 8. Pending review
        getIssueList({ status: "in_review", pageSize: 8, orderBy: "updated_at", orderType: "desc" })
      ]);

      const [doneRes, bugRes, todayDueRes, inProgressRes, tomorrowDueRes, overdueRes, upcomingRes, reviewRes] = results;

      const doneList = doneRes.status === "fulfilled" ? (doneRes.value.data?.list ?? []) as Issue[] : [];
      yesterdayDone.value = doneList;
      yesterdayActivityCount.value = doneRes.status === "fulfilled" ? (doneRes.value.data?.total ?? doneList.length) : 0;
      yesterdayResolvedBugs.value = bugRes.status === "fulfilled" ? (bugRes.value.data?.list ?? []) as BugDocument[] : [];
      todayDue.value = todayDueRes.status === "fulfilled" ? (todayDueRes.value.data?.list ?? []) as Issue[] : [];
      tomorrowDue.value = tomorrowDueRes.status === "fulfilled" ? (tomorrowDueRes.value.data?.list ?? []) as Issue[] : [];
      overdue.value = overdueRes.status === "fulfilled" ? (overdueRes.value.data?.list ?? []) as Issue[] : [];
      upcoming.value = upcomingRes.status === "fulfilled" ? (upcomingRes.value.data?.list ?? []) as Issue[] : [];
      pendingReview.value = reviewRes.status === "fulfilled" ? (reviewRes.value.data?.list ?? []) as Issue[] : [];

      // Split in_progress results into active vs blocked
      const allInProgress = inProgressRes.status === "fulfilled" ? (inProgressRes.value.data?.list ?? []) as Issue[] : [];
      todayInProgress.value = allInProgress.filter(i => !i.blocked_by || i.blocked_by.length === 0).slice(0, 12);
      blocked.value = allInProgress.filter(i => i.blocked_by && i.blocked_by.length > 0);
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

  return {
    yesterdayDone, yesterdayResolvedBugs, yesterdayActivityCount,
    todayDue, todayInProgress, tomorrowDue,
    overdue, upcoming, blocked, pendingReview,
    loading, retry: fetchAll
  };
}