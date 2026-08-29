<template>
  <Teleport to="body">
    <div v-if="visible" class="shortcuts-overlay" @click.self="close">
      <div class="shortcuts">
        <div class="shortcuts__head">
          <h2>Keyboard Shortcuts</h2>
          <el-button text :icon="Close" @click="close" />
        </div>
        <div class="shortcuts__body">
          <div v-for="group in groups" :key="group.label" class="shortcuts__group">
            <h4>{{ group.label }}</h4>
            <div v-for="s in group.shortcuts" :key="s.key" class="shortcuts__row">
              <span class="shortcuts__desc">{{ s.desc }}</span>
              <kbd>{{ s.key }}</kbd>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts" name="keyboardShortcuts">
import { ref, onMounted, onUnmounted } from "vue";
import { Close } from "@element-plus/icons-vue";

const visible = ref(false);

const groups = [
  {
    label: "Navigation",
    shortcuts: [
      { key: "Cmd+K", desc: "Command Palette" },
      { key: "?", desc: "Show Shortcuts" },
      { key: "G I", desc: "Go to Issues" },
      { key: "G P", desc: "Go to Projects" },
      { key: "G K", desc: "Go to Kanban" },
      { key: "G C", desc: "Go to Cycles" },
      { key: "G A", desc: "Go to Analytics" }
    ]
  },
  {
    label: "Issues",
    shortcuts: [
      { key: "N I", desc: "New Issue" },
      { key: "Ctrl+Enter", desc: "Submit Comment" },
      { key: "Esc", desc: "Close Dialog / Modal" }
    ]
  },
  {
    label: "Editor",
    shortcuts: [
      { key: "Ctrl+B", desc: "Bold" },
      { key: "Ctrl+I", desc: "Italic" },
      { key: "Ctrl+L", desc: "Link" },
      { key: "Ctrl+K", desc: "Code" }
    ]
  }
];

function globalKeydown(e: KeyboardEvent) {
  if (e.key === "?" && !e.ctrlKey && !e.metaKey && !isInputTarget(e)) {
    e.preventDefault();
    visible.value = !visible.value;
  }
  if (e.key === "Escape" && visible.value) {
    visible.value = false;
  }
}

function isInputTarget(e: KeyboardEvent): boolean {
  const tag = (e.target as HTMLElement)?.tagName;
  return tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT";
}

function close() { visible.value = false; }

onMounted(() => { document.addEventListener("keydown", globalKeydown); });
onUnmounted(() => { document.removeEventListener("keydown", globalKeydown); });
</script>

<style scoped>
.shortcuts-overlay {
  position: fixed;
  inset: 0;
  z-index: 9999;
  background: rgba(0,0,0,0.35);
  display: flex;
  justify-content: center;
  padding-top: 12vh;
}
.shortcuts {
  width: 520px;
  max-height: 500px;
  background: var(--el-bg-color);
  border-radius: 12px;
  box-shadow: 0 8px 40px rgba(0,0,0,0.2);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}
.shortcuts__head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid var(--el-border-color);
  h2 { margin: 0; font-size: 16px; }
}
.shortcuts__body {
  flex: 1;
  overflow-y: auto;
  padding: 16px 20px;
}
.shortcuts__group {
  margin-bottom: 20px;
  h4 {
    margin: 0 0 10px;
    font-size: 12px;
    color: var(--el-text-color-placeholder);
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
}
.shortcuts__row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 5px 0;
}
.shortcuts__desc { font-size: 13px; }
kbd {
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 4px;
  background: var(--el-fill-color);
  border: 1px solid var(--el-border-color);
  font-family: monospace;
}
</style>