<template>
  <StandardRoleDashboard ref="dashboardRef" role-id="executive" :poll-interval-ms="120000">
    <!-- Decision-making banner -->
    <template #prepend>
      <div class="exec-page__ribbon">
        <div class="exec-page__ribbon-title">
          <el-icon :size="18"><Trophy /></el-icon>
          <span>Executive Decision Studio · 决策铁三角</span>
        </div>
        <div class="exec-page__ribbon-kpis">
          <el-tag size="small" effect="light" type="success" round>跨书 5★ 洞察 ≥ 12 条</el-tag>
          <el-tag size="small" effect="light" type="warning" round>阅读清单 RICE ≥ 60</el-tag>
          <el-tag size="small" effect="light" type="info" round>QBR 证据完整率 ≥ 90%</el-tag>
        </div>
      </div>

      <!-- Decision Triangle: Drucker / Grove / Horowitz / Simon -->
      <section class="exec-page__block exec-page__triangle">
        <div class="block-head">
          <h2 class="block-head__title">
            <span class="block-head__icon">🔺</span>Decision Iron Triangle · 决策铁三角
          </h2>
          <span class="block-head__count">原则层 / 执行层 / 反模式 / 认知层</span>
        </div>
        <div class="exec-tri-grid">
          <el-card
            v-for="(t, i) in triangle"
            :key="i"
            class="exec-tri-card"
            shadow="hover"
            @click="openNote(t.note)"
          >
            <div class="exec-tri-card__bar" :style="{ background: t.color }" />
            <div class="exec-tri-card__body">
              <div class="exec-tri-card__layer" :style="{ color: t.color }">{{ t.layer }}</div>
              <h3 class="exec-tri-card__name">{{ t.name }}</h3>
              <p class="exec-tri-card__quote">「{{ t.quote }}」</p>
              <div class="exec-tri-card__ref">📌 {{ t.note }}</div>
            </div>
          </el-card>
        </div>
      </section>
    </template>

    <!-- Four-quadrant view: OKR progress / RSS / Domain dist / Process records -->
    <template #after-redlines>
      <section class="exec-page__block">
        <div class="block-head">
          <h2 class="block-head__title">
            <span class="block-head__icon">🧭</span>Executive Quadrants · 四象限态势
          </h2>
          <span class="block-head__count">Strategy · Industry · Roadmap · Reading</span>
        </div>
        <div class="exec-quad">
          <!-- OKR Progress -->
          <div class="exec-quad__card">
            <h4 class="exec-quad__head">🎯 OKR Progress</h4>
            <ul class="exec-quad__list">
              <li v-for="o in okrData" :key="o.label">
                <span class="exec-quad__label">{{ o.label }}</span>
                <el-progress
                  :percentage="o.value"
                  :stroke-width="8"
                  :show-text="false"
                  :color="o.color"
                />
                <span class="exec-quad__pct">{{ o.value }}%</span>
              </li>
            </ul>
          </div>

          <!-- RSS Activity -->
          <div class="exec-quad__card">
            <h4 class="exec-quad__head">📰 RSS Activity · 剪枝率</h4>
            <div class="exec-rss">
              <el-statistic title="RSS Items This Week" :value="rss.items" />
              <el-statistic title="剪枝率 (RSS Prune)" :value="rss.prune" suffix="%" />
              <el-tag size="small" type="warning" effect="light" round style="margin-top:8px">
                Cap = 80% / 目标 ≥ 80%
              </el-tag>
            </div>
          </div>

          <!-- Knowledge by Domain (from stats) -->
          <div class="exec-quad__card">
            <h4 class="exec-quad__head">🗂️ Knowledge by Domain</h4>
            <ul class="exec-quad__domain">
              <li v-for="dir in subdirs" :key="dir.id">
                <span class="exec-quad__domain-icon">{{ dir.icon }}</span>
                <span class="exec-quad__domain-label">{{ dir.label }}</span>
                <el-progress
                  :percentage="pctOf(fileCounts[dir.id] || 0, stats.total)"
                  :stroke-width="6"
                  :show-text="false"
                  :color="dir.color"
                />
                <span class="exec-quad__domain-count">{{ fileCounts[dir.id] || 0 }}</span>
              </li>
            </ul>
          </div>

          <!-- Process Records (QBR / Board / Offsite) -->
          <div class="exec-quad__card">
            <h4 class="exec-quad__head">📒 Process Records</h4>
            <div class="exec-process">
              <div class="exec-process__item">
                <span class="exec-process__dot" style="background:#10b981"></span>
                <div>
                  <b>2025 Q3 QBR</b>
                  <div style="font-size:11px;color:var(--el-text-color-secondary)">证据完整率 91% / 36 KR reviewed</div>
                </div>
              </div>
              <div class="exec-process__item">
                <span class="exec-process__dot" style="background:#1677ff"></span>
                <div>
                  <b>Board Meeting #42</b>
                  <div style="font-size:11px;color:var(--el-text-color-secondary)">YiVad LCP 2s · Burn-Rate OK</div>
                </div>
              </div>
              <div class="exec-process__item">
                <span class="exec-process__dot" style="background:#7c3aed"></span>
                <div>
                  <b>Offsite: Strategy 2026</b>
                  <div style="font-size:11px;color:var(--el-text-color-secondary)">3 pillar + 12 跨书洞察</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </template>
  </StandardRoleDashboard>
