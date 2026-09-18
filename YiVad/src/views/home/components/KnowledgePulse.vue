<template>
  <section class="kp-root">
    <div class="kp-head">
      <span class="kp-head__title">{{ t("home.recentImportant.title") }}</span>
      <span class="kp-head__sub" :class="{ 'kp-head__sub--off': !available }">
        {{ available ? t("home.recentImportant.totalFiles", { n: totalFiles }) : t("home.recentImportant.unavailable") }}
      </span>
    </div>
    <div v-if="healthSummary" class="kp-summary">{{ healthSummary }}</div>
    <div v-if="loading" class="kp-loading"><el-icon class="is-loading"><Loading /></el-icon></div>
    <div v-else-if="!available" class="kp-offline">
      <el-icon><WarningFilled /></el-icon>
      <span>{{ t("home.recentImportant.apiUnavailable") }}</span>
    </div>
    <div v-else class="kp-grid">
      <!-- Bugs severity -->
      <div class="kp-card">
        <div class="kp-card__head">
          <el-icon><Warning /></el-icon><span>{{ t("home.recentImportant.knowledgeBugs") }}</span>
          <span class="kp-badge kp-badge--warn">{{ totalBugs }}</span>
        </div>
        <div class="kp-sev" v-if="totalBugs">
          <div class="kp-sev__row" v-for="s in sevList" :key="s.key">
            <span class="kp-sev__dot" :class="'kp-sev__dot--' + s.key" />
            <span class="kp-sev__label">{{ t("home.issueSeverity." + s.key) }}</span>
            <span class="kp-sev__bar"><span class="kp-sev__fill" :class="'kp-sev__fill--' + s.key" :style="{ width: sevPct(s.key) + '%' }" /></span>
            <span class="kp-sev__count">{{ s.count }}</span>
          </div>
        </div>
        <div v-else class="kp-empty">{{ t("home.recentImportant.noBugs") }}</div>
      </div>

      <!-- Distribution -->
      <div class="kp-card">
        <div class="kp-card__head">
          <el-icon><DataAnalysis /></el-icon><span>{{ t("home.recentImportant.distribution") }}</span>
          <span class="kp-badge kp-badge--info">{{ avgMaturity }}%</span>
        </div>
        <div class="kp-maturity">
          <div v-for="cat in topCategories" :key="cat.category" class="kp-maturity__row">
            <span class="kp-maturity__name">{{ cat.category }}</span>
            <el-progress :percentage="cat.maturity" :stroke-width="5" :show-text="false" :color="matColor(cat.maturity)" />
          </div>
        </div>
      </div>

      <!-- Recent files -->
      <div class="kp-card">
        <div class="kp-card__head">
          <el-icon><FolderOpened /></el-icon><span>{{ t("home.recentImportant.recentFiles") }}</span>
        </div>
        <div v-if="files.length" class="kp-list">
          <div v-for="f in files.slice(0, 5)" :key="f.path" class="kp-item kp-item--link" @click="goKnowledge(f.category)">
            <span class="kp-item__title">{{ f.name }}</span>
            <span class="kp-item__cat">{{ f.category }}</span>
          </div>
        </div>
        <div v-else class="kp-empty">{{ t("home.recentImportant.noFiles") }}</div>
      </div>

      <!-- Gaps -->
      <div class="kp-card">
        <div class="kp-card__head">
          <el-icon><Opportunity /></el-icon><span>{{ t("home.future.gaps") }}</span>
          <span v-if="gaps.length" class="kp-badge kp-badge--warn">{{ gaps.length }}</span>
        </div>
        <div v-if="gaps.length" class="kp-list">
          <div v-for="(gap, i) in gaps.slice(0, 4)" :key="i" class="kp-item kp-item--link" @click="router.push('/knowledge/curator')">
            <span class="kp-gap-num">{{ i + 1 }}</span>
            <span class="kp-item__title">{{ gap }}</span>
          </div>
        </div>
        <div v-else class="kp-empty">{{ t("home.future.noGaps") }}</div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts" name="KnowledgePulse">
import { computed } from "vue";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { Loading, Warning, DataAnalysis, FolderOpened, Opportunity, WarningFilled } from "@element-plus/icons-vue";
import type { KnowledgeBugEntry, KnowledgeFileEntry } from "@/api/interface/yiAi";

const props = defineProps<{
  bugs: KnowledgeBugEntry[];
  bugSeverity: Record<string, number>;
  files: KnowledgeFileEntry[];
  categoryCounts: Array<{ category: string; count: number; maturity: number }>;
  totalFiles: number;
  gaps: string[];
  healthSummary: string | null;
  loading: boolean;
  available: boolean;
}>();

const { t } = useI18n();
const router = useRouter();

function goKnowledge(category: string) {
  const roleMap: Record<string, string> = { Engineer: "engineer", Executive: "executiver", "Tech Lead": "leader", AI: "aier", Producter: "product", SRE: "sre", Curator: "curator" };
  const role = roleMap[category] || category.toLowerCase();
  router.push("/knowledge/" + role);
}

const totalBugs = computed(() => props.bugs.length || Object.values(props.bugSeverity).reduce((a, b) => a + b, 0));

