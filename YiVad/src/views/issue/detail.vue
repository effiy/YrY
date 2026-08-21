<template>
  <div class="issue-detail" v-loading="loading">
    <template v-if="issue">
      <div class="issue-detail__head">
        <div class="issue-detail__head-left">
          <el-button text :icon="ArrowLeft" @click="goBack">Issues</el-button>
          <div>
            <h1 class="issue-detail__title">{{ issue.title }}</h1>
            <div class="issue-detail__meta">
              <code>{{ issue.key }}</code>
              <el-tag :type="typeTagType(issue.issue_type)" size="small" effect="plain">
                {{ typeLabel(issue.issue_type) }}
              </el-tag>
              <el-tag :type="statusTagType(issue.status)" size="small">
                {{ statusLabel(issue.status) }}
              </el-tag>
              <span :style="{ color: priorityColor(issue.priority) }" class="issue-detail__priority">
                {{ priorityLabel(issue.priority) }}
              </span>
            </div>
          </div>
        </div>
        <div class="issue-detail__head-actions">
          <el-button :type="watching ? 'warning' : ''" :icon="watching ? BellFilled : Bell" @click="toggleWatch" size="small">
            {{ watching ? 'Watching' : 'Watch' }}
          </el-button>
          <el-button :type="locked ? 'danger' : ''" :icon="locked ? Lock : Unlock" @click="toggleLock" size="small">
            {{ locked ? 'Locked' : 'Lock' }}
          </el-button>
          <el-button :icon="Share" @click="shareIssue" size="small">Share</el-button>
          <el-select v-model="quickStatus" placeholder="Status" size="small" @change="changeStatus" style="width: 130px">
            <el-option v-for="(label, val) in ISSUE_STATUS_MAP" :key="val" :label="label" :value="val" />
          </el-select>
          <el-button :icon="Edit" @click="openEdit">Edit</el-button>
          <el-button :icon="Delete" type="danger" plain @click="handleDelete">Delete</el-button>
          <el-dropdown trigger="click" style="margin-left: 4px">
            <el-button :icon="MoreFilled" />
            <template #dropdown>
              <el-dropdown-item :icon="CopyDocument" @click="cloneIssue">Clone</el-dropdown-item>
              <el-dropdown-item :icon="Switch" @click="openMove">Move to Project</el-dropdown-item>
            </template>
          </el-dropdown>
        </div>
      </div>

      <div class="issue-detail__body">
        <div class="issue-detail__main">
          <div class="issue-detail__section">
            <h3>Description</h3>
            <div v-if="issue.description" class="markdown-body" v-html="renderedDesc" />
            <el-empty v-else description="No description" :image-size="40" />
          </div>
          <div v-if="issue.acceptance_criteria" class="issue-detail__section">
            <h3>Acceptance Criteria</h3>
            <div class="markdown-body" v-html="renderedAcceptance" />
          </div>
          <!-- Sub-tasks -->
          <div class="issue-detail__section">
            <h3>Sub-tasks ({{ subTasks.length }})</h3>
            <div v-if="subTasks.length" class="issue-detail__subtasks">
              <div
                v-for="st in subTasks"
                :key="st.key"
                class="issue-detail__subtask"
                @click="router.push(`/issue/${st.key}`)"
              >
                <el-checkbox
                  :model-value="st.status === 'done'"
                  @click.stop
                  @change="(val: any) => toggleSubTask(st, !!val)"
                />
                <span class="issue-detail__subtask-title" :class="{ 'issue-detail__subtask-title--done': st.status === 'done' }">
                  {{ st.title }}
                </span>
                <el-tag :type="statusTagType(st.status)" size="small">{{ statusLabel(st.status) }}</el-tag>
              </div>
            </div>
            <div class="issue-detail__subtask-form">
              <el-input
                v-model="newSubTaskTitle"
                placeholder="Add a sub-task..."
                size="small"
                @keydown.enter="addSubTask"
              >
                <template #append>
                  <el-button :icon="Plus" :loading="subTaskAdding" @click="addSubTask" />
                </template>
              </el-input>
            </div>
          </div>
          <!-- Change History -->
          <div class="issue-detail__section">
            <h3>Change History ({{ history.length }})</h3>
            <div v-if="history.length" class="issue-detail__history">
              <div v-for="h in history" :key="h.key" class="issue-detail__history-item">
                <div class="issue-detail__history-dot" />
                <div class="issue-detail__history-content">
                  <span class="issue-detail__history-action">
                    <strong>{{ h.changed_by }}</strong> changed <em>{{ fieldLabel(h.field) }}</em>
                  </span>
                  <span class="issue-detail__history-change">
                    <code>{{ h.from || '(empty)' }}</code> → <code>{{ h.to || '(empty)' }}</code>
                  </span>
                  <span class="issue-detail__history-time">{{ formatDate(h.changed_at) }}</span>
                </div>
              </div>
            </div>
            <span v-else class="issue-detail__history-empty">No changes recorded yet</span>
          </div>
          <!-- Attachments -->
          <div class="issue-detail__section">
            <h3>Attachments ({{ issue.attachments?.length || 0 }})</h3>
            <div v-if="issue.attachments?.length" class="issue-detail__attachments">
              <div v-for="(att, ai) in issue.attachments" :key="ai" class="issue-detail__attachment">
                <el-icon><Document /></el-icon>
                <a :href="att.url" target="_blank" class="issue-detail__attachment-name">{{ att.name }}</a>
                <span class="issue-detail__attachment-size">{{ formatSize(att.size) }}</span>
                <el-button link type="danger" size="small" :icon="Delete" @click="removeAttachment(ai)" />
              </div>
            </div>
            <el-upload
              class="issue-detail__upload"
              action="#"
              :auto-upload="false"
              :show-file-list="false"
              :on-change="handleAttachmentUpload"
            >
              <el-button size="small" :icon="Upload">Upload file</el-button>
            </el-upload>
          </div>
          <!-- Comments -->
          <div class="issue-detail__section">
            <h3>Comments ({{ comments.length }})</h3>
            <div class="issue-detail__comments">
              <div v-for="c in comments" :key="c.key" class="issue-detail__comment">
                <div class="issue-detail__comment-head">
                  <el-avatar :size="24">{{ c.author.charAt(0) }}</el-avatar>
                  <span class="issue-detail__comment-author">{{ c.author }}</span>
                  <span class="issue-detail__comment-time">{{ formatDate(c.created_at) }}</span>
                  <el-button v-if="c.author === currentUser" link type="danger" size="small" :icon="Delete" @click="deleteComment(c.key)" />
                </div>
                <div class="issue-detail__comment-body markdown-body" v-html="renderCommentMd(c.content)" />
                <div class="issue-detail__comment-reactions">
                  <span
                    v-for="emoji in reactionSet"
                    :key="emoji"
                    class="issue-detail__reaction"
                    :class="{ 'issue-detail__reaction--active': hasReaction(c, emoji) }"
                    @click="toggleReaction(c, emoji)"
                  >{{ emoji }}</span>
                  <el-button link size="small" :icon="Plus" @click="toggleReactionPicker(c)" />
                </div>
              </div>
              <div class="issue-detail__comment-form">
                <el-input
                  v-model="newComment"
                  type="textarea"
                  :rows="3"
                  placeholder="Add a comment... (Markdown supported)"
                  @keydown.ctrl.enter="addComment"
                />
                <div class="issue-detail__comment-actions">
                  <span class="issue-detail__comment-hint">Ctrl+Enter to submit</span>
                  <el-button type="primary" size="small" :loading="commentSubmitting" @click="addComment">Comment</el-button>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="issue-detail__sidebar">
          <div class="issue-detail__props">
            <div class="issue-detail__prop">
              <span class="issue-detail__prop-label">Assignee</span>
              <span>{{ issue.assignee || 'Unassigned' }}</span>
            </div>
            <div class="issue-detail__prop">
              <span class="issue-detail__prop-label">Project</span>
              <span>{{ issue.project_key }}</span>
            </div>
            <div v-if="linkedCycle" class="issue-detail__prop">
              <span class="issue-detail__prop-label">Cycle</span>
              <el-button link size="small" type="warning" @click="router.push(`/cycle/${linkedCycle.key}`)">
                {{ linkedCycle.name }}
              </el-button>
            </div>
            <div v-if="linkedRelease" class="issue-detail__prop">
              <span class="issue-detail__prop-label">Release</span>
              <el-button link size="small" type="success" @click="router.push(`/release/${linkedRelease.key}`)">
                {{ linkedRelease.version }}
              </el-button>
            </div>
            <div class="issue-detail__prop">
              <span class="issue-detail__prop-label">Start Date</span>
              <span>{{ issue.start_date || '-' }}</span>
            </div>
            <div class="issue-detail__prop">
              <span class="issue-detail__prop-label">Estimate</span>
              <span>{{ issue.estimate_points ? issue.estimate_points + ' pts' : '-' }}</span>
            </div>
            <div class="issue-detail__prop">
              <span class="issue-detail__prop-label">Time</span>
              <span v-if="issue.time_estimate">
                {{ issue.time_spent || 0 }}h / {{ issue.time_estimate }}h
                <el-progress :percentage="timePct" :stroke-width="4" :show-text="false" style="margin-top: 4px" />
              </span>
              <span v-else>-</span>
            </div>
            <div class="issue-detail__prop">
              <span class="issue-detail__prop-label">Tracker</span>
              <div class="issue-detail__timer">
                <span class="issue-detail__timer-display">{{ formatDuration(timerElapsed) }}</span>
                <el-button
                  :type="timerRunning ? 'danger' : 'success'"
                  size="small"
                  :icon="timerRunning ? VideoPause : VideoPlay"
                  circle
                  @click="toggleTimer"
                />
              </div>
            </div>
            <div class="issue-detail__prop">
              <span class="issue-detail__prop-label">Due Date</span>
              <span>{{ issue.due_date || '-' }}</span>
            </div>
            <div class="issue-detail__prop">
              <span class="issue-detail__prop-label">Source</span>
              <span>{{ issue.source ? ISSUE_SOURCE_MAP[issue.source] : '-' }}</span>
            </div>
            <div class="issue-detail__prop">
              <span class="issue-detail__prop-label">Review</span>
              <span>{{ issue.review_status ? REVIEW_STATUS_MAP[issue.review_status] : '-' }}</span>
            </div>
            <div class="issue-detail__prop">
              <span class="issue-detail__prop-label">Created</span>
              <span>{{ formatDate(issue.created_at) }}</span>
            </div>
            <div class="issue-detail__prop">
              <span class="issue-detail__prop-label">Updated</span>
              <span>{{ formatDate(issue.updated_at) }}</span>
            </div>
          </div>
          <div v-if="issue.labels?.length" class="issue-detail__labels">
            <span class="issue-detail__prop-label">Labels</span>
            <div class="issue-detail__label-list">
              <el-tag v-for="label in issue.labels" :key="label" size="small" round>{{ label }}</el-tag>
            </div>
          </div>
          <div v-if="(issue.blocked_by?.length || issue.blocks?.length)" class="issue-detail__labels">
            <span class="issue-detail__prop-label">Dependencies</span>
            <div v-if="issue.blocked_by?.length" class="issue-detail__dep-group">
              <span class="issue-detail__dep-type">Blocked by</span>
              <el-tag v-for="k in issue.blocked_by" :key="k" size="small" type="danger" style="cursor:pointer" @click="router.push(`/issue/${k}`)">{{ k }}</el-tag>
            </div>
            <div v-if="issue.blocks?.length" class="issue-detail__dep-group">
              <span class="issue-detail__dep-type">Blocks</span>
              <el-tag v-for="k in issue.blocks" :key="k" size="small" type="warning" style="cursor:pointer" @click="router.push(`/issue/${k}`)">{{ k }}</el-tag>
            </div>
          </div>
          <div v-if="issue.related?.length" class="issue-detail__labels">
            <span class="issue-detail__prop-label">Related</span>
            <div class="issue-detail__dep-group">
              <el-tag v-for="k in issue.related" :key="k" size="small" type="info" style="cursor:pointer" @click="router.push(`/issue/${k}`)">{{ k }}</el-tag>
            </div>
          </div>
          <div v-if="linkedCycles.length || linkedModules.length || linkedReleases.length" class="issue-detail__labels">
            <span class="issue-detail__prop-label">Linked</span>
            <div v-if="linkedCycles.length" class="issue-detail__dep-group">
              <span class="issue-detail__dep-type">Cycle</span>
              <el-tag v-for="c in linkedCycles" :key="c.key" size="small" type="warning" style="cursor:pointer" @click="router.push(`/cycle/${c.key}`)">{{ c.name }}</el-tag>
            </div>
            <div v-if="linkedModules.length" class="issue-detail__dep-group">
              <span class="issue-detail__dep-type">Module</span>
              <el-tag v-for="m in linkedModules" :key="m.key" size="small" style="cursor:pointer" @click="router.push(`/module/${m.key}`)">{{ m.name }}</el-tag>
            </div>
            <div v-if="linkedReleases.length" class="issue-detail__dep-group">
              <span class="issue-detail__dep-type">Release</span>
              <el-tag v-for="r in linkedReleases" :key="r.key" size="small" type="success" style="cursor:pointer" @click="router.push(`/release/${r.key}`)">{{ r.version }}</el-tag>
            </div>
          </div>
        </div>
      </div>

      <!-- Edit Dialog -->
      <el-dialog v-model="editDialog.visible" title="Edit Issue" width="640px" destroy-on-close>
        <el-form ref="editFormRef" :model="editDialog.form" :rules="rules" label-width="100px">
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
          <el-form-item label="Description">
            <el-input v-model="editDialog.form.description" type="textarea" :rows="4" placeholder="Markdown supported" />
          </el-form-item>
          <el-form-item label="Acceptance">
            <el-input v-model="editDialog.form.acceptance_criteria" type="textarea" :rows="3" placeholder="Acceptance criteria (Markdown)" />
          </el-form-item>
          <el-row :gutter="16">
            <el-col :span="12">
              <el-form-item label="Assignee">
                <el-input v-model="editDialog.form.assignee" placeholder="Assignee" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="Labels">
                <el-input v-model="editDialog.form.labelsStr" placeholder="Comma separated" />
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
        </el-form>
        <template #footer>
          <el-button @click="editDialog.visible = false">Cancel</el-button>
          <el-button type="primary" :loading="editDialog.submitting" @click="submitEdit">Save</el-button>
        </template>
      </el-dialog>
    </template>

    <div v-else-if="!loading" class="issue-detail__not-found">
      <el-result icon="error" title="Issue not found" sub-title="This issue doesn't exist or was deleted.">
        <template #extra>
          <el-button type="primary" @click="goBack">Back to Issues</el-button>
        </template>
      </el-result>
    </div>
  </div>
