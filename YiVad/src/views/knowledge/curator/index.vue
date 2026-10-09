<template>
  <StandardRoleDashboard role-id="curator" :poll-interval-ms="90000">
    <!-- Curator unique: CDD ribbon + data-quality health bar -->
    <template #prepend>
      <div class="cur-page__ribbon">
        <div class="cur-page__ribbon-title">
          <el-icon :size="18"><Cpu /></el-icon>
          <span>CDD · 内容驱动开发 · Content-Driven Development</span>
        </div>
        <div class="cur-page__ribbon-metrics">
          <el-tag size="small" effect="light" type="info" round>
            Naming Rule · 001-三位编号 强制
          </el-tag>
          <el-tag size="small" effect="light" type="warning" round>
            受限目录 · rss/prds/devs = 自动跳转，不接受新增
          </el-tag>
          <el-tag size="small" effect="light" type="danger" round>
            季度 Dedup = 100% 必做
          </el-tag>
        </div>
      </div>
    </template>

    <!-- Curator: CDD Data Quality + Review Queue -->
    <template #after-redlines>
      <section class="cur-page__block">
        <div class="block-head">
          <h2 class="block-head__title">
            <span class="block-head__icon">📊</span>Knowledge Health · 数据质量体检
          </h2>
          <span class="block-head__count">CDD 6 axes · 自动扫描</span>
        </div>
        <div class="cur-health">
          <div v-for="ax in healthAxes" :key="ax.label" class="cur-health__item">
            <div class="cur-health__label-row">
              <span class="cur-health__icon">{{ ax.icon }}</span>
              <span class="cur-health__label">{{ ax.label }}</span>
              <span class="cur-health__pct">{{ ax.value }}%</span>
            </div>
            <el-progress
              :percentage="ax.value"
              :stroke-width="10"
              :show-text="false"
              :color="ax.color"
            />
            <div class="cur-health__sub">{{ ax.sub }}</div>
          </div>
        </div>
      </section>

      <!-- Review Queue (CDD 2-week SLA) -->
      <section class="cur-page__block">
        <div class="block-head">
          <h2 class="block-head__title">
            <span class="block-head__icon">⏰</span>Review Queue · 审核队列
          </h2>
          <span class="block-head__count">
            {{ reviewItems.length }} overdue / {{ stats.total }} total
          </span>
        </div>
        <div v-if="reviewItems.length === 0" class="cur-review__empty">
          <el-empty description="All files within SLA · 2-week review cadence respected" :image-size="80" />
        </div>
        <el-table
          v-else
          :data="reviewItems"
          size="small"
          stripe
          border
          :header-cell-style="{ background: 'var(--el-fill-color-lighter)' }"
        >
          <el-table-column label="File" min-width="220">
            <template #default="{ row }">
              <span style="margin-right:4px">{{ row.domainIcon }}</span>
              <a class="cur-review__name" @click.stop="openFile(row.path)">{{ row.title }}</a>
            </template>
          </el-table-column>
          <el-table-column label="Domain" width="120">
            <template #default="{ row }">{{ row.domain }}</template>
          </el-table-column>
          <el-table-column label="Status" width="90">
            <template #default="{ row }">
              <el-tag size="small" :type="row.status === 'stable' ? 'success' : row.status === 'active' ? undefined : 'warning'" effect="plain">
                {{ row.status || "—" }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="Updated" width="120">
            <template #default="{ row }">{{ row.updatedFmt }}</template>
          </el-table-column>
          <el-table-column label="SLA" width="100" align="center">
            <template #default="{ row }">
              <el-tag size="small" :type="row.slaDays > 21 ? 'danger' : row.slaDays > 14 ? 'warning' : 'success'" effect="dark">
                {{ row.slaDays }}d
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="Action" width="100" align="center">
            <template #default="{ row }">
              <el-button size="small" type="primary" link @click="openFile(row.path)">Review</el-button>
            </template>
          </el-table-column>
        </el-table>
      </section>
    </template>
  </StandardRoleDashboard>

  <KnowledgePreviewDialog ref="previewDlg" />
</template>

<script setup lang="ts" name="CuratorDashboard">
import { computed, ref } from "vue";
import { Cpu } from "@element-plus/icons-vue";
import StandardRoleDashboard from "../components/StandardRoleDashboard.vue";
import KnowledgePreviewDialog from "@/components/KnowledgePreviewDialog/KnowledgePreviewDialog.vue";
import { useRoleDashboard } from "../composables/useRoleDashboard";

const { flatFiles, stats } = useRoleDashboard("curator", { pollIntervalMs: 90_000 });
const previewDlg = ref<InstanceType<typeof KnowledgePreviewDialog> | null>(null);

/* ── CDD 6 axes health metrics (auto-computed) ──────────── */
const healthAxes = computed(() => {
  const total = stats.value.total || 1;
  const threeDigit = flatFiles.value.filter(f => /^\d{3}-/.test(f.file.name)).length;
  const frontmatter = flatFiles.value.filter(f => f.file.meta && Object.keys(f.file.meta).length > 2).length;
  const withStatus = flatFiles.value.filter(f => f.file.meta?.status).length;
  const withOwner = flatFiles.value.filter(f => (f.file.meta as any)?.owner).length;
  const withNextReview = flatFiles.value.filter(f =>
    (f.file.meta as any)?.next_review_at || (f.file.meta as any)?.review_after
  ).length;
  const withinSla = flatFiles.value.filter(f => {
    const updated = (f.file.updatedAt ?? 0) as number;
    if (!updated) return false;
    const daysSince = (Date.now() / 1000 - updated) / 86400;
    return daysSince <= 21;
  }).length;

  const pct = (x: number) => Math.round((x / total) * 100);
  return [
    { icon: "🔢", label: "三位编号一致性", value: pct(threeDigit), color: threeDigit / total >= 0.99 ? "#10b981" : threeDigit / total >= 0.95 ? "#f59e0b" : "#ef4444", sub: `${threeDigit}/${total} files match /^\\d{3}-/` },
    { icon: "📇", label: "Frontmatter 完整度", value: pct(frontmatter), color: frontmatter / total >= 0.95 ? "#10b981" : frontmatter / total >= 0.8 ? "#f59e0b" : "#ef4444", sub: "≥2 meta fields = populated" },
    { icon: "✅", label: "Status 字段覆盖", value: pct(withStatus), color: withStatus / total >= 0.9 ? "#10b981" : withStatus / total >= 0.7 ? "#f59e0b" : "#ef4444", sub: "stable / active / evolving / draft" },
    { icon: "👤", label: "Owner 字段覆盖", value: pct(withOwner), color: withOwner / total >= 0.8 ? "#10b981" : withOwner / total >= 0.5 ? "#f59e0b" : "#ef4444", sub: "Unowned = orphan" },
    { icon: "🗓️", label: "Next-Review 锚点", value: pct(withNextReview), color: withNextReview / total >= 0.85 ? "#10b981" : withNextReview / total >= 0.6 ? "#f59e0b" : "#ef4444", sub: "meta.next_review_at populated" },
    { icon: "⌛", label: "21-day SLA 合规", value: pct(withinSla), color: withinSla / total >= 0.9 ? "#10b981" : withinSla / total >= 0.7 ? "#f59e0b" : "#ef4444", sub: "stale = review queue candidate" }
  ];
});

/* ── Review Queue: overdue (>14 days) knowledge items ───── */
interface ReviewRow {
  title: string;
  path: string;
  domain: string;
  domainIcon: string;
  status: string;
  slaDays: number;
  updatedFmt: string;
}
const reviewItems = computed<ReviewRow[]>(() => {
  const now = Date.now() / 1000;
  const rows: ReviewRow[] = [];
  for (const r of flatFiles.value) {
    const updated = (r.file.updatedAt ?? 0) as number;
    if (!updated) continue;
    const daysSince = Math.floor((now - updated) / 86400);
    if (daysSince <= 14) continue; // within SLA
    rows.push({
      title: r.title,
      path: r.path,
      domain: r.domain,
      domainIcon: r.domainIcon,
      status: r.file.meta?.status || "unknown",
      slaDays: daysSince,
      updatedFmt: new Date(updated * 1000).toLocaleDateString("zh-CN", { year: "2-digit", month: "2-digit", day: "2-digit" })
    });
  }
  return rows.sort((a, b) => b.slaDays - a.slaDays).slice(0, 50);
});

function openFile(path: string) {
  previewDlg.value?.open(path);
}
</script>

<style lang="scss" scoped>
@use "../styles/roleDashboard.scss";

.cur-page__ribbon {
  display: flex;
  gap: 16px;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  padding: 12px 18px;
  background: linear-gradient(
    90deg,
    color-mix(in srgb, #10b981 10%, transparent),
    color-mix(in srgb, #1677ff 8%, transparent)
  );
  border: 1px solid color-mix(in srgb, #10b981 40%, transparent);
  border-radius: 12px;
}
.cur-page__ribbon-title {
  display: flex;
  gap: 8px;
  align-items: center;
  font-weight: 700;
  color: #10b981;
  font-size: 13px;
}
.cur-page__ribbon-metrics {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}
.cur-health {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 10px;
}
.cur-health__item {
  padding: 10px 14px;
  background: var(--el-fill-color-lighter);
  border-radius: 10px;
  border: 1px solid var(--el-border-color-lighter);
}
.cur-health__label-row {
  display: flex;
  gap: 6px;
  align-items: center;
  margin-bottom: 6px;
}
.cur-health__icon { font-size: 15px; }
.cur-health__label { flex: 1; font-size: 12px; font-weight: 600; }
.cur-health__pct { font-weight: 800; font-variant-numeric: tabular-nums; font-size: 13px; }
.cur-health__sub { margin-top: 4px; font-size: 11px; color: var(--el-text-color-placeholder); }
.cur-review__empty { padding: 8px 0 4px; }
.cur-review__name {
  color: var(--el-color-primary);
  cursor: pointer;
  font-weight: 500;
  &:hover { text-decoration: underline; }
}
</style>
