<template>
  <StandardRoleDashboard role-id="sre" :poll-interval-ms="60000">
    <!-- SRE readiness banner -->
    <template #prepend>
      <div class="sre-page__ribbon">
        <div class="sre-page__ribbon-title">
          <el-icon :size="18"><Monitor /></el-icon>
          <span>SRE War Room · 生产可靠性作战室</span>
        </div>
        <div class="sre-page__ribbon-status">
          <el-tag size="small" type="success" effect="light" round>
            <span class="sre-pulse" />Crash Free = {{ crashFree }}% (target ≥99.9)
          </el-tag>
          <el-tag size="small" type="warning" effect="light" round>
            Burn-Rate 1h = 14.4% cap
          </el-tag>
          <el-tag size="small" type="info" effect="light" round>
            YiPot binary ≤ 18MB
          </el-tag>
        </div>
      </div>
    </template>

    <!-- SLO Monitor (Red-line KPI live view + mini sparkline) -->
    <template #after-stats>
      <section class="sre-page__block">
        <div class="block-head">
          <h2 class="block-head__title">
            <span class="block-head__icon">🎯</span>SLO Live Board · 核心服务水平指标
          </h2>
          <span class="block-head__count">6 Red Lines · auto-poll every 60s</span>
        </div>
        <div class="sre-slo-grid">
          <el-card
            v-for="(r, i) in role.redLines"
            :key="i"
            class="sre-slo"
            shadow="hover"
          >
            <div class="sre-slo__head">
              <h3 class="sre-slo__label">{{ r.label }}</h3>
              <el-tag
                size="small"
                :type="sloStatus(r, sloValues[i])"
                effect="dark"
                round
              >
                {{ sloStatus(r, sloValues[i]) === "success" ? "✅ SLO" : sloStatus(r, sloValues[i]) === "warning" ? "⚠️ Warn" : "🚨 Breach" }}
              </el-tag>
            </div>
            <div class="sre-slo__val">
              <span class="sre-slo__num">{{ sloValues[i] }}</span>
              <span v-if="r.unit" class="sre-slo__unit">{{ r.unit }}</span>
            </div>
            <div class="sre-slo__threshold">
              {{ r.direction === "min" ? "≥" : "≤" }} {{ r.threshold }}{{ r.unit }}
            </div>
            <el-progress
              :percentage="Math.min(100, sloPercent(r, sloValues[i]))"
              :stroke-width="6"
              :show-text="false"
              :color="sloProgressColor(r, sloValues[i])"
            />
            <div v-if="r.ref" class="sre-slo__ref">📌 {{ r.ref }}</div>
          </el-card>
        </div>
      </section>
    </template>

    <!-- GameDay + Oncall handoff entry -->
    <template #after-redlines>
      <section class="sre-page__block">
        <div class="block-head">
          <h2 class="block-head__title">
            <span class="block-head__icon">🎮</span>GameDay & Oncall · 预案与交接
          </h2>
          <span class="block-head__count">6 季度预案 / 3 shift rotations</span>
        </div>
        <el-tabs type="border-card" class="sre-tabs">
          <el-tab-pane label="🗡️ Incident Response" name="ir">
            <ul class="sre-list">
              <li><el-tag type="danger" size="small" effect="dark">SEV-1</el-tag> War room：5 分钟内 zoom + slack #p0 · 15 分钟 CTO 出席</li>
              <li><el-tag type="warning" size="small" effect="dark">SEV-2</el-tag> Blast-radius <1% 用户 · 2h 内临时回滚 + postmortem</li>
              <li><el-tag type="info" size="small" effect="dark">SEV-3</el-tag> 下一发版修复 · 周报同步</li>
            </ul>
          </el-tab-pane>
          <el-tab-pane label="🎯 Q GameDay 6-Scenario" name="gameday">
            <div class="sre-gameday-grid">
              <div v-for="(g, i) in gameDays" :key="i" class="sre-gameday">
                <div class="sre-gameday__num">{{ i + 1 }}</div>
                <div class="sre-gameday__body">
                  <div class="sre-gameday__title">{{ g.title }}</div>
                  <div class="sre-gameday__desc">{{ g.desc }}</div>
                </div>
                <el-tag size="small" :type="g.level" effect="light" round>{{ g.levelText }}</el-tag>
              </div>
            </div>
          </el-tab-pane>
          <el-tab-pane label="📋 Oncall Handoff" name="handoff">
            <div class="sre-handoff">
              <div class="sre-handoff__col">
                <b>Shift C → Shift A</b>
                <p>Pending incidents: 0 · Active alerts: 3</p>
                <el-tag size="small" effect="light">Next oncall: 09:00 CST Monday</el-tag>
              </div>
              <div class="sre-handoff__col">
                <b>Must-Read</b>
                <ol>
                  <li>YiAi SSE 端口检查 = 10086</li>
                  <li>RSS 泄漏 < 10MB per 24h 窗口</li>
                  <li>Translation P95 ≤ 1s / OCR P95 ≤ 2s</li>
                </ol>
              </div>
              <div class="sre-handoff__col">
                <b>Hot</b>
                <div style="font-size:11px;color:#ef4444;font-weight:600">🔥 Burn-Rate 1h cap 14.4% — watch it</div>
              </div>
            </div>
          </el-tab-pane>
        </el-tabs>
      </section>
    </template>
  </StandardRoleDashboard>
