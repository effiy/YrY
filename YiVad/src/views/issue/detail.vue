<template>
  <div class="issue-detail page" @keydown="ctx.handleKeydown">
    <DetailSkeleton v-if="ctx.loading.value" />

    <template v-else-if="ctx.issue.value">
      <IssueHeader
        :issue="ctx.issue.value"
        :focus-mode="ctx.focusMode.value"
        @toggle-focus="ctx.focusMode.value = !ctx.focusMode.value"
        @change-status="ctx.changeStatus"
        @clone="ctx.cloneIssue"
        @move="ctx.openMove"
        @delete="ctx.handleDelete"
      />

      <div class="id-body" ref="bodyRef">
        <div class="id-main">
          <IssueDescription
            :desc-content="ctx.descContent.value"
            :desc-file-path="ctx.descFilePath.value"
            :desc-html="ctx.descHtml.value"
            @view="openFileViewer"
            @edit="openDescDialog"
          />

          <div v-if="ctx.issue.value.parent_key" class="id-card id-card--parent">
            <div class="id-card__head">
              <el-icon class="id-card__icon"><ctx.Link /></el-icon>
              <span>{{ $t("issue.detail.parentIssue") }}</span>
            </div>
            <div class="id-card__body">
              <el-button link type="primary" @click="router.push(`/issue/${ctx.issue.value.parent_key}`)">
                {{ ctx.issue.value.parent_key }}
              </el-button>
            </div>
          </div>
        </div>

        <div class="id-sidebar" :class="{ 'id-sidebar--hidden': ctx.focusMode.value }">
          <IssueSidebarPeople :issue="ctx.issue.value" />
          <IssueSidebarSchedule :issue="ctx.issue.value" />
          <IssueSidebarLinks :issue="ctx.issue.value" :project-name="ctx.projectName.value" />
          <IssueSidebarLabels :issue="ctx.issue.value" />
          <IssueSidebarDependencies :issue="ctx.issue.value" />
          <IssueSidebarLinkedItems :linked-modules="ctx.linkedModules.value" :linked-bugs="ctx.linkedBugs.value" />
          <IssueSidebarMetadata :issue="ctx.issue.value" />
        </div>
      </div>

      <div class="id-sticky-bar" :class="{ 'id-sticky-bar--visible': ctx.showStickyBar.value }">
        <div class="id-sticky-bar__inner">
          <div class="id-sticky-bar__left">
            <code class="id-sticky-bar__key">{{ ctx.issue.value.key }}</code>
            <code v-if="ctx.descFilePath.value" class="id-sticky-bar__file" :title="ctx.descFilePath.value" @click="openFileViewer">{{
              ctx.descFilePath.value
            }}</code>
            <span class="id-sticky-bar__title">{{ ctx.issue.value.title }}</span>
            <el-tag :type="ctx.statusTagType(ctx.issue.value.status)" size="small">{{ ctx.statusLabel(ctx.issue.value.status) }}</el-tag>
          </div>
          <div class="id-sticky-bar__actions">
            <el-button size="small" :icon="ctx.Edit" @click="ctx.openEdit">{{ $t("issue.dialog.editTitle") }}</el-button>
            <el-select :model-value="ctx.issue.value.status" size="small" @change="ctx.changeStatus" style="width: 130px">
              <el-option v-for="(label, val) in ctx.ISSUE_STATUS_MAP" :key="val" :label="label" :value="val" />
            </el-select>
            <el-button size="small" :icon="ctx.Upload" circle @click="ctx.scrollToTop" />
          </div>
        </div>
      </div>

      <el-dialog v-model="ctx.editDialog.visible" :title="$t('issue.dialog.editTitle')" width="720px" destroy-on-close>
        <IssueDetailForm
          ref="detailFormCompRef"
          :form="ctx.editDialog.form"
          :rules="ctx.rules"
        />
        <template #footer>
          <el-button @click="ctx.editDialog.visible = false">{{ $t("issue.dialog.cancel") }}</el-button>
          <el-button type="primary" :loading="ctx.editDialog.submitting" @click="ctx.submitEdit">{{ $t("issue.dialog.save") }}</el-button>
        </template>
      </el-dialog>

      <KnowledgePreviewDialog ref="descDialogRef" />
    </template>

    <div v-else class="id-not-found">
      <el-result icon="error" :title="$t('issue.detail.notFound')" :sub-title="$t('issue.detail.notFoundSub')">
        <template #extra>
          <el-button type="primary" @click="ctx.goBack">{{ $t("issue.detail.backToIssues") }}</el-button>
        </template>
      </el-result>
    </div>

    <Teleport to="body">
      <div v-if="ctx.preview.visible" class="id-lightbox" @click="ctx.closePreview">
        <div class="id-lightbox__backdrop" />
        <div class="id-lightbox__content">
          <img :src="ctx.preview.src" :alt="ctx.preview.alt" @click.stop />
          <div class="id-lightbox__info">{{ ctx.preview.alt }}</div>
          <el-button class="id-lightbox__close" :icon="ctx.Close" circle size="large" @click="ctx.closePreview" />
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts" name="issueDetail">
import { ref, watch } from "vue";
import { useRouter } from "vue-router";
import { writeKnowledgeFile } from "@/api/modules/knowledgeService";
import DetailSkeleton from "@/components/DetailSkeleton.vue";
import KnowledgePreviewDialog from "@/components/KnowledgePreviewDialog/KnowledgePreviewDialog.vue";
import IssueHeader from "./components/IssueHeader.vue";
import IssueDescription from "./components/IssueDescription.vue";
import IssueSidebarPeople from "./components/IssueSidebarPeople.vue";
import IssueSidebarSchedule from "./components/IssueSidebarSchedule.vue";
import IssueSidebarLinks from "./components/IssueSidebarLinks.vue";
import IssueSidebarLabels from "./components/IssueSidebarLabels.vue";
import IssueSidebarDependencies from "./components/IssueSidebarDependencies.vue";
import IssueSidebarLinkedItems from "./components/IssueSidebarLinkedItems.vue";
import IssueSidebarMetadata from "./components/IssueSidebarMetadata.vue";
import IssueDetailForm from "./IssueDetailForm.vue";
import { useIssueDetail } from "./useIssueDetail";

