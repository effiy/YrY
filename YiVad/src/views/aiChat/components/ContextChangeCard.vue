<!--
  ContextChangeCard — renders an AI-proposed context file change inline within
  a pet message bubble. Shows the file path, a diff preview, and Apply/Reject
  buttons.

  States:
    proposed  → Apply / Reject buttons
    applying  → loading spinner
    applied   → green checkmark + "Applied" + Undo (5s)
    rejected  → grayed out + "Rejected"
    error     → red + error message

  Actions:
    create / update / delete  → file content change with diff
    addTag / removeTag        → ctx: tag management (no diff)
-->
<script setup lang="ts" name="aiChatContextChangeCard">
import { ref, computed, onBeforeUnmount } from "vue";
import { CircleCheck, CircleClose, Warning, Plus, Edit, Delete, Link, Remove, RefreshLeft, View } from "@element-plus/icons-vue";
import type { ContextChange } from "@/hooks/useContextChangeDetector";

const props = defineProps<{
  change: ContextChange;
  onApply: (path: string, content: string) => Promise<void>;
  onReject: (path: string) => void;
  onUndo?: (path: string) => void;
  onSaveToKB?: (path: string, content: string) => Promise<void>;
}>();

// ── State machine ──

type CardState = "proposed" | "confirming" | "applying" | "applied" | "rejected" | "error";
const state = ref<CardState>("proposed");
const errorMsg = ref("");

// Undo timer — show undo button for 5 seconds after applying
const showUndo = ref(false);
let undoTimer: ReturnType<typeof setTimeout> | null = null;
// KB save state
const kbSaved = ref(false);
const savingToKB = ref(false);
const kbError = ref("");
// Confirmation timer for destructive ops
let confirmTimer: ReturnType<typeof setTimeout> | null = null;
onBeforeUnmount(() => {
  if (undoTimer) clearTimeout(undoTimer);
  if (confirmTimer) clearTimeout(confirmTimer);
});

const isDestructive = computed(() =>
  props.change.action === "delete" || props.change.action === "removeTag"
);

// ── Icons & labels ──

const isTagAction = computed(() =>
  props.change.action === "addTag" || props.change.action === "removeTag"
);

const isKBWrite = computed(() =>
  props.change.action === "saveToKB"
);

const isViewAction = computed(() => props.change.action === "view");

const actionIcon = computed(() => {
  if (props.change.action === "create") return Plus;
  if (props.change.action === "delete") return Delete;
  if (props.change.action === "addTag") return Link;
  if (props.change.action === "removeTag") return Remove;
  if (props.change.action === "view") return View;
  if (props.change.action === "saveToKB") return Plus;
  return Edit;
});

const actionLabel = computed(() => {
  if (props.change.action === "create") return "New file";
  if (props.change.action === "delete") return "Delete";
  if (props.change.action === "addTag") return "Add to context";
  if (props.change.action === "removeTag") return "Remove";
  if (props.change.action === "view") return "View";
  if (props.change.action === "saveToKB") return "Save to KB";
  return "Update";
});

const actionColor = computed(() => {
  if (props.change.action === "create" || props.change.action === "addTag" || props.change.action === "saveToKB") return "var(--el-color-success)";
  if (props.change.action === "delete" || props.change.action === "removeTag") return "var(--el-color-danger)";
  if (props.change.action === "view") return "var(--el-color-primary)";
  return "var(--el-color-warning)";
});

// ── Diff ──

interface DiffLine {
  type: "add" | "remove" | "context" | "hunk";
  text: string;
  oldLine?: number;
  newLine?: number;
}

interface DiffHunk {
  oldStart: number;
  oldCount: number;
  newStart: number;
  newCount: number;
  lines: DiffLine[];
}

const diffHunks = computed<DiffHunk[]>(() => {
  if (isTagAction.value) return [];
  if (props.change.action === "create") {
    const lines = props.change.content.split("\n");
    if (!lines.length || (lines.length === 1 && !lines[0])) return [];
    return [{
      oldStart: 0, oldCount: 0, newStart: 1, newCount: lines.length,
      lines: lines.map(text => ({ type: "add" as const, text }))
    }];
  }
  if (props.change.action === "delete") {
    const lines = (props.change.originalContent || "").split("\n");
    if (!lines.length || (lines.length === 1 && !lines[0])) return [];
    return [{
      oldStart: 1, oldCount: lines.length, newStart: 0, newCount: 0,
      lines: lines.map(text => ({ type: "remove" as const, text }))
    }];
  }
  // Update: compute LCS-based diff with context
  const oldLines = (props.change.originalContent || "").split("\n");
  const newLines = (props.change.content || "").split("\n");
  return computeHunks(oldLines, newLines);
});