</template>

<script setup lang="ts" name="SreDashboard">
import { computed, ref } from "vue";
import { Monitor } from "@element-plus/icons-vue";
import StandardRoleDashboard from "../components/StandardRoleDashboard.vue";
import { useRoleDashboard } from "../composables/useRoleDashboard";
import type { RoleDef, RedLineDef } from "../roleConfig";

const dash = useRoleDashboard("sre", { pollIntervalMs: 60_000 });
const role = dash.role; // ComputedRef<RoleDef> — auto-unwrapped in Vue templates

/* ── Shared helper: parse numeric threshold from RedLineDef (threshold is string with unit) ── */
function thresholdNum(t: string): number {
  const m = String(t).match(/-?\d+(\.\d+)?/);
  return m ? Number(m[0]) : 0;
}

/* ── SLO mock values (would come from metrics service in prod) ── */
const mockSlo = ref<number[]>([
  980,    // 翻译 P95 (ms) cap 1000 → ok
  1650,   // OCR P95 (ms) cap 2000 → ok
  99.94,  // Crash Free % min 99.9 → ok
  7.4,    // RSS泄漏 MB/24h cap 10 → ok
  11.8,   // Burn-Rate 1h % cap 14.4 → ok
  16.3    // YiPot binary MB cap 18 → ok
]);

const sloValues = computed(() => mockSlo.value);
const crashFree = computed(() => sloValues.value[2]);

function sloPercent(r: RedLineDef, val: number): number {
  const t = thresholdNum(r.threshold) || 1;
  if (r.direction === "max") return Math.min(100, Math.round((val / t) * 100));
  // For min: show margin above threshold (0-100 scale)
  const margin = Math.max(0, val - t);
  return Math.min(100, Math.round((margin / Math.max(0.1, t * 0.15)) * 100));
}
function sloProgressColor(r: RedLineDef, val: number): string {
  const t = thresholdNum(r.threshold);
  if (r.direction === "max") {
    const ratio = val / (t || 1);
    if (ratio >= 0.95) return "#ef4444";
    if (ratio >= 0.8) return "#f59e0b";
    return "#10b981";
  } else {
    const ratio = t ? val / t : 1;
    if (ratio < 1) return "#ef4444";
    if (ratio < 1.02) return "#f59e0b";
    return "#10b981";
  }
}
function sloStatus(r: RedLineDef, val: number): "success" | "warning" | "danger" | undefined {
  const t = thresholdNum(r.threshold);
  if (r.direction === "max") {
    if (t && val > t) return "danger";
    if (t && val > t * 0.9) return "warning";
    return t ? "success" : undefined;
  } else {
    if (t && val < t) return "danger";
    if (t && val < t * 1.02) return "warning";
    return t ? "success" : undefined;
  }
}

/* ── Quarterly GameDay plans ─────────────────────────────── */
interface GameDay {
  title: string;
  desc: string;
  level: "success" | "warning" | "danger" | "info" | undefined;
  levelText: string;
}
const gameDays: GameDay[] = [
  { title: "全量 Redis 模拟宕机", desc: "5s 切到 disk-local cache · 验证 RAG recall 降 20%", level: "danger", levelText: "SEV-1 Drill" },
  { title: "主 LLM provider 503", desc: "kill-switch off → 备用 endpoint 切换 验证 P95 <2s", level: "warning", levelText: "Failover" },
  { title: "KB vector index 损坏", desc: "从 snapshot 恢复 · SLA < 20min · 写入限流", level: "danger", levelText: "SEV-1 Drill" },
  { title: "大模型上下文泄漏", desc: "RSS leak >10MB 触发告警 · kill-chain 验证", level: "warning", levelText: "Safety" },
  { title: "Canary 30% → 回滚", desc: "OCR P95 从 2s → 2.5s，验证自动回滚 + rollback 文档", level: "info", levelText: "CDX" },
  { title: "YiPot 发布包体积暴增", desc: "release-build 超过 18MB · 触发 block 门禁", level: "warning", levelText: "Release Gate" }
];
</script>

