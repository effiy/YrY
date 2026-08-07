<template>
  <el-drawer v-model="drawerVisible" :destroy-on-close="true" size="450px" :title="`${drawerProps.title} User`">
    <el-form
      ref="ruleFormRef"
      label-width="100px"
      label-suffix=" :"
      :rules="rules"
      :disabled="drawerProps.isView"
      :model="drawerProps.row"
      :hide-required-asterisk="drawerProps.isView"
    >
      <el-form-item label="Avatar" prop="avatar">
        <UploadImg v-model:image-url="drawerProps.row!.avatar!" width="135px" height="135px" :file-size="3">
          <template #empty>
            <el-icon><Avatar /></el-icon>
            <span>Please upload avatar</span>
          </template>
          <template #tip> Avatar size must not exceed 3M </template>
        </UploadImg>
      </el-form-item>
      <el-form-item label="Photo" prop="photo">
        <UploadImgs v-model:file-list="(drawerProps.row as any).photo" height="140px" width="140px" border-radius="50%">
          <template #empty>
            <el-icon><Picture /></el-icon>
            <span>Please upload photo</span>
          </template>
          <template #tip> Photo size must not exceed 5M </template>
        </UploadImgs>
      </el-form-item>
      <el-form-item label="User Name" prop="username">
        <el-input v-model="drawerProps.row!.username" placeholder="Please enter user name" clearable></el-input>
      </el-form-item>
      <el-form-item label="Gender" prop="gender">
        <el-select v-model="drawerProps.row!.gender" placeholder="Please select gender" clearable>
          <el-option v-for="item in genderType" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
      </el-form-item>
      <el-form-item label="ID Card" prop="idCard">
        <el-input v-model="drawerProps.row!.idCard" placeholder="Please enter ID card" clearable></el-input>
      </el-form-item>
      <el-form-item label="Email" prop="email">
        <el-input v-model="drawerProps.row!.email" placeholder="Please enter email" clearable></el-input>
      </el-form-item>
      <el-form-item label="Address" prop="address">
        <el-input v-model="drawerProps.row!.address" placeholder="Please enter address" clearable></el-input>
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="drawerVisible = false">Cancel</el-button>
      <el-button v-show="!drawerProps.isView" type="primary" @click="handleSubmit">Confirm</el-button>
    </template>
  </el-drawer>
</template>

<script setup lang="ts" name="UserDrawer">
import { ElMessage, FormInstance } from "element-plus";
import { reactive, ref } from "vue";

import { User } from "@/api/interface";
import UploadImg from "@/components/Upload/Img.vue";
import UploadImgs from "@/components/Upload/Imgs.vue";
import { genderType } from "@/utils/dict";

const rules = reactive({
  avatar: [{ required: true, message: "Please upload avatar" }],
  photo: [{ required: true, message: "Please upload photo" }],
  username: [{ required: true, message: "Enter user name" }],
  gender: [{ required: true, message: "Select gender" }],
  idCard: [{ required: true, message: "Enter ID card number" }],
  email: [{ required: true, message: "Enter email" }],
  address: [{ required: true, message: "Enter address" }]
});

interface DrawerProps {
  title: string;
  isView: boolean;
  row: Partial<User.ResUserList>;
  api?: (params: any) => Promise<any>;
  getTableList?: () => void;
}

const drawerVisible = ref(false);
const drawerProps = ref<DrawerProps>({
  isView: false,
  title: "",
  row: {}
});

// Receive params from parent component
const acceptParams = (params: DrawerProps) => {
  drawerProps.value = params;
  drawerVisible.value = true;
};

// Submit data (Add/Edit)
const ruleFormRef = ref<FormInstance>();
const handleSubmit = () => {
  ruleFormRef.value!.validate(async valid => {
    if (!valid) return;
    try {
      await drawerProps.value.api!(drawerProps.value.row);
      ElMessage.success({ message: `${drawerProps.value.title} User saved successfully!` });
      drawerProps.value.getTableList!();
      drawerVisible.value = false;
    } catch (error) {
      console.error(error);
      ElMessage.error({ message: `Failed to save user: ${error}` });
    }
  });
};

defineExpose({
  acceptParams
});
</script>
