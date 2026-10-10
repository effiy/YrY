<template>
  <div class="reading-list-page">
    <!-- ═══════════════════════════════════════════════
         §1 Header · 标题栏 + 核心操作 + 快捷键契约
         ⌘N 新建  ⌘D 折叠仪表盘  ⌥K 聚焦搜索  ⌥1/2 视图切换（Card/Table，已移除 List）
    ═══════════════════════════════════════════════ -->
    <header class="rl-header rl-glass">
      <div class="rl-header__left">
        <h1 class="rl-header__title">
          <span class="rl-header__sticky">{{ stickyIcon }}</span>
          Reading List
          <span class="rl-header__version">v3.4 · Table-first</span>
          <span
            v-if="store.loading"
            class="rl-header__pill is-parsing"
            :title="'数据源加载中… ' + sourceKindLabel"
          >
            ⏳ {{ sourceKindLabel }}
          </span>
          <span
            v-else
            class="rl-header__pill"
            :class="[`is-${store.sourceKind}`]"
            :title="'当前命中数据源：' + sourceKindLabel"
          >
            📡 {{ sourceKindLabel }}
          </span>
        </h1>
        <p class="rl-header__desc">
          Curated reading pipeline — plan, track, and distill across 8 dimensions.
          RICE-scored, OKR-linked, with 7-state distillation SLA and LinkFactory 3-gate preview.
        </p>
      </div>
    </header>

    <!-- ═══════════════════════════════════════════════
         §2 KPI 条 · 4 核心指标（其余移至 Dashboard 面板避免重复扫描）
    ═══════════════════════════════════════════════ -->
    <section class="rl-kpi rl-glass" aria-label="KPI overview">
      <div class="rl-kpi__item">
        <div class="rl-kpi__label">📚 Total</div>
        <div class="rl-kpi__value">{{ stats.total }}</div>
      </div>
      <div class="rl-kpi__item">
        <div class="rl-kpi__label">📅 Reading</div>
        <div class="rl-kpi__value">
          {{ stats.inProgressCount }}
          <span class="rl-kpi__sub">· {{ stats.averageProgress }}%</span>
        </div>
      </div>
      <div class="rl-kpi__item">
        <div class="rl-kpi__label">✅ Shipped</div>
        <div class="rl-kpi__value">
          {{ stats.completedCount }}
          <span class="rl-kpi__sub">
            · {{ stats.total ? Math.round((stats.completedCount / stats.total) * 100) : 0 }}%
          </span>
        </div>
      </div>
      <div class="rl-kpi__item">
        <div class="rl-kpi__label">🎯 Avg RICE</div>
        <div class="rl-kpi__value">
          <span :class="riceScoreClass(stats.averageRice)">{{ stats.averageRice }}</span>
          <span class="rl-kpi__sub">· {{ riceTierLabel(stats.riceTier) }}</span>
        </div>
      </div>
      <div class="rl-kpi__item">
        <div class="rl-kpi__label">🧭 8-Dim Coverage</div>
        <div class="rl-kpi__value">
          <el-progress :percentage="stats.dimensionCoverage" :stroke-width="14" color="var(--rl-progress-primary)" :show-text="false" />
          <span class="rl-kpi__sub">{{ stats.dimensionCoverage }}% · {{ activeDimensionCount }}/{{ meta.dimensions.length }}</span>
        </div>
      </div>
    </section>

    <!-- ═══════════════════════════════════════════════
      过滤条（SSOT：status/priority/rice/role 宏观入口；Table 内搜索为细粒度 AND 叠加）
    ═══════════════════════════════════════════════ -->
    <section class="rl-filters rl-glass">
      <div class="rl-filters__row">
        <el-button :type="!query.status || query.status === 'all' ? 'primary' : 'default'" @click="onSetStatus('all')">
          📖 All <span class="rl-tag">{{ filteredBy({}).length }}</span>
        </el-button>
        <el-button :type="query.status === 'reading' ? 'primary' : 'default'" @click="onSetStatus('reading')">
          📅 Reading <span class="rl-tag">{{ stats.inProgressCount }}</span>
        </el-button>
        <el-button :type="query.status === 'done-group' ? 'primary' : 'default'" @click="onSetDoneGroup">
          ✅ Done <span class="rl-tag">{{ stats.completedCount }}</span>
        </el-button>
        <el-button :type="query.priority === 'high' ? 'primary' : 'default'" @click="onTogglePriority('high')">
          🔥 High <span class="rl-tag">{{ stats.priorities?.high ?? 0 }}</span>
        </el-button>
        <el-button :type="riceFilterTier === 'elite' ? 'primary' : 'default'" @click="toggleRiceFilter('elite')">
          🏆 RICE ≥80 <span class="rl-tag">{{ stats.riceByTier?.elite ?? 0 }}</span>
        </el-button>
      </div>

      <div class="rl-filters__row">
        <span class="rl-filters__group-title">👥 Role</span>
        <button
          v-for="r in meta.roles"
          :key="r.id"
          type="button"
          class="rl-chip"
          :class="[`is-${r.id}`, { 'is-active': query.role === r.id }]"
          :style="{ '--rl-chip-color': r.color }"
          @click="onToggleRole(r.id)"
        >
          {{ r.icon }} {{ r.label }}
          <span class="rl-chip__count">{{ stats.roles?.[r.id] ?? 0 }}</span>
        </button>
      </div>
    </section>

    <!-- ═══════════════════════════════════════════════
         §5 Views · Card / Table（⌥1 / ⌥2；List 视图已移除，合并能力到增强 Table）
    ═══════════════════════════════════════════════ -->
    <section class="rl-view rl-glass">
      <header class="rl-view__header">
        <h2>📖 Reading Items · {{ currentViewLabel }}</h2>
        <div class="rl-view__actions">
          <span class="rl-view__summary">{{ visibleItems.length }} items</span>
          <el-radio-group
            v-model="viewMode"
            size="small"
            @change="(val: string | number | boolean | undefined) => onViewModeCmd(String(val ?? 'table') as 'card' | 'table')"
          >
            <el-radio-button label="card">Card · ⌥1</el-radio-button>
            <el-radio-button label="table">Table · ⌥2</el-radio-button>
          </el-radio-group>
          <el-input
            ref="searchInputRef"
            v-model="query.keyword"
            placeholder="Search · ⌥K"
            clearable
            size="small"
            class="rl-view__search"
            :prefix-icon="Search"
          />
        </div>
      </header>

      <!-- 5.1 Card View -->
      <div v-if="viewMode === 'card'" class="rl-cards">
        <article
          v-for="row in visibleItems"
          :key="rowKeyOf(row)"
          class="rl-card-item"
          :class="[
            `is-${row.priority ?? 'medium'}-prio`,
            `is-${row.status ?? 'queued'}`,
            { 'is-failed': isRowFailed(row) }
          ]"
        >
          <header class="rl-card-item__header">
            <span class="rl-card-item__key">{{ row.key }}</span>
            <el-tag :type="typeTagType(row.type)" size="small" effect="light">
              {{ typeIcon(row.type) }} {{ resolveTypeLabel(row.type) }}
            </el-tag>
            <el-tag :type="priorityTagType(row.priority)" size="small" effect="dark">
              {{ resolvePriorityLabel(row.priority) }}
            </el-tag>
            <span class="rl-rice-pill" :class="riceScoreClass(row.rice?.final ?? 0)">RICE {{ row.rice?.final ?? 0 }}</span>
          </header>
          <h3 class="rl-card-item__title" @click="openItem(row)">
            {{ row.title }}
            <span v-if="row.subtitle" class="rl-card-item__subtitle">— {{ row.subtitle }}</span>
            <ReadingLinkTag :row="row" />
          </h3>
          <div class="rl-card-item__meta">
            <span>✍ {{ row.author ?? "—" }}</span>
            <span>🧭 {{ resolveDimensionLabel(row.dimension) }}</span>
            <span>👔 {{ resolveRoleLabel(row.ownerRole) }}</span>
            <span v-if="row.scheduledMonth">📅 {{ row.scheduledMonth }}</span>
            <span v-if="row.okrId">🎯 {{ row.okrId }}</span>
          </div>
          <footer class="rl-card-item__footer">
            <el-progress :percentage="effectiveProgress(row)" :stroke-width="8" :status="progressStatus(row)" />
            <RowActions :row="row" variant="card" />
          </footer>
        </article>
        <EmptyState v-if="!visibleItems.length" />
      </div>

      <!-- 5.2 Table View（增强：分页 + 搜索 + 列设置 + 16 列 + 排序 + 悬浮 tooltip） -->
      <ProTable
        v-else
        ref="proTable"
        class="rl-table-enhance"
        row-key="key"
        :columns="columns"
        :request-api="tableFetch"
        :init-param="tableInitParam"
        :data-callback="tableTransform"
        :page-show="true"
        :search-show="true"
        :search-menu-icon="false"
        :auto-height="false"
        table-layout="fixed"
        border
        stripe
      >
        <template #title="{ row }">
          <div class="rl-table__title-cell" :class="{ 'is-failed': isRowFailed(row) }">
            <el-tooltip
              v-if="row.summary || row.subtitle || row.tags?.length"
              placement="top"
              :show-after="300"
            >
              <template #content>
                <div class="rl-tooltip">
                  <div v-if="row.subtitle" class="rl-tooltip__subtitle">{{ row.subtitle }}</div>
                  <div v-if="row.summary" class="rl-tooltip__summary">{{ row.summary }}</div>
                  <div v-if="row.tags?.length" class="rl-tooltip__tags">
                    <el-tag v-for="t in row.tags" :key="t" size="small" effect="plain" style="margin-right:4px">{{ t }}</el-tag>
                  </div>
                </div>
              </template>
              <a class="rl-table__title" @click="openItem(row)">
                {{ row.title }}
                <span v-if="row.subtitle" class="rl-table__subtitle">· {{ row.subtitle }}</span>
              </a>
            </el-tooltip>
            <a v-else class="rl-table__title" @click="openItem(row)">
              {{ row.title }}
              <span v-if="row.subtitle" class="rl-table__subtitle">· {{ row.subtitle }}</span>
            </a>
            <ReadingLinkTag :row="row" size="sm" text="笔记" />
          </div>
        </template>
        <template #operation="{ row }">
          <RowActions :row="row" variant="table" />
        </template>
      </ProTable>
    </section>

    <!-- ═══════════════════════════════════════════════
         §6 Edit / Create Dialog
    ═══════════════════════════════════════════════ -->
    <el-dialog
      v-model="dialogVisible"
      :title="form.id ? 'Edit Reading Item' : 'New Reading Item'"
      width="720px"
      class="reading-list__dialog"
    >
      <el-form ref="formRef" :model="form" :rules="formRules" label-width="120px">
        <el-form-item label="Title" prop="title">
          <el-input v-model="form.title" placeholder="书名 / 论文 / 文章标题" />
        </el-form-item>
        <el-form-item label="Subtitle">
          <el-input v-model="form.subtitle" placeholder="英文副标题 / 简称" />
        </el-form-item>
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="Author" prop="author">
              <el-input v-model="form.author" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="Type" prop="type">
              <el-select v-model="form.type" class="is-wide">
                <el-option v-for="t in meta.types" :key="t.id" :value="t.id" :label="`${t.icon} ${t.label}`" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="Dimension" prop="dimension">
              <el-select v-model="form.dimension" class="is-wide">
                <el-option v-for="d in meta.dimensions" :key="d.id" :value="d.id" :label="`${d.icon} ${d.label} ${d.en}`" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="Owner Role" prop="ownerRole">
              <el-select v-model="form.ownerRole" class="is-wide">
                <el-option v-for="r in meta.roles" :key="r.id" :value="r.id" :label="`${r.icon} ${r.label}`" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="16">
          <el-col :span="8">
            <el-form-item label="Priority" prop="priority">
              <el-select v-model="form.priority" class="is-wide">
                <el-option v-for="p in meta.priorities" :key="p.id" :value="p.id" :label="p.label" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="Status" prop="status">
              <el-select v-model="form.status" class="is-wide">
                <el-option v-for="s in meta.statuses" :key="s.id" :value="s.id" :label="s.label" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="Progress %">
              <el-slider v-model="form.progress" :min="0" :max="100" :step="1" show-input />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="RICE Final">
              <el-slider v-model="form.riceFinal" :min="0" :max="100" :step="1" show-input />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="Scheduled Month">
              <el-date-picker
                v-model="form.scheduledMonth"
                type="month"
                value-format="YYYY-MM"
                placeholder="Pick a month"
                class="is-wide"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-collapse>
          <el-collapse-item title="RICE 四元组（自动同步 Final；任意修改 4 字段 → Final，修改 Final → 反推 4 字段）" name="rice">
            <el-row :gutter="16">
              <el-col :span="6">
                <el-form-item label="Reach" prop="reach">
                  <el-input-number v-model="form.reach" :min="0" :max="100" :step="1" controls-position="right" style="width: 100%" />
                </el-form-item>
              </el-col>
              <el-col :span="6">
                <el-form-item label="Impact" prop="impact">
                  <el-input-number v-model="form.impact" :min="0" :max="100" :step="1" controls-position="right" style="width: 100%" />
                </el-form-item>
              </el-col>
              <el-col :span="6">
                <el-form-item label="Confidence" prop="confidence">
                  <el-input-number v-model="form.confidence" :min="0" :max="100" :step="1" controls-position="right" style="width: 100%" />
                </el-form-item>
              </el-col>
              <el-col :span="6">
                <el-form-item label="Effort" prop="effort">
                  <el-input-number v-model="form.effort" :min="1" :max="100" :step="1" controls-position="right" style="width: 100%" />
                  <div class="rl-form-hint">Effort 越低 → RICE 越高</div>
                </el-form-item>
              </el-col>
            </el-row>
          </el-collapse-item>
          <el-collapse-item title="Link / OKR / Tags · Summary（可选，用于预览 & 可追溯）" name="advanced">
            <el-form-item label="OKR id">
              <el-input v-model="form.okrId" placeholder="e.g. exec-002-03" />
            </el-form-item>
            <el-form-item label="Note Key (KB)">
              <el-input v-model="form.noteKey" placeholder="executive/reading-list/010-阅读-读书笔记-卓有成效的管理者" />
            </el-form-item>
            <el-form-item label="External URL">
              <el-input v-model="form.externalUrl" placeholder="可选：外部 PDF / URL" />
            </el-form-item>
            <el-form-item label="Tags">
              <el-select v-model="form.tags" multiple filterable allow-create default-first-option class="is-wide" />
            </el-form-item>
            <el-form-item label="Summary">
              <el-input v-model="form.summary" type="textarea" :rows="2" placeholder="一句话 So-What（行动收益 / 决策价值）" />
            </el-form-item>
          </el-collapse-item>
        </el-collapse>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">Cancel</el-button>
        <el-button type="primary" :loading="saving" @click="saveForm">
          {{ saving ? "Saving…" : "Save" }}
        </el-button>
      </template>
    </el-dialog>

    <!-- ═══════════════════════════════════════════════
         §7 Knowledge Preview Dialog (SSOT — 统一弹框)
    ═══════════════════════════════════════════════ -->
    <KnowledgePreviewDialog ref="kbPreviewRef" @closed="kbPreviewPath = ''" />
  </div>
