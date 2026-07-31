<template>
  <div :class="['editor-box', self_disabled ? 'editor-disabled' : '']">
    <Toolbar v-if="!hideToolBar" class="editor-toolbar" :editor="editorRef" :default-config="toolbarConfig" :mode="mode" />
    <Editor
      v-model="valueHtml"
      class="editor-content"
      :style="{ height }"
      :mode="mode"
      :default-config="editorConfig"
      @on-created="handleCreated"
      @on-blur="handleBlur"
    />
  </div>
</template>

<script setup lang="ts" name="WangEditor">
import { nextTick, computed, inject, shallowRef, onBeforeUnmount } from "vue";
import { IToolbarConfig, IEditorConfig } from "@wangeditor/editor";
import { Editor, Toolbar } from "@wangeditor/editor-for-vue";
import { uploadImg, uploadVideo } from "@/api/modules/upload";
import "@wangeditor/editor/dist/css/style.css";
import { formContextKey, formItemContextKey } from "element-plus";

// Rich text DOM element
const editorRef = shallowRef();

// Initialize editor
const handleCreated = (editor: any) => {
  editorRef.value = editor;
};

// Accept parent component params and set defaults
interface RichEditorProps {
  value: string; // Rich text value ==> required
  toolbarConfig?: Partial<IToolbarConfig>; // Toolbar config ==> optional (default empty)
  editorConfig?: Partial<IEditorConfig>; // Editor config ==> optional (default empty)
  height?: string; // Rich text height ==> optional (default 500px)
  mode?: "default" | "simple"; // Rich text mode ==> optional (default "default")
  hideToolBar?: boolean; // Whether to hide toolbar ==> optional (default false)
  disabled?: boolean; // Whether to disable editor ==> optional (default false)
}
const props = withDefaults(defineProps<RichEditorProps>(), {
  toolbarConfig: () => {
    return {
      excludeKeys: []
    };
  },
  editorConfig: () => {
    return {
      placeholder: "Please enter content...",
      MENU_CONF: {}
    };
  },
  height: "500px",
  mode: "default",
  hideToolBar: false,
  disabled: false
});

// Get el-form component context
const formContext = inject(formContextKey, void 0);
// Get el-form-item component context
const formItemContext = inject(formItemContextKey, void 0);
// Determine if upload and delete are disabled
const self_disabled = computed(() => {
  return props.disabled || formContext?.disabled;
});

// Determine if current rich text editor is disabled
if (self_disabled.value) nextTick(() => editorRef.value.disable());

// Watch rich text content, trigger parent component update for two-way binding
const emit = defineEmits<{
  "update:value": [value: string];
  "check-validate": [];
}>();
const valueHtml = computed({
  get() {
    return props.value;
  },
  set(val: string) {
    // Prevent validation failure when rich text content is empty
    if (editorRef.value.isEmpty()) val = "";
    emit("update:value", val);
  }
});

/**
 * @description Custom image upload
 * @param file Uploaded file
 * @param insertFn Callback after upload success (insert into rich text editor)
 * */
type InsertFnTypeImg = (url: string, alt?: string, href?: string) => void;
props.editorConfig.MENU_CONF!["uploadImage"] = {
  async customUpload(file: File, insertFn: InsertFnTypeImg) {
    if (!uploadImgValidate(file)) return;
    let formData = new FormData();
    formData.append("file", file);
    try {
      const { data } = await uploadImg(formData);
      insertFn(data.fileUrl);
    } catch (error) {
      console.log(error);
    }
  }
};

// Validate before image upload
const uploadImgValidate = (file: File): boolean => {
  console.log(file);
  return true;
};

/**
 * @description Custom video upload
 * @param file Uploaded file
 * @param insertFn Callback after upload success (insert into rich text editor)
 * */
type InsertFnTypeVideo = (url: string, poster?: string) => void;
props.editorConfig.MENU_CONF!["uploadVideo"] = {
  async customUpload(file: File, insertFn: InsertFnTypeVideo) {
    if (!uploadVideoValidate(file)) return;
    let formData = new FormData();
    formData.append("file", file);
    try {
      const { data } = await uploadVideo(formData);
      insertFn(data.fileUrl);
    } catch (error) {
      console.log(error);
    }
  }
};

// Validate before video upload
const uploadVideoValidate = (file: File): boolean => {
  console.log(file);
  return true;
};

// Trigger on editor blur
const handleBlur = () => {
  formItemContext?.prop && formContext?.validateField([formItemContext.prop as string]);
};

// Also destroy editor when component is destroyed
onBeforeUnmount(() => {
  if (!editorRef.value) return;
  editorRef.value.destroy();
});

defineExpose({
  editor: editorRef
});
</script>

<style scoped lang="scss">
@use "./index.scss" as *;
</style>
