<script setup lang="ts" name="brdDocumentsList">
import { ref } from "vue";
import { useRouter } from "vue-router";
import { ElMessage } from "element-plus";
import TopicListPage from "@/components/TopicListPage/index.vue";
import BrdGenerateDialog from "@/components/BrdGenerateDialog/index.vue";
import { brdMetaSchemas } from "@/views/brd/meta-schemas";
import { createTopicEntry } from "@/api/modules/topic";
import type { ActionButton } from "@/components/TopicListPage/index.vue";

const schema = brdMetaSchemas["brd-documents"];
const actions: ActionButton[] = [
  { type: "view", label: "View Document" },
  { type: "edit", label: "Edit Document" },
  { type: "delete", label: "Delete Document" }
];

const router = useRouter();

// ── AI Generation dialog ─────────────────────────────────────────────────

const genDialogVisible = ref(false);

function openGenDialog() {
  genDialogVisible.value = true;
}

async function handleGenConfirm(data: { title: string; meta: Record<string, any>; content: string; tags: string[] }) {
  try {
    const res = await createTopicEntry("brd", "brd-documents", {
      title: data.title,
      content: data.content,
      tags: data.tags,
      meta: data.meta
    });
    genDialogVisible.value = false;
    ElMessage.success("BRD document created");
    // Navigate to the new entry in view mode
    router.push({
      name: "brdDocumentsDetail",
      params: { id: res.key },
      query: { mode: "view" }
    });
  } catch (err: any) {
    ElMessage.error(err?.message || "Failed to create BRD document");
  }
}

function handleDialogClosed() {
  genDialogVisible.value = false;
}
</script>
<template>
  <TopicListPage
    tree="brd"
    topic="brd-documents"
    label="BRD Documents"
    :meta-columns="schema.metaColumns"
    :actions="actions"
    new-entry-label="AI Generate BRD"
    :on-new-entry="openGenDialog"
  />

  <BrdGenerateDialog
    :visible="genDialogVisible"
    @update:visible="handleDialogClosed"
    @confirm="handleGenConfirm"
  />
</template>
