<template>
  <div v-if="pageClass" :class="pageClass" v-loading="loading">
    <!-- ═══ Header ═══ -->
    <header
      v-if="!noHeader"
      :class="`${rootCls}__header`"
      v-sticky="{ top: 0, zIndex: 20, offsetX: [24, 24], offsetY: [20, 14], activeClass: 'is-stuck' }"
    >
      <div :class="`${rootCls}__head-row`">
        <div :class="`${rootCls}__head-left`">
          <RoleNav :active="role.id" show-quick-nav :quick-role="role.id" />
          <p v-if="role.description" :class="`${rootCls}__subtitle`">{{ role.description }}</p>
          <slot name="header-sub" />
        </div>
        <div :class="`${rootCls}__head-right`">
          <slot name="header-actions" />
          <el-tag size="small" type="info" effect="plain">Last scan · {{ stats.lastUpdatedAt }}</el-tag>
          <el-button :icon="Refresh" size="small" text @click="() => refresh()" :loading="loading" />
        </div>
      </div>
    </header>

    <KnowledgeError v-if="error" :message="error" @retry="refresh" />

    <template v-else>
      <!-- Slot: prepend (for OKR banner / CDD ribbon etc) -->
      <slot name="prepend" />

      <!-- ═══ Stat cards ═══ -->
      <section :class="`${rootCls}__stats`">
        <div class="stat-card" style="--accent: #1677ff">
          <div class="stat-card__icon">📄</div>
          <div class="stat-card__body">
            <span class="stat-card__value">{{ stats.total }}</span>
            <span class="stat-card__label">Total Knowledge Files</span>
            <span class="stat-card__sub">{{ subdirs.length }} delivery phases</span>
          </div>
        </div>
        <div class="stat-card" style="--accent: #10b981">
          <div class="stat-card__icon">✅</div>
          <div class="stat-card__body">
            <span class="stat-card__value">{{ stats.stable + stats.active }}</span>
            <span class="stat-card__label">Stable / Active</span>
            <span class="stat-card__sub">{{ pct(stats.stable + stats.active, stats.total) }}% mature</span>
          </div>
        </div>
        <div class="stat-card" style="--accent: #f59e0b">
          <div class="stat-card__icon">📝</div>
          <div class="stat-card__body">
            <span class="stat-card__value">{{ stats.draft }}</span>
            <span class="stat-card__label">Drafts</span>
            <span class="stat-card__sub">{{ stats.evolving }} evolving</span>
          </div>
        </div>
        <div
          class="stat-card"
          :style="{
            '--accent':
              stats.reviewCompliance >= 80 ? '#10b981' : stats.reviewCompliance >= 50 ? '#f59e0b' : '#ef4444'
          }"
        >
          <div class="stat-card__icon">🛡️</div>
          <div class="stat-card__body">
            <span class="stat-card__value">{{ stats.reviewCompliance }}%</span>
            <span class="stat-card__label">Review Compliance</span>
            <el-progress
              :percentage="stats.reviewCompliance"
              :stroke-width="5"
              :show-text="false"
              :color="stats.reviewCompliance >= 80 ? '#10b981' : stats.reviewCompliance >= 50 ? '#f59e0b' : '#ef4444'"
            />
          </div>
        </div>
        <div class="stat-card" style="--accent: #ef4444">
          <div class="stat-card__icon">⛔</div>
          <div class="stat-card__body">
            <span class="stat-card__value">{{ stats.deprecated + stats.archived }}</span>
            <span class="stat-card__label">Deprecated / Archived</span>
            <span class="stat-card__sub">clean up candidates</span>
          </div>
        </div>
      </section>

      <!-- Slot between stats & redlines (e.g. SRE SLO monitor) -->
      <slot name="after-stats" />

      <!-- ═══ Red-line KPI cards (Hard Constraints) ═══ -->
      <section :class="`${rootCls}__block`">
        <div class="block-head">
          <h2 class="block-head__title">
            <span class="block-head__icon">🚦</span>Hard Constraints · 角色红线
          </h2>
          <span class="block-head__count">{{ role.redLines.length }} immutable KPIs</span>
        </div>
        <div class="redline-grid">
          <el-card
            v-for="(r, i) in role.redLines"
            :key="i"
            class="redline"
            :class="{ 'is-clickable': hasResolvableRef(r) }"
            shadow="hover"
            @click="openRedline(r)"
          >
            <div class="redline__bar" :style="{ background: redlineAccent(r.direction) }" />
            <div class="redline__body">
              <div class="redline__row1">
                <h3 class="redline__label">{{ r.label }}</h3>
                <el-tooltip v-if="r.rationale" :content="r.rationale" placement="top" :show-after="300">
                  <el-icon :size="14" class="redline__hint"><QuestionFilled /></el-icon>
                </el-tooltip>
              </div>
              <div class="redline__threshold">
                {{ r.threshold }}<span v-if="r.unit">{{ r.unit }}</span>
              </div>
              <div class="redline__dir" :class="r.direction">{{ directionText(r.direction) }}</div>
              <div v-if="r.ref" class="redline__ref">📌 {{ r.ref }}</div>
            </div>
          </el-card>
        </div>
      </section>

      <!-- Slot between redlines & quickref/onboarding (e.g. Risk register, CDD) -->
      <slot name="after-redlines" />

      <!-- ═══ Quick Reference + 5-Day Onboarding ═══ -->
      <section :class="`${rootCls}__row2`">
        <div :class="`${rootCls}__block`">
          <div class="block-head">
            <h2 class="block-head__title">
              <span class="block-head__icon">⚡</span>速查入口
            </h2>
            <span class="block-head__count">{{ role.quickRefs.length }} canonical docs</span>
          </div>
          <div class="quickref-list">
            <el-tooltip
              v-for="q in role.quickRefs"
              :key="q.file"
              placement="right"
              :show-after="200"
            >
              <template #content>
                <div style="max-width: 220px; line-height: 1.5">
                  <div style="font-weight: 600; margin-bottom: 4px">{{ q.want }}</div>
                  <div style="font-size: 11px; opacity: 0.7">{{ q.file }}</div>
                </div>
              </template>
              <button
                class="quickref-item"
                :class="{ 'is-missing': !resolveFile(q.file) }"
                @click="openQuickRef(q.file)"
                :disabled="!resolveFile(q.file)"
              >
                <span class="quickref-item__icon">{{ q.icon }}</span>
                <span class="quickref-item__text">{{ q.want }}</span>
                <span v-if="q.confidence" class="quickref-item__star" :title="`Confidence ${q.confidence}/5`">
                  {{ "★".repeat(q.confidence) }}{{ "☆".repeat(5 - q.confidence) }}
                </span>
              </button>
            </el-tooltip>
          </div>
        </div>

        <div :class="`${rootCls}__block`">
          <div class="block-head">
            <h2 class="block-head__title">
              <span class="block-head__icon">🧭</span>5-Day Onboarding · 新人路线图
            </h2>
            <span class="block-head__count">Simon method · proven cadence</span>
          </div>
          <el-tabs type="border-card" class="onboarding-tabs" stretch>
            <el-tab-pane v-for="step in role.onboarding" :key="step.day" :name="String(step.day)">
              <template #label>
                <span class="onboarding-tab">
                  <span class="onboarding-tab__num" :style="{ background: dayColor(step.day) }">
                    D{{ step.day }}
                  </span>
                  <span>{{ step.title }}</span>
                </span>
              </template>
              <div class="onboarding-card">
                <ul class="onboarding-checklist">
                  <li v-for="(item, i) in step.checklist" :key="i">
                    <el-checkbox :model-value="false" disabled />
                    <span>{{ item }}</span>
                  </li>
                </ul>
                <div v-if="step.pitfall" class="onboarding-pitfall">
                  <span class="onboarding-pitfall__label">⚠️ Pitfall</span>
                  <span>{{ step.pitfall }}</span>
                </div>
              </div>
            </el-tab-pane>
          </el-tabs>
        </div>
      </section>

      <!-- Slot before body (e.g. domain cards grid) -->
      <slot name="before-body" />

      <!-- ═══ Body: Sidebar + File Browser ═══ -->
      <section :class="`${rootCls}__body`">
        <nav
          :class="`${rootCls}__sidebar`"
          v-sticky="{ top: 96, zIndex: 18, activeClass: 'is-stuck' }"
        >
          <div :class="`${rootCls}__sidebar-view`">
            <el-radio-group v-model="viewMode" size="small">
              <el-radio-button value="card">Cards</el-radio-button>
              <el-radio-button value="list">List</el-radio-button>
              <el-radio-button value="table">Table</el-radio-button>
            </el-radio-group>
          </div>
          <button
            v-for="dir in subdirs"
            :key="dir.id"
            :class="[
              `${rootCls}__sidebar-item`,
              { 'is-active': isSidebarActive(dir) }
            ]"
            @click="scrollTo(dir.id)"
          >
            <span :class="`${rootCls}__sidebar-icon`">{{ dir.icon }}</span>
            <div :class="`${rootCls}__sidebar-info`">
              <span :class="`${rootCls}__sidebar-label`">{{ dir.label }}</span>
              <span :class="`${rootCls}__sidebar-sub`">{{ stableCount(dir.id) }} stable</span>
            </div>
            <span :class="`${rootCls}__sidebar-badge`">{{ fileCounts[dir.id] || 0 }}</span>
          </button>
        </nav>

        <div :class="`${rootCls}__content`">
          <slot name="content" :ctx="{ filesByDir, flatFiles, filteredFiles, fileCounts }">
            <RoleCardView
              v-if="viewMode === 'card'"
              :subdirs="subdirs"
              :files-by-dir="filesByDir"
              :collapsed-sections="collapsedSections"
              :category="roleId"
              :structural-tags="role.structuralTags"
              @open="openFile"
              @delete="handleDelete"
              @toggle-section="toggleSection"
            />
            <RoleListView
              v-else-if="viewMode === 'list'"
              :files="filteredFiles"
              :total-count="flatFiles.length"
              :category="roleId"
              @open="openFile"
              @delete="handleDelete"
            />
            <RoleTableView
              v-else
              :files="filteredFiles"
              :total-count="flatFiles.length"
              :filters="filters"
              :category="roleId"
              @open="openFile"
              @delete="handleDelete"
            />
          </slot>
        </div>
      </section>
    </template>

    <KnowledgePreviewDialog ref="previewDlg" />
  </div>
