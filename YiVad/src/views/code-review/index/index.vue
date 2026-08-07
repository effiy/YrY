<template>
  <div class="cr-overview">
    <header class="cr-overview__header">
      <h1>Code Review</h1>
      <p>Systematic code review across all Yi-family projects. Pick a topic to browse saved entries or create a new one from the template.</p>
    </header>

    <!-- Project context chips -->
    <section class="cr-overview__projects" aria-label="Projects under review">
      <div class="cr-overview__project" v-for="p in PROJECTS" :key="p.key">
        <span class="cr-overview__project-icon">{{ p.icon }}</span>
        <div>
          <strong>{{ p.name }}</strong>
          <span class="cr-overview__project-stack">{{ p.stack }}</span>
        </div>
      </div>
    </section>

    <el-divider />

    <div class="cr-overview__grid">
      <el-card v-for="topic in CODE_REVIEW_TOPICS" :key="topic.value" class="cr-overview__card" shadow="hover" @click="open(topic.value)">
        <div class="cr-overview__card-head">
          <span class="cr-overview__category">{{ topic.category }}</span>
          <el-tag v-if="topic.template" type="warning" size="small">template</el-tag>
        </div>
        <h2 class="cr-overview__title">{{ topic.label }}</h2>
        <p class="cr-overview__content">{{ topic.content }}</p>
      </el-card>
    </div>
  </div>
</template>

<script setup lang="ts" name="codeReviewOverview">
import { useRouter } from "vue-router";
import { CODE_REVIEW_TOPICS, topicSlug } from "../constants";

const router = useRouter();

const PROJECTS = [
  { key: "yiai", name: "YiAi", icon: "🐍", stack: "FastAPI · Python 3.10+ · MongoDB · Ollama · RAG" },
  { key: "yivad", name: "YiVad", icon: "🖥️", stack: "Vue 3.5 · TypeScript · Pinia · Element Plus · Rsbuild" },
  { key: "yipet", name: "YiPet", icon: "🐾", stack: "Chrome MV3 · React 18 · Ant Design · Rsbuild · Biome" },
  { key: "yiknowledge", name: "YiKnowledge", icon: "📚", stack: "Markdown · YAML frontmatter · Static knowledge base" },
];

function open(value: string) {
  router.push(`/code-review/${topicSlug(value)}`);
}
</script>

<style scoped lang="scss">
.cr-overview {
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  height: calc(100vh - 95px);
  min-height: 0;
  padding: 20px;
  overflow: auto;
  background: var(--el-bg-color-page);
}
.cr-overview__header {
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
}
.cr-overview__projects {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 10px;
  margin-bottom: 4px;
}
.cr-overview__project {
  display: flex;
  gap: 10px;
  align-items: center;
  padding: 10px 14px;
  background: var(--el-fill-color-lighter);
  border-radius: 8px;
  font-size: 13px;
}
.cr-overview__project-icon {
  font-size: 22px;
}
.cr-overview__project-stack {
  display: block;
  margin-top: 2px;
  font-size: 11px;
  color: var(--el-text-color-placeholder);
}
.cr-overview__grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 16px;
}
.cr-overview__card {
  cursor: pointer;
  transition: transform 0.15s ease;
  &:hover {
    transform: translateY(-2px);
  }
}
.cr-overview__card-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 6px;
}
.cr-overview__category {
  font-size: 11px;
  font-weight: 600;
  color: var(--el-text-color-secondary);
  text-transform: uppercase;
  letter-spacing: 0.06em;
}
.cr-overview__title {
  margin: 0 0 6px;
  font-size: 15px;
}
.cr-overview__content {
  margin: 0;
  font-size: 12px;
  line-height: 1.5;
  color: var(--el-text-color-secondary);
}
</style>
