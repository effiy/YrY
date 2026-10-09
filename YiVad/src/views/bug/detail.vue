<template>
  <DetailSkeleton v-if="store.detailLoading" />
  <div v-else-if="store.selectedBug" class="bug-detail page">
    <div class="bug-detail__head">
      <div class="bug-detail__head-left">
        <el-button text :icon="ArrowLeft" @click="goBack">Bugs</el-button>
        <EntityBreadcrumb
          :project-key="store.selectedBug.project_key"
          :current-label="store.selectedBug.title"
          :current-icon="WarningFilled"
          class="bug-detail__breadcrumb"
        />
        <div>
          <h1 class="bug-detail__title">{{ store.selectedBug.title }}</h1>
          <div class="bug-detail__meta">
            <code>{{ store.selectedBug.key }}</code>
            <el-tag :type="severityTagType(store.selectedBug.severity)" size="small">
              {{ store.selectedBug.severity }}
            </el-tag>
            <el-tag :type="priorityTagType(store.selectedBug.priority)" size="small">
              {{ store.selectedBug.priority }}
            </el-tag>
            <el-tag :type="statusTagType(store.selectedBug.status)" size="small">
              {{ store.selectedBug.status }}
            </el-tag>
            <el-tag type="info" size="small" effect="plain">
              {{ store.selectedBug.type }}
            </el-tag>
            <span v-if="store.selectedBug.updatedAt" class="bug-detail__freshness" :class="{ 'is-stale': now - new Date(store.selectedBug.updatedAt).getTime() > 300000 }">
              · {{ formatRelativeTime(store.selectedBug.updatedAt, now) }}
            </span>
          </div>
        </div>
      </div>
      <div class="bug-detail__head-actions">
        <el-button v-if="store.selectedBug.project_key" :icon="Link" @click="goProject(store.selectedBug.project_key)"
          >Project</el-button
        >
        <el-button
          v-if="store.selectedBug.issue_key"
          :icon="Link"
          type="warning"
          plain
          @click="goIssue(store.selectedBug.issue_key)"
          >Issue</el-button
        >
        <el-button :icon="Edit" @click="store.openEditDialog(store.selectedBug, store.selectedBugContent)">Edit</el-button>
        <el-dropdown trigger="click" @command="(cmd: string) => quickChangeStatus(cmd)">
          <el-button :icon="CircleCheck" type="success" plain>Change Status</el-button>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item
                v-for="s in quickStatuses(store.selectedBug.status)"
                :key="s.value"
                :command="s.value"
              >{{ s.label }}</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
        <el-button :icon="Delete" type="danger" plain @click="handleDelete">Delete</el-button>
      </div>
    </div>

    <div class="bug-detail__body">
      <div class="bug-detail__sidebar">
        <div class="bug-detail__props">
          <div class="bug-detail__field">
            <span class="bug-detail__field-label">Project</span>
            <el-button
              v-if="store.selectedBug.project_key"
              link
              type="primary"
              class="bug-detail__field-value"
              @click="goProject(store.selectedBug.project_key)"
            >
              {{ projectName(store.selectedBug.project_key) || store.selectedBug.project || store.selectedBug.project_key }}
            </el-button>
            <span v-else class="bug-detail__field-value">{{ store.selectedBug.project || "-" }}</span>
          </div>
          <div class="bug-detail__field" v-if="store.selectedBug.issue_key">
            <span class="bug-detail__field-label">Issue</span>
            <el-button link type="warning" class="bug-detail__field-value" @click="goIssue(store.selectedBug.issue_key)">
              {{ issueTitle(store.selectedBug.issue_key) }}
            </el-button>
          </div>
          <div class="bug-detail__field" v-if="linkedModule">
            <span class="bug-detail__field-label">Module</span>
            <el-button link type="primary" class="bug-detail__field-value" @click="router.push(`/module/${linkedModule.key}`)">
              <el-icon><Grid /></el-icon> {{ linkedModule.name }}
            </el-button>
          </div>
          <div class="bug-detail__field" v-else>
            <span class="bug-detail__field-label">Module</span>
            <span class="bug-detail__field-value">{{ store.selectedBug.module || "-" }}</span>
          </div>
          <div class="bug-detail__field">
            <span class="bug-detail__field-label">Assignee</span>
            <span class="bug-detail__field-value">{{ store.selectedBug.assignee || "-" }}</span>
          </div>
          <div class="bug-detail__field">
            <span class="bug-detail__field-label">Reporter</span>
            <span class="bug-detail__field-value">{{ store.selectedBug.reporter || "-" }}</span>
          </div>
          <div class="bug-detail__field">
            <span class="bug-detail__field-label">Frequency</span>
            <span class="bug-detail__field-value">{{ store.selectedBug.frequency }}</span>
          </div>
          <div class="bug-detail__field">
            <span class="bug-detail__field-label">Environment</span>
            <span class="bug-detail__field-value">{{ store.selectedBug.environment || "-" }}</span>
          </div>
          <div class="bug-detail__field">
            <span class="bug-detail__field-label">Affected Version</span>
            <span class="bug-detail__field-value">{{ store.selectedBug.affectedVersion || "-" }}</span>
          </div>
          <div class="bug-detail__field">
            <span class="bug-detail__field-label">Fixed Version</span>
            <span class="bug-detail__field-value">{{ store.selectedBug.fixedVersion || "-" }}</span>
          </div>
          <div class="bug-detail__field" v-if="store.selectedBug.iteration">
            <span class="bug-detail__field-label">Iteration</span>
            <span class="bug-detail__field-value">{{ store.selectedBug.iteration }}</span>
          </div>
          <div class="bug-detail__field">
            <span class="bug-detail__field-label">Created</span>
            <span class="bug-detail__field-value">{{ formatAbsolute(store.selectedBug.createdAt) }}</span>
          </div>
          <div class="bug-detail__field">
            <span class="bug-detail__field-label">Updated</span>
            <span class="bug-detail__field-value">{{ formatAbsolute(store.selectedBug.updatedAt) }}</span>
          </div>
          <div class="bug-detail__field">
            <span class="bug-detail__field-label">{{ isResolved ? 'Resolved In' : 'Age' }}</span>
            <span class="bug-detail__field-value" :class="{ 'bug-detail__field-value--warn': !isResolved && ageDays > 14 }">
              {{ ageDisplay }}
            </span>
          </div>
          <div class="bug-detail__field" v-if="store.selectedBug.tags.length">
            <span class="bug-detail__field-label">Tags</span>
            <span class="bug-detail__field-value">
              <el-tag v-for="t in store.selectedBug.tags" :key="t" size="small" style="margin-right: 4px; margin-bottom: 4px">
                {{ t }}
              </el-tag>
            </span>
          </div>
        </div>
      </div>

      <div class="bug-detail__main">
        <div class="bug-detail__section">
          <h3>Description</h3>
          <BugContentSection :content="store.selectedBugContent?.description ?? ''" empty-text="No description" />
        </div>

        <div class="bug-detail__section">
          <h3>Steps to Reproduce</h3>
          <BugContentSection
            v-if="store.selectedBugContent?.stepsToReproduce.length"
            :content="store.selectedBugContent.stepsToReproduce.map((s, i) => `${i + 1}. ${s}`).join('\n')"
            empty-text="No steps recorded"
          />
          <el-empty v-else description="No steps recorded" :image-size="40" />
        </div>

        <div class="bug-detail__section">
          <h3>Expected Result</h3>
          <BugContentSection :content="store.selectedBugContent?.expectedResult ?? ''" empty-text="Not specified" />
        </div>

        <div class="bug-detail__section">
          <h3>Actual Result</h3>
          <BugContentSection :content="store.selectedBugContent?.actualResult ?? ''" empty-text="Not specified" />
        </div>

        <div class="bug-detail__section" v-if="store.selectedBugContent?.causeProblem">
          <h3>Root Cause</h3>
          <BugContentSection :content="store.selectedBugContent.causeProblem" />
        </div>

        <div class="bug-detail__section" v-if="store.selectedBugContent?.solution">
          <h3>Solution</h3>
          <BugContentSection :content="store.selectedBugContent.solution" />
        </div>

        <div class="bug-detail__section">
          <h3>Timeline</h3>
          <el-timeline>
            <el-timeline-item :timestamp="formatAbsolute(store.selectedBug.createdAt)" placement="top" type="primary">
              Created
            </el-timeline-item>
            <el-timeline-item
              v-if="store.selectedBug.resolvedAt"
              :timestamp="formatAbsolute(store.selectedBug.resolvedAt)"
              placement="top"
              type="success"
            >
              Resolved
            </el-timeline-item>
            <el-timeline-item
              v-if="store.selectedBug.closedAt"
              :timestamp="formatAbsolute(store.selectedBug.closedAt)"
              placement="top"
              type="info"
            >
              Closed
            </el-timeline-item>
            <el-timeline-item
              v-if="store.selectedBug.updatedAt && store.selectedBug.updatedAt !== store.selectedBug.createdAt"
              :timestamp="formatAbsolute(store.selectedBug.updatedAt)"
              placement="top"
              type="warning"
            >
              Last Updated
            </el-timeline-item>
          </el-timeline>
        </div>
      </div>
    </div>
  </div>

  <div v-else class="bug-detail__not-found">
    <el-result icon="error" title="Bug not found" sub-title="This bug doesn't exist or was deleted.">
      <template #extra>
        <el-button type="primary" @click="goBack">Back to Bugs</el-button>
      </template>
    </el-result>
  </div>
