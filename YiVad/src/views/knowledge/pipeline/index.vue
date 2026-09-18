<template>
  <div class="pipeline">
    <header class="pipeline__header">
      <h1>{{ $t("knowledge.pipeline.title") }}</h1>
      <p>
        {{ $t("knowledge.pipeline.subtitle") }}
      </p>
    </header>

    <!-- Cross-cutting layers -->
    <div class="pipeline__layers">
      <el-card
        v-for="layer in layerList"
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
        <div class="pipeline__stage-flow">
          <template v-if="layer.inputItems.length">
            <el-tooltip v-for="item in layer.inputItems" :key="item.id" :content="item.description" placement="top">
              <span class="pipeline__stage-flow-chip pipeline__stage-flow-chip--input" @click.stop="previewRole(layer.role)">{{
                item.label
              }}</span>
            </el-tooltip>
            <span class="pipeline__stage-flow-arrow">→</span>
          </template>
          <el-tooltip v-for="item in layer.outputItems" :key="item.id" :content="item.description" placement="top">
            <span class="pipeline__stage-flow-chip" @click.stop="previewRole(layer.role)">{{ item.label }}</span>
          </el-tooltip>
        </div>
        <div class="pipeline__stage-topics">
          <span v-for="topic in layer.topics" :key="topic.file" class="pipeline__stage-topic" @click.stop="goToStage(layer.id)">{{
            topic.label
          }}</span>
        </div>
        <div class="pipeline__stage-stats">
          <span class="pipeline__stage-stats-total">{{ $t("knowledge.pipeline.files", { n: statsFor(layer.category) }) }}</span>
        </div>
        <p class="pipeline__stage-boundary">{{ layer.boundary }}</p>
      </el-card>
    </div>

    <!-- Pipeline Stages -->
    <div class="pipeline__flow">
      <div class="pipeline__flow-track" />
      <div v-for="(stage, i) in stageList" :key="stage.id" class="pipeline__stage">
        <div v-if="i > 0" class="pipeline__stage-connector">
          <svg width="32" height="22" viewBox="0 0 32 22">
            <polyline
              points="4,5 20,11 4,17"
              fill="none"
              stroke="var(--el-border-color-darker)"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
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

          <div class="pipeline__stage-flow">
            <template v-if="stage.inputItems.length">
              <el-tooltip v-for="item in stage.inputItems" :key="item.id" :content="item.description" placement="top">
                <span class="pipeline__stage-flow-chip pipeline__stage-flow-chip--input" @click.stop="previewRole(stage.role)">{{
                  item.label
                }}</span>
              </el-tooltip>
              <span class="pipeline__stage-flow-arrow">→</span>
            </template>
            <el-tooltip v-for="item in stage.outputItems" :key="item.id" :content="item.description" placement="top">
              <span class="pipeline__stage-flow-chip" @click.stop="previewRole(stage.role)">{{ item.label }}</span>
            </el-tooltip>
          </div>

          <div class="pipeline__stage-topics">
            <span
              v-for="topic in stage.topics"
              :key="topic.file"
              class="pipeline__stage-topic"
              @click.stop="goToStage(stage.id)"
              >{{ topic.label }}</span
            >
          </div>

          <div class="pipeline__stage-stats">
            <span class="pipeline__stage-stats-total">{{ $t("knowledge.pipeline.files", { n: statsFor(stage.category) }) }}</span>
          </div>

          <p class="pipeline__stage-boundary">{{ stage.boundary }}</p>
        </el-card>
      </div>
    </div>

    <el-divider style="margin: 12px 0" />

    <!-- Decision Tree -->
    <section class="pipeline__decision">
      <h2>{{ $t("knowledge.pipeline.decision.title") }}</h2>
      <p class="pipeline__decision-sub">{{ $t("knowledge.pipeline.decision.subtitle") }}</p>
      <div class="pipeline__decision-list">
        <div v-for="(rule, i) in decisionRules" :key="i" class="pipeline__decision-item">
          <span class="pipeline__decision-num">{{ i + 1 }}</span>
          <span class="pipeline__decision-q">{{ rule.question }}</span>
          <svg class="pipeline__decision-arrow" width="20" height="20" viewBox="0 0 20 20">
            <line x1="2" y1="10" x2="14" y2="10" stroke="var(--el-text-color-placeholder)" stroke-width="1.5" />
            <polyline
              points="10,5 16,10 10,15"
              fill="none"
              stroke="var(--el-text-color-placeholder)"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
          <span class="pipeline__decision-role">{{ rule.role }}</span>
        </div>
      </div>
    </section>

    <KnowledgePreviewDialog ref="previewDlg" />
  </div>
</template>

<script setup lang="ts" name="pipelineHub">
import { ref, reactive, onMounted, computed } from "vue";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { stages, crossCuttingLayers } from "./constants";
import type { Stage, CrossCuttingLayer, DecisionRule } from "./constants";
import { listKnowledgeFiles } from "@/api/modules/knowledgeService";
import { EXAMPLE_LAUNCHES } from "@/views/knowledge/executive/okrFlowData";
import KnowledgePreviewDialog from "@/components/KnowledgePreviewDialog/KnowledgePreviewDialog.vue";

