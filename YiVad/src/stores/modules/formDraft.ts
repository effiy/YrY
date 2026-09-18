import { defineStore } from "pinia";
import { ref } from "vue";

export interface FormDraft {
  id: string;
  formId: string;
  formName: string;
  data: Record<string, any>;
  currentStep?: number;
  totalFields: number;
  metadata: {
    createdAt: number;
    updatedAt: number;
    expiresAt: number;
    fieldCount: number;
  };
  version: number;
}

const DRAFT_PREFIX = "yivad-form-draft-";
const DEFAULT_EXPIRY_DAYS = 30;

function generateId(): string {
  return `draft-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export const useFormDraftStore = defineStore("formDraft", () => {
  const drafts = ref<FormDraft[]>(loadAllDrafts());

  function loadAllDrafts(): FormDraft[] {
    try {
      const keys = Object.keys(localStorage).filter(k => k.startsWith(DRAFT_PREFIX));
      return keys.map(k => JSON.parse(localStorage.getItem(k)!)).filter(Boolean);
    } catch {
      return [];
    }
  }

  function createDraft(
    formId: string,
    formName: string,
    data: Record<string, any>,
    totalFields: number,
    currentStep?: number
  ): FormDraft {
    const now = Date.now();
    const filledFields = Object.values(data).filter(v => v !== null && v !== undefined && v !== "").length;
    return {
      id: generateId(),
      formId,
      formName,
      data: { ...data },
      currentStep,
      totalFields,
      metadata: {
        createdAt: now,
        updatedAt: now,
        expiresAt: now + DEFAULT_EXPIRY_DAYS * 24 * 60 * 60 * 1000,
        fieldCount: filledFields
      },
      version: 1
    };
  }

  async function saveDraft(draft: FormDraft): Promise<void> {
    draft.metadata.updatedAt = Date.now();
    const filledFields = Object.values(draft.data).filter(v => v !== null && v !== undefined && v !== "").length;
    draft.metadata.fieldCount = filledFields;
    localStorage.setItem(`${DRAFT_PREFIX}${draft.id}`, JSON.stringify(draft));

    const idx = drafts.value.findIndex(d => d.id === draft.id);
    if (idx >= 0) drafts.value[idx] = draft;
    else drafts.value.push(draft);
  }

  function getDraftsByForm(formId: string): FormDraft[] {
    return drafts.value
      .filter(d => d.formId === formId && d.metadata.expiresAt > Date.now())
      .sort((a, b) => b.metadata.updatedAt - a.metadata.updatedAt);
  }

  function getDraft(id: string): FormDraft | undefined {
    return drafts.value.find(d => d.id === id);
  }

  async function deleteDraft(id: string): Promise<void> {
    localStorage.removeItem(`${DRAFT_PREFIX}${id}`);
    drafts.value = drafts.value.filter(d => d.id !== id);
  }

  function cleanExpiredDrafts(): number {
    const now = Date.now();
    const expired = drafts.value.filter(d => d.metadata.expiresAt <= now);
    expired.forEach(d => localStorage.removeItem(`${DRAFT_PREFIX}${d.id}`));
    drafts.value = drafts.value.filter(d => d.metadata.expiresAt > now);
    return expired.length;
  }

  return { drafts, createDraft, saveDraft, getDraftsByForm, getDraft, deleteDraft, cleanExpiredDrafts };
});
