<template>
  <div class="bug-detail" v-loading="store.detailLoading">
    <template v-if="store.selectedBug">
      <div class="bug-detail__head">
        <div class="bug-detail__head-left">
          <el-button text :icon="ArrowLeft" @click="goBack">Bugs</el-button>
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
          <el-button :icon="Edit" @click="store.openEditDialog(store.selectedBug, store.selectedBugContent)">Edit</el-button>
          <el-button :icon="Delete" type="danger" plain @click="handleDelete">Delete</el-button>
        </div>
      </div>

      <div class="bug-detail__body">
        <div class="bug-detail__sidebar">
          <div class="bug-detail__field">
            <span class="bug-detail__field-label">Project</span>
            <span class="bug-detail__field-value">{{ store.selectedBug.project || '-' }}</span>
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

    <el-empty v-else-if="!store.detailLoading" description="Bug not found" :image-size="80" />
  </div>
</template>

<script setup lang="ts" name="bugDetail">
import { onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { ArrowLeft, Edit, Delete } from "@element-plus/icons-vue";
import { useBugStore } from "@/stores/modules/bug";
import type { BugSeverity, BugPriority, BugStatus } from "@/api/modules/bug";

const route = useRoute();
const router = useRouter();
const store = useBugStore();

const key = route.params.key as string;

onMounted(() => {
  store.loadDetail(key);
});

function goBack() {
  router.push("/bug");
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
  padding: 20px;
  height: 100%;
  overflow-y: auto;

  &__head {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    margin-bottom: 24px;
    flex-wrap: wrap;
    gap: 12px;
  }

  &__head-left {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  &__title {
    font-size: 22px;
    font-weight: 600;
    margin: 0;
    color: var(--el-text-color-primary);
  }

  &__meta {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;

    code {
      font-size: 12px;
      color: var(--el-text-color-secondary);
      background: var(--el-fill-color-light);
      padding: 1px 6px;
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
    gap: 32px;
  }

  &__sidebar {
    width: 220px;
    flex-shrink: 0;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  &__field {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  &__field-label {
    font-size: 12px;
    color: var(--el-text-color-secondary);
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  &__field-value {
    font-size: 14px;
    color: var(--el-text-color-primary);
  }

  &__main {
    flex: 1;
    min-width: 0;
  }

  &__section {
    margin-bottom: 24px;

    h3 {
      font-size: 16px;
      font-weight: 600;
      margin: 0 0 8px;
      color: var(--el-text-color-primary);
      padding-bottom: 6px;
      border-bottom: 1px solid var(--el-border-color-light);
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
}
</style>