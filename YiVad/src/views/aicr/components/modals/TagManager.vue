<script setup lang="ts" name="aicrTagManager">
import { computed, ref, watch } from "vue";
import { useAicrModalStore } from "@/stores/modules/aicr/modals";
import { useAicrFilterStore } from "@/stores/modules/aicr/filters";
import { useAicrSessionStore } from "@/stores/modules/aicr/sessions";
import { useAicrChatStore } from "@/stores/modules/aicr/chat";
import { getSessions, updateSession } from "@/api/modules/sessions";

const modalStore = useAicrModalStore();
const filterStore = useAicrFilterStore();
const sessionStore = useAicrSessionStore();
const chatStore = useAicrChatStore();

const visible = computed({
  get: () => modalStore.tagManagerVisible,
  set: v => {
    if (!v) modalStore.toggleTagManager();
  }
});

const allTags = computed(() => {
  const s = new Set<string>([
    ...filterStore.allStoryTags,
    ...filterStore.allSkillTags,
    ...filterStore.allTemplateTags,
    ...filterStore.allRuleTags,
    ...filterStore.allAgentTags
  ]);
  return [...s].sort((a, b) => a.localeCompare(b, "zh-CN")).map(name => ({ name, count: filterStore.tagCounts[name] || 0 }));
});

const renameDraft = ref<Record<string, string>>({});
const renaming = ref<string | null>(null);
const busy = ref(false);

watch(visible, v => {
  if (v) filterStore.refreshTagUniverse();
});

function startRename(tag: string) {
  renameDraft.value[tag] = tag;
  renaming.value = tag;
}

async function confirmRename(oldName: string) {
  const newName = (renameDraft.value[oldName] || "").trim();
  if (!newName || newName === oldName) {
    renaming.value = null;
    return;
  }
  busy.value = true;
  try {
    const all = await getSessions();
    const affected = all.filter(s => (s.tags ?? []).includes(oldName));
    await Promise.all(affected.map(s => updateSession(s.key, { tags: (s.tags ?? []).map(t => (t === oldName ? newName : t)) })));
    await sessionStore.loadSessions();
    await filterStore.refreshTagUniverse();
    // Also rename in the user's current selections.
    const replaceIn = (arr: string[]) => arr.map(t => (t === oldName ? newName : t));
    filterStore.selectedProjectTags = replaceIn(filterStore.selectedProjectTags);
    filterStore.selectedSkillTags = replaceIn(filterStore.selectedSkillTags);
    filterStore.selectedTemplateTags = replaceIn(filterStore.selectedTemplateTags);
    filterStore.selectedRuleTags = replaceIn(filterStore.selectedRuleTags);
    filterStore.selectedAgentTags = replaceIn(filterStore.selectedAgentTags);
    // Sync the active chat session's tags — otherwise the welcome card's
    // tag chip keeps showing the old name until the user reselects the file.
    if (chatStore.activeSession && (chatStore.activeSession.tags ?? []).includes(oldName)) {
      chatStore.activeSession = {
        ...chatStore.activeSession,
        tags: (chatStore.activeSession.tags ?? []).map(t => (t === oldName ? newName : t))
      };
    }
  } finally {
    busy.value = false;
    renaming.value = null;
  }
}

async function removeTag(tag: string) {
  busy.value = true;
  try {
    const all = await getSessions();
    const affected = all.filter(s => (s.tags ?? []).includes(tag));
    await Promise.all(affected.map(s => updateSession(s.key, { tags: (s.tags ?? []).filter(t => t !== tag) })));
    await sessionStore.loadSessions();
    await filterStore.refreshTagUniverse();
    // Same staleness fix as confirmRename — drop the tag from the active
    // chat session so the welcome card reflects the deletion immediately.
    if (chatStore.activeSession && (chatStore.activeSession.tags ?? []).includes(tag)) {
      chatStore.activeSession = {
        ...chatStore.activeSession,
        tags: (chatStore.activeSession.tags ?? []).filter(t => t !== tag)
      };
    }
  } finally {
    busy.value = false;
  }
}
</script>

<template>
  <el-dialog v-model="visible" title="Tag Manager" width="560px" :close-on-click-modal="false">
    <el-table :data="allTags" max-height="400" size="small">
      <el-table-column label="Tag" min-width="180">
        <template #default="{ row }">
          <el-input
            v-if="renaming === row.name"
            v-model="renameDraft[row.name]"
            size="small"
            @keyup.enter="confirmRename(row.name)"
          />
          <span v-else>{{ row.name }}</span>
          <span class="tm-count">({{ row.count }})</span>
        </template>
      </el-table-column>
      <el-table-column label="" width="160">
        <template #default="{ row }">
          <el-button v-if="renaming === row.name" size="small" type="primary" :loading="busy" @click="confirmRename(row.name)"
            >OK</el-button
          >
          <el-button v-else size="small" text @click="startRename(row.name)">Rename</el-button>
          <el-button size="small" text type="danger" :loading="busy" @click="removeTag(row.name)">Delete</el-button>
        </template>
      </el-table-column>
    </el-table>
    <template #footer>
      <el-button @click="modalStore.toggleTagManager()">Close</el-button>
    </template>
  </el-dialog>
</template>

<style scoped lang="scss">
.tm-count {
  margin-left: 6px;
  font-size: 12px;
  color: var(--el-text-color-placeholder);
}
</style>
