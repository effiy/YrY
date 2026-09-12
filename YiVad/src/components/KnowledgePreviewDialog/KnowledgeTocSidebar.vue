<script setup lang="ts">
/**
 * KnowledgeTocSidebar — table of contents sidebar for knowledge preview.
 * Extracted from KnowledgePreviewDialog.vue.
 */
defineProps<{
  items: Array<{ level: number; text: string; id: string }>;
  collapsed: boolean;
}>();

const emit = defineEmits<{
  toggleCollapse: [];
  scrollTo: [id: string];
}>();
</script>

<template>
  <aside class="kpd-toc" :class="{ 'is-collapsed': collapsed }">
    <div class="kpd-toc-title" @click="emit('toggleCollapse')">
      <span class="kpd-toc-title-text">Contents</span>
      <span class="kpd-toc-toggle">{{ collapsed ? '▶' : '◀' }}</span>
    </div>
    <ul class="kpd-toc-list">
      <li
        v-for="item in items"
        :key="item.id"
        :class="`kpd-toc-item--h${item.level}`"
        :title="collapsed ? item.text : ''"
      >
        <a href="#" @click.prevent="emit('scrollTo', item.id)">
          <span class="kpd-toc-full">{{ item.text }}</span>
          <span class="kpd-toc-initial">{{ item.text.charAt(0) }}</span>
        </a>
      </li>
    </ul>
  </aside>
</template>