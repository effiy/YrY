<template>
  <div class="process">
    <!-- ═══ Sticky Stats Bar ═══ -->
    <div class="process__sticky-bar">
      <div class="process__sticky-top">
        <div class="process__sticky-left">
          <span class="process__sticky-icon">{{ stickyIcon }}</span>
          <div class="process__sticky-info">
            <h1 class="process__sticky-name">{{ stickyTitle }}</h1>
            <p class="process__sticky-desc">
              需求评审 · 技术评审 · 构建调试 · 测试报告 · 上线 — AI 从需求到上线全流程自闭环记录
            </p>
          </div>
        </div>
        <div class="process__sticky-right">
          <div class="process__stat-pill">
            <span class="process__stat-pill-value">{{ stats.totalLoops }}</span>
            <span class="process__stat-pill-label">Loops</span>
          </div>
          <div class="process__stat-pill">
            <span class="process__stat-pill-value">{{ stats.completed }}</span>
            <span class="process__stat-pill-label">Completed</span>
          </div>
          <div class="process__stat-pill process__stat-pill--accent">
            <span class="process__stat-pill-value">{{ stats.totalRecords }}</span>
            <span class="process__stat-pill-label">Records</span>
          </div>
        </div>
      </div>
    </div>

    <div class="process__body">
      <nav class="process__sidebar">
        <button
          class="process__sidebar-item"
          :class="{ 'is-active': statusTab === 'all' }"
          @click="statusTab = 'all'"
        >
          <span class="process__sidebar-icon">🔁</span>
          <span class="process__sidebar-label">全部闭环</span>
          <span class="process__sidebar-badge">{{ stats.totalLoops }}</span>
        </button>
        <button
          class="process__sidebar-item"
          :class="{ 'is-active': statusTab === 'completed' }"
          @click="statusTab = 'completed'"
        >
          <span class="process__sidebar-icon">✅</span>
          <span class="process__sidebar-label">已完成</span>
          <span class="process__sidebar-badge">{{ stats.completed }}</span>
        </button>
        <button
          class="process__sidebar-item"
          :class="{ 'is-active': statusTab === 'in-progress' }"
          @click="statusTab = 'in-progress'"
        >
          <span class="process__sidebar-icon">⚡</span>
          <span class="process__sidebar-label">进行中</span>
          <span class="process__sidebar-badge">{{ stats.inProgress }}</span>
        </button>
        <button
          class="process__sidebar-item"
          :class="{ 'is-active': statusTab === 'not-started' }"
          @click="statusTab = 'not-started'"
        >
          <span class="process__sidebar-icon">📋</span>
          <span class="process__sidebar-label">未开始</span>
          <span class="process__sidebar-badge">{{ stats.notStarted }}</span>
        </button>
      </nav>

      <div class="process__content">
        <div class="process__section">
          <div class="process__section-head">
            <h2 class="process__section-title">🔁 Process Records</h2>
            <span class="process__result-count">{{ filteredLoopGroups.length }} loops · {{ filteredRecordCount }} records</span>
            <span class="process__toolbar-right">
              <el-radio-group v-model="viewMode" size="small">
                <el-radio-button value="card">Card</el-radio-button>
                <el-radio-button value="list">List</el-radio-button>
                <el-radio-button value="table">Table</el-radio-button>
              </el-radio-group>
              <el-button size="small" :icon="Refresh" :loading="loading" @click="loadLoopRecords">Refresh</el-button>
            </span>
          </div>

          <div class="process__section-body">
            <!-- ═══ Loop filter banner ═══ -->
            <div v-if="filterLoopId" class="process__filter-banner">
              <span>Filtered: <strong>{{ filterLoopId }}</strong></span>
              <el-button size="small" text @click="clearLoopFilter">Clear</el-button>
            </div>

            <div v-if="filterGoalId" class="process__filter-banner">
              <span>Filtered goal: <strong>{{ filterGoalId }}</strong></span>
              <el-button size="small" text @click="clearGoalFilter">Clear</el-button>
            </div>

            <!-- ═══ Empty ═══ -->
            <div v-if="!loading && !filteredLoopGroups.length" class="process__empty">
              <span class="process__empty-icon">🔁</span>
              <p class="process__empty-title">No process records yet</p>
              <p class="process__empty-hint">
                Loop records are generated when AI completes a full lifecycle — from requirement review through launch.
                Check the OKR Dashboard for active tasks that may produce loop records.
              </p>
            </div>

            <!-- ═══ Card View ═══ -->
            <div v-else-if="viewMode === 'card'" class="process__grid">
              <el-card v-for="group in filteredLoopGroups" :key="group.loopId" class="process__card" :class="{ 'is-highlighted': group.loopId === filterLoopId }" shadow="hover">
                <template #header>
                  <div class="process__card-head">
                    <span class="process__card-loop" :title="group.loopId">{{ group.title }}</span>
                    <el-tag size="small" :type="groupStatusType(group)">{{ groupStatusText(group) }}</el-tag>
                  </div>
                </template>

                <div class="process__card-summary" v-if="group.summary">
                  <span class="process__card-summary-title">{{ group.summary.title }}</span>
                </div>

                <el-progress
                  :percentage="groupProgress(group)"
                  :status="groupProgress(group) >= 100 ? 'success' : undefined"
                  :stroke-width="6"
                />

                <div class="process__stage-list">
                  <div
                    v-for="stageKey in STAGE_KEYS"
                    :key="stageKey"
                    class="process__stage"
                    :class="{ 'is-filled': group.stageMap[stageKey], 'is-missing': !group.stageMap[stageKey] }"
                    @click="group.stageMap[stageKey] && openRecord(group.stageMap[stageKey]!.path)"
                  >
                    <template v-if="group.stageMap[stageKey]">
                      <span class="process__stage-icon">{{ stageIcon(stageKey) }}</span>
                      <span class="process__stage-label">{{ stageLabel(stageKey) }}</span>
                      <span class="process__stage-title">{{ group.stageMap[stageKey]!.title }}</span>
                      <el-tag size="small" :type="statusType(group.stageMap[stageKey]!.status)">
                        {{ group.stageMap[stageKey]!.status }}
                      </el-tag>
                    </template>
                    <template v-else>
                      <span class="process__stage-icon">·</span>
                      <span class="process__stage-label process__stage-label--muted">{{ stageLabel(stageKey) }}</span>
                      <span class="process__stage-title process__stage-title--muted">—</span>
                    </template>
                  </div>
                </div>

                <div class="process__card-footer">
                  <span v-if="hasGoalRole(group.goalId)" class="process__goal-link" @click="goGoal(group.goalId)">
                    🎯 {{ group.goalId }} →
                  </span>
                  <span v-if="group.updated" class="process__card-date">
                    Updated {{ formatRelativeTime(group.updated) }}
                  </span>
                </div>
              </el-card>
            </div>

            <!-- ═══ List View ═══ -->
            <div v-else-if="viewMode === 'list'" class="process__list">
              <div v-for="group in filteredLoopGroups" :key="group.loopId" class="process__list-row">
                <div class="process__list-main">
                  <div class="process__list-top">
                    <span class="process__list-loop" :title="group.loopId">{{ group.title }}</span>
                    <el-tag size="small" :type="groupStatusType(group)">{{ groupStatusText(group) }}</el-tag>
                    <span v-if="group.summary" class="process__list-title">{{ group.summary.title }}</span>
                  </div>
                  <div class="process__list-mid">
                    <el-progress :percentage="groupProgress(group)" :status="groupProgress(group) >= 100 ? 'success' : undefined" :stroke-width="5" style="width:100px" />
                  </div>
                  <div class="process__list-stages">
                    <span
                      v-for="stageKey in STAGE_KEYS"
                      :key="stageKey"
                      class="process__list-stage"
                      :class="{
                        'is-filled': group.stageMap[stageKey],
                        'is-missing': !group.stageMap[stageKey]
                      }"
                      :title="group.stageMap[stageKey] ? stageLabel(stageKey) + ': ' + group.stageMap[stageKey]!.title : stageLabel(stageKey) + ': —'"
                      @click="group.stageMap[stageKey] && openRecord(group.stageMap[stageKey]!.path)"
                    >
                      <span class="process__list-stage-icon">{{ stageIcon(stageKey) }}</span>
                      <span class="process__list-stage-label">{{ stageLabel(stageKey) }}</span>
                      <el-tag v-if="group.stageMap[stageKey]" size="small" :type="statusType(group.stageMap[stageKey]!.status)">
                        {{ group.stageMap[stageKey]!.status }}
                      </el-tag>
                      <span v-else class="process__list-stage-empty">—</span>
                    </span>
                  </div>
                </div>
                <div class="process__list-meta">
                  <span v-if="hasGoalRole(group.goalId)" class="process__goal-link" @click="goGoal(group.goalId)">🎯 {{ group.goalId }}</span>
                  <span v-if="group.updated" class="process__list-date">{{ formatRelativeTime(group.updated) }}</span>
                  <el-button
                    v-if="group.summary"
                    size="small"
                    text
                    type="primary"
                    @click="openRecord(group.summary!.path)"
                  >Open</el-button>
                </div>
              </div>
            </div>

            <!-- ═══ Table View ═══ -->
            <el-table
              v-else
              :data="filteredLoopGroups"
              v-loading="loading"
              stripe
              border
              style="width: 100%"
              row-key="loopId"
              :empty-text="'No process records yet'"
              highlight-current-row
            >
              <el-table-column prop="loopId" label="Loop" width="130" sortable>
                <template #default="{ row }">
                  <span
                    class="process__table-loop"
                    :class="{ 'is-clickable': (row as LoopGroup).summary }"
                    :title="(row as LoopGroup).loopId"
                    @click="(row as LoopGroup).summary && openRecord((row as LoopGroup).summary!.path)"
                  >{{ (row as LoopGroup).title }}</span>
                </template>
              </el-table-column>
              <el-table-column label="Title / Goal" min-width="260" show-overflow-tooltip>
                <template #default="{ row }">
                  <div class="process__table-title-cell">
                    <span class="process__table-title">{{ (row as LoopGroup).summary?.title || (row as LoopGroup).title }}</span>
                    <span
                      v-if="hasGoalRole((row as LoopGroup).goalId)"
                      class="process__table-goal process__goal-link"
                      @click="goGoal((row as LoopGroup).goalId)"
                    >🎯 {{ (row as LoopGroup).goalId }}</span>
                    <span v-else-if="(row as LoopGroup).goalId" class="process__table-goal">{{ (row as LoopGroup).goalId }}</span>
                  </div>
                </template>
              </el-table-column>
              <el-table-column label="Status" width="110" align="center">
                <template #default="{ row }">
                  <el-tag size="small" :type="groupStatusType(row as LoopGroup)">{{ groupStatusText(row as LoopGroup) }}</el-tag>
                </template>
              </el-table-column>
              <el-table-column label="Stages" min-width="360">
                <template #default="{ row }">
                  <div class="process__table-stages">
                    <span
                      v-for="stageKey in STAGE_KEYS"
                      :key="stageKey"
                      class="process__table-stage"
                      :class="{
                        'is-filled': (row as LoopGroup).stageMap[stageKey],
                        'is-missing': !(row as LoopGroup).stageMap[stageKey]
                      }"
                      :title="(row as LoopGroup).stageMap[stageKey] ? stageLabel(stageKey) + ': ' + (row as LoopGroup).stageMap[stageKey]!.title : stageLabel(stageKey) + ': —'"
                      @click="(row as LoopGroup).stageMap[stageKey] && openRecord((row as LoopGroup).stageMap[stageKey]!.path)"
                    >
                      <span class="process__table-stage-icon">{{ stageIcon(stageKey) }}</span>
                      <span class="process__table-stage-label">{{ stageLabel(stageKey) }}</span>
                      <el-tag v-if="(row as LoopGroup).stageMap[stageKey]" size="small" :type="statusType((row as LoopGroup).stageMap[stageKey]!.status)">
                        {{ (row as LoopGroup).stageMap[stageKey]!.status }}
                      </el-tag>
                      <span v-else class="process__table-stage-empty">—</span>
                    </span>
                  </div>
                </template>
              </el-table-column>
              <el-table-column label="Progress" width="150" sortable :sort-method="(a: any, b: any) => groupProgress(a) - groupProgress(b)">
                <template #default="{ row }">
                  <div class="process__progress-cell">
                    <el-progress :percentage="groupProgress(row as LoopGroup)" :status="groupProgress(row as LoopGroup) >= 100 ? 'success' : undefined" :stroke-width="6" />
                  </div>
                </template>
              </el-table-column>
              <el-table-column label="Updated" width="120" sortable>
                <template #default="{ row }">
                  <el-tooltip v-if="(row as LoopGroup).updated" :content="formatDate((row as LoopGroup).updated)" placement="top" :show-after="400">
                    <span class="process__date">{{ formatRelativeTime((row as LoopGroup).updated) }}</span>
                  </el-tooltip>
                  <span v-else class="process__text-muted">—</span>
                </template>
              </el-table-column>
              <el-table-column label="Actions" width="80" fixed="right" align="center">
                <template #default="{ row }">
                  <el-popconfirm
                    title="Delete this loop and all its records?"
                    confirm-button-text="Delete"
                    cancel-button-text="Cancel"
                    @confirm="deleteLoop(row as LoopGroup)"
                  >
                    <template #reference>
                      <el-button size="small" text type="danger">Del</el-button>
                    </template>
                  </el-popconfirm>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </div>
      </div>
    </div>

    <KnowledgePreviewDialog ref="previewDlg" />
  </div>