const router = useRouter();
const ctx = useIssueDetail();

// Refs used directly in template
const bodyRef = ref<HTMLElement>();
const descDialogRef = ctx.descDialogRef;
const detailFormCompRef = ref<InstanceType<typeof IssueDetailForm>>();

// Sync form ref from child component to composable for validation
watch(detailFormCompRef, (comp) => {
  ctx.editFormRef.value = comp?.formRef;
});

function openFileViewer() {
  if (!ctx.descContent.value || !ctx.descFilePath.value) return;
  descDialogRef.value?.openFile({
    path: ctx.descFilePath.value,
    title: ctx.issue.value?.title || "",
    content: ctx.descContent.value,
    onSave: async (content: string) => {
      await writeKnowledgeFile(ctx.descFilePath.value, content, {
        title: ctx.issue.value?.title || "",
        type: "issue-description",
        status: ctx.issue.value?.status || "",
        project: ctx.issue.value?.project_key || "",
        created: (ctx.issue.value?.created_at || "").slice(0, 10)
      });
      ctx.descContent.value = content;
    }
  });
}

function openDescDialog() {
  descDialogRef.value?.openFile({
    path: ctx.descFilePath.value,
    title: ctx.issue.value?.title || "",
    content: ctx.descContent.value,
    onSave: async (content: string) => {
      await writeKnowledgeFile(ctx.descFilePath.value, content, {
        title: ctx.issue.value?.title || "",
        type: "issue-description",
        status: ctx.issue.value?.status || "",
        project: ctx.issue.value?.project_key || "",
        created: (ctx.issue.value?.created_at || "").slice(0, 10)
      });
      ctx.descContent.value = content;
    }
  });
}
</script>

<style scoped lang="scss">
.issue-detail {
  min-height: calc(100vh - 95px);
  outline: none;
  // padding + background come from global .page class
}

// ── Body Layout ─────────────────────────────────────────────────────
.id-body {
  display: flex;
  gap: 20px;
  align-items: flex-start;
}
.id-main {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 16px;
  min-width: 0;
}

// ── Section Cards ───────────────────────────────────────────────────
.id-card {
  overflow: hidden;
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 10px;
  &--parent {
    border-left: 3px solid var(--el-color-primary);
  }
}
.id-card__head {
  display: flex;
  gap: 8px;
  align-items: center;
  padding: 12px 16px;
  font-size: 14px;
  font-weight: 600;
  color: var(--el-text-color-primary);
  background: var(--el-fill-color-lighter);
  border-bottom: 1px solid var(--el-border-color-lighter);
}
.id-card__icon {
  font-size: 16px;
  color: var(--el-color-primary);
}
.id-card__body {
  padding: 16px;
  :deep(.markdown-body) {
    font-size: 14px;
  }
}

// ── Sidebar ─────────────────────────────────────────────────────────
.id-sidebar {
  position: sticky;
  top: 20px;
  display: flex;
  flex-shrink: 0;
  flex-direction: column;
  gap: 12px;
  width: 280px;
}
.id-sidebar--hidden {
  display: none;
}

