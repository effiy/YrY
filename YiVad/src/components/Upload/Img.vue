<template>
  <div class="upload-box">
    <el-upload
      :id="uuid"
      action="#"
      :class="['upload', self_disabled ? 'disabled' : '', drag ? 'no-border' : '']"
      :multiple="false"
      :disabled="self_disabled"
      :show-file-list="false"
      :http-request="handleHttpUpload"
      :before-upload="beforeUpload"
      :on-success="uploadSuccess"
      :on-error="uploadError"
      :drag="drag"
      :accept="fileType.join(',')"
    >
      <template v-if="imageUrl">
        <img :src="imageUrl" class="upload-image" />
        <div class="upload-handle" @click.stop>
          <div v-if="!self_disabled" class="handle-icon" @click="editImg">
            <el-icon><Edit /></el-icon>
            <span>Edit</span>
          </div>
          <div class="handle-icon" @click="imgViewVisible = true">
            <el-icon><ZoomIn /></el-icon>
            <span>View</span>
          </div>
          <div v-if="!self_disabled" class="handle-icon" @click="deleteImg">
            <el-icon><Delete /></el-icon>
            <span>Delete</span>
          </div>
        </div>
      </template>
      <template v-else>
        <div class="upload-empty">
          <slot name="empty">
            <el-icon><Plus /></el-icon>
            <!-- <span>Please upload image</span> -->
          </slot>
        </div>
      </template>
    </el-upload>
    <div class="el-upload__tip">
      <slot name="tip"></slot>
    </div>
    <el-image-viewer v-if="imgViewVisible" :url-list="[imageUrl]" @close="imgViewVisible = false" />
  </div>
</template>

<script setup lang="ts" name="UploadImg">
import { ref, computed, inject } from "vue";
import { generateUUID } from "@/utils";
import { uploadImg } from "@/api/modules/upload";
import { ElNotification, formContextKey, formItemContextKey } from "element-plus";
import type { UploadProps, UploadRequestOptions } from "element-plus";

interface UploadFileProps {
  imageUrl: string; // Image URL ==> required
  api?: (params: any) => Promise<any>; // Upload image API method, usually the same API across the project, can be imported directly in the component ==> optional
  drag?: boolean; // Whether to support drag upload ==> optional (default true)
  disabled?: boolean; // Whether to disable upload component ==> optional (default false)
  fileSize?: number; // Image size limit ==> optional (default 5M)
  fileType?: File.ImageMimeType[]; // Image type limit ==> optional (default ["image/jpeg", "image/png", "image/gif"])
  height?: string; // Component height ==> optional (default 150px)
  width?: string; // Component width ==> optional (default 150px)
  borderRadius?: string; // Component border radius ==> optional (default 8px)
}

// Accept parent component params
const props = withDefaults(defineProps<UploadFileProps>(), {
  imageUrl: "",
  drag: true,
  disabled: false,
  fileSize: 5,
  fileType: () => ["image/jpeg", "image/png", "image/gif"],
  height: "150px",
  width: "150px",
  borderRadius: "8px"
});

// Generate unique component id
const uuid = ref("id-" + generateUUID());

// View image
const imgViewVisible = ref(false);
// Get el-form component context
const formContext = inject(formContextKey, void 0);
// Get el-form-item component context
const formItemContext = inject(formItemContextKey, void 0);
// Determine if upload and delete are disabled
const self_disabled = computed(() => {
  return props.disabled || formContext?.disabled;
});

/**
 * @description Image upload
 * @param options All upload config options
 * */
const emit = defineEmits<{
  "update:imageUrl": [value: string];
}>();
const handleHttpUpload = async (options: UploadRequestOptions) => {
  let formData = new FormData();
  formData.append("file", options.file);
  try {
    const api = props.api ?? uploadImg;
    const { data } = await api(formData);
    emit("update:imageUrl", data.fileUrl);
    // Call el-form internal validation method (auto-validate)
    formItemContext?.prop && formContext?.validateField([formItemContext.prop as string]);
  } catch (error) {
    options.onError(error as any);
  }
};

