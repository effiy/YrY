<script setup lang="ts">
import { ref } from "vue";
import { ElDialog, ElImageViewer } from "element-plus";

const props = defineProps<{
  visible: boolean;
  url: string;
  fileName: string;
  fileType?: string;
}>();

const emit = defineEmits<{
  (e: "update:visible", value: boolean): void;
  (e: "close"): void;
}>();

const imgViewerVisible = ref(false);

function isImage(type?: string): boolean {
  return type ? /^image\//.test(type) : /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(props.url);
}

function isPDF(type?: string): boolean {
  return type ? type === "application/pdf" : /\.pdf$/i.test(props.url);
}

function isText(type?: string): boolean {
  return type
    ? /^text\//.test(type)
    : /\.(txt|md|log|json|xml|yml|yaml|csv)$/i.test(props.url);
}
</script>

<template>
  <el-dialog
    :model-value="visible"
    :title="fileName || '文件预览'"
    width="720px"
    destroy-on-close
    @close="emit('update:visible', false); emit('close')"
  >
    <div class="file-preview">
      <!-- Image preview -->
      <div v-if="isImage(fileType)" class="file-preview__image">
        <img :src="url" :alt="fileName" @click="imgViewerVisible = true" />
      </div>

      <!-- PDF preview -->
      <iframe
        v-else-if="isPDF(fileType)"
        :src="url"
        class="file-preview__pdf"
        frameborder="0"
      />

      <!-- Text preview -->
      <pre v-else-if="isText(fileType)" class="file-preview__text"><code>{{ url }}</code></pre>

      <!-- Generic file -->
      <div v-else class="file-preview__generic">
        <el-icon :size="48"><Document /></el-icon>
        <p>{{ fileName }}</p>
        <el-button type="primary" tag="a" :href="url" download>
          下载文件
        </el-button>
      </div>
    </div>

    <el-image-viewer
      v-if="imgViewerVisible"
      :url-list="[url]"
      @close="imgViewerVisible = false"
    />
  </el-dialog>
</template>

<style scoped lang="scss">
.file-preview {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 300px;

  &__image img {
    max-width: 100%;
    max-height: 60vh;
    cursor: zoom-in;
    border-radius: 4px;
  }

  &__pdf {
    width: 100%;
    height: 60vh;
  }

  &__text {
    width: 100%;
    max-height: 60vh;
    padding: 16px;
    background: var(--el-fill-color-light);
    border-radius: 4px;
    overflow: auto;
    font-size: 13px;
    line-height: 1.6;
    white-space: pre-wrap;
    word-break: break-all;
  }

  &__generic {
    text-align: center;
    color: var(--el-text-color-secondary);

    p {
      margin: 12px 0 16px;
    }
  }
}
</style>