const sevList = computed(() => [
  { key: "critical", count: props.bugSeverity["critical"] ?? 0 },
  { key: "major", count: props.bugSeverity["major"] ?? 0 },
  { key: "minor", count: props.bugSeverity["minor"] ?? 0 },
  { key: "trivial", count: props.bugSeverity["trivial"] ?? 0 }
].filter(s => s.count > 0));

const maxSev = computed(() => Math.max(1, totalBugs.value));
function sevPct(key: string) { return Math.round(((props.bugSeverity[key] ?? 0) / maxSev.value) * 100); }

const topCategories = computed(() => props.categoryCounts.slice(0, 4));
const avgMaturity = computed(() => {
  if (!topCategories.value.length) return 0;
  return Math.round(topCategories.value.reduce((s, c) => s + c.maturity, 0) / topCategories.value.length);
});

function matColor(pct: number): string {
  if (pct >= 80) return "#67c23a";
  if (pct >= 60) return "#e6a23c";
  return "#f56c6c";
}
</script>

<style scoped lang="scss">
.kp-root { padding: 20px 24px; background: var(--el-bg-color); border: 1px solid var(--el-border-color-lighter); border-radius: 16px; }
.kp-head { display: flex; gap: 10px; align-items: baseline; margin-bottom: 14px; padding-left: 14px; border-left: 3px solid #7c3aed; }
.kp-head__title { font-size: 14px; font-weight: 600; color: var(--el-text-color-primary); }
.kp-head__sub { font-size: 11px; color: var(--el-text-color-placeholder); &--off { color: var(--el-color-danger); } }
.kp-summary { margin-bottom: 12px; padding: 6px 10px; font-size: 11px; color: var(--el-text-color-secondary); background: var(--el-fill-color-lighter); border-radius: 6px; line-height: 1.4; }
.kp-loading { display: flex; justify-content: center; padding: 24px 0; color: var(--el-text-color-secondary); }
.kp-offline { display: flex; gap: 8px; align-items: center; justify-content: center; padding: 24px 0; font-size: 12px; color: var(--el-text-color-placeholder); .el-icon { color: var(--el-color-warning); } }
.kp-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; }

.kp-card { }
.kp-card__head { display: flex; gap: 6px; align-items: center; margin-bottom: 8px; font-size: 10px; font-weight: 600; color: var(--el-text-color-secondary); text-transform: uppercase; letter-spacing: 0.4px; .el-icon { font-size: 13px; color: #7c3aed; } }
.kp-badge { margin-left: auto; min-width: 18px; height: 18px; padding: 0 5px; font-size: 10px; font-weight: 700; line-height: 18px; text-align: center; border-radius: 9px; &--warn { color: var(--el-color-warning); background: var(--el-color-warning-light-9); } &--info { color: #7c3aed; background: #f0f5ff; } }
.kp-list { display: flex; flex-direction: column; gap: 2px; }
.kp-item { display: flex; gap: 6px; align-items: center; padding: 4px 0; &--link { cursor: pointer; border-radius: 4px; padding: 4px 4px; margin: 0 -4px; transition: background 0.1s; &:hover { background: var(--el-fill-color-light); } } }
.kp-item__title { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; font-size: 11px; color: var(--el-text-color-primary); white-space: nowrap; }
.kp-item__cat { flex-shrink: 0; font-size: 10px; color: var(--el-text-color-placeholder); }
.kp-empty { font-size: 11px; color: var(--el-text-color-placeholder); padding: 12px 0; text-align: center; }
.kp-gap-num { flex-shrink: 0; width: 16px; height: 16px; font-size: 10px; font-weight: 700; line-height: 16px; text-align: center; color: #7c3aed; background: #f0f5ff; border-radius: 50%; }

// Severity bars
.kp-sev { display: flex; flex-direction: column; gap: 5px; }
.kp-sev__row { display: flex; gap: 6px; align-items: center; }
.kp-sev__dot { flex-shrink: 0; width: 7px; height: 7px; border-radius: 50%; &--critical { background: var(--el-color-danger); } &--major { background: var(--el-color-warning); } &--minor { background: var(--el-color-primary); } &--trivial { background: var(--el-text-color-placeholder); } }
.kp-sev__label { width: 42px; font-size: 10px; color: var(--el-text-color-secondary); }
.kp-sev__bar { flex: 1; height: 5px; overflow: hidden; background: var(--el-fill-color-light); border-radius: 3px; }
.kp-sev__fill { display: block; height: 100%; border-radius: 3px; &--critical { background: var(--el-color-danger); } &--major { background: var(--el-color-warning); } &--minor { background: var(--el-color-primary); } &--trivial { background: var(--el-text-color-placeholder); } }
.kp-sev__count { width: 20px; font-size: 10px; font-weight: 600; font-variant-numeric: tabular-nums; color: var(--el-text-color-secondary); text-align: right; }

// Maturity
.kp-maturity { display: flex; flex-direction: column; gap: 7px; }
.kp-maturity__row { display: flex; gap: 6px; align-items: center; }
.kp-maturity__name { width: 52px; font-size: 10px; color: var(--el-text-color-secondary); text-align: right; flex-shrink: 0; }
</style>