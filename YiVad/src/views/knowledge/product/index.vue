<template>
  <StandardRoleDashboard role-id="product" :poll-interval-ms="90000">
    <!-- Pipeline position banner — unique to product page -->
    <template #prepend>
      <div class="prod-page__ribbon">
        <div class="prod-page__ribbon-title">
          <el-icon :size="18"><Share /></el-icon>
          <span>Delivery Pipeline · Stage 1 / 4 — Product</span>
        </div>
        <div class="prod-page__ribbon-stage">
          <span class="prod-stage is-done" title="Product ✓"><b>①</b> Product</span>
          <el-icon :size="12" color="#a0aec0"><ArrowRight /></el-icon>
          <span class="prod-stage" title="Build"><b>②</b> Build</span>
          <el-icon :size="12" color="#a0aec0"><ArrowRight /></el-icon>
          <span class="prod-stage" title="Ship"><b>③</b> Ship</span>
          <el-icon :size="12" color="#a0aec0"><ArrowRight /></el-icon>
          <span class="prod-stage" title="Run/Learn"><b>④</b> Run/Learn</span>
        </div>
        <div class="prod-page__ribbon-action">
          <el-tag size="small" type="success" effect="light" round>
            Hand-off from Product → Build: PRD 15-field Frontmatter Gate
          </el-tag>
        </div>
      </div>
    </template>

    <!-- Custom PM-only section: RICE vs WSJF prioritization guardrail -->
    <template #after-redlines>
      <section class="prod-page__block">
        <div class="block-head">
          <h2 class="block-head__title">
            <span class="block-head__icon">📊</span>
            Prioritization Guardrail · 优先级校准
          </h2>
          <span class="block-head__count">RICE + WSJF dual-scoring</span>
        </div>
        <div class="prod-guardrail">
          <div class="prod-guardrail__col">
            <h4>🟢 RICE (customer side)</h4>
            <ul>
              <li><b>R</b>each · monthly unique users affected</li>
              <li><b>I</b>mpact · 0.25 / 0.5 / 1 / 2 / 3</li>
              <li><b>C</b>onfidence · evidence ratio (≥80% = ship it)</li>
              <li><b>E</b>ffort · person-months</li>
            </ul>
            <el-statistic title="Minimum Requirement" :value="60" suffix="= (R×I×C)/E ≥ 60" />
          </div>
          <div class="prod-guardrail__col">
            <h4>🔵 WSJF (portfolio side)</h4>
            <ul>
              <li><b>CoD</b> = User-BizVal + Time-Critical + RR-OE</li>
              <li>Job Size = Fibonacci (1,2,3,5,8,13,21)</li>
              <li>WSJF = CoD ÷ JobSize</li>
              <li>Top 20% EPICs get OKR slots first</li>
            </ul>
            <el-statistic title="WSJF Threshold" :value="3" suffix="= cut line" />
          </div>
          <div class="prod-guardrail__col">
            <h4>🏴 Anti-MarTech Pattern</h4>
            <ul>
              <li>❌ Micro-frontends (unless ≥3 teams + 6 sprints)</li>
              <li>❌ "AI features" without LLM eval harness</li>
              <li>❌ Custom auth / payment / search / charting</li>
              <li>❌ Manual release without Feature Flags</li>
            </ul>
            <el-tag type="danger" effect="light" round>
              6-week death-spiral → call Product Council
            </el-tag>
          </div>
        </div>
      </section>
    </template>
  </StandardRoleDashboard>
</template>

<script setup lang="ts" name="ProductDashboard">
import { Share, ArrowRight } from "@element-plus/icons-vue";
import StandardRoleDashboard from "../components/StandardRoleDashboard.vue";
</script>

<style lang="scss" scoped>
@use "../styles/roleDashboard.scss";

.prod-page__ribbon {
  display: flex;
  gap: 16px;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  padding: 12px 18px;
  background: linear-gradient(
    90deg,
    color-mix(in srgb, #1677ff 10%, transparent),
    color-mix(in srgb, #7c3aed 8%, transparent)
  );
  border: 1px solid var(--el-color-primary-light-6);
  border-radius: 12px;
}
.prod-page__ribbon-title {
  display: flex; gap: 8px; align-items: center;
  font-weight: 700; color: var(--el-color-primary); font-size: 13px;
}
.prod-page__ribbon-stage {
  display: flex; gap: 8px; align-items: center;
  font-size: 12px; color: var(--el-text-color-secondary);
}
.prod-stage {
  display: inline-flex; gap: 4px; align-items: center;
  padding: 3px 10px; border-radius: 999px;
  background: var(--el-fill-color-light);
  b { font-size: 10px; font-weight: 800; }
  &.is-done {
    color: #10b981;
    background: color-mix(in srgb, #10b981 12%, transparent);
  }
}
.prod-page__ribbon-action :deep(.el-tag) { font-size: 11px; }

.prod-guardrail {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  @media (max-width: 960px) { grid-template-columns: 1fr; }
}
.prod-guardrail__col {
  padding: 12px 14px;
  background: var(--el-fill-color-lighter);
  border-radius: 10px;
  border: 1px solid var(--el-border-color-lighter);

  h4 {
    margin: 0 0 6px;
    font-size: 13px;
    font-weight: 700;
  }
  ul {
    margin: 0 0 10px;
    padding-left: 16px;
    font-size: 12px;
    color: var(--el-text-color-regular);
    line-height: 1.6;
    li { margin-bottom: 2px; }
  }
  b { font-weight: 700; color: var(--el-color-primary); }
}
</style>