</template>

<script setup lang="ts" name="processRecord">
import { ref, computed, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { Refresh } from "@element-plus/icons-vue";
import { scanKnowledge, deleteKnowledgeFile } from "@/api/modules/knowledgeService";
import { goalRoleMap } from "@/views/knowledge/executiver/okrData";
import type { KnowledgeFileEntry } from "@/api/interface/yiweb";
import KnowledgePreviewDialog from "@/components/KnowledgePreviewDialog/KnowledgePreviewDialog.vue";

const previewDlg = ref<InstanceType<typeof KnowledgePreviewDialog> | null>(null);
const loading = ref(false);
const viewMode = ref<"card" | "list" | "table">("card");
const statusTab = ref<"all" | "completed" | "in-progress" | "not-started">("all");

const route = useRoute();
const router = useRouter();

/** Loop filter from query param (e.g. /executiver/process?loop=loop-001). */
const filterLoopId = computed(() => {
  const q = route.query.loop;
  return typeof q === "string" ? q : "";
});

/** Goal filter from query param (e.g. /executiver/process?goal=exec-001) — shows all loops tracing that OKR goal. */
const filterGoalId = computed(() => {
  const q = route.query.goal;
  return typeof q === "string" ? q : "";
});

const stickyIcon = "🔁";
const stickyTitle = "Process Records";

const STAGES = [
  { key: "requirement-review", icon: "📋", label: "需求评审" },
  { key: "technical-review", icon: "🧭", label: "技术评审" },
  { key: "code-review", icon: "🔍", label: "代码审查" },
  { key: "build-debug", icon: "⚡", label: "构建调试" },
  { key: "test-report", icon: "🧪", label: "测试报告" },
  { key: "deployment", icon: "📦", label: "部署" },
  { key: "launch", icon: "🚀", label: "上线记录" },
  { key: "retrospective", icon: "🔄", label: "复盘总结" }
] as const;

const STAGE_KEYS = STAGES.map(s => s.key);
const STAGE_ORDER: Record<string, number> = Object.fromEntries(STAGES.map((s, i) => [s.key, i]));

interface LoopRecord {
  path: string;
  loopId: string;
  stage: string;
  title: string;
  role: string;
  goalId: string;
  status: string;
  updated?: string;
}

interface LoopSummary {
  path: string;
  loopId: string;
  title: string;
  status: string;
  roles: string[];
}

interface LoopGroup {
  loopId: string;
  title: string;
  records: LoopRecord[];
  summary: LoopSummary | null;
  roles: string[];
  stageMap: Record<string, LoopRecord>;
  updated?: string;
  created?: string;
  goalId?: string;
}

const loopGroups = ref<LoopGroup[]>([]);

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
    status: str(m.status) || "in-progress",
    updated: str(m.updated)
  };
}

