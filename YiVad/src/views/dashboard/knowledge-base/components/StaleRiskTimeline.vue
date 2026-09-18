<script setup lang="ts">
import { ref, computed } from "vue";
import { WarningFilled } from "@element-plus/icons-vue";
import type { KnowledgeFileSummary } from "@/api/interface/yiAi";
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

const expandedSet = ref<Set<string>>(new Set());
const expanded = {
  has: (label: string) => expandedSet.value.has(label),
  toggle: (label: string) => {
    const s = new Set(expandedSet.value);
    s.has(label) ? s.delete(label) : s.add(label);
    expandedSet.value = s;
  }
};
</script>

<template>
  <div class="stale-risk">
    <div
      v-for="b in buckets"
      :key="b.label"
      class="sr-bucket"
      :style="{
        borderColor: severityBorder[b.severity],
        background: severityBg[b.severity]
      }"
    >
      <div class="sr-header" @click="expanded.toggle(b.label)">
        <div class="sr-header-left">
          <span class="sr-dot" :style="{ background: severityColor[b.severity] }"></span>
          <span class="sr-label">{{ b.label }}</span>
          <span class="sr-count" :style="{ color: severityColor[b.severity] }">{{ b.count }} files</span>
        </div>
        <div class="sr-header-right">
          <el-button v-if="b.count > 0" size="small" text type="primary" @click.stop="emit('filterFiles', b.files)">
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
            {{ daysUntilDue(f) !== null ? (daysUntilDue(f)! <= 0 ? "Overdue" : Math.ceil(daysUntilDue(f)!) + "d left") : "" }}
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
  overflow: hidden;
  border: 1px solid;
  border-radius: 8px;
  transition: all 0.15s;
}
.sr-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 6px 10px;
  cursor: pointer;
  user-select: none;
  &:hover {
    filter: brightness(0.98);
  }
}
.sr-header-left {
  display: flex;
  gap: 6px;
  align-items: center;
}
.sr-dot {
  flex-shrink: 0;
  width: 8px;
  height: 8px;
  border-radius: 50%;
}
.sr-label {
  font-size: 12px;
  font-weight: 600;
  color: #303133;
}
.sr-count {
  font-family: DIN;
  font-size: 11px;
  font-weight: 700;
}
.sr-header-right {
  display: flex;
  gap: 4px;
  align-items: center;
}
.sr-expand {
  font-size: 10px;
  color: #909399;
}
.sr-body {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 4px 10px 6px;
  border-top: 1px solid rgb(0 0 0 / 6%);
}
.sr-empty {
  padding: 8px 10px;
}
.sr-file {
  display: flex;
  gap: 6px;
  align-items: center;
  padding: 2px 4px;
  font-size: 11px;
  border-radius: 4px;
  &:hover {
    background: rgb(0 0 0 / 3%);
  }
}
.sr-file-name {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  color: #303133;
  white-space: nowrap;
}
.sr-file-cat {
  flex-shrink: 0;
  font-size: 10px;
  color: #909399;
}
.sr-file-review {
  flex-shrink: 0;
  font-size: 10px;
  color: #606266;
}
.sr-file-days {
  flex-shrink: 0;
  font-size: 10px;
  font-weight: 600;
}
.sr-file-updated {
  flex-shrink: 0;
  font-size: 10px;
  color: #c0c4cc;
}
.sr-stale-icon {
  flex-shrink: 0;
  color: #e6a23c;
}
.sr-more {
  padding: 2px 0;
  font-size: 10px;
  color: #909399;
  text-align: center;
}
.text-muted {
  font-size: 11px;
  color: #c0c4cc;
}
</style>