/**
 * Compute diff hunks using proper LCS with context window.
 * Each hunk shows 3 lines of unchanged context around changes.
 */
function computeHunks(oldLines: string[], newLines: string[]): DiffHunk[] {
  const CONTEXT = 3;
  const lcs = computeLCS(oldLines, newLines);

  // Build edit script
  interface EditOp {
    type: "context" | "remove" | "add";
    oldIdx?: number;
    newIdx?: number;
    text: string;
  }
  const edits: EditOp[] = [];
  let oi = 0;
  let ni = 0;

  for (const [lo, ln] of lcs) {
    // Lines in old before this match → remove
    while (oi < lo) {
      edits.push({ type: "remove", oldIdx: oi, text: oldLines[oi] });
      oi++;
    }
    // Lines in new before this match → add
    while (ni < ln) {
      edits.push({ type: "add", newIdx: ni, text: newLines[ni] });
      ni++;
    }
    // Matching line
    edits.push({ type: "context", oldIdx: oi, newIdx: ni, text: oldLines[oi] });
    oi++;
    ni++;
  }
  // Trailing removes
  while (oi < oldLines.length) {
    edits.push({ type: "remove", oldIdx: oi, text: oldLines[oi] });
    oi++;
  }
  // Trailing adds
  while (ni < newLines.length) {
    edits.push({ type: "add", newIdx: ni, text: newLines[ni] });
    ni++;
  }

  // If nothing changed, show empty
  const hasChanges = edits.some(e => e.type !== "context");
  if (!hasChanges) return [];

  // Group into hunks with context windows
  const hunks: DiffHunk[] = [];
  let current: DiffLine[] = [];
  let oldStart = 1;
  let newStart = 1;

  for (let i = 0; i < edits.length; i++) {
    const e = edits[i];
    const line: DiffLine = {
      type: e.type,
      text: e.text,
      oldLine: e.oldIdx != null ? e.oldIdx + 1 : undefined,
      newLine: e.newIdx != null ? e.newIdx + 1 : undefined
    };

    if (e.type !== "context") {
      // Include context before change
      if (current.length === 0) {
        // Collect up to CONTEXT lines before
        let ctxBefore: DiffLine[] = [];
        for (let j = Math.max(0, i - CONTEXT); j < i; j++) {
          if (edits[j].type === "context") {
            const ce = edits[j];
            ctxBefore.push({
              type: "context",
              text: ce.text,
              oldLine: (ce.oldIdx ?? 0) + 1,
              newLine: (ce.newIdx ?? 0) + 1
            });
          }
        }
        current.push(...ctxBefore);
        oldStart = current[0]?.oldLine ?? 1;
        newStart = current[0]?.newLine ?? 1;
      }
      current.push(line);
    } else {
      if (current.length > 0) {
        // Include up to CONTEXT context lines after last change
        const changeEnd = i;
        let ctxAfter = 0;
        while (i < edits.length && edits[i].type === "context" && ctxAfter < CONTEXT) {
          const ce = edits[i];
          current.push({
            type: "context",
            text: ce.text,
            oldLine: (ce.oldIdx ?? 0) + 1,
            newLine: (ce.newIdx ?? 0) + 1
          });
          ctxAfter++;
          i++;
        }
        i--; // back up, outer loop will advance

        // Calculate hunk stats
        const oldLines_ = current.filter(l => l.type === "remove" || l.type === "context");
        const newLines_ = current.filter(l => l.type === "add" || l.type === "context");
        const hunk: DiffHunk = {
          oldStart,
          oldCount: oldLines_.length,
          newStart,
          newCount: newLines_.length,
          lines: current
        };
        hunks.push(hunk);
        current = [];
      }
    }
  }

  // Flush trailing
  if (current.length > 0) {
    const oldLines_ = current.filter(l => l.type === "remove" || l.type === "context");
    const newLines_ = current.filter(l => l.type === "add" || l.type === "context");
    hunks.push({
      oldStart,
      oldCount: oldLines_.length,
      newStart,
      newCount: newLines_.length,
      lines: current
    });
  }

  return hunks;
}