// ── Sticky Bottom Bar ───────────────────────────────────────────────
.id-sticky-bar {
  position: fixed;
  right: 0;
  bottom: 0;
  left: 0;
  z-index: 100;
  padding: 10px 24px;
  background: var(--el-bg-color);
  border-top: 1px solid var(--el-border-color);
  box-shadow: 0 -4px 20px rgb(0 0 0 / 8%);
  transform: translateY(100%);
  transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  &--visible {
    transform: translateY(0);
  }
}
.id-sticky-bar__inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  max-width: 1400px;
  margin: 0 auto;
}
.id-sticky-bar__left {
  display: flex;
  gap: 10px;
  align-items: center;
  min-width: 0;
}
.id-sticky-bar__key {
  flex-shrink: 0;
  padding: 2px 8px;
  font-family: monospace;
  font-size: 12px;
  color: var(--el-text-color-secondary);
  background: var(--el-fill-color-light);
  border-radius: 4px;
}
.id-sticky-bar__file {
  flex-shrink: 0;
  max-width: 240px;
  padding: 2px 8px;
  overflow: hidden;
  text-overflow: ellipsis;
  font-family: monospace;
  font-size: 11px;
  color: var(--el-text-color-secondary);
  white-space: nowrap;
  cursor: pointer;
  background: var(--el-fill-color);
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 4px;
  transition:
    color 0.15s,
    border-color 0.15s;
  &:hover {
    color: var(--el-color-primary);
    border-color: var(--el-color-primary-light-5);
  }
}
.id-sticky-bar__title {
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: 14px;
  font-weight: 600;
  white-space: nowrap;
}
.id-sticky-bar__actions {
  display: flex;
  flex-shrink: 0;
  gap: 8px;
  align-items: center;
}

// ── Not Found ───────────────────────────────────────────────────────
.id-not-found {
  padding: 80px 0;
}

// ── Edit Dialog ─────────────────────────────────────────────────────
.id-edit-section {
  margin-bottom: 8px;
}
.id-edit-section__title {
  padding: 0 0 8px 100px;
  margin-bottom: 12px;
  font-size: 13px;
  font-weight: 700;
  color: var(--el-text-color-secondary);
  text-transform: uppercase;
  letter-spacing: 0.3px;
  border-bottom: 1px solid var(--el-border-color-lighter);
}

// ── Lightbox ─────────────────────────────────────────────────────────
.id-lightbox {
  position: fixed;
  inset: 0;
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: id-fade-in 0.2s ease;
}
.id-lightbox__backdrop {
  position: absolute;
  inset: 0;
  background: rgb(0 0 0 / 85%);
  backdrop-filter: blur(4px);
}
.id-lightbox__content {
  position: relative;
  max-width: 90vw;
  max-height: 90vh;
  img {
    max-width: 90vw;
    max-height: 85vh;
    border-radius: 8px;
    box-shadow: 0 8px 40px rgb(0 0 0 / 30%);
  }
}
.id-lightbox__info {
  margin-top: 8px;
  font-size: 12px;
  color: rgb(255 255 255 / 70%);
  text-align: center;
}
.id-lightbox__close {
  position: absolute;
  top: -20px;
  right: -20px;
  color: #ffffff;
  background: rgb(255 255 255 / 15%) !important;
  &:hover {
    background: rgb(255 255 255 / 25%) !important;
  }
}