</template>

<script setup lang="ts" name="readingList">
/* ─────────────── 0. 顶层依赖 ─────────────── */
import { Search } from "@element-plus/icons-vue";
import {
  ElButton,
  ElMessage,
  ElMessageBox,
  ElProgress,
  ElTag,
  ElTooltip
} from "element-plus";
import type { FormInstance, FormRules } from "element-plus";
import {
  computed,
  defineComponent,
  h,
  onBeforeUnmount,
  onMounted,
  reactive,
  ref,
  watch,
  nextTick,
  type VNode
} from "vue";
import { useRouter } from "vue-router";

import ProTable from "@/components/ProTable/index.vue";
import type { ColumnProps, ProTableInstance } from "@/components/ProTable/interface";
import KnowledgePreviewDialog from "@/components/KnowledgePreviewDialog/KnowledgePreviewDialog.vue";
import EmptyState from "@/components/EmptyState/EmptyState.vue";

import {
  READING_META,
  computeRiceFinal,
  riceTierOf,
  type ReadingAggregateStats,
  type ReadingDimension,
  type ReadingItem,
  type ReadingListQuery,
  type ReadingPriority,
  type ReadingRole,
  type ReadingStatus,
  type ReadingType,
  type RICETier,
  type RICEScore
} from "@/api/modules/readingListService";

