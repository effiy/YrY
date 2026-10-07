/**
 * useInput — Input and draft image management for the AI chat store.
 */
import type { Ref } from "vue";
import { ElMessage } from "element-plus";
import { readFileAsDataUrl } from "@/utils/chatNormalizers";

const MAX_DRAFT_IMAGES = 4;

export interface InputDeps {
  input: Ref<string>;
  draftImages: Ref<string[]>;
}

export function useInput(deps: InputDeps) {
  const { input, draftImages } = deps;

  function clearInput() {
    input.value = "";
    draftImages.value = [];
  }

  async function addDraftImageFiles(files: File[]) {
    const remaining = MAX_DRAFT_IMAGES - draftImages.value.length;
    if (remaining <= 0) {
      ElMessage.warning(`Up to ${MAX_DRAFT_IMAGES} images supported`);
      return;
    }
    const picked = files.slice(0, remaining);
    if (picked.length < files.length) {
      ElMessage.warning(`Up to ${MAX_DRAFT_IMAGES} images supported`);
    }
    try {
      const urls = await Promise.all(picked.map(readFileAsDataUrl));
      draftImages.value = [...draftImages.value, ...urls.filter(u => u.startsWith("data:image/"))];
    } catch {
      ElMessage.error("Failed to read image");
    }
  }

  function removeDraftImage(idx: number) {
    const list = [...draftImages.value];
    if (idx < 0 || idx >= list.length) return;
    list.splice(idx, 1);
    draftImages.value = list;
  }

  function clearDraftImages() {
    draftImages.value = [];
  }

  return { clearInput, addDraftImageFiles, removeDraftImage, clearDraftImages };
}