</template>

<script setup lang="ts" name="bugDetail">
import { computed, onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { ArrowLeft, Edit, Delete, Link, WarningFilled, Grid, CircleCheck } from "@element-plus/icons-vue";
import { EntityBreadcrumb } from "@/components";
import DetailSkeleton from "@/components/Skeleton/SkeletonDetail.vue";
import BugContentSection from "./components/BugContentSection.vue";
import { useBugStore } from "@/stores/modules/bug";
import { useProjectStore } from "@/stores/modules/project";
import { useIssueStore } from "@/stores/modules/issue";
import type { BugSeverity, BugPriority, BugStatus } from "@/api/modules/bug";
import { updateBug } from "@/api/modules/bug";
import { getIssueList } from "@/api/modules/issueService";
import { getModuleList } from "@/api/modules/moduleService";
import type { Issue } from "@/api/modules/issueService";
import type { Module } from "@/api/modules/moduleService";
import { formatAbsolute, formatRelativeTime } from "@/utils/datetime";
import { useNow } from "@/hooks/useNow";
import { ElMessage } from "element-plus";

const route = useRoute();
const router = useRouter();
const store = useBugStore();
const projectStore = useProjectStore();
const issueStore = useIssueStore();

const key = route.params.key as string;

const projects = computed(() => projectStore.projects);
const issues = computed(() => issueStore.issues);

const linkedIssue = ref<Issue | null>(null);
const linkedModule = ref<Module | null>(null);
const linkedDataLoading = ref(false);
const linkedDataError = ref(false);
const now = useNow(30_000);

// Bug age / resolution time
const RESOLVED_STATUSES = new Set(["resolved", "closed", "fixed"]);
const isResolved = computed(() => {
  const bug = store.selectedBug;
  return bug ? RESOLVED_STATUSES.has(bug.status) : false;
});
const ageMs = computed(() => {
  const bug = store.selectedBug;
  if (!bug || !bug.createdAt) return 0;
  const end = isResolved.value ? (bug.updatedAt || bug.createdAt) : now.value;
  return end - bug.createdAt;
});
const ageDays = computed(() => Math.floor(ageMs.value / 86400000));
const ageHours = computed(() => Math.floor(ageMs.value / 3600000));
const ageDisplay = computed(() => {
  if (ageDays.value > 0) return `${ageDays.value}d`;
  if (ageHours.value > 0) return `${ageHours.value}h`;
  return "< 1h";
});

async function loadLinkedEntities() {
  const bug = store.selectedBug;
  if (!bug) return;
  linkedDataLoading.value = true;
  linkedDataError.value = false;
  try {
    const [issueRes, moduleRes] = await Promise.all([getIssueList({ pageSize: 500 }), getModuleList({ pageSize: 500 })]);
    const allIssues = (issueRes.data?.list as Issue[]) ?? [];
    const allModules = (moduleRes.data?.list as Module[]) ?? [];
    linkedIssue.value = allIssues.find(i => i.key === bug.issue_key) ?? null;
    linkedModule.value = allModules.find(m => m.name === bug.module) ?? null;
  } catch {
    linkedDataError.value = true;
  } finally {
    linkedDataLoading.value = false;
  }
}

onMounted(async () => {
  await store.loadDetail(key);
  projectStore.fetchProjects({ pageSize: 100 });
  issueStore.fetchIssues({ pageSize: 500 });
  await loadLinkedEntities();
});

function projectName(key: string): string {
  return projects.value.find(p => p.key === key)?.name ?? "";
}

function goProject(key: string) {
  router.push(`/project/${key}`);
}

function issueTitle(key: string): string {
  const i = issues.value.find(x => x.key === key);
  return i ? i.title : key;
}

function goIssue(key: string) {
  router.push(`/issue/${key}`);
}

function goBack() {
  if (store.selectedBug?.project_key) {
    router.push(`/project/${store.selectedBug.project_key}`);
  } else {
    router.push("/bug");
  }
}

function handleDelete() {
  if (store.selectedBug) {
    store.handleDelete(store.selectedBug).then(() => {
      router.push("/bug");
    });
  }
}

// ── Inline status change ──
const STATUS_TRANSITIONS: Record<string, Array<{ value: string; label: string }>> = {
  open: [
    { value: "in_progress", label: "Start Progress" },
    { value: "resolved", label: "Resolve" },
    { value: "closed", label: "Close" },
    { value: "rejected", label: "Reject" }
  ],
  in_progress: [
    { value: "resolved", label: "Resolve" },
    { value: "closed", label: "Close" },
    { value: "rejected", label: "Reject" },
    { value: "reopened", label: "Reopen" }
  ],
  resolved: [
    { value: "closed", label: "Close" },
    { value: "reopened", label: "Reopen" }
  ],
  closed: [{ value: "reopened", label: "Reopen" }],
  rejected: [
    { value: "open", label: "Reopen" },
    { value: "in_progress", label: "Start Progress" }
  ],
  reopened: [
    { value: "in_progress", label: "Start Progress" },
    { value: "resolved", label: "Resolve" },
    { value: "closed", label: "Close" }
  ]
};

function quickStatuses(current: string) {
  return STATUS_TRANSITIONS[current] || [];
}

async function quickChangeStatus(newStatus: string) {
  const bug = store.selectedBug;
  if (!bug) return;
  try {
    await updateBug(bug.key, { status: newStatus, updatedAt: Date.now() } as any);
    ElMessage.success(`Bug ${bug.key} → ${newStatus}`);
    await store.loadDetail(bug.key);
  } catch (e: any) {
    ElMessage.error(e?.message || "Status change failed");
  }
}
// formatAbsolute comes from @/utils/datetime

function severityTagType(s: BugSeverity): "danger" | "warning" | "info" {
  const map: Record<BugSeverity, "danger" | "warning" | "info"> = {
    critical: "danger",
    major: "warning",
    minor: "info",
    trivial: "info"
  };
  return map[s];
}

function priorityTagType(p: BugPriority): "danger" | "warning" | "info" {
  const map: Record<BugPriority, "danger" | "warning" | "info"> = {
    p0: "danger",
    p1: "warning",
    p2: "info",
    p3: "info"
  };
  return map[p];
}

function statusTagType(s: BugStatus): "primary" | "warning" | "success" | "info" | "danger" {
  const map: Record<BugStatus, "primary" | "warning" | "success" | "info" | "danger"> = {
    open: "primary",
    in_progress: "warning",
    resolved: "success",
    closed: "info",
    rejected: "danger",
    reopened: "warning"
  };
  return map[s] || "info";
}
</script>

<style scoped lang="scss">
.bug-detail {
  height: calc(100vh - 95px);
  overflow: auto;
  // padding + background come from global .page class
  &__head {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    margin-bottom: 24px;
  }
  &__head-left {
    display: flex;
    gap: 16px;
    align-items: flex-start;
  }
  &__title {
    margin: 0 0 8px;
    font-size: 22px;
    font-weight: 600;
  }
  &__meta {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    align-items: center;
    code {
      padding: 1px 8px;
      font-size: 12px;
      color: var(--el-text-color-secondary);
      background: var(--el-fill-color-light);
      border-radius: 4px;
    }
  }
  &__freshness {
    font-size: 11px; font-weight: 500; color: var(--el-color-success); white-space: nowrap;
    &.is-stale { color: var(--el-text-color-placeholder); }
  }
  &__head-actions {
    display: flex;
    flex-shrink: 0;
    gap: 6px;
  }
  &__body {
    display: flex;
    gap: 24px;
    align-items: flex-start;
  }
  &__sidebar {
    position: sticky;
    top: 24px;
    flex-shrink: 0;
    align-self: flex-start;
    width: 260px;
  }
  &__props {
    padding: 16px;
    background: var(--el-fill-color-lighter);
    border-radius: 8px;
  }
  &__field {
    padding: 8px 0;
    font-size: 13px;
    & + & {
      border-top: 1px solid var(--el-border-color-lighter);
    }
  }
  &__field-label {
    display: block;
    margin-bottom: 4px;
    font-size: 12px;
    font-weight: 500;
    color: var(--el-text-color-secondary);
  }
  &__field-value {
    font-size: 13px;
    color: var(--el-text-color-primary);
  }
  &__main {
    flex: 1;
    min-width: 0;
  }
  &__section {
    margin-bottom: 24px;
    h3 {
      margin: 0 0 12px;
      font-size: 15px;
      font-weight: 600;
    }
  }
  &__text {
    font-size: 14px;
    line-height: 1.7;
    color: var(--el-text-color-regular);
    white-space: pre-wrap;
  }
  &__steps {
    padding-left: 20px;
    margin: 0;
    li {
      font-size: 14px;
      line-height: 1.8;
      color: var(--el-text-color-regular);
    }
  }
  &__not-found {
    padding: 80px 0;
  }
  &__link-row {
    display: flex;
    gap: 6px;
    align-items: center;
    font-size: 13px;
  }
}
</style>
