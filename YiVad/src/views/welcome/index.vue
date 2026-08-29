<template>
  <div class="welcome">
    <!-- ═══ Hero ═══ -->
    <section class="welcome-hero">
      <div class="welcome-hero__badge">
        <el-tag type="info" size="small" effect="plain">YrY Monorepo</el-tag>
      </div>
      <h1 class="welcome-hero__title">
        <span class="welcome-hero__title-line">AI-Powered</span>
        <span class="welcome-hero__title-line welcome-hero__title-line--accent">Development Toolkit</span>
      </h1>
      <p class="welcome-hero__desc">
        Three companion projects — browser companion, AI backend, admin dashboard —
        unified by a single RPC protocol. Built for engineers who want AI at every layer.
      </p>
      <div class="welcome-hero__actions">
        <el-button type="primary" size="large" round @click="router.push('/login')">
          Get Started
        </el-button>
        <el-button size="large" round @click="scrollToProjects">
          Explore Projects
        </el-button>
      </div>
    </section>

    <!-- ═══ Project Cards ═══ -->
    <section ref="projectsRef" class="welcome-section">
      <h2 class="welcome-section__title">The Yi Family</h2>
      <div class="welcome-cards">
        <div class="welcome-card" v-for="p in projects" :key="p.name">
          <div class="welcome-card__icon">
            <el-icon :size="28">
              <component :is="p.icon" />
            </el-icon>
          </div>
          <div class="welcome-card__body">
            <h3 class="welcome-card__name">
              {{ p.name }}
              <el-tag :type="p.tagType" size="small" effect="plain">{{ p.label }}</el-tag>
            </h3>
            <p class="welcome-card__desc">{{ p.description }}</p>
            <div class="welcome-card__stats">
              <span v-for="s in p.stats" :key="s.label" class="welcome-card__stat">
                <strong>{{ s.value }}</strong>
                <small>{{ s.label }}</small>
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ═══ Architecture ═══ -->
    <section class="welcome-section welcome-section--alt">
      <h2 class="welcome-section__title">How It Works</h2>
      <div class="welcome-flow">
        <div class="welcome-flow__step" v-for="(step, i) in flow" :key="step.label">
          <div class="welcome-flow__node">
            <el-tag :type="step.tagType" size="large" effect="dark">{{ step.label }}</el-tag>
          </div>
          <p class="welcome-flow__desc">{{ step.description }}</p>
          <div v-if="i < flow.length - 1" class="welcome-flow__arrow">
            <el-icon :size="20"><ArrowRight /></el-icon>
          </div>
        </div>
      </div>
      <div class="welcome-rpc">
        <code>POST / { module_name, method_name, parameters } → { code, message, data }</code>
        <span class="welcome-rpc__label">Universal RPC Envelope</span>
      </div>
    </section>

    <!-- ═══ Features ═══ -->
    <section class="welcome-section">
      <h2 class="welcome-section__title">Key Capabilities</h2>
      <div class="welcome-features">
        <div class="welcome-feature" v-for="f in features" :key="f.title">
          <el-icon :size="22"><component :is="f.icon" /></el-icon>
          <div class="welcome-feature__text">
            <strong>{{ f.title }}</strong>
            <span>{{ f.description }}</span>
          </div>
        </div>
      </div>
    </section>

    <!-- ═══ Footer ═══ -->
    <footer class="welcome-footer">
      <span>YiVad · YiAi · YiPet · YiKnowledge</span>
      <el-button type="primary" size="large" round @click="router.push('/login')">
        Enter YiVad
      </el-button>
    </footer>
  </div>
</template>

<script setup lang="ts" name="welcome">
import { ref } from "vue";
import { useRouter } from "vue-router";
import {
  Platform, Cpu, Monitor, ArrowRight, ChatDotRound, DataBoard,
  Search, Connection, MagicStick
} from "@element-plus/icons-vue";

const router = useRouter();
const projectsRef = ref<HTMLElement>();

function scrollToProjects() {
  projectsRef.value?.scrollIntoView({ behavior: "smooth" });
}

