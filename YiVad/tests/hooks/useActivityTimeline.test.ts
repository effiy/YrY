import { describe, it, expect, vi } from "vitest";

vi.mock("vue-i18n", () => ({
  useI18n: () => ({
    t: (key: string, opts?: Record<string, unknown>) => {
      const translations: Record<string, string> = {
        "project.overview.activity.created": "Created",
        "project.overview.activity.started": "Started",
        "project.overview.activity.completed": "Completed",
        "project.overview.activity.inReview": "In Review",
        "project.overview.activity.cancelled": "Cancelled",
        "project.overview.activity.reported": "Reported",
        "project.overview.activity.fixing": "Fixing",
        "project.overview.activity.resolved": "Resolved",
        "project.overview.activity.closed": "Closed",
        "project.overview.activity.rejected": "Rejected",
        "project.overview.activity.reopened": "Reopened",
        "project.overview.activity.moduleCreated": "Module created",
        "project.overview.activity.moduleUpdated": "Module updated",
        "project.overview.activity.docCreated": "Created",
        "project.overview.activity.docUpdated": "Updated",
        "project.overview.activity.today": "Today",
        "project.overview.activity.yesterday": "Yesterday",
        "project.overview.activity.thisWeek": "This Week",
        "project.overview.activity.earlier": "Earlier",
        "project.overview.activity.empty": "No recent activity",
        "project.overview.activity.emptyFiltered": "No {type} activity in this view",
        "project.overview.activity.filterAll": "All",
        "project.overview.activity.filterRequirements": "Requirements",
        "project.overview.activity.filterBugs": "Bugs",
        "project.overview.activity.filterModules": "Modules",
        "project.overview.activity.filterDocs": "Docs",
      };
      const result = translations[key];
      if (result && opts) {
        return result.replace(/\{(\w+)\}/g, (_, k) => String(opts[k] ?? `{${k}}`));
      }
      return result || key;
    }
  })
}));

import { ref, computed } from "vue";
import { useActivityTimeline } from "@/views/project/composables/useActivityTimeline";

function makeIssue(overrides: Record<string, unknown> = {}) {
  return {
    key: overrides.key as string || "ISS-1",
    title: (overrides.title as string) || "Test Issue",
    issue_type: (overrides.issue_type as string) || "requirement",
    status: (overrides.status as string) || "todo",
    priority: (overrides.priority as string) || "medium",
    updated_at: (overrides.updated_at as string) || new Date().toISOString(),
    assignee: (overrides.assignee as string) || "",
    project_key: "test-proj",
    ...overrides
  } as any;
}

function makeBug(overrides: Record<string, unknown> = {}) {
  return {
    key: overrides.key as string || "BUG-1",
    title: (overrides.title as string) || "Test Bug",
    status: (overrides.status as string) || "open",
    priority: (overrides.priority as string) || "medium",
    severity: (overrides.severity as string) || "minor",
    updatedAt: (overrides.updatedAt as string) || new Date().toISOString(),
    assignee: "",
    reporter: "",
    contentPath: "",
    ...overrides
  } as any;
}

function makeModule(overrides: Record<string, unknown> = {}) {
  const ts = (overrides.updated_at as string) || new Date().toISOString();
  return {
    key: overrides.key as string || "MOD-1",
    name: (overrides.name as string) || "Test Module",
    status: (overrides.status as string) || "active",
    updated_at: ts,
    created_at: (overrides.created_at as string) || ts,
    lead: "",
    project_key: "test-proj",
    issue_keys: [],
    ...overrides
  } as any;
}

function makeKnowledgeFile(overrides: Record<string, unknown> = {}) {
  return {
    path: `projects/test-proj/prds/${overrides.name || "01-test.md"}`,
    name: (overrides.name as string) || "01-test.md",
    updatedAt: (overrides.updatedAt as string) || new Date().toISOString(),
    meta: (overrides.meta as Record<string, unknown>) || {
      title: "Test PRD",
      status: "done",
      description: "A test description"
    },
    ...overrides
  } as any;
}