const { t, te } = useI18n();
const router = useRouter();
const previewDlg = ref<InstanceType<typeof KnowledgePreviewDialog> | null>(null);

const launches = EXAMPLE_LAUNCHES;

/** 上线记录的 goalId（如 exec-001）→ 角色 id（如 executiver），跳回角色 OKR 并深链该目标。 */
const GOAL_ROLE_PREFIX: Record<string, string> = {
  exec: "executiver",
  prod: "producter",
  lead: "leader",
  eng: "engineer",
  sre: "srer",
  aier: "aier",
  cur: "curator"
};

function goLaunchGoal(goalId: string) {
  const prefix = goalId.split("-")[0];
  const role = GOAL_ROLE_PREFIX[prefix];
  if (role) router.push(`/knowledge/executive/okr?role=${role}&goal=${goalId}`);
}

const layerColors: Record<string, string> = {
  business: "#6366f1",
  ai: "#22c55e",
  governance: "#f59e0b"
};

const stageColors: Record<string, string> = {
  requirements: "#409eff",
  decisions: "#7c3aed",
  "design-build": "#10b981",
  "quality-release": "#f59e0b"
};

/** 优先用 t() 里的翻译，找不到就用 constants.ts 里的原始值兜底 */
function tl(key: string, fallback: string): string {
  return te(key) ? t(key) : fallback;
}

/** stages 响应式视图：name / role / description / boundary 全部走 locale，key/item/topic 保留常量原文 */
const stageList = computed<Stage[]>(() =>
  stages.map(s => {
    const prefix = `knowledge.pipeline.stagesDetail.${s.id}`;
    return {
      ...s,
      name: tl(`${prefix}.name`, s.name),
      role: tl(`${prefix}.role`, s.role),
      description: tl(`${prefix}.description`, s.description),
      boundary: tl(`${prefix}.boundary`, s.boundary)
    };
  })
);

/** cross-cutting layers 响应式视图 */
const layerList = computed<CrossCuttingLayer[]>(() => {
  const idToDetail: Record<string, string> = {
    business: "businessDetail",
    ai: "aiDetail",
    governance: "governanceDetail"
  };
  return crossCuttingLayers.map(l => {
    const prefix = `knowledge.pipeline.stagesDetail.${idToDetail[l.id] ?? l.id}`;
    return {
      ...l,
      label: tl(`${prefix}.label`, l.label),
      role: tl(`${prefix}.role`, l.role),
      desc: tl(`${prefix}.desc`, l.desc),
      description: tl(`${prefix}.description`, l.description),
      boundary: tl(`${prefix}.boundary`, l.boundary)
    };
  });
});

/** 决策树响应式：question 走 rules.* 、 role 走 roles.* */
const DECISION_RULE_KEYS = ["business", "product", "leader", "engineer", "sre", "ai", "curator"] as const;
const DECISION_ROLE_KEYS = ["executiver", "producter", "leader", "engineer", "srer", "aier", "curator"] as const;

const decisionRules = computed<DecisionRule[]>(() => {
  const out: DecisionRule[] = [];
  const FALLBACK_QUESTIONS = [
    "Business strategy, market, competitors?",
    "Product requirements, user stories, priorities?",
    "Technical decisions, architecture choices, ADRs?",
    "Implementation patterns, dev tools, code?",
    "Release procedures, monitoring, incident response?",
    "AI/ML-specific theory and practice?",
    "The KB's own structure and rules?"
  ];
  const FALLBACK_ROLES = ["executiver/", "producter/", "leader/", "engineer/", "srer/", "aier/", "curator/"];
  for (let i = 0; i < 7; i++) {
    out.push({
      question: tl(`knowledge.pipeline.decision.rules.${DECISION_RULE_KEYS[i]}`, FALLBACK_QUESTIONS[i]),
      role: tl(`knowledge.pipeline.decision.roles.${DECISION_ROLE_KEYS[i]}`, FALLBACK_ROLES[i])
    });
  }
  return out;
});

/** File counts per category key */
const stageStats = reactive<Record<string, number>>({});

async function loadStats() {
  try {
    const res = await listKnowledgeFiles();
    const allPaths = res.files.map(f => f.path);
    const categories = new Set<string>();
    for (const s of stages) categories.add(s.category);
    for (const l of crossCuttingLayers) categories.add(l.category);
    for (const cat of categories) {
      stageStats[cat] = allPaths.filter(p => p.startsWith(cat + "/") || p.startsWith(cat.replace(/-/g, "_") + "/")).length;
    }
  } catch {
    // Stats are optional — don't block the page
  }
}

function statsFor(category: string): number {
  return stageStats[category] || 0;
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
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
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
    line-height: 1.6;
    color: var(--el-text-color-secondary);
  }
}