const projects = [
  {
    name: "YiPet",
    label: "Chrome MV3",
    icon: Monitor,
    tagType: "warning" as const,
    description:
      "Browser extension with an interactive pet companion. Multi-role AI chat, knowledge grounding, RAG retrieval, and cross-project bridges — all from any webpage.",
    stats: [
      { label: "Platform", value: "Chrome" },
      { label: "Chat Modes", value: "3" },
      { label: "Bridge", value: "YiVad" }
    ]
  },
  {
    name: "YiAi",
    label: "FastAPI",
    icon: Cpu,
    tagType: "success" as const,
    description:
      "AI backend powering everything. Ollama LLM inference with SSE streaming, llama_index RAG over YiKnowledge, MongoDB persistence, and a generic agent execution engine.",
    stats: [
      { label: "Runtime", value: "Python" },
      { label: "LLM", value: "Ollama" },
      { label: "RAG", value: "Hybrid" }
    ]
  },
  {
    name: "YiVad",
    label: "Vue 3 SPA",
    icon: Platform,
    tagType: "primary" as const,
    description:
      "Admin dashboard with ProTable, dynamic routing, button-level permissions, and full AI chat. The management hub for the entire Yi ecosystem.",
    stats: [
      { label: "Framework", value: "Vue 3.5" },
      { label: "Build", value: "Rsbuild" },
      { label: "UI", value: "Element+" }
    ]
  },
  {
    name: "YiKnowledge",
    label: "Markdown KB",
    icon: DataBoard,
    tagType: "info" as const,
    description:
      "Shared knowledge base serving both humans and AI. 7 role directories, 4 pipeline stages, governance lifecycle — the RAG data source for YiAi.",
    stats: [
      { label: "Roles", value: "7" },
      { label: "Templates", value: "11" },
      { label: "Pipeline", value: "5-stage" }
    ]
  }
];

const flow = [
  {
    label: "YiPet",
    tagType: "warning" as const,
    description: "Captures intent in-browser — chat, knowledge, RAG, bug reports"
  },
  {
    label: "RPC",
    tagType: "info" as const,
    description: "Unified envelope — { module_name, method_name, parameters }"
  },
  {
    label: "YiAi",
    tagType: "success" as const,
    description: "Processes requests — LLM, RAG, data CRUD, file I/O, agents"
  },
  {
    label: "YiVad",
    tagType: "primary" as const,
    description: "Visualises and manages — dashboards, admin, analytics, settings"
  }
];

const features = [
  { icon: ChatDotRound, title: "AI Chat", description: "SSE streaming with multi-model support and tool calling" },
  { icon: Search, title: "RAG Retrieval", description: "Hybrid vector + BM25 search over YiKnowledge with LLM reranking" },
  { icon: Connection, title: "Cross-Project Bridge", description: "Bug reports, session sharing, and file mentions across YiPet and YiVad" },
  { icon: DataBoard, title: "Data Management", description: "Generic CRUD over MongoDB collections with ProTable visualization" },
  { icon: MagicStick, title: "Knowledge Pipeline", description: "5-stage pipeline from discovery through curation to retrieval" }
];
</script>

<style scoped lang="scss">
.welcome {
  min-height: 100vh;
  background: var(--el-bg-color-page);
}

