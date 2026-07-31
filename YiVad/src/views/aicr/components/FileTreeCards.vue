<script setup lang="ts" name="aicrFileTreeCards">
import { computed, onMounted, onBeforeUnmount, ref } from "vue";
import { ElMessageBox, ElMessage } from "element-plus";
import { CaretRight, Delete, DocumentCopy, Edit, MagicStick, Plus, Star, StarFilled } from "@element-plus/icons-vue";
import { useAicrFileTreeStore } from "@/stores/modules/aicr/fileTree";
import { useAicrSessionStore } from "@/stores/modules/aicr/sessions";
import { useAicrChatStore } from "@/stores/modules/aicr/chat";
import { useAicrUiStore, type CardDensity, type CardSortBy } from "@/stores/modules/aicr/ui";
import type { FileNode } from "@/stores/modules/aicr/fileTree";
import type { TagKind } from "@/api/interface/yiweb";

const fileTreeStore = useAicrFileTreeStore();
const sessionStore = useAicrSessionStore();
const chatStore = useAicrChatStore();
const uiStore = useAicrUiStore();

const emit = defineEmits<{
  (e: "new-file"): void;
}>();

defineProps<{ fullWidth?: boolean }>();

const GROUP_CAP = 50;

// ── Grouping + sorting ──
function sortFiles(files: FileNode[]): FileNode[] {
  const by = uiStore.cardSortBy;
  const arr = [...files];
  if (by === "updated") {
    arr.sort((a, b) => (b.session?.updatedAt ?? 0) - (a.session?.updatedAt ?? 0));
  } else if (by === "name") {
    arr.sort((a, b) => a.name.localeCompare(b.name, "zh-CN"));
  } else {
    arr.sort((a, b) => (b.session?.messages?.length ?? 0) - (a.session?.messages?.length ?? 0));
  }
  return arr;
}

const grouped = computed(() => {
  const groups = new Map<string, FileNode[]>();
  // `flatFilteredFiles` includes folder nodes too (flattenTree walks both
  // folders and files). Folders have `session === undefined` and would render
  // as phantom cards alongside the real file cards — skip them.
  for (const f of fileTreeStore.flatFilteredFiles) {
    if (f.type !== "file") continue;
    const parts = f.key.split("/").filter(Boolean);
    const story = parts.length > 1 ? parts[0] : "(root)";
    if (!groups.has(story)) groups.set(story, []);
    groups.get(story)!.push(f);
  }
  return [...groups.entries()]
    .map(([story, files]) => ({ story, files: sortFiles(files) }))
    .sort((a, b) => a.story.localeCompare(b.story, "zh-CN"));
});

const groupNames = computed(() => grouped.value.map(g => g.story));
const allCollapsed = computed(() => grouped.value.length > 0 && grouped.value.every(g => uiStore.collapsedGroups.has(g.story)));

function toggleAllGroups() {
  if (allCollapsed.value) uiStore.expandAllGroups();
  else uiStore.collapseAllGroups(groupNames.value);
}

// Per-group cap expansion (local state — not persisted across reloads)
const expandedGroupCaps = ref<Set<string>>(new Set());
function toggleGroupCap(story: string) {
  const s = new Set(expandedGroupCaps.value);
  if (s.has(story)) s.delete(story);
  else s.add(story);
  expandedGroupCaps.value = s;
}

function visibleFiles(g: { story: string; files: FileNode[] }): FileNode[] {
  if (expandedGroupCaps.value.has(g.story) || g.files.length <= GROUP_CAP) return g.files;
  return g.files.slice(0, GROUP_CAP);
}

// ── Sort + density options ──
const sortOptions: { label: string; value: CardSortBy }[] = [
  { label: "Updated", value: "updated" },
  { label: "Name", value: "name" },
  { label: "Messages", value: "messages" }
];

