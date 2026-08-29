<template>
  <div class="rm-card">
    <div class="rm-card__head">
      <el-icon class="rm-card__icon"><Document /></el-icon>
      <span>README.md</span>
      <el-tag v-if="metaType" size="small" type="info" class="rm-card__meta-tag">{{ metaType }}</el-tag>
      <span v-if="metaUpdated" class="rm-card__meta-date">Updated {{ metaUpdated }}</span>
      <div class="rm-card__head-right">
        <el-button v-if="content" link size="small" type="primary" :icon="Edit" @click="$emit('edit')">{{ editLabel }}</el-button>
        <el-button v-else link size="small" type="primary" @click="$emit('edit')">{{ addLabel }}</el-button>
      </div>
    </div>
    <div class="rm-card__body">
      <div v-if="content" class="rm-preview" v-html="html" />
      <div v-else class="rm-empty">
        <el-icon class="rm-empty__icon"><Document /></el-icon>
        <p class="rm-empty__text">No README.md found</p>
        <p class="rm-empty__hint">{{ emptyHint }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts" name="readmeCard">
import { Document, Edit } from "@element-plus/icons-vue";

defineProps<{
  content: string;
  html: string;
  metaType?: string;
  metaUpdated?: string;
  emptyHint?: string;
  editLabel?: string;
  addLabel?: string;
}>();

defineEmits<{ edit: [] }>();
</script>

<style scoped lang="scss">
.rm-card {
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 10px;
  padding: 0;
  overflow: hidden;
}

.rm-card__head {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  font-size: 14px;
  font-weight: 600;
  color: var(--el-text-color-primary);
  background: var(--el-fill-color-lighter);
  border-bottom: 1px solid var(--el-border-color-lighter);
}

.rm-card__icon {
  font-size: 16px;
  color: var(--el-color-primary);
}

.rm-card__meta-tag {
  font-weight: 400;
}

.rm-card__meta-date {
  font-size: 12px;
  font-weight: 400;
  color: var(--el-text-color-placeholder);
}

.rm-card__head-right {
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 2px;
}

.rm-card__body {
  padding: 16px;
}

.rm-preview {
  padding: 12px;
  font-size: 14px;
  line-height: 1.7;
  color: var(--el-text-color-primary);
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color-light);
  border-radius: 6px;
}

.rm-empty {
  text-align: center;
  padding: 24px 16px;
}

.rm-empty__icon {
  font-size: 28px;
  color: var(--el-text-color-placeholder);
  margin-bottom: 8px;
}

.rm-empty__text {
  margin: 0;
  font-size: 13px;
  font-weight: 500;
  color: var(--el-text-color-secondary);
}

.rm-empty__hint {
  margin: 4px 0 0;
  font-size: 12px;
  color: var(--el-text-color-placeholder);
}
</style>

<!-- Non-scoped markdown preview styles (v-html content) -->
<style lang="scss">
.rm-preview {
  h1, h2, h3, h4 {
    margin: 1em 0 0.5em;
  }
  h1 { font-size: 1.5em; }
  h2 { font-size: 1.3em; }
  h3 { font-size: 1.15em; }
  p { margin: 0.5em 0; }
  pre {
    padding: 12px;
    overflow-x: auto;
    font-size: 13px;
    background: var(--el-fill-color);
    border-radius: 6px;
    code { padding: 0; background: none; }
  }
  code {
    font-family: "SF Mono", Menlo, monospace;
    font-size: 0.9em;
  }
  blockquote {
    margin: 0.5em 0;
    padding: 4px 12px;
    border-left: 3px solid var(--el-color-primary-light-5);
    color: var(--el-text-color-secondary);
  }
  table {
    border-collapse: collapse;
  }
  th, td {
    padding: 6px 12px;
    border: 1px solid var(--el-border-color-lighter);
  }
  th {
    background: var(--el-fill-color-light);
    font-weight: 600;
  }
  ul, ol {
    padding-left: 22px;
    margin: 0.5em 0;
  }
  li { margin-bottom: 2px; }
  a { color: var(--el-color-primary); }
  hr {
    border: none;
    border-top: 1px solid var(--el-border-color-lighter);
    margin: 16px 0;
  }
  img { max-width: 100%; }

  pre.mermaid {
    all: unset;
    display: block;
    overflow-x: auto;
    margin: 12px 0;

    svg {
      max-width: 100%;
      height: auto;
      display: block;
      margin: 0 auto;
    }
  }
}
</style>