function summaryFromFile(f: KnowledgeFileEntry): LoopSummary | null {
  const m = f.meta ?? {};
  if (m.type !== "loop-summary") return null;
  return {
    path: f.path,
    loopId: str(m.loopId),
    title: str(m.title),
    status: str(m.status) || "in-progress",
    roles: Array.isArray(m.roles) ? m.roles.filter((r: unknown) => typeof r === "string") : []
  };
}

async function loadLoopRecords() {
  loading.value = true;
  try {
    const res = await scanKnowledge("okr");
    const files = res.categories?.flatMap(c => c.files) ?? [];

    const summaries = files
      .map(summaryFromFile)
      .filter((s): s is LoopSummary => s !== null);
    const summaryByLoop = new Map<string, LoopSummary>();
    for (const s of summaries) {
      summaryByLoop.set(s.loopId, s);
    }

    const records = files
      .map(recordFromFile)
      .filter((r): r is LoopRecord => r !== null && r.stage in STAGE_ORDER);

    const byLoop = new Map<string, LoopRecord[]>();
    for (const r of records) {
      if (!byLoop.has(r.loopId)) byLoop.set(r.loopId, []);
      byLoop.get(r.loopId)!.push(r);
    }

    // Collect all loopIds from both records and summaries
    const allLoopIds = new Set([...byLoop.keys(), ...summaryByLoop.keys()]);

    loopGroups.value = [...allLoopIds]
      .map(loopId => {
        const recs = (byLoop.get(loopId) || []).sort(
          (a, b) => (STAGE_ORDER[a.stage] ?? 99) - (STAGE_ORDER[b.stage] ?? 99)
        );
        const summary = summaryByLoop.get(loopId) || null;
        const stageMap: Record<string, LoopRecord> = {};
        for (const r of recs) stageMap[r.stage] = r;

        // Collect unique roles from records + summary
        const roleSet = new Set<string>();
        for (const r of recs) { if (r.role) roleSet.add(r.role); }
        if (summary) { for (const r of summary.roles) roleSet.add(r); }

        const latestUpdated = recs
          .map(r => r.updated)
          .filter(Boolean)
          .sort()
          .reverse()[0];

        const earliestCreated = recs
          .map(r => r.updated)
          .filter(Boolean)
          .sort()[0];

        const goalId = recs.find(r => r.goalId)?.goalId || summary?.path?.split("/").find(seg => seg.startsWith("goal-")) || undefined;

        // Derive semantic title from loop directory slug
        const dirSlug = recs[0]?.path.split("/").find(seg => /^loop-/.test(seg)) ?? loopId;
        const slug = dirSlug.replace(/^loop-\d+-/, "").replace(/-/g, " ");
        const title = slug.charAt(0).toUpperCase() + slug.slice(1);

        return {
          loopId,
          title,
          records: recs,
          summary,
          roles: [...roleSet],
          stageMap,
          updated: latestUpdated,
          created: earliestCreated,
          goalId
        };
      })
      .sort((a, b) => a.loopId.localeCompare(b.loopId));
  } catch {
    loopGroups.value = [];
  } finally {
    loading.value = false;
  }
}

