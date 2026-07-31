<script setup lang="ts" name="aicrFaqManager">
import { computed, ref, watch, onMounted } from "vue";
import { useAicrModalStore } from "@/stores/modules/aicr/modals";
import { useAicrFaqStore } from "@/stores/modules/aicr/faqs";
import { useAicrChatStore } from "@/stores/modules/aicr/chat";
import { useAicrWeChatStore } from "@/stores/modules/aicr/weChat";
import type { FaqDocument } from "@/api/interface/yiweb";

const modalStore = useAicrModalStore();
const faqStore = useAicrFaqStore();
const chatStore = useAicrChatStore();
const weChatStore = useAicrWeChatStore();

const visible = computed({
  get: () => modalStore.faqVisible,
  set: v => {
    if (!v) modalStore.toggleFaq();
  }
});

const newTitle = ref("");
const newPrompt = ref("");
const newTags = ref("");

const filtered = computed(() => faqStore.filtered);

watch(visible, v => {
  if (v) {
    faqStore.load();
    // Sync local model/system from chat store when opening.
  }
});

function onAddKeydown(e: Event | KeyboardEvent) {
  const ke = e as KeyboardEvent;
  if ((ke.ctrlKey || ke.metaKey || ke.shiftKey) && ke.key === "Enter") {
    e.preventDefault();
    addFaq();
  }
}

async function addFaq() {
  const title = newTitle.value.trim();
  const prompt = newPrompt.value.trim();
  if (!prompt && !title) return;
  await faqStore.add({
    key: `faq_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    title,
    prompt,
    tags: newTags.value
      .split(",")
      .map(s => s.trim())
      .filter(Boolean),
    order: faqStore.list.length + 1,
    createdAt: Date.now(),
    updatedAt: Date.now()
  });
  newTitle.value = "";
  newPrompt.value = "";
  newTags.value = "";
}

function copy(f: FaqDocument) {
  navigator.clipboard.writeText(f.prompt);
}

function insert(f: FaqDocument) {
  chatStore.input = (chatStore.input + (chatStore.input ? "\n\n" : "") + f.prompt).trim();
  modalStore.toggleFaq();
}

function sendNow(f: FaqDocument) {
  chatStore.sendMessage(f.prompt);
  modalStore.toggleFaq();
}

async function sendToWeChat(robotIdx: number, f: FaqDocument) {
  await weChatStore.sendMessage(robotIdx, f.prompt);
}
</script>

<template>
  <el-dialog v-model="visible" title="FAQ Manager" width="780px" top="5vh" :close-on-click-modal="false">
    <!-- Filters -->
    <div class="fq-filters">
      <el-input v-model="faqStore.search" size="small" placeholder="Search FAQ..." clearable style="width: 200px" />
      <el-checkbox v-model="faqStore.noTagsOnly" size="small">No tags</el-checkbox>
      <div class="fq-tags">
        <el-tag
          v-for="t in faqStore.allTags"
          :key="t"
          :type="faqStore.selectedTags.includes(t) ? 'primary' : 'info'"
          size="small"
          effect="plain"
          class="fq-tag"
          @click="faqStore.toggleTag(t)"
          >{{ t }}</el-tag
        >
      </div>
      <el-button size="small" text @click="faqStore.clearTags()">Clear</el-button>
      <el-button size="small" text @click="modalStore.toggleTagManager()">Manage</el-button>
    </div>

    <!-- Add new -->
    <div class="fq-add">
      <el-input v-model="newTitle" size="small" placeholder="Title (optional)" style="width: 200px" />
      <el-input v-model="newTags" size="small" placeholder="Tags (comma-separated)" style="width: 180px" />
      <el-input
        v-model="newPrompt"
        type="textarea"
        :rows="2"
        size="small"
        placeholder="Prompt text (Ctrl/Shift + Enter to add)"
        @keydown="onAddKeydown"
        style="flex: 1"
      />
      <el-button size="small" type="primary" @click="addFaq">Add</el-button>
    </div>

    <!-- List -->
    <el-table :data="filtered" size="small" max-height="380">
      <el-table-column label="#" width="50" type="index" />
      <el-table-column label="Title" min-width="120">
        <template #default="{ row }">
          <span class="fq-title">{{ row.title || "—" }}</span>
          <div class="fq-tags-cell">
            <el-tag v-for="t in row.tags" :key="t" size="small" effect="plain">{{ t }}</el-tag>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="Prompt" min-width="220">
        <template #default="{ row }">
          <div class="fq-prompt">{{ row.prompt }}</div>
        </template>
      </el-table-column>
      <el-table-column label="" width="280">
        <template #default="{ row, $index }">
          <el-button size="small" text @click="faqStore.moveUp($index)" :disabled="$index === 0">↑</el-button>
          <el-button size="small" text @click="faqStore.moveDown($index)" :disabled="$index === filtered.length - 1">↓</el-button>
          <el-button size="small" text @click="copy(row as FaqDocument)">Copy</el-button>
          <el-button size="small" text type="primary" @click="insert(row as FaqDocument)">Insert</el-button>
          <el-dropdown
            v-if="weChatStore.robots.length > 0"
            size="small"
            @command="(rIdx: number) => sendToWeChat(rIdx, row as FaqDocument)"
          >
            <el-button size="small" text
              >WeChat<el-icon class="el-icon--right"><ArrowDown /></el-icon
            ></el-button>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item v-for="(r, rIdx) in weChatStore.robots" :key="rIdx" :command="rIdx" :disabled="!r.enabled">
                  {{ r.name || r.webhook }}
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
          <el-button size="small" text type="danger" @click="faqStore.remove((row as FaqDocument).key)">Del</el-button>
        </template>
      </el-table-column>
    </el-table>

    <template #footer>
      <el-button @click="modalStore.toggleFaq()">Close</el-button>
      <el-button
        v-if="chatStore.activeSession"
        type="primary"
        :disabled="filtered.length === 0"
        @click="sendNow(filtered[0]!)"
        >Send First</el-button
      >
    </template>
  </el-dialog>
</template>

<style scoped lang="scss">
.fq-filters {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
  margin-bottom: 8px;
}
.fq-tags {
  display: flex;
  flex: 1;
  flex-wrap: wrap;
  gap: 4px;
}
.fq-tag {
  cursor: pointer;
}
.fq-add {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 8px;
}
.fq-title {
  font-weight: 500;
}
.fq-tags-cell {
  display: flex;
  flex-wrap: wrap;
  gap: 3px;
  margin-top: 2px;
}
.fq-prompt {
  max-height: 60px;
  overflow-y: auto;
  font-size: 12px;
  color: var(--el-text-color-secondary);
  overflow-wrap: anywhere;
  white-space: pre-wrap;
}
</style>
