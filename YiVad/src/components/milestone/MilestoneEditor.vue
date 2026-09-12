<template>
  <el-dialog
    :model-value="true"
    :title="milestone ? '编辑里程碑' : '新建里程碑'"
    width="560px"
    @close="$emit('close')"
  >
    <el-form ref="formRef" :model="form" label-width="80px">
      <el-form-item label="标题" required>
        <el-input v-model="form.title" placeholder="里程碑标题" />
      </el-form-item>
      <el-form-item label="描述">
        <el-input v-model="form.description" type="textarea" :rows="3" placeholder="可选描述" />
      </el-form-item>
      <el-row :gutter="16">
        <el-col :span="12">
          <el-form-item label="开始日期">
            <el-date-picker v-model="form.start_date" type="date" placeholder="选择开始日期" style="width:100%" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="目标日期">
            <el-date-picker v-model="form.target_date" type="date" placeholder="选择目标日期" style="width:100%" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-form-item label="状态">
        <el-select v-model="form.status" style="width:100%">
          <el-option
            v-for="(info, key) in MILESTONE_STATUS_MAP"
            :key="key"
            :label="info.label"
            :value="key"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="负责人">
        <el-input v-model="form.owner" placeholder="负责人" />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="$emit('close')">取消</el-button>
      <el-button
        v-if="milestone"
        type="danger"
        plain
        @click="handleDelete"
      >删除</el-button>
      <el-button type="primary" @click="handleSave">
        {{ milestone ? '保存' : '创建' }}
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts" name="MilestoneEditor">
import { ref, reactive } from "vue";
import { createMilestone, updateMilestone, deleteMilestone } from "@/api/modules/milestoneService";
import { MILESTONE_STATUS_MAP, type Milestone, type MilestoneFormData } from "@/types/milestone";
import { ElMessage, ElMessageBox } from "element-plus";

const props = defineProps<{
  milestone: Milestone | null;
  projectKey: string;
}>();

const emit = defineEmits<{ close: []; saved: [] }>();

const form = reactive<MilestoneFormData>({
  title: props.milestone?.title || "",
  description: props.milestone?.description || "",
  target_date: props.milestone?.target_date || "",
  start_date: props.milestone?.start_date || "",
  status: props.milestone?.status || "planned",
  linked_issues: props.milestone?.linked_issues || [],
  dependencies: props.milestone?.dependencies || [],
  owner: props.milestone?.owner || "",
});

async function handleSave() {
  if (!form.title?.trim()) {
    ElMessage.warning("请输入里程碑标题");
    return;
  }
  try {
    if (props.milestone) {
      await updateMilestone(props.milestone.key, { ...form } as any);
    } else {
      await createMilestone({ ...form, project_key: props.projectKey } as any);
    }
    ElMessage.success(props.milestone ? "已更新" : "已创建");
    emit("saved");
  } catch {
    ElMessage.error("操作失败");
  }
}

async function handleDelete() {
  if (!props.milestone) return;
  try {
    await ElMessageBox.confirm("确定要删除此里程碑吗？", "确认删除", { type: "warning" });
    await deleteMilestone(props.milestone.key);
    ElMessage.success("已删除");
    emit("saved");
  } catch {
    // Cancelled or error
  }
}
</script>