import { useReadingListKnowledgeSource } from "./composables/useReadingListKnowledgeSource";

import {
  gateBEntityExists,
  gateCPostNavigate,
  resolveLink,
  type ResolveLinkInput
} from "@/utils/linkFactory";
import { pushReliabilityEvent } from "@/utils/reliability/reliabilityMetrics";
import { useCommandPalette } from "@/composables/useCommandPalette";

const router = useRouter();
const palette = useCommandPalette();

/* ─────────────── 1. 共享元数据 / 辅助 ─────────────── */
function makeRice(final: number | undefined | null) {
  const f = Math.max(0, Math.min(100, Number.isFinite(final as number) ? (final as number) : 70));
  return { reach: f, impact: f, confidence: Math.min(100, f + 5), effort: Math.max(20, 100 - (f >> 1)), final: f };
}

const DONE_GROUP_SET: ReadonlySet<ReadingStatus> = new Set<ReadingStatus>(["distilled", "reviewed", "archived"]);
const PRIORITY_ORDER: Record<ReadingPriority, number> = { high: 0, medium: 1, low: 2 };

const store = useReadingListKnowledgeSource({ timeoutMs: 12_000, allowFallback: true });
const meta = READING_META;
const metaMap = {
  type: Object.fromEntries(meta.types.map(t => [t.id, t.label])) as Record<ReadingType, string>,
  priority: Object.fromEntries(meta.priorities.map(p => [p.id, p.label])) as Record<ReadingPriority, string>,
  status: Object.fromEntries(meta.statuses.map(s => [s.id, s.label])) as Record<ReadingStatus, string>,
  dimension: Object.fromEntries(meta.dimensions.map(d => [d.id, `${d.label} ${d.en}`])) as Record<ReadingDimension, string>,
  role: Object.fromEntries(meta.roles.map(r => [r.id, r.label])) as Record<ReadingRole, string>
};
const dimensionColor = Object.fromEntries(meta.dimensions.map(d => [d.id, d.color])) as Record<ReadingDimension, string>;
const roleColor = Object.fromEntries(meta.roles.map(r => [r.id, r.color])) as Record<ReadingRole, string>;
const roleIcon = Object.fromEntries(meta.roles.map(r => [r.id, r.icon])) as Record<ReadingRole, string>;
const dimIcon = Object.fromEntries(meta.dimensions.map(d => [d.id, d.icon])) as Record<ReadingDimension, string>;

/* 统一的 label 解析，封装「fallback key + metaMap 默认兜底」双保险 */
function resolveTypeLabel(t?: ReadingType) { return metaMap.type[t ?? "book"] ?? metaMap.type.book; }
function resolvePriorityLabel(p?: ReadingPriority) { return metaMap.priority[p ?? "medium"] ?? metaMap.priority.medium; }
function resolveStatusLabel(s?: ReadingStatus) { return metaMap.status[s ?? "queued"] ?? metaMap.status.queued; }
function resolveDimensionLabel(d?: ReadingDimension) { return metaMap.dimension[d ?? "management"] ?? metaMap.dimension.management; }
function resolveRoleLabel(r?: ReadingRole) { return metaMap.role[r ?? "ceo"] ?? metaMap.role.ceo; }

function rowKeyOf(row: ReadingItem): string { return row.key ?? row._id ?? String(row.title || ""); }

/* Age 热度分级 */
function ageHeatClass(ts?: string): "heat-fresh" | "heat-mid" | "heat-stale" {
  if (!ts) return "heat-stale";
  try {
    const days = (Date.now() - new Date(ts).getTime()) / 86400000;
    if (days < 7) return "heat-fresh";
    if (days < 30) return "heat-mid";
    return "heat-stale";
  } catch { return "heat-stale"; }
}
function ageHeatLabel(ts?: string) {
  const c = ageHeatClass(ts);
  return c === "heat-fresh" ? "Fresh" : c === "heat-mid" ? "Mid" : "Stale";
}
function ageHeatTagType(ts?: string): "success" | "warning" | "info" {
  const c = ageHeatClass(ts);
  return c === "heat-fresh" ? "success" : c === "heat-mid" ? "warning" : "info";
}
function daysUntilMonthLabel(monthRaw?: string) {
  if (!monthRaw) return "未排期";
  const m = String(monthRaw).match(/^(\d{4})-(\d{2})$/);
  if (!m) return "未排期";
  const d = new Date(Number(m[1]), Number(m[2]) - 1, 1);
  const diff = Math.ceil((d.getTime() - Date.now()) / 86400000);
  return diff < 0 ? `已过 ${-diff}d` : `${diff}d 后`;
}

/* ─────────────── 2. UI state + Query ─────────────── */
const stickyIcon = "📚";
const viewMode = ref<"card" | "table">("table");
const riceFilterTier = ref<RICETier | "">("");

const query = reactive({
  keyword: "",
  status: "all" as ReadingStatus | "all" | "done-group",
  type: "all" as ReadingType | "all",
  priority: "all" as ReadingPriority | "all",
  dimension: "all" as ReadingDimension | "all",
  role: "all" as ReadingRole | "all",
  scheduledMonth: undefined as string | undefined
});

const kbPreviewRef = ref<InstanceType<typeof KnowledgePreviewDialog> | null>(null);
const kbPreviewPath = ref("");
const searchInputRef = ref<any>(null);
const proTable = ref<ProTableInstance>();

const dialogVisible = ref(false);
const saving = ref(false);
const formRef = ref<FormInstance>();

/* 排序状态（ProTable 端内排序时更新） */
const sortState = ref<{ key: string; order: "asc" | "desc" | null }>({ key: "", order: null });

/* ─────────────── 3. 表单模型 + 复用载荷 ─────────────── */
interface ReadingFormModel {
  id?: string;
  title: string; subtitle: string; author: string;
  type: ReadingType; dimension: ReadingDimension; ownerRole: ReadingRole;
  priority: ReadingPriority; status: ReadingStatus;
  progress: number;
  reach: number; impact: number; confidence: number; effort: number; riceFinal: number;
  scheduledMonth?: string;
  okrId: string; noteKey: string; externalUrl: string; tags: string[]; summary: string;
}
type ReadingFormPayload = Omit<ReadingFormModel, "id"> & { rice: RICEScore };

