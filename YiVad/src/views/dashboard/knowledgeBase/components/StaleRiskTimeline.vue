<script setup lang="ts">
import { computed } from "vue";
import { WarningFilled } from "@element-plus/icons-vue";
import type { KnowledgeFileSummary } from "@/api/interface/yiweb";
import { daysUntilDue, formatRelativeTime, isStaleFile } from "../utils";

const props = defineProps<{
  buckets: {
    label: string;
    severity: "red" | "orange" | "yellow" | "blue";
    files: KnowledgeFileSummary[];
    count: number;
  }[];
}>();

const emit = defineEmits<{
  (e: "filterFiles", files: KnowledgeFileSummary[]): void;
}>();

const severityColor = { red: "#f56c6c", orange: "#e6a23c", yellow: "#fac858", blue: "#409eff" };
const severityBg = { red: "#fef0f0", orange: "#fdf6ec", yellow: "#fef9e7", blue: "#ecf5ff" };
const severityBorder = { red: "#fbc4c4", orange: "#f5dab1", yellow: "#faecd8", blue: "#c6e2ff" };

const expanded = computed(() => {
  const s = new Set<string>();
  return {
    has: (label: string) => s.has(label),
    toggle: (label: string) => (s.has(label) ? s.delete(label) : s.add(label)),
  };
});
</script>

<template>
  <div class="stale-risk">
    <div
      v-for="b in buckets"
      :key="b.label"
      class="sr-bucket"
      :style="{
        borderColor: severityBorder[b.severity],
        background: severityBg[b.severity],
      }"
    >
      <div class="sr-header" @click="expanded.toggle(b.label)">
        <div class="sr-header-left">
          <span class="sr-dot" :style="{ background: severityColor[b.severity] }"></span>
          <span class="sr-label">{{ b.label }}</span>
          <span class="sr-count" :style="{ color: severityColor[b.severity] }">{{ b.count }} files</span>
        </div>
        <div class="sr-header-right">
          <el-button
            v-if="b.count > 0"
            size="small"
            text
            type="primary"
            @click.stop="emit('filterFiles', b.files)"
          >
            Show files
          </el-button>
          <span class="sr-expand">{{ expanded.has(b.label) ? "▲" : "▼" }}</span>
        </div>
      </div>
      <div class="sr-body" v-if="expanded.has(b.label) && b.files.length > 0">
        <div class="sr-file" v-for="f in b.files.slice(0, 15)" :key="f.path">
          <el-icon v-if="isStaleFile(f)" :size="10" class="sr-stale-icon"><WarningFilled /></el-icon>
          <span class="sr-file-name">{{ f.title || f.path.split("/").pop() }}</span>
          <span class="sr-file-cat">{{ f.category }}</span>
          <span class="sr-file-review">{{ f.review_cycle }}</span>
          <span class="sr-file-days" :style="{ color: severityColor[b.severity] }">
            {{ daysUntilDue(f) !== null ? (daysUntilDue(f)! <= 0 ? 'Overdue' : Math.ceil(daysUntilDue(f)!) + 'd left') : '' }}
          </span>
          <span class="sr-file-updated">{{ f.updated ? formatRelativeTime(f.updated) : "" }}</span>
        </div>
        <div v-if="b.files.length > 15" class="sr-more">+{{ b.files.length - 15 }} more files</div>
      </div>
      <div class="sr-body sr-empty" v-if="expanded.has(b.label) && b.files.length === 0">
        <span class="text-muted">No files in this bucket</span>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.stale-risk {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.sr-bucket {
  border: 1px solid;
  border-radius: 8px;
  overflow: hidden;
  transition: all 0.15s;
}
.sr-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 6px 10px;
  cursor: pointer;
  user-select: none;
  &:hover { filter: brightness(0.98); }
}
.sr-header-left {
  display: flex;
  align-items: center;
  gap: 6px;
}
.sr-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}
.sr-label {
  font-size: 12px;
  font-weight: 600;
  color: #303133;
}
.sr-count {
  font-size: 11px;
  font-weight: 700;
  font-family: DIN;
}
.sr-header-right {
  display: flex;
  align-items: center;
  gap: 4px;
}
.sr-expand {
  font-size: 10px;
  color: #909399;
}
.sr-body {
  border-top: 1px solid rgba(0, 0, 0, 0.06);
  padding: 4px 10px 6px;
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.sr-empty {
  padding: 8px 10px;
}
.sr-file {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  padding: 2px 4px;
  border-radius: 4px;
  &:hover { background: rgba(0, 0, 0, 0.03); }
}
.sr-file-name {
  color: #303133;
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.sr-file-cat {
  font-size: 10px;
  color: #909399;
  flex-shrink: 0;
}
.sr-file-review {
  font-size: 10px;
  color: #606266;
  flex-shrink: 0;
}
.sr-file-days {
  font-size: 10px;
  font-weight: 600;
  flex-shrink: 0;
}
.sr-file-updated {
  font-size: 10px;
  color: #c0c4cc;
  flex-shrink: 0;
}
.sr-stale-icon {
  color: #e6a23c;
  flex-shrink: 0;
}
.sr-more {
  text-align: center;
  font-size: 10px;
  color: #909399;
  padding: 2px 0;
}
.text-muted { color: #c0c4cc; font-size: 11px; }
</style>
