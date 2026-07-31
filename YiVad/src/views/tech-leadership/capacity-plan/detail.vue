<script setup lang="ts" name="tlrCapacityPlanDetail">
import { ref, reactive, computed, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { ArrowRight, CirclePlus, ArrowLeft, Delete as DeleteIcon } from "@element-plus/icons-vue";
import { ElMessage, type FormInstance, type FormRules } from "element-plus";
import { getTopicEntry, createTopicEntry, updateTopicEntry, deleteTopicEntry, type TopicEntryDocument } from "@/api/modules/topic";

const route = useRoute();
const router = useRouter();
const formRef = ref<FormInstance>();
const loading = ref(false);
const entry = ref<TopicEntryDocument | null>(null);

const tree = "tech-leadership" as const;
const topic = "capacity-plan";
const label = "Capacity plan";

const isNew = computed(() => route.params.id === "new" || !route.params.id);

const form = reactive({ title: "", content: "", tags: [] as string[] });
const tagOptions = computed(() => Array.from(new Set([...(entry.value?.tags ?? []), ...form.tags])));
const rules: FormRules = {
  title: [{ required: true, message: "Title is required", trigger: "blur" }],
  content: [{ required: true, message: "Content is required", trigger: "blur" }]
};

async function loadEntry() {
  if (isNew.value) return;
  loading.value = true;
  try {
    const doc = await getTopicEntry<TopicEntryDocument>(tree, topic, String(route.params.id));
    if (!doc) { ElMessage.error("Entry not found"); back(); return; }
    entry.value = doc;
    form.title = doc.title;
    form.content = doc.content;
    form.tags = [...(doc.tags ?? [])];
  } catch (e: any) {
    ElMessage.error(e?.message || "Failed to load entry");
  } finally {
    loading.value = false;
  }
}

async function handleSave() {
  if (!formRef.value) return;
  const valid = await formRef.value.validate().catch(() => false);
  if (!valid) return;
  try {
    if (isNew.value) {
      await createTopicEntry(tree, topic, { title: form.title, content: form.content, tags: form.tags });
      ElMessage.success("Entry created");
    } else {
      await updateTopicEntry(tree, topic, entry.value!.key, { title: form.title, content: form.content, tags: form.tags });
      ElMessage.success("Entry updated");
    }
    back();
  } catch (e: any) {
    ElMessage.error(e?.message || "Save failed");
  }
}

async function handleDelete() {
  if (!entry.value) return;
  try {
    await deleteTopicEntry(tree, topic, entry.value.key);
    ElMessage.success("Entry deleted");
    back();
  } catch (e: any) {
    ElMessage.error(e?.message || "Delete failed");
  }
}

function back() {
  router.push({ name: "tlrCapacityPlanList" });
}

onMounted(loadEntry);
</script>

<template>
  <div class="topic-detail" v-loading="loading">
    <header class="topic-detail__header">
      <div class="topic-detail__header-left">
        <el-button :icon="ArrowLeft" link @click="back">Back to list</el-button>
        <el-divider direction="vertical" />
        <nav class="topic-detail__breadcrumb" aria-label="Breadcrumb">
          <span class="topic-detail__breadcrumb-root">{{ label }}</span>
          <el-icon><ArrowRight /></el-icon>
          <span class="topic-detail__breadcrumb-current">{{ isNew ? "New entry" : entry?.title || route.params.id }}</span>
        </nav>
      </div>
      <div class="topic-detail__header-right">
        <el-button v-if="!isNew" type="danger" :icon="DeleteIcon" @click="handleDelete">Delete</el-button>
        <el-button type="primary" :icon="CirclePlus" @click="handleSave">Save</el-button>
      </div>
    </header>
    <div class="topic-detail__body">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px" label-suffix=" :">
        <el-form-item label="Title" prop="title">
          <el-input v-model="form.title" placeholder="Concise entry title" clearable />
        </el-form-item>
        <el-form-item label="Tags" prop="tags">
          <el-select v-model="form.tags" multiple filterable allow-create default-first-option placeholder="Press Enter to add a tag" class="topic-detail__tags">
            <el-option v-for="t in tagOptions" :key="t" :label="t" :value="t" />
          </el-select>
        </el-form-item>
        <el-form-item label="Content" prop="content">
          <el-input v-model="form.content" type="textarea" :rows="14" placeholder="Fill the template; the original prompt is pre-loaded." />
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<style scoped lang="scss">
.topic-detail { display: flex; flex-direction: column; height: 100%; background: var(--el-bg-color-page); }
.topic-detail__header { display: flex; align-items: center; justify-content: space-between; padding: 12px 20px; background: var(--el-bg-color); border-bottom: 1px solid var(--el-border-color-lighter); }
.topic-detail__header-left { display: flex; gap: 8px; align-items: center; }
.topic-detail__breadcrumb { display: flex; gap: 6px; align-items: center; font-size: 13px; color: var(--el-text-color-secondary); }
.topic-detail__breadcrumb-current { font-weight: 500; color: var(--el-text-color-primary); }
.topic-detail__body { flex: 1; padding: 20px; overflow: auto; }
.topic-detail__tags { width: 100%; }
</style>