// ── Hero ─────────────────────────────────────────
.welcome-hero {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 80px 24px 64px;
  background: linear-gradient(135deg, var(--el-color-primary-light-9) 0%, var(--el-bg-color-page) 60%);

  &__badge { margin-bottom: 16px; }

  &__title {
    margin: 0 0 20px;
    font-size: 48px;
    font-weight: 800;
    line-height: 1.2;
    letter-spacing: -1px;
  }
  &__title-line { display: block; }
  &__title-line--accent {
    background: linear-gradient(135deg, var(--el-color-primary), var(--el-color-primary-light-3));
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  &__desc {
    max-width: 600px;
    margin: 0 0 32px;
    font-size: 16px;
    line-height: 1.6;
    color: var(--el-text-color-secondary);
  }

  &__actions { display: flex; gap: 12px; }
}

// ── Sections ─────────────────────────────────────
.welcome-section {
  max-width: 1100px;
  margin: 0 auto;
  padding: 64px 24px;

  &--alt { background: var(--el-fill-color-light); max-width: none; }

  &__title {
    margin: 0 0 32px;
    font-size: 28px;
    font-weight: 700;
    text-align: center;
  }
}

// ── Project Cards ────────────────────────────────
.welcome-cards {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.welcome-card {
  display: flex;
  gap: 16px;
  padding: 24px;
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 12px;
  transition: box-shadow 0.2s, transform 0.2s;

  &:hover {
    box-shadow: 0 4px 20px rgb(0 0 0 / 8%);
    transform: translateY(-2px);
  }

  &__icon {
    flex-shrink: 0;
    width: 52px;
    height: 52px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 12px;
    background: var(--el-fill-color-light);
    color: var(--el-color-primary);
  }

  &__body { flex: 1; min-width: 0; }

  &__name {
    display: flex;
    align-items: center;
    gap: 8px;
    margin: 0 0 8px;
    font-size: 16px;
    font-weight: 600;
  }

  &__desc {
    margin: 0 0 12px;
    font-size: 13px;
    line-height: 1.5;
    color: var(--el-text-color-secondary);
  }

  &__stats {
    display: flex;
    gap: 16px;
  }

  &__stat {
    display: flex;
    flex-direction: column;
    strong { font-size: 15px; color: var(--el-text-color-primary); }
    small { font-size: 11px; color: var(--el-text-color-placeholder); }
  }
}

// ── Flow ─────────────────────────────────────────
.welcome-flow {
  display: flex;
  align-items: flex-start;
  justify-content: center;
  gap: 0;
  max-width: 900px;
  margin: 0 auto 32px;
}

.welcome-flow__step {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  flex: 1;
}

.welcome-flow__node { margin-bottom: 8px; }

.welcome-flow__desc {
  font-size: 12px;
  color: var(--el-text-color-secondary);
  line-height: 1.4;
  max-width: 160px;
}

.welcome-flow__arrow {
  position: absolute;
  color: var(--el-text-color-placeholder);
  margin-top: 6px;
}

// ── RPC ──────────────────────────────────────────
.welcome-rpc {
  text-align: center;
  code {
    display: block;
    padding: 12px 20px;
    background: var(--el-bg-color);
    border: 1px solid var(--el-border-color-lighter);
    border-radius: 8px;
    font-size: 13px;
    font-family: "SF Mono", "Fira Code", monospace;
    color: var(--el-text-color-primary);
  }
  &__label {
    display: inline-block;
    margin-top: 8px;
    font-size: 11px;
    color: var(--el-text-color-placeholder);
    text-transform: uppercase;
    letter-spacing: 1px;
  }
}

// ── Features ─────────────────────────────────────
.welcome-features {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}

.welcome-feature {
  display: flex;
  gap: 12px;
  padding: 16px;
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 10px;
  color: var(--el-color-primary);

  &__text {
    display: flex;
    flex-direction: column;
    gap: 2px;
    strong { font-size: 14px; color: var(--el-text-color-primary); }
    span { font-size: 12px; color: var(--el-text-color-secondary); line-height: 1.4; }
  }
}

// ── Footer ───────────────────────────────────────
.welcome-footer {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 48px 24px;
  text-align: center;
  border-top: 1px solid var(--el-border-color-lighter);
  color: var(--el-text-color-placeholder);
  font-size: 13px;
}

// ── Responsive ───────────────────────────────────
@media (max-width: 768px) {
  .welcome-hero__title { font-size: 32px; }
  .welcome-cards { grid-template-columns: 1fr; }
  .welcome-features { grid-template-columns: 1fr; }
  .welcome-flow { flex-direction: column; align-items: center; gap: 16px; }
  .welcome-flow__arrow { display: none; }
}
</style>