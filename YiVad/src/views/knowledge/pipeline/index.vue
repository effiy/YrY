<template>
  <div class="pipeline">
    <header class="pipeline__header">
      <h1>Software Delivery Pipeline</h1>
      <p>
        Seven roles, four stages, one causal chain — from <em>why build it</em> to <em>how to run it</em>.
        Each stage has a clear input → output contract: upstream roles produce artifacts that downstream roles consume.
      </p>
    </header>

    <!-- Cross-cutting layers -->
    <div class="pipeline__layers">
      <el-card
        v-for="layer in crossCuttingLayers"
        :key="layer.id"
        class="pipeline__layer-card"
        :style="{ borderTopColor: layerColors[layer.id] }"
        shadow="hover"
        @click="goToStage(layer.id)"
      >
        <div class="pipeline__stage-head">
          <span class="pipeline__stage-num" :style="{ background: layerColors[layer.id] }">
            {{ layer.icon }}
          </span>
          <div class="pipeline__stage-title">
            <h2 class="pipeline__stage-name">{{ layer.label }}</h2>
            <span class="pipeline__stage-role" @click.stop="previewRole(layer.role)">{{ layer.role }}</span>
          </div>
        </div>
        <p class="pipeline__stage-desc">{{ layer.description }}</p>
        <div class="pipeline__stage-stats">
          <span class="pipeline__stage-stats-total">{{ statsFor(layer.category).total }} files</span>
        </div>
      </el-card>
    </div>

    <!-- Pipeline Stages -->
    <div class="pipeline__flow">
      <div class="pipeline__flow-track" />
      <div v-for="(stage, i) in stages" :key="stage.id" class="pipeline__stage">
        <div v-if="i > 0" class="pipeline__stage-connector">
          <svg width="32" height="22" viewBox="0 0 32 22">
            <polyline points="4,5 20,11 4,17" fill="none" stroke="var(--el-border-color-darker)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        </div>
        <el-card
          class="pipeline__stage-card"
          :style="{ borderTopColor: stageColors[stage.id] }"
          shadow="hover"
          @click="goToStage(stage.id)"
        >
          <div class="pipeline__stage-head">
            <span class="pipeline__stage-num" :style="{ background: stageColors[stage.id] }">
              {{ i + 1 }}
            </span>
            <div class="pipeline__stage-title">
              <h2 class="pipeline__stage-name">{{ stage.name }}</h2>
              <span class="pipeline__stage-role" @click.stop="previewRole(stage.role)">{{ stage.role }}</span>
            </div>
          </div>

          <p class="pipeline__stage-desc">{{ stage.description }}</p>

          <div class="pipeline__stage-stats">
            <span class="pipeline__stage-stats-total">{{ statsFor(stage.category).total }} files</span>
          </div>
        </el-card>
      </div>
    </div>

    <el-divider style="margin: 12px 0" />

    <!-- Decision Tree -->
    <section class="pipeline__decision">
      <h2>Role Boundary Decision Tree</h2>
      <p class="pipeline__decision-sub">Not sure which role owns a question? Follow the decision path.</p>
      <div class="pipeline__decision-list">
        <div v-for="(rule, i) in decisionTree" :key="i" class="pipeline__decision-item">
          <span class="pipeline__decision-num">{{ i + 1 }}</span>
          <span class="pipeline__decision-q">{{ rule.question }}</span>
          <svg class="pipeline__decision-arrow" width="20" height="20" viewBox="0 0 20 20">
            <line x1="2" y1="10" x2="14" y2="10" stroke="var(--el-text-color-placeholder)" stroke-width="1.5" />
            <polyline points="10,5 16,10 10,15" fill="none" stroke="var(--el-text-color-placeholder)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
          <span class="pipeline__decision-role">{{ rule.role }}</span>
        </div>
      </div>
    </section>

    <KnowledgePreviewDialog ref="previewDlg" />
  </div>
</template>

<script setup lang="ts" name="pipelineHub">
import { ref, reactive, onMounted } from "vue";
import { useRouter } from "vue-router";
import { stages, decisionTree, stageColors, crossCuttingLayers } from "./constants";
import { listKnowledgeFiles } from "@/api/modules/knowledgeService";
import KnowledgePreviewDialog from "@/views/aiChat/components/KnowledgePreviewDialog.vue";

const router = useRouter();
const previewDlg = ref<InstanceType<typeof KnowledgePreviewDialog> | null>(null);
const statsLoading = ref(false);

