<script setup lang="ts">
/**
 * CheatSheetOverlay — Keyboard shortcut reference panel.
 *
 * Triggered by the `?` key via KeyboardRegistry → CustomEvent bridge.
 * Close with Escape or click-outside on the backdrop.
 *
 * Features:
 *  - 4-category grouped display with item counts
 *  - Real-time search across id/description/keys/category
 *  - Platform-aware key names (Cmd on macOS, Ctrl elsewhere)
 *  - Conflict warning banner when known browser/page conflicts exist
 *  - Visual distinction for customized shortcuts
 *  - Lock icon for non-customizable shortcuts
 */
import { computed, onMounted, onUnmounted, ref } from 'vue';
import { Search, Close, WarningFilled, InfoFilled } from '@element-plus/icons-vue';
import { keyboardRegistry, displayKeys, type ShortcutBinding } from '@/shared/shortcuts';

interface CategoryMeta { label: string; icon: string }

const CATEGORY_META: Record<ShortcutBinding['category'], CategoryMeta> = {
  pet:        { label: 'Pet Controls',   icon: '🐾' },
  chat:       { label: 'Chat',           icon: '💬' },
  navigation: { label: 'Navigation',     icon: '🧭' },
  utility:    { label: 'Utilities',      icon: '⚙' },
};

const CATEGORY_ORDER: ShortcutBinding['category'][] = ['pet', 'chat', 'navigation', 'utility'];

const visible = ref(false);
const searchQuery = ref('');

const allShortcuts = computed(() => keyboardRegistry.getAll());
const knownConflicts = computed(() => keyboardRegistry.knownConflicts.value);

const highConflicts = computed(() => knownConflicts.value.filter(c => c.severity === 'high'));
const lowConflicts = computed(() => knownConflicts.value.filter(c => c.severity === 'low'));

function muteConflictLogs(permanent = false) {
  keyboardRegistry.muteConflictLogs(permanent);
}

const filtered = computed(() => {
  const q = searchQuery.value.toLowerCase().trim();
  if (!q) return allShortcuts.value;
  return allShortcuts.value.filter(s =>
    s.id.toLowerCase().includes(q) ||
    s.description.toLowerCase().includes(q) ||
    s.keys.toLowerCase().includes(q) ||
    CATEGORY_META[s.category].label.toLowerCase().includes(q),
  );
});

const grouped = computed(() => {
  const groups: { category: ShortcutBinding['category']; meta: CategoryMeta; items: ShortcutBinding[] }[] = [];
  for (const cat of CATEGORY_ORDER) {
    const items = filtered.value.filter(s => s.category === cat);
    if (items.length > 0) {
      groups.push({ category: cat, meta: CATEGORY_META[cat], items });
    }
  }
  return groups;
});

/** Total shortcuts per category (unfiltered, for count badges). */
const categoryCounts = computed(() => {
  const counts: Record<string, number> = {};
  for (const cat of CATEGORY_ORDER) {
    counts[cat] = allShortcuts.value.filter(s => s.category === cat).length;
  }
  return counts;
});

const customizedCount = computed(() =>
  allShortcuts.value.filter((s, i) => {
    // Compare with default binding for the same id
    const def = allShortcuts.value.find(d => d.id === s.id);
    return def && s.keys !== def.keys;
  }).length
);

function show() {
  searchQuery.value = '';
  visible.value = true;
}

function hide() {
  visible.value = false;
}

function onKeyDown(e: KeyboardEvent) {
  if (e.key === 'Escape' && visible.value) {
    e.preventDefault();
    e.stopPropagation();
    hide();
  }
}

function onOverlayClick(e: MouseEvent) {
  if ((e.target as HTMLElement).classList.contains('yipet-cheatsheet-overlay')) {
    hide();
  }
}

function openBindingEditor() {
  hide();
  window.dispatchEvent(new CustomEvent('yipet:shortcut:editor'));
}

// Toggle via CustomEvent from KeyboardRegistry
function onCheatsheetEvent() {
  visible.value ? hide() : show();
}

