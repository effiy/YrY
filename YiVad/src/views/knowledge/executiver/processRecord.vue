<template>
  <div class="process">
    <div class="process__head">
      <h1 class="process__title">流程记录</h1>
      <el-tag size="small" type="primary">{{ loopGroups.length }} 条闭环 · {{ recordCount }} 条记录</el-tag>
      <div class="process__actions">
        <el-button size="small" :icon="Refresh" :loading="loading" @click="loadLoopRecords">刷新</el-button>
      </div>
    </div>

    <el-empty v-if="!loading && !loopGroups.length" description="暂无流程记录（扫描 loop/ 目录无 loop-record 类型文件）" />

    <div v-else class="process__grid">
      <el-card v-for="group in loopGroups" :key="group.loopId" class="process__card" shadow="hover">
        <template #header>
          <div class="process__card-head">
            <span class="process__card-title">{{ group.loopId }}</span>
            <el-tag size="small" :type="groupStatusType(group)">{{ groupStatusText(group) }}</el-tag>
          </div>
        </template>

        <div class="process__stage-list">
          <div
            v-for="rec in group.records"
            :key="rec.path"
            class="process__stage"
            :class="{ 'is-missing': !rec }"
            @click="rec && openRecord(rec)"
          >
            <template v-if="rec">
              <span class="process__stage-icon">{{ stageIcon(rec.stage) }}</span>
              <span class="process__stage-label">{{ stageLabel(rec.stage) }}</span>
              <span class="process__stage-title">{{ rec.title }}</span>
              <el-tag size="small" :type="statusType(rec.status)">{{ rec.status }}</el-tag>
            </template>
            <template v-else>
              <span class="process__stage-icon">·</span>
              <span class="process__stage-label process__stage-label--muted">—</span>
            </template>
          </div>
        </div>
      </el-card>
    </div>

    <KnowledgePreviewDialog ref="previewDlg" />
  </div>
</template>

<script setup lang="ts" name="processRecord">
import { ref, computed, onMounted } from "vue";
import { Refresh } from "@element-plus/icons-vue";
import { scanKnowledge } from "@/api/modules/knowledgeService";
import type { KnowledgeFileEntry } from "@/api/interface/yiweb";
import KnowledgePreviewDialog from "@/views/aiChat/components/KnowledgePreviewDialog.vue";

const previewDlg = ref<InstanceType<typeof KnowledgePreviewDialog> | null>(null);
const loading = ref(false);

/** 闭环阶段顺序与展示元信息（与 loop-record 的 stage 枚举一致）。 */
const STAGES = [
  { key: "requirement-review", icon: "📋", label: "需求评审" },
  { key: "technical-review", icon: "🧭", label: "技术评审" },
  { key: "build-debug", icon: "⚡", label: "构建调试" },
  { key: "test-report", icon: "🧪", label: "测试报告" },
  { key: "launch", icon: "🚀", label: "上线" }
] as const;

const STAGE_ORDER: Record<string, number> = Object.fromEntries(
  STAGES.map((s, i) => [s.key, i])
);

interface LoopRecord {
  path: string;
  loopId: string;
  stage: string;
  title: string;
  role: string;
  goalId: string;
  status: string;
}

interface LoopGroup {
  loopId: string;
  records: LoopRecord[];
}

const loopGroups = ref<LoopGroup[]>([]);

const recordCount = computed(() => loopGroups.value.reduce((n, g) => n + g.records.length, 0));

function str(v: unknown): string {
  return typeof v === "string" ? v : "";
}

function recordFromFile(f: KnowledgeFileEntry): LoopRecord | null {
  const m = f.meta ?? {};
  if (m.type !== "loop-record") return null;
  return {
    path: f.path,
    loopId: str(m.loopId) || f.path.split("/").find(seg => /^loop-/.test(seg)) || "loop",
    stage: str(m.stage),
    title: str(m.title) || f.name.replace(/\.md$/, ""),
    role: str(m.role),
    goalId: str(m.goalId),
    status: str(m.status) || "in-progress"
  };
}

/** 扫描 loop 记录并按 loopId 聚合，组内按阶段顺序排序。 */
async function loadLoopRecords() {
  loading.value = true;
  try {
    const res = await scanKnowledge("okr");
    const files = res.categories?.flatMap(c => c.files) ?? [];
    const records = files
      .map(recordFromFile)
      .filter((r): r is LoopRecord => r !== null && r.stage in STAGE_ORDER);
    const byLoop = new Map<string, LoopRecord[]>();
    for (const r of records) {
      if (!byLoop.has(r.loopId)) byLoop.set(r.loopId, []);
      byLoop.get(r.loopId)!.push(r);
    }
    loopGroups.value = [...byLoop.entries()]
      .map(([loopId, recs]) => ({
        loopId,
        records: recs.sort((a, b) => (STAGE_ORDER[a.stage] ?? 99) - (STAGE_ORDER[b.stage] ?? 99))
      }))
      .sort((a, b) => a.loopId.localeCompare(b.loopId));
  } catch {
    loopGroups.value = [];
  } finally {
    loading.value = false;
  }
}

function stageIcon(stage: string): string {
  return STAGES.find(s => s.key === stage)?.icon ?? "·";
}
function stageLabel(stage: string): string {
  return STAGES.find(s => s.key === stage)?.label ?? stage;
}
function statusType(status: string): "success" | "warning" | "info" | "danger" {
  if (status === "done") return "success";
  if (status === "in-progress") return "warning";
  if (status === "failed") return "danger";
  return "info";
}
function groupStatusText(group: LoopGroup): string {
  const done = group.records.filter(r => r.status === "done").length;
  return `${done}/${group.records.length} 完成`;
}
function groupStatusType(group: LoopGroup): "success" | "warning" | "info" {
  const done = group.records.filter(r => r.status === "done").length;
  if (done === group.records.length) return "success";
  if (done > 0) return "warning";
  return "info";
}
function openRecord(rec: LoopRecord) {
  previewDlg.value?.open(rec.path);
}

onMounted(loadLoopRecords);
</script>

<style scoped lang="scss">
.process {
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  min-height: 100%;
  padding: 24px;
  background: var(--el-bg-color-page);
}
.process__head {
  display: flex;
  gap: 10px;
  align-items: center;
  margin-bottom: 16px;
}
.process__title {
  margin: 0;
  font-size: 22px;
  font-weight: 700;
}
.process__actions {
  display: flex;
  gap: 6px;
  align-items: center;
  margin-left: auto;
}
.process__grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
  gap: 12px;
}
.process__card-head {
  display: flex;
  gap: 8px;
  align-items: center;
  justify-content: space-between;
}
.process__card-title {
  font-size: 14px;
  font-weight: 700;
}
.process__stage-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.process__stage {
  display: flex;
  gap: 8px;
  align-items: center;
  padding: 8px 10px;
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 8px;
  cursor: pointer;
  transition: box-shadow 0.2s, border-color 0.2s;
  &:hover {
    border-color: var(--el-color-primary-light-5);
    box-shadow: 0 2px 8px rgb(0 0 0 / 6%);
  }
}
.process__stage-icon {
  font-size: 15px;
  flex-shrink: 0;
}
.process__stage-label {
  flex-shrink: 0;
  min-width: 52px;
  font-size: 12px;
  font-weight: 600;
  color: var(--el-text-color-secondary);
}
.process__stage-label--muted {
  color: var(--el-text-color-placeholder);
}
.process__stage-title {
  flex: 1;
  min-width: 0;
  font-size: 13px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