const layerColors: Record<string, string> = {
  business: "#6366f1",
  ai: "#22c55e",
  governance: "#f59e0b"
};

/** File counts per category key: { total, yiai, yivad, yipet } */
const stageStats = reactive<Record<string, { total: number; yiai: number; yivad: number; yipet: number }>>({});

function countProject(paths: string[], seg: string): number {
  return paths.filter(p => p.toLowerCase().includes(`/${seg}/`) || p.toLowerCase().includes(`/${seg}-`)).length;
}

async function loadStats() {
  statsLoading.value = true;
  try {
    const res = await listKnowledgeFiles();
    const allPaths = res.files.map(f => f.path);
    // Collect all unique categories from stages + cross-cutting layers
    const categories = new Set<string>();
    for (const s of stages) categories.add(s.category);
    for (const l of crossCuttingLayers) categories.add(l.category);
    for (const cat of categories) {
      const catPaths = allPaths.filter(p => p.startsWith(cat + "/") || p.startsWith(cat.replace(/-/g, "_") + "/"));
      stageStats[cat] = {
        total: catPaths.length,
        yiai: countProject(catPaths, "yiai"),
        yivad: countProject(catPaths, "yivad"),
        yipet: countProject(catPaths, "yipet")
      };
    }
  } catch {
    // Stats are optional — don't block the page
  } finally {
    statsLoading.value = false;
  }
}

function statsFor(category: string) {
  return stageStats[category] || { total: 0, yiai: 0, yivad: 0, yipet: 0 };
}

/** Resolve a role string (e.g. "executiver/" or "srer/release/ + engineer/quality-security/")
 *  to its base role README.md path. */
function resolveRolePath(role: string): string {
  const first = role.split(/[+\s]+/)[0].replace(/\/$/, "");
  const base = first.split("/")[0];
  return `${base}/README.md`;
}

function previewRole(role: string) {
  previewDlg.value?.open(resolveRolePath(role));
}

const stageIdToRoute: Record<string, string> = {
  requirements: "/producter",
  decisions: "/leader",
  "design-build": "/engineer",
  "quality-release": "/srer",
  business: "/executiver",
  ai: "/aier",
  governance: "/curator"
};

function goToStage(stageId: string) {
  const route = stageIdToRoute[stageId];
  if (route) router.push({ path: route });
}

onMounted(() => {
  loadStats();
});
</script>

<style scoped lang="scss">
.pipeline {
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  padding: 20px 24px;
  background: var(--el-bg-color-page);
}

// ── Header ──────────────────────────────────────────────
.pipeline__header {
  margin-bottom: 14px;

  h1 {
    margin: 0 0 4px;
    font-size: 20px;
    font-weight: 700;
  }

  p {
    margin: 0;
    font-size: 13px;
    color: var(--el-text-color-secondary);
    line-height: 1.6;
  }
}

// ── Cross-cutting layers ────────────────────────────────
.pipeline__layers {
  display: flex;
  gap: 12px;
  margin-bottom: 18px;
}

.pipeline__layer-card {
  flex: 1 1 0;
  min-width: 0;
  border-top: 3px solid var(--el-color-primary);
  border-radius: 10px;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;

  &:hover {
    transform: translateY(-3px);
  }

  :deep(.el-card__body) {
    padding: 12px;
  }
}

// ── Pipeline flow ───────────────────────────────────────
.pipeline__flow {
  display: flex;
  gap: 0;
  margin: 2px 0 8px;
  position: relative;
}

.pipeline__flow-track {
  position: absolute;
  top: 50px;
  left: 16px;
  right: 16px;
  height: 2px;
  background: linear-gradient(
    to right,
    v-bind("stageColors.requirements"),
    v-bind("stageColors.decisions"),
    v-bind("stageColors['design-build']"),
    v-bind("stageColors['quality-release']")
  );
  opacity: 0.25;
  border-radius: 1px;
  z-index: 0;
}

.pipeline__stage {
  display: flex;
  align-items: flex-start;
  flex: 1 1 0;
  min-width: 0;
  position: relative;
  z-index: 1;
}

.pipeline__stage-connector {
  display: flex;
  align-items: center;
  padding: 40px 0 0 0;
  flex-shrink: 0;
}

.pipeline__stage-card {
  flex: 1;
  border-top: 3px solid var(--el-color-primary);
  border-radius: 10px;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;

  &:hover {
    transform: translateY(-3px);
  }

  :deep(.el-card__body) {
    padding: 12px;
  }
}

.pipeline__stage-head {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  margin-bottom: 6px;
}

