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
        <el-button v-if="bug" :icon="EditPen" @click="openDrawer('Edit', bug)">Edit</el-button>
        <el-button v-if="bug" :icon="Refresh" @click="reload">Reload</el-button>
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
              <div><dt>Project</dt><dd>{{ bug.project || "—" }}</dd></div>
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
            </el-timeline-item>
          </el-timeline>
          <el-empty v-else description="No lifecycle events" :image-size="60" />
        </el-card>

        <!-- Environment -->
        <el-card shadow="never" class="bug-detail__card">
          <template #header><h3>Environment &amp; Versions</h3></template>
          <el-descriptions :column="2" border>
            <el-descriptions-item label="Environment" :span="2">{{ bug.environment || "—" }}</el-descriptions-item>
            <el-descriptions-item label="Affected Version">{{ bug.affectedVersion || "—" }}</el-descriptions-item>
            <el-descriptions-item label="Fixed Version">{{ bug.fixedVersion || "—" }}</el-descriptions-item>
          </el-descriptions>
        </el-card>

        <!-- Reproduction -->
        <el-card shadow="never" class="bug-detail__card">
          <template #header><h3>Reproduction</h3></template>
          <section class="bug-detail__content-section">
            <h4>Description</h4>
            <div v-if="content?.description" class="bug-detail__markdown prose" v-html="renderMarkdown(content.description)"></div>
            <el-empty v-else description="No description" :image-size="60" />
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
            <el-empty v-else description="No steps recorded" :image-size="60" />
          </section>
          <el-row :gutter="16" class="bug-detail__row">
            <el-col :span="12">
              <section class="bug-detail__content-section">
                <h4>Expected Result</h4>
                <div v-if="content?.expectedResult" class="bug-detail__markdown bug-detail__markdown--expected prose" v-html="renderMarkdown(content.expectedResult)"></div>
                <el-empty v-else description="Not specified" :image-size="60" />
              </section>
            </el-col>
            <el-col :span="12">
              <section class="bug-detail__content-section">
                <h4>Actual Result</h4>
                <div v-if="content?.actualResult" class="bug-detail__markdown bug-detail__markdown--actual prose" v-html="renderMarkdown(content.actualResult)"></div>
                <el-empty v-else description="Not specified" :image-size="60" />
              </section>
            </el-col>
          </el-row>
        </el-card>

        <!-- Resolution -->
        <el-card shadow="never" class="bug-detail__card" :class="{ 'bug-detail__card--resolved': bug.status === 'resolved' || bug.status === 'closed' }">
          <template #header>
            <div class="bug-detail__card-header">
              <h3>Resolution</h3>
              <el-tag v-if="bug.resolvedAt" type="success" size="small">Resolved {{ formatTime(bug.resolvedAt) }}</el-tag>
            </div>
          </template>
          <section class="bug-detail__content-section">
            <h4>Root Cause</h4>
            <div v-if="content?.causeProblem" class="bug-detail__markdown prose" v-html="renderMarkdown(content.causeProblem)"></div>
            <el-empty v-else description="Root cause not yet recorded" :image-size="60" />
          </section>
          <el-divider />
          <section class="bug-detail__content-section">
            <h4>Solution</h4>
            <div v-if="content?.solution" class="bug-detail__markdown prose" v-html="renderMarkdown(content.solution)"></div>
            <el-empty v-else description="Solution not yet recorded" :image-size="60" />
          </section>
        </el-card>

        <!-- Related files (code-review) -->
        <el-card shadow="never" class="bug-detail__card">
          <template #header>
            <div class="bug-detail__card-header">
              <h3>Related Files</h3>
              <el-tag type="info" size="small">{{ relatedFiles.length }} detected</el-tag>
            </div>
          </template>
          <p v-if="relatedFiles.length" class="bug-detail__related-hint">
            File paths auto-extracted from the description, root cause, and solution. Push them to the aicr sidebar for deeper review.
          </p>
          <ul v-if="relatedFiles.length" class="bug-detail__files">
            <li v-for="f in relatedFiles" :key="f">
              <el-icon class="bug-detail__file-icon"><Document /></el-icon>
              <code class="bug-detail__file-path">{{ f }}</code>
            </li>
          </ul>
          <el-empty v-else description="No file paths detected in this bug's content" :image-size="60" />
          <div v-if="relatedFiles.length" class="bug-detail__files-actions">
            <el-button type="primary" :icon="Promotion" @click="pushToAicr">
              Send {{ relatedFiles.length }} file{{ relatedFiles.length === 1 ? "" : "s" }} to aicr
            </el-button>
            <el-button :icon="Link" @click="goToAicr">Open aicr page</el-button>
          </div>
        </el-card>

        <!-- Retrospective (auto-generated synthesis) -->
        <el-card shadow="never" class="bug-detail__card bug-detail__card--retro">
          <template #header>
            <div class="bug-detail__card-header">
              <h3>Retrospective</h3>
              <el-tag type="warning" size="small" effect="plain">auto-synthesised</el-tag>
            </div>
          </template>
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
            <p class="bug-detail__retro-body bug-detail__retro-body--lead">{{ retro.oneLiner }}</p>
          </section>
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
              <el-button size="small" text :icon="CopyDocument" @click="copyToClipboard(bug.contentPath, 'Path copied')" />
            </el-descriptions-item>
          </el-descriptions>
        </el-card>
      </template>

      <el-empty v-else-if="!store.detailLoading" description="Bug not found" />
    </div>

    <BugDrawer ref="drawerRef" />
  </div>