const densityOptions: { label: string; value: CardDensity }[] = [
  { label: "Compact", value: "compact" },
  { label: "Comfortable", value: "comfortable" },
  { label: "Spacious", value: "spacious" }
];

// ── Inline description edit ──
const editingKey = ref<string | null>(null);
const editingDescription = ref("");

function startEditDescription(key: string, currentDesc: string) {
  editingKey.value = key;
  editingDescription.value = currentDesc;
}

async function saveDescription(key: string) {
  await sessionStore.updateSession(key, { pageDescription: editingDescription.value });
  if (chatStore.activeSession?.key === key) {
    chatStore.activeSession = { ...chatStore.activeSession, pageDescription: editingDescription.value };
  }
  editingKey.value = null;
}

function cancelEditDescription() {
  editingKey.value = null;
  editingDescription.value = "";
}

// ── Inline rename ──
const renamingKey = ref<string | null>(null);
const renamingName = ref("");

function startRename(node: FileNode) {
  renamingKey.value = node.key;
  renamingName.value = node.name;
}

async function saveRename(key: string) {
  const name = renamingName.value.trim();
  if (!name) return;
  const wasRenaming = renamingKey.value;
  renamingKey.value = null;
  if (wasRenaming === key && name !== (fileTreeStore.flatFiles.find(f => f.key === key)?.name ?? "")) {
    await fileTreeStore.renameNode(key, name, false);
    ElMessage.success("Renamed");
  }
}

function cancelRename() {
  renamingKey.value = null;
  renamingName.value = "";
}

// ── AI-generated description ──
const aiLoadingKey = ref<string | null>(null);

async function generateDescription(f: FileNode) {
  if (!f.session) return;
  aiLoadingKey.value = f.key;
  try {
    const desc = await sessionStore.generateDescription(f.key, f.session.title, f.session.url);
    if (desc) {
      await sessionStore.updateSession(f.key, { pageDescription: desc });
      if (chatStore.activeSession?.key === f.key) {
        chatStore.activeSession = { ...chatStore.activeSession, pageDescription: desc };
      }
      ElMessage.success("Description generated");
    }
  } catch (e: any) {
    ElMessage.error(e?.message || "Failed to generate description");
  } finally {
    aiLoadingKey.value = null;
  }
}

// ── Delete ──
async function deleteNode(f: FileNode) {
  try {
    await ElMessageBox.confirm(`Delete ${f.name}? This cannot be undone.`, "Confirm Delete", {
      type: "warning",
      confirmButtonText: "Delete",
      cancelButtonText: "Cancel"
    });
  } catch {
    return;
  }
  await fileTreeStore.deleteNode(f.key, false);
  ElMessage.success("Deleted");
}

async function copyPath(f: FileNode) {
  try {
    await navigator.clipboard.writeText(f.key);
    ElMessage.success("Path copied");
  } catch {
    ElMessage.warning("Clipboard unavailable");
  }
}

// ── Collapsible description + tags ──
const expandedDesc = ref<Set<string>>(new Set());
const expandedTags = ref<Set<string>>(new Set());

function toggleDescExpand(key: string) {
  const s = new Set(expandedDesc.value);
  if (s.has(key)) s.delete(key);
  else s.add(key);
  expandedDesc.value = s;
}

function toggleTagsExpand(key: string) {
  const s = new Set(expandedTags.value);
  if (s.has(key)) s.delete(key);
  else s.add(key);
  expandedTags.value = s;
}

// ── TagKind coloring ──
const TAG_KIND_COLORS: Record<TagKind, string> = {
  skills: "success",
  templates: "primary",
  rules: "warning",
  agents: "danger"
};

function tagType(tag: string): string {
  return TAG_KIND_COLORS[tag as TagKind] ?? "info";
}

