<template>
  <div class="upload content-box">
    <!-- Multiple image upload -->
    <div class="card img-box">
      <span class="text">Multi-Image Upload Component 🍓🍇🍈🍉</span>
      <div class="upload-list">
        <UploadImgs v-model:file-list="fileList" :drag="false" border-radius="50%">
          <template #empty>
            <el-icon><Picture /></el-icon>
            <span>Please upload photos</span>
          </template>
          <template #tip> Circular component, max image size 5MB (drag upload disabled) </template>
        </UploadImgs>
        <UploadImgs v-model:file-list="fileList1" width="250px">
          <template #empty>
            <el-icon><Picture /></el-icon>
            <span>Please upload photos</span>
          </template>
          <template #tip> Rectangular component (drag upload enabled) </template>
        </UploadImgs>
      </div>
      <el-descriptions title="Config Options 📚 (other params same as single image upload)" :column="1" border>
        <el-descriptions-item label="fileList">
          Two-way bound fileList value, e.g.: v-model:file-list="fileList"
        </el-descriptions-item>
        <el-descriptions-item label="limit"> Max number of images, default 5 </el-descriptions-item>
      </el-descriptions>
    </div>
    <!-- Single image upload -->
    <div class="card img-box">
      <span class="text">Single Image Upload Component 🍓🍇🍈🍉</span>
      <div class="upload-list">
        <UploadImg v-model:image-url="avatar1" :file-size="3">
          <template #tip> Max image size 3MB </template>
        </UploadImg>
        <UploadImg v-model:image-url="avatar2" :drag="false" border-radius="50%">
          <template #empty>
            <el-icon><Avatar /></el-icon>
            <span>Please upload avatar</span>
          </template>
          <template #tip> Circular component (drag upload disabled) </template>
        </UploadImg>
        <UploadImg v-model:image-url="avatar3" width="250px">
          <template #empty>
            <el-icon><Picture /></el-icon>
            <span>Please upload banner image</span>
          </template>
          <template #tip> Rectangular component (drag upload enabled) </template>
        </UploadImg>
        <UploadImg v-model:image-url="avatar4" disabled>
          <template #tip> No image (upload disabled) </template>
        </UploadImg>
        <UploadImg v-model:image-url="avatar5" disabled>
          <template #tip> Has image (edit & delete disabled) </template>
        </UploadImg>
      </div>
      <el-descriptions title="Config Options 📚" :column="1" border>
        <el-descriptions-item label="imageUrl">
          Two-way bound imageUrl value, e.g.: v-model:image-url="avatar"
        </el-descriptions-item>
        <el-descriptions-item label="api">
          API method for uploading images; typically the same API across the project, can be imported directly in the component
          (optional)
        </el-descriptions-item>
        <el-descriptions-item label="drag"> Whether drag upload is supported, default true </el-descriptions-item>
        <el-descriptions-item label="disabled">
          Whether to disable upload & delete; viewing is still allowed
        </el-descriptions-item>
        <el-descriptions-item label="fileSize"> Max single image file size, default 5MB </el-descriptions-item>
        <el-descriptions-item label="fileType">
          Allowed image types, defaults to ["image/jpeg", "image/png", "image/gif"]
        </el-descriptions-item>
        <el-descriptions-item label="height"> Component height style, default "150px" </el-descriptions-item>
        <el-descriptions-item label="width"> Component width style, default "150px" </el-descriptions-item>
        <el-descriptions-item label="borderRadius"> Component border radius style, default "8px" </el-descriptions-item>
      </el-descriptions>
    </div>

    <!-- Form usage -->
    <div class="form-box">
      <div class="card">
        <el-alert
          title="Image upload components used in forms will auto re-validate after upload success"
          type="warning"
          effect="dark"
          :closable="false"
          class="mb20"
        />
        <el-form ref="ruleFormRef" label-width="100px" label-suffix=" :" :rules="rules" :model="fromModel">
          <el-form-item label="Avatar" prop="avatar">
            <UploadImg v-model:image-url="fromModel.avatar" width="135px" height="135px" :file-size="3">
              <template #empty>
                <el-icon><Avatar /></el-icon>
                <span>Please upload avatar</span>
              </template>
              <template #tip> Avatar size must not exceed 3MB </template>
            </UploadImg>
          </el-form-item>
          <el-form-item label="Photo" prop="photo">
            <UploadImgs v-model:file-list="fromModel.photo" :limit="3" height="140px" width="140px" border-radius="50%">
              <template #empty>
                <el-icon><Picture /></el-icon>
                <span>Please upload photos</span>
              </template>
              <template #tip> Max 3 photos </template>
            </UploadImgs>
          </el-form-item>
          <el-form-item label="Username" prop="username">
            <el-input v-model="fromModel.username" placeholder="Please enter username" clearable></el-input>
          </el-form-item>
          <el-form-item label="ID Card" prop="idCard">
            <el-input v-model="fromModel.idCard" placeholder="Please enter ID card number" clearable></el-input>
          </el-form-item>
          <el-form-item label="Email" prop="email">
            <el-input v-model="fromModel.email" placeholder="Please enter email" clearable></el-input>
          </el-form-item>
          <el-form-item>
            <el-button> Cancel </el-button>
            <el-button type="primary" @click="submit"> Confirm </el-button>
          </el-form-item>
        </el-form>
      </div>
      <div class="card">
        <el-alert
          title="When image upload components are used in a disabled form, they are automatically disabled"
          type="warning"
          effect="dark"
          :closable="false"
          class="mb20"
        />
        <el-form label-width="100px" label-suffix=" :" disabled :model="fromModel1">
          <el-form-item label="Avatar" prop="avatar">
            <UploadImg v-model:image-url="fromModel1.avatar" width="135px" height="135px" :file-size="3">
              <template #empty>
                <el-icon><Avatar /></el-icon>
                <span>Please upload avatar</span>
              </template>
              <template #tip> Avatar size must not exceed 3MB </template>
            </UploadImg>
          </el-form-item>
          <el-form-item label="Photo" prop="photo">
            <UploadImgs v-model:file-list="fromModel1.photo" height="140px" width="140px" border-radius="50%">
              <template #empty>
                <el-icon><Picture /></el-icon>
                <span>Please upload photos</span>
              </template>
              <template #tip> Photo size must not exceed 5MB </template>
            </UploadImgs>
          </el-form-item>
          <el-form-item label="Username" prop="username">
            <el-input v-model="fromModel1.username" placeholder="Please enter username" clearable></el-input>
          </el-form-item>
          <el-form-item label="ID Card" prop="idCard">
            <el-input v-model="fromModel1.idCard" placeholder="Please enter ID card number" clearable></el-input>
          </el-form-item>
          <el-form-item label="Email" prop="email">
            <el-input v-model="fromModel1.email" placeholder="Please enter email" clearable></el-input>
          </el-form-item>
          <el-form-item>
            <el-button> Cancel </el-button>
            <el-button type="primary" @click="submit"> Confirm </el-button>
          </el-form-item>
        </el-form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts" name="uploadFile">
