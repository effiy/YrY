<script setup lang="ts" name="KnowledgeMarkdownView">
import { computed } from "vue";
import { useMarkdown } from "@/hooks/useMarkdown";

const props = defineProps<{ content: string }>();

const { render } = useMarkdown();

const html = computed(() => render(props.content ?? ""));
</script>

<template>
  <div class="km-view" v-html="html" />
</template>

<style scoped lang="scss">
.km-view {
  font-size: 15px;
  line-height: 1.7;
  color: var(--el-text-color-primary);
  :deep() {
    h1,
    h2,
    h3,
    h4,
    h5,
    h6 {
      margin: 1.4em 0 0.6em;
      font-weight: 600;
      line-height: 1.3;
    }
    h1 {
      padding-bottom: 0.3em;
      font-size: 1.6em;
      border-bottom: 1px solid var(--el-border-color);
    }
    h2 {
      padding-bottom: 0.3em;
      font-size: 1.35em;
      border-bottom: 1px solid var(--el-border-color);
    }
    h3 {
      font-size: 1.15em;
    }
    p {
      margin: 0.6em 0;
    }
    ul,
    ol {
      padding-left: 1.6em;
      margin: 0.6em 0;
    }
    li {
      margin: 0.2em 0;
    }
    code {
      padding: 0.15em 0.4em;
      font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
      font-size: 0.9em;
      background: var(--el-fill-color-light);
      border-radius: 4px;
    }
    pre {
      padding: 0.9em 1em;
      margin: 0.8em 0;
      overflow-x: auto;
      color: var(--el-text-color-primary);
      background: var(--el-fill-color-darker);
      border-radius: 6px;
      code {
        padding: 0;
        background: transparent;
      }
    }
    table {
      width: 100%;
      margin: 0.8em 0;
      border-collapse: collapse;
      th,
      td {
        padding: 0.5em 0.8em;
        border: 1px solid var(--el-border-color);
      }
      th {
        background: var(--el-fill-color-light);
      }
    }
    blockquote {
      padding: 0.2em 0.9em;
      margin: 0.8em 0;
      color: var(--el-text-color-secondary);
      border-left: 4px solid var(--el-border-color);
    }
    a {
      color: var(--el-color-primary);
      text-decoration: none;
      &:hover {
        text-decoration: underline;
      }
    }
    img {
      max-width: 100%;
    }
    hr {
      margin: 1.2em 0;
      border: 0;
      border-top: 1px solid var(--el-border-color);
    }
  }
}
</style>
