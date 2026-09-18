<script setup lang="ts">
/**
 * ShortcutBindingEditor — Visual keyboard shortcut binding manager.
 *
 * Opens as a modal dialog. Click any shortcut row to enter key-capture mode,
 * press the desired key combination, confirm or cancel. Includes conflict
 * detection, single/all reset, and JSON export/import.
 */
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import { RefreshLeft, Download, Upload, WarningFilled } from '@element-plus/icons-vue';
import { keyboardRegistry, displayKeys, type ShortcutBinding } from '@/shared/shortcuts';

const CATEGORY_LABELS: Record<string, string> = {
  pet: 'Pet Controls', chat: 'Chat', navigation: 'Navigation', utility: 'Utilities',
};
const CATEGORY_ORDER = ['pet', 'chat', 'navigation', 'utility'];

const visible = ref(false);
const capturingId = ref<string | null>(null);
const capturedKeys = ref('');
const captureError = ref('');
const captureConflict = ref('');
const importStatus = ref('');

const shortcuts = computed(() => keyboardRegistry.getAll());

const grouped = computed(() => {
  const groups: { cat: string; label: string; items: ShortcutBinding[] }[] = [];
  for (const cat of CATEGORY_ORDER) {
    const items = shortcuts.value.filter(s => s.category === cat);
    if (items.length) groups.push({ cat, label: CATEGORY_LABELS[cat] || cat, items });
  }
  return groups;
});

// ── Key capture ─────────────────────────────────────────────────────────

function startCapture(id: string) {
  const b = shortcuts.value.find(s => s.id === id);
  if (!b?.customizable) return;
  capturingId.value = id;
  capturedKeys.value = '';
  captureError.value = '';
  captureConflict.value = '';
  document.addEventListener('keydown', onCaptureKeyDown, { capture: true });
}

function cancelCapture() {
  capturingId.value = null;
  capturedKeys.value = '';
  captureError.value = '';
  captureConflict.value = '';
  document.removeEventListener('keydown', onCaptureKeyDown, { capture: true });
}

function onCaptureKeyDown(e: KeyboardEvent) {
  if (!capturingId.value) return;
  e.preventDefault();
  e.stopPropagation();

  const key = e.key;
  if (key === 'Escape') { cancelCapture(); return; }
  if (['Control', 'Alt', 'Shift', 'Meta'].includes(key)) return;

  const parts: string[] = [];
  if (e.ctrlKey || e.metaKey) parts.push('Ctrl');
  if (e.altKey) parts.push('Alt');
  if (e.shiftKey) parts.push('Shift');
  const mainKey = key === ' ' ? 'Space' : key.length === 1 ? key.toUpperCase() : key;
  parts.push(mainKey);

  capturedKeys.value = parts.join('+');
  captureError.value = '';

  // Check validation: must have a non-modifier key
  if (['Control', 'Alt', 'Shift', 'Meta'].includes(key)) return;
}

async function confirmCapture() {
  if (!capturingId.value || !capturedKeys.value) return;
  const result = await keyboardRegistry.updateBinding(capturingId.value, capturedKeys.value);
  if (!result.success) {
    if (result.conflict) {
      captureConflict.value = result.conflict;
    } else {
      captureError.value = 'Cannot customize this shortcut';
    }
    return;
  }
  cancelCapture();
}

// ── Reset ───────────────────────────────────────────────────────────────

async function resetBinding(id: string) {
  const b = shortcuts.value.find(s => s.id === id);
  if (!b) return;
  const defKeys = getDefaultKeys(id);
  if (defKeys) await keyboardRegistry.updateBinding(id, defKeys);
}

async function resetAll() {
  if (!confirm('Reset all shortcuts to their defaults?')) return;
  await keyboardRegistry.restoreDefaults();
}

// Helper: get default keys for a binding from the source defaults
function getDefaultKeys(id: string): string | null {
  // The registry stores current keys; defaults are known statically.
  const map: Record<string, string> = {
    'toggle-pet': 'Ctrl+Shift+P', 'open-chat': 'Ctrl+Shift+X',
    'screenshot': 'Ctrl+Shift+S', 'toggle-mute': 'Ctrl+Shift+M',
    'focus-input': 'Ctrl+I', 'new-session': 'Ctrl+N',
    'toggle-sidebar': 'Ctrl+B', 'export-session': 'Ctrl+E',
    'search-messages': 'Ctrl+F', 'zoom-in': 'Ctrl+=', 'zoom-out': 'Ctrl+-',
    'clear-conversation': 'Ctrl+K', 'clear-input': 'Ctrl+L',
    'cheatsheet': '?',
  };
  return map[id] || null;
}

