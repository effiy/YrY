<template>
  <div class="bug-detail" v-loading="store.detailLoading">
    <template v-if="store.selectedBug">
      <div class="bug-detail__head">
        <div class="bug-detail__head-left">
          <el-button text :icon="ArrowLeft" @click="goBack">Bugs</el-button>
          <EntityBreadcrumb :project-key="store.selectedBug.project_key" :current-label="store.selectedBug.title" :current-icon="WarningFilled" class="bug-detail__breadcrumb" />
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
            </div>
          </div>
        </div>
        <div class="bug-detail__head-actions">
          <el-button v-if="store.selectedBug.project_key" :icon="Link" @click="goProject(store.selectedBug.project_key)">Project</el-button>
          <el-button v-if="store.selectedBug.issue_key" :icon="Link" type="warning" plain @click="goIssue(store.selectedBug.issue_key)">Issue</el-button>
          <el-button :icon="Edit" @click="store.openEditDialog(store.selectedBug, store.selectedBugContent)">Edit</el-button>
          <el-button :icon="Delete" type="danger" plain @click="handleDelete">Delete</el-button>
        </div>
      </div>

      <div class="bug-detail__body">
        <div class="bug-detail__sidebar">
          <div class="bug-detail__props">
          <div class="bug-detail__field">
            <span class="bug-detail__field-label">Project</span>
            <el-button v-if="store.selectedBug.project_key" link type="primary" class="bug-detail__field-value" @click="goProject(store.selectedBug.project_key)">
              {{ projectName(store.selectedBug.project_key) || store.selectedBug.project || store.selectedBug.project_key }}
            </el-button>
            <span v-else class="bug-detail__field-value">{{ store.selectedBug.project || '-' }}</span>
          </div>
          <div class="bug-detail__field" v-if="store.selectedBug.issue_key">
            <span class="bug-detail__field-label">Issue</span>
            <el-button link type="warning" class="bug-detail__field-value" @click="goIssue(store.selectedBug.issue_key)">
              {{ issueTitle(store.selectedBug.issue_key) }}
            </el-button>
          </div>
          <div class="bug-detail__field" v-if="linkedCycle">
            <span class="bug-detail__field-label">Cycle</span>
            <el-button link type="primary" class="bug-detail__field-value" @click="router.push(`/cycle/${linkedCycle.key}`)">
              <el-icon><Calendar /></el-icon> {{ linkedCycle.name }}
            </el-button>
          </div>
          <div class="bug-detail__field" v-if="linkedRelease">
            <span class="bug-detail__field-label">Release</span>
            <el-button link type="success" class="bug-detail__field-value" @click="router.push(`/release/${linkedRelease.key}`)">
              <el-icon><Box /></el-icon> {{ linkedRelease.version }}
            </el-button>
          </div>
          <div class="bug-detail__field" v-if="linkedModule">
            <span class="bug-detail__field-label">Module</span>
            <el-button link type="primary" class="bug-detail__field-value" @click="router.push(`/module/${linkedModule.key}`)">
              <el-icon><Grid /></el-icon> {{ linkedModule.name }}
            </el-button>
          </div>
          <div class="bug-detail__field">
            <span class="bug-detail__field-label">Module</span>
            <span class="bug-detail__field-value">{{ store.selectedBug.module || '-' }}</span>
          </div>
          <div class="bug-detail__field">
            <span class="bug-detail__field-label">Assignee</span>
            <span class="bug-detail__field-value">{{ store.selectedBug.assignee || '-' }}</span>
          </div>
          <div class="bug-detail__field">
            <span class="bug-detail__field-label">Reporter</span>
            <span class="bug-detail__field-value">{{ store.selectedBug.reporter || '-' }}</span>
          </div>
          <div class="bug-detail__field">
            <span class="bug-detail__field-label">Frequency</span>
            <span class="bug-detail__field-value">{{ store.selectedBug.frequency }}</span>
          </div>
          <div class="bug-detail__field">
            <span class="bug-detail__field-label">Environment</span>
            <span class="bug-detail__field-value">{{ store.selectedBug.environment || '-' }}</span>
          </div>
          <div class="bug-detail__field">
            <span class="bug-detail__field-label">Affected Version</span>
            <span class="bug-detail__field-value">{{ store.selectedBug.affectedVersion || '-' }}</span>
          </div>
          <div class="bug-detail__field">
            <span class="bug-detail__field-label">Fixed Version</span>
            <span class="bug-detail__field-value">{{ store.selectedBug.fixedVersion || '-' }}</span>
          </div>
          <div class="bug-detail__field" v-if="store.selectedBug.iteration">
            <span class="bug-detail__field-label">Iteration</span>
            <span class="bug-detail__field-value">{{ store.selectedBug.iteration }}</span>
          </div>
          <div class="bug-detail__field">
            <span class="bug-detail__field-label">Created</span>
            <span class="bug-detail__field-value">{{ formatDate(store.selectedBug.createdAt) }}</span>
          </div>
          <div class="bug-detail__field">
            <span class="bug-detail__field-label">Updated</span>
            <span class="bug-detail__field-value">{{ formatDate(store.selectedBug.updatedAt) }}</span>
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
          <div v-if="linkedIssue || linkedCycle || linkedRelease || linkedModule" class="bug-detail__props" style="margin-top: 12px">
            <div class="bug-detail__field">
              <span class="bug-detail__field-label">Linked Entities</span>
            </div>
            <div v-if="linkedIssue" class="bug-detail__field">
              <div class="bug-detail__link-row">
                <el-icon><WarningFilled /></el-icon>
                <el-button link type="warning" class="bug-detail__field-value" @click="goIssue(linkedIssue.key)">
                  {{ linkedIssue.title }}
                </el-button>
                <el-tag :type="linkedIssue.status === 'done' ? 'success' : 'info'" size="small">{{ linkedIssue.status }}</el-tag>
              </div>
            </div>
            <div v-if="linkedCycle" class="bug-detail__field">
              <div class="bug-detail__link-row">
                <el-icon><Calendar /></el-icon>
                <el-button link type="primary" class="bug-detail__field-value" @click="router.push(`/cycle/${linkedCycle.key}`)">
                  {{ linkedCycle.name }}
                </el-button>
                <el-tag :type="linkedCycle.status === 'active' ? 'primary' : 'info'" size="small">{{ linkedCycle.status }}</el-tag>
              </div>
            </div>
            <div v-if="linkedRelease" class="bug-detail__field">
              <div class="bug-detail__link-row">
                <el-icon><Box /></el-icon>
                <el-button link type="success" class="bug-detail__field-value" @click="router.push(`/release/${linkedRelease.key}`)">
                  {{ linkedRelease.version }}
                </el-button>
                <el-tag :type="linkedRelease.status === 'released' ? 'success' : 'info'" size="small">{{ linkedRelease.status }}</el-tag>
              </div>
            </div>
            <div v-if="linkedModule" class="bug-detail__field">
              <div class="bug-detail__link-row">
                <el-icon><Grid /></el-icon>
                <el-button link type="primary" class="bug-detail__field-value" @click="router.push(`/module/${linkedModule.key}`)">
                  {{ linkedModule.name }}
                </el-button>
              </div>
            </div>
          </div>
        </div>

        <div class="bug-detail__main">
          <div class="bug-detail__section">
            <h3>Description</h3>
            <div v-if="store.selectedBugContent?.description" class="bug-detail__text">
              {{ store.selectedBugContent.description }}
            </div>
            <el-empty v-else description="No description" :image-size="40" />
          </div>

          <div class="bug-detail__section">
            <h3>Steps to Reproduce</h3>
            <ol v-if="store.selectedBugContent?.stepsToReproduce.length" class="bug-detail__steps">
              <li v-for="(s, i) in store.selectedBugContent.stepsToReproduce" :key="i">{{ s }}</li>
            </ol>
            <el-empty v-else description="No steps recorded" :image-size="40" />
          </div>

          <div class="bug-detail__section">
            <h3>Expected Result</h3>
            <div v-if="store.selectedBugContent?.expectedResult" class="bug-detail__text">
              {{ store.selectedBugContent.expectedResult }}
            </div>
            <el-empty v-else description="Not specified" :image-size="40" />
          </div>

          <div class="bug-detail__section">
            <h3>Actual Result</h3>
            <div v-if="store.selectedBugContent?.actualResult" class="bug-detail__text">
              {{ store.selectedBugContent.actualResult }}
            </div>
            <el-empty v-else description="Not specified" :image-size="40" />
          </div>

          <div class="bug-detail__section" v-if="store.selectedBugContent?.causeProblem">
            <h3>Root Cause</h3>
            <div class="bug-detail__text">{{ store.selectedBugContent.causeProblem }}</div>
          </div>

          <div class="bug-detail__section" v-if="store.selectedBugContent?.solution">
            <h3>Solution</h3>
            <div class="bug-detail__text">{{ store.selectedBugContent.solution }}</div>
          </div>
        </div>
      </div>
    </template>

    <div v-else-if="!store.detailLoading" class="bug-detail__not-found">
      <el-result icon="error" title="Bug not found" sub-title="This bug doesn't exist or was deleted.">
        <template #extra>
          <el-button type="primary" @click="goBack">Back to Bugs</el-button>
        </template>
      </el-result>
    </div>
  </div>
