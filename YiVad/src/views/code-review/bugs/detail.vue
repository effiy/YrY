<template>
  <div class="bug-detail">
    <header class="bug-detail__header">
      <div class="bug-detail__header-left">
        <el-button :icon="ArrowLeft" link @click="back">Back to list</el-button>
        <el-divider direction="vertical" />
        <nav class="bug-detail__breadcrumb" aria-label="Breadcrumb">
          <span class="bug-detail__breadcrumb-root">Bug Management</span>
          <el-icon><ArrowRight /></el-icon>
          <span class="bug-detail__breadcrumb-current">{{ bug?.key ?? route.params.id }}</span>
        </nav>
      </div>
      <div class="bug-detail__header-right">
        <div class="bug-detail__nav" v-if="currentIndex >= 0">
          <el-button :icon="ArrowLeft" :disabled="!prevBug" @click="goToBug(prevBug)" :title="prevBug ? `Prev: ${prevBug.title}` : 'No newer bug'">
            {{ prevBug ? `#${currentIndex}` : "Prev" }}
          </el-button>
          <span class="bug-detail__nav-pos">{{ currentIndex + 1 }} / {{ store.bugs.length }}</span>
          <el-button :disabled="!nextBug" @click="goToBug(nextBug)" :title="nextBug ? `Next: ${nextBug.title}` : 'No older bug'">
            {{ nextBug ? `#${currentIndex + 2}` : "Next" }}<el-icon class="el-icon--right"><ArrowRight /></el-icon>
          </el-button>
        </div>
        <el-button v-if="bug" :icon="ChatDotRound" type="primary" @click="discussBugInAiChat">Discuss in AI Chat</el-button>
        <el-button v-if="bug" link @click="viewRelatedAiChatSessions">Related AI Chat sessions</el-button>
        <el-button v-if="bug" :icon="EditPen" @click="openDrawer('Edit', bug)">Edit</el-button>
        <el-button v-if="bug" :icon="Refresh" @click="reload">Reload</el-button>
        <el-button v-if="bug" :icon="QuestionFilled" link @click="showShortcuts = true">Shortcuts</el-button>
        <span class="bug-detail__kbd-hint" v-if="bug">
          <kbd>E</kbd> edit · <kbd>R</kbd> reload · <kbd>J</kbd>/<kbd>K</kbd> next/prev · <kbd>Esc</kbd> back · <kbd>?</kbd> help
        </span>
      </div>
    </header>

    <div v-loading="store.detailLoading" class="bug-detail__body">
      <template v-if="bug">
        <!-- Hero banner -->
        <article class="bug-detail__hero">
          <div class="bug-detail__hero-main">
            <div class="bug-detail__hero-keyline">
              <code class="bug-detail__key" title="Bug key (click to copy)" @click="copyToClipboard(bug.key, 'Bug key copied')">
                {{ bug.key }}
                <el-icon class="bug-detail__key-icon"><CopyDocument /></el-icon>
              </code>
              <el-tag :type="statusTag[bug.status] || undefined" effect="dark" size="large">
                {{ statusLabel(bug.status) }}
              </el-tag>
            </div>
            <h1 class="bug-detail__title">{{ bug.title }}</h1>
            <p v-if="content?.description" class="bug-detail__summary">
              {{ summary(content.description) }}
            </p>
            <dl class="bug-detail__hero-meta">
              <div><dt>Project</dt><dd>{{ projectLabel(bug.project) }}</dd></div>
              <div><dt>Module</dt><dd>{{ bug.module || "—" }}</dd></div>
              <div><dt>Assignee</dt><dd>{{ bug.assignee || "Unassigned" }}</dd></div>
              <div><dt>Reporter</dt><dd>{{ bug.reporter || "—" }}</dd></div>
              <div v-if="bug.iteration"><dt>Iteration</dt><dd>{{ bug.iteration }}</dd></div>
              <div v-if="bug.defectUrl"><dt>Defect</dt><dd>
                <a :href="bug.defectUrl" target="_blank" rel="noopener" class="bug-detail__link">{{ defectHostname(bug.defectUrl) }}</a>
              </dd></div>
            </dl>
          </div>
          <aside class="bug-detail__hero-aside" :class="`bug-detail__hero-aside--${bug.severity}`" :aria-label="`Severity ${bug.severity}`">
            <div class="bug-detail__aside-label">Severity</div>
            <div class="bug-detail__aside-value">{{ severityLabel(bug.severity) }}</div>
            <el-divider class="bug-detail__aside-divider" />
            <div class="bug-detail__aside-label">Priority</div>
            <div class="bug-detail__aside-value">{{ priorityLabel(bug.priority) }}</div>
            <el-divider class="bug-detail__aside-divider" />
            <div class="bug-detail__aside-label">Frequency</div>
            <div class="bug-detail__aside-value">{{ frequencyLabel(bug.frequency) }}</div>
          </aside>
        </article>

        <!-- Impact strip -->
        <section class="bug-detail__impact" aria-label="Classification">
          <div class="bug-detail__impact-item">
            <el-icon><Warning /></el-icon>
            <div>
              <div class="bug-detail__impact-label">Type</div>
              <div class="bug-detail__impact-value">{{ typeLabel(bug.type) }}</div>
            </div>
          </div>
          <div class="bug-detail__impact-item">
            <el-icon><Clock /></el-icon>
            <div>
              <div class="bug-detail__impact-label">Created</div>
              <div class="bug-detail__impact-value"><time :datetime="new Date(bug.createdAt).toISOString()">{{ formatTime(bug.createdAt) }}</time></div>
            </div>
          </div>
          <div class="bug-detail__impact-item">
            <el-icon><Timer /></el-icon>
            <div>
              <div class="bug-detail__impact-label">Due</div>
              <div class="bug-detail__impact-value">
                <time v-if="bug.dueDate" :datetime="new Date(bug.dueDate).toISOString()">{{ formatTime(bug.dueDate, "date") }}</time>
                <span v-else>—</span>
                <el-tag v-if="slaTag" :type="slaTag.type" size="small" effect="plain" class="bug-detail__sla">{{ slaTag.text }}</el-tag>
              </div>
            </div>
          </div>
          <div class="bug-detail__impact-item">
            <el-icon><CircleCheck v-if="bug.status === 'closed' || bug.status === 'resolved'" /><Loading v-else-if="bug.status === 'in_progress'" /><Warning v-else /></el-icon>
            <div>
              <div class="bug-detail__impact-label">Lifecycle</div>
              <div class="bug-detail__impact-value">{{ lifecycleElapsed }}</div>
            </div>
          </div>
        </section>

        <!-- Lifecycle timeline -->
        <el-card shadow="never" class="bug-detail__card">
          <template #header><h3>Lifecycle</h3></template>
          <el-timeline v-if="lifecycleEvents.length" class="bug-detail__timeline">
            <el-timeline-item
              v-for="(evt, idx) in lifecycleEvents"
              :key="idx"
              :timestamp="formatTime(evt.ts)"
              :type="evt.type"
              placement="top"
            >
              <h4 class="bug-detail__timeline-title">{{ evt.label }}</h4>
              <p v-if="evt.note" class="bug-detail__timeline-note">{{ evt.note }}</p>
              <p
                class="bug-detail__timeline-relative bug-detail__copyable"
                :title="`${formatTime(evt.ts)} · click to copy ISO`"
                @click="copyTimestamp(evt.ts)"
              >{{ formatRelativeTime(evt.ts) }}</p>
            </el-timeline-item>
          </el-timeline>
          <el-empty v-else description="No lifecycle events" :image-size="60" />
        </el-card>

        <!-- Environment -->
        <el-card shadow="never" class="bug-detail__card">
          <template #header>
            <div class="bug-detail__card-header">
              <h3>Environment &amp; Versions</h3>
              <el-button size="small" text type="primary" @click="openDrawer('Edit', bug)">Edit</el-button>
            </div>
          </template>
          <el-descriptions :column="2" border>
            <el-descriptions-item label="Environment" :span="2">{{ bug.environment || "—" }}</el-descriptions-item>
            <el-descriptions-item label="Affected Version">{{ bug.affectedVersion || "—" }}</el-descriptions-item>
            <el-descriptions-item label="Fixed Version">{{ bug.fixedVersion || "—" }}</el-descriptions-item>
          </el-descriptions>
        </el-card>

        <!-- Reproduction -->
        <el-card shadow="never" class="bug-detail__card">
          <template #header>
            <div class="bug-detail__card-header">
              <h3>Reproduction</h3>
              <el-button size="small" text type="primary" @click="openDrawer('Edit', bug)">Edit</el-button>
            </div>
          </template>
          <section class="bug-detail__content-section">
            <h4>Description</h4>
            <div v-if="content?.description" class="bug-detail__markdown prose" v-html="renderMarkdown(content.description)"></div>
            <el-empty v-else description="No description" :image-size="60">
              <template #extra>
                <el-button size="small" type="primary" plain @click="openDrawer('Edit', bug)">Add description</el-button>
              </template>
            </el-empty>
          </section>
          <el-divider />
          <section class="bug-detail__content-section">
            <h4>Steps to Reproduce</h4>
            <ol v-if="content?.stepsToReproduce?.length" class="bug-detail__steps">
              <li v-for="(step, idx) in content.stepsToReproduce" :key="idx">
                <span class="bug-detail__step-num">{{ idx + 1 }}</span>
                <span class="bug-detail__step-text">{{ step }}</span>
              </li>
            </ol>
            <el-empty v-else description="No steps recorded" :image-size="60">
              <template #extra>
                <el-button size="small" type="primary" plain @click="openDrawer('Edit', bug)">Add steps</el-button>
              </template>
            </el-empty>
          </section>
          <el-row :gutter="16" class="bug-detail__row">
            <el-col :span="12">
              <section class="bug-detail__content-section">
                <h4>Expected Result</h4>
                <div v-if="content?.expectedResult" class="bug-detail__markdown bug-detail__markdown--expected prose" v-html="renderMarkdown(content.expectedResult)"></div>
                <el-empty v-else description="Not specified" :image-size="60">
                  <template #extra>
                    <el-button size="small" type="primary" plain @click="openDrawer('Edit', bug)">Add expected</el-button>
                  </template>
                </el-empty>
              </section>
            </el-col>
            <el-col :span="12">
              <section class="bug-detail__content-section">
                <h4>Actual Result</h4>
                <div v-if="content?.actualResult" class="bug-detail__markdown bug-detail__markdown--actual prose" v-html="renderMarkdown(content.actualResult)"></div>
                <el-empty v-else description="Not specified" :image-size="60">
                  <template #extra>
                    <el-button size="small" type="primary" plain @click="openDrawer('Edit', bug)">Add actual</el-button>
                  </template>
                </el-empty>
              </section>
            </el-col>
          </el-row>
        </el-card>

        <!-- Resolution -->
        <el-card shadow="never" class="bug-detail__card" :class="{ 'bug-detail__card--resolved': bug.status === 'resolved' || bug.status === 'closed' }">
          <template #header>
            <div class="bug-detail__card-header">
              <h3>Resolution</h3>
              <div class="bug-detail__card-header-acts">
                <el-tag v-if="bug.resolvedAt" type="success" size="small">Resolved {{ formatTime(bug.resolvedAt) }}</el-tag>
                <el-button size="small" text type="primary" @click="openDrawer('Edit', bug)">Edit</el-button>
              </div>
            </div>
          </template>
          <section class="bug-detail__content-section">
            <h4>Root Cause</h4>
            <div v-if="content?.causeProblem" class="bug-detail__markdown prose" v-html="renderMarkdown(content.causeProblem)"></div>
            <el-empty v-else description="Root cause not yet recorded" :image-size="60">
              <template #extra>
                <el-button size="small" type="primary" plain @click="openDrawer('Edit', bug)">Add root cause</el-button>
              </template>
            </el-empty>
          </section>
          <el-divider />
          <section class="bug-detail__content-section">
            <h4>Solution</h4>
            <div v-if="content?.solution" class="bug-detail__markdown prose" v-html="renderMarkdown(content.solution)"></div>
            <el-empty v-else description="Solution not yet recorded" :image-size="60">
              <template #extra>
                <el-button size="small" type="primary" plain @click="openDrawer('Edit', bug)">Add solution</el-button>
              </template>
            </el-empty>
          </section>
        </el-card>

        <!-- Related files (code-review) -->
        <el-card shadow="never" class="bug-detail__card">
          <template #header>
            <div class="bug-detail__card-header">
              <h3>Related Files</h3>
              <div class="bug-detail__card-header-acts">
                <el-tag type="info" size="small">{{ relatedFiles.length }} detected</el-tag>
                <el-button
                  v-if="relatedFiles.length > 1"
                  size="small"
                  text
                  type="primary"
                  :icon="CopyDocument"
                  @click="copyAllPaths()"
                >
                  Copy all
                </el-button>
              </div>
            </div>
          </template>
          <p v-if="relatedFiles.length" class="bug-detail__related-hint">
            File paths auto-extracted from the description, root cause, and solution.
          </p>
          <ul v-if="relatedFiles.length" class="bug-detail__files">
            <li v-for="f in relatedFiles" :key="f" class="bug-detail__file-li" :title="'Click to copy'" @click="copyToClipboard(f, 'Path copied')">
              <el-icon class="bug-detail__file-icon"><Document /></el-icon>
              <code class="bug-detail__file-path">{{ f }}</code>
              <el-button
                class="bug-detail__file-discuss"
                size="small"
                text
                :icon="ChatDotRound"
                title="Discuss this file in AI Chat"
                @click.stop="discussBugFileInAiChat(f)"
              />
              <el-icon class="bug-detail__file-copy"><CopyDocument /></el-icon>
            </li>
          </ul>
          <el-empty v-else description="No file paths detected in this bug's content" :image-size="60" />
        </el-card>

        <!-- Retrospective (auto-generated synthesis) -->
        <el-card shadow="never" class="bug-detail__card bug-detail__card--retro">
          <template #header>
            <div class="bug-detail__card-header">
              <div class="bug-detail__retro-toggle" @click="retroCollapsed = !retroCollapsed">
                <el-icon class="bug-detail__retro-chevron" :class="{ 'is-reversed': retroCollapsed }"><ArrowDown /></el-icon>
                <h3>Retrospective</h3>
                <el-tag type="warning" size="small" effect="plain">auto-synthesised</el-tag>
              </div>
              <el-button
                v-if="retro.prevention.length"
                size="small"
                text
                type="primary"
                :icon="CopyDocument"
                @click="copyPrevention"
              >
                Copy Prevention
              </el-button>
            </div>
          </template>
          <div v-show="!retroCollapsed">
          <p class="bug-detail__retro-intro">
            Synthesised from metadata, content body, and {{ relatedFiles.length }} related file path{{ relatedFiles.length === 1 ? "" : "s" }}.
            Not a substitute for human review — use as a starting point for the postmortem discussion.
          </p>
          <el-descriptions :column="2" border class="bug-detail__retro-grid" title="Impact & Severity">
            <el-descriptions-item label="Severity">{{ severityLabel(retro.severity) }}</el-descriptions-item>
            <el-descriptions-item label="Priority">{{ priorityLabel(retro.priority) }}</el-descriptions-item>
            <el-descriptions-item label="Type">{{ typeLabel(retro.type) }}</el-descriptions-item>
            <el-descriptions-item label="Status">{{ statusLabel(retro.status) }}</el-descriptions-item>
            <el-descriptions-item label="Time to resolve">{{ retro.timeToResolve }}</el-descriptions-item>
            <el-descriptions-item label="SLA">{{ retro.slaOutcome }}</el-descriptions-item>
          </el-descriptions>
          <el-divider />
          <section class="bug-detail__content-section">
            <h4>Root-cause Category</h4>
            <p class="bug-detail__retro-body">{{ retro.rootCauseCategory }}</p>
          </section>
          <el-divider />
          <section class="bug-detail__content-section">
            <h4>Affected Components</h4>
            <ul v-if="retro.affectedComponents.length" class="bug-detail__retro-components">
              <li v-for="c in retro.affectedComponents" :key="c.area">
                <strong>{{ c.area }}</strong>
                <span class="bug-detail__retro-count">{{ c.files.length }} file{{ c.files.length === 1 ? "" : "s" }}</span>
                <code v-for="f in c.files.slice(0, 5)" :key="f" class="bug-detail__retro-file">{{ f }}</code>
                <span v-if="c.files.length > 5" class="bug-detail__retro-more">+{{ c.files.length - 5 }} more</span>
              </li>
            </ul>
            <el-empty v-else description="No file paths extracted" :image-size="60" />
          </section>
          <el-divider />
          <section class="bug-detail__content-section">
            <h4>Fix Approach</h4>
            <p class="bug-detail__retro-body">{{ retro.fixApproach }}</p>
          </section>
          <el-divider />
          <section class="bug-detail__content-section">
            <h4>Prevention &amp; Follow-up</h4>
            <ul class="bug-detail__retro-list">
              <li v-for="(item, idx) in retro.prevention" :key="idx">{{ item }}</li>
            </ul>
          </section>
          <el-divider />
          <section class="bug-detail__content-section">
            <h4>One-line Summary</h4>
            <div class="bug-detail__retro-summary-row">
              <p class="bug-detail__retro-body bug-detail__retro-body--lead">{{ retro.oneLiner }}</p>
              <el-button
                size="small"
                text
                type="primary"
                :icon="CopyDocument"
                @click="copyOneLiner"
              >
                Copy
              </el-button>
            </div>
          </section>
          </div>
        </el-card>

        <!-- Tags -->
        <el-card v-if="bug.tags?.length" shadow="never" class="bug-detail__card">
          <template #header><h3>Tags</h3></template>
          <div class="bug-detail__tags">
            <el-tag v-for="(t, idx) in bug.tags" :key="idx" type="info" effect="plain">{{ t }}</el-tag>
          </div>
        </el-card>

        <!-- Content file -->
        <el-card shadow="never" class="bug-detail__card">
          <template #header><h3>Content File</h3></template>
          <el-descriptions :column="1" border>
            <el-descriptions-item label="Path">
              <code class="bug-detail__content-path" @click="copyToClipboard(bug.contentPath, 'Path copied')">{{ bug.contentPath || "—" }}</code>
              <el-icon class="bug-detail__content-copy"><CopyDocument /></el-icon>
            </el-descriptions-item>
          </el-descriptions>
        </el-card>

        <!-- Cross-domain links — BRD + Tech-Leadership + Story Board, all by shared project -->
        <el-card v-if="bug.project" shadow="never" class="bug-detail__card bug-detail__related">
          <template #header><h3>Cross-Domain Links</h3></template>

        </el-card>
      </template>

      <el-empty v-else-if="!store.detailLoading" description="Bug not found" />
    </div>

    <BugDrawer ref="drawerRef" />

    <el-dialog
      v-model="showShortcuts"
      title="Keyboard shortcuts"
      width="420px"
      append-to-body
      class="bug-detail__shortcuts"
    >
      <ul class="bug-detail__shortcut-list">
        <li><kbd>E</kbd><span>Edit current bug</span></li>
        <li><kbd>R</kbd><span>Reload from server</span></li>
        <li><kbd>J</kbd><span>Next (older) bug in list</span></li>
        <li><kbd>K</kbd><span>Previous (newer) bug in list</span></li>
        <li><kbd>/</kbd><span>Focus search on list page</span></li>
        <li><kbd>N</kbd><span>New bug (on list page)</span></li>
        <li><kbd>Esc</kbd><span>Back to list (or close this dialog)</span></li>
        <li><kbd>?</kbd><span>Show this help</span></li>
      </ul>
      <template #footer>
        <el-button type="primary" @click="showShortcuts = false">Got it</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts" name="crBugsDetail">