@keyframes id-fade-in {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

// ── Print Styles ────────────────────────────────────────────────────
@media print {
  .issue-detail {
    height: auto;
    padding: 0;
    overflow: visible;
    background: #ffffff;
  }
  .id-sidebar {
    display: none;
  }
  .id-sticky-bar {
    display: none;
  }
  .id-card {
    margin-bottom: 12px;
    border: none;
    border-bottom: 1px solid #eeeeee;
    border-radius: 0;
    break-inside: avoid;
  }
  .id-card__head {
    background: transparent;
    border-bottom: 1px solid #eeeeee;
  }
  .id-card__body {
    padding: 12px 0;
  }
  .id-body {
    display: block;
  }
  .id-main {
    max-width: 100%;
  }
  kbd {
    border: 1px solid #999999;
  }
  code {
    background: #f5f5f5 !important;
  }
}
</style>

<!-- Shared sidebar styles (non-scoped so child components inherit them) -->
<style lang="scss">
.id-sb-group {
  overflow: hidden;
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 10px;
}
.id-sb-group__title {
  display: flex;
  gap: 7px;
  align-items: center;
  padding: 10px 14px;
  font-size: 12px;
  font-weight: 700;
  color: var(--el-text-color-secondary);
  text-transform: uppercase;
  letter-spacing: 0.3px;
  background: var(--el-fill-color-lighter);
  border-bottom: 1px solid var(--el-border-color-lighter);
  .el-icon {
    font-size: 13px;
  }
}
.id-sb-edit {
  display: flex;
  align-items: center;
  padding: 2px;
  margin-left: auto;
  color: var(--el-text-color-placeholder);
  cursor: pointer;
  background: transparent;
  border: none;
  border-radius: 4px;
  transition: all 0.12s;
  &:hover {
    color: var(--el-color-primary);
    background: var(--el-fill-color);
  }
}
.id-sb-edit-row {
  display: flex;
  gap: 6px;
  align-items: center;
  padding: 4px 0;
  & + & {
    border-top: 1px solid var(--el-border-color-lighter);
  }
}
.id-sb-edit-row__label {
  flex-shrink: 0;
  width: 42px;
  font-size: 11px;
  color: var(--el-text-color-secondary);
}
.id-sb-edit-actions {
  display: flex;
  gap: 6px;
  padding-top: 8px;
}
.id-sb-group__body {
  padding: 8px 14px;
}
.id-sb-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 6px 0;
  font-size: 13px;
  & + & {
    border-top: 1px solid var(--el-border-color-lighter);
  }
}
.id-sb-row__label {
  flex-shrink: 0;
  font-weight: 500;
  color: var(--el-text-color-secondary);
}
.id-sb-row__value {
  text-align: right;
  &--overdue {
    font-weight: 600;
    color: var(--el-color-danger);
  }
  &--muted {
    font-size: 12px;
    color: var(--el-text-color-placeholder);
  }
  &--empty {
    font-style: italic;
    color: var(--el-text-color-placeholder);
  }
}
.id-time-bar {
  display: flex;
  flex-direction: column;
  gap: 4px;
  width: 100%;
}
.id-time-bar__text {
  font-size: 12px;
  color: var(--el-text-color-secondary);
}
.id-sb-labels {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  padding: 4px 0;
}
.id-sb-label {
  cursor: pointer;
  transition: transform 0.12s;
  &:hover {
    transform: scale(1.05);
  }
}
.id-sb-dep {
  margin-bottom: 8px;
  &:last-child {
    margin-bottom: 0;
  }
}
.id-sb-dep__label {
  display: block;
  margin-bottom: 4px;
  font-size: 11px;
  color: var(--el-text-color-placeholder);
}
.id-sb-dep__tags {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  .el-tag {
    cursor: pointer;
  }
}

// Header styles (used by IssueHeader)
.id-header {
  padding: 20px 24px;
  margin-bottom: 20px;
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color-lighter);
  border-left: 4px solid var(--el-color-primary);
  border-radius: 12px;
}
.id-header__top {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.id-header__actions {
  display: flex;
  flex-shrink: 0;
  gap: 8px;
  align-items: center;
}
.id-header__title {
  margin: 0;
  font-size: 22px;
  font-weight: 700;
  line-height: 1.3;
  color: var(--el-text-color-primary);
}

// Description styles (used by IssueDescription)
.id-desc-path {
  max-width: 280px;
  padding: 1px 7px;
  margin-left: 8px;
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: 11px;
  color: var(--el-text-color-secondary);
  white-space: nowrap;
  cursor: pointer;
  background: var(--el-fill-color);
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 4px;
  transition:
    color 0.15s,
    border-color 0.15s;
  &:hover {
    color: var(--el-color-primary);
    border-color: var(--el-color-primary-light-5);
  }
}
.id-card__head-right {
  display: flex;
  gap: 2px;
  align-items: center;
  margin-left: auto;
}
.id-card__body--clickable {
  cursor: pointer;
  transition: background 0.15s;
  &:hover {
    background: var(--el-fill-color-lighter);
  }
}
.id-desc-preview {
  :deep(.markdown-body) {
    font-size: 14px;
  }
}
.id-empty {
  padding: 24px 16px;
  text-align: center;
}
.id-empty__icon {
  margin-bottom: 8px;
  font-size: 28px;
  color: var(--el-text-color-placeholder);
}
.id-empty__text {
  margin: 0;
  font-size: 13px;
  font-weight: 500;
  color: var(--el-text-color-secondary);
}
.id-empty__hint {
  margin: 4px 0 0;
  font-size: 12px;
  color: var(--el-text-color-placeholder);
}

@media print {
  .id-header__actions {
    display: none;
  }
  .id-header {
    padding: 0 0 16px;
    margin-bottom: 16px;
    border: none;
    border-bottom: 2px solid #000000;
    border-left: none;
    border-radius: 0;
  }
  .id-header__title {
    font-size: 18px;
  }
}
</style>