function buildEmptyForm(): ReadingFormModel {
  const base = makeRice(70);
  return {
    title: "", subtitle: "", author: "",
    type: "book", dimension: "management", ownerRole: "ceo",
    priority: "medium", status: "queued", progress: 0,
    reach: base.reach, impact: base.impact, confidence: base.confidence, effort: base.effort, riceFinal: base.final,
    scheduledMonth: undefined, okrId: "", noteKey: "", externalUrl: "", tags: [], summary: ""
  };
}

const form = reactive<ReadingFormModel>(buildEmptyForm());

/* RICE 双向同步 —— 四元组 ↔ Final 共用 guard，去 4 次循环 watch 冗余 */
const riceEditGuard = ref(false);
function recomputeRiceFinalFromFour() {
  const v = computeRiceFinal({ reach: form.reach, impact: form.impact, confidence: form.confidence, effort: form.effort, final: form.riceFinal });
  if (Number.isFinite(v)) form.riceFinal = Math.max(0, Math.min(100, Math.round(v)));
}
watch(
  [() => form.reach, () => form.impact, () => form.confidence, () => form.effort],
  () => {
    if (riceEditGuard.value) return;
    try { riceEditGuard.value = true; recomputeRiceFinalFromFour(); }
    finally { riceEditGuard.value = false; }
  }
);
watch(
  () => form.riceFinal,
  nv => {
    if (riceEditGuard.value) return;
    try {
      riceEditGuard.value = true;
      const r = makeRice(nv);
      form.reach = r.reach; form.impact = r.impact; form.confidence = r.confidence; form.effort = r.effort;
    } finally { riceEditGuard.value = false; }
  }
);

const formRules: FormRules = {
  title: [{ required: true, message: "请输入标题", trigger: "blur" }],
  type: [{ required: true, message: "请选择 Type", trigger: "change" }],
  dimension: [{ required: true, message: "请选择维度", trigger: "change" }],
  ownerRole: [{ required: true, message: "请选择 Owner Role", trigger: "change" }],
  priority: [{ required: true, message: "请选择优先级", trigger: "change" }],
  status: [{ required: true, message: "请选择状态", trigger: "change" }]
};

/* ─────────────── 4. 派生计算 ─────────────── */
const stats = computed<ReadingAggregateStats>(() => store.stats as unknown as ReadingAggregateStats);

const sourceKindLabel = computed(() => {
  const k = store.sourceKind as unknown as string;
  if (k === "backend") return "Live DB";
  if (k === "cache") return "Local";
  if (k === "kb") return "KB Files";
  return "Seed";
});

const activeDimensionCount = computed(
  () => meta.dimensions.reduce((acc, d) => acc + ((stats.value.dimensions?.[d.id] ?? 0) > 0 ? 1 : 0), 0)
);
const currentViewLabel = computed(() => (viewMode.value === "table" ? "Table" : "Card"));

/* 过滤：done-group 与 tier 统一后置；ProTable searchParam 作为 AND 叠加 */
function filteredBy(override: Partial<ReadingListQuery> & Record<string, any> = {}): ReadingItem[] {
  /* 从 ProTable searchParam 传入的字段只做 AND 叠加，不覆盖全局 SSOT query */
  const tableOverrides: Partial<ReadingListQuery> = {};
  if (override.title || override.author || override.type || override.status ||
      override.priority || override.dimension || override.ownerRole || override.scheduledMonth) {
    if (override.title) tableOverrides.keyword = override.title;
    if (override.author) tableOverrides.keyword = (tableOverrides.keyword ?? "") + ` ${override.author}`;
    if (override.type && override.type !== "all") tableOverrides.type = override.type;
    if (override.status && override.status !== "all") tableOverrides.status = override.status;
    if (override.priority && override.priority !== "all") tableOverrides.priority = override.priority;
    if (override.dimension && override.dimension !== "all") tableOverrides.dimension = override.dimension;
    if (override.ownerRole && override.ownerRole !== "all") tableOverrides.role = override.ownerRole;
    if (override.scheduledMonth) tableOverrides.scheduledMonth = override.scheduledMonth;
  }

  const q: ReadingListQuery = {
    ...query,
    ...tableOverrides,
    keyword: [query.keyword, tableOverrides.keyword].filter(Boolean).join(" ").trim() || undefined
  } as ReadingListQuery;
  const wantDoneGroup = (q.status as unknown as string) === "done-group";
  if (wantDoneGroup) (q.status as unknown as string) = "all";

  let list = store.filter(q);
  if (wantDoneGroup) list = list.filter(it => DONE_GROUP_SET.has(it.status));
  if (riceFilterTier.value !== "") list = list.filter(it => riceTierOf(it.rice?.final ?? 0) === riceFilterTier.value);
  return list;
}
const visibleItems = computed<ReadingItem[]>(() => filteredBy({}));

/* ─────────────── 5. ProTable 列定义（16 列，增强版）─────────────── */
/* RICE 四小方块 mini-heatmap + final 数字 */
function renderRiceCell(scope: { row: ReadingItem }): VNode {
  const r = scope.row.rice;
  const finalScore = r?.final ?? 0;
  const reach = r?.reach ?? 50;
  const impact = r?.impact ?? 50;
  const confidence = r?.confidence ?? 50;
  const effort = r?.effort ?? 50;
  const items: Array<{ key: "reach" | "impact" | "confidence" | "effort"; label: string; value: number }> = [
    { key: "reach", label: "R", value: reach },
    { key: "impact", label: "I", value: impact },
    { key: "confidence", label: "C", value: confidence },
    { key: "effort", label: "E", value: effort }
  ];
  return h(
    "div",
    { class: ["rl-rice-cell", riceScoreClass(finalScore)] },
    [
      h("span", { class: "rl-rice-cell__final" }, finalScore || "—"),
      h(
        "div",
        { class: "rl-rice-mini", title: `R=${reach} I=${impact} C=${confidence} E=${effort}` },
        items.map(it => h(
          "span",
          {
            class: `rl-rice-mini__${it.key}`,
            style: { opacity: 0.35 + Math.max(0, Math.min(100, it.value)) / 154 }
          },
          it.label
        ))
      )
    ]
  );
}

function renderProgressCell(scope: { row: ReadingItem }): VNode {
  const row = scope.row;
  const p = effectiveProgress(row);
  return h(ElProgress, { percentage: p, strokeWidth: 8, status: progressStatus(row) });
}

function renderStatusCell(scope: { row: ReadingItem }): VNode {
  const row = scope.row;
  const p = effectiveProgress(row);
  return h("div", { class: "rl-status-cell" }, [
    h(ElTag, { type: statusTagType(row.status), size: "small", effect: "dark" }, { default: () => resolveStatusLabel(row.status) }),
    h("div", { class: "rl-status-cell__mini-bar", title: `进度 ${p}%` }, [
      h("span", { class: "rl-status-cell__mini-bar-fill", style: { width: `${p}%` } })
    ])
  ]);
}

function renderDimensionCell(scope: { row: ReadingItem }): VNode {
  const id = scope.row.dimension ?? "management";
  const color = dimensionColor[id] ?? dimensionColor.management;
  return h("div", { class: "rl-dim-chip" }, [
    h("span", { class: "rl-dim-chip__bar", style: { background: color } }),
    h("span", { class: "rl-dim-chip__icon" }, dimIcon[id]),
    h("span", { class: "rl-dim-chip__label" }, resolveDimensionLabel(id))
  ]);
}

function renderRoleCell(scope: { row: ReadingItem }): VNode {
  const id = scope.row.ownerRole ?? "ceo";
  const color = roleColor[id] ?? roleColor.ceo;
  return h("div", { class: "rl-role-chip" }, [
    h("span", { class: "rl-role-chip__dot", style: { background: color } }, roleIcon[id] ?? "👔"),
    h("span", { class: "rl-role-chip__label" }, resolveRoleLabel(id))
  ]);
}