/** Longest common subsequence — returns array of [oldIdx, newIdx] pairs. */
function computeLCS(a: string[], b: string[]): Array<[number, number]> {
  const m = a.length;
  const n = b.length;
  // Store lengths only, backtrack to get pairs
  const dp: number[][] = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (a[i - 1] === b[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1;
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
      }
    }
  }
  // Backtrack
  const result: Array<[number, number]> = [];
  let i = m;
  let j = n;
  while (i > 0 && j > 0) {
    if (a[i - 1] === b[j - 1]) {
      result.unshift([i - 1, j - 1]);
      i--;
      j--;
    } else if (dp[i - 1][j] >= dp[i][j - 1]) {
      i--;
    } else {
      j--;
    }
  }
  return result;
}

const hasDiff = computed(() => diffHunks.value.length > 0);

// Collapse long diffs
const COLLAPSE_LIMIT = 30;
const expanded = ref(false);
const totalDiffLines = computed(() => diffHunks.value.reduce((s, h) => s + h.lines.length, 0));
const showExpandToggle = computed(() => totalDiffLines.value > COLLAPSE_LIMIT);

// ── Actions ──

function enterConfirming() {
  state.value = "confirming";
  confirmTimer = setTimeout(() => {
    state.value = "proposed";
  }, 3000);
}

function cancelConfirming() {
  state.value = "proposed";
  if (confirmTimer) clearTimeout(confirmTimer);
}

async function handleApply() {
  if (isDestructive.value && state.value !== "confirming") {
    enterConfirming();
    return;
  }
  state.value = "applying";
  try {
    await props.onApply(props.change.path, props.change.content);
    state.value = "applied";
    showUndo.value = true;
    undoTimer = setTimeout(() => { showUndo.value = false; }, 5000);
  } catch (e: any) {
    state.value = "error";
    errorMsg.value = e?.message || "Failed to apply change";
  }
}

function handleReject() {
  state.value = "rejected";
  if (confirmTimer) clearTimeout(confirmTimer);
  props.onReject(props.change.path);
}

function handleUndo() {
  if (props.onUndo) {
    props.onUndo(props.change.path);
    state.value = "proposed";
    showUndo.value = false;
    if (undoTimer) clearTimeout(undoTimer);
  }
}

async function handleSaveToKB() {
  if (!props.onSaveToKB || savingToKB.value) return;
  savingToKB.value = true;
  kbError.value = "";
  try {
    await props.onSaveToKB(props.change.path, props.change.content);
    kbSaved.value = true;
  } catch (e: any) {
    kbError.value = e?.message || "Failed to save to knowledge base";
  } finally {
    savingToKB.value = false;
  }
}
</script>

