<template>
  <div class="showcase-home page">
    <PageHeaderCard
      :icon="Grid"
      icon-bg="linear-gradient(135deg, #409eff, #6366f1)"
      title="Component Showcase"
      description="A gallery of reusable components, directives, and patterns available in YiVad. Each section includes live demos and usage guidance."
    />

    <el-row :gutter="20">
      <el-col v-for="card in cards" :key="card.key" :md="8" :sm="12" :xs="24">
        <el-card shadow="hover" class="sc-card" @click="$router.push(card.path)">
          <div class="sc-card__inner">
            <el-icon :size="32" :color="card.color">
              <component :is="card.icon" />
            </el-icon>
            <h3>{{ card.title }}</h3>
            <p>{{ card.desc }}</p>
            <el-tag v-for="t in card.tags" :key="t" size="small" class="sc-tag">{{ t }}</el-tag>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts" name="showcase">
import { Grid, MagicStick, TrendCharts, EditPen } from "@element-plus/icons-vue";
import PageHeaderCard from "@/components/PageHeaderCard/PageHeaderCard.vue";

const cards = [
  {
    key: "components",
    path: "/showcase/components",
    icon: Grid,
    color: "#409EFF",
    title: "Components",
    desc: "ProTable, SearchForm, Upload, Editor, ScoreBar, Markdown, Skeleton, EmptyState, and more.",
    tags: ["ProTable", "Upload", "Editor", "ScoreBar", "Skeleton"],
  },
  {
    key: "forms",
    path: "/showcase/forms",
    icon: EditPen,
    color: "#9C27B0",
    title: "Forms",
    desc: "ProForm, dynamic fields, validation rules, conditional logic, and form layout patterns.",
    tags: ["ProForm", "Validation", "Dynamic", "Layout"],
  },
  {
    key: "directives",
    path: "/showcase/directives",
    icon: MagicStick,
    color: "#67C23A",
    title: "Directives",
    desc: "v-auth, v-copy, v-watermark, v-debounce, and more — lightweight behavior enhancers.",
    tags: ["v-auth", "v-copy", "v-watermark", "v-debounce", "v-throttle"],
  },
  {
    key: "charts",
    path: "/showcase/charts",
    icon: TrendCharts,
    color: "#E6A23C",
    title: "Charts",
    desc: "ECharts integration with reusable wrappers — line, bar, pie, radar, and more.",
    tags: ["Line", "Bar", "Pie", "Radar", "Water"],
  },
];
</script>

<style scoped>
.showcase-home {
  max-width: 960px;
  margin: 0 auto;
}
.sc-card {
  margin-bottom: 20px;
  cursor: pointer;
  transition: transform 0.15s, box-shadow 0.15s;
}
.sc-card:hover {
  transform: translateY(-2px);
}
.sc-card__inner h3 {
  margin: 12px 0 8px;
  font-size: 16px;
}
.sc-card__inner p {
  color: var(--el-text-color-secondary);
  font-size: 13px;
  line-height: 1.5;
  margin-bottom: 12px;
}
.sc-tag {
  margin-right: 6px;
  margin-bottom: 4px;
}
</style>