function renderPriorityCell(scope: { row: ReadingItem }): VNode {
  return h(ElTag, {
    type: priorityTagType(scope.row.priority),
    effect: "dark",
    size: "small"
  }, { default: () => resolvePriorityLabel(scope.row.priority) });
}

function renderOkrsCell(scope: { row: ReadingItem }): VNode | string {
  const id = scope.row.okrId;
  if (!id) return "—";
  return h(
    "a",
    {
      class: "rl-okr-link",
      title: `跳转 OKR 锚点：${id}`,
      onClick: (e: Event) => { e.preventDefault(); openAnchor(id); }
    },
    `🎯 ${id}`
  );
}

function renderTagsCell(scope: { row: ReadingItem }): VNode | string {
  const tags = scope.row.tags ?? [];
  if (!tags.length) return "—";
  const visible = tags.slice(0, 2);
  const rest = tags.length - visible.length;
  const fullList = h(
    "div",
    { class: "rl-tags-tooltip" },
    tags.map(t => h(ElTag, { key: t, size: "small", style: "margin-right:4px;margin-bottom:4px" }, { default: () => t }))
  );
  return h(ElTooltip, { placement: "top", showAfter: 200 }, {
    default: () => h("div", { class: "rl-tags-row", style: "display:flex;flex-wrap:wrap;gap:4px" }, [
      ...visible.map(t => h(ElTag, { key: t, size: "small", effect: "light", type: "info" }, { default: () => t })),
      ...(rest > 0 ? [h(ElTag, { key: "__rest", size: "small", type: "primary", effect: "plain" }, { default: () => `+${rest}` })] : [])
    ]),
    content: () => fullList
  });
}

function renderScheduledCell(scope: { row: ReadingItem }): VNode {
  const m = scope.row.scheduledMonth;
  return h(ElTooltip, { placement: "top", showAfter: 300, content: `排期窗口：${daysUntilMonthLabel(m)}` }, {
    default: () => h("span", { class: "rl-scheduled" }, m ?? "—")
  });
}

function renderUpdatedCell(scope: { row: ReadingItem }): VNode {
  const ts = scope.row.updatedAt;
  return h("div", { class: "rl-updated-cell" }, [
    h("span", { class: "rl-updated-cell__date" }, formatUpdatedAt(ts)),
    h(
      ElTag,
      { size: "small", type: ageHeatTagType(ts), effect: "dark", class: `is-${ageHeatClass(ts)}` },
      { default: () => ageHeatLabel(ts) }
    )
  ]);
}

const columns = computed<ColumnProps<ReadingItem>[]>(() => ([
  { type: "index", label: "#", width: 56, fixed: "left", isSetting: true },
  { prop: "key", label: "Key", width: 84, showOverflowTooltip: true, isSetting: true },
  {
    prop: "title", label: "Title", minWidth: 300, showOverflowTooltip: true, isSetting: false,
    search: { el: "input", label: "Title / 关键词", span: 2, order: 1 }
  },
  {
    prop: "author", label: "Author", width: 120, showOverflowTooltip: true, isSetting: true,
    search: { el: "input", label: "Author", order: 2 }
  },
  {
    prop: "type", label: "Type", width: 90, tag: true, isSetting: true,
    enum: meta.types.map(t => ({ value: t.id, label: t.label, tagType: typeTagType(t.id) })),
    search: { el: "select", label: "Type", order: 3 }
  },
  {
    prop: "status", label: "Status", width: 140, isSetting: true, sortable: true,
    render: renderStatusCell,
    enum: meta.statuses.map(s => ({ value: s.id, label: s.label, tagType: statusTagType(s.id) })),
    search: { el: "select", label: "Status", order: 4 }
  },
  {
    prop: "priority", label: "Priority", width: 90, isSetting: true, sortable: true,
    render: renderPriorityCell,
    enum: meta.priorities.map(p => ({ value: p.id, label: p.label, tagType: priorityTagType(p.id) })),
    search: { el: "select", label: "Priority", order: 5 }
  },
  {
    prop: "dimension", label: "Dimension", width: 150, isSetting: true, sortable: true,
    render: renderDimensionCell,
    enum: meta.dimensions.map(d => ({ value: d.id, label: `${d.icon} ${d.label} ${d.en}` })),
    search: { el: "select", label: "Dimension", order: 6 }
  },
  {
    prop: "ownerRole", label: "Owner", width: 150, isSetting: true, sortable: true,
    render: renderRoleCell,
    enum: meta.roles.map(r => ({ value: r.id, label: `${r.icon} ${r.label}` })),
    search: { el: "select", label: "Owner Role", order: 7 }
  },
  {
    prop: "rice", label: "RICE", width: 150, isSetting: true, sortable: true,
    sortMethod: (a: any, b: any) => (a?.rice?.final ?? 0) - (b?.rice?.final ?? 0),
    render: renderRiceCell
  },
  {
    prop: "progress", label: "Progress", width: 160, isSetting: true, sortable: true,
    sortMethod: (a: any, b: any) => effectiveProgress(a) - effectiveProgress(b),
    render: renderProgressCell
  },
  {
    prop: "okrId", label: "OKR", width: 130, isSetting: true, sortable: true,
    search: { el: "input", label: "OKR id", order: 8 },
    render: renderOkrsCell
  },
  {
    prop: "scheduledMonth", label: "Scheduled", width: 120, isSetting: true, sortable: true,
    search: { el: "date-picker", label: "Scheduled Month", props: { type: "month", valueFormat: "YYYY-MM" }, order: 9 },
    render: renderScheduledCell
  },
  {
    prop: "tags", label: "Tags", width: 150, isSetting: true,
    search: { el: "input", label: "Tags", order: 10 },
    render: renderTagsCell
  },
  {
    prop: "updatedAt", label: "Updated · Heat", width: 150, isSetting: true, sortable: true,
    sortMethod: (a: any, b: any) => (a?.updatedAt ? new Date(a.updatedAt).getTime() : 0) - (b?.updatedAt ? new Date(b.updatedAt).getTime() : 0),
    render: renderUpdatedCell
  },
  { prop: "operation", label: "Actions", width: 180, fixed: "right", isSetting: false }
]));

/* ProTable fetch：合并 searchParam + 全局 query → 排序 → 分页切片（前端分页）
 * ⚠️ useTable 传参是扁平结构：{ pageNum, pageSize, title, author, type, status, priority, dimension, ownerRole, okrId, scheduledMonth, tags, ...(initParam 浅拷贝) }
 *    旧代码把搜索字段误读为 params.searchParam 子对象（仅 mock useTable 才会包一层），导致 ProTable 搜索表单永远空过滤。*/
