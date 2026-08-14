<template>
  <div class="card content-box">
    <span class="text">KnowledgeMetaStrip Demo</span>
    <el-alert
      title="KnowledgeMetaStrip renders frontmatter metadata (status, lifecycle, review_cycle, tacit, type, roles, tags, related) for knowledge files. Used in KnowledgePreviewDialog and Story Board."
      type="warning"
      :closable="false"
    />
    <KnowledgeMetaStrip :meta="sampleMeta" @navigate-related="onNavigate" />
    <el-descriptions title="Props" :column="1" border class="mt30">
      <el-descriptions-item label="meta">KnowledgeMeta — frontmatter metadata object</el-descriptions-item>
      <el-descriptions-item label="currentPath">string (optional) — current file path for resolving relative related links</el-descriptions-item>
    </el-descriptions>
    <el-descriptions title="Events" :column="1" border class="mt30">
      <el-descriptions-item label="navigate-related">(path: string) — emitted when clicking an internal related link</el-descriptions-item>
    </el-descriptions>
    <el-descriptions title="KnowledgeMeta Fields" :column="1" border class="mt30">
      <el-descriptions-item label="status">string — "stable" | "draft" | "archived"</el-descriptions-item>
      <el-descriptions-item label="lifecycle">string — "active" | "maintenance" | "deprecated"</el-descriptions-item>
      <el-descriptions-item label="review_cycle">string — e.g. "quarterly", "monthly"</el-descriptions-item>
      <el-descriptions-item label="tacit">boolean | string — tacit knowledge indicator or statement</el-descriptions-item>
      <el-descriptions-item label="type">string — document type</el-descriptions-item>
      <el-descriptions-item label="roles">string[] — applicable roles</el-descriptions-item>
      <el-descriptions-item label="tags">string[] — topic tags</el-descriptions-item>
      <el-descriptions-item label="related">string[] — related file paths or URLs</el-descriptions-item>
    </el-descriptions>
  </div>
</template>

<script setup lang="ts" name="componentDemoKnowledgeMetaStrip">
import KnowledgeMetaStrip from "@/components/KnowledgeMetaStrip.vue";
import type { KnowledgeMeta } from "@/api/interface/yiweb";

const sampleMeta: KnowledgeMeta = {
  status: "stable",
  lifecycle: "active",
  review_cycle: "quarterly",
  tacit: "Brand Architecture is more than a logo; it is a contract between the organization and its users.",
  type: "architecture",
  roles: ["engineer", "leader"],
  tags: ["architecture", "design-system", "frontend"],
  related: ["YiVad/CLAUDE.md", "YiAi/CLAUDE.md", "https://element-plus.org"],
};

const onNavigate = (path: string) => {
  console.log("Navigate to:", path);
};
</script>

<style scoped lang="scss">
.mt30 { margin-top: 30px; }
</style>