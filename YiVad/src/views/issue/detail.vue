<template>
  <div class="issue-detail" @keydown="handleKeydown">
    <!-- Skeleton Loading -->
    <template v-if="loading">
      <div class="id-skeleton">
        <div class="id-skel-header">
          <div class="id-skel-line id-skel-line--short" />
          <div class="id-skel-line id-skel-line--long" />
          <div class="id-skel-row">
            <div class="id-skel-tag" />
            <div class="id-skel-tag" />
            <div class="id-skel-tag" />
          </div>
        </div>
        <div class="id-skel-body">
          <div class="id-skel-main">
            <div class="id-skel-card" v-for="i in 3" :key="i">
              <div class="id-skel-line id-skel-line--med" />
              <div class="id-skel-line id-skel-line--long" />
              <div class="id-skel-line id-skel-line--long" />
              <div class="id-skel-line id-skel-line--med" />
            </div>
          </div>
          <div class="id-skel-sidebar">
            <div class="id-skel-card" v-for="i in 3" :key="i">
              <div class="id-skel-line id-skel-line--med" />
              <div class="id-skel-line id-skel-line--short" />
              <div class="id-skel-line id-skel-line--short" />
            </div>
          </div>
        </div>
      </div>
    </template>

    <template v-else-if="issue">
      <!-- Header Card -->
      <div class="id-header">
        <div class="id-header__top">
            <h1 class="id-header__title">{{ issue.title }}</h1>
          <div class="id-header__actions">
                                    <el-tooltip :content="focusMode ? 'Show sidebar' : 'Focus mode'" placement="bottom">
              <el-button size="small" :icon="focusMode ? Rank : FullScreen" @click="focusMode = !focusMode" />
            </el-tooltip>
            <el-select
              v-model="quickStatus"
              placeholder="Status"
              size="small"
              @change="changeStatus"
              style="width: 130px"
            >
              <el-option
                v-for="(label, val) in ISSUE_STATUS_MAP"
                :key="val"
                :label="label"
                :value="val"
              />
            </el-select>
            <el-dropdown trigger="click">
              <el-button :icon="MoreFilled" size="small" />
              <template #dropdown>
                <el-dropdown-item :icon="CopyDocument" @click="cloneIssue">Clone</el-dropdown-item>
                <el-dropdown-item :icon="Switch" @click="openMove">Move to Project</el-dropdown-item>
                <el-dropdown-item :icon="Delete" divided @click="handleDelete">Delete</el-dropdown-item>
              </template>
            </el-dropdown>
          </div>
        </div>
      </div>

      <!-- Body -->
      <div class="id-body" ref="bodyRef">
        <!-- Main Content -->
        <div class="id-main">
          <!-- Description -->
          <div class="id-card">
            <div class="id-card__head">
              <el-icon class="id-card__icon"><Document /></el-icon>
              <span>Description</span>
              <code v-if="descFilePath" class="id-desc-path" :title="descFilePath" @click.stop="openFileViewer">{{ descFilePath }}</code>
              <div class="id-card__head-right">
                <el-button link size="small" type="primary" :icon="FolderOpened" title="Open in file viewer" @click="openFileViewer">View</el-button>
                <el-button v-if="descContent" link size="small" type="primary" :icon="Edit" @click="openDescDialog">Edit</el-button>
                <el-button v-else link size="small" type="primary" @click="openDescDialog">Add description</el-button>
              </div>
            </div>
            <div class="id-card__body" :class="{ 'id-card__body--clickable': descContent }" @click="openFileViewer">
              <div v-if="descContent" class="id-desc-preview markdown-body" v-html="descHtml" />
              <div v-else class="id-empty">
                <el-icon class="id-empty__icon"><Document /></el-icon>
                <p class="id-empty__text">No description yet</p>
                <p class="id-empty__hint">Add a description to help others understand this issue</p>
              </div>
            </div>
          </div>

                    <div v-if="issue.parent_key" class="id-card id-card--parent">
            <div class="id-card__head">
              <el-icon class="id-card__icon"><Link /></el-icon>
              <span>Parent Issue</span>
            </div>
            <div class="id-card__body">
              <el-button link type="primary" @click="router.push(`/issue/${issue.parent_key}`)">
                {{ issue.parent_key }}
              </el-button>
            </div>
          </div>

          
                            </div>

        <!-- Sidebar -->
        <div class="id-sidebar" :class="{ 'id-sidebar--hidden': focusMode }">
          <!-- People -->
          <div class="id-sb-group">
            <div class="id-sb-group__title">
              <el-icon><User /></el-icon>
              <span>People</span>
              <button v-if="!editingAssignee" type="button" class="id-sb-edit" title="Edit assignee" @click="startEditAssignee">
                <el-icon><Edit /></el-icon>
              </button>
            </div>
            <div class="id-sb-group__body">
              <template v-if="editingAssignee">
                <div class="id-sb-edit-row">
                  <el-input v-model="assigneeEdit" size="small" placeholder="Assignee" @keyup.enter="saveAssignee" />
                  <el-button size="small" type="primary" :loading="savingAssignee" @click="saveAssignee">Save</el-button>
                  <el-button size="small" @click="editingAssignee = false">Cancel</el-button>
                </div>
              </template>
              <div v-else class="id-sb-row">
                <span class="id-sb-row__label">Assignee</span>
                <span class="id-sb-row__value" :class="{ 'id-sb-row__value--empty': !issue.assignee }">
                  {{ issue.assignee || 'Unassigned' }}
                </span>
              </div>
            </div>
          </div>

          <!-- Schedule -->
          <div class="id-sb-group">
            <div class="id-sb-group__title">
              <el-icon><Calendar /></el-icon>
              <span>Schedule</span>
              <button v-if="!editingSchedule" type="button" class="id-sb-edit" title="Edit schedule" @click="startEditSchedule">
                <el-icon><Edit /></el-icon>
              </button>
            </div>
            <div class="id-sb-group__body">
              <template v-if="editingSchedule">
                <div class="id-sb-edit-row">
                  <span class="id-sb-edit-row__label">Start</span>
                  <el-date-picker v-model="scheduleEdit.start_date" size="small" type="date" value-format="YYYY-MM-DD" style="width:100%" />
                </div>
                <div class="id-sb-edit-row">
                  <span class="id-sb-edit-row__label">Due</span>
                  <el-date-picker v-model="scheduleEdit.due_date" size="small" type="date" value-format="YYYY-MM-DD" style="width:100%" />
                </div>
                <div class="id-sb-edit-row">
                  <span class="id-sb-edit-row__label">Pts</span>
                  <el-input-number v-model="scheduleEdit.estimate_points" size="small" :min="0" :step="1" style="width:100%" />
                </div>
                <div class="id-sb-edit-row">
                  <span class="id-sb-edit-row__label">Time (h)</span>
                  <el-input-number v-model="scheduleEdit.time_estimate" size="small" :min="0" :step="0.5" :precision="1" style="width:100%" />
                </div>
                <div class="id-sb-edit-actions">
                  <el-button size="small" type="primary" :loading="savingSchedule" @click="saveSchedule">Save</el-button>
                  <el-button size="small" @click="editingSchedule = false">Cancel</el-button>
                </div>
              </template>
              <template v-else>
                <div class="id-sb-row">
                  <span class="id-sb-row__label">Start Date</span>
                  <span class="id-sb-row__value id-sb-row__value--muted">{{ issue.start_date || '-' }}</span>
                </div>
                <div class="id-sb-row">
                  <span class="id-sb-row__label">Due Date</span>
                  <span class="id-sb-row__value" :class="{ 'id-sb-row__value--overdue': isOverdue }">
                    {{ issue.due_date || '-' }}
                  </span>
                </div>
                <div class="id-sb-row">
                  <span class="id-sb-row__label">Estimate</span>
                  <span class="id-sb-row__value">
                    {{ issue.estimate_points ? issue.estimate_points + ' pts' : '-' }}
                  </span>
                </div>
                <div class="id-sb-row">
                  <span class="id-sb-row__label">Time</span>
                  <span class="id-sb-row__value">
                    <template v-if="issue.time_estimate">
                      <div class="id-time-bar">
                        <span class="id-time-bar__text">{{ issue.time_spent || 0 }}h / {{ issue.time_estimate }}h</span>
                        <el-progress
                          :percentage="timePct"
                          :stroke-width="5"
                          :show-text="false"
                          :color="timePct > 100 ? '#f56c6c' : '#409eff'"
                        />
                      </div>
                    </template>
                    <template v-else>-</template>
                  </span>
                </div>
              </template>
            </div>
          </div>

          <!-- Links -->
          <div class="id-sb-group">
            <div class="id-sb-group__title">
              <el-icon><Connection /></el-icon>
              <span>Links</span>
            </div>
            <div class="id-sb-group__body">
              <div class="id-sb-row">
                <span class="id-sb-row__label">Project</span>
                <span class="id-sb-row__value">
                  <el-button link size="small" type="primary" @click="router.push(`/project/${issue.project_key}`)">
                    {{ projectName }}
                  </el-button>
                </span>
              </div>
              <div v-if="issue.goal_id && goalRoleMap[issue.goal_id]" class="id-sb-row">
                <span class="id-sb-row__label">Goal</span>
                <span class="id-sb-row__value">
                  <el-button link size="small" type="success" @click="goGoal(issue.goal_id)">
                    {{ goalLabel(issue.goal_id) }}
                  </el-button>
                </span>
              </div>
              <div v-if="issue.parent_key" class="id-sb-row">
                <span class="id-sb-row__label">Parent</span>
                <span class="id-sb-row__value">
                  <el-button link size="small" type="primary" @click="router.push(`/issue/${issue.parent_key}`)">
                    {{ issue.parent_key }}
                  </el-button>
                </span>
              </div>
            </div>
          </div>

          <!-- Labels -->
          <div class="id-sb-group">
            <div class="id-sb-group__title">
              <el-icon><PriceTag /></el-icon>
              <span>Labels</span>
              <button v-if="!editingLabels" type="button" class="id-sb-edit" title="Edit labels" @click="startEditLabels">
                <el-icon><Edit /></el-icon>
              </button>
            </div>
            <div class="id-sb-group__body">
              <template v-if="editingLabels">
                <div class="id-sb-edit-row">
                  <el-select
                    v-model="labelsEdit"
                    multiple
                    filterable
                    allow-create
                    default-first-option
                    placeholder="Add labels"
                    style="width:100%"
                    size="small"
                  />
                </div>
                <div class="id-sb-edit-actions">
                  <el-button size="small" type="primary" :loading="savingLabels" @click="saveLabels">Save</el-button>
                  <el-button size="small" @click="editingLabels = false">Cancel</el-button>
                </div>
              </template>
              <div v-else-if="issue.labels?.length" class="id-sb-labels">
                <el-tag
                  v-for="label in issue.labels"
                  :key="label"
                  size="small"
                  round
                  class="id-sb-label"
                  @click="goLabel(label)"
                >{{ label }}</el-tag>
              </div>
              <div v-else class="id-sb-row__value--empty" style="padding:4px 0;font-size:12px">No labels</div>
            </div>
          </div>

          <!-- Dependencies -->
          <div v-if="(issue.blocked_by?.length || issue.blocks?.length || issue.related?.length)" class="id-sb-group">
            <div class="id-sb-group__title">
              <el-icon><Link /></el-icon>
              <span>Dependencies</span>
            </div>
            <div class="id-sb-group__body">
              <div v-if="issue.blocked_by?.length" class="id-sb-dep">
                <span class="id-sb-dep__label">Blocked by</span>
                <div class="id-sb-dep__tags">
                  <el-tag
                    v-for="k in issue.blocked_by"
                    :key="k"
                    size="small"
                    type="danger"
                    @click="router.push(`/issue/${k}`)"
                  >{{ k }}</el-tag>
                </div>
              </div>
              <div v-if="issue.blocks?.length" class="id-sb-dep">
                <span class="id-sb-dep__label">Blocks</span>
                <div class="id-sb-dep__tags">
                  <el-tag
                    v-for="k in issue.blocks"
                    :key="k"
                    size="small"
                    type="warning"
                    @click="router.push(`/issue/${k}`)"
                  >{{ k }}</el-tag>
                </div>
              </div>
              <div v-if="issue.related?.length" class="id-sb-dep">
                <span class="id-sb-dep__label">Related</span>
                <div class="id-sb-dep__tags">
                  <el-tag
                    v-for="k in issue.related"
                    :key="k"
                    size="small"
                    type="info"
                    @click="router.push(`/issue/${k}`)"
                  >{{ k }}</el-tag>
                </div>
              </div>
            </div>
          </div>

          <!-- Linked Items -->
          <div v-if="linkedModules.length || linkedBugs.length" class="id-sb-group">
            <div class="id-sb-group__title">
              <el-icon><Connection /></el-icon>
              <span>Linked Items</span>
            </div>
            <div class="id-sb-group__body">
              <div v-if="linkedModules.length" class="id-sb-dep">
                <span class="id-sb-dep__label">Module</span>
                <div class="id-sb-dep__tags">
                  <el-tag
                    v-for="m in linkedModules"
                    :key="m.key"
                    size="small"
                    @click="router.push(`/module/${m.key}`)"
                  >{{ m.name }}</el-tag>
                </div>
              </div>
              <div v-if="linkedBugs.length" class="id-sb-dep">
                <span class="id-sb-dep__label">Bug</span>
                <div class="id-sb-dep__tags">
                  <el-tag
                    v-for="b in linkedBugs"
                    :key="b.key"
                    size="small"
                    type="danger"
                    @click="router.push(`/bug/${b.key}`)"
                  >{{ b.title }}</el-tag>
                </div>
              </div>
            </div>
          </div>

          <!-- Metadata -->
          <div class="id-sb-group">
            <div class="id-sb-group__title">
              <el-icon><InfoFilled /></el-icon>
              <span>Metadata</span>
            </div>
            <div class="id-sb-group__body">
              <div class="id-sb-row">
                <span class="id-sb-row__label">Source</span>
                <span class="id-sb-row__value">{{ issue.source ? ISSUE_SOURCE_MAP[issue.source] : '-' }}</span>
              </div>
              <div class="id-sb-row">
                <span class="id-sb-row__label">Review</span>
                <span class="id-sb-row__value">{{ issue.review_status ? REVIEW_STATUS_MAP[issue.review_status] : '-' }}</span>
              </div>
              <div class="id-sb-row">
                <span class="id-sb-row__label">Created</span>
                <span class="id-sb-row__value id-sb-row__value--muted">{{ formatRelativeTime(issue.created_at) }}</span>
              </div>
              <div class="id-sb-row">
                <span class="id-sb-row__label">Updated</span>
                <span class="id-sb-row__value id-sb-row__value--muted">{{ formatRelativeTime(issue.updated_at) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Sticky Bottom Bar -->
      <div class="id-sticky-bar" :class="{ 'id-sticky-bar--visible': showStickyBar }">
        <div class="id-sticky-bar__inner">
          <div class="id-sticky-bar__left">
            <code class="id-sticky-bar__key">{{ issue.key }}</code>
            <code v-if="descFilePath" class="id-sticky-bar__file" :title="descFilePath" @click="openFileViewer">{{ descFilePath }}</code>
            <span class="id-sticky-bar__title">{{ issue.title }}</span>
            <el-tag :type="statusTagType(issue.status)" size="small">{{ statusLabel(issue.status) }}</el-tag>
          </div>
          <div class="id-sticky-bar__actions">
            <el-button size="small" :icon="Edit" @click="openEdit">Edit</el-button>
            <el-select
              :model-value="issue.status"
              size="small"
              @change="changeStatus"
              style="width: 130px"
            >
              <el-option v-for="(label, val) in ISSUE_STATUS_MAP" :key="val" :label="label" :value="val" />
            </el-select>
            <el-button size="small" :icon="Upload" circle @click="scrollToTop" />
          </div>
        </div>
      </div>

      <!-- Edit Dialog -->
      <el-dialog v-model="editDialog.visible" title="Edit Issue" width="720px" destroy-on-close>
        <el-form ref="editFormRef" :model="editDialog.form" :rules="rules" label-width="100px">
          <div class="id-edit-section">
            <div class="id-edit-section__title">Basic</div>
            <el-form-item label="Title" prop="title">
              <el-input v-model="editDialog.form.title" placeholder="Issue title" maxlength="200" show-word-limit />
            </el-form-item>
            <el-row :gutter="16">
              <el-col :span="8">
                <el-form-item label="Type" prop="issue_type">
                  <el-select v-model="editDialog.form.issue_type" style="width: 100%">
                    <el-option v-for="(label, val) in ISSUE_TYPE_MAP" :key="val" :label="label" :value="val" />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="Priority" prop="priority">
                  <el-select v-model="editDialog.form.priority" style="width: 100%">
                    <el-option v-for="(label, val) in ISSUE_PRIORITY_MAP" :key="val" :label="label" :value="val" />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="Status" prop="status">
                  <el-select v-model="editDialog.form.status" style="width: 100%">
                    <el-option v-for="(label, val) in ISSUE_STATUS_MAP" :key="val" :label="label" :value="val" />
                  </el-select>
                </el-form-item>
              </el-col>
            </el-row>
          </div>
          <div class="id-edit-section">
            <div class="id-edit-section__title">Content</div>
            <el-form-item label="Description">
              <el-input v-model="editDialog.form.description" type="textarea" :rows="4" placeholder="Markdown supported" />
            </el-form-item>
                                  </div>
          <div class="id-edit-section">
            <div class="id-edit-section__title">Assignment</div>
            <el-row :gutter="16">
              <el-col :span="12">
                <el-form-item label="Assignee">
                  <el-input v-model="editDialog.form.assignee" placeholder="Assignee" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="Labels">
                  <el-select
                    v-model="editDialog.form.labels"
                    multiple
                    filterable
                    allow-create
                    default-first-option
                    placeholder="Add labels"
                    style="width:100%"
                  />
                </el-form-item>
              </el-col>
            </el-row>
          </div>
          <div class="id-edit-section">
            <div class="id-edit-section__title">Schedule & Tracking</div>
            <el-row :gutter="16">
              <el-col :span="12">
                <el-form-item label="Start Date">
                  <el-date-picker v-model="editDialog.form.start_date" type="date" style="width: 100%" value-format="YYYY-MM-DD" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="Due Date">
                  <el-date-picker v-model="editDialog.form.due_date" type="date" style="width: 100%" value-format="YYYY-MM-DD" />
                </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="16">
              <el-col :span="12">
                <el-form-item label="Estimate (pts)">
                  <el-input-number v-model="editDialog.form.estimate_points" :min="0" :step="1" style="width:100%" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="Time Est. (h)">
                  <el-input-number v-model="editDialog.form.time_estimate" :min="0" :step="0.5" :precision="1" style="width:100%" />
                </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="16">
              <el-col :span="12">
                <el-form-item label="Source">
                  <el-select v-model="editDialog.form.source" style="width: 100%" clearable placeholder="Source">
                    <el-option v-for="(label, val) in ISSUE_SOURCE_MAP" :key="val" :label="label" :value="val" />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="Review">
                  <el-select v-model="editDialog.form.review_status" style="width: 100%" clearable placeholder="Review status">
                    <el-option v-for="(label, val) in REVIEW_STATUS_MAP" :key="val" :label="label" :value="val" />
                  </el-select>
                </el-form-item>
              </el-col>
            </el-row>
          </div>
        </el-form>
        <template #footer>
          <el-button @click="editDialog.visible = false">Cancel</el-button>
          <el-button type="primary" :loading="editDialog.submitting" @click="submitEdit">Save</el-button>
        </template>
      </el-dialog>

      <KnowledgePreviewDialog ref="descDialogRef" />
    </template>

    <div v-else class="id-not-found">
      <el-result icon="error" title="Issue not found" sub-title="This issue doesn't exist or was deleted.">
        <template #extra>
          <el-button type="primary" @click="goBack">Back to Issues</el-button>
        </template>
      </el-result>
    </div>

    <!-- Image Preview Overlay -->
    <Teleport to="body">
      <div v-if="preview.visible" class="id-lightbox" @click="closePreview">
        <div class="id-lightbox__backdrop" />
        <div class="id-lightbox__content">
          <img :src="preview.src" :alt="preview.alt" @click.stop />
          <div class="id-lightbox__info">{{ preview.alt }}</div>
          <el-button class="id-lightbox__close" :icon="Close" circle size="large" @click="closePreview" />
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts" name="issueDetail">
import { computed, onMounted, onUnmounted, reactive, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import {
  Box, Calendar, Connection, Edit, Delete,
  Document, MoreFilled, CopyDocument,
  Switch, User, PriceTag, InfoFilled, FullScreen, Rank, Close, FolderOpened
} from "@element-plus/icons-vue";
import { ElMessage, ElMessageBox } from "element-plus";
import type { FormInstance, FormRules } from "element-plus";
import { useIssueStore } from "@/stores/modules/issue";
import {
  ISSUE_STATUS_MAP, ISSUE_PRIORITY_MAP, ISSUE_TYPE_MAP, ISSUE_SOURCE_MAP, REVIEW_STATUS_MAP,
  ISSUE_STATUS_TAG_MAP, ISSUE_TYPE_TAG_MAP,
  getIssueList, getIssueFilePath
} from "@/api/modules/issueService";
import type { Issue, IssueStatus, IssuePriority, IssueType, IssueSource, ReviewStatus, TagType } from "@/api/modules/issueService";

import { formatRelativeTime } from "@/utils/datetime";
import { readKnowledgeFile, writeKnowledgeFile } from "@/api/modules/knowledgeService";
import { useMarkdown } from "@/hooks/useMarkdown";
import { getModuleList } from "@/api/modules/moduleService";
import { getProjectList } from "@/api/modules/projectService";
import type { Module } from "@/api/modules/moduleService";
import type { Project } from "@/api/modules/projectService";
import { getBugList } from "@/api/modules/bug";
import type { BugDocument } from "@/api/modules/bug";
import { goalRoleMap, allGoalsMap } from "@/views/knowledge/executiver/okrData";

const route = useRoute();
const router = useRouter();
const store = useIssueStore();

const loading = ref(true);
const issue = computed(() => store.currentIssue);
const quickStatus = ref("");
const editFormRef = ref<FormInstance>();
const bodyRef = ref<HTMLElement>();

watch(() => issue.value?.status, s => { quickStatus.value = s || ""; });

// ── Keyboard Shortcuts ──────────────────────────────────────────────
function handleKeydown(e: KeyboardEvent) {
  if (editDialog.visible) {
    if (e.key === "Escape") { editDialog.visible = false; return; }
    return;
  }
  const tag = (e.target as HTMLElement)?.tagName;
  if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
  if (e.key === "e" || e.key === "E") { e.preventDefault(); openEdit(); }
}

// ── Sticky Bar ──────────────────────────────────────────────────────
const showStickyBar = ref(false);
function onScroll() {
  showStickyBar.value = window.scrollY > 300;
}
function scrollToTop() {
  window.scrollTo({ top: 0, behavior: "smooth" });
}

// ── Focus Mode ──────────────────────────────────────────────────────
const focusMode = ref(false);

// ── Inline Edit State ────────────────────────────────────────────────
const editingAssignee = ref(false);
const editingSchedule = ref(false);
const editingLabels = ref(false);
const savingAssignee = ref(false);
const savingSchedule = ref(false);
const savingLabels = ref(false);
const assigneeEdit = ref("");
const scheduleEdit = reactive({ start_date: "", due_date: "", estimate_points: undefined as number | undefined, time_estimate: undefined as number | undefined });
const labelsEdit = ref<string[]>([]);

function startEditAssignee() {
  assigneeEdit.value = issue.value?.assignee || "";
  editingAssignee.value = true;
}
async function saveAssignee() {
  if (!issue.value) return;
  savingAssignee.value = true;
  try {
    await store.editIssue(issue.value.key, { assignee: assigneeEdit.value || undefined } as any);
    ElMessage.success("Assignee updated");
    editingAssignee.value = false;
  } finally { savingAssignee.value = false; }
}

function startEditSchedule() {
  if (!issue.value) return;
  scheduleEdit.start_date = issue.value.start_date || "";
  scheduleEdit.due_date = issue.value.due_date || "";
  scheduleEdit.estimate_points = issue.value.estimate_points;
  scheduleEdit.time_estimate = issue.value.time_estimate;
  editingSchedule.value = true;
}
async function saveSchedule() {
  if (!issue.value) return;
  savingSchedule.value = true;
  try {
    await store.editIssue(issue.value.key, {
      start_date: scheduleEdit.start_date || undefined,
      due_date: scheduleEdit.due_date || undefined,
      estimate_points: scheduleEdit.estimate_points,
      time_estimate: scheduleEdit.time_estimate,
    } as any);
    ElMessage.success("Schedule updated");
    editingSchedule.value = false;
  } finally { savingSchedule.value = false; }
}

function startEditLabels() {
  labelsEdit.value = [...(issue.value?.labels || [])];
  editingLabels.value = true;
}
async function saveLabels() {
  if (!issue.value) return;
  savingLabels.value = true;
  try {
    await store.editIssue(issue.value.key, { labels: labelsEdit.value } as any);
    ElMessage.success("Labels updated");
    editingLabels.value = false;
  } finally { savingLabels.value = false; }
}

// ── Image Preview ───────────────────────────────────────────────────
const preview = reactive({ visible: false, src: "", alt: "" });
function previewImage(src: string) {
  preview.src = src;
  preview.alt = "";
  preview.visible = true;
}
function closePreview() {
  preview.visible = false;
}

// Cross-linking
const linkedModules = ref<Module[]>([]);
const linkedBugs = ref<BugDocument[]>([]);
const projectName = ref("");




const isOverdue = computed(() => {
  const i = issue.value;
  if (!i?.due_date || i.status === "done") return false;
  return i.due_date < new Date().toISOString().slice(0, 10);
});


async function loadLinked() {
  if (!issue.value) return;
  try {
    const [moduleRes, projectRes, bugRes] = await Promise.all([
      getModuleList({ project_key: issue.value.project_key, pageSize: 200 }),
      getProjectList({ pageSize: 500 }),
      getBugList({ issue_key: issue.value.key, pageSize: 100 }),
    ]);
    const modules = (moduleRes.data?.list as Module[]) ?? [];
    const projects = (projectRes.data?.list as Project[]) ?? [];
    linkedModules.value = modules.filter(m => m.issue_keys?.includes(issue.value!.key));
    linkedBugs.value = (bugRes.data?.list as BugDocument[]) ?? [];
    projectName.value = projects.find(p => p.key === issue.value!.project_key)?.name || issue.value!.project_key;
  } catch { /* ignore */ }
}


const rules: FormRules = {
  title: [{ required: true, message: "Title is required", trigger: "blur" }]
};

// ── Description (file-based) ─────────────────────────────────────────
const { render: renderMarkdown } = useMarkdown();
const descContent = ref("");
const descFilePath = computed(() => {
  const i = issue.value;
  if (!i) return "";
  return getIssueFilePath(i);
});
const descDialogRef = ref<{ openFile: (opts: { path: string; title?: string; content: string; onSave: (content: string) => Promise<void> }) => void } | null>(null);

const descHtml = computed(() => renderMarkdown(descContent.value || ""));

async function loadDescFile() {
  try {
    const res = await readKnowledgeFile(descFilePath.value);
    descContent.value = res.content || issue.value?.description || "";
  } catch {
    // File doesn't exist yet — auto-create it with issue description as default content
    const defaultContent = issue.value?.description || `# ${issue.value?.title || ""}\n`;
    try { await writeKnowledgeFile(descFilePath.value, defaultContent); } catch { /* best effort */ }
    descContent.value = defaultContent;
  }
}

function openFileViewer() {
  if (!descContent.value || !descFilePath.value) return;
  descDialogRef.value?.openFile({
    path: descFilePath.value,
    title: issue.value?.title || "",
    content: descContent.value,
    onSave: async (content: string) => {
      await writeKnowledgeFile(descFilePath.value, content, {
        title: issue.value?.title || "",
        type: "issue-description",
        status: issue.value?.status || "",
        project: issue.value?.project_key || "",
        created: (issue.value?.created_at || "").slice(0, 10),
      });
      descContent.value = content;
    }
  });
}

function openDescDialog() {
  descDialogRef.value?.openFile({
    path: descFilePath.value,
    title: issue.value?.title || "",
    content: descContent.value,
    onSave: async (content: string) => {
      await writeKnowledgeFile(descFilePath.value, content, {
        title: issue.value?.title || "",
        type: "issue-description",
        status: issue.value?.status || "",
        project: issue.value?.project_key || "",
        created: (issue.value?.created_at || "").slice(0, 10),
      });
      descContent.value = content;
    }
  });
}

const timePct = computed(() => {
  if (!issue.value?.time_estimate || !issue.value.time_estimate) return 0;
  return Math.round(((issue.value.time_spent || 0) / issue.value.time_estimate) * 100);
});

const editDialog = reactive({
  visible: false,
  submitting: false,
  form: {
    title: "",
    description: "",
    status: "todo" as IssueStatus,
    priority: "medium" as IssuePriority,
    issue_type: "task" as IssueType,
    assignee: "",
    labels: [] as string[],
    start_date: "",
    due_date: "",
    source: "" as IssueSource | "",
    review_status: "" as ReviewStatus | "",
    estimate_points: undefined as number | undefined,
    time_estimate: undefined as number | undefined
  }
});

function openEdit() {
  if (!issue.value) return;
  editDialog.form = {
    title: issue.value.title,
    description: issue.value.description || "",
    status: issue.value.status,
    priority: issue.value.priority,
    issue_type: issue.value.issue_type,
    assignee: issue.value.assignee || "",
    labels: [...(issue.value.labels || [])],
    start_date: issue.value.start_date || "",
    due_date: issue.value.due_date || "",
    source: issue.value.source || "",
    review_status: issue.value.review_status || "",
    estimate_points: issue.value.estimate_points,
    time_estimate: issue.value.time_estimate
  };
  editDialog.visible = true;
}

function mapReqStatusReverse(s: string): string {
  const m: Record<string, string> = {
    "done": "已完成",
    "in_progress": "进行中",
    "cancelled": "已取消",
    "in_review": "待评审",
    "backlog": "待排期",
    "todo": "待开始"
  };
  return m[s] || "待开始";
}
function mapReqPriorityReverse(p: string): string {
  const m: Record<string, string> = {
    "urgent": "紧急",
    "high": "高",
    "medium": "中",
    "low": "低"
  };
  return m[p] || "中";
}

async function submitEdit() {
  if (!issue.value) return;
  try {
    await editFormRef.value?.validate();
  } catch {
    return;
  }
  editDialog.submitting = true;
  try {
    await store.editIssue(issue.value.key, {
      title: editDialog.form.title,
      description: editDialog.form.description,
      status: editDialog.form.status,
      priority: editDialog.form.priority,
      issue_type: editDialog.form.issue_type,
      assignee: editDialog.form.assignee,
      labels: editDialog.form.labels,
      start_date: editDialog.form.start_date,
      due_date: editDialog.form.due_date,
      source: editDialog.form.source || undefined,
      review_status: editDialog.form.review_status || undefined,
      estimate_points: editDialog.form.estimate_points,
      time_estimate: editDialog.form.time_estimate
    } as any);
    ElMessage.success("Issue updated");
    // Sync knowledge file frontmatter for requirement-type issues
    if (issue.value.kb_file_path) {
      try {
        const res = await readKnowledgeFile(issue.value.kb_file_path);
        const updatedMeta = { ...res.meta };
        if (editDialog.form.status) updatedMeta.status = mapReqStatusReverse(editDialog.form.status);
        if (editDialog.form.priority) updatedMeta.priority = mapReqPriorityReverse(editDialog.form.priority);
        if (editDialog.form.assignee !== undefined) updatedMeta.owner = editDialog.form.assignee;
        await writeKnowledgeFile(issue.value.kb_file_path, res.content, updatedMeta);
      } catch { /* best-effort */ }
    }
    editDialog.visible = false;
  } catch (e) {
    ElMessage.error((e as Error).message || "Failed to update issue");
  } finally {
    editDialog.submitting = false;
  }
}

async function changeStatus(newStatus: string) {
  if (!issue.value) return;
  await store.editIssue(issue.value.key, { status: newStatus as IssueStatus });
  ElMessage.success(`Status changed to ${ISSUE_STATUS_MAP[newStatus as IssueStatus]}`);
}

async function handleDelete() {
  if (!issue.value) return;
  try {
    await ElMessageBox.confirm(
      `Delete issue "${issue.value.title}"?`,
      "Delete Issue",
      { confirmButtonText: "Delete", cancelButtonText: "Cancel", type: "error" }
    );
    await store.removeIssue(issue.value.key, issue.value.project_key);
    ElMessage.success("Issue deleted");
    router.push("/issue");
  } catch {
    // cancelled
  }
}

async function cloneIssue() {
  if (!issue.value) return;
  const newKey = `ISS-${Date.now().toString(36).toUpperCase()}`;
  await store.addIssue({
    key: newKey,
    project_key: issue.value.project_key,
    sequence_id: Date.now(),
    title: `[Clone] ${issue.value.title}`,
    description: issue.value.description,
    status: "todo",
    priority: issue.value.priority,
    issue_type: issue.value.issue_type,
    labels: [...(issue.value.labels || [])],
    assignee: issue.value.assignee,
    estimate_points: issue.value.estimate_points
  });
  ElMessage.success("Issue cloned");
  router.push(`/issue/${newKey}`);
}

async function openMove() {
  if (!issue.value) return;
  ElMessageBox.prompt("Enter target project key", "Move Issue", {
    confirmButtonText: "Move",
    inputPlaceholder: "Project key"
  }).then(async ({ value }) => {
    if (!value) return;
    await store.editIssue(issue.value!.key, { project_key: value });
    ElMessage.success(`Issue moved to "${value}"`);
    router.push(`/project/${value}`);
  }).catch(() => {});
}

function goBack() {
  if (issue.value?.project_key) {
    router.push(`/project/${issue.value.project_key}`);
  } else {
    router.push("/issue");
  }
}

function goLabel(name: string) {
  router.push(`/issue?label=${encodeURIComponent(name)}`);
}

function goGoal(goalId: string) {
  const role = goalRoleMap[goalId];
  if (role) router.push(`/executiver/okr/${role}?goal=${goalId}`);
}

function goalLabel(goalId: string): string {
  return allGoalsMap[goalId]?.title || goalId;
}

function statusLabel(s: IssueStatus) { return ISSUE_STATUS_MAP[s] || s; }

function statusTagType(status: IssueStatus): TagType {
  return ISSUE_STATUS_TAG_MAP[status] || "info";
}

onMounted(async () => {
  const key = route.params.key as string;
  if (key) {
    await store.fetchIssue(key);
  }
  loading.value = false;
  await Promise.all([loadLinked(), loadDescFile()]);
  window.addEventListener("scroll", onScroll, { passive: true });
});

onUnmounted(() => {
  window.removeEventListener("scroll", onScroll);
});
</script>

<style scoped lang="scss">
.issue-detail {
  padding: 24px;
  min-height: calc(100vh - 95px);
  background: var(--el-bg-color-page);
  outline: none;
}

// ── Skeleton Loading ───────────────────────────────────────────────
.id-skeleton {
  animation: id-fade-in 0.3s ease;
}
.id-skel-header {
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 20px;
}
.id-skel-line {
  height: 14px;
  border-radius: 4px;
  background: linear-gradient(90deg, var(--el-fill-color-light) 25%, var(--el-fill-color) 50%, var(--el-fill-color-light) 75%);
  background-size: 200% 100%;
  animation: id-shimmer 1.5s infinite;
  margin-bottom: 10px;
  &--short { width: 30%; }
  &--med { width: 55%; }
  &--long { width: 80%; }
}
.id-skel-tag {
  display: inline-block;
  width: 60px;
  height: 22px;
  border-radius: 4px;
  background: linear-gradient(90deg, var(--el-fill-color-light) 25%, var(--el-fill-color) 50%, var(--el-fill-color-light) 75%);
  background-size: 200% 100%;
  animation: id-shimmer 1.5s infinite;
  margin-right: 8px;
}
.id-skel-row {
  display: flex;
  gap: 8px;
}
.id-skel-body {
  display: flex;
  gap: 20px;
}
.id-skel-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.id-skel-sidebar {
  width: 280px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.id-skel-card {
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 10px;
  padding: 16px;
}
@keyframes id-shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}
@keyframes id-fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}

// ── Header ──────────────────────────────────────────────────────────
.id-header {
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 12px;
  padding: 20px 24px;
  margin-bottom: 20px;
  border-left: 4px solid var(--el-color-primary);
}
.id-header__top {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.id-header__actions {
  display: flex;
  gap: 8px;
  align-items: center;
  flex-shrink: 0;
}
.id-header__title {
  margin: 0;
  font-size: 22px;
  font-weight: 700;
  line-height: 1.3;
  color: var(--el-text-color-primary);
}

// ── Body Layout ─────────────────────────────────────────────────────
.id-body {
  display: flex;
  gap: 20px;
  align-items: flex-start;
}
.id-main {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

// ── Section Cards ───────────────────────────────────────────────────
.id-card {
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 10px;
  overflow: hidden;
  &--parent {
    border-left: 3px solid var(--el-color-primary);
  }
}
.id-card__head {
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
.id-card__icon {
  font-size: 16px;
  color: var(--el-color-primary);
}
.id-card__head-badge {
  margin-left: 4px;
}
.id-card__head-extra {
  margin-left: auto;
  font-size: 12px;
  font-weight: 400;
  color: var(--el-text-color-secondary);
}
.id-card__head-right {
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 2px;
}
.id-desc-path {
  margin-left: 8px;
  padding: 1px 7px;
  font-size: 11px;
  color: var(--el-text-color-secondary);
  background: var(--el-fill-color);
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 4px;
  max-width: 280px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  cursor: pointer;
  transition: color 0.15s, border-color 0.15s;
  &:hover {
    color: var(--el-color-primary);
    border-color: var(--el-color-primary-light-5);
  }
}
.id-card__head-tabs {
  margin-left: auto;
  display: flex;
  gap: 2px;
}
.id-tab {
  border: none;
  background: transparent;
  padding: 4px 10px;
  font-size: 12px;
  color: var(--el-text-color-secondary);
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.15s;
  &:hover { background: var(--el-fill-color); color: var(--el-text-color-primary); }
  &--active {
    background: var(--el-color-primary);
    color: #fff;
    &:hover { background: var(--el-color-primary); color: #fff; }
  }
}
.id-card__body {
  padding: 16px;
  :deep(.markdown-body) {
    font-size: 14px;
  }
  &--clickable {
    cursor: pointer;
    transition: background 0.15s;
    &:hover {
      background: var(--el-fill-color-lighter);
    }
  }
}

// ── Description Preview ──────────────────────────────────────────────
.id-desc-preview {
  :deep(.markdown-body) {
    font-size: 14px;
  }
}

// ── Empty States ────────────────────────────────────────────────────
.id-empty {
  text-align: center;
  padding: 24px 16px;
  &--sm { padding: 12px 8px; }
}
.id-empty__icon {
  font-size: 28px;
  color: var(--el-text-color-placeholder);
  margin-bottom: 8px;
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

// ── Sub-tasks ───────────────────────────────────────────────────────
// ── Sidebar ─────────────────────────────────────────────────────────
.id-sidebar {
  width: 280px;
  flex-shrink: 0;
  position: sticky;
  top: 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.id-sb-group {
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 10px;
  overflow: hidden;
}
.id-sb-group__title {
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 10px 14px;
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.3px;
  color: var(--el-text-color-secondary);
  background: var(--el-fill-color-lighter);
  border-bottom: 1px solid var(--el-border-color-lighter);
  .el-icon { font-size: 13px; }
}
.id-sb-edit {
  margin-left: auto;
  display: flex;
  align-items: center;
  border: none;
  background: transparent;
  color: var(--el-text-color-placeholder);
  cursor: pointer;
  padding: 2px;
  border-radius: 4px;
  transition: all 0.12s;
  &:hover { background: var(--el-fill-color); color: var(--el-color-primary); }
}
.id-sb-edit-row {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 0;
  & + & { border-top: 1px solid var(--el-border-color-lighter); }
}
.id-sb-edit-row__label {
  font-size: 11px;
  color: var(--el-text-color-secondary);
  flex-shrink: 0;
  width: 42px;
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
  justify-content: space-between;
  align-items: center;
  padding: 6px 0;
  font-size: 13px;
  & + & { border-top: 1px solid var(--el-border-color-lighter); }
}
.id-sb-row__label {
  color: var(--el-text-color-secondary);
  font-weight: 500;
  flex-shrink: 0;
}
.id-sb-row__value {
  text-align: right;
  &--overdue {
    color: var(--el-color-danger);
    font-weight: 600;
  }
  &--muted {
    font-size: 12px;
    color: var(--el-text-color-placeholder);
  }
  &--empty {
    color: var(--el-text-color-placeholder);
    font-style: italic;
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
  &:hover { transform: scale(1.05); }
}
.id-sb-dep {
  margin-bottom: 8px;
  &:last-child { margin-bottom: 0; }
}
.id-sb-dep__label {
  font-size: 11px;
  color: var(--el-text-color-placeholder);
  display: block;
  margin-bottom: 4px;
}
.id-sb-dep__tags {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  .el-tag { cursor: pointer; }
}

// ── Sticky Bottom Bar ───────────────────────────────────────────────
.id-sticky-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 100;
  background: var(--el-bg-color);
  border-top: 1px solid var(--el-border-color);
  box-shadow: 0 -4px 20px rgba(0,0,0,0.08);
  padding: 10px 24px;
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
  align-items: center;
  gap: 10px;
  min-width: 0;
}
.id-sticky-bar__key {
  font-family: monospace;
  font-size: 12px;
  color: var(--el-text-color-secondary);
  background: var(--el-fill-color-light);
  padding: 2px 8px;
  border-radius: 4px;
  flex-shrink: 0;
}
.id-sticky-bar__file {
  font-family: monospace;
  font-size: 11px;
  color: var(--el-text-color-secondary);
  background: var(--el-fill-color);
  border: 1px solid var(--el-border-color-lighter);
  padding: 2px 8px;
  border-radius: 4px;
  flex-shrink: 0;
  max-width: 240px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  cursor: pointer;
  transition: color 0.15s, border-color 0.15s;
  &:hover {
    color: var(--el-color-primary);
    border-color: var(--el-color-primary-light-5);
  }
}
.id-sticky-bar__title {
  font-size: 14px;
  font-weight: 600;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.id-sticky-bar__actions {
  display: flex;
  gap: 8px;
  align-items: center;
  flex-shrink: 0;
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
  font-size: 13px;
  font-weight: 700;
  color: var(--el-text-color-secondary);
  text-transform: uppercase;
  letter-spacing: 0.3px;
  padding: 0 0 8px 100px;
  border-bottom: 1px solid var(--el-border-color-lighter);
  margin-bottom: 12px;
}

// ── Focus Mode ──────────────────────────────────────────────────────
.id-sidebar--hidden {
  display: none;
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
  background: rgba(0,0,0,0.85);
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
    box-shadow: 0 8px 40px rgba(0,0,0,0.3);
  }
}
.id-lightbox__info {
  text-align: center;
  color: rgba(255,255,255,0.7);
  font-size: 12px;
  margin-top: 8px;
}
.id-lightbox__close {
  position: absolute;
  top: -20px;
  right: -20px;
  color: #fff;
  background: rgba(255,255,255,0.15) !important;
  &:hover { background: rgba(255,255,255,0.25) !important; }
}

// ── Code Block Copy ──────────────────────────────────────────────────
:deep(.id-code-copy) {
  position: absolute;
  top: 8px;
  right: 8px;
  padding: 4px 10px;
  font-size: 11px;
  color: #fff;
  background: rgba(255,255,255,0.12);
  border: 1px solid rgba(255,255,255,0.2);
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.12s;
  opacity: 0;
  &:hover { background: rgba(255,255,255,0.25); }
}
:deep(.markdown-body pre:hover .id-code-copy) {
  opacity: 1;
}

// ── Print Styles ────────────────────────────────────────────────────
@media print {
  .issue-detail {
    padding: 0;
    height: auto;
    overflow: visible;
    background: #fff;
  }
    .id-header__actions { display: none; }
    .id-sidebar { display: none; }
  .id-sticky-bar { display: none; }
  .id-card__tabs { display: none; }
  .id-upload { display: none; }
  .id-header {
    border: none;
    border-left: none;
    padding: 0 0 16px;
    margin-bottom: 16px;
    border-bottom: 2px solid #000;
    border-radius: 0;
  }
  .id-header__title { font-size: 18px; }
  .id-card {
    border: none;
    border-radius: 0;
    border-bottom: 1px solid #eee;
    break-inside: avoid;
    margin-bottom: 12px;
  }
  .id-card__head { background: transparent; border-bottom: 1px solid #eee; }
  .id-card__body { padding: 12px 0; }
  .id-body { display: block; }
  .id-main { max-width: 100%; }
  kbd { border: 1px solid #999; }
  code { background: #f5f5f5 !important; }
}
</style>