const filteredLoopGroups = computed(() => {
  let groups = loopGroups.value;
  // Query-param filter: show only the specific loop
  if (filterLoopId.value) {
    groups = groups.filter(g => g.loopId === filterLoopId.value);
  }
  if (filterGoalId.value) {
    groups = groups.filter(g => g.goalId === filterGoalId.value);
  }
  if (statusTab.value === "completed") {
    groups = groups.filter(g => {
      return g.records.length === STAGE_KEYS.length && g.records.every(r => r.status === "done");
    });
  } else if (statusTab.value === "in-progress") {
    groups = groups.filter(g => {
      const done = g.records.filter(r => r.status === "done").length;
      return done > 0 && !(done === g.records.length && g.records.length === STAGE_KEYS.length);
    });
  } else if (statusTab.value === "not-started") {
    groups = groups.filter(g => g.records.every(r => r.status !== "done"));
  }
  return groups;
});

const filteredRecordCount = computed(() =>
  filteredLoopGroups.value.reduce((n, g) => n + g.records.length, 0)
);

const stats = computed(() => {
  const groups = loopGroups.value;
  const totalRecords = groups.reduce((n, g) => n + g.records.length, 0);
  const completed = groups.filter(g => {
    const stages = g.records;
    return stages.length === STAGE_KEYS.length && stages.every(r => r.status === "done");
  }).length;
  const inProgress = groups.filter(g => {
    const done = g.records.filter(r => r.status === "done").length;
    return done > 0 && !(done === g.records.length && g.records.length === STAGE_KEYS.length);
  }).length;
  const notStarted = groups.filter(g => g.records.every(r => r.status !== "done")).length;
  return { totalLoops: groups.length, completed, inProgress, notStarted, totalRecords };
});