onMounted(() => {
  window.addEventListener('yipet:shortcut:cheatsheet', onCheatsheetEvent);
  window.addEventListener('keydown', onKeyDown, { capture: true });
});

onUnmounted(() => {
  window.removeEventListener('yipet:shortcut:cheatsheet', onCheatsheetEvent);
  window.removeEventListener('keydown', onKeyDown, { capture: true });
});
</script>

<template>
  <Teleport to="body">
    <Transition name="yipet-cheatsheet-fade">
      <div
        v-if="visible"
        class="yipet-cheatsheet-overlay"
        role="dialog"
        aria-label="Keyboard shortcuts reference"
        @click="onOverlayClick"
      >
        <div class="yipet-cheatsheet-panel">
          <!-- Header -->
          <div class="yipet-cheatsheet-header">
            <h2 class="yipet-cheatsheet-title">Keyboard Shortcuts</h2>
            <div class="yipet-cheatsheet-header-right">
              <span v-if="customizedCount > 0" class="yipet-cheatsheet-custom-badge" :title="`${customizedCount} shortcut(s) customized`">
                {{ customizedCount }} customized
              </span>
              <el-button circle size="small" :icon="Close" class="yipet-cheatsheet-close" aria-label="Close" @click="hide" />
            </div>
          </div>

          <!-- Conflict warning (grouped by severity) -->
          <template v-if="knownConflicts.length > 0">
            <div v-if="highConflicts.length > 0" class="yipet-cheatsheet-conflict-banner conflict-high">
              <el-icon :size="14"><WarningFilled /></el-icon>
              <div class="yipet-cheatsheet-conflict-body">
                <div class="yipet-cheatsheet-conflict-title">
                  <strong>{{ highConflicts.length }} global-scope</strong> shortcut{{ highConflicts.length > 1 ? 's' : '' }} may conflict with the browser or other sites
                </div>
                <ul class="yipet-cheatsheet-conflict-list">
                  <li v-for="c in highConflicts" :key="c.keys + c.shortcutId">
                    <kbd class="conflict-keys">{{ displayKeys(c.keys) }}</kbd>
                    <span class="conflict-action">{{ allShortcuts.find(s => s.id === c.shortcutId)?.description ?? c.shortcutId }}</span>
                    <span class="conflict-vs">↔</span>
                    <span class="conflict-target">{{ c.description }}</span>
                  </li>
                </ul>
              </div>
            </div>

            <div v-if="lowConflicts.length > 0" class="yipet-cheatsheet-conflict-banner conflict-low">
              <el-icon :size="14"><InfoFilled /></el-icon>
              <div class="yipet-cheatsheet-conflict-body">
                <div class="yipet-cheatsheet-conflict-title">
                  <strong>{{ lowConflicts.length }} chat-scope</strong> override{{ lowConflicts.length > 1 ? 's' : '' }} — only active while YiPet chat window is open
                </div>
                <ul class="yipet-cheatsheet-conflict-list compact">
                  <li v-for="c in lowConflicts" :key="c.keys + c.shortcutId">
                    <kbd class="conflict-keys">{{ displayKeys(c.keys) }}</kbd>
                    <span class="conflict-target">{{ c.description }}</span>
                  </li>
                </ul>
              </div>
            </div>

            <div v-if="knownConflicts.length > 0" class="yipet-cheatsheet-conflict-actions">
              <el-button size="small" text @click="muteConflictLogs(false)">Mute this session</el-button>
              <el-button size="small" text @click="muteConflictLogs(true)">Mute permanently</el-button>
              <el-button size="small" text type="primary" @click="openBindingEditor">Reassign in Editor</el-button>
            </div>
          </template>

          <!-- Search -->
          <div class="yipet-cheatsheet-search">
            <el-input
              v-model="searchQuery"
              size="default"
              clearable
              :prefix-icon="Search"
              placeholder="Search shortcuts by name, keys, or category..."
            />
          </div>

          <!-- Shortcut groups -->
          <div class="yipet-cheatsheet-body">
            <div
              v-for="group in grouped"
              :key="group.category"
              class="yipet-cheatsheet-group"
            >
              <h3 class="yipet-cheatsheet-group-title">
                <span class="yipet-cheatsheet-group-icon">{{ group.meta.icon }}</span>
                {{ group.meta.label }}
                <span class="yipet-cheatsheet-group-count">{{ group.items.length }}/{{ categoryCounts[group.category] }}</span>
              </h3>
              <div
                v-for="item in group.items"
                :key="item.id"
                class="yipet-cheatsheet-row"
              >
                <span class="yipet-cheatsheet-desc">{{ item.description }}</span>
                <span class="yipet-cheatsheet-keys">
                  <template v-for="(part, i) in displayKeys(item.keys).split('+')" :key="i">
                    <kbd :class="{ customized: item.customizable }">{{ part.trim() }}</kbd>
                    <span v-if="i < displayKeys(item.keys).split('+').length - 1" class="yipet-cheatsheet-plus">+</span>
                  </template>
                  <el-tooltip v-if="!item.customizable" content="Core shortcut — not customizable" placement="top">
                    <span class="yipet-cheatsheet-lock">&#x1f512;</span>
                  </el-tooltip>
                </span>
              </div>
            </div>

            <!-- Empty state -->
            <div v-if="grouped.length === 0" class="yipet-cheatsheet-empty">
              <div class="yipet-cheatsheet-empty-icon">&#x1f50d;</div>
              <p class="yipet-cheatsheet-empty-title">No shortcuts match "<strong>{{ searchQuery }}</strong>"</p>
              <p class="yipet-cheatsheet-empty-hint">Try searching by action name, key combination, or category</p>
            </div>
          </div>

          <!-- Footer -->
          <div class="yipet-cheatsheet-footer">
            <span class="yipet-cheatsheet-footer-item">Press <kbd>?</kbd> to toggle</span>
            <span class="yipet-cheatsheet-footer-sep">·</span>
            <span class="yipet-cheatsheet-footer-item"><kbd>Esc</kbd> to close</span>
            <span class="yipet-cheatsheet-footer-sep">·</span>
            <span class="yipet-cheatsheet-footer-item">{{ allShortcuts.length }} shortcuts</span>
            <span v-if="customizedCount > 0" class="yipet-cheatsheet-footer-sep">·</span>
            <span v-if="customizedCount > 0" class="yipet-cheatsheet-footer-item customized">{{ customizedCount }} customized</span>
            <span class="yipet-cheatsheet-footer-sep">·</span>
            <el-button size="small" text class="yipet-cheatsheet-edit-btn" @click="openBindingEditor">
              Edit Bindings
            </el-button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style lang="scss" scoped>