</template>

<script setup lang="ts" name="StandardRoleDashboard">
import { computed, ref } from "vue";
import { Refresh, QuestionFilled } from "@element-plus/icons-vue";
import { useI18n } from "vue-i18n";
import { ElMessage } from "element-plus";
import { confirm } from "@/hooks/useConfirmAction";
import RoleNav from "./RoleNav.vue";
import KnowledgeError from "./KnowledgeError.vue";
import KnowledgePreviewDialog from "@/components/KnowledgePreviewDialog/KnowledgePreviewDialog.vue";
import RoleCardView from "./RoleCardView.vue";
import RoleListView from "./RoleListView.vue";
import RoleTableView from "./RoleTableView.vue";
import { useRoleDashboard } from "../composables/useRoleDashboard";
import type { RedLineDef } from "../roleConfig";

interface Props {
  roleId: string;
  /** root CSS class used to match roleDashboard.scss selectors — pick one of: eng/prod/lead/cur/aier/sre/exec */
  pageClass?: string;
  /** CSS root class prefix (default matches roleId). This keeps HTML semantic. */
  pollIntervalMs?: number;
  noHeader?: boolean;
}
const props = withDefaults(defineProps<Props>(), {
  pageClass: "",
  pollIntervalMs: 90_000,
  noHeader: false
});