// ── Time formatting ──
function relativeTime(ts?: number): string {
  if (!ts) return "";
  const diff = Date.now() - ts;
  if (diff < 60_000) return "just now";
  if (diff < 3600_000) return `${Math.floor(diff / 60_000)}m ago`;
  if (diff < 86_400_000) return `${Math.floor(diff / 3600_000)}h ago`;
  return `${Math.floor(diff / 86_400_000)}d ago`;
}

function shortDate(ts?: number): string {
  if (!ts) return "";
  const d = new Date(ts);
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const hh = String(d.getHours()).padStart(2, "0");
  const mi = String(d.getMinutes()).padStart(2, "0");
  return `${mm}-${dd} ${hh}:${mi}`;
}

function messageCount(f: FileNode): number {
  return f.session?.messages?.length ?? 0;
}

function cardTags(f: FileNode): string[] {
  return f.session?.tags ?? [];
}

// ── Preview strip (selected card only — reuses already-loaded content) ──
function previewLines(f: FileNode): string {
  if (f.key !== fileTreeStore.selectedKey) return "";
  const content = fileTreeStore.currentFileContent;
  if (!content) return "";
  return content.split("\n").slice(0, 3).join("\n");
}

// ── Context menu ──
const ctxMenu = ref<{ open: boolean; x: number; y: number; target: FileNode | null }>({
  open: false,
  x: 0,
  y: 0,
  target: null
});

function openCtxMenu(e: MouseEvent, f: FileNode) {
  e.preventDefault();
  ctxMenu.value = { open: true, x: e.clientX, y: e.clientY, target: f };
}

function closeCtxMenu() {
  ctxMenu.value.open = false;
  ctxMenu.value.target = null;
}

async function ctxAction(action: "favorite" | "rename" | "ai" | "copy" | "delete") {
  const f = ctxMenu.value.target;
  closeCtxMenu();
  if (!f) return;
  if (action === "favorite") await sessionStore.toggleFavorite(f.key);
  else if (action === "rename") startRename(f);
  else if (action === "ai") await generateDescription(f);
  else if (action === "copy") await copyPath(f);
  else if (action === "delete") await deleteNode(f);
}

// ── Click + select ──
function onCardClick(f: FileNode) {
  fileTreeStore.selectFile(f.key);
}

// Close context menu on outside click / Escape
function onGlobalClick(e: MouseEvent) {
  if (!ctxMenu.value.open) return;
  const el = e.target as HTMLElement;
  if (!el.closest(".ft-ctx-menu")) closeCtxMenu();
}

function onGlobalKeydown(e: KeyboardEvent) {
  if (e.key === "Escape" && ctxMenu.value.open) closeCtxMenu();
}

onMounted(() => {
  window.addEventListener("click", onGlobalClick);
  window.addEventListener("keydown", onGlobalKeydown);
});
onBeforeUnmount(() => {
  window.removeEventListener("click", onGlobalClick);
  window.removeEventListener("keydown", onGlobalKeydown);
});

const hasFiles = computed(() => fileTreeStore.flatFiles.length > 0);
const hasFiltered = computed(() => fileTreeStore.flatFilteredFiles.length > 0);
</script>