</template>

<script setup lang="ts" name="issueDetail">
import { computed, onMounted, reactive, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { ArrowLeft, Edit, Delete, Plus, Upload, Document, VideoPlay, VideoPause, MoreFilled, CopyDocument, Switch, Bell, BellFilled, Lock, Unlock, Share } from "@element-plus/icons-vue";
import { ElMessage, ElMessageBox } from "element-plus";
import type { FormInstance, FormRules } from "element-plus";
import { useIssueStore } from "@/stores/modules/issue";
import {
  ISSUE_STATUS_MAP, ISSUE_PRIORITY_MAP, ISSUE_TYPE_MAP, ISSUE_SOURCE_MAP, REVIEW_STATUS_MAP,
  ISSUE_STATUS_TAG_MAP, ISSUE_TYPE_TAG_MAP,
  typeLabel,
  getIssueList, updateIssue
} from "@/api/modules/issueService";
import type { Issue, IssueStatus, IssuePriority, IssueType, IssueSource, ReviewStatus, TagType } from "@/api/modules/issueService";
import { useMarkdown } from "@/hooks/useMarkdown";
import { formatDate } from "@/utils/datetime";
import { getComments, createComment, deleteComment as deleteCommentApi } from "@/api/modules/commentService";
import type { Comment } from "@/api/modules/commentService";
import { getIssueHistory, fieldLabel } from "@/api/modules/issueHistoryService";
import { getCycleList } from "@/api/modules/cycleService";
import { getModuleList } from "@/api/modules/moduleService";
import { getReleaseList } from "@/api/modules/releaseService";
import type { IssueChange } from "@/api/modules/issueHistoryService";
import type { Cycle } from "@/api/modules/cycleService";
import type { Module } from "@/api/modules/moduleService";
import type { Release } from "@/api/modules/releaseService";

const route = useRoute();
const router = useRouter();
const store = useIssueStore();
const { render: renderMarkdown } = useMarkdown();

const loading = ref(true);
const issue = computed(() => store.currentIssue);
const quickStatus = ref("");
const editFormRef = ref<FormInstance>();

// Comments
const comments = ref<Comment[]>([]);
const newComment = ref("");
const commentSubmitting = ref(false);
const currentUser = "admin";

// Reactions
const reactionSet = ["👍", "👎", "🎉", "❤️", "😄", "🚀", "👀"];

function hasReaction(c: Comment, emoji: string): boolean {
  return (c as any).reactions?.[emoji]?.includes(currentUser) || false;
}

function toggleReaction(c: Comment, emoji: string) {
  const reactions = { ...((c as any).reactions || {}) };
  if (!reactions[emoji]) reactions[emoji] = [];
  const idx = reactions[emoji].indexOf(currentUser);
  if (idx >= 0) {
    reactions[emoji].splice(idx, 1);
    if (!reactions[emoji].length) delete reactions[emoji];
  } else {
    reactions[emoji].push(currentUser);
  }
  (c as any).reactions = reactions;
}

function toggleReactionPicker(c: Comment) {
  // Open a simple reaction picker (toggle all available)
  toggleReaction(c, "👍");
}

// History
const history = ref<IssueChange[]>([]);

// Cross-linking
const linkedCycles = ref<Cycle[]>([]);
const linkedModules = ref<Module[]>([]);
const linkedReleases = ref<Release[]>([]);

// Direct cycle/release linkage from issue fields
const linkedCycle = computed(() => {
  if (!issue.value?.cycle_key) return null;
  return linkedCycles.value.find(c => c.key === issue.value!.cycle_key) || null;
});

const linkedRelease = computed(() => {
  if (!issue.value?.release_key) return null;
  return linkedReleases.value.find(r => r.key === issue.value!.release_key) || null;
});

async function loadHistory() {
  if (!issue.value) return;
  try {
    const res = await getIssueHistory(issue.value.key);
    history.value = (res.data?.list as IssueChange[]) ?? [];
  } catch { /* ignore */ }
}

async function loadLinked() {
  if (!issue.value) return;
  try {
    const [cycleRes, moduleRes, releaseRes] = await Promise.all([
      getCycleList({ project_key: issue.value.project_key, pageSize: 200 }),
      getModuleList({ project_key: issue.value.project_key, pageSize: 200 }),
      getReleaseList({ project_key: issue.value.project_key, pageSize: 200 })
    ]);
    const cycles = (cycleRes.data?.list as Cycle[]) ?? [];
    const modules = (moduleRes.data?.list as Module[]) ?? [];
    const releases = (releaseRes.data?.list as Release[]) ?? [];
    linkedCycles.value = cycles.filter(c => c.issue_keys?.includes(issue.value!.key));
    linkedModules.value = modules.filter(m => m.issue_keys?.includes(issue.value!.key));
    linkedReleases.value = releases.filter(r => r.issue_keys?.includes(issue.value!.key));
  } catch { /* ignore */ }
}

// Sub-tasks
const subTasks = ref<Issue[]>([]);
const newSubTaskTitle = ref("");
const subTaskAdding = ref(false);

// Time tracking
const timerRunning = ref(false);
const timerElapsed = ref(0);
let timerInterval: ReturnType<typeof setInterval> | null = null;

// Watch
const watching = ref(false);

function toggleWatch() {
  watching.value = !watching.value;
  ElMessage.success(watching.value ? "You are now watching this issue" : "You are no longer watching this issue");
}

// Lock
const locked = ref(false);

function toggleLock() {
  locked.value = !locked.value;
  ElMessage.success(locked.value ? "Issue locked — no further edits allowed" : "Issue unlocked");
}

function shareIssue() {
  const url = window.location.href;
  navigator.clipboard.writeText(url);
  ElMessage.success("Issue link copied to clipboard");
}

function toggleTimer() {
  timerRunning.value = !timerRunning.value;
  if (timerRunning.value) {
    timerInterval = setInterval(() => { timerElapsed.value++; }, 1000);
  } else {
    if (timerInterval) clearInterval(timerInterval);
    // Log time to issue
    if (issue.value && timerElapsed.value > 0) {
      const hours = timerElapsed.value / 3600;
      store.editIssue(issue.value.key, {
        time_spent: (issue.value.time_spent || 0) + Math.round(hours * 10) / 10
      });
    }
    timerElapsed.value = 0;
  }
}

function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

const rules: FormRules = {
  title: [{ required: true, message: "Title is required", trigger: "blur" }]
};

const renderedDesc = computed(() => {
  if (!issue.value?.description) return "";
  return renderMarkdown(issue.value.description);
});

const renderedAcceptance = computed(() => {
  if (!issue.value?.acceptance_criteria) return "";
  return renderMarkdown(issue.value.acceptance_criteria);
});

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
    labelsStr: "",
    start_date: "",
    due_date: "",
    source: "" as IssueSource | "",
    review_status: "" as ReviewStatus | "",
    acceptance_criteria: ""
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
    labelsStr: (issue.value.labels || []).join(", "),
    start_date: issue.value.start_date || "",
    due_date: issue.value.due_date || "",
    source: issue.value.source || "",
    review_status: issue.value.review_status || "",
    acceptance_criteria: issue.value.acceptance_criteria || ""
  };
  editDialog.visible = true;
}