import { computed, onMounted, onBeforeUnmount, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { ElMessage } from "element-plus";
import {
  ArrowLeft,
  ArrowRight,
  ArrowDown,
  ChatDotRound,
  CircleCheck,
  Clock,
  CopyDocument,
  Document,
  EditPen,
  Loading,
  QuestionFilled,
  Refresh,
  Timer,
  Warning
} from "@element-plus/icons-vue";
import { PROJECT_LABELS } from "@/config";
import { useBugStore } from "@/stores/modules/bug";
import { useMarkdown } from "@/hooks/useMarkdown";
import { useAiChatBridge } from "@/hooks/useAiChatBridge";
import { buildRelatedEntriesSection } from "@/hooks/useRelatedByProject";
import { formatRelativeTime } from "@/utils/datetime";
import { updateBug, readBugContent, type BugDocument, type BugContent, type BugSeverity, type BugPriority, type BugStatus, type BugType, type BugFrequency } from "@/api/modules/bug";
import BugDrawer from "./components/BugDrawer.vue";

const route = useRoute();
const router = useRouter();
const store = useBugStore();
const { render: renderMarkdown } = useMarkdown();
const { openInAiChat, linkToAiChatByTag } = useAiChatBridge();

function projectLabel(value?: string): string {
  if (!value) return "—";
  return PROJECT_LABELS[value] ?? value;
}

const bug = computed(() => store.selectedBug);
const content = computed(() => store.selectedBugContent);

const retroCollapsed = ref(false);
const showShortcuts = ref(false);

type TagType = "danger" | "warning" | "info" | "primary" | "success" | "";

const severityTag: Record<BugSeverity, TagType> = {
  critical: "danger", major: "warning", minor: "info", trivial: ""
};
const statusTag: Record<BugStatus, TagType> = {
  open: "warning", in_progress: "primary", resolved: "success", closed: "info", rejected: "danger", reopened: "danger"
};

const severityLabel = (s: BugSeverity): string => ({
  critical: "Critical", major: "Major", minor: "Minor", trivial: "Trivial"
})[s];
const priorityLabel = (p: BugPriority): string => ({
  p0: "P0", p1: "P1", p2: "P2", p3: "P3"
})[p];
const statusLabel = (s: BugStatus): string => ({
  open: "Open", in_progress: "In Progress", resolved: "Resolved", closed: "Closed", rejected: "Rejected", reopened: "Reopened"
})[s];
const typeLabel = (t: BugType | undefined): string => t ? ({
  functional: "Functional", performance: "Performance", ui: "UI / UX", security: "Security",
  compatibility: "Compatibility", regression: "Regression", data: "Data", other: "Other"
})[t] : "—";
const frequencyLabel = (f: BugFrequency | undefined): string => f ? ({
  always: "Always", sometimes: "Sometimes", rarely: "Rarely", once: "Once", unable: "Unable to reproduce"
})[f] : "—";

function formatTime(ts: number | null | undefined, mode: "datetime" | "date" = "datetime"): string {
  if (!ts) return "—";
  const d = new Date(ts);
  return mode === "date" ? d.toLocaleDateString() : d.toLocaleString();
}

function summary(text: string): string {
  const flat = text.replace(/\s+/g, " ").trim();
  return flat.length > 180 ? `${flat.slice(0, 180)}…` : flat;
}

function defectHostname(url: string): string {
  try { return new URL(url).hostname || url; } catch { return url; }
}

async function copyToClipboard(text: string | undefined, toast = "Copied"): Promise<void> {
  if (!text) return;
  try {
    await navigator.clipboard.writeText(text);
    ElMessage.success({ message: `${toast}: ${text.length > 60 ? text.slice(0, 60) + "…" : text}`, duration: 1500 });
  } catch {
    ElMessage.warning("Clipboard unavailable");
  }
}

async function copyAllPaths(): Promise<void> {
  if (!relatedFiles.value.length) return;
  const blob = relatedFiles.value.join("\n");
  try {
    await navigator.clipboard.writeText(blob);
    ElMessage.success({ message: `Copied ${relatedFiles.value.length} file path${relatedFiles.value.length === 1 ? "" : "s"}`, duration: 1500 });
  } catch {
    ElMessage.warning("Clipboard unavailable");
  }
}

async function copyPrevention(): Promise<void> {
  const items = retro.value.prevention;
  if (!items.length) return;
  const header = `Prevention & Follow-up — ${bug.value?.key ?? "bug"}\n${bug.value?.title ?? ""}\n`;
  const blob = header + items.map((it, i) => `${i + 1}. ${it}`).join("\n");
  try {
    await navigator.clipboard.writeText(blob);
    ElMessage.success({ message: `Copied ${items.length} prevention item${items.length === 1 ? "" : "s"}`, duration: 1500 });
  } catch {
    ElMessage.warning("Clipboard unavailable");
  }
}

async function copyOneLiner(): Promise<void> {
  const text = retro.value.oneLiner;
  if (!text || text === "—") return;
  try {
    await navigator.clipboard.writeText(text);
    ElMessage.success({ message: "Copied summary", duration: 1500 });
  } catch {
    ElMessage.warning("Clipboard unavailable");
  }
}

async function copyTimestamp(ts: number | string | null | undefined): Promise<void> {
  if (!ts) return;
  const iso = new Date(ts).toISOString();
  try {
    await navigator.clipboard.writeText(iso);
    ElMessage.success({ message: "Timestamp copied", duration: 1200 });
  } catch {
    ElMessage.warning("Clipboard unavailable");
  }
}

// SLA indicator — breached if dueDate passed and not resolved/closed
const slaTag = computed(() => {
  if (!bug.value?.dueDate) return null;
  const now = Date.now();
  const due = bug.value.dueDate;
  const isClosed = bug.value.status === "closed" || bug.value.status === "resolved" || bug.value.status === "rejected";
  if (due < now && !isClosed) return { type: "danger" as const, text: "Overdue" };
  if (due < now && isClosed) return { type: "warning" as const, text: "Closed after due" };
  const days = Math.ceil((due - now) / (24 * 3600 * 1000));
  if (days <= 1) return { type: "warning" as const, text: "Due soon" };
  return null;
});

const lifecycleElapsed = computed(() => {
  if (!bug.value) return "—";
  const start = bug.value.createdAt;
  const end = bug.value.resolvedAt || bug.value.closedAt || Date.now();
  const ms = end - start;
  if (ms < 0) return "—";
  const days = Math.floor(ms / (24 * 3600 * 1000));
  const hours = Math.floor((ms % (24 * 3600 * 1000)) / (3600 * 1000));
  if (days > 0) return `${days}d ${hours}h elapsed`;
  const mins = Math.floor((ms % (3600 * 1000)) / (60 * 1000));
  if (hours > 0) return `${hours}h ${mins}m elapsed`;
  return `${mins}m elapsed`;
});

interface LifecycleEvent { ts: number; label: string; note?: string; type: TagType; }

const lifecycleEvents = computed<LifecycleEvent[]>(() => {
  if (!bug.value) return [];
  const events: LifecycleEvent[] = [];
  events.push({ ts: bug.value.createdAt, label: "Created", type: "primary" });
  if (bug.value.resolvedAt) events.push({ ts: bug.value.resolvedAt, label: "Resolved", type: "success" });
  if (bug.value.closedAt) events.push({ ts: bug.value.closedAt, label: "Closed", type: "info" });
  if (bug.value.updatedAt && bug.value.updatedAt !== bug.value.createdAt && bug.value.updatedAt !== bug.value.resolvedAt && bug.value.updatedAt !== bug.value.closedAt) {
    events.push({ ts: bug.value.updatedAt, label: "Updated", type: "warning" });
  }
  return events.sort((a, b) => a.ts - b.ts);
});

// Auto-extract file paths from the bug content for code-review hand-off.
// Matches common repo-relative paths with known source extensions.
const FILE_PATH_RE = /\b((?:[A-Za-z0-9_-]+(?:\/|\\))+[A-Za-z0-9_.-]+\.(?:py|ts|tsx|js|jsx|vue|json|md|yaml|yml|sh|css|scss))\b/g;

const relatedFiles = computed<string[]>(() => {
  const blob = [
    content.value?.description ?? "",
    content.value?.causeProblem ?? "",
    content.value?.solution ?? "",
    content.value?.expectedResult ?? "",
    content.value?.actualResult ?? "",
    bug.value?.module ?? ""
  ].join("\n");
  const seen = new Set<string>();
  let m: RegExpExecArray | null;
  const re = new RegExp(FILE_PATH_RE.source, "g");
  while ((m = re.exec(blob)) !== null) {
    const p = m[1].replace(/\\/g, "/");
    if (!seen.has(p)) seen.add(p);
  }
  return [...seen];
});

interface RetroComponent { area: string; files: string[]; }
interface Retrospective {
  severity: BugSeverity;
  priority: BugPriority;
  type: BugType | undefined;
  status: BugStatus;
  timeToResolve: string;
  slaOutcome: string;
  rootCauseCategory: string;
  affectedComponents: RetroComponent[];
  fixApproach: string;
  prevention: string[];
  oneLiner: string;
}

// Heuristic root-cause classifier — scans the cause text for known patterns.
function classifyRootCause(cause: string): string {
  const c = cause.toLowerCase();
  if (!c) return "Root cause not yet recorded — fill in the Cause field to enable classification.";
  if (/\b(regex|regular expression|m-flag|multiline|lookahead)\b/.test(c)) return "Parser / regex defect — incorrect delimiter semantics or flag misuse.";
  if (/\b(rpc|signature|positional|kwargs|parameters_dict|executor)\b/.test(c)) return "API contract drift — caller and callee disagree on parameter shape.";
  if (/\b(async|await|promise|race|callback)\b/.test(c)) return "Async control-flow defect — race, unhandled rejection, or stale closure.";
  if (/\b(mutation|state|side effect|stale)\b/.test(c)) return "State-management defect — input or shared state was mutated instead of copied.";
  if (/\b(null|undefined|optional|missing key|field)\b/.test(c)) return "Nullness / contract validation defect — a required field was absent at the boundary.";
  if (/\b(time|timeout|concurrent|lock)\b/.test(c)) return "Concurrency / timing defect.";
  if (/\b(encode|decode|serialize|json|markdown|parse)\b/.test(c)) return "Serialisation / parsing defect.";
  if (/\b(permission|auth|token|xss|csrf|injection)\b/.test(c)) return "Security defect.";
  return "Functional defect — see Cause body for specifics.";
}

// Bucket file paths by their top-level area for the affected-components panel.
function groupFilesByArea(paths: string[]): RetroComponent[] {
  const groups = new Map<string, string[]>();
  for (const p of paths) {
    const parts = p.split("/");
    let area: string;
    if (parts[0] === "src" && parts.length >= 2) area = `src/${parts[1]}`;
    else if (parts.length >= 2) area = `${parts[0]}/${parts[1]}`;
    else area = parts[0] || "root";
    if (!groups.has(area)) groups.set(area, []);
    groups.get(area)!.push(p);
  }
  return [...groups.entries()]
    .map(([area, files]) => ({ area, files }))
    .sort((a, b) => b.files.length - a.files.length);
}

function describeFixApproach(bug: BugDocument, content: BugContent | null): string {
  if (content?.solution?.trim()) {
    return `The recorded solution: ${content.solution.trim()}`;
  }
  if (bug.status === "resolved" || bug.status === "closed") {
    return "Marked resolved but no Solution text recorded — add it during the postmortem.";
  }
  if (bug.status === "rejected") {
    return "Rejected — no fix applied. Document the rejection rationale in the Solution field.";
  }
  return "Open — no fix recorded yet. The postmortem should capture the planned approach.";
}

function buildPrevention(bug: BugDocument, content: BugContent | null, rootCat: string): string[] {
  const items: string[] = [];
  // Pattern-based prevention suggestions
  if (/regex|parser/i.test(rootCat)) {
    items.push("Add a parser round-trip test: write → read → assert equal, covering multi-line inputs.");
    items.push("Prefer line-by-line state machines over single regex splits for structured markdown.");
  }
  if (/API contract/.test(rootCat)) {
    items.push("Add a contract test that exercises the RPC boundary with a representative payload.");
    items.push("Document the parameter shape in CLAUDE.md so callers and callees stay aligned.");
  }
  if (/state-management|mutation/i.test(rootCat)) {
    items.push("Freeze or shallow-copy inputs before mutating; enable a linter rule for parameter mutation.");
  }
  if (/Nullness|contract validation/.test(rootCat)) {
    items.push("Add a Pydantic / Zod schema at the boundary so missing fields fail fast.");
  }
  // Severity-based follow-ups
  if (bug.severity === "critical" || bug.severity === "major") {
    items.push("Add this defect to the next iteration's regression suite as a permanent test case.");
  }
  if (bug.frequency === "always" || bug.frequency === "sometimes") {
    items.push("Reproduce locally before closing — a flaky fix is worse than the original bug.");
  }
  // Type-based
  if (bug.type === "regression") {
    items.push("Bisect the regression to the offending commit and add a guard CI check.");
  }
  if (bug.type === "security") {
    items.push("Open a security track ticket; rotate any leaked secrets even if no exfiltration is suspected.");
  }
  if (items.length === 0) {
    items.push("No heuristic prevention matched — capture the team's discussion notes in the Solution field.");
  }
  return items;
}

function describeSlaOutcome(bug: BugDocument): string {
  if (!bug.dueDate) return "No due date set";
  const isClosed = bug.status === "closed" || bug.status === "resolved" || bug.status === "rejected";
  const overdue = bug.dueDate < Date.now() && !isClosed;
  const closedLate = bug.dueDate < (bug.resolvedAt ?? bug.closedAt ?? 0);
  if (overdue) return "Overdue — still open past due date";
  if (closedLate) return "Closed after due date";
  return "Within SLA";
}

const retro = computed<Retrospective>(() => {
  const b = bug.value;
  const c = content.value;
  const rootCat = classifyRootCause(c?.causeProblem ?? "");
  const fix = b ? describeFixApproach(b, c) : "—";
  const prevention = b ? buildPrevention(b, c, rootCat) : [];
  const oneLiner = b
    ? `${severityLabel(b.severity)} ${b.type ?? "functional"} bug in ${b.module || b.project || "unknown module"} — ${rootCat.split(" — ")[0].toLowerCase()}.`
    : "—";
  return {
    severity: b?.severity ?? "minor",
    priority: b?.priority ?? "p2",
    type: b?.type,
    status: b?.status ?? "open",
    timeToResolve: lifecycleElapsed.value,
    slaOutcome: b ? describeSlaOutcome(b) : "—",
    rootCauseCategory: rootCat,
    affectedComponents: groupFilesByArea(relatedFiles.value),
    fixApproach: fix,
    prevention,
    oneLiner
  };
});

function back() {
  router.push("/code-review/bugs");
}

async function discussBugInAiChat() {
  const b = bug.value;
  if (!b) return;
  const c = content.value;
  const steps = c?.stepsToReproduce?.length ? c.stepsToReproduce.map((s, i) => `${i + 1}. ${s}`).join("\n") : "";
  const baseContent = [
    `# ${b.title}`,
    "",
    `**Key:** ${b.key}`,
    `**Project:** ${projectLabel(b.project) || "—"}`,
    `**Module:** ${b.module || "—"}`,
    `**Severity:** ${severityLabel(b.severity)}`,
    `**Priority:** ${priorityLabel(b.priority)}`,
    `**Status:** ${statusLabel(b.status)}`,
    `**Type:** ${typeLabel(b.type)}`,
    `**Frequency:** ${frequencyLabel(b.frequency)}`,
    ...(b.assignee ? [`**Assignee:** ${b.assignee}`] : []),
    ...(b.reporter ? [`**Reporter:** ${b.reporter}`] : []),
    ...(b.environment ? [`**Environment:** ${b.environment}`] : []),
    ...(b.affectedVersion ? [`**Affected Version:** ${b.affectedVersion}`] : []),
    ...(b.fixedVersion ? [`**Fixed Version:** ${b.fixedVersion}`] : []),
    ...(b.tags?.length ? [`**Tags:** ${b.tags.join(", ")}`] : []),
    "",
    "## Description",
    "",
    c?.description || "_(no description)_",
    ...(steps ? ["", "## Steps to Reproduce", "", steps] : []),
    ...(c?.expectedResult ? ["", "## Expected Result", "", c.expectedResult] : []),
    ...(c?.actualResult ? ["", "## Actual Result", "", c.actualResult] : []),
    ...(c?.causeProblem ? ["", "## Root Cause", "", c.causeProblem] : []),
    ...(c?.solution ? ["", "## Solution", "", c.solution] : []),
    ...(relatedFiles.value.length ? ["", "## Related Files", "", relatedFiles.value.map(f => `- \`${f}\``).join("\n")] : [])
  ].join("\n");
  let pageContent = baseContent;
  if (b.project) {
    const section = await buildRelatedEntriesSection(b.project, b.key, "bugs");
    if (section) pageContent = `${pageContent}\n${section}`;
  }
  const tags = [`ctx:code-review/bugs/${b.key}`, "code-review", "bug", `bug:${b.key}`];
  if (b.project) tags.push(`project:${b.project}`);
  if (b.severity) tags.push(`severity:${b.severity}`);
  if (b.status) tags.push(`status:${b.status}`);
  await openInAiChat({
    title: `Bug: ${b.title}`,
    pageContent,
    tags,
    sourceUrl: `/code-review/bugs/detail/${b.key}?mode=view`
  });
}

function viewRelatedAiChatSessions() {
  const b = bug.value;
  if (!b?.key) return;
  router.push(linkToAiChatByTag(`bug:${b.key}`));
}

async function discussBugFileInAiChat(filePath: string) {
  const b = bug.value;
  if (!b || !filePath) return;
  const tags = [`ctx:code-review/bugs/${b.key}`, "code-review", "bug", `bug:${b.key}`, `file:${filePath}`];
  if (b.project) tags.push(`project:${b.project}`);
  const pageContent = [
    `# \`${filePath}\``,
    "",
    `**Bug:** ${b.title}`,
    `**Key:** ${b.key}`,
    `**Project:** ${projectLabel(b.project) || "—"}`,
    `**Module:** ${b.module || "—"}`,
    `**Severity:** ${severityLabel(b.severity)}`,
    `**Status:** ${statusLabel(b.status)}`,
    `**File:** \`${filePath}\``,
    "",
    "## Description",
    "",
    content.value?.description || "_(no description)_",
    ...(content.value?.causeProblem ? ["", "## Root Cause", "", content.value.causeProblem] : []),
    ...(content.value?.solution ? ["", "## Solution", "", content.value.solution] : [])
  ].join("\n");
  await openInAiChat({
    title: `${filePath} — bug ${b.key}`,
    pageContent,
    tags,
    sourceUrl: `/code-review/bugs/detail/${b.key}?mode=view`
  });
}

function reload() {
  const id = route.params.id as string;
  if (id) store.loadDetail(id);
}

// Inline edit drawer — mirrors views/code-review/bugs/index.vue's openDrawer flow.
const drawerRef = ref<InstanceType<typeof BugDrawer> | null>(null);

type DrawerRow = Omit<Partial<BugDocument>, "stepsToReproduce" | "dueDate" | "contentPath" | "createdAt" | "updatedAt" | "resolvedAt" | "closedAt"> & {
  stepsToReproduce?: string;
  description?: string;
  expectedResult?: string;
  actualResult?: string;
  causeProblem?: string;
  solution?: string;
  dueDate: number | null;
};

function rowToDrawer(row: Partial<BugDocument>, content?: BugContent | null): DrawerRow {
  return {
    key: row.key ?? "",
    title: row.title ?? "",
    project: row.project ?? "",
    module: row.module ?? "",
    iteration: row.iteration ?? "",
    defectUrl: row.defectUrl ?? "",
    severity: row.severity ?? "minor",
    priority: row.priority ?? "p2",
    status: row.status ?? "open",
    type: row.type ?? "functional",
    frequency: (row.frequency ?? "sometimes") as BugFrequency,
    assignee: row.assignee ?? "",
    reporter: row.reporter ?? "",
    environment: row.environment ?? "",
    affectedVersion: row.affectedVersion ?? "",
    fixedVersion: row.fixedVersion ?? "",
    tags: [...(row.tags ?? [])],
    dueDate: row.dueDate ?? null,
    description: content?.description ?? "",
    stepsToReproduce: content?.stepsToReproduce?.length ? content.stepsToReproduce.join("\n") : "",
    expectedResult: content?.expectedResult ?? "",
    actualResult: content?.actualResult ?? "",
    causeProblem: content?.causeProblem ?? "",
    solution: content?.solution ?? ""
  };
}

function payloadFromDrawer(params: any) {
  const { key, stepsToReproduce, dueDate, description, expectedResult, actualResult, causeProblem, solution, ...meta } = params;
  const steps = String(stepsToReproduce ?? "").split("\n").map((l: string) => l.trim()).filter(Boolean);
  return {
    meta: { ...meta, key, dueDate: dueDate ? Number(dueDate) : null },
    content: { description, stepsToReproduce: steps, expectedResult, actualResult, causeProblem, solution }
  };
}

async function openDrawer(title: string, row: Partial<BugDocument> = {}) {
  const isEdit = title === "Edit";
  let fetched: Awaited<ReturnType<typeof readBugContent>> | undefined;
  if (isEdit && row.contentPath) {
    try { fetched = await readBugContent(row.contentPath); } catch { /* metadata-only edit */ }
  }
  drawerRef.value?.acceptParams({
    title,
    isView: false,
    row: rowToDrawer(row, fetched),
    api: isEdit
      ? (params: any) => {
          const { meta, content } = payloadFromDrawer(params);
          return updateBug(params.key, meta, content);
        }
      : (params: any) => {
          const { meta, content } = payloadFromDrawer(params);
          return import("@/api/modules/bug").then(m => m.createBug(meta as any, content));
        },
    getTableList: () => reload()
  });
}

onMounted(() => {
  const id = route.params.id as string;
  if (id) store.loadDetail(id);
  if (!store.bugs.length) store.fetchBugs();
  window.addEventListener("keydown", onKeydown);
});
onBeforeUnmount(() => window.removeEventListener("keydown", onKeydown));

const currentIndex = computed(() => {
  if (!bug.value) return -1;
  return store.bugs.findIndex(b => b.key === bug.value?.key);
});

const prevBug = computed(() => {
  const idx = currentIndex.value;
  return idx > 0 ? store.bugs[idx - 1] : null;
});

const nextBug = computed(() => {
  const idx = currentIndex.value;
  return idx >= 0 && idx < store.bugs.length - 1 ? store.bugs[idx + 1] : null;
});

function goToBug(target: { key: string } | null) {
  if (!target?.key) return;
  router.push(`/code-review/bugs/detail/${target.key}`);
}

function onKeydown(e: KeyboardEvent) {
  const target = e.target as HTMLElement | null;
  const tag = target?.tagName;
  const inInput = tag === "INPUT" || tag === "TEXTAREA" || target?.isContentEditable === true;
  if (inInput) return;
  // skip when an overlay (dialog/drawer/select dropdown) is open — except for Esc, which closes the dialog
  const inOverlay = !!document.querySelector(".el-dialog:not(.is-hidden), .el-drawer:not(.is-hide), .el-select-dropdown:not([style*='display: none'])");
  if (e.key === "Escape") {
    if (showShortcuts.value) { e.preventDefault(); showShortcuts.value = false; return; }
    if (!inOverlay) { e.preventDefault(); back(); }
    return;
  }
  if (inOverlay) return;
  if (e.key === "?") { e.preventDefault(); showShortcuts.value = true; return; }
  if (!bug.value) return;
  const k = e.key.toLowerCase();
  if (k === "r") { e.preventDefault(); reload(); }
  else if (k === "e") { e.preventDefault(); openDrawer("Edit", bug.value); }
  else if (k === "j") { e.preventDefault(); if (nextBug.value) goToBug(nextBug.value); }
  else if (k === "k") { e.preventDefault(); if (prevBug.value) goToBug(prevBug.value); }
}
</script>

<style scoped lang="scss">
.bug-detail {
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  height: 100%;
  min-height: 0;
  padding: 16px;
  overflow: hidden;
  &__header {
    display: flex; flex-wrap: wrap; gap: 12px; align-items: center; justify-content: space-between;
    margin-bottom: 16px;
  }
  &__header-left { display: flex; gap: 8px; align-items: center; }
  &__header-right { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; }
  &__nav {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 2px 8px;
    background: var(--el-fill-color-light);
    border-radius: 6px;
    font-size: 12px;
  }
  &__nav-pos {
    font-variant-numeric: tabular-nums;
    color: var(--el-text-color-secondary);
    min-width: 50px;
    text-align: center;
  }
  &__kbd-hint {
    margin-left: 4px;
    font-size: 11px;
    color: var(--el-text-color-placeholder);
    kbd {
      display: inline-block;
      min-width: 16px;
      padding: 1px 5px;
      font-family: "SF Mono", "Menlo", monospace;
      font-size: 11px;
      color: var(--el-text-color-secondary);
      background: var(--el-fill-color);
      border: 1px solid var(--el-border-color-lighter);
      border-radius: 3px;
    }
  }
  &__breadcrumb {
    display: flex; gap: 6px; align-items: center; font-size: 13px;
    color: var(--el-text-color-secondary);
    & .el-icon { font-size: 12px; opacity: 0.6; }
  }
  &__breadcrumb-root, &__breadcrumb-current { font-family: ui-monospace, monospace; }
  &__breadcrumb-current { color: var(--el-text-color-primary); }
  &__body { display: flex; flex-direction: column; gap: 16px; flex: 1; min-height: 0; overflow-y: auto; }
  &__hero {
    display: flex;
    flex-wrap: wrap; gap: 24px; padding: 24px;
    background: var(--el-fill-color-light); border: 1px solid var(--el-border-color-lighter);
    border-radius: 12px;
  }
  &__hero-main { flex: 1 1 auto; min-width: 0; }
  &__hero-aside {
    display: flex;
    flex: 0 0 180px; flex-direction: column; gap: 4px; padding: 16px; color: var(--el-text-color-primary);
    background: var(--el-color-warning-light-9); border-radius: 8px;
    &--critical { background: var(--el-color-danger-light-9); }
    &--major { background: var(--el-color-warning-light-9); }
    &--minor { background: var(--el-color-info-light-9); }
    &--trivial { background: var(--el-fill-color-light); }
  }
  &__aside-label {
    font-size: 12px; color: var(--el-text-color-secondary);
    text-transform: uppercase; letter-spacing: 0.05em;
  }
  &__aside-value { font-size: 18px; font-weight: 600; }
  &__aside-divider { margin: 8px 0; }
  &__hero-keyline { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; margin-bottom: 8px; }
  &__key {
    display: inline-flex; gap: 4px; align-items: center;
    padding: 2px 8px;
    font-family: ui-monospace, monospace; font-size: 12px; color: var(--el-text-color-secondary);
    cursor: pointer; user-select: all;
    background: var(--el-fill-color); border-radius: 4px;
    &:hover { background: var(--el-fill-color-dark); }
  }
  &__key-icon { font-size: 12px; opacity: 0.6; }
  &__title { margin: 0 0 8px; font-size: 22px; font-weight: 600; line-height: 1.4; }
  &__summary { margin: 0 0 12px; font-size: 14px; line-height: 1.6; color: var(--el-text-color-regular); }
  &__hero-meta {
    display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
    gap: 8px 24px; margin: 0;
    div { display: flex; gap: 8px; font-size: 13px; }
    dt { min-width: 70px; margin: 0; color: var(--el-text-color-secondary); }
    dd { margin: 0; color: var(--el-text-color-primary); word-break: break-word; }
  }
  &__link { color: var(--el-color-primary); word-break: break-all; &:hover { text-decoration: underline; } }
  &__impact {
    display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
    gap: 12px; padding: 16px;
    background: var(--el-bg-color-page);
    border: 1px solid var(--el-border-color-lighter); border-radius: 8px;
  }
  &__impact-item { display: flex; gap: 12px; align-items: center; }
  &__impact-item .el-icon { font-size: 20px; color: var(--el-color-primary); }
  &__impact-label { font-size: 12px; color: var(--el-text-color-secondary); }
  &__impact-value { display: flex; flex-wrap: wrap; gap: 6px; align-items: center; font-size: 14px; }
  &__sla { margin-left: 4px; }
  &__timeline {
    padding-left: 8px;
    margin-top: 8px;
  }
  &__timeline-title { margin: 0; font-size: 14px; font-weight: 600; }
  &__timeline-note { margin: 4px 0 0; font-size: 12px; color: var(--el-text-color-secondary); }
  &__timeline-relative {
    margin: 2px 0 0;
    font-size: 11px;
    color: var(--el-text-color-placeholder);
    font-variant-numeric: tabular-nums;
  }
  &__copyable {
    cursor: pointer;
    &:hover {
      color: var(--el-color-primary);
    }
  }
  &__card {
    border-radius: 8px;
    :deep(.el-card__header) { padding: 12px 16px; }
    :deep(.el-card__header h3) { margin: 0; font-size: 15px; font-weight: 600; }
    &--resolved { border-left: 3px solid var(--el-color-success); }
  }
  &__card-header { display: flex; gap: 12px; align-items: center; justify-content: space-between; }
  &__card-header-acts { display: flex; gap: 8px; align-items: center; }
  &__content-section { padding: 4px 0; }
  &__content-section h4 {
    margin: 0 0 8px; font-size: 13px; font-weight: 600;
    color: var(--el-text-color-secondary); text-transform: uppercase; letter-spacing: 0.03em;
  }
  &__markdown {
    :deep(p) { margin: 0 0 8px; line-height: 1.6; }
    :deep(pre) { padding: 8px; overflow-x: auto; background: var(--el-fill-color-light); border-radius: 4px; }
    :deep(code) { font-family: ui-monospace, monospace; font-size: 13px; }
    :deep(ol), :deep(ul) { padding-left: 24px; margin: 0 0 8px; }
    :deep(a) { color: var(--el-color-primary); }
    &--expected { padding-left: 12px; border-left: 3px solid var(--el-color-success); }
    &--actual { padding-left: 12px; border-left: 3px solid var(--el-color-danger); }
  }
  &__steps { padding: 0; margin: 0;
    list-style: none;
    li {
      display: flex; gap: 12px; padding: 8px 0;
      border-bottom: 1px dashed var(--el-border-color-lighter);
      &:last-child { border-bottom: none; }
    }
  }
  &__step-num {
    display: flex;
    flex: 0 0 24px; align-items: center; justify-content: center; height: 24px;
    font-size: 12px; font-weight: 600; color: #ffffff;
    background: var(--el-color-primary); border-radius: 50%;
  }
  &__step-text { flex: 1; line-height: 1.6; word-break: break-word; }
  &__related-hint {
    margin: 0 0 12px; font-size: 13px; color: var(--el-text-color-secondary);
  }
  &__files {
    display: flex; flex-direction: column; gap: 4px; padding: 0; margin: 0;
    list-style: none;
    li {
      display: flex; gap: 8px; align-items: center;
      padding: 6px 8px; border-radius: 4px;
      &:hover { background: var(--el-fill-color-light); }
    }
  }
  &__file-li {
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 4px 8px;
    margin: 0 -8px;
    border-radius: 4px;
    transition: background 0.15s;
    &:hover {
      background: var(--el-fill-color-light);
    }
  }
  &__file-copy {
    margin-left: auto;
    font-size: 13px;
    color: var(--el-text-color-placeholder);
    opacity: 0.55;
    transition: opacity 0.15s, color 0.15s;
  }
  &__file-li:hover &__file-copy,
  &__file-li:focus-visible &__file-copy { opacity: 1; color: var(--el-color-primary); }
  &__file-icon { font-size: 14px; color: var(--el-color-primary); }
  &__file-path {
    font-family: ui-monospace, monospace; font-size: 13px;
    word-break: break-all;
  }
  &__files-actions { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 12px; }
  &__card--retro {
    background: var(--el-color-warning-light-9);
    border-left: 3px solid var(--el-color-warning-light-5);
    :deep(.el-card__body) { background: var(--el-bg-color); }
  }
  &__retro-intro {
    margin: 0 0 12px; font-size: 13px;
    font-style: italic; color: var(--el-text-color-secondary);
  }
  &__retro-grid { margin-bottom: 0; }
  &__retro-toggle {
    display: flex;
    align-items: center;
    gap: 8px;
    cursor: pointer;
    user-select: none;
    &:hover h3 { color: var(--el-color-primary); }
  }
  &__retro-chevron {
    transition: transform 0.2s;
    color: var(--el-text-color-secondary);
    &.is-reversed { transform: rotate(-90deg); }
  }
  &__retro-body {
    margin: 0; font-size: 14px; line-height: 1.6; color: var(--el-text-color-primary);
    &--lead { font-size: 15px; font-weight: 500; }
  }
  &__retro-components { padding: 0; margin: 0;
    list-style: none;
    li {
      display: flex; flex-wrap: wrap; gap: 8px; align-items: center;
      padding: 6px 0; border-bottom: 1px dashed var(--el-border-color-lighter);
      &:last-child { border-bottom: none; }
    }
  }
  &__retro-count {
    padding: 0 6px;
    font-size: 12px; color: var(--el-text-color-secondary); background: var(--el-fill-color-light); border-radius: 8px;
  }
  &__retro-file {
    padding: 1px 6px;
    font-family: ui-monospace, monospace; font-size: 12px; color: var(--el-text-color-regular);
    background: var(--el-fill-color-light); border-radius: 3px;
  }
  &__retro-more { font-size: 12px; color: var(--el-text-color-secondary); }
  &__retro-list { padding-left: 20px;
    margin: 0;
    li { margin-bottom: 6px; font-size: 14px; line-height: 1.6; }
  }
  &__retro-summary-row {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    align-items: center;
  }
  &__tags { display: flex; flex-wrap: wrap; gap: 6px; }
  &__content-path { padding: 2px 6px;
    font-family: ui-monospace, monospace; font-size: 13px; word-break: break-all;
    cursor: pointer; user-select: all;
    background: var(--el-fill-color-light); border-radius: 3px;
    &:hover { background: var(--el-fill-color); }
  }
  &__content-copy {
    font-size: 14px;
    color: var(--el-text-color-placeholder);
    vertical-align: middle;
    margin-left: 4px;
  }
  &__empty { color: var(--el-text-color-secondary); }
}
.bug-detail__shortcut-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
  li {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 6px 0;
    border-bottom: 1px dashed var(--el-border-color-lighter);
    &:last-child { border-bottom: none; }
    span { font-size: 14px; color: var(--el-text-color-regular); }
  }
  kbd {
    display: inline-block;
    min-width: 28px;
    padding: 2px 8px;
    font-family: "SF Mono", "Menlo", monospace;
    font-size: 12px;
    text-align: center;
    color: var(--el-text-color-primary);
    background: var(--el-fill-color);
    border: 1px solid var(--el-border-color);
    border-radius: 4px;
    box-shadow: 0 1px 0 var(--el-border-color-light);
  }
}
.prose {
  font-size: 14px; line-height: 1.6; color: var(--el-text-color-primary);
  word-break: break-word;
}
</style>