// ── Layers ──────────────────────────────────────────────
.pipeline__layers {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
  gap: 14px;
  margin-bottom: 18px;
}

// ── Flow ────────────────────────────────────────────────
.pipeline__flow {
  position: relative;
  display: flex;
  gap: 10px;
  align-items: stretch;
  padding: 4px 0;
  overflow-x: auto;
}
.pipeline__flow-track {
  position: absolute;
  top: 60px;
  right: 40px;
  left: 40px;
  height: 2px;
  pointer-events: none;
  background: repeating-linear-gradient(90deg, var(--el-border-color-lighter) 0 8px, transparent 8px 14px);
}
.pipeline__stage {
  display: flex;
  flex: 1 1 0;
  align-items: center;
  min-width: 280px;
}
.pipeline__stage-connector {
  display: flex;
  align-items: center;
  margin: 0 2px;
  opacity: 0.7;
}
.pipeline__stage-card,
.pipeline__layer-card {
  width: 100%;
  cursor: pointer;
  transition:
    transform 0.15s ease,
    box-shadow 0.15s ease;
  &:hover {
    transform: translateY(-2px);
  }
}
.pipeline__stage-head {
  display: flex;
  gap: 10px;
  align-items: center;
  margin-bottom: 8px;
}
.pipeline__stage-num {
  display: inline-flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  font-size: 14px;
  font-weight: 700;
  color: #ffffff;
  border-radius: 50%;
}
.pipeline__stage-title {
  display: flex;
  flex-direction: column;
  line-height: 1.2;
}
.pipeline__stage-name {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}
.pipeline__stage-role {
  margin-top: 2px;
  font-size: 12px;
  color: var(--el-text-color-secondary);
  text-decoration: underline dashed transparent;
  cursor: pointer;
  transition: text-decoration-color 0.15s ease;
  &:hover {
    text-decoration-color: currentColor;
  }
}
.pipeline__stage-desc {
  margin: 0 0 10px;
  font-size: 13px;
  line-height: 1.55;
  color: var(--el-text-color-regular);
}
.pipeline__stage-flow {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  align-items: center;
  margin-bottom: 10px;
}
.pipeline__stage-flow-chip {
  display: inline-block;
  padding: 2px 8px;
  font-size: 12px;
  color: var(--el-text-color-secondary);
  cursor: pointer;
  background: var(--el-fill-color-light);
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 999px;
  transition: all 0.15s ease;
  &--input {
    color: var(--el-color-primary-dark-2);
    background: var(--el-color-primary-light-9);
    border-color: var(--el-color-primary-light-7);
  }
  &:hover {
    transform: translateY(-1px);
  }
}
.pipeline__stage-flow-arrow {
  margin: 0 2px;
  font-weight: 700;
  color: var(--el-text-color-placeholder);
}
.pipeline__stage-topics {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin-bottom: 10px;
}
.pipeline__stage-topic {
  padding: 1px 6px;
  font-size: 12px;
  color: var(--el-text-color-regular);
  cursor: pointer;
  background: var(--el-bg-color-overlay);
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 4px;
  transition: background 0.15s ease;
  &:hover {
    background: var(--el-fill-color-light);
  }
}
.pipeline__stage-stats {
  margin-bottom: 8px;
}
.pipeline__stage-stats-total {
  padding: 1px 6px;
  font-size: 12px;
  color: var(--el-text-color-secondary);
  background: var(--el-fill-color-lighter);
  border-radius: 4px;
}
.pipeline__stage-boundary {
  padding: 6px 8px;
  margin: 0;
  font-size: 12px;
  line-height: 1.5;
  color: var(--el-text-color-secondary);
  background: var(--el-fill-color-lighter);
  border-left: 3px solid var(--el-border-color);
  border-radius: 4px;
}

// ── Decision ────────────────────────────────────────────
.pipeline__decision {
  & > h2 {
    margin: 0 0 4px;
    font-size: 17px;
    font-weight: 600;
  }
}
.pipeline__decision-sub {
  margin: 0 0 10px;
  font-size: 13px;
  color: var(--el-text-color-secondary);
}
.pipeline__decision-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.pipeline__decision-item {
  display: grid;
  grid-template-columns: 32px 1fr 32px max-content;
  gap: 8px;
  align-items: center;
  padding: 8px 10px;
  background: var(--el-bg-color-overlay);
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 6px;
}
.pipeline__decision-num {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  justify-self: center;
  width: 22px;
  height: 22px;
  font-size: 12px;
  font-weight: 700;
  color: #ffffff;
  background: var(--el-color-primary);
  border-radius: 50%;
}
.pipeline__decision-q {
  font-size: 13px;
  font-weight: 500;
  color: var(--el-text-color-primary);
}
.pipeline__decision-arrow {
  justify-self: center;
}
.pipeline__decision-role {
  padding: 2px 6px;
  font-family: ui-monospace, Menlo, Consolas, monospace;
  font-size: 12px;
  color: var(--el-text-color-regular);
  background: var(--el-fill-color-light);
  border-radius: 4px;
}
</style>