.pipeline__stage-num {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  color: #fff;
  font-size: 13px;
  font-weight: 700;
  flex-shrink: 0;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.15);
}

.pipeline__stage-title {
  min-width: 0;
}

.pipeline__stage-name {
  margin: 0;
  font-size: 14px;
  font-weight: 600;
  line-height: 1.3;
}

.pipeline__stage-role {
  display: inline-block;
  margin-top: 2px;
  font-size: 11px;
  font-family: "SF Mono", "Fira Code", monospace;
  color: var(--el-color-primary);
  cursor: pointer;
  transition: color 0.15s;

  &:hover {
    color: var(--el-color-primary-light-3);
    text-decoration: underline;
  }
}

// ── Deliverables chips ─────────────────────────────────
.pipeline__stage-flow {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin-bottom: 6px;
}

.pipeline__stage-flow-chip {
  display: inline-block;
  padding: 2px 8px;
  background: var(--el-color-primary-light-9);
  color: var(--el-color-primary);
  border-radius: 4px;
  font-size: 11px;
  font-weight: 500;
  cursor: pointer;
  white-space: nowrap;
  transition: background 0.15s, transform 0.15s;
  border: 1px solid var(--el-color-primary-light-7);

  &:hover {
    background: var(--el-color-primary-light-8);
    transform: translateY(-1px);
  }

  &--input {
    background: var(--el-fill-color);
    color: var(--el-text-color-secondary);
    border-color: var(--el-border-color-lighter);

    &:hover {
      background: var(--el-fill-color-light);
      color: var(--el-text-color-regular);
    }
  }
}

.pipeline__stage-flow-arrow {
  font-size: 12px;
  color: var(--el-text-color-placeholder);
  margin: 0 2px;
  font-weight: 700;
}

// ── Description ──────────────────────────────────────────
.pipeline__stage-desc {
  margin: 0 0 6px;
  font-size: 12px;
  line-height: 1.5;
  color: var(--el-text-color-secondary);
}

// ── Topics ───────────────────────────────────────────────
.pipeline__stage-topics {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin-bottom: 6px;
}

.pipeline__stage-topic {
  display: inline-block;
  padding: 2px 8px;
  background: var(--el-color-primary-light-9);
  color: var(--el-color-primary);
  border-radius: 4px;
  font-size: 11px;
  font-weight: 500;
  transition: background 0.15s;

  &:hover {
    background: var(--el-color-primary-light-8);
  }
}

// ── Stats ─────────────────────────────────────────────────
.pipeline__stage-stats {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  margin-top: 6px;
  padding-top: 6px;
  border-top: 1px solid var(--el-border-color-lighter);
}

.pipeline__stage-stats-total {
  font-size: 13px;
  font-weight: 700;
  color: var(--el-text-color-primary);
}

.pipeline__stage-stats-chip {
  font-size: 10px;
  font-weight: 600;
  padding: 1px 6px;
  border-radius: 3px;
  white-space: nowrap;

  &--yiai { background: #e6f0ff; color: #1677ff; }
  &--yivad { background: #e6f9f2; color: #10b981; }
  &--yipet { background: #fff7e6; color: #f59e0b; }
}

// ── Decision tree ───────────────────────────────────────
.pipeline__decision {
  margin-top: 0;

  h2 {
    margin: 0 0 2px;
    font-size: 15px;
    font-weight: 600;
  }
}

.pipeline__decision-sub {
  margin: 0 0 10px;
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

.pipeline__decision-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
  gap: 6px;
}

.pipeline__decision-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: var(--el-fill-color-lighter);
  border-radius: 6px;
  font-size: 12px;
  transition: background 0.15s, transform 0.15s;

  &:hover {
    background: var(--el-fill-color-light);
    transform: translateX(2px);
  }
}

.pipeline__decision-num {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: var(--el-color-primary-light-9);
  color: var(--el-color-primary);
  font-size: 10px;
  font-weight: 700;
  flex-shrink: 0;
}

.pipeline__decision-q {
  flex: 1;
  color: var(--el-text-color-regular);
}

.pipeline__decision-arrow {
  flex-shrink: 0;
}

.pipeline__decision-role {
  font-family: "SF Mono", "Fira Code", monospace;
  font-weight: 600;
  font-size: 12px;
  color: var(--el-color-primary);
  background: var(--el-color-primary-light-9);
  padding: 2px 8px;
  border-radius: 4px;
  min-width: 90px;
  text-align: center;
}
</style>