function tableFetch(params: Record<string, any>) {
  const { pageNum = 1, pageSize = 20 } = params ?? {};
  /* 1) ProTable 表内搜索表单字段集合（与 columns[*].search 定义严格对齐），从扁平 params 中
   *    一次性提取构造「等效 searchParam」，其余查询参数一律视为后端分页/排序噪声。 */
  const TABLE_SEARCH_KEYS = [
    "title",
    "author",
    "type",
    "status",
    "priority",
    "dimension",
    "ownerRole",
    "scheduledMonth",
    "okrId",
    "tags"
  ] as const;
  const rawSearch: Record<string, any> = {};
  for (const k of TABLE_SEARCH_KEYS) {
    const v = (params as any)?.[k];
    if (v !== undefined && v !== null) rawSearch[k] = v;
  }
  // 兼容旧形态（外部 composable/单测若嵌套 searchParam 仍生效）
  const legacy = (params as any)?.searchParam ?? {};
  const mergedSearch: Record<string, any> = { ...legacy, ...rawSearch };

  /* 2) 空值归一化：空串/"all"/空白 → 丢掉，避免误伤过滤。 */
  const cleaned: Record<string, any> = {};
  for (const k of Object.keys(mergedSearch)) {
    const raw = mergedSearch[k];
    if (raw === undefined || raw === null) continue;
    if (typeof raw === "string") {
      const v = raw.trim();
      if (!v || v === "all") continue;
      cleaned[k] = v;
    } else if (typeof raw === "boolean" || typeof raw === "number") {
      cleaned[k] = raw;
    } else if (Array.isArray(raw) && raw.length) {
      cleaned[k] = raw;
    } else if (typeof raw === "object" && raw) {
      cleaned[k] = raw;
    }
  }
  /* 3) 全局 SSOT query + 表内 searchParam（AND 叠加）。 */
  const q = query.keyword ? { ...cleaned, keyword: query.keyword } : cleaned;
  let list = filteredBy(q);

  /* Tags 列搜索：简单包含匹配。 */
  if (cleaned.tags) {
    const qTag = String(cleaned.tags).toLowerCase().trim();
    if (qTag) {
      list = list.filter(it => (it.tags ?? []).some(t => t.toLowerCase().includes(qTag)) ||
        it.title.toLowerCase().includes(qTag));
    }
  }
  /* OKR 列搜索：id 子串匹配。 */
  if (cleaned.okrId) {
    const qOkr = String(cleaned.okrId).toLowerCase().trim();
    if (qOkr) list = list.filter(it => (it.okrId ?? "").toLowerCase().includes(qOkr));
  }

  /* 3) 排序：显式列头 > 默认综合（Priority → RICE desc → UpdatedAt desc）。 */
  if (sortState.value.key && sortState.value.order) {
    const dir = (sortState.value.order as unknown as string) === "ascending" || sortState.value.order === "asc" ? 1 : -1;
    const k = sortState.value.key;
    list = list.slice().sort((a: any, b: any) => {
      let va = k === "rice" ? (a?.rice?.final ?? 0) : k === "progress" ? effectiveProgress(a) : a?.[k];
      let vb = k === "rice" ? (b?.rice?.final ?? 0) : k === "progress" ? effectiveProgress(b) : b?.[k];
      if (typeof va === "string") va = va.toLowerCase();
      if (typeof vb === "string") vb = vb.toLowerCase();
      if (va === vb) return 0;
      return (va > vb ? 1 : -1) * dir;
    });
  } else {
    list = list.slice().sort((a, b) => {
      const pa = PRIORITY_ORDER[a.priority ?? "medium"] ?? 1;
      const pb = PRIORITY_ORDER[b.priority ?? "medium"] ?? 1;
      if (pa !== pb) return pa - pb;
      const ra = a.rice?.final ?? 0;
      const rb = b.rice?.final ?? 0;
      if (ra !== rb) return rb - ra;
      const ua = a.updatedAt ? new Date(a.updatedAt).getTime() : 0;
      const ub = b.updatedAt ? new Date(b.updatedAt).getTime() : 0;
      return ub - ua;
    });
  }

  /* 4) 前端分页切片。 */
  const total = list.length;
  const start = (Number(pageNum) - 1) * Number(pageSize);
  const paged = list.slice(start, start + Number(pageSize));
  /* ProTable useTable 会做 let { data } = await api(...)，必须外层包 data。 */
  return Promise.resolve({ data: { result: paged, total } });
}
const tableInitParam = computed(() => ({ ...query }));
function tableTransform(res: any) {
  /* res 是上面解构出来的 data 内部：{ result, total }；兜底空以防竞态。 */
  const list = Array.isArray(res?.result) ? res.result : [];
  const total = Number.isFinite(res?.total) ? res.total : list.length;
  return { list, total };
}

/* ─────────────── 6. 通用 Helper（保持 SSOT）─────────────── */
function typeTagType(t?: ReadingType): "warning" | "primary" | "info" {
  if (t === "article") return "warning";
  if (t === "book") return "primary";
  return "info";
}
function priorityTagType(p?: ReadingPriority): "danger" | "warning" | "info" {
  if (p === "high") return "danger";
  if (p === "medium") return "warning";
  return "info";
}
function statusTagType(s?: ReadingStatus): "success" | "warning" | "info" | "primary" {
  switch (s) {
    case "distilled": case "reviewed": case "archived": return "success";
    case "reading": case "actionized": return "warning";
    case "noted": return "primary";
    default: return "info";
  }
}
function riceTierLabel(t: RICETier): string { return meta.riceTiers.find(r => r.id === t)?.label ?? "—"; }
function riceScoreClass(score: number): string { return `rl-rice--${riceTierOf(score)}`; }
function typeIcon(t: ReadingType): string { return meta.types.find(x => x.id === t)?.icon ?? "📄"; }

function effectiveProgress(row: ReadingItem): number {
  if (typeof row.progress === "number" && Number.isFinite(row.progress)) return Math.min(100, Math.max(0, row.progress));
  if (row.status === "archived" || row.status === "reviewed" || row.status === "distilled") return 100;
  if (row.status === "reading" || row.status === "actionized") return 50;
  if (row.status === "noted") return 30;
  return 0;
}
function progressStatus(row: ReadingItem): "success" | "warning" | "exception" | undefined {
  const p = effectiveProgress(row);
  if (p >= 100) return "success";
  if (p >= 50) return "warning";
  if (p < 15 && row.status === "reading") return "exception";
  return undefined;
}
function formatUpdatedAt(ts?: string): string {
  if (!ts) return "—";
  try {
    const d = new Date(ts);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  } catch { return "—"; }
}

/* ─────────────── 7. 过滤交互：统一翻转 setter + 交给底部 watch 刷新 ─────────────── */
function setQueryField<K extends keyof typeof query>(key: K, value: (typeof query)[K], fallback: (typeof query)[K]) {
  query[key] = (query[key] === value ? fallback : value);
}
function onToggleDimension(id: ReadingDimension) { setQueryField("dimension", id, "all"); }
function onToggleRole(id: ReadingRole) { setQueryField("role", id, "all"); }
function onToggleMonth(m: string) { query.scheduledMonth = query.scheduledMonth === m ? undefined : m; }
function onTogglePriority(p: ReadingPriority) { setQueryField("priority", p, "all"); }
function onSetStatus(s: ReadingStatus | "all" | "done-group") { query.status = s; }
function onSetDoneGroup() { query.status = query.status === "done-group" ? "all" : "done-group"; }
function toggleRiceFilter(t: RICETier) { riceFilterTier.value = riceFilterTier.value === t ? "" : t; }
function onViewModeCmd(cmd: "card" | "table") { viewMode.value = cmd; }
/* ⌘D 快捷键契约保留（面板已移除 → no-op，避免无效键） */
function toggleDashboardCollapse() { /* SSOT 精简后为 no-op，快捷键仍绑定 */ }