</template>

<script setup lang="ts" name="bugDetail">
import { computed, onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { ElMessage } from "element-plus";
import {
  ArrowLeft,
  ArrowRight,
  CircleCheck,
  Clock,
  CopyDocument,
  Document,
  EditPen,
  Link,
  Loading,
  Promotion,
  Refresh,
  Timer,
  Warning
} from "@element-plus/icons-vue";
import { useBugStore } from "@/stores/modules/bug";
import { useAicrFileTreeStore } from "@/stores/modules/aicr/fileTree";
import { useMarkdown } from "@/hooks/useMarkdown";
import { updateBug, readBugContent, type BugDocument, type BugContent, type BugSeverity, type BugPriority, type BugStatus, type BugType, type BugFrequency } from "@/api/modules/bug";
import BugDrawer from "./components/BugDrawer.vue";

const route = useRoute();
const router = useRouter();
const store = useBugStore();
const aicrFileTreeStore = useAicrFileTreeStore();
const { render: renderMarkdown } = useMarkdown();

const bug = computed(() => store.selectedBug);
const content = computed(() => store.selectedBugContent);

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
const FILE_PATH_RE = /\b((?:[A-Za-z0-9_-]+(?:\/|\\))+[A-Za-z0-9_.\-]+\.(?:py|ts|tsx|js|jsx|vue|json|md|yaml|yml|sh|css|scss))\b/g;

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
  FILE_PATH_RE.lastIndex = 0;
  while ((m = FILE_PATH_RE.exec(blob)) !== null) {
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

async function pushToAicr() {
  if (relatedFiles.value.length === 0) return;
  try {
    await aicrFileTreeStore.ensureFilesInTree(relatedFiles.value);
    aicrFileTreeStore.setPendingFilter(relatedFiles.value);
    aicrFileTreeStore.setPendingSelectKey(relatedFiles.value[0]);
    ElMessage.success(`Sent ${relatedFiles.value.length} file${relatedFiles.value.length === 1 ? "" : "s"} to aicr`);
    await router.push("/aicr");
  } catch (err) {
    console.error("Push to aicr failed:", err);
    ElMessage.error("Failed to send files to aicr");
  }
}

async function goToAicr() {
  await router.push("/aicr");
}

function back() {
  router.push("/bug/list");
}

function reload() {
  const id = route.params.id as string;
  if (id) store.loadDetail(id);
}

// Inline edit drawer — mirrors views/bug/index.vue's openDrawer flow.
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
});
</script>

<style scoped lang="scss">
.bug-detail {
  padding: 16px;
  &__header {
    display: flex; flex-wrap: wrap; gap: 12px; align-items: center; justify-content: space-between;
    margin-bottom: 16px;
  }
  &__header-left { display: flex; gap: 8px; align-items: center; }
  &__header-right { display: flex; gap: 8px; }
  &__breadcrumb {
    display: flex; gap: 6px; align-items: center; font-size: 13px;
    color: var(--el-text-color-secondary);
    & .el-icon { font-size: 12px; opacity: 0.6; }
  }
  &__breadcrumb-root, &__breadcrumb-current { font-family: ui-monospace, monospace; }
  &__breadcrumb-current { color: var(--el-text-color-primary); }
  &__body { display: flex; flex-direction: column; gap: 16px; min-height: 200px; }
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
  &__card {
    border-radius: 8px;
    :deep(.el-card__header) { padding: 12px 16px; }
    :deep(.el-card__header h3) { margin: 0; font-size: 15px; font-weight: 600; }
    &--resolved { border-left: 3px solid var(--el-color-success); }
  }
  &__card-header { display: flex; gap: 12px; align-items: center; justify-content: space-between; }
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
  &__tags { display: flex; flex-wrap: wrap; gap: 6px; }
  &__content-path { padding: 2px 6px;
    font-family: ui-monospace, monospace; font-size: 13px; word-break: break-all;
    cursor: pointer; user-select: all;
    background: var(--el-fill-color-light); border-radius: 3px;
  }
  &__empty { color: var(--el-text-color-secondary); }
}
.prose {
  font-size: 14px; line-height: 1.6; color: var(--el-text-color-primary);
  word-break: break-word;
}
</style>
