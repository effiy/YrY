import { ref, reactive, computed, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { ElMessage, type FormInstance, type FormRules } from "element-plus";
import {
  getTopicEntry,
  createTopicEntry,
  updateTopicEntry,
  deleteTopicEntry,
  type TopicEntryDocument,
  type TopicTree
} from "@/api/modules/topic";

export interface UseTopicDetailOptions {
  tree: TopicTree;
  topic: string;
  label: string;
  templateContent?: string;
}

function pascal(s: string): string {
  return s
    .split(/[-_]/)
    .map(p => p.charAt(0).toUpperCase() + p.slice(1))
    .join("");
}

export function useTopicDetail(options: UseTopicDetailOptions) {
  const { tree, topic, templateContent } = options;
  const route = useRoute();
  const router = useRouter();
  const formRef = ref<FormInstance>();
  const loading = ref(false);
  const entry = ref<TopicEntryDocument | null>(null);

  const isNew = computed(() => route.params.id === "new" || !route.params.id);

  const form = reactive({
    title: "",
    content: templateContent ?? "",
    tags: [] as string[]
  });

  const tagOptions = computed(() =>
    Array.from(new Set([...(entry.value?.tags ?? []), ...form.tags]))
  );

  const rules: FormRules = {
    title: [{ required: true, message: "Title is required", trigger: "blur" }],
    content: [{ required: true, message: "Content is required", trigger: "blur" }]
  };

  async function loadEntry() {
    if (isNew.value) return;
    loading.value = true;
    try {
      const doc = await getTopicEntry<TopicEntryDocument>(tree, topic, String(route.params.id));
      if (!doc) {
        ElMessage.error("Entry not found");
        back();
        return;
      }
      entry.value = doc;
      form.title = doc.title;
      form.content = doc.content;
      form.tags = [...(doc.tags ?? [])];
    } catch (e: any) {
      ElMessage.error(e?.message || "Failed to load entry");
    } finally {
      loading.value = false;
    }
  }

  async function handleSave() {
    if (!formRef.value) return;
    const valid = await formRef.value.validate().catch(() => false);
    if (!valid) return;
    try {
      if (isNew.value) {
        await createTopicEntry(tree, topic, {
          title: form.title,
          content: form.content,
          tags: form.tags
        });
        ElMessage.success("Entry created");
      } else {
        await updateTopicEntry(tree, topic, entry.value!.key, {
          title: form.title,
          content: form.content,
          tags: form.tags
        });
        ElMessage.success("Entry updated");
      }
      back();
    } catch (e: any) {
      ElMessage.error(e?.message || "Save failed");
    }
  }

  async function handleDelete() {
    if (!entry.value) return;
    try {
      await deleteTopicEntry(tree, topic, entry.value.key);
      ElMessage.success("Entry deleted");
      back();
    } catch (e: any) {
      ElMessage.error(e?.message || "Delete failed");
    }
  }

  function back() {
    const routePrefix = tree === "tech-leadership" ? "tlr" : "cr";
    router.push({ name: `${routePrefix}${pascal(topic)}List` });
  }

  onMounted(loadEntry);

  return {
    formRef,
    loading,
    entry,
    isNew,
    form,
    tagOptions,
    rules,
    label: options.label,
    route,
    handleSave,
    handleDelete,
    back
  };
}
