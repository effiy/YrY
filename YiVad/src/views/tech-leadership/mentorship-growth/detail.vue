<script setup lang="ts" name="tlrMentorshipGrowthDetail">
import TopicDetailPage from "@/components/TopicDetailPage/index.vue";
import { tlrMetaSchemas } from "@/views/tech-leadership/meta-schemas";
const schema = tlrMetaSchemas["mentorship-growth"];
</script>
<template>
  <TopicDetailPage tree="tech-leadership" topic="mentorship-growth" label="Mentorship & Growth" :meta-fields="schema.metaFields" :template-content="schema.templateContent">
  </TopicDetailPage>
</template>