<template>
  <div class="ft-cards" :class="[`is-${uiStore.cardDensity}`, { 'is-full-width': fullWidth }]">
    <!-- Toolbar -->
    <div v-if="hasFiltered && !fileTreeStore.loading" class="ft-cards-toolbar">
      <el-select
        :model-value="uiStore.cardSortBy"
        size="small"
        style="width: 130px"
        @update:model-value="(v: any) => uiStore.setCardSortBy(v)"
      >
        <el-option v-for="o in sortOptions" :key="o.value" :label="o.label" :value="o.value" />
      </el-select>
      <el-segmented
        :model-value="uiStore.cardDensity"
        @update:model-value="(v: any) => uiStore.setCardDensity(v)"
        :options="densityOptions"
      />
      <el-button
        size="small"
        :title="allCollapsed ? 'Expand all groups' : 'Collapse all groups'"
        @click="toggleAllGroups"
      >{{ allCollapsed ? "Expand all" : "Collapse all" }}</el-button>
    </div>

    <div class="ft-cards-scroll">
      <!-- Loading: card-grid-shaped skeletons -->
      <div v-if="fileTreeStore.loading" class="ft-card-grid ft-skeleton-grid">
        <div v-for="i in 8" :key="i" class="ft-skel-card">
          <el-skeleton :rows="3" animated />
        </div>
      </div>
      <el-alert v-else-if="fileTreeStore.error" :title="fileTreeStore.error" type="error" show-icon />
      <!-- Empty: no files at all -->
      <el-empty v-else-if="!hasFiles" description="No files yet">
        <el-button type="primary" :icon="Plus" @click="emit('new-file')">New file</el-button>
      </el-empty>
      <!-- Empty: filtered to nothing -->
      <el-empty
        v-else-if="!hasFiltered"
        :description="`No files match '${fileTreeStore.searchQuery}'`"
      >
        <el-button @click="fileTreeStore.searchQuery = ''">Clear search</el-button>
      </el-empty>
      <template v-else>
        <div
          v-for="g in grouped"
          :key="g.story"
          class="ft-card-group"
          :class="{ 'is-collapsed': uiStore.collapsedGroups.has(g.story) }"
        >
          <div class="ft-card-story" @click="uiStore.toggleGroup(g.story)">
            <el-icon class="ft-card-caret"><CaretRight /></el-icon>
            <span class="ft-card-story-name" :title="g.story">{{ g.story }}</span>
            <span class="ft-card-count">({{ g.files.length }})</span>
          </div>
          <div v-show="!uiStore.collapsedGroups.has(g.story)" class="ft-card-grid">
            <div
              v-for="f in visibleFiles(g)"
              :key="f.key"
              class="ft-card"
              :class="{
                'is-selected': fileTreeStore.selectedKey === f.key,
                'is-fav': f.session?.isFavorite
              }"
              @click="onCardClick(f)"
              @contextmenu="openCtxMenu($event, f)"
            >
              <!-- Header -->
              <div class="ft-card-hdr">
                <el-icon class="ft-card-doc-icon"><Document /></el-icon>

                <template v-if="renamingKey === f.key">
                  <el-input
                    v-model="renamingName"
                    size="small"
                    @click.stop
                    @keyup.enter="saveRename(f.key)"
                    @keyup.esc="cancelRename"
                  />
                  <el-button size="small" type="primary" @click.stop="saveRename(f.key)">OK</el-button>
                  <el-button size="small" text @click.stop="cancelRename">Cancel</el-button>
                </template>
                <template v-else>
                  <span class="ft-card-name" :title="f.name">{{ f.name }}</span>
                  <el-icon
                    v-if="f.session?.isFavorite"
                    class="ft-card-fav-mark"
                    title="Favorite"
                  ><StarFilled /></el-icon>
                </template>

                <div v-if="renamingKey !== f.key" class="ft-card-actions" @click.stop>
                  <el-button
                    text
                    size="small"
                    :title="f.session?.isFavorite ? 'Unfavorite' : 'Favorite'"
                    :class="{ 'is-fav': f.session?.isFavorite }"
                    @click="sessionStore.toggleFavorite(f.key)"
                  >
                    <el-icon><component :is="f.session?.isFavorite ? StarFilled : Star" /></el-icon>
                  </el-button>
                  <el-button text :icon="Edit" size="small" title="Rename" @click="startRename(f)" />
                  <el-button
                    text
                    :icon="Delete"
                    size="small"
                    title="Delete"
                    type="danger"
                    @click="deleteNode(f)"
                  />
                </div>
              </div>

              <!-- Path -->
              <div class="ft-card-path" :title="f.key">{{ f.key }}</div>

              <!-- Description (hidden in compact) -->
              <div v-if="f.session && uiStore.cardDensity !== 'compact'" class="ft-card-desc">
                <template v-if="editingKey === f.key">
                  <el-input v-model="editingDescription" size="small" @click.stop />
                  <el-button size="small" type="primary" @click.stop="saveDescription(f.key)">Save</el-button>
                  <el-button size="small" text @click.stop="cancelEditDescription">Cancel</el-button>
                </template>
                <template v-else>
                  <span
                    class="ft-card-desc-text"
                    :class="{
                      'is-expanded': expandedDesc.has(f.key) || uiStore.cardDensity === 'spacious'
                    }"
                    :title="f.session?.pageDescription || ''"
                    @click.stop="toggleDescExpand(f.key)"
                  >{{ f.session?.pageDescription || "—" }}</span>
                  <div class="ft-card-desc-acts" @click.stop>
                    <el-button
                      text
                      size="small"
                      :icon="Edit"
                      title="Edit description"
                      @click="startEditDescription(f.key, f.session?.pageDescription || '')"
                    />
                    <el-button
                      v-if="!f.session?.pageDescription"
                      text
                      size="small"
                      :loading="aiLoadingKey === f.key"
                      title="Generate description with AI"
                      @click="generateDescription(f)"
                    >✨ AI</el-button>
                  </div>
                </template>
              </div>

              <!-- Tags chips -->
              <div v-if="cardTags(f).length" class="ft-card-tags">
                <el-tag
                  v-for="tag in (expandedTags.has(f.key) ? cardTags(f) : cardTags(f).slice(0, 3))"
                  :key="tag"
                  size="small"
                  :type="tagType(tag) as any"
                  class="ft-card-tag"
                >{{ tag }}</el-tag>
                <el-tag
                  v-if="cardTags(f).length > 3"
                  size="small"
                  type="info"
                  effect="plain"
                  class="ft-card-tag ft-card-tag-more"
                  @click.stop="toggleTagsExpand(f.key)"
                >{{ expandedTags.has(f.key) ? "less" : `+${cardTags(f).length - 3}` }}</el-tag>
              </div>

              <!-- Meta row -->
              <div class="ft-card-meta">
                <span v-if="messageCount(f) > 0" class="ft-card-meta-item" title="Message count">
                  💬 {{ messageCount(f) }}
                </span>
                <span v-if="f.session?.updatedAt" class="ft-card-meta-item" :title="`Updated ${shortDate(f.session.updatedAt)}`">
                  · {{ relativeTime(f.session.updatedAt) }}
                </span>
                <span v-if="f.session?.createdAt" class="ft-card-meta-item ft-card-meta-muted" :title="`Created ${shortDate(f.session.createdAt)}`">
                  · {{ shortDate(f.session.createdAt) }}
                </span>
              </div>

              <!-- Preview strip (selected card only, non-compact) -->
              <div
                v-if="uiStore.cardDensity !== 'compact' && previewLines(f)"
                class="ft-card-preview"
                @click.stop
              >
                <pre>{{ previewLines(f) }}</pre>
              </div>
            </div>
          </div>
          <!-- "Show N more" -->
          <div
            v-if="g.files.length > GROUP_CAP && !uiStore.collapsedGroups.has(g.story)"
            class="ft-card-more"
            @click="toggleGroupCap(g.story)"
          >
            {{ expandedGroupCaps.has(g.story) ? "Show less" : `Show ${g.files.length - GROUP_CAP} more in ${g.story}` }}
          </div>
        </div>
      </template>
    </div>

    <!-- Context menu (overlay + fixed-position floating menu) -->
    <div v-if="ctxMenu.open && ctxMenu.target" class="ft-ctx-overlay" @click.stop="closeCtxMenu" @contextmenu.prevent="closeCtxMenu">
      <div
        class="ft-ctx-menu"
        :style="{ left: ctxMenu.x + 'px', top: ctxMenu.y + 'px' }"
        @click.stop
      >
        <div class="ft-ctx-item" @click="ctxAction('favorite')">
          <el-icon><component :is="ctxMenu.target.session?.isFavorite ? StarFilled : Star" /></el-icon>
          {{ ctxMenu.target.session?.isFavorite ? "Unfavorite" : "Favorite" }}
        </div>
        <div class="ft-ctx-item" @click="ctxAction('rename')">
          <el-icon><Edit /></el-icon>Rename
        </div>
        <div
          class="ft-ctx-item"
          :class="{ 'is-disabled': !!ctxMenu.target.session?.pageDescription }"
          @click="!ctxMenu.target.session?.pageDescription && ctxAction('ai')"
        >
          <el-icon><MagicStick /></el-icon>Generate description
        </div>
        <div class="ft-ctx-item" @click="ctxAction('copy')">
          <el-icon><DocumentCopy /></el-icon>Copy path
        </div>
        <div class="ft-ctx-item is-danger" @click="ctxAction('delete')">
          <el-icon><Delete /></el-icon>Delete
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.ft-cards {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
}
.ft-cards.is-full-width {
  padding: 16px;
}
.ft-cards-toolbar {
  display: flex;
  flex-shrink: 0;
  gap: 8px;
  align-items: center;
  padding: 8px;
  border-bottom: 1px solid var(--el-border-color-lighter);
}
.ft-cards-scroll {
  flex: 1;
  padding: 8px;
  overflow-y: auto;
}
.ft-cards.is-full-width .ft-cards-scroll {
  padding: 0;
}