function groupProgress(group: LoopGroup): number {
  const done = group.records.filter(r => r.status === "done").length;
  return STAGE_KEYS.length ? Math.round((done / STAGE_KEYS.length) * 100) : 0;
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
  if (done === group.records.length && group.records.length === STAGE_KEYS.length) return "Completed";
  return `${done}/${group.records.length} done`;
}
function groupStatusType(group: LoopGroup): "success" | "warning" | "info" {
  const done = group.records.filter(r => r.status === "done").length;
  if (done === group.records.length && group.records.length === STAGE_KEYS.length) return "success";
  if (done > 0) return "warning";
  return "info";
}
function openRecord(path: string) {
  previewDlg.value?.open(path);
}

function clearLoopFilter() {
  router.replace({ path: "/executiver/process" });
}

function clearGoalFilter() {
  const query = { ...route.query };
  delete query.goal;
  router.replace({ path: "/executiver/process", query });
}

/** goalId → 所属角色 id（goalRoleMap），存在则视为可深链回该目标页。 */
function hasGoalRole(goalId?: string): boolean {
  return !!goalId && !!goalRoleMap[goalId];
}

/** 深链到该闭环所属的 OKR 目标（/executiver/okr/:role?goal=:goalId）。 */
function goGoal(goalId?: string) {
  const role = goalId ? goalRoleMap[goalId] : undefined;
  if (role) router.push(`/executiver/okr/${role}?goal=${goalId}`);
}