<template>
  <div
    class="ccc-card"
    :class="{
      'ccc-card--applied': state === 'applied',
      'ccc-card--rejected': state === 'rejected',
      'ccc-card--error': state === 'error',
      'ccc-card--delete': change.action === 'delete' || change.action === 'removeTag',
      'ccc-card--tag': isTagAction
    }"
  >
    <!-- Header -->
    <div class="ccc-header">
      <el-icon :size="16" :color="actionColor"><component :is="actionIcon" /></el-icon>
      <span class="ccc-path">{{ change.path }}</span>
      <span class="ccc-badge" :style="{ color: actionColor, borderColor: actionColor }">
        {{ actionLabel }}
      </span>
    </div>

    <!-- View action: show file content preview -->
    <div v-if="isViewAction && state !== 'rejected'" class="ccc-view-content">
      <div v-if="change.originalContent" class="ccc-diff">
        <div v-for="(line, li) in change.originalContent.split('\n').slice(0, 40)" :key="li" class="ccc-diff-line ccc-diff-line--context">
          <span class="ccc-diff-num">{{ li + 1 }}</span>
          <span class="ccc-diff-text">{{ line }}</span>
        </div>
        <div v-if="change.originalContent.split('\n').length > 40" class="ccc-expand-btn">
          ... {{ change.originalContent.split('\n').length - 40 }} more lines
        </div>
      </div>
      <div v-else class="ccc-nochange">
        <el-icon :size="14"><Warning /></el-icon>
        <span>File not found in current context</span>
      </div>
    </div>

    <!-- Tag action description -->
    <div v-if="isTagAction && state !== 'rejected'" class="ccc-tag-desc">
      <el-icon v-if="change.action === 'addTag'" :size="14"><Plus /></el-icon>
      <el-icon v-else :size="14"><Delete /></el-icon>
      <span>{{ change.action === 'addTag' ? 'Add file to session context' : 'Remove file from session context' }}</span>
    </div>

    <!-- Diff body with hunk headers -->
    <div v-if="hasDiff && !isTagAction && state !== 'rejected'" class="ccc-diff">
      <template v-for="(hunk, hi) in diffHunks" :key="hi">
        <div class="ccc-hunk-header">
          @@ -{{ hunk.oldStart }},{{ hunk.oldCount }} +{{ hunk.newStart }},{{ hunk.newCount }} @@
        </div>
        <div
          v-for="(line, li) in (expanded || !showExpandToggle ? hunk.lines : hunk.lines.slice(0, Math.floor(COLLAPSE_LIMIT / diffHunks.length)))"
          :key="`${hi}-${li}`"
          class="ccc-diff-line"
          :class="`ccc-diff-line--${line.type}`"
        >
          <span class="ccc-diff-prefix">{{ line.type === "add" ? "+" : line.type === "remove" ? "−" : " " }}</span>
          <span class="ccc-diff-num" v-if="line.oldLine">{{ line.oldLine }}</span>
          <span class="ccc-diff-num" v-if="line.newLine">{{ line.newLine }}</span>
          <span class="ccc-diff-text">{{ line.text }}</span>
        </div>
      </template>
      <el-button
        v-if="showExpandToggle && !expanded"
        size="small"
        text
        class="ccc-expand-btn"
        @click="expanded = true"
      >
        Show all {{ totalDiffLines }} lines...
      </el-button>
    </div>

    <!-- Delete warning -->
    <div v-if="(change.action === 'delete' || change.action === 'removeTag') && state !== 'rejected'" class="ccc-delete-warning">
      <el-icon :size="14"><Warning /></el-icon>
      <span>{{ change.action === 'removeTag' ? 'This will unlink the file from this session' : 'This will remove the file from the session context' }}</span>
    </div>

    <!-- No changes indicator -->
    <div v-if="!hasDiff && !isTagAction && change.action === 'update' && state !== 'rejected'" class="ccc-nochange">
      <el-icon :size="14"><CircleCheck /></el-icon>
      <span>No changes detected — content is identical</span>
    </div>

    <!-- Status feedback -->
    <div v-if="state === 'applied'" class="ccc-status ccc-status--ok">
      <el-icon :size="14"><CircleCheck /></el-icon>
      <span>Applied</span>
      <el-button
        v-if="onSaveToKB && (change.action === 'create' || change.action === 'update' || change.action === 'saveToKB') && !kbSaved"
        size="small"
        text
        type="success"
        :loading="savingToKB"
        class="ccc-kb-btn"
        @click="handleSaveToKB"
      >
        {{ savingToKB ? 'Saving...' : 'Save to KB' }}
      </el-button>
      <span v-if="kbSaved" class="ccc-kb-saved">
        <el-icon :size="14"><CircleCheck /></el-icon>
        KB ✓
      </span>
      <span v-if="kbError" class="ccc-kb-error">{{ kbError }}</span>
      <el-button v-if="showUndo && onUndo" size="small" text :icon="RefreshLeft" class="ccc-undo-btn" @click="handleUndo">
        Undo
      </el-button>
    </div>
    <div v-if="state === 'rejected'" class="ccc-status ccc-status--skip">
      <el-icon :size="14"><CircleClose /></el-icon>
      <span>Rejected</span>
    </div>
    <div v-if="state === 'error'" class="ccc-status ccc-status--err">
      <el-icon :size="14"><CircleClose /></el-icon>
      <span>{{ errorMsg }}</span>
    </div>

    <!-- Actions: KB write (saveToKB) — direct save to knowledge base -->
    <div v-if="state === 'proposed' && isKBWrite && onSaveToKB" class="ccc-actions">
      <el-button size="small" type="success" :loading="savingToKB" @click="handleSaveToKB">
        {{ savingToKB ? 'Saving...' : 'Save to Knowledge Base' }}
      </el-button>
      <el-button size="small" text @click="handleReject">
        Dismiss
      </el-button>
    </div>
    <!-- Actions: normal (non-destructive, non-view) -->
    <div v-if="state === 'proposed' && !isViewAction && !isDestructive && !isKBWrite" class="ccc-actions">
      <el-button size="small" type="primary" @click="handleApply">
        Apply
      </el-button>
      <el-button size="small" text @click="handleReject">
        Reject
      </el-button>
    </div>
    <!-- Actions: destructive — first click enters confirming, second confirms -->
    <div v-if="(state === 'proposed' || state === 'confirming') && isDestructive" class="ccc-actions">
      <el-button
        size="small"
        :type="state === 'confirming' ? 'danger' : 'primary'"
        @click="handleApply"
      >
        {{ state === 'confirming' ? 'Confirm?' : (change.action === 'delete' ? 'Delete' : 'Remove') }}
      </el-button>
      <el-button v-if="state === 'confirming'" size="small" text @click="cancelConfirming">
        Cancel
      </el-button>
      <el-button v-else size="small" text @click="handleReject">
        Reject
      </el-button>
    </div>
    <!-- View action: just dismiss -->
    <div v-if="state === 'proposed' && isViewAction" class="ccc-actions">
      <el-button size="small" text @click="handleReject">
        Dismiss
      </el-button>
    </div>
  </div>