</template>

<script setup lang="ts" name="bugDetail">
import { computed, onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { ArrowLeft, Edit, Delete, Link, WarningFilled, Calendar, Box, Grid } from "@element-plus/icons-vue";
import { EntityBreadcrumb } from "@/components";
import { useBugStore } from "@/stores/modules/bug";
import { useProjectStore } from "@/stores/modules/project";
import { useIssueStore } from "@/stores/modules/issue";
import type { BugSeverity, BugPriority, BugStatus } from "@/api/modules/bug";
import { getIssueList } from "@/api/modules/issueService";
import { getCycleList } from "@/api/modules/cycleService";
import { getReleaseList } from "@/api/modules/releaseService";
import { getModuleList } from "@/api/modules/moduleService";
import type { Issue } from "@/api/modules/issueService";
import type { Cycle } from "@/api/modules/cycleService";
import type { Release } from "@/api/modules/releaseService";
import type { Module } from "@/api/modules/moduleService";

const route = useRoute();
const router = useRouter();
const store = useBugStore();
const projectStore = useProjectStore();
const issueStore = useIssueStore();

const key = route.params.key as string;

const projects = computed(() => projectStore.projects);
const issues = computed(() => issueStore.issues);

const linkedIssue = ref<Issue | null>(null);
const linkedCycle = ref<Cycle | null>(null);
const linkedRelease = ref<Release | null>(null);
const linkedModule = ref<Module | null>(null);

async function loadLinkedEntities() {
  const bug = store.selectedBug;
  if (!bug?.issue_key) return;
  try {
    const [issueRes, cycleRes, releaseRes, moduleRes] = await Promise.all([
      getIssueList({ pageSize: 500 }),
      getCycleList({ pageSize: 200 }),
      getReleaseList({ pageSize: 200 }),
      getModuleList({ pageSize: 500 })
    ]);
    const allIssues = (issueRes.data?.list as Issue[]) ?? [];
    const allCycles = (cycleRes.data?.list as Cycle[]) ?? [];
    const allReleases = (releaseRes.data?.list as Release[]) ?? [];
    const allModules = (moduleRes.data?.list as Module[]) ?? [];

    const issue = allIssues.find(i => i.key === bug.issue_key);
    if (issue) {
      linkedIssue.value = issue;
      if (issue.cycle_key) {
        linkedCycle.value = allCycles.find(c => c.key === issue.cycle_key) || null;
      }
      if (issue.release_key) {
        linkedRelease.value = allReleases.find(r => r.key === issue.release_key) || null;
      }
      // Find module that contains this issue via module.issue_keys
      linkedModule.value = allModules.find(m => (m.issue_keys || []).includes(issue.key)) || null;
    }
  } catch { /* best-effort */ }
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

function formatDate(ts: number): string {
  return new Date(ts).toLocaleString("zh-CN");
}

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
  padding: 24px;
  height: calc(100vh - 95px);
  overflow: auto;
  background: var(--el-bg-color-page);

  &__head {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 24px;
  }

  &__head-left {
    display: flex;
    align-items: flex-start;
    gap: 16px;
  }

  &__title {
    margin: 0 0 8px;
    font-size: 22px;
    font-weight: 600;
  }

  &__meta {
    display: flex;
    gap: 10px;
    align-items: center;
    flex-wrap: wrap;

    code {
      font-size: 12px;
      color: var(--el-text-color-secondary);
      background: var(--el-fill-color-light);
      padding: 1px 8px;
      border-radius: 4px;
    }
  }

  &__head-actions {
    display: flex;
    gap: 6px;
    flex-shrink: 0;
  }

  &__body {
    display: flex;
    gap: 24px;
    align-items: flex-start;
  }

  &__sidebar {
    width: 260px;
    flex-shrink: 0;
    position: sticky;
    top: 24px;
    align-self: flex-start;
  }

  &__props {
    background: var(--el-fill-color-lighter);
    border-radius: 8px;
    padding: 16px;
  }

  &__field {
    padding: 8px 0;
    font-size: 13px;
    & + & { border-top: 1px solid var(--el-border-color-lighter); }
  }

  &__field-label {
    display: block;
    color: var(--el-text-color-secondary);
    font-weight: 500;
    margin-bottom: 4px;
    font-size: 12px;
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
    margin: 0;
    padding-left: 20px;

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
    align-items: center;
    gap: 6px;
    font-size: 13px;
  }
}
</style>