/* ─────────────── 8. CRUD：表单构造统一由 buildEmptyForm + assignFormFromRow 处理 ─────────────── */
function riceBaseOfRow(row: ReadingItem) {
  return row.rice && [row.rice.reach, row.rice.impact, row.rice.confidence, row.rice.effort].every(n => Number.isFinite(n as number))
    ? { reach: row.rice!.reach!, impact: row.rice!.impact!, confidence: row.rice!.confidence!, effort: row.rice!.effort! }
    : makeRice(row.rice?.final ?? 70);
}
function assignFormFromRow(row: ReadingItem) {
  const base = riceBaseOfRow(row);
  Object.assign(form, {
    id: row._id ?? row.key,
    title: row.title, subtitle: row.subtitle ?? "", author: row.author ?? "",
    type: row.type ?? "book", dimension: row.dimension ?? "management", ownerRole: row.ownerRole ?? "ceo",
    priority: row.priority ?? "medium", status: row.status ?? "queued", progress: row.progress ?? 0,
    reach: base.reach, impact: base.impact, confidence: base.confidence, effort: base.effort,
    riceFinal: row.rice?.final ?? 70, scheduledMonth: row.scheduledMonth,
    okrId: row.okrId ?? "", noteKey: row.noteKey ?? "", externalUrl: row.externalUrl ?? "",
    tags: row.tags ?? [], summary: row.summary ?? ""
  });
}
function resetForm() {
  Object.assign(form, buildEmptyForm());
  formRef.value?.clearValidate();
}
function openCreateDialog() { resetForm(); dialogVisible.value = true; }
function openEditDialog(row: ReadingItem) { resetForm(); assignFormFromRow(row); dialogVisible.value = true; }

function buildPayloadFromForm(): ReadingFormPayload {
  const { id: _id, ...rest } = form as ReadingFormModel;
  const { reach, impact, confidence, effort, riceFinal, ...restNoRice } = rest;
  return {
    ...restNoRice,
    subtitle: rest.subtitle || undefined,
    author: rest.author || undefined,
    okrId: rest.okrId || undefined,
    noteKey: rest.noteKey || undefined,
    externalUrl: rest.externalUrl || undefined,
    tags: rest.tags.length ? rest.tags : undefined,
    summary: rest.summary || undefined,
    rice: { reach, impact, confidence, effort, final: riceFinal }
  } as ReadingFormPayload;
}

async function saveForm() {
  const valid = await formRef.value?.validate().catch(() => false);
  if (!valid) return;
  saving.value = true;
  try {
    const payload = buildPayloadFromForm();
    if (form.id) { await store.update(form.id, payload); ElMessage.success("已更新"); }
    else { await store.add(payload as any); ElMessage.success("已创建"); }
    dialogVisible.value = false;
    proTable.value?.getTableList?.();
  } catch (e) {
    ElMessage.error(e instanceof Error ? e.message : "保存失败");
  } finally { saving.value = false; }
}
async function handleDelete(row: ReadingItem) {
  try {
    await ElMessageBox.confirm(`确认删除 "${row.title}"？`, "删除", { type: "warning" });
    const id = rowKeyOf(row);
    if (!id) return;
    const ok = await store.remove(id);
    ElMessage[ok ? "success" : "warning"](ok ? "已删除" : "仅本地删除");
    proTable.value?.getTableList?.();
  } catch { /* user canceled */ }
}