</template>

<script setup lang="ts" name="ExecutiveDashboard">
import { computed, ref } from "vue";
import { Trophy } from "@element-plus/icons-vue";
import { ElMessage } from "element-plus";
import StandardRoleDashboard from "../components/StandardRoleDashboard.vue";
import { useRoleDashboard } from "../composables/useRoleDashboard";

const {
  subdirs, fileCounts, stats, resolveFile
} = useRoleDashboard("executive", { pollIntervalMs: 120_000 });

/** Reuse the single preview dialog exposed by StandardRoleDashboard
 *  (keeps only one <KnowledgePreviewDialog> mounted — SSOT). */
const dashboardRef = ref<InstanceType<typeof StandardRoleDashboard> | null>(null);

/* ── Decision Iron Triangle ──────────────────────────────── */
interface Triangle {
  layer: string;
  name: string;
  quote: string;
  color: string;
  /** Relative file ref under `executive/`, matched against real YiKnowledge files. */
  note: string;
}
const triangle: Triangle[] = [
  {
    layer: "原则层 · Principle",
    name: "Peter Drucker",
    quote: "Culture eats strategy for breakfast.",
    color: "#1677ff",
    note: "reading-list/010-阅读-读书笔记-卓有成效的管理者.md"
  },
  {
    layer: "方法层 · Execution",
    name: "Andy Grove",
    quote: "Only the paranoid survive — OKR 驱动产出.",
    color: "#10b981",
    note: "reading-list/002-阅读-读书笔记-高产出管理.md"
  },
  {
    layer: "反模式 · AntiPattern",
    name: "Ben Horowitz",
    quote: "There are no silver bullets, only lead bullets.",
    color: "#ef4444",
    note: "reading-list/005-阅读-读书笔记-创业维艰.md"
  },
  {
    layer: "认知层 · Cognition",
    name: "Herbert Simon",
    quote: "满意解 vs 最优解 · Bounded Rationality.",
    color: "#f59e0b",
    note: "reading-list/012-阅读-读书笔记-优雅的难题.md"
  }
];
function openNote(notePath: string) {
  const f = resolveFile(notePath);
  if (!f) {
    ElMessage.warning(`尚未索引: executive/${notePath}`);
    return;
  }
  dashboardRef.value?.openFile(f);
}

/* ── OKR Progress mock ──────────────────────────────────── */
const okrData = [
  { label: "Strategy / 战略", value: 76, color: "#1677ff" },
  { label: "Industry / 行业洞察", value: 62, color: "#10b981" },
  { label: "Roadmap / 路线图", value: 81, color: "#7c3aed" },
  { label: "Reading / 阅读清单", value: 58, color: "#f59e0b" }
];