async function deleteLoop(group: LoopGroup) {
  const paths = group.records.map(r => r.path);
  if (group.summary) paths.push(group.summary.path);
  await Promise.all(paths.map(p => deleteKnowledgeFile(p)));
  await loadLoopRecords();
}

function formatDate(raw?: string): string {
  if (!raw) return "—";
  try {
    const d = new Date(raw);
    if (isNaN(d.getTime())) return raw.slice(0, 10);
    return d.toLocaleDateString("zh-CN", { month: "2-digit", day: "2-digit" });
  } catch { return raw.slice(0, 10); }
}

function formatRelativeTime(raw?: string): string {
  if (!raw) return "—";
  try {
    const d = new Date(raw);
    if (isNaN(d.getTime())) return raw.slice(0, 10);
    const diff = Date.now() - d.getTime();
    if (diff < 60000) return "just now";
    if (diff < 3600000) return `${Math.round(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.round(diff / 3600000)}h ago`;
    if (diff < 604800000) return `${Math.round(diff / 86400000)}d ago`;
    return d.toLocaleDateString("zh-CN", { month: "2-digit", day: "2-digit" });
  } catch { return raw.slice(0, 10); }
}

onMounted(loadLoopRecords);
</script>

<style scoped lang="scss">
.process {
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  height: calc(100vh - 95px);
  min-height: 0;
  overflow: auto;
  background: var(--el-bg-color-page);
}

// ── Sticky Stats Bar ──
.process__sticky-bar {
  position: sticky;
  top: 0;
  z-index: 9;
  margin: 0 24px;
  padding: 14px 20px 16px;
  background: var(--el-bg-color);
  border-radius: 12px;
  border: 1px solid var(--el-border-color-lighter);
  box-shadow: 0 2px 12px rgba(0, 0, 0, .06);
  backdrop-filter: blur(8px);
}
.process__sticky-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}
.process__sticky-left {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  flex: 1;
  min-width: 0;
}
.process__sticky-icon { font-size: 28px; flex-shrink: 0; margin-top: 2px; }
.process__sticky-info { display: flex; flex-direction: column; gap: 3px; min-width: 0; }
.process__sticky-name { margin: 0; font-size: 18px; font-weight: 700; line-height: 1.2; }
.process__sticky-desc {
  margin: 0;
  font-size: 12px;
  color: var(--el-text-color-secondary);
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.process__sticky-right { display: flex; gap: 6px; flex-shrink: 0; }

.process__stat-pill {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1px;
  padding: 6px 16px;
  border-radius: 8px;
  background: var(--el-fill-color-light);
  min-width: 64px;
}
.process__stat-pill--accent { background: var(--el-color-primary-light-9); }
.process__stat-pill-value { font-size: 18px; font-weight: 700; color: var(--el-text-color-primary); line-height: 1.1; }
.process__stat-pill--accent .process__stat-pill-value { color: var(--el-color-primary); }
.process__stat-pill-label { font-size: 10px; color: var(--el-text-color-secondary); font-weight: 600; text-transform: uppercase; letter-spacing: .3px; }

// ── Body: sidebar + content ──
.process__body {
  display: flex;
  flex: 1;
  min-height: 0;
  margin: 12px 24px 0;
  gap: 0;
}

// ── Sidebar ──
.process__sidebar {
  display: flex;
  flex-direction: column;
  gap: 4px;
  width: 160px;
  flex-shrink: 0;
  padding: 8px 10px 12px;
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 12px;
  align-self: flex-start;
  position: sticky;
  top: 120px;
  overflow: hidden;
}

.process__sidebar-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  border: none;
  border-radius: 8px;
  background: transparent;
  cursor: pointer;
  font-size: 13px;
  color: var(--el-text-color-regular);
  transition: all .15s;
  text-align: left;
  width: 100%;
  white-space: nowrap;
  &:hover { background: var(--el-fill-color-light); color: var(--el-text-color-primary); }
  &.is-active {
    background: var(--el-color-primary-light-9);
    color: var(--el-color-primary);
    font-weight: 600;
    box-shadow: inset 3px 0 0 var(--el-color-primary);
  }
}
.process__sidebar-icon { font-size: 18px; flex-shrink: 0; }
.process__sidebar-label { flex: 1; min-width: 0; overflow: hidden; }
.process__sidebar-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 22px;
  height: 20px;
  padding: 0 6px;
  border-radius: 10px;
  font-size: 11px;
  font-weight: 700;
  background: var(--el-fill-color);
  color: var(--el-text-color-secondary);
  flex-shrink: 0;
  .process__sidebar-item.is-active & {
    background: var(--el-color-primary);
    color: #fff;
  }
}

