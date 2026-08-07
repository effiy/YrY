<template>
  <div class="brd-overview">
    <header class="brd-overview__header">
      <h1>BRD Review Hub</h1>
      <p>
        Central dashboard for Business Requirements Document management. Each of the 8 role/persona cards below
        mirrors a folder under <code>src/views/brd/</code> — click to open its list view. Detail routes are
        registered under <code>/brd/&lt;role&gt;/detail/:id?</code>, and every role carries its own structured
        meta schema (defined in <code>meta-schemas.ts</code>) covering the fields that matter to that persona.
      </p>
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

    <!-- Role / persona pages — mirrors src/views/brd/ -->
    <section class="brd-overview__roles" aria-label="Role and persona pages">
      <h3>Role / Persona Pages</h3>
      <div class="brd-overview__role-row">
        <el-card
          v-for="role in ROLE_PAGES"
          :key="role.path"
          class="brd-overview__role-card"
          shadow="hover"
          @click="router.push(role.path)"
        >
          <div class="brd-overview__role-head">
            <span class="brd-overview__role-icon">{{ role.icon }}</span>
            <el-tag v-if="role.count !== undefined" type="info" size="small">{{ role.count }}</el-tag>
          </div>
          <div class="brd-overview__role-title">{{ role.label }}</div>
          <p class="brd-overview__role-desc">{{ role.desc }}</p>
        </el-card>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts" name="brdReviewHub">
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { getTopicList, type TopicEntryDocument } from "@/api/modules/topic";

const router = useRouter();

const PROJECTS = [
  {
    key: "yiai",
    name: "YiAi",
    icon: "🐍",
    desc: "FastAPI backend · BRD Agent · SSE Chat · RAG · Knowledge base"
  },
  {
    key: "yivad",
    name: "YiVad",
    icon: "🖥️",
    desc: "Vue 3.5 admin dashboard · ProTable · Story Board · BRD management"
  },
  {
    key: "yipet",
    name: "YiPet",
    icon: "🐾",
    desc: "Chrome MV3 extension · AI companion · browser integration · HMR watch-rebuild"
  },
  {
    key: "yiknowledge",
    name: "YiKnowledge",
    icon: "📚",
    desc: "Markdown · YAML frontmatter · Static knowledge base"
  },
];

// 8 role / persona pages — one card per folder under src/views/brd/.
// List routes live in authMenuList.json; detail routes in staticRouter.ts.
const ROLE_PAGES = ref([
  {
    path: "/brd/engineer",
    label: "As an Engineer",
    icon: "🛠️",
    desc: "Files implementation-level BRDs — tech stack, code link, acceptance criteria, owner, key metrics, quarter.",
    count: undefined as number | undefined
  },
  {
    path: "/brd/tech-lead",
    label: "As a Tech Lead",
    icon: "🎓",
    desc: "Files Architectural Decision Records — decision type, team size, alternatives, rollback plan, risks, stakeholders.",
    count: undefined as number | undefined
  },
  {
    path: "/brd/product-manager",
    label: "As a Product Manager",
    icon: "📐",
    desc: "Files PRDs — business objective, target metric, success criteria, user segment, priority, expected go-live.",
    count: undefined as number | undefined
  },
  {
    path: "/brd/ai-engineer",
    label: "As an AI Engineer",
    icon: "🧠",
    desc: "Files model / evaluation BRDs — model, task type, framework, dataset, eval metric, baseline → target.",
    count: undefined as number | undefined
  },
  {
    path: "/brd/new-hire",
    label: "As a New Hire",
    icon: "🌱",
    desc: "Files onboarding plans — role track, day #, mentor/buddy, first-week tasks, environment setup, 30/60/90-day checkpoints.",
    count: undefined as number | undefined
  },
  {
    path: "/brd/knowledge-curator",
    label: "As a Knowledge Curator",
    icon: "📚",
    desc: "Files knowledge maps — doc type, source type, review cycle, tacit/explicit tag, lifecycle, audience, related docs.",
    count: undefined as number | undefined
  },
  {
    path: "/brd/executive",
    label: "As an Executive",
    icon: "♟️",
    desc: "Files strategic decisions — decision type, scope, time horizon, strategic theme, OKR, investment size, outcomes.",
    count: undefined as number | undefined
  },
  {
    path: "/brd/oncall-sre",
    label: "As an Oncall SRE",
    icon: "📞",
    desc: "Files incident records — severity, incident type, blast radius, MTTR, root cause, action items, SLO impact, runbook.",
    count: undefined as number | undefined
  }
]);

async function loadRoleCounts() {
  const topics = ROLE_PAGES.value.map((p, idx) => ({
    // path "/brd/engineer" → topic "brd-engineer"
    topic: `brd-${p.path.split("/").pop() ?? ""}`,
    idx
  }));
  const results = await Promise.allSettled(topics.map(t => getTopicList<TopicEntryDocument>("brd", t.topic, { pageSize: 1 })));
  results.forEach((r, i) => {
    if (r.status === "fulfilled" && r.value.code === 0) {
      ROLE_PAGES.value[topics[i].idx].count = r.value.data?.total ?? 0;
    }
  });
}

onMounted(() => {
  loadRoleCounts();
});
</script>

<style scoped lang="scss">
.brd-overview {
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  height: calc(100vh - 95px);
  min-height: 0;
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
  }
  code {
    padding: 1px 5px;
    font-size: 12px;
    background: var(--el-fill-color-light);
    border-radius: 4px;
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
.brd-overview__roles {
  h3 {
    margin: 0 0 12px;
    font-size: 14px;
  }
}
.brd-overview__role-row {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 14px;
}
.brd-overview__role-card {
  cursor: pointer;
  transition: transform 0.15s ease;
  &:hover {
    transform: translateY(-2px);
  }
  :deep(.el-card__body) {
    padding: 14px 16px;
  }
}
.brd-overview__role-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 6px;
}
.brd-overview__role-icon {
  font-size: 22px;
}
.brd-overview__role-title {
  font-size: 15px;
  font-weight: 600;
  margin-bottom: 4px;
}
.brd-overview__role-desc {
  margin: 0;
  font-size: 12px;
  line-height: 1.5;
  min-height: 54px;
  color: var(--el-text-color-secondary);
}
</style>