/* ── RSS mock ───────────────────────────────────────────── */
const rss = {
  items: 387,
  prune: 82
};

/* ── helpers ────────────────────────────────────────────── */
function pctOf(part: number, total: number): number {
  return total > 0 ? Math.round((part / total) * 100) : 0;
}
</script>

<style lang="scss" scoped>
@use "../styles/roleDashboard.scss";

.exec-page__ribbon {
  display: flex;
  gap: 16px;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  padding: 12px 18px;
  background: linear-gradient(
    90deg,
    color-mix(in srgb, #f59e0b 10%, transparent),
    color-mix(in srgb, #7c3aed 8%, transparent)
  );
  border: 1px solid color-mix(in srgb, #f59e0b 40%, transparent);
  border-radius: 12px;
  margin-bottom: 14px;
}
.exec-page__ribbon-title {
  display: flex; gap: 8px; align-items: center;
  font-weight: 700; color: #b45309; font-size: 13px;
}
.exec-page__ribbon-kpis {
  display: flex; gap: 8px; flex-wrap: wrap;
}

.exec-page__triangle {
  margin-bottom: 14px;
}
.exec-tri-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 10px;
}
.exec-tri-card {
  cursor: pointer;
  overflow: hidden;
  border-radius: 10px !important;
  position: relative;
  :deep(.el-card__body) { padding: 0 !important; }
  transition: transform 0.18s;
  &:hover { transform: translateY(-2px); }
}
.exec-tri-card__bar {
  position: absolute; top: 0; left: 0; bottom: 0;
  width: 4px;
}
.exec-tri-card__body {
  padding: 12px 14px 14px 18px;
}
.exec-tri-card__layer {
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  margin-bottom: 4px;
}
.exec-tri-card__name {
  margin: 0 0 6px;
  font-size: 15px;
  font-weight: 800;
}
.exec-tri-card__quote {
  margin: 0 0 8px;
  font-size: 12px;
  font-style: italic;
  line-height: 1.5;
  color: var(--el-text-color-secondary);
}
.exec-tri-card__ref {
  font-family: ui-monospace, Menlo, Consolas, monospace;
  font-size: 10px;
  color: var(--el-text-color-placeholder);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* Quadrants */
.exec-quad {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
  @media (max-width: 900px) { grid-template-columns: 1fr; }
}
.exec-quad__card {
  padding: 14px 16px;
  background: var(--el-fill-color-lighter);
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 10px;
}
.exec-quad__head {
  margin: 0 0 10px;
  font-size: 13px;
  font-weight: 700;
}
.exec-quad__list {
  list-style: none; padding: 0; margin: 0;
  display: flex; flex-direction: column; gap: 8px;
}
.exec-quad__list li {
  display: grid;
  grid-template-columns: 110px 1fr 46px;
  gap: 8px;
  align-items: center;
  font-size: 12px;
}
.exec-quad__label { font-weight: 600; color: var(--el-text-color-regular); }
.exec-quad__pct {
  font-weight: 800;
  font-variant-numeric: tabular-nums;
  font-size: 12px;
  color: var(--el-text-color-secondary);
}
.exec-quad__domain {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-size: 12px;
  li {
    display: grid;
    grid-template-columns: 22px 88px 1fr 30px;
    gap: 6px;
    align-items: center;
  }
}
.exec-quad__domain-count {
  text-align: right;
  font-variant-numeric: tabular-nums;
  font-weight: 700;
  font-size: 11px;
  color: var(--el-text-color-secondary);
}
.exec-rss {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  :deep(.el-statistic__head) { font-size: 11px; }
  :deep(.el-statistic__content) { font-size: 20px; }
}
.exec-process {
  display: flex; flex-direction: column; gap: 10px;
}
.exec-process__item {
  display: flex; gap: 10px; align-items: flex-start;
  padding: 8px 10px;
  background: var(--el-bg-color);
  border-radius: 8px;
  border: 1px solid var(--el-border-color-lighter);
  font-size: 12px;
}
.exec-process__dot {
  width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; margin-top: 4px;
  box-shadow: 0 0 4px currentColor;
}
</style>
