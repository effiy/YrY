<template>
  <el-dialog
    :model-value="visible"
    :title="detailArticle?.title || t('rss.manager.detail.defaultTitle')"
    width="620px"
    destroy-on-close
    @update:model-value="$emit('update:visible', $event)"
  >
    <div v-if="detailArticle" class="rss-role__article-detail">
      <div class="rss-role__article-detail-meta">
        <div class="rss-role__article-detail-field">
          <b>{{ t("rss.manager.detail.fields.source") }}</b
          ><span>{{ detailArticle.source_name || t("rss.manager.detail.fields.unknown") }}</span>
        </div>
        <div class="rss-role__article-detail-field">
          <b>{{ t("rss.manager.detail.fields.author") }}</b
          ><span>{{ detailArticle.author || t("rss.manager.detail.fields.unknown") }}</span>
        </div>
        <div class="rss-role__article-detail-field">
          <b>{{ t("rss.manager.detail.fields.category") }}</b
          ><span>{{ detailArticle.category_path || t("rss.manager.detail.fields.unknown") }}</span>
        </div>
        <div class="rss-role__article-detail-field">
          <b>{{ t("rss.manager.detail.fields.published") }}</b
          ><span>{{
            detailArticle.published ? formatDate(detailArticle.published) : t("rss.manager.detail.fields.unknown")
          }}</span>
        </div>
        <div class="rss-role__article-detail-field">
          <b>{{ t("rss.manager.detail.fields.tags") }}</b
          ><span>{{ (detailArticle.tags || []).join(", ") || t("rss.manager.detail.fields.unknown") }}</span>
        </div>
      </div>
      <div class="rss-role__article-detail-summary">
        <b>{{ t("rss.manager.detail.fields.summary") }}</b>
        <p>{{ stripHtml(detailArticle.summary || "") || t("rss.manager.detail.fields.noSummary") }}</p>
      </div>
      <div class="rss-role__article-detail-body">
        <div class="rss-role__article-detail-body-head">
          <b>{{ t("rss.manager.detail.fields.body") }}</b>
          <span v-if="detailArticle.file_path" class="rss-role__article-detail-body-path">{{ detailArticle.file_path }}</span>
        </div>
        <div
          v-if="articleBodyLoading"
          class="rss-role__article-detail-body-state"
          v-loading="true"
          :element-loading-text="t('rss.manager.detail.fields.loadingBody')"
        />
        <div v-else-if="renderedArticleBody" class="rss-role__article-detail-body-content markdown-body" v-html="renderedArticleBody" />
        <div v-else class="rss-role__article-detail-body-state rss-role__article-detail-body-state--empty">
          <span
            >{{ "\uD83D\uDCED" }}
            {{
              articleBodyError ? t("rss.manager.detail.fields.noBodyFile") : t("rss.manager.detail.fields.noBodyContent")
            }}</span
          >
          <span v-if="articleBodyError" class="rss-role__article-detail-body-hint">{{
            t("rss.manager.detail.fields.missingMarkdown")
          }}</span>
        </div>
      </div>
      <div class="rss-role__article-detail-actions">
        <el-button type="primary" :icon="Link" @click="$emit('openLink', detailArticle)">{{
          t("rss.manager.detail.open")
        }}</el-button>
      </div>
    </div>
  </el-dialog>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";
import { Link } from "@element-plus/icons-vue";
import type { RssItemDocument } from "@/api/modules/rssService";
import { useFormatting } from "./useFormatting";

const { t } = useI18n();
const { formatDate, stripHtml } = useFormatting();

defineProps<{
  visible: boolean;
  detailArticle: RssItemDocument | null;
  articleBody: string;
  articleBodyLoading: boolean;
  articleBodyError: boolean;
  renderedArticleBody: string;
}>();

defineEmits<{
  "update:visible": [value: boolean];
  openLink: [item: RssItemDocument];
}>();
</script>

<style scoped lang="scss">
.rss-role__article-detail {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.rss-role__article-detail-meta {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.rss-role__article-detail-field {
  display: flex;
  gap: 12px;
  font-size: 13px;
  b {
    min-width: 80px;
    font-weight: 600;
    color: var(--el-text-color-secondary);
  }
  span {
    color: var(--el-text-color-primary);
    word-break: break-all;
  }
}
.rss-role__article-detail-summary {
  b {
    font-size: 13px;
    color: var(--el-text-color-secondary);
  }
  p {
    max-height: 240px;
    margin: 6px 0 0;
    overflow: auto;
    font-size: 13px;
    line-height: 1.6;
    color: var(--el-text-color-primary);
    white-space: pre-wrap;
  }
}
.rss-role__article-detail-actions {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
}
.rss-role__article-detail-body {
  padding-top: 12px;
  border-top: 1px dashed var(--el-border-color-lighter);
}
.rss-role__article-detail-body-head {
  display: flex;
  gap: 8px;
  align-items: center;
  margin-bottom: 8px;
  b {
    font-size: 13px;
    color: var(--el-text-color-secondary);
  }
}
.rss-role__article-detail-body-path {
  font-family: monospace;
  font-size: 11px;
  color: var(--el-text-color-placeholder);
  word-break: break-all;
}
.rss-role__article-detail-body-content {
  max-height: 320px;
  padding: 12px 14px;
  overflow: auto;
  font-size: 13px;
  line-height: 1.6;
  background: var(--el-fill-color-lighter);
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 8px;
}
.rss-role__article-detail-body-state {
  display: flex;
  flex-direction: column;
  gap: 4px;
  align-items: center;
  justify-content: center;
  min-height: 64px;
  font-size: 13px;
  color: var(--el-text-color-secondary);
  border: 1px dashed var(--el-border-color-lighter);
  border-radius: 8px;
  &--empty {
    padding: 16px;
  }
}
.rss-role__article-detail-body-hint {
  font-size: 12px;
  color: var(--el-text-color-placeholder);
}
</style>