.yipet-cheatsheet-overlay {
  position: fixed;
  inset: 0;
  z-index: 2147483647;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
}

.yipet-cheatsheet-panel {
  width: 680px;
  max-width: 92vw;
  max-height: 82vh;
  display: flex;
  flex-direction: column;
  background: var(--card-bg, #1e1b3a);
  border: 1px solid rgba(var(--primary-rgb, 99, 102, 241), 0.25);
  border-radius: 16px;
  box-shadow: 0 24px 80px rgba(0, 0, 0, 0.5);
  overflow: hidden;
}

.yipet-cheatsheet-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18px 20px 12px;
  border-bottom: 1px solid rgba(var(--primary-rgb, 99, 102, 241), 0.12);
}

.yipet-cheatsheet-header-right {
  display: flex;
  align-items: center;
  gap: 10px;
}

.yipet-cheatsheet-title {
  margin: 0;
  font-size: 17px;
  font-weight: 600;
  color: var(--text-primary, #f5f3ff);
}

.yipet-cheatsheet-custom-badge {
  font-size: 11px;
  font-weight: 500;
  padding: 2px 8px;
  border-radius: 10px;
  color: rgba(var(--primary-rgb, 99, 102, 241), 0.9);
  background: rgba(var(--primary-rgb, 99, 102, 241), 0.12);
  border: 1px solid rgba(var(--primary-rgb, 99, 102, 241), 0.2);
}

.yipet-cheatsheet-close {
  --el-button-bg-color: rgba(var(--primary-rgb, 99, 102, 241), 0.1);
  --el-button-border-color: transparent;
  --el-button-text-color: var(--text-secondary, #d4d0e8);
  --el-button-hover-bg-color: rgba(var(--primary-rgb, 99, 102, 241), 0.2);
  --el-button-hover-text-color: var(--text-primary, #f5f3ff);
}

// Conflict banners (severity-tiered)
.yipet-cheatsheet-conflict-banner {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  margin: 10px 20px 0;
  padding: 10px 12px;
  font-size: 12px;
  border-radius: 10px;
  line-height: 1.5;

  &.conflict-high {
    color: #fbbf24;
    background: rgba(251, 191, 36, 0.08);
    border: 1px solid rgba(251, 191, 36, 0.2);
    .el-icon { margin-top: 2px; flex-shrink: 0; }
  }
  &.conflict-low {
    color: #22d3ee;
    background: rgba(34, 211, 238, 0.07);
    border: 1px solid rgba(34, 211, 238, 0.18);
    .el-icon { margin-top: 2px; flex-shrink: 0; }
  }
}
.yipet-cheatsheet-conflict-body { flex: 1; min-width: 0; }
.yipet-cheatsheet-conflict-title {
  font-weight: 600;
  margin-bottom: 4px;
}
.yipet-cheatsheet-conflict-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;

  li {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 6px;
    font-size: 11px;
    opacity: 0.9;
  }
  &.compact li { font-size: 11px; opacity: 0.85; }
}
.conflict-keys {
  background: rgba(255,255,255,0.06);
  border: 1px solid rgba(255,255,255,0.12);
  border-radius: 4px;
  padding: 0 5px;
  font-size: 10px;
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  line-height: 1.6;
  white-space: nowrap;
}
.conflict-action {
  color: var(--text-secondary, #d4d0e8);
  font-weight: 500;
}
.conflict-vs { opacity: 0.4; }
.conflict-target { opacity: 0.75; }

.yipet-cheatsheet-conflict-actions {
  margin: 4px 20px 0;
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  opacity: 0.85;

  :deep(.el-button--small) { padding: 4px 8px; font-size: 11px; }
}

.yipet-cheatsheet-search {
  padding: 10px 20px;
}

.yipet-cheatsheet-search :deep(.el-input__wrapper) {
  background: var(--input-bg, #181730);
  border: 1px solid rgba(var(--primary-rgb, 99, 102, 241), 0.2);
  border-radius: 8px;
  box-shadow: none;
}

.yipet-cheatsheet-search :deep(.el-input__inner) {
  color: var(--text-primary, #f5f3ff);
  font-size: 13px;

  &::placeholder { color: var(--placeholder-color, rgba(212, 208, 232, 0.4)); }
}

.yipet-cheatsheet-body {
  flex: 1;
  overflow-y: auto;
  padding: 4px 20px 16px;

  &::-webkit-scrollbar { width: 5px; }
  &::-webkit-scrollbar-track { background: transparent; }
  &::-webkit-scrollbar-thumb {
    background: rgba(var(--primary-rgb, 99, 102, 241), 0.25);
    border-radius: 3px;
  }
}

.yipet-cheatsheet-group { margin-bottom: 14px; }

.yipet-cheatsheet-group-title {
  display: flex;
  align-items: center;
  gap: 6px;
  margin: 0 0 6px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.6px;
  color: rgba(var(--primary-rgb, 99, 102, 241), 0.7);
}

.yipet-cheatsheet-group-icon { font-size: 13px; }

.yipet-cheatsheet-group-count {
  margin-left: auto;
  font-size: 10px;
  font-weight: 500;
  color: rgba(var(--primary-rgb, 99, 102, 241), 0.4);
}

.yipet-cheatsheet-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 6px 10px;
  border-radius: 6px;
  transition: background 0.12s;

  &:hover { background: rgba(var(--primary-rgb, 99, 102, 241), 0.06); }
}

.yipet-cheatsheet-desc {
  font-size: 13px;
  color: var(--text-primary, #f5f3ff);
}

.yipet-cheatsheet-keys {
  display: flex;
  align-items: center;
  gap: 3px;
  flex-shrink: 0;

  kbd {
    display: inline-block;
    min-width: 22px;
    padding: 2px 7px;
    font-family: 'SF Mono', 'Menlo', 'Monaco', 'Consolas', monospace;
    font-size: 12px;
    font-weight: 500;
    color: var(--text-primary, #f5f3ff);
    background: rgba(var(--primary-rgb, 99, 102, 241), 0.12);
    border: 1px solid rgba(var(--primary-rgb, 99, 102, 241), 0.2);
    border-radius: 4px;
    text-align: center;
    line-height: 1.4;

    &.customized {
      border-color: rgba(var(--primary-rgb, 99, 102, 241), 0.45);
      box-shadow: 0 0 0 1px rgba(var(--primary-rgb, 99, 102, 241), 0.15);
    }
  }
}

.yipet-cheatsheet-plus {
  font-size: 12px;
  color: var(--text-secondary, #d4d0e8);
  margin: 0 1px;
}

.yipet-cheatsheet-lock {
  font-size: 10px;
  margin-left: 4px;
  opacity: 0.5;
  cursor: help;
}

// Empty state
.yipet-cheatsheet-empty {
  padding: 40px 0;
  text-align: center;
  color: var(--text-secondary, #d4d0e8);
}

.yipet-cheatsheet-empty-icon { font-size: 32px; margin-bottom: 12px; opacity: 0.5; }

.yipet-cheatsheet-empty-title {
  font-size: 14px;
  margin: 0 0 6px;
  strong { color: var(--text-primary, #f5f3ff); }
}

.yipet-cheatsheet-empty-hint {
  font-size: 12px;
  margin: 0;
  opacity: 0.6;
}

// Footer
.yipet-cheatsheet-footer {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 10px 20px;
  border-top: 1px solid rgba(var(--primary-rgb, 99, 102, 241), 0.12);
  font-size: 12px;
  color: var(--text-secondary, #d4d0e8);

  kbd {
    display: inline-block;
    padding: 1px 5px;
    font-family: 'SF Mono', 'Menlo', monospace;
    font-size: 11px;
    color: var(--text-secondary, #d4d0e8);
    background: rgba(var(--primary-rgb, 99, 102, 241), 0.1);
    border: 1px solid rgba(var(--primary-rgb, 99, 102, 241), 0.15);
    border-radius: 3px;
  }
}

.yipet-cheatsheet-footer-sep {
  opacity: 0.3;
}

.yipet-cheatsheet-footer-item.customized {
  color: rgba(var(--primary-rgb, 99, 102, 241), 0.8);
}

.yipet-cheatsheet-edit-btn {
  font-size: 11px !important;
  color: rgba(var(--primary-rgb, 99, 102, 241), 0.7) !important;
  padding: 0 8px !important;
  height: 22px !important;

  &:hover { color: rgba(var(--primary-rgb, 99, 102, 241), 1) !important; }
}

// Transition
.yipet-cheatsheet-fade-enter-active,
.yipet-cheatsheet-fade-leave-active {
  transition: opacity 0.15s ease;

  .yipet-cheatsheet-panel {
    transition: transform 0.15s ease, opacity 0.15s ease;
  }
}

.yipet-cheatsheet-fade-enter-from,
.yipet-cheatsheet-fade-leave-to {
  opacity: 0;

  .yipet-cheatsheet-panel {
    transform: scale(0.95);
    opacity: 0;
  }
}
</style>