</template>

<style scoped lang="scss">
.ccc-card {
  margin-top: 8px;
  margin-bottom: 4px;
  overflow: hidden;
  font-size: 13px;
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color);
  border-radius: 8px;
  transition: border-color 0.2s, opacity 0.2s;
}
.ccc-card--applied { border-color: var(--el-color-success-light-5); opacity: 0.85; }
.ccc-card--rejected { opacity: 0.5; }
.ccc-card--error { border-color: var(--el-color-danger-light-5); }
.ccc-card--delete { border-color: var(--el-color-danger-light-7); }
.ccc-card--tag { border-color: var(--el-color-primary-light-5); }

.ccc-header {
  display: flex; gap: 6px; align-items: center;
  padding: 8px 10px;
  background: var(--el-fill-color-light);
  border-bottom: 1px solid var(--el-border-color-lighter);
}

.ccc-path {
  flex: 1; min-width: 0; overflow: hidden;
  font-family: "SF Mono", Menlo, monospace;
  font-size: 12px; font-weight: 600;
  color: var(--el-text-color-primary);
  text-overflow: ellipsis; white-space: nowrap;
}

.ccc-badge {
  flex-shrink: 0;
  padding: 1px 8px;
  font-size: 10px; font-weight: 700;
  text-transform: uppercase; letter-spacing: 0.5px;
  border: 1px solid; border-radius: 10px;
}

.ccc-tag-desc {
  display: flex; gap: 6px; align-items: center;
  padding: 8px 10px;
  font-size: 12px; color: var(--el-text-color-regular);
}

.ccc-diff {
  max-height: 300px; overflow-y: auto;
  font-family: "SF Mono", Menlo, monospace;
  font-size: 12px; line-height: 1.5;
}

.ccc-hunk-header {
  padding: 2px 10px;
  font-size: 11px; font-weight: 600;
  color: var(--el-color-primary);
  background: var(--el-color-primary-light-9);
}

.ccc-diff-line {
  display: flex; gap: 4px;
  padding: 1px 10px;
}
.ccc-diff-line--add { color: var(--el-color-success-dark-2); background: var(--el-color-success-light-9); }
.ccc-diff-line--remove { color: var(--el-color-danger-dark-2); background: var(--el-color-danger-light-9); }
.ccc-diff-line--context { color: var(--el-text-color-placeholder); }

.ccc-diff-prefix {
  flex-shrink: 0; width: 14px;
  font-weight: 700; text-align: center; user-select: none;
}

.ccc-diff-num {
  flex-shrink: 0; width: 36px;
  font-size: 11px; text-align: right; user-select: none;
  color: var(--el-text-color-placeholder);
}

.ccc-diff-text { white-space: pre-wrap; word-break: break-all; }

.ccc-expand-btn {
  width: 100%; padding: 6px;
  font-size: 11px; color: var(--el-text-color-secondary); border-radius: 0;
}

.ccc-delete-warning {
  display: flex; gap: 6px; align-items: center;
  padding: 8px 10px;
  font-size: 12px; color: var(--el-color-danger);
}

.ccc-nochange {
  display: flex; gap: 6px; align-items: center;
  padding: 8px 10px;
  font-size: 12px; color: var(--el-text-color-placeholder);
}

.ccc-status {
  display: flex; gap: 4px; align-items: center;
  padding: 6px 10px;
  font-size: 12px; font-weight: 600;
}
.ccc-status--ok { color: var(--el-color-success); }
.ccc-status--skip { color: var(--el-text-color-placeholder); }
.ccc-status--err { color: var(--el-color-danger); }

.ccc-undo-btn {
  margin-left: auto; padding: 2px 8px;
  font-size: 12px;
}
.ccc-kb-btn {
  margin-left: 4px; padding: 2px 8px;
  font-size: 11px;
}
.ccc-kb-saved {
  display: inline-flex; gap: 3px; align-items: center;
  margin-left: 4px;
  font-size: 11px; font-weight: 600;
  color: var(--el-color-success);
}
.ccc-kb-error {
  margin-left: 4px;
  font-size: 11px; color: var(--el-color-danger);
}

.ccc-actions {
  display: flex; gap: 6px;
  padding: 8px 10px;
  border-top: 1px solid var(--el-border-color-lighter);
}
</style>
