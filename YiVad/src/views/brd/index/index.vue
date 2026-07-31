<template>
  <div class="brd-overview">
    <header class="brd-overview__header">
      <h1>BRD Review Hub</h1>
      <p>Central dashboard for Business Requirements Document management. Browse BRD registry entries, track objectives, manage stakeholders, and monitor the approval pipeline across all Yi-family projects.</p>
    </header>

    <!-- Project context chips -->
    <section class="brd-overview__projects" aria-label="Projects with BRD coverage">
      <div class="brd-overview__project" v-for="p in PROJECTS" :key="p.key">
        <span class="brd-overview__project-icon">{{ p.icon }}</span>
        <div>
          <strong>{{ p.name }}</strong>
          <span class="brd-overview__project-desc">{{ p.desc }}</span>
        </div>
      </div>
    </section>

    <el-divider />

    <!-- Pipeline status bar -->
    <section class="brd-overview__stats" aria-label="BRD pipeline summary">
      <div class="brd-overview__stat" v-for="s in stats" :key="s.label">
        <span class="brd-overview__stat-value">{{ s.value }}</span>
        <span class="brd-overview__stat-label">{{ s.label }}</span>
      </div>
      <el-button type="primary" :icon="Plus" @click="createBrd">New BRD Document</el-button>
    </section>

    <el-divider />

    <!-- Topic cards grid -->
    <div class="brd-overview__grid">
      <el-card
        v-for="topic in BRD_TOPICS"
        :key="topic.value"
        class="brd-overview__card"
        shadow="hover"
        @click="open(topic.value)"
      >
        <div class="brd-overview__card-head">
          <span class="brd-overview__card-icon">{{ topic.icon }}</span>
          <el-tag v-if="topic.count !== undefined" type="info" size="small">{{ topic.count }} entries</el-tag>
        </div>
        <h2 class="brd-overview__title">{{ topic.label }}</h2>
        <p class="brd-overview__content">{{ topic.content }}</p>
        <div class="brd-overview__card-foot">
          <span class="brd-overview__action">Browse →</span>
        </div>
      </el-card>
    </div>

    <!-- Quick links -->
    <el-divider />
    <section class="brd-overview__links" aria-label="Quick navigation">
      <h3>Quick Actions</h3>
      <div class="brd-overview__link-row">
        <el-button
          v-for="link in quickLinks"
          :key="link.key"
          :icon="link.icon"
          @click="router.push(link.path)"
        >
          {{ link.label }}
        </el-button>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts" name="brdReviewHub">
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { Plus, DocumentAdd, Checked, List, UserFilled } from "@element-plus/icons-vue";
import { getTopicList, type TopicEntryDocument } from "@/api/modules/topic";

const router = useRouter();

const PROJECTS = [
  {
    key: "yiai",
    name: "YiAi",
    icon: "🐍",
    desc: "AI Backend · BRD Agent · Chat · RAG"
  },
  {
    key: "yivad",
    name: "YiVad",
    icon: "🖥️",
    desc: "Admin Dashboard · Story Board · BRD Management"
  },
  {
    key: "yipet",
    name: "YiPet",
    icon: "🐾",
    desc: "Chrome Extension · AI Companion · Browser Integration"
  }
];

const BRD_TOPICS = [
  {
    value: "brd-documents",
    label: "BRD Documents",
    icon: "📋",
    content: "Core BRD registry — document metadata, business owner, priority, status, and executive summaries for all projects.",
    count: undefined as number | undefined
  },
  {
    value: "brd-objectives",
    label: "Business Objectives",
    icon: "🎯",
    content: "Measurable business goals with KPIs, target values, baselines, and verification methods. Track progress toward strategic outcomes.",
    count: undefined as number | undefined
  },
  {
    value: "brd-stakeholders",
    label: "Stakeholders & Core Users",
    icon: "👥",
    content: "User personas, roles, influence levels, usage frequency, and pain points across all target markets and brands.",
    count: undefined as number | undefined
  },
  {
    value: "brd-rules",
    label: "Business Rules",
    icon: "📏",
    content: "MoSCoW-prioritized constraints — data validation, workflow orchestration, access control, compliance, and integration contracts.",
    count: undefined as number | undefined
  },
  {
    value: "brd-acceptance",
    label: "Acceptance Criteria",
    icon: "✅",
    content: "BDD-style Given/When/Then scenarios, functional and non-functional criteria, automated test references.",
    count: undefined as number | undefined
  },
  {
    value: "brd-milestones",
    label: "Milestones & Timeline",
    icon: "🏁",
    content: "Project phase gates, target dates, deliverables, dependencies, blockers, and completion tracking.",
    count: undefined as number | undefined
  },
  {
    value: "brd-approvals",
    label: "Approval Records",
    icon: "✍️",
    content: "Multi-role sign-off audit trail — Business Owner, ITBP, RSC, HQ Counterpart, Security, Compliance, DPO.",
    count: undefined as number | undefined
  }
];

