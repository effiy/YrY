<template>
  <div class="tag-admin">
    <div class="tag-admin__header">
      <span>共 {{ tags.length }} 个标签</span>
      <div class="tag-admin__actions">
        <el-button size="small" @click="handleCleanup">清理未使用</el-button>
        <el-button type="primary" size="small" @click="openCreate">新建标签</el-button>
      </div>
    </div>

    <div class="tag-admin__stats" v-if="stats">
      <span>总计: {{ stats.total }}</span>
      <span class="tag-admin__warn" v-if="stats.unused">未使用: {{ stats.unused }}</span>
    </div>

    <div class="tag-admin__groups">
      <div v-for="group in tagGroups" :key="group.label" class="tag-group">
        <div class="tag-group__header">{{ group.label }}</div>
        <div v-for="tag in group.tags" :key="tag.key" class="tag-row">
          <span class="tag-row__dot" :style="{ background: tag.color }" />
          <span class="tag-row__name">{{ tag.name }}</span>
          <span class="tag-row__count">{{ tag.usage_count }}</span>
          <div class="tag-row__actions">
            <el-button link size="small" @click="openEdit(tag)">编辑</el-button>
            <el-button link size="small" type="danger" @click="handleDelete(tag.key)">删除</el-button>
          </div>
        </div>
      </div>
    </div>

    <el-empty v-if="!tags.length" description="暂无标签" />

    <el-dialog v-model="dialogVisible" :title="editingTag ? '编辑标签' : '新建标签'" width="420px">
      <el-form label-width="80px">
        <el-form-item label="名称" required>
          <el-input v-model="tagForm.name" />
        </el-form-item>
        <el-form-item label="颜色">
          <el-color-picker v-model="tagForm.color" />
        </el-form-item>
        <el-form-item label="分类">
          <el-input v-model="tagForm.category" placeholder="可选" />
        </el-form-item>
        <el-form-item label="父标签">
          <el-select v-model="tagForm.parent_id" clearable placeholder="无" style="width:100%">
            <el-option v-for="t in tags" :key="t.key" :label="t.name" :value="t.key" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSave">{{ editingTag ? '保存' : '创建' }}</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts" name="TagAdmin">
import { ref, reactive, computed, onMounted } from "vue";
import { listTags, createTag, updateTag, deleteTag, cleanupUnusedTags, getTagUsageStats } from "@/api/modules/tagService";
import { ElMessage, ElMessageBox } from "element-plus";
import type { Tag, TagUsageStats } from "@/types/tag";

const tags = ref<Tag[]>([]);
const stats = ref<TagUsageStats | null>(null);
const dialogVisible = ref(false);
const editingTag = ref<Tag | null>(null);

const tagForm = reactive({
  name: "",
  color: "#409eff",
  category: "",
  parent_id: undefined as string | undefined,
});

const tagGroups = computed(() => {
  const grouped: Record<string, Tag[]> = {};
  for (const t of tags.value) {
    const cat = t.category || "未分类";
    if (!grouped[cat]) grouped[cat] = [];
    grouped[cat].push(t);
  }
  return Object.entries(grouped).map(([label, items]) => ({ label, tags: items }));
});

function openCreate() {
  editingTag.value = null;
  tagForm.name = "";
  tagForm.color = "#409eff";
  tagForm.category = "";
  tagForm.parent_id = undefined;
  dialogVisible.value = true;
}

function openEdit(tag: Tag) {
  editingTag.value = tag;
  tagForm.name = tag.name;
  tagForm.color = tag.color;
  tagForm.category = tag.category;
  tagForm.parent_id = tag.parent_id;
  dialogVisible.value = true;
}

async function handleSave() {
  if (!tagForm.name.trim()) {
    ElMessage.warning("请输入标签名称");
    return;
  }
  try {
    if (editingTag.value) {
      await updateTag(editingTag.value.key, { ...tagForm });
    } else {
      await createTag({ ...tagForm });
    }
    ElMessage.success(editingTag.value ? "已更新" : "已创建");
    dialogVisible.value = false;
    await fetchTags();
  } catch {
    ElMessage.error("操作失败");
  }
}

async function handleDelete(key: string) {
  try {
    await ElMessageBox.confirm("删除此标签将取消其所有关联，确定继续？", "确认删除", { type: "warning" });
    await deleteTag(key);
    ElMessage.success("已删除");
    await fetchTags();
  } catch {
    // Cancelled
  }
}

async function handleCleanup() {
  try {
    await ElMessageBox.confirm("将删除所有使用次数为 0 的标签", "确认清理", { type: "warning" });
    const res = await cleanupUnusedTags();
    ElMessage.success(`已清理 ${res.data?.deleted || 0} 个标签`);
    await fetchTags();
  } catch {
    // Cancelled
  }
}

async function fetchTags() {
  try {
    const res = await listTags();
    tags.value = (res.data?.list as Tag[]) ?? [];
  } catch {
    // Global error handler
  }
}

onMounted(async () => {
  await fetchTags();
  try {
    const res = await getTagUsageStats();
    stats.value = res.data as TagUsageStats;
  } catch { /* non-critical */ }
});
</script>

<style scoped lang="scss">
.tag-admin { padding: 8px 0; }
.tag-admin__header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
.tag-admin__actions { display: flex; gap: 8px; }
.tag-admin__stats { font-size: 13px; color: var(--el-text-color-secondary); margin-bottom: 12px; display: flex; gap: 16px; }
.tag-admin__warn { color: var(--el-color-warning); }
.tag-group { margin-bottom: 16px; }
.tag-group__header { font-size: 13px; font-weight: 500; color: var(--el-text-color-secondary); margin-bottom: 4px; padding: 0 4px; }
.tag-row { display: flex; align-items: center; gap: 8px; padding: 6px 12px; border-bottom: 1px solid var(--el-border-color-lighter); }
.tag-row__dot { width: 10px; height: 10px; border-radius: 3px; flex-shrink: 0; }
.tag-row__name { flex: 1; }
.tag-row__count { color: var(--el-text-color-secondary); font-size: 12px; }
.tag-row__actions { display: flex; gap: 2px; }
</style>