// Skeleton grid
.ft-skeleton-grid {
  padding: 8px;
}
.ft-skel-card {
  padding: 12px;
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 8px;
}

// Group header — sticky
.ft-card-group {
  margin-bottom: 20px;
}
.ft-card-story {
  position: sticky;
  top: 0;
  z-index: 2;
  display: flex;
  gap: 6px;
  align-items: center;
  padding: 6px 8px;
  margin: 0 0 8px;
  font-size: 14px;
  font-weight: 600;
  color: var(--el-text-color-primary);
  cursor: pointer;
  background: rgb(255 255 255 / 85%);
  border-radius: 4px;
  backdrop-filter: blur(6px);
}
.ft-card-caret {
  font-size: 12px;
  color: var(--el-text-color-secondary);
  transition: transform 0.15s;
}
.ft-card-group.is-collapsed .ft-card-caret {
  transform: rotate(0deg);
}
.ft-card-group:not(.is-collapsed) .ft-card-caret {
  transform: rotate(90deg);
}
.ft-card-story-name {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.ft-card-count {
  font-size: 12px;
  font-weight: 400;
  color: var(--el-text-color-secondary);
}

// Grid + density
.ft-card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 8px;
}
.is-compact .ft-card-grid {
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 6px;
}
.is-spacious .ft-card-grid {
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 12px;
}
.ft-card {
  padding: 10px 12px;
  cursor: pointer;
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color-light);
  border-left: 3px solid transparent;
  border-radius: 8px;
  transition: all 0.15s;
}
.is-compact .ft-card {
  padding: 8px 10px;
}
.is-spacious .ft-card {
  padding: 14px 16px;
}
.ft-card:hover {
  border-color: var(--el-color-primary);
  box-shadow: 0 2px 8px rgb(0 0 0 / 8%);
}
.ft-card.is-selected {
  background: var(--el-color-primary-light-9);
  border-color: var(--el-color-primary);
}
.ft-card.is-fav {
  border-left-color: var(--el-color-warning);
}
.ft-card-hdr {
  display: flex;
  gap: 6px;
  align-items: center;
  margin-bottom: 6px;
}
.ft-card-doc-icon {
  flex-shrink: 0;
  color: var(--el-text-color-secondary);
}
.ft-card-name {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: 13px;
  font-weight: 500;
  color: var(--el-text-color-primary);
  white-space: nowrap;
}
.is-compact .ft-card-name {
  font-size: 12px;
}
.is-spacious .ft-card-name {
  font-size: 14px;
}
.ft-card-fav-mark {
  flex-shrink: 0;
  font-size: 14px;
  color: var(--el-color-warning);
}
.ft-card-actions {
  display: flex;
  flex-shrink: 0;
  gap: 2px;
  opacity: 0;
  transition: opacity 0.15s;
}
.ft-card:hover .ft-card-actions,
.ft-card.is-selected .ft-card-actions {
  opacity: 1;
}
.ft-card-actions .is-fav {
  color: var(--el-color-warning);
}
.ft-card-path {
  margin-bottom: 6px;
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: 11px;
  color: var(--el-text-color-placeholder);
  white-space: nowrap;
}
.ft-card-desc {
  display: flex;
  gap: 4px;
  align-items: flex-start;
  margin-bottom: 6px;
  font-size: 12px;
  color: var(--el-text-color-secondary);
}
.ft-card-desc-text {
  display: -webkit-box;
  flex: 1;
  overflow: hidden;
  -webkit-line-clamp: 2;
  line-height: 1.5;
  cursor: zoom-in;
  -webkit-box-orient: vertical;
}
.ft-card-desc-text.is-expanded {
  -webkit-line-clamp: unset;
  cursor: zoom-out;
}
.ft-card-desc-acts {
  display: flex;
  flex-shrink: 0;
  gap: 2px;
}
.ft-card-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin-bottom: 6px;
}
.ft-card-tag {
  font-size: 11px;
  opacity: 0.85;
}
.ft-card-tag-more {
  cursor: pointer;
  opacity: 1;
}
.ft-card-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  align-items: center;
  font-size: 11px;
  color: var(--el-text-color-secondary);
}
.ft-card-meta-item {
  white-space: nowrap;
}
.ft-card-meta-muted {
  color: var(--el-text-color-placeholder);
}

