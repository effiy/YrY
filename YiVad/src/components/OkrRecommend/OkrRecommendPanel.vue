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
        <el-button size="small" type="primary" :icon="MagicStick" :loading="anyLoading" @click="generateAll">
          {{ t("home.aiRecommend.generateAll") }}
        </el-button>
        <el-tooltip :content="t('home.aiRecommend.refresh')" placement="top">
          <el-button circle size="small" :icon="Refresh" :loading="anyLoading" @click="generateAll" />
        </el-tooltip>
        <el-tag v-if="anyLoading" size="small" type="warning" effect="light">{{ t("home.aiRecommend.generating") }}</el-tag>
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
      <el-table-column :label="t('home.aiRecommend.cols.category')" width="140" fixed="left">
        <template #default="{ row }">
          <el-tag size="small" effect="light" :type="categoryTagType(row.listType)" round>{{ categoryIcon(row.listType) }} {{ categoryLabel(row.listType) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column :label="t('home.aiRecommend.cols.priority')" prop="priority" width="90" sortable>
        <template #default="{ row }">
          <el-tag :type="priorityType(row.priority)" size="small" effect="dark">{{ row.priority }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column :label="t('home.aiRecommend.cols.score')" prop="score" width="120" sortable>
        <template #default="{ row }">
          <div class="okr-rec__score">
            <span class="okr-rec__score-bar"><i :class="`is-${scoreTagType(row.score)}`" :style="{ width: `${row.score}%` }" /></span>
            <span class="okr-rec__score-num" :class="`is-${scoreTagType(row.score)}`">{{ row.score }}</span>
          </div>
        </template>
      </el-table-column>
      <el-table-column :label="t('home.aiRecommend.cols.task')" prop="title" min-width="320">
        <template #default="{ row }">
          <span class="okr-rec__cell-title">{{ row.title }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="t('home.aiRecommend.cols.role')" width="150">
        <template #default="{ row }">
          <span class="okr-rec__cell-role" @click="goRole(row.role)">{{ row.roleIcon }} {{ row.roleName }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="t('home.aiRecommend.cols.goal')" width="110">
        <template #default="{ row }">
          <code v-if="row.goalId" class="okr-rec__cell-goal" @click="goGoal(row.role, row.goalId)">{{ row.goalId }}</code>
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
          <el-tag v-if="row.skill" size="small" type="primary" effect="light">{{ skillLabel(row.skill) }}</el-tag>
          <span v-else class="okr-rec__cell-none">—</span>
        </template>
      </el-table-column>
      <el-table-column :label="t('home.aiRecommend.cols.agent')" width="150">
        <template #default="{ row }">
          <el-tag v-if="row.agent" size="small" effect="plain">{{ row.agent }}</el-tag>
          <span v-else class="okr-rec__cell-none">—</span>
        </template>
      </el-table-column>
      <el-table-column :label="t('home.aiRecommend.cols.mcp')" width="110">
        <template #default="{ row }">
          <el-tag size="small" :type="mcpTagType(row.mcp)" effect="light">{{ mcpLabel(row.mcp) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column :label="t('home.aiRecommend.cols.effort')" width="90">
        <template #default="{ row }">
          <span class="okr-rec__cell-effort" :class="`is-${row.effort}`">{{ row.effort }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="t('home.aiRecommend.cols.due')" prop="dueDate" width="110" sortable>
        <template #default="{ row }">
          <span :class="{ 'okr-rec__cell-due-overdue': isOverdue(row.dueDate) }">{{ row.dueDate }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="t('home.aiRecommend.cols.reason')" prop="reason" min-width="220" show-overflow-tooltip />
      <el-table-column :label="t('home.aiRecommend.cols.action')" width="110" fixed="right" align="center">
        <template #default="{ row }">
          <el-button link type="primary" size="small" :icon="MagicStick" :loading="regeneratingId === row.id" @click="regenerateItem(row.listType, row.id, row.role, row.title)" />
          <el-button link type="danger" size="small" :icon="Delete" @click="removeItem(row.listType, row.id)" />
        </template>
      </el-table-column>
    </el-table>

    <!-- ═══ 列表视图 ═══ -->
    <div v-else-if="viewMode === 'list'" class="okr-rec__list">
      <div v-for="item in filteredItems" :key="item.id" class="okr-rec__list-item">
        <el-tag :type="priorityType(item.priority)" size="small" effect="dark" class="okr-rec__list-priority">{{ item.priority }}</el-tag>
        <div class="okr-rec__list-main">
          <div class="okr-rec__list-title">{{ item.title }}</div>
          <div class="okr-rec__list-meta">
            <el-tag size="small" effect="light" :type="categoryTagType(item.listType)" round>{{ categoryIcon(item.listType) }} {{ categoryLabel(item.listType) }}</el-tag>
            <span class="okr-rec__list-role" @click="goRole(item.role)">{{ item.roleIcon }} {{ item.roleName }}</span>
            <code v-if="item.goalId" class="okr-rec__list-goal" @click="goGoal(item.role, item.goalId)">{{ item.goalId }}</code>
            <span v-if="item.metric" class="okr-rec__list-metric">{{ item.metric.icon }} {{ item.metric.name }} {{ item.metric.current }}→{{ item.metric.target }}{{ item.metric.unit }}</span>
            <el-tag v-if="item.skill" size="small" type="primary" effect="light">{{ skillLabel(item.skill) }}</el-tag>
            <el-tag v-if="item.agent" size="small" effect="plain">{{ item.agent }}</el-tag>
            <el-tag size="small" :type="mcpTagType(item.mcp)" effect="light">{{ mcpLabel(item.mcp) }}</el-tag>
            <span class="okr-rec__cell-effort" :class="`is-${item.effort}`">{{ item.effort }}</span>
            <span class="okr-rec__list-due" :class="{ 'okr-rec__cell-due-overdue': isOverdue(item.dueDate) }">{{ item.dueDate }}</span>
          </div>
        </div>
        <span class="okr-rec__list-score" :class="`is-${scoreTagType(item.score)}`">{{ item.score }}</span>
      </div>
    </div>

    <!-- ═══ 卡片视图 ═══ -->
    <div v-else class="okr-rec__cards">
      <div v-for="item in filteredItems" :key="item.id" class="okr-rec__card">
        <div class="okr-rec__card-head">
          <el-tag :type="priorityType(item.priority)" size="small" effect="dark">{{ item.priority }}</el-tag>
          <el-tag size="small" effect="light" :type="categoryTagType(item.listType)" round>{{ categoryIcon(item.listType) }} {{ categoryLabel(item.listType) }}</el-tag>
          <span class="okr-rec__card-score" :class="`is-${scoreTagType(item.score)}`">{{ item.score }}</span>
        </div>
        <div class="okr-rec__card-title">{{ item.title }}</div>
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
          <el-tag v-if="item.skill" size="small" type="primary" effect="light">{{ skillLabel(item.skill) }}</el-tag>
          <el-tag v-if="item.agent" size="small" effect="plain">{{ item.agent }}</el-tag>
          <el-tag size="small" :type="mcpTagType(item.mcp)" effect="light">{{ mcpLabel(item.mcp) }}</el-tag>
        </div>
        <div class="okr-rec__card-foot">
          <span class="okr-rec__cell-role" @click="goRole(item.role)">{{ item.roleIcon }} {{ item.roleName }}</span>
          <span class="okr-rec__cell-effort" :class="`is-${item.effort}`">{{ item.effort }}</span>
          <code v-if="item.goalId" class="okr-rec__cell-goal" @click="goGoal(item.role, item.goalId)">{{ item.goalId }}</code>
          <span class="okr-rec__card-due" :class="{ 'okr-rec__cell-due-overdue': isOverdue(item.dueDate) }">{{ item.dueDate }}</span>
        </div>
      </div>
    </div>

    <!-- ═══ 空状态 ═══ -->
    <el-empty v-if="!anyLoading && !filteredItems.length" :description="t('home.aiRecommend.empty')" :image-size="48" />
  </div>
</template>

<script setup lang="ts" name="OkrRecommendPanel">
import { computed, reactive, ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { ElMessage } from "element-plus";
import { Refresh, MagicStick, Search, Grid, List, Postcard, Delete } from "@element-plus/icons-vue";
import dayjs from "dayjs";
import { chat } from "@/api/modules/chatService";
import { scanKnowledge, writeKnowledgeFile, deleteKnowledgeFile } from "@/api/modules/knowledgeService";
import type { ChatPayload, KnowledgeFileEntry } from "@/api/interface/yiweb";
import { DEFAULT_MODEL } from "@/views/aiChat/constants";
import { rolesData } from "@/views/knowledge/executiver/okrData";
import { skills } from "@/views/knowledge/skills/constants";
import {
  LIST_TYPES,
  OKR_SYSTEM_PROMPT,
  buildUserPrompt,
  buildSingleItemPrompt,
  parseRecommendation,
  fallbackRecommendation,
  taskToMeta,
  taskFromMeta,
  type OkrLevel,
  type OkrListType,
  type OkrScope,
  type OkrTaskItem
} from "./okrRecommend";

const { t } = useI18n();
const router = useRouter();

const roleScope = ref<OkrScope>("all");
const roleOptions = Object.values(rolesData).map(r => ({ id: r.id, name: r.name, icon: r.icon }));

type ViewMode = "table" | "list" | "card";
const viewMode = ref<ViewMode>("table");

/** 正在单条重新生成的组合 id（带 listType 前缀），用于行内按钮 loading 态。 */
const regeneratingId = ref("");

interface ListState {
  items: OkrTaskItem[];
  loading: boolean;
  source: "ai" | "fallback" | "";
  generatedAt: string;
  filePaths: string[];
}

const emptyState = (): ListState => ({ items: [], loading: false, source: "", generatedAt: "", filePaths: [] });

const lists = reactive<Record<OkrListType, ListState>>({
  daily: emptyState(),
  weekly: emptyState(),
  risk: emptyState(),
  sprint: emptyState()
});

/** 四类清单合并为一张表；每行带 listType 以区分来源清单（item.id 已含清单前缀，天然唯一）。 */
const combinedItems = computed<(OkrTaskItem & { listType: OkrListType })[]>(() => {
  const out: (OkrTaskItem & { listType: OkrListType })[] = [];
  for (const l of LIST_TYPES) {
    out.push(...lists[l.key].items.map(item => ({ ...item, listType: l.key })));
  }
  return out.sort((a, b) => b.score - a.score);
});

const anyLoading = computed(() => LIST_TYPES.some(l => lists[l.key].loading));

// ── 分类筛选 + 搜索 + 日期 ──────────────────────────
const categoryFilter = ref<"all" | OkrListType>("daily");
const searchKeyword = ref("");
const dueDateFilter = ref("");

const filteredItems = computed(() => {
  let result =
    categoryFilter.value === "all"
      ? combinedItems.value
      : combinedItems.value.filter(i => i.listType === categoryFilter.value);
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

const CATEGORY_TAG: Record<OkrListType, "primary" | "success" | "danger" | "warning"> = {
  daily: "primary",
  weekly: "success",
  risk: "danger",
  sprint: "warning"
};

function listTypeMeta(key: OkrListType) {
  return LIST_TYPES.find(l => l.key === key)!;
}

function categoryIcon(key: OkrListType): string {
  return listTypeMeta(key).icon;
}

function categoryLabel(key: OkrListType): string {
  return t(`home.aiRecommend.lists.${key}`);
}

function categoryTagType(key: OkrListType): "primary" | "success" | "danger" | "warning" {
  return CATEGORY_TAG[key];
}

function priorityType(p: OkrTaskItem["priority"]): "danger" | "warning" | "primary" | "info" {
  return p === "P0" ? "danger" : p === "P1" ? "warning" : p === "P2" ? "primary" : "info";
}

function isOverdue(dueDate: string): boolean {
  if (!dueDate) return false;
  const d = dayjs(dueDate);
  return d.isValid() && d.isBefore(dayjs().startOf("day"));
}

function levelLabel(l: OkrLevel): string {
  return t(`home.aiRecommend.level.${l}`);
}

function scoreTagType(score: number): "danger" | "warning" | "primary" | "info" {
  return score >= 60 ? "danger" : score >= 35 ? "warning" : score >= 15 ? "primary" : "info";
}

/** 技能 id → 展示标题（取 skills/constants.ts 的 title，未知则原样显示 id）。 */
function skillLabel(skillId: string): string {
  return skills.find(s => s.id === skillId)?.title ?? skillId;
}

/** MCP 服务器 → 标签色：github 蓝、yiai 绿、无需则灰。 */
function mcpTagType(mcp: string): "primary" | "success" | "info" {
  return mcp === "github" ? "primary" : mcp === "yiai" ? "success" : "info";
}

function mcpLabel(mcp: string): string {
  return mcp || "—";
}

function goRole(roleId: string) {
  if (roleId) router.push(`/executiver/okr/${roleId}`);
}

function goGoal(role: string, goalId: string) {
  if (goalId) router.push(`/executiver/okr/${role}?goal=${goalId}`);
}

// ── 知识库持久化 ─────────────────────────────
// 推荐任务落盘到 YiKnowledge/okr/task-<listType>-<NN>.md，
// 每个任务以扁平 frontmatter 携带自身指标数据（metric* 前缀）。

const KB_DIR = "okr";

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

function taskFileName(listType: OkrListType, index: number): string {
  return `${KB_DIR}/task-${listType}-${pad(index + 1)}.md`;
}

/** 从文件名推导稳定 id（task-daily-03.md → daily-03）。 */
function taskIdFromFileName(name: string): string {
  const m = name.match(/^task-(daily|weekly|risk|sprint)-(\d{2})\.md$/);
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
  const newPaths: string[] = [];
  let failed = false;
  for (let i = 0; i < state.items.length; i++) {
    const item = state.items[i];
    item.id = `${listType}-${pad(i + 1)}`;
    const path = taskFileName(listType, i);
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

/** 挂载时从 YiKnowledge/okr/ 加载已落盘的任务清单。 */
async function loadFromKnowledge() {
  try {
    const res = await scanKnowledge(KB_DIR);
    const files = (res.categories?.flatMap(c => c.files) ?? []).filter(f => f.meta?.type === "okr-task");
    const byList: Record<OkrListType, KnowledgeFileEntry[]> = { daily: [], weekly: [], risk: [], sprint: [] };
    for (const f of files) {
      const list = f.meta?.list;
      if (typeof list === "string" && list in byList) byList[list as OkrListType].push(f);
    }
    for (const l of LIST_TYPES) {
      const state = lists[l.key];
      const entries = byList[l.key].sort((a, b) => (taskIdFromFileName(a.name) < taskIdFromFileName(b.name) ? -1 : 1));
      state.items = entries
        .map(f => taskFromMeta(f.meta ?? {}, taskIdFromFileName(f.name)))
        .filter((x): x is OkrTaskItem => x !== null);
      state.filePaths = entries.map(f => f.path);
    }
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

function fillFallback(key: OkrListType) {
  const state = lists[key];
  state.items = fallbackRecommendation(key, roleScope.value);
  state.source = "fallback";
  state.generatedAt = dayjs().format("HH:mm:ss");
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

/** 手动调用：先即时刷新确定性兜底并落盘，再后台请求 AI，成功后把兜底升级为 AI 结果。 */
async function generateList(key: OkrListType) {
  const state = lists[key];
  const scope = roleScope.value;
  fillFallback(key);
  await persistList(key);
  if (state.loading) return;
  state.loading = true;
  try {
    const payload: ChatPayload = {
      model: DEFAULT_MODEL,
      system: OKR_SYSTEM_PROMPT,
      messages: [{ type: "user", message: buildUserPrompt(key, scope, buildHistory(key)), timestamp: Date.now() }]
    };
    const text = await chat(payload);
    if (roleScope.value !== scope) return; // 期间切换角色 → 丢弃过期结果
    const items = parseRecommendation(text, scope, key);
    if (items.length) {
      state.items = items;
      state.source = "ai";
      state.generatedAt = dayjs().format("HH:mm:ss");
      await persistList(key);
    }
  } catch {
    // 保留兜底结果
  } finally {
    if (roleScope.value === scope) state.loading = false;
  }
}

/** 手动生成全部清单（并发生成；单个失败不影响其余）。 */
async function generateAll() {
  await Promise.all(LIST_TYPES.map(l => generateList(l.key)));
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
.okr-rec__cell-role { font-size: 12px; cursor: pointer; transition: color 0.15s; &:hover { color: var(--el-color-primary); } }
.okr-rec__cell-goal { font-family: monospace; font-size: 11px; color: var(--el-color-primary); cursor: pointer; &:hover { text-decoration: underline; } }
.okr-rec__cell-none { color: var(--el-text-color-placeholder); }
.okr-rec__cell-effort {
  display: inline-block;
  width: 20px;
  height: 20px;
  line-height: 20px;
  text-align: center;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 700;
  &.is-S { color: var(--el-color-success); background: var(--el-color-success-light-9); }
  &.is-M { color: var(--el-color-primary); background: var(--el-color-primary-light-9); }
  &.is-L { color: var(--el-color-warning); background: var(--el-color-warning-light-9); }
}
.okr-rec__cell-due-overdue { color: var(--el-color-danger); font-weight: 700; }

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
.okr-rec__score-num,
.okr-rec__list-score,
.okr-rec__card-score {
  font-weight: 700;
  font-family: monospace;
  &.is-danger { color: var(--el-color-danger); }
  &.is-warning { color: var(--el-color-warning); }
  &.is-primary { color: var(--el-color-primary); }
  &.is-info { color: var(--el-color-info); }
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
.okr-rec__list-role { cursor: pointer; transition: color 0.15s; &:hover { color: var(--el-color-primary); } }
.okr-rec__list-goal { font-family: monospace; font-size: 11px; color: var(--el-color-primary); cursor: pointer; &:hover { text-decoration: underline; } }
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