/**
 * @description Delete image
 * */
const deleteImg = () => {
  emit("update:imageUrl", "");
};

/**
 * @description Edit image
 * */
const editImg = () => {
  const dom = document.querySelector(`#${uuid.value} .el-upload__input`);
  dom && dom.dispatchEvent(new MouseEvent("click"));
};

/**
 * @description Validate before file upload
 * @param rawFile Selected file
 * */
const beforeUpload: UploadProps["beforeUpload"] = rawFile => {
  const imgSize = rawFile.size / 1024 / 1024 < props.fileSize;
  const imgType = props.fileType.includes(rawFile.type as File.ImageMimeType);
  if (!imgType)
    ElNotification({
      title: "Notice",
      message: "Uploaded image does not match the required format!",
      type: "warning"
    });
  if (!imgSize)
    setTimeout(() => {
      ElNotification({
        title: "Notice",
        message: `Image size cannot exceed ${props.fileSize}M!`,
        type: "warning"
      });
    }, 0);
  return imgType && imgSize;
};

/**
 * @description Image upload success
 * */
const uploadSuccess = () => {
  ElNotification({
    title: "Notice",
    message: "Image uploaded successfully!",
    type: "success"
  });
};

/**
 * @description Image upload error
 * */
const uploadError = () => {
  ElNotification({
    title: "Notice",
    message: "Image upload failed, please re-upload!",
    type: "error"
  });
};
</script>

<style scoped lang="scss">
.is-error {
  .upload {
    :deep(.el-upload),
    :deep(.el-upload-dragger) {
      border: 1px dashed var(--el-color-danger) !important;
      &:hover {
        border-color: var(--el-color-primary) !important;
      }
    }
  }
}
:deep(.disabled) {
  .el-upload,
  .el-upload-dragger {
    cursor: not-allowed !important;
    background: var(--el-disabled-bg-color);
    border: 1px dashed var(--el-border-color-darker) !important;
    &:hover {
      border: 1px dashed var(--el-border-color-darker) !important;
    }
  }
}
.upload-box {
  .no-border {
    :deep(.el-upload) {
      border: none !important;
    }
  }
  :deep(.upload) {
    .el-upload {
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
      width: v-bind(width);
      height: v-bind(height);
      overflow: hidden;
      border: 1px dashed var(--el-border-color-darker);
      border-radius: v-bind(borderRadius);
      transition: var(--el-transition-duration-fast);
      &:hover {
        border-color: var(--el-color-primary);
        .upload-handle {
          opacity: 1;
        }
      }
      .el-upload-dragger {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 100%;
        height: 100%;
        padding: 0;
        overflow: hidden;
        background-color: transparent;
        border: 1px dashed var(--el-border-color-darker);
        border-radius: v-bind(borderRadius);
        &:hover {
          border: 1px dashed var(--el-color-primary);
        }
      }
      .el-upload-dragger.is-dragover {
        background-color: var(--el-color-primary-light-9);
        border: 2px dashed var(--el-color-primary) !important;
      }
      .upload-image {
        width: 100%;
        height: 100%;
        object-fit: contain;
      }
      .upload-empty {
        position: relative;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        font-size: 12px;
        line-height: 30px;
        color: var(--el-color-info);
        .el-icon {
          font-size: 28px;
          color: var(--el-text-color-secondary);
        }
      }
      .upload-handle {
        position: absolute;
        top: 0;
        right: 0;
        box-sizing: border-box;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 100%;
        height: 100%;
        cursor: pointer;
        background: rgb(0 0 0 / 60%);
        opacity: 0;
        transition: var(--el-transition-duration-fast);
        .handle-icon {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 0 6%;
          color: aliceblue;
          .el-icon {
            margin-bottom: 40%;
            font-size: 130%;
            line-height: 130%;
          }
          span {
            font-size: 85%;
            line-height: 85%;
          }
        }
      }
    }
  }
  .el-upload__tip {
    line-height: 18px;
    text-align: center;
  }
}
</style>
