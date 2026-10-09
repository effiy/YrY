<template>
  <StandardRoleDashboard role-id="aier" :poll-interval-ms="90000">
    <!-- AI Readiness banner -->
    <template #prepend>
      <div class="aier-page__ribbon">
        <div class="aier-page__ribbon-title">
          <el-icon :size="18"><Promotion /></el-icon>
          <span>AI Engineering · 生产级 LLM 系统构建</span>
        </div>
        <div class="aier-page__ribbon-kpis">
          <el-tag size="small" effect="light" type="danger" round>YiAi SSE Port = 10086</el-tag>
          <el-tag size="small" effect="light" type="warning" round>Embedding kill-switch = 开 (默认)</el-tag>
          <el-tag size="small" effect="light" type="success" round>kb_indexer 禁用 SimpleDirectoryReader</el-tag>
        </div>
      </div>
    </template>

    <!-- Learning Path 12-step (from roleConfig) + Domain cards -->
    <template #before-body>
      <section class="aier-page__block">
        <div class="block-head">
          <h2 class="block-head__title">
            <span class="block-head__icon">🛤️</span>Learning Path · 12 步生产化路径
          </h2>
          <span class="block-head__count">From foundations → eval harness → OKR</span>
        </div>
        <div class="aier-learning-grid">
          <div
            v-for="(step, i) in learningPath"
            :key="i"
            class="aier-step"
            :class="{ 'is-done': step.done }"
          >
            <div class="aier-step__num" :style="{ background: step.color }">{{ i + 1 }}</div>
            <div class="aier-step__body">
              <div class="aier-step__title">{{ step.title }}</div>
              <div class="aier-step__desc">{{ step.desc }}</div>
            </div>
            <el-icon v-if="step.done" :size="16" color="#10b981"><CircleCheckFilled /></el-icon>
          </div>
        </div>
      </section>

      <!-- Domain cards summary -->
      <section class="aier-page__block">
        <div class="block-head">
          <h2 class="block-head__title">
            <span class="block-head__icon">🗂️</span>Knowledge Domains · 五大知识域
          </h2>
          <span class="block-head__count">{{ subdirs.length }} subdirs · {{ stats.total }} files</span>
        </div>
        <div class="domain-grid">
          <el-card
            v-for="dir in subdirs"
            :key="dir.id"
            class="domain-card"
            shadow="hover"
            @click="jumpDir(dir.id)"
          >
            <div class="domain-card__head">
              <div class="domain-card__accent" :style="{ background: dir.color }" />
              <div class="domain-card__icon">{{ dir.icon }}</div>
              <div class="domain-card__info">
                <span class="domain-card__name">{{ dir.label }}</span>
                <span class="domain-card__count">{{ fileCounts[dir.id] || 0 }} files · {{ stableCount(dir.id) }} stable</span>
              </div>
            </div>
            <p class="domain-card__desc">{{ dir.desc }}</p>
          </el-card>
        </div>
      </section>
    </template>
  </StandardRoleDashboard>
</template>

<script setup lang="ts" name="AierDashboard">
import { computed } from "vue";
import { Promotion, CircleCheckFilled } from "@element-plus/icons-vue";
import StandardRoleDashboard from "../components/StandardRoleDashboard.vue";
import { useRoleDashboard } from "../composables/useRoleDashboard";
import { getRole } from "../roleConfig";

const {
  subdirs, fileCounts, filesByDir, stats, scrollTo
} = useRoleDashboard("aier", { pollIntervalMs: 90_000 });

const aierRole = getRole("aier");

/* 12-step learning path — derived from quickRefs + ad-hoc synthesis
 * This mirrors the legacy useAierData.ts definition but aligned to 3-digit filenames. */
