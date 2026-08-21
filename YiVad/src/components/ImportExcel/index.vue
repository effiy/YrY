<template>
  <el-dialog v-model="dialogVisible" :title="`Batch Add ${parameter.title}`" :destroy-on-close="true" width="580px" draggable>
    <el-form class="drawer-multiColumn-form" label-width="100px">
      <el-form-item label="Template Download :">
        <el-button type="primary" :icon="Download" @click="downloadTemp"> Download </el-button>
      </el-form-item>
      <el-form-item label="File Upload :">
        <el-upload
          action="#"
          class="upload"
          :drag="true"
          :limit="excelLimit"
          :multiple="true"
          :show-file-list="true"
          :http-request="uploadExcel"
          :before-upload="beforeExcelUpload"
          :on-exceed="handleExceed"
          :on-success="excelUploadSuccess"
          :on-error="excelUploadError"
          :accept="parameter.fileType!.join(',')"
        >
          <slot name="empty">
            <el-icon class="el-icon--upload">
              <upload-filled />
            </el-icon>
            <div class="el-upload__text">Drag file here, or <em>click to upload</em></div>
          </slot>
          <template #tip>
            <slot name="tip">
              <div class="el-upload__tip">
                Please upload .xls, .xlsx standard format files, max file size {{ parameter.fileSize }}M
              </div>
            </slot>
          </template>
        </el-upload>
      </el-form-item>
      <el-form-item label="Data Overwrite :">
        <el-switch v-model="isCover" />
      </el-form-item>
    </el-form>
  </el-dialog>
</template>

<script setup lang="ts" name="ImportExcel">
import { ref } from "vue";
import { useDownload } from "@/hooks/useDownload";
import { Download } from "@element-plus/icons-vue";
import { ElNotification, UploadRequestOptions, UploadRawFile } from "element-plus";

export interface ExcelParameterProps {
  title: string; // Title
  fileSize?: number; // Upload file size limit
  fileType?: File.ExcelMimeType[]; // Upload file type
  tempApi?: (params: any) => Promise<any>; // API to download template
  importApi?: (params: any) => Promise<any>; // API to batch import
  getTableList?: () => void; // API to get table data
}

// Whether to overwrite data
const isCover = ref(false);
// Max file upload count
const excelLimit = ref(1);
// Dialog state
const dialogVisible = ref(false);
// Parameters from parent component
const parameter = ref<ExcelParameterProps>({
  title: "",
  fileSize: 5,
  fileType: ["application/vnd.ms-excel", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"]
});

// Accept parent component params
const acceptParams = (params: ExcelParameterProps) => {
  parameter.value = { ...parameter.value, ...params };
  dialogVisible.value = true;
};

// Download Excel import template
const downloadTemp = () => {
  if (!parameter.value.tempApi) return;
  useDownload(parameter.value.tempApi, `${parameter.value.title}Template`);
};

// File upload
const uploadExcel = async (param: UploadRequestOptions) => {
  let excelFormData = new FormData();
  excelFormData.append("file", param.file);
  excelFormData.append("isCover", String(isCover.value));
  await parameter.value.importApi!(excelFormData);
  parameter.value.getTableList && parameter.value.getTableList();
  dialogVisible.value = false;
};

/**
 * @description Validate before file upload
 * @param file Uploaded file
 * */
const beforeExcelUpload = (file: UploadRawFile) => {
  const isExcel = parameter.value.fileType!.includes(file.type as File.ExcelMimeType);
  const fileSize = file.size / 1024 / 1024 < parameter.value.fileSize!;
  if (!isExcel)
    ElNotification({
      title: "Notice",
      message: "Upload file must be in xls / xlsx format!",
      type: "warning"
    });
  if (!fileSize)
    setTimeout(() => {
      ElNotification({
        title: "Notice",
        message: `Upload file size cannot exceed ${parameter.value.fileSize}MB!`,
        type: "warning"
      });
    }, 0);
  return isExcel && fileSize;
};

// Alert on exceeding file count
const handleExceed = () => {
  ElNotification({
    title: "Notice",
    message: "Only one file can be uploaded!",
    type: "warning"
  });
};

// Upload error notification
const excelUploadError = () => {
  ElNotification({
    title: "Notice",
    message: `Batch add ${parameter.value.title} failed, please re-upload!`,
    type: "error"
  });
};

// Upload success notification
const excelUploadSuccess = () => {
  ElNotification({
    title: "Notice",
    message: `Batch add ${parameter.value.title} successful!`,
    type: "success"
  });
};

defineExpose({
  acceptParams
});
</script>
<style lang="scss" scoped>
@use "./index.scss" as *;
</style>
