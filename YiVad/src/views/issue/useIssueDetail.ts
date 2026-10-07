import { computed, onMounted, onUnmounted, reactive, ref, watch, type Ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { Edit, Delete, Upload, Close, Link } from "@element-plus/icons-vue";
import { ElMessage } from "element-plus";
import { confirm } from "@/hooks/useConfirmAction";
import type { FormInstance, FormRules } from "element-plus";
import { useIssueStore } from "@/stores/modules/issue";
import {
  ISSUE_STATUS_MAP,
  ISSUE_PRIORITY_MAP,
  ISSUE_TYPE_MAP,
  ISSUE_SOURCE_MAP,
  REVIEW_STATUS_MAP,
  ISSUE_STATUS_TAG_MAP,
  getIssueFilePath
} from "@/api/modules/issueService";
import type { IssueStatus, IssuePriority, IssueType, IssueSource, ReviewStatus, TagType } from "@/api/modules/issueService";
import { readKnowledgeFile, writeKnowledgeFile } from "@/api/modules/knowledgeService";
import { useMarkdown } from "@/hooks/useMarkdown";
import { getModuleList } from "@/api/modules/moduleService";
import { getProjectList } from "@/api/modules/projectService";
import type { Module } from "@/api/modules/moduleService";
import type { Project } from "@/api/modules/projectService";
import { getBugList } from "@/api/modules/bug";
import type { BugDocument } from "@/api/modules/bug";

export function useIssueDetail() {
  const route = useRoute();
  const router = useRouter();
  const { t } = useI18n();
  const store = useIssueStore();

  const loading = ref(true);
  const issue = computed(() => store.currentIssue);
  const editFormRef = ref<FormInstance>();

  watch(
    () => issue.value?.status,
    s => {
      quickStatus.value = s || "";
    }
  );

  // ── Keyboard shortcut ──
  function handleKeydown(e: KeyboardEvent) {
    if (editDialog.visible) {
      if (e.key === "Escape") {
        editDialog.visible = false;
        return;
      }
      return;
    }
    const tag = (e.target as HTMLElement)?.tagName;
    if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
    if (e.key === "e" || e.key === "E") {
      e.preventDefault();
      openEdit();
    }
  }

  // ── Sticky bar ──
  const showStickyBar = ref(false);
  function onScroll() {
    showStickyBar.value = window.scrollY > 300;
  }
  function scrollToTop() {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // ── Focus mode ──
  const focusMode = ref(false);

  // ── Image preview ──
  const preview = reactive({ visible: false, src: "", alt: "" });
  function previewImage(src: string) {
    preview.src = src;
    preview.alt = "";
    preview.visible = true;
  }
  function closePreview() {
    preview.visible = false;
  }

  // ── Linked items ──
  const linkedModules = ref<Module[]>([]);
  const linkedBugs = ref<BugDocument[]>([]);
  const projectName = ref("");
  const quickStatus = ref("");

  async function loadLinked() {
    if (!issue.value) return;
    try {
      const [moduleRes, projectRes, bugRes] = await Promise.all([
        getModuleList({ project_key: issue.value.project_key, pageSize: 200 }),
        getProjectList({ pageSize: 500 }),
        getBugList({ issue_key: issue.value.key, pageSize: 100 })
      ]);
      const modules = (moduleRes.data?.list as Module[]) ?? [];
      const projects = (projectRes.data?.list as Project[]) ?? [];
      linkedModules.value = modules.filter(m => m.issue_keys?.includes(issue.value!.key));
      linkedBugs.value = (bugRes.data?.list as BugDocument[]) ?? [];
      projectName.value = projects.find(p => p.key === issue.value!.project_key)?.name || issue.value!.project_key;
    } catch {
      /* ignore */
    }
  }

  // ── Form rules ──
  const rules: FormRules = {
    title: [{ required: true, message: t("issue.dialog.titleRequired"), trigger: "blur" }]
  };

  // ── Description ──
  const { render: renderMarkdown } = useMarkdown();
  const descContent = ref("");
  const descFilePath = computed(() => {
    const i = issue.value;
    if (!i) return "";
    return getIssueFilePath(i);
  });
  const descHtml = computed(() => renderMarkdown(descContent.value || ""));

  async function loadDescFile() {
    try {
      const res = await readKnowledgeFile(descFilePath.value);
      descContent.value = res.content || issue.value?.description || "";
    } catch {
      const defaultContent = issue.value?.description || `# ${issue.value?.title || ""}\n`;
      try {
        await writeKnowledgeFile(descFilePath.value, defaultContent);
      } catch {
        /* best effort */
      }
      descContent.value = defaultContent;
    }
  }

  // ── Time tracking ──
  const timePct = computed(() => {
    if (!issue.value?.time_estimate) return 0;
    return Math.round(((issue.value.time_spent || 0) / issue.value.time_estimate) * 100);
  });

  // ── Edit dialog ──
  const editDialog = reactive({
    visible: false,
    submitting: false,
    form: {
      title: "",
      description: "",
      status: "todo" as IssueStatus,
      priority: "medium" as IssuePriority,
      issue_type: "task" as IssueType,
      assignee: "",
      labels: [] as string[],
      start_date: "",
      due_date: "",
      source: "" as IssueSource | "",
      review_status: "" as ReviewStatus | "",
      estimate_points: undefined as number | undefined,
      time_estimate: undefined as number | undefined
    }
  });

  function openEdit() {
    if (!issue.value) return;
    editDialog.form = {
      title: issue.value.title,
      description: issue.value.description || "",
      status: issue.value.status,
      priority: issue.value.priority,
      issue_type: issue.value.issue_type,
      assignee: issue.value.assignee || "",
      labels: [...(issue.value.labels || [])],
      start_date: issue.value.start_date || "",
      due_date: issue.value.due_date || "",
      source: issue.value.source || "",
      review_status: issue.value.review_status || "",
      estimate_points: issue.value.estimate_points,
      time_estimate: issue.value.time_estimate
    };
    editDialog.visible = true;
  }

  function mapReqStatusReverse(s: string): string {
    const m: Record<string, string> = {
      done: "\u5df2\u5b8c\u6210",
      in_progress: "\u8fdb\u884c\u4e2d",
      cancelled: "\u5df2\u53d6\u6d88",
      in_review: "\u5f85\u8bc4\u5ba1",
      backlog: "\u5f85\u6392\u671f",
      todo: "\u5f85\u5f00\u59cb"
    };
    return m[s] || "\u5f85\u5f00\u59cb";
  }

  function mapReqPriorityReverse(p: string): string {
    const m: Record<string, string> = {
      urgent: "\u7d27\u6025",
      high: "\u9ad8",
      medium: "\u4e2d",
      low: "\u4f4e"
    };
    return m[p] || "\u4e2d";
  }

  async function submitEdit() {
    if (!issue.value) return;
    try {
      await editFormRef.value?.validate();
    } catch {
      return;
    }
    editDialog.submitting = true;
    try {
      await store.editIssue(issue.value.key, {
        title: editDialog.form.title,
        description: editDialog.form.description,
        status: editDialog.form.status,
        priority: editDialog.form.priority,
        issue_type: editDialog.form.issue_type,
        assignee: editDialog.form.assignee,
        labels: editDialog.form.labels,
        start_date: editDialog.form.start_date,
        due_date: editDialog.form.due_date,
        source: editDialog.form.source || undefined,
        review_status: editDialog.form.review_status || undefined,
        estimate_points: editDialog.form.estimate_points,
        time_estimate: editDialog.form.time_estimate
      } as any);
      ElMessage.success(t("issue.dialog.updateSuccess"));
      if (issue.value.kb_file_path) {
        try {
          const res = await readKnowledgeFile(issue.value.kb_file_path);
          const updatedMeta = { ...res.meta };
          if (editDialog.form.status) updatedMeta.status = mapReqStatusReverse(editDialog.form.status);
          if (editDialog.form.priority) updatedMeta.priority = mapReqPriorityReverse(editDialog.form.priority);
          if (editDialog.form.assignee !== undefined) updatedMeta.owner = editDialog.form.assignee;
          await writeKnowledgeFile(issue.value.kb_file_path, res.content, updatedMeta);
        } catch {
          /* best-effort */
        }
      }
      editDialog.visible = false;
    } catch (e) {
      ElMessage.error((e as Error).message || t("issue.error.updateFailed"));
    } finally {
      editDialog.submitting = false;
    }
  }

  // ── Actions ──
  async function changeStatus(newStatus: string) {
    if (!issue.value) return;
    await store.editIssue(issue.value.key, { status: newStatus as IssueStatus });
    ElMessage.success(t("issue.message.statusChanged", { status: ISSUE_STATUS_MAP[newStatus as IssueStatus] }));
  }

  async function handleDelete() {
    if (!issue.value) return;
    const ok = await confirm(
      t("issue.dialog.deleteConfirm", { title: issue.value.title }),
      t("issue.dialog.deleteTitle"),
      "error"
    );
    if (!ok) return;
    try {
      await store.removeIssue(issue.value.key, issue.value.project_key);
      ElMessage.success(t("issue.dialog.deleteSuccess"));
      router.push("/issue");
    } catch (e) {
      ElMessage.error(e instanceof Error ? e.message : t("issue.error.deleteFailed"));
    }
  }

  async function cloneIssue() {
    if (!issue.value) return;
    const newKey = `ISS-${Date.now().toString(36).toUpperCase()}`;
    await store.addIssue({
      key: newKey,
      project_key: issue.value.project_key,
      sequence_id: Date.now(),
      title: `[Clone] ${issue.value.title}`,
      description: issue.value.description,
      status: "todo",
      priority: issue.value.priority,
      issue_type: issue.value.issue_type,
      labels: [...(issue.value.labels || [])],
      assignee: issue.value.assignee,
      estimate_points: issue.value.estimate_points
    });
    ElMessage.success(t("issue.dialog.cloneSuccess"));
    router.push(`/issue/${newKey}`);
  }

  async function openMove() {
    if (!issue.value) return;
    ElMessageBox.prompt(t("issue.message.moveTarget"), t("issue.message.moveTitle"), {
      confirmButtonText: t("issue.message.move"),
      inputPlaceholder: t("issue.message.moveTarget")
    })
      .then(async ({ value }) => {
        if (!value) return;
        await store.editIssue(issue.value!.key, { project_key: value });
        ElMessage.success(t("issue.message.moveSuccess", { project: value }));
        router.push(`/project/${value}`);
      })
      .catch(() => {});
  }

  function goBack() {
    if (issue.value?.project_key) router.push(`/project/${issue.value.project_key}`);
    else router.push("/issue");
  }

  // ── Display helpers ──
  function statusLabel(s: IssueStatus) {
    return ISSUE_STATUS_MAP[s] || s;
  }
  function statusTagType(status: IssueStatus): TagType {
    return ISSUE_STATUS_TAG_MAP[status] || "info";
  }

  // ── Lifecycle ──
  onMounted(async () => {
    const key = route.params.key as string;
    if (key) await store.fetchIssue(key);
    loading.value = false;
    await Promise.all([loadLinked(), loadDescFile()]);
    window.addEventListener("scroll", onScroll, { passive: true });
  });

  onUnmounted(() => {
    window.removeEventListener("scroll", onScroll);
  });

  return {
    // state
    loading,
    issue,
    quickStatus,
    focusMode,
    showStickyBar,
    preview,
    descContent,
    descFilePath,
    descHtml,
    descDialogRef: ref<any>(null),
    editFormRef,
    // edit dialog
    editDialog,
    openEdit,
    submitEdit,
    // actions
    changeStatus,
    handleDelete,
    cloneIssue,
    openMove,
    goBack,
    // helpers
    handleKeydown,
    onScroll,
    scrollToTop,
    previewImage,
    closePreview,
    statusLabel,
    statusTagType,
    // linked data
    linkedModules,
    linkedBugs,
    projectName,
    timePct,
    // form rules
    rules,
    // constants
    ISSUE_STATUS_MAP,
    ISSUE_PRIORITY_MAP,
    ISSUE_TYPE_MAP,
    ISSUE_SOURCE_MAP,
    REVIEW_STATUS_MAP,
    // icons
    Edit,
    Delete,
    Upload,
    Close,
    Link
  };
}

export type IssueDetailContext = ReturnType<typeof useIssueDetail>;