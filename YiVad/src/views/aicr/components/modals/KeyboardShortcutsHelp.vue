<script setup lang="ts" name="aicrKeyboardShortcutsHelp">
import { computed } from "vue";
import { useAicrModalStore } from "@/stores/modules/aicr/modals";

const modalStore = useAicrModalStore();

const visible = computed({
  get: () => modalStore.shortcutHelpVisible,
  set: v => {
    if (!v) modalStore.toggleShortcutHelp();
  }
});

const shortcuts = [
  { keys: "?", desc: "Toggle this shortcuts help" },
  { keys: "Esc", desc: "Clear file-tree search / session search / all tag filters" },
  { keys: "Enter", desc: "Send chat message (in textarea)" },
  { keys: "Shift + Enter", desc: "Newline in chat input" },
  { keys: "Ctrl/Cmd + Shift + Enter", desc: "Add FAQ in FAQ manager" },
  { keys: "Drag sidebar/chat edge", desc: "Resize sidebar/chat panels (width persisted)" }
];
</script>

<template>
  <el-dialog v-model="visible" title="Keyboard Shortcuts" width="480px">
    <el-table :data="shortcuts" size="small">
      <el-table-column label="Keys" prop="keys" width="180" />
      <el-table-column label="Action" prop="desc" />
    </el-table>
    <template #footer>
      <el-button type="primary" @click="modalStore.toggleShortcutHelp()">Close</el-button>
    </template>
  </el-dialog>
</template>