// ── Content ──
.process__content {
  flex: 1;
  min-width: 0;
  margin-left: 16px;
  overflow: auto;
}

// ── Section card ──
.process__section {
  display: flex;
  flex-direction: column;
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 12px;
  overflow: hidden;
}
.process__section-head {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 20px;
  border-bottom: 1px solid var(--el-border-color-lighter);
  flex-wrap: wrap;
}
.process__section-title {
  margin: 0;
  font-size: 15px;
  font-weight: 700;
  color: var(--el-text-color-primary);
  white-space: nowrap;
}
.process__section-body {
  padding: 16px 20px;
}
.process__filter-banner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 14px;
  margin-bottom: 12px;
  background: var(--el-color-primary-light-9);
  border: 1px solid var(--el-color-primary-light-5);
  border-radius: 8px;
  font-size: 13px;
  color: var(--el-color-primary);
}
.process__toolbar-right {
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 6px;
}
.process__result-count {
  font-size: 12px;
  color: var(--el-text-color-secondary);
  white-space: nowrap;
}

// ── Empty ──
.process__empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 64px 0;
  color: var(--el-text-color-secondary);
}
.process__empty-icon { font-size: 40px; }
.process__empty-title { margin: 0; font-size: 14px; font-weight: 600; color: var(--el-text-color-primary); }
.process__empty-hint { margin: 0; font-size: 12px; color: var(--el-text-color-placeholder); max-width: 480px; text-align: center; line-height: 1.5; }

// ── Card Grid ──
.process__grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
  gap: 12px;
}

.process__card {
  display: flex;
  flex-direction: column;
  transition: box-shadow .2s, border-color .2s;
  &.is-highlighted {
    border-color: var(--el-color-primary);
    box-shadow: 0 0 0 2px var(--el-color-primary-light-7);
  }
}

.process__card-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}
.process__card-loop {
  font-size: 14px;
  font-weight: 700;
  font-family: "SF Mono", "Fira Code", monospace;
  color: var(--el-color-primary);
}

.process__card-summary {
  margin-bottom: 8px;
}
.process__card-summary-title {
  font-size: 13px;
  color: var(--el-text-color-regular);
  line-height: 1.4;
}

.process__card-roles {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin-bottom: 10px;
}

.process__role-badge {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  padding: 1px 7px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 600;
  background: var(--el-fill-color);
  color: var(--el-text-color-secondary);
  white-space: nowrap;
  flex-shrink: 0;
  &.is-active {
    background: var(--el-color-primary-light-9);
    color: var(--el-color-primary);
  }
}