interface Step { title: string; desc: string; color: string; done: boolean }
const learningPath = computed<Step[]>(() => {
  const found = (f: string) => !!resolveQuick(f);
  return [
    { title: "LLM 基础原理", desc: "Self-attention / KV-Cache / MoE / Quantization", color: "#1677ff", done: found("foundations/001-基础-LLM基础.md") },
    { title: "Embedding 选型", desc: "Bi-encoder / Cross-encoder / MTEB Benchmark", color: "#1677ff", done: found("platform/002-平台-Embedding选型.md") },
    { title: "Agent 架构模式", desc: "ReAct / Plan-Execute / Tool-Use / Reflection", color: "#10b981", done: found("methods/001-方法-Agent模式.md") },
    { title: "Prompt Engineering", desc: "CoT / ToT / Few-Shot / Structural Outputs", color: "#10b981", done: found("methods/002-方法-Prompt工程.md") },
    { title: "LLM 评估体系", desc: "LLM-as-Judge / Elo / Arena / Benchmark 陷阱", color: "#10b981", done: found("methods/004-方法-LLM评估框架.md") },
    { title: "Vector DB 对比", desc: "Milvus / Qdrant / PGVector / Chroma 权衡", color: "#7c3aed", done: found("platform/003-平台-VectorDB选型.md") },
    { title: "Provider 选型", desc: "OpenAI / Anthropic / Gemini / 本地模型 TCO", color: "#7c3aed", done: found("platform/001-平台-LLMProvider选型.md") },
    { title: "RAG 评估与优化", desc: "RAGAs / TruLens / 上下文窗口利用", color: "#7c3aed", done: found("methods/003-方法-RAG优化.md") },
    { title: "Harness 插件架构", desc: "7 套 Prompt 模板 · 工具包 · 沙箱", color: "#7c3aed", done: found("methods/005-方法-Harness插件架构.md") },
    { title: "ML 兜底模式", desc: "Classification / Clustering · LLM is overkill", color: "#f59e0b", done: found("machine-learning/001-ML-分类.md") },
    { title: "异常检测", desc: "Anomaly detection · 生产异常实时告警", color: "#f59e0b", done: found("machine-learning/004-ML-异常检测.md") },
    { title: "OKR 季度评审", desc: "Goal / KR / Evidence · 确认门", color: "#ef4444", done: found("okr/001-okr-OKR总览.md") }
  ];
});

function resolveQuick(f: string) {
  return aierRole.quickRefs.find(q => q.file === f);
}
function stableCount(dirId: string): number {
  return (filesByDir.value[dirId] || []).filter(f =>
    f.meta?.status === "stable" || f.meta?.status === "active"
  ).length;
}
function jumpDir(id: string) {
  scrollTo(id);
}
</script>

<style lang="scss" scoped>
@use "../styles/roleDashboard.scss";

.aier-page__ribbon {
  display: flex;
  gap: 16px;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  padding: 12px 18px;
  background: linear-gradient(
    90deg,
    color-mix(in srgb, #7c3aed 12%, transparent),
    color-mix(in srgb, #10b981 8%, transparent)
  );
  border: 1px solid color-mix(in srgb, #7c3aed 40%, transparent);
  border-radius: 12px;
}
.aier-page__ribbon-title {
  display: flex; gap: 8px; align-items: center;
  font-weight: 700; color: #7c3aed; font-size: 13px;
}
.aier-page__ribbon-kpis {
  display: flex; gap: 8px; flex-wrap: wrap;
}

.aier-learning-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 10px;
}
.aier-step {
  display: flex;
  gap: 10px;
  align-items: flex-start;
  padding: 12px;
  border-radius: 10px;
  background: var(--el-fill-color-lighter);
  border: 1px solid var(--el-border-color-lighter);
  transition: all 0.18s;
  &:hover {
    transform: translateY(-2px);
    background: var(--el-fill-color-light);
  }
  &.is-done {
    border-color: color-mix(in srgb, #10b981 40%, transparent);
  }
}
.aier-step__num {
  display: inline-flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  font-size: 12px;
  font-weight: 800;
  color: #fff;
  border-radius: 8px;
}
.aier-step__body { flex: 1; min-width: 0; }
.aier-step__title {
  font-size: 13px;
  font-weight: 700;
  margin-bottom: 2px;
}
.aier-step__desc {
  font-size: 11px;
  line-height: 1.5;
  color: var(--el-text-color-secondary);
}
</style>