function isCustomized(id: string): boolean {
  const def = getDefaultKeys(id);
  const cur = shortcuts.value.find(s => s.id === id);
  return !!(def && cur && cur.keys !== def);
}

// ── Import / Export ─────────────────────────────────────────────────────

function exportJSON() {
  const data: Record<string, string> = {};
  for (const s of shortcuts.value) {
    if (isCustomized(s.id)) data[s.id] = s.keys;
  }
  const blob = new Blob([JSON.stringify({ version: '1.0', exportedAt: new Date().toISOString(), shortcuts: data }, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `yipet-shortcuts-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(a.href);
}

function importJSON() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.json';
  input.onchange = async () => {
    const file = input.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      if (!data.shortcuts || typeof data.shortcuts !== 'object') {
        importStatus.value = 'Invalid format';
        return;
      }
      let imported = 0;
      let skipped = 0;
      for (const [id, keys] of Object.entries(data.shortcuts)) {
        if (getDefaultKeys(id) && typeof keys === 'string') {
          await keyboardRegistry.updateBinding(id, keys as string);
          imported++;
        } else {
          skipped++;
        }
      }
      importStatus.value = `Imported ${imported} shortcuts` + (skipped ? `, skipped ${skipped}` : '');
      setTimeout(() => { importStatus.value = ''; }, 3000);
    } catch {
      importStatus.value = 'Invalid JSON file';
    }
  };
  input.click();
}

// ── Open from CustomEvent ───────────────────────────────────────────────

function handleOpen() { visible.value = true; importStatus.value = ''; }

onMounted(() => { window.addEventListener('yipet:shortcut:editor', handleOpen); });
onBeforeUnmount(() => { window.removeEventListener('yipet:shortcut:editor', handleOpen); });
</script>

<template>
  <!-- Key-capture mode: full-screen overlay -->
  <Teleport to="body">
    <div v-if="capturingId" class="yipet-capture-overlay" @click.self="cancelCapture">
      <div class="yipet-capture-modal">
        <div class="yipet-capture-prompt">
          <span v-if="!capturedKeys">Press the key combination you want to bind...</span>
          <span v-else class="yipet-capture-keys">{{ displayKeys(capturedKeys) }}</span>
        </div>
        <div v-if="captureConflict" class="yipet-capture-conflict">
          <el-icon :size="14"><WarningFilled /></el-icon>
          Already bound to "{{ captureConflict }}"
        </div>
        <div v-if="captureError" class="yipet-capture-error">{{ captureError }}</div>
        <div class="yipet-capture-actions">
          <el-button size="small" @click="cancelCapture">Cancel</el-button>
          <el-button size="small" type="primary" :disabled="!capturedKeys" @click="confirmCapture">Confirm</el-button>
        </div>
      </div>
    </div>
  </Teleport>

  <!-- Editor modal -->
  <el-dialog v-model="visible" title="Shortcut Bindings" width="700px" top="5vh" :z-index="2147483646" append-to-body :close-on-click-modal="false" class="fp-dialog">
    <div class="yipet-editor-toolbar">
      <el-button size="small" :icon="Upload" @click="importJSON">Import</el-button>
      <el-button size="small" :icon="Download" @click="exportJSON">Export</el-button>
      <el-button size="small" :icon="RefreshLeft" type="danger" plain @click="resetAll">Reset All</el-button>
      <span v-if="importStatus" class="yipet-import-status">{{ importStatus }}</span>
    </div>

    <div v-for="group in grouped" :key="group.cat" class="yipet-editor-group">
      <h4 class="yipet-editor-group-title">{{ group.label }}</h4>
      <div v-for="item in group.items" :key="item.id" class="yipet-editor-row" :class="{ customized: isCustomized(item.id) }">
        <span class="yipet-editor-desc">{{ item.description }}</span>
        <span class="yipet-editor-keys">
          <kbd v-for="(p, i) in displayKeys(item.keys).split('+')" :key="i">{{ p.trim() }}</kbd>
          <span v-if="isCustomized(item.id)" class="yipet-editor-badge">customized</span>
          <span v-if="!item.customizable" class="yipet-editor-lock" title="Core shortcut — not customizable">&#x1f512;</span>
        </span>
        <div class="yipet-editor-actions">
          <el-button v-if="item.customizable" size="small" text @click="startCapture(item.id)">Edit</el-button>
          <el-button v-if="isCustomized(item.id)" size="small" text type="warning" @click="resetBinding(item.id)">Reset</el-button>
        </div>
      </div>
    </div>
  </el-dialog>
</template>

<style lang="scss" scoped>
// Key capture overlay
.yipet-capture-overlay {
  position: fixed; inset: 0; z-index: 2147483647;
  display: flex; align-items: center; justify-content: center;
  background: rgba(0, 0, 0, 0.7); backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
}

.yipet-capture-modal {
  background: var(--card-bg, #1e1b3a);
  border: 1px solid rgba(var(--primary-rgb, 99, 102, 241), 0.3);
  border-radius: 16px; padding: 32px 40px;
  text-align: center; min-width: 360px;
  box-shadow: 0 24px 80px rgba(0, 0, 0, 0.5);
}

.yipet-capture-prompt {
  font-size: 15px; color: var(--text-primary, #f5f3ff); margin-bottom: 16px;
}

.yipet-capture-keys {
  font-family: 'SF Mono', 'Menlo', monospace;
  font-size: 24px; font-weight: 600;
  color: rgba(var(--primary-rgb, 99, 102, 241), 1);
  background: rgba(var(--primary-rgb, 99, 102, 241), 0.1);
  padding: 8px 20px; border-radius: 8px;
  border: 1px solid rgba(var(--primary-rgb, 99, 102, 241), 0.3);
}

.yipet-capture-conflict {
  display: flex; align-items: center; justify-content: center; gap: 6px;
  font-size: 13px; color: #fbbf24; margin-bottom: 12px;
}

.yipet-capture-error { font-size: 13px; color: #ef4444; margin-bottom: 12px; }

.yipet-capture-actions { display: flex; justify-content: center; gap: 10px; margin-top: 16px; }

// Editor toolbar
.yipet-editor-toolbar {
  display: flex; align-items: center; gap: 8px;
  padding-bottom: 12px; margin-bottom: 12px;
  border-bottom: 1px solid rgba(var(--primary-rgb, 99, 102, 241), 0.1);
}

.yipet-import-status {
  font-size: 12px; color: rgba(var(--primary-rgb, 99, 102, 241), 0.8);
  margin-left: 8px;
}

// Editor groups
.yipet-editor-group { margin-bottom: 14px; }

.yipet-editor-group-title {
  font-size: 11px; font-weight: 600; text-transform: uppercase;
  letter-spacing: 0.5px; color: rgba(var(--primary-rgb, 99, 102, 241), 0.6);
  margin: 0 0 4px;
}

.yipet-editor-row {
  display: flex; align-items: center; gap: 12px;
  padding: 6px 8px; border-radius: 6px;
  transition: background 0.12s;

  &:hover { background: rgba(var(--primary-rgb, 99, 102, 241), 0.04); }
  &.customized { background: rgba(var(--primary-rgb, 99, 102, 241), 0.06); }
}

.yipet-editor-desc { flex: 1; font-size: 13px; color: var(--text-primary, #f5f3ff); min-width: 0; }

.yipet-editor-keys {
  display: flex; align-items: center; gap: 3px; flex-shrink: 0;

  kbd {
    display: inline-block; min-width: 20px; padding: 1px 5px;
    font-family: 'SF Mono', 'Menlo', monospace; font-size: 11px; font-weight: 500;
    color: var(--text-primary, #f5f3ff);
    background: rgba(var(--primary-rgb, 99, 102, 241), 0.1);
    border: 1px solid rgba(var(--primary-rgb, 99, 102, 241), 0.2);
    border-radius: 3px; text-align: center; line-height: 1.5;
  }
}

.yipet-editor-badge {
  font-size: 9px; font-weight: 500; padding: 1px 5px; border-radius: 8px;
  color: rgba(var(--primary-rgb, 99, 102, 241), 0.8);
  background: rgba(var(--primary-rgb, 99, 102, 241), 0.1);
  margin-left: 4px;
}

.yipet-editor-lock { font-size: 10px; margin-left: 4px; opacity: 0.4; }

.yipet-editor-actions { display: flex; gap: 4px; flex-shrink: 0; }
</style>