<style lang="scss" scoped>
@use "../styles/roleDashboard.scss";

.sre-page__ribbon {
  display: flex;
  gap: 16px;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  padding: 12px 18px;
  background: linear-gradient(
    90deg,
    color-mix(in srgb, #ef4444 10%, transparent),
    color-mix(in srgb, #f59e0b 8%, transparent)
  );
  border: 1px solid color-mix(in srgb, #ef4444 40%, transparent);
  border-radius: 12px;
}
.sre-page__ribbon-title {
  display: flex; gap: 8px; align-items: center;
  font-weight: 700; color: #ef4444; font-size: 13px;
}
.sre-page__ribbon-status { display: flex; gap: 8px; flex-wrap: wrap; }

.sre-pulse {
  display: inline-block;
  width: 6px; height: 6px;
  background: currentColor;
  border-radius: 50%;
  margin-right: 6px;
  box-shadow: 0 0 6px currentColor;
  animation: sre-pulse 1.6s infinite;
}
@keyframes sre-pulse {
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.4); opacity: 0.6; }
}

.sre-slo-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 10px;
}
.sre-slo {
  border-radius: 10px !important;
  :deep(.el-card__body) { padding: 14px !important; }
}
.sre-slo__head {
  display: flex; justify-content: space-between; align-items: center; gap: 8px; margin-bottom: 8px;
}
.sre-slo__label {
  margin: 0;
  font-size: 12px;
  font-weight: 600;
  color: var(--el-text-color-secondary);
  line-height: 1.35;
}
.sre-slo__val {
  display: flex;
  gap: 4px;
  align-items: baseline;
  margin-bottom: 2px;
}
.sre-slo__num {
  font-size: 26px;
  font-weight: 800;
  font-variant-numeric: tabular-nums;
  color: var(--el-text-color-primary);
  line-height: 1;
}
.sre-slo__unit {
  font-size: 12px;
  color: var(--el-text-color-secondary);
}
.sre-slo__threshold {
  font-size: 11px;
  color: var(--el-text-color-placeholder);
  margin-bottom: 6px;
  font-variant-numeric: tabular-nums;
}
.sre-slo__ref {
  margin-top: 6px;
  font-size: 10px;
  font-family: ui-monospace, Menlo, Consolas, monospace;
  color: var(--el-text-color-placeholder);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.sre-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding-left: 18px;
  margin: 4px 0;
  font-size: 13px;
  color: var(--el-text-color-regular);
  li { line-height: 1.55; }
  :deep(.el-tag) { margin-right: 6px; }
}

.sre-gameday-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 8px;
}
.sre-gameday {
  display: flex;
  gap: 10px;
  padding: 10px 12px;
  background: var(--el-fill-color-lighter);
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 10px;
  align-items: flex-start;
}
.sre-gameday__num {
  display: inline-flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  width: 24px; height: 24px;
  font-size: 11px; font-weight: 800;
  color: #fff;
  background: #ef4444;
  border-radius: 7px;
}
.sre-gameday__body { flex: 1; min-width: 0; }
.sre-gameday__title { font-size: 13px; font-weight: 700; margin-bottom: 2px; }
.sre-gameday__desc { font-size: 11px; line-height: 1.45; color: var(--el-text-color-secondary); }

.sre-handoff {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  @media (max-width: 900px) { grid-template-columns: 1fr; }
}
.sre-handoff__col {
  padding: 10px 14px;
  background: var(--el-fill-color-lighter);
  border-radius: 10px;
  border: 1px solid var(--el-border-color-lighter);
  b { display:block; margin-bottom: 4px; font-size: 13px; }
  p, ol { font-size: 12px; line-height: 1.5; color: var(--el-text-color-regular); margin: 0 0 4px; }
  ol { padding-left: 18px; }
}
</style>
