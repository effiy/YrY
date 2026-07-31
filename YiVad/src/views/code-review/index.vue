<template>
  <div class="cr-overview">
    <header class="cr-overview__header">
      <h1>Code Review</h1>
      <p>Pick a topic to browse saved entries or create a new one from the template.</p>
    </header>
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
import { CODE_REVIEW_TOPICS, topicSlug } from "./constants";

const router = useRouter();

function open(value: string) {
  router.push(`/code-review/${topicSlug(value)}`);
}
</script>

<style scoped lang="scss">
.cr-overview {
  height: 100%;
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
