<template>
  <div class="okr-rec">
    <!-- ═══ Header ═══ -->
    <div class="okr-rec__header">
      <div class="okr-rec__header-left">
        <h2 class="okr-rec__title">{{ t("home.aiRecommend.title") }}</h2>
        <span class="okr-rec__subtitle">{{ t("home.aiRecommend.subtitle") }}</span>
      </div>
      <div class="okr-rec__header-right">
        <el-select v-model="roleScope" size="small" class="okr-rec__scope">
          <el-option :value="'all'" :label="t('home.aiRecommend.scopeAll')" />
          <el-option v-for="r in roleOptions" :key="r.id" :value="r.id" :label="`${r.icon} ${r.name}`" />
        </el-select>
      </div>
    </div>

    <!-- ═══ 工具栏：分类筛选 + 搜索 + 统计 ═══ -->
    <div class="okr-rec__toolbar">
      <div class="okr-rec__toolbar-left">
        <el-radio-group v-model="categoryFilter" size="small">
          <el-radio-button value="all">{{ t("home.aiRecommend.filterAll") }}</el-radio-button>
          <el-radio-button v-for="l in LIST_TYPES" :key="l.key" :value="l.key">{{ l.icon }} {{ t(`home.aiRecommend.lists.${l.key}`) }}</el-radio-button>
        </el-radio-group>
        <el-input v-model="searchKeyword" size="small" clearable class="okr-rec__search" :placeholder="t('home.aiRecommend.searchPlaceholder')">
          <template #prefix><el-icon><Search /></el-icon></template>
        </el-input>
        <el-date-picker
          v-model="dueDateFilter"
          type="date"
          size="small"
          value-format="YYYY-MM-DD"
          :placeholder="t('home.aiRecommend.datePlaceholder')"
          clearable
          class="okr-rec__date"
        />
      </div>
      <div class="okr-rec__toolbar-right">
        <el-radio-group v-model="viewMode" size="small" class="okr-rec__view">
          <el-radio-button value="table"><el-icon><Grid /></el-icon>{{ t("home.aiRecommend.view.table") }}</el-radio-button>
          <el-radio-button value="list"><el-icon><List /></el-icon>{{ t("home.aiRecommend.view.list") }}</el-radio-button>
          <el-radio-button value="card"><el-icon><Postcard /></el-icon>{{ t("home.aiRecommend.view.card") }}</el-radio-button>
        </el-radio-group>
        <div class="okr-rec__stats">
          <span class="okr-rec__stat">{{ t("home.aiRecommend.stats.total", { n: stats.total }) }}</span>
          <span class="okr-rec__stat is-p0">{{ t("home.aiRecommend.stats.p0", { n: stats.p0 }) }}</span>
          <span class="okr-rec__stat is-overdue">{{ t("home.aiRecommend.stats.overdue", { n: stats.overdue }) }}</span>
        </div>
      </div>
    </div>

    <!-- ═══ 表格视图：四类推荐清单合并 ═══ -->
    <el-table v-if="viewMode === 'table'" :data="filteredItems" size="small" border stripe style="width: 100%" row-key="id">
      <el-table-column :label="t('home.aiRecommend.cols.priority')" prop="priority" width="90" sortable>
        <template #default="{ row }">
          <PriorityTag :priority="row.priority" />
        </template>
      </el-table-column>
      <el-table-column :label="t('home.aiRecommend.cols.score')" prop="score" width="120" sortable>
        <template #default="{ row }">
          <div class="okr-rec__score">
            <span class="okr-rec__score-bar"><i :class="row.kind === 'action' ? 'is-success' : `is-${scoreTagType(row.score)}`" :style="{ width: `${row.kind === 'action' ? row.progress : row.score}%` }" /></span>
            <span class="okr-rec__score-num" :class="row.kind === 'action' ? 'is-success' : `is-${scoreTagType(row.score)}`">{{ row.kind === 'action' ? `${row.progress}%` : row.score }}</span>
          </div>
        </template>
      </el-table-column>
      <el-table-column :label="t('home.aiRecommend.cols.task')" prop="title" min-width="320">
        <template #default="{ row }">
          <span class="okr-rec__cell-title okr-rec__cell-title--link" @click="openPreview(row as TableRow)">{{ row.title }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="t('home.aiRecommend.cols.role')" width="150">
        <template #default="{ row }">
          <RoleLink :role="row.role" :role-name="row.roleName" :role-icon="row.roleIcon" />
        </template>
      </el-table-column>
      <el-table-column :label="t('home.aiRecommend.cols.goal')" width="110">
        <template #default="{ row }">
          <GoalLink v-if="row.goalId" :role="row.role" :goal-id="row.goalId" />
          <span v-else class="okr-rec__cell-none">—</span>
        </template>
      </el-table-column>
      <el-table-column :label="t('home.aiRecommend.cols.metric')" min-width="200">
        <template #default="{ row }">
          <div v-if="row.metric" class="okr-rec__cell-metric">
            <span class="okr-rec__metric-icon">{{ row.metric.icon }}</span>
            <div class="okr-rec__metric-body">
              <span class="okr-rec__metric-name">{{ row.metric.name }}</span>
              <span class="okr-rec__metric-val">{{ row.metric.current }}{{ row.metric.unit }} → {{ row.metric.target }}{{ row.metric.unit }} · {{ row.metric.progress }}%</span>
            </div>
          </div>
          <span v-else class="okr-rec__cell-none">—</span>
        </template>
      </el-table-column>
      <el-table-column :label="t('home.aiRecommend.cols.skill')" width="150">
        <template #default="{ row }">
          <SkillTag v-if="row.skill" :skill="row.skill" />
          <span v-else class="okr-rec__cell-none">—</span>
        </template>
      </el-table-column>
      <el-table-column :label="t('home.aiRecommend.cols.agent')" width="150">
        <template #default="{ row }">
          <AgentTag v-if="row.agent" :agent="row.agent" />
          <span v-else class="okr-rec__cell-none">—</span>
        </template>
      </el-table-column>
      <el-table-column :label="t('home.aiRecommend.cols.mcp')" width="110">
        <template #default="{ row }">
          <McpTag :mcp="row.mcp" />
        </template>
      </el-table-column>
      <el-table-column :label="t('home.aiRecommend.cols.effort')" width="90">
        <template #default="{ row }">
          <EffortBadge :effort="row.effort" />
        </template>
      </el-table-column>
      <el-table-column :label="t('home.aiRecommend.cols.due')" prop="dueDate" width="110" sortable>
        <template #default="{ row }">
          <DueLabel :due-date="row.dueDate" />
        </template>
      </el-table-column>
      <el-table-column :label="t('home.aiRecommend.cols.reason')" min-width="220">
        <template #default="{ row }">
          <template v-if="row.kind === 'action'">
            <el-tag :type="statusTagType(row.status)" size="small">{{ row.status }}</el-tag>
            <span v-if="row.subtaskCount" class="okr-rec__subtask">{{ row.subtaskCount }} subtasks</span>
          </template>
          <span v-else>{{ row.reason }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="t('home.aiRecommend.cols.action')" width="110" fixed="right" align="center">
        <template #default="{ row }">
          <el-button v-if="row.kind !== 'action'" link type="primary" size="small" :icon="MagicStick" :loading="regeneratingId === row.id" @click="regenerateItem(row.listType, row.id, row.role, row.title)" />
          <el-button link type="danger" size="small" :icon="Delete" @click="handleDelete(row as TableRow)" />
        </template>
      </el-table-column>
    </el-table>

    <!-- ═══ 列表视图 ═══ -->
    <div v-else-if="viewMode === 'list'" class="okr-rec__list">
      <div v-for="item in filteredItems" :key="item.id" class="okr-rec__list-item">
        <PriorityTag class="okr-rec__list-priority" :priority="item.priority" />
        <div class="okr-rec__list-main">
          <div class="okr-rec__list-title okr-rec__cell-title--link" @click="openPreview(item)">{{ item.title }}</div>
          <div class="okr-rec__list-meta">
            <CategoryTag :list-type="item.listType" />
            <RoleLink :role="item.role" :role-name="item.roleName" :role-icon="item.roleIcon" />
            <GoalLink v-if="item.goalId" :role="item.role" :goal-id="item.goalId" />
            <span v-if="item.metric" class="okr-rec__list-metric">{{ item.metric.icon }} {{ item.metric.name }} {{ item.metric.current }}→{{ item.metric.target }}{{ item.metric.unit }}</span>
            <SkillTag v-if="item.skill" :skill="item.skill" />
            <AgentTag v-if="item.agent" :agent="item.agent" />
            <McpTag :mcp="item.mcp" />
            <EffortBadge :effort="item.effort" />
            <DueLabel class="okr-rec__list-due" :due-date="item.dueDate" />
          </div>
        </div>
        <span class="okr-rec__list-score" :class="`is-${scoreTagType(item.score)}`">{{ item.score }}</span>
      </div>
    </div>

    <!-- ═══ 卡片视图 ═══ -->
    <div v-else class="okr-rec__cards">
      <div v-for="item in filteredItems" :key="item.id" class="okr-rec__card">
        <div class="okr-rec__card-head">
          <PriorityTag :priority="item.priority" />
          <CategoryTag :list-type="item.listType" />
          <span class="okr-rec__card-score" :class="`is-${scoreTagType(item.score)}`">{{ item.score }}</span>
        </div>
        <div class="okr-rec__card-title okr-rec__cell-title--link" @click="openPreview(item)">{{ item.title }}</div>
        <div class="okr-rec__cell-dims">
          <span class="okr-rec__dim" :class="`is-${item.roi}`"><em>{{ t("home.aiRecommend.dims.roi") }}</em><b>{{ levelLabel(item.roi) }}</b></span>
          <span class="okr-rec__dim" :class="`is-${item.difficulty}`"><em>{{ t("home.aiRecommend.dims.difficulty") }}</em><b>{{ levelLabel(item.difficulty) }}</b></span>
          <span class="okr-rec__dim" :class="`is-${item.urgency}`"><em>{{ t("home.aiRecommend.dims.urgency") }}</em><b>{{ levelLabel(item.urgency) }}</b></span>
        </div>
        <div v-if="item.metric" class="okr-rec__card-metric">
          <span>{{ item.metric.icon }}</span>
          <span class="okr-rec__card-metric-name">{{ item.metric.name }}</span>
          <span class="okr-rec__card-metric-val">{{ item.metric.current }}→{{ item.metric.target }}{{ item.metric.unit }} ({{ item.metric.progress }}%)</span>
        </div>
        <div class="okr-rec__card-reason">{{ item.reason }}</div>
        <div class="okr-rec__card-orch">
          <SkillTag v-if="item.skill" :skill="item.skill" />
          <AgentTag v-if="item.agent" :agent="item.agent" />
          <McpTag :mcp="item.mcp" />
        </div>
        <div class="okr-rec__card-foot">
          <RoleLink :role="item.role" :role-name="item.roleName" :role-icon="item.roleIcon" />
          <EffortBadge :effort="item.effort" />
          <GoalLink v-if="item.goalId" :role="item.role" :goal-id="item.goalId" />
          <DueLabel class="okr-rec__card-due" :due-date="item.dueDate" />
        </div>
      </div>
    </div>

    <!-- ═══ 空状态 ═══ -->
    <el-empty v-if="!filteredItems.length" :description="t('home.aiRecommend.empty')" :image-size="48" />

    <KnowledgePreviewDialog ref="previewDlg" />
  </div>
</template>

<script setup lang="ts" name="OkrRecommendPanel">
import { computed, reactive, ref, onMounted } from "vue";
import { useI18n } from "vue-i18n";
import { ElMessage } from "element-plus";
import { MagicStick, Search, Grid, List, Postcard, Delete } from "@element-plus/icons-vue";
import dayjs from "dayjs";
import { chat } from "@/api/modules/chatService";
import { scanKnowledge, writeKnowledgeFile, deleteKnowledgeFile } from "@/api/modules/knowledgeService";
import type { ChatPayload, KnowledgeFileEntry } from "@/api/interface/yiweb";
import { DEFAULT_MODEL } from "@/views/aiChat/constants";
import { rolesData, allGoalsMap } from "@/views/knowledge/executiver/okrData";
import KnowledgePreviewDialog from "@/views/aiChat/components/KnowledgePreviewDialog.vue";
import { skillLabel, mcpLabel, isOverdue } from "./format";
import PriorityTag from "./fields/PriorityTag.vue";
import CategoryTag from "./fields/CategoryTag.vue";
import RoleLink from "./fields/RoleLink.vue";
import GoalLink from "./fields/GoalLink.vue";
import SkillTag from "./fields/SkillTag.vue";
import AgentTag from "./fields/AgentTag.vue";
import McpTag from "./fields/McpTag.vue";
import EffortBadge from "./fields/EffortBadge.vue";
import DueLabel from "./fields/DueLabel.vue";
import {
  LIST_TYPES,
  OKR_SYSTEM_PROMPT,
  buildSingleItemPrompt,
  parseRecommendation,
  taskToMeta,
  taskFromMeta,
  actionItemFromMeta,
  type OkrLevel,
  type OkrListType,
  type OkrScope,
  type OkrTaskItem,
  type OkrActionItem
} from "./okrRecommend";

const { t } = useI18n();

/** 由父组件（home）传入的联动项目 id（小写，如 "yiai"）；null/空 = 展示全部。 */
const props = defineProps<{ project?: string | null }>();

const previewDlg = ref<InstanceType<typeof KnowledgePreviewDialog> | null>(null);

const roleScope = ref<OkrScope>("all");
const roleOptions = Object.values(rolesData).map(r => ({ id: r.id, name: r.name, icon: r.icon }));

type ViewMode = "table" | "list" | "card";
const viewMode = ref<ViewMode>("table");

/** 正在单条重新生成的组合 id（带 listType 前缀），用于行内按钮 loading 态。 */
const regeneratingId = ref("");

interface ListState {
  items: OkrTaskItem[];
  source: "ai" | "fallback" | "";
  generatedAt: string;
  filePaths: string[];
}

const emptyState = (): ListState => ({ items: [], source: "", generatedAt: "", filePaths: [] });

const lists = reactive<Record<OkrListType, ListState>>({
  daily: emptyState(),
  weekly: emptyState(),
  risk: emptyState(),
  sprint: emptyState()
});

/** Action Item（okr-action）— 与推荐任务合并展示，只读、不参与 AI 生成。 */
const actionItems = ref<OkrActionItem[]>([]);

/** 统一表格行：推荐任务（listType 区分来源清单）或 Action Item（kind 区分）。 */
type TableRow = (OkrTaskItem & { kind: "task"; listType: OkrListType }) | OkrActionItem;

/** 四类推荐清单 + Action Item 合并为一张表。 */
const allRows = computed<TableRow[]>(() => {
  const tasks: TableRow[] = LIST_TYPES.flatMap(l =>
    lists[l.key].items.map(item => ({ ...item, kind: "task" as const, listType: l.key }))
  );
  return [...tasks, ...actionItems.value].sort((a, b) => b.score - a.score);
});

// ── 分类筛选 + 搜索 + 日期 ──────────────────────────
const categoryFilter = ref<"all" | OkrListType>("all");
const searchKeyword = ref("");
const dueDateFilter = ref("");

/** 任务 → 项目 id（小写）：优先 goalId 关联目标的 project，回退到角色首项目。 */
function projectOfRow(row: TableRow): string {
  const goal = row.goalId ? allGoalsMap[row.goalId] : undefined;
  const p = goal?.project || rolesData[row.role]?.projects?.[0] || "";
  return p.toLowerCase();
}

const filteredItems = computed(() => {
  let result =
    categoryFilter.value === "all"
      ? allRows.value
      : allRows.value.filter(i => i.listType === categoryFilter.value);
  if (props.project) result = result.filter(i => projectOfRow(i) === props.project);
  const date = dueDateFilter.value;
  if (date) result = result.filter(i => i.dueDate === date);
  const kw = searchKeyword.value.trim().toLowerCase();
  if (!kw) return result;
  return result.filter(
    i =>
      i.title.toLowerCase().includes(kw) ||
      i.roleName.toLowerCase().includes(kw) ||
      i.role.toLowerCase().includes(kw) ||
      i.goalId.toLowerCase().includes(kw) ||
      i.skill.toLowerCase().includes(kw) ||
      skillLabel(i.skill).toLowerCase().includes(kw) ||
      i.agent.toLowerCase().includes(kw) ||
      i.mcp.toLowerCase().includes(kw)
  );
});

const stats = computed(() => {
  const items = filteredItems.value;
  return {
    total: items.length,
    p0: items.filter(i => i.priority === "P0").length,
    overdue: items.filter(i => isOverdue(i.dueDate)).length
  };
});

function statusTagType(status: string): "success" | "danger" | "warning" | "info" {
  if (status === "Done") return "success";
  if (status === "At Risk") return "danger";
  if (status === "In Progress") return "warning";
  return "info";
}

function levelLabel(l: OkrLevel): string {
  return t(`home.aiRecommend.level.${l}`);
}

function scoreTagType(score: number): "danger" | "warning" | "primary" | "info" {
  return score >= 60 ? "danger" : score >= 35 ? "warning" : score >= 15 ? "primary" : "info";
}

function openPreview(row: TableRow) {
  if (row.filePath) previewDlg.value?.open(row.filePath);
}

// ── 知识库持久化 ─────────────────────────────
// 推荐任务按各自 dueDate 归档到 YiKnowledge/okr/YYYY-MM/task-<listType>-<DD>-<NN>-<slug>.md
// （目录只到「年-月」，具体「日」放文件名前缀），每个任务以扁平 frontmatter 携带指标数据。

const KB_DIR = "okr";

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

/** 任务标题 → 文件名可读 slug（保留中文/英文/数字，其余分隔符归一为 `-`）。 */
function slugifyTitle(title: string): string {
  return title
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48)
    .replace(/-+$/g, "");
}

/** 目录用「年-月」（date 取 YYYY-MM），具体「日」（DD）放进文件名前缀。 */
function taskFileName(listType: OkrListType, index: number, date: string, slug: string): string {
  const dir = date.slice(0, 7);
  const day = date.slice(8, 10);
  return `${KB_DIR}/${dir}/task-${listType}-${day}-${pad(index + 1)}-${slug}.md`;
}

/** 从文件名推导稳定 id（task-daily-15-03-<slug>.md → daily-03，日仅作归档分组不参与 id）。 */
function taskIdFromFileName(name: string): string {
  const m = name.match(/^task-(daily|weekly|risk|sprint)-\d{2}-(\d{2})(?:-.*)?\.md$/);
  return m ? `${m[1]}-${m[2]}` : name.replace(/\.md$/, "");
}

function renderTaskBody(item: OkrTaskItem): string {
  const metric = item.metric;
  const metricLine = metric
    ? `- **指标** ${metric.icon} ${metric.name}（当前 ${metric.current}${metric.unit} → 目标 ${metric.target}${metric.unit}，进度 ${metric.progress}%）`
    : "- **指标** —";
  return [
    `# ${item.title}`,
    "",
    `> ${item.reason || item.title}`,
    "",
    "| Field | Value |",
    "|---|---|",
    `| Role | ${item.roleName} |`,
    `| Priority | ${item.priority} |`,
    `| Score | ${item.score} |`,
    `| Effort | ${item.effort} |`,
    `| Due | ${item.dueDate || "—"} |`,
    `| Goal | ${item.goalId || "—"} |`,
    `| Skill | ${item.skill ? skillLabel(item.skill) : "—"} |`,
    `| Agent | ${item.agent || "—"} |`,
    `| MCP | ${mcpLabel(item.mcp)} |`,
    "",
    metricLine
  ].join("\n");
}

/** 把某一清单整体落盘：顺序编号 → 写文件 → 删除不再存在的旧文件。 */
async function persistList(listType: OkrListType) {
  const state = lists[listType];
  const today = dayjs().format("YYYY-MM-DD");
  const newPaths: string[] = [];
  let failed = false;
  for (let i = 0; i < state.items.length; i++) {
    const item = state.items[i];
    item.id = `${listType}-${pad(i + 1)}`;
    const path = taskFileName(listType, i, item.dueDate || today, slugifyTitle(item.title) || pad(i + 1));
    item.filePath = path;
    newPaths.push(path);
    const meta: Record<string, unknown> = {
      type: "okr-task",
      list: listType,
      id: item.id,
      ...taskToMeta(item, state.source === "ai" ? "ai" : "fallback")
    };
    try {
      await writeKnowledgeFile(path, renderTaskBody(item), meta);
    } catch {
      failed = true;
    }
  }
  const stale = state.filePaths.filter(p => !newPaths.includes(p));
  for (const p of stale) {
    try {
      await deleteKnowledgeFile(p);
    } catch {
      /* ignore */
    }
  }
  state.filePaths = newPaths;
  if (failed) ElMessage.error("部分任务保存到知识库失败");
}

/** 挂载时从 YiKnowledge/okr/ 加载已落盘的任务清单（任务按 dueDate 归档到日期目录）。 */
async function loadFromKnowledge() {
  try {
    const res = await scanKnowledge(KB_DIR);
    const files = res.categories?.flatMap(c => c.files) ?? [];
    const byList: Record<OkrListType, KnowledgeFileEntry[]> = { daily: [], weekly: [], risk: [], sprint: [] };
    for (const f of files.filter(f => f.meta?.type === "okr-task")) {
      const list = f.meta?.list;
      if (typeof list === "string" && list in byList) byList[list as OkrListType].push(f);
    }
    for (const l of LIST_TYPES) {
      const state = lists[l.key];
      const entries = byList[l.key].sort((a, b) => (taskIdFromFileName(a.name) < taskIdFromFileName(b.name) ? -1 : 1));
      state.items = entries
        .map(f => {
          const item = taskFromMeta(f.meta ?? {}, taskIdFromFileName(f.name));
          if (item) item.filePath = f.path;
          return item;
        })
        .filter((x): x is OkrTaskItem => x !== null);
      state.filePaths = entries.map(f => f.path);
    }
    actionItems.value = files
      .filter(f => f.meta?.type === "okr-action")
      .map(f => {
        const row = actionItemFromMeta(f.meta ?? {}, f.name.replace(/\.md$/, ""));
        if (row) row.filePath = f.path;
        return row;
      })
      .filter((x): x is OkrActionItem => x !== null);
  } catch {
    // 保持空态，等待用户手动生成
  }
}

/** 从对应清单中删除一条推荐，并同步落盘（重新编号 + 清理旧文件）。 */
async function removeItem(listType: OkrListType, id: string) {
  const state = lists[listType];
  const idx = state.items.findIndex(i => i.id === id);
  if (idx === -1) return;
  state.items.splice(idx, 1);
  await persistList(listType);
}

/** 删除一条 Action Item（直接删知识库文件，不参与清单重编号）。 */
async function removeActionItem(row: OkrActionItem) {
  if (row.filePath) {
    try {
      await deleteKnowledgeFile(row.filePath);
    } catch {
      ElMessage.error("Failed to delete action item");
      return;
    }
  }
  actionItems.value = actionItems.value.filter(a => a.id !== row.id);
}

/** 表格行删除入口：任务走清单持久化，Action Item 走文件删除。 */
async function handleDelete(row: TableRow) {
  if (row.kind === "action") await removeActionItem(row);
  else await removeItem(row.listType, row.id);
}

/** 单条 AI 重新生成：替换该行推荐（保留原 id，避免行 key 变动；强制回原角色）。 */
async function regenerateItem(listType: OkrListType, id: string, role: string, title: string) {
  const state = lists[listType];
  const idx = state.items.findIndex(i => i.id === id);
  if (idx === -1) return;

  regeneratingId.value = id;
  try {
    const payload: ChatPayload = {
      model: DEFAULT_MODEL,
      system: OKR_SYSTEM_PROMPT,
      messages: [{ type: "user", message: buildSingleItemPrompt(listType, role, title, buildHistory(listType)), timestamp: Date.now() }]
    };
    const text = await chat(payload);
    const items = parseRecommendation(text, role, listType);
    if (items.length) {
      const meta = rolesData[role];
      state.items[idx] = {
        ...items[0],
        id,
        role,
        roleName: meta?.name ?? role,
        roleIcon: meta?.icon ?? "👤"
      };
      state.source = "ai";
      state.generatedAt = dayjs().format("HH:mm:ss");
      await persistList(listType);
    }
  } catch {
    // 失败保留原条目
  } finally {
    if (regeneratingId.value === id) regeneratingId.value = "";
  }
}

/** 拼装历史任务：其它清单已加载的任务（借鉴以前的任务内容，避免重复、延续上下文）。 */
function buildHistory(excludeKey?: OkrListType): OkrTaskItem[] {
  const out: OkrTaskItem[] = [];
  for (const l of LIST_TYPES) {
    if (l.key === excludeKey) continue;
    out.push(...lists[l.key].items);
  }
  return out;
}

onMounted(loadFromKnowledge);
</script>

<style scoped lang="scss">
.okr-rec {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

// ── Header ─────────────────────────────────────
.okr-rec__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
}
.okr-rec__header-left { display: flex; flex-direction: column; gap: 2px; }
.okr-rec__title { margin: 0; font-size: 16px; font-weight: 700; }
.okr-rec__subtitle { font-size: 12px; color: var(--el-text-color-secondary); }
.okr-rec__header-right { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
.okr-rec__scope { width: 200px; }

// ── Toolbar ────────────────────────────────────
.okr-rec__toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
}
.okr-rec__toolbar-left { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }
.okr-rec__toolbar-right { display: flex; align-items: center; gap: 14px; flex-wrap: wrap; }
.okr-rec__view {
  :deep(.el-radio-button__inner) {
    display: inline-flex;
    align-items: center;
    gap: 4px;
  }
}
.okr-rec__search { width: 220px; }
.okr-rec__date { width: 150px; }
.okr-rec__stats { display: flex; align-items: center; gap: 14px; }
.okr-rec__stat { font-size: 12px; color: var(--el-text-color-secondary); }
.okr-rec__stat.is-p0 { color: var(--el-color-danger); font-weight: 600; }
.okr-rec__stat.is-overdue { color: var(--el-color-warning); font-weight: 600; }

// ── Table cells ────────────────────────────────
.okr-rec__cell-title { font-size: 13px; font-weight: 600; line-height: 1.4; }
.okr-rec__cell-title--link { cursor: pointer; &:hover { color: var(--el-color-primary); } }
.okr-rec__cell-none { color: var(--el-text-color-placeholder); }
.okr-rec__subtask { margin-left: 6px; font-size: 11px; color: var(--el-text-color-secondary); }

// ── Metric（任务自身指标）────────────────────
.okr-rec__cell-metric { display: flex; align-items: center; gap: 6px; }
.okr-rec__metric-icon { font-size: 14px; }
.okr-rec__metric-body { display: flex; flex-direction: column; gap: 1px; min-width: 0; }
.okr-rec__metric-name { font-size: 12px; font-weight: 600; line-height: 1.3; }
.okr-rec__metric-val { font-size: 11px; color: var(--el-text-color-secondary); font-variant-numeric: tabular-nums; }
.okr-rec__list-metric { font-size: 12px; color: var(--el-text-color-secondary); font-variant-numeric: tabular-nums; }
.okr-rec__card-metric { display: flex; align-items: center; gap: 6px; font-size: 12px; color: var(--el-text-color-secondary); }
.okr-rec__card-metric-name { font-weight: 600; }
.okr-rec__card-metric-val { font-variant-numeric: tabular-nums; }

// ── Dimensions（ROI / 难度 / 紧迫 合并列）───────
.okr-rec__cell-dims { display: flex; align-items: center; gap: 4px; flex-wrap: wrap; }
.okr-rec__dim {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  padding: 1px 6px;
  border-radius: 4px;
  font-size: 11px;
  line-height: 16px;
  white-space: nowrap;
}
.okr-rec__dim em { font-style: normal; opacity: 0.7; }
.okr-rec__dim b { font-weight: 700; }
.okr-rec__dim.is-high { color: var(--el-color-danger); background: var(--el-color-danger-light-9); }
.okr-rec__dim.is-medium { color: var(--el-color-warning); background: var(--el-color-warning-light-9); }
.okr-rec__dim.is-low { color: var(--el-color-info); background: var(--el-color-info-light-9); }

// ── Score（进度条 + 数值）───────────────────────
.okr-rec__score { display: flex; align-items: center; gap: 6px; }
.okr-rec__score-bar {
  display: inline-block;
  width: 56px;
  height: 6px;
  border-radius: 3px;
  background: var(--el-fill-color);
  overflow: hidden;
  flex-shrink: 0;
}
.okr-rec__score-bar i { display: block; height: 100%; border-radius: 3px; transition: width 0.3s; }
.okr-rec__score-bar i.is-danger { background: var(--el-color-danger); }
.okr-rec__score-bar i.is-warning { background: var(--el-color-warning); }
.okr-rec__score-bar i.is-primary { background: var(--el-color-primary); }
.okr-rec__score-bar i.is-info { background: var(--el-color-info); }
.okr-rec__score-bar i.is-success { background: var(--el-color-success); }
.okr-rec__score-num,
.okr-rec__list-score,
.okr-rec__card-score {
  font-weight: 700;
  font-family: monospace;
  &.is-danger { color: var(--el-color-danger); }
  &.is-warning { color: var(--el-color-warning); }
  &.is-primary { color: var(--el-color-primary); }
  &.is-info { color: var(--el-color-info); }
  &.is-success { color: var(--el-color-success); }
}
.okr-rec__score-num { font-size: 12px; }
.okr-rec__list-score { font-size: 16px; }
.okr-rec__card-score { font-size: 18px; }

// ── List view ───────────────────────────────────
.okr-rec__list { display: flex; flex-direction: column; gap: 8px; }
.okr-rec__list-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 8px;
  transition: box-shadow 0.2s, border-color 0.2s;
  &:hover { border-color: var(--el-color-primary-light-5); box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06); }
}
.okr-rec__list-priority { flex-shrink: 0; width: 34px; text-align: center; }
.okr-rec__list-main { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 6px; }
.okr-rec__list-title { font-size: 13px; font-weight: 600; line-height: 1.4; }
.okr-rec__list-meta {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
  font-size: 12px;
  color: var(--el-text-color-secondary);
}
.okr-rec__list-due { font-size: 12px; }
.okr-rec__list-score { flex-shrink: 0; }

// ── Card view ───────────────────────────────────
.okr-rec__cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 14px;
}
.okr-rec__card {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 16px;
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 10px;
  transition: box-shadow 0.2s, border-color 0.2s, transform 0.2s;
  &:hover {
    border-color: var(--el-color-primary-light-5);
    box-shadow: 0 4px 14px rgba(0, 0, 0, 0.08);
    transform: translateY(-1px);
  }
}
.okr-rec__card-head { display: flex; align-items: center; gap: 8px; }
.okr-rec__card-score { margin-left: auto; }
.okr-rec__card-title { font-size: 14px; font-weight: 700; line-height: 1.4; }
.okr-rec__card-orch { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; }
.okr-rec__card-reason {
  font-size: 12px;
  color: var(--el-text-color-secondary);
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.okr-rec__card-foot {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: auto;
  font-size: 12px;
  color: var(--el-text-color-secondary);
}
.okr-rec__card-due { margin-left: auto; }
</style>