const quickLinks = [
  { key: "new-brd", label: "New BRD Document", icon: DocumentAdd, path: "/brd/brd-documents/detail/new" },
  { key: "all-brd", label: "All BRD Documents", icon: List, path: "/brd/brd-documents" },
  { key: "approvals", label: "Pending Approvals", icon: Checked, path: "/brd/brd-approvals" },
  { key: "stakeholders", label: "Stakeholder Map", icon: UserFilled, path: "/brd/brd-stakeholders" }
];

// ── Stats ────────────────────────────────────────────────────────────────
const stats = ref([
  { label: "BRD Documents", value: "—" },
  { label: "Pending Approvals", value: "—" },
  { label: "Active Milestones", value: "—" }
]);

async function loadStats() {
  try {
    const [docsRes] = await Promise.all([
      getTopicList<TopicEntryDocument>("brd", "brd-documents", { pageSize: 1 })
    ]);
    if (docsRes.code === 0) stats.value[0].value = String(docsRes.data?.total ?? "—");
  } catch {
    // Stats are best-effort
  }
}

// ── Topic entry counts ───────────────────────────────────────────────────
async function loadTopicCounts() {
  const topics = ["brd-documents", "brd-objectives", "brd-stakeholders", "brd-rules", "brd-acceptance", "brd-milestones", "brd-approvals"];
  const results = await Promise.allSettled(
    topics.map(t => getTopicList<TopicEntryDocument>("brd", t, { pageSize: 1 }))
  );
  results.forEach((r, i) => {
    if (r.status === "fulfilled" && r.value.code === 0) {
      BRD_TOPICS[i].count = r.value.data?.total ?? 0;
    }
  });
}

function open(value: string) {
  router.push(`/brd/${value}`);
}

function createBrd() {
  router.push("/brd/brd-documents/detail/new");
}

onMounted(() => {
  loadStats();
  loadTopicCounts();
});
</script>

<style scoped lang="scss">
.brd-overview {
  height: 100%;
  padding: 20px;
  overflow: auto;
  background: var(--el-bg-color-page);
}
.brd-overview__header {
  margin-bottom: 16px;
  h1 {
    margin: 0 0 4px;
    font-size: 22px;
  }
  p {
    margin: 0;
    font-size: 13px;
    color: var(--el-text-color-secondary);
    max-width: 720px;
  }
}
.brd-overview__projects {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 10px;
  margin-bottom: 4px;
}
.brd-overview__project {
  display: flex;
  gap: 10px;
  align-items: center;
  padding: 10px 14px;
  background: var(--el-fill-color-lighter);
  border-radius: 8px;
  font-size: 13px;
}
.brd-overview__project-icon {
  font-size: 22px;
}
.brd-overview__project-desc {
  display: block;
  margin-top: 2px;
  font-size: 11px;
  color: var(--el-text-color-placeholder);
}
.brd-overview__stats {
  display: flex;
  gap: 24px;
  align-items: center;
  flex-wrap: wrap;
}
.brd-overview__stat {
  display: flex;
  flex-direction: column;
  min-width: 100px;
}
.brd-overview__stat-value {
  font-size: 28px;
  font-weight: 600;
  color: var(--el-color-primary);
}
.brd-overview__stat-label {
  font-size: 12px;
  color: var(--el-text-color-secondary);
}
.brd-overview__grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 16px;
}
.brd-overview__card {
  cursor: pointer;
  transition: transform 0.15s ease;
  &:hover {
    transform: translateY(-2px);
  }
}
.brd-overview__card-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 6px;
}
.brd-overview__card-icon {
  font-size: 22px;
}
.brd-overview__title {
  margin: 0 0 6px;
  font-size: 15px;
}
.brd-overview__content {
  margin: 0;
  font-size: 12px;
  line-height: 1.5;
  color: var(--el-text-color-secondary);
}
.brd-overview__card-foot {
  margin-top: 10px;
  padding-top: 8px;
  border-top: 1px solid var(--el-border-color-lighter);
}
.brd-overview__action {
  font-size: 12px;
  font-weight: 500;
  color: var(--el-color-primary);
}
.brd-overview__links {
  h3 {
    margin: 0 0 10px;
    font-size: 14px;
  }
}
.brd-overview__link-row {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}
</style>