import { ref, reactive } from "vue";
import { FormInstance } from "element-plus";
import UploadImg from "@/components/Upload/Img.vue";
import UploadImgs from "@/components/Upload/Imgs.vue";

const fileList = ref([{ name: "img", url: "https://i.imgtg.com/2023/01/16/QRBHS.jpg" }]);
const fileList1 = ref([]);

const avatar1 = ref("");
const avatar2 = ref("");
const avatar3 = ref("");
const avatar4 = ref("");
const avatar5 = ref("https://i.imgtg.com/2023/01/16/QRqMK.jpg");

const rules = reactive({
  avatar: [{ required: true, message: "Please upload an avatar" }],
  photo: [{ required: true, message: "Please upload a photo" }],
  username: [{ required: true, message: "Please enter a username" }],
  idCard: [{ required: true, message: "Please enter an ID card number" }],
  email: [{ required: true, message: "Please enter an email" }]
});

const fromModel = ref({
  avatar: "",
  photo: [{ name: "img", url: "https://i.imgtg.com/2023/01/16/QR57a.jpg" }],
  username: "",
  idCard: "",
  email: ""
});
const fromModel1 = ref({
  avatar: "",
  photo: [{ name: "img", url: "https://i.imgtg.com/2023/01/16/QR57a.jpg" }],
  username: "",
  idCard: "",
  email: ""
});
const ruleFormRef = ref<FormInstance>();
const submit = () => {
  ruleFormRef.value!.validate(valid => {
    console.log(valid);
  });
};
</script>

<style scoped lang="scss">
@use "./index.scss" as *;
</style>
