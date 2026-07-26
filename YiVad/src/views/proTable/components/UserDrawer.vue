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
        <UploadImg v-model:image-url="drawerProps.row!.avatar" width="135px" height="135px" :file-size="3">
          <template #empty>
            <el-icon><Avatar /></el-icon>
            <span>Please upload avatar</span>
          </template>
          <template #tip> Avatar size must not exceed 3MB </template>
        </UploadImg>
      </el-form-item>
      <el-form-item label="Photo" prop="photo">
        <UploadImgs v-model:file-list="drawerProps.row!.photo" height="140px" width="140px" border-radius="50%">
          <template #empty>
            <el-icon><Picture /></el-icon>
            <span>Please upload photos</span>
          </template>
          <template #tip> Photo size must not exceed 5MB </template>
        </UploadImgs>
      </el-form-item>
      <el-form-item label="Username" prop="username">
        <el-input v-model="drawerProps.row!.username" placeholder="Please enter username" clearable></el-input>
      </el-form-item>
      <el-form-item label="Gender" prop="gender">
        <el-select v-model="drawerProps.row!.gender" placeholder="Please select gender" clearable>
          <el-option v-for="item in genderType" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
      </el-form-item>
      <el-form-item label="ID Card" prop="idCard">
        <el-input v-model="drawerProps.row!.idCard" placeholder="Please enter ID card number" clearable></el-input>
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
import { ref, reactive } from "vue";
import { genderType } from "@/utils/dict";
import { ElMessage, FormInstance } from "element-plus";
import { User } from "@/api/interface";
import UploadImg from "@/components/Upload/Img.vue";
import UploadImgs from "@/components/Upload/Imgs.vue";

const rules = reactive({
  avatar: [{ required: true, message: "Please upload an avatar" }],
  photo: [{ required: true, message: "Please upload a photo" }],
  username: [{ required: true, message: "Please enter a username" }],
  gender: [{ required: true, message: "Please select a gender" }],
  idCard: [{ required: true, message: "Please enter an ID card number" }],
  email: [{ required: true, message: "Please enter an email" }],
  address: [{ required: true, message: "Please enter an address" }]
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
      ElMessage.success({ message: `${drawerProps.value.title} user successfully!` });
      drawerProps.value.getTableList!();
      drawerVisible.value = false;
    } catch (error) {
      console.log(error);
    }
  });
};

defineExpose({
  acceptParams
});
</script>
