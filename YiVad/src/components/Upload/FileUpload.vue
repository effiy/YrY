<script setup lang="ts">
import { ref, computed } from "vue";
import { useI18n } from "vue-i18n";
import type { UploadProps, UploadUserFile, UploadRequestOptions } from "element-plus";
import { ElNotification } from "element-plus";
import { UploadFilled } from "@element-plus/icons-vue";

const { t } = useI18n();

interface UploadChunk {
  fileHash: string;
  chunkIndex: number;
  totalChunks: number;
  chunkData: string;
}

const props = withDefaults(defineProps<{
  fileList?: UploadUserFile[];
  maxSize?: number; // MB
  maxCount?: number;
  accept?: string;
  disabled?: boolean;
  chunkSize?: number; // MB per chunk, 0 = no chunking
  uploadApi?: (data: FormData | UploadChunk) => Promise<any>;
}>(), {
  fileList: () => [],
  maxSize: 50,
  maxCount: 10,
  accept: "*",
  chunkSize: 5,
});

const emit = defineEmits<{
  (e: "update:fileList", value: UploadUserFile[]): void;
  (e: "upload-success", file: UploadUserFile, response: any): void;
  (e: "upload-error", file: UploadUserFile, error: any): void;
}>();

const _fileList = ref<UploadUserFile[]>(props.fileList);
const uploading = ref(false);
const uploadProgress = ref<Record<string, number>>({});

function fileKey(file: File): string {
  return `${file.name}-${file.size}-${file.lastModified}`;
}

const beforeUpload: UploadProps["beforeUpload"] = (rawFile) => {
  const sizeOk = rawFile.size / 1024 / 1024 <= props.maxSize;
  if (!sizeOk) {
    ElNotification({
      title: t("upload.sizeExceededTitle"),
      message: t("upload.sizeExceeded", { maxSize: props.maxSize }),
      type: "warning"
    });
  }
  return sizeOk;
};

const handleExceed: UploadProps["onExceed"] = () => {
  ElNotification({
    title: t("upload.countExceededTitle"),
    message: t("upload.countExceeded", { maxCount: props.maxCount }),
    type: "warning"
  });
};

/**
 * Compute file MD5 in a Web Worker-like approach using incremental hashing.
 * Falls back to a simple name+size+lastModified hash for very large files.
 */
async function computeFileHash(file: File): Promise<string> {
  if (file.size < 50 * 1024 * 1024) {
    const buffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
  }
  return `${file.name}-${file.size}-${file.lastModified}`;
}

async function handleHttpUpload(options: UploadRequestOptions) {
  const file = options.file;
  uploading.value = true;
  const key = fileKey(file);
  uploadProgress.value[key] = 0;

  try {
    if (props.chunkSize > 0 && file.size > props.chunkSize * 1024 * 1024) {
      await uploadChunked(file, options);
    } else {
      const formData = new FormData();
      formData.append("file", file);
      const api = props.uploadApi;
      if (api) {
        const response = await api(formData);
        options.onSuccess(response);
      } else {
        options.onSuccess({ fileName: file.name, size: file.size });
      }
    }
    uploadProgress.value[key] = 100;
  } catch (error) {
    options.onError(error as any);
  } finally {
    uploading.value = false;
  }
}

async function uploadChunked(file: File, options: UploadRequestOptions) {
  const fileHash = await computeFileHash(file);
  const chunkSizeBytes = props.chunkSize * 1024 * 1024;
  const totalChunks = Math.ceil(file.size / chunkSizeBytes);

  for (let i = 0; i < totalChunks; i++) {
    const start = i * chunkSizeBytes;
    const end = Math.min(start + chunkSizeBytes, file.size);
    const blob = file.slice(start, end);

    const base64 = await new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve((reader.result as string).split(",")[1]);
      reader.readAsDataURL(blob);
    });

    const chunk: UploadChunk = { fileHash, chunkIndex: i, totalChunks, chunkData: base64 };

    if (props.uploadApi) {
      await props.uploadApi(chunk);
    }

    uploadProgress.value[fileKey(file)] = Math.round(((i + 1) / totalChunks) * 100);
  }

  options.onSuccess({ fileHash, fileName: file.name, totalChunks });
}

function handleRemove(file: UploadUserFile) {
  _fileList.value = _fileList.value.filter((f) => f.uid !== file.uid);
  const key = fileKey(file.raw as File);
  delete uploadProgress.value[key];
  emit("update:fileList", _fileList.value);
}

const handleSuccess = (response: any, file: UploadUserFile) => {
  emit("upload-success", file, response);
};

const handleError = (error: any, file: UploadUserFile) => {
  emit("upload-error", file, error);
};

const remainingCount = computed(() => props.maxCount - _fileList.value.length);

const dropzoneHint = computed(() => {
  const accept = props.accept === "*" ? t("upload.acceptHintAll") : props.accept;
  return t("upload.acceptHint", { accept, maxSize: props.maxSize });
});
</script>

<template>
  <div class="file-upload">
    <el-upload
      v-model:file-list="_fileList"
      action="#"
      :multiple="maxCount > 1"
      :disabled="disabled || uploading"
      :limit="maxCount"
      :accept="accept"
      :http-request="handleHttpUpload"
      :before-upload="beforeUpload"
      :on-exceed="handleExceed"
      :on-success="handleSuccess"
      :on-error="handleError"
      :on-remove="handleRemove"
      drag
    >
      <div class="file-upload__dropzone">
        <el-icon :size="36"><UploadFilled /></el-icon>
        <p class="file-upload__text" v-html="t('upload.dragDropHint')" />
        <p class="file-upload__hint">
          {{ dropzoneHint }}
        </p>
      </div>
    </el-upload>

    <div v-if="uploading" class="file-upload__progress">
      <div
        v-for="(progress, uid) in uploadProgress"
        :key="uid"
        class="file-upload__progress-item"
      >
        <span class="file-upload__progress-name">
          {{ t("upload.uploadingFileLabel", { name: uid.slice(0, 8) + '...' }) }}
        </span>
        <el-progress :percentage="progress" :stroke-width="4" />
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.file-upload {
  &__dropzone {
    padding: 24px;
    text-align: center;
    color: var(--el-text-color-secondary);
  }

  &__text {
    margin: 8px 0 4px;
    font-size: 14px;

    :deep(em) {
      font-style: normal;
      color: var(--el-color-primary);
    }
  }

  &__hint {
    margin: 0;
    font-size: 12px;
    color: var(--el-text-color-placeholder);
  }

  &__progress {
    margin-top: 12px;
  }

  &__progress-item {
    margin-bottom: 8px;
  }

  &__progress-name {
    display: block;
    margin-bottom: 4px;
    font-size: 13px;
    color: var(--el-text-color-regular);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}
</style>