async function submitEdit() {
  const valid = await editFormRef.value?.validate().catch(() => false);
  if (!valid || !issue.value) return;
  editDialog.submitting = true;
  try {
    await store.editIssue(issue.value.key, {
      title: editDialog.form.title,
      description: editDialog.form.description,
      status: editDialog.form.status,
      priority: editDialog.form.priority,
      issue_type: editDialog.form.issue_type,
      assignee: editDialog.form.assignee,
      labels: editDialog.form.labelsStr.split(",").map(s => s.trim()).filter(Boolean),
      start_date: editDialog.form.start_date,
      due_date: editDialog.form.due_date,
      source: editDialog.form.source || undefined,
      review_status: editDialog.form.review_status || undefined,
      acceptance_criteria: editDialog.form.acceptance_criteria || undefined
    });
    ElMessage.success("Issue updated");
    editDialog.visible = false;
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

function statusLabel(s: IssueStatus) { return ISSUE_STATUS_MAP[s] || s; }
function priorityLabel(p: IssuePriority) { return ISSUE_PRIORITY_MAP[p] || p; }

function statusTagType(status: IssueStatus): TagType {
  return ISSUE_STATUS_TAG_MAP[status] || "info";
}
function priorityColor(p: IssuePriority) {
  const m: Record<IssuePriority, string> = { urgent: "#f56c6c", high: "#e6a23c", medium: "#409eff", low: "#909399", none: "#c0c4cc" };
  return m[p] || "#909399";
}
function typeTagType(t: IssueType): TagType { return ISSUE_TYPE_TAG_MAP[t] || "info"; }
async function loadComments() {
  if (!issue.value) return;
  try {
    const res = await getComments(issue.value.key);
    comments.value = (res.data?.list as Comment[]) ?? [];
  } catch { /* ignore */ }
}

function renderCommentMd(md: string) {
  const html = renderMarkdown(md);
  return html.replace(/@(\w+)/g, '<span class="mention">@$1</span>');
}

async function addComment() {
  if (!newComment.value.trim() || !issue.value) return;
  commentSubmitting.value = true;
  try {
    await createComment({
      key: `CMT-${Date.now().toString(36).toUpperCase()}`,
      issue_key: issue.value.key,
      author: currentUser,
      content: newComment.value.trim()
    });
    newComment.value = "";
    await loadComments();
  } finally {
    commentSubmitting.value = false;
  }
}

async function deleteComment(commentKey: string) {
  await deleteCommentApi(commentKey);
  await loadComments();
}

function formatSize(bytes: number): string {
  if (!bytes) return "0 B";
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / 1048576).toFixed(1) + " MB";
}

function handleAttachmentUpload(file: any) {
  if (!issue.value) return;
  const reader = new FileReader();
  reader.onload = () => {
    const atts = [...(issue.value!.attachments || [])];
    atts.push({
      name: file.name,
      url: reader.result as string,
      size: file.size || 0,
      uploaded_at: new Date().toISOString()
    });
    store.editIssue(issue.value!.key, { attachments: atts });
  };
  reader.readAsDataURL(file.raw);
}

function handlePaste(e: ClipboardEvent) {
  const items = e.clipboardData?.items;
  if (!items || !issue.value) return;
  for (let i = 0; i < items.length; i++) {
    if (items[i].type.startsWith("image/")) {
      e.preventDefault();
      const blob = items[i].getAsFile();
      if (!blob) continue;
      const reader = new FileReader();
      reader.onload = () => {
        const atts = [...(issue.value!.attachments || [])];
        atts.push({
          name: `pasted-${Date.now()}.png`,
          url: reader.result as string,
          size: blob.size || 0,
          uploaded_at: new Date().toISOString()
        });
        store.editIssue(issue.value!.key, { attachments: atts });
        ElMessage.success("Image pasted");
      };
      reader.readAsDataURL(blob);
    }
  }
}

function removeAttachment(idx: number) {
  if (!issue.value) return;
  const atts = [...(issue.value.attachments || [])];
  atts.splice(idx, 1);
  store.editIssue(issue.value.key, { attachments: atts });
}

async function loadSubTasks() {
  if (!issue.value) return;
  try {
    const res = await getIssueList({ pageSize: 100, project_key: issue.value.project_key });
    const all = (res.data?.list as Issue[]) ?? [];
    subTasks.value = all.filter(i => i.parent_key === issue.value!.key);
  } catch { /* ignore */ }
}

async function addSubTask() {
  if (!newSubTaskTitle.value.trim() || !issue.value) return;
  subTaskAdding.value = true;
  try {
    const key = `ISS-${Date.now().toString(36).toUpperCase()}`;
    await store.addIssue({
      key,
      project_key: issue.value.project_key,
      sequence_id: Date.now(),
      title: newSubTaskTitle.value.trim(),
      status: "todo",
      priority: "medium",
      issue_type: "task",
      labels: [],
      parent_key: issue.value.key
    });
    newSubTaskTitle.value = "";
    await loadSubTasks();
  } finally {
    subTaskAdding.value = false;
  }
}

async function toggleSubTask(st: Issue, done: boolean) {
  await updateIssue(st.key, { status: done ? "done" : "todo" });
  st.status = done ? "done" : "todo";
}

onMounted(async () => {
  const key = route.params.key as string;
  if (key) {
    await store.fetchIssue(key);
  }
  loading.value = false;
  await Promise.all([loadComments(), loadSubTasks(), loadHistory(), loadLinked()]);
});
</script>

<style scoped lang="scss">
.issue-detail {
  padding: 24px;
  height: calc(100vh - 95px);
  overflow: auto;
  background: var(--el-bg-color-page);
}
.issue-detail__head {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;
}
.issue-detail__head-left {
  display: flex;
  align-items: flex-start;
  gap: 16px;
}
.issue-detail__title {
  margin: 0 0 8px;
  font-size: 20px;
  font-weight: 600;
}
.issue-detail__meta {
  display: flex;
  gap: 10px;
  align-items: center;
  code {
    font-size: 12px;
    color: var(--el-text-color-secondary);
    background: var(--el-fill-color-light);
    padding: 1px 8px;
    border-radius: 4px;
  }
}
.issue-detail__priority {
  font-size: 13px;
  font-weight: 500;
}
.issue-detail__head-actions {
  display: flex;
  gap: 8px;
  align-items: center;
}
.issue-detail__body {
  display: flex;
  gap: 24px;
}
.issue-detail__main {
  flex: 1;
  min-width: 0;
}
.issue-detail__section {
  h3 {
    margin: 0 0 12px;
    font-size: 15px;
  }
  :deep(.markdown-body) {
    font-size: 14px;
  }
}
.issue-detail__sidebar {
  width: 260px;
  flex-shrink: 0;
}
.issue-detail__props {
  background: var(--el-fill-color-lighter);
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 16px;
}
.issue-detail__prop {
  display: flex;
  justify-content: space-between;
  padding: 6px 0;
  font-size: 13px;
  & + & {
    border-top: 1px solid var(--el-border-color-lighter);
  }
}
.issue-detail__prop-label {
  color: var(--el-text-color-secondary);
  font-weight: 500;
}
.issue-detail__labels {
  padding: 0 16px;
}
.issue-detail__label-list {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 8px;
}
.issue-detail__dep-group {
  margin-top: 6px;
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  align-items: center;
}
.issue-detail__dep-type {
  font-size: 11px;
  color: var(--el-text-color-placeholder);
  margin-right: 4px;
}
.issue-detail__not-found {
  padding: 80px 0;
}
.issue-detail__comments {
  margin-top: 12px;
}
.issue-detail__comment {
  margin-bottom: 16px;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--el-border-color-lighter);
}
.issue-detail__comment-head {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}
.issue-detail__comment-author {
  font-weight: 600;
  font-size: 13px;
}
.issue-detail__comment-time {
  font-size: 12px;
  color: var(--el-text-color-placeholder);
  flex: 1;
}
.issue-detail__comment-body {
  padding-left: 32px;
  font-size: 14px;
  :deep(p) { margin: 4px 0; }
  :deep(.mention) {
    color: var(--el-color-primary);
    font-weight: 600;
    background: var(--el-color-primary-light-9);
    padding: 0 2px;
    border-radius: 3px;
  }
}
.issue-detail__comment-reactions {
  display: flex;
  gap: 4px;
  padding-left: 32px;
  margin-top: 6px;
}
.issue-detail__reaction {
  cursor: pointer;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 14px;
  border: 1px solid transparent;
  transition: background 0.1s;
  &:hover { background: var(--el-fill-color); }
  &--active { background: var(--el-color-primary-light-9); border-color: var(--el-color-primary-light-5); }
}
.issue-detail__comment-form {
  margin-top: 16px;
}
.issue-detail__comment-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 8px;
}
.issue-detail__comment-hint {
  font-size: 12px;
  color: var(--el-text-color-placeholder);
}
.issue-detail__subtasks {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-bottom: 12px;
}
.issue-detail__subtask {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 6px 8px;
  border-radius: 6px;
  cursor: pointer;
  &:hover {
    background: var(--el-fill-color-light);
  }
}
.issue-detail__subtask-title {
  flex: 1;
  font-size: 13px;
  &--done {
    text-decoration: line-through;
    color: var(--el-text-color-placeholder);
  }
}
.issue-detail__subtask-form {
  margin-top: 8px;
}
.issue-detail__attachments {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 10px;
}
.issue-detail__attachment {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 10px;
  background: var(--el-fill-color-lighter);
  border-radius: 6px;
  font-size: 13px;
}
.issue-detail__attachment-name {
  flex: 1;
  color: var(--el-color-primary);
  text-decoration: none;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.issue-detail__attachment-size {
  font-size: 12px;
  color: var(--el-text-color-placeholder);
}
.issue-detail__upload {
  display: inline-block;
}
.issue-detail__timer {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 4px;
}
.issue-detail__timer-display {
  font-family: monospace;
  font-size: 13px;
  font-weight: 600;
}
.issue-detail__history {
  display: flex;
  flex-direction: column;
  gap: 0;
}
.issue-detail__history-item {
  display: flex;
  gap: 12px;
  padding: 6px 0;
}
.issue-detail__history-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--el-color-primary);
  margin-top: 6px;
  flex-shrink: 0;
}
.issue-detail__history-content {
  display: flex;
  flex-direction: column;
  font-size: 13px;
  code {
    font-size: 12px;
    background: var(--el-fill-color);
    padding: 0 4px;
    border-radius: 3px;
  }
}
.issue-detail__history-action {
  margin-bottom: 2px;
  em { color: var(--el-color-primary); font-style: normal; }
}
.issue-detail__history-change {
  color: var(--el-text-color-secondary);
  margin-bottom: 2px;
}
.issue-detail__history-time {
  font-size: 11px;
  color: var(--el-text-color-placeholder);
}
.issue-detail__history-empty {
  font-size: 13px;
  color: var(--el-text-color-placeholder);
}
</style>