// Preview strip
.ft-card-preview {
  padding: 6px 8px;
  margin-top: 6px;
  background: var(--el-fill-color-light);
  border-left: 2px solid var(--el-color-primary);
  border-radius: 4px;
}
.ft-card-preview pre {
  max-height: 4.5em;
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  font-family: ui-monospace, SFMono-Regular, monospace;
  font-size: 11px;
  color: var(--el-text-color-regular);
  white-space: pre-wrap;
}

// "Show N more"
.ft-card-more {
  padding: 6px 8px;
  margin-top: 4px;
  font-size: 12px;
  color: var(--el-color-primary);
  text-align: center;
  cursor: pointer;
  border: 1px dashed var(--el-border-color);
  border-radius: 4px;
}
.ft-card-more:hover {
  background: var(--el-color-primary-light-9);
}

// Context menu
.ft-ctx-overlay {
  position: fixed;
  inset: 0;
  z-index: 3000;
}
.ft-ctx-menu {
  position: fixed;
  z-index: 3001;
  min-width: 180px;
  padding: 4px 0;
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color-light);
  border-radius: 6px;
  box-shadow: 0 4px 16px rgb(0 0 0 / 12%);
}
.ft-ctx-item {
  display: flex;
  gap: 8px;
  align-items: center;
  padding: 6px 12px;
  font-size: 13px;
  color: var(--el-text-color-primary);
  cursor: pointer;
}
.ft-ctx-item:hover {
  background: var(--el-fill-color-light);
}
.ft-ctx-item.is-disabled {
  color: var(--el-text-color-placeholder);
  cursor: not-allowed;
}
.ft-ctx-item.is-disabled:hover {
  background: transparent;
}
.ft-ctx-item.is-danger {
  color: var(--el-color-danger);
}
.ft-ctx-item.is-danger:hover {
  background: var(--el-color-danger-light-9);
}
</style>
