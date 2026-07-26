<script setup lang="ts" name="storyTable">
import { computed } from "vue";
import type { StoryDocument } from "@/api/modules/story";
import StoryStatusBadge from "./StoryStatusBadge.vue";

const props = defineProps<{
  stories: StoryDocument[];
}>();

const emit = defineEmits<{
  (e: "rowClick", story: StoryDocument): void;
  (e: "edit", story: StoryDocument): void;
  (e: "delete", story: StoryDocument): void;
}>();

const priorityColors: Record<string, string> = {
  p0: "danger",
  p1: "warning",
  p2: "info",
  p3: ""
};

// ── Utilities ──
function fmtDate(ts: number | null): string {
  if (!ts) return "";
  const d = new Date(ts);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function scenarioCount(story: StoryDocument): number {
  return story.scenarios?.length ?? 0;
}

function scenarioDone(story: StoryDocument): number {
  return story.scenarios?.filter(sc => sc.status === "operations").length ?? 0;
}

function isOverdue(dueDate: number | null): boolean {
  if (!dueDate) return false;
  return dueDate < Date.now();
}

// ── Footer summary ──
const statusOrder = ["planning", "design", "develop", "testing", "operations", "archived"] as const;

const statusSummary = computed(() => {
  const counts: Record<string, number> = {};
  for (const s of props.stories) {
    const key = s.status || "unknown";
    counts[key] = (counts[key] || 0) + 1;
  }
  return statusOrder.filter(st => counts[st]).map(st => ({ status: st, count: counts[st] }));
});
</script>

<template>
  <div class="st-root">
    <el-table :data="stories" stripe @row-click="(r: any) => emit('rowClick', r as StoryDocument)" style="cursor: pointer">
      <el-table-column :label="$t('story.name')" min-width="180">
        <template #default="{ row }">
          <span style="font-weight: 600">{{ row.name }}</span>
        </template>
      </el-table-column>

      <el-table-column :label="$t('story.project')" width="90">
        <template #default="{ row }">
          <el-tag v-if="row.project" size="small" type="info">
            {{ row.project }}
          </el-tag>
        </template>
      </el-table-column>

      <el-table-column :label="$t('story.status')" width="110">
        <template #default="{ row }">
          <StoryStatusBadge :status="row.status" />
        </template>
      </el-table-column>

      <el-table-column :label="$t('story.priority')" width="90">
        <template #default="{ row }">
          <el-tag v-if="row.priority" :type="priorityColors[row.priority] as any" size="small">
            {{ row.priority.toUpperCase() }}
          </el-tag>
        </template>
      </el-table-column>

      <el-table-column :label="$t('story.scenarios')" width="90" align="center">
        <template #default="{ row }">
          {{ scenarioDone(row as StoryDocument) }}/{{ scenarioCount(row as StoryDocument) }}
        </template>
      </el-table-column>

      <el-table-column :label="$t('story.dueDate')" width="100">
        <template #default="{ row }">
          <span
            v-if="row.dueDate"
            :style="{
              color: isOverdue(row.dueDate) ? 'var(--el-color-danger)' : 'inherit',
              fontWeight: isOverdue(row.dueDate) ? 600 : 'normal'
            }"
          >
            {{ fmtDate(row.dueDate) }}
          </span>
        </template>
      </el-table-column>

      <el-table-column :label="$t('story.assignee')" width="90">
        <template #default="{ row }">
          <span>{{ row.assignee }}</span>
        </template>
      </el-table-column>

      <el-table-column :label="$t('story.description')" min-width="140" show-overflow-tooltip>
        <template #default="{ row }">
          {{ row.description }}
        </template>
      </el-table-column>

      <el-table-column :label="$t('story.updated')" width="110">
        <template #default="{ row }">
          {{ fmtDate(row.updatedAt) }}
        </template>
      </el-table-column>

      <el-table-column :label="$t('story.actions')" width="140" fixed="right">
        <template #default="{ row }">
          <el-button size="small" text type="primary" @click.stop="emit('edit', row as StoryDocument)">
            {{ $t("story.edit") }}
          </el-button>
          <el-button size="small" text type="danger" @click.stop="emit('delete', row as StoryDocument)">
            {{ $t("story.del") }}
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- Footer summary row -->
    <div v-if="statusSummary.length" class="st-footer">
      <span class="st-footer-label">{{ $t("story.storiesCount", { count: stories.length }) }}</span>
      <span v-for="s in statusSummary" :key="s.status" class="st-footer-badge">
        <StoryStatusBadge :status="s.status" />
        <span class="st-footer-count">{{ s.count }}</span>
      </span>
    </div>
  </div>
</template>

<style scoped lang="scss">
.st-root {
  display: flex;
  flex-direction: column;
}

.st-footer {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 10px;
  padding: 8px 12px;
  background: var(--el-fill-color-lighter);
  border-radius: 6px;
  font-size: 13px;
  flex-wrap: wrap;
}

.st-footer-label {
  color: var(--el-text-color-secondary);
  margin-right: 6px;
}

.st-footer-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.st-footer-count {
  font-weight: 600;
  font-size: 12px;
  color: var(--el-text-color-regular);
}
</style>