/* Map role id → CSS class prefix matching roleDashboard.scss selectors */
const ROOT_CLS_MAP: Record<string, string> = {
  engineer: "eng-page",
  product: "prod-page",
  leader: "lead-page",
  curator: "cur-page",
  aier: "aier-page",
  sre: "sre-page",
  executive: "exec-page"
};
const roleId = computed(() => props.roleId);
const rootCls = ROOT_CLS_MAP[props.roleId] ?? "eng-page";
const pageClass = computed(() => props.pageClass || ROOT_CLS_MAP[props.roleId] || "eng-page");

const { t } = useI18n();
const dash = useRoleDashboard(roleId, { pollIntervalMs: props.pollIntervalMs });

const {
  role, subdirs, loading, error, stats,
  filesByDir, fileCounts, flatFiles, filteredFiles,
  viewMode, collapsedSections, filters,
  refresh, toggleSection, scrollTo, isSidebarActive, resolveFile, removeFile
} = dash;

const previewDlg = ref<InstanceType<typeof KnowledgePreviewDialog> | null>(null);

/* ── helpers ─────────────────────────────────────────────── */
function pct(part: number, total: number): number {
  return total ? Math.round((part / total) * 100) : 0;
}
function stableCount(dirId: string): number {
  return (filesByDir.value[dirId] || []).filter(
    f => f.meta?.status === "stable" || f.meta?.status === "active"
  ).length;
}
function redlineAccent(dir: string): string {
  return dir === "max" ? "#ef4444" : "#10b981";
}
function directionText(dir: string): string {
  return dir === "max" ? "Hard cap — must NOT exceed" : "Hard floor — must NOT fall below";
}
function dayColor(d: number): string {
  const map: Record<number, string> = {
    1: "#64748b", 2: "#1677ff", 3: "#10b981", 4: "#7c3aed", 5: "#f59e0b"
  };
  return map[d] ?? "#64748b";
}