// ── Stage List ──
.process__stage-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-top: 10px;
}
.process__stage {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 7px 10px;
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 8px;
  cursor: default;
  transition: box-shadow .2s, border-color .2s;
  &.is-filled {
    cursor: pointer;
    &:hover {
      border-color: var(--el-color-primary-light-5);
      box-shadow: 0 2px 8px rgb(0 0 0 / 6%);
    }
  }
  &.is-missing {
    opacity: 0.4;
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
.process__stage-title--muted {
  color: var(--el-text-color-placeholder);
}

.process__card-footer {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  margin-top: 8px;
}
.process__card-date {
  font-size: 11px;
  color: var(--el-text-color-placeholder);
}

// ── Goal deep-link (loop → OKR goal) ──
.process__goal-link {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  margin-right: auto;
  font-size: 12px;
  font-weight: 600;
  color: var(--el-color-primary);
  cursor: pointer;
  white-space: nowrap;
  &:hover {
    text-decoration: underline;
  }
}
// 表格视图里 .process__table-goal 定义在更后，需以更高优先级盖回主色，保证可点击态可辨。
.process__table-goal.process__goal-link {
  color: var(--el-color-primary);
}

// ── Table ──
.process__table-loop {
  font-family: "SF Mono", "Fira Code", monospace;
  font-weight: 700;
  color: var(--el-color-primary);
  &.is-clickable {
    cursor: pointer;
    &:hover { text-decoration: underline; }
  }
}
.process__table-title-cell {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.process__table-title {
  font-size: 13px;
  font-weight: 500;
  color: var(--el-text-color-primary);
  line-height: 1.4;
}
.process__table-goal {
  font-size: 11px;
  font-family: "SF Mono", "Fira Code", monospace;
  color: var(--el-text-color-placeholder);
}
.process__table-roles {
  display: flex;
  flex-wrap: wrap;
  gap: 3px;
}
.process__table-stages {
  display: flex;
  align-items: center;
  gap: 4px;
  flex-wrap: wrap;
}
.process__table-stage {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 11px;
  white-space: nowrap;
  border: 1px solid var(--el-border-color);
  transition: box-shadow .15s, border-color .15s;
  &.is-filled {
    cursor: pointer;
    &:hover {
      border-color: var(--el-color-primary-light-5);
      box-shadow: 0 1px 6px rgb(0 0 0 / 6%);
    }
  }
  &.is-missing {
    opacity: 0.35;
  }
}
.process__table-stage-icon { font-size: 12px; flex-shrink: 0; }
.process__table-stage-label {
  font-weight: 600;
  color: var(--el-text-color-secondary);
}
.process__table-stage-empty {
  color: var(--el-text-color-placeholder);
  font-size: 10px;
}
.process__progress-cell {
  :deep(.el-progress) {
    width: 100%;
  }
}
.process__date {
  font-size: 12px;
  color: var(--el-text-color-secondary);
  white-space: nowrap;
}
.process__text-muted {
  color: var(--el-text-color-placeholder);
  font-size: 12px;
}

// ── List View ──
.process__list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.process__list-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 12px 16px;
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 8px;
  transition: box-shadow .2s, border-color .2s;
  &:hover {
    border-color: var(--el-color-primary-light-5);
    box-shadow: 0 2px 8px rgb(0 0 0 / 6%);
  }
}
.process__list-main {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.process__list-top {
  display: flex;
  align-items: center;
  gap: 8px;
}
.process__list-loop {
  font-size: 13px;
  font-weight: 700;
  font-family: "SF Mono", "Fira Code", monospace;
  color: var(--el-color-primary);
}
.process__list-title {
  font-size: 13px;
  color: var(--el-text-color-regular);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.process__list-mid {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}
.process__list-stages {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}
.process__list-stage {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 3px 8px;
  border-radius: 6px;
  font-size: 11px;
  white-space: nowrap;
  border: 1px solid var(--el-border-color-lighter);
  transition: box-shadow .15s, border-color .15s;
  &.is-filled {
    cursor: pointer;
    &:hover {
      border-color: var(--el-color-primary-light-5);
      box-shadow: 0 1px 6px rgb(0 0 0 / 6%);
    }
  }
  &.is-missing {
    opacity: 0.35;
  }
}
.process__list-stage-icon { font-size: 13px; flex-shrink: 0; }
.process__list-stage-label {
  font-weight: 600;
  color: var(--el-text-color-secondary);
  flex-shrink: 0;
}
.process__list-stage-empty {
  color: var(--el-text-color-placeholder);
  font-size: 11px;
}
.process__list-meta {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
  flex-shrink: 0;
}
.process__list-date {
  font-size: 11px;
  color: var(--el-text-color-placeholder);
  white-space: nowrap;
}

// ── Table hover ──
:deep(.el-table__body tr) { transition: background-color .15s ease; }
:deep(.el-table__body tr:hover > td) { background-color: var(--el-color-primary-light-9) !important; }
</style>