describe("useActivityTimeline", () => {
  function setup(overrides: {
    issues?: any[];
    bugs?: any[];
    modules?: any[];
    files?: any[];
    date?: string;
  } = {}) {
    const allIssues = ref(overrides.issues || []);
    const allBugs = ref(overrides.bugs || []);
    const allModules = ref(overrides.modules || []);
    const knowledgeFiles = ref(overrides.files || []);
    const projectKey = computed(() => "test-proj");
    const filterDateStr = computed(() => overrides.date || "");
    const now = computed(() => Date.now());

    return useActivityTimeline({ allIssues, allBugs, allModules, knowledgeFiles, projectKey, filterDateStr, now });
  }

  it("returns empty activity for empty data", () => {
    const { overviewActivity, filteredActivity, activityGroups, activityEmptyText } = setup();
    expect(overviewActivity.value).toEqual([]);
    expect(filteredActivity.value).toEqual([]);
    expect(activityGroups.value).toEqual([]);
    expect(activityEmptyText.value).toBe("No recent activity");
  });

  it("builds activity from requirement issues with status subtitle", () => {
    const issue = makeIssue({ key: "ISS-1", title: "Build login", status: "in_progress", priority: "high", assignee: "alice" });
    const { overviewActivity } = setup({ issues: [issue] });

    expect(overviewActivity.value).toHaveLength(1);
    const item = overviewActivity.value[0];
    expect(item.type).toBe("requirement");
    expect(item.target).toBe("Build login");
    expect(item.assignee).toBe("alice");
    expect(item.badge).toBeTruthy();
    expect(item.filePath).toBeTruthy();
    expect(item.subtitle).toBe("In Progress");
  });

  it("builds activity from bugs with severity subtitle", () => {
    const bug = makeBug({ key: "BUG-1", title: "Login crash", severity: "critical", status: "open" });
    const { overviewActivity } = setup({ bugs: [bug] });

    expect(overviewActivity.value).toHaveLength(1);
    expect(overviewActivity.value[0].type).toBe("bug");
    expect(overviewActivity.value[0].target).toBe("Login crash");
    expect(overviewActivity.value[0].subtitle).toContain("Critical");
  });

  it("builds activity from modules", () => {
    const mod = makeModule({ key: "MOD-1", name: "Auth Module" });
    const { overviewActivity } = setup({ modules: [mod] });

    expect(overviewActivity.value).toHaveLength(1);
    expect(overviewActivity.value[0].type).toBe("module");
    expect(overviewActivity.value[0].target).toBe("Auth Module");
  });

  it("builds activity from knowledge files", () => {
    const file = makeKnowledgeFile({ name: "01-prd-login.md" });
    const { overviewActivity } = setup({ files: [file] });

    expect(overviewActivity.value).toHaveLength(1);
    const item = overviewActivity.value[0];
    expect(item.type).toBe("doc");
    expect(item.target).toBe("Test PRD");
    expect(item.subtitle).toBeTruthy();
  });

  it("sorts activity by updatedAt descending", () => {
    const older = makeIssue({ key: "ISS-1", title: "Old", updated_at: "2026-01-01T00:00:00Z" });
    const newer = makeIssue({ key: "ISS-2", title: "New", updated_at: "2026-09-23T00:00:00Z" });
    const { overviewActivity } = setup({ issues: [older, newer] });

    expect(overviewActivity.value[0].target).toBe("New");
    expect(overviewActivity.value[1].target).toBe("Old");
  });

  it("caps activity at 30 items", () => {
    const issues = Array.from({ length: 20 }, (_, i) =>
      makeIssue({ key: `ISS-${i}`, title: `Issue ${i}`, updated_at: new Date(2026, 0, i + 1).toISOString() })
    );
    const bugs = Array.from({ length: 10 }, (_, i) =>
      makeBug({ key: `BUG-${i}`, title: `Bug ${i}`, updatedAt: new Date(2026, 0, i + 1).toISOString() })
    );
    const files = Array.from({ length: 15 }, (_, i) =>
      makeKnowledgeFile({
        name: `prd-${i}.md`,
        path: `projects/test-proj/prds/prd-${i}.md`,
        updatedAt: new Date(2026, 0, i + 1).toISOString()
      })
    );
    const all = setup({ issues, bugs, files });
    expect(all.overviewActivity.value.length).toBeLessThanOrEqual(30);
    expect(all.overviewActivity.value.length).toBeGreaterThan(0);
  });

  it("filters activity by type", () => {
    const issue = makeIssue({ key: "ISS-1" });
    const bug = makeBug({ key: "BUG-1" });
    const { filteredActivity, activityTypeFilter } = setup({ issues: [issue], bugs: [bug] });

    activityTypeFilter.value = "bug";
    expect(filteredActivity.value).toHaveLength(1);
    expect(filteredActivity.value[0].type).toBe("bug");

    activityTypeFilter.value = "requirement";
    expect(filteredActivity.value).toHaveLength(1);
    expect(filteredActivity.value[0].type).toBe("requirement");
  });

  it("provides activity filter counts", () => {
    const issue = makeIssue({ key: "ISS-1" });
    const bug = makeBug({ key: "BUG-1" });
    const { activityFilters } = setup({ issues: [issue], bugs: [bug] });

    const allFilter = activityFilters.value.find(f => f.key === "all")!;
    expect(allFilter.count).toBe(2);
    const bugFilter = activityFilters.value.find(f => f.key === "bug")!;
    expect(bugFilter.count).toBe(1);
  });

  it("groups activity by date", () => {
    const nowMs = Date.now();
    const todayIssue = makeIssue({ key: "ISS-1", updated_at: new Date(nowMs).toISOString() });
    const yesterdayIssue = makeIssue({ key: "ISS-2", updated_at: new Date(nowMs - 86400000).toISOString() });

    const allIssues = ref([todayIssue, yesterdayIssue]);
    const allBugs = ref([]);
    const allModules = ref([]);
    const knowledgeFiles = ref([]);
    const projectKey = computed(() => "test-proj");
    const filterDateStr = computed(() => "");
    const now = computed(() => nowMs);

    const { activityGroups } = useActivityTimeline({ allIssues, allBugs, allModules, knowledgeFiles, projectKey, filterDateStr, now });
    expect(activityGroups.value).toHaveLength(2);
    expect(activityGroups.value[0].label).toBe("Today");
    expect(activityGroups.value[1].label).toBe("Yesterday");
  });

  it("isActivityFresh detects recent items", () => {
    const recent = makeIssue({ key: "ISS-1", updated_at: new Date(Date.now() - 60_000).toISOString() });
    const old = makeIssue({ key: "ISS-2", updated_at: "2026-01-01T00:00:00Z" });
    const { isActivityFresh } = setup({ issues: [recent, old] });

    const freshResult = isActivityFresh({ id: "x", type: "test", action: "x", target: "x", timeAgo: "1m", updatedAt: recent.updated_at });
    const staleResult = isActivityFresh({ id: "x", type: "test", action: "x", target: "x", timeAgo: "1y", updatedAt: old.updated_at });
    expect(freshResult).toBe(true);
    expect(staleResult).toBe(false);
  });

  it("activityTypeIcon returns correct icon components", () => {
    const { activityTypeIcon } = setup();
    expect(activityTypeIcon("requirement")).toBeTruthy();
    expect(activityTypeIcon("bug")).toBeTruthy();
    expect(activityTypeIcon("module")).toBeTruthy();
    expect(activityTypeIcon("doc")).toBeTruthy();
    expect(activityTypeIcon("unknown")).toBeNull();
  });

  it("setFilter toggles — clicking active filter resets to all", () => {
    const issue = makeIssue({ key: "ISS-1" });
    const { activityTypeFilter, setFilter } = setup({ issues: [issue] });

    expect(activityTypeFilter.value).toBe("all");
    setFilter("requirement");
    expect(activityTypeFilter.value).toBe("requirement");
    setFilter("requirement");
    expect(activityTypeFilter.value).toBe("all");
  });

  it("excludes bugs/ and lessons/ directories from knowledge file activity", () => {
    const prd = makeKnowledgeFile({ name: "01-prd.md", path: "projects/test-proj/prds/01-prd.md" });
    const bugFile = makeKnowledgeFile({ name: "bug-report.md", path: "projects/test-proj/bugs/bug-report.md" });
    const lessons = makeKnowledgeFile({ name: "lesson.md", path: "projects/test-proj/lessons/lesson.md" });
    const { overviewActivity } = setup({ files: [prd, bugFile, lessons] });

    expect(overviewActivity.value).toHaveLength(1);
    expect(overviewActivity.value[0].filePath).toBe("projects/test-proj/prds/01-prd.md");
  });

  it("excludes README.md from activity", () => {
    const readme = makeKnowledgeFile({ name: "README.md", path: "projects/test-proj/README.md" });
    const { overviewActivity } = setup({ files: [readme] });
    expect(overviewActivity.value).toHaveLength(0);
  });
});