/**
 * Parse a redline `ref` string like
 *   "executive/reading-list/001-阅读-阅读清单.md §跨书洞察矩阵"
 *   or "projects/INDEX.md §质量门禁 Q-08"
 * into a resolvable YiKnowledge markdown path (without the § section suffix).
 * Returns null when the ref is empty, points to a non-markdown source file,
 * or cannot be reasonably mapped to the knowledge base.
 */
function parseRedlineRef(r: RedLineDef): { path: string } | null {
  if (!r.ref) return null;
  // Split off section tag ("§" or " — " or " § "). Keep everything before first §.
  const raw = r.ref.replace(/\s*§.*$/, "").trim();
  if (!raw) return null;
  // Accept only paths that explicitly end in .md (treat .ts / code paths as non-previewable).
  if (!raw.endsWith(".md")) return null;
  return { path: raw };
}
function hasResolvableRef(r: RedLineDef): boolean {
  return parseRedlineRef(r) !== null;
}
function openRedline(r: RedLineDef) {
  const parsed = parseRedlineRef(r);
  if (!parsed) return;
  previewDlg.value?.open(parsed.path);
}

/* ── actions ─────────────────────────────────────────────── */
function openFile(file: { path: string }) {
  previewDlg.value?.open(file.path);
}
function openQuickRef(fileRef: string) {
  const f = resolveFile(fileRef);
  if (f) openFile(f);
  else ElMessage.warning(`File not yet indexed: ${fileRef}`);
}
async function handleDelete(file: { path: string; name?: string }) {
  const ok = await confirm(
    t("knowledge.common.deleteFileConfirm", { path: file.path }),
    t("knowledge.common.deleteFileTitle")
  );
  if (!ok) return;
  const done = await removeFile(file as any);
  if (done) ElMessage.success(t("knowledge.common.fileDeleted"));
  else ElMessage.error(t("knowledge.common.fileDeleteFailed"));
}

defineExpose({
  previewDlg,
  openFile,
  dashboard: dash,
  role
});
</script>

<style lang="scss" scoped>
@use "../styles/roleDashboard.scss";

.redline.is-clickable {
  cursor: pointer;
  transition: transform 0.18s, box-shadow 0.18s;
  &:hover {
    transform: translateY(-2px);
  }
}
</style>
