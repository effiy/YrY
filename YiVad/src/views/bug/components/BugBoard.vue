<template>
  <div class="bug-board">
    <div
      v-for="col in columns"
      :key="col.status"
      class="bug-board__col"
      :class="{ 'bug-board__col--empty': col.bugs.length === 0 }"
    >
      <div class="bug-board__col-head" :style="{ borderTopColor: col.color }">
        <span class="bug-board__col-dot" :style="{ background: col.color }" />
        <span class="bug-board__col-label">{{ col.label }}</span>
        <span class="bug-board__col-count" :style="{ background: col.color + '20', color: col.color }">
          {{ col.bugs.length }}
        </span>
      </div>
      <div class="bug-board__col-body">
        <TransitionGroup name="board-card" tag="div" class="bug-board__col-list">
          <div
            v-for="bug in col.bugs"
            :key="bug.key"
            class="bug-board__card"
            :style="{ borderLeftColor: severityColor(bug.severity) }"
            @click="$emit('clickBug', bug.key)"
          >
          <div class="bug-board__card-top">
            <code class="bug-board__card-key">{{ bug.key }}</code>
            <el-tag :type="severityTagType(bug.severity)" size="small" effect="dark" round>
              {{ bug.severity }}
            </el-tag>
          </div>
          <h4 class="bug-board__card-title">{{ bug.title }}</h4>
          <div class="bug-board__card-meta">
            <el-tag :type="priorityTagType(bug.priority)" size="small" effect="plain">{{ bug.priority }}</el-tag>
            <span v-if="bug.assignee" class="bug-board__card-assignee">{{ bug.assignee }}</span>
            <span v-if="bug.module" class="bug-board__card-module">{{ bug.module }}</span>
          </div>
          <div class="bug-board__card-foot">
            <span class="bug-board__card-date">{{ formatRelative(bug.updatedAt) }}</span>
            <el-dropdown
              trigger="click"
              @command="(cmd: string) => $emit('statusChange', bug.key, cmd)"
              @click.stop
            >
              <el-button size="small" text :icon="ArrowDown" class="bug-board__card-action" />
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item
                    v-for="s in transitions[col.status]"
                    :key="s.value"
                    :command="s.value"
                  >{{ s.label }}</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
        </div>
        </TransitionGroup>
        <div v-if="col.bugs.length === 0" class="bug-board__empty">
          <span class="bug-board__empty-icon">—</span>
          <span>No bugs</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts" name="BugBoard">
import { computed } from "vue";
import { ArrowDown } from "@element-plus/icons-vue";
import type { BugDocument } from "@/api/modules/bug";
import { severityTagType, priorityTagType, severityColor } from "@/hooks/useTagHelpers";

const props = defineProps<{
  bugs: BugDocument[];
}>();

defineEmits<{
  (e: "statusChange", bugKey: string, newStatus: string): void;
  (e: "clickBug", bugKey: string): void;
}>();

const STATUS_CONFIG: Record<string, { label: string; color: string; order: number }> = {
  open: { label: "Open", color: "#409eff", order: 0 },
  in_progress: { label: "In Progress", color: "#e6a23c", order: 1 },
  resolved: { label: "Resolved", color: "#67c23a", order: 2 },
  rejected: { label: "Rejected", color: "#f56c6c", order: 3 },
  reopened: { label: "Reopened", color: "#e6a23c", order: 4 },
  closed: { label: "Closed", color: "#909399", order: 5 }
};

const columns = computed(() => {
  const grouped: Record<string, BugDocument[]> = {};
  for (const s of Object.keys(STATUS_CONFIG)) grouped[s] = [];
  for (const b of props.bugs) {
    const s = b.status || "open";
    if (!grouped[s]) grouped[s] = [];
    grouped[s].push(b);
  }
  return Object.entries(STATUS_CONFIG)
    .sort((a, b) => a[1].order - b[1].order)
    .map(([status, config]) => ({
      status,
      label: config.label,
      color: config.color,
      bugs: grouped[status] || []
    }));
});

const transitions: Record<string, Array<{ value: string; label: string }>> = {
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

function formatRelative(ts: number | null | undefined): string {
  if (!ts) return "—";
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}
</script>

<style scoped lang="scss">
.bug-board {
  display: flex;
  gap: 10px;
  overflow-x: auto;
  padding-bottom: 8px;
  min-height: 420px;
}

.bug-board__col {
  flex: 1 1 0;
  min-width: 220px;
  display: flex;
  flex-direction: column;
  background: var(--el-fill-color-lighter);
  border-radius: 10px;
  overflow: hidden;
  border: 1px solid var(--el-border-color-lighter);
  transition: opacity 0.2s;

  &--empty {
    opacity: 0.55;
  }
}

.bug-board__col-head {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 14px;
  background: var(--el-bg-color);
  border-top: 3px solid transparent;
  border-bottom: 1px solid var(--el-border-color-lighter);
}

.bug-board__col-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
  box-shadow: 0 0 0 3px currentColor;
  opacity: 0.3;
}

.bug-board__col-label {
  font-size: 13px;
  font-weight: 700;
  color: var(--el-text-color-primary);
  flex: 1;
}

.bug-board__col-count {
  font-size: 11px;
  font-weight: 700;
  padding: 2px 9px;
  border-radius: 10px;
  min-width: 22px;
  text-align: center;
}

.bug-board__col-body {
  flex: 1;
  padding: 8px 10px;
  overflow-y: auto;
  max-height: calc(100vh - 360px);
}

.bug-board__col-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

// ── Card transitions ──
.board-card-enter-active,
.board-card-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
.board-card-enter-from {
  opacity: 0;
  transform: translateY(-12px) scale(0.95);
}
.board-card-leave-to {
  opacity: 0;
  transform: translateX(20px) scale(0.95);
}
.board-card-move {
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.bug-board__card {
  padding: 12px;
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color-lighter);
  border-left: 3px solid var(--el-color-primary);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.15s ease;

  &:hover {
    box-shadow: 0 3px 12px rgba(0, 0, 0, 0.08);
    transform: translateY(-1px);
  }
}

.bug-board__card-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
}

.bug-board__card-key {
  font-size: 10px;
  color: var(--el-text-color-placeholder);
  background: var(--el-fill-color-light);
  padding: 1px 6px;
  border-radius: 4px;
  font-family: "SF Mono", "Fira Code", monospace;
}

.bug-board__card-title {
  margin: 0 0 8px;
  font-size: 13px;
  font-weight: 600;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  color: var(--el-text-color-primary);
}

.bug-board__card-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  align-items: center;
  margin-bottom: 8px;
}

.bug-board__card-assignee {
  font-size: 11.5px;
  font-weight: 500;
  color: var(--el-text-color-secondary);
}

.bug-board__card-module {
  font-size: 11px;
  color: var(--el-text-color-placeholder);
  padding: 1px 6px;
  background: var(--el-fill-color-light);
  border-radius: 3px;
}

.bug-board__card-foot {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.bug-board__card-date {
  font-size: 11px;
  color: var(--el-text-color-placeholder);
}

.bug-board__card-action {
  opacity: 0.5;
  transition: opacity 0.15s;

  &:hover {
    opacity: 1;
  }
}

.bug-board__empty {
  padding: 32px 16px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  color: var(--el-text-color-placeholder);
  font-size: 12px;
}

.bug-board__empty-icon {
  font-size: 28px;
  font-weight: 200;
  opacity: 0.3;
  line-height: 1;
}
</style>