/* ─────────────── 9. 预览 & 锚点（三闸门 SSOT）─────────────── */
function normalizeKnowledgePath(raw: string): string {
  if (!raw) return "";
  let rel = String(raw).trim();
  const trailingAnchors = rel.match(/\s+§[\s\S]*$/)
    || (/\.(md|ya?ml|json|txt|pdf|csv|png|jpe?g|webp|svg)$/i.test(rel) ? null : rel.match(/\s+#[\s\S]*$/));
  if (trailingAnchors) rel = rel.slice(0, trailingAnchors.index).trim();
  const queryMatch = rel.match(/[?&]file=([^&#]+)/);
  if (queryMatch) rel = decodeURIComponent(queryMatch[1]);
  rel = rel.replace(/^YiKnowledge\//i, "").replace(/^#\/knowledge\/(preview)?/i, "").replace(/^\//, "");
  rel = rel.replace(/\s+[§#][\s\S]*$/g, "").trim();
  if (/^https?:\/\//i.test(rel)) return rel;
  if (rel && !/\.(md|ya?ml|json|txt|pdf|csv|png|jpe?g|webp|svg)$/i.test(rel)) rel += ".md";
  return rel;
}
function resolveKbLinkForRow(row: ReadingItem): { kind: "md" | "http"; target: string } | null {
  if (!row) return null;
  if (row.externalUrl && /^https?:\/\//i.test(row.externalUrl)) return { kind: "http", target: row.externalUrl };
  const candidates: string[] = [];
  if ((row as any).link) candidates.push(String((row as any).link));
  if (row.noteKey) candidates.push(row.noteKey);
  for (const c of candidates) {
    const t = normalizeKnowledgePath(c);
    if (!t) continue;
    if (/^https?:\/\//i.test(t)) return { kind: "http", target: t };
    return { kind: "md", target: t };
  }
  return null;
}
function hasValidLinkContract(row: ReadingItem): boolean { return resolveKbLinkForRow(row) !== null; }

const failedRowKeys = new Set<string>();
function markRowError(row: ReadingItem) {
  const k = rowKeyOf(row);
  failedRowKeys.add(k);
  setTimeout(() => failedRowKeys.delete(k), 2000);
}
function isRowFailed(row: ReadingItem): boolean { return failedRowKeys.has(rowKeyOf(row)); }

async function openKnowledgePreview(relPath: string, opts?: { title?: string }) {
  const target = normalizeKnowledgePath(relPath);
  if (!target) { ElMessage.warning("未找到预览路径"); return; }
  if (/^https?:\/\//i.test(target)) { window.open(target, "_blank", "noopener,noreferrer"); return; }
  const entity: ResolveLinkInput = { type: "page", key: target, title: opts?.title };
  await gateBEntityExists(entity).catch(() => true);
  kbPreviewPath.value = target;
  await nextTick();
  kbPreviewRef.value?.open?.(target);
  pushReliabilityEvent({
    projectKey: "executive", phase: "P2-knowledge", status: "success", durationMs: 0, retryCount: 0,
    tags: { op: "rl_preview_open", target, title: opts?.title ?? "" }
  });
}
async function openReadingLink(row: ReadingItem) {
  const resolved = resolveKbLinkForRow(row);
  if (!resolved) { ElMessage.info("缺 noteKey / link，可 Edit 填写"); markRowError(row); return; }
  if (resolved.kind === "http") { window.open(resolved.target, "_blank", "noopener,noreferrer"); return; }
  const entity: ResolveLinkInput = {
    type: "page", key: resolved.target.replace(/\.md$/i, ""), title: row.title, extra: { type: "reading" }
  };
  const linkResolved = resolveLink(entity);
  if (!linkResolved.ok) { ElMessage.warning(linkResolved.message || "无法解析"); markRowError(row); return; }
  const exists = await gateBEntityExists(entity).catch(() => true);
  if (!exists) {
    pushReliabilityEvent({
      projectKey: "executive", phase: "P2-knowledge", status: "degraded", durationMs: 0, retryCount: 0,
      tags: { op: "rl_preview_miss", key: entity.key ?? "", title: row.title }
    });
  }
  await openKnowledgePreview(resolved.target, { title: row.title });
  nextTick(() =>
    gateCPostNavigate({
      expectedLink: linkResolved.link, expectedParams: linkResolved.params,
      expectedTitleKeyword: row.title || "", timeoutMs: 2000
    })
  );
}
function anchorToEntity(anchor: string): ResolveLinkInput | null {
  if (!anchor) return null;
  const a = String(anchor).trim();
  if (/^exec[-_]\d{2,3}[-_]\d{1,3}$/i.test(a)) {
    const normalized = a.toLowerCase().replace(/[ _]/g, "-");
    return { type: "page", key: `executive/okr/${normalized}`, title: a };
  }
  const numMatch = a.match(/\b(\d{3})(?:\.md)?\b/);
  if (numMatch) {
    const num = numMatch[1];
    const fallback = num === "001"
      ? `executive/reading-list/${num}-阅读-阅读清单`
      : `executive/reading-list/${num}-阅读-读书笔记`;
    return { type: "page", key: fallback, title: a };
  }
  if (a.includes("/") || /\.md\s*$/i.test(a)) {
    const clean = a.replace(/§.*$/, "").replace(/^YiKnowledge\//i, "")
      .replace(/^#\/?knowledge\//i, "").replace(/^\//, "").trim();
    let candidate = clean;
    if (!candidate.toLowerCase().startsWith("executive/")) {
      if (/^(reading-list|okr|rss|strategy|process|notes|tactical|governance)\//i.test(candidate)) candidate = `executive/${candidate}`;
      else if (!candidate.includes("/")) candidate = `executive/reading-list/${candidate}`;
    }
    return { type: "page", key: candidate.replace(/\.md$/i, ""), title: a };
  }
  return null;
}
async function openAnchor(anchor: string) {
  const entity = anchorToEntity(anchor);
  if (!entity) { ElMessage.info(`未映射锚点: ${anchor}`); return; }
  if (entity.type === "page") {
    const kbKey = entity.key ?? "";
    const mdPath = /\.md$/i.test(kbKey) ? kbKey : `${kbKey}.md`;
    const resolved = resolveLink(entity);
    const expectedLink = resolved.ok ? resolved.link : "#preview-dialog";
    const expectedParams = resolved.ok && "params" in resolved ? resolved.params : {};
    const exists = await gateBEntityExists(entity).catch(() => true);
    if (!exists) ElMessage.warning(`锚点未命中，尝试直接预览: ${anchor}`);
    try { await openKnowledgePreview(mdPath, { title: entity.title ?? anchor }); }
    catch (e) { ElMessage.warning(e instanceof Error ? e.message : "预览失败"); }
    nextTick(() =>
      gateCPostNavigate({
        expectedLink, expectedParams, expectedTitleKeyword: entity.title || "", timeoutMs: 2000
      })
    );
    return;
  }
  const resolved = resolveLink(entity);
  if (!resolved.ok) { ElMessage.warning(resolved.message); router.push(resolved.fallback); return; }
  try {
    await router.push(resolved.link);
    nextTick(() =>
      gateCPostNavigate({
        expectedLink: resolved.link, expectedParams: resolved.params,
        expectedTitleKeyword: entity.title || "", timeoutMs: 2000
      })
    );
  } catch (e) {
    ElMessage.warning(e instanceof Error ? e.message : "导航失败");
  }
}
async function openItem(row: ReadingItem) {
  if (hasValidLinkContract(row)) { await openReadingLink(row); return; }
  if (row.externalUrl) { window.open(row.externalUrl, "_blank", "noopener,noreferrer"); return; }
  openEditDialog(row);
}

/* ─────────────── 10. 模板私有子组件（同文件，不新增额外文件）─────────────── */
const ReadingLinkTag = defineComponent({
  name: "ReadingLinkTag",
  props: {
    row: { type: Object as () => ReadingItem, required: true },
    size: { type: String as () => "sm" | undefined, default: undefined },
    text: { type: String, default: "可预览" }
  },
  setup(props) {
    return () => {
      if (!hasValidLinkContract(props.row)) return null;
      return h(
        ElTag,
        {
          class: ["rl-kb-tag", ...(props.size === "sm" ? ["rl-kb-tag--sm"] : [])],
          size: "small",
          type: "success",
          effect: "light",
          onClick: (e: Event) => { e.stopPropagation(); openReadingLink(props.row); }
        },
        { default: () => ["📖", props.text ? ` ${props.text}` : ""].filter(Boolean).join("") }
      );
    };
  }
});

/* RowActions：Card/Table 两视图（List 已移除，避免冗余） */
const RowActions = defineComponent({
  name: "RowActions",
  props: {
    row: { type: Object as () => ReadingItem, required: true },
    variant: { type: String as () => "card" | "table", default: "table" }
  },
  setup(props) {
    return () => {
      const isCard = props.variant === "card";
      const wrapperClass = isCard ? "rl-card-item__actions" : "rl-table__actions";

      const previewBtnAttrs: Record<string, any> = { size: "small", onClick: () => openReadingLink(props.row) };
      if (!isCard) { previewBtnAttrs.type = "success"; previewBtnAttrs.plain = true; }
      else { previewBtnAttrs.type = "primary"; }

      const children: VNode[] = [];
      if (hasValidLinkContract(props.row)) {
        children.push(h(ElButton, previewBtnAttrs, { default: () => `📖${isCard ? " 预览" : ""}` }));
      }
      children.push(h(ElButton, { size: "small", text: true, type: "primary", onClick: () => openItem(props.row) }, { default: () => "Open" }));
      children.push(h(ElButton, { size: "small", text: true, onClick: () => openEditDialog(props.row) }, { default: () => "Edit" }));
      children.push(h(ElButton, { size: "small", text: true, type: "danger", onClick: () => handleDelete(props.row) }, { default: () => isCard ? "Delete" : "Del" }));

      return h("div", { class: wrapperClass }, children);
    };
  }
});

/* ─────────────── 11. 快捷键（List ⌥1 → Card；⌥2 → Table；⌥3 no-op）─────────────── */
function onKeyDown(e: KeyboardEvent) {
  const target = e.target as HTMLElement | null;
  if (target) {
    const tag = target.tagName;
    if (tag === "INPUT" || tag === "TEXTAREA" || target.isContentEditable) {
      if (!(e.metaKey || e.ctrlKey)) return;
      const k = e.key.toLowerCase();
      if (k !== "n" && k !== "d" && k !== "k") return;
    }
  }
  const mod = e.metaKey || e.ctrlKey;
  if (mod && e.key.toLowerCase() === "n") { e.preventDefault(); openCreateDialog(); return; }
  if (mod && e.key.toLowerCase() === "d") { e.preventDefault(); toggleDashboardCollapse(); return; }
  if (e.altKey && e.key.toLowerCase() === "k") { e.preventDefault(); searchInputRef.value?.focus?.(); return; }
  if (mod && e.key.toLowerCase() === "k") { e.preventDefault(); palette.open?.(); return; }
  if (e.altKey && e.key === "1") { e.preventDefault(); onViewModeCmd("card"); }
  else if (e.altKey && e.key === "2") { e.preventDefault(); onViewModeCmd("table"); }
  else if (e.altKey && e.key === "3") { e.preventDefault(); /* List 视图已移除 */ }
}
onMounted(() => { window.addEventListener("keydown", onKeyDown); });
onBeforeUnmount(() => { window.removeEventListener("keydown", onKeyDown); });

/* 数据源响应式刷新：解决 composable 异步 setItems(SEED) 与 ProTable 首次 getTableList 的竞态空数据问题。
 * 初次挂载时 ProTable onMounted → getTableList() 同步触发，但 reload() 是异步的，items.value 此时为空。
 * 此 watch 覆盖 items.length 0→N（Fallback seed）、N→M（后端返回）、N→0（清空）等所有情形。 */
watch(
  () => (store.items as unknown as ReadingItem[]).length,
  (newLen, oldLen) => {
    if (newLen === oldLen) return;
    if (viewMode.value !== "table") return;
    nextTick(() => proTable.value?.getTableList?.());
  },
  { flush: "post" }
);

/* 过滤/视图变化 → Table 视图统一刷新（Card 由 computed 自动响应） */
watch(
  () => [query, riceFilterTier.value, viewMode.value] as const,
  () => { if (viewMode.value === "table") nextTick(() => proTable.value?.getTableList?.()); },
  { deep: true }
);
</script>

<style lang="scss">
@use "./styles/readingList.scss";
</style>
